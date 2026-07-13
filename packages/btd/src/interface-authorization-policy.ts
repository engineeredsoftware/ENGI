import { createHash } from 'crypto';
import type { BtdAccessDecision } from './access';
import {
  buildBtdOrganizationPolicyAuthority,
  type BtdOrganizationPermissionAction,
  type BtdOrganizationPolicyAuthority,
  type BtdOrganizationRole,
  type BtdRepairApprovalState,
  type BtdSettlementAuthorityState,
  type BtdSourceVisibilityState,
} from './authority';
import { assertNonEmptyString } from './constants';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const BTD_INTERFACE_AUTHORIZATION_POLICY_SURFACES = [
  'api',
  'mcp',
  'chatgpt_app',
  'terminal',
] as const;

export type BtdInterfaceAuthorizationPolicySurface =
  (typeof BTD_INTERFACE_AUTHORIZATION_POLICY_SURFACES)[number];

export type BtdInterfaceAuthorizationAuthIssuerKind =
  | 'api_key'
  | 'chatgpt_session'
  | 'terminal_session'
  | 'vercel_oidc'
  | 'service_session';

export type BtdInterfaceAuthorizationWalletCapabilityState =
  | 'not_required'
  | 'verified'
  | 'missing'
  | 'stale';

export type BtdInterfaceAuthorizationReadLicenseState =
  | 'not_required'
  | 'owner_read'
  | 'licensed_read'
  | 'missing'
  | 'expired'
  | 'revoked'
  | 'denied';

export type BtdInterfaceAuthorizationAssetPackRightsState =
  | 'not_required'
  | 'owned'
  | 'licensed'
  | 'missing'
  | 'unsettled';

export type BtdInterfaceAuthorizationRepairState =
  | 'not_required'
  | 'approved'
  | 'required'
  | 'missing';

export type BtdInterfaceAuthorizationDisclosureState =
  | 'not_requested'
  | 'source_safe_preview'
  | 'requested_locked_source';

export type BtdInterfaceAuthorizationDecisionKind = 'allowed' | 'denied';

export type BtdInterfaceAuthorizationDenialCode =
  | 'MISSING_AUTH_ISSUER'
  | 'STALE_AUTHORITY'
  | 'MISSING_ACTOR'
  | 'MISSING_ORGANIZATION'
  | 'MISSING_TEAM'
  | 'MISSING_ROLE'
  | 'ORGANIZATION_AUTHORITY_DENIED'
  | 'WALLET_CAPABILITY_REQUIRED'
  | 'READ_LICENSE_REQUIRED'
  | 'ASSET_PACK_RIGHTS_REQUIRED'
  | 'PROTECTED_SOURCE_DISCLOSURE_BLOCKED'
  | 'REPAIR_APPROVAL_REQUIRED';

export interface BtdInterfaceAuthorizationAuthIssuerInput {
  issuerKind: BtdInterfaceAuthorizationAuthIssuerKind;
  issuerId: string;
  issuedAt: string;
  expiresAt?: string | null;
  issuerRoot?: string | null;
}

export interface BtdInterfaceAuthorizationWalletCapabilityInput {
  state: BtdInterfaceAuthorizationWalletCapabilityState;
  walletId?: string | null;
  canSignBtc?: boolean | null;
  canAuthorizeDelivery?: boolean | null;
  capabilityRoot?: string | null;
}

export interface BtdInterfaceAuthorizationReadLicenseInput {
  state: BtdInterfaceAuthorizationReadLicenseState;
  assetPackId?: string | null;
  walletId?: string | null;
  accessPolicyHash?: string | null;
  reason?: string | null;
  licenseRoot?: string | null;
}

export interface BtdInterfaceAuthorizationAssetPackRightsInput {
  state: BtdInterfaceAuthorizationAssetPackRightsState;
  assetPackId?: string | null;
  rightsRoot?: string | null;
}

export interface BtdInterfaceAuthorizationProtectedSourceInput {
  disclosureState: BtdInterfaceAuthorizationDisclosureState;
  settlementState?: BtdSettlementAuthorityState | null;
  previewOnly?: boolean | null;
}

export interface BtdInterfaceAuthorizationRepairInput {
  state: BtdInterfaceAuthorizationRepairState;
  repairRoot?: string | null;
}

export interface BtdInterfaceAuthorizationPolicyInput {
  policyId: string;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  action: BtdOrganizationPermissionAction;
  authIssuer?: BtdInterfaceAuthorizationAuthIssuerInput | null;
  actorId?: string | null;
  organizationId?: string | null;
  teamId?: string | null;
  memberId?: string | null;
  organizationRole?: BtdOrganizationRole | null;
  organizationPermissionGrants?: readonly string[] | null;
  walletCapability?: BtdInterfaceAuthorizationWalletCapabilityInput | null;
  readLicense?: BtdInterfaceAuthorizationReadLicenseInput | null;
  assetPackRights?: BtdInterfaceAuthorizationAssetPackRightsInput | null;
  protectedSource?: BtdInterfaceAuthorizationProtectedSourceInput | null;
  repairPosture?: BtdInterfaceAuthorizationRepairInput | null;
  confirmed?: boolean | null;
  targetAnchor?: string | null;
  recoveryRoute?: string | null;
  at?: string;
  maxAuthorityAgeMs?: number | null;
}

