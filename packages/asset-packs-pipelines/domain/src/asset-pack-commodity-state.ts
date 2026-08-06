export const ASSET_PACK_LIFECYCLE_STATES = [
  'deposit-option-synthesized',
  'deposit-option-reviewed',
  'depository-assetpack-admitted',
  'fit-candidates-recalled',
  'fit-set-selected',
  'need-fit-assetpack-synthesized',
  'need-fit-assetpack-quoted',
  'settlement-observed',
  'btd-settled-rights-transferred',
  'source-unlocked-delivery',
  'compensated-and-reconciled',
  'repair-required',
] as const;

export const BTD_SCALAR_VOLUME_STATES = [
  'btd-not-applicable',
  'btd-potential-measured',
  'need-fit-measurements-admitted',
  'measurement-weight-policy-locked',
  'weighted-scalar-volume-computed',
  'btd-quantized',
  'measuremint-applied',
  'btd-range-assigned',
  'btd-quote-bound',
  'btd-rights-pending',
  'btd-rights-transferred',
  'btd-source-to-shares-allocated',
  'btd-repair-required',
] as const;

export const BTC_SETTLEMENT_STATES = [
  'btc-not-quoteable',
  'btc-quote-issued',
  'btc-quote-accepted',
  'btc-quote-inactive',
  'btc-wallet-ready',
  'btc-psbt-prepared',
  'btc-psbt-signed',
  'btc-broadcast-submitted',
  'btc-payment-observed',
  'btc-payment-mismatch-repair-required',
  'btc-finality-confirmed',
  'btc-replaced-reorged-or-failed',
  'btc-settlement-finalized',
  'btc-contributor-compensation-routable',
  'btc-refund-or-escalation-required',
  'btc-settlement-repair-required',
] as const;

export const ASSET_PACK_DISCLOSURE_BOUNDARIES = [
  'before-settlement',
  'after-preview',
  'after-quote',
  'after-payment-observation',
  'after-finality',
  'after-btd-rights-transfer',
  'after-repository-delivery',
] as const;

export type AssetPackLifecycleState = typeof ASSET_PACK_LIFECYCLE_STATES[number];
export type BtdScalarVolumeState = typeof BTD_SCALAR_VOLUME_STATES[number];
export type BtcSettlementState = typeof BTC_SETTLEMENT_STATES[number];
export type AssetPackDisclosureBoundary = typeof ASSET_PACK_DISCLOSURE_BOUNDARIES[number];

export interface AssetPackCommodityStateSourceSafety {
  sourceSafeMetadataOnly: true;
  protectedSourceVisible: false;
  unpaidAssetPackSourceVisible: false;
  rawPromptVisible: false;
  interpolatedPromptVisible: false;
  rawProviderResponseVisible: false;
  walletPrivateMaterialVisible: false;
  settlementPrivatePayloadVisible: false;
  credentialsSerialized: false;
}

export type AssetPackCommodityStateSourceSafetyInput = Partial<
  Record<keyof AssetPackCommodityStateSourceSafety, boolean>
>;

export interface AssetPackCommodityBtdStateInput {
  potentialMeasured?: boolean;
  measurementsAdmitted?: boolean;
  weightPolicyLocked?: boolean;
  weightedScalarVolumeComputed?: boolean;
  quantized?: boolean;
  measuremintApplied?: boolean;
  rangeAssigned?: boolean;
  quoteBound?: boolean;
  rightsPending?: boolean;
  rightsTransferred?: boolean;
  sourceToSharesAllocated?: boolean;
  repairRequired?: boolean;
}

export interface AssetPackCommodityBtcStateInput {
  quoteIssued?: boolean;
  quoteAccepted?: boolean;
  quoteInactive?: boolean;
  walletReady?: boolean;
  psbtPrepared?: boolean;
  psbtSigned?: boolean;
  broadcastSubmitted?: boolean;
  paymentObserved?: boolean;
  paymentMismatchRepairRequired?: boolean;
  finalityConfirmed?: boolean;
  replacedReorgedOrFailed?: boolean;
  settlementFinalized?: boolean;
  contributorCompensationRoutable?: boolean;
  refundOrEscalationRequired?: boolean;
  repairRequired?: boolean;
}

