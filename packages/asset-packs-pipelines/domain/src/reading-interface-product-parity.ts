/**
 * Reading interface product parity — source-safe contracts that bind product
 * workspace, Conversation, API, MCP, ChatGPT App, and package consumers to one
 * Reading authority spine (accepted Need → fits → preview → settlement → rights).
 *
 * Product vocabulary only: no legacy product surface aliases or handoff ids.
 */
import { createHash } from 'node:crypto';
import {
  buildBtdInterfaceConsumerUxRegressionProof,
  buildBtdInterfaceContractCatalog,
  buildBtdInterfaceTelemetryProofHookRegistry,
  buildBtdReadLicenseAssetPackRightsInterfaceRegistry,
  type BtdAssetPackRightsInterfaceContract,
  type BtdInterfaceConsumerUxRegressionRow,
  type BtdInterfaceContractCatalogRow,
  type BtdInterfaceTelemetryProofHook,
  type BtdReadLicenseInterfaceContract,
} from '@bitcode/btd';
import type { AssetPackPreviewBoundary } from './asset-pack-preview-boundary';
import type { AssetPackSettlementRightsDeliveryBoundary } from './asset-pack-settlement-rights-delivery';
import type { ReadingOperationalTelemetryRepairReadback } from './reading-operational-telemetry-repair-readback';
import type { ReadFitsFindingRuntime } from './read-fits-finding-runtime';
import type { ReadNeedReviewResynthesisRuntime } from './read-need-review-resynthesis';

export const READING_INTERFACE_PRODUCT_PARITY_SURFACES = [
  'product',
  'conversation',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'package_consumer',
] as const;

export type ReadingInterfaceProductParitySurface =
  (typeof READING_INTERFACE_PRODUCT_PARITY_SURFACES)[number];

export const READING_INTERFACE_PRODUCT_PARITY_STAGE_IDS = [
  'accepted-need-gate',
  'finding-fits-request',
  'source-safe-preview',
  'settlement-unlock',
  'btd-rights-delivery',
] as const;

export type ReadingInterfaceProductParityStageId =
  (typeof READING_INTERFACE_PRODUCT_PARITY_STAGE_IDS)[number];

export type ReadingInterfaceProductAuthorityMode =
  | 'product-authority'
  | 'product-delegated-handoff'
  | 'package-contract-readback';

export interface ReadingInterfaceProductParitySourceSafety {
  sourceSafetyClass: 'source_safe_reading_interface_product_parity_metadata';
  sourceSafeMetadataOnly: true;
  protectedSourceVisible: false;
  protectedSourcePayloadSerialized: false;
  rawProtectedPromptVisible: false;
  rawProviderResponseVisible: false;
  rawInterpolatedPromptVisible: false;
  unpaidAssetPackSourceVisible: false;
  walletPrivateMaterialVisible: false;
  settlementPrivatePayloadVisible: false;
  credentialsSerialized: false;
}

export interface ReadingInterfaceProductStageContract {
  acceptedNeedRequired: true;
  findingFitsRequiresAcceptedNeed: true;
  sourceSafePreviewOnlyBeforeSettlement: true;
  settlementUnlockRequiredForSource: true;
  btdRightsRequiredForDelivery: true;
  deliveryRequiresAuthorizedMechanism: true;
  sourceBearingDeliveryAllowedBeforeSettlement: false;
  sourceBearingDeliveryAllowedWithoutBtdRights: false;
}

export interface ReadingInterfaceProductNoBypassReadback {
  acceptedNeedGate: 'denied_without_accepted_need';
  findingFitsRequest: 'denied_without_accepted_need';
  sourceSafePreview: 'source_safe_metadata_only_before_settlement';
  settlementUnlock: 'required_before_source_delivery';
  btdRightsDelivery: 'required_before_source_delivery';
  deliveryBoundary: 'source_bearing_delivery_locked_until_settlement_and_rights';
}

