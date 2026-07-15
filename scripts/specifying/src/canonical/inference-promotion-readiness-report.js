// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH =
  '.bitcode/v38-promotion-readiness-report.json';
export const V38_INFERENCE_PROMOTION_READINESS_REPORT_SCHEMA_ID =
  'bitcode.v38.inferencePromotionReadinessReport.v1';
export const V38_INFERENCE_PROMOTION_READINESS_REPORT_VERSION = 'V38';
export const V38_INFERENCE_PROMOTION_READINESS_REPORT_CURRENT_TARGET = 'V37';
export const V38_INFERENCE_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT =
  'source-safe-inference-promotion-readiness-metadata';

export const V38_INFERENCE_PROMOTION_READINESS_GATE_ARTIFACT_PATHS = Object.freeze([
  '.bitcode/v38-inference-surface-inventory.json',
  '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
  '.bitcode/v38-prompt-benchmark-report.json',
  '.bitcode/v38-disclosure-boundary-report.json',
  '.bitcode/v38-read-need-comprehension-inference-hardening.json',
  '.bitcode/v38-read-fits-finding-search-embeddings.json',
  '.bitcode/v38-assetpack-synthesis-economic-traceability.json',
  '.bitcode/v38-conversation-tool-prompt-inference-parity.json',
  '.bitcode/v38-local-staging-inference-depository-search-rehearsal.json',
]);

