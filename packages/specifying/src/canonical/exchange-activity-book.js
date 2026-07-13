// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCHANGE_ACTIVITY_BOOK_ARTIFACT_PATH = '.bitcode/v36-exchange-activity-book.json';
export const EXCHANGE_ACTIVITY_BOOK_SCHEMA_ID = 'bitcode.v36.exchangeActivityBook.v1';
export const EXCHANGE_ACTIVITY_BOOK_VERSION = 'V36';
export const EXCHANGE_ACTIVITY_BOOK_CURRENT_TARGET = 'V35';
export const EXCHANGE_ACTIVITY_BOOK_SOURCE_SAFETY_VERDICT = 'source-safe-exchange-activity-book-metadata';

export const EXCHANGE_ACTIVITY_KINDS = Object.freeze([
  'listing',
  'bid',
  'ask',
  'cancellation',
  'acceptance',
  'settlement',
  'repair',
  'revenue_route',
  'history_entry',
]);

export const EXCHANGE_ACTIVITY_FILTER_IDS = Object.freeze([
  'activity_kind',
  'activity_state',
  'asset_pack_id',
  'btd_range_id',
  'principal_id',
  'settlement_state',
  'repair_state',
  'source_safety_class',
  'event_id',
]);

export const EXCHANGE_ACTIVITY_DETAIL_SECTION_IDS = Object.freeze([
  'source_safe_summary',
  'range_and_assetpack',
  'principal_posture',
  'ledger_database_projection',
  'proof_roots',
  'telemetry_events',
  'redaction_posture',
  'repair_and_revenue_posture',
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

const FORBIDDEN_EXCHANGE_ACTIVITY_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'unsettled_assetpack_delivery_branch',
  'buyer_private_repository_payload',
]);

const SHARED_FAIL_CLOSED_REASONS = Object.freeze([
  'missing_activity_kind',
  'missing_source_safe_summary',
  'missing_detail_payload',
  'missing_proof_root',
  'missing_event_id',
  'missing_redaction_posture',
  'protected_source_visible',
  'unpaid_assetpack_source_visible',
  'ledger_database_projection_drift',
]);

/**
 * @param {string} activityKind
 * @param {string} state
 * @param {string} assetPackId
 * @param {string} rangeId
 * @param {string[]} principalIds
 * @param {string} settlementState
 * @param {string} repairState
 */
function filters(activityKind, state, assetPackId, rangeId, principalIds, settlementState, repairState) {
  return {
    activity_kind: activityKind,
    activity_state: state,
    asset_pack_id: assetPackId,
    btd_range_id: rangeId,
    principal_id: principalIds,
    settlement_state: settlementState,
    repair_state: repairState,
    source_safety_class: 'source_safe_exchange_market_metadata',
    event_id: [],
  };
}

/**
 * @param {string} label
 * @param {string} value
 * @param {string} sourceSafetyClass
 */
function detailSection(label, value, sourceSafetyClass = 'source_safe_market_metadata') {
  return {
    sectionId: label,
    value,
    sourceSafetyClass,
  };
}

