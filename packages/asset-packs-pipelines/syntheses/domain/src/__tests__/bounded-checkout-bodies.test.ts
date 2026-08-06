/**
 * Bound checkout body load — Discovery must not materialize entire monorepos.
 */
import { loadBoundedCheckoutSourceBodies } from '../agents/setup/asset-pack-clone-vcs-repository-agent';

describe('loadBoundedCheckoutSourceBodies', () => {
  it('caps file count and total characters', async () => {
    const paths = [
      'README.md',
      'package.json',
      ...Array.from({ length: 200 }, (_, i) => `src/f${i}.ts`),
    ];
    const huge = 'x'.repeat(50_000);
    const workspace = {
      listFiles: async () => paths,
      readFile: async (p: string) => {
        if (p === 'README.md') return '# hello';
        if (p === 'package.json') return '{"name":"t"}';
        return huge;
      },
    };

    const sources = await loadBoundedCheckoutSourceBodies(workspace);
    expect(sources.length).toBeLessThanOrEqual(48);
    expect(sources.some((s) => s.path === 'README.md')).toBe(true);
    expect(sources.some((s) => s.path === 'package.json')).toBe(true);
    const total = sources.reduce((n, s) => n + s.content.length, 0);
    expect(total).toBeLessThanOrEqual(400_000);
    // Individual bodies are char-capped.
    for (const s of sources) {
      expect(s.content.length).toBeLessThanOrEqual(16_000);
    }
  });
});
