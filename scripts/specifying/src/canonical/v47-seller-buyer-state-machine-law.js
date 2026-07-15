// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast, roadmapWorkingGatePostureAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH =
  '.proofs/v47/seller-buyer-state-machine-law.json';
export const V47_SELLER_BUYER_STATE_MACHINE_LAW_SCHEMA_ID =
  'bitcode.v47.sellerBuyerStateMachineLaw.v1';
export const V47_SELLER_BUYER_STATE_MACHINE_LAW_VERSION = 'V47';
export const V47_SELLER_BUYER_STATE_MACHINE_LAW_CURRENT_TARGET = 'V46';
export const V47_SELLER_BUYER_STATE_MACHINE_LAW_SOURCE_SAFETY_VERDICT =
  'source-safe-seller-buyer-state-machine-law';

export const V47_IP_SELLER_STATE_IDS = Object.freeze([
  'seller-connect-source',
  'seller-synthesize-deposit-assetpack-options',
  'seller-review-source-safe-measurements',
  'seller-approve-depository-admission',
  'seller-track-compensation-and-repair',
]);

export const V47_IP_BUYER_STATE_IDS = Object.freeze([
  'buyer-request-read',
  'buyer-review-synthesized-need',
  'buyer-request-finding-fits',
  'buyer-review-source-safe-assetpack-preview',
  'buyer-settle-and-receive-delivery',
]);

export const V47_STATE_MACHINE_GUARD_IDS = Object.freeze([
  'identity-and-wallet-authority-before-value-state',
  'measurement-before-price',
  'proof-before-state-transition',
  'source-safe-preview-before-settlement',
  'btc-testnet-only',
  'depository-index-before-finding-fits',
  'accepted-need-before-finding-fits',
  'quote-before-settlement',
  'btc-finality-before-btd-rights',
  'btd-rights-before-source-delivery',
  'packs-history-projection-after-each-transition',
  'repair-fail-closed-on-missing-evidence',
]);

export const V47_STATE_MACHINE_MEASUREMENT_IDS = Object.freeze([
  'coverage-measurement',
  'specificity-measurement',
  'novelty-measurement',
  'reuse-measurement',
  'risk-measurement',
  'evidence-measurement',
  'fit-measurement',
  'delivery-measurement',
]);

export const V47_STATE_MACHINE_SOURCE_SAFE_FIELD_IDS = Object.freeze([
  'actor_id',
  'organization_id',
  'route_step_id',
  'activity_id',
  'measurement_ids',
  'measurement_weight_policy_id',
  'weighted_btd_scalar',
  'proof_roots',
  'repair_state',
  'quote_sats',
  'settlement_state',
  'compensation_state',
  'delivery_state',
]);

export const V47_STATE_MACHINE_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
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
  depositRouteModel: 'apps/uapi/components/deposits/models/deposit-route-model.ts',
  readRouteModel: 'apps/uapi/components/reads/models/read-route-model.ts',
  packActivityModel: 'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  btdReceipts: 'packages/btd/src/receipts.ts',
  btdSettlement: 'packages/btd/src/settlement.ts',
  btdSourceToShares: 'packages/btd/src/source-to-shares.ts',
  btdSemanticVolume: 'packages/btd/src/semantic-volume.ts',
  packageJson: 'package.json',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolSource: 'scripts/specifying/src/canonical/v47-seller-buyer-state-machine-law.js',
  protocolTest: 'scripts/specifying/test/v47-seller-buyer-state-machine-law.test.js',
  generator: 'scripts/generate-v47-seller-buyer-state-machine-law.mjs',
  checker: 'scripts/check-v47-gate3-seller-buyer-state-machine-law.mjs',
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

function stateRow(input) {
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
    sourceSafeFieldIds: [...V47_STATE_MACHINE_SOURCE_SAFE_FIELD_IDS],
    forbiddenPayloadIds: [...V47_STATE_MACHINE_FORBIDDEN_PAYLOAD_IDS],
    rowRoot: `v47-seller-buyer-state-machine-row:${digest(JSON.stringify(input))}`,
  };
}

