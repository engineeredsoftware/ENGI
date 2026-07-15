#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v34-promotion-readiness-report.json';
const GENERATED_AT = '2026-05-23T00:00:00.000Z';

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'OiJI', 'UzI1', 'NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
]);
const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'u');

const V34_GATE_ARTIFACTS = Object.freeze([
  '.bitcode/v34-deployment-host-capability-catalog.json',
  '.bitcode/v34-environment-lane-contracts.json',
  '.bitcode/v34-distributed-execution-runtime-receipts.json',
  '.bitcode/v34-deployment-storage-posture.json',
  '.bitcode/v34-secret-rotation-boundary-operations.json',
  '.bitcode/v34-migration-cicd-approval-gates.json',
  '.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json',
  '.bitcode/v34-rollback-upgrade-data-repair-playbooks.json',
  '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

function stableStringify(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function scanTokens(relativePath, tokens) {
  const present = existsSync(path.join(repoRoot, relativePath));
  const text = present ? read(relativePath) : '';
  return {
    relativePath,
    present,
    digest: present ? sha256(text) : null,
    requiredTokens: tokens.map((token) => ({
      token,
      present: text.includes(token),
    })),
  };
}

function scanArtifact(relativePath) {
  const present = existsSync(path.join(repoRoot, relativePath));
  const text = present ? read(relativePath) : '';
  let parsed = null;
  let parseable = false;
  if (present) {
    try {
      parsed = JSON.parse(text);
      parseable = true;
    } catch {
      parseable = false;
    }
  }
  return {
    relativePath,
    present,
    parseable,
    digest: present ? sha256(text) : null,
    byteLength: present ? Buffer.byteLength(text, 'utf8') : 0,
    sourceSafe: present ? !SECRET_PATTERN.test(text) && !text.includes('protectedSourceBody') : false,
    artifactId: parsed?.artifactId || parsed?.reportId || null,
    version: parsed?.version || null,
  };
}

function allTokensPresent(scan) {
  return scan.present && scan.requiredTokens.every((entry) => entry.present);
}

function rootFor(value) {
  return sha256(stableStringify(value));
}

export function buildV34PromotionReadinessReport() {
  const sourceEvidence = [
    scanTokens('scripts/check-v34-gate10-promotion-readiness.mjs', [
      'V34 Gate 10 promotion readiness',
      '--promotion-mode',
      '.bitcode/v34-promotion-readiness-report.json',
    ]),
    scanTokens('scripts/generate-v34-promotion-readiness-report.mjs', [
      'buildV34PromotionReadinessReport',
      'source-safe-deployment-promotion-readiness-metadata',
      'v34-promotion-readiness-report',
    ]),
    scanTokens('scripts/promote-bitcode-canon.mjs', [
      "if (version === 'V34')",
      'const v34Gate10Command',
      'buildDerivedV34CommitMessageBody',
      'scripts/check-v34-gate10-promotion-readiness.mjs',
    ]),
    scanTokens('scripts/prepare-bitcode-spec-family-promotion.mjs', [
      "if (version === 'V34')",
      'V34 canonical system specification for deployment depth',
      '.specifications/BITCODE_SPEC_V34_PROVEN.md',
      '.bitcode/v34-promotion-readiness-report.json',
    ]),
    scanTokens('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
      '--next-draft',
      'rewritePackageReadme',
      'rewriteRuntimeDataState',
    ]),
    scanTokens('.github/workflows/v34-canon-promotion.yml', [
      "head.ref == 'version/v34'",
      'npm run promote:canon -- --version V34',
      '.specifications/BITCODE_SPEC_V34_PROVEN.md',
      'Promote V34 canon files',
    ]),
    scanTokens('.github/workflows/bitcode-gate-quality.yml', [
      'check-v34-gate10-promotion-readiness.mjs',
      'elif [ "$POINTER" = "V34" ]',
    ]),
    scanTokens('.github/workflows/bitcode-canon-quality.yml', [
      'elif [ "$POINTER" = "V34" ]',
      '--active-canon V34 --draft-target V35',
    ]),
    scanTokens('packages/btd/src/deployment-promotion-readiness-report.ts', [
      'DeploymentPromotionReadinessReport',
      'DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS',
      'V34 active / V35 draft',
    ]),
    scanTokens('scripts/specifying/src/canonical/proven-generator.js', [
      'buildV34ProvenPackage',
      'buildV34PromotionReadinessReport',
      '.bitcode/v34-promotion-readiness-report.json',
    ]),
    scanTokens('scripts/specifying/test/v34-promotion-readiness.test.js', [
      'supports V34 promotion readiness with source-safe deployment artifacts',
      'v34-promotion-readiness-report',
      'V34 Promotion Readiness',
    ]),
    scanTokens('scripts/specifying/src/canonical/v21-specifying.js', [
      '.bitcode/v34-promotion-readiness-report.json',
    ]),
    scanTokens('package.json', [
      'generate:v34-promotion-readiness',
      'check:v34-promotion-readiness',
      'check:v34-gate10',
    ]),
  ];
  const documentationEvidence = [
    scanTokens('.specifications/BITCODE_SPEC_V34.md', [
      'V34 promotion readiness canon',
      '.bitcode/v34-promotion-readiness-report.json',
      'V34 active / V35 draft',
    ]),
    scanTokens('.specifications/BITCODE_SPEC_V34_DELTA.md', [
      'Gate 10: V34 Promotion Readiness',
      '.bitcode/v34-promotion-readiness-report.json',
      'promotion scripts support V34',
    ]),
    scanTokens('.specifications/BITCODE_SPEC_V34_NOTES.md', [
      'Gate 10: V34 Promotion Readiness',
      '.bitcode/v34-promotion-readiness-report.json',
      'active V34 / draft V35',
    ]),
    scanTokens('.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md', [
      '## Gate 10 Parity',
      '.bitcode/v34-promotion-readiness-report.json',
      'closed',
    ]),
    scanTokens('.specifications/SPECIFICATIONS_ROADMAP.md', [
      'Current working gate: V34 Gate 10 Promotion Readiness',
      '.specifications/BITCODE_SPEC_V34_PROVEN.md',
    ]),
    scanTokens('README.md', [
      'check:v34-gate10',
      'v34-canon-promotion.yml',
    ]),
    scanTokens('scripts/specifying/README.md', [
      'V34 Gate 10',
      'V34` active, `V35` draft',
    ]),
  ];
  const artifactEvidence = V34_GATE_ARTIFACTS.map(scanArtifact);
  const prePromotionPosture = {
    pointer: 'V33',
    activeCanon: 'V33',
    draftTarget: 'V34',
    admitted: true,
    proofRoot: rootFor({ pointer: 'V33', activeCanon: 'V33', draftTarget: 'V34' }),
  };
  const postPromotionPosture = {
    pointer: 'V34',
    activeCanon: 'V34',
    draftTarget: 'V35',
    admitted: true,
    proofRoot: rootFor({ pointer: 'V34', activeCanon: 'V34', draftTarget: 'V35' }),
  };
  const checks = [
    'all-v34-gate-checks-wired',
    'all-v34-deployment-artifacts-source-safe',
    'v34-promotion-command-supported',
    'v34-spec-family-promotion-rewriter-supported',
    'v34-runtime-posture-rewriter-supported',
    'v34-canon-promotion-workflow-present',
    'v34-generated-artifacts-registered',
  ];

  return {
    artifactId: 'v34-promotion-readiness-report',
    schemaId: 'bitcode.v34.promotionReadiness.v1',
    version: 'V34',
    currentTarget: 'V33',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-deployment-promotion-readiness-metadata',
    prePromotionPosture,
    postPromotionPosture,
    checks: checks.map((checkId) => ({
      checkId,
      required: true,
      passed: true,
      proofRoot: rootFor({ checkId, version: 'V34' }),
    })),
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v34',
      gateBranchPattern: 'v34/gate-N-*',
      versionPromotionPullRequestTitlePrefix: 'V34 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: '.specifications/BITCODE_SPEC_V34_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v34-',
      promotionOverwritesPreviewArtifacts: true,
      secretValuesSerialized: false,
      protectedSourceSerialized: false,
    },
    gateArtifactEvidence: artifactEvidence,
    sourceEvidence,
    documentationEvidence,
    passed:
      sourceEvidence.every(allTokensPresent) &&
      documentationEvidence.every(allTokensPresent) &&
      artifactEvidence.every((artifact) => artifact.present && artifact.parseable && artifact.sourceSafe),
    closureCommand: 'pnpm run check:v34-gate10',
  };
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV34PromotionReadinessReport();
  const next = stableStringify(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);

  if (SECRET_PATTERN.test(next)) {
    throw new Error('V34 Gate 10 promotion readiness artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V34 Gate 10 promotion readiness artifact source evidence is incomplete.');
  }

  if (mode === 'check') {
    if (!existsSync(artifactFile)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v34-promotion-readiness.`);
    }
    const current = readFileSync(artifactFile, 'utf8');
    if (current !== next) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v34-promotion-readiness.`);
    }
    process.stdout.write(`V34 promotion readiness artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  mkdirSync(path.dirname(artifactFile), { recursive: true });
  writeFileSync(artifactFile, next);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
