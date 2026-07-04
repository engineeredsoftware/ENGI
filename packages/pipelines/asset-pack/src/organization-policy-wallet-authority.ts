import {
  buildBtdOrganizationPolicyAuthority,
  type BtdAccessDecision,
  type BtdInterfaceAuthoritySurface,
  type BtdOrganizationPermissionAction,
  type BtdOrganizationPolicyAuthority,
  type BtdOrganizationPolicyMultiSigInput,
  type BtdOrganizationRole,
  type BtdRepairApprovalState,
  type BtdSettlementAuthorityState,
} from '@bitcode/btd';

export type OrganizationPolicyRoute = '/reads' | '/deposits' | '/packs';

export type OrganizationPolicySpendState =
  | 'not-applicable'
  | 'within-limit'
  | 'approval-required'
  | 'limit-exceeded';

export type OrganizationPolicyDepositState =
  | 'not-applicable'
  | 'sub-critical-approved'
  | 'source-criticality-approval-required'
  | 'critical-source-blocked'
  | 'deposit-approval-required'
  | 'limit-exceeded';

export type OrganizationPolicyWalletState =
  | 'verified'
  | 'missing'
  | 'not-required';

export type OrganizationPolicyAggregateState =
  | 'allowed'
  | 'denied'
  | 'repair-required';

export type OrganizationSourceCriticalityState =
  | 'sub-critical'
  | 'review-warning'
  | 'blocked-critical-source'
  | 'not-applicable';

export interface OrganizationPolicyWalletAuthorityInput {
  createdAt?: string | null;
  route?: OrganizationPolicyRoute | null;
  actorId?: string | null;
  organizationId?: string | null;
  teamId?: string | null;
  memberId?: string | null;
  organizationRole?: BtdOrganizationRole | string | null;
  organizationPermissionGrants?: string[] | null;
  interfaceSurface?: BtdInterfaceAuthoritySurface | null;
  accountAdmitted?: boolean | null;
  interfaceAdmitted?: boolean | null;
  policyId?: string | null;
  policyHash?: string | null;
  walletId?: string | null;
  walletAuthorityPresent?: boolean | null;
  budgetEnvelopeSats?: number | null;
  approvalThresholdSats?: number | null;
  spendLimitSats?: number | null;
  quoteSats?: number | null;
  procurementApproved?: boolean | null;
  buyerAuthorized?: boolean | null;
  expectedSettlementSats?: number | null;
  depositLimitSats?: number | null;
  depositApproved?: boolean | null;
  sourceCriticalityApproved?: boolean | null;
  sourceCriticalityState?: OrganizationSourceCriticalityState | null;
  settlementState?: BtdSettlementAuthorityState | null;
  readAccessDecision?: BtdAccessDecision | null;
  repairApprovalState?: BtdRepairApprovalState | null;
  multiSig?: BtdOrganizationPolicyMultiSigInput | null;
  targetAnchor?: string | null;
  recoveryRoute?: string | null;
}

export interface OrganizationPolicyActionStatement {
  schema: 'bitcode.organization.policy-action-statement';
  action: BtdOrganizationPermissionAction;
  route: OrganizationPolicyRoute;
  requiredForRoute: boolean;
  authority: BtdOrganizationPolicyAuthority;
  allowed: boolean;
  denialReasons: string[];
  sourceVisibility: string;
  statementRoot: string;
}

