#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v40-local-staging-rehearsal-automation.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  String.fromCharCode(101, 121, 74, 104, 98, 71, 99, 105, 79, 105, 74, 73, 85, 122, 73, 49, 78, 105),
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

function run(root, command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function commandExists(root, command) {
  try {
    execFileSync('sh', ['-lc', `command -v ${command}`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
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
      'Usage: node scripts/check-v40-gate9-local-staging-rehearsal-automation.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V40 Gate 9 local/staging-testnet rehearsal automation, lane-bound secret-family checks, source-safe receipts, harness readback, docs, workflows, and generated artifact freshness.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function parseJson(output, failures, label) {
  try {
    return JSON.parse(output);
  } catch (error) {
    failures.push(`${label} did not emit JSON: ${error.message}`);
    return null;
  }
}

function runFocusedTests(root, failures) {
  const commands = [
    ['node', ['--test', '--test-force-exit', 'packages/specifying/test/v40-local-staging-rehearsal-automation.test.js']],
  ];

  if (commandExists(root, 'pnpm')) {
    commands.push(
      ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--runTestsByPath', 'src/__tests__/asset-pack-host-plan.test.ts', '--runInBand', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--runTestsByPath', 'src/__tests__/reading-local-staging-rehearsal.test.ts', '--runInBand', '--forceExit']],
    );
  }

  for (const [command, commandArgs] of commands) {
    try {
      run(root, command, commandArgs);
    } catch (error) {
      failures.push(`Gate 9 focused test failed for ${command} ${commandArgs.join(' ')}: ${error.stderr || error.message}`);
      return;
    }
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

  assertCheck(failures, pointer === 'V39', `BITCODE_SPEC.txt must remain V39 during V40 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v40' || /^v40\/gate-(?:9|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V40 Gate 9+ work must occur on version/v40 or v40/gate-9..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/rehearse-v40-local-staging-testnet.mjs',
    'scripts/generate-v40-local-staging-rehearsal-automation.mjs',
    'scripts/check-v40-gate9-local-staging-rehearsal-automation.mjs',
    'packages/specifying/src/canonical/v40-local-staging-rehearsal-automation.js',
    'packages/specifying/test/v40-local-staging-rehearsal-automation.test.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/pipeline-hosts/src/dev/run-asset-pack-sandbox-host.ts',
    'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
    'packages/asset-packs-pipelines/domain/src/reading-local-staging-rehearsal.ts',
    'apps/uapi/app/api/pipeline-host/asset-pack/preflight.ts',
    'apps/uapi/app/api/pipeline-host/asset-pack/runner.ts',
    'BITCODE_SPEC_V40.md',
    'BITCODE_SPEC_V40_DELTA.md',
    'BITCODE_SPEC_V40_NOTES.md',
    'BITCODE_SPEC_V40_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V40 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v40-local-staging-rehearsal-automation.mjs', '--check']);
    } catch (error) {
      failures.push(`V40 local/staging rehearsal automation artifact check failed: ${error.stderr || error.message}`);
    }
  }

  let localReceipt = null;
  let stagingReceipt = null;
  if (failures.length === 0) {
    const dryRunEnv = {
      ...process.env,
      OPENAI_API_KEY: `${['sk', 'proj'].join('-')}-dummy-do-not-serialize-000000000000`,
      VERCEL_OIDC_TOKEN: 'oidc_dummy_do_not_serialize',
      BITCODE_RUN_VERCEL_SANDBOX_HARNESS: '1',
      BITCODE_ASSET_PACK_REAL_INFERENCE: '1',
      BITCODE_PIPELINE_STREAM_TO_DATABASE: '1',
      SUPABASE_URL: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
      SUPABASE_ANON_KEY: 'anon_dummy_do_not_serialize',
      SUPABASE_SECRET_KEY: 'admin_dummy_do_not_serialize',
    };
    const localOutput = run(root, 'node', ['scripts/rehearse-v40-local-staging-testnet.mjs', '--lane', 'local', '--dry-run', '--json'], { env: dryRunEnv });
    const stagingOutput = run(root, 'node', ['scripts/rehearse-v40-local-staging-testnet.mjs', '--lane', 'staging-testnet', '--dry-run', '--json'], { env: dryRunEnv });
    localReceipt = parseJson(localOutput, failures, 'local rehearsal dry run');
    stagingReceipt = parseJson(stagingOutput, failures, 'staging-testnet rehearsal dry run');

    for (const marker of ['dummy-do-not-serialize', dryRunEnv.OPENAI_API_KEY, dryRunEnv.SUPABASE_SECRET_KEY, dryRunEnv.VERCEL_OIDC_TOKEN]) {
      assertCheck(failures, !localOutput.includes(marker), `Local dry-run receipt must not serialize secret value ${marker}.`);
      assertCheck(failures, !stagingOutput.includes(marker), `Staging dry-run receipt must not serialize secret value ${marker}.`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    runFocusedTests(root, failures);
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V40 Gate 9 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v40-local-staging-rehearsal-automation', 'Gate 9 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v40.localStagingRehearsalAutomation.v1', 'Gate 9 schemaId must match.');
    assertCheck(failures, artifact.version === 'V40' && artifact.currentTarget === 'V39', 'Gate 9 artifact must bind V40 over active V39.');
    assertCheck(failures, artifact.passed === true, 'Gate 9 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-local-staging-rehearsal-automation-metadata',
      'Gate 9 artifact must declare source-safe rehearsal automation metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 10, 'Gate 9 must cover ten rehearsal automation rows.');
    assertCheck(failures, artifact.coverage.laneCount === 2, 'Gate 9 must cover local and staging-testnet lanes.');
    assertCheck(failures, artifact.coverage.environmentFamilyCount === 8, 'Gate 9 must cover eight environment secret families.');
    assertCheck(failures, artifact.coverage.allCriticalSurfacesClosed === true, 'Gate 9 must close all critical rehearsal automation surfaces.');
    assertCheck(failures, artifact.coverage.sourceSafeOperatorReceiptsCovered === true, 'Gate 9 must cover source-safe operator receipts.');
    assertCheck(failures, artifact.coverage.databaseStreamReadbackCovered === true, 'Gate 9 must cover database stream/readback.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetBlocked === true, 'Gate 9 must block value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.noForbiddenPayloadsSerialized === true, 'Gate 9 must serialize no forbidden payloads.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 9 predicates must all pass.');
    assertCheck(failures, artifact.sourceSafety.credentialsSerialized === false, 'Gate 9 artifact must not serialize credentials.');
    assertCheck(failures, artifact.sourceSafety.liveRehearsalLogPayloadSerialized === false, 'Gate 9 artifact must not serialize live rehearsal log payloads.');
  }

  if (localReceipt) {
    assertCheck(failures, localReceipt.laneId === 'local', 'Local dry-run receipt must identify local lane.');
    assertCheck(failures, localReceipt.ready === true, 'Local dry-run receipt should be ready under dummy source-safe env.');
    assertCheck(failures, localReceipt.sourceSafety.secretValueSerialized === false, 'Local receipt must not serialize secret values.');
  }
  if (stagingReceipt) {
    assertCheck(failures, stagingReceipt.laneId === 'staging-testnet', 'Staging dry-run receipt must identify staging-testnet lane.');
    assertCheck(failures, stagingReceipt.ready === true, 'Staging dry-run receipt should be ready under dummy source-safe env.');
    assertCheck(failures, stagingReceipt.stagingProjectRef === 'tkpyosihuouusyaxtbau', 'Staging receipt must bind staging-testnet project ref.');
    assertCheck(failures, stagingReceipt.sourceSafety.secretValueSerialized === false, 'Staging receipt must not serialize secret values.');
  }

  if (failures.length) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V40 Gate 9 local/staging-testnet rehearsal automation proof passed.\n');
}

main();