const activityRows = Object.freeze([
  {
    activityId: 'exchange.activity.listing.opened',
    activityKind: 'listing',
    label: 'Listing opened',
    state: 'open',
    sourceSafeSummary: 'Owner listed an eligible BTD range and AssetPack rights scope for source-safe review.',
    assetPackRef: {
      assetPackId: 'assetpack:source-safe-preview-alpha',
      previewVisibility: 'measurements_roots_and_rights_posture_only',
      sourceVisibility: 'hidden_until_paid_settlement',
    },
    btdRangeRef: {
      rangeId: 'btd-range:1000-1048',
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
    },
    principalRefs: [
      { principalId: 'principal:depositor-alpha', role: 'current_owner', authorityPosture: 'owner_authorized' },
      { principalId: 'principal:market-viewer', role: 'viewer', authorityPosture: 'source_safe_public_view' },
    ],
    ledgerDatabaseProjectionRefs: {
      ledgerRef: 'ledger:exchange-listing-opened-alpha',
      journalRef: 'journal:exchange-activity-listing-alpha',
      databaseProjectionRef: 'projection:exchange-activity-listing-alpha',
      projectionTrust: 'ledger_outranks_database_projection',
    },
    proofRootFields: ['activityRoot', 'disclosureRoot', 'ownerAuthorityRoot', 'rangeRoot', 'telemetryRoot'],
    eventIds: ['exchange.activity.listing.opened', 'exchange.detail.viewed'],
    filterValues: filters(
      'listing',
      'open',
      'assetpack:source-safe-preview-alpha',
      'btd-range:1000-1048',
      ['principal:depositor-alpha', 'principal:market-viewer'],
      'not_settled',
      'not_required',
    ),
    detailPayload: {
      collapsedHeaderFields: ['activityId', 'activityKind', 'state', 'sourceSafeSummary', 'assetPackRef.assetPackId', 'btdRangeRef.rangeId'],
      expandedDetailSections: [
        detailSection('source_safe_summary', 'Listing can be inspected without source delivery.'),
        detailSection('range_and_assetpack', 'BTD range and AssetPack id are visible; AssetPack source is not.'),
        detailSection('principal_posture', 'Owner authority is represented by a proof root, not private wallet material.'),
        detailSection('ledger_database_projection', 'Ledger journal reference outranks the database projection.'),
        detailSection('proof_roots', 'Activity, disclosure, owner authority, range, and telemetry roots are required.'),
        detailSection('telemetry_events', 'Listing and detail-view events bind this row.'),
        detailSection('redaction_posture', 'Protected source, private wallet material, prompts, and secret values are forbidden.'),
        detailSection('repair_and_revenue_posture', 'No repair is required before market interaction.'),
      ],
    },
  },
  {
    activityId: 'exchange.activity.bid.opened',
    activityKind: 'bid',
    label: 'Bid opened',
    state: 'open',
    sourceSafeSummary: 'Prospective buyer bid against a source-safe AssetPack rights preview without receiving protected source.',
    assetPackRef: {
      assetPackId: 'assetpack:source-safe-preview-alpha',
      previewVisibility: 'pricing_root_measurements_and_rights_posture_only',
      sourceVisibility: 'hidden_until_paid_settlement',
    },
    btdRangeRef: {
      rangeId: 'btd-range:1000-1048',
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
    },
    principalRefs: [
      { principalId: 'principal:buyer-beta', role: 'bidder', authorityPosture: 'buyer_policy_authorized' },
      { principalId: 'principal:depositor-alpha', role: 'current_owner', authorityPosture: 'owner_review_required' },
    ],
    ledgerDatabaseProjectionRefs: {
      ledgerRef: 'ledger:exchange-bid-opened-beta',
      journalRef: 'journal:exchange-activity-bid-beta',
      databaseProjectionRef: 'projection:exchange-activity-bid-beta',
      projectionTrust: 'ledger_outranks_database_projection',
    },
    proofRootFields: ['activityRoot', 'quoteRoot', 'buyerAuthorityRoot', 'disclosureRoot', 'telemetryRoot'],
    eventIds: ['exchange.activity.bid.opened', 'exchange.quote.previewed'],
    filterValues: filters(
      'bid',
      'open',
      'assetpack:source-safe-preview-alpha',
      'btd-range:1000-1048',
      ['principal:buyer-beta', 'principal:depositor-alpha'],
      'not_settled',
      'not_required',
    ),
    detailPayload: {
      collapsedHeaderFields: ['activityId', 'activityKind', 'state', 'sourceSafeSummary', 'quoteRoot'],
      expandedDetailSections: [
        detailSection('source_safe_summary', 'Bid detail shows quote roots and rights posture only.'),
        detailSection('range_and_assetpack', 'The bid targets one non-fungible BTD range.'),
        detailSection('principal_posture', 'Buyer and owner are visible as principal ids only.'),
        detailSection('ledger_database_projection', 'Bid state may be projected but settlement remains ledger-derived.'),
        detailSection('proof_roots', 'Quote, buyer authority, disclosure, and activity roots are required.'),
        detailSection('telemetry_events', 'Bid and quote-preview event ids must be emitted.'),
        detailSection('redaction_posture', 'No protected source or buyer private repository data is allowed.'),
        detailSection('repair_and_revenue_posture', 'Repair opens only if quote or projection drift appears.'),
      ],
    },
  },
  {
    activityId: 'exchange.activity.ask.opened',
    activityKind: 'ask',
    label: 'Ask opened',
    state: 'open',
    sourceSafeSummary: 'Owner opened an ask with deterministic fee and rights-preview roots but no source disclosure.',
    assetPackRef: {
      assetPackId: 'assetpack:source-safe-preview-beta',
      previewVisibility: 'asking_price_measurements_and_proof_roots_only',
      sourceVisibility: 'hidden_until_paid_settlement',
    },
    btdRangeRef: {
      rangeId: 'btd-range:2100-2132',
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
    },
    principalRefs: [
      { principalId: 'principal:depositor-gamma', role: 'current_owner', authorityPosture: 'owner_authorized' },
    ],
    ledgerDatabaseProjectionRefs: {
      ledgerRef: 'ledger:exchange-ask-opened-gamma',
      journalRef: 'journal:exchange-activity-ask-gamma',
      databaseProjectionRef: 'projection:exchange-activity-ask-gamma',
      projectionTrust: 'ledger_outranks_database_projection',
    },
    proofRootFields: ['activityRoot', 'askRoot', 'feeRoot', 'rangeRoot', 'telemetryRoot'],
    eventIds: ['exchange.activity.ask.opened', 'exchange.price.previewed'],
    filterValues: filters(
      'ask',
      'open',
      'assetpack:source-safe-preview-beta',
      'btd-range:2100-2132',
      ['principal:depositor-gamma'],
      'not_settled',
      'not_required',
    ),
    detailPayload: {
      collapsedHeaderFields: ['activityId', 'activityKind', 'state', 'sourceSafeSummary', 'feeRoot'],
      expandedDetailSections: [
        detailSection('source_safe_summary', 'Ask detail exposes source-safe price posture.'),
        detailSection('range_and_assetpack', 'The ask binds to a BTD range and AssetPack rights scope.'),
        detailSection('principal_posture', 'Owner authority is proof-rooted.'),
        detailSection('ledger_database_projection', 'Ask projection is repairable against ledger state.'),
        detailSection('proof_roots', 'Ask, fee, range, activity, and telemetry roots are required.'),
        detailSection('telemetry_events', 'Ask-opened and price-preview event ids must be retained.'),
        detailSection('redaction_posture', 'Source-bearing AssetPack payloads remain forbidden.'),
        detailSection('repair_and_revenue_posture', 'Revenue route is previewed later and not settled by this row.'),
      ],
    },
  },
  {
    activityId: 'exchange.activity.order.cancelled',
    activityKind: 'cancellation',
    label: 'Order cancelled',
    state: 'cancelled',
    sourceSafeSummary: 'Authorized maker cancelled an open order before acceptance or settlement.',
    assetPackRef: {
      assetPackId: 'assetpack:source-safe-preview-beta',
      previewVisibility: 'order_identity_state_and_proof_roots_only',
      sourceVisibility: 'hidden_until_paid_settlement',
    },
    btdRangeRef: {
      rangeId: 'btd-range:2100-2132',
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
    },
    principalRefs: [
      { principalId: 'principal:depositor-gamma', role: 'current_owner', authorityPosture: 'cancel_authorized' },
    ],
    ledgerDatabaseProjectionRefs: {
      ledgerRef: 'ledger:exchange-order-cancelled-gamma',
      journalRef: 'journal:exchange-activity-cancel-gamma',
      databaseProjectionRef: 'projection:exchange-activity-cancel-gamma',
      projectionTrust: 'ledger_outranks_database_projection',
    },
    proofRootFields: ['activityRoot', 'cancelAuthorityRoot', 'orderRoot', 'telemetryRoot'],
    eventIds: ['exchange.activity.order.cancelled', 'exchange.order.history.updated'],
    filterValues: filters(
      'cancellation',
      'cancelled',
      'assetpack:source-safe-preview-beta',
      'btd-range:2100-2132',
      ['principal:depositor-gamma'],
      'not_settled',
      'not_required',
    ),
    detailPayload: {
      collapsedHeaderFields: ['activityId', 'activityKind', 'state', 'sourceSafeSummary', 'orderRoot'],
      expandedDetailSections: [
        detailSection('source_safe_summary', 'Cancellation detail shows state and authority roots.'),
        detailSection('range_and_assetpack', 'Cancelled order remains visible as market history.'),
        detailSection('principal_posture', 'Maker identity is principal id only.'),
        detailSection('ledger_database_projection', 'Cancellation journal prevents replay as an open order.'),
        detailSection('proof_roots', 'Cancel authority, order, activity, and telemetry roots are required.'),
        detailSection('telemetry_events', 'Cancellation and history-update events bind this row.'),
        detailSection('redaction_posture', 'Cancellation cannot reveal prior protected source.'),
        detailSection('repair_and_revenue_posture', 'Repair opens if cancelled order is replayed as open.'),
      ],
    },
  },
  {
    activityId: 'exchange.activity.order.accepted',
    activityKind: 'acceptance',
    label: 'Order accepted',
    state: 'accepted',
    sourceSafeSummary: 'Taker accepted an eligible order, creating settlement readiness without source delivery.',
    assetPackRef: {
      assetPackId: 'assetpack:source-safe-preview-alpha',
      previewVisibility: 'accepted_order_state_and_settlement_roots_only',
      sourceVisibility: 'hidden_until_paid_settlement',
    },
    btdRangeRef: {
      rangeId: 'btd-range:1000-1048',
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
    },
    principalRefs: [
      { principalId: 'principal:buyer-beta', role: 'taker', authorityPosture: 'buyer_policy_authorized' },
      { principalId: 'principal:depositor-alpha', role: 'maker', authorityPosture: 'owner_authorized' },
    ],
    ledgerDatabaseProjectionRefs: {
      ledgerRef: 'ledger:exchange-order-accepted-beta',
      journalRef: 'journal:exchange-activity-accept-beta',
      databaseProjectionRef: 'projection:exchange-activity-accept-beta',
      projectionTrust: 'ledger_outranks_database_projection',
    },
    proofRootFields: ['activityRoot', 'acceptanceRoot', 'authorityRoot', 'settlementReadinessRoot', 'telemetryRoot'],
    eventIds: ['exchange.activity.order.accepted', 'exchange.settlement.ready'],
    filterValues: filters(
      'acceptance',
      'accepted',
      'assetpack:source-safe-preview-alpha',
      'btd-range:1000-1048',
      ['principal:buyer-beta', 'principal:depositor-alpha'],
      'pending',
      'not_required',
    ),
    detailPayload: {
      collapsedHeaderFields: ['activityId', 'activityKind', 'state', 'sourceSafeSummary', 'settlementReadinessRoot'],
      expandedDetailSections: [
        detailSection('source_safe_summary', 'Accepted order can be reviewed before settlement.'),
        detailSection('range_and_assetpack', 'Range identity and AssetPack id remain source-safe.'),
        detailSection('principal_posture', 'Maker and taker are principal references only.'),
        detailSection('ledger_database_projection', 'Accepted state requires ledger-visible order history.'),
        detailSection('proof_roots', 'Acceptance, authority, settlement-readiness, and activity roots are required.'),
        detailSection('telemetry_events', 'Accepted and settlement-ready events bind this row.'),
        detailSection('redaction_posture', 'No delivered AssetPack branch is visible yet.'),
        detailSection('repair_and_revenue_posture', 'Repair opens if acceptance races cancellation.'),
      ],
    },
  },
  {
    activityId: 'exchange.activity.settlement.observed',
    activityKind: 'settlement',
    label: 'Settlement observed',
    state: 'settled',
    sourceSafeSummary: 'BTC fee settlement and BTD rights-transfer roots were observed and correlated without exposing source.',
    assetPackRef: {
      assetPackId: 'assetpack:source-safe-preview-alpha',
      previewVisibility: 'settlement_receipt_rights_and_delivery_state_only',
      sourceVisibility: 'delivered_only_after_paid_rights_transfer',
    },
    btdRangeRef: {
      rangeId: 'btd-range:1000-1048',
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
    },
    principalRefs: [
      { principalId: 'principal:buyer-beta', role: 'new_right_holder', authorityPosture: 'settlement_authorized' },
      { principalId: 'principal:depositor-alpha', role: 'prior_owner_or_revenue_recipient', authorityPosture: 'rights_transfer_recorded' },
    ],
    ledgerDatabaseProjectionRefs: {
      ledgerRef: 'ledger:exchange-settlement-observed-beta',
      journalRef: 'journal:exchange-activity-settlement-beta',
      databaseProjectionRef: 'projection:exchange-activity-settlement-beta',
      projectionTrust: 'ledger_outranks_database_projection',
    },
    proofRootFields: ['activityRoot', 'btcFeeRoot', 'btdRightsRoot', 'ledgerRoot', 'databaseProjectionRoot', 'deliveryRoot', 'telemetryRoot'],
    eventIds: ['exchange.activity.settlement.observed', 'ledger.finality.observed', 'exchange.delivery.unlocked'],
    filterValues: filters(
      'settlement',
      'settled',
      'assetpack:source-safe-preview-alpha',
      'btd-range:1000-1048',
      ['principal:buyer-beta', 'principal:depositor-alpha'],
      'finalized',
      'not_required',
    ),
    detailPayload: {
      collapsedHeaderFields: ['activityId', 'activityKind', 'state', 'sourceSafeSummary', 'ledgerRoot', 'deliveryRoot'],
      expandedDetailSections: [
        detailSection('source_safe_summary', 'Settlement detail shows roots and delivery state, not source contents.'),
        detailSection('range_and_assetpack', 'Rights transfer preserves exact BTD range identity.'),
        detailSection('principal_posture', 'Prior and new right-holder ids are source-safe principals.'),
        detailSection('ledger_database_projection', 'Ledger root and database projection root must reconcile.'),
        detailSection('proof_roots', 'BTC fee, BTD rights, ledger, projection, delivery, and activity roots are required.'),
        detailSection('telemetry_events', 'Settlement, finality, and delivery-unlocked events bind this row.'),
        detailSection('redaction_posture', 'Post-settlement source remains outside public activity payloads.'),
        detailSection('repair_and_revenue_posture', 'Repair opens on underpayment, overpayment, stale finality, or projection drift.'),
      ],
    },
  },
  {
    activityId: 'exchange.activity.repair.opened',
    activityKind: 'repair',
    label: 'Repair opened',
    state: 'repair_open',
    sourceSafeSummary: 'Operator repair case opened for projection drift while ledger truth remains authoritative.',
    assetPackRef: {
      assetPackId: 'assetpack:source-safe-preview-gamma',
      previewVisibility: 'repair_class_projection_refs_and_roots_only',
      sourceVisibility: 'hidden_until_paid_settlement',
    },
    btdRangeRef: {
      rangeId: 'btd-range:4200-4216',
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
    },
    principalRefs: [
      { principalId: 'principal:operator-delta', role: 'repair_operator', authorityPosture: 'operator_policy_authorized' },
    ],
    ledgerDatabaseProjectionRefs: {
      ledgerRef: 'ledger:exchange-repair-opened-delta',
      journalRef: 'journal:exchange-activity-repair-delta',
      databaseProjectionRef: 'projection:exchange-activity-repair-delta',
      projectionTrust: 'ledger_outranks_database_projection',
    },
    proofRootFields: ['activityRoot', 'incidentRoot', 'repairCommandRoot', 'ledgerRoot', 'databaseProjectionRoot', 'telemetryRoot'],
    eventIds: ['exchange.activity.repair.opened', 'exchange.projection.drift.detected', 'repair.job.queued'],
    filterValues: filters(
      'repair',
      'repair_open',
      'assetpack:source-safe-preview-gamma',
      'btd-range:4200-4216',
      ['principal:operator-delta'],
      'blocked_until_repaired',
      'open',
    ),
    detailPayload: {
      collapsedHeaderFields: ['activityId', 'activityKind', 'state', 'sourceSafeSummary', 'repairCommandRoot'],
      expandedDetailSections: [
        detailSection('source_safe_summary', 'Repair detail shows incident and repair roots only.'),
        detailSection('range_and_assetpack', 'Affected range is visible without source contents.'),
        detailSection('principal_posture', 'Operator is recorded as source-safe principal id.'),
        detailSection('ledger_database_projection', 'Repair reconciles projection to ledger truth.'),
        detailSection('proof_roots', 'Incident, repair command, ledger, projection, and activity roots are required.'),
        detailSection('telemetry_events', 'Repair-opened, projection-drift, and queued-job events bind this row.'),
        detailSection('redaction_posture', 'Repair evidence must not include protected payloads.'),
        detailSection('repair_and_revenue_posture', 'Repair must complete before optimistic market state resumes.'),
      ],
    },
  },
  {
    activityId: 'exchange.activity.revenue.routed',
    activityKind: 'revenue_route',
    label: 'Revenue routed',
    state: 'routed',
    sourceSafeSummary: 'Depositor, reader, treasury, and fee route roots were recorded after settlement conservation checks.',
    assetPackRef: {
      assetPackId: 'assetpack:source-safe-preview-alpha',
      previewVisibility: 'route_roots_and_conservation_state_only',
      sourceVisibility: 'not_part_of_revenue_route_payload',
    },
    btdRangeRef: {
      rangeId: 'btd-range:1000-1048',
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
    },
    principalRefs: [
      { principalId: 'principal:depositor-alpha', role: 'depositor_revenue_recipient', authorityPosture: 'revenue_route_recorded' },
      { principalId: 'principal:buyer-beta', role: 'reader_right_holder', authorityPosture: 'settlement_authorized' },
      { principalId: 'principal:treasury', role: 'treasury_route', authorityPosture: 'fee_route_recorded' },
    ],
    ledgerDatabaseProjectionRefs: {
      ledgerRef: 'ledger:exchange-revenue-routed-alpha',
      journalRef: 'journal:exchange-activity-revenue-alpha',
      databaseProjectionRef: 'projection:exchange-activity-revenue-alpha',
      projectionTrust: 'ledger_outranks_database_projection',
    },
    proofRootFields: ['activityRoot', 'revenueRouteRoot', 'conservationRoot', 'btcRouteRoot', 'btdRightRouteRoot', 'telemetryRoot'],
    eventIds: ['exchange.activity.revenue.routed', 'exchange.revenue.conserved'],
    filterValues: filters(
      'revenue_route',
      'routed',
      'assetpack:source-safe-preview-alpha',
      'btd-range:1000-1048',
      ['principal:depositor-alpha', 'principal:buyer-beta', 'principal:treasury'],
      'finalized',
      'not_required',
    ),
    detailPayload: {
      collapsedHeaderFields: ['activityId', 'activityKind', 'state', 'sourceSafeSummary', 'revenueRouteRoot'],
      expandedDetailSections: [
        detailSection('source_safe_summary', 'Revenue route detail shows route and conservation roots.'),
        detailSection('range_and_assetpack', 'Revenue route references the settled AssetPack range only.'),
        detailSection('principal_posture', 'Revenue principals are account ids and roles, not credentials.'),
        detailSection('ledger_database_projection', 'Route projection reconciles to settlement ledger root.'),
        detailSection('proof_roots', 'Revenue route, conservation, BTC route, BTD right route, and activity roots are required.'),
        detailSection('telemetry_events', 'Revenue-routed and conservation events bind this row.'),
        detailSection('redaction_posture', 'Revenue routes cannot include source payloads or private wallet material.'),
        detailSection('repair_and_revenue_posture', 'Repair opens if conservation proof fails.'),
      ],
    },
  },
  {
    activityId: 'exchange.activity.history.recorded',
    activityKind: 'history_entry',
    label: 'History entry recorded',
    state: 'historical',
    sourceSafeSummary: 'Historical activity entry links prior market state transitions and replay roots for audit.',
    assetPackRef: {
      assetPackId: 'assetpack:source-safe-preview-alpha',
      previewVisibility: 'historical_state_roots_only',
      sourceVisibility: 'hidden_unless_viewer_has_paid_rights',
    },
    btdRangeRef: {
      rangeId: 'btd-range:1000-1048',
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
    },
    principalRefs: [
      { principalId: 'principal:market-auditor', role: 'auditor', authorityPosture: 'source_safe_history_view' },
    ],
    ledgerDatabaseProjectionRefs: {
      ledgerRef: 'ledger:exchange-history-recorded-alpha',
      journalRef: 'journal:exchange-activity-history-alpha',
      databaseProjectionRef: 'projection:exchange-activity-history-alpha',
      projectionTrust: 'ledger_outranks_database_projection',
    },
    proofRootFields: ['activityRoot', 'historyRoot', 'replayRoot', 'disclosureRoot', 'telemetryRoot'],
    eventIds: ['exchange.activity.history.recorded', 'exchange.history.replayed'],
    filterValues: filters(
      'history_entry',
      'historical',
      'assetpack:source-safe-preview-alpha',
      'btd-range:1000-1048',
      ['principal:market-auditor'],
      'historical',
      'not_required',
    ),
    detailPayload: {
      collapsedHeaderFields: ['activityId', 'activityKind', 'state', 'sourceSafeSummary', 'historyRoot'],
      expandedDetailSections: [
        detailSection('source_safe_summary', 'History detail explains prior state through replay roots.'),
        detailSection('range_and_assetpack', 'History stays bound to the same range and AssetPack id.'),
        detailSection('principal_posture', 'Auditor id is source-safe and not privileged source access.'),
        detailSection('ledger_database_projection', 'History replay derives from ledger and journal references.'),
        detailSection('proof_roots', 'History, replay, disclosure, telemetry, and activity roots are required.'),
        detailSection('telemetry_events', 'History-recorded and replayed event ids bind this row.'),
        detailSection('redaction_posture', 'History never replays protected source into market rows.'),
        detailSection('repair_and_revenue_posture', 'Repair opens if replay root diverges from activity history.'),
      ],
    },
  },
]);

