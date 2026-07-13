// @ts-check
// @ts-nocheck

/**
 * @typedef {{
 *   authSessionId: string,
 *   authMechanism?: string | undefined,
 *   appId?: string | number | undefined,
 *   appSlug?: string | undefined,
 *   installationId?: string | number | undefined,
 *   installationAccountLogin?: string | undefined,
 *   installationAccountId?: string | number | undefined,
 *   installationAccountNodeId?: string | undefined,
 *   installationAccountType?: string | undefined,
 *   operatorLogin?: string | undefined,
 *   repo?: string | undefined,
 *   owner?: string | undefined,
 *   repoName?: string | undefined,
 *   repositoryId?: string | number | undefined,
 *   repositoryNodeId?: string | undefined,
 *   repositoryVisibility?: string | undefined,
 *   repositorySelection?: string | undefined,
 *   permissions?: Record<string, unknown> | undefined,
 *   permissionsRoot?: string | undefined,
 *   defaultRef?: string | undefined,
 *   defaultSignerAddress?: string | undefined,
 *   signingAlgorithm?: string | undefined,
 *   keySource?: string | undefined,
 *   sessionIssuedAt?: string | undefined,
 *   sessionExpiresAt?: string | undefined,
 *   tokenBoundary?: string | undefined,
 *   authPayloadHash?: string | undefined,
 *   localBoundary?: string | undefined,
 *   externalBoundary?: string | undefined,
 *   profileABoundary?: string | undefined,
 *   profileBBoundary?: string | undefined
 * }} SessionShape
 *
 * @typedef {{
 *   inventoryEntryId: string,
 *   repo?: string | undefined,
 *   artifactKind?: string | undefined,
 *   artifactType?: string | undefined,
 *   originKind?: string | undefined,
 *   title?: string | undefined,
 *   summary?: string | undefined,
 *   ref?: string | undefined,
 *   sourceCommit?: string | undefined,
 *   sourcePath?: string | undefined,
 *   sourcePaths?: string[] | undefined,
 *   workflowRunId?: string | undefined,
 *   workflowPath?: string | undefined,
 *   workflowJobName?: string | undefined,
 *   checkSuiteId?: string | undefined,
 *   artifactName?: string | undefined,
 *   tags?: string[] | undefined,
 *   declaredStacks?: string[] | undefined,
 *   declaredConstraints?: string[] | undefined,
 *   previewSurface?: string | undefined,
 *   signerAddress?: string | undefined,
 *   owner?: string | undefined,
 *   repoName?: string | undefined,
 *   repositoryId?: string | number | undefined,
 *   repositoryNodeId?: string | undefined,
 *   authSessionId?: string | undefined,
 *   installationId?: string | number | undefined,
 *   installationAccountLogin?: string | undefined,
 *   installationAccountId?: string | number | undefined,
 *   installationAccountNodeId?: string | undefined,
 *   contentRoot?: string | undefined,
 *   addressing?: unknown,
 *   authBinding?: unknown,
 *   provenance?: unknown
 * }} RepoArtifactInventoryEntryShape
 *
 * @typedef {{
 *   assetId: string,
 *   title: string,
 *   artifactKind: string,
 *   metadata: { summary?: string | undefined, tags?: string[] | undefined, issuerPolicyStatus?: string | undefined },
 *   attestations: Array<{ signerAddress?: string | undefined }>
 * }} AssetSummaryShape
 *
 * @typedef {{
 *   scenarioId: string,
 *   scenarioFamily?: string | undefined,
 *   coverageTags?: string[] | undefined,
 *   repo: string,
 *   baseRef: string,
 *   expectedTask?: string | undefined,
 *   realizationProfileId?: string | undefined,
 *   canonicalRunEvidence?: { extractedOutputs?: { parserKind?: string | undefined } | undefined } | undefined
 * }} ReadScenarioShape
 *
 * @typedef {{
 *   readId: string,
 *   repo: string,
 *   benchmarkRunId?: string | undefined,
 *   benchmarkHarnessPath?: string | undefined,
 *   benchmarkWorkflowPath?: string | undefined,
 *   benchmarkParserContract?: unknown,
 *   task?: string | undefined,
 *   failureModes?: string[] | undefined,
 *   constraints?: string[] | undefined,
 *   closureCriteria?: string[] | undefined,
 *   targetArtifactKinds?: string[] | undefined,
 *   touchedPaths?: string[] | undefined,
 *   failingCases?: string[] | undefined,
 *   weakDimensions?: string[] | undefined,
 *   fieldDerivations?: unknown,
 *   conformanceProfile?: string | undefined,
 *   productionIntentProfile?: string | undefined,
 *   realizationProfile?: unknown
 * }} ReadPreviewShape
 *
 * @typedef {{
 *   assetId: string,
 *   title: string,
 *   artifactKind: string,
 *   useTier: string,
 *   ranking: unknown,
 *   verification: unknown,
 *   rights: unknown
 * }} LatestRunCandidateShape
 *
 * @typedef {{
 *   createdAt?: string | undefined,
 *   scenarioId?: string | undefined,
 *   branchMode?: string | undefined,
 *   paymentMode?: string | null | undefined,
 *   branchArtifacts?: { branchName?: string | undefined, branchMode?: string | undefined, confidentiality?: string | undefined, files?: Record<string, string> | undefined } | undefined,
 *   conformanceProfile?: string | undefined,
 *   productionIntentProfile?: string | undefined,
 *   realizationProfile?: unknown,
 *   readLifecycle?: unknown,
 *   read?: ReadPreviewShape | null | undefined,
 *   depositingSurface?: unknown,
 *   readingSurface?: unknown,
 *   depositingToReadingSurface?: unknown,
 *   matchReport?: unknown,
 *   assetPack?: { assetPackId?: string | undefined, branchMode?: string | undefined, selectedAssets?: string[] | undefined } | undefined,
 *   evaluatedCandidates?: LatestRunCandidateShape[] | undefined,
 *   repoToSettlementSurface?: unknown,
 *   boundedPublicProof?: unknown,
 *   promptCompletenessProof?: unknown,
 *   verificationDecisionsProof?: unknown,
 *   selectionConsistencyProof?: unknown,
 *   selectionAndMaterializationProof?: unknown,
 *   journalCompletenessProof?: unknown,
 *   identityAuthorizationProof?: unknown,
 *   sensitiveDataFlowProof?: unknown,
 *   authorizationAndSensitiveFlowProof?: unknown,
 *   settlementSourceToSharesProof?: unknown,
 *   codeAnalysisFactRegistry?: unknown,
 *   staticHeuristicsRegistry?: unknown,
 *   staticMeasurementReport?: unknown,
 *   staticMeasurementProof?: unknown,
 *   materializationProof?: unknown,
 *   materializationExclusions?: unknown,
 *   materializationVisibilityProof?: unknown,
 *   scenarioFixtureManifest?: unknown,
 *   testCoverageReport?: unknown,
 *   projectionPolicy?: { publicArtifactPaths?: string[] | undefined, privateArtifactPaths?: string[] | undefined } | undefined,
 *   redactionProof?: unknown,
 *   disclosureProof?: unknown,
 *   readMeasurement?: unknown,
 *   readReview?: unknown,
 *   promptContracts?: unknown,
 *   promptSurfaces?: unknown,
 *   promptFamilyRegistry?: unknown,
 *   inferenceMomentContracts?: unknown,
 *   inferenceProofs?: unknown,
 *   inferenceSynthesisProof?: unknown,
 *   parsedCompletionEnvelopes?: unknown,
 *   parsedCompletionEnvelopeArtifact?: unknown,
 *   promptImplementationSurface?: unknown,
 *   verificationReport?: unknown,
 *   identityAuthSpineSurface?: unknown,
 *   evalManifest?: unknown,
 *   assetPackLock?: unknown,
 *   identityBindings?: unknown,
 *   authorizationDecisions?: unknown,
 *   sensitiveDataFlowRecords?: unknown,
 *   githubBoundarySurface?: unknown,
 *   artifactUploadManifest?: unknown,
 *   profileCompositionSurface?: unknown,
 *   externalBoundaryManifest?: unknown,
 *   assetPackEvidenceManifest?: unknown,
 *   unitCatalog?: unknown,
 *   pipelineTelemetry?: unknown,
 *   measurementReceipts?: unknown,
 *   verificationReceipts?: unknown,
 *   proofWitnessManifest?: unknown,
 *   sourceToSharesArtifact?: unknown,
 *   settlementParticipationArtifact?: unknown,
 *   accountingPrecisionReport?: unknown,
 *   settlementPreview?: unknown,
 *   journalDiff?: unknown,
 *   computeRealityManifest?: unknown,
 *   storageRealityManifest?: unknown,
 *   bitcoinCommitmentManifest?: unknown,
 *   bitcoinTreasuryPolicy?: unknown,
 *   bitcoinAnchor?: unknown,
 *   bitcoinBoundedPublicAnchor?: unknown,
 *   bitcoinSettlementIntent?: unknown,
 *   bitcoinSettlementObservation?: unknown,
 *   bitcoinAuditAnchorProof?: unknown,
 *   bitcoinSettlementInterfaceProof?: unknown,
 *   systemProofBundle?: unknown,
 *   proofContract?: unknown
 * }} LatestRunShape
 *
 * @typedef {{
 *   specVersion?: string | undefined,
 *   canonPosture?: Record<string, unknown> | undefined,
 *   buyers: unknown[],
 *   githubAppSessions?: SessionShape[] | undefined,
 *   repoArtifactInventory?: RepoArtifactInventoryEntryShape[] | undefined,
 *   readScenarios: ReadScenarioShape[],
 *   assets: AssetSummaryShape[],
 *   ledger: unknown,
 *   latestRun?: LatestRunShape | null | undefined,
 *   runHistory?: unknown[] | undefined,
 *   policyState?: unknown,
 *   conformanceProfiles?: {
 *     active?: string | undefined,
 *     productionIntent?: string | undefined,
 *     prototypeOnlyModeledControls?: boolean | undefined
 *   } | undefined
 * }} DemoStateShape
 *
 * @typedef {{
 *   ensureProjectionPrincipal: (principal: string) => string,
 *   buildRepoSupplySurface: (state: DemoStateShape) => unknown,
 *   buildBoundaryRealitySurface: () => unknown,
 *   buildPolicyState: () => unknown,
 *   buildPolicyRelease: (policyState: unknown) => unknown,
 *   buildReadDescriptor: (scenario: ReadScenarioShape) => ReadPreviewShape,
 *   buildReadingSurface: (readPreview: Record<string, unknown>) => unknown,
 *   nowIso: () => string
 * }} PublicStateBuilderOptions
 */

