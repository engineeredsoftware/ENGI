import { buildAssetPackPreviewBoundary } from '../asset-pack-preview-boundary';
import { buildAssetPackSettlementRightsDeliveryBoundary } from '../asset-pack-settlement-rights-delivery';
import {
  buildDepositoryFitResultEvidence,
  runDepositorySearchForPipelineInput,
  type DepositoryAsset,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-search';
import {
  buildReadFitsFindingRuntime,
  summarizeReadFitsFindingRuntime,
} from '../read-fits-finding-runtime';
import {
  acceptReadNeed,
  admitReadFitsFinding,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';
import {
  READ_FITS_FINDING_SYNTHESIS,
  READ_NEED_COMPREHENSION_SYNTHESIS,
} from '../reading-pipeline-contract';
import {
  buildReadingPipelineObservabilityInventory,
  summarizeReadingPipelineObservabilityCoverage,
} from '../reading-pipeline-observability';

const sourceRevision = {
  repositoryFullName: 'octocat/Spoon-Knife',
  branch: 'main',
  commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
};

const readInput = {
  read: {
    id: 'reading-pipeline-integration-coverage',
    prompt:
      'Understand the enterprise Reading need, find multiple source-bound deposits, synthesize an AssetPack preview, quote BTC settlement, and deliver by pull request only after BTD rights transfer.',
  },
  sourceRevision,
  targetArtifactKinds: ['asset-pack', 'fit-provenance', 'settlement-proof', 'pull-request'],
  closureCriteria: [
    'ReadNeedComprehensionSynthesis returns an accepted source-constrained Need.',
    'ReadFitsFindingSynthesis finds more than one qualifying Depository fit above threshold.',
    'AssetPack preview remains source-safe before BTC settlement.',
    'Settlement transfers BTD rights before full source-bearing pull-request delivery.',
  ],
  failureModes: ['unpaid AssetPack source disclosure', 'single-candidate overfitting', 'missing settlement readback'],
};

function depositoryAsset(assetId: string, title: string): DepositoryAsset {
  return {
    assetId,
    title,
    summary:
      'Source-safe Reading integration deposit for accepted Need comprehension, many-fit Depository search, AssetPack preview, BTC settlement, BTD rights transfer, and pull-request delivery.',
    artifactKind: 'asset-pack',
    repositoryFullName: sourceRevision.repositoryFullName,
    sourceBranch: sourceRevision.branch,
    sourceCommit: sourceRevision.commit,
    contentRoot: `sha256:${assetId}-content`,
    contentUnits: [
      {
        unitId: `${assetId}:unit-1`,
        unitKind: 'asset-pack',
        text:
          'Reading Need Finding Fits Depository search AssetPack preview BTC settlement BTD rights transfer pull request delivery telemetry ledger database storage reconciliation.',
        unitHash: `sha256:${assetId}-unit`,
      },
    ],
    verificationEvidence: {
      proofRoot: `sha256:${assetId}-proof`,
      measurementRoot: `sha256:${assetId}-measurement`,
      reconciliationReadbackRoot: `sha256:${assetId}-reconciliation`,
    },
    hasWalletOrAttestationProof: true,
    hasAssetMeasurementEvidence: true,
  };
}

describe('Reading pipeline integration coverage', () => {
  it('runs the deterministic commercial Reading spine across Need synthesis, Finding Fits, preview, settlement, and observability contracts', async () => {
    const need = acceptReadNeed(
      synthesizeReadNeedForPipelineInput(readInput),
      '2026-05-25T00:00:00.000Z',
    );

    expect(need.inferenceReceipt).toMatchObject({
      schema: 'bitcode.read-need-comprehension-synthesis.inference-receipt',
      pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
      reviewState: 'accepted',
      mode: 'deterministic-fallback',
      phaseIds: [
        'ReadNeedComprehensionSynthesis.request',
        'ReadNeedComprehensionSynthesis.comprehend',
        'ReadNeedComprehensionSynthesis.measure',
        'ReadNeedComprehensionSynthesis.review',
      ],
      sourceSafety: {
        protectedSourceVisible: false,
        rawProviderResponseVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
    });
    expect(need.inferenceReceipt?.ptrrStepIds).toHaveLength(16);
    expect(need.inferenceReceipt?.thinkingsGenerationIds).toHaveLength(48);
    expect(need.reviewState).toBe('accepted');
    expect(need.sourceConstraints.protectedSourceDisclosure).toBe('forbidden_before_settlement');

    const search = await runDepositorySearchForPipelineInput({
      ...readInput,
      acceptedReadNeed: need,
      requireAcceptedReadNeed: true,
      depositoryAssets: [
        depositoryAsset('reading-fit-integration-1', 'Reading pipeline fit one'),
        depositoryAsset('reading-fit-integration-2', 'Reading pipeline fit two'),
      ],
    });
    const fitResult = buildDepositoryFitResultEvidence(search);
    const readFitsRuntime = buildReadFitsFindingRuntime({
      admission: admitReadFitsFinding({ acceptedReadNeed: need, requireAcceptedReadNeed: true }),
      result: search,
      fitResult,
    });

    expect(readFitsRuntime).toMatchObject({
      schema: 'bitcode.read-fits-finding-runtime',
      pipelineName: READ_FITS_FINDING_SYNTHESIS,
      resultState: 'worthy_fit',
      findingFitsAdmission: { admitted: true, blockers: [] },
      sourceSafety: {
        protectedSourceVisible: false,
        rawProviderResponseVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
    });
    expect(readFitsRuntime.searchSummary.fitDepositAssetIds).toEqual([
      'reading-fit-integration-1',
      'reading-fit-integration-2',
    ]);
    expect(readFitsRuntime.telemetryReceipts[0]).toMatchObject({
      phaseIds: expect.arrayContaining(['ReadFitsFindingSynthesis.discovery']),
      toolIds: expect.arrayContaining([
        'ReadFitsFindingSynthesis.tool.lexical-depository-search',
        'ReadFitsFindingSynthesis.tool.vector-depository-search',
      ]),
    });
    expect(readFitsRuntime.telemetryReceipts[0].ptrrStepIds).toHaveLength(32);
    expect(readFitsRuntime.telemetryReceipts[0].thinkingsGenerationIds).toHaveLength(96);
    expect(summarizeReadFitsFindingRuntime(readFitsRuntime).pipelineContract).toMatchObject({
      phaseCount: 7,
      ptrrAgentCount: 8,
      ptrrStepCount: 32,
      thinkingsGenerationCount: 96,
    });

    const previewBoundary = buildAssetPackPreviewBoundary({
      need,
      fitResult,
      pullRequestTarget: 'https://github.com/octocat/Spoon-Knife/pull/505',
      createdAt: '2026-05-25T00:00:00.000Z',
    });
    expect(previewBoundary.sourceSafePreview).toMatchObject({
      schema: 'bitcode.asset-pack.source-safe-preview',
      fit: {
        fitDepositAssetIds: ['reading-fit-integration-1', 'reading-fit-integration-2'],
        scoreBand: 'reviewable',
      },
      disclosurePolicy: {
        protectedSourceDisclosure: 'forbidden_before_settlement',
      },
      unlock: {
        state: 'pending_settlement',
        sourceAvailable: false,
      },
      feeQuote: {
        finalityState: 'preview_not_paid',
        payer: 'reader',
      },
    });

    const settlementBoundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary,
      readerWalletId: 'reader-wallet-v40-gate5',
      depositorWalletId: 'depositor-wallet-v40-gate5',
      pullRequestTarget: 'https://github.com/octocat/Spoon-Knife/pull/505',
      createdAt: '2026-05-25T00:00:00.000Z',
    });
    expect(settlementBoundary).toMatchObject({
      state: 'settlement_delivered',
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        sourceBearingDeliveryUnlockedToReader: true,
        protectedSourcePayloadSerialized: false,
      },
      finalityReceipt: {
        finalityState: 'confirmed',
      },
      deliveryUnlock: {
        state: 'source_bearing_pull_request_ready',
        sourceBearingDeliveryVisibleToReader: true,
      },
      replayReceipt: {
        verified: {
          paymentMatchesQuote: true,
          rightsTransferConfirmed: true,
          deliveryUnlockedOnlyAfterSettlement: true,
          protectedSourcePayloadAbsent: true,
        },
      },
    });

    const observabilityInventory = buildReadingPipelineObservabilityInventory();
    expect(observabilityInventory.totals).toEqual({
      pipelines: 2,
      phases: 11,
      ptrrAgents: 12,
      ptrrSteps: 48,
      thinkingsGenerations: 144,
      promptTemplates: 5,
      thinkingsGenerationPrompts: 432,
      tools: 4,
    });

    const observabilityCoverage = summarizeReadingPipelineObservabilityCoverage([
      { pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS },
      { pipelineName: READ_FITS_FINDING_SYNTHESIS, phaseId: 'ReadFitsFindingSynthesis.discovery' },
      { pipelineName: READ_FITS_FINDING_SYNTHESIS, agentId: 'ReadFitsFindingSynthesis.discovery.finding-fits' },
      { pipelineName: READ_FITS_FINDING_SYNTHESIS, ptrrStepId: 'ReadFitsFindingSynthesis.discovery.finding-fits.try' },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        thinkingsGenerationId:
          'ReadFitsFindingSynthesis.thinkings-generation.discovery.finding-fits.try.prepare-concise-context',
      },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
        promptTemplatePresent: true,
      },
      { tool: 'ReadFitsFindingSynthesis.tool.vector-depository-search' },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
        rawModelResponsePresent: true,
      },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
        parsedTypedOutputPresent: true,
      },
    ]);

    expect(observabilityCoverage).toMatchObject({
      missingRequiredLevels: [],
      promptTelemetryReady: true,
      toolTelemetryReady: true,
      rawOutputTelemetryReady: true,
      parsedOutputTelemetryReady: true,
    });
  });
});
