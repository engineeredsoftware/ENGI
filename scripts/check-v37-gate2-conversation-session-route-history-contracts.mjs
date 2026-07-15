#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v37-conversation-session-route-history.json';

const REQUIRED_SESSION_FIELD_IDS = [
  'route_local_session_id',
  'user_account_posture',
  'source_context_ref',
  'policy_decision',
  'stream_state',
  'history_refs',
  'proof_roots',
  'event_ids',
  'redaction_posture',
  'persistence_boundary',
];

const REQUIRED_HISTORY_OPERATION_IDS = ['create', 'restore', 'branch', 'retry', 'redact', 'stream'];

const REQUIRED_ROUTE_IDS = [
  'api.conversations.collection',
  'api.conversations.session',
  'api.conversations.collection_stream',
  'api.conversations.session_stream',
  'api.conversations.branch',
  'api.conversations.shared_contracts',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
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

function shouldRunUapiRouteTests() {
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
      'Usage: node scripts/check-v37-gate2-conversation-session-route-history-contracts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 2 ConversationSession package source, generated artifact, route-local history contracts, tests, docs, and workflow wiring.',
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
      branch === 'version/v37' || /^v37\/gate-(?:[2-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 Gate 2+ work must occur on version/v37 or v37/gate-2..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/conversation-session-route-history.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/conversation-session-route-history.test.js',
    'scripts/generate-v37-conversation-session-route-history.mjs',
    'scripts/check-v37-gate2-conversation-session-route-history-contracts.mjs',
    'apps/uapi/app/conversations/conversation-session-route-history.ts',
    'apps/uapi/app/api/conversations/route.ts',
    'apps/uapi/app/api/conversations/[conversationId]/route.ts',
    'apps/uapi/app/api/conversations/stream/route.ts',
    'apps/uapi/app/api/conversations/[conversationId]/stream/route.ts',
    'apps/uapi/app/api/conversations/branch/route.ts',
    'apps/uapi/app/api/conversations/_shared.ts',
    'apps/uapi/tests/api/conversationSessionRouteHistory.test.ts',
    'apps/uapi/tests/api/conversationSessionRouteHistoryContract.test.ts',
    'packages/api/src/routes/conversations.ts',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V37 Gate 2 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v37-conversation-session-route-history.mjs', '--check']);
    } catch (error) {
      failures.push(`V37 Conversation session route-history artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/conversation-session-route-history.test.js']);
    } catch (error) {
      failures.push(`V37 Conversation session route-history package test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && shouldRunUapiRouteTests()) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        'tests/api/conversationSessionRouteHistory.test.ts',
        'tests/api/conversationSessionRouteHistoryContract.test.ts',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V37 Conversation session route-history route tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `Conversation session route-history must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v37-conversation-session-route-history', 'Conversation session route-history artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v37.conversationSessionRouteHistory.v1', 'Conversation session route-history schemaId must match.');
    assertCheck(failures, artifact.version === 'V37' && artifact.currentTarget === 'V36', 'Conversation session route-history must bind V37 over active V36.');
    assertCheck(failures, artifact.passed === true, 'Conversation session route-history artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-conversation-session-route-history-metadata',
      'Conversation session route-history must be source-safe metadata.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredSessionFieldIds, REQUIRED_SESSION_FIELD_IDS),
      'ConversationSession must enumerate every required session field.',
    );
    assertCheck(
      failures,
      includesAll(artifact.requiredHistoryOperationIds, REQUIRED_HISTORY_OPERATION_IDS),
      'ConversationSession route history must enumerate every history operation.',
    );
    assertCheck(failures, includesAll(artifact.requiredRouteIds, REQUIRED_ROUTE_IDS), 'ConversationSession route history must enumerate every route id.');
    assertCheck(failures, artifact.coverage.routeContractCount === REQUIRED_ROUTE_IDS.length, 'Conversation route-history must prove six route contracts.');
    assertCheck(failures, artifact.coverage.allRouteContractsCovered === true, 'Conversation route-history must cover all route contracts.');
    assertCheck(failures, artifact.coverage.allHistoryOperationsCovered === true, 'Conversation route-history must cover all history operations.');
    assertCheck(failures, artifact.coverage.createSupported === true, 'Conversation route-history must support create.');
    assertCheck(failures, artifact.coverage.restoreSupported === true, 'Conversation route-history must support restore.');
    assertCheck(failures, artifact.coverage.branchSupported === true, 'Conversation route-history must support branch.');
    assertCheck(failures, artifact.coverage.retrySupported === true, 'Conversation route-history must support retry.');
    assertCheck(failures, artifact.coverage.redactionSupported === true, 'Conversation route-history must support redaction.');
    assertCheck(failures, artifact.coverage.streamSupported === true, 'Conversation route-history must support stream.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Conversation route-history rows must include proof roots.');
    assertCheck(failures, artifact.coverage.eventIdsCovered === true, 'Conversation route-history rows must include event ids.');
    assertCheck(failures, artifact.coverage.routeLocalHistoryCovered === true, 'Conversation route-history rows must include route-local history refs.');
    assertCheck(failures, artifact.coverage.routeContractsCovered === true, 'Conversation route-history rows must include route contract data.');
    assertCheck(failures, artifact.coverage.persistenceBoundariesCovered === true, 'Conversation route-history rows must keep persistence boundaries local.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Conversation route-history must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Conversation route-history must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Conversation route-history must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.globalLedgerAuthorityClaimed === false, 'Conversation route-history must not claim ledger authority.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Conversation route-history must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^conversation-session-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Conversation route-history rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => /^conversation-session-detail:[a-f0-9]{24}$/u.test(row.detailRoot)),
      'Conversation route-history rows must have deterministic detail roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Conversation route-history source evidence roots must all exist.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => Array.isArray(row.redactionPosture?.forbiddenPayloadClasses)
        && row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads')
        && row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source')
        && row.redactionPosture.forbiddenPayloadClasses.includes('global_ledger_authority_claim')),
      'Conversation route-history rows must forbid protected source, unpaid AssetPack source, and ledger authority claims.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V37.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V37_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V37_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V37_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const rootReadme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const conversationsReadme = read(root, 'apps/uapi/app/conversations/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const routeContracts = read(root, 'apps/uapi/app/conversations/conversation-session-route-history.ts');

  for (const phrase of [
    'ConversationSession',
    'route-local identity',
    'route-local history',
    'restore',
    'branch',
    'retry',
    'redaction',
    '.bitcode/v37-conversation-session-route-history.json',
    'source-safe-conversation-session-route-history-metadata',
    'check:v37-gate2',
  ]) {
    assertCheck(failures, spec.includes(phrase), `V37 SPEC must name ${phrase}.`);
    assertCheck(failures, delta.includes(phrase), `V37 DELTA must name ${phrase}.`);
    assertCheck(failures, parity.includes(phrase), `V37 PARITY must name ${phrase}.`);
  }

  assertCheck(failures, notes.includes('Gate 2: Conversation Session And Route History Contracts'), 'V37 NOTES must retain Gate 2 title.');
  assertCheck(failures, notes.includes('ConversationSession route-history contracts'), 'V37 NOTES must mention Gate 2 route-history contracts.');
  assertCheck(failures, roadmap.includes('V37 Gate 2 closure anchor'), 'Roadmap must include V37 Gate 2 closure anchor.');
  assertCheck(failures, rootReadme.includes('V37 Gate 2'), 'README must mention V37 Gate 2.');
  assertCheck(failures, protocolReadme.includes('ConversationSession'), 'Protocol README must mention ConversationSession.');
  assertCheck(failures, conversationsReadme.includes('ConversationSession'), 'Conversations README must mention ConversationSession.');
  assertCheck(failures, conversationsReadme.includes('route-local history'), 'Conversations README must mention route-local history.');
  assertCheck(failures, packageJson.includes('"generate:v37-conversation-session-route-history"'), 'package.json must expose generate:v37-conversation-session-route-history.');
  assertCheck(failures, packageJson.includes('"check:v37-conversation-session-route-history"'), 'package.json must expose check:v37-conversation-session-route-history.');
  assertCheck(failures, packageJson.includes('"check:v37-gate2"'), 'package.json must expose check:v37-gate2.');
  assertCheck(failures, gateWorkflow.includes('check-v37-gate2-conversation-session-route-history-contracts.mjs'), 'Gate workflow must run V37 Gate 2 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v37-gate2-conversation-session-route-history-contracts.mjs'), 'Canon workflow must run V37 Gate 2 checker.');

  for (const routeId of REQUIRED_ROUTE_IDS) {
    assertCheck(failures, routeContracts.includes(routeId), `Route contract module must include ${routeId}.`);
  }

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V37 Gate 2 ConversationSession route-history check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V37 Gate 2 ConversationSession route history ok rows=${artifact.rows.length} root=${artifact.artifactRoot}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
