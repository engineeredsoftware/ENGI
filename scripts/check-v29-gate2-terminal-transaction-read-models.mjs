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
      'Usage: node scripts/check-v29-gate2-terminal-transaction-read-models.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 2 product transaction read-model and navigation closure.',
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
    `BITCODE_SPEC.txt must remain V28 during V29 Gate 2 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-2-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 Gate 2 work must occur on version/v29 or v29/gate-2-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V29.md',
    '.specifications/BITCODE_SPEC_V29_DELTA.md',
    '.specifications/BITCODE_SPEC_V29_NOTES.md',
    '.specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'apps/uapi/app/ (removed cockpit tree) terminal-transaction-read-model.ts',
    'apps/uapi/app/ (removed cockpit tree) terminal-transaction-query.ts',
    'apps/uapi/app/ (removed cockpit tree) TerminalPageClient.tsx',
    'apps/uapi/app/ (removed cockpit tree) TerminalTransactionWorkspace.tsx',
    'apps/uapi/app/ (removed cockpit tree) ProductTransactionDetailSurface.tsx',
    'apps/uapi/app/ (removed cockpit tree) TerminalTransactionDetailActionBar.tsx',
    'apps/uapi/tests/terminalTransactionReadModel.test.ts',
    'apps/uapi/tests/terminalTransactionQuery.test.ts',
    'apps/uapi/app/ (removed cockpit tree) README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 2 file: ${relativePath}`);
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V29.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const readModel = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-transaction-read-model.ts');
  const query = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-transaction-query.ts');
  const pageClient = read(root, 'apps/uapi/app/ (removed cockpit tree) TerminalPageClient.tsx');
  const detailSurface = read(root, 'apps/uapi/app/ (removed cockpit tree) ProductTransactionDetailSurface.tsx');
  const actionBar = read(root, 'apps/uapi/app/ (removed cockpit tree) TerminalTransactionDetailActionBar.tsx');
  const readModelTest = read(root, 'apps/uapi/tests/terminalTransactionReadModel.test.ts');
  const queryTest = read(root, 'apps/uapi/tests/terminalTransactionQuery.test.ts');
  const terminalReadme = read(root, 'apps/uapi/app/ (removed cockpit tree) README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  assertCheck(failures, spec.includes('V29 product transaction read-model canon'), 'V29 SPEC must define the product transaction read-model canon.');
  assertCheck(failures, delta.includes('Closure acceptance:'), 'V29 DELTA must list Gate 2 closure acceptance.');
  assertCheck(failures, notes.includes('Gate 2 working notes'), 'V29 NOTES must carry Gate 2 working notes.');
  assertCheck(failures, parity.includes('## Gate 2 Parity'), 'V29 PARITY must include Gate 2 parity.');
  assertCheck(failures, parity.includes('Gate 2 completion condition'), 'V29 PARITY must include Gate 2 completion condition.');

  for (const requiredSymbol of [
    'ProductTransactionReadModel',
    'TerminalTransactionSectionReadModel',
    'buildProductTransactionReadModel',
    'TerminalTransactionSectionAvailability',
    'routeHref',
    'payloadAvailable',
  ]) {
    assertCheck(failures, readModel.includes(requiredSymbol), `Read model is missing ${requiredSymbol}.`);
  }

  assertCheck(
    failures,
    readModel.includes("'blocked'") &&
      readModel.includes('Console detail is available only for live execution-history rows.'),
    'Read model must block console outside live execution-history rows.',
  );
  assertCheck(
    failures,
    query.includes('shouldRecoverPipelineTransactionRoute'),
    'product query helpers must expose default route recovery.',
  );
  assertCheck(
    failures,
    pageClient.includes('shouldRecoverPipelineTransactionRoute'),
    'product page must use route recovery for the first selectable transaction.',
  );
  assertCheck(
    failures,
    detailSurface.includes('buildProductTransactionReadModel') &&
      detailSurface.includes('detailActions={transactionReadModel.sections.map'),
    'Detail surface must derive and use the typed transaction read model.',
  );
  assertCheck(
    failures,
    actionBar.includes('detailActions') && actionBar.includes('disabledReason'),
    'Detail action bar must render read-model section navigation and blockers.',
  );
  assertCheck(
    failures,
    readModelTest.includes('buildProductTransactionReadModel') &&
      readModelTest.includes('route.selectionRecoverable') &&
      readModelTest.includes("availability: 'blocked'"),
    'Read-model tests must cover route recovery and blocked sections.',
  );
  assertCheck(
    failures,
    queryTest.includes('shouldRecoverPipelineTransactionRoute'),
    'Query tests must cover default transaction route recovery.',
  );
  assertCheck(
    failures,
    terminalReadme.includes('ProductTransactionReadModel') &&
      terminalReadme.includes('Former `runId` links are still accepted on read and rewritten on write.'),
    'product README must document the Gate 2 read-model and legacy runId rewrite.',
  );
  assertCheck(failures, packageJson.includes('"check:v29-gate2"'), 'package.json must expose check:v29-gate2.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v29-gate2-terminal-transaction-read-models.mjs'),
    'Gate quality workflow must run the Gate 2 checker.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('tests/terminalTransactionReadModel.test.ts'),
    'Gate quality workflow must run the read-model tests.',
  );

  const versionedTerminalSource = execFileSync('find', ['apps/uapi/app/terminal', '-name', '*v29*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(
    failures,
    versionedTerminalSource.length === 0,
    `product source identifiers must remain unversioned. Found:\n${versionedTerminalSource}`,
  );

  if (failures.length > 0) {
    process.stderr.write('V29 Gate 2 product transaction read-model check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V29 Gate 2 product transaction read-model ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
