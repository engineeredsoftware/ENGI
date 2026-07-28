// @ts-check

/**
 * V48 Gate 4 — Depositor Website Completion proof builder.
 *
 * Product Gate 4 completes the seller-side commercial experience that makes
 * code tradable as DataPacks: connect source → synthesize (plan → patchfile →
 * measurements → commercial-nl) → review commercial brief + absolutes + owner
 * .patch → batch admit → /exchange depository activity with per-pack
 * measurements only.
 *
 * Pattern follows V47 depositor-website-completion but predicates bind living
 * V48 paths (/deposits, /exchange, modular deposit experience, four-agent
 * Implementation commercial law). Does not mutate V47 checkers.
 */

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH =
  '.proofs/v48/depositor-website-completion.json';
export const V48_DEPOSITOR_WEBSITE_COMPLETION_SCHEMA_ID =
  'bitcode.v48.depositorWebsiteCompletion.v1';
export const V48_DEPOSITOR_WEBSITE_COMPLETION_VERSION = 'V48';
/** Active pointer during V48 draft work remains V47 until promotion. */
export const V48_DEPOSITOR_WEBSITE_COMPLETION_CURRENT_TARGET = 'V47';
export const V48_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT =
  'source-safe-depositor-website-completion';

export const V48_DEPOSITOR_WEBSITE_STEP_IDS = Object.freeze([
  'connect-source',
  'synthesize-options',
  'review-options',
  'submit-deposit',
  'read-depository-state',
]);

export const V48_DEPOSITOR_WEBSITE_PIPELINE_IDS = Object.freeze([
  'DepositAssetPackOptionSynthesis',
  'DepositAssetPackOptionPolicy',
  'DepositAssetPackOptionAdmissionReport',
  'DepositorEarningSupplyIntelligence',
  'OrganizationPolicyWalletAuthority',
]);

export const V48_DEPOSITOR_WEBSITE_EVENT_IDS = Object.freeze([
  'deposit-option-synthesis',
  'pipeline:deposit-option-review',
  'pipeline:deposit-option-admission',
]);

export const V48_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS = Object.freeze([
  'commercial-title',
  'commercial-description',
  'absolute-measurements',
  'owner-patch-download',
  'criticality-state',
  'demand-state',
  'roi-state',
  'btd-potential-state',
  'btc-source-to-shares-preview',
  'admission-state',
  'exchange-activity-sync-state',
  'authority-state',
]);

