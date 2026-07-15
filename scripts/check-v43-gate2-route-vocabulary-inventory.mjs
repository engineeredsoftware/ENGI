#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH,
  buildV43RouteVocabularyInventory,
} from '../scripts/specifying/src/canonical/v43-route-vocabulary-inventory.js';

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
      'Usage: node scripts/check-v43-gate2-route-vocabulary-inventory.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V43 Gate 2 route vocabulary inventory, migration matrix, generated artifact, docs, workflows, exports, and source-safe disclosure posture.',
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

  assertCheck(failures, pointer === 'V42', `BITCODE_SPEC.txt must remain V42 during V43 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v43' || /^v43\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V43 work must occur on version/v43 or v43/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH,
    'specifications/BITCODE_SPEC_V43.md',
    'specifications/BITCODE_SPEC_V43_DELTA.md',
    'specifications/BITCODE_SPEC_V43_NOTES.md',
    'specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'scripts/specifying/src/canonical/v43-route-vocabulary-inventory.js',
    'scripts/specifying/test/v43-route-vocabulary-inventory.test.js',
    'scripts/generate-v43-route-vocabulary-inventory.mjs',
    'scripts/check-v43-gate2-route-vocabulary-inventory.mjs',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V43 Gate 2 file: ${relativePath}`);
  }

  const artifact = buildV43RouteVocabularyInventory({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V43 route vocabulary inventory predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Inventory artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Inventory artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.rawSourceTextVisible === false, 'Inventory artifact must not serialize raw source text.');
  assertCheck(failures, artifact.coverage.sourceSnippetVisible === false, 'Inventory artifact must not serialize source snippets.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Inventory artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.routeVocabularyInventoryComplete === true, 'Inventory coverage must mark route vocabulary inventory complete.');
  assertCheck(failures, artifact.coverage.migrationMatrixComplete === true, 'Inventory coverage must mark migration matrix complete.');
  assertCheck(failures, artifact.migrationRows.length === 6, 'Inventory must contain all six Gate 2 migration rows.');
  assertCheck(failures, artifact.sourceFiles.length > 0, 'Inventory must include source-safe file metadata rows.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH) &&
      read(root, V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH) === serialized,
    `${V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH} must be generated and current.`,
  );

  const spec = read(root, 'specifications/BITCODE_SPEC_V43.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V43_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V43_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const phrase of [
    'v43-route-vocabulary-inventory',
    '/exchange',
    '/packs',
    '/packs',
    '/read',
    '/deposit',
    'retained debug cockpit',
    'redirect compatibility',
    'self-referential',
    'source-safe file/token counts',
  ]) {
    assertCheck(
      failures,
      spec.includes(phrase) || delta.includes(phrase) || notes.includes(phrase) || parity.includes(phrase) || roadmap.includes(phrase),
      `Gate 2 spec family or roadmap must name ${phrase}.`,
    );
  }

  assertCheck(failures, roadmap.includes('Current working gate: V43 Gate'), 'Roadmap must state active V43 gate work.');
  assertCheck(failures, roadmap.includes('V43 Gate 2 closure anchor'), 'Roadmap must include V43 Gate 2 closure anchor.');
  assertCheck(failures, readme.includes('V43 Gate 2'), 'README must document V43 Gate 2.');
  assertCheck(failures, protocolReadme.includes('V43 Gate 2'), 'Protocol README must document V43 Gate 2.');
  assertCheck(failures, packageJson.includes('"generate:v43-route-vocabulary-inventory"'), 'package.json must expose generate:v43-route-vocabulary-inventory.');
  assertCheck(failures, packageJson.includes('"check:v43-route-vocabulary-inventory"'), 'package.json must expose check:v43-route-vocabulary-inventory.');
  assertCheck(failures, packageJson.includes('"check:v43-gate2"'), 'package.json must expose check:v43-gate2.');
  assertCheck(failures, gateWorkflow.includes('check-v43-gate2-route-vocabulary-inventory.mjs'), 'Gate workflow must run V43 Gate 2 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v43-gate2-route-vocabulary-inventory.mjs'), 'Canon workflow must run V43 Gate 2 checker.');

  if (failures.length > 0) {
    process.stderr.write('V43 Gate 2 route vocabulary inventory check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V43 Gate 2 route vocabulary inventory check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
