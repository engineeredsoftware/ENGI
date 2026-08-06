

import { 
   
  factoryPTRRAgent,
  factoryAgentWithSingleStep
} from '@bitcode/agent-generics';
import { AgentPrompt, AgentStepPrompt } from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { log } from '@bitcode/logger';

// ==================== SCHEMAS ====================

/**
 * Input schema for short-circuit analysis
 */
const ShortCircuitInputSchema = z.object({
  accumulatedContext: z.any().describe('Accumulated pipeline execution context'),
  currentPhase: z.string().describe('Current pipeline phase'),
  iterationCount: z.number().describe('Number of iterations completed'),
  maxIterations: z.number().default(3).describe('Maximum allowed iterations'),
  errorHistory: z.array(z.string()).describe('History of errors encountered'),
  blockers: z.array(z.string()).describe('Known blocking issues'),
  taskComplexity: z.enum(['simple', 'medium', 'complex', 'extreme']).describe('Task complexity level')
});

/**
 * Plan step output schema
 */
const ReadyToShortCircuitAgentPlanStepOutput = z.object({
  contextAnalysis: z.string().describe('Analysis of accumulated context'),
  identifiedIssues: z.array(z.string()).describe('List of identified issues'),
  blockingIssues: z.array(z.string()).describe('Issues that could be blocking'),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('Overall risk assessment'),
  iterationEfficiency: z.number().min(0).max(1).describe('Efficiency of previous iterations'),
  // Optional tool selection for execution after failsafes
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional()
});

/**
 * Try step output schema
 */
const ReadyToShortCircuitAgentTryStepOutput = z.object({
  resolvabilityAssessment: z.string().describe('Assessment of issue resolvability'),
  iterationPotential: z.string().describe('Potential for next iteration to resolve'),
  blockingVerdict: z.boolean().describe('Whether blocking issues exist'),
  iterationEffectiveness: z.boolean().describe('Whether iteration could resolve issues'),
  recommendation: z.enum(['SHORT_CIRCUIT', 'CONTINUE']).describe('Initial recommendation'),
  confidence: z.number().min(0).max(1).describe('Confidence in assessment'),
  reasoning: z.string().describe('Detailed reasoning for recommendation'),
  // Optional tool selection for execution after failsafes
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional()
});

/**
 * Refine step output schema
 */
const ReadyToShortCircuitAgentRefineStepOutput = z.object({
  verifiedBlocking: z.boolean().describe('Verified blocking issues exist'),
  verifiedUnresolvable: z.boolean().describe('Verified issues cannot be resolved'),
  reasoning: z.string().describe('Refined reasoning for decision'),
  confidenceLevel: z.number().min(0).max(1).describe('Confidence in refined decision'),
  finalRecommendation: z.enum(['SHORT_CIRCUIT', 'CONTINUE']).describe('Refined recommendation'),
  impactAssessment: z.string().describe('Assessment of decision impact'),
  // Optional tool selection for execution after failsafes
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional()
});

/**
 * Retry step output schema
 */
const ReadyToShortCircuitAgentRetryStepOutput = z.object({
  decision: z.enum(['SHORT_CIRCUIT', 'CONTINUE']).describe('Final pipeline decision'),
  reasoning: z.string().describe('Complete reasoning for decision'),
  confidence: z.number().min(0).max(1).describe('Final confidence level'),
  nextSteps: z.array(z.string()).describe('Recommended next steps'),
  feeResolutionJustification: z.string().optional().describe('Justification for BTC fee-hold release or failure accounting if short-circuiting'),
  metadata: z.object({
    decisionMadeAt: z.string(),
    iterationAnalyzed: z.number(),
    riskLevel: z.string(),
    version: z.string()
  }).describe('Decision metadata'),
  // Optional tool selection for execution after failsafes
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional()
});

