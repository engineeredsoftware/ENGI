/**
 * UI contract for dynamic neediness naming (must end with -fit).
 */

function slugifyNeedinessKind(raw: string): string {
  const base = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  if (!base) return 'needs-unspecified-fit';
  return base.endsWith('-fit') ? base : `${base}-fit`;
}

describe('read option neediness naming (UI contract)', () => {
  it('forces -fit suffix for dynamic kinds', () => {
    expect(slugifyNeedinessKind('needs session refresh')).toBe('needs-session-refresh-fit');
    expect(slugifyNeedinessKind('language-fit')).toBe('language-fit');
  });
});
