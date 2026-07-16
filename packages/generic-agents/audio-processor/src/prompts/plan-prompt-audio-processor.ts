import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PLAN_INSTRUCTIONS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_plan_instructions';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PLAN_ANALYSIS_APPROACH } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_plan_analysis_approach';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PLAN_OUTPUT_FORMAT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_plan_output_format';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';
/**\n * @doc-comment-developing-promptdevelopment\n * domain: agent\n * intent: "(fill intent)"\n * current_version: "V26.50.0"\n * dependencies: { }\n * benchmarks: [\n *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.46 },\n *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.46 }\n * ]\n */
/**
 * Audio Processor Agent - Plan Step Prompt
 * 
 * Strategic planning for audio processing operations including transcription,
 * analysis, and insight extraction from audio content.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PLAN_PHASE_HEADER } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_plan_phase_header';





export const AUDIO_PROCESSOR_PLAN_PROMPT = new Prompt()
  .set('phase', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PLAN_PHASE_HEADER)
  .set('instructions', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PLAN_INSTRUCTIONS)
  .set('analysis_approach', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PLAN_ANALYSIS_APPROACH)
  .set('output_format', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PLAN_OUTPUT_FORMAT)
  .set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER)
  .set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA)
  .set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON)
  .set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE)
  .set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT)
  .set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT);
