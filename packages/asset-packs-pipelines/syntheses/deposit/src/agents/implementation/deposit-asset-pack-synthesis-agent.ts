/**
 * Compat shim — prefer named Implementation agents:
 *
 *   1. deposit-implementation-agent-asset-packs-patch-plan
 *   2. deposit-implementation-agent-asset-packs-patchfile
 *   3. deposit-implementation-agent-asset-packs-measurements-synthesis
 *   4. deposit-implementation-agent-asset-packs-commercial-nl
 */

export {
  default,
  DepositImplementationAgentAssetPacksPatchPlan,
  DEPOSIT_OPTION_KINDS,
  depositCandidateSchema,
  depositCandidateSetSchema,
  depositPatchSchema,
} from './deposit-implementation-agent-asset-packs-patch-plan';

export type { DepositSynthesisOptions } from './deposit-implementation-agent-asset-packs-patch-plan';

/** @deprecated Use DepositImplementationAgentAssetPacksPatchPlan. */
export { DepositImplementationAgentAssetPacksPatchPlan as DepositAssetPackSynthesisAgent } from './deposit-implementation-agent-asset-packs-patch-plan';

/** @deprecated Use DepositImplementationAgentAssetPacksPatchPlan. */
export { DepositImplementationAgentAssetPacksPatchPlan as DepositImplementationAgentAssetPacksPatchfileSynthesis } from './deposit-implementation-agent-asset-packs-patch-plan';
