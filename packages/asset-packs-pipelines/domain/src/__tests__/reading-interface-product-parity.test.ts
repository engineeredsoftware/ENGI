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
  buildReadingInterfaceProductParity,
  persistReadingInterfaceProductParity,
  summarizeReadingInterfaceProductParity,
  assertReadingInterfaceProductParitySourceSafe,
  READING_INTERFACE_PRODUCT_PARITY_SURFACES,
} from '../reading-interface-product-parity';
import {
  buildReadingOperationalTelemetryRepairReadback,
} from '../reading-operational-telemetry-repair-readback';

const sourceRevision = {
  repositoryFullName: 'engineeredsoftware/ENGI',
  branch: 'main',
  commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
};

const readInput = {
  read: {
    id: 'read-gate9',
    prompt:
      'Request a Reading flow that reviews a synthesized Need, finds many fits, previews the AssetPack, settles, and delivers only after BTD rights transfer.',
  },
  sourceRevision,
  targetArtifactKinds: ['asset-pack', 'rights-receipt', 'pull-request'],
  closureCriteria: [
    'Conversation delegates to Terminal Reading authority.',
    'API, MCP, ChatGPT App, and package consumers cannot bypass accepted Need, settlement, rights, or delivery boundaries.',
  ],
};

function depositoryAsset(assetId: string): DepositoryAsset {
  return {
    assetId,
    title: 'Interface parity ready fit deposit',
    summary:
      'Source-safe summary for Reading interface parity, accepted Need gating, preview, settlement, BTD rights, and delivery.',
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
          'interface parity accepted Need Finding Fits source-safe preview settlement BTD rights delivery no bypass',
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
      depositoryAsset('fit-deposit-interface-1'),
      depositoryAsset('fit-deposit-interface-2'),
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
    pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/409',
    createdAt: '2026-05-23T00:00:00.000Z',
  });
  const settlementBoundary = buildAssetPackSettlementRightsDeliveryBoundary({
    previewBoundary,
    readerWalletId: 'reader-wallet-gate9',
    depositorWalletId: 'depositor-wallet-gate9',
    pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/409',
    createdAt: '2026-05-23T00:00:00.000Z',
  });
  const operationalReadback = buildReadingOperationalTelemetryRepairReadback({
    runId: 'reading-interface-gate9',
    readNeedRuntime,
    readFitsRuntime,
    previewBoundary,
    settlementBoundary,
    createdAt: '2026-05-23T00:00:00.000Z',
  });

  return { readNeedRuntime, readFitsRuntime, previewBoundary, settlementBoundary, operationalReadback };
}

