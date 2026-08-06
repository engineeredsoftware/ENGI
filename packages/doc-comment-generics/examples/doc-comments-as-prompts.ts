/**
 * DOC-COMMENTS AS PROMPTS: Complete Example
 * 
 * This file demonstrates how doc-comments ARE prompts in the Bitcode system.
 * Every doc-comment here becomes part of the prompt intelligence.
 *
 * V26 note:
 * This file is preserved as reference-only example material for non-Bitcode reform analysis.
 * It does not by itself define admitted live Bitcode runtime behavior.
 */

import { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { Prompt } from '@bitcode/prompts/prompt';
import { hierarchicalFormatter } from '@bitcode/prompts/formatters';

// ============================================================================
// LEVEL 1: Basic PromptPart with Doc-Comment
// ============================================================================

/**
 * @doc-promptpart
 * version: 1.0.0
 * category: base_system_identity
 * priority: critical
 * frequency: every_call
 * usage: Core AI identity for all Bitcode operations
 * 
 * This doc-comment IS the metadata for this PromptPart.
 * At build time, it gets injected into the prototype.
 */
export const BITCODE_IDENTITY_PROMPT: PromptPart = `
You are Bitcode, an advanced AI engineering system designed to transform ideas into production-ready code.

Core Principles:
- Excellence in every line of code
- Zero-defect mindset
- Continuous improvement through PTRR methodology
- Collaborative intelligence with humans
`;

/**
 * @doc-promptpart
 * version: 1.0.0
 * category: operational_guidelines
 * priority: high
 * usage: PTRR methodology explanation
 */
export const PGRI_METHODOLOGY_PROMPT: PromptPart = `
You follow the PTRR methodology:
- PLAN: Thoroughly analyze requirements and design approach
- GENERATE: Create initial implementation with best practices
- REFINE: Iterate based on feedback and testing
- INTENSIFY: Optimize for production excellence
`;

// ============================================================================
// LEVEL 2: Doc-Prompt Types with Intelligence
// ============================================================================

/**
 * @doc-prompt-agent
 * role: TypeScript Code Generation Specialist
 * mission: Generate production-ready TypeScript code
 * capabilities: ["ast-manipulation", "type-inference", "pattern-recognition"]
 * pgri_methodology: Full PTRR cycle with emphasis on type safety
 * pgri_plan: Analyze type requirements and existing patterns
 * pgri_generate: Create strongly-typed implementations
 * pgri_refine: Ensure type safety and eliminate any types
 * pgri_intensify: Optimize for compile-time performance
 * 
 * THIS DOC-COMMENT IS THE AGENT'S CONFIGURATION PROMPT!
 */
export interface TypeScriptGenerationAgent {
  generate(spec: CodeSpec): Promise<GeneratedCode>;
  refine(code: GeneratedCode, feedback: Feedback): Promise<GeneratedCode>;
}

/**
 * @doc-prompt-pipeline
 * mission: Transform expressed Reads into AssetPack evidence and requested Shippables
 * phases: setup, discovery, implementation, validation, finish
 * coordination: Parallel discovery with sequential implementation
 * intelligence: ["read-measurement", "assetpack-synthesis", "finish-delivery-evidence"]
 * phase_prompts: {
 *   "setup": "Normalize source, Read, and delivery-mechanism context",
 *   "discovery": "Measure the Read and gather source-grounded evidence",
 *   "implementation": "Synthesize Read-satisfaction AssetPack artifacts with PTRR methodology",
 *   "validation": "Validate AssetPack evidence against the Definition of Read",
 *   "finish": "Store AssetPack evidence and deliver requested Shippables"
 * }
 */
export interface AssetPackPipeline {
  name: 'asset-pack';
  execute(requirements: Requirements): Promise<DeliveredShippable>;
}

/**
 * @doc-prompt-tool
 * purpose: Analyze TypeScript code for patterns and improvements
 * capabilities: ["ast-analysis", "pattern-detection", "optimization-suggestions"]
 * parameters: |
 *   - code: The TypeScript code to analyze
 *   - depth: Analysis depth (shallow | deep | exhaustive)
 *   - focus: Specific areas to focus on
 * output: Detailed analysis with actionable recommendations
 * prompt_template: |
 *   Analyze the following TypeScript code:
 *   
 *   ```typescript
 *   {{code}}
 *   ```
 *   
 *   Analysis Parameters:
 *   - Depth: {{depth}}
 *   - Focus Areas: {{focus}}
 *   
 *   Provide:
 *   1. Pattern identification
 *   2. Type safety assessment
 *   3. Performance considerations
 *   4. Improvement recommendations
 */
export class TypeScriptAnalyzerTool {
  analyze(params: AnalysisParams): AnalysisResult {
    // The doc-comment above IS the tool's prompt template!
    const toolPrompt = this.constructor.prototype.docPrompt;
    
    // Tool implementation uses its own doc-prompt
    const filledPrompt = toolPrompt.fillTemplate({
      code: params.code,
      depth: params.depth,
      focus: params.focus.join(', ')
    });
    
    // This would call the LLM with the filled prompt
    return performAnalysis(filledPrompt);
  }
}

// ============================================================================
// LEVEL 3: SIENT-Generated Doc-Comments as Prompts
// ============================================================================

// Original function before SIENT analysis:
// export function processUserData(data: UserData): ProcessedData { ... }

/**
 * @doc-sient-generated
 * pattern: data-transformation-pipeline
 * complexity: moderate
 * intelligence: ["validation", "transformation", "error-handling"]
 * bottlenecks: ["validation-overhead", "memory-allocation"]
 * prompt: |
 *   This function implements a data transformation pipeline.
 *   
 *   Key considerations when modifying:
 *   1. Maintain validation integrity - all inputs must be validated
 *   2. Preserve error handling patterns for graceful failures
 *   3. Consider streaming for large datasets
 *   4. Type transformations must maintain runtime safety
 *   
 *   Optimization opportunities:
 *   - Implement validation caching for repeated data
 *   - Use object pooling for transformation results
 *   - Consider parallel processing for independent fields
 * 
 * @doc-sient-performance
 * measured: { "p50": 12, "p95": 45, "p99": 89 }
 * scaling: linear with data size
 * memory: O(n) where n is number of fields
 */
export function processUserData(data: UserData): ProcessedData {
  // SIENT's doc-comments guide future AI modifications!
  
  // Validation phase
  const validated = validateUserData(data);
  
  // Transformation phase
  const transformed = transformFields(validated);
  
  // Post-processing
  return finalizeData(transformed);
}

// ============================================================================
// LEVEL 4: Composing Doc-Comments into System Prompts
// ============================================================================

/**
 * This function shows how doc-comments compose into complete system prompts
 */
export function createAgentSystemPrompt(
  agentType: 'typescript' | 'react' | 'node'
): Prompt {
  // Get the agent's doc-prompt based on type
  const agentClass = getAgentClass(agentType);
  const agentDocPrompt = agentClass.prototype.docPrompt;
  
  // Compose the complete system prompt
  const prompt = new Prompt();
  prompt.set('identity', BITCODE_IDENTITY_PROMPT);
  prompt.set('agent', agentDocPrompt as unknown as PromptPart);
  prompt.set('methodology', PGRI_METHODOLOGY_PROMPT);
  prompt.set('domain', getDomainPrompt(agentType));
  prompt.set('quality', QUALITY_STANDARDS_PROMPT);
  return prompt;
}

/**
 * Example of using composed prompts in LLM calls
 */
export async function executeAgentTask(
  agent: TypeScriptGenerationAgent,
  task: Task
): Promise<Result> {
  // Get and format the agent's system prompt
  const systemPrompt = createAgentSystemPrompt('typescript');
  const systemPromptString = systemPrompt.format(hierarchicalFormatter);
  
  // Execute with LLM
  const response = await llm.generate({
    system: systemPromptString,
    messages: [
      {
        role: 'user',
        content: `Task: ${task.description}\nRequirements: ${task.requirements}`
      }
    ]
  });
  
  return processResponse(response);
}

// ============================================================================
// LEVEL 5: Multi-Level Doc-Comment Stacking
// ============================================================================

/**
 * @doc-prompt-agent
 * role: Full-Stack Development Specialist
 * mission: Build complete features from frontend to backend
 * 
 * @doc-promptpart
 * version: 2.0.0
 * category: agent_definition
 * priority: critical
 * 
 * @doc-sient-team
 * size: 8
 * expertise: ["React", "Node.js", "PostgreSQL", "TypeScript"]
 * culture: "Move fast with stable infrastructure"
 * 
 * @doc-field-fintech
 * constraints: ["PCI-compliance", "SOX-compliance", "data-encryption"]
 * patterns: ["audit-logging", "transaction-integrity", "rate-limiting"]
 * 
 * ALL THESE DOC-COMMENTS ARE PROMPTS!
 * They stack to create layered technical context.
 */
export class FullStackAgent {
  async buildFeature(spec: FeatureSpec): Promise<Feature> {
    // This agent has access to ALL the doc-comment prompts above
    const agentIntelligence = this.constructor.prototype;
    
    // Access different layers of prompts
    const agentPrompt = agentIntelligence.docPromptAgent;
    const promptPartMeta = agentIntelligence.docPromptPart;
    const teamKnowledge = agentIntelligence.docSientTeam;
    const domainConstraints = agentIntelligence.docFieldFintech;
    
    // Compose them all into a comprehensive prompt
    const fullPrompt = composeMultiLayerPrompts({
      agent: agentPrompt,
      metadata: promptPartMeta,
      team: teamKnowledge,
      domain: domainConstraints
    });
    
    // Execute with full intelligence
    return executeWithPrompt(fullPrompt, spec);
  }
}

// ============================================================================
// HELPER TYPES (These would normally be imported)
// ============================================================================

interface CodeSpec {
  description: string;
  requirements: string[];
  constraints: string[];
}

interface GeneratedCode {
  code: string;
  language: string;
  tests?: string;
}

interface Feedback {
  issues: string[];
  suggestions: string[];
}

interface Requirements {
  functional: string[];
  nonFunctional: string[];
}

interface DeliveredShippable {
  name: string;
  version: string;
  artifacts: string[];
}

interface UserData {
  [key: string]: unknown;
}

interface ProcessedData {
  [key: string]: unknown;
}

interface AnalysisParams {
  code: string;
  depth: 'shallow' | 'deep' | 'exhaustive';
  focus: string[];
}

interface AnalysisResult {
  patterns: string[];
  issues: string[];
  recommendations: string[];
}

interface Task {
  description: string;
  requirements: string;
}

interface Result {
  success: boolean;
  output: any;
}

interface FeatureSpec {
  name: string;
  requirements: Requirements;
}

interface Feature {
  name: string;
  implementation: any;
}

// ============================================================================
// MOCK IMPLEMENTATIONS (For demonstration)
// ============================================================================

declare const llm: any;
declare const QUALITY_STANDARDS_PROMPT: PromptPart;

function getAgentClass(type: string): any {
  // Would return actual agent class
  return TypeScriptGenerationAgent;
}

function getDomainPrompt(domain: string): PromptPart {
  // Would return domain-specific prompt
  return `Domain knowledge for ${domain}`;
}

// Former composePrompt removed: Prompt#format provides output.

function processResponse(response: any): Result {
  // Would process LLM response
  return { success: true, output: response };
}

function performAnalysis(prompt: string): AnalysisResult {
  // Would perform actual analysis
  return {
    patterns: [],
    issues: [],
    recommendations: []
  };
}

function validateUserData(data: UserData): UserData {
  return data;
}

function transformFields(data: UserData): UserData {
  return data;
}

function finalizeData(data: UserData): ProcessedData {
  return data as ProcessedData;
}

function composeMultiLayerPrompts(layers: any): string {
  // Would compose all layers
  return JSON.stringify(layers);
}

function executeWithPrompt(prompt: string, spec: any): Promise<Feature> {
  // Would execute with prompt
  return Promise.resolve({ name: spec.name, implementation: {} });
}

/**
 * SUMMARY: Doc-Comments ARE Prompts
 * 
 * This file demonstrates the complete hierarchy:
 * 
 * 1. PromptParts with @doc-promptpart metadata
 * 2. Doc-prompt types (@doc-prompt-agent, @doc-prompt-pipeline, etc.)
 * 3. SIENT-generated doc-comments that are prompts
 * 4. Composition of doc-prompts into system prompts
 * 5. Multi-layer doc-comment stacking
 * 
 * Every doc-comment in this file IS a prompt that participates
 * in the intelligence of the system. They are not documentation
 * ABOUT prompts - they ARE the prompts.
 * 
 * This is the revolution: Comments become code. Documentation
 * becomes intelligence. Types gain explicit runtime context through their
 * doc-comments.
 */
