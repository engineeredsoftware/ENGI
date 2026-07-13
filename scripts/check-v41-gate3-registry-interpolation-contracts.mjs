#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v41-registry-interpolation-contracts.json';

const REQUIRED_FIELD_IDS = [
  'contractId',
  'sourceRoots',
  'registryIds',
  'compositionLevelIds',
  'interpolationKeyIds',
  'missingKeyBehaviorIds',
  'toolPromptInjectionIds',
  'contextHandlingIds',
  'parserTargetIds',
  'executionAncestryFrameIds',
  'validationCommand',
  'disclosureTier',
];

const REQUIRED_CONTRACT_IDS = [
  'prompt-registry-totality',
  'templated-promptpart-interpolation',
  'ptrr-agent-prompt-composition',
  'ptrr-step-prompt-composition',
  'failsafe-sequence-context-handling',
  'thricified-generation-final-resolution',
  'execution-ancestry-context-overlays',
  'tool-doc-code-prompt-injection',
  'readneed-comprehension-return-type-contract',
  'readfits-finding-search-return-type-contract',
  'assetpack-synthesis-parser-delivery-contract',
  'gate2-inventory-registry-coverage-binding',
];

const REQUIRED_PREDICATE_IDS = [
  'prompt.extends-registry',
  'prompt.validates-required-paths',
  'executionprompt.enforces-root-paths',
  'templated.throws-missing-variable',
  'agentfactory.attaches-agent-prompt',
  'stepfactory.attaches-step-purpose',
  'failsafe.delegates-to-thricified',
  'thricified.sequences-reason-judge-structured-output',
  'substep.builds-hierarchical-prompt',
  'generationprompt.injects-tool-docs-and-schema',
  'execution.finds-up-ancestry',
  'doccodetoolprompt.composes-required-sections',
  'readneed.collects-interpolation-keys',
  'readfits.runtime-collects-telemetry-output-schemas',
  'depository.search-has-embedding-policy',
  'assetpack-synthesis.uses-ptrr-agent',
  'gate2.inventory-has-registry-paths',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  Buffer.from('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5', 'base64url').toString('utf8'),
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
      'Usage: node scripts/check-v41-gate3-registry-interpolation-contracts.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V41 Gate 3 source-safe registry composition, interpolation, execution ancestry, tool prompt injection, and parser target contracts.',
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
      branch === 'version/v41' || /^v41\/gate-(?:[3-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V41 Gate 3+ work must occur on version/v41 or v41/gate-3..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.bitcode/v41-promptpart-prompt-inventory.json',
    'packages/specifying/src/canonical/v41-registry-interpolation-contracts.js',
    'packages/specifying/src/canonical/v41-promptpart-prompt-inventory.js',
    'packages/specifying/test/v41-registry-interpolation-contracts.test.js',
    'scripts/generate-v41-registry-interpolation-contracts.mjs',
    'scripts/check-v41-gate3-registry-interpolation-contracts.mjs',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/prompts/src/prompt.ts',
    'packages/prompts/src/parts/TemplatedPromptPart.ts',
    'packages/execution-generics/src/prompts/ExecutionPrompt.ts',
    'packages/agent-generics/src/agents/factories.ts',
    'packages/agent-generics/src/steps/failsafe-sequence.ts',
    'packages/agent-generics/src/steps/thricified-generation.ts',
    'packages/agent-generics/src/substeps/factories.ts',
    'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
    'BITCODE_SPEC_V41.md',
    'BITCODE_SPEC_V41_DELTA.md',
    'BITCODE_SPEC_V41_NOTES.md',
    'BITCODE_SPEC_V41_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V41 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v41-registry-interpolation-contracts.mjs', '--check']);
    } catch (error) {
      failures.push(`V41 registry/interpolation artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (!args.skipPackageTests && failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/specifying/test/v41-registry-interpolation-contracts.test.js']);
    } catch (error) {
      failures.push(`V41 registry/interpolation protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V41 registry/interpolation artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v41-registry-interpolation-contracts', 'Registry/interpolation artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v41.registryInterpolationContracts.v1', 'Registry/interpolation schemaId must match.');
    assertCheck(
      failures,
      artifact.version === 'V41' && artifact.currentTarget === 'V40',
      'Registry/interpolation must bind V41 over active V40.',
    );
    assertCheck(failures, artifact.passed === true, 'Registry/interpolation artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-registry-interpolation-contract-metadata',
      'Registry/interpolation artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredFieldIds, REQUIRED_FIELD_IDS), 'Registry/interpolation must expose every required field.');
    assertCheck(failures, includesAll(artifact.rows.map((row) => row.contractId), REQUIRED_CONTRACT_IDS), 'Registry/interpolation must cover every required contract row.');
    assertCheck(
      failures,
      includesAll(artifact.sourcePredicateResults.map((result) => result.id), REQUIRED_PREDICATE_IDS),
      'Registry/interpolation source predicates must include critical predicate ids.',
    );
    assertCheck(failures, artifact.coverage.rowCount === REQUIRED_CONTRACT_IDS.length, 'Registry/interpolation row count must match required contracts.');
    assertCheck(failures, artifact.coverage.requiredPredicateCount >= 50, 'Registry/interpolation must require at least 50 source predicates.');
    assertCheck(failures, artifact.coverage.passedPredicateCount === artifact.coverage.requiredPredicateCount, 'Registry/interpolation predicates must all pass.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Registry/interpolation must have no failed source predicates.');
    assertCheck(failures, artifact.coverage.registryIdCount >= 20, 'Registry/interpolation must cover at least 20 registry ids.');
    assertCheck(failures, artifact.coverage.interpolationKeyCount >= 20, 'Registry/interpolation must cover at least 20 interpolation keys.');
    assertCheck(failures, artifact.coverage.toolPromptInjectionCount >= 5, 'Registry/interpolation must cover tool prompt injection ids.');
    assertCheck(failures, artifact.coverage.parserTargetCount >= 6, 'Registry/interpolation must cover parser target ids.');
    assertCheck(failures, artifact.coverage.executionAncestryFrameCount >= 5, 'Registry/interpolation must cover execution ancestry frames.');
    assertCheck(failures, artifact.coverage.sourceRootPresentCount === artifact.coverage.sourceRootCount, 'All registry/interpolation source roots must exist.');
    assertCheck(failures, artifact.coverage.gate2PromptPartRowCount >= 1000, 'Registry/interpolation must bind Gate 2 PromptPart count.');
    assertCheck(failures, artifact.coverage.gate2PromptRowCount >= 20, 'Registry/interpolation must bind Gate 2 Prompt count.');
    assertCheck(failures, artifact.coverage.gate2PromptRowsWithRegistryPaths >= 10, 'Registry/interpolation must bind Gate 2 registry paths.');
    assertCheck(failures, artifact.coverage.gate2V42RoadmapPrepared === true, 'Registry/interpolation must preserve V42 roadmap posture.');
    assertCheck(failures, artifact.sourceSafety.sourceSafeMetadataOnly === true, 'Registry/interpolation must be metadata-only.');
    assertCheck(failures, artifact.sourceSafety.rawPromptTextSerialized === false, 'Registry/interpolation must not serialize raw prompt text.');
    assertCheck(failures, artifact.sourceSafety.rawProviderResponseSerialized === false, 'Registry/interpolation must not serialize provider responses.');
    assertCheck(failures, artifact.sourceSafety.privateContextSerialized === false, 'Registry/interpolation must not serialize private context.');
    assertCheck(failures, artifact.sourceSafety.unpaidAssetPackSourceVisible === false, 'Registry/interpolation must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.sourceSafety.credentialsSerialized === false, 'Registry/interpolation must not serialize credentials.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^v41-registry-interpolation-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Registry/interpolation rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.rawPromptTextSerialized === false && row.rawProviderResponseSerialized === false),
      'Registry/interpolation rows must not serialize raw prompt text or provider responses.',
    );
  }

  const packageJson = fileExists(root, 'package.json') ? read(root, 'package.json') : '';
  assertCheck(failures, packageJson.includes('generate:v41-registry-interpolation-contracts'), 'package.json must expose generate:v41-registry-interpolation-contracts.');
  assertCheck(failures, packageJson.includes('check:v41-gate3'), 'package.json must expose check:v41-gate3.');

  const roadmap = fileExists(root, 'SPECIFICATIONS_ROADMAP.md') ? read(root, 'SPECIFICATIONS_ROADMAP.md') : '';
  assertCheck(failures, /Current working gate: V41 Gate (?:3|4|5|6|7|8|9)\b/u.test(roadmap), 'Roadmap must name V41 Gate 3 or later as current working gate.');
  assertCheck(failures, roadmap.includes('V42 should focus on the reliable MVP product experience'), 'Roadmap must preserve V42 reliable MVP product note.');
  assertCheck(failures, roadmap.includes('AI-reading dominant demonstration'), 'Roadmap must preserve AI-reading dominant demonstration note.');

  if (failures.length > 0) {
    process.stderr.write(`V41 Gate 3 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V41 Gate 3 check passed: rows=${artifact.coverage.rowCount} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
