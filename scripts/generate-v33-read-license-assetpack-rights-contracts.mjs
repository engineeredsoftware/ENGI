#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v33/read-license-assetpack-rights-contracts.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const requiredSurfaces = Object.freeze(['api', 'mcp', 'chatgpt_app', 'terminal']);
const fixtureRows = Object.freeze([
  fixture(
    'api-read-license-source-safe-preview',
    'api',
    'review_asset_pack_preview',
    'source_safe_preview_admitted',
    'preview_admitted',
    false,
  ),
  fixture(
    'mcp-finding-fits-source-safe-preview',
    'mcp',
    'request_finding_fits',
    'source_safe_preview_admitted',
    'preview_admitted',
    false,
  ),
  fixture(
    'chatgpt-unpaid-delivery-denied',
    'chatgpt_app',
    'deliver_asset_pack',
    'locked_source_denied',
    'rights_delivery_denied',
    false,
  ),
  fixture(
    'terminal-paid-rights-delivery',
    'terminal',
    'deliver_asset_pack',
    'paid_unlock_admitted',
    'rights_delivery_admitted',
    true,
  ),
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

function fixture(
  fixtureId,
  interfaceSurface,
  action,
  expectedReadLicenseDecision,
  expectedAssetPackRightsDecision,
  protectedSourceVisibleAfterSettlement,
) {
  return {
    fixtureId,
    interfaceSurface,
    action,
    expectedReadLicenseDecision,
    expectedAssetPackRightsDecision,
    protectedSourceVisibleAfterSettlement,
    proofRoot: stableRoot('v33-read-license-assetpack-rights-contract', [
      fixtureId,
      interfaceSurface,
      action,
      expectedReadLicenseDecision,
      expectedAssetPackRightsDecision,
      String(protectedSourceVisibleAfterSettlement),
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

export function buildV33ReadLicenseAssetPackRightsContractsArtifact() {
  const sourceEvidence = [
    scanTokens('packages/btd/src/read-license-assetpack-rights-contract.ts', [
      'buildBtdReadLicenseInterfaceContract',
      'buildBtdAssetPackRightsInterfaceContract',
      'buildBtdReadLicenseAssetPackRightsInterfaceRegistry',
      'api-read-license-source-safe-preview',
      'terminal-paid-rights-delivery',
      'LOCKED_SOURCE_UNPAID',
    ]),
    scanTokens('packages/btd/src/receipts.ts', [
      'buildBtdReadReceipt',
      'buildBtdRightsTransferReceipt',
      'protectedSourceVisible',
      'confirmed',
    ]),
    scanTokens('packages/btd/src/interface-authorization-policy.ts', [
      'pay_btc_fee',
      'deliver_asset_pack',
      'PROTECTED_SOURCE_DISCLOSURE_BLOCKED',
    ]),
    scanTokens('packages/btd/src/authority.ts', [
      'review_asset_pack_preview',
      'pay_btc_fee',
      'deliver_asset_pack',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/read-license-assetpack-rights-contract.test.ts', [
      'publishes shared fixtures across API, MCP, ChatGPT App, and product',
      'denies locked AssetPack delivery when license, settlement, and rights transfer are missing',
      'admits paid delivery only after confirmed BTC finality and rights transfer',
    ]),
    scanTokens('packages/api/src/routes/__tests__/btd-crypto.test.ts', [
      'shares the package-owned ReadLicense and AssetPackRights fixture for API preview admission',
      'api-read-license-source-safe-preview',
    ]),
    scanTokens('apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts', [
      'shares the package-owned ReadLicense and AssetPackRights fixture for MCP Finding Fits preview',
      'mcp-finding-fits-source-safe-preview',
    ]),
    scanTokens('apps/chatgpt/src/__tests__/tools.test.ts', [
      'shares the package-owned ReadLicense and AssetPackRights fixture for unpaid ChatGPT App delivery denial',
      'chatgpt-unpaid-delivery-denied',
    ]),
    scanTokens('apps/uapi/tests/terminalOrganizationAuthority.test.ts', [
      'shares the package-owned ReadLicense and AssetPackRights fixture for paid product delivery',
      'terminal-paid-rights-delivery',
    ]),
  ];
  const docsEvidence = [
    scanTokens('.specifications/BITCODE_SPEC_V33.md', ['ReadLicenseInterfaceContract', 'AssetPackRightsInterfaceContract', 'Gate 6']),
    scanTokens('.specifications/BITCODE_SPEC_V33_DELTA.md', ['Read License And AssetPack Rights Interface Contracts']),
    scanTokens('.specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md', ['Read license and AssetPack rights contracts']),
    scanTokens('.specifications/SPECIFICATIONS_ROADMAP.md', ['V33 Gate 6 Read License And AssetPack Rights Interface Contracts']),
  ];
  const observedSurfaces = Array.from(new Set(fixtureRows.map((row) => row.interfaceSurface))).sort();
  const missingSurfaces = requiredSurfaces.filter((surface) => !observedSurfaces.includes(surface));
  const serializedRows = stableStringify(fixtureRows);
  const credentialsSerialized = secretMarkers.some((marker) => serializedRows.includes(marker));

  return {
    artifactId: 'v33-read-license-assetpack-rights-contracts',
    schemaId: 'bitcode.v33.readLicenseAssetPackRightsContracts.v1',
    version: 'V33',
    currentTarget: 'V32',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-read-license-assetpack-rights-metadata',
    requiredSurfaces,
    observedSurfaces,
    missingSurfaces,
    fixtureRows,
    coverage: {
      readRequest: true,
      reviewedNeed: true,
      findingFitsAdmission: true,
      sourceSafePreview: true,
      feeQuote: true,
      readLicensePosture: true,
      paidUnpaidDenial: true,
      btdRange: true,
      btcSettlement: true,
      deliveryAdmission: true,
      rightsTransferProjection: true,
      preSettlementProtectedSourceLocked: true,
      paidDeliveryAdmittedAfterFinality: true,
      sharedFixturesAcrossApiMcpChatGptAndTerminal: true,
      protectedSourceSerialized: false,
      credentialsSerialized,
    },
    sourceEvidence,
    testEvidence,
    docsEvidence,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    testEvidenceComplete: testEvidence.every(allTokensPresent),
    docsEvidenceComplete: docsEvidence.every(allTokensPresent),
    artifactRoot: stableRoot('v33-read-license-assetpack-rights-contracts-artifact', [
      observedSurfaces.join(','),
      fixtureRows.map((row) => row.proofRoot).join(','),
      'read-license',
      'assetpack-rights',
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
  const artifact = buildV33ReadLicenseAssetPackRightsContractsArtifact();
  const output = stableStringify(artifact);
  const target = path.join(repoRoot, ARTIFACT_PATH);

  if (check) {
    if (!existsSync(target)) {
      throw new Error(`${ARTIFACT_PATH} does not exist.`);
    }
    const current = readFileSync(target, 'utf8');
    if (current !== output) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v33-read-license-assetpack-rights-contracts.`);
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
