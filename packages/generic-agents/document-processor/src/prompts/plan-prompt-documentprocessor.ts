import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_PURPOSE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_documentprocessor_purpose_corestatement';
import { PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_CAPABILITIES_LIST } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_documentprocessor_capabilities_list';
import { PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_PLAN_PHASE_HEADER } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_documentprocessor_plan_phase_header';
import { PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_PLAN_STRATEGY_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_documentprocessor_plan_strategy_detailcontent';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';




/**
 * Document Processor Agent - Plan Step Prompt
 * 
 * Strategic planning for document analysis and processing.
 * 
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "PLAN step prompt for Document Processor agent"
 * current_version: "V26.50.0"
 * versions: [
 *   { "version": "3.0.0", "score": 0.90, "reason": "Migrated to correct Prompt class pattern" },
 *   { "version": "2.0.0", "score": 0.50, "reason": "Used wrong PromptPart concatenation pattern" },
 *   { "version": "1.0.0", "score": 0.40, "reason": "Initial implementation" }
 * ]
 * benchmarks: [
 *   { "name": "planning_clarity", "test": "Does the prompt enable clear document processing planning?", "score": 0.46 },
 *   { "name": "analysis_depth", "test": "Is document analysis approach well-defined?", "score": 0.46 },
 *   { "name": "processing_scope", "test": "Can document processing scope be effectively determined?", "score": 0.45 }
 * ]
 */

export const DOCUMENT_PROCESSOR_PLAN_PROMPT = new Prompt()
  .set('phase', PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_PLAN_PHASE_HEADER)
  .set('purpose', PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_PURPOSE_CORESTATEMENT)
  .set('capabilities', PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_CAPABILITIES_LIST)
  .set('strategy', PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_PLAN_STRATEGY_DETAILCONTENT)
  .set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER)
  .set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA)
  .set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON)
  .set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE)
  .set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT)
  .set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT);
