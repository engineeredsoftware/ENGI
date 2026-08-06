import { supabaseAdmin as supabase } from '@bitcode/supabase';
import {
  BitcodeRunNotificationType,
  DomainEvent,
  NotificationChannel,
  NotificationPayload,
  NotificationRecord,
  NotificationType,
} from './types';
import {
  categoryForNotificationType,
  resolveNotificationContactEmail,
  shouldSendUserEmail,
} from './email-preferences';
import { sendEmail } from './index';

/*
 * Process a single DomainEvent and fan-out one or more Notification records.
 *
 * The logic is intentionally side-effect free except for calling `sendEmail`
 * (which is already a stub in local/CI runs) so that unit tests can run the
 * transformation without a DB connection.
 */

export async function handleDomainEvent(event: DomainEvent): Promise<void> {
  switch (event.kind) {
    case 'RUN':
      await fanoutRunEvent(event);
      break;
    case 'BTD_BALANCE':
      await fanoutBtdBalanceEvent(event);
      break;
    default:
      // eslint-disable-next-line no-console
      console.warn('[notifications] Unknown event kind', event);
  }
}

// -------------------------------------------------------------------------
// Transformation helpers
// -------------------------------------------------------------------------

async function fanoutRunEvent(event: Extract<DomainEvent, { kind: 'RUN' }>): Promise<void> {
  const { status, runId, runType, userId } = event;

  const typeMap: Record<string, NotificationType> = {
    STARTED: 'RUN_START',
    SUCCESS: 'RUN_SUCCESS',
    ERROR: 'RUN_ERROR',
  };
  const notifType = typeMap[status];

  const runCopy = getRunNotificationCopy(runType, runId);
  const url = runCopy.url;
  const humanType = runCopy.label;
  const humanStatus = status === 'SUCCESS' ? 'completed' : status.toLowerCase();
  const message = `${humanType} #${runId} ${humanStatus}`;

  const payload: NotificationPayload = {
    message,
    url,
    runId,
    runType,
    status,
    executionKind: runCopy.executionKind,
  };

  await persistAndDispatch({ userId, notifType, payload });
}

function getRunNotificationCopy(runType: BitcodeRunNotificationType, runId: number): {
  label: string;
  url: string;
  executionKind: string;
} {
  const executionUrl = `/executions/${runId}`;

  if (runType === 'asset-pack') {
    return {
      label: 'AssetPack execution',
      url: executionUrl,
      executionKind: 'asset-pack',
    };
  }

  return {
    label: 'Read measurement execution',
    url: executionUrl,
    executionKind: 'read-measurement',
  };
}

async function fanoutBtdBalanceEvent(event: Extract<DomainEvent, { kind: 'BTD_BALANCE' }>): Promise<void> {
  const { type, userId, balance, threshold } = event;

  const humanType = type === 'LOW_BALANCE' ? 'running low on $BTD' : 'out of $BTD';
  const message = `Your account is ${humanType} (${balance} remaining)`;
  const payload: NotificationPayload = { message, balance, threshold };

  const notifType: NotificationType = type === 'LOW_BALANCE' ? 'LOW_BTD_BALANCE' : 'ZERO_BTD_BALANCE';

  await persistAndDispatch({ userId, notifType, payload });
}

// -------------------------------------------------------------------------
// Persistence + channel fan-out helpers
// -------------------------------------------------------------------------

interface PersistParams {
  userId: string;
  notifType: NotificationType;
  payload: NotificationPayload;
}

async function persistAndDispatch(params: PersistParams): Promise<void> {
  const { userId, notifType, payload } = params;

  // 1. Decide channels (hard-coded for now – in_app + email)
  const channels: NotificationChannel[] = ['in_app', 'email'];

  // 2. Persist rows
  const rows = channels.map((channel) => ({
    user_id: userId,
    type: notifType,
    channel,
    payload,
  }));

  const { error } = await supabase.from('notifications').insert(rows);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[notifications] Failed to insert rows', error);
  }

  // 3. Side-effects per channel
  await Promise.all(
    channels.map(async (channel) => {
      if (channel === 'email') {
        await maybeSendEmail(userId, notifType, payload);
      }
      // 'in_app' is realtime broadcast, handled by Supabase publication.
    })
  );
}

async function maybeSendEmail(
  userId: string,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  const category = categoryForNotificationType(type);
  const decision = await shouldSendUserEmail(userId, category);
  if (!decision.allowed || !decision.email) {
    // eslint-disable-next-line no-console
    console.log('[notifications] skip email', { userId, type, category, reason: decision.reason });
    return;
  }

  const subject = payload.message;
  await sendEmail({
    to: decision.email,
    subject,
    template: 'generic_notification',
    vars: {
      subject,
      name: '',
      message: payload.message,
      body: `<p>${payload.message}</p>`,
      url: payload.url ?? '',
      buttonText: payload.url ? 'Open Bitcode' : '',
      buttonUrl: payload.url ?? '',
    },
  });
}

/** Prefer profile notification email; fall back to auth. */
export async function fetchUserEmail(userId: string): Promise<string | undefined> {
  const email = await resolveNotificationContactEmail(userId);
  return email ?? undefined;
}
