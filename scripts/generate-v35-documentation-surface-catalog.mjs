#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH,
  buildDocumentationSurfaceCatalog,
} from '../packages/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const GENERATED_AT = '2026-05-24T00:00:00.000Z';

function parseArgs(argv) {
  return {
    check: argv.includes('--check'),
    write: argv.includes('--write') || !argv.includes('--check'),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = buildDocumentationSurfaceCatalog({
    generatedAt: GENERATED_AT,
    repoRoot,
  });
  const outputPath = path.join(repoRoot, DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH);
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;

  if (args.check) {
    const current = readFileSync(outputPath, 'utf8');
    if (current !== serialized) {
      process.stderr.write(`${DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH} is stale. Run pnpm run generate:v35-documentation-surface-catalog.\n`);
      process.exitCode = 1;
      return;
    }
    if (!artifact.passed) {
      process.stderr.write(`Documentation surface catalog failed:\n${artifact.failures.map((failure) => `- ${failure}`).join('\n')}\n`);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(`Documentation surface catalog ok rows=${artifact.rows.length} root=${artifact.artifactRoot}\n`);
    return;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  process.stdout.write(`Wrote ${DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH} rows=${artifact.rows.length} root=${artifact.artifactRoot}\n`);
}

main();
