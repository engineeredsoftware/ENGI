#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V42_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH,
  buildV42SettlementRightsDelivery,
} from '../scripts/specifying/src/canonical/v42-settlement-rights-delivery.js';

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
        'Usage: node scripts/generate-v42-settlement-rights-delivery.mjs [--check] [--repo-root <path>]\n',
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument ${arg}`);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const artifact = buildV42SettlementRightsDelivery({ repoRoot: args.repoRoot });
const artifactPath = path.join(args.repoRoot, V42_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH);
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

if (args.check) {
  if (!existsSync(artifactPath)) {
    process.stderr.write(`Missing ${V42_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH}\n`);
    process.exit(1);
  }
  const current = readFileSync(artifactPath, 'utf8');
  if (current !== serialized) {
    process.stderr.write(`${V42_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH} is stale. Run pnpm run generate:v42-settlement-rights-delivery.\n`);
    process.exit(1);
  }
  if (!artifact.passed) {
    process.stderr.write(`V42 settlement rights delivery artifact predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}\n`);
    process.exit(1);
  }
  process.stdout.write(`V42 settlement rights delivery artifact ok ${artifact.artifactRoot}\n`);
  process.exit(0);
}

mkdirSync(path.dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, serialized);
process.stdout.write(`Wrote ${V42_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH} ${artifact.artifactRoot}\n`);
