// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCHANGE_RIGHTS_TRANSFER_REVIEW_ARTIFACT_PATH = '.bitcode/v36-exchange-rights-transfer-review.json';
export const EXCHANGE_RIGHTS_TRANSFER_REVIEW_SCHEMA_ID = 'bitcode.v36.exchangeRightsTransferReview.v1';
export const EXCHANGE_RIGHTS_TRANSFER_REVIEW_VERSION = 'V36';
export const EXCHANGE_RIGHTS_TRANSFER_REVIEW_CURRENT_TARGET = 'V35';
export const EXCHANGE_RIGHTS_TRANSFER_REVIEW_SOURCE_SAFETY_VERDICT = 'source-safe-exchange-rights-transfer-review-metadata';

export const EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES = Object.freeze([
  'owner_read',
  'licensed_read',
  'blocked_transfer',
]);

export const EXCHANGE_RIGHTS_TRANSFER_REQUIRED_FIELD_IDS = Object.freeze([
  'previewId',
  'previewState',
  'assetPackId',
  'btdRangeIdentity',
  'currentOwnerPrincipal',
  'requestedBuyerPrincipal',
  'rightsScope',
  'settlementUnlockCondition',
  'disclosureLimit',
  'sourceVisibility',
  'authorityPosture',
  'proofRoots',
  'ledgerDatabaseProjectionRefs',
  'failClosedConditions',
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

const FORBIDDEN_RIGHTS_TRANSFER_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'wallet_seed_phrase',
  'wallet_private_key',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'unsettled_assetpack_delivery_branch',
  'buyer_private_repository_payload',
]);

const SHARED_FAIL_CLOSED_REASONS = Object.freeze([
  'missing_btd_range_identity',
  'missing_current_owner',
  'missing_requested_buyer',
  'missing_rights_scope',
  'missing_settlement_unlock_condition',
  'missing_disclosure_limit',
  'assetpack_source_visible_before_paid_settlement',
  'rights_transfer_receipt_missing',
  'ledger_database_projection_drift',
]);

/**
 * @param {{
 *   previewId: string,
 *   previewState: string,
 *   label: string,
 *   assetPackId: string,
 *   btdRangeId: string,
 *   currentOwnerPrincipal: string,
 *   requestedBuyerPrincipal: string,
 *   rightsScope: string,
 *   settlementUnlockCondition: string,
 *   disclosureLimit: string,
 *   sourceVisibility: string,
 *   authorityPosture: string,
 *   transferDecision: string,
 *   failClosedConditions: string[],
 *   eventIds: string[],
 * }} row
 */
function rightsTransferPreview(row) {
  return {
    ...row,
    canonicalObject: 'ExchangeRightsTransferPreview',
    btdRangeIdentity: {
      rangeId: row.btdRangeId,
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
      chainOfRecord: 'btd_range_ledger_journal',
    },
    ledgerDatabaseProjectionRefs: {
      ledgerRef: `ledger:exchange-rights-transfer-${row.previewState}`,
      journalRef: `journal:exchange-rights-transfer-${row.previewState}`,
      databaseProjectionRef: `projection:exchange-rights-transfer-${row.previewState}`,
      projectionTrust: 'ledger_journal_outranks_database_projection',
    },
    proofRootFields: [
      'rightsTransferPreviewRoot',
      'btdRangeRoot',
      'currentOwnerRoot',
      'requestedBuyerRoot',
      'rightsScopeRoot',
      'settlementUnlockRoot',
      'disclosureRoot',
      'telemetryRoot',
    ],
  };
}

