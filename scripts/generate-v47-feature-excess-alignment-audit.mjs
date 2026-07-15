#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH,
  buildV47FeatureExcessAlignmentAudit,
} from '../scripts/specifying/src/canonical/v47-feature-excess-alignment-audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const artifact = buildV47FeatureExcessAlignmentAudit({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH);

if (checkOnly) {
  if (!existsSync(artifactPath) || readFileSync(artifactPath, 'utf8') !== serialized) {
    process.stderr.write(
      `${V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH} is stale. Run pnpm run generate:v47-feature-excess-alignment-audit.\n`,
    );
    process.exitCode = 1;
  }
} else {
  mkdirSync(path.dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH}\n`);
}
