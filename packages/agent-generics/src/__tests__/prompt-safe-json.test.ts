/**
 * Prompt-safe JSON projection — deposit monorepo inventories must never crash
 * reason/judge/structured_output with RangeError: Invalid string length.
 */

import { projectPromptSafeValue, safePromptJson } from '../generations/llm-bound-factories';

describe('projectPromptSafeValue / safePromptJson', () => {
  it('strips inventory.sources and never embeds file content', () => {
    const inventory = {
      paths: ['a.ts', 'b.ts'],
      samples: [{ path: 'a.ts', excerpt: 'export const a = 1' }],
      sources: [
        { path: 'a.ts', content: 'SECRET-SOURCE-A'.repeat(100) },
        { path: 'b.ts', content: 'SECRET-SOURCE-B'.repeat(100) },
      ],
      totalPathCount: 2,
      excludedPathCount: 0,
    };
    const projected = projectPromptSafeValue(inventory) as any;
    expect(projected.sourceFileCount).toBe(2);
    expect(projected.pathCount).toBe(2);
    expect(String(projected.sources)).toContain('withheld from prompt');
    expect(JSON.stringify(projected)).not.toContain('SECRET-SOURCE');
  });

  it('safePromptJson does not throw on multi-megabyte inventory.sources', () => {
    const bigContent = 'x'.repeat(50_000);
    const inventory = {
      paths: Array.from({ length: 200 }, (_, i) => `src/f${i}.ts`),
      samples: [{ path: 'src/f0.ts', excerpt: 'ok' }],
      sources: Array.from({ length: 200 }, (_, i) => ({
        path: `src/f${i}.ts`,
        content: bigContent,
      })),
      totalPathCount: 200,
      excludedPathCount: 0,
    };
    // ~10MB of sources — raw JSON.stringify would be huge; projection must stay small.
    const text = safePromptJson({
      selectedContext: { 'deposit#inventory': inventory },
      obfuscations: 'UI only',
    });
    expect(text.length).toBeLessThan(MAX_REASONABLE_PROMPT);
    expect(text).not.toContain(bigContent.slice(0, 100));
    expect(text).toContain('withheld from prompt');
  });

  it('truncates very long free-text fields', () => {
    const long = 'y'.repeat(20_000);
    const text = safePromptJson({ note: long });
    expect(text.length).toBeLessThan(long.length);
    expect(text).toContain('+');
  });
});

const MAX_REASONABLE_PROMPT = 250_000;