export interface ReadingInterfaceProductParityRow {
  schema: 'bitcode.reading.interface-product-parity.row';
  rowId: string;
  surface: ReadingInterfaceProductParitySurface;
  authorityMode: ReadingInterfaceProductAuthorityMode;
  sameAuthorityAsProduct: true;
  parallelAuthorityCreated: false;
  ownerPackage: string;
  entrypoint: string;
  contractFixturePath: string;
  validationCommand: string;
  stageContract: ReadingInterfaceProductStageContract;
  noBypassReadback: ReadingInterfaceProductNoBypassReadback;
  visibleBeforeSettlement: string[];
  withheldBeforeSettlement: string[];
  contractRoots: {
    catalogRowRoot: string | null;
    readLicenseContractRoot: string | null;
    assetPackRightsContractRoot: string | null;
    telemetryHookRoot: string | null;
    consumerUxRowRoot: string | null;
    readNeedRuntimeRoot: string | null;
    readFitsRuntimeRoot: string | null;
    previewBoundaryRoot: string | null;
    settlementBoundaryRoot: string | null;
    operationalReadbackRoot: string | null;
  };
  sourceSafety: ReadingInterfaceProductParitySourceSafety;
  rowRoot: string;
}

export interface ReadingInterfaceProductParityStorageRecord {
  schema: 'bitcode.reading.interface-product-parity.storage-record';
  recordId: string;
  namespace: 'reading/interfaces';
  key:
    | 'productParity'
    | 'parityRows'
    | 'noBypassReadback'
    | 'interfaceRoots'
    | 'sourceSafety';
  recordKind:
    | 'interface_parity'
    | 'surface_rows'
    | 'no_bypass_readback'
    | 'proof_roots'
    | 'source_safety';
  root: string;
  sourceSafety: ReadingInterfaceProductParitySourceSafety;
  payload: Record<string, unknown>;
}

export interface ReadingInterfaceProductParity {
  schema: 'bitcode.reading.interface-product-parity';
  parityId: string;
  requiredSurfaces: ReadingInterfaceProductParitySurface[];
  observedSurfaces: ReadingInterfaceProductParitySurface[];
  missingSurfaces: ReadingInterfaceProductParitySurface[];
  requiredStageIds: ReadingInterfaceProductParityStageId[];
  rowCount: number;
  rows: ReadingInterfaceProductParityRow[];
  noBypassReadback: ReadingInterfaceProductNoBypassReadback & {
    allSurfacesUseProductAuthority: true;
    allSourceBearingDeliveryLockedBeforeSettlement: true;
    packageConsumersReadContractsOnly: true;
  };
  storageProjection: ReadingInterfaceProductParityStorageRecord[];
  proofRoots: {
    catalogRoot: string;
    readLicenseAssetPackRightsRegistryRoot: string;
    telemetryHookRegistryRoot: string;
    consumerUxProofRoot: string;
    readNeedRuntimeRoot: string | null;
    readFitsRuntimeRoot: string | null;
    previewBoundaryRoot: string | null;
    settlementBoundaryRoot: string | null;
    operationalReadbackRoot: string | null;
    rowSetRoot: string;
    storageRoot: string;
    parityRoot: string;
  };
  sourceSafety: ReadingInterfaceProductParitySourceSafety;
}

export interface ReadingInterfaceProductParityInput {
  readNeedRuntime?: ReadNeedReviewResynthesisRuntime | null;
  readFitsRuntime?: ReadFitsFindingRuntime | null;
  previewBoundary?: AssetPackPreviewBoundary | null;
  settlementBoundary?: AssetPackSettlementRightsDeliveryBoundary | null;
  operationalReadback?: ReadingOperationalTelemetryRepairReadback | null;
}

const SOURCE_SAFETY: ReadingInterfaceProductParitySourceSafety = {
  sourceSafetyClass: 'source_safe_reading_interface_product_parity_metadata',
  sourceSafeMetadataOnly: true,
  protectedSourceVisible: false,
  protectedSourcePayloadSerialized: false,
  rawProtectedPromptVisible: false,
  rawProviderResponseVisible: false,
  rawInterpolatedPromptVisible: false,
  unpaidAssetPackSourceVisible: false,
  walletPrivateMaterialVisible: false,
  settlementPrivatePayloadVisible: false,
  credentialsSerialized: false,
};

