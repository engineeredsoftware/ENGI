import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V38_FAILSAFE_STAGE_IDS,
  V38_PTRR_FAILSAFE_THRICIFIED_STACK_ARTIFACT_PATH,
  V38_PTRR_FAILSAFE_THRICIFIED_STACK_SOURCE_SAFETY_VERDICT,
  V38_PTRR_STEP_IDS,
  V38_THRICIFIED_GENERATION_STAGE_IDS,
  buildV38PtrrFailsafeThricifiedStack,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V38 PTRR Failsafe and Thricified stack contract', () => {
  const stack = buildV38PtrrFailsafeThricifiedStack({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(stack.artifactId, 'v38-ptrr-failsafe-thricified-stack');
  assert.equal(stack.schemaId, 'bitcode.v38.ptrrFailsafeThricifiedStack.v1');
  assert.equal(stack.version, 'V38');
  assert.equal(stack.currentTarget, 'V37');
  assert.equal(stack.passed, true);
  assert.equal(stack.artifactPath, V38_PTRR_FAILSAFE_THRICIFIED_STACK_ARTIFACT_PATH);
  assert.equal(stack.sourceSafetyVerdict, V38_PTRR_FAILSAFE_THRICIFIED_STACK_SOURCE_SAFETY_VERDICT);
  assert.deepEqual(stack.ptrrStepIds, [...V38_PTRR_STEP_IDS]);
  assert.deepEqual(stack.failsafeStageIds, [...V38_FAILSAFE_STAGE_IDS]);
  assert.deepEqual(stack.thricifiedGenerationStageIds, [...V38_THRICIFIED_GENERATION_STAGE_IDS]);
  assert.equal(stack.failures.length, 0);
  assert.match(stack.artifactRoot, /^v38-ptrr-failsafe-thricified-stack:[a-f0-9]{24}$/u);
});

test('binds every Gate 2 PTRR step to Failsafe and Thricified provider-call slots', () => {
  const stack = buildV38PtrrFailsafeThricifiedStack({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(stack.coverage.rowCount, 9);
  assert.equal(stack.coverage.totalPtrrStepCount, 52);
  assert.equal(stack.coverage.totalFailsafeSequenceCount, 156);
  assert.equal(stack.coverage.totalThricifiedGenerationCount, 156);
  assert.equal(stack.coverage.totalProviderCallCount, 468);
  assert.equal(stack.coverage.expectedProviderCallSlots, 468);
  assert.equal(stack.coverage.providerCallSlotsPerPtrrStep, 9);
  assert.equal(stack.coverage.gate2InventoryRoot.length > 0, true);
  assert.equal(stack.coverage.toolsAreStepOwned, true);
});

test('source predicates prove the practical inference call stack without leaking source payloads', () => {
  const stack = buildV38PtrrFailsafeThricifiedStack({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(stack.coverage.requiredPredicateCount, 69);
  assert.equal(stack.coverage.passedPredicateCount, 69);
  assert.deepEqual(stack.coverage.failedPredicateIds, []);
  assert.equal(stack.coverage.protectedSourceVisible, false);
  assert.equal(stack.coverage.credentialsSerialized, false);
  assert.equal(stack.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(stack.coverage.legacySourceRoots, false);

  for (const row of stack.rows) {
    assert.match(row.rowRoot, /^v38-ptrr-stack-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_ptrr_failsafe_thricified_stack_metadata');
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.sourceRootsPresent, true);
    assert.equal(Array.isArray(row.requiredPredicateIds), true);
    assert.equal(Array.isArray(row.storageTargetIds), true);
    assert.equal(Array.isArray(row.streamTargetIds), true);
  }

  const predicateIds = stack.sourcePredicateResults.map((result) => result.id);
  for (const requiredPredicateId of [
    'agent.requires-one-prompt-carrier',
    'step.plan.creates-failsafe-sequence',
    'step.retry.runs-tools-after-failsafe',
    'failsafe.delegates-to-thricified',
    'generation.sequences-in-order',
    'substep.builds-hierarchical-prompt',
    'gate2.counts-468-provider-call-slots',
  ]) {
    assert.equal(predicateIds.includes(requiredPredicateId), true, `missing ${requiredPredicateId}`);
  }
});
