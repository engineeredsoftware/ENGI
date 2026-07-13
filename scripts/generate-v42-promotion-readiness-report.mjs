#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  V42_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  V42_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  buildV42PromotionReadinessReport,
} from '../packages/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const GENERATED_AT = '2026-05-25T00:00:00.000Z';
const EXPECTED_ARTIFACT_ID = 'v42-promotion-readiness-report';
const EXPECTED_SOURCE_SAFETY_VERDICT = 'source-safe-v42-reliable-mvp-promotion-readiness-metadata';

function parseArgs(argv) {
  return {
    check: argv.includes('--check'),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = buildV42PromotionReadinessReport({
    generatedAt: GENERATED_AT,
    repoRoot,
  });
  if (
    artifact.artifactId !== EXPECTED_ARTIFACT_ID ||
    artifact.sourceSafetyVerdict !== V42_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT ||
    artifact.sourceSafetyVerdict !== EXPECTED_SOURCE_SAFETY_VERDICT
  ) {
    throw new Error('Unexpected V42 promotion readiness artifact identity.');
  }
  const outputPath = path.join(repoRoot, V42_PROMOTION_READINESS_REPORT_ARTIFACT_PATH);
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

  if (args.check) {
    const current = readFileSync(outputPath, 'utf8');
    if (current !== serialized) {
      process.stderr.write(
        `${V42_PROMOTION_READINESS_REPORT_ARTIFACT_PATH} is stale. Run pnpm run generate:v42-promotion-readiness.\n`,
      );
      process.exitCode = 1;
      return;
    }
    if (!artifact.passed) {
      process.stderr.write(`V42 promotion readiness artifact failed:\n${artifact.failures.map((failure) => `- ${failure}`).join('\n')}\n`);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(
      `V42 promotion readiness artifact ok artifacts=${artifact.coverage.gateArtifactCount} root=${artifact.artifactRoot}\n`,
    );
    return;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  process.stdout.write(
    `Wrote ${V42_PROMOTION_READINESS_REPORT_ARTIFACT_PATH} artifacts=${artifact.coverage.gateArtifactCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
