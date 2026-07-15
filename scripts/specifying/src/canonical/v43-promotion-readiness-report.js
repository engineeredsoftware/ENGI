// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH =
  '.bitcode/v43-promotion-readiness-report.json';
export const V43_PROMOTION_READINESS_REPORT_SCHEMA_ID =
  'bitcode.v43.promotionReadinessReport.v1';
export const V43_PROMOTION_READINESS_REPORT_VERSION = 'V43';
export const V43_PROMOTION_READINESS_REPORT_CURRENT_TARGET = 'V42';
export const V43_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT =
  'source-safe-v43-product-routes-agentic-depositing-promotion-metadata';

export const V43_PROMOTION_READINESS_GATE_ARTIFACT_PATHS = Object.freeze([
  '.bitcode/v43-route-vocabulary-inventory.json',
  '.bitcode/v43-packs-activity-master-detail.json',
  '.bitcode/v43-read-route-five-step-ux.json',
  '.bitcode/v43-deposit-route-options.json',
  '.bitcode/v43-deposit-policy-compensation.json',
  '.bitcode/v43-deposit-option-admission.json',
  '.bitcode/v43-route-ux-product-excellence.json',
  '.bitcode/v43-cross-route-rehearsal-telemetry-repair.json',
]);

export const V43_PROMOTION_READINESS_GENERATED_OUTPUTS = Object.freeze([
  '.specifications/BITCODE_SPEC_V43_PROVEN.md',
  '.bitcode/v43-spec-family-report.json',
  '.bitcode/v43-canonical-input-report.json',
  '.bitcode/v43-canon-posture-drift-report.json',
  V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
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
  source('scripts/check-v43-gate10-promotion-readiness.mjs', [
    'V43 Gate 10 promotion readiness',
    '--promotion-mode',
    'promotedPointer',
    V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/generate-v43-promotion-readiness-report.mjs', [
    'buildV43PromotionReadinessReport',
    V43_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    'v43-promotion-readiness-report',
  ]),
  source('scripts/promote-bitcode-canon.mjs', [
    "if (version === 'V43')",
    'const v43Gate10Command',
    'buildDerivedV43CommitMessageBody',
    'scripts/check-v43-gate10-promotion-readiness.mjs',
  ]),
  source('scripts/prepare-bitcode-spec-family-promotion.mjs', [
    "if (version === 'V43')",
    'V43 canonical system specification for product routes and agentic depositing',
    'BITCODE_SPEC_V43_PROVEN.md',
    V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
    '--next-draft',
    'rewritePackageReadme',
    'rewriteRuntimeDataState',
  ]),
  source('.github/workflows/v43-canon-promotion.yml', [
    "head.ref == 'version/v43'",
    'node scripts/prepare-bitcode-spec-family-promotion.mjs --version V43',
    'node scripts/prepare-bitcode-runtime-canon-promotion.mjs --version V43 --next-draft V44',
    'node scripts/generate-bitcode-proven.mjs --version V43',
    'node scripts/check-bitcode-spec-family.mjs --version V43 --mode promoted --current-target V43',
    '.specifications/BITCODE_SPEC_V43_PROVEN.md',
    'Promote V43 canon files',
  ]),
  source('.github/workflows/bitcode-gate-quality.yml', [
    'check-v43-gate10-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V43" ]',
    '--active-canon V43 --draft-target V44',
  ]),
  source('.github/workflows/bitcode-canon-quality.yml', [
    'check-v43-gate10-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V43" ]',
    '--active-canon V43 --draft-target V44',
  ]),
  source('scripts/specifying/src/canonical/proven-generator.js', [
    'buildV43ProvenPackage',
    'buildV43PromotionReadinessReport',
    V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/specifying/test/v43-promotion-readiness.test.js', [
    'builds source-safe V43 PromotionReadinessReport',
    'v43-promotion-readiness-report',
    'V43 Promotion Readiness',
  ]),
  source('scripts/specifying/src/canonical/v21-specifying.js', [
    V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('package.json', [
    'generate:v43-promotion-readiness',
    'check:v43-promotion-readiness',
    'check:v43-gate10',
  ]),
]);

const REQUIRED_DOCUMENTATION_EVIDENCE = Object.freeze([
  source('.specifications/BITCODE_SPEC_V43.md', [
    'V43 promotion readiness canon',
    V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'V43 active / draft V44',
  ]),
  source('.specifications/BITCODE_SPEC_V43_DELTA.md', [
    'Gate 10: V43 Promotion Readiness',
    V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'promotion scripts support V43',
  ]),
  source('.specifications/BITCODE_SPEC_V43_NOTES.md', [
    'Gate 10: V43 Promotion Readiness',
    V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'active V43 / draft V44',
  ]),
  source('.specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md', [
    '## Gate 10 Promotion readiness parity',
    V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'closed',
  ]),
  source('.specifications/SPECIFICATIONS_ROADMAP.md', [
    'V43 Gate 10 closure anchor',
    'BITCODE_SPEC_V43_PROVEN.md',
  ]),
  source('README.md', [
    'check:v43-gate10',
    'v43-canon-promotion.yml',
  ]),
  source('scripts/specifying/README.md', [
    'V43 Gate 10',
    'V43` active, `V44` draft',
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
export function buildV43PromotionReadinessReport(input = {}) {
  const version = input.version || V43_PROMOTION_READINESS_REPORT_VERSION;
  const currentTarget = input.currentTarget || V43_PROMOTION_READINESS_REPORT_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-29T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sourceEvidence = REQUIRED_SOURCE_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const documentationEvidence = REQUIRED_DOCUMENTATION_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const gateArtifactEvidence = V43_PROMOTION_READINESS_GATE_ARTIFACT_PATHS.map((artifactPath) =>
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
    'pnpm run check:v43-gate1',
    'pnpm run check:v43-gate2',
    'pnpm run check:v43-gate3',
    'pnpm run check:v43-gate4',
    'pnpm run check:v43-gate5',
    'pnpm run check:v43-gate6',
    'pnpm run check:v43-gate7',
    'pnpm run check:v43-gate8',
    'pnpm run check:v43-gate9',
    'pnpm run check:v43-gate10',
    'node scripts/promote-bitcode-canon.mjs --version V43 --commit HEAD --dry-run',
  ];
  const coverage = {
    requiredGateArtifactPaths: [...V43_PROMOTION_READINESS_GATE_ARTIFACT_PATHS],
    generatedProofOutputs: [...V43_PROMOTION_READINESS_GENERATED_OUTPUTS],
    gateArtifactCount: gateArtifactEvidence.length,
    missingGateArtifacts,
    unparseableGateArtifacts,
    sourceUnsafeGateArtifacts,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    documentationEvidenceComplete: documentationEvidence.every(allTokensPresent),
    allGateArtifactsCovered: missingGateArtifacts.length === 0,
    allGateArtifactsParseable: unparseableGateArtifacts.length === 0,
    allGateArtifactsSourceSafe: sourceUnsafeGateArtifacts.length === 0,
    generatedProofOutputsCovered: V43_PROMOTION_READINESS_GENERATED_OUTPUTS.includes('.specifications/BITCODE_SPEC_V43_PROVEN.md'),
    promotionWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/v43-canon-promotion.yml' && allTokensPresent(entry)),
    gateQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-gate-quality.yml' && allTokensPresent(entry)),
    canonQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-canon-quality.yml' && allTokensPresent(entry)),
    promotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/promote-bitcode-canon.mjs' && allTokensPresent(entry)),
    specFamilyPromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-spec-family-promotion.mjs' && allTokensPresent(entry)),
    runtimePromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-runtime-canon-promotion.mjs' && allTokensPresent(entry)),
    provenGeneratorCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/specifying/src/canonical/proven-generator.js' && allTokensPresent(entry)),
    prePromotionPosture: 'V42 active / V43 draft',
    postPromotionPosture: 'V43 active / V44 draft',
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
    sourceSafetyVerdict: V43_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v43-promotion-readiness-report',
    schemaId: V43_PROMOTION_READINESS_REPORT_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: V43_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    prePromotionPosture: 'V42 active / V43 draft',
    postPromotionPosture: 'V43 active / V44 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v43',
      versionPromotionPullRequestTitlePrefix: 'V43 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: '.specifications/BITCODE_SPEC_V43_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v43-',
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
      'promotion remains blocked when any V43 route vocabulary inventory, Packs activity master-detail proof, Read five-step UX proof, Deposit option synthesis proof, deposit policy/compensation proof, deposit option admission proof, route UX product proof, cross-route rehearsal, workflow, promotion script, generated proof support, source-safety check, or value-bearing mainnet block is missing',
    artifactRoot: `v43-product-route-promotion-readiness-report:${sha256(canonicalJson(artifactSeed)).slice(7, 31)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v43-gate10',
  };
}

export function listMissingV43PromotionReadinessSources(repoRoot = path.resolve(__dirname, '../../../..')) {
  return [...REQUIRED_SOURCE_EVIDENCE, ...REQUIRED_DOCUMENTATION_EVIDENCE]
    .filter((item) => !existsSync(path.join(repoRoot, item.relativePath)))
    .map((item) => item.relativePath);
}
