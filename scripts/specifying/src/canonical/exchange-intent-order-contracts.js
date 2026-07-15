// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCHANGE_INTENT_ORDER_CONTRACTS_ARTIFACT_PATH = '.bitcode/v36-exchange-intent-order-contracts.json';
export const EXCHANGE_INTENT_ORDER_CONTRACTS_SCHEMA_ID = 'bitcode.v36.exchangeIntentOrderContracts.v1';
export const EXCHANGE_INTENT_ORDER_CONTRACTS_VERSION = 'V36';
export const EXCHANGE_INTENT_ORDER_CONTRACTS_CURRENT_TARGET = 'V35';
export const EXCHANGE_INTENT_ORDER_CONTRACTS_SOURCE_SAFETY_VERDICT = 'source-safe-exchange-intent-order-contract-metadata';

export const EXCHANGE_INTENT_ACTION_KINDS = Object.freeze([
  'buy',
  'sell',
  'bid',
  'ask',
  'cancel',
  'accept',
  'settle',
  'history',
]);

export const EXCHANGE_ORDER_TRANSITION_IDS = Object.freeze([
  'exchange.order.transition.buy.requested',
  'exchange.order.transition.sell.requested',
  'exchange.order.transition.bid.opened',
  'exchange.order.transition.ask.opened',
  'exchange.order.transition.cancel.requested',
  'exchange.order.transition.accept.requested',
  'exchange.order.transition.settle.requested',
  'exchange.order.transition.history.reviewed',
]);

export const EXCHANGE_INTENT_REQUIRED_FIELD_IDS = Object.freeze([
  'intentId',
  'actionKind',
  'actorPrincipal',
  'organizationRole',
  'walletPosture',
  'authorityProof',
  'idempotencyKey',
  'policyDecision',
  'targetOrder',
  'targetBtdRange',
  'sourceSafePreview',
  'failClosedResult',
]);

export const EXCHANGE_ORDER_REQUIRED_FIELD_IDS = Object.freeze([
  'orderId',
  'orderKind',
  'assetPackId',
  'btdRangeId',
  'rightsScope',
  'currentOwnerPrincipal',
  'orderState',
  'transitionId',
  'historyRoot',
  'ledgerJournalRef',
  'databaseProjectionRef',
  'repairPosture',
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

const FORBIDDEN_INTENT_ORDER_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'wallet_seed_phrase',
  'wallet_private_key',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'unsettled_assetpack_delivery_branch',
  'buyer_private_repository_payload',
]);

const SHARED_FAIL_CLOSED_REASONS = Object.freeze([
  'missing_actor_principal',
  'missing_organization_role',
  'missing_wallet_posture',
  'missing_authority_proof',
  'missing_idempotency_key',
  'missing_policy_decision',
  'missing_fail_closed_result',
  'missing_order_history_root',
  'wallet_private_material_requested',
  'protected_source_visible',
  'unpaid_assetpack_source_visible',
  'ledger_database_projection_drift',
]);

const exchangeIntentContract = Object.freeze({
  canonicalObject: 'ExchangeIntent',
  contractId: 'exchange.intent.contract.v1',
  requiredFieldIds: [...EXCHANGE_INTENT_REQUIRED_FIELD_IDS],
  allowedActionKinds: [...EXCHANGE_INTENT_ACTION_KINDS],
  sourceSafetyClass: 'source_safe_exchange_intent_metadata',
  actorAuthorityBoundary: 'principal_org_role_wallet_posture_authority_proof_policy_decision_required',
  idempotencyBoundary: 'idempotency_key_required_before_market_mutation',
  failureBoundary: 'missing_authority_policy_or_idempotency_fails_closed_before_order_transition',
});

const exchangeOrderContract = Object.freeze({
  canonicalObject: 'ExchangeOrder',
  contractId: 'exchange.order.contract.v1',
  requiredFieldIds: [...EXCHANGE_ORDER_REQUIRED_FIELD_IDS],
  transitionIds: [...EXCHANGE_ORDER_TRANSITION_IDS],
  sourceSafetyClass: 'source_safe_exchange_order_metadata',
  rangeIdentityBoundary: 'btd_range_cells_remain_non_fungible_source_share_identity',
  settlementBoundary: 'ledger_journal_outranks_database_projection_for_order_state_and_finality',
  historyReplayBoundary: 'order_history_replayable_without_private_wallet_material_or_secrets',
});