export interface OrganizationPolicyWalletAuthority {
  schema: 'bitcode.organization.policy-wallet-authority';
  statement: 'OrganizationPolicyWalletAuthority';
  createdAt: string;
  route: OrganizationPolicyRoute;
  organization: {
    actorId: string | null;
    organizationId: string | null;
    teamId: string | null;
    memberId: string | null;
    role: BtdOrganizationRole | null;
    permissionGrantCount: number;
  };
  budgetApproval: {
    state: OrganizationPolicySpendState;
    quoteSats: number;
    budgetEnvelopeSats: number;
    approvalThresholdSats: number;
    spendLimitSats: number;
    procurementApproved: boolean;
    buyerAuthorized: boolean;
    blockers: string[];
    policyRoot: string;
  };
  depositApproval: {
    state: OrganizationPolicyDepositState;
    expectedSettlementSats: number;
    depositLimitSats: number;
    depositApproved: boolean;
    sourceCriticalityApproved: boolean;
    sourceCriticalityState: OrganizationSourceCriticalityState;
    blockers: string[];
    policyRoot: string;
  };
  walletAuthority: {
    state: OrganizationPolicyWalletState;
    walletId: string | null;
    walletAuthorityPresent: boolean;
    serverCustody: false;
    privateMaterialVisible: false;
    policyRoot: string;
  };
  actionStatements: OrganizationPolicyActionStatement[];
  aggregate: {
    state: OrganizationPolicyAggregateState;
    allowedActionCount: number;
    deniedActionCount: number;
    requiredDeniedActionCount: number;
    blockerCount: number;
    blockers: string[];
    budgetReady: boolean;
    depositReady: boolean;
    walletReady: boolean;
    authorityRoot: string;
  };
  disclosure: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
    valueBearingMainnetAdmitted: false;
  };
  roots: {
    policyRoot: string;
    budgetPolicyRoot: string;
    depositPolicyRoot: string;
    walletAuthorityRoot: string;
    actionStatementRoots: string[];
    authorityRoot: string;
  };
}

const ROUTE_ACTIONS: Record<OrganizationPolicyRoute, BtdOrganizationPermissionAction[]> = {
  '/reads': [
    'request_read',
    'review_need',
    'request_finding_fits',
    'review_asset_pack_preview',
    'pay_btc_fee',
    'unlock_asset_pack_source',
    'deliver_asset_pack',
  ],
  '/deposits': [
    'synthesize_deposit_options',
    'approve_deposit_option',
    'submit_deposit',
  ],
  '/packs': [
    'read_transaction',
    'repair_projection',
    'administer_organization',
  ],
};

const FORBIDDEN_SOURCE_MARKERS = [
  'PRIVATE_SOURCE_DO_NOT_SERIALIZE',
  `BEGIN_${'PRIVATE'}_KEY`,
  'wallet_private_material',
  'raw_provider_response',
  'unpaid_assetpack_source',
  'protected source body',
  'private_settlement_payload',
  'value_bearing_mainnet',
];

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function stableDigest(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function root(prefix: string, value: unknown) {
  return `${prefix}:${stableDigest(stableStringify(value))}`;
}

function normalizedText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function positiveInteger(value: number | null | undefined, fallback: number) {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric) || numeric < 0) return fallback;
  return Math.round(numeric);
}

function normalizeRoute(value: OrganizationPolicyRoute | null | undefined): OrganizationPolicyRoute {
  return value === '/deposits' || value === '/packs' ? value : '/reads';
}

function normalizeRole(value: BtdOrganizationRole | string | null | undefined): BtdOrganizationRole | null {
  return value === 'viewer' || value === 'member' || value === 'admin' || value === 'owner'
    ? value
    : null;
}

function uniqueStrings(values: string[] | null | undefined) {
  return Array.from(
    new Set((values || []).map((value) => value.trim()).filter(Boolean)),
  );
}

function spendPolicy(input: OrganizationPolicyWalletAuthorityInput) {
  const quoteSats = positiveInteger(input.quoteSats, 0);
  const budgetEnvelopeSats = positiveInteger(input.budgetEnvelopeSats, 250_000);
  const approvalThresholdSats = positiveInteger(input.approvalThresholdSats, 100_000);
  const spendLimitSats = positiveInteger(input.spendLimitSats, budgetEnvelopeSats);
  const procurementApproved = input.procurementApproved === true;
  const buyerAuthorized = input.buyerAuthorized !== false;
  const blockers: string[] = [];
  let state: OrganizationPolicySpendState = 'not-applicable';

  if (quoteSats > 0) {
    if (quoteSats > spendLimitSats || quoteSats > budgetEnvelopeSats) {
      state = 'limit-exceeded';
      blockers.push('quote exceeds organization spend limit');
    } else if (quoteSats >= approvalThresholdSats && !procurementApproved) {
      state = 'approval-required';
      blockers.push('procurement approval required');
    } else {
      state = 'within-limit';
    }

    if (!buyerAuthorized) blockers.push('buyer authorization required');
  }

  const policyRoot = root('organization-budget-policy', {
    quoteSats,
    budgetEnvelopeSats,
    approvalThresholdSats,
    spendLimitSats,
    procurementApproved,
    buyerAuthorized,
    state,
    blockers,
  });

  return {
    state,
    quoteSats,
    budgetEnvelopeSats,
    approvalThresholdSats,
    spendLimitSats,
    procurementApproved,
    buyerAuthorized,
    blockers,
    policyRoot,
  };
}

