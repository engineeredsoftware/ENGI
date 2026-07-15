#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v40-api-integration-contracts.json';

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
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipIntegrationTests: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-integration-tests') args.skipIntegrationTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v40-gate4-api-integration-contracts.mjs [--skip-branch-check] [--skip-integration-tests] [--repo-root <path>]',
      '',
      'Checks V40 Gate 4 API integration contract artifact freshness, source-safe metadata, docs, workflows, and protocol exports.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function runIntegrationSmoke(root, failures) {
  const commands = [
    ['pnpm', ['--filter', '@bitcode/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v40-api-integration-contracts.test.js']],
    ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', 'tests/api/readReviewRoute.test.ts', 'tests/api/pipelineHostRoute.test.ts', 'tests/api/conversationsRoute.test.ts', 'tests/api/vcsRoutes.test.ts', 'tests/api/walletOAuthRoutes.test.ts', 'tests/api/webhookSignature.test.ts']],
    ['pnpm', ['--filter', '@bitcode/api', 'test']],
    ['pnpm', ['--dir', 'apps/mcp', 'run', 'test:mcp']],
    ['pnpm', ['--dir', 'packages/chatgptapp', 'test']],
  ];

  for (const [command, args] of commands) {
    try {
      run(root, command, args);
    } catch (error) {
      failures.push(`API integration smoke failed for ${command} ${args.join(' ')}: ${error.stderr || error.message}`);
      return;
    }
  }
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

  assertCheck(failures, pointer === 'V39', `BITCODE_SPEC.txt must remain V39 during V40 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v40' || /^v40\/gate-(?:4|[5-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V40 Gate 4+ work must occur on version/v40 or v40/gate-4..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v40-api-integration-contracts.js',
    'scripts/specifying/test/v40-api-integration-contracts.test.js',
    'scripts/generate-v40-api-integration-contracts.mjs',
    'scripts/check-v40-gate4-api-integration-contracts.mjs',
    'BITCODE_SPEC_V40.md',
    'BITCODE_SPEC_V40_DELTA.md',
    'BITCODE_SPEC_V40_NOTES.md',
    'BITCODE_SPEC_V40_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V40 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v40-api-integration-contracts.mjs', '--check']);
    } catch (error) {
      failures.push(`V40 API integration contract artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v40-api-integration-contracts.test.js',
      ]);
    } catch (error) {
      failures.push(`V40 API integration contract protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipIntegrationTests) {
    runIntegrationSmoke(root, failures);
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V40 Gate 4 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v40-api-integration-contracts', 'Gate 4 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v40.apiIntegrationContracts.v1', 'Gate 4 schemaId must match.');
    assertCheck(failures, artifact.version === 'V40' && artifact.currentTarget === 'V39', 'Gate 4 artifact must bind V40 over active V39.');
    assertCheck(failures, artifact.passed === true, 'Gate 4 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-api-integration-contract-metadata',
      'Gate 4 artifact must declare source-safe API integration metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 10, 'Gate 4 must cover ten API integration rows.');
    assertCheck(failures, artifact.coverage.coveredRowCount === 10, 'Gate 4 API integration rows must all be covered.');
    assertCheck(failures, artifact.coverage.missingRowCount === 0, 'Gate 4 must not leave missing API integration rows.');
    assertCheck(failures, artifact.coverage.blockedRowCount === 0, 'Gate 4 must not leave blocked API integration rows.');
    assertCheck(failures, artifact.coverage.exemptRowCount === 0, 'Gate 4 must not rely on API integration exemptions.');
    assertCheck(failures, artifact.coverage.allCriticalSurfacesClosed === true, 'Gate 4 must close all critical API integration surfaces.');
    for (const field of [
      'uapiRouteContractsClosed',
      'packageApiContractsClosed',
      'mcpInterfaceContractsClosed',
      'chatgptInterfaceContractsClosed',
      'persistenceAuthorizationContractsClosed',
      'responseSchemaContractsClosed',
    ]) {
      assertCheck(failures, artifact.coverage[field] === true, `Gate 4 must set ${field}.`);
    }
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 4 artifact must stay source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 4 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetRequired === false, 'Gate 4 must not require value-bearing mainnet.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 4 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V40.md');
  const delta = read(root, 'BITCODE_SPEC_V40_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V40_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V40 Gate 4 API And Route Integration Contracts'), 'V40 spec must document Gate 4 API integration contracts.');
  assertCheck(failures, delta.includes('Gate 4 closes with package-backed `V40ApiIntegrationContracts`'), 'V40 delta must document Gate 4 closure.');
  assertCheck(failures, notes.includes('Gate 4 implementation notes'), 'V40 notes must document Gate 4 implementation notes.');
  assertCheck(failures, parity.includes('v40-api-integration-contracts'), 'V40 parity must document Gate 4 artifact.');
  assertCheck(failures, roadmap.includes('V40 Gate 4 closure anchor'), 'Roadmap must include V40 Gate 4 closure anchor.');

  if (failures.length > 0) {
    process.stderr.write(`V40 Gate 4 API integration contract check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V40 Gate 4 API integration contracts ok artifact=${artifact.artifactRoot}\n`);
}

main();
