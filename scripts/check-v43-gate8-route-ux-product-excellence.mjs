#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V43_ROUTE_UX_PRODUCT_EXCELLENCE_ARTIFACT_PATH,
  buildV43RouteUxProductExcellence,
} from '../packages/specifying/src/canonical/v43-route-ux-product-excellence.js';

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
  const args = { repoRoot: defaultRepoRoot, skipBranchCheck: false, skipUapiTests: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v43-gate8-route-ux-product-excellence.mjs [--skip-branch-check] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V43 Gate 8 shared route shell, product route copy, progressive disclosure, loading/empty/error states, route tests, generated artifact, docs, and workflow wiring.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function run(root, command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
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
    V43_ROUTE_UX_PRODUCT_EXCELLENCE_ARTIFACT_PATH,
    'apps/uapi/components/bitcode/routes/product-route-shell.tsx',
    'apps/uapi/app/packs/PacksPageClient.tsx',
    'apps/uapi/app/read/ReadPageClient.tsx',
    'apps/uapi/app/deposit/DepositPageClient.tsx',
    'apps/uapi/tests/packsPageClient.test.tsx',
    'apps/uapi/tests/readPageClient.test.tsx',
    'apps/uapi/tests/depositPageClient.test.tsx',
    'packages/specifying/src/canonical/v43-route-ux-product-excellence.js',
    'packages/specifying/test/v43-route-ux-product-excellence.test.js',
    'scripts/generate-v43-route-ux-product-excellence.mjs',
    'scripts/check-v43-gate8-route-ux-product-excellence.mjs',
    'BITCODE_SPEC_V43.md',
    'BITCODE_SPEC_V43_DELTA.md',
    'BITCODE_SPEC_V43_NOTES.md',
    'BITCODE_SPEC_V43_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V43 Gate 8 file: ${relativePath}`);
  }

  const artifact = buildV43RouteUxProductExcellence({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V43 route UX product excellence predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.sharedRouteShellImplemented === true, 'Shared route shell must be implemented.');
  assertCheck(failures, artifact.coverage.sharedStepGridImplemented === true, 'Shared route step grid must be implemented.');
  assertCheck(failures, artifact.coverage.keyboardCurrentStepImplemented === true, 'Keyboard current-step semantics must be implemented.');
  assertCheck(failures, artifact.coverage.productRouteStatePanelsImplemented === true, 'Product route state panels must be implemented.');
  assertCheck(failures, artifact.coverage.loadingEmptyErrorStatesImplemented === true, 'Loading, empty, and error states must be implemented.');
  assertCheck(failures, artifact.coverage.progressiveDisclosureImplemented === true, 'Progressive disclosure must be implemented.');
  assertCheck(failures, artifact.coverage.packsRouteUsesSharedShell === true, '/packs must use shared route shell.');
  assertCheck(failures, artifact.coverage.readRouteUsesSharedShell === true, '/read must use shared route shell.');
  assertCheck(failures, artifact.coverage.depositRouteUsesSharedShell === true, '/deposit must use shared route shell.');
  assertCheck(failures, artifact.coverage.selfReferentialProductCopyReduced === true, 'Product copy must be reduced to route/status vocabulary.');
  assertCheck(failures, artifact.coverage.executionStreamReadbackRetained === true, 'Execution stream readback posture must remain retained.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.rawSourceTextVisible === false, 'Artifact must not expose raw source text.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Artifact must not expose settlement private payload.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V43_ROUTE_UX_PRODUCT_EXCELLENCE_ARTIFACT_PATH) &&
      read(root, V43_ROUTE_UX_PRODUCT_EXCELLENCE_ARTIFACT_PATH) === serialized,
    `${V43_ROUTE_UX_PRODUCT_EXCELLENCE_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v43-route-ux-product-excellence"'), 'package.json must expose generate:v43-route-ux-product-excellence.');
  assertCheck(failures, packageJson.includes('"check:v43-route-ux-product-excellence"'), 'package.json must expose check:v43-route-ux-product-excellence.');
  assertCheck(failures, packageJson.includes('"check:v43-gate8"'), 'package.json must expose check:v43-gate8.');
  assertCheck(failures, gateWorkflow.includes('check-v43-gate8-route-ux-product-excellence.mjs'), 'Gate workflow must run V43 Gate 8 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v43-gate8-route-ux-product-excellence.mjs'), 'Canon workflow must run V43 Gate 8 checker.');

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath', 'tests/packsPageClient.test.tsx', 'tests/readPageClient.test.tsx', 'tests/depositPageClient.test.tsx', '--runInBand']);
    } catch {
      failures.push('uapi packsPageClient.test.tsx, readPageClient.test.tsx, and depositPageClient.test.tsx must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V43 Gate 8 route UX product excellence check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V43 Gate 8 route UX product excellence check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