import { PROFILE_A, PROFILE_B, buildRealizationProfile } from './realization-profile.js';
import { CURRENT_CANON_POSTURE } from './canon-posture.js';

/**
 * @param {string | undefined} localBoundary
 * @param {string | undefined} externalBoundary
 * @returns {Record<string, string | undefined>}
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
 * @returns {Record<string, unknown>}
 */
export function buildProfileCompositions() {
  const profiles = ['A', 'B'].map((profileId) => {
    const profile = buildRealizationProfile(profileId);
    return {
      ...profile,
      switchableInDemo: true,
      metadata: {
        depositMode: profile.depositMode,
        readMode: profile.readMode,
        assetPackShape: profile.assetPackShape,
        settlementShape: profile.settlementShape,
        boundaryTruthNote: profile.boundaryRealityNote
      }
    };
  });

  return {
    activeProfile: 'A',
    distinctionBasis: 'deposit-and-read',
    demoOperatorGuidance: {
      audienceMeaning: 'The current realization profiles distinguish how Bitcode deposits supply against read. They are not a local-vs-GitHub toggle.',
      boundaryTruthPlacement: 'Boundary reality, GitHub boundary, and external boundary surfaces keep live/not-live truth explicit. The profile headline now explains deposit mode, read mode, and fit first.',
      recommendedWalkthrough: [
        'Start with repo supply and pick a targeted-deposit scenario to show a bounded read.',
        'Deposit or inspect a small decisive asset set, then run the branch flow to show tight closure.',
        'Switch to a normalization-heavy scenario to show overlapping deposits and broader settlement logic.',
        'Use boundary reality and GitHub boundary surfaces only after the deposit/read contrast is clear.',
        'Close on proof bundle, source-to-shares, and settlement invariants.'
      ]
    },
    profiles,
    boundaryTruthSurfaces: ['boundaryRealitySurface', 'githubBoundarySurface', 'externalBoundaryManifest'],
    comparisonAxes: ['deposit mode', 'read mode', 'asset-pack shape', 'settlement shape', 'boundary hand-off']
  };
}

