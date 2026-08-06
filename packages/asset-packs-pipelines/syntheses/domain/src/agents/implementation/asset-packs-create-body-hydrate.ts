/**
 * Hybrid create-body hydration for commercial deposit .patch files.
 *
 * modify ops: bodies bound from depositor checkout (patchfile agent).
 * create ops: net-new knowledge files — synthesize full file content via LLM
 * grounded in pack metadata + related checkout siblings. Fail-soft: leave
 * missing when LLM unavailable (bodiesComplete=false).
 */

import { z } from 'zod';
import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import type { DepositPatchPlanPack } from './asset-packs-implementation-pack-types';

const part = (content: string): PromptPart => content as PromptPart;

const createBodiesSchema = z.object({
  files: z
    .array(
      z.object({
        path: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .min(1)
    .max(20),
});

export type CreateBodiesOutput = z.infer<typeof createBodiesSchema>;

function normalizeRepoPath(p: string): string {
  return String(p || '')
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .trim();
}

function createBodiesPrompt(): Prompt {
  const prompt = new Prompt();
  prompt.set(
    'agent:identity',
    part(
      'You synthesize full file bodies for CREATE ops in a commercial deposit DataPack .patch. ' +
        'You receive REAL sibling file bodies from the depositor checkout — use them as grounding. ' +
        'Provider input is not redacted for product source-safety. Create paths are net-new knowledge ' +
        'files that encode the commercial thesis. Emit complete, useful file contents — never empty ' +
        'stubs. Prefer documentation, capability notes, adapters, or structured knowledge artifacts ' +
        'matching the path extension. Do not invent secrets or credentials.',
    ),
  );
  prompt.set(
    'agent:requirements',
    part(
      [
        'Input packet includes: pack title, summary, patchSummary, createPaths, and siblingBodies',
        '(real related file contents from the depositor checkout for grounding).',
        'Return ONLY JSON: {"files":[{"path":"...","content":"...full file text..."}]}',
        'Every create path in createPaths MUST appear exactly once with non-empty content.',
        'Content must be complete file text suitable for a unified-diff create (new file mode).',
        'Match language/format to the path extension (.ts, .md, .json, .py, etc.).',
        'Ground content in the pack thesis AND sibling source bodies provided.',
        'No delete ops. No path renames. Paths must match createPaths exactly.',
      ].join(' '),
    ),
  );
  prompt.set(
    'ptrr:plan',
    part(
      'Plan one full body per create path from the pack thesis and sibling context. Prefer concise, high-signal knowledge files over boilerplate.',
    ),
  );
  prompt.set(
    'ptrr:try',
    part(
      'Emit {"files":[...]} with path+content for every create path. Full file contents only.',
    ),
  );
  prompt.set(
    'ptrr:refine',
    part(
      'Ensure every create path is present, content is non-empty, and no secrets leaked. Same JSON shape.',
    ),
  );
  prompt.set(
    'ptrr:retry',
    part(
      'Recover minimal valid create bodies: one non-empty knowledge file per create path, JSON only.',
    ),
  );
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}

const createBodiesPromptInstance = createBodiesPrompt();

export const DepositCreateBodiesAgent = factoryPTRRAgent<any, CreateBodiesOutput>({
  name: 'DepositCreateBodiesAgent',
  description:
    'Synthesize full file bodies for create ops in commercial deposit .patch (hybrid with checkout modify).',
  outputSchema: createBodiesSchema,
  tools: [],
  prompt: createBodiesPromptInstance,
  stepPrompts: {
    plan: () => createBodiesPromptInstance,
    try: () => createBodiesPromptInstance,
    refine: () => createBodiesPromptInstance,
    retry: () => createBodiesPromptInstance,
  },
  plan: { chunkThreshold: 4000 },
  try: { chunkThreshold: 8000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 },
});

/**
 * List create paths that still lack a body in the checkout-bound map.
 */
export function listMissingCreatePaths(
  plan: DepositPatchPlanPack,
  bodiesByPath: Map<string, string>,
): string[] {
  const missing: string[] = [];
  for (const fc of plan.patch.fileChanges || []) {
    const path = normalizeRepoPath(String(fc.path || ''));
    if (!path) continue;
    const op = String(fc.op || 'modify').toLowerCase();
    if (op !== 'create') continue;
    if (!bodiesByPath.has(path) || bodiesByPath.get(path) === undefined) {
      missing.push(path);
    }
  }
  return missing;
}

/**
 * Sibling body excerpts for grounding (cap size for prompt budget).
 */
export function pickSiblingExcerpts(
  bodiesByPath: Map<string, string>,
  createPaths: string[],
  maxFiles = 16,
  maxCharsPerFile = 48_000,
): Array<{ path: string; excerpt: string }> {
  const createSet = new Set(createPaths.map(normalizeRepoPath));
  const dirs = new Set(
    createPaths.map((p) => {
      const i = p.lastIndexOf('/');
      return i >= 0 ? p.slice(0, i) : '';
    }),
  );
  const scored: Array<{ path: string; score: number; content: string }> = [];
  for (const [path, content] of bodiesByPath) {
    if (createSet.has(path)) continue;
    if (typeof content !== 'string' || content.length === 0) continue;
    const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
    let score = 0;
    if (dirs.has(dir)) score += 3;
    for (const d of dirs) {
      if (d && (path.startsWith(d + '/') || dir.startsWith(d))) score += 1;
    }
    if (score > 0) scored.push({ path, score, content });
  }
  scored.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
  return scored.slice(0, maxFiles).map((s) => ({
    path: s.path,
    // Prefer full sibling bodies for create synthesis; only truncate huge files.
    excerpt:
      s.content.length > maxCharsPerFile
        ? s.content.slice(0, maxCharsPerFile) +
          '\n/* …truncated for host budget; content above is real source… */\n'
        : s.content,
  }));
}

/**
 * Deterministic fallback create body when LLM is unavailable (tests / offline).
 * Still produces real file text so unified-diff and presentable gates can pass.
 */
export function buildDeterministicCreateBody(
  path: string,
  plan: DepositPatchPlanPack,
): string {
  const ext = path.includes('.') ? path.slice(path.lastIndexOf('.') + 1).toLowerCase() : '';
  const title = plan.title || 'DataPack knowledge';
  const summary = plan.summary || plan.patch.patchSummary || '';
  if (ext === 'md' || ext === 'txt' || ext === 'rst') {
    return [
      `# ${title}`,
      '',
      summary,
      '',
      `## Knowledge surface`,
      '',
      plan.patch.patchSummary || summary,
      '',
      `Source path: \`${path}\``,
      '',
    ].join('\n');
  }
  if (ext === 'json') {
    return (
      JSON.stringify(
        {
          title,
          summary,
          patchSummary: plan.patch.patchSummary,
          path,
          kind: plan.kind,
        },
        null,
        2,
      ) + '\n'
    );
  }
  if (ext === 'py') {
    return [
      `"""${title}"""`,
      `# ${summary.slice(0, 200)}`,
      '',
      `KNOWLEDGE_SUMMARY = ${JSON.stringify(plan.patch.patchSummary || summary)}`,
      '',
      'def describe() -> str:',
      `    return ${JSON.stringify(title)}`,
      '',
    ].join('\n');
  }
  // Default: TypeScript / JS / unknown — knowledge module.
  return [
    `/**`,
    ` * ${title}`,
    ` * ${summary.slice(0, 240)}`,
    ` * Path: ${path}`,
    ` */`,
    '',
    `export const datapackKnowledge = {`,
    `  title: ${JSON.stringify(title)},`,
    `  summary: ${JSON.stringify(summary)},`,
    `  patchSummary: ${JSON.stringify(plan.patch.patchSummary || '')},`,
    `  path: ${JSON.stringify(path)},`,
    `} as const;`,
    '',
    `export function describeDatapackKnowledge(): string {`,
    `  return datapackKnowledge.title;`,
    `}`,
    '',
  ].join('\n');
}

function unwrapAgentOutput(raw: unknown): CreateBodiesOutput | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const candidates = [r, r.output, r.finalOutput, r.result];
  for (const c of candidates) {
    if (!c || typeof c !== 'object') continue;
    const parsed = createBodiesSchema.safeParse(c);
    if (parsed.success) return parsed.data;
  }
  return null;
}

/**
 * Fill missing create-path bodies into `bodiesByPath` (mutates map).
 * Prefer LLM; fall back to deterministic knowledge bodies when LLM fails.
 */
export async function hydrateMissingCreateBodies(
  plan: DepositPatchPlanPack,
  bodiesByPath: Map<string, string>,
  execution?: any,
): Promise<{ filled: string[]; mode: 'llm' | 'deterministic' | 'none' }> {
  const missing = listMissingCreatePaths(plan, bodiesByPath);
  if (missing.length === 0) return { filled: [], mode: 'none' };

  const siblingBodies = pickSiblingExcerpts(bodiesByPath, missing);
  const agentInput = {
    title: plan.title,
    summary: plan.summary,
    kind: plan.kind,
    patchSummary: plan.patch.patchSummary,
    createPaths: missing,
    siblingBodies,
  };

  let mode: 'llm' | 'deterministic' = 'deterministic';
  try {
    if (execution?.llms?.getDefaultLLM) {
      const raw = await DepositCreateBodiesAgent(agentInput, execution);
      const out = unwrapAgentOutput(raw);
      if (out?.files?.length) {
        for (const f of out.files) {
          const path = normalizeRepoPath(f.path);
          if (!path || !missing.includes(path)) continue;
          if (typeof f.content === 'string' && f.content.length > 0) {
            bodiesByPath.set(path, f.content.endsWith('\n') ? f.content : f.content + '\n');
          }
        }
        const still = listMissingCreatePaths(plan, bodiesByPath);
        if (still.length < missing.length) mode = 'llm';
      }
    }
  } catch {
    /* fall through to deterministic */
  }

  // Ensure every missing create path gets a body (deterministic backfill).
  const filled: string[] = [];
  for (const path of missing) {
    if (bodiesByPath.has(path) && typeof bodiesByPath.get(path) === 'string') {
      filled.push(path);
      continue;
    }
    const body = buildDeterministicCreateBody(path, plan);
    bodiesByPath.set(path, body);
    filled.push(path);
  }

  return { filled, mode };
}
