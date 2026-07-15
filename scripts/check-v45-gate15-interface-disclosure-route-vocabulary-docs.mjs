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
      'Usage: node scripts/check-v45-gate15-interface-disclosure-route-vocabulary-docs.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V45 Gate 15 interface disclosure, route vocabulary, public docs, and /exchange compatibility posture.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function assertIncludesAll(failures, content, phrases, location) {
  for (const phrase of phrases) {
    assertCheck(failures, content.includes(phrase), `${location} must include: ${phrase}`);
  }
}

function assertDoesNotIncludeAny(failures, content, phrases, location) {
  for (const phrase of phrases) {
    assertCheck(failures, !content.includes(phrase), `${location} must not include stale current-product language: ${phrase}`);
  }
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

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 Gate 15 work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v45' || /^v45\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 work must occur on version/v45 or v45/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'specifications/BITCODE_SPEC_V45.md',
    'specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md',
    'specifications/BITCODE_SPEC.txt',
    'package.json',
    'packages/asset-packs-pipelines/domain/src/interface-disclosure-boundary.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/interface-disclosure-boundary.test.ts',
    'apps/uapi/app/page.tsx',
    'apps/uapi/app/exchange/README.md',
    'apps/uapi/app/(root)/components/PublicDocsPageContent.tsx',
    'apps/uapi/components/bitcode/layout/bitcode-public-copy.ts',
    'apps/uapi/components/bitcode/layout/bitcode-public-explainers.ts',
    'apps/uapi/tests/publicDocsPageContent.test.tsx',
    'apps/uapi/tests/bitcodeDocsContent.test.tsx',
    'apps/uapi/tests/marketingLandingPage.test.tsx',
    'apps/uapi/tests/marketingOperatorGuideCard.test.tsx',
    'apps/uapi/tests/readPageClient.test.tsx',
    'apps/uapi/tests/depositPageClient.test.tsx',
    'apps/uapi/tests/packsPageClient.test.tsx',
    'apps/uapi/jest.config.cjs',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 15 file: ${relativePath}`);
  }

  const implementation = read(root, 'packages/asset-packs-pipelines/domain/src/interface-disclosure-boundary.ts');
  const implementationTest = read(root, 'packages/asset-packs-pipelines/domain/src/__tests__/interface-disclosure-boundary.test.ts');
  const packageJson = read(root, 'package.json');
  const parity = read(root, 'specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md');
  const publicDocs = [
    read(root, 'apps/uapi/app/docs/bitcode-docs-content.ts'),
    read(root, 'apps/uapi/app/(root)/components/PublicDocsPageContent.tsx'),
    read(root, 'apps/uapi/components/bitcode/layout/bitcode-public-copy.ts'),
    read(root, 'apps/uapi/components/bitcode/layout/bitcode-public-explainers.ts'),
    read(root, 'apps/uapi/app/page.tsx'),
  ].join('\n');
  const exchangeReadme = read(root, 'apps/uapi/app/exchange/README.md');
  const routeTests = [
    read(root, 'apps/uapi/tests/readPageClient.test.tsx'),
    read(root, 'apps/uapi/tests/depositPageClient.test.tsx'),
    read(root, 'apps/uapi/tests/packsPageClient.test.tsx'),
  ].join('\n');
  const docsTests = [
    read(root, 'apps/uapi/tests/publicDocsPageContent.test.tsx'),
    read(root, 'apps/uapi/tests/bitcodeDocsContent.test.tsx'),
    read(root, 'apps/uapi/tests/marketingLandingPage.test.tsx'),
    read(root, 'apps/uapi/tests/marketingOperatorGuideCard.test.tsx'),
  ].join('\n');
  const uapiJestConfig = read(root, 'apps/uapi/jest.config.cjs');

  assertIncludesAll(failures, implementation, [
    'INTERFACE_DISCLOSURE_BOUNDARY_SURFACES',
    'deposit_route',
    'read_route',
    'packs_route',
    'public_api',
    'mcp_api',
    'chatgpt_app',
    'bitcode_chat',
    'public_docs',
    'landing_page',
    'exchange_redirect',
    'before-settlement',
    'after-preview',
    'after-quote',
    'after-payment-observation',
    'after-finality',
    'after-btd-rights-transfer',
    'after-repository-delivery',
    'AssetPack commodity',
    'BTD scalar volume and rights',
    'BTC settlement money',
    'proof readback authority',
    'sourceBearingAssetPackVisibleToReader',
    'protectedSourceVisible: false',
    'unpaidAssetPackSourceVisible: false',
    'credentialsSerialized: false',
  ], 'interface-disclosure-boundary.ts');

  assertIncludesAll(failures, implementationTest, [
    'covers every product, interface, teaching, and compatibility surface',
    'collapsed and expanded interface states source-safe',
    'unlocks source-bearing delivery only after BTC finality',
    'compatibility redirect rather than a current product route',
    'does not serialize protected source, secrets, or raw provider responses',
  ], 'interface-disclosure-boundary.test.ts');

  assertIncludesAll(failures, publicDocs, [
    'AssetPack',
    'BTD scalar volume and rights',
    'BTC settlement money',
    'proof readback authority',
    '/deposit',
    '/read',
    '/packs',
    'Bitcode Chat',
  ], 'public docs and landing copy');

  assertDoesNotIncludeAny(failures, publicDocs, [
    'Source Shares and the Bitcode Exchange',
    'Exchange is the state',
    'Exchange is the durable state',
    'Build against Bitcode without losing the Exchange contract',
    'MOCKED TERMINAL',
    'SOURCE SHARES',
    'Open Bitcode',
  ], 'public docs and landing copy');

  assertIncludesAll(failures, exchangeReadme, [
    '# /exchange compatibility redirect',
    '`app/exchange/` exists only to preserve old links. It redirects to `/packs`.',
    '/deposit',
    '/read',
    '/packs',
    'BTD scalar volume and rights',
    'BTC settlement money',
    'compatibility only',
  ], 'apps/uapi/app/exchange/README.md');

  assertIncludesAll(failures, routeTests, [
    'Source-safe read state',
    'Source-safe deposit state',
    'Source-safe detail',
    'Disclosure boundary',
    'expandable-proof-detail',
    'Withheld until paid rights: source-bearing AssetPack contents',
    'Withheld: raw source, unpaid AssetPack source, prompts',
  ], 'route source-safe collapsed/expanded tests');

  assertIncludesAll(failures, docsTests, [
    'Learn Bitcode from AssetPacks to proof.',
    'AssetPacks, BTD, and the Bitcode activity ledger',
    'BTD scalar volume and rights',
    'BTC settlement money',
    'proof readback authority',
    '/exchange is a compatibility redirect to /packs',
    'Open Packs',
  ], 'docs and marketing tests');

  assertIncludesAll(failures, uapiJestConfig, [
    '<rootDir>/tests/marketingOperatorGuideCard.test.tsx',
  ], 'uapi Jest testMatch');

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate15": "node scripts/check-v45-gate15-interface-disclosure-route-vocabulary-docs.mjs"'),
    'package.json must expose check:v45-gate15.',
  );

  assertIncludesAll(failures, parity, [
    'Gate 15 implementation readback',
    'packages/asset-packs-pipelines/domain/src/interface-disclosure-boundary.ts',
    'apps/uapi/app/exchange/README.md',
    'apps/uapi/app/(root)/components/PublicDocsPageContent.tsx',
    'check:v45-gate15',
  ], 'V45 parity matrix Gate 15 readback');

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
    process.stderr.write('V45 Gate 15 interface disclosure, route vocabulary, and docs check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 15 interface disclosure, route vocabulary, and docs check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
