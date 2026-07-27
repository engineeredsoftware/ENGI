/**
 * Zod schemas for deposit Implementation agent 1/2 —
 * deposit-implementation-agent-asset-packs-patchfile-synthesis.
 *
 * Deposit patchfile candidate = allowlisted fields only:
 *   kind, title, summary, coveredSourcePaths, confidence, patch
 *
 * Absolute measurements are agent 2/2. Deposit does not model Read measurement
 * kinds. Unknown keys from the model are dropped by projection (allowlist),
 * not scrubbed by name.
 */

import { z } from 'zod';

export const DEPOSIT_OPTION_KINDS = [
  'capability-slice',
  'implementation-pattern',
  'proof-operations-slice',
] as const;

export type DepositOptionKind = (typeof DEPOSIT_OPTION_KINDS)[number];

/**
 * Plan-step patch *output* shape: path + op + summary only.
 * File bodies are bound by the patchfile agent (checkout modify + create hydrate),
 * not emitted in plan PTRR output. This is pipeline staging — not a ban on
 * sending real source to LLM providers during measure/commercial/create steps.
 * Commercial deposit packs: create|modify only (no delete).
 */
export const depositPatchSchema = z.object({
  fileChanges: z
    .array(
      z.object({
        path: z.string().min(1),
        // Commercial deposit .patch: create|modify only — no deletions.
        op: z.enum(['create', 'modify']),
      }),
    )
    .min(1),
  patchSummary: z.string().min(1),
});

function coerceOptionKind(raw: unknown): DepositOptionKind {
  const s = String(raw ?? '').trim();
  if ((DEPOSIT_OPTION_KINDS as readonly string[]).includes(s)) {
    return s as DepositOptionKind;
  }
  const lower = s.toLowerCase();
  if (lower.includes('proof') || lower.includes('test') || lower.includes('ops')) {
    return 'proof-operations-slice';
  }
  if (lower.includes('pattern') || lower.includes('implement')) {
    return 'implementation-pattern';
  }
  return 'capability-slice';
}

/** Legal keys on a deposit patchfile candidate (agent 1/2). */
export const DEPOSIT_PATCHFILE_CANDIDATE_KEYS = [
  'kind',
  'title',
  'summary',
  'coveredSourcePaths',
  'confidence',
  'patch',
] as const;

/**
 * Project an arbitrary model object onto the deposit patchfile allowlist.
 * Unknown keys are discarded — deposit never carries non-patchfile product fields.
 */
export function projectDepositPatchfileCandidate(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const src = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of DEPOSIT_PATCHFILE_CANDIDATE_KEYS) {
    if (key in src) out[key] = src[key];
  }
  // Patch: allowlist path+op only inside fileChanges.
  if (out.patch && typeof out.patch === 'object' && !Array.isArray(out.patch)) {
    const patch = out.patch as Record<string, unknown>;
    const fileChanges = Array.isArray(patch.fileChanges)
      ? (patch.fileChanges as unknown[])
          .filter((fc) => fc && typeof fc === 'object')
          .map((fc) => {
            const row = fc as Record<string, unknown>;
            const opRaw = String(row.op ?? 'modify').toLowerCase();
            // Drop delete; coerce unknown ops to modify (deposit commercial law).
            if (opRaw === 'delete') return null;
            const op = opRaw === 'create' ? 'create' : 'modify';
            return { path: row.path, op };
          })
          .filter(Boolean)
      : patch.fileChanges;
    out.patch = {
      fileChanges,
      patchSummary: patch.patchSummary,
    };
  }
  return out;
}

/** Patchfile candidate — LLM product shape for agent 1/2. */
export const depositCandidateSchema = z.object({
  kind: z.preprocess(coerceOptionKind, z.enum(DEPOSIT_OPTION_KINDS)),
  title: z.string().min(8).max(160),
  summary: z.string().min(40).max(900),
  coveredSourcePaths: z.array(z.string().min(1)).min(1).max(40),
  confidence: z.coerce.number().min(0).max(1),
  patch: depositPatchSchema,
});

/**
 * Normalize common model mis-shapes then project each candidate to the allowlist.
 */
export function normalizeDepositCandidateSetInput(raw: unknown): unknown {
  if (raw == null) return raw;

  const projectArray = (arr: unknown[]): { options: unknown[] } => ({
    options: arr.map(projectDepositPatchfileCandidate),
  });

  if (Array.isArray(raw)) {
    return projectArray(raw);
  }
  if (typeof raw !== 'object') return raw;
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.options)) {
    return { options: obj.options.map(projectDepositPatchfileCandidate) };
  }
  for (const key of ['assetPacks', 'candidates', 'packs', 'asset_packs', 'results'] as const) {
    if (Array.isArray(obj[key])) {
      return projectArray(obj[key] as unknown[]);
    }
  }
  for (const key of ['output', 'finalOutput', 'result'] as const) {
    const nested = obj[key];
    if (nested && typeof nested === 'object') {
      const normalized = normalizeDepositCandidateSetInput(nested);
      if (
        normalized &&
        typeof normalized === 'object' &&
        Array.isArray((normalized as { options?: unknown }).options)
      ) {
        return normalized;
      }
    }
  }
  if (
    typeof obj.title === 'string' &&
    obj.patch &&
    typeof obj.patch === 'object' &&
    !Array.isArray(obj.patch)
  ) {
    return projectArray([obj]);
  }
  return obj;
}

const depositCandidateSetObjectSchema = z.object({
  options: z.array(depositCandidateSchema).min(1).max(4),
});

export type DepositSynthesisOptions = z.infer<typeof depositCandidateSetObjectSchema>;
export type DepositPatchfileOptionSet = DepositSynthesisOptions;

export const depositCandidateSetSchema: z.ZodType<DepositSynthesisOptions> = z.preprocess(
  normalizeDepositCandidateSetInput,
  depositCandidateSetObjectSchema,
) as z.ZodType<DepositSynthesisOptions>;
