/**
 * Root-index PROMPTPART re-export resolution (V48 Gate 3).
 *
 * The curated barrel at packages/prompts/src/index.ts re-exports named
 * PROMPTPART_* constants from deep raw_promptparts modules. A re-export of a
 * name the target module does not actually export resolves to `undefined` at
 * runtime (the "shipped re-exports of nonexistent names" regression class), so
 * this suite imports the barrel and pins that every PROMPTPART_* export
 * resolves to a real, non-empty prompt string.
 *
 * The pins run against BOTH barrels:
 * - the TS source barrel (src/index.ts) — the curated source surface; and
 * - the COMPILED barrel (src/index.js) when present — plain-node consumers
 *   resolve it first, and it has drifted stale before (it kept exporting the
 *   old PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSETPACK_* names after the
 *   source renamed them to ...ASSET_PACK_*, so those getters returned
 *   undefined). The compiled mirrors are gitignored build artifacts, so the
 *   compiled leg is skipped when no src/index.js exists (fresh checkout / CI).
 */

import * as fs from 'fs';
import * as path from 'path';

const COMPILED_BARREL = path.join(__dirname, '..', 'index.js');
const hasCompiledBarrel = fs.existsSync(COMPILED_BARREL);

// Import each barrel by its EXPLICIT extension: bare '../index' would resolve
// to whichever artifact jest's resolution order prefers, and the contract here
// is per-barrel.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsBarrel = require('../index.ts') as Record<string, unknown>;
const compiledBarrel = hasCompiledBarrel
  ? // eslint-disable-next-line @typescript-eslint/no-var-requires
    (require(COMPILED_BARREL) as Record<string, unknown>)
  : null;

const barrels: Array<[string, Record<string, unknown>]> = [['ts source barrel (index.ts)', tsBarrel]];
if (compiledBarrel) barrels.push(['compiled barrel (index.js)', compiledBarrel]);

describe.each(barrels)('@bitcode/prompts root index PROMPTPART re-exports — %s', (_label, promptsIndex) => {
  const promptPartEntries = Object.entries(promptsIndex).filter(([name]) =>
    name.startsWith('PROMPTPART_'),
  );

  it('curates a non-trivial PROMPTPART barrel at the package root', () => {
    // The curated surface (PTRR objectives, formatting, generation/failsafe
    // parts, ApplyFile, RepositorySetup tool, CloneVcsRepository, ComprehendRead).
    expect(promptPartEntries.length).toBeGreaterThanOrEqual(40);
  });

  it('resolves every PROMPTPART_* re-export to a defined value', () => {
    const unresolved = promptPartEntries
      .filter(([, value]) => value === undefined || value === null)
      .map(([name]) => name);
    expect(unresolved).toEqual([]);
  });

  it('resolves every PROMPTPART_* re-export to a non-empty prompt string', () => {
    const nonString = promptPartEntries
      .filter(([, value]) => typeof value !== 'string' || value.trim().length === 0)
      .map(([name]) => name);
    expect(nonString).toEqual([]);
  });

  it('keeps the generic PTRR + generation prompt spine addressable from the root', () => {
    // The exact names agent-generics' formal PTRR machinery depends on.
    const spine = [
      'PROMPTPART_GENERIC_PTRR_PLAN_OBJECTIVE',
      'PROMPTPART_GENERIC_PTRR_TRY_OBJECTIVE',
      'PROMPTPART_GENERIC_PTRR_REFINE_OBJECTIVE',
      'PROMPTPART_GENERIC_PTRR_RETRY_OBJECTIVE',
      'PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT',
      'PROMPTPART_GENERIC_AGENT_GENERATION_REASON',
      'PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE',
      'PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT',
      'PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER',
      'PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA',
      'PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY',
    ];
    for (const name of spine) {
      const value = promptsIndex[name];
      expect(typeof value).toBe('string');
      expect(String(value).trim().length).toBeGreaterThan(0);
    }
  });

  it('exposes the public prompt primitives alongside the PROMPTPART barrel', () => {
    expect(promptsIndex.Prompt).toBeDefined();
    expect(promptsIndex.createPrompt).toBeDefined();
    expect(promptsIndex.createPromptPart).toBeDefined();
    expect(promptsIndex.isPromptPart).toBeDefined();
    expect(promptsIndex.hierarchicalFormatter).toBeDefined();
    expect(promptsIndex.PromptExecution).toBeDefined();
  });
});

(hasCompiledBarrel ? describe : describe.skip)('compiled barrel parity with the ts source barrel', () => {
  it('exports exactly the same PROMPTPART_* name set (no stale compiled drift)', () => {
    const tsNames = Object.keys(tsBarrel).filter((n) => n.startsWith('PROMPTPART_')).sort();
    const jsNames = Object.keys(compiledBarrel as Record<string, unknown>)
      .filter((n) => n.startsWith('PROMPTPART_'))
      .sort();
    expect(jsNames).toEqual(tsNames);
  });
});

describe('raw_promptparts index barrels', () => {
  it('never re-export ".d" module specifiers (they crash plain-node requires and ambiguate the ts barrel)', () => {
    for (const rel of ['../raw_promptparts/generic/index.ts', '../raw_promptparts/specific/index.ts']) {
      const source = fs.readFileSync(path.join(__dirname, rel), 'utf8');
      expect(source).not.toMatch(/from\s+["'][^"']*\.d["']/);
    }
  });
});
