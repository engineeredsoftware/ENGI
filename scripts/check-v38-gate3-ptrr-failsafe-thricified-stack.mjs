#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v38-ptrr-failsafe-thricified-stack.json';

const REQUIRED_STEP_IDS = ['plan', 'try', 'refine', 'retry'];
const REQUIRED_FAILSAFE_IDS = ['prepare-concise-context', 'chunk-then-sum', 'stitch-until-complete'];
const REQUIRED_GENERATION_IDS = ['reason', 'judge', 'structured-output'];
const REQUIRED_ROW_IDS = [
  'agent:factoryPTRRAgent',
  'step:plan',
  'step:try',
  'step:refine',
  'step:retry',
  'failsafe:createFailsafeGenerationSequence',
  'generation:createThricifiedGeneration',
  'substep:prompt-context-telemetry',
  'reading:gate2-counts-bound-to-stack',
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
      'Usage: node scripts/check-v38-gate3-ptrr-failsafe-thricified-stack.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V38 Gate 3 source-backed PTRR/Failsafe/Thricified stack artifact, protocol tests, docs, and workflow wiring.',
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

  assertCheck(
    failures,
    pointer === 'V37',
    `BITCODE_SPEC.txt must remain V37 during V38 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v38' || /^v38\/gate-(?:[3-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 3+ work must occur on version/v38 or v38/gate-3..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.bitcode/v38-inference-surface-inventory.json',
    'packages/specifying/src/canonical/ptrr-failsafe-thricified-stack.js',
    'packages/specifying/src/canonical/inference-surface-inventory.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/v38-ptrr-failsafe-thricified-stack.test.js',
    'scripts/generate-v38-ptrr-failsafe-thricified-stack.mjs',
    'scripts/check-v38-gate3-ptrr-failsafe-thricified-stack.mjs',
    'packages/agent-generics/src/agents/factories.ts',
    'packages/agent-generics/src/steps/factories.ts',
    'packages/agent-generics/src/steps/failsafe-sequence.ts',
    'packages/agent-generics/src/steps/thricified-generation.ts',
    'packages/agent-generics/src/substeps/factories.ts',
    'BITCODE_SPEC_V38.md',
    'BITCODE_SPEC_V38_DELTA.md',
    'BITCODE_SPEC_V38_NOTES.md',
    'BITCODE_SPEC_V38_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v38-ptrr-failsafe-thricified-stack.mjs', '--check']);
    } catch (error) {
      failures.push(`V38 PTRR stack artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/specifying/test/v38-ptrr-failsafe-thricified-stack.test.js']);
    } catch (error) {
      failures.push(`V38 PTRR stack protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V38 PTRR stack artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-ptrr-failsafe-thricified-stack', 'PTRR stack artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.ptrrFailsafeThricifiedStack.v1', 'PTRR stack schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'PTRR stack must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'PTRR stack artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-ptrr-failsafe-thricified-stack-metadata',
      'PTRR stack must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.ptrrStepIds, REQUIRED_STEP_IDS), 'PTRR stack must enumerate Plan/Try/Refine/Retry.');
    assertCheck(failures, includesAll(artifact.failsafeStageIds, REQUIRED_FAILSAFE_IDS), 'PTRR stack must enumerate Failsafe stages.');
    assertCheck(failures, includesAll(artifact.thricifiedGenerationStageIds, REQUIRED_GENERATION_IDS), 'PTRR stack must enumerate Thricified stages.');
    assertCheck(failures, includesAll(artifact.rows.map((row) => row.rowId), REQUIRED_ROW_IDS), 'PTRR stack rows must cover every required row id.');
    assertCheck(failures, artifact.coverage.rowCount === 9, 'PTRR stack must have 9 source-backed rows.');
    assertCheck(failures, artifact.coverage.requiredPredicateCount === 69, 'PTRR stack must require 69 source predicates.');
    assertCheck(failures, artifact.coverage.passedPredicateCount === 69, 'PTRR stack must pass 69 source predicates.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'PTRR stack must have no failed source predicates.');
    assertCheck(failures, artifact.coverage.totalPtrrStepCount === 52, 'PTRR stack must bind Gate 2 total PTRR steps.');
    assertCheck(failures, artifact.coverage.totalFailsafeSequenceCount === 156, 'PTRR stack must bind Gate 2 failsafe totals.');
    assertCheck(failures, artifact.coverage.totalThricifiedGenerationCount === 156, 'PTRR stack must bind Gate 2 Thricified totals.');
    assertCheck(failures, artifact.coverage.totalProviderCallCount === 468, 'PTRR stack must bind Gate 2 provider-call totals.');
    assertCheck(failures, artifact.coverage.expectedProviderCallSlots === 468, 'PTRR stack provider-call law must equal 468.');
    assertCheck(failures, artifact.coverage.providerCallSlotsPerPtrrStep === 9, 'Each PTRR step must have 9 provider-call slots.');
    assertCheck(failures, artifact.coverage.toolsAreStepOwned === true, 'Tools must remain step-owned.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'PTRR stack must not expose protected source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'PTRR stack must not serialize credentials.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'PTRR stack must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'PTRR stack must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^v38-ptrr-stack-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'PTRR stack rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.sourceRootsPresent === true),
      'PTRR stack rows must have present source roots.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V38.md');
  const delta = read(root, 'BITCODE_SPEC_V38_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V38_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V38_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const source = read(root, 'packages/specifying/src/canonical/ptrr-failsafe-thricified-stack.js');
  const index = read(root, 'packages/specifying/src/index.js');
  const typeDefs = read(root, 'packages/specifying/src/index.d.ts');
  const test = read(root, 'packages/specifying/test/v38-ptrr-failsafe-thricified-stack.test.js');

  for (const doc of [spec, delta, notes, parity, readme, protocolReadme]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V38 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('V38PtrrFailsafeThricifiedStack'), 'V38 docs must name V38PtrrFailsafeThricifiedStack.');
    assertCheck(failures, doc.includes('source-safe-ptrr-failsafe-thricified-stack-metadata'), 'V38 docs must name PTRR stack source safety verdict.');
    assertCheck(failures, doc.includes('FailsafeGenerationSequence'), 'V38 docs must name FailsafeGenerationSequence.');
    assertCheck(failures, doc.includes('ThricifiedGeneration'), 'V38 docs must name ThricifiedGeneration.');
  }

  assertCheck(failures, parity.includes('| PTRR Failsafe and Thricified execution stack | Gate 3 |') && parity.includes('| closed |'), 'V38 parity must close the Gate 3 matrix row.');
  assertCheck(failures, parity.includes('## Gate 3 Parity') && parity.includes('closed'), 'V38 parity must include closed Gate 3 parity.');
  assertCheck(
    failures,
    /Current working gate: V38 Gate (?:4|5|6|7|8|9|10|11)\b/u.test(roadmap),
    'Roadmap must advance past V38 Gate 3 after this gate closes.',
  );
  assertCheck(failures, roadmap.includes('V38 Gate 3 closure anchor'), 'Roadmap must include a V38 Gate 3 closure anchor.');
  assertCheck(failures, packageJson.includes('"generate:v38-ptrr-failsafe-thricified-stack"'), 'package.json must expose the Gate 3 generator.');
  assertCheck(failures, packageJson.includes('"check:v38-ptrr-failsafe-thricified-stack"'), 'package.json must expose the Gate 3 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v38-gate3"'), 'package.json must expose check:v38-gate3.');
  assertCheck(failures, gateWorkflow.includes('check-v38-gate3-ptrr-failsafe-thricified-stack.mjs'), 'Gate workflow must run the V38 Gate 3 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v38-gate3-ptrr-failsafe-thricified-stack.mjs'), 'Canon workflow must run the V38 Gate 3 checker.');
  assertCheck(failures, gateWorkflow.includes('v38-ptrr-failsafe-thricified-stack.test.js'), 'Gate workflow must run the V38 Gate 3 protocol test.');

  for (const phrase of [
    'buildV38PtrrFailsafeThricifiedStack',
    'V38_PTRR_STEP_IDS',
    'createThricifiedGeneration',
    'factoryPrepareConciseContext',
    'factoryChunkThenSum',
    'factoryStitchUntilComplete',
    'providerCallSlotsPerPtrrStep',
    'toolsAreStepOwned',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 3 source must include ${phrase}.`);
  }

  for (const phrase of ['buildV38PtrrFailsafeThricifiedStack', 'sourcePredicateResults', 'providerCallSlotsPerPtrrStep']) {
    assertCheck(failures, test.includes(phrase), `Gate 3 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildV38PtrrFailsafeThricifiedStack'), 'Protocol index must export buildV38PtrrFailsafeThricifiedStack.');
  assertCheck(failures, typeDefs.includes('buildV38PtrrFailsafeThricifiedStack'), 'Protocol type declarations must export buildV38PtrrFailsafeThricifiedStack.');

  if (failures.length > 0) {
    process.stderr.write('V38 Gate 3 PTRR/Failsafe/Thricified stack check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V38 Gate 3 PTRR/Failsafe/Thricified stack ok rows=9 predicates=69 providerCalls=468\n');
}

main();
