#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  V38_READ_NEED_COMPREHENSION_HARDENING_ARTIFACT_PATH,
  buildV38ReadNeedComprehensionInferenceHardening,
} from '../packages/specifying/src/canonical/read-need-comprehension-inference-hardening.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    check: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') args.check = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/generate-v38-read-need-comprehension-inference-hardening.mjs [--check] [--repo-root <path>]',
      '',
      'Generates or checks the V38 Gate 6 ReadNeedComprehensionSynthesis inference-hardening report.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const artifact = buildV38ReadNeedComprehensionInferenceHardening({ repoRoot: args.repoRoot });
  const outputPath = path.join(args.repoRoot, V38_READ_NEED_COMPREHENSION_HARDENING_ARTIFACT_PATH);
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

  if (args.check) {
    const current = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '';
    if (current !== serialized) {
      process.stderr.write(
        `${V38_READ_NEED_COMPREHENSION_HARDENING_ARTIFACT_PATH} is stale. Run pnpm run generate:v38-read-need-comprehension-inference-hardening.\n`,
      );
      process.exitCode = 1;
      return;
    }
    if (!artifact.passed) {
      process.stderr.write(`V38 ReadNeedComprehensionSynthesis hardening failed:\n${artifact.coverage.failedPredicateIds.map((id) => `- ${id}`).join('\n')}\n`);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(
      `V38 ReadNeedComprehensionSynthesis hardening ok rows=${artifact.rows.length} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
    );
    return;
  }

  writeFileSync(outputPath, serialized);
  process.stdout.write(
    `Wrote ${V38_READ_NEED_COMPREHENSION_HARDENING_ARTIFACT_PATH} rows=${artifact.rows.length} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
  );
  if (!artifact.passed) process.exitCode = 1;
}

main();
