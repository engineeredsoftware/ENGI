/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Read setup roster"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Read setup roster", "score": 0.80 }]
 */
import { PromptPart } from '../../parts/PromptPart';
export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_SETUP_ROSTER_DETAILCONTENT: PromptPart =
  'Read Setup roster (typical): clone-vcs → parallel {initialize-lsp, initialize-mcps-tools, comprehend-needs} → danger-wall.' as PromptPart;