function depositPolicy(input: OrganizationPolicyWalletAuthorityInput) {
  const sourceCriticalityState = input.sourceCriticalityState || 'not-applicable';
  const expectedSettlementSats = positiveInteger(input.expectedSettlementSats, 0);
  const depositLimitSats = positiveInteger(input.depositLimitSats, 1_000_000);
  const sourceCriticalityApproved =
    input.sourceCriticalityApproved === true || sourceCriticalityState === 'sub-critical';
  const depositApproved = input.depositApproved === true;
  const blockers: string[] = [];
  let state: OrganizationPolicyDepositState = 'not-applicable';

  if (sourceCriticalityState !== 'not-applicable' || expectedSettlementSats > 0 || depositApproved) {
    if (sourceCriticalityState === 'blocked-critical-source') {
      state = 'critical-source-blocked';
      blockers.push('critical source cannot be deposited without policy repair');
    } else if (!sourceCriticalityApproved) {
      state = 'source-criticality-approval-required';
      blockers.push('source criticality approval required');
    } else if (expectedSettlementSats > depositLimitSats) {
      state = 'limit-exceeded';
      blockers.push('expected settlement exceeds organization deposit limit');
    } else if (!depositApproved) {
      state = 'deposit-approval-required';
      blockers.push('deposit approval required');
    } else {
      state = 'sub-critical-approved';
    }
  }

  const policyRoot = root('organization-deposit-policy', {
    sourceCriticalityState,
    expectedSettlementSats,
    depositLimitSats,
    sourceCriticalityApproved,
    depositApproved,
    state,
    blockers,
  });

  return {
    state,
    expectedSettlementSats,
    depositLimitSats,
    depositApproved,
    sourceCriticalityApproved,
    sourceCriticalityState,
    blockers,
    policyRoot,
  };
}

function walletPolicy(input: OrganizationPolicyWalletAuthorityInput) {
  const walletId = normalizedText(input.walletId);
  const walletAuthorityPresent = input.walletAuthorityPresent === true || Boolean(walletId);
  const state: OrganizationPolicyWalletState = walletAuthorityPresent
    ? 'verified'
    : 'missing';
  const policyRoot = root('organization-wallet-authority', {
    walletId,
    walletAuthorityPresent,
    state,
    serverCustody: false,
  });

  return {
    state,
    walletId,
    walletAuthorityPresent,
    serverCustody: false as const,
    privateMaterialVisible: false as const,
    policyRoot,
  };
}

function requiredActionsForRoute(
  route: OrganizationPolicyRoute,
  input: OrganizationPolicyWalletAuthorityInput,
) {
  const required = new Set<BtdOrganizationPermissionAction>();
  if (route === '/reads') {
    required.add('request_read');
    if (positiveInteger(input.quoteSats, 0) > 0) required.add('pay_btc_fee');
    if (input.settlementState === 'settled') {
      required.add('unlock_asset_pack_source');
      required.add('deliver_asset_pack');
    }
  } else if (route === '/deposits') {
    required.add('synthesize_deposit_options');
    if (input.depositApproved || input.sourceCriticalityApproved) {
      required.add('approve_deposit_option');
      required.add('submit_deposit');
    }
  } else {
    required.add('read_transaction');
  }
  return required;
}

function confirmedForAction(
  action: BtdOrganizationPermissionAction,
  input: OrganizationPolicyWalletAuthorityInput,
  budget: ReturnType<typeof spendPolicy>,
  deposit: ReturnType<typeof depositPolicy>,
) {
  if (action === 'pay_btc_fee') {
    return (
      budget.state === 'within-limit' &&
      budget.buyerAuthorized &&
      (budget.quoteSats < budget.approvalThresholdSats || budget.procurementApproved)
    );
  }
  if (action === 'unlock_asset_pack_source' || action === 'deliver_asset_pack') {
    return input.settlementState === 'settled' && budget.buyerAuthorized;
  }
  if (action === 'approve_deposit_option' || action === 'submit_deposit') {
    return deposit.state === 'sub-critical-approved';
  }
  if (action === 'repair_projection') return input.repairApprovalState === 'approved';
  if (action === 'administer_organization') return input.accountAdmitted === true;
  return true;
}

