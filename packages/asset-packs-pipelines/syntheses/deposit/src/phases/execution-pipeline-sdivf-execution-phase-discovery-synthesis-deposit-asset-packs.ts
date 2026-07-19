/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisDepositAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Discovery → SynthesisDepositAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the deposit synthesis product.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Executor, sequential, parallel } from '@bitcode/execution-generics';
import type { AssetPackInput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';
import {
  DISCOVERY_COMPREHEND_CODEBASE,
  DISCOVERY_INHERENT_REGURGITATION,
  DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/phases/discovery';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';

type SetupOutput = AssetPackInput;
type DiscoveryOutput = AssetPackInput;

/**
 * ExecutionPipelineSDIVFExecutionPhase Discovery specialization for deposit synthesis.
 * Wave 1: comprehend-codebase ∥ inherent-regurgitation → wave 2: depository relevants.
 */
export const executionPipelineSDIVFExecutionPhaseDiscoverySynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  SetupOutput,
  DiscoveryOutput
> = (async (input: AssetPackInput, execution: any) => {
  try {
    const { registerDiscoveryAgents } = await import(
      '@bitcode/asset-packs-pipelines-syntheses-domain/phases/discovery'
    );
    registerDiscoveryAgents((execution as any).agents, 'deposit');
  } catch {}

  // Progressive Discovery QA: skip earlier agents when stop targets a later
  // Discovery agent or Implementation (Discovery closed → Implementation first LLM).
  // BITCODE_DEBUG_FAST_DISCOVERY=0 forces full Discovery (no stubs) for review runs.
  const fastDiscovery =
    String(process.env.BITCODE_DEBUG_FAST_DISCOVERY || '1').toLowerCase() !==
      '0' &&
    String(process.env.BITCODE_DEBUG_FAST_DISCOVERY || '1').toLowerCase() !==
      'false';
  const stopFilter = String(
    process.env.BITCODE_DEBUG_STOP_AGENT_FILTER || '',
  ).toLowerCase();
  const stopPhase = String(
    process.env.BITCODE_DEBUG_STOP_PHASE || '',
  ).toLowerCase();
  const targetsCodebase =
    stopFilter.includes('codebasecomprehension') ||
    stopFilter.includes('comprehend-codebase');
  const targetsRegurgitation =
    stopFilter.includes('inherentregurgitation') ||
    stopFilter.includes('inherent-regurgitation') ||
    stopFilter.includes('regurgitation');
  const targetsSearch =
    stopFilter.includes('depository') ||
    stopFilter.includes('search-depository') ||
    stopFilter.includes('searchforrelevants');
  const targetsImplementation =
    stopPhase === 'implementation' ||
    stopFilter.includes('assetpack') ||
    stopFilter.includes('asset-pack-synthesis') ||
    stopFilter.includes('depositassetpack');
  // Empty filter + discovery phase: run full Discovery (legacy first-agent QA).
  const skipCodebase =
    fastDiscovery &&
    Boolean(stopFilter || stopPhase) &&
    (targetsImplementation || targetsRegurgitation || targetsSearch) &&
    !targetsCodebase;
  const skipRegurgitation =
    fastDiscovery &&
    Boolean(stopFilter || stopPhase) &&
    (targetsImplementation || targetsSearch) &&
    !targetsRegurgitation;
  const skipSearch =
    fastDiscovery &&
    Boolean(stopFilter || stopPhase) &&
    targetsImplementation &&
    !targetsSearch;

  if (skipCodebase) {
    (execution as any).agents?.registerAgent?.(
      DISCOVERY_COMPREHEND_CODEBASE,
      async (passthroughInput: any, exec: any) => {
        storeCrossPhaseArtifact(exec, 'discovery', 'codebaseComprehension', {
          schema: 'bitcode.debug.fast-discovery.codebase',
          summary:
            'Fast Discovery: DepositCodebaseComprehension skipped (agent Accepted).',
          capabilities: [],
          knowledgeAreas: [],
          notableModules: [],
        });
        storeCrossPhaseArtifact(exec, 'discovery', 'codebaseAnalysis', {
          schema: 'bitcode.debug.fast-discovery.codebase-analysis',
          skipped: true,
        });
        return passthroughInput;
      },
    );
  }
  if (skipRegurgitation) {
    (execution as any).agents?.registerAgent?.(
      DISCOVERY_INHERENT_REGURGITATION,
      async (passthroughInput: any, exec: any) => {
        storeCrossPhaseArtifact(exec, 'discovery', 'inherentRegurgitation', {
          schema: 'bitcode.debug.fast-discovery.regurgitation',
          summary:
            'Fast Discovery: InherentRegurgitation skipped (agent Accepted / progressive QA).',
          relevantKnowledge: [],
          patterns: [],
          references: [],
        });
        return passthroughInput;
      },
    );
  }
  if (skipSearch) {
    (execution as any).agents?.registerAgent?.(
      DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS,
      async (passthroughInput: any, exec: any) => {
        storeCrossPhaseArtifact(exec, 'discovery', 'depositorySearch', {
          schema: 'bitcode.debug.fast-discovery.depository-search',
          summary:
            'Fast Discovery: DepositorySearchForRelevants skipped (agent Accepted; Discovery closed).',
          guidance: {
            summary: 'Discovery closed under progressive QA (fast skip).',
            likelyReadTopics: [] as string[],
            demandAlignment: [] as string[],
            underservedTopics: [] as string[],
            readabilityNotes: [] as string[],
          },
          searchQueries: [] as string[],
          hits: [] as unknown[],
          skipped: true,
        });
        return passthroughInput;
      },
    );
  }

  // Product default: serial wave-1 Discovery. Parallel comprehend-codebase ∥
  // inherent-regurgitation OOM-killed the sandbox (exit 137) on Bitcode monorepo
  // right after Setup closed (run 9d8bcf0f). Opt into parallel only with
  // BITCODE_DEBUG_DISCOVERY_PARALLEL=1 on small checkouts.
  const forceParallel =
    ['1', 'true', 'yes', 'on'].includes(
      String(process.env.BITCODE_DEBUG_DISCOVERY_PARALLEL || '')
        .trim()
        .toLowerCase(),
    );
  const forceSerial =
    ['1', 'true', 'yes', 'on'].includes(
      String(process.env.BITCODE_DEBUG_DISCOVERY_SERIAL || '')
        .trim()
        .toLowerCase(),
    ) ||
    ['1', 'true', 'yes', 'on'].includes(
      String(process.env.BITCODE_DEBUG_SETUP_SERIAL || '')
        .trim()
        .toLowerCase(),
    );
  const serialDiscovery = forceSerial || !forceParallel;
  try {
    (execution as any).store?.('discovery', 'wave1Serial', serialDiscovery);
  } catch {
    /* ignore */
  }
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
    createAgentExecutor(DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS),
  );
  return await exec(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  SetupOutput,
  DiscoveryOutput
>;
