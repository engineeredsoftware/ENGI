/**
 * Retained external automation ingress for V26 fifth-gate reform.
 * This route can trigger admitted pipeline automation from GitHub events, but
 * it is not the canonical Bitcode Exchange state owner.
 */
import 'server-only';

import { exec } from 'child_process';

import { track } from '@vercel/analytics/server';

import { createJsonResponse } from '@bitcode/api/responses';
import { log } from '@bitcode/logger';
import { supabaseAdmin } from '@bitcode/supabase';

import { verifyGitHubSignature } from './verify';

const LABEL_TRIGGERS = {
  'bitcode-deliver-issue': { scope: 'issue', trigger: 'bitcode-deliver-issue' },
  'bitcode-deliver-pr': { scope: 'pr', trigger: 'bitcode-deliver-pr' },
  'bitcode-pr': { scope: 'issue', trigger: 'bitcode-pr' },
} as const;

const COMMENT_TRIGGERS = [
  { regex: /@bitcode-pr\b/i, trigger: 'issue_comment:pr' },
  { regex: /@bitcode-review\b/i, trigger: 'issue_comment:review' },
  { regex: /@bitcode-commit\b/i, trigger: 'issue_comment:commit' },
] as const;

const WEBHOOK_ASSET_PACK_PIPELINE_TRACK_EVENT = 'Trigger Asset-Pack Pipeline';

type ParsedPayload = {
  action?: string;
  issue?: { number?: number; pull_request?: unknown | null };
  installation?: { id?: number | string };
  label?: { name?: string };
  comment?: { id?: number | string; body?: string };
};

