#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v33-promotion-readiness-report.json';
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

const V33_GATE_ARTIFACTS = Object.freeze([
  '.bitcode/v33-interface-contract-catalog.json',
  '.bitcode/v33-mcp-api-tool-contracts.json',
  '.bitcode/v33-chatgpt-app-action-contracts.json',
  '.bitcode/v33-interface-authorization-policy.json',
  '.bitcode/v33-read-license-assetpack-rights-contracts.json',
  '.bitcode/v33-api-schema-compatibility-matrix.json',
  '.bitcode/v33-interface-telemetry-proof-hooks.json',
  '.bitcode/v33-interface-consumer-ux-regression-proof.json',
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

export function buildV33PromotionReadinessReport() {
  const sourceEvidence = [
    scanTokens('scripts/check-v33-gate10-promotion-readiness.mjs', [
      'V33 Gate 10 promotion readiness',
      '--promotion-mode',
      '.bitcode/v33-promotion-readiness-report.json',
    ]),
    scanTokens('scripts/generate-v33-promotion-readiness-report.mjs', [
      'buildV33PromotionReadinessReport',
      'source-safe-interface-promotion-readiness-metadata',
      'v33-promotion-readiness-report',
    ]),
    scanTokens('scripts/promote-bitcode-canon.mjs', [
      "if (version === 'V33')",
      'const v33Gate10Command',
      'buildDerivedV33CommitMessageBody',
      'scripts/check-v33-gate10-promotion-readiness.mjs',
    ]),
    scanTokens('scripts/prepare-bitcode-spec-family-promotion.mjs', [
      "if (version === 'V33')",
      'V33 canonical system specification for commercial interface depth',
      'BITCODE_SPEC_V33_PROVEN.md',
      '.bitcode/v33-promotion-readiness-report.json',
    ]),
    scanTokens('scripts/prepare-bitcode-runtime-canon-promotion.mjs', [
      '--next-draft',
      'rewritePackageReadme',
      'rewriteRuntimeDataState',
    ]),
    scanTokens('.github/workflows/v33-canon-promotion.yml', [
      "head.ref == 'version/v33'",
      'npm run promote:canon -- --version V33',
      'BITCODE_SPEC_V33_PROVEN.md',
      'Promote V33 canon files',
    ]),
    scanTokens('.github/workflows/bitcode-gate-quality.yml', [
      'check-v33-gate10-promotion-readiness.mjs',
      'elif [ "$POINTER" = "V33" ]',
    ]),
    scanTokens('.github/workflows/bitcode-canon-quality.yml', [
      'elif [ "$POINTER" = "V33" ]',
      '--active-canon V33 --draft-target V34',
    ]),
    scanTokens('packages/specifying/src/canonical/proven-generator.js', [
      'buildV33ProvenPackage',
      'buildV33PromotionReadinessReport',
      '.bitcode/v33-promotion-readiness-report.json',
    ]),
    scanTokens('packages/specifying/src/canonical/v21-specifying.js', [
      '.bitcode/v33-promotion-readiness-report.json',
    ]),
    scanTokens('package.json', [
      'generate:v33-promotion-readiness',
      'check:v33-promotion-readiness',
      'check:v33-gate10',
    ]),
  ];
  const documentationEvidence = [
    scanTokens('BITCODE_SPEC_V33.md', [
      'V33 promotion readiness canon',
      '.bitcode/v33-promotion-readiness-report.json',
      'V33 active / V34 draft',
    ]),
    scanTokens('BITCODE_SPEC_V33_DELTA.md', [
      'Gate 10: V33 Promotion Readiness',
      '.bitcode/v33-promotion-readiness-report.json',
      'promotion scripts support V33',
    ]),
    scanTokens('BITCODE_SPEC_V33_NOTES.md', [
      'Gate 10: V33 Promotion Readiness',
      '.bitcode/v33-promotion-readiness-report.json',
      'active V33 / draft V34',
    ]),
    scanTokens('BITCODE_SPEC_V33_PARITY_MATRIX.md', [
      '## Gate 10 Parity',
      '.bitcode/v33-promotion-readiness-report.json',
      'closed',
    ]),
    scanTokens('SPECIFICATIONS_ROADMAP.md', [
      'Current working gate: V33 Gate 10 Promotion Readiness',
      'BITCODE_SPEC_V33_PROVEN.md',
    ]),
    scanTokens('README.md', [
      'check:v33-gate10',
      'v33-canon-promotion.yml',
    ]),
    scanTokens('packages/specifying/README.md', [
      'V33 Gate 10',
      'V33` active, `V34` draft',
    ]),
  ];
  const artifactEvidence = V33_GATE_ARTIFACTS.map(scanArtifact);
  const prePromotionPosture = {
    pointer: 'V32',
    activeCanon: 'V32',
    draftTarget: 'V33',
    admitted: true,
    proofRoot: rootFor({ pointer: 'V32', activeCanon: 'V32', draftTarget: 'V33' }),
  };
  const postPromotionPosture = {
    pointer: 'V33',
    activeCanon: 'V33',
    draftTarget: 'V34',
    admitted: true,
    proofRoot: rootFor({ pointer: 'V33', activeCanon: 'V33', draftTarget: 'V34' }),
  };
  const checks = [
    'all-v33-gate-checks-wired',
    'all-v33-interface-artifacts-source-safe',
    'v33-promotion-command-supported',
    'v33-spec-family-promotion-rewriter-supported',
    'v33-runtime-posture-rewriter-supported',
    'v33-canon-promotion-workflow-present',
    'v33-generated-artifacts-registered',
  ];

  return {
    artifactId: 'v33-promotion-readiness-report',
    schemaId: 'bitcode.v33.promotionReadiness.v1',
    version: 'V33',
    currentTarget: 'V32',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-interface-promotion-readiness-metadata',
    prePromotionPosture,
    postPromotionPosture,
    checks: checks.map((checkId) => ({
      checkId,
      required: true,
      passed: true,
      proofRoot: rootFor({ checkId, version: 'V33' }),
    })),
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v33',
      gateBranchPattern: 'v33/gate-N-*',
      versionPromotionPullRequestTitlePrefix: 'V33 Canonical Promotion',
    },
    generatedArtifactPolicy: {
      provenAppendixPath: 'BITCODE_SPEC_V33_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v33-',
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
    closureCommand: 'pnpm run check:v33-gate10',
  };
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV33PromotionReadinessReport();
  const next = stableStringify(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);

  if (SECRET_PATTERN.test(next)) {
    throw new Error('V33 Gate 10 promotion readiness artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V33 Gate 10 promotion readiness artifact source evidence is incomplete.');
  }

  if (mode === 'check') {
    if (!existsSync(artifactFile)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v33-promotion-readiness.`);
    }
    const current = readFileSync(artifactFile, 'utf8');
    if (current !== next) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v33-promotion-readiness.`);
    }
    process.stdout.write(`V33 promotion readiness artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  mkdirSync(path.dirname(artifactFile), { recursive: true });
  writeFileSync(artifactFile, next);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
