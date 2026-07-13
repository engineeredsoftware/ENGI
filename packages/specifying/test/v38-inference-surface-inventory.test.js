import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V38_INFERENCE_SURFACE_INVENTORY_ARTIFACT_PATH,
  V38_INFERENCE_SURFACE_INVENTORY_SOURCE_SAFETY_VERDICT,
  V38_INFERENCE_SURFACE_REQUIRED_FAMILY_IDS,
  V38_INFERENCE_SURFACE_REQUIRED_PRIMITIVE_IDS,
  V38_INFERENCE_SURFACE_REQUIRED_READING_PIPELINE_NAMES,
  buildV38InferenceSurfaceInventory,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V38 inference surface inventory across Reading, Conversation, tools, prompts, and execution primitives', () => {
  const inventory = buildV38InferenceSurfaceInventory({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(inventory.artifactId, 'v38-inference-surface-inventory');
  assert.equal(inventory.schemaId, 'bitcode.v38.inferenceSurfaceInventory.v1');
  assert.equal(inventory.version, 'V38');
  assert.equal(inventory.currentTarget, 'V37');
  assert.equal(inventory.passed, true);
  assert.equal(inventory.artifactPath, V38_INFERENCE_SURFACE_INVENTORY_ARTIFACT_PATH);
  assert.equal(inventory.sourceSafetyVerdict, V38_INFERENCE_SURFACE_INVENTORY_SOURCE_SAFETY_VERDICT);
  assert.equal(inventory.coverage.missingFamilyIds.length, 0);
  assert.equal(inventory.coverage.missingPrimitiveIds.length, 0);
  assert.equal(inventory.coverage.missingSourceRoots.length, 0);
  assert.equal(inventory.coverage.readingPipelinesCovered, true);
  assert.equal(inventory.coverage.conversationSurfacesCovered, true);
  assert.equal(inventory.coverage.toolDefinitionPromptsCovered, true);
  assert.equal(inventory.coverage.interfaceEntrypointsCovered, true);
  assert.equal(inventory.coverage.promptRegistriesCovered, true);
  assert.equal(inventory.coverage.executionPrimitivesCovered, true);
  assert.equal(inventory.coverage.protectedSourceVisible, false);
  assert.equal(inventory.coverage.credentialsSerialized, false);
  assert.equal(inventory.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(inventory.coverage.legacySourceRoots, false);
  assert.match(inventory.artifactRoot, /^v38-inference-surface-inventory:[a-f0-9]{24}$/u);

  for (const familyId of V38_INFERENCE_SURFACE_REQUIRED_FAMILY_IDS) {
    assert.equal(inventory.coverage.observedFamilyIds.includes(familyId), true, `missing ${familyId}`);
  }

  for (const primitiveId of V38_INFERENCE_SURFACE_REQUIRED_PRIMITIVE_IDS) {
    assert.equal(inventory.coverage.observedPrimitiveIds.includes(primitiveId), true, `missing ${primitiveId}`);
  }

  for (const pipelineName of V38_INFERENCE_SURFACE_REQUIRED_READING_PIPELINE_NAMES) {
    assert.equal(inventory.coverage.readingPipelineNames.includes(pipelineName), true, `missing ${pipelineName}`);
  }
});

test('counts every current Reading pipeline inference step and provider-call slot', () => {
  const inventory = buildV38InferenceSurfaceInventory({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  const readNeed = inventory.rows.find((row) => row.surfaceId === 'reading:ReadNeedComprehensionSynthesis');
  const readFits = inventory.rows.find((row) => row.surfaceId === 'reading:ReadFitsFindingSynthesis');
  const conversation = inventory.rows.find((row) => row.surfaceId === 'conversation:comprehensive-conversation');

  assert.ok(readNeed);
  assert.ok(readFits);
  assert.ok(conversation);

  assert.equal(readNeed.phaseCount, 4);
  assert.equal(readNeed.ptrrAgentCount, 4);
  assert.equal(readNeed.ptrrStepCount, 16);
  assert.equal(readNeed.failsafeSequenceCount, 48);
  assert.equal(readNeed.thricifiedGenerationCount, 48);
  assert.equal(readNeed.providerCallCount, 144);

  assert.equal(readFits.phaseCount, 7);
  assert.equal(readFits.ptrrAgentCount, 8);
  assert.equal(readFits.ptrrStepCount, 32);
  assert.equal(readFits.failsafeSequenceCount, 96);
  assert.equal(readFits.thricifiedGenerationCount, 96);
  assert.equal(readFits.providerCallCount, 288);
  assert.equal(readFits.toolCount, 4);

  assert.equal(conversation.ptrrAgentCount, 1);
  assert.equal(conversation.ptrrStepCount, 4);
  assert.equal(conversation.failsafeSequenceCount, 12);
  assert.equal(conversation.thricifiedGenerationCount, 12);
  assert.equal(conversation.providerCallCount, 36);

  assert.equal(inventory.coverage.totalPhaseCount, 13);
  assert.equal(inventory.coverage.totalPtrrAgentCount, 13);
  assert.equal(inventory.coverage.totalPtrrStepCount, 52);
  assert.equal(inventory.coverage.totalFailsafeSequenceCount, 156);
  assert.equal(inventory.coverage.totalThricifiedGenerationCount, 156);
  assert.equal(inventory.coverage.totalProviderCallCount, 468);
  assert.equal(inventory.coverage.totalToolCount, 9);
});

test('rows preserve audit dimensions needed by Gate 3 through Gate 9 repairs', () => {
  const inventory = buildV38InferenceSurfaceInventory({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  for (const row of inventory.rows) {
    assert.match(row.rowRoot, /^v38-inference-surface-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_inference_surface_metadata');
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.sourceRootsPresent, true);
    assert.equal(Array.isArray(row.promptRegistryIds), true);
    assert.equal(Array.isArray(row.promptPartNamespaces), true);
    assert.equal(Array.isArray(row.interpolationBindingIds), true);
    assert.equal(Array.isArray(row.contextFieldIds), true);
    assert.equal(Array.isArray(row.outputSchemaIds), true);
    assert.equal(Array.isArray(row.failureSurfaceIds), true);
    assert.equal(Array.isArray(row.storageTargetIds), true);
    assert.equal(Array.isArray(row.streamTargetIds), true);
  }

  assert.equal(inventory.coverage.knownGapIds.includes('initial-benchmark-suite-completion-owned-by-v38-gate4'), true);
  assert.equal(
    inventory.coverage.knownGapIds.includes('gate3-validates-ptrr-failsafe-thricified-call-stack-against-this-inventory'),
    true,
  );
});
