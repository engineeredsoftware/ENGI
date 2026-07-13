#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

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
    repoRoot
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
      'Usage: node scripts/check-v30-gate2-protocol-package-api-boundaries.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 2 package-owned BTD API builders, route delegation, docs, tests, and commercial runtime demonstration boundary posture.'
    ].join('\n')
  );
  process.stdout.write('\n');
}

function collectSourceFiles(root, startRelativePath) {
  const start = path.join(root, startRelativePath);
  if (!existsSync(start)) return [];

  const results = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    const relative = path.relative(root, current);
    const stat = statSync(current);

    if (stat.isDirectory()) {
      if (
        relative.includes(`${path.sep}_legacy${path.sep}`) ||
        relative.includes(`${path.sep}node_modules${path.sep}`) ||
        relative.includes(`${path.sep}tmp${path.sep}`) ||
        relative.includes(`${path.sep}__tests__${path.sep}`) ||
        relative.endsWith(`${path.sep}__tests__`)
      ) {
        continue;
      }

      for (const entry of readdirSync(current)) {
        stack.push(path.join(current, entry));
      }
      continue;
    }

    if (/\.(?:mjs|cjs|js|jsx|ts|tsx)$/u.test(current)) {
      results.push(current);
    }
  }

  return results;
}

function findStandaloneDemonstrationImports(root) {
  const importPattern =
    /(?:from\s+|import\s*\(|require\s*\()\s*['"][^'"]*(?:@bitcode\/protocol-demonstration|protocol-demonstration\/src)/u;
  const sourceRoots = ['packages', 'uapi/app', 'uapi/components', 'uapi/lib'];
  return sourceRoots.flatMap((sourceRoot) =>
    collectSourceFiles(root, sourceRoot).flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      return importPattern.test(source) ? [path.relative(root, filePath)] : [];
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
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V29',
    `BITCODE_SPEC.txt must remain V29 during V30 gate work. Observed ${pointer || 'empty'}.`
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v30' || /^v30\/gate-2-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 Gate 2 work must occur on version/v30 or v30/gate-2-* branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  for (const relativePath of [
    'packages/btd/src/api-boundaries.ts',
    'packages/btd/src/index.ts',
    'packages/btd/__tests__/api-boundaries.test.ts',
    'packages/api/src/routes/btd-crypto.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'packages/btd/README.md',
    'packages/api/README.md',
    'packages/specifying/README.md',
    'BITCODE_SPEC_V30_DELTA.md',
    'BITCODE_SPEC_V30_PARITY_MATRIX.md',
    'BITCODE_SPEC_V30_NOTES.md'
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V30 Gate 2 file: ${relativePath}`);
  }

  const btdBoundary = read(root, 'packages/btd/src/api-boundaries.ts');
  const btdIndex = read(root, 'packages/btd/src/index.ts');
  const btdTest = read(root, 'packages/btd/__tests__/api-boundaries.test.ts');
  const apiRoute = read(root, 'packages/api/src/routes/btd-crypto.ts');
  const apiRouteTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const btdReadme = read(root, 'packages/btd/README.md');
  const apiReadme = read(root, 'packages/api/README.md');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const delta = read(root, 'BITCODE_SPEC_V30_DELTA.md');
  const parity = read(root, 'BITCODE_SPEC_V30_PARITY_MATRIX.md');
  const notes = read(root, 'BITCODE_SPEC_V30_NOTES.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'buildBtdMintDraft',
    'buildBtdRegistrySnapshot',
    'buildBtdReadAccessDecision',
    'buildBtdBtcFeeTransactionSettlement',
    'parseBtdRequiredBigInt',
    'parseBtdOptionalBigInt',
    'toBtdJsonSafe'
  ]) {
    assertCheck(
      failures,
      btdBoundary.includes(`export ${symbol}`) ||
        btdBoundary.includes(`export function ${symbol}`) ||
        btdBoundary.includes(`export async function ${symbol}`),
      `BTD boundary must export ${symbol}.`
    );
  }

  assertCheck(failures, btdBoundary.includes('BtdOrganizationInterfaceAuthorityRouteInput'), 'BTD boundary must distinguish route body input from the actor-bound authority primitive input.');
  assertCheck(failures, btdIndex.includes("export * from './api-boundaries';"), 'BTD package index must export api-boundaries.');
  assertCheck(failures, btdTest.includes("from '../src'"), 'BTD API-boundary tests must exercise package exports.');
  assertCheck(failures, btdTest.includes('parseBtdRequiredBigInt'), 'BTD API-boundary tests must cover BigInt parsers.');
  assertCheck(failures, btdTest.includes('toBtdJsonSafe'), 'BTD API-boundary tests must cover JSON-safe serialization.');

  assertCheck(failures, apiRoute.includes("from '@bitcode/btd'"), 'BTD route must import package-owned builders from @bitcode/btd.');
  for (const localRouteImplementation of [
    'export interface BtdMintDraftInput',
    'function assertMintDraftAdmission',
    'function buildBtcFeeReceiptForAction',
    'function toJsonSafe'
  ]) {
    assertCheck(failures, !apiRoute.includes(localRouteImplementation), `BTD route must not own ${localRouteImplementation}.`);
  }
  assertCheck(failures, apiRoute.includes('toBtdJsonSafe as toJsonSafe'), 'BTD route must delegate JSON-safe conversion to @bitcode/btd.');
  assertCheck(failures, apiRoute.includes('parseBtdRequiredBigInt'), 'BTD route must delegate BigInt parsing to @bitcode/btd.');
  assertCheck(
    failures,
    !/import\s*\{[^}]*buildBtdMintDraft[^}]*\}\s*from\s*['"]\.\.\/btd-crypto['"]/su.test(apiRouteTest),
    'BTD route tests must not import package-owned builders from the route module.'
  );
  assertCheck(failures, apiRouteTest.includes("from '@bitcode/btd'"), 'BTD route tests must import package-owned builders from @bitcode/btd.');

  const demonstrationImportViolations = findStandaloneDemonstrationImports(root);
  assertCheck(
    failures,
    demonstrationImportViolations.length === 0,
    `Commercial runtime source must not import protocol-demonstration/src or @bitcode/protocol-demonstration: ${demonstrationImportViolations.join(', ')}`
  );

  assertCheck(failures, btdReadme.includes('api-boundaries.ts'), 'BTD README must name the API-boundary module.');
  assertCheck(failures, btdReadme.includes('@bitcode/btd'), 'BTD README must name accepted package imports.');
  assertCheck(failures, apiReadme.includes('@bitcode/btd'), 'API README must state BTD route delegation to @bitcode/btd.');
  assertCheck(failures, apiReadme.includes('route-owned'), 'API README must distinguish route-owned work from package-owned policy.');
  assertCheck(failures, protocolReadme.includes('@bitcode/specifying'), 'Protocol README must keep accepted commercial imports explicit.');
  assertCheck(failures, protocolReadme.includes('must not import `protocol-demonstration/src/*`'), 'Protocol README must forbid standalone demonstration runtime imports.');

  assertCheck(failures, delta.includes('Gate 2: Protocol Package API Boundaries'), 'V30 DELTA must retain Gate 2 scope.');
  assertCheck(failures, delta.includes('packages/btd/src/api-boundaries.ts'), 'V30 DELTA must name the BTD API-boundary implementation.');
  assertCheck(failures, parity.includes('## Gate 2 Parity'), 'V30 PARITY must include Gate 2 parity evidence.');
  assertCheck(failures, parity.includes('packages/btd/src/api-boundaries.ts'), 'V30 PARITY must cite the BTD API-boundary implementation.');
  assertCheck(failures, notes.includes('Gate 2 protocol package API boundary notes'), 'V30 NOTES must include Gate 2 implementation notes.');

  assertCheck(failures, packageJson.includes('"check:v30-gate2"'), 'package.json must expose check:v30-gate2.');
  assertCheck(failures, gateWorkflow.includes('check-v30-gate2-protocol-package-api-boundaries.mjs'), 'Gate workflow must run the V30 Gate 2 checker.');

  if (failures.length) {
    process.stderr.write('V30 Gate 2 package API boundary check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write('V30 Gate 2 package API boundary check passed.\n');
}

main();
