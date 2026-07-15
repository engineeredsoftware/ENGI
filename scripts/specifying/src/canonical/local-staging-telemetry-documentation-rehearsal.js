// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DOCUMENTATION_SURFACE_IDS } from './documentation-surface-catalog.js';
import { DOCS_QA_ALIGNMENT_IDS } from './docs-qa-alignment-report.js';
import { OPERATOR_RUNBOOK_IDS } from './operator-runbook-catalog.js';
import { TELEMETRY_DOCUMENTATION_INTERFACE_IDS } from './telemetry-documentation-interface-integration.js';
import { TELEMETRY_TAXONOMY_ROWS } from './telemetry-taxonomy-catalog.js';
import { TESTNET_ROLLOUT_GUIDE_IDS } from './testnet-rollout-readiness-guide.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_ARTIFACT_PATH =
  '.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json';
export const LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_SCHEMA_ID =
  'bitcode.v35.localStagingTelemetryDocumentationRehearsal.v1';
export const LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_VERSION = 'V35';
export const LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_CURRENT_TARGET = 'V34';
export const LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-rehearsal-metadata';

export const LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_IDS = Object.freeze([
  'local_telemetry_documentation_rehearsal',
  'staging_testnet_telemetry_documentation_rehearsal',
  'dashboard_runbook_lookup_rehearsal',
  'docs_qa_incident_drill',
  'source_safe_proof_root_review',
  'value_bearing_mainnet_blocked_rehearsal',
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

const FORBIDDEN_REHEARSAL_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'buyer_repository_private_data',
  'unpaid_assetpack_source',
]);

const ALLOWED_REHEARSAL_FIELDS = Object.freeze([
  'laneId',
  'eventIds',
  'proofRoots',
  'docsSurfaceIds',
  'docsLinks',
  'runbookIds',
  'dashboardPanelIds',
  'incidentClasses',
  'redactionPosture',
  'sourceSafetyClass',
  'summaryCounts',
]);

const REQUIRED_PHASES = Object.freeze([
  'documentation_discovery',
  'telemetry_event_emission',
  'dashboard_runbook_lookup',
  'docs_qa_review',
  'incident_drill',
  'source_safe_proof_root_review',
]);

const SHARED_SOURCE_ROOTS = Object.freeze([
  '.specifications/BITCODE_SPEC_V35.md',
  '.specifications/BITCODE_SPEC_V35_DELTA.md',
  '.specifications/BITCODE_SPEC_V35_NOTES.md',
  '.specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md',
  '.specifications/SPECIFICATIONS_ROADMAP.md',
  '.bitcode/v35-documentation-surface-catalog.json',
  '.bitcode/v35-telemetry-taxonomy-catalog.json',
  '.bitcode/v35-public-docs-usage-guides.json',
  '.bitcode/v35-operator-runbook-catalog.json',
  '.bitcode/v35-docs-qa-alignment-report.json',
  '.bitcode/v35-testnet-rollout-readiness-guide.json',
  '.bitcode/v35-telemetry-documentation-interface-integration.json',
]);

