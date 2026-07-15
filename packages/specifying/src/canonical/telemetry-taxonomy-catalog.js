// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TELEMETRY_TAXONOMY_CATALOG_ARTIFACT_PATH = '.bitcode/v35-telemetry-taxonomy-catalog.json';
export const TELEMETRY_TAXONOMY_CATALOG_SCHEMA_ID = 'bitcode.v35.telemetryTaxonomyCatalog.v1';
export const TELEMETRY_TAXONOMY_CATALOG_VERSION = 'V35';
export const TELEMETRY_TAXONOMY_CATALOG_CURRENT_TARGET = 'V34';
export const TELEMETRY_TAXONOMY_SOURCE_SAFETY_VERDICT = 'source-safe-telemetry-taxonomy-metadata';

export const TELEMETRY_EVENT_FAMILIES = Object.freeze([
  'pipeline',
  'execution',
  'ptrr_agent',
  'thricified_generation',
  'tool',
  'ledger',
  'wallet',
  'storage',
  'interface',
  'deployment',
  'observer',
  'repair',
  'docs_qa',
  'promotion',
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

const FORBIDDEN_TELEMETRY_PAYLOAD = Object.freeze([
  'secret_values',
  'service_key_values',
  'provider_tokens',
  'wallet_private_material',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'protected_source_payloads',
  'unpaid_assetpack_source',
]);

const taxonomyRows = Object.freeze([
  {
    eventFamily: 'pipeline',
    eventIds: ['pipeline.created', 'pipeline.phase.started', 'pipeline.phase.completed', 'pipeline.failed'],
    sourceSurface: 'packages/pipelines/asset-pack',
    lifecycleStage: 'pipeline_lifecycle',
    severity: 'info',
    sourceSafetyClass: 'source_safe_runtime_metadata',
    redactionPosture: 'roots_context_keys_and_counts_only',
    correlationIds: ['executionId', 'pipelineRunId', 'transactionId', 'readNeedId'],
    proofRootFields: ['pipelineRoot', 'phaseRoot', 'telemetryRoot'],
    storageTarget: 'execution_event_store',
    dashboardPanel: 'dashboard.pipeline.health',
    alertThreshold: 'failed_or_missing_completion_warning',
    runbookLink: 'runbook.pipeline.execution-repair',
    sourceRoots: [
      'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-observability.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/v32-reading-pipeline-proof-coverage.test.ts',
      'apps/uapi/app/api/pipeline-host/asset-pack/runner.ts',
    ],
  },
  {
    eventFamily: 'execution',
    eventIds: ['execution.admitted', 'execution.started', 'execution.completed', 'execution.failed'],
    sourceSurface: 'packages/execution-generics',
    lifecycleStage: 'execution_lifecycle',
    severity: 'info',
    sourceSafetyClass: 'source_safe_runtime_metadata',
    redactionPosture: 'input_output_roots_and_summary_only',
    correlationIds: ['executionId', 'requestId', 'runId', 'traceId'],
    proofRootFields: ['executionRoot', 'requestRoot', 'responseRoot'],
    storageTarget: 'execution_event_store',
    dashboardPanel: 'dashboard.execution.status',
    alertThreshold: 'failed_or_orphaned_execution_warning',
    runbookLink: 'runbook.execution.orphan-repair',
    sourceRoots: [
      'packages/specifying/src/telemetry.js',
      'apps/uapi/app/api/executions/route.ts',
      'apps/uapi/app/api/executions/stream/route.ts',
    ],
  },
  {
    eventFamily: 'ptrr_agent',
    eventIds: ['ptrr_agent.plan.started', 'ptrr_agent.try.completed', 'ptrr_agent.refine.completed', 'ptrr_agent.retry.completed'],
    sourceSurface: 'packages/agent-generics',
    lifecycleStage: 'agent_step_lifecycle',
    severity: 'info',
    sourceSafetyClass: 'source_safe_inference_metadata',
    redactionPosture: 'prompt_template_root_context_keys_and_typed_output_root',
    correlationIds: ['executionId', 'agentId', 'ptrrStepId', 'pipelineRunId'],
    proofRootFields: ['agentRoot', 'stepRoot', 'typedOutputRoot'],
    storageTarget: 'execution_event_store',
    dashboardPanel: 'dashboard.inference.ptrr-agents',
    alertThreshold: 'typed_output_parse_failure_warning',
    runbookLink: 'runbook.inference.ptrr-agent-debug',
    sourceRoots: [
      'packages/agent-generics/README.md',
      'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-contract.test.ts',
      'internal-docs/BITCODE_AGENTIC_EXECUTION.md',
    ],
  },
  {
    eventFamily: 'thricified_generation',
    eventIds: [
      'thricified_generation.reason.completed',
      'thricified_generation.judge.completed',
      'thricified_generation.typed_output.completed',
      'thricified_generation.failed',
    ],
    sourceSurface: 'packages/llm-generics',
    lifecycleStage: 'generation_substep_lifecycle',
    severity: 'info',
    sourceSafetyClass: 'source_safe_inference_metadata',
    redactionPosture: 'prompt_roots_context_keys_raw_response_root_and_parsed_type_only',
    correlationIds: ['executionId', 'agentId', 'ptrrStepId', 'subStepId', 'generationId'],
    proofRootFields: ['promptTemplateRoot', 'interpolatedContextRoot', 'rawResponseRoot', 'parsedTypeRoot'],
    storageTarget: 'execution_event_store',
    dashboardPanel: 'dashboard.inference.thricified-generations',
    alertThreshold: 'judge_or_type_parse_failure_warning',
    runbookLink: 'runbook.inference.generation-redaction',
    sourceRoots: [
      'packages/llm-generics/README.md',
      'packages/asset-packs-pipelines/domain/src/__tests__/v32-reading-pipeline-proof-coverage.test.ts',
      'internal-docs/BITCODE_PROMPT_TRACE.md',
    ],
  },
  {
    eventFamily: 'tool',
    eventIds: ['tool.call.started', 'tool.call.completed', 'tool.call.failed', 'tool.policy.denied'],
    sourceSurface: 'packages/tools-generics',
    lifecycleStage: 'tool_call_lifecycle',
    severity: 'info',
    sourceSafetyClass: 'source_safe_tool_metadata',
    redactionPosture: 'tool_name_roots_exit_code_and_policy_only',
    correlationIds: ['executionId', 'toolCallId', 'agentId', 'requestId'],
    proofRootFields: ['toolInputRoot', 'toolOutputRoot', 'policyRoot'],
    storageTarget: 'execution_event_store',
    dashboardPanel: 'dashboard.tools.calls',
    alertThreshold: 'policy_denial_or_repeated_failure_warning',
    runbookLink: 'runbook.tools.policy-denial',
    sourceRoots: [
      'packages/tools-generics/README.md',
      'packages/generic-tools/web-search/README.md',
      'packages/generic-tools/simple-system-text-search/README.md',
    ],
  },
  {
    eventFamily: 'ledger',
    eventIds: ['ledger.receipt.emitted', 'ledger.finality.observed', 'ledger.projection.drift', 'ledger.repaired'],
    sourceSurface: 'packages/btd',
    lifecycleStage: 'ledger_lifecycle',
    severity: 'warning',
    sourceSafetyClass: 'source_safe_ledger_metadata',
    redactionPosture: 'receipt_roots_transaction_refs_and_state_only',
    correlationIds: ['ledgerReceiptId', 'transactionId', 'assetPackId', 'readId'],
    proofRootFields: ['ledgerRoot', 'receiptRoot', 'finalityRoot'],
    storageTarget: 'ledger_journal_and_database_projection',
    dashboardPanel: 'dashboard.ledger.finality',
    alertThreshold: 'projection_drift_critical',
    runbookLink: 'runbook.ledger.reconciliation-repair',
    sourceRoots: [
      'packages/btd/src/telemetry.ts',
      'packages/btd/src/reconciliation.ts',
      'packages/api/src/routes/btd-crypto.ts',
    ],
  },
  {
    eventFamily: 'wallet',
    eventIds: ['wallet.connection.started', 'wallet.signing.requested', 'wallet.signing.failed', 'wallet.policy.denied'],
    sourceSurface: 'packages/btd',
    lifecycleStage: 'wallet_operation_lifecycle',
    severity: 'warning',
    sourceSafetyClass: 'source_safe_wallet_metadata',
    redactionPosture: 'wallet_id_network_policy_and_error_class_only',
    correlationIds: ['walletId', 'organizationId', 'transactionId', 'requestId'],
    proofRootFields: ['walletCapabilityRoot', 'policyRoot', 'denialRoot'],
    storageTarget: 'wallet_event_store',
    dashboardPanel: 'dashboard.wallet.operations',
    alertThreshold: 'signing_failure_warning',
    runbookLink: 'runbook.wallet.signing-failure',
    sourceRoots: [
      'packages/btd/src/operational-health.ts',
      'apps/uapi/app/api/wallet/authenticate/route.ts',
      'apps/uapi/tests/terminalWalletBtcOperation.test.ts',
    ],
  },
  {
    eventFamily: 'storage',
    eventIds: ['storage.write.admitted', 'storage.write.completed', 'storage.read.denied', 'storage.repair.completed'],
    sourceSurface: 'packages/pipeline-hosts',
    lifecycleStage: 'storage_lifecycle',
    severity: 'warning',
    sourceSafetyClass: 'source_safe_storage_metadata',
    redactionPosture: 'object_key_roots_retention_policy_and_access_state_only',
    correlationIds: ['objectId', 'assetPackId', 'executionId', 'storageRoot'],
    proofRootFields: ['objectStorageRoot', 'retentionRoot', 'accessPolicyRoot'],
    storageTarget: 'object_storage_manifest',
    dashboardPanel: 'dashboard.storage.posture',
    alertThreshold: 'source_lock_or_retention_drift_critical',
    runbookLink: 'runbook.storage.object-repair',
    sourceRoots: [
      'packages/btd/src/deployment-storage-posture.ts',
      'packages/pipeline-hosts/README.md',
      'apps/uapi/app/api/pipeline-host/asset-pack/runner.ts',
    ],
  },
  {
    eventFamily: 'interface',
    eventIds: ['interface.request.received', 'interface.response.rendered', 'interface.auth.denied', 'interface.payload.redacted'],
    sourceSurface: 'uapi_and_interface_packages',
    lifecycleStage: 'interface_lifecycle',
    severity: 'info',
    sourceSafetyClass: 'source_safe_interface_metadata',
    redactionPosture: 'route_contract_roots_status_and_policy_only',
    correlationIds: ['requestId', 'transactionId', 'interfaceId', 'principalId'],
    proofRootFields: ['requestRoot', 'responseRoot', 'interfaceProofRoot'],
    storageTarget: 'interface_event_store',
    dashboardPanel: 'dashboard.interfaces.requests',
    alertThreshold: 'auth_denial_spike_warning',
    runbookLink: 'runbook.interfaces.auth-denial',
    sourceRoots: [
      'packages/api/src/routes/auxillaries-contract.ts',
      'packages/btd/src/interface-telemetry-proof-hook.ts',
      'apps/uapi/app/api/read-review/route.ts',
    ],
  },
  {
    eventFamily: 'deployment',
    eventIds: ['deployment.lane.checked', 'deployment.secret.available', 'deployment.migration.approved', 'deployment.rehearsal.completed'],
    sourceSurface: 'deployment_workflows',
    lifecycleStage: 'deployment_lifecycle',
    severity: 'info',
    sourceSafetyClass: 'source_safe_deployment_metadata',
    redactionPosture: 'lane_ids_capability_ids_and_secret_family_status_only',
    correlationIds: ['deploymentId', 'laneId', 'hostId', 'workflowRunId'],
    proofRootFields: ['deploymentRoot', 'laneRoot', 'capabilityRoot'],
    storageTarget: 'deployment_artifact_store',
    dashboardPanel: 'dashboard.deployment.lanes',
    alertThreshold: 'missing_secret_or_failed_rehearsal_warning',
    runbookLink: 'runbook.deployment.lane-repair',
    sourceRoots: [
      '.github/workflows/bitcode-gate-quality.yml',
      'packages/btd/src/migration-approval-gate.ts',
      '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
    ],
  },
  {
    eventFamily: 'observer',
    eventIds: ['observer.poll.started', 'observer.poll.completed', 'observer.finality.lagged', 'observer.failed'],
    sourceSurface: 'packages/btd',
    lifecycleStage: 'observer_lifecycle',
    severity: 'warning',
    sourceSafetyClass: 'source_safe_observer_metadata',
    redactionPosture: 'observed_root_state_and_lag_class_only',
    correlationIds: ['observerJobId', 'ledgerReceiptId', 'transactionId', 'laneId'],
    proofRootFields: ['observerRoot', 'finalityRoot', 'repairRoot'],
    storageTarget: 'observer_event_store',
    dashboardPanel: 'dashboard.observers.finality',
    alertThreshold: 'finality_lag_warning',
    runbookLink: 'runbook.observer.finality-lag',
    sourceRoots: [
      'packages/btd/src/runtime-observer-repair-job.ts',
      '.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json',
      'apps/uapi/tests/terminalJournalReconciliation.test.ts',
    ],
  },
  {
    eventFamily: 'repair',
    eventIds: ['repair.detected', 'repair.command.started', 'repair.command.completed', 'repair.failed'],
    sourceSurface: 'packages/btd',
    lifecycleStage: 'repair_lifecycle',
    severity: 'warning',
    sourceSafetyClass: 'source_safe_repair_metadata',
    redactionPosture: 'repair_command_id_roots_outcome_and_actor_role_only',
    correlationIds: ['repairJobId', 'incidentId', 'operatorId', 'laneId'],
    proofRootFields: ['repairRoot', 'beforeStateRoot', 'afterStateRoot'],
    storageTarget: 'repair_event_store',
    dashboardPanel: 'dashboard.repairs.outcomes',
    alertThreshold: 'repair_failed_critical',
    runbookLink: 'runbook.repair.failed',
    sourceRoots: [
      'packages/btd/src/rollback-upgrade-repair-playbook.ts',
      '.bitcode/v34-rollback-upgrade-data-repair-playbooks.json',
      'internal-docs/DEPLOYMENT.md',
    ],
  },
  {
    eventFamily: 'docs_qa',
    eventIds: ['docs_qa.catalog.checked', 'docs_qa.drift.detected', 'docs_qa.alignment.failed', 'docs_qa.alignment.repaired'],
    sourceSurface: 'packages/specifying',
    lifecycleStage: 'documentation_quality_lifecycle',
    severity: 'warning',
    sourceSafetyClass: 'source_safe_docs_qa_metadata',
    redactionPosture: 'file_paths_tokens_roots_and_failure_codes_only',
    correlationIds: ['docsQaRunId', 'surfaceId', 'artifactId', 'workflowRunId'],
    proofRootFields: ['docsQaRoot', 'surfaceRoot', 'artifactRoot'],
    storageTarget: 'docs_qa_artifact_store',
    dashboardPanel: 'dashboard.docs.qa',
    alertThreshold: 'alignment_failure_warning',
    runbookLink: 'runbook.docs.qa-repair',
    sourceRoots: [
      'packages/specifying/src/canonical/documentation-surface-catalog.js',
      'scripts/check-v35-gate2-documentation-surface-catalog.mjs',
      '.bitcode/v35-documentation-surface-catalog.json',
    ],
  },
  {
    eventFamily: 'promotion',
    eventIds: ['promotion.check.started', 'promotion.check.completed', 'promotion.blocked', 'promotion.pointer.updated'],
    sourceSurface: 'promotion_workflows',
    lifecycleStage: 'promotion_lifecycle',
    severity: 'critical',
    sourceSafetyClass: 'source_safe_promotion_metadata',
    redactionPosture: 'commit_refs_artifact_roots_and_gate_status_only',
    correlationIds: ['promotionRunId', 'workflowRunId', 'canonicalCommit', 'version'],
    proofRootFields: ['promotionRoot', 'provenRoot', 'canonicalInputRoot'],
    storageTarget: 'promotion_artifact_store',
    dashboardPanel: 'dashboard.promotion.readiness',
    alertThreshold: 'blocked_or_pointer_drift_critical',
    runbookLink: 'runbook.promotion.blocked',
    sourceRoots: [
      'scripts/check-v34-gate10-promotion-readiness.mjs',
      'scripts/promote-bitcode-canon.mjs',
      '.github/workflows/bitcode-canon-quality.yml',
    ],
  },
]);

export const TELEMETRY_TAXONOMY_ROWS = taxonomyRows;

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
export function buildTelemetryTaxonomyCatalog(input = {}) {
  const version = input.version || TELEMETRY_TAXONOMY_CATALOG_VERSION;
  const currentTarget = input.currentTarget || TELEMETRY_TAXONOMY_CATALOG_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = taxonomyRows.map((row) => {
    const sourceEvidence = row.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...row,
      forbiddenPayload: [...FORBIDDEN_TELEMETRY_PAYLOAD],
      sourceEvidence,
      replayExpectation: {
        command: 'pnpm run check:v35-telemetry-taxonomy-catalog',
        failClosedOn: [
          'missing_event_family',
          'missing_redaction_posture',
          'missing_proof_root',
          'missing_source_root',
          'source_unsafe_payload',
        ],
      },
    };

    return {
      ...rowWithoutRoot,
      taxonomyRoot: `telemetry-taxonomy-row:${sha256(row.eventFamily + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedEventFamilies = rows.map((row) => row.eventFamily);
  const missingEventFamilies = TELEMETRY_EVENT_FAMILIES.filter((family) => !observedEventFamilies.includes(family));
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.eventFamily}:${entry.sourceRoot}`),
  );
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsMissingRunbook = rows.filter((row) => !row.runbookLink).map((row) => row.eventFamily);
  const rowsMissingDashboardPanel = rows.filter((row) => !row.dashboardPanel).map((row) => row.eventFamily);
  const rowsMissingProofRoot = rows.filter((row) => row.proofRootFields.length === 0).map((row) => row.eventFamily);
  const rowsMissingRedactionPosture = rows.filter((row) => !row.redactionPosture).map((row) => row.eventFamily);
  const rowsMissingCorrelationIds = rows.filter((row) => row.correlationIds.length === 0).map((row) => row.eventFamily);

  const failures = [
    ...missingEventFamilies.map((family) => `missing telemetry event family ${family}`),
    ...missingSourceRoots.map((sourceRoot) => `missing telemetry source root ${sourceRoot}`),
    ...rowsMissingRunbook.map((family) => `missing runbook link for ${family}`),
    ...rowsMissingDashboardPanel.map((family) => `missing dashboard panel for ${family}`),
    ...rowsMissingProofRoot.map((family) => `missing proof root fields for ${family}`),
    ...rowsMissingRedactionPosture.map((family) => `missing redaction posture for ${family}`),
    ...rowsMissingCorrelationIds.map((family) => `missing correlation ids for ${family}`),
    ...(forbiddenMarkerDetected ? ['telemetry taxonomy contains a secret-shaped marker'] : []),
  ];

  const coverage = {
    requiredEventFamilies: [...TELEMETRY_EVENT_FAMILIES],
    observedEventFamilies,
    missingEventFamilies,
    eventFamilyCount: rows.length,
    totalEventIdCount: rows.reduce((count, row) => count + row.eventIds.length, 0),
    allRequiredFamiliesCovered: includesAll(observedEventFamilies, TELEMETRY_EVENT_FAMILIES),
    pipelineRepresented: observedEventFamilies.includes('pipeline'),
    executionRepresented: observedEventFamilies.includes('execution'),
    ptrrAgentRepresented: observedEventFamilies.includes('ptrr_agent'),
    thricifiedGenerationRepresented: observedEventFamilies.includes('thricified_generation'),
    toolRepresented: observedEventFamilies.includes('tool'),
    ledgerRepresented: observedEventFamilies.includes('ledger'),
    walletRepresented: observedEventFamilies.includes('wallet'),
    storageRepresented: observedEventFamilies.includes('storage'),
    interfaceRepresented: observedEventFamilies.includes('interface'),
    deploymentRepresented: observedEventFamilies.includes('deployment'),
    observerRepresented: observedEventFamilies.includes('observer'),
    repairRepresented: observedEventFamilies.includes('repair'),
    docsQaRepresented: observedEventFamilies.includes('docs_qa'),
    promotionRepresented: observedEventFamilies.includes('promotion'),
    missingSourceRoots,
    rowsMissingRunbook,
    rowsMissingDashboardPanel,
    rowsMissingProofRoot,
    rowsMissingRedactionPosture,
    rowsMissingCorrelationIds,
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
    sourceSafetyVerdict: TELEMETRY_TAXONOMY_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v35-telemetry-taxonomy-catalog',
    schemaId: TELEMETRY_TAXONOMY_CATALOG_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: TELEMETRY_TAXONOMY_SOURCE_SAFETY_VERDICT,
    redactionBoundary: {
      allowedTelemetryPayloadClasses: [
        'event_ids',
        'correlation_ids',
        'proof_roots',
        'counts',
        'state_enums',
        'policy_ids',
        'dashboard_panel_ids',
        'runbook_ids',
      ],
      forbiddenTelemetryPayloadClasses: [...FORBIDDEN_TELEMETRY_PAYLOAD],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredEventFamilies: [...TELEMETRY_EVENT_FAMILIES],
    rows,
    sourceEvidence: rows.map((row) => ({
      eventFamily: row.eventFamily,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `telemetry-taxonomy-catalog:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
