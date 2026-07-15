#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v38-read-need-comprehension-inference-hardening.json';

const REQUIRED_PHASE_IDS = [
  'ReadNeedComprehensionSynthesis.request',
  'ReadNeedComprehensionSynthesis.comprehend',
  'ReadNeedComprehensionSynthesis.measure',
  'ReadNeedComprehensionSynthesis.review',
];

const REQUIRED_RECEIPT_FIELDS = [
  'phaseIds',
  'agentIds',
  'ptrrStepIds',
  'failsafeSequenceIds',
  'thricifiedGenerationIds',
  'promptTemplateIds',
  'interpolationContextKeys',
  'outputSchemaIds',
  'telemetryEventIds',
  'sourceSafety',
  'reviewBoundary',
  'roots',
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
      'Usage: node scripts/check-v38-gate6-read-need-comprehension-inference-hardening.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V38 Gate 6 ReadNeedComprehensionSynthesis inference hardening artifacts, tests, docs, and workflow wiring.',
      'Use --skip-package-tests only in lightweight workflow posture jobs that do not install pnpm dependencies.',
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
      branch === 'version/v38' || /^v38\/gate-(?:[6-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 6+ work must occur on version/v38 or v38/gate-6..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.bitcode/v38-inference-surface-inventory.json',
    '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
    '.bitcode/v38-prompt-benchmark-report.json',
    '.bitcode/v38-disclosure-boundary-report.json',
    'packages/specifying/src/canonical/read-need-comprehension-inference-hardening.js',
    'packages/specifying/test/v38-read-need-comprehension-inference-hardening.test.js',
    'scripts/generate-v38-read-need-comprehension-inference-hardening.mjs',
    'scripts/check-v38-gate6-read-need-comprehension-inference-hardening.mjs',
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/bounded-structured-inference.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/read-need.test.ts',
    'apps/uapi/app/api/read-review/route.ts',
    'apps/uapi/app/terminal/TerminalDepositReadWorkbench.tsx',
    'BITCODE_SPEC_V38.md',
    'BITCODE_SPEC_V38_DELTA.md',
    'BITCODE_SPEC_V38_NOTES.md',
    'BITCODE_SPEC_V38_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 6 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v38-read-need-comprehension-inference-hardening.mjs', '--check']);
    } catch (error) {
      failures.push(`V38 ReadNeedComprehensionSynthesis artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'packages/specifying/test/v38-read-need-comprehension-inference-hardening.test.js',
      ]);
    } catch (error) {
      failures.push(`V38 ReadNeedComprehensionSynthesis protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/asset-packs-pipelines-domain',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/__tests__/read-need.test.ts',
        'src/__tests__/reading-pipeline-contract.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`ReadNeedComprehensionSynthesis package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V38 Gate 6 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-read-need-comprehension-inference-hardening', 'Gate 6 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.readNeedComprehensionInferenceHardening.v1', 'Gate 6 schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'Gate 6 artifact must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'Gate 6 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-read-need-comprehension-inference-hardening-metadata',
      'Gate 6 artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredPhaseIds, REQUIRED_PHASE_IDS), 'Gate 6 artifact must cover all ReadNeedComprehensionSynthesis phases.');
    assertCheck(failures, includesAll(artifact.requiredReceiptFields, REQUIRED_RECEIPT_FIELDS), 'Gate 6 artifact must cover all receipt fields.');
    assertCheck(failures, artifact.coverage.phaseCount === 4, 'Gate 6 phase count must be 4.');
    assertCheck(failures, artifact.coverage.ptrrAgentCount === 4, 'Gate 6 PTRR agent count must be 4.');
    assertCheck(failures, artifact.coverage.ptrrStepCount === 16, 'Gate 6 PTRR step count must be 16.');
    assertCheck(failures, artifact.coverage.failsafeSequenceCount === 48, 'Gate 6 Failsafe sequence count must be 48.');
    assertCheck(failures, artifact.coverage.thricifiedGenerationCount === 48, 'Gate 6 ThricifiedGeneration count must be 48.');
    assertCheck(failures, artifact.coverage.providerCallSlotCount === 144, 'Gate 6 provider-call slot count must be 144.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Gate 6 artifact must have no failed predicates.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 6 artifact must be metadata-only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Protected source must not be visible.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Raw provider response must not be visible.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Unpaid AssetPack source must not be visible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Credentials must not be serialized.');
    assertCheck(failures, artifact.coverage.acceptedNeedRequiredForFindingFits === true, 'Finding Fits must require accepted Need.');
    assertCheck(failures, artifact.coverage.resynthesisWithFeedbackCovered === true, 'Resynthesis with feedback must be covered.');
    assertCheck(failures, artifact.coverage.routeUsesInferenceSynthesis === true, 'Read-review route must use inference synthesis.');
    assertCheck(failures, artifact.coverage.terminalSupportsResynthesis === true, 'Terminal must support resynthesis feedback.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 6 artifact must not point at _legacy roots.');
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
  const index = read(root, 'packages/specifying/src/index.js');
  const typeDefs = read(root, 'packages/specifying/src/index.d.ts');

  assertCheck(failures, spec.includes('V38ReadNeedComprehensionInferenceHardening'), 'V38 spec must name the Gate 6 hardening report.');
  assertCheck(failures, delta.includes('Gate 6: ReadNeedComprehensionSynthesis Inference Hardening'), 'V38 delta must include Gate 6.');
  assertCheck(failures, notes.includes('V38ReadNeedComprehensionInferenceHardening'), 'V38 notes must name the Gate 6 report.');
  assertCheck(failures, parity.includes('| ReadNeedComprehensionSynthesis inference hardening | Gate 6 |') && parity.includes('| closed |'), 'V38 parity must close the Gate 6 row.');
  assertCheck(failures, roadmap.includes('V38 Gate 6 closure anchor'), 'Roadmap must include the Gate 6 closure anchor.');
  assertCheck(failures, readme.includes('check:v38-gate6'), 'README must document the Gate 6 check.');
  assertCheck(failures, protocolReadme.includes('v38-read-need-comprehension-inference-hardening'), 'Protocol README must document the Gate 6 artifact.');
  assertCheck(failures, packageJson.includes('check:v38-gate6') && packageJson.includes('generate:v38-read-need-comprehension-inference-hardening'), 'package.json must expose Gate 6 scripts.');
  assertCheck(failures, gateWorkflow.includes('check:v38-gate6') && gateWorkflow.includes('v38-read-need-comprehension-inference-hardening.test.js'), 'Gate workflow must run Gate 6 checks/tests.');
  assertCheck(failures, canonWorkflow.includes('check:v38-gate6'), 'Canon workflow must run Gate 6 check.');
  assertCheck(failures, index.includes('buildV38ReadNeedComprehensionInferenceHardening'), 'Protocol JS index must export Gate 6 builder.');
  assertCheck(failures, typeDefs.includes('buildV38ReadNeedComprehensionInferenceHardening'), 'Protocol type index must export Gate 6 builder.');

  if (failures.length) {
    process.stderr.write('V38 Gate 6 ReadNeedComprehensionSynthesis inference hardening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V38 Gate 6 ReadNeedComprehensionSynthesis inference hardening ok phases=4 ptrrSteps=16 failsafes=48 thricified=48\n');
}

main();
