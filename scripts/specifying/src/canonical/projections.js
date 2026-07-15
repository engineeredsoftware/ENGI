// @ts-check

/**
 * @typedef {import('./type-contracts.js').ProjectionPolicyShape} ProjectionPolicyShape
 */

import crypto from 'node:crypto';
import { PROFILE_A, PROFILE_B } from '../realization-profile.js';

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
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(/** @type {Record<string, unknown>} */ (value)[key])}`).join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableHashObject(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {{ artifactClasses?: Array<{ path: string, sensitiveDataClass: string, disclosable: boolean }> | undefined } | null | undefined} policyRelease
 * @param {{ files?: Record<string, unknown> | undefined } | null | undefined} branchArtifacts
 * @param {string} defaultPrincipal
 * @returns {ProjectionPolicyShape}
 */
export function buildProjectionPolicy(policyRelease, branchArtifacts, defaultPrincipal) {
  const artifactRules = (policyRelease?.artifactClasses || []).map((entry) => ({
    path: entry.path,
    sensitiveDataClass: entry.sensitiveDataClass,
    disclosable: entry.disclosable
  }));
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    defaultPrincipal,
    principals: {
      public: {
        allowPrivateArtifacts: false,
        allowSourceMaterial: false,
        allowRawBranchFiles: false,
        visibleSensitiveDataClasses: ['bounded-public-proof-metadata']
      },
      buyer: {
        allowPrivateArtifacts: true,
        allowSourceMaterial: false,
        allowRawBranchFiles: false,
        visibleSensitiveDataClasses: ['bounded-public-proof-metadata', 'private-branch-derived-artifact', 'verification-evidence', 'settlement-preview', 'private-proof-artifact']
      },
      reviewer: {
        allowPrivateArtifacts: true,
        allowSourceMaterial: false,
        allowRawBranchFiles: false,
        visibleSensitiveDataClasses: ['bounded-public-proof-metadata', 'verification-evidence', 'private-proof-artifact']
      },
      internal: {
        allowPrivateArtifacts: true,
        allowSourceMaterial: true,
        allowRawBranchFiles: true,
        visibleSensitiveDataClasses: ['bounded-public-proof-metadata', 'repo-private-source', 'licensed-source-material', 'private-branch-derived-artifact', 'verification-evidence', 'settlement-preview', 'private-proof-artifact']
      }
    },
    artifactRules,
    privateArtifactPaths: artifactRules.filter((entry) => !entry.disclosable).map((entry) => entry.path),
    publicArtifactPaths: artifactRules.filter((entry) => entry.disclosable).map((entry) => entry.path),
    materializedBranchFileCount: Object.keys(branchArtifacts?.files || {}).length
  };
}

/**
 * @param {{
 *   read: { readId: string },
 *   assetPack: { selectedAssets: string[] },
 *   settlement: {
 *     bundleId: string,
 *     journalDiff: { invariants: unknown },
 *     sourceToSharesArtifact?: { sourceContributionEntries?: unknown[], basisPointNormalization?: { method?: string | undefined } | undefined } | null,
 *     settlementParticipationArtifact?: { zeroCreditParticipatingCount?: number | undefined } | null
 *   },
 *   proofContract: { contractId: string, evidenceChain: Array<{ stage: string, artifactRefs: unknown[] }> },
 *   branchName: string,
 *   promptCompletenessProof: { checkedPromptCount: number, allContractsComplete: boolean },
 *   staticMeasurementReport: { receiptCount: number, allReceiptRefsResolve: boolean }
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildBoundedPublicProofArtifact({ read, assetPack, settlement, proofContract, branchName, promptCompletenessProof, staticMeasurementReport }) {
  return {
    readId: read.readId,
    bundleId: settlement.bundleId,
    branchName,
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    selectedAssetIds: assetPack.selectedAssets,
    selectedAssetCount: assetPack.selectedAssets.length,
    invariantSummary: settlement.journalDiff.invariants,
    proofContractRef: proofContract.contractId,
    evidenceChain: proofContract.evidenceChain.map((entry) => ({ stage: entry.stage, artifactRefs: entry.artifactRefs })),
    promptCompletenessSummary: {
      checkedPromptCount: promptCompletenessProof.checkedPromptCount,
      allContractsComplete: promptCompletenessProof.allContractsComplete
    },
    staticMeasurementSummary: {
      receiptCount: staticMeasurementReport.receiptCount,
      allReceiptRefsResolve: staticMeasurementReport.allReceiptRefsResolve
    },
    sourceToSharesSummary: {
      sourceContributionCount: settlement.sourceToSharesArtifact?.sourceContributionEntries?.length || 0,
      zeroCreditParticipatingCount: settlement.settlementParticipationArtifact?.zeroCreditParticipatingCount || 0,
      normalizationMethod: settlement.sourceToSharesArtifact?.basisPointNormalization?.method || 'largest-remainder'
    },
    redactionStatus: 'bounded-public-proof-metadata-only'
  };
}

/**
 * @param {{
 *   policyRelease: { artifactClasses?: Array<{ path: string, disclosable: boolean }> | undefined } | null | undefined,
 *   branchArtifacts: { files?: Record<string, unknown> | undefined } | null | undefined,
 *   projectionPolicy: ProjectionPolicyShape,
 *   boundedPublicProof: unknown
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildRedactionProof({ policyRelease, branchArtifacts, projectionPolicy, boundedPublicProof }) {
  const artifactRules = policyRelease?.artifactClasses || [];
  const redactedArtifactPaths = artifactRules.filter((entry) => !entry.disclosable).map((entry) => entry.path);
  const sourceMaterialPaths = Object.keys(branchArtifacts?.files || {}).filter((path) => path.startsWith('.bitcode/source-material/'));
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    defaultPrincipal: projectionPolicy.defaultPrincipal,
    redactedArtifactPaths,
    redactedSourceMaterialPaths: sourceMaterialPaths,
    redactedLatestRunFields: ['canonicalRunEvidence', 'branchArtifacts.files', 'selectedSourceMaterialManifest', 'authorizationDecisions', 'sensitiveDataFlowRecords', 'identityBindings', 'journalDiff', 'systemProofBundle'],
    publicArtifactPaths: projectionPolicy.publicArtifactPaths,
    boundedPublicProofHash: stableHashObject(boundedPublicProof)
  };
}

/**
 * @param {{
 *   policyRelease: { artifactClasses?: Array<{ path: string, sensitiveDataClass: string, disclosable: boolean }> | undefined } | null | undefined,
 *   projectionPolicy: ProjectionPolicyShape,
 *   boundedPublicProof: unknown
 * }} input
 * @returns {Record<string, unknown>}
 */
export function buildDisclosureProof({ policyRelease, projectionPolicy, boundedPublicProof }) {
  const artifactRules = policyRelease?.artifactClasses || [];
  return {
    conformanceProfile: PROFILE_A,
    productionIntentProfile: PROFILE_B,
    allowedPublicArtifactPaths: artifactRules.filter((entry) => entry.disclosable).map((entry) => entry.path),
    deniedPublicArtifactPaths: artifactRules.filter((entry) => !entry.disclosable).map((entry) => entry.path),
    projectionPolicyRef: stableHashObject(projectionPolicy),
    boundedPublicProofHash: stableHashObject(boundedPublicProof),
    publicDisclosureOnlyUsesBoundedMetadata: artifactRules
      .filter((entry) => entry.disclosable)
      .every((entry) => entry.sensitiveDataClass === 'bounded-public-proof-metadata')
  };
}
