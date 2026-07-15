import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS = [
  '.bitcode/v34-deployment-host-capability-catalog.json',
  '.bitcode/v34-environment-lane-contracts.json',
  '.bitcode/v34-distributed-execution-runtime-receipts.json',
  '.bitcode/v34-deployment-storage-posture.json',
  '.bitcode/v34-secret-rotation-boundary-operations.json',
  '.bitcode/v34-migration-cicd-approval-gates.json',
  '.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json',
  '.bitcode/v34-rollback-upgrade-data-repair-playbooks.json',
  '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
  '.bitcode/v34-promotion-readiness-report.json',
] as const;

export type DeploymentPromotionReadinessArtifactPath =
  (typeof DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS)[number];

export type DeploymentPromotionPosture = 'V33 active / V34 draft' | 'V34 active / V35 draft';

export interface DeploymentPromotionReadinessReportInput {
  reportId: 'v34-promotion-readiness-report';
  version: 'V34';
  currentTarget: 'V33';
  prePromotionPosture: DeploymentPromotionPosture;
  postPromotionPosture: DeploymentPromotionPosture;
  gateArtifactPaths: readonly DeploymentPromotionReadinessArtifactPath[];
  promotionValidationCommands: readonly string[];
  generatedProofOutputs: readonly string[];
  promotionWorkflowPath: '.github/workflows/v34-canon-promotion.yml';
  gateQualityWorkflowPath: '.github/workflows/bitcode-gate-quality.yml';
  canonQualityWorkflowPath: '.github/workflows/bitcode-canon-quality.yml';
  promotionScriptPath: 'scripts/promote-bitcode-canon.mjs';
  specFamilyPromotionScriptPath: 'scripts/prepare-bitcode-spec-family-promotion.mjs';
  runtimePromotionScriptPath: 'scripts/prepare-bitcode-runtime-canon-promotion.mjs';
  valueBearingMainnetAdmission: false;
  protectedSourceSerialized: false;
  secretValuesSerialized: false;
  failClosedResult: string;
  proofRootBasis: readonly string[];
}