export type ShortCircuitInput = z.infer<typeof ShortCircuitInputSchema>;
export type ShortCircuitDecision = z.infer<typeof ReadyToShortCircuitAgentRetryStepOutput>;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Analyze accumulated context for patterns and issues
 */
function analyzeAccumulatedContext(context: any): {
  issues: string[];
  blockingIssues: string[];
  efficiency: number;
} {
  const issues: string[] = [];
  const blockingIssues: string[] = [];
  let efficiency = 0.5; // Default neutral efficiency
  
  // Mock analysis - in real implementation would deeply analyze context
  if (context?.errors?.length > 5) {
    issues.push('High error count indicates systematic problems');
    blockingIssues.push('Excessive error accumulation');
    efficiency *= 0.3;
  }
  
  if (context?.timeouts?.length > 2) {
    issues.push('Multiple timeouts suggest resource constraints');
    blockingIssues.push('Resource availability issues');
    efficiency *= 0.4;
  }
  
  if (context?.attempts?.failed > context?.attempts?.succeeded) {
    issues.push('Failure rate exceeds success rate');
    efficiency *= 0.5;
  }
  
  if (context?.progress?.stalled === true) {
    issues.push('Progress has stalled');
    blockingIssues.push('No forward progress');
    efficiency *= 0.2;
  }
  
  return { issues, blockingIssues, efficiency };
}

/**
 * Assess whether issues are resolvable with more iterations
 */
function assessResolvability(issues: string[], iterationCount: number, maxIterations: number): {
  resolvable: boolean;
  reasoning: string;
  confidence: number;
} {
  const remainingIterations = maxIterations - iterationCount;
  
  if (remainingIterations <= 0) {
    return {
      resolvable: false,
      reasoning: 'No iterations remaining to resolve issues',
      confidence: 1.0
    };
  }
  
  // Check for fundamentally unresolvable issues
  const unresolvablePatterns = [
    'missing required resources',
    'invalid credentials',
    'insufficient permissions',
    'malformed configuration',
    'incompatible dependencies'
  ];
  
  const hasUnresolvableIssues = issues.some(issue => 
    unresolvablePatterns.some(pattern => 
      issue.toLowerCase().includes(pattern)
    )
  );
  
  if (hasUnresolvableIssues) {
    return {
      resolvable: false,
      reasoning: 'Issues contain fundamentally unresolvable problems',
      confidence: 0.9
    };
  }
  
  // Assess based on iteration effectiveness
  const iterationEffectiveness = Math.max(0.1, 1 - (iterationCount / maxIterations));
  
  if (iterationEffectiveness < 0.3) {
    return {
      resolvable: false,
      reasoning: 'Previous iterations show poor effectiveness, unlikely to improve',
      confidence: 0.8
    };
  }
  
  return {
    resolvable: true,
    reasoning: 'Issues appear resolvable with additional iterations',
    confidence: iterationEffectiveness
  };
}

// ==================== PTRR STEP IMPLEMENTATIONS ====================

/**
 * PLAN: Analyze context and identify potential blocking issues
 */
const factoryPlanStep = async (input: ShortCircuitInput): Promise<ReadyToShortCircuitAgentPlanStepOutput> => {
  log('Planning short-circuit analysis', 'info', {
    currentPhase: input.currentPhase,
    iterationCount: input.iterationCount,
    maxIterations: input.maxIterations
  });
  
  try {
    // Analyze accumulated context
    const contextAnalysis = analyzeAccumulatedContext(input.accumulatedContext);
    
    // Combine issues from context and input
    const allIssues = [
      ...contextAnalysis.issues,
      ...input.errorHistory,
      ...input.blockers
    ];
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (contextAnalysis.blockingIssues.length > 3) {
      riskLevel = 'critical';
    } else if (contextAnalysis.blockingIssues.length > 1) {
      riskLevel = 'high';
    } else if (allIssues.length > 5) {
      riskLevel = 'medium';
    }
    
    // Check iteration limits
    if (input.iterationCount >= input.maxIterations) {
      riskLevel = 'critical';
    }
    
    return {
      contextAnalysis: `Analyzed ${input.iterationCount} iterations in ${input.currentPhase} phase. Found ${allIssues.length} total issues with ${contextAnalysis.blockingIssues.length} potentially blocking.`,
      identifiedIssues: allIssues,
      blockingIssues: contextAnalysis.blockingIssues,
      riskLevel,
      iterationEfficiency: contextAnalysis.efficiency
    };
    
  } catch (error) {
    log('Short-circuit planning failed', 'error', { error });
    throw error;
  }
}

