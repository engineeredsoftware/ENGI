import { traceRoute } from '@bitcode/observability';
import { hydrateBitcodeProfile } from '@bitcode/orm';
import { createJsonResponse } from '@bitcode/api/responses';
import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

import {
  buildAnonymousAuxillaryData,
  buildAuxillaryDataPayload,
  buildAuxillaryDataPayloadFromUnknown,
  buildAuxillaryOnboardingPayload,
  type AuxillaryBtdAssetPackSummary,
  type AuxillaryOnboardingUpdatePayload,
  normalizeCompletedAuxillaryPane,
  parseStoredAuxillarySteps,
  serializeAuxillarySteps,
} from './auxillaries-contract';

const EMPTY_TEMPLATE_PREFERENCES = {
  shippable_templates: {},
  delivery_templates: {},
  evidence_document_templates: {},
  auto_save_templates: false,
};

type AuxillaryRouteBuilderOptions = {
  isMockMode?: () => boolean;
  mockOnboardingData?: () => unknown;
  mockAuxillaryData?: () => unknown;
  mockModelPreferences?: () => unknown;
  useTemplateMock?: () => boolean;
  mockTemplatePreferences?: () => unknown;
  resolveRepositoryInventory?: (input: {
    supabase: Awaited<ReturnType<typeof createClient>>;
    userId: string;
  }) => Promise<{
    repositoryConnectionStatus?: unknown | null;
    repositories?: unknown[];
    repositoryInventorySource?: string | null;
  }>;
  resolveWalletConnectionStatus?: (input: {
    supabase: Awaited<ReturnType<typeof createClient>>;
    userId: string;
    profile: unknown | null;
  }) => Promise<unknown | null>;
};

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return null;
  }

  return user;
}

async function getProfileRole(userId: string) {
  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return { role: null, error };
  }

  return {
    role: profile?.role || null,
    error: null,
  };
}

