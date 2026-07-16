import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_TRY_HEADER_HEADER } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_documentprocessor_try_header_header';
import { PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_TRY_EXECUTIONFOCUS_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_documentprocessor_try_executionfocus_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_SYSTEM_INSTRUCTIONS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_documentprocessor_system_instructions';
import { PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_TOOLS_LIST } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_documentprocessor_tools_list';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';




/**
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "TRY step prompt for Document Processor agent"
 * current_version: "V26.50.0"
 * versions: ["2.0.0", "1.0.0"]
 * benchmarks: [
 *   { "name": "execution_clarity", "test": "Does the prompt enable clear document processing execution? Rate 0-1", "score": 0.89 },
 *   { "name": "tool_utilization", "test": "Are document processing tools effectively utilized? Rate 0-1", "score": 0.91 },
 *   { "name": "processing_thoroughness", "test": "Is document processing comprehensive? Rate 0-1", "score": 0.90 }
 * ]
 */
export const DOCUMENT_PROCESSOR_TRY_PROMPT = new Prompt()
  .set('header', PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_TRY_HEADER_HEADER)
  .set('instructions', PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_SYSTEM_INSTRUCTIONS)
  .set('tools', PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_TOOLS_LIST)
  .set('execution_focus', PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_TRY_EXECUTIONFOCUS_DETAILCONTENT)
  .set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER)
  .set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA)
  .set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY)
  .set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON)
  .set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE)
  .set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT)
  .set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT);
