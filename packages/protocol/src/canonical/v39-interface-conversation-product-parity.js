// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ARTIFACT_PATH =
  '.bitcode/v39-interface-conversation-product-parity.json';
export const V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SCHEMA_ID =
  'bitcode.v39.interfaceConversationProductParity.v1';
export const V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_VERSION = 'V39';
export const V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_CURRENT_TARGET = 'V38';
export const V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SOURCE_SAFETY_VERDICT =
  'source-safe-interface-conversation-product-parity';

export const V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SURFACES = Object.freeze([
  'terminal',
  'conversation',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'package_consumer',
]);

export const V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_STAGE_IDS = Object.freeze([
  'accepted-need-gate',
  'finding-fits-request',
  'source-safe-preview',
  'settlement-unlock',
  'btd-rights-delivery',
]);

export const V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ROW_IDS = Object.freeze([
  'surface:terminal-authority',
  'surface:conversation-terminal-handoff',
  'surface:public-api-contract',
  'surface:mcp-reading-pipeline',
  'surface:chatgpt-app-action',
  'surface:package-consumer-contract',
  'boundary:accepted-need-source-safe-preview',
  'boundary:settlement-rights-delivery',
  'proof:tests-artifact-workflow',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'raw-interpolated-prompts',
  'unpaid-assetpack-source',
  'wallet-private-material',
  'settlement-private-payloads',
  'secret-values',
]);

