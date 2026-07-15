#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ARTIFACT_PATH,
  buildV39InterfaceConversationProductParity,
} from '../scripts/specifying/src/canonical/v39-interface-conversation-product-parity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV39InterfaceConversationProductParity({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ARTIFACT_PATH);

if (check) {
  const current = readFileSync(artifactPath, 'utf8');
  if (current !== serialized) {
    process.stderr.write(`${V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ARTIFACT_PATH} is stale. Run pnpm run generate:v39-interface-conversation-product-parity.\n`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ARTIFACT_PATH}\n`);
}
