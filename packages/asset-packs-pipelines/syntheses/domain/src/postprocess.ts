import type { AssetPackOutput, AssetPackPostprocessed } from './types/PipelineSchemas';
import { Execution, getValidationReadyToFinish } from '@bitcode/execution-generics';
import {
  resolveDeliveryMechanismTemplateFromExecution,
  resolveWrittenAssetTypeFromExecution,
} from './semantic-resolution';
import {
  buildAssetPackSourceSafePreview,
  isAcceptedReadNeed,
  type AssetPackSourceSafePreview,
} from '../../read/src/read-need';
import {
  assertAssetPackDisclosureSourceSafe,
  buildAssetPackDisclosureReview,
  type AssetPackDisclosureReview,
} from '@bitcode/asset-packs-pipelines-domain/asset-pack-disclosure';
import {
  buildAssetPackPreviewBoundary,
  persistAssetPackPreviewBoundary,
  type AssetPackPreviewBoundary,
} from './asset-pack-preview-boundary';
// Settlement / buyer-repo delivery / shippable PR are exclusive to
// settle-asset-pack-pipeline. This module is shared by deposit/read *synthesis*
// postprocess only — do not import or project settle rights/delivery unlocks here.
import {
  buildReadingOperationalTelemetryRepairReadback,
  persistReadingOperationalTelemetryRepairReadback,
  type ReadingOperationalTelemetryRepairReadback,
} from '../../read/src/reading-operational-telemetry-repair-readback';
import {
  buildReadingInterfaceProductParity,
  persistReadingInterfaceProductParity,
  type ReadingInterfaceProductParity,
} from '../../read/src/reading-interface-product-parity';
import {
  buildReadingLocalStagingRehearsal,
  persistReadingLocalStagingRehearsal,
  type ReadingLocalStagingRehearsal,
} from '../../read/src/reading-local-staging-rehearsal';

/**
 * Normalize *synthesis* pipeline output (deposit/read SDIVF).
 *
 * Hard law: settlement and buyer-repo delivery are exclusive to
 * settle-asset-pack-pipeline. This function never projects settleDelivery,
 * shippable PR, settlement rights unlock, or delivery-after-pay surfaces.
 */
