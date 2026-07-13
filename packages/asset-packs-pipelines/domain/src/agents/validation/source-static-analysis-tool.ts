/**
 * SourceStaticAnalysisTool — language-generic static source analysis (V48 Gate 3).
 *
 * Measures the intrinsic SIZES of synthesized AssetPacks from real source via
 * deterministic, language-generic regex fact-extraction — inspired by the
 * demonstration (`protocol-demonstration/src/bitcode-demo.js`: symbol / path /
 * config-key extraction + per-unit token counts). Individual analyses (functions,
 * types, symbols, config keys, lines, tokens) composed together, grounding the
 * absolute measuring agent (`agent-measure-absolutes`) so sizes are MEASURED, not
 * model-guessed.
 *
 * Source reality: the deposit-options run has no full clone, so the available
 * source is the inventory SAMPLES (real, truncated source) + the path list. The
 * tool MEASURES per-language density from the sampled source and applies it to the
 * AssetPack's EXACT covered file set (file-span exact; counts = density × covered
 * files by language; `coverageRatio` reported for honesty). The SAME analysis
 * parses richer source verbatim when present (a future full-clone delivery path),
 * so it is generic across repositories of all shapes and sizes.
 *
 * Source-safety: the analysis returns ONLY source-safe COUNTS (no source, no
 * identifiers' surrounding code). The measuring runner invokes `use` DIRECTLY with
 * in-memory samples (never `execute`, which would persist raw args), so raw source
 * never enters telemetry; only the count report grounds the agent.
 */

import { ExecutionTool } from '@bitcode/agent-generics';

export interface StaticAnalysisSourceFile {
  path: string;
  content: string;
}

export interface StaticAnalysisArgs {
  /** Available source to measure (the inventory samples / any present files). */
  files: StaticAnalysisSourceFile[];
  /** The AssetPack's covered source paths — its exact file set. */
  targetPaths: string[];
}

export interface StaticAnalysisLanguageDensity {
  ext: string;
  fileCount: number;
  functionsPerFile: number;
  typesPerFile: number;
}

export interface StaticAnalysisReport {
  /** Files actually parsed from the provided source. */
  sampledFileCount: number;
  lineCount: number;
  tokenCount: number;
  /** Measured over the sampled source (real parse). */
  functionCount: number;
  typeCount: number;
  symbolCount: number;
  configKeyCount: number;
  languageDensities: StaticAnalysisLanguageDensity[];
  /** The AssetPack's covered file set (exact). */
  targetFileCount: number;
  targetLanguageBreakdown: Record<string, number>;
  /** Density applied to the covered set (exact where the covered file was sampled). */
  estimatedFunctionCount: number;
  estimatedTypeCount: number;
  /** Unique-symbol estimate for covered files (symbolic richness magnitude). */
  estimatedSymbolCount: number;
  /** Distinct top-level path modules among covered paths (modularity magnitude). */
  moduleCount: number;
  /** Fraction of covered files that were directly sampled (0..1). */
  coverageRatio: number;
  /** False when no source was available (counts are zero / path-only). */
  measuredFromSamples: boolean;
}

// Normalize a path's extension to a canonical language key.
const EXT_ALIASES: Record<string, string> = {
  tsx: 'ts', mts: 'ts', cts: 'ts',
  js: 'ts', jsx: 'ts', mjs: 'ts', cjs: 'ts',
  cs: 'java', kt: 'java', kts: 'java', scala: 'java',
  rb: 'rb',
  py: 'py', pyi: 'py',
  rs: 'rs',
  go: 'go',
};

function extOf(path: string): string {
  const base = path.split('/').pop() || path;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return '';
  const raw = base.slice(dot + 1).toLowerCase();
  return EXT_ALIASES[raw] ?? raw;
}

