import { buildMockReviewUser, isAuxillariesMockMode } from '../../../../lib/mock-review-mode';

export type OrbitalNotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  message: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean | null;
  created_at: string | null;
};

const MOCK_USER = buildMockReviewUser();

const MOCK_NOTIFICATIONS: OrbitalNotificationRow[] = [
  {
    id: 'mock-notification-proof',
    user_id: MOCK_USER.id,
    type: 'proof',
    title: 'Witness bundle ready',
    message: 'Proof closure witnesses are ready for the selected Bitcode transaction.',
    data: { transactionId: 'mock-run-branch-remediation' },
    is_read: false,
    created_at: '2026-04-16T12:04:00.000Z',
  },
  {
    id: 'mock-notification-repo',
    user_id: MOCK_USER.id,
    type: 'repository',
    title: null,
    message: 'Repository review activity needs follow-through on the active remediation branch.',
    data: { repository: 'bitcode/bitcode' },
    is_read: false,
    created_at: '2026-04-16T11:41:00.000Z',
  },
  {
    id: 'mock-notification-review',
    user_id: MOCK_USER.id,
    type: 'review',
    title: 'Review prompt',
    message: 'A retained execution primitive surfaced a review follow-through step.',
    data: { runId: 'mock-run-read-measurement-pass' },
    is_read: true,
    created_at: '2026-04-16T10:56:00.000Z',
  },
];

export function getMockOrbitalNotifications() {
  return [...MOCK_NOTIFICATIONS].sort((left, right) =>
    String(right.created_at || '').localeCompare(String(left.created_at || '')),
  );
}

export function normalizeOrbitalNotificationRow(row: OrbitalNotificationRow) {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    title: row.title || undefined,
    message: row.message || '',
    data: row.data ?? {},
    read: Boolean(row.is_read),
    created_at: row.created_at,
  };
}

export function isOrbitalNotificationsMockMode() {
  return isAuxillariesMockMode();
}
