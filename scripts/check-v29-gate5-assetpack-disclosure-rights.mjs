#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    repoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v29-gate5-assetpack-disclosure-rights.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 5 AssetPack disclosure rights and preview-depth closure.',
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
    pointer === 'V28',
    `BITCODE_SPEC.txt must remain V28 during V29 Gate 5 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-5-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 Gate 5 work must occur on version/v29 or v29/gate-5-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V29.md',
    '.specifications/BITCODE_SPEC_V29_DELTA.md',
    '.specifications/BITCODE_SPEC_V29_NOTES.md',
    '.specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'scripts/check-v29-gate5-assetpack-disclosure-rights.mjs',
    'packages/asset-packs-pipelines/domain/src/asset-pack-disclosure.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-disclosure.test.ts',
    'packages/asset-packs-pipelines/domain/src/postprocess.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/postprocess.test.ts',
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
    'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
    'packages/btd/src/access.ts',
    'packages/btd/src/settlement.ts',
    'packages/btd/__tests__/btd.test.ts',
    'apps/uapi/app/ (removed cockpit tree) ProductDepositReadWorkbench.tsx',
    'apps/uapi/app/ (removed cockpit tree) terminal-pipeline-host-client.ts',
    'apps/uapi/tests/terminalPipelineHarnessClient.test.ts',
    'AGENTS.md',
    'README.md',
    '.github/pull_request_template.md',
    '.github/workflows/bitcode-gate-quality.yml',
    'package.json',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 5 file: ${relativePath}`);
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V29.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const disclosure = read(root, 'packages/asset-packs-pipelines/domain/src/asset-pack-disclosure.ts');
  const disclosureTest = read(root, 'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-disclosure.test.ts');
  const postprocess = read(root, 'packages/asset-packs-pipelines/domain/src/postprocess.ts');
  const postprocessTest = read(root, 'packages/asset-packs-pipelines/domain/src/__tests__/postprocess.test.ts');
  const harness = read(root, 'packages/pipeline-hosts/src/asset-pack-host-plan.ts');
  const harnessTest = read(root, 'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts');
  const btdTest = read(root, 'packages/btd/__tests__/btd.test.ts');
  const terminal = read(root, 'apps/uapi/app/ (removed cockpit tree) ProductDepositReadWorkbench.tsx');
  const terminalClient = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-pipeline-host-client.ts');
  const terminalClientTest = read(root, 'apps/uapi/tests/terminalPipelineHarnessClient.test.ts');
  const agents = read(root, 'AGENTS.md');
  const readme = read(root, 'README.md');
  const prTemplate = read(root, '.github/pull_request_template.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  assertCheck(failures, spec.includes('V29 AssetPack disclosure rights canon'), 'V29 SPEC must define AssetPack disclosure rights canon.');
  assertCheck(failures, delta.includes('AssetPackDisclosureReview'), 'V29 DELTA must name Gate 5 AssetPackDisclosureReview acceptance.');
  assertCheck(failures, notes.includes('Gate 5 working notes'), 'V29 NOTES must carry Gate 5 working notes.');
  assertCheck(failures, parity.includes('## Gate 5 Parity'), 'V29 PARITY must include Gate 5 parity.');
  assertCheck(failures, parity.includes('Gate 5 completion condition'), 'V29 PARITY must include Gate 5 completion condition.');

  for (const symbol of [
    'AssetPackDisclosureReview',
    'AssetPackProtectedSourceLeakageReview',
    'buildAssetPackDisclosureReview',
    'assertAssetPackDisclosureSourceSafe',
    'reviewAssetPackProtectedSourceLeakage',
    'withheld_before_settlement',
    'available_after_settlement',
    'pay_to_unlock',
    'read_as_owner',
    'read_as_licensee',
    'blocked',
    'forbidden_source_field',
    'source_patch_marker',
    'source_code_marker',
  ]) {
    assertCheck(failures, disclosure.includes(symbol), `AssetPack disclosure primitive is missing ${symbol}.`);
  }

  assertCheck(
    failures,
    disclosureTest.includes('pending_settlement') &&
      disclosureTest.includes('owner_read') &&
      disclosureTest.includes('licensed_read') &&
      disclosureTest.includes('denied') &&
      disclosureTest.includes('protectedSourceContent') &&
      disclosureTest.includes('diff --git'),
    'AssetPack disclosure tests must cover pending, owner, licensed, denied, and source-leakage states.',
  );
  assertCheck(
    failures,
    postprocess.includes('assetPackDisclosureReview') &&
      postprocess.includes('disclosureReviewRoot') &&
      postprocess.includes('assertAssetPackDisclosureSourceSafe') &&
      postprocessTest.includes('assetPackDisclosureReview'),
    'AssetPack postprocess must persist disclosure review and test the projected result.',
  );
  assertCheck(
    failures,
    harness.includes('assetPackDisclosureReview') &&
      harness.includes('disclosureReview') &&
      harness.includes('assertAssetPackDisclosureSourceSafe') &&
      harnessTest.includes('assetPackDisclosureReview'),
    'Sandbox harness must store/export AssetPack disclosure review evidence and test the generated runner.',
  );
  assertCheck(
    failures,
    btdTest.includes('owner') &&
      btdTest.includes('licensed-read') &&
      btdTest.includes('revoked license') &&
      btdTest.includes('policy mismatch'),
    'BTD tests must cover owner-read, licensed-read, and denied read-right boundaries.',
  );
  assertCheck(
    failures,
    terminal.includes('Disclosure review') &&
      terminal.includes('sourceVisibility') &&
      terminal.includes('readerAction') &&
      terminal.includes('protectedSourceDetected') &&
      terminalClient.includes('assetPackDisclosureReview') &&
      terminalClient.includes('leakage') &&
      terminalClientTest.includes('assetPackDisclosureReview') &&
      terminalClientTest.includes('leakage none'),
    'product surfaces must render and summarize AssetPack disclosure review evidence.',
  );
  assertCheck(
    failures,
    agents.includes('V29 Gate 5: AssetPack Disclosure Rights And Preview Depth') &&
      readme.includes('V29 Gate 5: AssetPack Disclosure Rights And Preview Depth') &&
      prTemplate.includes('V29 Gate N: Concise Topical Title') &&
      gateWorkflow.includes('Validate gate pull request title'),
    'Repository instructions, PR template, and CI must enforce version/gate-prefixed PR titles.',
  );
  assertCheck(
    failures,
    packageJson.includes('"check:v29-gate5"') &&
      gateWorkflow.includes('check-v29-gate5-assetpack-disclosure-rights.mjs') &&
      gateWorkflow.includes('asset-pack-disclosure.test.ts'),
    'Package scripts and gate-quality workflow must invoke Gate 5 checker and focused tests.',
  );

  if (failures.length) {
    process.stderr.write('V29 Gate 5 check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V29 Gate 5 AssetPack disclosure rights check passed.\n');
}

main();
