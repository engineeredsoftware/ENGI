/**
 * Write host-smoke + live AssetPack pipeline runner sources to an output directory.
 * Used by @bitcode/pipeline-image materialize and VCR image builds.
 *
 * Usage:
 *   pnpm --filter @bitcode/pipeline-hosts exec ts-node --transpile-only \\
 *     src/dev/materialize-runners.ts <outDir>
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  createHostSmokeRunner,
  createLiveAssetPackPipelineRunner,
} from '../asset-pack-host-runners';

const outDir = path.resolve(process.argv[2] || path.join(__dirname, '../../../pipeline-image/dist'));
mkdirSync(outDir, { recursive: true });

writeFileSync(path.join(outDir, 'run-host-smoke.mjs'), createHostSmokeRunner(), 'utf8');
writeFileSync(
  path.join(outDir, 'run-live-asset-pack-pipeline.mjs'),
  createLiveAssetPackPipelineRunner(),
  'utf8',
);

console.log(`Materialized runners → ${outDir}`);
