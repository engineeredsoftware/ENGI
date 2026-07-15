#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v42-reading-shortest-path-state-machine.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url').slice(0, 18),
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

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipUapiTests: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v42-gate3-reading-shortest-path-state-machine.mjs [--skip-branch-check] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V42 Gate 3 Reading shortest path state machine, route recovery, retry/failure posture, source-safe disclosure, workflow wiring, docs, tests, and generated artifact.',
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
    pointer === 'V41',
    `BITCODE_SPEC.txt must remain V41 during V42 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v42' || /^v42\/gate-(?:3|[4-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V42 Gate 3+ work must occur on version/v42 or v42/gate-3..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'apps/uapi/app/terminal/TerminalPageClient.tsx',
    'apps/uapi/app/terminal/terminal-enterprise-reading-ux-state.ts',
    'apps/uapi/app/terminal/TerminalDepositReadWorkbench.tsx',
    'apps/uapi/app/terminal/terminal-deposit-read-workbench.ts',
    'apps/uapi/app/terminal/terminal-pipeline-host-client.ts',
    'apps/uapi/app/conversations/conversation-terminal-handoff.ts',
    'apps/uapi/app/terminal/terminal-transaction-query.ts',
    'apps/uapi/app/terminal/terminal-activity-history.ts',
    'apps/uapi/tests/terminalEnterpriseReadingUxState.test.ts',
    'apps/uapi/tests/terminalDepositReadWorkbench.test.ts',
    'apps/uapi/tests/conversationTerminalHandoff.test.tsx',
    'apps/uapi/tests/terminalTransactionQuery.test.ts',
    'apps/uapi/tests/terminalPipelineHarnessClient.test.ts',
    'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
    'packages/specifying/src/canonical/v42-reading-shortest-path-state-machine.js',
    'packages/specifying/test/v42-reading-shortest-path-state-machine.test.js',
    'scripts/generate-v42-reading-shortest-path-state-machine.mjs',
    'scripts/check-v42-gate3-reading-shortest-path-state-machine.mjs',
    'BITCODE_SPEC_V42.md',
    'BITCODE_SPEC_V42_DELTA.md',
    'BITCODE_SPEC_V42_NOTES.md',
    'BITCODE_SPEC_V42_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'apps/uapi/app/terminal/README.md',
    'packages/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V42 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v42-reading-shortest-path-state-machine.mjs', '--check']);
    } catch (error) {
      failures.push(`V42 Reading shortest path state machine artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'packages/specifying/test/v42-reading-shortest-path-state-machine.test.js',
      ]);
    } catch (error) {
      failures.push(`V42 Reading shortest path state machine protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipUapiTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/terminalEnterpriseReadingUxState.test.ts',
        'tests/terminalDepositReadWorkbench.test.ts',
        'tests/conversationTerminalHandoff.test.tsx',
        'tests/terminalTransactionQuery.test.ts',
        'tests/terminalPipelineHarnessClient.test.ts',
        'tests/pipelineExecutionLogHeader.test.tsx',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V42 Reading shortest path state machine uapi tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V42 Gate 3 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v42-reading-shortest-path-state-machine', 'Gate 3 artifactId must match.');
    assertCheck(
      failures,
      artifact.schemaId === 'bitcode.v42.readingShortestPathStateMachine.v1',
      'Gate 3 schemaId must match.',
    );
    assertCheck(failures, artifact.version === 'V42' && artifact.currentTarget === 'V41', 'Gate 3 artifact must bind V42 over active V41.');
    assertCheck(failures, artifact.passed === true, 'Gate 3 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-reading-shortest-path-state-machine-metadata',
      'Gate 3 artifact must declare source-safe Reading state-machine metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 9, 'Gate 3 must cover nine Reading state-machine rows.');
    assertCheck(failures, artifact.coverage.stepCount === 5, 'Gate 3 must cover five Reading steps.');
    assertCheck(failures, artifact.coverage.routePersistenceCovered === true, 'Gate 3 must cover route persistence.');
    assertCheck(failures, artifact.coverage.transactionIdRecoveryCovered === true, 'Gate 3 must cover transaction id recovery.');
    assertCheck(failures, artifact.coverage.restartRetryFailureCovered === true, 'Gate 3 must cover restart, retry, and failure repair.');
    assertCheck(failures, artifact.coverage.acceptedNeedGateCovered === true, 'Gate 3 must cover accepted-Need gating.');
    assertCheck(failures, artifact.coverage.streamLogIntegrationCovered === true, 'Gate 3 must cover stream log integration.');
    assertCheck(failures, artifact.coverage.componentRouteTestsCovered === true, 'Gate 3 must cover component and route tests.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 3 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.lowDetailDefault === true, 'Gate 3 must preserve low-detail defaults.');
    assertCheck(failures, artifact.coverage.expandableSourceSafeDetail === true, 'Gate 3 must preserve expandable source-safe detail.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 3 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Gate 3 artifact must not expose protected prompts.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Gate 3 artifact must not expose raw provider responses.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 3 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Gate 3 artifact must not expose wallet private material.');
    assertCheck(failures, artifact.coverage.ledgerAuthorityClaimed === false, 'Gate 3 artifact must not claim ledger authority.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 3 must not rely on legacy source roots.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 3 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V42.md');
  const parity = read(root, 'BITCODE_SPEC_V42_PARITY_MATRIX.md');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  assertCheck(failures, spec.includes('V42 Gate 3') && spec.includes('reading shortest path state machine'), 'V42 spec must expand Gate 3 state machine.');
  assertCheck(failures, parity.includes('Reading state machine') && parity.includes('implemented'), 'V42 parity matrix must mark Reading state machine implemented.');
  assertCheck(failures, terminalReadme.includes('V42 Gate 3') && terminalReadme.includes('TerminalEnterpriseReadingRouteState'), 'Terminal README must document Gate 3 route state.');

  if (failures.length > 0) {
    process.stderr.write(`V42 Gate 3 Reading shortest path state machine check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V42 Gate 3 Reading shortest path state machine ok artifact=${artifact.artifactRoot}\n`);
}

main();