/**
 * TRY: Assess resolvability and make initial recommendation
 */
const factoryTryStep = async (planResult: ReadyToShortCircuitAgentPlanStepOutput, input: ShortCircuitInput): Promise<ReadyToShortCircuitAgentTryStepOutput> => {
  log('Analyzing short-circuit decision', 'info', {
    riskLevel: planResult.riskLevel,
    blockingIssues: planResult.blockingIssues.length
  });
  
  try {
    // Assess resolvability of issues
    const resolvability = assessResolvability(
      planResult.identifiedIssues,
      input.iterationCount,
      input.maxIterations
    );
    
    // Determine if iteration could be effective
    const iterationEffectiveness = planResult.iterationEfficiency > 0.3 && 
                                  input.iterationCount < input.maxIterations;
    
    // Make initial recommendation
    let recommendation: 'SHORT_CIRCUIT' | 'CONTINUE' = 'CONTINUE';
    let confidence = 0.5;
    
    if (planResult.riskLevel === 'critical' || !resolvability.resolvable) {
      recommendation = 'SHORT_CIRCUIT';
      confidence = resolvability.confidence;
    } else if (planResult.riskLevel === 'high' && !iterationEffectiveness) {
      recommendation = 'SHORT_CIRCUIT';
      confidence = 0.7;
    } else if (iterationEffectiveness && resolvability.resolvable) {
      recommendation = 'CONTINUE';
      confidence = Math.min(0.8, resolvability.confidence + 0.2);
    }
    
    // Special case: extreme complexity with many iterations
    if (input.taskComplexity === 'extreme' && input.iterationCount >= 2) {
      if (planResult.iterationEfficiency < 0.4) {
        recommendation = 'SHORT_CIRCUIT';
        confidence = 0.8;
      }
    }
    
    const reasoning = `Based on ${input.iterationCount} iterations with ${planResult.riskLevel} risk level. ${resolvability.reasoning}. Iteration effectiveness: ${iterationEffectiveness ? 'positive' : 'negative'}.`;
    
    return {
      resolvabilityAssessment: resolvability.reasoning,
      iterationPotential: iterationEffectiveness ? 'High potential for resolution' : 'Low potential for resolution',
      blockingVerdict: planResult.blockingIssues.length > 0,
      iterationEffectiveness,
      recommendation,
      confidence,
      reasoning
    };
    
  } catch (error) {
    log('Short-circuit analysis failed', 'error', { error });
    throw error;
  }
}

/**
 * REFINE: Verify decision logic and refine recommendation
 */
