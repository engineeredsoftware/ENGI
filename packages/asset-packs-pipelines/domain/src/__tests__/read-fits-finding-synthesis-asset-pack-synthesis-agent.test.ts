// @ts-nocheck
// Inference is non-configurable: the synthesis agent ALWAYS runs the formal PTRR
// hierarchy with real generation. Determinism comes from mocking the LLM provider
// at the boundary (F26-A), never from a branch inside the agent.
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import runReadFitsFindingSynthesisAssetPackSynthesisAgent from '../agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent';
import { Execution } from '@bitcode/execution-generics';
import { setBoundaryLLMOutput, resetBoundaryLLMOutput } from './support/generic-llms-mock';

describe('runReadFitsFindingSynthesisAssetPackSynthesisAgent', () => {
  afterEach(() => resetBoundaryLLMOutput());

  it('runs the PTRR synthesis agent and recovers Read/delivery context around the boundary-mocked output', async () => {
    setBoundaryLLMOutput({
      summary: 'Boundary-mock AssetPack synthesis summary.',
      assetPackSynthesisArtifacts: {
        summary: 'Boundary-mock synthesis artifacts.',
        proofEvidence: ['Boundary-mock proof evidence.'],
        reviewNotes: ['Boundary-mock review note.'],
      },
      assetPack: {
        proofEvidence: ['Boundary-mock proof evidence.'],
      },
    });

    const root = new Execution('pipeline:asset-pack');
    root.store('read', 'request', {
      prompt: 'Read the deposited source revision for terminal closure.',
    });
    root.store('harness', 'sourceRevision', {
      repositoryFullName: 'octocat/Spoon-Knife',
      branch: 'main',
      commit: 'abc123',
    });
    root.store('fit', 'result', {
      resultState: 'worthy_fit',
      selectedCandidateAssetIds: ['deposit-1'],
      queryRoot: 'sha256:query',
      rankingRoot: 'sha256:ranking',
      embeddingPolicy: { provider: 'openai', model: 'text-embedding-3-small' },
    });
    root.store('pipeline', 'deliveryMechanismTemplate', 'pull-request');

    const phase = root.child('phase:implementation');
    const result = await runReadFitsFindingSynthesisAssetPackSynthesisAgent({ overallComplexity: 'moderate' }, phase);

    // The wrapper recovers the Read and delivery context from execution state and
    // stamps the canonical AssetPack semantics around the real (mocked) output.
    expect(result.assetPack.read).toBe('Read the deposited source revision for terminal closure.');
    expect(result.assetPack.deliveryMechanismTemplate).toBe('pull-request');
    expect(result.writtenAssetType).toBe('read-satisfaction-asset-pack');
    expect(result.semanticKind).toBe('asset-pack-written-asset');
    expect(result.success).toBe(true);

    // The structured output is sourced from the boundary-mocked generation.
    expect(result.summary).toBe('Boundary-mock AssetPack synthesis summary.');
    expect(result.assetPackSynthesisArtifacts.summary).toBe('Boundary-mock synthesis artifacts.');

    // The wrapper stores the synthesized AssetPack evidence for downstream phases
    // on the SHARED (root) execution (cross-phase store-visibility law) — the
    // Finish sibling resolves it via the upward walk, never off the producer's
    // own phase subtree.
    expect(root.get('implementation', 'assetPack')).toMatchObject({
      read: 'Read the deposited source revision for terminal closure.',
      writtenAssetType: 'read-satisfaction-asset-pack',
    });
    expect(root.get('implementation', 'summary')).toBe('Boundary-mock AssetPack synthesis summary.');
    expect(root.child('phase:finish').findUp('implementation', 'summary')).toBe(
      'Boundary-mock AssetPack synthesis summary.',
    );
  }, 30000);
});
