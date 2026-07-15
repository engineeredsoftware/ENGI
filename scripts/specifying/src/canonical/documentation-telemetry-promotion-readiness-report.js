// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH =
  '.bitcode/v35-documentation-telemetry-promotion-readiness-report.json';
export const DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_SCHEMA_ID =
  'bitcode.v35.documentationTelemetryPromotionReadinessReport.v1';
export const DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_VERSION = 'V35';
export const DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_CURRENT_TARGET = 'V34';
export const DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT =
  'source-safe-promotion-readiness-metadata';

export const DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_GATE_ARTIFACT_PATHS = Object.freeze([
  '.bitcode/v35-documentation-surface-catalog.json',
  '.bitcode/v35-telemetry-taxonomy-catalog.json',
  '.bitcode/v35-public-docs-usage-guides.json',
  '.bitcode/v35-operator-runbook-catalog.json',
  '.bitcode/v35-docs-qa-alignment-report.json',
  '.bitcode/v35-testnet-rollout-readiness-guide.json',
  '.bitcode/v35-telemetry-documentation-interface-integration.json',
  '.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json',
]);

export const DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_GENERATED_OUTPUTS = Object.freeze([
  'specifications/BITCODE_SPEC_V35_PROVEN.md',
  '.bitcode/v35-spec-family-report.json',
  '.bitcode/v35-canonical-input-report.json',
  '.bitcode/v35-canon-posture-drift-report.json',
  DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
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
  source('scripts/check-v35-gate10-promotion-readiness.mjs', [
    'V35 Gate 10 promotion readiness',
    '--promotion-mode',
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/generate-v35-documentation-telemetry-promotion-readiness-report.mjs', [
    'buildDocumentationTelemetryPromotionReadinessReport',
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    'v35-documentation-telemetry-promotion-readiness-report',
  ]),
  source('scripts/promote-bitcode-canon.mjs', [
    "if (version === 'V35')",
    'const v35Gate10Command',
    'buildDerivedV35CommitMessageBody',
    'scripts/check-v35-gate10-promotion-readiness.mjs',
  ]),
  source('scripts/prepare-bitcode-spec-family-promotion.mjs', [
    "if (version === 'V35')",
    'V35 canonical system specification for telemetry and documentation depth',
    'specifications/BITCODE_SPEC_V35_PROVEN.md',
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
    '--next-draft',
    'rewritePackageReadme',
    'rewriteRuntimeDataState',
  ]),
  source('.github/workflows/v35-canon-promotion.yml', [
    "head.ref == 'version/v35'",
    'npm run promote:canon -- --version V35',
    'specifications/BITCODE_SPEC_V35_PROVEN.md',
    'Promote V35 canon files',
  ]),
  source('.github/workflows/bitcode-gate-quality.yml', [
    'check-v35-gate10-promotion-readiness.mjs',
    'elif [ "$POINTER" = "V35" ]',
  ]),
  source('.github/workflows/bitcode-canon-quality.yml', [
    'elif [ "$POINTER" = "V35" ]',
    '--active-canon V35 --draft-target V36',
  ]),
  source('scripts/specifying/src/canonical/proven-generator.js', [
    'buildV35ProvenPackage',
    'buildV35PromotionReadinessReport',
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('scripts/specifying/test/v35-promotion-readiness.test.js', [
    'supports V35 promotion readiness with source-safe telemetry documentation artifacts',
    'v35-documentation-telemetry-promotion-readiness-report',
    'V35 Promotion Readiness',
  ]),
  source('scripts/specifying/src/canonical/v21-specifying.js', [
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  ]),
  source('package.json', [
    'generate:v35-documentation-telemetry-promotion-readiness',
    'check:v35-documentation-telemetry-promotion-readiness',
    'check:v35-gate10',
  ]),
]);

const REQUIRED_DOCUMENTATION_EVIDENCE = Object.freeze([
  source('specifications/BITCODE_SPEC_V35.md', [
    'V35 promotion readiness canon',
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'V35 active / draft V36',
  ]),
  source('specifications/BITCODE_SPEC_V35_DELTA.md', [
    'Gate 10: V35 Promotion Readiness',
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'promotion scripts support V35',
  ]),
  source('specifications/BITCODE_SPEC_V35_NOTES.md', [
    'Gate 10: V35 Promotion Readiness',
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'active V35 / draft V36',
  ]),
  source('specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md', [
    '## Gate 10 Parity',
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    'closed',
  ]),
  source('specifications/SPECIFICATIONS_ROADMAP.md', [
    'V35 Gate 10 closure anchor',
    'specifications/BITCODE_SPEC_V35_PROVEN.md',
  ]),
  source('README.md', [
    'check:v35-gate10',
    'v35-canon-promotion.yml',
  ]),
  source('scripts/specifying/README.md', [
    'V35 Gate 10',
    'V35` active, `V36` draft',
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
export function buildDocumentationTelemetryPromotionReadinessReport(input = {}) {
  const version = input.version || DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_VERSION;
  const currentTarget = input.currentTarget || DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sourceEvidence = REQUIRED_SOURCE_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const documentationEvidence = REQUIRED_DOCUMENTATION_EVIDENCE.map((item) => scanTokens(repoRoot, item));
  const gateArtifactEvidence = DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_GATE_ARTIFACT_PATHS.map((artifactPath) =>
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
    'pnpm run check:v35-gate1',
    'pnpm run check:v35-gate2',
    'pnpm run check:v35-gate3',
    'pnpm run check:v35-gate4',
    'pnpm run check:v35-gate5',
    'pnpm run check:v35-gate6',
    'pnpm run check:v35-gate7',
    'pnpm run check:v35-gate8',
    'pnpm run check:v35-gate9',
    'pnpm run check:v35-gate10',
    'node scripts/promote-bitcode-canon.mjs --version V35 --commit HEAD --dry-run',
  ];
  const coverage = {
    requiredGateArtifactPaths: [...DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_GATE_ARTIFACT_PATHS],
    generatedProofOutputs: [...DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_GENERATED_OUTPUTS],
    gateArtifactCount: gateArtifactEvidence.length,
    missingGateArtifacts,
    unparseableGateArtifacts,
    sourceUnsafeGateArtifacts,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    documentationEvidenceComplete: documentationEvidence.every(allTokensPresent),
    allGateArtifactsCovered: missingGateArtifacts.length === 0,
    allGateArtifactsParseable: unparseableGateArtifacts.length === 0,
    allGateArtifactsSourceSafe: sourceUnsafeGateArtifacts.length === 0,
    generatedProofOutputsCovered: DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_GENERATED_OUTPUTS.includes('specifications/BITCODE_SPEC_V35_PROVEN.md'),
    promotionWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/v35-canon-promotion.yml' && allTokensPresent(entry)),
    gateQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-gate-quality.yml' && allTokensPresent(entry)),
    canonQualityWorkflowCovered: sourceEvidence.some((entry) => entry.relativePath === '.github/workflows/bitcode-canon-quality.yml' && allTokensPresent(entry)),
    promotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/promote-bitcode-canon.mjs' && allTokensPresent(entry)),
    specFamilyPromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-spec-family-promotion.mjs' && allTokensPresent(entry)),
    runtimePromotionScriptCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/prepare-bitcode-runtime-canon-promotion.mjs' && allTokensPresent(entry)),
    provenGeneratorCovered: sourceEvidence.some((entry) => entry.relativePath === 'scripts/specifying/src/canonical/proven-generator.js' && allTokensPresent(entry)),
    prePromotionPosture: 'V34 active / V35 draft',
    postPromotionPosture: 'V35 active / V36 draft',
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
    sourceSafetyVerdict: DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v35-documentation-telemetry-promotion-readiness-report',
    schemaId: DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
    prePromotionPosture: 'V34 active / V35 draft',
    postPromotionPosture: 'V35 active / V36 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v35',
      versionPromotionPullRequestTitlePrefix: 'V35 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: 'specifications/BITCODE_SPEC_V35_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v35-',
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
      'promotion remains blocked when any telemetry/documentation artifact, workflow, proof output, runtime posture rewrite support, generated proof support, source-safety check, or value-bearing mainnet block is missing',
    artifactRoot: `documentation-telemetry-promotion-readiness-report:${sha256(canonicalJson(artifactSeed)).slice(7, 31)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v35-gate10',
  };
}
