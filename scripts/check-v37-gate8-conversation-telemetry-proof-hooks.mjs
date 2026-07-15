#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v37-conversation-telemetry-proof-hooks.json';

const REQUIRED_EVENT_FAMILIES = [
  'session',
  'message',
  'stream',
  'tool',
  'source_selector',
  'terminal_handoff',
  'retry',
  'error',
  'completion',
];

const REQUIRED_DASHBOARD_PANELS = [
  'conversation.dashboard.session-health',
  'conversation.dashboard.message-storage',
  'conversation.dashboard.stream-quality',
  'conversation.dashboard.tool-policy',
  'conversation.dashboard.source-policy',
  'conversation.dashboard.product-handoff',
  'conversation.dashboard.retry-recovery',
  'conversation.dashboard.error-recovery',
  'conversation.dashboard.completion-quality',
];

const REQUIRED_RUNBOOK_IDS = [
  'runbook.conversation.session-repair',
  'runbook.conversation.message-redaction',
  'runbook.conversation.stream-debug',
  'runbook.conversation.tool-policy-denial',
  'runbook.conversation.source-selector-policy',
  'runbook.conversation.product-handoff-repair',
  'runbook.conversation.retry-loop',
  'runbook.conversation.error-recovery',
  'runbook.conversation.completion-repair',
];

