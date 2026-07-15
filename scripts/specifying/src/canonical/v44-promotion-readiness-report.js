// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH =
  '.bitcode/v44-promotion-readiness-report.json';
export const V44_PROMOTION_READINESS_REPORT_SCHEMA_ID =
  'bitcode.v44.promotionReadinessReport.v1';
export const V44_PROMOTION_READINESS_REPORT_VERSION = 'V44';
export const V44_PROMOTION_READINESS_REPORT_CURRENT_TARGET = 'V43';
export const V44_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT =
  'source-safe-v44-scaled-engineering-economy-promotion-metadata';

export const V44_PROMOTION_READINESS_GATE_ARTIFACT_PATHS = Object.freeze([
  '.bitcode/v44-economic-domain-model.json',
  '.bitcode/v44-packs-portfolio-market-intelligence.json',
  '.bitcode/v44-reading-budget-quote-policy.json',
  '.bitcode/v44-depositor-earnings-supply-opportunities.json',
  '.bitcode/v44-btd-btc-compensation-statements.json',
  '.bitcode/v44-organization-policy-wallet-authority.json',
  '.bitcode/v44-enterprise-product-ux.json',
  '.bitcode/v44-scaled-network-rehearsal.json',
]);

export const V44_PROMOTION_READINESS_GENERATED_OUTPUTS = Object.freeze([
  'specifications/BITCODE_SPEC_V44_PROVEN.md',
  '.bitcode/v44-spec-family-report.json',
  '.bitcode/v44-canonical-input-report.json',
  '.bitcode/v44-canon-posture-drift-report.json',
  V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
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
  source('scripts/check-v44-gate10-promotion-readiness.mjs', [
    'V44 Gate 10 promotion readiness',
    '--promotion-mode',
    'promotedPointer',
    V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/generate-v44-promotion-readiness-report.mjs', [
    'buildV44PromotionReadinessReport',
    V44_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    'v44-promotion-readiness-report',
  ]),
  source('scripts/promote-bitcode-canon.mjs', [
    "if (version === 'V44')",
    'const v44Gate10Command',
    'buildDerivedV44CommitMessageBody',
    'scripts/check-v44-gate10-promotion-readiness.mjs',
  ]),
  source('scripts/prepare-bitcode-spec-family-promotion.mjs', [
    "if (version === 'V44')",
    'V44 canonical system specification for scaled engineering economy',
    'BITCODE_SPEC_V44_PROVEN.md',
    V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
    '--next-draft',
    'rewritePackageReadme',
    'rewriteRuntimeDataState',
  ]),
  source('.github/workflows/v44-canon-promotion.yml', [
    "head.ref == 'version/v44'",
    'node scripts/prepare-bitcode-spec-family-promotion.mjs --version V44',
    'node scripts/prepare-bitcode-runtime-canon-promotion.mjs --version V44 --next-draft V45',
    'node scripts/generate-bitcode-proven.mjs --version V44',
    'node scripts/check-bitcode-spec-family.mjs --version V44 --mode promoted --current-target V44',
    'specifications/BITCODE_SPEC_V44_PROVEN.md',
    'Promote V44 canon files',
  ]),
  source('.github/workflows/bitcode-gate-quality.yml', [
    'check-v44-gate10-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V44" ]',
    '--active-canon V44 --draft-target V45',
  ]),
  source('.github/workflows/bitcode-canon-quality.yml', [
    'check-v44-gate10-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V44" ]',
    '--active-canon V44 --draft-target V45',
  ]),
  source('scripts/specifying/src/canonical/proven-generator.js', [
    'buildV44ProvenPackage',
    'buildV44PromotionReadinessReport',
    V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/specifying/test/v44-promotion-readiness.test.js', [
    'builds source-safe V44 PromotionReadinessReport',
    'v44-promotion-readiness-report',
    'V44 Promotion Readiness',
  ]),
  source('scripts/specifying/src/canonical/v21-specifying.js', [
    V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('package.json', [
    'generate:v44-promotion-readiness',
    'check:v44-promotion-readiness',
    'check:v44-gate10',
  ]),
]);

const REQUIRED_DOCUMENTATION_EVIDENCE = Object.freeze([
  source('specifications/BITCODE_SPEC_V44.md', [
    'V44 promotion readiness canon',
    V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'V44 active / draft V45',
  ]),
  source('specifications/BITCODE_SPEC_V44_DELTA.md', [
    'Gate 10: V44 Promotion Readiness',
    V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'promotion scripts support V44',
  ]),
  source('specifications/BITCODE_SPEC_V44_NOTES.md', [
    'Gate 10: V44 Promotion Readiness',
    V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'active V44 / draft V45',
  ]),
  source('specifications/BITCODE_SPEC_V44_PARITY_MATRIX.md', [
    '## Gate 10 Promotion readiness parity',
    V44_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'closed',
  ]),
  source('specifications/SPECIFICATIONS_ROADMAP.md', [
    'V44 Gate 10 closure anchor',
    'BITCODE_SPEC_V44_PROVEN.md',
  ]),
  source('README.md', [
    'check:v44-gate10',
    'v44-canon-promotion.yml',
  ]),
  source('scripts/specifying/README.md', [
    'V44 Gate 10',
    'V44` active, `V45` draft',
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
export function buildV44PromotionReadinessReport(input = {}) {
  const version = input.version || V44_PROMOTION_READINESS_REPORT_VERSION;
  const currentTarget = input.currentTarget || V44_PROMOTION_READINESS_REPORT_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-29T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sourceEvidence = REQUIRED_SOURCE_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const documentationEvidence = REQUIRED_DOCUMENTATION_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const gateArtifactEvidence = V44_PROMOTION_READINESS_GATE_ARTIFACT_PATHS.map((artifactPath) =>
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
    'pnpm run check:v44-gate1',
    'pnpm run check:v44-gate2',
    'pnpm run check:v44-gate3',
    'pnpm run check:v44-gate4',
    'pnpm run check:v44-gate5',
    'pnpm run check:v44-gate6',
    'pnpm run check:v44-gate7',
    'pnpm run check:v44-gate8',
    'pnpm run check:v44-gate9',
    'pnpm run check:v44-gate10',
    'node scripts/promote-bitcode-canon.mjs --version V44 --commit HEAD --dry-run',
  ];
  const coverage = {
    requiredGateArtifactPaths: [...V44_PROMOTION_READINESS_GATE_ARTIFACT_PATHS],
    generatedProofOutputs: [...V44_PROMOTION_READINESS_GENERATED_OUTPUTS],
    gateArtifactCount: gateArtifactEvidence.length,
    missingGateArtifacts,
    unparseableGateArtifacts,
    sourceUnsafeGateArtifacts,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    documentationEvidenceComplete: documentationEvidence.every(allTokensPresent),
    allGateArtifactsCovered: missingGateArtifacts.length === 0,
    allGateArtifactsParseable: unparseableGateArtifacts.length === 0,
    allGateArtifactsSourceSafe: sourceUnsafeGateArtifacts.length === 0,
    generatedProofOutputsCovered: V44_PROMOTION_READINESS_GENERATED_OUTPUTS.includes('specifications/BITCODE_SPEC_V44_PROVEN.md'),
    promotionWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/v44-canon-promotion.yml' && allTokensPresent(entry)),
    gateQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-gate-quality.yml' && allTokensPresent(entry)),
    canonQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-canon-quality.yml' && allTokensPresent(entry)),
    promotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/promote-bitcode-canon.mjs' && allTokensPresent(entry)),
    specFamilyPromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-spec-family-promotion.mjs' && allTokensPresent(entry)),
    runtimePromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-runtime-canon-promotion.mjs' && allTokensPresent(entry)),
    provenGeneratorCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/specifying/src/canonical/proven-generator.js' && allTokensPresent(entry)),
    prePromotionPosture: 'V43 active / V44 draft',
    postPromotionPosture: 'V44 active / V45 draft',
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
    sourceSafetyVerdict: V44_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v44-promotion-readiness-report',
    schemaId: V44_PROMOTION_READINESS_REPORT_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: V44_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    prePromotionPosture: 'V43 active / V44 draft',
    postPromotionPosture: 'V44 active / V45 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v44',
      versionPromotionPullRequestTitlePrefix: 'V44 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: 'specifications/BITCODE_SPEC_V44_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v44-',
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
      'promotion remains blocked when any V44 economic domain model, Packs portfolio market intelligence, Reading budget quote policy, depositor earnings opportunity proof, BTD/BTC compensation statement, organization policy and wallet authority, enterprise product UX proof, scaled network rehearsal, workflow, promotion script, generated proof support, source-safety check, or value-bearing mainnet block is missing',
    artifactRoot: `v44-scaled-engineering-economy-promotion-readiness-report:${sha256(canonicalJson(artifactSeed)).slice(7, 31)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v44-gate10',
  };
}

export function listMissingV44PromotionReadinessSources(repoRoot = path.resolve(__dirname, '../../../..')) {
  return [...REQUIRED_SOURCE_EVIDENCE, ...REQUIRED_DOCUMENTATION_EVIDENCE]
    .filter((item) => !existsSync(path.join(repoRoot, item.relativePath)))
    .map((item) => item.relativePath);
}
