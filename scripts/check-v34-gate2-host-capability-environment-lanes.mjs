#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const HOST_ARTIFACT = '.bitcode/v34-deployment-host-capability-catalog.json';
const LANE_ARTIFACT = '.bitcode/v34-environment-lane-contracts.json';

const REQUIRED_HOST_IDS = [
  'website',
  'api',
  'mcp_api',
  'chatgpt_app',
  'pipeline_workers',
  'runtime_observers',
  'ledger_broadcasters',
  'proof_services',
  'repair_jobs',
  'object_storage',
  'database_projection',
  'ledger_projection',
];

const REQUIRED_LANE_IDS = [
  'local',
  'regtest',
  'signet',
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
      'Usage: node scripts/check-v34-gate2-host-capability-environment-lanes.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V34 Gate 2 Host Capability And Environment Lane Catalog source, generated artifacts, tests, docs, package scripts, and workflow wiring.',
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V33',
    `BITCODE_SPEC.txt must remain V33 during V34 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v34' || /^v34\/gate-(?:[2-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 Gate 2+ work must occur on version/v34 or v34/gate-2..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    HOST_ARTIFACT,
    LANE_ARTIFACT,
    'packages/btd/src/deployment-host-capability-catalog.ts',
    'packages/btd/src/index.ts',
    'packages/btd/__tests__/deployment-host-capability-catalog.test.ts',
    'scripts/generate-v34-host-capability-environment-lanes.mjs',
    'scripts/check-v34-gate2-host-capability-environment-lanes.mjs',
    'specifications/BITCODE_SPEC_V34.md',
    'specifications/BITCODE_SPEC_V34_DELTA.md',
    'specifications/BITCODE_SPEC_V34_NOTES.md',
    'specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V34 Gate 2 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v34-host-capability-environment-lanes']);
    } catch (error) {
      failures.push(`V34 Gate 2 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedHostArtifact = fileExists(root, HOST_ARTIFACT) ? read(root, HOST_ARTIFACT) : '';
  const serializedLaneArtifact = fileExists(root, LANE_ARTIFACT) ? read(root, LANE_ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedHostArtifact.includes(marker), `V34 host artifact must not contain secret marker ${marker}.`);
    assertCheck(failures, !serializedLaneArtifact.includes(marker), `V34 lane artifact must not contain secret marker ${marker}.`);
  }

  const hostArtifact = serializedHostArtifact ? JSON.parse(serializedHostArtifact) : null;
  const laneArtifact = serializedLaneArtifact ? JSON.parse(serializedLaneArtifact) : null;

  if (hostArtifact) {
    assertCheck(failures, hostArtifact.artifactId === 'v34-deployment-host-capability-catalog', 'Host artifactId must match.');
    assertCheck(failures, hostArtifact.schemaId === 'bitcode.v34.deploymentHostCapabilityCatalog.v1', 'Host schemaId must match.');
    assertCheck(failures, hostArtifact.version === 'V34' && hostArtifact.currentTarget === 'V33', 'Host artifact must bind V34 over active V33.');
    assertCheck(failures, hostArtifact.passed === true, 'Host artifact must pass.');
    assertCheck(
      failures,
      hostArtifact.sourceSafetyVerdict === 'source-safe-deployment-host-capability-metadata',
      'Host artifact must be source-safe deployment host metadata.',
    );
    assertCheck(failures, includesAll(hostArtifact.requiredHostIds, REQUIRED_HOST_IDS), 'Host artifact must enumerate every required host.');
    assertCheck(failures, includesAll(hostArtifact.coverage.observedHostIds, REQUIRED_HOST_IDS), 'Host coverage must observe every host.');
    assertCheck(failures, hostArtifact.coverage.hostCount === 12, 'Host artifact must prove twelve host rows.');
    assertCheck(failures, hostArtifact.coverage.objectStorageRepresented === true, 'Host artifact must represent object storage.');
    assertCheck(failures, hostArtifact.coverage.databaseProjectionRepresented === true, 'Host artifact must represent database projection.');
    assertCheck(failures, hostArtifact.coverage.ledgerProjectionRepresented === true, 'Host artifact must represent ledger projection.');
    assertCheck(failures, hostArtifact.coverage.credentialsSerialized === false, 'Host artifact must not serialize credentials.');
    assertCheck(failures, hostArtifact.coverage.protectedSourceVisible === false, 'Host artifact must not expose source-bearing payloads.');
    assertCheck(
      failures,
      hostArtifact.rows.every((row) => /^v34-deployment-host-capability-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Host rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      hostArtifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Host source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      hostArtifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Host test evidence tokens must all be present.',
    );
  }

  if (laneArtifact) {
    assertCheck(failures, laneArtifact.artifactId === 'v34-environment-lane-contracts', 'Lane artifactId must match.');
    assertCheck(failures, laneArtifact.schemaId === 'bitcode.v34.environmentLaneContracts.v1', 'Lane schemaId must match.');
    assertCheck(failures, laneArtifact.version === 'V34' && laneArtifact.currentTarget === 'V33', 'Lane artifact must bind V34 over active V33.');
    assertCheck(failures, laneArtifact.passed === true, 'Lane artifact must pass.');
    assertCheck(
      failures,
      laneArtifact.sourceSafetyVerdict === 'source-safe-environment-lane-contract-metadata',
      'Lane artifact must be source-safe environment lane metadata.',
    );
    assertCheck(failures, includesAll(laneArtifact.requiredLaneIds, REQUIRED_LANE_IDS), 'Lane artifact must enumerate every required lane.');
    assertCheck(failures, includesAll(laneArtifact.coverage.observedLaneIds, REQUIRED_LANE_IDS), 'Lane coverage must observe every lane.');
    assertCheck(failures, laneArtifact.coverage.laneCount === 7, 'Lane artifact must prove seven lane rows.');
    assertCheck(
      failures,
      laneArtifact.coverage.valueBearingMainnetAdmission === 'blocked_future_canon_required',
      'Lane artifact must keep value-bearing mainnet blocked.',
    );
    assertCheck(
      failures,
      laneArtifact.coverage.valueBearingMainnetAdmittedHostCount === 0,
      'Lane artifact must not admit hosts in value-bearing mainnet.',
    );
    assertCheck(
      failures,
      laneArtifact.coverage.mainnetReadyDryRunAdmission === 'dry_run_only',
      'Lane artifact must keep mainnet-ready dry run non-value-bearing.',
    );
    assertCheck(failures, laneArtifact.coverage.credentialsSerialized === false, 'Lane artifact must not serialize credentials.');
    assertCheck(failures, laneArtifact.coverage.protectedSourceVisible === false, 'Lane artifact must not expose source-bearing payloads.');
    assertCheck(
      failures,
      laneArtifact.lanes.every((lane) => /^v34-environment-lane-contract:[a-f0-9]{24}$/u.test(lane.laneRoot)),
      'Lane rows must have deterministic lane roots.',
    );
    assertCheck(
      failures,
      laneArtifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Lane source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      laneArtifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Lane test evidence tokens must all be present.',
    );
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V34.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const source = read(root, 'packages/btd/src/deployment-host-capability-catalog.ts');
  const test = read(root, 'packages/btd/__tests__/deployment-host-capability-catalog.test.ts');
  const specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(HOST_ARTIFACT), `V34 docs must mention ${HOST_ARTIFACT}.`);
    assertCheck(failures, doc.includes(LANE_ARTIFACT), `V34 docs must mention ${LANE_ARTIFACT}.`);
    assertCheck(failures, doc.includes('DeploymentHostCapabilityCatalog'), 'V34 docs must name DeploymentHostCapabilityCatalog.');
    assertCheck(failures, doc.includes('EnvironmentLaneContract'), 'V34 docs must name EnvironmentLaneContract.');
    assertCheck(failures, doc.includes('value-bearing-mainnet'), 'V34 docs must name value-bearing-mainnet.');
    assertCheck(failures, doc.includes('blocked_future_canon_required'), 'V34 docs must name blocked_future_canon_required.');
  }

  assertCheck(
    failures,
    /Current working gate: V34 Gate (?:[3-9]|10)\b/u.test(roadmap),
    'Roadmap must advance past V34 Gate 2 after this gate closes.',
  );
  assertCheck(failures, packageJson.includes('"generate:v34-host-capability-environment-lanes"'), 'package.json must expose the Gate 2 generator.');
  assertCheck(failures, packageJson.includes('"check:v34-host-capability-environment-lanes"'), 'package.json must expose the Gate 2 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v34-gate2"'), 'package.json must expose check:v34-gate2.');
  assertCheck(failures, workflow.includes('check-v34-gate2-host-capability-environment-lanes.mjs'), 'Gate workflow must run the V34 Gate 2 checker.');
  assertCheck(failures, workflow.includes('deployment-host-capability-catalog.test.ts'), 'Gate workflow must run the focused deployment host/lane test.');
  assertCheck(failures, specifying.includes(HOST_ARTIFACT), 'Spec-family profile must include the host artifact path.');
  assertCheck(failures, specifying.includes(LANE_ARTIFACT), 'Spec-family profile must include the lane artifact path.');

  for (const phrase of [
    'buildDeploymentHostCapabilityCatalog',
    'buildEnvironmentLaneContracts',
    'DEPLOYMENT_HOST_CAPABILITY_IDS',
    'ENVIRONMENT_LANE_CONTRACT_IDS',
    'pipeline_workers',
    'runtime_observers',
    'ledger_broadcasters',
    'object_storage',
    'database_projection',
    'ledger_projection',
    'blocked_future_canon_required',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 2 source must include ${phrase}.`);
  }

  for (const phrase of [
    'catalogs website, API, MCP API, ChatGPT App, workers, observers, broadcasters, proof services, repair jobs, and storage projections',
    'catalogs local, regtest, signet, staging-testnet, public testnet, mainnet dry run, and blocked value-bearing mainnet lanes',
    'keeps value-bearing mainnet visible as blocked and without admitted runtime hosts',
    'fails closed when a required deployment host row is missing',
    'fails closed when value-bearing mainnet admits hosts or stops being blocked',
    'fails closed on secret-shaped or non-disclosable source catalog text',
  ]) {
    assertCheck(failures, test.includes(phrase), `Gate 2 test must assert: ${phrase}.`);
  }

  if (failures.length) {
    process.stderr.write('V34 Gate 2 Host Capability And Environment Lane Catalog check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`V34 Gate 2 Host Capability And Environment Lane Catalog ok ${HOST_ARTIFACT} ${LANE_ARTIFACT}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
