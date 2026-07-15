// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';
import {
  V46_PROTOCOL_CLAIM_AUTHORITY_IDS,
  V46_PROTOCOL_CLAIM_CATEGORY_IDS,
  V46_PROTOCOL_CLAIM_ROWS,
  V46_PROTOCOL_PRIVATE_PAYLOAD_IDS,
  V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS,
} from './v46-protocol-comprehension-object-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH =
  '.bitcode/v46-interface-claim-contracts.json';
export const V46_INTERFACE_CLAIM_CONTRACTS_SCHEMA_ID =
  'bitcode.v46.interfaceClaimContracts.v1';
export const V46_INTERFACE_CLAIM_CONTRACTS_VERSION = 'V46';
export const V46_INTERFACE_CLAIM_CONTRACTS_CURRENT_TARGET = 'V45';
export const V46_INTERFACE_CLAIM_CONTRACTS_SOURCE_SAFETY_VERDICT =
  'source-safe-interface-claim-contracts';

export const V46_INTERFACE_CLAIM_SURFACE_IDS = Object.freeze([
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'bitcode_chat',
  'package_consumer',
]);

export const V46_INTERFACE_CLAIM_CAPABILITY_IDS = Object.freeze([
  'source-safe-schema-compatibility',
  'tool-registry-contract',
  'action-registry-contract',
  'terminal-delegated-handoff',
  'proof-root-projection',
  'denied-state-repair',
  'no-parallel-state-authority',
  'source-safe-response-rendering',
  'protected-source-lock',
  'versionless-interface-paths',
]);

const SOURCE_PATHS = Object.freeze({
  activePointer: 'specifications/BITCODE_SPEC.txt',
  spec: 'specifications/BITCODE_SPEC_V46.md',
  delta: 'specifications/BITCODE_SPEC_V46_DELTA.md',
  notes: 'specifications/BITCODE_SPEC_V46_NOTES.md',
  parity: 'specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md',
  roadmap: 'specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageSource: 'scripts/specifying/src/canonical/v46-interface-claim-contracts.js',
  packageTest: 'scripts/specifying/test/v46-interface-claim-contracts.test.js',
  generator: 'scripts/generate-v46-interface-claim-contracts.mjs',
  checker: 'scripts/check-v46-gate5-interface-claim-contracts.mjs',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  btdApiSchema: 'packages/btd/src/api-schema-compatibility-matrix.ts',
  btdApiSchemaTest: 'packages/btd/__tests__/api-schema-compatibility-matrix.test.ts',
  btdMcpContract: 'packages/btd/src/mcp-tool-contract.ts',
  btdMcpContractTest: 'packages/btd/__tests__/mcp-tool-contract.test.ts',
  mcpIngressTest: 'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
  mcpDocsReference: 'apps/mcp/docs/mcp/mcp-api-reference.md',
  btdChatGptContract: 'packages/btd/src/chatgpt-app-action-contract.ts',
  btdChatGptContractTest: 'packages/btd/__tests__/chatgpt-app-action-contract.test.ts',
  chatGptTools: 'apps/chatgpt/src/tools.ts',
  chatGptToolsTest: 'apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts',
  conversationRoute: 'packages/api/src/routes/conversations.ts',
  conversationParityTest: 'apps/uapi/tests/api/conversationReadingInterfaceParity.test.ts',
  conversationHandoffTest: 'apps/uapi/components/conversations/ConversationProductHandoff/ConversationProductHandoff.tsx',
  conversationStreamLogTest: 'apps/uapi/tests/conversationStreamPipelineLog.test.tsx',
  conversationSessionHistory: 'apps/uapi/components/conversations/models/conversation-session-route-history.ts',
  v39InterfaceParity: 'scripts/specifying/src/canonical/v39-interface-conversation-product-parity.js',
});

