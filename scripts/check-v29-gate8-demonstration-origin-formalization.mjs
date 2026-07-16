#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const sourceExtensions = new Set(['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
const skippedDirectories = new Set(['node_modules', 'coverage', 'dist', 'tmp', '.next', '.turbo']);
const directDemonstrationImportPattern =
  /\b(?:import\s+(?:[^'"]+\s+from\s+)?|import\s*\(|require\s*\()\s*['"][^'"]*(?:@bitcode\/protocol-demonstration|protocol-demonstration\/src)/u;

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
      'Usage: node scripts/check-v29-gate8-demonstration-origin-formalization.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 8 demonstration-origin commercial formalization closure.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function collectSourceFiles(root) {
  const files = [];

  if (!existsSync(root)) return files;

  for (const entry of readdirSync(root)) {
    const absolutePath = path.join(root, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      if (skippedDirectories.has(entry)) continue;
      files.push(...collectSourceFiles(absolutePath));
      continue;
    }

    if (sourceExtensions.has(path.extname(entry))) files.push(absolutePath);
  }

  return files;
}

function findDirectDemonstrationRuntimeImports(root, relativeRoots) {
  return relativeRoots.flatMap((relativeRoot) =>
    collectSourceFiles(path.join(root, relativeRoot)).flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      if (!directDemonstrationImportPattern.test(source)) return [];
      return [path.relative(root, filePath)];
    }),
  );
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
    `BITCODE_SPEC.txt must remain V28 during V29 Gate 8 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-8-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 Gate 8 work must occur on version/v29 or v29/gate-8-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V29.md',
    '.specifications/BITCODE_SPEC_V29_DELTA.md',
    '.specifications/BITCODE_SPEC_V29_NOTES.md',
    '.specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'scripts/check-v29-gate8-demonstration-origin-formalization.mjs',
    'scripts/specifying/package.json',
    'scripts/specifying/README.md',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/src/canonical/v21-specifying.js',
    'scripts/specifying/src/canonical/v22-canon-posture.js',
    'scripts/specifying/src/canonical/proven-generator.js',
    'scripts/specifying/test/specifying-package-boundary.test.js',
    'scripts/check-bitcode-canon-posture-drift.mjs',
    'scripts/check-bitcode-canonical-inputs.mjs',
    'scripts/check-bitcode-pre-commit.mjs',
    'scripts/check-bitcode-spec-family.mjs',
    'scripts/generate-bitcode-proven.mjs',
    'scripts/run-bitcode-spec-quality.mjs',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 8 file: ${relativePath}`);
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V29.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const protocolIndex = read(root, 'scripts/specifying/src/index.js');
  const protocolTypes = read(root, 'scripts/specifying/src/index.d.ts');
  const protocolPosture = read(root, 'scripts/specifying/src/canon-posture.js');
  const protocolTest = read(root, 'scripts/specifying/test/specifying-package-boundary.test.js');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  assertCheck(failures, spec.includes('V29 demonstration-origin commercial formalization canon'), 'V29 SPEC must define demonstration-origin commercial formalization canon.');
  assertCheck(failures, delta.includes('Gate 8: Demonstration-Origin Commercial Formalization') && delta.includes('package-native APIs'), 'V29 DELTA must define Gate 8 closure acceptance.');
  assertCheck(failures, notes.includes('Gate 8 working notes'), 'V29 NOTES must carry Gate 8 working notes.');
  assertCheck(failures, parity.includes('## Gate 8 Parity'), 'V29 PARITY must include Gate 8 parity.');
  assertCheck(failures, parity.includes('Gate 8 completion condition'), 'V29 PARITY must include Gate 8 completion condition.');

  assertCheck(
    failures,
    protocolPosture.includes("ACTIVE_CANON_VERSION = 'V28'") &&
      protocolPosture.includes("DRAFT_TARGET_VERSION = 'V29'") &&
      !protocolPosture.includes("ACTIVE_CANON_VERSION = 'V27'") &&
      !protocolPosture.includes("DRAFT_TARGET_VERSION = 'V28'"),
    'Protocol package canon posture must be active V28 / draft V29.',
  );

  for (const symbol of [
    'ACTIVE_CANON_VERSION',
    'DRAFT_TARGET_VERSION',
    'buildV21CanonicalInputReport',
    'buildV21GeneratedArtifactContents',
    'buildV21SpecFamilyReport',
    'buildCanonPostureDriftReport',
    'PROVEN_GENERATOR_ID',
    'defaultProvenOutputPath',
    'generateCanonicalProvenMarkdown',
  ]) {
    assertCheck(failures, protocolIndex.includes(symbol), `Protocol package index must export ${symbol}.`);
    assertCheck(failures, protocolTypes.includes(symbol), `Protocol package types must declare ${symbol}.`);
  }

  const demonstrationImportViolations = findDirectDemonstrationRuntimeImports(root, [
    'scripts',
    'packages',
    'apps/uapi/app',
    'apps/uapi/components',
    'apps/uapi/config',
    'apps/uapi/hooks',
    'apps/uapi/lib',
    'apps/uapi/networking',
    'apps/uapi/types',
  ]).filter((relativePath) => !relativePath.startsWith('protocol-demonstration/'));
  assertCheck(
    failures,
    demonstrationImportViolations.length === 0,
    `Commercial/runtime sources must not import standalone demonstration runtime code. Violations: ${demonstrationImportViolations.join(', ') || 'none'}.`,
  );

  assertCheck(
    failures,
    protocolTest.includes('commercial formalization exports') &&
      protocolTest.includes("ACTIVE_CANON_VERSION, 'V28'") &&
      protocolTest.includes("DRAFT_TARGET_VERSION, 'V29'") &&
      protocolTest.includes('buildV21SpecFamilyReport') &&
      protocolTest.includes('generateCanonicalProvenMarkdown') &&
      protocolTest.includes('directly import standalone demonstration source'),
    'Protocol package tests must cover Gate 8 exports, posture, provenance, and import boundaries.',
  );
  assertCheck(
    failures,
    protocolReadme.includes('Gate 8') &&
      protocolReadme.includes('package-native') &&
      protocolReadme.includes('must not import') &&
      protocolReadme.includes('protocol-demonstration'),
    'Protocol package README must document Gate 8 package-native boundary.',
  );
  assertCheck(
    failures,
    packageJson.includes('"check:v29-gate8"') &&
      gateWorkflow.includes('check-v29-gate8-demonstration-origin-formalization.mjs') &&
      gateWorkflow.includes('@bitcode/specifying typecheck') &&
      gateWorkflow.includes('@bitcode/specifying test') &&
      gateWorkflow.includes('protocolCommercialBoundary.test.ts'),
    'Package scripts and gate-quality workflow must invoke Gate 8 checker, protocol package checks, and commercial boundary test.',
  );

  if (failures.length) {
    process.stderr.write('V29 Gate 8 check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V29 Gate 8 demonstration-origin commercial formalization check passed.\n');
}

main();
