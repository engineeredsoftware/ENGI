// @ts-nocheck
import { buildAssetPackPostprocessedResult, normalizeAssetPackOutput } from '../postprocess';
import { Execution } from '@bitcode/execution-generics';
import { acceptReadNeed, synthesizeReadNeedForPipelineInput } from '../../../read/src/read-need';

describe('normalizeAssetPackOutput', () => {
  it('backfills filesModified and summary; PR only from settle shippable, never finish/*', () => {
    const exec = new Execution('pipeline:asset-pack');
    // Legacy finish PR keys must not invent a synthesis shippable.
    exec.store('finish', 'pullRequestUrl', 'https://github.com/acme/repo/pull/999');
    exec.store('implementation', 'filesChanged', ['a.ts', 'b.ts']);
    exec.store('pipeline', 'expressedRead', 'Read a repository-backed Fit option set');
    exec.store('pipeline', 'writtenAssetType', 'read-satisfaction-asset-pack');
    exec.store('pipeline', 'deliveryMechanismTemplate', 'pull-request');
    exec.store('implementation', 'assetPackSynthesisArtifacts', {
      summary: 'Implementation-phase AssetPack synthesis artifacts ready.',
      fileChanges: { edited: 2, created: 0, deleted: 0 },
      proofEvidence: ['implementation-store-read'],
      reviewNotes: ['finish must preserve this artifact surface'],
    });

    const output: any = {
      success: true,
      shippable: {},
      artifacts: {},
      summary: ''
    };

    const normalized = normalizeAssetPackOutput(output, exec);
    expect(normalized.shippable?.prUrl).toBeUndefined();
    expect(normalized.deliveryMechanism?.prUrl).toBeUndefined();
    expect(normalized.artifacts.filesModified).toEqual(['a.ts', 'b.ts']);
    expect(normalized.read).toBe('Read a repository-backed Fit option set');
    expect(normalized.writtenAssetType).toBe('read-satisfaction-asset-pack');
    expect(normalized.deliveryMechanismTemplate).toBe('pull-request');
    expect(normalized.assetPackSynthesisArtifacts?.summary).toBe(
      'Implementation-phase AssetPack synthesis artifacts ready.'
    );
    expect(normalized.writtenAssets?.summary).toBe('Implementation-phase AssetPack synthesis artifacts ready.');
    expect(normalized.assetPackSynthesisArtifacts?.proofEvidence).toEqual(['implementation-store-read']);
    expect(normalized.semanticKind).toBe('asset-pack-written-asset');
    expect(typeof normalized.summary).toBe('string');
    expect(normalized.summary.length).toBeGreaterThan(0);

    // Settle shippable on EE must not project into synthesis normalize.
    exec.store('settle-asset-pack-pipeline', 'shippable', {
      prUrl: 'https://github.com/acme/repo/pull/123',
    });
    const withSettleKeysPresent = normalizeAssetPackOutput(output, exec);
    expect((withSettleKeysPresent as any).shippable).toBeUndefined();
    expect((withSettleKeysPresent as any).settleDelivery).toBeUndefined();
    expect(withSettleKeysPresent.deliveryMechanism?.prUrl).toBeUndefined();
  });

  it('builds asset-pack semantic mirrors into the postprocessed result', () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('execution', 'id', 'exec-1');
    exec.store('source', 'owner', 'acme');
    exec.store('source', 'name', 'repo');
    exec.store('pipeline', 'expressedRead', 'Read a review-ready written asset');
    exec.store('pipeline', 'writtenAssetType', 'read-satisfaction-asset-pack');
    exec.store('pipeline', 'deliveryMechanismTemplate', 'pull-request');
    exec.store('route/preprocessed', 'assetPackWrittenAsset', {
      read: 'Read a review-ready written asset',
      writtenAssetType: 'read-satisfaction-asset-pack',
      deliveryMechanismTemplate: 'pull-request',
    });
    exec.store('finish/asset_pack_completion', 'assetPackSynthesisArtifacts', {
      summary: 'Finish-preserved AssetPack synthesis artifacts.',
      fileChanges: { edited: 1, created: 1, deleted: 0 },
      proofEvidence: ['finish-summary-read'],
    });

    const result = buildAssetPackPostprocessedResult(exec, {
      success: true,
      summary: 'Written asset ready.',
      writtenAssetType: 'read-satisfaction-asset-pack',
      semanticKind: 'asset-pack-written-asset',
    } as any);

    expect(result.semanticKind).toBe('asset-pack-written-asset');
    // Pure synthesis: not settle_delivery (settle-pipeline exclusive).
    expect(result.kind).toBe('asset_pack_synthesis');
    expect(result.settleDelivery).toBeUndefined();
    expect(result.read).toBe('Read a review-ready written asset');
    expect(result.writtenAssetType).toBe('read-satisfaction-asset-pack');
    expect(result.deliveryMechanismTemplate).toBe('pull-request');
    expect(result.deliveryMechanism).toBeUndefined();
    expect(result.summary).toBe('Finish-preserved AssetPack synthesis artifacts.');
    expect(result.assetPackSynthesisArtifacts?.summary).toBe('Finish-preserved AssetPack synthesis artifacts.');
    expect(result.writtenAssets?.summary).toBe('Finish-preserved AssetPack synthesis artifacts.');
    expect(result.assetPackSynthesisArtifacts?.proofEvidence).toEqual(['finish-summary-read']);
    expect(result.assetPack).toEqual({
      read: 'Read a review-ready written asset',
      writtenAssetType: 'read-satisfaction-asset-pack',
      deliveryMechanismTemplate: 'pull-request',
    });
  });

  it('uses deposit_options kind when productPipeline is deposit synthesis', () => {
    const exec = new Execution('pipeline:synthesize_deposit_asset_packs');
    exec.store('execution', 'id', 'exec-deposit');
    exec.store('pipeline', 'productPipeline', 'synthesize-deposits-asset-packs-pipeline');
    exec.store('finish', 'selectionEnvelope', {
      schema: 'bitcode.deposit.synthesize-asset-packs.selection-envelope',
      options: [{ title: 'opt-a' }],
    });
    exec.store('implementation', 'assetPackSynthesisArtifacts', {
      summary: 'Deposit options ready for selection.',
    });

    const result = buildAssetPackPostprocessedResult(exec, {
      success: true,
      summary: '',
      options: [{ title: 'opt-a' }],
      selectionEnvelope: {
        schema: 'bitcode.deposit.synthesize-asset-packs.selection-envelope',
        options: [{ title: 'opt-a' }],
      },
    } as any);

    expect(result.kind).toBe('deposit_options');
    expect(result.settleDelivery).toBeUndefined();
    expect(result.selectionEnvelope?.options).toHaveLength(1);
    expect(result.summary).toBe('Deposit options ready for selection.');
  });

  it('never prefers finish settleDelivery summary for synthesis (settle-exclusive surface)', () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('implementation', 'assetPackSynthesisArtifacts', {
      summary: 'Authoritative synthesis summary.',
    });
    // Misnamed residual store must not win summary authority.
    exec.store('finish/asset_pack_completion', 'settleDelivery', {
      summary: 'Wrong settle-shaped summary from synthesis Finish.',
      pullRequest: null,
    });

    const result = buildAssetPackPostprocessedResult(exec, {
      success: true,
      summary: '',
    } as any);

    expect(result.summary).toBe('Authoritative synthesis summary.');
    expect(result.kind).not.toBe('settle_delivery');
    expect(result.settleDelivery).toBeUndefined();
  });

  it('preserves implementation artifacts when postprocess runs from a sibling execution node', () => {
    const root = new Execution('pipeline:asset-pack');
    const implementation = root.child('phase:implementation');
    const finish = root.child('phase:finish');
    implementation.store('implementation', 'assetPackSynthesisArtifacts', {
      summary: 'Sibling implementation AssetPack artifacts are authoritative.',
      fileChanges: { edited: 0, created: 1, deleted: 0 },
      proofEvidence: ['sibling-implementation-read'],
    });
    finish.store('finish/asset_pack_completion', 'assetPackSynthesisArtifacts', {
      summary: 'Finish wrapper should not override implementation artifacts.',
      fileChanges: { edited: 0, created: 0, deleted: 0 },
      proofEvidence: ['finish-wrapper'],
    });

    const normalized = normalizeAssetPackOutput({ success: true, summary: '' } as any, finish);
    const result = buildAssetPackPostprocessedResult(finish, normalized);

    expect(normalized.assetPackSynthesisArtifacts?.summary).toBe(
      'Sibling implementation AssetPack artifacts are authoritative.'
    );
    expect(result.summary).toBe('Sibling implementation AssetPack artifacts are authoritative.');
    expect(result.title).toBe('Sibling implementation AssetPack artifacts are authoritative.');
    expect(result.assetPackSynthesisArtifacts?.proofEvidence).toEqual(['sibling-implementation-read']);
  });

  it('never emits settle_delivery / settleDelivery even when settle shippable exists on EE', () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('execution', 'id', 'exec-2');
    exec.store('settle-asset-pack-pipeline', 'shippable', {
      prUrl: 'https://github.com/acme/repo/pull/26',
      optionTitle: 'AssetPack PR',
    });

    const result = buildAssetPackPostprocessedResult(exec, {
      success: true,
      summary: 'Synthesis complete.',
      writtenAsset: {
        title: 'Read satisfaction summary',
      },
      semanticKind: 'asset-pack-written-asset',
    } as any);

    expect(result.title).toBe('Read satisfaction summary');
    expect(result.kind).toBe('asset_pack_synthesis');
    expect(result.kind).not.toBe('settle_delivery' as any);
    expect((result as any).settleDelivery).toBeUndefined();
    expect((result as any).shippable).toBeUndefined();
    expect((result as any).assetPackSettlementRightsDeliveryBoundary).toBeUndefined();
    expect((result as any).assetPackDeliveryUnlock).toBeUndefined();
  });

  it('strips PR fields from deliveryMechanism on synthesis postprocess', () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('execution', 'id', 'exec-2b');

    const result = buildAssetPackPostprocessedResult(exec, {
      success: true,
      summary: 'Synthesis only — no settle.',
      writtenAsset: { title: 'Option set' },
      deliveryMechanism: {
        title: 'Not a settle PR',
        prUrl: 'https://github.com/acme/repo/pull/26',
      },
      semanticKind: 'asset-pack-written-asset',
    } as any);

    expect(result.kind).toBe('asset_pack_synthesis');
    expect(result.settleDelivery).toBeUndefined();
    expect(result.deliveryMechanism?.prUrl).toBeUndefined();
    expect((result.deliveryMechanism as any)?.pullRequest).toBeUndefined();
  });

  it('derives and stores source-safe preview evidence from an accepted Need and Finding Fits result', () => {
    const exec = new Execution('pipeline:asset-pack');
    const acceptedNeed = acceptReadNeed(synthesizeReadNeedForPipelineInput({
      read: {
        id: 'read-1',
        prompt: 'Find deposited source evidence for a source-safe product AssetPack preview.',
      },
      sourceRevision: {
        repositoryFullName: 'octocat/Spoon-Knife',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
    }));
    const fitResult = {
      schema: 'bitcode.asset-pack.fit-result',
      resultState: 'worthy_fit',
      resultReasons: ['Selected 1 proof-bearing fit deposit for this Read.'],
      fitDepositAssetIds: ['fit-deposit-1'],
      selectedCandidateAssetIds: ['fit-deposit-1'],
      queryRoot: 'sha256:query',
      rankingRoot: 'sha256:ranking',
      searchedAssetCount: 1,
      embeddingPolicy: {
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 1536,
      },
      selectionTrace: {
        selectedCandidates: [
          {
            assetId: 'fit-deposit-1',
            scores: { finalScore: 0.84 },
            proofEvidence: { proofRoot: 'sha256:proof' },
          },
        ],
        fitDeposits: [],
        blockedCandidates: [],
        candidateRanking: [],
        rejectedCandidateCount: 0,
      },
    };

    exec.store('read/need', 'accepted', acceptedNeed);
    exec.store('fit', 'result', fitResult);

    const normalized = normalizeAssetPackOutput({
      success: true,
      summary: 'Measured AssetPack preview ready.',
      // prUrl on deliveryMechanism must not become a settle PR target.
      deliveryMechanism: {
        prUrl: 'https://github.com/octocat/Spoon-Knife/pull/28',
      },
    } as any, exec);
    const result = buildAssetPackPostprocessedResult(exec, normalized);

    expect(normalized.sourceSafePreview).toMatchObject({
      schema: 'bitcode.asset-pack.source-safe-preview',
      need: {
        needId: acceptedNeed.needId,
        reviewState: 'accepted',
      },
      fit: {
        resultState: 'worthy_fit',
        fitDepositAssetIds: ['fit-deposit-1'],
        scoreBand: 'high',
      },
    });
    // Synthesis never binds buyer-repo PR targets (settle exclusive).
    expect(normalized.sourceSafePreview.delivery.pullRequestTarget).toBeNull();
    expect((normalized as any).settleDelivery).toBeUndefined();
    expect((normalized as any).shippable).toBeUndefined();
    expect(normalized.feeQuote.quoteRoot).toMatch(/^sha256:/);
    expect(normalized.assetPackDisclosureReview).toMatchObject({
      schema: 'bitcode.asset-pack.disclosure-review',
    });
    expect(result.sourceSafePreview?.roots.previewRoot).toMatch(/^sha256:/);
    expect(result.assetPackDisclosureReview?.roots.reviewRoot).toMatch(/^sha256:/);
    expect(result.feeQuote?.finalityState).toBe('preview_not_paid');
    expect(result.assetPackPreviewBoundary?.schema).toBe('bitcode.asset-pack.preview-boundary');
    expect(result.assetPackQuoteReceipt?.quoteRoot).toBe(result.feeQuote?.quoteRoot);
    // Settlement instructions / delivery posture / rights unlock not projected.
    expect((result as any).assetPackSettlementInstructions).toBeUndefined();
    expect((result as any).assetPackDeliveryPosture).toBeUndefined();
    expect((result as any).assetPackSettlementRightsDeliveryBoundary).toBeUndefined();
    expect((result as any).assetPackDeliveryUnlock).toBeUndefined();
    expect(exec.get('asset-pack/preview', 'sourceSafe')?.previewId).toBe(
      normalized.sourceSafePreview.previewId
    );
    expect(exec.get('asset-pack/preview', 'boundary')?.boundaryId).toBe(
      (normalized as any).assetPackPreviewBoundary?.boundaryId
    );
    expect(JSON.stringify(normalized.sourceSafePreview)).not.toContain('diff --git');
  });
});
