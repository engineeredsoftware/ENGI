#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v42-readfitsfinding-preview-quote.json';

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
    help: false,
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
      'Usage: node scripts/check-v42-gate5-readfitsfinding-preview-quote.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V42 Gate 5 ReadFitsFinding preview and quote closure: many-candidate search, selected-fit provenance, source-safe AssetPack preview, deterministic quote, no pre-settlement source exposure, Terminal readback, tests, docs, workflows, and proof artifact.',
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
      branch === 'version/v42' || /^v42\/gate-(?:5|[6-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V42 Gate 5+ work must occur on version/v42 or v42/gate-5..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/postprocess.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/depository-search.test.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-runtime.test.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-preview-boundary.test.ts',
    'apps/uapi/app/api/pipeline-host/asset-pack/runner.ts',
    'apps/uapi/app/terminal/TerminalDepositReadWorkbench.tsx',
    'apps/uapi/app/terminal/terminal-pipeline-host-client.ts',
    'apps/uapi/tests/api/pipelineHostRoute.test.ts',
    'apps/uapi/tests/terminalPipelineHarnessClient.test.ts',
    'packages/specifying/src/canonical/v42-readfitsfinding-preview-quote.js',
    'packages/specifying/test/v42-readfitsfinding-preview-quote.test.js',
    'scripts/generate-v42-readfitsfinding-preview-quote.mjs',
    'scripts/check-v42-gate5-readfitsfinding-preview-quote.mjs',
    'BITCODE_SPEC_V42.md',
    'BITCODE_SPEC_V42_DELTA.md',
    'BITCODE_SPEC_V42_NOTES.md',
    'BITCODE_SPEC_V42_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'apps/uapi/app/terminal/README.md',
    'packages/asset-packs-pipelines/domain/README.md',
    'packages/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V42 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v42-readfitsfinding-preview-quote.mjs', '--check']);
    } catch (error) {
      failures.push(`V42 ReadFitsFinding preview/quote artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'packages/specifying/test/v42-readfitsfinding-preview-quote.test.js',
      ]);
    } catch (error) {
      failures.push(`V42 ReadFitsFinding preview/quote protocol test failed: ${error.stderr || error.message}`);
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
        'src/__tests__/depository-search.test.ts',
        'src/__tests__/read-fits-finding-runtime.test.ts',
        'src/__tests__/asset-pack-preview-boundary.test.ts',
        'src/__tests__/postprocess.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V42 ReadFitsFinding preview/quote package tests failed: ${error.stderr || error.message}`);
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
        'tests/api/pipelineHostRoute.test.ts',
        'tests/terminalPipelineHarnessClient.test.ts',
        'tests/terminalDepositReadWorkbench.test.ts',
        '--runInBand',
      ]);
    } catch (error) {
      failures.push(`V42 ReadFitsFinding preview/quote UAPI tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V42 Gate 5 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v42-readfitsfinding-preview-quote', 'Gate 5 artifactId must match.');
    assertCheck(
      failures,
      artifact.schemaId === 'bitcode.v42.readFitsFindingPreviewQuote.v1',
      'Gate 5 schemaId must match.',
    );
    assertCheck(failures, artifact.version === 'V42' && artifact.currentTarget === 'V41', 'Gate 5 artifact must bind V42 over active V41.');
    assertCheck(failures, artifact.passed === true, 'Gate 5 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-readfitsfinding-preview-quote-metadata',
      'Gate 5 artifact must declare source-safe ReadFitsFinding preview/quote metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 12, 'Gate 5 must cover twelve ReadFitsFinding preview/quote rows.');
    assertCheck(failures, artifact.coverage.pipelineName === 'ReadFitsFindingSynthesis', 'Gate 5 must bind ReadFitsFindingSynthesis.');
    assertCheck(failures, artifact.coverage.requiredPriorPipelineName === 'ReadNeedComprehensionSynthesis', 'Gate 5 must bind accepted-Need prior pipeline.');
    assertCheck(failures, artifact.coverage.phaseCount === 7, 'Gate 5 must cover seven ReadFitsFindingSynthesis phases.');
    assertCheck(failures, artifact.coverage.agentCount === 8, 'Gate 5 must cover eight ReadFitsFindingSynthesis PTRR agents.');
    assertCheck(failures, artifact.coverage.ptrrStepCount === 32, 'Gate 5 must cover thirty-two PTRR steps.');
    assertCheck(failures, artifact.coverage.failsafeSequenceCount === 96, 'Gate 5 must cover ninety-six Failsafe sequences.');
    assertCheck(failures, artifact.coverage.thricifiedGenerationCount === 96, 'Gate 5 must cover ninety-six ThricifiedGeneration receipts.');
    assertCheck(failures, Array.isArray(artifact.coverage.searchChannelIds) && artifact.coverage.searchChannelIds.length === 7, 'Gate 5 must cover seven search channels.');
    assertCheck(failures, artifact.coverage.selectedFitProvenanceRequired === true, 'Gate 5 must require selected-fit provenance.');
    assertCheck(failures, artifact.coverage.sourceSafePreviewRequired === true, 'Gate 5 must require source-safe AssetPack preview.');
    assertCheck(failures, artifact.coverage.deterministicQuoteRequired === true, 'Gate 5 must require deterministic quote.');
    assertCheck(failures, artifact.coverage.noProtectedSourceBeforeSettlement === true, 'Gate 5 must block protected source before settlement.');
    assertCheck(failures, artifact.coverage.settlementInstructionsRequired === true, 'Gate 5 must require settlement instructions.');
    assertCheck(failures, artifact.coverage.productPreviewQuoteReadbackCovered === true, 'Gate 5 must cover Terminal preview/quote readback.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 5 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 5 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Gate 5 artifact must not expose protected prompts.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Gate 5 artifact must not expose raw provider responses.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 5 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Gate 5 artifact must not expose wallet private material.');
    assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Gate 5 artifact must not expose settlement private payloads.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 5 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 5 must not rely on legacy source roots.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 5 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V42.md');
  const parity = read(root, 'BITCODE_SPEC_V42_PARITY_MATRIX.md');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  assertCheck(failures, spec.includes('V42 Gate 5') && spec.includes('v42-readfitsfinding-preview-quote'), 'V42 spec must expand Gate 5 ReadFitsFinding preview/quote closure.');
  assertCheck(failures, parity.includes('Finding Fits preview and quote') && parity.includes('implemented'), 'V42 parity matrix must mark Finding Fits preview and quote implemented.');
  assertCheck(failures, terminalReadme.includes('V42 Gate 5') && terminalReadme.includes('Finding Fits preview'), 'Terminal README must document Gate 5 preview/quote readback.');

  if (failures.length > 0) {
    process.stderr.write(`V42 Gate 5 ReadFitsFinding preview/quote check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V42 Gate 5 ReadFitsFinding preview/quote ok artifact=${artifact.artifactRoot}\n`);
}

main();
