#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v35/testnet-rollout-readiness-guide.json';

const REQUIRED_GUIDE_IDS = [
  'contributor_onboarding',
  'local_development',
  'operator_use',
  'enterprise_reader_flow',
  'depositor_flow',
  'interface_consumer_flow',
  'environment_lane_posture',
  'wallet_settlement_caveats',
  'known_blockers',
  'rehearsal_evidence',
];

const REQUIRED_LANE_IDS = [
  'local',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
  'value-bearing-mainnet',
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
      'Usage: node scripts/check-v35-gate7-developer-operator-testnet-rollout-guides.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 7 TestnetRolloutReadinessGuide source, generated artifact, tests, specs, docs, and workflow wiring.',
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
    pointer === 'V34',
    `BITCODE_SPEC.txt must remain V34 during V35 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v35' || /^v35\/gate-(?:[7-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 Gate 7+ work must occur on version/v35 or v35/gate-7..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/testnet-rollout-readiness-guide.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v35-testnet-rollout-readiness-guide.test.js',
    'scripts/generate-v35-testnet-rollout-readiness-guide.mjs',
    'scripts/check-v35-gate7-developer-operator-testnet-rollout-guides.mjs',
    'scripts/specifying/src/canonical/v21-specifying.js',
    '.specifications/BITCODE_SPEC_V35.md',
    '.specifications/BITCODE_SPEC_V35_DELTA.md',
    '.specifications/BITCODE_SPEC_V35_NOTES.md',
    '.specifications/BITCODE_SPEC_V35_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'apps/uapi/app/docs/bitcode-docs-content.ts',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V35 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v35-testnet-rollout-readiness-guide']);
    } catch (error) {
      failures.push(`V35 testnet rollout readiness artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'scripts/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v35-testnet-rollout-readiness-guide.test.js',
      ]);
    } catch (error) {
      failures.push(`V35 testnet rollout readiness package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V35 testnet rollout readiness guide must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v35-testnet-rollout-readiness-guide', 'Testnet rollout artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v35.testnetRolloutReadinessGuide.v1', 'Testnet rollout schemaId must match.');
    assertCheck(failures, artifact.version === 'V35' && artifact.currentTarget === 'V34', 'Testnet rollout guide must bind V35 over active V34.');
    assertCheck(failures, artifact.passed === true, 'Testnet rollout guide must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-rollout-guide-metadata',
      'Testnet rollout guide must be source-safe rollout guide metadata.',
    );
    assertCheck(failures, includesAll(artifact.coverage.observedGuideIds, REQUIRED_GUIDE_IDS), 'Rollout guide must enumerate every required guide id.');
    assertCheck(failures, includesAll(artifact.coverage.observedLaneIds, REQUIRED_LANE_IDS), 'Rollout guide must distinguish every required lane id.');
    assertCheck(failures, artifact.coverage.guideCount === REQUIRED_GUIDE_IDS.length, 'Rollout guide must prove ten guide rows.');
    assertCheck(failures, artifact.coverage.laneCount === REQUIRED_LANE_IDS.length, 'Rollout guide must prove five rollout lanes.');
    assertCheck(failures, artifact.coverage.localDistinguished === true, 'Rollout guide must distinguish local.');
    assertCheck(failures, artifact.coverage.stagingTestnetDistinguished === true, 'Rollout guide must distinguish staging-testnet.');
    assertCheck(failures, artifact.coverage.publicTestnetDistinguished === true, 'Rollout guide must distinguish public testnet.');
    assertCheck(failures, artifact.coverage.mainnetReadyDryRunDistinguished === true, 'Rollout guide must distinguish mainnet-ready dry run.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetVisibleAndBlocked === true, 'Rollout guide must keep value-bearing mainnet visible and blocked.');
    assertCheck(failures, artifact.coverage.missingSourceRoots.length === 0, 'Rollout guide must have no missing source roots.');
    assertCheck(failures, artifact.coverage.rowsMissingCommands.length === 0, 'Rollout guide rows must have reproducible commands.');
    assertCheck(failures, artifact.coverage.rowsMissingExamples.length === 0, 'Rollout guide rows must have examples.');
    assertCheck(failures, artifact.coverage.rowsMissingBlockers.length === 0, 'Rollout guide rows must have known blockers.');
    assertCheck(failures, artifact.coverage.rowsMissingRehearsalEvidence.length === 0, 'Rollout guide rows must have rehearsal evidence.');
    assertCheck(failures, artifact.coverage.valueBearingUnblockedRows.length === 0, 'Rollout guide must not unblock value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Rollout guide must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Rollout guide must not expose protected source.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Rollout guide must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Rollout guide must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Rollout guide must not expose wallet private material.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^testnet-rollout-guide-row:[a-f0-9]{24}$/u.test(row.guideRoot)),
      'Rollout guide rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Rollout guide source evidence roots must exist.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.validationCommands.length > 0 && row.failClosedResult.includes('blocks')),
      'Rollout guide rows must include validation commands and fail-closed result.',
    );
  }

  const protocolIndex = read(root, 'scripts/specifying/src/index.js');
  assertCheck(failures, protocolIndex.includes('buildTestnetRolloutReadinessGuide'), 'Protocol index must export buildTestnetRolloutReadinessGuide.');

  const packageTypes = read(root, 'scripts/specifying/src/index.d.ts');
  assertCheck(failures, packageTypes.includes('buildTestnetRolloutReadinessGuide'), 'Protocol type surface must export buildTestnetRolloutReadinessGuide.');

  const packageJson = read(root, 'package.json');
  assertCheck(failures, packageJson.includes('check:v35-gate7'), 'package.json must expose check:v35-gate7.');
  assertCheck(failures, packageJson.includes('generate:v35-testnet-rollout-readiness-guide'), 'package.json must expose rollout guide generator.');

  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  assertCheck(failures, workflow.includes('check-v35-gate7-developer-operator-testnet-rollout-guides.mjs'), 'Gate workflow must run V35 Gate 7 checker when present.');
  assertCheck(failures, workflow.includes('test/v35-testnet-rollout-readiness-guide.test.js'), 'Gate workflow must run V35 rollout guide package test.');

  const spec = read(root, '.specifications/BITCODE_SPEC_V35.md');
  assertCheck(failures, spec.includes('V35 TestnetRolloutReadinessGuide canon'), 'V35 spec must include TestnetRolloutReadinessGuide canon section.');
  assertCheck(failures, spec.includes(ARTIFACT_PATH), 'V35 spec must name testnet rollout readiness artifact.');

  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  assertCheck(failures, roadmap.includes('V35 Gate 7 closure anchor'), 'Roadmap must include V35 Gate 7 closure anchor.');

  const publicDocs = read(root, 'apps/uapi/app/docs/bitcode-docs-content.ts');
  assertCheck(failures, publicDocs.includes('testnet rollout readiness'), 'Public docs must mention testnet rollout readiness source-safe posture.');

  if (failures.length > 0) {
    process.stderr.write(`V35 Gate 7 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(`V35 Gate 7 developer/operator testnet rollout guide check passed for ${root}\n`);
}

main();
