#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v32-browser-accessibility-responsive-visual-proof.json';

const REQUIRED_ASSERTIONS = [
  'keyboard-path',
  'landmark-labels',
  'focus-state',
  'status-announcements',
  'contrast-sensitive-tokens',
  'reduced-motion',
  'overflow-wrapping',
  'deterministic-visual-semantics',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'OiJI', 'UzI1', 'NiIsInR5cCI6IkpXVCJ9'].join(''),
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
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
      'Usage: node scripts/check-v32-gate7-browser-accessibility-responsive-visual-proof.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 7 browser, accessibility, responsive, and visual proof coverage.',
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

  assertCheck(failures, pointer === 'V31', `BITCODE_SPEC.txt must remain V31 during V32 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v32' || /^v32\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V32 work must occur on version/v32 or v32/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'scripts/generate-v32-browser-accessibility-responsive-visual-proof.mjs',
    'scripts/check-v32-gate7-browser-accessibility-responsive-visual-proof.mjs',
    'apps/uapi/app/bitcode-browser-accessibility-responsive-proof.ts',
    'apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts',
    'apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
    'apps/uapi/tests/terminalUxBrowserProof.test.tsx',
    'apps/uapi/tests/auxillariesContent.access.test.tsx',
    'apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts',
    'apps/uapi/tests/e2e/commercial-mvp.auxillaries.spec.ts',
    'apps/uapi/styles/auxillaries-bitcode.css',
    'apps/uapi/package.json',
    '.specifications/BITCODE_SPEC_V32.md',
    '.specifications/BITCODE_SPEC_V32_DELTA.md',
    '.specifications/BITCODE_SPEC_V32_NOTES.md',
    '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/v32-proof-coverage-matrix.mjs',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V32 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v32-browser-accessibility-responsive-visual-proof']);
    } catch (error) {
      failures.push(`V32 Gate 7 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V32 Gate 7 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v32-browser-accessibility-responsive-visual-proof', 'Gate 7 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v32.browserAccessibilityResponsiveVisualProof.v1', 'Gate 7 schemaId must match.');
    assertCheck(failures, artifact.version === 'V32' && artifact.currentTarget === 'V31', 'Gate 7 artifact must bind V32 over active V31.');
    assertCheck(failures, artifact.passed === true, 'Gate 7 artifact must pass.');
    assertCheck(failures, artifact.sourceSafetyVerdict === 'source-safe-browser-visual-proof-metadata', 'Gate 7 artifact must be source-safe browser proof metadata.');
    assertCheck(failures, artifact.proofCoverage.surfaceCount === 2, 'Gate 7 artifact must cover product and Auxillaries.');
    assertCheck(failures, artifact.proofCoverage.stateCount === 6, 'Gate 7 artifact must cover default/guided/detail states for both surfaces.');
    assertCheck(failures, artifact.proofCoverage.viewportCount === 4, 'Gate 7 artifact must cover four canonical viewports.');
    assertCheck(failures, includesAll(artifact.accessibilityAssertions, REQUIRED_ASSERTIONS), 'Gate 7 artifact must enumerate every accessibility assertion.');
    assertCheck(failures, artifact.visualProofStrategy.includes('no-screenshot-only-approval'), 'Gate 7 artifact must reject screenshot-only approval.');
    assertCheck(failures, artifact.proofCoverage.protectedSourceVisible === false, 'Gate 7 artifact must keep protected source invisible.');
    assertCheck(failures, artifact.proofCoverage.credentialsSerialized === false, 'Gate 7 artifact must not serialize credentials.');
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 7 source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 7 test evidence tokens must all be present.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V32.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const uapiPackageJson = read(root, 'apps/uapi/package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const matrix = read(root, 'scripts/v32-proof-coverage-matrix.mjs');
  const contractTest = read(root, 'apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts');
  const e2eTest = read(root, 'apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V32 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('no-screenshot-only-approval'), 'V32 docs must name deterministic visual proof strategy.');
  }

  assertCheck(failures, /Current working gate: V32 Gate (?:[7-9]|10)\b/u.test(roadmap), 'Roadmap must track V32 Gate 7 or later as the current working gate.');
  assertCheck(failures, packageJson.includes('"check:v32-gate7"'), 'package.json must expose check:v32-gate7.');
  assertCheck(failures, uapiPackageJson.includes('"test:e2e:v32-browser-proof"'), 'apps/uapi/package.json must expose the V32 browser proof e2e script.');
  assertCheck(
    failures,
    workflow.includes('check-v32-gate7-browser-accessibility-responsive-visual-proof.mjs') &&
      workflow.includes('test:e2e:v32-browser-proof') &&
      workflow.includes('bitcodeBrowserAccessibilityResponsiveProof.test.ts'),
    'Gate quality workflow must run the V32 Gate 7 checker, Jest proof test, and browser proof script.',
  );
  assertCheck(failures, matrix.includes(ARTIFACT), 'V32 proof coverage matrix must reference the Gate 7 artifact.');

  for (const phrase of [
    'default, guided, and detail states',
    'keyboard, labels, focus, status, contrast, motion, overflow',
    'no-screenshot-only-approval',
  ]) {
    assertCheck(failures, contractTest.includes(phrase), `V32 Gate 7 contract test must assert: ${phrase}.`);
  }
  for (const phrase of [
    'product default, guided, and detail states stay semantic and responsive',
    'Auxillaries default, guided, and detail states stay semantic and responsive',
    'expectNoHorizontalOverflow',
    '/packs?auxillary-open-to=wallet',
    '/packs?auxillary-open-to=profile',
    '/packs?auxillary-open-to=interfaces',
  ]) {
    assertCheck(failures, e2eTest.includes(phrase), `V32 Gate 7 browser test must assert: ${phrase}.`);
  }

  if (failures.length) {
    process.stderr.write('V32 Gate 7 browser accessibility responsive visual proof check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`V32 Gate 7 browser accessibility responsive visual proof ok artifact=${ARTIFACT}\n`);
}

main();
