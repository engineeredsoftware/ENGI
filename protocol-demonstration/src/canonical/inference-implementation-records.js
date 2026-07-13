// @ts-check

export const V26_INFERENCE_IMPLEMENTATION_RECORD_REQUIRED_FIELDS = Object.freeze([
  'recordId',
  'canonicalRead',
  'promptImplementation',
  'toolImplementation',
  'agentImplementation',
  'executionImplementation',
  'assetPackImplementation',
  'boundaryPosture',
  'verificationSet'
]);

export const V26_INFERENCE_BOUNDARY_POSTURES = Object.freeze([
  'active',
  'admitted support',
  'ingress',
  'compatibility',
  'reference-only',
  'cut-target'
]);

export const V26_INFERENCE_VERIFICATION_EVIDENCE_TYPES = Object.freeze([
  'executable-command',
  'generated-artifact',
  'source-test',
  'declared-gap'
]);

export const V26_INFERENCE_IMPLEMENTATION_SECTION_REQUIREMENTS = Object.freeze({
  promptImplementation: Object.freeze([
    Object.freeze({ field: 'owners', minItems: 1 }),
    Object.freeze({ field: 'registryLayering', minLength: 1 }),
    Object.freeze({ field: 'rawPromptPartBoundary', minLength: 1 }),
    Object.freeze({ field: 'runtimeCarryThrough', minLength: 1 })
  ]),
  toolImplementation: Object.freeze([
    Object.freeze({ field: 'owners', allowEmptyArray: true }),
    Object.freeze({ field: 'contract', minLength: 1 })
  ]),
  agentImplementation: Object.freeze([
    Object.freeze({ field: 'owners', allowEmptyArray: true }),
    Object.freeze({ field: 'contract', minLength: 1 })
  ]),
  executionImplementation: Object.freeze([
    Object.freeze({ field: 'owners', minItems: 1 }),
    Object.freeze({ field: 'carriers', minItems: 1 })
  ]),
  assetPackImplementation: Object.freeze([
    Object.freeze({ field: 'outputKind', minLength: 1 }),
    Object.freeze({ field: 'effect', minLength: 1 })
  ])
});

