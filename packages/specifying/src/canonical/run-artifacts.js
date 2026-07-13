// @ts-check
// @ts-nocheck

/**
 * @typedef {import('./type-contracts.js').BuiltPromptSurface} BuiltPromptSurface
 * @typedef {import('./type-contracts.js').ParsedCompletionEnvelope} ParsedCompletionEnvelope
 *
 * @typedef {{ artifactId: string, artifactHash: string, envelopeCount: number }} ParsedCompletionEnvelopeArtifact
 * @typedef {{ outputField: string, evaluatorSurface: Record<string, unknown>, fieldProofId?: string | undefined, momentContractId?: string | undefined, evidenceRefs?: string[] | undefined }} InferenceProof
 * @typedef {{ proofHash: string, proofFamilies?: unknown[] | undefined }} ProofWitnessManifestShape
 * @typedef {{ reportHash: string }} ReportHashShape
 * @typedef {{ proofHash: string }} ProofHashShape
 * @typedef {{ proofHash: string, exclusions?: Array<{ assetId: string, exclusionClass?: string | undefined, exclusionReason?: string | undefined }> | undefined }} MaterializationExclusionsShape
 * @typedef {{ bundleId: string, boundedPublicProofHash: string, redactionStatus?: string | undefined, projectionPolicyRef?: string | undefined }} BoundedPublicProofShape
 * @typedef {{ releaseId: string }} PolicyReleaseShape
 * @typedef {{ units: unknown[] }} UnitCatalogShape
 * @typedef {{ selectedSourceMaterial: unknown[] }} SelectedSourceMaterialManifestShape
 * @typedef {{ events: unknown[] }} PipelineTelemetryShape
 * @typedef {{ uploads: unknown[] }} ArtifactUploadManifestShape
 * @typedef {{ profiles: unknown[] }} ProfileCompositionSurfaceShape
 * @typedef {{ interfaces: unknown[] }} ExternalBoundaryManifestShape
 * @typedef {{ modeledBindings: { selectedAssetGithubBindings: unknown[] }, selectedAuthSessions?: Array<{ authSessionId?: string | undefined, authPayloadHash?: string | undefined, permissionsRoot?: string | undefined }> | undefined }} GithubBoundarySurfaceShape
 * @typedef {{ records?: Array<{ zeroCreditParticipating?: boolean | undefined }> | undefined, settlementParticipatingCount?: number | undefined, zeroCreditParticipatingCount?: number | undefined }} SettlementParticipationArtifactShape
 * @typedef {{ bundleId: string, creditedAssetIds?: string[] | undefined, settlementParticipatingAssetIds?: string[] | undefined, zeroCreditAssetIds?: string[] | undefined, sourceToSharesRef?: string | undefined, settlementParticipationRef?: string | undefined }} SettlementPreviewShape
 * @typedef {{ rawShares: unknown, settledShares: unknown, totals: unknown }} JournalDiffShape
 * @typedef {{
 *   assetId: string,
 *   asset: {
 *     title: string,
 *     artifactKind: string,
 *     artifactType?: string | undefined,
 *     contentUnits: unknown[],
 *     uploadSurface?: unknown,
 *     artifactSelectionSurface?: { selectedInventoryRoot?: string | undefined, selectedInventoryEntryIds?: string[] | undefined } | undefined,
 *     addressingSurface?: { addressingRoot?: string | undefined } | undefined,
 *     signingSurface?: { payloadHash?: string | undefined } | undefined,
 *     githubAppAuthSurface?: { authPayloadHash?: string | undefined } | undefined,
 *     githubBoundary?: unknown,
 *     identitySurface?: unknown
 *   },
 *   recall: { recallScore: number, queryRepresentations: Record<string, string> },
 *   ranking: { finalRankingScore: number, explainability?: { strongestScoreDrivers?: unknown } | undefined },
 *   verification?: unknown
 * }} EvaluatedCandidate
 * @typedef {{ assetPackId: string, branchMode: string, acceptedUseTiers: string[], selectedAssets: string[] }} AssetPackShape
 * @typedef {{ assetVerification: Array<{ assetId: string, useTier: string, rights: unknown, verificationSufficiency: { recommendedUseTier: string } }> }} VerificationReportShape
 * @typedef {{ readId: string, fieldDerivations?: Record<string, unknown> | undefined, failingCases?: string[] | undefined, weakDimensions?: string[] | undefined }} ReadShape
 * @typedef {{
 *   scenarioId: string,
 *   scenarioFamily?: string | undefined,
 *   coverageTags?: string[] | undefined,
 *   repo: string,
 *   benchmarkRunId: string,
 *   benchmarkWorkflowPath?: string | undefined,
 *   benchmarkHarnessPath?: string | undefined,
 *   repoContext?: { repoTree?: unknown[] | undefined, stackHints?: string[] | undefined } | undefined,
 *   expectedTargetArtifactKinds?: string[] | undefined,
 *   canonicalRunEvidence?: {
 *     artifacts?: unknown[] | undefined,
 *     checks?: unknown[] | undefined,
 *     extractedOutputs?: {
 *       parserKind?: string | undefined,
 *       failingCases?: string[] | undefined,
 *       weakDimensions?: string[] | undefined
 *     } | undefined
 *   } | undefined
 * }} ReadScenarioShape
 * @typedef {{ readScenarios: ReadScenarioShape[], assets: Array<{ assetId: string }> }} DemoStateShape
 */

import crypto from 'node:crypto';
import { RealizationStage } from './enums.js';
import { PROFILE_A, PROFILE_B } from '../realization-profile.js';

/**
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @returns {string}
 */
