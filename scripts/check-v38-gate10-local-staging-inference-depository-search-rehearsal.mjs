#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v38-local-staging-inference-depository-search-rehearsal.json';

const REQUIRED_ROW_IDS = [
  'lane:local-reading-inference-rehearsal',
  'lane:staging-testnet-reading-inference-rehearsal',
  'pipeline:read-need-and-read-fits-finding-rehearsal',
  'search:depository-many-fits-rehearsal',
  'assetpack:source-safe-preview-rehearsal',
  'telemetry:streaming-readback-rehearsal',
  'inference:real-credential-gated-rehearsal',
  'boundary:value-bearing-mainnet-blocked-rehearsal',
];

const REQUIRED_LANE_IDS = ['local', 'staging-testnet'];

const REQUIRED_PROOF_ARTIFACTS = [
  '.bitcode/v38-inference-surface-inventory.json',
  '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
  '.bitcode/v38-prompt-benchmark-report.json',
  '.bitcode/v38-disclosure-boundary-report.json',
  '.bitcode/v38-read-need-comprehension-inference-hardening.json',
  '.bitcode/v38-read-fits-finding-search-embeddings.json',
  '.bitcode/v38-assetpack-synthesis-economic-traceability.json',
  '.bitcode/v38-conversation-tool-prompt-inference-parity.json',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  [['eyJ', 'hbGciOi'].join(''), ['JIUz', 'I1Ni'].join('')].join(''),
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

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipPackageTests: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') continue;
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v38-gate10-local-staging-inference-depository-search-rehearsal.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V38 Gate 10 source-safe local/staging inference and depository-search rehearsal evidence across Reading pipelines, Vercel Sandbox harness, route preflight, telemetry streaming, AssetPack preview, and blocked value-bearing mainnet posture.',
      'Use --skip-package-tests only in lightweight workflow posture jobs that do not install pnpm dependencies.',
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
    pointer === 'V37',
    `BITCODE_SPEC.txt must remain V37 during V38 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v38' || /^v38\/gate-(?:10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 10+ work must occur on version/v38 or v38/gate-10..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    ...REQUIRED_PROOF_ARTIFACTS,
    'packages/specifying/src/canonical/local-staging-inference-depository-search-rehearsal.js',
    'packages/specifying/test/v38-local-staging-inference-depository-search-rehearsal.test.js',
    'scripts/generate-v38-local-staging-inference-depository-search-rehearsal.mjs',
    'scripts/check-v38-gate10-local-staging-inference-depository-search-rehearsal.mjs',
    'packages/pipeline-hosts/src/dev/run-asset-pack-sandbox-host.ts',
    'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
    'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
    'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/domain/src/embedding-config.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/depository-search.test.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-contract.test.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-observability.test.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-disclosure.test.ts',
    'apps/uapi/app/api/pipeline-host/asset-pack/preflight.ts',
    'apps/uapi/app/api/pipeline-host/asset-pack/runner.ts',
    'apps/uapi/tests/api/pipelineHostRoute.test.ts',
    'apps/uapi/tests/api/pipelineHostPreflight.test.ts',
    'apps/uapi/tests/terminalPipelineHarnessClient.test.ts',
    'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
    'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
    'BITCODE_SPEC_V38.md',
    'BITCODE_SPEC_V38_DELTA.md',
    'BITCODE_SPEC_V38_NOTES.md',
    'BITCODE_SPEC_V38_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 10 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v38-read-need-comprehension-inference-hardening.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-read-fits-finding-search-embeddings.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-assetpack-synthesis-economic-traceability.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-conversation-tool-prompt-inference-parity.mjs', '--check']);
      run(root, 'node', ['scripts/generate-v38-local-staging-inference-depository-search-rehearsal.mjs', '--check']);
    } catch (error) {
      failures.push(`V38 Gate 10 artifact freshness check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'packages/specifying/test/v38-local-staging-inference-depository-search-rehearsal.test.js',
      ]);
    } catch (error) {
      failures.push(`V38 local/staging inference rehearsal protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/pipeline-hosts',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/__tests__/asset-pack-host-plan.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/asset-packs-pipelines-domain',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/__tests__/depository-search.test.ts',
        'src/__tests__/reading-pipeline-observability.test.ts',
        'src/__tests__/reading-pipeline-contract.test.ts',
        'src/__tests__/asset-pack-disclosure.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/api/pipelineHostRoute.test.ts',
        'tests/api/pipelineHostPreflight.test.ts',
        'tests/terminalPipelineHarnessClient.test.ts',
        'tests/pipelineExecutionLogHeader.test.tsx',
        '--runInBand',
      ]);
      run(root, 'pnpm', ['--filter', '@bitcode/api', 'build']);
    } catch (error) {
      failures.push(`V38 Gate 10 package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V38 Gate 10 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-local-staging-inference-depository-search-rehearsal', 'Gate 10 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.localStagingInferenceDepositorySearchRehearsal.v1', 'Gate 10 schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'Gate 10 artifact must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'Gate 10 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-local-staging-inference-depository-search-rehearsal-metadata',
      'Gate 10 artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.rowIds, REQUIRED_ROW_IDS), 'Gate 10 artifact must cover all rehearsal rows.');
    assertCheck(failures, includesAll(artifact.laneIds, REQUIRED_LANE_IDS), 'Gate 10 artifact must cover local and staging-testnet lanes.');
    assertCheck(failures, includesAll(artifact.requiredProofArtifacts, REQUIRED_PROOF_ARTIFACTS), 'Gate 10 artifact must bind upstream proof artifacts.');
    assertCheck(failures, artifact.coverage.rowCount === 8, 'Gate 10 row count must be 8.');
    assertCheck(failures, artifact.coverage.laneCount === 2, 'Gate 10 lane count must be 2.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Gate 10 artifact must have no failed predicates.');
    assertCheck(failures, artifact.coverage.missingSourceRoots.length === 0, 'Gate 10 artifact must have no missing source roots.');
    assertCheck(failures, artifact.coverage.missingProofArtifacts.length === 0, 'Gate 10 artifact must have no missing upstream proof artifacts.');
    assertCheck(failures, artifact.coverage.localRehearsalCovered === true, 'Gate 10 must cover local rehearsal.');
    assertCheck(failures, artifact.coverage.stagingTestnetRehearsalCovered === true, 'Gate 10 must cover staging-testnet rehearsal.');
    assertCheck(failures, artifact.coverage.readNeedComprehensionCovered === true, 'Gate 10 must cover ReadNeedComprehensionSynthesis.');
    assertCheck(failures, artifact.coverage.readFitsFindingCovered === true, 'Gate 10 must cover ReadFitsFindingSynthesis.');
    assertCheck(failures, artifact.coverage.depositoryManyFitsCovered === true, 'Gate 10 must cover many-fit depository search.');
    assertCheck(failures, artifact.coverage.embeddingPolicyCovered === true, 'Gate 10 must cover embedding policy.');
    assertCheck(failures, artifact.coverage.sourceSafePreviewCovered === true, 'Gate 10 must cover source-safe preview.');
    assertCheck(failures, artifact.coverage.telemetryStreamingCovered === true, 'Gate 10 must cover telemetry streaming.');
    assertCheck(failures, artifact.coverage.realInferenceCredentialGatedCovered === true, 'Gate 10 must cover real inference credential gates.');
    assertCheck(failures, artifact.coverage.databaseLedgerReadbackCovered === true, 'Gate 10 must cover database/ledger readback.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetVisibleAndBlocked === true, 'Gate 10 must keep value-bearing mainnet blocked.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 10 artifact must be metadata-only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Protected source must not be visible.');
    assertCheck(failures, artifact.coverage.rawPromptTextSerialized === false, 'Raw prompt text must not be serialized.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Raw provider response must not be visible.');
    assertCheck(failures, artifact.coverage.liveLogPayloadSerialized === false, 'Live log payloads must not be serialized.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Unpaid AssetPack source must not be visible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Credentials must not be serialized.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Wallet private material must not be visible.');
    assertCheck(failures, artifact.coverage.privateSettlementPayloadVisible === false, 'Private settlement payloads must not be visible.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Gate 10 must not admit value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 10 artifact must not point at _legacy roots.');
  }

  const spec = read(root, 'BITCODE_SPEC_V38.md');
  const delta = read(root, 'BITCODE_SPEC_V38_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V38_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V38_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const index = read(root, 'packages/specifying/src/index.js');
  const typeDefs = read(root, 'packages/specifying/src/index.d.ts');

  assertCheck(failures, spec.includes('V38LocalStagingInferenceDepositorySearchRehearsal'), 'V38 spec must name the Gate 10 report.');
  assertCheck(failures, delta.includes('source-safe-local-staging-inference-depository-search-rehearsal-metadata'), 'V38 delta must include Gate 10 source-safety verdict.');
  assertCheck(failures, notes.includes('V38LocalStagingInferenceDepositorySearchRehearsal'), 'V38 notes must name the Gate 10 report.');
  assertCheck(failures, parity.includes('| Local staging inference and depository search rehearsal | Gate 10 |') && parity.includes('| closed |'), 'V38 parity must close the Gate 10 row.');
  assertCheck(failures, roadmap.includes('V38 Gate 10 closure anchor'), 'Roadmap must include the Gate 10 closure anchor.');
  assertCheck(failures, readme.includes('check:v38-gate10'), 'README must document the Gate 10 check.');
  assertCheck(failures, protocolReadme.includes('v38-local-staging-inference-depository-search-rehearsal'), 'Protocol README must document the Gate 10 artifact.');
  assertCheck(failures, packageJson.includes('check:v38-gate10') && packageJson.includes('generate:v38-local-staging-inference-depository-search-rehearsal'), 'package.json must expose Gate 10 scripts.');
  assertCheck(failures, gateWorkflow.includes('check:v38-gate10') && gateWorkflow.includes('v38-local-staging-inference-depository-search-rehearsal.test.js'), 'Gate workflow must run Gate 10 checks/tests.');
  assertCheck(failures, canonWorkflow.includes('check:v38-gate10'), 'Canon workflow must run Gate 10 check.');
  assertCheck(failures, index.includes('buildV38LocalStagingInferenceDepositorySearchRehearsal'), 'Protocol JS index must export Gate 10 builder.');
  assertCheck(failures, typeDefs.includes('buildV38LocalStagingInferenceDepositorySearchRehearsal'), 'Protocol type index must export Gate 10 builder.');

  if (failures.length) {
    process.stderr.write('V38 Gate 10 local/staging inference depository-search rehearsal check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V38 Gate 10 local/staging inference depository-search rehearsal ok rows=8 lanes=2\n');
}

main();
