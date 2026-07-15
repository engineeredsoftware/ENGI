import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const promptSurfaceSource = readFileSync(new URL('../V26_PROMPT_SURFACES.md', import.meta.url), 'utf8');
const inferenceSystemsSource = readFileSync(new URL('../V26_INFERENCE_SYSTEMS.md', import.meta.url), 'utf8');
const promptHierarchyRuleSource = readFileSync(
  new URL('../../packages/eslint-plugin-bitcode/src/requirePromptHierarchy.ts', import.meta.url),
  'utf8'
);
const promptHierarchyRuleDocs = readFileSync(
  new URL('../../packages/eslint-plugin-bitcode/docs/require-prompt-hierarchy.md', import.meta.url),
  'utf8'
);
const uapiTsconfigSource = readFileSync(new URL('../../apps/uapi/tsconfig.json', import.meta.url), 'utf8');
const promptSpaceCompletenessProof = JSON.parse(
  readFileSync(new URL('../../.bitcode/prompt-space-completeness-proof.json', import.meta.url), 'utf8')
);

test('V26 prompt surface map keeps active, support, and reference corridors explicit', () => {
  assert.match(promptSurfaceSource, /## Public prompt contract/u);
  assert.match(promptSurfaceSource, /V26_INFERENCE_SYSTEMS\.md/u);
  assert.match(promptSurfaceSource, /read, prompt surface, tool contract, agentic role, execution carrier, asset-pack effect, and verification/u);
  assert.match(promptSurfaceSource, /`Prompt` defines the registry\/composition shape of inference by extending `RegistryImpl<PromptPart>`/u);
  assert.match(promptSurfaceSource, /Registry primitives are therefore required knowledge for prompt work/u);
  assert.match(promptSurfaceSource, /`RegistryImpl` provides priority resolution, hierarchical path composition, multi-path merging/u);
  assert.match(promptSurfaceSource, /`_generic_` raw PromptPart nameparts and `PROMPTPART_GENERIC_\*` constants name base reusable PromptPart types/u);
  assert.match(promptSurfaceSource, /`_specific_` raw PromptPart nameparts and `PROMPTPART_SPECIFIC_\*` constants name concrete implementations/u);
  assert.match(promptSurfaceSource, /The naming split is a Bitcode implementation-layer contract/u);
  assert.match(promptSurfaceSource, /active agent prompt hierarchy examples must teach factory-owned Registry-backed prompt attachment/u);
  assert.match(promptSurfaceSource, /may not instruct callers to assign `execution\.prompt = \.\.\.` directly/u);
  assert.match(promptSurfaceSource, /`factoryAgentWithPTRR` must fail closed at the runtime\/type boundary/u);
  assert.match(promptSurfaceSource, /omits the Registry-backed agent prompt carrier or any of the plan\/try\/refine\/retry step Prompt registries/u);
  assert.match(promptSurfaceSource, /active conversation and Terminal prompt carriers must compose agent identity plus PTRR step purposes from specific raw PromptParts/u);
  assert.match(promptSurfaceSource, /rather than inline string-cast prompt fragments/u);
  assert.match(promptSurfaceSource, /## Active fifth-gate prompt consumers/u);
  assert.match(promptSurfaceSource, /## Support prompt consumers/u);
  assert.match(promptSurfaceSource, /## Reference-only or retained prompt ports/u);

  assert.match(promptSurfaceSource, /packages\/execution-generics\/src\/prompts\/ExecutionPrompt\.ts/u);
  assert.match(promptSurfaceSource, /@bitcode\/execution-generics\/prompts\/ExecutionPrompt/u);
  assert.match(promptSurfaceSource, /packages\/pipelines-generics\/src\/prompts\/PipelinePrompt\.ts/u);
  assert.match(promptSurfaceSource, /packages\/agent-generics\/src\/\{prompts\/\*,agents\/factories\.ts,execution\/prompt-overlays\.ts,substeps\/factories\.ts\}/u);
  assert.match(promptSurfaceSource, /packages\/\{agent-generics\/src\/execution\/\{AgentExecution\.ts,Agent\*Registry\.ts\},pipelines-generics\/src\/execution\/\{PipelineExecution\.ts,Pipeline\*Registry\.ts\},conversations-generics\/src\/agent\/ConversationAgent\.ts\}/u);
  assert.match(promptSurfaceSource, /packages\/\{agent-generics\/src\/\{agents\/factories\.ts,diagnostics\/\{trace\.ts,instrumentation\.ts\},execution\/file-diff-integration\.ts,substeps\/factories\.ts,types\.ts\},pipelines-generics\/src\/\{execution\/\{Metrics\.ts,pipeline-types\.ts,resume\.ts,route-pipeline-execution\.ts\},phases\/\{phase-factory\.ts,sdivf-factory\.ts\},pipeline-factory\.ts,gate-system\/\{meta-phase-orchestrator\.ts,types\.ts\},executors\/wait-for-instruction\.ts,streaming\/pipeline-stream-integration\.ts\}\}/u);
  assert.match(promptSurfaceSource, /packages\/conversations-generics\/src\/\{prompts\/BitcodeTerminalConversationSystemPrompt\.ts,agent\/ConversationAgent\.ts\}/u);
  assert.match(promptSurfaceSource, /promptpart_specific_\{system_bitcodeterminalconversation_\*,agent_conversationagent_\*\}/u);
  assert.match(promptSurfaceSource, /uapi\/prompts\/bitcode-terminal-system-prompt\.ts/u);
  assert.match(promptSurfaceSource, /packages\/\{doc-comment,doc-code\}\/\*/u);
  assert.match(promptSurfaceSource, /packages\/tools-generics\/src\/doc-code-tool\/\*/u);
  assert.match(promptSurfaceSource, /Prompt hierarchy lint and factory enforcement/u);
  assert.match(promptSurfaceSource, /packages\/eslint-plugin-bitcode\/src\/requirePromptHierarchy\.ts/u);
  assert.match(promptSurfaceSource, /packages\/agent-generics\/src\/__tests__\/factory-agent-ptrr-prompt-hierarchy\.test\.ts/u);
  assert.match(promptSurfaceSource, /complete plan\/try\/refine\/retry step Prompt registries/u);
  assert.match(promptSurfaceSource, /runtime\/type boundary/u);
  assert.match(promptSurfaceSource, /forbids manual `execution\.prompt` mutation/u);
  assert.match(promptSurfaceSource, /Prompt repair and migration scripts/u);
  assert.match(promptSurfaceSource, /scripts\/\{fix-remaining-imports,fix-barrel-imports,fix-multiline-imports,fix-corrupted-imports\}\.sh/u);
  assert.match(promptSurfaceSource, /public `@bitcode\/prompts` and `raw_promptparts` boundaries/u);
  assert.match(promptSurfaceSource, /Prompt generation and update scripts/u);
  assert.match(promptSurfaceSource, /scripts\/\{generate-massive-prompt-parts,mass-update-prompt-parts,architecture-review,generate-asset-pack-promptparts\}\.ts/u);
  assert.match(promptSurfaceSource, /public `@bitcode\/prompts\/raw_promptparts\/\*` package subpaths/u);
  assert.match(promptSurfaceSource, /canonical V26 inference records/u);
  assert.match(promptSurfaceSource, /doc-comment\/tool-prompt injection bridge/u);
  assert.match(promptSurfaceSource, /Obsolete one-off prompt migration scripts/u);
  assert.match(promptSurfaceSource, /_legacy\/prompt-migration-scripts\/README\.md/u);
  assert.match(promptSurfaceSource, /not an active prompt-system owner/u);

  assert.match(promptSurfaceSource, /packages\/generic-agents\/\*/u);
  assert.match(promptSurfaceSource, /packages\/generic-tools\/\*/u);
  assert.match(promptSurfaceSource, /`read-comprehension` is now the canonical generic-tool package boundary/u);
  assert.match(promptSurfaceSource, /Bitcode read-comprehension, written-asset, AssetPack, and delivery-mechanism analysis/u);
  assert.match(promptSurfaceSource, /protocol-demonstration\/V26_DOC_COMMENT_REFORM\.md/u);
  assert.match(promptSurfaceSource, /prefer `@bitcode\/prompts\/prompt` and `@bitcode\/prompts\/parts\/PromptPart`/u);
  assert.match(promptSurfaceSource, /prefer `@bitcode\/execution-generics\/Execution` and `@bitcode\/execution-generics\/prompts\/ExecutionPrompt`/u);
  assert.match(promptSurfaceSource, /broader active execution-bearing runtime carriers/u);
  assert.match(promptSurfaceSource, /retained reference test\/build configs should use exact public prompt subpath maps/u);
  assert.match(promptSurfaceSource, /Jira remains reader-first read-ingestion\/reference posture/u);
  assert.match(promptSurfaceSource, /runtime JavaScript carry-through files must stay content-equivalent/u);
  assert.match(promptSurfaceSource, /active AssetPack substep PromptParts/u);
  assert.match(promptSurfaceSource, /broad prompt normalization must be idempotent/u);
  assert.match(promptSurfaceSource, /runtime `\.js` PromptPart strings must synchronize from canonical `\.ts` PromptPart source/u);
  assert.match(promptSurfaceSource, /doc-comment metadata must also be Bitcode-native/u);
  assert.match(promptSurfaceSource, /`current_version` cannot preserve pre-Bitcode lineage/u);
  assert.match(promptSurfaceSource, /every active substep `intent` must name the read-first written-asset \/ asset-pack \/ proof \/ Shippable delivery-mechanism role/u);
  assert.match(promptSurfaceSource, /whole active AssetPack raw PromptPart corpus/u);
  assert.match(promptSurfaceSource, /agent, phase, pipeline, tool, setup, discovery, implementation, validation, and Finish-delivery PromptParts/u);
  assert.match(promptSurfaceSource, /doc-comment `intent` and `current_version` metadata must describe Bitcode read-first written-asset \/ asset-pack execution and Shippable delivery/u);
  assert.match(promptSurfaceSource, /deliverable\{impl,implementation,validation\}\*/u);
  assert.match(promptSurfaceSource, /non-PR `assetpackfinish\{submitreview,createissue,addissuecomment\}delivery_\*` raw PromptParts are removed/u);
  assert.match(promptSurfaceSource, /The remaining prompt closure work must also prove Registry-layer understanding/u);
  assert.match(promptSurfaceSource, /generic\/base PromptParts that are reused or inherited through Registry paths/u);
  assert.match(promptSurfaceSource, /specific implementation PromptParts that specialize the base type/u);
  assert.match(promptSurfaceSource, /Full V26 closure must eliminate any prompt implementation whose generic\/specific layer can only be inferred/u);
  assert.match(promptSurfaceSource, /fifth-gate prompt baseline proves/u);
  assert.match(promptSurfaceSource, /final prompt-space completeness is now closed by the eighth-gate proof family/u);
  assert.match(promptSurfaceSource, /baselinePassed/u);
  assert.match(promptSurfaceSource, /\.bitcode\/prompt-space-completeness-proof\.json/u);
  assert.match(promptSurfaceSource, /\.bitcode\/inference-implementation-records-proof\.json/u);
  assert.match(promptSurfaceSource, /protocol-demonstration\/src\/canonical\/inference-implementation-records\.js/u);
  assert.match(promptSurfaceSource, /protocol-demonstration\/test\/v26-inference-implementation-records\.test\.js/u);
});

test('V26 inference systems spec binds prompts, tools, agents, and executions together', () => {
  assert.match(inferenceSystemsSource, /No prompt, tool, agent, phase, pipeline, MCP operation, or execution carrier/u);
  assert.match(inferenceSystemsSource, /Read \| Name the Bitcode read/u);
  assert.match(inferenceSystemsSource, /Prompt ownership \| Identify the exact prompt class, Registry primitive, registry path\/key structure, generic base PromptParts, specific implementation PromptParts/u);
  assert.match(inferenceSystemsSource, /Tool ownership \| Identify callable tools/u);
  assert.match(inferenceSystemsSource, /Agent ownership \| Identify agent role/u);
  assert.match(inferenceSystemsSource, /Execution ownership \| Identify where runtime state is stored/u);
  assert.match(inferenceSystemsSource, /`packages\/generic-tools\/read-comprehension\/\*`/u);
  assert.match(inferenceSystemsSource, /individually owned Bitcode read-comprehension prompt\/tool primitives/u);
  assert.match(inferenceSystemsSource, /## Inference Implementation Record/u);
  assert.match(inferenceSystemsSource, /protocol-demonstration\/src\/canonical\/inference-implementation-records\.js/u);
  assert.match(inferenceSystemsSource, /\.bitcode\/inference-implementation-records-proof\.json/u);
  assert.match(inferenceSystemsSource, /recordId/u);
  assert.match(inferenceSystemsSource, /canonicalRead/u);
  assert.match(inferenceSystemsSource, /promptImplementation/u);
  assert.match(inferenceSystemsSource, /Registry primitive, registry path\/key structure, generic base PromptParts, specific implementation PromptParts/u);
  assert.match(inferenceSystemsSource, /toolImplementation/u);
  assert.match(inferenceSystemsSource, /agentImplementation/u);
  assert.match(inferenceSystemsSource, /executionImplementation/u);
  assert.match(inferenceSystemsSource, /assetPackImplementation/u);
  assert.match(inferenceSystemsSource, /## Complete Coverage Ledger/u);
  assert.match(inferenceSystemsSource, /Prompt primitives \| `PromptPart`, `Prompt`, `PromptExecution`/u);
  assert.match(inferenceSystemsSource, /Tool prompt infrastructure \| `DocCodeToolPrompt`/u);
  assert.match(inferenceSystemsSource, /Agent infrastructure \| `AgentPrompt`, `AgentStepPrompt`/u);
  assert.match(inferenceSystemsSource, /Pipeline infrastructure \| `PipelinePrompt`/u);
  assert.match(inferenceSystemsSource, /Conversation inference \| `BitcodeTerminalConversationSystemPrompt` and `uapi\/prompts\/bitcode-terminal-system-prompt\.ts`/u);
  assert.match(inferenceSystemsSource, /Read-comprehension support/u);
  assert.match(inferenceSystemsSource, /package-local no-emit typecheck/u);
  assert.match(inferenceSystemsSource, /## Prompt-Space Witness Baseline/u);
  assert.match(inferenceSystemsSource, /terminal conversation prompt binding and admitted Bitcode MCP prompt\/tool ingress/u);
  assert.match(inferenceSystemsSource, /`passed: true` is required after eighth-gate prompt-space saturation/u);
  assert.match(inferenceSystemsSource, /runtime and proof evidence can be regenerated from source/u);
  assert.match(inferenceSystemsSource, /treat `Prompt` as `RegistryImpl<PromptPart>`/u);
  assert.match(inferenceSystemsSource, /classify `raw_promptparts\/generic` \/ `PROMPTPART_GENERIC_\*` as reusable base PromptPart layers/u);
  assert.match(inferenceSystemsSource, /`raw_promptparts\/specific` \/ `PROMPTPART_SPECIFIC_\*` as concrete implementation PromptPart layers/u);
  assert.match(inferenceSystemsSource, /enforce agent prompt hierarchy through verifier code and runtime\/type boundaries where available/u);
  assert.match(inferenceSystemsSource, /complete plan\/try\/refine\/retry step Prompt registries/u);
  assert.match(inferenceSystemsSource, /must fail closed when that carrier is absent or partial/u);
  assert.match(inferenceSystemsSource, /active Terminal conversation agents to source agent identity and PTRR step purposes from specific raw PromptParts/u);
  assert.match(inferenceSystemsSource, /keep active documentation and source comments aligned with that verifier/u);
  assert.match(inferenceSystemsSource, /manual `execution\.prompt = \.\.\.` assignment/u);
  assert.match(inferenceSystemsSource, /Prompt-type Registry carrier, generic base PromptParts, and specific implementation PromptParts are explicitly mapped/u);
});

test('V26 prompt hierarchy lint rule enforces Bitcode Registry-backed prompt composition', () => {
  assert.doesNotMatch(promptHierarchyRuleSource, /G[A]-1/u);
  assert.doesNotMatch(promptHierarchyRuleDocs, /G[A]-1/u);
  assert.match(promptHierarchyRuleSource, /Bitcode Registry-backed prompt hierarchy/u);
  assert.match(promptHierarchyRuleSource, /REQUIRED_STEP_PROMPTS = \['plan', 'try', 'refine', 'retry'\]/u);
  assert.match(promptHierarchyRuleSource, /missingStepPrompt/u);
  assert.match(promptHierarchyRuleSource, /Registry-backed prompt carrier/u);
  assert.match(promptHierarchyRuleSource, /generic and specific PromptParts/u);
  assert.match(promptHierarchyRuleSource, /execution\.prompt/u);
  assert.match(promptHierarchyRuleDocs, /explicit `Prompt`\/`PromptPart` registry composition/u);
  assert.match(promptHierarchyRuleDocs, /generic base PromptParts plus specific implementation PromptParts/u);
  assert.match(promptHierarchyRuleDocs, /The compatibility `prompts` shape is also accepted/u);
});

test('V26 active app config no longer preserves retired prompt source aliases', () => {
  assert.doesNotMatch(uapiTsconfigSource, /"@bitcode\/prompts\/src\/\*"/u);
  assert.doesNotMatch(uapiTsconfigSource, /"@bitcode\/prompts\/src\/raw_promptparts\/\*"/u);
  assert.match(uapiTsconfigSource, /"@bitcode\/prompts":\s*\[\s*"\.\.\/packages\/prompts\/src\/index\.ts"\s*\]/u);
  assert.match(uapiTsconfigSource, /"@bitcode\/prompts\/\*":\s*\[\s*"\.\.\/packages\/prompts\/src\/\*"\s*\]/u);
});

test('V26 prompt-space proof closes the eighth-gate completeness verdict', () => {
  assert.equal(promptSpaceCompletenessProof.reportId, 'v26-prompt-space-completeness-proof');
  assert.equal(promptSpaceCompletenessProof.baselinePassed, true);
  assert.equal(promptSpaceCompletenessProof.witnessFamilyComplete, true);
  assert.equal(promptSpaceCompletenessProof.passed, true);
  assert.equal(promptSpaceCompletenessProof.closureClaim, true);
  assert.equal(promptSpaceCompletenessProof.proceduralGateClosure, true);
  assert.equal(promptSpaceCompletenessProof.closureGate, 'eighth-gate');
  assert.deepEqual(
    promptSpaceCompletenessProof.checks.map((check) => check.promptSpaceRole),
    [
      'primitive-contract',
      'active-inference-carriers',
      'tool-prompt-injection',
      'asset-pack-read-comprehension',
      'raw-promptpart-carry-through',
      'app-mcp-ingress',
      'proof-and-specification'
    ]
  );
  assert.deepEqual(
    promptSpaceCompletenessProof.checks.filter((check) => check.passed !== true),
    []
  );
  assert.equal(promptSpaceCompletenessProof.openReason, null);
  assert.deepEqual(promptSpaceCompletenessProof.openCompletenessDimensions, []);
  assert.equal(promptSpaceCompletenessProof.closedCompletenessDimensions.length, 5);
  assert.match(promptSpaceCompletenessProof.closureReason, /Prompt-space completeness is closed/u);
  const proofSpecificationWitness = promptSpaceCompletenessProof.checks.find(
    (check) => check.checkId === 'prompt-proof-and-specification-witnesses'
  );
  assert.ok(proofSpecificationWitness);
  assert.deepEqual(
    [
      'packages/eslint-plugin-bitcode/src/requirePromptHierarchy.ts',
      'packages/eslint-plugin-bitcode/docs/require-prompt-hierarchy.md',
      'packages/eslint-plugin-bitcode/__tests__/requirePromptHierarchy.test.ts',
      'packages/agent-generics/src/__tests__/factory-agent-ptrr-prompt-hierarchy.test.ts'
    ].every((requiredFile) => proofSpecificationWitness.requiredFiles.includes(requiredFile)),
    true
  );

  const activeCarrierWitness = promptSpaceCompletenessProof.checks.find(
    (check) => check.checkId === 'active-agent-execution-prompt-carriers'
  );
  assert.ok(activeCarrierWitness);
  assert.deepEqual(
    [
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_identity_corestatement.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_capabilities_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_usage_guidance.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_identity_definition.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrplan_purpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrtry_purpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrrefine_purpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrretry_purpose.ts'
    ].every((requiredFile) => activeCarrierWitness.requiredFiles.includes(requiredFile)),
    true
  );
});
