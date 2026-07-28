#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH,
  buildV48DepositorWebsiteCompletion,
} from '../scripts/specifying/src/canonical/v48-depositor-website-completion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const artifact = buildV48DepositorWebsiteCompletion({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH);

if (checkOnly) {
  if (!existsSync(artifactPath) || readFileSync(artifactPath, 'utf8') !== serialized) {
    process.stderr.write(
      `${V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH} is stale. Run pnpm run generate:v48-depositor-website-completion.\n`,
    );
    process.exitCode = 1;
  }
} else {
  mkdirSync(path.dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V48_DEPOSITOR_WEBSITE_COMPLETION_ARTIFACT_PATH}\n`);
}
