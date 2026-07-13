/**
 * AssetPack Pipeline Phases
 *
 * Deposit and read synthesis are SEPARATE specific pipelines (no lens/mode).
 * Prefer importing depositPhases / readPhases from the product packages.
 * This barrel re-exports both for shared tooling and BC.
 */

export {
  depositPhases,
  depositSetupPhase,
  depositDiscoveryPhase,
  depositImplementationPhase,
  depositValidationPhase,
  depositFinishPhase,
} from './deposit-phases';

export {
  readPhases,
  readSetupPhase,
  readDiscoveryPhase,
  readImplementationPhase,
  readValidationPhase,
  readFinishPhase,
} from './read-phases';

/** @deprecated Prefer depositPhases or readPhases — no unified lensed roster. */
export { depositPhases as assetPackPhases } from './deposit-phases';
