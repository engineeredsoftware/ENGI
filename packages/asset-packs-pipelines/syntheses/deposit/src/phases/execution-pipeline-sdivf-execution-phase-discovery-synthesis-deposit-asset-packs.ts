/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisDepositAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Discovery → SynthesisDepositAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the deposit synthesis product.
 *
 * Discovery budget law (V48 monorepo): full three-agent PTRR Discovery spent
 * ~12 of 14 minutes on Bitcode (runs 936b7f16, e7e5dd6f) and left Implementation
 * without time to Finish. Product default is **bounded** Discovery: full PTRR
 * codebase comprehension only; inherent-regurgitation + depository-search are
 * deterministic stubs that still satisfy Validation store presence.
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

function envTruthy(raw: string | undefined): boolean {
  return ['1', 'true', 'yes', 'on'].includes(String(raw || '').trim().toLowerCase());
}

function envFalsy(raw: string | undefined): boolean {
  return ['0', 'false', 'no', 'off'].includes(String(raw || '').trim().toLowerCase());
}

/**
 * Resolve deposit Discovery profile.
 * - bounded (default): codebase full PTRR; skip regurgitation + depository search
 * - full: all three Discovery agents full PTRR
 * BITCODE_DEBUG_FAST_DISCOVERY=0 forces full (review / repro full Discovery).
 */
export function resolveDepositDiscoveryProfile(env: NodeJS.ProcessEnv = process.env): {
  profile: 'bounded' | 'full';
  skipRegurgitation: boolean;
  skipSearch: boolean;
  reason: string;
} {
  if (envFalsy(env.BITCODE_DEBUG_FAST_DISCOVERY)) {
    return {
      profile: 'full',
      skipRegurgitation: false,
      skipSearch: false,
      reason: 'BITCODE_DEBUG_FAST_DISCOVERY=0 forces full Discovery',
    };
  }
  const raw = String(env.BITCODE_DEPOSIT_DISCOVERY_PROFILE || 'bounded')
    .trim()
    .toLowerCase();
  if (raw === 'full' || raw === 'complete' || raw === 'all') {
    return {
      profile: 'full',
      skipRegurgitation: false,
      skipSearch: false,
      reason: 'BITCODE_DEPOSIT_DISCOVERY_PROFILE=full',
    };
  }
  return {
    profile: 'bounded',
    skipRegurgitation: true,
    skipSearch: true,
    reason:
      'bounded deposit Discovery (codebase PTRR only) — leave host budget for Implementation/Validation/Finish',
  };
}

/**
 * ExecutionPipelineSDIVFExecutionPhase Discovery specialization for deposit synthesis.
 * Wave 1: comprehend-codebase [∥ inherent-regurgitation] → wave 2: depository relevants.
 * Bounded profile stubs regurgitation + search for product monorepo host budgets.
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

  const productProfile = resolveDepositDiscoveryProfile(process.env);

  // Progressive QA stop filters (when set) still skip earlier agents.
  const progressiveSkipCodebase =
    Boolean(stopFilter || stopPhase) &&
    (targetsImplementation || targetsRegurgitation || targetsSearch) &&
    !targetsCodebase;
  const progressiveSkipRegurgitation =
    Boolean(stopFilter || stopPhase) &&
    (targetsImplementation || targetsSearch) &&
    !targetsRegurgitation;
  const progressiveSkipSearch =
    Boolean(stopFilter || stopPhase) &&
    targetsImplementation &&
    !targetsSearch;

  // Product bounded: skip regurgitation + search unless progressive QA forces
  // them (target points at those agents) or profile is full.
  const skipCodebase = progressiveSkipCodebase;
  const skipRegurgitation =
    progressiveSkipRegurgitation ||
    (productProfile.skipRegurgitation && !targetsRegurgitation);
  const skipSearch =
    progressiveSkipSearch || (productProfile.skipSearch && !targetsSearch);

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
          schema: 'bitcode.deposit.bounded-discovery.regurgitation',
          summary:
            'Bounded Discovery: InherentRegurgitation skipped (product profile) so Implementation can finish within host budget.',
          relevantKnowledge: [],
          patterns: [],
          references: [],
          skipped: true,
          profile: productProfile.profile,
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
          schema: 'bitcode.deposit.bounded-discovery.depository-search',
          summary:
            'Bounded Discovery: DepositorySearchForRelevants skipped (product profile); Implementation uses codebase comprehension only.',
          guidance: {
            summary:
              'Depository demand search deferred under bounded Discovery — prioritize source-measured packs from codebase comprehension.',
            likelyReadTopics: [] as string[],
            demandAlignment: [] as string[],
            underservedTopics: [] as string[],
            readabilityNotes: [] as string[],
          },
          searchQueries: [] as string[],
          hits: [] as unknown[],
          skipped: true,
          profile: productProfile.profile,
        });
        return passthroughInput;
      },
    );
  }

  storeCrossPhaseArtifact(execution, 'discovery', 'phaseDecision', {
    schema: 'bitcode.pipeline.phase-decision',
    formalPhaseDecision: true,
    phase: 'discovery',
    agent: 'discovery-profile',
    step: 'decide',
    failsafe: productProfile.profile === 'bounded' ? 'bounded-discovery' : 'full-discovery',
    generation: 'structure',
    summary: `Discovery profile=${productProfile.profile}: ${productProfile.reason}. skipCodebase=${skipCodebase} skipRegurgitation=${skipRegurgitation} skipSearch=${skipSearch}.`,
    message: `Discovery profile=${productProfile.profile}: ${productProfile.reason}. skipCodebase=${skipCodebase} skipRegurgitation=${skipRegurgitation} skipSearch=${skipSearch}.`,
    profile: productProfile.profile,
    skipCodebase,
    skipRegurgitation,
    skipSearch,
  });

  // Product default: serial wave-1 Discovery. Parallel comprehend-codebase ∥
  // inherent-regurgitation OOM-killed the sandbox (exit 137) on Bitcode monorepo
  // right after Setup closed (run 9d8bcf0f). Opt into parallel only with
  // BITCODE_DEBUG_DISCOVERY_PARALLEL=1 on small checkouts.
  const forceParallel = envTruthy(process.env.BITCODE_DEBUG_DISCOVERY_PARALLEL);
  const forceSerial =
    envTruthy(process.env.BITCODE_DEBUG_DISCOVERY_SERIAL) ||
    envTruthy(process.env.BITCODE_DEBUG_SETUP_SERIAL);
  const serialDiscovery = forceSerial || !forceParallel;
  try {
    (execution as any).store?.('discovery', 'wave1Serial', serialDiscovery);
    (execution as any).store?.('discovery', 'profile', productProfile.profile);
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
