/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "SDIVF Setup phase stores"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "SDIVF Setup phase stores", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_SETUP_STORES_DETAILCONTENT: PromptPart = createPromptPart(
  'Typical stores: repository workspacePath, setup admission, LSP/MCP readiness, input comprehension artifacts.',
);
