#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ARTIFACT_PATH,
  buildV38ConversationToolPromptInferenceParity,
} from '../packages/specifying/src/canonical/conversation-tool-prompt-inference-parity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const check = process.argv.includes('--check');
const artifact = buildV38ConversationToolPromptInferenceParity({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ARTIFACT_PATH);

if (check) {
  const current = await import('node:fs').then(({ readFileSync }) => readFileSync(artifactPath, 'utf8'));
  if (current !== serialized) {
    process.stderr.write(`${V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ARTIFACT_PATH} is stale. Run pnpm run generate:v38-conversation-tool-prompt-inference-parity.\n`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ARTIFACT_PATH}\n`);
}
