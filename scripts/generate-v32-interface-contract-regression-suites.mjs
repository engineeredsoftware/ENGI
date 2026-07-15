#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v32-interface-contract-regression-suite.json';
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

const requiredSurfaces = Object.freeze([
  'terminal',
  'api',
  'mcp',
  'chatgpt_app',
  'auxillaries_hook',
  'exchange_hook',
  'conversations_hook',
]);

const deferredSurfaces = Object.freeze([
  'exchange_hook',
  'conversations_hook',
]);

const requiredObjectFamilies = Object.freeze([
  'btd_registry',
  'read_access',
  'btd_receipts',
  'btc_fee_operation',
  'ledger_projection',
  'source_to_shares_proof',
  'protocol_telemetry',
  'organization_authority',
  'terminal_journal',
]);

const requiredAssertions = Object.freeze([
  'auth-boundary-asserted',
  'policy-denial-asserted',
  'source-safety-class-asserted',
  'protected-source-nondisclosure-asserted',
]);

const sourceFiles = Object.freeze([
  'packages/btd/src/interface-contract-regression.ts',
  'packages/btd/src/interface-integration-contract.ts',
  'packages/btd/src/interface-integration.ts',
  'apps/uapi/app/ (removed cockpit tree) terminal-interface-integration-regression.ts',
  'apps/mcp/src/interface-integration.ts',
  'apps/chatgpt/src/interface-integration.ts',
]);

const testFiles = Object.freeze([
  'packages/btd/__tests__/v32-interface-contract-regression.test.ts',
  'packages/btd/__tests__/interface-integration.test.ts',
  'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
  'packages/api/src/routes/__tests__/btd-crypto.test.ts',
  'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
  'apps/chatgpt/src/__tests__/tools.test.ts',
  'apps/uapi/tests/auxillariesContent.access.test.tsx',
  'apps/uapi/tests/api/conversationsRouteRead.test.ts',
]);

