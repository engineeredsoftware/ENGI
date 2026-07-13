#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v33-interface-contract-catalog.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
]);
const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'u');

const requiredInterfaceIds = Object.freeze([
  'terminal_handoff',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'package_consumer',
  'exchange_hook',
  'conversations_hook',
]);

const deferredInterfaceIds = Object.freeze([
  'exchange_hook',
  'conversations_hook',
]);

const requiredRowFields = Object.freeze([
  'ownerPackage',
  'actionId',
  'schemaId',
  'authPolicyId',
  'sourceSafetyClass',
  'exampleFixturePath',
  'validationCommand',
  'compatibilityStatus',
  'failureMode',
  'repairPosture',
  'telemetryProofHookId',
]);

const catalogRows = Object.freeze([
  {
    interfaceId: 'terminal_handoff',
    status: 'active_contract',
    bindingKind: 'terminal_handoff',
    ownerPackage: 'uapi/app/terminal',
    actionId: 'terminal.reading.handoff',
    schemaId: 'bitcode.interface.terminalReadingHandoff.v1',
    authPolicyId: 'interface.authorization.reader-session',
    sourceSafetyClass: 'protected-source-locked',
    exampleFixturePath: 'uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
    validationCommand:
      'pnpm --dir uapi exec jest --runTestsByPath tests/terminalInterfaceIntegrationRegression.test.ts --runInBand',
    compatibilityStatus: 'compatible',
    failureMode: 'terminal-handoff-denies-protected-assetpack-source-before-settlement',
    repairPosture: 'review-source-safe-preview-and-settle-before-full-delivery',
    telemetryProofHookId: 'interface.telemetry.terminal-reading-handoff',
  },
  {
    interfaceId: 'public_api',
    status: 'active_contract',
    bindingKind: 'api_route',
    ownerPackage: 'packages/api/src/routes',
    actionId: 'api.reading.interface',
    schemaId: 'bitcode.interface.publicApiReading.v1',
    authPolicyId: 'interface.authorization.authenticated-route',
    sourceSafetyClass: 'source-safe-internal',
    exampleFixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    validationCommand:
      'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
    compatibilityStatus: 'compatible',
    failureMode: 'public-api-denies-missing-auth-or-stale-read-license',
    repairPosture: 'authenticate-refresh-license-or-request-source-safe-preview',
    telemetryProofHookId: 'interface.telemetry.public-api-reading',
  },
  {
    interfaceId: 'mcp_api',
    status: 'active_contract',
    bindingKind: 'mcp_tool',
    ownerPackage: 'packages/generic-mcps/bitcode',
    actionId: 'mcp.reading.pipeline',
    schemaId: 'bitcode.interface.mcpReadingTool.v1',
    authPolicyId: 'interface.authorization.pipeline-permission',
    sourceSafetyClass: 'source-safe-internal',
    exampleFixturePath:
      'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    validationCommand:
      'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
    compatibilityStatus: 'compatible',
    failureMode: 'mcp-tool-denies-missing-pipelines-create-permission',
    repairPosture: 'grant-pipeline-permission-or-use-source-safe-readonly-tool',
    telemetryProofHookId: 'interface.telemetry.mcp-reading-tool',
  },
  {
    interfaceId: 'chatgpt_app',
    status: 'active_contract',
    bindingKind: 'chatgpt_action',
    ownerPackage: 'packages/chatgptapp',
    actionId: 'chatgpt.reading.action',
    schemaId: 'bitcode.interface.chatGptReadingAction.v1',
    authPolicyId: 'interface.authorization.confirmed-connected-write',
    sourceSafetyClass: 'source-safe-internal',
    exampleFixturePath: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
    validationCommand:
      'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts --runInBand',
    compatibilityStatus: 'compatible',
    failureMode: 'chatgpt-action-denies-missing-confirmation-read-access-or-authority',
    repairPosture: 'confirm-action-refresh-read-access-or-repair-organization-authority',
    telemetryProofHookId: 'interface.telemetry.chatgpt-reading-action',
  },
  {
    interfaceId: 'package_consumer',
    status: 'active_contract',
    bindingKind: 'package_export',
    ownerPackage: 'packages/btd',
    actionId: 'package.interface.contract-catalog',
    schemaId: 'bitcode.interface.packageConsumerCatalog.v1',
    authPolicyId: 'interface.authorization.package-consumer-source-safe',
    sourceSafetyClass: 'source-safe-public',
    exampleFixturePath: 'packages/btd/__tests__/interface-contract-catalog.test.ts',
    validationCommand:
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/interface-contract-catalog.test.ts',
    compatibilityStatus: 'compatible',
    failureMode: 'package-consumer-denies-route-local-contract-reimplementation',
    repairPosture: 'consume-package-export-and-regenerate-contract-artifact',
    telemetryProofHookId: 'interface.telemetry.package-contract-catalog',
  },
  {
    interfaceId: 'exchange_hook',
    status: 'deferred_blocked',
    bindingKind: 'deferred_hook',
    ownerPackage: 'uapi/app/exchange',
    actionId: 'exchange.reading.hook',
    schemaId: 'bitcode.interface.exchangeHook.v1',
    authPolicyId: 'interface.authorization.deferred-not-admitted',
    sourceSafetyClass: 'deferred-blocker',
    exampleFixturePath: 'uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
    validationCommand:
      'pnpm --dir uapi exec jest --runTestsByPath tests/terminalInterfaceIntegrationRegression.test.ts --runInBand',
    compatibilityStatus: 'deferred_not_admitted',
    failureMode: 'exchange-hook-remains-blocked-until-exchange-product-depth-gate',
    repairPosture: 'wait-for-exchange-depth-gate-before-interface-admission',
    telemetryProofHookId: 'interface.telemetry.exchange-hook-blocker',
    deferredReason: 'Exchange product depth is deferred beyond V33 interface cataloging.',
  },
  {
    interfaceId: 'conversations_hook',
    status: 'deferred_blocked',
    bindingKind: 'deferred_hook',
    ownerPackage: 'uapi/app/conversations',
    actionId: 'conversations.reading.hook',
    schemaId: 'bitcode.interface.conversationsHook.v1',
    authPolicyId: 'interface.authorization.deferred-not-admitted',
    sourceSafetyClass: 'deferred-blocker',
    exampleFixturePath: 'uapi/tests/api/conversationsRouteRead.test.ts',
    validationCommand:
      'pnpm --dir uapi exec jest --runTestsByPath tests/api/conversationsRouteRead.test.ts --runInBand',
    compatibilityStatus: 'deferred_not_admitted',
    failureMode: 'conversations-hook-remains-blocked-until-conversations-product-depth-gate',
    repairPosture: 'wait-for-conversations-depth-gate-before-interface-admission',
    telemetryProofHookId: 'interface.telemetry.conversations-hook-blocker',
    deferredReason: 'Website Conversations product depth is deferred beyond V33 interface cataloging.',
  },
]);

