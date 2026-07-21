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
 *   VERBOSE=1          — per-row reasons on stderr lines
 *   ALL_PAGES=1        — walk the table in LIMIT-sized pages until empty
 *   FILTER_SOURCE=0    — scan raw pages (no PostgREST source filter)
 *   REPORT_LIMIT=50    — max inventory rows in JSON (default 50; 0 = all)
 *
 * Always reports a read-synthesis inventory (status, option counts,
 * fullOptions / rehydrate readiness, error summary) separate from scrub.
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
const reportLimitRaw = process.env.REPORT_LIMIT;
const reportLimit =
  reportLimitRaw === undefined || reportLimitRaw === ''
    ? 50
    : Math.max(0, Number(reportLimitRaw) || 0);

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
function classifyNeeds(prev) {
  const reasons = [];
  const prevOptions = Array.isArray(prev.options) ? prev.options : [];
  const envOptions =
    isObj(prev.selectionEnvelope) && Array.isArray(prev.selectionEnvelope.options)
      ? prev.selectionEnvelope.options
      : [];
  if (optionBagHasCommercial(prevOptions)) {
    reasons.push('options_have_commercial');
  }
  if (optionBagHasCommercial(envOptions)) {
    reasons.push('selectionEnvelope_options_have_commercial');
  }
  if (optionBagHasCommercial(prevOptions) && !Array.isArray(prev.fullOptions)) {
    reasons.push('missing_fullOptions_while_options_commercial');
  }
  if (
    Array.isArray(prev.fullOptions) &&
    prev.fullOptions.length > 0 &&
    optionBagHasCommercial(prevOptions)
  ) {
    reasons.push('options_still_commercial_despite_fullOptions');
  }
  return { needs: reasons.length > 0, reasons };
}

