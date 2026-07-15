/**
 * @jest-environment node
 */

describe('/api/client-error POST', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('accepts client error telemetry without failing the Terminal route', async () => {
    const { POST } = await import('@/app/api/client-error/route');

    const request = new Request('http://localhost/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Rendered more hooks than during the previous render.',
        source: 'TerminalTransactionDetailSurface.tsx',
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
  });
});
