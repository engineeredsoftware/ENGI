#!/usr/bin/env node
/**
 * Operator scrub: rewrite historical unpaid READ synthesis executions.
 * Service-role only. No HTTP surface.
 *
 * From monorepo root:
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *     node scripts/scrub-unpaid-read-outputs.mjs
 *
 * Optional env:
 *   LIMIT=100 OFFSET=0
 *   DRY_RUN=1          — classify/report only, no writes
 *   VERBOSE=1          — per-row reasons
 *   ALL_PAGES=1        — walk the table in LIMIT-sized pages until empty
 *
 * Resolves @supabase/supabase-js via apps/uapi (pnpm workspace).
 */

import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(here, '..');
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

const pageSize = Math.min(Math.max(Number(process.env.LIMIT || 100), 1), 500);
const startOffset = Math.max(Number(process.env.OFFSET || 0), 0);
const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const verbose = process.env.VERBOSE === '1' || process.env.VERBOSE === 'true';
const allPages = process.env.ALL_PAGES === '1' || process.env.ALL_PAGES === 'true';

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
  if (!isObj(opt)) return false;
  if ('patch' in opt && opt.patch != null) return true;
  if (Array.isArray(opt.coveredSourcePaths) && opt.coveredSourcePaths.length > 0) return true;
  if (Array.isArray(opt.fileChanges) && opt.fileChanges.length > 0) return true;
  if (isObj(opt.contents) && Array.isArray(opt.contents.fileChanges)) return true;
  return false;
}

function optionBagHasCommercial(options) {
  return Array.isArray(options) && options.some(looksCommercial);
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
  } else if (unpaid.length > 0) {
    next.selectionEnvelope = {
      schema: 'bitcode.read.synthesize-asset-packs.selection-envelope',
      options: unpaid,
      disclosure: { class: 'unpaid-title-summary-measurements-only' },
    };
  }
  next.disclosure = { class: 'unpaid-title-summary-measurements-only', scrubbed: true };
  return next;
}

/** Why this read-synthesis row should or should not be rewritten. */
function classifyNeeds(prev, next) {
  const reasons = [];
  const prevOptions = Array.isArray(prev.options) ? prev.options : [];
  const envOptions = isObj(prev.selectionEnvelope) && Array.isArray(prev.selectionEnvelope.options)
    ? prev.selectionEnvelope.options
    : [];
  if (optionBagHasCommercial(prevOptions)) {
    reasons.push('options_have_commercial');
  }
  if (optionBagHasCommercial(envOptions)) {
    reasons.push('selectionEnvelope_options_have_commercial');
  }
  if (
    optionBagHasCommercial(prevOptions) &&
    !Array.isArray(prev.fullOptions)
  ) {
    reasons.push('missing_fullOptions_while_options_commercial');
  }
  if (
    Array.isArray(prev.fullOptions) &&
    prev.fullOptions.length > 0 &&
    optionBagHasCommercial(prevOptions)
  ) {
    reasons.push('options_still_commercial_despite_fullOptions');
  }
  // Only rewrite when browser-facing carriers still leak commercial material.
  const needs = reasons.length > 0;
  return { needs, reasons };
}

