#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v40/unit-coverage-inventory.json';

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
    skipPackageTests: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v40-gate3-unit-coverage.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V40 Gate 3 unit coverage inventory, generated artifact freshness, source-safe metadata, docs, workflows, and protocol exports.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function runPackageSmoke(root, failures) {
  const commands = [
    ['pnpm', ['--filter', '@bitcode/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v40-unit-coverage-inventory.test.js']],
    ['pnpm', ['--filter', '@bitcode/prompts', 'test']],
    ['pnpm', ['--filter', '@bitcode/agent-generics', 'test']],
    ['pnpm', ['--filter', '@bitcode/pipelines-generics', 'test']],
    ['pnpm', ['--filter', '@bitcode/pipeline-hosts', 'test']],
    ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'test']],
  ];

  for (const [command, args] of commands) {
    try {
      run(root, command, args);
    } catch (error) {
      failures.push(`Unit coverage package smoke failed for ${command} ${args.join(' ')}: ${error.stderr || error.message}`);
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V39', `BITCODE_SPEC.txt must remain V39 during V40 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v40' || /^v40\/gate-(?:3|[4-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V40 Gate 3+ work must occur on version/v40 or v40/gate-3..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v40-unit-coverage-inventory.js',
    'scripts/specifying/test/v40-unit-coverage-inventory.test.js',
    'scripts/generate-v40-unit-coverage-inventory.mjs',
    'scripts/check-v40-gate3-unit-coverage.mjs',
    '.specifications/BITCODE_SPEC_V40.md',
    '.specifications/BITCODE_SPEC_V40_DELTA.md',
    '.specifications/BITCODE_SPEC_V40_NOTES.md',
    '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V40 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v40-unit-coverage-inventory.mjs', '--check']);
    } catch (error) {
      failures.push(`V40 unit coverage artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v40-unit-coverage-inventory.test.js',
      ]);
    } catch (error) {
      failures.push(`V40 unit coverage protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    runPackageSmoke(root, failures);
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V40 Gate 3 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v40-unit-coverage-inventory', 'Gate 3 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v40.unitCoverageInventory.v1', 'Gate 3 schemaId must match.');
    assertCheck(failures, artifact.version === 'V40' && artifact.currentTarget === 'V39', 'Gate 3 artifact must bind V40 over active V39.');
    assertCheck(failures, artifact.passed === true, 'Gate 3 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-unit-coverage-metadata',
      'Gate 3 artifact must declare source-safe unit coverage metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 12, 'Gate 3 must cover twelve unit coverage rows.');
    assertCheck(failures, artifact.coverage.coveredRowCount === 12, 'Gate 3 unit rows must all be covered.');
    assertCheck(failures, artifact.coverage.missingRowCount === 0, 'Gate 3 must not leave missing unit rows.');
    assertCheck(failures, artifact.coverage.blockedRowCount === 0, 'Gate 3 must not leave blocked unit rows.');
    assertCheck(failures, artifact.coverage.exemptRowCount === 0, 'Gate 3 must not rely on unit coverage exemptions.');
    assertCheck(failures, artifact.coverage.allCriticalSurfacesClosed === true, 'Gate 3 must close all critical unit surfaces.');
    for (const field of [
      'packagePrimitiveCoverageClosed',
      'inferencePrimitiveCoverageClosed',
      'executionPipelineCoverageClosed',
      'readingImplementationCoverageClosed',
      'interfaceHelperCoverageClosed',
      'demonstrationBoundaryCoverageClosed',
    ]) {
      assertCheck(failures, artifact.coverage[field] === true, `Gate 3 must set ${field}.`);
    }
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 3 artifact must stay source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 3 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetRequired === false, 'Gate 3 must not require value-bearing mainnet.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 3 predicates must all pass.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V40.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V40_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V40_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V40 Gate 3 Unit Coverage For Packages And Primitives'), 'V40 spec must document Gate 3 unit coverage.');
  assertCheck(failures, delta.includes('Gate 3 closes with package-backed `V40UnitCoverageInventory`'), 'V40 delta must document Gate 3 closure.');
  assertCheck(failures, notes.includes('Gate 3 implementation notes'), 'V40 notes must document Gate 3 implementation notes.');
  assertCheck(failures, parity.includes('v40-unit-coverage-inventory'), 'V40 parity must document Gate 3 artifact.');
  assertCheck(failures, roadmap.includes('V40 Gate 3 closure anchor'), 'Roadmap must include V40 Gate 3 closure anchor.');

  if (failures.length > 0) {
    process.stderr.write(`V40 Gate 3 unit coverage check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V40 Gate 3 unit coverage ok artifact=${artifact.artifactRoot}\n`);
}

main();
