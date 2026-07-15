// @ts-check
// @ts-nocheck

import crypto from 'node:crypto';
import { PROFILE_A, PROFILE_B } from '../realization-profile.js';
import {
  BITCOIN_DEMONSTRATION_SERVICE_ID,
  BITCOIN_DEMONSTRATION_SERVICE_MODE,
  buildBitcoinDemonstrationPaymentCarrier,
  buildBitcoinDemonstrationAnchorPublication
} from './v23-bitcoin-demonstration-service.js';
import {
  buildArtifactBinding,
  buildReplayStep,
  buildTheoremVerdict,
  allTheoremsPassed as aggregateTheoremVerdicts,
  summarizeStrings
} from './proof-annotations.js';

export const BITCOIN_ROOT_DERIVATION_VERSION = 'v23.manifest-root.v1';
export const BITCOIN_PAYMENT_MODES = new Set([
  'audited-base-layer-purchase',
  'repeated-read-payment',
  'checkpointed-sidechain-bridge'
]);

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
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableHashObject(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function jsonDigest(value) {
  return stableHashObject(typeof value === 'string' ? JSON.parse(String(value)) : value);
}

/**
 * @param {string | null | undefined} paymentMode
 * @returns {string | undefined}
 */
export function normalizeBitcoinPaymentMode(paymentMode) {
  const normalized = String(paymentMode || '').trim().toLowerCase();
  if (!normalized) return undefined;
  if (!BITCOIN_PAYMENT_MODES.has(normalized)) {
    throw new Error(`Unsupported bitcoin payment mode: ${paymentMode}`);
  }
  return normalized;
}

/**
 * @param {string} paymentMode
 * @returns {string}
 */
function inferAnchorMode(paymentMode) {
  if (paymentMode === 'audited-base-layer-purchase') return 'taproot-commitment';
  if (paymentMode === 'repeated-read-payment') return 'batched-checkpoint';
  return 'batched-checkpoint';
}

/**
 * @param {string} paymentMode
 * @returns {string}
 */
function inferAnchorNetwork(paymentMode) {
  return paymentMode === 'checkpointed-sidechain-bridge'
    ? 'bitcoin-mainchain+sidechain-checkpoint'
    : 'bitcoin-mainchain';
}

/**
 * @param {string} paymentMode
 * @returns {{ networkState: string, publicationState: string, confirmationState: string, confirmations: number, journalBindingState: string }}
 */
function modeObservationState(paymentMode) {
  if (paymentMode === 'audited-base-layer-purchase') {
    return {
      networkState: 'confirmed-onchain',
      publicationState: 'published-confirmed',
      confirmationState: 'confirmed-by-mode',
      confirmations: 1,
      journalBindingState: 'finalizable'
    };
  }
  if (paymentMode === 'repeated-read-payment') {
    return {
      networkState: 'accepted-offchain',
      publicationState: 'publication-pending',
      confirmationState: 'confirmed-by-mode',
      confirmations: 0,
      journalBindingState: 'anchor-required'
    };
  }
  return {
    networkState: 'checkpointed-sidechain',
    publicationState: 'publication-pending',
    confirmationState: 'confirmed-by-mode',
    confirmations: 1,
    journalBindingState: 'anchor-required'
  };
}

/**
 * @param {{
 *   read: { readId: string },
 *   assetPack: { assetPackId: string },
 *   paymentMode: string,
 *   externalBoundaryManifest: { interfaces?: Array<{ interfaceId?: string }> | undefined },
 *   proofArtifactRefs: string[],
 *   settlementArtifactRefs: string[]
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildComputeRealityManifest({
  read,
  assetPack,
  paymentMode,
  externalBoundaryManifest,
  proofArtifactRefs,
  settlementArtifactRefs
}) {
  const externalBoundaryRefs = summarizeStrings((externalBoundaryManifest.interfaces || []).map((entry) => entry.interfaceId));
  return {
    realityId: `compute_reality_${sha256(`${read.readId}:${assetPack.assetPackId}:${paymentMode}`).slice(0, 12)}`,
    readId: read.readId,
    assetPackId: assetPack.assetPackId,
    paymentMode,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    executionMode: 'off-chain-deterministic-runtime',
    executorClass: 'bitcode-deterministic-local-prototype',
    determinismClass: 'replayable-modeled-local-determinism',
    serviceExecutionMode: BITCOIN_DEMONSTRATION_SERVICE_MODE,
    serviceId: BITCOIN_DEMONSTRATION_SERVICE_ID,
    replayBasis: {
      replayType: 'artifact-and-proof-replay',
      proofArtifactRefs: summarizeStrings(proofArtifactRefs),
      settlementArtifactRefs: summarizeStrings(settlementArtifactRefs)
    },
    proofArtifactRefs: summarizeStrings(proofArtifactRefs),
    externalBoundaryRefs,
    prototypeDemonstrationOnly: true
  };
}

/**
 * @param {{
 *   branchName: string,
 *   paymentMode: string,
 *   assetPackEvidenceManifest: { assetPackEvidence?: Array<{ path?: string, potentiallyDisclosable?: boolean }> | undefined },
 *   policyRelease: { retentionRules?: Array<Record<string, unknown>> | undefined, releaseId?: string | undefined }
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildStorageRealityManifest({ branchName, paymentMode, assetPackEvidenceManifest, policyRelease }) {
  const assetPackEvidence = assetPackEvidenceManifest.assetPackEvidence || [];
  const publicPaths = assetPackEvidence.filter((entry) => entry.potentiallyDisclosable).map((entry) => String(entry.path || ''));
  const privatePaths = assetPackEvidence.filter((entry) => !entry.potentiallyDisclosable).map((entry) => String(entry.path || ''));
  return {
    realityId: `storage_reality_${sha256(`${branchName}:${paymentMode}`).slice(0, 12)}`,
    branchName,
    paymentMode,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    storageMode: 'content-addressed-local-branch-artifacts',
    contentAddressingScheme: 'stable-hash-object.v1',
    anchorPublicationMode: BITCOIN_DEMONSTRATION_SERVICE_MODE,
    anchorPublicationServiceId: BITCOIN_DEMONSTRATION_SERVICE_ID,
    scopeStorageBindings: [
      {
        scopeId: 'bounded-public-root',
        storageClass: 'bounded-public-proof-surface',
        artifactPaths: summarizeStrings(publicPaths)
      },
      {
        scopeId: 'private-proof-and-settlement-root',
        storageClass: 'private-proof-surface',
        artifactPaths: summarizeStrings(privatePaths)
      }
    ],
    retrievalPolicy: {
      public: 'bounded-public-artifacts-only',
      reviewer: 'reviewer summaries only',
      buyer: 'buyer-scoped proof and settlement retrieval',
      internal: 'full content-addressed retrieval'
    },
    retentionPolicy: {
      releaseId: policyRelease.releaseId || null,
      rules: policyRelease.retentionRules || []
    },
    anchorBindingRefs: [
      '.bitcode/bitcoin-commitment-manifest.json',
      '.bitcode/bitcoin-anchor.json',
      '.bitcode/bitcoin-bounded-public-anchor.json'
    ],
    prototypeDemonstrationOnly: true
  };
}

/**
 * @param {{ paymentMode: string }} input
 * @returns {Record<string, unknown>}
 */
export function buildBitcoinTreasuryPolicy({ paymentMode }) {
  return {
    policyId: `btc_treasury_policy_${sha256(paymentMode).slice(0, 12)}`,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    selectedPaymentMode: paymentMode,
    paymentModes: ['audited-base-layer-purchase', 'repeated-read-payment', 'checkpointed-sidechain-bridge'],
    anchorModes: ['op-return-receipt', 'taproot-commitment', 'batched-checkpoint'],
    settlementDenomination: 'BTD',
    unitDenomination: 'BTD',
    confirmationPolicyByMode: {
      'audited-base-layer-purchase': {
        requiredNetworkState: 'confirmed-onchain',
        requiredConfirmationState: 'confirmed-by-mode',
        minimumConfirmations: 1,
        requiredJournalBindingState: 'finalizable'
      },
      'repeated-read-payment': {
        requiredNetworkState: 'accepted-offchain',
        requiredConfirmationState: 'confirmed-by-mode',
        minimumConfirmations: 0,
        requiredJournalBindingState: 'anchor-required'
      },
      'checkpointed-sidechain-bridge': {
        requiredNetworkState: 'checkpointed-sidechain',
        requiredConfirmationState: 'confirmed-by-mode',
        minimumConfirmations: 1,
        requiredJournalBindingState: 'anchor-required'
      }
    },
    journalFinalizationPolicy: {
      provisionalAccessState: 'observed-unfinalized',
      finalizableState: 'finalizable',
      finalizedState: 'finalized',
      invalidatedState: 'binding-invalidated',
      anchorRequiredStates: ['repeated-read-payment', 'checkpointed-sidechain-bridge']
    },
    signerPolicy: {
      signerClass: paymentMode === 'audited-base-layer-purchase' ? 'taproot-reviewed-treasury' : 'batched-checkpoint-coordinator',
      policySurface: BITCOIN_DEMONSTRATION_SERVICE_MODE,
      liveThresholdImplemented: false
    },
    demonstrationServiceMode: BITCOIN_DEMONSTRATION_SERVICE_MODE,
    sidechainBridgePolicy: {
      enabled: paymentMode === 'checkpointed-sidechain-bridge',
      checkpointAnchorRequired: paymentMode === 'checkpointed-sidechain-bridge',
      generalizedTransferabilityImplemented: false
    }
  };
}

/**
 * @param {{
 *   buyer: { buyerId: string },
 *   read: { readId: string },
 *   assetPack: { assetPackId: string },
 *   settlementPreview: { bundleId: string, meteredMicroUnits?: string | undefined },
 *   sourceToSharesArtifact: { proofHash?: string | undefined },
 *   treasuryPolicy: { policyId: string },
 *   paymentMode: string
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildBitcoinSettlementIntent({
  buyer,
  read,
  assetPack,
  settlementPreview,
  sourceToSharesArtifact,
  treasuryPolicy,
  paymentMode
}) {
  const intentId = `btc_intent_${sha256(`${buyer.buyerId}:${settlementPreview.bundleId}:${paymentMode}`).slice(0, 12)}`;
  const paymentCarrier = buildBitcoinDemonstrationPaymentCarrier({
    intentId,
    buyerId: buyer.buyerId,
    readId: read.readId,
    assetPackId: assetPack.assetPackId,
    bundleId: settlementPreview.bundleId,
    paymentMode,
    unitDenomination: 'BTD',
    meteredMicroUnits: settlementPreview.meteredMicroUnits
  });
  return {
    intentId,
    buyerId: buyer.buyerId,
    readId: read.readId,
    assetPackId: assetPack.assetPackId,
    bundleId: settlementPreview.bundleId,
    unitDenomination: 'BTD',
    meteredMicroUnits: settlementPreview.meteredMicroUnits,
    paymentMode,
    settlementPreviewRef: settlementPreview.bundleId,
    sourceToSharesRef: sourceToSharesArtifact.proofHash || null,
    treasuryPolicyRef: treasuryPolicy.policyId,
    serviceMode: paymentCarrier.serviceMode,
    serviceId: paymentCarrier.serviceId,
    requestId: paymentCarrier.requestId,
    carrierType: paymentCarrier.carrierType,
    transportNetwork: paymentCarrier.network,
    requestPreview: paymentCarrier.requestPreview,
    paymentCarrier: paymentCarrier.carrier,
    prototypeDemonstrationOnly: true
  };
}

/**
 * @param {{
 *   settlementIntent: { intentId: string, paymentMode: string, meteredMicroUnits?: string | undefined, unitDenomination?: string | undefined },
 *   treasuryPolicy: { policyId: string },
 *   settlementPreview: { bundleId: string },
 *   branchName: string
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildBitcoinSettlementObservation({
  settlementIntent,
  treasuryPolicy,
  settlementPreview,
  branchName
}) {
  const state = modeObservationState(settlementIntent.paymentMode);
  const paymentCarrier = buildBitcoinDemonstrationPaymentCarrier({
    intentId: settlementIntent.intentId,
    buyerId: settlementIntent.buyerId || 'buyer-observed',
    readId: settlementIntent.readId || 'read-observed',
    assetPackId: settlementIntent.assetPackId || 'asset-pack-observed',
    bundleId: settlementPreview.bundleId,
    paymentMode: settlementIntent.paymentMode,
    unitDenomination: settlementIntent.unitDenomination || 'BTD',
    meteredMicroUnits: settlementIntent.meteredMicroUnits
  });
  return {
    observationId: `btc_obs_${sha256(`${settlementIntent.intentId}:${branchName}`).slice(0, 12)}`,
    intentId: settlementIntent.intentId,
    bundleId: settlementPreview.bundleId,
    paymentMode: settlementIntent.paymentMode,
    unitDenomination: settlementIntent.unitDenomination || 'BTD',
    serviceMode: paymentCarrier.serviceMode,
    serviceId: paymentCarrier.serviceId,
    receiptId: paymentCarrier.receiptId,
    carrierType: paymentCarrier.carrierType,
    transportNetwork: paymentCarrier.network,
    networkState: state.networkState,
    confirmationState: state.confirmationState,
    networkRef: paymentCarrier.receipt.referenceId,
    confirmations: state.confirmations,
    observedValue: settlementIntent.meteredMicroUnits,
    journalBindingState: state.journalBindingState,
    treasuryPolicyRef: treasuryPolicy.policyId,
    serviceReceipt: paymentCarrier.receipt,
    observationReality: BITCOIN_DEMONSTRATION_SERVICE_MODE,
    prototypeDemonstrationOnly: true
  };
}

/**
 * @param {{
 *   artifactMetadataByPath: Record<string, {
 *     path: string,
 *     digest: string,
 *     confidentialityClass: string,
 *     potentiallyDisclosable: boolean,
 *     proofFamilies: string[]
 *   }>,
 *   proofContractRef: string,
 *   systemProofBundleRef: string,
 *   proofWitnessRef: string
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildBitcoinCommitmentManifest({
  artifactMetadataByPath,
  proofContractRef,
  systemProofBundleRef,
  proofWitnessRef
}) {
  const publicEntries = Object.values(artifactMetadataByPath)
    .filter((entry) => entry.potentiallyDisclosable)
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((entry) => ({
      path: entry.path,
      digest: entry.digest,
      confidentialityClass: entry.confidentialityClass,
      potentiallyDisclosable: entry.potentiallyDisclosable,
      proofFamilies: summarizeStrings(entry.proofFamilies)
    }));
  const privateEntries = Object.values(artifactMetadataByPath)
    .filter((entry) => !entry.potentiallyDisclosable)
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((entry) => ({
      path: entry.path,
      digest: entry.digest,
      confidentialityClass: entry.confidentialityClass,
      potentiallyDisclosable: entry.potentiallyDisclosable,
      proofFamilies: summarizeStrings(entry.proofFamilies)
    }));

  const publicPayload = {
    scopeId: 'bounded-public-root',
    derivationVersion: BITCOIN_ROOT_DERIVATION_VERSION,
    entries: publicEntries
  };
  const privatePayload = {
    scopeId: 'private-proof-and-settlement-root',
    derivationVersion: BITCOIN_ROOT_DERIVATION_VERSION,
    entries: privateEntries
  };

  return {
    manifestVersion: BITCOIN_ROOT_DERIVATION_VERSION,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    publicRoot: stableHashObject(publicPayload),
    privateRoot: stableHashObject(privatePayload),
    scopeEntries: {
      public: publicEntries,
      private: privateEntries
    },
    artifactDigests: [...publicEntries, ...privateEntries],
    derivationPolicy: {
      version: BITCOIN_ROOT_DERIVATION_VERSION,
      publicScopeId: publicPayload.scopeId,
      privateScopeId: privatePayload.scopeId,
      entryShape: ['path', 'digest', 'confidentialityClass', 'potentiallyDisclosable', 'proofFamilies']
    },
    proofContractRef,
    systemProofBundleRef,
    proofWitnessRef
  };
}

/**
 * @param {{
 *   commitmentManifest: { publicRoot: string, privateRoot: string },
 *   treasuryPolicy: { policyId: string },
 *   settlementIntent: { intentId: string, paymentMode: string },
 *   settlementObservation: { confirmationState: string, observationId: string },
 *   branchName: string
 * }} input
 * @returns {{ bitcoinAnchor: Record<string, unknown>, bitcoinBoundedPublicAnchor: Record<string, unknown> }}
 */
export function buildBitcoinAnchorArtifacts({
  commitmentManifest,
  treasuryPolicy,
  settlementIntent,
  settlementObservation,
  branchName
}) {
  const state = modeObservationState(settlementIntent.paymentMode);
  const anchorId = `btc_anchor_${sha256(`${branchName}:${settlementIntent.intentId}:${commitmentManifest.publicRoot}`).slice(0, 12)}`;
  const publication = buildBitcoinDemonstrationAnchorPublication({
    intentId: settlementIntent.intentId,
    paymentMode: settlementIntent.paymentMode,
    branchName,
    publicationState: state.publicationState,
    publicRoot: commitmentManifest.publicRoot,
    privateRoot: commitmentManifest.privateRoot
  });
  const anchorRef = publication.anchorRef;
  const bitcoinAnchor = {
    anchorId,
    network: inferAnchorNetwork(settlementIntent.paymentMode),
    anchorMode: inferAnchorMode(settlementIntent.paymentMode),
    publicRoot: commitmentManifest.publicRoot,
    privateRootRef: commitmentManifest.privateRoot,
    publicationState: state.publicationState,
    anchorRef,
    confirmationState: settlementObservation.confirmationState,
    disclosurePrincipal: 'buyer',
    policyRef: treasuryPolicy.policyId,
    intentId: settlementIntent.intentId,
    serviceMode: publication.serviceMode,
    serviceId: publication.serviceId,
    publicationRequestId: publication.requestId,
    publicationReceiptId: publication.receiptId,
    publicationEnvelope: publication.publicationEnvelope,
    publicationReceipt: publication.receipt,
    publicationReality: BITCOIN_DEMONSTRATION_SERVICE_MODE,
    prototypeDemonstrationOnly: true
  };
  const bitcoinBoundedPublicAnchor = {
    anchorId,
    network: bitcoinAnchor.network,
    anchorMode: bitcoinAnchor.anchorMode,
    publicRoot: bitcoinAnchor.publicRoot,
    anchorRef,
    confirmationState: settlementObservation.confirmationState,
    publicationState: state.publicationState,
    serviceMode: publication.serviceMode,
    publicationReceiptId: publication.receiptId,
    publishedAt: publication.receipt.publishedAt,
    publicationReality: BITCOIN_DEMONSTRATION_SERVICE_MODE,
    prototypeDemonstrationOnly: true
  };
  return { bitcoinAnchor, bitcoinBoundedPublicAnchor };
}

/**
 * @param {{
 *   commitmentManifest: any,
 *   storageRealityManifest: any,
 *   treasuryPolicy: any,
 *   bitcoinAnchor: any,
 *   bitcoinBoundedPublicAnchor: any,
 *   projectionPolicy: { publicArtifactPaths?: string[] | undefined },
 *   boundedPublicProof: any,
 *   disclosureProof: { publicDisclosureOnlyUsesBoundedMetadata?: boolean | undefined },
 *   proofContract: { contractId: string }
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildBitcoinAuditAnchorProof({
  commitmentManifest,
  storageRealityManifest,
  treasuryPolicy,
  bitcoinAnchor,
  bitcoinBoundedPublicAnchor,
  projectionPolicy,
  boundedPublicProof,
  disclosureProof,
  proofContract
}) {
  const witnessArtifactPaths = [
    '.bitcode/storage-reality-manifest.json',
    '.bitcode/bitcoin-commitment-manifest.json',
    '.bitcode/bitcoin-treasury-policy.json',
    '.bitcode/bitcoin-anchor.json',
    '.bitcode/bitcoin-bounded-public-anchor.json',
    '.bitcode/projection-policy.json',
    '.bitcode/bounded-public-proof.json',
    '.bitcode/disclosure-proof.json',
    '.bitcode/proof-contract.json',
    '.bitcode/system-proof-bundle.json',
    '.bitcode/proof-witness-manifest.json'
  ];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'bitcoin-audit-anchor.commitment-scope-derivation',
      theoremIds: ['bitcoin_audit_anchor.public_scope_is_disclosable_only', 'bitcoin_audit_anchor.private_scope_binds_proof_contract'],
      requiredArtifactPaths: ['.bitcode/bitcoin-commitment-manifest.json', '.bitcode/proof-contract.json'],
      instruction: 'Replay public and private commitment scope derivation from the declared artifact inventory.'
    }),
    buildReplayStep({
      stepId: 'bitcoin-audit-anchor.public-scope-disclosure-check',
      theoremIds: ['bitcoin_audit_anchor.storage_reality_binds_declared_scope'],
      requiredArtifactPaths: ['.bitcode/storage-reality-manifest.json', '.bitcode/projection-policy.json', '.bitcode/bounded-public-proof.json', '.bitcode/disclosure-proof.json'],
      instruction: 'Replay disclosability and storage binding checks for every declared commitment-scope artifact.'
    }),
    buildReplayStep({
      stepId: 'bitcoin-audit-anchor.anchor-receipt-binding',
      theoremIds: ['bitcoin_audit_anchor.anchor_receipt_matches_declared_root', 'bitcoin_audit_anchor.bounded_public_anchor_matches_full_anchor'],
      requiredArtifactPaths: ['.bitcode/bitcoin-anchor.json', '.bitcode/bitcoin-bounded-public-anchor.json', '.bitcode/bitcoin-treasury-policy.json'],
      instruction: 'Replay anchor receipt and bounded public receipt binding against the declared roots and treasury policy.'
    })
  ];

  const publicScopeDisclosable = (commitmentManifest.scopeEntries?.public || []).every(
    (entry) => entry.potentiallyDisclosable === true && entry.confidentialityClass === 'bounded-public-proof-metadata'
  ) && disclosureProof.publicDisclosureOnlyUsesBoundedMetadata === true;
  const privateScopeBindsProofContract = commitmentManifest.proofContractRef === proofContract.contractId
    && (commitmentManifest.scopeEntries?.private || []).some((entry) => entry.path === '.bitcode/settlement-proof.json')
    && (commitmentManifest.scopeEntries?.private || []).some((entry) => entry.path === '.bitcode/source-to-shares.json');
  const storageScopePaths = new Set((storageRealityManifest.scopeStorageBindings || []).flatMap((entry) => entry.artifactPaths || []));
  const storageRealityClosed = [...(commitmentManifest.scopeEntries?.public || []), ...(commitmentManifest.scopeEntries?.private || [])]
    .every((entry) => storageScopePaths.has(entry.path));
  const anchorReceiptMatchesRoot = bitcoinAnchor.publicRoot === commitmentManifest.publicRoot
    && bitcoinAnchor.privateRootRef === commitmentManifest.privateRoot
    && bitcoinAnchor.policyRef === treasuryPolicy.policyId;
  const boundedPublicAnchorMatches = bitcoinBoundedPublicAnchor.anchorId === bitcoinAnchor.anchorId
    && bitcoinBoundedPublicAnchor.publicRoot === bitcoinAnchor.publicRoot
    && bitcoinBoundedPublicAnchor.anchorRef === bitcoinAnchor.anchorRef;

  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'bitcoin_audit_anchor.public_scope_is_disclosable_only',
      passed: publicScopeDisclosable,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-audit-anchor.commitment-scope-derivation'],
      failureReasons: publicScopeDisclosable ? [] : ['public scope includes non-disclosable or non-bounded-public artifacts']
    }),
    buildTheoremVerdict({
      theoremId: 'bitcoin_audit_anchor.private_scope_binds_proof_contract',
      passed: privateScopeBindsProofContract,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-audit-anchor.commitment-scope-derivation'],
      failureReasons: privateScopeBindsProofContract ? [] : ['private commitment scope does not bind proof-contract and settlement closure refs']
    }),
    buildTheoremVerdict({
      theoremId: 'bitcoin_audit_anchor.storage_reality_binds_declared_scope',
      passed: storageRealityClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-audit-anchor.public-scope-disclosure-check'],
      failureReasons: storageRealityClosed ? [] : ['declared storage reality does not cover every commitment-scope artifact']
    }),
    buildTheoremVerdict({
      theoremId: 'bitcoin_audit_anchor.anchor_receipt_matches_declared_root',
      passed: anchorReceiptMatchesRoot,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-audit-anchor.anchor-receipt-binding'],
      failureReasons: anchorReceiptMatchesRoot ? [] : ['anchor receipt does not match the declared public/private roots or treasury policy']
    }),
    buildTheoremVerdict({
      theoremId: 'bitcoin_audit_anchor.bounded_public_anchor_matches_full_anchor',
      passed: boundedPublicAnchorMatches,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-audit-anchor.anchor-receipt-binding'],
      failureReasons: boundedPublicAnchorMatches ? [] : ['bounded public anchor receipt diverges from the full anchor record']
    })
  ];

  return {
    proofFamily: 'bitcoin-audit-anchor',
    memberVerdicts: [
      { memberId: 'commitment-manifest', passed: (commitmentManifest.scopeEntries?.public || []).length > 0 && (commitmentManifest.scopeEntries?.private || []).length > 0 },
      { memberId: 'public-root-scope', passed: publicScopeDisclosable },
      { memberId: 'private-root-binding', passed: privateScopeBindsProofContract },
      { memberId: 'storage-reality-binding', passed: storageRealityClosed },
      { memberId: 'anchor-publication', passed: anchorReceiptMatchesRoot },
      { memberId: 'bounded-public-anchor', passed: boundedPublicAnchorMatches }
    ],
    theoremVerdicts,
    artifactBindings: [
      buildArtifactBinding({ artifactPath: '.bitcode/storage-reality-manifest.json', role: 'storage-reality', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-commitment-manifest.json', role: 'commitment-manifest', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-treasury-policy.json', role: 'treasury-policy', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-anchor.json', role: 'anchor-record', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-bounded-public-anchor.json', role: 'bounded-public-anchor', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) })
    ],
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    allCasesPassed: publicScopeDisclosable && privateScopeBindsProofContract && storageRealityClosed && anchorReceiptMatchesRoot && boundedPublicAnchorMatches,
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      publicRoot: commitmentManifest.publicRoot,
      privateRoot: commitmentManifest.privateRoot,
      anchorId: bitcoinAnchor.anchorId,
      boundedAnchorId: bitcoinBoundedPublicAnchor.anchorId,
      proofContractRef: commitmentManifest.proofContractRef,
      publicArtifactCount: (projectionPolicy.publicArtifactPaths || []).length,
      boundedPublicProofHash: stableHashObject(boundedPublicProof || {})
    })
  };
}

/**
 * @param {{
 *   computeRealityManifest: any,
 *   settlementIntent: any,
 *   settlementObservation: any,
 *   treasuryPolicy: any,
 *   settlementPreview: { readId?: string | undefined, bundleId: string, meteredMicroUnits?: string | undefined },
 *   sourceToSharesArtifact: { proofHash?: string | undefined },
 *   settlementProof: { proofHash?: string | undefined },
 *   journalDiff: { totals?: { debited?: string | undefined, credited?: string | undefined } | undefined },
 *   externalBoundaryManifest: { interfaces?: Array<{ interfaceId?: string }> | undefined }
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildBitcoinSettlementInterfaceProof({
  computeRealityManifest,
  settlementIntent,
  settlementObservation,
  treasuryPolicy,
  settlementPreview,
  sourceToSharesArtifact,
  settlementProof,
  journalDiff,
  externalBoundaryManifest
}) {
  const witnessArtifactPaths = [
    '.bitcode/compute-reality-manifest.json',
    '.bitcode/bitcoin-settlement-intent.json',
    '.bitcode/bitcoin-settlement-observation.json',
    '.bitcode/bitcoin-treasury-policy.json',
    '.bitcode/settlement-preview.json',
    '.bitcode/source-to-shares.json',
    '.bitcode/settlement-proof.json',
    '.bitcode/journal-diff.json',
    '.bitcode/external-boundary-manifest.json'
  ];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'bitcoin-settlement-interface.intent-bundle-binding',
      theoremIds: ['bitcoin_settlement_interface.compute_reality_binds_declared_settlement_path', 'bitcoin_settlement_interface.intent_matches_settlement_preview'],
      requiredArtifactPaths: ['.bitcode/compute-reality-manifest.json', '.bitcode/bitcoin-settlement-intent.json', '.bitcode/settlement-preview.json', '.bitcode/source-to-shares.json'],
      instruction: 'Replay compute reality and payment intent closure against the declared settlement preview and source-to-shares refs.'
    }),
    buildReplayStep({
      stepId: 'bitcoin-settlement-interface.confirmation-policy',
      theoremIds: ['bitcoin_settlement_interface.observation_confirms_declared_value'],
      requiredArtifactPaths: ['.bitcode/bitcoin-settlement-observation.json', '.bitcode/bitcoin-treasury-policy.json'],
      instruction: 'Replay mode-specific confirmation policy against the settlement observation surface.'
    }),
    buildReplayStep({
      stepId: 'bitcoin-settlement-interface.journal-effect-binding',
      theoremIds: ['bitcoin_settlement_interface.journal_binding_remains_exact', 'bitcoin_settlement_interface.external_boundary_contract_is_honest'],
      requiredArtifactPaths: ['.bitcode/settlement-proof.json', '.bitcode/journal-diff.json', '.bitcode/external-boundary-manifest.json'],
      instruction: 'Replay journal binding and external boundary honesty against the observed payment surface.'
    })
  ];

  const selectedPolicy = treasuryPolicy.confirmationPolicyByMode?.[settlementIntent.paymentMode] || {};
  const computeRealityClosed = summarizeStrings(computeRealityManifest.proofArtifactRefs || []).includes('.bitcode/settlement-proof.json')
    && summarizeStrings(computeRealityManifest.settlementArtifactRefs || computeRealityManifest.replayBasis?.settlementArtifactRefs || []).includes('.bitcode/source-to-shares.json');
  const intentMatchesPreview = settlementIntent.bundleId === settlementPreview.bundleId
    && settlementIntent.unitDenomination === 'BTD'
    && settlementIntent.meteredMicroUnits === settlementPreview.meteredMicroUnits
    && settlementIntent.sourceToSharesRef === (sourceToSharesArtifact.proofHash || null);
  const observationMatchesPolicy = settlementObservation.networkState === selectedPolicy.requiredNetworkState
    && settlementObservation.confirmationState === selectedPolicy.requiredConfirmationState
    && Number(settlementObservation.confirmations || 0) >= Number(selectedPolicy.minimumConfirmations || 0)
    && settlementObservation.observedValue === settlementIntent.meteredMicroUnits;
  const journalBindingClosed = settlementObservation.journalBindingState === selectedPolicy.requiredJournalBindingState
    && journalDiff.totals?.debited === journalDiff.totals?.credited
    && settlementProof.proofHash === settlementProof.proofHash;
  const externalBoundaryIds = new Set(summarizeStrings((externalBoundaryManifest.interfaces || []).map((entry) => entry.interfaceId)));
  const requiredBoundaryIds = settlementIntent.paymentMode === 'checkpointed-sidechain-bridge'
    ? ['bitcoin-anchor-publication', 'bitcoin-payment-observation', 'bitcoin-sidechain-bridge']
    : ['bitcoin-anchor-publication', 'bitcoin-payment-observation'];
  const externalBoundaryHonest = requiredBoundaryIds.every((interfaceId) => externalBoundaryIds.has(interfaceId));

  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'bitcoin_settlement_interface.compute_reality_binds_declared_settlement_path',
      passed: computeRealityClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-settlement-interface.intent-bundle-binding'],
      failureReasons: computeRealityClosed ? [] : ['compute reality does not bind the declared settlement replay path']
    }),
    buildTheoremVerdict({
      theoremId: 'bitcoin_settlement_interface.intent_matches_settlement_preview',
      passed: intentMatchesPreview,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-settlement-interface.intent-bundle-binding'],
      failureReasons: intentMatchesPreview ? [] : ['bitcoin settlement intent diverges from the emitted settlement preview']
    }),
    buildTheoremVerdict({
      theoremId: 'bitcoin_settlement_interface.observation_confirms_declared_value',
      passed: observationMatchesPolicy,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-settlement-interface.confirmation-policy'],
      failureReasons: observationMatchesPolicy ? [] : ['settlement observation does not satisfy the mode-specific confirmation policy']
    }),
    buildTheoremVerdict({
      theoremId: 'bitcoin_settlement_interface.journal_binding_remains_exact',
      passed: journalBindingClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-settlement-interface.journal-effect-binding'],
      failureReasons: journalBindingClosed ? [] : ['journal binding state or exact-accounting totals drift from policy']
    }),
    buildTheoremVerdict({
      theoremId: 'bitcoin_settlement_interface.external_boundary_contract_is_honest',
      passed: externalBoundaryHonest,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['bitcoin-settlement-interface.journal-effect-binding'],
      failureReasons: externalBoundaryHonest ? [] : ['external boundary manifest does not declare the required bitcoin-facing interfaces']
    })
  ];

  return {
    proofFamily: 'bitcoin-settlement-interface',
    memberVerdicts: [
      { memberId: 'compute-reality-binding', passed: computeRealityClosed },
      { memberId: 'settlement-intent', passed: intentMatchesPreview },
      { memberId: 'exact-unit-binding', passed: settlementIntent.unitDenomination === 'BTD' && settlementIntent.meteredMicroUnits === settlementPreview.meteredMicroUnits },
      { memberId: 'confirmation-observation', passed: observationMatchesPolicy },
      { memberId: 'journal-receipt-binding', passed: journalBindingClosed },
      { memberId: 'external-boundary-closure', passed: externalBoundaryHonest }
    ],
    theoremVerdicts,
    artifactBindings: [
      buildArtifactBinding({ artifactPath: '.bitcode/compute-reality-manifest.json', role: 'compute-reality', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-settlement-intent.json', role: 'settlement-intent', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-settlement-observation.json', role: 'settlement-observation', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/bitcoin-treasury-policy.json', role: 'treasury-policy', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) })
    ],
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    allCasesPassed: computeRealityClosed && intentMatchesPreview && observationMatchesPolicy && journalBindingClosed && externalBoundaryHonest,
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      intentId: settlementIntent.intentId,
      observationId: settlementObservation.observationId,
      paymentMode: settlementIntent.paymentMode,
      settlementPreviewRef: settlementIntent.settlementPreviewRef,
      journalTotals: journalDiff.totals || {},
      treasuryPolicyRef: treasuryPolicy.policyId
    })
  };
}

/**
 * @param {Record<string, unknown>} artifactPayloadByPath
 * @param {Record<string, string[]>} proofFamiliesByPath
 * @returns {Record<string, { digest: string, proofFamilies: string[] }>}
 */
export function buildArtifactDigestLookup(artifactPayloadByPath, proofFamiliesByPath) {
  return Object.fromEntries(
    Object.entries(artifactPayloadByPath).map(([path, payload]) => [
      path,
      {
        digest: jsonDigest(payload),
        proofFamilies: summarizeStrings(proofFamiliesByPath[path] || [])
      }
    ])
  );
}
