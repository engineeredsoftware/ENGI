/**
 * Execution Debug Utilities
 *
 * Lightweight helpers to control verbose debug logging across
 * pipeline/phase/agent executor composition without polluting
 * execution-generics primitives.
 */

import type { ExecutionPipeline } from './ExecutionPipeline';
import { log } from '@bitcode/logger';
import type { Executor } from '@bitcode/execution-generics';

/**
 * Check whether debug logging is enabled for this execution.
 * Sources (in precedence order):
 * - execution.findUp('config','debug') === true
 * - process.env.BITCODE_EXECUTION_DEBUG === 'true'
 * - process.env.LOG_LEVEL === 'debug'
 */
export function isExecutionDebugEnabled(execution: ExecutionPipeline | { findUp?: Function }): boolean {
  try {
    const execAny = execution as any;
    const execFlag = typeof execAny.findUp === 'function' ? execAny.findUp('config', 'debug') : undefined;
    if (execFlag === true) return true;
  } catch {}
  if (process.env.BITCODE_EXECUTION_DEBUG === 'true') return true;
  if (process.env.LOG_LEVEL === 'debug') return true;
  return false;
}

/**
 * Enable debug logging by storing a flag in execution config.
 */
export function enableExecutionDebug(execution: ExecutionPipeline & { store: Function }, enabled = true): void {
  try {
    (execution as any).store('config', 'debug', !!enabled);
  } catch {}
}

function summarizeValue(v: any): any {
  try {
    if (v == null) return v;
    if (typeof v === 'string') return v.length > 500 ? v.slice(0, 500) + '… [truncated]' : v;
    if (Array.isArray(v)) return { type: 'array', length: v.length };
    if (typeof v === 'object') return { type: 'object', keys: Object.keys(v).slice(0, 20) };
    return v;
  } catch {
    return '[unserializable]';
  }
}

/**
 * Wrap an Executor with step-level debug logging.
 * Provide phase and step name for structured trace output.
 */
export function debugWrapExecutorStep(
  phase: string,
  stepName: string,
  exec: Executor<any, any>
): Executor<any, any> {
  return async (input, execution) => {
    const debug = isExecutionDebugEnabled(execution as any);
    if (debug) {
      log('[exec] step start', 'debug', {
        phase,
        step: stepName,
        inputPreview: summarizeValue(input),
        executionId: (execution as any).id,
      });
    }
    try {
      const out = await exec(input, execution);
      if (debug) {
        log('[exec] step success', 'debug', {
          phase,
          step: stepName,
          outputPreview: summarizeValue(out),
          executionId: (execution as any).id,
        });
      }
      return out;
    } catch (error) {
      if (debug) {
        log('[exec] step error', 'error', {
          phase,
          step: stepName,
          error,
          executionId: (execution as any).id,
        });
      }
      throw error;
    }
  };
}
