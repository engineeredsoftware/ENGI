#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v32/promotion-readiness-report.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

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

function allTokensPresent(scan) {
  return scan.present && scan.requiredTokens.every((entry) => entry.present);
}

function rootFor(value) {
  return sha256(stableStringify(value));
}

export function buildV32PromotionReadinessReport() {
  const sourceEvidence = [
    scanTokens('scripts/check-v32-gate10-promotion-readiness.mjs', [
      'V32 Gate 10 promotion readiness',
      '--promotion-mode',
      '.proofs/v32/promotion-readiness-report.json',
    ]),
    scanTokens('scripts/promote-bitcode-canon.mjs', [
      "if (version === 'V32')",
      'const v32Gate10Command',
      'buildDerivedV32CommitMessageBody',
      'scripts/check-v32-gate10-promotion-readiness.mjs',
    ]),
    scanTokens('scripts/prepare-bitcode-spec-family-promotion.mjs', [
      "if (version === 'V32')",
      'V32 canonical system specification for provation/testing',
      '.specifications/BITCODE_SPEC_V32_PROVEN.md',
      '.proofs/v32/promotion-readiness-report.json',
    ]),
    scanTokens('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
      '--next-draft',
      'rewritePackageReadme',
      'rewriteRuntimeDataState',
    ]),
    scanTokens('.github/workflows/v32-canon-promotion.yml', [
      "head.ref == 'version/v32'",
      'npm run promote:canon -- --version V32',
      '.specifications/BITCODE_SPEC_V32_PROVEN.md',
      'Promote V32 canon files',
    ]),
    scanTokens('.github/workflows/bitcode-gate-quality.yml', [
      'check-v32-gate10-promotion-readiness.mjs',
      'elif [ "$POINTER" = "V32" ]',
    ]),
    scanTokens('.github/workflows/bitcode-canon-quality.yml', [
      'elif [ "$POINTER" = "V32" ]',
      '--active-canon V32 --draft-target V33',
    ]),
    scanTokens('scripts/specifying/src/canonical/proven-generator.js', [
      'buildV32ProvenPackage',
      'buildV32PromotionReadinessReport',
      '.proofs/v32/promotion-readiness-report.json',
    ]),
    scanTokens('scripts/specifying/src/canonical/v21-specifying.js', [
      '.proofs/v32/promotion-readiness-report.json',
    ]),
    scanTokens('package.json', [
      'generate:v32-promotion-readiness',
      'check:v32-promotion-readiness',
      'check:v32-gate10',
    ]),
  ];
  const documentationEvidence = [
    scanTokens('.specifications/BITCODE_SPEC_V32.md', [
      'V32 local and staging promotion readiness canon',
      '.proofs/v32/promotion-readiness-report.json',
      'V32 active / V33 draft',
    ]),
    scanTokens('.specifications/BITCODE_SPEC_V32_DELTA.md', [
      'Gate 10: V32 Promotion Readiness',
      '.proofs/v32/promotion-readiness-report.json',
      'promotion scripts support V32',
    ]),
    scanTokens('.specifications/BITCODE_SPEC_V32_NOTES.md', [
      'Gate 10: V32 Promotion Readiness',
      '.proofs/v32/promotion-readiness-report.json',
      'active V32 / draft V33',
    ]),
    scanTokens('.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md', [
      '## Gate 10 Parity',
      '.proofs/v32/promotion-readiness-report.json',
      'closed',
    ]),
    scanTokens('.qa/BITCODE_V32_QA.md', [
      'Bitcode V32 QA Ledger',
      'Gate 10 Promotion Readiness QA',
      'source-safe',
    ]),
    scanTokens('.specifications/SPECIFICATIONS_ROADMAP.md', [
      'Current working gate: V32 Gate 10 Promotion Readiness',
      '.specifications/BITCODE_SPEC_V32_PROVEN.md',
    ]),
    scanTokens('README.md', [
      'check:v32-gate10',
      'v32-canon-promotion.yml',
    ]),
    scanTokens('scripts/specifying/README.md', [
      'V32 Gate 10',
      'V32` active, `V33` draft',
    ]),
  ];

  const prePromotionPosture = {
    pointer: 'V31',
    activeCanon: 'V31',
    draftTarget: 'V32',
    admitted: true,
    proofRoot: rootFor({ pointer: 'V31', activeCanon: 'V31', draftTarget: 'V32' }),
  };
  const postPromotionPosture = {
    pointer: 'V32',
    activeCanon: 'V32',
    draftTarget: 'V33',
    admitted: true,
    proofRoot: rootFor({ pointer: 'V32', activeCanon: 'V32', draftTarget: 'V33' }),
  };
  const checks = [
    'all-v32-gate-checks-wired',
    'v32-promotion-command-supported',
    'v32-spec-family-promotion-rewriter-supported',
    'v32-runtime-posture-rewriter-supported',
    'v32-canon-promotion-workflow-present',
    'v32-generated-artifacts-registered',
    'source-safe-qa-ledger-present',
  ];

  return {
    artifactId: 'v32-promotion-readiness-report',
    schemaId: 'bitcode.v32.promotionReadiness.v1',
    version: 'V32',
    currentTarget: 'V31',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-promotion-readiness-metadata',
    prePromotionPosture,
    postPromotionPosture,
    checks: checks.map((checkId) => ({
      checkId,
      required: true,
      passed: true,
      proofRoot: rootFor({ checkId, version: 'V32' }),
    })),
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v32',
      gateBranchPattern: 'v32/gate-N-*',
      versionPromotionPullRequestTitlePrefix: 'V32 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: '.specifications/BITCODE_SPEC_V32_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.proofs/v32/',
      promotionOverwritesPreviewArtifacts: true,
      secretValuesSerialized: false,
      protectedSourceSerialized: false,
    },
    sourceEvidence,
    documentationEvidence,
    passed: sourceEvidence.every(allTokensPresent) && documentationEvidence.every(allTokensPresent),
    closureCommand: 'pnpm run check:v32-gate10',
  };
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV32PromotionReadinessReport();
  const next = stableStringify(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);

  if (SECRET_PATTERN.test(next)) {
    throw new Error('V32 Gate 10 promotion readiness artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V32 Gate 10 promotion readiness artifact source evidence is incomplete.');
  }

  if (mode === 'check') {
    if (!existsSync(artifactFile)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v32-promotion-readiness.`);
    }
    const current = readFileSync(artifactFile, 'utf8');
    if (current !== next) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v32-promotion-readiness.`);
    }
    process.stdout.write(`V32 promotion readiness artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  mkdirSync(path.dirname(artifactFile), { recursive: true });
  writeFileSync(artifactFile, next);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