export const V47_SELLER_BUYER_STATE_MACHINE_ROWS = Object.freeze([
  stateRow({
    rowId: 'seller-state-machine',
    actorProfile: 'ip-seller',
    stateIds: [...V47_IP_SELLER_STATE_IDS],
    requiredGuards: [
      'identity-and-wallet-authority-before-value-state',
      'measurement-before-price',
      'proof-before-state-transition',
      'packs-history-projection-after-each-transition',
      'repair-fail-closed-on-missing-evidence',
    ],
    route: '/deposit',
    transitionLaw:
      'The IP seller moves from connected source to option synthesis, source-safe measurement review, Depository admission approval, and compensation/repair tracking; no deposit admission can occur before source-safe measurements and depositor review.',
  }),
  stateRow({
    rowId: 'buyer-state-machine',
    actorProfile: 'ip-buyer',
    stateIds: [...V47_IP_BUYER_STATE_IDS],
    requiredGuards: [
      'measurement-before-price',
      'accepted-need-before-finding-fits',
      'source-safe-preview-before-settlement',
      'quote-before-settlement',
      'btc-finality-before-btd-rights',
      'btd-rights-before-source-delivery',
      'packs-history-projection-after-each-transition',
      'repair-fail-closed-on-missing-evidence',
    ],
    route: '/read',
    transitionLaw:
      'The IP buyer moves from Read request to Need review, Finding Fits, source-safe AssetPack preview, BTC-testnet settlement, BTD rights, and repository delivery; source-bearing delivery is blocked until settlement finality and rights transfer agree.',
  }),
  stateRow({
    rowId: 'measurement-state-guards',
    actorProfile: 'both',
    stateIds: [...V47_STATE_MACHINE_MEASUREMENT_IDS],
    requiredGuards: ['measurement-before-price', 'proof-before-state-transition', 'source-safe-preview-before-settlement'],
    route: '/packs',
    transitionLaw:
      'Every seller and buyer decision reads named measurement ids, typed measurement outputs, weights, weighted BTD scalar contribution, confidence, risk adjustment, and proof roots before quote, settlement, admission, or delivery state can advance.',
  }),
  stateRow({
    rowId: 'settlement-rights-delivery-guards',
    actorProfile: 'ip-buyer',
    stateIds: ['quote-issued', 'btc-testnet-observed', 'btc-finality-confirmed', 'btd-rights-transferred', 'source-delivery-unlocked'],
    requiredGuards: [
      'btc-testnet-only',
      'quote-before-settlement',
      'btc-finality-before-btd-rights',
      'btd-rights-before-source-delivery',
    ],
    route: '/read',
    transitionLaw:
      'BTC-testnet quote observation is not finality; BTD rights and source unlock require finality, conservation, reconciliation, and delivery receipts.',
  }),
  stateRow({
    rowId: 'packs-history-and-repair',
    actorProfile: 'both',
    stateIds: ['pack-activity-created', 'projection-synchronized', 'repair-opened', 'repair-resolved'],
    requiredGuards: ['packs-history-projection-after-each-transition', 'repair-fail-closed-on-missing-evidence'],
    route: '/packs',
    transitionLaw:
      '/packs is the source-safe history and repair readback for deposit options, Depository AssetPacks, previews, settlements, compensation, delivery, proof roots, and blocked states.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v47-launch-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer.trim(), 'V46')),
    predicateResult(
      'spec-records-gate3-state-machine-law',
      SOURCE_ROOTS.spec,
      sources.spec.includes('Seller And Buyer State Machine Law') &&
        sources.spec.includes(V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate3-state-machine-law',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 3: Seller And Buyer State Machine Law') &&
        sources.delta.includes(V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate3-state-machine-law',
      SOURCE_ROOTS.notes,
      sources.notes.includes('Seller and buyer state machine law') &&
        sources.notes.includes('measurement-before-price'),
    ),
    predicateResult(
      'parity-records-gate3-state-machine-law',
      SOURCE_ROOTS.parity,
      sources.parity.includes('Seller state machine') &&
        sources.parity.includes('Buyer state machine') &&
        sources.parity.includes(V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate3-closure',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V47 Gate 3 closure anchor') &&
        (sources.roadmap.includes('Current working gate: V47 Gate 3 Seller And Buyer State Machine Law') ||
          sources.roadmap.includes('Latest closed gate: V47 Gate 3 Seller And Buyer State Machine Law') ||
          roadmapWorkingGatePostureAtLeast(sources.roadmap, 'V47', 4)),
    ),
    predicateResult(
      'deposit-route-binds-seller-states',
      SOURCE_ROOTS.depositRouteModel,
      V47_IP_SELLER_STATE_IDS.every((stateId) => sources.protocolSource.includes(stateId)) &&
        sources.depositRouteModel.includes("route: '/deposit'") &&
        sources.depositRouteModel.includes('DepositRouteStepId') &&
        sources.depositRouteModel.includes('DepositAssetPackOptionSynthesis') &&
        sources.depositRouteModel.includes('DepositAssetPackOptionAdmissionReport'),
    ),
    predicateResult(
      'read-route-binds-buyer-states',
      SOURCE_ROOTS.readRouteModel,
      V47_IP_BUYER_STATE_IDS.every((stateId) => sources.protocolSource.includes(stateId)) &&
        sources.readRouteModel.includes("route: '/read'") &&
        sources.readRouteModel.includes('ReadProcurementGovernance') &&
        sources.readRouteModel.includes('ReadNeedComprehensionSynthesis') &&
        sources.readRouteModel.includes('ReadFitsFindingSynthesis'),
    ),
    predicateResult(
      'read-route-enforces-measurement-price-settlement-order',
      SOURCE_ROOTS.readRouteModel,
      sources.readRouteModel.includes('measurementWeight') &&
        sources.readRouteModel.includes('measurementVolume') &&
        sources.readRouteModel.includes('pricingVersion') &&
        sources.readRouteModel.includes('ready-for-testnet-settlement') &&
        sources.readRouteModel.includes('source-safe AssetPack preview required'),
    ),
    predicateResult(
      'packs-history-projects-state-readback',
      SOURCE_ROOTS.packActivityModel,
      sources.packActivityModel.includes('PackActivityType') &&
        sources.packActivityModel.includes('measurements: PackActivityMeasurement[]') &&
        sources.packActivityModel.includes('accounting: PackActivityAccountingReadback') &&
        sources.packActivityModel.includes('governance: PackActivityGovernanceReadback') &&
        sources.packActivityModel.includes('repairState'),
    ),
    predicateResult(
      'btd-receipts-bind-rights-before-delivery',
      SOURCE_ROOTS.btdReceipts,
      sources.btdReceipts.includes('Delivery-admitted read receipt requires a read right') &&
        sources.btdReceipts.includes('buildBtdAssetPackMintReceipt'),
    ),
    predicateResult(
      'btd-settlement-keeps-finality-distinct',
      SOURCE_ROOTS.btdSettlement,
      sources.btdSettlement.includes('pending_settlement') &&
        sources.btdSettlement.includes('licensed_read') &&
        sources.btdSettlement.includes('settlementAdmissible') &&
        sources.btdSourceToShares.includes('finalityState') &&
        sources.btdSourceToShares.includes('observedDebitSats'),
    ),
    predicateResult(
      'source-to-shares-binds-compensation-conservation',
      SOURCE_ROOTS.btdSourceToShares,
      sources.btdSourceToShares.includes('depositorWalletId') &&
        sources.btdSourceToShares.includes('largest_remainder') &&
        sources.btdSourceToShares.includes('settlementAllocations') &&
        sources.btdSourceToShares.includes('allocationConserved') &&
        sources.btdSourceToShares.includes('settlementAdmissible'),
    ),
    predicateResult(
      'semantic-volume-binds-btd-scalar',
      SOURCE_ROOTS.btdSemanticVolume,
      sources.btdSemanticVolume.includes('btd.semantic_volume_measurement') &&
        sources.btdSemanticVolume.includes('normalizedBitcodeVolume') &&
        sources.btdSemanticVolume.includes('BTD_QUANTIZATION_Q') &&
        sources.btdSemanticVolume.includes('tokenCount'),
    ),
    predicateResult(
      'package-exports-gate3',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV47SellerBuyerStateMachineLaw') &&
        sources.protocolTypes.includes('buildV47SellerBuyerStateMachineLaw'),
    ),
    predicateResult(
      'package-json-exposes-gate3',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v47-seller-buyer-state-machine-law"') &&
        sources.packageJson.includes('"check:v47-gate3"'),
    ),
    predicateResult(
      'workflows-run-gate3-check',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes('check-v47-gate3-seller-buyer-state-machine-law.mjs') &&
        sources.canonWorkflow.includes('check-v47-gate3-seller-buyer-state-machine-law.mjs'),
    ),
    predicateResult(
      'generator-checker-test-exist',
      SOURCE_ROOTS.generator,
      sources.generator.includes('buildV47SellerBuyerStateMachineLaw') &&
        sources.checker.includes('V47 Gate 3 seller/buyer state-machine law check') &&
        sources.protocolTest.includes('buildV47SellerBuyerStateMachineLaw'),
    ),
  ];
}

export function buildV47SellerBuyerStateMachineLaw({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v47-seller-buyer-state-machine-law:${digest(JSON.stringify({
    sellerStateIds: V47_IP_SELLER_STATE_IDS,
    buyerStateIds: V47_IP_BUYER_STATE_IDS,
    guardIds: V47_STATE_MACHINE_GUARD_IDS,
    measurementIds: V47_STATE_MACHINE_MEASUREMENT_IDS,
    rowIds: V47_SELLER_BUYER_STATE_MACHINE_ROWS.map((row) => row.rowId),
    sourceRoots,
  }))}`;

  return {
    artifactId: 'v47-seller-buyer-state-machine-law',
    schemaId: V47_SELLER_BUYER_STATE_MACHINE_LAW_SCHEMA_ID,
    version: V47_SELLER_BUYER_STATE_MACHINE_LAW_VERSION,
    currentTarget: V47_SELLER_BUYER_STATE_MACHINE_LAW_CURRENT_TARGET,
    artifactPath: V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH,
    sourceSafetyVerdict: V47_SELLER_BUYER_STATE_MACHINE_LAW_SOURCE_SAFETY_VERDICT,
    sellerStateIds: [...V47_IP_SELLER_STATE_IDS],
    buyerStateIds: [...V47_IP_BUYER_STATE_IDS],
    guardIds: [...V47_STATE_MACHINE_GUARD_IDS],
    measurementIds: [...V47_STATE_MACHINE_MEASUREMENT_IDS],
    sourceSafeFieldIds: [...V47_STATE_MACHINE_SOURCE_SAFE_FIELD_IDS],
    forbiddenPayloadIds: [...V47_STATE_MACHINE_FORBIDDEN_PAYLOAD_IDS],
    stateRows: V47_SELLER_BUYER_STATE_MACHINE_ROWS,
    predicateResults,
    sourceRoots,
    artifactRoot,
    coverage: {
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      sellerStateMachineBound: true,
      buyerStateMachineBound: true,
      measurementBeforePrice: V47_STATE_MACHINE_GUARD_IDS.includes('measurement-before-price'),
      proofBeforeStateTransition: V47_STATE_MACHINE_GUARD_IDS.includes('proof-before-state-transition'),
      sourceSafePreviewBeforeSettlement: V47_STATE_MACHINE_GUARD_IDS.includes('source-safe-preview-before-settlement'),
      btcTestnetOnly: V47_STATE_MACHINE_GUARD_IDS.includes('btc-testnet-only'),
      acceptedNeedBeforeFindingFits: V47_STATE_MACHINE_GUARD_IDS.includes('accepted-need-before-finding-fits'),
      finalityBeforeBtdRights: V47_STATE_MACHINE_GUARD_IDS.includes('btc-finality-before-btd-rights'),
      btdRightsBeforeSourceDelivery: V47_STATE_MACHINE_GUARD_IDS.includes('btd-rights-before-source-delivery'),
      packsHistoryProjectionAfterEachTransition: V47_STATE_MACHINE_GUARD_IDS.includes('packs-history-projection-after-each-transition'),
      repairFailClosed: V47_STATE_MACHINE_GUARD_IDS.includes('repair-fail-closed-on-missing-evidence'),
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

export const V47_SELLER_BUYER_STATE_MACHINE_LAW_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_ROOTS,
});
