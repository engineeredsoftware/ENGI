/**
 * Shared contracts for bare absolute measures of a **DataPack** (not the repository).
 * Hierarchy: measurement-generics → generic-measurements/absolutes/<kind> (bare) →
 * generic-tools/tool-measure-<kind> → generic-agents/agent-measure-absolutes.
 */
import type { MeasurementReading } from '@bitcode/measurement-generics';

/** Source file body available only for DP covered paths (host-scoped). */
export interface DataPackMeasureSourceFile {
  path: string;
  content: string;
}

/** Path+op patch surface of the synthesized DataPack. */
export interface DataPackMeasurePatch {
  title?: string;
  summary?: string;
  patchSummary?: string;
  coveredSourcePaths: string[];
  fileChanges?: Array<{ path: string; op: string }>;
  confidence?: number;
}

/**
 * Input to every bare absolute measure.
 * Measure the DataPack; sources are optional grounding for tool-like counts.
 */
export interface DataPackAbsoluteMeasureInput {
  dataPack: DataPackMeasurePatch;
  /** Optional full/sample bodies for covered paths only. */
  sources?: DataPackMeasureSourceFile[];
  /** Optional precomputed static signals (host may pass through). */
  staticSignals?: Record<string, number | string | boolean | null | undefined>;
  /** Optional execution/env flags (e.g. runnable, corpus version). */
  context?: Record<string, unknown>;
}

/**
 * Honesty class for one absolute reading.
 * - measured: host/tool produced this reading from evidence
 * - estimated: heuristic / soft estimate over partial evidence
 * - insufficient_evidence: ran the kind but lack of bodies/signals
 * - expanded-fill: catalogue completeness row only (never claim measured 0)
 * - not_run: scanner/tool not invoked for this kind
 * - not_implemented: package scaffold without mechanism (maps to not_run in UI)
 */
export type AbsoluteMeasureStatus =
  | 'measured'
  | 'estimated'
  | 'insufficient_evidence'
  | 'expanded-fill'
  | 'not_run'
  | 'not_implemented';

/** Alias used on product carriers (same honesty law). */
export type AbsoluteReadingStatus = AbsoluteMeasureStatus;

export interface AbsoluteMeasureResult extends MeasurementReading {
  status: AbsoluteMeasureStatus;
  policyRole?: 'weighted' | 'gate' | 'penalty' | 'flag' | 'target';
}

export function clamp01(value: number): number {
  const n = Number.isFinite(value) ? value : 0;
  return Number(Math.max(0, Math.min(1, n)).toFixed(4));
}

export function emptyInsufficient(
  measurementKind: string,
  rationale = 'Insufficient evidence to measure this absolute on the DataPack.',
): AbsoluteMeasureResult {
  return {
    measurementKind,
    volume: 0,
    magnitude: 0,
    rationale,
    status: 'insufficient_evidence',
  };
}

export function notImplemented(
  measurementKind: string,
  rationale = 'Absolute measure package scaffolded; mechanism not yet implemented.',
): AbsoluteMeasureResult {
  return {
    measurementKind,
    volume: 0,
    magnitude: 0,
    rationale,
    status: 'not_implemented',
  };
}

/**
 * Quality / sensor-gated absolute: only emit a volume when the host (or quality
 * measure-agent merge) supplies a finite signal. Never invent scores from
 * synthesis confidence alone (commercial honesty — V48 absolute audit class D).
 */
export function hostSignalMeasuredOrInsufficient(
  measurementKind: string,
  input: DataPackAbsoluteMeasureInput,
  options?: {
    /** Prefer ratio 0..1 magnitude when true (default true). */
    isRatio?: boolean;
    /** Divisor for non-ratio magnitude → volume. */
    volumeDivisor?: number;
    policyRole?: AbsoluteMeasureResult['policyRole'];
    missingRationale?: string;
  },
): AbsoluteMeasureResult {
  const isRatio = options?.isRatio !== false;
  const raw = input.staticSignals?.[measurementKind] ?? input.context?.[measurementKind];
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const magnitude = isRatio ? clamp01(n) : Math.round(n);
    const volume = isRatio
      ? clamp01(n)
      : clamp01(magnitude / Math.max(1, options?.volumeDivisor ?? 1));
    return {
      measurementKind,
      magnitude,
      volume,
      rationale: 'host staticSignals/context (quality or sensor signal)',
      status: 'measured',
      policyRole: options?.policyRole,
    };
  }
  return emptyInsufficient(
    measurementKind,
    options?.missingRationale ||
      'Requires host quality/sensor signal (or quality measure-agent); never invent from confidence alone.',
  );
}