export const V26_INFERENCE_IMPLEMENTATION_RECORDS = Object.freeze([
  {
    recordId: 'prompt-primitives',
    canonicalRead: 'Provide the canonical prompt substrate that makes Bitcode inference describable, composable, executable, and replayable.',
    promptImplementation: {
      owners: [
        'packages/prompts/src/parts/PromptPart.ts',
        'packages/prompts/src/prompt.ts',
        'packages/prompts/src/execution/PromptExecution.ts',
        'packages/prompts/src/formatters/index.ts'
      ],
      rawPromptPartBoundary: '@bitcode/prompts/raw_promptparts/*',
      registryLayering: 'Prompt extends RegistryImpl<PromptPart>; raw_promptparts/generic holds reusable base PromptPart layers and raw_promptparts/specific holds concrete Bitcode implementation PromptParts composed through registry paths, priorities, and merges.',
      runtimeCarryThrough: 'PromptPart TypeScript content and runtime JavaScript carry-through must remain equivalent.'
    },
    toolImplementation: {
      owners: [],
      contract: 'Prompt primitives do not call tools directly; tools consume this substrate through public prompt package boundaries.'
    },
    agentImplementation: {
      owners: [],
      contract: 'Agent prompt overlays compose from prompt primitives but do not redefine PromptPart or PromptExecution.'
    },
    executionImplementation: {
      owners: ['packages/prompts/src/execution/PromptExecution.ts'],
      carriers: ['PromptExecution']
    },
    assetPackImplementation: {
      outputKind: 'prompt evidence',
      effect: 'Prompt material is bound to execution evidence and generated proof witnesses.'
    },
    boundaryPosture: 'active',
    verificationSet: [
      'pnpm -C packages/prompts exec jest --runInBand src/__tests__/prompt.test.ts',
      'node --test protocol-demonstration/test/v26-prompt-runtime-loadability.test.js',
      '.bitcode/prompt-system-totality-proof.json'
    ],
    sourceEvidenceRefs: [
      'packages/prompts/package.json',
      'packages/prompts/README.md',
      'packages/prompts/src/index.ts',
      'packages/prompts/src/parts/PromptPart.ts',
      'packages/prompts/src/prompt.ts',
      'packages/prompts/src/execution/PromptExecution.ts',
      'packages/prompts/src/__tests__/prompt.test.ts'
    ]
  },
  {
    recordId: 'tool-prompt-infrastructure',
    canonicalRead: 'Attach tool descriptions, callable contracts, and tool execution evidence into Bitcode agentic runs without hidden prompt strings.',
    promptImplementation: {
      owners: [
        'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
        'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
        'packages/generic-doc-comments/doc-code/src/transformDocCodeTools.ts'
      ],
      rawPromptPartBoundary: 'doc-code labels and DocCodeToolPrompt paths',
      registryLayering: 'Tool prompt descriptions enter agent runs through prompt-aware registries while generic prompt fragments remain reusable base layers and tool-specific DocCodeToolPrompt material specializes implementation paths.',
      runtimeCarryThrough: 'DocCode tool prompts must load through public doc-code, doc-comment, registry, execution, and prompt package subpaths.'
    },
    toolImplementation: {
      owners: [
        'packages/tools-generics/src/Tool.ts',
        'packages/tools-generics/src/execution/ToolExecution.ts',
        'packages/tools-generics/src/execution/ToolPromptRegistry.ts'
      ],
      contract: 'Tool functions, parameters, output, prompt descriptions, and fail-closed boundaries are explicit support primitives.'
    },
    agentImplementation: {
      owners: ['packages/tools-generics/src/doc-code-tool/DocCodeToolDecorator.ts'],
      contract: 'Tool prompt injection supports agent runs but does not become an independent agent.'
    },
    executionImplementation: {
      owners: [
        'packages/tools-generics/src/execution/ToolExecution.ts',
        'packages/tools-generics/src/execution/ToolPromptRegistry.ts'
      ],
      carriers: ['ToolExecution', 'ToolPromptRegistry']
    },
    assetPackImplementation: {
      outputKind: 'tool prompt support',
      effect: 'Tool descriptions become auditable prompt material available to agentic Bitcode runs.'
    },
    boundaryPosture: 'admitted support',
    verificationSet: [
      'node --test protocol-demonstration/test/v26-prompt-runtime-loadability.test.js',
      'node --test protocol-demonstration/test/v26-prompt-system-boundary.test.js',
      'packages/generic-doc-comments/doc-code/src/__tests__/transform.test.ts'
    ],
    sourceEvidenceRefs: [
      'packages/tools-generics/package.json',
      'packages/tools-generics/src/Tool.ts',
      'packages/tools-generics/src/execution/ToolExecution.ts',
      'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
      'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
      'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
      'packages/generic-doc-comments/doc-code/src/transformDocCodeTools.ts',
      'packages/doc-comment-generics/src/build-plugin.ts'
    ]
  },
  {
    recordId: 'agent-infrastructure',
    canonicalRead: 'Represent Bitcode agent roles, steps, substeps, prompt overlays, tool registries, retries, and diagnostics as explicit execution-bearing infrastructure.',
    promptImplementation: {
      owners: [
        'packages/agent-generics/src/prompts/AgentPrompt.ts',
        'packages/agent-generics/src/prompts/AgentStepPrompt.ts',
        'packages/agent-generics/src/prompts/AgentGenerationSubStepPrompt.ts',
        'packages/agent-generics/src/prompts/FailsafeMetaSubStepPrompt.ts',
        'packages/agent-generics/src/prompts/ToolExecutionPrompt.ts'
      ],
      rawPromptPartBoundary: '@bitcode/prompts/parts/PromptPart and narrow prompt subpaths',
      registryLayering: 'AgentPrompt and AgentStepPrompt compose generic generation/failsafe PromptParts with specific agent role, phase, substep, and tool-overlay PromptParts through explicit prompt registries.',
      runtimeCarryThrough: 'Agent prompt overlays must compose through public prompt primitives.'
    },
    toolImplementation: {
      owners: ['packages/agent-generics/src/execution/AgentToolsRegistry.ts'],
      contract: 'Agent tool usage is mediated through registries and bounded structured outputs.'
    },
    agentImplementation: {
      owners: [
        'packages/agent-generics/src/agents/factories.ts',
        'packages/agent-generics/src/substeps/factories.ts',
        'packages/agent-generics/src/steps/factories.ts'
      ],
      contract: 'Agent roles, steps, substeps, structured outputs, diagnostics, and retries/refinement are named and bounded.'
    },
    executionImplementation: {
      owners: [
        'packages/agent-generics/src/execution/AgentExecution.ts',
        'packages/agent-generics/src/execution/AgentPromptsRegistry.ts',
        'packages/agent-generics/src/execution/AgentToolsRegistry.ts',
        'packages/agent-generics/src/execution/AgentLLMsRegistry.ts',
        'packages/agent-generics/src/execution/AgentAgentsRegistry.ts'
      ],
      carriers: ['AgentExecution', 'AgentPromptsRegistry', 'AgentToolsRegistry', 'AgentLLMsRegistry', 'AgentAgentsRegistry']
    },
    assetPackImplementation: {
      outputKind: 'agent execution evidence',
      effect: 'Agent execution can produce bounded intermediate evidence, diagnostics, file-diff integration, and downstream pipeline inputs.'
    },
    boundaryPosture: 'active',
    verificationSet: [
      'pnpm -C packages/agent-generics run typecheck',
      'node --test protocol-demonstration/test/v26-prompt-system-boundary.test.js',
      '.bitcode/prompt-system-totality-proof.json'
    ],
    sourceEvidenceRefs: [
      'packages/agent-generics/src/prompts/AgentPrompt.ts',
      'packages/agent-generics/src/prompts/AgentStepPrompt.ts',
      'packages/agent-generics/src/execution/AgentExecution.ts',
      'packages/agent-generics/src/execution/AgentPromptsRegistry.ts',
      'packages/agent-generics/src/execution/AgentToolsRegistry.ts',
      'packages/agent-generics/src/agents/factories.ts',
      'packages/agent-generics/src/substeps/factories.ts',
      'packages/agent-generics/src/diagnostics/trace.ts'
    ]
  },
  {
    recordId: 'execution-infrastructure',
    canonicalRead: 'Provide the canonical execution tree, prompt-aware execution ancestry, storage controls, streaming adapters, work updates, and typed store evidence for Bitcode inference runs.',
    promptImplementation: {
      owners: [
        'packages/execution-generics/src/prompts/ExecutionPrompt.ts'
      ],
      rawPromptPartBoundary: '@bitcode/prompts/prompt and @bitcode/prompts/parts/PromptPart through public prompt subpaths',
      registryLayering: 'ExecutionPrompt inherits Prompt registry behavior so execution-specific prompt requirements specialize generic prompt layers without hidden string state.',
      runtimeCarryThrough: 'ExecutionPrompt composes public Prompt and PromptPart primitives but does not own raw promptpart text.'
    },
    toolImplementation: {
      owners: [
        'packages/execution-generics/src/tools/ExecutionToolRegistry.ts'
      ],
      contract: 'Execution-level tool registries are support carriers for higher tool owners; mutating tools must still declare their own capability and fail-closed boundaries.'
    },
    agentImplementation: {
      owners: [],
      contract: 'No independent live agent is promoted by base execution primitives; agent-specific roles are covered by the agent-infrastructure record.'
    },
    executionImplementation: {
      owners: [
        'packages/execution-generics/src/Execution.ts',
        'packages/execution-generics/src/execution-registry.ts',
        'packages/execution-generics/src/storage/ExecutionStorageAdapter.ts',
        'packages/execution-generics/src/storage/ExecutionStreamAdapter.ts',
        'packages/execution-generics/src/store/registry.ts',
        'packages/execution-generics/src/work-update.ts'
      ],
      carriers: ['Execution', 'execution-registry', 'ExecutionStorageAdapter', 'ExecutionStreamAdapter', 'typed execution stores', 'work updates']
    },
    assetPackImplementation: {
      outputKind: 'execution evidence substrate',
      effect: 'Execution stores, stream events, storage destinations, and work updates carry proof/reread evidence for prompts, tools, agents, pipelines, conversations, and asset-pack synthesis.'
    },
    boundaryPosture: 'active',
    verificationSet: [
      'pnpm -C packages/execution-generics run typecheck',
      'node --test protocol-demonstration/test/v26-prompt-system-boundary.test.js',
      '.bitcode/runs-pipelines-totality-proof.json'
    ],
    sourceEvidenceRefs: [
      'packages/execution-generics/package.json',
      'packages/execution-generics/src/index.ts',
      'packages/execution-generics/src/Execution.ts',
      'packages/execution-generics/src/prompts/ExecutionPrompt.ts',
      'packages/execution-generics/src/tools/ExecutionToolRegistry.ts',
      'packages/execution-generics/src/storage/ExecutionStorageAdapter.ts',
      'packages/execution-generics/src/storage/ExecutionStreamAdapter.ts',
      'packages/execution-generics/src/store/registry.ts',
      'packages/execution-generics/src/work-update.ts'
    ]
  },
  {
    recordId: 'pipeline-infrastructure',
    canonicalRead: 'Represent Bitcode runs, phases, prompts, tool registries, streaming, resume, metrics, and phase orchestration as explicit pipeline execution infrastructure.',
    promptImplementation: {
      owners: [
        'packages/pipelines-generics/src/prompts/PipelinePrompt.ts',
        'packages/pipelines-generics/src/execution/PipelinePromptRegistry.ts'
      ],
      rawPromptPartBoundary: '@bitcode/prompts and @bitcode/prompts/parts/PromptPart through public subpaths',
      registryLayering: 'PipelinePrompt and PipelinePromptRegistry bind generic phase/pipeline prompt bases to specific setup, discovery, implementation, validation, and finish implementations through registry-backed hierarchy.',
      runtimeCarryThrough: 'Pipeline prompts must not depend on route-local strings or private prompt source paths.'
    },
    toolImplementation: {
      owners: ['packages/pipelines-generics/src/execution/PipelineToolRegistry.ts'],
      contract: 'Pipeline tools are registry-owned and available to phase/agent execution without hidden package reach-through.'
    },
    agentImplementation: {
      owners: [
        'packages/pipelines-generics/src/phases/phase-factory.ts',
        'packages/pipelines-generics/src/phases/sdivf-factory.ts',
        'packages/pipelines-generics/src/gate-system/meta-phase-orchestrator.ts'
      ],
      contract: 'Pipeline phases and meta-phases bind setup, discovery, implementation, validation, Finish, and gate orchestration.'
    },
    executionImplementation: {
      owners: [
        'packages/pipelines-generics/src/execution/PipelineExecution.ts',
        'packages/pipelines-generics/src/execution/pipeline-types.ts',
        'packages/pipelines-generics/src/execution/resume.ts',
        'packages/pipelines-generics/src/streaming/pipeline-stream-integration.ts'
      ],
      carriers: ['PipelineExecution', 'PipelinePromptRegistry', 'PipelineToolRegistry', 'PipelineLLMRegistry', 'PipelineAgentRegistry']
    },
    assetPackImplementation: {
      outputKind: 'pipeline run evidence',
      effect: 'Pipeline runs can carry phase evidence, metrics, streams, resume records, and downstream asset-pack synthesis state.'
    },
    boundaryPosture: 'active',
    verificationSet: [
      'pnpm -C packages/pipelines-generics run typecheck',
      'node --test protocol-demonstration/test/v26-prompt-system-boundary.test.js',
      '.bitcode/runs-pipelines-totality-proof.json'
    ],
    sourceEvidenceRefs: [
      'packages/pipelines-generics/src/prompts/PipelinePrompt.ts',
      'packages/pipelines-generics/src/execution/PipelineExecution.ts',
      'packages/pipelines-generics/src/execution/PipelinePromptRegistry.ts',
      'packages/pipelines-generics/src/execution/PipelineToolRegistry.ts',
      'packages/pipelines-generics/src/phases/phase-factory.ts',
      'packages/pipelines-generics/src/phases/sdivf-factory.ts',
      'packages/pipelines-generics/src/gate-system/meta-phase-orchestrator.ts',
      'packages/pipelines-generics/src/streaming/pipeline-stream-integration.ts'
    ]
  },
  {
    recordId: 'conversation-inference',
    canonicalRead: 'Provide the rich-input Bitcode write surface that binds conversation prompts, attachments, tool registration, streams, and ad hoc execution continuity.',
    promptImplementation: {
      owners: [
        'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
        'uapi/prompts/bitcode-terminal-system-prompt.ts'
      ],
      rawPromptPartBoundary: 'conversation system prompt plus app-level binding',
      registryLayering: 'Conversation prompt binding composes the conversation-specific implementation prompt with public prompt primitives and inherits the same Registry-backed Prompt contract.',
      runtimeCarryThrough: 'Conversation prompt binding must stay aligned with rich-input execution and app route state.'
    },
    toolImplementation: {
      owners: ['packages/conversations-generics/src/agent/ConversationAgent.ts'],
      contract: 'Conversation tools are registered through the conversation agent and app-facing rich-input surface.'
    },
    agentImplementation: {
      owners: ['packages/conversations-generics/src/agent/ConversationAgent.ts'],
      contract: 'ConversationAgent owns conversation bootstrap, tool registration, and rich-input inference posture.'
    },
    executionImplementation: {
      owners: [
        'packages/api/src/conversations/conversations.ts',
        'packages/api/src/conversations/streaming.ts',
        'uapi/app/api/conversations/stream/route.ts'
      ],
      carriers: ['conversation persistence', 'conversation stream events', 'ad hoc execution continuity']
    },
    assetPackImplementation: {
      outputKind: 'conversation write intent',
      effect: 'Conversation inputs can produce execution intent, attachments, output destinations, and downstream asset-pack synthesis.'
    },
    boundaryPosture: 'active',
    verificationSet: [
      'uapi/tests/api/conversationsRoute.test.ts',
      'uapi/tests/api/chatStreamRoute.test.ts',
      '.bitcode/conversations-continuity-proof.json'
    ],
    sourceEvidenceRefs: [
      'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
      'packages/conversations-generics/src/agent/ConversationAgent.ts',
      'uapi/prompts/bitcode-terminal-system-prompt.ts',
      'packages/api/src/conversations/conversations.ts',
      'packages/api/src/conversations/streaming.ts',
      'uapi/app/api/conversations/stream/route.ts'
    ]
  },
  {
    recordId: 'asset-pack-synthesis-compatibility',
    canonicalRead: 'Operate Bitcode AssetPack pipeline machinery as asset-pack written-asset synthesis plus delivery-mechanism compatibility.',
    promptImplementation: {
      owners: [
        'packages/asset-packs-pipelines/domain/src/agents/prompts/comprehend-read-prompt.ts',
        'packages/asset-packs-pipelines/domain/src/agents/prompts/asset-pack-comprehend-read-agent-prompts.ts',
        'packages/asset-packs-pipelines/domain/scripts/render-prompts.ts',
        'packages/generic-agents/text-searcher/src/prompts/agent-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/system-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/plan-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/try-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/refine-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/retry-prompt-text-searcher.ts',
        'packages/generic-tools/simple-system-text-search/src/prompts/BitcodeRepositoryEvidenceSearchDocCodeToolPrompt.ts',
        'packages/generic-tools/simple-system-text-search/src/prompts/SimpleSystemTextSearchDocCodeToolPrompt.ts'
      ],
      rawPromptPartBoundary: 'COMPREHENDREAD, ASSETPACKSETUPCOMPREHENDREAD, compatibility-file TEXTSEARCHER, and compatibility-file SYSTEMTEXTSEARCH PromptParts before compatibility COMPREHENDTASK wrappers',
      registryLayering: 'Generic PTRR and formatting PromptParts form base layers while specific setup, validation, Finish, and delivery-mechanism PromptParts implement Bitcode read, written-asset, asset-pack, proof, and delivery-mechanism behavior; repository-evidence-search PromptParts add source-grounding behavior through prompt registries.',
      runtimeCarryThrough: 'AssetPack pipeline and repository-evidence runtime promptparts must teach read-first asset-pack synthesis, source-grounding, and delivery mechanisms.'
    },
    toolImplementation: {
      owners: [
        'packages/asset-packs-pipelines/domain/src/tools/AssetPackCloneVCSRepositoryTool.ts',
        'packages/asset-packs-pipelines/domain/src/tools/search.ts',
        'packages/system-grep/src/index.ts',
        'packages/generic-tools/simple-system-text-search/src/index.ts',
        'packages/generic-tools/files-maintaining/src/index.ts',
        'packages/generic-tools/files-maintaining/src/prompts/TextEditorDocCodeToolPrompt.ts',
        'packages/generic-tools/files-maintaining/src/prompts/CreateFileDocCodeToolPrompt.ts',
        'packages/generic-tools/files-maintaining/src/prompts/ReplaceFileDocCodeToolPrompt.ts',
        'packages/generic-tools/files-maintaining/src/prompts/DeleteFileDocCodeToolPrompt.ts',
        'packages/generic-tools/files-maintaining/src/prompts/tool-prompt-transaction-begin.ts'
      ],
      contract: 'VCS/PR/comment/review tools are delivery mechanisms on top of stable written assets; repository-evidence search tools are bounded grep-backed support, and AssetPack evidence search is exposed as searchRelevantAssetPackEvidence for read measurement and source-grounding; file-maintaining tools are written-asset mutation support and must expose Bitcode asset-pack semantics rather than generic file-system lineage.'
    },
    agentImplementation: {
      owners: [
        'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-read-agent.ts',
        'packages/generic-agents/text-searcher/src/index.ts',
        'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-ready-to-iterate-agent.ts',
        'packages/asset-packs-pipelines/domain/src/phases/index.ts',
        'packages/asset-packs-pipelines/domain/src/phases/finish.ts',
        'packages/asset-packs-pipelines/domain/src/agents/finish/deliver-asset-pack-to-destination-agent.ts',
        'packages/asset-packs-pipelines/domain/src/agents/finish/asset-pack-completion-agent.ts'
      ],
      contract: 'Setup, iteration, validation, and Finish agents must resolve semantic read and writtenAsset fields before bounded storage compatibility fields; Delivering is only the third-party AssetPack/partial handoff inside Finish.'
    },
    executionImplementation: {
      owners: [
        'packages/asset-packs-pipelines/domain/src/index.ts',
        'packages/asset-packs-pipelines/domain/src/postprocess.ts',
        'packages/asset-packs-pipelines/domain/src/types/PipelineSchemas.ts'
      ],
      carriers: ['PipelineExecution compatibility entry', 'postprocess read model', 'execution history projections']
    },
    assetPackImplementation: {
      outputKind: 'asset pack and shippable delivery mechanism',
      effect: 'Stable written assets and asset-pack snapshots are primary; PRs, Jira comments, reviews, and route payloads are Shippables delivered through destination mechanisms.'
    },
    boundaryPosture: 'compatibility',
    verificationSet: [
      'node --test protocol-demonstration/test/v26-shippable-reform.test.js',
      'node --test protocol-demonstration/test/v26-pipeline-finish-reform.test.js',
      '.bitcode/runs-pipelines-totality-proof.json',
      '.bitcode/prompt-system-totality-proof.json'
    ],
    sourceEvidenceRefs: [
      'protocol-demonstration/V26_SHIPPABLE_REFORM.md',
      'protocol-demonstration/V26_PIPELINE_FINISH_REFORM.md',
      'protocol-demonstration/test/v26-shippable-reform.test.js',
      'protocol-demonstration/test/v26-pipeline-finish-reform.test.js',
      'protocol-demonstration/test/v26-simple-system-text-search-compatibility.test.js',
      'protocol-demonstration/test/v26-text-searcher-agent-compatibility.test.js',
      'packages/asset-packs-pipelines/domain/src/index.ts',
      'packages/asset-packs-pipelines/domain/src/phases/index.ts',
      'packages/asset-packs-pipelines/domain/src/phases/finish.ts',
      'packages/asset-packs-pipelines/domain/src/postprocess.ts',
      'packages/asset-packs-pipelines/domain/src/types/PipelineSchemas.ts',
      'packages/asset-packs-pipelines/domain/src/agents/prompts/comprehend-read-prompt.ts',
      'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-read-agent.ts',
      'packages/generic-agents/text-searcher/README.md',
      'packages/generic-agents/text-searcher/package.json',
      'packages/generic-agents/text-searcher/src/index.ts',
      'packages/generic-agents/text-searcher/src/prompts/agent-prompt-text-searcher.ts',
      'packages/generic-agents/text-searcher/src/prompts/system-prompt-text-searcher.ts',
      'packages/generic-agents/text-searcher/src/prompts/plan-prompt-text-searcher.ts',
      'packages/generic-agents/text-searcher/src/prompts/try-prompt-text-searcher.ts',
      'packages/generic-agents/text-searcher/src/prompts/refine-prompt-text-searcher.ts',
      'packages/generic-agents/text-searcher/src/prompts/retry-prompt-text-searcher.ts',
      'packages/system-grep/README.md',
      'packages/system-grep/src/index.ts',
      'packages/generic-tools/simple-system-text-search/package.json',
      'packages/generic-tools/simple-system-text-search/README.md',
      'packages/generic-tools/simple-system-text-search/src/index.ts',
      'packages/generic-tools/simple-system-text-search/src/prompts/BitcodeRepositoryEvidenceSearchDocCodeToolPrompt.ts',
      'packages/generic-tools/simple-system-text-search/src/prompts/SimpleSystemTextSearchDocCodeToolPrompt.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolname.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolcapabilities.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolparameters.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetooloutput.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolexample1.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolexample2.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolexample3.ts',
      'packages/generic-tools/files-maintaining/README.md',
      'packages/generic-tools/files-maintaining/src/index.ts',
      'packages/generic-tools/files-maintaining/src/prompts/TextEditorDocCodeToolPrompt.ts',
      'packages/generic-tools/files-maintaining/src/prompts/CreateFileDocCodeToolPrompt.ts',
      'packages/generic-tools/files-maintaining/src/prompts/ReplaceFileDocCodeToolPrompt.ts',
      'packages/generic-tools/files-maintaining/src/prompts/DeleteFileDocCodeToolPrompt.ts',
      'packages/generic-tools/files-maintaining/src/prompts/tool-prompt-transaction-begin.ts'
    ]
  },
  {
    recordId: 'read-comprehension-reform',
    canonicalRead: 'Provide setup-phase Bitcode Read comprehension over expressed reads, source-to-shares service questions, commercial accountability, written-asset expectations, AssetPack context, proof obligations, and delivery-mechanism boundaries with read-first tool, prompt, primitive, schema, and raw PromptPart owners.',
    promptImplementation: {
      owners: [
        'packages/generic-agents/read-comprehension/src/index.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_identity.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_role.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_plan_analysis.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_try_directives.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_refine_assessment.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_retry_errorhandling.ts',
        'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSemanticsDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/ExtractReadRequirementsDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/IdentifyReadConstraintsDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/GenerateReadSatisfactionCriteriaDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/ValidateReadComprehensionDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSatisfactionImplementationComplexityDocCodeToolPrompt.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsemantics_doccodetoolpurpose.ts'
      ],
      rawPromptPartBoundary: '@bitcode/prompts/raw_promptparts/* with COMPREHENDREAD agent PromptParts and read-first tool PromptPart families',
      registryLayering: 'The setup Read-comprehension agent owns AgentPrompt and AgentStepPrompt registries in packages/generic-agents/read-comprehension, while canonical read-first DocCodeToolPrompt owners stay local to packages/generic-tools/read-comprehension. Agent PromptParts specialize the setup/pre-danger-wall role; tool PromptParts specialize callable Read analysis, requirements, constraints, satisfaction criteria, validation, and complexity capabilities under read-first filenames and constants.',
      runtimeCarryThrough: 'COMPREHENDREAD agent PromptParts and read-first raw PromptParts must keep runtime carry-through aligned to canonical read-comprehension text, including source-to-shares service questions and Advanced Engineered Software, Inc. customer accountability, while packages/generic-tools/read-comprehension and packages/generic-agents/read-comprehension remain TypeScript-only source with any generated JavaScript emitted outside src.'
    },
    toolImplementation: {
      owners: [
        'packages/generic-tools/read-comprehension/src/AnalyzeReadSemanticsTool.ts',
        'packages/generic-tools/read-comprehension/src/ExtractReadRequirementsTool.ts',
        'packages/generic-tools/read-comprehension/src/IdentifyReadConstraintsTool.ts',
        'packages/generic-tools/read-comprehension/src/GenerateReadSatisfactionCriteriaTool.ts',
        'packages/generic-tools/read-comprehension/src/ValidateReadComprehensionTool.ts',
        'packages/generic-tools/read-comprehension/src/AnalyzeReadSatisfactionImplementationComplexityTool.ts',
        'packages/generic-tools/read-comprehension/src/ReadComprehensionToolset.ts',
        'packages/generic-tools/read-comprehension/src/read-comprehension-primitives.ts',
        'packages/generic-tools/read-comprehension/src/read-comprehension-schemas.ts'
      ],
      contract: 'Canonical read-first tools are individually defined in the generic-tools package and collected by ReadComprehensionToolset. They are callable capabilities, not agents; noncanonical wrapper APIs are removed after the canonical Read-comprehension owners exist, and active outputs must include source-to-shares service questions and commercial accountability evidence.'
    },
    agentImplementation: {
      owners: [
        'packages/generic-agents/read-comprehension/src/index.ts',
        'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-read-agent.ts',
        'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-danger-wall-agent.ts',
        'packages/asset-packs-pipelines/domain/src/phases/setup.ts'
      ],
      contract: 'bitcodeSetupReadComprehensionAgent is the setup/pre-danger-wall PTRR agent. It composes the generic-tools Read-comprehension toolset, emits semantic Read, source-to-shares service-question, commercial-accountability, and AssetPack evidence, and hands bounded riskAdmissionInput to bitcodeReadRiskAdmissionAgent.'
    },
    executionImplementation: {
      owners: [
        'packages/generic-agents/read-comprehension/tsconfig.json',
        'packages/generic-agents/read-comprehension/package.json',
        'packages/generic-tools/read-comprehension/tsconfig.json',
        'packages/generic-tools/read-comprehension/src/index.ts',
        'packages/generic-tools/read-comprehension/src/types/tools-generics.ts',
        'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-read-agent.ts'
      ],
      carriers: ['AgentExecution for bitcode-setup-read-comprehension', 'ToolExecution evidence for composed tools', 'setup/read-comprehension execution-store mirrors']
    },
    assetPackImplementation: {
      outputKind: 'read-comprehension support evidence',
      effect: 'Read-comprehension analysis produces source-to-shares service questions, commercial-accountability evidence, written-asset, asset-pack, proof, and delivery-mechanism hints for parent runs.'
    },
    boundaryPosture: 'active',
    verificationSet: [
      'pnpm -C packages/generic-agents/read-comprehension run build',
      'pnpm -C packages/generic-tools/read-comprehension run build',
      'node --test protocol-demonstration/test/v26-prompt-system-boundary.test.js',
      'node --test protocol-demonstration/test/v26-shippable-reform.test.js'
    ],
    sourceEvidenceRefs: [
      'packages/generic-agents/read-comprehension/README.md',
      'packages/generic-agents/read-comprehension/package.json',
      'packages/generic-agents/read-comprehension/tsconfig.json',
      'packages/generic-agents/read-comprehension/src/index.ts',
      'packages/generic-tools/read-comprehension/README.md',
      'packages/generic-tools/read-comprehension/package.json',
      'packages/generic-tools/read-comprehension/tsconfig.json',
      'packages/generic-tools/read-comprehension/src/AnalyzeReadSemanticsTool.ts',
      'packages/generic-tools/read-comprehension/src/ReadComprehensionToolset.ts',
      'packages/generic-tools/read-comprehension/src/ExtractReadRequirementsTool.ts',
      'packages/generic-tools/read-comprehension/src/IdentifyReadConstraintsTool.ts',
      'packages/generic-tools/read-comprehension/src/GenerateReadSatisfactionCriteriaTool.ts',
      'packages/generic-tools/read-comprehension/src/ValidateReadComprehensionTool.ts',
      'packages/generic-tools/read-comprehension/src/AnalyzeReadSatisfactionImplementationComplexityTool.ts',
      'packages/generic-tools/read-comprehension/src/read-comprehension-primitives.ts',
      'packages/generic-tools/read-comprehension/src/read-comprehension-schemas.ts',
      'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSemanticsDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/ExtractReadRequirementsDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/IdentifyReadConstraintsDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/GenerateReadSatisfactionCriteriaDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/ValidateReadComprehensionDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSatisfactionImplementationComplexityDocCodeToolPrompt.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_identity.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_role.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_plan_analysis.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_try_directives.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_refine_assessment.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_retry_errorhandling.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsemantics_doccodetoolpurpose.ts',
      'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-read-agent.ts',
      'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-danger-wall-agent.ts',
      'packages/asset-packs-pipelines/domain/src/phases/setup.ts'
    ]
  },
  {
    recordId: 'read-review-before-fit-search',
    canonicalRead: 'Review a synthesized Bitcode Read after measurement and before any candidate recall, fitting, AssetPack assembly, or source-to-shares settlement review proceeds.',
    promptImplementation: {
      owners: [
        'protocol-demonstration/src/canonical/read-measurement.js',
        'protocol-demonstration/src/canonical/prompting.js'
      ],
      rawPromptPartBoundary: 'Read review consumes the measured Read prompt outputs (`expressedRead`, `failureModes`, `constraints`, `targetArtifactKinds`, `closureCriteria`) and does not promote a separate prompt reservoir.',
      registryLayering: 'Measured Read prompt surfaces remain the source-owned registry-bearing inference layer; the review artifact is a protocol admission boundary over those outputs, not another hidden prompt string.',
      runtimeCarryThrough: 'The reviewable Read and accepted/rejected/remeasure-with-feedback decision are emitted into runtime branch artifacts before fit search.'
    },
    toolImplementation: {
      owners: [],
      contract: 'No external tool owns the review gate; source-to-shares fit search remains blocked unless the measured Read review admits it.'
    },
    agentImplementation: {
      owners: [],
      contract: 'No independent agent is promoted for fifth-gate; deterministic local review records the acceptance baseline and later gates may add operator/agent assistance without changing the artifact contract.'
    },
    executionImplementation: {
      owners: [
        'protocol-demonstration/src/bitcode-demo.js',
        'protocol-demonstration/src/canonical/evaluation-materialization.js',
        'protocol-demonstration/src/canonical/run-artifacts.js'
      ],
      carriers: ['.bitcode/read-review.json', 'pipeline-telemetry.read-review', 'branch-artifact-required-path']
    },
    assetPackImplementation: {
      outputKind: 'pre-fit Read review artifact',
      effect: 'The synthesized Read is accepted, rejected, or returned for remeasurement with feedback before candidate recall/ranking can produce an AssetPack.'
    },
    boundaryPosture: 'active',
    verificationSet: [
      'node --test protocol-demonstration/test/v26-read-review-source-to-shares.test.js',
      '.bitcode/inference-implementation-records-proof.json'
    ],
    sourceEvidenceRefs: [
      'protocol-demonstration/src/canonical/read-measurement.js',
      'protocol-demonstration/src/canonical/evaluation-materialization.js',
      'protocol-demonstration/src/canonical/run-artifacts.js',
      'protocol-demonstration/src/bitcode-demo.js',
      'protocol-demonstration/test/v26-read-review-source-to-shares.test.js'
    ]
  },
  {
    recordId: 'external-evidence-research-support',
    canonicalRead: 'Research the web during the discovery phase to support Bitcode read synthesis with source-attributed external evidence for read measurement, source-to-shares service questions, proof-gap question formation, third-party interface planning, and AssetPack planning without promoting web research into canonical read interpretation, proof, delivery, mutation, or product ownership.',
    promptImplementation: {
      owners: [
        'packages/generic-agents/web-researcher/src/prompts/agent-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/system-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/plan-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/try-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/refine-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/retry-prompt-web-researcher.ts',
        'packages/generic-agents/web-search/src/prompts/agent-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/system-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/plan-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/try-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/refine-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/retry-prompt-web-search.ts',
        'packages/generic-tools/web-search/src/prompts/WebSearchDocCodeToolPrompt.ts',
        'packages/generic-tools/web-search/src/prompts/GetContentsDocCodeToolPrompt.ts',
        'packages/generic-tools/web-search/src/prompts/MultiProviderSearchDocCodeToolPrompt.ts'
      ],
      rawPromptPartBoundary: 'Compatibility-file WEBRESEARCHER, WEBSEARCH, WEB_SEARCH, WEBSEARCHTOOL, WEBSEARCH_DOCCODE, GETCONTENTS_DOCCODE, and MULTIPROVIDERSEARCH_DOCCODE PromptParts implement Bitcode read-synthesis web research/search support while generic generation/failsafe and doc-code label PromptParts remain reusable base layers.',
      registryLayering: 'Generic generation/failsafe PromptParts form base layers; specific WEBRESEARCHER and WEBSEARCH PromptParts implement discovery-phase source context, source quality, volatility, proof-gap question, interface, read, and AssetPack evidence behavior through package-local Prompt registries; DocCodeToolPrompt wrappers bind the web-search, get-contents, and multi-provider tool descriptions into prompt-aware tool registries.',
      runtimeCarryThrough: 'Web-researcher and web-search PromptPart TypeScript and JavaScript must carry canonical Bitcode read-synthesis web research/search text.'
    },
    toolImplementation: {
      owners: [
        'packages/generic-tools/web-search/src/index.ts',
        'packages/web-search/src/index.ts'
      ],
      contract: 'Admitted web-search/content tools may collect source-attributed auxiliary evidence for discovery-phase read synthesis only; they do not mutate source, choose delivery mechanisms, assert proof completion, canonically interpret needs, or define Exchange/Terminal product semantics.'
    },
    agentImplementation: {
      owners: [
        'packages/generic-agents/web-researcher/src/index.ts',
        'packages/generic-agents/web-search/src/index.ts'
      ],
      contract: 'bitcodeReadSynthesisWebResearcher owns the PTRR discovery-phase web research agent; bitcodeReadSynthesisWebSearch owns the lower-level web-search support agent; bitcodeExternalEvidenceResearcher, webResearcherAgent, webResearcherPrompt, webResearcherStepPrompts, WEB_RESEARCH_AGENT.researchWeb, webSearch, quickWebSearch, webSearchPrompt, and webSearchStepPrompts names remain compatibility carriers.'
    },
    executionImplementation: {
      owners: [
        'packages/generic-agents/web-researcher/src/index.ts',
        'packages/generic-agents/web-search/src/index.ts',
        'packages/agent-generics/src/execution/AgentExecution.ts'
      ],
      carriers: ['AgentExecution compatibility entry', 'parent pipeline execution evidence']
    },
    assetPackImplementation: {
      outputKind: 'read-synthesis external evidence',
      effect: 'Source-attributed external findings can support discovery-phase read synthesis, proof-gap question formation, interface planning, and AssetPack synthesis, but canonical read interpretation, stable written assets, and proof artifacts remain owned downstream.'
    },
    boundaryPosture: 'admitted support',
    verificationSet: [
      'node --test protocol-demonstration/test/v26-web-researcher-agent-compatibility.test.js',
      'node --test protocol-demonstration/test/v26-web-search-support-compatibility.test.js',
      'node --test protocol-demonstration/test/v26-inference-implementation-records.test.js',
      '.bitcode/inference-implementation-records-proof.json',
      '.bitcode/prompt-system-totality-proof.json'
    ],
    sourceEvidenceRefs: [
      'packages/generic-agents/web-researcher/README.md',
      'packages/generic-agents/web-researcher/package.json',
      'packages/generic-agents/web-researcher/src/index.ts',
      'packages/generic-agents/web-researcher/src/prompts/agent-prompt-web-researcher.ts',
      'packages/generic-agents/web-researcher/src/prompts/system-prompt-web-researcher.ts',
      'packages/generic-agents/web-researcher/src/prompts/plan-prompt-web-researcher.ts',
      'packages/generic-agents/web-researcher/src/prompts/try-prompt-web-researcher.ts',
      'packages/generic-agents/web-researcher/src/prompts/refine-prompt-web-researcher.ts',
      'packages/generic-agents/web-researcher/src/prompts/retry-prompt-web-researcher.ts',
      'packages/generic-agents/web-search/README.md',
      'packages/generic-agents/web-search/package.json',
      'packages/generic-agents/web-search/src/index.ts',
      'packages/generic-agents/web-search/src/prompts/agent-prompt-web-search.ts',
      'packages/generic-agents/web-search/src/prompts/system-prompt-web-search.ts',
      'packages/generic-agents/web-search/src/prompts/plan-prompt-web-search.ts',
      'packages/generic-agents/web-search/src/prompts/try-prompt-web-search.ts',
      'packages/generic-agents/web-search/src/prompts/refine-prompt-web-search.ts',
      'packages/generic-agents/web-search/src/prompts/retry-prompt-web-search.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_purpose_corestatement.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_capabilities_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_executionpattern_detailcontent.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_ptrrsteps_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_tools_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_integration_detailcontent.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_system_identity.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_system_instructions.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_system_role.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_purpose_corestatement.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_capabilities_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_executionpattern_detailcontent.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_ptrrsteps_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_tools_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_integration_detailcontent.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_system_identity.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_system_instructions.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_system_role.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_websearch_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_websearch_doccodetoolcapabilities.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_getcontents_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_multiprovidersearch_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_websearchtool_purpose_corestatement.ts',
      'packages/generic-tools/web-search/README.md',
      'packages/generic-tools/web-search/src/index.ts',
      'packages/web-search/src/index.ts',
      'packages/generic-tools/web-search/src/prompts/WebSearchDocCodeToolPrompt.ts',
      'packages/generic-tools/web-search/src/prompts/GetContentsDocCodeToolPrompt.ts',
      'packages/generic-tools/web-search/src/prompts/MultiProviderSearchDocCodeToolPrompt.ts',
      'protocol-demonstration/test/v26-web-search-support-compatibility.test.js',
      'protocol-demonstration/test/v26-web-researcher-agent-compatibility.test.js'
    ]
  },
  {
    recordId: 'read-risk-admission-support',
    canonicalRead: 'Admit or block the next Bitcode pipeline phase by evaluating a read, candidate written assets, AssetPack intent, proof/evidence gaps, private-data exposure, unsafe mutation risk, and delivery-mechanism fit without promoting the danger-wall risk-admission corridor into canonical read, proof, mutation, delivery, or product ownership.',
    promptImplementation: {
      owners: [
        'packages/generic-agents/danger-wall/src/prompts/agent-prompt-danger-wall.ts',
        'packages/generic-agents/danger-wall/src/prompts/system-prompt-dangerwall.ts',
        'packages/generic-agents/danger-wall/src/prompts/plan-prompt-dangerwall.ts',
        'packages/generic-agents/danger-wall/src/prompts/try-prompt-dangerwall.ts',
        'packages/generic-agents/danger-wall/src/prompts/refine-prompt-dangerwall.ts',
        'packages/generic-agents/danger-wall/src/prompts/retry-prompt-dangerwall.ts'
      ],
      rawPromptPartBoundary: 'Compatibility-file DANGERWALL PromptParts implement Bitcode read/AssetPack risk-admission support while generic generation/failsafe PromptParts remain reusable base layers.',
      registryLayering: 'Generic generation/failsafe PromptParts form base layers; specific DANGERWALL PromptParts implement read, written-asset, AssetPack, proof-gap, private-data, mutation, delivery-mechanism, likely-execution-failure, and manual-review admission behavior through package-local Prompt registries.',
      runtimeCarryThrough: 'Danger-wall PromptPart TypeScript and JavaScript must carry canonical Bitcode risk-admission text.'
    },
    toolImplementation: {
      owners: [],
      contract: 'No independent mutation, delivery, or proof-generation tool is admitted by this corridor; evidence tools may be requested only to resolve admission ambiguity before returning admit, block, or manual-review output.'
    },
    agentImplementation: {
      owners: [
        'packages/generic-agents/danger-wall/src/index.ts'
      ],
      contract: 'bitcodeReadRiskAdmissionAgent owns the PTRR risk-admission agent; dangerWall, quickDangerWall, dangerWallAgent, quickDangerWallAgent, and DANGER_WALL_AGENT names remain compatibility carriers.'
    },
    executionImplementation: {
      owners: [
        'packages/generic-agents/danger-wall/src/index.ts',
        'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-danger-wall-agent.ts',
        'packages/agent-generics/src/execution/AgentExecution.ts'
      ],
      carriers: ['AgentExecution compatibility entry', 'setup risk-admission short-circuit signal', 'parent pipeline execution evidence']
    },
    assetPackImplementation: {
      outputKind: 'read/AssetPack risk-admission evidence',
      effect: 'Risk-admission findings can stop, admit, or require manual review before downstream read measurement, written-asset synthesis, proof closure, or delivery mechanisms continue.'
    },
    boundaryPosture: 'admitted support',
    verificationSet: [
      'node --test protocol-demonstration/test/v26-danger-wall-agent-compatibility.test.js',
      'node --test protocol-demonstration/test/v26-inference-implementation-records.test.js',
      '.bitcode/inference-implementation-records-proof.json',
      '.bitcode/prompt-system-totality-proof.json'
    ],
    sourceEvidenceRefs: [
      'packages/generic-agents/danger-wall/README.md',
      'packages/generic-agents/danger-wall/package.json',
      'packages/generic-agents/danger-wall/src/index.ts',
      'packages/generic-agents/danger-wall/src/prompts/agent-prompt-danger-wall.ts',
      'packages/generic-agents/danger-wall/src/prompts/system-prompt-dangerwall.ts',
      'packages/generic-agents/danger-wall/src/prompts/plan-prompt-dangerwall.ts',
      'packages/generic-agents/danger-wall/src/prompts/try-prompt-dangerwall.ts',
      'packages/generic-agents/danger-wall/src/prompts/refine-prompt-dangerwall.ts',
      'packages/generic-agents/danger-wall/src/prompts/retry-prompt-dangerwall.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_purpose_corestatement.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_capabilities_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_executionpattern_detailcontent.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_ptrrsteps_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_tools_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_integration_detailcontent.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_system_identity.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_system_instructions.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_system_role.ts',
      'packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-danger-wall-agent.ts',
      'protocol-demonstration/test/v26-danger-wall-agent-compatibility.test.js'
    ]
  },
  {
    recordId: 'mcp-external-ingress',
    canonicalRead: 'Admit Exchange-facing MCP and external interface operations as fail-closed ingress into Bitcode execution state, not as sibling product logic.',
    promptImplementation: {
      owners: [
        'packages/executions-mcp/README.md',
        'packages/executions-mcp/src/index.ts'
      ],
      rawPromptPartBoundary: 'MCP tool descriptions only where admitted by V26 prompt/tool records',
      registryLayering: 'MCP ingress prompt descriptions may enter prompt-aware registries only as specific implementation layers bound to admitted Bitcode tool records.',
      runtimeCarryThrough: 'MCP descriptions must not promote non-admitted tool families into live Bitcode behavior.'
    },
    toolImplementation: {
      owners: [
        'packages/executions-mcp/src/index.ts',
        'packages/tools-generics/src/mcp/MCPToolWrapper.ts'
      ],
      contract: 'Admitted Exchange-facing tool families are narrowed and create admission fails closed on permission, repository, and provider readiness.'
    },
    agentImplementation: {
      owners: [],
      contract: 'MCP ingress does not promote hidden agents without a separate inference implementation record.'
    },
    executionImplementation: {
      owners: [
        'packages/executions-mcp/src/index.ts',
        'uapi/components/base/bitcode/execution/BitcodeExecutionStreamPanel.tsx'
      ],
      carriers: ['queue/run/execution creation', 'provider ingress', 'operator reread']
    },
    assetPackImplementation: {
      outputKind: 'external ingress state transition',
      effect: 'MCP tools may create or read execution state only through admitted Exchange-facing boundaries.'
    },
    boundaryPosture: 'ingress',
    verificationSet: [
      '.bitcode/retained-package-admissibility-proof.json',
      '.bitcode/system-reform-admissibility-proof.json',
      'pnpm -C packages/executions-mcp run typecheck'
    ],
    sourceEvidenceRefs: [
      'packages/executions-mcp/package.json',
      'packages/executions-mcp/README.md',
      'packages/executions-mcp/src/index.ts',
      'packages/executions-mcp/src/mcp-server/package.json',
      'packages/executions-mcp/src/mcp-server/tsconfig.typecheck.json',
      'packages/tools-generics/src/mcp/MCPToolWrapper.ts',
      'uapi/components/base/bitcode/execution/BitcodeExecutionStreamPanel.tsx',
      'protocol-demonstration/V26_TERMINAL_SYSTEMS.md'
    ]
  }
]);

function hasMeaningfulValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

/**
 * @param {string} value
 */
function classifyVerificationEvidence(value) {
  const normalizedValue = value.trim();

  if (normalizedValue.startsWith('.bitcode/')) return 'generated-artifact';
  if (/^(node|npm|pnpm|yarn|bun)\s/u.test(normalizedValue)) return 'executable-command';
  if (/(\.test\.(js|ts|tsx)$|\/__tests__\/)/u.test(normalizedValue)) return 'source-test';

  return 'declared-gap';
}

/**
 * @param {string} value
 */
function verificationEvidenceRefPath(value) {
  const evidenceType = classifyVerificationEvidence(value);
  if (evidenceType === 'generated-artifact' || evidenceType === 'source-test') return value;
  return null;
}

/**
 * @param {unknown} value
 * @param {{ field: string, minItems?: number, minLength?: number, allowEmptyArray?: boolean }} requirement
 */
function fieldSatisfiesRequirement(value, requirement) {
  if (Array.isArray(value)) {
    if (requirement.allowEmptyArray === true) return true;
    return value.length >= (requirement.minItems || 1);
  }

  if (typeof value === 'string') {
    return value.trim().length >= (requirement.minLength || 1);
  }

  return hasMeaningfulValue(value);
}

/**
 * @param {Record<string, any>} record
 */
