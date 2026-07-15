// @ts-check
// @ts-nocheck

/**
 * @typedef {import('./type-contracts.js').BuiltPromptSurface} BuiltPromptSurface
 * @typedef {import('./type-contracts.js').PromptContractShape} PromptContractShape
 * @typedef {import('./type-contracts.js').ParsedCompletionEnvelope} ParsedCompletionEnvelope
 * @typedef {import('./type-contracts.js').ProjectionPolicyShape} ProjectionPolicyShape
 *
 * @typedef {{ assetId: string, unitId: string }} UnitRef
 * @typedef {{ assetId: string, selectedUnits?: UnitRef[] | undefined }} SelectedSourceMaterialEntry
 * @typedef {{ selectedSourceMaterial?: SelectedSourceMaterialEntry[] | undefined }} SelectedSourceMaterialManifest
 * @typedef {{ title: string, artifactKind: string }} CandidateAsset
 * @typedef {{ branchMaterializationAllowed?: boolean | undefined, settlementAllowed?: boolean | undefined }} CandidateRights
 * @typedef {{ assetId: string, useTier: string, asset: CandidateAsset, rights?: CandidateRights | null }} EvaluatedCandidate
 * @typedef {{ assetPackId: string, selectedAssets: string[], assets?: Array<{ assetId: string }> | undefined }} AssetPackShape
 * @typedef {{ units?: UnitRef[] | undefined, assets?: Array<{ assetId: string }> | undefined }} AssetPackLockShape
 * @typedef {{ artifactClasses?: Array<{ path: string, sensitiveDataClass?: string | undefined, disclosable: boolean }> | undefined }} PolicyReleaseShape
 */

import crypto from 'node:crypto';
import { PROFILE_A, PROFILE_B } from '../realization-profile.js';

