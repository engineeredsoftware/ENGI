/**
 * @jest-environment node
 */

describe('/api/edgetimes GET', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns the fourth-gate storage topology witness', async () => {
    const { GET } = await import('@/app/api/edgetimes/route');

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.topology.baselineMigration.path).toBe('supabase/migrations/001_v26_production.sql');
    expect(payload.topology.ownershipBands[2].owners).toContain('apps/uapi/app/api/edgetimes/route.ts');
    expect(payload.topology.ownershipBands[3].owners).toContain('@bitcode/orm');
    expect(payload.summary.unresolvedTables).toBeGreaterThan(0);
  });
});
