/**
 * Migrate/scrub historical unpaid READ synthesis execution rows.
 * V48-Gate5-F01: store only unpaid browser carriers; keep fullOptions if
 * present for settle rehydrate — but rewrite options/selectionEnvelope to
 * unpaid form so raw DB dumps are safer. History API also redacts on read.
 *
 * Usage (server/admin only):
 *   await scrubUnpaidReadExecutionOutputs({ admin, limit: 200 })
 */

import {
  isUnpaidReadSynthesisExecution,
  scrubStoredUnpaidReadOutput,
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

/**
 * Rewrite a single output: unpaid options + selectionEnvelope, but retain
 * fullOptions for server settle rehydrate when present.
 */
export function scrubReadOutputPreserveFullOptions(
  output: unknown,
): Record<string, unknown> | null {
  if (!isObject(output)) return null;
  const redacted = scrubStoredUnpaidReadOutput(output);
  if (!redacted) return null;
  // Restore fullOptions for settle rehydrate when original had them.
  if (Array.isArray(output.fullOptions) && output.fullOptions.length > 0) {
    redacted.fullOptions = output.fullOptions;
    // Ensure browser options stay unpaid even if fullOptions retained in DB.
    const catalog =
      typeof output.catalogSourcePathCount === 'number'
        ? output.catalogSourcePathCount
        : null;
    redacted.options = toUnpaidReadOptionsPresentation(output.fullOptions, catalog);
    if (isObject(redacted.selectionEnvelope)) {
      redacted.selectionEnvelope = {
        ...redacted.selectionEnvelope,
        options: redacted.options,
      };
    }
  }
  return redacted;
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
    const first = Array.isArray(prev.options) ? prev.options[0] : null;
    const needsScrub =
      (isObject(first) &&
        ('patch' in first ||
          'coveredSourcePaths' in first ||
          'fileChanges' in first)) ||
      (Array.isArray(prev.options) &&
        JSON.stringify(prev.options) !== JSON.stringify(next.options));
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