export interface BtdInterfaceAuthorizationPolicy {
  kind: 'btd.interface_authorization_policy';
  policyId: string;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  action: BtdOrganizationPermissionAction;
  decision: BtdInterfaceAuthorizationDecisionKind;
  denialCode: BtdInterfaceAuthorizationDenialCode | null;
  denialCodes: BtdInterfaceAuthorizationDenialCode[];
  readableDenial: string | null;
  repairActions: string[];
  actor: {
    actorId: string | null;
    organizationId: string | null;
    teamId: string | null;
    memberId: string | null;
    organizationRole: BtdOrganizationRole | null;
  };
  authIssuer: {
    issuerKind: BtdInterfaceAuthorizationAuthIssuerKind | null;
    issuerId: string | null;
    issuedAt: string | null;
    expiresAt: string | null;
    issuerRoot: string | null;
    stale: boolean;
  };
  walletCapability: {
    state: BtdInterfaceAuthorizationWalletCapabilityState;
    walletId: string | null;
    canSignBtc: boolean;
    canAuthorizeDelivery: boolean;
    capabilityRoot: string | null;
  };
  readLicense: {
    state: BtdInterfaceAuthorizationReadLicenseState;
    assetPackId: string | null;
    walletId: string | null;
    accessPolicyHash: string | null;
    reason: string | null;
    licenseRoot: string | null;
  };
  assetPackRights: {
    state: BtdInterfaceAuthorizationAssetPackRightsState;
    assetPackId: string | null;
    rightsRoot: string | null;
  };
  protectedSource: {
    disclosureState: BtdInterfaceAuthorizationDisclosureState;
    settlementState: BtdSettlementAuthorityState;
    previewOnly: boolean;
  };
  repairPosture: {
    state: BtdInterfaceAuthorizationRepairState;
    repairRoot: string | null;
  };
  organizationAuthority: BtdOrganizationPolicyAuthority;
  sourceVisibility: BtdSourceVisibilityState;
  proofRoots: {
    authIssuerRoot: string;
    organizationAuthorityRoot: string;
    walletCapabilityRoot: string;
    readLicenseRoot: string;
    assetPackRightsRoot: string;
    protectedSourceRoot: string;
    repairPostureRoot: string;
    policyRoot: string;
  };
  sourceSafety: BtdProtocolTelemetrySourceSafety;
  issuedAt: string;
}

export interface BtdInterfaceAuthorizationPolicyFixture {
  fixtureId: string;
  interfaceSurface: BtdInterfaceAuthorizationPolicySurface;
  fixturePath: string;
  input: BtdInterfaceAuthorizationPolicyInput;
  expectedDecision: BtdInterfaceAuthorizationDecisionKind;
  expectedDenialCodes: BtdInterfaceAuthorizationDenialCode[];
}