/**
 * @param {ReadPreviewShape | null | undefined} read
 * @returns {ReadPreviewShape | null}
 */
function minimalReadProjection(read) {
  if (!read) return null;
  return {
    readId: read.readId,
    repo: read.repo,
    benchmarkRunId: read.benchmarkRunId,
    benchmarkHarnessPath: read.benchmarkHarnessPath,
    benchmarkWorkflowPath: read.benchmarkWorkflowPath,
    benchmarkParserContract: read.benchmarkParserContract,
    task: read.task,
    failureModes: read.failureModes,
    constraints: read.constraints,
    closureCriteria: read.closureCriteria,
    targetArtifactKinds: read.targetArtifactKinds,
    touchedPaths: read.touchedPaths,
    failingCases: read.failingCases,
    weakDimensions: read.weakDimensions,
    fieldDerivations: read.fieldDerivations,
    conformanceProfile: read.conformanceProfile,
    productionIntentProfile: read.productionIntentProfile,
    realizationProfile: read.realizationProfile
  };
}

/**
 * @param {LatestRunCandidateShape} candidate
 * @returns {LatestRunCandidateShape}
 */
function minimalCandidateProjection(candidate) {
  return {
    assetId: candidate.assetId,
    title: candidate.title,
    artifactKind: candidate.artifactKind,
    useTier: candidate.useTier,
    ranking: candidate.ranking,
    verification: candidate.verification,
    rights: candidate.rights
  };
}

/**
 * @param {LatestRunShape | null | undefined} latestRun
 * @returns {Record<string, unknown> | null}
 */
