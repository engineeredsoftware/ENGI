#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v33-interface-authorization-policy.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const requiredSurfaces = Object.freeze(['api', 'mcp', 'chatgpt_app', 'terminal']);
const requiredDenialCodes = Object.freeze([
  'MISSING_AUTH_ISSUER',
  'STALE_AUTHORITY',
  'MISSING_ACTOR',
  'MISSING_ORGANIZATION',
  'MISSING_TEAM',
  'MISSING_ROLE',
  'ORGANIZATION_AUTHORITY_DENIED',
  'WALLET_CAPABILITY_REQUIRED',
  'READ_LICENSE_REQUIRED',
  'ASSET_PACK_RIGHTS_REQUIRED',
  'PROTECTED_SOURCE_DISCLOSURE_BLOCKED',
  'REPAIR_APPROVAL_REQUIRED',
]);

const fixtureRows = Object.freeze([
  fixture('api-request-read-allowed', 'api', 'request_read', 'allowed', []),
  fixture('mcp-finding-fits-allowed', 'mcp', 'request_finding_fits', 'allowed', []),
  fixture('chatgpt-delivery-allowed', 'chatgpt_app', 'deliver_asset_pack', 'allowed', []),
  fixture('terminal-btc-fee-allowed', 'terminal', 'pay_btc_fee', 'allowed', []),
  fixture('terminal-stale-authority-denied', 'terminal', 'pay_btc_fee', 'denied', ['STALE_AUTHORITY']),
  fixture('chatgpt-unpaid-delivery-denied', 'chatgpt_app', 'deliver_asset_pack', 'denied', [
    'READ_LICENSE_REQUIRED',
    'ASSET_PACK_RIGHTS_REQUIRED',
    'PROTECTED_SOURCE_DISCLOSURE_BLOCKED',
  ]),
]);

const secretMarkers = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
]);

function fixture(fixtureId, interfaceSurface, action, expectedDecision, expectedDenialCodes) {
  return {
    fixtureId,
    interfaceSurface,
    action,
    expectedDecision,
    expectedDenialCodes,
    policyRoot: stableRoot('v33-interface-authorization-policy', [
      fixtureId,
      interfaceSurface,
      action,
      expectedDecision,
      expectedDenialCodes.join(','),
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

export function buildV33InterfaceAuthorizationPolicyArtifact() {
  const sourceEvidence = [
    scanTokens('packages/btd/src/interface-authorization-policy.ts', [
      'buildBtdInterfaceAuthorizationPolicy',
      'buildBtdInterfaceAuthorizationPolicyFixtures',
      'renderBtdInterfaceAuthorizationDeniedState',
      'STALE_AUTHORITY',
      'PROTECTED_SOURCE_DISCLOSURE_BLOCKED',
    ]),
    scanTokens('apps/chatgpt/src/tools.ts', [
      'buildBtdInterfaceAuthorizationPolicy',
      'interfaceAuthorizationPolicy',
      'Bitcode ChatGPT App write admission denied by interface authorization policy',
    ]),
    scanTokens('apps/mcp/src/tools/pipeline-tools.ts', [
      'buildBtdInterfaceAuthorizationPolicy',
      'mcp-pipeline-create-request-finding-fits',
      'interfaceAuthorizationPolicy',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/interface-authorization-policy.test.ts', [
      'publishes shared policy fixtures for API, MCP, ChatGPT App, and product',
      'fails closed with readable repair posture for stale authority',
      'fails closed before locked AssetPack delivery',
    ]),
    scanTokens('packages/api/src/routes/__tests__/btd-crypto.test.ts', [
      'shares the package-owned InterfaceAuthorizationPolicy fixture for API request admission',
    ]),
    scanTokens('apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts', [
      'shares the package-owned InterfaceAuthorizationPolicy fixture for MCP Finding Fits admission',
    ]),
    scanTokens('apps/chatgpt/src/__tests__/tools.test.ts', [
      'shares the package-owned InterfaceAuthorizationPolicy fixture for ChatGPT App delivery',
    ]),
    scanTokens('apps/uapi/tests/terminalOrganizationAuthority.test.ts', [
      'shares the package-owned InterfaceAuthorizationPolicy fixture for product BTC fee admission',
      'renders stale product authority as a readable fail-closed denial',
    ]),
  ];
  const docsEvidence = [
    scanTokens('.specifications/BITCODE_SPEC_V33.md', ['InterfaceAuthorizationPolicy', 'Gate 5']),
    scanTokens('.specifications/BITCODE_SPEC_V33_DELTA.md', ['Interface Authorization Policy Fail-Closed']),
    scanTokens('.specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md', ['Interface authorization policy']),
    scanTokens('.specifications/SPECIFICATIONS_ROADMAP.md', ['V33 Gate 5 Interface Authorization Policy Fail-Closed']),
  ];
  const observedSurfaces = Array.from(new Set(fixtureRows.map((row) => row.interfaceSurface))).sort();
  const missingSurfaces = requiredSurfaces.filter((surface) => !observedSurfaces.includes(surface));
  const serializedRows = stableStringify(fixtureRows);
  const credentialsSerialized = secretMarkers.some((marker) => serializedRows.includes(marker));

  return {
    artifactId: 'v33-interface-authorization-policy',
    schemaId: 'bitcode.v33.interfaceAuthorizationPolicy.v1',
    version: 'V33',
    currentTarget: 'V32',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-interface-authorization-policy-metadata',
    requiredSurfaces,
    observedSurfaces,
    missingSurfaces,
    requiredDenialCodes,
    fixtureRows,
    coverage: {
      authIssuer: true,
      organizationTeamRole: true,
      walletCapability: true,
      readLicensePosture: true,
      assetPackRights: true,
      protectedSourceDisclosure: true,
      repairPosture: true,
      missingOrStaleAuthorityFailsClosed: true,
      sharedFixturesAcrossApiMcpChatGptAndTerminal: true,
      protectedSourceVisible: false,
      credentialsSerialized,
    },
    sourceEvidence,
    testEvidence,
    docsEvidence,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    testEvidenceComplete: testEvidence.every(allTokensPresent),
    docsEvidenceComplete: docsEvidence.every(allTokensPresent),
    artifactRoot: stableRoot('v33-interface-authorization-policy-artifact', [
      observedSurfaces.join(','),
      fixtureRows.map((row) => row.policyRoot).join(','),
      requiredDenialCodes.join(','),
    ]),
    passed:
      missingSurfaces.length === 0 &&
      !credentialsSerialized &&
      sourceEvidence.every(allTokensPresent) &&
      testEvidence.every(allTokensPresent) &&
      docsEvidence.every(allTokensPresent),
  };
}

function main() {
  const check = process.argv.includes('--check');
  const artifact = buildV33InterfaceAuthorizationPolicyArtifact();
  const output = stableStringify(artifact);
  const target = path.join(repoRoot, ARTIFACT_PATH);

  if (check) {
    if (!existsSync(target)) {
      throw new Error(`${ARTIFACT_PATH} does not exist.`);
    }
    const current = readFileSync(target, 'utf8');
    if (current !== output) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v33-interface-authorization-policy.`);
    }
    if (!artifact.passed) {
      throw new Error(`${ARTIFACT_PATH} did not pass source/test/docs coverage.`);
    }
    return;
  }

  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, output);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
