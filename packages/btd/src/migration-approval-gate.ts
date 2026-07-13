import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import {
  DEPLOYMENT_HOST_CAPABILITY_IDS,
  ENVIRONMENT_LANE_CONTRACT_IDS,
  type DeploymentHostCapabilityId,
  type EnvironmentLaneContractId,
} from './deployment-host-capability-catalog';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const MIGRATION_APPROVAL_GATE_IDS = [
  'schema_migration_approval',
  'generated_type_refresh',
  'route_scan_approval',
  'build_test_gate',
  'generated_artifact_freshness',
  'vercel_lane_check',
  'supabase_lane_check',
  'promotion_commit_approval',
] as const;

export type MigrationApprovalGateId = (typeof MIGRATION_APPROVAL_GATE_IDS)[number];

export type MigrationApprovalClass =
  | 'schema_migration'
  | 'generated_type_refresh'
  | 'route_scan'
  | 'build_test'
  | 'generated_artifact_freshness'
  | 'deployment_lane_check'
  | 'promotion_commit';

export type MigrationApprovalReviewerPosture =
  | 'human_review_required'
  | 'maintainer_signed_review_required'
  | 'promotion_reviewer_required';

export type MigrationApprovalLaneAdmission =
  | 'non_value_lanes_only'
  | 'mainnet_ready_dry_run_only'
  | 'value_bearing_mainnet_blocked';

export interface MigrationApprovalGateInput {
  gateId: MigrationApprovalGateId;
  label: string;
  approvalClass: MigrationApprovalClass;
  ownerPackage: string;
  requiredHostIds: readonly DeploymentHostCapabilityId[];
  supportedLaneIds: readonly EnvironmentLaneContractId[];
  schemaDiffRootPolicy: string;
  generatedTypeRootPolicy: string;
  dryRunCommand: string;
  validationCommand: string;
  reviewerApprovalPosture: MigrationApprovalReviewerPosture;
  reviewerApprovalEvidence: string;
  rollbackPlan: string;
  deploymentLaneAdmission: MigrationApprovalLaneAdmission;
  workflowBinding: string;
  blockingFailureMode: string;
  auditEventName: string;
  proofRootBasis: readonly string[];
}

