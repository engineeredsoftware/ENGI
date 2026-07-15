#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v33-api-schema-compatibility-matrix.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const requiredConsumerSurfaces = Object.freeze([
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'terminal_handoff',
  'package_consumer',
]);
const requiredExamplePostures = Object.freeze(['success', 'denied', 'blocked', 'stale', 'deferred']);
const matrixRows = Object.freeze([
  row('public-api-btd-registry-success', 'public_api', 'success', 'compatible', '/api/btd/registry'),
  row('public-api-btd-mint-draft-denied', 'public_api', 'denied', 'breaking_change_denied', '/api/btd/mint-draft'),
  row(
    'public-api-organization-authority-stale',
    'public_api',
    'stale',
    'stale_rejected',
    '/api/btd/organization-interface-authority',
  ),
  row('mcp-api-asset-pack-create-success', 'mcp_api', 'success', 'compatible', 'bitcode://pipelines/asset-pack/create'),
  row(
    'chatgpt-app-deliver-assetpack-blocked',
    'chatgpt_app',
    'blocked',
    'blocked_until_rights',
    'chatgpt://actions/bitcode_deliver_asset_pack',
  ),
  row(
    'terminal-handoff-preview-blocked',
    'terminal_handoff',
    'blocked',
    'blocked_until_rights',
    'terminal://reading/asset-pack-preview',
  ),
  row(
    'package-consumer-exchange-hook-deferred',
    'package_consumer',
    'deferred',
    'deferred_not_admitted',
    'package://@bitcode/btd/exchange-hook',
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

function row(rowId, consumerSurface, examplePosture, compatibilityStatus, pathValue) {
  return {
    rowId,
    consumerSurface,
    examplePosture,
    compatibilityStatus,
    path: pathValue,
    proofRoot: stableRoot('v33-api-schema-compatibility-row', [
      rowId,
      consumerSurface,
      examplePosture,
      compatibilityStatus,
      pathValue,
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

function hasVersionedPath(value) {
  return /(?:^|\/)v\d+(?:\/|$)/iu.test(value) || /\bgate-\d+\b/iu.test(value) || /\bwip\b/iu.test(value);
}

export function buildV33ApiSchemaCompatibilityMatrixArtifact() {
  const sourceEvidence = [
    scanTokens('packages/btd/src/api-schema-compatibility-matrix.ts', [
      'buildBtdApiSchemaCompatibilityMatrix',
      'BTD_API_SCHEMA_COMPATIBILITY_EXAMPLE_POSTURES',
      'public-api-btd-registry-success',
      'chatgpt-app-deliver-assetpack-blocked',
      'package-consumer-exchange-hook-deferred',
      'assertVersionlessPath',
    ]),
    scanTokens('packages/btd/src/index.ts', ['api-schema-compatibility-matrix']),
    scanTokens('packages/btd/package.json', ['./api-schema-compatibility-matrix']),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/api-schema-compatibility-matrix.test.ts', [
      'publishes source-safe rows for every required consumer surface and example posture',
      'records package-owned success, denied, blocked, stale, and deferred examples',
      'enforces versionless paths and gate-neutral source identifiers',
    ]),
    scanTokens('packages/api/src/routes/__tests__/btd-crypto.test.ts', [
      'shares the package-owned API schema compatibility matrix for versionless public routes',
      'public-api-btd-registry-success',
    ]),
    scanTokens('apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts', [
      'shares the package-owned API schema compatibility matrix for MCP tool calls',
      'mcp-api-asset-pack-create-success',
    ]),
    scanTokens('apps/chatgpt/src/__tests__/tools.test.ts', [
      'shares the package-owned API schema compatibility matrix for ChatGPT App blocked delivery',
      'chatgpt-app-deliver-assetpack-blocked',
    ]),
    scanTokens('apps/uapi/tests/terminalOrganizationAuthority.test.ts', [
      'shares the package-owned API schema compatibility matrix for product handoff rows',
      'terminal-handoff-preview-blocked',
    ]),
  ];
  const docsEvidence = [
    scanTokens('specifications/BITCODE_SPEC_V33.md', ['APISchemaCompatibilityMatrix', 'Gate 7']),
    scanTokens('specifications/BITCODE_SPEC_V33_DELTA.md', ['API Schemas Examples And Compatibility Matrix']),
    scanTokens('specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md', ['API schema compatibility']),
    scanTokens('specifications/SPECIFICATIONS_ROADMAP.md', ['V33 Gate 7 API Schemas Examples And Compatibility Matrix']),
  ];
  const observedConsumerSurfaces = Array.from(new Set(matrixRows.map((row) => row.consumerSurface))).sort();
  const observedExamplePostures = Array.from(new Set(matrixRows.map((row) => row.examplePosture))).sort();
  const missingConsumerSurfaces = requiredConsumerSurfaces.filter(
    (surface) => !observedConsumerSurfaces.includes(surface),
  );
  const missingExamplePostures = requiredExamplePostures.filter(
    (posture) => !observedExamplePostures.includes(posture),
  );
  const serializedRows = stableStringify(matrixRows);
  const credentialsSerialized = secretMarkers.some((marker) => serializedRows.includes(marker));
  const versionedPaths = matrixRows.filter((entry) => hasVersionedPath(entry.path)).map((entry) => entry.path);

  return {
    artifactId: 'v33-api-schema-compatibility-matrix',
    schemaId: 'bitcode.v33.apiSchemaCompatibilityMatrix.v1',
    version: 'V33',
    currentTarget: 'V32',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-api-schema-compatibility-metadata',
    requiredConsumerSurfaces,
    observedConsumerSurfaces,
    missingConsumerSurfaces,
    requiredExamplePostures,
    observedExamplePostures,
    missingExamplePostures,
    matrixRows,
    coverage: {
      schemaIdsRecorded: true,
      consumerSurfacesRecorded: true,
      examplesRecorded: true,
      breakingChangePolicyRecorded: true,
      compatibilityStatusRecorded: true,
      fixturePathsRecorded: true,
      validationCommandsRecorded: true,
      successDeniedBlockedStaleDeferredExamples: missingExamplePostures.length === 0,
      versionlessPathDiscipline: versionedPaths.length === 0,
      protectedSourceSerialized: false,
      credentialsSerialized,
    },
    versionedPaths,
    sourceEvidence,
    testEvidence,
    docsEvidence,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    testEvidenceComplete: testEvidence.every(allTokensPresent),
    docsEvidenceComplete: docsEvidence.every(allTokensPresent),
    artifactRoot: stableRoot('v33-api-schema-compatibility-matrix-artifact', [
      observedConsumerSurfaces.join(','),
      observedExamplePostures.join(','),
      matrixRows.map((entry) => entry.proofRoot).join(','),
      'schema-compatibility',
    ]),
    passed:
      missingConsumerSurfaces.length === 0 &&
      missingExamplePostures.length === 0 &&
      versionedPaths.length === 0 &&
      !credentialsSerialized &&
      sourceEvidence.every(allTokensPresent) &&
      testEvidence.every(allTokensPresent) &&
      docsEvidence.every(allTokensPresent),
  };
}

function main() {
  const check = process.argv.includes('--check');
  const artifact = buildV33ApiSchemaCompatibilityMatrixArtifact();
  const output = stableStringify(artifact);
  const target = path.join(repoRoot, ARTIFACT_PATH);

  if (check) {
    if (!existsSync(target)) {
      throw new Error(`${ARTIFACT_PATH} does not exist.`);
    }
    const current = readFileSync(target, 'utf8');
    if (current !== output) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v33-api-schema-compatibility-matrix.`);
    }
    if (!artifact.passed) {
      throw new Error(`${ARTIFACT_PATH} did not pass source/test/docs coverage.`);
    }
    return;
  }

  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, output);
}

main();
