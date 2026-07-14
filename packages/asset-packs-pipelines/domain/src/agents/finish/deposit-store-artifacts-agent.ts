/**
 * finish:store-artifacts — persist deposit synthesis run artifacts.
 *
 * Stores AssetPack options (patch + measurements + metadata), discovery maps,
 * setup admission, and sourceCheckoutCatalog path counts on the Execution for
 * durable projection (dispatch/route writes Supabase from these stores).
 */

import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export default async function runDepositStoreArtifactsAgent(input: any, execution: any) {
  const options =
    findValue(execution, 'implementation', 'options') ??
    findValue(execution, 'implementation', 'assetPacks') ??
    [];
  const catalog =
    findValue(execution, 'deposit', 'sourceCheckoutCatalog') ??
    findValue(execution, 'deposit', 'inventory');
  const codebase = findValue(execution, 'discovery', 'codebaseComprehension');
  const depository = findValue(execution, 'discovery', 'depositorySearch');
  const regurgitation = findValue(execution, 'discovery', 'inherentRegurgitation');
  const measurements = findValue(execution, 'discovery', 'sourceMeasurements');
  const admission = findValue(execution, 'setup', 'admission');
  const validation = findValue(execution, 'validation', 'readyToFinish');

  const artifactBundle = {
    schema: 'bitcode.deposit.synthesize-asset-packs.artifacts',
    storedAt: new Date().toISOString(),
    assetPacks: Array.isArray(options) ? options : [],
    patches: (Array.isArray(options) ? options : []).map((opt: any) => ({
      title: opt?.title,
      kind: opt?.kind,
      patch: opt?.patch,
      coveredSourcePaths: opt?.coveredSourcePaths,
      absolutes: opt?.absolutes,
      metadata: {
        confidence: opt?.confidence,
        needinessSignal: opt?.needinessSignal,
        summary: opt?.summary,
      },
    })),
    discovery: {
      codebaseComprehension: codebase,
      depositorySearch: depository,
      inherentRegurgitation: regurgitation,
      sourceMeasurements: measurements,
    },
    setup: { admission },
    validation,
    sourceCheckoutCatalog: catalog
      ? {
          pathCount: Array.isArray(catalog.paths) ? catalog.paths.length : 0,
          sampleCount: Array.isArray(catalog.samples) ? catalog.samples.length : 0,
          fileBodyCount: Array.isArray(catalog.sources) ? catalog.sources.length : 0,
          // Never persist full file bodies into finish bundle by default (source-safe).
          paths: Array.isArray(catalog.paths) ? catalog.paths : [],
        }
      : null,
  };

  storeCrossPhaseArtifact(execution, 'finish', 'storedArtifacts', artifactBundle);
  storeCrossPhaseArtifact(execution, 'finish', 'uploadForReview', {
    success: true,
    deliveryMechanism: 'bitcode-review-upload',
    review: {
      surface: '/deposits',
      reviewFor: 'deposit-admission',
      decision: 'pending-user-review',
    },
    options,
    artifacts: artifactBundle,
    summary: `Stored ${Array.isArray(options) ? options.length : 0} AssetPack artifact(s) for deposit review.`,
  });
  storeCrossPhaseArtifact(execution, 'finish', 'deliveryMechanism', 'bitcode-review-upload');

  return {
    ...(input || {}),
    success: true,
    storedArtifacts: artifactBundle,
  };
}
