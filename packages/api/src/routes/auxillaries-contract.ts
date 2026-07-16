import { createHash } from 'crypto';
import {
  buildBtdOrganizationPolicyAuthority,
  buildBtdWalletBtdSupportProjection,
} from '@bitcode/btd';
import type { BtdOrganizationPolicyAuthority } from '@bitcode/btd';

export const AUXILLARY_FLOW_STEPS = ['wallet', 'externals', 'profile', 'interfaces'] as const;
export const AUXILLARIES_CONTRACT_VERSION = 'v31-draft-auxillaries-contracts' as const;

export type ConcreteAuxillaryPane = (typeof AUXILLARY_FLOW_STEPS)[number];

type UnknownRecord = Record<string, unknown>;

export type AuxillariesReadinessState = 'ready' | 'degraded' | 'blocked' | 'unknown';
export type AuxillariesSourceSafetyClass =
  | 'source_safe'
  | 'secret_free_summary'
  | 'protected_source_redacted';
export type AuxillariesDiagnosticSeverity = 'info' | 'warning' | 'blocking';
export type AuxillariesRetryPolicy = 'manual_retry' | 'after_repair' | 'not_retryable';
export type AuxillariesProfileRepairSeverity = 'blocking' | 'recoverable';
export type AuxillariesNotificationState = 'ready' | 'attention_needed' | 'contact_missing' | 'unknown';
export type AuxillariesDataSharingState = 'configured' | 'limited' | 'not_configured' | 'unknown';
export type AuxillariesProviderTokenPresenceClass = 'present_source_safe' | 'missing' | 'invalid' | 'unknown';
export type AuxillariesProviderScopesClass =
  | 'repo_read_write'
  | 'repo_read_only'
  | 'metadata_only'
  | 'missing'
  | 'unknown';
export type AuxillariesProviderReadbackStatus = 'succeeded' | 'failed' | 'not_attempted' | 'unknown';
export type AuxillariesTelemetrySubject =
  | 'profile'
  | 'account'
  | 'provider_connection'
  | 'interface_admission'
  | 'wallet'
  | 'btd_pane'
  | 'organization_authority'
  | 'policy_decision'
  | 'readiness_diagnostic'
  | 'recovery_run';
export type AuxillariesRepairOutcome = 'not_started' | 'running' | 'succeeded' | 'failed' | 'not_required';

const CANONICAL_AUXILLARY_PANES = new Set<string>(AUXILLARY_FLOW_STEPS);
const AUXILLARY_PANE_ALIASES: Record<string, ConcreteAuxillaryPane> = {
  btd: 'wallet',
  connects: 'externals',
  external: 'externals',
};
const AUXILLARIES_TELEMETRY_SUBJECTS = new Set<string>([
  'profile',
  'account',
  'provider_connection',
  'interface_admission',
  'wallet',
  'btd_pane',
  'organization_authority',
  'policy_decision',
  'readiness_diagnostic',
  'recovery_run',
]);
const AUXILLARIES_REPAIR_OUTCOMES = new Set<string>([
  'not_started',
  'running',
  'succeeded',
  'failed',
  'not_required',
]);
const AUXILLARIES_RECOVERY_OUTCOMES = new Set<string>([
  'not_started',
  'running',
  'succeeded',
  'failed',
]);

const REDACTED_VALUE = '[redacted]';
const PROTECTED_SOURCE_REDACTED_VALUE = '[protected-source-redacted]';
const SENSITIVE_KEY_PATTERN =
  /(?:secret|api[_-]?key|private[_-]?key|password|credential|authorization|access[_-]?token|refresh[_-]?token|oauth[_-]?token|bearer|openai|service[_-]?role|database[_-]?url|supabase[_-]?service)/iu;
const PROTECTED_SOURCE_KEY_PATTERN =
  /(?:protected[_-]?source|private[_-]?source|source[_-]?content|source[_-]?text|asset[_-]?pack[_-]?source|raw[_-]?prompt|private[_-]?prompt|interpolated[_-]?prompt)/iu;

export interface AuxillaryOnboardingPayload {
  completedPanes: ConcreteAuxillaryPane[];
  currentPane: ConcreteAuxillaryPane | null;
  completedSteps: ConcreteAuxillaryPane[];
  currentStep: ConcreteAuxillaryPane | null;
  isOnboardingComplete: boolean;
}

export interface AuxillaryOnboardingUpdatePayload {
  completedPane?: string;
}

export interface AuxillaryDataPayload {
  profile: unknown | null;
  githubConnection: unknown | null;
  walletConnectionStatus: unknown | null;
  repositoryConnectionStatus: unknown | null;
  repositories: unknown[];
  organizations: string[];
  repositoryInventorySource: string | null;
  btdBalance: number;
  btcFeeBalance: number | null;
  recentBtdAssetPacks: AuxillaryBtdAssetPackSummary[];
  modelPreferences: unknown | null;
  templatePreferences: unknown | null;
  notificationPosture: AuxillariesNotificationPosture;
  dataSharingPosture: AuxillariesDataSharingPosture;
  onboardedPanes: ConcreteAuxillaryPane[];
  onboarded_steps: ConcreteAuxillaryPane[];
  isOnboardingComplete: boolean;
  auxillariesContract: AuxillariesContractSnapshot;
  profileState: AuxillariesProfileState;
  connectionReadiness: AuxillariesConnectionReadiness[];
  interfaceAdmissions: AuxillariesInterfaceAdmission[];
  walletBtdPaneState: AuxillariesWalletBtdPaneState;
  organizationAuthority: OrganizationPolicyAuthority;
  readinessDiagnostics: AuxillariesReadinessDiagnostic[];
  recoveryRuns: AuxillariesRecoveryRun[];
  telemetryProofHooks: AuxillariesTelemetryProofHook[];
}

export interface AuxillaryBtdAssetPackSummary {
  assetPackId: string;
  label?: string;
  rangeStart?: number;
  rangeEndExclusive?: number;
  readRightState?: 'owner_read' | 'licensed_read' | 'pending_settlement' | 'denied' | 'unknown';
  accessPolicyHash?: string | null;
  sourceSafePreviewRoot?: string | null;
  acquiredAt?: string | null;
}

export interface AuxillariesProfileRepairRoute {
  issueId: string;
  pane: ConcreteAuxillaryPane;
  route: string;
  label: string;
  retryPolicy: AuxillariesRetryPolicy;
}

export interface AuxillariesProfileCompletenessIssue {
  id: string;
  severity: AuxillariesProfileRepairSeverity;
  summary: string;
  requiredAction: string;
  repairRoute: AuxillariesProfileRepairRoute;
}

export interface AuxillariesAccountIdentity {
  userId: string | null;
  username: string | null;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  companyName: string | null;
  role: string | null;
}

export interface AuxillariesPreferencePosture {
  model: {
    configured: boolean;
    provider: string | null;
    model: string | null;
    preferenceRoot: string;
  };
  templates: {
    configured: boolean;
    shippableTemplateCount: number;
    evidenceDocumentTemplateCount: number;
    autoSaveTemplates: boolean;
    preferenceRoot: string;
  };
}

export interface AuxillariesNotificationPosture {
  state: AuxillariesNotificationState;
  email: string | null;
  emailVerified: boolean;
  unreadCount: number;
  latestNotificationAt: string | null;
  sourceSafetyClass: AuxillariesSourceSafetyClass;
  notificationRoot: string;
}

export interface AuxillariesDataSharingPosture {
  state: AuxillariesDataSharingState;
  repositoryCount: number;
  enabledRepositoryCount: number;
  disabledRepositoryCount: number;
  sourceSafetyClass: AuxillariesSourceSafetyClass;
  dataSharingRoot: string;
}

export interface AuxillariesProfileState {
  kind: 'AuxillariesProfileState';
  userId: string | null;
  username: string | null;
  displayName: string | null;
  email: string | null;
  companyName: string | null;
  role: string | null;
  accountReadiness: AuxillariesReadinessState;
  accountIdentity: AuxillariesAccountIdentity;
  profileCompleteness: {
    complete: boolean;
    blockers: string[];
    issues: AuxillariesProfileCompletenessIssue[];
    repairRoutes: AuxillariesProfileRepairRoute[];
  };
  walletBinding: {
    address: string | null;
    provider: string | null;
    status: string | null;
    boundAt: string | null;
  } | null;
  modelPreferencesConfigured: boolean;
  templatePreferencesConfigured: boolean;
  preferences: AuxillariesPreferencePosture;
  notificationPosture: AuxillariesNotificationPosture;
  dataSharingPosture: AuxillariesDataSharingPosture;
  sourceSafetyClass: AuxillariesSourceSafetyClass;
  profileCompletenessRoot: string;
}

export interface AuxillariesConnectionReadiness {
  kind: 'AuxillariesConnectionReadiness';
  providerId: string;
  providerName: string;
  provider: string;
  connected: boolean;
  valid: boolean;
  accountLabel: string | null;
  installationState: 'installed' | 'missing' | 'unknown';
  credentialPosture:
    | 'present_source_safe'
    | 'missing'
    | 'invalid'
    | 'unknown';
  tokenPresenceClass: AuxillariesProviderTokenPresenceClass;
  scopesClass: AuxillariesProviderScopesClass;
  lastReadbackStatus: AuxillariesProviderReadbackStatus;
  lastReadbackAt: string | null;
  blocker: string | null;
  requiredRepairAction:
    | 'none'
    | 'connect_provider'
    | 'reauthorize_provider'
    | 'repair_provider_inventory';
  repairAction:
    | 'none'
    | 'connect_provider'
    | 'reauthorize_provider'
    | 'repair_provider_inventory';
  sourceSafetyClass: AuxillariesSourceSafetyClass;
  metadata: Record<string, unknown>;
  providerReadinessRoot: string;
}

export interface AuxillariesInterfaceAdmission {
  kind: 'AuxillariesInterfaceAdmission';
  interfaceId: string;
  surface: 'product' | 'api' | 'mcp' | 'chatgpt_app' | 'exchange' | 'future_hook';
  authMode: 'session' | 'api_key' | 'provider_oauth' | 'wallet_signature' | 'not_admitted';
  readiness: AuxillariesReadinessState;
  policyRequirements: string[];
  policyConstraints: string[];
  supportedActions: string[];
  allowedActions: string[];
  blockers: string[];
  sourceSafetyClass: AuxillariesSourceSafetyClass;
  deferredProductDepth: 'none' | 'exchange_market_law' | 'conversations_product_depth' | 'future_interface_contract';
  interfaceAdmissionRoot: string;
}