export interface AssetPackCommodityStateInput {
  payload?: unknown;
  depositOption?: unknown;
  depositoryAssetPack?: unknown;
  fitResult?: unknown;
  previewBoundary?: unknown;
  settlementBoundary?: unknown;
  assetPackStateHint?: string | null;
  btdStateHint?: string | null;
  btcStateHint?: string | null;
  depositOptionSynthesized?: boolean;
  depositOptionReviewed?: boolean;
  depositoryAssetPackAdmitted?: boolean;
  fitCandidatesRecalled?: boolean;
  selectedFitAssetIds?: string[];
  needFitAssetPackSynthesized?: boolean;
  quoteIssued?: boolean;
  settlementObserved?: boolean;
  rightsTransferred?: boolean;
  sourceUnlockedDelivery?: boolean;
  compensatedAndReconciled?: boolean;
  repairRequired?: boolean;
  btd?: AssetPackCommodityBtdStateInput;
  btc?: AssetPackCommodityBtcStateInput;
  proofRoots?: Record<string, string | null | undefined>;
  sourceSafety?: AssetPackCommodityStateSourceSafetyInput;
}

export interface AssetPackCommodityStateEvidence {
  depositOptionSynthesized: boolean;
  depositOptionReviewed: boolean;
  depositoryAssetPackAdmitted: boolean;
  fitCandidatesRecalled: boolean;
  fitSetSelected: boolean;
  needFitAssetPackSynthesized: boolean;
  quoteIssued: boolean;
  paymentObserved: boolean;
  paymentMatchesQuote: boolean | null;
  finalityConfirmed: boolean;
  rightsTransferred: boolean;
  sourceUnlocked: boolean;
  compensationRoutable: boolean;
  compensationReconciled: boolean;
  repairRequired: boolean;
  protectedSourceVisibleBeforeSettlement: boolean;
}

export interface AssetPackCommodityStateProjection {
  schema: 'bitcode.asset-pack.commodity-state-projection';
  states: {
    assetPack: AssetPackLifecycleState;
    btd: BtdScalarVolumeState;
    btc: BtcSettlementState;
  };
  disclosureBoundary: AssetPackDisclosureBoundary;
  evidence: AssetPackCommodityStateEvidence;
  proofRoots: Record<string, string>;
  sourceSafety: AssetPackCommodityStateSourceSafety;
  blockers: string[];
}

export interface AssetPackCommodityStateDisplay {
  schema: 'bitcode.asset-pack.commodity-state-display';
  assetPackState: AssetPackLifecycleState;
  btdState: BtdScalarVolumeState;
  btcState: BtcSettlementState;
  disclosureBoundary: AssetPackDisclosureBoundary;
  repairRequired: boolean;
  blockers: string[];
  proofRoots: Record<string, string>;
  sourceSafety: AssetPackCommodityStateSourceSafety;
}

const SOURCE_SAFETY: AssetPackCommodityStateSourceSafety = {
  sourceSafeMetadataOnly: true,
  protectedSourceVisible: false,
  unpaidAssetPackSourceVisible: false,
  rawPromptVisible: false,
  interpolatedPromptVisible: false,
  rawProviderResponseVisible: false,
  walletPrivateMaterialVisible: false,
  settlementPrivatePayloadVisible: false,
  credentialsSerialized: false,
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(source: unknown, ...keys: string[]) {
  const record = asRecord(source);
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

function readBoolean(source: unknown, ...keys: string[]) {
  const record = asRecord(source);
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string' && /^(true|false)$/iu.test(value.trim())) {
      return value.trim().toLowerCase() === 'true';
    }
  }
  return null;
}

function findFirstString(source: unknown, keys: string[], depth = 0): string | null {
  if (depth > 7 || source === null || source === undefined) return null;
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findFirstString(item, keys, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const record = asRecord(source);
  for (const key of keys) {
    const direct = readString(record, key);
    if (direct) return direct;
  }

  for (const value of Object.values(record)) {
    const found = findFirstString(value, keys, depth + 1);
    if (found) return found;
  }
  return null;
}

function findFirstBoolean(source: unknown, keys: string[], depth = 0): boolean | null {
  if (depth > 7 || source === null || source === undefined) return null;
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findFirstBoolean(item, keys, depth + 1);
      if (found !== null) return found;
    }
    return null;
  }

  const record = asRecord(source);
  for (const key of keys) {
    const direct = readBoolean(record, key);
    if (direct !== null) return direct;
  }

  for (const value of Object.values(record)) {
    const found = findFirstBoolean(value, keys, depth + 1);
    if (found !== null) return found;
  }
  return null;
}

