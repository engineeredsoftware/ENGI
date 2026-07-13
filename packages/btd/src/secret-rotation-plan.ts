import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import {
  DEPLOYMENT_HOST_CAPABILITY_IDS,
  ENVIRONMENT_LANE_CONTRACT_IDS,
  type DeploymentHostCapabilityId,
  type EnvironmentLaneContractId,
} from './deployment-host-capability-catalog';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const SECRET_ROTATION_FAMILY_IDS = [
  'model_provider_openai',
  'database_supabase_project',
  'deployment_vercel_project',
  'vcs_github_app',
  'wallet_signer_material',
  'object_storage_encryption',
  'webhook_signing',
  'mcp_server_auth',
  'chatgpt_app_auth',
] as const;

export type SecretRotationFamilyId = (typeof SECRET_ROTATION_FAMILY_IDS)[number];

export type SecretRotationStorageOwner =
  | 'operator_secret_store'
  | 'vercel_project_environment'
  | 'supabase_project_secret_store'
  | 'github_app_installation'
  | 'wallet_signer_vault'
  | 'object_storage_key_manager'
  | 'interface_connector_secret_store';

export type SecretRotationCredentialClass =
  | 'model_provider_project_key'
  | 'database_project_server_secret'
  | 'deployment_platform_token'
  | 'repository_provider_installation_secret'
  | 'wallet_signing_material'
  | 'object_storage_encryption_key_reference'
  | 'webhook_signature_secret'
  | 'mcp_transport_auth_secret'
  | 'chatgpt_app_connector_secret';

export type SecretRotationCadence =
  | 'on_provider_expiry'
  | 'every_30_days'
  | 'every_60_days'
  | 'every_90_days'
  | 'on_wallet_policy_change'
  | 'on_incident_or_operator_request';

export type SecretRotationLeakSeverity =
  | 'operator_only'
  | 'staging_testnet_blocking'
  | 'mainnet_dry_run_blocking'
  | 'wallet_boundary_blocking'
  | 'interface_boundary_blocking';

export interface SecretRotationFamilyInput {
  familyId: SecretRotationFamilyId;
  label: string;
  credentialClass: SecretRotationCredentialClass;
  storageOwner: SecretRotationStorageOwner;
  ownerPackage: string;
  requiredHostIds: readonly DeploymentHostCapabilityId[];
  supportedLaneIds: readonly EnvironmentLaneContractId[];
  rotationCadence: SecretRotationCadence;
  rotationCommand: string;
  verificationCommand: string;
  ciMaskingPosture: string;
  leakResponsePath: string;
  leakSeverity: SecretRotationLeakSeverity;
  blastRadiusNote: string;
  runtimeAvailabilityCheck: string;
  auditEventName: string;
  serializedValuePolicy: string;
  proofRootBasis: readonly string[];
}

