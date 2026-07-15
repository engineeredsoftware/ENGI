#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH,
  buildV46InterfaceClaimContracts,
} from '../scripts/specifying/src/canonical/v46-interface-claim-contracts.js';

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
      'Usage: node scripts/check-v46-gate5-interface-claim-contracts.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'V46 Gate 5 interface claim contracts check: validates source-safe API/MCP, ChatGPT App, Bitcode Chat, and package-consumer InterfaceClaim contracts, generated artifact freshness, package exports, docs, workflow wiring, and focused protocol tests.',
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

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
    V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v46-interface-claim-contracts.js',
    'scripts/specifying/test/v46-interface-claim-contracts.test.js',
    'scripts/generate-v46-interface-claim-contracts.mjs',
    'scripts/check-v46-gate5-interface-claim-contracts.mjs',
    'specifications/BITCODE_SPEC_V46.md',
    'specifications/BITCODE_SPEC_V46_DELTA.md',
    'specifications/BITCODE_SPEC_V46_NOTES.md',
    'specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'packages/btd/src/api-schema-compatibility-matrix.ts',
    'packages/btd/src/mcp-tool-contract.ts',
    'packages/btd/src/chatgpt-app-action-contract.ts',
    'apps/chatgpt/src/tools.ts',
    'packages/api/src/routes/conversations.ts',
    'apps/uapi/tests/api/conversationReadingInterfaceParity.test.ts',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V46 Gate 5 file: ${relativePath}`);
  }

  const artifact = buildV46InterfaceClaimContracts({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V46 interface claim contract predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.allSurfacesCovered === true, 'All interface claim surfaces must be covered.');
  assertCheck(failures, artifact.coverage.allClaimIdsKnown === true, 'All referenced claim ids must be known to Gate 2.');
  assertCheck(failures, artifact.coverage.allCategoryIdsKnown === true, 'All referenced claim category ids must be known to Gate 2.');
  assertCheck(failures, artifact.coverage.allAuthorityIdsKnown === true, 'All referenced claim authority ids must be known to Gate 2.');
  assertCheck(failures, artifact.coverage.requiredCapabilitiesCovered === true, 'All required interface capabilities must be covered.');
  assertCheck(failures, artifact.coverage.sourceFilesPresent === true, `Missing source files for rows: ${artifact.coverage.rowsMissingSourceFiles.join(', ')}`);
  assertCheck(failures, artifact.coverage.rowsMissingRequiredCopy.length === 0, `Missing required interface copy tokens for rows: ${artifact.coverage.rowsMissingRequiredCopy.join(', ')}`);
  assertCheck(failures, artifact.coverage.allRowsRequireProofRootProjection === true, 'All interface rows must require proof-root projection.');
  assertCheck(failures, artifact.coverage.allRowsRequireDeniedStateRepair === true, 'All interface rows must require denied-state repair.');
  assertCheck(failures, artifact.coverage.noParallelStateAuthority === true, 'Interfaces must not create parallel state authority.');
  assertCheck(failures, artifact.coverage.stateAdvanceRequiresProof === true, 'Interfaces must require proof-backed state advancement.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Artifact must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.interpolatedPromptVisible === false, 'Artifact must not expose interpolated prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Artifact must not expose private settlement payloads.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Gate 5 must not admit value-bearing mainnet operation.');
  assertCheck(failures, artifact.coverage.forbiddenPhraseHits.length === 0, `Forbidden interface claim phrases found: ${artifact.coverage.forbiddenPhraseHits.join(', ')}`);
  assertCheck(failures, artifact.coverage.secretMarkerHits.length === 0, `Secret markers found in interface claim sources: ${artifact.coverage.secretMarkerHits.join(', ')}`);

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH) &&
      read(root, V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH) === serialized,
    `${V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v46-interface-claim-contracts"'), 'package.json must expose generate:v46-interface-claim-contracts.');
  assertCheck(failures, packageJson.includes('"check:v46-interface-claim-contracts"'), 'package.json must expose check:v46-interface-claim-contracts.');
  assertCheck(failures, packageJson.includes('"check:v46-gate5"'), 'package.json must expose check:v46-gate5.');
  assertCheck(failures, gateWorkflow.includes('check-v46-gate5-interface-claim-contracts.mjs'), 'Gate workflow must run V46 Gate 5 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v46-gate5-interface-claim-contracts.mjs'), 'Canon workflow must run V46 Gate 5 checker.');

  try {
    run(root, 'node', ['scripts/generate-v46-interface-claim-contracts.mjs', '--check']);
  } catch {
    failures.push('V46 interface claim contracts artifact must be fresh.');
  }

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'scripts/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v46-interface-claim-contracts.test.js',
      ]);
    } catch {
      failures.push('scripts/specifying/test/v46-interface-claim-contracts.test.js must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V46 Gate 5 interface claim contracts check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V46 Gate 5 interface claim contracts check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
