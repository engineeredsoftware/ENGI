import {
  assertNonEmptyString,
} from './constants';
import type {
  BtdAccessDecision,
  BtdAccessDecisionKind,
} from './access';

export type BtdOrganizationRole = 'viewer' | 'member' | 'admin' | 'owner';

export type BtdInterfaceAuthoritySurface =
  | 'terminal'
  | 'api'
  | 'mcp'
  | 'chatgpt_app';

export type BtdOrganizationPermissionAction =
  | 'read_transaction'
  | 'request_read'
  | 'review_need'
  | 'request_finding_fits'
  | 'review_asset_pack_preview'
  | 'pay_btc_fee'
  | 'unlock_asset_pack_source'
  | 'deliver_asset_pack'
  | 'synthesize_deposit_options'
  | 'approve_deposit_option'
  | 'submit_deposit'
  | 'repair_projection'
  | 'administer_organization';

export type BtdOrganizationAuthorityDecisionKind = 'allowed' | 'denied';

export type BtdOrganizationAuthorityReason =
  | 'role_authorized'
  | 'explicit_permission_grant_authorized'
  | 'owner_read_access_authorized'
  | 'licensed_read_access_authorized'
  | 'role_missing'
  | 'role_insufficient'
  | 'wallet_binding_missing'
  | 'registry_read_access_required'
  | 'registry_read_access_denied'
  | 'settlement_required'
  | 'explicit_confirmation_required'
  | 'repair_approval_required'
  | 'interface_action_not_authorized';

export type BtdSettlementAuthorityState = 'not_required' | 'pending' | 'settled';
export type BtdRepairApprovalState = 'not_required' | 'required' | 'approved';
export type BtdSourceVisibilityState =
  | 'source_safe_preview'
  | 'protected_source_allowed'
  | 'blocked';
export type BtdOrganizationPolicyDecisionKind = 'allowed' | 'denied';
export type BtdOrganizationPolicyDenialReason =
  | BtdOrganizationAuthorityReason
  | 'account_missing'
  | 'account_not_admitted'
  | 'organization_missing'
  | 'explicit_permission_grant_required'
  | 'policy_missing'
  | 'interface_not_admitted'
  | 'multisig_approval_required';
export type BtdOrganizationMultiSigReadinessState =
  | 'not_required'
  | 'ready'
  | 'approval_required'
  | 'blocked';
export type BtdOrganizationMultiSigRequiredAction =
  | 'none'
  | 'configure_multisig'
  | 'collect_signatures'
  | 'repair_multisig_policy';

export interface BtdOrganizationRegistryAuthoritySummary {
  organizationId: string;
  source: 'btd_registry';
  walletIds: string[];
  ownedAssetPackIds: string[];
  ownedCellCount: number;
  readLicenseCount: number;
  activeReadLicenseCount: number;
  expiredReadLicenseCount: number;
  revokedReadLicenseCount: number;
  licensedAssetPackIds: string[];
  authorityRoot: string;
}

export interface BtdOrganizationAuthorityActionRequirements {
  minimumRole: BtdOrganizationRole;
  permissionGrants: string[];
  requiresWalletBinding: boolean;
  requiresRegistryReadAccess: boolean;
  requiresSettledPayment: boolean;
  requiresExplicitConfirmation: boolean;
  requiresRepairApproval: boolean;
  sourceVisibilityWhenAllowed: BtdSourceVisibilityState;
}

export interface BtdOrganizationInterfaceAuthorityInput {
  actorId: string;
  organizationId: string;
  organizationRole?: BtdOrganizationRole | null;
  organizationPermissionGrants?: string[];
  interfaceSurface: BtdInterfaceAuthoritySurface;
  action: BtdOrganizationPermissionAction;
  walletId?: string | null;
  readAccessDecision?: BtdAccessDecision | null;
  settlementState?: BtdSettlementAuthorityState;
  confirmed?: boolean;
  repairApprovalState?: BtdRepairApprovalState;
  targetAnchor?: string | null;
  at?: string;
}

