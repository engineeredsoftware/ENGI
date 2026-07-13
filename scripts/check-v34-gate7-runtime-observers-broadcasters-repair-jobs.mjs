#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json';

const REQUIRED_JOB_IDS = [
  'settlement_observer',
  'ledger_broadcaster',
  'finality_watcher',
  'database_projection_repair',
  'object_storage_repair',
  'generated_proof_job',
  'queue_consumer',
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
      'Usage: node scripts/check-v34-gate7-runtime-observers-broadcasters-repair-jobs.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V34 Gate 7 Runtime Observers Broadcasters Repair Jobs source, generated artifact, tests, docs, package scripts, workflow wiring, and source-safety posture.',
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
    pointer === 'V33',
    `BITCODE_SPEC.txt must remain V33 during V34 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v34' || /^v34\/gate-(?:[7-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 Gate 7+ work must occur on version/v34 or v34/gate-7..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/runtime-observer-repair-job.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/btd/__tests__/runtime-observer-repair-job.test.ts',
    'scripts/generate-v34-runtime-observers-broadcasters-repair-jobs.mjs',
    'scripts/check-v34-gate7-runtime-observers-broadcasters-repair-jobs.mjs',
    'BITCODE_SPEC_V34.md',
    'BITCODE_SPEC_V34_DELTA.md',
    'BITCODE_SPEC_V34_NOTES.md',
    'BITCODE_SPEC_V34_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'packages/specifying/src/canonical/v21-specifying.js',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V34 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v34-runtime-observers-broadcasters-repair-jobs']);
    } catch (error) {
      failures.push(`V34 Gate 7 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V34 runtime observer artifact must not contain secret/source marker ${marker}.`);
  }
  assertCheck(
    failures,
    !/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serializedArtifact),
    'V34 runtime observer artifact must not contain env-assignment-shaped values.',
  );

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v34-runtime-observers-broadcasters-repair-jobs', 'Artifact id must match Gate 7 runtime observers.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v34.runtimeObserversBroadcastersRepairJobs.v1', 'Artifact schema id must match.');
    assertCheck(failures, artifact.version === 'V34' && artifact.currentTarget === 'V33', 'Artifact must bind V34 over active V33.');
    assertCheck(failures, artifact.passed === true, 'Artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-runtime-observer-repair-job-metadata',
      'Artifact must be source-safe runtime observer repair job metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredJobIds, REQUIRED_JOB_IDS), 'Artifact must enumerate every required runtime job.');
    assertCheck(failures, includesAll(artifact.coverage.observedJobIds, REQUIRED_JOB_IDS), 'Artifact coverage must observe every runtime job.');
    assertCheck(failures, artifact.coverage.jobCount === 7, 'Artifact must prove seven runtime jobs.');
    assertCheck(failures, artifact.coverage.settlementObserversCovered === true, 'Settlement observers must be covered.');
    assertCheck(failures, artifact.coverage.ledgerBroadcastersCovered === true, 'Ledger broadcasters must be covered.');
    assertCheck(failures, artifact.coverage.finalityWatchersCovered === true, 'Finality watchers must be covered.');
    assertCheck(failures, artifact.coverage.databaseProjectionRepairCovered === true, 'Database projection repair jobs must be covered.');
    assertCheck(failures, artifact.coverage.objectStorageRepairCovered === true, 'Object-storage repair jobs must be covered.');
    assertCheck(failures, artifact.coverage.generatedProofJobsCovered === true, 'Generated proof jobs must be covered.');
    assertCheck(failures, artifact.coverage.queueConsumersCovered === true, 'Queue consumers must be covered.');
    assertCheck(failures, artifact.coverage.runtimeReceiptsCovered === true, 'Runtime receipt work kinds must be covered.');
    assertCheck(failures, artifact.coverage.laneContractsCovered === true, 'Lane contracts must be covered.');
    assertCheck(failures, artifact.coverage.replayCommandsCovered === true, 'Replay commands must be covered.');
    assertCheck(failures, artifact.coverage.repairCommandsCovered === true, 'Repair commands must be covered.');
    assertCheck(failures, artifact.coverage.unsafeDriftBlocksUnlock === true, 'Unsafe drift must block unlock, delivery, broadcast, or projection.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Proof roots must be covered.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Runtime jobs must not admit value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
    assertCheck(
      failures,
      artifact.jobs.every((job) => /^v34-runtime-observer-repair-job:[a-f0-9]{24}$/u.test(job.jobRoot)),
      'Runtime job rows must have deterministic roots.',
    );
    assertCheck(
      failures,
      artifact.jobs.every((job) => job.supportedLaneIds.every((laneId) => laneId !== 'value-bearing-mainnet')),
      'Runtime job rows must exclude value-bearing-mainnet from supported lanes.',
    );
    assertCheck(
      failures,
      artifact.jobs.every((job) => job.replayCommand && job.repairCommand && job.validationCommand),
      'Runtime job rows must carry validation, replay, and repair commands.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.docsEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Docs evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.workflowEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Workflow evidence tokens must all be present.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V34.md');
  const delta = read(root, 'BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V34_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const btdPackageJson = read(root, 'packages/btd/package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const source = read(root, 'packages/btd/src/runtime-observer-repair-job.ts');
  const test = read(root, 'packages/btd/__tests__/runtime-observer-repair-job.test.ts');
  const specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V34 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('RuntimeObserverRepairJob'), 'V34 docs must name RuntimeObserverRepairJob.');
    assertCheck(failures, doc.includes('settlement observers'), 'V34 docs must name settlement observers.');
    assertCheck(failures, doc.includes('ledger broadcasters'), 'V34 docs must name ledger broadcasters.');
    assertCheck(failures, doc.includes('finality watchers'), 'V34 docs must name finality watchers.');
    assertCheck(failures, doc.includes('database projection repair'), 'V34 docs must name database projection repair.');
    assertCheck(failures, doc.includes('object-storage repair'), 'V34 docs must name object-storage repair.');
    assertCheck(failures, doc.includes('generated proof jobs'), 'V34 docs must name generated proof jobs.');
    assertCheck(failures, doc.includes('queue consumers'), 'V34 docs must name queue consumers.');
    assertCheck(failures, doc.includes('unsafe drift'), 'V34 docs must name unsafe drift.');
  }

  assertCheck(
    failures,
    /Current working gate: V34 Gate (?:8|9|10)\b/u.test(roadmap),
    'Roadmap must keep Gate 7 closed while advancing current working gate to V34 Gate 8 or later.',
  );
  assertCheck(failures, roadmap.includes('V34 Gate 7 closure anchor'), 'Roadmap must mark Gate 7 as closed.');
  assertCheck(failures, packageJson.includes('generate:v34-runtime-observers-broadcasters-repair-jobs'), 'Root package scripts must include Gate 7 generator.');
  assertCheck(failures, packageJson.includes('check:v34-runtime-observers-broadcasters-repair-jobs'), 'Root package scripts must include Gate 7 artifact check.');
  assertCheck(failures, packageJson.includes('check:v34-gate7'), 'Root package scripts must include Gate 7 checker.');
  assertCheck(failures, btdPackageJson.includes('./runtime-observer-repair-job'), 'BTD package exports must expose runtime-observer-repair-job.');
  assertCheck(failures, gateWorkflow.includes('check-v34-gate7-runtime-observers-broadcasters-repair-jobs.mjs'), 'Gate quality workflow must run Gate 7 checker.');
  assertCheck(failures, gateWorkflow.includes('runtime-observer-repair-job.test.ts'), 'Gate quality workflow must run Gate 7 focused test.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Canonical generated-artifact allowlist must include Gate 7 artifact.');
  assertCheck(failures, source.includes('RUNTIME_OBSERVER_REPAIR_JOB_IDS'), 'Source must own required runtime observer repair job ids.');
  assertCheck(failures, source.includes('buildRuntimeObserverRepairJobSet'), 'Source must expose buildRuntimeObserverRepairJobSet.');
  assertCheck(failures, source.includes('unsafeDriftBlocksUnlock'), 'Source must prove unsafeDriftBlocksUnlock.');
  assertCheck(failures, source.includes('valueBearingMainnetBlocked'), 'Source must prove valueBearingMainnetBlocked.');
  assertCheck(failures, test.includes('fails closed when a required job is missing'), 'Tests must prove missing job fail-closed posture.');
  assertCheck(failures, test.includes('fails closed when value-bearing mainnet is admitted'), 'Tests must prove mainnet admission fail-closed posture.');
  assertCheck(failures, test.includes('fails closed when unsafe drift does not block a boundary'), 'Tests must prove unsafe drift fail-closed posture.');
  assertCheck(failures, test.includes('fails closed on serialized secret-shaped values'), 'Tests must prove secret-shaped values fail closed.');

  if (failures.length > 0) {
    process.stderr.write(`V34 Gate 7 Runtime Observers Broadcasters Repair Jobs check failed:\n- ${failures.join('\n- ')}\n`);
    process.exit(1);
  }

  process.stdout.write('V34 Gate 7 Runtime Observers Broadcasters Repair Jobs check passed.\n');
}

main();