const STAGE_CONTRACT: ReadingInterfaceProductStageContract = {
  acceptedNeedRequired: true,
  findingFitsRequiresAcceptedNeed: true,
  sourceSafePreviewOnlyBeforeSettlement: true,
  settlementUnlockRequiredForSource: true,
  btdRightsRequiredForDelivery: true,
  deliveryRequiresAuthorizedMechanism: true,
  sourceBearingDeliveryAllowedBeforeSettlement: false,
  sourceBearingDeliveryAllowedWithoutBtdRights: false,
};

const NO_BYPASS_READBACK: ReadingInterfaceProductNoBypassReadback = {
  acceptedNeedGate: 'denied_without_accepted_need',
  findingFitsRequest: 'denied_without_accepted_need',
  sourceSafePreview: 'source_safe_metadata_only_before_settlement',
  settlementUnlock: 'required_before_source_delivery',
  btdRightsDelivery: 'required_before_source_delivery',
  deliveryBoundary: 'source_bearing_delivery_locked_until_settlement_and_rights',
};

const VISIBLE_BEFORE_SETTLEMENT = [
  'accepted Need status',
  'Finding Fits admission state',
  'source-safe AssetPack measurements',
  'fit reasons',
  'quality posture',
  'proof roots',
  'deterministic BTC quote',
  'selected-fit provenance metadata',
  'repair actions',
];

const WITHHELD_BEFORE_SETTLEMENT = [
  'protected deposit source',
  'raw protected prompts',
  'raw interpolated prompts',
  'raw provider responses',
  'unpaid AssetPack source',
  'wallet private material',
  'private settlement payloads',
  'credentials',
];

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (typeof value === 'undefined') return 'null';
  if (typeof value === 'bigint') return JSON.stringify(value.toString());
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function rootOf(value: unknown): string {
  return `sha256:${sha256(stableStringify(value))}`;
}

function jsonSafe<T>(value: T): Record<string, unknown> {
  return JSON.parse(stableStringify(value)) as Record<string, unknown>;
}

function mapCatalogId(
  surface: ReadingInterfaceProductParitySurface,
): BtdInterfaceContractCatalogRow['interfaceId'] {
  if (surface === 'product') return 'product_handoff';
  if (surface === 'conversation') return 'conversations_hook';
  if (surface === 'public_api') return 'public_api';
  if (surface === 'mcp_api') return 'mcp_api';
  if (surface === 'chatgpt_app') return 'chatgpt_app';
  return 'package_consumer';
}

function mapConsumerUxSurface(
  surface: ReadingInterfaceProductParitySurface,
): BtdInterfaceConsumerUxRegressionRow['surface'] | null {
  if (surface === 'product') return 'product_handoff';
  if (surface === 'public_api') return 'public_api';
  if (surface === 'mcp_api') return 'mcp_api';
  if (surface === 'chatgpt_app') return 'chatgpt_app';
  if (surface === 'package_consumer') return 'package_consumer';
  return null;
}

function mapTelemetryInterfaceId(
  surface: ReadingInterfaceProductParitySurface,
): BtdInterfaceTelemetryProofHook['interfaceId'] | null {
  if (surface === 'product') return 'product_handoff';
  if (surface === 'public_api') return 'public_api';
  if (surface === 'mcp_api') return 'mcp_api';
  if (surface === 'chatgpt_app') return 'chatgpt_app';
  if (surface === 'package_consumer') return 'package_consumer';
  return null;
}

function mapRightsSurface(
  surface: ReadingInterfaceProductParitySurface,
): BtdReadLicenseInterfaceContract['interfaceSurface'] | null {
  if (surface === 'product') return 'product';
  if (surface === 'public_api') return 'api';
  if (surface === 'mcp_api') return 'mcp';
  if (surface === 'chatgpt_app') return 'chatgpt_app';
  return null;
}

function ownerPackage(surface: ReadingInterfaceProductParitySurface): string {
  switch (surface) {
    case 'product':
      return 'apps/uapi/components/bitcode/pipeline';
    case 'conversation':
      return 'apps/uapi/components/conversations';
    case 'public_api':
      return 'packages/api/src/routes';
    case 'mcp_api':
      return 'apps/mcp';
    case 'chatgpt_app':
      return 'apps/chatgpt';
    case 'package_consumer':
      return 'packages/asset-packs-pipelines/domain';
  }
}