export const EXCHANGE_RIGHTS_TRANSFER_PREVIEW_ROWS = Object.freeze([
  rightsTransferPreview({
    previewId: 'exchange-rights-preview:owner-read-alpha',
    previewState: 'owner_read',
    label: 'Owner read review',
    assetPackId: 'assetpack:source-safe-preview-alpha',
    btdRangeId: 'btd-range:1000-1048',
    currentOwnerPrincipal: 'principal:depositor-alpha',
    requestedBuyerPrincipal: 'principal:depositor-alpha',
    rightsScope: 'owner_read_existing_settled_assetpack_rights',
    settlementUnlockCondition: 'already_settled_owner_rights_may_review_source_else_exchange_preview_remains_source_safe',
    disclosureLimit: 'exchange_preview_shows_measurements_roots_owner_posture_and_range_identity_only',
    sourceVisibility: 'exchange_preview_never_discloses_source_even_when_owner_has_separate_settled_access',
    authorityPosture: 'current_owner_authority_root_required',
    transferDecision: 'owner_read_no_transfer_required',
    failClosedConditions: ['missing_current_owner', 'missing_range_root', 'source_visibility_attempted_through_exchange_preview'],
    eventIds: ['exchange.rights.owner_read.previewed', 'exchange.rights.preview.source_safe'],
  }),
  rightsTransferPreview({
    previewId: 'exchange-rights-preview:licensed-read-beta',
    previewState: 'licensed_read',
    label: 'Licensed read review',
    assetPackId: 'assetpack:source-safe-preview-alpha',
    btdRangeId: 'btd-range:1000-1048',
    currentOwnerPrincipal: 'principal:depositor-alpha',
    requestedBuyerPrincipal: 'principal:reader-beta',
    rightsScope: 'licensed_read_right_without_owner_transfer',
    settlementUnlockCondition: 'paid_btc_read_license_and_btd_read_receipt_required_before_source_delivery',
    disclosureLimit: 'preview_shows_fit_measurements_rights_scope_fee_root_and_unlock_condition_only',
    sourceVisibility: 'hidden_until_paid_settlement_and_read_license_receipt',
    authorityPosture: 'reader_policy_and_current_owner_license_policy_roots_required',
    transferDecision: 'licensed_read_requires_settlement_unlock_before_delivery',
    failClosedConditions: ['missing_read_receipt', 'unpaid_assetpack_source_requested', 'stale_license_policy'],
    eventIds: ['exchange.rights.licensed_read.previewed', 'exchange.rights.unlock.required'],
  }),
  rightsTransferPreview({
    previewId: 'exchange-rights-preview:blocked-transfer-gamma',
    previewState: 'blocked_transfer',
    label: 'Blocked transfer review',
    assetPackId: 'assetpack:source-safe-preview-beta',
    btdRangeId: 'btd-range:2100-2132',
    currentOwnerPrincipal: 'principal:depositor-gamma',
    requestedBuyerPrincipal: 'principal:buyer-delta',
    rightsScope: 'assetpack_rights_transfer_blocked_by_policy_or_stale_owner',
    settlementUnlockCondition: 'blocked_no_payment_or_delivery_admitted_until_authority_policy_and_owner_roots_repair',
    disclosureLimit: 'blocked_preview_shows_denial_reason_roots_range_identity_and_repair_posture_only',
    sourceVisibility: 'hidden_no_assetpack_source_delivery_allowed',
    authorityPosture: 'owner_authority_or_policy_root_missing_repair_required',
    transferDecision: 'blocked_transfer',
    failClosedConditions: ['missing_owner_authority_root', 'stale_owner_projection', 'policy_denial', 'rights_transfer_receipt_missing'],
    eventIds: ['exchange.rights.transfer.blocked', 'repair.job.required'],
  }),
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
export function buildExchangeRightsTransferReview(input = {}) {
  const version = input.version || EXCHANGE_RIGHTS_TRANSFER_REVIEW_VERSION;
  const currentTarget = input.currentTarget || EXCHANGE_RIGHTS_TRANSFER_REVIEW_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sharedSourceRoots = [
    'BITCODE_SPEC_V36.md',
    'BITCODE_SPEC_V36_DELTA.md',
    'BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'scripts/specifying/src/canonical/exchange-rights-transfer-review.js',
    'scripts/specifying/test/v36-exchange-rights-transfer-review.test.js',
    'scripts/generate-v36-exchange-rights-transfer-review.mjs',
    'scripts/check-v36-gate4-exchange-rights-transfer-review.mjs',
    'packages/btd/src/exchange.ts',
    'apps/uapi/app/exchange/README.md',
    'apps/uapi/app/api/btd/asset-pack-exchange/route.ts',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  const rows = EXCHANGE_RIGHTS_TRANSFER_PREVIEW_ROWS.map((row) => {
    const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoots = {
      ...row,
      sourceSafetyClass: 'source_safe_exchange_rights_transfer_preview_metadata',
      sourceSafetyPosture: 'assetpack_source_hidden_until_paid_settlement_and_rights_transfer_complete',
      redactionPosture: {
        postureId: 'exchange_rights_transfer_redaction_v1',
        allowedPayloadClasses: [
          'preview_identity',
          'assetpack_id',
          'btd_range_identity',
          'principal_ids',
          'rights_scope',
          'settlement_unlock_condition',
          'disclosure_limit',
          'proof_roots',
          'event_ids',
          'ledger_and_database_projection_refs',
          'fail_closed_conditions',
        ],
        forbiddenPayloadClasses: [...FORBIDDEN_RIGHTS_TRANSFER_PAYLOAD],
      },
      freshnessChecks: [
        {
          checkId: `${row.previewId}.rights-transfer-preview-present`,
          command: 'pnpm run check:v36-gate4',
          cadence: 'per_gate',
          failClosedOn: [...SHARED_FAIL_CLOSED_REASONS],
        },
      ],
      sourceEvidence,
    };
    const previewRoot = `exchange-rights-transfer-preview:${sha256(row.previewId + canonicalJson(rowWithoutRoots)).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      row.proofRootFields.map((field) => {
        const seed = `${row.previewId}:${field}:${previewRoot}:${row.btdRangeIdentity.rangeId}`;
        return [field, `exchange-proof:${sha256(seed).slice(0, 24)}`];
      }),
    );

    return {
      ...rowWithoutRoots,
      previewRoot,
      proofRoots,
    };
  });

  const observedPreviewStates = rows.map((row) => row.previewState);
  const missingRequiredPreviewStates = EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES.filter((state) => !observedPreviewStates.includes(state));
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.previewId}:${entry.sourceRoot}`),
  );
  const rowsWithoutRequiredIdentity = rows.filter((row) =>
    !row.btdRangeIdentity?.rangeId
    || row.btdRangeIdentity?.sourceShareFungibility !== 'not_fungible'
    || !row.currentOwnerPrincipal
    || !row.requestedBuyerPrincipal
    || !row.rightsScope,
  );
  const rowsWithoutUnlockOrDisclosure = rows.filter((row) => !row.settlementUnlockCondition || !row.disclosureLimit);
  const rowsWithSourceVisibleBeforeSettlement = rows.filter((row) =>
    !row.sourceVisibility.includes('hidden')
    && !row.sourceVisibility.includes('never_discloses_source'),
  );
  const rowsWithoutProofRoots = rows.filter((row) => row.proofRootFields.some((field) => !row.proofRoots[field]));
  const rowsWithoutEventIds = rows.filter((row) => row.eventIds.length === 0);
  const rowsWithoutProjectionRefs = rows.filter((row) => !row.ledgerDatabaseProjectionRefs.ledgerRef || !row.ledgerDatabaseProjectionRefs.databaseProjectionRef);
  const rowsWithProtectedSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'));
  const rowsWithUnpaidAssetPackSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
  const rowsWithPrivateWalletMaterial = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'));
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingRequiredPreviewStates.map((state) => `missing required Exchange rights-transfer preview state ${state}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Exchange rights-transfer source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Exchange rights-transfer review contains a secret-shaped marker'] : []),
    ...rowsWithoutRequiredIdentity.map((row) => `Exchange rights-transfer preview ${row.previewId} lacks range, owner, buyer, or rights scope identity`),
    ...rowsWithoutUnlockOrDisclosure.map((row) => `Exchange rights-transfer preview ${row.previewId} lacks settlement unlock condition or disclosure limit`),
    ...rowsWithSourceVisibleBeforeSettlement.map((row) => `Exchange rights-transfer preview ${row.previewId} exposes source before settlement`),
    ...rowsWithoutProofRoots.map((row) => `Exchange rights-transfer preview ${row.previewId} is missing proof roots`),
    ...rowsWithoutEventIds.map((row) => `Exchange rights-transfer preview ${row.previewId} is missing event ids`),
    ...rowsWithoutProjectionRefs.map((row) => `Exchange rights-transfer preview ${row.previewId} is missing ledger/database projection refs`),
    ...rowsWithProtectedSource.map((row) => `Exchange rights-transfer preview ${row.previewId} lacks protected source boundary`),
    ...rowsWithUnpaidAssetPackSource.map((row) => `Exchange rights-transfer preview ${row.previewId} lacks unpaid AssetPack source boundary`),
    ...rowsWithPrivateWalletMaterial.map((row) => `Exchange rights-transfer preview ${row.previewId} lacks wallet private material boundary`),
    ...rowsWithLegacySourceRoots.map((row) => `Exchange rights-transfer preview ${row.previewId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredPreviewStates: [...EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES],
    observedPreviewStates,
    missingRequiredPreviewStates,
    previewCount: rows.length,
    allRequiredPreviewStatesCovered: includesAll(observedPreviewStates, EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES),
    ownerReadRepresented: rows.some((row) => row.previewState === 'owner_read'),
    licensedReadRepresented: rows.some((row) => row.previewState === 'licensed_read'),
    blockedTransferRepresented: rows.some((row) => row.previewState === 'blocked_transfer'),
    btdRangeIdentityCovered: rowsWithoutRequiredIdentity.length === 0,
    settlementUnlockConditionsCovered: rowsWithoutUnlockOrDisclosure.length === 0,
    disclosureLimitsCovered: rowsWithoutUnlockOrDisclosure.length === 0,
    assetPackSourceHiddenUntilPaidSettlementAndRightsTransferComplete: rowsWithSourceVisibleBeforeSettlement.length === 0,
    proofRootsCovered: rowsWithoutProofRoots.length === 0,
    eventIdsCovered: rowsWithoutEventIds.length === 0,
    ledgerDatabaseProjectionRefsCovered: rowsWithoutProjectionRefs.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    privateWalletMaterialSerialized: false,
    protectedSourceVisible: rowsWithProtectedSource.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidAssetPackSource.length > 0,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: EXCHANGE_RIGHTS_TRANSFER_REVIEW_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v36-exchange-rights-transfer-review',
    schemaId: EXCHANGE_RIGHTS_TRANSFER_REVIEW_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: EXCHANGE_RIGHTS_TRANSFER_REVIEW_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      rightsTransferPreviewMayExpose: [
        'source_safe_preview_identity',
        'assetpack_id',
        'btd_range_identity',
        'principal_ids',
        'rights_scope',
        'settlement_unlock_condition',
        'disclosure_limit',
        'proof_roots',
        'event_ids',
        'ledger_and_database_projection_refs',
        'fail_closed_conditions',
      ],
      rightsTransferPreviewMustNotExpose: [...FORBIDDEN_RIGHTS_TRANSFER_PAYLOAD],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredPreviewStates: [...EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES],
    requiredFieldIds: [...EXCHANGE_RIGHTS_TRANSFER_REQUIRED_FIELD_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      previewId: row.previewId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `exchange-rights-transfer-review:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
