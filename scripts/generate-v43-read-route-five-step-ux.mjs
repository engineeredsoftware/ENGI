#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH,
  buildV43ReadRouteFiveStepUx,
} from '../scripts/specifying/src/canonical/v43-read-route-five-step-ux.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const artifact = buildV43ReadRouteFiveStepUx({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH);

if (checkOnly) {
  if (!existsSync(artifactPath) || readFileSync(artifactPath, 'utf8') !== serialized) {
    process.stderr.write(
      `${V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH} is stale. Run pnpm run generate:v43-read-route-five-step-ux.\n`,
    );
    process.exitCode = 1;
  }
} else {
  mkdirSync(path.dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH}\n`);
}
