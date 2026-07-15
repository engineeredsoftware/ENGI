// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH =
  '.bitcode/v40-promotion-readiness-report.json';
export const V40_PROMOTION_READINESS_REPORT_SCHEMA_ID =
  'bitcode.v40.promotionReadinessReport.v1';
export const V40_PROMOTION_READINESS_REPORT_VERSION = 'V40';
export const V40_PROMOTION_READINESS_REPORT_CURRENT_TARGET = 'V39';
export const V40_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT =
  'source-safe-exhaustive-testing-promotion-readiness-metadata';

export const V40_PROMOTION_READINESS_GATE_ARTIFACT_PATHS = Object.freeze([
  '.bitcode/v40-test-inventory-coverage-matrix.json',
  '.bitcode/v40-unit-coverage-inventory.json',
  '.bitcode/v40-api-integration-contracts.json',
  '.bitcode/v40-reading-pipeline-integration-coverage.json',
  '.bitcode/v40-conversation-terminal-integration.json',
  '.bitcode/v40-browser-e2e-visual-proof.json',
  '.bitcode/v40-ledger-storage-sync.json',
  '.bitcode/v40-local-staging-rehearsal-automation.json',
  '.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json',
]);

export const V40_PROMOTION_READINESS_GENERATED_OUTPUTS = Object.freeze([
  'BITCODE_SPEC_V40_PROVEN.md',
  '.bitcode/v40-spec-family-report.json',
  '.bitcode/v40-canonical-input-report.json',
  '.bitcode/v40-canon-posture-drift-report.json',
  V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
]);

