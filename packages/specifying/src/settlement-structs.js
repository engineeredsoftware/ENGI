// @ts-check

/**
 * @typedef {import('./canonical/type-contracts.js').SourceContributionEntryKind} SourceContributionEntryKind
 * @typedef {import('./canonical/type-contracts.js').SettlementParticipationRecordKind} SettlementParticipationRecordKind
 * @typedef {import('./canonical/type-contracts.js').SourceContributionDisposition} SourceContributionDisposition
 * @typedef {import('./canonical/type-contracts.js').SelectionStatus} SelectionStatus
 * @typedef {import('./canonical/type-contracts.js').SettlementStatus} SettlementStatus
 * @typedef {import('./canonical/type-contracts.js').CreditDisposition} CreditDisposition
 * @typedef {import('./canonical/type-contracts.js').SettlementDisposition} SettlementDisposition
 * @typedef {import('./canonical/type-contracts.js').SourceContributionDispositionInput} SourceContributionDispositionInput
 * @typedef {import('./canonical/type-contracts.js').SettlementParticipationInput} SettlementParticipationInput
 * @typedef {import('./canonical/type-contracts.js').SettlementParticipationStruct} SettlementParticipationStruct
 */

/** @type {SourceContributionEntryKind} */
export const SOURCE_CONTRIBUTION_ENTRY_KIND = 'source-contribution-entry';
/** @type {SettlementParticipationRecordKind} */
export const SETTLEMENT_PARTICIPATION_RECORD_KIND = 'settlement-participation-record';

/** @type {Readonly<{ POSITIVE: SourceContributionDisposition, CLIPPED: SourceContributionDisposition }>} */
export const SOURCE_CONTRIBUTION_DISPOSITIONS = Object.freeze({
  POSITIVE: 'positive-marginal-contribution',
  CLIPPED: 'clipped-to-zero'
});

/** @type {Readonly<{ SELECTED: SelectionStatus, NOT_SELECTED: SelectionStatus }>} */
export const SELECTION_STATUSES = Object.freeze({
  SELECTED: 'selected-into-branch',
  NOT_SELECTED: 'not-selected-into-branch'
});

/** @type {Readonly<{ PARTICIPATING: SettlementStatus, EXCLUDED: SettlementStatus }>} */
export const SETTLEMENT_STATUSES = Object.freeze({
  PARTICIPATING: 'settlement-participating',
  EXCLUDED: 'excluded-from-settlement'
});

/** @type {Readonly<{ POSITIVE: CreditDisposition, ZERO: CreditDisposition, NONE: CreditDisposition }>} */
export const CREDIT_DISPOSITIONS = Object.freeze({
  POSITIVE: 'positive-credit',
  ZERO: 'zero-credit-participating',
  NONE: 'no-credit-nonparticipant'
});

/** @type {Readonly<{ CREDITED: SettlementDisposition, ZERO: SettlementDisposition, EXCLUDED: SettlementDisposition }>} */
export const SETTLEMENT_DISPOSITIONS = Object.freeze({
  CREDITED: 'credited-in-ledger',
  ZERO: 'participating-zero-credit',
  EXCLUDED: 'not-in-settlement-ledger'
});

/**
 * @param {SourceContributionDispositionInput} [input={}]
 * @returns {SourceContributionDisposition}
 */
export function buildSourceContributionDisposition({ clipped } = {}) {
  return clipped
    ? SOURCE_CONTRIBUTION_DISPOSITIONS.CLIPPED
    : SOURCE_CONTRIBUTION_DISPOSITIONS.POSITIVE;
}

/**
 * @param {SettlementParticipationInput} [input={}]
 * @returns {SettlementParticipationStruct}
 */
export function buildSettlementParticipationStruct({
  selected = false,
  settlementParticipating = false,
  creditedMicroUnits = '0',
  contributionDisposition = SOURCE_CONTRIBUTION_DISPOSITIONS.POSITIVE,
  branchMode = 'patch',
  useTier = 'unknown'
} = {}) {
  const positivelyCredited = BigInt(creditedMicroUnits) > 0n;
  const zeroCreditParticipating = settlementParticipating && !positivelyCredited;
  return {
    recordKind: SETTLEMENT_PARTICIPATION_RECORD_KIND,
    selectionStatus: selected ? SELECTION_STATUSES.SELECTED : SELECTION_STATUSES.NOT_SELECTED,
    settlementStatus: settlementParticipating ? SETTLEMENT_STATUSES.PARTICIPATING : SETTLEMENT_STATUSES.EXCLUDED,
    creditDisposition: positivelyCredited
      ? CREDIT_DISPOSITIONS.POSITIVE
      : zeroCreditParticipating
        ? CREDIT_DISPOSITIONS.ZERO
        : CREDIT_DISPOSITIONS.NONE,
    settlementDisposition: settlementParticipating
      ? (positivelyCredited ? SETTLEMENT_DISPOSITIONS.CREDITED : SETTLEMENT_DISPOSITIONS.ZERO)
      : SETTLEMENT_DISPOSITIONS.EXCLUDED,
    contributionDisposition,
    positivelyCredited,
    zeroCreditParticipating,
    excludedFromSettlement: !settlementParticipating,
    exclusionReason: !settlementParticipating
      ? (selected
          ? `selected for ${branchMode} branch but excluded from settlement because use tier was ${useTier}`
          : `not selected into the ${branchMode} branch`)
      : null
  };
}
