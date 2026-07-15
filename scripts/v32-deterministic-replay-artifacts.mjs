import { createHash } from 'node:crypto';
import {
  V32_PROOF_COVERAGE_MATRIX_ARTIFACT,
  buildV32ProofCoverageMatrix,
  stableStringify
} from './v32-proof-coverage-matrix.mjs';

export const V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT = '.proofs/v32/deterministic-replay-report.json';
export const V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT = '.proofs/v32/artifact-volatility-inventory.json';
export const V32_REPLAY_GENERATED_AT = '2026-05-22T00:00:00.000Z';

export const V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS = Object.freeze([
  V32_PROOF_COVERAGE_MATRIX_ARTIFACT,
  V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT,
  V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT
]);

const V32_EXPECTED_SOURCE_COMMITS = Object.freeze({
  [V32_PROOF_COVERAGE_MATRIX_ARTIFACT]: 'draft-gate-2-source-derived',
  [V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT]: 'draft-gate-3-source-derived',
  [V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT]: 'draft-gate-3-source-derived'
});

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_')
]);
const VOLATILE_KEY_PATTERN = /(^|\.)(random|nonce|uuid|timestamp|createdAt|updatedAt)$/u;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'u');

export function buildV32SourceSafetyProbeToken() {
  return SECRET_MARKERS[0];
}

function sha256(content) {
  return `sha256:${createHash('sha256').update(content).digest('hex')}`;
}

function byteLength(content) {
  return Buffer.byteLength(content, 'utf8');
}

