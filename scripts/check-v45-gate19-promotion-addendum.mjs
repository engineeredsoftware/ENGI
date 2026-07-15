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

function exists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipPackageTests: false,
    help: false,
  };
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
      'Usage: node scripts/check-v45-gate19-promotion-addendum.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks the V45 post-promotion addendum: active V45 posture, no stale draft phrasing, generated artifact freshness, and regression coverage.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

const STALE_PROMOTED_PHRASES = Object.freeze([
  'V45 does not replace V44',
  'V44 remains active canon',
  'V44 active / V45 draft',
  'V44 active / draft V45',
  'BITCODE_SPEC.txt remains `V44`',
  'Canonical pointer: `BITCODE_SPEC.txt` -> `V44`',
  'Active canonical anchor: `BITCODE_SPEC_V44.md`',
  'V45 draft work',
  'V45 formal draft',
  'V45 remains draft',
  'until V45 promotion',
  'before V45 can be promoted',
  'does not promote V45',
  'draft `BITCODE_SPEC_V45_PROVEN.md`',
]);

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V45', `BITCODE_SPEC.txt must point to V45 for the V45 promotion addendum. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'main' || /^v45\/gate-19-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 Gate 19 work must occur on main after merge or v45/gate-19-* before merge. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC.txt',
    'BITCODE_SPEC_V45.md',
    'BITCODE_SPEC_V45_DELTA.md',
    'BITCODE_SPEC_V45_NOTES.md',
    'BITCODE_SPEC_V45_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    '.bitcode/v45-source-safe-e2e-rehearsal.json',
    '.bitcode/v45-promotion-readiness-report.json',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'scripts/specifying/test/spec-family-promotion-posture.test.js',
  ];
  for (const relativePath of requiredFiles) {
    assertCheck(failures, exists(root, relativePath), `Missing required Gate 19 file: ${relativePath}`);
  }

  const specFamilyFiles = [
    'BITCODE_SPEC_V45.md',
    'BITCODE_SPEC_V45_DELTA.md',
    'BITCODE_SPEC_V45_NOTES.md',
    'BITCODE_SPEC_V45_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
  ];
  for (const relativePath of specFamilyFiles) {
    const content = read(root, relativePath);
    for (const phrase of STALE_PROMOTED_PHRASES) {
      assertCheck(
        failures,
        !content.includes(phrase),
        `${relativePath} still contains stale promoted draft posture phrase "${phrase}".`,
      );
    }
  }

  const spec = read(root, 'BITCODE_SPEC_V45.md');
  const notes = read(root, 'BITCODE_SPEC_V45_NOTES.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const checker = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');
  const test = read(root, 'scripts/specifying/test/spec-family-promotion-posture.test.js');
  const packageJson = read(root, 'package.json');

  for (const [label, content, phrase] of [
    ['spec', spec, '`BITCODE_SPEC.txt` points to `V45`; V45 is the active promoted Bitcode canon.'],
    ['notes', notes, 'Canonical pointer: `BITCODE_SPEC.txt` -> `V45`'],
    ['roadmap', roadmap, 'Current active canonical pointer: `BITCODE_SPEC.txt` -> `V45`'],
    ['roadmap', roadmap, 'Current draft target: `BITCODE_SPEC_V46.md`'],
    ['checker', checker, 'validatePromotedSpecFamilyHasNoStaleDraftPosture'],
    ['test', test, 'promoted spec-family validation rejects stale draft posture outside source-of-truth prose'],
    ['package.json', packageJson, '"check:v45-gate19"'],
  ]) {
    assertCheck(failures, content.includes(phrase), `${label} must include "${phrase}".`);
  }

  const commandChecks = [
    ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V45', '--mode', 'promoted', '--current-target', 'V45']],
    ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V45']],
    ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V45', '--draft-target', 'V46']],
    ['node', ['scripts/generate-v45-source-safe-e2e-rehearsal.mjs', '--check']],
    ['node', ['scripts/generate-v45-promotion-readiness-report.mjs', '--check']],
  ];
  if (!args.skipPackageTests) {
    commandChecks.push([
      'node',
      [
        '--test',
        'scripts/specifying/test/spec-family-promotion-posture.test.js',
        'scripts/specifying/test/specifying-package-boundary.test.js',
        'scripts/specifying/test/v45-source-safe-e2e-rehearsal.test.js',
        'scripts/specifying/test/v45-promotion-readiness.test.js',
      ],
    ]);
  }

  for (const [command, commandArgs] of commandChecks) {
    try {
      run(root, command, commandArgs);
    } catch (error) {
      failures.push(`Command failed: ${command} ${commandArgs.join(' ')}`);
      if (error && typeof error === 'object' && 'stdout' in error) {
        const stdout = String(error.stdout || '').trim();
        if (stdout) failures.push(stdout);
      }
      if (error && typeof error === 'object' && 'stderr' in error) {
        const stderr = String(error.stderr || '').trim();
        if (stderr) failures.push(stderr);
      }
    }
  }

  if (failures.length > 0) {
    process.stderr.write(['V45 Gate 19 promotion addendum check failed:', ...failures.map((failure) => `- ${failure}`)].join('\n'));
    process.stderr.write('\n');
    process.exit(1);
  }

  process.stdout.write('V45 Gate 19 promotion addendum check passed.\n');
}

main();