const rehearsalRows = Object.freeze([
  row({
    rehearsalId: 'local_telemetry_documentation_rehearsal',
    laneId: 'local',
    title: 'Local telemetry documentation rehearsal',
    purpose:
      'Follow the local operator path from documentation discovery through source-safe telemetry proof-root review before any staging work.',
    phases: REQUIRED_PHASES,
    docsSurfaceIds: [
      'canonical_spec_family',
      'roadmap_contributor_governance',
      'internal_codebase_docs',
      'public_docs_surface',
      'package_readmes',
      'generated_artifact_docs',
      'telemetry_observability_docs',
      'demonstration_docs',
    ],
    interfaceIds: ['terminal', 'auxillaries', 'api', 'package_readmes', 'internal_docs', 'public_docs'],
    eventFamilies: ['pipeline', 'execution', 'ptrr_agent', 'thricified_generation', 'tool', 'interface', 'docs_qa'],
    docsQaIds: ['spec_family_alignment', 'generated_artifact_inventory_alignment', 'workflow_checker_alignment'],
    rolloutGuideIds: ['contributor_onboarding', 'local_development', 'operator_use', 'rehearsal_evidence'],
    sourceRoots: [
      'README.md',
      'scripts/specifying/README.md',
      'apps/uapi/components/README.md',
      '.docs/README.md',
      'apps/uapi/app/docs/bitcode-docs-content.ts',
    ],
    docsLinks: ['/docs/product-workspace', '/docs/proofs', '/docs/configuration', '/docs/commercial-interfaces'],
    evidenceRoots: [
      'rehearsal.local.docs-discovery.root',
      'rehearsal.local.telemetry-event-emission.root',
      'rehearsal.local.dashboard-runbook-lookup.root',
      'rehearsal.local.docs-qa-review.root',
      'rehearsal.local.incident-drill.root',
      'rehearsal.local.proof-root-review.root',
    ],
    screenshotOrLogRoots: ['local-terminal-log-stream-redacted-root', 'local-docs-qa-redacted-output-root'],
    validationCommands: [
      'pnpm run check:v35-gate6',
      'pnpm run check:v35-gate8',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/pipelineExecutionLogHeader.test.tsx --runInBand',
    ],
    incidentClasses: ['docs_qa_alignment_drift', 'telemetry_redaction_regression', 'runbook_lookup_missing'],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'staging_testnet_telemetry_documentation_rehearsal',
    laneId: 'staging-testnet',
    title: 'Staging-testnet telemetry documentation rehearsal',
    purpose:
      'Follow the staging-testnet path across product, API, MCP API, ChatGPT App, docs, telemetry, dashboards, runbooks, and proof roots without value-bearing mainnet admission.',
    phases: REQUIRED_PHASES,
    docsSurfaceIds: [
      'public_docs_surface',
      'route_api_docs',
      'api_interface_docs',
      'deployment_operations_docs',
      'telemetry_observability_docs',
      'security_boundary_docs',
    ],
    interfaceIds: ['terminal', 'api', 'mcp_api', 'chatgpt_app', 'internal_docs', 'public_docs'],
    eventFamilies: ['pipeline', 'execution', 'ledger', 'wallet', 'storage', 'interface', 'deployment', 'observer', 'repair', 'docs_qa'],
    docsQaIds: ['public_docs_disclosure_alignment', 'internal_docs_alignment', 'route_docs_alignment', 'interface_docs_alignment'],
    rolloutGuideIds: ['operator_use', 'enterprise_reader_flow', 'depositor_flow', 'interface_consumer_flow', 'environment_lane_posture'],
    sourceRoots: [
      'packages/api/README.md',
      'apps/mcp/README.md',
      'apps/chatgpt/README.md',
      '.docs/DEPLOYMENT.md',
      'apps/uapi/components/README.md',
    ],
    docsLinks: ['/docs/read-results', '/docs/mcp-api', '/docs/chatgpt-app', '/docs/settlement-btd'],
    evidenceRoots: [
      'rehearsal.staging-testnet.docs-discovery.root',
      'rehearsal.staging-testnet.telemetry-event-emission.root',
      'rehearsal.staging-testnet.dashboard-runbook-lookup.root',
      'rehearsal.staging-testnet.docs-qa-review.root',
      'rehearsal.staging-testnet.incident-drill.root',
      'rehearsal.staging-testnet.proof-root-review.root',
    ],
    screenshotOrLogRoots: [
      'staging-testnet-terminal-log-stream-redacted-root',
      'staging-testnet-interface-proof-readback-redacted-root',
    ],
    validationCommands: [
      'pnpm run check:v35-gate7',
      'pnpm run check:v35-gate8',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalInterfaceIntegrationRegression.test.ts --runInBand',
    ],
    incidentClasses: ['staging_testnet_event_missing', 'dashboard_panel_missing', 'protected_source_disclosure_attempt'],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'dashboard_runbook_lookup_rehearsal',
    laneId: 'staging-testnet',
    title: 'Dashboard and runbook lookup rehearsal',
    purpose:
      'Start from emitted event families and prove operators can resolve dashboard panels, alert thresholds, runbook ids, and source-safe repair commands.',
    phases: REQUIRED_PHASES,
    docsSurfaceIds: ['internal_codebase_docs', 'deployment_operations_docs', 'telemetry_observability_docs'],
    interfaceIds: ['terminal', 'api', 'internal_docs'],
    eventFamilies: ['pipeline', 'execution', 'ledger', 'wallet', 'storage', 'observer', 'repair'],
    docsQaIds: ['internal_docs_alignment', 'workflow_checker_alignment'],
    rolloutGuideIds: ['operator_use', 'environment_lane_posture', 'wallet_settlement_caveats'],
    sourceRoots: ['.docs/README.md', '.docs/DEPLOYMENT.md', '.docs/BITCODE_VERIFICATION.md'],
    docsLinks: ['/docs/proofs', '/docs/configuration', '/docs/commercial-interfaces'],
    evidenceRoots: [
      'rehearsal.dashboard-runbook.event-to-panel.root',
      'rehearsal.dashboard-runbook.alert-to-runbook.root',
      'rehearsal.dashboard-runbook.repair-command-redacted.root',
    ],
    screenshotOrLogRoots: ['dashboard-runbook-lookup-redacted-log-root'],
    validationCommands: ['pnpm run check:v35-gate5', 'pnpm run check:v35-gate6'],
    incidentClasses: ['alert_without_runbook', 'runbook_without_validation_command', 'repair_result_missing_root'],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'docs_qa_incident_drill',
    laneId: 'local',
    title: 'Docs QA incident drill',
    purpose:
      'Rehearse stale docs, missing generated artifacts, unsupported disclosure, and source-unsafe payload blockers from the docs QA report.',
    phases: REQUIRED_PHASES,
    docsSurfaceIds: ['canonical_spec_family', 'public_docs_surface', 'package_readmes', 'generated_artifact_docs'],
    interfaceIds: ['package_readmes', 'internal_docs', 'public_docs'],
    eventFamilies: ['docs_qa', 'promotion', 'repair'],
    docsQaIds: [
      'spec_family_alignment',
      'public_docs_disclosure_alignment',
      'generated_artifact_inventory_alignment',
      'workflow_checker_alignment',
    ],
    rolloutGuideIds: ['known_blockers', 'rehearsal_evidence'],
    sourceRoots: ['.specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md', 'scripts/specifying/src/canonical/docs-qa-alignment-report.js'],
    docsLinks: ['/docs/what-is-bitcode', '/docs/proofs', '/docs/auxillaries'],
    evidenceRoots: [
      'rehearsal.docs-qa.stale-token-blocker.root',
      'rehearsal.docs-qa.generated-artifact-blocker.root',
      'rehearsal.docs-qa.disclosure-blocker.root',
    ],
    screenshotOrLogRoots: ['docs-qa-incident-drill-redacted-log-root'],
    validationCommands: ['pnpm run check:v35-gate6'],
    incidentClasses: ['stale_docs_token', 'missing_generated_artifact', 'unsupported_disclosure_claim'],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'source_safe_proof_root_review',
    laneId: 'mainnet-ready-dry-run',
    title: 'Source-safe proof-root review',
    purpose:
      'Review proof roots, artifact roots, row roots, and source-safety verdicts without exposing protected source, secrets, wallet private material, or unpaid AssetPack source.',
    phases: REQUIRED_PHASES,
    docsSurfaceIds: ['canonical_spec_family', 'generated_artifact_docs', 'security_boundary_docs'],
    interfaceIds: ['terminal', 'api', 'mcp_api', 'chatgpt_app', 'internal_docs', 'public_docs'],
    eventFamilies: ['execution', 'ledger', 'wallet', 'storage', 'interface', 'promotion'],
    docsQaIds: ['generated_artifact_inventory_alignment', 'public_docs_disclosure_alignment', 'route_docs_alignment'],
    rolloutGuideIds: ['environment_lane_posture', 'wallet_settlement_caveats', 'rehearsal_evidence'],
    sourceRoots: ['.github/workflows/bitcode-gate-quality.yml', 'scripts/specifying/src/canonical/v21-specifying.js'],
    docsLinks: ['/docs/proofs', '/docs/settlement-btd', '/docs/commercial-interfaces'],
    evidenceRoots: [
      'rehearsal.proof-root.generated-artifact-root.root',
      'rehearsal.proof-root.telemetry-event-root.root',
      'rehearsal.proof-root.interface-payload-redaction.root',
    ],
    screenshotOrLogRoots: ['proof-root-review-redacted-log-root'],
    validationCommands: [
      'node scripts/check-bitcode-spec-family.mjs --version V35 --mode draft --current-target V34',
      'node scripts/check-bitcode-canonical-inputs.mjs --current-target V34',
      'pnpm run check:v35-gate8',
    ],
    incidentClasses: ['proof_root_missing', 'source_safety_verdict_failed', 'redaction_boundary_failed'],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'value_bearing_mainnet_blocked_rehearsal',
    laneId: 'value-bearing-mainnet',
    title: 'Value-bearing mainnet blocked rehearsal',
    purpose:
      'Make the value-bearing mainnet non-admission visible while preserving local, staging-testnet, public-testnet, and mainnet-ready dry-run rehearsal paths.',
    phases: ['documentation_discovery', 'incident_drill', 'source_safe_proof_root_review'],
    docsSurfaceIds: ['canonical_spec_family', 'deployment_operations_docs', 'security_boundary_docs'],
    interfaceIds: ['terminal', 'api', 'internal_docs', 'public_docs'],
    eventFamilies: ['ledger', 'wallet', 'deployment', 'observer', 'promotion'],
    docsQaIds: ['public_docs_disclosure_alignment', 'internal_docs_alignment'],
    rolloutGuideIds: ['environment_lane_posture', 'wallet_settlement_caveats', 'known_blockers'],
    sourceRoots: ['.bitcode/v34-environment-lane-contracts.json', '.bitcode/v35-testnet-rollout-readiness-guide.json'],
    docsLinks: ['/docs/settlement-btd', '/docs/configuration', '/docs/proofs'],
    evidenceRoots: [
      'rehearsal.mainnet-blocked.non-admission.root',
      'rehearsal.mainnet-blocked.no-broadcast.root',
      'rehearsal.mainnet-blocked.no-source-unlock.root',
    ],
    screenshotOrLogRoots: ['value-bearing-mainnet-blocked-redacted-log-root'],
    validationCommands: ['pnpm run check:v35-gate7'],
    incidentClasses: ['value_bearing_mainnet_blocked', 'settlement_broadcast_denied', 'assetpack_source_unlock_denied'],
    valueBearingMainnetAdmission: false,
  }),
]);

