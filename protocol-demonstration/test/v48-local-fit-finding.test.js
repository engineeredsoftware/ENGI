/**
 * Living V48 demonstration witness (complete modern-canon suite only).
 * Not a rewrite of frozen V28-era files — those remain under test/v28-* and test:v28-mvp-qa.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  acceptReadNeedLocally,
  createDepository,
  findNeedFitLocally,
  findReadFitLocally,
  synthesizeReadNeedLocally,
} from '../src/local-fit-finding.js';

const sourceBoundRead = {
  prompt: 'Read the deposited Terminal source and fit Deposit Read Fit AssetPack proof reconciliation evidence.',
  repositoryFullName: 'engineeredsoftware/ENGI',
  sourceBranch: 'main',
  sourceCommit: 'source-commit',
  targetArtifactKinds: ['repository-revision', 'asset-pack-evidence', 'proof-root'],
  closureCriteria: ['candidate is source-bound', 'proof and measurement are present'],
};

test('local Need synthesis must be accepted before Fit search', () => {
  const need = synthesizeReadNeedLocally({ read: sourceBoundRead });
  const blocked = findNeedFitLocally({ need });

  assert.equal(need.reviewState, 'needs_acceptance');
  assert.equal(need.sourceConstraints.protectedSourceDisclosure, 'forbidden_before_settlement');
  assert.equal(need.pricingMeasurementInputs.shareToFeeFormula.includes('measurement.weight'), true);
  assert.equal(blocked.resultState, 'blocked_readiness');
  assert.equal(blocked.assetPack, null);
});

test('local accepted Need-Fit synthesizes a minimal source-bound AssetPack preview', () => {
  const need = acceptReadNeedLocally(synthesizeReadNeedLocally({ read: sourceBoundRead }));
  const result = findNeedFitLocally({ need });

  assert.equal(result.resultState, 'worthy_fit');
  assert.equal(result.needId, need.needId);
  assert.equal(result.selectedCandidates[0].depositId, 'deposit-terminal-source');
  assert.equal(result.assetPack.selectedDepositIds[0], 'deposit-terminal-source');
  assert.match(result.assetPack.proofRoot, /^sha256:/u);
  assert.equal(result.assetPack.sourceSafePreview.status, 'preview_only');
  assert.equal(result.assetPack.sourceSafePreview.protectedSource, 'withheld_until_settlement');
  assert.equal(result.assetPack.sourceSafePreview.visibleEvidence.needId, need.needId);
  assert.equal(typeof result.assetPack.sourceSafePreview.visibleEvidence.shareToFeeQuote.sats, 'number');
  assert.match(result.assetPack.journalRoot, /^sha256:/u);
  assert.equal(result.assetPack.journal.length, 3);
  assert.equal(result.assetPack.ledgerPreview.serverCustody, false);
  assert.equal(result.assetPack.ledgerPreview.btcFee.payer, 'reader');
  assert.equal(typeof result.assetPack.ledgerPreview.btcFee.sats, 'number');
  assert.equal(result.assetPack.ledgerPreview.btcFee.finalityState, 'not_broadcast');
  assert.equal(result.embeddingPolicy.provider, 'local');
  assert.equal(result.embeddingPolicy.model, 'deterministic-token-hash');
  assert.match(result.queryRoot, /^sha256:/u);
  assert.match(result.rankingRoot, /^sha256:/u);
});

test('local fit finding returns no-worthy-fit for unrelated reads', () => {
  const need = acceptReadNeedLocally(synthesizeReadNeedLocally({
    read: {
      ...sourceBoundRead,
      prompt: 'Find a Solana wallet settlement AssetPack for a mobile exchange.',
      repositoryFullName: 'engineeredsoftware/mobile-wallet',
      targetArtifactKinds: ['wallet-settlement'],
      closureCriteria: ['Solana wallet evidence is present'],
    },
  }));
  const result = findNeedFitLocally({ need });

  assert.equal(result.resultState, 'no_worthy_fit');
  assert.equal(result.assetPack, null);
  assert.equal(result.selectedCandidates.length, 0);
});

test('local fit finding blocks when proof evidence is missing', () => {
  const deposits = createDepository().map((deposit) =>
    deposit.depositId === 'deposit-terminal-source'
      ? { ...deposit, hasWalletOrAttestationProof: false }
      : deposit
  );
  const result = findReadFitLocally({ read: sourceBoundRead, deposits });

  assert.equal(result.resultState, 'blocked_readiness');
  assert.equal(result.assetPack, null);
  assert.ok(result.resultReasons.includes('wallet_or_attestation_proof_missing'));
});
