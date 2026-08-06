/**
 * Unpaid commercial disclosure law (V48 Gate 5 source-safety).
 *
 * Unsettled READ options may present only title + summary + measurements
 * (absolutes / needinesses / needFit / confidence) plus optional coverage %
 * of the request-SHA source catalog. Forbidden in browser-facing carriers:
 * covered path names, path-ops, patch bodies/diffs/summaries, downloads,
 * host source. Path-like tokens in measure labels/rationale are stripped.
 *
 * Full commercial material unlocks only after settle (PR/delivery + rich
 * entitled Packs download). Server may retain fullOptions for rehydrate.
 *
 * Deposit owners may always see their own packs fully — this module is for
 * unpaid READ (and non-owner product surfaces), not owner deposit review.
 */

const FORBIDDEN_OPTION_KEYS = new Set([
  'patch',
  'patchArtifact',
  'patchfile',
  'fileChanges',
  'contents',
  'coveredSourcePaths',
  'coveredSourcePathCount',
  'provenantSourcePaths',
  'provenantSourceCount',
  'sourcePaths',
  'sources',
  'fileBodies',
  'diff',
  'rawSource',
  'sourceText',
  'code',
  'body',
  'fullOptions',
  'entitledPatch',
  'measurementRationale',
  'reviewProjections',
]);

/** Path-like tokens scrubbed from measure labels / rationale (unpaid). */
const PATH_LIKE =
  /(?:[A-Za-z0-9_.@-]+\/)+[A-Za-z0-9_.@-]+(?:\.[A-Za-z0-9]+)?|(?:src|lib|app|apps|packages|tests?|scripts?)\/[A-Za-z0-9_./-]+/g;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function scrubPathTokens(text: string): string {
  if (!text) return text;
  return text.replace(PATH_LIKE, '[path]').replace(/\s{2,}/g, ' ').trim();
}

function scrubReadingRow(row: unknown): Record<string, unknown> | null {
  if (!isObject(row)) return null;
  const next: Record<string, unknown> = { ...row };
  for (const key of ['label', 'rationale', 'summary', 'description', 'note'] as const) {
    if (typeof next[key] === 'string') {
      next[key] = scrubPathTokens(next[key] as string);
    }
  }
  // Never leak path fields nested under a measurement row.
  delete next.path;
  delete next.paths;
  delete next.filePath;
  delete next.sourcePath;
  return next;
}

function scrubReadings(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  return value.map(scrubReadingRow).filter(Boolean) as Record<string, unknown>[];
}

/**
 * Coverage of covered paths over the product source catalog at request SHA.
 * Omit when either side is missing / non-positive (never invent raw counts).
 */
export function computeCoverageRatio(input: {
  coveredPathCount?: number | null;
  catalogSourcePathCount?: number | null;
}): number | null {
  if (
    typeof input.coveredPathCount !== 'number' ||
    typeof input.catalogSourcePathCount !== 'number'
  ) {
    return null;
  }
  const covered = input.coveredPathCount;
  const total = input.catalogSourcePathCount;
  if (!Number.isFinite(covered) || !Number.isFinite(total) || total <= 0 || covered < 0) {
    return null;
  }
  return Math.min(1, covered / total);
}

/**
 * Project one option to unpaid-safe browser presentation.
 */
export function toUnpaidReadOptionPresentation(
  opt: unknown,
  index = 0,
  catalogSourcePathCount?: number | null,
): Record<string, unknown> {
  const o = isObject(opt) ? opt : {};
  const measurementsIn = isObject(o.measurements) ? o.measurements : {};
  const absolutes = scrubReadings(
    Array.isArray(measurementsIn.absolutes)
      ? measurementsIn.absolutes
      : Array.isArray(o.absolutes)
        ? o.absolutes
        : [],
  );
  const needinesses = scrubReadings(
    Array.isArray(measurementsIn.needinesses)
      ? measurementsIn.needinesses
      : Array.isArray(o.needinesses)
        ? o.needinesses
        : [],
  );

  const coveredPaths = Array.isArray(o.coveredSourcePaths)
    ? o.coveredSourcePaths.filter((p) => typeof p === 'string')
    : [];
  const coverageRatio = computeCoverageRatio({
    coveredPathCount: coveredPaths.length,
    catalogSourcePathCount:
      typeof catalogSourcePathCount === 'number'
        ? catalogSourcePathCount
        : typeof o.catalogSourcePathCount === 'number'
          ? o.catalogSourcePathCount
          : null,
  });

  const presentation: Record<string, unknown> = {
    index: typeof o.index === 'number' ? o.index : index,
    kind: typeof o.kind === 'string' ? o.kind : null,
    title: typeof o.title === 'string' ? scrubPathTokens(o.title) : null,
    summary: typeof o.summary === 'string' ? scrubPathTokens(o.summary) : null,
    confidence: typeof o.confidence === 'number' ? o.confidence : null,
    measurements: { absolutes, needinesses },
    needFit: typeof o.needFit === 'number' ? o.needFit : null,
    selectable: o.selectable !== false,
    settleable: o.settleable !== false,
    disclosure: {
      class: 'unpaid-title-summary-measurements-only',
      patchVisible: false,
      pathsVisible: false,
      downloadAllowed: false,
      unlockAfter: 'settle',
    },
  };

  if (coverageRatio !== null) {
    presentation.coverageRatio = coverageRatio;
    // Percent 0–100 for UI convenience; still no path names / raw counts.
    presentation.coveragePercent = Math.round(coverageRatio * 1000) / 10;
  }

  return presentation;
}

export function toUnpaidReadOptionsPresentation(
  options: unknown,
  catalogSourcePathCount?: number | null,
): Record<string, unknown>[] {
  if (!Array.isArray(options)) return [];
  return options.map((opt, i) =>
    toUnpaidReadOptionPresentation(opt, i, catalogSourcePathCount),
  );
}

