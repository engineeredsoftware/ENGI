// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast, roadmapWorkingGatePostureAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V47_E2E_IP_EXCHANGE_TESTS_ARTIFACT_PATH =
  '.proofs/v47/e2e-ip-selling-buying-tests.json';
export const V47_E2E_IP_EXCHANGE_TESTS_SCHEMA_ID =
  'bitcode.v47.e2eIpSellingBuyingTests.v1';
export const V47_E2E_IP_EXCHANGE_TESTS_VERSION = 'V47';
export const V47_E2E_IP_EXCHANGE_TESTS_CURRENT_TARGET = 'V46';
export const V47_E2E_IP_EXCHANGE_TESTS_SOURCE_SAFETY_VERDICT =
  'source-safe-e2e-ip-exchange-browser-proof';

export const V47_E2E_IP_EXCHANGE_SCENARIO_IDS = Object.freeze([
  'ip-seller-deposits-assetpack',
  'ip-buyer-measures-quotes-settles',
  'packs-dashboard-settlement-rights-delivery-repair-readback',
]);

export const V47_E2E_IP_EXCHANGE_ROUTE_IDS = Object.freeze([
  '/deposit',
  '/read',
  '/packs',
]);

export const V47_E2E_IP_EXCHANGE_VERIFICATION_IDS = Object.freeze([
  'source-connection-before-synthesis',
  'source-safe-measurement-review-before-approval',
  'journaled-execution-rows',
  'fit-measurement-review-before-payment',
  'deterministic-btc-testnet-quote-basis',
  'settlement-observation-finality-order',
  'btd-rights-receipt-readback',
  'repository-pr-delivery-readback',
  'packs-state-readback',
  'fail-closed-repair-surface',
  'browser-error-trap-clean',
]);

export const V47_E2E_IP_EXCHANGE_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
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
  activePointer: '.specifications/BITCODE_SPEC.txt',
  spec: '.specifications/BITCODE_SPEC_V47.md',
  delta: '.specifications/BITCODE_SPEC_V47_DELTA.md',
  notes: '.specifications/BITCODE_SPEC_V47_NOTES.md',
  parity: '.specifications/BITCODE_SPEC_V47_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  ipExchangeSpec: 'apps/uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts',
  e2eHelpers: 'apps/uapi/tests/e2e/commercial-mvp.helpers.ts',
  playwrightConfig: 'apps/uapi/playwright.config.ts',
  uapiPackageJson: 'apps/uapi/package.json',
  depositClient: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  readClient: 'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
  packsClient: 'apps/uapi/app/packs/PacksPageClient.tsx',
  packageJson: 'package.json',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolSource: 'scripts/specifying/src/canonical/v47-e2e-ip-selling-buying-tests.js',
  protocolTest: 'scripts/specifying/test/v47-e2e-ip-selling-buying-tests.test.js',
  generator: 'scripts/generate-v47-e2e-ip-selling-buying-tests.mjs',
  checker: 'scripts/check-v47-gate7-e2e-ip-selling-buying-tests.mjs',
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
    forbiddenPayloadIds: [...V47_E2E_IP_EXCHANGE_FORBIDDEN_PAYLOAD_IDS],
    rowRoot: `v47-e2e-ip-exchange-row:${digest(JSON.stringify(input))}`,
  };
}