function buildPublicProjection(latestRun) {
  if (!latestRun) return null;
  return {
    projectionPrincipal: 'public',
    createdAt: latestRun.createdAt,
    scenarioId: latestRun.scenarioId,
    branchMode: latestRun.branchMode,
    paymentMode: latestRun.paymentMode || null,
    branchName: latestRun.branchArtifacts?.branchName,
    conformanceProfile: latestRun.conformanceProfile,
    productionIntentProfile: latestRun.productionIntentProfile,
    realizationProfile: latestRun.realizationProfile,
    readLifecycle: latestRun.readLifecycle,
    read: minimalReadProjection(latestRun.read),
    depositingSurface: latestRun.depositingSurface,
    readingSurface: latestRun.readingSurface,
    depositingToReadingSurface: latestRun.depositingToReadingSurface,
    matchReport: latestRun.matchReport,
    assetPack: {
      assetPackId: latestRun.assetPack?.assetPackId,
      branchMode: latestRun.assetPack?.branchMode,
      selectedAssets: latestRun.assetPack?.selectedAssets || []
    },
    evaluatedCandidates: (latestRun.evaluatedCandidates || []).map(minimalCandidateProjection),
    repoToSettlementSurface: latestRun.repoToSettlementSurface,
    boundedPublicProof: latestRun.boundedPublicProof,
    promptCompletenessProof: latestRun.promptCompletenessProof,
    codeAnalysisFactRegistry: latestRun.codeAnalysisFactRegistry,
    staticHeuristicsRegistry: latestRun.staticHeuristicsRegistry,
    staticMeasurementReport: latestRun.staticMeasurementReport,
    staticMeasurementProof: latestRun.staticMeasurementProof,
    materializationProof: latestRun.materializationProof,
    materializationVisibilityProof: latestRun.materializationVisibilityProof,
    scenarioFixtureManifest: latestRun.scenarioFixtureManifest,
    testCoverageReport: latestRun.testCoverageReport,
    projectionPolicy: latestRun.projectionPolicy,
    redactionProof: latestRun.redactionProof,
    disclosureProof: latestRun.disclosureProof,
    externalRealizationSummary: buildPublicExternalRealizationSummary(latestRun),
    branchArtifacts: {
      branchName: latestRun.branchArtifacts?.branchName,
      branchMode: latestRun.branchArtifacts?.branchMode,
      confidentiality: latestRun.branchArtifacts?.confidentiality,
      publicFiles: Object.fromEntries(Object.entries(latestRun.branchArtifacts?.files || {}).filter(([path]) => latestRun.projectionPolicy?.publicArtifactPaths?.includes(path)))
    },
    publicArtifacts: {
      '.bitcode/bounded-public-proof.json': latestRun.boundedPublicProof,
      ...(latestRun.bitcoinBoundedPublicAnchor ? { '.bitcode/bitcoin-bounded-public-anchor.json': latestRun.bitcoinBoundedPublicAnchor } : {}),
      '.bitcode/reading-surface.json': latestRun.readingSurface,
      '.bitcode/deposit-to-read-surface.json': latestRun.depositingToReadingSurface,
      '.bitcode/match-report.json': latestRun.matchReport,
      '.bitcode/prompt-completeness-proof.json': latestRun.promptCompletenessProof,
      '.bitcode/code-analysis-fact-registry.json': latestRun.codeAnalysisFactRegistry,
      '.bitcode/static-heuristics-registry.json': latestRun.staticHeuristicsRegistry,
      '.bitcode/static-measurement-report.json': latestRun.staticMeasurementReport,
      '.bitcode/static-measurement-proof.json': latestRun.staticMeasurementProof,
      '.bitcode/materialization-proof.json': latestRun.materializationProof,
      '.bitcode/materialization-visibility-proof.json': latestRun.materializationVisibilityProof,
      '.bitcode/scenario-fixture-manifest.json': latestRun.scenarioFixtureManifest,
      '.bitcode/test-coverage-report.json': latestRun.testCoverageReport,
      '.bitcode/projection-policy.json': latestRun.projectionPolicy,
      '.bitcode/redaction-proof.json': latestRun.redactionProof,
      '.bitcode/disclosure-proof.json': latestRun.disclosureProof
    }
  };
}

/**
 * @param {LatestRunShape | null | undefined} latestRun
 * @returns {Record<string, unknown> | undefined}
 */
function buildPublicExternalRealizationSummary(latestRun) {
  if (!latestRun?.externalEnvironmentProfile || !latestRun?.externalTelemetrySummary) return undefined;
  const interfaceSummaryById = Object.fromEntries(
    (latestRun.externalTelemetrySummary.interfaceSummaries || []).map((entry) => [entry.interfaceId, entry])
  );
  const bindingByInterfaceId = {
    'bitcoin-mainchain-execution': latestRun.externalEnvironmentProfile.activeBindings?.bitcoinMainchain || {},
    'sidechain-execution': latestRun.externalEnvironmentProfile.activeBindings?.sidechain || {},
    'compute-container-execution': latestRun.externalEnvironmentProfile.activeBindings?.compute || {},
    'storage-container-execution': latestRun.externalEnvironmentProfile.activeBindings?.storage || {},
    'github-live-interface': latestRun.externalEnvironmentProfile.activeBindings?.github || {}
  };
  const interfaceStates = (latestRun.externalBoundaryManifest?.interfaces || [])
    .filter((entry) => interfaceSummaryById[entry.interfaceId])
    .map((entry) => ({
      interfaceId: entry.interfaceId,
      label: entry.label,
      status: entry.status,
      runtimeState: interfaceSummaryById[entry.interfaceId]?.runtimeState || null,
      missingSecretEnvKeys: interfaceSummaryById[entry.interfaceId]?.missingSecretEnvKeys || [],
      executionClass: interfaceSummaryById[entry.interfaceId]?.executionClass || null,
      executorKind: bindingByInterfaceId[entry.interfaceId]?.executorKind || null,
      authMode: interfaceSummaryById[entry.interfaceId]?.authMode || null,
      transportProtocol: interfaceSummaryById[entry.interfaceId]?.transportProtocol || null,
      remoteAuthExchangeCount: interfaceSummaryById[entry.interfaceId]?.remoteAuthExchangeCount || null,
      reconciliationState: interfaceSummaryById[entry.interfaceId]?.reconciliationState || null,
      continuityState: interfaceSummaryById[entry.interfaceId]?.continuityState || null,
      observationSequence: interfaceSummaryById[entry.interfaceId]?.observationSequence || null,
      telemetryCoverageState: interfaceSummaryById[entry.interfaceId]?.telemetryCoverageState || null
    }));
  return {
    configuredEnvironmentMode: latestRun.externalEnvironmentProfile.configuredEnvironmentMode,
    actualityDisposition: latestRun.externalEnvironmentProfile.actualityDisposition,
    demonstrationToggleState: latestRun.externalEnvironmentProfile.demonstrationToggleState,
    supportedEnvironmentModes: latestRun.externalEnvironmentProfile.supportedEnvironmentModes,
    interfaceIds: (latestRun.networkCapabilityManifest?.interfaces || []).map((entry) => entry.interfaceId),
    interfaceStates,
    surfacedAcross: latestRun.externalTelemetrySummary.surfacedAcross || []
  };
}

/**
 * @param {LatestRunShape | null | undefined} latestRun
 * @returns {Record<string, unknown> | undefined}
 */
