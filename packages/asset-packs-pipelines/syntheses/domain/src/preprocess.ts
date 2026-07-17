/**
 * AssetPack Pipeline Initialization
 *
 * Registers pipeline-level defaults:
 * - LLM providers + default model (from env or safe defaults)
 * - Pipeline system prompt
 * - Superset of **Tools** on the pipeline tool registry
 *
 * ## Pipeline / product tool registration law
 *
 * Only **Tools** (`@bitcode/tools-generics` Tool instances) enter
 * `ExecutionPipelineToolRegistry`. Agents, LLMs, and prompt carriers do not.
 *
 * **DocCode is NOT required for registration.** `tool.__docCodePrompt` is a
 * Tool-only documentation attachment (usable-tool docs in PTRR Thinkings via
 * `auto:tools_doc_code_tools`). Prefer attaching DocCode for production tools;
 * missing DocCode still registers the Tool — docs interpolation simply has less
 * to format.
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

  // 3) Pipeline tool catalog: Tools only. DocCode optional (docs, not a gate).
  const registered: string[] = [];
  const withoutDocCode: string[] = [];
  for (const tool of ALL_ASSET_PACK_TOOLS) {
    const key = (tool as any).name || tool.constructor?.name || 'asset-pack-tool';
    try {
      if (!tool || typeof tool !== 'object') continue;
      execution.tools.registerTool(key, tool as any);
      registered.push(key);
      if (!(tool as any).__docCodePrompt) withoutDocCode.push(key);
    } catch (err) {
      try {
        const { log } = require('@bitcode/logger');
        log('[asset-pack/preprocess] pipeline tool registration failed', 'warn', {
          key,
          registry: 'ExecutionPipelineToolRegistry',
          level: 'pipeline',
          err: err instanceof Error ? err.message : String(err),
        });
      } catch {
        /* ignore */
      }
    }
  }
  try {
    execution.store('tools', 'pipelineCatalog', {
      registered,
      withoutDocCode,
      law: 'Tools register without DocCode gate; __docCodePrompt is optional Tool docs',
    } as any);
  } catch {
    /* ignore */
  }

  // 4) Register Setup agents used during bring-up
  try {
    const cloneAgent = (await import('./agents/setup/asset-pack-clone-vcs-repository-agent')).default as any;
    execution.agents.registerAgent('setup:asset-pack-clone-vcs-repository-agent', cloneAgent);
  } catch {}
  try {
    // Read-product setup agents live under syntheses/read (co-located).
    // Path is relative to this file (domain/src/), not phases/.
    const setupPlan = (
      await import('../../read/src/agents/setup/read-fits-finding-synthesis-setup-plan-agent')
    ).default as any;
    execution.agents.registerAgent('setup:ReadFitsFindingSynthesisSetupPlanAgent', setupPlan);
  } catch {}
  try {
    const comprehendAgent = (
      await import(
        '../../read/src/agents/setup/read-fits-finding-synthesis-read-comprehension-agent'
      )
    ).default as any;
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
