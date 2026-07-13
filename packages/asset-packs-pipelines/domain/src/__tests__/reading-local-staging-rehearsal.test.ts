import { Execution } from '@bitcode/execution-generics';
import { buildAssetPackPreviewBoundary } from '../asset-pack-preview-boundary';
import { buildAssetPackSettlementRightsDeliveryBoundary } from '../asset-pack-settlement-rights-delivery';
import {
  buildDepositoryFitResultEvidence,
  runDepositorySearchForPipelineInput,
  type DepositoryAsset,
} from '../depository-search';
import { buildReadFitsFindingRuntime } from '../read-fits-finding-runtime';
import { buildReadNeedReviewResynthesisRuntime } from '../read-need-review-resynthesis';
import {
  acceptReadNeed,
  admitReadFitsFinding,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';
import { buildReadingInterfaceProductParity } from '../reading-interface-product-parity';
import { buildReadingOperationalTelemetryRepairReadback } from '../reading-operational-telemetry-repair-readback';
import {
  buildReadingLocalStagingRehearsal,
  persistReadingLocalStagingRehearsal,
  summarizeReadingLocalStagingRehearsal,
  assertReadingLocalStagingRehearsalSourceSafe,
  READING_LOCAL_STAGING_REHEARSAL_STAGE_IDS,
} from '../reading-local-staging-rehearsal';

const sourceRevision = {
  repositoryFullName: 'engineeredsoftware/ENGI',
  branch: 'main',
  commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
};

const readInput = {
  read: {
    id: 'read-gate10',
    prompt:
      'Request a local and staging Reading rehearsal that understands a Need, finds many deposits, previews an AssetPack, settles, and ships a pull request after BTD rights transfer.',
  },
  sourceRevision,
  targetArtifactKinds: ['asset-pack', 'fit-provenance', 'settlement-proof', 'pull-request'],
  closureCriteria: [
    'ReadNeedComprehensionSynthesis produces an accepted Need.',
    'ReadFitsFindingSynthesis finds many Depository fits above threshold.',
    'AssetPack preview remains source-safe until BTC settlement and BTD rights transfer.',
    'Telemetry streaming and ledger/database/storage readback are replayable.',
  ],
};

function depositoryAsset(assetId: string): DepositoryAsset {
  return {
    assetId,
    title: 'Local staging rehearsal fit deposit',
    summary:
      'Source-safe summary for local and staging Reading rehearsal, accepted Need, many fits, preview, settlement, BTD rights transfer, and pull-request delivery.',
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
          'local staging rehearsal accepted Need many fits depository search source-safe preview settlement BTD rights pull request telemetry ledger database storage',
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

async function settledInputs() {
  const need = acceptReadNeed(
    synthesizeReadNeedForPipelineInput(readInput),
    '2026-05-23T00:00:00.000Z',
  );
  const readNeedRuntime = buildReadNeedReviewResynthesisRuntime({
    action: 'accept_read_need',
    readNeed: need,
  });
  const search = await runDepositorySearchForPipelineInput({
    ...readInput,
    acceptedReadNeed: need,
    requireAcceptedReadNeed: true,
    depositoryAssets: [
      depositoryAsset('fit-deposit-rehearsal-1'),
      depositoryAsset('fit-deposit-rehearsal-2'),
      depositoryAsset('fit-deposit-rehearsal-3'),
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
    pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/410',
    createdAt: '2026-05-23T00:00:00.000Z',
  });
  const settlementBoundary = buildAssetPackSettlementRightsDeliveryBoundary({
    previewBoundary,
    readerWalletId: 'reader-wallet-gate10',
    depositorWalletId: 'depositor-wallet-gate10',
    pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/410',
    createdAt: '2026-05-23T00:00:00.000Z',
  });
  const operationalReadback = buildReadingOperationalTelemetryRepairReadback({
    runId: 'reading-rehearsal-gate10',
    readNeedRuntime,
    readFitsRuntime,
    previewBoundary,
    settlementBoundary,
    createdAt: '2026-05-23T00:00:00.000Z',
  });
  const interfaceParity = buildReadingInterfaceProductParity({
    readNeedRuntime,
    readFitsRuntime,
    previewBoundary,
    settlementBoundary,
    operationalReadback,
  });

  return {
    readNeedRuntime,
    readFitsRuntime,
    previewBoundary,
    settlementBoundary,
    operationalReadback,
    interfaceParity,
  };
}

describe('Reading local and staging rehearsal', () => {
  it('covers the five Reading stages across local and staging-testnet with source-safe evidence', async () => {
    const rehearsal = buildReadingLocalStagingRehearsal({
      runId: 'reading-rehearsal-gate10',
      ...(await settledInputs()),
    });

    expect(rehearsal).toMatchObject({
      schema: 'bitcode.reading.local-staging-rehearsal',
      lanes: ['local', 'staging-testnet'],
      stageIds: [...READING_LOCAL_STAGING_REHEARSAL_STAGE_IDS],
      coverage: {
        localLaneCovered: true,
        stagingTestnetLaneCovered: true,
        stagingProjectRef: 'tkpyosihuouusyaxtbau',
        stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
        readNeedComprehensionCovered: true,
        acceptedNeedCovered: true,
        readFitsFindingCovered: true,
        depositoryManyFitsCovered: true,
        sourceSafePreviewCovered: true,
        deterministicQuoteCovered: true,
        telemetryStreamingReadbackCovered: true,
        ledgerDatabaseStorageSynchronized: true,
        postSettlementPullRequestDeliveryCovered: true,
        valueBearingMainnetAdmitted: false,
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawPromptTextSerialized: false,
        rawProviderResponseVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
    });
    expect(Object.values(rehearsal.stageReadback)).toEqual([
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
    ]);
    expect(rehearsal.rows.map((row) => row.rowId)).toEqual(
      expect.arrayContaining([
        'stage:request-read',
        'stage:review-synthesized-need',
        'stage:request-finding-fits',
        'stage:review-assetpack-preview',
        'stage:buy-assetpack-settle',
        'search:depository-many-fits',
        'telemetry:rich-stream-readback',
        'sync:ledger-database-storage-reconciliation',
        'delivery:post-settlement-pull-request',
        'boundary:value-bearing-mainnet-blocked',
      ]),
    );
    expect(rehearsal.rows.every((row) => row.rowRoot.startsWith('sha256:'))).toBe(true);
    assertReadingLocalStagingRehearsalSourceSafe(rehearsal);
  });

  it('persists rehearsal readback, rows, lanes, stages, and proof roots on execution storage', async () => {
    const execution = new Execution('reading-rehearsal-gate10-store');
    const rehearsal = buildReadingLocalStagingRehearsal(await settledInputs());

    persistReadingLocalStagingRehearsal(execution, rehearsal);

    expect(execution.get('reading/rehearsal', 'localStagingRehearsal')).toMatchObject({
      schema: 'bitcode.reading.local-staging-rehearsal',
      rehearsalId: rehearsal.rehearsalId,
    });
    expect(execution.get('reading/rehearsal', 'rehearsalRows')).toHaveLength(rehearsal.rows.length);
    expect(execution.get('reading/rehearsal', 'laneReadback')).toHaveLength(2);
    expect(execution.get('reading/rehearsal', 'stageReadback')).toMatchObject({
      'request-read': 'completed',
      'buy-assetpack-settle': 'completed',
    });
    expect(execution.get('reading/rehearsal', 'rehearsalRoot')).toBe(rehearsal.proofRoots.rehearsalRoot);
    expect(summarizeReadingLocalStagingRehearsal(rehearsal)).toMatchObject({
      schema: 'bitcode.reading.local-staging-rehearsal',
      rowCount: rehearsal.rows.length,
      depositoryManyFitsCovered: true,
      valueBearingMainnetAdmitted: false,
      sourceSafeMetadataOnly: true,
    });
  });
});
