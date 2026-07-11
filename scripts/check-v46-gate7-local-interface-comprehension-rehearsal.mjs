#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH,
  buildV46LocalInterfaceComprehensionRehearsal,
} from '../packages/protocol/src/canonical/v46-local-interface-comprehension-rehearsal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = { repoRoot: defaultRepoRoot, skipBranchCheck: false, skipPackageTests: false };
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
      'Usage: node scripts/check-v46-gate7-local-interface-comprehension-rehearsal.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'V46 Gate 7 local interface comprehension rehearsal check: validates source-safe local docs, routes, API/MCP, ChatGPT App, Bitcode Chat, proof telemetry, generated artifact freshness, package exports, docs, workflow wiring, and focused protocol tests.',
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

  assertCheck(failures, pointer === 'V45', `BITCODE_SPEC.txt must remain V45 during V46 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v46' || /^v46\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V46 work must occur on version/v46 or v46/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH,
    'packages/protocol/src/canonical/v46-local-interface-comprehension-rehearsal.js',
    'packages/protocol/test/v46-local-interface-comprehension-rehearsal.test.js',
    'scripts/generate-v46-local-interface-comprehension-rehearsal.mjs',
    'scripts/check-v46-gate7-local-interface-comprehension-rehearsal.mjs',
    'BITCODE_SPEC_V46.md',
    'BITCODE_SPEC_V46_DELTA.md',
    'BITCODE_SPEC_V46_NOTES.md',
    'BITCODE_SPEC_V46_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'uapi/app/packs/PacksPageClient.tsx',
    'uapi/app/read/ReadPageClient.tsx',
    'uapi/app/deposit/DepositPageClient.tsx',
    'packages/btd/src/api-schema-compatibility-matrix.ts',
    'packages/btd/src/mcp-tool-contract.ts',
    'packages/btd/src/chatgpt-app-action-contract.ts',
    'uapi/app/conversations/conversation-terminal-handoff.ts',
    'uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V46 Gate 7 file: ${relativePath}`);
  }

  const artifact = buildV46LocalInterfaceComprehensionRehearsal({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V46 local interface rehearsal predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.allSurfacesCovered === true, 'All local interface rehearsal surfaces must be covered.');
  assertCheck(failures, artifact.coverage.allStepsCovered === true, 'All rehearsal rows must cover the required local steps.');
  assertCheck(failures, artifact.coverage.allPriorArtifactsPassed === true, 'Gate 7 must rehearse passed V46 Gate 2 through Gate 6 artifacts.');
  assertCheck(failures, artifact.coverage.allClaimIdsKnown === true, 'All local rehearsal claim ids must be known to Gate 2.');
  assertCheck(failures, artifact.coverage.allCategoryIdsKnown === true, 'All local rehearsal claim categories must be known to Gate 2.');
  assertCheck(failures, artifact.coverage.allAuthorityIdsKnown === true, 'All local rehearsal authorities must be known to Gate 2.');
  assertCheck(failures, artifact.coverage.sourceFilesPresent === true, `Missing local rehearsal source files for rows: ${artifact.coverage.rowsMissingSourceFiles.join(', ')}`);
  assertCheck(failures, artifact.coverage.rowsMissingRequiredCopy.length === 0, `Missing required local rehearsal copy tokens for rows: ${artifact.coverage.rowsMissingRequiredCopy.join(', ')}`);
  assertCheck(failures, artifact.coverage.localOnly === true, 'Gate 7 rehearsal must remain local-only.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 7 artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.noParallelStateAuthority === true, 'Gate 7 must not create parallel state authority.');
  assertCheck(failures, artifact.coverage.stateAdvanceRequiresProofRoot === true, 'State advancement must require proof roots.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 7 must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 7 must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Gate 7 must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.interpolatedPromptVisible === false, 'Gate 7 must not expose interpolated prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Gate 7 must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 7 must not serialize credentials.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Gate 7 must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Gate 7 must not expose private settlement payloads.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Gate 7 must not admit value-bearing mainnet operation.');
  assertCheck(failures, artifact.coverage.forbiddenPhraseHits.length === 0, `Forbidden local rehearsal phrases found: ${artifact.coverage.forbiddenPhraseHits.join(', ')}`);
  assertCheck(failures, artifact.coverage.secretMarkerHits.length === 0, `Secret markers found in local rehearsal sources: ${artifact.coverage.secretMarkerHits.join(', ')}`);

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH) &&
      read(root, V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH) === serialized,
    `${V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v46-local-interface-comprehension-rehearsal"'), 'package.json must expose generate:v46-local-interface-comprehension-rehearsal.');
  assertCheck(failures, packageJson.includes('"check:v46-local-interface-comprehension-rehearsal"'), 'package.json must expose check:v46-local-interface-comprehension-rehearsal.');
  assertCheck(failures, packageJson.includes('"check:v46-gate7"'), 'package.json must expose check:v46-gate7.');
  assertCheck(failures, gateWorkflow.includes('check-v46-gate7-local-interface-comprehension-rehearsal.mjs'), 'Gate workflow must run V46 Gate 7 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v46-gate7-local-interface-comprehension-rehearsal.mjs'), 'Canon workflow must run V46 Gate 7 checker.');

  try {
    run(root, 'node', ['scripts/generate-v46-local-interface-comprehension-rehearsal.mjs', '--check']);
  } catch {
    failures.push('V46 local interface comprehension rehearsal artifact must be fresh.');
  }

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'packages/protocol',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v46-local-interface-comprehension-rehearsal.test.js',
      ]);
    } catch {
      failures.push('packages/protocol/test/v46-local-interface-comprehension-rehearsal.test.js must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V46 Gate 7 local interface comprehension rehearsal check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V46 Gate 7 local interface comprehension rehearsal check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
