// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast, roadmapWorkingGatePostureAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V47_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH =
  '.bitcode/v47-depositor-website-completion.json';
export const V47_DEPOSITOR_WEBSITE_COMPLETION_SCHEMA_ID =
  'bitcode.v47.depositorWebsiteCompletion.v1';
export const V47_DEPOSITOR_WEBSITE_COMPLETION_VERSION = 'V47';
export const V47_DEPOSITOR_WEBSITE_COMPLETION_CURRENT_TARGET = 'V46';
export const V47_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT =
  'source-safe-depositor-website-completion';

export const V47_DEPOSITOR_WEBSITE_STEP_IDS = Object.freeze([
  'connect-source',
  'synthesize-options',
  'review-options',
  'submit-deposit',
  'read-depository-state',
]);

export const V47_DEPOSITOR_WEBSITE_PIPELINE_IDS = Object.freeze([
  'DepositAssetPackOptionSynthesis',
  'DepositAssetPackOptionPolicy',
  'DepositAssetPackOptionAdmissionReport',
  'DepositorEarningSupplyIntelligence',
  'OrganizationPolicyWalletAuthority',
]);

export const V47_DEPOSITOR_WEBSITE_EVENT_IDS = Object.freeze([
  'pipeline:deposit-option-synthesis',
  'pipeline:deposit-option-review',
  'pipeline:deposit-option-admission',
]);

export const V47_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS = Object.freeze([
  'coverage-measurement',
  'specificity-measurement',
  'novelty-measurement',
  'reuse-measurement',
  'risk-measurement',
  'evidence-measurement',
  'criticality-state',
  'demand-state',
  'roi-state',
  'btd-potential-state',
  'btc-source-to-shares-preview',
  'admission-state',
  'packs-activity-sync-state',
  'authority-state',
]);

export const V47_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected_source_payload',
  'raw_source_text',
  'unpaid_assetpack_source',
  'raw_protected_prompt',
  'interpolated_prompt',
  'raw_provider_response',
  'wallet_private_material',
  'settlement_private_payload',
  'mainnet_value_bearing_payment_secret',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V47.md',
  delta: 'BITCODE_SPEC_V47_DELTA.md',
  notes: 'BITCODE_SPEC_V47_NOTES.md',
  parity: 'BITCODE_SPEC_V47_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  depositRouteModel: 'apps/uapi/components/deposits/models/deposit-route-model.ts',
  depositClient: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  depositPage: 'apps/uapi/app/deposit/page.tsx',
  depositRouteModelTest: 'apps/uapi/tests/depositRouteModel.test.ts',
  depositPageTest: 'apps/uapi/tests/depositPageClient.test.tsx',
  packActivityModel: 'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  optionModel: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-options.ts',
  policyModel: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-option-policy.ts',
  admissionModel: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-option-admission.ts',
  earningModel: 'packages/asset-packs-pipelines/domain/src/depositor-earning-supply-intelligence.ts',
  authorityModel: 'packages/asset-packs-pipelines/domain/src/organization-policy-wallet-authority.ts',
  packageJson: 'package.json',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolSource: 'scripts/specifying/src/canonical/v47-depositor-website-completion.js',
  protocolTest: 'scripts/specifying/test/v47-depositor-website-completion.test.js',
  generator: 'scripts/generate-v47-depositor-website-completion.mjs',
  checker: 'scripts/check-v47-gate4-depositor-website-completion.mjs',
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
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    interpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    valueBearingMainnetEnabled: false,
    forbiddenPayloadIds: [...V47_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS],
    rowRoot: `v47-depositor-website-completion-row:${digest(JSON.stringify(input))}`,
  };
}

