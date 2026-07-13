#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v32-promotion-proof-generation-hardening.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'OiJI', 'UzI1', 'NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v32-gate9-promotion-proof-generation-hardening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 9 promotion proof generation hardening, source-safe generated artifact diffs, and branch-protection-friendly proof planning.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function everyTokenPresent(entries) {
  return entries.every((entry) => entry.requiredTokens.every((token) => token.present === true));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V31', `BITCODE_SPEC.txt must remain V31 during V32 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v32' || /^v32\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V32 work must occur on version/v32 or v32/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'scripts/generate-bitcode-proven.mjs',
    'scripts/generate-v32-promotion-proof-generation-hardening.mjs',
    'scripts/check-v32-gate9-promotion-proof-generation-hardening.mjs',
    'scripts/promote-bitcode-canon.mjs',
    'packages/specifying/src/canonical/proven-generator.js',
    'packages/specifying/src/canonical/v21-specifying.js',
    'packages/specifying/test/v32-promotion-proof-generation.test.js',
    'BITCODE_SPEC_V32.md',
    'BITCODE_SPEC_V32_DELTA.md',
    'BITCODE_SPEC_V32_NOTES.md',
    'BITCODE_SPEC_V32_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/v32-proof-coverage-matrix.mjs',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V32 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v32-promotion-proof-generation-hardening']);
    } catch (error) {
      failures.push(`V32 Gate 9 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V32 Gate 9 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    const modeIds = artifact.modes.map((mode) => mode.mode);
    assertCheck(failures, artifact.artifactId === 'v32-promotion-proof-generation-hardening', 'Gate 9 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v32.promotionProofGenerationHardening.v1', 'Gate 9 schemaId must match.');
    assertCheck(failures, artifact.version === 'V32' && artifact.currentTarget === 'V31', 'Gate 9 artifact must bind V32 over active V31.');
    assertCheck(failures, artifact.passed === true, 'Gate 9 artifact must pass.');
    assertCheck(failures, artifact.sourceSafetyVerdict === 'source-safe generated artifact diffs', 'Gate 9 artifact must record source-safe generated artifact diffs.');
    assertCheck(failures, modeIds.join(',') === 'dry-run,check,promotion-plan', 'Gate 9 artifact must enumerate dry-run, check, and promotion-plan modes.');
    assertCheck(failures, artifact.branchProtection.directMainPushAdmitted === false, 'Gate 9 must not admit direct main pushes.');
    assertCheck(failures, artifact.branchProtection.promotionPrRequired === true, 'Gate 9 must require promotion pull requests.');
    assertCheck(failures, artifact.failureTaxonomy.includes('artifact-drift'), 'Gate 9 failure taxonomy must include artifact-drift.');
    assertCheck(failures, artifact.failureTaxonomy.includes('stale-posture'), 'Gate 9 failure taxonomy must include stale-posture.');
    assertCheck(failures, artifact.proofCoverage.secretValuesSerialized === false, 'Gate 9 artifact must not serialize secret values.');
    assertCheck(failures, artifact.proofCoverage.protectedSourceSerialized === false, 'Gate 9 artifact must not serialize protected source.');
    assertCheck(failures, everyTokenPresent(artifact.sourceEvidence), 'Gate 9 source evidence tokens must all be present.');
    assertCheck(failures, everyTokenPresent(artifact.testEvidence), 'Gate 9 test evidence tokens must all be present.');
    assertCheck(failures, everyTokenPresent(artifact.documentationEvidence), 'Gate 9 documentation evidence tokens must all be present.');
  }

  const generator = read(root, 'scripts/generate-bitcode-proven.mjs');
  const provenGenerator = read(root, 'packages/specifying/src/canonical/proven-generator.js');
  const specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');
  const spec = read(root, 'BITCODE_SPEC_V32.md');
  const delta = read(root, 'BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const matrix = read(root, 'scripts/v32-proof-coverage-matrix.mjs');
  const test = read(root, 'packages/specifying/test/v32-promotion-proof-generation.test.js');

  assertCheck(failures, generator.includes('--dry-run'), 'generate-bitcode-proven must expose --dry-run.');
  assertCheck(failures, generator.includes('buildSourceSafeDiffSummary'), 'generate-bitcode-proven must build source-safe diff summaries.');
  assertCheck(failures, generator.includes('proven-stale') && generator.includes('artifact-drift') && generator.includes('missing-artifact'), 'generate-bitcode-proven must classify stale proof and artifact drift failures.');
  assertCheck(failures, provenGenerator.includes('buildV32ProvenPackage'), 'Protocol proven generator must support a V32 package.');
  assertCheck(failures, provenGenerator.includes('v32PromotionProofGenerationHardeningPassed'), 'Rendered proven markdown must summarize V32 Gate 9 hardening.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Specifying profile must include the Gate 9 generated artifact.');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V32 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('source-safe generated artifact diffs'), 'V32 docs must name source-safe generated artifact diffs.');
  }

  assertCheck(failures, /Current working gate: V32 Gate (?:9|10)\b/u.test(roadmap), 'Roadmap must track V32 Gate 9 or later as current.');
  assertCheck(failures, packageJson.includes('"generate:v32-promotion-proof-generation-hardening"'), 'package.json must expose the Gate 9 generator.');
  assertCheck(failures, packageJson.includes('"check:v32-gate9"'), 'package.json must expose check:v32-gate9.');
  assertCheck(
    failures,
    workflow.includes('check-v32-gate9-promotion-proof-generation-hardening.mjs') &&
      workflow.includes('v32-promotion-proof-generation.test.js'),
    'Gate quality workflow must run the Gate 9 checker and focused protocol test.',
  );
  assertCheck(failures, matrix.includes(ARTIFACT), 'V32 proof coverage matrix must reference the Gate 9 artifact.');
  assertCheck(failures, test.includes('supports V32 promotion proof generation hardening'), 'Focused protocol test must prove Gate 9 hardening.');

  if (failures.length) {
    process.stderr.write('V32 Gate 9 promotion proof generation hardening check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`V32 Gate 9 promotion proof generation hardening ok artifact=${ARTIFACT}\n`);
}

main();
