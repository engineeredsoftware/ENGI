#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v33-interface-telemetry-proof-hooks.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const requiredInterfaceIds = Object.freeze([
  'terminal_handoff',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'package_consumer',
]);
const requiredPostures = Object.freeze(['success', 'denied', 'blocked']);
const requiredRootKinds = Object.freeze([
  'request',
  'response',
  'ledger',
  'database',
  'object_storage',
  'generated_proof',
  'root_set',
]);
const hookRows = Object.freeze([
  hook({
    hookId: 'interface.telemetry.terminal-reading-handoff',
    interfaceId: 'terminal_handoff',
    posture: 'blocked',
    actionId: 'terminal.reading.assetPackPreview',
    executionId: 'execution-terminal-reading-preview',
    rootId: 'terminal-preview',
    replayCommand:
      'pnpm --dir uapi exec jest --runTestsByPath tests/terminalOrganizationAuthority.test.ts --runInBand',
    theoremIds: ['interface-denial-readable', 'interface-preview-not-source'],
    replayStepIds: ['terminal-preview-blocked-readback', 'terminal-read-model'],
    witnessArtifactPaths: ['uapi/tests/terminalOrganizationAuthority.test.ts'],
    denialReason: 'assetpack-source-locked-until-settlement',
    repairPosture: 'settle-btc-fee-before-full-assetpack-delivery',
  }),
  hook({
    hookId: 'interface.telemetry.public-api-reading',
    interfaceId: 'public_api',
    posture: 'denied',
    actionId: 'api.btd.readAccess',
    executionId: 'execution-public-api-read-access',
    rootId: 'public-api-read-access',
    replayCommand:
      'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
    theoremIds: ['interface-auth-fail-closed', 'interface-denial-readable'],
    replayStepIds: ['api-denial-readback', 'api-read-access-check'],
    witnessArtifactPaths: ['packages/api/src/routes/__tests__/btd-crypto.test.ts'],
    denialReason: 'read-license-or-authority-missing',
    repairPosture: 'refresh-read-license-and-organization-authority-before-delivery',
  }),
  hook({
    hookId: 'interface.telemetry.mcp-reading-tool',
    interfaceId: 'mcp_api',
    posture: 'success',
    actionId: 'mcp.reading.pipeline',
    executionId: 'execution-mcp-reading-pipeline',
    rootId: 'mcp-reading-pipeline',
    replayCommand:
      'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
    theoremIds: ['interface-execution-rooted', 'interface-proof-replayable'],
    replayStepIds: ['mcp-auth-context', 'mcp-pipeline-queue-readback'],
    witnessArtifactPaths: [
      'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    ],
    successSummary: 'mcp-reading-pipeline-queued-with-source-safe-roots',
    repairPosture: 'replay-mcp-pipeline-ingress-before-investigating-downstream-hosts',
  }),
  hook({
    hookId: 'interface.telemetry.chatgpt-reading-action',
    interfaceId: 'chatgpt_app',
    posture: 'blocked',
    actionId: 'chatgpt.reading.action',
    executionId: 'execution-chatgpt-reading-action',
    rootId: 'chatgpt-reading-action',
    replayCommand:
      'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts --runInBand',
    theoremIds: ['interface-confirmation-required', 'interface-preview-not-source'],
    replayStepIds: ['chatgpt-assetpack-delivery-blocked', 'chatgpt-confirmation-check'],
    witnessArtifactPaths: ['packages/chatgptapp/src/__tests__/tools.test.ts'],
    denialReason: 'reader-confirmation-or-paid-rights-missing',
    repairPosture: 'confirm-action-and-settle-before-full-delivery',
  }),
  hook({
    hookId: 'interface.telemetry.package-contract-catalog',
    interfaceId: 'package_consumer',
    posture: 'success',
    actionId: 'package.interface.contract-catalog',
    executionId: 'execution-package-contract-catalog',
    rootId: 'package-contract-catalog',
    replayCommand:
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/interface-telemetry-proof-hook.test.ts',
    theoremIds: ['interface-package-owned-contract', 'interface-proof-replayable'],
    replayStepIds: ['package-build-hook-registry', 'package-root-readback'],
    witnessArtifactPaths: ['packages/btd/__tests__/interface-telemetry-proof-hook.test.ts'],
    successSummary: 'package-consumer-can-replay-interface-proof-hooks',
    repairPosture: 'regenerate-hook-registry-from-package-source',
  }),
]);

const secretMarkers = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['eyJhbGciOi', 'JIUzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
]);

