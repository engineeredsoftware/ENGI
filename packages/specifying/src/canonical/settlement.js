// @ts-check

/**
 * @typedef {import('./type-contracts.js').SourceContributionDisposition} SourceContributionDisposition
 *
 * @typedef {{
 *   readId: string,
  *   failureModes?: string[] | undefined,
 *   constraints?: string[] | undefined,
 *   touchedPaths?: string[] | undefined
 * }} ReadShape
 *
 * @typedef {{
 *   unitId: string
 * }} ContentUnit
 *
 * @typedef {{
 *   privateContent?: string | undefined,
 *   declaredConstraints?: string[] | undefined,
 *   sourcePaths?: string[] | undefined
 * }} AssetMetadata
 *
 * @typedef {{
 *   title: string,
 *   contentRoot: string,
 *   contentUnits: ContentUnit[],
 *   metadata: AssetMetadata
 * }} CandidateAsset
 *
 * @typedef {{
 *   finalRankingScore: number
 * }} RankingShape
 *
 * @typedef {{
 *   assetId: string,
 *   useTier: string,
 *   asset: CandidateAsset,
 *   ranking: RankingShape
 * }} EvaluatedCandidate
 *
 * @typedef {{
 *   assetId: string,
 *   unitId: string
 * }} LockedUnit
 *
 * @typedef {{
 *   assets: Array<{ assetId: string }>,
 *   units: LockedUnit[]
 * }} AssetPackLockShape
 *
 * @typedef {{
  *   assetPackId: string
 *   selectedAssets: string[]
  * }} AssetPackShape
 *
 * @typedef {{
 *   buyerId: string
 * }} BuyerShape
 *
 * @typedef {{
 *   ledger: {
 *     accounts: Record<string, string>
 *   }
 * }} SettlementState
 */

import { buildAccountingPrecisionReport } from './proof-materialization.js';
import {
  allTheoremsPassed,
  buildArtifactBinding,
  buildReplayStep,
  buildTheoremVerdict
} from './proof-annotations.js';
import { PROFILE_A, PROFILE_B } from '../realization-profile.js';
import {
  buildSettlementParticipationStruct,
  buildSourceContributionDisposition,
  SOURCE_CONTRIBUTION_ENTRY_KIND
} from '../settlement-structs.js';

const BITCODE_PROTOCOL_FOCUS = 'source-to-shares';
const SOURCE_TO_SHARES_FIT_QUALITY_OC_ID = 'bitcode.source-to-shares.quantized-fit-quality-oc.v26';
const PRESENT_FIT_FOR_SETTLEMENT_REVIEW_STAGE = 'present-fit-for-settlement-review';

/**
 * @param {{
 *   METERED_MICRO_UNITS: string,
 *   MAX_BPS: number,
 *   MAX_BPS_BIGINT: bigint,
 *   SOURCE_TO_SHARES_SCALE: bigint,
 *   countValues: (values: string[]) => Record<string, number>,
 *   stableHashObject: (value: unknown) => string,
 *   sha256: (value: unknown) => string
 * }} input
 */
