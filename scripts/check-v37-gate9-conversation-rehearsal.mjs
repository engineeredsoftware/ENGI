#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v37-conversation-rehearsal.json';

const REQUIRED_REHEARSAL_IDS = [
  'local_conversations_rehearsal',
  'staging_testnet_conversations_rehearsal',
  'stream_writing_selector_handoff_rehearsal',
  'persistence_privacy_redaction_rehearsal',
  'source_safe_screenshot_log_rehearsal',
  'value_bearing_mainnet_blocked_conversations_rehearsal',
];

const REQUIRED_FLOW_IDS = [
  'chat',
  'streaming',
  'writing',
  'source_selector',
  'terminal_handoff',
  'restore',
  'retry',
  'redaction',
  'error',
];

const REQUIRED_DOC_PHRASES = [
  'local and staging-testnet rehearsals exercise chat, streaming, writing, source selector, Terminal handoff, restore, retry, redaction, and error flows',
  'rehearsal logs/screenshots are source-safe',
  'route/UI checks, telemetry roots, and value-bearing mainnet blocking are visible',
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
      'Usage: node scripts/check-v37-gate9-conversation-rehearsal.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 9 ConversationRehearsal package source, generated artifact, local/staging rehearsal evidence, UI helper, docs, workflows, and tests.',
      'Set BITCODE_RUN_PACKAGE_MANAGER_TESTS=1 to execute pnpm-backed UI tests.',
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V36',
    `BITCODE_SPEC.txt must remain V36 during V37 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v37' || /^v37\/gate-(?:9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 Gate 9+ work must occur on version/v37 or v37/gate-9..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/conversation-rehearsal.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/conversation-rehearsal.test.js',
    'scripts/generate-v37-conversation-rehearsal.mjs',
    'scripts/check-v37-gate9-conversation-rehearsal.mjs',
    'apps/uapi/app/conversations/conversation-rehearsal.ts',
    'apps/uapi/app/conversations/components/ConversationRehearsalPanel.tsx',
    'apps/uapi/app/conversations/components/ConversationsOverlay.tsx',
    'apps/uapi/styles/conversations-fullscreen.css',
    'apps/uapi/tests/api/conversationRehearsal.test.ts',
    'apps/uapi/tests/conversationRehearsalPanel.test.tsx',
    'apps/uapi/jest.config.cjs',
    'docs/conversations.md',
    'docs/BITCODE_CONVERSATIONS.md',
    'docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md',
    'specifications/BITCODE_SPEC_V37.md',
    'specifications/BITCODE_SPEC_V37_DELTA.md',
    'specifications/BITCODE_SPEC_V37_NOTES.md',
    'specifications/BITCODE_SPEC_V37_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'apps/uapi/app/conversations/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V37 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v37-conversation-rehearsal.mjs', '--check']);
    } catch (error) {
      failures.push(`V37 Conversation rehearsal artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/conversation-rehearsal.test.js']);
    } catch (error) {
      failures.push(`V37 Conversation rehearsal package test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && shouldRunPackageManagerTests()) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        'tests/api/conversationRehearsal.test.ts',
        'tests/conversationRehearsalPanel.test.tsx',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V37 Conversation rehearsal UI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V37 Conversation rehearsal must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v37-conversation-rehearsal', 'Conversation rehearsal artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v37.conversationRehearsal.v1', 'Conversation rehearsal schemaId must match.');
    assertCheck(
      failures,
      artifact.version === 'V37' && artifact.currentTarget === 'V36',
      'Conversation rehearsal must bind V37 over active V36.',
    );
    assertCheck(failures, artifact.passed === true, 'Conversation rehearsal report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-rehearsal-metadata',
      'Conversation rehearsal report must be source-safe rehearsal metadata.',
    );
    assertCheck(
      failures,
      includesAll(artifact.coverage.observedRehearsalIds, REQUIRED_REHEARSAL_IDS),
      'Conversation rehearsal must cover every required rehearsal.',
    );
    assertCheck(
      failures,
      includesAll(artifact.coverage.observedFlowIds, REQUIRED_FLOW_IDS),
      'Conversation rehearsal must cover every required flow.',
    );
    assertCheck(failures, artifact.coverage.localRehearsalCovered === true, 'Conversation rehearsal must cover local lane with all flows.');
    assertCheck(failures, artifact.coverage.stagingTestnetRehearsalCovered === true, 'Conversation rehearsal must cover staging-testnet lane with all flows.');
    assertCheck(failures, artifact.coverage.routeUiChecksVisible === true, 'Conversation rehearsal must make route/UI checks visible.');
    assertCheck(failures, artifact.coverage.telemetryChecksVisible === true, 'Conversation rehearsal must make telemetry checks visible.');
    assertCheck(failures, artifact.coverage.sourceSafeLogsCovered === true, 'Conversation rehearsal must cover source-safe screenshot/log roots.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetVisibleAndBlocked === true, 'Conversation rehearsal must visibly block value-bearing mainnet.');
    for (const flowId of REQUIRED_FLOW_IDS) {
      assertCheck(failures, artifact.coverage[`${flowId}FlowCovered`] === true, `Conversation rehearsal must cover flow ${flowId}.`);
    }
    assertCheck(failures, artifact.coverage.missingSourceRoots.length === 0, 'Conversation rehearsal must have no missing source roots.');
    assertCheck(failures, artifact.coverage.rowsMissingFlowIds.length === 0, 'Conversation rehearsal rows must have flow ids.');
    assertCheck(failures, artifact.coverage.rowsMissingProofRoots.length === 0, 'Conversation rehearsal rows must have proof roots.');
    assertCheck(failures, artifact.coverage.rowsMissingRouteUiChecks.length === 0, 'Conversation rehearsal rows must have route/UI checks.');
    assertCheck(failures, artifact.coverage.rowsMissingTelemetryChecks.length === 0, 'Conversation rehearsal rows must have telemetry checks.');
    assertCheck(failures, artifact.coverage.rowsMissingSourceSafeLogs.length === 0, 'Conversation rehearsal rows must have source-safe screenshot/log roots.');
    assertCheck(failures, artifact.coverage.rowsMissingValidationCommands.length === 0, 'Conversation rehearsal rows must have validation commands.');
    assertCheck(failures, artifact.coverage.valueBearingUnblockedRows.length === 0, 'Conversation rehearsal must keep value-bearing mainnet blocked.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Conversation rehearsal must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Conversation rehearsal must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Conversation rehearsal must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.rawModelResponseVisible === false, 'Conversation rehearsal must not expose raw model responses.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Conversation rehearsal must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Conversation rehearsal must not expose wallet private material.');
    assertCheck(failures, artifact.coverage.ledgerWriteAuthorityVisible === false, 'Conversation rehearsal must not expose ledger write authority.');
    assertCheck(failures, artifact.coverage.walletSigningAuthorityVisible === false, 'Conversation rehearsal must not expose wallet signing authority.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^conversation-rehearsal-row:[a-f0-9]{24}$/u.test(row.rehearsalRoot)),
      'Conversation rehearsal rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.allowedPayloadFields.includes('flowIds') && row.allowedPayloadFields.includes('proofRoots') && row.allowedPayloadFields.includes('screenshotOrLogRoots')),
      'Conversation rehearsal rows must expose flow ids, proof roots, and screenshot/log roots as allowed fields.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Conversation rehearsal source evidence must be present.',
    );
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V37.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V37_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V37_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V37_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const rootPackage = read(root, 'package.json');
  const protocolIndex = read(root, 'scripts/specifying/src/index.js');
  const protocolDts = read(root, 'scripts/specifying/src/index.d.ts');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const conversationsReadme = read(root, 'apps/uapi/app/conversations/README.md');
  const publicDocs = read(root, 'docs/conversations.md');
  const internalDocs = read(root, 'docs/BITCODE_CONVERSATIONS.md');
  const runbook = read(root, 'docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md');

  for (const doc of [spec, delta, notes, parity, roadmap, protocolReadme, rootReadme, conversationsReadme, publicDocs, internalDocs, runbook]) {
    const normalizedDoc = doc.toLowerCase();
    assertCheck(failures, doc.includes('ConversationRehearsal'), 'Docs/specs must name ConversationRehearsal.');
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `Docs/specs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('source-safe-conversation-rehearsal-metadata'), 'Docs/specs must mention source-safe Conversations rehearsal metadata.');
    for (const phrase of REQUIRED_DOC_PHRASES) {
      assertCheck(failures, normalizedDoc.includes(phrase.toLowerCase()), `Docs/specs must state: ${phrase}.`);
    }
  }

  assertCheck(failures, spec.includes('## V37 Gate 9 ConversationRehearsal canon'), 'V37 spec must define the Gate 9 ConversationRehearsal canon.');
  assertCheck(failures, delta.includes('Gate 9') && delta.includes('pnpm run check:v37-gate9'), 'V37 delta must close Gate 9 checker acceptance.');
  assertCheck(failures, notes.includes('Gate 9 closure'), 'V37 notes must record Gate 9 closure.');
  assertCheck(failures, parity.includes('| Local staging rehearsal | Gate 9 |') && parity.includes('| closed |'), 'V37 parity must close the Gate 9 matrix row.');
  assertCheck(failures, parity.includes('## V37 Gate 9 Parity') && parity.includes('ConversationRehearsal'), 'V37 parity must include Gate 9 parity details.');
  assertCheck(failures, roadmap.includes('V37 Gate 9 closure anchor'), 'Roadmap must include V37 Gate 9 closure anchor.');
  assertCheck(failures, /Current working gate: V37 Gate 10\b/u.test(roadmap), 'Roadmap must advance current working gate to V37 Gate 10.');
  assertCheck(failures, rootPackage.includes('"generate:v37-conversation-rehearsal"'), 'package.json must expose V37 Conversation rehearsal generation script.');
  assertCheck(failures, rootPackage.includes('"check:v37-conversation-rehearsal"'), 'package.json must expose V37 Conversation rehearsal artifact check script.');
  assertCheck(failures, rootPackage.includes('"check:v37-gate9"'), 'package.json must expose V37 Gate 9 checker.');
  assertCheck(failures, protocolIndex.includes('buildConversationRehearsal'), 'Protocol package must export Conversation rehearsal builder.');
  assertCheck(failures, protocolDts.includes('buildConversationRehearsal'), 'Protocol package d.ts must export Conversation rehearsal builder.');
  assertCheck(failures, workflow.includes('check-v37-gate9-conversation-rehearsal.mjs'), 'Gate quality workflow must run Gate 9 checker when present.');
  assertCheck(failures, workflow.includes('conversation-rehearsal.test.js'), 'Gate quality workflow must run Gate 9 package test.');
  assertCheck(failures, canonWorkflow.includes('check-v37-gate9-conversation-rehearsal.mjs'), 'Canon workflow must run Gate 9 checker when present.');

  if (failures.length > 0) {
    process.stderr.write(`V37 Gate 9 Conversation rehearsal check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V37 Gate 9 Conversation rehearsal check passed: ${artifact?.artifactRoot || 'artifact pending'}\n`);
}

main();
