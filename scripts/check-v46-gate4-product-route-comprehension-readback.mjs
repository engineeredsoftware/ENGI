#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_ARTIFACT_PATH,
  buildV46ProductRouteComprehensionReadback,
} from '../packages/specifying/src/canonical/v46-product-route-comprehension-readback.js';

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
  execFileSync(command, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = { repoRoot: defaultRepoRoot, skipBranchCheck: false, skipPackageTests: false };
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
      'Usage: node scripts/check-v46-gate4-product-route-comprehension-readback.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'V46 Gate 4 check: validates source-safe /packs, /read, and /deposit route comprehension readback, generated artifact freshness, package exports, docs, workflow wiring, and focused protocol tests.',
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

  assertCheck(failures, pointer === 'V45', `BITCODE_SPEC.txt must remain V45 during V46 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v46' || /^v46\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V46 work must occur on version/v46 or v46/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_ARTIFACT_PATH,
    'packages/specifying/src/canonical/v46-product-route-comprehension-readback.js',
    'packages/specifying/test/v46-product-route-comprehension-readback.test.js',
    'scripts/generate-v46-product-route-comprehension-readback.mjs',
    'scripts/check-v46-gate4-product-route-comprehension-readback.mjs',
    'BITCODE_SPEC_V46.md',
    'BITCODE_SPEC_V46_DELTA.md',
    'BITCODE_SPEC_V46_NOTES.md',
    'BITCODE_SPEC_V46_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'uapi/app/packs/PacksPageClient.tsx',
    'uapi/app/read/ReadPageClient.tsx',
    'uapi/app/deposit/DepositPageClient.tsx',
    'uapi/components/bitcode/routes/product-route-shell.tsx',
    'uapi/tests/packsPageClient.test.tsx',
    'uapi/tests/readPageClient.test.tsx',
    'uapi/tests/depositPageClient.test.tsx',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V46 Gate 4 file: ${relativePath}`);
  }

  const artifact = buildV46ProductRouteComprehensionReadback({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V46 product route comprehension predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.allRoutesCovered === true, 'All product route ids must be covered.');
  assertCheck(failures, artifact.coverage.allRoutePathsCovered === true, 'All product route paths must be covered.');
  assertCheck(failures, artifact.coverage.lowDetailDefaultsCovered === true, 'Routes must default to low-detail guided readback.');
  assertCheck(failures, artifact.coverage.expandableProofReadbackCovered === true, 'Routes must expose expandable source-safe proof readback.');
  assertCheck(failures, artifact.coverage.routeOwnedStateCovered === true, 'Routes must own their source-safe route state.');
  assertCheck(failures, artifact.coverage.requiredCapabilitiesCovered === true, 'Required shared capabilities must be covered.');
  assertCheck(failures, artifact.coverage.routeSpecificCapabilitiesCovered === true, 'Packs search, Reading five-step, and Depositing five-step capabilities must be covered.');
  assertCheck(failures, artifact.coverage.allClaimIdsKnown === true, 'All referenced claim ids must be known to Gate 2.');
  assertCheck(failures, artifact.coverage.allCategoryIdsKnown === true, 'All referenced claim category ids must be known to Gate 2.');
  assertCheck(failures, artifact.coverage.allAuthorityIdsKnown === true, 'All referenced claim authority ids must be known to Gate 2.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Artifact must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.interpolatedPromptVisible === false, 'Artifact must not expose interpolated prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Artifact must not expose private settlement payloads.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Gate 4 must not admit value-bearing mainnet operation.');
  assertCheck(failures, artifact.coverage.forbiddenPhraseHits.length === 0, `Forbidden product route phrases found: ${artifact.coverage.forbiddenPhraseHits.join(', ')}`);
  assertCheck(failures, artifact.coverage.secretMarkerHits.length === 0, `Secret markers found in product route sources: ${artifact.coverage.secretMarkerHits.join(', ')}`);
  assertCheck(failures, artifact.coverage.rowsMissingRequiredCopy.length === 0, `Missing required route copy tokens for rows: ${artifact.coverage.rowsMissingRequiredCopy.join(', ')}`);

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_ARTIFACT_PATH) &&
      read(root, V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_ARTIFACT_PATH) === serialized,
    `${V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v46-product-route-comprehension-readback"'), 'package.json must expose generate:v46-product-route-comprehension-readback.');
  assertCheck(failures, packageJson.includes('"check:v46-product-route-comprehension-readback"'), 'package.json must expose check:v46-product-route-comprehension-readback.');
  assertCheck(failures, packageJson.includes('"check:v46-gate4"'), 'package.json must expose check:v46-gate4.');
  assertCheck(failures, gateWorkflow.includes('check-v46-gate4-product-route-comprehension-readback.mjs'), 'Gate workflow must run V46 Gate 4 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v46-gate4-product-route-comprehension-readback.mjs'), 'Canon workflow must run V46 Gate 4 checker.');

  try {
    run(root, 'node', ['scripts/generate-v46-product-route-comprehension-readback.mjs', '--check']);
  } catch {
    failures.push('V46 product route comprehension readback artifact must be fresh.');
  }

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'packages/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v46-product-route-comprehension-readback.test.js',
      ]);
    } catch {
      failures.push('packages/specifying/test/v46-product-route-comprehension-readback.test.js must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V46 Gate 4 product route comprehension readback check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V46 Gate 4 product route comprehension readback check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
