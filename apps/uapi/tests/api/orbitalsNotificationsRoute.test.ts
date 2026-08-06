/**
 * @jest-environment node
 */

describe('/api/auxillaries/notifications routes', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns mock notifications when orbital mock mode is enabled', async () => {
    jest.doMock('@/config/featureFlags', () => ({
      ENABLE_MOCKS: true,
      MOCK_USER_AUXILLARIES: true,
      MOCK_USER_AUXILLARIES_SCENARIO: 'demo',
    }));

    const { GET } = await import('@/app/api/auxillaries/notifications/route');
    const response = await GET(
      new Request('https://example.com/api/auxillaries/notifications?limit=2'),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toHaveLength(2);
    expect(payload[0]).toMatchObject({
      id: 'mock-notification-proof',
      read: false,
    });
  });

  it('returns an empty list when live mode is unauthenticated', async () => {
    jest.doMock('@/config/featureFlags', () => ({
      ENABLE_MOCKS: false,
      MOCK_USER_AUXILLARIES: false,
      MOCK_USER_AUXILLARIES_SCENARIO: 'default',
    }));
    jest.doMock('@bitcode/supabase/ssr/server', () => ({
      createClient: jest.fn().mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('unauthenticated'),
          }),
        },
      }),
    }));
    jest.doMock('@bitcode/supabase', () => ({
      supabaseAdmin: {
        from: jest.fn(),
      },
    }));

    const { GET } = await import('@/app/api/auxillaries/notifications/route');
    const response = await GET(
      new Request('https://example.com/api/auxillaries/notifications'),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual([]);
  });

  it('patches and deletes mock notifications in mock mode', async () => {
    jest.doMock('@/config/featureFlags', () => ({
      ENABLE_MOCKS: true,
      MOCK_USER_AUXILLARIES: true,
      MOCK_USER_AUXILLARIES_SCENARIO: 'demo',
    }));

    const routeModule = await import('@/app/api/auxillaries/notifications/[notificationId]/route');

    const patchResponse = await routeModule.PATCH(
      new Request('https://example.com/api/auxillaries/notifications/mock-notification-proof', {
        method: 'PATCH',
        body: JSON.stringify({ read: true }),
      }),
      { params: { notificationId: 'mock-notification-proof' } },
    );
    const patchPayload = await patchResponse.json();

    expect(patchResponse.status).toBe(200);
    expect(patchPayload).toMatchObject({
      id: 'mock-notification-proof',
      is_read: true,
      read: true,
    });

    const deleteResponse = await routeModule.DELETE(
      new Request('https://example.com/api/auxillaries/notifications/mock-notification-proof', {
        method: 'DELETE',
      }),
      { params: { notificationId: 'mock-notification-proof' } },
    );
    const deletePayload = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(deletePayload).toEqual({
      ok: true,
      deletedId: 'mock-notification-proof',
    });
  });
});