/** True if a serialized option/payload still contains forbidden unpaid keys. */
export function unpaidOptionContainsForbiddenFields(value: unknown, depth = 0): boolean {
  if (depth > 8 || value == null) return false;
  if (Array.isArray(value)) {
    return value.some((entry) => unpaidOptionContainsForbiddenFields(entry, depth + 1));
  }
  if (!isObject(value)) return false;
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_OPTION_KEYS.has(key)) return true;
    if (unpaidOptionContainsForbiddenFields(entry, depth + 1)) return true;
  }
  return false;
}

/**
 * Build dual finish carriers for READ:
 * - selectionEnvelope.options / unpaidOptions for browser
 * - fullOptions retained for server settle rehydrate (not for client hydrate)
 */
export function buildUnpaidReadSelectionEnvelope(input: {
  options: unknown[];
  need?: string | null;
  repositoryFullName?: string | null;
  readyToPresent?: boolean;
  validationSummary?: string | null;
  catalogSourcePathCount?: number | null;
}): {
  selectionEnvelope: Record<string, unknown>;
  unpaidOptions: Record<string, unknown>[];
  fullOptions: unknown[];
} {
  const fullOptions = Array.isArray(input.options) ? input.options : [];
  const unpaidOptions = toUnpaidReadOptionsPresentation(
    fullOptions,
    input.catalogSourcePathCount,
  );
  const selectionEnvelope = {
    schema: 'bitcode.read.synthesize-asset-packs.selection-envelope',
    surface: '/reads',
    purpose: 'user-select-options-to-settle',
    nextPipeline: 'settle-asset-pack-pipeline',
    need: input.need ?? null,
    repositoryFullName: input.repositoryFullName ?? null,
    catalogSourcePathCount:
      typeof input.catalogSourcePathCount === 'number' ? input.catalogSourcePathCount : null,
    options: unpaidOptions,
    readyToPresent: input.readyToPresent !== false,
    validationSummary: input.validationSummary ?? null,
    disclosure: {
      class: 'unpaid-title-summary-measurements-only',
      note: 'Patch paths and material unlock only after settle (PR/delivery + entitled Packs download).',
    },
  };
  return { selectionEnvelope, unpaidOptions, fullOptions };
}

/**
 * Redact a read-synthesis execution output for browser history forever.
 * Drops fullOptions and projects options / selectionEnvelope to unpaid form.
 * Safe to call on already-redacted payloads (idempotent).
 */
export function redactUnpaidReadExecutionOutput(output: unknown): Record<string, unknown> | null {
  if (!isObject(output)) return null;
  const next: Record<string, unknown> = { ...output };

  const catalog =
    typeof next.catalogSourcePathCount === 'number'
      ? next.catalogSourcePathCount
      : isObject(next.selectionEnvelope) &&
          typeof next.selectionEnvelope.catalogSourcePathCount === 'number'
        ? next.selectionEnvelope.catalogSourcePathCount
        : null;

  // Prefer fullOptions for coverage if still present (server row not scrubbed);
  // after scrub, re-project unpaid from whatever remains.
  const sourceForProjection =
    Array.isArray(next.fullOptions) && next.fullOptions.length > 0
      ? next.fullOptions
      : Array.isArray(next.options)
        ? next.options
        : isObject(next.selectionEnvelope) && Array.isArray(next.selectionEnvelope.options)
          ? next.selectionEnvelope.options
          : [];

  const unpaid = toUnpaidReadOptionsPresentation(sourceForProjection, catalog);

  delete next.fullOptions;
  delete next.entitledPatch;
  next.options = unpaid;
  if (isObject(next.selectionEnvelope)) {
    next.selectionEnvelope = {
      ...next.selectionEnvelope,
      options: unpaid,
      disclosure: {
        class: 'unpaid-title-summary-measurements-only',
        note: 'Patch paths and material unlock only after settle.',
      },
    };
  }
  next.disclosure = {
    class: 'unpaid-title-summary-measurements-only',
    redacted: true,
  };
  return next;
}

/**
 * True when an execution row is unpaid READ **synthesis** (must redact for history).
 * Never match settle rows: they also use route /reads and synthesisMode read.
 * V48-Gate5-F01 remediation R1.
 */
export function isUnpaidReadSynthesisExecution(input: {
  context?: unknown;
  output?: unknown;
  type?: string | null;
}): boolean {
  const ctx = isObject(input.context) ? input.context : {};
  const out = isObject(input.output) ? input.output : {};
  const source = typeof ctx.source === 'string' ? ctx.source : '';
  const pipeline =
    typeof out.productPipeline === 'string'
      ? out.productPipeline
      : typeof ctx.pipelineCore === 'string'
        ? ctx.pipelineCore
        : '';

  // Explicit settle exclusions (settle shares route/synthesisMode with read).
  if (source === 'read-settle-asset-pack' || source.includes('settle-asset-pack')) {
    return false;
  }
  if (
    pipeline === 'settle-asset-pack-pipeline' ||
    pipeline.includes('settle-asset-pack')
  ) {
    return false;
  }

  // Synthesis-only positive matches — never synthesisMode alone.
  if (source === 'read-synthesize-options') return true;
  if (pipeline === 'synthesize-reads-asset-packs-pipeline') return true;
  if (pipeline.includes('synthesize-reads')) return true;
  return false;
}

/**
 * Scrub stored row shape for migrate: replace output with redacted unpaid form.
 * Call with admin client when rewriting historical executions.
 */
export function scrubStoredUnpaidReadOutput(output: unknown): Record<string, unknown> | null {
  return redactUnpaidReadExecutionOutput(output);
}
