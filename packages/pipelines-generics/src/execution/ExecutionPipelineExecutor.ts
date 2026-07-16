/**
 * ExecutionPipelineExecutor - Orchestrates pipeline execution with short-circuit support
 * 
 * Provides phase sequencing, agent execution, and automatic short-circuit
 * detection with refund handling.
 */

import { ExecutionPipeline } from './ExecutionPipeline';
// No direct stream adapter usage here; rely on store() + adapter inference
import { 
  ShortCircuitError, 
  hasShortCircuitSignal,
  ShortCircuitSignal 
} from '@bitcode/execution-generics';
import { Executor } from '@bitcode/execution-generics';
import { resolveRegisteredAgent } from './resolve-agent';

export interface PhaseConfig {
  phaseName: string;
  sequence: AgentStep[];
  allowShortCircuit?: boolean;
  shortCircuitHandler?: (signal: ShortCircuitSignal) => Promise<void>;
}

export interface AgentStep {
  agent: string;
  parallel?: AgentStep[];
  /**
   * Optional per-step input override. When absent, the phase input is forwarded
   * so agents receive the live read/deposit/repository context.
   */
  input?: any;
}

export interface PhaseResult {
  success: boolean;
  shortCircuited?: boolean;
  shortCircuitReason?: string;
  metrics: {
    duration: number;
    agentsExecuted: number;
  };
}

/**
 * Pipeline executor that handles phase sequencing and short-circuits
 */
export class ExecutionPipelineExecutor {
  constructor(
    private execution: ExecutionPipeline
  ) {}
  
  /**
   * Execute a single agent with short-circuit detection
   */
  async executeAgent(agentName: string, input: any): Promise<any> {
    // Get agent from registry
    const agent = await resolveRegisteredAgent(agentName, this.execution.agents.getAgent(agentName) as any);
    const phase = String(this.execution.get('phase', 'current') || 'setup');
    const step = 'try';
    this.execution.store('agent', 'name', agentName);
    this.execution.store('step', 'name', step);
    this.execution.store(`agent:${agentName}`, 'start', {
      phase,
      currentPhase: phase,
      agent: agentName,
      currentAgent: agentName,
      step,
      currentStep: step,
      status: 'running',
      input: summarizeValue(input),
      startedAt: new Date().toISOString(),
    } as any);
    
    // Execute agent with error envelope
    let output: any;
    try {
      output = await agent(input, this.execution);
    } catch (error) {
      this.execution.store(`agent:${agentName}`, 'complete', {
        phase,
        currentPhase: phase,
        agent: agentName,
        currentAgent: agentName,
        step,
        currentStep: step,
        status: 'failed',
        error: summarizeError(error),
        completedAt: new Date().toISOString(),
      } as any);
      throw error;
    }
    
    // Check for short-circuit signal
    if (hasShortCircuitSignal(output)) {
      // Store short-circuit information
      this.execution.store('pipeline/short-circuit', 'signal', output.signal as any);
      this.execution.store('pipeline/short-circuit', 'agent', agentName);
      this.execution.store('pipeline/short-circuit', 'timestamp', Date.now());
      this.execution.store(`agent:${agentName}`, 'complete', {
        phase,
        currentPhase: phase,
        agent: agentName,
        currentAgent: agentName,
        step,
        currentStep: step,
        status: 'completed',
        shortCircuited: true,
        output: summarizeValue(output),
        completedAt: new Date().toISOString(),
      } as any);
      
      // Throw short-circuit error for phase runner to catch
      throw new ShortCircuitError(output.signal!);
    }
    
    this.execution.store(`agent:${agentName}`, 'complete', {
      phase,
      currentPhase: phase,
      agent: agentName,
      currentAgent: agentName,
      step,
      currentStep: step,
      status: 'completed',
      output: summarizeValue(output),
      completedAt: new Date().toISOString(),
    } as any);
    
    // Return normal result
    return output.result || output;
  }
  
