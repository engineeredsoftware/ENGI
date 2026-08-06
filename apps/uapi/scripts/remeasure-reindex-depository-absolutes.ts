#!/usr/bin/env ts-node
/**
 * Remeasure + reindex depository search documents under 65-kind absolute law.
 *
 * Usage (from apps/uapi):
 *   pnpm remeasure-reindex-depository-absolutes
 *   pnpm remeasure-reindex-depository-absolutes -- --dry-run
 *   pnpm remeasure-reindex-depository-absolutes -- --skip-embed --limit=50
 *   pnpm remeasure-reindex-depository-absolutes -- --asset-id=uuid
 */

/* eslint-disable @typescript-eslint/no-var-requires, no-console */
const path = require('path');
const fs = require('fs');

const envCandidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '../../.env.local'),
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../../../.env.local'),
];
try {
  const dotenv = require('dotenv');
  for (const p of envCandidates) {
    if (fs.existsSync(p)) dotenv.config({ path: p });
  }
} catch {
  /* optional */
}

function parseArgs(argv: string[]) {
  const opts = {
    dryRun: false,
    skipEmbed: false,
    limit: 200,
    assetIds: [] as string[],
  };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--skip-embed') opts.skipEmbed = true;
    else if (arg.startsWith('--limit=')) {
      const n = Number(arg.slice('--limit='.length));
      if (Number.isFinite(n) && n > 0) opts.limit = Math.floor(n);
    } else if (arg.startsWith('--asset-id=')) {
      const id = arg.slice('--asset-id='.length).trim();
      if (id) opts.assetIds.push(id);
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  // Path-alias imports via tsconfig paths may not resolve under plain ts-node.
  // Require the lib through a relative path; ts-node transpiles it.
  const {
    remeasureAndReindexDepositoryAbsolutes,
  } = require('../lib/depository-remeasure-reindex');

  console.log(
    JSON.stringify(
      {
        action: 'remeasure-reindex-depository-absolutes',
        dryRun: opts.dryRun,
        skipEmbed: opts.skipEmbed,
        limit: opts.limit,
        assetIdCount: opts.assetIds.length,
      },
      null,
      2,
    ),
  );

  const summary = await remeasureAndReindexDepositoryAbsolutes({
    dryRun: opts.dryRun,
    skipEmbed: opts.skipEmbed,
    limit: opts.limit,
    assetIds: opts.assetIds.length ? opts.assetIds : null,
  });

  console.log(
    JSON.stringify(
      {
        ok: summary.ok,
        processed: summary.processed,
        succeeded: summary.succeeded,
        failed: summary.failed,
        dryRun: summary.dryRun,
        sample: summary.rows.slice(0, 12).map((r: any) => ({
          assetId: r.assetId,
          ok: r.ok,
          mode: r.mode,
          measuredKindCount: r.measuredKindCount,
          priorKindCount: r.priorKindCount,
          embeddingState: r.embeddingState,
          error: r.error,
        })),
      },
      null,
      2,
    ),
  );

  if (!summary.ok && summary.failed > 0 && summary.processed > 0) {
    process.exitCode = 2;
  } else if (summary.processed === 0 && summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(
    'remeasure-reindex-depository-absolutes failed:',
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
