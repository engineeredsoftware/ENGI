import { GET } from '@/app/api/get-title/route';

describe('GET /api/get-title', () => {
  const baseUrl = 'http://localhost/get-title?url=https://example.com';

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('returns status 400 when url param is missing', async () => {
    const request = new Request('http://localhost/get-title');
    const response = await GET(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: 'URL parameter is required' });
  });

  it('extracts <title> tag', async () => {
    const html = '<html><head><title>Test Title</title></head><body></body></html>';
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => html });
    const request = new Request(baseUrl);
    const response = await GET(request);
    expect(response.status).toBe(200);
    const title = await response.json();
    expect(title).toBe('Test Title');
  });

  it('falls back to og:title meta when title is poor', async () => {
    const html = `
      <html><head>
        <title>Site Name | Section</title>
        <meta property="og:title" content="Meta Title"/>
      </head><body></body></html>
    `;
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => html });
    const request = new Request(baseUrl);
    const response = await GET(request);
    expect(response.status).toBe(200);
    const title = await response.json();
    expect(title).toBe('Meta Title');
  });

  it('uses <h1> when no title tags', async () => {
    const html = '<html><body><h1>Header Title</h1></body></html>';
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => html });
    const request = new Request(baseUrl);
    const response = await GET(request);
    const title = await response.json();
    expect(title).toBe('Header Title');
  });

  it('uses pathname when nothing found', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => '' });
    const request = new Request('http://localhost/get-title?url=https://example.com/path/page');
    const response = await GET(request);
    const title = await response.json();
    expect(title).toBe('page');
  });
  
  it('falls back to hostname when fetch returns non-ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });
    const request = new Request('http://localhost/get-title?url=https://sub.example.com/path');
    const response = await GET(request);
    const title = await response.json();
    expect(title).toBe('sub.example.com');
  });

  it('returns Untitled when URL invalid', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));   
    const request = new Request('http://localhost/get-title?url=not a url');
    const response = await GET(request);
    const title = await response.json();
    expect(title).toBe('Untitled');
  });

  it('decodes HTML entities and removes common suffixes', async () => {
    const html = '<title>Foo &amp; Bar - Official Website</title>';
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => html });
    const request = new Request(baseUrl);
    const response = await GET(request);
    const title = await response.json();
    expect(title).toBe('Foo & Bar');
  });

  it('truncates overly long titles', async () => {
    const longTitle = 'A'.repeat(120);
    const html = `<title>${longTitle}</title>`;
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => html });
    const request = new Request(baseUrl);
    const response = await GET(request);
    const title = await response.json();
    expect(title.length).toBeLessThanOrEqual(100);
    expect(title.endsWith('...')).toBe(true);
  });
});