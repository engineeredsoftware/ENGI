#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v39-enterprise-reading-ux-state.json';

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
      'Usage: node scripts/check-v39-gate3-enterprise-reading-ux-state.mjs [--skip-branch-check] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 3 enterprise Reading UX state, route contracts, source-safe disclosure, stream-log integration, tests, docs, workflow wiring, and proof artifact.',
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
    pointer === 'V38',
    `BITCODE_SPEC.txt must remain V38 during V39 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v39' || /^v39\/gate-(?:3|[4-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 3+ work must occur on version/v39 or v39/gate-3..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'uapi/app/terminal/terminal-enterprise-reading-ux-state.ts',
    'uapi/app/terminal/TerminalDepositReadWorkbench.tsx',
    'uapi/app/terminal/terminal-deposit-read-workbench.ts',
    'uapi/app/terminal/terminal-pipeline-host-client.ts',
    'uapi/app/conversations/conversation-terminal-handoff.ts',
    'uapi/app/terminal/terminal-transaction-query.ts',
    'uapi/tests/terminalEnterpriseReadingUxState.test.ts',
    'uapi/tests/terminalDepositReadWorkbench.test.ts',
    'uapi/tests/conversationTerminalHandoff.test.tsx',
    'uapi/tests/terminalTransactionQuery.test.ts',
    'uapi/tests/terminalPipelineHarnessClient.test.ts',
    'uapi/tests/pipelineExecutionLogHeader.test.tsx',
    'uapi/tests/terminalUxBrowserProof.test.tsx',
    'uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts',
    'packages/protocol/src/canonical/v39-enterprise-reading-ux-state.js',
    'packages/protocol/test/v39-enterprise-reading-ux-state.test.js',
    'scripts/generate-v39-enterprise-reading-ux-state.mjs',
    'scripts/check-v39-gate3-enterprise-reading-ux-state.mjs',
    'BITCODE_SPEC_V39.md',
    'BITCODE_SPEC_V39_DELTA.md',
    'BITCODE_SPEC_V39_NOTES.md',
    'BITCODE_SPEC_V39_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'uapi/app/terminal/README.md',
    'uapi/app/conversations/README.md',
    'packages/protocol/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v39-enterprise-reading-ux-state.mjs', '--check']);
    } catch (error) {
      failures.push(`V39 enterprise Reading UX state artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'packages/protocol/test/v39-enterprise-reading-ux-state.test.js',
      ]);
    } catch (error) {
      failures.push(`V39 enterprise Reading UX state protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipUapiTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/terminalEnterpriseReadingUxState.test.ts',
        'tests/terminalDepositReadWorkbench.test.ts',
        'tests/conversationTerminalHandoff.test.tsx',
        'tests/terminalTransactionQuery.test.ts',
        'tests/terminalPipelineHarnessClient.test.ts',
        'tests/pipelineExecutionLogHeader.test.tsx',
        'tests/terminalUxBrowserProof.test.tsx',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V39 enterprise Reading UX state uapi tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V39 Gate 3 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-enterprise-reading-ux-state', 'Gate 3 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.enterpriseReadingUxState.v1', 'Gate 3 schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Gate 3 artifact must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Gate 3 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-enterprise-reading-ux-metadata',
      'Gate 3 artifact must declare source-safe enterprise Reading UX metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 9, 'Gate 3 must cover nine enterprise Reading UX rows.');
    assertCheck(failures, artifact.coverage.stepCount === 5, 'Gate 3 must cover five enterprise Reading stages.');
    assertCheck(failures, artifact.coverage.routeStageContractCovered === true, 'Gate 3 must cover route stage contract.');
    assertCheck(failures, artifact.coverage.streamLogIntegrationCovered === true, 'Gate 3 must cover stream-log integration.');
    assertCheck(failures, artifact.coverage.componentTestsCovered === true, 'Gate 3 must cover component tests.');
    assertCheck(failures, artifact.coverage.browserProofWorkflowCovered === true, 'Gate 3 must cover browser proof workflow.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 3 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.lowDetailDefault === true, 'Gate 3 must default to low-detail guidance.');
    assertCheck(failures, artifact.coverage.expandableSourceSafeDetail === true, 'Gate 3 must preserve expandable source-safe detail.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 3 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 3 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.ledgerAuthorityClaimed === false, 'Gate 3 artifact must not claim ledger authority.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 3 must not rely on legacy source roots.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 3 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V39.md');
  const parity = read(root, 'BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const terminalReadme = read(root, 'uapi/app/terminal/README.md');
  assertCheck(failures, spec.includes('TerminalEnterpriseReadingUxState'), 'V39 spec must name TerminalEnterpriseReadingUxState.');
  assertCheck(failures, spec.includes('readingStage'), 'V39 spec must describe source-safe readingStage route state.');
  assertCheck(failures, parity.includes('Gate 3 Parity'), 'V39 parity matrix must include Gate 3 parity.');
  assertCheck(failures, terminalReadme.includes('TerminalEnterpriseReadingUxState'), 'Terminal README must document Gate 3 state contract.');

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 3 enterprise Reading UX state check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 3 enterprise Reading UX state ok artifact=${artifact.artifactRoot}\n`);
}

main();