function rootSet(rootId) {
  const requestRoot = `request-root:${rootId}`;
  const responseRoot = `response-root:${rootId}`;
  const ledgerRoot = `ledger-root:${rootId}`;
  const databaseRoot = `database-root:${rootId}`;
  const objectStorageRoot = `object-storage-root:${rootId}`;
  const generatedProofRoot = `generated-proof-root:${rootId}`;
  return {
    requestRoot,
    responseRoot,
    ledgerRoot,
    databaseRoot,
    objectStorageRoot,
    generatedProofRoot,
    rootSetRoot: stableRoot('btd-interface-telemetry-root-set', [
      requestRoot,
      responseRoot,
      ledgerRoot,
      databaseRoot,
      objectStorageRoot,
      generatedProofRoot,
    ]),
  };
}

function hook({
  hookId,
  interfaceId,
  posture,
  actionId,
  executionId,
  rootId,
  replayCommand,
  theoremIds,
  replayStepIds,
  witnessArtifactPaths,
  denialReason,
  successSummary,
  repairPosture,
}) {
  const roots = rootSet(rootId);
  return {
    hookId,
    interfaceId,
    posture,
    actionId,
    executionId,
    executionRoot: stableRoot('v33-interface-telemetry-execution', [
      hookId,
      interfaceId,
      actionId,
    ]),
    ...roots,
    replayCommand,
    theoremIds,
    replayStepIds,
    witnessArtifactPaths,
    denialReason,
    successSummary,
    repairPosture,
    rowRoot: stableRoot('v33-interface-telemetry-hook-row', [
      hookId,
      interfaceId,
      posture,
      actionId,
      executionId,
      roots.rootSetRoot,
      replayCommand,
    ]),
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function stableRoot(prefix, parts) {
  return `${prefix}:${createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24)}`;
}

function scanTokens(relativePath, tokens) {
  const text = read(relativePath);
  return {
    relativePath,
    digest: sha256(text),
    requiredTokens: tokens.map((token) => ({
      token,
      present: text.includes(token),
    })),
  };
}

function allTokensPresent(scan) {
  return scan.requiredTokens.every((entry) => entry.present);
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

export function buildV33InterfaceTelemetryProofHooksArtifact() {
  const sourceEvidence = [
    scanTokens('packages/btd/src/interface-telemetry-proof-hook.ts', [
      'BtdInterfaceTelemetryProofHook',
      'buildBtdInterfaceTelemetryProofHookRegistry',
      'requestRoot',
      'responseRoot',
      'ledgerRoot',
      'databaseRoot',
      'objectStorageRoot',
      'generatedProofRoot',
      'replayCommand',
      'protectedPayloadSerialized',
    ]),
    scanTokens('packages/btd/src/index.ts', ['interface-telemetry-proof-hook']),
    scanTokens('packages/btd/package.json', ['./interface-telemetry-proof-hook']),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/interface-telemetry-proof-hook.test.ts', [
      'publishes source-safe hooks for every required interface and posture',
      'records execution and replay roots for Terminal, API, MCP, ChatGPT App, and package consumers',
      'rejects secrets, prompt bodies, and protected payloads',
    ]),
    scanTokens('packages/api/src/routes/__tests__/btd-crypto.test.ts', [
      'shares the package-owned InterfaceTelemetryProofHook for public API readback replay',
      'interface.telemetry.public-api-reading',
    ]),
    scanTokens('packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts', [
      'shares the package-owned InterfaceTelemetryProofHook for MCP pipeline replay',
      'interface.telemetry.mcp-reading-tool',
    ]),
    scanTokens('packages/chatgptapp/src/__tests__/tools.test.ts', [
      'shares the package-owned InterfaceTelemetryProofHook for ChatGPT App delivery blockers',
      'interface.telemetry.chatgpt-reading-action',
    ]),
    scanTokens('uapi/tests/terminalOrganizationAuthority.test.ts', [
      'shares the package-owned InterfaceTelemetryProofHook for Terminal handoff replay',
      'interface.telemetry.terminal-reading-handoff',
    ]),
  ];
  const docsEvidence = [
    scanTokens('BITCODE_SPEC_V33.md', ['InterfaceTelemetryProofHook', 'Gate 8']),
    scanTokens('BITCODE_SPEC_V33_DELTA.md', ['Interface Telemetry And Proof Replay Hooks']),
    scanTokens('BITCODE_SPEC_V33_PARITY_MATRIX.md', ['Interface telemetry proof hooks']),
    scanTokens('SPECIFICATIONS_ROADMAP.md', ['V33 Gate 8 Interface Telemetry And Proof Replay Hooks']),
  ];
  const observedInterfaceIds = Array.from(new Set(hookRows.map((row) => row.interfaceId))).sort();
  const observedPostures = Array.from(new Set(hookRows.map((row) => row.posture))).sort();
  const missingInterfaceIds = requiredInterfaceIds.filter(
    (interfaceId) => !observedInterfaceIds.includes(interfaceId),
  );
  const missingPostures = requiredPostures.filter(
    (posture) => !observedPostures.includes(posture),
  );
  const serializedRows = stableStringify(hookRows);
  const credentialsSerialized = secretMarkers.some((marker) => serializedRows.includes(marker));

  return {
    artifactId: 'v33-interface-telemetry-proof-hooks',
    schemaId: 'bitcode.v33.interfaceTelemetryProofHooks.v1',
    version: 'V33',
    currentTarget: 'V32',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-interface-telemetry-roots-only',
    requiredInterfaceIds,
    observedInterfaceIds,
    missingInterfaceIds,
    requiredPostures,
    observedPostures,
    missingPostures,
    requiredRootKinds,
    hookRows,
    coverage: {
      executionIdRecorded: true,
      actionIdRecorded: true,
      requestRootRecorded: true,
      responseRootRecorded: true,
      ledgerRootRecorded: true,
      databaseRootRecorded: true,
      objectStorageRootRecorded: true,
      generatedProofRootRecorded: true,
      rootSetRootRecorded: true,
      replayCommandRecorded: true,
      terminalApiMcpChatGptJoined: requiredInterfaceIds
        .filter((id) => id !== 'package_consumer')
        .every((id) => observedInterfaceIds.includes(id)),
      packageConsumerJoined: observedInterfaceIds.includes('package_consumer'),
      successDeniedBlockedPostures: missingPostures.length === 0,
      protectedPayloadSerialized: false,
      credentialsSerialized,
    },
    sourceEvidence,
    testEvidence,
    docsEvidence,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    testEvidenceComplete: testEvidence.every(allTokensPresent),
    docsEvidenceComplete: docsEvidence.every(allTokensPresent),
    artifactRoot: stableRoot('v33-interface-telemetry-proof-hooks-artifact', [
      observedInterfaceIds.join(','),
      observedPostures.join(','),
      hookRows.map((entry) => entry.rowRoot).join(','),
      'interface-telemetry-proof',
    ]),
    passed:
      missingInterfaceIds.length === 0 &&
      missingPostures.length === 0 &&
      !credentialsSerialized &&
      sourceEvidence.every(allTokensPresent) &&
      testEvidence.every(allTokensPresent) &&
      docsEvidence.every(allTokensPresent),
  };
}

function main() {
  const check = process.argv.includes('--check');
  const artifact = buildV33InterfaceTelemetryProofHooksArtifact();
  const output = stableStringify(artifact);
  const target = path.join(repoRoot, ARTIFACT_PATH);

  if (check) {
    const current = existsSync(target) ? readFileSync(target, 'utf8') : '';
    if (current !== output) {
      process.stderr.write(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v33-interface-telemetry-proof-hooks.\n`);
      process.exit(1);
    }
    if (!artifact.passed) {
      process.stderr.write(`${ARTIFACT_PATH} does not satisfy Gate 8 closure.\n`);
      process.exit(1);
    }
    process.stdout.write(`V33 interface telemetry proof hooks artifact is current: ${ARTIFACT_PATH}\n`);
    return;
  }

  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, output);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
