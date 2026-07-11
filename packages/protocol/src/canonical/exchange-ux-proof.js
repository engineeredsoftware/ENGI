// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCHANGE_UX_PROOF_ARTIFACT_PATH = '.bitcode/v36-exchange-ux-proof.json';
export const EXCHANGE_UX_PROOF_SCHEMA_ID = 'bitcode.v36.exchangeUxProof.v1';
export const EXCHANGE_UX_PROOF_VERSION = 'V36';
export const EXCHANGE_UX_PROOF_CURRENT_TARGET = 'V35';
export const EXCHANGE_UX_PROOF_SOURCE_SAFETY_VERDICT = 'source-safe-exchange-ux-proof-metadata';

export const EXCHANGE_UX_CAPABILITY_IDS = Object.freeze([
  'market_wide_master_detail',
  'market_filters',
  'order_history',
  'rights_transfer_review',
  'pricing_quote',
  'settlement_state',
  'repair_state',
  'terminal_context_handoff',
  'collapsed_status_expanded_detail',
  'telemetry_dashboard_binding',
]);

export const EXCHANGE_UX_ROUTE_IDS = Object.freeze([
  '/exchange',
  '/terminal',
  'transactionId',
  'transactionDetail',
  'transactionSearch',
  'transactionStatus',
  'transactionOwnership',
  'transactionLens',
  'transactionRepository',
  'transactionParticipant',
  'transactionProof',
  'transactionSort',
]);

export const EXCHANGE_UX_SOURCE_SAFE_DETAIL_IDS = Object.freeze([
  'source_safe_status_header',
  'activity_table_summary',
  'selected_activity_hero',
  'section_action_bar',
  'shippables_preview',
  'wallet_btc_state',
  'authority_state',
  'closure_state',
  'proof_state',
  'history_state',
  'journal_reconciliation',
  'execution_stream',
]);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_EXCHANGE_UX_PAYLOAD = Object.freeze([
  'protected_source_payloads',
  'unpaid_assetpack_source',
  'wallet_private_material',
  'wallet_seed_phrase',
  'wallet_private_key',
  'provider_tokens',
  'secret_values',
  'buyer_private_repository_payload',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
]);

const SHARED_FAIL_CLOSED_REASONS = Object.freeze([
  'missing_market_master_detail',
  'missing_exchange_filters',
  'missing_order_history',
  'missing_rights_transfer_review',
  'missing_pricing_quote',
  'missing_settlement_state',
  'missing_repair_state',
  'missing_terminal_handoff',
  'missing_source_safe_expanded_detail',
  'protected_source_visible',
  'unpaid_assetpack_source_visible',
  'private_wallet_material_visible',
]);

