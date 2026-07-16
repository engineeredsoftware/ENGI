import { Execution } from '@bitcode/execution-generics';
import {
  buildAssetPackPreviewBoundary,
} from '../asset-pack-preview-boundary';
import {
  buildAssetPackSettlementRightsDeliveryBoundary,
} from '../asset-pack-settlement-rights-delivery';
import {
  buildDepositoryFitResultEvidence,
  runDepositorySearchForPipelineInput,
  type DepositoryAsset,
} from '../depository-search';
import {
  buildReadFitsFindingRuntime,
} from '../read-fits-finding-runtime';
import {
  buildReadNeedReviewResynthesisRuntime,
} from '../read-need-review-resynthesis';
import {
  acceptReadNeed,
  admitReadFitsFinding,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';
import {
  buildReadingOperationalTelemetryRepairReadback,
  persistReadingOperationalTelemetryRepairReadback,
  summarizeReadingOperationalTelemetryRepairReadback,
} from '../reading-operational-telemetry-repair-readback';

const sourceRevision = {
  repositoryFullName: 'octocat/Spoon-Knife',
  branch: 'main',
  commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
};

const readInput = {
  read: {
    id: 'read-gate8',
    prompt:
      'Find source-bound fit deposits, synthesize an AssetPack preview, settle the BTC fee, and deliver the source-bearing pull request after settlement.',
  },
  sourceRevision,
  targetArtifactKinds: ['asset-pack', 'proof-root', 'settlement-proof', 'pull-request'],
  closureCriteria: [
    'ReadNeedComprehensionSynthesis telemetry is source-safe.',
    'ReadFitsFindingSynthesis telemetry includes phase, agent, PTRR step, Failsafe, ThinkingsGeneration, and tool evidence.',
    'Ledger, wallet, storage, delivery, UI, and repair events are replayable from proof roots.',
  ],
};

function depositoryAsset(assetId: string): DepositoryAsset {
  return {
    assetId,
    title: 'Operational telemetry ready fit deposit',
    summary:
      'Source-safe summary for Reading operational telemetry, proof root readback, settlement, and pull request delivery.',
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
          'Reading telemetry proof root Failsafe ThinkingsGeneration tool storage ledger wallet delivery repair operator readback.',
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

function acceptedNeed() {
  return acceptReadNeed(
    synthesizeReadNeedForPipelineInput(readInput),
    '2026-05-23T00:00:00.000Z',
  );
}

async function settledInputs() {
  const need = acceptedNeed();
  const readNeedRuntime = buildReadNeedReviewResynthesisRuntime({
    action: 'accept_read_need',
    readNeed: need,
  });
  const search = await runDepositorySearchForPipelineInput({
    ...readInput,
    acceptedReadNeed: need,
    requireAcceptedReadNeed: true,
    depositoryAssets: [
      depositoryAsset('fit-deposit-operational-1'),
      depositoryAsset('fit-deposit-operational-2'),
    ],
  });
  const fitResult = buildDepositoryFitResultEvidence(search);
  const readFitsRuntime = buildReadFitsFindingRuntime({
    admission: admitReadFitsFinding({ acceptedReadNeed: need, requireAcceptedReadNeed: true }),
    result: search,
    fitResult,
  });
  const previewBoundary = buildAssetPackPreviewBoundary({
    need,
    fitResult,
    pullRequestTarget: 'https://github.com/octocat/Spoon-Knife/pull/408',
    createdAt: '2026-05-23T00:00:00.000Z',
  });
  const settlementBoundary = buildAssetPackSettlementRightsDeliveryBoundary({
    previewBoundary,
    readerWalletId: 'reader-wallet-gate8',
    depositorWalletId: 'depositor-wallet-gate8',
    pullRequestTarget: 'https://github.com/octocat/Spoon-Knife/pull/408',
    createdAt: '2026-05-23T00:00:00.000Z',
  });

  return { readNeedRuntime, readFitsRuntime, previewBoundary, settlementBoundary };
}

describe('Reading operational telemetry repair readback', () => {
  it('streams source-safe pipeline, tool, storage, ledger, wallet, delivery, UI, and repair events', async () => {
    const input = await settledInputs();
    const readback = buildReadingOperationalTelemetryRepairReadback({
      runId: 'reading-operational-gate8',
      ...input,
      createdAt: '2026-05-23T00:00:00.000Z',
    });

    expect(readback).toMatchObject({
      schema: 'bitcode.reading.operational-telemetry-repair-readback',
      runId: 'reading-operational-gate8',
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        unpaidAssetPackSourceVisible: false,
        walletPrivateMaterialVisible: false,
        credentialsSerialized: false,
      },
      operatorReadback: {
        stageStates: {
          requestRead: 'completed',
          reviewSynthesizedNeed: 'completed',
          requestFindingFits: 'completed',
          reviewAssetPackPreview: 'completed',
          buyAssetPackSettle: 'completed',
        },
        blockers: [],
      },
    });
    expect(Object.keys(readback.operatorReadback.eventCounts).sort()).toEqual([
      'delivery',
      'failsafe',
      'ledger',
      'phase',
      'ptrr-agent',
      'ptrr-step',
      'repair',
      'storage',
      'thinkings-generation',
      'tool',
      'ui',
      'wallet',
    ]);
    for (const count of Object.values(readback.operatorReadback.eventCounts)) {
      expect(count).toBeGreaterThan(0);
    }
    expect(readback.runbookHooks.map((hook) => hook.hookId)).toEqual(
      expect.arrayContaining(['open-rich-execution-log', 'inspect-source-safe-metadata']),
    );
    expect(readback.streamEvents[0].executionState).toMatchObject({
      eventId: expect.stringMatching(/^reading-telemetry-/),
      proofRoot: expect.stringMatching(/^sha256:/),
      promptDisclosurePosture: 'prompt_template_id_only',
      resultDisclosurePosture: 'parsed_result_shape_and_proof_roots_only',
    });
    expect(JSON.stringify(readback)).not.toContain(`${['sk', 'proj'].join('-')}-`);
    expect(JSON.stringify(readback)).not.toContain('diff --git');
    expect(summarizeReadingOperationalTelemetryRepairReadback(readback)).toMatchObject({
      schema: 'bitcode.reading.operational-telemetry-repair-readback',
      eventCount: readback.streamEvents.length,
      blockers: [],
    });
  });

  it('marks settlement finality as repairable and exposes runbook hooks without unlocking source', async () => {
    const input = await settledInputs();
    const settlementBoundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: input.previewBoundary,
      finality: {
        finalityState: 'broadcast',
        confirmations: 0,
        blockHeight: null,
      },
      createdAt: '2026-05-23T00:00:00.000Z',
    });
    const readback = buildReadingOperationalTelemetryRepairReadback({
      runId: 'reading-operational-gate8-finality',
      ...input,
      settlementBoundary,
      createdAt: '2026-05-23T00:00:00.000Z',
    });

    expect(readback.operatorReadback.stageStates.buyAssetPackSettle).toBe('repair-required');
    expect(readback.operatorReadback.blockers).toContain('btc_payment_finality_missing');
    expect(readback.runbookHooks.map((hook) => hook.hookId)).toContain('observe-btc-payment-finality');
    expect(readback.streamEvents.find((event) => event.eventKind === 'wallet')).toMatchObject({
      progress: 'repair-required',
      sourceSafety: { walletPrivateMaterialVisible: false },
    });
  });

  it('persists operator readback, stream events, runbook hooks, and proof roots on execution storage', async () => {
    const execution = new Execution('reading-operational-gate8-store');
    const readback = buildReadingOperationalTelemetryRepairReadback({
      runId: 'reading-operational-gate8-store',
      ...(await settledInputs()),
      createdAt: '2026-05-23T00:00:00.000Z',
    });

    persistReadingOperationalTelemetryRepairReadback(execution, readback);

    expect(execution.get('reading/operational', 'readback')).toMatchObject({
      schema: 'bitcode.reading.operational-telemetry-repair-readback',
      readbackId: readback.readbackId,
    });
    expect(execution.get('reading/operational', 'operatorReadback')).toMatchObject({
      schema: 'bitcode.reading.operational-operator-readback',
    });
    expect(execution.get('reading/operational', 'sourceSafeStreamEvents')).toMatchObject({
      eventCount: readback.streamEvents.length,
    });
    expect(execution.get('reading/operational', 'telemetryRoot')).toBe(readback.proofRoots.telemetryRoot);
  });
});