export interface AuxillariesWalletBtdPaneState {
  kind: 'AuxillariesWalletBtdPaneState';
  walletCapability: {
    hasBinding: boolean;
    provider: string | null;
    address: string | null;
    verificationState: string | null;
    network: string | null;
    noCustody: true;
    serverCustody: false;
    capabilities: Array<'message_sign' | 'psbt_sign' | 'rights_transfer'>;
    walletCapabilityRoot: string;
  };
  signerPosture: {
    ready: boolean;
    state: 'verified' | 'manual' | 'pending' | 'missing' | 'invalid';
    requiredAction: 'none' | 'connect_wallet' | 'verify_wallet_signature' | 'repair_wallet_binding';
    canSignPsbt: boolean;
    canSignRightsTransfer: boolean;
    serverCustody: false;
  };
  networkReadiness: {
    state: AuxillariesReadinessState;
    network: string | null;
    requiredAction: 'none' | 'connect_wallet' | 'verify_network' | 'repair_wallet_binding';
    blocker: string | null;
  };
  btdReadRightSummary: {
    aggregateBtd: number;
    assetPackCount: number;
    recentAssetPackIds: string[];
    rangeCount: number;
    totalRangeCells: number;
    ownerReadCount: number;
    licensedReadCount: number;
    pendingSettlementCount: number;
    deniedCount: number;
    unknownCount: number;
    protectedSourceVisible: false;
    sourceSafePreviewRoots: string[];
  };
  treasurySummary: {
    btcFeeBalance: number | null;
    feeAsset: 'BTC';
    noCustody: true;
    treasuryScope: 'account';
    organizationTreasurySeparated: true;
    exchangeMarketState: 'not_exchange_market_state';
  };
  settlementReadiness: AuxillariesReadinessState;
  settlementBlockers: string[];
  sourceSafetyClass: AuxillariesSourceSafetyClass;
  btdSupportRoot: string;
}

export type OrganizationPolicyAuthority = BtdOrganizationPolicyAuthority;

export interface AuxillariesReadinessDiagnostic {
  kind: 'AuxillariesReadinessDiagnostic';
  pane: ConcreteAuxillaryPane;
  blockerId: string;
  severity: AuxillariesDiagnosticSeverity;
  summary: string;
  requiredAction: string;
  repairRoute: string;
  retryPolicy: AuxillariesRetryPolicy;
  proofRoot: string;
}

export interface AuxillariesRecoveryRun {
  kind: 'AuxillariesRecoveryRun';
  targetPane: ConcreteAuxillaryPane;
  repairAction: string;
  blockerId: string | null;
  beforeReadinessRoot: string;
  afterReadinessRoot: string | null;
  executionId: string | null;
  outcome: 'not_started' | 'running' | 'succeeded' | 'failed';
  retryPolicy: AuxillariesRetryPolicy;
  startedAt: string | null;
  completedAt: string | null;
  evidenceRoot: string;
  telemetryRoot: string;
  sourceSafetyClass: AuxillariesSourceSafetyClass;
  recoveryRoot: string;
}

export interface AuxillariesTelemetryProofHook {
  kind: 'AuxillariesTelemetryProofHook';
  subject: AuxillariesTelemetrySubject;
  subjectId: string;
  pane: ConcreteAuxillaryPane;
  theoremId: string;
  replayStepId: string;
  evidenceRoot: string;
  telemetryRoot: string;
  blockerId: string | null;
  repairOutcome: AuxillariesRepairOutcome;
  sourceSafetyClass: AuxillariesSourceSafetyClass;
  proofRoot: string;
}

export interface AuxillariesContractSnapshot {
  kind: 'auxillaries_contract_snapshot';
  contractVersion: typeof AUXILLARIES_CONTRACT_VERSION;
  sourceSafetyClass: AuxillariesSourceSafetyClass;
  profileState: AuxillariesProfileState;
  connectionReadiness: AuxillariesConnectionReadiness[];
  interfaceAdmissions: AuxillariesInterfaceAdmission[];
  walletBtdPaneState: AuxillariesWalletBtdPaneState;
  organizationAuthority: OrganizationPolicyAuthority;
  readinessDiagnostics: AuxillariesReadinessDiagnostic[];
  recoveryRuns: AuxillariesRecoveryRun[];
  telemetryProofHooks: AuxillariesTelemetryProofHook[];
  contractRoot: string;
}

export interface AuxillariesContractValidationResult {
  valid: boolean;
  errors: string[];
}

export interface BuildAuxillariesContractSnapshotInput {
  profile: unknown | null;
  githubConnection: unknown | null;
  walletConnectionStatus?: unknown | null;
  repositoryConnectionStatus?: unknown | null;
  repositories?: unknown[] | null;
  organizations?: string[] | null;
  btdBalance?: number;
  btcFeeBalance?: number | null;
  recentBtdAssetPacks?: AuxillaryBtdAssetPackSummary[] | null;
  modelPreferences?: unknown | null;
  templatePreferences?: unknown | null;
  notificationRows?: unknown[] | null;
  notificationPosture?: unknown | null;
  dataSharingPosture?: unknown | null;
  recoveryRuns?: AuxillariesRecoveryRun[] | null;
  telemetryProofHooks?: AuxillariesTelemetryProofHook[] | null;
}

export function normalizeAuxillaryPane(value: string | null | undefined): ConcreteAuxillaryPane | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  const alias = AUXILLARY_PANE_ALIASES[normalized];
  if (alias) return alias;
  return CANONICAL_AUXILLARY_PANES.has(normalized) ? (normalized as ConcreteAuxillaryPane) : null;
}

export function normalizeAuxillarySteps(value: unknown): ConcreteAuxillaryPane[] {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((entry) => normalizeAuxillaryPane(String(entry || '')))
    .filter((entry): entry is ConcreteAuxillaryPane => Boolean(entry));

  return Array.from(new Set(normalized));
}

export function parseStoredAuxillarySteps(value: unknown): ConcreteAuxillaryPane[] {
  if (Array.isArray(value)) {
    return normalizeAuxillarySteps(value);
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return normalizeAuxillarySteps(parsed);
      }
    } catch {
      const normalized = normalizeAuxillarySteps([value]);
      if (normalized.length) {
        return normalized;
      }
    }
  }

  return [];
}

export function serializeAuxillarySteps(steps: readonly ConcreteAuxillaryPane[]) {
  return JSON.stringify(normalizeAuxillarySteps([...steps]));
}

export function isAuxillaryOnboardingComplete(steps: readonly ConcreteAuxillaryPane[]) {
  return normalizeAuxillarySteps([...steps]).length === AUXILLARY_FLOW_STEPS.length;
}

export function buildAuxillaryOnboardingPayload(
  completedSteps: readonly ConcreteAuxillaryPane[],
): AuxillaryOnboardingPayload {
  const completedPanes = normalizeAuxillarySteps([...completedSteps]);
  const currentPane = AUXILLARY_FLOW_STEPS.find((step) => !completedPanes.includes(step)) || null;

  return {
    completedPanes,
    currentPane,
    completedSteps: completedPanes,
    currentStep: currentPane,
    isOnboardingComplete: isAuxillaryOnboardingComplete(completedPanes),
  };
}

export function buildAnonymousAuxillaryData(): AuxillaryDataPayload {
  return buildAuxillaryDataPayload({
    profile: null,
    githubConnection: null,
    walletConnectionStatus: null,
    repositoryConnectionStatus: null,
    repositories: [],
    repositoryInventorySource: null,
    btdBalance: 0,
    btcFeeBalance: null,
    recentBtdAssetPacks: [],
    modelPreferences: null,
    templatePreferences: null,
    notificationRows: [],
    onboardedSteps: [],
  });
}

export function buildAuxillaryDataPayloadFromUnknown(value: unknown): AuxillaryDataPayload {
  const record = asRecord(value);
  if (!record) {
    return buildAnonymousAuxillaryData();
  }

  return buildAuxillaryDataPayload({
    profile: record.profile ?? null,
    githubConnection: record.githubConnection ?? null,
    walletConnectionStatus: record.walletConnectionStatus ?? null,
    repositoryConnectionStatus: record.repositoryConnectionStatus ?? null,
    repositories: Array.isArray(record.repositories) ? record.repositories : [],
    repositoryInventorySource: readString(record.repositoryInventorySource),
    btdBalance: typeof record.btdBalance === 'number' ? record.btdBalance : 0,
    btcFeeBalance: typeof record.btcFeeBalance === 'number' ? record.btcFeeBalance : null,
    recentBtdAssetPacks: Array.isArray(record.recentBtdAssetPacks)
      ? record.recentBtdAssetPacks as AuxillaryBtdAssetPackSummary[]
      : [],
    modelPreferences: record.modelPreferences ?? null,
    templatePreferences: record.templatePreferences ?? null,
    notificationPosture: record.notificationPosture ?? null,
    dataSharingPosture: record.dataSharingPosture ?? null,
    recoveryRuns: Array.isArray(record.recoveryRuns)
      ? record.recoveryRuns as AuxillariesRecoveryRun[]
      : [],
    telemetryProofHooks: Array.isArray(record.telemetryProofHooks)
      ? record.telemetryProofHooks as AuxillariesTelemetryProofHook[]
      : [],
    onboardedSteps: record.onboardedPanes ?? record.onboarded_steps ?? [],
  });
}

