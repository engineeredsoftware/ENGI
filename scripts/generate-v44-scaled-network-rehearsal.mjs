#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH,
  buildV44ScaledNetworkRehearsal,
} from '../scripts/specifying/src/canonical/v44-scaled-network-rehearsal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const artifactPath = path.join(repoRoot, V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH);
const check = process.argv.includes('--check');
const artifact = buildV44ScaledNetworkRehearsal({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

if (check) {
  if (!existsSync(artifactPath) || readFileSync(artifactPath, 'utf8') !== serialized) {
    process.stderr.write(
      `${V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH} is stale. Run pnpm run generate:v44-scaled-network-rehearsal.\n`,
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH}\n`);
}
