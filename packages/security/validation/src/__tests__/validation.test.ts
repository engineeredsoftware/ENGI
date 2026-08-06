import {
  FigmaConnectionSchema,
  GitHubConnectionSchema,
  CredentialUpdateSchema,
  ValidationHelpers,
  AuditLogEntrySchema,
  SupabaseMCPConfigSchema
} from '../validation';

describe('validation schemas', () => {
  it('accepts valid Figma and GitHub connection payloads', () => {
    const figma = FigmaConnectionSchema.parse({
      access_token: 'abcdefghijklmnopqrstuvwxyz',
      team_id: 'team-42',
      team_name: 'Design',
      user_name: 'Designer',
      user_email: 'designer@example.com'
    });
    expect(figma.team_id).toBe('team-42');

    const github = GitHubConnectionSchema.parse({
      access_token: 'abcdefghijklmnopqrstuvwxyz',
      connection_id: '123456',
      user_login: 'octocat'
    });
    expect(github.connection_id).toBe('123456');
  });

  it('enforces credential update operations', () => {
    const update = CredentialUpdateSchema.parse({
      operation: 'encrypt',
      resourceType: 'api_key',
      resourceId: '3d0e4f59-5f63-4e2d-a6dd-4318e3e2fb59'
    });
    expect(update.operation).toBe('encrypt');

    expect(() =>
      CredentialUpdateSchema.parse({
        operation: 'promote',
        resourceType: 'api_key',
        resourceId: 'invalid'
      })
    ).toThrow();
  });

  it('redacts malicious content using the helper utilities', () => {
    expect(ValidationHelpers.containsMaliciousContent('<script>alert(1)</script>')).toBe(true);
    const sanitized = ValidationHelpers.sanitizeString('../../etc/passwd');
    expect(sanitized).toBe('etc/passwd');
  });

  it('validates audit log entries and MCP config', () => {
    const entry = AuditLogEntrySchema.parse({
      userId: '155aa1e9-03f4-4bfd-9f74-09cb35c0faeb',
      eventType: 'credential_created',
      resourceType: 'api_key',
      success: true
    });
    expect(entry.success).toBe(true);

    const supabase = SupabaseMCPConfigSchema.parse({
      apiUrl: 'https://test.supabase.co',
      apiKey: 'ABCDEFGHIJKLMNOP',
      projectId: 'project-1'
    });
    expect(supabase.projectId).toBe('project-1');
  });
});
