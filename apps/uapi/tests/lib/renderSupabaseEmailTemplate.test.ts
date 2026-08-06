import {
  buildWaitlistTemplateVars,
  interpolateAppEmailTemplate,
  isPublicWaitlistSiteUrl,
  renderSupabaseEmailTemplate,
  resolveSupabaseTemplatesDir,
} from '@/lib/render-supabase-email-template';
import path from 'node:path';

describe('render-supabase-email-template', () => {
  it('resolves email template dirs including app-local deploy tree', async () => {
    const dir = await resolveSupabaseTemplatesDir(path.join(process.cwd()));
    // Prefer app email-templates or monorepo supabase/templates
    expect(dir.replace(/\\/g, '/')).toMatch(
      /(email-templates|supabase\/templates)$/,
    );
  });

  it('interpolates {{var}} placeholders', () => {
    expect(
      interpolateAppEmailTemplate('Hi {{name}} — {{email}}', {
        name: 'Ada',
        email: 'a@b.co',
      }),
    ).toBe('Hi Ada — a@b.co');
  });

  it('renders waitlist.html with roles block', async () => {
    const html = await renderSupabaseEmailTemplate(
      'waitlist',
      buildWaitlistTemplateVars({
        email: 'you@company.com',
        roles: ['seller', 'builder'],
        siteUrl: 'https://bitcode.exchange',
        year: 2026,
      }),
    );
    expect(html).toContain('Welcome to the Bitcode waitlist');
    expect(html).toContain('you@company.com');
    expect(html).toContain('Seller · Builder');
    expect(html).toContain('https://bitcode.exchange');
    expect(html).toContain('© 2026');
    expect(html).toContain('pair-connected');
  });

  it('omits roles block when roles empty', async () => {
    const html = await renderSupabaseEmailTemplate(
      'waitlist',
      buildWaitlistTemplateVars({
        email: 'solo@co.com',
        roles: [],
        siteUrl: 'https://bitcode.exchange',
      }),
    );
    expect(html).toContain('solo@co.com');
    expect(html).not.toContain('Lanes:');
  });

  it('isPublicWaitlistSiteUrl rejects localhost', () => {
    expect(isPublicWaitlistSiteUrl('http://localhost:3000')).toBe(false);
    expect(isPublicWaitlistSiteUrl('https://127.0.0.1')).toBe(false);
    expect(isPublicWaitlistSiteUrl('https://bitcode.exchange')).toBe(true);
  });
});