export function normalizeAssetPackOutput(output: AssetPackOutput, execution: Execution): AssetPackOutput {
  const enhanced = { ...output };
  // Drop settle/delivery-only fields if callers leaked them onto synthesis output.
  delete (enhanced as any).settleDelivery;
  delete (enhanced as any).shippable;
  delete (enhanced as any).settlePassThrough;

  const assetPackSynthesisArtifacts =
    enhanced.assetPackSynthesisArtifacts ||
    findStoredExecutionValue(execution, 'implementation', 'assetPackSynthesisArtifacts') ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'assetPackSynthesisArtifacts') ||
    enhanced.writtenAssets;
  const writtenAssetType = resolveWrittenAssetTypeFromExecution(execution);
  // Catalog template only (e.g. future PR-shaped pack) — not settle execution.
  const deliveryMechanismTemplate = resolveDeliveryMechanismTemplateFromExecution(execution);
  const fitResult =
    (execution as any).findUp?.('fit', 'result') ||
    (execution as any).get?.('fit', 'result');
  const depositorySearch =
    (execution as any).findUp?.('depository/search', 'result') ||
    (execution as any).get?.('depository/search', 'result');

  const filesModified = enhanced.artifacts?.filesModified?.length
    ? enhanced.artifacts.filesModified
    : ((findStoredExecutionValue(execution, 'implementation', 'filesChanged') as string[]) || []);
  if (filesModified?.length) {
    enhanced.artifacts = {
      ...(enhanced.artifacts || ({} as any)),
      filesModified,
    } as any;
  }

  if (!enhanced.summary || !enhanced.summary.trim()) {
    const parts: string[] = [];
    parts.push(enhanced.success ? 'AssetPack synthesis artifacts completed.' : 'AssetPack synthesis artifacts finished with issues.');
    if (filesModified?.length) parts.push(`Files modified: ${filesModified.length}`);
    enhanced.summary = parts.join(' ');
  }

  if (assetPackSynthesisArtifacts) {
    enhanced.assetPackSynthesisArtifacts = assetPackSynthesisArtifacts as any;
    enhanced.writtenAssets = enhanced.writtenAssets || assetPackSynthesisArtifacts as any;
  }
  enhanced.semanticKind = 'asset-pack-written-asset';
  enhanced.read =
    enhanced.read ||
    (findStoredExecutionValue(execution, 'pipeline', 'expressedRead') as string) ||
    (findStoredExecutionValue(execution, 'read', 'description') as string) ||
    undefined;
  enhanced.writtenAssetType = writtenAssetType;
  enhanced.deliveryMechanismTemplate = deliveryMechanismTemplate;

  // Never keep settle/PR-shaped fields on synthesis normalize.
  delete (enhanced as any).deliveryMechanism;
  delete (enhanced as any).delivery;

  if (fitResult) {
    (enhanced as any).fitResult = fitResult;
    (enhanced as any).fit = fitResult;
    (enhanced as any).resultState = fitResult.resultState;
  }
  if (depositorySearch) {
    (enhanced as any).depositorySearch = depositorySearch;
  }

  // Source-safe option preview / fee quote for selection UI — not settle/delivery.
  const sourceSafePreview = ensureAssetPackSourceSafePreview(execution, enhanced, null);
  if (sourceSafePreview) {
    const assetPackDisclosureReview = ensureAssetPackDisclosureReview(execution, sourceSafePreview);
    const assetPackPreviewBoundary = ensureAssetPackPreviewBoundary(
      execution,
      sourceSafePreview,
      enhanced,
    );
    (enhanced as any).sourceSafePreview = sourceSafePreview;
    (enhanced as any).assetPackDisclosureReview = assetPackDisclosureReview;
    (enhanced as any).assetPackPreviewBoundary = assetPackPreviewBoundary;
    (enhanced as any).assetPackQuoteReceipt = assetPackPreviewBoundary?.quoteReceipt;
    (enhanced as any).feeQuote = sourceSafePreview.feeQuote;
    // Do NOT project settlementInstructions / deliveryPosture / settlement rights
    // unlock — those are settle-pipeline introductions.
  }

  // Deposit/read options for selection surfaces.
  const depositOptions =
    (enhanced as any).options ||
    (enhanced as any).depositOptions ||
    (enhanced as any).selectionEnvelope?.options ||
    findStoredExecutionValue(execution, 'implementation', 'options') ||
    findStoredExecutionValue(execution, 'implementation', 'assetPacks') ||
    findStoredExecutionValue(execution, 'finish', 'selectionEnvelope')?.options ||
    null;
  if (Array.isArray(depositOptions) && depositOptions.length > 0) {
    (enhanced as any).options = depositOptions;
    (enhanced as any).depositOptions = depositOptions;
    if (!(enhanced as any).selectionEnvelope) {
      (enhanced as any).selectionEnvelope =
        findStoredExecutionValue(execution, 'finish', 'selectionEnvelope') || null;
    }
  }

  return enhanced;
}