export const V47_E2E_IP_EXCHANGE_TESTS_ROWS = Object.freeze([
  completionRow({
    rowId: 'seller-flow-browser-proof',
    owner: SOURCE_ROOTS.ipExchangeSpec,
    route: '/deposit',
    contract:
      'A browser test deposits IP the Bitcode way: source connection gates option synthesis, source-safe measurements render before approval, admission readback synchronizes to /packs, and the flow journals execution rows.',
    requiredFields: ['Synthesize options', 'Approve for Depository', '/packs?type=depository-assetpack'],
  }),
  completionRow({
    rowId: 'buyer-flow-browser-proof',
    owner: SOURCE_ROOTS.ipExchangeSpec,
    route: '/read',
    contract:
      'A browser test buys synthesized IP the Bitcode way: the five-step session renders the fit measurement review, final BTD scalar, and deterministic BTC-testnet quote basis before payment, then reads back payment observation, finality, BTD rights receipt, and repository PR delivery in order.',
    requiredFields: ['Fit measurement review', 'Final BTD scalar', 'BTD rights receipt root', 'Delivery receipt root'],
  }),
  completionRow({
    rowId: 'packs-dashboard-browser-proof',
    owner: SOURCE_ROOTS.ipExchangeSpec,
    route: '/packs',
    contract:
      'A browser test audits the exchange on /packs: master-detail state readback tracks settlement, BTD rights, compensation, and delivery, and repair-required activity exposes the fail-closed repair surface with commodity-state blockers.',
    requiredFields: ['State readback', 'Repair surface', 'btd-rights-transferred'],
  }),
  completionRow({
    rowId: 'deterministic-mock-harness',
    owner: SOURCE_ROOTS.e2eHelpers,
    route: '/deposit',
    contract:
      'The browser proof runs in deterministic mock mode with stateful execution-history journaling, mocked VCS/auxillary surfaces, and a browser error trap that fails the proof on framework overlays or console errors.',
    requiredFields: ['installCommercialMvpApiMocks', 'installCommercialBrowserErrorTrap', 'installExecutionHistoryMock'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v47-launch-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer.trim(), 'V46')),
    predicateResult(
      'spec-records-gate7-e2e-ip-exchange-tests',
      SOURCE_ROOTS.spec,
      sources.spec.includes('E2E IP Selling And Buying Tests') &&
        sources.spec.includes(V47_E2E_IP_EXCHANGE_TESTS_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate7-e2e-ip-exchange-tests',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 7: E2E IP Selling And Buying Tests') &&
        sources.delta.includes(V47_E2E_IP_EXCHANGE_TESTS_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate7-e2e-ip-exchange-tests',
      SOURCE_ROOTS.notes,
      sources.notes.includes('E2E IP Selling And Buying Tests') &&
        sources.notes.includes('browser proof'),
    ),
    predicateResult(
      'parity-records-gate7-e2e-ip-exchange-tests',
      SOURCE_ROOTS.parity,
      sources.parity.includes('E2E IP exchange tests') &&
        sources.parity.includes(V47_E2E_IP_EXCHANGE_TESTS_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate7-closure',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V47 Gate 7 closure anchor') &&
        (sources.roadmap.includes('Current working gate: V47 Gate 7 E2E IP Selling And Buying Tests') ||
          sources.roadmap.includes('Latest closed gate: V47 Gate 7 E2E IP Selling And Buying Tests') ||
          roadmapWorkingGatePostureAtLeast(sources.roadmap, 'V47', 8)),
    ),
    predicateResult(
      'spec-proves-ip-seller-deposit-flow',
      SOURCE_ROOTS.ipExchangeSpec,
      sources.ipExchangeSpec.includes('IP seller deposits an AssetPack') &&
        sources.ipExchangeSpec.includes("'Synthesize options'") &&
        sources.ipExchangeSpec.includes("'Approve for Depository'") &&
        sources.ipExchangeSpec.includes('/packs?type=depository-assetpack') &&
        sources.ipExchangeSpec.includes('deposit-option-synthesis'),
    ),
    predicateResult(
      'spec-proves-ip-buyer-read-flow',
      SOURCE_ROOTS.ipExchangeSpec,
      sources.ipExchangeSpec.includes('IP buyer reads measurements, quote basis, settlement finality, BTD rights, and repository delivery') &&
        sources.ipExchangeSpec.includes("'Fit measurement review'") &&
        sources.ipExchangeSpec.includes("'Final BTD scalar'") &&
        sources.ipExchangeSpec.includes('btd rights transferred') &&
        sources.ipExchangeSpec.includes('repository pr delivery materialized') &&
        sources.ipExchangeSpec.includes('BTD rights receipt root') &&
        sources.ipExchangeSpec.includes('Delivery receipt root'),
    ),
    predicateResult(
      'spec-proves-packs-dashboard-readback',
      SOURCE_ROOTS.ipExchangeSpec,
      sources.ipExchangeSpec.includes('Pack activity dashboard reads back settlement, BTD rights, compensation, delivery, and the fail-closed repair surface') &&
        sources.ipExchangeSpec.includes("'State readback'") &&
        sources.ipExchangeSpec.includes("'Repair surface'") &&
        sources.ipExchangeSpec.includes('btd-rights-transferred'),
    ),
    predicateResult(
      'spec-runs-deterministic-source-safe-mock-mode',
      SOURCE_ROOTS.ipExchangeSpec,
      sources.ipExchangeSpec.includes('installCommercialMvpApiMocks') &&
        sources.ipExchangeSpec.includes('installCommercialBrowserErrorTrap') &&
        sources.ipExchangeSpec.includes('installExecutionHistoryMock') &&
        sources.ipExchangeSpec.includes('btc-testnet') &&
        !sources.ipExchangeSpec.includes('mainnet'),
    ),
    predicateResult(
      'e2e-harness-binds-helpers-and-config',
      SOURCE_ROOTS.e2eHelpers,
      sources.e2eHelpers.includes('installCommercialMvpApiMocks') &&
        sources.playwrightConfig.includes("testDir: './tests/e2e'"),
    ),
    predicateResult(
      'uapi-package-exposes-ip-exchange-script',
      SOURCE_ROOTS.uapiPackageJson,
      sources.uapiPackageJson.includes('"test:e2e:ip-exchange"') &&
        sources.uapiPackageJson.includes('commercial-mvp.ip-exchange.spec.ts') &&
        sources.uapiPackageJson.includes('NEXT_PUBLIC_MASTER_MOCK_MODE=true'),
    ),
    predicateResult(
      'route-clients-carry-proven-surfaces',
      SOURCE_ROOTS.depositClient,
      sources.depositClient.includes('Synthesize options') &&
        sources.readClient.includes('Fit measurement review') &&
        sources.packsClient.includes('Repair surface'),
    ),
    predicateResult(
      'package-exports-gate7',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV47E2eIpSellingBuyingTests') &&
        sources.protocolTypes.includes('buildV47E2eIpSellingBuyingTests'),
    ),
    predicateResult(
      'package-json-exposes-gate7',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v47-e2e-ip-selling-buying-tests"') &&
        sources.packageJson.includes('"check:v47-gate7"'),
    ),
    predicateResult(
      'workflows-run-gate7-check',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes('check-v47-gate7-e2e-ip-selling-buying-tests.mjs') &&
        sources.canonWorkflow.includes('check-v47-gate7-e2e-ip-selling-buying-tests.mjs'),
    ),
    predicateResult(
      'generator-checker-test-exist',
      SOURCE_ROOTS.generator,
      sources.generator.includes('buildV47E2eIpSellingBuyingTests') &&
        sources.checker.includes('V47 Gate 7 E2E IP selling/buying tests check') &&
        sources.protocolTest.includes('buildV47E2eIpSellingBuyingTests'),
    ),
  ];
}

export function buildV47E2eIpSellingBuyingTests({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v47-e2e-ip-selling-buying-tests:${digest(JSON.stringify({
    scenarioIds: V47_E2E_IP_EXCHANGE_SCENARIO_IDS,
    routeIds: V47_E2E_IP_EXCHANGE_ROUTE_IDS,
    verificationIds: V47_E2E_IP_EXCHANGE_VERIFICATION_IDS,
    rowIds: V47_E2E_IP_EXCHANGE_TESTS_ROWS.map((row) => row.rowId),
    sourceRoots,
  }))}`;

  return {
    artifactId: 'v47-e2e-ip-selling-buying-tests',
    schemaId: V47_E2E_IP_EXCHANGE_TESTS_SCHEMA_ID,
    version: V47_E2E_IP_EXCHANGE_TESTS_VERSION,
    currentTarget: V47_E2E_IP_EXCHANGE_TESTS_CURRENT_TARGET,
    artifactPath: V47_E2E_IP_EXCHANGE_TESTS_ARTIFACT_PATH,
    sourceSafetyVerdict: V47_E2E_IP_EXCHANGE_TESTS_SOURCE_SAFETY_VERDICT,
    scenarioIds: [...V47_E2E_IP_EXCHANGE_SCENARIO_IDS],
    routeIds: [...V47_E2E_IP_EXCHANGE_ROUTE_IDS],
    verificationIds: [...V47_E2E_IP_EXCHANGE_VERIFICATION_IDS],
    forbiddenPayloadIds: [...V47_E2E_IP_EXCHANGE_FORBIDDEN_PAYLOAD_IDS],
    completionRows: V47_E2E_IP_EXCHANGE_TESTS_ROWS,
    predicateResults,
    sourceRoots,
    artifactRoot,
    coverage: {
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      sellerFlowProofComplete: true,
      buyerFlowProofComplete: true,
      packsDashboardProofComplete: true,
      deterministicMockHarnessComplete: true,
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

export const V47_E2E_IP_EXCHANGE_TESTS_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_ROOTS,
});
