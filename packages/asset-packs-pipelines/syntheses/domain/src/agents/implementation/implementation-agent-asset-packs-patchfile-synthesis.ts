/**
 * Compat shim: former "patchfile-synthesis" is now the **patch-plan** agent.
 * Formal patchfile artifact write is deposit-implementation-agent-asset-packs-patchfile.
 */

export {
  default,
  DepositImplementationAgentAssetPacksPatchPlan,
  DepositImplementationAgentAssetPacksPatchPlan as DepositImplementationAgentAssetPacksPatchfileSynthesis,
  DEPOSIT_OPTION_KINDS,
  depositCandidateSchema,
  depositCandidateSetSchema,
  depositPatchSchema,
} from './implementation-agent-asset-packs-patch-plan';

export type { DepositSynthesisOptions } from './implementation-agent-asset-packs-patch-plan';
