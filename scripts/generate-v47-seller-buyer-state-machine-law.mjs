#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH,
  buildV47SellerBuyerStateMachineLaw,
} from '../scripts/specifying/src/canonical/v47-seller-buyer-state-machine-law.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const artifact = buildV47SellerBuyerStateMachineLaw({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH);

if (checkOnly) {
  if (!existsSync(artifactPath) || readFileSync(artifactPath, 'utf8') !== serialized) {
    process.stderr.write(
      `${V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH} is stale. Run pnpm run generate:v47-seller-buyer-state-machine-law.\n`,
    );
    process.exitCode = 1;
  }
} else {
  mkdirSync(path.dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH}\n`);
}
