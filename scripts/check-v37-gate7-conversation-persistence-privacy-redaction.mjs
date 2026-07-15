#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v37/conversation-persistence-privacy-redaction.json';

const REQUIRED_OPERATION_IDS = [
  'persist_message',
  'restore_history',
  'export_history',
  'delete_history',
  'retain_history',
  'replay_history',
  'incident_repair',
];

const REQUIRED_VISIBILITY_TIER_IDS = [
  'public',
  'user_visible',
  'organization_visible',
  'buyer_visible',
  'reviewer_visible',
  'operator_only',
];

const REQUIRED_RETENTION_POSTURES = [
  'route_local_ephemeral',
  'durable_user_visible',
  'durable_organization_visible',
  'buyer_rights_visible',
  'reviewer_limited_visible',
  'operator_audit_only',
  'deletion_tombstone',
];

const REQUIRED_FIELD_IDS = [
  'conversation_id',
  'message_id',
  'actor_id',
  'visibility_tier',
  'source_context_refs',
  'redaction_posture',
  'retention_posture',
  'export_posture',
  'delete_posture',
  'replay_posture',
  'incident_repair_posture',
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
      'Usage: node scripts/check-v37-gate7-conversation-persistence-privacy-redaction.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 7 ConversationPersistencePrivacyRedaction package source, generated artifact, API storage redaction, UI helpers, docs, workflows, and source-safety.',
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
      branch === 'version/v37' || /^v37\/gate-(?:[7-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 Gate 7+ work must occur on version/v37 or v37/gate-7..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/conversation-persistence-privacy-redaction.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/conversation-persistence-privacy-redaction.test.js',
    'scripts/generate-v37-conversation-persistence-privacy-redaction.mjs',
    'scripts/check-v37-gate7-conversation-persistence-privacy-redaction.mjs',
    'packages/api/src/conversations/privacy.ts',
    'packages/api/src/conversations/messages.ts',
    'packages/api/src/routes/conversations.ts',
    'packages/api/src/conversations/__tests__/privacy.test.ts',
    'apps/uapi/app/conversations/conversation-persistence-privacy-redaction.ts',
    'apps/uapi/app/conversations/components/ConversationPersistencePrivacyPanel.tsx',
    'apps/uapi/app/conversations/components/ConversationsOverlay.tsx',
    'apps/uapi/styles/conversations-fullscreen.css',
    'apps/uapi/tests/api/conversationPersistencePrivacyRedaction.test.ts',
    'apps/uapi/tests/conversationPersistencePrivacyPanel.test.tsx',
    'apps/uapi/jest.config.cjs',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V37 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v37-conversation-persistence-privacy-redaction.mjs', '--check']);
    } catch (error) {
      failures.push(`V37 Conversation persistence privacy artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/conversation-persistence-privacy-redaction.test.js',
      ]);
    } catch (error) {
      failures.push(`V37 Conversation persistence privacy package test failed: ${error.stderr || error.message}`);
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
        'src/conversations/__tests__/privacy.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V37 Conversation persistence privacy API test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && shouldRunPackageManagerTests()) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        'tests/api/conversationPersistencePrivacyRedaction.test.ts',
        'tests/conversationPersistencePrivacyPanel.test.tsx',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V37 Conversation persistence privacy UI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `Conversation persistence privacy must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v37-conversation-persistence-privacy-redaction', 'Conversation persistence privacy artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v37.conversationPersistencePrivacyRedaction.v1', 'Conversation persistence privacy schemaId must match.');
    assertCheck(failures, artifact.version === 'V37' && artifact.currentTarget === 'V36', 'Conversation persistence privacy must bind V37 over active V36.');
    assertCheck(failures, artifact.passed === true, 'Conversation persistence privacy artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-persistence-privacy-redaction-metadata',
      'Conversation persistence privacy must be source-safe metadata.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredOperationIds, REQUIRED_OPERATION_IDS),
      'ConversationPersistencePrivacyRedaction must enumerate every required operation.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredVisibilityTierIds, REQUIRED_VISIBILITY_TIER_IDS),
      'ConversationPersistencePrivacyRedaction must enumerate every required visibility tier.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredRetentionPostures, REQUIRED_RETENTION_POSTURES),
      'ConversationPersistencePrivacyRedaction must enumerate every retention posture.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredFieldIds, REQUIRED_FIELD_IDS),
      'ConversationPersistencePrivacyRedaction must enumerate every required field.',
    );
    assertCheck(failures, artifact.coverage.operationCount === REQUIRED_OPERATION_IDS.length, 'Conversation persistence privacy must prove seven operations.');
    assertCheck(failures, artifact.coverage.persistMessageCovered === true, 'Conversation persistence privacy must cover persist message.');
    assertCheck(failures, artifact.coverage.restoreHistoryCovered === true, 'Conversation persistence privacy must cover restore history.');
    assertCheck(failures, artifact.coverage.exportHistoryCovered === true, 'Conversation persistence privacy must cover export history.');
    assertCheck(failures, artifact.coverage.deleteHistoryCovered === true, 'Conversation persistence privacy must cover delete history.');
    assertCheck(failures, artifact.coverage.retainHistoryCovered === true, 'Conversation persistence privacy must cover retention.');
    assertCheck(failures, artifact.coverage.replayHistoryCovered === true, 'Conversation persistence privacy must cover replay.');
    assertCheck(failures, artifact.coverage.incidentRepairCovered === true, 'Conversation persistence privacy must cover incident repair.');
    assertCheck(failures, artifact.coverage.allVisibilityTiersCovered === true, 'Conversation persistence privacy must cover visibility tiers.');
    assertCheck(failures, artifact.coverage.allRetentionPosturesCovered === true, 'Conversation persistence privacy must cover retention postures.');
    assertCheck(failures, artifact.coverage.allFieldsCovered === true, 'Conversation persistence privacy must cover fields.');
    assertCheck(failures, artifact.coverage.visibilitySeparationCovered === true, 'Conversation persistence privacy must separate visibility tiers.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Conversation persistence privacy must cover proof roots.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Conversation persistence privacy must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedPromptVisible === false, 'Conversation persistence privacy must not expose protected prompts.');
    assertCheck(failures, artifact.coverage.protectedModelResponseVisible === false, 'Conversation persistence privacy must not expose protected model responses.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Conversation persistence privacy must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Conversation persistence privacy must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Conversation persistence privacy must not expose wallet private material.');
    assertCheck(failures, artifact.coverage.protectedBodiesPersisted === false, 'Conversation persistence privacy must not persist protected bodies.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Conversation persistence privacy must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^conversation-persistence-privacy-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Conversation persistence privacy rows must have deterministic row roots.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V37.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V37_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V37_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V37_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const rootReadme = read(root, 'README.md');
  const uapiReadme = read(root, 'apps/uapi/app/conversations/README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const text of [spec, delta, notes, parity, roadmap, rootReadme, uapiReadme, protocolReadme]) {
    assertCheck(failures, text.includes('ConversationPersistencePrivacyRedaction'), 'V37 Gate 7 docs must name ConversationPersistencePrivacyRedaction.');
    assertCheck(failures, text.includes('visibility tier'), 'V37 Gate 7 docs must describe visibility tiers.');
    assertCheck(failures, text.includes('export'), 'V37 Gate 7 docs must describe export posture.');
    assertCheck(failures, text.includes('delete'), 'V37 Gate 7 docs must describe delete posture.');
    assertCheck(failures, text.includes('retention'), 'V37 Gate 7 docs must describe retention posture.');
    assertCheck(failures, text.includes('replay'), 'V37 Gate 7 docs must describe replay posture.');
    assertCheck(failures, text.includes('incident repair'), 'V37 Gate 7 docs must describe incident repair posture.');
    assertCheck(failures, text.includes('source-safe'), 'V37 Gate 7 docs must preserve source-safe language.');
  }

  assertCheck(failures, packageJson.includes('check:v37-gate7'), 'package.json must wire check:v37-gate7.');
  assertCheck(
    failures,
    packageJson.includes('generate:v37-conversation-persistence-privacy-redaction'),
    'package.json must wire Gate 7 artifact generation.',
  );
  assertCheck(failures, gateWorkflow.includes('check-v37-gate7-conversation-persistence-privacy-redaction'), 'Gate workflow must run Gate 7 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v37-gate7-conversation-persistence-privacy-redaction'), 'Canon workflow must run Gate 7 checker.');
  assertCheck(failures, gateWorkflow.includes('conversationPersistencePrivacyRedaction.test.ts'), 'Gate workflow must run persistence privacy route test.');
  assertCheck(failures, gateWorkflow.includes('conversationPersistencePrivacyPanel.test.tsx'), 'Gate workflow must run persistence privacy panel test.');
  assertCheck(failures, gateWorkflow.includes('src/conversations/__tests__/privacy.test.ts'), 'Gate workflow must run API privacy test.');

  if (failures.length) {
    process.stderr.write(`V37 Gate 7 ConversationPersistencePrivacyRedaction check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V37 Gate 7 ConversationPersistencePrivacyRedaction check passed.\n');
}

main();
