/**
 * Bitcode canonical JSDoc typedefs.
 *
 * These do not yet replace a full TypeScript migration, but they deposit the
 * codebase a stronger typed vocabulary and a clearer target for later
 * discriminated-union / enum-backed hardening.
 */

/**
 * @typedef {import('./enums.js').RealizationProfile[keyof import('./enums.js').RealizationProfile]} RealizationProfileValue
 * @typedef {import('./enums.js').ExecutionReality[keyof import('./enums.js').ExecutionReality]} ExecutionRealityValue
 * @typedef {import('./enums.js').NormalizationPressure[keyof import('./enums.js').NormalizationPressure]} NormalizationPressureValue
 */

/**
 * @typedef {Object} DepositingSurface
 * @property {string} depositSessionId
 * @property {string} depositProfile
 * @property {string} repoSupplyRef
 * @property {string[]} selectedInventoryRefs
 * @property {Record<string, number>} selectedArtifactKindCounts
 * @property {Record<string, number>} selectedOriginKindCounts
 * @property {string | null} addressingRoot
 * @property {string | null} signingRoot
 * @property {string | null} authRoot
 * @property {string} depositIntentSummary
 */

/**
 * @typedef {Object} ReadingSurface
 * @property {string} readId
 * @property {RealizationProfileValue} realizationProfile
 * @property {string} parserKind
 * @property {string} taskSummary
 * @property {string[]} failureModeSummary
 * @property {string[]} targetArtifactKinds
 * @property {string} boundednessSummary
 * @property {string[]} closureCriteria
 */

/**
 * @typedef {Object} DepositingToReadingSurface
 * @property {string} relationId
 * @property {string} depositSessionId
 * @property {string} readId
 * @property {string} fitSummary
 * @property {string[]} decisiveKinds
 * @property {string[]} overlapKinds
 * @property {NormalizationPressureValue} normalizationPressure
 * @property {string} branchIntentSummary
 * @property {string} proofIntentSummary
 * @property {string} settlementIntentSummary
 */

/**
 * @typedef {Object} HostCapabilityRequirement
 * @property {string} capabilityId
 * @property {string} capabilityFamily
 * @property {ExecutionRealityValue} executionReality
 * @property {string[]} requiredPrograms
 * @property {string[]} supportingPrograms
 * @property {string[]} telemetrySurfaces
 * @property {string[]} safetyNotes
 */

/**
 * @typedef {Object} CanonicalTypeNote
 * @property {string} typeId
 * @property {string} layer
 * @property {string} purpose
 * @property {string[]} invariants
 */
