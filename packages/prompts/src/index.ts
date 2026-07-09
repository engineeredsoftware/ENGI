/**
 * BITCODE PROMPTS PACKAGE - CANONICAL INFERENCE PROMPT INFRASTRUCTURE
 *
 * This package provides the public prompt primitives for Bitcode inference.
 * It remains the foundational prompt system for Bitcode:
 * - PromptPart: Branded string type for audited prompt fragments
 * - Prompt: Registry-backed prompt composition for agents, tools, phases, and pipelines
 * - PromptExecution: Execution-bound prompt registry carrier
 * - Formatters: Pure transforms from prompt registries to model-ready strings
 *
 * version: 1.0.0
 * pattern: registry-composition
 * philosophy: "Prompts are the language through which intelligence flows"
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Canonical root exports for public primitives only
 * 2. Narrow promptpart imports for raw prompt assets unless a curated root re-export exists
 * 3. Registry Pattern - Prompts compose through hierarchical registries
 * 4. Type Safety - PromptPart prevents string pollution
 * 5. Pure Functions - All formatters are pure transformations
 */

// ==================== CORE TYPES ====================
export type { PromptPart } from './parts/PromptPart';
export {
  createPromptPart,
  isPromptPart,
  EMPTY_PROMPT_PART
} from './parts/PromptPart';

// ==================== PROMPT REGISTRY ====================
export {
  Prompt,
  createPrompt
} from './prompt';
export {
  PromptExecution,
  createPromptExecution
} from './execution/PromptExecution';

// ==================== FORMATTERS ====================
export {
  hierarchicalFormatter
} from './formatters';

// ==================== COMPOSITIONS ====================
// Note: Compositions will be added when implemented
// export * from './compositions';

// Type exports
export type { PromptFormatter } from './prompt';

// ==================== DOCUMENTATION ====================
/**
 * USAGE GUIDELINES:
 *
 * 1. For public primitives, import from the package root:
 *    import { Prompt, createPromptPart, hierarchicalFormatter } from '@bitcode/prompts';
 *
 * 2. For raw PromptParts, prefer narrow subpath imports or an existing curated root re-export:
 *    import { PROMPTPART_NAME } from '@bitcode/prompts/raw_promptparts/specific/...';
 *
 * 3. For prompt composition:
 *    const prompt = new Prompt();
 *    prompt.set('identity', createPromptPart('You are Bitcode.'));
 *
 * 4. For prompt-aware executions:
 *    const execution = new PromptExecution('bitcode/run');
 *    execution.prompts.set('system:identity', createPromptPart('You are Bitcode.'));
 *
 * 5. For formatting:
 *    const formatted = prompt.format(hierarchicalFormatter);
 *
 * RAW PROMPT ORGANIZATION:
 * - /raw_promptparts/generic/: base, reusable, and Registry-inheritable PromptPart layers
 * - /raw_promptparts/specific/: concrete implementations of PromptPart types for Bitcode
 *   tools, agents, phases, pipelines, products, proof corridors, and support overlays
 *
 * `Prompt` extends `RegistryImpl<PromptPart>`. Generic PromptParts provide the
 * base layers; specific PromptParts specialize those layers at concrete registry
 * paths. A Bitcode prompt implementation is complete only when that generic to
 * specific Registry composition is visible in source, tests, or generated proof.
 *
 * Each raw prompt file contains a single PromptPart with doc-promptpart metadata.
 * The raw catalog is large; import only the PromptParts needed by the active run.
 *
 * PUBLIC BOUNDARY RULE:
 * - Active inference packages must import PromptPart, Prompt, PromptExecution,
 *   and shared formatters from `@bitcode/prompts`, not by reaching into
 *   `packages/prompts/src/*` internals.
 */

// ==================== DOC-COMMENT PLUGINS ====================
// Doc-comment plugins are intentionally not exported in runtime API surface
// to minimize dependencies during rendering and runtime.

// Note: Additional doc-comment types are intentionally not exported to keep API minimal

// ==================== END OF PUBLIC API ====================
// 
// WHAT'S NOT EXPORTED AND WHY:
// 
// 1. Most raw prompt files are not individually enumerated here to avoid bloat
// 2. Internal utilities - Implementation details
// 3. Doc-comment types - Use primitives/prompt-doc directly
// 4. Experimental features - Not ready for public use
// 
// This focused API surface ensures:
// - Fast builds (no massive re-export chains)
// - Clear dependencies (explicit imports)
// - Type safety (no accidental string usage)
// - Tree shaking (only import what you use)

// ==================== SELECTED PROMPTPART BARREL ====================
// This is a curated support surface, not the default import style.
// Prefer narrow raw_promptparts subpath imports for non-root PromptPart assets.

