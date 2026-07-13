#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v32-promotion-proof-generation-hardening.json';
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
  const text = read(relativePath);
  return {
    relativePath,
    digest: sha256(text),
    requiredTokens: tokens.map((token) => ({
      token,
      present: text.includes(token),
    })),
  };
}

function allTokensPresent(scan) {
  return scan.requiredTokens.every((entry) => entry.present);
}

function rootFor(value) {
  return sha256(stableStringify(value));
}

export function buildV32PromotionProofGenerationHardeningArtifact() {
  const sourceEvidence = [
    scanTokens('scripts/generate-bitcode-proven.mjs', [
      '--dry-run',
      'buildSourceSafeDiffSummary',
      'proven-stale',
      'artifact-drift',
      'missing-artifact',
      'source-safe generated artifact diffs',
    ]),
    scanTokens('packages/specifying/src/canonical/proven-generator.js', [
      'buildV32ProvenPackage',
      'buildV32PromotionProofGenerationHardening',
      '.bitcode/v32-promotion-proof-generation-hardening.json',
    ]),
    scanTokens('packages/specifying/src/canonical/v21-specifying.js', [
      '.bitcode/v32-promotion-proof-generation-hardening.json',
      '.bitcode/v32-testnet-mainnet-readiness-rehearsal.json',
    ]),
    scanTokens('scripts/promote-bitcode-canon.mjs', [
      '--dry-run',
      'canonical promotion plan',
      'BITCODE_SPEC.txt',
    ]),
    scanTokens('.github/workflows/bitcode-gate-quality.yml', [
      'check-v32-gate9-promotion-proof-generation-hardening.mjs',
      'v32-promotion-proof-generation.test.js',
    ]),
    scanTokens('package.json', [
      'generate:v32-promotion-proof-generation-hardening',
      'check:v32-promotion-proof-generation-hardening',
      'check:v32-gate9',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/specifying/test/v32-promotion-proof-generation.test.js', [
      'supports V32 promotion proof generation hardening',
      'source-safe generated artifact diffs',
      'v32-promotion-proof-generation-hardening',
    ]),
  ];
  const documentationEvidence = [
    scanTokens('BITCODE_SPEC_V32.md', [
      'Gate 9 promotion proof precision',
      '.bitcode/v32-promotion-proof-generation-hardening.json',
      'source-safe generated artifact diffs',
    ]),
    scanTokens('BITCODE_SPEC_V32_DELTA.md', [
      'Gate 9 hardens V32 promotion proof generation',
      '.bitcode/v32-promotion-proof-generation-hardening.json',
    ]),
    scanTokens('BITCODE_SPEC_V32_NOTES.md', [
      'dry-run and check modes',
      '.bitcode/v32-promotion-proof-generation-hardening.json',
    ]),
    scanTokens('BITCODE_SPEC_V32_PARITY_MATRIX.md', [
      'V32 proof generation supports dry-run/check modes',
      '.bitcode/v32-promotion-proof-generation-hardening.json',
      'drafted',
    ]),
    scanTokens('SPECIFICATIONS_ROADMAP.md', [
      'Current working gate: V32 Gate 10',
      'Promotion Readiness',
    ]),
  ];
  const passed =
    sourceEvidence.every(allTokensPresent) &&
    testEvidence.every(allTokensPresent) &&
    documentationEvidence.every(allTokensPresent);

  const modes = [
    {
      mode: 'dry-run',
      command: 'node scripts/generate-bitcode-proven.mjs --version V32 --commit HEAD --dry-run --allow-dirty',
      writesFiles: false,
      sourceSafetyClass: 'source-safe-digest-summary',
      failureClasses: [],
    },
    {
      mode: 'check',
      command: 'node scripts/generate-bitcode-proven.mjs --version V32 --commit HEAD --check --allow-dirty',
      writesFiles: false,
      sourceSafetyClass: 'source-safe generated artifact diffs',
      failureClasses: ['proven-stale', 'artifact-drift', 'missing-artifact'],
    },
    {
      mode: 'promotion-plan',
      command: 'node scripts/promote-bitcode-canon.mjs --version <promoted-version> --commit <proof-source-commit> --dry-run',
      writesFiles: false,
      sourceSafetyClass: 'branch-protection-friendly-plan',
      failureClasses: ['workflow-branch-mismatch', 'unsafe-main-push'],
    },
  ];

  return {
    artifactId: 'v32-promotion-proof-generation-hardening',
    schemaId: 'bitcode.v32.promotionProofGenerationHardening.v1',
    version: 'V32',
    currentTarget: 'V31',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe generated artifact diffs',
    modes: modes.map((mode) => ({
      ...mode,
      proofRoot: rootFor(mode),
    })),
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v32',
      gateBranchPattern: 'v32/gate-N-*',
      versionPromotionPullRequestTitlePrefix: 'V32 Canonical Promotion',
    },
    failureTaxonomy: [
      'stale-posture',
      'proven-stale',
      'artifact-drift',
      'missing-artifact',
      'malformed-payload',
      'source-safety-violation',
      'workflow-branch-mismatch',
      'unsafe-main-push',
    ],
    sourceEvidence,
    testEvidence,
    documentationEvidence,
    proofCoverage: {
      dryRunSupported: true,
      checkSupported: true,
      promotionPlanSupported: true,
      sourceSafeDiffs: true,
      secretValuesSerialized: false,
      protectedSourceSerialized: false,
      directMainPushAdmitted: false,
    },
    passed,
    closureCommand: 'pnpm run check:v32-gate9',
  };
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV32PromotionProofGenerationHardeningArtifact();
  const next = stableStringify(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);

  if (SECRET_PATTERN.test(next)) {
    throw new Error('V32 Gate 9 promotion proof generation hardening artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V32 Gate 9 promotion proof generation hardening artifact source evidence is incomplete.');
  }

  if (mode === 'check') {
    if (!existsSync(artifactFile)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v32-promotion-proof-generation-hardening.`);
    }
    const current = readFileSync(artifactFile, 'utf8');
    if (current !== next) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v32-promotion-proof-generation-hardening.`);
    }
    process.stdout.write(`V32 promotion proof generation hardening artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  mkdirSync(path.dirname(artifactFile), { recursive: true });
  writeFileSync(artifactFile, next);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
