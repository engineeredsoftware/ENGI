/**
 * finish:store-artifacts for read synthesis — product re-implementation.
 *
 * Domain base store host only — never imports the deposit product package.
 * Product delta: review surface → /reads settle handoff.
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';

export default async function runReadStoreArtifactsAgent(input: any, execution: any) {
  const { default: runBaseStore } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/agents/finish/asset-packs-store-artifacts-agent'
  );
  const out = await runBaseStore(input, execution);
  storeCrossPhaseArtifact(execution, 'finish', 'uploadForReview', {
    ...(execution?.get?.('finish', 'uploadForReview') || {}),
    review: {
      surface: '/reads',
      reviewFor: 'read-option-select-then-settle',
      decision: 'pending-user-review',
      nextPipeline: 'settle-asset-pack-pipeline',
    },
  });
  return out;
}
