/**
 * Historical guided-pipeline helpers (Engi Design → Develop → Digest).
 *
 * Bitcode product law is SDIVF (Setup → Discovery → Implementation →
 * Validation → Finish). Prefer product pipeline factories under
 * asset-packs-pipelines/* and generic-pipelines-sdivf. These helpers remain
 * only for residual call sites and tests; new code must not route on DDD gates.
 *
 * @package @bitcode/pipelines-generics
 */

import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Gate, GateState, GateConfig } from '../gate-system/types';
import { GATE_CONFIGS, initializeGateState } from '../gate-system/types';

/**
 * Gate-aware execution context
 */
export interface GateExecutionContext {
  gate: Gate;
  config: GateConfig;
  allowedFiles: string[];
  collaborative: boolean;
  primaryDocument?: string;
}

/**
 * Store gate state in execution
 */
export function storeGateState(execution: Execution, state: GateState): void {
  execution.store('gate', 'current', state.current);
  execution.store('gate', 'state', state as any);
  execution.store('gate', 'config', GATE_CONFIGS[state.current] as any);
  execution.store('gate', 'history', state.history as any);

  // Store file gates for enforcement
  const config = GATE_CONFIGS[state.current];
  execution.store('gates', 'allowedFilePatterns', config.allowedFilePatterns);
  execution.store('gates', 'collaborative', config.collaborative);

  if (config.primaryDocument) {
    execution.store('gates', 'primaryDocument', config.primaryDocument);
  }

  if (config.selfInstructThreshold !== undefined) {
    execution.store('config', 'selfInstructThreshold', config.selfInstructThreshold);
  }
}

/**
 * Get current gate from execution
 */
export function getCurrentGate(execution: Execution): Gate {
  return execution.get('gate', 'current') || 'Develop';
}

/**
 * Get gate state from execution
 */
export function getGateState(execution: Execution): GateState {
  const state = execution.get<any>('gate', 'state') as GateState | undefined;
  if (state) return state;

  // Initialize if not present
  const initialState = initializeGateState('Develop');
  storeGateState(execution, initialState);
  return initialState;
}

/**
 * Transition to next gate (operator-triggered)
 * Called when user clicks "Ready to Develop" / "Ready to Digest" / "Finish"
 */
export function transitionToNextGate(
  execution: Execution,
  nextGate: Gate
): void {
  const currentState = getGateState(execution);
  const now = new Date().toISOString();

  // Complete current gate
  const updatedHistory = [...currentState.history];
  const currentGateEntry = updatedHistory[updatedHistory.length - 1];
  if (currentGateEntry && !currentGateEntry.completedAt) {
    currentGateEntry.completedAt = now;
    currentGateEntry.transitionReason = `User transition to ${nextGate}`;
  }

  // Start next gate
  updatedHistory.push({
    gate: nextGate,
    startedAt: now,
  });

  const newState: GateState = {
    current: nextGate,
    history: updatedHistory,
    readyToTransition: false,
  };

  storeGateState(execution, newState);

  // Emit transition event
  execution.store('gate', 'lastTransition', {
    from: currentState.current,
    to: nextGate,
    timestamp: now,
    triggeredBy: 'user',
  });
}

/**
 * Check if current gate is collaborative
 */
export function isCollaborativeGate(execution: Execution): boolean {
  const config = execution.get<any>('gate', 'config') as GateConfig | undefined;
  return config?.collaborative || false;
}

/**
 * Get self-instruct threshold for current gate
 */
export function getSelfInstructThreshold(execution: Execution): number | undefined {
  const config = execution.get<any>('gate', 'config') as GateConfig | undefined;
  return config?.selfInstructThreshold;
}

// Re-export gate types for convenience
export type { Gate, GateState, GateConfig } from '../gate-system/types';
export { GATE_CONFIGS, GATE_TRANSITIONS, initializeGateState } from '../gate-system/types';