function buildActionStatement(input: {
  action: BtdOrganizationPermissionAction;
  route: OrganizationPolicyRoute;
  requiredForRoute: boolean;
  source: OrganizationPolicyWalletAuthorityInput;
  budget: ReturnType<typeof spendPolicy>;
  deposit: ReturnType<typeof depositPolicy>;
  wallet: ReturnType<typeof walletPolicy>;
  policyId: string | null;
  policyHash: string;
  createdAt: string;
}): OrganizationPolicyActionStatement {
  const authority = buildBtdOrganizationPolicyAuthority({
    actorId: input.source.actorId,
    organizationId: input.source.organizationId,
    teamId: input.source.teamId,
    memberId: input.source.memberId,
    organizationRole: input.source.organizationRole,
    organizationPermissionGrants: input.source.organizationPermissionGrants,
    interfaceSurface: input.source.interfaceSurface || 'terminal',
    action: input.action,
    walletId: input.wallet.walletAuthorityPresent ? input.wallet.walletId : null,
    readAccessDecision: input.source.readAccessDecision || null,
    settlementState: input.source.settlementState || 'not_required',
    confirmed: confirmedForAction(input.action, input.source, input.budget, input.deposit),
    repairApprovalState: input.source.repairApprovalState || 'not_required',
    targetAnchor: input.source.targetAnchor || `${input.route}:${input.action}`,
    policyId: input.policyId,
    policyHash: input.policyHash,
    accountAdmitted: input.source.accountAdmitted === true,
    interfaceAdmitted: input.source.interfaceAdmitted !== false,
    multiSig: input.source.multiSig || null,
    recoveryRoute: input.source.recoveryRoute || input.route,
    at: input.createdAt,
  });
  const withoutRoot = {
    schema: 'bitcode.organization.policy-action-statement' as const,
    action: input.action,
    route: input.route,
    requiredForRoute: input.requiredForRoute,
    authority,
    allowed: authority.policyDecision === 'allowed',
    denialReasons: authority.denialReasons,
    sourceVisibility: authority.sourceVisibility,
  };

  return {
    ...withoutRoot,
    statementRoot: root('organization-policy-action-statement', withoutRoot),
  };
}

