#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v42-depositing-shortest-path.json';

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
    skipPackageTests: false,
    skipUapiTests: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
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
      'Usage: node scripts/check-v42-gate2-depositing-shortest-path.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V42 Gate 2 Depositing shortest path, source-safe admission proof, compensation visibility, generated artifact, docs, and focused tests.',
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
    pointer === 'V41',
    `BITCODE_SPEC.txt must remain V41 during V42 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v42' || /^v42\/gate-(?:2|[3-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V42 Gate 2+ work must occur on version/v42 or v42/gate-2..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/depository-supply-index.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/depository-supply-index.test.ts',
    'packages/asset-packs-pipelines/domain/README.md',
    'scripts/specifying/src/canonical/v42-depositing-shortest-path.js',
    'scripts/specifying/test/v42-depositing-shortest-path.test.js',
    'scripts/specifying/test/specifying-package-boundary.test.js',
    'scripts/specifying/server.js',
    'scripts/specifying/src/bitcode-demo.js',
    'apps/uapi/app/api/deposits/route.ts',
    'apps/uapi/app/ (removed cockpit tree) TerminalDepositComposer.tsx',
    'apps/uapi/app/ (removed cockpit tree) terminal-activity-history.ts',
    'apps/uapi/app/ (removed cockpit tree) terminal-deposit-read-workbench.ts',
    'apps/uapi/app/ (removed cockpit tree) terminal-run-data.ts',
    'scripts/generate-v42-depositing-shortest-path.mjs',
    'scripts/check-v42-gate2-depositing-shortest-path.mjs',
    '.specifications/BITCODE_SPEC_V42.md',
    '.specifications/BITCODE_SPEC_V42_DELTA.md',
    '.specifications/BITCODE_SPEC_V42_NOTES.md',
    '.specifications/BITCODE_SPEC_V42_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V42 Gate 2 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v42-depositing-shortest-path.mjs', '--check']);
    } catch (error) {
      failures.push(`V42 Depositing shortest path artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v42-depositing-shortest-path.test.js',
        'scripts/specifying/test/specifying-package-boundary.test.js',
      ]);
    } catch (error) {
      failures.push(`V42 Depositing shortest path protocol tests failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/asset-packs-pipelines-domain',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/__tests__/depository-supply-index.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`Depository supply package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V42 Gate 2 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v42-depositing-shortest-path', 'Gate 2 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v42.depositingShortestPath.v1', 'Gate 2 schemaId must match.');
    assertCheck(failures, artifact.version === 'V42' && artifact.currentTarget === 'V41', 'Gate 2 artifact must bind V42 over active V41.');
    assertCheck(failures, artifact.passed === true, 'Gate 2 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-depositing-compensation-visibility-metadata',
      'Gate 2 artifact must declare source-safe compensation visibility metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 8, 'Gate 2 must cover eight Depositing rows.');
    assertCheck(failures, artifact.coverage.routeApiContractsCovered === true, 'Gate 2 must cover route/API contracts.');
    assertCheck(failures, artifact.coverage.sourceValidationCovered === true, 'Gate 2 must cover source validation.');
    assertCheck(failures, artifact.coverage.storageProjectionCovered === true, 'Gate 2 must cover storage projection.');
    assertCheck(failures, artifact.coverage.depositorySearchDocumentCovered === true, 'Gate 2 must cover Depository search documents.');
    assertCheck(failures, artifact.coverage.sourceToSharesCompensationReadbackCovered === true, 'Gate 2 must cover source-to-shares compensation readback.');
    assertCheck(failures, artifact.coverage.terminalCompensationVisibilityCovered === true, 'Gate 2 must cover product compensation visibility.');
    assertCheck(failures, artifact.coverage.localStagingRehearsalCovered === true, 'Gate 2 must cover local/staging rehearsal posture.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 2 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 2 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.btdMintedAtDepositAdmission === false, 'Gate 2 must not mint BTD at deposit admission.');
    assertCheck(failures, artifact.coverage.btdRightsTransferredBeforeSettlement === false, 'Gate 2 must not transfer BTD rights before settlement.');
    assertCheck(failures, artifact.coverage.compensationAllocationMethod === 'source-to-shares-largest-remainder', 'Gate 2 must bind source-to-shares allocation.');
    assertCheck(failures, artifact.coverage.compensationPriceAsset === 'BTC', 'Gate 2 must bind BTC compensation visibility.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 2 must not rely on legacy source roots.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 2 predicates must all pass.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V42.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V42_PARITY_MATRIX.md');
  const readme = read(root, 'packages/asset-packs-pipelines/domain/README.md');
  assertCheck(failures, spec.includes('V42 Gate 2') && spec.includes('compensation route preview'), 'V42 spec must expand Gate 2 compensation route preview.');
  assertCheck(failures, parity.includes('Gate 2') && parity.includes('implemented'), 'V42 parity matrix must mark Gate 2 implemented.');
  assertCheck(failures, readme.includes('compensation preview') && readme.includes('source-to-shares'), 'AssetPack README must document compensation preview.');

  if (failures.length > 0) {
    process.stderr.write(`V42 Gate 2 Depositing shortest path check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V42 Gate 2 Depositing shortest path ok artifact=${artifact.artifactRoot}\n`);
}

main();
