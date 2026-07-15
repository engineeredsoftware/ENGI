// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TESTNET_ROLLOUT_READINESS_GUIDE_ARTIFACT_PATH = '.bitcode/v35-testnet-rollout-readiness-guide.json';
export const TESTNET_ROLLOUT_READINESS_GUIDE_SCHEMA_ID = 'bitcode.v35.testnetRolloutReadinessGuide.v1';
export const TESTNET_ROLLOUT_READINESS_GUIDE_VERSION = 'V35';
export const TESTNET_ROLLOUT_READINESS_GUIDE_CURRENT_TARGET = 'V34';
export const TESTNET_ROLLOUT_READINESS_SOURCE_SAFETY_VERDICT = 'source-safe-rollout-guide-metadata';

export const TESTNET_ROLLOUT_GUIDE_IDS = Object.freeze([
  'contributor_onboarding',
  'local_development',
  'operator_use',
  'enterprise_reader_flow',
  'depositor_flow',
  'interface_consumer_flow',
  'environment_lane_posture',
  'wallet_settlement_caveats',
  'known_blockers',
  'rehearsal_evidence',
]);

export const TESTNET_ROLLOUT_LANE_IDS = Object.freeze([
  'local',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
  'value-bearing-mainnet',
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

const FORBIDDEN_ROLLOUT_DISCLOSURE = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'buyer_repository_private_data',
]);

const SHARED_ALLOWED_DISCLOSURE = Object.freeze([
  'lane_ids',
  'guide_ids',
  'source_safe_route_names',
  'validation_commands',
  'proof_roots',
  'dashboard_panel_ids',
  'runbook_ids',
  'redacted_failure_classes',
  'public_docs_slugs',
]);

const SHARED_SOURCE_ROOTS = Object.freeze([
  'BITCODE_SPEC_V35.md',
  'BITCODE_SPEC_V35_DELTA.md',
  'BITCODE_SPEC_V35_NOTES.md',
  'BITCODE_SPEC_V35_PARITY_MATRIX.md',
  'SPECIFICATIONS_ROADMAP.md',
  'README.md',
  '.bitcode/v34-environment-lane-contracts.json',
  '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
  '.bitcode/v35-documentation-surface-catalog.json',
  '.bitcode/v35-telemetry-taxonomy-catalog.json',
  '.bitcode/v35-public-docs-usage-guides.json',
  '.bitcode/v35-operator-runbook-catalog.json',
  '.bitcode/v35-docs-qa-alignment-report.json',
]);

