/**
 * Migrate/scrub historical unpaid READ synthesis execution rows.
 * V48-Gate5-F01 R2: always preserve commercial material as fullOptions
 * (copy from legacy options when fullOptions missing), then unpaid-project
 * browser carriers.
 *
 * Service-role / operator script only — no public HTTP route.
 *
 *   await scrubUnpaidReadExecutionOutputs({ admin, limit: 200 })
 */

import {
  isUnpaidReadSynthesisExecution,
  toUnpaidReadOptionsPresentation,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/unpaid-option-disclosure';

type AdminClient = {
  from: (table: string) => {
    select: (cols: string) => {
      range: (
        from: number,
        to: number,
      ) => Promise<{ data: unknown[] | null; error: { message?: string } | null }>;
    };
    update: (values: Record<string, unknown>) => {
      eq: (
        col: string,
        val: string,
      ) => Promise<{ error: { message?: string } | null }>;
    };
  };
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function looksCommercialOption(opt: unknown): boolean {
  if (!isObject(opt)) return false;
  return (
    'patch' in opt ||
    'coveredSourcePaths' in opt ||
    'fileChanges' in opt ||
    isObject(opt.patch)
  );
}

/**
 * Rewrite a single output: promote commercial material to fullOptions, then
 * unpaid-project options + selectionEnvelope for browser safety.
 */
export function scrubReadOutputPreserveFullOptions(
  output: unknown,
): Record<string, unknown> | null {
  if (!isObject(output)) return null;

  const catalog =
    typeof output.catalogSourcePathCount === 'number'
      ? output.catalogSourcePathCount
      : isObject(output.selectionEnvelope) &&
          typeof output.selectionEnvelope.catalogSourcePathCount === 'number'
        ? output.selectionEnvelope.catalogSourcePathCount
        : null;

  // R2: commercial = existing fullOptions, else legacy options (pre-redact).
  const commercialSource =
    Array.isArray(output.fullOptions) && output.fullOptions.length > 0
      ? output.fullOptions
      : Array.isArray(output.options) && output.options.some(looksCommercialOption)
        ? output.options
        : Array.isArray(output.fullOptions)
          ? output.fullOptions
          : Array.isArray(output.options)
            ? output.options
            : [];

  const unpaid = toUnpaidReadOptionsPresentation(commercialSource, catalog);
  const next: Record<string, unknown> = { ...output };

  if (commercialSource.length > 0) {
    next.fullOptions = commercialSource;
  } else {
    delete next.fullOptions;
  }

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
  } else if (unpaid.length > 0) {
    next.selectionEnvelope = {
      schema: 'bitcode.read.synthesize-asset-packs.selection-envelope',
      options: unpaid,
      disclosure: { class: 'unpaid-title-summary-measurements-only' },
    };
  }

  next.disclosure = {
    class: 'unpaid-title-summary-measurements-only',
    redacted: true,
    scrubbed: true,
  };
  // Do not delete entitledPatch here — settle rows are not scrubbed by classifier.
  return next;
}

export async function scrubUnpaidReadExecutionOutputs(input: {
  admin: AdminClient;
  limit?: number;
  offset?: number;
}): Promise<{ scanned: number; updated: number; errors: string[] }> {
  const limit = Math.min(Math.max(input.limit ?? 100, 1), 500);
  const offset = Math.max(input.offset ?? 0, 0);
  const errors: string[] = [];
  let updated = 0;

  const { data, error } = await input.admin
    .from('executions')
    .select('id, context, output, type')
    .range(offset, offset + limit - 1);

  if (error) {
    return { scanned: 0, updated: 0, errors: [error.message || 'select failed'] };
  }

  const rows = Array.isArray(data) ? data : [];
  for (const row of rows) {
    if (!isObject(row) || typeof row.id !== 'string') continue;
    if (
      !isUnpaidReadSynthesisExecution({
        context: row.context,
        output: row.output,
        type: typeof row.type === 'string' ? row.type : null,
      })
    ) {
      continue;
    }
    const next = scrubReadOutputPreserveFullOptions(row.output);
    if (!next) continue;

    const prev = isObject(row.output) ? row.output : {};
    const prevOptions = Array.isArray(prev.options) ? prev.options : [];
    const needsScrub =
      prevOptions.some(looksCommercialOption) ||
      (!Array.isArray(prev.fullOptions) && prevOptions.some(looksCommercialOption)) ||
      JSON.stringify(prev.options ?? null) !== JSON.stringify(next.options ?? null) ||
      (Array.isArray(next.fullOptions) &&
        !Array.isArray(prev.fullOptions) &&
        next.fullOptions.length > 0);

    if (!needsScrub) continue;

    const { error: updateError } = await input.admin
      .from('executions')
      .update({ output: next })
      .eq('id', row.id);
    if (updateError) {
      errors.push(`${row.id}: ${updateError.message || 'update failed'}`);
    } else {
      updated += 1;
    }
  }

  return { scanned: rows.length, updated, errors };
}