export const V47_DEPOSITOR_WEBSITE_COMPLETION_ROWS = Object.freeze([
  completionRow({
    rowId: 'source-connection',
    owner: SOURCE_ROOTS.depositClient,
    route: '/deposit',
    contract:
      'Depositors connect a repository, branch, commit, and source scope through the route-owned source selector before option synthesis can be journaled.',
    requiredFields: ['TerminalRepositoryContextPanel', 'routePath={DEPOSIT_ROUTE}', 'disabled={!depositRouteSession.routeState.repositoryFullName}'],
  }),
  completionRow({
    rowId: 'option-synthesis-journal',
    owner: SOURCE_ROOTS.depositClient,
    route: '/deposit',
    contract:
      'The synthesize action records a source-safe execution row with route session, synthesis, policy, earning intelligence, authority, proof roots, and repository context.',
    requiredFields: ['pipeline:deposit-option-synthesis', 'depositOptionSynthesis', 'depositorEarningSupplyIntelligence'],
  }),
  completionRow({
    rowId: 'source-safe-measurement-review',
    owner: SOURCE_ROOTS.depositClient,
    route: '/deposit',
    contract:
      'Depositors review option measurements, criticality, demand, ROI, BTD potential, compensation preview, roots, and recommendations before approval.',
    requiredFields: ['option.measurements.map', 'BTD potential', 'BTC source-to-shares preview', 'Option roots'],
  }),
  completionRow({
    rowId: 'admission-and-repair-actions',
    owner: SOURCE_ROOTS.depositClient,
    route: '/deposit',
    contract:
      'Depositors approve, reject, or request resynthesis; approved policy-eligible options emit admission readback and synchronize to /packs.',
    requiredFields: ['Approve for Depository', 'Reject', 'Resynthesize', 'synchronized-to-packs'],
  }),
  completionRow({
    rowId: 'compensation-authority-readback',
    owner: SOURCE_ROOTS.depositClient,
    route: '/deposit',
    contract:
      'The route exposes future BTC compensation estimates, unfit Need opportunity roots, source-to-shares preview posture, and organization/wallet authority state.',
    requiredFields: ['Supply opportunity', 'Organization authority', 'Expected compensation', 'Authority root'],
  }),
  completionRow({
    rowId: 'packs-history-readback',
    owner: SOURCE_ROOTS.depositClient,
    route: '/packs',
    contract:
      'Recent Deposit activity and admitted Depository AssetPack rows remain reachable from /deposit through source-safe execution history and /packs activity.',
    requiredFields: ['Recent Deposit activity', '/packs?type=depository-assetpack', 'Open pack activity'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v47-launch-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer.trim(), 'V46')),
    predicateResult(
      'spec-records-gate4-depositor-website-completion',
      SOURCE_ROOTS.spec,
      sources.spec.includes('Depositor Website Completion') &&
        sources.spec.includes(V47_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate4-depositor-website-completion',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 4: Depositor Website Completion') &&
        sources.delta.includes(V47_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate4-depositor-website-completion',
      SOURCE_ROOTS.notes,
      sources.notes.includes('Depositor Website Completion') &&
        sources.notes.includes('pipeline:deposit-option-synthesis'),
    ),
    predicateResult(
      'parity-records-gate4-depositor-website-completion',
      SOURCE_ROOTS.parity,
      sources.parity.includes('Seller visualization') &&
        sources.parity.includes(V47_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate4-closure',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V47 Gate 4 closure anchor') &&
        (sources.roadmap.includes('Current working gate: V47 Gate 4 Depositor Website Completion') ||
          sources.roadmap.includes('Latest closed gate: V47 Gate 4 Depositor Website Completion') ||
          roadmapWorkingGatePostureAtLeast(sources.roadmap, 'V47', 5)),
    ),
    predicateResult(
      'deposit-route-model-binds-five-step-source-safe-session',
      SOURCE_ROOTS.depositRouteModel,
      V47_DEPOSITOR_WEBSITE_STEP_IDS.every((stepId) => sources.depositRouteModel.includes(stepId)) &&
        V47_DEPOSITOR_WEBSITE_PIPELINE_IDS.every((pipelineId) => sources.depositRouteModel.includes(pipelineId)) &&
        sources.depositRouteModel.includes('assertDepositRouteSessionSourceSafe'),
    ),
    predicateResult(
      'deposit-client-binds-source-connection-before-synthesis',
      SOURCE_ROOTS.depositClient,
      sources.depositClient.includes('DepositSourceSelection') &&
        sources.depositClient.includes('routePath={DEPOSIT_ROUTE}') &&
        sources.depositClient.includes('!depositRouteSession.routeState.repositoryFullName'),
    ),
    predicateResult(
      'deposit-client-records-option-synthesis-execution',
      SOURCE_ROOTS.depositClient,
      sources.depositClient.includes('handleSynthesizeOptions') &&
        sources.depositClient.includes('/api/deposit/synthesize-options') &&
        sources.depositClient.includes('depositOptionSynthesis') &&
        sources.depositClient.includes('DepositorEarningSupplyIntelligence') &&
        sources.depositRouteModel.includes('sourceSafetyClass'),
    ),
    predicateResult(
      'deposit-client-renders-source-safe-measurement-review',
      SOURCE_ROOTS.depositClient,
      sources.depositClient.includes('option.measurements.map') &&
        sources.depositClient.includes('BTD potential') &&
        sources.depositClient.includes('BTC source-to-shares preview') &&
        sources.depositClient.includes('Option roots'),
    ),
    predicateResult(
      'deposit-client-records-review-admission-actions',
      SOURCE_ROOTS.depositClient,
      sources.depositClient.includes('pipeline:deposit-option-review') &&
        sources.depositClient.includes('pipeline:deposit-option-admission') &&
        sources.depositClient.includes('Select for deposit') &&
        sources.depositClient.includes('Deposit selected AssetPacks') &&
        sources.depositClient.includes('Resynthesize'),
    ),
    predicateResult(
      'deposit-client-renders-compensation-authority-readback',
      SOURCE_ROOTS.depositClient,
      sources.depositClient.includes('Opportunity roots') &&
        sources.depositClient.includes('Organization authority') &&
        sources.depositClient.includes('Expected compensation') &&
        sources.depositClient.includes('Authority root'),
    ),
    predicateResult(
      'deposit-client-links-packs-history-readback',
      SOURCE_ROOTS.depositClient,
      sources.depositClient.includes('Recent Deposit activity') &&
        sources.depositClient.includes('/packs?type=depository-assetpack') &&
        sources.depositClient.includes('Open pack activity'),
    ),
    predicateResult(
      'deposit-page-test-covers-synthesis-journaling',
      SOURCE_ROOTS.depositPageTest,
      sources.depositPageTest.includes('requests real option synthesis') &&
        sources.depositPageTest.includes('/api/deposit/synthesize-options') &&
        sources.depositPageTest.includes('/api/executions/history/') &&
        sources.depositPageTest.includes('depositOptionSynthesis'),
    ),
    predicateResult(
      'deposit-route-model-test-covers-admission-compensation',
      SOURCE_ROOTS.depositRouteModelTest,
      sources.depositRouteModelTest.includes('admits approved policy-eligible deposit options') &&
        sources.depositRouteModelTest.includes('source-to-shares-largest-remainder'),
    ),
    predicateResult(
      'pipeline-models-bind-depositor-website-dependencies',
      SOURCE_ROOTS.optionModel,
      sources.optionModel.includes('DepositAssetPackOptionSynthesis') &&
        sources.policyModel.includes('DepositAssetPackOptionPolicyReport') &&
        sources.admissionModel.includes('DepositAssetPackOptionAdmissionReport') &&
        sources.earningModel.includes('DepositorEarningSupplyIntelligence') &&
        sources.authorityModel.includes('OrganizationPolicyWalletAuthority'),
    ),
    predicateResult(
      'pack-activity-model-supports-depository-assetpack-sync',
      SOURCE_ROOTS.packActivityModel,
      sources.packActivityModel.includes('depository-assetpack') &&
        sources.packActivityModel.includes('deposit-option-admission') &&
        sources.packActivityModel.includes('compensation'),
    ),
    predicateResult(
      'package-exports-gate4',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV47DepositorWebsiteCompletion') &&
        sources.protocolTypes.includes('buildV47DepositorWebsiteCompletion'),
    ),
    predicateResult(
      'package-json-exposes-gate4',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v47-depositor-website-completion"') &&
        sources.packageJson.includes('"check:v47-gate4"'),
    ),
    predicateResult(
      'workflows-run-gate4-check',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes('check-v47-gate4-depositor-website-completion.mjs') &&
        sources.canonWorkflow.includes('check-v47-gate4-depositor-website-completion.mjs'),
    ),
    predicateResult(
      'generator-checker-test-exist',
      SOURCE_ROOTS.generator,
      sources.generator.includes('buildV47DepositorWebsiteCompletion') &&
        sources.checker.includes('V47 Gate 4 depositor website completion check') &&
        sources.protocolTest.includes('buildV47DepositorWebsiteCompletion'),
    ),
  ];
}

export function buildV47DepositorWebsiteCompletion({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v47-depositor-website-completion:${digest(JSON.stringify({
    stepIds: V47_DEPOSITOR_WEBSITE_STEP_IDS,
    pipelineIds: V47_DEPOSITOR_WEBSITE_PIPELINE_IDS,
    eventIds: V47_DEPOSITOR_WEBSITE_EVENT_IDS,
    visibleDecisionIds: V47_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS,
    rowIds: V47_DEPOSITOR_WEBSITE_COMPLETION_ROWS.map((row) => row.rowId),
    sourceRoots,
  }))}`;

  return {
    artifactId: 'v47-depositor-website-completion',
    schemaId: V47_DEPOSITOR_WEBSITE_COMPLETION_SCHEMA_ID,
    version: V47_DEPOSITOR_WEBSITE_COMPLETION_VERSION,
    currentTarget: V47_DEPOSITOR_WEBSITE_COMPLETION_CURRENT_TARGET,
    artifactPath: V47_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH,
    sourceSafetyVerdict: V47_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT,
    stepIds: [...V47_DEPOSITOR_WEBSITE_STEP_IDS],
    pipelineIds: [...V47_DEPOSITOR_WEBSITE_PIPELINE_IDS],
    eventIds: [...V47_DEPOSITOR_WEBSITE_EVENT_IDS],
    visibleDecisionIds: [...V47_DEPOSITOR_WEBSITE_VISIBLE_DECISION_IDS],
    forbiddenPayloadIds: [...V47_DEPOSITOR_WEBSITE_FORBIDDEN_PAYLOAD_IDS],
    completionRows: V47_DEPOSITOR_WEBSITE_COMPLETION_ROWS,
    predicateResults,
    sourceRoots,
    artifactRoot,
    coverage: {
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      sourceConnectionComplete: true,
      optionSynthesisJournaled: true,
      sourceSafeMeasurementReviewComplete: true,
      admissionActionsComplete: true,
      compensationVisibilityComplete: true,
      authorityReadbackComplete: true,
      packsHistoryReadbackComplete: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
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

export const V47_DEPOSITOR_WEBSITE_COMPLETION_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_ROOTS,
});
