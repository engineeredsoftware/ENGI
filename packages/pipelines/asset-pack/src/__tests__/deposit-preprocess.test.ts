// @ts-nocheck
/**
 * SynthesizeAssetPacks preprocess (V48 Gate 3) — context assembly from a
 * synthetic request.
 *
 * Runs the real composed pipeline (`synthesizeAssetPacksPipeline`; under
 * NODE_ENV=test the five phase runtimes are stubbed but preprocess/postprocess
 * are REAL) and pins the deposit-mode preprocess contract:
 *  - mode resolution + storage on the SHARED outer execution (F20) so every
 *    isolated seq-N phase sibling resolves it via the upward walk;
 *  - CROSS-PHASE STORE-VISIBILITY LAW: preprocess runs on its own isolated
 *    seq-0 sibling, so EVERYTHING it produces for the phases (pipeline:input,
 *    the deposit data plane, the route snapshot) is stored on the SHARED
 *    execution — where the dispatching route reads it directly and every phase
 *    sibling resolves it via findUp — NOT on the seq-0 sibling;
 *  - repository coordinate normalization (url/name/branch/commit/fullName
 *    fallbacks) stored under the deposit namespace + threaded on the input;
 *  - depositor steering (obfuscations / protectedIpExclusions / demandContext /
 *    inventory) persisted for the phases;
 *  - the read-lens depository search is SKIPPED under deposit (and still runs
 *    under read);
 *  - the preprocessed route snapshot is written.
 *
 * Plus unit pins for resolveSynthesizeAssetPacksMode precedence.
 */
jest.mock('@bitcode/generic-llms', () =>
  require('./support/generic-llms-mock').makeGenericLLMsMock());

jest.mock('../depository-search', () => {
  const actual = jest.requireActual('../depository-search');
  return {
    ...actual,
    runDepositorySearchForPipelineInput: jest.fn(async () => ({
      selectedCandidates: [],
      fitDeposits: [],
      fitDepositAssetIds: [],
    })),
  };
});

import { Execution } from '@bitcode/execution-generics';
import { PipelineExecution } from '@bitcode/pipelines-generics';
import { synthesizeAssetPacksPipeline } from '../index';
import { runDepositorySearchForPipelineInput } from '../depository-search';
import {
  resolveSynthesizeAssetPacksMode,
  storeSynthesizeAssetPacksMode,
  synthesizeAssetPacksModeFromExecution,
} from '../synthesize-asset-packs';

const depositorySearchMock = runDepositorySearchForPipelineInput as jest.Mock;

/** sequential() children are keyed by full id — find the preprocess sibling. */
function preprocessNode(execution: any) {
  return Array.from(execution.children.values()).find((child: any) =>
    String(child.id).endsWith('/seq-0'),
  );
}

describe('resolveSynthesizeAssetPacksMode precedence', () => {
  it('resolves the explicit input mode first (case-insensitive)', () => {
    expect(resolveSynthesizeAssetPacksMode({ mode: 'deposit' })).toBe('deposit');
    expect(resolveSynthesizeAssetPacksMode({ mode: ' DEPOSIT ' })).toBe('deposit');
    expect(resolveSynthesizeAssetPacksMode({ mode: 'read' })).toBe('read');
  });

  it('falls back through the synthesisMode / synthesizeMode / lens aliases', () => {
    expect(resolveSynthesizeAssetPacksMode({ synthesisMode: 'deposit' })).toBe('deposit');
    expect(resolveSynthesizeAssetPacksMode({ synthesizeMode: 'deposit' })).toBe('deposit');
    expect(resolveSynthesizeAssetPacksMode({ lens: 'deposit' })).toBe('deposit');
    // mode wins over the aliases.
    expect(resolveSynthesizeAssetPacksMode({ mode: 'read', lens: 'deposit' })).toBe('read');
  });

  it('ignores invalid values and falls back to the stored execution mode, then read', () => {
    const execution = new Execution('mode-precedence');
    expect(resolveSynthesizeAssetPacksMode({ mode: 'bogus' }, execution)).toBe('read');

    storeSynthesizeAssetPacksMode(execution, 'deposit');
    expect(resolveSynthesizeAssetPacksMode({ mode: 'bogus' }, execution)).toBe('deposit');
    expect(resolveSynthesizeAssetPacksMode({}, execution)).toBe('deposit');
    // …but a valid input mode still wins over the stored one.
    expect(resolveSynthesizeAssetPacksMode({ mode: 'read' }, execution)).toBe('read');
    // And the stored mode resolves from descendant (phase sibling) nodes too.
    expect(resolveSynthesizeAssetPacksMode({}, execution.child('seq-2'))).toBe('deposit');
  });
});

