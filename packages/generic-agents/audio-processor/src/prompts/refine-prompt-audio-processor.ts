import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_REFINE_ENHANCEMENT_APPROACH } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_refine_enhancement_approach';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_REFINE_QUALITY_CRITERIA } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_refine_quality_criteria';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PURPOSE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_purpose_corestatement';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';
/**
 * Audio Processor Agent - Refine Step Prompt
 * 
 * Refinement phase for enhancing audio quality and analysis accuracy.
 * 
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "REFINE step prompt for Audio Processor agent"
 * current_version: "V26.50.0"
 * versions: [
 *   { "version": "1.0.0", "score": 0.90, "reason": "Initial implementation with correct Prompt class pattern" }
 * ]
 * benchmarks: [
 *   { "name": "refinement_quality", "test": "Does the prompt enable effective audio refinement?", "score": 0.44 },
 *   { "name": "accuracy_improvement", "test": "Are audio analysis results improved through refinement?", "score": 0.45 },
 *   { "name": "completeness_enhancement", "test": "Is audio processing completeness enhanced?", "score": 0.45 }
 * ]
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_REFINE_PHASE_HEADER } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_audioprocessor_refine_phase_header';





export const AUDIO_PROCESSOR_REFINE_PROMPT = new Prompt()
  .set('phase', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_REFINE_PHASE_HEADER)
  .set('purpose', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PURPOSE_CORESTATEMENT)
  .set('enhancement', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_REFINE_ENHANCEMENT_APPROACH)
  .set('quality', PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_REFINE_QUALITY_CRITERIA)
  .set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER)
  .set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA)
  .set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON)
  .set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE)
  .set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT)
  .set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT);
