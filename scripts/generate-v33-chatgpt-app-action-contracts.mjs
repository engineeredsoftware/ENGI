#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v33-chatgpt-app-action-contracts.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const secretMarkers = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
]);
const secretPattern = new RegExp(secretMarkers.map(escapeRegex).join('|'), 'u');

const requiredActionIds = Object.freeze([
  'bitcode_request_read',
  'bitcode_review_read_need',
  'bitcode_request_finding_fits',
  'bitcode_review_asset_pack_preview',
  'bitcode_quote_asset_pack_fee',
  'bitcode_settle_asset_pack',
  'bitcode_deliver_asset_pack',
]);

const requiredFlowObjects = Object.freeze([
  'read_request',
  'read_need',
  'finding_fits_result',
  'asset_pack_preview',
  'btc_fee_quote',
  'settlement_unlock',
  'asset_pack_delivery',
]);

const requiredProofRootFields = Object.freeze([
  'actionId',
  'inputSchemaId',
  'outputSchemaId',
  'authPolicyId',
  'requestRoot',
  'responseRoot',
  'sourceSafeRendererId',
  'writeAdmission',
]);

const requiredDeniedStates = Object.freeze([
  'SCHEMA_VALIDATION_FAILED',
  'MISSING_READER_SESSION',
  'READ_NEED_REQUIRED',
  'FINDING_FITS_REQUIRED',
  'ASSET_PACK_PREVIEW_REQUIRED',
  'FEE_QUOTE_REQUIRED',
  'SETTLEMENT_REQUIRED',
  'READ_LICENSE_REQUIRED',
  'ORGANIZATION_AUTHORITY_REQUIRED',
  'CONFIRMATION_REQUIRED',
]);

const actionContracts = Object.freeze([
  action('bitcode_request_read', 'read_request', ['readerId', 'repository', 'readRequest'], ['requestId', 'interfaceSessionId', 'attachmentsRoot'], ['readRequestRoot', 'readinessState', 'nextAction'], ['SCHEMA_VALIDATION_FAILED', 'MISSING_READER_SESSION']),
  action('bitcode_review_read_need', 'read_need', ['readRequestRoot', 'readNeedRoot', 'decision'], ['feedback'], ['acceptedNeedRoot', 'reviewState', 'nextAction'], ['SCHEMA_VALIDATION_FAILED', 'MISSING_READER_SESSION', 'READ_NEED_REQUIRED']),
  action('bitcode_request_finding_fits', 'finding_fits_result', ['acceptedNeedRoot', 'depositoryScope'], ['minimumFitConfidence', 'candidateLimit'], ['findingFitsResultRoot', 'candidateCount', 'nextAction'], ['SCHEMA_VALIDATION_FAILED', 'MISSING_READER_SESSION', 'READ_NEED_REQUIRED']),
  action('bitcode_review_asset_pack_preview', 'asset_pack_preview', ['findingFitsResultRoot', 'assetPackPreviewRoot'], ['previewDecision'], ['assetPackPreviewRoot', 'fitQuality', 'nextAction'], ['SCHEMA_VALIDATION_FAILED', 'MISSING_READER_SESSION', 'FINDING_FITS_REQUIRED', 'ASSET_PACK_PREVIEW_REQUIRED']),
  action('bitcode_quote_asset_pack_fee', 'btc_fee_quote', ['assetPackPreviewRoot', 'measurementVectorRoot'], ['feePolicyId'], ['feeQuoteRoot', 'btcAmountSats', 'nextAction'], ['SCHEMA_VALIDATION_FAILED', 'MISSING_READER_SESSION', 'ASSET_PACK_PREVIEW_REQUIRED']),
  action('bitcode_settle_asset_pack', 'settlement_unlock', ['feeQuoteRoot', 'walletId', 'confirmationState', 'confirmed'], ['btcPaymentIntentId'], ['settlementRoot', 'finalityState', 'nextAction'], ['SCHEMA_VALIDATION_FAILED', 'MISSING_READER_SESSION', 'FEE_QUOTE_REQUIRED', 'CONFIRMATION_REQUIRED']),
  action('bitcode_deliver_asset_pack', 'asset_pack_delivery', ['settlementRoot', 'readLicenseId', 'deliveryTarget', 'confirmed'], ['organizationAuthorityRoot'], ['deliveryRoot', 'deliveryState', 'nextAction'], ['SCHEMA_VALIDATION_FAILED', 'MISSING_READER_SESSION', 'SETTLEMENT_REQUIRED', 'READ_LICENSE_REQUIRED', 'ORGANIZATION_AUTHORITY_REQUIRED', 'CONFIRMATION_REQUIRED'], 'locked-assetpack-delivery'),
]);

const sourceFiles = Object.freeze([
  'packages/btd/src/chatgpt-app-action-contract.ts',
  'packages/btd/src/index.ts',
  'apps/chatgpt/src/tools.ts',
]);

const testFiles = Object.freeze([
  'packages/btd/__tests__/chatgpt-app-action-contract.test.ts',
  'apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts',
  'apps/chatgpt/src/__tests__/tools.test.ts',
  'scripts/check-v33-gate4-chatgpt-app-action-contracts.mjs',
]);

