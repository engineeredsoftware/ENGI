import { createHash } from 'crypto';
import {
  buildBtdInterfaceAuthorizationPolicy,
  type BtdInterfaceAuthorizationPolicy,
  type BtdInterfaceAuthorizationPolicyInput,
  type BtdInterfaceAuthorizationPolicySurface,
} from './interface-authorization-policy';
import type { BtdOrganizationPermissionAction } from './authority';
import { assertNonEmptyString, assertNonNegativeSafeInteger, assertPositiveSafeInteger } from './constants';
import {
  assertBtdReadReceipt,
  assertBtdRightsTransferReceipt,
  buildBtdReadReceipt,
  buildBtdRightsTransferReceipt,
  type BtdDeliveryAdmissionState,
  type BtdReadReceipt,
  type BtdReadRightState,
  type BtdRightsTransferReceipt,
} from './receipts';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const BTD_READ_LICENSE_INTERFACE_CONTRACT_FIXTURE_IDS = [
  'api-read-license-source-safe-preview',
  'mcp-finding-fits-source-safe-preview',
  'chatgpt-unpaid-delivery-denied',
  'terminal-paid-rights-delivery',
] as const;

export type BtdReadLicenseAssetPackRightsFixtureId =
  (typeof BTD_READ_LICENSE_INTERFACE_CONTRACT_FIXTURE_IDS)[number];

export type BtdReadLicenseInterfaceDecision =
  | 'source_safe_preview_admitted'
  | 'paid_unlock_admitted'
  | 'locked_source_denied';

export type BtdAssetPackRightsInterfaceDecision =
  | 'preview_admitted'
  | 'rights_delivery_admitted'
  | 'rights_delivery_denied';

export type BtdInterfaceRightsContractDenialCode =
  | 'READ_REQUEST_REQUIRED'
  | 'REVIEWED_NEED_REQUIRED'
  | 'FINDING_FITS_REQUIRED'
  | 'SOURCE_SAFE_PREVIEW_REQUIRED'
  | 'FEE_QUOTE_REQUIRED'
  | 'READ_LICENSE_REQUIRED'
  | 'SETTLEMENT_REQUIRED'
  | 'RIGHTS_TRANSFER_REQUIRED'
  | 'DELIVERY_ADMISSION_REQUIRED'
  | 'INTERFACE_AUTHORIZATION_DENIED'
  | 'LOCKED_SOURCE_UNPAID';

export type BtdReadLicensePosture =
  | 'preview_only_not_required'
  | 'owner_read'
  | 'licensed_read'
  | 'missing'
  | 'denied';

export type BtdAssetPackRightsPosture =
  | 'preview_only_locked'
  | 'settlement_pending'
  | 'rights_transferred'
  | 'denied';

export type BtdBtcSettlementFinalityPosture =
  | 'not_required_for_preview'
  | 'quote_pending'
  | 'broadcast_pending'
  | 'confirmed'
  | 'repair_required';

export interface BtdInterfaceFeeQuoteProjection {
  quoteId: string;
  quoteRoot: string;
  sats: bigint | number | string;
  state: 'quoted' | 'accepted' | 'expired' | 'superseded' | 'failed';
}

export interface BtdReadLicenseInterfaceContractInput {
  contractId: string;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  action: BtdOrganizationPermissionAction;
  fixturePath: string;
  readRequestRoot: string;
  reviewedNeedRoot: string;
  findingFitsAdmissionRoot: string;
  sourceSafePreviewRoot: string;
  feeQuote?: BtdInterfaceFeeQuoteProjection | null;
  readReceipt: BtdReadReceipt;
  authorizationPolicy: BtdInterfaceAuthorizationPolicyInput;
  issuedAt?: string;
}

export interface BtdReadLicenseInterfaceContract {
  kind: 'btd.read_license_interface_contract';
  contractId: string;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  action: BtdOrganizationPermissionAction;
  fixturePath: string;
  decision: BtdReadLicenseInterfaceDecision;
  denialCodes: BtdInterfaceRightsContractDenialCode[];
  readRequestRoot: string;
  reviewedNeedRoot: string;
  findingFitsAdmissionRoot: string;
  sourceSafePreviewRoot: string;
  feeQuoteRoot: string | null;
  licensePosture: BtdReadLicensePosture;
  readRightState: BtdReadRightState;
  disclosureState: BtdReadReceipt['disclosureState'];
  deliveryAdmissionState: BtdDeliveryAdmissionState;
  readReceiptRoot: string;
  authorizationPolicyRoot: string;
  protectedSourceVisible: boolean;
  proofRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
  issuedAt: string;
}

export interface BtdAssetPackRightsInterfaceContractInput {
  contractId: string;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  action: BtdOrganizationPermissionAction;
  fixturePath: string;
  assetPackId: string;
  assetPackPreviewRoot: string;
  sourceSafeMeasurementRoot: string;
  rangeStart: number;
  rangeEndExclusive: number;
  feeQuote?: BtdInterfaceFeeQuoteProjection | null;
  settlementRoot?: string | null;
  paidUnlockRoot?: string | null;
  deliveryAdmissionRoot?: string | null;
  readReceipt: BtdReadReceipt;
  rightsTransferReceipt?: BtdRightsTransferReceipt | null;
  authorizationPolicy: BtdInterfaceAuthorizationPolicyInput;
  issuedAt?: string;
}

