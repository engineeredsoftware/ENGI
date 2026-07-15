#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  V45_PROOF_FAMILY_ARTIFACT_PATHS,
  V45_PROOF_FAMILY_GENERATED_OUTPUTS,
  V45_PROOF_FAMILY_PROVEN_PATH,
  V45_PROOF_FAMILY_SOURCE_SAFETY_VERDICT,
} from '../scripts/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

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

const FORBIDDEN_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  JWT_HEADER_PREFIX,
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
  '-----BEGIN ',
]);

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function runNode(root, args) {
  return execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8' }).trim();
}

function runCommand(root, command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipPackageTests: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v45-gate16-proof-families-generated-artifacts.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V45 Gate 16 deterministic proof-family generated artifacts and source-safe proof appendices.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function assertIncludesAll(failures, content, phrases, location) {
  for (const phrase of phrases) {
    assertCheck(failures, content.includes(phrase), `${location} must include: ${phrase}`);
  }
}

function assertNoForbiddenMarker(failures, content, location) {
  for (const marker of FORBIDDEN_MARKERS) {
    assertCheck(failures, !content.includes(marker), `${location} contains forbidden secret-shaped marker.`);
  }
}

function parseJsonFile(root, relativePath, failures) {
  try {
    return JSON.parse(read(root, relativePath));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    failures.push(`${relativePath} is not valid JSON: ${detail}`);
    return null;
  }
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

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 Gate 16 work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v45' || /^v45\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 work must occur on version/v45 or v45/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V45.md',
    'BITCODE_SPEC_V45_PARITY_MATRIX.md',
    'BITCODE_SPEC.txt',
    'package.json',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'scripts/specifying/src/canonical/v45-proof-family-artifacts.js',
    'scripts/specifying/test/v45-proof-family-artifacts.test.js',
    'scripts/generate-v45-proof-family-artifacts.mjs',
    'scripts/check-v45-gate16-proof-families-generated-artifacts.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    ...V45_PROOF_FAMILY_GENERATED_OUTPUTS,
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 16 file: ${relativePath}`);
  }

  const packageJson = read(root, 'package.json');
  const spec = read(root, 'BITCODE_SPEC_V45.md');
  const parity = read(root, 'BITCODE_SPEC_V45_PARITY_MATRIX.md');
  const source = read(root, 'scripts/specifying/src/canonical/v45-proof-family-artifacts.js');
  const test = read(root, 'scripts/specifying/test/v45-proof-family-artifacts.test.js');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  assertIncludesAll(failures, packageJson, [
    '"generate:v45-proof-families": "node scripts/generate-v45-proof-family-artifacts.mjs"',
    '"check:v45-proof-families": "node scripts/generate-v45-proof-family-artifacts.mjs --check"',
    '"check:v45-gate16": "node scripts/check-v45-gate16-proof-families-generated-artifacts.mjs"',
  ], 'package.json');

  assertIncludesAll(failures, source, [
    'V45_PROOF_FAMILY_ARTIFACT_PATHS',
    'V45_PROOF_FAMILY_GENERATED_OUTPUTS',
    'buildV45ProofFamilyArtifacts',
    'buildV45ProofFamilyProvenMarkdown',
    'protectedSourceSerialized: false',
    'rawPromptSerialized: false',
    'rawProviderResponseSerialized: false',
    'walletPrivateMaterialSerialized: false',
    'privateSettlementPayloadSerialized: false',
  ], 'v45-proof-family-artifacts.js');

  assertIncludesAll(failures, test, [
    'builds all nine V45 proof-family artifacts',
    'keeps generated V45 proof artifacts source-safe',
    'renders a source-safe V45 PROVEN appendix',
    'V45_PROOF_FAMILY_ARTIFACT_PATHS',
  ], 'v45-proof-family-artifacts.test.js');

  assertIncludesAll(failures, spec, [
    '.bitcode/v45-inference-synthesis-proof.json',
    '.bitcode/v45-prompt-completeness-proof.json',
    '.bitcode/v45-static-code-analysis-proof.json',
    '.bitcode/v45-verification-decisions-proof.json',
    '.bitcode/v45-selection-materialization-proof.json',
    '.bitcode/v45-authorization-sensitive-flow-proof.json',
    '.bitcode/v45-settlement-source-to-shares-proof.json',
    '.bitcode/v45-disclosure-boundary-proof.json',
    '.bitcode/v45-proof-contract-proof.json',
    'Minimum generated appendix rendered contents',
  ], 'BITCODE_SPEC_V45.md');

  assertIncludesAll(failures, parity, [
    'Gate 16 implementation readback',
    'scripts/specifying/src/canonical/v45-proof-family-artifacts.js',
    'scripts/generate-v45-proof-family-artifacts.mjs',
    'scripts/specifying/test/v45-proof-family-artifacts.test.js',
    'check:v45-gate16',
  ], 'BITCODE_SPEC_V45_PARITY_MATRIX.md');

  assertIncludesAll(failures, gateWorkflow, [
    'check-v45-gate16-proof-families-generated-artifacts.mjs',
    '--skip-package-tests # check:v45-gate16',
  ], 'bitcode-gate-quality.yml');
  assertIncludesAll(failures, canonWorkflow, [
    'check-v45-gate16-proof-families-generated-artifacts.mjs',
    '--skip-package-tests # check:v45-gate16',
  ], 'bitcode-canon-quality.yml');

  for (const artifactPath of V45_PROOF_FAMILY_ARTIFACT_PATHS) {
    const content = exists(root, artifactPath) ? read(root, artifactPath) : '';
    assertNoForbiddenMarker(failures, content, artifactPath);
    const artifact = parseJsonFile(root, artifactPath, failures);
    if (!artifact) continue;
    assertCheck(failures, artifact.version === 'V45', `${artifactPath} must declare V45.`);
    assertCheck(failures, artifact.currentTarget === 'V44', `${artifactPath} must declare V44 currentTarget.`);
    assertCheck(failures, artifact.sourceSafetyVerdict === V45_PROOF_FAMILY_SOURCE_SAFETY_VERDICT, `${artifactPath} source-safety verdict drift.`);
    assertCheck(failures, artifact.passed === true, `${artifactPath} must pass.`);
    assertCheck(failures, artifact.status === 'pass', `${artifactPath} must carry pass status.`);
    assertCheck(failures, artifact.sourceSafety?.protectedSourceSerialized === false, `${artifactPath} must not serialize protected source.`);
    assertCheck(failures, artifact.sourceSafety?.rawPromptSerialized === false, `${artifactPath} must not serialize raw prompt payloads.`);
    assertCheck(failures, artifact.sourceSafety?.rawProviderResponseSerialized === false, `${artifactPath} must not serialize raw provider responses.`);
    assertCheck(failures, artifact.sourceSafety?.walletPrivateMaterialSerialized === false, `${artifactPath} must not serialize wallet private material.`);
    assertCheck(failures, artifact.sourceSafety?.credentialsSerialized === false, `${artifactPath} must not serialize credentials.`);
    assertCheck(failures, artifact.sourceSafety?.privateSettlementPayloadSerialized === false, `${artifactPath} must not serialize private settlement payloads.`);
    assertCheck(failures, Array.isArray(artifact.memberInventory) && artifact.memberInventory.length > 0, `${artifactPath} must include members.`);
    assertCheck(failures, Array.isArray(artifact.theoremInventory) && artifact.theoremInventory.length > 0, `${artifactPath} must include theorems.`);
    assertCheck(failures, Array.isArray(artifact.replayStepInventory) && artifact.replayStepInventory.length > 0, `${artifactPath} must include replay steps.`);
    assertCheck(failures, Array.isArray(artifact.witnessArtifactInventory) && artifact.witnessArtifactInventory.length > 0, `${artifactPath} must include witnesses.`);
  }

  if (exists(root, V45_PROOF_FAMILY_PROVEN_PATH)) {
    const proven = read(root, V45_PROOF_FAMILY_PROVEN_PATH);
    assertNoForbiddenMarker(failures, proven, V45_PROOF_FAMILY_PROVEN_PATH);
    assertIncludesAll(failures, proven, [
      'Aggregate Proof Verdict',
      'Exact Proof-Family Inventory',
      'Per-Family Member Inventory',
      'Per-Family Theorem Inventory',
      'Replay-Step Inventories And Theorem Bindings',
      'Witness Artifact Inventories',
      'Generated Artifact Inventories',
      'Scenario And Run Coverage Matrices',
      'proof-source commit',
      'missing, stale, contradictory, or unsafe',
    ], V45_PROOF_FAMILY_PROVEN_PATH);
  }

  try {
    const output = runNode(root, ['scripts/generate-v45-proof-family-artifacts.mjs', '--check']);
    assertCheck(failures, output.includes('V45 proof-family artifacts ok'), 'V45 proof-family artifact check did not report success.');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    failures.push(`V45 proof-family artifact check failed: ${detail}`);
  }

  try {
    const output = runNode(root, [
      'scripts/check-bitcode-spec-family.mjs',
      '--version',
      'V45',
      '--mode',
      'draft',
      '--current-target',
      'V44',
    ]);
    assertCheck(failures, output.includes('Bitcode spec family ok for V45'), 'V45 draft spec-family check did not report success.');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    failures.push(`V45 draft spec-family check failed: ${detail}`);
  }

  try {
    const output = runNode(root, [
      'scripts/check-bitcode-canonical-inputs.mjs',
      '--current-target',
      'V45',
      '--skip-pointer-check',
    ]);
    assertCheck(failures, output.includes('Bitcode canonical inputs ok for V45'), 'V45 canonical input check did not report success.');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    failures.push(`V45 canonical input check failed: ${detail}`);
  }

  if (!args.skipPackageTests) {
    try {
      const output = runCommand(root, 'pnpm', [
        '--filter',
        '@bitcode/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v45-proof-family-artifacts.test.js',
      ]);
      assertCheck(failures, output.includes('pass'), 'V45 proof-family package test did not report pass.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      failures.push(`V45 proof-family package test failed: ${detail}`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 16 proof families and generated artifacts check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 16 proof families and generated artifacts check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