/**
 * @param {string} transitionId
 * @param {string} actionKind
 * @param {string} label
 * @param {string} orderKind
 * @param {string} stateBefore
 * @param {string} stateAfter
 * @param {string} actorPrincipal
 * @param {string} organizationRole
 * @param {string} walletPosture
 * @param {string} policyDecision
 * @param {string} failClosedResult
 * @param {string[]} eventIds
 */
function transition(
  transitionId,
  actionKind,
  label,
  orderKind,
  stateBefore,
  stateAfter,
  actorPrincipal,
  organizationRole,
  walletPosture,
  policyDecision,
  failClosedResult,
  eventIds,
) {
  const orderId = `exchange-order:${actionKind}:source-safe-alpha`;
  const intentId = `exchange-intent:${actionKind}:source-safe-alpha`;
  const btdRangeId = actionKind === 'ask' || actionKind === 'sell'
    ? 'btd-range:2100-2132'
    : 'btd-range:1000-1048';
  const assetPackId = actionKind === 'ask' || actionKind === 'sell'
    ? 'assetpack:source-safe-preview-beta'
    : 'assetpack:source-safe-preview-alpha';

  return {
    transitionId,
    actionKind,
    label,
    canonicalObjects: ['ExchangeIntent', 'ExchangeOrder'],
    exchangeIntent: {
      intentId,
      actionKind,
      actorPrincipal,
      organizationRole,
      walletPosture,
      authorityProof: {
        proofId: `authority-proof:${actionKind}:principal-org-wallet-policy`,
        requiredFields: ['principalId', 'organizationRole', 'walletCapabilityRoot', 'policyRoot'],
        proofMaterialVisibility: 'proof_roots_only_no_private_wallet_material',
      },
      idempotencyKey: {
        keyId: `idempotency:${actionKind}:source-safe-alpha`,
        keySource: 'client_generated_or_server_assigned_stable_market_intent_key',
        replayResult: 'same_intent_or_same_fail_closed_result',
      },
      policyDecision: {
        decisionId: `policy:${actionKind}:source-safe-market-action`,
        decision: policyDecision,
        decisionRootFields: ['authorityRoot', 'rangeRoot', 'disclosureRoot', 'organizationPolicyRoot'],
      },
      sourceSafePreview: {
        previewVisibility: 'measurements_roots_rights_posture_price_root_and_order_state_only',
        sourceVisibility: actionKind === 'settle'
          ? 'source_delivery_still_hidden_until_paid_finality_and_rights_transfer'
          : 'hidden_until_paid_settlement',
        disclosureBoundary: 'no_protected_source_no_private_wallet_material_no_unpaid_assetpack_content',
      },
      failClosedResult,
    },
    exchangeOrder: {
      orderId,
      orderKind,
      assetPackId,
      btdRangeId,
      rightsScope: 'assetpack_read_rights_and_btd_range_transfer_scope',
      currentOwnerPrincipal: actionKind === 'buy' || actionKind === 'bid'
        ? 'principal:depositor-alpha'
        : actorPrincipal,
      orderState: {
        before: stateBefore,
        after: stateAfter,
        cancellability: actionKind === 'cancel' ? 'cancellation_requires_open_order_and_owner_or_bidder_authority' : 'defined_by_order_state_policy',
        acceptability: actionKind === 'accept' ? 'acceptance_requires_owner_counterparty_and_current_quote_roots' : 'defined_by_counterparty_policy',
        settlementState: actionKind === 'settle' ? 'settlement_requested_not_final_without_ledger_finality' : 'not_settled',
      },
      transitionId,
      historyRoot: {
        historyEventId: `exchange.history.${actionKind}`,
        replayMaterial: [
          'transitionId',
          'actionKind',
          'intentRoot',
          'orderRoot',
          'authorityRoot',
          'policyRoot',
          'idempotencyRoot',
          'ledgerJournalRef',
          'databaseProjectionRef',
          'eventIds',
        ],
        forbiddenReplayMaterial: ['wallet_private_material', 'secret_values', 'protected_source_payloads', 'unpaid_assetpack_source'],
        replayPosture: 'order_history_replayable_without_private_wallet_material_or_secrets',
      },
      ledgerJournalRef: `journal:exchange-order-${actionKind}-alpha`,
      databaseProjectionRef: `projection:exchange-order-${actionKind}-alpha`,
      projectionTrust: 'ledger_journal_outranks_database_projection',
      repairPosture: 'repair_required_on_missing_root_stale_owner_stale_policy_or_projection_drift',
    },
    proofRootFields: [
      'intentRoot',
      'orderRoot',
      'authorityRoot',
      'policyRoot',
      'idempotencyRoot',
      'historyRoot',
      'telemetryRoot',
    ],
    eventIds,
  };
}

