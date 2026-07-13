import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  V26_INFERENCE_IMPLEMENTATION_RECORD_REQUIRED_FIELDS,
  V26_INFERENCE_IMPLEMENTATION_SECTION_REQUIREMENTS,
  V26_INFERENCE_IMPLEMENTATION_RECORDS,
  V26_INFERENCE_VERIFICATION_EVIDENCE_TYPES,
  validateV26InferenceImplementationRecords
} from '../src/canonical/inference-implementation-records.js';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname, '..');

function repoFileExists(filePath) {
  return existsSync(path.join(repoRoot, filePath));
}

test('V26 inference implementation records cover required prompt/tool/agent/execution fields', () => {
  const validation = validateV26InferenceImplementationRecords({ fileExists: repoFileExists });

  assert.equal(validation.passed, true);
  assert.equal(validation.recordCount, V26_INFERENCE_IMPLEMENTATION_RECORDS.length);
  assert.deepEqual(validation.requiredFields, V26_INFERENCE_IMPLEMENTATION_RECORD_REQUIRED_FIELDS);
  assert.deepEqual(validation.requiredSectionFields, V26_INFERENCE_IMPLEMENTATION_SECTION_REQUIREMENTS);
  assert.deepEqual(validation.verificationEvidenceTypes, V26_INFERENCE_VERIFICATION_EVIDENCE_TYPES);
  assert.deepEqual(
    validation.recordChecks.filter((check) => check.passed !== true),
    []
  );
  assert.deepEqual(
    validation.recordChecks.flatMap((check) => check.missingSectionFields),
    []
  );
  assert.deepEqual(
    V26_INFERENCE_IMPLEMENTATION_RECORDS.flatMap((record) =>
      record.promptImplementation.registryLayering ? [] : [record.recordId]
    ),
    []
  );
  assert.deepEqual(
    validation.recordChecks.flatMap((check) => check.missingImplementationOwnerRefs),
    []
  );
  assert.deepEqual(
    validation.recordChecks.flatMap((check) => check.missingVerificationEvidenceRefs),
    []
  );
  assert.deepEqual(
    validation.recordChecks.flatMap((check) => check.declaredVerificationGaps),
    []
  );
  assert.deepEqual(
    validation.recordChecks.filter((check) => check.hasExecutableOrGeneratedVerificationEvidence !== true),
    []
  );
});

test('V26 inference implementation registry names every current fifth-gate inference family', () => {
  const recordIds = V26_INFERENCE_IMPLEMENTATION_RECORDS.map((record) => record.recordId).sort();

  assert.deepEqual(recordIds, [
    'agent-infrastructure',
    'asset-pack-synthesis-compatibility',
    'conversation-inference',
    'execution-infrastructure',
    'external-evidence-research-support',
    'mcp-external-ingress',
    'read-comprehension-reform',
    'read-review-before-fit-search',
    'read-risk-admission-support',
    'pipeline-infrastructure',
    'prompt-primitives',
    'tool-prompt-infrastructure'
  ]);
});

