#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v40/browser-e2e-visual-proof.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  String.fromCharCode(101, 121, 74, 104, 98, 71, 99, 105, 79, 105, 74, 73, 85, 122, 73, 49, 78, 105),
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

function commandExists(root, command) {
  try {
    execFileSync('sh', ['-lc', `command -v ${command}`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipBrowserTests: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-browser-tests') args.skipBrowserTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v40-gate7-browser-e2e-visual-proof.mjs [--skip-branch-check] [--skip-browser-tests] [--repo-root <path>]',
      '',
      'Checks V40 Gate 7 browser E2E, visual, accessibility, responsive, and interaction-state proof.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function runBrowserProofSmoke(root, failures) {
  const commands = [
    ['node', ['--test', '--test-force-exit', 'scripts/specifying/test/v40-browser-e2e-visual-proof.test.js']],
  ];
  const pnpmCommands = [
    ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath',
      'tests/bitcodeBrowserProof.test.ts',
      'tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts',
      'tests/terminalUxBrowserProof.test.tsx',
      'tests/auxillariesContent.access.test.tsx',
      'tests/conversationTerminalHandoff.test.tsx',
      'tests/conversationStreamPipelineLog.test.tsx',
      'tests/exchangeTerminalHandoff.test.ts',
      'tests/publicDocsPageContent.test.tsx',
      '--runInBand',
    ]],
  ];
  if (commandExists(root, 'pnpm')) commands.push(...pnpmCommands);

  for (const [command, args] of commands) {
    try {
      run(root, command, args);
    } catch (error) {
      failures.push(`Browser proof smoke failed for ${command} ${args.join(' ')}: ${error.stderr || error.message}`);
      return;
    }
  }
}

function runOptionalBrowserTests(root, failures) {
  try {
    run(root, 'pnpm', ['--dir', 'apps/uapi', 'run', 'test:e2e:browser-proof']);
  } catch (error) {
    failures.push(`Browser proof Playwright lane failed: ${error.stderr || error.message}`);
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
      branch === 'version/v40' || /^v40\/gate-(?:7|8|9|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V40 Gate 7+ work must occur on version/v40 or v40/gate-7..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v40-browser-e2e-visual-proof.js',
    'scripts/specifying/test/v40-browser-e2e-visual-proof.test.js',
    'scripts/generate-v40-browser-e2e-visual-proof.mjs',
    'scripts/check-v40-gate7-browser-e2e-visual-proof.mjs',
    'apps/uapi/app/bitcode-browser-proof.ts',
    'apps/uapi/tests/bitcodeBrowserProof.test.ts',
    'apps/uapi/tests/e2e/bitcode-browser-proof.spec.ts',
    '.specifications/BITCODE_SPEC_V40.md',
    '.specifications/BITCODE_SPEC_V40_DELTA.md',
    '.specifications/BITCODE_SPEC_V40_NOTES.md',
    '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    'apps/uapi/package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V40 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v40-browser-e2e-visual-proof.mjs', '--check']);
    } catch (error) {
      failures.push(`V40 browser E2E visual proof artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    runBrowserProofSmoke(root, failures);
  }

  if (failures.length === 0 && !args.skipBrowserTests) {
    runOptionalBrowserTests(root, failures);
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V40 Gate 7 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v40-browser-e2e-visual-proof', 'Gate 7 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v40.browserE2eVisualProof.v1', 'Gate 7 schemaId must match.');
    assertCheck(failures, artifact.version === 'V40' && artifact.currentTarget === 'V39', 'Gate 7 artifact must bind V40 over active V39.');
    assertCheck(failures, artifact.passed === true, 'Gate 7 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-browser-e2e-visual-proof-metadata',
      'Gate 7 artifact must declare source-safe browser proof metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 8, 'Gate 7 must cover eight browser proof rows.');
    assertCheck(failures, artifact.coverage.coveredRowCount === 8, 'Gate 7 browser proof rows must all be covered.');
    assertCheck(failures, artifact.coverage.expectedTotals.productSurfaceCount === 5, 'Gate 7 must bind five product surfaces.');
    assertCheck(failures, artifact.coverage.expectedTotals.routeStateCount === 13, 'Gate 7 must bind thirteen route states.');
    assertCheck(failures, artifact.coverage.expectedTotals.viewportCount === 4, 'Gate 7 must bind four canonical viewports.');
    assertCheck(failures, artifact.coverage.expectedTotals.accessibilityAssertionCount === 8, 'Gate 7 must bind eight accessibility assertions.');
    assertCheck(failures, artifact.coverage.allCriticalSurfacesClosed === true, 'Gate 7 must close all critical browser proof surfaces.');
    for (const field of [
      'terminalBrowserFlowCoverageClosed',
      'conversationBrowserFlowCoverageClosed',
      'auxillariesBrowserFlowCoverageClosed',
      'exchangeBrowserFlowCoverageClosed',
      'docsBrowserFlowCoverageClosed',
      'responsiveViewportCoverageClosed',
      'visualBaselineCoverageClosed',
      'accessibilityCoverageClosed',
    ]) {
      assertCheck(failures, artifact.coverage[field] === true, `Gate 7 must set ${field}.`);
    }
    assertCheck(failures, artifact.coverage.screenshotOnlyApproval === false, 'Gate 7 must reject screenshot-only approval.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 7 artifact must stay source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 7 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 7 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetRequired === false, 'Gate 7 must not require value-bearing mainnet.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 7 predicates must all pass.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V40.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V40_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V40_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');

  assertCheck(failures, spec.includes('V40 Gate 7 Browser E2E, Accessibility, Responsive, And Visual Proof'), 'V40 spec must document Gate 7 browser proof.');
  assertCheck(failures, delta.includes('Gate 7 closes with package-backed `V40BrowserE2eVisualProof`'), 'V40 delta must document Gate 7 closure.');
  assertCheck(failures, notes.includes('Gate 7 implementation notes'), 'V40 notes must document Gate 7 implementation notes.');
  assertCheck(failures, parity.includes('v40-browser-e2e-visual-proof'), 'V40 parity must document Gate 7 artifact.');
  assertCheck(failures, roadmap.includes('V40 Gate 7 closure anchor'), 'Roadmap must include V40 Gate 7 closure anchor.');

  if (failures.length > 0) {
    process.stderr.write(`V40 Gate 7 browser E2E visual proof check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V40 Gate 7 browser E2E visual proof ok artifact=${artifact.artifactRoot}\n`);
}

main();
