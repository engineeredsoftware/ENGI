#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ARTIFACT_PATH,
  buildV38AssetPackSynthesisEconomicTraceability,
} from '../packages/specifying/src/canonical/assetpack-synthesis-economic-traceability.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV38AssetPackSynthesisEconomicTraceability({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ARTIFACT_PATH);

if (check) {
  const current = await import('node:fs').then(({ readFileSync }) => readFileSync(artifactPath, 'utf8'));
  if (current !== serialized) {
    process.stderr.write(`${V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ARTIFACT_PATH} is stale. Run pnpm run generate:v38-assetpack-synthesis-economic-traceability.\n`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V38_ASSETPACK_SYNTHESIS_ECONOMIC_TRACEABILITY_ARTIFACT_PATH}\n`);
}