export function buildAuxillaryDataPayload({
  profile,
  githubConnection,
  walletConnectionStatus,
  repositoryConnectionStatus,
  repositories,
  repositoryInventorySource,
  btdBalance,
  btcFeeBalance,
  recentBtdAssetPacks,
  modelPreferences,
  templatePreferences,
  notificationRows,
  notificationPosture,
  dataSharingPosture,
  recoveryRuns,
  telemetryProofHooks,
  onboardedSteps,
}: {
  profile: unknown | null;
  githubConnection: unknown | null;
  walletConnectionStatus?: unknown | null;
  repositoryConnectionStatus?: unknown | null;
  repositories?: unknown[] | null;
  repositoryInventorySource?: string | null;
  btdBalance?: number;
  btcFeeBalance?: number | null;
  recentBtdAssetPacks?: AuxillaryBtdAssetPackSummary[] | null;
  modelPreferences: unknown | null;
  templatePreferences?: unknown | null;
  notificationRows?: unknown[] | null;
  notificationPosture?: unknown | null;
  dataSharingPosture?: unknown | null;
  recoveryRuns?: AuxillariesRecoveryRun[] | null;
  telemetryProofHooks?: AuxillariesTelemetryProofHook[] | null;
  onboardedSteps: unknown;
}): AuxillaryDataPayload {
  const onboardedPanes = parseStoredAuxillarySteps(onboardedSteps);
  const resolvedBtdBalance = typeof btdBalance === 'number' ? btdBalance : 0;
  const resolvedBtcFeeBalance = typeof btcFeeBalance === 'number' && Number.isFinite(btcFeeBalance)
    ? btcFeeBalance
    : null;
  const safeRepositories = Array.isArray(repositories)
    ? repositories.map((repository) => toAuxillariesJsonSafe(repository))
    : [];
  const organizations = deriveOrganizationsFromRepositories(safeRepositories);
  const safeRecentAssetPacks = Array.isArray(recentBtdAssetPacks) ? recentBtdAssetPacks : [];
  const auxillariesContract = buildAuxillariesContractSnapshot({
    profile,
    githubConnection,
    walletConnectionStatus,
    repositoryConnectionStatus,
    repositories: safeRepositories,
    organizations,
    btdBalance: resolvedBtdBalance,
    btcFeeBalance: resolvedBtcFeeBalance,
    recentBtdAssetPacks: safeRecentAssetPacks,
    modelPreferences,
    templatePreferences,
    notificationRows,
    notificationPosture,
    dataSharingPosture,
    recoveryRuns,
    telemetryProofHooks,
  });

  return {
    profile: toAuxillariesJsonSafe(profile),
    githubConnection: toAuxillariesJsonSafe(githubConnection),
    walletConnectionStatus: toAuxillariesJsonSafe(walletConnectionStatus ?? null),
    repositoryConnectionStatus: toAuxillariesJsonSafe(repositoryConnectionStatus ?? null),
    repositories: safeRepositories,
    organizations,
    repositoryInventorySource:
      typeof repositoryInventorySource === 'string' && repositoryInventorySource.trim()
        ? repositoryInventorySource
        : null,
    btdBalance: resolvedBtdBalance,
    btcFeeBalance: resolvedBtcFeeBalance,
    recentBtdAssetPacks: safeRecentAssetPacks,
    modelPreferences: toAuxillariesJsonSafe(modelPreferences),
    templatePreferences: toAuxillariesJsonSafe(templatePreferences ?? null),
    notificationPosture: auxillariesContract.profileState.notificationPosture,
    dataSharingPosture: auxillariesContract.profileState.dataSharingPosture,
    onboardedPanes,
    onboarded_steps: onboardedPanes,
    isOnboardingComplete: isAuxillaryOnboardingComplete(onboardedPanes),
    auxillariesContract,
    profileState: auxillariesContract.profileState,
    connectionReadiness: auxillariesContract.connectionReadiness,
    interfaceAdmissions: auxillariesContract.interfaceAdmissions,
    walletBtdPaneState: auxillariesContract.walletBtdPaneState,
    organizationAuthority: auxillariesContract.organizationAuthority,
    readinessDiagnostics: auxillariesContract.readinessDiagnostics,
    recoveryRuns: auxillariesContract.recoveryRuns,
    telemetryProofHooks: auxillariesContract.telemetryProofHooks,
  };
}

export function normalizeCompletedAuxillaryPane(value: string | null | undefined) {
  return normalizeAuxillaryPane(value);
}

export function buildAuxillariesContractSnapshot(
  input: BuildAuxillariesContractSnapshotInput,
): AuxillariesContractSnapshot {
  const profile = toAuxillariesJsonSafe(input.profile);
  const githubConnection = toAuxillariesJsonSafe(input.githubConnection);
  const walletConnectionStatus = toAuxillariesJsonSafe(input.walletConnectionStatus ?? null);
  const repositoryConnectionStatus = toAuxillariesJsonSafe(input.repositoryConnectionStatus ?? null);
  const repositories = Array.isArray(input.repositories)
    ? input.repositories.map((repository) => toAuxillariesJsonSafe(repository))
    : [];
  const organizations = input.organizations?.length
    ? input.organizations
    : deriveOrganizationsFromRepositories(repositories);
  const profileState = buildAuxillariesProfileState({
    profile,
    modelPreferences: input.modelPreferences ?? null,
    templatePreferences: input.templatePreferences ?? null,
    notificationRows: input.notificationRows ?? null,
    notificationPosture: input.notificationPosture ?? null,
    dataSharingPosture: input.dataSharingPosture ?? null,
    repositories,
  });
  const connectionReadiness = [
    buildAuxillariesConnectionReadiness({
      provider: 'github',
      connection: githubConnection,
      connectionStatus: repositoryConnectionStatus,
      repositories,
    }),
  ];
  const walletBtdPaneState = buildAuxillariesWalletBtdPaneState({
    profileState,
    walletConnectionStatus,
    btdBalance: input.btdBalance,
    btcFeeBalance: input.btcFeeBalance,
    recentBtdAssetPacks: input.recentBtdAssetPacks,
  });
  const organizationAuthority = buildOrganizationPolicyAuthority({
    profile,
    profileState,
    organizations,
    walletBtdPaneState,
  });
  const interfaceAdmissions = buildAuxillariesInterfaceAdmissions({
    profileState,
    connectionReadiness,
    walletBtdPaneState,
    organizationAuthority,
  });
  const readinessDiagnostics = buildAuxillariesReadinessDiagnostics({
    profileState,
    connectionReadiness,
    walletBtdPaneState,
    interfaceAdmissions,
    organizationAuthority,
  });
  const recoveryRuns = Array.isArray(input.recoveryRuns)
    ? input.recoveryRuns.map((run) => buildAuxillariesRecoveryRun(run))
    : [];
  const telemetryProofHooks = Array.isArray(input.telemetryProofHooks)
    ? input.telemetryProofHooks.map((hook) => buildAuxillariesTelemetryProofHook(hook))
    : buildAuxillariesTelemetryProofHooks({
        profileState,
        connectionReadiness,
        interfaceAdmissions,
        walletBtdPaneState,
        organizationAuthority,
        readinessDiagnostics,
        recoveryRuns,
      });
  const withoutRoot = {
    kind: 'auxillaries_contract_snapshot' as const,
    contractVersion: AUXILLARIES_CONTRACT_VERSION,
    sourceSafetyClass: 'source_safe' as AuxillariesSourceSafetyClass,
    profileState,
    connectionReadiness,
    interfaceAdmissions,
    walletBtdPaneState,
    organizationAuthority,
    readinessDiagnostics,
    recoveryRuns,
    telemetryProofHooks,
  };

  return {
    ...withoutRoot,
    contractRoot: stableProofRoot('auxillaries-contract-snapshot', withoutRoot),
  };
}

export function buildAuxillariesProfileState(input: {
  profile: unknown | null;
  modelPreferences?: unknown | null;
  templatePreferences?: unknown | null;
  notificationRows?: unknown[] | null;
  notificationPosture?: unknown | null;
  dataSharingPosture?: unknown | null;
  repositories?: unknown[] | null;
}): AuxillariesProfileState {
  const profile = asRecord(toAuxillariesJsonSafe(input.profile));
  const walletBinding = readWalletBinding(profile);
  const username = readString(profile?.username);
  const displayName = readString(profile?.display_name) ?? readString(profile?.displayName);
  const userId = readString(profile?.id) ?? readString(profile?.user_id) ?? readString(profile?.userId);
  const email = readString(profile?.email);
  const emailVerified =
    readBoolean(profile?.is_verified) ??
    readBoolean(profile?.isVerified) ??
    Boolean(readString(profile?.email_confirmed_at) ?? readString(profile?.emailConfirmedAt));
  const companyName = readString(profile?.company_name) ?? readString(profile?.companyName);
  const role = readString(profile?.role);
  const preferences = buildAuxillariesPreferencePosture({
    modelPreferences: input.modelPreferences ?? null,
    templatePreferences: input.templatePreferences ?? null,
  });
  const notificationPosture = buildAuxillariesNotificationPosture({
    profile,
    notificationRows: input.notificationRows ?? null,
    notificationPosture: input.notificationPosture ?? null,
  });
  const dataSharingPosture = buildAuxillariesDataSharingPosture({
    repositories: input.repositories ?? null,
    dataSharingPosture: input.dataSharingPosture ?? null,
  });
  const issues = [
    !profile
      ? buildProfileCompletenessIssue({
          id: 'profile.missing',
          severity: 'blocking',
          summary: 'Profile row is missing.',
          requiredAction: 'Create the account profile before Auxillaries can admit support actions.',
          pane: 'profile',
          label: 'Open Profile',
        })
      : null,
    !username && !displayName
      ? buildProfileCompletenessIssue({
          id: 'profile.identity_missing',
          severity: 'blocking',
          summary: 'Display identity is missing.',
          requiredAction: 'Add a handle or display name.',
          pane: 'profile',
          label: 'Open Profile',
        })
      : null,
    !email
      ? buildProfileCompletenessIssue({
          id: 'profile.email_missing',
          severity: 'recoverable',
          summary: 'Notification email is missing.',
          requiredAction: 'Add an email address for support and recovery notifications.',
          pane: 'profile',
          label: 'Add Email',
        })
      : null,
    email && !emailVerified
      ? buildProfileCompletenessIssue({
          id: 'profile.email_unverified',
          severity: 'recoverable',
          summary: 'Notification email is not verified.',
          requiredAction: 'Verify the email address or remove it from support posture.',
          pane: 'profile',
          label: 'Verify Email',
        })
      : null,
    !walletBinding
      ? buildProfileCompletenessIssue({
          id: 'wallet.binding_missing',
          severity: 'recoverable',
          summary: 'Wallet binding is missing.',
          requiredAction: 'Connect a wallet when settlement-adjacent actions are needed.',
          pane: 'wallet',
          label: 'Open Wallet',
        })
      : null,
    !preferences.model.configured
      ? buildProfileCompletenessIssue({
          id: 'preferences.model_missing',
          severity: 'recoverable',
          summary: 'Model preference is not configured.',
          requiredAction: 'Choose default model support for Auxillaries-driven actions.',
          pane: 'interfaces',
          label: 'Configure Models',
        })
      : null,
    !preferences.templates.configured
      ? buildProfileCompletenessIssue({
          id: 'preferences.templates_missing',
          severity: 'recoverable',
          summary: 'Template preference is not configured.',
          requiredAction: 'Configure shippable and evidence templates for support output.',
          pane: 'interfaces',
          label: 'Configure Templates',
        })
      : null,
  ].filter((entry): entry is AuxillariesProfileCompletenessIssue => Boolean(entry));
  const blockers = issues
    .filter((issue) => issue.severity === 'blocking')
    .map((issue) => issue.id);
  const recoverableIssues = issues.filter((issue) => issue.severity === 'recoverable');
  const accountReadiness: AuxillariesReadinessState = blockers.length
    ? 'blocked'
    : recoverableIssues.length || notificationPosture.state === 'attention_needed' || dataSharingPosture.state === 'limited'
      ? 'degraded'
      : 'ready';
  const withoutRoot = {
    kind: 'AuxillariesProfileState' as const,
    userId,
    username,
    displayName,
    email,
    companyName,
    role,
    accountReadiness,
    accountIdentity: {
      userId,
      username,
      displayName,
      email,
      emailVerified,
      companyName,
      role,
    },
    profileCompleteness: {
      complete: issues.length === 0,
      blockers,
      issues,
      repairRoutes: issues.map((issue) => issue.repairRoute),
    },
    walletBinding,
    modelPreferencesConfigured: preferences.model.configured,
    templatePreferencesConfigured: preferences.templates.configured,
    preferences,
    notificationPosture,
    dataSharingPosture,
    sourceSafetyClass: 'source_safe' as AuxillariesSourceSafetyClass,
  };

  return {
    ...withoutRoot,
    profileCompletenessRoot: stableProofRoot('auxillaries-profile-state', withoutRoot),
  };
}

