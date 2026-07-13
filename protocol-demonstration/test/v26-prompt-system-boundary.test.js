import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname, '..');

const DISALLOWED_PROMPT_INTERNAL_IMPORT = /(?:from\s+['"][^'"]*prompts\/src\/|require\(['"][^'"]*prompts\/src\/)/u;
const DISALLOWED_PROMPT_ROOT_BARREL_IMPORT = /(?:from\s+['"]@bitcode\/prompts['"]|require\(['"]@bitcode\/prompts['"]\))/u;
const DISALLOWED_MANUAL_PROMPT_ASSIGNMENT_DOC = /execution\.prompt\s*=/u;
const DISALLOWED_ACTIVE_AGENT_PROMPT_OLD_RELEASE_METADATA = /current_version:\s*"G[A]1|G[A]-1|pre.G[A]1/u;
const DISALLOWED_SUPPORT_SOURCE_REACH_THROUGH = [
  {
    filePath: 'packages/prompts/src/prompt.ts',
    pattern: /registry\/src\/index/u
  },
  {
    filePath: 'packages/prompts/src/prompt.js',
    pattern: /registry\/src\/index/u
  },
  {
    filePath: 'packages/prompts/src/execution/PromptExecution.ts',
    pattern: /execution-generics\/src\/Execution/u
  },
  {
    filePath: 'packages/prompts/src/execution/PromptExecution.js',
    pattern: /execution-generics\/src\/Execution/u
  },
  {
    filePath: 'packages/tools-generics/src/execution/ToolExecution.ts',
    pattern: /execution-generics\/src\/Execution/u
  },
  {
    filePath: 'packages/tools-generics/src/execution/ToolExecution.js',
    pattern: /execution-generics\/src\/Execution/u
  },
  {
    filePath: 'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
    pattern: /(?:registry\/src\/index|execution-generics\/src\/Execution)/u
  },
  {
    filePath: 'packages/tools-generics/src/execution/ToolPromptRegistry.js',
    pattern: /registry\/src\/index/u
  },
  {
    filePath: 'packages/tools-generics/src/doc-code-tool/DocCodeToolPlugin.ts',
    pattern: /doc-comment\/src\/index/u
  },
  {
    filePath: 'packages/tools-generics/src/doc-code-tool/DocCodeToolPlugin.js',
    pattern: /doc-comment\/src\/index/u
  },
];
const ACTIVE_PROMPT_CORRIDORS = [
  'packages/execution-generics/src',
  'packages/pipelines-generics/src',
  'packages/agent-generics/src',
  'packages/conversations-generics/src',
  'packages/tools-generics/src',
  'packages/asset-packs-pipelines/domain/scripts',
];
const SUPPORT_PROMPT_CORRIDORS = [
  'packages/digest/prompts',
];
const REFERENCE_PROMPT_CORRIDORS = [
  'packages/generic-agents',
  'packages/generic-tools',
  'packages/external-apps/chatgpt/src/prompts',
  'packages/doc-comment/examples',
];
const REFERENCE_PROMPT_CONFIG_FILES = [
  'packages/external-apps/chatgpt/tsconfig.test.json',
  'packages/external-apps/chatgpt/jest.config.cjs',
];
const ACTIVE_AGENT_PROMPT_HIERARCHY_DOCS = [
  'packages/agent-generics/README.md',
  'packages/agent-generics/TLDR.md',
  'packages/agent-generics/src/agents/factories.ts',
  'packages/agent-generics/src/execution/AgentExecution.ts',
  'packages/execution-generics/src/store/registry.ts',
  'packages/execution-generics/src/executors/resilient_executor.ts',
  'packages/pipelines-generics/src/gate-system/types.ts',
  'packages/conversations-generics/src/agent/ConversationAgent.ts',
];
const ACTIVE_AGENT_PROMPT_DOC_COMMENT_FILES = [
  'packages/agent-generics/src/prompts/AgentPrompt.ts',
  'packages/agent-generics/src/prompts/AgentPrompt.d.ts',
  'packages/agent-generics/src/prompts/AgentStepPrompt.ts',
  'packages/agent-generics/src/prompts/AgentStepPrompt.d.ts',
  'packages/agent-generics/src/prompts/AgentGenerationSubStepPrompt.ts',
  'packages/agent-generics/src/prompts/FailsafeMetaSubStepPrompt.ts',
  'packages/agent-generics/src/prompts/ToolExecutionPrompt.ts',
  'packages/conversations-generics/src/agent/ConversationAgent.ts',
  'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
];
const CONVERSATION_RAW_PROMPTPART_FILES = [
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_identity_corestatement.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_capabilities_list.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_usage_guidance.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_name.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_identity_definition.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrplan_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrtry_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrrefine_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrretry_purpose.ts',
];
const ACTIVE_PROMPT_PRIMITIVE_CARRIERS = [
  'packages/execution-generics/src/prompts/ExecutionPrompt.ts',
  'packages/execution-generics/src/prompts/ExecutionPrompt.js',
  'packages/execution-generics/src/prompts/ExecutionPrompt.d.ts',
  'packages/agent-generics/src/prompts/AgentPrompt.ts',
  'packages/agent-generics/src/prompts/AgentPrompt.js',
  'packages/agent-generics/src/prompts/AgentPrompt.d.ts',
  'packages/agent-generics/src/prompts/AgentStepPrompt.ts',
  'packages/agent-generics/src/prompts/AgentStepPrompt.js',
  'packages/agent-generics/src/prompts/AgentStepPrompt.d.ts',
  'packages/agent-generics/src/prompts/AgentGenerationSubStepPrompt.ts',
  'packages/agent-generics/src/prompts/AgentGenerationSubStepPrompt.js',
  'packages/agent-generics/src/prompts/FailsafeMetaSubStepPrompt.ts',
  'packages/agent-generics/src/prompts/FailsafeMetaSubStepPrompt.js',
  'packages/agent-generics/src/prompts/ToolExecutionPrompt.ts',
  'packages/agent-generics/src/prompts/ToolExecutionPrompt.js',
  'packages/agent-generics/src/execution/prompt-overlays.ts',
  'packages/agent-generics/src/execution/prompt-overlays.js',
  'packages/agent-generics/src/substeps/factories.ts',
  'packages/pipelines-generics/src/prompts/PipelinePrompt.ts',
  'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
  'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.js',
  'packages/conversations-generics/src/agent/ConversationAgent.ts',
];
const ADMITTED_PROMPT_PRIMITIVE_CORRIDORS = [
  'packages/asset-packs-pipelines/domain/src',
];
const ADMITTED_PROMPT_PRIMITIVE_FILES = [
  'packages/tools-generics/src/types.ts',
  'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
  'packages/tools-generics/src/doc-code-tool/formatUsableTools.d.ts',
  'packages/llm-generics/src/generation.ts',
  'packages/llm-generics/src/generation.d.ts',
  'packages/time/src/doc-prompts/time-prompt-doc.ts',
];
const ACTIVE_EXECUTION_PROMPT_CARRIERS = [
  'packages/agent-generics/src/execution/AgentExecution.ts',
  'packages/agent-generics/src/execution/AgentExecution.d.ts',
  'packages/agent-generics/src/execution/index.ts',
  'packages/agent-generics/src/execution/index.js',
  'packages/agent-generics/src/execution/index.d.ts',
  'packages/agent-generics/src/execution/AgentPromptsRegistry.ts',
  'packages/agent-generics/src/execution/AgentPromptsRegistry.d.ts',
  'packages/agent-generics/src/execution/AgentToolsRegistry.ts',
  'packages/agent-generics/src/execution/AgentToolsRegistry.d.ts',
  'packages/agent-generics/src/execution/AgentLLMsRegistry.ts',
  'packages/agent-generics/src/execution/AgentLLMsRegistry.d.ts',
  'packages/agent-generics/src/execution/AgentAgentsRegistry.ts',
  'packages/agent-generics/src/execution/AgentAgentsRegistry.d.ts',
  'packages/conversations-generics/src/agent/ConversationAgent.ts',
  'packages/conversations-generics/src/agent/ConversationAgent.js',
  'packages/pipelines-generics/src/execution/PipelineExecution.ts',
  'packages/pipelines-generics/src/execution/PipelinePromptRegistry.ts',
  'packages/pipelines-generics/src/execution/PipelineToolRegistry.ts',
  'packages/pipelines-generics/src/execution/PipelineLLMRegistry.ts',
  'packages/pipelines-generics/src/execution/PipelineAgentRegistry.ts',
];
const ACTIVE_EXECUTION_TREE_CARRIERS = [
  'packages/agent-generics/src/agents/factories.ts',
  'packages/agent-generics/src/agents/factories.d.ts',
  'packages/agent-generics/src/diagnostics/trace.ts',
  'packages/agent-generics/src/diagnostics/trace.d.ts',
  'packages/agent-generics/src/diagnostics/instrumentation.ts',
  'packages/agent-generics/src/diagnostics/instrumentation.d.ts',
  'packages/agent-generics/src/execution/file-diff-integration.ts',
  'packages/agent-generics/src/execution/file-diff-integration.d.ts',
  'packages/agent-generics/src/substeps/factories.ts',
  'packages/agent-generics/src/substeps/factories.d.ts',
  'packages/agent-generics/src/types.ts',
  'packages/pipelines-generics/src/execution/resume.ts',
  'packages/pipelines-generics/src/execution/Metrics.ts',
  'packages/pipelines-generics/src/execution/pipeline-types.ts',
  'packages/pipelines-generics/src/execution/route-pipeline-execution.ts',
  'packages/pipelines-generics/src/phases/phase-factory.ts',
  'packages/pipelines-generics/src/phases/sdivf-factory.ts',
  'packages/pipelines-generics/src/pipeline-factory.ts',
  'packages/pipelines-generics/src/gate-system/meta-phase-orchestrator.ts',
  'packages/pipelines-generics/src/gate-system/types.ts',
  'packages/pipelines-generics/src/executors/wait-for-instruction.ts',
  'packages/pipelines-generics/src/streaming/pipeline-stream-integration.ts',
];
const DISALLOWED_REFERENCE_PROMPT_CONFIG_PATTERNS = [
  /"@bitcode\/prompts\/\*"\s*:\s*\["packages\/prompts\/src\/\*"\]/u,
  /"@bitcode\/prompts"\s*:\s*\["packages\/prompts\/src\/index\.ts"\]/u,
  /\^@bitcode\/prompts\/\(\.\*\)\$\s*['"]?\s*:\s*['"][^'"]*prompts\/src\/\$1['"]/u,
  /\^@bitcode\/prompts\$\s*['"]?\s*:\s*['"][^'"]*prompts\/src\/index\.ts['"]/u,
];
const DISALLOWED_EXECUTION_ROOT_BARREL_IMPORT = /(?:from\s+['"]@bitcode\/execution-generics['"]|require\(['"]@bitcode\/execution-generics['"]\)|import\(['"]@bitcode\/execution-generics['"]\))/u;

function listFilesRecursively(targetPath) {
  const absolutePath = path.join(repoRoot, targetPath);
  const entries = readdirSync(absolutePath);
  const files = [];

  for (const entry of entries) {
    const absoluteEntry = path.join(absolutePath, entry);
    const relativeEntry = path.relative(repoRoot, absoluteEntry);
    const stats = statSync(absoluteEntry);

    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === 'tmp' || entry === 'dist') {
        continue;
      }
      files.push(...listFilesRecursively(relativeEntry));
      continue;
    }

    if (/\.(?:ts|tsx|js|mjs|cjs|d\.ts)$/u.test(entry)) {
      files.push(relativeEntry);
    }
  }

  return files;
}

function importsExecutionFromRootBarrel(source) {
  if (importExecutionFromRoot(source)) {
    return true;
  }

  const requireMatch = source.match(/const\s+(\w+)\s*=\s*require\(['"]@bitcode\/execution-generics['"]\);/u);
  if (requireMatch) {
    const requireBinding = requireMatch[1];
    return new RegExp(`\\b${requireBinding}\\.Execution\\b`, 'u').test(source);
  }

  return false;
}

function importExecutionFromRoot(source) {
  return /import(?:\s+type)?\s*\{[^}]*\bExecution\b[^}]*\}\s*from\s*['"]@bitcode\/execution-generics['"]/u.test(source)
    || /import\(['"]@bitcode\/execution-generics['"]\)[\s\S]*?\.Execution\b/u.test(source);
}

test('V26 prompt system keeps a public package boundary for active inference carriers', () => {
  const promptIndexSource = readFileSync(path.join(repoRoot, 'packages/prompts/src/index.ts'), 'utf8');
  const promptSource = readFileSync(path.join(repoRoot, 'packages/prompts/src/prompt.ts'), 'utf8');
  const registrySource = readFileSync(path.join(repoRoot, 'packages/registry/src/index.ts'), 'utf8');
  const registryReadmeSource = readFileSync(path.join(repoRoot, 'packages/registry/README.md'), 'utf8');
  const promptPackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/prompts/package.json'), 'utf8')
  );
  const executionPackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/execution-generics/package.json'), 'utf8')
  );
  const conversationsPackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/conversations-generics/package.json'), 'utf8')
  );

  assert.match(promptIndexSource, /PromptExecution/u);
  assert.match(promptIndexSource, /createPromptExecution/u);
  assert.match(promptIndexSource, /Active inference packages must import PromptPart, Prompt, PromptExecution/u);
  assert.match(promptIndexSource, /`Prompt` extends `RegistryImpl<PromptPart>`/u);
  assert.match(promptIndexSource, /\/raw_promptparts\/generic\/: base, reusable, and Registry-inheritable PromptPart layers/u);
  assert.match(promptIndexSource, /\/raw_promptparts\/specific\/: concrete implementations of PromptPart types for Bitcode/u);
  assert.match(promptSource, /export class Prompt extends RegistryImpl<PromptPart>/u);
  assert.match(promptSource, /generic base PromptParts and specific/u);
  assert.match(registrySource, /get\(paths: string\[\], merger\?: \(base: T, override: T\) => T\): T \| undefined/u);
  assert.match(registrySource, /Sort by priority \(higher first\)/u);
  assert.match(registryReadmeSource, /Prompt` is a `RegistryImpl<PromptPart>`/u);
  assert.match(registryReadmeSource, /`raw_promptparts\/generic` and `PROMPTPART_GENERIC_\*` are base reusable/u);
  assert.match(registryReadmeSource, /`raw_promptparts\/specific` and `PROMPTPART_SPECIFIC_\*` are concrete/u);
  assert.ok(promptPackageJson.exports['./prompt']);
  assert.ok(promptPackageJson.exports['./parts/PromptPart']);
  assert.ok(promptPackageJson.exports['./execution/PromptExecution']);
  assert.ok(promptPackageJson.exports['./formatters']);
  assert.ok(promptPackageJson.exports['./raw_promptparts/*']);
  assert.ok(executionPackageJson.exports['./prompts/ExecutionPrompt']);
  assert.equal(promptPackageJson.dependencies['@bitcode/execution-generics'], 'workspace:*');
  assert.equal(conversationsPackageJson.dependencies['@bitcode/execution-generics'], 'workspace:*');

  const violations = ACTIVE_PROMPT_CORRIDORS
    .flatMap((corridor) => listFilesRecursively(corridor))
    .filter((filePath) => DISALLOWED_PROMPT_INTERNAL_IMPORT.test(readFileSync(path.join(repoRoot, filePath), 'utf8')));

  assert.deepEqual(
    violations,
    [],
    `Active prompt consumers must use @bitcode/prompts, not internal prompts/src reach-through: ${violations.join(', ')}`
  );
});

test('V26 active prompt primitive carriers prefer narrow public prompt subpaths', () => {
  const violations = ACTIVE_PROMPT_PRIMITIVE_CARRIERS.filter((filePath) =>
    DISALLOWED_PROMPT_ROOT_BARREL_IMPORT.test(readFileSync(path.join(repoRoot, filePath), 'utf8'))
  );

  assert.deepEqual(
    violations,
    [],
    `Active prompt primitive carriers must use narrow public prompt subpaths instead of the root @bitcode/prompts barrel: ${violations.join(', ')}`
  );
});

test('V26 active agent prompt hierarchy docs align with factory-owned Registry-backed composition', () => {
  const manualAssignmentViolations = ACTIVE_AGENT_PROMPT_HIERARCHY_DOCS.filter((filePath) =>
    DISALLOWED_MANUAL_PROMPT_ASSIGNMENT_DOC.test(readFileSync(path.join(repoRoot, filePath), 'utf8'))
  );

  assert.deepEqual(
    manualAssignmentViolations,
    [],
    `Active agent prompt hierarchy docs and comments must not teach manual execution.prompt assignment: ${manualAssignmentViolations.join(', ')}`
  );

  const oldMetadataViolations = [
    ...ACTIVE_AGENT_PROMPT_HIERARCHY_DOCS,
    ...ACTIVE_AGENT_PROMPT_DOC_COMMENT_FILES,
  ].filter((filePath) =>
    DISALLOWED_ACTIVE_AGENT_PROMPT_OLD_RELEASE_METADATA.test(readFileSync(path.join(repoRoot, filePath), 'utf8'))
  );

  assert.deepEqual(
    oldMetadataViolations,
    [],
    `Active agent prompt hierarchy docs and doc-comments must use Bitcode V26 prompt-registry language, not old release lineage: ${oldMetadataViolations.join(', ')}`
  );

  const agentPromptSource = readFileSync(path.join(repoRoot, 'packages/agent-generics/src/prompts/AgentPrompt.ts'), 'utf8');
  const agentFactorySource = readFileSync(path.join(repoRoot, 'packages/agent-generics/src/agents/factories.ts'), 'utf8');
  const agentReadmeSource = readFileSync(path.join(repoRoot, 'packages/agent-generics/README.md'), 'utf8');
  const agentTldrSource = readFileSync(path.join(repoRoot, 'packages/agent-generics/TLDR.md'), 'utf8');

  assert.match(agentPromptSource, /Bitcode Registry-backed prompt hierarchy/u);
  assert.match(agentPromptSource, /BITCODE_V26_AGENT_PROMPT_REGISTRY\.1/u);
  assert.match(agentFactorySource, /BitcodePTRRFactoryConfig/u);
  assert.match(agentFactorySource, /assertBitcodePTRRPromptCarrier/u);
  assert.match(agentFactorySource, /requires a Bitcode Registry-backed prompt carrier/u);
  assert.match(agentFactorySource, /missing \$\{missingStepPrompts\.join\(', '\)\} step Prompt registries/u);
  assert.match(agentReadmeSource, /Read the prompt registry that the factory attached/u);
  assert.match(agentReadmeSource, /Keep prompts factory-owned/u);
  assert.match(agentTldrSource, /Prompts are attached by the factory/u);
});

test('V26 Terminal conversation prompts are specific raw PromptPart-backed registries', () => {
  const conversationAgentSource = readFileSync(
    path.join(repoRoot, 'packages/conversations-generics/src/agent/ConversationAgent.ts'),
    'utf8'
  );
  const conversationPackageIndexSource = readFileSync(
    path.join(repoRoot, 'packages/conversations-generics/src/index.ts'),
    'utf8'
  );
  const conversationSystemPromptSource = readFileSync(
    path.join(repoRoot, 'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts'),
    'utf8'
  );
  const conversationAppPromptBindingSource = readFileSync(
    path.join(repoRoot, 'uapi/prompts/bitcode-terminal-system-prompt.ts'),
    'utf8'
  );
  const conversationPromptPartSource = CONVERSATION_RAW_PROMPTPART_FILES
    .map((filePath) => readFileSync(path.join(repoRoot, filePath), 'utf8'))
    .join('\n');

  assert.doesNotMatch(conversationAgentSource, /as PromptPart/u);
  assert.match(conversationAgentSource, /PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_NAME/u);
  assert.match(conversationAgentSource, /PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRPLAN_PURPOSE/u);
  assert.match(conversationAgentSource, /PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRTRY_PURPOSE/u);
  assert.match(conversationAgentSource, /PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRREFINE_PURPOSE/u);
  assert.match(conversationAgentSource, /PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRRETRY_PURPOSE/u);
  assert.match(conversationPackageIndexSource, /BitcodeTerminalConversationSystemPrompt/u);
  assert.match(conversationPackageIndexSource, /BITCODE_TERMINAL_CONVERSATION_SYSTEM_PROMPT/u);
  assert.doesNotMatch(conversationPackageIndexSource, /\bConversationSystemPrompt\b/u);
  assert.doesNotMatch(conversationPackageIndexSource, /\bCONVERSATION_SYSTEM_PROMPT\b/u);
  assert.match(conversationSystemPromptSource, /Bitcode Terminal conversation system prompt assembled from specific PromptParts/u);
  assert.match(conversationSystemPromptSource, /BITCODE_TERMINAL_CONVERSATION_SYSTEM_PROMPT/u);
  assert.match(conversationSystemPromptSource, /BitcodeTerminalConversationSystemPrompt/u);
  assert.doesNotMatch(conversationSystemPromptSource, /\bConversationSystemPrompt\b/u);
  assert.doesNotMatch(conversationSystemPromptSource, /\bCONVERSATION_SYSTEM_PROMPT\b/u);
  assert.match(conversationAppPromptBindingSource, /BITCODE_TERMINAL_APP_SYSTEM_PROMPT/u);
  assert.match(conversationAppPromptBindingSource, /BITCODE_TERMINAL_CONVERSATION_SYSTEM_PROMPT/u);
  assert.doesNotMatch(conversationAppPromptBindingSource, /CONVERSATIONS_APP_SYSTEM_PROMPT/u);
  assert.doesNotMatch(conversationPromptPartSource, /G[A]1|AI-powered full product operator|Conversations product|Automated generation of deliverables/u);
  assert.match(conversationPromptPartSource, /BITCODE_V26_CONVERSATION_AGENT_PROMPTPART\.1/u);
  assert.match(conversationPromptPartSource, /BITCODE_V26_CONVERSATION_SYSTEM_PROMPTPART\.1/u);
  assert.match(conversationPromptPartSource, /Bitcode Terminal response/u);
  assert.match(conversationPromptPartSource, /do not detach Conversations from Bitcode/u);
});

test('V26 source-bearing admitted deliverable and prompt-primitive support carriers prefer narrow public prompt subpaths', () => {
  const violations = [
    ...ADMITTED_PROMPT_PRIMITIVE_CORRIDORS
      .flatMap((corridor) => listFilesRecursively(corridor))
      .filter((filePath) => !filePath.endsWith('.js')),
    ...ADMITTED_PROMPT_PRIMITIVE_FILES,
  ].filter((filePath) =>
    DISALLOWED_PROMPT_ROOT_BARREL_IMPORT.test(readFileSync(path.join(repoRoot, filePath), 'utf8'))
  );

  assert.deepEqual(
    violations,
    [],
    `Source-bearing admitted AssetPack and prompt-primitive support carriers must use narrow public prompt subpaths instead of the root @bitcode/prompts barrel: ${violations.join(', ')}`
  );
});

test('V26 execution-aware prompt carriers prefer narrow public execution subpaths', () => {
  const violations = ACTIVE_EXECUTION_PROMPT_CARRIERS.filter((filePath) =>
    DISALLOWED_EXECUTION_ROOT_BARREL_IMPORT.test(readFileSync(path.join(repoRoot, filePath), 'utf8'))
  );

  assert.deepEqual(
    violations,
    [],
    `Execution-aware prompt carriers must use @bitcode/execution-generics public subpaths instead of the broad execution barrel: ${violations.join(', ')}`
  );
});

test('V26 broader active execution-bearing carriers keep base Execution on the public Execution subpath', () => {
  const violations = ACTIVE_EXECUTION_TREE_CARRIERS.filter((filePath) =>
    importsExecutionFromRootBarrel(readFileSync(path.join(repoRoot, filePath), 'utf8'))
  );

  assert.deepEqual(
    violations,
    [],
    `Broader active execution-bearing carriers must import Execution from @bitcode/execution-generics/Execution and keep the root barrel only for needed utilities: ${violations.join(', ')}`
  );
});

test('V26 prompt support consumers keep promptpart access on the public package boundary', () => {
  const violations = SUPPORT_PROMPT_CORRIDORS
    .flatMap((corridor) => listFilesRecursively(corridor))
    .filter((filePath) => DISALLOWED_PROMPT_INTERNAL_IMPORT.test(readFileSync(path.join(repoRoot, filePath), 'utf8')));

  assert.deepEqual(
    violations,
    [],
    `Support prompt consumers must use @bitcode/prompts/raw_promptparts or @bitcode/prompts, not sibling prompts/src reach-through: ${violations.join(', ')}`
  );
});

test('V26 support packages expose honest public subpaths and runtime carriers avoid repo-relative reach-through', () => {
  const executionPackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/execution-generics/package.json'), 'utf8')
  );
  const registryPackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/registry/package.json'), 'utf8')
  );
  const docCommentPackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/doc-comment/package.json'), 'utf8')
  );
  const docCodePackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/doc-code/package.json'), 'utf8')
  );
  const toolsPackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/tools-generics/package.json'), 'utf8')
  );

  assert.equal(executionPackageJson.main, 'src/index.js');
  assert.equal(executionPackageJson.types, 'src/index.ts');
  assert.ok(executionPackageJson.exports['./Execution']);
  assert.ok(executionPackageJson.exports['./store/registry']);

  assert.equal(registryPackageJson.main, 'src/index.ts');
  assert.equal(registryPackageJson.types, 'src/index.ts');

  assert.equal(docCommentPackageJson.main, 'src/index.js');
  assert.equal(docCommentPackageJson.types, 'src/index.ts');
  assert.ok(docCommentPackageJson.exports['./base-plugin']);
  assert.ok(docCommentPackageJson.exports['./types']);

  assert.equal(docCodePackageJson.main, 'src/index.js');
  assert.equal(docCodePackageJson.types, 'src/index.ts');
  assert.ok(docCodePackageJson.exports['./transformDocCodeTools']);

  assert.equal(toolsPackageJson.main, 'src/index.js');
  assert.equal(toolsPackageJson.types, 'src/index.ts');
  assert.ok(toolsPackageJson.exports['./execution']);
  assert.ok(toolsPackageJson.exports['./doc-code-tool']);

  const reachThroughViolations = DISALLOWED_SUPPORT_SOURCE_REACH_THROUGH.filter(({ filePath, pattern }) =>
    pattern.test(readFileSync(path.join(repoRoot, filePath), 'utf8'))
  ).map(({ filePath }) => filePath);

  assert.deepEqual(
    reachThroughViolations,
    [],
    `Prompt/doc-code runtime carriers must use public support-package subpaths instead of repo-relative source reach-through: ${reachThroughViolations.join(', ')}`
  );
});

test('V26 retained reference prompt consumers use narrow public prompt subpaths instead of the root barrel', () => {
  const violations = REFERENCE_PROMPT_CORRIDORS
    .flatMap((corridor) => listFilesRecursively(corridor))
    .filter((filePath) => DISALLOWED_PROMPT_ROOT_BARREL_IMPORT.test(readFileSync(path.join(repoRoot, filePath), 'utf8')));

  assert.deepEqual(
    violations,
    [],
    `Reference prompt consumers must use narrow public prompt subpaths instead of the root @bitcode/prompts barrel: ${violations.join(', ')}`
  );
});

test('V26 retained reference prompt configs avoid broad prompts source catchalls', () => {
  const violations = REFERENCE_PROMPT_CONFIG_FILES.filter((filePath) => {
    const source = readFileSync(path.join(repoRoot, filePath), 'utf8');
    return DISALLOWED_REFERENCE_PROMPT_CONFIG_PATTERNS.some((pattern) => pattern.test(source));
  });

  assert.deepEqual(
    violations,
    [],
    `Reference prompt configs must prefer exact public prompt subpath maps over broad prompts/src catchalls: ${violations.join(', ')}`
  );
});

test('V26 read-comprehension prompt reservoir is canonical Bitcode read comprehension', () => {
  const readComprehensionReadme = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/README.md'),
    'utf8'
  );
  const readComprehensionPackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/generic-tools/read-comprehension/package.json'), 'utf8')
  );
  const readComprehensionAgentPackageJson = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/generic-agents/read-comprehension/package.json'), 'utf8')
  );
  const readComprehensionAgentReadme = readFileSync(
    path.join(repoRoot, 'packages/generic-agents/read-comprehension/README.md'),
    'utf8'
  );
  const readComprehensionAgentSource = readFileSync(
    path.join(repoRoot, 'packages/generic-agents/read-comprehension/src/index.ts'),
    'utf8'
  );
  const readComprehensionTsconfig = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/generic-tools/read-comprehension/tsconfig.json'), 'utf8')
  );
  const analyzeReadToolSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/AnalyzeReadSemanticsTool.ts'),
    'utf8'
  );
  const toolsetSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/ReadComprehensionToolset.ts'),
    'utf8'
  );
  const extractToolSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/ExtractReadRequirementsTool.ts'),
    'utf8'
  );
  const identifyToolSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/IdentifyReadConstraintsTool.ts'),
    'utf8'
  );
  const satisfactionToolSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/GenerateReadSatisfactionCriteriaTool.ts'),
    'utf8'
  );
  const validateToolSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/ValidateReadComprehensionTool.ts'),
    'utf8'
  );
  const complexityToolSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/AnalyzeReadSatisfactionImplementationComplexityTool.ts'),
    'utf8'
  );
  const canonicalPrimitivesSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/read-comprehension-primitives.ts'),
    'utf8'
  );
  const analyzePromptSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSemanticsDocCodeToolPrompt.ts'),
    'utf8'
  );
  const extractPromptSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/prompts/ExtractReadRequirementsDocCodeToolPrompt.ts'),
    'utf8'
  );
  const identifyPromptSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/prompts/IdentifyReadConstraintsDocCodeToolPrompt.ts'),
    'utf8'
  );
  const successPromptSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/prompts/GenerateReadSatisfactionCriteriaDocCodeToolPrompt.ts'),
    'utf8'
  );
  const validatePromptSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/prompts/ValidateReadComprehensionDocCodeToolPrompt.ts'),
    'utf8'
  );
  const complexityPromptSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSatisfactionImplementationComplexityDocCodeToolPrompt.ts'),
    'utf8'
  );
  const promptsIndexSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/prompts/index.ts'),
    'utf8'
  );
  const canonicalSchemasSource = readFileSync(
    path.join(repoRoot, 'packages/generic-tools/read-comprehension/src/read-comprehension-schemas.ts'),
    'utf8'
  );
  const purposePromptPart = readFileSync(
    path.join(
      repoRoot,
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsemantics_doccodetoolpurpose.ts'
    ),
    'utf8'
  );
  const analyzeOutputPromptPart = readFileSync(
    path.join(
      repoRoot,
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsemantics_doccodetooloutput.ts'
    ),
    'utf8'
  );
  const complexityPromptPart = readFileSync(
    path.join(
      repoRoot,
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsatisfactionimplementationcomplexity_doccodetoolexample3.ts'
    ),
    'utf8'
  );
  const validatePromptPart = readFileSync(
    path.join(
      repoRoot,
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_validateneedcomprehension_doccodetoolpurpose.ts'
    ),
    'utf8'
  );
  const comprehendReadSystemPromptPart = readFileSync(
    path.join(
      repoRoot,
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_identity.ts'
    ),
    'utf8'
  );
  const comprehendReadTryPromptPart = readFileSync(
    path.join(
      repoRoot,
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_try_directives.ts'
    ),
    'utf8'
  );

  assert.match(readComprehensionReadme, /Read Comprehension Tools/u);
  assert.match(readComprehensionReadme, /package path and package name are canonical Bitcode tool owners/u);
  assert.match(readComprehensionReadme, /written asset/u);
  assert.match(readComprehensionReadme, /delivery mechanism/u);
  assert.match(readComprehensionReadme, /callable tool reservoir, not the setup-phase agent/u);
  assert.match(readComprehensionReadme, /@bitcode\/generic-agents-read-comprehension/u);
  assert.match(readComprehensionReadme, /source is TypeScript-only/u);
  assert.equal(readComprehensionPackageJson.dependencies['@bitcode/prompts'], 'workspace:*');
  assert.equal(readComprehensionPackageJson.dependencies['@bitcode/tools-generics'], 'workspace:*');
  assert.equal(readComprehensionAgentPackageJson.dependencies['@bitcode/generic-tools-read-comprehension'], 'workspace:*');
  assert.match(readComprehensionAgentReadme, /PTRR agent owner for Bitcode setup-phase Read comprehension/u);
  assert.match(readComprehensionAgentReadme, /owns DocCode tool prompts, callable tool classes, pure primitives, and schemas/u);
  assert.match(readComprehensionAgentSource, /factoryAgentWithPTRR/u);
  assert.match(readComprehensionAgentSource, /bitcodeSetupReadComprehensionAgent/u);
  assert.match(readComprehensionAgentSource, /phase: z\.literal\('setup'\)/u);
  assert.match(readComprehensionAgentSource, /beforeAgent: z\.literal\('danger-wall'\)/u);
  assert.match(readComprehensionAgentSource, /PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_IDENTITY/u);
  assert.match(readComprehensionAgentSource, /analyzeReadSemanticsTool/u);
  assert.match(readComprehensionAgentSource, /extractReadRequirementsTool/u);
  assert.match(readComprehensionAgentSource, /validateReadComprehensionTool/u);
  assert.equal(readComprehensionTsconfig.compilerOptions.noEmit, true);
  assert.equal(readComprehensionTsconfig.compilerOptions.module, 'ESNext');
  assert.equal(readComprehensionTsconfig.compilerOptions.moduleResolution, 'Bundler');
  assert.equal(
    readComprehensionTsconfig.compilerOptions.paths['@bitcode/prompts/raw_promptparts/*'][0],
    'packages/prompts/src/raw_promptparts/*.ts'
  );
  assert.doesNotMatch(JSON.stringify(readComprehensionTsconfig), /\.d\.ts/u);
  assert.doesNotMatch(JSON.stringify(readComprehensionTsconfig), /@bitcode\/prompts\/\*/u);
  assert.match(readComprehensionReadme, /Bitcode does not have tasks as canonical product semantics/u);
  assert.match(readComprehensionReadme, /Canonical prompt owners now live in `AnalyzeReadSemanticsDocCodeToolPrompt`, `ExtractReadRequirementsDocCodeToolPrompt`, `IdentifyReadConstraintsDocCodeToolPrompt`, `GenerateReadSatisfactionCriteriaDocCodeToolPrompt`, `ValidateReadComprehensionDocCodeToolPrompt`, and `AnalyzeReadSatisfactionImplementationComplexityDocCodeToolPrompt`/u);
  assert.match(readComprehensionReadme, /Canonical code owners now live in individually defined tool files/u);
  assert.match(readComprehensionReadme, /`ReadComprehensionToolset` is only the collection surface used by agents and registries/u);
  assert.match(readComprehensionReadme, /raw PromptPart families for this package are also read-first/u);
  assert.match(analyzeReadToolSource, /Canonical Bitcode read-semantics tool owner/u);
  assert.match(analyzeReadToolSource, /analyzeReadSemantics/u);
  assert.match(extractToolSource, /export class ExtractReadRequirementsTool/u);
  assert.match(identifyToolSource, /export class IdentifyReadConstraintsTool/u);
  assert.match(satisfactionToolSource, /export class GenerateReadSatisfactionCriteriaTool/u);
  assert.match(validateToolSource, /export class ValidateReadComprehensionTool/u);
  assert.match(complexityToolSource, /export class AnalyzeReadSatisfactionImplementationComplexityTool/u);
  assert.match(toolsetSource, /Canonical Bitcode read-comprehension tool collection/u);
  assert.match(toolsetSource, /individually defined tools are intentionally not agents/u);
  assert.match(toolsetSource, /BITCODE_READ_COMPREHENSION_TOOLSET/u);
  assert.deepEqual(
    listFilesRecursively('packages/generic-tools/read-comprehension/src')
      .filter((filePath) => filePath.endsWith('.js')),
    [],
    'read-comprehension source must stay TypeScript-only; generated JavaScript belongs outside src'
  );
  assert.deepEqual(
    listFilesRecursively('packages/generic-agents/read-comprehension/src')
      .filter((filePath) => filePath.endsWith('.js')),
    [],
    'read-comprehension agent source must stay TypeScript-only; stale generated JavaScript must not carry old fields'
  );
  assert.match(canonicalPrimitivesSource, /export async function analyzeReadSemantics/u);
  assert.match(canonicalPrimitivesSource, /export async function extractReadRequirements/u);
  assert.match(canonicalPrimitivesSource, /export async function identifyReadConstraints/u);
  assert.match(canonicalPrimitivesSource, /export async function generateReadSatisfactionCriteria/u);
  assert.match(canonicalPrimitivesSource, /export async function validateReadComprehension/u);
  assert.match(canonicalPrimitivesSource, /export async function analyzeReadSatisfactionImplementationComplexity/u);
  assert.match(promptsIndexSource, /read_owner_only/u);
  for (const removedReadComprehensionFile of [
    'packages/generic-tools/read-comprehension/src/AnalyzeTaskSemanticsTool.ts',
    'packages/generic-tools/read-comprehension/src/primitives.ts',
    'packages/generic-tools/read-comprehension/src/schemas.ts',
    'packages/generic-tools/read-comprehension/src/prompts/AnalyzeTaskSemanticsDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/ExtractRequirementsDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/IdentifyConstraintsDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/GenerateSuccessCriteriaDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/ValidateTaskComprehensionDocCodeToolPrompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts/AnalyzeImplementationComplexityDocCodeToolPrompt.ts'
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, removedReadComprehensionFile)),
      false,
      `${removedReadComprehensionFile} must stay removed from the V26 prompt boundary`
    );
  }
  for (const removedRawPromptPartFamily of [
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzetasksemantics_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_extractrequirements_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_identifyconstraints_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_generatesuccesscriteria_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_validatetaskcomprehension_doccodetoolpurpose.ts',
    'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeimplementationcomplexity_doccodetoolpurpose.ts'
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, removedRawPromptPartFamily)),
      false,
      `${removedRawPromptPartFamily} must stay removed after read-first raw PromptPart recut`
    );
  }
  assert.match(analyzePromptSource, /BITCODE_V26_ANALYZE_READ_SEMANTICS_DOC_CODE_TOOL_PROMPT_REGISTRY\.1/u);
  assert.match(analyzePromptSource, /'read-comprehension' as PromptPart/u);
  assert.match(analyzePromptSource, /local to the package that owns its use/u);
  assert.match(analyzePromptSource, /asset-pack synthesis/u);
  assert.match(extractPromptSource, /BITCODE_V26_EXTRACT_READ_REQUIREMENTS_DOC_CODE_TOOL_PROMPT_REGISTRY\.1/u);
  assert.match(extractPromptSource, /delivery-mechanism expectations/u);
  assert.match(identifyPromptSource, /BITCODE_V26_IDENTIFY_READ_CONSTRAINTS_DOC_CODE_TOOL_PROMPT_REGISTRY\.1/u);
  assert.match(identifyPromptSource, /delivery-mechanism limits/u);
  assert.match(successPromptSource, /BITCODE_V26_GENERATE_READ_SATISFACTION_CRITERIA_DOC_CODE_TOOL_PROMPT_REGISTRY\.1/u);
  assert.match(successPromptSource, /measurable read-satisfaction[\s*]+criteria/u);
  assert.match(validatePromptSource, /BITCODE_V26_VALIDATE_READ_COMPREHENSION_DOC_CODE_TOOL_PROMPT_REGISTRY\.1/u);
  assert.match(complexityPromptSource, /BITCODE_V26_ANALYZE_READ_SATISFACTION_IMPLEMENTATION_COMPLEXITY_DOC_CODE_TOOL_PROMPT_REGISTRY\.1/u);
  assert.match(complexityPromptSource, /delivery-mechanism handling/u);
  assert.match(canonicalPrimitivesSource, /read_satisfaction_criteria/u);
  assert.match(canonicalPrimitivesSource, /written_asset_expectations/u);
  assert.match(canonicalPrimitivesSource, /delivery_mechanism_boundaries/u);
  assert.match(canonicalPrimitivesSource, /source_to_shares_service_questions/u);
  assert.match(canonicalPrimitivesSource, /commercial_accountability/u);
  assert.match(canonicalPrimitivesSource, /Advanced Engineered Software, Inc\./u);
  assert.doesNotMatch(canonicalPrimitivesSource, /shipping_wrapper_boundaries/u);
  assert.doesNotMatch(canonicalSchemasSource, /ReadComprehensionCompatibilityPrimaryTypeSchema/u);
  assert.match(canonicalSchemasSource, /ReadRequirementSchema/u);
  assert.match(canonicalSchemasSource, /ReadConstraintSchema/u);
  assert.match(canonicalSchemasSource, /ReadSatisfactionCriterionSchema/u);
  assert.match(purposePromptPart, /Analyze an expressed Bitcode read/u);
  assert.match(purposePromptPart, /written-asset expectations/u);
  assert.match(purposePromptPart, /source-to-shares service questions/u);
  assert.match(analyzeOutputPromptPart, /sourceToSharesServiceQuestions/u);
  assert.match(analyzeOutputPromptPart, /commercialAccountability/u);
  assert.doesNotMatch(analyzeOutputPromptPart, /shippingWrapperBoundaries/u);
  assert.match(complexityPromptPart, /Gate-closure reform/u);
  assert.match(complexityPromptPart, /proofRequirements/u);
  assert.match(validatePromptPart, /read-comprehension analysis has correctly understood the Bitcode read/u);
  assert.match(comprehendReadSystemPromptPart, /current_version: "V26"/u);
  assert.match(comprehendReadSystemPromptPart, /setup Read-comprehension agent/u);
  assert.match(comprehendReadSystemPromptPart, /before risk admission/u);
  assert.match(comprehendReadTryPromptPart, /current_version: "V26"/u);
  assert.match(comprehendReadTryPromptPart, /appropriate tool calls/u);
  assert.match(comprehendReadTryPromptPart, /delivery-mechanism separation/u);

  const combined = [
    readComprehensionReadme,
    readComprehensionAgentReadme,
    readComprehensionAgentSource,
    analyzeReadToolSource,
    toolsetSource,
    extractToolSource,
    identifyToolSource,
    satisfactionToolSource,
    validateToolSource,
    complexityToolSource,
    canonicalPrimitivesSource,
    analyzePromptSource,
    extractPromptSource,
    identifyPromptSource,
    successPromptSource,
    validatePromptSource,
    complexityPromptSource,
    promptsIndexSource,
    canonicalSchemasSource,
    purposePromptPart,
    analyzeOutputPromptPart,
    complexityPromptPart,
    validatePromptPart,
    comprehendReadSystemPromptPart,
    comprehendReadTryPromptPart
  ].join('\n');

  assert.doesNotMatch(combined, /G[A]1\.00\.0|G[A]1\.45\.0|\(fill intent\)/u);
  assert.doesNotMatch(combined, /transcendent|consciousness|AGI|task-analysis|@antml:prompts/u);
  assert.doesNotMatch(
    combined,
    /export\s+\{\s*AnalyzeTaskSemanticsTool|export\s+\*\s+from\s+['"]\.\/(?:AnalyzeTaskSemanticsTool|primitives|schemas)['"]|export\s+(?:async\s+function\s+)?(?:analyzeTaskSemantics|extractRequirementsTool|identifyConstraintsTool|generateSuccessCriteriaTool|validateTaskComprehensionTool|analyzeImplementationComplexityTool)\b|Compatibility wrapper for task-named/u
  );
});
