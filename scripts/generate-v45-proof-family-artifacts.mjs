#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  V45_PROOF_FAMILY_ARTIFACT_PATHS,
  V45_PROOF_FAMILY_GENERATED_AT,
  V45_PROOF_FAMILY_GENERATED_OUTPUTS,
  V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
  V45_PROOF_FAMILY_PROVEN_PATH,
  buildV21CanonicalInputReport,
  buildV21GeneratedArtifactContents,
  buildV21SpecFamilyReport,
  buildV45ProofFamilyArtifacts,
  buildV45ProofFamilyProvenMarkdown,
} from '../packages/specifying/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const GENERATOR_ID = 'generate-v45-proof-family-artifacts';

function parseArgs(argv) {
  return {
    check: argv.includes('--check'),
  };
}

function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeGenerated(relativePath, content) {
  const outputPath = path.join(repoRoot, relativePath);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, content);
}

function compareGenerated(relativePath, content, failures) {
  const outputPath = path.join(repoRoot, relativePath);
  let current = '';
  try {
    current = readFileSync(outputPath, 'utf8');
  } catch {
    failures.push(`${relativePath} is missing. Run pnpm run generate:v45-proof-families.`);
    return;
  }
  if (current !== content) {
    failures.push(`${relativePath} is stale. Run pnpm run generate:v45-proof-families.`);
  }
}

function buildAll() {
  const proofFamilies = buildV45ProofFamilyArtifacts({
    generatedAt: V45_PROOF_FAMILY_GENERATED_AT,
    proofSourceCommit: V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
    repoRoot,
  });
  const specFamilyReport = buildV21SpecFamilyReport({
    repoRoot,
    version: 'V45',
    mode: 'draft',
    currentTarget: 'V44',
  });
  const canonicalInputReport = buildV21CanonicalInputReport({
    repoRoot,
    currentTarget: 'V45',
    reportVersion: 'V45',
    skipPointerCheck: true,
    assumeExistingRelativePaths: [...V45_PROOF_FAMILY_GENERATED_OUTPUTS],
  });
  const specifyingArtifacts = buildV21GeneratedArtifactContents({
    version: 'V45',
    proofSourceCommit: V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
    generatedAt: V45_PROOF_FAMILY_GENERATED_AT,
    generatorId: GENERATOR_ID,
    worktreeState: 'draft-gate16-source-safe',
    specFamilyReport,
    canonicalInputReport,
  });
  const provenMarkdown = buildV45ProofFamilyProvenMarkdown({
    artifacts: proofFamilies,
    specFamilyReport,
    canonicalInputReport,
  });

  const outputs = new Map();
  for (const artifact of proofFamilies.artifacts) {
    outputs.set(artifact.artifactPath, serialize(artifact));
  }
  for (const [relativePath, content] of Object.entries(specifyingArtifacts)) {
    outputs.set(relativePath, content);
  }
  outputs.set(V45_PROOF_FAMILY_PROVEN_PATH, provenMarkdown);

  return {
    proofFamilies,
    specFamilyReport,
    canonicalInputReport,
    outputs,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const built = buildAll();
  const failures = [
    ...built.proofFamilies.failures,
    ...built.specFamilyReport.failures.map((failure) => `spec family: ${failure}`),
    ...built.canonicalInputReport.failures.map((failure) => `canonical inputs: ${failure}`),
  ];

  for (const requiredPath of V45_PROOF_FAMILY_ARTIFACT_PATHS) {
    if (!built.outputs.has(requiredPath)) {
      failures.push(`missing generated proof family output ${requiredPath}`);
    }
  }

  if (args.check) {
    for (const [relativePath, content] of built.outputs.entries()) {
      compareGenerated(relativePath, content, failures);
    }
    if (failures.length > 0) {
      process.stderr.write('V45 proof-family generated artifacts failed:\n');
      for (const failure of failures) process.stderr.write(`- ${failure}\n`);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(
      `V45 proof-family artifacts ok families=${built.proofFamilies.artifactCount} root=${built.proofFamilies.aggregateRoot}\n`,
    );
    return;
  }

  for (const [relativePath, content] of built.outputs.entries()) {
    writeGenerated(relativePath, content);
  }
  if (failures.length > 0) {
    process.stderr.write('Wrote V45 proof-family artifacts with repair-required evidence:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `Wrote V45 proof-family artifacts families=${built.proofFamilies.artifactCount} root=${built.proofFamilies.aggregateRoot}\n`,
  );
}

main();
