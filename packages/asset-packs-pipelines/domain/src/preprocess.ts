/**
 * AssetPack Pipeline Initialization
 *
 * Registers pipeline-level defaults:
 * - LLM providers + default model (from env or safe defaults)
 * - Pipeline system prompt
 * - Superset of tools usable across agents
 */

import {
  ExecutionPipeline,
  enableExecutionDebug,
  ExecutionPipelineLLMRegistry,
  ExecutionPipelinePromptRegistry,
  ExecutionPipelineToolRegistry,
  ExecutionPipelineAgentRegistry,
  ExecutionPipelineClass as PE,
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

export async function initializeAssetPackPipeline(execution: ExecutionPipeline) {
  // 0) Hard guard: ensure this execution has LLM registry and child() creates ExecutionPipeline children
  try {
    if (!(execution as any).prompts) {
      (execution as any).prompts = new ExecutionPipelinePromptRegistry(execution as any);
    }
    if (!(execution as any).tools) {
      (execution as any).tools = new ExecutionPipelineToolRegistry(execution as any);
    }
    if (!(execution as any).llms) {
      (execution as any).llms = new ExecutionPipelineLLMRegistry(execution as any);
    }
    if (!(execution as any).agents) {
      (execution as any).agents = new ExecutionPipelineAgentRegistry(execution as any);
    }
    // Ensure child executions remain ExecutionPipeline instances
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
  // Discovery agents register when deposit/read Discovery phases run (product three-agent roster).
  // Implementation, validation, and Finish register product SDIVF agents when phases run.
  // Buyer-repo PR shipping is settle-asset-pack-pipeline only.
}

export const initializeAssetPack = initializeAssetPackPipeline;
