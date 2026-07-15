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

export const V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH =
  '.bitcode/v46-local-interface-comprehension-rehearsal.json';
export const V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SCHEMA_ID =
  'bitcode.v46.localInterfaceComprehensionRehearsal.v1';
export const V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_VERSION = 'V46';
export const V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_CURRENT_TARGET = 'V45';
export const V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-local-interface-comprehension-rehearsal';

export const V46_LOCAL_INTERFACE_REHEARSAL_SURFACE_IDS = Object.freeze([
  'docs_landing',
  'packs_route',
  'read_route',
  'deposit_route',
  'api_mcp',
  'chatgpt_bitcode_chat',
  'proof_telemetry_repair',
]);

export const V46_LOCAL_INTERFACE_REHEARSAL_STEP_IDS = Object.freeze([
  'load-local-source',
  'identify-interface-claims',
  'verify-source-safe-disclosure',
  'verify-evidence-authority',
  'verify-denied-state-repair',
  'emit-source-safe-rehearsal-root',
]);

export const V46_LOCAL_INTERFACE_REHEARSAL_REQUIRED_ARTIFACT_IDS = Object.freeze([
  'v46-protocol-comprehension-object-model',
  'v46-public-operator-claim-boundaries',
  'v46-product-route-comprehension-readback',
  'v46-interface-claim-contracts',
  'v46-proof-readback-operator-explanation',
]);

const SOURCE_PATHS = Object.freeze({
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V46.md',
  delta: 'BITCODE_SPEC_V46_DELTA.md',
  notes: 'BITCODE_SPEC_V46_NOTES.md',
  parity: 'BITCODE_SPEC_V46_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'packages/specifying/README.md',
  packageJson: 'package.json',
  packageIndex: 'packages/specifying/src/index.js',
  packageTypes: 'packages/specifying/src/index.d.ts',
  packageSource: 'packages/specifying/src/canonical/v46-local-interface-comprehension-rehearsal.js',
  packageTest: 'packages/specifying/test/v46-local-interface-comprehension-rehearsal.test.js',
  generator: 'scripts/generate-v46-local-interface-comprehension-rehearsal.mjs',
  checker: 'scripts/check-v46-gate7-local-interface-comprehension-rehearsal.mjs',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  v46ProtocolArtifact: '.bitcode/v46-protocol-comprehension-object-model.json',
  v46PublicArtifact: '.bitcode/v46-public-operator-claim-boundaries.json',
  v46ProductArtifact: '.bitcode/v46-product-route-comprehension-readback.json',
  v46InterfaceArtifact: '.bitcode/v46-interface-claim-contracts.json',
  v46ProofArtifact: '.bitcode/v46-proof-readback-operator-explanation.json',
  landingPage: 'apps/uapi/app/page.tsx',
  docsPage: 'apps/uapi/app/docs/page.tsx',
  docsContent: 'apps/uapi/components/marketing/PublicDocsPageContent/PublicDocsPageContent.tsx',
  packsPage: 'apps/uapi/app/packs/page.tsx',
  packsClient: 'apps/uapi/app/packs/PacksPageClient.tsx',
  packActivityModel: 'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  readPage: 'apps/uapi/app/read/page.tsx',
  readClient: 'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
  depositPage: 'apps/uapi/app/deposit/page.tsx',
  depositClient: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  btdApiSchema: 'packages/btd/src/api-schema-compatibility-matrix.ts',
  btdMcpContract: 'packages/btd/src/mcp-tool-contract.ts',
  mcpDocsReference: 'apps/mcp/docs/mcp/mcp-api-reference.md',
  btdChatGptContract: 'packages/btd/src/chatgpt-app-action-contract.ts',
  chatGptTools: 'apps/chatgpt/src/tools.ts',
  conversationHandoff: 'apps/uapi/components/conversations/models/conversation-product-handoff.ts',
  conversationTelemetry: 'apps/uapi/components/conversations/models/conversation-telemetry-proof-hooks.ts',
  conversationParityTest: 'apps/uapi/tests/api/conversationReadingInterfaceParity.test.ts',
  pipelineLogUi: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  v39OperationalTelemetryReadback:
    'packages/specifying/src/canonical/v39-operational-telemetry-repair-readback.js',
  uapiLedgerStorageSync: 'apps/uapi/app/bitcode-ledger-storage-sync.ts',
});

export const V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_PATHS,
});

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

