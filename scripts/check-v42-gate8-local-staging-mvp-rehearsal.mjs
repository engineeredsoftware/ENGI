#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v42-local-staging-mvp-rehearsal.json';

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

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipPackageTests: false,
    skipUapiTests: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
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

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v42-gate8-local-staging-mvp-rehearsal.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V42 Gate 8 local/staging-testnet full MVP rehearsal artifact, source-safe operator receipts, package tests, docs, and workflow wiring.',
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

function runFocusedTests(root, failures, args) {
  const commands = [
    ['node', ['--test', '--test-force-exit', 'packages/protocol/test/v42-local-staging-mvp-rehearsal.test.js']],
  ];

  if (!args.skipPackageTests && commandExists(root, 'pnpm')) {
    commands.push(
      ['pnpm', ['--filter', '@bitcode/pipeline-asset-pack', 'exec', 'jest', '--config', 'jest.config.cjs', '--runTestsByPath', 'src/__tests__/reading-local-staging-rehearsal.test.ts', '--runInBand', '--forceExit']],
    );
  }

  if (!args.skipUapiTests && commandExists(root, 'pnpm')) {
    commands.push(
      ['pnpm', ['--dir', 'uapi', 'exec', 'jest', '--runTestsByPath', 'tests/api/pipelineHarnessPreflight.test.ts', 'tests/api/pipelineHarnessRoute.test.ts', '--runInBand']],
    );
  }

  for (const [command, commandArgs] of commands) {
    try {
      run(root, command, commandArgs);
    } catch (error) {
      failures.push(`Gate 8 focused test failed for ${command} ${commandArgs.join(' ')}: ${error.stderr || error.message}`);
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

  assertCheck(
    failures,
    pointer === 'V41',
    `BITCODE_SPEC.txt must remain V41 during V42 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v42' || /^v42\/gate-(?:8|9)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V42 Gate 8+ work must occur on version/v42 or v42/gate-8..9-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/rehearse-v42-local-staging-mvp.mjs',
    'scripts/generate-v42-local-staging-mvp-rehearsal.mjs',
    'scripts/check-v42-gate8-local-staging-mvp-rehearsal.mjs',
    'packages/protocol/src/canonical/v42-local-staging-mvp-rehearsal.js',
    'packages/protocol/test/v42-local-staging-mvp-rehearsal.test.js',
    'packages/pipelines/asset-pack/src/reading-local-staging-rehearsal.ts',
    'packages/pipelines/asset-pack/src/__tests__/reading-local-staging-rehearsal.test.ts',
    'uapi/app/api/pipeline-harness/asset-pack/preflight.ts',
    'uapi/app/api/pipeline-harness/asset-pack/runner.ts',
    'uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
    'BITCODE_SPEC_V42.md',
    'BITCODE_SPEC_V42_DELTA.md',
    'BITCODE_SPEC_V42_NOTES.md',
    'BITCODE_SPEC_V42_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/protocol/README.md',
    'packages/pipelines/asset-pack/README.md',
    'uapi/app/terminal/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V42 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v42-local-staging-mvp-rehearsal.mjs', '--check']);
    } catch (error) {
      failures.push(`V42 local/staging MVP rehearsal artifact check failed: ${error.stderr || error.message}`);
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
      BITCODE_ENABLE_PIPELINE_HARNESS_API: '1',
      BITCODE_ASSET_PACK_REAL_INFERENCE: '1',
      BITCODE_PIPELINE_STREAM_TO_DATABASE: '1',
      SUPABASE_URL: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
      SUPABASE_ANON_KEY: 'anon_dummy_do_not_serialize',
      SUPABASE_SECRET_KEY: 'admin_dummy_do_not_serialize',
    };
    const localOutput = run(root, 'node', ['scripts/rehearse-v42-local-staging-mvp.mjs', '--lane', 'local', '--dry-run', '--json'], { env: dryRunEnv });
    const stagingOutput = run(root, 'node', ['scripts/rehearse-v42-local-staging-mvp.mjs', '--lane', 'staging-testnet', '--dry-run', '--json'], { env: dryRunEnv });
    localReceipt = parseJson(localOutput, failures, 'local V42 rehearsal dry run');
    stagingReceipt = parseJson(stagingOutput, failures, 'staging-testnet V42 rehearsal dry run');

    for (const marker of ['dummy-do-not-serialize', dryRunEnv.OPENAI_API_KEY, dryRunEnv.SUPABASE_SECRET_KEY, dryRunEnv.VERCEL_OIDC_TOKEN]) {
      assertCheck(failures, !localOutput.includes(marker), `Local dry-run receipt must not serialize secret value ${marker}.`);
      assertCheck(failures, !stagingOutput.includes(marker), `Staging dry-run receipt must not serialize secret value ${marker}.`);
    }
  }

  if (failures.length === 0) {
    runFocusedTests(root, failures, args);
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V42 Gate 8 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v42-local-staging-mvp-rehearsal', 'Gate 8 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v42.localStagingMvpRehearsal.v1', 'Gate 8 schemaId must match.');
    assertCheck(failures, artifact.version === 'V42' && artifact.currentTarget === 'V41', 'Gate 8 artifact must bind V42 over active V41.');
    assertCheck(failures, artifact.passed === true, 'Gate 8 artifact must pass.');
    assertCheck(failures, artifact.coverage.rowCount === 14, 'Gate 8 must cover fourteen rehearsal rows.');
    assertCheck(failures, artifact.coverage.laneCount === 2, 'Gate 8 must cover local and staging-testnet lanes.');
    assertCheck(failures, artifact.coverage.stageCount === 7, 'Gate 8 must cover the complete MVP stage path.');
    assertCheck(failures, artifact.coverage.gateArtifactCount === 6, 'Gate 8 must bind Gates 2 through 7 artifacts.');
    assertCheck(failures, artifact.coverage.stagingProjectRef === 'tkpyosihuouusyaxtbau', 'Gate 8 must bind staging-testnet Supabase project.');
    assertCheck(failures, artifact.coverage.depositingCovered === true, 'Gate 8 must cover Depositing.');
    assertCheck(failures, artifact.coverage.readNeedReviewCovered === true, 'Gate 8 must cover ReadNeed review.');
    assertCheck(failures, artifact.coverage.readFitsFindingCovered === true, 'Gate 8 must cover Finding Fits.');
    assertCheck(failures, artifact.coverage.settlementRightsDeliveryCovered === true, 'Gate 8 must cover settlement rights and delivery.');
    assertCheck(failures, artifact.coverage.aiReadingDemonstrationCovered === true, 'Gate 8 must cover AI-reading demonstration proof.');
    assertCheck(failures, artifact.coverage.richTelemetryReadbackCovered === true, 'Gate 8 must cover rich telemetry readback.');
    assertCheck(failures, artifact.coverage.mainnetValueBearingBlocked === true, 'Gate 8 must block value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 8 artifact must be source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourcePayloadSerialized === false, 'Gate 8 artifact must not serialize protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 8 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 8 artifact must not serialize credentials.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 8 predicates must all pass.');
    assertCheck(failures, artifact.sourceSafety.liveRehearsalLogPayloadSerialized === false, 'Gate 8 artifact must not serialize live rehearsal logs.');
  }

  if (localReceipt) {
    assertCheck(failures, localReceipt.laneId === 'local', 'Local dry-run receipt must identify local lane.');
    assertCheck(failures, localReceipt.ready === true, 'Local dry-run receipt should be ready under dummy source-safe env.');
    assertCheck(failures, localReceipt.currentTarget === 'V41', 'Local dry-run receipt must bind V42 over active V41.');
    assertCheck(failures, localReceipt.sourceSafety.secretValueSerialized === false, 'Local receipt must not serialize secret values.');
    assertCheck(failures, localReceipt.sourceSafety.valueBearingMainnetAdmitted === false, 'Local receipt must block value-bearing mainnet.');
  }
  if (stagingReceipt) {
    assertCheck(failures, stagingReceipt.laneId === 'staging-testnet', 'Staging dry-run receipt must identify staging-testnet lane.');
    assertCheck(failures, stagingReceipt.ready === true, 'Staging dry-run receipt should be ready under dummy source-safe env.');
    assertCheck(failures, stagingReceipt.stagingProjectRef === 'tkpyosihuouusyaxtbau', 'Staging receipt must bind staging-testnet project ref.');
    assertCheck(failures, stagingReceipt.stagingRestHost === 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/', 'Staging receipt must bind staging-testnet REST host.');
    assertCheck(failures, stagingReceipt.sourceSafety.secretValueSerialized === false, 'Staging receipt must not serialize secret values.');
    assertCheck(failures, stagingReceipt.sourceSafety.valueBearingMainnetAdmitted === false, 'Staging receipt must block value-bearing mainnet.');
  }

  if (failures.length > 0) {
    process.stderr.write(`V42 Gate 8 local/staging MVP rehearsal check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V42 Gate 8 local/staging MVP rehearsal ok artifact=${artifact.artifactRoot}\n`);
}

main();
