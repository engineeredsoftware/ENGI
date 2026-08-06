#!/usr/bin/env ts-node
/**
 * Backfill admitted execution activity measurements to full 65-kind catalogue.
 *
 * Sources volumes from depository_search_documents when present, else expands
 * partial measurements on the execution output with SSOT weights.
 *
 *   pnpm exec ts-node --transpile-only --skip-project scripts/backfill-execution-absolute-measurements.ts --dry-run
 *   pnpm exec ts-node --transpile-only --skip-project scripts/backfill-execution-absolute-measurements.ts
 */

/* eslint-disable no-console */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  DATA_PACK_ABSOLUTES_CATALOG,
} from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';
import {
  collectAbsoluteVolumesFromUnknown,
  expandAbsoluteVolumesToFullCatalog,
} from '../src/depository-absolute-facets-expand';

const repoRoot = path.resolve(__dirname, '../../../../..');

function loadEnv() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dotenv = require('dotenv');
    for (const p of [
      path.join(repoRoot, 'apps/uapi/.env.local'),
      path.join(repoRoot, '.env.local'),
    ]) {
      if (existsSync(p)) dotenv.config({ path: p });
    }
  } catch {
    /* optional */
  }
}

function asString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function buildFullMeasurements(volumes: Record<string, number>) {
  const expanded = expandAbsoluteVolumesToFullCatalog(volumes);
  return DATA_PACK_ABSOLUTES_CATALOG.map((spec) => {
    const volume = expanded.absoluteVolumes[spec.measurementKind] ?? 0;
    return {
      kind: spec.measurementKind,
      measurementKind: spec.measurementKind,
      category: 'absolute' as const,
      label: spec.label,
      unit: spec.unit || 'normalized',
      weight: spec.weight,
      volume,
      magnitude: volume,
      descriptor: null as string | null,
    };
  });
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ADMIN_KEY ||
    '';
  if (!url || !key) {
    console.error('Missing SUPABASE_URL / service role key');
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const { data: execs, error } = await sb
    .from('executions')
    .select('id, output, context')
    .or(
      [
        'context->>admissionState.eq.admitted-to-depository',
        'context->>source.eq.deposit-option-review-admission',
        'type.eq.settled-assetpack',
      ].join(','),
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;
  const sample: Array<Record<string, unknown>> = [];

  for (const row of execs || []) {
    const id = asString(row.id);
    if (!id) continue;
    const output =
      row.output && typeof row.output === 'object'
        ? ({ ...(row.output as object) } as Record<string, unknown>)
        : {};

    // Prefer search-doc volumes when this execution is the asset_id.
    let volumes = collectAbsoluteVolumesFromUnknown(output);
    const { data: doc } = await sb
      .from('depository_search_documents')
      .select('absolute_volumes')
      .eq('asset_id', id)
      .maybeSingle();
    if (doc?.absolute_volumes && typeof doc.absolute_volumes === 'object') {
      volumes = {
        ...volumes,
        ...collectAbsoluteVolumesFromUnknown({ absolute_volumes: doc.absolute_volumes }),
      };
    }

    const priorCount = Object.values(volumes).filter((v) => v > 0).length;
    const full = buildFullMeasurements(volumes);
    if (full.length !== 46) {
      skipped += 1;
      continue;
    }

    const nextOutput = {
      ...output,
      measurements: full,
      absolutes: full,
    };

    sample.push({
      id,
      priorPositive: priorCount,
      nextCount: full.length,
      weightFunction: full.find((m) => m.kind === 'function-count')?.weight,
    });

    if (dryRun) {
      updated += 1;
      continue;
    }

    const { error: upErr } = await sb
      .from('executions')
      .update({ output: nextOutput })
      .eq('id', id);
    if (upErr) {
      console.error('update failed', id, upErr.message);
      skipped += 1;
    } else {
      updated += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun,
        candidates: (execs || []).length,
        updated,
        skipped,
        sample: sample.slice(0, 12),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
