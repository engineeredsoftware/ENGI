#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  V47_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  V47_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  buildV47PromotionReadinessReport,
} from '../packages/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const GENERATED_AT = '2026-06-11T00:00:00.000Z';
const EXPECTED_ARTIFACT_ID = 'v47-promotion-readiness-report';
const EXPECTED_SOURCE_SAFETY_VERDICT = 'source-safe-v47-commercial-website-testnet-launch-promotion-metadata';

function parseArgs(argv) {
  return {
    check: argv.includes('--check'),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = buildV47PromotionReadinessReport({
    generatedAt: GENERATED_AT,
    repoRoot,
  });
  if (
    artifact.artifactId !== EXPECTED_ARTIFACT_ID ||
    artifact.sourceSafetyVerdict !== V47_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT ||
    artifact.sourceSafetyVerdict !== EXPECTED_SOURCE_SAFETY_VERDICT
  ) {
    throw new Error('Unexpected V47 promotion readiness artifact identity.');
  }
  const outputPath = path.join(repoRoot, V47_PROMOTION_READINESS_REPORT_ARTIFACT_PATH);
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

  if (args.check) {
    if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== serialized) {
      process.stderr.write(
        `${V47_PROMOTION_READINESS_REPORT_ARTIFACT_PATH} is stale. Run pnpm run generate:v47-promotion-readiness.\n`,
      );
      process.exitCode = 1;
    }
    return;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  process.stdout.write(`wrote ${V47_PROMOTION_READINESS_REPORT_ARTIFACT_PATH}\n`);
}

main();