const factoryRefineStep = async (tryResult: ReadyToShortCircuitAgentTryStepOutput, planResult: ReadyToShortCircuitAgentPlanStepOutput): Promise<ReadyToShortCircuitAgentRefineStepOutput> => {
  log('Refining short-circuit decision', 'info', {
    initialRecommendation: tryResult.recommendation,
    confidence: tryResult.confidence
  });
  
  try {
    // Verify blocking issues are truly blocking
    const verifiedBlocking = tryResult.blockingVerdict && planResult.blockingIssues.length > 0;
    
    // Verify issues are truly unresolvable
    const verifiedUnresolvable = tryResult.confidence > 0.8 && 
                                tryResult.recommendation === 'SHORT_CIRCUIT';
    
    // Refine confidence based on additional checks
    let refinedConfidence = tryResult.confidence;
    
    // Increase confidence if multiple indicators align
    if (verifiedBlocking && verifiedUnresolvable && planResult.riskLevel === 'critical') {
      refinedConfidence = Math.min(1.0, refinedConfidence + 0.2);
    }
    
    // Decrease confidence if indicators are mixed
    if (tryResult.blockingVerdict && tryResult.iterationEffectiveness) {
      refinedConfidence = Math.max(0.3, refinedConfidence - 0.1);
    }
    
    // Final recommendation based on refined analysis
    let finalRecommendation = tryResult.recommendation;
    
    // Override if confidence is very high for short-circuit
    if (refinedConfidence > 0.9 && verifiedUnresolvable) {
      finalRecommendation = 'SHORT_CIRCUIT';
    }
    
    // Override if confidence is very low
    if (refinedConfidence < 0.4) {
      finalRecommendation = 'CONTINUE';
    }
    
    const reasoning = `Verified analysis confirms ${finalRecommendation} with ${(refinedConfidence * 100).toFixed(0)}% confidence. Blocking issues: ${verifiedBlocking ? 'confirmed' : 'unconfirmed'}. Unresolvable: ${verifiedUnresolvable ? 'confirmed' : 'unconfirmed'}.`;
    
    const impactAssessment = finalRecommendation === 'SHORT_CIRCUIT' ?
      'Pipeline will terminate, the BTC fee-hold will be released or accounted without mutating $BTD, and the task will be marked as failed' :
      'Pipeline will continue with the next iteration and additional metered resources';
    
    return {
      verifiedBlocking,
      verifiedUnresolvable,
      reasoning,
      confidenceLevel: refinedConfidence,
      finalRecommendation,
      impactAssessment
    };
    
  } catch (error) {
    log('Short-circuit decision refinement failed', 'error', { error });
    throw error;
  }
}

/**
 * RETRY: Make final decision and prepare response
 */
async function retryShortCircuitFinalization(
  refinementResult: ReadyToShortCircuitAgentRefineStepOutput,
  tryResult: ReadyToShortCircuitAgentTryStepOutput,
  input: ShortCircuitInput
): Promise<ReadyToShortCircuitAgentRetryStepOutput> {
  log('Finalizing short-circuit decision', 'info', {
    decision: refinementResult.finalRecommendation,
    confidence: refinementResult.confidenceLevel
  });
  
  try {
    const decision = refinementResult.finalRecommendation;
    
    // Prepare next steps based on decision
    const nextSteps: string[] = [];
    
    if (decision === 'SHORT_CIRCUIT') {
      nextSteps.push('Terminate pipeline execution immediately');
      nextSteps.push('Resolve the BTC fee-hold without mutating $BTD holdings');
      nextSteps.push('Log termination reason and context');
      nextSteps.push('Notify user of task failure and fee-hold resolution');
    } else {
      nextSteps.push('Proceed to next pipeline iteration');
      nextSteps.push('Apply learnings from previous iteration');
      nextSteps.push('Monitor progress more closely');
      nextSteps.push('Prepare for potential future short-circuit evaluation');
    }
    
    // Prepare fee-resolution justification if short-circuiting.
    const feeResolutionJustification = decision === 'SHORT_CIRCUIT' ?
      `Task determined unrecoverable after ${input.iterationCount} iterations. ${refinementResult.reasoning}` :
      undefined;
    
    return {
      decision,
      reasoning: refinementResult.reasoning,
      confidence: refinementResult.confidenceLevel,
      nextSteps,
      feeResolutionJustification,
      metadata: {
        decisionMadeAt: new Date().toISOString(),
        iterationAnalyzed: input.iterationCount,
        riskLevel: 'unknown', // Would be passed from plan
        version: '2.0.0'
      }
    };
    
  } catch (error) {
    log('Short-circuit decision finalization failed', 'error', { error });
    throw error;
  }
}