export function buildAuxillariesPreferencePosture(input: {
  modelPreferences?: unknown | null;
  templatePreferences?: unknown | null;
}): AuxillariesPreferencePosture {
  const modelRecord = asRecord(toAuxillariesJsonSafe(input.modelPreferences ?? null));
  const templateRecord = asRecord(toAuxillariesJsonSafe(input.templatePreferences ?? null));
  const shippableTemplates =
    asRecord(templateRecord?.delivery_templates) ??
    asRecord(templateRecord?.shippable_templates) ??
    asRecord(templateRecord?.deliverable_templates);
  const evidenceDocumentTemplates =
    asRecord(templateRecord?.evidence_document_templates) ??
    asRecord(templateRecord?.ai_document_templates);
  const model = readString(modelRecord?.preferred_model) ??
    readString(modelRecord?.model) ??
    readString(modelRecord?.default_model) ??
    readString(modelRecord?.defaultModel);
  const provider = readString(modelRecord?.preferred_provider) ??
    readString(modelRecord?.provider) ??
    readString(modelRecord?.default_provider) ??
    readString(modelRecord?.defaultProvider);
  const shippableTemplateCount = shippableTemplates ? Object.keys(shippableTemplates).length : 0;
  const evidenceDocumentTemplateCount = evidenceDocumentTemplates ? Object.keys(evidenceDocumentTemplates).length : 0;
  const autoSaveTemplates = readBoolean(templateRecord?.auto_save_templates) ??
    readBoolean(templateRecord?.autoSaveTemplates) ??
    false;
  const modelWithoutRoot = {
    configured: hasNonEmptyPreferenceValue(modelRecord),
    provider,
    model,
  };
  const templateWithoutRoot = {
    configured: shippableTemplateCount + evidenceDocumentTemplateCount > 0 || autoSaveTemplates,
    shippableTemplateCount,
    evidenceDocumentTemplateCount,
    autoSaveTemplates,
  };

  return {
    model: {
      ...modelWithoutRoot,
      preferenceRoot: stableProofRoot('auxillaries-profile-model-preference', modelWithoutRoot),
    },
    templates: {
      ...templateWithoutRoot,
      preferenceRoot: stableProofRoot('auxillaries-profile-template-preference', templateWithoutRoot),
    },
  };
}

export function buildAuxillariesNotificationPosture(input: {
  profile?: UnknownRecord | null;
  notificationRows?: unknown[] | null;
  notificationPosture?: unknown | null;
}): AuxillariesNotificationPosture {
  const explicit = asRecord(toAuxillariesJsonSafe(input.notificationPosture ?? null));
  const rows = Array.isArray(input.notificationRows)
    ? input.notificationRows.map((row) => asRecord(toAuxillariesJsonSafe(row))).filter(Boolean)
    : [];
  const unreadCount = readNumber(explicit?.unreadCount) ??
    readNumber(explicit?.unread_count) ??
    rows.filter((row) => readBoolean(row?.read) === false || readBoolean(row?.is_read) === false).length;
  const latestNotificationAt = readString(explicit?.latestNotificationAt) ??
    readString(explicit?.latest_notification_at) ??
    rows
      .map((row) => readString(row?.created_at) ?? readString(row?.createdAt))
      .filter((entry): entry is string => Boolean(entry))
      .sort()
      .reverse()[0] ??
    null;
  const email = readString(input.profile?.email) ??
    readString(explicit?.email) ??
    null;
  const emailVerified = readBoolean(input.profile?.is_verified) ??
    readBoolean(input.profile?.isVerified) ??
    readBoolean(explicit?.emailVerified) ??
    readBoolean(explicit?.email_verified) ??
    false;
  const explicitState = readNotificationState(readString(explicit?.state) ?? readString(explicit?.posture));
  const state = explicitState ??
    (!email
      ? 'contact_missing'
      : unreadCount > 0
        ? 'attention_needed'
        : 'ready');
  const withoutRoot = {
    state,
    email,
    emailVerified,
    unreadCount,
    latestNotificationAt,
    sourceSafetyClass: 'secret_free_summary' as AuxillariesSourceSafetyClass,
  };

  return {
    ...withoutRoot,
    notificationRoot: stableProofRoot('auxillaries-profile-notification-posture', withoutRoot),
  };
}

export function buildAuxillariesDataSharingPosture(input: {
  repositories?: unknown[] | null;
  dataSharingPosture?: unknown | null;
}): AuxillariesDataSharingPosture {
  const explicit = asRecord(toAuxillariesJsonSafe(input.dataSharingPosture ?? null));
  const repositories = Array.isArray(input.repositories) ? input.repositories : [];
  const explicitRepositoryCount = readNumber(explicit?.repositoryCount) ?? readNumber(explicit?.repository_count);
  const explicitEnabledCount = readNumber(explicit?.enabledRepositoryCount) ??
    readNumber(explicit?.enabled_repository_count);
  const explicitDisabledCount = readNumber(explicit?.disabledRepositoryCount) ??
    readNumber(explicit?.disabled_repository_count);
  const repositoryCount = explicitRepositoryCount ?? repositories.length;
  const disabledRepositoryCount = explicitDisabledCount ?? repositories.filter((repository) => {
    const record = asRecord(repository);
    const shareEnabled =
      readBoolean(record?.data_share_enabled) ??
      readBoolean(record?.dataShareEnabled) ??
      readBoolean(record?.share_enabled) ??
      readBoolean(record?.enabled);
    return shareEnabled === false;
  }).length;
  const enabledRepositoryCount = explicitEnabledCount ?? Math.max(repositoryCount - disabledRepositoryCount, 0);
  const explicitState = readDataSharingState(readString(explicit?.state) ?? readString(explicit?.posture));
  const state = explicitState ??
    (repositoryCount === 0
      ? 'not_configured'
      : disabledRepositoryCount > 0
        ? 'limited'
        : 'configured');
  const withoutRoot = {
    state,
    repositoryCount,
    enabledRepositoryCount,
    disabledRepositoryCount,
    sourceSafetyClass: 'source_safe' as AuxillariesSourceSafetyClass,
  };

  return {
    ...withoutRoot,
    dataSharingRoot: stableProofRoot('auxillaries-profile-data-sharing-posture', withoutRoot),
  };
}

export function buildAuxillariesConnectionReadiness(input: {
  provider: string;
  connection?: unknown | null;
  connectionStatus?: unknown | null;
  repositories?: unknown[] | null;
}): AuxillariesConnectionReadiness {
  const connection = asRecord(toAuxillariesJsonSafe(input.connection ?? null));
  const status = asRecord(toAuxillariesJsonSafe(input.connectionStatus ?? null));
  const statusMetadata = asRecord(status?.metadata);
  const connectionMetadata = asRecord(connection?.metadata);
  const connected = readBoolean(status?.connected) ?? Boolean(connection);
  const valid = readBoolean(status?.valid) ?? connected;
  const provider = readString(status?.provider) ?? readString(connection?.provider) ?? input.provider;
  const providerId = readString(status?.providerId) ??
    readString(status?.provider_id) ??
    readString(connection?.provider_id) ??
    provider;
  const providerName = readString(status?.providerName) ??
    readString(status?.provider_name) ??
    readProviderName(provider);
  const accountLabel =
    readString(status?.username) ??
    readString(connection?.login) ??
    readString(connection?.account) ??
    readString(connection?.provider_username) ??
    null;
  const repositories = Array.isArray(input.repositories) ? input.repositories : [];
  const credentialPosture: AuxillariesConnectionReadiness['credentialPosture'] = !connected
    ? 'missing'
    : valid
      ? 'present_source_safe'
      : 'invalid';
  const requiredRepairAction: AuxillariesConnectionReadiness['requiredRepairAction'] = !connected
    ? 'connect_provider'
    : !valid
      ? 'reauthorize_provider'
      : repositories.length === 0
        ? 'repair_provider_inventory'
        : 'none';
  const tokenPresenceClass = readProviderTokenPresenceClass(
    readString(status?.tokenPresenceClass) ??
    readString(status?.token_presence_class) ??
    readString(statusMetadata?.tokenPresenceClass) ??
    readString(statusMetadata?.token_presence_class),
  ) ?? (!connected
    ? 'missing'
    : !valid
      ? 'invalid'
      : hasProviderTokenEvidence(status) || hasProviderTokenEvidence(connection)
        ? 'present_source_safe'
        : 'unknown');
  const scopes = [
    ...readStringList(status?.scopes),
    ...readStringList(status?.scope),
    ...readStringList(statusMetadata?.scopes),
    ...readStringList(statusMetadata?.scope),
    ...readStringList(connection?.scopes),
    ...readStringList(connection?.scope),
    ...readStringList(connectionMetadata?.scopes),
    ...readStringList(connectionMetadata?.scope),
  ];
  const scopesClass = readProviderScopesClass(
    readString(status?.scopesClass) ??
    readString(status?.scopes_class) ??
    readString(statusMetadata?.scopesClass) ??
    readString(statusMetadata?.scopes_class),
  ) ?? deriveProviderScopesClass({ connected, scopes });
  const lastReadbackStatus = readProviderReadbackStatus(
    readString(status?.lastReadbackStatus) ??
    readString(status?.last_readback_status) ??
    readString(status?.readbackStatus) ??
    readString(status?.readback_status) ??
    readString(statusMetadata?.lastReadbackStatus) ??
    readString(statusMetadata?.last_readback_status) ??
    readString(statusMetadata?.readbackStatus) ??
    readString(statusMetadata?.readback_status),
  ) ?? (!connected ? 'not_attempted' : valid ? 'succeeded' : 'failed');
  const lastReadbackAt = readString(status?.lastReadbackAt) ??
    readString(status?.last_readback_at) ??
    readString(statusMetadata?.lastReadbackAt) ??
    readString(statusMetadata?.last_readback_at) ??
    null;
  const blocker = readString(status?.blocker) ??
    readString(statusMetadata?.blocker) ??
    (requiredRepairAction === 'none' ? null : `connects.${provider}.${requiredRepairAction}`);
  const repairAction = requiredRepairAction;
  const withoutRoot = {
    kind: 'AuxillariesConnectionReadiness' as const,
    providerId,
    providerName,
    provider,
    connected,
    valid,
    accountLabel,
    installationState: connected ? 'installed' as const : 'missing' as const,
    credentialPosture,
    tokenPresenceClass,
    scopesClass,
    lastReadbackStatus,
    lastReadbackAt,
    blocker,
    requiredRepairAction,
    repairAction,
    sourceSafetyClass: 'secret_free_summary' as AuxillariesSourceSafetyClass,
    metadata: {
      repositories: repositories.length,
      repositoryCount: repositories.length,
      instanceUrl: readString(status?.instanceUrl),
      expiresAt: readString(status?.expiresAt),
      scopes,
    },
  };

  return {
    ...withoutRoot,
    providerReadinessRoot: stableProofRoot('auxillaries-connection-readiness', withoutRoot),
  };
}