function nowIso() {
  return new Date().toISOString();
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
 * @param {readonly unknown[]} [values=[]]
 * @returns {string[]}
 */
function summarizeStrings(values = []) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

/**
 * @param {string} proofFamily
 * @param {string} proofArtifactPath
 * @param {Record<string, unknown> | null | undefined} proof
 * @returns {{
 *   proofFamily: string,
 *   proofArtifactPath: string,
 *   proofHash: string | null,
 *   allTheoremsPassed: boolean,
 *   memberIds: string[],
 *   theoremIds: string[],
 *   witnessArtifactPaths: string[],
 *   replayArtifacts: string[],
 *   replaySteps: Array<{ stepId: string, theoremIds: string[], requiredArtifactPaths: string[] }>
 * }}
 */
function buildProofFamilyCatalogEntry(proofFamily, proofArtifactPath, proof) {
  const normalizedProof = /** @type {any} */ (proof || {});
  return {
    proofFamily,
    proofArtifactPath,
    proofHash: normalizedProof['proofHash'] || null,
    allTheoremsPassed: normalizedProof['allTheoremsPassed'] === true,
    memberIds: summarizeStrings((normalizedProof['memberVerdicts'] || []).map((/** @type {any} */ entry, /** @type {number} */ index) => entry?.memberId || entry?.field || `member-${index + 1}`)),
    theoremIds: summarizeStrings((normalizedProof['theoremVerdicts'] || []).map((/** @type {any} */ entry) => entry?.theoremId)),
    witnessArtifactPaths: summarizeStrings(normalizedProof['witnessArtifactPaths'] || []),
    replayArtifacts: summarizeStrings(normalizedProof['replayArtifacts'] || []),
    replaySteps: (normalizedProof['replaySteps'] || []).map((/** @type {any} */ step) => ({
      stepId: String(step?.stepId || ''),
      theoremIds: summarizeStrings(step?.theoremIds || []),
      requiredArtifactPaths: summarizeStrings(step?.requiredArtifactPaths || [])
    }))
  };
}

/**
 * @param {string} stage
 * @param {Record<string, unknown>} [payload={}]
 * @returns {{ eventId: string, stage: string, createdAt: string, profile: string, payload: Record<string, unknown> }}
 */
function telemetryEvent(stage, payload = {}) {
  return {
    eventId: `evt_${sha256(`${stage}:${canonicalJson(payload)}`).slice(0, 12)}`,
    stage,
    createdAt: nowIso(),
    profile: PROFILE_A,
    payload
  };
}

/**
 * @param {string | undefined | null} localBoundary
 * @param {string | undefined | null} externalBoundary
 */
function buildBoundaryDescriptions(localBoundary, externalBoundary) {
  return {
    localBoundary,
    externalBoundary,
    profileABoundary: localBoundary,
    profileBBoundary: externalBoundary
  };
}

/**
 * @param {readonly unknown[]} [values=[]]
 * @returns {Record<string, number>}
 */
function countValues(values = []) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const value of values) {
    const key = String(value || '').trim();
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

/**
 * @param {{
 *   read: ReadShape,
 *   evaluatedCandidates: EvaluatedCandidate[],
 *   assetPack: AssetPackShape,
 *   selectedCandidates: EvaluatedCandidate[],
 *   verificationReport: VerificationReportShape,
 *   readReview?: Record<string, unknown> | undefined,
 *   settlementPreview: SettlementPreviewShape,
 *   journalDiff: JournalDiffShape
 * }} input
 */
function buildPipelineTelemetry({ read, evaluatedCandidates, assetPack, selectedCandidates, verificationReport, readReview, settlementPreview, journalDiff }) {
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    events: [
      telemetryEvent('read-measurement', {
        readId: read.readId,
        derivationFields: Object.keys(read.fieldDerivations || {}),
        failingCases: read.failingCases,
        weakDimensions: read.weakDimensions
      }),
      telemetryEvent('read-review', {
        readId: read.readId,
        protocolFocus: readReview?.['protocolFocus'] || 'source-to-shares',
        reviewStage: readReview?.['reviewStage'] || 'post-measurement-pre-fit',
        action: readReview?.['reviewDecision']?.['action'] || readReview?.['action'] || null,
        status: readReview?.['status'] || null,
        fitSearchAdmitted: readReview?.['fitSearchAdmission']?.['admitted'] === true
      }),
      telemetryEvent('content-unit-semantics', {
        assetCount: selectedCandidates.length,
        unitCount: selectedCandidates.reduce((sum, candidate) => sum + candidate.asset.contentUnits.length, 0),
        vectorSpaces: ['task-semantic-space.v8', 'failure-mode-space.v8', 'technical-context-space.v8']
      }),
      telemetryEvent('recall-and-ranking', {
        rankedAssets: evaluatedCandidates.map((candidate) => ({
          assetId: candidate.assetId,
          recallScore: candidate.recall.recallScore,
          finalRankingScore: Number(candidate.ranking.finalRankingScore.toFixed(4)),
          strongestScoreDrivers: candidate.ranking.explainability?.strongestScoreDrivers,
          queryRepresentations: candidate.recall.queryRepresentations
        }))
      }),
      telemetryEvent('verification-and-use-tier', {
        assetVerification: verificationReport.assetVerification.map((entry) => ({
          assetId: entry.assetId,
          useTier: entry.useTier,
          rights: entry.rights,
          recommendedUseTier: entry.verificationSufficiency.recommendedUseTier
        }))
      }),
      telemetryEvent('artifact-materialization', {
        assetPackId: assetPack.assetPackId,
        branchMode: assetPack.branchMode,
        selectedAssets: assetPack.selectedAssets,
        acceptedUseTiers: assetPack.acceptedUseTiers
      }),
      telemetryEvent('settlement-and-shares', {
        bundleId: settlementPreview.bundleId,
        protocolFocus: settlementPreview?.['protocolFocus'] || 'source-to-shares',
        quantizedObjectiveContractId: settlementPreview?.['quantizedObjectiveContractId'] || null,
        fitQualityCount: settlementPreview?.['quantizedFitQualities']?.['qualities']?.length || 0,
        rawShares: journalDiff.rawShares,
        settledShares: journalDiff.settledShares,
        totals: journalDiff.totals
      })
    ]
  };
}

/**
 * @param {InferenceProof[]} inferenceProofs
 * @param {BuiltPromptSurface[]} [promptSurfaces=[]]
 * @param {ParsedCompletionEnvelope[]} [parsedCompletionEnvelopes=[]]
 * @param {ParsedCompletionEnvelopeArtifact | null} [parsedCompletionEnvelopeArtifact=null]
 */