const SOURCE_TO_SHARES_SCALE = 1000000n;

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
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(/** @type {Record<string, unknown>} */ (value)[key])}`).join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableHashObject(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {{
 *   assetPack: AssetPackShape,
 *   assetPackLock: AssetPackLockShape | null | undefined,
 *   selectedCandidates: EvaluatedCandidate[],
 *   settlementCandidates: EvaluatedCandidate[],
 *   selectedSourceMaterialManifest: SelectedSourceMaterialManifest | null | undefined,
 *   branchMode: string
 * }} input
 * @returns {Record<string, unknown>}
 */
function buildSelectionConsistencyProof({ assetPack, assetPackLock, selectedCandidates, settlementCandidates, selectedSourceMaterialManifest, branchMode }) {
  const allowedTiers = branchMode === 'context'
    ? new Set(['context-only', 'patch-eligible', 'settlement-eligible'])
    : new Set(['patch-eligible', 'settlement-eligible']);
  const selectedAssetIds = selectedCandidates.map((candidate) => candidate.assetId);
  const assetPackSelectedAssetIds = assetPack.selectedAssets || [];
  const materializedSourceAssetIds = (selectedSourceMaterialManifest?.selectedSourceMaterial || []).map((entry) => entry.assetId);
  const lockUnitRefs = new Set((assetPackLock?.units || []).map((unit) => `${unit.assetId}:${unit.unitId}`));
  const selectedUnitRefs = (selectedSourceMaterialManifest?.selectedSourceMaterial || []).flatMap((entry) =>
    (entry.selectedUnits || []).map((unit) => `${entry.assetId}:${unit.unitId}`)
  );

  return {
    assetPackId: assetPack.assetPackId,
    branchMode,
    assetPackSelectionsMatchSelectedCandidates: stableHashObject(assetPackSelectedAssetIds.slice().sort()) === stableHashObject(selectedAssetIds.slice().sort()),
    allSelectedAssetsRespectUseTier: selectedCandidates.every((candidate) => allowedTiers.has(candidate.useTier)),
    materializedSourceManifestMatchesAssetPack: stableHashObject(materializedSourceAssetIds.slice().sort()) === stableHashObject(selectedAssetIds.slice().sort()),
    materializedSourceUnitsClosedOverLock: selectedUnitRefs.every((unitRef) => lockUnitRefs.has(unitRef)),
    settlementParticipantsSubsetOfSelectedAssets: settlementCandidates.every((candidate) => selectedAssetIds.includes(candidate.assetId)),
    settlementConsumesOnlySettlementEligibleAssets: settlementCandidates.every((candidate) => candidate.useTier === 'settlement-eligible'),
    witnessRefs: {
      assetPackSelectedAssetIds,
      selectedAssetIds,
      materializedSourceAssetIds,
      settlementCandidateAssetIds: settlementCandidates.map((candidate) => candidate.assetId),
      selectedUnitRefs
    },
    proofHash: stableHashObject({
      assetPackSelectedAssetIds,
      selectedAssetIds,
      materializedSourceAssetIds,
      settlementCandidateAssetIds: settlementCandidates.map((candidate) => candidate.assetId),
      selectedUnitRefs
    })
  };
}

/**
 * @param {{
 *   assetPackLock: AssetPackLockShape | null | undefined,
 *   selectedSourceMaterialManifest: SelectedSourceMaterialManifest,
 *   projectionPolicy: ProjectionPolicyShape,
 *   policyRelease: PolicyReleaseShape | null | undefined
 * }} input
 * @returns {Record<string, unknown>}
 */
function buildMaterializationVisibilityProof({ assetPackLock, selectedSourceMaterialManifest, projectionPolicy, policyRelease }) {
  const selectedAssetIds = new Set((assetPackLock?.assets || []).map((asset) => asset.assetId));
  const selectedSourceMaterialIds = new Set((selectedSourceMaterialManifest.selectedSourceMaterial || []).map((entry) => entry.assetId));
  const publicPaths = new Set(projectionPolicy.publicArtifactPaths || []);
  const materializedUnits = (selectedSourceMaterialManifest.selectedSourceMaterial || []).flatMap((entry) => entry.selectedUnits || []);
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    allSelectedAssetsHaveMaterializedSourceBindings: [...selectedAssetIds].every((assetId) => selectedSourceMaterialIds.has(assetId)),
    noUnexpectedMaterializedSourceBindings: [...selectedSourceMaterialIds].every((assetId) => selectedAssetIds.has(assetId)),
    allMaterializedUnitsClosedOverLock: materializedUnits.every((unit) =>
      (assetPackLock?.units || []).some((lockedUnit) => lockedUnit.assetId === unit.assetId && lockedUnit.unitId === unit.unitId)
    ),
    noPrivateArtifactsLeakIntoPublicProjection: (policyRelease?.artifactClasses || []).filter((entry) => !entry.disclosable).every((entry) => !publicPaths.has(entry.path)),
    witnessRefs: {
      selectedAssetIds: [...selectedAssetIds],
      materializedSourceAssetIds: [...selectedSourceMaterialIds],
      materializedUnitRefs: materializedUnits.map((unit) => `${unit.assetId}:${unit.unitId}`),
      publicArtifactPaths: [...publicPaths]
    },
    proofHash: stableHashObject({
      selectedAssetIds: [...selectedAssetIds],
      materializedSourceAssetIds: [...selectedSourceMaterialIds],
      materializedUnitRefs: materializedUnits.map((unit) => `${unit.assetId}:${unit.unitId}`),
      publicArtifactPaths: [...publicPaths]
    })
  };
}

/**
 * @param {{
 *   assetPack: AssetPackShape,
 *   evaluatedCandidates?: EvaluatedCandidate[],
 *   selectedCandidates?: EvaluatedCandidate[],
 *   branchMode: string
 * }} input
 * @returns {Record<string, unknown>}
 */
function buildMaterializationExclusions({ assetPack, evaluatedCandidates = [], selectedCandidates = [], branchMode }) {
  const selectedAssetIds = new Set(selectedCandidates.map((candidate) => candidate.assetId));
  const exclusions = evaluatedCandidates
    .filter((candidate) => !selectedAssetIds.has(candidate.assetId))
    .map((candidate) => ({
      assetId: candidate.assetId,
      title: candidate.asset.title,
      artifactKind: candidate.asset.artifactKind,
      useTier: candidate.useTier,
      branchMode,
      materializationAllowed: !!candidate.rights?.branchMaterializationAllowed,
      settlementAllowed: !!candidate.rights?.settlementAllowed,
      exclusionClass: candidate.useTier === 'reject'
        ? 'verification-or-policy-rejection'
        : candidate.rights?.branchMaterializationAllowed
          ? 'ranking-cut'
          : 'branch-mode-or-use-tier',
      exclusionReason: candidate.rights?.branchMaterializationAllowed
        ? `Not selected into the top ${assetPack.selectedAssets.length} ${branchMode} branch assets.`
        : `Use tier ${candidate.useTier} does not authorize ${branchMode} branch materialization.`
    }));
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    branchMode,
    selectedAssetCount: selectedCandidates.length,
    excludedAssetCount: exclusions.length,
    exclusions,
    proofHash: stableHashObject({
      branchMode,
      exclusions: exclusions.map((entry) => ({
        assetId: entry.assetId,
        exclusionClass: entry.exclusionClass,
        exclusionReason: entry.exclusionReason
      }))
    })
  };
}

/**
 * @param {{
 *   assetPack: AssetPackShape,
 *   assetPackLock: AssetPackLockShape,
 *   selectedSourceMaterialManifest: SelectedSourceMaterialManifest,
 *   materializationVisibilityProof: { proofHash: string },
 *   materializationExclusions: { exclusions?: Array<{ assetId: string, exclusionClass?: string | undefined, exclusionReason?: string | undefined }> | undefined, proofHash: string },
 *   branchMode: string
 * }} input
 * @returns {Record<string, unknown>}
 */
function buildMaterializationProof({ assetPack, assetPackLock, selectedSourceMaterialManifest, materializationVisibilityProof, materializationExclusions, branchMode }) {
  const selectedAssetIds = (assetPack.selectedAssets || []).slice();
  const materializedAssetIds = (selectedSourceMaterialManifest.selectedSourceMaterial || []).map((entry) => entry.assetId);
  const excludedAssetIds = (materializationExclusions.exclusions || []).map((entry) => entry.assetId);
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    assetPackId: assetPack.assetPackId,
    branchMode,
    allSelectedAssetsMaterialized: stableHashObject(selectedAssetIds.slice().sort()) === stableHashObject(materializedAssetIds.slice().sort()),
    allExclusionsExplained: (materializationExclusions.exclusions || []).every((entry) => !!entry.exclusionClass && !!entry.exclusionReason),
    visibilityProofRef: materializationVisibilityProof.proofHash,
    exclusionManifestRef: materializationExclusions.proofHash,
    witnessRefs: {
      selectedAssetIds,
      materializedAssetIds,
      excludedAssetIds,
      lockedUnitRefs: (assetPackLock.units || []).map((unit) => `${unit.assetId}:${unit.unitId}`)
    },
    proofHash: stableHashObject({
      assetPackId: assetPack.assetPackId,
      branchMode,
      selectedAssetIds,
      materializedAssetIds,
      excludedAssetIds,
      visibilityProofRef: materializationVisibilityProof.proofHash,
      exclusionManifestRef: materializationExclusions.proofHash
    })
  };
}

/**
 * @param {{
 *   inferenceProofs?: Array<{ outputField: string, promptOrEvaluatorId: string, proofHash?: string | undefined, fieldProofId?: string | undefined }> | undefined,
 *   promptFamilyRegistry?: { registryHash?: string | undefined } | undefined,
 *   inferenceMomentContracts?: Array<{ momentContractId?: string | undefined, contractHash?: string | undefined }> | undefined,
 *   promptSurfaces?: BuiltPromptSurface[] | undefined,
 *   promptContracts?: PromptContractShape[] | undefined,
 *   promptImplementationSurface: unknown,
 *   promptCompletenessProof: { proofHash: string },
 *   parsedCompletionEnvelopes?: ParsedCompletionEnvelope[] | undefined,
 *   parsedCompletionEnvelopeArtifact?: { artifactHash?: string | undefined, verificationReceipts?: Array<{ receiptId: string }> | undefined } | null,
 *   evalManifest?: unknown,
 *   assetPackLock: AssetPackLockShape,
 *   selectedSourceMaterialManifest: SelectedSourceMaterialManifest,
 *   codeAnalysisFactRegistry: unknown,
 *   staticHeuristicsRegistry: unknown,
 *   measurementReceipts?: Array<{ receiptId: string }> | undefined,
 *   staticMeasurementReport: { reportHash: string },
 *   staticMeasurementProof: { proofHash: string },
 *   verificationReport: unknown,
 *   verificationReceiptsArtifact?: { verificationReceipts?: Array<{ receiptId: string }> | undefined } | null,
 *   verificationDecisionsProof?: { proofHash?: string | undefined } | undefined,
 *   identityBindings: unknown,
 *   authorizationDecisions: unknown,
 *   sensitiveDataFlowRecords: unknown,
 *   inferenceSynthesisProof?: { proofHash?: string | undefined } | undefined,
 *   selectionConsistencyProof: { proofHash: string },
 *   selectionAndMaterializationProof?: { proofHash?: string | undefined } | undefined,
 *   journalCompletenessProof: { proofHash: string },
 *   identityAuthorizationProof: { proofHash: string },
 *   sensitiveDataFlowProof: { proofHash: string },
 *   authorizationAndSensitiveFlowProof?: { proofHash?: string | undefined } | undefined,
 *   materializationProof: { proofHash: string },
 *   materializationExclusions: { proofHash: string },
 *   materializationVisibilityProof: { proofHash: string },
 *   settlementPreview?: { bundleId?: string | undefined } | undefined,
  *   sourceToSharesArtifact: { proofHash: string },
  *   settlementParticipationArtifact: { proofHash: string },
  *   accountingPrecisionReport: { reportHash: string },
 *   settlementSourceToSharesProof?: { proofHash?: string | undefined } | undefined,
 *   settlementProof: { assetPackLockHash: string, proofHash?: string | undefined },
 *   journalDiff: unknown,
 *   externalBoundaryManifest?: unknown,
 *   projectionPolicy?: { policyHash?: string | undefined } | undefined,
 *   boundedPublicProof?: { boundedPublicProofHash?: string | undefined } | undefined,
 *   redactionProof: { boundedPublicProofHash: string },
 *   disclosureProof: { boundedPublicProofHash: string, projectionPolicyRef?: string | undefined },
 *   disclosureBoundaryProof?: { proofHash?: string | undefined } | undefined,
 *   proofContract: { contractId: string },
 *   externalEnvironmentProfile?: unknown,
 *   externalTelemetrySummary?: unknown,
 *   externalExecutionLedger?: unknown,
 *   externalReconciliationLog?: unknown,
 *   externalRealizationProof?: { proofHash?: string | undefined } | undefined,
 *   containerRealityProof?: { proofHash?: string | undefined } | undefined,
 *   githubLiveInterfaceProof?: { proofHash?: string | undefined } | undefined
 * }} input
 * @returns {Record<string, unknown>}
 */
function buildProofWitnessManifest({
  inferenceProofs,
  inferenceSynthesisProof,
  promptFamilyRegistry,
  inferenceMomentContracts,
  promptSurfaces,
  promptContracts,
  promptImplementationSurface,
  promptCompletenessProof,
  parsedCompletionEnvelopes,
  parsedCompletionEnvelopeArtifact,
  evalManifest,
  assetPackLock,
  selectedSourceMaterialManifest,
  codeAnalysisFactRegistry,
  staticHeuristicsRegistry,
  measurementReceipts,
  staticMeasurementReport,
  staticMeasurementProof,
  verificationReport,
  verificationReceiptsArtifact,
  verificationDecisionsProof,
  identityBindings,
  authorizationDecisions,
  sensitiveDataFlowRecords,
  selectionConsistencyProof,
  selectionAndMaterializationProof,
  journalCompletenessProof,
  identityAuthorizationProof,
  sensitiveDataFlowProof,
  authorizationAndSensitiveFlowProof,
  materializationProof,
  materializationExclusions,
  materializationVisibilityProof,
  settlementPreview,
  sourceToSharesArtifact,
  settlementParticipationArtifact,
  accountingPrecisionReport,
  settlementSourceToSharesProof,
  settlementProof,
  journalDiff,
  externalBoundaryManifest,
  projectionPolicy,
  boundedPublicProof,
  redactionProof,
  disclosureProof,
  disclosureBoundaryProof,
  proofContract,
  externalEnvironmentProfile = null,
  externalTelemetrySummary = null,
  externalExecutionLedger = null,
  externalReconciliationLog = null,
  externalRealizationProof = null,
  containerRealityProof = null,
  githubLiveInterfaceProof = null,
  computeRealityManifest = null,
  storageRealityManifest = null,
  bitcoinCommitmentManifest = null,
  bitcoinTreasuryPolicy = null,
  bitcoinAnchor = null,
  bitcoinBoundedPublicAnchor = null,
  bitcoinSettlementIntent = null,
  bitcoinSettlementObservation = null,
  bitcoinAuditAnchorProof = null,
  bitcoinSettlementInterfaceProof = null
}) {
  const artifactDigests = [
    { path: '.proofs/_shared/prompt-family-registry.json', digest: promptFamilyRegistry?.registryHash || stableHashObject(promptFamilyRegistry || {}), proofFamilies: ['prompt-completeness'] },
    { path: '.proofs/_shared/inference-moment-contracts.json', digest: stableHashObject(inferenceMomentContracts || []), proofFamilies: ['inference-synthesis'] },
    { path: '.proofs/_shared/inference-proofs.json', digest: stableHashObject(inferenceProofs || []), proofFamilies: ['inference-synthesis'] },
    { path: '.proofs/_shared/prompt-implementation-surface.json', digest: stableHashObject(promptImplementationSurface || {}), proofFamilies: ['inference-synthesis'] },
    { path: '.proofs/_shared/prompt-surfaces.json', digest: stableHashObject(promptSurfaces || []), proofFamilies: ['inference-synthesis'] },
    { path: '.proofs/_shared/eval-manifest.json', digest: stableHashObject(evalManifest || {}), proofFamilies: ['inference-synthesis'] },
    { path: '.proofs/_shared/prompt-contracts.json', digest: stableHashObject(promptContracts || []), proofFamilies: ['prompt-completeness'] },
    { path: '.proofs/_shared/inference-synthesis-proof.json', digest: inferenceSynthesisProof?.proofHash || stableHashObject({ missing: 'inference-synthesis-proof' }), proofFamilies: ['inference-synthesis'] },
    { path: '.proofs/_shared/prompt-completeness-proof.json', digest: promptCompletenessProof.proofHash, proofFamilies: ['prompt-completeness'] },
    {
      path: '.proofs/_shared/parsed-completion-envelopes.json',
      digest: parsedCompletionEnvelopeArtifact?.artifactHash || stableHashObject(parsedCompletionEnvelopes || []),
      proofFamilies: ['inference-synthesis', 'prompt-completeness']
    },
    { path: '.proofs/_shared/asset-pack.lock.json', digest: stableHashObject(assetPackLock || {}), proofFamilies: ['selection-and-materialization', 'settlement-source-to-shares'] },
    { path: '.proofs/_shared/selected-source-material.json', digest: stableHashObject(selectedSourceMaterialManifest || {}), proofFamilies: ['selection-and-materialization'] },
    { path: '.proofs/_shared/code-analysis-fact-registry.json', digest: stableHashObject(codeAnalysisFactRegistry || {}), proofFamilies: ['static-code-analysis'] },
    { path: '.proofs/_shared/measurement-receipts.json', digest: stableHashObject(measurementReceipts || []), proofFamilies: ['static-code-analysis'] },
    { path: '.proofs/_shared/static-measurement-report.json', digest: staticMeasurementReport.reportHash, proofFamilies: ['static-code-analysis'] },
    { path: '.proofs/_shared/static-measurement-proof.json', digest: staticMeasurementProof.proofHash, proofFamilies: ['static-code-analysis'] },
    { path: '.proofs/_shared/identity-bindings.json', digest: stableHashObject(identityBindings || []), proofFamilies: ['authorization-and-sensitive-flow'] },
    { path: '.proofs/_shared/authorization-decisions.json', digest: stableHashObject(authorizationDecisions || []), proofFamilies: ['authorization-and-sensitive-flow'] },
    { path: '.proofs/_shared/sensitive-data-flow.json', digest: stableHashObject(sensitiveDataFlowRecords || []), proofFamilies: ['authorization-and-sensitive-flow'] },
    { path: '.proofs/_shared/verification-report.json', digest: stableHashObject(verificationReport || {}), proofFamilies: ['verification-decisions'] },
    { path: '.proofs/_shared/verification-receipts.json', digest: stableHashObject(verificationReceiptsArtifact || {}), proofFamilies: ['verification-decisions'] },
    { path: '.proofs/_shared/verification-decisions-proof.json', digest: verificationDecisionsProof?.proofHash || stableHashObject({ missing: 'verification-decisions-proof' }), proofFamilies: ['verification-decisions'] },
    { path: '.proofs/_shared/selection-consistency-proof.json', digest: selectionConsistencyProof?.proofHash || stableHashObject({ missing: 'selection-consistency-proof' }), proofFamilies: ['selection-and-materialization'] },
    { path: '.proofs/_shared/materialization-proof.json', digest: materializationProof.proofHash, proofFamilies: ['selection-and-materialization'] },
    { path: '.proofs/_shared/selection-and-materialization-proof.json', digest: selectionAndMaterializationProof?.proofHash || stableHashObject({ missing: 'selection-and-materialization-proof' }), proofFamilies: ['selection-and-materialization'] },
    { path: '.proofs/_shared/materialization-exclusions.json', digest: materializationExclusions.proofHash, proofFamilies: ['selection-and-materialization'] },
    { path: '.proofs/_shared/materialization-visibility-proof.json', digest: materializationVisibilityProof.proofHash, proofFamilies: ['selection-and-materialization'] },
    { path: '.proofs/_shared/identity-authorization-proof.json', digest: identityAuthorizationProof?.proofHash || stableHashObject({ missing: 'identity-authorization-proof' }), proofFamilies: ['authorization-and-sensitive-flow'] },
    { path: '.proofs/_shared/sensitive-data-flow-proof.json', digest: sensitiveDataFlowProof?.proofHash || stableHashObject({ missing: 'sensitive-data-flow-proof' }), proofFamilies: ['authorization-and-sensitive-flow'] },
    { path: '.proofs/_shared/authorization-and-sensitive-flow-proof.json', digest: authorizationAndSensitiveFlowProof?.proofHash || stableHashObject({ missing: 'authorization-and-sensitive-flow-proof' }), proofFamilies: ['authorization-and-sensitive-flow'] },
    { path: '.proofs/_shared/source-to-shares.json', digest: sourceToSharesArtifact.proofHash, proofFamilies: ['settlement-source-to-shares'] },
    { path: '.proofs/_shared/settlement-preview.json', digest: stableHashObject(settlementPreview || {}), proofFamilies: ['settlement-source-to-shares', 'bitcoin-settlement-interface'] },
    { path: '.proofs/_shared/settlement-participation.json', digest: settlementParticipationArtifact.proofHash, proofFamilies: ['settlement-source-to-shares'] },
    { path: '.proofs/_shared/accounting-precision-report.json', digest: accountingPrecisionReport.reportHash, proofFamilies: ['settlement-source-to-shares'] },
    { path: '.proofs/_shared/journal-diff.json', digest: stableHashObject(journalDiff || {}), proofFamilies: ['settlement-source-to-shares'] },
    { path: '.proofs/_shared/journal-completeness-proof.json', digest: journalCompletenessProof?.proofHash || stableHashObject({ missing: 'journal-completeness-proof' }), proofFamilies: ['settlement-source-to-shares'] },
    { path: '.proofs/_shared/settlement-proof.json', digest: settlementProof?.proofHash || stableHashObject(settlementProof || {}), proofFamilies: ['settlement-source-to-shares'] },
    { path: '.proofs/_shared/settlement-source-to-shares-proof.json', digest: settlementSourceToSharesProof?.proofHash || stableHashObject({ missing: 'settlement-source-to-shares-proof' }), proofFamilies: ['settlement-source-to-shares'] },
    { path: '.proofs/_shared/external-boundary-manifest.json', digest: stableHashObject(externalBoundaryManifest || {}), proofFamilies: ['bitcoin-settlement-interface'] },
    { path: '.proofs/_shared/projection-policy.json', digest: projectionPolicy?.policyHash || disclosureProof?.projectionPolicyRef || stableHashObject(projectionPolicy || { missing: 'projection-policy' }), proofFamilies: ['disclosure-boundary'] },
    { path: '.proofs/_shared/bounded-public-proof.json', digest: boundedPublicProof?.boundedPublicProofHash || redactionProof?.boundedPublicProofHash || stableHashObject({ missing: 'bounded-public-proof' }), proofFamilies: ['disclosure-boundary'] },
    { path: '.proofs/_shared/redaction-proof.json', digest: redactionProof.boundedPublicProofHash, proofFamilies: ['disclosure-boundary'] },
    { path: '.proofs/_shared/disclosure-proof.json', digest: disclosureProof.boundedPublicProofHash, proofFamilies: ['disclosure-boundary'] },
    { path: '.proofs/_shared/disclosure-boundary-proof.json', digest: disclosureBoundaryProof?.proofHash || stableHashObject({ missing: 'disclosure-boundary-proof' }), proofFamilies: ['disclosure-boundary'] },
    { path: '.proofs/_shared/proof-contract.json', digest: stableHashObject(proofContract || {}), proofFamilies: ['proof-contract'] },
    { path: '.proofs/_shared/static-heuristics-registry.json', digest: stableHashObject(staticHeuristicsRegistry || {}), proofFamilies: ['static-code-analysis'] },
    ...(externalEnvironmentProfile ? [{ path: '.proofs/_shared/external-environment-profile.json', digest: stableHashObject(externalEnvironmentProfile || {}), proofFamilies: ['proof-contract'] }] : []),
    ...(externalTelemetrySummary ? [{ path: '.proofs/_shared/external-telemetry-summary.json', digest: stableHashObject(externalTelemetrySummary || {}), proofFamilies: ['proof-contract'] }] : []),
    ...(externalExecutionLedger ? [{ path: '.proofs/_shared/external-execution-ledger.json', digest: stableHashObject(externalExecutionLedger || {}), proofFamilies: ['proof-contract'] }] : []),
    ...(externalReconciliationLog ? [{ path: '.proofs/_shared/external-reconciliation-log.json', digest: stableHashObject(externalReconciliationLog || {}), proofFamilies: ['proof-contract'] }] : []),
    ...(externalRealizationProof ? [{ path: '.proofs/_shared/external-realization-proof.json', digest: externalRealizationProof?.proofHash || stableHashObject(externalRealizationProof || {}), proofFamilies: ['proof-contract'] }] : []),
    ...(containerRealityProof ? [{ path: '.proofs/_shared/container-reality-proof.json', digest: containerRealityProof?.proofHash || stableHashObject(containerRealityProof || {}), proofFamilies: ['proof-contract'] }] : []),
    ...(githubLiveInterfaceProof ? [{ path: '.proofs/_shared/github-live-interface-proof.json', digest: githubLiveInterfaceProof?.proofHash || stableHashObject(githubLiveInterfaceProof || {}), proofFamilies: ['proof-contract'] }] : []),
    ...(computeRealityManifest ? [{ path: '.proofs/_shared/compute-reality-manifest.json', digest: stableHashObject(computeRealityManifest || {}), proofFamilies: ['bitcoin-settlement-interface'] }] : []),
    ...(storageRealityManifest ? [{ path: '.proofs/_shared/storage-reality-manifest.json', digest: stableHashObject(storageRealityManifest || {}), proofFamilies: ['bitcoin-audit-anchor'] }] : []),
    ...(bitcoinCommitmentManifest ? [{ path: '.proofs/_shared/bitcoin-commitment-manifest.json', digest: stableHashObject(bitcoinCommitmentManifest || {}), proofFamilies: ['bitcoin-audit-anchor'] }] : []),
    ...(bitcoinTreasuryPolicy ? [{ path: '.proofs/_shared/bitcoin-treasury-policy.json', digest: stableHashObject(bitcoinTreasuryPolicy || {}), proofFamilies: ['bitcoin-audit-anchor', 'bitcoin-settlement-interface'] }] : []),
    ...(bitcoinAnchor ? [{ path: '.proofs/_shared/bitcoin-anchor.json', digest: stableHashObject(bitcoinAnchor || {}), proofFamilies: ['bitcoin-audit-anchor'] }] : []),
    ...(bitcoinBoundedPublicAnchor ? [{ path: '.proofs/_shared/bitcoin-bounded-public-anchor.json', digest: stableHashObject(bitcoinBoundedPublicAnchor || {}), proofFamilies: ['bitcoin-audit-anchor'] }] : []),
    ...(bitcoinSettlementIntent ? [{ path: '.proofs/_shared/bitcoin-settlement-intent.json', digest: stableHashObject(bitcoinSettlementIntent || {}), proofFamilies: ['bitcoin-settlement-interface'] }] : []),
    ...(bitcoinSettlementObservation ? [{ path: '.proofs/_shared/bitcoin-settlement-observation.json', digest: stableHashObject(bitcoinSettlementObservation || {}), proofFamilies: ['bitcoin-settlement-interface'] }] : []),
    ...(bitcoinAuditAnchorProof ? [{ path: '.proofs/_shared/bitcoin-audit-anchor-proof.json', digest: bitcoinAuditAnchorProof?.proofHash || stableHashObject(bitcoinAuditAnchorProof || {}), proofFamilies: ['bitcoin-audit-anchor'] }] : []),
    ...(bitcoinSettlementInterfaceProof ? [{ path: '.proofs/_shared/bitcoin-settlement-interface-proof.json', digest: bitcoinSettlementInterfaceProof?.proofHash || stableHashObject(bitcoinSettlementInterfaceProof || {}), proofFamilies: ['bitcoin-settlement-interface'] }] : [])
  ];
  const artifactDigestByPath = Object.fromEntries(
    artifactDigests.map((entry) => [entry.path, { digest: entry.digest, proofFamilies: entry.proofFamilies }])
  );
  const proofFamilies = [
      {
        proofFamily: 'inference-synthesis',
        witnessArtifactPaths: ['.proofs/_shared/inference-moment-contracts.json', '.proofs/_shared/inference-proofs.json', '.proofs/_shared/prompt-implementation-surface.json', '.proofs/_shared/prompt-surfaces.json', '.proofs/_shared/parsed-completion-envelopes.json', '.proofs/_shared/inference-synthesis-proof.json'],
        witnessRefs: [
          ...((inferenceMomentContracts || []).map((contract) => (/** @type {any} */ (contract)).contractHash || (/** @type {any} */ (contract)).momentContractId)),
          ...((inferenceProofs || []).map((proof) => proof.proofHash || proof.fieldProofId || `${proof.outputField}:${proof.promptOrEvaluatorId}`)),
          ...((parsedCompletionEnvelopes || []).map((envelope) => envelope.envelopeHash || envelope.envelopeId)),
          stableHashObject(promptImplementationSurface || {}),
          inferenceSynthesisProof?.proofHash
        ]
      },
      {
        proofFamily: 'prompt-completeness',
        witnessArtifactPaths: ['.proofs/_shared/prompt-family-registry.json', '.proofs/_shared/prompt-contracts.json', '.proofs/_shared/prompt-surfaces.json', '.proofs/_shared/prompt-completeness-proof.json', '.proofs/_shared/parsed-completion-envelopes.json'],
        witnessRefs: [
          promptFamilyRegistry?.registryHash || stableHashObject(promptFamilyRegistry || {}),
          promptCompletenessProof.proofHash,
          parsedCompletionEnvelopeArtifact?.artifactHash || stableHashObject(parsedCompletionEnvelopes || [])
        ]
      },
      {
        proofFamily: 'static-code-analysis',
        witnessArtifactPaths: ['.proofs/_shared/code-analysis-fact-registry.json', '.proofs/_shared/static-heuristics-registry.json', '.proofs/_shared/measurement-receipts.json', '.proofs/_shared/static-measurement-report.json', '.proofs/_shared/static-measurement-proof.json'],
        witnessRefs: (measurementReceipts || []).map((receipt) => receipt.receiptId)
      },
      {
        proofFamily: 'verification-decisions',
        witnessArtifactPaths: ['.proofs/_shared/verification-report.json', '.proofs/_shared/verification-receipts.json', '.proofs/_shared/verification-decisions-proof.json'],
        witnessRefs: [
          ...(verificationReceiptsArtifact?.verificationReceipts || []).map((receipt) => receipt.receiptId),
          verificationDecisionsProof?.proofHash
        ]
      },
      {
        proofFamily: 'selection-and-materialization',
        witnessArtifactPaths: ['.proofs/_shared/asset-pack.lock.json', '.proofs/_shared/selected-source-material.json', '.proofs/_shared/selection-consistency-proof.json', '.proofs/_shared/materialization-proof.json', '.proofs/_shared/materialization-exclusions.json', '.proofs/_shared/materialization-visibility-proof.json', '.proofs/_shared/selection-and-materialization-proof.json'],
        witnessRefs: [selectionConsistencyProof.proofHash, materializationProof.proofHash, materializationExclusions.proofHash, materializationVisibilityProof.proofHash, selectionAndMaterializationProof?.proofHash]
      },
      {
        proofFamily: 'authorization-and-sensitive-flow',
        witnessArtifactPaths: ['.proofs/_shared/identity-bindings.json', '.proofs/_shared/authorization-decisions.json', '.proofs/_shared/sensitive-data-flow.json', '.proofs/_shared/identity-authorization-proof.json', '.proofs/_shared/sensitive-data-flow-proof.json', '.proofs/_shared/authorization-and-sensitive-flow-proof.json'],
        witnessRefs: [identityAuthorizationProof.proofHash, sensitiveDataFlowProof.proofHash, authorizationAndSensitiveFlowProof?.proofHash]
      },
      {
        proofFamily: 'settlement-source-to-shares',
        witnessArtifactPaths: ['.proofs/_shared/source-to-shares.json', '.proofs/_shared/settlement-participation.json', '.proofs/_shared/settlement-preview.json', '.proofs/_shared/accounting-precision-report.json', '.proofs/_shared/journal-diff.json', '.proofs/_shared/journal-completeness-proof.json', '.proofs/_shared/settlement-proof.json', '.proofs/_shared/settlement-source-to-shares-proof.json'],
        witnessRefs: [sourceToSharesArtifact.proofHash, settlementParticipationArtifact.proofHash, stableHashObject(settlementPreview || {}), accountingPrecisionReport.reportHash, journalCompletenessProof.proofHash, settlementProof?.proofHash, settlementSourceToSharesProof?.proofHash]
      },
      {
        proofFamily: 'disclosure-boundary',
        witnessArtifactPaths: ['.proofs/_shared/projection-policy.json', '.proofs/_shared/bounded-public-proof.json', '.proofs/_shared/redaction-proof.json', '.proofs/_shared/disclosure-proof.json', '.proofs/_shared/disclosure-boundary-proof.json'],
        witnessRefs: [boundedPublicProof?.boundedPublicProofHash || redactionProof.boundedPublicProofHash, redactionProof.boundedPublicProofHash, disclosureProof.boundedPublicProofHash, disclosureBoundaryProof?.proofHash]
      },
      {
        proofFamily: 'proof-contract',
        witnessArtifactPaths: [
          '.proofs/_shared/proof-contract.json',
          '.proofs/_shared/system-proof-bundle.json',
          '.proofs/_shared/proof-witness-manifest.json',
          ...(externalEnvironmentProfile ? ['.proofs/_shared/external-environment-profile.json'] : []),
          ...(externalTelemetrySummary ? ['.proofs/_shared/external-telemetry-summary.json'] : []),
          ...(externalExecutionLedger ? ['.proofs/_shared/external-execution-ledger.json'] : []),
          ...(externalReconciliationLog ? ['.proofs/_shared/external-reconciliation-log.json'] : []),
          ...(externalRealizationProof ? ['.proofs/_shared/external-realization-proof.json'] : []),
          ...(containerRealityProof ? ['.proofs/_shared/container-reality-proof.json'] : []),
          ...(githubLiveInterfaceProof ? ['.proofs/_shared/github-live-interface-proof.json'] : [])
        ],
        witnessRefs: [
          proofContract.contractId,
          settlementProof.assetPackLockHash,
          stableHashObject(proofContract || {}),
          ...(externalExecutionLedger ? [externalExecutionLedger?.ledgerId || stableHashObject(externalExecutionLedger || {})] : []),
          ...(externalReconciliationLog ? [externalReconciliationLog?.logId || stableHashObject(externalReconciliationLog || {})] : []),
          ...(externalRealizationProof ? [externalRealizationProof?.proofHash || stableHashObject(externalRealizationProof || {})] : []),
          ...(containerRealityProof ? [containerRealityProof?.proofHash || stableHashObject(containerRealityProof || {})] : []),
          ...(githubLiveInterfaceProof ? [githubLiveInterfaceProof?.proofHash || stableHashObject(githubLiveInterfaceProof || {})] : [])
        ]
      },
      ...(bitcoinAuditAnchorProof ? [{
        proofFamily: 'bitcoin-audit-anchor',
        witnessArtifactPaths: [
          '.proofs/_shared/storage-reality-manifest.json',
          '.proofs/_shared/bitcoin-commitment-manifest.json',
          '.proofs/_shared/bitcoin-treasury-policy.json',
          '.proofs/_shared/bitcoin-anchor.json',
          '.proofs/_shared/bitcoin-bounded-public-anchor.json',
          '.proofs/_shared/projection-policy.json',
          '.proofs/_shared/bounded-public-proof.json',
          '.proofs/_shared/disclosure-proof.json',
          '.proofs/_shared/proof-contract.json',
          '.proofs/_shared/system-proof-bundle.json',
          '.proofs/_shared/proof-witness-manifest.json',
          '.proofs/_shared/bitcoin-audit-anchor-proof.json'
        ],
        witnessRefs: [
          storageRealityManifest?.realityId,
          bitcoinCommitmentManifest?.publicRoot,
          bitcoinAnchor?.anchorId,
          proofContract?.contractId,
          bitcoinAuditAnchorProof?.proofHash
        ]
      }] : []),
      ...(bitcoinSettlementInterfaceProof ? [{
        proofFamily: 'bitcoin-settlement-interface',
        witnessArtifactPaths: [
          '.proofs/_shared/compute-reality-manifest.json',
          '.proofs/_shared/bitcoin-settlement-intent.json',
          '.proofs/_shared/bitcoin-settlement-observation.json',
          '.proofs/_shared/bitcoin-treasury-policy.json',
          '.proofs/_shared/settlement-preview.json',
          '.proofs/_shared/source-to-shares.json',
          '.proofs/_shared/settlement-proof.json',
          '.proofs/_shared/journal-diff.json',
          '.proofs/_shared/external-boundary-manifest.json',
          '.proofs/_shared/bitcoin-settlement-interface-proof.json'
        ],
        witnessRefs: [
          computeRealityManifest?.realityId,
          bitcoinSettlementIntent?.intentId,
          bitcoinSettlementObservation?.observationId,
          sourceToSharesArtifact?.proofHash,
          settlementProof?.proofHash,
          bitcoinSettlementInterfaceProof?.proofHash
        ]
      }] : [])
    ];
  const proofFamiliesByName = Object.fromEntries(
    proofFamilies.map((entry) => [entry.proofFamily, entry])
  );
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    artifactDigests,
    artifactDigestByPath,
    allProofRelevantArtifactsDigested: artifactDigests.every((entry) => !!entry.digest),
    proofFamilies,
    proofFamiliesByName,
    proofHash: stableHashObject({
      inferenceProofs: stableHashObject(inferenceProofs || []),
      promptFamilyRegistry: promptFamilyRegistry?.registryHash || stableHashObject(promptFamilyRegistry || {}),
      inferenceMomentContracts: stableHashObject(inferenceMomentContracts || []),
      inferenceSynthesisProof: inferenceSynthesisProof?.proofHash,
      promptCompletenessProof: promptCompletenessProof.proofHash,
      parsedCompletionEnvelopeArtifact: parsedCompletionEnvelopeArtifact?.artifactHash || stableHashObject(parsedCompletionEnvelopes || []),
      staticMeasurementProof: staticMeasurementProof.proofHash,
      verificationReceiptCount: verificationReceiptsArtifact?.verificationReceipts?.length || 0,
      verificationDecisionsProof: verificationDecisionsProof?.proofHash,
      selectionAndMaterializationProof: selectionAndMaterializationProof?.proofHash,
      authorizationAndSensitiveFlowProof: authorizationAndSensitiveFlowProof?.proofHash,
      materializationProof: materializationProof.proofHash,
      materializationVisibilityProof: materializationVisibilityProof.proofHash,
      sourceToSharesArtifact: sourceToSharesArtifact.proofHash,
      settlementSourceToSharesProof: settlementSourceToSharesProof?.proofHash,
      disclosureBoundaryProof: disclosureBoundaryProof?.proofHash,
      accountingPrecisionReport: accountingPrecisionReport.reportHash,
      ...(externalEnvironmentProfile ? { externalEnvironmentProfile: stableHashObject(externalEnvironmentProfile || {}) } : {}),
      ...(externalTelemetrySummary ? { externalTelemetrySummary: stableHashObject(externalTelemetrySummary || {}) } : {}),
      ...(externalExecutionLedger ? { externalExecutionLedger: stableHashObject(externalExecutionLedger || {}) } : {}),
      ...(externalReconciliationLog ? { externalReconciliationLog: stableHashObject(externalReconciliationLog || {}) } : {}),
      ...(externalRealizationProof ? { externalRealizationProof: externalRealizationProof?.proofHash || stableHashObject(externalRealizationProof || {}) } : {}),
      ...(containerRealityProof ? { containerRealityProof: containerRealityProof?.proofHash || stableHashObject(containerRealityProof || {}) } : {}),
      ...(githubLiveInterfaceProof ? { githubLiveInterfaceProof: githubLiveInterfaceProof?.proofHash || stableHashObject(githubLiveInterfaceProof || {}) } : {}),
      ...(computeRealityManifest ? { computeRealityManifest: stableHashObject(computeRealityManifest || {}) } : {}),
      ...(storageRealityManifest ? { storageRealityManifest: stableHashObject(storageRealityManifest || {}) } : {}),
      ...(bitcoinCommitmentManifest ? { bitcoinCommitmentManifest: stableHashObject(bitcoinCommitmentManifest || {}) } : {}),
      ...(bitcoinTreasuryPolicy ? { bitcoinTreasuryPolicy: stableHashObject(bitcoinTreasuryPolicy || {}) } : {}),
      ...(bitcoinAnchor ? { bitcoinAnchor: stableHashObject(bitcoinAnchor || {}) } : {}),
      ...(bitcoinSettlementIntent ? { bitcoinSettlementIntent: stableHashObject(bitcoinSettlementIntent || {}) } : {}),
      ...(bitcoinSettlementObservation ? { bitcoinSettlementObservation: stableHashObject(bitcoinSettlementObservation || {}) } : {}),
      ...(bitcoinAuditAnchorProof ? { bitcoinAuditAnchorProof: bitcoinAuditAnchorProof?.proofHash } : {}),
      ...(bitcoinSettlementInterfaceProof ? { bitcoinSettlementInterfaceProof: bitcoinSettlementInterfaceProof?.proofHash } : {})
    })
  };
}

/**
 * @param {{
 *   read: { readId: string },
 *   assetPack: AssetPackShape,
 *   branchMode: string,
 *   sourceToSharesArtifact: {
 *     proofHash?: string | undefined,
 *     scoreScale?: string | undefined,
 *     sourceContributionEntries?: Array<{
 *       entryKind: string,
 *       assetId: string,
 *       candidateRankingScoreUnits: string,
 *       fullBundleScoreUnits: string,
 *       bundleWithoutAssetScoreUnits: string,
 *       rawContributionUnits: string,
 *       clippedContributionUnits: string,
 *       clipped: boolean,
 *       contributionDisposition: string,
 *       clippingReceiptId: string,
 *       coveredReadEvidence: unknown,
 *       rawShareBp: string | number
 *     }> | undefined,
 *     clippingReceipts?: Array<{
 *       receiptId: string,
 *       assetId: string,
 *       clipped: boolean,
 *       contributionDisposition: string,
 *       rawContributionUnits: string,
 *       clippedContributionUnits: string,
 *       reason: string
 *     }> | undefined,
 *     basisPointNormalization?: {
 *       method?: string | undefined,
 *       tieBreakPolicy?: string | undefined
 *     } | undefined,
 *     rawShares?: Array<{ assetId: string, shareBp: string | number, normalizationRemainderUnits: string }> | undefined
 *   } | null | undefined,
 *   settlementParticipationArtifact: {
 *     proofHash?: string | undefined,
 *     records?: Array<{
 *       assetId: string,
 *       selected: boolean,
 *       settlementParticipating: boolean,
 *       settledShareBp: string | number,
 *       creditedMicroUnits: string,
 *       zeroCreditParticipating: boolean,
 *       selectedUnitRefs: string[],
 *       rawContributionMass: string,
 *       clippedContributionMass: string,
 *       contributionDisposition: string,
 *       rawShareBp: string | number,
 *       creditDisposition: string,
 *       settlementDisposition: string
 *     }> | undefined
 *   } | null | undefined,
 *   allocationTrace: {
 *     tieBreakPolicy?: string | undefined,
 *     allocationLedger?: Array<{
 *       assetId: string,
 *       tieBreakRank?: number | null | undefined,
 *       remainderUnits?: string | undefined,
 *       extraMicroUnitsAwarded?: string | undefined
 *     }> | undefined
 *   } | null | undefined,
 *   journalDiff: { bundleId: string, eventId: string, invariants: Record<string, boolean> }
 * }} input
 * @returns {Record<string, unknown>}
 */
function buildAccountingPrecisionReport({ read, assetPack, branchMode, sourceToSharesArtifact, settlementParticipationArtifact, allocationTrace, journalDiff }) {
  const sourceContributionEntries = sourceToSharesArtifact?.sourceContributionEntries || [];
  const settlementRecords = settlementParticipationArtifact?.records || [];
  return {
    readId: read.readId,
    assetPackId: assetPack.assetPackId,
    bundleId: journalDiff.bundleId,
    branchMode,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    scoreScale: sourceToSharesArtifact?.scoreScale || SOURCE_TO_SHARES_SCALE.toString(),
    sourceToSharesRef: sourceToSharesArtifact?.proofHash,
    settlementParticipationRef: settlementParticipationArtifact?.proofHash,
    contributionInputs: sourceContributionEntries.map((entry) => ({
      entryKind: entry.entryKind,
      assetId: entry.assetId,
      candidateRankingScoreUnits: entry.candidateRankingScoreUnits,
      fullBundleScoreUnits: entry.fullBundleScoreUnits,
      bundleWithoutAssetScoreUnits: entry.bundleWithoutAssetScoreUnits,
      rawContributionUnits: entry.rawContributionUnits,
      clippedContributionUnits: entry.clippedContributionUnits,
      clipped: entry.clipped,
      contributionDisposition: entry.contributionDisposition,
      clippingReceiptId: entry.clippingReceiptId,
      coveredReadEvidence: entry.coveredReadEvidence,
      rawShareBp: entry.rawShareBp
    })),
    clippingDecisions: (sourceToSharesArtifact?.clippingReceipts || []).map((receipt) => ({
      receiptId: receipt.receiptId,
      assetId: receipt.assetId,
      clipped: receipt.clipped,
      contributionDisposition: receipt.contributionDisposition,
      rawContributionUnits: receipt.rawContributionUnits,
      clippedContributionUnits: receipt.clippedContributionUnits,
      reason: receipt.reason
    })),
    basisPointNormalization: {
      ...(sourceToSharesArtifact?.basisPointNormalization || {}),
      rawShares: (sourceToSharesArtifact?.rawShares || []).map((entry) => ({
        assetId: entry.assetId,
        shareBp: entry.shareBp,
        normalizationRemainderUnits: entry.normalizationRemainderUnits
      }))
    },
    microUnitAllocation: {
      ...allocationTrace,
      allocations: settlementRecords
        .filter((record) => record.settlementParticipating)
        .map((record) => ({
          assetId: record.assetId,
          settledShareBp: record.settledShareBp,
          creditedMicroUnits: record.creditedMicroUnits,
          zeroCreditParticipating: record.zeroCreditParticipating,
          selectedUnitRefs: record.selectedUnitRefs,
          tieBreakRank: (allocationTrace?.allocationLedger || []).find((entry) => entry.assetId === record.assetId)?.tieBreakRank || null,
          remainderUnits: (allocationTrace?.allocationLedger || []).find((entry) => entry.assetId === record.assetId)?.remainderUnits || '0',
          extraMicroUnitsAwarded: (allocationTrace?.allocationLedger || []).find((entry) => entry.assetId === record.assetId)?.extraMicroUnitsAwarded || '0'
        }))
    },
    sourceMaterialToSharesClosure: settlementRecords
      .filter((record) => record.selected)
      .map((record) => ({
        assetId: record.assetId,
        selectedUnitRefs: record.selectedUnitRefs,
        rawContributionMass: record.rawContributionMass,
        clippedContributionMass: record.clippedContributionMass,
        contributionDisposition: record.contributionDisposition,
        rawShareBp: record.rawShareBp,
        settledShareBp: record.settledShareBp,
        creditedMicroUnits: record.creditedMicroUnits,
        zeroCreditParticipating: record.zeroCreditParticipating,
        creditDisposition: record.creditDisposition,
        settlementDisposition: record.settlementDisposition
      })),
    exactAccountingInvariants: {
      rawSharesNormalized: journalDiff.invariants['rawSharesNormalized'],
      settledSharesNormalized: journalDiff.invariants['settledSharesNormalized'],
      allocationConserved: journalDiff.invariants['allocationConserved'],
      debitsEqualCredits: journalDiff.invariants['debitsEqualCredits'],
      zeroCreditParticipationExplicit: (settlementParticipationArtifact?.records || []).every(
        (record) => !record.zeroCreditParticipating || record.creditedMicroUnits === '0'
      ),
      clippedContributionDecisionsReceiptBacked: sourceContributionEntries.every((entry) => !!entry.clippingReceiptId)
    },
    tieBreakExplanations: [
      `basis-point normalization uses ${sourceToSharesArtifact?.basisPointNormalization?.tieBreakPolicy || 'largest remainder'}`,
      `micro-unit allocation uses ${allocationTrace?.tieBreakPolicy || 'largest remainder'}`
    ],
    reportHash: stableHashObject({
      sourceToSharesRef: sourceToSharesArtifact?.proofHash,
      settlementParticipationRef: settlementParticipationArtifact?.proofHash,
      journalEventId: journalDiff.eventId,
      exactAccountingInvariants: journalDiff.invariants
    })
  };
}

export {
  buildSelectionConsistencyProof,
  buildMaterializationVisibilityProof,
  buildMaterializationExclusions,
  buildMaterializationProof,
  buildProofWitnessManifest,
  buildAccountingPrecisionReport
};