export interface BtdInterfaceAuthorizationPolicyRegistry {
  kind: 'btd.interface_authorization_policy_registry';
  schemaId: 'bitcode.interfaceAuthorizationPolicyRegistry.v1';
  registryRoot: string;
  requiredSurfaces: BtdInterfaceAuthorizationPolicySurface[];
  observedSurfaces: BtdInterfaceAuthorizationPolicySurface[];
  missingSurfaces: BtdInterfaceAuthorizationPolicySurface[];
  policies: BtdInterfaceAuthorizationPolicy[];
  fixtures: BtdInterfaceAuthorizationPolicyFixture[];
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const SECRET_OR_LOCKED_CONTENT_PATTERNS = [
  new RegExp(`${['sb', 'secret'].join('_')}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\braw\s+source\b/iu,
  /\bprivate\s+source\b/iu,
];

const DEFAULT_AUTHORITY_MAX_AGE_MS = 15 * 60 * 1000;

export function buildBtdInterfaceAuthorizationPolicyFixtures(): BtdInterfaceAuthorizationPolicyFixture[] {
  return [
    {
      fixtureId: 'api-request-read-allowed',
      interfaceSurface: 'api',
      fixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
      input: {
        policyId: 'interface-auth-api-request-read',
        interfaceSurface: 'api',
        action: 'request_read',
        authIssuer: freshIssuer('api_key', 'api-key-fixture-1'),
        actorId: 'api-user-1',
        organizationId: 'org-api-1',
        teamId: 'team-api-reading',
        memberId: 'member-api-1',
        organizationRole: 'member',
        organizationPermissionGrants: ['reading:request'],
        protectedSource: { disclosureState: 'source_safe_preview', settlementState: 'not_required' },
        at: '2026-05-22T00:05:00.000Z',
      },
      expectedDecision: 'allowed',
      expectedDenialCodes: [],
    },
    {
      fixtureId: 'mcp-finding-fits-allowed',
      interfaceSurface: 'mcp',
      fixturePath: 'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      input: {
        policyId: 'interface-auth-mcp-finding-fits',
        interfaceSurface: 'mcp',
        action: 'request_finding_fits',
        authIssuer: freshIssuer('api_key', 'mcp-api-key-fixture-1'),
        actorId: 'mcp-user-1',
        organizationId: 'org-mcp-1',
        teamId: 'team-mcp-reading',
        memberId: 'member-mcp-1',
        organizationRole: 'member',
        organizationPermissionGrants: ['reading:request_finding_fits'],
        protectedSource: { disclosureState: 'source_safe_preview', settlementState: 'not_required' },
        at: '2026-05-22T00:05:00.000Z',
      },
      expectedDecision: 'allowed',
      expectedDenialCodes: [],
    },
    {
      fixtureId: 'chatgpt-delivery-allowed',
      interfaceSurface: 'chatgpt_app',
      fixturePath: 'packages/chatgptapp/src/__tests__/tools.test.ts',
      input: {
        policyId: 'interface-auth-chatgpt-delivery',
        interfaceSurface: 'chatgpt_app',
        action: 'deliver_asset_pack',
        authIssuer: freshIssuer('chatgpt_session', 'chatgpt-session-fixture-1'),
        actorId: 'chatgpt-user-1',
        organizationId: 'org-chatgpt-1',
        teamId: 'team-chatgpt-reading',
        memberId: 'member-chatgpt-1',
        organizationRole: 'member',
        organizationPermissionGrants: ['asset_pack:deliver'],
        walletCapability: {
          state: 'verified',
          walletId: 'wallet-chatgpt-reader',
          canAuthorizeDelivery: true,
          capabilityRoot: 'wallet-capability-root-chatgpt',
        },
        readLicense: {
          state: 'licensed_read',
          assetPackId: 'asset-pack-chatgpt-1',
          walletId: 'wallet-chatgpt-reader',
          accessPolicyHash: 'policy-hash-chatgpt',
          reason: 'wallet_has_valid_policy_matching_license',
          licenseRoot: 'read-license-root-chatgpt',
        },
        assetPackRights: {
          state: 'licensed',
          assetPackId: 'asset-pack-chatgpt-1',
          rightsRoot: 'asset-pack-rights-root-chatgpt',
        },
        protectedSource: {
          disclosureState: 'requested_locked_source',
          settlementState: 'settled',
          previewOnly: false,
        },
        confirmed: true,
        at: '2026-05-22T00:05:00.000Z',
      },
      expectedDecision: 'allowed',
      expectedDenialCodes: [],
    },
    {
      fixtureId: 'terminal-btc-fee-allowed',
      interfaceSurface: 'terminal',
      fixturePath: 'uapi/tests/terminalOrganizationAuthority.test.ts',
      input: {
        policyId: 'interface-auth-terminal-btc-fee',
        interfaceSurface: 'terminal',
        action: 'pay_btc_fee',
        authIssuer: freshIssuer('terminal_session', 'terminal-session-fixture-1'),
        actorId: 'terminal-user-1',
        organizationId: 'org-terminal-1',
        teamId: 'team-terminal-reading',
        memberId: 'member-terminal-1',
        organizationRole: 'admin',
        organizationPermissionGrants: ['settlement:pay_btc_fee'],
        walletCapability: {
          state: 'verified',
          walletId: 'wallet-terminal-reader',
          canSignBtc: true,
          capabilityRoot: 'wallet-capability-root-terminal',
        },
        protectedSource: { disclosureState: 'source_safe_preview', settlementState: 'not_required' },
        confirmed: true,
        at: '2026-05-22T00:05:00.000Z',
      },
      expectedDecision: 'allowed',
      expectedDenialCodes: [],
    },
    {
      fixtureId: 'terminal-stale-authority-denied',
      interfaceSurface: 'terminal',
      fixturePath: 'uapi/tests/terminalOrganizationAuthority.test.ts',
      input: {
        policyId: 'interface-auth-terminal-stale-denial',
        interfaceSurface: 'terminal',
        action: 'pay_btc_fee',
        authIssuer: {
          issuerKind: 'terminal_session',
          issuerId: 'terminal-session-stale',
          issuedAt: '2026-05-21T00:00:00.000Z',
          expiresAt: '2026-05-21T00:05:00.000Z',
          issuerRoot: 'terminal-stale-issuer-root',
        },
        actorId: 'terminal-user-1',
        organizationId: 'org-terminal-1',
        teamId: 'team-terminal-reading',
        memberId: 'member-terminal-1',
        organizationRole: 'admin',
        organizationPermissionGrants: ['settlement:pay_btc_fee'],
        walletCapability: {
          state: 'verified',
          walletId: 'wallet-terminal-reader',
          canSignBtc: true,
        },
        protectedSource: { disclosureState: 'source_safe_preview', settlementState: 'not_required' },
        confirmed: true,
        at: '2026-05-21T00:30:00.000Z',
      },
      expectedDecision: 'denied',
      expectedDenialCodes: ['STALE_AUTHORITY'],
    },
    {
      fixtureId: 'chatgpt-unpaid-delivery-denied',
      interfaceSurface: 'chatgpt_app',
      fixturePath: 'packages/chatgptapp/src/__tests__/tools.test.ts',
      input: {
        policyId: 'interface-auth-chatgpt-unpaid-delivery',
        interfaceSurface: 'chatgpt_app',
        action: 'deliver_asset_pack',
        authIssuer: freshIssuer('chatgpt_session', 'chatgpt-session-fixture-2'),
        actorId: 'chatgpt-user-1',
        organizationId: 'org-chatgpt-1',
        teamId: 'team-chatgpt-reading',
        memberId: 'member-chatgpt-1',
        organizationRole: 'member',
        organizationPermissionGrants: ['asset_pack:deliver'],
        walletCapability: { state: 'verified', walletId: 'wallet-chatgpt-reader' },
        readLicense: {
          state: 'missing',
          assetPackId: 'asset-pack-chatgpt-1',
          walletId: 'wallet-chatgpt-reader',
          accessPolicyHash: 'policy-hash-chatgpt',
        },
        assetPackRights: { state: 'unsettled', assetPackId: 'asset-pack-chatgpt-1' },
        protectedSource: {
          disclosureState: 'requested_locked_source',
          settlementState: 'pending',
          previewOnly: false,
        },
        confirmed: true,
        at: '2026-05-22T00:05:00.000Z',
      },
      expectedDecision: 'denied',
      expectedDenialCodes: [
        'READ_LICENSE_REQUIRED',
        'ASSET_PACK_RIGHTS_REQUIRED',
        'PROTECTED_SOURCE_DISCLOSURE_BLOCKED',
      ],
    },
  ];
}

export function buildBtdInterfaceAuthorizationPolicy(
  input: BtdInterfaceAuthorizationPolicyInput,
): BtdInterfaceAuthorizationPolicy {
  const policyId = assertSourceSafeString(input.policyId, 'policyId');
  const interfaceSurface = assertAuthorizationSurface(input.interfaceSurface);
  const action = assertNonEmptyString(input.action, 'action') as BtdOrganizationPermissionAction;
  const issuedAt = assertPolicyDate(input.at ?? new Date().toISOString(), 'at').toISOString();
  const authIssuer = normalizeAuthIssuer(input.authIssuer ?? null, issuedAt, input.maxAuthorityAgeMs);
  const walletCapability = normalizeWalletCapability(input.walletCapability ?? null);
  const readLicense = normalizeReadLicense(input.readLicense ?? null, walletCapability.walletId);
  const assetPackRights = normalizeAssetPackRights(input.assetPackRights ?? null);
  const protectedSource = normalizeProtectedSource(input.protectedSource ?? null);
  const repairPosture = normalizeRepairPosture(input.repairPosture ?? null);
  const permissionGrants = uniqueStrings(input.organizationPermissionGrants ?? []);
  const readAccessDecision = toReadAccessDecision(readLicense);
  const organizationAuthority = buildBtdOrganizationPolicyAuthority({
    actorId: normalizeOptionalString(input.actorId),
    organizationId: normalizeOptionalString(input.organizationId),
    teamId: normalizeOptionalString(input.teamId),
    memberId: normalizeOptionalString(input.memberId),
    organizationRole: input.organizationRole ?? null,
    organizationPermissionGrants: permissionGrants,
    interfaceSurface,
    action,
    walletId: walletCapability.walletId,
    readAccessDecision,
    settlementState: protectedSource.settlementState,
    confirmed: input.confirmed === true,
    repairApprovalState: toRepairApprovalState(repairPosture),
    targetAnchor: input.targetAnchor ?? assetPackRights.assetPackId ?? readLicense.assetPackId,
    policyId,
    policyHash: readLicense.accessPolicyHash,
    accountAdmitted: Boolean(input.actorId),
    interfaceAdmitted: true,
    recoveryRoute: input.recoveryRoute ?? undefined,
    at: issuedAt,
  });
  const denialCodes = uniqueStrings([
    ...authIssuerDenials(authIssuer),
    ...actorDenials(input),
    ...organizationDenials(organizationAuthority),
    ...walletDenials(action, walletCapability),
    ...readLicenseDenials(action, readLicense, protectedSource),
    ...assetPackRightsDenials(protectedSource, assetPackRights),
    ...protectedSourceDenials(protectedSource, readLicense, assetPackRights),
    ...repairDenials(repairPosture),
  ]) as BtdInterfaceAuthorizationDenialCode[];
  const decision: BtdInterfaceAuthorizationDecisionKind =
    denialCodes.length === 0 && organizationAuthority.policyDecision === 'allowed'
      ? 'allowed'
      : 'denied';
  const sourceVisibility: BtdSourceVisibilityState =
    decision === 'allowed'
      ? organizationAuthority.sourceVisibility
      : protectedSource.disclosureState === 'requested_locked_source'
        ? 'blocked'
        : 'source_safe_preview';
  const withoutRoots = {
    kind: 'btd.interface_authorization_policy' as const,
    policyId,
    interfaceSurface,
    action,
    decision,
    denialCode: denialCodes[0] ?? null,
    denialCodes,
    readableDenial: denialCodes[0] ? readableDenialFor(denialCodes[0]) : null,
    repairActions: repairActionsFor(denialCodes),
    actor: {
      actorId: normalizeOptionalString(input.actorId),
      organizationId: normalizeOptionalString(input.organizationId),
      teamId: normalizeOptionalString(input.teamId),
      memberId: normalizeOptionalString(input.memberId),
      organizationRole: input.organizationRole ?? null,
    },
    authIssuer,
    walletCapability,
    readLicense,
    assetPackRights,
    protectedSource,
    repairPosture,
    organizationAuthority,
    sourceVisibility,
    sourceSafety: SOURCE_SAFETY,
    issuedAt,
  };
  const proofRoots = {
    authIssuerRoot: stableRoot('interface-auth-issuer', authIssuer),
    organizationAuthorityRoot: organizationAuthority.authorityRoot,
    walletCapabilityRoot: stableRoot('interface-wallet-capability', walletCapability),
    readLicenseRoot: stableRoot('interface-read-license', readLicense),
    assetPackRightsRoot: stableRoot('interface-assetpack-rights', assetPackRights),
    protectedSourceRoot: stableRoot('interface-protected-disclosure', protectedSource),
    repairPostureRoot: stableRoot('interface-repair-posture', repairPosture),
    policyRoot: '',
  };
  proofRoots.policyRoot = stableRoot('interface-authorization-policy', {
    policyId,
    interfaceSurface,
    action,
    decision,
    denialCodes,
    authIssuerRoot: proofRoots.authIssuerRoot,
    organizationAuthorityRoot: proofRoots.organizationAuthorityRoot,
    walletCapabilityRoot: proofRoots.walletCapabilityRoot,
    readLicenseRoot: proofRoots.readLicenseRoot,
    assetPackRightsRoot: proofRoots.assetPackRightsRoot,
    protectedSourceRoot: proofRoots.protectedSourceRoot,
    repairPostureRoot: proofRoots.repairPostureRoot,
  });

  return {
    ...withoutRoots,
    proofRoots,
  };
}

export function buildBtdInterfaceAuthorizationPolicyRegistry(input: {
  fixtures?: readonly BtdInterfaceAuthorizationPolicyFixture[];
  requiredSurfaces?: readonly BtdInterfaceAuthorizationPolicySurface[];
} = {}): BtdInterfaceAuthorizationPolicyRegistry {
  const fixtures = (input.fixtures ?? buildBtdInterfaceAuthorizationPolicyFixtures()).map(assertPolicyFixture);
  const policies = fixtures.map((fixture) => buildBtdInterfaceAuthorizationPolicy(fixture.input));
  for (let index = 0; index < fixtures.length; index += 1) {
    const fixture = fixtures[index];
    const policy = policies[index];
    if (policy.decision !== fixture.expectedDecision) {
      throw new Error(`${fixture.fixtureId} expected ${fixture.expectedDecision} but evaluated ${policy.decision}.`);
    }
    const missingCodes = fixture.expectedDenialCodes.filter((code) => !policy.denialCodes.includes(code));
    if (missingCodes.length) {
      throw new Error(`${fixture.fixtureId} missing expected denial codes: ${missingCodes.join(', ')}.`);
    }
  }

  const requiredSurfaces = [...(input.requiredSurfaces ?? BTD_INTERFACE_AUTHORIZATION_POLICY_SURFACES)];
  const observedSurfaces = Array.from(new Set(fixtures.map((fixture) => fixture.interfaceSurface))).sort();
  const missingSurfaces = requiredSurfaces.filter((surface) => !observedSurfaces.includes(surface));
  if (missingSurfaces.length) {
    throw new Error(`InterfaceAuthorizationPolicy missing surfaces: ${missingSurfaces.join(', ')}.`);
  }
  const registryWithoutRoot = {
    kind: 'btd.interface_authorization_policy_registry' as const,
    schemaId: 'bitcode.interfaceAuthorizationPolicyRegistry.v1' as const,
    requiredSurfaces,
    observedSurfaces,
    missingSurfaces,
    policies,
    fixtures,
    sourceSafety: SOURCE_SAFETY,
  };

  return {
    ...registryWithoutRoot,
    registryRoot: stableRoot('interface-authorization-policy-registry', registryWithoutRoot),
  };
}

export function getBtdInterfaceAuthorizationPolicyFixture(
  fixtureId: string,
): BtdInterfaceAuthorizationPolicyFixture {
  const fixture = buildBtdInterfaceAuthorizationPolicyFixtures().find(
    (candidate) => candidate.fixtureId === fixtureId,
  );
  if (!fixture) {
    throw new Error(`Unknown InterfaceAuthorizationPolicy fixture: ${fixtureId}.`);
  }
  return assertPolicyFixture(fixture);
}

export function renderBtdInterfaceAuthorizationDeniedState(
  policy: Pick<BtdInterfaceAuthorizationPolicy, 'decision' | 'denialCode' | 'readableDenial' | 'repairActions' | 'proofRoots'>,
) {
  if (policy.decision !== 'denied' || !policy.denialCode) {
    throw new Error('Only denied InterfaceAuthorizationPolicy decisions can be rendered as denied states.');
  }
  return {
    status: 'denied' as const,
    code: policy.denialCode,
    message: policy.readableDenial ?? readableDenialFor(policy.denialCode),
    repairActions: policy.repairActions,
    proofRoot: policy.proofRoots.policyRoot,
  };
}

function freshIssuer(
  issuerKind: BtdInterfaceAuthorizationAuthIssuerKind,
  issuerId: string,
): BtdInterfaceAuthorizationAuthIssuerInput {
  return {
    issuerKind,
    issuerId,
    issuedAt: '2026-05-22T00:00:00.000Z',
    expiresAt: '2026-05-22T00:10:00.000Z',
    issuerRoot: `${issuerKind}-issuer-root-${issuerId}`,
  };
}

function normalizeAuthIssuer(
  input: BtdInterfaceAuthorizationAuthIssuerInput | null,
  at: string,
  maxAgeMs: number | null | undefined,
): BtdInterfaceAuthorizationPolicy['authIssuer'] {
  if (!input) {
    return {
      issuerKind: null,
      issuerId: null,
      issuedAt: null,
      expiresAt: null,
      issuerRoot: null,
      stale: false,
    };
  }
  const issuedAt = assertPolicyDate(input.issuedAt, 'authIssuer.issuedAt');
  const evaluatedAt = assertPolicyDate(at, 'at');
  const expiresAt = normalizeOptionalString(input.expiresAt);
  const expiresAtDate = expiresAt ? assertPolicyDate(expiresAt, 'authIssuer.expiresAt') : null;
  const maxAuthorityAgeMs = typeof maxAgeMs === 'number' && maxAgeMs > 0
    ? maxAgeMs
    : DEFAULT_AUTHORITY_MAX_AGE_MS;
  const stale =
    issuedAt.getTime() > evaluatedAt.getTime() ||
    evaluatedAt.getTime() - issuedAt.getTime() > maxAuthorityAgeMs ||
    Boolean(expiresAtDate && expiresAtDate.getTime() <= evaluatedAt.getTime());

  return {
    issuerKind: input.issuerKind,
    issuerId: assertSourceSafeString(input.issuerId, 'authIssuer.issuerId'),
    issuedAt: issuedAt.toISOString(),
    expiresAt,
    issuerRoot: normalizeOptionalString(input.issuerRoot),
    stale,
  };
}

function normalizeWalletCapability(
  input: BtdInterfaceAuthorizationWalletCapabilityInput | null,
): BtdInterfaceAuthorizationPolicy['walletCapability'] {
  return {
    state: input?.state ?? 'not_required',
    walletId: normalizeOptionalString(input?.walletId),
    canSignBtc: input?.canSignBtc === true,
    canAuthorizeDelivery: input?.canAuthorizeDelivery === true,
    capabilityRoot: normalizeOptionalString(input?.capabilityRoot),
  };
}

function normalizeReadLicense(
  input: BtdInterfaceAuthorizationReadLicenseInput | null,
  fallbackWalletId: string | null,
): BtdInterfaceAuthorizationPolicy['readLicense'] {
  return {
    state: input?.state ?? 'not_required',
    assetPackId: normalizeOptionalString(input?.assetPackId),
    walletId: normalizeOptionalString(input?.walletId) ?? fallbackWalletId,
    accessPolicyHash: normalizeOptionalString(input?.accessPolicyHash),
    reason: normalizeOptionalString(input?.reason),
    licenseRoot: normalizeOptionalString(input?.licenseRoot),
  };
}

function normalizeAssetPackRights(
  input: BtdInterfaceAuthorizationAssetPackRightsInput | null,
): BtdInterfaceAuthorizationPolicy['assetPackRights'] {
  return {
    state: input?.state ?? 'not_required',
    assetPackId: normalizeOptionalString(input?.assetPackId),
    rightsRoot: normalizeOptionalString(input?.rightsRoot),
  };
}

function normalizeProtectedSource(
  input: BtdInterfaceAuthorizationProtectedSourceInput | null,
): BtdInterfaceAuthorizationPolicy['protectedSource'] {
  return {
    disclosureState: input?.disclosureState ?? 'not_requested',
    settlementState: input?.settlementState ?? 'not_required',
    previewOnly: input?.previewOnly !== false,
  };
}

function normalizeRepairPosture(
  input: BtdInterfaceAuthorizationRepairInput | null,
): BtdInterfaceAuthorizationPolicy['repairPosture'] {
  return {
    state: input?.state ?? 'not_required',
    repairRoot: normalizeOptionalString(input?.repairRoot),
  };
}

function toReadAccessDecision(
  readLicense: BtdInterfaceAuthorizationPolicy['readLicense'],
): BtdAccessDecision | null {
  if (readLicense.state !== 'owner_read' && readLicense.state !== 'licensed_read') {
    return null;
  }
  return {
    decision: readLicense.state,
    accessPolicyHash: readLicense.accessPolicyHash ?? `policy:${readLicense.assetPackId ?? 'unknown'}`,
    reason: readLicense.reason === 'wallet_owns_policy_matching_range' ||
      readLicense.reason === 'wallet_has_valid_policy_matching_license'
      ? readLicense.reason
      : readLicense.state === 'owner_read'
        ? 'wallet_owns_policy_matching_range'
        : 'wallet_has_valid_policy_matching_license',
  };
}

function toRepairApprovalState(
  repairPosture: BtdInterfaceAuthorizationPolicy['repairPosture'],
): BtdRepairApprovalState {
  if (repairPosture.state === 'approved') return 'approved';
  if (repairPosture.state === 'required' || repairPosture.state === 'missing') return 'required';
  return 'not_required';
}

function authIssuerDenials(
  authIssuer: BtdInterfaceAuthorizationPolicy['authIssuer'],
): BtdInterfaceAuthorizationDenialCode[] {
  if (!authIssuer.issuerKind || !authIssuer.issuerId || !authIssuer.issuedAt) {
    return ['MISSING_AUTH_ISSUER'];
  }
  return authIssuer.stale ? ['STALE_AUTHORITY'] : [];
}

function actorDenials(input: BtdInterfaceAuthorizationPolicyInput): BtdInterfaceAuthorizationDenialCode[] {
  const denials: BtdInterfaceAuthorizationDenialCode[] = [];
  if (!normalizeOptionalString(input.actorId)) denials.push('MISSING_ACTOR');
  if (!normalizeOptionalString(input.organizationId)) denials.push('MISSING_ORGANIZATION');
  if (!normalizeOptionalString(input.teamId)) denials.push('MISSING_TEAM');
  if (!input.organizationRole) denials.push('MISSING_ROLE');
  return denials;
}

function organizationDenials(
  organizationAuthority: BtdOrganizationPolicyAuthority,
): BtdInterfaceAuthorizationDenialCode[] {
  return organizationAuthority.policyDecision === 'allowed'
    ? []
    : ['ORGANIZATION_AUTHORITY_DENIED'];
}

function walletDenials(
  action: BtdOrganizationPermissionAction,
  walletCapability: BtdInterfaceAuthorizationPolicy['walletCapability'],
): BtdInterfaceAuthorizationDenialCode[] {
  const requiresWallet =
    action === 'pay_btc_fee' ||
    action === 'unlock_asset_pack_source' ||
    action === 'deliver_asset_pack';
  if (!requiresWallet) return [];
  if (walletCapability.state !== 'verified' || !walletCapability.walletId) {
    return ['WALLET_CAPABILITY_REQUIRED'];
  }
  if (action === 'pay_btc_fee' && !walletCapability.canSignBtc) {
    return ['WALLET_CAPABILITY_REQUIRED'];
  }
  return [];
}

function readLicenseDenials(
  action: BtdOrganizationPermissionAction,
  readLicense: BtdInterfaceAuthorizationPolicy['readLicense'],
  protectedSource: BtdInterfaceAuthorizationPolicy['protectedSource'],
): BtdInterfaceAuthorizationDenialCode[] {
  const requiresLicense =
    action === 'unlock_asset_pack_source' ||
    action === 'deliver_asset_pack' ||
    protectedSource.disclosureState === 'requested_locked_source';
  if (!requiresLicense) return [];
  return readLicense.state === 'owner_read' || readLicense.state === 'licensed_read'
    ? []
    : ['READ_LICENSE_REQUIRED'];
}

function assetPackRightsDenials(
  protectedSource: BtdInterfaceAuthorizationPolicy['protectedSource'],
  assetPackRights: BtdInterfaceAuthorizationPolicy['assetPackRights'],
): BtdInterfaceAuthorizationDenialCode[] {
  if (protectedSource.disclosureState !== 'requested_locked_source') return [];
  return assetPackRights.state === 'owned' || assetPackRights.state === 'licensed'
    ? []
    : ['ASSET_PACK_RIGHTS_REQUIRED'];
}

function protectedSourceDenials(
  protectedSource: BtdInterfaceAuthorizationPolicy['protectedSource'],
  readLicense: BtdInterfaceAuthorizationPolicy['readLicense'],
  assetPackRights: BtdInterfaceAuthorizationPolicy['assetPackRights'],
): BtdInterfaceAuthorizationDenialCode[] {
  if (protectedSource.disclosureState !== 'requested_locked_source') return [];
  const settled = protectedSource.settlementState === 'settled';
  const licenseAllowed = readLicense.state === 'owner_read' || readLicense.state === 'licensed_read';
  const rightsAllowed = assetPackRights.state === 'owned' || assetPackRights.state === 'licensed';
  return settled && licenseAllowed && rightsAllowed
    ? []
    : ['PROTECTED_SOURCE_DISCLOSURE_BLOCKED'];
}

function repairDenials(
  repairPosture: BtdInterfaceAuthorizationPolicy['repairPosture'],
): BtdInterfaceAuthorizationDenialCode[] {
  return repairPosture.state === 'required' || repairPosture.state === 'missing'
    ? ['REPAIR_APPROVAL_REQUIRED']
    : [];
}

function readableDenialFor(code: BtdInterfaceAuthorizationDenialCode): string {
  const messages: Record<BtdInterfaceAuthorizationDenialCode, string> = {
    MISSING_AUTH_ISSUER: 'The interface request has no trusted auth issuer, so Bitcode cannot admit the action.',
    STALE_AUTHORITY: 'The interface authority is stale or expired; refresh the session, API key, or OIDC proof and retry.',
    MISSING_ACTOR: 'The interface request is not bound to a readable actor.',
    MISSING_ORGANIZATION: 'The interface request is not bound to an organization.',
    MISSING_TEAM: 'The interface request is not bound to an organization team.',
    MISSING_ROLE: 'The interface request does not include a readable organization role.',
    ORGANIZATION_AUTHORITY_DENIED: 'The organization policy authority denied this interface action.',
    WALLET_CAPABILITY_REQUIRED: 'The action requires a verified wallet capability for BTC signing or AssetPack delivery.',
    READ_LICENSE_REQUIRED: 'The action requires owner-read or licensed-read evidence before locked AssetPack delivery.',
    ASSET_PACK_RIGHTS_REQUIRED: 'The action requires settled AssetPack rights before locked AssetPack delivery.',
    PROTECTED_SOURCE_DISCLOSURE_BLOCKED: 'The requested locked AssetPack contents cannot be disclosed before settlement and rights checks pass.',
    REPAIR_APPROVAL_REQUIRED: 'The requested repair path requires explicit repair approval before proceeding.',
  };
  return messages[code];
}

function repairActionsFor(codes: BtdInterfaceAuthorizationDenialCode[]): string[] {
  const actions = codes.flatMap((code) => {
    const table: Record<BtdInterfaceAuthorizationDenialCode, string[]> = {
      MISSING_AUTH_ISSUER: ['refresh-interface-authentication'],
      STALE_AUTHORITY: ['refresh-interface-authentication'],
      MISSING_ACTOR: ['sign-in-before-retrying-interface-action'],
      MISSING_ORGANIZATION: ['select-organization-before-retrying'],
      MISSING_TEAM: ['select-team-before-retrying'],
      MISSING_ROLE: ['refresh-organization-membership'],
      ORGANIZATION_AUTHORITY_DENIED: ['request-organization-permission-or-use-admitted-action'],
      WALLET_CAPABILITY_REQUIRED: ['connect-and-verify-bitcoin-wallet'],
      READ_LICENSE_REQUIRED: ['settle-asset-pack-fee-and-refresh-read-license'],
      ASSET_PACK_RIGHTS_REQUIRED: ['settle-asset-pack-fee-and-refresh-rights'],
      PROTECTED_SOURCE_DISCLOSURE_BLOCKED: ['review-source-safe-preview-and-settle-before-delivery'],
      REPAIR_APPROVAL_REQUIRED: ['collect-repair-approval'],
    };
    return table[code];
  });
  return Array.from(new Set(actions));
}

function assertPolicyFixture(
  fixture: BtdInterfaceAuthorizationPolicyFixture,
): BtdInterfaceAuthorizationPolicyFixture {
  assertSourceSafeString(fixture.fixtureId, 'fixtureId');
  assertAuthorizationSurface(fixture.interfaceSurface);
  assertSourceSafeString(fixture.fixturePath, 'fixturePath');
  if (fixture.input.interfaceSurface !== fixture.interfaceSurface) {
    throw new Error(`${fixture.fixtureId} input surface must match fixture surface.`);
  }
  return fixture;
}

function assertAuthorizationSurface(
  value: BtdInterfaceAuthorizationPolicySurface,
): BtdInterfaceAuthorizationPolicySurface {
  if (!BTD_INTERFACE_AUTHORIZATION_POLICY_SURFACES.includes(value)) {
    throw new Error(`Unknown InterfaceAuthorizationPolicy surface: ${value}.`);
  }
  return value;
}

function assertSourceSafeString(value: string, label: string): string {
  const text = assertNonEmptyString(value, label);
  for (const pattern of SECRET_OR_LOCKED_CONTENT_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error(`${label} must not contain secrets or locked source material.`);
    }
  }
  return text;
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function uniqueStrings(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeOptionalString(value)).filter(Boolean))) as string[];
}

function assertPolicyDate(value: string, label: string): Date {
  const parsed = new Date(assertNonEmptyString(value, label));
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} must be a valid ISO timestamp.`);
  }
  return parsed;
}

function stableRoot(scope: string, value: unknown): string {
  return `btd-interface-auth:${scope}:${createHash('sha256')
    .update(stableStringify(value))
    .digest('hex')
    .slice(0, 24)}`;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