// ==================== PROMPTS ====================

export const readyToShortCircuitPrompt = new AgentPrompt({
  name: 'ready-to-short-circuit' as PromptPart,
  identity: 'Pipeline control specialist' as PromptPart
});

export const readyToShortCircuitStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Analyze requirements' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute operation' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Enhance results' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Complete processing' as PromptPart })
};

// ==================== AGENT IMPLEMENTATION ====================

/**
 * Ready To Short Circuit Agent - Default PTRR implementation
 * Main agent using comprehensive short-circuit analysis with full PTRR cycle
 * Controls pipeline termination decisions
 */
// @ts-expect-error TS2589: deep generic instantiation under monorepo path-mapped typecheck
const readyToShortCircuit: any = factoryPTRRAgent<ShortCircuitInput, ReadyToShortCircuitAgentRetryStepOutput>({
  name: 'ready-to-short-circuit',
  description: 'Full context analysis with verification and refinement for pipeline control',
  prompt: readyToShortCircuitPrompt,
  stepPrompts: {
    plan: () => readyToShortCircuitStepPrompts.plan,
    try: () => readyToShortCircuitStepPrompts.try,
    refine: () => readyToShortCircuitStepPrompts.refine,
    retry: () => readyToShortCircuitStepPrompts.retry
  },
  outputSchema: ReadyToShortCircuitAgentRetryStepOutput,
  plan: { chunkThreshold: 100 },
  try: { chunkThreshold: 500 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1, backoff: 500 }
});

/**
 * Quick Ready To Short Circuit Agent - Simple version prefixed with "quick"
 * Fast decision making for simple scenarios
 */
const quickReadyToShortCircuit: any = factoryAgentWithSingleStep<ShortCircuitInput, ReadyToShortCircuitAgentRetryStepOutput>({
  name: 'quick-ready-to-short-circuit',
  description: 'Fast decision making for simple pipeline control scenarios',
  execute: async (input, execution) => {
    // Quick analysis without full PTRR
    const plan = await factoryPlanStep(input);
    const analysis = await factoryTryStep(plan, input);
    
    // Convert to final schema format
    return {
      decision: analysis.recommendation,
      reasoning: analysis.reasoning,
      confidence: analysis.confidence,
      nextSteps: analysis.recommendation === 'SHORT_CIRCUIT' ? 
        ['Terminate pipeline', 'Resolve BTC fee-hold without mutating $BTD'] :
        ['Continue pipeline'],
      feeResolutionJustification: analysis.recommendation === 'SHORT_CIRCUIT' ? 
        'Quick analysis determined task unrecoverable' : undefined,
      metadata: {
        decisionMadeAt: new Date().toISOString(),
        iterationAnalyzed: input.iterationCount,
        riskLevel: plan.riskLevel,
        version: '2.0.0'
      }
    };
  }
});

/**
 * Main export - uses PTRR pattern (the default)
 */
export const readyToShortCircuitAgent = readyToShortCircuit;

/**
 * Quick version export for simple pipeline control
 */
export const quickReadyToShortCircuitAgent = quickReadyToShortCircuit;

/**
 * Helper to select appropriate short-circuit agent based on input
 * Used by pipelines to determine which agent to retrieve from registry
 */
export function selectReadyToShortCircuitAgent(input: ShortCircuitInput): string {
  // Use comprehensive analysis for high-stakes decisions
  const needsComprehensive = input.taskComplexity === 'complex' || 
                            input.taskComplexity === 'extreme' ||
                            input.iterationCount >= 2 ||
                            input.blockers.length > 2;
  
  // Return agent registry keys
  return needsComprehensive ? 'readyToShortCircuitAgent' : 'quickReadyToShortCircuitAgent';
}

// Removed former wrapper exports.
