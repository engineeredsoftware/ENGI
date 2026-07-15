/**
 * Gate Types
 *
 * Design → Develop → Digest (DDD) gate system.
 * Each gate runs the full SDIVF pipeline with different file access controls.
 *
 * NOTE: Gate type is defined in ./types/primitives.ts (SSOT)
 * Import from there or from package root.
 *
 * @package @bitcode/pipelines-generics
 */

import type { Gate, MetaPhase } from '../types/primitives';
import type { Execution } from '@bitcode/execution-generics/Execution';
export type { Gate, MetaPhase };

/**
 * Gate configuration
 */
export interface GateConfig {
  /**
   * Which files can be edited in this gate
   */
  allowedFilePatterns: string[];

  /**
   * Is this a collaborative gate (requires user approval)?
   */
  collaborative: boolean;

  /**
   * Self-instruct confidence threshold for autonomous operation
   * Only applies to Develop gate
   */
  selfInstructThreshold?: number;

  /**
   * Primary document being edited
   */
  primaryDocument?: string;
}

// Public synonym for callers that model Design/Develop/Digest as meta-phases.
export type MetaPhaseConfig = GateConfig;

/**
 * Gate configurations
 */
export const GATE_CONFIGS: Record<Gate, GateConfig> = {
  Design: {
    allowedFilePatterns: ['.docs/PRODUCT.md'],
    collaborative: true,
    primaryDocument: '.docs/PRODUCT.md',
  },

  Develop: {
    allowedFilePatterns: [
      '**/*',           // All files
      '!.docs/**',        // Except .docs/ directory
      '.docs/PRODUCT.md'  // But allow PRODUCT.md updates
    ],
    collaborative: false,
    selfInstructThreshold: 0.6,
  },

  Digest: {
    allowedFilePatterns: ['.docs/AGENTS.md', '.docs/PRODUCT.md'],
    collaborative: true,
    primaryDocument: '.docs/AGENTS.md',
  },
};

// Meta-phase naming mirrors the same Bitcode gate configuration table.
export const META_PHASE_CONFIGS = GATE_CONFIGS;

/**
 * Gate transitions are operator-gated.
 * User clicks "Ready to Develop" / "Ready to Digest" / "Finish"
 * No automatic validation-based transitions
 */
export interface GateTransition {
  from: Gate;
  to: Gate;
  userAction: string; // Button label: "Ready to Develop", "Ready to Digest", "Finish"
  description: string;
}

export const GATE_TRANSITIONS: GateTransition[] = [
  {
    from: 'Design',
    to: 'Develop',
    userAction: 'Ready to Develop',
    description: 'User confirms PRODUCT.md is complete and ready for implementation'
  },
  {
    from: 'Develop',
    to: 'Digest',
    userAction: 'Ready to Digest',
    description: 'User confirms code changes are complete and ready to capture learnings'
  },
  {
    from: 'Digest',
    to: 'Design',
    userAction: 'Another Iteration',
    description: 'User requests another Design → Develop → Digest cycle'
  }
];

// Meta-phase naming mirrors the same operator-gated transition list.
export const META_PHASE_USER_GATES = GATE_TRANSITIONS;

/**
 * Automated transitions are disabled for Bitcode V26; transitions are gate/guide user actions.
 */
export interface MetaPhaseTransition {
  from: MetaPhase;
  to: MetaPhase;
  condition: (execution: Execution) => boolean;
  reason: string;
}

export const META_PHASE_TRANSITIONS: MetaPhaseTransition[] = [];

/**
 * Gate state tracking
 */
export interface GateState {
  current: Gate;
  history: Array<{
    gate: Gate;
    startedAt: string;
    completedAt?: string;
    transitionReason?: string;
  }>;
  readyToTransition: boolean;
  nextGate?: Gate;
}

// Public synonym for callers that model Design/Develop/Digest as meta-phases.
export type MetaPhaseState = GateState;

/**
 * Initialize gate state
 */
export function initializeGateState(startingGate: Gate = 'Design'): GateState {
  return {
    current: startingGate,
    history: [
      {
        gate: startingGate,
        startedAt: new Date().toISOString(),
      },
    ],
    readyToTransition: false,
  };
}

// Meta-phase naming initializes the same Bitcode gate state.
export const initializeMetaPhaseState = initializeGateState;

/**
 * Transition to next gate phase
 */
export function transitionMetaPhase(
  currentState: MetaPhaseState,
  execution: any
): MetaPhaseState {
  const applicableTransitions = META_PHASE_TRANSITIONS.filter(
    (t) => t.from === currentState.current && t.condition(execution)
  );

  if (applicableTransitions.length === 0) {
    return currentState;
  }

  const transition = applicableTransitions[0];
  const now = new Date().toISOString();

  // Complete current phase
  const updatedHistory = [...currentState.history];
  const currentPhaseEntry = updatedHistory[updatedHistory.length - 1];
  if (currentPhaseEntry && !currentPhaseEntry.completedAt) {
    currentPhaseEntry.completedAt = now;
    currentPhaseEntry.transitionReason = transition.reason;
  }

  // Start next phase
  updatedHistory.push({
    gate: transition.to,
    startedAt: now,
  });

  return {
    current: transition.to,
    history: updatedHistory,
    readyToTransition: false,
    nextGate: undefined,
  };
}

/**
 * Check if the current gate phase is ready to transition
 */
export function checkMetaPhaseTransition(
  currentPhase: MetaPhase,
  execution: any
): { ready: boolean; nextPhase?: MetaPhase; reason?: string } {
  const applicableTransitions = META_PHASE_TRANSITIONS.filter(
    (t) => t.from === currentPhase && t.condition(execution)
  );

  if (applicableTransitions.length === 0) {
    return { ready: false };
  }

  const transition = applicableTransitions[0];
  return {
    ready: true,
    nextPhase: transition.to,
    reason: transition.reason,
  };
}
