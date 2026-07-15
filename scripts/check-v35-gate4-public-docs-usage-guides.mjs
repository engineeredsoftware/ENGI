#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v35/public-docs-usage-guides.json';

const REQUIRED_GUIDE_IDS = [
  'terminal_usage',
  'protocol_usage',
  'auxillaries_usage',
  'mcp_api_usage',
  'chatgpt_app_usage',
  'btd_usage',
  'assetpack_ranges_usage',
  'reads_usage',
  'fees_usage',
  'proof_posture_usage',
  'exchange_deferred_boundary',
  'conversations_deferred_boundary',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    repoRoot: defaultRepoRoot,
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
      'Usage: node scripts/check-v35-gate4-public-docs-usage-guides.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 4 PublicDocsUsageGuideCatalog source, generated artifact, tests, public docs disclosure limits, specs, and workflows.',
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

  assertCheck(
    failures,
    pointer === 'V34',
    `BITCODE_SPEC.txt must remain V34 during V35 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v35' || /^v35\/gate-(?:[4-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 Gate 4+ work must occur on version/v35 or v35/gate-4..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/public-docs-usage-guide-catalog.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v35-public-docs-usage-guide-catalog.test.js',
    'scripts/generate-v35-public-docs-usage-guides.mjs',
    'scripts/check-v35-gate4-public-docs-usage-guides.mjs',
    'apps/uapi/app/docs/bitcode-docs-content.ts',
    'apps/uapi/app/docs/page.tsx',
    'apps/uapi/app/docs/[slug]/page.tsx',
    'apps/uapi/app/docs/DocsArticlePage.tsx',
    'scripts/specifying/src/canonical/v21-specifying.js',
    '.specifications/BITCODE_SPEC_V35.md',
    '.specifications/BITCODE_SPEC_V35_DELTA.md',
    '.specifications/BITCODE_SPEC_V35_NOTES.md',
    '.specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V35 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v35-public-docs-usage-guides']);
    } catch (error) {
      failures.push(`V35 public docs usage guide artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'scripts/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v35-public-docs-usage-guide-catalog.test.js',
      ]);
    } catch (error) {
      failures.push(`V35 public docs usage guide package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V35 public docs usage guides must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v35-public-docs-usage-guides', 'Public docs usage guide artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v35.publicDocsUsageGuideCatalog.v1', 'Public docs usage guide schemaId must match.');
    assertCheck(failures, artifact.version === 'V35' && artifact.currentTarget === 'V34', 'Public docs usage guides must bind V35 over active V34.');
    assertCheck(failures, artifact.passed === true, 'Public docs usage guides must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-public-docs-metadata',
      'Public docs usage guides must be source-safe public docs metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredGuideIds, REQUIRED_GUIDE_IDS), 'Public docs usage guides must enumerate every required guide.');
    assertCheck(failures, includesAll(artifact.coverage.observedGuideIds, REQUIRED_GUIDE_IDS), 'Public docs usage guide coverage must observe every guide.');
    assertCheck(failures, artifact.coverage.guideCount === REQUIRED_GUIDE_IDS.length, 'Public docs usage guides must prove twelve guide rows.');
    for (const [field, label] of [
      ['terminalRepresented', 'product'],
      ['protocolRepresented', 'Protocol'],
      ['auxillariesRepresented', 'Auxillaries'],
      ['mcpApiRepresented', 'MCP API'],
      ['chatgptAppRepresented', 'ChatGPT App'],
      ['btdRepresented', 'BTD'],
      ['assetPackRangesRepresented', 'AssetPack ranges'],
      ['readsRepresented', 'Reads'],
      ['feesRepresented', 'fees'],
      ['proofPostureRepresented', 'proof posture'],
      ['exchangeDeferredBoundaryRepresented', 'Exchange deferred boundary'],
      ['conversationsDeferredBoundaryRepresented', 'Conversations deferred boundary'],
    ]) {
      assertCheck(failures, artifact.coverage[field] === true, `Public docs usage guides must represent ${label}.`);
    }
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Public docs usage guides must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Public docs usage guides must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Public docs usage guides must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Public docs usage guides must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Public docs usage guides must not expose wallet private material.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^public-docs-guide-row:[a-f0-9]{24}$/u.test(row.guideRoot)),
      'Public docs usage guide rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true && entry.routePresent === true),
      'Public docs usage guide source evidence and routes must exist.',
    );
    assertCheck(
      failures,
      artifact.rows.every(
        (row) =>
          row.forbiddenPublicContent.includes('raw_protected_prompts') &&
          row.forbiddenPublicContent.includes('wallet_private_material') &&
          row.forbiddenPublicContent.includes('unpaid_assetpack_source'),
      ),
      'Public docs guide rows must name raw protected prompts, wallet private material, and unpaid AssetPack source as forbidden.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V35.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V35_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V35_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const docsContent = read(root, 'apps/uapi/app/docs/bitcode-docs-content.ts');
  const source = read(root, 'scripts/specifying/src/canonical/public-docs-usage-guide-catalog.js');
  const index = read(root, 'scripts/specifying/src/index.js');
  const typeDefs = read(root, 'scripts/specifying/src/index.d.ts');
  const test = read(root, 'scripts/specifying/test/v35-public-docs-usage-guide-catalog.test.js');
  const specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V35 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('PublicDocsUsageGuideCatalog'), 'V35 docs must name PublicDocsUsageGuideCatalog.');
    assertCheck(failures, doc.includes('source-safe-public-docs-metadata'), 'V35 docs must name public docs source safety verdict.');
    assertCheck(failures, doc.includes('unpaid AssetPack source'), 'V35 docs must name unpaid AssetPack source boundary.');
    assertCheck(failures, doc.includes('wallet private material'), 'V35 docs must name wallet private material boundary.');
  }

  assertCheck(failures, docsContent.includes('PUBLIC_DISCLOSURE_LIMIT_SECTION'), 'Public docs content must append a disclosure-limit section.');
  for (const phrase of [
    'protected source payloads',
    'raw protected prompts',
    'secret values',
    'provider tokens',
    'wallet private material',
    'unpaid AssetPack source',
    'V35 documents Exchange and Conversations usage while deeper product depth remains future-canon work',
  ]) {
    assertCheck(failures, docsContent.includes(phrase), `Public docs content must include disclosure phrase: ${phrase}.`);
  }

  for (const phrase of [
    'buildPublicDocsUsageGuideCatalog',
    'PUBLIC_DOCS_USAGE_GUIDE_IDS',
    'PUBLIC_DOCS_USAGE_GUIDE_ROWS',
    'assetpack_ranges_usage',
    'exchange_deferred_boundary',
    'conversations_deferred_boundary',
    'source-safe-public-docs-metadata',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 4 source must include ${phrase}.`);
  }

  for (const phrase of ['buildPublicDocsUsageGuideCatalog', 'PUBLIC_DOCS_USAGE_GUIDE_IDS', 'assetpack_ranges_usage', 'fees_usage']) {
    assertCheck(failures, test.includes(phrase), `Gate 4 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildPublicDocsUsageGuideCatalog'), 'Protocol index must export buildPublicDocsUsageGuideCatalog.');
  assertCheck(failures, typeDefs.includes('buildPublicDocsUsageGuideCatalog'), 'Protocol type declarations must export buildPublicDocsUsageGuideCatalog.');
  assertCheck(failures, specifying.includes(ARTIFACT_PATH), 'Spec-family profile must include the public docs usage guide artifact path.');
  assertCheck(failures, packageJson.includes('"generate:v35-public-docs-usage-guides"'), 'package.json must expose the Gate 4 generator.');
  assertCheck(failures, packageJson.includes('"check:v35-public-docs-usage-guides"'), 'package.json must expose the Gate 4 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v35-gate4"'), 'package.json must expose check:v35-gate4.');
  assertCheck(failures, workflow.includes('check-v35-gate4-public-docs-usage-guides.mjs'), 'Gate workflow must run the V35 Gate 4 checker.');
  assertCheck(failures, workflow.includes('v35-public-docs-usage-guide-catalog.test.js'), 'Gate workflow must run the focused V35 public docs usage guide test.');
  assertCheck(failures, readme.includes('PublicDocsUsageGuideCatalog'), 'README must mention PublicDocsUsageGuideCatalog.');
  assertCheck(failures, protocolReadme.includes('PublicDocsUsageGuideCatalog'), 'Protocol README must mention PublicDocsUsageGuideCatalog.');
  assertCheck(failures, roadmap.includes('V35 Gate 4 closure anchor'), 'Roadmap must include a V35 Gate 4 closure anchor.');
  assertCheck(
    failures,
    /Current working gate: V35 Gate (?:5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must advance past V35 Gate 4 after this gate closes.',
  );
  assertCheck(failures, parity.includes('| Public docs usage guides | Gate 4 |') && parity.includes('| closed |'), 'V35 parity must close the Gate 4 matrix row.');
  assertCheck(failures, parity.includes('## Gate 4 Parity') && parity.includes('closed'), 'V35 parity must mark Gate 4 closed.');

  if (failures.length > 0) {
    process.stderr.write('V35 Gate 4 public docs usage guides check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V35 Gate 4 public docs usage guides ok rows=${artifact?.rows.length || 0}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