export function buildAuxillariesInterfaceAdmissions(input: {
  profileState: AuxillariesProfileState;
  connectionReadiness: AuxillariesConnectionReadiness[];
  walletBtdPaneState: AuxillariesWalletBtdPaneState;
  organizationAuthority: OrganizationPolicyAuthority;
}): AuxillariesInterfaceAdmission[] {
  const githubReady = input.connectionReadiness.some(
    (connection) => connection.provider === 'github' && connection.connected && connection.valid,
  );
  const walletReady = input.walletBtdPaneState.walletCapability.hasBinding;
  const profileIdentityReady = input.profileState.profileCompleteness.blockers.length === 0;
  const organizationPolicyReady = input.organizationAuthority.policyDecision === 'allowed';
  const terminalActions = [
    'read_transaction',
    'request_read',
    'review_need',
    'request_finding_fits',
    'review_asset_pack_preview',
    'pay_btc_fee',
    'unlock_asset_pack_source',
    'deliver_asset_pack',
    'repair_projection',
    'administer_organization',
  ];

  return [
    buildAuxillariesInterfaceAdmission({
      interfaceId: 'product',
      surface: 'product',
      authMode: 'session',
      readiness: profileIdentityReady ? 'ready' : 'blocked',
      policyRequirements: [
        'session_required',
        'organization_policy_required_for_protected_actions',
        'source_safe_preview_by_default',
      ],
      supportedActions: terminalActions,
      admittedActions: profileIdentityReady
        ? ['read_transaction', 'request_read', 'review_need', 'request_finding_fits', 'review_asset_pack_preview']
        : ['read_transaction'],
      blockers: profileIdentityReady ? [] : ['profile.identity_required'],
    }),
    buildAuxillariesInterfaceAdmission({
      interfaceId: 'api',
      surface: 'api',
      authMode: 'api_key',
      readiness: profileIdentityReady && githubReady ? 'ready' : 'degraded',
      policyRequirements: [
        'api_key_required',
        'provider_scope_required',
        'organization_policy_required_for_write_actions',
        'secret_free_summary_only',
      ],
      supportedActions: [
        'read_support_state',
        'request_read',
        'review_need',
        'request_finding_fits',
        'deliver_asset_pack',
      ],
      admittedActions: profileIdentityReady && githubReady ? ['read_support_state', 'request_read'] : ['read_support_state'],
      blockers: githubReady ? [] : ['connects.github_provider_required'],
      sourceSafetyClass: 'secret_free_summary',
    }),
    buildAuxillariesInterfaceAdmission({
      interfaceId: 'mcp',
      surface: 'mcp',
      authMode: 'provider_oauth',
      readiness: githubReady && walletReady && organizationPolicyReady ? 'ready' : githubReady ? 'degraded' : 'blocked',
      policyRequirements: [
        'provider_oauth_required',
        'provider_scope_required',
        'wallet_binding_required_for_delivery',
        'organization_policy_required_for_protected_actions',
      ],
      supportedActions: [
        'read_repository_context',
        'request_read',
        'request_finding_fits',
        'deliver_asset_pack',
      ],
      admittedActions: githubReady ? ['read_repository_context'] : [],
      blockers: [
        githubReady ? null : 'connects.github_provider_required',
        walletReady ? null : 'wallet.binding_required_for_delivery',
        organizationPolicyReady ? null : 'organization.policy_authority_required',
      ].filter((entry): entry is string => Boolean(entry)),
      sourceSafetyClass: 'secret_free_summary',
    }),
    buildAuxillariesInterfaceAdmission({
      interfaceId: 'chatgpt-app',
      surface: 'chatgpt_app',
      authMode: 'session',
      readiness: profileIdentityReady && githubReady ? 'ready' : profileIdentityReady ? 'degraded' : 'blocked',
      policyRequirements: [
        'session_required',
        'provider_scope_required',
        'organization_policy_required_for_delivery_writes',
        'protected_source_never_embedded_before_paid_unlock',
      ],
      supportedActions: ['review_need', 'request_finding_fits', 'review_asset_pack_preview', 'deliver_asset_pack'],
      admittedActions: profileIdentityReady ? ['review_need', 'review_asset_pack_preview'] : [],
      blockers: [
        profileIdentityReady ? null : 'profile.identity_required',
        githubReady ? null : 'connects.github_provider_required',
      ].filter((entry): entry is string => Boolean(entry)),
      sourceSafetyClass: 'protected_source_redacted',
    }),
    buildAuxillariesInterfaceAdmission({
      interfaceId: 'exchange-hook',
      surface: 'exchange',
      authMode: 'wallet_signature',
      readiness: 'blocked',
      policyRequirements: [
        'future_exchange_law_deferred',
        'wallet_signature_required',
        'btc_settlement_required_before_source_unlock',
      ],
      supportedActions: ['pay_btc_fee', 'unlock_asset_pack_source'],
      admittedActions: [],
      blockers: ['exchange.market_depth_deferred_to_future_version'],
      sourceSafetyClass: 'protected_source_redacted',
      deferredProductDepth: 'exchange_market_law',
    }),
    buildAuxillariesInterfaceAdmission({
      interfaceId: 'conversations-hook',
      surface: 'future_hook',
      authMode: 'not_admitted',
      readiness: 'blocked',
      policyRequirements: [
        'conversations_product_depth_deferred',
        'interface_admission_record_required',
        'protected_source_never_embedded_before_paid_unlock',
      ],
      supportedActions: ['review_need', 'request_finding_fits', 'review_asset_pack_preview'],
      admittedActions: [],
      blockers: ['conversations.product_depth_deferred_to_future_version'],
      sourceSafetyClass: 'protected_source_redacted',
      deferredProductDepth: 'conversations_product_depth',
    }),
    buildAuxillariesInterfaceAdmission({
      interfaceId: 'future-interface-hooks',
      surface: 'future_hook',
      authMode: 'not_admitted',
      readiness: 'blocked',
      policyRequirements: ['future_hook_contract_required', 'interface_admission_record_required'],
      supportedActions: ['read_transaction'],
      admittedActions: [],
      blockers: ['future_hooks.interface_contract_unregistered'],
      deferredProductDepth: 'future_interface_contract',
    }),
  ];
}

export function buildAuxillariesInterfaceAdmission(
  input: Omit<
    AuxillariesInterfaceAdmission,
    | 'kind'
    | 'sourceSafetyClass'
    | 'policyConstraints'
    | 'allowedActions'
    | 'deferredProductDepth'
    | 'interfaceAdmissionRoot'
  > & {
    admittedActions?: string[];
    policyConstraints?: string[];
    sourceSafetyClass?: AuxillariesSourceSafetyClass;
    deferredProductDepth?: AuxillariesInterfaceAdmission['deferredProductDepth'];
  },
): AuxillariesInterfaceAdmission {
  const policyRequirements = normalizeSourceSafeList(input.policyRequirements);
  const supportedActions = normalizeSourceSafeList(input.supportedActions);
  const allowedActions = normalizeSourceSafeList(input.admittedActions ?? supportedActions);
  const blockers = normalizeSourceSafeList(input.blockers);
  const withoutRoot = {
    kind: 'AuxillariesInterfaceAdmission' as const,
    interfaceId: input.interfaceId,
    surface: input.surface,
    authMode: input.authMode,
    readiness: input.readiness,
    policyRequirements,
    policyConstraints: normalizeSourceSafeList(input.policyConstraints ?? policyRequirements),
    supportedActions,
    allowedActions,
    blockers,
    sourceSafetyClass: input.sourceSafetyClass ?? ('source_safe' as AuxillariesSourceSafetyClass),
    deferredProductDepth: input.deferredProductDepth ?? 'none',
  };

  return {
    ...withoutRoot,
    interfaceAdmissionRoot: stableProofRoot('auxillaries-interface-admission', withoutRoot),
  };
}

export function buildAuxillariesWalletBtdPaneState(input: {
  profileState: AuxillariesProfileState;
  walletConnectionStatus?: unknown | null;
  btdBalance?: number;
  btcFeeBalance?: number | null;
  recentBtdAssetPacks?: AuxillaryBtdAssetPackSummary[] | null;
}): AuxillariesWalletBtdPaneState {
  const walletStatus = asRecord(toAuxillariesJsonSafe(input.walletConnectionStatus ?? null));
  const binding = input.profileState.walletBinding;
  const address = readString(walletStatus?.address) ?? binding?.address ?? null;
  const provider = readString(walletStatus?.provider) ?? binding?.provider ?? null;
  const verificationState = readString(walletStatus?.verificationState) ?? binding?.status ?? null;
  const connected = readBoolean(walletStatus?.connected) ?? Boolean(address);
  const valid = readBoolean(walletStatus?.valid) ?? verificationState === 'verified';
  const walletMetadata = asRecord(walletStatus?.metadata);
  const projection = buildBtdWalletBtdSupportProjection({
    wallet: {
      address,
      provider,
      verificationState,
      connected,
      valid,
      network:
        readString(walletStatus?.network) ??
        readString(walletMetadata?.network) ??
        null,
    },
    aggregateBtd: input.btdBalance,
    btcFeeBalance: input.btcFeeBalance,
    recentAssetPacks: Array.isArray(input.recentBtdAssetPacks)
      ? input.recentBtdAssetPacks
      : [],
  });
  const withoutRoot: Omit<AuxillariesWalletBtdPaneState, 'btdSupportRoot'> = {
    kind: 'AuxillariesWalletBtdPaneState' as const,
    walletCapability: projection.walletCapability,
    signerPosture: projection.signerPosture,
    networkReadiness: projection.networkReadiness,
    btdReadRightSummary: projection.btdReadRightSummary,
    treasurySummary: projection.treasurySummary,
    settlementReadiness: projection.settlementReadiness,
    settlementBlockers: projection.settlementBlockers,
    sourceSafetyClass: 'source_safe' as AuxillariesSourceSafetyClass,
  };

  return {
    ...withoutRoot,
    btdSupportRoot: projection.btdSupportRoot,
  };
}

