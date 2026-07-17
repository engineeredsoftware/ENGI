/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisReadAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Discovery → SynthesisReadAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the read synthesis product.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Executor, sequential, parallel } from '@bitcode/execution-generics';
import type { AssetPackInput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';
import {
  DISCOVERY_COMPREHEND_CODEBASE,
  DISCOVERY_INHERENT_REGURGITATION,
  DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/phases/discovery';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';

type SetupOutput = AssetPackInput;
type DiscoveryOutput = AssetPackInput;

/**
 * ExecutionPipelineSDIVFExecutionPhase Discovery specialization for read synthesis.
 * Wave 1: comprehend-codebase ∥ inherent-regurgitation → wave 2: Need-fits search.
 * Pattern-aligned with deposit Discovery (serial + progressive agent skip).
 */
export const executionPipelineSDIVFExecutionPhaseDiscoverySynthesisReadAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  SetupOutput,
  DiscoveryOutput
> = (async (input: AssetPackInput, execution: any) => {
  try {
    const { registerDiscoveryAgents } = await import(
      '@bitcode/asset-packs-pipelines-syntheses-domain/phases/discovery'
    );
    registerDiscoveryAgents((execution as any).agents, 'read');
  } catch {}

  const stopFilter = String(
    process.env.BITCODE_DEBUG_STOP_AGENT_FILTER || '',
  ).toLowerCase();
  const targetsCodebase =
    !stopFilter ||
    stopFilter.includes('codebasecomprehension') ||
    stopFilter.includes('comprehend-codebase');
  const targetsRegurgitation =
    stopFilter.includes('inherentregurgitation') ||
    stopFilter.includes('inherent-regurgitation') ||
    stopFilter.includes('regurgitation');
  const targetsSearch =
    stopFilter.includes('depository') ||
    stopFilter.includes('search-depository') ||
    stopFilter.includes('need-fits') ||
    stopFilter.includes('needfits');

  if (stopFilter && !targetsCodebase) {
    (execution as any).agents?.registerAgent?.(
      DISCOVERY_COMPREHEND_CODEBASE,
      async (passthroughInput: any, exec: any) => {
        storeCrossPhaseArtifact(exec, 'discovery', 'codebaseComprehension', {
          schema: 'bitcode.debug.fast-discovery.codebase',
          summary:
            'Fast Discovery: CodebaseComprehension skipped for progressive read QA.',
          capabilities: [],
          knowledgeAreas: [],
          notableModules: [],
        });
        return passthroughInput;
      },
    );
  }
  if (stopFilter && targetsSearch && !targetsRegurgitation) {
    (execution as any).agents?.registerAgent?.(
      DISCOVERY_INHERENT_REGURGITATION,
      async (passthroughInput: any, exec: any) => {
        storeCrossPhaseArtifact(exec, 'discovery', 'inherentRegurgitation', {
          schema: 'bitcode.debug.fast-discovery.regurgitation',
          summary:
            'Fast Discovery: InherentRegurgitation skipped for Need-fits progressive QA.',
          relevantKnowledge: [],
          patterns: [],
          references: [],
        });
        return passthroughInput;
      },
    );
  }

  const serialDiscovery =
    String(process.env.BITCODE_DEBUG_DISCOVERY_SERIAL || '').toLowerCase() ===
      '1' ||
    String(process.env.BITCODE_DEBUG_DISCOVERY_SERIAL || '').toLowerCase() ===
      'true' ||
    String(process.env.BITCODE_DEBUG_SETUP_SERIAL || '').toLowerCase() ===
      '1' ||
    String(process.env.BITCODE_DEBUG_SETUP_SERIAL || '').toLowerCase() ===
      'true';
  const wave1 = serialDiscovery
    ? sequential(
        createAgentExecutor(DISCOVERY_COMPREHEND_CODEBASE),
        createAgentExecutor(DISCOVERY_INHERENT_REGURGITATION),
      )
    : parallel(
        createAgentExecutor(DISCOVERY_COMPREHEND_CODEBASE),
        createAgentExecutor(DISCOVERY_INHERENT_REGURGITATION),
      );
  const exec: Executor<any, any> = sequential(
    wave1,
    createAgentExecutor(DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS),
  );
  return await exec(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  SetupOutput,
  DiscoveryOutput
>;