export interface BtdAssetPackRightsInterfaceContract {
  kind: 'btd.asset_pack_rights_interface_contract';
  contractId: string;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  action: BtdOrganizationPermissionAction;
  fixturePath: string;
  decision: BtdAssetPackRightsInterfaceDecision;
  denialCodes: BtdInterfaceRightsContractDenialCode[];
  assetPackId: string;
  assetPackPreviewRoot: string;
  sourceSafeMeasurementRoot: string;
  rangeStart: number;
  rangeEndExclusive: number;
  tokenCount: number;
  feeQuoteRoot: string | null;
  settlementRoot: string | null;
  paidUnlockRoot: string | null;
  deliveryAdmissionRoot: string | null;
  btcSettlementFinality: BtdBtcSettlementFinalityPosture;
  rightsPosture: BtdAssetPackRightsPosture;
  readRightState: BtdReadRightState;
  deliveryAdmissionState: BtdDeliveryAdmissionState;
  readReceiptRoot: string;
  rightsTransferReceiptRoot: string | null;
  authorizationPolicyRoot: string;
  protectedSourceVisible: boolean;
  proofRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
  issuedAt: string;
}

export interface BtdReadLicenseAssetPackRightsInterfaceFixture {
  fixtureId: BtdReadLicenseAssetPackRightsFixtureId;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  fixturePath: string;
  readLicenseInput: BtdReadLicenseInterfaceContractInput;
  assetPackRightsInput: BtdAssetPackRightsInterfaceContractInput;
  expectedReadLicenseDecision: BtdReadLicenseInterfaceDecision;
  expectedAssetPackRightsDecision: BtdAssetPackRightsInterfaceDecision;
}

