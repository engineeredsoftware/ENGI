#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V39_DEPOSITORY_SUPPLY_INDEXING_ARTIFACT_PATH,
  buildV39DepositorySupplyIndexing,
} from '../packages/specifying/src/canonical/v39-depository-supply-indexing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV39DepositorySupplyIndexing({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V39_DEPOSITORY_SUPPLY_INDEXING_ARTIFACT_PATH);

if (check) {
  const current = await import('node:fs').then(({ readFileSync }) => readFileSync(artifactPath, 'utf8'));
  if (current !== serialized) {
    process.stderr.write(`${V39_DEPOSITORY_SUPPLY_INDEXING_ARTIFACT_PATH} is stale. Run pnpm run generate:v39-depository-supply-indexing.\n`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V39_DEPOSITORY_SUPPLY_INDEXING_ARTIFACT_PATH}\n`);
}
