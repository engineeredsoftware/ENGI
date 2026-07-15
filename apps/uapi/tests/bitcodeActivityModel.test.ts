import {
  buildBitcodeActivityRecordFromExecutionEvent,
  buildBitcodeActivityRecordFromNotification,
  summarizeBitcodeActivityKinds,
} from '@/components/bitcode/activity/BitcodeActivityModel/bitcode-activity-model';

describe('bitcode-activity-model', () => {
  it('builds an execution activity record from an execution event', () => {
    const record = buildBitcodeActivityRecordFromExecutionEvent({
      id: 'evt-1',
      created_at: '2026-04-19T12:00:00.000Z',
      event: {
        type: 'status',
        status: {
          message: 'Read measurement prepared',
          executionState: { phase: 'Read', agent: 'Analyzer' },
        },
      },
    });

    expect(record).toMatchObject({
      id: 'evt-1',
      kind: 'execution',
      scope: 'network',
      channel: 'execution-stream',
      title: 'Status update',
      summary: 'Read measurement prepared',
      state: 'Read',
    });
  });

  it('builds a personal notification activity record and summarizes kinds', () => {
    const notificationRecord = buildBitcodeActivityRecordFromNotification({
      id: 'notif-1',
      type: 'review',
      message: 'Repository review needed',
      read: false,
      created_at: '2026-04-19T12:10:00.000Z',
    });

    expect(notificationRecord).toMatchObject({
      id: 'notif-1',
      kind: 'notification',
      scope: 'personal',
      channel: 'notification-center',
      title: 'Review prompt',
      summary: 'Repository review needed',
      read: false,
    });

    expect(summarizeBitcodeActivityKinds([notificationRecord])).toEqual(['notification']);
  });
});
