#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH,
  buildV46ProtocolComprehensionObjectModel,
} from '../scripts/specifying/src/canonical/v46-protocol-comprehension-object-model.js';

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
      'Usage: node scripts/check-v46-gate2-protocol-comprehension-object-model.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'V46 Gate 2 check: validates the source-safe protocol comprehension object model, claim taxonomy, generated artifact freshness, package exports, documentation, workflow wiring, and focused protocol tests.',
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
    V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v46-protocol-comprehension-object-model.js',
    'scripts/specifying/test/v46-protocol-comprehension-object-model.test.js',
    'scripts/generate-v46-protocol-comprehension-object-model.mjs',
    'scripts/check-v46-gate2-protocol-comprehension-object-model.mjs',
    '.specifications/BITCODE_SPEC_V46.md',
    '.specifications/BITCODE_SPEC_V46_DELTA.md',
    '.specifications/BITCODE_SPEC_V46_NOTES.md',
    '.specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V46 Gate 2 file: ${relativePath}`);
  }

  const artifact = buildV46ProtocolComprehensionObjectModel({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V46 protocol comprehension predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.assetPackCommodityCovered === true, 'AssetPack commodity object must be covered.');
  assertCheck(failures, artifact.coverage.btdScalarVolumeCovered === true, 'BTD scalar-volume object must be covered.');
  assertCheck(failures, artifact.coverage.btcQuoteSettlementCovered === true, 'BTC quote and settlement objects must be covered.');
  assertCheck(failures, artifact.coverage.sourceUnlockDeliveryCovered === true, 'Source unlock delivery object must be covered.');
  assertCheck(failures, artifact.coverage.contributorCompensationCovered === true, 'Contributor compensation objects must be covered.');
  assertCheck(failures, artifact.coverage.interfaceClaimsCovered === true, 'Interface claim object must be covered.');
  assertCheck(failures, artifact.coverage.protocolLawClaimCovered === true, 'Protocol law claim taxonomy must be covered.');
  assertCheck(failures, artifact.coverage.productGuidanceClaimCovered === true, 'Product guidance claim taxonomy must be covered.');
  assertCheck(failures, artifact.coverage.operatorEvidenceClaimCovered === true, 'Operator evidence claim taxonomy must be covered.');
  assertCheck(failures, artifact.coverage.investorFramingClaimCovered === true, 'Investor framing claim taxonomy must be covered.');
  assertCheck(failures, artifact.coverage.telemetryObservabilityClaimCovered === true, 'Telemetry observability claim taxonomy must be covered.');
  assertCheck(failures, artifact.coverage.previewQuoteSettlementRightsDeliveryCovered === true, 'Preview, quote, settlement, rights, and delivery claims must be covered.');
  assertCheck(failures, artifact.coverage.compensationRepairClaimsCovered === true, 'Compensation and repair claims must be covered.');
  assertCheck(failures, artifact.coverage.noForbiddenClaimCollapsed === true, 'Forbidden claim collapses must be modeled.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Artifact must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Gate 2 must not admit value-bearing mainnet operation.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH) &&
      read(root, V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH) === serialized,
    `${V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v46-protocol-comprehension-object-model"'), 'package.json must expose generate:v46-protocol-comprehension-object-model.');
  assertCheck(failures, packageJson.includes('"check:v46-protocol-comprehension-object-model"'), 'package.json must expose check:v46-protocol-comprehension-object-model.');
  assertCheck(failures, packageJson.includes('"check:v46-gate2"'), 'package.json must expose check:v46-gate2.');
  assertCheck(failures, gateWorkflow.includes('check-v46-gate2-protocol-comprehension-object-model.mjs'), 'Gate workflow must run V46 Gate 2 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v46-gate2-protocol-comprehension-object-model.mjs'), 'Canon workflow must run V46 Gate 2 checker.');

  try {
    run(root, 'node', ['scripts/generate-v46-protocol-comprehension-object-model.mjs', '--check']);
  } catch {
    failures.push('V46 protocol comprehension object model artifact must be fresh.');
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
        'test/v46-protocol-comprehension-object-model.test.js',
      ]);
    } catch {
      failures.push('scripts/specifying/test/v46-protocol-comprehension-object-model.test.js must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V46 Gate 2 protocol comprehension object model check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V46 Gate 2 protocol comprehension object model check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
