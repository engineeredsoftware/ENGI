/**
 * Synthesis mode helpers.
 *
 * Product law: **no lens**. Prefer separate pipelines:
 *   - @bitcode/asset-packs-pipelines-synthesize-deposits-asset-packs-pipeline  (SDIVF)
 *   - @bitcode/asset-packs-pipelines-synthesize-reads-asset-packs-pipeline     (SDIVF)
 *   - @bitcode/asset-packs-pipelines-settle-reads         (Simple)
 *
 * `SynthesizeAssetPacksMode` / resolve helpers remain only for dual-entry
 * callers that still pass `mode` / legacy `lens` aliases.
 */

import type { Execution } from '@bitcode/execution-generics/Execution';

export type SynthesizeAssetPacksMode = 'deposit' | 'read';

export const SYNTHESIZE_ASSET_PACKS_MODE_NAMESPACE = 'synthesize-asset-packs';
export const SYNTHESIZE_ASSET_PACKS_MODE_KEY = 'mode';

const VALID_MODES: ReadonlySet<string> = new Set<SynthesizeAssetPacksMode>(['deposit', 'read']);

function coerceMode(value: unknown): SynthesizeAssetPacksMode | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return VALID_MODES.has(normalized) ? (normalized as SynthesizeAssetPacksMode) : null;
}

/**
 * mode resolve. Prefer product-specific pipelines; `lens` is accepted only
 * as a deprecated alias of mode and must not appear in new product code.
 */
export function resolveSynthesizeAssetPacksMode(
  input: unknown,
  execution?: Execution | null,
): SynthesizeAssetPacksMode {
  const source = (input && typeof input === 'object' ? (input as Record<string, unknown>) : {}) ?? {};
  const fromInput =
    coerceMode(source.mode) ??
    coerceMode(source.synthesisMode) ??
    coerceMode((source as { synthesizeMode?: unknown }).synthesizeMode) ??
    // deprecated alias — do not use in new code
    coerceMode(source.lens);
  if (fromInput) return fromInput;
  const fromExecution = synthesizeAssetPacksModeFromExecution(execution);
  return fromExecution ?? 'read';
}

/** Read the mode previously stored on an execution (or its parent), if any. */
export function synthesizeAssetPacksModeFromExecution(
  execution?: Execution | null,
): SynthesizeAssetPacksMode | null {
  if (!execution) return null;
  try {
    const own = coerceMode(
      execution.get(SYNTHESIZE_ASSET_PACKS_MODE_NAMESPACE, SYNTHESIZE_ASSET_PACKS_MODE_KEY),
    );
    if (own) return own;
  } catch {}
  try {
    const parent = (execution as { parent?: Execution }).parent;
    if (parent) return synthesizeAssetPacksModeFromExecution(parent);
  } catch {}
  return null;
}

/** Persist the resolved mode on the execution so every phase can read it. */
export function storeSynthesizeAssetPacksMode(
  execution: Execution | null | undefined,
  mode: SynthesizeAssetPacksMode,
): void {
  if (!execution) return;
  try {
    execution.store(SYNTHESIZE_ASSET_PACKS_MODE_NAMESPACE, SYNTHESIZE_ASSET_PACKS_MODE_KEY, mode);
  } catch {}
}

export function isDepositMode(mode: SynthesizeAssetPacksMode): boolean {
  return mode === 'deposit';
}

export function isReadMode(mode: SynthesizeAssetPacksMode): boolean {
  return mode === 'read';
}

// ==================== CROSS-PHASE STORE-VISIBILITY LAW ====================
//
// SDIVF phases execute on ISOLATED sibling child nodes: `sequential` runs
// preprocess and every phase on `execution.child('seq-N')`, and `findUp`
// walks ANCESTORS only — a sibling subtree can never see another sibling's
// stores, and the dispatching route (which holds the outer execution) can
// never see a child's stores. Any artifact one phase produces FOR another
// phase, for the ReadyToFinish gate, for Finish, for postprocess, or for the
// dispatching route MUST therefore be stored on the SHARED execution both
// sides can resolve: the ROOT of the execution tree (the F20 mode-propagation
// precedent, generalized).
//
// The canonical contract:
//   - producers call `storeCrossPhaseArtifact(execution, ns, key, value)`,
//     which stores on `execution.getRoot()`;
//   - consumers read `get(ns, key) ?? findUp(ns, key)`, which resolves the
//     root store from EVERY node in the tree (the root itself via `get`,
//     every descendant via the upward walk).

/**
 * Resolve the SHARED synthesis execution — the root of the execution tree —
 * that every phase sibling, every nested agent/step node, and the dispatching
 * route can all resolve (root via `get`, descendants via `findUp`).
 */
export function resolveSharedSynthesisExecution(
  execution: Execution | null | undefined,
): Execution | null {
  if (!execution) return null;
  try {
    return (execution as { getRoot?: () => Execution }).getRoot?.() ?? execution;
  } catch {
    return execution;
  }
}

/**
 * Store a CROSS-PHASE artifact on the shared execution (see the law above).
 * Best-effort like the producers' historical local stores: storage must never
 * decide pipeline success.
 */
export function storeCrossPhaseArtifact(
  execution: Execution | null | undefined,
  namespace: string,
  key: string,
  value: unknown,
): void {
  const shared = resolveSharedSynthesisExecution(execution);
  if (!shared) return;
  try {
    shared.store(namespace, key, value as never);
  } catch {}
}
