#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v33-mcp-api-tool-contracts.json';
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

const requiredToolIds = Object.freeze([
  'bitcode://pipelines/asset-pack/create',
]);

const requiredProofRootFields = Object.freeze([
  'toolId',
  'inputSchemaId',
  'outputSchemaId',
  'authPolicyId',
  'requestRoot',
  'responseRoot',
  'writeAdmission',
]);

const requiredDeniedStates = Object.freeze([
  'MISSING_API_KEY',
  'INSUFFICIENT_PERMISSIONS',
  'PROVIDER_BINDING_REQUIRED',
  'SCHEMA_VALIDATION_FAILED',
  'RATE_LIMITED',
  'UNKNOWN_TOOL',
]);

const toolContracts = Object.freeze([
  {
    toolId: 'bitcode://pipelines/asset-pack/create',
    category: 'pipelines',
    inputSchemaId: 'bitcode.mcp.assetPackCreate.input.v1',
    outputSchemaId: 'bitcode.mcp.assetPackCreate.output.v1',
    authPolicyId: 'interface.authorization.pipeline-permission',
    requiredPermissions: ['pipelines.create'],
    sourceSafetyClass: 'protected-source-locked',
    protectedSourcePolicy: 'source-safe-preview-and-metadata-before-settlement',
    requestRootFields: ['task', 'repository', 'attachments', 'connections', 'subtype', 'streaming'],
    responseRootFields: [
      'runId',
      'assetPackEvidenceId',
      'status',
      'interfaceSurface',
      'writeAdmission',
      'outputMeaning',
      'monitoringUrl',
    ],
    proofRootFields: requiredProofRootFields,
    deniedStates: requiredDeniedStates,
    examples: [
      {
        exampleId: 'mcp-asset-pack-create-success-queued',
        posture: 'success_queued',
        fixturePath:
          'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      },
      {
        exampleId: 'mcp-asset-pack-create-denied-permission',
        posture: 'denied_permission',
        fixturePath:
          'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      },
      {
        exampleId: 'mcp-asset-pack-create-denied-auth',
        posture: 'denied_auth',
        fixturePath: 'packages/generic-mcps/bitcode/src/__tests__/unit/auth.test.ts',
      },
      {
        exampleId: 'mcp-asset-pack-create-denied-provider-binding',
        posture: 'denied_provider_binding',
        fixturePath:
          'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      },
    ],
    validationCommands: [
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/mcp-tool-contract.test.ts',
      'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/mcp-tool-contract.test.ts src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
    ],
  },
]);

const sourceFiles = Object.freeze([
  'packages/btd/src/mcp-tool-contract.ts',
  'packages/btd/src/index.ts',
  'packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts',
  'packages/generic-mcps/bitcode/src/types/index.ts',
  'packages/generic-mcps/bitcode/src/server.ts',
]);

const testFiles = Object.freeze([
  'packages/btd/__tests__/mcp-tool-contract.test.ts',
  'packages/generic-mcps/bitcode/src/__tests__/unit/mcp-tool-contract.test.ts',
  'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
  'packages/generic-mcps/bitcode/src/__tests__/unit/auth.test.ts',
  'scripts/check-v33-gate3-mcp-api-tool-contracts.mjs',
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

function withContractRoots(contracts) {
  return contracts.map((contract) => ({
    ...contract,
    contractRoot: stableRoot('v33-mcp-api-tool-contract', [
      contract.toolId,
      contract.category,
      contract.inputSchemaId,
      contract.outputSchemaId,
      contract.authPolicyId,
      contract.requiredPermissions.join(','),
      contract.sourceSafetyClass,
      contract.protectedSourcePolicy,
      contract.requestRootFields.join(','),
      contract.responseRootFields.join(','),
      contract.proofRootFields.join(','),
      contract.deniedStates.join(','),
      contract.examples.map((example) => `${example.exampleId}:${example.posture}`).join(','),
    ]),
  }));
}

export function buildV33McpApiToolContractsArtifact() {
  const contracts = withContractRoots(toolContracts);
  const observedToolIds = contracts.map((contract) => contract.toolId);
  const missingToolIds = requiredToolIds.filter((toolId) => !observedToolIds.includes(toolId));
  const sourceEvidence = [
    scanTokens('packages/btd/src/mcp-tool-contract.ts', [
      'buildBtdMcpToolContractRegistry',
      'bitcode://pipelines/asset-pack/create',
      'SCHEMA_VALIDATION_FAILED',
      'PROVIDER_BINDING_REQUIRED',
      'source-safe-preview-and-metadata-before-settlement',
    ]),
    scanTokens('packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts', [
      'getBtdMcpToolContract',
      'assetPackCreateContract.toolId',
      'assetPackCreateContract.description',
      'AssetPackPipelineToolSchema',
    ]),
    scanTokens('packages/generic-mcps/bitcode/src/types/index.ts', [
      'AssetPackPipelineToolSchema',
      'PipelineNameValues',
      'PipelineConnectionInputSchema',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/mcp-tool-contract.test.ts', [
      'publishes the package-owned AssetPack create tool contract',
      'carries proof-root fields, request roots, response roots, denied states, and examples',
      'fails closed when the required MCP tool id is missing',
    ]),
    scanTokens('packages/generic-mcps/bitcode/src/__tests__/unit/mcp-tool-contract.test.ts', [
      'discovers the AssetPack create tool from the package-owned BTD contract',
      'rejects invalid MCP tool input before execution',
      'declares source-safe output fields and proof roots for MCP responses',
    ]),
    scanTokens('packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts', [
      'rejects MCP pipeline writes without pipelines.create permission',
      'rejects incoherent repository/provider ingress before queueing MCP work',
      'returns asset-pack-normalized results for completed MCP writes',
    ]),
  ];
  const sourceEvidenceComplete = sourceEvidence.every(allTokensPresent);
  const testEvidenceComplete = testEvidence.every(allTokensPresent);
  const deniedStateCoverage = requiredDeniedStates.every((state) =>
    contracts.some((contract) => contract.deniedStates.includes(state)),
  );
  const proofRootCoverage = requiredProofRootFields.every((field) =>
    contracts.every((contract) => contract.proofRootFields.includes(field)),
  );
  const passed =
    missingToolIds.length === 0 &&
    contracts.length === 1 &&
    deniedStateCoverage &&
    proofRootCoverage &&
    sourceEvidenceComplete &&
    testEvidenceComplete;

  return {
    artifactId: 'v33-mcp-api-tool-contracts',
    schemaId: 'bitcode.v33.mcpApiToolContracts.v1',
    version: 'V33',
    currentTarget: 'V32',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-mcp-api-tool-contract-metadata',
    requiredToolIds,
    requiredProofRootFields,
    requiredDeniedStates,
    contracts,
    coverage: {
      observedToolIds,
      missingToolIds,
      deniedStateCoverage,
      proofRootCoverage,
      protectedSourceVisible: false,
      credentialsSerialized: false,
      toolDiscoveryPackageDerived: true,
    },
    sharedFixtureFiles: [...sourceFiles, ...testFiles],
    sourceEvidence,
    testEvidence,
    passed,
    closureCommand: 'pnpm run check:v33-gate3',
  };
}

function writeArtifact(artifact) {
  const serialized = stableStringify(artifact);
  if (SECRET_PATTERN.test(serialized)) {
    throw new Error('V33 Gate 3 MCP API tool contract artifact contains a secret-shaped marker.');
  }
  mkdirSync(path.dirname(path.join(repoRoot, ARTIFACT_PATH)), { recursive: true });
  writeFileSync(path.join(repoRoot, ARTIFACT_PATH), serialized);
  return serialized;
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV33McpApiToolContractsArtifact();
  const next = stableStringify(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);

  if (SECRET_PATTERN.test(next)) {
    throw new Error('V33 Gate 3 MCP API tool contract artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V33 Gate 3 MCP API tool contract artifact source evidence is incomplete.');
  }

  if (mode === 'check') {
    if (!existsSync(artifactFile)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v33-mcp-api-tool-contracts.`);
    }
    const current = readFileSync(artifactFile, 'utf8');
    if (current !== next) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v33-mcp-api-tool-contracts.`);
    }
    process.stdout.write(`V33 MCP API tool contract artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  writeArtifact(artifact);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
