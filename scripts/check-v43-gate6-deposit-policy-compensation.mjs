#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V43_DEPOSIT_POLICY_COMPENSATION_ARTIFACT_PATH,
  buildV43DepositPolicyCompensation,
} from '../packages/protocol/src/canonical/v43-deposit-policy-compensation.js';

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

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = { repoRoot: defaultRepoRoot, skipBranchCheck: false, skipUapiTests: false, skipPackageTests: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v43-gate6-deposit-policy-compensation.mjs [--skip-branch-check] [--skip-uapi-tests] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V43 Gate 6 deposit source criticality, demand, ROI, BTD potential, compensation policy, generated artifact, docs, workflows, and tests.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function run(root, command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
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

  assertCheck(failures, pointer === 'V42', `BITCODE_SPEC.txt must remain V42 during V43 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v43' || /^v43\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V43 work must occur on version/v43 or v43/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V43_DEPOSIT_POLICY_COMPENSATION_ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-option-policy.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/deposit-asset-pack-option-policy.test.ts',
    'uapi/app/deposit/deposit-route-model.ts',
    'uapi/app/deposit/DepositPageClient.tsx',
    'uapi/tests/depositRouteModel.test.ts',
    'uapi/tests/depositPageClient.test.tsx',
    'packages/protocol/src/canonical/v43-deposit-policy-compensation.js',
    'packages/protocol/test/v43-deposit-policy-compensation.test.js',
    'scripts/generate-v43-deposit-policy-compensation.mjs',
    'scripts/check-v43-gate6-deposit-policy-compensation.mjs',
    'BITCODE_SPEC_V43.md',
    'BITCODE_SPEC_V43_DELTA.md',
    'BITCODE_SPEC_V43_NOTES.md',
    'BITCODE_SPEC_V43_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/protocol/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V43 Gate 6 file: ${relativePath}`);
  }

  const artifact = buildV43DepositPolicyCompensation({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V43 deposit policy predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.depositPolicyImplemented === true, 'Deposit policy must be implemented.');
  assertCheck(failures, artifact.coverage.criticalSourceBlockedBeforeAdmission === true, 'Critical source must block before admission.');
  assertCheck(failures, artifact.coverage.roiPolicyImplemented === true, 'ROI policy must be implemented.');
  assertCheck(failures, artifact.coverage.btdPotentialEstimateOnly === true, 'BTD potential must remain estimate-only.');
  assertCheck(failures, artifact.coverage.compensationPolicyImplemented === true, 'Compensation policy must be implemented.');
  assertCheck(failures, artifact.coverage.compensationPriceAsset === 'BTC', 'Compensation price asset must be BTC.');
  assertCheck(failures, artifact.coverage.admissionAndIndexingDeferredToGate7 === true, 'Gate 7 admission/indexing must remain deferred.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Artifact must not expose settlement private payload.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V43_DEPOSIT_POLICY_COMPENSATION_ARTIFACT_PATH) &&
      read(root, V43_DEPOSIT_POLICY_COMPENSATION_ARTIFACT_PATH) === serialized,
    `${V43_DEPOSIT_POLICY_COMPENSATION_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v43-deposit-policy-compensation"'), 'package.json must expose generate:v43-deposit-policy-compensation.');
  assertCheck(failures, packageJson.includes('"check:v43-deposit-policy-compensation"'), 'package.json must expose check:v43-deposit-policy-compensation.');
  assertCheck(failures, packageJson.includes('"check:v43-gate6"'), 'package.json must expose check:v43-gate6.');
  assertCheck(failures, gateWorkflow.includes('check-v43-gate6-deposit-policy-compensation.mjs'), 'Gate workflow must run V43 Gate 6 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v43-gate6-deposit-policy-compensation.mjs'), 'Canon workflow must run V43 Gate 6 checker.');

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', 'deposit-asset-pack-option-policy.test.ts', '--runInBand']);
    } catch {
      failures.push('asset-pack deposit-asset-pack-option-policy.test.ts must pass.');
    }
  }

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'uapi', 'exec', 'jest', 'depositRouteModel.test.ts', 'depositPageClient.test.tsx', '--runInBand']);
    } catch {
      failures.push('uapi depositRouteModel.test.ts and depositPageClient.test.tsx must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V43 Gate 6 deposit policy compensation check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V43 Gate 6 deposit policy compensation check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