export function buildAssetPackPostprocessedResult(
  execution: Execution,
  normalized: AssetPackOutput
): AssetPackPostprocessed {
  const executionId = String(execution.get('execution', 'id') || '');
  const repoOwner = execution.get('source', 'owner');
  const repoName = execution.get('source', 'name');
  const repoFull = execution.get('source', 'fullName');
  const repository =
    (repoOwner && repoName
      ? `${String(repoOwner)}/${String(repoName)}`
      : typeof repoFull === 'string'
        ? repoFull
        : undefined) || undefined;

  // Synthesis summary authority: implementation/finish synthesis artifacts only.
  // Never prefer settleDelivery — that surface is settle-pipeline exclusive.
  const finalSummary =
    findStoredExecutionValue(execution, 'implementation', 'assetPackSynthesisArtifacts')?.summary ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'assetPackSynthesisArtifacts')?.summary ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'writtenAssets')?.summary ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'summary') ||
    findStoredExecutionValue(execution, 'finish', 'summary')?.message ||
    (typeof findStoredExecutionValue(execution, 'finish', 'summary') === 'string'
      ? findStoredExecutionValue(execution, 'finish', 'summary')
      : undefined) ||
    normalized.assetPackSynthesisArtifacts?.summary ||
    normalized.summary ||
    undefined;

  const finishArtifacts =
    findStoredExecutionValue(execution, 'implementation', 'assetPackSynthesisArtifacts') ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'assetPackSynthesisArtifacts') ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'writtenAssets') ||
    normalized.assetPackSynthesisArtifacts;
  const filesCreated =
    normalized.artifacts?.filesCreated ??
    finishArtifacts?.fileChanges?.created ??
    [];
  const filesModified =
    normalized.artifacts?.filesModified ??
    finishArtifacts?.fileChanges?.modified ??
    [];

  const artifacts =
    filesCreated.length ||
    filesModified.length ||
    normalized.artifacts?.documentation?.length
      ? {
          filesCreated,
          filesModified,
          testsAdded: normalized.artifacts?.testsAdded ?? 0,
          testsPassing: normalized.artifacts?.testsPassing,
          documentation: normalized.artifacts?.documentation ?? [],
        }
      : null;

  // The ReadyToFinish decision is a cross-phase artifact stored on the SHARED
  // (root) execution (cross-phase store-visibility law) — fall back to it when
  // the local node has no copy.
  const validationReady =
    getValidationReadyToFinish(execution, 'asset-pack') ??
    getValidationReadyToFinish(((execution as any).getRoot?.() ?? execution) as Execution, 'asset-pack');
  const writtenAssetType = resolveWrittenAssetTypeFromExecution(execution);
  const deliveryMechanismTemplate = resolveDeliveryMechanismTemplateFromExecution(execution);
  const fitResult =
    (execution as any).findUp?.('fit', 'result') ||
    (execution as any).get?.('fit', 'result') ||
    (normalized as any).fitResult;
  const depositorySearch =
    (execution as any).findUp?.('depository/search', 'result') ||
    (execution as any).get?.('depository/search', 'result') ||
    (normalized as any).depositorySearch;
  const sourceSafePreview =
    ((normalized as any).sourceSafePreview as AssetPackSourceSafePreview | undefined) ||
    ensureAssetPackSourceSafePreview(execution, normalized, null);
  const assetPackDisclosureReview = sourceSafePreview
    ? ensureAssetPackDisclosureReview(execution, sourceSafePreview)
    : undefined;
  const assetPackPreviewBoundary = sourceSafePreview
    ? ensureAssetPackPreviewBoundary(execution, sourceSafePreview, normalized)
    : undefined;
  // No settlement rights / delivery unlock on synthesis postprocess.
  const readingOperationalTelemetryRepairReadback =
    ensureReadingOperationalTelemetryRepairReadback(execution, normalized);
  const readingInterfaceProductParity = ensureReadingInterfaceProductParity(execution, normalized);
  const readingLocalStagingRehearsal = ensureReadingLocalStagingRehearsal(execution, normalized);

  const productPipeline = resolveSynthesisProductPipeline(execution);
  const selectionEnvelope =
    findStoredExecutionValue(execution, 'finish', 'selectionEnvelope') ||
    (normalized as any).selectionEnvelope ||
    null;
  const kind = resolveSynthesisPostprocessKind(productPipeline);

  const reviewReadiness =
    (normalized as any).reviewReadiness ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'reviewReadiness') ||
    findStoredExecutionValue(execution, 'finish', 'uploadForReview')?.review ||
    undefined;

  return {
    executionId,
    kind,
    semanticKind: 'asset-pack-written-asset',
    title:
      normalized.writtenAsset?.title ||
      finalSummary ||
      normalized.summary ||
      (kind === 'deposit_options' || kind === 'read_options'
        ? 'AssetPack options'
        : 'Written Asset'),
    repository,
    summary: finalSummary,
    // Never deliveryMechanism / settleDelivery — Delivery is settle PR ship only.
    ...(reviewReadiness ? { reviewReadiness } : {}),
    ...(selectionEnvelope ? { selectionEnvelope } : {}),
    ...((normalized as any).options || (normalized as any).depositOptions
      ? {
          options: (normalized as any).options || (normalized as any).depositOptions,
          depositOptions: (normalized as any).depositOptions || (normalized as any).options,
        }
      : {}),
    assetPackSynthesisArtifacts: (finishArtifacts || normalized.assetPackSynthesisArtifacts || null) as any,
    writtenAssets: (finishArtifacts || normalized.assetPackSynthesisArtifacts || null) as any,
    artifacts,
    writtenAssetType,
    deliveryMechanismTemplate,
    ...(fitResult
      ? {
          fitResult,
          fit: fitResult,
          resultState: fitResult.resultState,
        }
      : {}),
    ...(depositorySearch ? { depositorySearch } : {}),
    ...(sourceSafePreview
      ? {
          sourceSafePreview,
          assetPackDisclosureReview,
          assetPackPreviewBoundary,
          assetPackQuoteReceipt: assetPackPreviewBoundary?.quoteReceipt,
          feeQuote: sourceSafePreview.feeQuote,
          // Settlement instructions / delivery posture / rights unlock are
          // settle-pipeline exclusive — not projected from synthesis.
          ...(readingOperationalTelemetryRepairReadback
            ? {
                readingOperationalTelemetryRepairReadback,
                readingOperationalOperatorReadback: readingOperationalTelemetryRepairReadback.operatorReadback,
                readingOperationalStreamEvents: readingOperationalTelemetryRepairReadback.streamEvents,
                readingOperationalRunbookHooks: readingOperationalTelemetryRepairReadback.runbookHooks,
              }
            : {}),
          ...(readingInterfaceProductParity
            ? {
                readingInterfaceProductParity,
                readingInterfaceParityRows: readingInterfaceProductParity.rows,
                readingInterfaceNoBypassReadback: readingInterfaceProductParity.noBypassReadback,
              }
            : {}),
          ...(readingLocalStagingRehearsal
            ? {
                readingLocalStagingRehearsal,
                readingLocalStagingRehearsalRows: readingLocalStagingRehearsal.rows,
                readingLocalStagingRehearsalStageReadback: readingLocalStagingRehearsal.stageReadback,
              }
            : {}),
        }
      : {}),
    ...(!sourceSafePreview && readingOperationalTelemetryRepairReadback
      ? {
          readingOperationalTelemetryRepairReadback,
          readingOperationalOperatorReadback: readingOperationalTelemetryRepairReadback.operatorReadback,
          readingOperationalStreamEvents: readingOperationalTelemetryRepairReadback.streamEvents,
          readingOperationalRunbookHooks: readingOperationalTelemetryRepairReadback.runbookHooks,
        }
      : {}),
    ...(!sourceSafePreview && readingInterfaceProductParity
      ? {
          readingInterfaceProductParity,
          readingInterfaceParityRows: readingInterfaceProductParity.rows,
          readingInterfaceNoBypassReadback: readingInterfaceProductParity.noBypassReadback,
        }
      : {}),
    ...(!sourceSafePreview && readingLocalStagingRehearsal
      ? {
          readingLocalStagingRehearsal,
          readingLocalStagingRehearsalRows: readingLocalStagingRehearsal.rows,
          readingLocalStagingRehearsalStageReadback: readingLocalStagingRehearsal.stageReadback,
        }
      : {}),
    read:
      normalized.read ||
      (findStoredExecutionValue(execution, 'pipeline', 'expressedRead') as string) ||
      (findStoredExecutionValue(execution, 'read', 'description') as string) ||
      undefined,
    assetPack: {
      read:
        normalized.read ||
        (findStoredExecutionValue(execution, 'pipeline', 'expressedRead') as string) ||
        (findStoredExecutionValue(execution, 'read', 'description') as string) ||
        undefined,
      writtenAssetType,
      deliveryMechanismTemplate,
    },
    ...(validationReady
      ? {
          validationReady: {
            approved: !!validationReady.approved,
            assessment: validationReady.assessment ?? null,
            confidence:
              typeof validationReady.confidence === 'number'
                ? validationReady.confidence
                : null,
          },
        }
      : {}),
  };
}

