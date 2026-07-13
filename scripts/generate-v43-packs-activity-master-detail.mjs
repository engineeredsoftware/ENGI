#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH,
  buildV43PacksActivityMasterDetail,
} from '../packages/specifying/src/canonical/v43-packs-activity-master-detail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const artifact = buildV43PacksActivityMasterDetail({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH);

if (checkOnly) {
  if (!existsSync(artifactPath) || readFileSync(artifactPath, 'utf8') !== serialized) {
    process.stderr.write(
      `${V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH} is stale. Run pnpm run generate:v43-packs-activity-master-detail.\n`,
    );
    process.exitCode = 1;
  }
} else {
  mkdirSync(path.dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH}\n`);
}