export interface BtdOrganizationInterfaceAuthorityDecision {
  kind: 'btd_organization_interface_authority_decision';
  decision: BtdOrganizationAuthorityDecisionKind;
  actorId: string;
  organizationId: string;
  organizationRole: BtdOrganizationRole | null;
  interfaceSurface: BtdInterfaceAuthoritySurface;
  action: BtdOrganizationPermissionAction;
  walletId: string | null;
  targetAnchor: string | null;
  readAccessDecision: BtdAccessDecision | null;
  requirements: BtdOrganizationAuthorityActionRequirements;
  satisfied: {
    role: boolean;
    permissionGrant: boolean;
    walletBinding: boolean;
    registryReadAccess: boolean;
    settlement: boolean;
    explicitConfirmation: boolean;
    repairApproval: boolean;
    interfaceAction: boolean;
  };
  reason: BtdOrganizationAuthorityReason;
  reasons: BtdOrganizationAuthorityReason[];
  sourceVisibility: BtdSourceVisibilityState;
  proofRoots: {
    roleRoot: string;
    permissionRoot: string;
    readAccessRoot: string;
    interfaceRoot: string;
    authorityRoot: string;
  };
  issuedAt: string;
}

export interface BtdOrganizationPolicyMultiSigInput {
  required?: boolean | null;
  requiredSignatures?: number | null;
  presentSignatures?: number | null;
  approverIds?: string[] | null;
  policyRoot?: string | null;
}

export interface BtdOrganizationPolicyAuthorityInput {
  actorId?: string | null;
  organizationId?: string | null;
  teamId?: string | null;
  memberId?: string | null;
  organizationRole?: BtdOrganizationRole | string | null;
  organizationPermissionGrants?: string[] | null;
  interfaceSurface?: BtdInterfaceAuthoritySurface | null;
  action?: BtdOrganizationPermissionAction | null;
  walletId?: string | null;
  readAccessDecision?: BtdAccessDecision | null;
  settlementState?: BtdSettlementAuthorityState | null;
  confirmed?: boolean | null;
  repairApprovalState?: BtdRepairApprovalState | null;
  targetAnchor?: string | null;
  policyId?: string | null;
  policyHash?: string | null;
  accountAdmitted?: boolean | null;
  interfaceAdmitted?: boolean | null;
  multiSig?: BtdOrganizationPolicyMultiSigInput | null;
  recoveryRoute?: string | null;
  at?: string;
}

export interface BtdOrganizationPolicyAuthority {
  kind: 'btd_organization_policy_authority';
  actorId: string | null;
  organizationId: string | null;
  teamId: string | null;
  memberId: string | null;
  role: BtdOrganizationRole | null;
  permissionGrants: string[];
  explicitGrantSet: string[];
  walletBindingRequired: boolean;
  walletBindingState: 'bound' | 'missing' | 'not_required';
  multiSigPosture: {
    state: BtdOrganizationMultiSigReadinessState;
    required: boolean;
    requiredSignatures: number;
    presentSignatures: number;
    approverIds: string[];
    policyRoot: string | null;
    requiredAction: BtdOrganizationMultiSigRequiredAction;
  };
  policy: {
    policyId: string | null;
    policyHash: string | null;
    action: BtdOrganizationPermissionAction;
    interfaceSurface: BtdInterfaceAuthoritySurface;
  };
  actionDecision: BtdOrganizationInterfaceAuthorityDecision | null;
  protectedSourceAction: boolean;
  settlementAdjacentAction: boolean;
  depositAdmissionAction: boolean;
  policyDecision: BtdOrganizationPolicyDecisionKind;
  denialReason: BtdOrganizationPolicyDenialReason | null;
  denialReasons: BtdOrganizationPolicyDenialReason[];
  recoveryRoute: string;
  sourceVisibility: BtdSourceVisibilityState;
  sourceSafetyClass: 'source_safe';
  authorityRoot: string;
}

const ROLE_ORDER: Record<BtdOrganizationRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

const ACTION_REQUIREMENTS: Record<
  BtdOrganizationPermissionAction,
  BtdOrganizationAuthorityActionRequirements