function rowSourceSummary(row) {
  const ctx = isObj(row.context) ? row.context : {};
  const out = isObj(row.output) ? row.output : {};
  return {
    id: row.id,
    source: typeof ctx.source === 'string' ? ctx.source : null,
    synthesisMode: typeof ctx.synthesisMode === 'string' ? ctx.synthesisMode : null,
    pipeline:
      typeof out.productPipeline === 'string'
        ? out.productPipeline
        : typeof ctx.pipelineCore === 'string'
          ? ctx.pipelineCore
          : null,
  };
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const totals = {
  scanned: 0,
  matchedReadSynthesis: 0,
  needsScrub: 0,
  alreadyClean: 0,
  updated: 0,
  errors: 0,
  dryRun,
  pageSize,
  startOffset,
  allPages,
  sourceHistogram: /** @type {Record<string, number>} */ ({}),
  skippedSamples: /** @type {unknown[]} */ ([]),
  needsSamples: /** @type {unknown[]} */ ([]),
  cleanSamples: /** @type {unknown[]} */ ([]),
};

async function fetchPage(offset) {
  // Prefer filtering to read synthesis when PostgREST JSON filter is available.
  // Fallback: broad page + classifier (context shape varies).
  let query = admin
    .from('executions')
    .select('id, context, output, type, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // Optional: only rows that look like read synthesis (context.source).
  // Use FILTER_SOURCE=0 to scan everything in the page.
  if (process.env.FILTER_SOURCE !== '0') {
    query = query.or(
      [
        'context->>source.eq.read-synthesize-options',
        'output->>productPipeline.eq.synthesize-reads-asset-packs-pipeline',
        'context->>pipelineCore.eq.synthesize-reads-asset-packs-pipeline',
      ].join(','),
    );
  }

  return query;
}

let offset = startOffset;
let pages = 0;
const maxPages = allPages ? 200 : 1;

while (pages < maxPages) {
  const { data, error } = await fetchPage(offset);
  if (error) {
    console.error('select failed', error.message);
    process.exit(1);
  }
  const rows = Array.isArray(data) ? data : [];
  pages += 1;
  totals.scanned += rows.length;

  if (rows.length === 0) break;

  for (const row of rows) {
    const summary = rowSourceSummary(row);
    const srcKey = summary.source || summary.pipeline || '(none)';
    totals.sourceHistogram[srcKey] = (totals.sourceHistogram[srcKey] || 0) + 1;

    if (!isUnpaidReadSynthesis(row)) {
      if (verbose) {
        console.log('skip:not-read-synthesis', summary);
      } else if (totals.skippedSamples.length < 5) {
        totals.skippedSamples.push(summary);
      }
      continue;
    }

    totals.matchedReadSynthesis += 1;
    const next = scrubOutput(row.output);
    if (!next) {
      totals.alreadyClean += 1;
      continue;
    }
    const prev = isObj(row.output) ? row.output : {};
    const { needs, reasons } = classifyNeeds(prev, next);

    if (!needs) {
      totals.alreadyClean += 1;
      if (verbose) {
        console.log('clean', row.id, reasons);
      } else if (totals.cleanSamples.length < 5) {
        totals.cleanSamples.push({ ...summary, reasons: ['already_unpaid_or_no_options'] });
      }
      continue;
    }

    totals.needsScrub += 1;
    if (totals.needsSamples.length < 10) {
      totals.needsSamples.push({ ...summary, reasons });
    }

    if (dryRun) {
      console.log('would-scrub', row.id, reasons.join(','));
      continue;
    }

    const { error: upErr } = await admin
      .from('executions')
      .update({ output: next })
      .eq('id', row.id);
    if (upErr) {
      totals.errors += 1;
      console.error(row.id, upErr.message);
    } else {
      totals.updated += 1;
      console.log('scrubbed', row.id, reasons.join(','));
    }
  }

  if (!allPages || rows.length < pageSize) break;
  offset += pageSize;
}

console.log(JSON.stringify(totals, null, 2));

if (totals.matchedReadSynthesis === 0) {
  console.error(
    [
      '',
      'No unpaid READ synthesis rows matched in this window.',
      'Likely causes:',
      '  - This page is mostly deposits/settles (check sourceHistogram).',
      '  - FILTER_SOURCE default filter found zero read-synthesis rows',
      '    (try FILTER_SOURCE=0 to scan raw pages, or ALL_PAGES=1).',
      '  - Older rows use a different context.source string.',
      '',
      'Examples:',
      '  DRY_RUN=1 VERBOSE=1 ALL_PAGES=1 node scripts/scrub-unpaid-read-outputs.mjs',
      '  FILTER_SOURCE=0 LIMIT=200 node scripts/scrub-unpaid-read-outputs.mjs',
    ].join('\n'),
  );
} else if (totals.needsScrub === 0) {
  console.error(
    [
      '',
      `Matched ${totals.matchedReadSynthesis} read-synthesis row(s); none still leak commercial fields on options.`,
      'Browser-facing options already look unpaid (or empty). History redaction also covers unpaid forever.',
      'Nothing to rewrite — this is a successful no-op.',
    ].join('\n'),
  );
}