function buildPromptImplementationSurface(
  inferenceProofs,
  promptSurfaces = [],
  parsedCompletionEnvelopes = [],
  parsedCompletionEnvelopeArtifact = null
) {
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    promptTemplates: promptSurfaces.map((surface) => ({
      promptId: surface.promptId,
      purpose: surface.purpose,
      templateVersion: surface.templateVersion,
      templateHash: surface.promptContract?.templateHash,
      contextSchemaHash: surface.promptContract?.contextSchemaHash,
      outputSchemaHash: surface.promptContract?.outputSchemaHash,
      parseContractId: surface.promptContract?.parseContractId,
      expectedOutputSchema: surface.promptContract?.expectedOutputSchema || [],
      contextInputCount: surface.contextInputs.length,
      downstreamArtifacts: surface.lineage.downstreamArtifacts,
      completenessOk: surface.promptContract?.completeness?.ok ?? false
    })),
    promptLineage: promptSurfaces.map((surface) => ({
      promptId: surface.promptId,
      derivedFrom: surface.lineage.derivedFrom,
      evidenceRefs: surface.lineage.evidenceRefs,
      outputFields: surface.lineage.outputFields,
      downstreamArtifacts: surface.lineage.downstreamArtifacts,
      placeholderSet: surface.promptContract?.placeholderSet || [],
      missingPlaceholderBindings: surface.promptContract?.missingPlaceholderBindings || [],
      nonRenderedContextFields: surface.promptContract?.nonRenderedContextFields || []
    })),
    inferredOutputs: inferenceProofs.map((proof) => ({
      outputField: proof.outputField,
      fieldProofId: proof.fieldProofId || null,
      momentContractId: proof.momentContractId || null,
      evidenceRefs: proof.evidenceRefs || [],
      evaluatorSurface: proof.evaluatorSurface
    })),
    parsedCompletionEnvelopes: parsedCompletionEnvelopes.map((envelope) => ({
      envelopeId: envelope.envelopeId,
      parseContractId: envelope.parseContractId,
      promptId: envelope.promptId,
      ownedOutputFields: envelope.ownedOutputFields,
      payloadHash: envelope.payloadHash,
      envelopeHash: envelope.envelopeHash
    })),
    parsedCompletionEnvelopeArtifact: parsedCompletionEnvelopeArtifact
      ? {
        artifactId: parsedCompletionEnvelopeArtifact.artifactId,
        artifactHash: parsedCompletionEnvelopeArtifact.artifactHash,
        envelopeCount: parsedCompletionEnvelopeArtifact.envelopeCount
      }
      : null,
    ...buildBoundaryDescriptions(
      'Deterministic/local stand-ins emulate prompt/evaluator contracts and replayability metadata.',
      'Production prompt execution, model routing, and remote trace capture remain external.'
    )
  };
}

/**
 * @param {string} readId
 * @param {string} assetPackId
 * @param {InferenceProof[]} inferenceProofs
 * @param {Record<string, unknown>} promptFamilyRegistry
 * @param {unknown[]} inferenceMomentContracts
 * @param {Record<string, unknown>} inferenceSynthesisProof
 * @param {ParsedCompletionEnvelope[]} parsedCompletionEnvelopes
 * @param {ParsedCompletionEnvelopeArtifact | null} parsedCompletionEnvelopeArtifact
 * @param {unknown} assetMeasurementProofs
 * @param {ProofHashShape} selectionConsistencyProof
 * @param {Record<string, unknown>} selectionAndMaterializationProof
 * @param {ProofHashShape} journalCompletenessProof
 * @param {ProofHashShape} identityAuthorizationProof
 * @param {ProofHashShape} sensitiveDataFlowProof
 * @param {Record<string, unknown>} authorizationAndSensitiveFlowProof
 * @param {ProofHashShape} settlementProof
 * @param {Record<string, unknown>} settlementSourceToSharesProof
 * @param {Record<string, unknown>} promptImplementationSurface
 * @param {Record<string, unknown>} promptCompletenessProof
 * @param {ProofHashShape} staticMeasurementProof
 * @param {ProofHashShape} materializationProof
 * @param {MaterializationExclusionsShape} materializationExclusions
 * @param {ProofHashShape} materializationVisibilityProof
 * @param {unknown} verificationReceiptsArtifact
 * @param {Record<string, unknown>} verificationDecisionsProof
 * @param {unknown} sourceToSharesArtifact
 * @param {SettlementParticipationArtifactShape} settlementParticipationArtifact
 * @param {ReportHashShape} accountingPrecisionReport
 * @param {ProofHashShape} redactionProof
 * @param {ProofHashShape} disclosureProof
 * @param {Record<string, unknown>} disclosureBoundaryProof
 * @param {ProofWitnessManifestShape} proofWitnessManifest
 * @param {Record<string, unknown>} proofContract
 */
