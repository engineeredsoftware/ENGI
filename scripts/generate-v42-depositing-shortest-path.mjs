#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V42_DEPOSITING_SHORTEST_PATH_ARTIFACT_PATH,
  buildV42DepositingShortestPath,
} from '../scripts/specifying/src/canonical/v42-depositing-shortest-path.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV42DepositingShortestPath({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V42_DEPOSITING_SHORTEST_PATH_ARTIFACT_PATH);

if (check) {
  const current = readFileSync(artifactPath, 'utf8');
  if (current !== serialized) {
    process.stderr.write(
      `${V42_DEPOSITING_SHORTEST_PATH_ARTIFACT_PATH} is stale. Run pnpm run generate:v42-depositing-shortest-path.\n`,
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V42_DEPOSITING_SHORTEST_PATH_ARTIFACT_PATH}\n`);
}
