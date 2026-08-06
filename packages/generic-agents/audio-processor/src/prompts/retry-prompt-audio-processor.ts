import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_RETRY_DEEPENING_STRATEGY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_retry_deepening_strategy';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_RETRY_INSIGHT_EXTRACTION } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_retry_insight_extraction';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_SYSTEM_CONTEXT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_system_context';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_EXECUTIONPATTERN_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_executionpattern_detailcontent';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';
/**
 * Audio Processor Agent - Retry Step Prompt
 * 
 * Recovery phase for audio processing failures and enhanced analysis strategies.
 * 
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "RETRY step prompt for Audio Processor agent"
 * current_version: "V26.50.0"
 * versions: [
 *   { "version": "1.0.0", "score": 0.90, "reason": "Initial implementation with correct Prompt class pattern" }
 * ]
 * benchmarks: [
 *   { "name": "retry_effectiveness", "test": "Does the prompt enable effective audio retry strategies?", "score": 0.44 },
 *   { "name": "failure_analysis", "test": "Are audio processing failures properly analyzed?", "score": 0.45 },
 *   { "name": "recovery_strategy", "test": "Is audio processing recovery strategy clear?", "score": 0.44 }
 * ]
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_RETRY_PHASE_HEADER } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_retry_phase_header';






export const AUDIO_PROCESSOR_RETRY_PROMPT = new Prompt()
  .set('phase', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_RETRY_PHASE_HEADER)
  .set('context', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_SYSTEM_CONTEXT)
  .set('execution_pattern', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_EXECUTIONPATTERN_DETAILCONTENT)
  .set('deepening', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_RETRY_DEEPENING_STRATEGY)
  .set('insights', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_RETRY_INSIGHT_EXTRACTION)
  .set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER)
  .set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA)
  .set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY)
  .set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON)
  .set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE)
  .set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT)
  .set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT);
