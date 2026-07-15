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

function run(root, args) {
  return execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function normalize(content) {
  return content.replace(/\s+/gu, ' ').trim();
}

function parseArgs(argv) {
  const args = { repoRoot: defaultRepoRoot, skipBranchCheck: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v45-gate10-formal-spec-consolidation.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 formal specification consolidation gate.',
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

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 formal draft work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v45' || /^v45\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 work must occur on version/v45 or v45/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'specifications/BITCODE_SPEC_V45.md',
    'specifications/BITCODE_SPEC_V45_DELTA.md',
    'specifications/BITCODE_SPEC_V45_NOTES.md',
    'specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md',
    'specifications/BITCODE_SPEC_V44.md',
    'specifications/BITCODE_SPEC_V44_PROVEN.md',
    'specifications/BITCODE_SPEC.txt',
    'package.json',
    'scripts/check-v45-gate9-gate-taxonomy-formal-spec-readiness.mjs',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 10 file: ${relativePath}`);
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V45.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V45_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V45_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const combined = normalize([spec, delta, notes, parity].join('\n'));

  for (const phrase of [
    'formal draft specification consolidated from accepted V45 notes atoms',
    'V44 remains active canon until V45 promotion',
    'Bitcode is the knowledge commoditization protocol and commercial system',
    'AssetPack is the traded commodity',
    'BTD is the non-fungible, proof-addressed scalar unit of technical knowledge volume',
    'final BTD size is computed only after a reviewed Need, selected Fit set, synthesized Need-Fit AssetPack',
    'BTC is Bitcode settlement money and payment truth',
    'Prepared, signed, broadcast, and observed states are not final settlement',
    'All Bitcode interfaces are protocol windows',
    'Bitcode state advances only by proof-backed readback',
    'Telemetry is observability only',
    'V45 gates are classified as',
    'formal-specification-consolidation',
    'specification-parity-matrix',
    'Implementation follows accepted parity gaps',
    'Promotion alone may advance `BITCODE_SPEC.txt`',
    'implementation parity is not yet audited',
  ]) {
    assertCheck(failures, combined.includes(phrase), `V45 formal family must include phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    combined.includes('This parity matrix is the formal shell for the next V45 gate')
      || combined.includes('V45 Gate 11 source-grounded implementation parity audit'),
    'V45 formal family must include either the Gate 10 parity shell or the Gate 11 audited parity matrix phrase.',
  );

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate10": "node scripts/check-v45-gate10-formal-spec-consolidation.mjs"'),
    'package.json must expose check:v45-gate10.',
  );

  try {
    const output = run(root, [
      'scripts/check-bitcode-spec-family.mjs',
      '--version',
      'V45',
      '--mode',
      'draft',
      '--current-target',
      'V44',
    ]);
    assertCheck(failures, output.includes('Bitcode spec family ok for V45'), 'V45 draft spec-family check did not report success.');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    failures.push(`V45 draft spec-family check failed: ${detail}`);
  }

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 10 formal specification consolidation check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 10 formal specification consolidation check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
