/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "SDIVF Setup phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "SDIVF Setup phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_SETUP_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Setup prepares the Host working tree, initializes measurement/tool surfaces, comprehends steering (Need or Obfuscations), and admits the run via danger-wall before Discovery.',
);
