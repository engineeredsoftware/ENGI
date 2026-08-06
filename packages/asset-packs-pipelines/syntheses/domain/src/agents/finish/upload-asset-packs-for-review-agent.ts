/**
 * Finish: store synthesized AssetPack artifacts for Bitcode **user review**.
 *
 * Both synthesis modes (deposit + read) Finish by recording synthesized artifacts
 * for review — deposit → /deposits admission; read → /reads before purchase.
 *
 * This is **not** Delivery. Delivery is exclusive to settle-asset-pack-pipeline:
 * settled Synthesized Read AssetPack(s) shipped as buyer-repo PRs after BTD-BTC
 * and Bitcode System finalities.
 *
 * This is **not** Settlement. Settlement is exclusive to settle-asset-pack-pipeline:
 * BTD-BTC payment + Bitcode System finalities.
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
  const options = findValue(execution, 'implementation', 'options') ?? null;
  const artifacts =
    findValue(execution, 'implementation', 'assetPackSynthesisArtifacts') ??
    findValue(execution, 'implementation', 'writtenAssets') ??
    null;
  const assetPack = findValue(execution, 'implementation', 'assetPack') ?? {};
  const sourceSummary =
    findValue(execution, 'implementation', 'summary') ?? 'Synthesized AssetPacks.';

  const reviewUpload = {
    success: true,
    /** Review-store kind — never "delivery" (delivery = settle PR ship). */
    kind: 'bitcode-review-upload' as const,
    review: {
      surface: mode === 'deposit' ? '/deposits' : '/reads',
      reviewFor: mode === 'deposit' ? ('deposit-admission' as const) : ('purchase' as const),
      decision: 'pending-user-review' as const,
    },
    assetPack,
    artifacts,
    options,
    summary: `Synthesized AssetPacks stored for ${mode} review on Bitcode.`,
    sourceSummary,
  };

  storeCrossPhaseArtifact(execution, 'finish', 'uploadForReview', reviewUpload);
  storeCrossPhaseArtifact(execution, 'finish', 'reviewUpload', reviewUpload.kind);

  return { ...(input || {}), ...reviewUpload };
}
