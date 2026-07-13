#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V42_LOCAL_STAGING_MVP_REHEARSAL_ARTIFACT_PATH,
  buildV42LocalStagingMvpRehearsal,
} from '../packages/specifying/src/canonical/v42-local-staging-mvp-rehearsal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    check: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--check') args.check = true;
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        'Usage: node scripts/generate-v42-local-staging-mvp-rehearsal.mjs [--check] [--repo-root <path>]\n',
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument ${arg}`);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const artifact = buildV42LocalStagingMvpRehearsal({ repoRoot: args.repoRoot });
const artifactPath = path.join(args.repoRoot, V42_LOCAL_STAGING_MVP_REHEARSAL_ARTIFACT_PATH);
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

if (args.check) {
  if (!existsSync(artifactPath)) {
    process.stderr.write(`Missing ${V42_LOCAL_STAGING_MVP_REHEARSAL_ARTIFACT_PATH}\n`);
    process.exit(1);
  }
  const current = readFileSync(artifactPath, 'utf8');
  if (current !== serialized) {
    process.stderr.write(`${V42_LOCAL_STAGING_MVP_REHEARSAL_ARTIFACT_PATH} is stale. Run pnpm run generate:v42-local-staging-mvp-rehearsal.\n`);
    process.exit(1);
  }
  if (!artifact.passed) {
    process.stderr.write(`V42 local/staging MVP rehearsal artifact predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}\n`);
    process.exit(1);
  }
  process.stdout.write(`V42 local/staging MVP rehearsal artifact ok ${artifact.artifactRoot}\n`);
  process.exit(0);
}

mkdirSync(path.dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, serialized);
process.stdout.write(`Wrote ${V42_LOCAL_STAGING_MVP_REHEARSAL_ARTIFACT_PATH} ${artifact.artifactRoot}\n`);
