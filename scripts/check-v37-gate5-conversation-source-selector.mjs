#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v37-conversation-source-selector.json';

const REQUIRED_KIND_IDS = [
  'repository',
  'branch',
  'commit',
  'deposit',
  'btd_range',
  'assetpack_preview',
  'document',
  'prior_conversation',
];

const REQUIRED_GOVERNANCE_IDS = ['account', 'organization', 'wallet', 'rights', 'settlement', 'disclosure', 'policy'];
const REQUIRED_PREVIEW_STATES = ['allowed', 'denied', 'retry_required'];

const REQUIRED_FIELD_IDS = [
  'selector_kind',
  'source_ref',
  'account_posture',
  'organization_posture',
  'wallet_posture',
  'rights_posture',
  'settlement_posture',
  'disclosure_posture',
  'policy_posture',
  'preview_policy',
  'denial_reason',
  'retry_action',
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
      'Usage: node scripts/check-v37-gate5-conversation-source-selector.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 5 ConversationSourceSelector package source, generated artifact, source-safe preview policy, rights checks, UI tests, docs, and workflow wiring.',
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
      branch === 'version/v37' || /^v37\/gate-(?:[5-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 Gate 5+ work must occur on version/v37 or v37/gate-5..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/conversation-source-selector.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/conversation-source-selector.test.js',
    'scripts/generate-v37-conversation-source-selector.mjs',
    'scripts/check-v37-gate5-conversation-source-selector.mjs',
    'uapi/app/conversations/conversation-source-selector.ts',
    'uapi/app/conversations/components/ConversationSourceSelector.tsx',
    'uapi/app/conversations/components/ConversationsOverlay.tsx',
    'uapi/styles/conversations-fullscreen.css',
    'uapi/tests/conversationSourceSelector.test.tsx',
    'uapi/jest.config.cjs',
    'BITCODE_SPEC_V37.md',
    'BITCODE_SPEC_V37_DELTA.md',
    'BITCODE_SPEC_V37_NOTES.md',
    'BITCODE_SPEC_V37_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'uapi/app/conversations/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V37 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v37-conversation-source-selector.mjs', '--check']);
    } catch (error) {
      failures.push(`V37 Conversation source selector artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/specifying/test/conversation-source-selector.test.js']);
    } catch (error) {
      failures.push(`V37 Conversation source selector package test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && shouldRunUapiTests()) {
    try {
      run(root, 'pnpm', ['--dir', 'uapi', 'exec', 'jest', 'tests/conversationSourceSelector.test.tsx', '--runInBand']);
    } catch (error) {
      failures.push(`V37 Conversation source selector UI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `Conversation source selector must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v37-conversation-source-selector', 'Conversation source selector artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v37.conversationSourceSelector.v1', 'Conversation source selector schemaId must match.');
    assertCheck(failures, artifact.version === 'V37' && artifact.currentTarget === 'V36', 'Conversation source selector must bind V37 over active V36.');
    assertCheck(failures, artifact.passed === true, 'Conversation source selector artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-source-selector-metadata',
      'Conversation source selector must be source-safe metadata.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredKindIds, REQUIRED_KIND_IDS),
      'ConversationSourceSelector must enumerate every required selector kind.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredGovernanceIds, REQUIRED_GOVERNANCE_IDS),
      'ConversationSourceSelector must enumerate every required governance dimension.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredPreviewStates, REQUIRED_PREVIEW_STATES),
      'ConversationSourceSelector must enumerate every required preview state.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredFieldIds, REQUIRED_FIELD_IDS),
      'ConversationSourceSelector must enumerate every required field.',
    );
    assertCheck(failures, artifact.coverage.selectorKindCount === REQUIRED_KIND_IDS.length, 'Conversation source selector must prove eight kinds.');
    assertCheck(failures, artifact.coverage.allGovernanceCovered === true, 'Conversation source selector must cover governance.');
    assertCheck(failures, artifact.coverage.allPreviewStatesCovered === true, 'Conversation source selector must cover preview states.');
    assertCheck(failures, artifact.coverage.repositoryCovered === true, 'Conversation source selector must cover repository.');
    assertCheck(failures, artifact.coverage.branchCovered === true, 'Conversation source selector must cover branch.');
    assertCheck(failures, artifact.coverage.commitCovered === true, 'Conversation source selector must cover commit.');
    assertCheck(failures, artifact.coverage.depositCovered === true, 'Conversation source selector must cover deposit.');
    assertCheck(failures, artifact.coverage.btdRangeCovered === true, 'Conversation source selector must cover BTD range.');
    assertCheck(failures, artifact.coverage.assetpackPreviewCovered === true, 'Conversation source selector must cover AssetPack preview.');
    assertCheck(failures, artifact.coverage.documentCovered === true, 'Conversation source selector must cover document.');
    assertCheck(failures, artifact.coverage.priorConversationCovered === true, 'Conversation source selector must cover prior conversation.');
    assertCheck(failures, artifact.coverage.denialStatesCovered === true, 'Conversation source selector must cover denial states.');
    assertCheck(failures, artifact.coverage.retryStatesCovered === true, 'Conversation source selector must cover retry states.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Conversation source selector must cover proof roots.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Conversation source selector must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Conversation source selector must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Conversation source selector must not serialize credentials.');
    assertCheck(failures, artifact.coverage.globalLedgerAuthorityClaimed === false, 'Conversation source selector must not claim ledger authority.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Conversation source selector must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^conversation-source-selector-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Conversation source selector rows must have deterministic row roots.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V37.md');
  const delta = read(root, 'BITCODE_SPEC_V37_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V37_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V37_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const uapiReadme = read(root, 'uapi/app/conversations/README.md');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const text of [spec, delta, notes, parity, roadmap, uapiReadme, protocolReadme]) {
    assertCheck(failures, text.includes('ConversationSourceSelector'), 'V37 Gate 5 docs must name ConversationSourceSelector.');
    assertCheck(failures, text.includes('source-safe'), 'V37 Gate 5 docs must preserve source-safe language.');
    assertCheck(failures, text.includes('rights'), 'V37 Gate 5 docs must describe rights posture.');
    assertCheck(failures, text.includes('settlement'), 'V37 Gate 5 docs must describe settlement posture.');
  }

  assertCheck(failures, packageJson.includes('check:v37-gate5'), 'package.json must wire check:v37-gate5.');
  assertCheck(failures, packageJson.includes('generate:v37-conversation-source-selector'), 'package.json must wire Gate 5 artifact generation.');
  assertCheck(failures, gateWorkflow.includes('check-v37-gate5-conversation-source-selector'), 'Gate workflow must run Gate 5 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v37-gate5-conversation-source-selector'), 'Canon workflow must run Gate 5 checker.');
  assertCheck(failures, gateWorkflow.includes('conversationSourceSelector.test.tsx'), 'Gate workflow must run ConversationSourceSelector UI test.');

  if (failures.length) {
    process.stderr.write(`V37 Gate 5 ConversationSourceSelector check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V37 Gate 5 ConversationSourceSelector check passed.\n');
}

main();