function buildReviewerExternalRealizationSummary(latestRun) {
  if (!latestRun?.externalEnvironmentProfile || !latestRun?.externalTelemetrySummary) return undefined;
  const interfaceSummaryById = Object.fromEntries(
    (latestRun.externalTelemetrySummary.interfaceSummaries || []).map((entry) => [entry.interfaceId, entry])
  );
  const bindingByInterfaceId = {
    'bitcoin-mainchain-execution': latestRun.externalEnvironmentProfile.activeBindings?.bitcoinMainchain || {},
    'sidechain-execution': latestRun.externalEnvironmentProfile.activeBindings?.sidechain || {},
    'compute-container-execution': latestRun.externalEnvironmentProfile.activeBindings?.compute || {},
    'storage-container-execution': latestRun.externalEnvironmentProfile.activeBindings?.storage || {},
    'github-live-interface': latestRun.externalEnvironmentProfile.activeBindings?.github || {}
  };
  return {
    configuredEnvironmentMode: latestRun.externalEnvironmentProfile.configuredEnvironmentMode,
    actualityDisposition: latestRun.externalEnvironmentProfile.actualityDisposition,
    branchBinding: latestRun.externalExecutionPolicy?.branchBinding,
    isolationDisposition: latestRun.externalExecutionPolicy?.isolationDisposition,
    coverageExpectation: latestRun.externalTelemetryPolicy?.coverageExpectation,
    interfaceSummaries: (latestRun.externalBoundaryManifest?.interfaces || [])
      .filter((entry) => interfaceSummaryById[entry.interfaceId])
      .map((entry) => ({
        interfaceId: entry.interfaceId,
        label: entry.label,
        status: entry.status,
        localPrototypeImplemented: entry.localPrototype?.implemented === true,
        externalBoundaryRequiredForLive: entry.externalBoundary?.requiredForLive === true,
        runtimeState: interfaceSummaryById[entry.interfaceId]?.runtimeState || null,
        missingBindingKeys: interfaceSummaryById[entry.interfaceId]?.missingBindingKeys || [],
        missingSecretEnvKeys: interfaceSummaryById[entry.interfaceId]?.missingSecretEnvKeys || [],
        executionClass: interfaceSummaryById[entry.interfaceId]?.executionClass || null,
        executorKind: bindingByInterfaceId[entry.interfaceId]?.executorKind || null,
        authMode: interfaceSummaryById[entry.interfaceId]?.authMode || null,
        transportProtocol: interfaceSummaryById[entry.interfaceId]?.transportProtocol || null,
        remoteRequestCount: interfaceSummaryById[entry.interfaceId]?.remoteRequestCount || null,
        remoteAuthExchangeCount: interfaceSummaryById[entry.interfaceId]?.remoteAuthExchangeCount || null,
        reconciliationState: interfaceSummaryById[entry.interfaceId]?.reconciliationState || null,
        continuityState: interfaceSummaryById[entry.interfaceId]?.continuityState || null,
        observationSequence: interfaceSummaryById[entry.interfaceId]?.observationSequence || null,
        priorObservationId: interfaceSummaryById[entry.interfaceId]?.priorObservationId || null,
        resultClass: interfaceSummaryById[entry.interfaceId]?.resultClass || null,
        telemetryCoverageState: interfaceSummaryById[entry.interfaceId]?.telemetryCoverageState || null,
        affectedArtifactRefs: interfaceSummaryById[entry.interfaceId]?.affectedArtifactRefs || []
      })),
    targetedRepoCount: latestRun.githubAppBinding?.targetedRepoCount || 0
  };
}

/**
 * @param {LatestRunShape | null | undefined} latestRun
 * @returns {Record<string, unknown> | null}
 */
