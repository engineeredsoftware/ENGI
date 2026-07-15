// @ts-nocheck
/**
 * @typedef {any} BuiltPromptSurface
 * @typedef {any} PromptContractShape
 * @typedef {any} ParsedCompletionEnvelope
 * @typedef {any} BuiltRealizationProfile
 *
 * @typedef {any} ReadShape
 * @typedef {any} AssetShape
 * @typedef {any} EvaluatedCandidate
 * @typedef {any} AssetPackShape
 * @typedef {any} PolicyState
 *
 * @typedef {any} ReadMeasurementResult
 * @typedef {any} ReadMeasurementScenario
 *
 * @typedef {any} InferenceProof
 * @typedef {any} ParsedCompletionEnvelopeArtifact
 * @typedef {any} ProofWitnessManifestShape
 * @typedef {any} VerificationReportShape
 * @typedef {any} ProfileCompositionSurfaceShape
 * @typedef {any} SelectedSourceMaterialManifestShape
 * @typedef {any} PipelineTelemetryShape
 * @typedef {any} ArtifactUploadManifestShape
 * @typedef {any} ExternalBoundaryManifestShape
 * @typedef {any} GithubBoundarySurfaceShape
 * @typedef {any} SettlementParticipationArtifactShape
 * @typedef {any} SettlementPreviewShape
 * @typedef {any} JournalDiffShape
 * @typedef {any} PolicyReleaseShape
 * @typedef {any} UnitCatalogShape
 * @typedef {any} DemoStateShape
 * @typedef {any} ReadScenarioShape
 *
 * @typedef {any} DepositingSurface
 * @typedef {any} ReadingSurface
 * @typedef {any} DepositingToReadingSurface
 * @typedef {any} PublicSessionShape
 * @typedef {any} PublicRepoArtifactInventoryEntryShape
 *
 * @typedef {any} InternalSessionShape
 * @typedef {any} InternalRepoArtifactInventoryEntryShape
 * @typedef {any} StaticExecutionReceiptShape
 * @typedef {any} StaticExecutionReceiptInput
 * @typedef {any} BoundaryDescriptions
 * @typedef {any} BoundaryRealityStageInput
 * @typedef {any} ExternalBoundaryInterfaceInput
 * @typedef {any} CodeAnalysisHints
 * @typedef {any} CodeAnalysisFactsShape
 * @typedef {any} InventoryAddressingInput
 * @typedef {any} GitHubAppSessionInput
 */

import { ExecutionReality, NormalizationPressure } from './canonical/enums.js';
import './canonical/types.js';
import { inferTechnologySignals } from './protocol-technology-signals.js';
import { buildRepoSupplySurface, buildDepositingSurface, buildReadingSurface, buildDepositingToReadingSurface, buildRepoToSettlementSurface, buildIdentityAuthSpineSurface, buildBoundaryRealitySurface, buildGithubBoundarySurface } from './canonical/surfaces.js';
import { buildPipelineTelemetry, buildPromptImplementationSurface, buildSystemProofBundle, buildArtifactUploadManifest, buildAssetPackEvidenceManifest, buildScenarioFixtureManifest, buildTestCoverageReport } from './canonical/run-artifacts.js';
import { createReadMeasurementRuntime } from './canonical/read-measurement.js';
import { createEvaluationMaterializationRuntime } from './canonical/evaluation-materialization.js';
import { createSettlementRuntime } from './canonical/settlement.js';
import { buildProfileCompositions, buildPublicState as buildDemoPublicState } from './demo-shell-state.js';
import {
  extractPromptPlaceholders,
  buildPromptContract,
  assertPromptContractComplete,
  buildEvaluatorSurface as evaluatorSurface
} from './canonical/prompting.js';
import {
  buildProjectionPolicy,
  buildBoundedPublicProofArtifact,
  buildRedactionProof,
  buildDisclosureProof
} from './canonical/projections.js';
import {
  normalizeBitcoinPaymentMode,
  buildComputeRealityManifest,
  buildStorageRealityManifest,
  buildBitcoinTreasuryPolicy,
  buildBitcoinSettlementIntent,
  buildBitcoinSettlementObservation,
  buildArtifactDigestLookup,
  buildBitcoinCommitmentManifest,
  buildBitcoinAnchorArtifacts,
  buildBitcoinAuditAnchorProof,
  buildBitcoinSettlementInterfaceProof
} from './canonical/v23-bitcoin.js';
import {
  BITCOIN_DEMONSTRATION_SERVICE_MODE,
  buildBitcoinDemonstrationServiceDescriptor
} from './canonical/v23-bitcoin-demonstration-service.js';
import { buildV24ExternalRealizationArtifacts } from './canonical/v24-external-realization.js';
import {
  buildV24BitcoinNetworkArtifacts,
  buildV24ContainerArtifacts,
  buildV24GithubArtifacts,
  buildV24ExternalRealizationProof,
  buildV24ContainerRealityProof,
  buildV24GithubLiveInterfaceProof
} from './canonical/v24-external-execution.js';
import {
  buildSelectionConsistencyProof,
  buildMaterializationVisibilityProof,
  buildMaterializationExclusions,
  buildMaterializationProof,
  buildProofWitnessManifest
} from './canonical/proof-materialization.js';
import {
  buildTheoremVerdict,
  buildArtifactBinding,
  buildReplayStep,
  allTheoremsPassed as aggregateTheoremVerdicts,
  summarizeStrings as summarizeAnnotationStrings,
  computeProofClosure
} from './canonical/proof-annotations.js';

import crypto from 'node:crypto';
import { PROFILE_A, PROFILE_B, buildRealizationProfile } from './realization-profile.js';
import {
  CURRENT_CANON_POSTURE,
  CURRENT_POLICY_REF,
  CURRENT_SPEC_VERSION_LABEL
} from './canon-posture.js';

const createReadMeasurementRuntimeUnchecked = /** @type {any} */ (createReadMeasurementRuntime);
const createEvaluationMaterializationRuntimeUnchecked = /** @type {any} */ (createEvaluationMaterializationRuntime);
const createSettlementRuntimeUnchecked = /** @type {any} */ (createSettlementRuntime);
const evaluatorSurfaceUnchecked = /** @type {any} */ (evaluatorSurface);
const buildPromptImplementationSurfaceUnchecked = /** @type {any} */ (buildPromptImplementationSurface);
const buildSystemProofBundleUnchecked = /** @type {any} */ (buildSystemProofBundle);
const buildSelectionConsistencyProofUnchecked = /** @type {any} */ (buildSelectionConsistencyProof);
const buildMaterializationVisibilityProofUnchecked = /** @type {any} */ (buildMaterializationVisibilityProof);
const buildMaterializationExclusionsUnchecked = /** @type {any} */ (buildMaterializationExclusions);
const buildMaterializationProofUnchecked = /** @type {any} */ (buildMaterializationProof);
const buildProofWitnessManifestUnchecked = /** @type {any} */ (buildProofWitnessManifest);
const buildProjectionPolicyUnchecked = /** @type {any} */ (buildProjectionPolicy);
const buildBoundedPublicProofArtifactUnchecked = /** @type {any} */ (buildBoundedPublicProofArtifact);
const buildRedactionProofUnchecked = /** @type {any} */ (buildRedactionProof);
const buildDisclosureProofUnchecked = /** @type {any} */ (buildDisclosureProof);
const buildDemoPublicStateUnchecked = /** @type {any} */ (buildDemoPublicState);

export const SPEC_VERSION = CURRENT_SPEC_VERSION_LABEL;
const ACTIVE_PROJECT_LABEL = 'Bitcode';
const ACTIVE_DENOMINATION_LABEL = 'BTD';
const ACTIVE_BRANCH_PREFIX = 'BITCODE';
const DEFAULT_GITHUB_APP_ID = 'app_bitcode';
const DEFAULT_GITHUB_APP_SLUG = 'bitcode-app';
const DEFAULT_GITHUB_INSTALLATION_ID = 'gh_inst_bitcode_001';
const DEFAULT_GITHUB_KEY_SOURCE = 'kms://bitcode/github-app';
const DEFAULT_GITHUB_OPERATOR_LOGIN = 'bitcode-app[bot]';
const BRANCH_READ_PATH = 'BITCODE_READ.md';

function activeBranchRef(slug) {
  return `${ACTIVE_BRANCH_PREFIX}-${slug}`;
}

const AUTH_ISSUER_ROLLBACK_REF = activeBranchRef('auth-issuer-rollback');
const AUTH_MANY_ASSET_NORMALIZATION_REF = activeBranchRef('auth-many-asset-normalization');
const PROOF_VALIDATOR_GAP_REF = activeBranchRef('proof-validator-gap');
const CONFIG_POLICY_PRECEDENCE_REF = activeBranchRef('config-policy-precedence');
const UNSAFE_PATCH_REVIEW_REF = activeBranchRef('unsafe-patch-review');
const DEPLOYMENT_DRIFT_ROLLBACK_REF = activeBranchRef('deployment-drift-rollback');
const BOUNDED_PROOF_EXPORT_REF = activeBranchRef('bounded-proof-export');
const POLYGLOT_GATEWAY_REMEDIATION_REF = activeBranchRef('polyglot-gateway-remediation');
export const DEFAULT_BRANCH_MODE = 'patch';
export const METERED_MICRO_UNITS = '100000000';
export const DEFAULT_PROJECTION_PRINCIPAL = 'public';
export { extractPromptPlaceholders, buildPromptContract, assertPromptContractComplete };
export { PROFILE_A, PROFILE_B, buildRealizationProfile } from './realization-profile.js';
const MAX_BPS = 10000;
const MAX_BPS_BIGINT = 10000n;
const SOURCE_TO_SHARES_SCALE = 1000000n;
const VECTOR_DIMENSIONS = 16;
const DEFAULT_MODEL_ID = 'deterministic-local-evaluator.v15';
const DEFAULT_POLICY_REF = CURRENT_POLICY_REF;
const PROJECTION_PRINCIPALS = new Set(['public', 'buyer', 'reviewer', 'internal']);
const RECALL_CHANNEL_BUDGETS = {
  semanticTaskSearch: 50,
  failureModeSearch: 50,
  technicalContextSearch: 50,
  lexicalSearch: 100,
  symbolSearch: 100,
  pathSearch: 100,
  configKeySearch: 100,
  artifactKindFilteredSearch: 100
};
const PRIVATE_DATA_CLASSES = new Set([
  'repo-private-source',
  'licensed-source-material',
  'private-branch-derived-artifact',
  'verification-evidence',
  'settlement-preview',
  'private-proof-artifact'
]);
const REQUIRED_SENSITIVE_DATA_CLASSES = [
  'repo-private-source',
  'licensed-source-material',
  'private-branch-derived-artifact',
  'verification-evidence',
  'settlement-preview',
  'private-proof-artifact',
  'bounded-public-proof-metadata'
];
const V23_PRIVATE_ROOT_EXCLUSION_PATHS = new Set([
  '.bitcode/proof-witness-manifest.json',
  '.bitcode/system-proof-bundle.json',
  '.bitcode/bitcoin-commitment-manifest.json',
  '.bitcode/bitcoin-anchor.json',
  '.bitcode/bitcoin-bounded-public-anchor.json',
  '.bitcode/bitcoin-audit-anchor-proof.json',
  '.bitcode/bitcoin-settlement-interface-proof.json',
  '.bitcode/asset-pack-evidence.json',
  '.bitcode/pipeline-telemetry.json'
]);

/**
 * @param {string | null | undefined} localBoundary
 * @param {string | null | undefined} externalBoundary
 * @returns {BoundaryDescriptions}
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
 * @param {BoundaryRealityStageInput} input
 */
function buildBoundaryRealityStage({ stageId, label, localStatus, localDescription, externalRequirement }) {
  return {
    stageId,
    label,
    localStatus,
    localDescription,
    externalRequirement,
    profileAStatus: localStatus,
    profileADescription: localDescription,
    profileBRequirement: externalRequirement
  };
}

/**
 * @param {ExternalBoundaryInterfaceInput} input
 */
function buildExternalBoundaryInterface({ interfaceId, label, status, localPrototype, externalBoundary }) {
  return {
    interfaceId,
    label,
    status,
    localPrototype,
    externalBoundary,
    profileA: localPrototype,
    profileB: externalBoundary
  };
}

const RECALL_CHANNEL_SPECS = {
  semanticTaskSearch: { signalFamily: 'semantic/vector', determinesFrom: ['read.task', 'unit.text'], recordedOn: ['read.queryRepresentations.task', 'asset.contentUnits[].embeddings.taskVector'], vectorizedIn: 'task-semantic-space.v8', searchedBy: 'cosineSimilarity', scoredBy: 'similarity score', rankedUsage: 'readMatch.taskSemanticFit + recall fusion', downstreamUses: ['candidate recall ordering', 'read-match scoring', 'asset-pack selection'] },
  failureModeSearch: { signalFamily: 'semantic/vector', determinesFrom: ['read.failureModes', 'read.failingCases', 'unit.text', 'unit.codeAnalysisFacts.constraints', 'unit.codeAnalysisFacts.symbols'], recordedOn: ['read.queryRepresentations.failureModes', 'asset.contentUnits[].embeddings.failureModeVector'], vectorizedIn: 'failure-mode-space.v8', searchedBy: 'cosineSimilarity', scoredBy: 'similarity score', rankedUsage: 'readMatch.failureModeFit + benchmarkImpact.likelyImprovesFailingCases', downstreamUses: ['candidate recall ordering', 'benchmark-impact scoring', 'asset-pack coverage'] },
  technicalContextSearch: { signalFamily: 'semantic/vector', determinesFrom: ['read.touchedPaths', 'read.extractedSymbols', 'read.configKeys', 'read.stackHints', 'unit.codeAnalysisFacts.*'], recordedOn: ['read.queryRepresentations.technicalContext', 'asset.contentUnits[].embeddings.technicalContextVector'], vectorizedIn: 'technical-context-space.v8', searchedBy: 'cosineSimilarity', scoredBy: 'similarity score', rankedUsage: 'pathFit/stackFit/context generalization', downstreamUses: ['repo-context ranking', 'benchmark generalization scoring', 'branch selection guardrails'] },
  lexicalSearch: { signalFamily: 'lexical', determinesFrom: ['tokenize(read.task/failureModes/constraints/weakDimensions)', 'tokenize(unit.text)'], recordedOn: ['read.lexicalTerms', 'unit text tokens'], vectorizedIn: null, searchedBy: 'exact token overlap', scoredBy: 'hit ratio', rankedUsage: 'support-only lexical evidence', downstreamUses: ['recall provenance', 'readMatch.lexicalSupport', 'visual explainability'] },
  symbolSearch: { signalFamily: 'symbolic', determinesFrom: ['read.extractedSymbols', 'unit.codeAnalysisFacts.symbols'], recordedOn: ['read.extractedSymbols', 'asset.contentUnits[].codeAnalysisFacts.symbols'], vectorizedIn: null, searchedBy: 'exact symbol intersection', scoredBy: 'binary presence', rankedUsage: 'readMatch.symbolFit + recall fusion', downstreamUses: ['subsystem alignment', 'implementation specificity', 'visual explainability'] },
  pathSearch: { signalFamily: 'path', determinesFrom: ['read.touchedPaths', 'asset.metadata.sourcePaths', 'unit.codeAnalysisFacts.paths'], recordedOn: ['read.touchedPaths', 'asset provenance/source paths'], vectorizedIn: null, searchedBy: 'exact path intersection', scoredBy: 'binary presence', rankedUsage: 'readMatch.pathFit + repo-context linkage', downstreamUses: ['asset-pack coverage', 'benchmark impact generalization', 'penalty avoidance'] },
  configKeySearch: { signalFamily: 'config', determinesFrom: ['read.configKeys', 'unit.codeAnalysisFacts.configKeys'], recordedOn: ['read.configKeys', 'asset.contentUnits[].codeAnalysisFacts.configKeys'], vectorizedIn: null, searchedBy: 'exact config-key intersection', scoredBy: 'binary presence', rankedUsage: 'subsystem alignment + context linkage', downstreamUses: ['read-match scoring', 'artifact precision', 'visual explainability'] },
  artifactKindFilteredSearch: { signalFamily: 'artifact-kind/type', determinesFrom: ['read.targetArtifactKinds', 'asset.artifactKind', 'asset.artifactType'], recordedOn: ['read.targetArtifactKinds', 'asset metadata'], vectorizedIn: null, searchedBy: 'kind/type eligibility filter', scoredBy: 'binary match', rankedUsage: 'artifact kind fit + candidate filtering', downstreamUses: ['read-match scoring', 'penalty mass', 'asset-pack assembly'] }
};

const CODE_ANALYSIS_CONSUMERS = {
  'ranking.read-match.task-semantic-fit.v2': ['read.task', 'asset.contentUnits[].embeddings.taskVector'],
  'ranking.read-match.failure-mode-fit.v2': ['read.failureModes', 'asset.contentUnits[].embeddings.failureModeVector'],
  'ranking.read-match.symbol-fit.v2': ['read.extractedSymbols', 'asset.contentUnits[].codeAnalysisFacts.symbols'],
  'ranking.read-match.path-fit.v2': ['read.touchedPaths', 'asset.metadata.sourcePaths', 'asset.contentUnits[].codeAnalysisFacts.paths', 'read.extractedSymbols', 'read.configKeys', 'read.stackHints', 'asset.metadata.declaredStacks'],
  'ranking.read-match.stack-fit.v2': ['read.stackHints', 'asset.metadata.declaredStacks'],
  'ranking.read-match.constraint-fit.v2': ['read.constraints', 'asset.metadata.declaredConstraints', 'asset.contentUnits[].codeAnalysisFacts.constraints'],
  'ranking.read-match.artifact-kind-fit.v2': ['read.targetArtifactKinds', 'asset.artifactKind'],
  'ranking.read-match.lexical-support.v2': ['read.lexicalReadTerms', 'asset.contentUnits[].textTokens'],
  'ranking.benchmark-impact.failing-cases.v2': ['read.failingCases', 'asset.contentUnits[].embeddings.failureModeVector'],
  'ranking.benchmark-impact.weak-dimensions.v2': ['read.weakDimensions', 'read.task', 'read.constraints', 'asset.contentUnits[].embeddings.taskVector', 'asset.metadata.declaredConstraints'],
  'ranking.benchmark-impact.repo-context.v2': ['read.touchedPaths', 'read.stackHints', 'read.constraints', 'asset.metadata.sourcePaths', 'asset.metadata.declaredStacks'],
  'ranking.actionability.remediation-specificity.v2': ['read.failureModes', 'asset.contentUnits[].embeddings.failureModeVector'],
  'ranking.actionability.implementation-specificity.v2': ['asset.metadata.sourcePaths', 'asset.contentUnits[].codeAnalysisFacts.symbols', 'asset.contentUnits[].codeAnalysisFacts.configKeys'],
  'ranking.actionability.operational-usability.v2': ['asset.verificationEvidence'],
  'verification.issuance-checks.v15': ['asset.attestations[0]'],
  'verification.provenance-checks.v15': ['asset.provenanceBinding', 'read.repo', 'read.benchmarkRunId'],
  'verification.sufficiency-checks.v15': ['asset.verificationEvidence', 'read.benchmarkRunId'],
  'verification.issuer-policy-checks.v15': ['asset.metadata.issuerPolicyStatus', 'asset.attestations[0].signerAddress', 'policyState.issuers']
};

const CODE_ANALYSIS_FACT_REGISTRY_SPECS = {
  'read.task': { measurementClass: 'inferred-derived', gatheredFrom: ['read-measurement.task.v2'], storedOn: ['read.task'], factClass: 'read-analysis' },
  'read.failureModes': { measurementClass: 'inferred-derived', gatheredFrom: ['read-measurement.failure-modes.v2'], storedOn: ['read.failureModes'], factClass: 'read-analysis' },
  'read.constraints': { measurementClass: 'inferred-derived', gatheredFrom: ['read-measurement.constraints.v2'], storedOn: ['read.constraints'], factClass: 'read-analysis' },
  'read.targetArtifactKinds': { measurementClass: 'inferred-derived', gatheredFrom: ['read-measurement.target-artifact-kinds.v2'], storedOn: ['read.targetArtifactKinds'], factClass: 'read-analysis' },
  'read.touchedPaths': { measurementClass: 'static-executed', gatheredFrom: ['github-actions.benchmark-parser.v15', 'github.repo-context.extract.v15', 'bitcode.lsp.measure-read-static.v26'], storedOn: ['read.touchedPaths'], factClass: 'repo-code-analysis' },
  'read.extractedSymbols': { measurementClass: 'static-executed', gatheredFrom: ['github-actions.benchmark-parser.v15', 'github.repo-context.extract.v15', 'bitcode.lsp.measure-read-static.v26'], storedOn: ['read.extractedSymbols'], factClass: 'repo-code-analysis' },
  'read.configKeys': { measurementClass: 'static-executed', gatheredFrom: ['github-actions.benchmark-parser.v15', 'github.repo-context.extract.v15', 'bitcode.lsp.measure-read-static.v26'], storedOn: ['read.configKeys'], factClass: 'repo-code-analysis' },
  'read.stackHints': { measurementClass: 'hybrid-composed', gatheredFrom: ['github.repo-context.extract.v15', 'bitcode.lsp.measure-read-static.v26', 'inferStackHints()'], storedOn: ['read.stackHints'], factClass: 'repo-code-analysis' },
  'read.failingCases': { measurementClass: 'static-executed', gatheredFrom: ['github-actions.benchmark-parser.v15'], storedOn: ['read.failingCases'], factClass: 'benchmark-analysis' },
  'read.weakDimensions': { measurementClass: 'static-executed', gatheredFrom: ['github-actions.benchmark-parser.v15'], storedOn: ['read.weakDimensions'], factClass: 'benchmark-analysis' },
  'read.lexicalReadTerms': { measurementClass: 'hybrid-composed', gatheredFrom: ['tokenize(read.task/failureModes/constraints/weakDimensions)'], storedOn: ['recall.lexicalTerms'], factClass: 'derived-tokenization' },
  'asset.contentUnits[].textTokens': { measurementClass: 'static-executed', gatheredFrom: ['tokenize(unit.text)'], storedOn: ['recall unit tokenization'], factClass: 'derived-tokenization' },
  'asset.contentUnits[].codeAnalysisFacts.symbols': { measurementClass: 'static-executed', gatheredFrom: ['content-unit.extract-static-code-analysis.v15'], storedOn: ['asset.contentUnits[].codeAnalysisFacts.symbols'], factClass: 'content-unit-code-analysis' },
  'asset.contentUnits[].codeAnalysisFacts.paths': { measurementClass: 'static-executed', gatheredFrom: ['content-unit.extract-static-code-analysis.v15'], storedOn: ['asset.contentUnits[].codeAnalysisFacts.paths'], factClass: 'content-unit-code-analysis' },
  'asset.contentUnits[].codeAnalysisFacts.configKeys': { measurementClass: 'static-executed', gatheredFrom: ['content-unit.extract-static-code-analysis.v15'], storedOn: ['asset.contentUnits[].codeAnalysisFacts.configKeys'], factClass: 'content-unit-code-analysis' },
  'asset.contentUnits[].codeAnalysisFacts.stackTags': { measurementClass: 'static-executed', gatheredFrom: ['content-unit.extract-static-code-analysis.v15'], storedOn: ['asset.contentUnits[].codeAnalysisFacts.stackTags'], factClass: 'content-unit-code-analysis' },
  'asset.contentUnits[].codeAnalysisFacts.constraints': { measurementClass: 'static-executed', gatheredFrom: ['content-unit.extract-static-code-analysis.v15'], storedOn: ['asset.contentUnits[].codeAnalysisFacts.constraints'], factClass: 'content-unit-code-analysis' },
  'asset.contentUnits[].embeddings.taskVector': { measurementClass: 'hybrid-composed', gatheredFrom: ['content-unit.embedding-standin.v8'], storedOn: ['asset.contentUnits[].embeddings.taskVector'], factClass: 'stand-in-embedding' },
  'asset.contentUnits[].embeddings.failureModeVector': { measurementClass: 'hybrid-composed', gatheredFrom: ['content-unit.embedding-standin.v8'], storedOn: ['asset.contentUnits[].embeddings.failureModeVector'], factClass: 'stand-in-embedding' },
  'asset.metadata.sourcePaths': { measurementClass: 'static-executed', gatheredFrom: ['asset.measurement.extract.v15'], storedOn: ['asset.metadata.sourcePaths'], factClass: 'asset-code-analysis' },
  'asset.metadata.declaredStacks': { measurementClass: 'static-executed', gatheredFrom: ['asset.measurement.extract.v15'], storedOn: ['asset.metadata.declaredStacks'], factClass: 'asset-code-analysis' },
  'asset.metadata.declaredConstraints': { measurementClass: 'static-executed', gatheredFrom: ['asset.measurement.extract.v15'], storedOn: ['asset.metadata.declaredConstraints'], factClass: 'asset-code-analysis' },
  'asset.artifactKind': { measurementClass: 'copied', gatheredFrom: ['asset upload metadata'], storedOn: ['asset.artifactKind'], factClass: 'asset-shape' },
  'asset.verificationEvidence': { measurementClass: 'static-executed', gatheredFrom: ['asset.verificationEvidence'], storedOn: ['asset.verificationEvidence'], factClass: 'verification-evidence' },
  'asset.attestations[0]': { measurementClass: 'static-executed', gatheredFrom: ['asset.attestations[0]'], storedOn: ['asset.attestations[0]'], factClass: 'verification-evidence' },
  'asset.provenanceBinding': { measurementClass: 'static-executed', gatheredFrom: ['asset.provenanceBinding'], storedOn: ['asset.provenanceBinding'], factClass: 'verification-evidence' },
  'asset.metadata.issuerPolicyStatus': { measurementClass: 'policy-derived', gatheredFrom: ['asset.metadata.issuerPolicyStatus'], storedOn: ['asset.metadata.issuerPolicyStatus'], factClass: 'policy-input' },
  'asset.attestations[0].signerAddress': { measurementClass: 'static-executed', gatheredFrom: ['asset.attestations[0].signerAddress'], storedOn: ['asset.attestations[0].signerAddress'], factClass: 'policy-input' },
  'policyState.issuers': { measurementClass: 'policy-derived', gatheredFrom: ['policyState.issuers'], storedOn: ['policyState.issuers'], factClass: 'policy-input' },
  'read.repo': { measurementClass: 'copied', gatheredFrom: ['scenario.repo'], storedOn: ['read.repo'], factClass: 'verification-context' },
  'read.benchmarkRunId': { measurementClass: 'copied', gatheredFrom: ['scenario.benchmarkRunId'], storedOn: ['read.benchmarkRunId'], factClass: 'verification-context' }
};

/**
 * @param {unknown} value
 * @returns {string}
 */
export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @returns {string}
 */
export function nowIso() {
  return new Date().toISOString();
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

/**
 * @param {unknown} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9_.\-/]+/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * @param {unknown} text
 * @returns {string[]}
 */
export function uniqueTokens(text) {
  return [...new Set(tokenize(text))];
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function hashInt(value) {
  return parseInt(sha256(value).slice(0, 8), 16);
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

/**
 * @param {number} intersectionCount
 * @param {number} total
 * @returns {number}
 */
function ratio(intersectionCount, total) {
  if (!total) return 0;
  return clamp01(intersectionCount / total);
}

/**
 * @param {readonly unknown[] | string | null | undefined} left
 * @param {readonly unknown[] | string | null | undefined} right
 * @returns {number}
 */
function overlapScore(left, right) {
  const a = new Set(Array.isArray(left) ? left : uniqueTokens(left));
  const b = new Set(Array.isArray(right) ? right : uniqueTokens(right));
  if (!a.size || !b.size) return 0;
  let hits = 0;
  for (const item of a) {
    if (b.has(item)) hits += 1;
  }
  return ratio(hits, Math.max(a.size, b.size / 2));
}

/**
 * @param {readonly string[] | null | undefined} left
 * @param {readonly string[] | null | undefined} right
 * @returns {string[]}
 */
function intersection(left, right) {
  const a = new Set(left || []);
  return [...new Set((right || []).filter((item) => a.has(item)))];
}

/**
 * @param {readonly string[] | null | undefined} left
 * @param {readonly string[] | null | undefined} right
 * @returns {string[]}
 */
function union(left, right) {
  return [...new Set([...(left || []), ...(right || [])])];
}

/**
 * @param {readonly string[] | null | undefined} left
 * @param {readonly string[] | null | undefined} right
 * @returns {number}
 */
function countOverlap(left, right) {
  return intersection(left, right).length;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableHashObject(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {any} input
 * @param {{
 *   assetId: string,
 *   title: string,
 *   artifactKind: string,
 *   artifactType: string,
 *   contentRoot: string,
 *   contentUnits: any[],
 *   addressingSurface: any,
 *   artifactSelectionSurface: any,
 *   signingSurface: any,
 *   githubAppAuthSurface: any,
 *   assetMeasurement: any,
 *   measurementProvenance: any[]
 * }} inputState
 * @returns {any}
 */
function buildDepositoryEvidence(input, inputState) {
  const repositoryFullName = inputState.addressingSurface.repo || input.sourceRepo || input.authSession?.repo || null;
  const sourceBranch = inputState.addressingSurface.ref || input.sourceRef || input.sourceBranch || input.authSession?.defaultRef || null;
  const sourceCommit = inputState.addressingSurface.commit || input.sourceCommit || null;
  const signerAddress = inputState.signingSurface.signerAddress || input.signerAddress || null;
  const walletId = signerAddress ? `wallet:${signerAddress}` : null;
  const proofRoot = stableHashObject({
    kind: 'deposit-proof',
    assetId: inputState.assetId,
    contentRoot: inputState.contentRoot,
    signerAddress,
    signatureChecksPass: inputState.signingSurface.signatureChecksPass,
    attestationHash: inputState.signingSurface.attestationHash,
    authPayloadHash: inputState.githubAppAuthSurface.authPayloadHash
  });
  const measurementRoot = stableHashObject({
    kind: 'deposit-measurement',
    assetId: inputState.assetId,
    contentRoot: inputState.contentRoot,
    staticReceiptIds: (inputState.assetMeasurement.staticExecutionReceipts || []).map((receipt) => receipt.receiptId),
    contentUnitHashes: inputState.contentUnits.map((unit) => unit.unitHash)
  });
  const reconciliationReadbackRoot = stableHashObject({
    kind: 'deposit-reconciliation-readback',
    assetId: inputState.assetId,
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    proofRoot,
    measurementRoot,
    addressingRoot: inputState.addressingSurface.addressingRoot,
    selectedInventoryRoot: inputState.artifactSelectionSurface.selectedInventoryRoot
  });
  const lexicalDocument = {
    schema: 'bitcode.depository.lexical-document',
    documentId: `lexical:${inputState.assetId}`,
    assetId: inputState.assetId,
    title: inputState.title,
    artifactKind: inputState.artifactKind,
    artifactType: inputState.artifactType,
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    contentRoot: inputState.contentRoot,
    contentUnitIds: inputState.contentUnits.map((unit) => unit.unitId),
    contentUnitRoots: inputState.contentUnits.map((unit) => unit.unitHash),
    searchableTermsRoot: stableHashObject({
      title: inputState.title,
      artifactKind: inputState.artifactKind,
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      paths: inputState.addressingSurface.sourcePaths || []
    })
  };
  const vectorDocument = {
    schema: 'bitcode.depository.vector-document',
    documentId: `vector:${inputState.assetId}`,
    assetId: inputState.assetId,
    sourceTextRoot: stableHashObject({
      assetId: inputState.assetId,
      contentRoot: inputState.contentRoot,
      contentUnitRoots: inputState.contentUnits.map((unit) => unit.unitHash)
    }),
    embeddingPolicy: {
      model: 'text-embedding-3-small',
      dimensions: 1536,
      inputKind: 'source-bound-depository-document',
      vectorStore: {
        table: 'deliverable_vectors',
        rpc: 'match_deliverable_vectors',
        distanceMetric: 'cosine'
      }
    },
    indexState: 'ready_for_embedding_generation'
  };
  const lexicalDocumentRoot = stableHashObject(lexicalDocument);
  const vectorDocumentRoot = stableHashObject(vectorDocument);
  const depositorySearchDocumentRoot = stableHashObject({
    schema: 'bitcode.depository.search-document-set',
    assetId: inputState.assetId,
    lexicalDocumentRoot,
    vectorDocumentRoot,
    proofRoot,
    measurementRoot,
    reconciliationReadbackRoot
  });
  const compensationRoute = {
    payer: 'future-reader-after-settlement',
    payee: 'depositing-wallet',
    priceAsset: 'BTC',
    allocationMethod: 'source-to-shares-largest-remainder',
    sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement',
    btdMintBoundary: 'not-minted-by-deposit-admission',
    btdRightsTransferBoundary: 'reader-receives-rights-only-after-btc-settlement'
  };
  const compensationRouteRoot = stableHashObject(compensationRoute);
  const sourceToSharesPreviewRoot = stableHashObject({
    schema: 'bitcode.depository.source-to-shares-preview',
    assetId: inputState.assetId,
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    depositorWalletId: walletId,
    proofRoot,
    measurementRoot,
    reconciliationReadbackRoot,
    allocationMethod: compensationRoute.allocationMethod,
    sourceToSharesProofState: compensationRoute.sourceToSharesProofState
  });
  const compensationReadback = {
    ledgerAccountKeys: [
      `supplier:${inputState.assetId}:pending_claims`,
      ...(walletId
        ? [
            `depositor:${walletId}:deposited_assets`,
            `depositor:${walletId}:eligible_compensation_routes`
          ]
        : [])
    ],
    databaseProjectionTables: [
      'deliverables',
      'deliverable_vectors',
      'ledger_entries',
      'source_to_shares_allocations'
    ],
    objectStorageVisibility: 'source-safe-metadata-only-before-settlement'
  };
  const compensationReadbackRoot = stableHashObject(compensationReadback);
  const compensationPreviewWithoutRoot = {
    schema: 'bitcode.depository.supply-compensation-preview',
    state: walletId
      ? 'eligible-if-selected-for-assetpack'
      : 'repair-required-before-compensation',
    assetId: inputState.assetId,
    depositorWalletId: walletId,
    candidateBtdRange: null,
    compensationRoute,
    readiness: {
      sourceBound: Boolean(repositoryFullName && (sourceBranch || sourceCommit)),
      proofReady: true,
      measurementReady: true,
      searchable: true,
      depositorWalletReady: Boolean(walletId),
      eligibleForFindingFits: true,
      eligibleForCompensationIfSelected: Boolean(walletId),
      blockers: walletId ? [] : ['depositor_wallet_missing'],
      warnings: []
    },
    visibility: {
      beforeSettlement: 'source-safe-compensation-route-metadata',
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false
    },
    readback: compensationReadback,
    roots: {
      compensationRouteRoot,
      sourceToSharesPreviewRoot,
      readbackRoot: compensationReadbackRoot
    }
  };
  const compensationPreviewRoot = stableHashObject(compensationPreviewWithoutRoot);
  const compensationPreview = {
    ...compensationPreviewWithoutRoot,
    roots: {
      ...compensationPreviewWithoutRoot.roots,
      compensationPreviewRoot
    }
  };

  return {
    schema: 'bitcode.depository.deposit-evidence',
    assetId: inputState.assetId,
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    contentRoot: inputState.contentRoot,
    proofRoot,
    measurementRoot,
    reconciliationReadbackRoot,
    depositorySearchDocumentRoot,
    lexicalDocumentRoot,
    vectorDocumentRoot,
    compensationPreview,
    compensationPreviewRoot,
    sourceToSharesPreviewRoot,
    searchDocuments: {
      lexical: {
        ...lexicalDocument,
        documentRoot: lexicalDocumentRoot
      },
      vector: {
        ...vectorDocument,
        documentRoot: vectorDocumentRoot
      }
    },
    depositorBoundary: {
      walletId,
      signerAddress,
      signerClass: 'depositor',
      ownershipState: 'depositor-owned-before-read-settlement',
      readerVisibilityBeforeSettlement: 'measurements-and-non-source-metadata-only'
    },
    indexState: {
      lexical: 'ready',
      vector: vectorDocument.indexState,
      table: 'deliverable_vectors',
      rpc: 'match_deliverable_vectors'
    },
    sourceProofRoots: {
      addressingRoot: inputState.addressingSurface.addressingRoot,
      selectedInventoryRoot: inputState.artifactSelectionSurface.selectedInventoryRoot,
      authPayloadHash: inputState.githubAppAuthSurface.authPayloadHash
    }
  };
}

/**
 * @param {string} surfaceId
 * @param {readonly unknown[]} [values=[]]
 * @returns {string | null}
 */
function aggregateRootRef(surfaceId, values = []) {
  const roots = summarizeStrings(values);
  if (!roots.length) return null;
  if (roots.length === 1) return roots[0] || null;
  return `${surfaceId}_aggregate_${sha256(`${surfaceId}:${roots.join('|')}`).slice(0, 12)}`;
}

/**
 * @param {string} [principal=DEFAULT_PROJECTION_PRINCIPAL]
 * @returns {string}
 */
function ensureProjectionPrincipal(principal = DEFAULT_PROJECTION_PRINCIPAL) {
  const normalized = String(principal || DEFAULT_PROJECTION_PRINCIPAL).trim().toLowerCase();
  if (!PROJECTION_PRINCIPALS.has(normalized)) {
    throw new Error(`Unsupported projection principal: ${principal}`);
  }
  return normalized;
}

/**
 * @param {StaticExecutionReceiptInput} input
 * @returns {StaticExecutionReceiptShape & Record<string, unknown>}
 */
function buildStaticExecutionReceipt({
  receiptKind,
  stageId,
  toolId,
  inputs,
  normalizedOutputEnvelope,
  evidenceRefs = [],
  replayInputClosure = [],
  standIn = false
}) {
  const inputsHash = stableHashObject(inputs);
  const outputHash = stableHashObject(normalizedOutputEnvelope);
  const receiptId = `static_receipt_${sha256(`${stageId}:${receiptKind}:${inputsHash}:${outputHash}`).slice(0, 12)}`;
  return {
    receiptId,
    receiptKind,
    stageId,
    toolId,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    executedLocally: true,
    standIn,
    inputsHash,
    outputHash,
    evidenceRefs: summarizeStrings(evidenceRefs),
    replayInputClosure: summarizeStrings(replayInputClosure),
    normalizedOutputEnvelope,
    receiptHash: stableHashObject({
      receiptId,
      receiptKind,
      stageId,
      toolId,
      inputsHash,
      outputHash
    })
  };
}

/**
 * @param {unknown[] | unknown} [values=[]]
 * @returns {StaticExecutionReceiptShape[]}
 */
function collectStaticExecutionReceipts(values = []) {
  /** @type {StaticExecutionReceiptShape[]} */
  const receipts = [];
  /**
   * @param {unknown} value
   * @returns {void}
   */
  const visit = (value) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value !== 'object') return;
    const candidate = /** @type {any} */ (value);
    if (typeof candidate.receiptId === 'string' && typeof candidate.stageId === 'string' && typeof candidate.outputHash === 'string') {
      receipts.push(candidate);
      return;
    }
    Object.values(candidate).forEach(visit);
  };
  const queue = Array.isArray(values) ? values : [values];
  queue.forEach(visit);
  return receipts;
}

/**
 * @param {StaticExecutionReceiptShape[]} [receipts=[]]
 * @param {ReadMeasurementResult | null} [readMeasurement=null]
 * @param {EvaluatedCandidate[]} [evaluatedCandidates=[]]
 * @returns {Record<string, unknown>}
 */
function buildStaticMeasurementReport(receipts = [], readMeasurement = null, evaluatedCandidates = []) {
  const expectedStaticReceiptIds = summarizeStrings([
    ...(readMeasurement?.measurementProvenance || [])
      .filter((/** @type {any} */ entry) => entry.mode === 'static')
      .flatMap((/** @type {any} */ entry) => entry.receiptRefs || []),
    ...evaluatedCandidates.flatMap((candidate) => candidate.asset?.assetMeasurement?.staticExecutionReceipts || []).map((/** @type {any} */ receipt) => receipt.receiptId)
  ]);
  const byStage = receipts.map((receipt) => ({
    receiptId: receipt.receiptId,
    stageId: receipt.stageId,
    receiptKind: receipt.receiptKind,
    toolId: receipt.toolId,
    outputHash: receipt.outputHash
  }));
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    receiptCount: receipts.length,
    readMeasurementReceiptIds: summarizeStrings(
      (readMeasurement?.measurementProvenance || [])
        .filter((/** @type {any} */ entry) => entry.mode === 'static')
        .flatMap((/** @type {any} */ entry) => entry.receiptRefs || [])
    ),
    assetMeasurementReceiptIds: summarizeStrings(evaluatedCandidates.flatMap((candidate) => candidate.asset?.assetMeasurement?.staticExecutionReceipts || []).map((/** @type {any} */ receipt) => receipt.receiptId)),
    byStage,
    allReceiptRefsResolve: expectedStaticReceiptIds.every((receiptId) => receipts.some((receipt) => receipt.receiptId === receiptId)),
    reportHash: stableHashObject(byStage)
  };
}

/**
 * @param {StaticExecutionReceiptShape[]} [receipts=[]]
 * @param {ReadMeasurementResult | null} [readMeasurement=null]
 * @param {EvaluatedCandidate[]} [evaluatedCandidates=[]]
 * @returns {Record<string, unknown>}
 */
function buildStaticMeasurementProof(receipts = [], readMeasurement = null, evaluatedCandidates = []) {
  const expectedReceiptRefs = summarizeStrings([
    ...(readMeasurement?.measurementProvenance || [])
      .filter((/** @type {any} */ entry) => entry.mode === 'static')
      .flatMap((/** @type {any} */ entry) => entry.receiptRefs || []),
    ...evaluatedCandidates.flatMap((candidate) => candidate.asset?.assetMeasurement?.staticExecutionReceipts || []).map((/** @type {any} */ receipt) => receipt.receiptId)
  ]);
  const receiptIds = new Set(receipts.map((receipt) => receipt.receiptId));
  const coveredStageIds = summarizeStrings(receipts.map((receipt) => receipt.stageId));
  const memberStageMap = {
    'deterministic-parser': summarizeStrings(coveredStageIds.filter((stageId) => stageId.includes('benchmark-parser'))),
    'repo-context': summarizeStrings(coveredStageIds.filter((stageId) => stageId.includes('repo-context'))),
    'content-unit': summarizeStrings(coveredStageIds.filter((stageId) => stageId.includes('content-unit') || stageId.includes('asset.measurement.extract'))),
    'measurement-stages': summarizeStrings(coveredStageIds.filter((stageId) => stageId.includes('asset.measurement')))
  };
  const witnessArtifactPaths = [
    '.bitcode/code-analysis-fact-registry.json',
    '.bitcode/static-heuristics-registry.json',
    '.bitcode/measurement-receipts.json',
    '.bitcode/static-measurement-report.json',
    '.bitcode/static-measurement-proof.json'
  ];
  const replayArtifacts = [
    '.bitcode/code-analysis-fact-registry.json',
    '.bitcode/static-heuristics-registry.json',
    '.bitcode/measurement-receipts.json',
    '.bitcode/static-measurement-report.json',
    '.bitcode/static-measurement-proof.json'
  ];
  const replaySteps = [
    buildReplayStep({
      stepId: 'static-code-analysis.stage-domain',
      theoremIds: ['static_code_analysis.stage_domain_purity'],
      requiredArtifactPaths: ['.bitcode/measurement-receipts.json', '.bitcode/static-measurement-proof.json'],
      instruction: 'Replay static-analysis stage coverage and fail on out-of-family verification stages.'
    }),
    buildReplayStep({
      stepId: 'static-code-analysis.stage-mapping',
      theoremIds: ['static_code_analysis.abstract_to_concrete_stage_mapping', 'static_code_analysis.registry_role_closure'],
      requiredArtifactPaths: ['.bitcode/measurement-receipts.json', '.bitcode/code-analysis-fact-registry.json', '.bitcode/static-heuristics-registry.json'],
      instruction: 'Reconcile abstract static-analysis members to concrete receipt stages.'
    }),
    buildReplayStep({
      stepId: 'static-code-analysis.receipt-report-proof',
      theoremIds: ['static_code_analysis.receipt_report_proof_agreement', 'static_code_analysis.witness_replay_closure'],
      requiredArtifactPaths: ['.bitcode/measurement-receipts.json', '.bitcode/static-measurement-report.json', '.bitcode/static-measurement-proof.json'],
      instruction: 'Recompute receipt resolution and compare report/proof agreement.'
    })
  ];
  const memberVerdicts = [
    {
      memberId: 'deterministic-parser',
      stageIds: memberStageMap['deterministic-parser'],
      passed: memberStageMap['deterministic-parser'].length > 0
    },
    {
      memberId: 'repo-context',
      stageIds: memberStageMap['repo-context'],
      passed: memberStageMap['repo-context'].length > 0
    },
    {
      memberId: 'content-unit',
      stageIds: memberStageMap['content-unit'],
      passed: memberStageMap['content-unit'].length > 0
    },
    {
      memberId: 'measurement-stages',
      stageIds: memberStageMap['measurement-stages'],
      passed: memberStageMap['measurement-stages'].length > 0
    }
  ];
  const stageDomainPure = coveredStageIds.every((stageId) => !stageId.startsWith('verification.'));
  const theoremIds = [
    'static_code_analysis.stage_domain_purity',
    'static_code_analysis.abstract_to_concrete_stage_mapping',
    'static_code_analysis.registry_role_closure',
    'static_code_analysis.receipt_report_proof_agreement',
    'static_code_analysis.witness_replay_closure'
  ];
  const artifactBindings = [
    buildArtifactBinding({ artifactPath: '.bitcode/code-analysis-fact-registry.json', role: 'registry', theoremIds: ['static_code_analysis.abstract_to_concrete_stage_mapping', 'static_code_analysis.registry_role_closure'], requiredForWitness: true, requiredForReplay: true }),
    buildArtifactBinding({ artifactPath: '.bitcode/static-heuristics-registry.json', role: 'registry', theoremIds: ['static_code_analysis.registry_role_closure'], requiredForWitness: true, requiredForReplay: true }),
    buildArtifactBinding({ artifactPath: '.bitcode/measurement-receipts.json', role: 'receipt-log', theoremIds: ['static_code_analysis.stage_domain_purity', 'static_code_analysis.abstract_to_concrete_stage_mapping', 'static_code_analysis.receipt_report_proof_agreement', 'static_code_analysis.witness_replay_closure'], requiredForWitness: true, requiredForReplay: true }),
    buildArtifactBinding({ artifactPath: '.bitcode/static-measurement-report.json', role: 'report', theoremIds: ['static_code_analysis.receipt_report_proof_agreement'], requiredForWitness: true, requiredForReplay: true }),
    buildArtifactBinding({ artifactPath: '.bitcode/static-measurement-proof.json', role: 'primary-proof', theoremIds: ['static_code_analysis.stage_domain_purity', 'static_code_analysis.witness_replay_closure'], requiredForWitness: true, requiredForReplay: true })
  ];
  const registryRoleClosed =
    artifactBindings.some((binding) => binding.artifactPath === '.bitcode/code-analysis-fact-registry.json' && binding.role === 'registry' && binding.requiredForWitness === true && binding.requiredForReplay === true)
    && artifactBindings.some((binding) => binding.artifactPath === '.bitcode/static-heuristics-registry.json' && binding.role === 'registry' && binding.requiredForWitness === true && binding.requiredForReplay === true)
    && artifactBindings.some((binding) => binding.artifactPath === '.bitcode/measurement-receipts.json' && binding.role === 'receipt-log' && binding.requiredForWitness === true && binding.requiredForReplay === true);
  const proofClosure = computeProofClosure({
    artifactBindings,
    witnessArtifactPaths,
    replayArtifactPaths: replayArtifacts,
    replaySteps,
    theoremIds,
    excludeTheoremIds: ['static_code_analysis.witness_replay_closure']
  });
  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'static_code_analysis.stage_domain_purity',
      passed: stageDomainPure,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['static-code-analysis.stage-domain'],
      failureReasons: stageDomainPure ? [] : ['verification stages are still mixed into static-code-analysis coverage']
    }),
    buildTheoremVerdict({
      theoremId: 'static_code_analysis.abstract_to_concrete_stage_mapping',
      passed: expectedReceiptRefs.every((receiptId) => receiptIds.has(receiptId)),
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['static-code-analysis.stage-mapping'],
      failureReasons: expectedReceiptRefs.every((receiptId) => receiptIds.has(receiptId)) ? [] : ['expected static-analysis receipt refs do not all resolve']
    }),
    buildTheoremVerdict({
      theoremId: 'static_code_analysis.registry_role_closure',
      passed: registryRoleClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['static-code-analysis.stage-mapping'],
      failureReasons: registryRoleClosed ? [] : ['static-analysis registry roles are incomplete or incorrectly classified']
    }),
    buildTheoremVerdict({
      theoremId: 'static_code_analysis.receipt_report_proof_agreement',
      passed: expectedReceiptRefs.every((receiptId) => receiptIds.has(receiptId)),
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['static-code-analysis.receipt-report-proof'],
      failureReasons: expectedReceiptRefs.every((receiptId) => receiptIds.has(receiptId)) ? [] : ['receipt/report/proof agreement is incomplete']
    }),
    buildTheoremVerdict({
      theoremId: 'static_code_analysis.witness_replay_closure',
      passed: proofClosure.allClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: replaySteps.map((entry) => entry.stepId),
      failureReasons: proofClosure.allClosed ? [] : ['static-code-analysis witness/replay closure is incomplete']
    })
  ];
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    expectedReceiptRefCount: expectedReceiptRefs.length,
    receiptCount: receipts.length,
    allReceiptRefsResolve: expectedReceiptRefs.every((receiptId) => receiptIds.has(receiptId)),
    coveredStageIds,
    memberStageMap,
    witnessReceiptRefs: expectedReceiptRefs,
    memberVerdicts,
    theoremVerdicts,
    artifactBindings,
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    witnessClosureClosed: proofClosure.witnessBindingsClosed,
    replayClosureClosed: proofClosure.replayBindingsClosed && proofClosure.replayStepArtifactCoverageClosed && proofClosure.theoremReplayCoverageClosed,
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      expectedReceiptRefs,
      coveredStageIds,
      memberStageMap
    })
  };
}

/**
 * @param {string} factId
 * @param {ReadMeasurementResult | ReadShape | null | undefined} read
 * @param {AssetShape | null} [assetSample=null]
 * @returns {unknown}
 */
function codeAnalysisFactSample(factId, read, assetSample = null) {
  switch (factId) {
    case 'read.task': return read?.task;
    case 'read.failureModes': return read?.failureModes?.slice(0, 3);
    case 'read.constraints': return read?.constraints?.slice(0, 3);
    case 'read.targetArtifactKinds': return read?.targetArtifactKinds?.slice(0, 3);
    case 'read.touchedPaths': return read?.touchedPaths?.slice(0, 4);
    case 'read.extractedSymbols': return read?.extractedSymbols?.slice(0, 4);
    case 'read.configKeys': return read?.configKeys?.slice(0, 4);
    case 'read.stackHints': return read?.stackHints?.slice(0, 4);
    case 'read.failingCases': return read?.failingCases?.slice(0, 3);
    case 'read.weakDimensions': return read?.weakDimensions?.slice(0, 3);
    case 'read.lexicalReadTerms': return uniqueTokens([read?.task, ...(read?.failureModes || []), ...(read?.constraints || []), ...(read?.weakDimensions || [])].join(' ')).slice(0, 8);
    case 'asset.contentUnits[].textTokens': return uniqueTokens(assetSample?.contentUnits?.[0]?.text || '').slice(0, 8);
    case 'asset.contentUnits[].codeAnalysisFacts.symbols': return assetSample?.contentUnits?.flatMap((/** @type {any} */ unit) => unit.codeAnalysisFacts.symbols).slice(0, 4);
    case 'asset.contentUnits[].codeAnalysisFacts.paths': return assetSample?.contentUnits?.flatMap((/** @type {any} */ unit) => unit.codeAnalysisFacts.paths).slice(0, 4);
    case 'asset.contentUnits[].codeAnalysisFacts.configKeys': return assetSample?.contentUnits?.flatMap((/** @type {any} */ unit) => unit.codeAnalysisFacts.configKeys).slice(0, 4);
    case 'asset.contentUnits[].codeAnalysisFacts.stackTags': return assetSample?.contentUnits?.flatMap((/** @type {any} */ unit) => unit.codeAnalysisFacts.stackTags).slice(0, 4);
    case 'asset.contentUnits[].codeAnalysisFacts.constraints': return assetSample?.contentUnits?.flatMap((/** @type {any} */ unit) => unit.codeAnalysisFacts.constraints).slice(0, 4);
    case 'asset.contentUnits[].embeddings.taskVector': return assetSample?.contentUnits?.[0]?.embeddings?.taskVector?.spec?.vectorSpace;
    case 'asset.contentUnits[].embeddings.failureModeVector': return assetSample?.contentUnits?.[0]?.embeddings?.failureModeVector?.spec?.vectorSpace;
    case 'asset.metadata.sourcePaths': return assetSample?.metadata?.sourcePaths?.slice(0, 4);
    case 'asset.metadata.declaredStacks': return assetSample?.metadata?.declaredStacks?.slice(0, 4);
    case 'asset.metadata.declaredConstraints': return assetSample?.metadata?.declaredConstraints?.slice(0, 4);
    case 'asset.artifactKind': return assetSample?.artifactKind;
    case 'asset.verificationEvidence': return Object.keys(assetSample?.verificationEvidence || {});
    case 'asset.attestations[0]': return Object.keys(assetSample?.attestations?.[0] || {});
    case 'asset.provenanceBinding': return Object.keys(assetSample?.provenanceBinding || {});
    case 'asset.metadata.issuerPolicyStatus': return assetSample?.metadata?.issuerPolicyStatus;
    case 'asset.attestations[0].signerAddress': return assetSample?.attestations?.[0]?.signerAddress;
    case 'policyState.issuers': return ['allowed', 'restricted', 'revoked'];
    case 'read.repo': return read?.repo;
    case 'read.benchmarkRunId': return read?.benchmarkRunId;
    default: return null;
  }
}

/**
 * @param {{ read: ReadMeasurementResult | ReadShape, evaluatedCandidates?: EvaluatedCandidate[] | undefined }} input
 * @returns {Record<string, unknown>}
 */
function buildCodeAnalysisFactRegistry({ read, evaluatedCandidates = [] }) {
  const assetSample = evaluatedCandidates[0]?.asset || null;
  const consumedFactIds = summarizeStrings(Object.values(CODE_ANALYSIS_CONSUMERS).flat());
  const registeredFactIds = Object.keys(CODE_ANALYSIS_FACT_REGISTRY_SPECS);
  const registeredFacts = registeredFactIds.map((factId) => {
    const spec = /** @type {Record<string, any>} */ (CODE_ANALYSIS_FACT_REGISTRY_SPECS)[factId];
    const consumedBy = Object.entries(CODE_ANALYSIS_CONSUMERS)
      .filter(([, factIds]) => factIds.includes(factId))
      .map(([consumerId]) => consumerId);
    return {
      factId,
      factClass: spec.factClass,
      measurementClass: spec.measurementClass,
      gatheredFrom: spec.gatheredFrom,
      storedOn: spec.storedOn,
      exampleValue: codeAnalysisFactSample(factId, read, assetSample),
      consumedBy,
      intentionallyUnused: consumedBy.length === 0
    };
  });
  const unusedRegisteredFactIds = registeredFacts
    .filter((entry) => entry.intentionallyUnused)
    .map((entry) => entry.factId);
  const unregisteredConsumedFactIds = consumedFactIds.filter((factId) => !registeredFactIds.includes(factId));
  if (unregisteredConsumedFactIds.length) {
    throw new Error(`${ACTIVE_PROJECT_LABEL} code-analysis registry failed: unregistered consumed facts [${unregisteredConsumedFactIds.join(', ')}].`);
  }
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    registrySemantics: 'code-analysis-fact-registry',
    specArtifactAliases: ['.bitcode/static-heuristics-registry.json'],
    registeredFactCount: registeredFacts.length,
    consumedFactCount: consumedFactIds.length,
    registeredFacts,
    consumerMatrix: Object.entries(CODE_ANALYSIS_CONSUMERS).map(([consumerId, factIds]) => ({
      consumerId,
      consumedFactIds: factIds
    })),
    audit: {
      allConsumedFactsRegistered: unregisteredConsumedFactIds.length === 0,
      unregisteredConsumedFactIds,
      unusedRegisteredFactIds,
      registryHash: stableHashObject({
        registeredFacts: registeredFacts.map((entry) => ({ factId: entry.factId, consumedBy: entry.consumedBy })),
        consumerMatrix: Object.entries(CODE_ANALYSIS_CONSUMERS)
      })
    }
  };
}

/**
 * @param {Record<string, unknown>} codeAnalysisFactRegistry
 * @returns {Record<string, unknown>}
 */
function buildStaticHeuristicsRegistryArtifact(codeAnalysisFactRegistry) {
  return {
    ...codeAnalysisFactRegistry,
    artifactId: 'static-heuristics-registry.v15',
    artifactSemantics: 'specific code-analysis fact registry emitted as the local static heuristics registry surface'
  };
}

/**
 * @param {unknown} input
 * @returns {number[]}
 */
function buildDeterministicVector(input) {
  const tokens = Array.isArray(input) ? input : uniqueTokens(input);
  const buckets = new Array(VECTOR_DIMENSIONS).fill(0);
  for (const token of tokens) {
    if (!token) continue;
    const index = hashInt(token) % VECTOR_DIMENSIONS;
    buckets[index] += 1;
  }

  const magnitude = Math.sqrt(buckets.reduce((sum, value) => sum + (value * value), 0));
  if (!magnitude) return buckets;
  return buckets.map((value) => Number((value / magnitude).toFixed(6)));
}

/**
 * @param {string} vectorSpace
 * @param {unknown} inputText
 * @param {{
 *   profile?: string | undefined,
 *   standIn?: boolean | undefined,
 *   provider?: string | undefined,
 *   modelId?: string | undefined,
 *   generationMethod?: string | undefined,
 *   dimensions?: number | undefined
 * }} [options={}]
 * @returns {Record<string, unknown>}
 */
function buildEmbeddingSpec(vectorSpace, inputText, { profile = PROFILE_A, standIn = true, provider = ACTIVE_PROJECT_LABEL.toLowerCase(), modelId = DEFAULT_MODEL_ID, generationMethod = 'deterministic-stand-in', dimensions = VECTOR_DIMENSIONS } = {}) {
  return {
    vectorSpace,
    dimensions,
    profile,
    standIn,
    provider,
    modelId,
    generationMethod,
    inputHash: stableHashObject({ vectorSpace, inputText })
  };
}

/**
 * @param {string} vectorSpace
 * @param {unknown} inputText
 * @param {{
 *   profile?: string | undefined,
 *   standIn?: boolean | undefined,
 *   provider?: string | undefined,
 *   modelId?: string | undefined,
 *   generationMethod?: string | undefined,
 *   dimensions?: number | undefined
 * }} [options={}]
 * @returns {any}
 */
function buildEmbeddingArtifact(vectorSpace, inputText, options = {}) {
  return {
    spec: buildEmbeddingSpec(vectorSpace, inputText, options),
    values: buildDeterministicVector(inputText)
  };
}

/**
 * @param {string} stage
 * @param {Record<string, unknown>} [payload={}]
 * @returns {any}
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
 * @param {{ unitId: string, unitKind: string, unitHash: string, codeAnalysisFacts: CodeAnalysisFactsShape, embeddings?: Record<string, { spec: Record<string, unknown> }> | undefined }} unit
 * @returns {any}
 */
function unitSemanticSummary(unit) {
  return {
    unitId: unit.unitId,
    unitKind: unit.unitKind,
    unitHash: unit.unitHash,
    codeAnalysisFactCounts: {
      symbols: unit.codeAnalysisFacts.symbols.length,
      paths: unit.codeAnalysisFacts.paths.length,
      configKeys: unit.codeAnalysisFacts.configKeys.length,
      stackTags: unit.codeAnalysisFacts.stackTags.length,
      constraints: unit.codeAnalysisFacts.constraints.length
    },
    embeddingSpecs: Object.fromEntries(Object.entries(unit.embeddings || {}).map(([key, artifact]) => [key, artifact.spec]))
  };
}

/**
 * @param {number[] | { values?: number[] | undefined } | null | undefined} vectorOrArtifact
 * @returns {number[] | undefined}
 */
function vectorValues(vectorOrArtifact) {
  return Array.isArray(vectorOrArtifact) ? vectorOrArtifact : vectorOrArtifact?.values;
}

/**
 * @param {number[] | { values?: number[] | undefined } | null | undefined} left
 * @param {number[] | { values?: number[] | undefined } | null | undefined} right
 * @returns {number}
 */
function cosineSimilarity(left, right) {
  left = vectorValues(left);
  right = vectorValues(right);
  if (!Array.isArray(left) || !Array.isArray(right) || !left.length || !right.length) return 0;
  const length = Math.min(left.length, right.length);
  let total = 0;
  for (let index = 0; index < length; index += 1) {
    total += (Number(left[index]) || 0) * (Number(right[index]) || 0);
  }
  return clamp01(total);
}

/**
 * @param {string} name
 * @param {unknown} value
 * @returns {number}
 */
function enforceRange(name, value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 1) {
    throw new Error(`${ACTIVE_PROJECT_LABEL} debug failure: ${name} out of range (${value}).`);
  }
  return numeric;
}

/**
 * @param {unknown} score
 * @returns {number}
 */
function summarizeScore(score) {
  return Number(enforceRange('score', score).toFixed(4));
}

/**
 * @param {string} name
 * @param {unknown} trace
 * @returns {any}
 */
function enforceTelemetryTrace(name, trace) {
  if (!trace || typeof trace !== 'object') {
    throw new Error(`${ACTIVE_PROJECT_LABEL} debug failure: missing telemetry trace for ${name}.`);
  }
  return /** @type {any} */ (trace);
}

/**
 * @param {{
 *   value: unknown,
 *   mode: string,
 *   toolOrPromptId: string,
 *   evidenceRefs: string[],
 *   explanation: string,
 *   unitRefs?: string[] | undefined,
 *   measurementClass?: string | undefined,
 *   evaluatorKind?: string | undefined,
 *   consumedCodeAnalysisFacts?: string[] | undefined
 * }} input
 * @returns {any}
 */
function measurementDetail({ value, mode, toolOrPromptId, evidenceRefs, explanation, unitRefs = [], measurementClass = mode === 'inferred' ? 'inferred-evaluation' : 'static-analysis', evaluatorKind = mode === 'inferred' ? 'inferred-evaluator' : 'deterministic-static-command', consumedCodeAnalysisFacts = [] }) {
  return {
    value: summarizeScore(value),
    mode,
    measurementClass,
    evaluatorKind,
    toolOrPromptId,
    version: 'demo-v15.0',
    evidenceRefs: evidenceRefs.filter(Boolean),
    unitRefs,
    explanation,
    consumedCodeAnalysisFacts,
    evaluatorSurface: evaluatorSurfaceUnchecked({
      evaluatorId: toolOrPromptId,
      evaluatorKind,
      measurementClass,
      mode,
      promptId: mode === 'inferred' ? toolOrPromptId : null,
      toolId: mode !== 'inferred' ? toolOrPromptId : null,
      evidenceRefs
    })
  };
}

/**
 * @param {ReadMeasurementResult | ReadShape} read
 * @param {AssetShape} asset
 * @param {string[]} [extraRefs=[]]
 * @returns {string[]}
 */
function rankingEvidenceRefs(read, asset, extraRefs = []) {
  return union(
    [
      read.readId,
      read.benchmarkRunId,
      asset.contentRoot,
      asset.provenanceBinding?.commit,
      asset.provenanceBinding?.workflowRunId
    ].filter(Boolean),
    extraRefs.filter(Boolean)
  );
}

/**
 * @param {unknown} text
 * @returns {string}
 */
function detectUnitKind(text) {
  const source = String(text || '');
  if (/```|fn |function |const |let |class |pub /i.test(source)) return 'code-block';
  if (/=|:/.test(source) && /config|issuer|jwks|audience|env|yaml|toml|json/i.test(source)) return 'config-block';
  if (/prove|proof|invariant|creusot|theorem/i.test(source)) return 'proof-block';
  if (/test|assert|rerun|benchmark/i.test(source)) return 'test-block';
  return 'text';
}

/**
 * @param {unknown} text
 * @param {CodeAnalysisHints} [hints={}]
 * @returns {CodeAnalysisFactsShape}
 */
function extractStaticCodeAnalysisFacts(text, hints = {}) {
  const source = String(text || '');
  const symbols = new Set(hints.symbols || []);
  const paths = new Set(hints.paths || []);
  const configKeys = new Set(hints.configKeys || []);
  const stackTags = new Set(hints.stackTags || []);
  const constraints = new Set(hints.constraints || []);

  for (const match of source.matchAll(/\b[A-Z][A-Za-z0-9]+\b|\b[a-z]+(?:[A-Z][A-Za-z0-9]+)+\b/g)) {
    if (match[0].length > 2) symbols.add(match[0]);
  }

  for (const match of source.matchAll(/[A-Za-z0-9_./-]+\.(?:ts|tsx|js|jsx|rs|py|go|json|ya?ml|toml|md)/g)) {
    paths.add(match[0]);
  }

  for (const match of source.matchAll(/\b[a-z][a-z0-9_.-]+(?:\.[a-z0-9_.-]+)+\b/g)) {
    if (match[0].includes('.')) configKeys.add(match[0]);
  }

  for (const word of ['typescript', 'node', 'rust', 'auth', 'github-actions', 'jwt', 'jwks', 'monorepo', 'redis']) {
    if (source.toLowerCase().includes(word)) stackTags.add(word);
  }

  for (const phrase of ['preserve session validity', 'replay only idempotent schema steps', 'emit audit receipt', 'compatibility window', 'kill switch', 'no panic', 'no overflow']) {
    if (source.toLowerCase().includes(phrase.toLowerCase())) constraints.add(phrase);
  }

  return {
    symbols: [...symbols],
    paths: [...paths],
    configKeys: [...configKeys],
    stackTags: [...stackTags],
    constraints: [...constraints]
  };
}

/**
 * @param {string} assetId
 * @param {unknown} content
 * @param {CodeAnalysisHints} [hints={}]
 * @returns {any[]}
 */
function splitContentUnits(assetId, content, hints = {}) {
  const blocks = String(content || '')
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  return (blocks.length ? blocks : [String(content || '').trim()].filter(Boolean)).map((text, index) => {
    const codeAnalysisFacts = extractStaticCodeAnalysisFacts(text, hints);
    const technicalContextText = [
      text,
      ...(codeAnalysisFacts.paths || []),
      ...(codeAnalysisFacts.configKeys || []),
      ...(codeAnalysisFacts.stackTags || []),
      ...(codeAnalysisFacts.constraints || [])
    ].join(' ');
    const unitKind = detectUnitKind(text);
    const embeddings = {
      taskVector: buildEmbeddingArtifact('task-semantic-space.v8', text),
      failureModeVector: buildEmbeddingArtifact('failure-mode-space.v8', [text, ...(codeAnalysisFacts.constraints || []), ...(codeAnalysisFacts.symbols || [])].join(' ')),
      technicalContextVector: buildEmbeddingArtifact('technical-context-space.v8', technicalContextText)
    };
    const unitHash = stableHashObject({ text });
    const codeAnalysisReceipt = buildStaticExecutionReceipt({
      receiptKind: 'content-unit-static-code-analysis',
      stageId: 'content-unit.extract-static-code-analysis.v15',
      toolId: 'content-unit.extract-static-code-analysis.v15',
      inputs: { assetId, unitIndex: index + 1, text, hints },
      normalizedOutputEnvelope: codeAnalysisFacts,
      evidenceRefs: [unitHash, ...codeAnalysisFacts.paths, ...codeAnalysisFacts.configKeys],
      replayInputClosure: [unitHash]
    });

    return {
      unitId: `${assetId}:unit-${index + 1}`,
      assetId,
      unitKind,
      text,
      codeAnalysisFacts,
      embeddings,
      semanticInterfaces: {
        contentUnitContractVersion: 'v7',
        embeddingHandOffReady: true,
        profileAStandInEmbeddings: true,
        profileBFutureReplacementBoundary: 'replace embedding artifact values/providers without changing unit metadata contract'
      },
      measurementProvenance: [
        measurementTrace('static', 'content-unit.extract-static-code-analysis.v15', [unitHash, ...codeAnalysisFacts.paths, ...codeAnalysisFacts.configKeys], { measurementClass: 'static-analysis', evaluatorKind: 'deterministic-static-command', standIn: false, receiptRefs: [codeAnalysisReceipt.receiptId] }),
        measurementTrace('hybrid', 'content-unit.embedding-standin.v8', [unitHash], { measurementClass: 'embedding-derivation', evaluatorKind: 'embedding-generator', standIn: true })
      ],
      staticExecutionReceipts: [codeAnalysisReceipt],
      semanticSummary: {
        tokenCount: uniqueTokens(text).length,
        embeddingSpaces: Object.values(embeddings).map((artifact) => artifact.spec['vectorSpace']),
        codeAnalysisFactCounts: {
          symbols: codeAnalysisFacts.symbols.length,
          paths: codeAnalysisFacts.paths.length,
          configKeys: codeAnalysisFacts.configKeys.length,
          stackTags: codeAnalysisFacts.stackTags.length,
          constraints: codeAnalysisFacts.constraints.length
        }
      },
      unitHash
    };
  });
}

/**
 * @param {any} mode
 * @param {any} toolOrPromptId
 * @param {any} evidenceRefs
 * @param {any} [options={}]
 * @returns {any}
 */
function measurementTrace(mode, toolOrPromptId, evidenceRefs, options = {}) {
  return readMeasurementRuntime.measurementTrace(mode, toolOrPromptId, evidenceRefs, options);
}

/**
 * @param {readonly unknown[] | null | undefined} values
 * @returns {string[]}
 */
function summarizeStrings(values) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

/**
 * @param {string | null | undefined} kind
 * @returns {string}
 */
function artifactTypeForKind(kind) {
  const normalizedKind = typeof kind === 'string' ? kind : '';
  const table = /** @type {Record<string, string>} */ ({
    runbook: 'runbook/operator-playbook',
    patch: 'code/patch',
    config: 'config/policy-change',
    proof: 'proof/verification-log',
    'incident-note': 'notes/incident-retrospective',
    mixed: 'bundle/mixed'
  });
  return table[normalizedKind] || `${normalizedKind || 'unknown'}/unspecified`;
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
 * @param {Record<string, number>} [counts={}]
 * @param {number} [limit=4]
 * @returns {string[]}
 */
function topCountKeys(counts = {}, limit = 4) {
  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([key]) => key);
}

/**
 * @param {string | null | undefined} repo
 * @returns {{ owner: string, name: string, repositoryId: string, repositoryNodeId: string }}
 */
function buildRepoIdentity(repo) {
  const [owner = 'unknown', name = 'repo'] = String(repo || '').split('/');
  return {
    owner,
    name,
    repositoryId: `gh_repo_${sha256(repo || 'unknown').slice(0, 10)}`,
    repositoryNodeId: `R_${sha256(`node:${repo || 'unknown'}`).slice(0, 16)}`
  };
}

/**
 * @param {string | null | undefined} login
 * @returns {{ installationAccountId: string, installationAccountNodeId: string }}
 */
function buildAccountIdentity(login) {
  const normalized = String(login || 'unknown-account').trim() || 'unknown-account';
  return {
    installationAccountId: `gh_acct_${sha256(`acct:${normalized}`).slice(0, 10)}`,
    installationAccountNodeId: `A_${sha256(`acct-node:${normalized}`).slice(0, 16)}`
  };
}

/**
 * @param {{
 *   sourcePath?: string | undefined,
 *   sourcePaths?: string[] | undefined,
 *   artifactName?: string | undefined,
 *   workflowRunId?: string | undefined,
 *   checkSuiteId?: string | undefined,
 *   sourceCommit?: string | undefined,
 *   title?: string | undefined
 * }} [entry={}]
 * @returns {string}
 */
function inventoryAddressRef(entry = {}) {
  return entry.sourcePath
    || entry.sourcePaths?.[0]
    || entry.artifactName
    || entry.workflowRunId
    || entry.checkSuiteId
    || entry.sourceCommit
    || entry.title
    || 'repo-artifact';
}

/**
 * @param {InventoryAddressingInput} [input={}]
 * @returns {Record<string, unknown> & { addressingRoot: string, addressingScope: string, primaryAddressRef: string }}
 */
function buildInventoryAddressingSurface({
  repo,
  ref = null,
  sourceCommit = null,
  sourcePath = null,
  sourcePaths = [],
  workflowRunId = null,
  workflowPath = null,
  workflowJobName = null,
  checkSuiteId = null,
  artifactName = null,
  originKind = null,
  title = ''
} = {}) {
  const repoIdentity = buildRepoIdentity(repo);
  const normalizedSourcePaths = summarizeStrings([sourcePath, ...(sourcePaths || [])]);
  let addressingScope = 'repo';
  if (workflowRunId && (originKind === 'workflow-artifact' || artifactName)) addressingScope = 'workflow-artifact';
  else if (workflowRunId) addressingScope = 'workflow-run';
  else if (normalizedSourcePaths.length > 1) addressingScope = 'multi-artifact-selection';
  else if (normalizedSourcePaths.length === 1) addressingScope = 'repo-file';
  else if (sourceCommit) addressingScope = 'repo-commit';

  const surface = {
    addressingScope,
    repo,
    owner: repoIdentity.owner,
    repoName: repoIdentity.name,
    repositoryId: repoIdentity.repositoryId,
    repositoryNodeId: repoIdentity.repositoryNodeId,
    ref: ref || null,
    commit: sourceCommit || null,
    workflowRunId: workflowRunId || null,
    workflowPath: workflowPath || null,
    workflowJobName: workflowJobName || null,
    checkSuiteId: checkSuiteId || null,
    artifactName: artifactName || null,
    sourcePaths: normalizedSourcePaths,
    primaryAddressRef: normalizedSourcePaths[0] || artifactName || workflowRunId || checkSuiteId || sourceCommit || title || repo
  };
  return {
    ...surface,
    addressingRoot: stableHashObject(surface)
  };
}

/**
 * @param {{
 *   inventoryEntryId?: string | undefined,
 *   repo?: string | undefined,
 *   repositoryId?: string | undefined,
 *   repositoryNodeId?: string | undefined,
 *   artifactKind?: string | undefined,
 *   artifactType?: string | undefined,
 *   originKind?: string | undefined,
 *   title?: string | undefined,
 *   authSessionId?: string | null | undefined,
 *   installationId?: string | null | undefined,
 *   contentRoot?: string | null | undefined,
 *   addressing?: Record<string, unknown> | undefined
 * } & InventoryAddressingInput} [entry={}]
 * @returns {Record<string, unknown>}
 */
function inventorySelectionSnapshot(entry = {}) {
  const addressing = entry.addressing || buildInventoryAddressingSurface(entry);
  return {
    inventoryEntryId: entry.inventoryEntryId,
    repo: entry.repo,
    repositoryId: entry.repositoryId || addressing.repositoryId,
    repositoryNodeId: entry.repositoryNodeId || addressing.repositoryNodeId,
    artifactKind: entry.artifactKind,
    artifactType: entry.artifactType,
    originKind: entry.originKind,
    title: entry.title,
    authSessionId: entry.authSessionId || null,
    installationId: entry.installationId || null,
    contentRoot: entry.contentRoot || null,
    addressingScope: addressing.addressingScope,
    primaryAddressRef: addressing.primaryAddressRef,
    addressingRoot: addressing.addressingRoot
  };
}

/**
 * @param {GitHubAppSessionInput} input
 * @returns {InternalSessionShape}
 */
function buildGitHubAppSession({
  repo,
  installationId,
  defaultRef,
  appId = DEFAULT_GITHUB_APP_ID,
  appSlug = DEFAULT_GITHUB_APP_SLUG,
  installationAccountLogin = 'frontier-code-systems',
  installationAccountType = 'Organization',
  repositorySelection = 'selected',
  permissions = {},
  defaultSignerAddress = 'did:key:frontier-ci-signer',
  signingAlgorithm = 'ed25519',
  keySource = DEFAULT_GITHUB_KEY_SOURCE,
  operatorLogin = DEFAULT_GITHUB_OPERATOR_LOGIN
}) {
  const repoIdentity = buildRepoIdentity(repo);
  const accountIdentity = buildAccountIdentity(installationAccountLogin);
  const resolvedPermissions = {
    actions: 'read',
    attestations: 'read',
    checks: 'read',
    contents: 'read',
    issues: 'write',
    metadata: 'read',
    pull_requests: 'write',
    ...permissions
  };
  const tokenBoundary = {
    mintingState: 'not-minted-in-profile-a',
    tokenMaterialPresent: false,
    modeledOnly: true,
    liveExchangeImplemented: false,
    repo,
    installationId,
    readableScopes: Object.keys(resolvedPermissions).filter((key) => resolvedPermissions[key] === 'read'),
    writableScopes: Object.keys(resolvedPermissions).filter((key) => resolvedPermissions[key] === 'write')
  };
  const sessionCore = {
    authSessionId: `ghapp_${toSlug(repo)}_${toSlug(installationId)}`,
    authMechanism: 'github-app-installation',
    appId,
    appSlug,
    installationId,
    installationAccountLogin,
    installationAccountId: accountIdentity.installationAccountId,
    installationAccountNodeId: accountIdentity.installationAccountNodeId,
    installationAccountType,
    operatorLogin,
    repo,
    owner: repoIdentity.owner,
    repoName: repoIdentity.name,
    repositoryId: repoIdentity.repositoryId,
    repositoryNodeId: repoIdentity.repositoryNodeId,
    repositoryVisibility: 'private',
    repositorySelection,
    permissions: resolvedPermissions,
    permissionsRoot: stableHashObject(resolvedPermissions),
    defaultRef,
    defaultSignerAddress,
    signingAlgorithm,
    keySource,
    sessionIssuedAt: '2026-04-03T00:00:00.000Z',
    sessionExpiresAt: null,
    tokenBoundary,
    ...buildBoundaryDescriptions(
      'Local modeled GitHub App installation session only. No live installation token is minted in this repo.',
      'Would exchange a real GitHub App JWT for an installation access token and use live repository APIs.'
    )
  };
  return {
    ...sessionCore,
    authPayloadHash: stableHashObject(sessionCore)
  };
}

/**
 * @param {{
 *   repo: string,
 *   artifactKind: string,
 *   artifactType?: string | undefined,
 *   originKind: string,
 *   title: string,
 *   summary: string,
 *   sourceCommit?: string | null | undefined,
 *   ref?: string | null | undefined,
 *   sourcePath?: string | null | undefined,
 *   sourcePaths?: string[] | undefined,
 *   workflowRunId?: string | null | undefined,
 *   workflowPath?: string | null | undefined,
 *   workflowJobName?: string | null | undefined,
 *   checkSuiteId?: string | null | undefined,
 *   artifactName?: string | null | undefined,
 *   tags?: string[] | undefined,
 *   declaredStacks?: string[] | undefined,
 *   declaredConstraints?: string[] | undefined,
 *   previewSurface?: string | undefined,
 *   content: string,
 *   signerAddress?: string | undefined,
 *   authSession?: InternalSessionShape | null | undefined
 * }} input
 * @returns {InternalRepoArtifactInventoryEntryShape}
 */
function buildRepoArtifactInventoryEntry({
  repo,
  artifactKind,
  artifactType = artifactTypeForKind(artifactKind),
  originKind,
  title,
  summary,
  sourceCommit,
  ref,
  sourcePath = null,
  sourcePaths = [],
  workflowRunId = null,
  workflowPath = null,
  workflowJobName = null,
  checkSuiteId = null,
  artifactName = null,
  tags = [],
  declaredStacks = [],
  declaredConstraints = [],
  previewSurface,
  content,
  signerAddress = 'did:key:frontier-ci-signer',
  authSession = null
}) {
  const repoIdentity = buildRepoIdentity(repo);
  const normalizedSourcePaths = summarizeStrings([sourcePath, ...(sourcePaths || [])]);
  const contentRoot = stableHashObject(content);
  const addressing = buildInventoryAddressingSurface({
    repo,
    ref,
    sourceCommit,
    sourcePath,
    sourcePaths: normalizedSourcePaths,
    workflowRunId,
    workflowPath,
    workflowJobName,
    checkSuiteId,
    artifactName,
    originKind,
    title
  });
  const inventoryEntryId = `inv_${toSlug(repo)}_${toSlug(originKind)}_${sha256(`${repo}:${title}:${sourceCommit || ''}:${workflowRunId || ''}`).slice(0, 10)}`;
  const authBinding = authSession ? {
    authSessionId: authSession.authSessionId,
    authMechanism: authSession.authMechanism,
    appId: authSession.appId,
    appSlug: authSession.appSlug,
    installationId: authSession.installationId,
    installationAccountLogin: authSession.installationAccountLogin,
    installationAccountId: authSession.installationAccountId,
    installationAccountNodeId: authSession.installationAccountNodeId,
    installationAccountType: authSession.installationAccountType,
    repositoryId: authSession.repositoryId,
    repositoryNodeId: authSession.repositoryNodeId,
    permissions: authSession.permissions,
    permissionsRoot: authSession.permissionsRoot,
    authPayloadHash: authSession.authPayloadHash,
    tokenBoundary: authSession.tokenBoundary
  } : null;
  const provenance = {
    selectionLabel: `${artifactKind} · ${originKind} · ${addressing.primaryAddressRef}`,
    previewHash: stableHashObject(previewSurface || summary),
    contentRoot,
    addressingRoot: addressing.addressingRoot,
    authPayloadHash: authBinding?.authPayloadHash || null,
    provenanceHash: stableHashObject({
      inventoryEntryId,
      repo,
      artifactKind,
      artifactType,
      originKind,
      contentRoot,
      addressingRoot: addressing.addressingRoot,
      authPayloadHash: authBinding?.authPayloadHash || null
    })
  };
  return {
    inventoryEntryId,
    repo,
    owner: repoIdentity.owner,
    repoName: repoIdentity.name,
    repositoryId: repoIdentity.repositoryId,
    repositoryNodeId: repoIdentity.repositoryNodeId,
    artifactKind,
    artifactType,
    originKind,
    title,
    summary,
    ref: ref || null,
    sourceCommit: sourceCommit || null,
    sourcePath,
    sourcePaths: normalizedSourcePaths,
    workflowRunId,
    workflowPath,
    workflowJobName,
    checkSuiteId,
    artifactName,
    tags,
    declaredStacks,
    declaredConstraints,
    previewSurface: previewSurface || summary,
    content,
    signerAddress,
    authSessionId: authSession?.authSessionId || null,
    installationId: authSession?.installationId || null,
    installationAccountLogin: authSession?.installationAccountLogin || null,
    installationAccountId: authSession?.installationAccountId || null,
    installationAccountNodeId: authSession?.installationAccountNodeId || null,
    contentRoot,
    addressing,
    authBinding,
    provenance
  };
}

/**
 * @returns {InternalSessionShape[]}
 */
function buildSeedGitHubAppSessions() {
  return [
    buildGitHubAppSession({ repo: 'frontier/demo-auth', installationId: DEFAULT_GITHUB_INSTALLATION_ID, defaultRef: AUTH_ISSUER_ROLLBACK_REF }),
    buildGitHubAppSession({ repo: 'frontier/payments-ledger', installationId: DEFAULT_GITHUB_INSTALLATION_ID, defaultRef: PROOF_VALIDATOR_GAP_REF }),
    buildGitHubAppSession({ repo: 'frontier/policy-control-plane', installationId: DEFAULT_GITHUB_INSTALLATION_ID, defaultRef: CONFIG_POLICY_PRECEDENCE_REF }),
    buildGitHubAppSession({ repo: 'frontier/review-gateway', installationId: DEFAULT_GITHUB_INSTALLATION_ID, defaultRef: UNSAFE_PATCH_REVIEW_REF }),
    buildGitHubAppSession({ repo: 'frontier/deploy-orchestrator', installationId: DEFAULT_GITHUB_INSTALLATION_ID, defaultRef: DEPLOYMENT_DRIFT_ROLLBACK_REF }),
    buildGitHubAppSession({ repo: 'frontier/private-proof-service', installationId: DEFAULT_GITHUB_INSTALLATION_ID, defaultRef: BOUNDED_PROOF_EXPORT_REF }),
    buildGitHubAppSession({ repo: 'frontier/polyglot-gateway', installationId: DEFAULT_GITHUB_INSTALLATION_ID, defaultRef: POLYGLOT_GATEWAY_REMEDIATION_REF })
  ];
}

/**
 * @param {InternalSessionShape[]} [sessions=buildSeedGitHubAppSessions()]
 * @returns {InternalRepoArtifactInventoryEntryShape[]}
 */
function buildSeedRepoArtifactInventoryEntries(sessions = buildSeedGitHubAppSessions()) {
  const sessionByRepo = Object.fromEntries(sessions.map((session) => [session.repo, session]));
  /**
   * @param {string} repo
   * @param {any} input
   * @returns {InternalRepoArtifactInventoryEntryShape}
   */
  const withSession = (repo, input) => buildRepoArtifactInventoryEntry({
    repo,
    authSession: sessionByRepo[repo] || null,
    ...input
  });

  return [
    withSession('frontier/demo-auth', {
      artifactKind: 'runbook',
      originKind: 'workflow-artifact',
      title: 'Auth rollback benchmark summary',
      summary: 'Workflow-generated benchmark summary describing issuer mismatch rollback failure slices.',
      sourceCommit: 'auth001abc',
      ref: AUTH_ISSUER_ROLLBACK_REF,
      workflowRunId: 'gha_run_auth_001',
      workflowPath: '.github/workflows/benchmark-auth.yml',
      workflowJobName: 'benchmark-auth-remediation',
      artifactName: 'auth-remediation-report.json',
      tags: ['auth', 'rollback', 'benchmark', 'workflow-artifact'],
      declaredStacks: ['typescript', 'node', 'github-actions', 'auth'],
      declaredConstraints: ['preserve session validity', 'emit audit receipt'],
      previewSurface: 'Workflow artifact: auth-remediation-report.json',
      content: 'Workflow artifact report\n- failing: issuer mismatch pre-migration services\n- weak dimensions: rollback safety, session validity, auditability\n- action: restore verifier compatibility before schema replay'
    }),
    withSession('frontier/demo-auth', {
      artifactKind: 'patch',
      originKind: 'commit-file',
      title: 'Rollback verifier compatibility patch',
      summary: 'Commit file candidate touching rollback handler and verifier restore path.',
      sourceCommit: 'auth001abc',
      ref: AUTH_ISSUER_ROLLBACK_REF,
      sourcePath: 'services/auth/rollback.ts',
      tags: ['patch', 'auth', 'rollback'],
      declaredStacks: ['typescript', 'node', 'auth'],
      declaredConstraints: ['restore verifier before schema replay'],
      previewSurface: 'services/auth/rollback.ts',
      content: 'Patch intent\n- restorePriorVerifier before schema replay\n- block traffic reopen until issuer compatibility audit passes'
    }),
    withSession('frontier/demo-auth', {
      artifactKind: 'config',
      originKind: 'config-snapshot',
      title: 'Issuer compatibility config snapshot',
      summary: 'Repo config snapshot for issuer compatibility window and rollback kill switch.',
      sourceCommit: 'auth001abc',
      ref: AUTH_ISSUER_ROLLBACK_REF,
      sourcePath: 'config/auth/issuer-compat.yml',
      tags: ['config', 'auth', 'compatibility-window'],
      declaredStacks: ['yaml', 'auth'],
      declaredConstraints: ['keep rollback reversible', 'compatibility window required'],
      previewSurface: 'config/auth/issuer-compat.yml',
      content: 'auth:\n  issuer:\n    compatibilityWindow: 30m\n  rollback:\n    killSwitch: true'
    }),
    withSession('frontier/demo-auth', {
      artifactKind: 'proof',
      originKind: 'proof-log',
      title: 'Session validator proof log',
      summary: 'Proof log showing validator invariants and replay safety obligations.',
      sourceCommit: 'auth001abc',
      ref: AUTH_ISSUER_ROLLBACK_REF,
      sourcePath: 'proofs/session_validator.creusot.log',
      workflowRunId: 'gha_run_auth_001',
      workflowPath: '.github/workflows/benchmark-auth.yml',
      workflowJobName: 'prove-session-validator',
      tags: ['proof', 'validator', 'creusot'],
      declaredStacks: ['rust', 'formal-methods', 'auth'],
      declaredConstraints: ['no panic', 'preserve session validity'],
      previewSurface: 'proofs/session_validator.creusot.log',
      content: 'Proof log\n- SessionValidator replay window preserved\n- issuer compatibility precondition required before reopen'
    }),
    withSession('frontier/demo-auth', {
      artifactKind: 'incident-note',
      originKind: 'incident-document',
      title: 'Issuer mismatch incident notes',
      summary: 'Incident note capturing operator ordering mistakes and recovery guidance.',
      sourceCommit: 'auth001abc',
      ref: AUTH_ISSUER_ROLLBACK_REF,
      sourcePath: 'docs/incidents/auth-issuer-mismatch.md',
      tags: ['incident-response', 'auth', 'runbook'],
      declaredStacks: ['markdown', 'auth'],
      declaredConstraints: ['record operator ordering'],
      previewSurface: 'docs/incidents/auth-issuer-mismatch.md',
      content: 'Incident note\n- failures came from replaying schema before restoring verifier compatibility\n- public proof should omit private verifier details'
    }),
    withSession('frontier/demo-auth', {
      artifactKind: 'patch',
      originKind: 'commit-file',
      title: 'Auth audit receipt patchset',
      summary: 'Receipt-binding patch that records workflow run, commit, and compatibility window together.',
      sourceCommit: 'auth019audit',
      ref: AUTH_MANY_ASSET_NORMALIZATION_REF,
      sourcePath: 'services/auth/audit_receipt.ts',
      tags: ['auth', 'auditability', 'patch', 'workflow-binding'],
      declaredStacks: ['typescript', 'node', 'auth', 'github-actions'],
      declaredConstraints: ['emit audit receipt', 'bind workflow run to receipt'],
      previewSurface: 'services/auth/audit_receipt.ts',
      content: 'Patch intent\n- write workflow run and commit into emitAuditReceipt\n- fail closed when rollback receipt linkage is missing'
    }),
    withSession('frontier/payments-ledger', {
      artifactKind: 'proof',
      originKind: 'attestation-bundle',
      title: 'Replay window attestation bundle',
      summary: 'Attestation bundle for validator proof and benchmark rerun.',
      sourceCommit: 'validator014proof',
      ref: PROOF_VALIDATOR_GAP_REF,
      workflowRunId: 'gha_run_validator_014',
      workflowPath: '.github/workflows/validator-proof.yml',
      workflowJobName: 'prove-validator',
      artifactName: 'validator-proof-bundle.json',
      tags: ['proof', 'validator', 'attestation'],
      declaredStacks: ['rust', 'cargo', 'formal-methods'],
      declaredConstraints: ['no unchecked arithmetic', 'replay benchmark after proof'],
      previewSurface: 'validator-proof-bundle.json',
      content: 'Attestation bundle\n- proof hash bound to validator replay window\n- benchmark rerun required before settlement eligibility'
    }),
    withSession('frontier/payments-ledger', {
      artifactKind: 'patch',
      originKind: 'commit-file',
      title: 'Replay guard patch',
      summary: 'Patch that hardens nonce-window bounds and overflow checks in the validator path.',
      sourceCommit: 'validator014proof',
      ref: PROOF_VALIDATOR_GAP_REF,
      sourcePaths: ['crates/validator/src/session_guard.rs', 'crates/validator/src/replay_window.rs'],
      tags: ['validator', 'patch', 'overflow-safety'],
      declaredStacks: ['rust', 'cargo', 'formal-methods'],
      declaredConstraints: ['no unchecked arithmetic', 'preserve replay protections'],
      previewSurface: 'crates/validator/src/session_guard.rs + crates/validator/src/replay_window.rs',
      content: 'Patch intent\n- guard replay-window math\n- preserve SessionGuard invariants over the full nonce range'
    }),
    withSession('frontier/payments-ledger', {
      artifactKind: 'runbook',
      originKind: 'incident-document',
      title: 'Validator proof recovery runbook',
      summary: 'Operator playbook for rerunning proof plus benchmark after replay-window repair.',
      sourceCommit: 'validator014proof',
      ref: PROOF_VALIDATOR_GAP_REF,
      sourcePath: 'docs/runbooks/validator-proof-recovery.md',
      tags: ['validator', 'runbook', 'formal-methods'],
      declaredStacks: ['markdown', 'rust', 'formal-methods'],
      declaredConstraints: ['rerun proof plus benchmark'],
      previewSurface: 'docs/runbooks/validator-proof-recovery.md',
      content: 'Runbook\n- rerun cargo creusot after the patch\n- compare proof hash to benchmark rerun before delivery'
    }),
    withSession('frontier/policy-control-plane', {
      artifactKind: 'config',
      originKind: 'workflow-artifact',
      title: 'Policy precedence benchmark output',
      summary: 'Benchmark output for precedence regression across config policy layers.',
      sourceCommit: 'policy031fix',
      ref: CONFIG_POLICY_PRECEDENCE_REF,
      workflowRunId: 'gha_run_policy_031',
      workflowPath: '.github/workflows/policy-benchmark.yml',
      workflowJobName: 'policy-benchmark',
      artifactName: 'policy-precedence-report.json',
      tags: ['policy', 'config', 'workflow-artifact'],
      declaredStacks: ['typescript', 'policy', 'github-actions'],
      declaredConstraints: ['no precedence inversion'],
      previewSurface: 'policy-precedence-report.json',
      content: 'Policy benchmark output\n- precedence inversion detected in layered config merge\n- rollback requires explicit winner ordering receipts'
    }),
    withSession('frontier/policy-control-plane', {
      artifactKind: 'patch',
      originKind: 'commit-file',
      title: 'Policy precedence governor patch',
      summary: 'Patch that rejects undeclared fallback winners and records the chosen policy source.',
      sourceCommit: 'policy031fix',
      ref: CONFIG_POLICY_PRECEDENCE_REF,
      sourcePath: 'services/policy/evaluate_rollout.ts',
      tags: ['policy', 'patch', 'governance'],
      declaredStacks: ['typescript', 'node', 'policy'],
      declaredConstraints: ['block silent precedence fallback', 'emit policy audit receipt'],
      previewSurface: 'services/policy/evaluate_rollout.ts',
      content: 'Patch intent\n- make precedence winners explicit\n- attach chosen source to the rollout receipt'
    }),
    withSession('frontier/policy-control-plane', {
      artifactKind: 'runbook',
      originKind: 'incident-document',
      title: 'Policy incident operator runbook',
      summary: 'Runbook for recovering precedence drift without reopening the governance incident.',
      sourceCommit: 'policy031fix',
      ref: CONFIG_POLICY_PRECEDENCE_REF,
      sourcePath: 'docs/runbooks/policy-incident.md',
      tags: ['policy', 'runbook', 'incident-response'],
      declaredStacks: ['markdown', 'policy'],
      declaredConstraints: ['preserve approval ordering'],
      previewSurface: 'docs/runbooks/policy-incident.md',
      content: 'Runbook\n- inspect precedence matrix first\n- reject undeclared defaults before rollout resume'
    }),
    withSession('frontier/review-gateway', {
      artifactKind: 'patch',
      originKind: 'pull-request-comment',
      title: 'Unsafe review recovery diff note',
      summary: 'Pull request comment summarizing unsafe patch review recovery steps.',
      sourceCommit: 'review022safe',
      ref: UNSAFE_PATCH_REVIEW_REF,
      sourcePath: 'services/review/recovery.ts',
      checkSuiteId: 'checksuite_review_022',
      tags: ['review', 'patch', 'safety'],
      declaredStacks: ['typescript', 'review'],
      declaredConstraints: ['revert unsafe grant path'],
      previewSurface: 'PR comment: unsafe patch review recovery',
      content: 'Review recovery note\n- revert unsafe bypass grant\n- require second reviewer before branch materialization'
    }),
    withSession('frontier/review-gateway', {
      artifactKind: 'runbook',
      originKind: 'incident-document',
      title: 'Unsafe review containment checklist',
      summary: 'Checklist for applying touched-file budgets and reviewer rationale requirements.',
      sourceCommit: 'review022safe',
      ref: UNSAFE_PATCH_REVIEW_REF,
      sourcePath: 'docs/reviews/unsafe_patch_containment.md',
      tags: ['review', 'runbook', 'security'],
      declaredStacks: ['markdown', 'security', 'review'],
      declaredConstraints: ['require review rationale', 'preserve rollback path'],
      previewSurface: 'docs/reviews/unsafe_patch_containment.md',
      content: 'Checklist\n- confirm touched-file scope\n- require reviewer rationale\n- reopen the guard benchmark when the patch expands'
    }),
    withSession('frontier/review-gateway', {
      artifactKind: 'proof',
      originKind: 'proof-log',
      title: 'Review gate proof log',
      summary: 'Proof log binding touched-file budgets to rationale enforcement checks.',
      sourceCommit: 'review022safe',
      ref: UNSAFE_PATCH_REVIEW_REF,
      sourcePath: 'proofs/review_gate.log',
      workflowRunId: 'gha_run_review_009',
      workflowPath: '.github/workflows/review-guard.yml',
      workflowJobName: 'prove-review-gate',
      tags: ['review', 'proof', 'auditability'],
      declaredStacks: ['typescript', 'security', 'review'],
      declaredConstraints: ['block unsafe patch bypass'],
      previewSurface: 'proofs/review_gate.log',
      content: 'Proof log\n- reviewer rationale must exist before apply\n- touched-file budgets stay bound to the review receipt'
    }),
    withSession('frontier/deploy-orchestrator', {
      artifactKind: 'runbook',
      originKind: 'workflow-artifact',
      title: 'Deployment drift incident runbook',
      summary: 'Workflow artifact describing deployment drift rollback and validation ordering.',
      sourceCommit: 'deploy404rollback',
      ref: DEPLOYMENT_DRIFT_ROLLBACK_REF,
      workflowRunId: 'gha_run_deploy_404',
      workflowPath: '.github/workflows/deploy-drift.yml',
      workflowJobName: 'rollback-drift',
      artifactName: 'deploy-drift-report.json',
      tags: ['deployment', 'drift', 'rollback'],
      declaredStacks: ['kubernetes', 'typescript', 'github-actions'],
      declaredConstraints: ['restore config before traffic reopen'],
      previewSurface: 'deploy-drift-report.json',
      content: 'Deployment drift report\n- config drift and rollout drift diverged\n- rollback requires environment receipt closure before reopen'
    }),
    withSession('frontier/deploy-orchestrator', {
      artifactKind: 'config',
      originKind: 'config-snapshot',
      title: 'Deployment drift config snapshot',
      summary: 'Combined Helm and Terraform config snapshot for the rollback window.',
      sourceCommit: 'deploy404rollback',
      ref: DEPLOYMENT_DRIFT_ROLLBACK_REF,
      sourcePaths: ['deploy/helm/auth/values.yaml', 'infra/terraform/services/auth/main.tf'],
      tags: ['deployment', 'config', 'rollback'],
      declaredStacks: ['terraform', 'helm', 'kubernetes'],
      declaredConstraints: ['restore config before traffic reopen'],
      previewSurface: 'deploy/helm/auth/values.yaml + infra/terraform/services/auth/main.tf',
      content: 'Config snapshot\n- expected chart version and Terraform state must agree before reopen'
    }),
    withSession('frontier/deploy-orchestrator', {
      artifactKind: 'patch',
      originKind: 'commit-file',
      title: 'Deployment release parity patch',
      summary: 'Patch that rebinds release receipts to the reconciled chart and infra revisions.',
      sourceCommit: 'deploy404rollback',
      ref: DEPLOYMENT_DRIFT_ROLLBACK_REF,
      sourcePath: 'services/deploy/reconcile_release.ts',
      tags: ['deployment', 'patch', 'receipt-binding'],
      declaredStacks: ['typescript', 'kubernetes', 'infra'],
      declaredConstraints: ['emit deployment receipt', 'keep rollout reversible'],
      previewSurface: 'services/deploy/reconcile_release.ts',
      content: 'Patch intent\n- attach chart and infra revisions to the rollback receipt\n- stop traffic reopen until parity is proven'
    }),
    withSession('frontier/private-proof-service', {
      artifactKind: 'proof',
      originKind: 'workflow-artifact',
      title: 'Bounded proof export witness bundle',
      summary: 'Witness bundle for public proof export and redaction closure.',
      sourceCommit: 'privacy065proof',
      ref: BOUNDED_PROOF_EXPORT_REF,
      workflowRunId: 'gha_run_privacy_065',
      workflowPath: '.github/workflows/privacy-proof.yml',
      workflowJobName: 'bounded-proof-export',
      artifactName: 'bounded-proof-export.json',
      tags: ['privacy', 'proof', 'redaction'],
      declaredStacks: ['typescript', 'privacy', 'proof'],
      declaredConstraints: ['bounded public metadata only'],
      previewSurface: 'bounded-proof-export.json',
      content: 'Bounded proof export witness\n- public projection excludes private branch artifacts\n- redaction proof hash matches disclosure proof hash'
    }),
    withSession('frontier/private-proof-service', {
      artifactKind: 'patch',
      originKind: 'commit-file',
      title: 'Bounded proof redaction patch',
      summary: 'Patch that tightens redaction defaults before public proof export.',
      sourceCommit: 'projection006bound',
      ref: BOUNDED_PROOF_EXPORT_REF,
      sourcePath: 'services/redaction/project_public_proof.ts',
      tags: ['privacy', 'patch', 'redaction'],
      declaredStacks: ['typescript', 'privacy', 'policy'],
      declaredConstraints: ['no private artifact leak'],
      previewSurface: 'services/redaction/project_public_proof.ts',
      content: 'Patch intent\n- derive public proof strictly from bounded metadata\n- reject any private artifact that survives projection'
    }),
    withSession('frontier/private-proof-service', {
      artifactKind: 'runbook',
      originKind: 'incident-document',
      title: 'Public proof disclosure runbook',
      summary: 'Runbook for replaying disclosure decisions before publishing bounded proof output.',
      sourceCommit: 'projection006bound',
      ref: BOUNDED_PROOF_EXPORT_REF,
      sourcePath: 'docs/runbooks/public-proof-disclosure.md',
      tags: ['privacy', 'runbook', 'disclosure'],
      declaredStacks: ['markdown', 'privacy', 'policy'],
      declaredConstraints: ['replay disclosure decisions'],
      previewSurface: 'docs/runbooks/public-proof-disclosure.md',
      content: 'Runbook\n- compare projection policy to public artifact inventory\n- publish only after disclosure proof hashes replay cleanly'
    }),
    withSession('frontier/polyglot-gateway', {
      artifactKind: 'patch',
      originKind: 'commit-file',
      title: 'Polyglot gateway rollback patchset',
      summary: 'Patchset coordinating TypeScript, Python, and Rust rollback surfaces.',
      sourceCommit: 'gateway117poly',
      ref: POLYGLOT_GATEWAY_REMEDIATION_REF,
      sourcePaths: ['api/server.ts', 'workers/session_replay.py', 'crates/token_bridge/src/lib.rs'],
      tags: ['polyglot', 'gateway', 'rollback'],
      declaredStacks: ['typescript', 'python', 'rust', 'gateway'],
      declaredConstraints: ['preserve cross-language parity', 'emit audit receipt'],
      previewSurface: 'api/server.ts + workers/session_replay.py + crates/token_bridge/src/lib.rs',
      content: 'Polyglot rollback patchset\n- coordinate issuer rollback across API, replay worker, and token bridge\n- reopen traffic only after parity benchmark rerun'
    }),
    withSession('frontier/polyglot-gateway', {
      artifactKind: 'runbook',
      originKind: 'incident-document',
      title: 'Polyglot rollback runbook',
      summary: 'Runbook for coordinating TypeScript, Python, and Rust rollback sequencing.',
      sourceCommit: 'gateway117poly',
      ref: POLYGLOT_GATEWAY_REMEDIATION_REF,
      sourcePath: 'docs/runbooks/polyglot_gateway_rollback.md',
      tags: ['polyglot', 'runbook', 'gateway'],
      declaredStacks: ['markdown', 'typescript', 'python', 'rust'],
      declaredConstraints: ['preserve cross-language parity', 'keep rollback reversible'],
      previewSurface: 'docs/runbooks/polyglot_gateway_rollback.md',
      content: 'Runbook\n- freeze session replay\n- coordinate rollback across API, worker, and bridge\n- reopen only after parity rerun'
    }),
    withSession('frontier/polyglot-gateway', {
      artifactKind: 'config',
      originKind: 'config-snapshot',
      title: 'Cross-language receipt config snapshot',
      summary: 'Config snapshot for rollback window and cross-language receipt requirements.',
      sourceCommit: 'gateway117poly',
      ref: POLYGLOT_GATEWAY_REMEDIATION_REF,
      sourcePath: 'config/gateway/issuer_policy.yml',
      tags: ['polyglot', 'config', 'gateway'],
      declaredStacks: ['yaml', 'gateway', 'policy'],
      declaredConstraints: ['emit audit receipt', 'preserve cross-language parity'],
      previewSurface: 'config/gateway/issuer_policy.yml',
      content: 'gateway:\n  issuer:\n    rollbackWindowSeconds: 300\n  audit:\n    requireCrossLanguageReceipt: true'
    }),
    withSession('frontier/polyglot-gateway', {
      artifactKind: 'proof',
      originKind: 'proof-log',
      title: 'Gateway parity proof log',
      summary: 'Proof log showing TypeScript, Python, and Rust rollback paths stay aligned.',
      sourceCommit: 'gateway117poly',
      ref: POLYGLOT_GATEWAY_REMEDIATION_REF,
      sourcePath: 'proofs/gateway_parity.log',
      workflowRunId: 'gha_run_gateway_021',
      workflowPath: '.github/workflows/gateway-benchmark.yml',
      workflowJobName: 'prove-gateway-parity',
      tags: ['polyglot', 'proof', 'gateway'],
      declaredStacks: ['typescript', 'python', 'rust', 'gateway'],
      declaredConstraints: ['preserve cross-language parity'],
      previewSurface: 'proofs/gateway_parity.log',
      content: 'Proof log\n- server.ts, session_replay.py, and token bridge preserve the same rollback window\n- cross-language receipts share the same parity root'
    })
  ];
}

/**
 * @param {any[]} [selectedInventoryEntries=[]]
 * @param {any[]} [fallbackPaths=[]]
 * @returns {string[]}
 */
function inventorySourcePaths(selectedInventoryEntries = [], fallbackPaths = []) {
  return summarizeStrings([
    ...selectedInventoryEntries.flatMap((entry) => entry.sourcePaths || []),
    ...fallbackPaths
  ]);
}

/**
 * @param {any} input
 * @param {any[]} [selectedInventoryEntries=[]]
 * @returns {boolean}
 */
function hasExplicitRawFallbackContent(input, selectedInventoryEntries = []) {
  if (typeof input.rawFallbackUsed === 'boolean') return input.rawFallbackUsed;
  if (input.rawFallbackContent !== undefined) return !!String(input.rawFallbackContent || '').trim();
  if (selectedInventoryEntries.length && input.contentDerivedFromSelection !== false) return false;
  return !!String(input.content || '').trim();
}

/**
 * @param {any} input
 * @param {any[]} [selectedInventoryEntries=[]]
 * @returns {string}
 */
function resolveArtifactIntakeMode(input, selectedInventoryEntries = []) {
  const hasInventorySelection = selectedInventoryEntries.length > 0;
  const hasRawFallback = hasExplicitRawFallbackContent(input, selectedInventoryEntries);
  const hasOperatorNote = !!String(input.operatorNote || '').trim();
  if (hasInventorySelection && (hasOperatorNote || hasRawFallback)) return 'repo-artifact-selection-plus-note';
  if (hasInventorySelection) return 'repo-artifact-selection';
  return 'raw-fallback';
}

/**
 * @param {any} input
 * @param {any[]} [selectedInventoryEntries=[]]
 * @param {any} artifactKind
 * @returns {any}
 */
function buildArtifactSelectionSurface(input, selectedInventoryEntries = [], artifactKind = null) {
  const intakeMode = resolveArtifactIntakeMode(input, selectedInventoryEntries);
  const selectedInventoryEntriesSnapshot = selectedInventoryEntries.map(inventorySelectionSnapshot);
  const selectedRepos = summarizeStrings(selectedInventoryEntriesSnapshot.map((entry) => entry['repo']));
  const selectedArtifactKinds = summarizeStrings(selectedInventoryEntries.map((entry) => entry.artifactKind).concat(artifactKind ? [artifactKind] : []));
  const selectedOriginKinds = summarizeStrings(selectedInventoryEntries.map((entry) => entry.originKind));
  const selectedArtifactKindCounts = countValues(selectedInventoryEntries.map((entry) => entry.artifactKind));
  if (artifactKind && !selectedArtifactKindCounts[artifactKind]) selectedArtifactKindCounts[artifactKind] = 1;
  const selectedOriginKindCounts = countValues(selectedInventoryEntries.map((entry) => entry.originKind));
  const rawFallbackUsed = hasExplicitRawFallbackContent(input, selectedInventoryEntries);
  return {
    intakeMode,
    authSessionId: input.authSession?.authSessionId || input.authSessionId || null,
    selectedRepo: selectedRepos[0] || input.sourceRepo || input.authSession?.repo || null,
    selectedRepositoryId: input.authSession?.repositoryId || selectedInventoryEntriesSnapshot[0]?.['repositoryId'] || null,
    selectedInventoryEntryIds: selectedInventoryEntriesSnapshot.map((entry) => entry['inventoryEntryId']),
    selectedInventoryEntries: selectedInventoryEntriesSnapshot,
    selectedInventoryRoot: stableHashObject(selectedInventoryEntriesSnapshot),
    selectedArtifactKinds,
    selectedArtifactKindCounts,
    selectedOriginKinds,
    selectedOriginKindCounts,
    rawFallbackUsed,
    appendedOperatorNote: !!String(input.operatorNote || '').trim(),
    selectionLabel: selectedInventoryEntriesSnapshot.length
      ? `${selectedInventoryEntriesSnapshot.length} repo artifacts from ${selectedRepos[0]}`
      : 'raw fallback content only'
  };
}

/**
 * @param {any} input
 * @param {any[]} [selectedInventoryEntries=[]]
 * @param {any} extracted
 * @returns {any}
 */
function buildAddressingSurface(input, selectedInventoryEntries = [], extracted = {}) {
  const repo = input.sourceRepo || input.authSession?.repo || selectedInventoryEntries[0]?.repo || 'frontier/demo-auth';
  const repoIdentity = buildRepoIdentity(repo);
  const normalizedSourcePaths = inventorySourcePaths(selectedInventoryEntries, input.sourcePaths || extracted.paths);
  const commit =
    input.sourceCommit
    || selectedInventoryEntries.find((entry) => entry.sourceCommit)?.sourceCommit
    || null;
  const workflowRunId =
    input.workflowRunId
    || selectedInventoryEntries.find((entry) => entry.workflowRunId)?.workflowRunId
    || null;
  const workflowPath =
    input.workflowPath
    || selectedInventoryEntries.find((entry) => entry.workflowPath)?.workflowPath
    || null;
  const workflowJobName =
    input.workflowJobName
    || selectedInventoryEntries.find((entry) => entry.workflowJobName)?.workflowJobName
    || null;

  let addressingScope = 'repo';
  if (selectedInventoryEntries.length > 1) addressingScope = 'multi-artifact-selection';
  else if (workflowRunId) addressingScope = selectedInventoryEntries[0]?.originKind === 'workflow-artifact' ? 'workflow-artifact' : 'workflow-run';
  else if (normalizedSourcePaths.length) addressingScope = normalizedSourcePaths.length > 1 ? 'multi-artifact-selection' : 'repo-file';
  else if (commit) addressingScope = 'repo-commit';
  const addressedInventoryEntries = selectedInventoryEntries.map((entry) => {
    const addressing = entry.addressing || buildInventoryAddressingSurface(entry);
    return {
      inventoryEntryId: entry.inventoryEntryId,
      artifactKind: entry.artifactKind,
      artifactType: entry.artifactType,
      originKind: entry.originKind,
      primaryAddressRef: addressing.primaryAddressRef,
      contentRoot: entry.contentRoot || null,
      addressingRoot: addressing.addressingRoot
    };
  });
  const surface = {
    addressingScope,
    repo,
    owner: repoIdentity.owner,
    repoName: repoIdentity.name,
    repositoryId: repoIdentity.repositoryId,
    repositoryNodeId: repoIdentity.repositoryNodeId,
    ref: input.sourceRef || input.authSession?.defaultRef || selectedInventoryEntries.find((entry) => entry.ref)?.ref || null,
    commit,
    workflowRunId,
    workflowPath,
    workflowJobName,
    sourcePaths: normalizedSourcePaths,
    selectedInventoryEntryIds: selectedInventoryEntries.map((entry) => entry.inventoryEntryId),
    selectedInventoryAddressRefs: addressedInventoryEntries.map((entry) => entry.primaryAddressRef),
    addressedInventoryEntries,
    primaryAddressRef: normalizedSourcePaths[0] || addressedInventoryEntries[0]?.primaryAddressRef || workflowRunId || commit || repo
  };
  return {
    ...surface,
    addressingRoot: stableHashObject(surface)
  };
}

/**
 * @param {unknown} value
 * @returns {null | Record<string, unknown>}
 */
function normalizeWalletAuthorizationProof(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = /** @type {Record<string, unknown>} */ (value);
  const signature = typeof record.signature === 'string' && record.signature.trim() ? record.signature.trim() : null;
  const message = typeof record.message === 'string' && record.message.trim() ? record.message.trim() : null;
  if (!signature || !message) return null;
  return {
    kind: typeof record.kind === 'string' ? record.kind : 'bitcode_deposit_authorization',
    proofKind: typeof record.proofKind === 'string' ? record.proofKind : 'bitcoin_message_signature',
    provider: typeof record.provider === 'string' ? record.provider : null,
    providerLabel: typeof record.providerLabel === 'string' ? record.providerLabel : null,
    signerAddress: typeof record.signerAddress === 'string' ? record.signerAddress : null,
    signedAt: typeof record.signedAt === 'string' ? record.signedAt : null,
    messageHash: stableHashObject(message),
    signatureHash: stableHashObject(signature),
    signatureCaptured: true
  };
}

/**
 * @param {any} input
 * @param {any} assetId
 * @param {any} contentRoot
 * @param {any} addressingSurface
 * @param {any} artifactSelectionSurface
 * @param {any} githubAppAuthSurface
 * @returns {any}
 */
function buildSigningSurface(input, assetId, contentRoot, addressingSurface, artifactSelectionSurface, githubAppAuthSurface) {
  const walletAuthorizationProof = normalizeWalletAuthorizationProof(input.walletAuthorizationProof);
  const signerAddress = input.signerAddress || input.authSession?.defaultSignerAddress || `did:key:${toSlug(input.author)}`;
  const signingAlgorithm = input.signingAlgorithm || input.authSession?.signingAlgorithm || 'ed25519';
  const keySource = input.keySource || input.authSession?.keySource || 'manual-upload-key';
  const signedStatement = {
    statementKind: 'bitcode-asset-intake-attestation.v11',
    assetId,
    contentRoot,
    repo: addressingSurface.repo,
    addressingRoot: addressingSurface.addressingRoot,
    selectionRoot: artifactSelectionSurface.selectedInventoryRoot,
    githubAppAuthRoot: githubAppAuthSurface.authPayloadHash,
    signerAddress,
    signingAlgorithm
  };
  return {
    signerAddress,
    signerClass: 'issuer-principal',
    signingAlgorithm,
    keySource,
    statementKind: signedStatement.statementKind,
    payloadHash: stableHashObject(signedStatement),
    signatureChecksPass: input.signatureChecksPass !== false && (!walletAuthorizationProof || walletAuthorizationProof.signatureCaptured === true),
    signedPayloadHashMatchesContentRoot: input.signedPayloadHashMatchesContentRoot !== false,
    attestationHash: stableHashObject({
      signerAddress,
      signingAlgorithm,
      payloadHash: stableHashObject(signedStatement),
      walletAuthorizationProof
    }),
    walletAuthorizationProof,
    signedAddressingRoot: addressingSurface.addressingRoot,
    signedSelectionRoot: artifactSelectionSurface.selectedInventoryRoot,
    signedGitHubAppAuthRoot: githubAppAuthSurface.authPayloadHash
  };
}

/**
 * @param {any} input
 * @param {any[]} [selectedInventoryEntries=[]]
 * @returns {any}
 */
function buildGitHubAppAuthSurface(input, selectedInventoryEntries = []) {
  const authSession = input.authSession || null;
  const repo = input.sourceRepo || authSession?.repo || selectedInventoryEntries[0]?.repo || 'frontier/demo-auth';
  const repoIdentity = buildRepoIdentity(repo);
  const manualPermissions = {};
  if (!authSession) {
    const surfaceCore = {
      authMechanism: 'manual-unbound',
      authSessionId: null,
      appId: null,
      appSlug: null,
      installationId: input.installationId || null,
      installationAccountLogin: null,
      installationAccountId: null,
      installationAccountNodeId: null,
      installationAccountType: null,
      operatorLogin: null,
      owner: repoIdentity.owner,
      repoName: repoIdentity.name,
      repositoryId: repoIdentity.repositoryId,
      repositoryNodeId: repoIdentity.repositoryNodeId,
      repositoryVisibility: 'private',
      repositorySelection: 'selected',
      permissions: manualPermissions,
      permissionsRoot: stableHashObject(manualPermissions),
      tokenBoundary: {
        mintingState: 'manual-unbound',
        tokenMaterialPresent: false,
        modeledOnly: false,
        liveExchangeImplemented: false,
        repo,
        installationId: input.installationId || null,
        readableScopes: [],
        writableScopes: []
      },
      ...buildBoundaryDescriptions(
        'No authenticated GitHub App session is bound to this raw/manual candidate asset.',
        'A production flow would require a real installation-scoped GitHub App token for repository inventory selection.'
      )
    };
    return {
      ...surfaceCore,
      authPayloadHash: stableHashObject(surfaceCore)
    };
  }
  const surfaceCore = {
    authMechanism: authSession.authMechanism,
    authSessionId: authSession.authSessionId,
    appId: authSession.appId,
    appSlug: authSession.appSlug,
    installationId: authSession.installationId,
    installationAccountLogin: authSession.installationAccountLogin,
    installationAccountId: authSession.installationAccountId,
    installationAccountNodeId: authSession.installationAccountNodeId,
    installationAccountType: authSession.installationAccountType,
    operatorLogin: authSession.operatorLogin,
    owner: authSession.owner,
    repoName: authSession.repoName,
    repositoryId: authSession.repositoryId,
    repositoryNodeId: authSession.repositoryNodeId,
    repositoryVisibility: authSession.repositoryVisibility,
    repositorySelection: authSession.repositorySelection,
    permissions: authSession.permissions,
    permissionsRoot: authSession.permissionsRoot,
    sessionIssuedAt: authSession.sessionIssuedAt,
    sessionExpiresAt: authSession.sessionExpiresAt,
    tokenBoundary: authSession.tokenBoundary,
    ...buildBoundaryDescriptions(
      authSession.localBoundary || authSession.profileABoundary,
      authSession.externalBoundary || authSession.profileBBoundary
    )
  };
  return {
    ...surfaceCore,
    authPayloadHash: authSession.authPayloadHash || stableHashObject(surfaceCore)
  };
}

/**
 * @param {any} input
 * @param {any} content
 * @param {any} extracted
 * @param {any} artifactKind
 * @param {any} artifactType
 * @param {any[]} [selectedInventoryEntries=[]]
 * @returns {any}
 */
function buildArtifactUploadSurface(input, content, extracted, artifactKind, artifactType, selectedInventoryEntries = []) {
  const visualPreview = String(input.visualPreview || input.summary || content.split(/\n\s*\n/g)[0] || content).slice(0, 320);
  const artifactSelectionSurface = buildArtifactSelectionSurface(input, selectedInventoryEntries, artifactKind);
  return {
    uploadId: `upload_${sha256(`${input.title}:${content}`).slice(0, 12)}`,
    artifactKind,
    artifactType,
    artifactSelectionSurface,
    precision: {
      kindDeterminedBy: input.artifactKind ? 'user-specified' : 'defaulted',
      typeDeterminedBy: input.artifactType ? 'user-specified' : 'kind-mapped',
      sourceSignalCounts: {
        symbols: extracted.symbols.length,
        paths: extracted.paths.length,
        configKeys: extracted.configKeys.length
      },
      inventorySelectionCount: selectedInventoryEntries.length,
      inventorySelectionRoot: artifactSelectionSurface.selectedInventoryRoot
    },
    surfaces: [
      { surfaceId: 'visual-preview', mediaType: 'text/markdown', role: 'visual', available: !!visualPreview, valuePreview: visualPreview },
      { surfaceId: 'raw-content', mediaType: 'text/plain', role: 'raw', available: !!content, valuePreview: content.slice(0, 220) },
      { surfaceId: 'code-analysis-summary', mediaType: 'application/json', role: 'derived', available: true, valuePreview: JSON.stringify({ symbols: extracted.symbols.length, paths: extracted.paths.length, configKeys: extracted.configKeys.length }) },
      { surfaceId: 'repo-artifact-selection', mediaType: 'application/json', role: 'selection', available: selectedInventoryEntries.length > 0, valuePreview: JSON.stringify({ selectedInventoryEntryIds: selectedInventoryEntries.map((entry) => entry.inventoryEntryId), selectedInventoryRoot: artifactSelectionSurface.selectedInventoryRoot, originKinds: summarizeStrings(selectedInventoryEntries.map((entry) => entry.originKind)) }) }
    ],
    githubBinding: {
      sourceProvider: input.sourceProvider || 'github',
      sourceRepo: input.sourceRepo || input.authSession?.repo || selectedInventoryEntries[0]?.repo || 'frontier/demo-auth',
      sourceCommit: input.sourceCommit || selectedInventoryEntries.find((entry) => entry.sourceCommit)?.sourceCommit || null,
      workflowRunId: input.workflowRunId || selectedInventoryEntries.find((entry) => entry.workflowRunId)?.workflowRunId || null,
      workflowPath: input.workflowPath || selectedInventoryEntries.find((entry) => entry.workflowPath)?.workflowPath || null,
      authSessionId: input.authSession?.authSessionId || null,
      repositoryId: input.authSession?.repositoryId || null,
      repositoryNodeId: input.authSession?.repositoryNodeId || null,
      selectedInventoryEntryIds: selectedInventoryEntries.map((entry) => entry.inventoryEntryId),
      selectedInventoryRoot: artifactSelectionSurface.selectedInventoryRoot,
      authPayloadHash: input.authSession?.authPayloadHash || null,
      ...buildBoundaryDescriptions(
        'Stored locally as modeled metadata only.',
        'Would bind to real GitHub/App installation objects and remote fetches.'
      )
    }
  };
}

/**
 * @param {any} __0
 * @returns {any}
 */
function buildExternalBoundaryManifest({
  buyer,
  read,
  selectedCandidates,
  assetPack,
  settlementPreview,
  paymentMode,
  externalEnvironmentProfile = null,
  externalExecutionPolicy = null,
  externalTelemetryPolicy = null,
  externalTelemetrySummary = null,
  networkCapabilityManifest = null,
  githubAppBinding = null
}) {
  const bitcoinDemonstrationService = paymentMode ? buildBitcoinDemonstrationServiceDescriptor() : null;
  const selectedGithubBindings = selectedCandidates.map((/** @type {any} */ candidate) => ({
    assetId: candidate.assetId,
    sourceRepo: candidate.asset.githubBoundary?.sourceRepo,
    workflowRunId: candidate.asset.githubBoundary?.workflowRunId,
    sourceCommit: candidate.asset.githubBoundary?.sourceCommit
  }));
  const configuredEnvironmentMode = externalEnvironmentProfile?.configuredEnvironmentMode || null;
  const actualityDisposition = externalEnvironmentProfile?.actualityDisposition || null;
  const supportedEnvironmentModes = externalEnvironmentProfile?.supportedEnvironmentModes || [];
  const interfaceSummaryById = Object.fromEntries(
    (externalTelemetrySummary?.interfaceSummaries || []).map((entry) => [entry.interfaceId, entry])
  );
  const draftRealizationInterfaces = externalEnvironmentProfile
    ? [
        buildExternalBoundaryInterface({
          interfaceId: 'bitcoin-mainchain-execution',
          label: 'Bitcoin mainchain execution receipts',
          status: 'implemented-as-draft-target-realization-surface',
          localPrototype: {
            implemented: true,
            surface: 'mode-isolated runtime emits mainchain intent, execution, observation, and proof receipts',
            configuredEnvironmentMode,
            actualityDisposition,
            executionClass: interfaceSummaryById['bitcoin-mainchain-execution']?.executionClass || null,
            reconciliationState: interfaceSummaryById['bitcoin-mainchain-execution']?.reconciliationState || null,
            telemetryCoverageState: interfaceSummaryById['bitcoin-mainchain-execution']?.telemetryCoverageState || null,
            artifactRefs: [
              '.bitcode/bitcoin-network-intent.json',
              '.bitcode/bitcoin-network-execution.json',
              '.bitcode/bitcoin-network-observation.json',
              '.bitcode/external-realization-proof.json'
            ]
          },
          externalBoundary: {
            implemented: false,
            requiredForLive: true,
            contract: ['assemble network-ready spend intent', 'observe broadcast and confirmation state', `bind mainchain execution to ${ACTIVE_PROJECT_LABEL} bundle and settlement identities`],
            boundaryArtifacts: ['bitcoin.mainchain-intent', 'bitcoin.mainchain-execution', 'bitcoin.mainchain-observation']
          }
        }),
        buildExternalBoundaryInterface({
          interfaceId: 'repeated-read-payment-execution',
          label: 'Repeated-read payment processor receipts',
          status: 'implemented-as-draft-target-realization-surface',
          localPrototype: {
            implemented: true,
            surface: 'mode-isolated runtime emits repeated-read invoice intent, execution, and observation receipts',
            configuredEnvironmentMode,
            actualityDisposition,
            executionClass: interfaceSummaryById['repeated-read-payment-execution']?.executionClass || null,
            reconciliationState: interfaceSummaryById['repeated-read-payment-execution']?.reconciliationState || null,
            telemetryCoverageState: interfaceSummaryById['repeated-read-payment-execution']?.telemetryCoverageState || null,
            artifactRefs: [
              '.bitcode/repeated-read-payment-intent.json',
              '.bitcode/repeated-read-payment-execution.json',
              '.bitcode/repeated-read-payment-observation.json',
              '.bitcode/external-realization-proof.json'
            ]
          },
          externalBoundary: {
            implemented: false,
            requiredForLive: true,
            contract: ['issue invoice or repeated-read payment intent', 'observe repeated-read payment acceptance or settlement drift', `bind repeated-read access state back to ${ACTIVE_PROJECT_LABEL} anchor and journal policy`],
            boundaryArtifacts: ['bitcoin.repeated-read-intent', 'bitcoin.repeated-read-execution', 'bitcoin.repeated-read-observation']
          }
        }),
        buildExternalBoundaryInterface({
          interfaceId: 'sidechain-execution',
          label: 'Sidechain execution receipts',
          status: 'implemented-as-draft-target-realization-surface',
          localPrototype: {
            implemented: true,
            surface: 'mode-isolated runtime emits sidechain execution posture and checkpoint receipts',
            configuredEnvironmentMode,
            actualityDisposition,
            executionClass: interfaceSummaryById['sidechain-execution']?.executionClass || null,
            reconciliationState: interfaceSummaryById['sidechain-execution']?.reconciliationState || null,
            telemetryCoverageState: interfaceSummaryById['sidechain-execution']?.telemetryCoverageState || null,
            artifactRefs: [
              '.bitcode/sidechain-execution-receipt.json',
              '.bitcode/external-realization-proof.json'
            ]
          },
          externalBoundary: {
            implemented: false,
            requiredForLive: true,
            contract: ['observe sidechain bridge execution', 'bind checkpoint posture to mainchain audit closure', 'fail closed on sidechain reconciliation drift'],
            boundaryArtifacts: ['sidechain.execution-intent', 'sidechain.execution-receipt', 'sidechain.checkpoint-observation']
          }
        }),
        buildExternalBoundaryInterface({
          interfaceId: 'compute-container-execution',
          label: 'Compute container execution receipts',
          status: 'implemented-as-draft-target-realization-surface',
          localPrototype: {
            implemented: true,
            surface: 'mode-isolated runtime emits compute container manifests, attestation refs, and proof closure',
            configuredEnvironmentMode,
            actualityDisposition,
            executionClass: interfaceSummaryById['compute-container-execution']?.executionClass || null,
            reconciliationState: interfaceSummaryById['compute-container-execution']?.reconciliationState || null,
            telemetryCoverageState: interfaceSummaryById['compute-container-execution']?.telemetryCoverageState || null,
            artifactRefs: [
              '.bitcode/compute-container-manifest.json',
              '.bitcode/compute-container-execution.json',
              '.bitcode/container-reality-proof.json'
            ]
          },
          externalBoundary: {
            implemented: false,
            requiredForLive: true,
            contract: ['select attested execution image', 'emit execution and attestation receipts', `bind proof outputs back to ${ACTIVE_PROJECT_LABEL} artifact identities`],
            boundaryArtifacts: ['compute.container-manifest', 'compute.execution-receipt', 'compute.attestation-receipt']
          }
        }),
        buildExternalBoundaryInterface({
          interfaceId: 'storage-container-execution',
          label: 'Storage publication and retrieval receipts',
          status: 'implemented-as-draft-target-realization-surface',
          localPrototype: {
            implemented: true,
            surface: 'mode-isolated runtime emits storage manifests, publication receipts, retrieval receipts, and proof closure',
            configuredEnvironmentMode,
            actualityDisposition,
            executionClass: interfaceSummaryById['storage-container-execution']?.executionClass || null,
            reconciliationState: interfaceSummaryById['storage-container-execution']?.reconciliationState || null,
            telemetryCoverageState: interfaceSummaryById['storage-container-execution']?.telemetryCoverageState || null,
            artifactRefs: [
              '.bitcode/storage-container-manifest.json',
              '.bitcode/storage-publication-receipt.json',
              '.bitcode/storage-retrieval-receipt.json',
              '.bitcode/container-reality-proof.json'
            ]
          },
          externalBoundary: {
            implemented: false,
            requiredForLive: true,
            contract: ['publish artifact scopes to durable storage', 'observe retrievability and retention posture', 'fail closed on storage publication or retrieval drift'],
            boundaryArtifacts: ['storage.container-manifest', 'storage.publication-receipt', 'storage.retrieval-receipt']
          }
        }),
        buildExternalBoundaryInterface({
          interfaceId: 'github-live-interface',
          label: 'GitHub live session and mutation receipts',
          status: 'implemented-as-draft-target-realization-surface',
          localPrototype: {
            implemented: true,
            surface: 'mode-isolated runtime emits GitHub live session, fetch, branch-publication, and PR-update receipts',
            configuredEnvironmentMode,
            actualityDisposition,
            targetedRepoCount: githubAppBinding?.targetedRepoCount || 0,
            executionClass: interfaceSummaryById['github-live-interface']?.executionClass || null,
            reconciliationState: interfaceSummaryById['github-live-interface']?.reconciliationState || null,
            telemetryCoverageState: interfaceSummaryById['github-live-interface']?.telemetryCoverageState || null,
            artifactRefs: [
              '.bitcode/github-live-session.json',
              '.bitcode/github-inventory-fetch-receipt.json',
              '.bitcode/github-artifact-fetch-receipt.json',
              '.bitcode/github-branch-publication-receipt.json',
              '.bitcode/github-pr-update-receipt.json',
              '.bitcode/github-live-interface-proof.json'
            ]
          },
          externalBoundary: {
            implemented: false,
            requiredForLive: true,
            contract: ['bind GitHub App session to one environment and installation target', 'emit fetch and mutation receipts for repo actions', 'fail closed on GitHub reconciliation drift'],
            boundaryArtifacts: ['github.live-session', 'github.fetch-receipt', 'github.mutation-receipt']
          }
        })
      ]
    : [];
  const paymentObservationInterface = paymentMode
    ? [
        buildExternalBoundaryInterface({
          interfaceId: 'bitcoin-payment-observation',
          label: 'Bitcoin payment observation + confirmation policy',
          status: 'implemented-as-stubbed-testnet-service',
          localPrototype: {
            implemented: true,
            surface: `deterministic stubbed-testnet service assembles spend carriers and observation receipts bound to ${ACTIVE_PROJECT_LABEL} settlement refs`,
            serviceMode: BITCOIN_DEMONSTRATION_SERVICE_MODE,
            serviceCapabilities: bitcoinDemonstrationService,
            artifactRefs: ['.bitcode/bitcoin-settlement-intent.json', '.bitcode/bitcoin-settlement-observation.json', '.bitcode/bitcoin-treasury-policy.json']
          },
          externalBoundary: {
            implemented: false,
            requiredForLive: true,
            contract: ['assemble buyer spend intent or invoice', 'observe payment or invoice state', `bind observed value and confirmation state to the ${ACTIVE_PROJECT_LABEL} settlement bundle`],
            boundaryArtifacts: ['bitcoin.settlement-intent', 'bitcoin.settlement-observation', 'bitcoin.confirmation-receipt']
          }
        }),
        buildExternalBoundaryInterface({
          interfaceId: 'bitcoin-anchor-publication',
          label: 'Bitcoin anchor publication + public receipt',
          status: 'implemented-as-stubbed-testnet-service',
          localPrototype: {
            implemented: true,
            surface: 'deterministic stubbed-testnet service assembles commitment publication envelopes and anchor receipts',
            serviceMode: BITCOIN_DEMONSTRATION_SERVICE_MODE,
            serviceCapabilities: bitcoinDemonstrationService,
            artifactRefs: ['.bitcode/bitcoin-commitment-manifest.json', '.bitcode/bitcoin-anchor.json', '.bitcode/bitcoin-bounded-public-anchor.json']
          },
          externalBoundary: {
            implemented: false,
            requiredForLive: true,
            contract: ['publish bounded-public and private commitment roots', 'record tx or checkpoint reference', 'project a bounded-public anchor receipt without leaking private scope'],
            boundaryArtifacts: ['bitcoin.anchor-publication-request', 'bitcoin.anchor-publication-receipt', 'bitcoin.bounded-public-anchor']
          }
        }),
        ...(paymentMode === 'checkpointed-sidechain-bridge'
          ? [buildExternalBoundaryInterface({
              interfaceId: 'bitcoin-sidechain-bridge',
              label: 'Bitcoin sidechain bridge + checkpoint binding',
              status: 'implemented-as-stubbed-testnet-service',
              localPrototype: {
                implemented: true,
                surface: 'deterministic stubbed-testnet service assembles sidechain checkpoint receipts and mainchain anchor requirements',
                serviceMode: BITCOIN_DEMONSTRATION_SERVICE_MODE,
                serviceCapabilities: bitcoinDemonstrationService,
                artifactRefs: ['.bitcode/bitcoin-settlement-observation.json', '.bitcode/bitcoin-treasury-policy.json', '.bitcode/bitcoin-anchor.json']
              },
              externalBoundary: {
                implemented: false,
                requiredForLive: true,
                contract: ['observe sidechain settlement acceptance', 'bind sidechain checkpoint to periodic mainchain anchor', 'fail closed if checkpoint anchor never materializes'],
                boundaryArtifacts: ['sidechain.bridge-observation', 'sidechain.checkpoint-receipt', 'bitcoin.checkpoint-anchor']
              }
            })]
          : [])
      ]
    : [];

  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    configuredEnvironmentMode,
    actualityDisposition,
    supportedEnvironmentModes,
    executionPolicyRef: externalExecutionPolicy?.policyId || null,
    telemetryPolicyRef: externalTelemetryPolicy?.policyId || null,
    networkCapabilityManifestRef: networkCapabilityManifest?.manifestId || null,
    repo: buyer.repo,
    assetPackId: assetPack.assetPackId,
    bundleId: settlementPreview.bundleId,
    interfaces: [
      buildExternalBoundaryInterface({
        interfaceId: 'github-app-auth',
        label: 'GitHub App auth + installation context',
        status: 'modeled-local-boundary',
        localPrototype: { implemented: true, surface: 'modeled installation ID + repo binding only', artifactRefs: ['.bitcode/github-boundary.json', '.bitcode/external-boundary-manifest.json'] },
        externalBoundary: { implemented: false, requiredForLive: true, contract: ['exchange app JWT for installation token', 'bind installation to buyer repo + branch permissions', 'record token expiry + scope envelope'], boundaryArtifacts: ['github.installation-binding', 'github.installation-token-envelope'] }
      }),
      buildExternalBoundaryInterface({
        interfaceId: 'workflow-artifact-fetch',
        label: 'Workflow artifact fetch + benchmark evidence',
        status: 'partially-localized',
        localPrototype: { implemented: true, surface: 'canonical run evidence is seeded locally and bound to read measurement', artifactRefs: ['.bitcode/read-measurement.json', '.bitcode/benchmark-target.json'] },
        externalBoundary: { implemented: false, requiredForLive: true, contract: ['fetch workflow artifacts by run ID', 'verify artifact media type + digest', 'normalize benchmark outputs fail-closed'], boundaryArtifacts: ['github.workflow-fetch-request', 'github.workflow-fetch-response', 'benchmark.canonical-output-manifest'] }
      }),
      buildExternalBoundaryInterface({
        interfaceId: 'branch-pr-actions',
        label: 'Branch / PR / comment / review actions',
        status: 'modeled-local-boundary',
        localPrototype: { implemented: true, surface: 'artifacts specify intended branch outputs without live writes', artifactRefs: ['.bitcode/asset-pack-evidence.json', '.bitcode/profile-composition.json'] },
        externalBoundary: { implemented: false, requiredForLive: true, contract: ['create/update branch', 'push materialized artifacts', 'open or update PR', 'publish comments / review annotations'], boundaryArtifacts: ['github.branch-action-request', 'github.pr-action-request', 'github.review-action-request'] }
      }),
      buildExternalBoundaryInterface({
        interfaceId: 'model-execution',
        label: 'Prompt execution + evaluator routing',
        status: 'implemented-as-stand-in',
        localPrototype: { implemented: true, surface: 'deterministic stand-in evaluator and prompt replay metadata', artifactRefs: ['.bitcode/eval-manifest.json', '.bitcode/prompt-surfaces.json', '.bitcode/system-proof-bundle.json'] },
        externalBoundary: { implemented: false, requiredForLive: true, contract: ['select model/provider', 'execute prompt with trace capture', 'bind output to evaluator receipt + prompt hash'], boundaryArtifacts: ['model.execution-request', 'model.execution-receipt', 'model.trace-manifest'] }
      }),
      buildExternalBoundaryInterface({
        interfaceId: 'vector-store',
        label: 'Embedding + vector retrieval substrate',
        status: 'implemented-as-local-stand-in',
        localPrototype: { implemented: true, surface: 'local deterministic vectors and recall contracts', artifactRefs: ['.bitcode/unit-catalog.json', '.bitcode/eval-manifest.json'] },
        externalBoundary: { implemented: false, requiredForLive: true, contract: ['upsert embedding documents', 'execute filtered similarity search', 'bind vector space/version metadata'], boundaryArtifacts: ['vector.upsert-manifest', 'vector.search-request', 'vector.search-response'] }
      }),
      buildExternalBoundaryInterface({
        interfaceId: 'signer-verification',
        label: 'Signer / identity verification',
        status: 'modeled-local-boundary',
        localPrototype: { implemented: true, surface: 'modeled signer bindings, attestation checks, and policy gates', artifactRefs: ['.bitcode/identity-bindings.json', '.bitcode/verification-report.json'] },
        externalBoundary: { implemented: false, requiredForLive: true, contract: ['resolve signer identity', 'verify attestation chain', 'bind signer to org / repo authority'], boundaryArtifacts: ['identity.resolve-request', 'identity.verification-receipt', 'signer.authority-binding'] }
      }),
      buildExternalBoundaryInterface({
        interfaceId: 'settlement-network-effects',
        label: 'Settlement execution + network effects',
        status: 'implemented-as-local-accounting-only',
        localPrototype: { implemented: true, surface: 'deterministic journal diff + exact accounting invariants', artifactRefs: ['.bitcode/settlement-preview.json', '.bitcode/settlement-proof.json', '.bitcode/journal-diff.json'] },
        externalBoundary: { implemented: false, requiredForLive: true, contract: ['submit settlement transaction', 'wait for network confirmation', 'publish claim / redemption events'], boundaryArtifacts: ['settlement.execution-request', 'settlement.execution-receipt', 'settlement.network-observation'] }
      }),
      ...draftRealizationInterfaces,
      ...paymentObservationInterface
    ],
    selectedGithubBindings,
    paymentMode: paymentMode || null
  };
}

function buildRecallChannelContracts() {
  return readMeasurementRuntime.buildRecallChannelContracts();
}

/**
 * @param {any} branchMode
 * @returns {any}
 */
function allowedUseTiersForBranchMode(branchMode) {
  return evaluationMaterializationRuntime.allowedUseTiersForBranchMode(branchMode);
}

/**
 * @param {any} useTier
 * @param {any} branchMode
 * @returns {any}
 */
function useTierRights(useTier, branchMode) {
  return evaluationMaterializationRuntime.useTierRights(useTier, branchMode);
}

/**
 * @param {any} __0
 * @returns {any}
 */
function derivationRecord({ field, source, policy = 'required', confidence = NormalizationPressure.HIGH, evidenceRefs = [], notes }) {
  return {
    field,
    source,
    policy,
    confidence,
    evidenceRefs: summarizeStrings(evidenceRefs),
    ...(notes ? { notes } : {})
  };
}

/**
 * @param {any} value
 * @returns {string}
 */
function normalizeCaseId(value) {
  return toSlug(value).replace(/-/g, '-');
}

/**
 * @param {any} value
 * @returns {string}
 */
function normalizeWeakDimension(value) {
  return toSlug(value).replace(/-/g, '-');
}

/**
 * @param {any} binding
 * @param {any} action
 * @param {any} resourceRef
 * @param {any} policyState
 * @returns {any}
 */
function makeAuthorizationDecision(binding, action, resourceRef, policyState) {
  if (!binding) {
    return {
      principalId: 'unknown',
      action,
      resourceRef,
      decision: 'deny',
      policyRef: DEFAULT_POLICY_REF,
      reasons: ['No identity binding found for requested action.']
    };
  }
  const classRules = policyState.authorizationMatrix[binding.principalClass] || {};
  const rule = classRules[action] || { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['No explicit authorization rule.'] };
  return {
    principalId: binding.principalId,
    action,
    resourceRef,
    decision: rule.allow ? 'allow' : 'deny',
    policyRef: rule.policyRef || DEFAULT_POLICY_REF,
    reasons: rule.reasons || []
  };
}

function buildPolicyState() {
  return {
    policyRef: DEFAULT_POLICY_REF,
    releaseId: 'policy-release-bitcode-v11-demo-2026-04-03',
    retentionPolicies: {
      'retention/private-remediation-30d': {
        retentionPolicyId: 'retention/private-remediation-30d',
        appliesTo: ['repo-private-source', 'licensed-source-material', 'private-branch-derived-artifact', 'verification-evidence', 'settlement-preview', 'private-proof-artifact'],
        retentionWindowDays: 30,
        cleanupAction: 'disable-branch-and-expire-private-artifacts'
      },
      'retention/bounded-public-365d': {
        retentionPolicyId: 'retention/bounded-public-365d',
        appliesTo: ['bounded-public-proof-metadata'],
        retentionWindowDays: 365,
        cleanupAction: 'preserve-bounded-proof-metadata'
      }
    },
    disclosurePolicies: {
      'disclosure/private-only': {
        disclosurePolicyId: 'disclosure/private-only',
        allowedPublic: false,
        revocationBehavior: 'revoke-read-access-and-hide-private-branch'
      },
      'disclosure/bounded-public': {
        disclosurePolicyId: 'disclosure/bounded-public',
        allowedPublic: true,
        revocationBehavior: 'retain-hashes-only'
      }
    },
    issuers: {
      allowed: ['did:key:garrett', 'did:key:eve'],
      restricted: ['did:key:avery'],
      revoked: []
    },
    issuerHistory: {
      'did:key:garrett': { accepted: 7, revoked: 0 },
      'did:key:eve': { accepted: 5, revoked: 0 },
      'did:key:avery': { accepted: 1, revoked: 0 }
    },
    authorizationMatrix: {
      'buyer-principal': {
        'read:private-branch': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: ['Buyer principal may inspect private remediation delivery.'] },
        'materialize:selected-source-material': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: ['Buyer event authorizes licensed source material to be staged into the private branch.'] },
        'settle:journal-event': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: ['Buyer principal may authorize the fixed local settlement event.'] },
        'derive:bounded-public-proof-metadata': { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['Buyer principals do not publish bounded public proof metadata directly.'] },
        'read:bounded-public-proof': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: ['Buyer may inspect bounded public proof metadata.'] },
        'open:delivery': { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['Delivery-open is blocked in the deterministic local prototype.'] }
      },
      'bitcode-system-principal': {
        'read:private-branch': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: [`${ACTIVE_PROJECT_LABEL} system principal materializes private artifacts.`] },
        'materialize:selected-source-material': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: [`${ACTIVE_PROJECT_LABEL} branch materializer may stage selected source material under .bitcode/source-material/.`] },
        'settle:journal-event': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: [`${ACTIVE_PROJECT_LABEL} settlement engine executes deterministic journal settlement.`] },
        'review:measured-read': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: [`${ACTIVE_PROJECT_LABEL} read-review gate may accept, reject, or request remeasurement before fit search.`] },
        'write:private-branch': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: [`${ACTIVE_PROJECT_LABEL} system principal stages remediation artifacts.`] },
        'derive:bounded-public-proof-metadata': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: [`${ACTIVE_PROJECT_LABEL} proof publisher may derive bounded proof metadata from the private proof surface.`] },
        'read:bounded-public-proof': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: [`${ACTIVE_PROJECT_LABEL} system principal may inspect bounded proof metadata.`] }
      },
      'github-app-installation-principal': {
        'read:repo-artifact-inventory': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: ['Installation-scoped GitHub App session may enumerate repository artifact inventory.'] },
        'read:private-branch': { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['GitHub App installation sessions do not gain private branch read by default in the local demo.'] },
        'write:private-branch': { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['GitHub App installation sessions are modeled as intake auth, not branch writers.'] },
        'settle:journal-event': { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['GitHub App installation sessions cannot trigger settlement.'] }
      },
      'authorized-reviewer': {
        'read:private-branch': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: ['Authorized reviewer access is allowed under private review policy.'] },
        'settle:journal-event': { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['Authorized reviewers may not trigger settlement.'] }
      },
      'issuer-principal': {
        'read:private-branch': { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['Issuers do not gain read access by default.'] },
        'settle:journal-event': { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['Issuers cannot self-settle the buyer event.'] }
      },
      'public-reader': {
        'read:bounded-public-proof': { allow: true, policyRef: DEFAULT_POLICY_REF, reasons: ['Only bounded public proof metadata may be public.'] },
        'read:private-branch': { allow: false, policyRef: DEFAULT_POLICY_REF, reasons: ['Private remediation material is never public by default.'] }
      }
    },
    revokedResourceRefs: [],
    revocationPolicy: {
      settlementOpenBlockedWhenRevoked: true,
      deliveryOpenBlockedWhenRevoked: true
    }
  };
}

/**
 * @param {any} policyState
 * @returns {any}
 */
function buildPolicyRelease(policyState) {
  return {
    releaseId: policyState.releaseId,
    policyRef: policyState.policyRef,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    prototypeOnlyModeledControls: true,
    issuerClasses: {
      allowed: policyState.issuers.allowed.length,
      restricted: policyState.issuers.restricted.length,
      revoked: policyState.issuers.revoked.length
    },
    retentionPolicyIds: Object.keys(policyState.retentionPolicies),
    disclosurePolicyIds: Object.keys(policyState.disclosurePolicies),
    revocationRules: policyState.revocationPolicy
  };
}

/**
 * @returns {any}
 */
function buildGithubActionsBenchmarkParser() {
  return {
    parserKind: 'github-actions.auth-remediation.v3',
    parserVersion: '3.0.0',
    /**
     * @param {any} runEvidence
     * @returns {any}
     */
    parse(runEvidence) {
      const extracted = runEvidence?.extractedOutputs || {};
      return {
        failingCases: summarizeStrings((extracted.failingCases || []).map(normalizeCaseId)),
        weakDimensions: summarizeStrings((extracted.weakDimensions || []).map(normalizeWeakDimension)),
        baselineMetrics: extracted.baselineMetrics || {},
        touchedPaths: summarizeStrings(extracted.touchedPaths || []),
        symbols: summarizeStrings(extracted.symbols || []),
        configKeys: summarizeStrings(extracted.configKeys || []),
        parserKind: this.parserKind,
        parserVersion: this.parserVersion,
        consumedInputs: {
          artifactNames: summarizeStrings((runEvidence?.artifacts || []).map((/** @type {any} */ artifact) => artifact.name)),
          checkNames: summarizeStrings((runEvidence?.checks || []).map((/** @type {any} */ check) => check.name)),
          workflowPath: runEvidence?.workflowPath || '',
          runId: runEvidence?.runId || ''
        }
      };
    },
    /**
     * @param {any} outputs
     * @returns {{ ok: boolean, reasons: string[] }}
     */
    validate(outputs) {
      const reasons = [];
      if (!outputs?.parserKind) reasons.push('parserKind missing');
      if (!outputs?.parserVersion) reasons.push('parserVersion missing');
      if (!Array.isArray(outputs?.failingCases) || !outputs.failingCases.length) reasons.push('failingCases missing');
      if (!Array.isArray(outputs?.weakDimensions) || !outputs.weakDimensions.length) reasons.push('weakDimensions missing');
      if (!outputs?.baselineMetrics || typeof outputs.baselineMetrics !== 'object' || !Object.keys(outputs.baselineMetrics).length) reasons.push('baselineMetrics missing');
      if (!outputs?.consumedInputs?.workflowPath) reasons.push('workflowPath not consumed');
      if (!outputs?.consumedInputs?.runId) reasons.push('runId not consumed');
      return { ok: reasons.length === 0, reasons };
    }
  };
}

/**
 * @param {any} input
 * @returns {any}
 */
export function makeCandidateAsset(input) {
  const content = String(input.content || '').trim();
  const selectedInventoryEntries = Array.isArray(input.inventoryEntries) ? input.inventoryEntries : [];
  const artifactKind = input.artifactKind || 'mixed';
  const artifactType = input.artifactType || artifactTypeForKind(artifactKind);
  const assetId = input.assetId || `asset_${toSlug(input.title)}_${sha256(`${input.author}:${input.title}:${content}`).slice(0, 10)}`;
  const codeAnalysisFacts = extractStaticCodeAnalysisFacts(content, {
    symbols: input.symbols,
    paths: inventorySourcePaths(selectedInventoryEntries, input.sourcePaths),
    configKeys: input.configKeys,
    stackTags: [...(input.declaredStacks || []), ...(input.tags || [])],
    constraints: input.declaredConstraints
  });
  const contentUnits = splitContentUnits(assetId, content, codeAnalysisFacts);
  const contentRoot = stableHashObject(contentUnits.map((/** @type {any} */ unit) => unit['unitHash']));
  const attestationPayload = { assetId, title: input.title, contentRoot };
  const artifactSelectionSurface = buildArtifactSelectionSurface(input, selectedInventoryEntries, artifactKind);
  const addressingSurface = buildAddressingSurface(input, selectedInventoryEntries, codeAnalysisFacts);
  const githubAppAuthSurface = buildGitHubAppAuthSurface(input, selectedInventoryEntries);
  const signingSurface = buildSigningSurface(input, assetId, contentRoot, addressingSurface, artifactSelectionSurface, githubAppAuthSurface);
  const uploadSurface = buildArtifactUploadSurface(input, content, codeAnalysisFacts, artifactKind, artifactType, selectedInventoryEntries);
  const signerAddress = signingSurface.signerAddress;
  const assetCodeAnalysisReceipt = buildStaticExecutionReceipt({
    receiptKind: 'asset-static-code-analysis',
    stageId: 'asset.measurement.extract.v15',
    toolId: 'asset.measurement.extract.v15',
    inputs: {
      assetId,
      contentRoot,
      sourcePaths: addressingSurface.sourcePaths,
      declaredStacks: input.declaredStacks || codeAnalysisFacts.stackTags,
      declaredConstraints: input.declaredConstraints || codeAnalysisFacts.constraints
    },
    normalizedOutputEnvelope: {
      symbols: codeAnalysisFacts.symbols,
      paths: addressingSurface.sourcePaths,
      configKeys: input.configKeys || codeAnalysisFacts.configKeys,
      stackTags: input.declaredStacks || codeAnalysisFacts.stackTags,
      constraints: input.declaredConstraints || codeAnalysisFacts.constraints
    },
    evidenceRefs: [contentRoot, ...addressingSurface.sourcePaths],
    replayInputClosure: [contentRoot, ...contentUnits.map((/** @type {any} */ unit) => unit['unitHash'])]
  });
  const assetMeasurement = {
    assetId,
    codeAnalysisFacts: {
      symbols: codeAnalysisFacts.symbols,
      paths: addressingSurface.sourcePaths,
      configKeys: input.configKeys || codeAnalysisFacts.configKeys,
      stackTags: input.declaredStacks || codeAnalysisFacts.stackTags,
      constraints: input.declaredConstraints || codeAnalysisFacts.constraints
    },
    contentUnitSemantics: contentUnits.map((/** @type {any} */ unit) => unitSemanticSummary(unit)),
    vectorInterfaces: {
      taskVectorSpace: 'task-semantic-space.v8',
      failureModeVectorSpace: 'failure-mode-space.v8',
      technicalContextVectorSpace: 'technical-context-space.v8',
      profileAStandInEmbeddings: true,
      profileBFutureBoundary: 'swap embedding providers/models while preserving vector-space contracts and unit ids'
    },
    provenance: [
      measurementTrace('static', 'asset.measurement.extract.v15', [contentRoot, ...(input.sourcePaths || codeAnalysisFacts.paths)], { measurementClass: 'static-analysis', evaluatorKind: 'deterministic-static-command', standIn: false, receiptRefs: [assetCodeAnalysisReceipt.receiptId] }),
      measurementTrace('hybrid', 'asset.measurement.semantic-hand-off.v8', [contentRoot, ...contentUnits.map((/** @type {any} */ unit) => unit['unitHash'])], { measurementClass: 'embedding-derivation', evaluatorKind: 'embedding-generator', standIn: true })
    ],
    staticExecutionReceipts: [assetCodeAnalysisReceipt, ...collectStaticExecutionReceipts(contentUnits)]
  };
  const depositoryEvidence = buildDepositoryEvidence(input, {
    assetId,
    title: input.title,
    artifactKind,
    artifactType,
    contentRoot,
    contentUnits,
    addressingSurface,
    artifactSelectionSurface,
    signingSurface,
    githubAppAuthSurface,
    assetMeasurement,
    measurementProvenance: assetMeasurement.provenance
  });

  return {
    assetId,
    depositedAt: input.depositedAt || nowIso(),
    title: input.title,
    artifactKind,
    artifactType,
    repositoryFullName: depositoryEvidence.repositoryFullName,
    sourceBranch: depositoryEvidence.sourceBranch,
    sourceCommit: depositoryEvidence.sourceCommit,
    hasWalletOrAttestationProof: true,
    hasAssetMeasurementEvidence: true,
    proofRoot: depositoryEvidence.proofRoot,
    measurementRoot: depositoryEvidence.measurementRoot,
    reconciliationReadbackRoot: depositoryEvidence.reconciliationReadbackRoot,
    depositorySearchDocumentRoot: depositoryEvidence.depositorySearchDocumentRoot,
    lexicalDocumentRoot: depositoryEvidence.lexicalDocumentRoot,
    vectorDocumentRoot: depositoryEvidence.vectorDocumentRoot,
    compensationPreviewRoot: depositoryEvidence.compensationPreviewRoot,
    sourceToSharesPreviewRoot: depositoryEvidence.sourceToSharesPreviewRoot,
    depositorWalletId: depositoryEvidence.depositorBoundary.walletId,
    compensationPreview: depositoryEvidence.compensationPreview,
    depositoryEvidence,
    sourceMaterialBinding: {
      mode: input.bindingMode || 'read-only-mounted-copy',
      confidentiality: 'private-required',
      mutableInBranch: !!input.mutableInBranch,
      materializationRoot: `.bitcode/source-material/${assetId}`
    },
    contentRoot,
    contentUnits,
    attestations: [
      {
        attestationId: `att_${sha256(assetId).slice(0, 12)}`,
        signerAddress,
        signatureChecksPass: signingSurface.signatureChecksPass,
        payloadHash: signingSurface.payloadHash || stableHashObject(attestationPayload),
        signedPayloadHashMatchesContentRoot: signingSurface.signedPayloadHashMatchesContentRoot,
        cosignSatisfied: input.cosignSatisfied !== false,
        attestationHash: signingSurface.attestationHash || stableHashObject({ signerAddress, contentRoot })
      }
    ],
    uploadSurface,
    artifactSelectionSurface,
    addressingSurface,
    signingSurface,
    githubAppAuthSurface,
    githubBoundary: {
      ...uploadSurface.githubBinding,
      installationId: githubAppAuthSurface.installationId,
      authSessionId: githubAppAuthSurface.authSessionId,
      repositoryId: githubAppAuthSurface.repositoryId,
      repositoryNodeId: githubAppAuthSurface.repositoryNodeId,
      permissions: githubAppAuthSurface.permissions,
      permissionsRoot: githubAppAuthSurface.permissionsRoot,
      authPayloadHash: githubAppAuthSurface.authPayloadHash,
      selectedInventoryRoot: artifactSelectionSurface.selectedInventoryRoot,
      addressingScope: addressingSurface.addressingScope,
      addressingRoot: addressingSurface.addressingRoot
    },
    identitySurface: {
      signerAddress: signingSurface.signerAddress,
      signerClass: 'issuer-principal',
      signerSource: 'signing-surface',
      authSessionId: githubAppAuthSurface.authSessionId,
      installationId: githubAppAuthSurface.installationId,
      authMechanism: githubAppAuthSurface.authMechanism,
      selectedInventoryRoot: artifactSelectionSurface.selectedInventoryRoot,
      addressingRoot: addressingSurface.addressingRoot,
      authPayloadHash: githubAppAuthSurface.authPayloadHash,
      signedPayloadHash: signingSurface.payloadHash,
      ...buildBoundaryDescriptions(
        'Local modeled signer binding only.',
        'Would verify real signer identity / GitHub App / org-bound authorization externally.'
      )
    },
    provenanceBinding: {
      sourceProvider: input.sourceProvider || 'github',
      repo: addressingSurface.repo,
      commit: addressingSurface.commit || `demo-${sha256(assetId).slice(0, 7)}`,
      paths: addressingSurface.sourcePaths,
      workflowPath: addressingSurface.workflowPath || '.github/workflows/benchmark.yml',
      workflowRunId: addressingSurface.workflowRunId || 'gha_run_auth_001'
    },
    verificationEvidence: {
      testsPassed: input.testsPassed !== false,
      typecheckPassed: input.typecheckPassed !== false,
      staticAnalysisPassed: input.staticAnalysisPassed !== false,
      benchmarkRan: input.benchmarkRan !== false,
      benchmarkRunId: input.benchmarkRunId || 'gha_run_auth_001',
      reproSteps: input.reproSteps || ['rerun benchmark workflow', 'inspect issuer compatibility logs'],
      pinnedEnvironment: input.pinnedEnvironment || 'ubuntu-24.04 + node 22 + rust stable',
      proofLogs: input.proofLogs || [],
      proofRoot: depositoryEvidence.proofRoot,
      measurementRoot: depositoryEvidence.measurementRoot,
      reconciliationReadbackRoot: depositoryEvidence.reconciliationReadbackRoot,
      depositorySearchDocumentRoot: depositoryEvidence.depositorySearchDocumentRoot,
      lexicalDocumentRoot: depositoryEvidence.lexicalDocumentRoot,
      vectorDocumentRoot: depositoryEvidence.vectorDocumentRoot,
      compensationPreviewRoot: depositoryEvidence.compensationPreviewRoot,
      sourceToSharesPreviewRoot: depositoryEvidence.sourceToSharesPreviewRoot
    },
    metadata: {
      author: input.author,
      organization: input.organization || `$${ACTIVE_DENOMINATION_LABEL}`,
      sourceRepo: addressingSurface.repo,
      sourceCommit: addressingSurface.commit || `demo-${sha256(assetId).slice(0, 7)}`,
      sourcePaths: addressingSurface.sourcePaths,
      tags: summarizeStrings([...(input.tags || []), ...selectedInventoryEntries.flatMap((/** @type {any} */ entry) => entry.tags || [])]),
      declaredStacks: summarizeStrings([...(input.declaredStacks || codeAnalysisFacts.stackTags), ...selectedInventoryEntries.flatMap((/** @type {any} */ entry) => entry.declaredStacks || [])]),
      declaredConstraints: summarizeStrings([...(input.declaredConstraints || codeAnalysisFacts.constraints), ...selectedInventoryEntries.flatMap((/** @type {any} */ entry) => entry.declaredConstraints || [])]),
      summary: input.summary || content.slice(0, 220),
      privateContent: content,
      issuerPolicyStatus: input.issuerPolicyStatus || 'allowed'
    },
    assetMeasurement: {
      ...assetMeasurement,
      analysisFactLifecycle: {
        determined: ['extractStaticCodeAnalysisFacts', 'repo provenance normalization', 'artifact upload precision mapping'],
        recorded: ['assetMeasurement.codeAnalysisFacts', 'contentUnits[].codeAnalysisFacts', 'uploadSurface'],
        vectorized: ['contentUnits[].embeddings.taskVector', 'contentUnits[].embeddings.failureModeVector', 'contentUnits[].embeddings.technicalContextVector'],
        searched: buildRecallChannelContracts(),
        downstreamUses: ['recallCandidates', 'evaluateCandidates', 'assembleAssetPack', 'visual explainability']
      }
    },
    measurementProvenance: assetMeasurement.provenance
  };
}

export function buildInitialState() {
  const githubAppSessions = buildSeedGitHubAppSessions();
  const repoArtifactInventory = buildSeedRepoArtifactInventoryEntries(githubAppSessions);
  const inventoryEntryByRepoTitle = new Map(
    repoArtifactInventory.map((entry) => [`${entry.repo}:${entry.title}`, entry])
  );
  /**
   * @param {any} input
   * @param {any[]} [inventoryTitles=[]]
   * @returns {any}
   */
  const bindSeedRepoSelection = (input, inventoryTitles = []) => {
    const repo = input.sourceRepo || 'frontier/demo-auth';
    return {
      ...input,
      sourceRepo: repo,
      authSession: githubAppSessions.find((session) => session.repo === repo) || null,
      inventoryEntries: inventoryTitles
        .map((title) => inventoryEntryByRepoTitle.get(`${repo}:${title}`))
        .filter(Boolean),
      contentDerivedFromSelection: inventoryTitles.length > 0
    };
  };
  const assets = [
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Enterprise auth migration rollback playbook',
      author: 'Garrett',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'runbook',
      sourcePaths: ['services/auth/rollback.ts', 'config/auth/issuer-compat.yml'],
      symbols: ['restorePriorVerifier', 'emitAuditReceipt', 'validateIssuerCompatibility'],
      configKeys: ['auth.issuer.compatibilityWindow', 'auth.rollback.killSwitch'],
      tags: ['auth', 'migration', 'rollback', 'monorepo', 'enterprise'],
      declaredStacks: ['typescript', 'node', 'auth', 'github-actions', 'jwt', 'monorepo'],
      declaredConstraints: ['preserve session validity', 'replay only idempotent schema steps', 'emit audit receipt'],
      content: `Objective: recover an enterprise monorepo auth migration without leaving half-migrated services or invalid sessions in production.\n\nProcedure: freeze writes, capture a signed migration snapshot, validate token issuer compatibility, restore prior verifier configuration, replay only idempotent schema steps, and re-enable traffic behind a kill switch.\n\nValidation: rerun auth benchmark cases, verify session validator invariants, and confirm rollback audit receipts include repo, commit, workflow run, and migration batch.\n\nExpected touched areas: services/auth/rollback.ts, config/auth/issuer-compat.yml, and the ${ACTIVE_PROJECT_LABEL} remediation branch validation notes.`,
      proofLogs: ['creusot-session-validator-proof.log'],
      pinnedEnvironment: 'ubuntu-24.04 + node 22'
    }, ['Auth rollback benchmark summary', 'Issuer compatibility config snapshot', 'Issuer mismatch incident notes'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Proof-carrying session validator patch kit',
      author: 'Eve',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'patch',
      sourcePaths: ['services/auth/session_validator.rs', 'services/auth/cache.rs'],
      symbols: ['SessionValidator', 'validateIssuerAudience', 'evictExpiredEntry'],
      configKeys: ['auth.session.cache.maxAgeSeconds'],
      tags: ['rust', 'proof', 'validator', 'safety', 'patch'],
      declaredStacks: ['rust', 'auth', 'jwt'],
      declaredConstraints: ['no panic', 'preserve session validity', 'no overflow'],
      content: `Contract: session validation lookups must not panic, must preserve index bounds, and must never accept expired or issuer-mismatched entries.\n\nImplementation note: replace unchecked indexing with guarded access, propagate Result and Option values, and prove that cache eviction preserves validator invariants.\n\nValidation steps: cargo test -p auth-validator, cargo creusot prove services/auth/session_validator.rs, and rerun the GitHub Actions auth remediation benchmark.\n\nExpected touched areas: services/auth/session_validator.rs and services/auth/cache.rs.`,
      proofLogs: ['cargo-creusot-success.log'],
      pinnedEnvironment: 'ubuntu-24.04 + rust stable'
    }, ['Rollback verifier compatibility patch', 'Session validator proof log'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Formal replay-window validator proof bundle',
      author: 'Sora',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'proof',
      sourceRepo: 'frontier/payments-ledger',
      sourceCommit: 'validator014proof',
      workflowRunId: 'gha_run_validator_014',
      benchmarkRunId: 'gha_run_validator_014',
      sourcePaths: ['crates/validator/src/session_guard.rs', 'crates/validator/src/replay_window.rs', 'proofs/session_guard.creusot'],
      symbols: ['SessionGuard', 'proveReplayWindow', 'applyOverflowBound'],
      configKeys: ['validator.replayWindow.maxNonces', 'validator.proof.requireNoUncheckedMath'],
      tags: ['rust', 'proof', 'validator', 'formal-methods', 'replay-window'],
      declaredStacks: ['rust', 'creusot', 'cargo', 'formal-methods'],
      declaredConstraints: ['preserve proof obligations', 'no unchecked arithmetic', 'replay benchmark after proof'],
      content: `Proof bundle objective: repair replay-window and overflow proof regressions in the validator crate without weakening nonce or arithmetic guarantees.\n\nImplementation note: keep the replay window bounded, prove the overflow guard over the full input range, and bind the proof outputs back to the benchmark harness.\n\nValidation steps: cargo test -p payments-validator, cargo creusot prove proofs/session_guard.creusot, and rerun the validator regression benchmark.`,
      proofLogs: ['validator-replay-window-proof.log'],
      pinnedEnvironment: 'ubuntu-24.04 + rust stable'
    }, ['Replay window attestation bundle', 'Replay guard patch', 'Validator proof recovery runbook'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Token issuer incident escalation notes',
      author: 'Avery',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'incident-note',
      sourcePaths: ['docs/incidents/auth-issuer-mismatch.md'],
      symbols: ['issuerCompatibilityWindow'],
      configKeys: ['auth.issuer.previousJwksUrl'],
      tags: ['issuer', 'incident-response', 'runbook', 'escalation'],
      declaredStacks: ['auth', 'jwt'],
      declaredConstraints: ['compatibility window'],
      content: `Incident pattern: auth migration changed issuer and audience validation together, which broke pre-migration services still pinned to the previous JWKS endpoint.\n\nRecovery pattern: split issuer migration from audience migration, ship an explicit compatibility window, and add a runtime audit that rejects mixed config before rollout.\n\nOperator note: most failed recoveries came from restoring schema before restoring validator config.`,
      typecheckPassed: false,
      staticAnalysisPassed: false,
      benchmarkRan: false,
      signedPayloadHashMatchesContentRoot: true,
      issuerPolicyStatus: 'restricted',
      pinnedEnvironment: ''
    }, ['Issuer mismatch incident notes'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Policy precedence incident governor fixpack',
      author: 'Noah',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'config',
      sourceRepo: 'frontier/policy-control-plane',
      sourceCommit: 'policy031fix',
      workflowRunId: 'gha_run_policy_031',
      benchmarkRunId: 'gha_run_policy_031',
      sourcePaths: ['config/policy/issuer-precedence.yml', 'services/policy/evaluate_rollout.ts'],
      symbols: ['evaluateRolloutPolicy', 'PolicyPrecedenceMatrix', 'emitPolicyAuditReceipt'],
      configKeys: ['policy.rollout.precedence', 'policy.rollout.approvalWindowHours'],
      tags: ['policy', 'config', 'incident-response', 'governance', 'yaml'],
      declaredStacks: ['typescript', 'node', 'policy', 'yaml'],
      declaredConstraints: ['preserve approval ordering', 'emit policy audit receipt', 'no silent precedence fallback'],
      content: `Policy incident closure: restore explicit precedence ordering between staged policy bundles and emergency overrides before rollout resumes.\n\nImplementation note: make precedence resolution explicit, record the chosen policy source in audit receipts, and reject rollouts that fall back to undeclared defaults.\n\nValidation steps: rerun the policy precedence benchmark, inspect approval-window traces, and confirm that policy audit receipts include workflow run and commit linkage.`,
      pinnedEnvironment: 'ubuntu-24.04 + node 22'
    }, ['Policy precedence benchmark output', 'Policy precedence governor patch', 'Policy incident operator runbook'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Unsafe patch review containment checklist',
      author: 'Mina',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'runbook',
      sourceRepo: 'frontier/review-gateway',
      sourceCommit: 'review009contain',
      workflowRunId: 'gha_run_review_009',
      benchmarkRunId: 'gha_run_review_009',
      sourcePaths: ['docs/reviews/unsafe_patch_containment.md', 'services/review/review_gate.ts'],
      symbols: ['ReviewGate', 'emitReviewRationale', 'enforceTouchedFileBudget'],
      configKeys: ['review.patch.maxTouchedFiles', 'review.patch.requireRationale'],
      tags: ['code-review', 'security', 'containment', 'patch'],
      declaredStacks: ['typescript', 'security', 'code-review'],
      declaredConstraints: ['require review rationale', 'preserve rollback path', 'block unsafe patch bypass'],
      content: `Unsafe patch containment: reject broad patch drops that bypass review gates, force an explicit rationale, and attach the touched-file budget to the review receipt.\n\nOperator steps: diff the candidate patch against allowed file boundaries, require reviewer rationale before apply, and reopen the benchmark workflow if the patch exceeds policy scope.\n\nExpected touched areas: services/review/review_gate.ts, docs/reviews/unsafe_patch_containment.md.`,
      benchmarkRan: false,
      pinnedEnvironment: 'ubuntu-24.04 + node 22'
    }, ['Unsafe review recovery diff note', 'Unsafe review containment checklist', 'Review gate proof log'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Deployment drift rollback release playbook',
      author: 'Iris',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'runbook',
      sourceRepo: 'frontier/deploy-orchestrator',
      sourceCommit: 'deploy018drift',
      workflowRunId: 'gha_run_deploy_018',
      benchmarkRunId: 'gha_run_deploy_018',
      sourcePaths: ['infra/terraform/services/auth/main.tf', 'deploy/helm/auth/values.yaml', 'ops/runbooks/deployment-drift.md'],
      symbols: ['reconcileReleasePlan', 'detectVersionDrift', 'emitDeploymentReceipt'],
      configKeys: ['deploy.rollback.maxParallel', 'deploy.release.expectedChartVersion'],
      tags: ['infra', 'deployment', 'rollback', 'terraform', 'helm', 'kubernetes'],
      declaredStacks: ['terraform', 'helm', 'kubernetes', 'infra'],
      declaredConstraints: ['preserve release ordering', 'emit deployment receipt', 'keep rollout reversible'],
      content: `Deployment drift recovery: compare Terraform state, Helm chart expectations, and runtime release receipts before rollback.\n\nExecution plan: stop progressive rollout, reconcile expected chart version with applied infrastructure revisions, and only then replay the rollback plan in bounded batches.\n\nValidation: rerun the deployment benchmark, confirm drift detection receipts, and verify release ordering stayed reversible throughout the rollback.`,
      pinnedEnvironment: 'ubuntu-24.04 + terraform 1.9 + helm 3'
    }, ['Deployment drift incident runbook', 'Deployment drift config snapshot', 'Deployment release parity patch'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Projection-safe bounded proof export notes',
      author: 'Jules',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'proof',
      sourceRepo: 'frontier/private-proof-service',
      sourceCommit: 'projection006bound',
      workflowRunId: 'gha_run_projection_006',
      benchmarkRunId: 'gha_run_projection_006',
      sourcePaths: ['services/redaction/project_public_proof.ts', 'policies/disclosure/bounded_public.yml'],
      symbols: ['projectBoundedPublicProof', 'redactPrivateArtifacts', 'allowBoundedDisclosure'],
      configKeys: ['projection.public.allowedArtifacts', 'projection.redaction.defaultMode'],
      tags: ['privacy', 'projection', 'proof', 'disclosure'],
      declaredStacks: ['typescript', 'policy', 'privacy'],
      declaredConstraints: ['bounded metadata only', 'no private artifact leak', 'replay disclosure decisions'],
      content: `Bounded proof export: derive the public proof surface strictly from bounded metadata, redact private branch artifacts by policy class, and record every disclosure decision with replayable artifact hashes.\n\nVerification: compare public artifact inventory against projection policy, assert that private source material never appears in public outputs, and preserve a replayable disclosure chain.`,
      pinnedEnvironment: 'ubuntu-24.04 + node 22'
    }, ['Bounded proof export witness bundle', 'Bounded proof redaction patch', 'Public proof disclosure runbook'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Session validator compatibility witness dossier',
      author: 'Lane',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'proof',
      sourceRepo: 'frontier/demo-auth',
      sourceCommit: 'auth019validator',
      workflowPath: '.github/workflows/benchmark-auth-normalization.yml',
      workflowRunId: 'gha_run_auth_019',
      benchmarkRunId: 'gha_run_auth_019',
      sourcePaths: ['services/auth/session_validator.rs', 'services/auth/audit_receipt.ts', 'services/auth/rollback.ts', 'config/auth/issuer-compat.yml'],
      symbols: ['SessionValidator', 'emitAuditReceipt', 'restorePriorVerifier', 'validateIssuerAudience'],
      configKeys: ['auth.session.cache.maxAgeSeconds', 'auth.audit.requireWorkflowRun', 'auth.issuer.compatibilityWindow'],
      tags: ['auth', 'session-validity', 'proof', 'rollback', 'auditability'],
      declaredStacks: ['rust', 'typescript', 'node', 'auth', 'github-actions', 'jwt'],
      declaredConstraints: ['preserve session validity', 'bind workflow run to receipt', 'keep issuer compatibility explicit', 'no unchecked validator panic'],
      content: `Witness objective: prove that session validation, issuer compatibility rollback, and audit receipt emission remain aligned for the normalization-heavy auth remediation branch.\n\nImplementation note: keep SessionValidator and restorePriorVerifier on the same rollback boundary, bind emitAuditReceipt to the exact workflow run and commit, and reject any compatibility-window repair that is not reflected in both session and receipt evidence.\n\nVerification steps: rerun the auth normalization benchmark, replay the validator proof log against services/auth/session_validator.rs, and confirm that services/auth/audit_receipt.ts and config/auth/issuer-compat.yml preserve the same workflow-bound compatibility window.`,
      proofLogs: ['auth019-session-validator-proof.log'],
      pinnedEnvironment: 'ubuntu-24.04 + rust stable + node 22'
    }, ['Session validator proof log', 'Auth rollback benchmark summary', 'Issuer compatibility config snapshot'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Auth audit receipt reconciliation patchset',
      author: 'Kai',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'patch',
      sourceRepo: 'frontier/demo-auth',
      sourceCommit: 'auth019audit',
      workflowRunId: 'gha_run_auth_019',
      benchmarkRunId: 'gha_run_auth_019',
      sourcePaths: ['services/auth/audit_receipt.ts', 'services/auth/rollback.ts', 'config/auth/issuer-compat.yml'],
      symbols: ['emitAuditReceipt', 'reconcileRollbackReceipt', 'restorePriorVerifier'],
      configKeys: ['auth.audit.requireWorkflowRun', 'auth.issuer.compatibilityWindow'],
      tags: ['auth', 'auditability', 'patch', 'rollback'],
      declaredStacks: ['typescript', 'node', 'auth', 'github-actions'],
      declaredConstraints: ['emit audit receipt', 'preserve session validity', 'bind workflow run to receipt'],
      content: `Patch objective: reconcile auth rollback receipts with the workflow run, commit, and issuer compatibility window so rollback evidence stays settlement-grade.\n\nImplementation note: write the workflow run and commit into emitAuditReceipt, keep restorePriorVerifier and issuer compatibility updates in the same remediation patch, and fail closed if receipt linkage is missing.\n\nValidation steps: rerun the auth benchmark, inspect receipt reconciliation logs, and confirm that rollback receipts stay hash-bound to services/auth/audit_receipt.ts.`,
      pinnedEnvironment: 'ubuntu-24.04 + node 22'
    }, ['Auth audit receipt patchset', 'Auth rollback benchmark summary', 'Issuer compatibility config snapshot'])),
    makeCandidateAsset(bindSeedRepoSelection({
      title: 'Polyglot gateway rollback coordination playbook',
      author: 'Rin',
      organization: `$${ACTIVE_DENOMINATION_LABEL}`,
      artifactKind: 'runbook',
      sourceRepo: 'frontier/polyglot-gateway',
      sourceCommit: 'gateway021rollback',
      workflowRunId: 'gha_run_gateway_021',
      benchmarkRunId: 'gha_run_gateway_021',
      sourcePaths: ['gateway/api/server.ts', 'workers/session_replay.py', 'crates/token_bridge/src/lib.rs', 'config/gateway/issuer_policy.yml'],
      symbols: ['applyIssuerRollback', 'replayQueuedSession', 'BridgeGuard'],
      configKeys: ['gateway.issuer.rollbackWindowSeconds', 'gateway.audit.requireCrossLanguageReceipt'],
      tags: ['polyglot', 'rollback', 'typescript', 'python', 'rust', 'gateway'],
      declaredStacks: ['typescript', 'python', 'rust', 'gateway', 'github-actions'],
      declaredConstraints: ['preserve cross-language parity', 'emit audit receipt', 'keep rollback reversible'],
      content: `Polyglot rollback objective: recover gateway issuer drift without letting the TypeScript API, Python replay worker, or Rust token bridge diverge.\n\nExecution plan: freeze queued session replay, coordinate the server.ts issuer rollback with workers/session_replay.py, validate BridgeGuard assumptions in crates/token_bridge/src/lib.rs, and only then reopen traffic.\n\nValidation: rerun the gateway parity benchmark, verify the cross-language receipt chain, and confirm that config/gateway/issuer_policy.yml stays aligned with the rollback window.`,
      pinnedEnvironment: 'ubuntu-24.04 + node 22 + python 3.13 + rust stable'
    }, ['Polyglot gateway rollback patchset', 'Polyglot rollback runbook', 'Cross-language receipt config snapshot', 'Gateway parity proof log']))
  ];

  const buyers = [
    {
      buyerId: 'frontier-code-systems',
      orgName: 'Frontier Code Systems',
      installationId: DEFAULT_GITHUB_INSTALLATION_ID,
      repo: 'frontier/demo-auth',
      buyerBranch: AUTH_ISSUER_ROLLBACK_REF,
      branchMode: 'patch',
      licensePoolMicroUnits: '900000000'
    }
  ];

  const readScenarios = [
    {
      scenarioId: 'auth-issuer-rollback',
      scenarioFamily: 'monorepo-auth-rollback',
      coverageTags: ['monorepo', 'auth', 'rollback', 'privacy-boundary', 'polyglot'],
      repo: 'frontier/demo-auth',
      installationId: DEFAULT_GITHUB_INSTALLATION_ID,
      baseRef: AUTH_ISSUER_ROLLBACK_REF,
      targetRef: 'main',
      prNumber: 481,
      benchmarkHarnessPath: 'benchmarks/auth_remediation.yaml',
      benchmarkWorkflowPath: '.github/workflows/benchmark-auth.yml',
      benchmarkRunId: 'gha_run_auth_001',
      benchmarkRunUrl: 'https://github.com/frontier/demo-auth/actions/runs/gha_run_auth_001',
      repoContext: {
        repoTree: [
          'services/auth/rollback.ts',
          'services/auth/session_validator.rs',
          'services/auth/cache.rs',
          'config/auth/issuer-compat.yml',
          'benchmarks/auth_remediation.yaml'
        ],
        stackHints: ['typescript', 'node', 'auth', 'github-actions', 'jwt', 'monorepo'],
        symbols: ['restorePriorVerifier', 'validateIssuerAudience', 'emitAuditReceipt'],
        configKeys: ['auth.issuer.compatibilityWindow', 'auth.rollback.killSwitch'],
        benchmarkTarget: {
          harnessPath: 'benchmarks/auth_remediation.yaml',
          targetSlice: 'auth-remediation'
        }
      },
      expectedTask: 'Recover a production auth migration with issuer mismatch while preserving session validity and rollback safety.',
      expectedFailureModes: [
        'issuer mismatch breaks pre-migration services',
        'rollback restores schema before verifier compatibility',
        'audit receipts missing repo and commit linkage'
      ],
      expectedConstraints: [
        'preserve session validity',
        'replay only idempotent schema steps',
        'emit audit receipt',
        'keep remediation branch private until settlement completes'
      ],
      expectedTargetArtifactKinds: ['runbook', 'patch', 'config', 'proof'],
      humanPrompt: `Read a private ${ACTIVE_PROJECT_LABEL} remediation branch for auth rollback failures observed in the buyer PR.`,
      canonicalRunEvidence: {
        workflowPath: '.github/workflows/benchmark-auth.yml',
        runId: 'gha_run_auth_001',
        runUrl: 'https://github.com/frontier/demo-auth/actions/runs/gha_run_auth_001',
        commitSha: 'demoauth481abc',
        branch: AUTH_ISSUER_ROLLBACK_REF,
        conclusion: 'failure',
        artifacts: [
          { name: 'auth-remediation-report.json', path: 'artifacts/auth-remediation-report.json', mediaType: 'application/json' }
        ],
        checks: [
          { name: 'auth benchmark', conclusion: 'failure' },
          { name: 'session validation', conclusion: 'failure' }
        ],
        extractedOutputs: {
          failingCases: ['issuer-mismatch-pre-migration-service', 'rollback-ordering-audit-receipt'],
          weakDimensions: ['rollback-safety', 'session-validity', 'auditability'],
          baselineMetrics: {
            rollbackSafety: 0.41,
            sessionValidity: 0.46,
            auditability: 0.32
          },
          touchedPaths: ['services/auth/rollback.ts', 'services/auth/session_validator.rs', 'config/auth/issuer-compat.yml'],
          symbols: ['restorePriorVerifier', 'validateIssuerAudience', 'emitAuditReceipt'],
          configKeys: ['auth.issuer.compatibilityWindow', 'auth.rollback.killSwitch'],
          parserKind: 'github-actions.auth-remediation.v3',
          parserVersion: '3.0.0'
        }
      }
    },
    {
      scenarioId: 'rust-validator-proof-gap',
      scenarioFamily: 'proof-heavy-rust-validator',
      coverageTags: ['rust', 'proof', 'validator', 'formal-methods'],
      repo: 'frontier/payments-ledger',
      installationId: DEFAULT_GITHUB_INSTALLATION_ID,
      baseRef: PROOF_VALIDATOR_GAP_REF,
      targetRef: 'main',
      prNumber: 722,
      benchmarkHarnessPath: 'benchmarks/validator_regressions.yaml',
      benchmarkWorkflowPath: '.github/workflows/prove-validator.yml',
      benchmarkRunId: 'gha_run_validator_014',
      benchmarkRunUrl: 'https://github.com/frontier/payments-ledger/actions/runs/gha_run_validator_014',
      repoContext: {
        repoTree: [
          'crates/validator/src/session_guard.rs',
          'crates/validator/src/replay_window.rs',
          'proofs/session_guard.creusot',
          'benchmarks/validator_regressions.yaml'
        ],
        stackHints: ['rust', 'creusot', 'cargo', 'formal-methods', 'github-actions'],
        symbols: ['SessionGuard', 'proveReplayWindow', 'applyOverflowBound'],
        configKeys: ['validator.replayWindow.maxNonces', 'validator.proof.requireNoUncheckedMath'],
        benchmarkTarget: {
          harnessPath: 'benchmarks/validator_regressions.yaml',
          targetSlice: 'proof-validator'
        }
      },
      expectedTask: 'Repair the Rust validator proof failure without weakening overflow or replay protections.',
      expectedFailureModes: [
        'overflow boundary proof fails under replay-window stress',
        'nonce replay guard accepts out-of-window sequence',
        'validator patch diverges from proof harness expectations'
      ],
      expectedConstraints: [
        'preserve proof obligations',
        'no unchecked arithmetic',
        'rerun proof plus benchmark',
        'keep remediation branch private until settlement completes'
      ],
      expectedTargetArtifactKinds: ['patch', 'proof', 'runbook'],
      humanPrompt: `Read a proof-heavy ${ACTIVE_PROJECT_LABEL} branch for a Rust validator regression coming from the benchmark harness.`,
      canonicalRunEvidence: {
        workflowPath: '.github/workflows/prove-validator.yml',
        runId: 'gha_run_validator_014',
        runUrl: 'https://github.com/frontier/payments-ledger/actions/runs/gha_run_validator_014',
        commitSha: 'validator722abc',
        branch: PROOF_VALIDATOR_GAP_REF,
        conclusion: 'failure',
        artifacts: [
          { name: 'validator-proof-report.json', path: 'artifacts/validator-proof-report.json', mediaType: 'application/json' },
          { name: 'creusot-session_guard.log', path: 'artifacts/creusot-session_guard.log', mediaType: 'text/plain' }
        ],
        checks: [
          { name: 'proof validator benchmark', conclusion: 'failure' },
          { name: 'cargo creusot', conclusion: 'failure' }
        ],
        extractedOutputs: {
          failingCases: ['overflow-boundary-proof-gap', 'replay-window-regression'],
          weakDimensions: ['proof-soundness', 'overflow-safety', 'replay-resilience'],
          baselineMetrics: {
            proofSoundness: 0.38,
            overflowSafety: 0.49,
            replayResilience: 0.44
          },
          touchedPaths: ['crates/validator/src/session_guard.rs', 'crates/validator/src/replay_window.rs', 'proofs/session_guard.creusot'],
          symbols: ['SessionGuard', 'proveReplayWindow', 'applyOverflowBound'],
          configKeys: ['validator.replayWindow.maxNonces', 'validator.proof.requireNoUncheckedMath'],
          parserKind: 'github-actions.auth-remediation.v3',
          parserVersion: '3.0.0'
        }
      }
    },
    {
      scenarioId: 'config-policy-precedence-incident',
      scenarioFamily: 'config-policy-incident',
      coverageTags: ['config', 'policy', 'incident', 'auditability'],
      repo: 'frontier/policy-control-plane',
      installationId: DEFAULT_GITHUB_INSTALLATION_ID,
      baseRef: CONFIG_POLICY_PRECEDENCE_REF,
      targetRef: 'main',
      prNumber: 903,
      benchmarkHarnessPath: 'benchmarks/policy_precedence.yaml',
      benchmarkWorkflowPath: '.github/workflows/benchmark-policy.yml',
      benchmarkRunId: 'gha_run_policy_031',
      benchmarkRunUrl: 'https://github.com/frontier/policy-control-plane/actions/runs/gha_run_policy_031',
      repoContext: {
        repoTree: [
          'config/policy/issuer-precedence.yml',
          'services/policy/evaluate_rollout.ts',
          'docs/runbooks/policy-incident.md',
          'benchmarks/policy_precedence.yaml'
        ],
        stackHints: ['typescript', 'node', 'policy', 'yaml', 'github-actions'],
        symbols: ['evaluateRolloutPolicy', 'PolicyPrecedenceMatrix', 'emitPolicyAuditReceipt'],
        configKeys: ['policy.rollout.precedence', 'policy.rollout.approvalWindowHours'],
        benchmarkTarget: {
          harnessPath: 'benchmarks/policy_precedence.yaml',
          targetSlice: 'policy-precedence'
        }
      },
      expectedTask: 'Restore config-policy precedence ordering and auditability without reopening the rollout incident.',
      expectedFailureModes: [
        'policy precedence regression bypasses staged bundle ordering',
        'approval window override lacks audit receipt linkage',
        'fallback defaults silently win over declared rollout policy'
      ],
      expectedConstraints: [
        'preserve approval ordering',
        'emit policy audit receipt',
        'block silent precedence fallback',
        'keep remediation branch private until settlement completes'
      ],
      expectedTargetArtifactKinds: ['config', 'runbook', 'patch'],
      humanPrompt: 'Read a branch that resolves a config-policy precedence incident without losing audit receipts.',
      canonicalRunEvidence: {
        workflowPath: '.github/workflows/benchmark-policy.yml',
        runId: 'gha_run_policy_031',
        runUrl: 'https://github.com/frontier/policy-control-plane/actions/runs/gha_run_policy_031',
        commitSha: 'policy903abc',
        branch: CONFIG_POLICY_PRECEDENCE_REF,
        conclusion: 'failure',
        artifacts: [
          { name: 'policy-precedence-report.json', path: 'artifacts/policy-precedence-report.json', mediaType: 'application/json' }
        ],
        checks: [
          { name: 'policy precedence benchmark', conclusion: 'failure' },
          { name: 'policy receipt audit', conclusion: 'failure' }
        ],
        extractedOutputs: {
          failingCases: ['policy-precedence-regression', 'approval-window-bypass'],
          weakDimensions: ['policy-auditability', 'precedence-safety', 'rollout-governance'],
          baselineMetrics: {
            policyAuditability: 0.34,
            precedenceSafety: 0.42,
            rolloutGovernance: 0.47
          },
          touchedPaths: ['config/policy/issuer-precedence.yml', 'services/policy/evaluate_rollout.ts', 'docs/runbooks/policy-incident.md'],
          symbols: ['evaluateRolloutPolicy', 'PolicyPrecedenceMatrix', 'emitPolicyAuditReceipt'],
          configKeys: ['policy.rollout.precedence', 'policy.rollout.approvalWindowHours'],
          parserKind: 'github-actions.auth-remediation.v3',
          parserVersion: '3.0.0'
        }
      }
    },
    {
      scenarioId: 'unsafe-patch-review-recovery',
      scenarioFamily: 'unsafe-patch-review',
      coverageTags: ['code-review', 'security', 'patch', 'auditability'],
      repo: 'frontier/review-gateway',
      installationId: DEFAULT_GITHUB_INSTALLATION_ID,
      baseRef: UNSAFE_PATCH_REVIEW_REF,
      targetRef: 'main',
      prNumber: 611,
      benchmarkHarnessPath: 'benchmarks/review_guard.yaml',
      benchmarkWorkflowPath: '.github/workflows/review-guard.yml',
      benchmarkRunId: 'gha_run_review_009',
      benchmarkRunUrl: 'https://github.com/frontier/review-gateway/actions/runs/gha_run_review_009',
      repoContext: {
        repoTree: [
          'services/review/apply_patch.ts',
          'services/review/review_gate.ts',
          'docs/reviews/unsafe_patch_containment.md',
          'benchmarks/review_guard.yaml'
        ],
        stackHints: ['typescript', 'security', 'code-review', 'github-actions'],
        symbols: ['applyPatchSafely', 'ReviewGate', 'emitReviewRationale'],
        configKeys: ['review.patch.maxTouchedFiles', 'review.patch.requireRationale'],
        benchmarkTarget: {
          harnessPath: 'benchmarks/review_guard.yaml',
          targetSlice: 'review-guard'
        }
      },
      expectedTask: 'Contain an unsafe patch review bypass while preserving review rationale and rollback discipline.',
      expectedFailureModes: [
        'unsafe patch bypass skips reviewer rationale',
        'patch scope exceeds touched-file budget',
        'rollback path disappears after apply'
      ],
      expectedConstraints: [
        'require review rationale',
        'preserve rollback path',
        'block unsafe patch bypass',
        'keep remediation branch private until settlement completes'
      ],
      expectedTargetArtifactKinds: ['runbook', 'patch', 'proof'],
      humanPrompt: 'Read a remediation branch for an unsafe patch review bypass observed by the benchmark guard.',
      canonicalRunEvidence: {
        workflowPath: '.github/workflows/review-guard.yml',
        runId: 'gha_run_review_009',
        runUrl: 'https://github.com/frontier/review-gateway/actions/runs/gha_run_review_009',
        commitSha: 'review611abc',
        branch: UNSAFE_PATCH_REVIEW_REF,
        conclusion: 'failure',
        artifacts: [
          { name: 'review-guard-report.json', path: 'artifacts/review-guard-report.json', mediaType: 'application/json' }
        ],
        checks: [
          { name: 'review guard benchmark', conclusion: 'failure' },
          { name: 'review rationale audit', conclusion: 'failure' }
        ],
        extractedOutputs: {
          failingCases: ['unsafe-patch-bypass', 'missing-review-rationale'],
          weakDimensions: ['patch-safety', 'review-auditability', 'rollback-discipline'],
          baselineMetrics: {
            patchSafety: 0.31,
            reviewAuditability: 0.36,
            rollbackDiscipline: 0.43
          },
          touchedPaths: ['services/review/apply_patch.ts', 'services/review/review_gate.ts', 'docs/reviews/unsafe_patch_containment.md'],
          symbols: ['applyPatchSafely', 'ReviewGate', 'emitReviewRationale'],
          configKeys: ['review.patch.maxTouchedFiles', 'review.patch.requireRationale'],
          parserKind: 'github-actions.auth-remediation.v3',
          parserVersion: '3.0.0'
        }
      }
    },
    {
      scenarioId: 'infra-deployment-mismatch',
      scenarioFamily: 'infra-deployment-mismatch',
      coverageTags: ['infra', 'deployment', 'rollback', 'helm', 'terraform'],
      repo: 'frontier/deploy-orchestrator',
      installationId: DEFAULT_GITHUB_INSTALLATION_ID,
      baseRef: DEPLOYMENT_DRIFT_ROLLBACK_REF,
      targetRef: 'main',
      prNumber: 1044,
      benchmarkHarnessPath: 'benchmarks/deployment_drift.yaml',
      benchmarkWorkflowPath: '.github/workflows/benchmark-deploy.yml',
      benchmarkRunId: 'gha_run_deploy_018',
      benchmarkRunUrl: 'https://github.com/frontier/deploy-orchestrator/actions/runs/gha_run_deploy_018',
      repoContext: {
        repoTree: [
          'infra/terraform/services/auth/main.tf',
          'deploy/helm/auth/values.yaml',
          'ops/runbooks/deployment-drift.md',
          'benchmarks/deployment_drift.yaml'
        ],
        stackHints: ['terraform', 'helm', 'kubernetes', 'infra', 'github-actions'],
        symbols: ['reconcileReleasePlan', 'detectVersionDrift', 'emitDeploymentReceipt'],
        configKeys: ['deploy.rollback.maxParallel', 'deploy.release.expectedChartVersion'],
        benchmarkTarget: {
          harnessPath: 'benchmarks/deployment_drift.yaml',
          targetSlice: 'deployment-drift'
        }
      },
      expectedTask: 'Resolve Terraform versus Helm deployment drift while preserving rollback ordering and environment receipts.',
      expectedFailureModes: [
        'terraform and helm expected versions drift apart',
        'rollback ordering mismatches the active release plan',
        'deployment receipts omit environment linkage'
      ],
      expectedConstraints: [
        'preserve release ordering',
        'emit deployment receipt',
        'keep rollout reversible',
        'keep remediation branch private until settlement completes'
      ],
      expectedTargetArtifactKinds: ['runbook', 'config', 'patch'],
      humanPrompt: 'Read a deployment drift rollback branch that reconciles Terraform and Helm state safely.',
      canonicalRunEvidence: {
        workflowPath: '.github/workflows/benchmark-deploy.yml',
        runId: 'gha_run_deploy_018',
        runUrl: 'https://github.com/frontier/deploy-orchestrator/actions/runs/gha_run_deploy_018',
        commitSha: 'deploy1044abc',
        branch: DEPLOYMENT_DRIFT_ROLLBACK_REF,
        conclusion: 'failure',
        artifacts: [
          { name: 'deployment-drift-report.json', path: 'artifacts/deployment-drift-report.json', mediaType: 'application/json' }
        ],
        checks: [
          { name: 'deployment drift benchmark', conclusion: 'failure' },
          { name: 'release receipt audit', conclusion: 'failure' }
        ],
        extractedOutputs: {
          failingCases: ['terraform-helm-version-drift', 'rollback-order-mismatch'],
          weakDimensions: ['deployment-consistency', 'rollback-safety', 'env-auditability'],
          baselineMetrics: {
            deploymentConsistency: 0.37,
            rollbackSafety: 0.45,
            envAuditability: 0.4
          },
          touchedPaths: ['infra/terraform/services/auth/main.tf', 'deploy/helm/auth/values.yaml', 'ops/runbooks/deployment-drift.md'],
          symbols: ['reconcileReleasePlan', 'detectVersionDrift', 'emitDeploymentReceipt'],
          configKeys: ['deploy.rollback.maxParallel', 'deploy.release.expectedChartVersion'],
          parserKind: 'github-actions.auth-remediation.v3',
          parserVersion: '3.0.0'
        }
      }
    },
    {
      scenarioId: 'privacy-boundary-proof-export',
      scenarioFamily: 'privacy-boundary-stress',
      coverageTags: ['privacy', 'projection', 'redaction', 'bounded-proof'],
      repo: 'frontier/private-proof-service',
      installationId: DEFAULT_GITHUB_INSTALLATION_ID,
      baseRef: BOUNDED_PROOF_EXPORT_REF,
      targetRef: 'main',
      prNumber: 1188,
      benchmarkHarnessPath: 'benchmarks/projection_privacy.yaml',
      benchmarkWorkflowPath: '.github/workflows/benchmark-projection.yml',
      benchmarkRunId: 'gha_run_projection_006',
      benchmarkRunUrl: 'https://github.com/frontier/private-proof-service/actions/runs/gha_run_projection_006',
      repoContext: {
        repoTree: [
          'services/redaction/project_public_proof.ts',
          'policies/disclosure/bounded_public.yml',
          'docs/privacy/remediation.md',
          'benchmarks/projection_privacy.yaml'
        ],
        stackHints: ['typescript', 'policy', 'privacy', 'github-actions'],
        symbols: ['projectBoundedPublicProof', 'redactPrivateArtifacts', 'allowBoundedDisclosure'],
        configKeys: ['projection.public.allowedArtifacts', 'projection.redaction.defaultMode'],
        benchmarkTarget: {
          harnessPath: 'benchmarks/projection_privacy.yaml',
          targetSlice: 'projection-privacy'
        }
      },
      expectedTask: 'Repair bounded public proof export so public projection never leaks private branch artifacts.',
      expectedFailureModes: [
        'public proof export includes private artifact path',
        'redaction policy skips source material class',
        'disclosure chain cannot replay allowed public metadata'
      ],
      expectedConstraints: [
        'bounded metadata only',
        'no private artifact leak',
        'replay disclosure decisions',
        'keep remediation branch private until settlement completes'
      ],
      expectedTargetArtifactKinds: ['proof', 'patch', 'runbook'],
      humanPrompt: 'Read a privacy-safe proof export branch that keeps public projection bounded and replayable.',
      canonicalRunEvidence: {
        workflowPath: '.github/workflows/benchmark-projection.yml',
        runId: 'gha_run_projection_006',
        runUrl: 'https://github.com/frontier/private-proof-service/actions/runs/gha_run_projection_006',
        commitSha: 'projection1188abc',
        branch: BOUNDED_PROOF_EXPORT_REF,
        conclusion: 'failure',
        artifacts: [
          { name: 'projection-privacy-report.json', path: 'artifacts/projection-privacy-report.json', mediaType: 'application/json' }
        ],
        checks: [
          { name: 'projection privacy benchmark', conclusion: 'failure' },
          { name: 'bounded proof disclosure audit', conclusion: 'failure' }
        ],
        extractedOutputs: {
          failingCases: ['public-proof-overexposure', 'redaction-policy-skip'],
          weakDimensions: ['projection-safety', 'redaction-correctness', 'auditability'],
          baselineMetrics: {
            projectionSafety: 0.29,
            redactionCorrectness: 0.35,
            auditability: 0.48
          },
          touchedPaths: ['services/redaction/project_public_proof.ts', 'policies/disclosure/bounded_public.yml', 'docs/privacy/remediation.md'],
          symbols: ['projectBoundedPublicProof', 'redactPrivateArtifacts', 'allowBoundedDisclosure'],
          configKeys: ['projection.public.allowedArtifacts', 'projection.redaction.defaultMode'],
          parserKind: 'github-actions.auth-remediation.v3',
          parserVersion: '3.0.0'
        }
      }
    },
    {
      scenarioId: 'polyglot-gateway-benchmark-remediation',
      scenarioFamily: 'polyglot-repo-benchmark-remediation',
      coverageTags: ['polyglot', 'typescript', 'python', 'rust', 'cross-language', 'rollback'],
      repo: 'frontier/polyglot-gateway',
      installationId: DEFAULT_GITHUB_INSTALLATION_ID,
      baseRef: POLYGLOT_GATEWAY_REMEDIATION_REF,
      targetRef: 'main',
      prNumber: 1021,
      benchmarkHarnessPath: 'benchmarks/gateway_parity.yaml',
      benchmarkWorkflowPath: '.github/workflows/benchmark-gateway.yml',
      benchmarkRunId: 'gha_run_gateway_021',
      benchmarkRunUrl: 'https://github.com/frontier/polyglot-gateway/actions/runs/gha_run_gateway_021',
      repoContext: {
        repoTree: [
          'gateway/api/server.ts',
          'workers/session_replay.py',
          'crates/token_bridge/src/lib.rs',
          'config/gateway/issuer_policy.yml',
          'benchmarks/gateway_parity.yaml'
        ],
        stackHints: ['typescript', 'python', 'rust', 'gateway', 'github-actions'],
        symbols: ['applyIssuerRollback', 'replayQueuedSession', 'BridgeGuard'],
        configKeys: ['gateway.issuer.rollbackWindowSeconds', 'gateway.audit.requireCrossLanguageReceipt'],
        benchmarkTarget: {
          harnessPath: 'benchmarks/gateway_parity.yaml',
          targetSlice: 'gateway-parity'
        }
      },
      expectedTask: 'Repair a polyglot gateway issuer rollback without letting TypeScript, Python, and Rust session paths diverge.',
      expectedFailureModes: [
        'cross-language issuer rollback drifts between API, worker, and bridge runtimes',
        'queued session replay keeps stale issuer data after rollback',
        'cross-language audit receipt chain cannot be replayed end to end'
      ],
      expectedConstraints: [
        'preserve cross-language parity',
        'emit audit receipt',
        'keep rollback reversible',
        'keep remediation branch private until settlement completes'
      ],
      expectedTargetArtifactKinds: ['runbook', 'patch', 'config', 'proof'],
      humanPrompt: 'Read a polyglot remediation branch that keeps gateway rollback logic consistent across TypeScript, Python, and Rust.',
      canonicalRunEvidence: {
        workflowPath: '.github/workflows/benchmark-gateway.yml',
        runId: 'gha_run_gateway_021',
        runUrl: 'https://github.com/frontier/polyglot-gateway/actions/runs/gha_run_gateway_021',
        commitSha: 'gateway1021abc',
        branch: POLYGLOT_GATEWAY_REMEDIATION_REF,
        conclusion: 'failure',
        artifacts: [
          { name: 'gateway-parity-report.json', path: 'artifacts/gateway-parity-report.json', mediaType: 'application/json' },
          { name: 'cross-language-receipts.log', path: 'artifacts/cross-language-receipts.log', mediaType: 'text/plain' }
        ],
        checks: [
          { name: 'gateway parity benchmark', conclusion: 'failure' },
          { name: 'session replay worker', conclusion: 'failure' },
          { name: 'bridge receipt audit', conclusion: 'failure' }
        ],
        extractedOutputs: {
          failingCases: ['gateway-issuer-parity-drift', 'queued-session-replay-divergence', 'cross-language-receipt-gap'],
          weakDimensions: ['cross-language-parity', 'rollback-safety', 'auditability'],
          baselineMetrics: {
            crossLanguageParity: 0.31,
            rollbackSafety: 0.43,
            auditability: 0.39
          },
          touchedPaths: ['gateway/api/server.ts', 'workers/session_replay.py', 'crates/token_bridge/src/lib.rs', 'config/gateway/issuer_policy.yml'],
          symbols: ['applyIssuerRollback', 'replayQueuedSession', 'BridgeGuard'],
          configKeys: ['gateway.issuer.rollbackWindowSeconds', 'gateway.audit.requireCrossLanguageReceipt'],
          parserKind: 'github-actions.auth-remediation.v3',
          parserVersion: '3.0.0'
        }
      }
    },
    {
      scenarioId: 'auth-many-asset-normalization',
      scenarioFamily: 'many-asset-settlement-normalization',
      coverageTags: ['auth', 'many-asset', 'source-to-shares', 'normalization', 'auditability'],
      repo: 'frontier/demo-auth',
      installationId: DEFAULT_GITHUB_INSTALLATION_ID,
      baseRef: AUTH_MANY_ASSET_NORMALIZATION_REF,
      targetRef: 'main',
      prNumber: 519,
      benchmarkHarnessPath: 'benchmarks/auth_settlement_normalization.yaml',
      benchmarkWorkflowPath: '.github/workflows/benchmark-auth-normalization.yml',
      benchmarkRunId: 'gha_run_auth_019',
      benchmarkRunUrl: 'https://github.com/frontier/demo-auth/actions/runs/gha_run_auth_019',
      repoContext: {
        repoTree: [
          'services/auth/rollback.ts',
          'services/auth/session_validator.rs',
          'services/auth/audit_receipt.ts',
          'config/auth/issuer-compat.yml',
          'benchmarks/auth_settlement_normalization.yaml'
        ],
        stackHints: ['typescript', 'node', 'rust', 'auth', 'github-actions', 'jwt'],
        symbols: ['restorePriorVerifier', 'SessionValidator', 'emitAuditReceipt'],
        configKeys: ['auth.audit.requireWorkflowRun', 'auth.issuer.compatibilityWindow'],
        benchmarkTarget: {
          harnessPath: 'benchmarks/auth_settlement_normalization.yaml',
          targetSlice: 'auth-normalization'
        }
      },
      expectedTask: 'Recover auth rollback while keeping session validity, issuer compatibility, and audit receipts aligned across multiple remediation assets.',
      expectedFailureModes: [
        'issuer rollback repair is split across several strong assets with partial overlap',
        'audit receipt linkage drops the workflow run during rollback',
        'session validator and rollback notes disagree on the compatibility window'
      ],
      expectedConstraints: [
        'preserve session validity',
        'emit audit receipt',
        'bind workflow run to receipt',
        'keep remediation branch private until settlement completes'
      ],
      expectedTargetArtifactKinds: ['runbook', 'patch', 'config', 'proof'],
      humanPrompt: 'Read a normalization-heavy auth remediation branch that can justify source-to-shares replay across multiple strong assets.',
      canonicalRunEvidence: {
        workflowPath: '.github/workflows/benchmark-auth-normalization.yml',
        runId: 'gha_run_auth_019',
        runUrl: 'https://github.com/frontier/demo-auth/actions/runs/gha_run_auth_019',
        commitSha: 'auth519abc',
        branch: AUTH_MANY_ASSET_NORMALIZATION_REF,
        conclusion: 'failure',
        artifacts: [
          { name: 'auth-normalization-report.json', path: 'artifacts/auth-normalization-report.json', mediaType: 'application/json' },
          { name: 'audit-receipt-diff.log', path: 'artifacts/audit-receipt-diff.log', mediaType: 'text/plain' }
        ],
        checks: [
          { name: 'auth normalization benchmark', conclusion: 'failure' },
          { name: 'audit receipt reconciliation', conclusion: 'failure' },
          { name: 'session validator compatibility', conclusion: 'failure' }
        ],
        extractedOutputs: {
          failingCases: ['rollback-ordering-audit-receipt', 'issuer-mismatch-pre-migration-service', 'workflow-run-receipt-gap'],
          weakDimensions: ['rollback-safety', 'session-validity', 'auditability'],
          baselineMetrics: {
            rollbackSafety: 0.44,
            sessionValidity: 0.45,
            auditability: 0.36
          },
          touchedPaths: ['services/auth/rollback.ts', 'services/auth/session_validator.rs', 'services/auth/audit_receipt.ts', 'config/auth/issuer-compat.yml'],
          symbols: ['restorePriorVerifier', 'SessionValidator', 'emitAuditReceipt'],
          configKeys: ['auth.audit.requireWorkflowRun', 'auth.issuer.compatibilityWindow'],
          parserKind: 'github-actions.auth-remediation.v3',
          parserVersion: '3.0.0'
        }
      }
    }
  ];
  const policyState = buildPolicyState();

  const ledger = {
    accounts: {
      'buyer:frontier-code-systems:license_pool': buyers[0]?.licensePoolMicroUnits || '0',
      ...Object.fromEntries(assets.map((asset) => [`supplier:${asset.assetId}:pending_claims`, '0']))
    },
    journalEvents: []
  };

  return {
    version: 3,
    specVersion: SPEC_VERSION,
    canonPosture: CURRENT_CANON_POSTURE,
    conformanceProfiles: {
      active: PROFILE_A,
      productionIntent: PROFILE_B,
      prototypeOnlyModeledControls: true,
      profileCompositions: buildProfileCompositions()
    },
    assets,
    buyers,
    readScenarios,
    githubAppSessions,
    repoArtifactInventory,
    policyState,
    ledger,
    latestRun: null,
    runHistory: []
  };
}

/**
 * @param {any} asset
 * @returns {string[]}
 */
function assetEvidenceRefs(asset) {
  return [asset.contentRoot, asset.provenanceBinding.commit, asset.verificationEvidence.benchmarkRunId].filter(Boolean);
}

/**
 * @param {any} scenario
 * @param {any} benchmarkOutputs
 * @returns {string}
 */
function inferReadTask(scenario, benchmarkOutputs) {
  if (scenario.task) return scenario.task;
  if (scenario.expectedTask) return scenario.expectedTask;
  const priorityFailure = benchmarkOutputs.failingCases[0] || 'measured benchmark failure';
  const primaryDimension = benchmarkOutputs.weakDimensions[0] || 'engineering reliability';
  return `Resolve ${priorityFailure} while improving ${primaryDimension} in ${scenario.repo}.`;
}

/**
 * @param {any} scenario
 * @param {any} benchmarkOutputs
 * @returns {string[]}
 */
function inferFailureModes(scenario, benchmarkOutputs) {
  if (scenario.failureModes?.length) return summarizeStrings(scenario.failureModes);
  if (scenario.expectedFailureModes?.length) return scenario.expectedFailureModes;
  return benchmarkOutputs.failingCases.map((/** @type {any} */ caseId) => caseId.replace(/-/g, ' '));
}

/**
 * @param {any} scenario
 * @param {any} benchmarkOutputs
 * @returns {string[]}
 */
function inferConstraints(scenario, benchmarkOutputs) {
  if (scenario.constraints?.length) {
    return summarizeStrings(union(scenario.constraints, ['keep remediation branch private until settlement completes']));
  }
  const constraints = union(
    scenario.expectedConstraints || [],
    benchmarkOutputs.weakDimensions.map((/** @type {any} */ dimension) => {
      if (dimension === 'session-validity') return 'preserve session validity';
      if (dimension === 'auditability') return 'emit audit receipt';
      return `improve ${dimension}`;
    })
  );
  return summarizeStrings(union(constraints, ['keep remediation branch private until settlement completes']));
}

/**
 * @param {any} scenario
 * @param {any} benchmarkOutputs
 * @returns {string[]}
 */
function inferTargetArtifactKinds(scenario, benchmarkOutputs) {
  if (scenario.targetArtifactKinds?.length) return summarizeStrings(scenario.targetArtifactKinds);
  if (scenario.expectedTargetArtifactKinds?.length) return scenario.expectedTargetArtifactKinds;
  const inferred = ['runbook', 'patch'];
  if (benchmarkOutputs.configKeys.length) inferred.push('config');
  if (benchmarkOutputs.symbols.some((/** @type {any} */ symbol) => /validator|prove|invariant/i.test(symbol))) inferred.push('proof');
  return summarizeStrings(inferred);
}

/**
 * @param {any} scenario
 * @param {any} benchmarkOutputs
 * @param {any[]} [targetArtifactKinds=[]]
 * @returns {string[]}
 */
function inferClosureCriteria(scenario, benchmarkOutputs, targetArtifactKinds = []) {
  if (scenario.expectedClosureCriteria?.length) return summarizeStrings(scenario.expectedClosureCriteria);
  if (scenario.closureCriteria?.length) return summarizeStrings(scenario.closureCriteria);
  const criteria = benchmarkOutputs.failingCases.slice(0, 2).map((/** @type {any} */ caseId) => `clear ${caseId.replace(/-/g, ' ')}`);
  for (const dimension of benchmarkOutputs.weakDimensions || []) {
    if (dimension === 'session-validity') criteria.push('preserve session validity during rollback');
    else if (dimension === 'auditability') criteria.push('restore audit receipt linkage to repo and commit');
    else if (dimension === 'rollback-safety') criteria.push('keep rollback sequencing replay-safe');
    else criteria.push(`improve ${dimension}`);
  }
  if (targetArtifactKinds.includes('proof')) {
    criteria.push('carry proof-bearing evidence for the decisive invariant checks');
  }
  return summarizeStrings(criteria).slice(0, 5);
}

/**
 * @param {any} scenario
 * @param {any} benchmarkOutputs
 * @returns {string[]}
 */
function inferStackHints(scenario, benchmarkOutputs) {
  return inferReadTechnologyProfile(scenario, benchmarkOutputs).stackHints;
}

/**
 * Package-owned technology signal normalization keeps read measurement and
 * downstream product surfaces on one canonical Bitcode vocabulary instead of
 * letting protocol-local string heuristics drift over time.
 *
 * @param {any} scenario
 * @param {any} benchmarkOutputs
 * @returns {{ stackHints: string[], languages: string[], technologies: string[], brands: string[] }}
 */
function inferReadTechnologyProfile(scenario, benchmarkOutputs) {
  const seededHints = summarizeStrings(union(scenario.repoContext?.stackHints || [], [
    ...benchmarkOutputs.symbols.filter((/** @type {any} */ symbol) => /validator/i.test(symbol)).map(() => 'rust'),
    ...benchmarkOutputs.touchedPaths.filter((/** @type {any} */ item) => item.endsWith('.ts')).map(() => 'typescript'),
    ...benchmarkOutputs.configKeys.filter((/** @type {any} */ item) => item.startsWith('auth.')).map(() => 'auth')
  ]));

  return inferTechnologySignals({
    stackHints: seededHints,
    touchedPaths: benchmarkOutputs.touchedPaths,
    symbols: benchmarkOutputs.symbols,
    configKeys: benchmarkOutputs.configKeys,
  });
}

/**
 * @param {any} scenario
 * @param {any} benchmarkOutputs
 * @returns {any}
 */
function buildRepoStaticCodeAnalysis(scenario, benchmarkOutputs) {
  const technologyProfile = inferReadTechnologyProfile(scenario, benchmarkOutputs);
  const lspMeasurementEnvelope = {
    toolPurpose: 'static Read measurement through symbol, path, and config evidence',
    measuredFields: ['read.touchedPaths', 'read.extractedSymbols', 'read.configKeys', 'read.stackHints'],
    symbolQueries: summarizeStrings(benchmarkOutputs.symbols),
    pathEvidence: summarizeStrings(union(benchmarkOutputs.touchedPaths, scenario.repoContext?.repoTree?.filter((/** @type {any} */ item) => benchmarkOutputs.touchedPaths.includes(item)) || [])),
    configEvidence: summarizeStrings(union(benchmarkOutputs.configKeys, scenario.repoContext?.configKeys || [])),
    outputContract: 'feeds ReadDescriptor.staticMeasurements and AssetPack ranking evidence'
  };
  const normalizedOutputEnvelope = {
    touchedPaths: lspMeasurementEnvelope.pathEvidence,
    extractedSymbols: summarizeStrings(union(benchmarkOutputs.symbols, scenario.repoContext?.symbols || [])),
    configKeys: lspMeasurementEnvelope.configEvidence,
    stackHints: technologyProfile.stackHints,
    technologyProfile,
    lspMeasurement: lspMeasurementEnvelope
  };
  const repoContextReceipt = buildStaticExecutionReceipt({
    receiptKind: 'repo-context-static-measurement',
    stageId: 'github.repo-context.extract.v15',
    toolId: 'github.repo-context.extract.v15',
    inputs: {
      repo: scenario.repo,
      benchmarkOutputs,
      repoContext: scenario.repoContext || null
    },
    normalizedOutputEnvelope,
    evidenceRefs: [scenario.repo, ...normalizedOutputEnvelope.touchedPaths],
    replayInputClosure: [scenario.repo, scenario.canonicalRunEvidence?.runId]
  });
  const lspMeasurementReceipt = buildStaticExecutionReceipt({
    receiptKind: 'lsp-read-static-measurement',
    stageId: 'lsp.semantic-measurement.v26',
    toolId: 'bitcode.lsp.measure-read-static.v26',
    inputs: {
      repo: scenario.repo,
      benchmarkOutputs,
      repoContext: scenario.repoContext || null,
      measuredFields: lspMeasurementEnvelope.measuredFields
    },
    normalizedOutputEnvelope: lspMeasurementEnvelope,
    evidenceRefs: [
      scenario.repo,
      ...normalizedOutputEnvelope.touchedPaths,
      ...normalizedOutputEnvelope.extractedSymbols,
      ...normalizedOutputEnvelope.configKeys
    ],
    replayInputClosure: [scenario.repo, scenario.canonicalRunEvidence?.runId]
  });
  return {
    ...normalizedOutputEnvelope,
    staticExecutionReceipts: [repoContextReceipt, lspMeasurementReceipt]
  };
}

const readMeasurementRuntime = createReadMeasurementRuntimeUnchecked({
  RECALL_CHANNEL_SPECS,
  buildGithubActionsBenchmarkParser,
  buildStaticExecutionReceipt,
  buildRepoStaticCodeAnalysis,
  inferReadTask,
  inferFailureModes,
  inferConstraints,
  inferTargetArtifactKinds,
  inferClosureCriteria,
  derivationRecord,
  collectStaticExecutionReceipts,
  summarizeStrings,
  toSlug,
  sha256
});

/**
 * @param {any} scenario
 * @returns {any}
 */
export function measureReadFromScenario(scenario) {
  return readMeasurementRuntime.measureReadFromScenario(scenario);
}

/**
 * @param {any} scenario
 * @returns {any}
 */
export function buildReadDescriptor(scenario) {
  return readMeasurementRuntime.buildReadDescriptor(scenario);
}

/**
 * @param {any} reviewableRead
 * @param {any} [input={}]
 * @returns {any}
 */
export function reviewReadForFitSearch(reviewableRead, input = {}) {
  return readMeasurementRuntime.reviewReadForFitSearch(reviewableRead, input);
}

const evaluationMaterializationRuntime = createEvaluationMaterializationRuntimeUnchecked({
  DEFAULT_BRANCH_MODE,
  DEFAULT_MODEL_ID,
  RECALL_CHANNEL_BUDGETS,
  RECALL_CHANNEL_SPECS,
  measurementTrace,
  buildRecallChannelContracts,
  summarizeStrings,
  uniqueTokens,
  union,
  intersection,
  buildEmbeddingArtifact,
  cosineSimilarity,
  overlapScore,
  clamp01,
  summarizeScore,
  measurementDetail,
  rankingEvidenceRefs,
  CODE_ANALYSIS_CONSUMERS,
  buildStaticExecutionReceipt,
  countValues,
  sha256,
  stableHashObject
});

/**
 * @param {any} read
 * @param {any} assets
 * @returns {any}
 */
export function recallCandidates(read, assets) {
  return evaluationMaterializationRuntime.recallCandidates(read, assets);
}

/**
 * @param {any} read
 * @param {any} assets
 * @param {any} [policyState=buildPolicyState()]
 * @returns {any}
 */
export function evaluateCandidates(read, assets, policyState = buildPolicyState()) {
  return evaluationMaterializationRuntime.evaluateCandidates(read, assets, policyState);
}

/**
 * @param {any} read
 * @param {any} evaluatedCandidates
 * @param {any} [branchMode=DEFAULT_BRANCH_MODE]
 * @returns {any}
 */
export function assembleAssetPack(read, evaluatedCandidates, branchMode = DEFAULT_BRANCH_MODE) {
  return evaluationMaterializationRuntime.assembleAssetPack(read, evaluatedCandidates, branchMode);
}

/**
 * @param {any} read
 * @param {any} evaluatedCandidates
 * @param {any} assetPack
 * @returns {any}
 */
function buildMatchReport(read, evaluatedCandidates, assetPack) {
  return evaluationMaterializationRuntime.buildMatchReport(read, evaluatedCandidates, assetPack);
}

/**
 * @param {any} read
 * @param {any} evaluatedCandidates
 * @param {any} [branchMode=DEFAULT_BRANCH_MODE]
 * @returns {any}
 */
function buildVerificationReport(read, evaluatedCandidates, branchMode = DEFAULT_BRANCH_MODE) {
  return evaluationMaterializationRuntime.buildVerificationReport(read, evaluatedCandidates, branchMode);
}

/**
 * @param {any} read
 * @param {any[]} [evaluatedCandidates=[]]
 * @returns {any}
 */
function buildVerificationReceiptsArtifact(read, evaluatedCandidates = []) {
  return evaluationMaterializationRuntime.buildVerificationReceiptsArtifact(read, evaluatedCandidates);
}

/**
 * @param {any} read
 * @param {any} evaluatedCandidates
 * @param {any[]} [promptSurfaces=[]]
 * @param {any[]} [parsedCompletionEnvelopes=[]]
 * @returns {any}
 */
function buildEvalManifest(read, evaluatedCandidates, promptSurfaces = [], parsedCompletionEnvelopes = []) {
  return evaluationMaterializationRuntime.buildEvalManifest(read, evaluatedCandidates, promptSurfaces, parsedCompletionEnvelopes);
}

/**
 * @param {any} assetPack
 * @param {any} selectedCandidates
 * @returns {any}
 */
function buildAssetPackLock(assetPack, selectedCandidates) {
  return evaluationMaterializationRuntime.buildAssetPackLock(assetPack, selectedCandidates);
}

/**
 * @param {any} assetPack
 * @param {any} selectedCandidates
 * @returns {any}
 */
function buildSelectedSourceMaterialManifest(assetPack, selectedCandidates) {
  return evaluationMaterializationRuntime.buildSelectedSourceMaterialManifest(assetPack, selectedCandidates);
}

const settlementRuntime = createSettlementRuntimeUnchecked({
  METERED_MICRO_UNITS,
  MAX_BPS,
  MAX_BPS_BIGINT,
  SOURCE_TO_SHARES_SCALE,
  countValues,
  stableHashObject,
  sha256
});

/**
 * @param {any} read
 * @param {any} settlementCandidates
 * @returns {any}
 */
function buildSourceToSharesArtifact(read, settlementCandidates) {
  return settlementRuntime.buildSourceToSharesArtifact(read, settlementCandidates);
}

/**
 * @param {any} buyer
 * @param {any} selectedCandidates
 * @returns {any}
 */
function buildIdentityBindings(buyer, selectedCandidates) {
  const sessionBindings = [...new Map(
    selectedCandidates
      .filter((/** @type {any} */ candidate) => candidate.asset.githubAppAuthSurface?.authSessionId)
      .map((/** @type {any} */ candidate) => [candidate.asset.githubAppAuthSurface.authSessionId, {
        principalId: `github-app-session:${candidate.asset.githubAppAuthSurface.authSessionId}`,
        principalClass: 'github-app-session-principal',
        authSource: 'github-app-installation',
        boundRefs: [
          candidate.asset.githubAppAuthSurface.authSessionId,
          candidate.asset.addressingSurface?.repo,
          candidate.asset.githubAppAuthSurface.installationId,
          candidate.asset.githubAppAuthSurface.repositoryId
        ].filter(Boolean),
        surfaceRoots: {
          authPayloadHash: candidate.asset.githubAppAuthSurface?.authPayloadHash,
          permissionsRoot: candidate.asset.githubAppAuthSurface?.permissionsRoot
        }
      }])
  ).values()];

  const bindings = [
    {
      principalId: `buyer:${buyer.buyerId}`,
      principalClass: 'buyer-principal',
      authSource: 'github',
      boundRefs: [buyer.repo, buyer.buyerBranch, buildRepoIdentity(buyer.repo).repositoryId]
    },
    {
      principalId: `github-app-installation:${buyer.installationId}`,
      principalClass: 'github-app-installation-principal',
      authSource: 'github-app-installation',
      boundRefs: [buyer.installationId, buyer.repo, buyer.buyerBranch, buildRepoIdentity(buyer.repo).repositoryId]
    },
    {
      principalId: 'bitcode-system:read-measurement',
      principalClass: 'bitcode-system-principal',
      authSource: 'policy',
      boundRefs: ['read-measurement']
    },
    {
      principalId: 'bitcode-system:read-review',
      principalClass: 'bitcode-system-principal',
      authSource: 'policy',
      boundRefs: ['read-review', 'post-measurement-pre-fit']
    },
    {
      principalId: 'bitcode-system:branch-materializer',
      principalClass: 'bitcode-system-principal',
      authSource: 'policy',
      boundRefs: ['private-remediation-branch']
    },
    {
      principalId: 'bitcode-system:settlement-engine',
      principalClass: 'bitcode-system-principal',
      authSource: 'policy',
      boundRefs: ['settlement-engine']
    },
    {
      principalId: 'bitcode-system:proof-publisher',
      principalClass: 'bitcode-system-principal',
      authSource: 'policy',
      boundRefs: ['bounded-public-proof']
    },
    {
      principalId: 'reviewer:security',
      principalClass: 'authorized-reviewer',
      authSource: 'policy',
      boundRefs: [buyer.repo]
    },
    {
      principalId: 'public:reader',
      principalClass: 'public-reader',
      authSource: 'policy',
      boundRefs: ['bounded-public-proof']
    },
    ...sessionBindings,
    ...selectedCandidates.map((/** @type {any} */ candidate) => ({
      principalId: candidate.asset.attestations[0]?.signerAddress || `issuer:${candidate.assetId}`,
      principalClass: 'issuer-principal',
      authSource: 'attestation',
      boundRefs: [
        candidate.assetId,
        candidate.asset.contentRoot,
        candidate.asset.addressingSurface?.repo,
        candidate.asset.githubAppAuthSurface?.installationId,
        candidate.asset.artifactSelectionSurface?.selectedInventoryRoot,
        candidate.asset.addressingSurface?.addressingRoot,
        candidate.asset.githubAppAuthSurface?.authPayloadHash,
        candidate.asset.signingSurface?.payloadHash
      ].filter(Boolean),
      surfaceRoots: {
        selectionRoot: candidate.asset.artifactSelectionSurface?.selectedInventoryRoot,
        addressingRoot: candidate.asset.addressingSurface?.addressingRoot,
        authPayloadHash: candidate.asset.githubAppAuthSurface?.authPayloadHash,
        payloadHash: candidate.asset.signingSurface?.payloadHash
      },
      selectedInventoryEntryIds: candidate.asset.artifactSelectionSurface?.selectedInventoryEntryIds || []
    }))
  ];

  return bindings.map((binding) => ({
    ...binding,
    bindingRoot: stableHashObject({
      principalId: binding.principalId,
      principalClass: binding.principalClass,
      authSource: binding.authSource,
      boundRefs: binding.boundRefs,
      surfaceRoots: binding.surfaceRoots || {},
      selectedInventoryEntryIds: binding.selectedInventoryEntryIds || []
    })
  }));
}

/**
 * @param {any} policyState
 * @param {any} bindings
 * @param {any} buyer
 * @param {any} branchName
 * @param {any} assetPack
 * @returns {any}
 */
function buildAuthorizationDecisions(policyState, bindings, buyer, branchName, assetPack) {
  return [
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === `github-app-installation:${buyer.installationId}`), 'read:repo-artifact-inventory', buyer.repo, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === `buyer:${buyer.buyerId}`), 'read:private-branch', branchName, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === `buyer:${buyer.buyerId}`), 'materialize:selected-source-material', `${branchName}/.bitcode/source-material`, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === `buyer:${buyer.buyerId}`), 'settle:journal-event', assetPack.assetPackId, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === 'bitcode-system:read-review'), 'review:measured-read', `${assetPack.assetPackId}#read-review`, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === 'bitcode-system:branch-materializer'), 'write:private-branch', branchName, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === 'bitcode-system:branch-materializer'), 'materialize:selected-source-material', `${branchName}/.bitcode/source-material`, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === 'bitcode-system:settlement-engine'), 'settle:journal-event', assetPack.assetPackId, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === 'bitcode-system:proof-publisher'), 'derive:bounded-public-proof-metadata', `${branchName}#bounded-proof`, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === 'reviewer:security'), 'read:private-branch', branchName, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === 'public:reader'), 'read:bounded-public-proof', `${branchName}#bounded-proof`, policyState),
    makeAuthorizationDecision(bindings.find((/** @type {any} */ binding) => binding.principalId === `buyer:${buyer.buyerId}`), 'open:delivery', branchName, policyState)
  ];
}

/**
 * @param {any} policyState
 * @param {any} buyer
 * @param {any} branchName
 * @param {any} assetPack
 * @param {any} selectedCandidates
 * @returns {any}
 */
function buildSensitiveDataFlowRecords(policyState, buyer, branchName, assetPack, selectedCandidates) {
  return [
    {
      recordId: `flow_${sha256(`${branchName}:repo-source`).slice(0, 10)}`,
      dataClass: 'repo-private-source',
      fromSurface: `${buyer.repo}@${buyer.buyerBranch}`,
      toSurface: 'bitcode.read-measurement.activity',
      transformation: 'benchmark-read-measurement',
      authorizedPrincipals: [`buyer:${buyer.buyerId}`, 'bitcode-system:read-measurement'],
      retentionPolicyId: 'retention/private-remediation-30d',
      disclosurePolicyId: 'disclosure/private-only',
      proofRefs: [assetPack.assetPackId]
    },
    {
      recordId: `flow_${sha256(`${branchName}:verification`).slice(0, 10)}`,
      dataClass: 'verification-evidence',
      fromSurface: `${buyer.repo}@${buyer.buyerBranch}`,
      toSurface: `${branchName}/.bitcode/verification-report.json`,
      transformation: 'verification-report-materialization',
      authorizedPrincipals: ['bitcode-system:read-measurement', 'bitcode-system:branch-materializer'],
      retentionPolicyId: 'retention/private-remediation-30d',
      disclosurePolicyId: 'disclosure/private-only',
      proofRefs: selectedCandidates.map((/** @type {any} */ candidate) => candidate.assetId)
    },
    {
      recordId: `flow_${sha256(`${branchName}:read-review`).slice(0, 10)}`,
      dataClass: 'private-proof-artifact',
      fromSurface: `${branchName}/.bitcode/read-measurement.json`,
      toSurface: `${branchName}/.bitcode/read-review.json`,
      transformation: 'post-measurement-pre-fit-read-review',
      authorizedPrincipals: ['bitcode-system:read-review'],
      retentionPolicyId: 'retention/private-remediation-30d',
      disclosurePolicyId: 'disclosure/private-only',
      proofRefs: [assetPack.assetPackId, 'source-to-shares']
    },
    {
      recordId: `flow_${sha256(`${branchName}:licensed-source`).slice(0, 10)}`,
      dataClass: 'licensed-source-material',
      fromSurface: assetPack.assetPackId,
      toSurface: `${branchName}/.bitcode/source-material/`,
      transformation: 'source-material-mount',
      authorizedPrincipals: [`buyer:${buyer.buyerId}`, 'bitcode-system:branch-materializer'],
      retentionPolicyId: 'retention/private-remediation-30d',
      disclosurePolicyId: 'disclosure/private-only',
      proofRefs: selectedCandidates.map((/** @type {any} */ candidate) => candidate.assetId)
    },
    {
      recordId: `flow_${sha256(`${branchName}:branch-artifacts`).slice(0, 10)}`,
      dataClass: 'private-branch-derived-artifact',
      fromSurface: branchName,
      toSurface: `${branchName}/${BRANCH_READ_PATH}`,
      transformation: 'human-readable-branch-briefing',
      authorizedPrincipals: ['bitcode-system:branch-materializer', `buyer:${buyer.buyerId}`],
      retentionPolicyId: 'retention/private-remediation-30d',
      disclosurePolicyId: 'disclosure/private-only',
      proofRefs: [assetPack.assetPackId, BRANCH_READ_PATH]
    },
    {
      recordId: `flow_${sha256(`${branchName}:settlement-preview`).slice(0, 10)}`,
      dataClass: 'settlement-preview',
      fromSurface: `${branchName}/.bitcode/asset-pack.lock.json`,
      toSurface: `${branchName}/.bitcode/settlement-preview.json`,
      transformation: 'settlement-preview-derivation',
      authorizedPrincipals: ['bitcode-system:settlement-engine'],
      retentionPolicyId: 'retention/private-remediation-30d',
      disclosurePolicyId: 'disclosure/private-only',
      proofRefs: ['settlement-preview', assetPack.assetPackId]
    },
    {
      recordId: `flow_${sha256(`${branchName}:private-proof`).slice(0, 10)}`,
      dataClass: 'private-proof-artifact',
      fromSurface: `${branchName}/.bitcode/journal-diff.json`,
      toSurface: `${branchName}/.bitcode/system-proof-bundle.json`,
      transformation: 'cross-proof-bundle-assembly',
      authorizedPrincipals: ['bitcode-system:settlement-engine', 'bitcode-system:proof-publisher'],
      retentionPolicyId: 'retention/private-remediation-30d',
      disclosurePolicyId: 'disclosure/private-only',
      proofRefs: ['system-proof-bundle', 'journal-diff']
    },
    {
      recordId: `flow_${sha256(`${branchName}:bounded-proof`).slice(0, 10)}`,
      dataClass: 'bounded-public-proof-metadata',
      fromSurface: `${branchName}/.bitcode/system-proof-bundle.json`,
      toSurface: 'bounded-public-proof-surface',
      transformation: 'bounded-proof-summary-projection',
      authorizedPrincipals: ['bitcode-system:proof-publisher'],
      retentionPolicyId: 'retention/bounded-public-365d',
      disclosurePolicyId: 'disclosure/bounded-public',
      proofRefs: ['system-proof-bundle']
    }
  ].map((record) => ({
    ...record,
    policyRef: policyState.policyRef
  }));
}

/**
 * @param {any} policyState
 * @param {any} branchName
 * @param {any} assetPack
 * @param {any} selectedCandidates
 * @returns {any}
 */
function buildBranchPolicyRelease(policyState, branchName, assetPack, selectedCandidates, { v23BitcoinEnabled = false } = {}) {
  const v23ArtifactClasses = v23BitcoinEnabled
    ? [
        { path: '.bitcode/compute-reality-manifest.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
        { path: '.bitcode/storage-reality-manifest.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
        { path: '.bitcode/bitcoin-commitment-manifest.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
        { path: '.bitcode/bitcoin-treasury-policy.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
        { path: '.bitcode/bitcoin-anchor.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
        { path: '.bitcode/bitcoin-bounded-public-anchor.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
        { path: '.bitcode/bitcoin-settlement-intent.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
        { path: '.bitcode/bitcoin-settlement-observation.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
        { path: '.bitcode/bitcoin-audit-anchor-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
        { path: '.bitcode/bitcoin-settlement-interface-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false }
      ]
    : [];
  return {
    branchName,
    assetPackId: assetPack.assetPackId,
    releaseId: policyState.releaseId,
    releasePolicyId: policyState.releaseId,
    policyRef: policyState.policyRef,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    confidentialityDefault: 'private-required',
    artifactClasses: [
      { path: '.bitcode/read.json', sensitiveDataClass: 'private-branch-derived-artifact', disclosable: false },
      { path: '.bitcode/read-review.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/depositing-surface.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/reading-surface.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/deposit-to-read-surface.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/match-report.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/verification-report.json', sensitiveDataClass: 'verification-evidence', disclosable: false },
      { path: '.bitcode/authorization-decisions.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/sensitive-data-flow.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/policy-release.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/identity-bindings.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/asset-pack.lock.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/selected-source-material.json', sensitiveDataClass: 'licensed-source-material', disclosable: false },
      { path: '.bitcode/prompt-family-registry.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/prompt-surfaces.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/prompt-contracts.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/inference-moment-contracts.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/inference-proofs.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/inference-synthesis-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/prompt-implementation-surface.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/prompt-completeness-proof.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/parsed-completion-envelopes.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/code-analysis-fact-registry.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/static-heuristics-registry.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/eval-manifest.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/external-boundary-manifest.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/measurement-receipts.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/static-measurement-report.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/static-measurement-proof.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/verification-receipts.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/verification-decisions-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/selection-consistency-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/selection-and-materialization-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/materialization-proof.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/materialization-exclusions.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/proof-witness-manifest.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/materialization-visibility-proof.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/identity-authorization-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/sensitive-data-flow-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/authorization-and-sensitive-flow-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/projection-policy.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/bounded-public-proof.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/redaction-proof.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/disclosure-proof.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/disclosure-boundary-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/source-to-shares.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/settlement-participation.json', sensitiveDataClass: 'settlement-preview', disclosable: false },
      { path: '.bitcode/accounting-precision-report.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/journal-diff.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/journal-completeness-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/settlement-source-to-shares-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/scenario-fixture-manifest.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/test-coverage-report.json', sensitiveDataClass: 'bounded-public-proof-metadata', disclosable: true },
      { path: '.bitcode/source-material/', sensitiveDataClass: 'licensed-source-material', disclosable: false },
      { path: '.bitcode/settlement-preview.json', sensitiveDataClass: 'settlement-preview', disclosable: false },
      { path: '.bitcode/settlement-proof.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/proof-contract.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      { path: '.bitcode/system-proof-bundle.json', sensitiveDataClass: 'private-proof-artifact', disclosable: false },
      ...v23ArtifactClasses,
      { path: BRANCH_READ_PATH, sensitiveDataClass: 'private-branch-derived-artifact', disclosable: false }
    ],
    retentionRules: [
      {
        retentionPolicyId: 'retention/private-remediation-30d',
        appliesTo: [
          '.bitcode/source-material/',
          '.bitcode/read-review.json',
          '.bitcode/settlement-preview.json',
          '.bitcode/settlement-proof.json',
          '.bitcode/compute-reality-manifest.json',
          '.bitcode/storage-reality-manifest.json',
          '.bitcode/bitcoin-commitment-manifest.json',
          '.bitcode/bitcoin-treasury-policy.json',
          '.bitcode/bitcoin-anchor.json',
          '.bitcode/bitcoin-settlement-intent.json',
          '.bitcode/bitcoin-settlement-observation.json',
          '.bitcode/bitcoin-audit-anchor-proof.json',
          '.bitcode/bitcoin-settlement-interface-proof.json',
          BRANCH_READ_PATH
        ],
        ttlDays: 30
      },
      { retentionPolicyId: 'retention/bounded-public-365d', appliesTo: ['bounded-public-proof-surface', '.bitcode/bitcoin-bounded-public-anchor.json'], ttlDays: 365 }
    ],
    revocationRules: {
      revokedIssuerBlocksNewSettlement: true,
      revokedIssuerBlocksNewDelivery: true,
      'previouslyIssuedArtifactsRemainHash-addressableOnly': true
    },
    selectedAssets: selectedCandidates.map((/** @type {any} */ candidate) => candidate.assetId),
    selectedAssetBindings: selectedCandidates.map((/** @type {any} */ candidate) => ({
      assetId: candidate.assetId,
      useTier: candidate.useTier,
      sourceMaterialBinding: candidate.asset.sourceMaterialBinding
    }))
  };
}

/**
 * @param {any} eventId
 * @param {any} journalDiff
 * @returns {any}
 */
function buildJournalCompletenessProof(eventId, journalDiff) {
  return settlementRuntime.buildJournalCompletenessProof(eventId, journalDiff);
}

/**
 * @param {any} branchName
 * @param {any} authorizationDecisions
 * @param {any} bindings
 * @param {any[]} [selectedCandidates=[]]
 * @returns {any}
 */
function buildIdentityAuthorizationProof(branchName, authorizationDecisions, bindings, selectedCandidates = []) {
  const inventoryBackedCandidates = selectedCandidates.filter((/** @type {any} */ candidate) => (candidate.asset.artifactSelectionSurface?.selectedInventoryEntryIds || []).length > 0);
  const allAccessBoundToKnownPrincipals = authorizationDecisions.every((/** @type {any} */ decision) => bindings.some((/** @type {any} */ binding) => binding.principalId === decision.principalId));
  const allStateChangingActionsAuthorized = authorizationDecisions.filter((/** @type {any} */ decision) => decision.action === 'settle:journal-event' || decision.action === 'write:private-branch' || decision.action === 'materialize:selected-source-material' || decision.action === 'review:measured-read').every((/** @type {any} */ decision) => decision.decision === 'allow');
  const witnessArtifactPaths = ['.bitcode/identity-bindings.json', '.bitcode/authorization-decisions.json', '.bitcode/identity-authorization-proof.json'];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'identity-authorization.principal-bindings',
      theoremIds: ['authorization_and_sensitive_flow.principal_authority_totality'],
      requiredArtifactPaths: ['.bitcode/identity-bindings.json', '.bitcode/identity-authorization-proof.json'],
      instruction: 'Replay principal binding closure against identity bindings and authorization decisions.'
    }),
    buildReplayStep({
      stepId: 'identity-authorization.state-actions',
      theoremIds: ['authorization_and_sensitive_flow.authorization_decision_closure'],
      requiredArtifactPaths: ['.bitcode/authorization-decisions.json', '.bitcode/identity-authorization-proof.json'],
      instruction: 'Replay state-changing authorization and asset-signing closure.'
    })
  ];
  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'authorization_and_sensitive_flow.principal_authority_totality',
      passed: allAccessBoundToKnownPrincipals,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['identity-authorization.principal-bindings'],
      failureReasons: allAccessBoundToKnownPrincipals ? [] : ['authorization decisions reference principals not present in identity bindings']
    }),
    buildTheoremVerdict({
      theoremId: 'authorization_and_sensitive_flow.authorization_decision_closure',
      passed: allStateChangingActionsAuthorized,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['identity-authorization.state-actions'],
      failureReasons: allStateChangingActionsAuthorized ? [] : ['one or more state-changing actions are not allowed']
    })
  ];
  return {
    resourceRef: branchName,
    allAccessBoundToKnownPrincipals,
    allStateChangingActionsAuthorized,
    issuerIdentityBound: bindings.some((/** @type {any} */ binding) => binding.principalClass === 'issuer-principal'),
    buyerDeliveryPrincipalsBound: bindings.some((/** @type {any} */ binding) => binding.principalClass === 'buyer-principal'),
    githubAppInstallationBound: bindings.some((/** @type {any} */ binding) => binding.principalClass === 'github-app-installation-principal'),
    repoArtifactInventoryReadAuthorized: authorizationDecisions.some((/** @type {any} */ decision) => decision.action === 'read:repo-artifact-inventory' && decision.decision === 'allow'),
    selectedAssetsAddressed: selectedCandidates.every((/** @type {any} */ candidate) => !!candidate.asset.addressingSurface?.repo),
    selectedAssetsSigned: selectedCandidates.every((/** @type {any} */ candidate) => !!candidate.asset.signingSurface?.signerAddress && !!candidate.asset.signingSurface?.attestationHash),
    selectedAssetsSignedAgainstAddressing: selectedCandidates.every((/** @type {any} */ candidate) => candidate.asset.signingSurface?.signedAddressingRoot === candidate.asset.addressingSurface?.addressingRoot),
    selectedAssetsSignedAgainstInventorySelection: selectedCandidates.every((/** @type {any} */ candidate) => candidate.asset.signingSurface?.signedSelectionRoot === candidate.asset.artifactSelectionSurface?.selectedInventoryRoot),
    selectedAssetsSignedAgainstGitHubAppAuth: selectedCandidates.every((/** @type {any} */ candidate) => candidate.asset.signingSurface?.signedGitHubAppAuthRoot === candidate.asset.githubAppAuthSurface?.authPayloadHash),
    selectedAssetsHaveInstallationScopedAuthWhenInventoryBacked: selectedCandidates.every((/** @type {any} */ candidate) => {
      const inventoryBacked = (candidate.asset.artifactSelectionSurface?.selectedInventoryEntryIds || []).length > 0;
      return !inventoryBacked || !!candidate.asset.githubAppAuthSurface?.installationId;
    }),
    inventoryBackedAssetsPreserveSelectionSnapshots: inventoryBackedCandidates.every((/** @type {any} */ candidate) => {
      const selectedIds = candidate.asset.artifactSelectionSurface?.selectedInventoryEntryIds || [];
      const selectedEntries = candidate.asset.artifactSelectionSurface?.selectedInventoryEntries || [];
      return selectedIds.length === selectedEntries.length;
    }),
    installationScopedBindingsMatchRepo: inventoryBackedCandidates.every((/** @type {any} */ candidate) =>
      candidate.asset.githubAppAuthSurface?.repositoryId === candidate.asset.addressingSurface?.repositoryId
    ),
    witnessRefs: {
      principalIds: bindings.map((/** @type {any} */ binding) => binding.principalId),
      decisionIds: authorizationDecisions.map((/** @type {any} */ decision) => `${decision.principalId}:${decision.action}`),
      selectedAssetAddressRefs: selectedCandidates.map((/** @type {any} */ candidate) => ({
        assetId: candidate.assetId,
        repo: candidate.asset.addressingSurface?.repo,
        selectedInventoryEntryIds: candidate.asset.addressingSurface?.selectedInventoryEntryIds || [],
        installationId: candidate.asset.githubAppAuthSurface?.installationId,
        selectionRoot: candidate.asset.artifactSelectionSurface?.selectedInventoryRoot,
        addressingRoot: candidate.asset.addressingSurface?.addressingRoot,
        authPayloadHash: candidate.asset.githubAppAuthSurface?.authPayloadHash,
        signedPayloadHash: candidate.asset.signingSurface?.payloadHash
      }))
    },
    theoremVerdicts,
    artifactBindings: [
      buildArtifactBinding({ artifactPath: '.bitcode/identity-bindings.json', role: 'supporting-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/authorization-decisions.json', role: 'supporting-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) }),
      buildArtifactBinding({ artifactPath: '.bitcode/identity-authorization-proof.json', role: 'primary-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) })
    ],
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      branchName,
      principalIds: bindings.map((/** @type {any} */ binding) => binding.principalId),
      decisionIds: authorizationDecisions.map((/** @type {any} */ decision) => `${decision.principalId}:${decision.action}`),
      selectedAssetAddressRefs: selectedCandidates.map((/** @type {any} */ candidate) => ({
        assetId: candidate.assetId,
        repo: candidate.asset.addressingSurface?.repo,
        selectedInventoryEntryIds: candidate.asset.addressingSurface?.selectedInventoryEntryIds || [],
        installationId: candidate.asset.githubAppAuthSurface?.installationId,
        selectionRoot: candidate.asset.artifactSelectionSurface?.selectedInventoryRoot,
        addressingRoot: candidate.asset.addressingSurface?.addressingRoot,
        authPayloadHash: candidate.asset.githubAppAuthSurface?.authPayloadHash,
        signedPayloadHash: candidate.asset.signingSurface?.payloadHash
      }))
    })
  };
}

/**
 * @param {any} records
 * @returns {any}
 */
function buildSensitiveDataFlowProof(records) {
  const coveredClasses = new Set(records.map((/** @type {any} */ record) => record.dataClass));
  const witnessArtifactPaths = ['.bitcode/sensitive-data-flow.json', '.bitcode/sensitive-data-flow-proof.json'];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'authorization-sensitive-flow.sensitive-flow-replay',
      theoremIds: ['authorization_and_sensitive_flow.classification_closure', 'authorization_and_sensitive_flow.policy_assignment_closure', 'authorization_and_sensitive_flow.no_unauthorized_public_flow'],
      requiredArtifactPaths: ['.bitcode/sensitive-data-flow.json', '.bitcode/sensitive-data-flow-proof.json'],
      instruction: 'Replay sensitive-data-flow classification, policy assignment, and unauthorized-public-flow checks.'
    })
  ];
  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'authorization_and_sensitive_flow.classification_closure',
      passed: records.every((/** @type {any} */ record) => !!record.dataClass),
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['authorization-sensitive-flow.sensitive-flow-replay'],
      failureReasons: records.every((/** @type {any} */ record) => !!record.dataClass) ? [] : ['one or more sensitive-data-flow records are missing a data class']
    }),
    buildTheoremVerdict({
      theoremId: 'authorization_and_sensitive_flow.policy_assignment_closure',
      passed: records.every((/** @type {any} */ record) => !!record.retentionPolicyId && !!record.disclosurePolicyId),
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['authorization-sensitive-flow.sensitive-flow-replay'],
      failureReasons: records.every((/** @type {any} */ record) => !!record.retentionPolicyId && !!record.disclosurePolicyId) ? [] : ['one or more sensitive-data-flow records are missing policy assignments']
    }),
    buildTheoremVerdict({
      theoremId: 'authorization_and_sensitive_flow.no_unauthorized_public_flow',
      passed: records.every((/** @type {any} */ record) => !(PRIVATE_DATA_CLASSES.has(record.dataClass) && record.toSurface === 'public')),
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['authorization-sensitive-flow.sensitive-flow-replay'],
      failureReasons: records.every((/** @type {any} */ record) => !(PRIVATE_DATA_CLASSES.has(record.dataClass) && record.toSurface === 'public')) ? [] : ['a private data class flows to public without authorization']
    })
  ];
  return {
    allPrivateArtifactsClassified: records.every((/** @type {any} */ record) => !!record.dataClass),
    allFlowsRecorded: records.length > 0,
    requiredSensitiveClassesCovered: REQUIRED_SENSITIVE_DATA_CLASSES.every((dataClass) => coveredClasses.has(dataClass)),
    noUnauthorizedPublicDisclosure: records.every((/** @type {any} */ record) => !(PRIVATE_DATA_CLASSES.has(record.dataClass) && record.toSurface === 'public')),
    retentionPoliciesAssigned: records.every((/** @type {any} */ record) => !!record.retentionPolicyId),
    revocationBehaviorDefined: records.every((/** @type {any} */ record) => !!record.disclosurePolicyId),
    witnessRefs: {
      flowRecordIds: records.map((/** @type {any} */ record) => record.recordId),
      coveredDataClasses: [...coveredClasses]
    },
    theoremVerdicts,
    artifactBindings: [
      buildArtifactBinding({ artifactPath: '.bitcode/sensitive-data-flow.json', role: 'primary-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId), requiredForWitness: true, requiredForReplay: true }),
      buildArtifactBinding({ artifactPath: '.bitcode/sensitive-data-flow-proof.json', role: 'primary-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId), requiredForWitness: true, requiredForReplay: true })
    ],
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      flowRecordIds: records.map((/** @type {any} */ record) => record.recordId),
      coveredDataClasses: [...coveredClasses]
    })
  };
}

/**
 * @param {any} verificationReport
 * @param {any} verificationReceiptsArtifact
 * @returns {any}
 */
function buildVerificationDecisionsProof(verificationReport, verificationReceiptsArtifact) {
  const verificationFamilies = summarizeAnnotationStrings(verificationReport?.verificationFamilies || []);
  const memberStageMap = {
    issuance: ['verification.issuance-checks.v15'],
    provenance: ['verification.provenance-checks.v15'],
    sufficiency: ['verification.sufficiency-checks.v15'],
    'issuer-policy': ['verification.issuer-policy-checks.v15'],
    'use-tier-consequence': ['verification.determinisms.v15']
  };
  const memberVerdicts = [
    { memberId: 'issuance', stageIds: memberStageMap.issuance, passed: verificationFamilies.includes('issuance') },
    { memberId: 'provenance', stageIds: memberStageMap.provenance, passed: verificationFamilies.includes('provenance') },
    { memberId: 'sufficiency', stageIds: memberStageMap.sufficiency, passed: verificationFamilies.includes('sufficiency') },
    { memberId: 'issuer-policy', stageIds: memberStageMap['issuer-policy'], passed: verificationFamilies.includes('issuer-policy') },
    { memberId: 'use-tier-consequence', stageIds: memberStageMap['use-tier-consequence'], passed: (verificationReport?.assetVerification || []).every((/** @type {any} */ entry) => !!entry.useTier && !!entry.verificationDecisionSurface?.finalUseTier) }
  ];
  const witnessArtifactPaths = ['.bitcode/verification-report.json', '.bitcode/verification-receipts.json', '.bitcode/verification-decisions-proof.json'];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'verification-decisions.stage-mapping',
      theoremIds: ['verification_decisions.issuance_closure', 'verification_decisions.provenance_closure', 'verification_decisions.sufficiency_closure', 'verification_decisions.issuer_policy_closure'],
      requiredArtifactPaths: ['.bitcode/verification-receipts.json', '.bitcode/verification-report.json'],
      instruction: 'Replay verification decision stages against verification report entries.'
    }),
    buildReplayStep({
      stepId: 'verification-decisions.use-tier-consequence',
      theoremIds: ['verification_decisions.use_tier_consequence_closure', 'verification_decisions.receipt_report_role_closure'],
      requiredArtifactPaths: ['.bitcode/verification-receipts.json', '.bitcode/verification-report.json', '.bitcode/verification-decisions-proof.json'],
      instruction: 'Replay use-tier consequence closure from raw receipts into report-facing rights.'
    })
  ];
  const theoremIds = [
    'verification_decisions.issuance_closure',
    'verification_decisions.provenance_closure',
    'verification_decisions.sufficiency_closure',
    'verification_decisions.issuer_policy_closure',
    'verification_decisions.use_tier_consequence_closure',
    'verification_decisions.receipt_report_role_closure',
    'verification_decisions.witness_replay_closure'
  ];
  const artifactBindings = [
    buildArtifactBinding({ artifactPath: '.bitcode/verification-report.json', role: 'report', theoremIds }),
    buildArtifactBinding({ artifactPath: '.bitcode/verification-receipts.json', role: 'receipt-log', theoremIds }),
    buildArtifactBinding({ artifactPath: '.bitcode/verification-decisions-proof.json', role: 'primary-proof', theoremIds })
  ];
  const proofClosure = computeProofClosure({
    artifactBindings,
    witnessArtifactPaths,
    replayArtifactPaths: replayArtifacts,
    replaySteps,
    theoremIds,
    excludeTheoremIds: ['verification_decisions.witness_replay_closure']
  });
  const theoremVerdicts = [
    buildTheoremVerdict({ theoremId: 'verification_decisions.issuance_closure', passed: verificationFamilies.includes('issuance'), witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['verification-decisions.stage-mapping'] }),
    buildTheoremVerdict({ theoremId: 'verification_decisions.provenance_closure', passed: verificationFamilies.includes('provenance'), witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['verification-decisions.stage-mapping'] }),
    buildTheoremVerdict({ theoremId: 'verification_decisions.sufficiency_closure', passed: verificationFamilies.includes('sufficiency'), witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['verification-decisions.stage-mapping'] }),
    buildTheoremVerdict({ theoremId: 'verification_decisions.issuer_policy_closure', passed: verificationFamilies.includes('issuer-policy'), witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['verification-decisions.stage-mapping'] }),
    buildTheoremVerdict({
      theoremId: 'verification_decisions.use_tier_consequence_closure',
      passed: (verificationReport?.assetVerification || []).every((/** @type {any} */ entry) => !!entry.useTier && !!entry.verificationDecisionSurface?.finalUseTier),
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['verification-decisions.use-tier-consequence'],
      failureReasons: (verificationReport?.assetVerification || []).every((/** @type {any} */ entry) => !!entry.useTier && !!entry.verificationDecisionSurface?.finalUseTier) ? [] : ['verification report undernames use-tier consequence closure']
    }),
    buildTheoremVerdict({
      theoremId: 'verification_decisions.receipt_report_role_closure',
      passed: (verificationReceiptsArtifact?.verificationReceipts || []).length >= (verificationReport?.assetVerification || []).length,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['verification-decisions.use-tier-consequence'],
      failureReasons: (verificationReceiptsArtifact?.verificationReceipts || []).length >= (verificationReport?.assetVerification || []).length ? [] : ['verification receipt/report surfaces are incomplete or misaligned']
    }),
    buildTheoremVerdict({
      theoremId: 'verification_decisions.witness_replay_closure',
      passed: proofClosure.allClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: replaySteps.map((entry) => entry.stepId),
      failureReasons: proofClosure.allClosed ? [] : ['verification-decisions witness/replay closure is incomplete']
    })
  ];
  return {
    proofFamily: 'verification-decisions',
    coveredDecisionFamilies: verificationFamilies,
    memberStageMap,
    memberVerdicts,
    theoremVerdicts,
    artifactBindings,
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    witnessClosureClosed: proofClosure.witnessBindingsClosed,
    replayClosureClosed: proofClosure.replayBindingsClosed && proofClosure.replayStepArtifactCoverageClosed && proofClosure.theoremReplayCoverageClosed,
    allCasesPassed: memberVerdicts.every((entry) => entry.passed),
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      verificationFamilies,
      memberStageMap,
      verificationReceiptCount: verificationReceiptsArtifact?.verificationReceipts?.length || 0,
      assetCount: verificationReport?.assetVerification?.length || 0
    })
  };
}

/**
 * @param {any} selectionConsistencyProof
 * @param {any} materializationProof
 * @param {any} materializationExclusions
 * @param {any} materializationVisibilityProof
 * @returns {any}
 */
function buildSelectionAndMaterializationProof(selectionConsistencyProof, materializationProof, materializationExclusions, materializationVisibilityProof) {
  const witnessArtifactPaths = [
    '.bitcode/asset-pack.lock.json',
    '.bitcode/selected-source-material.json',
    '.bitcode/materialization-exclusions.json',
    '.bitcode/materialization-visibility-proof.json',
    '.bitcode/selection-consistency-proof.json',
    '.bitcode/materialization-proof.json',
    '.bitcode/selection-and-materialization-proof.json'
  ];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'selection-and-materialization.selected-set',
      theoremIds: ['selection_and_materialization.selected_asset_closure', 'selection_and_materialization.lock_closure', 'selection_and_materialization.materialized_source_closure', 'selection_and_materialization.selection_consistency_closure'],
      requiredArtifactPaths: ['.bitcode/asset-pack.lock.json', '.bitcode/selected-source-material.json', '.bitcode/selection-consistency-proof.json', '.bitcode/materialization-proof.json'],
      instruction: 'Replay selected asset consistency across asset pack, selection consistency, and materialization proof.'
    }),
    buildReplayStep({
      stepId: 'selection-and-materialization.visibility',
      theoremIds: ['selection_and_materialization.visibility_closure', 'selection_and_materialization.exclusion_closure'],
      requiredArtifactPaths: ['.bitcode/materialization-exclusions.json', '.bitcode/materialization-visibility-proof.json'],
      instruction: 'Replay exclusions and visibility closure for materialized source.'
    })
  ];
  const theoremIds = [
    'selection_and_materialization.selected_asset_closure',
    'selection_and_materialization.lock_closure',
    'selection_and_materialization.materialized_source_closure',
    'selection_and_materialization.exclusion_closure',
    'selection_and_materialization.visibility_closure',
    'selection_and_materialization.selection_consistency_closure',
    'selection_and_materialization.materialization_proof_closure'
  ];
  const artifactBindings = witnessArtifactPaths.map((artifactPath) =>
    buildArtifactBinding({
      artifactPath,
      role: artifactPath.endsWith('-proof.json') ? 'primary-proof' : 'supporting-proof',
      theoremIds
    })
  );
  const proofClosure = computeProofClosure({
    artifactBindings,
    witnessArtifactPaths,
    replayArtifactPaths: replayArtifacts,
    replaySteps,
    theoremIds,
    excludeTheoremIds: ['selection_and_materialization.materialization_proof_closure']
  });
  const theoremVerdicts = [
    buildTheoremVerdict({ theoremId: 'selection_and_materialization.selected_asset_closure', passed: selectionConsistencyProof?.assetPackSelectionsMatchSelectedCandidates === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['selection-and-materialization.selected-set'] }),
    buildTheoremVerdict({ theoremId: 'selection_and_materialization.lock_closure', passed: selectionConsistencyProof?.materializedSourceUnitsClosedOverLock === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['selection-and-materialization.selected-set'] }),
    buildTheoremVerdict({ theoremId: 'selection_and_materialization.materialized_source_closure', passed: materializationProof?.allSelectedAssetsMaterialized === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['selection-and-materialization.selected-set'] }),
    buildTheoremVerdict({ theoremId: 'selection_and_materialization.exclusion_closure', passed: materializationProof?.allExclusionsExplained === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['selection-and-materialization.visibility'] }),
    buildTheoremVerdict({ theoremId: 'selection_and_materialization.visibility_closure', passed: materializationVisibilityProof?.noPrivateArtifactsLeakIntoPublicProjection === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['selection-and-materialization.visibility'] }),
    buildTheoremVerdict({ theoremId: 'selection_and_materialization.selection_consistency_closure', passed: selectionConsistencyProof?.settlementParticipantsSubsetOfSelectedAssets === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['selection-and-materialization.selected-set'] }),
    buildTheoremVerdict({
      theoremId: 'selection_and_materialization.materialization_proof_closure',
      passed: proofClosure.allClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: replaySteps.map((entry) => entry.stepId),
      failureReasons: proofClosure.allClosed ? [] : ['selection-and-materialization witness/replay closure is incomplete']
    })
  ];
  return {
    proofFamily: 'selection-and-materialization',
    memberVerdicts: [
      { memberId: 'selected-assets', passed: selectionConsistencyProof?.assetPackSelectionsMatchSelectedCandidates === true },
      { memberId: 'locked-units', passed: selectionConsistencyProof?.materializedSourceUnitsClosedOverLock === true },
      { memberId: 'materialized-source', passed: materializationProof?.allSelectedAssetsMaterialized === true },
      { memberId: 'exclusions', passed: materializationProof?.allExclusionsExplained === true && (materializationExclusions?.exclusions || []).every((/** @type {any} */ entry) => !!entry.exclusionReason) },
      { memberId: 'visibility-rules', passed: materializationVisibilityProof?.noPrivateArtifactsLeakIntoPublicProjection === true }
    ],
    theoremVerdicts,
    artifactBindings,
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    witnessClosureClosed: proofClosure.witnessBindingsClosed,
    replayClosureClosed: proofClosure.replayBindingsClosed && proofClosure.replayStepArtifactCoverageClosed && proofClosure.theoremReplayCoverageClosed,
    allCasesPassed: (selectionConsistencyProof?.assetPackSelectionsMatchSelectedCandidates === true) && (materializationProof?.allSelectedAssetsMaterialized === true),
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      selectionConsistencyProof: selectionConsistencyProof?.proofHash,
      materializationProof: materializationProof?.proofHash,
      materializationExclusions: materializationExclusions?.proofHash,
      materializationVisibilityProof: materializationVisibilityProof?.proofHash
    })
  };
}

/**
 * @param {any} identityAuthorizationProof
 * @param {any} sensitiveDataFlowProof
 * @returns {any}
 */
function buildAuthorizationAndSensitiveFlowProof(identityAuthorizationProof, sensitiveDataFlowProof) {
  const witnessArtifactPaths = [
    '.bitcode/identity-bindings.json',
    '.bitcode/authorization-decisions.json',
    '.bitcode/sensitive-data-flow.json',
    '.bitcode/identity-authorization-proof.json',
    '.bitcode/sensitive-data-flow-proof.json',
    '.bitcode/authorization-and-sensitive-flow-proof.json'
  ];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'authorization-sensitive-flow.identity',
      theoremIds: ['authorization_and_sensitive_flow.principal_authority_totality', 'authorization_and_sensitive_flow.authorization_decision_closure'],
      requiredArtifactPaths: ['.bitcode/identity-bindings.json', '.bitcode/authorization-decisions.json', '.bitcode/identity-authorization-proof.json'],
      instruction: 'Replay principal binding and authorization-decision closure.'
    }),
    buildReplayStep({
      stepId: 'authorization-sensitive-flow.flows',
      theoremIds: ['authorization_and_sensitive_flow.classification_closure', 'authorization_and_sensitive_flow.policy_assignment_closure', 'authorization_and_sensitive_flow.no_unauthorized_public_flow'],
      requiredArtifactPaths: ['.bitcode/sensitive-data-flow.json', '.bitcode/sensitive-data-flow-proof.json'],
      instruction: 'Replay sensitive-data classification, policy assignment, and no-unauthorized-public-flow closure.'
    })
  ];
  const theoremIds = [
    'authorization_and_sensitive_flow.principal_authority_totality',
    'authorization_and_sensitive_flow.authorization_decision_closure',
    ...((sensitiveDataFlowProof?.theoremVerdicts || []).map((/** @type {any} */ entry) => entry.theoremId)),
    'authorization_and_sensitive_flow.witness_replay_closure'
  ];
  const artifactBindings = witnessArtifactPaths.map((artifactPath) =>
    buildArtifactBinding({
      artifactPath,
      role: artifactPath.endsWith('-proof.json') ? 'primary-proof' : 'supporting-proof',
      theoremIds
    })
  );
  const proofClosure = computeProofClosure({
    artifactBindings,
    witnessArtifactPaths,
    replayArtifactPaths: replayArtifacts,
    replaySteps,
    theoremIds,
    excludeTheoremIds: ['authorization_and_sensitive_flow.witness_replay_closure']
  });
  const theoremVerdicts = [
    buildTheoremVerdict({ theoremId: 'authorization_and_sensitive_flow.principal_authority_totality', passed: identityAuthorizationProof?.allAccessBoundToKnownPrincipals === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['authorization-sensitive-flow.identity'] }),
    buildTheoremVerdict({ theoremId: 'authorization_and_sensitive_flow.authorization_decision_closure', passed: identityAuthorizationProof?.allStateChangingActionsAuthorized === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['authorization-sensitive-flow.identity'] }),
    ...(sensitiveDataFlowProof?.theoremVerdicts || []).map((/** @type {any} */ entry) => ({
      ...entry,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['authorization-sensitive-flow.flows']
    })),
    buildTheoremVerdict({
      theoremId: 'authorization_and_sensitive_flow.witness_replay_closure',
      passed: proofClosure.allClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: replaySteps.map((entry) => entry.stepId),
      failureReasons: proofClosure.allClosed ? [] : ['authorization-and-sensitive-flow witness/replay closure is incomplete']
    })
  ];
  return {
    proofFamily: 'authorization-and-sensitive-flow',
    memberVerdicts: [
      { memberId: 'principals', passed: identityAuthorizationProof?.allAccessBoundToKnownPrincipals === true },
      { memberId: 'authorization-decisions', passed: identityAuthorizationProof?.allStateChangingActionsAuthorized === true },
      { memberId: 'confidentiality-classes', passed: sensitiveDataFlowProof?.requiredSensitiveClassesCovered === true },
      { memberId: 'retention-disclosure-rules', passed: sensitiveDataFlowProof?.retentionPoliciesAssigned === true && sensitiveDataFlowProof?.revocationBehaviorDefined === true },
      { memberId: 'sensitive-data-flows', passed: sensitiveDataFlowProof?.allFlowsRecorded === true && sensitiveDataFlowProof?.noUnauthorizedPublicDisclosure === true }
    ],
    theoremVerdicts,
    artifactBindings,
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    witnessClosureClosed: proofClosure.witnessBindingsClosed,
    replayClosureClosed: proofClosure.replayBindingsClosed && proofClosure.replayStepArtifactCoverageClosed && proofClosure.theoremReplayCoverageClosed,
    allCasesPassed: identityAuthorizationProof?.allStateChangingActionsAuthorized === true && sensitiveDataFlowProof?.noUnauthorizedPublicDisclosure === true,
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      identityAuthorizationProof: identityAuthorizationProof?.proofHash,
      sensitiveDataFlowProof: sensitiveDataFlowProof?.proofHash
    })
  };
}

/**
 * @param {any} selectedCandidates
 * @returns {any}
 */
function buildAssetMeasurementProofs(selectedCandidates) {
  return selectedCandidates.map((/** @type {any} */ candidate) => ({
    assetId: candidate.assetId,
    contentRoot: candidate.asset.contentRoot,
    unitRefs: candidate.asset.contentUnits.map((/** @type {any} */ unit) => unit.unitId),
    measurementsTraceableToUnits: candidate.asset.contentUnits.length > 0,
    measurementReplayable: (candidate.asset.assetMeasurement?.provenance || []).length > 0,
    measurementPolicySatisfied: !!candidate.asset.assetMeasurement && (candidate.asset.assetMeasurement.provenance || []).length > 0,
    witnessRefs: {
      receiptRefs: (candidate.asset.assetMeasurement?.staticExecutionReceipts || []).map((/** @type {any} */ receipt) => receipt.receiptId),
      unitHashes: candidate.asset.contentUnits.map((/** @type {any} */ unit) => unit.unitHash)
    }
  }));
}

/**
 * @param {any} __0
 * @returns {any}
 */
export function buildProofContract({
  readId,
  assetPackId,
  branchName,
  selectedCandidates,
  authorizationDecisions,
  sensitiveDataFlowRecords,
  systemProofBundleSummary = null,
  proofWitnessManifestSummary = null,
  v23BitcoinEnabled = false,
  v24ExternalEnabled = false,
  externalExecutionLedger = null,
  externalReconciliationLog = null
}) {
  const expectedProofFamilies = [
    'inference-synthesis',
    'prompt-completeness',
    'static-code-analysis',
    'verification-decisions',
    'selection-and-materialization',
    'authorization-and-sensitive-flow',
    'settlement-source-to-shares',
    'disclosure-boundary',
    'proof-contract',
    ...(v23BitcoinEnabled ? ['bitcoin-audit-anchor', 'bitcoin-settlement-interface'] : [])
  ];
  const evidenceChain = [
    { stage: 'read-measurement-and-review', artifactRefs: ['.bitcode/read.json', '.bitcode/read-measurement.json', '.bitcode/read-review.json', '.bitcode/benchmark-target.json'], claim: 'The engineering read is derived fail-closed from canonical benchmark evidence and accepted before any fit search begins.' },
    { stage: 'ranking-and-verification', artifactRefs: ['.bitcode/match-report.json', '.bitcode/verification-report.json', '.bitcode/prompt-surfaces.json'], claim: 'Candidate ranking, prompt lineage, and verification tiers are all inspectable.' },
    { stage: 'identity-and-boundaries', artifactRefs: ['.bitcode/identity-bindings.json', '.bitcode/authorization-decisions.json', '.bitcode/github-boundary.json', '.bitcode/external-boundary-manifest.json'], claim: 'Identity, signer, auth, and external boundaries are distinct and bound.' },
    { stage: 'materialization', artifactRefs: ['.bitcode/asset-pack.lock.json', '.bitcode/selected-source-material.json', '.bitcode/materialization-visibility-proof.json', BRANCH_READ_PATH], claim: 'Only allowed assets and units are materialized into the private remediation branch.' },
    { stage: 'settlement-and-proof', artifactRefs: ['.bitcode/settlement-preview.json', '.bitcode/source-to-shares.json', '.bitcode/settlement-participation.json', '.bitcode/accounting-precision-report.json', '.bitcode/settlement-proof.json', '.bitcode/journal-diff.json', '.bitcode/system-proof-bundle.json'], claim: 'Settlement and proof closure are exact-accounting, theorem-checked, and replayable from source contribution to journal entry.' },
    ...(v23BitcoinEnabled
      ? [{
          stage: 'deployment-and-anchor',
          artifactRefs: ['.bitcode/compute-reality-manifest.json', '.bitcode/storage-reality-manifest.json', '.bitcode/bitcoin-settlement-intent.json', '.bitcode/bitcoin-settlement-observation.json', '.bitcode/bitcoin-commitment-manifest.json', '.bitcode/bitcoin-anchor.json'],
          claim: `Deployment-facing compute, storage, spend, and audit-anchor realities are explicit, typed, and bound to the same ${ACTIVE_PROJECT_LABEL} proof and settlement closure.`
        }]
      : []),
    ...(v24ExternalEnabled
      ? [{
          stage: 'external-execution-continuity',
          artifactRefs: [
            '.bitcode/external-environment-profile.json',
            '.bitcode/external-telemetry-summary.json',
            '.bitcode/external-execution-ledger.json',
            '.bitcode/external-reconciliation-log.json',
            '.bitcode/external-realization-proof.json'
          ],
          claim: 'Realized external execution remains mode-isolated, continuity-tracked, and fail-closed across consecutive observed runs.'
        }]
      : [])
  ];
  const theoremChecks = [
    'selected assets respect branch-mode use tiers',
    'all state-changing actions are authorized',
    'no unauthorized public disclosure occurs',
    'source-to-shares clipping and tie-breaks are replayable',
    'debits equal credits exactly',
    'asset-pack lock binds settlement refs closed',
    ...(v23BitcoinEnabled ? [`bitcoin-facing spend and anchor surfaces bind back to the same ${ACTIVE_PROJECT_LABEL} proof and settlement identifiers`] : []),
    ...(v24ExternalEnabled ? ['external execution continuity remains mode-isolated and replayable across consecutive runs'] : [])
  ];
  const witnessArtifactPaths = ['.bitcode/proof-contract.json', '.bitcode/system-proof-bundle.json', '.bitcode/proof-witness-manifest.json'];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'proof-contract.contract-materialization',
      theoremIds: ['proof_contract.contract_materialization'],
      requiredArtifactPaths: ['.bitcode/proof-contract.json'],
      instruction: 'Replay proof-contract materialization from read, asset pack, and branch identity.'
    }),
    buildReplayStep({
      stepId: 'proof-contract.evidence-chain',
      theoremIds: ['proof_contract.evidence_chain_closure', 'proof_contract.theorem_check_binding'],
      requiredArtifactPaths: [
        '.bitcode/proof-contract.json',
        '.bitcode/system-proof-bundle.json',
        ...(v24ExternalEnabled
          ? [
              '.bitcode/external-environment-profile.json',
              '.bitcode/external-telemetry-summary.json',
              '.bitcode/external-execution-ledger.json',
              '.bitcode/external-reconciliation-log.json',
              '.bitcode/external-realization-proof.json'
            ]
          : [])
      ],
      instruction: 'Replay evidence-chain stages and theorem-binding closure.'
    }),
    buildReplayStep({
      stepId: 'proof-contract.bundle-witness',
      theoremIds: ['proof_contract.bundle_coherence', 'proof_contract.witness_manifest_coherence', 'proof_contract.replay_closure'],
      requiredArtifactPaths: ['.bitcode/system-proof-bundle.json', '.bitcode/proof-witness-manifest.json', '.bitcode/proof-contract.json'],
      instruction: 'Replay bundle coherence and witness-manifest coherence against the proof contract.'
    })
  ];
  const theoremIds = [
    'proof_contract.contract_materialization',
    'proof_contract.evidence_chain_closure',
    'proof_contract.theorem_check_binding',
    'proof_contract.bundle_coherence',
    'proof_contract.witness_manifest_coherence',
    'proof_contract.replay_closure'
  ];
  const artifactBindings = [
    buildArtifactBinding({ artifactPath: '.bitcode/proof-contract.json', role: 'primary-proof', theoremIds }),
    buildArtifactBinding({ artifactPath: '.bitcode/system-proof-bundle.json', role: 'bundle', theoremIds: ['proof_contract.bundle_coherence', 'proof_contract.replay_closure'] }),
    buildArtifactBinding({ artifactPath: '.bitcode/proof-witness-manifest.json', role: 'witness-manifest', theoremIds: ['proof_contract.witness_manifest_coherence', 'proof_contract.replay_closure'] })
  ];
  const contractMaterializationClosed = !!readId && !!assetPackId && !!branchName;
  const evidenceChainClosed = evidenceChain.length === (v23BitcoinEnabled ? 6 : 5) && evidenceChain.every((entry) => (entry.artifactRefs || []).length > 0 && !!entry.claim);
  const theoremCheckBindingClosed = theoremChecks.length >= 6
    && artifactBindings.some((binding) => binding.artifactPath === '.bitcode/proof-contract.json' && binding.role === 'primary-proof')
    && artifactBindings.some((binding) => binding.artifactPath === '.bitcode/system-proof-bundle.json' && binding.role === 'bundle')
    && artifactBindings.some((binding) => binding.artifactPath === '.bitcode/proof-witness-manifest.json' && binding.role === 'witness-manifest');
  const bundleProofFamilies = summarizeAnnotationStrings(systemProofBundleSummary?.proofFamilies || []);
  const witnessProofFamilies = summarizeAnnotationStrings(proofWitnessManifestSummary?.proofFamilies || []);
  const bundleCoherenceClosed = !!systemProofBundleSummary
    && expectedProofFamilies.every((proofFamily) => bundleProofFamilies.includes(proofFamily))
    && Number(systemProofBundleSummary?.replayArtifactCount || 0) > 0
    && Number(systemProofBundleSummary?.requiredArtifactCount || 0) > 0;
  const witnessManifestCoherenceClosed = !!proofWitnessManifestSummary
    && expectedProofFamilies.every((proofFamily) => witnessProofFamilies.includes(proofFamily))
    && proofWitnessManifestSummary?.allProofRelevantArtifactsDigested === true
    && Number(proofWitnessManifestSummary?.digestedArtifactCount || 0) > 0;
  const proofClosure = computeProofClosure({
    artifactBindings,
    witnessArtifactPaths,
    replayArtifactPaths: replayArtifacts,
    replaySteps,
    theoremIds,
    excludeTheoremIds: ['proof_contract.replay_closure']
  });
  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'proof_contract.contract_materialization',
      passed: contractMaterializationClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['proof-contract.contract-materialization'],
      failureReasons: contractMaterializationClosed ? [] : ['proof contract identity fields are incomplete']
    }),
    buildTheoremVerdict({
      theoremId: 'proof_contract.evidence_chain_closure',
      passed: evidenceChainClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['proof-contract.evidence-chain'],
      failureReasons: evidenceChainClosed ? [] : ['proof contract evidence chain is incomplete']
    }),
    buildTheoremVerdict({
      theoremId: 'proof_contract.theorem_check_binding',
      passed: theoremCheckBindingClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['proof-contract.evidence-chain'],
      failureReasons: theoremCheckBindingClosed ? [] : ['proof contract theorem checks are not bound to the required artifacts']
    }),
    buildTheoremVerdict({
      theoremId: 'proof_contract.bundle_coherence',
      passed: bundleCoherenceClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['proof-contract.bundle-witness'],
      failureReasons: bundleCoherenceClosed ? [] : ['system proof bundle summary is not coherent with the proof contract']
    }),
    buildTheoremVerdict({
      theoremId: 'proof_contract.witness_manifest_coherence',
      passed: witnessManifestCoherenceClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['proof-contract.bundle-witness'],
      failureReasons: witnessManifestCoherenceClosed ? [] : ['proof witness manifest summary is not coherent with the proof contract']
    }),
    buildTheoremVerdict({
      theoremId: 'proof_contract.replay_closure',
      passed: proofClosure.allClosed && bundleCoherenceClosed && witnessManifestCoherenceClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['proof-contract.bundle-witness'],
      failureReasons: (proofClosure.allClosed && bundleCoherenceClosed && witnessManifestCoherenceClosed) ? [] : ['proof-contract replay closure is incomplete']
    })
  ];
  return {
    contractId: `proof_contract_${sha256(`${readId}:${assetPackId}:${branchName}`).slice(0, 12)}` ,
    readId,
    assetPackId,
    branchName,
    evidenceChain,
    theoremChecks,
    theoremVerdicts,
    artifactBindings,
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    memberVerdicts: [
      { memberId: 'proof-contract', passed: contractMaterializationClosed },
      { memberId: 'evidence-chain', passed: evidenceChainClosed },
      { memberId: 'theorem-checks', passed: theoremCheckBindingClosed },
      { memberId: 'system-proof-bundle', passed: bundleCoherenceClosed },
      { memberId: 'witness-manifest-closure', passed: witnessManifestCoherenceClosed }
    ],
    witnessClosureClosed: proofClosure.witnessBindingsClosed,
    replayClosureClosed: proofClosure.replayBindingsClosed && proofClosure.replayStepArtifactCoverageClosed && proofClosure.theoremReplayCoverageClosed,
    artifactBindingSummary: {
      selectedAssets: selectedCandidates.map((/** @type {any} */ candidate) => ({ assetId: candidate.assetId, contentRoot: candidate.asset.contentRoot, attestationHash: candidate.asset.attestations[0]?.attestationHash })),
      authorizationDecisionCount: authorizationDecisions.length,
      sensitiveFlowCount: sensitiveDataFlowRecords.length,
      externalExecutionLedgerSummary: externalExecutionLedger
        ? {
            ledgerId: externalExecutionLedger.ledgerId,
            liveObservedInterfaceCount: externalExecutionLedger.liveObservedInterfaceCount
          }
        : null,
      externalReconciliationLogSummary: externalReconciliationLog
        ? {
            logId: externalReconciliationLog.logId,
            entryCount: externalReconciliationLog.entryCount
          }
        : null,
      systemProofBundleSummary,
      proofWitnessManifestSummary
    },
    proofHash: stableHashObject({
      readId,
      assetPackId,
      branchName,
      theoremChecks,
      evidenceChainLength: evidenceChain.length,
      selectedAssetCount: selectedCandidates.length,
      v24ExternalEnabled,
      externalExecutionLedgerRef: externalExecutionLedger?.ledgerId || null,
      externalReconciliationLogRef: externalReconciliationLog?.logId || null,
      systemProofBundleSummary,
      proofWitnessManifestSummary
    })
  };
}

/**
 * @param {any} sourceToSharesArtifact
 * @param {any} settlementParticipationArtifact
 * @param {any} settlementPreview
 * @param {any} accountingPrecisionReport
 * @param {any} journalCompletenessProof
 * @param {any} settlementProof
 * @returns {any}
 */
function buildSettlementSourceToSharesProof(sourceToSharesArtifact, settlementParticipationArtifact, settlementPreview, accountingPrecisionReport, journalCompletenessProof, settlementProof) {
  const witnessArtifactPaths = [
    '.bitcode/source-to-shares.json',
    '.bitcode/settlement-participation.json',
    '.bitcode/settlement-preview.json',
    '.bitcode/accounting-precision-report.json',
    '.bitcode/journal-diff.json',
    '.bitcode/journal-completeness-proof.json',
    '.bitcode/settlement-proof.json',
    '.bitcode/settlement-source-to-shares-proof.json'
  ];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'settlement-source-to-shares.contribution-allocation',
      theoremIds: ['settlement_source_to_shares.contribution_totality', 'settlement_source_to_shares.clipping_determinism', 'settlement_source_to_shares.normalization_exactness', 'settlement_source_to_shares.participation_totality', 'settlement_source_to_shares.allocation_conservation', 'settlement_source_to_shares.quantized_fit_quality_receipting'],
      requiredArtifactPaths: ['.bitcode/source-to-shares.json', '.bitcode/settlement-participation.json', '.bitcode/settlement-preview.json', '.bitcode/accounting-precision-report.json'],
      instruction: 'Replay contribution, clipping, normalization, participation, quantized fit-quality presentation, receipting, and exact allocation closure.'
    }),
    buildReplayStep({
      stepId: 'settlement-source-to-shares.journal-theorem',
      theoremIds: ['settlement_source_to_shares.journal_completeness', 'settlement_source_to_shares.settlement_theorem_integrity'],
      requiredArtifactPaths: ['.bitcode/journal-diff.json', '.bitcode/journal-completeness-proof.json', '.bitcode/settlement-proof.json'],
      instruction: 'Replay journal completeness and theorem-bearing settlement closure separately.'
    })
  ];
  const fitQualityObjectiveId = sourceToSharesArtifact?.quantizedFitQualities?.objectiveContractId;
  const previewObjectiveId = settlementPreview?.presentFitForSettlementReview?.objectiveContractId || settlementPreview?.quantizedObjectiveContractId;
  const receiptObjectiveIds = (settlementPreview?.receipts || []).map((/** @type {any} */ receipt) => receipt.quantizedObjectiveContractId).filter(Boolean);
  const theoremVerdicts = [
    buildTheoremVerdict({ theoremId: 'settlement_source_to_shares.contribution_totality', passed: (sourceToSharesArtifact?.sourceContributionEntries || []).length > 0, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['settlement-source-to-shares.contribution-allocation'] }),
    buildTheoremVerdict({ theoremId: 'settlement_source_to_shares.clipping_determinism', passed: (sourceToSharesArtifact?.sourceContributionEntries || []).every((/** @type {any} */ entry) => !!entry.clippingReceiptId || entry.clipped !== true), witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['settlement-source-to-shares.contribution-allocation'] }),
    buildTheoremVerdict({ theoremId: 'settlement_source_to_shares.normalization_exactness', passed: settlementProof?.theoremChecks?.rawSharesNormalized === true && settlementProof?.theoremChecks?.settledSharesNormalized === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['settlement-source-to-shares.contribution-allocation'] }),
    buildTheoremVerdict({ theoremId: 'settlement_source_to_shares.participation_totality', passed: (settlementParticipationArtifact?.records || []).filter((/** @type {any} */ entry) => entry.settlementParticipating).length === (settlementParticipationArtifact?.settlementParticipatingCount || 0), witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['settlement-source-to-shares.contribution-allocation'] }),
    buildTheoremVerdict({ theoremId: 'settlement_source_to_shares.allocation_conservation', passed: settlementProof?.theoremChecks?.allocationConserved === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['settlement-source-to-shares.contribution-allocation'] }),
    buildTheoremVerdict({ theoremId: 'settlement_source_to_shares.quantized_fit_quality_receipting', passed: !!fitQualityObjectiveId && fitQualityObjectiveId === previewObjectiveId && receiptObjectiveIds.includes(fitQualityObjectiveId), witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['settlement-source-to-shares.contribution-allocation'] }),
    buildTheoremVerdict({ theoremId: 'settlement_source_to_shares.journal_completeness', passed: journalCompletenessProof?.receiptRefsClosed === true && journalCompletenessProof?.afterBalancesRecomputeExactly === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['settlement-source-to-shares.journal-theorem'] }),
    buildTheoremVerdict({ theoremId: 'settlement_source_to_shares.settlement_theorem_integrity', passed: aggregateTheoremVerdicts(Object.entries(settlementProof?.theoremChecks || {}).map(([theoremId, passed]) => ({ theoremId, passed }))), witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['settlement-source-to-shares.journal-theorem'] })
  ];
  return {
    proofFamily: 'settlement-source-to-shares',
    memberVerdicts: [
      { memberId: 'contribution', passed: (sourceToSharesArtifact?.sourceContributionEntries || []).length > 0 },
      { memberId: 'clipping', passed: Boolean(theoremVerdicts[1]?.passed) },
      { memberId: 'normalization', passed: Boolean(theoremVerdicts[2]?.passed) },
      { memberId: 'participation', passed: Boolean(theoremVerdicts[3]?.passed) },
      { memberId: 'allocation', passed: Boolean(theoremVerdicts[4]?.passed) },
      { memberId: 'quantized-fit-quality-receipting', passed: Boolean(theoremVerdicts[5]?.passed) },
      { memberId: 'journal', passed: Boolean(theoremVerdicts[6]?.passed) },
      { memberId: 'settlement-proof', passed: Boolean(theoremVerdicts[7]?.passed) }
    ],
    theoremVerdicts,
    artifactBindings: witnessArtifactPaths.map((artifactPath) => buildArtifactBinding({ artifactPath, role: artifactPath.endsWith('-proof.json') ? 'primary-proof' : 'supporting-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId) })),
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    allCasesPassed: theoremVerdicts.every((entry) => entry.passed),
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      sourceToSharesArtifact: sourceToSharesArtifact?.proofHash,
      settlementParticipationArtifact: settlementParticipationArtifact?.proofHash,
      settlementPreview: stableHashObject(settlementPreview || {}),
      accountingPrecisionReport: accountingPrecisionReport?.reportHash,
      journalCompletenessProof: journalCompletenessProof?.proofHash,
      settlementProof: settlementProof?.proofHash
    })
  };
}

/**
 * @param {any} projectionPolicy
 * @param {any} boundedPublicProof
 * @param {any} redactionProof
 * @param {any} disclosureProof
 * @returns {any}
 */
function buildDisclosureBoundaryProof(projectionPolicy, boundedPublicProof, redactionProof, disclosureProof) {
  const witnessArtifactPaths = [
    '.bitcode/projection-policy.json',
    '.bitcode/bounded-public-proof.json',
    '.bitcode/redaction-proof.json',
    '.bitcode/disclosure-proof.json',
    '.bitcode/disclosure-boundary-proof.json'
  ];
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'disclosure-boundary.policy-bounded-public',
      theoremIds: ['disclosure_boundary.projection_policy_closure', 'disclosure_boundary.bounded_public_metadata_only'],
      requiredArtifactPaths: ['.bitcode/projection-policy.json', '.bitcode/bounded-public-proof.json'],
      instruction: 'Replay projection policy and bounded-public closure.'
    }),
    buildReplayStep({
      stepId: 'disclosure-boundary.redaction-disclosure',
      theoremIds: ['disclosure_boundary.redaction_alignment', 'disclosure_boundary.disclosure_verdict_alignment', 'disclosure_boundary.witness_replay_closure'],
      requiredArtifactPaths: ['.bitcode/redaction-proof.json', '.bitcode/disclosure-proof.json', '.bitcode/disclosure-boundary-proof.json'],
      instruction: 'Replay redaction and disclosure alignment against policy and bounded-public truth.'
    })
  ];
  const theoremIds = [
    'disclosure_boundary.projection_policy_closure',
    'disclosure_boundary.bounded_public_metadata_only',
    'disclosure_boundary.redaction_alignment',
    'disclosure_boundary.disclosure_verdict_alignment',
    'disclosure_boundary.witness_replay_closure'
  ];
  const artifactBindings = witnessArtifactPaths.map((artifactPath) =>
    buildArtifactBinding({
      artifactPath,
      role: artifactPath.endsWith('-proof.json') ? 'primary-proof' : 'supporting-proof',
      theoremIds
    })
  );
  const proofClosure = computeProofClosure({
    artifactBindings,
    witnessArtifactPaths,
    replayArtifactPaths: replayArtifacts,
    replaySteps,
    theoremIds,
    excludeTheoremIds: ['disclosure_boundary.witness_replay_closure']
  });
  const theoremVerdicts = [
    buildTheoremVerdict({ theoremId: 'disclosure_boundary.projection_policy_closure', passed: (projectionPolicy?.artifactRules || []).length > 0, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['disclosure-boundary.policy-bounded-public'] }),
    buildTheoremVerdict({
      theoremId: 'disclosure_boundary.bounded_public_metadata_only',
      passed: boundedPublicProof?.promptCompletenessSummary?.allContractsComplete === true && boundedPublicProof?.staticMeasurementSummary?.allReceiptRefsResolve === true,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['disclosure-boundary.policy-bounded-public']
    }),
    buildTheoremVerdict({ theoremId: 'disclosure_boundary.redaction_alignment', passed: !!redactionProof?.boundedPublicProofHash, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['disclosure-boundary.redaction-disclosure'] }),
    buildTheoremVerdict({ theoremId: 'disclosure_boundary.disclosure_verdict_alignment', passed: disclosureProof?.publicDisclosureOnlyUsesBoundedMetadata === true, witnessArtifactPaths, replayArtifactPaths: replayArtifacts, replayStepIds: ['disclosure-boundary.redaction-disclosure'] }),
    buildTheoremVerdict({
      theoremId: 'disclosure_boundary.witness_replay_closure',
      passed: proofClosure.allClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: replaySteps.map((entry) => entry.stepId),
      failureReasons: proofClosure.allClosed ? [] : ['disclosure-boundary witness/replay closure is incomplete']
    })
  ];
  return {
    proofFamily: 'disclosure-boundary',
    memberVerdicts: [
      { memberId: 'projection-policy', passed: Boolean(theoremVerdicts[0]?.passed) },
      { memberId: 'bounded-public-proof', passed: Boolean(theoremVerdicts[1]?.passed) },
      { memberId: 'redaction-proof', passed: Boolean(theoremVerdicts[2]?.passed) },
      { memberId: 'disclosure-proof', passed: Boolean(theoremVerdicts[3]?.passed) }
    ],
    theoremVerdicts,
    artifactBindings,
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    witnessClosureClosed: proofClosure.witnessBindingsClosed,
    replayClosureClosed: proofClosure.replayBindingsClosed && proofClosure.replayStepArtifactCoverageClosed && proofClosure.theoremReplayCoverageClosed,
    allCasesPassed: theoremVerdicts.slice(0, 4).every((entry) => entry.passed),
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts),
    proofHash: stableHashObject({
      projectionPolicy: projectionPolicy?.policyHash || stableHashObject(projectionPolicy || {}),
      boundedPublicProof: boundedPublicProof?.bundleId,
      redactionProof: redactionProof?.boundedPublicProofHash,
      disclosureProof: disclosureProof?.boundedPublicProofHash
    })
  };
}

/**
 * @param {any} journalDiff
 * @param {any} assetPackLock
 * @returns {any}
 */
function buildSettlementProof(journalDiff, assetPackLock) {
  return settlementRuntime.buildSettlementProof(journalDiff, assetPackLock);
}

/**
 * @param {any} __0
 * @returns {any}
 */
function buildSettlementParticipationArtifact({ evaluatedCandidates, selectedCandidates, settlementCandidates, assetPackLock, sourceToSharesArtifact, settledShares, allocations, branchMode }) {
  return settlementRuntime.buildSettlementParticipationArtifact({
    evaluatedCandidates,
    selectedCandidates,
    settlementCandidates,
    assetPackLock,
    sourceToSharesArtifact,
    settledShares,
    allocations,
    branchMode
  });
}

/**
 * @param {any} selectedCandidates
 * @returns {any}
 */
function buildUnitCatalog(selectedCandidates) {
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    units: selectedCandidates.flatMap((/** @type {any} */ candidate) => candidate.asset.contentUnits.map((/** @type {any} */ unit) => ({
      assetId: candidate.assetId,
      title: candidate.asset.title,
      useTier: candidate.useTier,
      selectionRoot: candidate.asset.artifactSelectionSurface?.selectedInventoryRoot,
      selectedInventoryEntryIds: candidate.asset.artifactSelectionSurface?.selectedInventoryEntryIds || [],
      addressingRoot: candidate.asset.addressingSurface?.addressingRoot,
      ...unitSemanticSummary(unit)
    })))
  };
}

/**
 * @param {any} state
 * @param {any} __0
 * @returns {any}
 */
export function settleReadEvent(state, { buyer, read, assetPack, assetPackLock, evaluatedCandidates, selectedCandidates, branchName, branchMode }) {
  return settlementRuntime.settleReadEvent(state, {
    buyer,
    read,
    assetPack,
    assetPackLock,
    evaluatedCandidates,
    selectedCandidates,
    branchName,
    branchMode
  });
}

/**
 * @param {any} branchArtifacts
 * @returns {any}
 */
function assertRequiredBranchArtifacts(branchArtifacts) {
  return evaluationMaterializationRuntime.assertRequiredBranchArtifacts(branchArtifacts);
}

/**
 * @param {any} __0
 * @returns {any}
 */
function buildBranchArtifacts({ read, readMeasurement, readReview, benchmarkTarget, branchMode, branchName, depositingSurface, readingSurface, depositingToReadingSurface, matchReport, verificationReport, evalManifest, assetPack, assetPackLock, selectedSourceMaterialManifest, settlementPreview, settlementProof, systemProofBundle, authorizationDecisions, sensitiveDataFlowRecords, policyRelease, assetPackEvidenceManifest, unitCatalog, pipelineTelemetry, selectedCandidates, journalDiff, identityBindings, githubBoundarySurface, artifactUploadManifest, profileCompositionSurface, promptFamilyRegistry, promptSurfaces, promptContracts, inferenceProofs, inferenceMomentContracts, promptImplementationSurface, inferenceSynthesisProof, promptCompletenessProof, parsedCompletionEnvelopes, parsedCompletionEnvelopeArtifact, externalBoundaryManifest, measurementReceipts, staticMeasurementReport, staticMeasurementProof, codeAnalysisFactRegistry, staticHeuristicsRegistry, verificationReceiptsArtifact, verificationDecisionsProof, proofWitnessManifest, selectionConsistencyProof, selectionAndMaterializationProof, identityAuthorizationProof, sensitiveDataFlowProof, authorizationAndSensitiveFlowProof, materializationProof, materializationExclusions, materializationVisibilityProof, sourceToSharesArtifact, settlementParticipationArtifact, accountingPrecisionReport, journalCompletenessProof, settlementSourceToSharesProof, scenarioFixtureManifest, testCoverageReport, projectionPolicy, boundedPublicProof, redactionProof, disclosureProof, disclosureBoundaryProof, proofContract, computeRealityManifest, storageRealityManifest, bitcoinCommitmentManifest, bitcoinTreasuryPolicy, bitcoinAnchor, bitcoinBoundedPublicAnchor, bitcoinSettlementIntent, bitcoinSettlementObservation, bitcoinAuditAnchorProof, bitcoinSettlementInterfaceProof, externalEnvironmentProfile, externalExecutionPolicy, externalTelemetryPolicy, externalTelemetrySummary, networkCapabilityManifest, githubAppBinding, bitcoinNetworkIntent, bitcoinNetworkExecution, bitcoinNetworkObservation, repeatedReadPaymentIntent, repeatedReadPaymentExecution, repeatedReadPaymentObservation, sidechainExecutionReceipt, computeContainerManifest, computeContainerExecution, storageContainerManifest, storagePublicationReceipt, storageRetrievalReceipt, githubLiveSession, githubInventoryFetchReceipt, githubArtifactFetchReceipt, githubBranchPublicationReceipt, githubPrUpdateReceipt, externalRealizationProof, containerRealityProof, githubLiveInterfaceProof }) {
  return evaluationMaterializationRuntime.buildBranchArtifacts({
    read,
    readMeasurement,
    readReview,
    benchmarkTarget,
    branchMode,
    branchName,
    depositingSurface,
    readingSurface,
    depositingToReadingSurface,
    matchReport,
    verificationReport,
    evalManifest,
    assetPack,
    assetPackLock,
    selectedSourceMaterialManifest,
    settlementPreview,
    settlementProof,
    systemProofBundle,
    authorizationDecisions,
    sensitiveDataFlowRecords,
    policyRelease,
    assetPackEvidenceManifest,
    unitCatalog,
    pipelineTelemetry,
    selectedCandidates,
    journalDiff,
    identityBindings,
    githubBoundarySurface,
    artifactUploadManifest,
    profileCompositionSurface,
    promptFamilyRegistry,
    promptSurfaces,
    promptContracts,
    inferenceProofs,
    inferenceMomentContracts,
    promptImplementationSurface,
    inferenceSynthesisProof,
    promptCompletenessProof,
    parsedCompletionEnvelopes,
    parsedCompletionEnvelopeArtifact,
    externalBoundaryManifest,
    measurementReceipts,
    staticMeasurementReport,
    staticMeasurementProof,
    codeAnalysisFactRegistry,
    staticHeuristicsRegistry,
    verificationReceiptsArtifact,
    verificationDecisionsProof,
    proofWitnessManifest,
    selectionConsistencyProof,
    selectionAndMaterializationProof,
    identityAuthorizationProof,
    sensitiveDataFlowProof,
    authorizationAndSensitiveFlowProof,
    materializationProof,
    materializationExclusions,
    materializationVisibilityProof,
    sourceToSharesArtifact,
    settlementParticipationArtifact,
    accountingPrecisionReport,
    journalCompletenessProof,
    settlementSourceToSharesProof,
    scenarioFixtureManifest,
    testCoverageReport,
    projectionPolicy,
    boundedPublicProof,
    redactionProof,
    disclosureProof,
    disclosureBoundaryProof,
    proofContract,
    computeRealityManifest,
    storageRealityManifest,
    bitcoinCommitmentManifest,
    bitcoinTreasuryPolicy,
    bitcoinAnchor,
    bitcoinBoundedPublicAnchor,
    bitcoinSettlementIntent,
    bitcoinSettlementObservation,
    bitcoinAuditAnchorProof,
    bitcoinSettlementInterfaceProof,
    externalEnvironmentProfile,
    externalExecutionPolicy,
    externalTelemetryPolicy,
    externalTelemetrySummary,
    networkCapabilityManifest,
    githubAppBinding,
    bitcoinNetworkIntent,
    bitcoinNetworkExecution,
    bitcoinNetworkObservation,
    repeatedReadPaymentIntent,
    repeatedReadPaymentExecution,
    repeatedReadPaymentObservation,
    sidechainExecutionReceipt,
    computeContainerManifest,
    computeContainerExecution,
    storageContainerManifest,
    storagePublicationReceipt,
    storageRetrievalReceipt,
    githubLiveSession,
    githubInventoryFetchReceipt,
    githubArtifactFetchReceipt,
    githubBranchPublicationReceipt,
    githubPrUpdateReceipt,
    externalRealizationProof,
    containerRealityProof,
    githubLiveInterfaceProof
  });
}

/**
 * @param {any} state
 * @param {any} [input={}]
 * @returns {any}
 */
export function runMakeBitcodeBranch(state, input = {}) {
  const { buyerId, scenarioId, branchMode = DEFAULT_BRANCH_MODE } = input;
  const paymentMode = normalizeBitcoinPaymentMode(input.paymentMode);
  const v23BitcoinEnabled = !!paymentMode;
  const buyer = state.buyers.find((/** @type {any} */ entry) => entry.buyerId === (buyerId || state.buyers[0]?.buyerId));
  const scenario = state.readScenarios.find((/** @type {any} */ entry) => entry.scenarioId === (scenarioId || state.readScenarios[0]?.scenarioId));
  if (!buyer) throw new Error('Buyer not found.');
  if (!scenario) throw new Error('Read scenario not found.');
  const scenarioBoundBuyer = {
    ...buyer,
    repo: scenario.repo,
    buyerBranch: scenario.baseRef,
    installationId: scenario.installationId
  };

  const policyState = state.policyState || buildPolicyState();
  const readMeasurement = measureReadFromScenario(scenario);
  const {
    readDescriptor: read,
    benchmarkTarget,
    benchmarkParserContract,
    canonicalBenchmarkOutputs,
    parserValidation,
    inferenceProofs,
    inferenceSynthesisProof,
    promptSurfaces,
    promptContracts,
    promptFamilyRegistry,
    promptCompletenessProof,
    inferenceMomentContracts,
    parsedCompletionEnvelopes,
    parsedCompletionEnvelopeArtifact,
    reviewableRead
  } = readMeasurement;
  const readReview = reviewReadForFitSearch(reviewableRead, {
    action: input.readReviewAction || input.reviewAction || 'accept',
    feedback: input.readReviewFeedback || input.reviewFeedback || [],
    actorId: input.readReviewActorId || input.actorId || 'bitcode-system:read-review',
    decisionMode: input.readReviewDecisionMode || input.decisionMode || 'deterministic-fifth-gate-local-review'
  });
  if (!readReview.fitSearchAdmission?.admitted) {
    throw new Error('Bitcode Finding Fits cannot proceed before the measured Read is accepted for source-to-shares review.');
  }
  const reviewedReadMeasurement = {
    ...readMeasurement,
    readReview
  };
  const evaluatedCandidates = evaluateCandidates(read, state.assets, policyState);
  const assetPack = assembleAssetPack(read, evaluatedCandidates, branchMode);
  const selectedCandidates = evaluatedCandidates.filter((/** @type {any} */ candidate) => assetPack.selectedAssets.includes(candidate.assetId));
  if (!selectedCandidates.length) throw new Error('No candidates survived into the asset pack.');
  const depositingSurface = buildDepositingSurface({
    buyer: scenarioBoundBuyer,
    read,
    assetPack,
    selectedCandidates
  });
  const readingSurface = buildReadingSurface(read);

  const branchName = `bitcode/remediation-${read.readId}-${toSlug(scenario.scenarioId)}`;
  const matchReport = buildMatchReport(read, evaluatedCandidates, assetPack);
  const verificationReport = buildVerificationReport(read, evaluatedCandidates, branchMode);
  const evalManifest = buildEvalManifest(read, evaluatedCandidates, promptSurfaces, parsedCompletionEnvelopes);
  const assetPackLock = buildAssetPackLock(assetPack, selectedCandidates);
  const selectedSourceMaterialManifest = buildSelectedSourceMaterialManifest(assetPack, selectedCandidates);
  const settlement = settleReadEvent(state, {
    buyer: scenarioBoundBuyer,
    read,
    assetPack,
    assetPackLock,
    evaluatedCandidates,
    selectedCandidates,
    branchName,
    branchMode
  });
  const selectionConsistencyProof = buildSelectionConsistencyProofUnchecked({
    assetPack,
    assetPackLock,
    selectedCandidates,
    settlementCandidates: selectedCandidates.filter((/** @type {any} */ candidate) => candidate.useTier === 'settlement-eligible'),
    selectedSourceMaterialManifest,
    branchMode
  });
  const journalCompletenessProof = buildJournalCompletenessProof(settlement.eventId, settlement.journalDiff);
  const identityBindings = buildIdentityBindings(scenarioBoundBuyer, selectedCandidates);
  const githubBoundarySurface = buildGithubBoundarySurface(scenarioBoundBuyer, read, selectedCandidates);
  const artifactUploadManifest = buildArtifactUploadManifest(selectedCandidates);
  const profileCompositionSurface = /** @type {any} */ (buildProfileCompositions());
  const authorizationDecisions = buildAuthorizationDecisions(policyState, identityBindings, scenarioBoundBuyer, branchName, assetPack);
  const sensitiveDataFlowRecords = buildSensitiveDataFlowRecords(policyState, scenarioBoundBuyer, branchName, assetPack, selectedCandidates);
  const identityAuthorizationProof = buildIdentityAuthorizationProof(branchName, authorizationDecisions, identityBindings, selectedCandidates);
  const sensitiveDataFlowProof = buildSensitiveDataFlowProof(sensitiveDataFlowRecords);
  const assetMeasurementProofs = buildAssetMeasurementProofs(selectedCandidates);
  const settlementProof = buildSettlementProof(settlement.journalDiff, assetPackLock);
  const depositingToReadingSurface = buildDepositingToReadingSurface({
    depositingSurface,
    readingSurface,
    selectedCandidates,
    assetPack,
    settlementPreview: settlement.settlementPreview
  });
  const promptImplementationSurface = buildPromptImplementationSurfaceUnchecked(inferenceProofs, promptSurfaces, parsedCompletionEnvelopes, parsedCompletionEnvelopeArtifact);
  let proofContract = buildProofContract({ readId: read.readId, assetPackId: assetPack.assetPackId, branchName, selectedCandidates, authorizationDecisions, sensitiveDataFlowRecords });
  const policyRelease = buildBranchPolicyRelease(policyState, branchName, assetPack, selectedCandidates, { v23BitcoinEnabled });
  const unitCatalog = buildUnitCatalog(selectedCandidates);
  const scenarioFixtureManifest = buildScenarioFixtureManifest(state, scenario.scenarioId);
  const measurementReceipts = collectStaticExecutionReceipts([
    readMeasurement.staticExecutionReceipts,
    evaluatedCandidates.map((/** @type {any} */ candidate) => candidate.staticExecutionReceipts),
    state.assets.map((/** @type {any} */ asset) => asset.assetMeasurement?.staticExecutionReceipts)
  ]).filter((receipt) => !String(receipt.stageId || '').startsWith('verification.'));
  const codeAnalysisFactRegistry = buildCodeAnalysisFactRegistry({ read, evaluatedCandidates });
  const staticHeuristicsRegistry = buildStaticHeuristicsRegistryArtifact(codeAnalysisFactRegistry);
  const staticMeasurementReport = buildStaticMeasurementReport(measurementReceipts, readMeasurement, evaluatedCandidates);
  const staticMeasurementProof = buildStaticMeasurementProof(measurementReceipts, readMeasurement, evaluatedCandidates);
  const verificationReceiptsArtifact = buildVerificationReceiptsArtifact(read, evaluatedCandidates);
  const verificationDecisionsProof = buildVerificationDecisionsProof(verificationReport, verificationReceiptsArtifact);
  const pipelineTelemetry = buildPipelineTelemetry({
    read,
    evaluatedCandidates,
    assetPack,
    selectedCandidates,
    verificationReport,
    readReview,
    settlementPreview: settlement.settlementPreview,
    journalDiff: settlement.journalDiff
  });
  const {
    externalEnvironmentProfile,
    externalExecutionPolicy,
    externalTelemetryPolicy,
    externalTelemetrySummary,
    networkCapabilityManifest,
    githubAppBinding
  } = buildV24ExternalRealizationArtifacts({
    githubAppSessions: state.githubAppSessions,
    branchName,
    branchMode,
    paymentMode,
    scenarioId: scenario.scenarioId,
    pipelineTelemetry
  });
  const externalBoundaryManifest = buildExternalBoundaryManifest({
    buyer: scenarioBoundBuyer,
    read,
    selectedCandidates,
    assetPack,
    settlementPreview: settlement.settlementPreview,
    paymentMode,
    externalEnvironmentProfile,
    externalExecutionPolicy,
    externalTelemetryPolicy,
    externalTelemetrySummary,
    networkCapabilityManifest,
    githubAppBinding
  });
  const testCoverageReport = buildTestCoverageReport({
    state,
    scenarioFixtureManifest,
    activeScenarioId: scenario.scenarioId,
    selectedCandidates,
    settlementParticipationArtifact: settlement.settlementParticipationArtifact
  });
  const assetPackEvidenceManifest = buildAssetPackEvidenceManifest({
    branchName,
    read,
    benchmarkTarget,
    depositingSurface,
    readingSurface,
    depositingToReadingSurface,
    assetPack,
    assetPackLock,
    settlementPreview: settlement.settlementPreview,
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
    v23BitcoinEnabled,
    v24ExternalRealizationEnabled: Boolean(externalEnvironmentProfile)
  });
  const provisionalBoundedPublicProof = buildBoundedPublicProofArtifactUnchecked({
    read,
    assetPack,
    settlement,
    proofContract,
    branchName,
    promptCompletenessProof,
    staticMeasurementReport
  });
  const provisionalBranchArtifacts = {
    branchName,
    branchMode,
    confidentiality: 'private-required',
    files: {}
  };
  const projectionPolicy = buildProjectionPolicyUnchecked(policyRelease, provisionalBranchArtifacts, DEFAULT_PROJECTION_PRINCIPAL);
  const redactionProof = buildRedactionProofUnchecked({
    policyRelease,
    branchArtifacts: provisionalBranchArtifacts,
    projectionPolicy,
    boundedPublicProof: provisionalBoundedPublicProof
  });
  const disclosureProof = buildDisclosureProofUnchecked({
    policyRelease,
    projectionPolicy,
    boundedPublicProof: provisionalBoundedPublicProof
  });
  const materializationVisibilityProof = buildMaterializationVisibilityProofUnchecked({
    assetPackLock,
    selectedSourceMaterialManifest,
    projectionPolicy,
    policyRelease
  });
  let materializationExclusions = buildMaterializationExclusionsUnchecked({
    assetPack,
    evaluatedCandidates,
    selectedCandidates,
    branchMode
  });
  let materializationProof = buildMaterializationProofUnchecked({
    assetPack,
    assetPackLock,
    selectedSourceMaterialManifest,
    materializationVisibilityProof,
    materializationExclusions,
    branchMode
  });
  let selectionAndMaterializationProof = buildSelectionAndMaterializationProof(
    selectionConsistencyProof,
    materializationProof,
    materializationExclusions,
    materializationVisibilityProof
  );
  const authorizationAndSensitiveFlowProof = buildAuthorizationAndSensitiveFlowProof(identityAuthorizationProof, sensitiveDataFlowProof);
  const settlementSourceToSharesProof = buildSettlementSourceToSharesProof(
    settlement.sourceToSharesArtifact,
    settlement.settlementParticipationArtifact,
    settlement.settlementPreview,
    settlement.accountingPrecisionReport,
    journalCompletenessProof,
    settlementProof
  );
  let disclosureBoundaryProof = buildDisclosureBoundaryProof(
    projectionPolicy,
    provisionalBoundedPublicProof,
    redactionProof,
    disclosureProof
  );
  let proofWitnessManifest = buildProofWitnessManifestUnchecked({
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
    settlementPreview: settlement.settlementPreview,
    sourceToSharesArtifact: settlement.sourceToSharesArtifact,
    settlementParticipationArtifact: settlement.settlementParticipationArtifact,
    accountingPrecisionReport: settlement.accountingPrecisionReport,
    settlementSourceToSharesProof,
    settlementProof,
    journalDiff: settlement.journalDiff,
    projectionPolicy,
    boundedPublicProof: provisionalBoundedPublicProof,
    redactionProof,
    disclosureProof,
    disclosureBoundaryProof,
    proofContract,
    externalEnvironmentProfile,
    externalExecutionPolicy,
    externalTelemetryPolicy,
    externalTelemetrySummary,
    networkCapabilityManifest,
    githubAppBinding
  });
  let systemProofBundle = buildSystemProofBundleUnchecked(
    read.readId,
    assetPack.assetPackId,
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
    settlement.sourceToSharesArtifact,
    settlement.settlementParticipationArtifact,
    settlement.accountingPrecisionReport,
    redactionProof,
    disclosureProof,
    disclosureBoundaryProof,
    proofWitnessManifest,
    proofContract
  );
  let branchArtifacts = buildBranchArtifacts({
    read,
    readMeasurement: reviewedReadMeasurement,
    readReview,
    benchmarkTarget,
    branchMode,
    branchName,
    depositingSurface,
    readingSurface,
    depositingToReadingSurface,
    matchReport,
    verificationReport,
    evalManifest,
    assetPack,
    assetPackLock,
    selectedSourceMaterialManifest,
    settlementPreview: settlement.settlementPreview,
    settlementProof,
    systemProofBundle,
    authorizationDecisions,
    sensitiveDataFlowRecords,
    policyRelease,
    assetPackEvidenceManifest,
    unitCatalog,
    pipelineTelemetry,
    selectedCandidates,
    journalDiff: settlement.journalDiff,
    identityBindings,
    githubBoundarySurface,
    artifactUploadManifest,
    profileCompositionSurface,
    promptFamilyRegistry,
    promptSurfaces,
    promptContracts,
    inferenceProofs,
    inferenceMomentContracts,
    promptImplementationSurface,
    inferenceSynthesisProof,
    promptCompletenessProof,
    parsedCompletionEnvelopes,
    parsedCompletionEnvelopeArtifact,
    codeAnalysisFactRegistry,
    staticHeuristicsRegistry,
    externalBoundaryManifest,
    measurementReceipts,
    staticMeasurementReport,
    staticMeasurementProof,
    verificationReceiptsArtifact,
    verificationDecisionsProof,
    proofWitnessManifest,
    selectionConsistencyProof,
    selectionAndMaterializationProof,
    identityAuthorizationProof,
    sensitiveDataFlowProof,
    authorizationAndSensitiveFlowProof,
    materializationProof,
    materializationExclusions,
    materializationVisibilityProof,
    sourceToSharesArtifact: settlement.sourceToSharesArtifact,
    settlementParticipationArtifact: settlement.settlementParticipationArtifact,
    accountingPrecisionReport: settlement.accountingPrecisionReport,
    journalCompletenessProof,
    settlementSourceToSharesProof,
    scenarioFixtureManifest,
    testCoverageReport,
    projectionPolicy,
    boundedPublicProof: provisionalBoundedPublicProof,
    redactionProof,
    disclosureProof,
    disclosureBoundaryProof,
    proofContract
  });
  const boundedPublicProof = buildBoundedPublicProofArtifactUnchecked({
    read,
    assetPack,
    settlement,
    proofContract,
    branchName,
    promptCompletenessProof,
    staticMeasurementReport
  });
  const finalizedProjectionPolicy = buildProjectionPolicyUnchecked(policyRelease, branchArtifacts, DEFAULT_PROJECTION_PRINCIPAL);
  const finalizedRedactionProof = buildRedactionProofUnchecked({
    policyRelease,
    branchArtifacts,
    projectionPolicy: finalizedProjectionPolicy,
    boundedPublicProof
  });
  const finalizedDisclosureProof = buildDisclosureProofUnchecked({
    policyRelease,
    projectionPolicy: finalizedProjectionPolicy,
    boundedPublicProof
  });
  const finalizedMaterializationVisibilityProof = buildMaterializationVisibilityProofUnchecked({
    assetPackLock,
    selectedSourceMaterialManifest,
    projectionPolicy: finalizedProjectionPolicy,
    policyRelease
  });
  materializationExclusions = buildMaterializationExclusionsUnchecked({
    assetPack,
    evaluatedCandidates,
    selectedCandidates,
    branchMode
  });
  materializationProof = buildMaterializationProofUnchecked({
    assetPack,
    assetPackLock,
    selectedSourceMaterialManifest,
    materializationVisibilityProof: finalizedMaterializationVisibilityProof,
    materializationExclusions,
    branchMode
  });
  selectionAndMaterializationProof = buildSelectionAndMaterializationProof(
    selectionConsistencyProof,
    materializationProof,
    materializationExclusions,
    finalizedMaterializationVisibilityProof
  );
  disclosureBoundaryProof = buildDisclosureBoundaryProof(
    finalizedProjectionPolicy,
    boundedPublicProof,
    finalizedRedactionProof,
    finalizedDisclosureProof
  );
  proofContract = buildProofContract({
    readId: read.readId,
    assetPackId: assetPack.assetPackId,
    branchName,
    selectedCandidates,
    authorizationDecisions,
    sensitiveDataFlowRecords,
    systemProofBundleSummary: {
      proofFamilies: (systemProofBundle?.proofFamilies || []).map((/** @type {any} */ entry) => entry.proofFamily),
      replayArtifactCount: (systemProofBundle?.verifierEntrypoint?.replayArtifacts || []).length,
      requiredArtifactCount: (systemProofBundle?.verifierEntrypoint?.requiredArtifactPaths || []).length
    },
    proofWitnessManifestSummary: {
      proofFamilies: (proofWitnessManifest?.proofFamilies || []).map((/** @type {any} */ entry) => entry.proofFamily),
      digestedArtifactCount: (proofWitnessManifest?.artifactDigests || []).length,
      allProofRelevantArtifactsDigested: proofWitnessManifest?.allProofRelevantArtifactsDigested === true
    }
  });
  proofWitnessManifest = buildProofWitnessManifestUnchecked({
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
    materializationVisibilityProof: finalizedMaterializationVisibilityProof,
    settlementPreview: settlement.settlementPreview,
    sourceToSharesArtifact: settlement.sourceToSharesArtifact,
    settlementParticipationArtifact: settlement.settlementParticipationArtifact,
    accountingPrecisionReport: settlement.accountingPrecisionReport,
    settlementSourceToSharesProof,
    settlementProof,
    journalDiff: settlement.journalDiff,
    projectionPolicy: finalizedProjectionPolicy,
    boundedPublicProof,
    redactionProof: finalizedRedactionProof,
    disclosureProof: finalizedDisclosureProof,
    disclosureBoundaryProof,
    proofContract
  });
  systemProofBundle = buildSystemProofBundleUnchecked(
    read.readId,
    assetPack.assetPackId,
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
    finalizedMaterializationVisibilityProof,
    verificationReceiptsArtifact,
    verificationDecisionsProof,
    settlement.sourceToSharesArtifact,
    settlement.settlementParticipationArtifact,
    settlement.accountingPrecisionReport,
    finalizedRedactionProof,
    finalizedDisclosureProof,
    disclosureBoundaryProof,
    proofWitnessManifest,
    proofContract
  );
  let computeRealityManifest = null;
  let storageRealityManifest = null;
  let bitcoinCommitmentManifest = null;
  let bitcoinTreasuryPolicy = null;
  let bitcoinAnchor = null;
  let bitcoinBoundedPublicAnchor = null;
  let bitcoinSettlementIntent = null;
  let bitcoinSettlementObservation = null;
  let bitcoinAuditAnchorProof = null;
  let bitcoinSettlementInterfaceProof = null;
  let bitcoinNetworkIntent = null;
  let bitcoinNetworkExecution = null;
  let bitcoinNetworkObservation = null;
  let repeatedReadPaymentIntent = null;
  let repeatedReadPaymentExecution = null;
  let repeatedReadPaymentObservation = null;
  let sidechainExecutionReceipt = null;
  let computeContainerManifest = null;
  let computeContainerExecution = null;
  let storageContainerManifest = null;
  let storagePublicationReceipt = null;
  let storageRetrievalReceipt = null;
  let githubLiveSession = null;
  let githubInventoryFetchReceipt = null;
  let githubArtifactFetchReceipt = null;
  let githubBranchPublicationReceipt = null;
  let githubPrUpdateReceipt = null;
  let externalRealizationProof = null;
  let containerRealityProof = null;
  let githubLiveInterfaceProof = null;
  if (v23BitcoinEnabled) {
    computeRealityManifest = buildComputeRealityManifest({
      read,
      assetPack,
      paymentMode,
      externalBoundaryManifest,
      proofArtifactRefs: [
        '.bitcode/system-proof-bundle.json',
        '.bitcode/proof-witness-manifest.json',
        '.bitcode/proof-contract.json',
        '.bitcode/disclosure-boundary-proof.json',
        '.bitcode/settlement-proof.json'
      ],
      settlementArtifactRefs: [
        '.bitcode/settlement-preview.json',
        '.bitcode/source-to-shares.json',
        '.bitcode/settlement-participation.json',
        '.bitcode/accounting-precision-report.json',
        '.bitcode/journal-diff.json',
        '.bitcode/settlement-proof.json'
      ]
    });
    storageRealityManifest = buildStorageRealityManifest({
      branchName,
      paymentMode,
      assetPackEvidenceManifest,
      policyRelease
    });
    bitcoinTreasuryPolicy = buildBitcoinTreasuryPolicy({ paymentMode });
    bitcoinSettlementIntent = buildBitcoinSettlementIntent({
      buyer: scenarioBoundBuyer,
      read,
      assetPack,
      settlementPreview: settlement.settlementPreview,
      sourceToSharesArtifact: settlement.sourceToSharesArtifact,
      treasuryPolicy: bitcoinTreasuryPolicy,
      paymentMode
    });
    bitcoinSettlementObservation = buildBitcoinSettlementObservation({
      settlementIntent: bitcoinSettlementIntent,
      treasuryPolicy: bitcoinTreasuryPolicy,
      settlementPreview: settlement.settlementPreview,
      branchName
    });
    const existingArtifactPayloadByPath = Object.fromEntries(
      Object.entries(branchArtifacts.files || {})
        .filter(([path]) => path.endsWith('.json'))
        .map(([path, payload]) => [path, JSON.parse(payload)])
    );
    const artifactPayloadByPath = {
      ...existingArtifactPayloadByPath,
      '.bitcode/compute-reality-manifest.json': computeRealityManifest,
      '.bitcode/storage-reality-manifest.json': storageRealityManifest,
      '.bitcode/bitcoin-treasury-policy.json': bitcoinTreasuryPolicy,
      '.bitcode/bitcoin-settlement-intent.json': bitcoinSettlementIntent,
      '.bitcode/bitcoin-settlement-observation.json': bitcoinSettlementObservation
    };
    const existingProofFamiliesByPath = Object.fromEntries(
      Object.entries(proofWitnessManifest?.artifactDigestByPath || {}).map(([path, entry]) => [
        path,
        summarizeAnnotationStrings(entry?.proofFamilies || [])
      ])
    );
    const proofFamiliesByPath = {
      ...existingProofFamiliesByPath,
      '.bitcode/compute-reality-manifest.json': ['bitcoin-settlement-interface'],
      '.bitcode/storage-reality-manifest.json': ['bitcoin-audit-anchor'],
      '.bitcode/bitcoin-treasury-policy.json': ['bitcoin-audit-anchor', 'bitcoin-settlement-interface'],
      '.bitcode/bitcoin-settlement-intent.json': ['bitcoin-settlement-interface'],
      '.bitcode/bitcoin-settlement-observation.json': ['bitcoin-settlement-interface']
    };
    const assetPackEvidenceByPath = Object.fromEntries(
      (assetPackEvidenceManifest?.assetPackEvidence || []).map((entry) => [entry.path, entry])
    );
    const commitmentScopePayloadByPath = Object.fromEntries(
      Object.entries(artifactPayloadByPath).filter(([path]) => !V23_PRIVATE_ROOT_EXCLUSION_PATHS.has(path) && !!assetPackEvidenceByPath[path])
    );
    const artifactDigestLookup = buildArtifactDigestLookup(commitmentScopePayloadByPath, proofFamiliesByPath);
    const artifactMetadataByPath = Object.fromEntries(
      Object.entries(commitmentScopePayloadByPath).map(([path]) => [
        path,
        {
          path,
          digest: artifactDigestLookup[path]?.digest,
          confidentialityClass: assetPackEvidenceByPath[path]?.confidentialityClass || 'private-proof-artifact',
          potentiallyDisclosable: assetPackEvidenceByPath[path]?.potentiallyDisclosable === true,
          proofFamilies: artifactDigestLookup[path]?.proofFamilies || []
        }
      ])
    );
    bitcoinCommitmentManifest = buildBitcoinCommitmentManifest({
      artifactMetadataByPath,
      proofContractRef: proofContract.contractId,
      systemProofBundleRef: `system-proof-bundle:${read.readId}:${assetPack.assetPackId}:v23`,
      proofWitnessRef: `proof-witness-manifest:${proofWitnessManifest.proofHash}`
    });
    ({ bitcoinAnchor, bitcoinBoundedPublicAnchor } = buildBitcoinAnchorArtifacts({
      commitmentManifest: bitcoinCommitmentManifest,
      treasuryPolicy: bitcoinTreasuryPolicy,
      settlementIntent: bitcoinSettlementIntent,
      settlementObservation: bitcoinSettlementObservation,
      branchName
    }));
    bitcoinAuditAnchorProof = buildBitcoinAuditAnchorProof({
      commitmentManifest: bitcoinCommitmentManifest,
      storageRealityManifest,
      treasuryPolicy: bitcoinTreasuryPolicy,
      bitcoinAnchor,
      bitcoinBoundedPublicAnchor,
      projectionPolicy: finalizedProjectionPolicy,
      boundedPublicProof,
      disclosureProof: finalizedDisclosureProof,
      proofContract
    });
    bitcoinSettlementInterfaceProof = buildBitcoinSettlementInterfaceProof({
      computeRealityManifest,
      settlementIntent: bitcoinSettlementIntent,
      settlementObservation: bitcoinSettlementObservation,
      treasuryPolicy: bitcoinTreasuryPolicy,
      settlementPreview: settlement.settlementPreview,
      sourceToSharesArtifact: settlement.sourceToSharesArtifact,
      settlementProof,
      journalDiff: settlement.journalDiff,
      externalBoundaryManifest
    });
    proofWitnessManifest = buildProofWitnessManifestUnchecked({
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
      materializationVisibilityProof: finalizedMaterializationVisibilityProof,
      settlementPreview: settlement.settlementPreview,
      sourceToSharesArtifact: settlement.sourceToSharesArtifact,
      settlementParticipationArtifact: settlement.settlementParticipationArtifact,
      accountingPrecisionReport: settlement.accountingPrecisionReport,
      settlementSourceToSharesProof,
      settlementProof,
      journalDiff: settlement.journalDiff,
      projectionPolicy: finalizedProjectionPolicy,
      boundedPublicProof,
      redactionProof: finalizedRedactionProof,
      disclosureProof: finalizedDisclosureProof,
      disclosureBoundaryProof,
      proofContract,
      computeRealityManifest,
      storageRealityManifest,
      bitcoinCommitmentManifest,
      bitcoinTreasuryPolicy,
      bitcoinAnchor,
      bitcoinBoundedPublicAnchor,
      bitcoinSettlementIntent,
      bitcoinSettlementObservation,
      bitcoinAuditAnchorProof,
      bitcoinSettlementInterfaceProof
    });
    systemProofBundle = buildSystemProofBundleUnchecked(
      read.readId,
      assetPack.assetPackId,
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
      finalizedMaterializationVisibilityProof,
      verificationReceiptsArtifact,
      verificationDecisionsProof,
      settlement.sourceToSharesArtifact,
      settlement.settlementParticipationArtifact,
      settlement.accountingPrecisionReport,
      finalizedRedactionProof,
      finalizedDisclosureProof,
      disclosureBoundaryProof,
      proofWitnessManifest,
      proofContract,
      computeRealityManifest,
      storageRealityManifest,
      bitcoinCommitmentManifest,
      bitcoinTreasuryPolicy,
      bitcoinAnchor,
      bitcoinBoundedPublicAnchor,
      bitcoinSettlementIntent,
      bitcoinSettlementObservation,
      bitcoinAuditAnchorProof,
      bitcoinSettlementInterfaceProof
    );
    proofContract = buildProofContract({
      readId: read.readId,
      assetPackId: assetPack.assetPackId,
      branchName,
      selectedCandidates,
      authorizationDecisions,
      sensitiveDataFlowRecords,
      systemProofBundleSummary: {
        proofFamilies: (systemProofBundle?.proofFamilies || []).map((/** @type {any} */ entry) => entry.proofFamily),
        replayArtifactCount: (systemProofBundle?.verifierEntrypoint?.replayArtifacts || []).length,
        requiredArtifactCount: (systemProofBundle?.verifierEntrypoint?.requiredArtifactPaths || []).length
      },
      proofWitnessManifestSummary: {
        proofFamilies: (proofWitnessManifest?.proofFamilies || []).map((/** @type {any} */ entry) => entry.proofFamily),
        digestedArtifactCount: (proofWitnessManifest?.artifactDigests || []).length,
        allProofRelevantArtifactsDigested: proofWitnessManifest?.allProofRelevantArtifactsDigested === true
      },
      v23BitcoinEnabled
    });
    proofWitnessManifest = buildProofWitnessManifestUnchecked({
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
      materializationVisibilityProof: finalizedMaterializationVisibilityProof,
      settlementPreview: settlement.settlementPreview,
      sourceToSharesArtifact: settlement.sourceToSharesArtifact,
      settlementParticipationArtifact: settlement.settlementParticipationArtifact,
      accountingPrecisionReport: settlement.accountingPrecisionReport,
      settlementSourceToSharesProof,
      settlementProof,
      journalDiff: settlement.journalDiff,
      projectionPolicy: finalizedProjectionPolicy,
      boundedPublicProof,
      redactionProof: finalizedRedactionProof,
      disclosureProof: finalizedDisclosureProof,
      disclosureBoundaryProof,
      proofContract,
      computeRealityManifest,
      storageRealityManifest,
      bitcoinCommitmentManifest,
      bitcoinTreasuryPolicy,
      bitcoinAnchor,
      bitcoinBoundedPublicAnchor,
      bitcoinSettlementIntent,
      bitcoinSettlementObservation,
      bitcoinAuditAnchorProof,
      bitcoinSettlementInterfaceProof
    });
    systemProofBundle = buildSystemProofBundleUnchecked(
      read.readId,
      assetPack.assetPackId,
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
      finalizedMaterializationVisibilityProof,
      verificationReceiptsArtifact,
      verificationDecisionsProof,
      settlement.sourceToSharesArtifact,
      settlement.settlementParticipationArtifact,
      settlement.accountingPrecisionReport,
      finalizedRedactionProof,
      finalizedDisclosureProof,
      disclosureBoundaryProof,
      proofWitnessManifest,
      proofContract,
      computeRealityManifest,
      storageRealityManifest,
      bitcoinCommitmentManifest,
      bitcoinTreasuryPolicy,
      bitcoinAnchor,
      bitcoinBoundedPublicAnchor,
      bitcoinSettlementIntent,
      bitcoinSettlementObservation,
      bitcoinAuditAnchorProof,
      bitcoinSettlementInterfaceProof
    );
  }
  ({
    bitcoinNetworkIntent,
    bitcoinNetworkExecution,
    bitcoinNetworkObservation,
    repeatedReadPaymentIntent,
    repeatedReadPaymentExecution,
    repeatedReadPaymentObservation,
    sidechainExecutionReceipt
  } = buildV24BitcoinNetworkArtifacts({
    externalEnvironmentProfile,
    externalTelemetrySummary,
    bitcoinTreasuryPolicy,
    bitcoinSettlementIntent,
    bitcoinSettlementObservation,
    bitcoinAnchor,
    settlementPreview: settlement.settlementPreview,
    assetPack,
    branchName,
    paymentMode
  }));
  ({
    computeContainerManifest,
    computeContainerExecution,
    storageContainerManifest,
    storagePublicationReceipt,
    storageRetrievalReceipt
  } = buildV24ContainerArtifacts({
    externalEnvironmentProfile,
    externalTelemetrySummary,
    computeRealityManifest,
    storageRealityManifest,
    branchName,
    read,
    assetPack
  }));
  ({
    githubLiveSession,
    githubInventoryFetchReceipt,
    githubArtifactFetchReceipt,
    githubBranchPublicationReceipt,
    githubPrUpdateReceipt
  } = buildV24GithubArtifacts({
    externalEnvironmentProfile,
    externalTelemetrySummary,
    githubAppBinding,
    githubBoundarySurface,
    selectedCandidates,
    buyer: scenarioBoundBuyer,
    branchName,
    assetPack
  }));
  externalRealizationProof = buildV24ExternalRealizationProof({
    externalEnvironmentProfile,
    externalExecutionPolicy,
    externalTelemetrySummary,
    bitcoinNetworkIntent,
    bitcoinNetworkExecution,
    bitcoinNetworkObservation,
    repeatedReadPaymentIntent,
    repeatedReadPaymentExecution,
    repeatedReadPaymentObservation,
    sidechainExecutionReceipt
  });
  containerRealityProof = buildV24ContainerRealityProof({
    externalEnvironmentProfile,
    computeContainerManifest,
    computeContainerExecution,
    storageContainerManifest,
    storagePublicationReceipt,
    storageRetrievalReceipt
  });
  githubLiveInterfaceProof = buildV24GithubLiveInterfaceProof({
    externalEnvironmentProfile,
    githubAppBinding,
    githubLiveSession,
    githubInventoryFetchReceipt,
    githubArtifactFetchReceipt,
    githubBranchPublicationReceipt,
    githubPrUpdateReceipt
  });
  branchArtifacts = buildBranchArtifacts({
    read,
    readMeasurement: reviewedReadMeasurement,
    readReview,
    benchmarkTarget,
    branchMode,
    branchName,
    depositingSurface,
    readingSurface,
    depositingToReadingSurface,
    matchReport,
    verificationReport,
    evalManifest,
    assetPack,
    assetPackLock,
    selectedSourceMaterialManifest,
    settlementPreview: settlement.settlementPreview,
    settlementProof,
    systemProofBundle,
    authorizationDecisions,
    sensitiveDataFlowRecords,
    policyRelease,
    assetPackEvidenceManifest,
    unitCatalog,
    pipelineTelemetry,
    selectedCandidates,
    journalDiff: settlement.journalDiff,
    identityBindings,
    githubBoundarySurface,
    artifactUploadManifest,
    profileCompositionSurface,
    promptFamilyRegistry,
    promptSurfaces,
    promptContracts,
    inferenceProofs,
    inferenceMomentContracts,
    promptImplementationSurface,
    inferenceSynthesisProof,
    promptCompletenessProof,
    parsedCompletionEnvelopes,
    parsedCompletionEnvelopeArtifact,
    codeAnalysisFactRegistry,
    staticHeuristicsRegistry,
    externalBoundaryManifest,
    measurementReceipts,
    staticMeasurementReport,
    staticMeasurementProof,
    verificationReceiptsArtifact,
    verificationDecisionsProof,
    proofWitnessManifest,
    selectionConsistencyProof,
    selectionAndMaterializationProof,
    identityAuthorizationProof,
    sensitiveDataFlowProof,
    authorizationAndSensitiveFlowProof,
    materializationProof,
    materializationExclusions,
    materializationVisibilityProof: finalizedMaterializationVisibilityProof,
    sourceToSharesArtifact: settlement.sourceToSharesArtifact,
    settlementParticipationArtifact: settlement.settlementParticipationArtifact,
    accountingPrecisionReport: settlement.accountingPrecisionReport,
    journalCompletenessProof,
    settlementSourceToSharesProof,
    scenarioFixtureManifest,
    testCoverageReport,
    projectionPolicy: finalizedProjectionPolicy,
    boundedPublicProof,
    redactionProof: finalizedRedactionProof,
    disclosureProof: finalizedDisclosureProof,
    disclosureBoundaryProof,
    proofContract,
    computeRealityManifest,
    storageRealityManifest,
    bitcoinCommitmentManifest,
    bitcoinTreasuryPolicy,
    bitcoinAnchor,
    bitcoinBoundedPublicAnchor,
    bitcoinSettlementIntent,
    bitcoinSettlementObservation,
    bitcoinAuditAnchorProof,
    bitcoinSettlementInterfaceProof,
    externalEnvironmentProfile,
    externalExecutionPolicy,
    externalTelemetryPolicy,
    externalTelemetrySummary,
    networkCapabilityManifest,
    githubAppBinding,
    bitcoinNetworkIntent,
    bitcoinNetworkExecution,
    bitcoinNetworkObservation,
    repeatedReadPaymentIntent,
    repeatedReadPaymentExecution,
    repeatedReadPaymentObservation,
    sidechainExecutionReceipt,
    computeContainerManifest,
    computeContainerExecution,
    storageContainerManifest,
    storagePublicationReceipt,
    storageRetrievalReceipt,
    githubLiveSession,
    githubInventoryFetchReceipt,
    githubArtifactFetchReceipt,
    githubBranchPublicationReceipt,
    githubPrUpdateReceipt,
    externalRealizationProof,
    containerRealityProof,
    githubLiveInterfaceProof
  });
  assertRequiredBranchArtifacts(branchArtifacts);
  const repoToSettlementSurface = buildRepoToSettlementSurface({
    scenarioId: scenario.scenarioId,
    depositingSurface,
    readingSurface,
    depositingToReadingSurface,
    assetPack,
    branchArtifacts,
    selectedCandidates,
    proofWitnessManifest,
    boundedPublicProof,
    settlementPreview: settlement.settlementPreview
  });
  const identityAuthSpineSurface = buildIdentityAuthSpineSurface({
    buyer: scenarioBoundBuyer,
    branchName,
    selectedCandidates,
    identityBindings,
    authorizationDecisions,
    githubBoundarySurface,
    proofWitnessManifest,
    settlementPreview: settlement.settlementPreview
  });

  const latestRun = {
    createdAt: nowIso(),
    buyer: scenarioBoundBuyer,
    scenarioId: scenario.scenarioId,
    branchMode,
    paymentMode: paymentMode || null,
    conformanceProfile: read.conformanceProfile,
    productionIntentProfile: read.productionIntentProfile,
    realizationProfile: read.realizationProfile,
    readLifecycle: 'settled',
    read,
    depositingSurface,
    readingSurface,
    depositingToReadingSurface,
    readMeasurement: reviewedReadMeasurement,
    readReview,
    benchmarkTarget,
    benchmarkParserContract,
    canonicalBenchmarkOutputs,
    parserValidation,
    inferenceProofs,
    inferenceSynthesisProof,
    promptSurfaces,
    promptContracts,
    promptFamilyRegistry,
    promptCompletenessProof,
    inferenceMomentContracts,
    parsedCompletionEnvelopes,
    parsedCompletionEnvelopeArtifact,
    promptImplementationSurface,
    canonicalRunEvidence: scenario.canonicalRunEvidence,
    evaluatedCandidates: evaluatedCandidates.map((/** @type {any} */ candidate) => ({
      assetId: candidate.assetId,
      title: candidate.asset.title,
      artifactKind: candidate.asset.artifactKind,
      useTier: candidate.useTier,
      recall: candidate.recall,
      ranking: {
        ...candidate.ranking,
        wholeAssetReadScore: Number((/** @type {number} */ (candidate.ranking['wholeAssetReadScore'])).toFixed(4)),
        finalRankingScore: Number(candidate.ranking.finalRankingScore.toFixed(4)),
        readMatch: {
          ...candidate.ranking.readMatch,
          finalScore: Number(candidate.ranking.readMatch.finalScore.toFixed(4))
        },
        benchmarkImpact: {
          ...candidate.ranking.benchmarkImpact,
          finalScore: Number(candidate.ranking.benchmarkImpact.finalScore.toFixed(4))
        },
        actionability: {
          ...candidate.ranking.actionability,
          finalScore: Number(candidate.ranking.actionability.finalScore.toFixed(4))
        }
      },
      verification: candidate.verification,
      rights: useTierRights(candidate.useTier, branchMode),
      measurementProvenance: candidate.measurementProvenance,
      staticExecutionReceipts: candidate.staticExecutionReceipts
    })),
    assetPack,
    matchReport,
    verificationReport,
    evalManifest,
    assetPackLock,
    selectedSourceMaterialManifest,
    identityBindings,
    authorizationDecisions,
    sensitiveDataFlowRecords,
    policyRelease,
    githubBoundarySurface,
    artifactUploadManifest,
    profileCompositionSurface,
    externalBoundaryManifest,
    assetPackEvidenceManifest,
    unitCatalog,
    codeAnalysisFactRegistry,
    staticHeuristicsRegistry,
    measurementReceipts,
    verificationReceipts: verificationReceiptsArtifact,
    staticMeasurementReport,
    staticMeasurementProof,
    verificationDecisionsProof,
    selectionConsistencyProof,
    selectionAndMaterializationProof,
    journalCompletenessProof,
    identityAuthorizationProof,
    sensitiveDataFlowProof,
    authorizationAndSensitiveFlowProof,
    materializationProof,
    materializationExclusions,
    materializationVisibilityProof: finalizedMaterializationVisibilityProof,
    pipelineTelemetry,
    externalEnvironmentProfile,
    externalExecutionPolicy,
    externalTelemetryPolicy,
    externalTelemetrySummary,
    networkCapabilityManifest,
    githubAppBinding,
    bitcoinNetworkIntent,
    bitcoinNetworkExecution,
    bitcoinNetworkObservation,
    repeatedReadPaymentIntent,
    repeatedReadPaymentExecution,
    repeatedReadPaymentObservation,
    sidechainExecutionReceipt,
    computeContainerManifest,
    computeContainerExecution,
    storageContainerManifest,
    storagePublicationReceipt,
    storageRetrievalReceipt,
    githubLiveSession,
    githubInventoryFetchReceipt,
    githubArtifactFetchReceipt,
    githubBranchPublicationReceipt,
    githubPrUpdateReceipt,
    externalRealizationProof,
    containerRealityProof,
    githubLiveInterfaceProof,
    repoToSettlementSurface,
    identityAuthSpineSurface,
    sourceToSharesArtifact: settlement.sourceToSharesArtifact,
    settlementParticipationArtifact: settlement.settlementParticipationArtifact,
    accountingPrecisionReport: settlement.accountingPrecisionReport,
    settlementSourceToSharesProof,
    scenarioFixtureManifest,
    testCoverageReport,
    settlementPreview: settlement.settlementPreview,
    journalDiff: settlement.journalDiff,
    computeRealityManifest,
    storageRealityManifest,
    bitcoinCommitmentManifest,
    bitcoinTreasuryPolicy,
    bitcoinAnchor,
    bitcoinBoundedPublicAnchor,
    bitcoinSettlementIntent,
    bitcoinSettlementObservation,
    bitcoinAuditAnchorProof,
    bitcoinSettlementInterfaceProof,
    externalEnvironmentProfile,
    externalExecutionPolicy,
    externalTelemetryPolicy,
    externalTelemetrySummary,
    networkCapabilityManifest,
    githubAppBinding,
    systemProofBundle,
    proofWitnessManifest,
    proofContract,
    branchArtifacts,
    projectionPolicy: finalizedProjectionPolicy,
    boundedPublicProof,
    redactionProof: finalizedRedactionProof,
    disclosureProof: finalizedDisclosureProof,
    disclosureBoundaryProof
  };

  const nextState = {
    ...state,
    ledger: {
      accounts: settlement.nextLedgerAccounts,
      journalEvents: [...state.ledger.journalEvents, latestRun.journalDiff]
    },
    latestRun,
    runHistory: [...state.runHistory, {
      createdAt: latestRun.createdAt,
      scenarioId: scenario.scenarioId,
      readId: read.readId,
      readLifecycle: latestRun.readLifecycle,
      branchName,
      branchMode,
      paymentMode: latestRun.paymentMode,
      selectedAssets: assetPack.selectedAssets,
      bundleId: settlement.bundleId,
      redactionStatus: boundedPublicProof['redactionStatus']
    }]
  };

  return { nextState, latestRun };
}


/**
 * @param {any} state
 * @param {string} [principal=DEFAULT_PROJECTION_PRINCIPAL]
 * @returns {any}
 */
export function publicState(state, principal = DEFAULT_PROJECTION_PRINCIPAL) {
  return buildDemoPublicStateUnchecked(state, principal, {
    ensureProjectionPrincipal,
    buildRepoSupplySurface,
    buildBoundaryRealitySurface,
    buildPolicyState,
    buildPolicyRelease,
    buildReadDescriptor,
    buildReadingSurface,
    nowIso
  });
}
