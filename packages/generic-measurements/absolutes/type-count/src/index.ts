/**
 * Bare absolute measure: `type-count` of a synthesized **DataPack**.
 * Multi-language type/class declaration heuristics aligned with host static analysis.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'type-count' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'type-count' as const;
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
  java: 'java',
  kt: 'java',
};

const TYPE_PATTERNS: Record<string, RegExp[]> = {
  ts: [/\b(?:interface|type|enum|class)[ \t]+[A-Za-z_$]/g],
  py: [/^[ \t]*class[ \t]+\w+/gm],
  rs: [/\b(?:struct|enum|trait|union)[ \t]+\w+/g, /\btype[ \t]+\w+[ \t]*=/g],
  go: [/\btype[ \t]+\w+[ \t]+(?:struct|interface)\b/g],
  java: [/\b(?:class|interface|enum|record)[ \t]+\w+/g],
};

function langOf(filePath: string): string {
  const base = filePath.split('/').pop() || filePath;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return 'ts';
  const raw = base.slice(dot + 1).toLowerCase();
  return EXT_ALIASES[raw] ?? raw;
}

function countTypes(path: string, content: string): number {
  const lang = langOf(path);
  const patterns = TYPE_PATTERNS[lang] || TYPE_PATTERNS.ts;
  let n = 0;
  for (const re of patterns) {
    const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
    const copy = new RegExp(re.source, flags);
    n += (content.match(copy) || []).length;
  }
  return n;
}

export function measureAbsoluteTypeCount(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['type-count']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'type-count',
      magnitude,
      volume: clamp01(magnitude / 24),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'weighted',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('type-count');
  let magnitude = 0;
  for (const file of sources) {
    magnitude += countTypes(file.path || '', file.content || '');
  }
  magnitude = Math.round(magnitude);
  return {
    measurementKind: 'type-count',
    magnitude,
    volume: clamp01(magnitude / 24),
    rationale: 'multi-language type/class heuristics over measure source set',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteTypeCount;
