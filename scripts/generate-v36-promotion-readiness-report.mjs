#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  buildExchangePromotionReadinessReport,
} from '../packages/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const GENERATED_AT = '2026-05-24T00:00:00.000Z';
const SOURCE_SAFETY_TOKEN = 'source-safe-exchange-promotion-readiness-metadata';
const ARTIFACT_ID_TOKEN = 'v36-promotion-readiness-report';

function parseArgs(argv) {
  return {
    check: argv.includes('--check'),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = buildExchangePromotionReadinessReport({
    generatedAt: GENERATED_AT,
    repoRoot,
  });
  if (artifact.sourceSafetyVerdict !== SOURCE_SAFETY_TOKEN || artifact.artifactId !== ARTIFACT_ID_TOKEN) {
    throw new Error('V36 exchange promotion readiness artifact identity or source-safety verdict drifted.');
  }
  const outputPath = path.join(repoRoot, EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH);
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

  if (args.check) {
    const current = readFileSync(outputPath, 'utf8');
    if (current !== serialized) {
      process.stderr.write(
        `${EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH} is stale. Run pnpm run generate:v36-promotion-readiness.\n`,
      );
      process.exitCode = 1;
      return;
    }
    if (!artifact.passed) {
      process.stderr.write(`Exchange promotion readiness failed:\n${artifact.failures.map((failure) => `- ${failure}`).join('\n')}\n`);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(`Exchange promotion readiness ok artifacts=${artifact.gateArtifactEvidence.length} root=${artifact.artifactRoot}\n`);
    return;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  process.stdout.write(
    `Wrote ${EXCHANGE_PROMOTION_READINESS_REPORT_ARTIFACT_PATH} artifacts=${artifact.gateArtifactEvidence.length} root=${artifact.artifactRoot}\n`,
  );
}

main();
