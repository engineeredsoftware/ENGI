#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
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
    repoRoot,
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
      'Usage: node scripts/check-v29-gate4-reading-pipeline-observability.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 4 Reading pipeline observability closure.',
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
    pointer === 'V28',
    `BITCODE_SPEC.txt must remain V28 during V29 Gate 4 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-4-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 Gate 4 work must occur on version/v29 or v29/gate-4-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V29.md',
    'BITCODE_SPEC_V29_DELTA.md',
    'BITCODE_SPEC_V29_NOTES.md',
    'BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'packages/pipelines/asset-pack/src/reading-pipeline-contract.ts',
    'packages/pipelines/asset-pack/src/reading-pipeline-observability.ts',
    'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-observability.test.ts',
    'packages/pipeline-hosts/src/asset-pack-harness.ts',
    'packages/pipeline-hosts/src/__tests__/asset-pack-harness.test.ts',
    'uapi/app/terminal/terminal-pipeline-harness-client.ts',
    'uapi/components/bitcode/execution/BitcodeExecutionStreamPanel.tsx',
    'uapi/components/bitcode/execution/pipeline-execution-log-header.tsx',
    'uapi/components/bitcode/execution/pipeline-execution-log.tsx',
    'uapi/tests/terminalPipelineHarnessClient.test.ts',
    'uapi/tests/pipelineExecutionLogHeader.test.tsx',
    'uapi/app/terminal/README.md',
    'uapi/components/bitcode/execution/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 4 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V29.md');
  const delta = read(root, 'BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const observability = read(root, 'packages/pipelines/asset-pack/src/reading-pipeline-observability.ts');
  const observabilityTest = read(root, 'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-observability.test.ts');
  const harness = read(root, 'packages/pipeline-hosts/src/asset-pack-harness.ts');
  const harnessTest = read(root, 'packages/pipeline-hosts/src/__tests__/asset-pack-harness.test.ts');
  const terminalClient = read(root, 'uapi/app/terminal/terminal-pipeline-harness-client.ts');
  const header = read(root, 'uapi/components/bitcode/execution/pipeline-execution-log-header.tsx');
  const log = read(root, 'uapi/components/bitcode/execution/pipeline-execution-log.tsx');
  const terminalTest = read(root, 'uapi/tests/terminalPipelineHarnessClient.test.ts');
  const headerTest = read(root, 'uapi/tests/pipelineExecutionLogHeader.test.tsx');
  const terminalReadme = read(root, 'uapi/app/terminal/README.md');
  const executionReadme = read(root, 'uapi/components/bitcode/execution/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  assertCheck(failures, spec.includes('V29 Reading pipeline observability canon'), 'V29 SPEC must define Reading pipeline observability canon.');
  assertCheck(failures, delta.includes('ReadingPipelineTelemetryProjection'), 'V29 DELTA must name Gate 4 telemetry projection acceptance.');
  assertCheck(failures, notes.includes('Gate 4 working notes'), 'V29 NOTES must carry Gate 4 working notes.');
  assertCheck(failures, parity.includes('## Gate 4 Parity'), 'V29 PARITY must include Gate 4 parity.');
  assertCheck(failures, parity.includes('Gate 4 completion condition'), 'V29 PARITY must include Gate 4 completion condition.');

  for (const symbol of [
    'READING_PIPELINE_TELEMETRY_LEVELS',
    'buildReadingPipelineObservabilityInventory',
    'resolveReadingPipelineTelemetryProjection',
    'summarizeReadingPipelineObservabilityCoverage',
    'ReadingPipelineTelemetryProjection',
    'thricifiedGenerationId',
    'promptTemplateId',
    'outputSchema',
    'raw-output',
    'parsed-output',
  ]) {
    assertCheck(failures, observability.includes(symbol), `Reading observability primitive is missing ${symbol}.`);
  }

  assertCheck(
    failures,
    observabilityTest.includes('thricifiedGenerationPrompts: 432') &&
      observabilityTest.includes('ReadFitsFindingSynthesis.tool.vector-depository-search') &&
      observabilityTest.includes('missingRequiredLevels') &&
      observabilityTest.includes('parsedOutputTelemetryReady'),
    'Reading observability tests must cover inventory, tools, coverage, and parsed-output readiness.',
  );

  assertCheck(
    failures,
    harness.includes('readingPipelineTelemetry') &&
      harness.includes('readingPipelineObservabilityInventory') &&
      harness.includes('readingPipelineObservabilityCoverage') &&
      harness.includes('resolveReadingPipelineTelemetryProjection') &&
      harness.includes('summarizeReadingPipelineObservabilityCoverage'),
    'Sandbox harness must stamp stream events with Reading observability projection and export coverage.',
  );
  assertCheck(
    failures,
    harnessTest.includes('readingPipelineTelemetry') &&
      harnessTest.includes('ptrrStepId') &&
      harnessTest.includes('thricifiedGenerationId') &&
      harnessTest.includes('readingPipelineObservabilityCoverage'),
    'Pipeline-host tests must assert Gate 4 harness telemetry fields.',
  );

  assertCheck(
    failures,
    terminalClient.includes('readingPipelineTelemetry') &&
      terminalClient.includes('ptrrStepId') &&
      terminalClient.includes('thricifiedGenerationId') &&
      terminalClient.includes('promptTemplateId') &&
      terminalClient.includes('outputSchema') &&
      terminalClient.includes('inferenceAudit'),
    'Terminal harness client must adapt Reading telemetry projection into execution stream state.',
  );
  assertCheck(
    failures,
    header.includes('pipeline?: string') &&
      header.includes('ptrrStepId?: string') &&
      header.includes('outputSchema?: string') &&
      header.includes('headerMetadataRows'),
    'Execution log header must render contract-aware Reading telemetry identifiers.',
  );
  assertCheck(
    failures,
    log.includes('pipeline?: string') &&
      log.includes('phaseId?: string') &&
      log.includes('ptrrStepId?: string') &&
      log.includes('promptTemplateId?: string') &&
      log.includes('outputSchema?: string'),
    'Execution log rows must preserve contract-aware Reading telemetry identifiers.',
  );
  assertCheck(
    failures,
    terminalTest.includes('ReadFitsFindingSynthesis.implementation.asset-pack.try') &&
      terminalTest.includes('ThricifiedGeneration') &&
      terminalTest.includes('schema AssetPackSynthesisOutput') &&
      headerTest.includes('ReadFitsFindingSynthesis.discovery') &&
      headerTest.includes('DepositoryFitsResult'),
    'UAPI tests must cover Terminal summary and header rendering for Reading telemetry.',
  );
  assertCheck(
    failures,
    terminalReadme.includes('live Reading harness stream') &&
      executionReadme.includes('Reading Pipeline Streams'),
    'Terminal and shared execution docs must describe Reading pipeline streams.',
  );
  assertCheck(
    failures,
    packageJson.includes('"check:v29-gate4"') &&
      gateWorkflow.includes('check-v29-gate4-reading-pipeline-observability.mjs') &&
      gateWorkflow.includes('reading-pipeline-observability.test.ts'),
    'Package scripts and gate-quality workflow must invoke Gate 4 checker and focused tests.',
  );

  if (failures.length) {
    process.stderr.write('V29 Gate 4 check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V29 Gate 4 Reading pipeline observability check passed.\n');
}

main();