const REQUIRED_FIELD_IDS = [
  'event_id',
  'conversation_id',
  'message_id',
  'run_id',
  'source_selector_id',
  'terminal_transaction_id',
  'actor_id',
  'timestamp',
  'status',
  'event_family',
  'event_kind',
  'correlation_ids',
  'proof_roots',
  'redaction_posture',
  'visibility_tier',
  'dashboard_panel',
  'runbook_id',
  'source_safety_class',
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

function shouldRunPackageManagerTests() {
  return process.env.BITCODE_RUN_PACKAGE_MANAGER_TESTS === '1' || process.env.BITCODE_RUN_UAPI_ROUTE_TESTS === '1';
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
    help: false,
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
      'Usage: node scripts/check-v37-gate8-conversation-telemetry-proof-hooks.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 8 ConversationTelemetryProofHooks package source, generated artifact, API/UI source-safe proof hooks, dashboards/runbooks, docs, workflows, and tests.',
      'Set BITCODE_RUN_PACKAGE_MANAGER_TESTS=1 to execute pnpm-backed API/UI tests from installed package-manager contexts.',
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
    pointer === 'V36',
    `BITCODE_SPEC.txt must remain V36 during V37 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v37' || /^v37\/gate-(?:[8-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 Gate 8+ work must occur on version/v37 or v37/gate-8..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/conversation-telemetry-proof-hooks.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/conversation-telemetry-proof-hooks.test.js',
    'scripts/generate-v37-conversation-telemetry-proof-hooks.mjs',
    'scripts/check-v37-gate8-conversation-telemetry-proof-hooks.mjs',
    'packages/api/src/conversations/telemetry.ts',
    'packages/api/src/conversations/stream-events.ts',
    'packages/api/src/conversations/__tests__/telemetry.test.ts',
    'packages/api/src/conversations/__tests__/stream-events.test.ts',
    'apps/uapi/app/conversations/conversation-telemetry-proof-hooks.ts',
    'apps/uapi/app/conversations/components/ConversationTelemetryProofPanel.tsx',
    'apps/uapi/app/conversations/components/ConversationsOverlay.tsx',
    'apps/uapi/styles/conversations-fullscreen.css',
    'apps/uapi/tests/api/conversationTelemetryProofHooks.test.ts',
    'apps/uapi/tests/conversationTelemetryProofPanel.test.tsx',
    'apps/uapi/tests/conversationStreamPipelineLog.test.tsx',
    'apps/uapi/jest.config.cjs',
    'docs/conversations.md',
    'docs/BITCODE_CONVERSATIONS.md',
    'docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md',
    '.specifications/BITCODE_SPEC_V37.md',
    '.specifications/BITCODE_SPEC_V37_DELTA.md',
    '.specifications/BITCODE_SPEC_V37_NOTES.md',
    '.specifications/BITCODE_SPEC_V37_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'apps/uapi/app/conversations/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V37 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v37-conversation-telemetry-proof-hooks.mjs', '--check']);
    } catch (error) {
      failures.push(`V37 Conversation telemetry proof hooks artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/conversation-telemetry-proof-hooks.test.js']);
    } catch (error) {
      failures.push(`V37 Conversation telemetry proof hooks package test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && shouldRunPackageManagerTests()) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/api',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/conversations/__tests__/telemetry.test.ts',
        'src/conversations/__tests__/stream-events.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V37 Conversation telemetry proof hooks API tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && shouldRunPackageManagerTests()) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        'tests/api/conversationTelemetryProofHooks.test.ts',
        'tests/conversationTelemetryProofPanel.test.tsx',
        'tests/conversationStreamPipelineLog.test.tsx',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V37 Conversation telemetry proof hooks UI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `Conversation telemetry proof hooks must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
    const families = rows.map((row) => row.eventFamily);
    const dashboards = rows.map((row) => row.dashboardPanel);
    const runbooks = rows.map((row) => row.runbookId);

    assertCheck(failures, artifact.artifactId === 'v37-conversation-telemetry-proof-hooks', 'Conversation telemetry proof hooks artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v37.conversationTelemetryProofHooks.v1', 'Conversation telemetry proof hooks schemaId must match.');
    assertCheck(failures, artifact.version === 'V37' && artifact.currentTarget === 'V36', 'Conversation telemetry proof hooks must bind V37 over active V36.');
    assertCheck(failures, artifact.passed === true, 'Conversation telemetry proof hooks artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-telemetry-proof-hooks-metadata',
      'Conversation telemetry proof hooks must be source-safe metadata.',
    );
    assertCheck(failures, rows.length === 9, 'Conversation telemetry proof hooks must cover nine event families.');
    assertCheck(failures, includesAll(families, REQUIRED_EVENT_FAMILIES), 'Conversation telemetry proof hooks must cover every event family.');
    assertCheck(failures, includesAll(dashboards, REQUIRED_DASHBOARD_PANELS), 'Conversation telemetry proof hooks must cover every dashboard panel.');
    assertCheck(failures, includesAll(runbooks, REQUIRED_RUNBOOK_IDS), 'Conversation telemetry proof hooks must cover every runbook.');
    assertCheck(
      failures,
      includesAll(artifact.requiredFieldIds || [], REQUIRED_FIELD_IDS),
      'Conversation telemetry proof hooks required fields must cover all source-safe telemetry fields.',
    );
    assertCheck(
      failures,
      rows.every((row) => Array.isArray(row.proofRootFields) && row.proofRootFields.includes('telemetryRoot')),
      'Every conversation telemetry proof hook row must include telemetryRoot.',
    );
    assertCheck(
      failures,
      artifact.coverage?.credentialsSerialized === false &&
        artifact.coverage?.protectedPromptVisible === false &&
        artifact.coverage?.protectedModelResponseVisible === false &&
        artifact.coverage?.protectedSourceVisible === false &&
        artifact.coverage?.unpaidAssetPackSourceVisible === false &&
        artifact.coverage?.walletPrivateMaterialVisible === false,
      'Conversation telemetry proof hooks must report no protected payload visibility.',
    );
    assertCheck(
      failures,
      rows.every((row) => row.sourceEvidence?.every((entry) => entry.present)),
      'Conversation telemetry proof hooks must have all source evidence roots present.',
    );
  }

  const protocolSource = read(root, 'scripts/specifying/src/canonical/conversation-telemetry-proof-hooks.js');
  assertCheck(failures, protocolSource.includes('CONVERSATION_TELEMETRY_EVENT_FAMILY_IDS'), 'Protocol source must define event family ids.');
  assertCheck(failures, protocolSource.includes('CONVERSATION_TELEMETRY_DASHBOARD_PANEL_IDS'), 'Protocol source must define dashboard panel ids.');
  assertCheck(failures, protocolSource.includes('CONVERSATION_TELEMETRY_RUNBOOK_IDS'), 'Protocol source must define runbook ids.');
  assertCheck(failures, protocolSource.includes('CONVERSATION_TELEMETRY_FORBIDDEN_PAYLOAD_CLASSES'), 'Protocol source must define forbidden payload classes.');

  const apiTelemetry = read(root, 'packages/api/src/conversations/telemetry.ts');
  assertCheck(failures, apiTelemetry.includes('buildConversationTelemetryProofHook'), 'API must expose buildConversationTelemetryProofHook.');
  assertCheck(failures, apiTelemetry.includes('assertConversationTelemetryProofHookSourceSafe'), 'API must expose source-safety assertion.');
  assertCheck(
    failures,
    apiTelemetry.includes('v37-conversation-telemetry-proof-hooks.json'),
    'API telemetry must bind the package-owned generated proof hook artifact.',
  );
  assertCheck(failures, !apiTelemetry.includes('process.env'), 'API telemetry helper must not read credentials or env values.');

  const streamEvents = read(root, 'packages/api/src/conversations/stream-events.ts');
  assertCheck(failures, streamEvents.includes('telemetryProofHook'), 'Conversation stream events must attach telemetry proof hooks.');
  assertCheck(failures, streamEvents.includes('dashboardPanel'), 'Conversation stream log metadata must expose dashboard panel ids.');
  assertCheck(failures, streamEvents.includes('runbookId'), 'Conversation stream log metadata must expose runbook ids.');

  const uiTelemetry = read(root, 'apps/uapi/app/conversations/conversation-telemetry-proof-hooks.ts');
  assertCheck(failures, uiTelemetry.includes('buildConversationTelemetryProofPreview'), 'UAPI must expose a telemetry proof preview helper.');
  assertCheck(failures, uiTelemetry.includes('source-safe-conversation-telemetry-proof-hooks-metadata'), 'UAPI telemetry proof preview must use the source-safe verdict.');
  assertCheck(failures, !uiTelemetry.includes('process.env'), 'UAPI telemetry proof helper must not read credentials or env values.');

  const overlay = read(root, 'apps/uapi/app/conversations/components/ConversationsOverlay.tsx');
  assertCheck(failures, overlay.includes('ConversationTelemetryProofPanel'), 'Conversations overlay must expose the telemetry proof panel.');

  const docs = read(root, 'docs/conversations.md');
  assertCheck(failures, docs.includes('ConversationTelemetryProofHooks'), 'Public conversation docs must mention ConversationTelemetryProofHooks.');
  assertCheck(failures, docs.includes('Route-Local History'), 'Public conversation docs must document route-local history.');
  assertCheck(failures, docs.includes('product Handoff'), 'Public conversation docs must document product handoff.');
  assertCheck(failures, docs.includes('source-safe'), 'Public conversation docs must document source-safe telemetry posture.');

  const runbook = read(root, 'docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md');
  assertCheck(failures, runbook.includes('ConversationTelemetryProofHooks'), 'Internal runbook must mention ConversationTelemetryProofHooks.');
  assertCheck(failures, includesAll(runbook, REQUIRED_DASHBOARD_PANELS), 'Internal runbook must list every dashboard panel.');
  assertCheck(failures, includesAll(runbook, REQUIRED_RUNBOOK_IDS), 'Internal runbook must list every runbook id.');

  const workflow = [
    read(root, '.github/workflows/bitcode-gate-quality.yml'),
    read(root, '.github/workflows/bitcode-canon-quality.yml'),
  ].join('\n');
  assertCheck(
    failures,
    workflow.includes('check:v37-gate8') || workflow.includes('check-v37-gate8-conversation-telemetry-proof-hooks.mjs'),
    'Gate and canon workflows must include check:v37-gate8 or its checker script.',
  );
  assertCheck(failures, workflow.includes('conversation-telemetry-proof-hooks.test.js'), 'Gate workflow must run the protocol telemetry proof hooks test.');
  assertCheck(failures, workflow.includes('conversationTelemetryProofHooks.test.ts'), 'Gate workflow must run telemetry proof hook UI/API tests.');

  const packageJson = JSON.parse(read(root, 'package.json'));
  assertCheck(failures, packageJson.scripts?.['check:v37-gate8'], 'package.json must expose check:v37-gate8.');
  assertCheck(failures, packageJson.scripts?.['generate:v37-conversation-telemetry-proof-hooks'], 'package.json must expose telemetry proof hook generation.');

  const spec = read(root, '.specifications/BITCODE_SPEC_V37.md');
  assertCheck(failures, spec.includes('ConversationTelemetryProofHooks'), 'V37 spec must document ConversationTelemetryProofHooks.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH), 'V37 spec must list the telemetry proof hooks artifact.');

  if (failures.length > 0) {
    process.stderr.write(`V37 Gate 8 ConversationTelemetryProofHooks check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V37 Gate 8 ConversationTelemetryProofHooks check passed.\n');
}

main();
