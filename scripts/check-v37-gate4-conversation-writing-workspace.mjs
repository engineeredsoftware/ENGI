#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v37-conversation-writing-workspace.json';

const REQUIRED_MODE_IDS = [
  'read_request',
  'need_feedback',
  'assetpack_review_note',
  'terminal_handoff_summary',
];

const REQUIRED_ACTION_IDS = ['save', 'restore', 'summarize', 'handoff'];

const REQUIRED_FIELD_IDS = [
  'workspace_mode',
  'draft_scope',
  'local_draft_key',
  'summary_policy',
  'handoff_policy',
  'source_safety_boundary',
  'keyboard_behavior',
  'responsive_layout',
  'recovery_state',
  'proof_roots',
  'event_ids',
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
      'Usage: node scripts/check-v37-gate4-conversation-writing-workspace.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 4 ConversationWritingWorkspace package source, generated artifact, fullscreen composer UI, source-safe handoff behavior, tests, docs, and workflow wiring.',
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
      branch === 'version/v37' || /^v37\/gate-(?:[4-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 Gate 4+ work must occur on version/v37 or v37/gate-4..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/conversation-writing-workspace.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/conversation-writing-workspace.test.js',
    'scripts/generate-v37-conversation-writing-workspace.mjs',
    'scripts/check-v37-gate4-conversation-writing-workspace.mjs',
    'apps/uapi/app/conversations/conversation-writing-workspace.ts',
    'apps/uapi/app/conversations/components/ConversationWritingWorkspace.tsx',
    'apps/uapi/app/conversations/components/ConversationsOverlay.tsx',
    'apps/uapi/styles/conversations-fullscreen.css',
    'apps/uapi/tests/conversationWritingWorkspace.test.tsx',
    'apps/uapi/jest.config.cjs',
    'BITCODE_SPEC_V37.md',
    'BITCODE_SPEC_V37_DELTA.md',
    'BITCODE_SPEC_V37_NOTES.md',
    'BITCODE_SPEC_V37_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'apps/uapi/app/conversations/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V37 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v37-conversation-writing-workspace.mjs', '--check']);
    } catch (error) {
      failures.push(`V37 Conversation writing workspace artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/specifying/test/conversation-writing-workspace.test.js']);
    } catch (error) {
      failures.push(`V37 Conversation writing workspace package test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && shouldRunUapiTests()) {
    try {
      run(root, 'pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', 'tests/conversationWritingWorkspace.test.tsx', '--runInBand']);
    } catch (error) {
      failures.push(`V37 Conversation writing workspace UI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `Conversation writing workspace must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v37-conversation-writing-workspace', 'Conversation writing workspace artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v37.conversationWritingWorkspace.v1', 'Conversation writing workspace schemaId must match.');
    assertCheck(failures, artifact.version === 'V37' && artifact.currentTarget === 'V36', 'Conversation writing workspace must bind V37 over active V36.');
    assertCheck(failures, artifact.passed === true, 'Conversation writing workspace artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-writing-workspace-metadata',
      'Conversation writing workspace must be source-safe metadata.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredModeIds, REQUIRED_MODE_IDS),
      'ConversationWritingWorkspace must enumerate every required mode.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredActionIds, REQUIRED_ACTION_IDS),
      'ConversationWritingWorkspace must enumerate every required action.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredFieldIds, REQUIRED_FIELD_IDS),
      'ConversationWritingWorkspace must enumerate every required field.',
    );
    assertCheck(failures, artifact.coverage.workspaceModeCount === REQUIRED_MODE_IDS.length, 'Conversation writing workspace must prove four modes.');
    assertCheck(failures, artifact.coverage.readRequestCovered === true, 'Conversation writing workspace must cover Read Request drafting.');
    assertCheck(failures, artifact.coverage.needFeedbackCovered === true, 'Conversation writing workspace must cover Need feedback drafting.');
    assertCheck(failures, artifact.coverage.assetpackReviewNoteCovered === true, 'Conversation writing workspace must cover AssetPack review notes.');
    assertCheck(failures, artifact.coverage.terminalHandoffSummaryCovered === true, 'Conversation writing workspace must cover Terminal handoff summaries.');
    assertCheck(failures, artifact.coverage.saveRestoreSummarizeHandoffCovered === true, 'Conversation writing workspace must cover save/restore/summarize/handoff.');
    assertCheck(failures, artifact.coverage.localDraftKeysCovered === true, 'Conversation writing workspace must cover route-local draft keys.');
    assertCheck(failures, artifact.coverage.accessibilityCovered === true, 'Conversation writing workspace must cover keyboard and fullscreen accessibility.');
    assertCheck(failures, artifact.coverage.recoveryStatesCovered === true, 'Conversation writing workspace must cover recovery states.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Conversation writing workspace must cover proof roots.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Conversation writing workspace must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Conversation writing workspace must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Conversation writing workspace must not serialize credentials.');
    assertCheck(failures, artifact.coverage.globalLedgerAuthorityClaimed === false, 'Conversation writing workspace must not claim ledger authority.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Conversation writing workspace must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^conversation-writing-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Conversation writing workspace rows must have deterministic row roots.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V37.md');
  const delta = read(root, 'BITCODE_SPEC_V37_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V37_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V37_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const uapiReadme = read(root, 'apps/uapi/app/conversations/README.md');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const text of [spec, delta, notes, parity, roadmap, uapiReadme, protocolReadme]) {
    assertCheck(failures, text.includes('ConversationWritingWorkspace'), 'V37 Gate 4 docs must name ConversationWritingWorkspace.');
    assertCheck(failures, text.includes('source-safe'), 'V37 Gate 4 docs must preserve source-safe language.');
  }

  assertCheck(failures, packageJson.includes('check:v37-gate4'), 'package.json must wire check:v37-gate4.');
  assertCheck(failures, packageJson.includes('generate:v37-conversation-writing-workspace'), 'package.json must wire Gate 4 artifact generation.');
  assertCheck(failures, gateWorkflow.includes('check-v37-gate4-conversation-writing-workspace'), 'Gate workflow must run Gate 4 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v37-gate4-conversation-writing-workspace'), 'Canon workflow must run Gate 4 checker.');
  assertCheck(failures, gateWorkflow.includes('conversationWritingWorkspace.test.tsx'), 'Gate workflow must run ConversationWritingWorkspace UI test.');

  if (failures.length) {
    process.stderr.write(`V37 Gate 4 ConversationWritingWorkspace check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V37 Gate 4 ConversationWritingWorkspace check passed.\n');
}

main();