function truncate(str, max = 160) {
  if (typeof str !== 'string') return null;
  const t = str.trim();
  if (!t) return null;
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function errorSummary(row) {
  const err = row.error;
  if (typeof err === 'string') return truncate(err);
  if (isObj(err)) {
    if (typeof err.message === 'string') return truncate(err.message);
    if (typeof err.error === 'string') return truncate(err.error);
    try {
      return truncate(JSON.stringify(err));
    } catch {
      return '[error object]';
    }
  }
  const out = isObj(row.output) ? row.output : {};
  if (typeof out.summary === 'string' && String(row.status || '').toLowerCase() === 'failed') {
    return truncate(out.summary);
  }
  return null;
}

/**
 * Inventory one matched read-synthesis row (product health, not only leak).
 * Distinguishes empty synthesis vs rehydrate-ready vs leaky browser options.
 */
function inventoryReadSynthesisRow(row) {
  const ctx = isObj(row.context) ? row.context : {};
  const out = isObj(row.output) ? row.output : {};
  const options = Array.isArray(out.options) ? out.options : [];
  const fullOptions = Array.isArray(out.fullOptions) ? out.fullOptions : [];
  const envOptions =
    isObj(out.selectionEnvelope) && Array.isArray(out.selectionEnvelope.options)
      ? out.selectionEnvelope.options
      : [];
  const declaredCount =
    typeof out.optionCount === 'number'
      ? out.optionCount
      : typeof ctx.optionCount === 'number'
        ? ctx.optionCount
        : null;

  const commercialOnOptions = optionBagHasCommercial(options);
  const commercialOnEnvelope = optionBagHasCommercial(envOptions);
  const commercialOnFull = optionBagHasCommercial(fullOptions);
  const rehydrateReady = fullOptions.length > 0 && commercialOnFull;
  const unpaidBrowserOnly =
    options.length > 0 && !commercialOnOptions && !commercialOnEnvelope;
  const emptyOptions =
    options.length === 0 && fullOptions.length === 0 && envOptions.length === 0;

  let posture = 'unknown';
  if (emptyOptions) posture = 'empty';
  else if (commercialOnOptions || commercialOnEnvelope) posture = 'leaky_browser';
  else if (rehydrateReady && unpaidBrowserOnly) posture = 'dual_envelope_ok';
  else if (rehydrateReady && options.length === 0) posture = 'fullOptions_only';
  else if (unpaidBrowserOnly && fullOptions.length === 0) posture = 'unpaid_no_fullOptions';
  else if (options.length > 0 || fullOptions.length > 0) posture = 'partial';

  return {
    id: row.id,
    status: typeof row.status === 'string' ? row.status : null,
    created_at: row.created_at || null,
    completed_at: row.completed_at || null,
    source: typeof ctx.source === 'string' ? ctx.source : null,
    pipeline:
      typeof out.productPipeline === 'string'
        ? out.productPipeline
        : typeof ctx.pipelineCore === 'string'
          ? ctx.pipelineCore
          : null,
    repositoryFullName:
      typeof ctx.repositoryFullName === 'string'
        ? ctx.repositoryFullName
        : typeof out.repositoryFullName === 'string'
          ? out.repositoryFullName
          : null,
    optionCount: options.length,
    envelopeOptionCount: envOptions.length,
    fullOptionsCount: fullOptions.length,
    declaredOptionCount: declaredCount,
    hasFullOptions: fullOptions.length > 0,
    rehydrateReady,
    browserLeaksCommercial: commercialOnOptions || commercialOnEnvelope,
    fullOptionsCommercial: commercialOnFull,
    posture,
    error: errorSummary(row),
    success: out.success === true ? true : out.success === false ? false : null,
  };
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

const inventory = [];
const postureHistogram = {};

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
  postureHistogram,
  inventorySummary: {
    empty: 0,
    dual_envelope_ok: 0,
    leaky_browser: 0,
    unpaid_no_fullOptions: 0,
    fullOptions_only: 0,
    partial: 0,
    unknown: 0,
    rehydrateReady: 0,
    withBrowserOptions: 0,
    failedStatus: 0,
  },
  skippedSamples: /** @type {unknown[]} */ ([]),
  needsSamples: /** @type {unknown[]} */ ([]),
  /** Full per-row inventory (capped by REPORT_LIMIT; 0 = all). */
  readSynthesisInventory: /** @type {unknown[]} */ ([]),
};

async function fetchPage(offset) {
  let query = admin
    .from('executions')
    .select('id, context, output, type, status, error, created_at, completed_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

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

    const inv = inventoryReadSynthesisRow(row);
    inventory.push(inv);
    postureHistogram[inv.posture] = (postureHistogram[inv.posture] || 0) + 1;
    if (inv.posture in totals.inventorySummary) {
      totals.inventorySummary[inv.posture] += 1;
    } else {
      totals.inventorySummary.unknown += 1;
    }
    if (inv.rehydrateReady) totals.inventorySummary.rehydrateReady += 1;
    if (inv.optionCount > 0) totals.inventorySummary.withBrowserOptions += 1;
    if (String(inv.status || '').toLowerCase() === 'failed') {
      totals.inventorySummary.failedStatus += 1;
    }

    if (verbose) {
      console.log(
        'inventory',
        inv.id,
        inv.status,
        inv.posture,
        `opts=${inv.optionCount}`,
        `full=${inv.fullOptionsCount}`,
        inv.error ? `err=${inv.error}` : '',
      );
    }

    const next = scrubOutput(row.output);
    if (!next) {
      totals.alreadyClean += 1;
      continue;
    }
    const prev = isObj(row.output) ? row.output : {};
    const { needs, reasons } = classifyNeeds(prev);

    if (!needs) {
      totals.alreadyClean += 1;
      continue;
    }

    totals.needsScrub += 1;
    if (totals.needsSamples.length < 10) {
      totals.needsSamples.push({ ...summary, reasons, posture: inv.posture });
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

totals.readSynthesisInventory =
  reportLimit === 0 ? inventory : inventory.slice(0, reportLimit);
totals.inventoryReported = totals.readSynthesisInventory.length;
totals.inventoryTotal = inventory.length;

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
      '  REPORT_LIMIT=0  # include full inventory in JSON',
    ].join('\n'),
  );
} else {
  const s = totals.inventorySummary;
  console.error(
    [
      '',
      `Read-synthesis inventory: ${totals.matchedReadSynthesis} row(s).`,
      `  posture: empty=${s.empty} dual_envelope_ok=${s.dual_envelope_ok} leaky_browser=${s.leaky_browser}`,
      `           unpaid_no_fullOptions=${s.unpaid_no_fullOptions} fullOptions_only=${s.fullOptions_only} partial=${s.partial}`,
      `  rehydrateReady=${s.rehydrateReady} withBrowserOptions=${s.withBrowserOptions} failedStatus=${s.failedStatus}`,
      totals.needsScrub === 0
        ? 'Scrub: nothing to rewrite (browser options not commercial-leaking).'
        : `Scrub: needsScrub=${totals.needsScrub} updated=${totals.updated}.`,
      'See readSynthesisInventory[] for per-id status/optionCount/fullOptions/error.',
    ].join('\n'),
  );
}
