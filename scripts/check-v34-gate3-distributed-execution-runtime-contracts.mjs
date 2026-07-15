#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v34-distributed-execution-runtime-receipts.json';

const REQUIRED_WORK_KINDS = [
  'pipeline_run',
  'ptrr_agent',
  'thricified_generation',
  'tool_call',
  'ledger_operation',
  'wallet_operation',
  'proof_generation',
  'object_storage_write',
  'repair_job',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  'raw source',
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
      'Usage: node scripts/check-v34-gate3-distributed-execution-runtime-contracts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V34 Gate 3 Distributed Execution Runtime Contracts source, generated artifact, tests, docs, package scripts, and workflow wiring.',
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
      branch === 'version/v34' || /^v34\/gate-(?:[3-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 Gate 3+ work must occur on version/v34 or v34/gate-3..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/pipeline-hosts/src/distributed-execution-runtime-receipt.ts',
    'packages/pipeline-hosts/src/index.ts',
    'packages/pipeline-hosts/src/__tests__/distributed-execution-runtime-receipt.test.ts',
    'scripts/generate-v34-distributed-execution-runtime-receipts.mjs',
    'scripts/check-v34-gate3-distributed-execution-runtime-contracts.mjs',
    'BITCODE_SPEC_V34.md',
    'BITCODE_SPEC_V34_DELTA.md',
    'BITCODE_SPEC_V34_NOTES.md',
    'BITCODE_SPEC_V34_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V34 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v34-distributed-execution-runtime-receipts']);
    } catch (error) {
      failures.push(`V34 Gate 3 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V34 runtime receipt artifact must not contain secret/source marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v34-distributed-execution-runtime-receipts', 'Artifact id must match Gate 3 receipts.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v34.distributedExecutionRuntimeReceipts.v1', 'Artifact schema id must match.');
    assertCheck(failures, artifact.version === 'V34' && artifact.currentTarget === 'V33', 'Artifact must bind V34 over active V33.');
    assertCheck(failures, artifact.passed === true, 'Artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-distributed-execution-runtime-receipts',
      'Artifact must be source-safe distributed execution receipt metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredWorkKinds, REQUIRED_WORK_KINDS), 'Artifact must enumerate every required work kind.');
    assertCheck(failures, includesAll(artifact.coverage.observedWorkKinds, REQUIRED_WORK_KINDS), 'Artifact coverage must observe every work kind.');
    assertCheck(failures, artifact.coverage.workKindCount === 9, 'Artifact must prove nine receipt rows.');
    assertCheck(
      failures,
      artifact.coverage.routeHandlerRequiresSynchronousCompletion === false,
      'Long-running runtime work must not require request/response completion.',
    );
    assertCheck(failures, artifact.coverage.inputRootsCovered === true, 'Input roots must be covered.');
    assertCheck(failures, artifact.coverage.outputRootsCovered === true, 'Output roots must be covered.');
    assertCheck(failures, artifact.coverage.logRootsCovered === true, 'Log roots must be covered.');
    assertCheck(failures, artifact.coverage.objectStorageRootsCovered === true, 'Object storage roots must be covered.');
    assertCheck(failures, artifact.coverage.ledgerProjectionRootsCovered === true, 'Ledger projection roots must be covered.');
    assertCheck(failures, artifact.coverage.databaseProjectionRootsCovered === true, 'Database projection roots must be covered.');
    assertCheck(failures, artifact.coverage.walletOperationRootsCovered === true, 'Wallet operation roots must be covered.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Proof roots must be covered.');
    assertCheck(failures, artifact.coverage.repairPostureCovered === true, 'Repair posture must be covered.');
    assertCheck(failures, artifact.coverage.ptrrAgentReceiptCovered === true, 'PTRR agent receipts must be covered.');
    assertCheck(failures, artifact.coverage.thricifiedGenerationReceiptCovered === true, 'ThricifiedGeneration receipts must be covered.');
    assertCheck(failures, artifact.coverage.toolCallReceiptCovered === true, 'Tool call receipts must be covered.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
    assertCheck(
      failures,
      artifact.receipts.every((receipt) => /^v34-distributed-execution-runtime-receipt:[a-f0-9]{24}$/u.test(receipt.receiptRoot)),
      'Receipt rows must have deterministic receipt roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Test evidence tokens must all be present.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V34.md');
  const delta = read(root, 'BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V34_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const source = read(root, 'packages/pipeline-hosts/src/distributed-execution-runtime-receipt.ts');
  const test = read(root, 'packages/pipeline-hosts/src/__tests__/distributed-execution-runtime-receipt.test.ts');
  const specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V34 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('DistributedExecutionRuntimeReceipt'), 'V34 docs must name DistributedExecutionRuntimeReceipt.');
    assertCheck(failures, doc.includes('request_response_not_required'), 'V34 docs must name request_response_not_required.');
    assertCheck(failures, doc.includes('ptrr_agent'), 'V34 docs must name ptrr_agent receipt work.');
    assertCheck(failures, doc.includes('thricified_generation'), 'V34 docs must name thricified_generation receipt work.');
    assertCheck(failures, doc.includes('object_storage_write'), 'V34 docs must name object_storage_write receipt work.');
    assertCheck(failures, doc.includes('repair_job'), 'V34 docs must name repair_job receipt work.');
  }

  assertCheck(
    failures,
    /Current working gate: V34 Gate (?:[4-9]|10)\b/u.test(roadmap),
    'Roadmap must advance past V34 Gate 3 after this gate closes.',
  );
  assertCheck(failures, packageJson.includes('"generate:v34-distributed-execution-runtime-receipts"'), 'package.json must expose the Gate 3 generator.');
  assertCheck(failures, packageJson.includes('"check:v34-distributed-execution-runtime-receipts"'), 'package.json must expose the Gate 3 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v34-gate3"'), 'package.json must expose check:v34-gate3.');
  assertCheck(failures, workflow.includes('check-v34-gate3-distributed-execution-runtime-contracts.mjs'), 'Gate workflow must run the V34 Gate 3 checker.');
  assertCheck(failures, workflow.includes('distributed-execution-runtime-receipt.test.ts'), 'Gate workflow must run the focused distributed execution receipt test.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Spec-family profile must include the Gate 3 artifact path.');

  for (const phrase of [
    'DistributedExecutionRuntimeReceipt',
    'DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS',
    'request_response_not_required',
    'blocking_allowed_for_short_local_work',
    'ptrr_agent',
    'thricified_generation',
    'tool_call',
    'ledger_operation',
    'wallet_operation',
    'proof_generation',
    'object_storage_write',
    'repair_job',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 3 source must include ${phrase}.`);
  }

  for (const phrase of [
    'catalogs pipeline runs, PTRR agents, ThricifiedGenerations, tool calls, ledger operations, wallet operations, proof generation, object-storage writes, and repair jobs',
    'keeps long-running runtime work detached from request/response route handler completion',
    'covers required roots for pipeline, tool, ledger, wallet, proof, storage, and repair receipts',
    'fails closed when successful runtime receipts omit output roots',
    'fails closed when PTRR and ThricifiedGeneration receipts omit formal step data',
    'fails closed when tool, ledger, wallet, proof, storage, and repair receipts omit their owned roots',
    'fails closed on secret-shaped or protected-source receipt text',
  ]) {
    assertCheck(failures, test.includes(phrase), `Gate 3 test must assert: ${phrase}.`);
  }

  if (failures.length) {
    process.stderr.write('V34 Gate 3 Distributed Execution Runtime Contracts check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write('V34 Gate 3 Distributed Execution Runtime Contracts check passed.\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
