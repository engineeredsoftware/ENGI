/**
 * Bare absolute measure: `function-count` of a synthesized **DataPack**.
 * Multi-language declaration heuristics aligned with host static analysis.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'function-count' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'function-count' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'count' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

const EXT_ALIASES: Record<string, string> = {
  tsx: 'ts',
  mts: 'ts',
  cts: 'ts',
  js: 'ts',
  jsx: 'ts',
  mjs: 'ts',
  cjs: 'ts',
  py: 'py',
  pyi: 'py',
  rs: 'rs',
  go: 'go',
  rb: 'rb',
  java: 'java',
  kt: 'java',
  kts: 'java',
};

const FUNCTION_PATTERNS: Record<string, RegExp[]> = {
  ts: [/\bfunction\b/g, /\b(?:async\s+)?(?:function\s*)?\w+\s*\([^)]*\)\s*\{/g, /=>/g],
  py: [/^[ \t]*(?:async[ \t]+)?def[ \t]+\w+/gm],
  rs: [/\bfn[ \t]+\w+/g],
  go: [/\bfunc\b/g],
  rb: [/^[ \t]*def[ \t]+\w+/gm],
  java: [/\b(?:public|private|protected|static|final)\b[^;=]*?\b\w+[ \t]*\([^)]*\)[ \t]*\{/g],
};

function langOf(filePath: string): string {
  const base = filePath.split('/').pop() || filePath;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return 'ts';
  const raw = base.slice(dot + 1).toLowerCase();
  return EXT_ALIASES[raw] ?? raw;
}

function countFunctions(path: string, content: string): number {
  const lang = langOf(path);
  const patterns = FUNCTION_PATTERNS[lang] || FUNCTION_PATTERNS.ts;
  let n = 0;
  for (const re of patterns) {
    const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
    const copy = new RegExp(re.source, flags);
    n += (content.match(copy) || []).length;
  }
  return n;
}

export function measureAbsoluteFunctionCount(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['function-count']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'function-count',
      magnitude,
      volume: clamp01(magnitude / 40),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'weighted',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('function-count');
  let magnitude = 0;
  for (const file of sources) {
    magnitude += countFunctions(file.path || '', file.content || '');
  }
  magnitude = Math.round(magnitude);
  return {
    measurementKind: 'function-count',
    magnitude,
    volume: clamp01(magnitude / 40),
    rationale: 'multi-language declaration heuristics over measure source set',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteFunctionCount;