describe('Reading interface product parity', () => {
  it('binds Conversation, API, MCP, ChatGPT App, and package consumers to Terminal Reading authority', async () => {
    const parity = buildReadingInterfaceProductParity(await settledInputs());

    expect(parity).toMatchObject({
      schema: 'bitcode.reading.interface-product-parity',
      requiredSurfaces: [...READING_INTERFACE_PRODUCT_PARITY_SURFACES],
      missingSurfaces: [],
      noBypassReadback: {
        allSurfacesUseTerminalAuthority: true,
        allSourceBearingDeliveryLockedBeforeSettlement: true,
        packageConsumersReadContractsOnly: true,
      },
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawProtectedPromptVisible: false,
        rawProviderResponseVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
    });
    expect(parity.rows.map((row) => row.surface).sort()).toEqual(
      [...READING_INTERFACE_PRODUCT_PARITY_SURFACES].sort(),
    );
    for (const row of parity.rows) {
      expect(row.sameAuthorityAsTerminal).toBe(true);
      expect(row.parallelAuthorityCreated).toBe(false);
      expect(row.stageContract).toMatchObject({
        acceptedNeedRequired: true,
        findingFitsRequiresAcceptedNeed: true,
        sourceSafePreviewOnlyBeforeSettlement: true,
        settlementUnlockRequiredForSource: true,
        btdRightsRequiredForDelivery: true,
        deliveryRequiresAuthorizedMechanism: true,
        sourceBearingDeliveryAllowedBeforeSettlement: false,
        sourceBearingDeliveryAllowedWithoutBtdRights: false,
      });
      expect(row.noBypassReadback).toMatchObject({
        acceptedNeedGate: 'denied_without_accepted_need',
        sourceSafePreview: 'source_safe_metadata_only_before_settlement',
        deliveryBoundary: 'source_bearing_delivery_locked_until_settlement_and_rights',
      });
      expect(row.sourceSafety).toMatchObject({
        protectedSourcePayloadSerialized: false,
        unpaidAssetPackSourceVisible: false,
      });
    }
    expect(parity.rows.find((row) => row.surface === 'conversation')).toMatchObject({
      authorityMode: 'terminal-delegated-handoff',
      ownerPackage: 'uapi/app/conversations',
      entrypoint: 'conversation.terminal-reading-handoff',
    });
    expect(parity.rows.find((row) => row.surface === 'package_consumer')).toMatchObject({
      authorityMode: 'package-contract-readback',
    });
    assertReadingInterfaceProductParitySourceSafe(parity);
  });

  it('preserves BTD rights and interface contract roots without exposing unpaid source', async () => {
    const parity = buildReadingInterfaceProductParity(await settledInputs());
    const terminal = parity.rows.find((row) => row.surface === 'terminal');
    const api = parity.rows.find((row) => row.surface === 'public_api');
    const mcp = parity.rows.find((row) => row.surface === 'mcp_api');
    const chatgpt = parity.rows.find((row) => row.surface === 'chatgpt_app');

    expect(terminal?.contractRoots.assetPackRightsContractRoot).toMatch(/^assetpack-rights-interface-contract:/);
    expect(api?.contractRoots.readLicenseContractRoot).toMatch(/^read-license-interface-contract:/);
    expect(mcp?.contractRoots.assetPackRightsContractRoot).toMatch(/^assetpack-rights-interface-contract:/);
    expect(chatgpt?.contractRoots.telemetryHookRoot).toMatch(/^btd-interface-telemetry-proof-hook:/);
    expect(parity.proofRoots).toMatchObject({
      catalogRoot: expect.stringMatching(/^btd-interface-contract-catalog:/),
      readLicenseAssetPackRightsRegistryRoot: expect.stringMatching(/^read-license-assetpack-rights-interface-registry:/),
      telemetryHookRegistryRoot: expect.stringMatching(/^btd-interface-telemetry-proof-hook-registry:/),
      consumerUxProofRoot: expect.stringMatching(/^btd-interface-consumer-ux-regression-proof:/),
      parityRoot: expect.stringMatching(/^sha256:/),
    });
    const serialized = JSON.stringify(parity);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain(`${['sk', 'proj'].join('-')}-`);
    expect(serialized).not.toContain(`${['sb', 'secret'].join('_')}__`);
  });

  it('persists parity rows, no-bypass readback, roots, and source-safety posture on execution storage', async () => {
    const execution = new Execution('reading-interface-gate9-store');
    const parity = buildReadingInterfaceProductParity(await settledInputs());

    persistReadingInterfaceProductParity(execution, parity);

    expect(execution.get('reading/interfaces', 'productParity')).toMatchObject({
      schema: 'bitcode.reading.interface-product-parity',
      parityId: parity.parityId,
    });
    expect(execution.get('reading/interfaces', 'parityRows')).toHaveLength(parity.rows.length);
    expect(execution.get('reading/interfaces', 'noBypassReadback')).toMatchObject({
      acceptedNeedGate: 'denied_without_accepted_need',
      btdRightsDelivery: 'required_before_source_delivery',
    });
    expect(execution.get('reading/interfaces', 'parityRoot')).toBe(parity.proofRoots.parityRoot);
    expect(summarizeReadingInterfaceProductParity(parity)).toMatchObject({
      schema: 'bitcode.reading.interface-product-parity',
      rowCount: parity.rows.length,
      missingSurfaces: [],
      allSurfacesUseTerminalAuthority: true,
      sourceSafeMetadataOnly: true,
    });
  });
});