export interface SecretRotationFamily extends SecretRotationFamilyInput {
  kind: 'bitcode.secret_rotation_plan.family';
  requiredHostIds: DeploymentHostCapabilityId[];
  supportedLaneIds: EnvironmentLaneContractId[];
  proofRootBasis: string[];
  familyRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface SecretRotationPlanInput {
  families?: readonly SecretRotationFamilyInput[];
  requiredFamilyIds?: readonly SecretRotationFamilyId[];
}

export interface SecretRotationPlan {
  kind: 'bitcode.secret_rotation_plan';
  schemaId: 'bitcode.secretRotationPlan.v1';
  planRoot: string;
  familyCount: number;
  requiredFamilyIds: SecretRotationFamilyId[];
  observedFamilyIds: SecretRotationFamilyId[];
  missingFamilyIds: SecretRotationFamilyId[];
  families: SecretRotationFamily[];
  rotationCommandsCovered: true;
  ciMaskingCovered: true;
  leakResponseCovered: true;
  blastRadiusCovered: true;
  runtimeAvailabilityCovered: true;
  auditEventsCovered: true;
  noSerializedSecretValues: true;
  valueBearingMainnetBlocked: true;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export const SECRET_ROTATION_REQUIRED_FAMILY_FIELDS = [
  'credentialClass',
  'storageOwner',
  'ownerPackage',
  'requiredHostIds',
  'supportedLaneIds',
  'rotationCadence',
  'rotationCommand',
  'verificationCommand',
  'ciMaskingPosture',
  'leakResponsePath',
  'leakSeverity',
  'blastRadiusNote',
  'runtimeAvailabilityCheck',
  'auditEventName',
  'serializedValuePolicy',
  'proofRootBasis',
] as const;

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const NON_VALUE_LANES: EnvironmentLaneContractId[] = [
  'local',
  'regtest',
  'signet',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
];

const SECRET_VALUE_PATTERNS = [
  new RegExp(`${['sb', 'secret'].join('_')}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\bprivate\s+key\b/iu,
  /\bwallet\s+seed\b/iu,
  /\bmnemonic\b/iu,
  /\braw\s+source\b/iu,
  /\bsource\s+contents\b/iu,
  /\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u,
];

export function buildSecretRotationFamilyRows(): SecretRotationFamilyInput[] {
  return [
    {
      familyId: 'model_provider_openai',
      label: 'OpenAI model-provider secret family',
      credentialClass: 'model_provider_project_key',
      storageOwner: 'vercel_project_environment',
      ownerPackage: 'packages/pipelines/asset-pack',
      requiredHostIds: ['api', 'pipeline_workers'],
      supportedLaneIds: NON_VALUE_LANES,
      rotationCadence: 'every_30_days',
      rotationCommand: 'rotate model-provider credential through operator secret store, then sync provider key alias into Vercel lane environment',
      verificationCommand: 'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/reading-pipeline-contract.test.ts --runInBand',
      ciMaskingPosture: 'CI masks provider-key values and records only presence class plus proof root',
      leakResponsePath: 'revoke provider project key, rotate lane alias, re-run reading pipeline smoke, and append incident audit event',
      leakSeverity: 'staging_testnet_blocking',
      blastRadiusNote: 'model inference unavailable until the lane alias verifies; generated artifacts remain source-safe',
      runtimeAvailabilityCheck: 'pipeline host preflight checks provider-key presence class without echoing value',
      auditEventName: 'secret_rotation.model_provider_openai',
      serializedValuePolicy: 'family id and value-presence class only; no provider credential bytes',
      proofRootBasis: ['ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis', 'PipelineHarnessPreflight'],
    },
    {
      familyId: 'database_supabase_project',
      label: 'Supabase database and project secret family',
      credentialClass: 'database_project_server_secret',
      storageOwner: 'supabase_project_secret_store',
      ownerPackage: 'packages/supabase',
      requiredHostIds: ['api', 'database_projection', 'repair_jobs'],
      supportedLaneIds: NON_VALUE_LANES,
      rotationCadence: 'every_60_days',
      rotationCommand: 'rotate database project secret through Supabase project settings, then refresh untracked local lane environment',
      verificationCommand: 'pnpm run db:data-health:ci && pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
      ciMaskingPosture: 'CI accepts database credential presence only from masked environment and never writes connection values',
      leakResponsePath: 'revoke project secret, rotate database password out of band, replay projection health checks, and block unlock until synchronized',
      leakSeverity: 'staging_testnet_blocking',
      blastRadiusNote: 'database projection writes are paused while ledger roots remain replayable',
      runtimeAvailabilityCheck: 'database health route returns project ref posture and table readback counts without credentials',
      auditEventName: 'secret_rotation.database_supabase_project',
      serializedValuePolicy: 'project posture, root, and readback class only; no database credential bytes',
      proofRootBasis: ['DeploymentStoragePosture', 'ledger database reconciliation', 'SupabaseReadbackReceipt'],
    },
    {
      familyId: 'deployment_vercel_project',
      label: 'Vercel deployment and OIDC secret family',
      credentialClass: 'deployment_platform_token',
      storageOwner: 'vercel_project_environment',
      ownerPackage: 'uapi',
      requiredHostIds: ['website', 'api', 'pipeline_workers'],
      supportedLaneIds: NON_VALUE_LANES,
      rotationCadence: 'on_provider_expiry',
      rotationCommand: 'refresh Vercel project authentication with linked project env pull and revoke stale operator token',
      verificationCommand: 'pnpm --dir uapi test -- --runTestsByPath tests/api/pipelineHostPreflight.test.ts --runInBand',
      ciMaskingPosture: 'deployment tokens are masked by provider; logs retain deployment url and env presence class only',
      leakResponsePath: 'revoke token, refresh OIDC session, redeploy preview, and replay pipeline harness preflight',
      leakSeverity: 'interface_boundary_blocking',
      blastRadiusNote: 'deployments and Sandbox creation pause until provider authentication is refreshed',
      runtimeAvailabilityCheck: 'pipeline harness preflight validates deployment auth posture without returning token text',
      auditEventName: 'secret_rotation.deployment_vercel_project',
      serializedValuePolicy: 'provider authentication state only; no token or OIDC assertion bytes',
      proofRootBasis: ['DeploymentHostCapabilityCatalog', 'DistributedExecutionRuntimeReceipt', 'PipelineHarnessPreflight'],
    },
    {
      familyId: 'vcs_github_app',
      label: 'GitHub App repository access secret family',
      credentialClass: 'repository_provider_installation_secret',
      storageOwner: 'github_app_installation',
      ownerPackage: 'packages/generic-tools/vcs',
      requiredHostIds: ['api', 'pipeline_workers', 'repair_jobs'],
      supportedLaneIds: NON_VALUE_LANES,
      rotationCadence: 'every_90_days',
      rotationCommand: 'rotate GitHub App installation credential in provider console and refresh repository connection record',
      verificationCommand: 'pnpm --dir uapi exec jest --runTestsByPath tests/api/vcsRoutes.test.ts --runInBand',
      ciMaskingPosture: 'repository provider tokens are masked and never emitted in VCS route payloads',
      leakResponsePath: 'revoke installation secret, reauthorize app installation, block PR delivery until connection readback passes',
      leakSeverity: 'interface_boundary_blocking',
      blastRadiusNote: 'repository clone and PR delivery pause; AssetPack rights state remains ledgered',
      runtimeAvailabilityCheck: 'VCS connection readback reports provider readiness and scopes class only',
      auditEventName: 'secret_rotation.vcs_github_app',
      serializedValuePolicy: 'connection id, provider id, and scopes class only; no repository credential bytes',
      proofRootBasis: ['AuxillariesConnectionReadiness', 'CreatePullRequestDelivery', 'InterfaceAuthorizationPolicy'],
    },
    {
      familyId: 'wallet_signer_material',
      label: 'wallet signer material family',
      credentialClass: 'wallet_signing_material',
      storageOwner: 'wallet_signer_vault',
      ownerPackage: 'packages/btd',
      requiredHostIds: ['ledger_broadcasters', 'repair_jobs'],
      supportedLaneIds: NON_VALUE_LANES,
      rotationCadence: 'on_wallet_policy_change',
      rotationCommand: 'rotate signer material in wallet vault, update watch descriptor, and rehearse regtest or testnet broadcast boundary',
      verificationCommand: 'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts',
      ciMaskingPosture: 'wallet secret material is masked away from CI; tests use deterministic non-value fixtures only',
      leakResponsePath: 'freeze broadcaster, revoke signer, move funds by operator policy, and require new wallet proof before broadcast resumes',
      leakSeverity: 'wallet_boundary_blocking',
      blastRadiusNote: 'BTC broadcast and settlement finality pause; read previews remain source-safe and unpaid source stays locked',
      runtimeAvailabilityCheck: 'wallet pane reports signer posture and network class without signer bytes',
      auditEventName: 'secret_rotation.wallet_signer_material',
      serializedValuePolicy: 'wallet capability and watch descriptor root only; no signer material bytes',
      proofRootBasis: ['BtcFeeOperation', 'WalletCapability', 'BtdRightsTransferReceipt'],
    },
    {
      familyId: 'object_storage_encryption',
      label: 'object storage encryption secret family',
      credentialClass: 'object_storage_encryption_key_reference',
      storageOwner: 'object_storage_key_manager',
      ownerPackage: 'packages/pipeline-hosts',
      requiredHostIds: ['object_storage', 'repair_jobs'],
      supportedLaneIds: NON_VALUE_LANES,
      rotationCadence: 'every_90_days',
      rotationCommand: 'rotate object storage key reference through storage provider and rewrite protected-object envelope roots',
      verificationCommand: 'pnpm run check:v34-gate4',
      ciMaskingPosture: 'object storage keys are provider-managed and masked from CI; CI sees object roots and key-reference posture only',
      leakResponsePath: 'disable object key reference, re-encrypt protected AssetPack objects, verify roots, and block source delivery during repair',
      leakSeverity: 'mainnet_dry_run_blocking',
      blastRadiusNote: 'protected AssetPack object reads pause until encrypted object roots are rewritten',
      runtimeAvailabilityCheck: 'storage posture compares object root and key-reference posture without payload access',
      auditEventName: 'secret_rotation.object_storage_encryption',
      serializedValuePolicy: 'object root and key-reference class only; no encryption key bytes',
      proofRootBasis: ['DeploymentStoragePosture', 'AssetPackPreview', 'object-storage receipt root'],
    },
    {
      familyId: 'webhook_signing',
      label: 'webhook signing secret family',
      credentialClass: 'webhook_signature_secret',
      storageOwner: 'interface_connector_secret_store',
      ownerPackage: 'uapi',
      requiredHostIds: ['api', 'runtime_observers'],
      supportedLaneIds: NON_VALUE_LANES,
      rotationCadence: 'every_60_days',
      rotationCommand: 'rotate webhook signing secret in connector store and update receiver verification alias',
      verificationCommand: 'pnpm --dir uapi exec jest --runTestsByPath tests/api/auxillariesGithubConnectionRoute.test.ts --runInBand',
      ciMaskingPosture: 'webhook secret is masked; tests assert signature verdicts with fixtures only',
      leakResponsePath: 'disable compromised webhook alias, rotate receiver secret, replay delivery fixture, and append observer event',
      leakSeverity: 'interface_boundary_blocking',
      blastRadiusNote: 'incoming provider events are quarantined until receiver signature verification passes',
      runtimeAvailabilityCheck: 'webhook receiver reports verification verdict and event root without secret text',
      auditEventName: 'secret_rotation.webhook_signing',
      serializedValuePolicy: 'signature verification verdict only; no webhook secret bytes',
      proofRootBasis: ['InterfaceTelemetryProofHook', 'AuxillariesConnectionReadiness', 'RuntimeObserverRepairJob'],
    },
    {
      familyId: 'mcp_server_auth',
      label: 'MCP server auth secret family',
      credentialClass: 'mcp_transport_auth_secret',
      storageOwner: 'interface_connector_secret_store',
      ownerPackage: 'packages/generic-mcps/bitcode',
      requiredHostIds: ['mcp_api', 'api'],
      supportedLaneIds: NON_VALUE_LANES,
      rotationCadence: 'every_60_days',
      rotationCommand: 'rotate MCP transport auth secret in connector store and refresh server-side auth policy',
      verificationCommand: 'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/auth.test.ts --runInBand',
      ciMaskingPosture: 'MCP auth values are masked; tool contract tests assert allow/deny states without secret bytes',
      leakResponsePath: 'revoke connector secret, disable MCP tools, refresh auth policy, and re-run MCP auth unit suite',
      leakSeverity: 'interface_boundary_blocking',
      blastRadiusNote: 'MCP tool ingress pauses while API and Terminal surfaces remain governed by their own auth rows',
      runtimeAvailabilityCheck: 'MCP auth preflight emits policy id, denial reason, and repair action only',
      auditEventName: 'secret_rotation.mcp_server_auth',
      serializedValuePolicy: 'auth policy id and verdict only; no MCP secret bytes',
      proofRootBasis: ['McpToolContract', 'InterfaceAuthorizationPolicy', 'PipelineIngressContract'],
    },
    {
      familyId: 'chatgpt_app_auth',
      label: 'ChatGPT App connector auth secret family',
      credentialClass: 'chatgpt_app_connector_secret',
      storageOwner: 'interface_connector_secret_store',
      ownerPackage: 'packages/chatgptapp',
      requiredHostIds: ['chatgpt_app', 'api'],
      supportedLaneIds: NON_VALUE_LANES,
      rotationCadence: 'every_60_days',
      rotationCommand: 'rotate ChatGPT App connector secret in connector store and refresh action admission policy',
      verificationCommand: 'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/chatgpt-action-contract.test.ts src/__tests__/tools.test.ts --runInBand',
      ciMaskingPosture: 'ChatGPT App connector values are masked; action fixtures prove denial and redaction states',
      leakResponsePath: 'revoke connector secret, disable app actions, refresh connector policy, and re-run action contract tests',
      leakSeverity: 'interface_boundary_blocking',
      blastRadiusNote: 'ChatGPT App actions pause while API and Terminal routes remain available under separate policies',
      runtimeAvailabilityCheck: 'action admission reports connector posture and denial reason without connector value',
      auditEventName: 'secret_rotation.chatgpt_app_auth',
      serializedValuePolicy: 'connector posture and action verdict only; no connector secret bytes',
      proofRootBasis: ['ChatgptAppActionContract', 'InterfaceAuthorizationPolicy', 'InterfaceTelemetryProofHook'],
    },
  ];
}

export function buildSecretRotationFamily(input: SecretRotationFamilyInput): SecretRotationFamily {
  const family: SecretRotationFamily = {
    ...input,
    kind: 'bitcode.secret_rotation_plan.family',
    familyId: assertSecretRotationFamilyId(input.familyId),
    label: assertSafeNonEmptyString(input.label, 'label'),
    ownerPackage: assertSafeNonEmptyString(input.ownerPackage, 'ownerPackage'),
    requiredHostIds: normalizeHostIds(input.requiredHostIds),
    supportedLaneIds: normalizeLaneIds(input.supportedLaneIds),
    rotationCommand: assertSafeNonEmptyString(input.rotationCommand, 'rotationCommand'),
    verificationCommand: assertSafeNonEmptyString(input.verificationCommand, 'verificationCommand'),
    ciMaskingPosture: assertSafeNonEmptyString(input.ciMaskingPosture, 'ciMaskingPosture'),
    leakResponsePath: assertSafeNonEmptyString(input.leakResponsePath, 'leakResponsePath'),
    blastRadiusNote: assertSafeNonEmptyString(input.blastRadiusNote, 'blastRadiusNote'),
    runtimeAvailabilityCheck: assertSafeNonEmptyString(
      input.runtimeAvailabilityCheck,
      'runtimeAvailabilityCheck',
    ),
    auditEventName: assertSafeNonEmptyString(input.auditEventName, 'auditEventName'),
    serializedValuePolicy: assertSafeNonEmptyString(
      input.serializedValuePolicy,
      'serializedValuePolicy',
    ),
    proofRootBasis: normalizeStringArray(input.proofRootBasis, 'proofRootBasis'),
    familyRoot: '',
    sourceSafety: SOURCE_SAFETY,
  };

  assertNoValueBearingMainnet(family.supportedLaneIds);
  assertSafeObject(family, `secret rotation family ${family.familyId}`);

  return {
    ...family,
    familyRoot: stableRoot('secret-rotation-family', [
      family.familyId,
      family.label,
      family.credentialClass,
      family.storageOwner,
      family.ownerPackage,
      family.requiredHostIds.join(','),
      family.supportedLaneIds.join(','),
      family.rotationCadence,
      family.rotationCommand,
      family.verificationCommand,
      family.ciMaskingPosture,
      family.leakResponsePath,
      family.leakSeverity,
      family.blastRadiusNote,
      family.runtimeAvailabilityCheck,
      family.auditEventName,
      family.serializedValuePolicy,
      family.proofRootBasis.join(','),
    ]),
  };
}

export function buildSecretRotationPlan(input: SecretRotationPlanInput = {}): SecretRotationPlan {
  const requiredFamilyIds = normalizeFamilyIds(input.requiredFamilyIds ?? SECRET_ROTATION_FAMILY_IDS);
  const families = (input.families ?? buildSecretRotationFamilyRows()).map(
    buildSecretRotationFamily,
  );
  const observedFamilyIds = families.map((family) => family.familyId);
  const duplicateFamilyIds = findDuplicates(observedFamilyIds);
  if (duplicateFamilyIds.length > 0) {
    throw new Error(`SecretRotationPlan duplicate family ids: ${duplicateFamilyIds.join(', ')}.`);
  }
  const missingFamilyIds = requiredFamilyIds.filter(
    (familyId) => !observedFamilyIds.includes(familyId),
  );
  if (missingFamilyIds.length > 0) {
    throw new Error(`SecretRotationPlan missing family ids: ${missingFamilyIds.join(', ')}.`);
  }

  const rotationCommandsCovered = families.every((family) => Boolean(family.rotationCommand));
  const ciMaskingCovered = families.every((family) => family.ciMaskingPosture.includes('mask'));
  const leakResponseCovered = families.every((family) => Boolean(family.leakResponsePath));
  const blastRadiusCovered = families.every((family) => Boolean(family.blastRadiusNote));
  const runtimeAvailabilityCovered = families.every((family) =>
    Boolean(family.runtimeAvailabilityCheck),
  );
  const auditEventsCovered = families.every((family) =>
    family.auditEventName.startsWith('secret_rotation.'),
  );
  if (
    !rotationCommandsCovered ||
    !ciMaskingCovered ||
    !leakResponseCovered ||
    !blastRadiusCovered ||
    !runtimeAvailabilityCovered ||
    !auditEventsCovered
  ) {
    throw new Error(
      'SecretRotationPlan must cover rotation commands, CI masking, leak response, blast radius, runtime availability, and audit events.',
    );
  }

  const plan: SecretRotationPlan = {
    kind: 'bitcode.secret_rotation_plan',
    schemaId: 'bitcode.secretRotationPlan.v1',
    planRoot: stableRoot('secret-rotation-plan', families.map((family) => family.familyRoot)),
    familyCount: families.length,
    requiredFamilyIds,
    observedFamilyIds,
    missingFamilyIds,
    families,
    rotationCommandsCovered: true,
    ciMaskingCovered: true,
    leakResponseCovered: true,
    blastRadiusCovered: true,
    runtimeAvailabilityCovered: true,
    auditEventsCovered: true,
    noSerializedSecretValues: true,
    valueBearingMainnetBlocked: true,
    sourceSafety: SOURCE_SAFETY,
  };

  assertSafeObject(plan, 'secret rotation plan');
  return plan;
}

function assertSecretRotationFamilyId(familyId: string): SecretRotationFamilyId {
  if (!SECRET_ROTATION_FAMILY_IDS.includes(familyId as SecretRotationFamilyId)) {
    throw new Error(`Unknown secret rotation family id: ${familyId}.`);
  }
  return familyId as SecretRotationFamilyId;
}

function normalizeFamilyIds(familyIds: readonly string[]): SecretRotationFamilyId[] {
  return Array.from(new Set(familyIds.map(assertSecretRotationFamilyId))).sort();
}

function normalizeHostIds(hostIds: readonly DeploymentHostCapabilityId[]): DeploymentHostCapabilityId[] {
  const normalized = Array.from(
    new Set(
      hostIds.map((hostId) => {
        if (!DEPLOYMENT_HOST_CAPABILITY_IDS.includes(hostId)) {
          throw new Error(`Unknown host id for secret rotation plan: ${hostId}.`);
        }
        return hostId;
      }),
    ),
  ).sort();
  if (normalized.length === 0) {
    throw new Error('Secret rotation family must require at least one host.');
  }
  return normalized;
}

function normalizeLaneIds(laneIds: readonly EnvironmentLaneContractId[]): EnvironmentLaneContractId[] {
  const normalized = Array.from(
    new Set(
      laneIds.map((laneId) => {
        if (!ENVIRONMENT_LANE_CONTRACT_IDS.includes(laneId)) {
          throw new Error(`Unknown lane id for secret rotation plan: ${laneId}.`);
        }
        return laneId;
      }),
    ),
  ).sort();
  if (normalized.length === 0) {
    throw new Error('Secret rotation family must support at least one lane.');
  }
  return normalized;
}

function normalizeStringArray(values: readonly string[], label: string): string[] {
  const normalized = Array.from(
    new Set(values.map((value) => assertSafeNonEmptyString(value, label))),
  ).sort();
  if (normalized.length === 0) {
    throw new Error(`${label} must contain at least one value.`);
  }
  return normalized;
}

function assertNoValueBearingMainnet(laneIds: readonly EnvironmentLaneContractId[]): void {
  if (laneIds.includes('value-bearing-mainnet')) {
    throw new Error('SecretRotationPlan must not admit value-bearing-mainnet before future canon.');
  }
}

function assertSafeNonEmptyString(value: string, label: string): string {
  const normalized = assertNonEmptyString(value, label);
  for (const pattern of SECRET_VALUE_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error(`${label} must not contain serialized secret values or protected source.`);
    }
  }
  return normalized;
}

function assertSafeObject(value: unknown, label: string): void {
  const serialized = JSON.stringify(value);
  for (const pattern of SECRET_VALUE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error(`${label} must not contain serialized secret values or protected source.`);
    }
  }
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return Array.from(duplicates).sort();
}

function stableRoot(prefix: string, parts: readonly string[]): string {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}
