export type BitcodeActivityKind =
  | 'transaction'
  | 'execution'
  | 'notification'
  | 'public-system'
  | 'personal-system';

export type BitcodeActivityScope = 'network' | 'personal';

export type BitcodeActivityChannel = 'execution-stream' | 'notification-center' | 'system-surface';

export interface BitcodeActivityRecord {
  id: string;
  kind: BitcodeActivityKind;
  scope: BitcodeActivityScope;
  channel: BitcodeActivityChannel;
  label: string;
  title: string;
  summary: string;
  timestamp: string | null;
  state: string | null;
  read: boolean | null;
  payload: Record<string, any>;
}

export interface BitcodeExecutionEventLike {
  id?: string;
  created_at?: string;
  event?: any;
}

export interface BitcodeExecutionHistoryLike {
  id: string;
  created_at?: string | null;
  status?: string | null;
  type?: string | null;
  summary?: string | null;
  guide?: string | null;
  repo_snapshot?: {
    org?: string | null;
    repo?: string | null;
    branch?: string | null;
    commit?: string | null;
  } | null;
}

export interface BitcodeNotificationLike {
  id: string;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  data?: any;
  read?: boolean | null;
  created_at?: string | null;
}

function asObject(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, any>) : {};
}

function normalizeType(value: string | null | undefined) {
  return String(value || '').trim().toLowerCase();
}

function formatExecutionSummary(payload: Record<string, any>) {
  if (payload?.status?.message) {
    return String(payload.status.message);
  }

  if (payload?.message) {
    return String(payload.message);
  }

  if (payload?.type === 'pipeline') {
    return `Pipeline ${String(payload.status || 'update')}`;
  }

  if (payload?.type === 'phase') {
    return `${String(payload.phase || 'Phase')} ${String(payload.status || 'update')}`;
  }

  if (payload?.type === 'agent') {
    return `${String(payload.agent || 'Agent')} ${String(payload.status || 'update')}`;
  }

  if (payload?.type === 'work-update' && payload?.update) {
    const update = asObject(payload.update);
    const iteration =
      typeof update.iteration === 'number' ? `Iteration ${update.iteration}` : 'Iteration update';
    const confidence =
      typeof update.confidence === 'number'
        ? ` confidence ${Math.round(update.confidence * 100)}%`
        : '';
    return `${iteration}${confidence}`;
  }

  if (payload?.type === 'completion') {
    return 'Execution completed';
  }

  if (payload?.type === 'error') {
    return String(payload.error || payload.message || 'Execution error');
  }

  return '';
}

function formatExecutionTitle(payload: Record<string, any>) {
  switch (payload?.type) {
    case 'completion':
      return 'Completion';
    case 'error':
      return 'Execution error';
    case 'generation':
      return 'Generation';
    case 'agent':
      return 'Agent update';
    case 'phase':
      return 'Phase update';
    case 'pipeline':
      return 'Pipeline update';
    case 'work-update':
      return 'Work update';
    case 'status':
      return 'Status update';
    default:
      return 'Execution activity';
  }
}

function formatExecutionHistoryTitle(type: string | null | undefined) {
  const normalizedType = String(type || '').trim().toLowerCase();
  if (!normalizedType) return 'Execution activity';
  if (normalizedType.includes('measure')) return 'Read measurement execution';
  if (normalizedType.includes('proof')) return 'Proof execution';
  if (normalizedType.includes('asset-pack') || normalizedType.includes('shippable')) return 'AssetPack execution';
  if (normalizedType.includes('pipeline')) return 'Pipeline execution';
  return 'Execution activity';
}

export function inferNotificationActivityTitle(
  type: string | null | undefined,
  explicitTitle?: string | null,
) {
  const title = String(explicitTitle || '').trim();
  if (title) return title;

  const normalizedType = normalizeType(type);

  if (normalizedType.includes('proof') || normalizedType.includes('verification')) {
    return 'Proof update';
  }

  if (
    normalizedType.includes('repo') ||
    normalizedType.includes('github') ||
    normalizedType.includes('repository')
  ) {
    return 'Repository event';
  }

  if (normalizedType.includes('review')) {
    return 'Review prompt';
  }

  if (normalizedType.includes('closure') || normalizedType.includes('settlement')) {
    return 'Closure update';
  }

  if (normalizedType.includes('error') || normalizedType.includes('fail')) {
    return 'Attention required';
  }

  return 'Notification activity';
}