function buildBuyerProjection(latestRun) {
  if (!latestRun) return null;
  return {
    ...buildPublicProjection(latestRun),
    projectionPrincipal: 'buyer',
    readMeasurement: latestRun.readMeasurement,
    readReview: latestRun.readReview,
    promptFamilyRegistry: latestRun.promptFamilyRegistry,
    inferenceMomentContracts: latestRun.inferenceMomentContracts,
    inferenceProofs: latestRun.inferenceProofs,
    inferenceSynthesisProof: latestRun.inferenceSynthesisProof,
    promptContracts: latestRun.promptContracts,
    promptSurfaces: latestRun.promptSurfaces,
    parsedCompletionEnvelopes: latestRun.parsedCompletionEnvelopes,
    parsedCompletionEnvelopeArtifact: latestRun.parsedCompletionEnvelopeArtifact,
    promptImplementationSurface: latestRun.promptImplementationSurface,
    verificationReport: latestRun.verificationReport,
    verificationDecisionsProof: latestRun.verificationDecisionsProof,
    identityAuthSpineSurface: latestRun.identityAuthSpineSurface,
    evalManifest: latestRun.evalManifest,
    assetPackLock: latestRun.assetPackLock,
    identityBindings: latestRun.identityBindings,
    authorizationDecisions: latestRun.authorizationDecisions,
    sensitiveDataFlowRecords: latestRun.sensitiveDataFlowRecords,
    githubBoundarySurface: latestRun.githubBoundarySurface,
    artifactUploadManifest: latestRun.artifactUploadManifest,
    profileCompositionSurface: latestRun.profileCompositionSurface,
    externalBoundaryManifest: latestRun.externalBoundaryManifest,
    assetPackEvidenceManifest: latestRun.assetPackEvidenceManifest,
    unitCatalog: latestRun.unitCatalog,
    pipelineTelemetry: latestRun.pipelineTelemetry,
    measurementReceipts: latestRun.measurementReceipts,
    verificationReceipts: latestRun.verificationReceipts,
    materializationProof: latestRun.materializationProof,
    materializationExclusions: latestRun.materializationExclusions,
    materializationVisibilityProof: latestRun.materializationVisibilityProof,
    selectionConsistencyProof: latestRun.selectionConsistencyProof,
    selectionAndMaterializationProof: latestRun.selectionAndMaterializationProof,
    proofWitnessManifest: latestRun.proofWitnessManifest,
    sourceToSharesArtifact: latestRun.sourceToSharesArtifact,
    settlementParticipationArtifact: latestRun.settlementParticipationArtifact,
    accountingPrecisionReport: latestRun.accountingPrecisionReport,
    journalCompletenessProof: latestRun.journalCompletenessProof,
    identityAuthorizationProof: latestRun.identityAuthorizationProof,
    sensitiveDataFlowProof: latestRun.sensitiveDataFlowProof,
    authorizationAndSensitiveFlowProof: latestRun.authorizationAndSensitiveFlowProof,
    settlementSourceToSharesProof: latestRun.settlementSourceToSharesProof,
    scenarioFixtureManifest: latestRun.scenarioFixtureManifest,
    testCoverageReport: latestRun.testCoverageReport,
    settlementPreview: latestRun.settlementPreview,
    journalDiff: latestRun.journalDiff,
    externalRealizationSummary: buildReviewerExternalRealizationSummary(latestRun),
    computeRealityManifest: latestRun.computeRealityManifest,
    storageRealityManifest: latestRun.storageRealityManifest,
    bitcoinCommitmentManifest: latestRun.bitcoinCommitmentManifest,
    bitcoinTreasuryPolicy: latestRun.bitcoinTreasuryPolicy,
    bitcoinAnchor: latestRun.bitcoinAnchor,
    bitcoinBoundedPublicAnchor: latestRun.bitcoinBoundedPublicAnchor,
    bitcoinSettlementIntent: latestRun.bitcoinSettlementIntent,
    bitcoinSettlementObservation: latestRun.bitcoinSettlementObservation,
    bitcoinAuditAnchorProof: latestRun.bitcoinAuditAnchorProof,
    bitcoinSettlementInterfaceProof: latestRun.bitcoinSettlementInterfaceProof,
    systemProofBundle: latestRun.systemProofBundle,
    proofContract: latestRun.proofContract,
    branchArtifacts: {
      branchName: latestRun.branchArtifacts?.branchName,
      branchMode: latestRun.branchArtifacts?.branchMode,
      confidentiality: latestRun.branchArtifacts?.confidentiality,
      visibleFileInventory: Object.keys(latestRun.branchArtifacts?.files || {}).filter((path) => !path.startsWith('.bitcode/source-material/'))
    }
  };
}

/**
 * @param {LatestRunShape | null | undefined} latestRun
 * @returns {Record<string, unknown> | null}
 */