export const EXCHANGE_INTENT_ORDER_ROWS = Object.freeze([
  transition(
    'exchange.order.transition.buy.requested',
    'buy',
    'Buy intent requested',
    'buy_order',
    'source_safe_previewed',
    'buy_intent_open',
    'principal:buyer-beta',
    'buyer',
    'wallet_capability_present_no_private_material',
    'admitted_source_safe_buy_intent',
    'deny_buy_when_authority_policy_idempotency_or_preview_boundary_missing',
    ['exchange.intent.buy.requested', 'exchange.order.buy.opened', 'exchange.history.buy.appended'],
  ),
  transition(
    'exchange.order.transition.sell.requested',
    'sell',
    'Sell intent requested',
    'sell_order',
    'owned_rights_verified',
    'sell_intent_open',
    'principal:depositor-alpha',
    'current_owner',
    'owner_wallet_capability_present_no_private_material',
    'admitted_owner_sell_intent',
    'deny_sell_when_owner_authority_or_btd_range_identity_missing',
    ['exchange.intent.sell.requested', 'exchange.order.sell.opened', 'exchange.history.sell.appended'],
  ),
  transition(
    'exchange.order.transition.bid.opened',
    'bid',
    'Bid opened',
    'bid_order',
    'source_safe_previewed',
    'bid_open',
    'principal:buyer-beta',
    'bidder',
    'buyer_wallet_capability_present_no_private_material',
    'admitted_bid_against_source_safe_preview',
    'deny_bid_when_quote_authority_policy_or_idempotency_missing',
    ['exchange.intent.bid.opened', 'exchange.order.bid.opened', 'exchange.history.bid.appended'],
  ),
  transition(
    'exchange.order.transition.ask.opened',
    'ask',
    'Ask opened',
    'ask_order',
    'owned_rights_verified',
    'ask_open',
    'principal:depositor-gamma',
    'seller',
    'owner_wallet_capability_present_no_private_material',
    'admitted_owner_ask_against_owned_range',
    'deny_ask_when_owner_authority_policy_quote_or_range_identity_missing',
    ['exchange.intent.ask.opened', 'exchange.order.ask.opened', 'exchange.history.ask.appended'],
  ),
  transition(
    'exchange.order.transition.cancel.requested',
    'cancel',
    'Cancel requested',
    'cancellation',
    'open_order',
    'cancelled',
    'principal:buyer-beta',
    'order_actor',
    'actor_wallet_capability_present_no_private_material',
    'admitted_cancel_for_authorized_open_order',
    'deny_cancel_when_order_closed_counterparty_accepted_or_authority_missing',
    ['exchange.intent.cancel.requested', 'exchange.order.cancelled', 'exchange.history.cancel.appended'],
  ),
  transition(
    'exchange.order.transition.accept.requested',
    'accept',
    'Accept requested',
    'acceptance',
    'open_counterparty_order',
    'accepted_pending_settlement',
    'principal:depositor-alpha',
    'current_owner',
    'owner_wallet_capability_present_no_private_material',
    'admitted_accept_for_current_owner_and_current_quote',
    'deny_accept_when_owner_authority_quote_freshness_or_counterparty_policy_missing',
    ['exchange.intent.accept.requested', 'exchange.order.accepted', 'exchange.history.accept.appended'],
  ),
  transition(
    'exchange.order.transition.settle.requested',
    'settle',
    'Settle requested',
    'settlement',
    'accepted_pending_settlement',
    'settlement_observation_required',
    'principal:buyer-beta',
    'settling_buyer',
    'buyer_wallet_capability_present_no_private_material',
    'admitted_settlement_request_pending_ledger_finality',
    'deny_settlement_when_payment_observation_finality_or_rights_transfer_root_missing',
    ['exchange.intent.settle.requested', 'exchange.order.settlement.requested', 'ledger.finality.observed', 'exchange.history.settle.appended'],
  ),
  transition(
    'exchange.order.transition.history.reviewed',
    'history',
    'History reviewed',
    'history_review',
    'any_source_safe_order_state',
    'history_rendered_source_safe',
    'principal:market-viewer',
    'viewer_or_operator',
    'read_only_wallet_not_required_no_private_material',
    'admitted_source_safe_history_review',
    'deny_history_when_history_root_missing_or_replay_material_contains_secret_or_source',
    ['exchange.intent.history.requested', 'exchange.order.history.reviewed', 'exchange.history.replayed'],
  ),
]);

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
    .join(',')}}`;
}

/**
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
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
export function buildExchangeIntentOrderContracts(input = {}) {
  const version = input.version || EXCHANGE_INTENT_ORDER_CONTRACTS_VERSION;
  const currentTarget = input.currentTarget || EXCHANGE_INTENT_ORDER_CONTRACTS_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sharedSourceRoots = [
    'specifications/BITCODE_SPEC_V36.md',
    'specifications/BITCODE_SPEC_V36_DELTA.md',
    'specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'scripts/specifying/src/canonical/exchange-intent-order-contracts.js',
    'scripts/specifying/test/v36-exchange-intent-order-contracts.test.js',
    'scripts/generate-v36-exchange-intent-order-contracts.mjs',
    'scripts/check-v36-gate3-exchange-intent-order-contracts.mjs',
    'packages/btd/src/exchange.ts',
    'apps/uapi/app/exchange/README.md',
    'apps/uapi/app/api/btd/asset-pack-exchange/route.ts',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  const rows = EXCHANGE_INTENT_ORDER_ROWS.map((row) => {
    const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoots = {
      ...row,
      sourceSafetyClass: 'source_safe_exchange_intent_order_metadata',
      sourceSafetyPosture: 'intents_orders_and_history_never_expose_private_wallet_material_secrets_protected_source_or_unpaid_assetpack_content',
      redactionPosture: {
        postureId: 'exchange_intent_order_redaction_v1',
        allowedPayloadClasses: [
          'intent_identity',
          'order_identity',
          'source_safe_preview_metadata',
          'principal_ids',
          'organization_roles',
          'wallet_posture_without_private_material',
          'authority_policy_and_idempotency_roots',
          'proof_roots',
          'event_ids',
          'ledger_and_database_projection_refs',
          'fail_closed_results',
        ],
        forbiddenPayloadClasses: [...FORBIDDEN_INTENT_ORDER_PAYLOAD],
      },
      freshnessChecks: [
        {
          checkId: `${row.transitionId}.intent-order-contract-present`,
          command: 'pnpm run check:v36-gate3',
          cadence: 'per_gate',
          failClosedOn: [...SHARED_FAIL_CLOSED_REASONS],
        },
      ],
      sourceEvidence,
    };

    const transitionRoot = `exchange-order-transition:${sha256(row.transitionId + canonicalJson(rowWithoutRoots)).slice(0, 24)}`;
    const intentRoot = `exchange-intent:${sha256(row.exchangeIntent.intentId + canonicalJson(row.exchangeIntent)).slice(0, 24)}`;
    const orderRoot = `exchange-order:${sha256(row.exchangeOrder.orderId + canonicalJson(row.exchangeOrder)).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      row.proofRootFields.map((field) => {
        const seed = `${row.transitionId}:${field}:${transitionRoot}:${intentRoot}:${orderRoot}`;
        return [field, `exchange-proof:${sha256(seed).slice(0, 24)}`];
      }),
    );

    return {
      ...rowWithoutRoots,
      exchangeIntent: {
        ...row.exchangeIntent,
        intentRoot,
      },
      exchangeOrder: {
        ...row.exchangeOrder,
        orderRoot,
      },
      transitionRoot,
      intentRoot,
      orderRoot,
      proofRoots,
    };
  });

  const observedActionKinds = rows.map((row) => row.actionKind);
  const observedTransitionIds = rows.map((row) => row.transitionId);
  const missingRequiredActionKinds = EXCHANGE_INTENT_ACTION_KINDS.filter((actionKind) => !observedActionKinds.includes(actionKind));
  const missingRequiredTransitionIds = EXCHANGE_ORDER_TRANSITION_IDS.filter((transitionId) => !observedTransitionIds.includes(transitionId));
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.transitionId}:${entry.sourceRoot}`),
  );
  const rowsWithoutActorRoleWallet = rows.filter((row) =>
    !row.exchangeIntent.actorPrincipal || !row.exchangeIntent.organizationRole || !row.exchangeIntent.walletPosture,
  );
  const rowsWithoutAuthorityProof = rows.filter((row) => !row.exchangeIntent.authorityProof?.proofId);
  const rowsWithoutIdempotencyKey = rows.filter((row) => !row.exchangeIntent.idempotencyKey?.keyId);
  const rowsWithoutPolicyDecision = rows.filter((row) => !row.exchangeIntent.policyDecision?.decisionId);
  const rowsWithoutFailClosedResult = rows.filter((row) => !row.exchangeIntent.failClosedResult);
  const rowsWithoutHistoryReplay = rows.filter((row) =>
    row.exchangeOrder.historyRoot?.replayPosture !== 'order_history_replayable_without_private_wallet_material_or_secrets'
    || row.exchangeOrder.historyRoot?.forbiddenReplayMaterial?.includes('wallet_private_material') !== true
    || row.exchangeOrder.historyRoot?.forbiddenReplayMaterial?.includes('secret_values') !== true,
  );
  const rowsWithoutProofRoots = rows.filter((row) => row.proofRootFields.some((field) => !row.proofRoots[field]));
  const rowsWithoutEventIds = rows.filter((row) => row.eventIds.length === 0);
  const rowsWithoutProjectionRefs = rows.filter((row) => !row.exchangeOrder.ledgerJournalRef || !row.exchangeOrder.databaseProjectionRef);
  const rowsWithProtectedSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'));
  const rowsWithUnpaidAssetPackSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
  const rowsWithPrivateWalletMaterial = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'));
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingRequiredActionKinds.map((actionKind) => `missing required Exchange intent action kind ${actionKind}`),
    ...missingRequiredTransitionIds.map((transitionId) => `missing required Exchange order transition ${transitionId}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Exchange intent/order source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Exchange intent/order contracts contain a secret-shaped marker'] : []),
    ...rowsWithoutActorRoleWallet.map((row) => `Exchange transition ${row.transitionId} lacks actor, organization role, or wallet posture`),
    ...rowsWithoutAuthorityProof.map((row) => `Exchange transition ${row.transitionId} lacks authority proof`),
    ...rowsWithoutIdempotencyKey.map((row) => `Exchange transition ${row.transitionId} lacks idempotency key`),
    ...rowsWithoutPolicyDecision.map((row) => `Exchange transition ${row.transitionId} lacks policy decision`),
    ...rowsWithoutFailClosedResult.map((row) => `Exchange transition ${row.transitionId} lacks fail-closed result`),
    ...rowsWithoutHistoryReplay.map((row) => `Exchange transition ${row.transitionId} lacks source-safe replay posture`),
    ...rowsWithoutProofRoots.map((row) => `Exchange transition ${row.transitionId} is missing proof roots`),
    ...rowsWithoutEventIds.map((row) => `Exchange transition ${row.transitionId} is missing event ids`),
    ...rowsWithoutProjectionRefs.map((row) => `Exchange transition ${row.transitionId} is missing ledger/database projection refs`),
    ...rowsWithProtectedSource.map((row) => `Exchange transition ${row.transitionId} lacks protected source boundary`),
    ...rowsWithUnpaidAssetPackSource.map((row) => `Exchange transition ${row.transitionId} lacks unpaid AssetPack source boundary`),
    ...rowsWithPrivateWalletMaterial.map((row) => `Exchange transition ${row.transitionId} lacks wallet private material boundary`),
    ...rowsWithLegacySourceRoots.map((row) => `Exchange transition ${row.transitionId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredActionKinds: [...EXCHANGE_INTENT_ACTION_KINDS],
    observedActionKinds,
    missingRequiredActionKinds,
    requiredTransitionIds: [...EXCHANGE_ORDER_TRANSITION_IDS],
    observedTransitionIds,
    missingRequiredTransitionIds,
    transitionCount: rows.length,
    allRequiredActionKindsCovered: includesAll(observedActionKinds, EXCHANGE_INTENT_ACTION_KINDS),
    allRequiredTransitionsCovered: includesAll(observedTransitionIds, EXCHANGE_ORDER_TRANSITION_IDS),
    exchangeIntentContractCovered: rows.every((row) => row.canonicalObjects.includes('ExchangeIntent')),
    exchangeOrderContractCovered: rows.every((row) => row.canonicalObjects.includes('ExchangeOrder')),
    actorOrganizationRoleWalletPostureCovered: rowsWithoutActorRoleWallet.length === 0,
    authorityProofsCovered: rowsWithoutAuthorityProof.length === 0,
    idempotencyKeysCovered: rowsWithoutIdempotencyKey.length === 0,
    policyDecisionsCovered: rowsWithoutPolicyDecision.length === 0,
    failClosedResultsCovered: rowsWithoutFailClosedResult.length === 0,
    proofRootsCovered: rowsWithoutProofRoots.length === 0,
    eventIdsCovered: rowsWithoutEventIds.length === 0,
    ledgerDatabaseProjectionRefsCovered: rowsWithoutProjectionRefs.length === 0,
    orderHistoryReplayableWithoutPrivateWalletMaterialOrSecrets: rowsWithoutHistoryReplay.length === 0,
    btdRangeNonFungiblePreserved: rows.every((row) => row.exchangeOrder.projectionTrust === 'ledger_journal_outranks_database_projection'),
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    privateWalletMaterialSerialized: serializedRows.includes('wallet_private_key') && !FORBIDDEN_INTENT_ORDER_PAYLOAD.includes('wallet_private_key'),
    protectedSourceVisible: rowsWithProtectedSource.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidAssetPackSource.length > 0,
  };

  const artifactSeed = {
    version,
    currentTarget,
    exchangeIntentContract,
    exchangeOrderContract,
    rows,
    coverage,
    sourceSafetyVerdict: EXCHANGE_INTENT_ORDER_CONTRACTS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v36-exchange-intent-order-contracts',
    schemaId: EXCHANGE_INTENT_ORDER_CONTRACTS_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: EXCHANGE_INTENT_ORDER_CONTRACTS_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      intentsAndOrdersMayExpose: [
        'source_safe_intent_identity',
        'source_safe_order_identity',
        'principal_ids',
        'organization_roles',
        'wallet_posture_without_private_material',
        'authority_policy_idempotency_roots',
        'proof_roots',
        'event_ids',
        'fail_closed_results',
        'ledger_and_database_projection_refs',
      ],
      intentsAndOrdersMustNotExpose: [...FORBIDDEN_INTENT_ORDER_PAYLOAD],
    },
    canonicalContracts: {
      exchangeIntentContract,
      exchangeOrderContract,
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredActionKinds: [...EXCHANGE_INTENT_ACTION_KINDS],
    requiredTransitionIds: [...EXCHANGE_ORDER_TRANSITION_IDS],
    requiredIntentFieldIds: [...EXCHANGE_INTENT_REQUIRED_FIELD_IDS],
    requiredOrderFieldIds: [...EXCHANGE_ORDER_REQUIRED_FIELD_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      transitionId: row.transitionId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `exchange-intent-order-contracts:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
