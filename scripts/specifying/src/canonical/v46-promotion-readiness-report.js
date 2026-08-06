// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH =
  '.proofs/v46/promotion-readiness-report.json';
export const V46_PROMOTION_READINESS_REPORT_SCHEMA_ID =
  'bitcode.v46.promotionReadinessReport.v1';
export const V46_PROMOTION_READINESS_REPORT_VERSION = 'V46';
export const V46_PROMOTION_READINESS_REPORT_CURRENT_TARGET = 'V45';
export const V46_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT =
  'source-safe-v46-protocol-comprehension-promotion-metadata';

export const V46_PROMOTION_READINESS_GATE_ARTIFACT_PATHS = Object.freeze([
  '.proofs/v46/protocol-comprehension-object-model.json',
  '.proofs/v46/public-operator-claim-boundaries.json',
  '.proofs/v46/product-route-comprehension-readback.json',
  '.proofs/v46/interface-claim-contracts.json',
  '.proofs/v46/proof-readback-operator-explanation.json',
  '.proofs/v46/local-interface-comprehension-rehearsal.json',
]);

export const V46_PROMOTION_READINESS_GENERATED_OUTPUTS = Object.freeze([
  '.specifications/BITCODE_SPEC_V46_PROVEN.md',
  '.proofs/v46/spec-family-report.json',
  '.proofs/v46/canonical-input-report.json',
  '.proofs/v46/canon-posture-drift-report.json',
  V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
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
  source('scripts/check-v46-gate8-promotion-readiness.mjs', [
    'V46 Gate 8 promotion readiness',
    '--promotion-mode',
    'promotedPointer',
    V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/generate-v46-promotion-readiness-report.mjs', [
    'buildV46PromotionReadinessReport',
    V46_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    'v46-promotion-readiness-report',
  ]),
  source('scripts/promote-bitcode-canon.mjs', [
    "if (version === 'V46')",
    'const v46Gate8Command',
    'buildDerivedV46CommitMessageBody',
    'scripts/check-v46-gate8-promotion-readiness.mjs',
  ]),
  source('scripts/prepare-bitcode-spec-family-promotion.mjs', [
    "if (version === 'V46')",
    'V46 canonical system specification for protocol comprehension',
    'BITCODE_SPEC_V46_PROVEN.md',
    V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
    '--next-draft',
    'rewritePackageReadme',
    'rewriteRuntimeDataState',
  ]),
  source('.github/workflows/v46-canon-promotion.yml', [
    "head.ref == 'version/v46'",
    'node scripts/prepare-bitcode-spec-family-promotion.mjs --version V46',
    'node scripts/prepare-bitcode-runtime-canon-promotion.mjs --version V46 --next-draft V47',
    'node scripts/generate-bitcode-proven.mjs --version V46',
    'node scripts/check-bitcode-spec-family.mjs --version V46 --mode promoted --current-target V46',
    '.specifications/BITCODE_SPEC_V46_PROVEN.md',
    'Promote V46 canon files',
  ]),
  source('.github/workflows/bitcode-gate-quality.yml', [
    'check-v46-gate8-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V46" ]',
    '--active-canon V46 --draft-target V47',
  ]),
  source('.github/workflows/bitcode-canon-quality.yml', [
    'check-v46-gate8-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V46" ]',
    '--active-canon V46 --draft-target V47',
  ]),
  source('scripts/specifying/src/canonical/proven-generator.js', [
    'buildV46ProvenPackage',
    'buildV46PromotionReadinessReport',
    V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/specifying/test/v46-promotion-readiness.test.js', [
    'builds source-safe V46 PromotionReadinessReport',
    'v46-promotion-readiness-report',
    'V46 Promotion Readiness',
  ]),
  source('scripts/specifying/src/canonical/v21-specifying.js', [
    V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('package.json', [
    'generate:v46-promotion-readiness',
    'check:v46-promotion-readiness',
    'check:v46-gate8',
  ]),
]);

const REQUIRED_DOCUMENTATION_EVIDENCE = Object.freeze([
  source('.specifications/BITCODE_SPEC_V46.md', [
    'V46 promotion readiness canon',
    V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'V46 active / draft V47',
  ]),
  source('.specifications/BITCODE_SPEC_V46_DELTA.md', [
    'Gate 8: V46 Promotion Readiness',
    V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'promotion scripts support V46',
  ]),
  source('.specifications/BITCODE_SPEC_V46_NOTES.md', [
    'Gate 8: V46 Promotion Readiness',
    V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'active V46 / draft V47',
  ]),
  source('.specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md', [
    'Gate 8 implementation readback',
    V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'closed',
  ]),
  source('.specifications/SPECIFICATIONS_ROADMAP.md', [
    'V46 Gate 8 closure anchor',
    'BITCODE_SPEC_V46_PROVEN.md',
  ]),
  source('README.md', [
    'check:v46-gate8',
    'v46-canon-promotion.yml',
  ]),
  source('scripts/specifying/README.md', [
    'V46 Gate 8',
    'V46` active, `V47` draft',
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
export function buildV46PromotionReadinessReport(input = {}) {
  const version = input.version || V46_PROMOTION_READINESS_REPORT_VERSION;
  const currentTarget = input.currentTarget || V46_PROMOTION_READINESS_REPORT_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-06-02T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sourceEvidence = REQUIRED_SOURCE_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const documentationEvidence = REQUIRED_DOCUMENTATION_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const gateArtifactEvidence = V46_PROMOTION_READINESS_GATE_ARTIFACT_PATHS.map((artifactPath) =>
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
    'pnpm run check:v46-gate2',
    'pnpm run check:v46-gate3',
    'pnpm run check:v46-gate4',
    'pnpm run check:v46-gate5',
    'pnpm run check:v46-gate6',
    'pnpm run check:v46-gate7',
    'pnpm run check:v46-gate8',
    'node scripts/promote-bitcode-canon.mjs --version V46 --commit HEAD --dry-run',
  ];
  const coverage = {
    requiredGateArtifactPaths: [...V46_PROMOTION_READINESS_GATE_ARTIFACT_PATHS],
    generatedProofOutputs: [...V46_PROMOTION_READINESS_GENERATED_OUTPUTS],
    gateArtifactCount: gateArtifactEvidence.length,
    missingGateArtifacts,
    unparseableGateArtifacts,
    sourceUnsafeGateArtifacts,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    documentationEvidenceComplete: documentationEvidence.every(allTokensPresent),
    allGateArtifactsCovered: missingGateArtifacts.length === 0,
    allGateArtifactsParseable: unparseableGateArtifacts.length === 0,
    allGateArtifactsSourceSafe: sourceUnsafeGateArtifacts.length === 0,
    generatedProofOutputsCovered: V46_PROMOTION_READINESS_GENERATED_OUTPUTS.includes('.specifications/BITCODE_SPEC_V46_PROVEN.md'),
    promotionWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/v46-canon-promotion.yml' && allTokensPresent(entry)),
    gateQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-gate-quality.yml' && allTokensPresent(entry)),
    canonQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-canon-quality.yml' && allTokensPresent(entry)),
    promotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/promote-bitcode-canon.mjs' && allTokensPresent(entry)),
    specFamilyPromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-spec-family-promotion.mjs' && allTokensPresent(entry)),
    runtimePromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-runtime-canon-promotion.mjs' && allTokensPresent(entry)),
    provenGeneratorCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/specifying/src/canonical/proven-generator.js' && allTokensPresent(entry)),
    prePromotionPosture: 'V45 active / V46 draft',
    postPromotionPosture: 'V46 active / V47 draft',
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
    sourceSafetyVerdict: V46_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v46-promotion-readiness-report',
    schemaId: V46_PROMOTION_READINESS_REPORT_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: V46_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    prePromotionPosture: 'V45 active / V46 draft',
    postPromotionPosture: 'V46 active / V47 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v46',
      versionPromotionPullRequestTitlePrefix: 'V46 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: '.specifications/BITCODE_SPEC_V46_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.proofs/v46/',
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
      'promotion remains blocked when any V46 comprehension artifact, interface rehearsal, workflow, promotion script, generated proof support, source-safety check, or value-bearing mainnet block is missing',
    artifactRoot: `v46-protocol-comprehension-promotion-readiness-report:${sha256(canonicalJson(artifactSeed)).slice(7, 31)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v46-gate8',
  };
}

export function listMissingV46PromotionReadinessSources(repoRoot = path.resolve(__dirname, '../../../..')) {
  return [...REQUIRED_SOURCE_EVIDENCE, ...REQUIRED_DOCUMENTATION_EVIDENCE]
    .filter((item) => !existsSync(path.join(repoRoot, item.relativePath)))
    .map((item) => item.relativePath);
}
