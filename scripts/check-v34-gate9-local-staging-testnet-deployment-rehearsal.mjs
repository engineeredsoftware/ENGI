#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json';
const REQUIRED_REHEARSAL_IDS = [
  'local_full_stack_rehearsal',
  'staging_testnet_full_stack_rehearsal',
  'value_bearing_mainnet_blocked_rehearsal',
];
const REQUIRED_COVERAGE_FLAGS = [
  'localRehearsalCovered',
  'stagingTestnetRehearsalCovered',
  'terminalCovered',
  'publicApiCovered',
  'mcpApiCovered',
  'chatGptAppCovered',
  'readingPipelineExecutionReceiptsCovered',
  'settlementFinalitySimulationCovered',
  'storagePostureCovered',
  'repairPostureCovered',
  'sourceSafeLogsCovered',
  'screenshotsOrLogsProofRooted',
  'validationCommandsCovered',
  'proofRootsCovered',
];
const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  '-----BEGIN PRIVATE KEY-----',
  'wallet seed',
  'mnemonic',
  'raw source',
  'source contents',
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
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

function parseArgs(argv) {
  const args = { skipBranchCheck: false, repoRoot: defaultRepoRoot };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write('Usage: node scripts/check-v34-gate9-local-staging-testnet-deployment-rehearsal.mjs [--skip-branch-check] [--repo-root <path>]\n');
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();
  assertCheck(failures, pointer === 'V33', `BITCODE_SPEC.txt must remain V33 during V34 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v34' || /^v34\/gate-(?:9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 Gate 9+ work must occur on version/v34 or v34/gate-9..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/deployment-readiness-rehearsal.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/btd/__tests__/deployment-readiness-rehearsal.test.ts',
    'scripts/generate-v34-local-staging-testnet-deployment-rehearsal.mjs',
    'scripts/check-v34-gate9-local-staging-testnet-deployment-rehearsal.mjs',
    '.specifications/BITCODE_SPEC_V34.md',
    '.specifications/BITCODE_SPEC_V34_DELTA.md',
    '.specifications/BITCODE_SPEC_V34_NOTES.md',
    '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];
  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V34 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v34-local-staging-testnet-deployment-rehearsal']);
    } catch (error) {
      failures.push(`V34 Gate 9 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V34 rehearsal artifact must not contain secret/source marker ${marker}.`);
  }
  assertCheck(failures, !/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serializedArtifact), 'V34 rehearsal artifact must not contain env-assignment-shaped values.');

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v34-local-staging-testnet-deployment-rehearsal', 'Artifact id must match Gate 9 rehearsal.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v34.localStagingTestnetDeploymentRehearsal.v1', 'Artifact schema id must match.');
    assertCheck(failures, artifact.version === 'V34' && artifact.currentTarget === 'V33', 'Artifact must bind V34 over active V33.');
    assertCheck(failures, artifact.passed === true, 'Artifact must pass.');
    assertCheck(failures, artifact.sourceSafetyVerdict === 'source-safe-deployment-readiness-rehearsal-metadata', 'Artifact must be source-safe rehearsal metadata.');
    assertCheck(failures, includesAll(artifact.requiredRehearsalIds, REQUIRED_REHEARSAL_IDS), 'Artifact must enumerate every required rehearsal.');
    assertCheck(failures, includesAll(artifact.coverage.observedRehearsalIds, REQUIRED_REHEARSAL_IDS), 'Artifact coverage must observe every rehearsal.');
    assertCheck(failures, artifact.coverage.rehearsalCount === 3, 'Artifact must prove three rehearsals.');
    for (const flag of REQUIRED_COVERAGE_FLAGS) {
      assertCheck(failures, artifact.coverage[flag] === true, `Artifact coverage flag ${flag} must be true.`);
    }
    assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Rehearsal must not admit value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
    assertCheck(failures, artifact.rehearsals.every((rehearsal) => /^deployment-readiness-rehearsal:[a-f0-9]{24}$/u.test(rehearsal.rehearsalRoot)), 'Rehearsal rows must have deterministic roots.');
    assertCheck(failures, artifact.rehearsals.some((rehearsal) => rehearsal.laneId === 'local' && rehearsal.exercisedSurfaces.includes('terminal')), 'Local rehearsal must exercise product.');
    assertCheck(failures, artifact.rehearsals.some((rehearsal) => rehearsal.laneId === 'staging-testnet' && rehearsal.exercisedSurfaces.includes('reading_pipeline_execution_receipts')), 'Staging-testnet rehearsal must exercise Reading pipeline receipts.');
    assertCheck(failures, artifact.rehearsals.some((rehearsal) => rehearsal.laneId === 'value-bearing-mainnet' && rehearsal.admissionVerdict === 'blocked_value_bearing_mainnet'), 'Value-bearing mainnet must be explicitly blocked.');
    assertCheck(failures, artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)), 'Source evidence tokens must all be present.');
    assertCheck(failures, artifact.docsEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)), 'Docs evidence tokens must all be present.');
    assertCheck(failures, artifact.workflowEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)), 'Workflow evidence tokens must all be present.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V34.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const btdPackageJson = read(root, 'packages/btd/package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const source = read(root, 'packages/btd/src/deployment-readiness-rehearsal.ts');
  const test = read(root, 'packages/btd/__tests__/deployment-readiness-rehearsal.test.ts');
  const specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');
  const requiredTerms = ['DeploymentReadinessRehearsal', ARTIFACT, 'local full-stack deployment rehearsal', 'staging-testnet full-stack deployment rehearsal', 'value-bearing mainnet blocked rehearsal', 'product', 'public API', 'MCP API', 'ChatGPT App', 'Reading pipeline execution receipts', 'settlement/finality simulation', 'storage posture', 'repair posture'];
  for (const doc of [spec, delta, notes, parity]) {
    for (const term of requiredTerms) assertCheck(failures, doc.includes(term), `V34 docs must mention ${term}.`);
  }
  assertCheck(failures, roadmap.includes('Current working gate: V34 Gate 10'), 'Roadmap must advance current working gate to V34 Gate 10 after Gate 9 closure.');
  assertCheck(failures, roadmap.includes('V34 Gate 9 closure anchor'), 'Roadmap must mark Gate 9 as closed.');
  assertCheck(failures, packageJson.includes('generate:v34-local-staging-testnet-deployment-rehearsal'), 'Root package scripts must include Gate 9 generator.');
  assertCheck(failures, packageJson.includes('check:v34-local-staging-testnet-deployment-rehearsal'), 'Root package scripts must include Gate 9 artifact check.');
  assertCheck(failures, packageJson.includes('check:v34-gate9'), 'Root package scripts must include Gate 9 checker.');
  assertCheck(failures, packageJson.includes('qa:pipeline-readback'), 'Root package scripts must expose unversioned pipeline readback alias.');
  assertCheck(failures, btdPackageJson.includes('./deployment-readiness-rehearsal'), 'BTD package exports must expose deployment-readiness-rehearsal.');
  assertCheck(failures, gateWorkflow.includes('check-v34-gate9-local-staging-testnet-deployment-rehearsal.mjs'), 'Gate quality workflow must run Gate 9 checker.');
  assertCheck(failures, gateWorkflow.includes('deployment-readiness-rehearsal.test.ts'), 'Gate quality workflow must run Gate 9 focused test.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Canonical generated-artifact allowlist must include Gate 9 artifact.');
  assertCheck(failures, source.includes('DEPLOYMENT_READINESS_REHEARSAL_IDS'), 'Source must own required rehearsal ids.');
  assertCheck(failures, source.includes('buildDeploymentReadinessRehearsalSet'), 'Source must expose buildDeploymentReadinessRehearsalSet.');
  assertCheck(failures, test.includes('covers every interface, pipeline, settlement, storage, and repair surface for local and staging-testnet'), 'Tests must prove local/staging surface coverage.');
  assertCheck(failures, test.includes('keeps value-bearing mainnet blocked'), 'Tests must prove value-bearing mainnet block posture.');
  assertCheck(failures, test.includes('fails closed on serialized secret-shaped values'), 'Tests must prove secret-shaped values fail closed.');

  if (failures.length > 0) {
    process.stderr.write(`V34 Gate 9 Local Staging Testnet Deployment Rehearsal check failed:\n- ${failures.join('\n- ')}\n`);
    process.exit(1);
  }
  process.stdout.write('V34 Gate 9 Local Staging Testnet Deployment Rehearsal check passed.\n');
}

main();