test('V26 inference implementation registry binds records to canonical Bitcode semantics', () => {
  const recordsById = Object.fromEntries(
    V26_INFERENCE_IMPLEMENTATION_RECORDS.map((record) => [record.recordId, record])
  );

  assert.match(recordsById['prompt-primitives'].canonicalRead, /prompt substrate/u);
  assert.match(recordsById['tool-prompt-infrastructure'].canonicalRead, /tool descriptions/u);
  assert.match(recordsById['agent-infrastructure'].canonicalRead, /agent roles/u);
  assert.match(recordsById['execution-infrastructure'].canonicalRead, /execution tree/u);
  assert.match(recordsById['pipeline-infrastructure'].canonicalRead, /Bitcode runs/u);
  assert.match(recordsById['conversation-inference'].canonicalRead, /rich-input Bitcode write surface/u);
  assert.match(recordsById['asset-pack-synthesis-compatibility'].canonicalRead, /asset-pack written-asset synthesis/u);
  assert.match(recordsById['asset-pack-synthesis-compatibility'].canonicalRead, /delivery-mechanism compatibility/u);
  assert.match(recordsById['read-comprehension-reform'].canonicalRead, /setup-phase Bitcode Read comprehension/u);
  assert.match(recordsById['read-comprehension-reform'].canonicalRead, /source-to-shares service questions/u);
  assert.match(recordsById['read-comprehension-reform'].canonicalRead, /commercial accountability/u);
  assert.match(recordsById['read-comprehension-reform'].canonicalRead, /written-asset expectations/u);
  assert.match(recordsById['read-comprehension-reform'].canonicalRead, /AssetPack context/u);
  assert.match(recordsById['read-review-before-fit-search'].canonicalRead, /before any candidate recall/u);
  assert.match(recordsById['read-review-before-fit-search'].canonicalRead, /source-to-shares settlement review/u);
  assert.match(recordsById['external-evidence-research-support'].canonicalRead, /discovery phase/u);
  assert.match(recordsById['external-evidence-research-support'].canonicalRead, /read synthesis/u);
  assert.match(recordsById['read-risk-admission-support'].canonicalRead, /pipeline phase/u);
  assert.match(recordsById['read-risk-admission-support'].canonicalRead, /AssetPack/u);
  assert.match(recordsById['read-risk-admission-support'].canonicalRead, /risk/u);
  assert.match(recordsById['mcp-external-ingress'].canonicalRead, /fail-closed ingress/u);
  assert.match(recordsById['prompt-primitives'].promptImplementation.registryLayering, /Prompt extends RegistryImpl<PromptPart>/u);
  assert.match(recordsById['prompt-primitives'].promptImplementation.registryLayering, /raw_promptparts\/generic holds reusable base PromptPart layers/u);
  assert.match(recordsById['prompt-primitives'].promptImplementation.registryLayering, /raw_promptparts\/specific holds concrete Bitcode implementation PromptParts/u);
  assert.ok(
    recordsById['pipeline-infrastructure'].agentImplementation.owners.includes(
      'packages/pipelines-generics/src/phases/sdivf-factory.ts'
    )
  );
  assert.match(recordsById['pipeline-infrastructure'].agentImplementation.contract, /Finish/u);
  assert.doesNotMatch(recordsById['pipeline-infrastructure'].agentImplementation.contract, /shipping/u);
  assert.match(recordsById['asset-pack-synthesis-compatibility'].promptImplementation.registryLayering, /Generic PTRR and formatting PromptParts form base layers/u);
  assert.match(recordsById['asset-pack-synthesis-compatibility'].promptImplementation.registryLayering, /specific setup, validation, Finish, and delivery-mechanism PromptParts implement Bitcode read/u);
  assert.match(recordsById['asset-pack-synthesis-compatibility'].promptImplementation.rawPromptPartBoundary, /SYSTEMTEXTSEARCH PromptParts/u);
  assert.match(recordsById['asset-pack-synthesis-compatibility'].promptImplementation.rawPromptPartBoundary, /TEXTSEARCHER/u);
  assert.match(recordsById['asset-pack-synthesis-compatibility'].toolImplementation.contract, /repository-evidence search tools are bounded grep-backed support/u);
  assert.ok(
    recordsById['asset-pack-synthesis-compatibility'].promptImplementation.owners.includes(
      'packages/generic-agents/text-searcher/src/prompts/agent-prompt-text-searcher.ts'
    )
  );
  assert.ok(
    recordsById['asset-pack-synthesis-compatibility'].agentImplementation.owners.includes(
      'packages/generic-agents/text-searcher/src/index.ts'
    )
  );
  assert.ok(
    recordsById['asset-pack-synthesis-compatibility'].promptImplementation.owners.includes(
      'packages/generic-tools/simple-system-text-search/src/prompts/BitcodeRepositoryEvidenceSearchDocCodeToolPrompt.ts'
    )
  );
  assert.ok(
    recordsById['asset-pack-synthesis-compatibility'].toolImplementation.owners.includes(
      'packages/generic-tools/simple-system-text-search/src/index.ts'
    )
  );
  assert.deepEqual(recordsById['read-comprehension-reform'].toolImplementation.owners, [
    'packages/generic-tools/read-comprehension/src/AnalyzeReadSemanticsTool.ts',
    'packages/generic-tools/read-comprehension/src/ExtractReadRequirementsTool.ts',
    'packages/generic-tools/read-comprehension/src/IdentifyReadConstraintsTool.ts',
    'packages/generic-tools/read-comprehension/src/GenerateReadSatisfactionCriteriaTool.ts',
    'packages/generic-tools/read-comprehension/src/ValidateReadComprehensionTool.ts',
    'packages/generic-tools/read-comprehension/src/AnalyzeReadSatisfactionImplementationComplexityTool.ts',
    'packages/generic-tools/read-comprehension/src/ReadComprehensionToolset.ts',
    'packages/generic-tools/read-comprehension/src/read-comprehension-primitives.ts',
    'packages/generic-tools/read-comprehension/src/read-comprehension-schemas.ts'
  ]);
  assert.match(recordsById['read-comprehension-reform'].toolImplementation.contract, /Canonical read-first tools are individually defined/u);
  assert.match(recordsById['read-comprehension-reform'].toolImplementation.contract, /collected by ReadComprehensionToolset/u);
  assert.match(recordsById['read-comprehension-reform'].toolImplementation.contract, /callable capabilities, not agents/u);
  assert.match(recordsById['read-comprehension-reform'].toolImplementation.contract, /source-to-shares service questions/u);
  assert.match(recordsById['read-comprehension-reform'].toolImplementation.contract, /commercial accountability evidence/u);
  assert.doesNotMatch(recordsById['read-comprehension-reform'].toolImplementation.contract, /noncanonical.*retained|compatibility/u);
  assert.ok(
    recordsById['read-comprehension-reform'].agentImplementation.owners.includes(
      'packages/generic-agents/read-comprehension/src/index.ts'
    )
  );
  assert.ok(
    recordsById['read-comprehension-reform'].agentImplementation.owners.includes(
      'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-read-agent.ts'
    )
  );
  assert.match(recordsById['read-comprehension-reform'].agentImplementation.contract, /bitcodeSetupReadComprehensionAgent/u);
  assert.match(recordsById['read-comprehension-reform'].agentImplementation.contract, /setup\/pre-danger-wall PTRR agent/u);
  assert.match(recordsById['read-comprehension-reform'].agentImplementation.contract, /generic-tools Read-comprehension toolset/u);
  assert.match(recordsById['read-comprehension-reform'].agentImplementation.contract, /service-question/u);
  assert.match(recordsById['read-comprehension-reform'].agentImplementation.contract, /commercial-accountability/u);
  assert.match(recordsById['read-review-before-fit-search'].executionImplementation.carriers.join(' '), /\.bitcode\/read-review\.json/u);
  assert.match(recordsById['read-review-before-fit-search'].toolImplementation.contract, /blocked unless the measured Read review admits it/u);
  assert.equal(recordsById['read-review-before-fit-search'].boundaryPosture, 'active');
  assert.match(recordsById['external-evidence-research-support'].promptImplementation.rawPromptPartBoundary, /WEBRESEARCHER.*PromptParts/u);
  assert.match(recordsById['external-evidence-research-support'].promptImplementation.rawPromptPartBoundary, /WEBSEARCH/u);
  assert.match(recordsById['external-evidence-research-support'].promptImplementation.rawPromptPartBoundary, /GETCONTENTS_DOCCODE/u);
  assert.match(recordsById['external-evidence-research-support'].promptImplementation.rawPromptPartBoundary, /read-synthesis web research/u);
  assert.match(recordsById['external-evidence-research-support'].agentImplementation.contract, /bitcodeReadSynthesisWebResearcher/u);
  assert.match(recordsById['external-evidence-research-support'].agentImplementation.contract, /bitcodeReadSynthesisWebSearch/u);
  assert.match(recordsById['external-evidence-research-support'].toolImplementation.contract, /discovery-phase read synthesis/u);
  assert.ok(
    recordsById['external-evidence-research-support'].promptImplementation.owners.includes(
      'packages/generic-agents/web-search/src/prompts/agent-prompt-web-search.ts'
    )
  );
  assert.ok(
    recordsById['external-evidence-research-support'].promptImplementation.owners.includes(
      'packages/generic-tools/web-search/src/prompts/WebSearchDocCodeToolPrompt.ts'
    )
  );
  assert.ok(
    recordsById['external-evidence-research-support'].agentImplementation.owners.includes(
      'packages/generic-agents/web-search/src/index.ts'
    )
  );
  assert.match(recordsById['read-risk-admission-support'].promptImplementation.rawPromptPartBoundary, /DANGERWALL PromptParts/u);
  assert.match(recordsById['read-risk-admission-support'].promptImplementation.rawPromptPartBoundary, /risk-admission/u);
  assert.match(recordsById['read-risk-admission-support'].promptImplementation.registryLayering, /delivery-mechanism/u);
  assert.match(recordsById['read-risk-admission-support'].promptImplementation.registryLayering, /likely-execution-failure/u);
  assert.match(recordsById['read-risk-admission-support'].agentImplementation.contract, /bitcodeReadRiskAdmissionAgent/u);
  assert.match(recordsById['read-risk-admission-support'].toolImplementation.contract, /admission ambiguity/u);

  assert.equal(recordsById['asset-pack-synthesis-compatibility'].boundaryPosture, 'compatibility');
  assert.equal(recordsById['read-comprehension-reform'].boundaryPosture, 'active');
  assert.equal(recordsById['external-evidence-research-support'].boundaryPosture, 'admitted support');
  assert.equal(recordsById['read-risk-admission-support'].boundaryPosture, 'admitted support');
  assert.equal(recordsById['mcp-external-ingress'].boundaryPosture, 'ingress');
});