export interface DeploymentPromotionReadinessReport
  extends DeploymentPromotionReadinessReportInput {
  kind: 'bitcode.deployment_promotion_readiness_report';
  schemaId: 'bitcode.deploymentPromotionReadinessReport.v1';
  gateArtifactPaths: DeploymentPromotionReadinessArtifactPath[];
  promotionValidationCommands: string[];
  generatedProofOutputs: string[];
  proofRootBasis: string[];
  reportRoot: string;
  allGateArtifactsCovered: true;
  promotionWorkflowCovered: true;
  gateQualityWorkflowCovered: true;
  canonQualityWorkflowCovered: true;
  promotionScriptCovered: true;
  generatedProofOutputsCovered: true;
  valueBearingMainnetBlocked: true;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

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

export function buildDeploymentPromotionReadinessReportInput(): DeploymentPromotionReadinessReportInput {
  return {
    reportId: 'v34-promotion-readiness-report',
    version: 'V34',
    currentTarget: 'V33',
    prePromotionPosture: 'V33 active / V34 draft',
    postPromotionPosture: 'V34 active / V35 draft',
    gateArtifactPaths: DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS,
    promotionValidationCommands: [
      'pnpm run check:v34-gate1',
      'pnpm run check:v34-gate2',
      'pnpm run check:v34-gate3',
      'pnpm run check:v34-gate4',
      'pnpm run check:v34-gate5',
      'pnpm run check:v34-gate6',
      'pnpm run check:v34-gate7',
      'pnpm run check:v34-gate8',
      'pnpm run check:v34-gate9',
      'pnpm run check:v34-gate10',
      'node scripts/promote-bitcode-canon.mjs --version V34 --commit HEAD --dry-run',
    ],
    generatedProofOutputs: [
      'specifications/BITCODE_SPEC_V34_PROVEN.md',
      '.bitcode/v34-spec-family-report.json',
      '.bitcode/v34-canonical-input-report.json',
      '.bitcode/v34-canon-posture-drift-report.json',
      '.bitcode/v34-promotion-readiness-report.json',
    ],
    promotionWorkflowPath: '.github/workflows/v34-canon-promotion.yml',
    gateQualityWorkflowPath: '.github/workflows/bitcode-gate-quality.yml',
    canonQualityWorkflowPath: '.github/workflows/bitcode-canon-quality.yml',
    promotionScriptPath: 'scripts/promote-bitcode-canon.mjs',
    specFamilyPromotionScriptPath: 'scripts/prepare-bitcode-spec-family-promotion.mjs',
    runtimePromotionScriptPath: 'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
    valueBearingMainnetAdmission: false,
    protectedSourceSerialized: false,
    secretValuesSerialized: false,
    failClosedResult: 'promotion remains blocked when any gate artifact, workflow, proof output, or source-safety check is missing',
    proofRootBasis: [
      'DeploymentHostCapabilityCatalog',
      'EnvironmentLaneContract',
      'DistributedExecutionRuntimeReceipt',
      'DeploymentStoragePosture',
      'SecretRotationPlan',
      'MigrationApprovalGate',
      'RuntimeObserverRepairJob',
      'RollbackUpgradeRepairPlaybook',
      'DeploymentReadinessRehearsal',
      'DeploymentPromotionReadinessReport',
    ],
  };
}

export function buildDeploymentPromotionReadinessReport(
  input: DeploymentPromotionReadinessReportInput = buildDeploymentPromotionReadinessReportInput(),
): DeploymentPromotionReadinessReport {
  const report: Omit<DeploymentPromotionReadinessReport, 'reportRoot'> = {
    kind: 'bitcode.deployment_promotion_readiness_report',
    schemaId: 'bitcode.deploymentPromotionReadinessReport.v1',
    reportId: assertExact(input.reportId, 'v34-promotion-readiness-report', 'reportId'),
    version: assertExact(input.version, 'V34', 'version'),
    currentTarget: assertExact(input.currentTarget, 'V33', 'currentTarget'),
    prePromotionPosture: assertPosture(input.prePromotionPosture, 'V33 active / V34 draft', 'prePromotionPosture'),
    postPromotionPosture: assertPosture(input.postPromotionPosture, 'V34 active / V35 draft', 'postPromotionPosture'),
    gateArtifactPaths: input.gateArtifactPaths.map(assertArtifactPath),
    promotionValidationCommands: input.promotionValidationCommands.map((command) =>
      assertSourceSafeString(command, 'promotionValidationCommands'),
    ),
    generatedProofOutputs: input.generatedProofOutputs.map((output) => assertSourceSafeString(output, 'generatedProofOutputs')),
    promotionWorkflowPath: assertExact(input.promotionWorkflowPath, '.github/workflows/v34-canon-promotion.yml', 'promotionWorkflowPath'),
    gateQualityWorkflowPath: assertExact(input.gateQualityWorkflowPath, '.github/workflows/bitcode-gate-quality.yml', 'gateQualityWorkflowPath'),
    canonQualityWorkflowPath: assertExact(input.canonQualityWorkflowPath, '.github/workflows/bitcode-canon-quality.yml', 'canonQualityWorkflowPath'),
    promotionScriptPath: assertExact(input.promotionScriptPath, 'scripts/promote-bitcode-canon.mjs', 'promotionScriptPath'),
    specFamilyPromotionScriptPath: assertExact(
      input.specFamilyPromotionScriptPath,
      'scripts/prepare-bitcode-spec-family-promotion.mjs',
      'specFamilyPromotionScriptPath',
    ),
    runtimePromotionScriptPath: assertExact(
      input.runtimePromotionScriptPath,
      'scripts/prepare-bitcode-runtime-canon-promotion.mjs',
      'runtimePromotionScriptPath',
    ),
    valueBearingMainnetAdmission: input.valueBearingMainnetAdmission,
    protectedSourceSerialized: input.protectedSourceSerialized,
    secretValuesSerialized: input.secretValuesSerialized,
    failClosedResult: assertSourceSafeString(input.failClosedResult, 'failClosedResult'),
    proofRootBasis: input.proofRootBasis.map((basis) => assertSourceSafeString(basis, 'proofRootBasis')),
    allGateArtifactsCovered: true,
    promotionWorkflowCovered: true,
    gateQualityWorkflowCovered: true,
    canonQualityWorkflowCovered: true,
    promotionScriptCovered: true,
    generatedProofOutputsCovered: true,
    valueBearingMainnetBlocked: true,
    sourceSafety: SOURCE_SAFETY,
  };

  assertReportInvariants(report);

  return {
    ...report,
    reportRoot: stableRoot('deployment-promotion-readiness-report', [
      report.reportId,
      report.version,
      report.currentTarget,
      report.prePromotionPosture,
      report.postPromotionPosture,
      report.gateArtifactPaths.join(','),
      report.promotionValidationCommands.join(','),
      report.generatedProofOutputs.join(','),
      report.promotionWorkflowPath,
      report.gateQualityWorkflowPath,
      report.canonQualityWorkflowPath,
      report.promotionScriptPath,
      report.specFamilyPromotionScriptPath,
      report.runtimePromotionScriptPath,
      String(report.valueBearingMainnetAdmission),
      String(report.protectedSourceSerialized),
      String(report.secretValuesSerialized),
      report.failClosedResult,
      report.proofRootBasis.join(','),
    ]),
  };
}

function assertReportInvariants(
  report: Omit<DeploymentPromotionReadinessReport, 'reportRoot'>,
): void {
  const missingArtifacts = DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS.filter(
    (artifactPath) => !report.gateArtifactPaths.includes(artifactPath),
  );
  if (missingArtifacts.length) {
    throw new Error(`Deployment promotion readiness missing gate artifacts: ${missingArtifacts.join(', ')}.`);
  }
  if (findDuplicates(report.gateArtifactPaths).length) {
    throw new Error('Deployment promotion readiness gate artifact paths must be unique.');
  }
  if (!report.promotionValidationCommands.some((command) => command.includes('check:v34-gate10'))) {
    throw new Error('Deployment promotion readiness requires the V34 Gate 10 validation command.');
  }
  if (!report.promotionValidationCommands.some((command) => command.includes('promote-bitcode-canon.mjs --version V34'))) {
    throw new Error('Deployment promotion readiness requires the V34 canonical promotion dry run.');
  }
  if (!report.generatedProofOutputs.includes('specifications/BITCODE_SPEC_V34_PROVEN.md')) {
    throw new Error('Deployment promotion readiness requires the V34 generated proof appendix.');
  }
  if (!report.generatedProofOutputs.includes('.bitcode/v34-promotion-readiness-report.json')) {
    throw new Error('Deployment promotion readiness requires the V34 promotion readiness artifact.');
  }
  if (report.valueBearingMainnetAdmission !== false) {
    throw new Error('Deployment promotion readiness must not admit value-bearing mainnet.');
  }
  if (report.protectedSourceSerialized !== false) {
    throw new Error('Deployment promotion readiness must not serialize protected source.');
  }
  if (report.secretValuesSerialized !== false) {
    throw new Error('Deployment promotion readiness must not serialize secret values.');
  }
  if (!/blocked|denied|locked|missing/iu.test(report.failClosedResult)) {
    throw new Error('Deployment promotion readiness requires fail-closed result text.');
  }
  if (report.proofRootBasis.length === 0) {
    throw new Error('Deployment promotion readiness requires proof roots.');
  }
}

function assertArtifactPath(value: string): DeploymentPromotionReadinessArtifactPath {
  const normalized = assertSourceSafeString(value, 'gateArtifactPaths') as DeploymentPromotionReadinessArtifactPath;
  if (!DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS.includes(normalized)) {
    throw new Error(`Unsupported deployment promotion readiness artifact path: ${value}.`);
  }
  return normalized;
}

function assertPosture<T extends DeploymentPromotionPosture>(
  value: string,
  expected: T,
  label: string,
): T {
  return assertExact(value, expected, label);
}

function assertExact<T extends string>(value: string, expected: T, label: string): T {
  if (value !== expected) {
    throw new Error(`${label} must be ${expected}.`);
  }
  return value as T;
}

function assertSourceSafeString(value: string, label: string): string {
  const normalized = assertNonEmptyString(value, label).trim();
  for (const pattern of SECRET_OR_SOURCE_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error(`${label} must be source-safe deployment promotion readiness metadata.`);
    }
  }
  return normalized;
}

function stableRoot(prefix: string, parts: readonly string[]): string {
  const digest = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${digest}`;
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates].sort();
}
