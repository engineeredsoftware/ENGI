/**
 * AssetPack Pipeline Initialization
 *
 * Registers pipeline-level defaults:
 * - LLM providers + default model (from env or safe defaults)
 * - Pipeline system prompt
 * - Superset of tools usable across agents
 */

import {
  PipelineExecution,
  enableExecutionDebug,
  PipelineLLMRegistry,
  PipelinePromptRegistry,
  PipelineToolRegistry,
  PipelineAgentRegistry,
  PipelineExecutionClass as PE,
} from '@bitcode/pipelines-generics';
import type { Tool } from '@bitcode/tools-generics';
import { factoryLLMRegistryWithProviders, resolveDefaultLLMConfig } from '@bitcode/generic-llms';
import { LLMRegistry } from '@bitcode/llm-generics';
import { ALL_ASSET_PACK_TOOLS } from './tools';

function assertDocCodePrompt(tool: Tool, key: string) {
  if (!tool || typeof tool !== 'object') return;
  if (!(tool as any).__docCodePrompt) {
    throw new Error(`DocCode prompt missing for tool ${key}`);
  }
}

export async function initializeAssetPackPipeline(execution: PipelineExecution) {
  // 0) Hard guard: ensure this execution has LLM registry and child() creates PipelineExecution children
  try {
    if (!(execution as any).prompts) {
      (execution as any).prompts = new PipelinePromptRegistry(execution as any);
    }
    if (!(execution as any).tools) {
      (execution as any).tools = new PipelineToolRegistry(execution as any);
    }
    if (!(execution as any).llms) {
      (execution as any).llms = new PipelineLLMRegistry(execution as any);
    }
    if (!(execution as any).agents) {
      (execution as any).agents = new PipelineAgentRegistry(execution as any);
    }
    // Ensure child executions remain PipelineExecution instances
    const originalChild = (execution as any).child?.bind(execution);
    (execution as any).child = (id: string) => {
      try { return new PE(`${(execution as any).id}/${id}`, execution as any); } catch { return originalChild ? originalChild(id) : new PE(id, execution as any); }
    };
  } catch {}
  // 1) LLM providers + default
  try {
    const llmRegistry = factoryLLMRegistryWithProviders();
    const { provider, model } = resolveDefaultLLMConfig();
    if (typeof (llmRegistry as any).setDefaultProvider === 'function') {
      (llmRegistry as any).setDefaultProvider(provider);
    }
    // Global default for all pipeline runs.
    llmRegistry.configure('*', { model });
    execution.llms.setLLMRegistry(llmRegistry as any);
  } catch (_) {
    // Defensive fallback: construct a minimal registry and configure a default
    try {
      const fallback = new LLMRegistry();
      // Best-effort register providers
      try {
        const { openAIProvider } = require('@bitcode/generic-llms-openai');
        fallback.registerProvider(openAIProvider);
      } catch {}
      try {
        const { anthropicProvider } = require('@bitcode/generic-llms-anthropic');
        fallback.registerProvider(anthropicProvider);
      } catch {}
      try {
        const { googleProvider } = require('@bitcode/generic-llms-google');
        fallback.registerProvider(googleProvider);
      } catch {}
      try {
        const { xaiProvider } = require('@bitcode/generic-llms-xai');
        fallback.registerProvider(xaiProvider);
      } catch {}
      const { provider, model } = resolveDefaultLLMConfig();
      if (typeof (fallback as any).setDefaultProvider === 'function') {
        (fallback as any).setDefaultProvider(provider);
      }
      fallback.configure('*', { model });
      execution.llms.setLLMRegistry(fallback as any);
      // Seed an explicit default at this execution path so lookups succeed
      try {
        (execution.llms as any).set('default', { model });
      } catch {}
    } catch {}
  }

  // 2) Debug mode: enable deep logging for AssetPack runs
  try {
    enableExecutionDebug(execution, true);
    execution.store('config', 'debug', true);
  } catch {}

  // 3) Register all baseline tools
  try {
    for (const tool of ALL_ASSET_PACK_TOOLS) {
      const key = (tool as any).name || tool.constructor?.name || 'asset-pack-tool';
      assertDocCodePrompt(tool as Tool, key);
      execution.tools.registerTool(key, tool as any);
    }
  } catch (_) {
    // Tool registration failures should not stop bootstrapping
  }

  // 4) Register Setup agents used during bring-up
  try {
    const cloneAgent = (await import('./agents/setup/asset-pack-clone-vcs-repository-agent')).default as any;
    execution.agents.registerAgent('setup:asset-pack-clone-vcs-repository-agent', cloneAgent);
  } catch {}
  try {
    const setupPlan = (await import('./agents/setup/read-fits-finding-synthesis-setup-plan-agent')).default as any;
    execution.agents.registerAgent('setup:ReadFitsFindingSynthesisSetupPlanAgent', setupPlan);
  } catch {}
  try {
    const comprehendAgent = (await import('./agents/setup/read-fits-finding-synthesis-read-comprehension-agent')).default as any;
    execution.agents.registerAgent('setup:ReadFitsFindingSynthesisReadComprehensionAgent', comprehendAgent);
    execution.agents.registerAgent('setup:asset-pack-comprehend-read-definition-agent', comprehendAgent);
  } catch {}
  try {
    const dangerWallAgent = (await import('./agents/setup/asset-pack-danger-wall-agent')).default as any;
    execution.agents.registerAgent('setup:asset-pack-danger-wall-agent', dangerWallAgent);
  } catch {}
  try {
    const initializeMcpsToolsAgent = (await import('./agents/setup/asset-pack-initialize-mcps-tools-agent')).default as any;
    execution.agents.registerAgent('setup:asset-pack-initialize-mcps-tools-agent', initializeMcpsToolsAgent);
  } catch {}
  // Register discovery agents
  try {
    const { registerDiscoveryAgents } = await import('./phases/discovery');
    registerDiscoveryAgents((execution as any).agents);
  } catch {}
  // Register design gate agents
  try {
    const iterateProductMd = (await import('./agents/design/iterate-product-md-agent')).default;
    execution.agents.registerAgent('design:iterate-product-md', iterateProductMd as any);
  } catch {}
  // Register digest gate agents
  try {
    const captureLearnings = (await import('./agents/digest/capture-learnings-agent')).default;
    execution.agents.registerAgent('digest:capture-learnings', captureLearnings as any);
  } catch {}
  // Implementation, validation, and Finish register their canonical AssetPack agents when phases run.
}

export const initializeAssetPack = initializeAssetPackPipeline;