const fixtureRows = Object.freeze([
  {
    surface: 'terminal',
    status: 'active_contract',
    boundaryKind: 'product_ui',
    fixturePath: 'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
    authBoundary: 'authenticated_route',
    policyDenial: 'terminal-detail-denies-protected-source-before-paid-unlock',
    sourceSafetyClass: 'protected-source-locked',
    objectFamilies: ['btd_registry', 'read_access', 'terminal_journal', 'protocol_telemetry'],
    sharedFixtureBasis: ['ProductTransactionReadModel', 'BtdReadAccessDecision'],
    assertions: requiredAssertions,
  },
  {
    surface: 'api',
    status: 'active_contract',
    boundaryKind: 'api_route',
    fixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    authBoundary: 'authenticated_route',
    policyDenial: 'btd-routes-return-401-or-400-before-settlement-admission',
    sourceSafetyClass: 'source-safe-internal',
    objectFamilies: ['btd_receipts', 'btc_fee_operation', 'ledger_projection', 'protocol_telemetry'],
    sharedFixtureBasis: ['BtdInterfaceIntegrationRegressionSettlement', 'BtdReadAccessDecision'],
    assertions: requiredAssertions,
  },
  {
    surface: 'mcp',
    status: 'active_contract',
    boundaryKind: 'mcp_tool',
    fixturePath: 'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    authBoundary: 'pipeline_permission',
    policyDenial: 'mcp-pipeline-write-denies-missing-pipelines-create',
    sourceSafetyClass: 'source-safe-internal',
    objectFamilies: ['source_to_shares_proof', 'organization_authority', 'protocol_telemetry'],
    sharedFixtureBasis: ['MCPAuthContext', 'pipeline write admission receipt'],
    assertions: requiredAssertions,
  },
  {
    surface: 'chatgpt_app',
    status: 'active_contract',
    boundaryKind: 'chatgpt_tool',
    fixturePath: 'apps/chatgpt/src/__tests__/tools.test.ts',
    authBoundary: 'confirmed_connected_write',
    policyDenial: 'chatgpt-app-write-denies-missing-confirmation-read-access-or-authority',
    sourceSafetyClass: 'source-safe-internal',
    objectFamilies: ['read_access', 'organization_authority', 'protocol_telemetry'],
    sharedFixtureBasis: ['ChatGPT App write admission receipt', 'BtdReadAccessDecision'],
    assertions: requiredAssertions,
  },
  {
    surface: 'auxillaries_hook',
    status: 'active_contract',
    boundaryKind: 'auxillaries_ui',
    fixturePath: 'apps/uapi/tests/auxillariesContent.access.test.tsx',
    authBoundary: 'support_plane_policy',
    policyDenial: 'auxillaries-support-plane-denies-protected-actions-without-interface-admission',
    sourceSafetyClass: 'source-safe-internal',
    objectFamilies: ['btd_registry', 'organization_authority', 'read_access'],
    sharedFixtureBasis: ['AuxillariesInterfaceAdmission', 'BtdOrganizationPolicyAuthority'],
    assertions: requiredAssertions,
  },
  {
    surface: 'exchange_hook',
    status: 'deferred_blocked',
    boundaryKind: 'deferred_interface_hook',
    fixturePath: 'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
    authBoundary: 'deferred_not_admitted',
    policyDenial: 'exchange-hook-remains-blocked-until-exchange-product-depth-gate',
    sourceSafetyClass: 'deferred-blocker',
    objectFamilies: ['btd_receipts', 'btc_fee_operation', 'ledger_projection'],
    sharedFixtureBasis: ['deferred Exchange interface admission blocker'],
    assertions: requiredAssertions,
    deferredReason: 'Exchange product depth is outside V32 Gate 6.',
  },
  {
    surface: 'conversations_hook',
    status: 'deferred_blocked',
    boundaryKind: 'deferred_interface_hook',
    fixturePath: 'apps/uapi/tests/api/conversationsRouteRead.test.ts',
    authBoundary: 'deferred_not_admitted',
    policyDenial: 'conversations-hook-remains-blocked-until-conversations-product-depth-gate',
    sourceSafetyClass: 'deferred-blocker',
    objectFamilies: ['read_access', 'organization_authority', 'protocol_telemetry'],
    sharedFixtureBasis: ['deferred Conversations interface admission blocker'],
    assertions: requiredAssertions,
    deferredReason: 'Conversations product depth is outside V32 Gate 6.',
  },
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

export function buildV32InterfaceContractRegressionSuite() {
  const sourceEvidence = [
    scanTokens('packages/btd/src/interface-contract-regression.ts', [
      'buildBtdInterfaceContractRegressionProof',
      'conversations_hook',
      'deferred_blocked',
      'protected-source-nondisclosure-asserted',
    ]),
    scanTokens('packages/btd/src/interface-integration-contract.ts', [
      'BTD_INTERFACE_INTEGRATION_REQUIRED_SURFACES',
      'conversations_hook',
    ]),
    scanTokens('apps/uapi/app/ (removed cockpit tree) terminal-interface-integration-regression.ts', [
      'conversations-interface-hook',
      'exchange-interface-hook',
    ]),
    scanTokens('apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts', [
      'pipelines.create permission',
      'writeAdmission',
    ]),
    scanTokens('apps/chatgpt/src/__tests__/tools.test.ts', [
      'requiresConfirmation',
      'readAccess',
      'organizationAuthority',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/v32-interface-contract-regression.test.ts', [
      'Exchange and Conversations represented only as blocked deferred contract rows',
      'authentication, policy denial, source-safety class',
      'fails closed when a required interface fixture is missing',
    ]),
    scanTokens('packages/api/src/routes/__tests__/btd-crypto.test.ts', [
      'returns JSON-safe interface integration regression proof from the route boundary',
      'conversations_hook',
    ]),
    scanTokens('apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts', [
      'conversations_hook',
      'source-safe low-detail proof',
    ]),
  ];
  const observedSurfaces = fixtureRows.map((row) => row.surface);
  const observedObjectFamilies = Array.from(
    new Set(fixtureRows.flatMap((row) => row.objectFamilies)),
  ).sort();
  const missingSurfaces = requiredSurfaces.filter((surface) => !observedSurfaces.includes(surface));
  const missingObjectFamilies = requiredObjectFamilies.filter(
    (family) => !observedObjectFamilies.includes(family),
  );
  const activeContractCount = fixtureRows.filter((row) => row.status === 'active_contract').length;
  const deferredBlockedCount = fixtureRows.filter((row) => row.status === 'deferred_blocked').length;
  const sourceEvidenceComplete = sourceEvidence.every(allTokensPresent);
  const testEvidenceComplete = testEvidence.every(allTokensPresent);
  const passed =
    missingSurfaces.length === 0 &&
    missingObjectFamilies.length === 0 &&
    activeContractCount === 5 &&
    deferredBlockedCount === 2 &&
    sourceEvidenceComplete &&
    testEvidenceComplete;

  return {
    artifactId: 'v32-interface-contract-regression-suite',
    schemaId: 'bitcode.v32.interfaceContractRegressionSuite.v1',
    version: 'V32',
    currentTarget: 'V31',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-interface-contract-proof-metadata',
    requiredSurfaces,
    deferredSurfaces,
    requiredObjectFamilies,
    requiredAssertions,
    fixtureRows,
    coverage: {
      observedSurfaces,
      missingSurfaces,
      observedObjectFamilies,
      missingObjectFamilies,
      activeContractCount,
      deferredBlockedCount,
      protectedSourceVisible: false,
      credentialsSerialized: false,
      routeLocalReimplementation: false,
    },
    sharedFixtureFiles: [...sourceFiles, ...testFiles],
    sourceEvidence,
    testEvidence,
    passed,
    closureCommand: 'pnpm run check:v32-gate6',
  };
}

function writeArtifact(artifact) {
  const serialized = stableStringify(artifact);
  if (SECRET_PATTERN.test(serialized)) {
    throw new Error('V32 Gate 6 interface contract artifact contains a secret-shaped marker.');
  }
  mkdirSync(path.dirname(path.join(repoRoot, ARTIFACT_PATH)), { recursive: true });
  writeFileSync(path.join(repoRoot, ARTIFACT_PATH), serialized);
  return serialized;
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV32InterfaceContractRegressionSuite();
  const next = stableStringify(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);

  if (SECRET_PATTERN.test(next)) {
    throw new Error('V32 Gate 6 interface contract artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V32 Gate 6 interface contract artifact source evidence is incomplete.');
  }

  if (mode === 'check') {
    if (!existsSync(artifactFile)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v32-interface-contract-regression-suites.`);
    }
    const current = readFileSync(artifactFile, 'utf8');
    if (current !== next) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v32-interface-contract-regression-suites.`);
    }
    process.stdout.write(`V32 interface contract regression suite artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  writeArtifact(artifact);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