function ensureAssetPackSourceSafePreview(
  execution: Execution,
  output: AssetPackOutput,
  pullRequestTarget?: string | null
): AssetPackSourceSafePreview | null {
  const storedPreview =
    findStoredExecutionValue(execution, 'asset-pack/preview', 'sourceSafe') ||
    findStoredExecutionValue(execution, 'asset-pack', 'sourceSafePreview');
  if (storedPreview?.schema === 'bitcode.asset-pack.source-safe-preview') {
    return storedPreview as AssetPackSourceSafePreview;
  }

  const acceptedNeed =
    findStoredExecutionValue(execution, 'read/need', 'accepted') ||
    findStoredExecutionValue(execution, 'read', 'acceptedNeed');
  if (!isAcceptedReadNeed(acceptedNeed)) {
    return null;
  }

  const fitResult =
    (output as any).fitResult ||
    findStoredExecutionValue(execution, 'fit', 'result');
  if (!fitResult?.schema) {
    return null;
  }

  const assetPackId =
    firstString(
      (output as any).assetPackId,
      output.assetPackSynthesisArtifacts?.assetPackId,
      output.writtenAssets?.assetPackId,
      output.writtenAsset?.payload?.assetPackId,
      // Legacy residual only — Delivery is settle-exclusive; not on AssetPackOutput.
      (output as any).deliveryMechanism?.payload?.assetPackId,
    ) || undefined;
  const preview = buildAssetPackSourceSafePreview({
    need: acceptedNeed,
    fitResult,
    assetPackId,
    // Synthesis never binds a settle/buyer PR target.
    pullRequestTarget: firstString(pullRequestTarget) || null,
  });

  try {
    execution.store('asset-pack/preview', 'sourceSafe', preview as any);
    execution.store('asset-pack/preview', 'feeQuote', preview.feeQuote as any);
    execution.store('asset-pack/preview', 'previewRoot', preview.roots.previewRoot);
  } catch {}

  return preview;
}