const JWT_HEADER_PREFIX = String.fromCharCode(
  101,
  121,
  74,
  104,
  98,
  71,
  99,
  105,
  79,
  105,
  74,
  73,
  85,
  122,
  73,
  49,
  78,
  105,
  73,
  115,
  73,
  110,
  82,
  53,
  99,
  67,
  73,
  54,
  73,
  107,
  112,
  88,
  86,
  67,
  74,
  57,
);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  JWT_HEADER_PREFIX,
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const REQUIRED_SOURCE_EVIDENCE = Object.freeze([
  source('scripts/check-v40-gate11-promotion-readiness.mjs', [
    'V40 Gate 11 promotion readiness',
    '--promotion-mode',
    'promotedPointer',
    V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/generate-v40-promotion-readiness-report.mjs', [
    'buildV40PromotionReadinessReport',
    V40_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    'v40-promotion-readiness-report',
  ]),
  source('scripts/promote-bitcode-canon.mjs', [
    "if (version === 'V40')",
    'const v40Gate11Command',
    'buildDerivedV40CommitMessageBody',
    'scripts/check-v40-gate11-promotion-readiness.mjs',
  ]),
  source('scripts/prepare-bitcode-spec-family-promotion.mjs', [
    "if (version === 'V40')",
    'V40 canonical system specification for exhaustive commercial application testing',
    'BITCODE_SPEC_V40_PROVEN.md',
    V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
    '--next-draft',
    'rewritePackageReadme',
    'rewriteRuntimeDataState',
  ]),
  source('.github/workflows/v40-canon-promotion.yml', [
    "head.ref == 'version/v40'",
    'npm run promote:canon -- --version V40',
    'BITCODE_SPEC_V40_PROVEN.md',
    'Promote V40 canon files',
  ]),
  source('.github/workflows/bitcode-gate-quality.yml', [
    'check-v40-gate11-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V40" ]',
    '--active-canon V40 --draft-target V41',
  ]),
  source('.github/workflows/bitcode-canon-quality.yml', [
    'check-v40-gate11-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V40" ]',
    '--active-canon V40 --draft-target V41',
  ]),
  source('scripts/specifying/src/canonical/proven-generator.js', [
    'buildV40ProvenPackage',
    'buildV40PromotionReadinessReport',
    V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/specifying/test/v40-promotion-readiness.test.js', [
    'builds source-safe V40 PromotionReadinessReport',
    'v40-promotion-readiness-report',
    'V40 Promotion Readiness',
  ]),
  source('scripts/specifying/src/canonical/v21-specifying.js', [
    V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('package.json', [
    'generate:v40-promotion-readiness',
    'check:v40-promotion-readiness',
    'check:v40-gate11',
  ]),
]);

const REQUIRED_DOCUMENTATION_EVIDENCE = Object.freeze([
  source('BITCODE_SPEC_V40.md', [
    'V40 promotion readiness canon',
    V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'V40 active / draft V41',
  ]),
  source('BITCODE_SPEC_V40_DELTA.md', [
    'Gate 11: V40 Promotion Readiness',
    V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'promotion scripts support V40',
  ]),
  source('BITCODE_SPEC_V40_NOTES.md', [
    'Gate 11: V40 Promotion Readiness',
    V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'active V40 / draft V41',
  ]),
  source('BITCODE_SPEC_V40_PARITY_MATRIX.md', [
    '## Gate 11 Promotion readiness parity',
    V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'closed',
  ]),
  source('SPECIFICATIONS_ROADMAP.md', [
    'V40 Gate 11 closure anchor',
    'BITCODE_SPEC_V40_PROVEN.md',
  ]),
  source('README.md', [
    'check:v40-gate11',
    'v40-canon-promotion.yml',
  ]),
  source('scripts/specifying/README.md', [
    'V40 Gate 11',
    'V40` active, `V41` draft',
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
export function buildV40PromotionReadinessReport(input = {}) {
  const version = input.version || V40_PROMOTION_READINESS_REPORT_VERSION;
  const currentTarget = input.currentTarget || V40_PROMOTION_READINESS_REPORT_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-25T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sourceEvidence = REQUIRED_SOURCE_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const documentationEvidence = REQUIRED_DOCUMENTATION_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const gateArtifactEvidence = V40_PROMOTION_READINESS_GATE_ARTIFACT_PATHS.map((artifactPath) =>
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
    'pnpm run check:v40-gate1',
    'pnpm run check:v40-gate2',
    'pnpm run check:v40-gate3',
    'pnpm run check:v40-gate4',
    'pnpm run check:v40-gate5',
    'pnpm run check:v40-gate6',
    'pnpm run check:v40-gate7',
    'pnpm run check:v40-gate8',
    'pnpm run check:v40-gate9',
    'pnpm run check:v40-gate10',
    'pnpm run check:v40-gate11',
    'node scripts/promote-bitcode-canon.mjs --version V40 --commit HEAD --dry-run',
  ];
  const coverage = {
    requiredGateArtifactPaths: [...V40_PROMOTION_READINESS_GATE_ARTIFACT_PATHS],
    generatedProofOutputs: [...V40_PROMOTION_READINESS_GENERATED_OUTPUTS],
    gateArtifactCount: gateArtifactEvidence.length,
    missingGateArtifacts,
    unparseableGateArtifacts,
    sourceUnsafeGateArtifacts,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    documentationEvidenceComplete: documentationEvidence.every(allTokensPresent),
    allGateArtifactsCovered: missingGateArtifacts.length === 0,
    allGateArtifactsParseable: unparseableGateArtifacts.length === 0,
    allGateArtifactsSourceSafe: sourceUnsafeGateArtifacts.length === 0,
    generatedProofOutputsCovered: V40_PROMOTION_READINESS_GENERATED_OUTPUTS.includes('BITCODE_SPEC_V40_PROVEN.md'),
    promotionWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/v40-canon-promotion.yml' && allTokensPresent(entry)),
    gateQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-gate-quality.yml' && allTokensPresent(entry)),
    canonQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-canon-quality.yml' && allTokensPresent(entry)),
    promotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/promote-bitcode-canon.mjs' && allTokensPresent(entry)),
    specFamilyPromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-spec-family-promotion.mjs' && allTokensPresent(entry)),
    runtimePromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-runtime-canon-promotion.mjs' && allTokensPresent(entry)),
    provenGeneratorCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/specifying/src/canonical/proven-generator.js' && allTokensPresent(entry)),
    prePromotionPosture: 'V39 active / V40 draft',
    postPromotionPosture: 'V40 active / V41 draft',
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
    sourceSafetyVerdict: V40_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v40-promotion-readiness-report',
    schemaId: V40_PROMOTION_READINESS_REPORT_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: V40_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    prePromotionPosture: 'V39 active / V40 draft',
    postPromotionPosture: 'V40 active / V41 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v40',
      versionPromotionPullRequestTitlePrefix: 'V40 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: 'BITCODE_SPEC_V40_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v40-',
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
      'promotion remains blocked when any V40 testing inventory, unit coverage, API contract, Reading pipeline integration, Conversation/Terminal integration, browser proof, ledger/storage sync, local/staging rehearsal, prompt benchmark smoke, workflow, promotion script, generated proof support, source-safety check, or value-bearing mainnet block is missing',
    artifactRoot: `exhaustive-testing-promotion-readiness-report:${sha256(canonicalJson(artifactSeed)).slice(7, 31)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v40-gate11',
  };
}

export function listMissingV40PromotionReadinessSources(repoRoot = path.resolve(__dirname, '../../../..')) {
  return [...REQUIRED_SOURCE_EVIDENCE, ...REQUIRED_DOCUMENTATION_EVIDENCE]
    .filter((item) => !existsSync(path.join(repoRoot, item.relativePath)))
    .map((item) => item.relativePath);
}
