/**
 * finish:store-artifacts for read synthesis — deposit twin with needinesses.
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import runDepositStore from './deposit-store-artifacts-agent';

export default async function runReadStoreArtifactsAgent(input: any, execution: any) {
  const out = await runDepositStore(input, execution);
  // Annotate product surface for read selection → settle handoff.
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
