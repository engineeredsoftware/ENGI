#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH,
  buildV45SourceSafeEndToEndRehearsal,
} from '../packages/specifying/src/canonical/v45-source-safe-e2e-rehearsal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const artifactPath = path.join(repoRoot, V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH);
const check = process.argv.includes('--check');
const artifact = buildV45SourceSafeEndToEndRehearsal({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

if (check) {
  if (!existsSync(artifactPath) || readFileSync(artifactPath, 'utf8') !== serialized) {
    process.stderr.write(
      `${V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH} is stale. Run pnpm run generate:v45-source-safe-e2e-rehearsal.\n`,
    );
    process.exitCode = 1;
  } else if (!artifact.passed) {
    process.stderr.write(
      `${V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH} is current but reports repair state: ${artifact.rehearsalStatus}.\n`,
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH}\n`);
}