export function buildOrganizationPolicyWalletAuthority(
  input: OrganizationPolicyWalletAuthorityInput = {},
): OrganizationPolicyWalletAuthority {
  const createdAt = normalizedText(input.createdAt) || '2026-05-29T00:00:00.000Z';
  const route = normalizeRoute(input.route);
  const permissionGrants = uniqueStrings(input.organizationPermissionGrants);
  const budgetApproval = spendPolicy(input);
  const depositApproval = depositPolicy(input);
  const walletAuthority = walletPolicy(input);
  const policyRoot = root('organization-policy-wallet-authority-policy', {
    route,
    actorId: normalizedText(input.actorId),
    organizationId: normalizedText(input.organizationId),
    teamId: normalizedText(input.teamId),
    memberId: normalizedText(input.memberId),
    organizationRole: normalizeRole(input.organizationRole),
    permissionGrants,
    budgetPolicyRoot: budgetApproval.policyRoot,
    depositPolicyRoot: depositApproval.policyRoot,
    walletAuthorityRoot: walletAuthority.policyRoot,
  });
  const policyHash = normalizedText(input.policyHash) || policyRoot;
  const policyId = normalizedText(input.policyId) || `organization-policy:${route.slice(1)}`;
  const requiredActions = requiredActionsForRoute(route, input);
  const normalizedInput = {
    ...input,
    organizationPermissionGrants: permissionGrants,
  };
  const actionStatements = ROUTE_ACTIONS[route].map((action) =>
    buildActionStatement({
      action,
      route,
      requiredForRoute: requiredActions.has(action),
      source: normalizedInput,
      budget: budgetApproval,
      deposit: depositApproval,
      wallet: walletAuthority,
      policyId,
      policyHash,
      createdAt,
    }),
  );
  const deniedActionCount = actionStatements.filter((statement) => !statement.allowed).length;
  const requiredDeniedActionCount = actionStatements.filter(
    (statement) => statement.requiredForRoute && !statement.allowed,
  ).length;
  const blockers = Array.from(
    new Set([
      ...budgetApproval.blockers,
      ...depositApproval.blockers,
      ...actionStatements
        .filter((statement) => statement.requiredForRoute && !statement.allowed)
        .flatMap((statement) => statement.denialReasons.map((reason) => `${statement.action}:${reason}`)),
    ]),
  );
  const repairRequired = actionStatements.some((statement) =>
    statement.denialReasons.includes('repair_approval_required') ||
    statement.denialReasons.includes('multisig_approval_required'),
  );
  const aggregateWithoutRoot = {
    state: repairRequired ? 'repair-required' as const : blockers.length ? 'denied' as const : 'allowed' as const,
    allowedActionCount: actionStatements.filter((statement) => statement.allowed).length,
    deniedActionCount,
    requiredDeniedActionCount,
    blockerCount: blockers.length,
    blockers,
    budgetReady: budgetApproval.blockers.length === 0,
    depositReady: depositApproval.blockers.length === 0,
    walletReady: walletAuthority.state === 'verified',
  };
  const authorityRoot = root('organization-policy-wallet-authority', {
    policyRoot,
    route,
    createdAt,
    actionStatementRoots: actionStatements.map((statement) => statement.statementRoot),
    aggregateWithoutRoot,
  });

  return {
    schema: 'bitcode.organization.policy-wallet-authority',
    statement: 'OrganizationPolicyWalletAuthority',
    createdAt,
    route,
    organization: {
      actorId: normalizedText(input.actorId),
      organizationId: normalizedText(input.organizationId),
      teamId: normalizedText(input.teamId),
      memberId: normalizedText(input.memberId),
      role: normalizeRole(input.organizationRole),
      permissionGrantCount: permissionGrants.length,
    },
    budgetApproval,
    depositApproval,
    walletAuthority,
    actionStatements,
    aggregate: {
      ...aggregateWithoutRoot,
      authorityRoot,
    },
    disclosure: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      valueBearingMainnetAdmitted: false,
    },
    roots: {
      policyRoot,
      budgetPolicyRoot: budgetApproval.policyRoot,
      depositPolicyRoot: depositApproval.policyRoot,
      walletAuthorityRoot: walletAuthority.policyRoot,
      actionStatementRoots: actionStatements.map((statement) => statement.statementRoot),
      authorityRoot,
    },
  };
}

export function assertOrganizationPolicyWalletAuthoritySourceSafe(
  statement: OrganizationPolicyWalletAuthority,
) {
  const serialized = JSON.stringify(statement);
  const lower = serialized.toLowerCase();
  const sourceSafe =
    statement.schema === 'bitcode.organization.policy-wallet-authority' &&
    statement.statement === 'OrganizationPolicyWalletAuthority' &&
    statement.disclosure.sourceSafeMetadataOnly === true &&
    statement.disclosure.protectedSourceVisible === false &&
    statement.disclosure.rawSourceTextVisible === false &&
    statement.disclosure.unpaidAssetPackSourceVisible === false &&
    statement.disclosure.rawPromptVisible === false &&
    statement.disclosure.interpolatedPromptVisible === false &&
    statement.disclosure.rawProviderResponseVisible === false &&
    statement.disclosure.walletPrivateMaterialVisible === false &&
    statement.disclosure.settlementPrivatePayloadVisible === false &&
    statement.disclosure.valueBearingMainnetAdmitted === false &&
    statement.walletAuthority.serverCustody === false &&
    statement.walletAuthority.privateMaterialVisible === false &&
    FORBIDDEN_SOURCE_MARKERS.every((marker) => !lower.includes(marker.toLowerCase()));

  return {
    admitted: sourceSafe,
    reason: sourceSafe
      ? 'source_safe_organization_policy_wallet_authority'
      : 'organization_policy_wallet_authority_source_safety_boundary_violation',
  };
}
