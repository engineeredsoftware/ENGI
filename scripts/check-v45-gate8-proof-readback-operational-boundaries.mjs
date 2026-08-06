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
      'Usage: node scripts/check-v45-gate8-proof-readback-operational-boundaries.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 proof readback and operational authority atom.',
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

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 atom work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v45' || /^v45\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 work must occur on version/v45 or v45/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    '.specifications/BITCODE_SPEC_V45_NOTES.md',
    '.specifications/BITCODE_SPEC_V44.md',
    '.specifications/BITCODE_SPEC.txt',
    'package.json',
    'scripts/check-v45-gate7-interface-authority-disclosure-boundaries.mjs',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 8 file: ${relativePath}`);
  }

  const notes = read(root, '.specifications/BITCODE_SPEC_V45_NOTES.md');
  const normalizedNotes = normalize(notes);
  const packageJson = read(root, 'package.json');

  for (const phrase of [
    'V45 protocol atom 7: proof readback and operational authority',
    'The remaining gap is evidence authority',
    'which operational artifacts can advance protocol state',
    'Bitcode state advances only by proof-backed readback',
    'No UI row, conversation message, streamed telemetry item, route response, external provider event, or workflow log can alone advance AssetPack lifecycle',
    'The advancing artifact must be paired with the required proof root and read back from the appropriate ledger, database, storage, wallet, provider, or repository boundary',
    'Canonical evidence authority is',
    'canonical specification and generated proof appendix',
    'execution/workflow receipt',
    'ledger journal',
    'database projection',
    'object storage and protected-source roots',
    'telemetry stream',
    'observability only; telemetry is not settlement, rights transfer, or source unlock',
    'wallet/provider receipt',
    'provider observation is not final settlement',
    'repository delivery receipt',
    'not public source permission and not contributor compensation by itself',
    'Canonical readback requirements are',
    'Depository admission',
    'reviewed Need acceptance',
    'Finding Fits selection',
    'Need-Fit AssetPack synthesis',
    'BTC quote issuance',
    'BTC payment observation',
    'BTC settlement finalization',
    'BTD rights transfer',
    'source unlock and repository delivery',
    'contributor compensation',
    'Operational repair law',
    'source-safe repair state',
    'failure class, blocker, retry command, proof root identifiers, and operator-safe telemetry',
    'Computation hosts, sandbox executions, workflow runners, browser proofs, and API routes may produce receipts',
    'they do not own protocol truth',
    'prefer the stricter source-safety and economic-finality posture',
    'Acceptance for this atom',
    'proof-backed readback as the only state advancement mechanism',
    'telemetry as observability rather than authority',
    'Bitcoin finality as payment truth',
    'storage and repository roots as delivery truth',
    'database projections as reconciled read models',
    'fail-closed repair for every evidence mismatch',
  ]) {
    assertCheck(failures, normalizedNotes.includes(phrase), `V45 Gate 8 notes must include phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate8": "node scripts/check-v45-gate8-proof-readback-operational-boundaries.mjs"'),
    'package.json must expose check:v45-gate8.',
  );

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 8 proof readback and operational authority check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 8 proof readback and operational authority check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