const guideRows = Object.freeze([
  row({
    guideId: 'contributor_onboarding',
    audience: 'contributors',
    title: 'Contributor onboarding path',
    purpose: 'Bring a contributor from canon reading to gate-quality proof without relying on unstated repository folklore.',
    laneIds: ['local', 'staging-testnet'],
    workflowStages: ['canon-orientation', 'branch-selection', 'gate-scope-reading', 'local-validation', 'pull-request-review'],
    sourceRoots: ['AGENTS.md', 'scripts/specifying/README.md'],
    reproducibleCommands: [
      'sed -n 1,80p BITCODE_SPEC.txt',
      'pnpm run check:v35-gate7',
      'git diff --check',
    ],
    guideExamples: [
      'Read active canon pointer, read V35 draft family, branch from version/v35, and close only one gate scope.',
      'Use source-safe generated artifacts and package-owned helpers before updating public docs.',
    ],
    knownBlockers: [
      'wrong branch family',
      'unread active canon pointer',
      'gate artifact missing generated source',
      'direct main push attempt',
    ],
    rehearsalEvidence: [
      '.bitcode/v35-docs-qa-alignment-report.json',
      '.github/workflows/bitcode-gate-quality.yml',
    ],
    validationCommands: ['pnpm run check:v35-gate7'],
  }),
  row({
    guideId: 'local_development',
    audience: 'developers',
    title: 'Local development path',
    purpose: 'Run the website, protocol packages, and demonstration checks locally with source-safe environment posture.',
    laneIds: ['local'],
    workflowStages: ['workspace-install', 'uapi-typecheck', 'mock-route-tests', 'protocol-package-tests', 'demonstration-validation'],
    sourceRoots: ['apps/uapi/README.md', 'protocol-demonstration/README.md'],
    reproducibleCommands: [
      'pnpm --dir apps/uapi exec tsc --noEmit --pretty false',
      'pnpm --filter @bitcode/specifying test',
      'npm --prefix protocol-demonstration run test:v28-mvp-qa',
    ],
    guideExamples: [
      'Use mock-mode interface proof for local inspection before staging-testnet validation.',
      'Use package tests for source-owned protocol objects before route or interface wiring.',
    ],
    knownBlockers: [
      'workspace install drift',
      'local mock flags missing',
      'source-safe artifact stale',
      'protocol demonstration dependency imported into package source',
    ],
    rehearsalEvidence: [
      '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
      'protocol-demonstration/test/v28-mvp-qa.test.js',
    ],
    validationCommands: ['pnpm --filter @bitcode/specifying test', 'pnpm run check:v35-gate7'],
  }),
  row({
    guideId: 'operator_use',
    audience: 'operators',
    title: 'Operator use path',
    purpose: 'Trace telemetry, dashboards, alerts, runbooks, and repair commands from a source-safe rollout view.',
    laneIds: ['staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
    workflowStages: ['event-review', 'dashboard-check', 'alert-threshold-check', 'runbook-execution', 'post-incident-doc-update'],
    sourceRoots: ['internal-docs/DEPLOYMENT.md', 'internal-docs/BITCODE_VERIFICATION.md'],
    reproducibleCommands: [
      'pnpm run check:v35-telemetry-taxonomy-catalog',
      'pnpm run check:v35-operator-runbook-catalog',
      'pnpm run check:v35-gate7',
    ],
    guideExamples: [
      'Start from telemetry family and event ids, then inspect the mapped dashboard panel and runbook id.',
      'Record only redacted error classes, proof roots, lane ids, and repair result in operator notes.',
    ],
    knownBlockers: [
      'dashboard row without telemetry family',
      'alert without runbook id',
      'incident note attempts to include secrets',
      'staging-testnet proof root missing',
    ],
    rehearsalEvidence: [
      '.bitcode/v35-telemetry-taxonomy-catalog.json',
      '.bitcode/v35-operator-runbook-catalog.json',
    ],
    validationCommands: ['pnpm run check:v35-gate5', 'pnpm run check:v35-gate7'],
  }),
  row({
    guideId: 'enterprise_reader_flow',
    audience: 'enterprise-readers',
    title: 'Enterprise reader flow',
    purpose: 'Explain the safe testnet path from Read request through Need review, FindingFits, AssetPack preview, settlement, and delivery.',
    laneIds: ['local', 'staging-testnet', 'public-testnet'],
    workflowStages: ['request-read', 'review-read-need', 'request-fits', 'review-assetpack-preview', 'settle-and-unlock'],
    sourceRoots: ['apps/uapi/components/README.md', 'apps/uapi/app/docs/bitcode-docs-content.ts'],
    reproducibleCommands: [
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalDepositReadWorkbench.test.ts --runInBand',
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/reading-pipeline-contract.test.ts --runInBand',
    ],
    guideExamples: [
      'Before settlement the reader sees measurements, provenance posture, proof roots, and non-source preview metadata.',
      'After settlement the reader receives the source-bearing AssetPack through the delivery path proven by receipts.',
    ],
    knownBlockers: [
      'Read Need not reviewed',
      'FindingFits result below threshold',
      'AssetPack source attempted before settlement',
      'ledger and database receipt roots disagree',
    ],
    rehearsalEvidence: [
      '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
      '.bitcode/v35-public-docs-usage-guides.json',
    ],
    validationCommands: ['pnpm run check:v35-gate4', 'pnpm run check:v35-gate7'],
  }),
  row({
    guideId: 'depositor_flow',
    audience: 'depositors',
    title: 'Depositor flow',
    purpose: 'Explain source deposit, measurement, eligibility, and rights posture without exposing protected deposited source.',
    laneIds: ['local', 'staging-testnet', 'public-testnet'],
    workflowStages: ['connect-provider', 'select-source', 'record-deposit', 'measure-deposit', 'await-fit-use'],
    sourceRoots: ['apps/uapi/components/README.md', 'packages/btd/src/deployment-readiness-rehearsal.ts'],
    reproducibleCommands: [
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/api/vcsRoutes.test.ts --runInBand',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalTransactionReadModel.test.ts --runInBand',
    ],
    guideExamples: [
      'Depositor guidance may explain repository anchoring, proof roots, rights posture, and payout receipts.',
      'Depositor guidance must not include protected source units or buyer-private Read context.',
    ],
    knownBlockers: [
      'provider connection not authorized',
      'deposit source material missing proof root',
      'issuer not eligible for settlement',
      'protected source visible in rollout docs',
    ],
    rehearsalEvidence: [
      '.bitcode/v34-deployment-host-capability-catalog.json',
      '.bitcode/v35-docs-qa-alignment-report.json',
    ],
    validationCommands: ['pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalTransactionReadModel.test.ts --runInBand'],
  }),
  row({
    guideId: 'interface_consumer_flow',
    audience: 'interface-consumers',
    title: 'Interface consumer flow',
    purpose: 'Expose API, MCP API, ChatGPT App, and public docs consumption paths as source-safe rollout material.',
    laneIds: ['local', 'staging-testnet', 'public-testnet'],
    workflowStages: ['route-contract-review', 'authorization-check', 'tool-contract-check', 'redaction-check', 'proof-root-readback'],
    sourceRoots: [
      'packages/api/README.md',
      'apps/mcp/README.md',
      'apps/chatgpt/README.md',
    ],
    reproducibleCommands: [
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/interface-authorization-policy.test.ts',
      'pnpm --dir apps/mcp run test:mcp -- --runTestsByPath src/__tests__/unit/mcp-tool-contract.test.ts --runInBand',
      'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/chatgpt-action-contract.test.ts --runInBand',
    ],
    guideExamples: [
      'Interface examples may include route names, action ids, authorization posture, and redacted payload shapes.',
      'Interface examples must not include secrets, source-bearing AssetPacks, or raw protected prompt material.',
    ],
    knownBlockers: [
      'missing authorization proof',
      'interface action lacks redaction posture',
      'route payload exposes protected source',
      'tool contract not bound to telemetry proof hook',
    ],
    rehearsalEvidence: [
      '.bitcode/v35-documentation-surface-catalog.json',
      '.bitcode/v35-telemetry-taxonomy-catalog.json',
    ],
    validationCommands: ['pnpm run check:v35-gate7'],
  }),
  row({
    guideId: 'environment_lane_posture',
    audience: 'release-operators',
    title: 'Environment lane posture',
    purpose: 'Keep local, staging-testnet, public testnet, mainnet-ready dry run, and blocked value-bearing mainnet explicitly distinct.',
    laneIds: ['local', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run', 'value-bearing-mainnet'],
    workflowStages: ['lane-identification', 'host-capability-check', 'secret-scope-check', 'wallet-policy-check', 'admission-decision'],
    sourceRoots: [
      'packages/btd/src/deployment-host-capability-catalog.ts',
      'packages/btd/src/secret-rotation-plan.ts',
      '.bitcode/v34-environment-lane-contracts.json',
    ],
    reproducibleCommands: [
      'pnpm run check:v34-deployment-host-capability-catalog',
      'pnpm run check:v34-gate5',
      'pnpm run check:v35-gate7',
    ],
    guideExamples: [
      'Public testnet and mainnet-ready dry run can prove posture without value-bearing source unlock.',
      'Value-bearing mainnet remains visible as blocked and has no admitted runtime hosts in V35.',
    ],
    knownBlockers: [
      'lane id omitted from rollout guide',
      'mainnet-ready dry run attempts value-bearing broadcast',
      'value-bearing mainnet unblocked before future canon',
      'secret scope not bound to lane',
    ],
    rehearsalEvidence: [
      '.bitcode/v34-environment-lane-contracts.json',
      '.bitcode/v34-secret-rotation-boundary-operations.json',
    ],
    validationCommands: ['pnpm run check:v34-gate2', 'pnpm run check:v35-gate7'],
  }),
  row({
    guideId: 'wallet_settlement_caveats',
    audience: 'settlement-operators',
    title: 'Wallet and settlement caveats',
    purpose: 'Make BTC fee, BTD rights transfer, finality, and source unlock boundaries explicit before testnet rollout.',
    laneIds: ['local', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run', 'value-bearing-mainnet'],
    workflowStages: ['fee-quote-review', 'wallet-policy-review', 'settlement-simulation', 'finality-watch', 'rights-transfer-readback'],
    sourceRoots: [
      'packages/btd/src/runtime-observer-repair-job.ts',
      'packages/btd/src/rollback-upgrade-repair-playbook.ts',
      '.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json',
    ],
    reproducibleCommands: [
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalWalletBtcOperation.test.ts --runInBand',
      'pnpm run check:v35-gate7',
    ],
    guideExamples: [
      'Local and staging-testnet settlement are rehearsals with proof roots and no value-bearing mainnet unlock.',
      'Rights transfer and source delivery are admitted only after settlement receipts and projection readback agree.',
    ],
    knownBlockers: [
      'fee quote lacks proof root',
      'wallet policy does not match lane',
      'finality observer lag unresolved',
      'source unlock attempted before paid rights transfer',
    ],
    rehearsalEvidence: [
      '.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json',
      '.bitcode/v34-rollback-upgrade-data-repair-playbooks.json',
    ],
    validationCommands: ['pnpm run check:v34-gate7', 'pnpm run check:v35-gate7'],
  }),
  row({
    guideId: 'known_blockers',
    audience: 'release-reviewers',
    title: 'Known blockers',
    purpose: 'Make rollout blockers auditable, source-safe, and fail-closed before public testnet or mainnet dry-run claims.',
    laneIds: ['staging-testnet', 'public-testnet', 'mainnet-ready-dry-run', 'value-bearing-mainnet'],
    workflowStages: ['blocker-inventory', 'docs-qa-check', 'runbook-check', 'rehearsal-check', 'promotion-decision'],
    sourceRoots: ['SPECIFICATIONS_ROADMAP.md', 'internal-docs/README.md', '.bitcode/v35-docs-qa-alignment-report.json'],
    reproducibleCommands: [
      'pnpm run check:v35-gate6',
      'pnpm run check:v35-gate7',
      'node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V34 --draft-target V35',
    ],
    guideExamples: [
      'Known blockers should name source-safe failure classes, repair references, validation commands, and blocked lanes.',
      'A blocker must not include provider credentials, wallet private material, protected source, or unpaid AssetPack source.',
    ],
    knownBlockers: [
      'stale generated artifact',
      'unsupported disclosure claim',
      'unrehearsed staging-testnet path',
      'mainnet value-bearing admission requested before future canon',
    ],
    rehearsalEvidence: [
      '.bitcode/v35-docs-qa-alignment-report.json',
      '.bitcode/v35-operator-runbook-catalog.json',
    ],
    validationCommands: ['pnpm run check:v35-gate6', 'pnpm run check:v35-gate7'],
  }),
  row({
    guideId: 'rehearsal_evidence',
    audience: 'promotion-reviewers',
    title: 'Rehearsal evidence',
    purpose: 'Bind rollout guides to reproducible local and staging-testnet rehearsal proof roots before Gate 9 rehearsal depth.',
    laneIds: ['local', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run', 'value-bearing-mainnet'],
    workflowStages: ['local-rehearsal-readback', 'staging-testnet-readback', 'public-testnet-posture-check', 'mainnet-dry-run-check', 'blocked-mainnet-proof'],
    sourceRoots: [
      '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
      '.bitcode/v34-promotion-readiness-report.json',
      'BITCODE_SPEC_V34_PROVEN.md',
    ],
    reproducibleCommands: [
      'pnpm run check:v34-gate9',
      'pnpm run check:v34-gate10',
      'pnpm run check:v35-gate7',
    ],
    guideExamples: [
      'Rollout readiness can cite local and staging-testnet proof roots now, while Gate 9 later rehearses V35 telemetry/docs visibility.',
      'Promotion reviewers should require blocked value-bearing mainnet evidence to remain visible until future canon changes admission.',
    ],
    knownBlockers: [
      'local rehearsal root missing',
      'staging-testnet rehearsal root missing',
      'public testnet posture unverified',
      'blocked value-bearing mainnet evidence missing',
    ],
    rehearsalEvidence: [
      '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
      '.bitcode/v34-promotion-readiness-report.json',
    ],
    validationCommands: ['pnpm run check:v34-gate9', 'pnpm run check:v35-gate7'],
  }),
]);

export const TESTNET_ROLLOUT_READINESS_ROWS = guideRows;

/**
 * @param {{
 *   guideId: string,
 *   audience: string,
 *   title: string,
 *   purpose: string,
 *   laneIds: readonly string[],
 *   workflowStages: readonly string[],
 *   sourceRoots: readonly string[],
 *   reproducibleCommands: readonly string[],
 *   guideExamples: readonly string[],
 *   knownBlockers: readonly string[],
 *   rehearsalEvidence: readonly string[],
 *   validationCommands: readonly string[],
 * }} input
 */
function row(input) {
  return {
    ...input,
    sourceRoots: [...SHARED_SOURCE_ROOTS, ...input.sourceRoots],
    allowedDisclosure: SHARED_ALLOWED_DISCLOSURE,
    forbiddenDisclosure: FORBIDDEN_ROLLOUT_DISCLOSURE,
    sourceSafetyClass: TESTNET_ROLLOUT_READINESS_SOURCE_SAFETY_VERDICT,
    valueBearingMainnetAdmission: input.laneIds.includes('value-bearing-mainnet')
      ? 'blocked_future_canon_required'
      : 'not_in_scope_for_guide_row',
    failClosedResult: `${input.guideId} rollout guidance blocks when lane, proof, disclosure, or rehearsal evidence is incomplete`,
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
export function buildTestnetRolloutReadinessGuide(input = {}) {
  const version = input.version || TESTNET_ROLLOUT_READINESS_GUIDE_VERSION;
  const currentTarget = input.currentTarget || TESTNET_ROLLOUT_READINESS_GUIDE_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = guideRows.map((sourceRow) => {
    const sourceEvidence = sourceRow.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...sourceRow,
      sourceEvidence,
      replayExpectation: {
        command: 'pnpm run check:v35-testnet-rollout-readiness-guide',
        failClosedOn: [
          'missing_guide_id',
          'missing_environment_lane',
          'missing_source_root',
          'missing_reproducible_command',
          'missing_rehearsal_evidence',
          'value_bearing_mainnet_unblocked',
          'source_unsafe_rollout_payload',
        ],
      },
    };

    return {
      ...rowWithoutRoot,
      guideRoot: `testnet-rollout-guide-row:${sha256(sourceRow.guideId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedGuideIds = rows.map((row) => row.guideId);
  const observedLaneIds = Array.from(new Set(rows.flatMap((row) => row.laneIds))).sort();
  const missingGuideIds = TESTNET_ROLLOUT_GUIDE_IDS.filter((guideId) => !observedGuideIds.includes(guideId));
  const missingLaneIds = TESTNET_ROLLOUT_LANE_IDS.filter((laneId) => !observedLaneIds.includes(laneId));
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.guideId}:${entry.sourceRoot}`),
  );
  const rowsMissingCommands = rows.filter((row) => row.reproducibleCommands.length === 0).map((row) => row.guideId);
  const rowsMissingExamples = rows.filter((row) => row.guideExamples.length === 0).map((row) => row.guideId);
  const rowsMissingBlockers = rows.filter((row) => row.knownBlockers.length === 0).map((row) => row.guideId);
  const rowsMissingRehearsalEvidence = rows.filter((row) => row.rehearsalEvidence.length === 0).map((row) => row.guideId);
  const rowsMissingValidation = rows.filter((row) => row.validationCommands.length === 0).map((row) => row.guideId);
  const rowsMissingForbiddenDisclosure = rows.filter((row) => row.forbiddenDisclosure.length === 0).map((row) => row.guideId);
  const valueBearingRows = rows.filter((row) => row.laneIds.includes('value-bearing-mainnet'));
  const valueBearingUnblockedRows = valueBearingRows
    .filter((row) => row.valueBearingMainnetAdmission !== 'blocked_future_canon_required')
    .map((row) => row.guideId);
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);

  const failures = [
    ...missingGuideIds.map((guideId) => `missing rollout guide ${guideId}`),
    ...missingLaneIds.map((laneId) => `missing rollout lane ${laneId}`),
    ...missingSourceRoots.map((sourceRoot) => `missing rollout source root ${sourceRoot}`),
    ...rowsMissingCommands.map((guideId) => `missing reproducible command for ${guideId}`),
    ...rowsMissingExamples.map((guideId) => `missing source-safe guide example for ${guideId}`),
    ...rowsMissingBlockers.map((guideId) => `missing known blockers for ${guideId}`),
    ...rowsMissingRehearsalEvidence.map((guideId) => `missing rehearsal evidence for ${guideId}`),
    ...rowsMissingValidation.map((guideId) => `missing validation commands for ${guideId}`),
    ...rowsMissingForbiddenDisclosure.map((guideId) => `missing forbidden disclosure boundary for ${guideId}`),
    ...valueBearingUnblockedRows.map((guideId) => `value-bearing mainnet is not blocked for ${guideId}`),
    ...(forbiddenMarkerDetected ? ['testnet rollout guide contains a secret-shaped marker'] : []),
  ];

  const coverage = {
    requiredGuideIds: [...TESTNET_ROLLOUT_GUIDE_IDS],
    observedGuideIds,
    missingGuideIds,
    requiredLaneIds: [...TESTNET_ROLLOUT_LANE_IDS],
    observedLaneIds,
    missingLaneIds,
    guideCount: rows.length,
    laneCount: observedLaneIds.length,
    allRequiredGuidesCovered: includesAll(observedGuideIds, TESTNET_ROLLOUT_GUIDE_IDS),
    allRequiredLanesCovered: includesAll(observedLaneIds, TESTNET_ROLLOUT_LANE_IDS),
    localDistinguished: observedLaneIds.includes('local'),
    stagingTestnetDistinguished: observedLaneIds.includes('staging-testnet'),
    publicTestnetDistinguished: observedLaneIds.includes('public-testnet'),
    mainnetReadyDryRunDistinguished: observedLaneIds.includes('mainnet-ready-dry-run'),
    valueBearingMainnetVisibleAndBlocked:
      observedLaneIds.includes('value-bearing-mainnet') && valueBearingRows.length > 0 && valueBearingUnblockedRows.length === 0,
    missingSourceRoots,
    rowsMissingCommands,
    rowsMissingExamples,
    rowsMissingBlockers,
    rowsMissingRehearsalEvidence,
    rowsMissingValidation,
    rowsMissingForbiddenDisclosure,
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
    sourceSafetyVerdict: TESTNET_ROLLOUT_READINESS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v35-testnet-rollout-readiness-guide',
    schemaId: TESTNET_ROLLOUT_READINESS_GUIDE_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: TESTNET_ROLLOUT_READINESS_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      allowedRolloutData: [...SHARED_ALLOWED_DISCLOSURE],
      forbiddenRolloutData: [...FORBIDDEN_ROLLOUT_DISCLOSURE],
      rolloutRule:
        'Rollout guides may expose lane ids, validation commands, redacted failure classes, and proof roots; they must not expose secrets, protected source, raw protected prompts, wallet private material, or unpaid AssetPack source.',
    },
    lanePosture: {
      local: 'developer_workstation_or_local_services_only',
      stagingTestnet: 'full_stack_non_value_testnet_rehearsal',
      publicTestnet: 'public_non_value_testnet_posture',
      mainnetReadyDryRun: 'mainnet_watch_only_dry_run_without_value_bearing_unlock',
      valueBearingMainnet: 'blocked_future_canon_required',
    },
    rows,
    coverage,
    sourceEvidence: rows.map((row) => ({
      guideId: row.guideId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `testnet-rollout-readiness-guide:${sha256(canonicalJson(artifactSeed)).slice(0, 24)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v35-gate7',
  };
}