function readNumericProfileField(profile: unknown, ...keys: string[]) {
  if (!profile || typeof profile !== 'object') return null;
  const record = profile as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function readStringProfileField(profile: unknown, ...keys: string[]) {
  if (!profile || typeof profile !== 'object') return null;
  const record = profile as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readNumberField(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return undefined;
}

function readStringField(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return null;
}

async function listRecentBtdAssetPacksForProfile(
  profile: unknown,
  limit = 5,
): Promise<AuxillaryBtdAssetPackSummary[]> {
  const walletId = readStringProfileField(
    profile,
    'wallet_address',
    'walletAddress',
    'wallet_id',
    'walletId',
  );
  if (!walletId) return [];

  const { data, error } = await (supabaseAdmin as any)
    .from('btd_ownership_events')
    .select('*')
    .eq('to_wallet_id', walletId)
    .order('issued_at', { ascending: false })
    .limit(limit);

  if (error || !Array.isArray(data)) return [];

  return data
    .map((row: Record<string, unknown>): AuxillaryBtdAssetPackSummary | null => {
      const assetPackId = readStringField(row, 'asset_pack_id', 'assetPackId');
      if (!assetPackId) return null;

      const summary: AuxillaryBtdAssetPackSummary = { assetPackId };
      const label = readStringField(row, 'label', 'title', 'summary');
      const rangeStart = readNumberField(row, 'range_start', 'rangeStart');
      const rangeEndExclusive = readNumberField(row, 'range_end_exclusive', 'rangeEndExclusive');
      const acquiredAt = readStringField(row, 'issued_at', 'acquiredAt');
      const readRightState = readStringField(
        row,
        'read_right_state',
        'readRightState',
        'settlement_state',
        'settlementState',
      );
      const accessPolicyHash = readStringField(row, 'access_policy_hash', 'accessPolicyHash');
      const sourceSafePreviewRoot = readStringField(
        row,
        'source_safe_preview_root',
        'preview_root',
        'sourceSafePreviewRoot',
      );

      if (label) summary.label = label;
      if (typeof rangeStart === 'number') summary.rangeStart = rangeStart;
      if (typeof rangeEndExclusive === 'number') summary.rangeEndExclusive = rangeEndExclusive;
      if (acquiredAt) summary.acquiredAt = acquiredAt;
      if (
        readRightState === 'owner_read' ||
        readRightState === 'licensed_read' ||
        readRightState === 'pending_settlement' ||
        readRightState === 'denied' ||
        readRightState === 'unknown'
      ) {
        summary.readRightState = readRightState;
      }
      if (accessPolicyHash) summary.accessPolicyHash = accessPolicyHash;
      if (sourceSafePreviewRoot) summary.sourceSafePreviewRoot = sourceSafePreviewRoot;

      return summary;
    })
    .filter((entry): entry is AuxillaryBtdAssetPackSummary => Boolean(entry));
}

export function buildGetAuxillaryOnboardingRoute(options: AuxillaryRouteBuilderOptions = {}) {
  return traceRoute('/auxillaries/onboarding', async () => {
    if (options.isMockMode?.()) {
      return createJsonResponse(options.mockOnboardingData?.() || buildAuxillaryOnboardingPayload([]));
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return createJsonResponse(buildAuxillaryOnboardingPayload([]), 401);
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('onboarded_steps')
      .eq('id', user.id)
      .maybeSingle();

    return createJsonResponse(
      buildAuxillaryOnboardingPayload(parseStoredAuxillarySteps(profile?.onboarded_steps)),
    );
  });
}

export function buildPostAuxillaryOnboardingRoute(options: AuxillaryRouteBuilderOptions = {}) {
  return traceRoute('/auxillaries/onboarding', async (request: Request) => {
    if (options.isMockMode?.()) {
      return createJsonResponse(options.mockOnboardingData?.() || buildAuxillaryOnboardingPayload([]));
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: AuxillaryOnboardingUpdatePayload = {};
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const completedStep = normalizeCompletedAuxillaryPane(body.completedPane);

    if (!completedStep) {
      return createJsonResponse(
        {
          error:
            'completedPane must be one of profile, connects, interfaces, or btd',
        },
        400,
      );
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('onboarded_steps')
      .eq('id', user.id)
      .maybeSingle();

    const completedSteps = parseStoredAuxillarySteps(profile?.onboarded_steps);
    const nextCompletedSteps =
      completedStep && !completedSteps.includes(completedStep)
        ? [...completedSteps, completedStep]
        : completedSteps;

    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        onboarded_steps: serializeAuxillarySteps(nextCompletedSteps),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return createJsonResponse({ error: updateError.message }, 500);
    }

    return createJsonResponse(buildAuxillaryOnboardingPayload(nextCompletedSteps));
  });
}

export function buildGetAuxillaryDataRoute(options: AuxillaryRouteBuilderOptions = {}) {
  return traceRoute('/auxillaries/data', async (_request: Request) => {
    if (options.isMockMode?.()) {
      return createJsonResponse(
        options.mockAuxillaryData
          ? buildAuxillaryDataPayloadFromUnknown(options.mockAuxillaryData())
          : buildAnonymousAuxillaryData(),
      );
    }

    let supabase: Awaited<ReturnType<typeof createClient>>;
    let user: { id: string } | null = null;

    try {
      supabase = await createClient();
      const authResult = await supabase.auth.getUser();
      user = authResult.data.user as { id: string } | null;

      if (!user || authResult.error) {
        return createJsonResponse(buildAnonymousAuxillaryData());
      }
    } catch {
      // Static generation and unauthenticated prefetches can lack request-bound
      // cookies. Auxillary data must fail open to anonymous data instead of
      // turning public page builds into noisy 500s.
      return createJsonResponse(buildAnonymousAuxillaryData());
    }

    const repositoryInventoryPromise = options.resolveRepositoryInventory
      ? options
          .resolveRepositoryInventory({
            supabase,
            userId: user.id,
          })
          .catch(() => ({
            repositoryConnectionStatus: null,
            repositories: [],
            repositoryInventorySource: null,
          }))
      : Promise.resolve({
          repositoryConnectionStatus: null,
          repositories: [],
          repositoryInventorySource: null,
        });

    const [
      profileResult,
      githubConnectionResult,
      balanceResult,
      preferencesResult,
      templatePreferencesResult,
      notificationsResult,
      repositoryInventoryResult,
    ] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase
        .from('user_connections')
        .select('connection_data')
        .eq('user_id', user.id)
        .eq('provider', 'github')
        .maybeSingle(),
      supabase.from('user_credits').select('balance').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_model_preferences').select('preferences').eq('user_id', user.id).single(),
      supabase
        .from('user_template_preferences')
        .select('deliverable_templates, ai_document_templates, auto_save_templates')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('notifications')
        .select('id, type, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25),
      repositoryInventoryPromise,
    ]);

    const profile = hydrateBitcodeProfile(profileResult.data ?? null);
    const githubConnection = githubConnectionResult.data?.connection_data ?? null;
    const btdBalance = typeof balanceResult.data?.balance === 'number' ? balanceResult.data.balance : 0;
    const btcFeeBalance = readNumericProfileField(profile, 'btcFeeBalance', 'btc_fee_balance', 'btc_balance');
    const modelPreferences = preferencesResult.data?.preferences ?? null;
    const templatePreferences = templatePreferencesResult.data
      ? {
          shippable_templates: templatePreferencesResult.data.deliverable_templates || {},
          delivery_templates: templatePreferencesResult.data.deliverable_templates || {},
          evidence_document_templates: templatePreferencesResult.data.ai_document_templates || {},
          auto_save_templates: Boolean(templatePreferencesResult.data.auto_save_templates),
        }
      : EMPTY_TEMPLATE_PREFERENCES;
    const notificationRows = Array.isArray(notificationsResult.data) ? notificationsResult.data : [];
    const recentBtdAssetPacks = await listRecentBtdAssetPacksForProfile(profile).catch(() => []);
    const walletConnectionStatus = options.resolveWalletConnectionStatus
      ? await options
          .resolveWalletConnectionStatus({
            supabase,
            userId: user.id,
            profile,
          })
          .catch(() => null)
      : null;

    return createJsonResponse(
      buildAuxillaryDataPayload({
        profile,
        githubConnection,
        walletConnectionStatus,
        repositoryConnectionStatus: repositoryInventoryResult.repositoryConnectionStatus,
        repositories: repositoryInventoryResult.repositories,
        repositoryInventorySource: repositoryInventoryResult.repositoryInventorySource,
        btdBalance,
        btcFeeBalance,
        recentBtdAssetPacks,
        modelPreferences,
        templatePreferences,
        notificationRows,
        onboardedSteps: (profile as { onboarded_steps?: unknown } | null)?.onboarded_steps,
      }),
    );
  });
}

export function buildPostAuxillaryBtdRoute(options: AuxillaryRouteBuilderOptions = {}) {
  return traceRoute('/auxillaries/btd', async (_request: Request) => {
    if (options.isMockMode?.()) {
      return createJsonResponse({
        error:
          'Generic BTD balance mutation is closed. $BTD is a non-fungible asset-pack share/read-right; acquisition must flow through Read minting or Exchange purchase.',
      }, 410);
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { role, error: roleError } = await getProfileRole(user.id);
    if (roleError) {
      return createJsonResponse({ error: roleError.message }, 500);
    }

    if (role !== 'lead' && role !== 'admin') {
      return createJsonResponse({ error: 'Forbidden' }, 403);
    }

    return createJsonResponse({
      error:
        'Generic BTD balance mutation is closed. $BTD is a non-fungible asset-pack share/read-right; acquisition must flow through Read minting or Exchange purchase.',
      acquisitionPaths: {
        terminalReadMinting: '/reads?intent=submit-read-for-btd',
        exchangePurchase: '/exchange?intent=buy-existing-btd',
      },
    }, 410);
  });
}

export function buildGetAuxillaryModelPreferencesRoute(options: AuxillaryRouteBuilderOptions = {}) {
  return traceRoute('/auxillaries/model-preferences', async () => {
    if (options.isMockMode?.()) {
      return createJsonResponse({
        success: true,
        preferences: options.mockModelPreferences?.() ?? null,
      });
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { data, error } = await supabaseAdmin
      .from('user_model_preferences')
      .select('preferences')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return createJsonResponse({ error: error.message }, 500);
    }

    return createJsonResponse({
      success: true,
      preferences: data?.preferences || null,
    });
  });
}

export function buildPostAuxillaryModelPreferencesRoute(options: AuxillaryRouteBuilderOptions = {}) {
  return traceRoute('/auxillaries/model-preferences', async (request: Request) => {
    if (options.isMockMode?.()) {
      return createJsonResponse({
        success: true,
        preferences: options.mockModelPreferences?.() ?? null,
      });
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { role, error: roleError } = await getProfileRole(user.id);
    if (roleError) {
      return createJsonResponse({ error: roleError.message }, 500);
    }

    if (role !== 'lead' && role !== 'admin') {
      return createJsonResponse({ error: 'Forbidden' }, 403);
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const { error } = await supabaseAdmin
      .from('user_model_preferences')
      .upsert(
        {
          user_id: user.id,
          preferences: body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (error) {
      return createJsonResponse({ error: error.message }, 500);
    }

    return createJsonResponse({ success: true });
  });
}

export function buildGetAuxillaryTemplatePreferencesRoute(options: AuxillaryRouteBuilderOptions = {}) {
  return traceRoute('/auxillaries/template-preferences', async () => {
    if (options.useTemplateMock?.()) {
      return createJsonResponse(options.mockTemplatePreferences?.() || EMPTY_TEMPLATE_PREFERENCES);
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return createJsonResponse(EMPTY_TEMPLATE_PREFERENCES);
    }

    const { data, error: selectError } = await supabaseAdmin
      .from('user_template_preferences')
      .select('deliverable_templates, ai_document_templates')
      .eq('user_id', user.id)
      .maybeSingle();

    if (selectError) {
      return createJsonResponse(
        { error: selectError.message || 'Failed to load template preferences' },
        500,
      );
    }

    if (!data) {
      return createJsonResponse(EMPTY_TEMPLATE_PREFERENCES);
    }

    return createJsonResponse({
      shippable_templates: data.deliverable_templates || {},
      delivery_templates: data.deliverable_templates || {},
      evidence_document_templates: data.ai_document_templates || {},
    });
  });
}

export function buildPostAuxillaryTemplatePreferencesRoute(options: AuxillaryRouteBuilderOptions = {}) {
  return traceRoute('/auxillaries/template-preferences', async (request: Request) => {
    if (options.useTemplateMock?.()) {
      return createJsonResponse({ success: true }, 201);
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return createJsonResponse({ error: 'Authentication required' }, 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON' }, 400);
    }

    const asObject = (value: unknown) =>
      typeof value === 'object' && value !== null ? value : null;
    const bodyRecord =
      body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
    // Prefer delivery_templates; dual-read historical shippable_templates.
    const deliveryTemplates =
      asObject(bodyRecord?.delivery_templates) ||
      asObject(bodyRecord?.shippable_templates);
    const evidenceDocumentTemplates = asObject(bodyRecord?.evidence_document_templates);

    if (!deliveryTemplates || !evidenceDocumentTemplates) {
      return createJsonResponse({ error: 'Invalid template preferences format' }, 400);
    }

    const { error: upsertError } = await supabaseAdmin.from('user_template_preferences').upsert(
      {
        user_id: user.id,
        deliverable_templates: deliveryTemplates,
        ai_document_templates: evidenceDocumentTemplates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (upsertError) {
      return createJsonResponse(
        { error: upsertError.message || 'Failed to update template preferences' },
        500,
      );
    }

    return createJsonResponse({ success: true }, 201);
  });
}
