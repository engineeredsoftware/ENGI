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
} from './read-need';
import {
  assertAssetPackDisclosureSourceSafe,
  buildAssetPackDisclosureReview,
  type AssetPackDisclosureReview,
} from './asset-pack-disclosure';
import {
  buildAssetPackPreviewBoundary,
  persistAssetPackPreviewBoundary,
  type AssetPackPreviewBoundary,
} from './asset-pack-preview-boundary';
import {
  buildAssetPackSettlementRightsDeliveryBoundary,
  persistAssetPackSettlementRightsDeliveryBoundary,
  type AssetPackSettlementRightsDeliveryBoundary,
} from './asset-pack-settlement-rights-delivery';
import {
  buildReadingOperationalTelemetryRepairReadback,
  persistReadingOperationalTelemetryRepairReadback,
  type ReadingOperationalTelemetryRepairReadback,
} from './reading-operational-telemetry-repair-readback';
import {
  buildReadingInterfaceProductParity,
  persistReadingInterfaceProductParity,
  type ReadingInterfaceProductParity,
} from './reading-interface-product-parity';
import {
  buildReadingLocalStagingRehearsal,
  persistReadingLocalStagingRehearsal,
  type ReadingLocalStagingRehearsal,
} from './reading-local-staging-rehearsal';