const FORBIDDEN_REHEARSAL_PHRASES = Object.freeze([
  'preview discloses source',
  'quote is payment',
  'payment observation is finality',
  'database is ledger truth',
  'telemetry advances state',
  'conversation advances state',
  'ChatGPT App advances state',
  'MCP advances state',
  'proof roots reveal source',
  'value-bearing mainnet operation is live',
]);

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function root(prefix, value) {
  return `${prefix}:${digest(typeof value === 'string' ? value : JSON.stringify(value))}`;
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

function roadmapCurrentWorkingGateVersionAtLeast(roadmap, minimumVersion) {
  const match = String(roadmap ?? '').match(/Current working gate:\s+(V\d+)/u);
  return match ? bitcodeVersionAtLeast(match[1], minimumVersion) : false;
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function artifactPassed(repoRoot, sourcePath, artifactId) {
  const text = readSource(repoRoot, sourcePath);
  if (!text) return false;
  try {
    const parsed = JSON.parse(text);
    return parsed.artifactId === artifactId && parsed.passed === true;
  } catch {
    return false;
  }
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

function rehearsalRow({
  surfaceId,
  surfaceLabel,
  sourcePaths,
  claimIds,
  claimCategoryIds,
  authorityIds,
  requiredCopyTokens,
  expectedReadback,
  repairExpectation,
}) {
  return {
    surfaceId,
    surfaceLabel,
    sourcePaths,
    claimIds,
    claimCategoryIds,
    authorityIds,
    stepIds: [...V46_LOCAL_INTERFACE_REHEARSAL_STEP_IDS],
    requiredCopyTokens,
    expectedReadback,
    repairExpectation,
    localOnly: true,
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    interpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    valueBearingMainnetAdmitted: false,
    noParallelStateAuthority: true,
    stateAdvanceRequiresProofRoot: true,
    sourceSafeFieldIds: [...V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS],
    privatePayloadIdsNeverSerialized: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    rowRoot: root('v46-local-interface-rehearsal-row', { surfaceId, claimIds, authorityIds }),
  };
}

export const V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ROWS = Object.freeze([
  rehearsalRow({
    surfaceId: 'docs_landing',
    surfaceLabel: 'Public Docs And Landing',
    sourcePaths: [SOURCE_PATHS.landingPage, SOURCE_PATHS.docsPage, SOURCE_PATHS.docsContent],
    claimIds: [
      'assetpack-is-commodity',
      'btd-is-weighted-scalar-volume-and-settled-rights',
      'operator-evidence-is-source-safe-readback',
    ],
    claimCategoryIds: ['protocol-law', 'product-guidance', 'operator-evidence'],
    authorityIds: ['canonical-specification', 'generated-proof', 'interface-guidance-only'],
    requiredCopyTokens: [
      'Bitcode public home for AssetPacks',
      'Learn Bitcode from AssetPacks to proof.',
      'Public docs explain; proof readback decides.',
    ],
    expectedReadback:
      'The local public route and docs route explain AssetPacks, BTD scalar volume and rights, BTC settlement, proof readback, and interface boundaries without live state authority.',
    repairExpectation:
      'If public copy overclaims state authority, route copy returns to source-safe explanation and proof readback remains decisive.',
  }),
  rehearsalRow({
    surfaceId: 'packs_route',
    surfaceLabel: '/packs',
    sourcePaths: [SOURCE_PATHS.packsPage, SOURCE_PATHS.packsClient, SOURCE_PATHS.packActivityModel],
    claimIds: [
      'operator-evidence-is-source-safe-readback',
      'preview-is-source-safe-measurement',
      'repair-fails-closed',
      'telemetry-is-observability-only',
    ],
    claimCategoryIds: ['product-guidance', 'operator-evidence', 'preview-claim', 'repair-claim'],
    authorityIds: ['canonical-specification', 'database-projection', 'generated-proof', 'interface-guidance-only'],
    requiredCopyTokens: [
      'Search pack activity',
      'Search titles, measurements, values, proof roots',
      'assertPackActivitySourceSafe',
      'unpaidAssetPackSourceVisible: false',
    ],
    expectedReadback:
      '/packs rehearses searchable PackActivity master-detail readback with source-safe measurements, values, proof roots, settlement, delivery, compensation, and repair state.',
    repairExpectation:
      'If PackActivity source-safety assertion fails, the route must hold the row in repair instead of projecting source-bearing detail.',
  }),
  rehearsalRow({
    surfaceId: 'read_route',
    surfaceLabel: '/read',
    sourcePaths: [SOURCE_PATHS.readPage, SOURCE_PATHS.readClient],
    claimIds: [
      'operator-evidence-is-source-safe-readback',
      'preview-is-source-safe-measurement',
      'quote-is-source-safe-offer',
      'finality-authorizes-rights-and-delivery',
    ],
    claimCategoryIds: ['product-guidance', 'preview-claim', 'quote-claim', 'settlement-claim', 'rights-claim'],
    authorityIds: ['canonical-specification', 'generated-proof', 'interface-guidance-only', 'ledger-readback'],
    requiredCopyTokens: [
      'Request Reading, review synthesized Needs',
      'Read request -> Need -> Finding Fits -> Preview -> Settlement.',
      'Visible: Need measurements, fit ids, proof roots, fee quotes',
      'Withheld until paid',
    ],
    expectedReadback:
      '/read rehearses the five-step Reading path from request through Need review, Finding Fits, source-safe preview, quote, settlement, BTD rights, and delivery boundary.',
    repairExpectation:
      'If Need, quote, finality, or delivery proof is missing, the route keeps the Reader at the narrowest source-safe step.',
  }),
  rehearsalRow({
    surfaceId: 'deposit_route',
    surfaceLabel: '/deposit',
    sourcePaths: [SOURCE_PATHS.depositPage, SOURCE_PATHS.depositClient],
    claimIds: [
      'deposit-option-is-potential-supply',
      'assetpack-is-commodity',
      'operator-evidence-is-source-safe-readback',
      'compensation-follows-source-to-shares',
    ],
    claimCategoryIds: ['product-guidance', 'protocol-law', 'operator-evidence', 'compensation-claim'],
    authorityIds: ['canonical-specification', 'generated-proof', 'database-projection', 'interface-guidance-only'],
    requiredCopyTokens: [
      'source-safe AssetPack deposit options',
      'Source-safe AssetPack proposals',
      'estimated ROI, BTD potential, compensation metadata.',
      'Withheld: raw source, unpaid AssetPack source',
    ],
    expectedReadback:
      '/deposit rehearses source-safe deposit option synthesis, review, policy, admission, BTD potential, and compensation posture without final Need-relative BTD claims.',
    repairExpectation:
      'If source criticality, ROI, or admission evidence is unsafe or missing, the route blocks Depository admission and keeps raw source withheld.',
  }),
  rehearsalRow({
    surfaceId: 'api_mcp',
    surfaceLabel: 'API And MCP',
    sourcePaths: [SOURCE_PATHS.btdApiSchema, SOURCE_PATHS.btdMcpContract, SOURCE_PATHS.mcpDocsReference],
    claimIds: [
      'operator-evidence-is-source-safe-readback',
      'preview-is-source-safe-measurement',
      'finality-authorizes-rights-and-delivery',
      'repair-fails-closed',
    ],
    claimCategoryIds: ['product-guidance', 'operator-evidence', 'preview-claim', 'rights-claim', 'repair-claim'],
    authorityIds: ['canonical-specification', 'generated-proof', 'interface-guidance-only'],
    requiredCopyTokens: [
      'BTD_API_SCHEMA_COMPATIBILITY_CONSUMER_SURFACES',
      'bitcode://pipelines/asset-pack/create',
      'protected-source-locked',
      'MCP API Reference',
    ],
    expectedReadback:
      'API and MCP rehearse versionless source-safe request/response contracts, proof-root projection, protected-source locks, and denied-state repair.',
    repairExpectation:
      'If schema, permission, provider binding, or protected-source lock evidence is missing, machine interfaces deny writes and emit repair state.',
  }),
  rehearsalRow({
    surfaceId: 'chatgpt_bitcode_chat',
    surfaceLabel: 'ChatGPT App And Bitcode Chat',
    sourcePaths: [
      SOURCE_PATHS.btdChatGptContract,
      SOURCE_PATHS.chatGptTools,
      SOURCE_PATHS.conversationHandoff,
      SOURCE_PATHS.conversationTelemetry,
      SOURCE_PATHS.conversationParityTest,
    ],
    claimIds: [
      'preview-is-source-safe-measurement',
      'payment-observation-is-not-finality',
      'delivery-is-entitled-source-unlock',
      'telemetry-is-observability-only',
    ],
    claimCategoryIds: ['product-guidance', 'preview-claim', 'settlement-claim', 'delivery-claim', 'telemetry-observability'],
    authorityIds: ['canonical-specification', 'generated-proof', 'telemetry-observability-only', 'interface-guidance-only'],
    requiredCopyTokens: [
      'BTD_CHATGPT_APP_ACTION_CONTRACT_IDS',
      'bitcode_request_read',
      'terminal-delegated-handoff',
      'source_safe_conversation_telemetry_metadata',
      'source_bearing_delivery_locked_until_settlement_and_rights',
    ],
    expectedReadback:
      'ChatGPT App and Bitcode Chat rehearse guided Reading actions, source-safe response rendering, delegated handoff, telemetry proof roots, and delivery lock boundaries.',
    repairExpectation:
      'If conversational state conflicts with route/proof state, conversation remains guidance-only and hands off to product proof readback.',
  }),
  rehearsalRow({
    surfaceId: 'proof_telemetry_repair',
    surfaceLabel: 'Proof, Telemetry, And Repair Readback',
    sourcePaths: [
      SOURCE_PATHS.pipelineLogUi,
      SOURCE_PATHS.v39OperationalTelemetryReadback,
      SOURCE_PATHS.uapiLedgerStorageSync,
      SOURCE_PATHS.v46ProofArtifact,
    ],
    claimIds: [
      'operator-evidence-is-source-safe-readback',
      'telemetry-is-observability-only',
      'repair-fails-closed',
      'payment-observation-is-not-finality',
    ],
    claimCategoryIds: ['operator-evidence', 'telemetry-observability', 'repair-claim', 'settlement-claim'],
    authorityIds: [
      'generated-proof',
      'telemetry-observability-only',
      'database-projection',
      'ledger-readback',
      'interface-guidance-only',
    ],
    requiredCopyTokens: [
      'promptDisclosurePosture',
      'source_safe_reading_operational_telemetry_repair_readback_metadata',
      'BITCODE_LEDGER_STORAGE_SYNC_CONTRACT',
      'v46-proof-readback-operator-explanation',
    ],
    expectedReadback:
      'Proof, telemetry, and repair rehearsal confirms local stream UI can show phases, steps, proof roots, disclosure posture, and metadata while preserving evidence authority hierarchy.',
    repairExpectation:
      'If telemetry, database projection, ledger, storage, wallet, or delivery evidence disagree, repair fails closed and telemetry stays observability only.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_PATHS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-pointer-supports-v46-draft-or-later', SOURCE_PATHS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V45')),
    predicateResult(
      'spec-defines-gate7-law',
      SOURCE_PATHS.spec,
      sources.spec.includes('V46 local interface comprehension rehearsal law') &&
        sources.spec.includes(V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate7',
      SOURCE_PATHS.delta,
      sources.delta.includes('Gate 7: Local Interface Comprehension Rehearsal') &&
        sources.delta.includes(V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-records-gate7',
      SOURCE_PATHS.notes,
      sources.notes.includes('V46 local interface comprehension rehearsal atom') &&
        sources.notes.includes('local surface readback rehearsal'),
    ),
    predicateResult(
      'parity-records-gate7',
      SOURCE_PATHS.parity,
      sources.parity.includes('V46LocalInterfaceComprehensionRehearsal') &&
        sources.parity.includes(V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-advanced-to-gate7',
      SOURCE_PATHS.roadmap,
      (sources.roadmap.includes('Current working gate: V46 Gate 7 Local Interface Comprehension Rehearsal') &&
        sources.roadmap.includes('V46 Gate 6 closure anchor')) ||
        (sources.roadmap.includes('V46 Gate 7 closure anchor') &&
          sources.roadmap.includes('Current working gate: V46 Gate 8 Promotion Readiness And Canonical Promotion')) ||
        (sources.roadmap.includes('V46 Gate 7 closure anchor') &&
          sources.roadmap.includes('V46 Gate 8 closure anchor') &&
          roadmapCurrentWorkingGateVersionAtLeast(sources.roadmap, 'V47')),
    ),
    predicateResult(
      'readmes-document-gate7',
      SOURCE_PATHS.readme,
      sources.readme.includes('V46 Gate 7') && sources.protocolReadme.includes('V46LocalInterfaceComprehensionRehearsal'),
    ),
    predicateResult(
      'prior-v46-artifacts-pass',
      SOURCE_PATHS.v46ProtocolArtifact,
      V46_LOCAL_INTERFACE_REHEARSAL_REQUIRED_ARTIFACT_IDS.every((artifactId) => {
        const sourcePath =
          artifactId === 'v46-protocol-comprehension-object-model'
            ? SOURCE_PATHS.v46ProtocolArtifact
            : artifactId === 'v46-public-operator-claim-boundaries'
              ? SOURCE_PATHS.v46PublicArtifact
              : artifactId === 'v46-product-route-comprehension-readback'
                ? SOURCE_PATHS.v46ProductArtifact
                : artifactId === 'v46-interface-claim-contracts'
                  ? SOURCE_PATHS.v46InterfaceArtifact
                  : SOURCE_PATHS.v46ProofArtifact;
        return artifactPassed(repoRoot, sourcePath, artifactId);
      }),
    ),
    predicateResult(
      'package-exports-gate7',
      SOURCE_PATHS.packageIndex,
      sources.packageIndex.includes('v46-local-interface-comprehension-rehearsal.js') &&
        sources.packageTypes.includes('V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH'),
    ),
    predicateResult(
      'package-test-covers-gate7',
      SOURCE_PATHS.packageTest,
      sources.packageTest.includes('V46 local interface comprehension rehearsal') &&
        sources.packageTest.includes('chatgpt_bitcode_chat'),
    ),
    predicateResult(
      'generator-and-checker-exist',
      SOURCE_PATHS.generator,
      sources.generator.includes('buildV46LocalInterfaceComprehensionRehearsal') &&
        sources.checker.includes('V46 Gate 7 local interface comprehension rehearsal check'),
    ),
    predicateResult(
      'package-json-scripts',
      SOURCE_PATHS.packageJson,
      sources.packageJson.includes('generate:v46-local-interface-comprehension-rehearsal') &&
        sources.packageJson.includes('check:v46-gate7'),
    ),
    predicateResult(
      'workflows-run-gate7',
      SOURCE_PATHS.gateWorkflow,
      sources.gateWorkflow.includes('check-v46-gate7-local-interface-comprehension-rehearsal.mjs') &&
        sources.canonWorkflow.includes('check-v46-gate7-local-interface-comprehension-rehearsal.mjs'),
    ),
  ];
}

export function buildV46LocalInterfaceComprehensionRehearsal(input = {}) {
  const repoRoot = input.repoRoot ? path.resolve(input.repoRoot) : DEFAULT_REPO_ROOT;
  const rows = V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ROWS.map((row) => ({
    ...row,
    sourceRoots: row.sourcePaths.map((sourcePath) => sourceRoot(repoRoot, sourcePath)),
    sourceFilesPresent: row.sourcePaths.every((sourcePath) => sourceExists(repoRoot, sourcePath)),
    requiredCopyPresent: requiredTokensPresent(repoRoot, row),
  }));
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const allClaimIds = rows.flatMap((row) => row.claimIds);
  const allCategoryIds = rows.flatMap((row) => row.claimCategoryIds);
  const allAuthorityIds = rows.flatMap((row) => row.authorityIds);
  const rowsMissingRequiredCopy = rows.filter((row) => !row.requiredCopyPresent).map((row) => row.surfaceId);
  const rowsMissingSourceFiles = rows.filter((row) => !row.sourceFilesPresent).map((row) => row.surfaceId);
  const sourcePathsToScan = [
    SOURCE_PATHS.spec,
    SOURCE_PATHS.delta,
    SOURCE_PATHS.notes,
    SOURCE_PATHS.parity,
    SOURCE_PATHS.roadmap,
    SOURCE_PATHS.readme,
    SOURCE_PATHS.protocolReadme,
    SOURCE_PATHS.packageTest,
    SOURCE_PATHS.generator,
    SOURCE_PATHS.checker,
  ];
  const forbiddenPhraseHits = scanSourcesForMarkers(repoRoot, sourcePathsToScan, FORBIDDEN_REHEARSAL_PHRASES);
  const secretMarkerHits = scanSourcesForMarkers(repoRoot, sourcePathsToScan, SECRET_MARKERS);
  const priorArtifactResults = V46_LOCAL_INTERFACE_REHEARSAL_REQUIRED_ARTIFACT_IDS.map((artifactId) => {
    const sourcePath =
      artifactId === 'v46-protocol-comprehension-object-model'
        ? SOURCE_PATHS.v46ProtocolArtifact
        : artifactId === 'v46-public-operator-claim-boundaries'
          ? SOURCE_PATHS.v46PublicArtifact
          : artifactId === 'v46-product-route-comprehension-readback'
            ? SOURCE_PATHS.v46ProductArtifact
            : artifactId === 'v46-interface-claim-contracts'
              ? SOURCE_PATHS.v46InterfaceArtifact
              : SOURCE_PATHS.v46ProofArtifact;
    return {
      artifactId,
      sourcePath,
      passed: artifactPassed(repoRoot, sourcePath, artifactId),
      sourceRoot: sourceRoot(repoRoot, sourcePath),
    };
  });

  const coverage = {
    predicateCount: predicateResults.length,
    failedPredicateIds,
    surfaceCount: rows.length,
    stepCount: V46_LOCAL_INTERFACE_REHEARSAL_STEP_IDS.length,
    allSurfacesCovered: V46_LOCAL_INTERFACE_REHEARSAL_SURFACE_IDS.every((id) =>
      rows.some((row) => row.surfaceId === id),
    ),
    allStepsCovered: rows.every((row) =>
      V46_LOCAL_INTERFACE_REHEARSAL_STEP_IDS.every((id) => row.stepIds.includes(id)),
    ),
    allPriorArtifactsPassed: priorArtifactResults.every((artifact) => artifact.passed),
    allClaimIdsKnown: allClaimIds.every(claimExists),
    allCategoryIdsKnown: allCategoryIds.every(categoryExists),
    allAuthorityIdsKnown: allAuthorityIds.every(authorityExists),
    sourceFilesPresent: rows.every((row) => row.sourceFilesPresent),
    rowsMissingSourceFiles,
    rowsMissingRequiredCopy,
    localOnly: rows.every((row) => row.localOnly),
    sourceSafeMetadataOnly: rows.every((row) => row.sourceSafeMetadataOnly),
    noParallelStateAuthority: rows.every((row) => row.noParallelStateAuthority),
    stateAdvanceRequiresProofRoot: rows.every((row) => row.stateAdvanceRequiresProofRoot),
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

  const passed =
    failedPredicateIds.length === 0 &&
    coverage.allSurfacesCovered &&
    coverage.allStepsCovered &&
    coverage.allPriorArtifactsPassed &&
    coverage.allClaimIdsKnown &&
    coverage.allCategoryIdsKnown &&
    coverage.allAuthorityIdsKnown &&
    coverage.sourceFilesPresent &&
    rowsMissingRequiredCopy.length === 0 &&
    coverage.localOnly &&
    coverage.sourceSafeMetadataOnly &&
    coverage.noParallelStateAuthority &&
    coverage.stateAdvanceRequiresProofRoot &&
    coverage.protectedSourceVisible === false &&
    coverage.unpaidAssetPackSourceVisible === false &&
    coverage.rawPromptVisible === false &&
    coverage.interpolatedPromptVisible === false &&
    coverage.rawProviderResponseVisible === false &&
    coverage.credentialsSerialized === false &&
    coverage.walletPrivateMaterialVisible === false &&
    coverage.settlementPrivatePayloadVisible === false &&
    coverage.valueBearingMainnetAdmitted === false &&
    forbiddenPhraseHits.length === 0 &&
    secretMarkerHits.length === 0;

  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_PATHS).map(([key, sourcePath]) => [key, sourceRoot(repoRoot, sourcePath)]),
  );
  const artifactRoot = root('v46-local-interface-comprehension-rehearsal', {
    surfaceIds: V46_LOCAL_INTERFACE_REHEARSAL_SURFACE_IDS,
    stepIds: V46_LOCAL_INTERFACE_REHEARSAL_STEP_IDS,
    rows,
    predicateResults,
    priorArtifactResults,
  });

  return {
    artifactId: 'v46-local-interface-comprehension-rehearsal',
    schemaId: V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SCHEMA_ID,
    version: V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_VERSION,
    currentTarget: V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_CURRENT_TARGET,
    sourceSafetyVerdict: V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    rehearsalStatus: passed ? 'completed_source_safe_local' : 'repair_required',
    passed,
    surfaceIds: [...V46_LOCAL_INTERFACE_REHEARSAL_SURFACE_IDS],
    stepIds: [...V46_LOCAL_INTERFACE_REHEARSAL_STEP_IDS],
    requiredArtifactIds: [...V46_LOCAL_INTERFACE_REHEARSAL_REQUIRED_ARTIFACT_IDS],
    rows,
    priorArtifactResults,
    predicateResults,
    sourceRoots,
    coverage,
    sourceSafety: {
      sourceSafetyVerdict: V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SOURCE_SAFETY_VERDICT,
      sourceSafeMetadataOnly: true,
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
    },
  };
}