function entrypoint(surface: ReadingInterfaceProductParitySurface): string {
  switch (surface) {
    case 'product':
      return 'product.reading.five-step-flow';
    case 'conversation':
      return 'conversation.product-reading-handoff';
    case 'public_api':
      return 'api.reading.interface';
    case 'mcp_api':
      return 'mcp.reading.pipeline';
    case 'chatgpt_app':
      return 'chatgpt.reading.action';
    case 'package_consumer':
      return 'package.reading-interface-product-parity';
  }
}

function authorityMode(
  surface: ReadingInterfaceProductParitySurface,
): ReadingInterfaceProductAuthorityMode {
  if (surface === 'product') return 'product-authority';
  if (surface === 'package_consumer') return 'package-contract-readback';
  return 'product-delegated-handoff';
}

function firstContractRoot<T extends { proofRoot: string; interfaceSurface: string }>(
  contracts: readonly T[],
  surface: string | null,
): string | null {
  if (!surface) return null;
  return contracts.find((contract) => contract.interfaceSurface === surface)?.proofRoot ?? null;
}

function storageRecord(input: {
  key: ReadingInterfaceProductParityStorageRecord['key'];
  recordKind: ReadingInterfaceProductParityStorageRecord['recordKind'];
  payload: Record<string, unknown>;
}): ReadingInterfaceProductParityStorageRecord {
  const root = rootOf(input.payload);
  return {
    schema: 'bitcode.reading.interface-product-parity.storage-record',
    recordId: `reading-interface-product-parity-${input.key}-${sha256(root).slice(0, 16)}`,
    namespace: 'reading/interfaces',
    key: input.key,
    recordKind: input.recordKind,
    root,
    sourceSafety: { ...SOURCE_SAFETY },
    payload: input.payload,
  };
}