export function createSettlementRuntime({
  METERED_MICRO_UNITS,
  MAX_BPS,
  MAX_BPS_BIGINT,
  SOURCE_TO_SHARES_SCALE,
  countValues,
  stableHashObject,
  sha256
}) {
  /**
   * @param {number | string | bigint | null | undefined} value
   * @param {bigint} [scale=SOURCE_TO_SHARES_SCALE]
   */
  function toFixedPointUnits(value, scale = SOURCE_TO_SHARES_SCALE) {
    return BigInt(Math.round((Number(value) || 0) * Number(scale)));
  }

  /**
   * @param {number} hitCount
   * @param {number} totalCount
   * @param {bigint} [scale=SOURCE_TO_SHARES_SCALE]
   */
  function fixedPointRatioUnits(hitCount, totalCount, scale = SOURCE_TO_SHARES_SCALE) {
    if (!totalCount) return 0n;
    return (BigInt(hitCount) * scale) / BigInt(totalCount);
  }

  /**
   * @param {bigint} units
   * @param {bigint} [scale=SOURCE_TO_SHARES_SCALE]
   */
  function fixedPointUnitsToString(units, scale = SOURCE_TO_SHARES_SCALE) {
    const sign = units < 0n ? '-' : '';
    const magnitude = units < 0n ? -units : units;
    const whole = magnitude / scale;
    const fraction = String(magnitude % scale).padStart(String(scale - 1n).length, '0').replace(/0+$/, '');
    return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
  }

  /**
   * @param {Record<string, string>} accounts
   */
  function ledgerRoot(accounts) {
    return stableHashObject(accounts);
  }

  /**
   * @param {{
   *   bundleShareScoreUnits: bigint,
   *   scoreScale: string,
   *   componentShareScoreUnits: {
   *     averageRankingUnits: bigint,
   *     failureModeCoverageUnits: bigint,
   *     constraintCoverageUnits: bigint,
   *     touchedPathCoverageUnits: bigint
   *   },
   *   coveredReadEvidence: Record<string, unknown>,
   *   bundleScoreHash: string
   * }} bundleScore
   */
  function buildQuantizedSourceToSharesFitQualities(bundleScore) {
    const qualities = [
      {
        qualityId: 'average-ranking-fit',
        label: 'Average candidate ranking fit',
        weightBp: 6000,
        quantizedUnits: bundleScore.componentShareScoreUnits.averageRankingUnits.toString(),
        quantizedDecimal: fixedPointUnitsToString(bundleScore.componentShareScoreUnits.averageRankingUnits),
        evidenceClass: 'candidate-ranking'
      },
      {
        qualityId: 'failure-mode-coverage-fit',
        label: 'Failure mode coverage fit',
        weightBp: 2000,
        quantizedUnits: bundleScore.componentShareScoreUnits.failureModeCoverageUnits.toString(),
        quantizedDecimal: fixedPointUnitsToString(bundleScore.componentShareScoreUnits.failureModeCoverageUnits),
        evidenceClass: 'measured-read-failure-modes'
      },
      {
        qualityId: 'constraint-coverage-fit',
        label: 'Constraint coverage fit',
        weightBp: 1000,
        quantizedUnits: bundleScore.componentShareScoreUnits.constraintCoverageUnits.toString(),
        quantizedDecimal: fixedPointUnitsToString(bundleScore.componentShareScoreUnits.constraintCoverageUnits),
        evidenceClass: 'measured-read-constraints'
      },
      {
        qualityId: 'touched-path-coverage-fit',
        label: 'Touched path coverage fit',
        weightBp: 1000,
        quantizedUnits: bundleScore.componentShareScoreUnits.touchedPathCoverageUnits.toString(),
        quantizedDecimal: fixedPointUnitsToString(bundleScore.componentShareScoreUnits.touchedPathCoverageUnits),
        evidenceClass: 'measured-read-touched-paths'
      },
      {
        qualityId: 'bundle-share-score',
        label: 'Weighted source-to-shares bundle fit',
        weightBp: 10000,
        quantizedUnits: bundleScore.bundleShareScoreUnits.toString(),
        quantizedDecimal: fixedPointUnitsToString(bundleScore.bundleShareScoreUnits),
        evidenceClass: 'source-to-shares-weighted-objective'
      }
    ];

    return {
      objectiveContractId: SOURCE_TO_SHARES_FIT_QUALITY_OC_ID,
      protocolFocus: BITCODE_PROTOCOL_FOCUS,
      reviewStage: PRESENT_FIT_FOR_SETTLEMENT_REVIEW_STAGE,
      scoreScale: bundleScore.scoreScale,
      quantization: {
        denomination: 'fixed-point-source-to-shares-score-units',
        scale: bundleScore.scoreScale,
        qualityWeightsBp: {
          averageRanking: 6000,
          failureModeCoverage: 2000,
          constraintCoverage: 1000,
          touchedPathCoverage: 1000
        }
      },
      qualities,
      coveredReadEvidence: bundleScore.coveredReadEvidence,
      bundleScoreHash: bundleScore.bundleScoreHash,
      fitQualityHash: stableHashObject({
        objectiveContractId: SOURCE_TO_SHARES_FIT_QUALITY_OC_ID,
        scoreScale: bundleScore.scoreScale,
        qualities: qualities.map((quality) => ({
          qualityId: quality.qualityId,
          quantizedUnits: quality.quantizedUnits,
          weightBp: quality.weightBp
        })),
        bundleScoreHash: bundleScore.bundleScoreHash
      })
    };
  }

  /**
   * @param {Record<string, bigint>} accounts
   * @returns {Record<string, string>}
   */
  function stringifyBigIntMap(accounts) {
    return Object.fromEntries(Object.entries(accounts).map(([key, value]) => [key, String(value)]));
  }

  /**
   * @param {ReadShape} read
   * @param {EvaluatedCandidate[]} candidates
   */
  function scoreSourceBundleForShares(read, candidates) {
    const failureModes = read.failureModes || [];
    const constraints = read.constraints || [];
    const touchedPaths = read.touchedPaths || [];
    if (!candidates.length) {
      return {
        bundleShareScoreUnits: 0n,
        scoreScale: SOURCE_TO_SHARES_SCALE.toString(),
        componentShareScoreUnits: {
          averageRankingUnits: 0n,
          failureModeCoverageUnits: 0n,
          constraintCoverageUnits: 0n,
          touchedPathCoverageUnits: 0n
        },
        coveredReadEvidence: {
          failureModes: [],
          constraints: [],
          touchedPaths: []
        },
        bundleScoreHash: stableHashObject({ empty: true })
      };
    }

    const coveredFailureModes = [...new Set(
      candidates.flatMap((candidate) => failureModes.filter((value) => String(candidate.asset.metadata.privateContent || '').includes(value)))
    )];
    const coveredConstraints = [...new Set(
      candidates.flatMap((candidate) => (candidate.asset.metadata.declaredConstraints || []).filter((value) => constraints.includes(value)))
    )];
    const coveredTouchedPaths = [...new Set(
      candidates.flatMap((candidate) => (candidate.asset.metadata.sourcePaths || []).filter((value) => touchedPaths.includes(value)))
    )];
    const averageRankingUnits = candidates.reduce(
      (sum, candidate) => sum + toFixedPointUnits(candidate.ranking.finalRankingScore),
      0n
    ) / BigInt(candidates.length);
    const failureModeCoverageUnits = fixedPointRatioUnits(coveredFailureModes.length, failureModes.length || 1);
    const constraintCoverageUnits = fixedPointRatioUnits(coveredConstraints.length, constraints.length || 1);
    const touchedPathCoverageUnits = fixedPointRatioUnits(coveredTouchedPaths.length, touchedPaths.length || 1);
    const bundleShareScoreUnits = (
      (averageRankingUnits * 60n) +
      (failureModeCoverageUnits * 20n) +
      (constraintCoverageUnits * 10n) +
      (touchedPathCoverageUnits * 10n)
    ) / 100n;

    return {
      bundleShareScoreUnits,
      scoreScale: SOURCE_TO_SHARES_SCALE.toString(),
      componentShareScoreUnits: {
        averageRankingUnits,
        failureModeCoverageUnits,
        constraintCoverageUnits,
        touchedPathCoverageUnits
      },
      coveredReadEvidence: {
        failureModes: coveredFailureModes,
        constraints: coveredConstraints,
        touchedPaths: coveredTouchedPaths
      },
      bundleScoreHash: stableHashObject({
        candidateIds: candidates.map((candidate) => candidate.assetId),
        averageRankingUnits: averageRankingUnits.toString(),
        failureModeCoverageUnits: failureModeCoverageUnits.toString(),
        constraintCoverageUnits: constraintCoverageUnits.toString(),
        touchedPathCoverageUnits: touchedPathCoverageUnits.toString(),
        bundleShareScoreUnits: bundleShareScoreUnits.toString()
      })
    };
  }

  /**
   * @param {Array<{
   *   assetId: string,
   *   clippedContributionUnits: bigint,
   *   rawContributionUnits: bigint,
   *   reasons: string[]
   * }>} contributionEntries
   */
  function normalizeContributionUnitsToBasisPoints(contributionEntries) {
    if (!contributionEntries.length) {
      return {
        normalizedShares: [],
        normalizationTrace: {
          method: 'largest-remainder',
          totalContributionUnits: '0',
          fallbackEvenDistribution: false,
          tieBreakPolicy: 'remainder desc, clipped contribution desc, assetId asc',
          remainderDistributionOrder: [],
          provisionalShares: [],
          remainderBasisPoints: 0,
          normalizedTotalBp: 0
        }
      };
    }

    const orderedByAssetId = contributionEntries.slice().sort((a, b) => a.assetId.localeCompare(b.assetId));
    const totalContributionUnits = orderedByAssetId.reduce((sum, entry) => sum + entry.clippedContributionUnits, 0n);
    if (totalContributionUnits <= 0n) {
      const even = Math.floor(MAX_BPS / orderedByAssetId.length);
      const remainderUnits = MAX_BPS - (even * orderedByAssetId.length);
      const normalizedShares = orderedByAssetId.map((entry, index) => ({
        assetId: entry.assetId,
        shareBp: even + (index < remainderUnits ? 1 : 0),
        rawContributionUnits: entry.rawContributionUnits.toString(),
        clippedContributionUnits: entry.clippedContributionUnits.toString(),
        normalizationRemainderUnits: '0',
        reasons: [...entry.reasons, 'fallback-even-distribution']
      }));
      const provisionalShares = orderedByAssetId.map((entry, index) => ({
        assetId: entry.assetId,
        tieBreakRank: index + 1,
        floorShareBp: even,
        remainderUnits: '0',
        remainderAwardedBp: index < remainderUnits ? 1 : 0,
        finalShareBp: even + (index < remainderUnits ? 1 : 0),
        rawContributionUnits: entry.rawContributionUnits.toString(),
        clippedContributionUnits: entry.clippedContributionUnits.toString()
      }));
      return {
        normalizedShares,
        normalizationTrace: {
          method: 'largest-remainder',
          totalContributionUnits: totalContributionUnits.toString(),
          fallbackEvenDistribution: true,
          tieBreakPolicy: 'assetId asc for even fallback remainder',
          remainderDistributionOrder: orderedByAssetId.map((entry) => entry.assetId),
          provisionalShares,
          remainderBasisPoints: remainderUnits,
          normalizedTotalBp: normalizedShares.reduce((sum, entry) => sum + entry.shareBp, 0)
        }
      };
    }

    const provisional = orderedByAssetId.map((entry) => {
      const exactNumerator = entry.clippedContributionUnits * MAX_BPS_BIGINT;
      const floorShare = Number(exactNumerator / totalContributionUnits);
      return {
        assetId: entry.assetId,
        floorShare,
        remainderUnits: exactNumerator % totalContributionUnits,
        clippedContributionUnits: entry.clippedContributionUnits,
        rawContributionUnits: entry.rawContributionUnits,
        reasons: entry.reasons,
        remainderAwardedBp: 0,
        tieBreakRank: 0
      };
    });
    const usedBasisPoints = provisional.reduce((sum, entry) => sum + entry.floorShare, 0);
    const remainderBasisPoints = MAX_BPS - usedBasisPoints;
    provisional.sort((left, right) => {
      if (left.remainderUnits !== right.remainderUnits) return left.remainderUnits > right.remainderUnits ? -1 : 1;
      if (left.clippedContributionUnits !== right.clippedContributionUnits) return left.clippedContributionUnits > right.clippedContributionUnits ? -1 : 1;
      return left.assetId.localeCompare(right.assetId);
    });

    const remainderDistributionOrder = provisional.map((entry) => entry.assetId);
    provisional.forEach((entry, index) => {
      entry.tieBreakRank = index + 1;
    });
    for (let index = 0; index < remainderBasisPoints; index += 1) {
      const provisionalEntry = provisional[index];
      if (!provisionalEntry) continue;
      provisionalEntry.remainderAwardedBp += 1;
      provisionalEntry.floorShare += 1;
    }
    const provisionalShares = provisional.map((entry) => ({
      assetId: entry.assetId,
      tieBreakRank: entry.tieBreakRank,
      floorShareBp: entry.floorShare - entry.remainderAwardedBp,
      remainderUnits: entry.remainderUnits.toString(),
      remainderAwardedBp: entry.remainderAwardedBp,
      finalShareBp: entry.floorShare,
      rawContributionUnits: entry.rawContributionUnits.toString(),
      clippedContributionUnits: entry.clippedContributionUnits.toString()
    }));

    const normalizedShares = provisional
      .sort((left, right) => right.floorShare - left.floorShare || left.assetId.localeCompare(right.assetId))
      .map((entry) => ({
        assetId: entry.assetId,
        shareBp: entry.floorShare,
        rawContributionUnits: entry.rawContributionUnits.toString(),
        clippedContributionUnits: entry.clippedContributionUnits.toString(),
        normalizationRemainderUnits: entry.remainderUnits.toString(),
        reasons: entry.reasons
      }));

    return {
      normalizedShares,
      normalizationTrace: {
        method: 'largest-remainder',
        totalContributionUnits: totalContributionUnits.toString(),
        fallbackEvenDistribution: false,
        tieBreakPolicy: 'remainder desc, clipped contribution desc, assetId asc',
        remainderDistributionOrder,
        provisionalShares,
        remainderBasisPoints,
        normalizedTotalBp: normalizedShares.reduce((sum, entry) => sum + entry.shareBp, 0)
      }
    };
  }

  /**
   * @param {ReadShape} read
   * @param {EvaluatedCandidate[]} settlementCandidates
   */
  function buildSourceToSharesArtifact(read, settlementCandidates) {
    const fullBundleScore = scoreSourceBundleForShares(read, settlementCandidates);
    const quantizedFitQualities = buildQuantizedSourceToSharesFitQualities(fullBundleScore);
    const sourceContributionEntries = settlementCandidates.map((candidate) => {
      const bundleWithoutCandidate = scoreSourceBundleForShares(
        read,
        settlementCandidates.filter((entry) => entry.assetId !== candidate.assetId)
      );
      const rawContributionUnits = fullBundleScore.bundleShareScoreUnits - bundleWithoutCandidate.bundleShareScoreUnits;
      const clippedContributionUnits = rawContributionUnits > 0n ? rawContributionUnits : 0n;
      const clipped = rawContributionUnits <= 0n;
      const contributionDisposition = buildSourceContributionDisposition({ clipped });
      const clippingReceiptId = `clip_receipt_${sha256(`${read.readId}:${candidate.assetId}:${rawContributionUnits}`).slice(0, 12)}`;
      return {
        entryKind: SOURCE_CONTRIBUTION_ENTRY_KIND,
        assetId: candidate.assetId,
        title: candidate.asset.title,
        contentRoot: candidate.asset.contentRoot,
        fullBundleScoreUnits: fullBundleScore.bundleShareScoreUnits,
        bundleWithoutAssetScoreUnits: bundleWithoutCandidate.bundleShareScoreUnits,
        rawContributionUnits,
        clippedContributionUnits,
        clipped,
        contributionDisposition,
        clippingReceiptId,
        selectedUnitRefs: candidate.asset.contentUnits.slice(0, 2).map((unit) => unit.unitId),
        reasons: clipped
          ? [
              `raw marginal contribution for ${candidate.assetId} was non-positive`,
              `fullBundleScoreUnits=${fullBundleScore.bundleShareScoreUnits.toString()}`,
              `bundleWithoutAssetScoreUnits=${bundleWithoutCandidate.bundleShareScoreUnits.toString()}`
            ]
          : [
              `positive marginal contribution for ${candidate.assetId}`,
              `fullBundleScoreUnits=${fullBundleScore.bundleShareScoreUnits.toString()}`,
              `bundleWithoutAssetScoreUnits=${bundleWithoutCandidate.bundleShareScoreUnits.toString()}`
            ],
        coveredReadEvidence: {
          failureModes: (read.failureModes || []).filter((value) => String(candidate.asset.metadata.privateContent || '').includes(value)),
          constraints: (candidate.asset.metadata.declaredConstraints || []).filter((value) => (read.constraints || []).includes(value)),
          touchedPaths: (candidate.asset.metadata.sourcePaths || []).filter((value) => (read.touchedPaths || []).includes(value))
        },
        candidateRankingScoreUnits: toFixedPointUnits(candidate.ranking.finalRankingScore)
      };
    });
    const clippingReceipts = sourceContributionEntries.map((entry) => ({
      receiptId: entry.clippingReceiptId,
      receiptKind: 'source-to-shares-clipping',
      assetId: entry.assetId,
      clipped: entry.clipped,
      contributionDisposition: entry.contributionDisposition,
      rawContributionUnits: entry.rawContributionUnits.toString(),
      clippedContributionUnits: entry.clippedContributionUnits.toString(),
      reason: entry.clipped ? 'non-positive-marginal-contribution' : 'positive-marginal-contribution',
      receiptHash: stableHashObject({
        assetId: entry.assetId,
        rawContributionUnits: entry.rawContributionUnits.toString(),
        clippedContributionUnits: entry.clippedContributionUnits.toString(),
        clipped: entry.clipped
      })
    }));
    const { normalizedShares, normalizationTrace } = normalizeContributionUnitsToBasisPoints(sourceContributionEntries);
    const rawShareByAssetId = new Map(normalizedShares.map((entry) => [entry.assetId, entry]));
    return {
      readId: read.readId,
      protocolFocus: BITCODE_PROTOCOL_FOCUS,
      conformanceProfile: PROFILE_A,
      productionIntentProfile: PROFILE_B,
      quantizedObjectiveContractId: SOURCE_TO_SHARES_FIT_QUALITY_OC_ID,
      scoreScale: SOURCE_TO_SHARES_SCALE.toString(),
      bundleShareScoreWeightsBp: {
        averageRanking: 6000,
        failureModeCoverage: 2000,
        constraintCoverage: 1000,
        touchedPathCoverage: 1000
      },
      contributionDispositionCounts: countValues(sourceContributionEntries.map((entry) => entry.contributionDisposition)),
      settlementCandidateAssetIds: settlementCandidates.map((candidate) => candidate.assetId),
      bundleShareScore: {
        bundleShareScoreUnits: fullBundleScore.bundleShareScoreUnits.toString(),
        bundleShareScore: fixedPointUnitsToString(fullBundleScore.bundleShareScoreUnits),
        componentShareScoreUnits: Object.fromEntries(
          Object.entries(fullBundleScore.componentShareScoreUnits).map(([key, value]) => [key, value.toString()])
        ),
        coveredReadEvidence: fullBundleScore.coveredReadEvidence
      },
      quantizedFitQualities,
      sourceContributionEntries: sourceContributionEntries.map((entry) => ({
        entryKind: entry.entryKind,
        assetId: entry.assetId,
        title: entry.title,
        contentRoot: entry.contentRoot,
        selectedUnitRefs: entry.selectedUnitRefs,
        fullBundleScoreUnits: entry.fullBundleScoreUnits.toString(),
        bundleWithoutAssetScoreUnits: entry.bundleWithoutAssetScoreUnits.toString(),
        rawContributionUnits: entry.rawContributionUnits.toString(),
        clippedContributionUnits: entry.clippedContributionUnits.toString(),
        clipped: entry.clipped,
        contributionDisposition: entry.contributionDisposition,
        clippingReceiptId: entry.clippingReceiptId,
        candidateRankingScoreUnits: entry.candidateRankingScoreUnits.toString(),
        marginalContributionReplay: {
          fullBundleScoreUnits: entry.fullBundleScoreUnits.toString(),
          bundleWithoutAssetScoreUnits: entry.bundleWithoutAssetScoreUnits.toString(),
          rawContributionUnits: entry.rawContributionUnits.toString(),
          clippedContributionUnits: entry.clippedContributionUnits.toString(),
          clipped: entry.clipped,
          clippingReceiptId: entry.clippingReceiptId
        },
        coveredReadEvidence: entry.coveredReadEvidence,
        reasons: entry.reasons,
        rawShareBp: rawShareByAssetId.get(entry.assetId)?.shareBp || 0,
        normalizationRemainderUnits: rawShareByAssetId.get(entry.assetId)?.normalizationRemainderUnits || '0'
      })),
      clippingReceipts,
      basisPointNormalization: normalizationTrace,
      normalizationLedger: normalizationTrace.provisionalShares || [],
      rawShares: normalizedShares,
      proofHash: stableHashObject({
        readId: read.readId,
        sourceContributionEntries: sourceContributionEntries.map((entry) => ({
          assetId: entry.assetId,
          rawContributionUnits: entry.rawContributionUnits.toString(),
          clippedContributionUnits: entry.clippedContributionUnits.toString(),
          clipped: entry.clipped,
          contributionDisposition: entry.contributionDisposition
        })),
        normalizationTrace
      })
    };
  }

  /**
   * @param {string} totalMicroUnits
   * @param {Array<{ assetId: string, settledShareBp: number }>} settledShares
   */
  function allocateExactMicroUnitsByShare(totalMicroUnits, settledShares) {
    const total = BigInt(totalMicroUnits);
    const provisional = settledShares.map((entry) => {
      const basisPoints = BigInt(entry.settledShareBp);
      const numerator = total * basisPoints;
      return {
        assetId: entry.assetId,
        settledShareBp: entry.settledShareBp,
        floorMicroUnits: numerator / MAX_BPS_BIGINT,
        microUnits: numerator / MAX_BPS_BIGINT,
        remainderUnits: numerator % MAX_BPS_BIGINT,
        extraMicroUnitsAwarded: 0n,
        tieBreakRank: 0
      };
    });
    const initiallyAllocated = provisional.reduce((sum, entry) => sum + entry.microUnits, 0n);
    let remainingUnits = total - initiallyAllocated;
    provisional.sort((left, right) => {
      if (left.remainderUnits !== right.remainderUnits) return left.remainderUnits > right.remainderUnits ? -1 : 1;
      if (left.settledShareBp !== right.settledShareBp) return right.settledShareBp - left.settledShareBp;
      return left.assetId.localeCompare(right.assetId);
    });
    const remainderDistributionOrder = provisional.map((entry) => entry.assetId);
    provisional.forEach((entry, index) => {
      entry.tieBreakRank = index + 1;
    });
    let index = 0;
    while (remainingUnits > 0n && provisional.length) {
      const provisionalEntry = provisional[index % provisional.length];
      if (!provisionalEntry) break;
      provisionalEntry.microUnits += 1n;
      provisionalEntry.extraMicroUnitsAwarded += 1n;
      remainingUnits -= 1n;
      index += 1;
    }
    const allocations = provisional
      .sort((left, right) => right.settledShareBp - left.settledShareBp || left.assetId.localeCompare(right.assetId))
      .map((entry) => ({
        assetId: entry.assetId,
        settledShareBp: entry.settledShareBp,
        microUnits: entry.microUnits.toString(),
        floorMicroUnits: entry.floorMicroUnits.toString(),
        remainderUnits: entry.remainderUnits.toString(),
        extraMicroUnitsAwarded: entry.extraMicroUnitsAwarded.toString(),
        tieBreakRank: entry.tieBreakRank
      }));
    return {
      allocations,
      allocationTrace: {
        method: 'largest-remainder',
        tieBreakPolicy: 'remainder desc, settled share desc, assetId asc',
        remainderDistributionOrder,
        allocationLedger: allocations,
        initiallyAllocatedMicroUnits: initiallyAllocated.toString(),
        totalMicroUnits: totalMicroUnits,
        finalAllocatedMicroUnits: allocations.reduce((sum, entry) => sum + BigInt(entry.microUnits), 0n).toString()
      }
    };
  }

  /**
   * @param {string} eventId
   * @param {{
   *   debits: Array<{ account: string, delta: string, reason: string, eventId: string, receiptRef: string, entryId: string, explanation: string }>,
   *   credits: Array<{ account: string, delta: string, reason: string, eventId: string, receiptRef: string, entryId: string, assetId: string, explanation: string }>,
   *   receipts?: Array<{ receiptId: string }> | undefined,
   *   beforeBalances?: Record<string, string> | undefined,
   *   afterBalances: Record<string, string>,
   *   settledShares?: Array<{ assetId: string }> | undefined
   * }} journalDiff
   */
  function buildJournalCompletenessProof(eventId, journalDiff) {
    const entries = [...journalDiff.debits, ...journalDiff.credits];
    const receiptIds = new Set((journalDiff.receipts || []).map((receipt) => receipt.receiptId));
    const recomputedBalances = Object.fromEntries(Object.entries(journalDiff.beforeBalances || {}).map(([account, value]) => [account, BigInt(value)]));
    for (const entry of entries) {
      recomputedBalances[entry.account] = (recomputedBalances[entry.account] || 0n) + BigInt(entry.delta);
    }
    const recomputedBalanceStrings = stringifyBigIntMap(recomputedBalances);
    const witnessArtifactPaths = ['.bitcode/journal-diff.json', '.bitcode/journal-completeness-proof.json'];
    const replayArtifacts = witnessArtifactPaths.slice();
    const replaySteps = [
      buildReplayStep({
        stepId: 'settlement.journal-completeness',
        theoremIds: [
          'settlement_source_to_shares.reason_coverage',
          'settlement_source_to_shares.receipt_refs_closed',
          'settlement_source_to_shares.after_balance_recompute'
        ],
        requiredArtifactPaths: witnessArtifactPaths,
        instruction: 'Replay journal reason coverage, receipt closure, and after-balance recomputation.'
      })
    ];
    const allRequiredReasonsCovered = entries.every((entry) => !!entry.reason && !!entry.explanation);
    const noUnclassifiedTransfers = entries.every((entry) => ['licensed_bundle_debit', 'contribution_credit'].includes(entry.reason));
    const eventRefsConsistent = entries.every((entry) => entry.eventId === eventId);
    const replayableJournal = stableHashObject(entries) === stableHashObject([...entries]);
    const receiptRefsClosed = entries.every((entry) => receiptIds.has(entry.receiptRef));
    const hasSingleIssuanceDebit = journalDiff.debits.length === 1;
    const creditedEntryCountMatchesAllocations = journalDiff.credits.length === (journalDiff.settledShares || []).length;
    const afterBalancesRecomputeExactly = stableHashObject(recomputedBalanceStrings) === stableHashObject(journalDiff.afterBalances);
    const creditedAssetsMatchSettledShares = stableHashObject(
      journalDiff.credits.map((entry) => entry.assetId).slice().sort()
    ) === stableHashObject((journalDiff.settledShares || []).map((entry) => entry.assetId).slice().sort());
    const theoremVerdicts = [
      buildTheoremVerdict({
        theoremId: 'settlement_source_to_shares.reason_coverage',
        passed: allRequiredReasonsCovered && noUnclassifiedTransfers && eventRefsConsistent,
        witnessArtifactPaths,
        replayArtifactPaths: replayArtifacts,
        replayStepIds: ['settlement.journal-completeness']
      }),
      buildTheoremVerdict({
        theoremId: 'settlement_source_to_shares.receipt_refs_closed',
        passed: receiptRefsClosed && hasSingleIssuanceDebit && creditedEntryCountMatchesAllocations,
        witnessArtifactPaths,
        replayArtifactPaths: replayArtifacts,
        replayStepIds: ['settlement.journal-completeness']
      }),
      buildTheoremVerdict({
        theoremId: 'settlement_source_to_shares.after_balance_recompute',
        passed: afterBalancesRecomputeExactly && creditedAssetsMatchSettledShares && replayableJournal,
        witnessArtifactPaths,
        replayArtifactPaths: replayArtifacts,
        replayStepIds: ['settlement.journal-completeness']
      })
    ];
    return {
      eventId,
      allRequiredReasonsCovered,
      noUnclassifiedTransfers,
      eventRefsConsistent,
      replayableJournal,
      receiptRefsClosed,
      hasSingleIssuanceDebit,
      creditedEntryCountMatchesAllocations,
      afterBalancesRecomputeExactly,
      creditedAssetsMatchSettledShares,
      witnessRefs: {
        receiptIds: [...receiptIds],
        debitEntryIds: journalDiff.debits.map((entry) => entry.entryId),
        creditEntryIds: journalDiff.credits.map((entry) => entry.entryId),
        settledShareAssetIds: (journalDiff.settledShares || []).map((entry) => entry.assetId)
      },
      theoremVerdicts,
      artifactBindings: [
        buildArtifactBinding({ artifactPath: '.bitcode/journal-diff.json', role: 'supporting-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId), requiredForWitness: true, requiredForReplay: true }),
        buildArtifactBinding({ artifactPath: '.bitcode/journal-completeness-proof.json', role: 'primary-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId), requiredForWitness: true, requiredForReplay: true })
      ],
      replaySteps,
      witnessArtifactPaths,
      replayArtifacts,
      replayInstructions: replaySteps.map((entry) => entry.instruction),
      allTheoremsPassed: allTheoremsPassed(theoremVerdicts),
      proofHash: stableHashObject({
        eventId,
        receiptIds: [...receiptIds],
        debitEntryIds: journalDiff.debits.map((entry) => entry.entryId),
        creditEntryIds: journalDiff.credits.map((entry) => entry.entryId),
        afterBalancesRecomputeExactly: stableHashObject(recomputedBalanceStrings) === stableHashObject(journalDiff.afterBalances)
      })
    };
  }

  /**
   * @param {{
   *   beforeRoot: string,
   *   afterRoot: string,
   *   debits: unknown[],
   *   credits: unknown[],
   *   invariants: Record<string, boolean>,
   *   afterBalances: Record<string, string>
   * }} journalDiff
   * @param {AssetPackLockShape} assetPackLock
   */
  function buildSettlementProof(journalDiff, assetPackLock) {
    const derivedAfterRoot = ledgerRoot(journalDiff.afterBalances);
    const theoremChecks = {
      rawSharesNormalized: journalDiff.invariants['rawSharesNormalized'],
      settledSharesNormalized: journalDiff.invariants['settledSharesNormalized'],
      allocationConserved: journalDiff.invariants['allocationConserved'],
      debitsEqualCredits: journalDiff.invariants['debitsEqualCredits'],
      noNegativeBalances: journalDiff.invariants['noNegativeBalances'],
      refsClosed: journalDiff.invariants['refsClosed'],
      stateRootIntegrity: journalDiff.afterRoot === derivedAfterRoot
    };
    const witnessArtifactPaths = ['.bitcode/settlement-proof.json', '.bitcode/journal-diff.json', '.bitcode/asset-pack.lock.json'];
    const replayArtifacts = witnessArtifactPaths.slice();
    const replaySteps = [
      buildReplayStep({
        stepId: 'settlement.core-theorems',
        theoremIds: Object.keys(theoremChecks).map((key) => `settlement_source_to_shares.${key}`),
        requiredArtifactPaths: witnessArtifactPaths,
        instruction: 'Replay settlement invariants, journal root integrity, and asset-pack-lock binding.'
      })
    ];
    const theoremVerdicts = Object.entries(theoremChecks).map(([theoremId, passed]) => buildTheoremVerdict({
      theoremId: `settlement_source_to_shares.${theoremId}`,
      passed: Boolean(passed),
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['settlement.core-theorems']
    }));
    return {
      theoremChecks,
      beforeRoot: journalDiff.beforeRoot,
      afterRoot: journalDiff.afterRoot,
      journalHash: stableHashObject({ debits: journalDiff.debits, credits: journalDiff.credits }),
      assetPackLockHash: stableHashObject(assetPackLock),
      theoremVerdicts,
      artifactBindings: [
        buildArtifactBinding({ artifactPath: '.bitcode/journal-diff.json', role: 'supporting-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId), requiredForWitness: true, requiredForReplay: true }),
        buildArtifactBinding({ artifactPath: '.bitcode/asset-pack.lock.json', role: 'supporting-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId), requiredForWitness: true, requiredForReplay: true }),
        buildArtifactBinding({ artifactPath: '.bitcode/settlement-proof.json', role: 'primary-proof', theoremIds: theoremVerdicts.map((entry) => entry.theoremId), requiredForWitness: true, requiredForReplay: true })
      ],
      replaySteps,
      witnessArtifactPaths,
      replayArtifacts,
      replayInstructions: replaySteps.map((entry) => entry.instruction),
      allTheoremsPassed: allTheoremsPassed(theoremVerdicts),
      proofHash: stableHashObject({
        journalHash: stableHashObject({ debits: journalDiff.debits, credits: journalDiff.credits }),
        assetPackLockHash: stableHashObject(assetPackLock),
        theoremChecks
      })
    };
  }

  /**
   * @param {{
   *   evaluatedCandidates: EvaluatedCandidate[],
   *   selectedCandidates: EvaluatedCandidate[],
   *   settlementCandidates: EvaluatedCandidate[],
   *   assetPackLock: AssetPackLockShape,
   *   sourceToSharesArtifact: {
   *     sourceContributionEntries?: Array<{
   *       assetId: string,
   *       contributionDisposition?: SourceContributionDisposition | undefined,
   *       clipped?: boolean | undefined,
   *       rawContributionUnits?: string | undefined,
   *       clippedContributionUnits?: string | undefined,
   *       clippingReceiptId?: string | undefined,
   *       rawShareBp?: number | undefined
   *     }> | undefined
   *   } | null | undefined,
   *   settledShares: Array<{ assetId: string, settledShareBp: number, rawShareBp?: number | undefined }>,
   *   allocations: Array<{ assetId: string, microUnits: string }>,
   *   branchMode: string
   * }} input
   */
  function buildSettlementParticipationArtifact({ evaluatedCandidates, selectedCandidates, settlementCandidates, assetPackLock, sourceToSharesArtifact, settledShares, allocations, branchMode }) {
    const selectedAssetIds = new Set(selectedCandidates.map((candidate) => candidate.assetId));
    const settlementParticipatingAssetIds = new Set(settlementCandidates.map((candidate) => candidate.assetId));
    const allocationByAssetId = new Map(allocations.map((allocation) => [allocation.assetId, allocation]));
    const settledShareByAssetId = new Map(settledShares.map((share) => [share.assetId, share]));
    const sourceContributionByAssetId = new Map(
      (sourceToSharesArtifact?.sourceContributionEntries || []).map((entry) => [entry.assetId, entry])
    );
    const lockedUnitsByAssetId = new Map(
      (assetPackLock?.units || []).reduce((map, unit) => {
        const units = map.get(unit.assetId) || [];
        units.push(unit.unitId);
        map.set(unit.assetId, units);
        return map;
      }, new Map())
    );
    const records = evaluatedCandidates.map((candidate) => {
      const selected = selectedAssetIds.has(candidate.assetId);
      const settlementParticipating = settlementParticipatingAssetIds.has(candidate.assetId);
      const allocation = allocationByAssetId.get(candidate.assetId);
      const share = settledShareByAssetId.get(candidate.assetId);
      const sourceContribution = sourceContributionByAssetId.get(candidate.assetId);
      const creditedMicroUnits = allocation?.microUnits || '0';
      const contributionDisposition = sourceContribution?.contributionDisposition
        || buildSourceContributionDisposition({ clipped: sourceContribution?.clipped });
      const settlementStruct = buildSettlementParticipationStruct({
        selected,
        settlementParticipating,
        creditedMicroUnits,
        contributionDisposition,
        branchMode,
        useTier: candidate.useTier
      });
      return {
        recordKind: settlementStruct.recordKind,
        assetId: candidate.assetId,
        title: candidate.asset.title,
        useTier: candidate.useTier,
        selected,
        selectionStatus: settlementStruct.selectionStatus,
        settlementParticipating,
        settlementStatus: settlementStruct.settlementStatus,
        positivelyCredited: settlementStruct.positivelyCredited,
        zeroCreditParticipating: settlementStruct.zeroCreditParticipating,
        excludedFromSettlement: settlementStruct.excludedFromSettlement,
        exclusionReason: settlementStruct.exclusionReason,
        creditDisposition: settlementStruct.creditDisposition,
        settlementDisposition: settlementStruct.settlementDisposition,
        contributionDisposition: settlementStruct.contributionDisposition,
        rawContributionMass: sourceContribution?.rawContributionUnits || '0',
        clippedContributionMass: sourceContribution?.clippedContributionUnits || '0',
        clippedMassReason: sourceContribution?.clipped ? 'non-positive-marginal-contribution' : null,
        clippingReceiptId: sourceContribution?.clippingReceiptId || null,
        rawShareBp: share?.rawShareBp || sourceContribution?.rawShareBp || 0,
        settledShareBp: share?.settledShareBp || 0,
        creditedMicroUnits,
        selectedUnitRefs: lockedUnitsByAssetId.get(candidate.assetId) || [],
        contentRoot: candidate.asset.contentRoot
      };
    });
    return {
      conformanceProfile: PROFILE_A,
      productionIntentProfile: PROFILE_B,
      branchMode,
      selectedAssetCount: records.filter((record) => record.selected).length,
      settlementParticipatingCount: records.filter((record) => record.settlementParticipating).length,
      positivelyCreditedCount: records.filter((record) => record.positivelyCredited).length,
      zeroCreditParticipatingCount: records.filter((record) => record.zeroCreditParticipating).length,
      excludedFromSettlementCount: records.filter((record) => record.excludedFromSettlement).length,
      recordCountsByDisposition: {
        selectionStatus: countValues(records.map((record) => record.selectionStatus)),
        settlementStatus: countValues(records.map((record) => record.settlementStatus)),
        creditDisposition: countValues(records.map((record) => record.creditDisposition)),
        contributionDisposition: countValues(records.map((record) => record.contributionDisposition)),
        settlementDisposition: countValues(records.map((record) => record.settlementDisposition))
      },
      records,
      proofHash: stableHashObject(records)
    };
  }

  /**
   * @param {SettlementState} state
   * @param {{
   *   buyer: BuyerShape,
   *   read: ReadShape,
   *   assetPack: AssetPackShape,
   *   assetPackLock: AssetPackLockShape,
   *   evaluatedCandidates: EvaluatedCandidate[],
   *   selectedCandidates: EvaluatedCandidate[],
   *   branchName: string,
   *   branchMode: string
   * }} input
   */
  function settleReadEvent(state, { buyer, read, assetPack, assetPackLock, evaluatedCandidates, selectedCandidates, branchName, branchMode }) {
    const settlementCandidates = selectedCandidates.filter((candidate) => candidate.useTier === 'settlement-eligible');
    if (!settlementCandidates.length) {
      throw new Error('No settlement-eligible assets available for Bitcode settlement.');
    }

    const sourceToSharesArtifact = buildSourceToSharesArtifact(read, settlementCandidates);
    const rawShares = sourceToSharesArtifact.rawShares.map((entry) => ({
      assetId: entry.assetId,
      shareBp: entry.shareBp,
      reasons: entry.reasons,
      rawContributionUnits: entry.rawContributionUnits,
      clippedContributionUnits: entry.clippedContributionUnits
    }));
    const settledShares = rawShares.map((item) => ({
      assetId: item.assetId,
      rawShareBp: item.shareBp,
      settledShareBp: item.shareBp,
      settlementAdjustmentReasons: []
    }));

    const { allocations, allocationTrace } = allocateExactMicroUnitsByShare(METERED_MICRO_UNITS, settledShares);
    const beforeBalances = Object.fromEntries(Object.entries(state.ledger.accounts).map(([key, value]) => [key, BigInt(value)]));
    const buyerAccount = `buyer:${buyer.buyerId}:license_pool`;
    const total = BigInt(METERED_MICRO_UNITS);
    if ((beforeBalances[buyerAccount] || 0n) < total) {
      throw new Error('Buyer license pool is insufficient for the fixed metered event.');
    }

    const eventId = `event_${sha256(`${read.readId}:${assetPack.assetPackId}:${branchName}`).slice(0, 12)}`;
    const bundleId = `bundle_${sha256(`${read.readId}:${assetPack.assetPackId}:${branchMode}`).slice(0, 12)}`;
    const issuanceReceiptId = `receipt_${sha256(`${bundleId}:issuance`).slice(0, 12)}`;
    const allocationReceiptId = `receipt_${sha256(`${bundleId}:allocation`).slice(0, 12)}`;
    const fitQualityReceiptId = `receipt_${sha256(`${bundleId}:fit-quality`).slice(0, 12)}`;
    const fitQualityReceiptPayload = {
      assetPackId: assetPack.assetPackId,
      sourceToSharesRef: sourceToSharesArtifact.proofHash,
      quantizedObjectiveContractId: SOURCE_TO_SHARES_FIT_QUALITY_OC_ID,
      quantizedFitQualities: sourceToSharesArtifact.quantizedFitQualities
    };
    const receipts = [
      {
        receiptId: issuanceReceiptId,
        receiptKind: 'issuance',
        bundleId,
        readId: read.readId,
        assetPackId: assetPack.assetPackId,
        protocolFocus: BITCODE_PROTOCOL_FOCUS,
        presentStage: PRESENT_FIT_FOR_SETTLEMENT_REVIEW_STAGE,
        sourceToSharesRef: sourceToSharesArtifact.proofHash,
        quantizedObjectiveContractId: SOURCE_TO_SHARES_FIT_QUALITY_OC_ID,
        quantizedFitQualities: sourceToSharesArtifact.quantizedFitQualities,
        meteredMicroUnits: METERED_MICRO_UNITS,
        receiptHash: stableHashObject({ bundleId, readId: read.readId, kind: 'issuance', ...fitQualityReceiptPayload })
      },
      {
        receiptId: allocationReceiptId,
        receiptKind: 'allocation',
        bundleId,
        readId: read.readId,
        assetPackId: assetPack.assetPackId,
        protocolFocus: BITCODE_PROTOCOL_FOCUS,
        presentStage: PRESENT_FIT_FOR_SETTLEMENT_REVIEW_STAGE,
        sourceToSharesRef: sourceToSharesArtifact.proofHash,
        quantizedObjectiveContractId: SOURCE_TO_SHARES_FIT_QUALITY_OC_ID,
        quantizedFitQualities: sourceToSharesArtifact.quantizedFitQualities,
        allocations,
        receiptHash: stableHashObject({ bundleId, readId: read.readId, kind: 'allocation', allocations, ...fitQualityReceiptPayload })
      },
      {
        receiptId: fitQualityReceiptId,
        receiptKind: 'settlement-asset-pack-fit-quality',
        bundleId,
        readId: read.readId,
        assetPackId: assetPack.assetPackId,
        protocolFocus: BITCODE_PROTOCOL_FOCUS,
        presentStage: PRESENT_FIT_FOR_SETTLEMENT_REVIEW_STAGE,
        settlementCandidateAssetIds: settlementCandidates.map((candidate) => candidate.assetId),
        ...fitQualityReceiptPayload,
        receiptHash: stableHashObject({ bundleId, readId: read.readId, kind: 'settlement-asset-pack-fit-quality', ...fitQualityReceiptPayload })
      }
    ];

    const debits = [{
      entryId: `jnl_${sha256(`${eventId}:debit`).slice(0, 12)}`,
      account: buyerAccount,
      delta: (-total).toString(),
      reason: 'licensed_bundle_debit',
      eventId,
      bundleId,
      readId: read.readId,
      receiptRef: issuanceReceiptId,
      explanation: 'Debit buyer license pool for licensed Bitcode remediation branch settlement.'
    }];

    const credits = allocations.map((allocation) => ({
      entryId: `jnl_${sha256(`${eventId}:${allocation.assetId}`).slice(0, 12)}`,
      account: `supplier:${allocation.assetId}:pending_claims`,
      delta: allocation.microUnits,
      reason: 'contribution_credit',
      eventId,
      bundleId,
      readId: read.readId,
      assetId: allocation.assetId,
      unitRefs: assetPackLock.units.filter((unit) => unit.assetId === allocation.assetId).map((unit) => unit.unitId),
      receiptRef: allocationReceiptId,
      explanation: 'Credit asset-scoped pending claims according to deterministic settled shares.'
    }));

    const afterBalances = { ...beforeBalances };
    afterBalances[buyerAccount] = (afterBalances[buyerAccount] || 0n) - total;
    for (const credit of credits) {
      afterBalances[credit.account] = (afterBalances[credit.account] || 0n) + BigInt(credit.delta);
    }

    const beforeRoot = ledgerRoot(stringifyBigIntMap(beforeBalances));
    const afterRoot = ledgerRoot(stringifyBigIntMap(afterBalances));
    const debited = total;
    const credited = credits.reduce((sum, entry) => sum + BigInt(entry.delta), 0n);
    const creditedAssetIds = allocations.filter((allocation) => allocation.microUnits !== '0').map((allocation) => allocation.assetId);
    const zeroCreditAssetIds = allocations.filter((allocation) => allocation.microUnits === '0').map((allocation) => allocation.assetId);
    const allocationByAssetId = new Map(allocations.map((allocation) => [allocation.assetId, allocation]));
    const settledShareByAssetId = new Map(settledShares.map((item) => [item.assetId, item]));
    const lockedAssetIds = new Set(assetPackLock.assets.map((asset) => asset.assetId));
    const lockedUnitIds = new Set(assetPackLock.units.map((unit) => `${unit.assetId}:${unit.unitId}`));
    const receiptIds = new Set(receipts.map((receipt) => receipt.receiptId));
    const journalDiff = {
      eventId,
      readId: read.readId,
      bundleId,
      beforeRoot,
      afterRoot,
      debits,
      credits,
      beforeBalances: stringifyBigIntMap(beforeBalances),
      afterBalances: stringifyBigIntMap(afterBalances),
      rawShares,
      settledShares,
      receipts,
      invariants: {
        debitsEqualCredits: debited === credited,
        allocationConserved: credited === total,
        noNegativeBalances: Object.values(afterBalances).every((value) => value >= 0n),
        rawSharesNormalized: rawShares.reduce((sum, item) => sum + item.shareBp, 0) === MAX_BPS,
        settledSharesNormalized: settledShares.reduce((sum, item) => sum + item.settledShareBp, 0) === MAX_BPS,
        receiptChainValid: debits.every((entry) => receiptIds.has(entry.receiptRef)) && credits.every((entry) => receiptIds.has(entry.receiptRef)),
        refsClosed: credits.every((entry) =>
          entry.assetId &&
          lockedAssetIds.has(entry.assetId) &&
          entry.unitRefs.every((unitId) => lockedUnitIds.has(`${entry.assetId}:${unitId}`))
        ),
        settledEqualsRaw: settledShares.every((item) => item.rawShareBp === item.settledShareBp)
      },
      totals: {
        debited: debited.toString(),
        credited: credited.toString(),
        difference: (debited - credited).toString()
      }
    };
    const settlementParticipationArtifact = buildSettlementParticipationArtifact({
      evaluatedCandidates,
      selectedCandidates,
      settlementCandidates,
      assetPackLock,
      sourceToSharesArtifact,
      settledShares,
      allocations,
      branchMode
    });
    const accountingPrecisionReport = buildAccountingPrecisionReport({
      read,
      assetPack,
      branchMode,
      sourceToSharesArtifact,
      settlementParticipationArtifact,
      allocationTrace,
      journalDiff
    });

    const settlementPreview = {
      readId: read.readId,
      bundleId,
      branchMode,
      protocolFocus: BITCODE_PROTOCOL_FOCUS,
      reviewStage: PRESENT_FIT_FOR_SETTLEMENT_REVIEW_STAGE,
      conformanceProfile: PROFILE_A,
      productionIntentProfile: PROFILE_B,
      selectedAssetIds: selectedCandidates.map((candidate) => candidate.assetId),
      rawShares,
      settledShares,
      quantizedObjectiveContractId: SOURCE_TO_SHARES_FIT_QUALITY_OC_ID,
      quantizedFitQualities: sourceToSharesArtifact.quantizedFitQualities,
      presentFitForSettlementReview: {
        stageId: PRESENT_FIT_FOR_SETTLEMENT_REVIEW_STAGE,
        protocolFocus: BITCODE_PROTOCOL_FOCUS,
        objectiveContractId: SOURCE_TO_SHARES_FIT_QUALITY_OC_ID,
        sourceToSharesRef: sourceToSharesArtifact.proofHash,
        assetPackId: assetPack.assetPackId,
        settlementCandidateAssetIds: settlementCandidates.map((candidate) => candidate.assetId),
        fitQualities: sourceToSharesArtifact.quantizedFitQualities,
        receiptRefs: [issuanceReceiptId, allocationReceiptId, fitQualityReceiptId]
      },
      meteredMicroUnits: METERED_MICRO_UNITS,
      settlementParticipatingAssetIds: settlementCandidates.map((candidate) => candidate.assetId),
      creditedAssetIds,
      zeroCreditAssetIds,
      allocations: settlementCandidates.map((candidate) => {
        const share = settledShareByAssetId.get(candidate.assetId);
        const allocation = allocationByAssetId.get(candidate.assetId);
        const zeroCredit = allocation?.microUnits === '0';
        return {
          assetId: candidate.assetId,
          title: candidate.asset.title,
          useTier: candidate.useTier,
          rawShareBp: share?.rawShareBp ?? 0,
          settledShareBp: share?.settledShareBp ?? 0,
          creditedMicroUnits: allocation?.microUnits || '0',
          rationale: zeroCredit
            ? [
                'Selected into the branch and permitted for settlement participation.',
                'Credited 0 units because its marginal bundle contribution was non-positive after evaluating the full selected settlement bundle.',
                ...((share?.settlementAdjustmentReasons || []).filter(Boolean)),
                ...((rawShares.find((item) => item.assetId === candidate.assetId)?.reasons || []).filter(Boolean))
              ]
            : [
                'Selected into the branch and credited by deterministic settled shares.',
                ...((share?.settlementAdjustmentReasons || []).filter(Boolean)),
                ...((rawShares.find((item) => item.assetId === candidate.assetId)?.reasons || []).filter(Boolean))
              ]
        };
      }),
      semanticsNote: 'Selected branch assets, settlement participants, and credited settlement assets are intentionally distinct sets. A selected settlement-eligible asset can receive zero credited units when its marginal bundle contribution is non-positive.',
      assetPackLockHash: stableHashObject(assetPackLock),
      sourceToSharesRef: sourceToSharesArtifact.proofHash,
      settlementParticipationRef: settlementParticipationArtifact.proofHash,
      receipts
    };

    return {
      eventId,
      bundleId,
      branchName,
      branchMode,
      issuanceReceiptId,
      allocationReceiptId,
      sourceToSharesArtifact,
      settlementParticipationArtifact,
      accountingPrecisionReport,
      journalDiff,
      settlementPreview,
      nextLedgerAccounts: stringifyBigIntMap(afterBalances)
    };
  }

  return {
    buildSourceToSharesArtifact,
    buildJournalCompletenessProof,
    buildSettlementProof,
    buildSettlementParticipationArtifact,
    settleReadEvent
  };
}