export function buildOrganizationPolicyAuthority(input: {
  profile?: unknown | null;
  profileState: AuxillariesProfileState;
  organizations?: string[] | null;
  walletBtdPaneState?: AuxillariesWalletBtdPaneState;
}): OrganizationPolicyAuthority {
  const profile = asRecord(toAuxillariesJsonSafe(input.profile ?? null));
  const organizationId =
    readString(profile?.organization_id) ??
    readString(profile?.organizationId) ??
    input.organizations?.[0] ??
    input.profileState.companyName ??
    null;
  const policyId =
    readString(profile?.organization_policy_id) ??
    readString(profile?.organizationPolicyId) ??
    (organizationId ? `${organizationId}:auxillaries-policy` : null);
  const policyHash =
    readString(profile?.organization_policy_hash) ??
    readString(profile?.organizationPolicyHash) ??
    (policyId
      ? stableProofRoot('auxillaries-organization-policy', {
          organizationId,
          policyId,
          action: 'pay_btc_fee',
        })
      : null);

  return buildBtdOrganizationPolicyAuthority({
    actorId: input.profileState.userId,
    organizationId,
    teamId:
      readString(profile?.team_id) ??
      readString(profile?.teamId) ??
      null,
    memberId:
      readString(profile?.member_id) ??
      readString(profile?.memberId) ??
      input.profileState.userId,
    organizationRole: input.profileState.role,
    organizationPermissionGrants: [
      ...readStringList(profile?.organization_permission_grants),
      ...readStringList(profile?.organizationPermissionGrants),
      ...readStringList(profile?.permission_grants),
      ...readStringList(profile?.permissionGrants),
    ],
    interfaceSurface: 'product',
    action: 'pay_btc_fee',
    walletId: input.walletBtdPaneState?.walletCapability.address ?? null,
    settlementState: 'not_required',
    confirmed:
      readBoolean(profile?.organization_policy_confirmed) ??
      readBoolean(profile?.organizationPolicyConfirmed) ??
      false,
    targetAnchor: organizationId ? `organization:${organizationId}` : null,
    policyId,
    policyHash,
    accountAdmitted: input.profileState.accountReadiness !== 'blocked',
    interfaceAdmitted: input.profileState.accountReadiness !== 'blocked',
    multiSig: {
      required:
        readBoolean(profile?.multi_sig_required) ??
        readBoolean(profile?.multiSigRequired) ??
        false,
      requiredSignatures:
        readNumber(profile?.multi_sig_required_signatures) ??
        readNumber(profile?.multiSigRequiredSignatures) ??
        null,
      presentSignatures:
        readNumber(profile?.multi_sig_present_signatures) ??
        readNumber(profile?.multiSigPresentSignatures) ??
        null,
      approverIds: [
        ...readStringList(profile?.multi_sig_approver_ids),
        ...readStringList(profile?.multiSigApproverIds),
      ],
      policyRoot:
        readString(profile?.multi_sig_policy_root) ??
        readString(profile?.multiSigPolicyRoot) ??
        null,
    },
    recoveryRoute: '/packs?auxillary-open-to=profile',
  });
}

export function buildAuxillariesReadinessDiagnostics(input: {
  profileState: AuxillariesProfileState;
  connectionReadiness: AuxillariesConnectionReadiness[];
  walletBtdPaneState: AuxillariesWalletBtdPaneState;
  interfaceAdmissions: AuxillariesInterfaceAdmission[];
  organizationAuthority: OrganizationPolicyAuthority;
}): AuxillariesReadinessDiagnostic[] {
  const diagnostics: AuxillariesReadinessDiagnostic[] = [];

  for (const issue of input.profileState.profileCompleteness.issues) {
    diagnostics.push(buildAuxillariesReadinessDiagnostic({
      pane: issue.repairRoute.pane,
      blockerId: issue.id,
      severity: issue.severity === 'blocking' ? 'blocking' : 'warning',
      summary: issue.summary,
      requiredAction: issue.requiredAction,
      repairRoute: issue.repairRoute.route,
      retryPolicy: issue.repairRoute.retryPolicy,
    }));
  }

  for (const readiness of input.connectionReadiness) {
    if (readiness.requiredRepairAction !== 'none') {
      diagnostics.push(buildAuxillariesReadinessDiagnostic({
        pane: 'externals',
        blockerId: `connects.${readiness.provider}.${readiness.requiredRepairAction}`,
        severity: readiness.connected ? 'warning' : 'blocking',
        summary: `${readiness.provider} provider readiness requires repair.`,
        requiredAction: readiness.requiredRepairAction,
        repairRoute: '/packs?auxillary-open-to=externals',
        retryPolicy: 'after_repair',
      }));
    }
  }

  if (!input.walletBtdPaneState.walletCapability.hasBinding) {
    diagnostics.push(buildAuxillariesReadinessDiagnostic({
      pane: 'wallet',
      blockerId: 'wallet.binding_missing',
      severity: 'blocking',
      summary: 'Wallet binding is missing for settlement-adjacent support actions.',
      requiredAction: 'Connect and verify a Bitcoin wallet.',
      repairRoute: '/packs?auxillary-open-to=wallet',
      retryPolicy: 'after_repair',
    }));
  } else if (!input.walletBtdPaneState.signerPosture.ready) {
    diagnostics.push(buildAuxillariesReadinessDiagnostic({
      pane: 'wallet',
      blockerId: 'wallet.signature_verification_required',
      severity: 'warning',
      summary: 'Wallet binding exists but signer posture is not verified.',
      requiredAction: input.walletBtdPaneState.signerPosture.requiredAction,
      repairRoute: '/packs?auxillary-open-to=wallet',
      retryPolicy: 'after_repair',
    }));
  }

  const blockedInterface = input.interfaceAdmissions.find((admission) => admission.readiness === 'blocked');
  if (blockedInterface) {
    diagnostics.push(buildAuxillariesReadinessDiagnostic({
      pane: 'interfaces',
      blockerId: `interfaces.${blockedInterface.interfaceId}.blocked`,
      severity: 'warning',
      summary: `${blockedInterface.interfaceId} is not admitted for the requested support surface.`,
      requiredAction: blockedInterface.blockers.join(', ') || 'Review interface policy.',
      repairRoute: '/packs?auxillary-open-to=interfaces',
      retryPolicy: 'after_repair',
    }));
  }

  if (input.organizationAuthority.policyDecision === 'denied') {
    diagnostics.push(buildAuxillariesReadinessDiagnostic({
      pane: 'profile',
      blockerId: input.organizationAuthority.denialReason ?? 'organization.policy_denied',
      severity: 'warning',
      summary: 'Organization authority is not admitted for settlement-adjacent actions.',
      requiredAction: 'Review organization role, grants, and wallet binding.',
      repairRoute: '/packs?auxillary-open-to=profile',
      retryPolicy: 'after_repair',
    }));
  }

  return diagnostics;
}

export function buildAuxillariesReadinessDiagnostic(
  input: Omit<AuxillariesReadinessDiagnostic, 'kind' | 'proofRoot'>,
): AuxillariesReadinessDiagnostic {
  const withoutRoot = {
    kind: 'AuxillariesReadinessDiagnostic' as const,
    ...input,
  };

  return {
    ...withoutRoot,
    proofRoot: stableProofRoot('auxillaries-readiness-diagnostic', withoutRoot),
  };
}

export interface BuildAuxillariesRecoveryRunInput {
  targetPane: ConcreteAuxillaryPane;
  repairAction: string;
  blockerId?: string | null;
  beforeReadinessRoot: string;
  afterReadinessRoot: string | null;
  executionId: string | null;
  outcome: AuxillariesRecoveryRun['outcome'];
  retryPolicy?: AuxillariesRetryPolicy;
  startedAt?: string | null;
  completedAt?: string | null;
  evidenceRoot?: string | null;
  telemetryRoot?: string | null;
}

export function buildAuxillariesRecoveryRun(
  input: BuildAuxillariesRecoveryRunInput,
): AuxillariesRecoveryRun {
  const recoveryEvidence = {
    targetPane: input.targetPane,
    repairAction: input.repairAction,
    blockerId: input.blockerId ?? null,
    beforeReadinessRoot: input.beforeReadinessRoot,
    afterReadinessRoot: input.afterReadinessRoot,
    executionId: input.executionId,
    outcome: input.outcome,
    retryPolicy: input.retryPolicy ?? 'after_repair',
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
  };
  const withoutRoot = {
    kind: 'AuxillariesRecoveryRun' as const,
    ...recoveryEvidence,
    evidenceRoot: input.evidenceRoot || stableProofRoot('auxillaries-recovery-run-evidence', recoveryEvidence),
    telemetryRoot: input.telemetryRoot || stableProofRoot('auxillaries-recovery-run-telemetry', {
      executionId: input.executionId,
      outcome: input.outcome,
      targetPane: input.targetPane,
      repairAction: input.repairAction,
    }),
    sourceSafetyClass: 'source_safe' as AuxillariesSourceSafetyClass,
  };

  return {
    ...withoutRoot,
    recoveryRoot: stableProofRoot('auxillaries-recovery-run', withoutRoot),
  };
}

