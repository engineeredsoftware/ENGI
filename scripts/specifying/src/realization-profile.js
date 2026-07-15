// @ts-check

/**
 * @typedef {import('./canonical/type-contracts.js').RealizationProfileId} RealizationProfileId
 * @typedef {import('./canonical/type-contracts.js').RealizationProfileDefinition} RealizationProfileDefinition
 * @typedef {import('./canonical/type-contracts.js').BuiltRealizationProfile} BuiltRealizationProfile
 * @typedef {import('./canonical/type-contracts.js').RealizationProfileSubject} RealizationProfileSubject
 */

export const PROFILE_A = 'Profile A — targeted deposit / bounded read';
export const PROFILE_B = 'Profile B — normalization deposit / composite read';

export const REALIZATION_PROFILE_KIND = 'realization-profile';
/** @type {Readonly<{ TARGETED: RealizationProfileId, NORMALIZATION: RealizationProfileId }>} */
export const REALIZATION_PROFILE_IDS = Object.freeze({
  TARGETED: 'A',
  NORMALIZATION: 'B'
});

const PROFILE_B_SCENARIO_FAMILIES = new Set([
  'polyglot-repo-benchmark-remediation',
  'many-asset-settlement-normalization'
]);

const profileDefinitions = /** @type {Record<RealizationProfileId, RealizationProfileDefinition>} */ ({
  [REALIZATION_PROFILE_IDS.TARGETED]: Object.freeze({
    profileId: REALIZATION_PROFILE_IDS.TARGETED,
    label: PROFILE_A,
    shortLabel: 'Targeted deposit',
    identity: Object.freeze({
      whoItIs: 'Deposit a small, decisive set of repo-authenticated artifacts against a sharply bounded benchmark read.',
      operatorRole: 'Use this when Bitcode should close one tight remediation read with minimal normalization overhead.',
      audienceMeaning: 'The demo is proving decisive selection, narrow proof closure, and fast settlement explanation.'
    }),
    depositMode: 'Deposit one or a few decisive repo-authenticated artifacts so the asset pack can stay tight.',
    readMode: 'Read is sharply bounded by a narrow benchmark slice with a short list of failure modes and clear closure criteria.',
    assetPackShape: 'Tight pack with minimal normalization and quick branch closure.',
    settlementShape: 'Positive settlement entries concentrate on the decisive assets; zero-credit participants should be rare and explicit.',
    scenarioFamilies: Object.freeze([
      'monorepo-auth-rollback',
      'proof-heavy-rust-validator',
      'config-policy-incident',
      'unsafe-patch-review',
      'infra-deployment-mismatch',
      'privacy-boundary-stress'
    ]),
    composition: Object.freeze([
      'repo-authenticated targeted deposit',
      'bounded benchmark read measurement',
      'tight asset-pack selection',
      'short proof closure',
      'direct settlement explanation'
    ]),
    boundaryRealityNote: 'Live GitHub, signer verification, and networked settlement still remain explicit external hand-offs elsewhere.'
  }),
  [REALIZATION_PROFILE_IDS.NORMALIZATION]: Object.freeze({
    profileId: REALIZATION_PROFILE_IDS.NORMALIZATION,
    label: PROFILE_B,
    shortLabel: 'Normalization deposit',
    identity: Object.freeze({
      whoItIs: 'Deposit several overlapping artifacts so Bitcode can normalize coverage, provenance, and contribution across a composite read.',
      operatorRole: 'Use this when Bitcode must reconcile multiple slices, artifact kinds, or runtime surfaces before settlement is intelligible.',
      audienceMeaning: 'The demo is proving normalization, overlap handling, and source-to-shares closure rather than a single decisive pick.'
    }),
    depositMode: 'Deposit multiple overlapping artifacts across kinds so Bitcode can normalize contribution and provenance.',
    readMode: 'Read stays composite across several failing slices, weak dimensions, or cross-language/runtime boundaries.',
    assetPackShape: 'Broader pack where normalization, tie-break rules, and overlap accounting matter.',
    settlementShape: 'Settlement makes source-to-shares normalization visible and may keep zero-credit participants explicit.',
    scenarioFamilies: Object.freeze([
      'polyglot-repo-benchmark-remediation',
      'many-asset-settlement-normalization'
    ]),
    composition: Object.freeze([
      'repo-authenticated normalization deposit',
      'composite benchmark read measurement',
      'broader asset-pack normalization',
      'heavier proof burden',
      'source-to-shares settlement explanation'
    ]),
    boundaryRealityNote: 'Live GitHub and network hand-offs are still explicit boundary contracts, but they are not the reason this profile exists.'
  })
});
const PROFILE_DEFINITIONS = Object.freeze(profileDefinitions);

/**
 * @param {RealizationProfileDefinition} profile
 * @returns {BuiltRealizationProfile}
 */
function cloneRealizationProfile(profile) {
  return {
    profileKind: REALIZATION_PROFILE_KIND,
    profileDiscriminant: `${REALIZATION_PROFILE_KIND}:${profile.profileId}`,
    ...profile,
    identity: { ...profile.identity },
    scenarioFamilies: [...profile.scenarioFamilies],
    composition: [...profile.composition]
  };
}

/**
 * @param {RealizationProfileSubject} [subject={}]
 * @returns {RealizationProfileId}
 */
export function resolveRealizationProfileId(subject = {}) {
  if (typeof subject === 'string' && subject.trim()) {
    const normalized = subject.trim().toUpperCase();
    return normalized === REALIZATION_PROFILE_IDS.NORMALIZATION
      ? REALIZATION_PROFILE_IDS.NORMALIZATION
      : REALIZATION_PROFILE_IDS.TARGETED;
  }

  const resolvedSubject = typeof subject === 'string' ? {} : subject;
  const explicitProfileId = typeof resolvedSubject.realizationProfileId === 'string'
    ? resolvedSubject.realizationProfileId.trim().toUpperCase()
    : '';
  if (explicitProfileId === REALIZATION_PROFILE_IDS.NORMALIZATION) {
    return REALIZATION_PROFILE_IDS.NORMALIZATION;
  }
  if (explicitProfileId === REALIZATION_PROFILE_IDS.TARGETED) {
    return REALIZATION_PROFILE_IDS.TARGETED;
  }
  return PROFILE_B_SCENARIO_FAMILIES.has(resolvedSubject.scenarioFamily || '')
    ? REALIZATION_PROFILE_IDS.NORMALIZATION
    : REALIZATION_PROFILE_IDS.TARGETED;
}

/**
 * @param {RealizationProfileSubject} [subject=REALIZATION_PROFILE_IDS.TARGETED]
 * @returns {BuiltRealizationProfile}
 */
export function buildRealizationProfile(subject = REALIZATION_PROFILE_IDS.TARGETED) {
  const profileId = resolveRealizationProfileId(subject);
  const profile = profileId === REALIZATION_PROFILE_IDS.NORMALIZATION
    ? PROFILE_DEFINITIONS[REALIZATION_PROFILE_IDS.NORMALIZATION]
    : PROFILE_DEFINITIONS[REALIZATION_PROFILE_IDS.TARGETED];
  return cloneRealizationProfile(profile);
}