const SOURCE_ROOTS = Object.freeze({
  parity: 'packages/asset-packs-pipelines/domain/src/reading-interface-product-parity.ts',
  parityTest: 'packages/asset-packs-pipelines/domain/src/__tests__/reading-interface-product-parity.test.ts',
  postprocess: 'packages/asset-packs-pipelines/domain/src/postprocess.ts',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  packageJson: 'packages/asset-packs-pipelines/domain/package.json',
  conversationTest: 'uapi/tests/api/conversationReadingInterfaceParity.test.ts',
  mcpTest: 'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
  chatgptTest: 'packages/chatgptapp/src/__tests__/chatgpt-action-contract.test.ts',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  protocolReadme: 'packages/protocol/README.md',
  rootReadme: 'README.md',
  v39Spec: 'BITCODE_SPEC_V39.md',
  v39Delta: 'BITCODE_SPEC_V39_DELTA.md',
  v39Notes: 'BITCODE_SPEC_V39_NOTES.md',
  v39Parity: 'BITCODE_SPEC_V39_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v39-interface-conversation-product-parity-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_reading_interface_product_parity_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    rawInterpolatedPromptVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    credentialsSerialized: false,
    parallelAuthorityCreated: false,
    sameAuthorityAsTerminal: true,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ROWS = Object.freeze([
  row({
    rowId: 'surface:terminal-authority',
    surface: 'terminal',
    purpose:
      'Keep Terminal as the Reading transaction authority for the five-step enterprise Reading product path.',
    sourceRoots: [SOURCE_ROOTS.parity, SOURCE_ROOTS.parityTest, SOURCE_ROOTS.v39Spec],
    requiredEvidence: ['terminal-authority', 'acceptedNeedRequired', 'btdRightsRequiredForDelivery'],
  }),
  row({
    rowId: 'surface:conversation-terminal-handoff',
    surface: 'conversation',
    purpose:
      'Make Conversation a source-safe handoff into Terminal Reading authority rather than a parallel buyer authority.',
    sourceRoots: [SOURCE_ROOTS.parity, SOURCE_ROOTS.conversationTest, SOURCE_ROOTS.v39Spec],
    requiredEvidence: ['conversation.terminal-reading-handoff', 'terminal-delegated-handoff', 'readingStage'],
  }),
  row({
    rowId: 'surface:public-api-contract',
    surface: 'public_api',
    purpose:
      'Bind public API Reading access to accepted Need, source-safe preview, settlement, BTD rights, and delivery boundaries.',
    sourceRoots: [SOURCE_ROOTS.parity, SOURCE_ROOTS.parityTest],
    requiredEvidence: ['public_api', 'api.reading.interface', 'readLicenseContractRoot'],
  }),
  row({
    rowId: 'surface:mcp-reading-pipeline',
    surface: 'mcp_api',
    purpose:
      'Bind MCP Reading pipeline tools to source-safe queueing, accepted Need admission, and downstream Terminal authority.',
    sourceRoots: [SOURCE_ROOTS.parity, SOURCE_ROOTS.mcpTest],
    requiredEvidence: ['mcp_api', 'mcp.reading.pipeline', 'assetPackRightsContractRoot'],
  }),
  row({
    rowId: 'surface:chatgpt-app-action',
    surface: 'chatgpt_app',
    purpose:
      'Bind ChatGPT App actions to confirmation, source-safe preview, settlement unlock, and paid BTD rights delivery.',
    sourceRoots: [SOURCE_ROOTS.parity, SOURCE_ROOTS.chatgptTest],
    requiredEvidence: ['chatgpt_app', 'chatgpt.reading.action', 'settle before delivery'],
  }),
  row({
    rowId: 'surface:package-consumer-contract',
    surface: 'package_consumer',
    purpose:
      'Expose package-owned Reading interface parity as source-safe contract readback, not operational authority.',
    sourceRoots: [SOURCE_ROOTS.parity, SOURCE_ROOTS.parityTest, SOURCE_ROOTS.packageJson],
    requiredEvidence: ['package-contract-readback', './reading-interface-product-parity', 'packageConsumersReadContractsOnly'],
  }),
  row({
    rowId: 'boundary:accepted-need-source-safe-preview',
    surface: 'all',
    purpose:
      'Ensure every interface denies Finding Fits without accepted Need and exposes only source-safe preview metadata before settlement.',
    sourceRoots: [SOURCE_ROOTS.parity, SOURCE_ROOTS.postprocess, SOURCE_ROOTS.packageIndex],
    requiredEvidence: ['denied_without_accepted_need', 'source_safe_metadata_only_before_settlement', 'sourceSafePreviewOnlyBeforeSettlement'],
  }),
  row({
    rowId: 'boundary:settlement-rights-delivery',
    surface: 'all',
    purpose:
      'Ensure every interface keeps source-bearing delivery locked until BTC settlement, BTD rights transfer, and delivery authorization.',
    sourceRoots: [SOURCE_ROOTS.parity, SOURCE_ROOTS.parityTest],
    requiredEvidence: ['required_before_source_delivery', 'source_bearing_delivery_locked_until_settlement_and_rights', 'sourceBearingDeliveryAllowedBeforeSettlement: false'],
  }),
  row({
    rowId: 'proof:tests-artifact-workflow',
    surface: 'all',
    purpose:
      'Bind Gate 9 closure to package tests, Conversation handoff tests, MCP/ChatGPT interface tests, docs, workflows, and generated artifact freshness.',
    sourceRoots: [SOURCE_ROOTS.parityTest, SOURCE_ROOTS.conversationTest, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    requiredEvidence: ['check-v39-gate9-interface-conversation-product-parity.mjs', 'v39-interface-conversation-product-parity'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const parity = readSource(repoRoot, SOURCE_ROOTS.parity);
  const parityTest = readSource(repoRoot, SOURCE_ROOTS.parityTest);
  const postprocess = readSource(repoRoot, SOURCE_ROOTS.postprocess);
  const packageIndex = readSource(repoRoot, SOURCE_ROOTS.packageIndex);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const conversationTest = readSource(repoRoot, SOURCE_ROOTS.conversationTest);
  const mcpTest = readSource(repoRoot, SOURCE_ROOTS.mcpTest);
  const chatgptTest = readSource(repoRoot, SOURCE_ROOTS.chatgptTest);
  const assetPackReadme = readSource(repoRoot, SOURCE_ROOTS.assetPackReadme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v39Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v39Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v39Notes);
  const parityMatrix = readSource(repoRoot, SOURCE_ROOTS.v39Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);

  return [
    predicateResult('parity-defines-required-surfaces', SOURCE_ROOTS.parity, V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SURFACES.every((surface) => parity.includes(`'${surface}'`))),
    predicateResult('parity-defines-required-stages', SOURCE_ROOTS.parity, V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_STAGE_IDS.every((stage) => parity.includes(`'${stage}'`))),
    predicateResult('parity-enforces-terminal-authority', SOURCE_ROOTS.parity, parity.includes('sameAuthorityAsTerminal: true') && parity.includes('parallelAuthorityCreated: false')),
    predicateResult('parity-enforces-no-bypass', SOURCE_ROOTS.parity, parity.includes('denied_without_accepted_need') && parity.includes('source_bearing_delivery_locked_until_settlement_and_rights')),
    predicateResult('parity-source-safety', SOURCE_ROOTS.parity, parity.includes('source_safe_reading_interface_product_parity_metadata') && parity.includes('rawProviderResponseVisible: false') && parity.includes('credentialsSerialized: false')),
    predicateResult('parity-composes-btd-primitives', SOURCE_ROOTS.parity, parity.includes('buildBtdInterfaceContractCatalog') && parity.includes('buildBtdReadLicenseAssetPackRightsInterfaceRegistry') && parity.includes('buildBtdInterfaceConsumerUxRegressionProof')),
    predicateResult('package-exports-parity', SOURCE_ROOTS.packageJson, packageJson.includes('./reading-interface-product-parity') && packageIndex.includes("export * from './reading-interface-product-parity'")),
    predicateResult('pipeline-preprocess-emits-parity', SOURCE_ROOTS.packageIndex, packageIndex.includes('buildReadingInterfaceProductParity') && packageIndex.includes('readingInterfaceProductParity')),
    predicateResult('postprocess-emits-parity', SOURCE_ROOTS.postprocess, postprocess.includes('ensureReadingInterfaceProductParity') && postprocess.includes('readingInterfaceNoBypassReadback')),
    predicateResult('package-tests-cover-surfaces', SOURCE_ROOTS.parityTest, parityTest.includes('Conversation, API, MCP, ChatGPT App, and package consumers') && parityTest.includes('READING_INTERFACE_PRODUCT_PARITY_SURFACES')),
    predicateResult('package-tests-cover-persistence', SOURCE_ROOTS.parityTest, parityTest.includes('persists parity rows') && parityTest.includes("'reading/interfaces'")),
    predicateResult('conversation-test-covers-parity', SOURCE_ROOTS.conversationTest, conversationTest.includes('conversation.terminal-reading-handoff') && conversationTest.includes('ReadingInterfaceProductParity')),
    predicateResult('mcp-test-covers-parity', SOURCE_ROOTS.mcpTest, mcpTest.includes('ReadingInterfaceProductParity') && mcpTest.includes('mcp_api')),
    predicateResult('chatgpt-test-covers-parity', SOURCE_ROOTS.chatgptTest, chatgptTest.includes('Gate 9') && chatgptTest.includes('settle before delivery')),
    predicateResult('docs-cover-gate9', SOURCE_ROOTS.v39Spec, spec.includes('ReadingInterfaceProductParity') && spec.includes('v39-interface-conversation-product-parity')),
    predicateResult('delta-cover-gate9', SOURCE_ROOTS.v39Delta, delta.includes('ReadingInterfaceProductParity') && delta.includes('check:v39-gate9')),
    predicateResult('notes-cover-gate9', SOURCE_ROOTS.v39Notes, notes.includes('ReadingInterfaceProductParity') && notes.includes('Conversation')),
    predicateResult('parity-matrix-cover-gate9', SOURCE_ROOTS.v39Parity, parityMatrix.includes('Gate 9 Parity') && parityMatrix.includes('ReadingInterfaceProductParity')),
    predicateResult('roadmap-advanced-to-gate9', SOURCE_ROOTS.roadmap, /Current working gate: V39 Gate (?:9|10|11)\b/u.test(roadmap) && roadmap.includes('V39 Gate 9 closure anchor')),
    predicateResult('readmes-cover-gate9', SOURCE_ROOTS.assetPackReadme, assetPackReadme.includes('Interface Product Parity') && protocolReadme.includes('V39 Gate 9') && rootReadme.includes('V39 Gate 9')),
    predicateResult('workflows-cover-gate9', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v39-gate9-interface-conversation-product-parity') && canonWorkflow.includes('check-v39-gate9-interface-conversation-product-parity')),
  ];
}

export function buildV39InterfaceConversationProductParity(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const predicates = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicates.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const rows = [...V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ROWS];
  const artifactRoot = `v39-interface-conversation-product-parity:${digest(JSON.stringify({
    rows: rows.map((entry) => entry.rowRoot),
    predicates,
  }))}`;

  return {
    artifactId: 'v39-interface-conversation-product-parity',
    schemaId: V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SCHEMA_ID,
    version: V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_VERSION,
    currentTarget: V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_CURRENT_TARGET,
    generatedAt: 'deterministic',
    passed: failedPredicateIds.length === 0,
    artifactRoot,
    sourceSafetyVerdict: V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SOURCE_SAFETY_VERDICT,
    coverage: {
      rowCount: rows.length,
      surfaces: [...V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SURFACES],
      stageIds: [...V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_STAGE_IDS],
      runtimeType: 'ReadingInterfaceProductParity',
      noBypassCovered: predicates.find((predicate) => predicate.id === 'parity-enforces-no-bypass')?.passed === true,
      conversationCovered: predicates.find((predicate) => predicate.id === 'conversation-test-covers-parity')?.passed === true,
      mcpCovered: predicates.find((predicate) => predicate.id === 'mcp-test-covers-parity')?.passed === true,
      chatgptCovered: predicates.find((predicate) => predicate.id === 'chatgpt-test-covers-parity')?.passed === true,
      packageConsumerCovered: predicates.find((predicate) => predicate.id === 'package-exports-parity')?.passed === true,
      sourceSafeMetadataOnly: true,
      protectedSourcePayloadSerialized: false,
      rawProtectedPromptVisible: false,
      rawProviderResponseVisible: false,
      rawInterpolatedPromptVisible: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      credentialsSerialized: false,
      failedPredicateIds,
    },
    rows,
    predicates,
  };
}
