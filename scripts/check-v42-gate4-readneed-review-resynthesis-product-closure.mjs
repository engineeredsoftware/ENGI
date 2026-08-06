#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v42/readneed-review-resynthesis-product-closure.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url').slice(0, 18),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
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
      'Usage: node scripts/check-v42-gate4-readneed-review-resynthesis-product-closure.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V42 Gate 4 ReadNeed product closure, review/resynthesis, rejection, accepted-Need admission, source-safe runtime storage, telemetry receipts, product readback, tests, docs, workflow wiring, and proof artifact.',
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
      branch === 'version/v42' || /^v42\/gate-(?:4|[5-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V42 Gate 4+ work must occur on version/v42 or v42/gate-4..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/syntheses/read/src/read-need.ts',
    'packages/asset-packs-pipelines/syntheses/read/src/read-need-review-resynthesis.ts',
    'packages/asset-packs-pipelines/syntheses/read/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/read-need.test.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/read-need-review-resynthesis.test.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/reading-pipeline-contract.test.ts',
    'apps/uapi/app/api/read-review/route.ts',
    'apps/uapi/app/ (removed cockpit tree) ProductDepositReadWorkbench.tsx',
    'apps/uapi/tests/api/readReviewRoute.test.ts',
    'apps/uapi/tests/api/readReviewProtocolParity.test.ts',
    'scripts/specifying/src/canonical/v42-readneed-review-resynthesis-product-closure.js',
    'scripts/specifying/test/v42-readneed-review-resynthesis-product-closure.test.js',
    'scripts/generate-v42-readneed-review-resynthesis-product-closure.mjs',
    'scripts/check-v42-gate4-readneed-review-resynthesis-product-closure.mjs',
    '.specifications/BITCODE_SPEC_V42.md',
    '.specifications/BITCODE_SPEC_V42_DELTA.md',
    '.specifications/BITCODE_SPEC_V42_NOTES.md',
    '.specifications/BITCODE_SPEC_V42_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'apps/uapi/app/ (removed cockpit tree) README.md',
    'packages/asset-packs-pipelines/domain/README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V42 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v42-readneed-review-resynthesis-product-closure.mjs', '--check']);
    } catch (error) {
      failures.push(`V42 ReadNeed review/resynthesis artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v42-readneed-review-resynthesis-product-closure.test.js',
      ]);
    } catch (error) {
      failures.push(`V42 ReadNeed review/resynthesis protocol test failed: ${error.stderr || error.message}`);
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
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V42 ReadNeed review/resynthesis package tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipUapiTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/api/readReviewRoute.test.ts',
        'tests/api/readReviewProtocolParity.test.ts',
        'tests/terminalDepositReadWorkbench.test.ts',
        'tests/terminalEnterpriseReadingUxState.test.ts',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V42 ReadNeed review/resynthesis UAPI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V42 Gate 4 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v42-readneed-review-resynthesis-product-closure', 'Gate 4 artifactId must match.');
    assertCheck(
      failures,
      artifact.schemaId === 'bitcode.v42.readNeedReviewResynthesisProductClosure.v1',
      'Gate 4 schemaId must match.',
    );
    assertCheck(failures, artifact.version === 'V42' && artifact.currentTarget === 'V41', 'Gate 4 artifact must bind V42 over active V41.');
    assertCheck(failures, artifact.passed === true, 'Gate 4 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-readneed-review-resynthesis-product-closure-metadata',
      'Gate 4 artifact must declare source-safe ReadNeed review/resynthesis product closure metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 11, 'Gate 4 must cover eleven ReadNeed product closure rows.');
    assertCheck(failures, artifact.coverage.phaseCount === 4, 'Gate 4 must cover four ReadNeedComprehensionSynthesis phases.');
    assertCheck(failures, artifact.coverage.ptrrStepCount === 16, 'Gate 4 must cover sixteen PTRR steps.');
    assertCheck(failures, artifact.coverage.failsafeSequenceCount === 48, 'Gate 4 must cover forty-eight Failsafe sequences.');
    assertCheck(failures, artifact.coverage.thricifiedGenerationCount === 48, 'Gate 4 must cover forty-eight ThricifiedGeneration receipts.');
    assertCheck(failures, artifact.coverage.acceptedNeedRequiredForFindingFits === true, 'Gate 4 must require accepted Need before Finding Fits.');
    assertCheck(failures, artifact.coverage.rejectedNeedBlocksFindingFits === true, 'Gate 4 must block Finding Fits after rejected Need.');
    assertCheck(failures, artifact.coverage.terminalRuntimeReadbackCovered === true, 'Gate 4 must cover product runtime readback.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 4 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 4 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Gate 4 artifact must not expose protected prompts.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Gate 4 artifact must not expose raw provider responses.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 4 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Gate 4 artifact must not expose wallet private material.');
    assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Gate 4 artifact must not expose settlement private payloads.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 4 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 4 must not rely on legacy source roots.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 4 predicates must all pass.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V42.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V42_PARITY_MATRIX.md');
  const terminalReadme = read(root, 'apps/uapi/app/ (removed cockpit tree) README.md');
  assertCheck(failures, spec.includes('V42 Gate 4') && spec.includes('v42-readneed-review-resynthesis-product-closure'), 'V42 spec must expand Gate 4 ReadNeed product closure.');
  assertCheck(failures, parity.includes('ReadNeed product closure') && parity.includes('implemented'), 'V42 parity matrix must mark ReadNeed product closure implemented.');
  assertCheck(failures, terminalReadme.includes('V42 Gate 4') && terminalReadme.includes('ReadNeedReviewResynthesisRuntime'), 'product README must document Gate 4 ReadNeed runtime readback.');

  if (failures.length > 0) {
    process.stderr.write(`V42 Gate 4 ReadNeed product closure check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V42 Gate 4 ReadNeed product closure ok artifact=${artifact.artifactRoot}\n`);
}

main();
