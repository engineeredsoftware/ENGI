#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V42_READING_SHORTEST_PATH_STATE_MACHINE_ARTIFACT_PATH,
  buildV42ReadingShortestPathStateMachine,
} from '../packages/specifying/src/canonical/v42-reading-shortest-path-state-machine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV42ReadingShortestPathStateMachine({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V42_READING_SHORTEST_PATH_STATE_MACHINE_ARTIFACT_PATH);

if (check) {
  const current = readFileSync(artifactPath, 'utf8');
  if (current !== serialized) {
    process.stderr.write(
      `${V42_READING_SHORTEST_PATH_STATE_MACHINE_ARTIFACT_PATH} is stale. Run pnpm run generate:v42-reading-shortest-path-state-machine.\n`,
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V42_READING_SHORTEST_PATH_STATE_MACHINE_ARTIFACT_PATH}\n`);
}
