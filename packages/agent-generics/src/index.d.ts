/**
 * AGENT-GENERICS - Retained agent orchestration primitives
 *
 * Agents are Executors that sequence retained PTRR-style steps.
 * This package survives as reusable orchestration infrastructure and as a
 * reference surface for Bitcode-native pipelines; it is not itself proof that
 * the old agent families remain live Bitcode canon.
 *
 * Different agent implementations are selected from registries dynamically.
 * Each step runs 3 failsafe parents sequentially, each running 3 generation children.
 * Tools execute AFTER all failsafes complete (conditional on reasoning + judgment output).
 *
 * Key Abstractions:
 * - Agent: Executor that sequences PTRR steps
 * - Step: StepExecutor that sequences 7 SubSteps
 * - SubStep: The atomic operations (3 failsafes + 3 generation + 1 tool)
 *
 * @doc-package
 * version: 1.0.0
 * pattern: ptrr-orchestration
 * philosophy: "Retained orchestration families remain reusable, but Bitcode decides which ones are admitted as live product behavior"
 */
export { AgentVariationStep, FailsafeMetaSubStep, GenerationSubMetaSubStep } from './types';
export type { Agent, AgentStep, AgentGeneration, QuickAgent, StepExecutor, PreparedContext, Chunk, Reasoning, UseTool, Judgment, UsedTool } from './types';
export { factoryAgent, factoryAgentWithPTRR, factoryAgentWithSingleStep, factoryQuickAgent } from './agents/factories';
export { factoryAgentWithGenerations, factoryAgentWithPTRRGenerations } from './agents/factories';
export type { BitcodePTRRFactoryConfig, BitcodePTRRPromptCarrier, BitcodePTRRPromptValue, BitcodePTRRStepName, BitcodePTRRStepPromptCarrier, BitcodePTRRStepPromptRegistry } from './agents/factories';
export { factoryMeasureAgent, MeasurementReadingSchema, MeasureAgentOutputSchema } from './agents/measure-agent';
export type { MeasureAgent, MeasureAgentConfig, MeasureAgentOutput, MeasurementCategory, MeasurementReading, MeasurementSpec } from './agents/measure-agent';
export { factoryMeasureAgentAbsolutes } from './agents/measure-agent-absolutes';
export type { MeasureAgentAbsolutesConfig } from './agents/measure-agent-absolutes';
export { factoryPlanStep, factoryTryStep, factoryRefineStep, factoryRetryStep, factoryStep } from './steps/factories';
export { factoryPlanGeneration, factoryTryGeneration, factoryRefineGeneration, factoryRetryGeneration, factoryGeneration, createFailsafedGenerationSequence, createFailsafedThinkingsGeneration, createFailsafedGeneration } from './generations/factories';
export { createThinkingsGeneration } from './steps/thinkings-generation';
export { createFailsafeGenerationSequence, createContextfulFailsafedThinkingsGeneration } from './steps/failsafe-sequence';
export { factoryPrepareConciseContext, factoryChunkThenSum, factoryStitchUntilComplete, PCC_KEY_SELECTION_SCHEMA, type PrepareConciseContextSelectionInput } from './substeps/factories';
export { factoryReason, factoryJudge, factoryStructuredOutput, factoryToolsExecution, factoryValidation } from './substeps/factories';
export { factoryAgentFailsafeSubStepExecution, factoryAgentGenerationSubStepExecution, factoryAgentToolSubStepExecution } from './substeps/factories';
export { AgentExecution, createAgentExecution, StepExecution, SubStepExecution, factoryStepExecution, factorySubStepExecution, AgentPromptsRegistry, AgentToolsRegistry, AgentLLMsRegistry, AgentAgentsRegistry, ExecutionTool } from './execution';
export type { ExecutionAgent } from './execution';
export { AgentPrompt } from './prompts/AgentPrompt';
export type { AgentPromptConfig } from './prompts/AgentPrompt';
export { AgentStepPrompt } from './prompts/AgentStepPrompt';
export type { AgentStepPromptConfig } from './prompts/AgentStepPrompt';
export { collectExecutionTrace, collectAgentTrace } from './diagnostics/trace';
export { streamFileChangesAfterStep, withFileDiffStreaming } from './execution/file-diff-integration';
export { normalizeStepName } from './phaseHelpers/normalizeStepName';
