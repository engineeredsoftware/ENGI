#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V39_READ_FITS_FINDING_RUNTIME_ARTIFACT_PATH,
  buildV39ReadFitsFindingRuntime,
} from '../packages/specifying/src/canonical/v39-read-fits-finding-runtime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV39ReadFitsFindingRuntime({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V39_READ_FITS_FINDING_RUNTIME_ARTIFACT_PATH);

if (check) {
  const current = readFileSync(artifactPath, 'utf8');
  if (current !== serialized) {
    process.stderr.write(`${V39_READ_FITS_FINDING_RUNTIME_ARTIFACT_PATH} is stale. Run pnpm run generate:v39-read-fits-finding-runtime.\n`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V39_READ_FITS_FINDING_RUNTIME_ARTIFACT_PATH}\n`);
}