function action(actionId, flowObject, requestRootFields, optionalRequestRootFields, responseRootFields, deniedStates, sourceSafetyClass = 'source-safe-internal') {
  return {
    actionId,
    flowObject,
    inputSchemaId: `bitcode.chatgpt.${actionId}.input.v1`,
    outputSchemaId: `bitcode.chatgpt.${actionId}.output.v1`,
    authPolicyId: 'interface.authorization.chatgpt-reading-action',
    requiredPermissions: ['chatgpt.reading.invoke'],
    sourceSafetyClass,
    sourceSafeRendererId: `chatgpt.sourceSafeRenderer.${actionId}`,
    requestRootFields: [...requestRootFields, ...optionalRequestRootFields],
    responseRootFields,
    proofRootFields: requiredProofRootFields,
    deniedStates,
    examples: [
      `${actionId}-success-source-safe`,
      `${actionId}-denied-readable-repair`,
    ],
    validationCommands: [
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/chatgpt-app-action-contract.test.ts',
      'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/chatgpt-action-contract.test.ts src/__tests__/tools.test.ts --runInBand',
    ],
  };
}

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
    contractRoot: stableRoot('v33-chatgpt-app-action-contract', [
      contract.actionId,
      contract.flowObject,
      contract.inputSchemaId,
      contract.outputSchemaId,
      contract.authPolicyId,
      contract.requiredPermissions.join(','),
      contract.sourceSafetyClass,
      contract.sourceSafeRendererId,
      contract.requestRootFields.join(','),
      contract.responseRootFields.join(','),
      contract.proofRootFields.join(','),
      contract.deniedStates.join(','),
      contract.examples.join(','),
    ]),
  }));
}

export function buildV33ChatGptAppActionContractsArtifact() {
  const contracts = withContractRoots(actionContracts);
  const observedActionIds = contracts.map((contract) => contract.actionId);
  const observedFlowObjects = contracts.map((contract) => contract.flowObject);
  const missingActionIds = requiredActionIds.filter((actionId) => !observedActionIds.includes(actionId));
  const missingFlowObjects = requiredFlowObjects.filter((flowObject) => !observedFlowObjects.includes(flowObject));
  const sourceEvidence = [
    scanTokens('packages/btd/src/chatgpt-app-action-contract.ts', [
      'buildBtdChatGptAppActionContractRegistry',
      'renderBtdChatGptAppSourceSafeResponse',
      'bitcode_request_finding_fits',
      'bitcode_deliver_asset_pack',
      'SCHEMA_VALIDATION_FAILED',
      'READ_LICENSE_REQUIRED',
    ]),
    scanTokens('apps/chatgpt/src/tools.ts', [
      'buildBtdChatGptAppActionContractRegistry',
      'renderBtdChatGptAppSourceSafeResponse',
      'getChatGptReadingActionTools',
      'source-safe-action',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/chatgpt-app-action-contract.test.ts', [
      'publishes package-owned contracts for the full Reading action sequence',
      'renders source-safe accepted responses with proof-root projection',
      'renders readable denied responses with repair actions',
    ]),
    scanTokens('apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts', [
      'registers every package-owned Reading action contract as a ChatGPT App tool',
      'requires schema-valid arguments before executing package-owned actions',
      'renders denied states with readable repair actions for ChatGPT App responses',
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
    missingActionIds.length === 0 &&
    missingFlowObjects.length === 0 &&
    deniedStateCoverage &&
    proofRootCoverage &&
    sourceEvidenceComplete &&
    testEvidenceComplete;

  return {
    artifactId: 'v33-chatgpt-app-action-contracts',
    schemaId: 'bitcode.v33.chatGptAppActionContracts.v1',
    version: 'V33',
    currentTarget: 'V32',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-chatgpt-app-action-contract-metadata',
    requiredActionIds,
    requiredFlowObjects,
    requiredProofRootFields,
    requiredDeniedStates,
    contracts,
    coverage: {
      observedActionIds,
      missingActionIds,
      observedFlowObjects,
      missingFlowObjects,
      deniedStateCoverage,
      proofRootCoverage,
      sourceSafeRendererCoverage: contracts.every((contract) => contract.sourceSafeRendererId.startsWith('chatgpt.sourceSafeRenderer.')),
      protectedSourceVisible: false,
      credentialsSerialized: false,
      sourceEvidenceComplete,
      testEvidenceComplete,
    },
    sourceEvidence,
    testEvidence,
    sourceFiles: sourceFiles.map((relativePath) => ({
      relativePath,
      digest: sha256(read(relativePath)),
    })),
    testFiles: testFiles.map((relativePath) => ({
      relativePath,
      digest: sha256(read(relativePath)),
    })),
    artifactRoot: stableRoot('v33-chatgpt-app-action-contracts-artifact', [
      contracts.map((contract) => contract.contractRoot).join(','),
      String(passed),
    ]),
    passed,
  };
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const artifact = buildV33ChatGptAppActionContractsArtifact();
  const serialized = stableStringify(artifact);

  if (secretPattern.test(serialized)) {
    throw new Error(`${ARTIFACT_PATH} would contain a secret marker.`);
  }

  if (checkOnly) {
    const current = read(ARTIFACT_PATH);
    if (current !== serialized) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v33-chatgpt-app-action-contracts.`);
    }
    process.stdout.write(`${ARTIFACT_PATH} is current\n`);
    return;
  }

  mkdirSync(path.dirname(path.join(repoRoot, ARTIFACT_PATH)), { recursive: true });
  writeFileSync(path.join(repoRoot, ARTIFACT_PATH), serialized);
  process.stdout.write(`${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