export function getBitcodeActivityKindLabel(kind: BitcodeActivityKind) {
  switch (kind) {
    case 'transaction':
      return 'Transactions';
    case 'execution':
      return 'Executions';
    case 'notification':
      return 'Notifications';
    case 'public-system':
      return 'Public activity';
    case 'personal-system':
      return 'Personal activity';
    default:
      return 'Activity';
  }
}

export function getBitcodeActivityScopeLabel(scope: BitcodeActivityScope) {
  return scope === 'personal' ? 'Personal' : 'Network';
}

export function summarizeBitcodeActivityKinds(records: BitcodeActivityRecord[]) {
  return Array.from(new Set(records.map((record) => record.kind)));
}

export function buildBitcodeActivityRecordFromExecutionEvent(
  entry: BitcodeExecutionEventLike,
): BitcodeActivityRecord | null {
  const payload = asObject(entry.event);
  if (!Object.keys(payload).length) {
    return null;
  }

  const summary = formatExecutionSummary(payload);
  if (!summary) {
    return null;
  }

  return {
    id: String(entry.id || `${payload.type || 'event'}:${entry.created_at || ''}`),
    kind: 'execution',
    scope: 'network',
    channel: 'execution-stream',
    label: getBitcodeActivityKindLabel('execution'),
    title: formatExecutionTitle(payload),
    summary,
    timestamp: entry.created_at || null,
    state:
      String(
        payload?.status?.executionState?.phase ||
          payload?.status?.phase ||
          payload?.status ||
          payload?.state ||
          '',
      ).trim() || null,
    read: null,
    payload,
  };
}

/**
 * Scope taxonomy (V48 Gate 2 specification): globally visible commerce —
 * AssetPacks admitted to the Depository and settled/read AssetPacks — is
 * 'network'; the depositor's own work — deposit requests, option syntheses,
 * review decisions including archived options, connected sources — is
 * 'personal'.
 */
export function inferExecutionHistoryScope(
  row: BitcodeExecutionHistoryLike,
): BitcodeActivityScope {
  const context = asObject((row as Record<string, any>).context);
  const admissionState = String(context.admissionState || context.admission_state || '');
  if (admissionState === 'admitted-to-depository') return 'network';
  const type = String(row.type || '');
  if (type.includes('settlement') || type.includes('settled')) return 'network';
  const packActivityType = String(context.packActivityType || '');
  if (packActivityType === 'depository-assetpack' || packActivityType === 'settled-assetpack') {
    return 'network';
  }
  return 'personal';
}

export function buildBitcodeActivityRecordFromExecutionHistory(
  row: BitcodeExecutionHistoryLike,
): BitcodeActivityRecord {
  const repo = row.repo_snapshot?.org && row.repo_snapshot?.repo
    ? `${row.repo_snapshot.org}/${row.repo_snapshot.repo}`
    : null;
  const summary =
    String(row.summary || '').trim() ||
    [
      formatExecutionHistoryTitle(row.type),
      row.status ? `status ${String(row.status)}` : null,
      repo ? `for ${repo}` : null,
    ]
      .filter(Boolean)
      .join(' ');

  return {
    id: String(row.id),
    kind: 'execution',
    scope: inferExecutionHistoryScope(row),
    channel: 'system-surface',
    label: getBitcodeActivityKindLabel('execution'),
    title: formatExecutionHistoryTitle(row.type),
    summary,
    timestamp: row.created_at || null,
    state: String(row.status || '').trim() || null,
    read: null,
    payload: row as Record<string, any>,
  };
}

export function buildBitcodeActivityRecordFromNotification(
  row: BitcodeNotificationLike,
): BitcodeActivityRecord {
  return {
    id: String(row.id),
    kind: 'notification',
    scope: 'personal',
    channel: 'notification-center',
    label: getBitcodeActivityKindLabel('notification'),
    title: inferNotificationActivityTitle(row.type, row.title),
    summary: String(row.message || '').trim() || 'Notification activity update',
    timestamp: row.created_at || null,
    state: row.read ? 'read' : 'unread',
    read: row.read ?? false,
    payload: asObject(row.data),
  };
}