function buildSystemProofBundle(
  readId,
  assetPackId,
  inferenceProofs,
  promptFamilyRegistry,
  inferenceMomentContracts,
  inferenceSynthesisProof,
  parsedCompletionEnvelopes,
  parsedCompletionEnvelopeArtifact,
  assetMeasurementProofs,
  selectionConsistencyProof,
  selectionAndMaterializationProof,
  journalCompletenessProof,
  identityAuthorizationProof,
  sensitiveDataFlowProof,
  authorizationAndSensitiveFlowProof,
  settlementProof,
  settlementSourceToSharesProof,
  promptImplementationSurface,
  promptCompletenessProof,
  staticMeasurementProof,
  materializationProof,
  materializationExclusions,
  materializationVisibilityProof,
  verificationReceiptsArtifact,
  verificationDecisionsProof,
  sourceToSharesArtifact,
  settlementParticipationArtifact,
  accountingPrecisionReport,
  redactionProof,
  disclosureProof,
  disclosureBoundaryProof,
  proofWitnessManifest,
  proofContract,
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
) {
  const proofFamilies = [
    buildProofFamilyCatalogEntry('inference-synthesis', '.bitcode/inference-synthesis-proof.json', /** @type {any} */ (inferenceSynthesisProof)),
    buildProofFamilyCatalogEntry('prompt-completeness', '.bitcode/prompt-completeness-proof.json', /** @type {any} */ (promptCompletenessProof)),
    buildProofFamilyCatalogEntry('static-code-analysis', '.bitcode/static-measurement-proof.json', /** @type {any} */ (staticMeasurementProof)),
    buildProofFamilyCatalogEntry('verification-decisions', '.bitcode/verification-decisions-proof.json', /** @type {any} */ (verificationDecisionsProof)),
    buildProofFamilyCatalogEntry('selection-and-materialization', '.bitcode/selection-and-materialization-proof.json', /** @type {any} */ (selectionAndMaterializationProof)),
    buildProofFamilyCatalogEntry('authorization-and-sensitive-flow', '.bitcode/authorization-and-sensitive-flow-proof.json', /** @type {any} */ (authorizationAndSensitiveFlowProof)),
    buildProofFamilyCatalogEntry('settlement-source-to-shares', '.bitcode/settlement-source-to-shares-proof.json', /** @type {any} */ (settlementSourceToSharesProof)),
    buildProofFamilyCatalogEntry('disclosure-boundary', '.bitcode/disclosure-boundary-proof.json', /** @type {any} */ (disclosureBoundaryProof)),
    buildProofFamilyCatalogEntry('proof-contract', '.bitcode/proof-contract.json', /** @type {any} */ (proofContract)),
    ...(bitcoinAuditAnchorProof ? [buildProofFamilyCatalogEntry('bitcoin-audit-anchor', '.bitcode/bitcoin-audit-anchor-proof.json', /** @type {any} */ (bitcoinAuditAnchorProof))] : []),
    ...(bitcoinSettlementInterfaceProof ? [buildProofFamilyCatalogEntry('bitcoin-settlement-interface', '.bitcode/bitcoin-settlement-interface-proof.json', /** @type {any} */ (bitcoinSettlementInterfaceProof))] : [])
  ];
  const verifierReplayArtifacts = summarizeStrings(proofFamilies.flatMap((entry) => entry.replayArtifacts || []));
  const verifierRequiredArtifactPaths = summarizeStrings(proofFamilies.flatMap((entry) => [
    ...(entry.replayArtifacts || []),
    ...((entry.replaySteps || []).flatMap((step) => step.requiredArtifactPaths || []))
  ]));
  return {
    readId,
    assetPackId,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    prototypeOnlyModeledControls: true,
    proofContract,
    inferenceProofs,
    promptFamilyRegistry,
    inferenceMomentContracts,
    inferenceSynthesisProof,
    parsedCompletionEnvelopes,
    parsedCompletionEnvelopeArtifact,
    assetMeasurementProofs,
    promptImplementationSurface,
    promptCompletenessProof,
    staticMeasurementProof,
    selectionConsistencyProof,
    selectionAndMaterializationProof,
    journalCompletenessProof,
    identityAuthorizationProof,
    sensitiveDataFlowProof,
    authorizationAndSensitiveFlowProof,
    materializationProof,
    materializationExclusions,
    materializationVisibilityProof,
    verificationReceiptsArtifact,
    verificationDecisionsProof,
    sourceToSharesArtifact,
    settlementParticipationArtifact,
    accountingPrecisionReport,
    redactionProof,
    disclosureProof,
    disclosureBoundaryProof,
    proofWitnessManifest,
    settlementProof,
    settlementSourceToSharesProof,
    ...(computeRealityManifest ? { computeRealityManifest } : {}),
    ...(storageRealityManifest ? { storageRealityManifest } : {}),
    ...(bitcoinCommitmentManifest ? { bitcoinCommitmentManifest } : {}),
    ...(bitcoinTreasuryPolicy ? { bitcoinTreasuryPolicy } : {}),
    ...(bitcoinAnchor ? { bitcoinAnchor } : {}),
    ...(bitcoinBoundedPublicAnchor ? { bitcoinBoundedPublicAnchor } : {}),
    ...(bitcoinSettlementIntent ? { bitcoinSettlementIntent } : {}),
    ...(bitcoinSettlementObservation ? { bitcoinSettlementObservation } : {}),
    ...(bitcoinAuditAnchorProof ? { bitcoinAuditAnchorProof } : {}),
    ...(bitcoinSettlementInterfaceProof ? { bitcoinSettlementInterfaceProof } : {}),
    proofFamilies,
    verifierEntrypoint: {
      replayArtifacts: verifierReplayArtifacts,
      requiredArtifactPaths: verifierRequiredArtifactPaths,
      proofFamilyReplayCatalog: proofFamilies.map((entry) => ({
        proofFamily: entry.proofFamily,
        theoremIds: entry.theoremIds,
        replayArtifacts: entry.replayArtifacts,
        replaySteps: entry.replaySteps
      })),
      replayInstructions: [
        'Replay inference-synthesis from moment contracts, field proofs, prompt implementation, prompt surfaces, parsed envelopes, and evaluator manifest truth.',
        'Recompute prompt completeness from the prompt family registry, prompt contracts, and parsed envelopes, then compare the proof hash.',
        'Recompute parsed completion envelopes from the prompt contracts and deterministic outputs, then compare the artifact hash.',
        'Recompute code-analysis facts and static heuristics from the code-analysis registries, then resolve all static receipt refs against the receipt artifacts.',
        'Replay verification decision closure from verification receipts into report-facing use-tier consequences.',
        'Recompute selected-vs-materialized-vs-excluded asset sets from the materialization artifacts and compare the proof hashes.',
        'Replay identity authorization and sensitive-data-flow closure from the authorization proof artifacts.',
        'Replay source-to-shares marginal contribution clipping, basis-point normalization, journal completeness, and exact micro-unit allocation from the settlement artifacts.',
        'Replay projection policy, bounded-public proof, redaction, and disclosure alignment.',
        'Replay proof-contract closure across the proof contract, witness manifest, and system proof bundle.',
        ...(bitcoinAuditAnchorProof ? ['Replay compute/storage scope derivation, root publication, and bounded-public anchor receipt closure for the bitcoin audit surface.'] : []),
        ...(bitcoinSettlementInterfaceProof ? ['Replay compute reality, payment intent, confirmation observation, and journal-binding closure for the bitcoin settlement interface surface.'] : [])
      ]
    }
  };
}

/**
 * @param {EvaluatedCandidate[]} selectedCandidates
 */
function buildArtifactUploadManifest(selectedCandidates) {
  const uploads = selectedCandidates.map((candidate) => ({
    assetId: candidate.assetId,
    title: candidate.asset.title,
    artifactKind: candidate.asset.artifactKind,
    artifactType: candidate.asset.artifactType,
    uploadSurface: candidate.asset.uploadSurface,
    artifactSelectionSurface: candidate.asset.artifactSelectionSurface,
    selectionRoot: candidate.asset.artifactSelectionSurface?.selectedInventoryRoot,
    addressingSurface: candidate.asset.addressingSurface,
    addressingRoot: candidate.asset.addressingSurface?.addressingRoot,
    signingSurface: candidate.asset.signingSurface,
    githubAppAuthSurface: candidate.asset.githubAppAuthSurface,
    authPayloadHash: candidate.asset.githubAppAuthSurface?.authPayloadHash,
    githubBoundary: candidate.asset.githubBoundary,
    identitySurface: candidate.asset.identitySurface
  }));
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    uploadCount: uploads.length,
    inventoryBackedUploadCount: uploads.filter((upload) => (upload.artifactSelectionSurface?.selectedInventoryEntryIds || []).length > 0).length,
    artifactKindCounts: countValues(uploads.map((upload) => upload.artifactKind)),
    uploads
  };
}

/**
 * @param {{
 *   branchName: string,
 *   read: ReadShape,
 *   benchmarkTarget: unknown,
 *   depositingSurface: unknown,
 *   readingSurface: unknown,
 *   depositingToReadingSurface: unknown,
 *   assetPack: AssetPackShape,
 *   assetPackLock: { assets: unknown[] },
 *   settlementPreview: SettlementPreviewShape,
 *   settlementProof: unknown,
 *   selectedSourceMaterialManifest: SelectedSourceMaterialManifestShape,
 *   policyRelease: PolicyReleaseShape,
 *   unitCatalog: UnitCatalogShape,
 *   pipelineTelemetry: PipelineTelemetryShape,
 *   identityBindings: unknown[],
 *   githubBoundarySurface: GithubBoundarySurfaceShape,
 *   artifactUploadManifest: ArtifactUploadManifestShape,
 *   profileCompositionSurface: ProfileCompositionSurfaceShape,
 *   externalBoundaryManifest: ExternalBoundaryManifestShape,
 *   promptFamilyRegistry: Record<string, unknown>,
 *   inferenceMomentContracts: unknown[],
 *   inferenceProofs: InferenceProof[],
 *   promptImplementationSurface: Record<string, unknown>,
 *   promptSurfaces: BuiltPromptSurface[],
 *   parsedCompletionEnvelopeArtifact: ParsedCompletionEnvelopeArtifact | null,
 *   v23BitcoinEnabled?: boolean | undefined
 * }} input
 */
