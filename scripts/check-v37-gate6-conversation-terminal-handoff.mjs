#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v37-conversation-product-handoff.json';

const REQUIRED_WORKFLOW_IDS = [
  'depositing',
  'reading',
  'finding_fits',
  'exchange',
  'settlement',
  'delivery',
];

const REQUIRED_FIELD_IDS = [
  'conversation_id',
  'message_root',
  'handoff_workflow',
  'transaction_id',
  'repository_anchor',
  'source_selector_refs',
  'source_safe_summary',
  'policy_result',
  'terminal_route',
  'transaction_detail',
  'proof_roots',
  'event_ids',
];

const REQUIRED_AUTHORITY_IDS = [
  'terminal_transaction_cockpit',
  'ledger_authority_boundary',
  'wallet_authority_boundary',
  'source_disclosure_boundary',
  'retry_repair_boundary',
];

const REQUIRED_POLICY_STATES = ['allowed', 'retry_required', 'denied'];

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
      'Usage: node scripts/check-v37-gate6-conversation-product-handoff.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 6 ConversationProductHandoff package source, generated artifact, Terminal route context, UI tests, docs, workflow wiring, and source-safety.',
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
      branch === 'version/v37' || /^v37\/gate-(?:[6-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 Gate 6+ work must occur on version/v37 or v37/gate-6..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/conversation-product-handoff.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/conversation-product-handoff.test.js',
    'scripts/generate-v37-conversation-product-handoff.mjs',
    'scripts/check-v37-gate6-conversation-product-handoff.mjs',
    'apps/uapi/app/conversations/conversation-product-handoff.ts',
    'apps/uapi/app/conversations/components/ConversationProductHandoff.tsx',
    'apps/uapi/app/conversations/components/ConversationsOverlay.tsx',
    'apps/uapi/app/terminal/terminal-transaction-query.ts',
    'apps/uapi/app/terminal/TerminalPageClient.tsx',
    'apps/uapi/styles/conversations-fullscreen.css',
    'apps/uapi/tests/conversationTerminalHandoff.test.tsx',
    'apps/uapi/tests/terminalTransactionQuery.test.ts',
    'apps/uapi/jest.config.cjs',
    'BITCODE_SPEC_V37.md',
    'BITCODE_SPEC_V37_DELTA.md',
    'BITCODE_SPEC_V37_NOTES.md',
    'BITCODE_SPEC_V37_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'apps/uapi/app/conversations/README.md',
    'apps/uapi/app/terminal/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V37 Gate 6 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v37-conversation-product-handoff.mjs', '--check']);
    } catch (error) {
      failures.push(`V37 Conversation terminal handoff artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/conversation-product-handoff.test.js']);
    } catch (error) {
      failures.push(`V37 Conversation terminal handoff package test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && shouldRunUapiTests()) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        'tests/conversationTerminalHandoff.test.tsx',
        'tests/terminalTransactionQuery.test.ts',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V37 Conversation terminal handoff UI and Terminal tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `Conversation terminal handoff must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v37-conversation-product-handoff', 'Conversation terminal handoff artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v37.conversationTerminalHandoff.v1', 'Conversation terminal handoff schemaId must match.');
    assertCheck(failures, artifact.version === 'V37' && artifact.currentTarget === 'V36', 'Conversation terminal handoff must bind V37 over active V36.');
    assertCheck(failures, artifact.passed === true, 'Conversation terminal handoff artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-product-handoff-metadata',
      'Conversation terminal handoff must be source-safe metadata.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredWorkflowIds, REQUIRED_WORKFLOW_IDS),
      'ConversationProductHandoff must enumerate every required Terminal workflow.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredFieldIds, REQUIRED_FIELD_IDS),
      'ConversationProductHandoff must enumerate every required handoff field.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredAuthorityIds, REQUIRED_AUTHORITY_IDS),
      'ConversationProductHandoff must enumerate every required authority boundary.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredPolicyStates, REQUIRED_POLICY_STATES),
      'ConversationProductHandoff must enumerate every policy state.',
    );
    assertCheck(failures, artifact.coverage.workflowCount === REQUIRED_WORKFLOW_IDS.length, 'Conversation terminal handoff must prove six workflows.');
    assertCheck(failures, artifact.coverage.depositingCovered === true, 'Conversation terminal handoff must cover Depositing.');
    assertCheck(failures, artifact.coverage.readingCovered === true, 'Conversation terminal handoff must cover Reading.');
    assertCheck(failures, artifact.coverage.findingFitsCovered === true, 'Conversation terminal handoff must cover Finding Fits.');
    assertCheck(failures, artifact.coverage.exchangeCovered === true, 'Conversation terminal handoff must cover Exchange.');
    assertCheck(failures, artifact.coverage.settlementCovered === true, 'Conversation terminal handoff must cover settlement.');
    assertCheck(failures, artifact.coverage.deliveryCovered === true, 'Conversation terminal handoff must cover delivery.');
    assertCheck(failures, artifact.coverage.allFieldsCovered === true, 'Conversation terminal handoff must cover fields.');
    assertCheck(failures, artifact.coverage.allAuthorityBoundariesCovered === true, 'Conversation terminal handoff must cover authority boundaries.');
    assertCheck(failures, artifact.coverage.allPolicyStatesCovered === true, 'Conversation terminal handoff must cover policy states.');
    assertCheck(failures, artifact.coverage.retryStatesCovered === true, 'Conversation terminal handoff must cover retry states.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Conversation terminal handoff must cover proof roots.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Conversation terminal handoff must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Conversation terminal handoff must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Conversation terminal handoff must not serialize credentials.');
    assertCheck(failures, artifact.coverage.ledgerAuthorityClaimed === false, 'Conversation terminal handoff must not claim ledger authority.');
    assertCheck(failures, artifact.coverage.walletSigningAuthorityClaimed === false, 'Conversation terminal handoff must not claim wallet authority.');
    assertCheck(failures, artifact.coverage.terminalCockpitBypassed === false, 'Conversation terminal handoff must not bypass Terminal.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Conversation terminal handoff must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^conversation-product-handoff-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Conversation terminal handoff rows must have deterministic row roots.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V37.md');
  const delta = read(root, 'BITCODE_SPEC_V37_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V37_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V37_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const uapiReadme = read(root, 'apps/uapi/app/conversations/README.md');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const text of [spec, delta, notes, parity, roadmap, uapiReadme, terminalReadme, protocolReadme]) {
    assertCheck(failures, text.includes('ConversationProductHandoff'), 'V37 Gate 6 docs must name ConversationProductHandoff.');
    assertCheck(failures, text.includes('Terminal'), 'V37 Gate 6 docs must preserve Terminal cockpit language.');
    assertCheck(failures, text.includes('source-safe'), 'V37 Gate 6 docs must preserve source-safe language.');
    assertCheck(failures, text.includes('ledger'), 'V37 Gate 6 docs must describe ledger boundary.');
    assertCheck(failures, text.includes('wallet'), 'V37 Gate 6 docs must describe wallet boundary.');
  }

  assertCheck(failures, packageJson.includes('check:v37-gate6'), 'package.json must wire check:v37-gate6.');
  assertCheck(failures, packageJson.includes('generate:v37-conversation-product-handoff'), 'package.json must wire Gate 6 artifact generation.');
  assertCheck(failures, gateWorkflow.includes('check-v37-gate6-conversation-product-handoff'), 'Gate workflow must run Gate 6 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v37-gate6-conversation-product-handoff'), 'Canon workflow must run Gate 6 checker.');
  assertCheck(failures, gateWorkflow.includes('conversationTerminalHandoff.test.tsx'), 'Gate workflow must run ConversationProductHandoff UI test.');
  assertCheck(failures, gateWorkflow.includes('terminalTransactionQuery.test.ts'), 'Gate workflow must run Terminal handoff route test.');

  if (failures.length) {
    process.stderr.write(`V37 Gate 6 ConversationProductHandoff check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V37 Gate 6 ConversationProductHandoff check passed.\n');
}

main();
