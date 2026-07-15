#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v39/operational-telemetry-repair-readback.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'Oi', 'JIUzI1Ni'].join(''),
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
    skipBranchCheck: false,
    skipPackageTests: false,
    skipUapiTests: false,
    repoRoot: defaultRepoRoot,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v39-gate8-operational-telemetry-repair-readback.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 8 operational telemetry, repair runbook, operator readback, source-safe stream UI, docs, workflow wiring, and proof artifact.',
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
    pointer === 'V38',
    `BITCODE_SPEC.txt must remain V38 during V39 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v39' || /^v39\/gate-(?:8|9|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 8+ work must occur on version/v39 or v39/gate-8..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/reading-operational-telemetry-repair-readback.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/reading-operational-telemetry-repair-readback.test.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/postprocess.ts',
    'packages/asset-packs-pipelines/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/package.json',
    'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
    'apps/uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
    'apps/uapi/tests/readingOperationalTelemetryPipelineLog.test.tsx',
    'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
    'scripts/specifying/src/canonical/v39-operational-telemetry-repair-readback.js',
    'scripts/specifying/test/v39-operational-telemetry-repair-readback.test.js',
    'scripts/generate-v39-operational-telemetry-repair-readback.mjs',
    'scripts/check-v39-gate8-operational-telemetry-repair-readback.mjs',
    '.specifications/BITCODE_SPEC_V39.md',
    '.specifications/BITCODE_SPEC_V39_DELTA.md',
    '.specifications/BITCODE_SPEC_V39_NOTES.md',
    '.specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/asset-packs-pipelines/domain/README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v39-operational-telemetry-repair-readback.mjs', '--check']);
    } catch (error) {
      failures.push(`V39 operational telemetry repair readback artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v39-operational-telemetry-repair-readback.test.js',
      ]);
    } catch (error) {
      failures.push(`V39 operational telemetry repair readback protocol test failed: ${error.stderr || error.message}`);
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
        'src/__tests__/reading-operational-telemetry-repair-readback.test.ts',
        'src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
        'src/__tests__/postprocess.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V39 operational telemetry repair readback package tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipUapiTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/readingOperationalTelemetryPipelineLog.test.tsx',
        'tests/pipelineExecutionLogHeader.test.tsx',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V39 operational telemetry repair readback UI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V39 Gate 8 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-operational-telemetry-repair-readback', 'Gate 8 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.operationalTelemetryRepairReadback.v1', 'Gate 8 schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Gate 8 artifact must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Gate 8 artifact must pass.');
    assertCheck(failures, artifact.coverage.rowCount === 10, 'Gate 8 must cover ten operational telemetry rows.');
    assertCheck(failures, artifact.coverage.runtimeType === 'ReadingOperationalTelemetryRepairReadback', 'Gate 8 must cover ReadingOperationalTelemetryRepairReadback.');
    assertCheck(failures, artifact.coverage.operatorReadbackType === 'ReadingOperationalOperatorReadback', 'Gate 8 must cover operator readback.');
    assertCheck(failures, artifact.coverage.eventKindIds.includes('thricified-generation'), 'Gate 8 must cover ThricifiedGeneration events.');
    assertCheck(failures, artifact.coverage.eventKindIds.includes('tool'), 'Gate 8 must cover tool events.');
    assertCheck(failures, artifact.coverage.eventKindIds.includes('wallet'), 'Gate 8 must cover wallet events.');
    assertCheck(failures, artifact.coverage.eventKindIds.includes('delivery'), 'Gate 8 must cover delivery events.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 8 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourcePayloadSerialized === false, 'Gate 8 artifact must not serialize protected source.');
    assertCheck(failures, artifact.coverage.rawInterpolatedPromptVisible === false, 'Gate 8 artifact must not expose interpolated prompts.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Gate 8 artifact must not expose raw provider responses.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Gate 8 artifact must not expose wallet private material.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 8 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.streamEventKindsCovered === true, 'Gate 8 must cover stream event kinds.');
    assertCheck(failures, artifact.coverage.repairFinalityCovered === true, 'Gate 8 must cover BTC finality repair.');
    assertCheck(failures, artifact.coverage.persistenceCovered === true, 'Gate 8 must cover persistence.');
    assertCheck(failures, artifact.coverage.richLogCovered === true, 'Gate 8 must cover rich log rendering.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 8 predicates must all pass.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V39.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const readme = read(root, 'packages/asset-packs-pipelines/domain/README.md');
  assertCheck(failures, spec.includes('ReadingOperationalTelemetryRepairReadback'), 'V39 spec must name ReadingOperationalTelemetryRepairReadback.');
  assertCheck(failures, spec.includes('v39-operational-telemetry-repair-readback'), 'V39 spec must name the Gate 8 artifact.');
  assertCheck(failures, parity.includes('Gate 8 Parity'), 'V39 parity matrix must include Gate 8 parity.');
  assertCheck(failures, readme.includes('Operational Telemetry Repair Readback'), 'AssetPack README must document Operational Telemetry Repair Readback.');

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 8 operational telemetry repair readback check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 8 operational telemetry repair readback ok artifact=${artifact.artifactRoot}\n`);
}

main();