export const LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_ROWS = rehearsalRows;

/**
 * @param {{
 *   rehearsalId: string,
 *   laneId: string,
 *   title: string,
 *   purpose: string,
 *   phases: readonly string[],
 *   docsSurfaceIds: readonly string[],
 *   interfaceIds: readonly string[],
 *   eventFamilies: readonly string[],
 *   docsQaIds: readonly string[],
 *   rolloutGuideIds: readonly string[],
 *   sourceRoots: readonly string[],
 *   docsLinks: readonly string[],
 *   evidenceRoots: readonly string[],
 *   screenshotOrLogRoots: readonly string[],
 *   validationCommands: readonly string[],
 *   incidentClasses: readonly string[],
 *   valueBearingMainnetAdmission: boolean,
 * }} input
 */
function row(input) {
  const telemetryRows = input.eventFamilies.map((family) => {
    const telemetry = TELEMETRY_TAXONOMY_ROWS.find((candidate) => candidate.eventFamily === family);
    if (!telemetry) throw new Error(`Missing telemetry taxonomy row for ${family}.`);
    return telemetry;
  });

  return {
    ...input,
    sourceRoots: [...SHARED_SOURCE_ROOTS, ...input.sourceRoots],
    eventIds: Array.from(new Set(telemetryRows.flatMap((telemetry) => telemetry.eventIds))).sort(),
    proofRootFields: Array.from(new Set(telemetryRows.flatMap((telemetry) => telemetry.proofRootFields))).sort(),
    dashboardPanelIds: Array.from(new Set(telemetryRows.map((telemetry) => telemetry.dashboardPanel))).sort(),
    runbookLinks: Array.from(new Set(telemetryRows.map((telemetry) => telemetry.runbookLink))).sort(),
    redactionPosture: Array.from(new Set(telemetryRows.map((telemetry) => telemetry.redactionPosture))).sort(),
    allowedPayloadFields: ALLOWED_REHEARSAL_FIELDS,
    forbiddenPayloadFields: FORBIDDEN_REHEARSAL_PAYLOAD,
    sourceSafetyClass: LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_SOURCE_SAFETY_VERDICT,
    sourceSafetyRule:
      'Rehearsal evidence may expose lane ids, event ids, proof roots, docs links, runbook ids, dashboard ids, incident classes, redaction posture, and summary counts only.',
    failClosedResult:
      input.laneId === 'value-bearing-mainnet'
        ? `${input.rehearsalId} remains blocked until future canon explicitly admits value-bearing mainnet`
        : `${input.rehearsalId} blocks when documentation discovery, telemetry event emission, dashboard/runbook lookup, docs QA, incident drill, proof-root review, or source-safety evidence is incomplete`,
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
export function buildLocalStagingTelemetryDocumentationRehearsal(input = {}) {
  const version = input.version || LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_VERSION;
  const currentTarget = input.currentTarget || LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = rehearsalRows.map((sourceRow) => {
    const sourceEvidence = sourceRow.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...sourceRow,
      sourceEvidence,
      replayExpectation: {
        command: 'pnpm run check:v35-local-staging-telemetry-documentation-rehearsal',
        failClosedOn: [
          'missing_rehearsal',
          'missing_local_lane',
          'missing_staging_testnet_lane',
          'missing_required_phase',
          'missing_dashboard_or_runbook',
          'missing_docs_qa_binding',
          'missing_source_safe_log_root',
          'value_bearing_mainnet_unblocked',
          'source_unsafe_rehearsal_payload',
        ],
      },
    };

    return {
      ...rowWithoutRoot,
      rehearsalRoot: `telemetry-docs-rehearsal-row:${sha256(sourceRow.rehearsalId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedRehearsalIds = rows.map((row) => row.rehearsalId);
  const missingRehearsalIds = LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_IDS.filter(
    (id) => !observedRehearsalIds.includes(id),
  );
  const observedLaneIds = Array.from(new Set(rows.map((row) => row.laneId))).sort();
  const observedPhases = Array.from(new Set(rows.flatMap((row) => row.phases))).sort();
  const observedDocsSurfaceIds = Array.from(new Set(rows.flatMap((row) => row.docsSurfaceIds))).sort();
  const observedInterfaceIds = Array.from(new Set(rows.flatMap((row) => row.interfaceIds))).sort();
  const observedDocsQaIds = Array.from(new Set(rows.flatMap((row) => row.docsQaIds))).sort();
  const observedRolloutGuideIds = Array.from(new Set(rows.flatMap((row) => row.rolloutGuideIds))).sort();
  const observedEventFamilies = Array.from(new Set(rows.flatMap((row) => row.eventFamilies))).sort();
  const observedRunbookLinks = Array.from(new Set(rows.flatMap((row) => row.runbookLinks))).sort();
  const observedDashboardPanelIds = Array.from(new Set(rows.flatMap((row) => row.dashboardPanelIds))).sort();
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.rehearsalId}:${entry.sourceRoot}`),
  );
  const rowsMissingRequiredPhases = rows
    .filter((row) => row.laneId !== 'value-bearing-mainnet' && !includesAll(row.phases, REQUIRED_PHASES))
    .map((row) => row.rehearsalId);
  const rowsMissingDocsSurfaces = rows.filter((row) => row.docsSurfaceIds.length === 0).map((row) => row.rehearsalId);
  const rowsMissingEventIds = rows.filter((row) => row.eventIds.length === 0).map((row) => row.rehearsalId);
  const rowsMissingProofRoots = rows.filter((row) => row.proofRootFields.length === 0).map((row) => row.rehearsalId);
  const rowsMissingDashboards = rows.filter((row) => row.dashboardPanelIds.length === 0).map((row) => row.rehearsalId);
  const rowsMissingRunbooks = rows.filter((row) => row.runbookLinks.length === 0).map((row) => row.rehearsalId);
  const rowsMissingDocsQa = rows.filter((row) => row.docsQaIds.length === 0).map((row) => row.rehearsalId);
  const rowsMissingEvidence = rows.filter((row) => row.evidenceRoots.length === 0).map((row) => row.rehearsalId);
  const rowsMissingSourceSafeLogs = rows.filter((row) => row.screenshotOrLogRoots.length === 0).map((row) => row.rehearsalId);
  const valueBearingRows = rows.filter((row) => row.laneId === 'value-bearing-mainnet');
  const valueBearingUnblockedRows = valueBearingRows
    .filter((row) => row.valueBearingMainnetAdmission !== false)
    .map((row) => row.rehearsalId);
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);

  const failures = [
    ...missingRehearsalIds.map((id) => `missing rehearsal ${id}`),
    ...missingSourceRoots.map((sourceRoot) => `missing rehearsal source root ${sourceRoot}`),
    ...rowsMissingRequiredPhases.map((id) => `missing required rehearsal phases for ${id}`),
    ...rowsMissingDocsSurfaces.map((id) => `missing docs surfaces for ${id}`),
    ...rowsMissingEventIds.map((id) => `missing event ids for ${id}`),
    ...rowsMissingProofRoots.map((id) => `missing proof roots for ${id}`),
    ...rowsMissingDashboards.map((id) => `missing dashboard panels for ${id}`),
    ...rowsMissingRunbooks.map((id) => `missing runbook links for ${id}`),
    ...rowsMissingDocsQa.map((id) => `missing docs QA binding for ${id}`),
    ...rowsMissingEvidence.map((id) => `missing evidence roots for ${id}`),
    ...rowsMissingSourceSafeLogs.map((id) => `missing source-safe screenshot/log roots for ${id}`),
    ...valueBearingUnblockedRows.map((id) => `value-bearing mainnet is not blocked for ${id}`),
    ...(forbiddenMarkerDetected ? ['local/staging telemetry documentation rehearsal contains a secret-shaped marker'] : []),
  ];

  const coverage = {
    requiredRehearsalIds: [...LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_IDS],
    observedRehearsalIds,
    missingRehearsalIds,
    observedLaneIds,
    observedPhases,
    requiredPhases: [...REQUIRED_PHASES],
    observedDocsSurfaceIds,
    observedInterfaceIds,
    observedDocsQaIds,
    observedRolloutGuideIds,
    observedEventFamilies,
    observedRunbookLinks,
    observedDashboardPanelIds,
    rehearsalCount: rows.length,
    allRequiredRehearsalsCovered: includesAll(observedRehearsalIds, LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_IDS),
    localRehearsalCovered: observedLaneIds.includes('local'),
    stagingTestnetRehearsalCovered: observedLaneIds.includes('staging-testnet'),
    mainnetReadyDryRunCovered: observedLaneIds.includes('mainnet-ready-dry-run'),
    valueBearingMainnetVisibleAndBlocked:
      observedLaneIds.includes('value-bearing-mainnet') && valueBearingRows.length > 0 && valueBearingUnblockedRows.length === 0,
    documentationDiscoveryCovered: observedPhases.includes('documentation_discovery'),
    telemetryEventEmissionCovered: observedPhases.includes('telemetry_event_emission'),
    dashboardRunbookLookupCovered: observedPhases.includes('dashboard_runbook_lookup'),
    docsQaCovered: observedPhases.includes('docs_qa_review'),
    incidentDrillCovered: observedPhases.includes('incident_drill'),
    sourceSafeProofRootReviewCovered: observedPhases.includes('source_safe_proof_root_review'),
    documentationSurfacesCovered: includesAll(observedDocsSurfaceIds, DOCUMENTATION_SURFACE_IDS),
    interfaceSurfacesCovered: includesAll(observedInterfaceIds, TELEMETRY_DOCUMENTATION_INTERFACE_IDS),
    docsQaBindingsCovered: observedDocsQaIds.length > 0 && observedDocsQaIds.every((id) => DOCS_QA_ALIGNMENT_IDS.includes(id)),
    rolloutGuideBindingsCovered:
      observedRolloutGuideIds.length > 0 && observedRolloutGuideIds.every((id) => TESTNET_ROLLOUT_GUIDE_IDS.includes(id)),
    runbookLinksCovered: observedRunbookLinks.length > 0,
    dashboardPanelsCovered: observedDashboardPanelIds.length > 0,
    operatorRunbookCatalogReferenced: OPERATOR_RUNBOOK_IDS.length > 0,
    missingSourceRoots,
    rowsMissingRequiredPhases,
    rowsMissingDocsSurfaces,
    rowsMissingEventIds,
    rowsMissingProofRoots,
    rowsMissingDashboards,
    rowsMissingRunbooks,
    rowsMissingDocsQa,
    rowsMissingEvidence,
    rowsMissingSourceSafeLogs,
    valueBearingUnblockedRows,
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
    sourceSafetyVerdict: LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v35-local-staging-telemetry-documentation-rehearsal',
    schemaId: LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      allowedRehearsalFields: [...ALLOWED_REHEARSAL_FIELDS],
      forbiddenRehearsalPayload: [...FORBIDDEN_REHEARSAL_PAYLOAD],
      rehearsalRule:
        'Local and staging-testnet rehearsal evidence may expose source-safe ids, proof roots, docs links, runbook links, dashboard ids, incident classes, redaction posture, and summary counts only; it must not expose secrets, protected source, raw protected prompts, buyer repository private data, wallet private material, or unpaid AssetPack source.',
    },
    lanePosture: {
      local: 'developer_workstation_source_safe_rehearsal',
      stagingTestnet: 'full_stack_non_value_testnet_rehearsal',
      mainnetReadyDryRun: 'mainnet_watch_only_dry_run_without_value_bearing_unlock',
      valueBearingMainnet: 'blocked_future_canon_required',
    },
    rows,
    coverage,
    sourceEvidence: rows.map((row) => ({
      rehearsalId: row.rehearsalId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `local-staging-telemetry-documentation-rehearsal:${sha256(canonicalJson(artifactSeed)).slice(0, 24)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v35-gate9',
  };
}
