/**
 * Schema for deposit Implementation agent 4/4 — commercial natural-language.
 * Buyer-legible title + rich description grounded in full patch bodies + measurements.
 * Provider input may include full file bodies; this schema is the product brief output.
 * Source-safety (unpaid API/UI) is a disclosure law on surfaces, not on LLM inputs.
 */

import { z } from 'zod';

export const depositCommercialNlItemSchema = z.object({
  /** Matches measured pack title for join (or option index via packIndex). */
  packTitle: z.string().min(8).max(200).optional(),
  packIndex: z.coerce.number().int().min(0).max(20).optional(),
  commercialTitle: z.string().min(8).max(160),
  commercialDescription: z.string().min(80).max(6000),
});

export const depositCommercialNlSetSchema = z.object({
  options: z.array(depositCommercialNlItemSchema).min(1).max(4),
});

export type DepositCommercialNlItem = z.infer<typeof depositCommercialNlItemSchema>;
export type DepositCommercialNlSet = z.infer<typeof depositCommercialNlSetSchema>;

/**
 * Project model output onto commercial-NL allowlist.
 */
export function projectCommercialNlSet(raw: unknown): unknown {
  if (raw == null) return raw;
  if (Array.isArray(raw)) {
    return { options: raw.map(projectOne) };
  }
  if (typeof raw !== 'object') return raw;
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.options)) {
    return { options: obj.options.map(projectOne) };
  }
  for (const key of ['output', 'finalOutput', 'result'] as const) {
    const nested = obj[key];
    if (nested && typeof nested === 'object') {
      const projected = projectCommercialNlSet(nested);
      if (
        projected &&
        typeof projected === 'object' &&
        Array.isArray((projected as { options?: unknown }).options)
      ) {
        return projected;
      }
    }
  }
  if (typeof obj.commercialTitle === 'string') {
    return { options: [projectOne(obj)] };
  }
  return obj;
}

function projectOne(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const s = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {
    commercialTitle: s.commercialTitle,
    commercialDescription: s.commercialDescription,
  };
  if (typeof s.packTitle === 'string') out.packTitle = s.packTitle;
  if (s.packIndex !== undefined) out.packIndex = s.packIndex;
  return out;
}

export const depositCommercialNlSetSchemaNormalized: z.ZodType<DepositCommercialNlSet> =
  z.preprocess(
    projectCommercialNlSet,
    depositCommercialNlSetSchema,
  ) as z.ZodType<DepositCommercialNlSet>;