function countBy(entries, key) {
  return entries.reduce((counts, entry) => {
    const value = entry[key] || 'unknown';
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function readField(value, path) {
  return path.split('.').reduce((cursor, field) => (cursor && typeof cursor === 'object' ? cursor[field] : undefined), value);
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function walkJson(value, visitor, path = '') {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkJson(entry, visitor, `${path}[${index}]`));
    return;
  }
  if (!isObject(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    const fieldPath = path ? `${path}.${key}` : key;
    visitor(fieldPath, key, entry);
    walkJson(entry, visitor, fieldPath);
  }
}

export function buildV32ReplaySourceArtifacts() {
  return {
    [V32_PROOF_COVERAGE_MATRIX_ARTIFACT]: stableStringify(buildV32ProofCoverageMatrix())
  };
}

function buildArtifactComparison(artifactPath, firstContent, secondContent) {
  return {
    artifactPath,
    byteEqual: firstContent === secondContent,
    byteLength: byteLength(firstContent),
    firstDigest: sha256(firstContent),
    secondDigest: sha256(secondContent)
  };
}

function scanArtifactForVolatility(artifactPath, content) {
  const findings = [];
  let parsed = null;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    findings.push({
      artifactPath,
      classification: 'blocking-malformed',
      fieldPath: '$',
      reason: error instanceof Error ? error.message : String(error),
      value: 'unparseable-json'
    });
    return findings;
  }

  if (stableStringify(parsed) === content) {
    findings.push({
      artifactPath,
      classification: 'canonical-stable',
      fieldPath: '$',
      reason: 'artifact bytes match stable sorted JSON serialization',
      value: 'stable-json-order'
    });
  } else {
    findings.push({
      artifactPath,
      classification: 'blocking-unstable-order',
      fieldPath: '$',
      reason: 'artifact bytes differ from stable sorted JSON serialization',
      value: 'unstable-json-order'
    });
  }

  walkJson(parsed, (fieldPath, key, value) => {
    if (key === 'generatedAt') {
      findings.push({
        artifactPath,
        classification: value === V32_REPLAY_GENERATED_AT ? 'context-bound' : 'blocking-volatile',
        fieldPath,
        reason: value === V32_REPLAY_GENERATED_AT
          ? 'generatedAt is fixed by V32 replay context'
          : 'generatedAt is not normalized to the V32 replay context',
        value
      });
    } else if (VOLATILE_KEY_PATTERN.test(fieldPath)) {
      findings.push({
        artifactPath,
        classification: 'blocking-volatile',
        fieldPath,
        reason: 'field name is volatile and is not in the accepted V32 replay inventory',
        value
      });
    }
  });

  if (SECRET_PATTERN.test(content)) {
    findings.push({
      artifactPath,
      classification: 'blocking-source-safety',
      fieldPath: '$',
      reason: 'artifact contains a secret-like token or secret environment variable name',
      value: 'redacted'
    });
  }

  return findings;
}

export function buildV32ArtifactVolatilityInventory(sourceArtifacts = buildV32ReplaySourceArtifacts()) {
  const scannedFindings = Object.entries(sourceArtifacts).flatMap(([artifactPath, content]) => scanArtifactForVolatility(artifactPath, content));
  const acceptedVolatileFields = V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS.map((artifactPath) => ({
    artifactPath,
    classification: 'context-bound',
    fieldPath: 'generatedAt',
    normalizedValue: V32_REPLAY_GENERATED_AT,
    reason: 'V32 generated artifacts use a fixed replay context timestamp so byte equality remains meaningful.'
  }));
  const findings = [
    ...scannedFindings,
    ...acceptedVolatileFields.map((entry) => ({
      artifactPath: entry.artifactPath,
      classification: entry.classification,
      fieldPath: entry.fieldPath,
      reason: entry.reason,
      value: entry.normalizedValue
    }))
  ];
  const blockingFindings = findings.filter((finding) => String(finding.classification).startsWith('blocking-'));

  return {
    artifactId: 'v32-artifact-volatility-inventory',
    schemaId: 'bitcode.v32.artifactVolatilityInventory.v1',
    version: 'V32',
    currentTarget: 'V31',
    sourceCommit: 'draft-gate-3-source-derived',
    command: 'pnpm run generate:v32-deterministic-replay-artifacts',
    generatedAt: V32_REPLAY_GENERATED_AT,
    scannedArtifactPaths: Object.keys(sourceArtifacts).sort(),
    generatedArtifactPaths: [...V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS],
    acceptedVolatileFields,
    classificationCounts: countBy(findings, 'classification'),
    findingCount: findings.length,
    findings,
    blockingFindings,
    sourceSafetyVerdict: blockingFindings.some((finding) => finding.classification === 'blocking-source-safety')
      ? 'blocked'
      : 'source-safe',
    passed: blockingFindings.length === 0
  };
}

export function buildV32DeterministicReplayReport() {
  const firstSourceArtifacts = buildV32ReplaySourceArtifacts();
  const secondSourceArtifacts = buildV32ReplaySourceArtifacts();
  const firstInventory = buildV32ArtifactVolatilityInventory(firstSourceArtifacts);
  const secondInventory = buildV32ArtifactVolatilityInventory(secondSourceArtifacts);
  const firstArtifacts = {
    ...firstSourceArtifacts,
    [V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT]: stableStringify(firstInventory)
  };
  const secondArtifacts = {
    ...secondSourceArtifacts,
    [V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT]: stableStringify(secondInventory)
  };
  const artifactComparisons = Object.keys(firstArtifacts)
    .sort()
    .map((artifactPath) => buildArtifactComparison(artifactPath, firstArtifacts[artifactPath], secondArtifacts[artifactPath]));
  const allReplayArtifactsByteEqual = artifactComparisons.every((entry) => entry.byteEqual);

  return {
    artifactId: 'v32-deterministic-replay-report',
    schemaId: 'bitcode.v32.deterministicReplayReport.v1',
    version: 'V32',
    currentTarget: 'V31',
    sourceCommit: 'draft-gate-3-source-derived',
    command: 'pnpm run generate:v32-deterministic-replay-artifacts',
    generatedAt: V32_REPLAY_GENERATED_AT,
    runCount: 2,
    replayCommands: [
      'pnpm run generate:v32-proof-coverage-matrix',
      'pnpm run generate:v32-deterministic-replay-artifacts'
    ],
    replaySourceArtifacts: Object.keys(firstSourceArtifacts).sort(),
    generatedArtifactPaths: [...V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS],
    artifactComparisons,
    allReplayArtifactsByteEqual,
    volatilityInventoryArtifact: V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT,
    volatilityBlockingFindingCount: firstInventory.blockingFindings.length,
    sourceSafetyVerdict: firstInventory.sourceSafetyVerdict,
    failureModeCoverage: [
      'missing-path',
      'stale-source-commit',
      'malformed-schema',
      'source-safety-violation',
      'unstable-json-order'
    ],
    passed: allReplayArtifactsByteEqual && firstInventory.passed
  };
}

export function buildV32DeterministicReplayArtifactPackage() {
  const sourceArtifacts = buildV32ReplaySourceArtifacts();
  const volatilityInventory = buildV32ArtifactVolatilityInventory(sourceArtifacts);
  const deterministicReplayReport = buildV32DeterministicReplayReport();
  return {
    ...sourceArtifacts,
    [V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT]: stableStringify(volatilityInventory),
    [V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT]: stableStringify(deterministicReplayReport)
  };
}

export function validateV32DeterministicReplayArtifactFiles(artifactFiles) {
  const expectedFiles = buildV32DeterministicReplayArtifactPackage();
  const failures = [];
  const parsedByPath = {};

  for (const artifactPath of V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS) {
    const actual = artifactFiles[artifactPath];
    const expected = expectedFiles[artifactPath];
    if (typeof actual !== 'string') {
      failures.push({
        failureMode: 'missing-path',
        artifactPath,
        detail: `${artifactPath} is missing.`
      });
      continue;
    }
    if (SECRET_PATTERN.test(actual)) {
      failures.push({
        failureMode: 'source-safety-violation',
        artifactPath,
        detail: `${artifactPath} contains secret-like material.`
      });
    }

    let parsed = null;
    try {
      parsed = JSON.parse(actual);
      parsedByPath[artifactPath] = parsed;
    } catch (error) {
      failures.push({
        failureMode: 'malformed-schema',
        artifactPath,
        detail: error instanceof Error ? error.message : String(error)
      });
      continue;
    }

    const expectedSourceCommit = V32_EXPECTED_SOURCE_COMMITS[artifactPath];
    if (expectedSourceCommit && readField(parsed, 'sourceCommit') !== expectedSourceCommit) {
      failures.push({
        failureMode: 'stale-source-commit',
        artifactPath,
        detail: `${artifactPath} sourceCommit must be ${expectedSourceCommit}.`
      });
    }

    if (stableStringify(parsed) !== actual) {
      failures.push({
        failureMode: 'unstable-json-order',
        artifactPath,
        detail: `${artifactPath} must use stable sorted JSON ordering.`
      });
    }

    if (actual !== expected) {
      failures.push({
        failureMode: 'stale-artifact',
        artifactPath,
        detail: `${artifactPath} does not match generated V32 replay output.`
      });
    }
  }

  const report = parsedByPath[V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT];
  if (report) {
    if (report.passed !== true) {
      failures.push({
        failureMode: 'failed-replay-report',
        artifactPath: V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT,
        detail: 'deterministic replay report must pass.'
      });
    }
    if (!Array.isArray(report.artifactComparisons) || report.artifactComparisons.length < 2) {
      failures.push({
        failureMode: 'malformed-schema',
        artifactPath: V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT,
        detail: 'deterministic replay report must include artifact comparisons.'
      });
    } else if (!report.artifactComparisons.every((entry) => entry.byteEqual === true && entry.firstDigest === entry.secondDigest)) {
      failures.push({
        failureMode: 'failed-replay-report',
        artifactPath: V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT,
        detail: 'deterministic replay report includes non-equal artifact bytes.'
      });
    }
  }

  const inventory = parsedByPath[V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT];
  if (inventory) {
    if (inventory.passed !== true || !Array.isArray(inventory.blockingFindings) || inventory.blockingFindings.length !== 0) {
      failures.push({
        failureMode: 'blocking-volatility',
        artifactPath: V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT,
        detail: 'artifact volatility inventory must pass with zero blocking findings.'
      });
    }
    const acceptedKeys = new Set((inventory.acceptedVolatileFields || []).map((entry) => `${entry.artifactPath}:${entry.fieldPath}`));
    for (const artifactPath of V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS) {
      if (!acceptedKeys.has(`${artifactPath}:generatedAt`)) {
        failures.push({
          failureMode: 'missing-volatility-inventory',
          artifactPath,
          detail: `${artifactPath} generatedAt must be explicitly represented in acceptedVolatileFields.`
        });
      }
    }
  }

  return {
    passed: failures.length === 0,
    failures
  };
}
