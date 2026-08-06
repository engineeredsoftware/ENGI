#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V40_LEDGER_STORAGE_SYNC_ARTIFACT_PATH,
  buildV40LedgerStorageSync,
} from '../scripts/specifying/src/canonical/v40-ledger-storage-sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function main() {
  const check = process.argv.includes('--check');
  const artifact = buildV40LedgerStorageSync({ repoRoot });
  const artifactPath = path.join(repoRoot, V40_LEDGER_STORAGE_SYNC_ARTIFACT_PATH);
  const next = stableJson(artifact);

  if (check) {
    const current = readFileSync(artifactPath, 'utf8');
    if (current !== next) {
      throw new Error(`${V40_LEDGER_STORAGE_SYNC_ARTIFACT_PATH} is stale. Run pnpm run generate:v40-ledger-storage-sync.`);
    }
    return;
  }

  writeFileSync(artifactPath, next);
}

main();
