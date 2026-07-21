#!/usr/bin/env node
/**
 * Operator scrub: rewrite historical unpaid READ synthesis executions.
 * Service-role only. No HTTP surface.
 *
 * From monorepo root:
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *     node scripts/scrub-unpaid-read-outputs.mjs
 *
 * Optional: LIMIT=100 OFFSET=0
 *
 * Resolves @supabase/supabase-js via apps/uapi (pnpm workspace) — root node
 * does not hoist that package for bare ESM imports.
 */

import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(here, '..');
// Resolve through apps/uapi which declares @supabase/supabase-js.
const requireFromUapi = createRequire(resolve(monorepoRoot, 'apps/uapi/package.json'));
const { createClient } = requireFromUapi('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.BITCODE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    'Need SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (service role only).',
  );
  process.exit(1);
}

const limit = Math.min(Math.max(Number(process.env.LIMIT || 100), 1), 500);
const offset = Math.max(Number(process.env.OFFSET || 0), 0);

function isObj(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isUnpaidReadSynthesis(row) {
  const ctx = isObj(row.context) ? row.context : {};
  const out = isObj(row.output) ? row.output : {};
  const source = typeof ctx.source === 'string' ? ctx.source : '';
  const pipeline =
    typeof out.productPipeline === 'string'
      ? out.productPipeline
      : typeof ctx.pipelineCore === 'string'
        ? ctx.pipelineCore
        : '';
  if (source === 'read-settle-asset-pack' || source.includes('settle-asset-pack')) {
    return false;
  }
  if (pipeline.includes('settle-asset-pack')) return false;
  if (source === 'read-synthesize-options') return true;
  if (pipeline.includes('synthesize-reads')) return true;
  return false;
}

function toUnpaid(opt, index) {
  const o = isObj(opt) ? opt : {};
  const m = isObj(o.measurements) ? o.measurements : {};
  return {
    index: typeof o.index === 'number' ? o.index : index,
    kind: typeof o.kind === 'string' ? o.kind : null,
    title: typeof o.title === 'string' ? o.title : null,
    summary: typeof o.summary === 'string' ? o.summary : null,
    confidence: typeof o.confidence === 'number' ? o.confidence : null,
    measurements: {
      absolutes: Array.isArray(m.absolutes) ? m.absolutes : [],
      needinesses: Array.isArray(m.needinesses) ? m.needinesses : [],
    },
    needFit: typeof o.needFit === 'number' ? o.needFit : null,
    disclosure: { class: 'unpaid-title-summary-measurements-only' },
  };
}

function looksCommercial(opt) {
  return isObj(opt) && ('patch' in opt || 'coveredSourcePaths' in opt);
}

function scrubOutput(output) {
  if (!isObj(output)) return null;
  const commercial =
    Array.isArray(output.fullOptions) && output.fullOptions.length
      ? output.fullOptions
      : Array.isArray(output.options) && output.options.some(looksCommercial)
        ? output.options
        : Array.isArray(output.options)
          ? output.options
          : [];
  const unpaid = commercial.map(toUnpaid);
  const next = { ...output, options: unpaid, fullOptions: commercial };
  if (isObj(next.selectionEnvelope)) {
    next.selectionEnvelope = { ...next.selectionEnvelope, options: unpaid };
  }
  next.disclosure = { class: 'unpaid-title-summary-measurements-only', scrubbed: true };
  return next;
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await admin
  .from('executions')
  .select('id, context, output, type')
  .range(offset, offset + limit - 1);

if (error) {
  console.error('select failed', error.message);
  process.exit(1);
}

let updated = 0;
const rows = Array.isArray(data) ? data : [];
for (const row of rows) {
  if (!isUnpaidReadSynthesis(row)) continue;
  const next = scrubOutput(row.output);
  if (!next) continue;
  const prev = isObj(row.output) ? row.output : {};
  const needs =
    (Array.isArray(prev.options) && prev.options.some(looksCommercial)) ||
    (!Array.isArray(prev.fullOptions) &&
      Array.isArray(next.fullOptions) &&
      next.fullOptions.length > 0);
  if (!needs) continue;
  const { error: upErr } = await admin.from('executions').update({ output: next }).eq('id', row.id);
  if (upErr) {
    console.error(row.id, upErr.message);
  } else {
    updated += 1;
    console.log('scrubbed', row.id);
  }
}

console.log(JSON.stringify({ scanned: rows.length, updated, limit, offset }, null, 2));