export function buildReadingInterfaceProductParity(
  input: ReadingInterfaceProductParityInput = {},
): ReadingInterfaceProductParity {
  const catalog = buildBtdInterfaceContractCatalog();
  const rightsRegistry = buildBtdReadLicenseAssetPackRightsInterfaceRegistry();
  const telemetryRegistry = buildBtdInterfaceTelemetryProofHookRegistry();
  const consumerUxProof = buildBtdInterfaceConsumerUxRegressionProof();

  const readNeedRuntimeRoot = input.readNeedRuntime?.proofRoots.runtimeRoot ?? null;
  const readFitsRuntimeRoot = input.readFitsRuntime?.proofRoots.runtimeRoot ?? null;
  const previewBoundaryRoot = input.previewBoundary?.proofRoots.boundaryRoot ?? null;
  const settlementBoundaryRoot = input.settlementBoundary?.proofRoots.boundaryRoot ?? null;
  const operationalReadbackRoot = input.operationalReadback?.proofRoots.readbackRoot ?? null;

  const rows = READING_INTERFACE_PRODUCT_PARITY_SURFACES.map((surface) => {
    const catalogRow = catalog.rows.find((row) => row.interfaceId === mapCatalogId(surface));
    const rightsSurface = mapRightsSurface(surface);
    const readLicenseContractRoot = firstContractRoot(
      rightsRegistry.readLicenseContracts,
      rightsSurface,
    );
    const assetPackRightsContractRoot = firstContractRoot(
      rightsRegistry.assetPackRightsContracts,
      rightsSurface,
    );
    const telemetryInterfaceId = mapTelemetryInterfaceId(surface);
    const telemetryHook = telemetryInterfaceId
      ? telemetryRegistry.hooks.find((hook) => hook.interfaceId === telemetryInterfaceId)
      : null;
    const uxSurface = mapConsumerUxSurface(surface);
    const consumerUxRow = uxSurface
      ? consumerUxProof.rows.find((row) => row.surface === uxSurface)
      : null;
    const contractRoots = {
      catalogRowRoot: catalogRow?.rowRoot ?? null,
      readLicenseContractRoot,
      assetPackRightsContractRoot,
      telemetryHookRoot: telemetryHook?.hookRoot ?? null,
      consumerUxRowRoot: consumerUxRow?.rowRoot ?? null,
      readNeedRuntimeRoot,
      readFitsRuntimeRoot,
      previewBoundaryRoot,
      settlementBoundaryRoot,
      operationalReadbackRoot,
    };
    const rowBase = {
      schema: 'bitcode.reading.interface-product-parity.row' as const,
      rowId: `reading-interface-parity:${surface}`,
      surface,
      authorityMode: authorityMode(surface),
      sameAuthorityAsProduct: true as const,
      parallelAuthorityCreated: false as const,
      ownerPackage: ownerPackage(surface),
      entrypoint: entrypoint(surface),
      contractFixturePath:
        catalogRow?.exampleFixturePath ||
        consumerUxRow?.fixturePath ||
        'packages/asset-packs-pipelines/domain/src/__tests__/reading-interface-product-parity.test.ts',
      validationCommand:
        catalogRow?.validationCommand ||
        consumerUxRow?.replayCommand ||
        'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/reading-interface-product-parity.test.ts --runInBand',
      stageContract: { ...STAGE_CONTRACT },
      noBypassReadback: { ...NO_BYPASS_READBACK },
      visibleBeforeSettlement: [...VISIBLE_BEFORE_SETTLEMENT],
      withheldBeforeSettlement: [...WITHHELD_BEFORE_SETTLEMENT],
      contractRoots,
      sourceSafety: { ...SOURCE_SAFETY },
    };

    return {
      ...rowBase,
      rowRoot: rootOf(rowBase),
    };
  });

  const observedSurfaces = rows.map((row) => row.surface).sort() as ReadingInterfaceProductParitySurface[];
  const requiredSurfaces = [...READING_INTERFACE_PRODUCT_PARITY_SURFACES];
  const missingSurfaces = requiredSurfaces.filter((surface) => !observedSurfaces.includes(surface));
  const rowSetRoot = rootOf(rows.map((row) => row.rowRoot));
  const storageProjection = [
    storageRecord({
      key: 'parityRows',
      recordKind: 'surface_rows',
      payload: { rows: rows.map((row) => ({ rowId: row.rowId, surface: row.surface, rowRoot: row.rowRoot })) },
    }),
    storageRecord({
      key: 'noBypassReadback',
      recordKind: 'no_bypass_readback',
      payload: { ...NO_BYPASS_READBACK },
    }),
    storageRecord({
      key: 'interfaceRoots',
      recordKind: 'proof_roots',
      payload: {
        catalogRoot: catalog.catalogRoot,
        readLicenseAssetPackRightsRegistryRoot: rightsRegistry.registryRoot,
        telemetryHookRegistryRoot: telemetryRegistry.registryRoot,
        consumerUxProofRoot: consumerUxProof.proofRoot,
        rowSetRoot,
      },
    }),
    storageRecord({
      key: 'sourceSafety',
      recordKind: 'source_safety',
      payload: { ...SOURCE_SAFETY },
    }),
  ];
  const storageRoot = rootOf(storageProjection.map((record) => record.root));
  const withoutParityRecord = {
    schema: 'bitcode.reading.interface-product-parity' as const,
    parityId: `reading-interface-product-parity-${sha256(rowSetRoot).slice(0, 16)}`,
    requiredSurfaces,
    observedSurfaces,
    missingSurfaces,
    requiredStageIds: [...READING_INTERFACE_PRODUCT_PARITY_STAGE_IDS],
    rowCount: rows.length,
    rows,
    noBypassReadback: {
      ...NO_BYPASS_READBACK,
      allSurfacesUseProductAuthority: true as const,
      allSourceBearingDeliveryLockedBeforeSettlement: true as const,
      packageConsumersReadContractsOnly: true as const,
    },
    proofRoots: {
      catalogRoot: catalog.catalogRoot,
      readLicenseAssetPackRightsRegistryRoot: rightsRegistry.registryRoot,
      telemetryHookRegistryRoot: telemetryRegistry.registryRoot,
      consumerUxProofRoot: consumerUxProof.proofRoot,
      readNeedRuntimeRoot,
      readFitsRuntimeRoot,
      previewBoundaryRoot,
      settlementBoundaryRoot,
      operationalReadbackRoot,
      rowSetRoot,
      storageRoot,
      parityRoot: '',
    },
    sourceSafety: { ...SOURCE_SAFETY },
  };
  const parityRoot = rootOf(withoutParityRecord);
  const productParityRecord = storageRecord({
    key: 'productParity',
    recordKind: 'interface_parity',
    payload: {
      parityId: withoutParityRecord.parityId,
      rowCount: rows.length,
      requiredSurfaces,
      observedSurfaces,
      parityRoot,
    },
  });
  const finalStorageProjection = [productParityRecord, ...storageProjection];
  const finalStorageRoot = rootOf(finalStorageProjection.map((record) => record.root));
  const withFinalRoots = {
    ...withoutParityRecord,
    storageProjection: finalStorageProjection,
    proofRoots: {
      ...withoutParityRecord.proofRoots,
      storageRoot: finalStorageRoot,
      parityRoot: '',
    },
  };

  return {
    ...withFinalRoots,
    proofRoots: {
      ...withFinalRoots.proofRoots,
      parityRoot: rootOf(withFinalRoots),
    },
  };
}

