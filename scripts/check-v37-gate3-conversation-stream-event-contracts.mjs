#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v37-conversation-stream-event-contract.json';

const REQUIRED_EVENT_KIND_IDS = [
  'model_delta',
  'tool_call',
  'retrieval_summary',
  'proof_root',
  'retry_state',
  'completion_decision',
  'error_row',
];

const REQUIRED_TELEMETRY_FIELD_IDS = [
  'event_id',
  'run_id',
  'conversation_id',
  'sequence',
  'timestamp',
  'collapsed_status',
  'expanded_metadata',
  'proof_roots',
  'redaction_posture',
  'prompt_disclosure_posture',
  'result_disclosure_posture',
  'fail_closed_states',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  Buffer.from('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5', 'base64url').toString('utf8'),
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

function shouldRunUapiTests() {
  return process.env.BITCODE_RUN_UAPI_ROUTE_TESTS === '1';
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
      'Usage: node scripts/check-v37-gate3-conversation-stream-event-contracts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 3 ConversationStreamEvent package source, generated artifact, route adapters, UI tests, telemetry posture, docs, and workflow wiring.',
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
    pointer === 'V36',
    `BITCODE_SPEC.txt must remain V36 during V37 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v37' || /^v37\/gate-(?:[3-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 Gate 3+ work must occur on version/v37 or v37/gate-3..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/protocol/src/canonical/conversation-stream-event-contract.js',
    'packages/protocol/src/index.js',
    'packages/protocol/src/index.d.ts',
    'packages/protocol/test/conversation-stream-event-contract.test.js',
    'packages/api/src/conversations/stream-events.ts',
    'packages/api/src/conversations/__tests__/stream-events.test.ts',
    'packages/api/src/routes/conversations.ts',
    'scripts/generate-v37-conversation-stream-event-contract.mjs',
    'scripts/check-v37-gate3-conversation-stream-event-contracts.mjs',
    'uapi/app/api/conversations/_shared.ts',
    'uapi/hooks/useConversationStream.ts',
    'uapi/app/conversations/components/hooks/usePipelineState.ts',
    'uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
    'uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
    'uapi/tests/api/conversationStreamEventContract.test.ts',
    'uapi/tests/conversationStreamPipelineLog.test.tsx',
    'uapi/tests/pipelineExecutionLogHeader.test.tsx',
    'uapi/jest.config.cjs',
    'BITCODE_SPEC_V37.md',
    'BITCODE_SPEC_V37_DELTA.md',
    'BITCODE_SPEC_V37_NOTES.md',
    'BITCODE_SPEC_V37_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/protocol/README.md',
    'uapi/app/conversations/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V37 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v37-conversation-stream-event-contract.mjs', '--check']);
    } catch (error) {
      failures.push(`V37 Conversation stream event artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/protocol/test/conversation-stream-event-contract.test.js']);
    } catch (error) {
      failures.push(`V37 Conversation stream event package test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && shouldRunUapiTests()) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/api',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/conversations/__tests__/stream-events.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
      run(root, 'pnpm', [
        '--dir',
        'uapi',
        'exec',
        'jest',
        'tests/api/conversationStreamEventContract.test.ts',
        'tests/conversationStreamPipelineLog.test.tsx',
        'tests/pipelineExecutionLogHeader.test.tsx',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V37 Conversation stream event route/UI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `Conversation stream event contract must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v37-conversation-stream-event-contract', 'Conversation stream event artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v37.conversationStreamEventContract.v1', 'Conversation stream event schemaId must match.');
    assertCheck(failures, artifact.version === 'V37' && artifact.currentTarget === 'V36', 'Conversation stream event contract must bind V37 over active V36.');
    assertCheck(failures, artifact.passed === true, 'Conversation stream event contract artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-stream-event-metadata',
      'Conversation stream event contract must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredEventKindIds, REQUIRED_EVENT_KIND_IDS), 'ConversationStreamEvent must enumerate every event kind.');
    assertCheck(
      failures,
      includesAll(artifact.requiredTelemetryFieldIds, REQUIRED_TELEMETRY_FIELD_IDS),
      'ConversationStreamEvent must enumerate every telemetry field.',
    );
    assertCheck(failures, artifact.coverage.eventKindCount === REQUIRED_EVENT_KIND_IDS.length, 'Conversation stream event contract must prove seven event rows.');
    assertCheck(failures, artifact.coverage.modelDeltaCovered === true, 'Conversation stream events must cover model deltas.');
    assertCheck(failures, artifact.coverage.toolCallCovered === true, 'Conversation stream events must cover tool calls.');
    assertCheck(failures, artifact.coverage.retrievalSummaryCovered === true, 'Conversation stream events must cover retrieval summaries.');
    assertCheck(failures, artifact.coverage.proofRootCovered === true, 'Conversation stream events must cover proof roots.');
    assertCheck(failures, artifact.coverage.retryStateCovered === true, 'Conversation stream events must cover retry states.');
    assertCheck(failures, artifact.coverage.completionDecisionCovered === true, 'Conversation stream events must cover completion decisions.');
    assertCheck(failures, artifact.coverage.errorRowCovered === true, 'Conversation stream events must cover error rows.');
    assertCheck(failures, artifact.coverage.collapsedReadableStatusCovered === true, 'Conversation stream events must cover collapsed readable status.');
    assertCheck(failures, artifact.coverage.expandedMetadataCovered === true, 'Conversation stream events must cover expanded metadata.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Conversation stream events must cover proof roots.');
    assertCheck(failures, artifact.coverage.redactionPostureCovered === true, 'Conversation stream events must cover redaction posture.');
    assertCheck(failures, artifact.coverage.promptDisclosureCovered === true, 'Conversation stream events must cover prompt disclosure posture.');
    assertCheck(failures, artifact.coverage.resultDisclosureCovered === true, 'Conversation stream events must cover result disclosure posture.');
    assertCheck(failures, artifact.coverage.failClosedStatesCovered === true, 'Conversation stream events must cover fail-closed states.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Conversation stream events must not expose protected source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Conversation stream events must not serialize credentials.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Conversation stream events must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^conversation-stream-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Conversation stream event rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => /^conversation-stream-detail:[a-f0-9]{24}$/u.test(row.detailRoot)),
      'Conversation stream event rows must have deterministic detail roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.present === true),
      'Conversation stream event source evidence roots must all exist.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V37.md');
  const delta = read(root, 'BITCODE_SPEC_V37_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V37_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V37_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const rootReadme = read(root, 'README.md');
  const protocolReadme = read(root, 'packages/protocol/README.md');
  const conversationsReadme = read(root, 'uapi/app/conversations/README.md');
  const packageJson = read(root, 'package.json');
  const uapiJestConfig = read(root, 'uapi/jest.config.cjs');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const streamEvents = read(root, 'packages/api/src/conversations/stream-events.ts');
  const streamHook = read(root, 'uapi/hooks/useConversationStream.ts');
  const pipelineState = read(root, 'uapi/app/conversations/components/hooks/usePipelineState.ts');
  const logHeader = read(root, 'uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx');

  for (const phrase of [
    'ConversationStreamEvent',
    'model deltas',
    'tool calls',
    'retrieval summaries',
    'proof roots',
    'retry states',
    'completion decisions',
    'error rows',
    '.bitcode/v37-conversation-stream-event-contract.json',
    'source-safe-conversation-stream-event-metadata',
    'check:v37-gate3',
  ]) {
    assertCheck(failures, spec.includes(phrase), `V37 SPEC must name ${phrase}.`);
    assertCheck(failures, delta.includes(phrase), `V37 DELTA must name ${phrase}.`);
    assertCheck(failures, parity.includes(phrase), `V37 PARITY must name ${phrase}.`);
  }

  assertCheck(failures, notes.includes('Gate 3: Conversation Stream UI And Event Contracts'), 'V37 NOTES must retain Gate 3 title.');
  assertCheck(failures, roadmap.includes('V37 Gate 3 closure anchor'), 'Roadmap must include V37 Gate 3 closure anchor.');
  assertCheck(failures, rootReadme.includes('V37 Gate 3'), 'README must mention V37 Gate 3.');
  assertCheck(failures, protocolReadme.includes('ConversationStreamEvent'), 'Protocol README must mention ConversationStreamEvent.');
  assertCheck(failures, conversationsReadme.includes('ConversationStreamEvent'), 'Conversations README must mention ConversationStreamEvent.');
  assertCheck(failures, packageJson.includes('"generate:v37-conversation-stream-event-contract"'), 'package.json must expose generate:v37-conversation-stream-event-contract.');
  assertCheck(failures, packageJson.includes('"check:v37-conversation-stream-event-contract"'), 'package.json must expose check:v37-conversation-stream-event-contract.');
  assertCheck(failures, packageJson.includes('"check:v37-gate3"'), 'package.json must expose check:v37-gate3.');
  assertCheck(failures, uapiJestConfig.includes('conversationStreamPipelineLog.test.tsx'), 'UAPI Jest config must run the conversation stream pipeline log test.');
  assertCheck(failures, gateWorkflow.includes('check-v37-gate3-conversation-stream-event-contracts.mjs'), 'Gate workflow must run V37 Gate 3 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v37-gate3-conversation-stream-event-contracts.mjs'), 'Canon workflow must run V37 Gate 3 checker.');
  assertCheck(failures, streamEvents.includes('buildConversationStreamEvent'), 'Stream event helper must build ConversationStreamEvent rows.');
  assertCheck(failures, streamEvents.includes('buildConversationPipelineLogEvent'), 'Stream event helper must adapt events to pipeline log rows.');
  assertCheck(failures, streamHook.includes('conversationStreamEvent'), 'Conversation stream hook must consume ConversationStreamEvent metadata.');
  assertCheck(failures, pipelineState.includes('runLogDetails'), 'Conversation pipeline state must preserve expanded stream metadata.');
  assertCheck(failures, logHeader.includes('promptDisclosurePosture'), 'Execution log header must show prompt disclosure posture.');
  assertCheck(failures, logHeader.includes('resultDisclosurePosture'), 'Execution log header must show result disclosure posture.');

  const routeScan = execFileSync('find', ['uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V37 Gate 3 ConversationStreamEvent contract check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V37 Gate 3 ConversationStreamEvent contracts ok rows=${artifact.rows.length} root=${artifact.artifactRoot}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
