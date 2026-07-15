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
      'Usage: node scripts/check-v45-gate7-interface-authority-disclosure-boundaries.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 interface authority and source-safe disclosure boundary atom.',
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
    'specifications/BITCODE_SPEC_V45_NOTES.md',
    'specifications/BITCODE_SPEC_V44.md',
    'specifications/BITCODE_SPEC.txt',
    'package.json',
    'scripts/check-v45-gate6-spec-consolidation-sequencing.mjs',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 7 file: ${relativePath}`);
  }

  const notes = read(root, 'specifications/BITCODE_SPEC_V45_NOTES.md');
  const normalizedNotes = normalize(notes);
  const packageJson = read(root, 'package.json');

  for (const phrase of [
    'V45 protocol atom 6: interface authority and disclosure boundaries',
    'The remaining protocol gap is exact interface authority',
    'before settlement, after preview, after quote, after payment observation, after finality, after BTD rights transfer, and after repository delivery',
    'All Bitcode interfaces are protocol windows into the same AssetPack, BTD, BTC, proof, ledger, database, storage, and delivery state',
    'No interface is an independent source of protocol law',
    'source-safe for that party',
    'traced to the required proof root, ledger/database readback, storage root, workflow receipt, or generated canonical specification',
    'Canonical interface authority is',
    '`/deposit`',
    'claiming final BTD size, reader ownership, final BTC proceeds, or public source visibility before a paid Need-Fit settlement exists',
    '`/read`',
    'exposing unpaid AssetPack source',
    '`/packs`',
    'Searchable master-detail projection of network activity',
    'API/MCP',
    'returning more data than the corresponding human interface is entitled to see',
    'ChatGPT App',
    'presenting conversational text as final settlement',
    'Bitcode Chat',
    'leaking raw prompts, raw provider responses, protected source, wallet private material, or unpaid source-bearing pack content',
    'Public docs and landing pages',
    'representing live transaction state, buyer entitlement, seller proceeds, or private network facts without a linked authoritative surface',
    'Canonical disclosure boundary is',
    '`before-settlement`',
    'unpaid AssetPack source, raw protected source, secrets, raw prompts, raw provider responses, final rights, final BTD ownership, or final BTC settlement',
    '`after-preview`',
    'source-safe Need-Fit measurements',
    'source-bearing implementation contents',
    '`after-quote`',
    'deterministic BTC quote, quote expiry, wallet/network, BTD volume/range posture',
    '`after-payment-observation`',
    'treating observation as confirmed finality',
    '`after-finality`',
    'exposing source before settlement readback and BTD rights transfer',
    '`after-btd-rights-transfer`',
    'entitled Reader boundary, source unlock authorization, rights receipt',
    '`after-repository-delivery`',
    'delivery PR/commit receipt, entitled repository visibility',
    'Interface disclosure law',
    'fail closed to the narrowest source-safe state',
    'Human and machine interfaces must use the same entitlement boundary',
    'Public docs and landing pages may explain the protocol and commercial experience',
    'Conversational interfaces may guide and summarize',
    'must never collapse preview, quote, observed payment, finality, rights transfer, delivery, and compensation into a single "done" state',
    'Acceptance for this atom',
    'one protocol law across all surfaces',
    'source-safe user-visible statements before paid entitlement',
    'explicit non-final language for preview/quote/payment observation',
    'authoritative readback for final settlement and rights transfer',
    'repository delivery visibility only for the entitled Reader boundary',
  ]) {
    assertCheck(failures, normalizedNotes.includes(phrase), `V45 Gate 7 notes must include phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate7": "node scripts/check-v45-gate7-interface-authority-disclosure-boundaries.mjs"'),
    'package.json must expose check:v45-gate7.',
  );

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 7 interface authority and disclosure boundary check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 7 interface authority and disclosure boundary check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