export interface BtdReadLicenseAssetPackRightsInterfaceRegistry {
  kind: 'btd.read_license_assetpack_rights_interface_registry';
  schemaId: 'bitcode.readLicenseAssetPackRightsInterfaceRegistry.v1';
  requiredSurfaces: BtdInterfaceAuthorizationPolicySurface[];
  observedSurfaces: BtdInterfaceAuthorizationPolicySurface[];
  missingSurfaces: BtdInterfaceAuthorizationPolicySurface[];
  readLicenseContracts: BtdReadLicenseInterfaceContract[];
  assetPackRightsContracts: BtdAssetPackRightsInterfaceContract[];
  fixtures: BtdReadLicenseAssetPackRightsInterfaceFixture[];
  registryRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const REQUIRED_SURFACES: BtdInterfaceAuthorizationPolicySurface[] = [
  'api',
  'mcp',
  'chatgpt_app',
  'terminal',
];

const SECRET_OR_SOURCE_PATTERNS = [
  new RegExp(`${['sb', 'secret'].join('_')}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\bprivate\s+source\b/iu,
  /\braw\s+source\b/iu,
];

export function buildBtdReadLicenseInterfaceContract(
  input: BtdReadLicenseInterfaceContractInput,
): BtdReadLicenseInterfaceContract {
  const contractId = assertSourceSafeString(input.contractId, 'contractId');
  const issuedAt = assertNonEmptyString(input.issuedAt ?? new Date().toISOString(), 'issuedAt');
  const action = assertSourceSafeAction(input.action);
  const readReceipt = assertBtdReadReceipt(input.readReceipt);
  const authorizationPolicy = buildBtdInterfaceAuthorizationPolicy(input.authorizationPolicy);
  const feeQuoteRoot = normalizeFeeQuote(input.feeQuote)?.quoteRoot ?? null;
  const roots = {
    readRequestRoot: assertSourceSafeString(input.readRequestRoot, 'readRequestRoot'),
    reviewedNeedRoot: assertSourceSafeString(input.reviewedNeedRoot, 'reviewedNeedRoot'),
    findingFitsAdmissionRoot: assertSourceSafeString(input.findingFitsAdmissionRoot, 'findingFitsAdmissionRoot'),
    sourceSafePreviewRoot: assertSourceSafeString(input.sourceSafePreviewRoot, 'sourceSafePreviewRoot'),
  };
  const denialCodes = readLicenseDenials({
    ...roots,
    readReceipt,
    authorizationPolicy,
  });
  const decision = readLicenseDecision(readReceipt, denialCodes);
  const licensePosture = readLicensePosture(readReceipt, authorizationPolicy);
  const withoutRoot = {
    kind: 'btd.read_license_interface_contract' as const,
    contractId,
    interfaceSurface: input.interfaceSurface,
    action,
    fixturePath: assertSourceSafeString(input.fixturePath, 'fixturePath'),
    decision,
    denialCodes,
    ...roots,
    feeQuoteRoot,
    licensePosture,
    readRightState: readReceipt.readRightState,
    disclosureState: readReceipt.disclosureState,
    deliveryAdmissionState: readReceipt.deliveryAdmissionState,
    readReceiptRoot: readReceipt.receiptRoot,
    authorizationPolicyRoot: authorizationPolicy.proofRoots.policyRoot,
    protectedSourceVisible: readReceipt.protectedSourceVisible,
    sourceSafety: sourceSafetyForVisibility(readReceipt.protectedSourceVisible),
    issuedAt,
  };

  return {
    ...withoutRoot,
    proofRoot: stableRoot('read-license-interface-contract', withoutRoot),
  };
}

export function buildBtdAssetPackRightsInterfaceContract(
  input: BtdAssetPackRightsInterfaceContractInput,
): BtdAssetPackRightsInterfaceContract {
  const contractId = assertSourceSafeString(input.contractId, 'contractId');
  const issuedAt = assertNonEmptyString(input.issuedAt ?? new Date().toISOString(), 'issuedAt');
  const action = assertSourceSafeAction(input.action);
  const readReceipt = assertBtdReadReceipt(input.readReceipt);
  const rightsTransferReceipt = input.rightsTransferReceipt
    ? assertBtdRightsTransferReceipt(input.rightsTransferReceipt)
    : null;
  const authorizationPolicy = buildBtdInterfaceAuthorizationPolicy(input.authorizationPolicy);
  const feeQuote = normalizeFeeQuote(input.feeQuote);
  const rangeStart = assertNonNegativeSafeInteger(input.rangeStart, 'rangeStart');
  const rangeEndExclusive = assertPositiveSafeInteger(input.rangeEndExclusive, 'rangeEndExclusive');
  if (rangeEndExclusive <= rangeStart) {
    throw new Error('AssetPack rights interface contract range must be non-empty.');
  }
  const tokenCount = rangeEndExclusive - rangeStart;
  const paidUnlockRoot = normalizeOptionalRoot(input.paidUnlockRoot, 'paidUnlockRoot');
  const deliveryAdmissionRoot = normalizeOptionalRoot(input.deliveryAdmissionRoot, 'deliveryAdmissionRoot');
  const settlementRoot = normalizeOptionalRoot(input.settlementRoot, 'settlementRoot');
  const roots = {
    assetPackPreviewRoot: assertSourceSafeString(input.assetPackPreviewRoot, 'assetPackPreviewRoot'),
    sourceSafeMeasurementRoot: assertSourceSafeString(input.sourceSafeMeasurementRoot, 'sourceSafeMeasurementRoot'),
  };
  const btcSettlementFinality = btcSettlementFinalityPosture(feeQuote, rightsTransferReceipt, settlementRoot);
  const denialCodes = assetPackRightsDenials({
    feeQuote,
    settlementRoot,
    paidUnlockRoot,
    deliveryAdmissionRoot,
    readReceipt,
    rightsTransferReceipt,
    authorizationPolicy,
  });
  const decision = assetPackRightsDecision(readReceipt, rightsTransferReceipt, denialCodes);
  const rightsPosture = assetPackRightsPosture(readReceipt, rightsTransferReceipt, settlementRoot);
  const withoutRoot = {
    kind: 'btd.asset_pack_rights_interface_contract' as const,
    contractId,
    interfaceSurface: input.interfaceSurface,
    action,
    fixturePath: assertSourceSafeString(input.fixturePath, 'fixturePath'),
    decision,
    denialCodes,
    assetPackId: assertSourceSafeString(input.assetPackId, 'assetPackId'),
    ...roots,
    rangeStart,
    rangeEndExclusive,
    tokenCount,
    feeQuoteRoot: feeQuote?.quoteRoot ?? null,
    settlementRoot,
    paidUnlockRoot,
    deliveryAdmissionRoot,
    btcSettlementFinality,
    rightsPosture,
    readRightState: readReceipt.readRightState,
    deliveryAdmissionState: readReceipt.deliveryAdmissionState,
    readReceiptRoot: readReceipt.receiptRoot,
    rightsTransferReceiptRoot: rightsTransferReceipt?.receiptRoot ?? null,
    authorizationPolicyRoot: authorizationPolicy.proofRoots.policyRoot,
    protectedSourceVisible: Boolean(rightsTransferReceipt && readReceipt.protectedSourceVisible),
    sourceSafety: sourceSafetyForVisibility(Boolean(rightsTransferReceipt && readReceipt.protectedSourceVisible)),
    issuedAt,
  };

  return {
    ...withoutRoot,
    proofRoot: stableRoot('assetpack-rights-interface-contract', withoutRoot),
  };
}

export function buildBtdReadLicenseAssetPackRightsInterfaceFixtures(): BtdReadLicenseAssetPackRightsInterfaceFixture[] {
  const issuedAt = '2026-05-22T00:00:00.000Z';
  const api = buildPreviewFixture({
    fixtureId: 'api-read-license-source-safe-preview',
    interfaceSurface: 'api',
    fixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    action: 'review_asset_pack_preview',
    organizationPermissionGrants: ['asset_pack:review_preview'],
    authIssuerKind: 'api_key',
    authIssuerId: 'api-key-rights-preview',
    issuedAt,
  });
  const mcp = buildPreviewFixture({
    fixtureId: 'mcp-finding-fits-source-safe-preview',
    interfaceSurface: 'mcp',
    fixturePath: 'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    action: 'request_finding_fits',
    organizationPermissionGrants: ['reading:request_finding_fits'],
    authIssuerKind: 'api_key',
    authIssuerId: 'mcp-key-rights-preview',
    issuedAt,
  });
  const chatgpt = buildUnpaidDeliveryFixture(issuedAt);
  const terminal = buildPaidDeliveryFixture(issuedAt);

  return [api, mcp, chatgpt, terminal];
}

export function buildBtdReadLicenseAssetPackRightsInterfaceRegistry(input: {
  fixtures?: readonly BtdReadLicenseAssetPackRightsInterfaceFixture[];
  requiredSurfaces?: readonly BtdInterfaceAuthorizationPolicySurface[];
} = {}): BtdReadLicenseAssetPackRightsInterfaceRegistry {
  const fixtures = (input.fixtures ?? buildBtdReadLicenseAssetPackRightsInterfaceFixtures()).map(assertFixture);
  const readLicenseContracts = fixtures.map((fixture) =>
    buildBtdReadLicenseInterfaceContract(fixture.readLicenseInput),
  );
  const assetPackRightsContracts = fixtures.map((fixture) =>
    buildBtdAssetPackRightsInterfaceContract(fixture.assetPackRightsInput),
  );

  for (let index = 0; index < fixtures.length; index += 1) {
    const fixture = fixtures[index];
    const readLicense = readLicenseContracts[index];
    const rights = assetPackRightsContracts[index];
    if (readLicense.decision !== fixture.expectedReadLicenseDecision) {
      throw new Error(`${fixture.fixtureId} expected ${fixture.expectedReadLicenseDecision} but read license evaluated ${readLicense.decision}.`);
    }
    if (rights.decision !== fixture.expectedAssetPackRightsDecision) {
      throw new Error(`${fixture.fixtureId} expected ${fixture.expectedAssetPackRightsDecision} but rights evaluated ${rights.decision}.`);
    }
  }

  const requiredSurfaces = [...(input.requiredSurfaces ?? REQUIRED_SURFACES)];
  const observedSurfaces = Array.from(new Set(fixtures.map((fixture) => fixture.interfaceSurface))).sort() as BtdInterfaceAuthorizationPolicySurface[];
  const missingSurfaces = requiredSurfaces.filter((surface) => !observedSurfaces.includes(surface));
  if (missingSurfaces.length) {
    throw new Error(`ReadLicense/AssetPackRights interface contracts missing surfaces: ${missingSurfaces.join(', ')}.`);
  }

  const withoutRoot = {
    kind: 'btd.read_license_assetpack_rights_interface_registry' as const,
    schemaId: 'bitcode.readLicenseAssetPackRightsInterfaceRegistry.v1' as const,
    requiredSurfaces,
    observedSurfaces,
    missingSurfaces,
    readLicenseContracts,
    assetPackRightsContracts,
    fixtures,
    sourceSafety: SOURCE_SAFETY,
  };

  return {
    ...withoutRoot,
    registryRoot: stableRoot('read-license-assetpack-rights-interface-registry', withoutRoot),
  };
}

export function getBtdReadLicenseAssetPackRightsInterfaceFixture(
  fixtureId: BtdReadLicenseAssetPackRightsFixtureId,
): BtdReadLicenseAssetPackRightsInterfaceFixture {
  const fixture = buildBtdReadLicenseAssetPackRightsInterfaceFixtures().find(
    (candidate) => candidate.fixtureId === fixtureId,
  );
  if (!fixture) {
    throw new Error(`Unknown ReadLicense/AssetPackRights fixture: ${fixtureId}.`);
  }
  return assertFixture(fixture);
}

function buildPreviewFixture(input: {
  fixtureId: BtdReadLicenseAssetPackRightsFixtureId;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  fixturePath: string;
  action: BtdOrganizationPermissionAction;
  organizationPermissionGrants: string[];
  authIssuerKind: NonNullable<BtdInterfaceAuthorizationPolicyInput['authIssuer']>['issuerKind'];
  authIssuerId: string;
  issuedAt: string;
}): BtdReadLicenseAssetPackRightsInterfaceFixture {
  const ids = fixtureIds(input.fixtureId);
  const readReceipt = buildBtdReadReceipt({
    assetPackId: ids.assetPackId,
    readId: ids.readId,
    readRequestId: ids.readRequestId,
    acceptedNeedRoot: ids.reviewedNeedRoot,
    findingFitsResultRoot: ids.findingFitsAdmissionRoot,
    readerWalletId: ids.readerWalletId,
    depositorWalletId: ids.depositorWalletId,
    rangeStart: 100,
    rangeEndExclusive: 121,
    sourceManifestRoot: ids.sourceManifestRoot,
    sourceSafePreviewRoot: ids.sourceSafePreviewRoot,
    accessPolicyHash: ids.accessPolicyHash,
    disclosureState: 'source_safe_preview',
    readRightState: 'none',
    deliveryAdmissionState: 'blocked',
    ledgerProjectionRoot: ids.ledgerProjectionRoot,
    protectedSourceVisible: false,
    issuedAt: input.issuedAt,
  });
  const authorizationPolicy = baseAuthorizationPolicy({
    policyId: `${input.fixtureId}-policy`,
    interfaceSurface: input.interfaceSurface,
    action: input.action,
    issuerKind: input.authIssuerKind,
    issuerId: input.authIssuerId,
    organizationPermissionGrants: input.organizationPermissionGrants,
    disclosureState: 'source_safe_preview',
    settlementState: 'not_required',
    at: input.issuedAt,
  });

  return {
    fixtureId: input.fixtureId,
    interfaceSurface: input.interfaceSurface,
    fixturePath: input.fixturePath,
    readLicenseInput: {
      contractId: `${input.fixtureId}-read-license`,
      interfaceSurface: input.interfaceSurface,
      action: input.action,
      fixturePath: input.fixturePath,
      readRequestRoot: ids.readRequestRoot,
      reviewedNeedRoot: ids.reviewedNeedRoot,
      findingFitsAdmissionRoot: ids.findingFitsAdmissionRoot,
      sourceSafePreviewRoot: ids.sourceSafePreviewRoot,
      feeQuote: ids.feeQuote,
      readReceipt,
      authorizationPolicy,
      issuedAt: input.issuedAt,
    },
    assetPackRightsInput: {
      contractId: `${input.fixtureId}-assetpack-rights`,
      interfaceSurface: input.interfaceSurface,
      action: input.action,
      fixturePath: input.fixturePath,
      assetPackId: ids.assetPackId,
      assetPackPreviewRoot: ids.assetPackPreviewRoot,
      sourceSafeMeasurementRoot: ids.sourceSafeMeasurementRoot,
      rangeStart: 100,
      rangeEndExclusive: 121,
      feeQuote: ids.feeQuote,
      readReceipt,
      authorizationPolicy,
      issuedAt: input.issuedAt,
    },
    expectedReadLicenseDecision: 'source_safe_preview_admitted',
    expectedAssetPackRightsDecision: 'preview_admitted',
  };
}

function buildUnpaidDeliveryFixture(
  issuedAt: string,
): BtdReadLicenseAssetPackRightsInterfaceFixture {
  const fixtureId = 'chatgpt-unpaid-delivery-denied';
  const ids = fixtureIds(fixtureId);
  const readReceipt = buildBtdReadReceipt({
    assetPackId: ids.assetPackId,
    readId: ids.readId,
    readRequestId: ids.readRequestId,
    acceptedNeedRoot: ids.reviewedNeedRoot,
    findingFitsResultRoot: ids.findingFitsAdmissionRoot,
    readerWalletId: ids.readerWalletId,
    depositorWalletId: ids.depositorWalletId,
    rangeStart: 200,
    rangeEndExclusive: 233,
    sourceManifestRoot: ids.sourceManifestRoot,
    sourceSafePreviewRoot: ids.sourceSafePreviewRoot,
    accessPolicyHash: ids.accessPolicyHash,
    disclosureState: 'source_safe_preview',
    readRightState: 'none',
    deliveryAdmissionState: 'blocked',
    ledgerProjectionRoot: ids.ledgerProjectionRoot,
    protectedSourceVisible: false,
    issuedAt,
  });
  const authorizationPolicy = baseAuthorizationPolicy({
    policyId: 'chatgpt-unpaid-delivery-denied-policy',
    interfaceSurface: 'chatgpt_app',
    action: 'deliver_asset_pack',
    issuerKind: 'chatgpt_session',
    issuerId: 'chatgpt-unpaid-rights-session',
    organizationPermissionGrants: ['asset_pack:deliver'],
    disclosureState: 'requested_locked_source',
    settlementState: 'pending',
    readLicenseState: 'missing',
    assetPackRightsState: 'unsettled',
    walletCanAuthorizeDelivery: true,
    at: issuedAt,
  });

  return {
    fixtureId,
    interfaceSurface: 'chatgpt_app',
    fixturePath: 'apps/chatgpt/src/__tests__/tools.test.ts',
    readLicenseInput: {
      contractId: 'chatgpt-unpaid-delivery-read-license',
      interfaceSurface: 'chatgpt_app',
      action: 'deliver_asset_pack',
      fixturePath: 'apps/chatgpt/src/__tests__/tools.test.ts',
      readRequestRoot: ids.readRequestRoot,
      reviewedNeedRoot: ids.reviewedNeedRoot,
      findingFitsAdmissionRoot: ids.findingFitsAdmissionRoot,
      sourceSafePreviewRoot: ids.sourceSafePreviewRoot,
      feeQuote: ids.feeQuote,
      readReceipt,
      authorizationPolicy,
      issuedAt,
    },
    assetPackRightsInput: {
      contractId: 'chatgpt-unpaid-delivery-assetpack-rights',
      interfaceSurface: 'chatgpt_app',
      action: 'deliver_asset_pack',
      fixturePath: 'apps/chatgpt/src/__tests__/tools.test.ts',
      assetPackId: ids.assetPackId,
      assetPackPreviewRoot: ids.assetPackPreviewRoot,
      sourceSafeMeasurementRoot: ids.sourceSafeMeasurementRoot,
      rangeStart: 200,
      rangeEndExclusive: 233,
      feeQuote: ids.feeQuote,
      settlementRoot: null,
      paidUnlockRoot: null,
      deliveryAdmissionRoot: null,
      readReceipt,
      authorizationPolicy,
      issuedAt,
    },
    expectedReadLicenseDecision: 'locked_source_denied',
    expectedAssetPackRightsDecision: 'rights_delivery_denied',
  };
}

function buildPaidDeliveryFixture(
  issuedAt: string,
): BtdReadLicenseAssetPackRightsInterfaceFixture {
  const fixtureId = 'terminal-paid-rights-delivery';
  const ids = fixtureIds(fixtureId);
  const readReceipt = buildBtdReadReceipt({
    assetPackId: ids.assetPackId,
    readId: ids.readId,
    readRequestId: ids.readRequestId,
    acceptedNeedRoot: ids.reviewedNeedRoot,
    findingFitsResultRoot: ids.findingFitsAdmissionRoot,
    readerWalletId: ids.readerWalletId,
    depositorWalletId: ids.depositorWalletId,
    rangeStart: 300,
    rangeEndExclusive: 355,
    sourceManifestRoot: ids.sourceManifestRoot,
    sourceSafePreviewRoot: ids.sourceSafePreviewRoot,
    accessPolicyHash: ids.accessPolicyHash,
    disclosureState: 'paid_unlocked',
    readRightState: 'licensed_read',
    paidUnlockRoot: ids.paidUnlockRoot,
    deliveryAdmissionState: 'admitted',
    deliveryAdmissionRoot: ids.deliveryAdmissionRoot,
    ledgerProjectionRoot: ids.ledgerProjectionRoot,
    protectedSourceVisible: true,
    issuedAt,
  });
  const rightsTransferReceipt = buildBtdRightsTransferReceipt({
    orderId: ids.orderId,
    assetPackId: ids.assetPackId,
    rangeStart: 300,
    rangeEndExclusive: 355,
    fromWalletId: ids.depositorWalletId,
    toWalletId: ids.readerWalletId,
    readerWalletId: ids.readerWalletId,
    depositorWalletId: ids.depositorWalletId,
    priceSats: ids.feeQuote.sats,
    accessPolicyHash: ids.accessPolicyHash,
    btcFeeReceiptId: ids.btcFeeReceiptId,
    btcFeeFinalityState: 'confirmed',
    readLicenseId: ids.readLicenseId,
    sourceSafePreviewRoot: ids.sourceSafePreviewRoot,
    paidUnlockRoot: ids.paidUnlockRoot,
    deliveryAdmissionRoot: ids.deliveryAdmissionRoot,
    ledgerAnchorId: ids.ledgerAnchorId,
    ledgerProjectionRoot: ids.ledgerProjectionRoot,
    exchangeSequence: 33n,
    protectedSourceVisible: true,
    issuedAt,
  });
  const authorizationPolicy = baseAuthorizationPolicy({
    policyId: 'terminal-paid-rights-delivery-policy',
    interfaceSurface: 'terminal',
    action: 'deliver_asset_pack',
    issuerKind: 'terminal_session',
    issuerId: 'terminal-paid-rights-session',
    organizationPermissionGrants: ['asset_pack:deliver'],
    disclosureState: 'requested_locked_source',
    settlementState: 'settled',
    readLicenseState: 'licensed_read',
    assetPackRightsState: 'licensed',
    walletCanAuthorizeDelivery: true,
    at: issuedAt,
  });

  return {
    fixtureId,
    interfaceSurface: 'terminal',
    fixturePath: 'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
    readLicenseInput: {
      contractId: 'terminal-paid-delivery-read-license',
      interfaceSurface: 'terminal',
      action: 'deliver_asset_pack',
      fixturePath: 'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
      readRequestRoot: ids.readRequestRoot,
      reviewedNeedRoot: ids.reviewedNeedRoot,
      findingFitsAdmissionRoot: ids.findingFitsAdmissionRoot,
      sourceSafePreviewRoot: ids.sourceSafePreviewRoot,
      feeQuote: ids.feeQuote,
      readReceipt,
      authorizationPolicy,
      issuedAt,
    },
    assetPackRightsInput: {
      contractId: 'terminal-paid-delivery-assetpack-rights',
      interfaceSurface: 'terminal',
      action: 'deliver_asset_pack',
      fixturePath: 'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
      assetPackId: ids.assetPackId,
      assetPackPreviewRoot: ids.assetPackPreviewRoot,
      sourceSafeMeasurementRoot: ids.sourceSafeMeasurementRoot,
      rangeStart: 300,
      rangeEndExclusive: 355,
      feeQuote: ids.feeQuote,
      settlementRoot: ids.settlementRoot,
      paidUnlockRoot: ids.paidUnlockRoot,
      deliveryAdmissionRoot: ids.deliveryAdmissionRoot,
      readReceipt,
      rightsTransferReceipt,
      authorizationPolicy,
      issuedAt,
    },
    expectedReadLicenseDecision: 'paid_unlock_admitted',
    expectedAssetPackRightsDecision: 'rights_delivery_admitted',
  };
}

function baseAuthorizationPolicy(input: {
  policyId: string;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  action: BtdOrganizationPermissionAction;
  issuerKind: NonNullable<BtdInterfaceAuthorizationPolicyInput['authIssuer']>['issuerKind'];
  issuerId: string;
  organizationPermissionGrants: string[];
  disclosureState: NonNullable<BtdInterfaceAuthorizationPolicyInput['protectedSource']>['disclosureState'];
  settlementState: NonNullable<BtdInterfaceAuthorizationPolicyInput['protectedSource']>['settlementState'];
  readLicenseState?: NonNullable<BtdInterfaceAuthorizationPolicyInput['readLicense']>['state'];
  assetPackRightsState?: NonNullable<BtdInterfaceAuthorizationPolicyInput['assetPackRights']>['state'];
  walletCanAuthorizeDelivery?: boolean;
  at: string;
}): BtdInterfaceAuthorizationPolicyInput {
  return {
    policyId: input.policyId,
    interfaceSurface: input.interfaceSurface,
    action: input.action,
    authIssuer: {
      issuerKind: input.issuerKind,
      issuerId: input.issuerId,
      issuedAt: input.at,
      expiresAt: '2026-05-22T00:30:00.000Z',
      issuerRoot: `${input.policyId}-issuer-root`,
    },
    actorId: 'enterprise-reader-1',
    organizationId: 'org-v33-rights',
    teamId: 'team-v33-reading',
    memberId: 'member-v33-reader',
    organizationRole: 'admin',
    organizationPermissionGrants: input.organizationPermissionGrants,
    walletCapability: {
      state: input.action === 'deliver_asset_pack' ? 'verified' : 'not_required',
      walletId: 'wallet-v33-reader',
      canAuthorizeDelivery: input.walletCanAuthorizeDelivery === true,
      capabilityRoot: 'wallet-v33-reader-capability-root',
    },
    readLicense: {
      state: input.readLicenseState ?? 'not_required',
      assetPackId: 'asset-pack-v33-rights',
      walletId: 'wallet-v33-reader',
      accessPolicyHash: 'access-policy-hash-v33-rights',
      licenseRoot: input.readLicenseState === 'licensed_read' ? 'read-license-root-v33-rights' : null,
    },
    assetPackRights: {
      state: input.assetPackRightsState ?? 'not_required',
      assetPackId: 'asset-pack-v33-rights',
      rightsRoot: input.assetPackRightsState === 'licensed' ? 'rights-root-v33-rights' : null,
    },
    protectedSource: {
      disclosureState: input.disclosureState,
      settlementState: input.settlementState,
      previewOnly: input.disclosureState !== 'requested_locked_source',
    },
    confirmed: true,
    at: input.at,
  };
}

function fixtureIds(fixtureId: string) {
  return {
    assetPackId: 'asset-pack-v33-rights',
    readId: `read-${fixtureId}`,
    readRequestId: `read-request-${fixtureId}`,
    readRequestRoot: `read-request-root-${fixtureId}`,
    reviewedNeedRoot: `reviewed-need-root-${fixtureId}`,
    findingFitsAdmissionRoot: `finding-fits-root-${fixtureId}`,
    sourceManifestRoot: `source-manifest-root-${fixtureId}`,
    sourceSafePreviewRoot: `source-safe-preview-root-${fixtureId}`,
    sourceSafeMeasurementRoot: `source-safe-measurement-root-${fixtureId}`,
    assetPackPreviewRoot: `asset-pack-preview-root-${fixtureId}`,
    accessPolicyHash: 'access-policy-hash-v33-rights',
    ledgerProjectionRoot: `ledger-projection-root-${fixtureId}`,
    readerWalletId: 'wallet-v33-reader',
    depositorWalletId: 'wallet-v33-depositor',
    orderId: `order-${fixtureId}`,
    readLicenseId: `read-license-${fixtureId}`,
    btcFeeReceiptId: `btc-fee-${fixtureId}`,
    ledgerAnchorId: `ledger-anchor-${fixtureId}`,
    settlementRoot: `settlement-root-${fixtureId}`,
    paidUnlockRoot: `paid-unlock-root-${fixtureId}`,
    deliveryAdmissionRoot: `delivery-admission-root-${fixtureId}`,
    feeQuote: {
      quoteId: `fee-quote-${fixtureId}`,
      quoteRoot: `fee-quote-root-${fixtureId}`,
      sats: 2500,
      state: 'accepted' as const,
    },
  };
}

function readLicenseDenials(input: {
  readRequestRoot: string;
  reviewedNeedRoot: string;
  findingFitsAdmissionRoot: string;
  sourceSafePreviewRoot: string;
  readReceipt: BtdReadReceipt;
  authorizationPolicy: BtdInterfaceAuthorizationPolicy;
}): BtdInterfaceRightsContractDenialCode[] {
  const codes: BtdInterfaceRightsContractDenialCode[] = [];
  if (!input.readRequestRoot) codes.push('READ_REQUEST_REQUIRED');
  if (!input.reviewedNeedRoot) codes.push('REVIEWED_NEED_REQUIRED');
  if (!input.findingFitsAdmissionRoot) codes.push('FINDING_FITS_REQUIRED');
  if (!input.sourceSafePreviewRoot) codes.push('SOURCE_SAFE_PREVIEW_REQUIRED');
  if (input.authorizationPolicy.decision !== 'allowed') codes.push('INTERFACE_AUTHORIZATION_DENIED');
  if (input.readReceipt.disclosureState === 'paid_unlocked' && input.readReceipt.readRightState === 'none') {
    codes.push('READ_LICENSE_REQUIRED');
  }
  if (input.readReceipt.protectedSourceVisible && input.readReceipt.disclosureState !== 'paid_unlocked') {
    codes.push('LOCKED_SOURCE_UNPAID');
  }
  return unique(codes);
}

function assetPackRightsDenials(input: {
  feeQuote: BtdInterfaceFeeQuoteProjection | null;
  settlementRoot: string | null;
  paidUnlockRoot: string | null;
  deliveryAdmissionRoot: string | null;
  readReceipt: BtdReadReceipt;
  rightsTransferReceipt: BtdRightsTransferReceipt | null;
  authorizationPolicy: BtdInterfaceAuthorizationPolicy;
}): BtdInterfaceRightsContractDenialCode[] {
  const codes: BtdInterfaceRightsContractDenialCode[] = [];
  if (input.authorizationPolicy.decision !== 'allowed') codes.push('INTERFACE_AUTHORIZATION_DENIED');
  if (!input.feeQuote) codes.push('FEE_QUOTE_REQUIRED');
  if (input.readReceipt.deliveryAdmissionState === 'admitted' && !input.deliveryAdmissionRoot) {
    codes.push('DELIVERY_ADMISSION_REQUIRED');
  }
  const deliveryRequested =
    input.authorizationPolicy.action === 'deliver_asset_pack' ||
    input.authorizationPolicy.protectedSource.disclosureState === 'requested_locked_source';
  if (deliveryRequested) {
    if (!input.settlementRoot) codes.push('SETTLEMENT_REQUIRED');
    if (!input.paidUnlockRoot) codes.push('READ_LICENSE_REQUIRED');
    if (!input.rightsTransferReceipt) codes.push('RIGHTS_TRANSFER_REQUIRED');
    if (input.readReceipt.deliveryAdmissionState !== 'admitted' || !input.deliveryAdmissionRoot) {
      codes.push('DELIVERY_ADMISSION_REQUIRED');
    }
    if (!input.rightsTransferReceipt || !input.readReceipt.protectedSourceVisible) {
      codes.push('LOCKED_SOURCE_UNPAID');
    }
  }
  return unique(codes);
}

function readLicenseDecision(
  readReceipt: BtdReadReceipt,
  denialCodes: BtdInterfaceRightsContractDenialCode[],
): BtdReadLicenseInterfaceDecision {
  if (denialCodes.includes('INTERFACE_AUTHORIZATION_DENIED') || denialCodes.includes('LOCKED_SOURCE_UNPAID')) {
    return 'locked_source_denied';
  }
  if (readReceipt.disclosureState === 'paid_unlocked' && readReceipt.readRightState !== 'none') {
    return 'paid_unlock_admitted';
  }
  return 'source_safe_preview_admitted';
}

function assetPackRightsDecision(
  readReceipt: BtdReadReceipt,
  rightsTransferReceipt: BtdRightsTransferReceipt | null,
  denialCodes: BtdInterfaceRightsContractDenialCode[],
): BtdAssetPackRightsInterfaceDecision {
  if (
    rightsTransferReceipt &&
    readReceipt.deliveryAdmissionState === 'admitted' &&
    readReceipt.disclosureState === 'paid_unlocked' &&
    denialCodes.length === 0
  ) {
    return 'rights_delivery_admitted';
  }
  if (denialCodes.includes('INTERFACE_AUTHORIZATION_DENIED') || denialCodes.includes('LOCKED_SOURCE_UNPAID')) {
    return 'rights_delivery_denied';
  }
  return 'preview_admitted';
}

function readLicensePosture(
  readReceipt: BtdReadReceipt,
  authorizationPolicy: BtdInterfaceAuthorizationPolicy,
): BtdReadLicensePosture {
  if (authorizationPolicy.denialCodes.includes('READ_LICENSE_REQUIRED')) return 'missing';
  if (authorizationPolicy.decision === 'denied') return 'denied';
  if (readReceipt.readRightState === 'owner_read') return 'owner_read';
  if (readReceipt.readRightState === 'licensed_read') return 'licensed_read';
  return 'preview_only_not_required';
}

function assetPackRightsPosture(
  readReceipt: BtdReadReceipt,
  rightsTransferReceipt: BtdRightsTransferReceipt | null,
  settlementRoot: string | null,
): BtdAssetPackRightsPosture {
  if (rightsTransferReceipt && readReceipt.deliveryAdmissionState === 'admitted') return 'rights_transferred';
  if (settlementRoot) return 'settlement_pending';
  if (readReceipt.disclosureState === 'source_safe_preview') return 'preview_only_locked';
  return 'denied';
}

function btcSettlementFinalityPosture(
  feeQuote: BtdInterfaceFeeQuoteProjection | null,
  rightsTransferReceipt: BtdRightsTransferReceipt | null,
  settlementRoot: string | null,
): BtdBtcSettlementFinalityPosture {
  if (rightsTransferReceipt?.btcFeeFinalityState === 'confirmed') return 'confirmed';
  if (!feeQuote) return 'not_required_for_preview';
  if (!settlementRoot && feeQuote.state === 'accepted') return 'quote_pending';
  if (settlementRoot) return 'broadcast_pending';
  return 'repair_required';
}

function normalizeFeeQuote(input: BtdInterfaceFeeQuoteProjection | null | undefined): BtdInterfaceFeeQuoteProjection | null {
  if (!input) return null;
  const quoteId = assertSourceSafeString(input.quoteId, 'feeQuote.quoteId');
  const quoteRoot = assertSourceSafeString(input.quoteRoot, 'feeQuote.quoteRoot');
  const sats = typeof input.sats === 'bigint' ? input.sats : BigInt(input.sats);
  if (sats <= 0n) {
    throw new Error('Read license interface fee quote sats must be positive.');
  }
  return { ...input, quoteId, quoteRoot, sats };
}

function normalizeOptionalRoot(value: string | null | undefined, label: string): string | null {
  return value === null || value === undefined ? null : assertSourceSafeString(value, label);
}

function sourceSafetyForVisibility(visible: boolean): BtdProtocolTelemetrySourceSafety {
  void visible;
  return SOURCE_SAFETY;
}

function assertFixture(
  fixture: BtdReadLicenseAssetPackRightsInterfaceFixture,
): BtdReadLicenseAssetPackRightsInterfaceFixture {
  assertSourceSafeString(fixture.fixtureId, 'fixtureId');
  assertSourceSafeString(fixture.fixturePath, 'fixturePath');
  buildBtdReadLicenseInterfaceContract(fixture.readLicenseInput);
  buildBtdAssetPackRightsInterfaceContract(fixture.assetPackRightsInput);
  return fixture;
}

function assertSourceSafeString(value: string, label: string): string {
  const normalized = assertNonEmptyString(value, label);
  for (const pattern of SECRET_OR_SOURCE_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error(`${label} must not contain secrets or protected source.`);
    }
  }
  return normalized;
}

function assertSourceSafeAction(action: BtdOrganizationPermissionAction): BtdOrganizationPermissionAction {
  assertSourceSafeString(action, 'action');
  return action;
}

function stableRoot(prefix: string, value: unknown): string {
  const serialized = JSON.stringify(sortJson(value));
  const digest = createHash('sha256').update(serialized).digest('hex').slice(0, 24);
  return `${prefix}:${digest}`;
}

function sortJson(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

function unique<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}
