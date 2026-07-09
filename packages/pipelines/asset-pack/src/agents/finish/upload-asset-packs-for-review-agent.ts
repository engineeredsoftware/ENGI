/**
 * Upload AssetPacks for review — Finish phase (V48 Gate 3).
 *
 * Both synthesis modes finish by uploading the synthesized AssetPack artifacts
 * to Bitcode for the USER to review: deposit → review before admitting into the
 * Depository as supply; read → review before purchase. Opening a pull request
 * is NOT part of synthesis (that moves to the future Gate-6 SettleAssetPacks
 * pipeline: confirm BTC payment, mint BTD, transfer rights).
 *
 * A simple (non-PTRR) finalization agent: it reads the synthesized artifacts
 * from the Implementation phase stores and records them as a reviewable upload.
 */

import {
  storeCrossPhaseArtifact,
  synthesizeAssetPacksModeFromExecution,
} from '../../synthesize-asset-packs';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export default async function runUploadAssetPacksForReviewAgent(input: any, execution: any) {
  const mode = synthesizeAssetPacksModeFromExecution(execution) ?? 'read';
  // Deposit Implementation stores measured candidate options; read stores
  // synthesis artifacts. Upload whichever the active mode produced.
  const options = findValue(execution, 'implementation', 'options') ?? null;
  const artifacts =
    findValue(execution, 'implementation', 'assetPackSynthesisArtifacts') ??
    findValue(execution, 'implementation', 'writtenAssets') ??
    null;
  const assetPack = findValue(execution, 'implementation', 'assetPack') ?? {};
  const sourceSummary =
    findValue(execution, 'implementation', 'summary') ?? 'Synthesized AssetPacks.';

  const upload = {
    success: true,
    deliveryMechanism: 'bitcode-review-upload' as const,
    review: {
      surface: mode === 'deposit' ? '/deposits' : '/reads',
      reviewFor: mode === 'deposit' ? ('deposit-admission' as const) : ('purchase' as const),
      decision: 'pending-user-review' as const,
    },
    assetPack,
    artifacts,
    options,
    summary: `Synthesized AssetPacks uploaded to Bitcode for ${mode} review.`,
    sourceSummary,
  };

  // Cross-phase artifacts: postprocess and the run-level surfaces read the
  // upload record from outside the Finish sibling (cross-phase law).
  storeCrossPhaseArtifact(execution, 'finish', 'uploadForReview', upload);
  storeCrossPhaseArtifact(execution, 'finish', 'deliveryMechanism', 'bitcode-review-upload');

  return { ...(input || {}), ...upload };
}