function ensureAssetPackDisclosureReview(
  execution: Execution,
  sourceSafePreview: AssetPackSourceSafePreview,
): AssetPackDisclosureReview {
  const storedReview =
    findStoredExecutionValue(execution, 'asset-pack/preview', 'disclosureReview') ||
    findStoredExecutionValue(execution, 'asset-pack', 'disclosureReview');
  if (storedReview?.schema === 'bitcode.asset-pack.disclosure-review') {
    return storedReview as AssetPackDisclosureReview;
  }

  const review = buildAssetPackDisclosureReview({ preview: sourceSafePreview });
  assertAssetPackDisclosureSourceSafe(review);
  try {
    execution.store('asset-pack/preview', 'disclosureReview', review as any);
    execution.store('asset-pack/preview', 'disclosureReviewRoot', review.roots.reviewRoot);
  } catch {}
  return review;
}

function ensureAssetPackPreviewBoundary(
  execution: Execution,
  sourceSafePreview: AssetPackSourceSafePreview,
  output: AssetPackOutput,
): AssetPackPreviewBoundary | null {
  const storedBoundary =
    findStoredExecutionValue(execution, 'asset-pack/preview', 'boundary') ||
    findStoredExecutionValue(execution, 'asset-pack', 'previewBoundary');
  if (storedBoundary?.schema === 'bitcode.asset-pack.preview-boundary') {
    return storedBoundary as AssetPackPreviewBoundary;
  }

  const acceptedNeed =
    findStoredExecutionValue(execution, 'read/need', 'accepted') ||
    findStoredExecutionValue(execution, 'read', 'acceptedNeed');
  const fitResult =
    (output as any).fitResult ||
    findStoredExecutionValue(execution, 'fit', 'result');
  const boundary = buildAssetPackPreviewBoundary({
    need: isAcceptedReadNeed(acceptedNeed) ? acceptedNeed : null,
    fitResult,
    sourceSafePreview,
    // Synthesis: no buyer-repo PR target (settle pipeline only).
    pullRequestTarget: null,
  });
  persistAssetPackPreviewBoundary(execution, boundary);
  return boundary;
}