  /**
   * Execute an agent step (single or parallel)
   */
  async executeStep(step: AgentStep, phaseInput?: any): Promise<any> {
    if (step.parallel) {
      // Execute parallel agents
      return await Promise.all(
        step.parallel.map(subStep => this.executeStep(subStep, phaseInput))
      );
    } else {
      // Execute single agent
      const input = Object.prototype.hasOwnProperty.call(step, 'input')
        ? step.input
        : phaseInput;
      return await this.executeAgent(step.agent, input);
    }
  }
  
  /**
   * Execute a complete phase with its sequence
   */
  async executePhase(config: PhaseConfig, input?: any): Promise<PhaseResult> {
    const start = Date.now();
    let agentsExecuted = 0;
    
    try {
      // Store phase start
      this.execution.store('phase', 'current', config.phaseName);
      this.execution.store(`phase/${config.phaseName}`, 'started', Date.now());
      // Initialize per-phase counter
      const globalCount = this.execution.get<number>('metrics', 'agentsExecuted') || 0;
      this.execution.store('metrics', 'agentsExecuted', globalCount);
      this.execution.store(`metrics/phase:${config.phaseName}`, 'agentsExecuted', 0);
      // Store phase start; stream adapter infers 'phase-start'
      this.execution.store('phase', 'start', { phase: config.phaseName });
      
      // Execute each step in sequence
      for (const step of config.sequence) {
        await this.executeStep(step, input);
        agentsExecuted++;
        // Increment counters
        const prevGlobal = this.execution.get<number>('metrics', 'agentsExecuted') || 0;
        this.execution.store('metrics', 'agentsExecuted', prevGlobal + 1);
        const prevPhase = this.execution.get<number>(`metrics/phase:${config.phaseName}`, 'agentsExecuted') || 0;
        this.execution.store(`metrics/phase:${config.phaseName}`, 'agentsExecuted', prevPhase + 1);
      }
      
      // Store phase completion
      this.execution.store(`phase/${config.phaseName}`, 'completed', Date.now());
      // Store phase completion; stream adapter infers 'phase-complete'
      this.execution.store('phase', 'complete', { phase: config.phaseName });
      
      return {
        success: true,
        metrics: {
          duration: Date.now() - start,
          agentsExecuted
        }
      };
      
    } catch (error) {
      // Handle short-circuit
      if (error instanceof ShortCircuitError) {
        // Store phase short-circuit
        this.execution.store(`phase/${config.phaseName}`, 'shortCircuited', true);
        this.execution.store(`phase/${config.phaseName}`, 'shortCircuitReason', error.signal.reason);
        // Store phase completion with short-circuit metadata
        this.execution.store('phase', 'complete', { phase: config.phaseName, shortCircuited: true, reason: error.signal.reason });
        
        // Call handler if provided
        if (config.shortCircuitHandler) {
          await config.shortCircuitHandler(error.signal);
        }
        
        // Return short-circuit result
        return {
          success: false,
          shortCircuited: true,
          shortCircuitReason: error.signal.reason,
          metrics: {
            duration: Date.now() - start,
            agentsExecuted
          }
        };
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Create a phase runner function
 */
export function createPhaseRunner(config: PhaseConfig): Executor<any, PhaseResult> {
  return async (input: any, execution: any): Promise<PhaseResult> => {
    const executor = new ExecutionPipelineExecutor(execution as ExecutionPipeline);
    return await executor.executePhase(config, input);
  };
}

function summarizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ? error.stack.split('\n').slice(0, 6).join('\n') : undefined,
    };
  }
  return { message: String(error) };
}

function summarizeValue(value: unknown): unknown {
  try {
    if (value == null) return value;
    if (typeof value === 'string') {
      return value.length > 500 ? `${value.slice(0, 500)}... [truncated]` : value;
    }
    if (Array.isArray(value)) {
      return { type: 'array', length: value.length, sample: summarizeValue(value[0]) };
    }
    if (typeof value === 'object') {
      const objectValue = value as Record<string, unknown>;
      const keys = Object.keys(objectValue);
      const sample: Record<string, unknown> = {};
      for (const key of keys.slice(0, 8)) sample[key] = summarizeValue(objectValue[key]);
      return { type: 'object', keys: keys.slice(0, 20), sample };
    }
    return value;
  } catch {
    return '[unserializable]';
  }
}
