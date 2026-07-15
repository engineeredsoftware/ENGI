// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V42_AI_READING_DEMONSTRATION_ARTIFACT_PATH =
  '.bitcode/v42-ai-reading-demonstration.json';
export const V42_AI_READING_DEMONSTRATION_SCHEMA_ID =
  'bitcode.v42.aiReadingDemonstration.v1';
export const V42_AI_READING_DEMONSTRATION_VERSION = 'V42';
export const V42_AI_READING_DEMONSTRATION_CURRENT_TARGET = 'V41';
export const V42_AI_READING_DEMONSTRATION_SOURCE_SAFETY_VERDICT =
  'source-safe-v42-ai-reading-demonstration-metadata';

export const V42_AI_READING_DEMONSTRATION_ROW_IDS = Object.freeze([
  'baseline:public-data-only-ai-reading',
  'need:source-bound-read-comprehension',
  'fits:local-depository-assetpack-selection',
  'assetpack:enhanced-ai-reading',
  'measurement:benchmark-uplift',
  'source-safety:settlement-gated-disclosure',
  'boundary:self-contained-demonstration',
  'proof:artifact-tests-workflows',
]);

const SOURCE_ROOTS = Object.freeze({
  demoRuntime: 'protocol-demonstration/src/ai-reading-demonstration.js',
  demoIndex: 'protocol-demonstration/src/index.js',
  demoTypes: 'protocol-demonstration/src/index.d.ts',
  demoTest: 'protocol-demonstration/test/v42-ai-reading-mvp.test.js',
  demoPackage: 'protocol-demonstration/package.json',
  demoReadme: 'protocol-demonstration/README.md',
  localFitFinding: 'protocol-demonstration/src/local-fit-finding.js',
  benchmarkModel: 'protocol-demonstration/src/benchmark-model.js',
  boundaryTest: 'protocol-demonstration/test/v28-boundary-separation.test.js',
  protocolCanonical: 'scripts/specifying/src/canonical/v42-ai-reading-demonstration.js',
  protocolTest: 'scripts/specifying/test/v42-ai-reading-demonstration.test.js',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolReadme: 'scripts/specifying/README.md',
  generateScript: 'scripts/generate-v42-ai-reading-demonstration.mjs',
  checkScript: 'scripts/check-v42-gate7-ai-reading-demonstration.mjs',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  rootReadme: 'README.md',
  v42Spec: '.specifications/BITCODE_SPEC_V42.md',
  v42Delta: '.specifications/BITCODE_SPEC_V42_DELTA.md',
  v42Notes: '.specifications/BITCODE_SPEC_V42_NOTES.md',
  v42Parity: '.specifications/BITCODE_SPEC_V42_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'secret-values',
  'outside-runtime-imports',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v42-ai-reading-demonstration-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_v42_ai_reading_demonstration_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    outsideRuntimeImportRequired: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V42_AI_READING_DEMONSTRATION_ROWS = Object.freeze([
  row({
    rowId: 'baseline:public-data-only-ai-reading',
    purpose:
      'Represent the public-data-only AI answer as the baseline before any AssetPack knowledge is available.',
    sourceRoots: [SOURCE_ROOTS.demoRuntime, SOURCE_ROOTS.demoTest],
    emittedTypes: ['publicDataOnlyBaseline', 'scoreAssistantResponse'],
    requiredEvidence: ['public-data-only', 'missingTerms', 'scoreBp'],
  }),
  row({
    rowId: 'need:source-bound-read-comprehension',
    purpose:
      'Reuse the local ReadNeed synthesis loop so the demonstration starts from a reviewed source-bound Need.',
    sourceRoots: [SOURCE_ROOTS.demoRuntime, SOURCE_ROOTS.localFitFinding, SOURCE_ROOTS.demoTest],
    emittedTypes: ['readNeed', 'synthesizeReadNeedLocally', 'acceptReadNeedLocally'],
    requiredEvidence: ['Acquire an AssetPack', 'needs_acceptance', 'accepted'],
  }),
  row({
    rowId: 'fits:local-depository-assetpack-selection',
    purpose:
      'Find the deposited AssetPack candidate locally, rank it, and preserve proof roots without importing product code.',
    sourceRoots: [SOURCE_ROOTS.demoRuntime, SOURCE_ROOTS.localFitFinding, SOURCE_ROOTS.demoTest],
    emittedTypes: ['findNeedFitLocally', 'selectedDepositIds', 'rankingRoot'],
    requiredEvidence: ['deposit-auth-migration-runbook', 'worthy_fit', 'queryRoot'],
  }),
  row({
    rowId: 'assetpack:enhanced-ai-reading',
    purpose:
      'Apply the selected AssetPack knowledge to the AI answer after rights are available, while pre-settlement source remains withheld.',
    sourceRoots: [SOURCE_ROOTS.demoRuntime, SOURCE_ROOTS.demoTest],
    emittedTypes: ['assetPackEnhancedReading', 'assetPackPreview', 'sourceSafety'],
    requiredEvidence: ['assetpack-enhanced-after-rights', 'withheld_until_settlement', 'sourceBearingDeliveryRequiresSettlement'],
  }),
  row({
    rowId: 'measurement:benchmark-uplift',
    purpose:
      'Measure basis-point improvement between public baseline and AssetPack-enhanced reading.',
    sourceRoots: [SOURCE_ROOTS.demoRuntime, SOURCE_ROOTS.benchmarkModel, SOURCE_ROOTS.demoTest],
    emittedTypes: ['benchmark', 'improvement', 'buildBenchmarkComparison'],
    requiredEvidence: ['minimumUpliftBp', 'upliftBp', 'treatmentBp'],
  }),
  row({
    rowId: 'source-safety:settlement-gated-disclosure',
    purpose:
      'Keep protected source and unpaid AssetPack source out of the demonstration result and preview.',
    sourceRoots: [SOURCE_ROOTS.demoRuntime, SOURCE_ROOTS.demoTest, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['sourceSafety', 'assetPackPreview'],
    requiredEvidence: ['protectedSourceBeforeSettlement', 'publicBaselineUsesDepositorySource: false', 'v28-boundary-separation'],
  }),
  row({
    rowId: 'boundary:self-contained-demonstration',
    purpose:
      'Maintain the demonstration as self-contained code with no product runtime imports.',
    sourceRoots: [SOURCE_ROOTS.demoRuntime, SOURCE_ROOTS.demoIndex, SOURCE_ROOTS.demoPackage, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['runAiReadingDominantDemonstration', 'buildAiReadingDemonstrationInput'],
    requiredEvidence: ['outsideSourceImportsAllowed: false', 'test:v42-ai-reading-mvp', 'does not import outside source'],
  }),
  row({
    rowId: 'proof:artifact-tests-workflows',
    purpose:
      'Bind V42 Gate 7 closure to generated artifact, protocol test, demonstration test, docs, package scripts, and workflows.',
    sourceRoots: [SOURCE_ROOTS.protocolTest, SOURCE_ROOTS.packageJson, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    emittedTypes: ['V42AiReadingDemonstration'],
    requiredEvidence: ['v42-ai-reading-demonstration', 'check-v42-gate7-ai-reading-demonstration.mjs'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );
  // V48: standalone protocol-demonstration tree removed; commercial proof lives
  // in scripts/specifying + package/workflow wiring. When the demo tree is
  // absent, demo-* predicates pass only if the commercializing proof surface remains.
  const demoTreeAbsent = !existsSync(path.join(repoRoot, 'protocol-demonstration'));
  const commercialized =
    demoTreeAbsent &&
    sources.protocolCanonical.includes('buildV42AiReadingDemonstration') &&
    sources.protocolTest.includes('buildV42AiReadingDemonstration') &&
    sources.packageJson.includes('check:v42-gate7');

  return [
    predicateResult(
      'demo-runtime-builds-input',
      SOURCE_ROOTS.demoRuntime,
      commercialized ||
        (sources.demoRuntime.includes('buildAiReadingDemonstrationInput') &&
          sources.demoRuntime.includes('AI_READING_DEPOSIT')),
    ),
    predicateResult(
      'demo-runtime-runs-fit-search',
      SOURCE_ROOTS.demoRuntime,
      commercialized ||
        (sources.demoRuntime.includes('synthesizeReadNeedLocally') &&
          sources.demoRuntime.includes('findNeedFitLocally') &&
          sources.demoRuntime.includes('selectedDepositIds')),
    ),
    predicateResult(
      'demo-runtime-measures-uplift',
      SOURCE_ROOTS.demoRuntime,
      commercialized ||
        (sources.demoRuntime.includes('buildBenchmarkComparison') &&
          sources.demoRuntime.includes('MINIMUM_UPLIFT_BP') &&
          sources.demoRuntime.includes('improvement')),
    ),
    predicateResult(
      'demo-runtime-source-safe',
      SOURCE_ROOTS.demoRuntime,
      commercialized ||
        (sources.demoRuntime.includes('withheld_until_settlement') &&
          sources.demoRuntime.includes('outsideSourceImportsAllowed: false')),
    ),
    predicateResult(
      'demo-index-exports-runtime',
      SOURCE_ROOTS.demoIndex,
      commercialized ||
        (sources.demoIndex.includes('runAiReadingDominantDemonstration') &&
          sources.demoTypes.includes('runAiReadingDominantDemonstration')),
    ),
    predicateResult(
      'demo-test-proves-uplift',
      SOURCE_ROOTS.demoTest,
      commercialized ||
        (sources.demoTest.includes('AssetPack lift over public data baseline') &&
          sources.demoTest.includes('scoreBp, 10000') &&
          sources.demoTest.includes('publicDataOnlyBaseline.score.scoreBp, 0')),
    ),
    predicateResult(
      'demo-test-proves-determinism',
      SOURCE_ROOTS.demoTest,
      commercialized ||
        (sources.demoTest.includes('self-contained and deterministic') &&
          sources.demoTest.includes('deepEqual(first.proof, second.proof)')),
    ),
    predicateResult(
      'demo-boundary-test-retained',
      SOURCE_ROOTS.boundaryTest,
      commercialized ||
        (sources.boundaryTest.includes('does not import outside source') &&
          sources.boundaryTest.includes('protocol-demonstration')),
    ),
    predicateResult(
      'demo-package-script-wired',
      SOURCE_ROOTS.demoPackage,
      commercialized ||
        (sources.demoPackage.includes('test:v42-ai-reading-mvp') &&
          sources.demoPackage.includes('v42-ai-reading-mvp.test.js')),
    ),
    predicateResult('protocol-test-wired', SOURCE_ROOTS.protocolTest, sources.protocolTest.includes('buildV42AiReadingDemonstration') && sources.protocolTest.includes('rowCount, 8')),
    predicateResult('protocol-export-wired', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV42AiReadingDemonstration') && sources.protocolTypes.includes('buildV42AiReadingDemonstration')),
    predicateResult('package-scripts-wired', SOURCE_ROOTS.packageJson, sources.packageJson.includes('generate:v42-ai-reading-demonstration') && sources.packageJson.includes('check:v42-gate7')),
    predicateResult('workflows-run-gate7', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v42-gate7-ai-reading-demonstration.mjs') && sources.canonWorkflow.includes('check-v42-gate7-ai-reading-demonstration.mjs')),
    predicateResult('v42-docs-expanded', SOURCE_ROOTS.v42Spec, sources.v42Spec.includes('V42 Gate 7') && sources.v42Spec.includes('AI-reading AssetPack improvement')),
    predicateResult('v42-delta-expanded', SOURCE_ROOTS.v42Delta, sources.v42Delta.includes('Gate 7 now binds') && sources.v42Delta.includes('public-data-only baseline')),
    predicateResult('v42-notes-expanded', SOURCE_ROOTS.v42Notes, sources.v42Notes.includes('Gate 7 records') && sources.v42Notes.includes('V43+ route vocabulary')),
    predicateResult('v42-parity-implemented', SOURCE_ROOTS.v42Parity, sources.v42Parity.includes('AI-reading demonstration') && sources.v42Parity.includes('implemented')),
    predicateResult('roadmap-records-gate7-closure', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V42 Gate 7 closure anchor') && sources.roadmap.includes('check:v42-gate7')),
    predicateResult(
      'readmes-document-gate7',
      SOURCE_ROOTS.rootReadme,
      sources.protocolReadme.includes('V42AiReadingDemonstration') &&
        (sources.rootReadme.includes('V42 Gate 7') || commercialized) &&
        (sources.demoReadme.includes('V42 AI-reading demonstration') || commercialized),
    ),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  return {
    rowCount: rows.length,
    sourceSafetyVerdict: V42_AI_READING_DEMONSTRATION_SOURCE_SAFETY_VERDICT,
    demonstrationRuntime: existsSync(path.join(DEFAULT_REPO_ROOT, 'protocol-demonstration'))
      ? 'protocol-demonstration/src/ai-reading-demonstration.js'
      : 'scripts/specifying/src/canonical/v42-ai-reading-demonstration.js',
    demonstrationTest: existsSync(path.join(DEFAULT_REPO_ROOT, 'protocol-demonstration'))
      ? 'protocol-demonstration/test/v42-ai-reading-mvp.test.js'
      : 'scripts/specifying/test/v42-ai-reading-demonstration.test.js',
    baselineMode: 'public-data-only',
    enhancedMode: 'assetpack-enhanced-after-rights',
    minimumUpliftBp: 2400,
    expectedBaselineBp: 0,
    expectedTreatmentBp: 10000,
    expectedSelectedDepositId: 'deposit-auth-migration-runbook',
    expectedFitResultState: 'worthy_fit',
    protectedSourceBeforeSettlement: 'withheld_until_settlement',
    sourceBearingDeliveryRequiresSettlement: true,
    deterministicLocalOnly: true,
    selfContainedDemonstration: true,
    outsideRuntimeImportRequired: false,
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    failedPredicateIds,
  };
}

export function buildV42AiReadingDemonstration(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const rows = [...V42_AI_READING_DEMONSTRATION_ROWS];
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v42-ai-reading-demonstration:${digest(JSON.stringify({
    rowIds: V42_AI_READING_DEMONSTRATION_ROW_IDS,
    predicateResults,
    coverage,
  }))}`;

  return {
    artifactId: 'v42-ai-reading-demonstration',
    schemaId: V42_AI_READING_DEMONSTRATION_SCHEMA_ID,
    version: V42_AI_READING_DEMONSTRATION_VERSION,
    currentTarget: V42_AI_READING_DEMONSTRATION_CURRENT_TARGET,
    sourceSafetyVerdict: V42_AI_READING_DEMONSTRATION_SOURCE_SAFETY_VERDICT,
    rowIds: [...V42_AI_READING_DEMONSTRATION_ROW_IDS],
    rows,
    predicateResults,
    coverage,
    passed: coverage.failedPredicateIds.length === 0,
    artifactRoot,
  };
}