function ensureReadingOperationalTelemetryRepairReadback(
  execution: Execution,
  output: AssetPackOutput,
): ReadingOperationalTelemetryRepairReadback | null {
  const storedReadback =
    findStoredExecutionValue(execution, 'reading/operational', 'readback') ||
    (output as any).readingOperationalTelemetryRepairReadback;
  if (storedReadback?.schema === 'bitcode.reading.operational-telemetry-repair-readback') {
    return storedReadback as ReadingOperationalTelemetryRepairReadback;
  }

  // Synthesis-only: never load settlement/delivery stores into telemetry.
  const readNeedRuntime =
    (output as any).readNeedReviewRuntime ||
    findStoredExecutionValue(execution, 'read-need-review', 'runtime');
  const readFitsRuntime =
    (output as any).readFitsFindingRuntime ||
    findStoredExecutionValue(execution, 'read/finding-fits', 'runtime');
  const previewBoundary =
    (output as any).assetPackPreviewBoundary ||
    findStoredExecutionValue(execution, 'asset-pack/preview', 'boundary');

  if (!readNeedRuntime && !readFitsRuntime && !previewBoundary) {
    return null;
  }

  const readback = buildReadingOperationalTelemetryRepairReadback({
    runId:
      firstString(
        (output as any).runId,
        findStoredExecutionValue(execution, 'execution', 'id'),
        findStoredExecutionValue(execution, 'run', 'id'),
      ) || undefined,
    readNeedRuntime,
    readFitsRuntime,
    previewBoundary,
    // settlementBoundary omitted — settle-pipeline exclusive
    createdAt:
      firstString(
        (output as any).createdAt,
        findStoredExecutionValue(execution, 'execution', 'createdAt'),
        findStoredExecutionValue(execution, 'run', 'created_at'),
      ) || undefined,
  });
  persistReadingOperationalTelemetryRepairReadback(execution, readback);
  return readback;
}

function ensureReadingInterfaceProductParity(
  execution: Execution,
  output: AssetPackOutput,
): ReadingInterfaceProductParity | null {
  const storedParity =
    findStoredExecutionValue(execution, 'reading/interfaces', 'productParity') ||
    (output as any).readingInterfaceProductParity;
  if (storedParity?.schema === 'bitcode.reading.interface-product-parity') {
    return storedParity as ReadingInterfaceProductParity;
  }

  // Synthesis-only: never load settlement/delivery stores into parity.
  const readNeedRuntime =
    (output as any).readNeedReviewRuntime ||
    findStoredExecutionValue(execution, 'read-need-review', 'runtime');
  const readFitsRuntime =
    (output as any).readFitsFindingRuntime ||
    findStoredExecutionValue(execution, 'read/finding-fits', 'runtime');
  const previewBoundary =
    (output as any).assetPackPreviewBoundary ||
    findStoredExecutionValue(execution, 'asset-pack/preview', 'boundary');
  const operationalReadback =
    (output as any).readingOperationalTelemetryRepairReadback ||
    findStoredExecutionValue(execution, 'reading/operational', 'readback');

  const hasReadingContext =
    readNeedRuntime || readFitsRuntime || previewBoundary || operationalReadback;
  if (!hasReadingContext) {
    return null;
  }

  const parity = buildReadingInterfaceProductParity({
    readNeedRuntime,
    readFitsRuntime,
    previewBoundary,
    operationalReadback,
  });
  persistReadingInterfaceProductParity(execution, parity);
  return parity;
}

