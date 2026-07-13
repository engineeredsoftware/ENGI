#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v39-read-need-review-resynthesis.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JIUzI1Ni'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
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
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipPackageTests: false,
    skipUapiTests: false,
    repoRoot: defaultRepoRoot,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v39-gate4-read-need-review-resynthesis.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 4 ReadNeed review, resynthesis, rejected posture, accepted-Need admission, source-safe runtime storage, telemetry receipts, tests, docs, workflow wiring, and proof artifact.',
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
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V38',
    `BITCODE_SPEC.txt must remain V38 during V39 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v39' || /^v39\/gate-(?:4|[5-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 4+ work must occur on version/v39 or v39/gate-4..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/read-need-review-resynthesis.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/read-need.test.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/read-need-review-resynthesis.test.ts',
    'uapi/app/api/read-review/route.ts',
    'uapi/tests/api/readReviewRoute.test.ts',
    'uapi/tests/api/readReviewProtocolParity.test.ts',
    'packages/specifying/src/canonical/v39-read-need-review-resynthesis.js',
    'packages/specifying/test/v39-read-need-review-resynthesis.test.js',
    'scripts/generate-v39-read-need-review-resynthesis.mjs',
    'scripts/check-v39-gate4-read-need-review-resynthesis.mjs',
    'BITCODE_SPEC_V39.md',
    'BITCODE_SPEC_V39_DELTA.md',
    'BITCODE_SPEC_V39_NOTES.md',
    'BITCODE_SPEC_V39_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/asset-packs-pipelines/domain/README.md',
    'packages/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v39-read-need-review-resynthesis.mjs', '--check']);
    } catch (error) {
      failures.push(`V39 ReadNeed review/resynthesis artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'packages/specifying/test/v39-read-need-review-resynthesis.test.js',
      ]);
    } catch (error) {
      failures.push(`V39 ReadNeed review/resynthesis protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/asset-packs-pipelines-domain',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/__tests__/read-need.test.ts',
        'src/__tests__/read-need-review-resynthesis.test.ts',
        'src/__tests__/reading-pipeline-contract.test.ts',
        'src/__tests__/v32-reading-pipeline-proof-coverage.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V39 ReadNeed review/resynthesis package tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipUapiTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/api/readReviewRoute.test.ts',
        'tests/api/readReviewProtocolParity.test.ts',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V39 ReadNeed review/resynthesis UAPI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V39 Gate 4 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-read-need-review-resynthesis', 'Gate 4 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.readNeedReviewResynthesis.v1', 'Gate 4 schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Gate 4 artifact must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Gate 4 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-read-need-review-resynthesis-metadata',
      'Gate 4 artifact must declare source-safe ReadNeed review/resynthesis metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 9, 'Gate 4 must cover nine ReadNeed review/resynthesis rows.');
    assertCheck(failures, artifact.coverage.phaseCount === 4, 'Gate 4 must cover four ReadNeedComprehensionSynthesis phases.');
    assertCheck(failures, artifact.coverage.ptrrStepCount === 16, 'Gate 4 must cover sixteen PTRR steps.');
    assertCheck(failures, artifact.coverage.thricifiedGenerationCount === 48, 'Gate 4 must cover forty-eight ThricifiedGeneration receipts.');
    assertCheck(failures, artifact.coverage.acceptedNeedRequiredForFindingFits === true, 'Gate 4 must require accepted Need before Finding Fits.');
    assertCheck(failures, artifact.coverage.rejectedNeedBlocksFindingFits === true, 'Gate 4 must block Finding Fits after rejected Need.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 4 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 4 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Gate 4 artifact must not expose raw provider response.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 4 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 4 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 4 must not rely on legacy source roots.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 4 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V39.md');
  const parity = read(root, 'BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const packageReadme = read(root, 'packages/asset-packs-pipelines/domain/README.md');
  assertCheck(failures, spec.includes('v39-read-need-review-resynthesis'), 'V39 spec must name the Gate 4 artifact.');
  assertCheck(failures, parity.includes('Gate 4 Parity'), 'V39 parity matrix must include Gate 4 parity.');
  assertCheck(failures, packageReadme.includes('ReadNeed review'), 'AssetPack package README must document ReadNeed review runtime.');

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 4 ReadNeed review/resynthesis check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 4 ReadNeed review/resynthesis ok artifact=${artifact.artifactRoot}\n`);
}

main();