export const V46_INTERFACE_CLAIM_CONTRACTS_SOURCE_ROOTS = Object.freeze({ ...SOURCE_PATHS });

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_INTERFACE_CLAIM_PHRASES = Object.freeze([
  'BTD is money',
  'BTD is only a read right',
  'preview discloses source',
  'quote is payment',
  'payment observation is finality',
  'database is ledger truth',
  'telemetry advances state',
  'conversation advances state',
  'ChatGPT App advances state',
  'MCP advances state',
  'API advances state without proof',
  'server custodies wallet private material',
  'value-bearing mainnet operation is live',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function sourceRoot(repoRoot, sourcePath) {
  return `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`;
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function scanSourcesForMarkers(repoRoot, sourcePaths, markers) {
  const joined = sourcePaths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return markers.filter((marker) => marker && joined.includes(marker));
}

function claimExists(claimId) {
  return V46_PROTOCOL_CLAIM_ROWS.some((row) => row.claimId === claimId);
}

function categoryExists(categoryId) {
  return V46_PROTOCOL_CLAIM_CATEGORY_IDS.includes(categoryId);
}

function authorityExists(authorityId) {
  return V46_PROTOCOL_CLAIM_AUTHORITY_IDS.includes(authorityId);
}

function requiredTokensPresent(repoRoot, row) {
  const joined = row.sourcePaths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return row.requiredCopyTokens.every((token) => joined.includes(token));
}

function interfaceRow({
  surfaceId,
  surfaceLabel,
  surfaceRole,
  sourcePaths,
  claimIds,
  claimCategoryIds,
  authorityIds,
  capabilityIds,
  requiredCopyTokens,
  readbackRoots,
  deniedStateRoots,
  operatorReading,
}) {
  return {
    surfaceId,
    surfaceLabel,
    surfaceRole,
    sourcePaths,
    claimIds,
    claimCategoryIds,
    authorityIds,
    capabilityIds,
    requiredCopyTokens,
    readbackRoots,
    deniedStateRoots,
    operatorReading,
    noParallelStateAuthority: true,
    stateAdvanceRequiresProof: true,
    interfaceGuidanceOnly: true,
    sourceSafeMetadataOnly: true,
    proofRootProjectionRequired: true,
    deniedStateRepairRequired: true,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    interpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    valueBearingMainnetAdmitted: false,
    sourceSafeFieldIds: [...V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS],
    privatePayloadIdsNeverSerialized: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    rowRoot: `v46-interface-claim-contract-row:${digest(JSON.stringify({ surfaceId, sourcePaths, capabilityIds, readbackRoots }))}`,
  };
}

export const V46_INTERFACE_CLAIM_CONTRACT_ROWS = Object.freeze([
  interfaceRow({
    surfaceId: 'public_api',
    surfaceLabel: 'API',
    surfaceRole:
      'versionless machine interface for schema-compatible source-safe requests, responses, and proof roots',
    sourcePaths: [SOURCE_PATHS.btdApiSchema, SOURCE_PATHS.btdApiSchemaTest],
    claimIds: [
      'operator-evidence-is-source-safe-readback',
      'preview-is-source-safe-measurement',
      'quote-is-source-safe-offer',
      'finality-authorizes-rights-and-delivery',
      'repair-fails-closed',
      'telemetry-is-observability-only',
    ],
    claimCategoryIds: [
      'product-guidance',
      'operator-evidence',
      'preview-claim',
      'quote-claim',
      'rights-claim',
      'repair-claim',
      'telemetry-observability',
    ],
    authorityIds: ['canonical-specification', 'generated-proof', 'database-projection', 'interface-guidance-only'],
    capabilityIds: [
      'source-safe-schema-compatibility',
      'proof-root-projection',
      'denied-state-repair',
      'no-parallel-state-authority',
      'protected-source-lock',
      'versionless-interface-paths',
    ],
    requiredCopyTokens: [
      'BTD_API_SCHEMA_COMPATIBILITY_CONSUMER_SURFACES',
      "'public_api'",
      "versionlessPathDiscipline: 'enforced'",
      'protectedSourceSerialized: false',
      'missing consumer surfaces',
      'missing example postures',
    ],
    readbackRoots: ['matrixRoot', 'requestExampleRoot', 'responseExampleRoot'],
    deniedStateRoots: ['breaking_change_denied', 'blocked_until_rights', 'stale_rejected', 'deferred_not_admitted'],
    operatorReading:
      'API contracts expose source-safe schema compatibility and proof-root examples; they do not become ledger or delivery authority.',
  }),
  interfaceRow({
    surfaceId: 'mcp_api',
    surfaceLabel: 'MCP',
    surfaceRole:
      'tool-call interface for source-safe AssetPack pipeline ingress under API-key, permission, provider-binding, and schema policy',
    sourcePaths: [
      SOURCE_PATHS.btdMcpContract,
      SOURCE_PATHS.btdMcpContractTest,
      SOURCE_PATHS.mcpIngressTest,
      SOURCE_PATHS.mcpDocsReference,
    ],
    claimIds: [
      'assetpack-is-commodity',
      'operator-evidence-is-source-safe-readback',
      'preview-is-source-safe-measurement',
      'finality-authorizes-rights-and-delivery',
      'repair-fails-closed',
      'telemetry-is-observability-only',
    ],
    claimCategoryIds: [
      'protocol-law',
      'product-guidance',
      'operator-evidence',
      'preview-claim',
      'rights-claim',
      'repair-claim',
      'telemetry-observability',
    ],
    authorityIds: ['canonical-specification', 'generated-proof', 'telemetry-observability-only', 'interface-guidance-only'],
    capabilityIds: [
      'tool-registry-contract',
      'source-safe-schema-compatibility',
      'proof-root-projection',
      'denied-state-repair',
      'no-parallel-state-authority',
      'protected-source-lock',
    ],
    requiredCopyTokens: [
      'bitcode://pipelines/asset-pack/create',
      'interface.authorization.pipeline-permission',
      'pipelines.create',
      'protected-source-locked',
      'writeAdmission',
      'PROVIDER_BINDING_REQUIRED',
      'ReadingInterfaceProductParity',
      'mcp_api',
    ],
    readbackRoots: ['contractRoot', 'requestRoot', 'responseRoot', 'writeAdmission'],
    deniedStateRoots: [
      'MISSING_API_KEY',
      'INSUFFICIENT_PERMISSIONS',
      'PROVIDER_BINDING_REQUIRED',
      'SCHEMA_VALIDATION_FAILED',
      'RATE_LIMITED',
      'UNKNOWN_TOOL',
    ],
    operatorReading:
      'MCP may queue source-safe pipeline work through a package-owned tool contract, but settlement, rights, and delivery remain proof-gated.',
  }),
  interfaceRow({
    surfaceId: 'chatgpt_app',
    surfaceLabel: 'ChatGPT App',
    surfaceRole:
      'conversational action surface for the Reading sequence with source-safe renderers, denied-state repairs, and explicit write admission',
    sourcePaths: [
      SOURCE_PATHS.btdChatGptContract,
      SOURCE_PATHS.btdChatGptContractTest,
      SOURCE_PATHS.chatGptTools,
      SOURCE_PATHS.chatGptToolsTest,
    ],
    claimIds: [
      'btd-is-weighted-scalar-volume-and-settled-rights',
      'preview-is-source-safe-measurement',
      'quote-is-source-safe-offer',
      'payment-observation-is-not-finality',
      'finality-authorizes-rights-and-delivery',
      'delivery-is-entitled-source-unlock',
      'repair-fails-closed',
    ],
    claimCategoryIds: [
      'protocol-law',
      'product-guidance',
      'preview-claim',
      'quote-claim',
      'settlement-claim',
      'rights-claim',
      'delivery-claim',
      'repair-claim',
    ],
    authorityIds: ['canonical-specification', 'generated-proof', 'wallet-provider-receipt', 'repository-delivery-receipt', 'interface-guidance-only'],
    capabilityIds: [
      'action-registry-contract',
      'source-safe-response-rendering',
      'proof-root-projection',
      'denied-state-repair',
      'no-parallel-state-authority',
      'protected-source-lock',
    ],
    requiredCopyTokens: [
      'BTD_CHATGPT_APP_ACTION_CONTRACT_IDS',
      'bitcode_request_read',
      'bitcode_deliver_asset_pack',
      'chatgpt.sourceSafeRenderer',
      'writeAdmission',
      'Settlement finality is required',
      'Bitcode ChatGPT App write admission requires confirmed: true',
      'settle before delivery',
    ],
    readbackRoots: ['contractRoot', 'requestRoot', 'responseRoot', 'sourceSafeRendererId', 'writeAdmission'],
    deniedStateRoots: ['READ_NEED_REQUIRED', 'FINDING_FITS_REQUIRED', 'SETTLEMENT_REQUIRED', 'READ_LICENSE_REQUIRED', 'CONFIRMATION_REQUIRED'],
    operatorReading:
      'ChatGPT App actions guide the Reading sequence and render source-safe proof roots; they cannot expose locked AssetPack contents before settlement and rights transfer.',
  }),
  interfaceRow({
    surfaceId: 'bitcode_chat',
    surfaceLabel: 'Bitcode Chat',
    surfaceRole:
      'website conversation overlay for workflow assistance, stream readback, and Terminal-delegated Reading handoff',
    sourcePaths: [
      SOURCE_PATHS.conversationRoute,
      SOURCE_PATHS.conversationParityTest,
      SOURCE_PATHS.conversationHandoffTest,
      SOURCE_PATHS.conversationStreamLogTest,
      SOURCE_PATHS.conversationSessionHistory,
    ],
    claimIds: [
      'operator-evidence-is-source-safe-readback',
      'preview-is-source-safe-measurement',
      'finality-authorizes-rights-and-delivery',
      'delivery-is-entitled-source-unlock',
      'repair-fails-closed',
      'telemetry-is-observability-only',
    ],
    claimCategoryIds: [
      'product-guidance',
      'operator-evidence',
      'preview-claim',
      'settlement-claim',
      'rights-claim',
      'delivery-claim',
      'repair-claim',
      'telemetry-observability',
    ],
    authorityIds: ['canonical-specification', 'generated-proof', 'telemetry-observability-only', 'interface-guidance-only'],
    capabilityIds: [
      'terminal-delegated-handoff',
      'source-safe-response-rendering',
      'proof-root-projection',
      'denied-state-repair',
      'no-parallel-state-authority',
      'protected-source-lock',
    ],
    requiredCopyTokens: [
      'Conversation Reading interface parity',
      'terminal-delegated-handoff',
      'conversation.terminal-reading-handoff',
      'source_bearing_delivery_locked_until_settlement_and_rights',
      'Conversation stream proof roots anchored',
      'source_safe_conversation_stream_event_metadata',
      'source_safe_conversation_session_metadata',
      'Conversation write failed closed.',
    ],
    readbackRoots: ['proofRoot', 'conversationStreamEvent', 'persistencePrivacyProofRoot', 'terminalRoute'],
    deniedStateRoots: ['acceptedNeedGate', 'deliveryBoundary', 'Conversation write failed closed'],
    operatorReading:
      'Bitcode Chat is a source-safe conversation and handoff surface; Terminal/product routes and proof-backed receipts remain state authority.',
  }),
  interfaceRow({
    surfaceId: 'package_consumer',
    surfaceLabel: 'Package Consumer',
    surfaceRole:
      'package-level contract readback for consumers that need stable source-safe semantics without operational authority',
    sourcePaths: [SOURCE_PATHS.btdApiSchema, SOURCE_PATHS.btdApiSchemaTest, SOURCE_PATHS.v39InterfaceParity],
    claimIds: [
      'assetpack-is-commodity',
      'btd-is-weighted-scalar-volume-and-settled-rights',
      'operator-evidence-is-source-safe-readback',
      'repair-fails-closed',
      'telemetry-is-observability-only',
    ],
    claimCategoryIds: ['protocol-law', 'operator-evidence', 'product-guidance', 'repair-claim', 'telemetry-observability'],
    authorityIds: ['canonical-specification', 'generated-proof', 'interface-guidance-only'],
    capabilityIds: [
      'source-safe-schema-compatibility',
      'proof-root-projection',
      'denied-state-repair',
      'no-parallel-state-authority',
      'protected-source-lock',
      'versionless-interface-paths',
    ],
    requiredCopyTokens: [
      "'package_consumer'",
      'package-consumer-exchange-hook-deferred',
      'deferred_not_admitted',
      'packageConsumersReadContractsOnly',
      'parallelAuthorityCreated: false',
      'sameAuthorityAsTerminal: true',
    ],
    readbackRoots: ['matrixRoot', 'rowRoot', 'registryRoot'],
    deniedStateRoots: ['deferred_not_admitted', 'packageConsumersReadContractsOnly'],
    operatorReading:
      'Package consumers can inspect source-safe contracts and compatibility posture, but they cannot bypass website, API, settlement, rights, or delivery authority.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const spec = readSource(repoRoot, SOURCE_PATHS.spec);
  const delta = readSource(repoRoot, SOURCE_PATHS.delta);
  const notes = readSource(repoRoot, SOURCE_PATHS.notes);
  const parity = readSource(repoRoot, SOURCE_PATHS.parity);
  const roadmap = readSource(repoRoot, SOURCE_PATHS.roadmap);
  const readme = readSource(repoRoot, SOURCE_PATHS.readme);
  const protocolReadme = readSource(repoRoot, SOURCE_PATHS.protocolReadme);
  const packageJson = readSource(repoRoot, SOURCE_PATHS.packageJson);
  const packageIndex = readSource(repoRoot, SOURCE_PATHS.packageIndex);
  const packageTypes = readSource(repoRoot, SOURCE_PATHS.packageTypes);
  const packageSource = readSource(repoRoot, SOURCE_PATHS.packageSource);
  const packageTest = readSource(repoRoot, SOURCE_PATHS.packageTest);
  const generator = readSource(repoRoot, SOURCE_PATHS.generator);
  const checker = readSource(repoRoot, SOURCE_PATHS.checker);
  const gateWorkflow = readSource(repoRoot, SOURCE_PATHS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_PATHS.canonWorkflow);

  return [
    predicateResult('active-pointer-supports-v46-draft-or-later', SOURCE_PATHS.activePointer, bitcodeVersionAtLeast(readSource(repoRoot, SOURCE_PATHS.activePointer), 'V45')),
    predicateResult('spec-defines-gate5-law', SOURCE_PATHS.spec, spec.includes('V46 interface claim contract law') && spec.includes(V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH)),
    predicateResult('delta-records-gate5', SOURCE_PATHS.delta, delta.includes('Gate 5: API/MCP, ChatGPT App, And Bitcode Chat Claim Contracts') && delta.includes(V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH)),
    predicateResult('notes-records-gate5', SOURCE_PATHS.notes, notes.includes('V46 interface claim contract atom') && notes.includes('InterfaceClaim contracts')),
    predicateResult('parity-records-gate5', SOURCE_PATHS.parity, parity.includes('V46InterfaceClaimContracts') && parity.includes(V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH)),
    predicateResult(
      'roadmap-records-gate5-closure',
      SOURCE_PATHS.roadmap,
      roadmap.includes('V46 Gate 5 closure anchor') &&
        roadmap.includes('V46InterfaceClaimContracts') &&
        roadmap.includes(V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH),
    ),
    predicateResult('readmes-document-gate5', SOURCE_PATHS.readme, readme.includes('V46 Gate 5') && protocolReadme.includes('V46InterfaceClaimContracts')),
    predicateResult('package-source-defines-surfaces', SOURCE_PATHS.packageSource, V46_INTERFACE_CLAIM_SURFACE_IDS.every((surfaceId) => packageSource.includes(`'${surfaceId}'`))),
    predicateResult('package-source-defines-capabilities', SOURCE_PATHS.packageSource, V46_INTERFACE_CLAIM_CAPABILITY_IDS.every((capabilityId) => packageSource.includes(`'${capabilityId}'`))),
    predicateResult('package-exports-gate5', SOURCE_PATHS.packageIndex, packageIndex.includes("v46-interface-claim-contracts.js") && packageTypes.includes('V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH')),
    predicateResult('package-test-covers-gate5', SOURCE_PATHS.packageTest, packageTest.includes('V46 interface claim contracts') && packageTest.includes('bitcode_chat')),
    predicateResult('generator-and-checker-exist', SOURCE_PATHS.generator, generator.includes('buildV46InterfaceClaimContracts') && checker.includes('V46 Gate 5 interface claim contracts check')),
    predicateResult('package-json-scripts', SOURCE_PATHS.packageJson, packageJson.includes('generate:v46-interface-claim-contracts') && packageJson.includes('check:v46-gate5')),
    predicateResult('workflows-run-gate5', SOURCE_PATHS.gateWorkflow, gateWorkflow.includes('check-v46-gate5-interface-claim-contracts.mjs') && canonWorkflow.includes('check-v46-gate5-interface-claim-contracts.mjs')),
    predicateResult('btd-api-schema-binds-surfaces', SOURCE_PATHS.btdApiSchema, readSource(repoRoot, SOURCE_PATHS.btdApiSchema).includes('BTD_API_SCHEMA_COMPATIBILITY_CONSUMER_SURFACES')),
    predicateResult('mcp-contract-binds-tool', SOURCE_PATHS.btdMcpContract, readSource(repoRoot, SOURCE_PATHS.btdMcpContract).includes('bitcode://pipelines/asset-pack/create')),
    predicateResult('chatgpt-contract-binds-actions', SOURCE_PATHS.btdChatGptContract, readSource(repoRoot, SOURCE_PATHS.btdChatGptContract).includes('bitcode_request_finding_fits')),
    predicateResult('conversation-binds-terminal-handoff', SOURCE_PATHS.conversationParityTest, readSource(repoRoot, SOURCE_PATHS.conversationParityTest).includes('conversation.terminal-reading-handoff')),
  ];
}

export function buildV46InterfaceClaimContracts(input = {}) {
  const repoRoot = input.repoRoot ? path.resolve(input.repoRoot) : DEFAULT_REPO_ROOT;
  const rows = V46_INTERFACE_CLAIM_CONTRACT_ROWS.map((row) => ({
    ...row,
    sourceRoots: row.sourcePaths.map((sourcePath) => sourceRoot(repoRoot, sourcePath)),
    sourceFilesPresent: row.sourcePaths.every((sourcePath) => sourceExists(repoRoot, sourcePath)),
    requiredCopyPresent: requiredTokensPresent(repoRoot, row),
  }));
  const sourcePathsToScan = [...new Set(rows.flatMap((row) => row.sourcePaths))];
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const allClaimIds = rows.flatMap((row) => row.claimIds);
  const allCategoryIds = rows.flatMap((row) => row.claimCategoryIds);
  const allAuthorityIds = rows.flatMap((row) => row.authorityIds);
  const allCapabilityIds = rows.flatMap((row) => row.capabilityIds);
  const rowsMissingRequiredCopy = rows.filter((row) => !row.requiredCopyPresent).map((row) => row.surfaceId);
  const rowsMissingSourceFiles = rows.filter((row) => !row.sourceFilesPresent).map((row) => row.surfaceId);
  const forbiddenPhraseHits = scanSourcesForMarkers(repoRoot, sourcePathsToScan, FORBIDDEN_INTERFACE_CLAIM_PHRASES);
  const secretMarkerHits = scanSourcesForMarkers(repoRoot, sourcePathsToScan, SECRET_MARKERS);

  const coverage = {
    predicateCount: predicateResults.length,
    failedPredicateIds,
    allSurfacesCovered: V46_INTERFACE_CLAIM_SURFACE_IDS.every((surfaceId) => rows.some((row) => row.surfaceId === surfaceId)),
    allClaimIdsKnown: allClaimIds.every(claimExists),
    allCategoryIdsKnown: allCategoryIds.every(categoryExists),
    allAuthorityIdsKnown: allAuthorityIds.every(authorityExists),
    requiredCapabilitiesCovered: V46_INTERFACE_CLAIM_CAPABILITY_IDS.every((capabilityId) => allCapabilityIds.includes(capabilityId)),
    sourceFilesPresent: rowsMissingSourceFiles.length === 0,
    rowsMissingSourceFiles,
    rowsMissingRequiredCopy,
    allRowsRequireProofRootProjection: rows.every((row) => row.proofRootProjectionRequired === true),
    allRowsRequireDeniedStateRepair: rows.every((row) => row.deniedStateRepairRequired === true),
    noParallelStateAuthority: rows.every((row) => row.noParallelStateAuthority === true),
    stateAdvanceRequiresProof: rows.every((row) => row.stateAdvanceRequiresProof === true),
    sourceSafeMetadataOnly: rows.every((row) => row.sourceSafeMetadataOnly === true),
    protectedSourceVisible: rows.some((row) => row.protectedSourceVisible),
    unpaidAssetPackSourceVisible: rows.some((row) => row.unpaidAssetPackSourceVisible),
    rawPromptVisible: rows.some((row) => row.rawPromptVisible),
    interpolatedPromptVisible: rows.some((row) => row.interpolatedPromptVisible),
    rawProviderResponseVisible: rows.some((row) => row.rawProviderResponseVisible),
    credentialsSerialized: rows.some((row) => row.credentialsSerialized),
    walletPrivateMaterialVisible: rows.some((row) => row.walletPrivateMaterialVisible),
    settlementPrivatePayloadVisible: rows.some((row) => row.settlementPrivatePayloadVisible),
    valueBearingMainnetAdmitted: rows.some((row) => row.valueBearingMainnetAdmitted),
    forbiddenPhraseHits,
    secretMarkerHits,
  };

  const artifactBody = {
    surfaceIds: [...V46_INTERFACE_CLAIM_SURFACE_IDS],
    capabilityIds: [...V46_INTERFACE_CLAIM_CAPABILITY_IDS],
    rowRoots: rows.map((row) => row.rowRoot),
    coverage,
  };

  const passed =
    failedPredicateIds.length === 0 &&
    coverage.allSurfacesCovered &&
    coverage.allClaimIdsKnown &&
    coverage.allCategoryIdsKnown &&
    coverage.allAuthorityIdsKnown &&
    coverage.requiredCapabilitiesCovered &&
    coverage.sourceFilesPresent &&
    coverage.rowsMissingRequiredCopy.length === 0 &&
    coverage.allRowsRequireProofRootProjection &&
    coverage.allRowsRequireDeniedStateRepair &&
    coverage.noParallelStateAuthority &&
    coverage.stateAdvanceRequiresProof &&
    coverage.sourceSafeMetadataOnly &&
    coverage.protectedSourceVisible === false &&
    coverage.unpaidAssetPackSourceVisible === false &&
    coverage.rawPromptVisible === false &&
    coverage.interpolatedPromptVisible === false &&
    coverage.rawProviderResponseVisible === false &&
    coverage.credentialsSerialized === false &&
    coverage.walletPrivateMaterialVisible === false &&
    coverage.settlementPrivatePayloadVisible === false &&
    coverage.valueBearingMainnetAdmitted === false &&
    coverage.forbiddenPhraseHits.length === 0 &&
    coverage.secretMarkerHits.length === 0;

  return {
    artifactId: 'v46-interface-claim-contracts',
    schemaId: V46_INTERFACE_CLAIM_CONTRACTS_SCHEMA_ID,
    version: V46_INTERFACE_CLAIM_CONTRACTS_VERSION,
    currentTarget: V46_INTERFACE_CLAIM_CONTRACTS_CURRENT_TARGET,
    sourceSafetyVerdict: V46_INTERFACE_CLAIM_CONTRACTS_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot: `v46-interface-claim-contracts:${digest(JSON.stringify(artifactBody))}`,
    sourceRoots: Object.fromEntries(Object.values(SOURCE_PATHS).map((sourcePath) => [sourcePath, sourceRoot(repoRoot, sourcePath)])),
    surfaceIds: [...V46_INTERFACE_CLAIM_SURFACE_IDS],
    capabilityIds: [...V46_INTERFACE_CLAIM_CAPABILITY_IDS],
    interfaceRows: rows,
    predicateResults,
    coverage,
    passed,
  };
}
