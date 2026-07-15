#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v41-promptpart-prompt-inventory.json';

const REQUIRED_SURFACE_IDS = [
  'raw-promptparts-generic',
  'raw-promptparts-specific',
  'reading-pipeline-prompts',
  'conversation-prompts',
  'tool-definition-prompts',
  'interface-prompts',
  'benchmark-prompts',
];

const REQUIRED_FIELD_IDS = [
  'inventoryId',
  'sourcePath',
  'sourceHash',
  'registryOwner',
  'semanticPurposeId',
  'promptFamilyIds',
  'templateVariableNames',
  'benchmarkFixtureIds',
  'disclosureTier',
  'validationCommand',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JIUzI1Ni'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
];

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipPackageTests: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v41-gate2-promptpart-prompt-inventory.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V41 Gate 2 source-safe PromptPart and Prompt inventory artifacts, docs, tests, and workflow wiring.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

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
    pointer === 'V40',
    `BITCODE_SPEC.txt must remain V40 during V41 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v41' || /^v41\/gate-(?:[2-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V41 Gate 2+ work must occur on version/v41 or v41/gate-2..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v41-promptpart-prompt-inventory.js',
    'scripts/specifying/test/v41-promptpart-prompt-inventory.test.js',
    'scripts/generate-v41-promptpart-prompt-inventory.mjs',
    'scripts/check-v41-gate2-promptpart-prompt-inventory.mjs',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'BITCODE_SPEC_V41.md',
    'BITCODE_SPEC_V41_DELTA.md',
    'BITCODE_SPEC_V41_NOTES.md',
    'BITCODE_SPEC_V41_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'packages/prompts/src/raw_promptparts/generic',
    'packages/prompts/src/raw_promptparts/specific',
    'packages/asset-packs-pipelines/domain/src/agents',
    'packages/conversations/src',
    'packages/tools-generics/src',
    'packages/generic-tools',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V41 Gate 2 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v41-promptpart-prompt-inventory.mjs', '--check']);
    } catch (error) {
      failures.push(`V41 PromptPart/Prompt inventory artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (!args.skipPackageTests && failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/v41-promptpart-prompt-inventory.test.js']);
    } catch (error) {
      failures.push(`V41 PromptPart/Prompt inventory protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V41 prompt inventory artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v41-promptpart-prompt-inventory', 'Prompt inventory artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v41.promptpartPromptInventory.v1', 'Prompt inventory schemaId must match.');
    assertCheck(failures, artifact.version === 'V41' && artifact.currentTarget === 'V40', 'Prompt inventory must bind V41 over active V40.');
    assertCheck(failures, artifact.passed === true, 'Prompt inventory artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-promptpart-prompt-inventory-metadata',
      'Prompt inventory must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.coverage.requiredSurfaceIds, REQUIRED_SURFACE_IDS), 'Prompt inventory must cover every required surface.');
    assertCheck(failures, includesAll(artifact.coverage.requiredFieldIds, REQUIRED_FIELD_IDS), 'Prompt inventory must cover every required field.');
    assertCheck(failures, artifact.coverage.promptPartRowCount >= 1000, 'Prompt inventory must include at least 1000 PromptPart rows.');
    assertCheck(failures, artifact.coverage.promptRowCount >= 20, 'Prompt inventory must include at least 20 composed Prompt rows.');
    assertCheck(failures, artifact.coverage.readingPromptRowCount >= 5, 'Prompt inventory must include Reading prompt rows.');
    assertCheck(failures, artifact.coverage.conversationPromptRowCount >= 1, 'Prompt inventory must include Conversation prompt rows.');
    assertCheck(failures, artifact.coverage.toolPromptRowCount >= 5, 'Prompt inventory must include tool prompt rows.');
    assertCheck(failures, artifact.coverage.promptRowsWithRegistryPaths >= 10, 'Prompt inventory must include registry path rows.');
    assertCheck(failures, artifact.coverage.promptPartRowsWithDocComments >= 50, 'PromptPart inventory must include doc-comment rows.');
    assertCheck(failures, artifact.coverage.promptRowsWithDocComments >= 5, 'Prompt inventory must include prompt doc-comment rows.');
    assertCheck(failures, artifact.coverage.sourceRootPresentCount === artifact.coverage.sourceRootCount, 'All prompt inventory source roots must exist.');
    assertCheck(failures, artifact.coverage.v38BenchmarkReportPassed === true, 'V38 prompt benchmark report must remain passing.');
    assertCheck(failures, artifact.coverage.v40BenchmarkSmokePassed === true, 'V40 prompt benchmark smoke must remain passing.');
    assertCheck(failures, artifact.coverage.v42RoadmapPrepared === true, 'V42 MVP roadmap posture must be prepared.');
    assertCheck(failures, artifact.sourceSafety.sourceSafeMetadataOnly === true, 'Prompt inventory must be metadata-only.');
    assertCheck(failures, artifact.sourceSafety.rawPromptTextSerialized === false, 'Prompt inventory must not serialize raw prompt text.');
    assertCheck(failures, artifact.sourceSafety.rawProviderResponseSerialized === false, 'Prompt inventory must not serialize raw provider responses.');
    assertCheck(failures, artifact.sourceSafety.unpaidAssetPackSourceVisible === false, 'Prompt inventory must not expose unpaid AssetPack source.');
    assertCheck(
      failures,
      artifact.promptPartRows.every((row) => /^v41-prompt-inventory-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'PromptPart rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.promptRows.every((row) => /^v41-prompt-inventory-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Prompt rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.promptPartRows.every((row) => row.rawPromptTextSerialized === false && row.rawProviderResponseSerialized === false),
      'PromptPart rows must not serialize prompt text or provider responses.',
    );
    assertCheck(
      failures,
      artifact.promptRows.every((row) => row.rawPromptTextSerialized === false && row.rawProviderResponseSerialized === false),
      'Prompt rows must not serialize prompt text or provider responses.',
    );
  }

  const packageJson = fileExists(root, 'package.json') ? read(root, 'package.json') : '';
  assertCheck(failures, packageJson.includes('generate:v41-prompt-inventory'), 'package.json must expose generate:v41-prompt-inventory.');
  assertCheck(failures, packageJson.includes('check:v41-gate2'), 'package.json must expose check:v41-gate2.');

  const roadmap = fileExists(root, 'SPECIFICATIONS_ROADMAP.md') ? read(root, 'SPECIFICATIONS_ROADMAP.md') : '';
  assertCheck(failures, roadmap.includes('V42'), 'Roadmap must include V42.');
  assertCheck(failures, roadmap.includes('shortest-path Depositing'), 'Roadmap must name shortest-path Depositing.');
  assertCheck(failures, roadmap.includes('shortest-path Reading'), 'Roadmap must name shortest-path Reading.');
  assertCheck(failures, roadmap.includes('AI-reading dominant demonstration'), 'Roadmap must name the AI-reading dominant demonstration.');

  if (failures.length > 0) {
    process.stderr.write(`V41 Gate 2 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V41 Gate 2 check passed: promptParts=${artifact.coverage.promptPartRowCount} prompts=${artifact.coverage.promptRowCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