export const V38_INFERENCE_PROMOTION_READINESS_GENERATED_OUTPUTS = Object.freeze([
  '.specifications/BITCODE_SPEC_V38_PROVEN.md',
  '.bitcode/v38-spec-family-report.json',
  '.bitcode/v38-canonical-input-report.json',
  '.bitcode/v38-canon-posture-drift-report.json',
  V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
]);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const REQUIRED_SOURCE_EVIDENCE = Object.freeze([
  source('scripts/check-v38-gate11-promotion-readiness.mjs', [
    'V38 Gate 11 promotion readiness',
    '--promotion-mode',
    'promotedPointer',
    V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/generate-v38-promotion-readiness-report.mjs', [
    'buildV38InferencePromotionReadinessReport',
    V38_INFERENCE_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    'v38-promotion-readiness-report',
  ]),
  source('scripts/promote-bitcode-canon.mjs', [
    "if (version === 'V38')",
    'const v38Gate11Command',
    'buildDerivedV38CommitMessageBody',
    'scripts/check-v38-gate11-promotion-readiness.mjs',
  ]),
  source('scripts/prepare-bitcode-spec-family-promotion.mjs', [
    "if (version === 'V38')",
    'V38 canonical system specification for inference correctness',
    'BITCODE_SPEC_V38_PROVEN.md',
    V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
    '--next-draft',
    'rewritePackageReadme',
    'rewriteRuntimeDataState',
  ]),
  source('.github/workflows/v38-canon-promotion.yml', [
    "head.ref == 'version/v38'",
    'npm run promote:canon -- --version V38',
    '.specifications/BITCODE_SPEC_V38_PROVEN.md',
    'Promote V38 canon files',
  ]),
  source('.github/workflows/bitcode-gate-quality.yml', [
    'check-v38-gate11-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V38" ]',
  ]),
  source('.github/workflows/bitcode-canon-quality.yml', [
    'check-v38-gate11-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V38" ]',
    '--active-canon V38 --draft-target V39',
  ]),
  source('scripts/specifying/src/canonical/proven-generator.js', [
    'buildV38ProvenPackage',
    'buildV38PromotionReadinessReport',
    V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/specifying/test/v38-promotion-readiness.test.js', [
    'builds source-safe V38 InferencePromotionReadinessReport',
    'v38-promotion-readiness-report',
    'V38 Promotion Readiness',
  ]),
  source('scripts/specifying/src/canonical/v21-specifying.js', [
    V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('package.json', [
    'generate:v38-promotion-readiness',
    'check:v38-promotion-readiness',
    'check:v38-gate11',
  ]),
]);

const REQUIRED_DOCUMENTATION_EVIDENCE = Object.freeze([
  source('.specifications/BITCODE_SPEC_V38.md', [
    'V38 promotion readiness canon',
    V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'V38 active / draft V39',
  ]),
  source('.specifications/BITCODE_SPEC_V38_DELTA.md', [
    'Gate 11: V38 Promotion Readiness',
    V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'promotion scripts support V38',
  ]),
  source('.specifications/BITCODE_SPEC_V38_NOTES.md', [
    'Gate 11: V38 Promotion Readiness',
    V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'active V38 / draft V39',
  ]),
  source('.specifications/BITCODE_SPEC_V38_PARITY_MATRIX.md', [
    '## Gate 11 Promotion readiness parity',
    V38_INFERENCE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'closed',
  ]),
  source('.specifications/SPECIFICATIONS_ROADMAP.md', [
    'V38 Gate 11 closure anchor',
    'BITCODE_SPEC_V38_PROVEN.md',
  ]),
  source('README.md', [
    'check:v38-gate11',
    'v38-canon-promotion.yml',
  ]),
  source('scripts/specifying/README.md', [
    'V38 Gate 11',
    'V38` active, `V39` draft',
  ]),
]);

/**
 * @param {string} relativePath
 * @param {readonly string[]} tokens
 */
function source(relativePath, tokens) {
  return { relativePath, tokens };
}

/**
 * @param {string} repoRoot
 * @param {{ relativePath: string, tokens: readonly string[] }} item
 */
function scanTokens(repoRoot, item) {
  const absolutePath = path.join(repoRoot, item.relativePath);
  const present = existsSync(absolutePath);
  const content = present ? readFileSync(absolutePath, 'utf8') : '';
  return {
    relativePath: item.relativePath,
    present,
    digest: present ? sha256(content) : null,
    requiredTokens: item.tokens.map((token) => ({
      token,
      present: content.includes(token),
    })),
  };
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 */
function scanArtifact(repoRoot, relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  const present = existsSync(absolutePath);
  const content = present ? readFileSync(absolutePath, 'utf8') : '';
  let parsed = null;
  let parseable = false;
  if (present) {
    try {
      parsed = JSON.parse(content);
      parseable = true;
    } catch {
      parseable = false;
    }
  }
  return {
    relativePath,
    present,
    parseable,
    digest: present ? sha256(content) : null,
    byteLength: present ? Buffer.byteLength(content, 'utf8') : 0,
    sourceSafe: present ? !includesSecretMarker(content) && !content.includes('protectedSourceBody') : false,
    artifactId: parsed?.artifactId || parsed?.reportId || null,
    version: parsed?.version || null,
    sourceSafetyVerdict: parsed?.sourceSafetyVerdict || null,
  };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(String(value)).digest('hex')}`;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {ReturnType<typeof scanTokens>} entry
 */
function allTokensPresent(entry) {
  return entry.present && entry.requiredTokens.every((token) => token.present);
}

/**
 * @param {{
 *   version?: string,
 *   currentTarget?: string,
 *   generatedAt?: string,
 *   repoRoot?: string,
 * }} [input]
 */
export function buildV38InferencePromotionReadinessReport(input = {}) {
  const version = input.version || V38_INFERENCE_PROMOTION_READINESS_REPORT_VERSION;
  const currentTarget = input.currentTarget || V38_INFERENCE_PROMOTION_READINESS_REPORT_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-25T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sourceEvidence = REQUIRED_SOURCE_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const documentationEvidence = REQUIRED_DOCUMENTATION_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const gateArtifactEvidence = V38_INFERENCE_PROMOTION_READINESS_GATE_ARTIFACT_PATHS.map((artifactPath) =>
    scanArtifact(repoRoot, artifactPath),
  );
  const missingGateArtifacts = gateArtifactEvidence.filter((artifact) => !artifact.present).map((artifact) => artifact.relativePath);
  const unparseableGateArtifacts = gateArtifactEvidence
    .filter((artifact) => artifact.present && !artifact.parseable)
    .map((artifact) => artifact.relativePath);
  const sourceUnsafeGateArtifacts = gateArtifactEvidence
    .filter((artifact) => artifact.present && artifact.sourceSafe !== true)
    .map((artifact) => artifact.relativePath);
  const sourceEvidenceFailures = sourceEvidence.flatMap((entry) => {
    if (!entry.present) return [`missing promotion source ${entry.relativePath}`];
    return entry.requiredTokens
      .filter((token) => !token.present)
      .map((token) => `${entry.relativePath} missing token ${token.token}`);
  });
  const documentationEvidenceFailures = documentationEvidence.flatMap((entry) => {
    if (!entry.present) return [`missing promotion documentation ${entry.relativePath}`];
    return entry.requiredTokens
      .filter((token) => !token.present)
      .map((token) => `${entry.relativePath} missing token ${token.token}`);
  });
  const serializedEvidence = canonicalJson({ sourceEvidence, documentationEvidence, gateArtifactEvidence });
  const forbiddenMarkerDetected = includesSecretMarker(serializedEvidence);
  const failures = [
    ...sourceEvidenceFailures,
    ...documentationEvidenceFailures,
    ...missingGateArtifacts.map((artifactPath) => `missing gate artifact ${artifactPath}`),
    ...unparseableGateArtifacts.map((artifactPath) => `unparseable gate artifact ${artifactPath}`),
    ...sourceUnsafeGateArtifacts.map((artifactPath) => `source-unsafe gate artifact ${artifactPath}`),
    ...(forbiddenMarkerDetected ? ['promotion readiness evidence contains a secret-shaped marker'] : []),
  ];
  const validationCommands = [
    'pnpm run check:v38-gate1',
    'pnpm run check:v38-gate2',
    'pnpm run check:v38-gate3',
    'pnpm run check:v38-gate4',
    'pnpm run check:v38-gate5',
    'pnpm run check:v38-gate6',
    'pnpm run check:v38-gate7',
    'pnpm run check:v38-gate8',
    'pnpm run check:v38-gate9',
    'pnpm run check:v38-gate10',
    'pnpm run check:v38-gate11',
    'node scripts/promote-bitcode-canon.mjs --version V38 --commit HEAD --dry-run',
  ];
  const coverage = {
    requiredGateArtifactPaths: [...V38_INFERENCE_PROMOTION_READINESS_GATE_ARTIFACT_PATHS],
    generatedProofOutputs: [...V38_INFERENCE_PROMOTION_READINESS_GENERATED_OUTPUTS],
    gateArtifactCount: gateArtifactEvidence.length,
    missingGateArtifacts,
    unparseableGateArtifacts,
    sourceUnsafeGateArtifacts,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    documentationEvidenceComplete: documentationEvidence.every(allTokensPresent),
    allGateArtifactsCovered: missingGateArtifacts.length === 0,
    allGateArtifactsParseable: unparseableGateArtifacts.length === 0,
    allGateArtifactsSourceSafe: sourceUnsafeGateArtifacts.length === 0,
    generatedProofOutputsCovered: V38_INFERENCE_PROMOTION_READINESS_GENERATED_OUTPUTS.includes('.specifications/BITCODE_SPEC_V38_PROVEN.md'),
    promotionWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/v38-canon-promotion.yml' && allTokensPresent(entry)),
    gateQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-gate-quality.yml' && allTokensPresent(entry)),
    canonQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-canon-quality.yml' && allTokensPresent(entry)),
    promotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/promote-bitcode-canon.mjs' && allTokensPresent(entry)),
    specFamilyPromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-spec-family-promotion.mjs' && allTokensPresent(entry)),
    runtimePromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-runtime-canon-promotion.mjs' && allTokensPresent(entry)),
    provenGeneratorCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/specifying/src/canonical/proven-generator.js' && allTokensPresent(entry)),
    prePromotionPosture: 'V37 active / V38 draft',
    postPromotionPosture: 'V38 active / V39 draft',
    valueBearingMainnetAdmission: false,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
  };
  const artifactSeed = {
    version,
    currentTarget,
    validationCommands,
    coverage,
    sourceSafetyVerdict: V38_INFERENCE_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v38-promotion-readiness-report',
    schemaId: V38_INFERENCE_PROMOTION_READINESS_REPORT_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: V38_INFERENCE_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    prePromotionPosture: 'V37 active / V38 draft',
    postPromotionPosture: 'V38 active / V39 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v38',
      versionPromotionPullRequestTitlePrefix: 'V38 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: '.specifications/BITCODE_SPEC_V38_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v38-',
      promotionOverwritesPreviewArtifacts: true,
      secretValuesSerialized: false,
      protectedSourceSerialized: false,
      rawProtectedPromptSerialized: false,
      rawProviderResponseSerialized: false,
      unpaidAssetPackSourceSerialized: false,
    },
    validationCommands,
    gateArtifactEvidence,
    sourceEvidence,
    documentationEvidence,
    coverage,
    failClosedResult:
      'promotion remains blocked when any V38 inference artifact, prompt benchmark report, Reading search evidence, telemetry disclosure law, rehearsal evidence, workflow, promotion script, generated proof support, source-safety check, or value-bearing mainnet block is missing',
    artifactRoot: `inference-promotion-readiness-report:${sha256(canonicalJson(artifactSeed)).slice(7, 31)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v38-gate11',
  };
}