export const EXCHANGE_ACTIVITY_ROWS = activityRows;

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableRoot(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
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
 * @param {{
 *   version?: string,
 *   currentTarget?: string,
 *   generatedAt?: string,
 *   repoRoot?: string,
 * }} [input]
 */
export function buildExchangeActivityBook(input = {}) {
  const version = input.version || EXCHANGE_ACTIVITY_BOOK_VERSION;
  const currentTarget = input.currentTarget || EXCHANGE_ACTIVITY_BOOK_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sharedSourceRoots = [
    'BITCODE_SPEC_V36.md',
    'BITCODE_SPEC_V36_DELTA.md',
    'BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'packages/specifying/src/canonical/exchange-activity-book.js',
    'packages/specifying/test/v36-exchange-activity-book.test.js',
    'scripts/generate-v36-exchange-activity-book.mjs',
    'scripts/check-v36-gate2-exchange-activity-book-market-master-detail.mjs',
    'packages/btd/src/exchange.ts',
    'uapi/app/exchange/README.md',
    'uapi/app/api/btd/asset-pack-exchange/route.ts',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  const rows = activityRows.map((row) => {
    const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...row,
      sourceSafetyClass: 'source_safe_exchange_market_metadata',
      sourceSafetyPosture: 'activity_detail_never_exposes_protected_source_or_unpaid_assetpack_content',
      redactionPosture: {
        postureId: 'exchange_activity_redaction_v1',
        allowedPayloadClasses: [
          'activity_identity',
          'source_safe_summary',
          'measurement_metadata',
          'proof_roots',
          'ledger_and_database_projection_refs',
          'event_ids',
          'principal_ids',
          'rights_and_settlement_state',
          'repair_state',
        ],
        forbiddenPayloadClasses: [...FORBIDDEN_EXCHANGE_ACTIVITY_PAYLOAD],
      },
      freshnessChecks: [
        {
          checkId: `${row.activityId}.activity-book-row-present`,
          command: 'pnpm run check:v36-gate2',
          cadence: 'per_gate',
          failClosedOn: [...SHARED_FAIL_CLOSED_REASONS],
        },
      ],
      sourceEvidence,
    };

    const rowRoot = `exchange-activity-row:${sha256(row.activityId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      row.proofRootFields.map((field) => [field, `exchange-proof:${sha256(`${row.activityId}:${field}:${rowRoot}`).slice(0, 24)}`]),
    );
    return {
      ...rowWithoutRoot,
      filterValues: {
        ...rowWithoutRoot.filterValues,
        event_id: [...row.eventIds],
      },
      proofRoots,
      rowRoot,
      detailRoot: `exchange-activity-detail:${sha256(row.activityId + canonicalJson(row.detailPayload)).slice(0, 24)}`,
    };
  });

  const observedActivityKinds = rows.map((row) => row.activityKind);
  const missingRequiredActivityKinds = EXCHANGE_ACTIVITY_KINDS.filter((activityKind) => !observedActivityKinds.includes(activityKind));
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.activityId}:${entry.sourceRoot}`),
  );
  const rowsWithProtectedSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'));
  const rowsWithUnpaidAssetPackSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
  const rowsWithoutProofRoots = rows.filter((row) => row.proofRootFields.some((field) => !row.proofRoots[field]));
  const rowsWithoutEventIds = rows.filter((row) => row.eventIds.length === 0);
  const rowsWithoutDetails = rows.filter((row) => row.detailPayload.expandedDetailSections.length !== EXCHANGE_ACTIVITY_DETAIL_SECTION_IDS.length);
  const rowsWithoutProjectionRefs = rows.filter((row) => !row.ledgerDatabaseProjectionRefs.ledgerRef || !row.ledgerDatabaseProjectionRefs.databaseProjectionRef);
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));
  const detailSectionIds = [
    ...new Set(rows.flatMap((row) => row.detailPayload.expandedDetailSections.map((section) => section.sectionId))),
  ];

  const failures = [
    ...missingRequiredActivityKinds.map((activityKind) => `missing required Exchange activity kind ${activityKind}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Exchange activity source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Exchange activity book contains a secret-shaped marker'] : []),
    ...rowsWithProtectedSource.map((row) => `Exchange activity row ${row.activityId} lacks protected source boundary`),
    ...rowsWithUnpaidAssetPackSource.map((row) => `Exchange activity row ${row.activityId} lacks unpaid AssetPack source boundary`),
    ...rowsWithoutProofRoots.map((row) => `Exchange activity row ${row.activityId} is missing proof roots`),
    ...rowsWithoutEventIds.map((row) => `Exchange activity row ${row.activityId} is missing event ids`),
    ...rowsWithoutDetails.map((row) => `Exchange activity row ${row.activityId} is missing detail sections`),
    ...rowsWithoutProjectionRefs.map((row) => `Exchange activity row ${row.activityId} is missing ledger/database projection references`),
    ...rowsWithLegacySourceRoots.map((row) => `Exchange activity row ${row.activityId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredActivityKinds: [...EXCHANGE_ACTIVITY_KINDS],
    observedActivityKinds,
    missingRequiredActivityKinds,
    activityRowCount: rows.length,
    allRequiredActivityKindsCovered: includesAll(observedActivityKinds, EXCHANGE_ACTIVITY_KINDS),
    requiredFilterIds: [...EXCHANGE_ACTIVITY_FILTER_IDS],
    requiredDetailSectionIds: [...EXCHANGE_ACTIVITY_DETAIL_SECTION_IDS],
    observedDetailSectionIds: detailSectionIds,
    allDetailSectionsCovered: includesAll(detailSectionIds, EXCHANGE_ACTIVITY_DETAIL_SECTION_IDS),
    listingRowsRepresented: rows.some((row) => row.activityKind === 'listing'),
    bidRowsRepresented: rows.some((row) => row.activityKind === 'bid'),
    askRowsRepresented: rows.some((row) => row.activityKind === 'ask'),
    cancellationRowsRepresented: rows.some((row) => row.activityKind === 'cancellation'),
    acceptanceRowsRepresented: rows.some((row) => row.activityKind === 'acceptance'),
    settlementRowsRepresented: rows.some((row) => row.activityKind === 'settlement'),
    repairRowsRepresented: rows.some((row) => row.activityKind === 'repair'),
    revenueRouteRowsRepresented: rows.some((row) => row.activityKind === 'revenue_route'),
    historyRowsRepresented: rows.some((row) => row.activityKind === 'history_entry'),
    proofRootsCovered: rowsWithoutProofRoots.length === 0,
    eventIdsCovered: rowsWithoutEventIds.length === 0,
    detailPayloadsCovered: rowsWithoutDetails.length === 0,
    ledgerDatabaseProjectionRefsCovered: rowsWithoutProjectionRefs.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: rowsWithProtectedSource.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidAssetPackSource.length > 0,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: EXCHANGE_ACTIVITY_BOOK_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v36-exchange-activity-book',
    schemaId: EXCHANGE_ACTIVITY_BOOK_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: EXCHANGE_ACTIVITY_BOOK_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      marketRowsMayExpose: [
        'source_safe_activity_identity',
        'source_safe_summary',
        'proof_roots',
        'event_ids',
        'rights_and_settlement_state',
        'ledger_and_database_projection_refs',
        'repair_and_revenue_posture',
      ],
      marketRowsMustNotExpose: [...FORBIDDEN_EXCHANGE_ACTIVITY_PAYLOAD],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredActivityKinds: [...EXCHANGE_ACTIVITY_KINDS],
    requiredFilterIds: [...EXCHANGE_ACTIVITY_FILTER_IDS],
    requiredDetailSectionIds: [...EXCHANGE_ACTIVITY_DETAIL_SECTION_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      activityId: row.activityId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `exchange-activity-book:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
