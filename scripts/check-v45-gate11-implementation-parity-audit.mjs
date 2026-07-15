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
      'Usage: node scripts/check-v45-gate11-implementation-parity-audit.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 Gate 11 source-grounded implementation parity audit.',
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

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 parity audit work. Observed ${pointer || 'empty'}.`);

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
    'scripts/check-v45-gate10-formal-spec-consolidation.mjs',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 11 file: ${relativePath}`);
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V45.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V45_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V45_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const combined = normalize([spec, delta, notes, parity].join('\n'));

  assertCheck(failures, !parity.includes('| pending |'), 'V45 Gate 11 parity matrix must not contain pending table judgments.');
  assertCheck(
    failures,
    !parity.toLowerCase().includes('pending implementation audit'),
    'V45 Gate 11 parity matrix must replace the Gate 10 pending implementation audit shell.',
  );

  for (const phrase of [
    'V45 Gate 11 source-grounded implementation parity audit',
    'Judgment vocabulary',
    'Source Evidence Map',
    'V45 Implementation Matrix',
    'V45 Implementation Checklist',
    'Grouped Closure Gates',
    'Gate 12: V45 State Vocabulary And Commodity Model Implementation',
    'Gate 13: BTD Scalar Volume And Deterministic Quote Conservation',
    'Gate 14: BTC Settlement Rights Delivery And Compensation Readback',
    'Gate 15: Interface Disclosure, Route Vocabulary, And Public Documentation',
    'Gate 16: V45 Proof Families And Generated Artifacts',
    'Gate 17: Source-Safe End-To-End Rehearsal',
    'Gate 18: V45 Promotion Readiness And Canonical Promotion',
    'implemented prerequisite',
    'substantially advanced',
    'spec closed; source gap',
    'Explicit Non-Authorizations',
    'Accepted Boundaries',
    'Gate 11 is complete when this matrix contains no `pending` judgments',
  ]) {
    assertCheck(failures, parity.includes(phrase), `V45 Gate 11 parity matrix must include phrase: ${phrase}`);
  }

  for (const sourcePath of [
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
    'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
    'packages/asset-packs-pipelines/domain/src/reading-interface-product-parity.ts',
    'apps/uapi/app/deposit/deposit-route-model.ts',
    'apps/uapi/app/read/read-route-model.ts',
    'apps/uapi/app/packs/PacksPageClient.tsx',
    'apps/uapi/app/exchange/page.tsx',
    '.github/workflows/v44-canon-promotion.yml',
  ]) {
    assertCheck(failures, exists(root, sourcePath), `V45 Gate 11 audited source path must exist: ${sourcePath}`);
    assertCheck(failures, parity.includes(sourcePath), `V45 Gate 11 parity matrix must cite audited source path: ${sourcePath}`);
  }

  for (const proofArtifact of [
    '.bitcode/v45-inference-synthesis-proof.json',
    '.bitcode/v45-prompt-completeness-proof.json',
    '.bitcode/v45-static-code-analysis-proof.json',
    '.bitcode/v45-verification-decisions-proof.json',
    '.bitcode/v45-selection-materialization-proof.json',
    '.bitcode/v45-authorization-sensitive-flow-proof.json',
    '.bitcode/v45-settlement-source-to-shares-proof.json',
    '.bitcode/v45-disclosure-boundary-proof.json',
    '.bitcode/v45-proof-contract-proof.json',
    'specifications/BITCODE_SPEC_V45_PROVEN.md',
  ]) {
    assertCheck(failures, combined.includes(proofArtifact), `V45 formal family must cite proof artifact or appendix: ${proofArtifact}`);
  }

  for (const lawPhrase of [
    'AssetPack is the commodity',
    'BTD is Need-relative weighted scalar knowledge-volume',
    'BTC is settlement money',
    'proof-backed readback is the only state advancement mechanism',
    'Telemetry is observability only',
    'No UI row, conversation message, streamed telemetry item, route response, external provider event, or workflow log can alone advance',
  ]) {
    assertCheck(failures, combined.includes(lawPhrase), `V45 formal family must preserve protocol law phrase: ${lawPhrase}`);
  }

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate11": "node scripts/check-v45-gate11-implementation-parity-audit.mjs"'),
    'package.json must expose check:v45-gate11.',
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
    process.stderr.write('V45 Gate 11 implementation parity audit check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 11 implementation parity audit check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
