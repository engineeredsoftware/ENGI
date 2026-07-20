/**
 * Compatibility shim — prefer the split Implementation agents:
 *
 *   1. deposit-implementation-agent-asset-packs-patchfile-synthesis
 *   2. deposit-implementation-agent-asset-packs-measurements-synthesis
 */

export {
  default,
  DepositImplementationAgentAssetPacksPatchfileSynthesis,
  DEPOSIT_OPTION_KINDS,
  depositCandidateSchema,
  depositCandidateSetSchema,
  depositPatchSchema,
} from './deposit-implementation-agent-asset-packs-patchfile-synthesis';

export type { DepositSynthesisOptions } from './deposit-implementation-agent-asset-packs-patchfile-synthesis';

/** @deprecated Use DepositImplementationAgentAssetPacksPatchfileSynthesis. */
export { DepositImplementationAgentAssetPacksPatchfileSynthesis as DepositAssetPackSynthesisAgent } from './deposit-implementation-agent-asset-packs-patchfile-synthesis';
