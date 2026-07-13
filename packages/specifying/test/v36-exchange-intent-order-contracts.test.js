import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  EXCHANGE_INTENT_ACTION_KINDS,
  EXCHANGE_INTENT_ORDER_CONTRACTS_ARTIFACT_PATH,
  EXCHANGE_INTENT_ORDER_ROWS,
  EXCHANGE_INTENT_REQUIRED_FIELD_IDS,
  EXCHANGE_ORDER_REQUIRED_FIELD_IDS,
  EXCHANGE_ORDER_TRANSITION_IDS,
  buildExchangeIntentOrderContracts,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V36 ExchangeIntent and ExchangeOrder transition contracts', () => {
  const contracts = buildExchangeIntentOrderContracts({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(contracts.artifactId, 'v36-exchange-intent-order-contracts');
  assert.equal(contracts.schemaId, 'bitcode.v36.exchangeIntentOrderContracts.v1');
  assert.equal(contracts.version, 'V36');
  assert.equal(contracts.currentTarget, 'V35');
  assert.equal(contracts.passed, true);
  assert.equal(contracts.sourceSafetyVerdict, 'source-safe-exchange-intent-order-contract-metadata');
  assert.equal(contracts.coverage.transitionCount, EXCHANGE_INTENT_ACTION_KINDS.length);
  assert.deepEqual(contracts.coverage.missingRequiredActionKinds, []);
  assert.deepEqual(contracts.coverage.missingRequiredTransitionIds, []);
  assert.equal(contracts.coverage.allRequiredActionKindsCovered, true);
  assert.equal(contracts.coverage.allRequiredTransitionsCovered, true);
  assert.equal(contracts.coverage.exchangeIntentContractCovered, true);
  assert.equal(contracts.coverage.exchangeOrderContractCovered, true);
  assert.equal(contracts.coverage.actorOrganizationRoleWalletPostureCovered, true);
  assert.equal(contracts.coverage.authorityProofsCovered, true);
  assert.equal(contracts.coverage.idempotencyKeysCovered, true);
  assert.equal(contracts.coverage.policyDecisionsCovered, true);
  assert.equal(contracts.coverage.failClosedResultsCovered, true);
  assert.equal(contracts.coverage.orderHistoryReplayableWithoutPrivateWalletMaterialOrSecrets, true);
  assert.equal(contracts.coverage.credentialsSerialized, false);
  assert.equal(contracts.coverage.privateWalletMaterialSerialized, false);
  assert.equal(contracts.coverage.protectedSourceVisible, false);
  assert.equal(contracts.coverage.unpaidAssetPackSourceVisible, false);
  assert.match(contracts.artifactRoot, /^exchange-intent-order-contracts:[a-f0-9]{24}$/u);

  assert.deepEqual(contracts.requiredActionKinds, EXCHANGE_INTENT_ACTION_KINDS);
  assert.deepEqual(contracts.requiredTransitionIds, EXCHANGE_ORDER_TRANSITION_IDS);
  assert.deepEqual(contracts.requiredIntentFieldIds, EXCHANGE_INTENT_REQUIRED_FIELD_IDS);
  assert.deepEqual(contracts.requiredOrderFieldIds, EXCHANGE_ORDER_REQUIRED_FIELD_IDS);
  assert.equal(contracts.canonicalContracts.exchangeIntentContract.canonicalObject, 'ExchangeIntent');
  assert.equal(contracts.canonicalContracts.exchangeOrderContract.canonicalObject, 'ExchangeOrder');
  assert.equal(
    contracts.canonicalContracts.exchangeOrderContract.historyReplayBoundary,
    'order_history_replayable_without_private_wallet_material_or_secrets',
  );

  for (const actionKind of EXCHANGE_INTENT_ACTION_KINDS) {
    assert.equal(contracts.rows.some((row) => row.actionKind === actionKind), true, `missing ${actionKind}`);
  }

  for (const row of contracts.rows) {
    assert.match(row.transitionRoot, /^exchange-order-transition:[a-f0-9]{24}$/u);
    assert.match(row.intentRoot, /^exchange-intent:[a-f0-9]{24}$/u);
    assert.match(row.orderRoot, /^exchange-order:[a-f0-9]{24}$/u);
    assert.equal(row.canonicalObjects.includes('ExchangeIntent'), true);
    assert.equal(row.canonicalObjects.includes('ExchangeOrder'), true);
    assert.equal(row.exchangeIntent.actorPrincipal.startsWith('principal:'), true);
    assert.equal(row.exchangeIntent.organizationRole.length > 0, true);
    assert.equal(row.exchangeIntent.walletPosture.includes('private_material'), true);
    assert.equal(row.exchangeIntent.authorityProof.proofMaterialVisibility, 'proof_roots_only_no_private_wallet_material');
    assert.equal(row.exchangeIntent.idempotencyKey.replayResult, 'same_intent_or_same_fail_closed_result');
    assert.equal(row.exchangeIntent.policyDecision.decisionRootFields.includes('organizationPolicyRoot'), true);
    assert.equal(row.exchangeIntent.failClosedResult.length > 0, true);
    assert.equal(row.exchangeOrder.historyRoot.replayPosture, 'order_history_replayable_without_private_wallet_material_or_secrets');
    assert.equal(row.exchangeOrder.historyRoot.forbiddenReplayMaterial.includes('wallet_private_material'), true);
    assert.equal(row.exchangeOrder.historyRoot.forbiddenReplayMaterial.includes('secret_values'), true);
    assert.equal(row.exchangeOrder.projectionTrust, 'ledger_journal_outranks_database_projection');
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'), true);
    assert.equal(row.eventIds.length > 0, true);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);

    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^exchange-proof:[a-f0-9]{24}$/u);
    }
  }

  assert.equal(EXCHANGE_INTENT_ORDER_ROWS.length, EXCHANGE_INTENT_ACTION_KINDS.length);
  assert.equal(EXCHANGE_INTENT_ORDER_CONTRACTS_ARTIFACT_PATH, '.bitcode/v36-exchange-intent-order-contracts.json');
});

