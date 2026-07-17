/**
 * Real (inference-backed) deposit option synthesis types.
 *
 * Extends the blueprint deposit option synthesis with pipeline-core accounting
 * and exclusion posture from AssetPacksSynthesis.
 */

import type { DepositAssetPackOptionSynthesis } from './deposit-asset-pack-options-types';
import type { AssetPacksSynthesisInferenceAccounting } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';

export interface RealDepositAssetPackOptionSynthesis extends DepositAssetPackOptionSynthesis {
  synthesisMode: 'real-bounded-inference';
  pipelineCore: 'AssetPacksSynthesis';
  inference: AssetPacksSynthesisInferenceAccounting;
  exclusionPosture: {
    impermissibleSourceCount: number;
    exclusionRoots: string[];
    excludedPathCount: number;
    droppedCandidateCount: number;
  };
}

export interface DepositOptionReviewProjection {
  optionId: string;
  title: string;
  coveredSourcePaths: string[];
  measurementRationale: string;
}
