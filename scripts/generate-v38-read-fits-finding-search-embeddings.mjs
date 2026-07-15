#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ARTIFACT_PATH,
  buildV38ReadFitsFindingSearchEmbeddings,
} from '../scripts/specifying/src/canonical/read-fits-finding-search-embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV38ReadFitsFindingSearchEmbeddings({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ARTIFACT_PATH);

if (check) {
  const current = await import('node:fs').then(({ readFileSync }) => readFileSync(artifactPath, 'utf8'));
  if (current !== serialized) {
    process.stderr.write(`${V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ARTIFACT_PATH} is stale. Run pnpm run generate:v38-read-fits-finding-search-embeddings.\n`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ARTIFACT_PATH}\n`);
}