function buildReviewerProjection(latestRun) {
  if (!latestRun) return null;
  return {
    ...buildPublicProjection(latestRun),
    projectionPrincipal: 'reviewer',
    promptFamilyRegistry: latestRun.promptFamilyRegistry,
    inferenceMomentContracts: latestRun.inferenceMomentContracts,
    inferenceProofs: latestRun.inferenceProofs,
    inferenceSynthesisProof: latestRun.inferenceSynthesisProof,
    promptContracts: latestRun.promptContracts,
    promptSurfaces: latestRun.promptSurfaces,
    promptImplementationSurface: latestRun.promptImplementationSurface,
    verificationReport: latestRun.verificationReport,
    verificationDecisionsProof: latestRun.verificationDecisionsProof,
    parsedCompletionEnvelopes: latestRun.parsedCompletionEnvelopes,
    parsedCompletionEnvelopeArtifact: latestRun.parsedCompletionEnvelopeArtifact,
    repoToSettlementSurface: latestRun.repoToSettlementSurface,
    verificationReceipts: latestRun.verificationReceipts,
    evalManifest: latestRun.evalManifest,
    promptCompletenessProof: latestRun.promptCompletenessProof,
    codeAnalysisFactRegistry: latestRun.codeAnalysisFactRegistry,
    staticMeasurementReport: latestRun.staticMeasurementReport,
    staticMeasurementProof: latestRun.staticMeasurementProof,
    selectionConsistencyProof: latestRun.selectionConsistencyProof,
    selectionAndMaterializationProof: latestRun.selectionAndMaterializationProof,
    materializationProof: latestRun.materializationProof,
    materializationExclusions: latestRun.materializationExclusions,
    materializationVisibilityProof: latestRun.materializationVisibilityProof,
    identityAuthorizationProof: latestRun.identityAuthorizationProof,
    sensitiveDataFlowProof: latestRun.sensitiveDataFlowProof,
    authorizationAndSensitiveFlowProof: latestRun.authorizationAndSensitiveFlowProof,
    journalCompletenessProof: latestRun.journalCompletenessProof,
    settlementSourceToSharesProof: latestRun.settlementSourceToSharesProof,
    externalBoundaryManifest: latestRun.externalBoundaryManifest,
    computeRealityManifest: latestRun.computeRealityManifest
      ? {
          realityId: latestRun.computeRealityManifest?.realityId,
          executionMode: latestRun.computeRealityManifest?.executionMode,
          determinismClass: latestRun.computeRealityManifest?.determinismClass,
          proofArtifactRefs: latestRun.computeRealityManifest?.proofArtifactRefs,
          settlementArtifactRefs: latestRun.computeRealityManifest?.settlementArtifactRefs
        }
      : undefined,
    storageRealityManifest: latestRun.storageRealityManifest
      ? {
          realityId: latestRun.storageRealityManifest?.realityId,
          storageMode: latestRun.storageRealityManifest?.storageMode,
          contentAddressingScheme: latestRun.storageRealityManifest?.contentAddressingScheme,
          scopeStorageBindings: latestRun.storageRealityManifest?.scopeStorageBindings
        }
      : undefined,
    bitcoinCommitmentManifest: latestRun.bitcoinCommitmentManifest
      ? {
          manifestVersion: latestRun.bitcoinCommitmentManifest?.manifestVersion,
          publicRoot: latestRun.bitcoinCommitmentManifest?.publicRoot,
          privateRootRef: latestRun.bitcoinCommitmentManifest?.privateRoot,
          publicArtifactCount: latestRun.bitcoinCommitmentManifest?.scopeEntries?.public?.length || 0,
          privateArtifactCount: latestRun.bitcoinCommitmentManifest?.scopeEntries?.private?.length || 0
        }
      : undefined,
    bitcoinAnchor: latestRun.bitcoinAnchor
      ? {
          anchorId: latestRun.bitcoinAnchor?.anchorId,
          network: latestRun.bitcoinAnchor?.network,
          anchorMode: latestRun.bitcoinAnchor?.anchorMode,
          confirmationState: latestRun.bitcoinAnchor?.confirmationState,
          publicationState: latestRun.bitcoinAnchor?.publicationState
        }
      : undefined,
    bitcoinBoundedPublicAnchor: latestRun.bitcoinBoundedPublicAnchor,
    bitcoinAuditAnchorProof: latestRun.bitcoinAuditAnchorProof
      ? {
          proofFamily: latestRun.bitcoinAuditAnchorProof?.proofFamily,
          allTheoremsPassed: latestRun.bitcoinAuditAnchorProof?.allTheoremsPassed,
          theoremVerdicts: latestRun.bitcoinAuditAnchorProof?.theoremVerdicts,
          memberVerdicts: latestRun.bitcoinAuditAnchorProof?.memberVerdicts
        }
      : undefined,
    systemProofBundle: latestRun.systemProofBundle,
    proofWitnessManifest: latestRun.proofWitnessManifest,
    proofContract: latestRun.proofContract,
    scenarioFixtureManifest: latestRun.scenarioFixtureManifest,
    testCoverageReport: latestRun.testCoverageReport,
    externalRealizationSummary: buildReviewerExternalRealizationSummary(latestRun),
    branchArtifacts: {
      branchName: latestRun.branchArtifacts?.branchName,
      branchMode: latestRun.branchArtifacts?.branchMode,
      confidentiality: latestRun.branchArtifacts?.confidentiality,
      visibleFileInventory: [...new Set([
        ...(latestRun.projectionPolicy?.publicArtifactPaths || []),
        ...(latestRun.projectionPolicy?.privateArtifactPaths || [])
      ])].filter((path) => !path.startsWith('.bitcode/source-material/'))
    }
  };
}

/**
 * @param {SessionShape} session
 * @returns {Record<string, unknown>}
 */
export function buildPublicGitHubAppSession(session) {
  return {
    authSessionId: session.authSessionId,
    authMechanism: session.authMechanism,
    appId: session.appId,
    appSlug: session.appSlug,
    installationId: session.installationId,
    installationAccountLogin: session.installationAccountLogin,
    installationAccountId: session.installationAccountId,
    installationAccountNodeId: session.installationAccountNodeId,
    installationAccountType: session.installationAccountType,
    operatorLogin: session.operatorLogin,
    repo: session.repo,
    owner: session.owner,
    repoName: session.repoName,
    repositoryId: session.repositoryId,
    repositoryNodeId: session.repositoryNodeId,
    repositoryVisibility: session.repositoryVisibility,
    repositorySelection: session.repositorySelection,
    permissions: session.permissions,
    permissionsRoot: session.permissionsRoot,
    defaultRef: session.defaultRef,
    defaultSignerAddress: session.defaultSignerAddress,
    signingAlgorithm: session.signingAlgorithm,
    keySource: session.keySource,
    sessionIssuedAt: session.sessionIssuedAt,
    sessionExpiresAt: session.sessionExpiresAt,
    tokenBoundary: session.tokenBoundary,
    authPayloadHash: session.authPayloadHash,
    ...buildBoundaryDescriptions(
      session.localBoundary || session.profileABoundary,
      session.externalBoundary || session.profileBBoundary
    )
  };
}

/**
 * @param {RepoArtifactInventoryEntryShape} entry
 * @returns {Record<string, unknown>}
 */