// Generic PTRR objectives
export { PROMPTPART_GENERIC_PTRR_PLAN_OBJECTIVE } from './raw_promptparts/generic/promptpart_generic_ptrr_plan_objective';
export { PROMPTPART_GENERIC_PTRR_TRY_OBJECTIVE } from './raw_promptparts/generic/promptpart_generic_ptrr_try_objective';
export { PROMPTPART_GENERIC_PTRR_REFINE_OBJECTIVE } from './raw_promptparts/generic/promptpart_generic_ptrr_refine_objective';
export { PROMPTPART_GENERIC_PTRR_RETRY_OBJECTIVE } from './raw_promptparts/generic/promptpart_generic_ptrr_retry_objective';

// Generic formatting parts
export { PROMPTPART_GENERIC_FORMATTING_GIVENTHEFOLLOWING } from './raw_promptparts/generic/promptpart_generic_formatting_giventhefollowing';
export { PROMPTPART_GENERIC_FORMATTING_EXECUTETHE_FOLLOWING } from './raw_promptparts/generic/promptpart_generic_formatting_executethe_following';
export { PROMPTPART_GENERIC_FORMATTING_BASEDONTHE } from './raw_promptparts/generic/promptpart_generic_formatting_basedonthe';
export { PROMPTPART_GENERIC_FORMATTING_AFTERENCOUNTERING } from './raw_promptparts/generic/promptpart_generic_formatting_afterencountering';
export { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from './raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
export { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from './raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
export { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from './raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
export { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from './raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
export { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from './raw_promptparts/generic/promptpart_generic_agent_generation_reason';
export { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from './raw_promptparts/generic/promptpart_generic_agent_generation_judge';
export { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from './raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';

// Specific: ApplyFile agent
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_SYSTEM_IDENTITY } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_system_identity';
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_SYSTEM_ROLE } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_system_role';
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_SYSTEM_INSTRUCTIONS } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_system_instructions';
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_PLAN_STRATEGY } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_plan_strategy';
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_PLAN_ANALYSIS } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_plan_analysis';
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_TRY_DIRECTIVES } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_try_directives';
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_REFINE_OPTIMIZATION } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_refine_optimization';
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_REFINE_ASSESSMENT } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_refine_assessment';
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_RETRY_STRATEGY } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_retry_strategy';
export { PROMPTPART_SPECIFIC_AGENT_APPLYFILE_RETRY_ERRORHANDLING } from './raw_promptparts/specific/promptpart_specific_agent_applyfile_retry_errorhandling';

// AssetPack Tool PromptParts (Repository Setup additions)
export { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PIPELINE } from './raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_metadata_pipeline';
export { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PHASE_SETUP } from './raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_metadata_phase_setup';
export { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_PURPOSE_ADDENDUM } from './raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_purpose_addendum';
export { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_CAPABILITIES_ADDENDUM } from './raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_capabilities_addendum';

// AssetPack Agent PromptParts (Clone VCS Repository)
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_IDENTITY } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_identity';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_PURPOSE } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_purpose';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_CONSTRAINTS } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_constraints';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_LABEL } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_plan_label';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_DETAILS } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_plan_details';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_LABEL } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_try_label';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_DETAILS } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_try_details';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_LABEL } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_refine_label';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_DETAILS } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_refine_details';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_LABEL } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_retry_label';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_DETAILS } from './raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_retry_details';

// AssetPack Agent PromptParts (Comprehend Read primary)
export { PROMPTPART_SPECIFIC_AGENT_COMPREHENDATTACHMENTS_PLAN_STRATEGY } from './raw_promptparts/specific/promptpart_specific_agent_comprehendattachments_plan_strategy';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPCOMPREHENDREAD_IDENTITY_DEFINITION } from './raw_promptparts/specific/promptpart_specific_agent_assetpacksetupcomprehendread_identity_definition';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPCOMPREHENDREAD_PTRRPLAN_PURPOSE } from './raw_promptparts/specific/promptpart_specific_agent_assetpacksetupcomprehendread_ptrrplan_purpose';
export { PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPCOMPREHENDREAD_PLAN_MODALITY_IMAGE_STRATEGY } from './raw_promptparts/specific/promptpart_specific_agent_assetpacksetupcomprehendread_plan_modality_image_strategy';

// Hoist all PromptParts to root for monorepo consumers
// Raw promptparts re-exports removed. Import PromptParts via deep paths:
//   @bitcode/prompts/raw_promptparts/generic/<file>
//   @bitcode/prompts/raw_promptparts/specific/<file>