function buildAssetPackEvidenceManifest({
  branchName,
  read,
  benchmarkTarget,
  depositingSurface,
  readingSurface,
  depositingToReadingSurface,
  assetPack,
  assetPackLock,
  settlementPreview,
  settlementProof,
  selectedSourceMaterialManifest,
  policyRelease,
  unitCatalog,
  pipelineTelemetry,
  identityBindings,
  githubBoundarySurface,
  artifactUploadManifest,
  profileCompositionSurface,
  externalBoundaryManifest,
  promptFamilyRegistry,
  inferenceMomentContracts,
  inferenceProofs,
  promptImplementationSurface,
  promptSurfaces,
  parsedCompletionEnvelopeArtifact,
  v23BitcoinEnabled = false,
  v24ExternalRealizationEnabled = false
}) {
  const v23AssetPackEvidence = v23BitcoinEnabled
    ? [
        {
          path: '.bitcode/compute-reality-manifest.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-boundaries', 'proof-bundle', 'settlement-proof']
        },
        {
          path: '.bitcode/storage-reality-manifest.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['asset-pack-evidence-manifest', 'external-boundaries', 'bounded-public-proof']
        },
        {
          path: '.bitcode/bitcoin-commitment-manifest.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['asset-pack-evidence-manifest', 'disclosure-boundary', 'proof-contract']
        },
        {
          path: '.bitcode/bitcoin-treasury-policy.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-boundaries', 'policy-release']
        },
        {
          path: '.bitcode/bitcoin-anchor.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['bitcoin-commitment-manifest', 'bitcoin-treasury-policy']
        },
        {
          path: '.bitcode/bitcoin-bounded-public-anchor.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'bounded-public-proof-metadata',
          potentiallyDisclosable: true,
          dependsOn: ['bitcoin-anchor', 'bounded-public-proof']
        },
        {
          path: '.bitcode/bitcoin-settlement-intent.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['settlement-preview', 'source-to-shares', 'bitcoin-treasury-policy']
        },
        {
          path: '.bitcode/bitcoin-settlement-observation.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['bitcoin-settlement-intent', 'bitcoin-treasury-policy']
        },
        {
          path: '.bitcode/bitcoin-audit-anchor-proof.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['bitcoin-commitment-manifest', 'bitcoin-anchor', 'bitcoin-bounded-public-anchor']
        },
        {
          path: '.bitcode/bitcoin-settlement-interface-proof.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['bitcoin-settlement-intent', 'bitcoin-settlement-observation', 'settlement-proof']
        }
      ]
    : [];
  const v24AssetPackEvidence = v24ExternalRealizationEnabled
    ? [
        {
          path: '.bitcode/external-environment-profile.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-boundaries', 'policy-release', 'asset-pack-evidence-manifest']
        },
        {
          path: '.bitcode/external-execution-policy.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-boundaries', 'policy-release']
        },
        {
          path: '.bitcode/external-telemetry-policy.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['asset-pack-evidence-manifest', 'external-execution-policy']
        },
        {
          path: '.bitcode/external-telemetry-summary.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['pipeline-telemetry', 'external-telemetry-policy', 'external-environment-profile']
        },
        {
          path: '.bitcode/network-capability-manifest.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-boundaries', 'external-environment-profile']
        },
        {
          path: '.bitcode/github-app-binding.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['github-binding', 'external-environment-profile']
        },
        {
          path: '.bitcode/bitcoin-network-intent.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-environment-profile', 'bitcoin-settlement-intent', 'external-telemetry-summary']
        },
        {
          path: '.bitcode/bitcoin-network-execution.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['bitcoin-network-intent', 'external-execution-policy', 'external-telemetry-summary']
        },
        {
          path: '.bitcode/bitcoin-network-observation.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['bitcoin-network-execution', 'bitcoin-settlement-observation', 'bitcoin-anchor']
        },
        {
          path: '.bitcode/sidechain-execution-receipt.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['bitcoin-network-observation', 'external-telemetry-summary']
        },
        {
          path: '.bitcode/compute-container-manifest.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-environment-profile', 'compute-reality-manifest']
        },
        {
          path: '.bitcode/compute-container-execution.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['compute-container-manifest', 'external-telemetry-summary']
        },
        {
          path: '.bitcode/storage-container-manifest.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['external-environment-profile', 'storage-reality-manifest']
        },
        {
          path: '.bitcode/storage-publication-receipt.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['storage-container-manifest', 'external-telemetry-summary']
        },
        {
          path: '.bitcode/storage-retrieval-receipt.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['storage-container-manifest', 'storage-publication-receipt']
        },
        {
          path: '.bitcode/github-live-session.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['github-app-binding', 'external-telemetry-summary']
        },
        {
          path: '.bitcode/github-inventory-fetch-receipt.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['github-live-session', 'github-boundary']
        },
        {
          path: '.bitcode/github-artifact-fetch-receipt.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['github-live-session', 'artifact-upload']
        },
        {
          path: '.bitcode/github-branch-publication-receipt.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['github-live-session', 'asset-pack-evidence-manifest']
        },
        {
          path: '.bitcode/github-pr-update-receipt.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['github-live-session', 'github-branch-publication-receipt']
        },
        {
          path: '.bitcode/external-realization-proof.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['bitcoin-network-intent', 'bitcoin-network-execution', 'bitcoin-network-observation', 'sidechain-execution-receipt']
        },
        {
          path: '.bitcode/container-reality-proof.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['compute-container-manifest', 'compute-container-execution', 'storage-container-manifest', 'storage-publication-receipt', 'storage-retrieval-receipt']
        },
        {
          path: '.bitcode/github-live-interface-proof.json',
          useTiersContributed: ['settlement-eligible'],
          confidentialityClass: 'private-proof-artifact',
          potentiallyDisclosable: false,
          dependsOn: ['github-app-binding', 'github-live-session', 'github-inventory-fetch-receipt', 'github-artifact-fetch-receipt', 'github-branch-publication-receipt', 'github-pr-update-receipt']
        }
      ]
    : [];
  return {
    branchName,
    readId: read.readId,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    assetPackEvidence: [
      {
        path: '.bitcode/read.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-branch-derived-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['read-measurement', 'benchmark-parser']
      },
      {
        path: '.bitcode/read-measurement.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['read-measurement', 'prompt-lineage', 'static-measurement']
      },
      {
        path: '.bitcode/read-review.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['read-measurement', 'read-review', 'pre-fit-admission']
      },
      {
        path: '.bitcode/depositing-surface.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['repo-supply-selection', 'github-binding']
      },
      {
        path: '.bitcode/reading-surface.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['read-measurement', 'benchmark-parser']
      },
      {
        path: '.bitcode/deposit-to-read-surface.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['repo-supply-selection', 'read-measurement', 'asset-pack-assembly']
      },
      {
        path: '.bitcode/benchmark-target.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'verification-evidence',
        potentiallyDisclosable: false,
        dependsOn: ['benchmark-parser']
      },
      {
        path: '.bitcode/match-report.json',
        useTiersContributed: ['rank-only', 'context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['ranking', 'candidate-recall']
      },
      {
        path: '.bitcode/verification-report.json',
        useTiersContributed: ['rank-only', 'context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'verification-evidence',
        potentiallyDisclosable: false,
        dependsOn: ['verification-determinisms', 'issuer-policy']
      },
      {
        path: '.bitcode/eval-manifest.json',
        useTiersContributed: ['rank-only', 'context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['candidate-recall', 'ranking', 'verification-determinisms', 'prompt-lineage']
      },
      {
        path: '.bitcode/asset-pack.lock.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['asset-pack-assembly']
      },
      {
        path: '.bitcode/selected-source-material.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'licensed-source-material',
        potentiallyDisclosable: false,
        dependsOn: ['asset-pack-assembly', 'source-material-binding']
      },
      {
        path: '.bitcode/authorization-decisions.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['identity-authorization', 'policy-release']
      },
      {
        path: '.bitcode/sensitive-data-flow.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['sensitive-data-flow', 'policy-release']
      },
      {
        path: '.bitcode/policy-release.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['policy-release']
      },
      {
        path: '.bitcode/identity-bindings.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['identity-authorization']
      },
      {
        path: '.bitcode/github-boundary.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['benchmark-parser', 'github-binding']
      },
      {
        path: '.bitcode/artifact-upload-manifest.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'licensed-source-material',
        potentiallyDisclosable: false,
        dependsOn: ['artifact-upload', 'content-unit-semantics']
      },
      {
        path: '.bitcode/profile-composition.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['profile-semantics']
      },
      {
        path: '.bitcode/prompt-family-registry.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['prompt-lineage', 'prompt-completeness']
      },
      {
        path: '.bitcode/prompt-surfaces.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['prompt-lineage', 'model-execution']
      },
      {
        path: '.bitcode/prompt-contracts.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['prompt-lineage', 'prompt-completeness']
      },
      {
        path: '.bitcode/inference-moment-contracts.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['prompt-lineage', 'inference-synthesis']
      },
      {
        path: '.bitcode/inference-proofs.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['prompt-lineage', 'inference-synthesis']
      },
      {
        path: '.bitcode/inference-synthesis-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['prompt-lineage', 'inference-synthesis']
      },
      {
        path: '.bitcode/prompt-implementation-surface.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['prompt-lineage', 'inference-synthesis', 'prompt-completeness']
      },
      {
        path: '.bitcode/prompt-completeness-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['prompt-lineage', 'prompt-completeness']
      },
      {
        path: '.bitcode/parsed-completion-envelopes.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['prompt-lineage', 'prompt-completeness']
      },
      {
        path: '.bitcode/code-analysis-fact-registry.json',
        useTiersContributed: ['rank-only', 'context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['read-measurement', 'ranking', 'verification']
      },
      {
        path: '.bitcode/static-heuristics-registry.json',
        useTiersContributed: ['rank-only', 'context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['read-measurement', 'ranking', 'verification']
      },
      {
        path: '.bitcode/external-boundary-manifest.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['github-binding', 'profile-semantics', 'external-boundaries']
      },
      {
        path: '.bitcode/measurement-receipts.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['static-measurement', 'verification-determinisms']
      },
      {
        path: '.bitcode/static-measurement-report.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['static-measurement', 'verification-determinisms']
      },
      {
        path: '.bitcode/static-measurement-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['measurement-receipts', 'static-measurement-report']
      },
      {
        path: '.bitcode/verification-receipts.json',
        useTiersContributed: ['rank-only', 'context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['verification-determinisms', 'issuer-policy']
      },
      {
        path: '.bitcode/verification-decisions-proof.json',
        useTiersContributed: ['rank-only', 'context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['verification-report', 'verification-receipts']
      },
      {
        path: '.bitcode/selection-consistency-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['asset-pack-assembly', 'selected-source-material']
      },
      {
        path: '.bitcode/materialization-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['asset-pack.lock', 'selected-source-material', 'materialization-visibility-proof']
      },
      {
        path: '.bitcode/selection-and-materialization-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['selection-consistency-proof', 'materialization-proof']
      },
      {
        path: '.bitcode/materialization-exclusions.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['ranking', 'asset-pack-assembly', 'materialization-proof']
      },
      {
        path: '.bitcode/proof-witness-manifest.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['proof-bundle', 'prompt-completeness', 'verification-determinisms', 'projection-policy']
      },
      {
        path: '.bitcode/materialization-visibility-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['asset-pack.lock', 'selected-source-material', 'projection-policy']
      },
      {
        path: '.bitcode/identity-authorization-proof.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['identity-bindings', 'authorization-decisions']
      },
      {
        path: '.bitcode/sensitive-data-flow-proof.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['sensitive-data-flow', 'policy-release']
      },
      {
        path: '.bitcode/authorization-and-sensitive-flow-proof.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['identity-authorization-proof', 'sensitive-data-flow-proof']
      },
      {
        path: '.bitcode/settlement-preview.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'settlement-preview',
        potentiallyDisclosable: false,
        dependsOn: ['asset-shares', RealizationStage.SETTLEMENT]
      },
      {
        path: '.bitcode/source-to-shares.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['ranking', 'asset-pack.lock', RealizationStage.SETTLEMENT]
      },
      {
        path: '.bitcode/settlement-participation.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'settlement-preview',
        potentiallyDisclosable: false,
        dependsOn: ['source-to-shares', 'asset-pack.lock', RealizationStage.SETTLEMENT]
      },
      {
        path: '.bitcode/accounting-precision-report.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['source-to-shares', 'settlement-participation', 'journal-diff']
      },
      {
        path: '.bitcode/journal-completeness-proof.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['journal-diff', RealizationStage.SETTLEMENT]
      },
      {
        path: '.bitcode/settlement-proof.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['journal-diff', 'asset-pack.lock']
      },
      {
        path: '.bitcode/settlement-source-to-shares-proof.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['source-to-shares', 'settlement-participation', 'journal-completeness-proof', 'settlement-proof']
      },
      {
        path: '.bitcode/journal-diff.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: [RealizationStage.SETTLEMENT, 'asset-pack.lock']
      },
      {
        path: '.bitcode/system-proof-bundle.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['selection-proof', 'identity-authorization', 'sensitive-data-flow', 'settlement-proof']
      },
      {
        path: '.bitcode/unit-catalog.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['content-unit-semantics', 'asset-measurement']
      },
      {
        path: '.bitcode/pipeline-telemetry.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['read-measurement', 'candidate-recall', 'ranking', 'verification', RealizationStage.SETTLEMENT]
      },
      {
        path: '.bitcode/projection-policy.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['policy-release', 'bounded-public-proof']
      },
      {
        path: '.bitcode/bounded-public-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['proof-bundle', 'bounded-public-proof']
      },
      {
        path: '.bitcode/redaction-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['projection-policy', 'bounded-public-proof']
      },
      {
        path: '.bitcode/disclosure-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['projection-policy', 'bounded-public-proof']
      },
      {
        path: '.bitcode/disclosure-boundary-proof.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['projection-policy', 'bounded-public-proof', 'redaction-proof', 'disclosure-proof']
      },
      {
        path: '.bitcode/proof-contract.json',
        useTiersContributed: ['settlement-eligible'],
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['proof-bundle', 'proof-witness-manifest']
      },
      ...v23AssetPackEvidence,
      ...v24AssetPackEvidence,
      {
        path: '.bitcode/scenario-fixture-manifest.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['read-measurement', 'profile-semantics']
      },
      {
        path: '.bitcode/test-coverage-report.json',
        useTiersContributed: ['context-only', 'patch-eligible', 'settlement-eligible'],
        confidentialityClass: 'bounded-public-proof-metadata',
        potentiallyDisclosable: true,
        dependsOn: ['scenario-fixture-manifest', 'proof-bundle', RealizationStage.SETTLEMENT]
      },
      {
        path: '.bitcode/asset-pack-evidence.json',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-proof-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['asset-pack-evidence-manifest', RealizationStage.BRANCH]
      },
      {
        path: 'BITCODE_READ.md',
        useTiersContributed: assetPack.acceptedUseTiers,
        confidentialityClass: 'private-branch-derived-artifact',
        potentiallyDisclosable: false,
        dependsOn: ['read.json', 'match-report.json', 'verification-report.json']
      }
    ],
    summary: {
      benchmarkTarget,
      assetPackId: assetPack.assetPackId,
      lockedAssetCount: assetPackLock.assets.length,
      settlementBundleId: settlementPreview.bundleId,
      policyReleaseId: policyRelease.releaseId,
      settlementProofHash: stableHashObject(settlementProof),
      selectedSourceMaterialCount: selectedSourceMaterialManifest.selectedSourceMaterial.length,
      unitCatalogCount: unitCatalog.units.length,
      telemetryEventCount: pipelineTelemetry.events.length,
      identityBindingCount: identityBindings.length,
      uploadCount: artifactUploadManifest.uploads.length,
      githubBindingCount: githubBoundarySurface.modeledBindings.selectedAssetGithubBindings.length,
      profileCount: profileCompositionSurface.profiles.length,
      promptFamilyMemberCount: Array.isArray((/** @type {any} */ (promptFamilyRegistry))?.['promptMembers']) ? (/** @type {any} */ (promptFamilyRegistry))['promptMembers'].length : 0,
      inferenceMomentContractCount: inferenceMomentContracts.length,
      inferenceProofCount: inferenceProofs.length,
      promptSurfaceCount: promptSurfaces.length,
      promptImplementationPromptCount: Array.isArray((/** @type {any} */ (promptImplementationSurface))?.['promptTemplates']) ? (/** @type {any} */ (promptImplementationSurface))['promptTemplates'].length : 0,
      parsedCompletionEnvelopeCount: parsedCompletionEnvelopeArtifact?.envelopeCount || 0,
      externalBoundaryInterfaceCount: externalBoundaryManifest.interfaces.length,
      bitcoinArtifactCount: v23BitcoinEnabled ? v23AssetPackEvidence.length : 0,
      v24ExternalArtifactCount: v24ExternalRealizationEnabled ? v24AssetPackEvidence.length : 0
    }
  };
}

/**
 * @param {DemoStateShape} state
 * @param {string | null} [activeScenarioId=null]
 */
function buildScenarioFixtureManifest(state, activeScenarioId = null) {
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    activeScenarioId,
    selectableScenarioCount: state.readScenarios.length,
    candidateAssetCount: state.assets.length,
    fixtureFamilies: [
      'GitHub workflow run envelopes',
      'GitHub artifact manifests',
      'GitHub check suites',
      'Repo trees',
      'Parser outputs',
      'Projection-safe artifact inventories',
      'Cross-language repo slices',
      'Source-to-shares normalization ledgers'
    ],
    scenarioFamilies: state.readScenarios.map((scenario) => ({
      scenarioId: scenario.scenarioId,
      scenarioFamily: scenario.scenarioFamily || 'unspecified',
      coverageTags: scenario.coverageTags || [],
      repo: scenario.repo,
      benchmarkRunId: scenario.benchmarkRunId,
      parserKind: scenario.canonicalRunEvidence?.extractedOutputs?.parserKind || 'github-actions.auth-remediation.v3',
      benchmarkWorkflowPath: scenario.benchmarkWorkflowPath,
      benchmarkHarnessPath: scenario.benchmarkHarnessPath,
      repoTreeSize: scenario.repoContext?.repoTree?.length || 0,
      stackHints: scenario.repoContext?.stackHints || [],
      targetArtifactKinds: scenario.expectedTargetArtifactKinds || [],
      artifactCount: scenario.canonicalRunEvidence?.artifacts?.length || 0,
      checkCount: scenario.canonicalRunEvidence?.checks?.length || 0,
      failingCases: scenario.canonicalRunEvidence?.extractedOutputs?.failingCases || [],
      weakDimensions: scenario.canonicalRunEvidence?.extractedOutputs?.weakDimensions || []
    })),
    negativeFixtures: [
      {
        fixtureId: 'malformed-canonical-benchmark-output',
        expectedOutcome: 'parser validation fails closed before read materialization',
        basedOnScenarioId: 'auth-issuer-rollback'
      },
      {
        fixtureId: 'restricted-or-revoked-issuer-asset',
        expectedOutcome: 'restricted assets never settle and revoked assets reject outright',
        basedOnScenarioId: 'auth-issuer-rollback'
      },
      {
        fixtureId: 'zero-credit-source-to-shares',
        expectedOutcome: 'zero-credit participation remains explicit and receipt-backed',
        basedOnScenarioId: activeScenarioId || state.readScenarios[0]?.scenarioId
      },
      {
        fixtureId: 'polyglot-cross-language-parity-gap',
        expectedOutcome: 'cross-language rollback evidence stays repo-bound and replayable across TypeScript, Python, and Rust slices',
        basedOnScenarioId: 'polyglot-gateway-benchmark-remediation'
      },
      {
        fixtureId: 'many-asset-normalization-ledger',
        expectedOutcome: 'source-to-shares tie-break and normalization ledgers remain deterministic across repeated runs',
        basedOnScenarioId: 'auth-many-asset-normalization'
      }
    ],
    proofHash: stableHashObject({
      activeScenarioId,
      scenarioIds: state.readScenarios.map((scenario) => scenario.scenarioId),
      candidateAssetIds: state.assets.map((asset) => asset.assetId)
    })
  };
}

/**
 * @param {{
 *   state: DemoStateShape,
 *   scenarioFixtureManifest: ReturnType<typeof buildScenarioFixtureManifest>,
 *   activeScenarioId: string | null,
 *   selectedCandidates: EvaluatedCandidate[],
 *   settlementParticipationArtifact: SettlementParticipationArtifactShape | null | undefined
 * }} input
 */
function buildTestCoverageReport({ state, scenarioFixtureManifest, activeScenarioId, selectedCandidates, settlementParticipationArtifact }) {
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    activeScenarioId,
    declaredCoverageTargets: [
      'layered unit, integration, and e2e validation stays explicit in emitted runtime coverage',
      'prompt completeness mismatches fail closed',
      'static code analysis and verification receipts resolve',
      'projection policy enforces bounded public proof surfaces',
      'proof witness manifest digests proof-relevant artifacts',
      'source-to-shares precision stays replayable through journal settlement',
      'scenario corpus covers GitHub-shaped, privacy, issuer-policy, and deployment stress cases',
      'V18 generated proof-member, theorem-evidence, and state-machine matrices execute as source/integration proof exhaustiveness'
    ],
    suiteCoverage: {
      unit: {
        entrypoints: ['test/core.test.js', 'test/proven-generator.test.js'],
        runner: 'node --test',
        validates: [
          'core surface contracts and deterministic invariants',
          'asset-pack, proof, projection, and settlement consistency',
          'canonical appendix generator and proof-family catalog stability',
          'assetPackEvidence and branch artifact completeness'
        ]
      },
      integration: {
        entrypoints: ['test/api.test.js', 'test/workflow.integration.test.js', 'test/state-machine.integration.test.js'],
        runner: 'node --test',
        validates: [
          'HTTP boundary behavior, malformed input handling, and persistence safety',
          'repo-authenticated deposit to branch-realization workflow composition',
          'mixed raw/repo-backed deposit composition before branch realization',
          'projection-sensitive and normalization-heavy multi-step run behavior',
          'stateful repeated runs, no-survivor conflicts, reset recovery, and full principal projection-matrix behavior'
        ]
      },
      generatedMatrices: {
        entrypoints: [
          'test/proof-member-matrix.test.js',
          'test/theorem-evidence-matrix.test.js',
          'test/state-machine.integration.test.js'
        ],
        runner: 'node --test',
        requiredForV18Canon: true,
        validates: [
          'V18 proof-member semantic matrix: 45 members x 8 scenarios x 2 branch modes = 720 cells',
          'V18 theorem evidence matrix: 57 theorems x 8 scenarios x 2 branch modes = 912 cells',
          'V18 state-machine matrix: repeated-run, reset-after-run, mixed-deposit, and no-survivor workflow cells = 200 cells',
          'generated matrix artifacts expose predicate ids, evidence paths, evidence digest refs, pass/fail, and failure reasons'
        ],
        matrixCellCounts: {
          proofMemberSemantic: 720,
          theoremEvidence: 912,
          stateMachine: 200,
          total: 1832
        }
      },
      e2e: {
        entrypoint: 'test/e2e.test.js',
        runner: 'node --test',
        browserHarness: 'playwright/chromium',
        requiredForDemoCanon: true,
        validates: [
          'canonical panel ordering from repo supply through settlement',
          'repo-authenticated deposit flow to targeted settlement',
          'normalization-heavy scenario switching and source-to-shares visibility',
          'full 8 scenario x 2 branch mode x 4 projection-principal operator matrix',
          'exact browser-visible projection artifact inventories from the projection policy',
          'browser-visible invalid deposit recovery, no-survivor conflict recovery, repeated-run refresh, and projection-bounded proof visibility'
        ]
      }
    },
    adversarialCoverage: {
      malformedGithubArtifactFixturePresent: scenarioFixtureManifest.negativeFixtures.some((fixture) => fixture.fixtureId === 'malformed-canonical-benchmark-output'),
      privacyBoundaryScenarioPresent: state.readScenarios.some((scenario) => (scenario.coverageTags || []).includes('privacy-boundary') || scenario.scenarioFamily === 'privacy-boundary-stress'),
      proofHeavyScenarioPresent: state.readScenarios.some((scenario) => scenario.scenarioFamily === 'proof-heavy-rust-validator'),
      polyglotRepoScenarioPresent: state.readScenarios.some((scenario) => scenario.scenarioFamily === 'polyglot-repo-benchmark-remediation'),
      manyAssetNormalizationScenarioPresent: state.readScenarios.some((scenario) => scenario.scenarioFamily === 'many-asset-settlement-normalization'),
      manyAssetSettlementCorpusPresent: state.assets.length >= 6,
      zeroCreditParticipationObservedInLatestRun: (settlementParticipationArtifact?.records || []).some((record) => record.zeroCreditParticipating)
    },
    latestRunCoverage: {
      selectedAssetCount: selectedCandidates.length,
      settlementParticipatingCount: settlementParticipationArtifact?.settlementParticipatingCount || 0,
      zeroCreditParticipatingCount: settlementParticipationArtifact?.zeroCreditParticipatingCount || 0,
      scenarioFamilyCount: scenarioFixtureManifest.scenarioFamilies.length,
      coverageTagCount: new Set(state.readScenarios.flatMap((scenario) => scenario.coverageTags || [])).size
    },
    reportHash: stableHashObject({
      activeScenarioId,
      scenarioFamilyCount: scenarioFixtureManifest.scenarioFamilies.length,
      selectedAssetCount: selectedCandidates.length,
      settlementParticipatingCount: settlementParticipationArtifact?.settlementParticipatingCount || 0
    })
  };
}

export {
  buildPipelineTelemetry,
  buildPromptImplementationSurface,
  buildSystemProofBundle,
  buildArtifactUploadManifest,
  buildAssetPackEvidenceManifest,
  buildScenarioFixtureManifest,
  buildTestCoverageReport
};
