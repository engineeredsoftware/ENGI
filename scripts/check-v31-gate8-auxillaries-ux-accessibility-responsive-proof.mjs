#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

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
    repoRoot: defaultRepoRoot,
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
      'Usage: node scripts/check-v31-gate8-auxillaries-ux-accessibility-responsive-proof.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 8 Auxillaries low-detail UX, named landmarks, skip navigation, active-pane state announcements, responsive CSS, reduced-motion posture, tests, docs, and workflow coverage.',
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

  assertCheck(
    failures,
    pointer === 'V30',
    `BITCODE_SPEC.txt must remain V30 during V31 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v31' || /^v31\/gate-(?:8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 Gate 8+ work must occur on version/v31 or v31/gate-8+ branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'apps/uapi/app/auxillaries/components/AuxillariesContent.tsx',
    'apps/uapi/app/auxillaries/components/shared/AuxillariesWorkspacePanels.tsx',
    'apps/uapi/app/auxillaries/auxillaries-ux-accessibility-proof.ts',
    'apps/uapi/styles/auxillaries-bitcode.css',
    'apps/uapi/tests/auxillariesContent.access.test.tsx',
    'apps/uapi/tests/auxillariesWorkspacePanels.access.test.tsx',
    'specifications/BITCODE_SPEC_V31.md',
    'specifications/BITCODE_SPEC_V31_DELTA.md',
    'specifications/BITCODE_SPEC_V31_NOTES.md',
    'specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'apps/uapi/app/auxillaries/README.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V31 Gate 8 file: ${relativePath}`);
  }

  const content = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesContent.tsx');
  const workspacePanels = read(root, 'apps/uapi/app/auxillaries/components/shared/AuxillariesWorkspacePanels.tsx');
  const proofContract = read(root, 'apps/uapi/app/auxillaries/auxillaries-ux-accessibility-proof.ts');
  const css = read(root, 'apps/uapi/styles/auxillaries-bitcode.css');
  const contentTest = read(root, 'apps/uapi/tests/auxillariesContent.access.test.tsx');
  const panelsTest = read(root, 'apps/uapi/tests/auxillariesWorkspacePanels.access.test.tsx');
  const spec = read(root, 'specifications/BITCODE_SPEC_V31.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V31_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V31_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const auxReadme = read(root, 'apps/uapi/app/auxillaries/README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const jestConfig = read(root, 'apps/uapi/jest.config.cjs');

  for (const contentPhrase of [
    'aria-label="Bitcode Auxillaries support plane"',
    'Skip to active support pane',
    'href="#auxillaries-active-pane"',
    'role="navigation"',
    'aria-label="Auxillaries pane navigation"',
    'role="region"',
    'aria-live="polite"',
    'aria-busy',
    'role="status"',
    'auxillaries-active-pane-summary',
    'auxillaries-audit-detail',
    'source-safe summary only',
  ]) {
    assertCheck(failures, content.includes(contentPhrase), `AuxillariesContent must expose ${contentPhrase}.`);
  }

  for (const panelPhrase of ['aria-current', 'aria-disabled', 'aria-describedby', 'sr-only']) {
    assertCheck(failures, workspacePanels.includes(panelPhrase), `Workspace panels must expose ${panelPhrase}.`);
  }

  for (const proofPhrase of [
    'AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT',
    'summarizeAuxillariesUxAccessibilityProofContract',
    'auxillariesMain',
    'auxillariesPaneNavigation',
    'auxillariesActivePane',
    'phone',
    'tablet',
    'laptop',
    'widescreen',
  ]) {
    assertCheck(failures, proofContract.includes(proofPhrase), `Auxillaries UX proof contract must include ${proofPhrase}.`);
  }

  for (const cssPhrase of [
    '.auxillaries-skip-link',
    'focus-visible',
    'overflow-wrap: anywhere',
    '@media (max-width: 1023px)',
    '@media (max-width: 640px)',
    '@media (prefers-reduced-motion: reduce)',
    'scroll-behavior: auto',
  ]) {
    assertCheck(failures, css.includes(cssPhrase), `Auxillaries CSS must include ${cssPhrase}.`);
  }

  for (const testPhrase of [
    "getByRole('main'",
    "getByRole('link'",
    "getByRole('navigation'",
    "getByRole('region'",
    'aria-live',
    'aria-busy',
    'auxillaries-audit-detail',
    'source-safe summary only',
    'queryByText(/\"currentStep\"/)',
    'summarizeAuxillariesUxAccessibilityProofContract',
  ]) {
    assertCheck(failures, contentTest.includes(testPhrase), `Auxillaries content accessibility tests must cover ${testPhrase}.`);
  }

  for (const panelTestPhrase of ['aria-current', 'aria-disabled', 'Locked auxillary']) {
    assertCheck(failures, panelsTest.includes(panelTestPhrase), `Workspace panel accessibility tests must cover ${panelTestPhrase}.`);
  }

  for (const docPhrase of [
    'Gate 8',
    'low-detail',
    'expandable audit',
    'named main landmark',
    'skip link',
    'active pane',
    'keyboard',
    'focus',
    'labels',
    'state announcement',
    'contrast',
    'reduced-motion',
    'responsive',
  ]) {
    assertCheck(
      failures,
      spec.includes(docPhrase) ||
        delta.includes(docPhrase) ||
        notes.includes(docPhrase) ||
        parity.includes(docPhrase) ||
        roadmap.includes(docPhrase) ||
        auxReadme.includes(docPhrase),
      `V31 Gate 8 docs/spec must describe ${docPhrase}.`,
    );
  }

  assertCheck(
    failures,
    /Current working gate: V31 Gate (?:8|9|10)\b/u.test(roadmap),
    'Roadmap must track V31 Gate 8 or a later V31 gate as current working gate.',
  );
  assertCheck(failures, packageJson.includes('"check:v31-gate8"'), 'package.json must expose check:v31-gate8.');
  assertCheck(
    failures,
    workflow.includes('check-v31-gate8-auxillaries-ux-accessibility-responsive-proof.mjs'),
    'Gate quality workflow must run the V31 Gate 8 checker.',
  );
  assertCheck(
    failures,
    workflow.includes('tests/auxillariesContent.access.test.tsx') && jestConfig.includes('auxillariesContent.access.test.tsx'),
    'Gate quality and Jest config must include Auxillaries content accessibility tests.',
  );

  if (failures.length) {
    process.stderr.write('V31 Gate 8 Auxillaries UX/accessibility closure check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V31 Gate 8 Auxillaries UX/accessibility closure check passed.\n');
}

main();
