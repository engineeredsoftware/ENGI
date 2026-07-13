#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH,
  buildV43RouteVocabularyInventory,
} from '../packages/specifying/src/canonical/v43-route-vocabulary-inventory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV43RouteVocabularyInventory({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH);

if (check) {
  const current = readFileSync(artifactPath, 'utf8');
  if (current !== serialized) {
    process.stderr.write(
      `${V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH} is stale. Run pnpm run generate:v43-route-vocabulary-inventory.\n`,
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V43_ROUTE_VOCABULARY_INVENTORY_ARTIFACT_PATH}\n`);
}
