#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ARTIFACT_PATH,
  buildV39OperationalTelemetryRepairReadback,
} from '../scripts/specifying/src/canonical/v39-operational-telemetry-repair-readback.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV39OperationalTelemetryRepairReadback({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ARTIFACT_PATH);

if (check) {
  const current = readFileSync(artifactPath, 'utf8');
  if (current !== serialized) {
    process.stderr.write(`${V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ARTIFACT_PATH} is stale. Run pnpm run generate:v39-operational-telemetry-repair-readback.\n`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ARTIFACT_PATH}\n`);
}
