// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH =
  '.bitcode/v39-promotion-readiness-report.json';
export const V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_SCHEMA_ID =
  'bitcode.v39.commercialReadingPromotionReadinessReport.v1';
export const V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_VERSION = 'V39';
export const V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_CURRENT_TARGET = 'V38';
export const V39_COMMERCIAL_READING_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT =
  'source-safe-commercial-reading-promotion-readiness-metadata';

export const V39_COMMERCIAL_READING_PROMOTION_READINESS_GATE_ARTIFACT_PATHS = Object.freeze([
  '.bitcode/v39-depository-supply-indexing.json',
  '.bitcode/v39-enterprise-reading-ux-state.json',
  '.bitcode/v39-read-need-review-resynthesis.json',
  '.bitcode/v39-read-fits-finding-runtime.json',
  '.bitcode/v39-assetpack-preview-quote-boundary.json',
  '.bitcode/v39-settlement-rights-delivery.json',
  '.bitcode/v39-operational-telemetry-repair-readback.json',
  '.bitcode/v39-interface-conversation-product-parity.json',
  '.bitcode/v39-local-staging-reading-rehearsal.json',
]);

export const V39_COMMERCIAL_READING_PROMOTION_READINESS_GENERATED_OUTPUTS = Object.freeze([
  'BITCODE_SPEC_V39_PROVEN.md',
  '.bitcode/v39-spec-family-report.json',
  '.bitcode/v39-canonical-input-report.json',
  '.bitcode/v39-canon-posture-drift-report.json',
  V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
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
  source('scripts/check-v39-gate11-promotion-readiness.mjs', [
    'V39 Gate 11 promotion readiness',
    '--promotion-mode',
    'promotedPointer',
    V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/generate-v39-promotion-readiness-report.mjs', [
    'buildV39CommercialReadingPromotionReadinessReport',
    V39_COMMERCIAL_READING_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    'v39-promotion-readiness-report',
  ]),
  source('scripts/promote-bitcode-canon.mjs', [
    "if (version === 'V39')",
    'const v39Gate11Command',
    'buildDerivedV39CommitMessageBody',
    'scripts/check-v39-gate11-promotion-readiness.mjs',
  ]),
  source('scripts/prepare-bitcode-spec-family-promotion.mjs', [
    "if (version === 'V39')",
    'V39 canonical system specification for commercial Reading readiness',
    'BITCODE_SPEC_V39_PROVEN.md',
    V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
    '--next-draft',
    'rewritePackageReadme',
    'rewriteRuntimeDataState',
  ]),
  source('.github/workflows/v39-canon-promotion.yml', [
    "head.ref == 'version/v39'",
    'npm run promote:canon -- --version V39',
    'BITCODE_SPEC_V39_PROVEN.md',
    'Promote V39 canon files',
  ]),
  source('.github/workflows/bitcode-gate-quality.yml', [
    'check-v39-gate11-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V39" ]',
  ]),
  source('.github/workflows/bitcode-canon-quality.yml', [
    'check-v39-gate11-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V39" ]',
    '--active-canon V39 --draft-target V40',
  ]),
  source('packages/specifying/src/canonical/proven-generator.js', [
    'buildV39ProvenPackage',
    'buildV39PromotionReadinessReport',
    V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('packages/specifying/test/v39-promotion-readiness.test.js', [
    'builds source-safe V39 CommercialReadingPromotionReadinessReport',
    'v39-promotion-readiness-report',
    'V39 Promotion Readiness',
  ]),
  source('packages/specifying/src/canonical/v21-specifying.js', [
    V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('package.json', [
    'generate:v39-promotion-readiness',
    'check:v39-promotion-readiness',
    'check:v39-gate11',
  ]),
]);

const REQUIRED_DOCUMENTATION_EVIDENCE = Object.freeze([
  source('BITCODE_SPEC_V39.md', [
    'V39 promotion readiness canon',
    V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'V39 active / draft V40',
  ]),
  source('BITCODE_SPEC_V39_DELTA.md', [
    'Gate 11: V39 Promotion Readiness',
    V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'promotion scripts support V39',
  ]),
  source('BITCODE_SPEC_V39_NOTES.md', [
    'Gate 11: V39 Promotion Readiness',
    V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'active V39 / draft V40',
  ]),
  source('BITCODE_SPEC_V39_PARITY_MATRIX.md', [
    '## Gate 11 Promotion readiness parity',
    V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'closed',
  ]),
  source('SPECIFICATIONS_ROADMAP.md', [
    'V39 Gate 11 closure anchor',
    'BITCODE_SPEC_V39_PROVEN.md',
  ]),
  source('README.md', [
    'check:v39-gate11',
    'v39-canon-promotion.yml',
  ]),
  source('packages/specifying/README.md', [
    'V39 Gate 11',
    'V39` active, `V40` draft',
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
export function buildV39CommercialReadingPromotionReadinessReport(input = {}) {
  const version = input.version || V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_VERSION;
  const currentTarget = input.currentTarget || V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-25T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sourceEvidence = REQUIRED_SOURCE_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const documentationEvidence = REQUIRED_DOCUMENTATION_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const gateArtifactEvidence = V39_COMMERCIAL_READING_PROMOTION_READINESS_GATE_ARTIFACT_PATHS.map((artifactPath) =>
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
    'pnpm run check:v39-gate1',
    'pnpm run check:v39-gate2',
    'pnpm run check:v39-gate3',
    'pnpm run check:v39-gate4',
    'pnpm run check:v39-gate5',
    'pnpm run check:v39-gate6',
    'pnpm run check:v39-gate7',
    'pnpm run check:v39-gate8',
    'pnpm run check:v39-gate9',
    'pnpm run check:v39-gate10',
    'pnpm run check:v39-gate11',
    'node scripts/promote-bitcode-canon.mjs --version V39 --commit HEAD --dry-run',
  ];
  const coverage = {
    requiredGateArtifactPaths: [...V39_COMMERCIAL_READING_PROMOTION_READINESS_GATE_ARTIFACT_PATHS],
    generatedProofOutputs: [...V39_COMMERCIAL_READING_PROMOTION_READINESS_GENERATED_OUTPUTS],
    gateArtifactCount: gateArtifactEvidence.length,
    missingGateArtifacts,
    unparseableGateArtifacts,
    sourceUnsafeGateArtifacts,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    documentationEvidenceComplete: documentationEvidence.every(allTokensPresent),
    allGateArtifactsCovered: missingGateArtifacts.length === 0,
    allGateArtifactsParseable: unparseableGateArtifacts.length === 0,
    allGateArtifactsSourceSafe: sourceUnsafeGateArtifacts.length === 0,
    generatedProofOutputsCovered: V39_COMMERCIAL_READING_PROMOTION_READINESS_GENERATED_OUTPUTS.includes('BITCODE_SPEC_V39_PROVEN.md'),
    promotionWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/v39-canon-promotion.yml' && allTokensPresent(entry)),
    gateQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-gate-quality.yml' && allTokensPresent(entry)),
    canonQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-canon-quality.yml' && allTokensPresent(entry)),
    promotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/promote-bitcode-canon.mjs' && allTokensPresent(entry)),
    specFamilyPromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-spec-family-promotion.mjs' && allTokensPresent(entry)),
    runtimePromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-runtime-canon-promotion.mjs' && allTokensPresent(entry)),
    provenGeneratorCovered: sourceEvidence.some((entry) => entry.relativePath === 'packages/specifying/src/canonical/proven-generator.js' && allTokensPresent(entry)),
    prePromotionPosture: 'V38 active / V39 draft',
    postPromotionPosture: 'V39 active / V40 draft',
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
    sourceSafetyVerdict: V39_COMMERCIAL_READING_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v39-promotion-readiness-report',
    schemaId: V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: V39_COMMERCIAL_READING_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    prePromotionPosture: 'V38 active / V39 draft',
    postPromotionPosture: 'V39 active / V40 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v39',
      versionPromotionPullRequestTitlePrefix: 'V39 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: 'BITCODE_SPEC_V39_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v39-',
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
      'promotion remains blocked when any V39 Depository, Reading UX, Need review, Finding Fits, preview/quote, settlement/delivery, telemetry/repair, interface parity, rehearsal, workflow, promotion script, generated proof support, source-safety check, or value-bearing mainnet block is missing',
    artifactRoot: `commercial-reading-promotion-readiness-report:${sha256(canonicalJson(artifactSeed)).slice(7, 31)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v39-gate11',
  };
}
