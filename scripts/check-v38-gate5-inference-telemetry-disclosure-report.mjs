#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v38-disclosure-boundary-report.json';

const REQUIRED_ROW_IDS = [
  'telemetry:pipeline-phase-lifecycle',
  'telemetry:ptrr-agent-step-lifecycle',
  'telemetry:failsafe-sequence-lifecycle',
  'telemetry:thricified-generation-lifecycle',
  'telemetry:tool-execution-lifecycle',
  'telemetry:prompt-template-interpolation',
  'telemetry:raw-response-parsed-output-schema',
  'telemetry:stream-ui-storage-projection',
];

const REQUIRED_TELEMETRY_LEVEL_IDS = [
  'pipeline_phase',
  'agent',
  'ptrr_step',
  'failsafe',
  'thricified_generation',
  'tool',
  'prompt_template',
  'interpolated_prompt',
  'raw_response',
  'parsed_output',
  'schema_verdict',
  'retry',
  'repair',
];

const REQUIRED_DISCLOSURE_TIER_IDS = [
  'public_status_source_safe',
  'execution_identity_source_safe',
  'prompt_template_identity_source_safe',
  'prompt_template_metadata_source_safe',
  'interpolated_prompt_private_or_redacted_shape',
  'raw_provider_response_private',
  'raw_response_root_source_safe',
  'parsed_typed_output_shape_source_safe',
  'schema_verdict_source_safe',
  'tool_input_output_shape_source_safe',
  'proof_root_source_safe',
  'operator_debug_private',
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
      'Usage: node scripts/check-v38-gate5-inference-telemetry-disclosure-report.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V38 Gate 5 source-safe inference telemetry and disclosure-tier report artifacts, tests, docs, and workflow wiring.',
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
      branch === 'version/v38' || /^v38\/gate-(?:[5-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 5+ work must occur on version/v38 or v38/gate-5..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.bitcode/v38-inference-surface-inventory.json',
    '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
    '.bitcode/v38-prompt-benchmark-report.json',
    '.bitcode/v35-telemetry-taxonomy-catalog.json',
    '.bitcode/v37-conversation-stream-event-contract.json',
    'packages/specifying/src/canonical/inference-telemetry-disclosure-report.js',
    'packages/specifying/src/canonical/inference-surface-inventory.js',
    'packages/specifying/src/canonical/ptrr-failsafe-thricified-stack.js',
    'packages/specifying/src/canonical/prompt-benchmark-report.js',
    'packages/specifying/src/canonical/telemetry-taxonomy-catalog.js',
    'packages/specifying/src/canonical/conversation-stream-event-contract.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/v38-inference-telemetry-disclosure-report.test.js',
    'scripts/generate-v38-inference-telemetry-disclosure-report.mjs',
    'scripts/check-v38-gate5-inference-telemetry-disclosure-report.mjs',
    'packages/execution-generics/src/storage/ExecutionStreamAdapter.ts',
    'packages/agent-generics/src/diagnostics/instrumentation.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-observability.ts',
    'apps/uapi/app/terminal/terminal-pipeline-host-client.ts',
    'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v38-inference-telemetry-disclosure-report.mjs', '--check']);
    } catch (error) {
      failures.push(`V38 inference telemetry disclosure report artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'packages/specifying/test/v38-inference-telemetry-disclosure-report.test.js',
      ]);
    } catch (error) {
      failures.push(`V38 inference telemetry disclosure protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V38 disclosure artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-inference-telemetry-disclosure-report', 'Telemetry disclosure artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.inferenceTelemetryDisclosureReport.v1', 'Telemetry disclosure schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'Telemetry disclosure report must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'Telemetry disclosure report artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-inference-telemetry-disclosure-metadata',
      'Telemetry disclosure report must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.rows.map((row) => row.rowId), REQUIRED_ROW_IDS), 'Telemetry disclosure rows must cover every required row id.');
    assertCheck(failures, includesAll(artifact.telemetryLevelIds, REQUIRED_TELEMETRY_LEVEL_IDS), 'Telemetry disclosure report must cover every required telemetry level.');
    assertCheck(failures, includesAll(artifact.disclosureTierIds, REQUIRED_DISCLOSURE_TIER_IDS), 'Telemetry disclosure report must cover every required disclosure tier.');
    assertCheck(failures, artifact.coverage.rowCount === 8, 'Telemetry disclosure report must have 8 rows.');
    assertCheck(failures, artifact.coverage.requiredTelemetryLevelCount === REQUIRED_TELEMETRY_LEVEL_IDS.length, 'Telemetry disclosure report must cover all required telemetry levels.');
    assertCheck(failures, artifact.coverage.disclosureTierCount === REQUIRED_DISCLOSURE_TIER_IDS.length, 'Telemetry disclosure report must cover all required disclosure tiers.');
    assertCheck(failures, artifact.coverage.requiredPredicateCount === artifact.coverage.passedPredicateCount, 'Telemetry disclosure predicates must all pass.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Telemetry disclosure report must have no failed predicates.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Telemetry disclosure report must be metadata-only.');
    assertCheck(failures, artifact.coverage.promptPayloadVisible === false, 'Prompt payload must not be visible.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Raw provider response must not be visible.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Protected source must not be visible.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Unpaid AssetPack source must not be visible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Credentials must not be serialized.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Private wallet material must not be visible.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Telemetry disclosure report must not point at _legacy source roots.');
    assertCheck(failures, artifact.coverage.gate2InventoryRoot.startsWith('v38-inference-surface-inventory:'), 'Telemetry disclosure report must bind Gate 2 inventory root.');
    assertCheck(failures, artifact.coverage.gate3StackRoot.startsWith('v38-ptrr-failsafe-thricified-stack:'), 'Telemetry disclosure report must bind Gate 3 stack root.');
    assertCheck(failures, artifact.coverage.gate4PromptBenchmarkRoot.startsWith('v38-prompt-benchmark-report:'), 'Telemetry disclosure report must bind Gate 4 prompt benchmark root.');
    assertCheck(failures, artifact.coverage.v35TelemetryTaxonomyRoot.startsWith('telemetry-taxonomy-catalog:'), 'Telemetry disclosure report must bind V35 telemetry taxonomy root.');
    assertCheck(failures, artifact.coverage.v37ConversationStreamRoot.startsWith('conversation-stream-event-contract:'), 'Telemetry disclosure report must bind V37 stream root.');
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
  const source = read(root, 'packages/specifying/src/canonical/inference-telemetry-disclosure-report.js');
  const index = read(root, 'packages/specifying/src/index.js');
  const typeDefs = read(root, 'packages/specifying/src/index.d.ts');
  const test = read(root, 'packages/specifying/test/v38-inference-telemetry-disclosure-report.test.js');

  for (const doc of [spec, delta, notes, parity, readme, protocolReadme]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V38 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('V38InferenceTelemetryDisclosureReport'), 'V38 docs must name V38InferenceTelemetryDisclosureReport.');
    assertCheck(failures, doc.includes('source-safe-inference-telemetry-disclosure-metadata'), 'V38 docs must name telemetry disclosure source safety verdict.');
    assertCheck(failures, doc.includes('disclosure tier'), 'V38 docs must name disclosure tiers.');
    assertCheck(failures, doc.includes('raw provider response'), 'V38 docs must name raw provider response boundary.');
  }

  assertCheck(failures, parity.includes('| Inference telemetry and disclosure tiers | Gate 5 |') && parity.includes('| closed |'), 'V38 parity must close the Gate 5 matrix row.');
  assertCheck(failures, parity.includes('## Gate 5 Parity') && parity.includes('closed'), 'V38 parity must include closed Gate 5 parity.');
  assertCheck(
    failures,
    /Current working gate: V38 Gate (?:6|7|8|9|10|11)\b/u.test(roadmap),
    'Roadmap must advance past V38 Gate 5 after this gate closes.',
  );
  assertCheck(failures, roadmap.includes('V38 Gate 5 closure anchor'), 'Roadmap must include a V38 Gate 5 closure anchor.');
  assertCheck(failures, packageJson.includes('"generate:v38-inference-telemetry-disclosure-report"'), 'package.json must expose the Gate 5 generator.');
  assertCheck(failures, packageJson.includes('"check:v38-inference-telemetry-disclosure-report"'), 'package.json must expose the Gate 5 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v38-gate5"'), 'package.json must expose check:v38-gate5.');
  assertCheck(failures, gateWorkflow.includes('check-v38-gate5-inference-telemetry-disclosure-report.mjs'), 'Gate workflow must run the V38 Gate 5 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v38-gate5-inference-telemetry-disclosure-report.mjs'), 'Canon workflow must run the V38 Gate 5 checker.');
  assertCheck(failures, gateWorkflow.includes('v38-inference-telemetry-disclosure-report.test.js'), 'Gate workflow must run the V38 Gate 5 protocol test.');

  for (const phrase of [
    'buildV38InferenceTelemetryDisclosureReport',
    'V38_INFERENCE_TELEMETRY_DISCLOSURE_ROWS',
    'rawProviderResponseVisible',
    'promptPayloadVisible',
    'parsed_typed_output_shape_source_safe',
    'stream.v35-and-v37-catalogs-bound',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 5 source must include ${phrase}.`);
  }

  for (const phrase of ['buildV38InferenceTelemetryDisclosureReport', 'disclosureTierCount', 'rawProviderResponseVisible']) {
    assertCheck(failures, test.includes(phrase), `Gate 5 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildV38InferenceTelemetryDisclosureReport'), 'Protocol index must export buildV38InferenceTelemetryDisclosureReport.');
  assertCheck(failures, typeDefs.includes('buildV38InferenceTelemetryDisclosureReport'), 'Protocol type declarations must export buildV38InferenceTelemetryDisclosureReport.');

  if (failures.length > 0) {
    process.stderr.write('V38 Gate 5 inference telemetry and disclosure-tier check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V38 Gate 5 inference telemetry and disclosure tiers ok rows=8 source-safe=true\n');
}

main();
