#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH,
  buildV47LandingPublicLaunchMessaging,
} from '../scripts/specifying/src/canonical/v47-landing-public-launch-messaging.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const artifact = buildV47LandingPublicLaunchMessaging({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH);

if (checkOnly) {
  if (!existsSync(artifactPath) || readFileSync(artifactPath, 'utf8') !== serialized) {
    process.stderr.write(
      `${V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH} is stale. Run pnpm run generate:v47-landing-public-launch-messaging.\n`,
    );
    process.exitCode = 1;
  }
} else {
  mkdirSync(path.dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH}\n`);
}
