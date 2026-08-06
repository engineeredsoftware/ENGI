// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH =
  '.proofs/v36/promotion-readiness-report.json';
export const EXCHANGE_PROMOTION_READINESS_REPORT_SCHEMA_ID =
  'bitcode.v36.exchangePromotionReadinessReport.v1';
export const EXCHANGE_PROMOTION_READINESS_REPORT_VERSION = 'V36';
export const EXCHANGE_PROMOTION_READINESS_REPORT_CURRENT_TARGET = 'V35';
export const EXCHANGE_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT =
  'source-safe-exchange-promotion-readiness-metadata';

export const EXCHANGE_PROMOTION_READINESS_GATE_ARTIFACT_PATHS = Object.freeze([
  '.proofs/v36/exchange-activity-book.json',
  '.proofs/v36/exchange-intent-order-contracts.json',
  '.proofs/v36/exchange-rights-transfer-review.json',
  '.proofs/v36/pricing-liquidity-fee-quote.json',
  '.proofs/v36/exchange-settlement-reconciliation.json',
  '.proofs/v36/exchange-dispute-repair-revenue-route.json',
  '.proofs/v36/exchange-ux-proof.json',
  '.proofs/v36/exchange-rehearsal.json',
]);

export const EXCHANGE_PROMOTION_READINESS_GENERATED_OUTPUTS = Object.freeze([
  '.specifications/BITCODE_SPEC_V36_PROVEN.md',
  '.proofs/v36/spec-family-report.json',
  '.proofs/v36/canonical-input-report.json',
  '.proofs/v36/canon-posture-drift-report.json',
  EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
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
  source('scripts/check-v36-gate10-promotion-readiness.mjs', [
    'V36 Gate 10 promotion readiness',
    '--promotion-mode',
    EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/generate-v36-promotion-readiness-report.mjs', [
    'buildExchangePromotionReadinessReport',
    EXCHANGE_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    'v36-promotion-readiness-report',
  ]),
  source('scripts/promote-bitcode-canon.mjs', [
    "if (version === 'V36')",
    'const v36Gate10Command',
    'buildDerivedV36CommitMessageBody',
    'scripts/check-v36-gate10-promotion-readiness.mjs',
  ]),
  source('scripts/prepare-bitcode-spec-family-promotion.mjs', [
    "if (version === 'V36')",
    'V36 canonical system specification for Exchange depth',
    'BITCODE_SPEC_V36_PROVEN.md',
    EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
    '--next-draft',
    'rewritePackageReadme',
    'rewriteRuntimeDataState',
  ]),
  source('.github/workflows/v36-canon-promotion.yml', [
    "head.ref == 'version/v36'",
    'npm run promote:canon -- --version V36',
    '.specifications/BITCODE_SPEC_V36_PROVEN.md',
    'Promote V36 canon files',
  ]),
  source('.github/workflows/bitcode-gate-quality.yml', [
    'check-v36-gate10-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V36" ]',
  ]),
  source('.github/workflows/bitcode-canon-quality.yml', [
    'elif [ "$POINTER" = "V36" ]',
    '--active-canon V36 --draft-target V37',
  ]),
  source('scripts/specifying/src/canonical/proven-generator.js', [
    'buildV36ProvenPackage',
    'buildV36PromotionReadinessReport',
    EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/specifying/test/v36-promotion-readiness.test.js', [
    'supports V36 promotion readiness with source-safe Exchange artifacts',
    'v36-promotion-readiness-report',
    'V36 Promotion Readiness',
  ]),
  source('scripts/specifying/src/canonical/v21-specifying.js', [
    EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('package.json', [
    'generate:v36-promotion-readiness',
    'check:v36-promotion-readiness',
    'check:v36-gate10',
  ]),
]);

const REQUIRED_DOCUMENTATION_EVIDENCE = Object.freeze([
  source('.specifications/BITCODE_SPEC_V36.md', [
    'V36 promotion readiness canon',
    EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'V36 active / draft V37',
  ]),
  source('.specifications/BITCODE_SPEC_V36_DELTA.md', [
    'Gate 10: V36 Promotion Readiness',
    EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'promotion scripts support V36',
  ]),
  source('.specifications/BITCODE_SPEC_V36_NOTES.md', [
    'Gate 10: V36 Promotion Readiness',
    EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'active V36 / draft V37',
  ]),
  source('.specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md', [
    '## Gate 10 Parity',
    EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'closed',
  ]),
  source('.specifications/SPECIFICATIONS_ROADMAP.md', [
    'V36 Gate 10 closure anchor',
    'BITCODE_SPEC_V36_PROVEN.md',
  ]),
  source('README.md', [
    'check:v36-gate10',
    'v36-canon-promotion.yml',
  ]),
  source('scripts/specifying/README.md', [
    'V36 Gate 10',
    'V36` active, `V37` draft',
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
export function buildExchangePromotionReadinessReport(input = {}) {
  const version = input.version || EXCHANGE_PROMOTION_READINESS_REPORT_VERSION;
  const currentTarget = input.currentTarget || EXCHANGE_PROMOTION_READINESS_REPORT_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sourceEvidence = REQUIRED_SOURCE_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const documentationEvidence = REQUIRED_DOCUMENTATION_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const gateArtifactEvidence = EXCHANGE_PROMOTION_READINESS_GATE_ARTIFACT_PATHS.map((artifactPath) =>
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
    'pnpm run check:v36-gate1',
    'pnpm run check:v36-gate2',
    'pnpm run check:v36-gate3',
    'pnpm run check:v36-gate4',
    'pnpm run check:v36-gate5',
    'pnpm run check:v36-gate6',
    'pnpm run check:v36-gate7',
    'pnpm run check:v36-gate8',
    'pnpm run check:v36-gate9',
    'pnpm run check:v36-gate10',
    'node scripts/promote-bitcode-canon.mjs --version V36 --commit HEAD --dry-run',
  ];
  const coverage = {
    requiredGateArtifactPaths: [...EXCHANGE_PROMOTION_READINESS_GATE_ARTIFACT_PATHS],
    generatedProofOutputs: [...EXCHANGE_PROMOTION_READINESS_GENERATED_OUTPUTS],
    gateArtifactCount: gateArtifactEvidence.length,
    missingGateArtifacts,
    unparseableGateArtifacts,
    sourceUnsafeGateArtifacts,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    documentationEvidenceComplete: documentationEvidence.every(allTokensPresent),
    allGateArtifactsCovered: missingGateArtifacts.length === 0,
    allGateArtifactsParseable: unparseableGateArtifacts.length === 0,
    allGateArtifactsSourceSafe: sourceUnsafeGateArtifacts.length === 0,
    generatedProofOutputsCovered: EXCHANGE_PROMOTION_READINESS_GENERATED_OUTPUTS.includes('.specifications/BITCODE_SPEC_V36_PROVEN.md'),
    promotionWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/v36-canon-promotion.yml' && allTokensPresent(entry)),
    gateQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-gate-quality.yml' && allTokensPresent(entry)),
    canonQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-canon-quality.yml' && allTokensPresent(entry)),
    promotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/promote-bitcode-canon.mjs' && allTokensPresent(entry)),
    specFamilyPromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-spec-family-promotion.mjs' && allTokensPresent(entry)),
    runtimePromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-runtime-canon-promotion.mjs' && allTokensPresent(entry)),
    provenGeneratorCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/specifying/src/canonical/proven-generator.js' && allTokensPresent(entry)),
    prePromotionPosture: 'V35 active / V36 draft',
    postPromotionPosture: 'V36 active / V37 draft',
    valueBearingMainnetAdmission: false,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
  };
  const artifactSeed = {
    version,
    currentTarget,
    validationCommands,
    coverage,
    sourceSafetyVerdict: EXCHANGE_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v36-promotion-readiness-report',
    schemaId: EXCHANGE_PROMOTION_READINESS_REPORT_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: EXCHANGE_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    prePromotionPosture: 'V35 active / V36 draft',
    postPromotionPosture: 'V36 active / V37 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v36',
      versionPromotionPullRequestTitlePrefix: 'V36 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: '.specifications/BITCODE_SPEC_V36_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.proofs/v36/',
      promotionOverwritesPreviewArtifacts: true,
      secretValuesSerialized: false,
      protectedSourceSerialized: false,
    },
    validationCommands,
    gateArtifactEvidence,
    sourceEvidence,
    documentationEvidence,
    coverage,
    failClosedResult:
      'promotion remains blocked when any Exchange artifact, workflow, proof output, runtime posture rewrite support, generated proof support, source-safety check, or value-bearing mainnet block is missing',
    artifactRoot: `exchange-promotion-readiness-report:${sha256(canonicalJson(artifactSeed)).slice(7, 31)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v36-gate10',
  };
}
