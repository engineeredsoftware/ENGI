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
      'Usage: node scripts/check-v29-gate9-terminal-ux-browser-proof.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 9 Terminal UX quality and browser-proof closure.',
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

  assertCheck(
    failures,
    pointer === 'V28',
    `BITCODE_SPEC.txt must remain V28 during V29 Gate 9 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-9-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 Gate 9 work must occur on version/v29 or v29/gate-9-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V29.md',
    'BITCODE_SPEC_V29_DELTA.md',
    'BITCODE_SPEC_V29_NOTES.md',
    'BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'scripts/check-v29-gate9-terminal-ux-browser-proof.mjs',
    'apps/uapi/app/terminal/terminal-ux-browser-proof.ts',
    'apps/uapi/app/terminal/TerminalPageClient.tsx',
    'apps/uapi/app/terminal/TerminalTransactionWorkspace.tsx',
    'apps/uapi/app/terminal/TerminalTransactionDetailSurface.tsx',
    'apps/uapi/app/terminal/TerminalTransactionDetailHero.tsx',
    'apps/uapi/app/terminal/TerminalTransactionDetailActionBar.tsx',
    'apps/uapi/app/terminal/TerminalTransactionActivitySurface.tsx',
    'apps/uapi/components/bitcode/pipeline/BitcodeTransactionsTable.tsx',
    'apps/uapi/components/bitcode/pipeline/BitcodeTransactionsDataTable.tsx',
    'apps/uapi/tests/terminalUxBrowserProof.test.tsx',
    'apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts',
    'apps/uapi/playwright.config.ts',
    'apps/uapi/app/terminal/README.md',
    'apps/uapi/package.json',
    'apps/uapi/jest.config.cjs',
    '.github/workflows/bitcode-gate-quality.yml',
    'package.json',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 9 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V29.md');
  const delta = read(root, 'BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const contract = read(root, 'apps/uapi/app/terminal/terminal-ux-browser-proof.ts');
  const pageClient = read(root, 'apps/uapi/app/terminal/TerminalPageClient.tsx');
  const workspace = read(root, 'apps/uapi/app/terminal/TerminalTransactionWorkspace.tsx');
  const detailSurface = read(root, 'apps/uapi/app/terminal/TerminalTransactionDetailSurface.tsx');
  const detailHero = read(root, 'apps/uapi/app/terminal/TerminalTransactionDetailHero.tsx');
  const actionBar = read(root, 'apps/uapi/app/terminal/TerminalTransactionDetailActionBar.tsx');
  const activitySurface = read(root, 'apps/uapi/app/terminal/TerminalTransactionActivitySurface.tsx');
  const table = read(root, 'apps/uapi/components/bitcode/pipeline/BitcodeTransactionsTable.tsx');
  const dataTable = read(root, 'apps/uapi/components/bitcode/pipeline/BitcodeTransactionsDataTable.tsx');
  const jestTest = read(root, 'apps/uapi/tests/terminalUxBrowserProof.test.tsx');
  const e2eTest = read(root, 'apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts');
  const playwrightConfig = read(root, 'apps/uapi/playwright.config.ts');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  const uapiPackage = read(root, 'apps/uapi/package.json');
  const jestConfig = read(root, 'apps/uapi/jest.config.cjs');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  assertCheck(failures, spec.includes('V29 Terminal UX quality and browser-proof canon'), 'V29 SPEC must define the Terminal UX browser-proof canon.');
  assertCheck(failures, delta.includes('Gate 9: Terminal UX Quality And Browser Proof') && delta.includes('focused Playwright spec'), 'V29 DELTA must define Gate 9 closure acceptance.');
  assertCheck(failures, notes.includes('Gate 9 working notes') && notes.includes('terminal-ux-browser-proof.ts'), 'V29 NOTES must carry Gate 9 working notes.');
  assertCheck(failures, parity.includes('## Gate 9 Parity') && parity.includes('Gate 9 completion condition'), 'V29 PARITY must include Gate 9 parity and completion condition.');
  assertCheck(failures, terminalReadme.includes('V29 Terminal UX browser proof checkpoint') && terminalReadme.includes('terminal-ux-browser-proof.ts'), 'Terminal README must document the Gate 9 browser-proof checkpoint.');

  for (const token of [
    'TERMINAL_UX_BROWSER_PROOF_CONTRACT',
    'TERMINAL_UX_BROWSER_PROOF_LANDMARKS',
    'TERMINAL_UX_BROWSER_PROOF_VIEWPORTS',
    'TERMINAL_UX_BROWSER_PROOF_STATES',
    'TERMINAL_UX_BROWSER_PROOF_ROUTE_CHECKS',
    'terminalMain',
    'terminalTransactionWorkspace',
    'terminalSelectedActivityDetail',
    'phone',
    'tablet',
    'laptop',
    'widescreen',
  ]) {
    assertCheck(failures, contract.includes(token), `Terminal UX browser-proof contract is missing ${token}.`);
  }

  assertCheck(
    failures,
    pageClient.includes('id="terminalMain"') &&
      pageClient.includes('data-testid="terminal-cockpit-root"') &&
      pageClient.includes('Skip to selected Terminal activity') &&
      pageClient.includes('aria-labelledby="terminalPageTitle"'),
    'Terminal page must expose named main landmark and skip link.',
  );
  assertCheck(
    failures,
    workspace.includes('data-testid="terminal-transaction-workspace"') &&
      workspace.includes('aria-labelledby="terminalTransactionWorkspaceTitle"') &&
      workspace.includes('terminal-workspace-loading-state') &&
      workspace.includes('terminal-workspace-empty-state') &&
      workspace.includes('terminal-workspace-error-state') &&
      workspace.includes('role="alert"') &&
      workspace.includes('role="status"'),
    'Terminal workspace must expose named region and loading/empty/error semantics.',
  );
  assertCheck(
    failures,
    detailSurface.includes('data-testid="terminal-selected-activity-detail"') &&
      detailSurface.includes('terminalTransactionDetailTitle') &&
      detailSurface.includes('terminal-detail-loading-state') &&
      detailSurface.includes('terminal-detail-empty-state') &&
      detailSurface.includes('terminal-detail-action-error') &&
      detailHero.includes('data-testid="terminal-selected-activity-hero"') &&
      detailHero.includes('titleId') &&
      actionBar.includes('data-testid="terminal-detail-section-controls"') &&
      actionBar.includes('aria-pressed') &&
      actionBar.includes('Selected activity detail sections') &&
      activitySurface.includes('terminal-activity-stream-surface'),
    'Selected activity detail surfaces must expose source-safe hero, detail controls, blocked/error states, and activity stream proof hooks.',
  );
  assertCheck(
    failures,
    table.includes('data-testid="bitcode-transactions-table-shell"') &&
      dataTable.includes('data-testid="bitcode-transactions-loading-state"') &&
      dataTable.includes('data-testid="bitcode-transactions-empty-state"') &&
      dataTable.includes('data-testid="bitcode-transactions-error-state"') &&
      dataTable.includes('aria-label="Recent Bitcode transactions"') &&
      dataTable.includes('overflow-x-auto'),
    'Transaction table must expose state semantics and contained overflow.',
  );
  assertCheck(
    failures,
    jestTest.includes('TERMINAL_UX_BROWSER_PROOF_CONTRACT') &&
      jestTest.includes('terminal-workspace-loading-state') &&
      jestTest.includes('bitcode-transactions-loading-state') &&
      jestTest.includes('Selected activity detail sections') &&
      jestConfig.includes('terminalUxBrowserProof.test.tsx'),
    'Focused Jest coverage must prove the Gate 9 contract and UI state semantics.',
  );
  assertCheck(
    failures,
    e2eTest.includes('Terminal UX browser proof') &&
      e2eTest.includes('terminal-cockpit-root') &&
      e2eTest.includes('Skip to selected Terminal activity') &&
      e2eTest.includes('terminal-selected-activity-hero') &&
      e2eTest.includes('documentOverflow') &&
      e2eTest.includes('phone') &&
      e2eTest.includes('widescreen'),
    'Focused Playwright coverage must prove landmarks, skip navigation, blocked detail posture, and responsive readability.',
  );
  assertCheck(
    failures,
    playwrightConfig.includes('PLAYWRIGHT_READY_URL') &&
      playwrightConfig.includes('/terminal') &&
      playwrightConfig.includes('url: appReadyUrl'),
    'Playwright web server readiness must wait on the Terminal route, not only an open port.',
  );
  assertCheck(
    failures,
    packageJson.includes('"check:v29-gate9"') &&
      uapiPackage.includes('"test:e2e:terminal-ux"') &&
      uapiPackage.includes('NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321') &&
      uapiPackage.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key') &&
      uapiPackage.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=mock-publishable-key') &&
      gateWorkflow.includes('check-v29-gate9-terminal-ux-browser-proof.mjs') &&
      gateWorkflow.includes('terminalUxBrowserProof.test.tsx') &&
      gateWorkflow.includes('test:e2e:terminal-ux') &&
      gateWorkflow.includes('playwright install chromium --with-deps'),
    'Package scripts and gate-quality workflow must invoke self-contained Gate 9 checker, focused Jest, and Terminal browser proof.',
  );

  if (failures.length) {
    process.stderr.write('V29 Gate 9 check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V29 Gate 9 Terminal UX quality and browser proof check passed.\n');
}

main();