export function normalizeAssetPackOutput(output: AssetPackOutput, execution: Execution): AssetPackOutput {
  const enhanced = { ...output };
  const deliveryMechanism = enhanced.deliveryMechanism || enhanced.shippable;
  const assetPackSynthesisArtifacts =
    enhanced.assetPackSynthesisArtifacts ||
    findStoredExecutionValue(execution, 'implementation', 'assetPackSynthesisArtifacts') ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'assetPackSynthesisArtifacts') ||
    enhanced.writtenAssets;
  const writtenAssetType = resolveWrittenAssetTypeFromExecution(execution);
  const deliveryMechanismTemplate = resolveDeliveryMechanismTemplateFromExecution(execution);
  const fitResult =
    (execution as any).findUp?.('fit', 'result') ||
    (execution as any).get?.('fit', 'result');
  const depositorySearch =
    (execution as any).findUp?.('depository/search', 'result') ||
    (execution as any).get?.('depository/search', 'result');

  // 1) Ensure connected-interface links are populated if available on execution.
  const prUrl =
    enhanced.writtenAsset?.prUrl ||
    deliveryMechanism?.prUrl ||
    (findStoredExecutionValue(execution, 'finish', 'prUrl') as string) ||
    (findStoredExecutionValue(execution, 'finish', 'pullRequestUrl') as string);
  if (prUrl) {
    enhanced.deliveryMechanism = { ...(deliveryMechanism || {}), prUrl } as any;
    enhanced.shippable = { ...(enhanced.shippable || enhanced.deliveryMechanism || {}), prUrl } as any;
  }

  // 2) Backfill artifacts from execution if missing
  const filesModified = enhanced.artifacts?.filesModified?.length
    ? enhanced.artifacts.filesModified
    : ((findStoredExecutionValue(execution, 'implementation', 'filesChanged') as string[]) || []);
  if (filesModified?.length) {
    enhanced.artifacts = {
      ...(enhanced.artifacts || ({} as any)),
      filesModified,
    } as any;
  }

  // 3) Ensure a human-readable summary exists
  if (!enhanced.summary || !enhanced.summary.trim()) {
    const parts: string[] = [];
    parts.push(enhanced.success ? 'AssetPack synthesis artifacts completed.' : 'AssetPack synthesis artifacts finished with issues.');
    if (prUrl) parts.push(`PR: ${prUrl}`);
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
  if (fitResult) {
    (enhanced as any).fitResult = fitResult;
    (enhanced as any).fit = fitResult;
    (enhanced as any).resultState = fitResult.resultState;
  }
  if (depositorySearch) {
    (enhanced as any).depositorySearch = depositorySearch;
  }
  const sourceSafePreview = ensureAssetPackSourceSafePreview(execution, enhanced, prUrl);
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
    (enhanced as any).assetPackSettlementInstructions = assetPackPreviewBoundary?.settlementInstructions;
    (enhanced as any).assetPackDeliveryPosture = assetPackPreviewBoundary?.deliveryPosture;
    const assetPackSettlementRightsDeliveryBoundary = assetPackPreviewBoundary
      ? ensureAssetPackSettlementRightsDeliveryBoundary(execution, assetPackPreviewBoundary, enhanced)
      : null;
    if (assetPackSettlementRightsDeliveryBoundary) {
      (enhanced as any).assetPackSettlementRightsDeliveryBoundary = assetPackSettlementRightsDeliveryBoundary;
      (enhanced as any).assetPackSettlementReplayReceipt = assetPackSettlementRightsDeliveryBoundary.replayReceipt;
      (enhanced as any).assetPackDeliveryUnlock = assetPackSettlementRightsDeliveryBoundary.deliveryUnlock;
      (enhanced as any).assetPackLedgerDatabaseStorageReconciliation =
        assetPackSettlementRightsDeliveryBoundary.reconciliationReport;
    }
    const operationalReadback = ensureReadingOperationalTelemetryRepairReadback(execution, enhanced);
    if (operationalReadback) {
      (enhanced as any).readingOperationalTelemetryRepairReadback = operationalReadback;
      (enhanced as any).readingOperationalOperatorReadback = operationalReadback.operatorReadback;
      (enhanced as any).readingOperationalStreamEvents = operationalReadback.streamEvents;
      (enhanced as any).readingOperationalRunbookHooks = operationalReadback.runbookHooks;
    }
    const interfaceParity = ensureReadingInterfaceProductParity(execution, enhanced);
    if (interfaceParity) {
      (enhanced as any).readingInterfaceProductParity = interfaceParity;
      (enhanced as any).readingInterfaceParityRows = interfaceParity.rows;
      (enhanced as any).readingInterfaceNoBypassReadback = interfaceParity.noBypassReadback;
    }
    const localStagingRehearsal = ensureReadingLocalStagingRehearsal(execution, enhanced);
    if (localStagingRehearsal) {
      (enhanced as any).readingLocalStagingRehearsal = localStagingRehearsal;
      (enhanced as any).readingLocalStagingRehearsalRows = localStagingRehearsal.rows;
      (enhanced as any).readingLocalStagingRehearsalStageReadback = localStagingRehearsal.stageReadback;
    }
    (enhanced as any).feeQuote = sourceSafePreview.feeQuote;
  }
  if (!(enhanced as any).readingOperationalTelemetryRepairReadback) {
    const operationalReadback = ensureReadingOperationalTelemetryRepairReadback(execution, enhanced);
    if (operationalReadback) {
      (enhanced as any).readingOperationalTelemetryRepairReadback = operationalReadback;
      (enhanced as any).readingOperationalOperatorReadback = operationalReadback.operatorReadback;
      (enhanced as any).readingOperationalStreamEvents = operationalReadback.streamEvents;
      (enhanced as any).readingOperationalRunbookHooks = operationalReadback.runbookHooks;
    }
  }
  if (!(enhanced as any).readingInterfaceProductParity) {
    const interfaceParity = ensureReadingInterfaceProductParity(execution, enhanced);
    if (interfaceParity) {
      (enhanced as any).readingInterfaceProductParity = interfaceParity;
      (enhanced as any).readingInterfaceParityRows = interfaceParity.rows;
      (enhanced as any).readingInterfaceNoBypassReadback = interfaceParity.noBypassReadback;
    }
  }
  if (!(enhanced as any).readingLocalStagingRehearsal) {
    const localStagingRehearsal = ensureReadingLocalStagingRehearsal(execution, enhanced);
    if (localStagingRehearsal) {
      (enhanced as any).readingLocalStagingRehearsal = localStagingRehearsal;
      (enhanced as any).readingLocalStagingRehearsalRows = localStagingRehearsal.rows;
      (enhanced as any).readingLocalStagingRehearsalStageReadback = localStagingRehearsal.stageReadback;
    }
  }
  if (!enhanced.deliveryMechanism && enhanced.shippable) {
    enhanced.deliveryMechanism = { ...enhanced.shippable };
  }
  if (!enhanced.shippable && enhanced.deliveryMechanism) {
    enhanced.shippable = { ...enhanced.deliveryMechanism };
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

  const finalSummary =
    findStoredExecutionValue(execution, 'implementation', 'assetPackSynthesisArtifacts')?.summary ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'assetPackSynthesisArtifacts')?.summary ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'writtenAssets')?.summary ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'shippables')?.summary ||
    findStoredExecutionValue(execution, 'finish/asset_pack_completion', 'summary') ||
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
    ensureAssetPackSourceSafePreview(
      execution,
      normalized,
      normalized.deliveryMechanism?.prUrl || normalized.shippable?.prUrl
    );
  const assetPackDisclosureReview = sourceSafePreview
    ? ensureAssetPackDisclosureReview(execution, sourceSafePreview)
    : undefined;
  const assetPackPreviewBoundary = sourceSafePreview
    ? ensureAssetPackPreviewBoundary(execution, sourceSafePreview, normalized)
    : undefined;
  const assetPackSettlementRightsDeliveryBoundary = assetPackPreviewBoundary
    ? ensureAssetPackSettlementRightsDeliveryBoundary(execution, assetPackPreviewBoundary, normalized)
    : null;
  const readingOperationalTelemetryRepairReadback =
    ensureReadingOperationalTelemetryRepairReadback(execution, normalized);
  const readingInterfaceProductParity = ensureReadingInterfaceProductParity(execution, normalized);
  const readingLocalStagingRehearsal = ensureReadingLocalStagingRehearsal(execution, normalized);
  const shippable = normalized.shippable || normalized.deliveryMechanism;
  const shippables =
    normalized.shippables ||
    (shippable
      ? {
          ...(shippable.prUrl ? { pullRequest: { url: shippable.prUrl, title: shippable.title } } : {}),
          summary: finalSummary || normalized.summary || null,
        }
      : null);

  return {
    executionId,
    kind: 'shippable',
    semanticKind: 'asset-pack-written-asset',
    title:
      normalized.writtenAsset?.title ||
      normalized.shippable?.title ||
      normalized.deliveryMechanism?.title ||
      finalSummary ||
      normalized.summary ||
      'Written Asset',
    repository,
    summary: finalSummary,
    shippable,
    shippables: shippables as any,
    deliveryMechanism: normalized.deliveryMechanism || shippable,
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
          assetPackSettlementInstructions: assetPackPreviewBoundary?.settlementInstructions,
          assetPackDeliveryPosture: assetPackPreviewBoundary?.deliveryPosture,
          ...(assetPackSettlementRightsDeliveryBoundary
            ? {
                assetPackSettlementRightsDeliveryBoundary,
                assetPackSettlementReplayReceipt: assetPackSettlementRightsDeliveryBoundary.replayReceipt,
                assetPackDeliveryUnlock: assetPackSettlementRightsDeliveryBoundary.deliveryUnlock,
                assetPackLedgerDatabaseStorageReconciliation:
                  assetPackSettlementRightsDeliveryBoundary.reconciliationReport,
              }
            : {}),
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
          feeQuote: sourceSafePreview.feeQuote,
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
      output.deliveryMechanism?.payload?.assetPackId
    ) || undefined;
  const preview = buildAssetPackSourceSafePreview({
    need: acceptedNeed,
    fitResult,
    assetPackId,
    pullRequestTarget: firstString(pullRequestTarget, output.deliveryMechanism?.prUrl, output.shippable?.prUrl),
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
    pullRequestTarget: firstString(
      sourceSafePreview.delivery.pullRequestTarget,
      output.deliveryMechanism?.prUrl,
      output.shippable?.prUrl,
    ),
  });
  persistAssetPackPreviewBoundary(execution, boundary);
  return boundary;
}

