#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildV33InterfaceTelemetryProofHooksArtifact } from './generate-v33-interface-telemetry-proof-hooks.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v33-interface-telemetry-proof-hooks.json';

const REQUIRED_INTERFACE_IDS = [
  'terminal_handoff',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'package_consumer',
];
const REQUIRED_POSTURES = ['success', 'denied', 'blocked'];
const REQUIRED_ROOT_KINDS = [
  'request',
  'response',
  'ledger',
  'database',
  'object_storage',
  'generated_proof',
  'root_set',
];
const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JIUzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
];

function parseArgs(argv) {
  const args = { skipBranchCheck: false, repoRoot: defaultRepoRoot, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

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

function includesAll(values, required) {
  return required.every((value) => values.includes(value));
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

function stableStringify(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v33-gate8-interface-telemetry-proof-hooks.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V33 Gate 8 interface telemetry proof hooks, source-safe replay roots, surface tests, docs, generated artifact, and workflow wiring.',
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
    pointer === 'V32',
    `BITCODE_SPEC.txt must remain V32 during V33 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v33' || /^v33\/gate-(?:8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V33 Gate 8+ work must occur on version/v33 or v33/gate-8..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/interface-telemetry-proof-hook.ts',
    'packages/btd/__tests__/interface-telemetry-proof-hook.test.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    'apps/chatgpt/src/__tests__/tools.test.ts',
    'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
    'scripts/generate-v33-interface-telemetry-proof-hooks.mjs',
    'scripts/check-v33-gate8-interface-telemetry-proof-hooks.mjs',
    'BITCODE_SPEC_V33.md',
    'BITCODE_SPEC_V33_DELTA.md',
    'BITCODE_SPEC_V33_NOTES.md',
    'BITCODE_SPEC_V33_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];
  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V33 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v33-interface-telemetry-proof-hooks']);
      const artifact = JSON.parse(read(root, ARTIFACT));
      const expected = buildV33InterfaceTelemetryProofHooksArtifact();
      assertCheck(
        failures,
        stableStringify(artifact) === stableStringify(expected),
        'V33 Gate 8 artifact must be generated from the current generator.',
      );
    } catch (error) {
      failures.push(`V33 Gate 8 artifact generation failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V33 Gate 8 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v33-interface-telemetry-proof-hooks', 'Gate 8 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v33.interfaceTelemetryProofHooks.v1', 'Gate 8 schemaId must match.');
    assertCheck(failures, artifact.version === 'V33' && artifact.currentTarget === 'V32', 'Gate 8 artifact must bind V33 over active V32.');
    assertCheck(failures, artifact.passed === true, 'Gate 8 artifact must pass.');
    assertCheck(failures, includesAll(artifact.requiredInterfaceIds, REQUIRED_INTERFACE_IDS), 'Gate 8 must enumerate required interface ids.');
    assertCheck(failures, includesAll(artifact.requiredPostures, REQUIRED_POSTURES), 'Gate 8 must enumerate success, denied, and blocked postures.');
    assertCheck(failures, includesAll(artifact.requiredRootKinds, REQUIRED_ROOT_KINDS), 'Gate 8 must enumerate every replay root kind.');
    assertCheck(failures, artifact.missingInterfaceIds.length === 0, 'Gate 8 artifact must not miss interface ids.');
    assertCheck(failures, artifact.missingPostures.length === 0, 'Gate 8 artifact must not miss postures.');
    assertCheck(failures, artifact.coverage.executionIdRecorded === true, 'Gate 8 must record execution id/root.');
    assertCheck(failures, artifact.coverage.actionIdRecorded === true, 'Gate 8 must record action id.');
    assertCheck(failures, artifact.coverage.requestRootRecorded === true, 'Gate 8 must record request root.');
    assertCheck(failures, artifact.coverage.responseRootRecorded === true, 'Gate 8 must record response root.');
    assertCheck(failures, artifact.coverage.ledgerRootRecorded === true, 'Gate 8 must record ledger root.');
    assertCheck(failures, artifact.coverage.databaseRootRecorded === true, 'Gate 8 must record database root.');
    assertCheck(failures, artifact.coverage.objectStorageRootRecorded === true, 'Gate 8 must record object-storage root.');
    assertCheck(failures, artifact.coverage.generatedProofRootRecorded === true, 'Gate 8 must record generated proof root.');
    assertCheck(failures, artifact.coverage.rootSetRootRecorded === true, 'Gate 8 must record root-set root.');
    assertCheck(failures, artifact.coverage.replayCommandRecorded === true, 'Gate 8 must record replay command.');
    assertCheck(failures, artifact.coverage.terminalApiMcpChatGptJoined === true, 'Gate 8 must join Terminal, API, MCP, and ChatGPT App activity.');
    assertCheck(failures, artifact.coverage.protectedPayloadSerialized === false, 'Gate 8 artifact must not serialize protected payloads.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 8 artifact must not serialize credentials.');
    assertCheck(failures, artifact.hookRows.every((row) => typeof row.executionId === 'string' && row.executionId.startsWith('execution-')), 'Every Gate 8 row must serialize executionId.');
    assertCheck(failures, artifact.hookRows.every((row) => typeof row.replayCommand === 'string' && /^(?:pnpm|npm|node)\b/u.test(row.replayCommand)), 'Every Gate 8 row must serialize a maintained replay command.');
    assertCheck(failures, artifact.hookRows.every((row) => typeof row.rootSetRoot === 'string' && row.rootSetRoot.startsWith('btd-interface-telemetry-root-set:')), 'Every Gate 8 row must serialize rootSetRoot.');
  }

  const btdSource = read(root, 'packages/btd/src/interface-telemetry-proof-hook.ts');
  const btdTest = read(root, 'packages/btd/__tests__/interface-telemetry-proof-hook.test.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const mcpTest = read(root, 'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts');
  const chatgptTest = read(root, 'apps/chatgpt/src/__tests__/tools.test.ts');
  const terminalTest = read(root, 'apps/uapi/tests/terminalOrganizationAuthority.test.ts');
  const specs = [
    read(root, 'BITCODE_SPEC_V33.md'),
    read(root, 'BITCODE_SPEC_V33_DELTA.md'),
    read(root, 'BITCODE_SPEC_V33_NOTES.md'),
    read(root, 'BITCODE_SPEC_V33_PARITY_MATRIX.md'),
    read(root, 'SPECIFICATIONS_ROADMAP.md'),
  ].join('\n');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const packageJson = read(root, 'package.json');
  const protocolSpecifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  for (const sourcePhrase of [
    'BtdInterfaceTelemetryProofHook',
    'executionId',
    'requestRoot',
    'responseRoot',
    'ledgerRoot',
    'databaseRoot',
    'objectStorageRoot',
    'generatedProofRoot',
    'replayCommand',
    'protectedPayloadSerialized: false',
  ]) {
    assertCheck(failures, btdSource.includes(sourcePhrase), `BTD source must include ${sourcePhrase}.`);
  }
  assertCheck(failures, btdTest.includes('records execution and replay roots for Terminal, API, MCP, ChatGPT App, and package consumers'), 'BTD tests must cover cross-interface replay roots.');
  assertCheck(failures, btdTest.includes('rejects secrets, prompt bodies, and protected payloads'), 'BTD tests must cover source-safe rejection.');
  assertCheck(failures, apiTest.includes('shares the package-owned InterfaceTelemetryProofHook for public API readback replay'), 'API tests must share Gate 8 hook.');
  assertCheck(failures, mcpTest.includes('shares the package-owned InterfaceTelemetryProofHook for MCP pipeline replay'), 'MCP tests must share Gate 8 hook.');
  assertCheck(failures, chatgptTest.includes('shares the package-owned InterfaceTelemetryProofHook for ChatGPT App delivery blockers'), 'ChatGPT App tests must share Gate 8 hook.');
  assertCheck(failures, terminalTest.includes('shares the package-owned InterfaceTelemetryProofHook for Terminal handoff replay'), 'Terminal tests must share Gate 8 hook.');
  assertCheck(failures, specs.includes('V33 Gate 8 Interface Telemetry And Proof Replay Hooks'), 'Spec/roadmap must describe Gate 8 as current work.');
  assertCheck(failures, packageJson.includes('check:v33-gate8'), 'package.json must expose check:v33-gate8.');
  assertCheck(failures, workflow.includes('check-v33-gate8-interface-telemetry-proof-hooks.mjs'), 'Gate workflow must run Gate 8 checker.');
  assertCheck(failures, workflow.includes('__tests__/interface-telemetry-proof-hook.test.ts'), 'Gate workflow must run Gate 8 BTD test.');
  assertCheck(failures, protocolSpecifying.includes(ARTIFACT), 'Protocol specifying must include Gate 8 generated artifact.');

  if (failures.length) {
    process.stderr.write(`V33 Gate 8 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write('V33 Gate 8 interface telemetry proof hooks check passed.\n');
}

main();
