/**
 * Primitive Execution system Prompt — only layer on pure Execution.
 *
 * Call-site law: this Prompt is folded into the **pipeline** node composed
 * Prompt once (Execution ⊕ Pipeline ⊕ base ⊕ product). Child nodes must not
 * re-apply it.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_GENERIC_EXECUTION_SYSTEM_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_execution_system_identity_corestatement';
import { PROMPTPART_GENERIC_EXECUTION_SYSTEM_CONTRACT_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_execution_system_contract_detailcontent';

export const PRIMITIVE_EXECUTION_SYSTEM_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('identity', PROMPTPART_GENERIC_EXECUTION_SYSTEM_IDENTITY_CORESTATEMENT);
  p.set('contract', PROMPTPART_GENERIC_EXECUTION_SYSTEM_CONTRACT_DETAILCONTENT);
  return p;
})();
