import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V41_REGISTRY_INTERPOLATION_COMPOSITION_LEVEL_IDS,
  V41_REGISTRY_INTERPOLATION_CONTRACTS_ARTIFACT_PATH,
  V41_REGISTRY_INTERPOLATION_CONTRACTS_SOURCE_SAFETY_VERDICT,
  V41_REGISTRY_INTERPOLATION_DISCLOSURE_TIERS,
  V41_REGISTRY_INTERPOLATION_REQUIRED_FIELD_IDS,
  buildV41RegistryInterpolationContracts,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V41 registry and interpolation contract artifact', () => {
  const artifact = buildV41RegistryInterpolationContracts({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.artifactId, 'v41-registry-interpolation-contracts');
  assert.equal(artifact.schemaId, 'bitcode.v41.registryInterpolationContracts.v1');
  assert.equal(artifact.version, 'V41');
  assert.equal(artifact.currentTarget, 'V40');
  assert.equal(artifact.passed, true);
  assert.equal(artifact.artifactPath, V41_REGISTRY_INTERPOLATION_CONTRACTS_ARTIFACT_PATH);
  assert.equal(artifact.sourceSafetyVerdict, V41_REGISTRY_INTERPOLATION_CONTRACTS_SOURCE_SAFETY_VERDICT);
  assert.match(artifact.artifactRoot, /^v41-registry-interpolation-contract:[a-f0-9]{24}$/u);
  assert.deepEqual(artifact.requiredFieldIds, [...V41_REGISTRY_INTERPOLATION_REQUIRED_FIELD_IDS]);
  assert.deepEqual(artifact.compositionLevelIds, [...V41_REGISTRY_INTERPOLATION_COMPOSITION_LEVEL_IDS]);
  assert.deepEqual(artifact.disclosureTiers, [...V41_REGISTRY_INTERPOLATION_DISCLOSURE_TIERS]);
});

test('proves registry composition, interpolation keys, ancestry frames, and parser targets', () => {
  const artifact = buildV41RegistryInterpolationContracts({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.coverage.rowCount, 12);
  assert.equal(artifact.coverage.requiredPredicateCount >= 50, true);
  assert.equal(artifact.coverage.passedPredicateCount, artifact.coverage.requiredPredicateCount);
  assert.deepEqual(artifact.coverage.failedPredicateIds, []);
  assert.equal(artifact.coverage.registryIdCount >= 20, true);
  assert.equal(artifact.coverage.interpolationKeyCount >= 20, true);
  assert.equal(artifact.coverage.toolPromptInjectionCount >= 5, true);
  assert.equal(artifact.coverage.parserTargetCount >= 6, true);
  assert.equal(artifact.coverage.executionAncestryFrameCount >= 5, true);
  assert.equal(artifact.coverage.sourceRootPresentCount, artifact.coverage.sourceRootCount);
});

test('keeps registry contract metadata source-safe while binding Gate 2 prompt inventory', () => {
  const artifact = buildV41RegistryInterpolationContracts({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.sourceSafety.sourceSafeMetadataOnly, true);
  assert.equal(artifact.sourceSafety.rawPromptTextSerialized, false);
  assert.equal(artifact.sourceSafety.rawProviderResponseSerialized, false);
  assert.equal(artifact.sourceSafety.privateContextSerialized, false);
  assert.equal(artifact.sourceSafety.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.sourceSafety.credentialsSerialized, false);
  assert.equal(artifact.coverage.gate2PromptPartRowCount >= 1000, true);
  assert.equal(artifact.coverage.gate2PromptRowCount >= 20, true);
  assert.equal(artifact.coverage.gate2PromptRowsWithRegistryPaths >= 10, true);
  assert.equal(artifact.coverage.gate2V42RoadmapPrepared, true);

  for (const row of artifact.rows) {
    assert.match(row.rowRoot, /^v41-registry-interpolation-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_registry_interpolation_contract_metadata');
    assert.equal(row.rawPromptTextSerialized, false);
    assert.equal(row.rawProviderResponseSerialized, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.sourceRootsPresent, true);
  }

  const predicateIds = artifact.sourcePredicateResults.map((result) => result.id);
  for (const requiredPredicateId of [
    'prompt.extends-registry',
    'templated.throws-missing-variable',
    'substep.builds-hierarchical-prompt',
    'generationprompt.injects-tool-docs-and-schema',
    'readneed.collects-interpolation-keys',
    'depository.search-has-embedding-policy',
    'gate2.inventory-has-registry-paths',
  ]) {
    assert.equal(predicateIds.includes(requiredPredicateId), true, `missing ${requiredPredicateId}`);
  }
});
