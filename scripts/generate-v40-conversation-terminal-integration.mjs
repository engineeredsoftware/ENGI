#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V40_CONVERSATION_TERMINAL_INTEGRATION_ARTIFACT_PATH,
  buildV40ConversationTerminalIntegration,
} from '../scripts/specifying/src/canonical/v40-conversation-terminal-integration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV40ConversationTerminalIntegration({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V40_CONVERSATION_TERMINAL_INTEGRATION_ARTIFACT_PATH);

if (check) {
  const current = readFileSync(artifactPath, 'utf8');
  if (current !== serialized) {
    process.stderr.write(
      `${V40_CONVERSATION_TERMINAL_INTEGRATION_ARTIFACT_PATH} is stale. Run pnpm run generate:v40-conversation-terminal-integration.\n`,
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V40_CONVERSATION_TERMINAL_INTEGRATION_ARTIFACT_PATH}\n`);
}