const sourceFiles = Object.freeze([
  'packages/btd/src/interface-contract-catalog.ts',
  'packages/btd/src/index.ts',
  'BITCODE_SPEC_V33.md',
  'BITCODE_SPEC_V33_DELTA.md',
  'BITCODE_SPEC_V33_PARITY_MATRIX.md',
]);

const testFiles = Object.freeze([
  'packages/btd/__tests__/interface-contract-catalog.test.ts',
  'scripts/check-v33-gate2-interface-contract-catalog.mjs',
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function stableRoot(prefix, parts) {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
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

function withRowRoots(rows) {
  return rows.map((row) => ({
    ...row,
    rowRoot: stableRoot('v33-interface-contract-catalog-row', [
      row.interfaceId,
      row.status,
      row.bindingKind,
      row.ownerPackage,
      row.actionId,
      row.schemaId,
      row.authPolicyId,
      row.sourceSafetyClass,
      row.exampleFixturePath,
      row.validationCommand,
      row.compatibilityStatus,
      row.failureMode,
      row.repairPosture,
      row.telemetryProofHookId,
      row.deferredReason ?? 'active',
    ]),
  }));
}

export function buildV33InterfaceContractCatalogArtifact() {
  const rows = withRowRoots(catalogRows);
  const observedInterfaceIds = rows.map((row) => row.interfaceId);
  const missingInterfaceIds = requiredInterfaceIds.filter(
    (interfaceId) => !observedInterfaceIds.includes(interfaceId),
  );
  const activeContractCount = rows.filter((row) => row.status === 'active_contract').length;
  const deferredBlockedCount = rows.filter((row) => row.status === 'deferred_blocked').length;
  const sourceEvidence = [
    scanTokens('packages/btd/src/interface-contract-catalog.ts', [
      'buildBtdInterfaceContractCatalog',
      'terminal_handoff',
      'public_api',
      'mcp_api',
      'chatgpt_app',
      'package_consumer',
      'conversations_hook',
      'deferred_not_admitted',
    ]),
    scanTokens('packages/btd/src/index.ts', ['interface-contract-catalog']),
    scanTokens('BITCODE_SPEC_V33.md', [
      'InterfaceContractCatalog',
      '.bitcode/v33-interface-contract-catalog.json',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/interface-contract-catalog.test.ts', [
      'catalogs Terminal handoff, public API, MCP API, ChatGPT App, package consumers, and deferred hooks',
      'fails closed when a required interface catalog row is missing',
      'fails closed when deferred hooks are accidentally admitted as compatible active contracts',
      'fails closed on secret-shaped or protected-source catalog text',
    ]),
    scanTokens('scripts/check-v33-gate2-interface-contract-catalog.mjs', [
      'check:v33-interface-contract-catalog',
      'interface-contract-catalog.test.ts',
      'Gate 2 interface contract catalog',
    ]),
  ];
  const sourceEvidenceComplete = sourceEvidence.every(allTokensPresent);
  const testEvidenceComplete = testEvidence.every(allTokensPresent);
  const passed =
    missingInterfaceIds.length === 0 &&
    activeContractCount === 5 &&
    deferredBlockedCount === 2 &&
    sourceEvidenceComplete &&
    testEvidenceComplete;

  return {
    artifactId: 'v33-interface-contract-catalog',
    schemaId: 'bitcode.v33.interfaceContractCatalog.v1',
    version: 'V33',
    currentTarget: 'V32',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-interface-contract-catalog-metadata',
    requiredInterfaceIds,
    deferredInterfaceIds,
    requiredRowFields,
    catalogRoot: stableRoot('v33-interface-contract-catalog', rows.map((row) => row.rowRoot)),
    rows,
    coverage: {
      observedInterfaceIds,
      missingInterfaceIds,
      activeContractCount,
      deferredBlockedCount,
      protectedSourceVisible: false,
      credentialsSerialized: false,
      routeLocalReimplementation: false,
      deferredSurfacesHidden: false,
    },
    sharedFixtureFiles: [...sourceFiles, ...testFiles],
    sourceEvidence,
    testEvidence,
    passed,
    closureCommand: 'pnpm run check:v33-gate2',
  };
}

function writeArtifact(artifact) {
  const serialized = stableStringify(artifact);
  if (SECRET_PATTERN.test(serialized)) {
    throw new Error('V33 Gate 2 interface contract catalog artifact contains a secret-shaped marker.');
  }
  mkdirSync(path.dirname(path.join(repoRoot, ARTIFACT_PATH)), { recursive: true });
  writeFileSync(path.join(repoRoot, ARTIFACT_PATH), serialized);
  return serialized;
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV33InterfaceContractCatalogArtifact();
  const next = stableStringify(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);

  if (SECRET_PATTERN.test(next)) {
    throw new Error('V33 Gate 2 interface contract catalog artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V33 Gate 2 interface contract catalog artifact source evidence is incomplete.');
  }

  if (mode === 'check') {
    if (!existsSync(artifactFile)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v33-interface-contract-catalog.`);
    }
    const current = readFileSync(artifactFile, 'utf8');
    if (current !== next) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v33-interface-contract-catalog.`);
    }
    process.stdout.write(`V33 interface contract catalog artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  writeArtifact(artifact);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