function ensureAssetPackSettlementRightsDeliveryBoundary(
  execution: Execution,
  previewBoundary: AssetPackPreviewBoundary,
  output: AssetPackOutput,
): AssetPackSettlementRightsDeliveryBoundary | null {
  const storedBoundary =
    findStoredExecutionValue(execution, 'asset-pack/settlement', 'boundary') ||
    findStoredExecutionValue(execution, 'asset-pack', 'settlementRightsDeliveryBoundary');
  if (storedBoundary?.schema === 'bitcode.asset-pack.settlement-rights-delivery-boundary') {
    return storedBoundary as AssetPackSettlementRightsDeliveryBoundary;
  }

  const paymentObservation =
    (output as any).settlementObservation ||
    (output as any).paymentObservation ||
    (output as any).btcPaymentObservation ||
    findStoredExecutionValue(execution, 'asset-pack/settlement', 'paymentObservation') ||
    findStoredExecutionValue(execution, 'btc/fee', 'paymentObservation');
  if (!paymentObservation) {
    return null;
  }

  const boundary = buildAssetPackSettlementRightsDeliveryBoundary({
    previewBoundary,
    paymentObservation,
    finality:
      (output as any).settlementFinality ||
      (output as any).btcFinality ||
      findStoredExecutionValue(execution, 'asset-pack/settlement', 'finalityReceipt') ||
      undefined,
    readerWalletId:
      firstString((output as any).readerWalletId, findStoredExecutionValue(execution, 'reader', 'walletId')),
    depositorWalletId:
      firstString((output as any).depositorWalletId, findStoredExecutionValue(execution, 'depositor', 'walletId')),
    pullRequestTarget: firstString(
      previewBoundary.sourceSafePreview.delivery.pullRequestTarget,
      output.deliveryMechanism?.prUrl,
      output.shippable?.prUrl,
    ),
  });
  persistAssetPackSettlementRightsDeliveryBoundary(execution, boundary);
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

  const readNeedRuntime =
    (output as any).readNeedReviewRuntime ||
    findStoredExecutionValue(execution, 'read-need-review', 'runtime');
  const readFitsRuntime =
    (output as any).readFitsFindingRuntime ||
    findStoredExecutionValue(execution, 'read/finding-fits', 'runtime');
  const previewBoundary =
    (output as any).assetPackPreviewBoundary ||
    findStoredExecutionValue(execution, 'asset-pack/preview', 'boundary');
  const settlementBoundary =
    (output as any).assetPackSettlementRightsDeliveryBoundary ||
    findStoredExecutionValue(execution, 'asset-pack/settlement', 'boundary');

  if (!readNeedRuntime && !readFitsRuntime && !previewBoundary && !settlementBoundary) {
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
    settlementBoundary,
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

  const readNeedRuntime =
    (output as any).readNeedReviewRuntime ||
    findStoredExecutionValue(execution, 'read-need-review', 'runtime');
  const readFitsRuntime =
    (output as any).readFitsFindingRuntime ||
    findStoredExecutionValue(execution, 'read/finding-fits', 'runtime');
  const previewBoundary =
    (output as any).assetPackPreviewBoundary ||
    findStoredExecutionValue(execution, 'asset-pack/preview', 'boundary');
  const settlementBoundary =
    (output as any).assetPackSettlementRightsDeliveryBoundary ||
    findStoredExecutionValue(execution, 'asset-pack/settlement', 'boundary');
  const operationalReadback =
    (output as any).readingOperationalTelemetryRepairReadback ||
    findStoredExecutionValue(execution, 'reading/operational', 'readback');

  const hasReadingContext =
    readNeedRuntime || readFitsRuntime || previewBoundary || settlementBoundary || operationalReadback;
  if (!hasReadingContext) {
    return null;
  }

  const parity = buildReadingInterfaceProductParity({
    readNeedRuntime,
    readFitsRuntime,
    previewBoundary,
    settlementBoundary,
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

  const readNeedRuntime =
    (output as any).readNeedReviewRuntime ||
    findStoredExecutionValue(execution, 'read-need-review', 'runtime');
  const readFitsRuntime =
    (output as any).readFitsFindingRuntime ||
    findStoredExecutionValue(execution, 'read/finding-fits', 'runtime');
  const previewBoundary =
    (output as any).assetPackPreviewBoundary ||
    findStoredExecutionValue(execution, 'asset-pack/preview', 'boundary');
  const settlementBoundary =
    (output as any).assetPackSettlementRightsDeliveryBoundary ||
    findStoredExecutionValue(execution, 'asset-pack/settlement', 'boundary');
  const operationalReadback =
    (output as any).readingOperationalTelemetryRepairReadback ||
    findStoredExecutionValue(execution, 'reading/operational', 'readback');
  const interfaceParity =
    (output as any).readingInterfaceProductParity ||
    findStoredExecutionValue(execution, 'reading/interfaces', 'productParity');

  const hasReadingContext =
    readNeedRuntime || readFitsRuntime || previewBoundary || settlementBoundary || operationalReadback || interfaceParity;
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
    settlementBoundary,
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
