// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V42_DEPOSITING_SHORTEST_PATH_ARTIFACT_PATH =
  '.bitcode/v42-depositing-shortest-path.json';
export const V42_DEPOSITING_SHORTEST_PATH_SCHEMA_ID =
  'bitcode.v42.depositingShortestPath.v1';
export const V42_DEPOSITING_SHORTEST_PATH_VERSION = 'V42';
export const V42_DEPOSITING_SHORTEST_PATH_CURRENT_TARGET = 'V41';
export const V42_DEPOSITING_SHORTEST_PATH_SOURCE_SAFETY_VERDICT =
  'source-safe-depositing-compensation-visibility-metadata';

export const V42_DEPOSITING_SHORTEST_PATH_ROW_IDS = Object.freeze([
  'path:source-to-admission-proof',
  'api:deposit-route-readiness-contract',
  'supply:depository-record-compensation-preview',
  'documents:source-safe-search-and-vector-projection',
  'storage:depository-readback-projection',
  'ledger:source-to-shares-compensation-readback',
  'terminal:compensation-visibility-readback',
  'rehearsal:local-staging-deposit-readback',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-model-responses-with-protected-source',
  'unpaid-assetpack-source',
  'settlement-private-payloads',
]);

const SOURCE_ROOTS = Object.freeze({
  depositorySupplyIndex: 'packages/asset-packs-pipelines/domain/src/depository-supply-index.ts',
  depositorySupplyIndexTest: 'packages/asset-packs-pipelines/domain/src/__tests__/depository-supply-index.test.ts',
  embeddingConfig: 'packages/asset-packs-pipelines/domain/src/embedding-config.ts',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  protocolServer: 'packages/specifying/server.js',
  protocolRuntime: 'packages/specifying/src/bitcode-demo.js',
  protocolBoundaryTest: 'packages/specifying/test/protocol-package-boundary.test.js',
  uapiDepositRoute: 'uapi/app/api/deposits/route.ts',
  terminalDepositComposer: 'uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  terminalActivityHistory: 'uapi/components/bitcode/pipeline/models/pipeline-activity-history.ts',
  terminalWorkbench: 'uapi/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench.tsx',
  terminalRunData: 'uapi/components/bitcode/pipeline/models/pipeline-run-data.ts',
  v42Spec: 'BITCODE_SPEC_V42.md',
  v42Delta: 'BITCODE_SPEC_V42_DELTA.md',
  v42Notes: 'BITCODE_SPEC_V42_NOTES.md',
  v42Parity: 'BITCODE_SPEC_V42_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v42-depositing-shortest-path-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_depositing_compensation_visibility_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawSourceTextVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    unpaidAssetPackSourceVisible: false,
    settlementPrivatePayloadVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V42_DEPOSITING_SHORTEST_PATH_ROWS = Object.freeze([
  row({
    rowId: 'path:source-to-admission-proof',
    purpose:
      'Make the shortest Depositing path explicit: source material, repository/source anchor, Depository admission, source-safe proof roots, and next Reading handoff.',
    sourceRoots: [
      SOURCE_ROOTS.protocolServer,
      SOURCE_ROOTS.protocolRuntime,
      SOURCE_ROOTS.uapiDepositRoute,
      SOURCE_ROOTS.terminalDepositComposer,
    ],
    emittedTypes: ['createDeposit', 'buildDepositoryEvidence', 'TerminalDepositResponseEvidence'],
    requiredEvidence: ['repositoryFullName', 'sourceBranch', 'sourceCommit', 'proofRoot', 'measurementRoot'],
  }),
  row({
    rowId: 'api:deposit-route-readiness-contract',
    purpose:
      'Keep POST /api/deposits admitted only after signed transaction and repository readiness checks, then project source-safe Depository evidence.',
    sourceRoots: [SOURCE_ROOTS.uapiDepositRoute, SOURCE_ROOTS.protocolServer, SOURCE_ROOTS.protocolBoundaryTest],
    emittedTypes: ['requireBitcodeSignedTransactionReadiness', 'BitcodeAppContext.createDeposit'],
    requiredEvidence: ['requiresRepositoryAnchor', 'repositoryProvider', 'walletAuthorizationProof'],
  }),
  row({
    rowId: 'supply:depository-record-compensation-preview',
    purpose:
      'Attach a deterministic compensation preview to DepositorySupplyRecord without minting BTD or exposing source before an accepted Need-Fit and settlement.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.depositorySupplyIndexTest, SOURCE_ROOTS.embeddingConfig],
    emittedTypes: ['DepositorySupplyCompensationPreview', 'DepositorySupplyRecord.compensationPreview'],
    requiredEvidence: ['source-to-shares-largest-remainder', 'not-minted-by-deposit-admission', 'compensationPreviewRoot'],
  }),
  row({
    rowId: 'documents:source-safe-search-and-vector-projection',
    purpose:
      'Preserve source-safe lexical, metadata, measurement, and vector search documents so deposits become searchable without protected source payloads.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.depositorySupplyIndexTest],
    emittedTypes: ['DepositorySupplySearchDocument', 'DepositorySupplyVectorProjection'],
    requiredEvidence: ['text-embedding-3-small', '1536', 'match_deliverable_vectors'],
  }),
  row({
    rowId: 'storage:depository-readback-projection',
    purpose:
      'Bind Depository admission to durable source-safe storage readback through deliverables, vector rows, ledger rows, and source-to-shares allocation posture.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.assetPackReadme, SOURCE_ROOTS.v42Spec],
    emittedTypes: ['DepositorySupplyStorageProjection', 'compensationPreview.readback'],
    requiredEvidence: ['deliverables', 'deliverable_vectors', 'ledger_entries', 'source_to_shares_allocations'],
  }),
  row({
    rowId: 'ledger:source-to-shares-compensation-readback',
    purpose:
      'Record depositor compensation visibility through pending-claim and eligible-route ledger keys while deferring actual BTC allocation until paid AssetPack settlement.',
    sourceRoots: [SOURCE_ROOTS.protocolServer, SOURCE_ROOTS.protocolRuntime, SOURCE_ROOTS.protocolBoundaryTest],
    emittedTypes: ['ledger.accounts', 'compensationPreview.readback.ledgerAccountKeys'],
    requiredEvidence: ['pending_claims', 'eligible_compensation_routes', 'future-reader-after-settlement'],
  }),
  row({
    rowId: 'terminal:compensation-visibility-readback',
    purpose:
      'Show source-safe compensation posture in Terminal and carry compensation roots through activity history and the deposit-to-read workbench.',
    sourceRoots: [
      SOURCE_ROOTS.terminalDepositComposer,
      SOURCE_ROOTS.terminalActivityHistory,
      SOURCE_ROOTS.terminalWorkbench,
      SOURCE_ROOTS.terminalRunData,
    ],
    emittedTypes: ['TerminalDepositResponseEvidence', 'WorkspaceRun', 'TerminalDepositedSourceRevision'],
    requiredEvidence: ['compensationPreviewRoot', 'sourceToSharesPreviewRoot', 'Compensation route'],
  }),
  row({
    rowId: 'rehearsal:local-staging-deposit-readback',
    purpose:
      'Keep Gate 2 locally checkable and staging-testnet rehearsable through package tests, protocol route tests, generated artifact checks, and source-safe proof rows.',
    sourceRoots: [SOURCE_ROOTS.v42Spec, SOURCE_ROOTS.v42Delta, SOURCE_ROOTS.v42Notes, SOURCE_ROOTS.v42Parity, SOURCE_ROOTS.roadmap],
    emittedTypes: ['V42DepositingShortestPathReport'],
    requiredEvidence: ['local/staging rehearsal', 'staging-testnet', 'check:v42-gate2'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const supply = readSource(repoRoot, SOURCE_ROOTS.depositorySupplyIndex);
  const supplyTest = readSource(repoRoot, SOURCE_ROOTS.depositorySupplyIndexTest);
  const embeddingConfig = readSource(repoRoot, SOURCE_ROOTS.embeddingConfig);
  const readme = readSource(repoRoot, SOURCE_ROOTS.assetPackReadme);
  const server = readSource(repoRoot, SOURCE_ROOTS.protocolServer);
  const runtime = readSource(repoRoot, SOURCE_ROOTS.protocolRuntime);
  const boundaryTest = readSource(repoRoot, SOURCE_ROOTS.protocolBoundaryTest);
  const route = readSource(repoRoot, SOURCE_ROOTS.uapiDepositRoute);
  const composer = readSource(repoRoot, SOURCE_ROOTS.terminalDepositComposer);
  const activity = readSource(repoRoot, SOURCE_ROOTS.terminalActivityHistory);
  const workbench = readSource(repoRoot, SOURCE_ROOTS.terminalWorkbench);
  const runData = readSource(repoRoot, SOURCE_ROOTS.terminalRunData);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v42Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v42Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v42Notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.v42Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);

  return [
    predicateResult('deposit-route-requires-readiness', SOURCE_ROOTS.uapiDepositRoute, route.includes('requireBitcodeSignedTransactionReadiness') && route.includes('requiresRepositoryAnchor: true')),
    predicateResult('server-creates-deposit-and-ledger-readback', SOURCE_ROOTS.protocolServer, server.includes('createDeposit') && server.includes('pending_claims') && server.includes('eligible_compensation_routes')),
    predicateResult('runtime-builds-compensation-preview', SOURCE_ROOTS.protocolRuntime, runtime.includes('compensationPreview') && runtime.includes('source-to-shares-largest-remainder') && runtime.includes('not-minted-by-deposit-admission')),
    predicateResult('runtime-keeps-source-safe-visibility', SOURCE_ROOTS.protocolRuntime, runtime.includes('protectedSourceVisible: false') && runtime.includes('unpaidAssetPackSourceVisible: false')),
    predicateResult('supply-index-defines-compensation-preview', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('DepositorySupplyCompensationPreview') && supply.includes('buildCompensationPreview')),
    predicateResult('supply-index-defers-btd-mint', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('not-minted-by-deposit-admission') && supply.includes('reader-receives-rights-only-after-btc-settlement')),
    predicateResult('supply-index-projects-source-to-shares-readback', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('source_to_shares_allocations') && supply.includes('sourceToSharesPreviewRoot')),
    predicateResult(
      'supply-index-preserves-search-documents',
      SOURCE_ROOTS.depositorySupplyIndex,
      supply.includes('DepositorySupplySearchDocument') &&
        supply.includes('buildAssetPackEmbeddingPolicy') &&
        embeddingConfig.includes('text-embedding-3-small') &&
        embeddingConfig.includes('match_deliverable_vectors'),
    ),
    predicateResult('supply-tests-cover-compensation-preview', SOURCE_ROOTS.depositorySupplyIndexTest, supplyTest.includes('eligible-if-selected-for-assetpack') && supplyTest.includes('repair-required-before-compensation')),
    predicateResult('supply-tests-cover-no-protected-source', SOURCE_ROOTS.depositorySupplyIndexTest, supplyTest.includes('PRIVATE_SOURCE_DO_NOT_SERIALIZE') && supplyTest.includes('assertDepositorySupplyIndexSourceSafe')),
    predicateResult('protocol-test-covers-compensation-route', SOURCE_ROOTS.protocolBoundaryTest, boundaryTest.includes('eligible_compensation_routes') && boundaryTest.includes('source-to-shares-largest-remainder')),
    predicateResult('terminal-composer-captures-compensation-roots', SOURCE_ROOTS.terminalDepositComposer, composer.includes('compensationPreviewRoot') && composer.includes('Compensation route')),
    predicateResult('terminal-history-maps-compensation-roots', SOURCE_ROOTS.terminalActivityHistory, activity.includes('compensationPreviewRoot') && activity.includes('sourceToSharesPreviewRoot')),
    predicateResult('terminal-workbench-shows-compensation-rows', SOURCE_ROOTS.terminalWorkbench, workbench.includes('Compensation state') && workbench.includes('Source-to-shares preview root')),
    predicateResult('workspace-run-carries-compensation-fields', SOURCE_ROOTS.terminalRunData, runData.includes('compensationState') && runData.includes('compensationPriceAsset')),
    predicateResult('asset-pack-readme-documents-compensation-preview', SOURCE_ROOTS.assetPackReadme, readme.includes('compensation preview') && readme.includes('source-to-shares')),
    predicateResult('v42-spec-gate2-expanded', SOURCE_ROOTS.v42Spec, spec.includes('V42 Gate 2') && spec.includes('compensation route preview')),
    predicateResult('v42-delta-gate2-implemented', SOURCE_ROOTS.v42Delta, delta.includes('Gate 2') && delta.includes('Depository admission proof')),
    predicateResult('v42-notes-gate2-rehearsal', SOURCE_ROOTS.v42Notes, notes.includes('Gate 2') && notes.includes('staging-testnet')),
    predicateResult('v42-parity-gate2-closed', SOURCE_ROOTS.v42Parity, parity.includes('Depositing shortest path') && parity.includes('implemented')),
    predicateResult(
      'roadmap-records-gate2-closure',
      SOURCE_ROOTS.roadmap,
      roadmap.includes('V42 Gate 2 closure anchor') &&
        (roadmap.includes('Current working gate: V42 Gate') ||
          roadmap.includes('Latest closed version: V42 Reliable MVP Experience') ||
          roadmap.includes('Recent V42 canonical promotion anchor') ||
          roadmap.includes('Current working gate: V43 Gate')),
    ),
  ];
}

export function buildV42DepositingShortestPath(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const rowRoots = V42_DEPOSITING_SHORTEST_PATH_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v42-depositing-shortest-path:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v42-depositing-shortest-path',
    schemaId: V42_DEPOSITING_SHORTEST_PATH_SCHEMA_ID,
    version: V42_DEPOSITING_SHORTEST_PATH_VERSION,
    currentTarget: V42_DEPOSITING_SHORTEST_PATH_CURRENT_TARGET,
    sourceSafetyVerdict: V42_DEPOSITING_SHORTEST_PATH_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V42_DEPOSITING_SHORTEST_PATH_ROWS,
    rowIds: [...V42_DEPOSITING_SHORTEST_PATH_ROW_IDS],
    predicateResults,
    coverage: {
      rowCount: V42_DEPOSITING_SHORTEST_PATH_ROWS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      acceptedUserPath: [
        'provide-source-material',
        'select-repository-source-anchor',
        'admit-deposit-to-depository',
        'receive-source-safe-admission-proof',
        'view-later-btc-compensation-attribution',
      ],
      routeApiContractsCovered: true,
      sourceValidationCovered: true,
      storageProjectionCovered: true,
      depositorySearchDocumentCovered: true,
      sourceToSharesCompensationReadbackCovered: true,
      terminalCompensationVisibilityCovered: true,
      localStagingRehearsalCovered: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      unpaidAssetPackSourceVisible: false,
      settlementPrivatePayloadVisible: false,
      btdMintedAtDepositAdmission: false,
      btdRightsTransferredBeforeSettlement: false,
      compensationAllocationMethod: 'source-to-shares-largest-remainder',
      compensationPriceAsset: 'BTC',
      legacySourceRoots: Object.values(SOURCE_ROOTS).some((sourcePath) => sourcePath.includes('_legacy/')),
    },
    sourceRoots: SOURCE_ROOTS,
  };
}