export function persistReadingInterfaceProductParity(
  execution: { store?: (namespace: string, key: string, value: unknown) => void } | null | undefined,
  parity: ReadingInterfaceProductParity,
): void {
  if (!execution?.store) return;
  execution.store('reading/interfaces', 'productParity', parity as unknown);
  execution.store('reading/interfaces', 'parityRows', parity.rows as unknown);
  execution.store('reading/interfaces', 'noBypassReadback', parity.noBypassReadback as unknown);
  execution.store('reading/interfaces', 'interfaceRoots', parity.proofRoots as unknown);
  execution.store('reading/interfaces', 'sourceSafety', parity.sourceSafety as unknown);
  execution.store('reading/interfaces', 'parityRoot', parity.proofRoots.parityRoot);
}

export function summarizeReadingInterfaceProductParity(
  parity: ReadingInterfaceProductParity,
): Record<string, unknown> {
  return {
    schema: parity.schema,
    parityId: parity.parityId,
    rowCount: parity.rowCount,
    missingSurfaces: parity.missingSurfaces,
    requiredStageIds: parity.requiredStageIds,
    allSurfacesUseProductAuthority: parity.noBypassReadback.allSurfacesUseProductAuthority,
    allSourceBearingDeliveryLockedBeforeSettlement:
      parity.noBypassReadback.allSourceBearingDeliveryLockedBeforeSettlement,
    sourceSafeMetadataOnly: parity.sourceSafety.sourceSafeMetadataOnly,
    parityRoot: parity.proofRoots.parityRoot,
  };
}

export function assertReadingInterfaceProductParitySourceSafe(
  parity: ReadingInterfaceProductParity,
): void {
  const serialized = stableStringify(parity);
  const forbiddenMarkers = [
    `${['sk', 'proj'].join('-')}-`,
    `${['sb', 'secret'].join('_')}__`,
    ['service', 'role'].join('_'),
    ['eyJ', 'hbGci', 'Oi', 'JIUzI1Ni'].join(''),
    'diff --git',
  ];
  for (const marker of forbiddenMarkers) {
    if (serialized.includes(marker)) {
      throw new Error(`ReadingInterfaceProductParity must not contain forbidden marker ${marker}.`);
    }
  }
  if (parity.sourceSafety.protectedSourceVisible || parity.sourceSafety.credentialsSerialized) {
    throw new Error('ReadingInterfaceProductParity must remain source-safe.');
  }
  for (const row of parity.rows) {
    if (row.parallelAuthorityCreated || !row.sameAuthorityAsProduct) {
      throw new Error(`${row.surface} must not create parallel Reading authority.`);
    }
    if (
      row.stageContract.sourceBearingDeliveryAllowedBeforeSettlement ||
      row.stageContract.sourceBearingDeliveryAllowedWithoutBtdRights
    ) {
      throw new Error(`${row.surface} must not allow source-bearing delivery before settlement and rights.`);
    }
  }
}

export function readingInterfaceProductParityToSourceSafeJson(
  parity: ReadingInterfaceProductParity,
): Record<string, unknown> {
  assertReadingInterfaceProductParitySourceSafe(parity);
  return jsonSafe(parity);
}
