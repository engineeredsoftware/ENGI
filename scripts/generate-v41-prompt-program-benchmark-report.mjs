#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH,
  buildV41PromptProgramBenchmarkReport,
} from '../scripts/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const GENERATED_AT = '2026-05-26T00:00:00.000Z';

function parseArgs(argv) {
  return {
    check: argv.includes('--check'),
    write: argv.includes('--write') || !argv.includes('--check'),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = buildV41PromptProgramBenchmarkReport({
    generatedAt: GENERATED_AT,
    repoRoot,
  });
  const outputPath = path.join(repoRoot, V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH);
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

  if (args.check) {
    const current = readFileSync(outputPath, 'utf8');
    if (current !== serialized) {
      process.stderr.write(
        `${V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH} is stale. Run pnpm run generate:v41-prompt-program-benchmark-report.\n`,
      );
      process.exitCode = 1;
      return;
    }
    if (!artifact.passed) {
      process.stderr.write(
        `V41 prompt-program benchmark report failed:\n${artifact.failures.map((failure) => `- ${failure}`).join('\n')}\n`,
      );
      process.exitCode = 1;
      return;
    }
    process.stdout.write(
      `V41 prompt-program benchmark report ok rows=${artifact.coverage.rowCount} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
    );
    return;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  process.stdout.write(
    `Wrote ${V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH} rows=${artifact.coverage.rowCount} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