// Function / type declaration patterns, per canonical language. Each list is
// counted by summing /g matches. Patterns are deterministic approximations (a
// measured SIGNAL, not an AST) and fall back to a generic keyword scan.
const FUNCTION_PATTERNS: Record<string, RegExp[]> = {
  ts: [/\bfunction\b/g, /=>/g],
  py: [/^[ \t]*(?:async[ \t]+)?def[ \t]+\w+/gm],
  rs: [/\bfn[ \t]+\w+/g],
  go: [/\bfunc\b/g],
  rb: [/^[ \t]*def[ \t]+\w+/gm],
  java: [/\b(?:public|private|protected|static|final)\b[^;=]*?\b\w+[ \t]*\([^)]*\)[ \t]*\{/g],
};
const TYPE_PATTERNS: Record<string, RegExp[]> = {
  ts: [/\b(?:interface|type|enum|class)[ \t]+[A-Za-z_$]/g],
  py: [/^[ \t]*class[ \t]+\w+/gm],
  rs: [/\b(?:struct|enum|trait|union)[ \t]+\w+/g, /\btype[ \t]+\w+[ \t]*=/g],
  go: [/\btype[ \t]+\w+[ \t]+(?:struct|interface)\b/g],
  java: [/\b(?:class|interface|enum|record)[ \t]+\w+/g],
  rb: [/^[ \t]*(?:class|module)[ \t]+\w+/gm],
};
const GENERIC_FUNCTION: RegExp[] = [/\b(?:function|def|fn|func)\b[ \t]+\w+/g];
const GENERIC_TYPE: RegExp[] = [/\b(?:class|struct|interface|enum|trait|record)\b[ \t]+\w+/g];

// Demonstration-style fact regexes (bitcode-demo.js).
const SYMBOL_RE = /\b[A-Z][A-Za-z0-9]+\b|\b[a-z]+(?:[A-Z][A-Za-z0-9]+)+\b/g;
const CONFIG_KEY_RE = /\b[a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+\b/g;

function countMatches(content: string, patterns: RegExp[]): number {
  let total = 0;
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) total += matches.length;
  }
  return total;
}

function uniqueCount(content: string, re: RegExp): number {
  const matches = content.match(re);
  if (!matches) return 0;
  return new Set(matches).size;
}

interface FileAnalysis {
  path: string;
  ext: string;
  lines: number;
  tokens: number;
  functions: number;
  types: number;
  symbols: number;
  configKeys: number;
}

/** Analyze ONE source file (individual analyses composed). Source-safe: counts only. */
export function analyzeStaticSourceFile(file: StaticAnalysisSourceFile): FileAnalysis {
  const content = typeof file.content === 'string' ? file.content : '';
  const ext = extOf(file.path);
  const functions = countMatches(content, FUNCTION_PATTERNS[ext] ?? GENERIC_FUNCTION);
  const types = countMatches(content, TYPE_PATTERNS[ext] ?? GENERIC_TYPE);
  const symbols = uniqueCount(content, SYMBOL_RE);
  const configKeys = uniqueCount(content, CONFIG_KEY_RE);
  const lines = content ? content.split(/\r?\n/).length : 0;
  const tokens = new Set(content.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)).size;
  return { path: file.path, ext, lines, tokens, functions, types, symbols, configKeys };
}

/**
 * Measure the static-analysis report for an AssetPack's covered file set, grounded
 * in whatever source is available. Pure + deterministic; exported for testing and
 * for the deterministic measurement fallback.
 */
