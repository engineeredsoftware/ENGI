import { log } from '@bitcode/logger';
import {
  auditLog,
  auditCredentialOperation,
  auditAuthAttempt,
  auditRateLimitExceeded,
  AuditEventType,
  ResourceType,
  createAuditContext
} from '../audit-logging';

const mockLog = log as jest.Mock;

describe('audit logging', () => {
  beforeEach(() => {
    mockLog.mockClear();
  });

  const context = createAuditContext('user-1', {
    ip: '203.0.113.1',
    headers: {
      'user-agent': 'jest',
      'x-request-id': 'req-1'
    }
  });

  it('records sanitized metadata and redacts secrets', async () => {
    await auditLog(AuditEventType.CREDENTIAL_CREATED, ResourceType.API_KEY, context, {
      metadata: {
        token: 'super-secret',
        nested: { password: 'hidden-value' },
        description: 'credential created'
      }
    });

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Audit: credential_created'), 'info', expect.objectContaining({
      metadataKeys: expect.arrayContaining(['token', 'nested', 'description'])
    }));
  });

  it('wraps operations and records failures', async () => {
    const successful = await auditCredentialOperation(
      async () => 'result',
      AuditEventType.CREDENTIAL_ACCESS,
      ResourceType.API_KEY,
      context,
      'resource-1'
    );
    expect(successful).toBe('result');

    await expect(
      auditCredentialOperation(
        async () => {
          throw new Error('boom');
        },
        AuditEventType.CREDENTIAL_DELETED,
        ResourceType.API_KEY,
        context,
        'resource-1'
      )
    ).rejects.toThrow('boom');

    const logEntries = mockLog.mock.calls.filter(([message]) => message.startsWith('Audit:'));
    expect(logEntries.length).toBeGreaterThanOrEqual(2);
  });

  it('audits auth attempts and rate limit events', async () => {
    await auditAuthAttempt(context, true, 'password');
    await auditAuthAttempt(context, false, 'oauth', 'AUTH_FAILED');

    await auditRateLimitExceeded(context, '/api/test', 5, 10);
    const events = mockLog.mock.calls.filter(([message]) => message.startsWith('Audit:'));
    expect(events.length).toBeGreaterThanOrEqual(3);
  });
});
