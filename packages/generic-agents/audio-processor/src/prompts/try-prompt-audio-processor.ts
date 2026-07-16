import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_TRY_DIRECTIVES_INSTRUCTIONS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_try_execution_instructions';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_TRY_PROCESSING_STRATEGY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_try_processing_strategy';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_TOOLS_LIST } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_tools_list';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';
/**
 * Audio Processor Agent - Try Step Prompt
 * 
 * Execution phase for audio analysis, DSP operations, and spectral processing.
 * 
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "TRY step prompt for Audio Processor agent"
 * current_version: "V26.50.0"
 * versions: [
 *   { "version": "1.0.0", "score": 0.90, "reason": "Initial implementation with correct Prompt class pattern" }
 * ]
 * benchmarks: [
 *   { "name": "execution_clarity", "test": "Does the prompt enable clear audio processing execution?", "score": 0.45 },
 *   { "name": "tool_utilization", "test": "Are audio processing tools effectively utilized?", "score": 0.46 },
 *   { "name": "processing_thoroughness", "test": "Is audio analysis comprehensive?", "score": 0.45 }
 * ]
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_TRY_PHASE_HEADER } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_try_phase_header';





export const AUDIO_PROCESSOR_TRY_PROMPT = new Prompt()
  .set('phase', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_TRY_PHASE_HEADER)
  .set('instructions', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_TRY_DIRECTIVES_INSTRUCTIONS)
  .set('strategy', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_TRY_PROCESSING_STRATEGY)
  .set('tools', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_TOOLS_LIST)
  .set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER)
  .set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA)
  .set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY)
  .set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON)
  .set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE)
  .set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT)
  .set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT);
