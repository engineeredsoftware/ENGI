#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_ARTIFACT_PATH,
  buildV40PromptBenchmarkSmokeV41Readiness,
} from '../packages/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const GENERATED_AT = '2026-05-25T00:00:00.000Z';

function parseArgs(argv) {
  return {
    check: argv.includes('--check'),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = buildV40PromptBenchmarkSmokeV41Readiness({
    generatedAt: GENERATED_AT,
    repoRoot,
  });
  const outputPath = path.join(repoRoot, V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_ARTIFACT_PATH);
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

  if (args.check) {
    const current = readFileSync(outputPath, 'utf8');
    if (current !== serialized) {
      process.stderr.write(
        `${V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_ARTIFACT_PATH} is stale. Run pnpm run generate:v40-prompt-benchmark-smoke-v41-readiness.\n`,
      );
      process.exitCode = 1;
      return;
    }
    if (!artifact.passed) {
      process.stderr.write(`V40 prompt benchmark smoke artifact failed:\n${artifact.failures.map((failure) => `- ${failure}`).join('\n')}\n`);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(
      `V40 prompt benchmark smoke artifact ok rows=${artifact.coverage.rowCount} v38Fixtures=${artifact.coverage.v38BenchmarkFixtureCount} root=${artifact.artifactRoot}\n`,
    );
    return;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  process.stdout.write(
    `Wrote ${V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_ARTIFACT_PATH} rows=${artifact.coverage.rowCount} v38Fixtures=${artifact.coverage.v38BenchmarkFixtureCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