export interface MigrationApprovalGate extends MigrationApprovalGateInput {
  kind: 'bitcode.migration_approval_gate';
  requiredHostIds: DeploymentHostCapabilityId[];
  supportedLaneIds: EnvironmentLaneContractId[];
  proofRootBasis: string[];
  gateRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface MigrationApprovalGateSetInput {
  gates?: readonly MigrationApprovalGateInput[];
  requiredGateIds?: readonly MigrationApprovalGateId[];
}

export interface MigrationApprovalGateSet {
  kind: 'bitcode.migration_approval_gate_set';
  schemaId: 'bitcode.migrationApprovalGateSet.v1';
  gateSetRoot: string;
  gateCount: number;
  requiredGateIds: MigrationApprovalGateId[];
  observedGateIds: MigrationApprovalGateId[];
  missingGateIds: MigrationApprovalGateId[];
  gates: MigrationApprovalGate[];
  schemaMigrationApprovalCovered: true;
  generatedTypeRefreshCovered: true;
  routeScansCovered: true;
  buildTestGatesCovered: true;
  generatedArtifactFreshnessCovered: true;
  vercelLaneChecksCovered: true;
  supabaseLaneChecksCovered: true;
  promotionCommitsCovered: true;
  reviewerApprovalCovered: true;
  rollbackPlansCovered: true;
  dryRunsCovered: true;
  proofRootsCovered: true;
  noSerializedSecretValues: true;
  valueBearingMainnetBlocked: true;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export const MIGRATION_APPROVAL_GATE_REQUIRED_FIELDS = [
  'approvalClass',
  'ownerPackage',
  'requiredHostIds',
  'supportedLaneIds',
  'schemaDiffRootPolicy',
  'generatedTypeRootPolicy',
  'dryRunCommand',
  'validationCommand',
  'reviewerApprovalPosture',
  'reviewerApprovalEvidence',
  'rollbackPlan',
  'deploymentLaneAdmission',
  'workflowBinding',
  'blockingFailureMode',
  'auditEventName',
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

const SECRET_OR_SOURCE_PATTERNS = [
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

export function buildMigrationApprovalGateRows(): MigrationApprovalGateInput[] {
  return [
    {
      gateId: 'schema_migration_approval',
      label: 'schema migration approval gate',
      approvalClass: 'schema_migration',
      ownerPackage: 'packages/orm',
      requiredHostIds: ['database_projection', 'api'],
      supportedLaneIds: NON_VALUE_LANES,
      schemaDiffRootPolicy: 'schema diff root is required before any migration mutates a lane database',
      generatedTypeRootPolicy: 'generated type root must be refreshed or explicitly proved unchanged after schema dry-run',
      dryRunCommand: 'pnpm run db:reset as disposable local schema dry-run',
      validationCommand: 'pnpm run db:schema-types:check',
      reviewerApprovalPosture: 'human_review_required',
      reviewerApprovalEvidence: 'migration pull request review approval plus schema diff root',
      rollbackPlan: 'rollback by reverting migration file, replaying disposable database reset, and recording repair proof root',
      deploymentLaneAdmission: 'non_value_lanes_only',
      workflowBinding: 'ci.yml Supabase local reset and bitcode-gate-quality validation',
      blockingFailureMode: 'block deployment until migration approval, dry-run, type check, and rollback proof are present',
      auditEventName: 'migration_cicd_approval.schema_migration',
      proofRootBasis: ['supabase/migrations', 'packages/orm/src/types/database.generated.ts', 'db:schema-types:check'],
    },
    {
      gateId: 'generated_type_refresh',
      label: 'generated database type refresh gate',
      approvalClass: 'generated_type_refresh',
      ownerPackage: 'packages/orm',
      requiredHostIds: ['database_projection'],
      supportedLaneIds: NON_VALUE_LANES,
      schemaDiffRootPolicy: 'schema diff root from the migration approval must be carried into type refresh evidence',
      generatedTypeRootPolicy: 'database.generated.ts and database.ts digest roots are required after refresh',
      dryRunCommand: 'pnpm run db:schema-types:check as generated type refresh dry-run',
      validationCommand: 'pnpm run db:schema-types:check',
      reviewerApprovalPosture: 'human_review_required',
      reviewerApprovalEvidence: 'review approval confirms generated type roots match applied migrations',
      rollbackPlan: 'rollback by restoring previous generated type roots and rerunning schema type check',
      deploymentLaneAdmission: 'non_value_lanes_only',
      workflowBinding: 'bitcode-gate-quality generated type focused check',
      blockingFailureMode: 'block deployment when generated types are stale, missing, or not review-approved',
      auditEventName: 'migration_cicd_approval.generated_type_refresh',
      proofRootBasis: ['packages/orm/scripts/check-schema-types.ts', 'packages/orm/src/types/database.generated.ts'],
    },
    {
      gateId: 'route_scan_approval',
      label: 'route scan approval gate',
      approvalClass: 'route_scan',
      ownerPackage: 'uapi',
      requiredHostIds: ['website', 'api', 'mcp_api', 'chatgpt_app'],
      supportedLaneIds: NON_VALUE_LANES,
      schemaDiffRootPolicy: 'route scan records whether schema mutation is absent or already linked to a migration approval',
      generatedTypeRootPolicy: 'route scan records the generated type root consumed by API and interface route contracts',
      dryRunCommand: 'pnpm --dir uapi exec jest route contract subset as route scan dry-run',
      validationCommand: 'pnpm --dir uapi exec jest --runInBand selected route and interface contract tests',
      reviewerApprovalPosture: 'human_review_required',
      reviewerApprovalEvidence: 'review approval confirms route changes preserve shared interface contracts',
      rollbackPlan: 'rollback by reverting route change, replaying route contract subset, and preserving previous interface root',
      deploymentLaneAdmission: 'non_value_lanes_only',
      workflowBinding: 'bitcode-gate-quality staged Reading route and Terminal harness contracts',
      blockingFailureMode: 'block deployment when route scans fail, drift from shared package contracts, or lack review proof',
      auditEventName: 'migration_cicd_approval.route_scan',
      proofRootBasis: ['uapi/app/api', 'uapi/tests', 'InterfaceAuthorizationPolicy', 'ReadLicenseInterfaceContract'],
    },
    {
      gateId: 'build_test_gate',
      label: 'build and test approval gate',
      approvalClass: 'build_test',
      ownerPackage: 'root-workspace',
      requiredHostIds: ['website', 'api', 'pipeline_workers', 'proof_services'],
      supportedLaneIds: NON_VALUE_LANES,
      schemaDiffRootPolicy: 'build test gate consumes any migration schema diff root before deployment admission',
      generatedTypeRootPolicy: 'build test gate consumes current generated type root before deployment admission',
      dryRunCommand: 'pnpm workspace typecheck and focused package tests as build test dry-run',
      validationCommand: 'pnpm --filter @bitcode/btd test && pnpm --filter @bitcode/protocol test',
      reviewerApprovalPosture: 'maintainer_signed_review_required',
      reviewerApprovalEvidence: 'signed maintainer review approval plus passing required checks',
      rollbackPlan: 'rollback by reverting the gate branch, rerunning package checks, and preserving prior proof roots',
      deploymentLaneAdmission: 'non_value_lanes_only',
      workflowBinding: 'ci.yml and bitcode-gate-quality typecheck test build jobs',
      blockingFailureMode: 'block deployment when required build, typecheck, or test jobs are red or unreviewed',
      auditEventName: 'migration_cicd_approval.build_test_gate',
      proofRootBasis: ['.github/workflows/ci.yml', '.github/workflows/bitcode-gate-quality.yml', 'package.json'],
    },
    {
      gateId: 'generated_artifact_freshness',
      label: 'generated artifact freshness gate',
      approvalClass: 'generated_artifact_freshness',
      ownerPackage: 'packages/protocol',
      requiredHostIds: ['proof_services'],
      supportedLaneIds: NON_VALUE_LANES,
      schemaDiffRootPolicy: 'generated artifact freshness records schema diff roots for any artifact affected by migrations',
      generatedTypeRootPolicy: 'generated artifact freshness records type roots for artifacts derived from database contracts',
      dryRunCommand: 'node scripts/check-bitcode-spec-family.mjs --version V34 --mode draft --current-target V33 as generated artifact dry-run',
      validationCommand: 'pnpm run check:v34-gate6',
      reviewerApprovalPosture: 'human_review_required',
      reviewerApprovalEvidence: 'review approval confirms deterministic generated artifacts are current',
      rollbackPlan: 'rollback by regenerating previous source-safe artifacts and rerunning spec family checks',
      deploymentLaneAdmission: 'non_value_lanes_only',
      workflowBinding: 'bitcode-gate-quality draft canon posture checks',
      blockingFailureMode: 'block deployment when generated artifacts are stale, source-unsafe, or missing from canonical allowlist',
      auditEventName: 'migration_cicd_approval.generated_artifact_freshness',
      proofRootBasis: ['.bitcode', 'packages/protocol/src/canonical/v21-specifying.js', 'check:spec-family'],
    },
    {
      gateId: 'vercel_lane_check',
      label: 'Vercel lane approval gate',
      approvalClass: 'deployment_lane_check',
      ownerPackage: 'uapi',
      requiredHostIds: ['website', 'api', 'pipeline_workers'],
      supportedLaneIds: NON_VALUE_LANES,
      schemaDiffRootPolicy: 'Vercel lane approval carries schema diff root before preview or staging deployment unlock',
      generatedTypeRootPolicy: 'Vercel lane approval carries generated type root before preview or staging deployment unlock',
      dryRunCommand: 'pnpm --dir uapi exec jest pipeline harness preflight as Vercel lane dry-run',
      validationCommand: 'pnpm --dir uapi exec jest --runTestsByPath tests/api/pipelineHostPreflight.test.ts --runInBand',
      reviewerApprovalPosture: 'human_review_required',
      reviewerApprovalEvidence: 'review approval confirms Vercel preview lane environment and Sandbox posture are non-value',
      rollbackPlan: 'rollback by disabling preview promotion, reverting lane env binding, and replaying harness preflight',
      deploymentLaneAdmission: 'mainnet_ready_dry_run_only',
      workflowBinding: 'Vercel preview deployment plus bitcode-gate-quality preflight',
      blockingFailureMode: 'block deployment when Vercel auth, Sandbox posture, route build, or lane binding is missing',
      auditEventName: 'migration_cicd_approval.vercel_lane_check',
      proofRootBasis: ['DeploymentHostCapabilityCatalog', 'EnvironmentLaneContract', 'PipelineHarnessPreflight'],
    },
    {
      gateId: 'supabase_lane_check',
      label: 'Supabase lane approval gate',
      approvalClass: 'deployment_lane_check',
      ownerPackage: 'packages/orm',
      requiredHostIds: ['database_projection', 'api', 'repair_jobs'],
      supportedLaneIds: NON_VALUE_LANES,
      schemaDiffRootPolicy: 'Supabase lane approval carries schema diff root and readback root before database projection unlock',
      generatedTypeRootPolicy: 'Supabase lane approval carries generated type root and ORM type root before database projection unlock',
      dryRunCommand: 'pnpm run db:data-health:ci && pnpm run db:schema-types:check as Supabase lane dry-run',
      validationCommand: 'pnpm run db:data-health:ci && pnpm run db:schema-types:check',
      reviewerApprovalPosture: 'human_review_required',
      reviewerApprovalEvidence: 'review approval confirms Supabase lane project and generated type roots are aligned',
      rollbackPlan: 'rollback by restoring previous migration state, replaying database projection repair, and rechecking schema types',
      deploymentLaneAdmission: 'mainnet_ready_dry_run_only',
      workflowBinding: 'ci.yml Supabase local stack and ORM schema type checks',
      blockingFailureMode: 'block deployment when Supabase project, REST readback, DB readback, or type roots are misaligned',
      auditEventName: 'migration_cicd_approval.supabase_lane_check',
      proofRootBasis: ['DeploymentStoragePosture', 'SupabaseReadbackReceipt', 'packages/orm/scripts/check-schema-types.ts'],
    },
    {
      gateId: 'promotion_commit_approval',
      label: 'canonical promotion commit approval gate',
      approvalClass: 'promotion_commit',
      ownerPackage: 'packages/protocol',
      requiredHostIds: ['proof_services'],
      supportedLaneIds: NON_VALUE_LANES,
      schemaDiffRootPolicy: 'promotion commit approval carries final schema diff root and closed gate roots',
      generatedTypeRootPolicy: 'promotion commit approval carries final generated type root and generated artifact roots',
      dryRunCommand: 'node scripts/promote-bitcode-canon.mjs --version V34 --commit HEAD --dry-run',
      validationCommand: 'future V34 promotion workflow runs all closed gate checks before committing BITCODE_SPEC.txt',
      reviewerApprovalPosture: 'promotion_reviewer_required',
      reviewerApprovalEvidence: 'version branch pull request approval plus green promotion workflow dry-run',
      rollbackPlan: 'rollback by reverting promotion branch commit before merge or opening canon repair PR after merge',
      deploymentLaneAdmission: 'value_bearing_mainnet_blocked',
      workflowBinding: 'v34-canon-promotion.yml or Gate 10 promotion workflow successor',
      blockingFailureMode: 'block promotion when closed gate roots, generated proofs, reviewer approval, or promotion dry-run are missing',
      auditEventName: 'migration_cicd_approval.promotion_commit',
      proofRootBasis: ['BITCODE_SPEC.txt', 'BITCODE_SPEC_V34_PROVEN.md', 'promote-bitcode-canon'],
    },
  ];
}

export function buildMigrationApprovalGate(input: MigrationApprovalGateInput): MigrationApprovalGate {
  const gate: MigrationApprovalGate = {
    ...input,
    kind: 'bitcode.migration_approval_gate',
    gateId: assertMigrationApprovalGateId(input.gateId),
    label: assertSafeNonEmptyString(input.label, 'label'),
    ownerPackage: assertSafeNonEmptyString(input.ownerPackage, 'ownerPackage'),
    requiredHostIds: normalizeHostIds(input.requiredHostIds),
    supportedLaneIds: normalizeLaneIds(input.supportedLaneIds),
    schemaDiffRootPolicy: assertSafeNonEmptyString(input.schemaDiffRootPolicy, 'schemaDiffRootPolicy'),
    generatedTypeRootPolicy: assertSafeNonEmptyString(
      input.generatedTypeRootPolicy,
      'generatedTypeRootPolicy',
    ),
    dryRunCommand: assertSafeNonEmptyString(input.dryRunCommand, 'dryRunCommand'),
    validationCommand: assertSafeNonEmptyString(input.validationCommand, 'validationCommand'),
    reviewerApprovalEvidence: assertSafeNonEmptyString(
      input.reviewerApprovalEvidence,
      'reviewerApprovalEvidence',
    ),
    rollbackPlan: assertSafeNonEmptyString(input.rollbackPlan, 'rollbackPlan'),
    workflowBinding: assertSafeNonEmptyString(input.workflowBinding, 'workflowBinding'),
    blockingFailureMode: assertSafeNonEmptyString(input.blockingFailureMode, 'blockingFailureMode'),
    auditEventName: assertSafeNonEmptyString(input.auditEventName, 'auditEventName'),
    proofRootBasis: normalizeStringArray(input.proofRootBasis, 'proofRootBasis'),
    gateRoot: '',
    sourceSafety: SOURCE_SAFETY,
  };

  assertNoValueBearingMainnet(gate.supportedLaneIds);
  assertApprovalPosture(gate);
  assertSafeObject(gate, `migration approval gate ${gate.gateId}`);

  return {
    ...gate,
    gateRoot: stableRoot('migration-approval-gate', [
      gate.gateId,
      gate.approvalClass,
      gate.ownerPackage,
      gate.requiredHostIds.join(','),
      gate.supportedLaneIds.join(','),
      gate.schemaDiffRootPolicy,
      gate.generatedTypeRootPolicy,
      gate.dryRunCommand,
      gate.validationCommand,
      gate.reviewerApprovalPosture,
      gate.reviewerApprovalEvidence,
      gate.rollbackPlan,
      gate.deploymentLaneAdmission,
      gate.workflowBinding,
      gate.blockingFailureMode,
      gate.auditEventName,
      gate.proofRootBasis.join(','),
    ]),
  };
}

export function buildMigrationApprovalGateSet(
  input: MigrationApprovalGateSetInput = {},
): MigrationApprovalGateSet {
  const requiredGateIds = normalizeGateIds(input.requiredGateIds ?? MIGRATION_APPROVAL_GATE_IDS);
  const gates = (input.gates ?? buildMigrationApprovalGateRows()).map(buildMigrationApprovalGate);
  const observedGateIds = gates.map((gate) => gate.gateId);
  const duplicateGateIds = findDuplicates(observedGateIds);
  if (duplicateGateIds.length > 0) {
    throw new Error(`MigrationApprovalGateSet duplicate gate ids: ${duplicateGateIds.join(', ')}.`);
  }
  const missingGateIds = requiredGateIds.filter((gateId) => !observedGateIds.includes(gateId));
  if (missingGateIds.length > 0) {
    throw new Error(`MigrationApprovalGateSet missing gate ids: ${missingGateIds.join(', ')}.`);
  }

  const dryRunsCovered = gates.every((gate) => gate.dryRunCommand.toLowerCase().includes('dry-run'));
  const reviewerApprovalCovered = gates.every((gate) =>
    gate.reviewerApprovalEvidence.toLowerCase().includes('approval'),
  );
  const rollbackPlansCovered = gates.every((gate) =>
    gate.rollbackPlan.toLowerCase().includes('rollback'),
  );
  const proofRootsCovered = gates.every((gate) => gate.proofRootBasis.length > 0);
  const auditEventsCovered = gates.every((gate) =>
    gate.auditEventName.startsWith('migration_cicd_approval.'),
  );
  if (
    !dryRunsCovered ||
    !reviewerApprovalCovered ||
    !rollbackPlansCovered ||
    !proofRootsCovered ||
    !auditEventsCovered
  ) {
    throw new Error(
      'MigrationApprovalGateSet must cover dry-runs, reviewer approvals, rollback plans, proof roots, and audit events.',
    );
  }

  const gateSet: MigrationApprovalGateSet = {
    kind: 'bitcode.migration_approval_gate_set',
    schemaId: 'bitcode.migrationApprovalGateSet.v1',
    gateSetRoot: stableRoot('migration-approval-gate-set', gates.map((gate) => gate.gateRoot)),
    gateCount: gates.length,
    requiredGateIds,
    observedGateIds,
    missingGateIds,
    gates,
    schemaMigrationApprovalCovered: true,
    generatedTypeRefreshCovered: true,
    routeScansCovered: true,
    buildTestGatesCovered: true,
    generatedArtifactFreshnessCovered: true,
    vercelLaneChecksCovered: true,
    supabaseLaneChecksCovered: true,
    promotionCommitsCovered: true,
    reviewerApprovalCovered: true,
    rollbackPlansCovered: true,
    dryRunsCovered: true,
    proofRootsCovered: true,
    noSerializedSecretValues: true,
    valueBearingMainnetBlocked: true,
    sourceSafety: SOURCE_SAFETY,
  };

  assertSafeObject(gateSet, 'migration approval gate set');
  return gateSet;
}

function assertMigrationApprovalGateId(gateId: string): MigrationApprovalGateId {
  if (!MIGRATION_APPROVAL_GATE_IDS.includes(gateId as MigrationApprovalGateId)) {
    throw new Error(`Unknown migration approval gate id: ${gateId}.`);
  }
  return gateId as MigrationApprovalGateId;
}

function normalizeGateIds(gateIds: readonly string[]): MigrationApprovalGateId[] {
  return Array.from(new Set(gateIds.map(assertMigrationApprovalGateId))).sort();
}

function normalizeHostIds(hostIds: readonly DeploymentHostCapabilityId[]): DeploymentHostCapabilityId[] {
  const normalized = Array.from(
    new Set(
      hostIds.map((hostId) => {
        if (!DEPLOYMENT_HOST_CAPABILITY_IDS.includes(hostId)) {
          throw new Error(`Unknown host id for migration approval gate: ${hostId}.`);
        }
        return hostId;
      }),
    ),
  ).sort();
  if (normalized.length === 0) {
    throw new Error('MigrationApprovalGate must require at least one host.');
  }
  return normalized;
}

function normalizeLaneIds(laneIds: readonly EnvironmentLaneContractId[]): EnvironmentLaneContractId[] {
  const normalized = Array.from(
    new Set(
      laneIds.map((laneId) => {
        if (!ENVIRONMENT_LANE_CONTRACT_IDS.includes(laneId)) {
          throw new Error(`Unknown lane id for migration approval gate: ${laneId}.`);
        }
        return laneId;
      }),
    ),
  ).sort();
  if (normalized.length === 0) {
    throw new Error('MigrationApprovalGate must support at least one lane.');
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
    throw new Error('MigrationApprovalGate must not admit value-bearing-mainnet before future canon.');
  }
}

function assertApprovalPosture(gate: MigrationApprovalGate): void {
  if (!gate.dryRunCommand.toLowerCase().includes('dry-run')) {
    throw new Error(`${gate.gateId} must include a dry-run command posture.`);
  }
  if (!gate.reviewerApprovalEvidence.toLowerCase().includes('approval')) {
    throw new Error(`${gate.gateId} must include reviewer approval evidence.`);
  }
  if (!gate.rollbackPlan.toLowerCase().includes('rollback')) {
    throw new Error(`${gate.gateId} must include a rollback plan.`);
  }
  if (!gate.auditEventName.startsWith('migration_cicd_approval.')) {
    throw new Error(`${gate.gateId} must use migration_cicd_approval audit events.`);
  }
}

function assertSafeNonEmptyString(value: string, label: string): string {
  const normalized = assertNonEmptyString(value, label);
  for (const pattern of SECRET_OR_SOURCE_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error(`${label} must not contain serialized secret values or protected source.`);
    }
  }
  return normalized;
}

function assertSafeObject(value: unknown, label: string): void {
  const serialized = JSON.stringify(value);
  for (const pattern of SECRET_OR_SOURCE_PATTERNS) {
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
