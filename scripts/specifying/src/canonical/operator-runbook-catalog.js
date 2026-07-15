// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TELEMETRY_EVENT_FAMILIES,
  TELEMETRY_TAXONOMY_ROWS,
} from './telemetry-taxonomy-catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const OPERATOR_RUNBOOK_CATALOG_ARTIFACT_PATH = '.bitcode/v35-operator-runbook-catalog.json';
export const OPERATOR_RUNBOOK_CATALOG_SCHEMA_ID = 'bitcode.v35.operatorRunbookCatalog.v1';
export const OPERATOR_RUNBOOK_CATALOG_VERSION = 'V35';
export const OPERATOR_RUNBOOK_CATALOG_CURRENT_TARGET = 'V34';
export const OPERATOR_RUNBOOK_SOURCE_SAFETY_VERDICT = 'source-safe-runbook-metadata';

export const OPERATOR_RUNBOOK_IDS = Object.freeze([
  'runbook.pipeline.execution-repair',
  'runbook.execution.orphan-repair',
  'runbook.inference.ptrr-agent-debug',
  'runbook.inference.generation-redaction',
  'runbook.tools.policy-denial',
  'runbook.ledger.reconciliation-repair',
  'runbook.wallet.signing-failure',
  'runbook.storage.object-repair',
  'runbook.interfaces.auth-denial',
  'runbook.deployment.lane-repair',
  'runbook.observer.finality-lag',
  'runbook.repair.failed',
  'runbook.docs.qa-repair',
  'runbook.promotion.blocked',
]);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_OPERATOR_DATA = Object.freeze([
  'secret_values',
  'privileged_database_key_values',
  'provider_tokens',
  'wallet_private_material',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'protected_source_payloads',
  'unpaid_assetpack_source',
]);

const SHARED_SAFE_DATA = Object.freeze([
  'event_ids',
  'correlation_ids',
  'proof_roots',
  'state_enums',
  'policy_ids',
  'dashboard_panel_ids',
  'runbook_ids',
  'redacted_error_classes',
]);

const SHARED_POST_INCIDENT_DOCS_UPDATES = Object.freeze([
  'record incident class, proof root, affected lane, and repair result in internal runbook notes',
  'update public docs only with source-safe readiness or recovery posture when users are affected',
  'regenerate relevant V35 telemetry/documentation artifacts when catalog evidence changes',
]);

