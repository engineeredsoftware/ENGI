/**
 * Root-index PROMPTPART re-export resolution (V48 Gate 3).
 *
 * The curated barrel at packages/prompts/src/index.ts re-exports named
 * PROMPTPART_* constants from deep raw_promptparts modules. A re-export of a
 * name the target module does not actually export resolves to `undefined` at
 * runtime (the "shipped re-exports of nonexistent names" regression class), so
 * this suite imports the whole index and pins that every PROMPTPART_* export
 * resolves to a real, non-empty prompt string.
 */

// Import the TS source barrel explicitly: bare '../index' resolves to the
// compiled src/index.js artifact first under this package's Jest resolution,
// and the pinned contract here is the CURRENT curated source surface.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const promptsIndex = require('../index.ts') as Record<string, unknown>;

describe('@bitcode/prompts root index PROMPTPART re-exports', () => {
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