> = {
  read_transaction: {
    minimumRole: 'viewer',
    permissionGrants: ['terminal:read', 'activity:read'],
    requiresWalletBinding: false,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: false,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  request_read: {
    minimumRole: 'member',
    permissionGrants: ['reading:request'],
    requiresWalletBinding: false,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: false,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  review_need: {
    minimumRole: 'member',
    permissionGrants: ['reading:review_need'],
    requiresWalletBinding: false,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: false,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  request_finding_fits: {
    minimumRole: 'member',
    permissionGrants: ['reading:request_finding_fits'],
    requiresWalletBinding: false,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: false,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  review_asset_pack_preview: {
    minimumRole: 'viewer',
    permissionGrants: ['asset_pack:review_preview'],
    requiresWalletBinding: false,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: false,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  pay_btc_fee: {
    minimumRole: 'admin',
    permissionGrants: ['settlement:pay_btc_fee'],
    requiresWalletBinding: true,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: true,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  unlock_asset_pack_source: {
    minimumRole: 'member',
    permissionGrants: ['asset_pack:unlock_source'],
    requiresWalletBinding: true,
    requiresRegistryReadAccess: true,
    requiresSettledPayment: true,
    requiresExplicitConfirmation: false,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'protected_source_allowed',
  },
  deliver_asset_pack: {
    minimumRole: 'member',
    permissionGrants: ['asset_pack:deliver'],
    requiresWalletBinding: true,
    requiresRegistryReadAccess: true,
    requiresSettledPayment: true,
    requiresExplicitConfirmation: true,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'protected_source_allowed',
  },
  synthesize_deposit_options: {
    minimumRole: 'member',
    permissionGrants: ['deposit:synthesize_options'],
    requiresWalletBinding: false,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: false,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  approve_deposit_option: {
    minimumRole: 'admin',
    permissionGrants: ['deposit:approve_option'],
    requiresWalletBinding: true,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: true,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  submit_deposit: {
    minimumRole: 'admin',
    permissionGrants: ['deposit:submit'],
    requiresWalletBinding: true,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: true,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  repair_projection: {
    minimumRole: 'admin',
    permissionGrants: ['settlement:repair_projection'],
    requiresWalletBinding: false,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: true,
    requiresRepairApproval: true,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
  administer_organization: {
    minimumRole: 'owner',
    permissionGrants: ['organization:administer'],
    requiresWalletBinding: false,
    requiresRegistryReadAccess: false,
    requiresSettledPayment: false,
    requiresExplicitConfirmation: true,
    requiresRepairApproval: false,
    sourceVisibilityWhenAllowed: 'source_safe_preview',
  },
};

const SURFACE_ACTIONS: Record<
  BtdInterfaceAuthoritySurface,
  BtdOrganizationPermissionAction[]
> = {
  terminal: [
    'read_transaction',
    'request_read',
    'review_need',
    'request_finding_fits',
    'review_asset_pack_preview',
    'pay_btc_fee',
    'unlock_asset_pack_source',
    'deliver_asset_pack',
    'synthesize_deposit_options',
    'approve_deposit_option',
    'submit_deposit',
    'repair_projection',
    'administer_organization',
  ],
  api: [
    'read_transaction',
    'request_read',
    'review_need',
    'request_finding_fits',
    'review_asset_pack_preview',
    'pay_btc_fee',
    'unlock_asset_pack_source',
    'deliver_asset_pack',
    'synthesize_deposit_options',
    'approve_deposit_option',
    'submit_deposit',
    'repair_projection',
    'administer_organization',
  ],
  mcp: [
    'read_transaction',
    'request_read',
    'review_need',
    'request_finding_fits',
    'review_asset_pack_preview',
    'pay_btc_fee',
    'unlock_asset_pack_source',
    'deliver_asset_pack',
    'synthesize_deposit_options',
    'approve_deposit_option',
    'submit_deposit',
    'repair_projection',
  ],
  chatgpt_app: [
    'read_transaction',
    'review_asset_pack_preview',
    'deliver_asset_pack',
  ],
};

export function listBtdOrganizationAuthorityActionRequirements() {
  return ACTION_REQUIREMENTS;
}

export function summarizeBtdOrganizationRegistryAuthority(input: {
  organizationId: string;
  walletIds?: string[];
  ownershipRows?: Record<string, unknown>[];
  readLicenseRows?: Record<string, unknown>[];
  at?: string;
}): BtdOrganizationRegistryAuthoritySummary {
  const organizationId = assertNonEmptyString(input.organizationId, 'organizationId');
  const walletIds = uniqueStrings(input.walletIds ?? []);
  const ownershipRows = input.ownershipRows ?? [];
  const readLicenseRows = input.readLicenseRows ?? [];
  const at = assertAuthorityDate(input.at ?? new Date().toISOString(), 'at');
  const activeReadLicenseRows = readLicenseRows.filter(
    (row) => readLicenseState(row, at) === 'active',
  );
  const expiredReadLicenseRows = readLicenseRows.filter(
    (row) => readLicenseState(row, at) === 'expired',
  );
  const revokedReadLicenseRows = readLicenseRows.filter(
    (row) => readLicenseState(row, at) === 'revoked',
  );
  const ownedCellCount = ownershipRows.reduce((sum, row) => {
    const start = readNumberField(row, 'range_start', 'rangeStart');
    const end = readNumberField(row, 'range_end_exclusive', 'rangeEndExclusive');
    if (typeof start !== 'number' || typeof end !== 'number' || end <= start) return sum;
    return sum + (end - start);
  }, 0);
  const ownedAssetPackIds = uniqueStrings(
    ownershipRows.map((row) => readOptionalStringField(row, 'asset_pack_id', 'assetPackId')),
  );
  const licensedAssetPackIds = uniqueStrings(
    activeReadLicenseRows.map((row) => readOptionalStringField(row, 'asset_pack_id', 'assetPackId')),
  );
  const summary = {
    organizationId,
    source: 'btd_registry',
    walletIds,
    ownedAssetPackIds,
    ownedCellCount,
    readLicenseCount: readLicenseRows.length,
    activeReadLicenseCount: activeReadLicenseRows.length,
    expiredReadLicenseCount: expiredReadLicenseRows.length,
    revokedReadLicenseCount: revokedReadLicenseRows.length,
    licensedAssetPackIds,
  } satisfies Omit<BtdOrganizationRegistryAuthoritySummary, 'authorityRoot'>;

  return {
    ...summary,
    authorityRoot: stableProofRoot('organization-registry-authority', summary),
  };
}

export function evaluateBtdOrganizationInterfaceAuthority(
  input: BtdOrganizationInterfaceAuthorityInput,
): BtdOrganizationInterfaceAuthorityDecision {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  const organizationId = assertNonEmptyString(input.organizationId, 'organizationId');
  const requirements = ACTION_REQUIREMENTS[input.action];
  if (!requirements) {
    throw new Error('action must be a known BTD organization permission action.');
  }
  const issuedAt = assertAuthorityDate(input.at ?? new Date().toISOString(), 'at').toISOString();
  const organizationRole = input.organizationRole ?? null;
  const permissionGrants = uniqueStrings(input.organizationPermissionGrants ?? []);
  const walletId = normalizeOptionalString(input.walletId);
  const targetAnchor = normalizeOptionalString(input.targetAnchor);
  const readAccessDecision = input.readAccessDecision ?? null;
  const interfaceAction = SURFACE_ACTIONS[input.interfaceSurface]?.includes(input.action) ?? false;
  const role = roleSatisfies(organizationRole, requirements.minimumRole);
  const permissionGrant = requirements.permissionGrants.some((grant) =>
    permissionGrants.includes(grant),
  );
  const walletBinding = !requirements.requiresWalletBinding || Boolean(walletId);
  const registryReadAccess =
    !requirements.requiresRegistryReadAccess ||
    isAllowedReadAccessDecision(readAccessDecision?.decision);
  const settlement =
    !requirements.requiresSettledPayment || input.settlementState === 'settled';
  const explicitConfirmation =
    !requirements.requiresExplicitConfirmation || input.confirmed === true;
  const repairApproval =
    !requirements.requiresRepairApproval || input.repairApprovalState === 'approved';
  const reasons: BtdOrganizationAuthorityReason[] = [];

  if (!interfaceAction) reasons.push('interface_action_not_authorized');
  if (!organizationRole) reasons.push('role_missing');
  else if (!role && !permissionGrant) reasons.push('role_insufficient');
  if (requirements.requiresWalletBinding && !walletBinding) reasons.push('wallet_binding_missing');
  if (requirements.requiresRegistryReadAccess && !readAccessDecision) {
    reasons.push('registry_read_access_required');
  } else if (requirements.requiresRegistryReadAccess && !registryReadAccess) {
    reasons.push('registry_read_access_denied');
  }
  if (requirements.requiresSettledPayment && !settlement) reasons.push('settlement_required');
  if (requirements.requiresExplicitConfirmation && !explicitConfirmation) {
    reasons.push('explicit_confirmation_required');
  }
  if (requirements.requiresRepairApproval && !repairApproval) reasons.push('repair_approval_required');

  const allowed =
    interfaceAction &&
    (role || permissionGrant) &&
    walletBinding &&
    registryReadAccess &&
    settlement &&
    explicitConfirmation &&
    repairApproval;
  const successReasons = successAuthorityReasons({
    role,
    permissionGrant,
    readAccessDecision,
  });
  const finalReasons = allowed ? successReasons : reasons;
  const decision = allowed ? 'allowed' : 'denied';
  const sourceVisibility = allowed
    ? requirements.sourceVisibilityWhenAllowed
    : requirements.requiresRegistryReadAccess || requirements.requiresSettledPayment
      ? 'blocked'
      : 'source_safe_preview';
  const proofRoots = {
    roleRoot: stableProofRoot('organization-role', {
      organizationId,
      actorId,
      organizationRole,
      permissionGrants,
    }),
    permissionRoot: stableProofRoot('organization-permission', {
      action: input.action,
      requirements,
      satisfiedByRole: role,
      satisfiedByGrant: permissionGrant,
    }),
    readAccessRoot: stableProofRoot('organization-read-access', readAccessDecision),
    interfaceRoot: stableProofRoot('interface-authority', {
      interfaceSurface: input.interfaceSurface,
      action: input.action,
      interfaceAction,
    }),
    authorityRoot: '',
  };
  proofRoots.authorityRoot = stableProofRoot('organization-interface-authority', {
    actorId,
    organizationId,
    organizationRole,
    interfaceSurface: input.interfaceSurface,
    action: input.action,
    decision,
    reasons: finalReasons,
    sourceVisibility,
    targetAnchor,
    roleRoot: proofRoots.roleRoot,
    permissionRoot: proofRoots.permissionRoot,
    readAccessRoot: proofRoots.readAccessRoot,
    interfaceRoot: proofRoots.interfaceRoot,
  });

  return {
    kind: 'btd_organization_interface_authority_decision',
    decision,
    actorId,
    organizationId,
    organizationRole,
    interfaceSurface: input.interfaceSurface,
    action: input.action,
    walletId,
    targetAnchor,
    readAccessDecision,
    requirements,
    satisfied: {
      role,
      permissionGrant,
      walletBinding,
      registryReadAccess,
      settlement,
      explicitConfirmation,
      repairApproval,
      interfaceAction,
    },
    reason: finalReasons[0] ?? 'role_authorized',
    reasons: finalReasons,
    sourceVisibility,
    proofRoots,
    issuedAt,
  };
}

export function buildBtdOrganizationPolicyAuthority(
  input: BtdOrganizationPolicyAuthorityInput,
): BtdOrganizationPolicyAuthority {
  const actorId = normalizeOptionalString(input.actorId);
  const organizationId = normalizeOptionalString(input.organizationId);
  const teamId = normalizeOptionalString(input.teamId);
  const memberId = normalizeOptionalString(input.memberId);
  const organizationRole = normalizeOrganizationRole(input.organizationRole);
  const action = normalizePermissionAction(input.action) ?? 'deliver_asset_pack';
  const interfaceSurface = normalizeAuthoritySurface(input.interfaceSurface) ?? 'terminal';
  const requirements = ACTION_REQUIREMENTS[action];
  const permissionGrants = uniqueStrings(input.organizationPermissionGrants ?? []);
  const explicitGrantSet = permissionGrants.filter((grant) =>
    requirements.permissionGrants.includes(grant),
  );
  const walletId = normalizeOptionalString(input.walletId);
  const policyId = normalizeOptionalString(input.policyId);
  const policyHash = normalizeOptionalString(input.policyHash);
  const protectedSourceAction =
    action === 'unlock_asset_pack_source' || action === 'deliver_asset_pack';
  const settlementAdjacentAction =
    action === 'pay_btc_fee' ||
    action === 'unlock_asset_pack_source' ||
    action === 'deliver_asset_pack' ||
    action === 'repair_projection';
  const depositAdmissionAction =
    action === 'synthesize_deposit_options' ||
    action === 'approve_deposit_option' ||
    action === 'submit_deposit';
  const accountAdmitted = input.accountAdmitted === true;
  const interfaceAdmitted = input.interfaceAdmitted === true;
  const multiSigPosture = buildMultiSigPosture(input.multiSig);
  const actionDecision =
    actorId && organizationId
      ? evaluateBtdOrganizationInterfaceAuthority({
          actorId,
          organizationId,
          organizationRole,
          organizationPermissionGrants: permissionGrants,
          interfaceSurface,
          action,
          walletId,
          readAccessDecision: input.readAccessDecision ?? null,
          settlementState: input.settlementState ?? undefined,
          confirmed: input.confirmed === true,
          repairApprovalState: input.repairApprovalState ?? undefined,
          targetAnchor: input.targetAnchor ?? null,
          at: input.at,
        })
      : null;
  const denialReasons: BtdOrganizationPolicyDenialReason[] = [];

  if (!actorId) denialReasons.push('account_missing');
  if (!accountAdmitted) denialReasons.push('account_not_admitted');
  if (!organizationId) denialReasons.push('organization_missing');
  if (!organizationRole) denialReasons.push('role_missing');
  if (!explicitGrantSet.length) denialReasons.push('explicit_permission_grant_required');
  if (requirements.requiresWalletBinding && !walletId) denialReasons.push('wallet_binding_missing');
  if ((protectedSourceAction || settlementAdjacentAction || depositAdmissionAction) && !policyHash && !policyId) {
    denialReasons.push('policy_missing');
  }
  if (!interfaceAdmitted) denialReasons.push('interface_not_admitted');
  if (multiSigPosture.state === 'approval_required' || multiSigPosture.state === 'blocked') {
    denialReasons.push('multisig_approval_required');
  }
  if (actionDecision?.decision === 'denied') {
    denialReasons.push(...actionDecision.reasons);
  }

  const uniqueDenialReasons = uniqueStrings(denialReasons) as BtdOrganizationPolicyDenialReason[];
  const policyDecision: BtdOrganizationPolicyDecisionKind =
    actionDecision?.decision === 'allowed' && uniqueDenialReasons.length === 0
      ? 'allowed'
      : 'denied';
  const sourceVisibility =
    policyDecision === 'allowed'
      ? actionDecision?.sourceVisibility ?? requirements.sourceVisibilityWhenAllowed
      : protectedSourceAction || settlementAdjacentAction
        ? 'blocked'
        : 'source_safe_preview';
  const withoutRoot = {
    kind: 'btd_organization_policy_authority' as const,
    actorId,
    organizationId,
    teamId,
    memberId,
    role: organizationRole,
    permissionGrants,
    explicitGrantSet,
    walletBindingRequired: requirements.requiresWalletBinding,
    walletBindingState: requirements.requiresWalletBinding
      ? walletId
        ? 'bound' as const
        : 'missing' as const
      : 'not_required' as const,
    multiSigPosture,
    policy: {
      policyId,
      policyHash,
      action,
      interfaceSurface,
    },
    actionDecision,
    protectedSourceAction,
    settlementAdjacentAction,
    depositAdmissionAction,
    policyDecision,
    denialReason: uniqueDenialReasons[0] ?? null,
    denialReasons: uniqueDenialReasons,
    recoveryRoute: normalizeOptionalString(input.recoveryRoute) ?? recoveryRouteForDenial(uniqueDenialReasons[0]),
    sourceVisibility,
    sourceSafetyClass: 'source_safe' as const,
  };

  return {
    ...withoutRoot,
    authorityRoot: stableProofRoot('organization-policy-authority', withoutRoot),
  };
}

function buildMultiSigPosture(input?: BtdOrganizationPolicyMultiSigInput | null): BtdOrganizationPolicyAuthority['multiSigPosture'] {
  const requiredSignatures = readSafePositiveInteger(input?.requiredSignatures) ?? 0;
  const presentSignatures = readSafePositiveInteger(input?.presentSignatures) ?? 0;
  const required = input?.required === true || requiredSignatures > 0;
  const approverIds = uniqueStrings(input?.approverIds ?? []);
  const policyRoot = normalizeOptionalString(input?.policyRoot);

  if (!required) {
    return {
      state: 'not_required',
      required: false,
      requiredSignatures: 0,
      presentSignatures: 0,
      approverIds,
      policyRoot,
      requiredAction: 'none',
    };
  }

  if (requiredSignatures <= 0) {
    return {
      state: 'blocked',
      required: true,
      requiredSignatures: 0,
      presentSignatures,
      approverIds,
      policyRoot,
      requiredAction: 'configure_multisig',
    };
  }

  if (presentSignatures >= requiredSignatures) {
    return {
      state: 'ready',
      required: true,
      requiredSignatures,
      presentSignatures,
      approverIds,
      policyRoot,
      requiredAction: 'none',
    };
  }

  return {
    state: 'approval_required',
    required: true,
    requiredSignatures,
    presentSignatures,
    approverIds,
    policyRoot,
    requiredAction: 'collect_signatures',
  };
}

function recoveryRouteForDenial(reason: BtdOrganizationPolicyDenialReason | undefined): string {
  if (!reason) return '/packs?auxillary-open-to=profile';
  if (reason === 'wallet_binding_missing') return '/packs?auxillary-open-to=wallet';
  if (reason === 'interface_not_admitted' || reason === 'interface_action_not_authorized') {
    return '/packs?auxillary-open-to=interfaces';
  }
  if (reason === 'registry_read_access_required' || reason === 'registry_read_access_denied' || reason === 'settlement_required') {
    return '/packs?auxillary-open-to=wallet';
  }
  return '/packs?auxillary-open-to=profile';
}

function roleSatisfies(
  role: BtdOrganizationRole | null,
  minimumRole: BtdOrganizationRole,
): boolean {
  if (!role) return false;
  return ROLE_ORDER[role] >= ROLE_ORDER[minimumRole];
}

function isAllowedReadAccessDecision(
  decision: BtdAccessDecisionKind | undefined,
): boolean {
  return decision === 'owner_read' || decision === 'licensed_read';
}

function successAuthorityReasons(input: {
  role: boolean;
  permissionGrant: boolean;
  readAccessDecision: BtdAccessDecision | null;
}): BtdOrganizationAuthorityReason[] {
  const reasons: BtdOrganizationAuthorityReason[] = [];
  if (input.role) reasons.push('role_authorized');
  if (input.permissionGrant) reasons.push('explicit_permission_grant_authorized');
  if (input.readAccessDecision?.decision === 'owner_read') {
    reasons.push('owner_read_access_authorized');
  }
  if (input.readAccessDecision?.decision === 'licensed_read') {
    reasons.push('licensed_read_access_authorized');
  }
  return reasons.length ? reasons : ['role_authorized'];
}

function readLicenseState(
  row: Record<string, unknown>,
  at: Date,
): 'active' | 'expired' | 'revoked' | 'pending' {
  const validFrom = readDateField(row, 'valid_from', 'validFrom');
  const expiresAt = readDateField(row, 'expires_at', 'expiresAt');
  const revokedAt = readDateField(row, 'revoked_at', 'revokedAt');

  if (revokedAt) return 'revoked';
  if (validFrom && validFrom > at) return 'pending';
  if (expiresAt && expiresAt <= at) return 'expired';
  return 'active';
}

function readDateField(row: Record<string, unknown>, ...keys: string[]): Date | null {
  const value = readOptionalStringField(row, ...keys);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function readNumberField(row: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isSafeInteger(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isSafeInteger(parsed)) return parsed;
    }
  }
  return null;
}

function readOptionalStringField(row: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeOrganizationRole(value: BtdOrganizationRole | string | null | undefined): BtdOrganizationRole | null {
  if (value === 'viewer' || value === 'member' || value === 'admin' || value === 'owner') {
    return value;
  }
  if (value === 'lead') return 'admin';
  if (value === 'dev') return 'member';
  return null;
}

function normalizePermissionAction(value: BtdOrganizationPermissionAction | string | null | undefined): BtdOrganizationPermissionAction | null {
  return typeof value === 'string' && value in ACTION_REQUIREMENTS
    ? value as BtdOrganizationPermissionAction
    : null;
}

function normalizeAuthoritySurface(value: BtdInterfaceAuthoritySurface | string | null | undefined): BtdInterfaceAuthoritySurface | null {
  return value === 'terminal' || value === 'api' || value === 'mcp' || value === 'chatgpt_app'
    ? value
    : null;
}

function readSafePositiveInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed) && parsed >= 0) return parsed;
  }
  return null;
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean),
    ),
  );
}

function assertAuthorityDate(value: string, label: string): Date {
  const parsed = new Date(assertNonEmptyString(value, label));
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} must be a valid ISO timestamp.`);
  }
  return parsed;
}

function stableProofRoot(scope: string, value: unknown): string {
  return `btd-proof-root:${scope}:${stableHash(stableSerialize(value))}`;
}

function stableSerialize(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