export function buildAuxillariesTelemetryProofHooks(input: {
  profileState: AuxillariesProfileState;
  connectionReadiness: AuxillariesConnectionReadiness[];
  interfaceAdmissions: AuxillariesInterfaceAdmission[];
  walletBtdPaneState: AuxillariesWalletBtdPaneState;
  organizationAuthority: OrganizationPolicyAuthority;
  readinessDiagnostics: AuxillariesReadinessDiagnostic[];
  recoveryRuns: AuxillariesRecoveryRun[];
}): AuxillariesTelemetryProofHook[] {
  const hooks: AuxillariesTelemetryProofHook[] = [];
  const firstProfileBlocker = input.profileState.profileCompleteness.issues[0]?.id ?? null;

  hooks.push(buildAuxillariesTelemetryProofHook({
    subject: 'profile',
    subjectId: input.profileState.userId || 'anonymous-profile',
    pane: 'profile',
    theoremId: 'auxillaries.profile.source_safe_readback',
    replayStepId: 'profile-state-readback',
    evidenceRoot: input.profileState.profileCompletenessRoot,
    blockerId: firstProfileBlocker,
    repairOutcome: firstProfileBlocker ? 'not_started' : 'not_required',
  }));

  hooks.push(buildAuxillariesTelemetryProofHook({
    subject: 'account',
    subjectId: input.profileState.accountIdentity.userId || 'anonymous-account',
    pane: 'profile',
    theoremId: 'auxillaries.account.identity_admission',
    replayStepId: 'account-identity-readback',
    evidenceRoot: stableProofRoot('auxillaries-account-identity-evidence', input.profileState.accountIdentity),
    blockerId: input.profileState.accountReadiness === 'blocked' ? firstProfileBlocker : null,
    repairOutcome: input.profileState.accountReadiness === 'ready' ? 'not_required' : 'not_started',
  }));

  for (const readiness of input.connectionReadiness) {
    hooks.push(buildAuxillariesTelemetryProofHook({
      subject: 'provider_connection',
      subjectId: readiness.providerId,
      pane: 'externals',
      theoremId: 'auxillaries.provider_connection.source_safe_readback',
      replayStepId: `provider-connection-${readiness.providerId}`,
      evidenceRoot: readiness.providerReadinessRoot,
      blockerId: readiness.blocker,
      repairOutcome: readiness.requiredRepairAction === 'none' ? 'not_required' : 'not_started',
    }));
  }

  for (const admission of input.interfaceAdmissions) {
    hooks.push(buildAuxillariesTelemetryProofHook({
      subject: 'interface_admission',
      subjectId: admission.interfaceId,
      pane: 'interfaces',
      theoremId: 'auxillaries.interface_admission.policy_readback',
      replayStepId: `interface-admission-${admission.interfaceId}`,
      evidenceRoot: admission.interfaceAdmissionRoot,
      blockerId: admission.blockers[0] ?? null,
      repairOutcome: admission.readiness === 'ready' ? 'not_required' : 'not_started',
    }));
  }

  hooks.push(buildAuxillariesTelemetryProofHook({
    subject: 'wallet',
    subjectId: input.walletBtdPaneState.walletCapability.address || 'wallet-binding-missing',
    pane: 'wallet',
    theoremId: 'auxillaries.wallet.no_custody_readback',
    replayStepId: 'wallet-capability-readback',
    evidenceRoot: input.walletBtdPaneState.walletCapability.walletCapabilityRoot,
    blockerId: input.walletBtdPaneState.walletCapability.hasBinding ? null : 'wallet.binding_missing',
    repairOutcome: input.walletBtdPaneState.walletCapability.hasBinding ? 'not_required' : 'not_started',
  }));

  hooks.push(buildAuxillariesTelemetryProofHook({
    subject: 'btd_pane',
    subjectId: 'wallet-btd-support',
    pane: 'wallet',
    theoremId: 'auxillaries.btd_pane.source_safe_summary',
    replayStepId: 'wallet-btd-pane-readback',
    evidenceRoot: input.walletBtdPaneState.btdSupportRoot,
    blockerId: input.walletBtdPaneState.settlementBlockers[0] ?? null,
    repairOutcome: input.walletBtdPaneState.settlementReadiness === 'ready' ? 'not_required' : 'not_started',
  }));

  hooks.push(buildAuxillariesTelemetryProofHook({
    subject: 'organization_authority',
    subjectId: input.organizationAuthority.organizationId || 'organization-missing',
    pane: 'profile',
    theoremId: 'auxillaries.organization_authority.policy_readback',
    replayStepId: 'organization-authority-readback',
    evidenceRoot: input.organizationAuthority.authorityRoot,
    blockerId: input.organizationAuthority.denialReason ?? null,
    repairOutcome: input.organizationAuthority.policyDecision === 'allowed' ? 'not_required' : 'not_started',
  }));

  hooks.push(buildAuxillariesTelemetryProofHook({
    subject: 'policy_decision',
    subjectId: input.organizationAuthority.policy.policyId || 'policy-missing',
    pane: 'profile',
    theoremId: 'auxillaries.policy_decision.fail_closed',
    replayStepId: 'policy-decision-readback',
    evidenceRoot: input.organizationAuthority.authorityRoot,
    blockerId: input.organizationAuthority.denialReason ?? null,
    repairOutcome: input.organizationAuthority.policyDecision === 'allowed' ? 'not_required' : 'not_started',
  }));

  for (const diagnostic of input.readinessDiagnostics) {
    hooks.push(buildAuxillariesTelemetryProofHook({
      subject: 'readiness_diagnostic',
      subjectId: diagnostic.blockerId,
      pane: diagnostic.pane,
      theoremId: 'auxillaries.readiness_diagnostic.repair_route',
      replayStepId: `readiness-diagnostic-${diagnostic.blockerId}`,
      evidenceRoot: diagnostic.proofRoot,
      blockerId: diagnostic.blockerId,
      repairOutcome: 'not_started',
    }));
  }

  for (const recoveryRun of input.recoveryRuns) {
    hooks.push(buildAuxillariesTelemetryProofHook({
      subject: 'recovery_run',
      subjectId: recoveryRun.executionId || `${recoveryRun.targetPane}.${recoveryRun.repairAction}`,
      pane: recoveryRun.targetPane,
      theoremId: 'auxillaries.recovery_run.execution_evidence',
      replayStepId: `recovery-run-${recoveryRun.targetPane}-${recoveryRun.repairAction}`,
      evidenceRoot: recoveryRun.evidenceRoot,
      telemetryRoot: recoveryRun.telemetryRoot,
      blockerId: recoveryRun.blockerId,
      repairOutcome: recoveryRun.outcome,
    }));
  }

  return hooks;
}

export function buildAuxillariesTelemetryProofHook(
  input: Omit<AuxillariesTelemetryProofHook, 'kind' | 'sourceSafetyClass' | 'telemetryRoot' | 'proofRoot'> &
    Partial<Pick<AuxillariesTelemetryProofHook, 'telemetryRoot'>>,
): AuxillariesTelemetryProofHook {
  const telemetryEvidence = {
    subject: input.subject,
    subjectId: input.subjectId,
    pane: input.pane,
    theoremId: input.theoremId,
    replayStepId: input.replayStepId,
    evidenceRoot: input.evidenceRoot,
    blockerId: input.blockerId,
    repairOutcome: input.repairOutcome,
  };
  const withoutRoot = {
    kind: 'AuxillariesTelemetryProofHook' as const,
    ...telemetryEvidence,
    telemetryRoot: input.telemetryRoot || stableProofRoot('auxillaries-telemetry-proof-hook-telemetry', telemetryEvidence),
    sourceSafetyClass: 'source_safe' as AuxillariesSourceSafetyClass,
  };

  return {
    ...withoutRoot,
    proofRoot: stableProofRoot('auxillaries-telemetry-proof-hook', withoutRoot),
  };
}

export function validateAuxillariesContractSnapshot(value: unknown): AuxillariesContractValidationResult {
  const record = asRecord(value);
  const errors: string[] = [];

  if (!record) {
    return { valid: false, errors: ['snapshot must be an object'] };
  }

  if (record.kind !== 'auxillaries_contract_snapshot') errors.push('kind must be auxillaries_contract_snapshot');
  if (record.contractVersion !== AUXILLARIES_CONTRACT_VERSION) errors.push('contractVersion is not current');
  if (!asRecord(record.profileState)) errors.push('profileState is required');
  if (!Array.isArray(record.connectionReadiness)) errors.push('connectionReadiness must be an array');
  if (!Array.isArray(record.interfaceAdmissions)) errors.push('interfaceAdmissions must be an array');
  if (Array.isArray(record.interfaceAdmissions)) {
    const requiredInterfaceIds = new Set([
      'product',
      'api',
      'mcp',
      'chatgpt-app',
      'exchange-hook',
      'conversations-hook',
      'future-interface-hooks',
    ]);
    const observedInterfaceIds = new Set<string>();
    for (const [index, admission] of record.interfaceAdmissions.entries()) {
      const interfaceAdmission = asRecord(admission);
      if (!interfaceAdmission) {
        errors.push(`interfaceAdmissions[${index}] must be an object`);
        continue;
      }
      const interfaceId = readString(interfaceAdmission.interfaceId);
      if (interfaceId) observedInterfaceIds.add(interfaceId);
      if (!interfaceId) errors.push(`interfaceAdmissions[${index}].interfaceId is required`);
      if (!readString(interfaceAdmission.surface)) errors.push(`interfaceAdmissions[${index}].surface is required`);
      if (!readString(interfaceAdmission.authMode)) errors.push(`interfaceAdmissions[${index}].authMode is required`);
      if (!readString(interfaceAdmission.readiness)) errors.push(`interfaceAdmissions[${index}].readiness is required`);
      if (!Array.isArray(interfaceAdmission.policyRequirements)) {
        errors.push(`interfaceAdmissions[${index}].policyRequirements must be an array`);
      }
      if (!Array.isArray(interfaceAdmission.supportedActions)) {
        errors.push(`interfaceAdmissions[${index}].supportedActions must be an array`);
      }
      if (!Array.isArray(interfaceAdmission.allowedActions)) {
        errors.push(`interfaceAdmissions[${index}].allowedActions must be an array`);
      }
      if (!Array.isArray(interfaceAdmission.blockers)) {
        errors.push(`interfaceAdmissions[${index}].blockers must be an array`);
      }
      if (!readString(interfaceAdmission.sourceSafetyClass)) {
        errors.push(`interfaceAdmissions[${index}].sourceSafetyClass is required`);
      }
      if (!readString(interfaceAdmission.interfaceAdmissionRoot)) {
        errors.push(`interfaceAdmissions[${index}].interfaceAdmissionRoot is required`);
      }
    }
    for (const requiredInterfaceId of requiredInterfaceIds) {
      if (!observedInterfaceIds.has(requiredInterfaceId)) {
        errors.push(`interfaceAdmissions missing ${requiredInterfaceId}`);
      }
    }
  }
  if (!asRecord(record.walletBtdPaneState)) errors.push('walletBtdPaneState is required');
  if (!asRecord(record.organizationAuthority)) errors.push('organizationAuthority is required');
  if (!Array.isArray(record.readinessDiagnostics)) errors.push('readinessDiagnostics must be an array');
  if (!Array.isArray(record.recoveryRuns)) errors.push('recoveryRuns must be an array');
  if (Array.isArray(record.recoveryRuns)) {
    for (const [index, recoveryRun] of record.recoveryRuns.entries()) {
      const recoveryRecord = asRecord(recoveryRun);
      if (!recoveryRecord) {
        errors.push(`recoveryRuns[${index}] must be an object`);
        continue;
      }
      if (recoveryRecord.kind !== 'AuxillariesRecoveryRun') {
        errors.push(`recoveryRuns[${index}].kind must be AuxillariesRecoveryRun`);
      }
      const targetPane = readString(recoveryRecord.targetPane);
      if (!targetPane) errors.push(`recoveryRuns[${index}].targetPane is required`);
      else if (!CANONICAL_AUXILLARY_PANES.has(targetPane)) {
        errors.push(`recoveryRuns[${index}].targetPane must be canonical`);
      }
      if (!readString(recoveryRecord.repairAction)) errors.push(`recoveryRuns[${index}].repairAction is required`);
      if (!readString(recoveryRecord.beforeReadinessRoot)) {
        errors.push(`recoveryRuns[${index}].beforeReadinessRoot is required`);
      }
      const outcome = readString(recoveryRecord.outcome);
      if (!outcome) errors.push(`recoveryRuns[${index}].outcome is required`);
      else if (!AUXILLARIES_RECOVERY_OUTCOMES.has(outcome)) {
        errors.push(`recoveryRuns[${index}].outcome is invalid`);
      }
      if (!readString(recoveryRecord.retryPolicy)) errors.push(`recoveryRuns[${index}].retryPolicy is required`);
      if (!readString(recoveryRecord.evidenceRoot)) errors.push(`recoveryRuns[${index}].evidenceRoot is required`);
      if (!readString(recoveryRecord.telemetryRoot)) errors.push(`recoveryRuns[${index}].telemetryRoot is required`);
      if (!readString(recoveryRecord.recoveryRoot)) errors.push(`recoveryRuns[${index}].recoveryRoot is required`);
      if (recoveryRecord.sourceSafetyClass !== 'source_safe') {
        errors.push(`recoveryRuns[${index}].sourceSafetyClass must be source_safe`);
      }
    }
  }
  if (!Array.isArray(record.telemetryProofHooks)) errors.push('telemetryProofHooks must be an array');
  if (Array.isArray(record.telemetryProofHooks)) {
    for (const [index, hook] of record.telemetryProofHooks.entries()) {
      const hookRecord = asRecord(hook);
      if (!hookRecord) {
        errors.push(`telemetryProofHooks[${index}] must be an object`);
        continue;
      }
      if (hookRecord.kind !== 'AuxillariesTelemetryProofHook') {
        errors.push(`telemetryProofHooks[${index}].kind must be AuxillariesTelemetryProofHook`);
      }
      const subject = readString(hookRecord.subject);
      if (subject && !AUXILLARIES_TELEMETRY_SUBJECTS.has(subject)) {
        errors.push(`telemetryProofHooks[${index}].subject is invalid`);
      }
      const repairOutcome = readString(hookRecord.repairOutcome);
      if (repairOutcome && !AUXILLARIES_REPAIR_OUTCOMES.has(repairOutcome)) {
        errors.push(`telemetryProofHooks[${index}].repairOutcome is invalid`);
      }
      const pane = readString(hookRecord.pane);
      if (pane && !CANONICAL_AUXILLARY_PANES.has(pane)) {
        errors.push(`telemetryProofHooks[${index}].pane must be canonical`);
      }
      for (const field of [
        'subject',
        'subjectId',
        'pane',
        'theoremId',
        'replayStepId',
        'evidenceRoot',
        'telemetryRoot',
        'sourceSafetyClass',
        'proofRoot',
      ]) {
        if (!readString(hookRecord[field])) {
          errors.push(`telemetryProofHooks[${index}].${field} is required`);
        }
      }
      if (hookRecord.sourceSafetyClass !== 'source_safe') {
        errors.push(`telemetryProofHooks[${index}].sourceSafetyClass must be source_safe`);
      }
    }
  }
  if (!readString(record.contractRoot)) errors.push('contractRoot is required');

  return { valid: errors.length === 0, errors };
}

