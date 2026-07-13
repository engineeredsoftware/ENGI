import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V45_PROOF_FAMILY_ARTIFACT_PATHS,
  V45_PROOF_FAMILY_GENERATED_OUTPUTS,
  V45_PROOF_FAMILY_IDS,
  V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
  V45_PROOF_FAMILY_SOURCE_SAFETY_VERDICT,
  buildV45ProofFamilyArtifacts,
  buildV45ProofFamilyProvenMarkdown,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const forbiddenMarkers = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
  '-----BEGIN ',
];

function assertNoForbiddenMarkers(value) {
  const serialized = JSON.stringify(value);
  for (const marker of forbiddenMarkers) {
    assert.equal(serialized.includes(marker), false, `forbidden marker leaked: ${marker}`);
  }
}

test('builds all nine V45 proof-family artifacts', () => {
  const built = buildV45ProofFamilyArtifacts({
    repoRoot,
    proofSourceCommit: V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
  });

  assert.equal(built.version, 'V45');
  assert.equal(built.currentTarget, 'V44');
  assert.equal(built.artifactCount, 9);
  assert.equal(built.passed, true);
  assert.equal(built.aggregateProofVerdict, 'pass');
  assert.deepEqual(built.expectedArtifactPaths, [...V45_PROOF_FAMILY_ARTIFACT_PATHS]);
  assert.deepEqual(
    built.artifacts.map((artifact) => artifact.proofFamilyId),
    [...V45_PROOF_FAMILY_IDS],
  );
  assert.match(built.aggregateRoot, /^v45-proof-family-artifacts:[a-f0-9]{24}$/u);
});

test('keeps generated V45 proof artifacts source-safe', () => {
  const built = buildV45ProofFamilyArtifacts({
    repoRoot,
    proofSourceCommit: V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
  });

  for (const artifact of built.artifacts) {
    assert.equal(artifact.schemaId, 'bitcode.v45.proofFamilyArtifact.v1');
    assert.equal(artifact.sourceSafetyVerdict, V45_PROOF_FAMILY_SOURCE_SAFETY_VERDICT);
    assert.equal(artifact.status, 'pass');
    assert.equal(artifact.passed, true);
    assert.equal(artifact.failures.length, 0);
    assert.equal(artifact.sourceSafety.sourceSafeMetadataOnly, true);
    assert.equal(artifact.sourceSafety.protectedSourceSerialized, false);
    assert.equal(artifact.sourceSafety.rawPromptSerialized, false);
    assert.equal(artifact.sourceSafety.rawInterpolatedPromptSerialized, false);
    assert.equal(artifact.sourceSafety.rawProviderResponseSerialized, false);
    assert.equal(artifact.sourceSafety.walletPrivateMaterialSerialized, false);
    assert.equal(artifact.sourceSafety.credentialsSerialized, false);
    assert.equal(artifact.sourceSafety.privateSettlementPayloadSerialized, false);
    assert.equal(artifact.sourceSafety.unpaidAssetPackSourceSerialized, false);
    assert.equal(artifact.memberInventory.length > 0, true);
    assert.equal(artifact.theoremInventory.length > 0, true);
    assert.equal(artifact.replayStepInventory.length > 0, true);
    assert.equal(artifact.witnessArtifactInventory.length > 0, true);
    assert.equal(artifact.generatedArtifactInventory.includes('BITCODE_SPEC_V45_PROVEN.md'), true);
    assertNoForbiddenMarkers(artifact);
  }
});

test('renders a source-safe V45 PROVEN appendix', () => {
  const built = buildV45ProofFamilyArtifacts({
    repoRoot,
    proofSourceCommit: V45_PROOF_FAMILY_PROOF_SOURCE_COMMIT,
  });
  const markdown = buildV45ProofFamilyProvenMarkdown({ artifacts: built });

  assert.match(markdown, /# Bitcode Spec V45 Proven/u);
  assert.match(markdown, /Aggregate Proof Verdict/u);
  assert.match(markdown, /Exact Proof-Family Inventory/u);
  assert.match(markdown, /Per-Family Member Inventory/u);
  assert.match(markdown, /Per-Family Theorem Inventory/u);
  assert.match(markdown, /Replay-Step Inventories And Theorem Bindings/u);
  assert.match(markdown, /Witness Artifact Inventories/u);
  assert.match(markdown, /Generated Artifact Inventories/u);
  assert.match(markdown, /Scenario And Run Coverage Matrices/u);
  assert.match(markdown, /proof-source commit/u);
  assert.match(markdown, /missing, stale, contradictory, or unsafe/u);

  for (const artifactPath of V45_PROOF_FAMILY_GENERATED_OUTPUTS) {
    assert.equal(markdown.includes(artifactPath), true, `missing generated artifact ${artifactPath}`);
  }

  for (const marker of forbiddenMarkers) {
    assert.equal(markdown.includes(marker), false, `forbidden marker leaked: ${marker}`);
  }
});
