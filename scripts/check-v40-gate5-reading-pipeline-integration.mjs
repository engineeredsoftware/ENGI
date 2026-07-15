#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v40-reading-pipeline-integration-coverage.json';

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

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipIntegrationTests: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-integration-tests') args.skipIntegrationTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v40-gate5-reading-pipeline-integration.mjs [--skip-branch-check] [--skip-integration-tests] [--repo-root <path>]',
      '',
      'Checks V40 Gate 5 Reading pipeline integration coverage artifact freshness, source-safe metadata, docs, workflows, and real Reading pipeline tests.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function runIntegrationSmoke(root, failures) {
  const commands = [
    ['pnpm', ['--filter', '@bitcode/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v40-reading-pipeline-integration-coverage.test.js']],
    ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--runTestsByPath',
      'src/__tests__/reading-pipeline-integration-coverage.test.ts',
      'src/__tests__/reading-pipeline-contract.test.ts',
      'src/__tests__/reading-pipeline-observability.test.ts',
      'src/__tests__/read-need.test.ts',
      'src/__tests__/read-fits-finding-runtime.test.ts',
      'src/__tests__/depository-search.test.ts',
      'src/__tests__/asset-pack-preview-boundary.test.ts',
      'src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
      '--runInBand',
      '--forceExit',
    ]],
    ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'exec', 'jest', '--config', 'jest.config.cjs', '--runTestsByPath',
      'src/__tests__/asset-pack-host-plan.test.ts',
      'src/__tests__/distributed-execution-runtime-receipt.test.ts',
      '--runInBand',
      '--forceExit',
    ]],
    ['pnpm', ['--filter', '@bitcode/pipelines-generics', 'test']],
    ['pnpm', ['--filter', '@bitcode/agent-generics', 'test']],
    ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/terminalPipelineHarnessClient.test.ts', 'tests/readingOperationalTelemetryPipelineLog.test.tsx', 'tests/pipelineExecutionLogHeader.test.tsx', '--runInBand']],
  ];

  for (const [command, args] of commands) {
    try {
      run(root, command, args);
    } catch (error) {
      failures.push(`Reading pipeline integration smoke failed for ${command} ${args.join(' ')}: ${error.stderr || error.message}`);
      return;
    }
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
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V39', `BITCODE_SPEC.txt must remain V39 during V40 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v40' || /^v40\/gate-(?:5|[6-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V40 Gate 5+ work must occur on version/v40 or v40/gate-5..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/v40-reading-pipeline-integration-coverage.js',
    'packages/specifying/test/v40-reading-pipeline-integration-coverage.test.js',
    'scripts/generate-v40-reading-pipeline-integration-coverage.mjs',
    'scripts/check-v40-gate5-reading-pipeline-integration.mjs',
    'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-integration-coverage.test.ts',
    'BITCODE_SPEC_V40.md',
    'BITCODE_SPEC_V40_DELTA.md',
    'BITCODE_SPEC_V40_NOTES.md',
    'BITCODE_SPEC_V40_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V40 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v40-reading-pipeline-integration-coverage.mjs', '--check']);
    } catch (error) {
      failures.push(`V40 Reading pipeline integration artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'packages/specifying/test/v40-reading-pipeline-integration-coverage.test.js',
      ]);
    } catch (error) {
      failures.push(`V40 Reading pipeline integration protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipIntegrationTests) {
    runIntegrationSmoke(root, failures);
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V40 Gate 5 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v40-reading-pipeline-integration-coverage', 'Gate 5 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v40.readingPipelineIntegrationCoverage.v1', 'Gate 5 schemaId must match.');
    assertCheck(failures, artifact.version === 'V40' && artifact.currentTarget === 'V39', 'Gate 5 artifact must bind V40 over active V39.');
    assertCheck(failures, artifact.passed === true, 'Gate 5 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-reading-pipeline-integration-coverage-metadata',
      'Gate 5 artifact must declare source-safe Reading pipeline integration metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 9, 'Gate 5 must cover nine Reading pipeline integration rows.');
    assertCheck(failures, artifact.coverage.coveredRowCount === 9, 'Gate 5 Reading pipeline integration rows must all be covered.');
    assertCheck(failures, artifact.coverage.missingRowCount === 0, 'Gate 5 must not leave missing Reading pipeline integration rows.');
    assertCheck(failures, artifact.coverage.blockedRowCount === 0, 'Gate 5 must not leave blocked Reading pipeline integration rows.');
    assertCheck(failures, artifact.coverage.exemptRowCount === 0, 'Gate 5 must not rely on Reading pipeline integration exemptions.');
    assertCheck(failures, artifact.coverage.expectedTotals.pipelineCount === 2, 'Gate 5 must bind two Reading pipelines.');
    assertCheck(failures, artifact.coverage.expectedTotals.phaseCount === 11, 'Gate 5 must bind eleven Reading pipeline phases.');
    assertCheck(failures, artifact.coverage.expectedTotals.ptrrAgentCount === 12, 'Gate 5 must bind twelve PTRR agents.');
    assertCheck(failures, artifact.coverage.expectedTotals.ptrrStepCount === 48, 'Gate 5 must bind forty-eight PTRR steps.');
    assertCheck(failures, artifact.coverage.expectedTotals.thricifiedGenerationCount === 144, 'Gate 5 must bind one hundred forty-four ThricifiedGeneration records.');
    assertCheck(failures, artifact.coverage.allCriticalSurfacesClosed === true, 'Gate 5 must close all critical Reading pipeline integration surfaces.');
    for (const field of [
      'readNeedComprehensionIntegrationClosed',
      'readFitsFindingIntegrationClosed',
      'depositorySearchCoverageClosed',
      'ptrrAgentIntegrationClosed',
      'previewSettlementDeliveryClosed',
      'observabilityReadbackCoverageClosed',
      'terminalHarnessCoverageClosed',
      'primitiveHostIntegrationClosed',
      'localStagingRehearsalLinked',
    ]) {
      assertCheck(failures, artifact.coverage[field] === true, `Gate 5 must set ${field}.`);
    }
    assertCheck(failures, artifact.coverage.promptContentRewriteDeferredToV41 === true, 'Gate 5 must defer prompt rewriting to V41.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 5 artifact must stay source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 5 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 5 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetRequired === false, 'Gate 5 must not require value-bearing mainnet.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 5 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V40.md');
  const delta = read(root, 'BITCODE_SPEC_V40_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V40_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V40 Gate 5 Reading Pipeline Integration Coverage'), 'V40 spec must document Gate 5 Reading pipeline integration coverage.');
  assertCheck(failures, delta.includes('Gate 5 closes with package-backed `V40ReadingPipelineIntegrationCoverage`'), 'V40 delta must document Gate 5 closure.');
  assertCheck(failures, notes.includes('Gate 5 implementation notes'), 'V40 notes must document Gate 5 implementation notes.');
  assertCheck(failures, parity.includes('v40-reading-pipeline-integration-coverage'), 'V40 parity must document Gate 5 artifact.');
  assertCheck(failures, roadmap.includes('V40 Gate 5 closure anchor'), 'Roadmap must include V40 Gate 5 closure anchor.');

  if (failures.length > 0) {
    process.stderr.write(`V40 Gate 5 Reading pipeline integration check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V40 Gate 5 Reading pipeline integration ok artifact=${artifact.artifactRoot}\n`);
}

main();