async function parsePayload(request: Request | { json?: () => Promise<unknown>; text?: () => Promise<string>; headers?: { get?: (name: string) => string | null } }) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const signatureHeader = request.headers?.get?.('x-hub-signature-256');

  if (secret && typeof request.text === 'function') {
    const rawPayload = await request.text();
    const verified = verifyGitHubSignature({ secret, payload: rawPayload, signatureHeader });

    if (!verified) {
      return {
        error: createJsonResponse({ success: false, code: 401, error: 'Invalid signature' }, 401)
      };
    }

    try {
      return { payload: JSON.parse(rawPayload) as ParsedPayload };
    } catch (error) {
      await log('[route /webhook POST] JSON parse error (test)', 'error', {
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        error: createJsonResponse({ success: false, code: 400, error: 'Invalid JSON' })
      };
    }
  }

  try {
    return { payload: await request.json?.() as ParsedPayload };
  } catch (error) {
    await log('[route /webhook POST] JSON parse error (test)', 'error', {
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      error: createJsonResponse({ success: false, code: 400, error: 'Invalid JSON' })
    };
  }
}

async function resolveUserId(installationId: number | string | undefined) {
  const { data } = await supabaseAdmin
    .from('user_connections')
    .select('user_id')
    .eq('provider_account_id', String(installationId ?? ''))
    .maybeSingle();

  return data?.user_id ?? null;
}

async function interactionAlreadyProcessed(eventType: string, trigger: string, interactionId: string) {
  const { data } = await supabaseAdmin
    .from('github_interactions')
    .select('id')
    .eq('interaction_id', interactionId)
    .maybeSingle();

  return Boolean(data?.id);
}

async function recordInteraction(eventType: string, trigger: string, interactionId: string, userId: string) {
  const builder = supabaseAdmin.from('github_interactions') as { insert?: (payload: unknown) => Promise<unknown> };
  if (typeof builder.insert !== 'function') {
    return;
  }

  await builder.insert({
    event_type: eventType,
    trigger,
    interaction_id: interactionId,
    user_id: userId,
  });
}

function findCommentTrigger(body: string | undefined) {
  if (!body) return null;

  for (const trigger of COMMENT_TRIGGERS) {
    if (trigger.regex.test(body)) {
      return trigger.trigger;
    }
  }

  return null;
}

function getEventType(request: Request | { headers?: { get?: (name: string) => string | null } }) {
  return request.headers?.get?.('x-github-event') ?? request.headers?.get?.('event') ?? null;
}

async function triggerPipeline(trigger: string, userId: string, issueNumber: number, isPR: boolean) {
  await log('[route /webhook POST] Invoking asset-pack pipeline', 'info', {
    label: trigger,
    isPR,
    issueNumber,
    pipelineMeaning: 'asset_pack_pipeline',
    triggerCommand: 'bitcode-asset-pack-trigger'
  });

  return await new Promise<void>((resolve) => {
    exec(`bitcode-asset-pack-trigger ${trigger} ${issueNumber}`, async (error) => {
      if (error) {
        await log('[route /webhook POST] Asset-pack pipeline trigger failed', 'error', {
          label: trigger,
          userId,
          issueNumber,
          pipelineMeaning: 'asset_pack_pipeline'
        });
        resolve();
        return;
      }

      await track(WEBHOOK_ASSET_PACK_PIPELINE_TRACK_EVENT, {
        labelName: trigger,
        userId,
        issueNumber,
        ingressBasis: 'github_webhook',
        outputMeaning: 'asset_packs',
        exchangeStateRole: 'ingress_only_automation_boundary'
      });
      resolve();
    });
  });
}

export async function POST(request: Request) {
  const parsed = await parsePayload(request);
  if (parsed.error) {
    return parsed.error;
  }

  const payload = parsed.payload ?? {};
  const action = payload.action ?? '';
  const issueNumber = payload.issue?.number ?? 0;
  const isPR = Boolean(payload.issue?.pull_request);
  const installationId = payload.installation?.id;
  const eventType = getEventType(request);

  let trigger: string | null = null;
  let interactionId = String(issueNumber);

  if (eventType === 'issue_comment') {
    if (action !== 'created') {
      return createJsonResponse({ success: true });
    }

    trigger = findCommentTrigger(payload.comment?.body);
    interactionId = String(payload.comment?.id ?? issueNumber);

    if (!trigger) {
      await log('[route /webhook POST] Ignoring unsupported comment trigger', 'info', {
        body: payload.comment?.body ?? ''
      });
      return createJsonResponse({ success: true });
    }
  } else {
    if (action !== 'labeled') {
      await log('[route /webhook POST] Ignoring non-labeled event', 'info', { action });
      return createJsonResponse({ success: true });
    }

    const labelName = payload.label?.name ?? '';
    const triggerMeta = LABEL_TRIGGERS[labelName as keyof typeof LABEL_TRIGGERS];

    if (!triggerMeta) {
      await log('[route /webhook POST] Ignoring unsupported label', 'info', { labelName });
      return createJsonResponse({ success: true });
    }

    if (isPR && triggerMeta.scope === 'issue') {
      await log('[route /webhook POST] Label not applicable for PR', 'info', { labelName });
      return createJsonResponse({ success: true });
    }

    if (!isPR && triggerMeta.scope === 'pr') {
      await log('[route /webhook POST] Label not applicable for issue', 'info', { labelName });
      return createJsonResponse({ success: true });
    }

    trigger = triggerMeta.trigger;
  }

  const userId = await resolveUserId(installationId);
  if (!userId) {
    await log('[route /webhook POST] No user connection found', 'warn', { installationId });
    return createJsonResponse({ success: false, code: 500 });
  }

  const alreadyProcessed = await interactionAlreadyProcessed(eventType ?? 'labeled', trigger, interactionId);
  if (alreadyProcessed) {
    await log('[route /webhook POST] Interaction already processed, skipping', 'info', {
      eventType: eventType ?? 'labeled',
      trigger
    });
    return createJsonResponse({ success: true, message: 'Already processed' });
  }

  await recordInteraction(eventType ?? 'labeled', trigger, interactionId, userId);
  await triggerPipeline(trigger, userId, issueNumber, isPR);

  return createJsonResponse({ success: true });
}