function ensureReadingLocalStagingRehearsal(
  execution: Execution,
  output: AssetPackOutput,
): ReadingLocalStagingRehearsal | null {
  const storedRehearsal =
    findStoredExecutionValue(execution, 'reading/rehearsal', 'localStagingRehearsal') ||
    (output as any).readingLocalStagingRehearsal;
  if (storedRehearsal?.schema === 'bitcode.reading.local-staging-rehearsal') {
    return storedRehearsal as ReadingLocalStagingRehearsal;
  }

  // Synthesis-only: never load settlement/delivery stores into rehearsal.
  const readNeedRuntime =
    (output as any).readNeedReviewRuntime ||
    findStoredExecutionValue(execution, 'read-need-review', 'runtime');
  const readFitsRuntime =
    (output as any).readFitsFindingRuntime ||
    findStoredExecutionValue(execution, 'read/finding-fits', 'runtime');
  const previewBoundary =
    (output as any).assetPackPreviewBoundary ||
    findStoredExecutionValue(execution, 'asset-pack/preview', 'boundary');
  const operationalReadback =
    (output as any).readingOperationalTelemetryRepairReadback ||
    findStoredExecutionValue(execution, 'reading/operational', 'readback');
  const interfaceParity =
    (output as any).readingInterfaceProductParity ||
    findStoredExecutionValue(execution, 'reading/interfaces', 'productParity');

  const hasReadingContext =
    readNeedRuntime || readFitsRuntime || previewBoundary || operationalReadback || interfaceParity;
  if (!hasReadingContext) {
    return null;
  }

  const rehearsal = buildReadingLocalStagingRehearsal({
    runId:
      firstString(
        (output as any).runId,
        findStoredExecutionValue(execution, 'execution', 'id'),
        findStoredExecutionValue(execution, 'run', 'id'),
      ) || undefined,
    readNeedRuntime,
    readFitsRuntime,
    previewBoundary,
    operationalReadback,
    interfaceParity,
  });
  persistReadingLocalStagingRehearsal(execution, rehearsal);
  return rehearsal;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

/**
 * Product pipeline identity for postprocess branching.
 * Deposit/read synthesis must not emit settle_delivery kinds.
 */
function resolveSynthesisProductPipeline(execution: Execution): string {
  const raw =
    firstString(
      findStoredExecutionValue(execution, 'pipeline', 'productPipeline'),
      findStoredExecutionValue(execution, 'pipeline', 'synthesizeMode'),
      findStoredExecutionValue(execution, 'pipeline', 'name'),
    ) || '';
  return raw.toLowerCase();
}

/**
 * Postprocess kind for synthesis product runs only.
 * Never settle_delivery — that kind is exclusive to settle-asset-pack-pipeline.
 */
function resolveSynthesisPostprocessKind(
  productPipeline: string,
): AssetPackPostprocessed['kind'] {
  if (
    productPipeline.includes('deposit') ||
    productPipeline === 'deposit'
  ) {
    return 'deposit_options';
  }
  if (
    productPipeline.includes('read') ||
    productPipeline === 'read'
  ) {
    return 'read_options';
  }
  return 'asset_pack_synthesis';
}

function findStoredExecutionValue(execution: Execution, namespace: string, key: string): any {
  const localValue = (execution as any).get?.(namespace, key);
  if (localValue !== undefined) return localValue;

  const upwardValue = (execution as any).findUp?.(namespace, key);
  if (upwardValue !== undefined) return upwardValue;

  const root = (execution as any).getRoot?.() || execution;
  return findStoredExecutionValueDown(root, namespace, key);
}

function findStoredExecutionValueDown(node: any, namespace: string, key: string): any {
  if (!node) return undefined;
  const value = node.get?.(namespace, key);
  if (value !== undefined) return value;
  for (const child of node.children?.values?.() || []) {
    const childValue = findStoredExecutionValueDown(child, namespace, key);
    if (childValue !== undefined) return childValue;
  }
  return undefined;
}
