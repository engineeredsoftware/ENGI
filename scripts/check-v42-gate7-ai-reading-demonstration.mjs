#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v42-ai-reading-demonstration.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'Oi', 'JIUzI1Ni'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
];

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipPackageTests: false,
    skipDemonstrationTests: false,
    repoRoot: defaultRepoRoot,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--skip-demonstration-tests') args.skipDemonstrationTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

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
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v42-gate7-ai-reading-demonstration.mjs [--skip-branch-check] [--skip-package-tests] [--skip-demonstration-tests] [--repo-root <path>]',
      '',
      'Checks V42 Gate 7 AI-reading demonstration MVP, source-safety, generated artifact, docs, workflow wiring, and package tests.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V41',
    `BITCODE_SPEC.txt must remain V41 during V42 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v42' || /^v42\/gate-(?:7|8|9)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V42 Gate 7+ work must occur on version/v42 or v42/gate-7..9-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'protocol-demonstration/src/ai-reading-demonstration.js',
    'protocol-demonstration/test/v42-ai-reading-mvp.test.js',
    'protocol-demonstration/package.json',
    'protocol-demonstration/README.md',
    'scripts/specifying/src/canonical/v42-ai-reading-demonstration.js',
    'scripts/specifying/test/v42-ai-reading-demonstration.test.js',
    'scripts/generate-v42-ai-reading-demonstration.mjs',
    'scripts/check-v42-gate7-ai-reading-demonstration.mjs',
    '.specifications/BITCODE_SPEC_V42.md',
    '.specifications/BITCODE_SPEC_V42_DELTA.md',
    '.specifications/BITCODE_SPEC_V42_NOTES.md',
    '.specifications/BITCODE_SPEC_V42_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V42 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v42-ai-reading-demonstration.mjs', '--check']);
    } catch (error) {
      failures.push(`V42 AI-reading demonstration artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v42-ai-reading-demonstration.test.js',
      ]);
    } catch (error) {
      failures.push(`V42 AI-reading demonstration protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipDemonstrationTests) {
    try {
      run(root, 'npm', ['--prefix', 'protocol-demonstration', 'run', 'test:v42-ai-reading-mvp']);
    } catch (error) {
      failures.push(`V42 AI-reading demonstration runtime test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V42 Gate 7 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v42-ai-reading-demonstration', 'Gate 7 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v42.aiReadingDemonstration.v1', 'Gate 7 schemaId must match.');
    assertCheck(failures, artifact.version === 'V42' && artifact.currentTarget === 'V41', 'Gate 7 artifact must bind V42 over active V41.');
    assertCheck(failures, artifact.passed === true, 'Gate 7 artifact must pass.');
    assertCheck(failures, artifact.coverage.rowCount === 8, 'Gate 7 must cover eight AI-reading demonstration rows.');
    assertCheck(failures, artifact.coverage.baselineMode === 'public-data-only', 'Gate 7 must cover public-data-only baseline.');
    assertCheck(failures, artifact.coverage.enhancedMode === 'assetpack-enhanced-after-rights', 'Gate 7 must cover AssetPack-enhanced reading.');
    assertCheck(failures, artifact.coverage.expectedBaselineBp === 0, 'Gate 7 baseline score must be deterministic.');
    assertCheck(failures, artifact.coverage.expectedTreatmentBp === 10000, 'Gate 7 treatment score must be deterministic.');
    assertCheck(failures, artifact.coverage.minimumUpliftBp === 2400, 'Gate 7 minimum uplift must be explicit.');
    assertCheck(failures, artifact.coverage.expectedSelectedDepositId === 'deposit-auth-migration-runbook', 'Gate 7 selected deposit must be explicit.');
    assertCheck(failures, artifact.coverage.expectedFitResultState === 'worthy_fit', 'Gate 7 must prove worthy fit.');
    assertCheck(failures, artifact.coverage.protectedSourceBeforeSettlement === 'withheld_until_settlement', 'Gate 7 must withhold protected source before settlement.');
    assertCheck(failures, artifact.coverage.sourceBearingDeliveryRequiresSettlement === true, 'Gate 7 must require settlement before source-bearing delivery.');
    assertCheck(failures, artifact.coverage.deterministicLocalOnly === true, 'Gate 7 must be deterministic local demonstration.');
    assertCheck(failures, artifact.coverage.selfContainedDemonstration === true, 'Gate 7 must remain self-contained.');
    assertCheck(failures, artifact.coverage.outsideRuntimeImportRequired === false, 'Gate 7 must not require outside runtime imports.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 7 artifact must remain source-safe metadata.');
    assertCheck(failures, artifact.coverage.protectedSourcePayloadSerialized === false, 'Gate 7 artifact must not serialize protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 7 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 7 predicates must all pass.');
  }

  if (failures.length > 0) {
    process.stderr.write(`V42 Gate 7 AI-reading demonstration check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V42 Gate 7 AI-reading demonstration ok artifact=${artifact.artifactRoot}\n`);
}

main();