function findFirstRecord(
  source: unknown,
  predicate: (record: Record<string, unknown>) => boolean,
  depth = 0,
): Record<string, unknown> | null {
  if (depth > 7 || source === null || source === undefined) return null;
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findFirstRecord(item, predicate, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const record = asRecord(source);
  if (Object.keys(record).length > 0 && predicate(record)) return record;
  for (const value of Object.values(record)) {
    const found = findFirstRecord(value, predicate, depth + 1);
    if (found) return found;
  }
  return null;
}

function collectStringArray(...sources: unknown[]) {
  const values: string[] = [];
  for (const source of sources) {
    if (Array.isArray(source)) {
      for (const item of source) {
        if (typeof item === 'string' && item.trim()) values.push(item.trim());
      }
    }
  }
  return [...new Set(values)];
}

function includesRepairToken(...values: Array<string | null | undefined>) {
  return values.some((value) => Boolean(value && /repair|mismatch|failed|reorg|replaced|blocked/i.test(value)));
}

function isOneOf<T extends readonly string[]>(value: unknown, values: T): value is T[number] {
  return typeof value === 'string' && (values as readonly string[]).includes(value);
}

export function isAssetPackLifecycleState(value: unknown): value is AssetPackLifecycleState {
  return isOneOf(value, ASSET_PACK_LIFECYCLE_STATES);
}

export function isBtdScalarVolumeState(value: unknown): value is BtdScalarVolumeState {
  return isOneOf(value, BTD_SCALAR_VOLUME_STATES);
}

export function isBtcSettlementState(value: unknown): value is BtcSettlementState {
  return isOneOf(value, BTC_SETTLEMENT_STATES);
}

function selectedFitIdsFrom(source: unknown) {
  const record = asRecord(source);
  return collectStringArray(
    record.selectedFitAssetIds,
    record.fitDepositAssetIds,
    record.selectedCandidateAssetIds,
  );
}

function collectProofRoots(input: AssetPackCommodityStateInput, payload: unknown) {
  const roots: Record<string, string> = {};
  const add = (key: string, value: unknown) => {
    if (typeof value === 'string' && value.trim()) roots[key] = value.trim();
  };

  for (const [key, value] of Object.entries(input.proofRoots || {})) add(key, value);
  for (const key of [
    'quoteRoot',
    'previewRoot',
    'boundaryRoot',
    'paymentReceiptRoot',
    'finalityRoot',
    'rightsTransferRoot',
    'sourceToSharesRoot',
    'deliveryRoot',
    'reconciliationRoot',
    'measurementRoot',
    'assetPackMeasurementRoot',
    'admissionReportRoot',
    'settlementReceiptRoot',
  ]) {
    add(key, findFirstString(payload, [key]));
  }
  return roots;
}

function resolveEvidence(input: AssetPackCommodityStateInput): AssetPackCommodityStateEvidence {
  const payload = input.payload ?? input;
  const previewBoundary =
    input.previewBoundary ||
    findFirstRecord(payload, (record) => record.schema === 'bitcode.asset-pack.preview-boundary');
  const settlementBoundary =
    input.settlementBoundary ||
    findFirstRecord(payload, (record) => record.schema === 'bitcode.asset-pack.settlement-rights-delivery-boundary');
  const fitResult =
    input.fitResult ||
    findFirstRecord(payload, (record) => typeof record.resultState === 'string' && /fit/i.test(String(record.resultState)));
  const depositOption =
    input.depositOption ||
    findFirstRecord(payload, (record) => typeof record.reviewState === 'string' || typeof record.admissionState === 'string');
  const selectedIds = collectStringArray(
    input.selectedFitAssetIds,
    selectedFitIdsFrom(fitResult),
    selectedFitIdsFrom(previewBoundary),
    selectedFitIdsFrom(payload),
  );
  const settlementState = readString(settlementBoundary, 'state');
  const finalityState = findFirstString(settlementBoundary || payload, ['finalityState']);
  const compensationState = findFirstString(payload, ['sourceToSharesState', 'compensationState', 'compensation_state']);
  const sourceToSharesRoot = findFirstString(payload, ['sourceToSharesRoot', 'sourceToSharesProofRoot']);
  const btcStateHint = input.btcStateHint || findFirstString(payload, ['btcState', 'btcSettlementState']);
  const btdStateHint = input.btdStateHint || findFirstString(payload, ['btdState', 'btdScalarVolumeState']);
  const assetPackStateHint =
    input.assetPackStateHint ||
    findFirstString(payload, ['assetPackState', 'assetPackLifecycleState']);
  const paymentObservation = findFirstRecord(
    settlementBoundary || payload,
    (record) => record.schema === 'bitcode.asset-pack.settlement.payment-observation' || typeof record.txid === 'string',
  );
  const rightsTransfer = findFirstRecord(
    settlementBoundary || payload,
    (record) =>
      record.schema === 'bitcode.btd.rights-transfer-receipt' ||
      record.schema === 'bitcode.btd.rights-transfer' ||
      typeof record.rightsTransferRoot === 'string',
  );
  const deliveryVisible = findFirstBoolean(settlementBoundary || payload, [
    'sourceBearingDeliveryVisibleToReader',
    'sourceBearingDeliveryUnlockedToReader',
    'sourceAvailable',
  ]);
  const sourceSafety = {
    ...SOURCE_SAFETY,
    ...(input.sourceSafety || {}),
  } as AssetPackCommodityStateSourceSafety;
  const quoteIssued = Boolean(
    input.quoteIssued ||
      input.btc?.quoteIssued ||
      previewBoundary ||
      findFirstString(payload, ['quoteRoot', 'quoteId']) ||
      (isBtcSettlementState(btcStateHint) && btcStateHint !== 'btc-not-quoteable'),
  );
  const paymentObserved = Boolean(
    input.settlementObserved ||
      input.btc?.paymentObserved ||
      paymentObservation ||
      ['btc-payment-observed', 'btc-finality-confirmed', 'btc-settlement-finalized', 'btc-contributor-compensation-routable'].includes(String(btcStateHint)),
  );
  const finalityConfirmed = Boolean(
    input.btc?.finalityConfirmed ||
      finalityState === 'confirmed' ||
      settlementState === 'settlement_delivered' ||
      ['btc-finality-confirmed', 'btc-settlement-finalized', 'btc-contributor-compensation-routable'].includes(String(btcStateHint)),
  );
  const rightsTransferred = Boolean(
    input.rightsTransferred ||
      input.btd?.rightsTransferred ||
      rightsTransfer ||
      settlementState === 'settlement_delivered' ||
      ['btd-rights-transferred', 'btd-source-to-shares-allocated'].includes(String(btdStateHint)),
  );
  const sourceUnlocked = Boolean(
    input.sourceUnlockedDelivery ||
      deliveryVisible === true ||
      settlementState === 'settlement_delivered' ||
      assetPackStateHint === 'source-unlocked-delivery' ||
      assetPackStateHint === 'compensated-and-reconciled',
  );
  const compensationRoutable = Boolean(
    input.btc?.contributorCompensationRoutable ||
      input.compensatedAndReconciled ||
      sourceToSharesRoot ||
      (compensationState &&
        /routed|allocated|allocation_ready|compensation_routable|compensation-routable|settled|paid/i.test(compensationState) &&
        !/preview/i.test(compensationState)),
  );
  const compensationReconciled = Boolean(
    input.compensatedAndReconciled ||
      assetPackStateHint === 'compensated-and-reconciled' ||
      (compensationRoutable && settlementState === 'settlement_delivered'),
  );
  const repairRequired = Boolean(
    input.repairRequired ||
      input.btd?.repairRequired ||
      input.btc?.repairRequired ||
      includesRepairToken(assetPackStateHint, btdStateHint, btcStateHint, settlementState, finalityState, findFirstString(payload, ['repairState'])),
  );

  return {
    depositOptionSynthesized: Boolean(input.depositOptionSynthesized || depositOption || /deposit.option/i.test(String(findFirstString(payload, ['type']) || ''))),
    depositOptionReviewed: Boolean(
      input.depositOptionReviewed ||
        ['deposit-option-reviewed', 'depository-assetpack-admitted'].includes(String(assetPackStateHint)) ||
        ['reviewable-source-safe-option', 'approved', 'accepted'].includes(String(readString(depositOption, 'reviewState'))),
    ),
    depositoryAssetPackAdmitted: Boolean(
      input.depositoryAssetPackAdmitted ||
        input.depositoryAssetPack ||
        assetPackStateHint === 'depository-assetpack-admitted' ||
        /admitted/i.test(String(findFirstString(payload, ['admissionState', 'state']) || '')),
    ),
    fitCandidatesRecalled: Boolean(
      input.fitCandidatesRecalled ||
        fitResult ||
        assetPackStateHint === 'fit-candidates-recalled' ||
        findFirstString(payload, ['queryRoot', 'rankingRoot']),
    ),
    fitSetSelected: selectedIds.length > 0 || assetPackStateHint === 'fit-set-selected',
    needFitAssetPackSynthesized: Boolean(
      input.needFitAssetPackSynthesized ||
        previewBoundary ||
        assetPackStateHint === 'need-fit-assetpack-synthesized' ||
        assetPackStateHint === 'need-fit-assetpack-quoted',
    ),
    quoteIssued,
    paymentObserved,
    paymentMatchesQuote: findFirstBoolean(settlementBoundary || payload, ['paymentMatchesQuote']),
    finalityConfirmed,
    rightsTransferred,
    sourceUnlocked,
    compensationRoutable,
    compensationReconciled,
    repairRequired,
    protectedSourceVisibleBeforeSettlement: Boolean(
      sourceSafety.protectedSourceVisible ||
        sourceSafety.unpaidAssetPackSourceVisible ||
        sourceSafety.rawPromptVisible ||
        sourceSafety.rawProviderResponseVisible ||
        sourceSafety.walletPrivateMaterialVisible ||
        sourceSafety.settlementPrivatePayloadVisible,
    ),
  };
}

function assetPackStateFrom(input: AssetPackCommodityStateInput, evidence: AssetPackCommodityStateEvidence): AssetPackLifecycleState {
  const hint = input.assetPackStateHint || findFirstString(input.payload ?? input, ['assetPackState', 'assetPackLifecycleState']);
  if (evidence.repairRequired || evidence.protectedSourceVisibleBeforeSettlement) return 'repair-required';
  if (evidence.compensationReconciled) return 'compensated-and-reconciled';
  if (evidence.sourceUnlocked) return 'source-unlocked-delivery';
  if (evidence.rightsTransferred) return 'btd-settled-rights-transferred';
  if (evidence.paymentObserved) return 'settlement-observed';
  if (evidence.quoteIssued) return 'need-fit-assetpack-quoted';
  if (evidence.needFitAssetPackSynthesized) return 'need-fit-assetpack-synthesized';
  if (evidence.fitSetSelected) return 'fit-set-selected';
  if (evidence.fitCandidatesRecalled) return 'fit-candidates-recalled';
  if (evidence.depositoryAssetPackAdmitted) return 'depository-assetpack-admitted';
  if (evidence.depositOptionReviewed) return 'deposit-option-reviewed';
  if (isAssetPackLifecycleState(hint)) return hint;
  return 'deposit-option-synthesized';
}

function btdStateFrom(input: AssetPackCommodityStateInput, evidence: AssetPackCommodityStateEvidence): BtdScalarVolumeState {
  const btd = input.btd || {};
  const hint = input.btdStateHint || findFirstString(input.payload ?? input, ['btdState', 'btdScalarVolumeState']);
  if (btd.repairRequired || evidence.repairRequired || evidence.protectedSourceVisibleBeforeSettlement) return 'btd-repair-required';
  if (btd.sourceToSharesAllocated || evidence.compensationRoutable) return 'btd-source-to-shares-allocated';
  if (btd.rightsTransferred || evidence.rightsTransferred) return 'btd-rights-transferred';
  if (btd.rightsPending) return 'btd-rights-pending';
  if (btd.quoteBound || evidence.quoteIssued) return 'btd-quote-bound';
  if (btd.rangeAssigned || Boolean(findFirstString(input.payload ?? input, ['rangeRoot', 'btdRangeRoot']))) return 'btd-range-assigned';
  if (btd.measuremintApplied) return 'measuremint-applied';
  if (btd.quantized) return 'btd-quantized';
  if (btd.weightedScalarVolumeComputed || Boolean(findFirstString(input.payload ?? input, ['weightedScalarVolumeRoot']))) {
    return 'weighted-scalar-volume-computed';
  }
  if (btd.weightPolicyLocked) return 'measurement-weight-policy-locked';
  if (btd.measurementsAdmitted || Boolean(findFirstString(input.payload ?? input, ['measurementRoot', 'assetPackMeasurementRoot']))) {
    return 'need-fit-measurements-admitted';
  }
  if (btd.potentialMeasured || Boolean(findFirstString(input.payload ?? input, ['btdPotentialRoot']))) return 'btd-potential-measured';
  if (isBtdScalarVolumeState(hint)) return hint;
  return 'btd-not-applicable';
}

function btcStateFrom(input: AssetPackCommodityStateInput, evidence: AssetPackCommodityStateEvidence): BtcSettlementState {
  const btc = input.btc || {};
  const hint = input.btcStateHint || findFirstString(input.payload ?? input, ['btcState', 'btcSettlementState']);
  if (btc.repairRequired || evidence.repairRequired || evidence.protectedSourceVisibleBeforeSettlement) return 'btc-settlement-repair-required';
  if (btc.refundOrEscalationRequired) return 'btc-refund-or-escalation-required';
  if (btc.contributorCompensationRoutable || evidence.compensationRoutable) return 'btc-contributor-compensation-routable';
  if (btc.settlementFinalized || evidence.sourceUnlocked) return 'btc-settlement-finalized';
  if (btc.finalityConfirmed || evidence.finalityConfirmed) return 'btc-finality-confirmed';
  if (btc.replacedReorgedOrFailed) return 'btc-replaced-reorged-or-failed';
  if (btc.paymentMismatchRepairRequired || evidence.paymentMatchesQuote === false) return 'btc-payment-mismatch-repair-required';
  if (btc.paymentObserved || evidence.paymentObserved) return 'btc-payment-observed';
  if (btc.broadcastSubmitted) return 'btc-broadcast-submitted';
  if (btc.psbtSigned) return 'btc-psbt-signed';
  if (btc.psbtPrepared) return 'btc-psbt-prepared';
  if (btc.walletReady) return 'btc-wallet-ready';
  if (btc.quoteInactive) return 'btc-quote-inactive';
  if (btc.quoteAccepted) return 'btc-quote-accepted';
  if (btc.quoteIssued || evidence.quoteIssued) return 'btc-quote-issued';
  if (isBtcSettlementState(hint)) return hint;
  return 'btc-not-quoteable';
}

function disclosureBoundaryFrom(evidence: AssetPackCommodityStateEvidence, btc: BtcSettlementState): AssetPackDisclosureBoundary {
  if (evidence.sourceUnlocked) return 'after-repository-delivery';
  if (evidence.rightsTransferred) return 'after-btd-rights-transfer';
  if (evidence.finalityConfirmed || btc === 'btc-finality-confirmed' || btc === 'btc-settlement-finalized') return 'after-finality';
  if (evidence.paymentObserved) return 'after-payment-observation';
  if (evidence.quoteIssued) return 'after-quote';
  if (evidence.needFitAssetPackSynthesized || evidence.fitSetSelected) return 'after-preview';
  return 'before-settlement';
}

function blockersFor(projection: Pick<AssetPackCommodityStateProjection, 'states' | 'evidence'>) {
  const blockers: string[] = [];
  const { states, evidence } = projection;
  if (evidence.protectedSourceVisibleBeforeSettlement) blockers.push('protected_source_visibility_before_settlement');
  if ((states.assetPack === 'source-unlocked-delivery' || states.assetPack === 'compensated-and-reconciled') && !evidence.rightsTransferred) {
    blockers.push('source_unlock_without_btd_rights_transfer');
  }
  if ((states.assetPack === 'btd-settled-rights-transferred' || states.assetPack === 'source-unlocked-delivery') && !evidence.finalityConfirmed) {
    blockers.push('rights_or_delivery_without_btc_finality');
  }
  if (states.btc === 'btc-payment-observed' && evidence.finalityConfirmed) {
    blockers.push('btc_payment_observation_collapsed_with_finality');
  }
  if (states.btc === 'btc-quote-issued' && evidence.paymentObserved) {
    blockers.push('btc_quote_collapsed_with_payment_observation');
  }
  if (states.assetPack === 'need-fit-assetpack-quoted' && evidence.paymentObserved) {
    blockers.push('assetpack_quote_collapsed_with_settlement_observation');
  }
  if (states.assetPack === 'settlement-observed' && evidence.finalityConfirmed && evidence.rightsTransferred) {
    blockers.push('settlement_observation_collapsed_with_rights_transfer');
  }
  return blockers;
}

export function buildAssetPackCommodityStateProjection(
  input: AssetPackCommodityStateInput = {},
): AssetPackCommodityStateProjection {
  const payload = input.payload ?? input;
  const evidence = resolveEvidence(input);
  const assetPack = assetPackStateFrom(input, evidence);
  const btd = btdStateFrom(input, evidence);
  const btc = btcStateFrom(input, evidence);
  const states = { assetPack, btd, btc };
  const projection: AssetPackCommodityStateProjection = {
    schema: 'bitcode.asset-pack.commodity-state-projection',
    states,
    disclosureBoundary: disclosureBoundaryFrom(evidence, btc),
    evidence,
    proofRoots: collectProofRoots(input, payload),
    sourceSafety: {
      ...SOURCE_SAFETY,
      ...(input.sourceSafety || {}),
    } as AssetPackCommodityStateSourceSafety,
    blockers: [],
  };
  projection.blockers = blockersFor(projection);
  return projection;
}

export function projectAssetPackCommodityStateForPayload(payload: unknown): AssetPackCommodityStateProjection {
  return buildAssetPackCommodityStateProjection({ payload });
}

export function assertAssetPackCommodityStateProjection(
  projection: AssetPackCommodityStateProjection,
): AssetPackCommodityStateProjection {
  if (!isAssetPackLifecycleState(projection.states.assetPack)) {
    throw new Error(`Unsupported AssetPack lifecycle state: ${projection.states.assetPack}`);
  }
  if (!isBtdScalarVolumeState(projection.states.btd)) {
    throw new Error(`Unsupported BTD scalar-volume state: ${projection.states.btd}`);
  }
  if (!isBtcSettlementState(projection.states.btc)) {
    throw new Error(`Unsupported BTC settlement state: ${projection.states.btc}`);
  }
  if (
    projection.sourceSafety.sourceSafeMetadataOnly !== true ||
    projection.sourceSafety.protectedSourceVisible !== false ||
    projection.sourceSafety.unpaidAssetPackSourceVisible !== false ||
    projection.sourceSafety.rawPromptVisible !== false ||
    projection.sourceSafety.interpolatedPromptVisible !== false ||
    projection.sourceSafety.rawProviderResponseVisible !== false ||
    projection.sourceSafety.walletPrivateMaterialVisible !== false ||
    projection.sourceSafety.settlementPrivatePayloadVisible !== false ||
    projection.sourceSafety.credentialsSerialized !== false
  ) {
    throw new Error('AssetPack commodity state projection is not source-safe.');
  }
  const blockers = [...new Set([...projection.blockers, ...blockersFor(projection)])];
  if (blockers.length > 0) {
    throw new Error(`AssetPack commodity state projection has collapsed or unsafe states: ${blockers.join(', ')}`);
  }
  return projection;
}

export function toSourceSafeAssetPackCommodityStateDisplay(
  projection: AssetPackCommodityStateProjection,
): AssetPackCommodityStateDisplay {
  return {
    schema: 'bitcode.asset-pack.commodity-state-display',
    assetPackState: projection.states.assetPack,
    btdState: projection.states.btd,
    btcState: projection.states.btc,
    disclosureBoundary: projection.disclosureBoundary,
    repairRequired: projection.states.assetPack === 'repair-required' || projection.states.btd === 'btd-repair-required' || projection.states.btc === 'btc-settlement-repair-required',
    blockers: [...projection.blockers],
    proofRoots: { ...projection.proofRoots },
    sourceSafety: { ...projection.sourceSafety },
  };
}