export function parseAuxillariesContractSnapshot(value: unknown): AuxillariesContractSnapshot {
  const validation = validateAuxillariesContractSnapshot(value);
  if (!validation.valid) {
    throw new Error(`Invalid Auxillaries contract snapshot: ${validation.errors.join('; ')}`);
  }

  return value as AuxillariesContractSnapshot;
}

export function toAuxillariesJsonSafe(value: unknown): unknown {
  return sanitizeAuxillariesJsonValue(value);
}

export function assertAuxillariesJsonSafe(value: unknown): void {
  const failures: string[] = [];
  visitJsonSafety(value, '$', failures);
  if (failures.length) {
    throw new Error(`Auxillaries value is not JSON-safe: ${failures.join('; ')}`);
  }
}

function sanitizeAuxillariesJsonValue(value: unknown, key = ''): unknown {
  if (key && PROTECTED_SOURCE_KEY_PATTERN.test(key)) {
    return PROTECTED_SOURCE_REDACTED_VALUE;
  }

  if (key && SENSITIVE_KEY_PATTERN.test(key)) {
    return REDACTED_VALUE;
  }

  if (value === null) return null;
  if (value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((entry) => sanitizeAuxillariesJsonValue(entry));
  if (typeof value !== 'object') return null;

  const result: Record<string, unknown> = {};
  for (const [entryKey, entryValue] of Object.entries(value as UnknownRecord)) {
    if (entryValue === undefined) continue;
    result[entryKey] = sanitizeAuxillariesJsonValue(entryValue, entryKey);
  }

  return result;
}

function visitJsonSafety(value: unknown, path: string, failures: string[]) {
  if (value === null) return;
  if (typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) failures.push(`${path} must be finite number`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => visitJsonSafety(entry, `${path}[${index}]`, failures));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, entry] of Object.entries(value as UnknownRecord)) {
      visitJsonSafety(entry, `${path}.${key}`, failures);
    }
    return;
  }

  failures.push(`${path} has non-JSON type ${typeof value}`);
}

function deriveOrganizationsFromRepositories(repositories: unknown[]) {
  const organizations = repositories
    .map((repository) => {
      const repoRecord = asRecord(repository);
      const owner = asRecord(repoRecord?.owner);
      const ownerType = readString(owner?.type);
      if (ownerType !== 'organization') return null;
      return readString(owner?.username) ?? readString(repoRecord?.repo_owner);
    })
    .filter((entry): entry is string => Boolean(entry));

  return Array.from(new Set(organizations));
}

function readWalletBinding(profile: UnknownRecord | null): AuxillariesProfileState['walletBinding'] {
  const nested = asRecord(profile?.wallet_binding);
  const address =
    readString(nested?.address) ??
    readString(profile?.wallet_address) ??
    readString(profile?.walletAddress);
  const provider =
    readString(nested?.provider) ??
    readString(profile?.wallet_provider) ??
    readString(profile?.walletProvider);
  const status =
    readString(nested?.status) ??
    readString(profile?.wallet_binding_status) ??
    readString(profile?.walletBindingStatus);
  const boundAt =
    readString(nested?.boundAt) ??
    readString(nested?.bound_at) ??
    readString(profile?.wallet_bound_at) ??
    readString(profile?.walletBoundAt);

  if (!address && !provider && !status && !boundAt) return null;

  return {
    address: address ?? null,
    provider: provider ?? null,
    status: status ?? null,
    boundAt: boundAt ?? null,
  };
}

function buildProfileCompletenessIssue(input: {
  id: string;
  severity: AuxillariesProfileRepairSeverity;
  summary: string;
  requiredAction: string;
  pane: ConcreteAuxillaryPane;
  label: string;
}): AuxillariesProfileCompletenessIssue {
  const repairRoute: AuxillariesProfileRepairRoute = {
    issueId: input.id,
    pane: input.pane,
    route: `/packs?auxillary-open-to=${input.pane}`,
    label: input.label,
    retryPolicy: 'after_repair',
  };

  return {
    id: input.id,
    severity: input.severity,
    summary: input.summary,
    requiredAction: input.requiredAction,
    repairRoute,
  };
}

function asRecord(value: unknown): UnknownRecord | null {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

function readNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function hasNonEmptyPreferenceValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return Boolean(value.trim());
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.length > 0;
  const record = asRecord(value);
  if (!record) return false;
  return Object.values(record).some((entry) => hasNonEmptyPreferenceValue(entry));
}

function readNotificationState(value: string | null): AuxillariesNotificationState | null {
  if (
    value === 'ready' ||
    value === 'attention_needed' ||
    value === 'contact_missing' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function readDataSharingState(value: string | null): AuxillariesDataSharingState | null {
  if (
    value === 'configured' ||
    value === 'limited' ||
    value === 'not_configured' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function readProviderName(provider: string) {
  if (provider === 'github') return 'GitHub';
  if (provider === 'gitlab') return 'GitLab';
  if (provider === 'bitbucket') return 'Bitbucket';
  return provider;
}

function readProviderTokenPresenceClass(value: string | null): AuxillariesProviderTokenPresenceClass | null {
  if (
    value === 'present_source_safe' ||
    value === 'missing' ||
    value === 'invalid' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function readProviderScopesClass(value: string | null): AuxillariesProviderScopesClass | null {
  if (
    value === 'repo_read_write' ||
    value === 'repo_read_only' ||
    value === 'metadata_only' ||
    value === 'missing' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function readProviderReadbackStatus(value: string | null): AuxillariesProviderReadbackStatus | null {
  if (
    value === 'succeeded' ||
    value === 'failed' ||
    value === 'not_attempted' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function readStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,\s]+/u)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeSourceSafeList(value: unknown): string[] {
  return Array.from(
    new Set(
      readStringList(value)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
    ),
  );
}

function hasProviderTokenEvidence(value: UnknownRecord | null) {
  if (!value) return false;
  return [
    value.token_present,
    value.tokenPresent,
    value.access_token,
    value.oauth_token,
    value.refresh_token,
    value.token,
  ].some((entry) => readBoolean(entry) === true || readString(entry) === REDACTED_VALUE);
}

function deriveProviderScopesClass(input: {
  connected: boolean;
  scopes: string[];
}): AuxillariesProviderScopesClass {
  if (!input.connected) return 'missing';
  if (input.scopes.length === 0) return 'unknown';
  const normalized = input.scopes.map((scope) => scope.toLowerCase());
  const hasRepo = normalized.some((scope) => scope.includes('repo') || scope.includes('repository'));
  const hasWrite = normalized.some((scope) => /(?:write|push|contents:write|metadata:write)/u.test(scope));
  const hasRead = normalized.some((scope) => /(?:read|pull|contents:read|metadata:read)/u.test(scope));
  if (hasRepo && hasWrite) return 'repo_read_write';
  if (hasRepo || hasRead) return 'repo_read_only';
  return 'metadata_only';
}

function stableProofRoot(label: string, value: unknown) {
  return createHash('sha256')
    .update(`${label}:${stableStringify(toAuxillariesJsonSafe(value))}`)
    .digest('hex');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;

  const record = value as UnknownRecord;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}
