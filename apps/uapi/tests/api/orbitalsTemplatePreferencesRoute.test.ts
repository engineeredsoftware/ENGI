/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(async () => ({
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: null },
        error: null,
      })),
    },
  })),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

describe('/api/auxillaries/template-preferences route', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('fails closed to empty template preferences when no user session is present', async () => {
    const { GET } = await import('@/app/api/auxillaries/template-preferences/route');

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      shippable_templates: {},
      evidence_document_templates: {},
      auto_save_templates: false,
    });
  });
});