function collectMissingSectionFields(record) {
  return Object.entries(V26_INFERENCE_IMPLEMENTATION_SECTION_REQUIREMENTS)
    .flatMap(([sectionName, requirements]) => {
      const section = record[sectionName] || {};
      return requirements
        .filter((requirement) => !fieldSatisfiesRequirement(section[requirement.field], requirement))
        .map((requirement) => `${sectionName}.${requirement.field}`);
    });
}

/**
 * @param {Record<string, any>} record
 */
function collectImplementationOwnerRefs(record) {
  return [
    'promptImplementation',
    'toolImplementation',
    'agentImplementation',
    'executionImplementation'
  ].flatMap((sectionName) => {
    const owners = record[sectionName]?.owners;
    return Array.isArray(owners) ? owners : [];
  });
}

/**
 * @param {{ fileExists?: (filePath: string) => boolean }} [options]
 */
export function validateV26InferenceImplementationRecords(options = {}) {
  const fileExists = options.fileExists || (() => true);
  const recordChecks = V26_INFERENCE_IMPLEMENTATION_RECORDS.map((record) => {
    const missingFields = V26_INFERENCE_IMPLEMENTATION_RECORD_REQUIRED_FIELDS
      .filter((field) => !hasMeaningfulValue(record[field]));
    const invalidBoundaryPosture = V26_INFERENCE_BOUNDARY_POSTURES.includes(record.boundaryPosture)
      ? null
      : record.boundaryPosture;
    const missingSectionFields = collectMissingSectionFields(record);
    const implementationOwnerRefs = Array.from(new Set(collectImplementationOwnerRefs(record)));
    const missingImplementationOwnerRefs = implementationOwnerRefs.filter((filePath) => !fileExists(filePath));
    const sourceEvidenceRefs = Array.from(new Set(record.sourceEvidenceRefs || []));
    const missingSourceEvidenceRefs = sourceEvidenceRefs.filter((filePath) => !fileExists(filePath));
    const verificationSet = Array.from(new Set(record.verificationSet || []));
    const verificationEvidence = verificationSet.map((value) => ({
      value,
      evidenceType: classifyVerificationEvidence(value),
      refPath: verificationEvidenceRefPath(value)
    }));
    const verificationEvidenceTypeCounts = verificationEvidence.reduce((counts, evidence) => {
      counts[evidence.evidenceType] = (counts[evidence.evidenceType] || 0) + 1;
      return counts;
    }, {});
    const missingVerificationEvidenceRefs = verificationEvidence
      .filter((evidence) => evidence.refPath && !fileExists(evidence.refPath))
      .map((evidence) => evidence.refPath);
    const declaredVerificationGaps = verificationEvidence
      .filter((evidence) => evidence.evidenceType === 'declared-gap')
      .map((evidence) => evidence.value);
    const hasExecutableOrGeneratedVerificationEvidence = verificationEvidence
      .some((evidence) => evidence.evidenceType === 'executable-command' || evidence.evidenceType === 'generated-artifact');
    const passed = missingFields.length === 0
      && invalidBoundaryPosture === null
      && missingSectionFields.length === 0
      && implementationOwnerRefs.length > 0
      && missingImplementationOwnerRefs.length === 0
      && sourceEvidenceRefs.length > 0
      && missingSourceEvidenceRefs.length === 0
      && verificationSet.length > 0
      && missingVerificationEvidenceRefs.length === 0
      && declaredVerificationGaps.length === 0
      && hasExecutableOrGeneratedVerificationEvidence === true;

    return {
      recordId: record.recordId,
      canonicalRead: record.canonicalRead,
      boundaryPosture: record.boundaryPosture,
      missingFields,
      invalidBoundaryPosture,
      missingSectionFields,
      implementationOwnerRefs,
      missingImplementationOwnerRefs,
      sourceEvidenceRefs,
      missingSourceEvidenceRefs,
      verificationSet,
      verificationEvidence,
      verificationEvidenceTypeCounts,
      missingVerificationEvidenceRefs,
      declaredVerificationGaps,
      hasExecutableOrGeneratedVerificationEvidence,
      passed
    };
  });
  const boundaryPostureCounts = recordChecks.reduce((counts, check) => {
    counts[check.boundaryPosture] = (counts[check.boundaryPosture] || 0) + 1;
    return counts;
  }, {});

  return {
    reportId: 'v26-inference-implementation-record-registry',
    version: 'V26',
    requiredFields: V26_INFERENCE_IMPLEMENTATION_RECORD_REQUIRED_FIELDS,
    requiredSectionFields: V26_INFERENCE_IMPLEMENTATION_SECTION_REQUIREMENTS,
    requiredBoundaryPostures: V26_INFERENCE_BOUNDARY_POSTURES,
    verificationEvidenceTypes: V26_INFERENCE_VERIFICATION_EVIDENCE_TYPES,
    recordCount: V26_INFERENCE_IMPLEMENTATION_RECORDS.length,
    boundaryPostureCounts,
    passed: recordChecks.every((check) => check.passed === true),
    records: V26_INFERENCE_IMPLEMENTATION_RECORDS,
    recordChecks
  };
}
