/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Deposit setup roster"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Deposit setup roster", "score": 0.80 }]
 */
import { PromptPart } from '../../parts/PromptPart';
export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_SETUP_ROSTER_DETAILCONTENT: PromptPart =
  'Deposit Setup roster (typical): clone-vcs → parallel {initialize-lsp, initialize-mcps-tools, comprehend-obfuscations} → danger-wall.' as PromptPart;