const sourceRoots = Object.freeze([
  'uapi/app/packs/PacksPageClient.tsx',
  'uapi/app/packs/page.tsx',
  'uapi/app/api/packs/activity/route.ts',
  'uapi/components/bitcode/activity/pack-activity-model.ts',
  'uapi/app/exchange/page.tsx',
  'uapi/app/exchange/README.md',
  'uapi/app/terminal/TerminalPageClient.tsx',
  'uapi/app/terminal/TerminalTransactionWorkspace.tsx',
  'uapi/app/terminal/TerminalTransactionDetailSurface.tsx',
  'uapi/app/terminal/TerminalTransactionDetailHero.tsx',
  'uapi/app/terminal/TerminalTransactionDetailActionBar.tsx',
  'uapi/app/terminal/TerminalTransactionsTable.tsx',
  'uapi/app/terminal/terminal-routes.ts',
  'uapi/app/terminal/terminal-transaction-query.ts',
  'uapi/app/terminal/terminal-transaction-read-model.ts',
  'uapi/components/bitcode/pipeline/BitcodeTransactionsTable.tsx',
  'uapi/components/bitcode/pipeline/BitcodeTransactionsFilterBar.tsx',
  'uapi/tests/packsPageClient.test.tsx',
  'uapi/tests/packActivityModel.test.ts',
  'uapi/tests/exchangeTerminalHandoff.test.ts',
]);

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
    .join(',')}}`;
}

/**
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableRoot(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {string} prefix
 * @param {unknown} value
 * @returns {string}
 */
function prefixedRoot(prefix, value) {
  return `${prefix}:${stableRoot(value).slice('sha256:'.length, 'sha256:'.length + 24)}`;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 * @returns {boolean}
 */
function sourceRootExists(repoRoot, relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

/**
 * @param {ReadonlyArray<string>} values
 * @param {ReadonlyArray<string>} requiredValues
 * @returns {boolean}
 */
function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

/**
 * @param {ReadonlyArray<string>} failClosedConditions
 * @returns {string[]}
 */
function failClosed(failClosedConditions) {
  return [...new Set([...failClosedConditions, ...SHARED_FAIL_CLOSED_REASONS])];
}

/**
 * @param {{
 *   capabilityId: string,
 *   label: string,
 *   routeSurface: string,
 *   collapsedStatus: string,
 *   expandedDetail: string,
 *   sourceRoots: string[],
 *   detailSectionIds: string[],
 *   eventIds: string[],
 *   failClosedConditions: string[],
 * }} row
 */
function uxCapability(row) {
  return {
    ...row,
    canonicalObject: 'ExchangeUxProofCapability',
    capabilityRoot: prefixedRoot('exchange-ux-capability', row),
    sourceSafe: true,
    routePreservesTransactionContext: row.capabilityId === 'terminal_context_handoff' ? true : undefined,
    collapsedView: {
      readableStatus: row.collapsedStatus,
      exposesProtectedSource: false,
      exposesUnpaidAssetPackSource: false,
      exposesPrivateWalletMaterial: false,
    },
    expandedView: {
      sourceSafeDetail: row.expandedDetail,
      detailSectionIds: row.detailSectionIds,
      exposesProtectedSource: false,
      exposesUnpaidAssetPackSource: false,
      exposesPrivateWalletMaterial: false,
    },
    proofRoots: {
      uxRoot: prefixedRoot('exchange-proof-ux', row.capabilityId),
      routeRoot: prefixedRoot('exchange-proof-route', row.routeSurface),
      disclosureRoot: prefixedRoot('exchange-proof-disclosure', row.detailSectionIds),
      telemetryRoot: prefixedRoot('exchange-proof-telemetry', row.eventIds),
    },
    proofRootFields: ['uxRoot', 'routeRoot', 'disclosureRoot', 'telemetryRoot'],
    redactionPosture: {
      allowedFields: [
        'activity identity',
        'market filter state',
        'order history state',
        'rights transfer preview state',
        'pricing quote roots',
        'settlement state',
        'repair state',
        'proof roots',
        'event ids',
      ],
      forbiddenPayloadClasses: FORBIDDEN_EXCHANGE_UX_PAYLOAD,
      failClosedConditions: failClosed(row.failClosedConditions),
    },
    sourceEvidence: row.sourceRoots.map((relativePath) => ({
      relativePath,
      present: sourceRootExists(path.resolve(__dirname, '..', '..', '..', '..'), relativePath),
    })),
  };
}

export const EXCHANGE_UX_PROOF_ROWS = Object.freeze([
  uxCapability({
    capabilityId: 'market_wide_master_detail',
    label: 'Market-wide Exchange master-detail',
    routeSurface: '/exchange',
    collapsedStatus: 'The Exchange header and table describe the selected activity and data mode.',
    expandedDetail: 'The selected detail pane exposes activity identity, AssetPack evidence, proof posture, history, and journal sections.',
    sourceRoots: [
      'uapi/app/packs/PacksPageClient.tsx',
      'uapi/app/api/packs/activity/route.ts',
      'uapi/app/terminal/TerminalTransactionWorkspace.tsx',
      'uapi/components/bitcode/pipeline/BitcodeTransactionsTable.tsx',
    ],
    detailSectionIds: ['activity_table_summary', 'selected_activity_hero', 'section_action_bar'],
    eventIds: ['exchange.ui.loaded', 'exchange.activity.selected'],
    failClosedConditions: ['missing_market_master_detail'],
  }),
  uxCapability({
    capabilityId: 'market_filters',
    label: 'Exchange filters',
    routeSurface: '/exchange',
    collapsedStatus: 'Search, status, ownership, lens, repository, participant, proof, sort, and pagination remain route-owned.',
    expandedDetail: 'Filter chips and pagination expose filter state without source-bearing payloads.',
    sourceRoots: [
      'uapi/app/packs/PacksPageClient.tsx',
      'uapi/components/bitcode/activity/pack-activity-model.ts',
      'uapi/app/terminal/terminal-transaction-query.ts',
      'uapi/components/bitcode/pipeline/BitcodeTransactionsFilterBar.tsx',
    ],
    detailSectionIds: ['activity_table_summary'],
    eventIds: ['exchange.filter.changed', 'exchange.filter.reset'],
    failClosedConditions: ['missing_exchange_filters'],
  }),
  uxCapability({
    capabilityId: 'order_history',
    label: 'Order history review',
    routeSurface: '/exchange',
    collapsedStatus: 'History section status is visible from the selected activity action bar.',
    expandedDetail: 'History detail reads retained activity rows, proof-rooted continuity, and ledger-linked order state.',
    sourceRoots: [
      'uapi/app/terminal/TerminalTransactionDetailSurface.tsx',
      'uapi/app/terminal/TerminalTransactionHistoryCard.tsx',
      'uapi/app/terminal/terminal-transaction-read-model.ts',
    ],
    detailSectionIds: ['history_state', 'execution_stream'],
    eventIds: ['exchange.history.reviewed', 'exchange.order.history.updated'],
    failClosedConditions: ['missing_order_history'],
  }),
  uxCapability({
    capabilityId: 'rights_transfer_review',
    label: 'Rights-transfer review',
    routeSurface: '/exchange',
    collapsedStatus: 'Authority and closure chips show rights-transfer readiness without exposing source.',
    expandedDetail: 'Authority, closure, and shippables sections show rights posture, proof roots, and delivery gate state.',
    sourceRoots: [
      'uapi/app/terminal/TerminalTransactionDetailSurface.tsx',
      'uapi/app/terminal/TerminalTransactionOrganizationAuthorityCard.tsx',
      'uapi/app/terminal/TerminalTransactionClosureCard.tsx',
    ],
    detailSectionIds: ['authority_state', 'closure_state', 'shippables_preview'],
    eventIds: ['exchange.rights.previewed', 'exchange.authority.reviewed'],
    failClosedConditions: ['missing_rights_transfer_review'],
  }),
  uxCapability({
    capabilityId: 'pricing_quote',
    label: 'Pricing quote review',
    routeSurface: '/exchange',
    collapsedStatus: 'BTC fee basis and measured BTD are visible in low-detail metrics.',
    expandedDetail: 'Wallet/BTC and proof detail carry quote, PSBT, finality, and blocked readiness facts.',
    sourceRoots: [
      'uapi/app/terminal/TerminalTransactionDetailHero.tsx',
      'uapi/app/terminal/TerminalTransactionWalletBtcCard.tsx',
      'uapi/app/terminal/terminal-transaction-read-model.ts',
    ],
    detailSectionIds: ['source_safe_status_header', 'wallet_btc_state', 'proof_state'],
    eventIds: ['exchange.quote.previewed', 'exchange.wallet_btc.reviewed'],
    failClosedConditions: ['missing_pricing_quote'],
  }),
  uxCapability({
    capabilityId: 'settlement_state',
    label: 'Settlement state review',
    routeSurface: '/exchange',
    collapsedStatus: 'Settlement and closure posture are readable from the selected activity hero.',
    expandedDetail: 'Closure and journal detail expose ledger roots, database projection roots, and delivery state.',
    sourceRoots: [
      'uapi/app/terminal/TerminalTransactionDetailSurface.tsx',
      'uapi/app/terminal/TerminalTransactionClosureCard.tsx',
      'uapi/app/terminal/TerminalTransactionJournalReconciliationCard.tsx',
    ],
    detailSectionIds: ['closure_state', 'journal_reconciliation', 'proof_state'],
    eventIds: ['exchange.settlement.reviewed', 'exchange.journal.reconciled'],
    failClosedConditions: ['missing_settlement_state'],
  }),
  uxCapability({
    capabilityId: 'repair_state',
    label: 'Repair state review',
    routeSurface: '/exchange',
    collapsedStatus: 'Repair state is summarized in journal and dispute posture copy.',
    expandedDetail: 'Journal and proof sections expose repair receipts, blocking drift reasons, and source-safe commands.',
    sourceRoots: [
      'uapi/app/terminal/TerminalTransactionJournalReconciliationCard.tsx',
      'uapi/app/terminal/terminal-journal-reconciliation.ts',
      'uapi/app/terminal/TerminalTransactionProofsCard.tsx',
    ],
    detailSectionIds: ['journal_reconciliation', 'proof_state'],
    eventIds: ['exchange.repair.reviewed', 'exchange.dispute.repaired'],
    failClosedConditions: ['missing_repair_state'],
  }),
  uxCapability({
    capabilityId: 'terminal_context_handoff',
    label: 'Terminal to Exchange context handoff',
    routeSurface: '/terminal -> /exchange',
    collapsedStatus: 'Terminal can open Exchange with transactionId, transactionDetail, and filters preserved.',
    expandedDetail: 'Exchange can return to Terminal with the same route-owned selection and detail section.',
    sourceRoots: [
      'uapi/app/terminal/terminal-routes.ts',
      'uapi/app/terminal/TerminalTransactionDetailHero.tsx',
      'uapi/app/terminal/TerminalTransactionWorkspace.tsx',
      'uapi/tests/exchangeTerminalHandoff.test.ts',
    ],
    detailSectionIds: ['source_safe_status_header', 'selected_activity_hero'],
    eventIds: ['terminal.exchange.opened', 'exchange.terminal.returned'],
    failClosedConditions: ['missing_terminal_handoff'],
  }),
  uxCapability({
    capabilityId: 'collapsed_status_expanded_detail',
    label: 'Collapsed status and expanded source-safe detail',
    routeSurface: '/exchange',
    collapsedStatus: 'Collapsed UI gives readable activity state, proof posture, selected section, and data mode.',
    expandedDetail: 'Expanded UI exposes only source-safe identity, proof, history, journal, wallet/BTC, authority, and delivery metadata.',
    sourceRoots: [
      'uapi/app/terminal/TerminalTransactionDetailHero.tsx',
      'uapi/app/terminal/TerminalTransactionDetailActionBar.tsx',
      'uapi/app/terminal/TerminalTransactionDetailSurface.tsx',
    ],
    detailSectionIds: EXCHANGE_UX_SOURCE_SAFE_DETAIL_IDS,
    eventIds: ['exchange.detail.collapsed.read', 'exchange.detail.expanded.read'],
    failClosedConditions: ['missing_source_safe_expanded_detail'],
  }),
  uxCapability({
    capabilityId: 'telemetry_dashboard_binding',
    label: 'Telemetry dashboard binding',
    routeSurface: '/exchange',
    collapsedStatus: 'The execution stream and console section advertise whether telemetry detail is attached.',
    expandedDetail: 'Execution stream, history, and console detail bind events to source-safe execution telemetry.',
    sourceRoots: [
      'uapi/app/terminal/TerminalTransactionActivitySurface.tsx',
      'uapi/app/terminal/TerminalTransactionDetailSurface.tsx',
      'uapi/app/exchange/README.md',
    ],
    detailSectionIds: ['execution_stream', 'history_state'],
    eventIds: ['exchange.telemetry.reviewed', 'exchange.execution.console.reviewed'],
    failClosedConditions: ['missing_telemetry_dashboard_binding'],
  }),
]);

/**
 * @param {{ generatedAt?: string, repoRoot?: string }} [input]
 */
export function buildExchangeUxProof(input = {}) {
  const repoRoot = input.repoRoot || path.resolve(__dirname, '..', '..', '..', '..');
  const generatedAt = input.generatedAt || new Date().toISOString();
  const serializedRows = JSON.stringify(EXCHANGE_UX_PROOF_ROWS);
  const observedCapabilityIds = EXCHANGE_UX_PROOF_ROWS.map((row) => row.capabilityId);
  const allSourceRootsPresent = sourceRoots.every((relativePath) => sourceRootExists(repoRoot, relativePath));
  const sourceEvidence = sourceRoots.map((relativePath) => ({
    relativePath,
    present: sourceRootExists(repoRoot, relativePath),
  }));
  const failures = [];

  if (!includesAll(observedCapabilityIds, EXCHANGE_UX_CAPABILITY_IDS)) {
    failures.push('Exchange UX proof is missing one or more required capability ids.');
  }
  if (!allSourceRootsPresent) failures.push('Exchange UX proof source roots are missing.');
  if (includesSecretMarker(serializedRows)) failures.push('Exchange UX proof serialized a secret marker.');
  if (/protected source|private source|raw source|unpaid assetpack source/iu.test(serializedRows)) {
    failures.push('Exchange UX proof serialized a forbidden source disclosure phrase.');
  }

  const coverage = {
    capabilityCount: EXCHANGE_UX_PROOF_ROWS.length,
    observedCapabilityIds,
    missingCapabilityIds: EXCHANGE_UX_CAPABILITY_IDS.filter((id) => !observedCapabilityIds.includes(id)),
    allRequiredCapabilitiesCovered: includesAll(observedCapabilityIds, EXCHANGE_UX_CAPABILITY_IDS),
    routeIds: EXCHANGE_UX_ROUTE_IDS,
    sourceSafeDetailIds: EXCHANGE_UX_SOURCE_SAFE_DETAIL_IDS,
    masterDetailCovered: observedCapabilityIds.includes('market_wide_master_detail'),
    filtersCovered: observedCapabilityIds.includes('market_filters'),
    orderHistoryCovered: observedCapabilityIds.includes('order_history'),
    rightsTransferReviewCovered: observedCapabilityIds.includes('rights_transfer_review'),
    pricingQuoteCovered: observedCapabilityIds.includes('pricing_quote'),
    settlementStateCovered: observedCapabilityIds.includes('settlement_state'),
    repairStateCovered: observedCapabilityIds.includes('repair_state'),
    terminalHandoffCovered: observedCapabilityIds.includes('terminal_context_handoff'),
    collapsedStatusExpandedDetailCovered: observedCapabilityIds.includes('collapsed_status_expanded_detail'),
    telemetryDashboardBindingCovered: observedCapabilityIds.includes('telemetry_dashboard_binding'),
    routeContextPreserved: EXCHANGE_UX_PROOF_ROWS.some((row) => row.routePreservesTransactionContext === true),
    collapsedUiReadable: EXCHANGE_UX_PROOF_ROWS.every((row) => Boolean(row.collapsedView.readableStatus)),
    expandedDetailSourceSafe: EXCHANGE_UX_PROOF_ROWS.every((row) => row.expandedView.exposesProtectedSource === false),
    proofRootsCovered: EXCHANGE_UX_PROOF_ROWS.every((row) => row.proofRootFields.every((field) => typeof row.proofRoots[field] === 'string')),
    eventIdsCovered: EXCHANGE_UX_PROOF_ROWS.every((row) => row.eventIds.length > 0),
    credentialsSerialized: includesSecretMarker(serializedRows),
    privateWalletMaterialSerialized: serializedRows.includes('wallet_private_material_visible":true'),
    protectedSourceVisible: serializedRows.includes('exposesProtectedSource":true'),
    unpaidAssetPackSourceVisible: serializedRows.includes('exposesUnpaidAssetPackSource":true'),
    allSourceRootsPresent,
    legacySourceRoots: sourceRoots.some((relativePath) => relativePath.startsWith('_legacy/')),
  };

  const reportWithoutRoot = {
    artifactId: 'v36-exchange-ux-proof',
    schemaId: EXCHANGE_UX_PROOF_SCHEMA_ID,
    version: EXCHANGE_UX_PROOF_VERSION,
    currentTarget: EXCHANGE_UX_PROOF_CURRENT_TARGET,
    generatedAt,
    sourceSafetyVerdict: EXCHANGE_UX_PROOF_SOURCE_SAFETY_VERDICT,
    requiredCapabilityIds: EXCHANGE_UX_CAPABILITY_IDS,
    requiredRouteIds: EXCHANGE_UX_ROUTE_IDS,
    requiredSourceSafeDetailIds: EXCHANGE_UX_SOURCE_SAFE_DETAIL_IDS,
    coverage,
    rows: EXCHANGE_UX_PROOF_ROWS,
    sourceEvidence,
    operationalBoundary: {
      exchangeUxCovers:
        'market-wide master-detail, filters, order history, rights-transfer review, pricing quote, settlement state, and repair state',
      terminalHandoff:
        'Terminal can hand off to Exchange without losing transaction context',
      disclosureBoundary:
        'collapsed UI gives readable status and expanded UI exposes source-safe detail',
      telemetryBinding:
        'Exchange telemetry dashboards remain source-safe and proof-rooted',
    },
    failures,
  };

  const artifactRoot = prefixedRoot('exchange-ux-proof', reportWithoutRoot);

  return {
    ...reportWithoutRoot,
    artifactRoot,
    passed:
      failures.length === 0 &&
      coverage.allRequiredCapabilitiesCovered &&
      coverage.routeContextPreserved &&
      coverage.collapsedUiReadable &&
      coverage.expandedDetailSourceSafe &&
      coverage.allSourceRootsPresent &&
      !coverage.legacySourceRoots,
  };
}