export function analyzeStaticSource(args: StaticAnalysisArgs): StaticAnalysisReport {
  const files = Array.isArray(args.files) ? args.files : [];
  const targetPaths = [...new Set((args.targetPaths || []).map((p) => String(p).trim()).filter(Boolean))];

  const analyses = files.map(analyzeStaticSourceFile);
  const byPath = new Map(analyses.map((a) => [a.path, a]));

  const functionCount = analyses.reduce((s, a) => s + a.functions, 0);
  const typeCount = analyses.reduce((s, a) => s + a.types, 0);
  const symbolCount = analyses.reduce((s, a) => s + a.symbols, 0);
  const configKeyCount = analyses.reduce((s, a) => s + a.configKeys, 0);
  const lineCount = analyses.reduce((s, a) => s + a.lines, 0);
  const tokenCount = analyses.reduce((s, a) => s + a.tokens, 0);

  // Per-language densities measured from the samples.
  const byExt = new Map<string, { fileCount: number; functions: number; types: number }>();
  for (const a of analyses) {
    const e = byExt.get(a.ext) ?? { fileCount: 0, functions: 0, types: 0 };
    e.fileCount += 1;
    e.functions += a.functions;
    e.types += a.types;
    byExt.set(a.ext, e);
  }
  const languageDensities: StaticAnalysisLanguageDensity[] = [...byExt.entries()].map(([ext, e]) => ({
    ext,
    fileCount: e.fileCount,
    functionsPerFile: e.fileCount ? e.functions / e.fileCount : 0,
    typesPerFile: e.fileCount ? e.types / e.fileCount : 0,
  }));
  const globalFnPerFile = analyses.length ? functionCount / analyses.length : 0;
  const globalTypePerFile = analyses.length ? typeCount / analyses.length : 0;
  const densityFor = (ext: string) => byExt.get(ext)
    ? {
        fn: byExt.get(ext)!.fileCount ? byExt.get(ext)!.functions / byExt.get(ext)!.fileCount : globalFnPerFile,
        type: byExt.get(ext)!.fileCount ? byExt.get(ext)!.types / byExt.get(ext)!.fileCount : globalTypePerFile,
      }
    : { fn: globalFnPerFile, type: globalTypePerFile };

  // The AssetPack's covered file set: exact counts where the file was sampled,
  // measured density elsewhere.
  const targetLanguageBreakdown: Record<string, number> = {};
  let estFunctions = 0;
  let estTypes = 0;
  let estSymbols = 0;
  let sampledTargets = 0;
  const globalSymbolsPerFile = analyses.length ? symbolCount / analyses.length : 0;
  for (const path of targetPaths) {
    const ext = extOf(path);
    targetLanguageBreakdown[ext] = (targetLanguageBreakdown[ext] ?? 0) + 1;
    const sampled = byPath.get(path);
    if (sampled) {
      sampledTargets += 1;
      estFunctions += sampled.functions;
      estTypes += sampled.types;
      estSymbols += sampled.symbols;
    } else {
      const d = densityFor(ext);
      estFunctions += d.fn;
      estTypes += d.type;
      estSymbols += globalSymbolsPerFile;
    }
  }

  // Modularity: distinct top-level path segments among covered files.
  const modules = new Set<string>();
  for (const path of targetPaths) {
    const normalized = path.replace(/^\/+/, '');
    const slash = normalized.indexOf('/');
    modules.add(slash === -1 ? normalized : normalized.slice(0, slash));
  }

  return {
    sampledFileCount: analyses.length,
    lineCount,
    tokenCount,
    functionCount,
    typeCount,
    symbolCount,
    configKeyCount,
    languageDensities,
    targetFileCount: targetPaths.length,
    targetLanguageBreakdown,
    estimatedFunctionCount: Math.round(estFunctions),
    estimatedTypeCount: Math.round(estTypes),
    estimatedSymbolCount: Math.round(estSymbols),
    moduleCount: modules.size || targetPaths.length || 0,
    coverageRatio: targetPaths.length ? Number((sampledTargets / targetPaths.length).toFixed(2)) : 0,
    measuredFromSamples: analyses.length > 0,
  };
}

/**
 * The registered static-analysis capability. `use` delegates to the pure
 * analyzer. The measuring runner calls `use` DIRECTLY (source stays in memory);
 * `execute` (which persists args) is intentionally not used with raw source.
 */
export class SourceStaticAnalysisTool extends ExecutionTool<
  (args: StaticAnalysisArgs) => Promise<StaticAnalysisReport>
> {
  use = async (args: StaticAnalysisArgs): Promise<StaticAnalysisReport> => analyzeStaticSource(args);
}

/** Registry key for the source static-analysis tool. */
export const SOURCE_STATIC_ANALYSIS_TOOL_KEY = 'asset-pack:static-analysis:source';

/**
 * Register the source static-analysis tool through the AgentToolsRegistry
 * add/replace hierarchy: priority-keyed (same priority REPLACES, higher
 * OVERRIDES); resolution is local-then-parent. The base generic analyzer registers
 * at priority 0; an augmenting/specialized analyzer registers at a higher priority
 * WITHOUT replacing the base. Returns the registered tool.
 */
export function registerSourceStaticAnalysisTool(
  execution: any,
  tool: SourceStaticAnalysisTool = new SourceStaticAnalysisTool(),
  priority = 0,
): SourceStaticAnalysisTool {
  try {
    execution?.tools?.registerTool?.(SOURCE_STATIC_ANALYSIS_TOOL_KEY, tool, priority);
  } catch {}
  return tool;
}

/** Resolve the static-analysis tool (local-then-parent), or undefined. */
export function resolveSourceStaticAnalysisTool(execution: any): SourceStaticAnalysisTool | undefined {
  try {
    return execution?.tools?.getTool?.(SOURCE_STATIC_ANALYSIS_TOOL_KEY) as SourceStaticAnalysisTool | undefined;
  } catch {
    return undefined;
  }
}