describe('deposit-mode preprocess context assembly', () => {
  beforeEach(() => {
    depositorySearchMock.mockClear();
  });

  it('assembles the deposit context from a synthetic depositor request', async () => {
    const execution = new PipelineExecution('pipeline:deposit-preprocess-assembly');
    const input = {
      mode: 'deposit',
      repositoryUrl: 'https://github.com/octo/repo-x',
      repository: { owner: 'octo', repo: 'repo-x' },
      sourceBranch: 'dev',
      sourceCommit: 'abc123def456',
      obfuscations: { rules: [{ match: 'src/secret/**', action: 'redact' }] },
      protectedIpExclusions: ['src/secret/**'],
      demandContext: [{ topic: 'terminal reads', demand: 'high' }],
      inventory: { assetCount: 2 },
    };

    await synthesizeAssetPacksPipeline(input, execution);

    // F20: the mode lives on the SHARED outer execution, resolvable from any
    // phase sibling via the upward walk.
    expect(synthesizeAssetPacksModeFromExecution(execution)).toBe('deposit');
    expect(synthesizeAssetPacksModeFromExecution(execution.child('probe'))).toBe('deposit');

    // CROSS-PHASE LAW: the deposit data plane lands on the SHARED execution
    // (the node the route holds), NOT on the isolated seq-0 preprocess sibling.
    const seq0 = preprocessNode(execution);
    expect(seq0).toBeDefined();
    expect(seq0.get('deposit', 'repository')).toBeUndefined();

    // Repository coordinates are normalized through the documented fallbacks:
    // url <- repositoryUrl, name <- repo, branch <- sourceBranch,
    // commit <- sourceCommit, fullName <- owner/name.
    expect(execution.get('deposit', 'repository')).toEqual({
      url: 'https://github.com/octo/repo-x',
      owner: 'octo',
      name: 'repo-x',
      branch: 'dev',
      commit: 'abc123def456',
      fullName: 'octo/repo-x',
    });

    // Depositor steering is persisted for the SDIVF phases — on the SHARED
    // execution, resolvable from every phase sibling via the upward walk.
    expect(execution.get('deposit', 'obfuscations')).toEqual(input.obfuscations);
    expect(execution.get('deposit', 'protectedIpExclusions')).toEqual(['src/secret/**']);
    expect(execution.get('deposit', 'demandContext')).toEqual([{ topic: 'terminal reads', demand: 'high' }]);
    expect(execution.get('deposit', 'inventory')).toEqual({ assetCount: 2 });
    expect(execution.get('pipeline', 'synthesizeMode')).toBe('deposit');
    expect(execution.get('pipeline', 'input')).toBe(input);
    // Consumer resolution from a phase sibling's subtree.
    expect(execution.child('probe').findUp('deposit', 'inventory')).toEqual({ assetCount: 2 });

    // The preprocessed route snapshot is written for the serving surface.
    expect(execution.get('route/preprocessed', 'assetPackWrittenAsset')).toMatchObject({
      semanticKind: 'asset-pack-written-asset',
      repository: expect.objectContaining({ name: 'repo-x', branch: 'dev' }),
    });

    // The threading contract: preprocess returns/mutates the SAME input object
    // the phases receive, carrying the resolved mode + merged repository.
    expect(input.synthesizeMode).toBe('deposit');
    expect(input.repository).toMatchObject({ owner: 'octo', fullName: 'octo/repo-x', commit: 'abc123def456' });

    // Deposit skips the read-lens depository search entirely.
    expect(depositorySearchMock).not.toHaveBeenCalled();
  });

  it('honors an explicit repositoryFullName over the owner/name join', async () => {
    const execution = new PipelineExecution('pipeline:deposit-preprocess-fullname');
    const input = {
      mode: 'deposit',
      repositoryFullName: 'engineeredsoftware/ENGI',
      repository: {
        url: 'https://github.com/engineeredsoftware/ENGI',
        owner: 'engineeredsoftware',
        name: 'ENGI',
        branch: 'main',
      },
    };

    await synthesizeAssetPacksPipeline(input, execution);

    expect(execution.get('deposit', 'repository')).toMatchObject({
      url: 'https://github.com/engineeredsoftware/ENGI',
      owner: 'engineeredsoftware',
      name: 'ENGI',
      branch: 'main',
      fullName: 'engineeredsoftware/ENGI',
    });
    // Steering fields default without throwing when the depositor omits them.
    expect(execution.get('deposit', 'obfuscations')).toBeNull();
    expect(execution.get('deposit', 'protectedIpExclusions')).toEqual([]);
    expect(execution.get('deposit', 'demandContext')).toEqual([]);
    expect(execution.get('deposit', 'inventory')).toBeUndefined();
  });

  it('read mode keeps the read-lens preprocess: depository search runs, no deposit stores', async () => {
    const execution = new PipelineExecution('pipeline:read-preprocess-lens');
    const input = {
      mode: 'read',
      read: 'Determine whether the deposited repository satisfies Terminal Read/Fit QA.',
      repository: { owner: 'octo', name: 'repo-x', branch: 'main' },
    };

    await synthesizeAssetPacksPipeline(input, execution);

    expect(synthesizeAssetPacksModeFromExecution(execution)).toBe('read');
    expect(depositorySearchMock).toHaveBeenCalledTimes(1);

    expect(execution.get('deposit', 'repository')).toBeUndefined();
    // The read-lens preprocess products land on the SHARED execution too.
    expect(execution.get('pipeline', 'expressedRead')).toContain('Terminal Read/Fit QA');
    expect(execution.get('read/need', 'current')).toBeDefined();
  });
});