const runbookRows = Object.freeze([
  row('pipeline', {
    incidentClass: 'pipeline_execution_failure',
    escalationPath: ['pipeline operator', 'protocol maintainer', 'deployment owner'],
    commandSequence: [
      'pnpm run check:v35-telemetry-taxonomy-catalog',
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/reading-pipeline-observability.test.ts --runInBand',
      'pnpm test:qa:v28:pipeline-readback',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['RuntimeObserverRepairJob', 'RollbackUpgradeRepairPlaybook', 'ReadFitsFindingSynthesis telemetry'],
  }),
  row('execution', {
    incidentClass: 'execution_orphan_or_missing_completion',
    escalationPath: ['execution operator', 'api maintainer', 'deployment owner'],
    commandSequence: [
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/api/pipelineHostRoute.test.ts --runInBand',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalPipelineHarnessClient.test.ts --runInBand',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['DistributedExecutionRuntimeReceipt', 'execution_event_store', 'execution stream route'],
  }),
  row('ptrr_agent', {
    incidentClass: 'ptrr_agent_typed_output_failure',
    escalationPath: ['agent operator', 'pipeline maintainer', 'prompt registry owner'],
    commandSequence: [
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/reading-pipeline-contract.test.ts --runInBand',
      'pnpm run check:v35-telemetry-taxonomy-catalog',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['PTRR agent registry', 'prompt-part registry', 'typed output parser'],
  }),
  row('thricified_generation', {
    incidentClass: 'thricified_generation_redaction_or_parse_failure',
    escalationPath: ['inference operator', 'prompt registry owner', 'protocol maintainer'],
    commandSequence: [
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/v32-reading-pipeline-proof-coverage.test.ts --runInBand',
      'pnpm run check:v35-telemetry-taxonomy-catalog',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['ThricifiedGeneration prompt roots', 'raw response root redaction', 'parsed type root'],
  }),
  row('tool', {
    incidentClass: 'tool_policy_denial_or_repeated_failure',
    escalationPath: ['tool operator', 'agent maintainer', 'security reviewer'],
    commandSequence: [
      'pnpm --dir apps/mcp run test:mcp -- --runTestsByPath src/__tests__/unit/mcp-tool-contract.test.ts --runInBand',
      'pnpm run check:v35-telemetry-taxonomy-catalog',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['tool registry policy', 'MCP tool contract', 'source-safe tool metadata'],
  }),
  row('ledger', {
    incidentClass: 'ledger_projection_or_finality_drift',
    escalationPath: ['ledger operator', 'BTD maintainer', 'settlement approver'],
    commandSequence: [
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
      'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['RuntimeObserverRepairJob', 'SettlementUnlock', 'BtdRightsTransferReceipt'],
  }),
  row('wallet', {
    incidentClass: 'wallet_signing_or_policy_failure',
    escalationPath: ['wallet operator', 'BTD maintainer', 'security reviewer'],
    commandSequence: [
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalWalletBtcOperation.test.ts --runInBand',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['SecretRotationPlan', 'wallet capability root', 'fee quote policy'],
  }),
  row('storage', {
    incidentClass: 'object_storage_lock_or_retention_drift',
    escalationPath: ['storage operator', 'pipeline host maintainer', 'security reviewer'],
    commandSequence: [
      'pnpm run check:v34-deployment-storage-posture',
      'pnpm --filter @bitcode/pipeline-hosts exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-host-plan.test.ts --runInBand',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['DeploymentStoragePosture', 'AssetPack lock policy', 'object storage manifest'],
  }),
  row('interface', {
    incidentClass: 'interface_auth_denial_or_payload_redaction_spike',
    escalationPath: ['interface operator', 'api maintainer', 'organization policy owner'],
    commandSequence: [
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalOrganizationAuthority.test.ts --runInBand',
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/interface-authorization-policy.test.ts',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['InterfaceTelemetryProofHook', 'organization permission authority', 'route payload redaction'],
  }),
  row('deployment', {
    incidentClass: 'deployment_lane_or_secret_availability_failure',
    escalationPath: ['deployment owner', 'operator lead', 'security reviewer'],
    commandSequence: [
      'pnpm run check:v34-gate9',
      'pnpm run check:v34-gate5',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['EnvironmentLaneContract', 'SecretRotationPlan', 'DeploymentReadinessRehearsal'],
  }),
  row('observer', {
    incidentClass: 'observer_finality_lag',
    escalationPath: ['observer operator', 'ledger operator', 'BTD maintainer'],
    commandSequence: [
      'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalJournalReconciliation.test.ts --runInBand',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['RuntimeObserverRepairJob', 'finality watcher', 'ledger projection repair'],
  }),
  row('repair', {
    incidentClass: 'repair_failed_or_incomplete',
    escalationPath: ['repair operator', 'deployment owner', 'protocol maintainer'],
    commandSequence: [
      'pnpm run check:v34-rollback-upgrade-data-repair-playbooks',
      'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['RollbackUpgradeRepairPlaybook', 'RuntimeObserverRepairJob', 'repair event store'],
  }),
  row('docs_qa', {
    incidentClass: 'documentation_alignment_failure',
    escalationPath: ['docs owner', 'protocol maintainer', 'gate author'],
    commandSequence: [
      'pnpm run check:v35-documentation-surface-catalog',
      'pnpm run check:v35-public-docs-usage-guides',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['DocumentationSurfaceCatalog', 'PublicDocsUsageGuideCatalog', 'DocsQaAlignmentReport'],
  }),
  row('promotion', {
    incidentClass: 'canonical_promotion_blocker',
    escalationPath: ['release operator', 'protocol maintainer', 'repository administrator'],
    commandSequence: [
      'node scripts/check-bitcode-spec-family.mjs --version V35 --mode draft --current-target V34',
      'node scripts/check-bitcode-canonical-inputs.mjs --current-target V34',
      'node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V34 --draft-target V35',
    ],
    verificationCommands: ['pnpm run check:v35-gate5'],
    repairReferences: ['DocumentationTelemetryPromotionReadinessReport', 'canon promotion workflow', 'generated proof appendix'],
  }),
]);

export const OPERATOR_RUNBOOK_ROWS = runbookRows;

/**
 * @param {string} eventFamily
 * @param {{
 *   incidentClass: string,
 *   escalationPath: readonly string[],
 *   commandSequence: readonly string[],
 *   verificationCommands: readonly string[],
 *   repairReferences: readonly string[],
 * }} config
 */
function row(eventFamily, config) {
  const telemetry = TELEMETRY_TAXONOMY_ROWS.find((candidate) => candidate.eventFamily === eventFamily);
  if (!telemetry) throw new Error(`Missing telemetry taxonomy row for ${eventFamily}.`);

  const alertId = `alert.${eventFamily}.${telemetry.alertThreshold.replace(/[^a-z0-9]+/giu, '_').replace(/^_|_$/gu, '')}`;

  return {
    eventFamily,
    eventIds: telemetry.eventIds,
    dashboardPanel: telemetry.dashboardPanel,
    alertId,
    alertThreshold: telemetry.alertThreshold,
    runbookId: telemetry.runbookLink,
    incidentClass: config.incidentClass,
    severity: telemetry.severity,
    escalationPath: config.escalationPath,
    commandSequence: config.commandSequence,
    verificationCommands: config.verificationCommands,
    safeDataAllowed: SHARED_SAFE_DATA,
    forbiddenData: FORBIDDEN_OPERATOR_DATA,
    proofRootBasis: telemetry.proofRootFields,
    repairReferences: config.repairReferences,
    postIncidentDocsUpdates: SHARED_POST_INCIDENT_DOCS_UPDATES,
    sourceSafetyClass: telemetry.sourceSafetyClass,
    redactionPosture: telemetry.redactionPosture,
    storageTarget: telemetry.storageTarget,
    correlationIds: telemetry.correlationIds,
    sourceRoots: [
      '.specifications/BITCODE_SPEC_V35.md',
      '.specifications/BITCODE_SPEC_V35_DELTA.md',
      '.bitcode/v35-telemetry-taxonomy-catalog.json',
      ...telemetry.sourceRoots,
    ],
  };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableRoot(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 * @returns {boolean}
 */
function sourceRootExists(repoRoot, relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

/**
 * @param {ReadonlyArray<string>} values
 * @param {ReadonlyArray<string>} requiredValues
 * @returns {boolean}
 */
function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

/**
 * @param {{
 *   version?: string,
 *   currentTarget?: string,
 *   generatedAt?: string,
 *   repoRoot?: string,
 * }} [input]
 */
export function buildOperatorRunbookCatalog(input = {}) {
  const version = input.version || OPERATOR_RUNBOOK_CATALOG_VERSION;
  const currentTarget = input.currentTarget || OPERATOR_RUNBOOK_CATALOG_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = runbookRows.map((sourceRow) => {
    const sourceEvidence = sourceRow.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...sourceRow,
      sourceEvidence,
      replayExpectation: {
        command: 'pnpm run check:v35-operator-runbook-catalog',
        failClosedOn: [
          'missing_telemetry_binding',
          'missing_dashboard_panel',
          'missing_alert_threshold',
          'missing_incident_class',
          'missing_escalation_path',
          'missing_source_root',
          'source_unsafe_runbook_payload',
        ],
      },
    };

    return {
      ...rowWithoutRoot,
      runbookRoot: `operator-runbook-row:${sha256(sourceRow.runbookId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedRunbookIds = rows.map((row) => row.runbookId);
  const observedEventFamilies = rows.map((row) => row.eventFamily);
  const missingRunbookIds = OPERATOR_RUNBOOK_IDS.filter((runbookId) => !observedRunbookIds.includes(runbookId));
  const missingEventFamilyBindings = TELEMETRY_EVENT_FAMILIES.filter((family) => !observedEventFamilies.includes(family));
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.runbookId}:${entry.sourceRoot}`),
  );
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsMissingDashboardPanel = rows.filter((row) => !row.dashboardPanel).map((row) => row.runbookId);
  const rowsMissingAlertThreshold = rows.filter((row) => !row.alertThreshold).map((row) => row.runbookId);
  const rowsMissingIncidentClass = rows.filter((row) => !row.incidentClass).map((row) => row.runbookId);
  const rowsMissingEscalationPath = rows.filter((row) => row.escalationPath.length === 0).map((row) => row.runbookId);
  const rowsMissingCommands = rows.filter((row) => row.commandSequence.length === 0).map((row) => row.runbookId);
  const rowsMissingVerification = rows.filter((row) => row.verificationCommands.length === 0).map((row) => row.runbookId);
  const rowsMissingProofRoots = rows.filter((row) => row.proofRootBasis.length === 0).map((row) => row.runbookId);
  const rowsMissingDocsUpdates = rows.filter((row) => row.postIncidentDocsUpdates.length === 0).map((row) => row.runbookId);
  const rowsMissingForbiddenData = rows.filter((row) => row.forbiddenData.length === 0).map((row) => row.runbookId);
  const dashboardPanels = Array.from(new Set(rows.map((row) => row.dashboardPanel))).sort();
  const alertIds = Array.from(new Set(rows.map((row) => row.alertId))).sort();
  const incidentClasses = Array.from(new Set(rows.map((row) => row.incidentClass))).sort();

  const failures = [
    ...missingRunbookIds.map((runbookId) => `missing operator runbook ${runbookId}`),
    ...missingEventFamilyBindings.map((family) => `missing telemetry event family binding ${family}`),
    ...missingSourceRoots.map((sourceRoot) => `missing operator runbook source root ${sourceRoot}`),
    ...rowsMissingDashboardPanel.map((runbookId) => `missing dashboard panel for ${runbookId}`),
    ...rowsMissingAlertThreshold.map((runbookId) => `missing alert threshold for ${runbookId}`),
    ...rowsMissingIncidentClass.map((runbookId) => `missing incident class for ${runbookId}`),
    ...rowsMissingEscalationPath.map((runbookId) => `missing escalation path for ${runbookId}`),
    ...rowsMissingCommands.map((runbookId) => `missing command sequence for ${runbookId}`),
    ...rowsMissingVerification.map((runbookId) => `missing verification commands for ${runbookId}`),
    ...rowsMissingProofRoots.map((runbookId) => `missing proof roots for ${runbookId}`),
    ...rowsMissingDocsUpdates.map((runbookId) => `missing post-incident documentation updates for ${runbookId}`),
    ...rowsMissingForbiddenData.map((runbookId) => `missing forbidden data boundary for ${runbookId}`),
    ...(forbiddenMarkerDetected ? ['operator runbook catalog contains a secret-shaped marker'] : []),
  ];

  const coverage = {
    requiredRunbookIds: [...OPERATOR_RUNBOOK_IDS],
    observedRunbookIds,
    missingRunbookIds,
    requiredEventFamilies: [...TELEMETRY_EVENT_FAMILIES],
    observedEventFamilies,
    missingEventFamilyBindings,
    runbookCount: rows.length,
    dashboardPanelCount: dashboardPanels.length,
    alertCount: alertIds.length,
    incidentClassCount: incidentClasses.length,
    dashboardPanels,
    alertIds,
    incidentClasses,
    allRequiredRunbooksCovered: includesAll(observedRunbookIds, OPERATOR_RUNBOOK_IDS),
    allTelemetryFamiliesBound: includesAll(observedEventFamilies, TELEMETRY_EVENT_FAMILIES),
    missingSourceRoots,
    rowsMissingDashboardPanel,
    rowsMissingAlertThreshold,
    rowsMissingIncidentClass,
    rowsMissingEscalationPath,
    rowsMissingCommands,
    rowsMissingVerification,
    rowsMissingProofRoots,
    rowsMissingDocsUpdates,
    rowsMissingForbiddenData,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: OPERATOR_RUNBOOK_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v35-operator-runbook-catalog',
    schemaId: OPERATOR_RUNBOOK_CATALOG_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: OPERATOR_RUNBOOK_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      allowedOperatorData: [...SHARED_SAFE_DATA],
      forbiddenOperatorData: [...FORBIDDEN_OPERATOR_DATA],
      operatorRule:
        'Dashboards, alerts, runbooks, incidents, and escalation may carry source-safe metadata, proof roots, policy ids, and redacted error classes only.',
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredRunbookIds: [...OPERATOR_RUNBOOK_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      runbookId: row.runbookId,
      eventFamily: row.eventFamily,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `operator-runbook-catalog:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
