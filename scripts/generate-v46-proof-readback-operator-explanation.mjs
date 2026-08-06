#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH,
  buildV46ProofReadbackOperatorExplanation,
} from '../scripts/specifying/src/canonical/v46-proof-readback-operator-explanation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const artifact = buildV46ProofReadbackOperatorExplanation({ repoRoot });
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
const artifactPath = path.join(repoRoot, V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH);

if (checkOnly) {
  if (!existsSync(artifactPath) || readFileSync(artifactPath, 'utf8') !== serialized) {
    process.stderr.write(
      `${V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH} is stale. Run pnpm run generate:v46-proof-readback-operator-explanation.\n`,
    );
    process.exitCode = 1;
  }
} else {
  mkdirSync(path.dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, serialized);
  process.stdout.write(`wrote ${V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH}\n`);
}