export function buildPublicRepoArtifactInventoryEntry(entry) {
  return {
    inventoryEntryId: entry.inventoryEntryId,
    repo: entry.repo,
    artifactKind: entry.artifactKind,
    artifactType: entry.artifactType,
    originKind: entry.originKind,
    title: entry.title,
    summary: entry.summary,
    ref: entry.ref,
    sourceCommit: entry.sourceCommit,
    sourcePath: entry.sourcePath,
    sourcePaths: entry.sourcePaths,
    workflowRunId: entry.workflowRunId,
    workflowPath: entry.workflowPath,
    workflowJobName: entry.workflowJobName,
    checkSuiteId: entry.checkSuiteId,
    artifactName: entry.artifactName,
    tags: entry.tags,
    declaredStacks: entry.declaredStacks,
    declaredConstraints: entry.declaredConstraints,
    previewSurface: entry.previewSurface,
    signerAddress: entry.signerAddress,
    owner: entry.owner,
    repoName: entry.repoName,
    repositoryId: entry.repositoryId,
    repositoryNodeId: entry.repositoryNodeId,
    authSessionId: entry.authSessionId,
    installationId: entry.installationId,
    installationAccountLogin: entry.installationAccountLogin,
    installationAccountId: entry.installationAccountId,
    installationAccountNodeId: entry.installationAccountNodeId,
    contentRoot: entry.contentRoot,
    addressing: entry.addressing,
    authBinding: entry.authBinding,
    provenance: entry.provenance
  };
}

/**
 * @param {AssetSummaryShape} asset
 * @returns {Record<string, unknown>}
 */
export function buildPublicAssetSummary(asset) {
  return {
    assetId: asset.assetId,
    title: asset.title,
    artifactKind: asset.artifactKind,
    summary: asset.metadata.summary,
    tags: asset.metadata.tags,
    issuerPolicyStatus: asset.metadata.issuerPolicyStatus,
    signerAddress: asset.attestations[0]?.signerAddress
  };
}

/**
 * @param {LatestRunShape | null | undefined} latestRun
 * @param {string} [principal='public']
 * @param {{ ensureProjectionPrincipal?: ((principal: string) => string) | undefined }} [options={}]
 * @returns {Record<string, unknown> | LatestRunShape | null}
 */
export function buildProjectedLatestRun(latestRun, principal = 'public', { ensureProjectionPrincipal } = {}) {
  const resolvedPrincipal = ensureProjectionPrincipal ? ensureProjectionPrincipal(principal) : principal;
  if (!latestRun) return null;
  if (resolvedPrincipal === 'internal') return { ...latestRun, projectionPrincipal: 'internal' };
  if (resolvedPrincipal === 'buyer') return buildBuyerProjection(latestRun);
  if (resolvedPrincipal === 'reviewer') return buildReviewerProjection(latestRun);
  return buildPublicProjection(latestRun);
}

/**
 * @param {DemoStateShape} state
 * @param {string} [principal='public']
 * @param {PublicStateBuilderOptions} options
 * @returns {Record<string, unknown>}
 */
export function buildPublicState(
  state,
  principal = 'public',
  {
    ensureProjectionPrincipal,
    buildRepoSupplySurface,
    buildBoundaryRealitySurface,
    buildPolicyState,
    buildPolicyRelease,
    buildReadDescriptor,
    buildReadingSurface,
    nowIso
  } = /** @type {PublicStateBuilderOptions} */ ({})
) {
  const resolvedPrincipal = ensureProjectionPrincipal(principal);
  const repoSupplySurface = buildRepoSupplySurface(state);
  const boundaryRealitySurface = buildBoundaryRealitySurface();
  const profileCompositions = buildProfileCompositions();
  const conformanceProfiles = state.conformanceProfiles
    ? {
        ...state.conformanceProfiles,
        active: state.conformanceProfiles.active || PROFILE_A,
        productionIntent: state.conformanceProfiles.productionIntent || PROFILE_B,
        prototypeOnlyModeledControls: state.conformanceProfiles.prototypeOnlyModeledControls ?? true,
        profileCompositions
      }
    : {
        active: PROFILE_A,
        productionIntent: PROFILE_B,
        prototypeOnlyModeledControls: true,
        profileCompositions
      };

  return {
    specVersion: state.specVersion || CURRENT_CANON_POSTURE.specVersionLabel,
    canonPosture: state.canonPosture || CURRENT_CANON_POSTURE,
    projectionPrincipal: resolvedPrincipal,
    conformanceProfiles,
    profileCompositions,
    repoSupplySurface,
    boundaryRealitySurface,
    updatedAt: nowIso(),
    buyers: state.buyers,
    githubAppSessions: (state.githubAppSessions || []).map(buildPublicGitHubAppSession),
    repoArtifactInventory: (state.repoArtifactInventory || []).map(buildPublicRepoArtifactInventoryEntry),
    policyRelease: buildPolicyRelease(state.policyState || buildPolicyState()),
    readScenarios: state.readScenarios.map((scenario) => {
      const readPreview = buildReadDescriptor(scenario);
      const readingSurface = buildReadingSurface(readPreview);
      const realizationProfile = buildRealizationProfile(scenario);
      return {
        realizationProfile,
        readId: readPreview.readId,
        readingSurface,
        scenarioId: scenario.scenarioId,
        scenarioFamily: scenario.scenarioFamily || 'unspecified',
        coverageTags: scenario.coverageTags || [],
        repo: scenario.repo,
        buyerBranch: scenario.baseRef,
        taskSeed: scenario.expectedTask,
        parserKind: scenario.canonicalRunEvidence?.extractedOutputs?.parserKind || 'github-actions.auth-remediation.v3',
        profileAStatus: PROFILE_A,
        profileBStatus: PROFILE_B
      };
    }),
    assets: state.assets.map(buildPublicAssetSummary),
    ledger: state.ledger,
    latestRun: buildProjectedLatestRun(state.latestRun, resolvedPrincipal, { ensureProjectionPrincipal }),
    runHistory: state.runHistory || []
  };
}
