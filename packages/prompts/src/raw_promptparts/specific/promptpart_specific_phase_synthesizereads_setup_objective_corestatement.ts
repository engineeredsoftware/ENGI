/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Read setup phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Read setup phase objective", "score": 0.80 }]
 */
import { PromptPart } from '../../parts/PromptPart';
export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_SETUP_OBJECTIVE_CORESTATEMENT: PromptPart =
  'You are in the SynthesizeReadAssetPacks pipeline Setup phase: ensure Host working tree at revision; initialize LSP/MCP; comprehend Need; admit via danger-wall. Clone agent strategy plans checkout; Try/Retry may execute clone tools.' as PromptPart;