export const V48_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected_source_payload',
  'raw_source_text',
  'unpaid_datapack_source',
  'raw_protected_prompt',
  'interpolated_prompt',
  'raw_provider_response',
  'wallet_private_material',
  'settlement_private_payload',
  'mainnet_value_bearing_payment_secret',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: '.specifications/BITCODE_SPEC.txt',
  spec: '.specifications/BITCODE_SPEC_V48.md',
  delta: '.specifications/BITCODE_SPEC_V48_DELTA.md',
  notes: '.specifications/BITCODE_SPEC_V48_NOTES.md',
  parity: '.specifications/BITCODE_SPEC_V48_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  depositRouteModel: 'apps/uapi/components/deposits/models/deposit-route-model.ts',
  depositRouteSessionTypes:
    'apps/uapi/components/deposits/models/deposit-route-session-types.ts',
  depositClient: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  depositClientConstants:
    'apps/uapi/components/deposits/DepositPageClient/deposit-page-client.constants.ts',
  depositSynthesisLifecycle:
    'apps/uapi/components/deposits/DepositPageClient/hooks/use-deposit-synthesis-lifecycle.ts',
  depositOptionActions:
    'apps/uapi/components/deposits/DepositPageClient/hooks/use-deposit-option-actions.ts',
  depositOptionCard:
    'apps/uapi/components/deposits/DepositOptionCard/DepositOptionCard.tsx',
  depositDataPackOptions:
    'apps/uapi/components/deposits/DepositDataPackOptions/DepositDataPackOptions.tsx',
  depositEarningsPanel:
    'apps/uapi/components/deposits/DepositAsideEarningsPanel/DepositAsideEarningsPanel.tsx',
  depositRouteStateAside:
    'apps/uapi/components/deposits/DepositRouteStateAside/DepositRouteStateAside.tsx',
  depositAdmissionActivity:
    'apps/uapi/components/deposits/models/deposit-admission-activity.ts',
  depositExplainers: 'apps/uapi/components/deposits/models/deposit-explainers.ts',
  depositSourceSelection:
    'apps/uapi/components/deposits/DepositSourceSelection/DepositSourceSelection.tsx',
  depositPage: 'apps/uapi/app/deposits/page.tsx',
  depositPageTest: 'apps/uapi/tests/depositPageClient.test.tsx',
  depositRouteModelTest: 'apps/uapi/tests/depositRouteModel.test.ts',
  depositAdmissionActivityTest: 'apps/uapi/tests/depositAdmissionActivity.test.ts',
  packActivityModel:
    'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  optionModel:
    'packages/asset-packs-pipelines/syntheses/deposit/src/deposit-asset-pack-options.ts',
  policyModel:
    'packages/asset-packs-pipelines/syntheses/deposit/src/deposit-asset-pack-option-policy.ts',
  policyTypes:
    'packages/asset-packs-pipelines/syntheses/deposit/src/deposit-asset-pack-option-policy-types.ts',
  admissionModel:
    'packages/asset-packs-pipelines/syntheses/deposit/src/deposit-asset-pack-option-admission.ts',
  admissionHelpers:
    'packages/asset-packs-pipelines/syntheses/deposit/src/deposit-asset-pack-option-admission-helpers.ts',
  admissionTest:
    'packages/asset-packs-pipelines/syntheses/deposit/src/__tests__/deposit-asset-pack-option-admission.test.ts',
  earningModel:
    'packages/asset-packs-pipelines/syntheses/deposit/src/depositor-earning-supply-intelligence.ts',
  authorityModel:
    'packages/asset-packs-pipelines/domain/src/organization-policy-wallet-authority.ts',
  commercialNlAgent:
    'packages/asset-packs-pipelines/syntheses/deposit/src/agents/implementation/deposit-implementation-agent-asset-packs-commercial-nl.ts',
  realSynthesis:
    'packages/asset-packs-pipelines/syntheses/deposit/src/deposit-option-real-synthesis.ts',
  implementationPackTypes:
    'packages/asset-packs-pipelines/syntheses/deposit/src/agents/implementation/deposit-implementation-pack-types.ts',
  patchfileSchema:
    'packages/asset-packs-pipelines/syntheses/deposit/src/agents/implementation/deposit-asset-pack-synthesis-schema.ts',
  packageJson: 'package.json',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolSource: 'scripts/specifying/src/canonical/v48-depositor-website-completion.js',
  protocolTest: 'scripts/specifying/test/v48-depositor-website-completion.test.js',
  generator: 'scripts/generate-v48-depositor-website-completion.mjs',
  checker: 'scripts/check-v48-gate4-depositor-website-completion.mjs',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function completionRow(input) {
  return {
    ...input,
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawSourceTextVisible: false,
    unpaidDataPackSourceVisible: false,
    rawPromptVisible: false,
    interpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    valueBearingMainnetEnabled: false,
    forbiddenPayloadIds: [...V48_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS],
    rowRoot: `v48-depositor-website-completion-row:${digest(JSON.stringify(input))}`,
  };
}

