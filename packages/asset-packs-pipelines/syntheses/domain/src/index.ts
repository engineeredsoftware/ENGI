/**
 * AssetPack **syntheses** shared domain (deposit + read SDIVF only).
 *
 * Not for settle. All-three shared libraries: `@bitcode/asset-packs-pipelines-domain`.
 * Product packages: `syntheses/deposit`, `syntheses/read` (co-located product-specific code).
 */

import type { Execution } from '@bitcode/execution-generics';
import {
  factoryExecutionPipelineSDIVFFromExecutors,
  type ExecutionPipelineSDIVF,
} from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { initializeAssetPackPipeline } from './preprocess';
import { normalizeAssetPackOutput, buildAssetPackPostprocessedResult } from './postprocess';
import {
  resolveSynthesizeAssetPacksMode,
  storeCrossPhaseArtifact,
  storeSynthesizeAssetPacksMode,
} from './synthesize-asset-packs';

export * from './synthesize-asset-packs';
export { storeCrossPhaseArtifact } from './synthesize-asset-packs';
export { initializeAssetPackPipeline } from './preprocess';
export { normalizeAssetPackOutput, buildAssetPackPostprocessedResult } from './postprocess';

export { EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT } from './prompts/execution-pipeline-sdivf-synthesize-asset-packs-prompts';

// Shared synthesis helpers still used by product packages and hosts
export * from './asset-packs-synthesis';
export * from './asset-packs-synthesis-catalogs';
export * from './asset-packs-synthesis-inventory';
export * from './asset-packs-synthesis-neediness';
export * from './asset-packs-synthesis-pipeline';
export * from './asset-packs-synthesis-types';
export * from './asset-packs-synthesis-validate';
export * from './asset-pack-measurements';
export * from './asset-pack-preview-boundary';
export * from './depository-search';
export * from './depository-supply-index';
export * from './depository-settled-demand-estimate';
export * from './runtime-inference-policy';
export * from './semantic-resolution';
export * from './embedding-config';
export * from './resolve-source-checkout-catalog';

// Phase builders shared by both products (setup/discovery helpers).
// Product rosters (depositPhases / readPhases) live on the product packages —
// do not re-export them here (package cycle).
export * from './phases/setup';
export * from './phases/discovery';
export * from './phases/implementation';
export * from './phases/validation';
export * from './phases/finish';

// Preprocess factories used by product packages
export {
  factoryPreprocess,
  factoryPreprocessDepositOnly,
  factoryPreprocessReadOnly,
} from './preprocess-mode-factories';

// Re-export types
export { AssetPackWrittenAssetType } from './types/AssetPackWrittenAssetType';


/** Dual-entry helper for MCP/API paths that pick mode at runtime. */
export async function runExecutionPipelineSDIVFSynthesizeAssetPacks(
  input: any,
  execution: import('@bitcode/execution-generics').Execution,
): Promise<any> {
  const { resolveSynthesizeAssetPacksMode, storeSynthesizeAssetPacksMode } = await import('./synthesize-asset-packs');
  const mode = resolveSynthesizeAssetPacksMode(input, execution as any);
  storeSynthesizeAssetPacksMode(execution as any, mode);
  if (mode === 'read') {
    const { runExecutionPipelineSDIVFSynthesizeReadAssetPacks } = await import(
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs'
    );
    return runExecutionPipelineSDIVFSynthesizeReadAssetPacks(input, execution);
  }
  const { runExecutionPipelineSDIVFSynthesizeDepositAssetPacks } = await import(
    '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs'
  );
  return runExecutionPipelineSDIVFSynthesizeDepositAssetPacks(input, execution);
}

/** Legacy default import: `import assetPack from '...'`. */
export default runExecutionPipelineSDIVFSynthesizeAssetPacks;
