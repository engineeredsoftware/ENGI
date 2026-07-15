#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v43-cross-route-rehearsal-telemetry-repair.json';

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
      'Usage: node scripts/check-v43-gate9-cross-route-rehearsal-telemetry-repair.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V43 Gate 9 cross-route rehearsal, telemetry, synchronization, repair, source-safety, docs, tests, and workflow wiring.',
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
    ['node', ['--test', '--test-force-exit', 'scripts/specifying/test/v43-cross-route-rehearsal-telemetry-repair.test.js']],
  ];

  if (!args.skipPackageTests && commandExists(root, 'pnpm')) {
    commands.push(
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--runTestsByPath', 'src/__tests__/deposit-asset-pack-option-admission.test.ts', 'src/__tests__/reading-local-staging-rehearsal.test.ts', '--runInBand', '--forceExit']],
    );
  }

  if (!args.skipUapiTests && commandExists(root, 'pnpm')) {
    commands.push(
      ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/depositPageClient.test.tsx', 'tests/readPageClient.test.tsx', 'tests/packsPageClient.test.tsx', 'tests/packActivityModel.test.ts', '--runInBand']],
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V42',
    `BITCODE_SPEC.txt must remain V42 during V43 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v43' || /^v43\/gate-(?:9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V43 Gate 9+ work must occur on version/v43 or v43/gate-9..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/rehearse-v43-cross-route-product-flow.mjs',
    'scripts/generate-v43-cross-route-rehearsal-telemetry-repair.mjs',
    'scripts/check-v43-gate9-cross-route-rehearsal-telemetry-repair.mjs',
    'scripts/specifying/src/canonical/v43-cross-route-rehearsal-telemetry-repair.js',
    'scripts/specifying/test/v43-cross-route-rehearsal-telemetry-repair.test.js',
    'apps/uapi/app/deposit/DepositPageClient.tsx',
    'apps/uapi/app/read/ReadPageClient.tsx',
    'apps/uapi/app/packs/PacksPageClient.tsx',
    'apps/uapi/app/api/packs/activity/route.ts',
    'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
    '.specifications/BITCODE_SPEC_V43.md',
    '.specifications/BITCODE_SPEC_V43_DELTA.md',
    '.specifications/BITCODE_SPEC_V43_NOTES.md',
    '.specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V43 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v43-cross-route-rehearsal-telemetry-repair.mjs', '--check']);
    } catch (error) {
      failures.push(`V43 cross-route rehearsal artifact check failed: ${error.stderr || error.message}`);
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
    const localOutput = run(root, 'node', ['scripts/rehearse-v43-cross-route-product-flow.mjs', '--lane', 'local', '--dry-run', '--json'], { env: dryRunEnv });
    const stagingOutput = run(root, 'node', ['scripts/rehearse-v43-cross-route-product-flow.mjs', '--lane', 'staging-testnet', '--dry-run', '--json'], { env: dryRunEnv });
    localReceipt = parseJson(localOutput, failures, 'local V43 cross-route rehearsal dry run');
    stagingReceipt = parseJson(stagingOutput, failures, 'staging-testnet V43 cross-route rehearsal dry run');

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
    assertCheck(failures, !serializedArtifact.includes(marker), `V43 Gate 9 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v43-cross-route-rehearsal-telemetry-repair', 'Gate 9 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v43.crossRouteRehearsalTelemetryRepair.v1', 'Gate 9 schemaId must match.');
    assertCheck(failures, artifact.version === 'V43' && artifact.currentTarget === 'V42', 'Gate 9 artifact must bind V43 over active V42.');
    assertCheck(failures, artifact.passed === true, 'Gate 9 artifact must pass.');
    assertCheck(failures, artifact.coverage.rowCount === 12, 'Gate 9 must cover twelve rehearsal rows.');
    assertCheck(failures, artifact.coverage.laneCount === 2, 'Gate 9 must cover local and staging-testnet lanes.');
    assertCheck(failures, artifact.coverage.routeCount === 3, 'Gate 9 must cover /deposit, /read, and /packs.');
    assertCheck(failures, artifact.coverage.stageCount === 9, 'Gate 9 must cover all cross-route stages.');
    assertCheck(failures, artifact.coverage.stagingProjectRef === 'tkpyosihuouusyaxtbau', 'Gate 9 must bind staging-testnet Supabase project.');
    assertCheck(failures, artifact.coverage.depositRouteCovered === true, 'Gate 9 must cover /deposit.');
    assertCheck(failures, artifact.coverage.readRouteCovered === true, 'Gate 9 must cover /read.');
    assertCheck(failures, artifact.coverage.packsRouteCovered === true, 'Gate 9 must cover /packs.');
    assertCheck(failures, artifact.coverage.telemetryDatabaseReadbackCovered === true, 'Gate 9 must cover telemetry database readback.');
    assertCheck(failures, artifact.coverage.ledgerDatabaseStorageSynchronized === true, 'Gate 9 must cover ledger/database/storage sync.');
    assertCheck(failures, artifact.coverage.repairMatrixCovered === true, 'Gate 9 must cover repair states.');
    assertCheck(failures, artifact.coverage.mainnetValueBearingBlocked === true, 'Gate 9 must keep value-bearing mainnet blocked.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 9 artifact must be source-safe metadata only.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 9 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 9 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, `Gate 9 predicates must pass: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  }

  if (localReceipt) {
    assertCheck(failures, localReceipt.version === 'V43', 'Local receipt must be V43.');
    assertCheck(failures, localReceipt.laneId === 'local', 'Local receipt lane must be local.');
    assertCheck(failures, localReceipt.routes.includes('/deposit') && localReceipt.routes.includes('/read') && localReceipt.routes.includes('/packs'), 'Local receipt must cover product routes.');
    assertCheck(failures, localReceipt.sourceSafety.secretValueSerialized === false, 'Local receipt must not serialize secrets.');
  }
  if (stagingReceipt) {
    assertCheck(failures, stagingReceipt.version === 'V43', 'Staging receipt must be V43.');
    assertCheck(failures, stagingReceipt.laneId === 'staging-testnet', 'Staging receipt lane must be staging-testnet.');
    assertCheck(failures, stagingReceipt.stagingProjectRef === 'tkpyosihuouusyaxtbau', 'Staging receipt must bind staging project.');
    assertCheck(failures, stagingReceipt.ready === true, 'Staging dry-run receipt must be ready with dummy family values.');
    assertCheck(failures, stagingReceipt.sourceSafety.secretValueSerialized === false, 'Staging receipt must not serialize secrets.');
  }

  if (failures.length > 0) {
    process.stderr.write('V43 Gate 9 cross-route rehearsal telemetry repair check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V43 Gate 9 cross-route rehearsal telemetry repair check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