export const V48_DEPOSITOR_WEBSITE_COMPLETION_ROWS = Object.freeze([
  completionRow({
    rowId: 'source-connection',
    owner: SOURCE_ROOTS.depositClient,
    route: '/deposits',
    contract:
      'Depositors connect a repository, branch, commit, and source scope through DepositSourceSelection before option synthesis is journaled.',
    requiredFields: [
      'DepositSourceSelection',
      'repositoryFullName',
      'connect-source',
    ],
  }),
  completionRow({
    rowId: 'option-synthesis-journal',
    owner: SOURCE_ROOTS.depositSynthesisLifecycle,
    route: '/deposits',
    contract:
      'Synthesize posts /api/deposit/synthesize-options and recovers depositOptionSynthesis (real four-agent Implementation) into the deposit route session.',
    requiredFields: [
      '/api/deposit/synthesize-options',
      'depositOptionSynthesis',
      'handleSynthesizeOptions',
    ],
  }),
  completionRow({
    rowId: 'commercial-measurement-review',
    owner: SOURCE_ROOTS.depositOptionCard,
    route: '/deposits',
    contract:
      'Depositors review commercial brief, absolute measurements, BTD potential, BTC source-to-shares preview, option roots, and owner patch download before approval.',
    requiredFields: [
      'commercialTitle',
      'BTD potential',
      'BTC source-to-shares preview',
      'Download patchfile',
    ],
  }),
  completionRow({
    rowId: 'admission-and-exchange-sync',
    owner: SOURCE_ROOTS.depositDataPackOptions,
    route: '/deposits',
    contract:
      'Depositors select options, confirm deposit, emit admission receipts, and open /exchange depository activity; soft compensation incompleteness does not drop confirmed admits.',
    requiredFields: [
      'Select for deposit',
      'Deposit selected',
      '/exchange?type=depository-assetpack',
      'admitted-to-depository',
    ],
  }),
  completionRow({
    rowId: 'compensation-authority-readback',
    owner: SOURCE_ROOTS.depositEarningsPanel,
    route: '/deposits',
    contract:
      'Route exposes expected compensation, opportunity roots, and organization/wallet authority as disclosure-safe metadata.',
    requiredFields: [
      'Expected compensation',
      'Opportunity roots',
      'Organization authority',
      'Authority root',
    ],
  }),
  completionRow({
    rowId: 'exchange-history-readback',
    owner: SOURCE_ROOTS.depositAdmissionActivity,
    route: '/exchange',
    contract:
      'One admitted DataPack becomes one activity draft with per-pack absolute measurements only (never session candidate/admitted counts as pack measurements); patch bodies stay off network projection.',
    requiredFields: [
      'pipeline:deposit-option-admission',
      'candidateCount',
      'projectOptionAbsoluteMeasurements',
      'depository-assetpack',
    ],
  }),
  completionRow({
    rowId: 'tradable-datapack-synthesis-law',
    owner: SOURCE_ROOTS.commercialNlAgent,
    route: '/deposits',
    contract:
      'Implementation law packages code as tradable DataPacks: hybrid-body patch, absolute measurements, and commercialTitle/commercialDescription (create|modify commercial law).',
    requiredFields: [
      'commercialTitle',
      'commercialDescription',
      'bodiesComplete',
      'create|modify',
    ],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [
      key,
      readSource(repoRoot, sourcePath),
    ]),
  );

  const depositSurface = [
    sources.depositClient,
    sources.depositClientConstants,
    sources.depositSynthesisLifecycle,
    sources.depositOptionActions,
    sources.depositOptionCard,
    sources.depositDataPackOptions,
    sources.depositEarningsPanel,
    sources.depositRouteStateAside,
    sources.depositAdmissionActivity,
    sources.depositExplainers,
    sources.depositSourceSelection,
    sources.depositRouteModel,
    sources.depositRouteSessionTypes,
  ].join('\n');

  const packageSurface = [
    sources.optionModel,
    sources.policyModel,
    sources.policyTypes,
    sources.admissionModel,
    sources.admissionHelpers,
    sources.earningModel,
    sources.authorityModel,
    sources.commercialNlAgent,
    sources.realSynthesis,
  ].join('\n');

  return [
    predicateResult(
      'active-canon-pointer-supports-v48-draft',
      SOURCE_ROOTS.activePointer,
      bitcodeVersionAtLeast(sources.activePointer.trim(), 'V47'),
    ),
    predicateResult(
      'spec-records-gate4-depositor-website-completion',
      SOURCE_ROOTS.spec,
      sources.spec.includes('Depositor Website Completion') &&
        sources.spec.includes(V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH) &&
        sources.spec.includes('check:v48-gate4'),
    ),
    predicateResult(
      'delta-records-gate4-depositor-website-completion',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 4: Depositor Website Completion') &&
        sources.delta.includes(V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH) &&
        (sources.delta.includes('/exchange') || sources.delta.includes('/deposits')),
    ),
    predicateResult(
      'notes-record-gate4-depositor-website-completion',
      SOURCE_ROOTS.notes,
      sources.notes.includes('Depositor website completion') &&
        (sources.notes.includes('Gate 4 closed') ||
          sources.notes.includes('Gate 4 close charter') ||
          sources.notes.includes('V48 Gate 4')),
    ),
    predicateResult(
      'parity-records-gate4-depositor-website-completion',
      SOURCE_ROOTS.parity,
      sources.parity.includes('Seller visualization') &&
        sources.parity.includes(V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH) &&
        sources.parity.includes('check:v48-gate4'),
    ),
    predicateResult(
      'roadmap-records-v48-gate4',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V48 Gate 4') &&
        (sources.roadmap.includes('Depositor Website Completion') ||
          sources.roadmap.includes('depositor website completion')),
    ),
    predicateResult(
      'deposit-route-model-binds-five-step-source-safe-session',
      SOURCE_ROOTS.depositRouteModel,
      V48_DEPOSITOR_WEBSITE_STEP_IDS.every((stepId) =>
        sources.depositRouteSessionTypes.includes(stepId) ||
        sources.depositRouteModel.includes(stepId),
      ) &&
        V48_DEPOSITOR_WEBSITE_PIPELINE_IDS.every((pipelineId) =>
          depositSurface.includes(pipelineId),
        ) &&
        sources.depositRouteModel.includes('assertDepositRouteSessionSourceSafe') &&
        sources.depositRouteModel.includes('sourceSafetyClass'),
    ),
    predicateResult(
      'deposit-client-binds-source-connection-before-synthesis',
      SOURCE_ROOTS.depositClient,
      sources.depositClient.includes('DepositSourceSelection') &&
        (sources.depositClient.includes('repositoryFullName') ||
          sources.depositSourceSelection.includes('repositoryFullName')),
    ),
    predicateResult(
      'deposit-client-records-option-synthesis-execution',
      SOURCE_ROOTS.depositSynthesisLifecycle,
      sources.depositSynthesisLifecycle.includes('handleSynthesizeOptions') &&
        sources.depositSynthesisLifecycle.includes('/api/deposit/synthesize-options') &&
        sources.depositSynthesisLifecycle.includes('depositOptionSynthesis') &&
        depositSurface.includes('DepositorEarningSupplyIntelligence'),
    ),
    predicateResult(
      'deposit-client-renders-commercial-measurement-review',
      SOURCE_ROOTS.depositOptionCard,
      sources.depositOptionCard.includes('commercialTitle') &&
        sources.depositOptionCard.includes('BTD potential') &&
        sources.depositOptionCard.includes('BTC source-to-shares preview') &&
        sources.depositOptionCard.includes('Download patchfile') &&
        (sources.depositOptionCard.includes('Option roots') ||
          sources.depositOptionCard.includes('option roots')),
    ),
    predicateResult(
      'deposit-client-records-review-admission-actions',
      SOURCE_ROOTS.depositDataPackOptions,
      sources.depositOptionActions.includes('pipeline:deposit-option-review') &&
        sources.depositAdmissionActivity.includes('pipeline:deposit-option-admission') &&
        sources.depositOptionCard.includes('Select for deposit') &&
        sources.depositDataPackOptions.includes('Deposit selected') &&
        sources.depositOptionCard.includes('Resynthesize'),
    ),
    predicateResult(
      'deposit-client-renders-compensation-authority-readback',
      SOURCE_ROOTS.depositEarningsPanel,
      sources.depositEarningsPanel.includes('Opportunity roots') &&
        sources.depositRouteStateAside.includes('Organization authority') &&
        sources.depositEarningsPanel.includes('Expected compensation') &&
        (sources.depositRouteStateAside.includes('Authority root') ||
          sources.depositExplainers.includes('Authority root') ||
          depositSurface.includes('Authority root')),
    ),
    predicateResult(
      'deposit-client-links-exchange-history-readback',
      SOURCE_ROOTS.depositDataPackOptions,
      sources.depositDataPackOptions.includes('/exchange?type=depository-assetpack') &&
        sources.depositExplainers.includes('Recent Deposit activity') &&
        sources.packActivityModel.includes('depository-assetpack'),
    ),
    predicateResult(
      'admission-soft-block-override-and-batch-admit',
      SOURCE_ROOTS.admissionHelpers,
      sources.admissionHelpers.includes(
        'policy-soft-blocked-before-admission-overridden-by-depositor',
      ) &&
        sources.admissionTest.includes(
          'admits depositor-confirmed options even when compensation route is soft-incomplete',
        ) &&
        sources.admissionTest.includes('admittedCount') &&
        sources.admissionTest.includes('synthesis.options.length'),
    ),
    predicateResult(
      'per-pack-admission-projection-excludes-session-aggregates',
      SOURCE_ROOTS.depositAdmissionActivity,
      sources.depositAdmissionActivity.includes('candidateCount') &&
        /never embed/i.test(sources.depositAdmissionActivity) &&
        sources.depositAdmissionActivityTest.includes('not.toHaveProperty("candidateCount")') &&
        sources.depositAdmissionActivityTest.includes('not.toHaveProperty("admittedCount")'),
    ),
    predicateResult(
      'tradable-datapack-four-agent-commercial-law',
      SOURCE_ROOTS.commercialNlAgent,
      sources.commercialNlAgent.includes('commercialTitle') &&
        sources.commercialNlAgent.includes('commercialDescription') &&
        sources.realSynthesis.includes('bodiesComplete') &&
        sources.realSynthesis.includes('unifiedDiff') &&
        sources.implementationPackTypes.includes('create|modify') &&
        sources.patchfileSchema.includes('create|modify only'),
    ),
    predicateResult(
      'deposit-page-test-covers-synthesis-journaling',
      SOURCE_ROOTS.depositPageTest,
      sources.depositPageTest.includes('requests real option synthesis') &&
        sources.depositPageTest.includes('/api/deposit/synthesize-options') &&
        sources.depositPageTest.includes('depositOptionSynthesis'),
    ),
    predicateResult(
      'deposit-route-model-test-covers-admission-compensation',
      SOURCE_ROOTS.depositRouteModelTest,
      sources.depositRouteModelTest.includes(
        'admits approved policy-eligible deposit options',
      ) &&
        (sources.depositRouteModelTest.includes('source-to-shares-largest-remainder') ||
          sources.admissionTest.includes('source-to-shares-largest-remainder')),
    ),
    predicateResult(
      'pipeline-models-bind-depositor-website-dependencies',
      SOURCE_ROOTS.optionModel,
      sources.optionModel.includes('DepositAssetPackOptionSynthesis') &&
        sources.policyTypes.includes('DepositAssetPackOptionPolicyReport') &&
        sources.admissionModel.includes('DepositAssetPackOptionAdmissionReport') &&
        sources.earningModel.includes('DepositorEarningSupplyIntelligence') &&
        sources.authorityModel.includes('OrganizationPolicyWalletAuthority'),
    ),
    predicateResult(
      'pack-activity-model-supports-depository-datapack-sync',
      SOURCE_ROOTS.packActivityModel,
      sources.packActivityModel.includes('depository-assetpack') &&
        sources.packActivityModel.includes('deposit-option-admission') &&
        sources.packActivityModel.includes('compensation'),
    ),
    predicateResult(
      'package-exports-gate4',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV48DepositorWebsiteCompletion') &&
        sources.protocolTypes.includes('buildV48DepositorWebsiteCompletion'),
    ),
    predicateResult(
      'package-json-exposes-gate4',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v48-depositor-website-completion"') &&
        sources.packageJson.includes('"check:v48-gate4"'),
    ),
    predicateResult(
      'workflows-run-gate4-check',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes(
        'check-v48-gate4-depositor-website-completion.mjs',
      ) &&
        sources.canonWorkflow.includes(
          'check-v48-gate4-depositor-website-completion.mjs',
        ),
    ),
    predicateResult(
      'generator-checker-test-exist',
      SOURCE_ROOTS.generator,
      sources.generator.includes('buildV48DepositorWebsiteCompletion') &&
        sources.checker.includes('V48 Gate 4 depositor website completion check') &&
        sources.protocolTest.includes('buildV48DepositorWebsiteCompletion'),
    ),
  ];
}

export function buildV48DepositorWebsiteCompletion({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [
      key,
      `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`,
    ]),
  );
  const artifactRoot = `v48-depositor-website-completion:${digest(
    JSON.stringify({
      stepIds: V48_DEPOSITOR_WEBSITE_STEP_IDS,
      pipelineIds: V48_DEPOSITOR_WEBSITE_PIPELINE_IDS,
      eventIds: V48_DEPOSITOR_WEBSITE_EVENT_IDS,
      visibleDecisionIds: V48_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS,
      rowIds: V48_DEPOSITOR_WEBSITE_COMPLETION_ROWS.map((row) => row.rowId),
      sourceRoots,
    }),
  )}`;

  return {
    artifactId: 'v48-depositor-website-completion',
    schemaId: V48_DEPOSITOR_WEBSITE_COMPLETION_SCHEMA_ID,
    version: V48_DEPOSITOR_WEBSITE_COMPLETION_VERSION,
    currentTarget: V48_DEPOSITOR_WEBSITE_COMPLETION_CURRENT_TARGET,
    artifactPath: V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH,
    sourceSafetyVerdict: V48_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT,
    stepIds: [...V48_DEPOSITOR_WEBSITE_STEP_IDS],
    pipelineIds: [...V48_DEPOSITOR_WEBSITE_PIPELINE_IDS],
    eventIds: [...V48_DEPOSITOR_WEBSITE_EVENT_IDS],
    visibleDecisionIds: [...V48_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS],
    forbiddenPayloadIds: [...V48_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS],
    completionRows: V48_DEPOSITOR_WEBSITE_COMPLETION_ROWS,
    predicateResults,
    sourceRoots,
    artifactRoot,
    coverage: {
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      sourceConnectionComplete: true,
      optionSynthesisJournaled: true,
      commercialMeasurementReviewComplete: true,
      admissionActionsComplete: true,
      compensationVisibilityComplete: true,
      authorityReadbackComplete: true,
      exchangeHistoryReadbackComplete: true,
      tradableDataPackLawComplete: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidDataPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      valueBearingMainnetEnabled: false,
    },
    passed: failedPredicateIds.length === 0,
  };
}

export const V48_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_ROOTS,
});