test('keeps cancel, accept, settle, and history transitions replayable without secrets', () => {
  const contracts = buildExchangeIntentOrderContracts({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const cancel = contracts.rows.find((row) => row.actionKind === 'cancel');
  const accept = contracts.rows.find((row) => row.actionKind === 'accept');
  const settle = contracts.rows.find((row) => row.actionKind === 'settle');
  const history = contracts.rows.find((row) => row.actionKind === 'history');

  assert.ok(cancel);
  assert.equal(cancel.exchangeOrder.orderState.after, 'cancelled');
  assert.match(cancel.exchangeIntent.failClosedResult, /deny_cancel/u);

  assert.ok(accept);
  assert.equal(accept.exchangeOrder.orderState.after, 'accepted_pending_settlement');
  assert.equal(accept.exchangeOrder.orderState.acceptability.includes('owner'), true);

  assert.ok(settle);
  assert.equal(settle.exchangeOrder.orderState.settlementState, 'settlement_requested_not_final_without_ledger_finality');
  assert.equal(settle.eventIds.includes('ledger.finality.observed'), true);
  assert.match(settle.exchangeIntent.failClosedResult, /rights_transfer_root/u);

  assert.ok(history);
  assert.equal(history.exchangeIntent.walletPosture, 'read_only_wallet_not_required_no_private_material');
  assert.equal(history.exchangeOrder.historyRoot.replayMaterial.includes('ledgerJournalRef'), true);
  assert.equal(history.exchangeOrder.historyRoot.forbiddenReplayMaterial.includes('protected_source_payloads'), true);
  assert.equal(contracts.disclosureBoundary.intentsAndOrdersMustNotExpose.includes('wallet_private_material'), true);
  assert.equal(contracts.disclosureBoundary.intentsAndOrdersMustNotExpose.includes('secret_values'), true);
  assert.equal(contracts.sourceEvidence.every((entry) => entry.allSourceRootsPresent), true);
});
