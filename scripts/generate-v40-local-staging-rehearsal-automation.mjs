#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ARTIFACT_PATH,
  buildV40LocalStagingRehearsalAutomation,
} from '../packages/specifying/src/canonical/v40-local-staging-rehearsal-automation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function main() {
  const check = process.argv.includes('--check');
  const artifact = buildV40LocalStagingRehearsalAutomation({ repoRoot });
  const artifactPath = path.join(repoRoot, V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ARTIFACT_PATH);
  const next = stableJson(artifact);

  if (check) {
    const current = readFileSync(artifactPath, 'utf8');
    if (current !== next) {
      throw new Error(`${V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ARTIFACT_PATH} is stale. Run pnpm run generate:v40-local-staging-rehearsal-automation.`);
    }
    return;
  }

  writeFileSync(artifactPath, next);
}

main();
