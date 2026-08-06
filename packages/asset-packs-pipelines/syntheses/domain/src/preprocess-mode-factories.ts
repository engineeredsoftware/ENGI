/**
 * Deposit/read mode preprocess factories (shared by both synthesis product packages).
 *
 * Product packages call factoryPreprocessDepositOnly / factoryPreprocessReadOnly.
 * Dual-mode factoryPreprocess keeps the full read-lens path for legacy dual-entry.
 * Read-only modules are imported from the co-located read package (relative paths
 * avoid a package cycle: read → syntheses-domain → read).
 */
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics';
import { initializeAssetPackPipeline } from './preprocess';
import {
  resolveSynthesizeAssetPacksMode,
  storeSynthesizeAssetPacksMode,
  storeCrossPhaseArtifact,
} from './synthesize-asset-packs';
import { normalizeAssetPackOutput, buildAssetPackPostprocessedResult } from './postprocess';
import { AssetPackWrittenAssetType } from './types/AssetPackWrittenAssetType';
import {
  normalizeWrittenAssetRequest,
  resolveDeliveryMechanismTemplate,
  resolveExpressedRead,
  resolveWrittenAssetType,
} from './semantic-resolution';
import {
  buildDepositoryFitResultEvidence,
  runDepositorySearchForPipelineInput,
} from './depository-search';
import {
  buildReadFitsFindingRuntime,
  persistReadFitsFindingRuntime,
} from '../../read/src/read-fits-finding-runtime';
import {
  buildAssetPackPreviewBoundary,
  persistAssetPackPreviewBoundary,
} from './asset-pack-preview-boundary';
import {
  buildReadingOperationalTelemetryRepairReadback,
  persistReadingOperationalTelemetryRepairReadback,
} from '../../read/src/reading-operational-telemetry-repair-readback';
import {
  buildReadingInterfaceProductParity,
  persistReadingInterfaceProductParity,
} from '../../read/src/reading-interface-product-parity';
import {
  buildInterfaceDisclosureBoundary,
  persistInterfaceDisclosureBoundary,
} from '../../read/src/interface-disclosure-boundary';
import {
  buildReadingLocalStagingRehearsal,
  persistReadingLocalStagingRehearsal,
} from '../../read/src/reading-local-staging-rehearsal';
import {
  admitReadFitsFinding,
  isAcceptedReadNeed,
  resolveReadNeedFromPipelineInput,
  synthesizeReadNeedForPipelineInput,
} from '../../read/src/read-need';

function storePreprocessedSnapshot(
  execution: Execution,
  processedInput: any,
  writtenAssetType: AssetPackWrittenAssetType
) {
  const read = resolveExpressedRead(processedInput);
  const repo = processedInput?.repository || {};
  const snapshot = {
    definitionOfRead: read,
    read,
    repository: {
      url: repo.url || null,
      owner: repo.owner || null,
      name: repo.name || repo.repo || null,
      branch: repo.branch || null,
    },
    writtenAssetType,
    semanticKind: 'asset-pack-written-asset' as const,
    assetPack: {
      read,
      writtenAssetType,
      writtenAssetRequest: normalizeWrittenAssetRequest(processedInput?.writtenAssetType),
      deliveryMechanismTemplate: resolveDeliveryMechanismTemplate(processedInput),
      deliveryTarget: processedInput?.deliveryTarget || null,
    },
    requirements: processedInput?.requirements || null,
    config: {
      computerUseReadMeasurementEnabled: !!execution.get('config', 'computerUseReadMeasurementEnabled'),
    },
  };

  // Cross-phase artifact: the serving surface + downstream phases read this
  // snapshot from outside the preprocess sibling — store it on the SHARED
  // execution (cross-phase store-visibility law).
  storeCrossPhaseArtifact(execution, 'route/preprocessed', 'assetPackWrittenAsset', snapshot);
}

/**
 * Deposit-mode preprocess. The depositor supplies a repository to synthesize
 * into reviewable AssetPack patches — there is no read Need / fits-finding, so
 * the read-lensed preprocess is skipped entirely. We store the repository
 * coordinates and depositor steering for the SDIVF phases: Setup clones +
 * danger-walls, Discovery explores, Implementation writes the AP patches,
 * Validation gates quality, Finish uploads the artifacts to Bitcode for review.
 */
export async function preprocessDepositMode(processedInput: any, execution: Execution): Promise<any> {
  const repo = processedInput?.repository || {};
  const repository = {
    url: repo.url || processedInput?.repositoryUrl || null,
    owner: repo.owner || null,
    name: repo.name || repo.repo || null,
    branch: repo.branch || processedInput?.sourceBranch || null,
    commit: processedInput?.sourceCommit || null,
    fullName:
      processedInput?.repositoryFullName ||
      (repo.owner && (repo.name || repo.repo) ? `${repo.owner}/${repo.name || repo.repo}` : null),
  };
  try { processedInput.repository = { ...repo, ...repository }; } catch {}
  // Cross-phase artifacts: preprocess runs on its own isolated seq-0 sibling,
  // so everything it produces FOR the SDIVF phases (the deposit data plane the
  // Setup/Discovery/Implementation/Validation agents ground in) must land on
  // the SHARED execution (cross-phase store-visibility law).
  // pipeline:input is telemetried — never attach inventory.sources here (64MB+
  // monorepo sources). Full file bodies live only on deposit:sourceCheckoutCatalog for measurement.
  const catalog =
    processedInput?.sourceCheckoutCatalog;
  const pipelineInputForStore =
    catalog && typeof catalog === 'object'
      ? {
          ...processedInput,
          sourceCheckoutCatalog: {
            paths: catalog.paths,
            samples: catalog.samples,
            totalPathCount: catalog.totalPathCount,
            excludedPathCount: catalog.excludedPathCount,
            sourceFileCount: Array.isArray(catalog.sources) ? catalog.sources.length : 0,
          },
        }
      : processedInput;
  storeCrossPhaseArtifact(execution, 'pipeline', 'input', pipelineInputForStore);
  storeCrossPhaseArtifact(execution, 'pipeline', 'synthesizeMode', 'deposit');
  storeCrossPhaseArtifact(execution, 'deposit', 'repository', repository);
  storeCrossPhaseArtifact(execution, 'deposit', 'obfuscations', processedInput?.obfuscations || null);
  const permissibleSources = processedInput?.permissibleSources || [];
  const impermissibleSources = processedInput?.impermissibleSources || [];
  storeCrossPhaseArtifact(execution, 'deposit', 'permissibleSources', permissibleSources);
  storeCrossPhaseArtifact(execution, 'deposit', 'impermissibleSources', impermissibleSources);
  storeCrossPhaseArtifact(execution, 'deposit', 'demandContext', processedInput?.demandContext || []);
  if (catalog) {
    storeCrossPhaseArtifact(execution, 'deposit', 'sourceCheckoutCatalog', catalog);
  }
  return processedInput;
}

/**
 * Dual-mode preprocess (deposit | read from input). Product packages force one path.
 */
function factoryPreprocess(): Executor<any, any> {
  return async (input, execution) => {
    await initializeAssetPackPipeline(execution as any);

    // Resolve mode for dual-entry callers; product packages force one path.
    const mode = resolveSynthesizeAssetPacksMode(input, execution);
    storeSynthesizeAssetPacksMode(execution, mode);
    try { (input as any).synthesizeMode = mode; } catch {}

    const processedInput = input;
    try { (processedInput as any).synthesizeMode = mode; } catch {}

    // Deposit skips the read Need / fits-finding preprocess entirely.
    if (mode === 'deposit') {
      const depositInput = await preprocessDepositMode(processedInput, execution);
      storePreprocessedSnapshot(execution, depositInput, resolveWrittenAssetType(depositInput));
      return depositInput;
    }

    const expressedRead = resolveExpressedRead(processedInput);

    const writtenAssetType = resolveWrittenAssetType(processedInput);
    const writtenAssetRequest = normalizeWrittenAssetRequest(processedInput?.writtenAssetType);
    const deliveryMechanismTemplate = resolveDeliveryMechanismTemplate(processedInput);
    const suppliedReadNeed = resolveReadNeedFromPipelineInput(processedInput);
    const synthesizedReadNeed = synthesizeReadNeedForPipelineInput(processedInput);
    const readNeed = suppliedReadNeed || synthesizedReadNeed;
    try { processedInput.read = expressedRead; } catch {}
    try { processedInput.definitionOfRead = expressedRead; } catch {}
    try { processedInput.writtenAssetType = writtenAssetType; } catch {}
    try { processedInput.writtenAssetRequest = writtenAssetRequest; } catch {}
    try { processedInput.deliveryMechanismTemplate = deliveryMechanismTemplate; } catch {}
    try { processedInput.readNeed = readNeed; } catch {}
    if (isAcceptedReadNeed(readNeed)) {
      try { processedInput.acceptedReadNeed = readNeed; } catch {}
    }
    // Cross-phase artifacts: the read-lens pipeline snapshot the phases +
    // postprocess resolve from their own sibling subtrees (cross-phase
    // store-visibility law — same as the deposit data plane above).
    storeCrossPhaseArtifact(execution, 'pipeline', 'input', processedInput);
    storeCrossPhaseArtifact(execution, 'pipeline', 'writtenAssetType', writtenAssetType);
    storeCrossPhaseArtifact(execution, 'pipeline', 'writtenAssetRequest', writtenAssetRequest);
    storeCrossPhaseArtifact(execution, 'pipeline', 'deliveryMechanismTemplate', deliveryMechanismTemplate);
    storeCrossPhaseArtifact(execution, 'pipeline', 'expressedRead', expressedRead);
    storeCrossPhaseArtifact(execution, 'read', 'description', expressedRead);
    storeCrossPhaseArtifact(execution, 'read/need', 'current', readNeed as any);
    storeCrossPhaseArtifact(execution, 'read/need', 'needId', readNeed.needId);
    storeCrossPhaseArtifact(execution, 'read/need', 'measurementRoot', readNeed.measurementRoot);
    storeCrossPhaseArtifact(execution, 'read/need', 'reviewState', readNeed.reviewState);
    if (isAcceptedReadNeed(readNeed)) {
      storeCrossPhaseArtifact(execution, 'read/need', 'accepted', readNeed as any);
    }

    const depositorySearch = await runDepositorySearchForPipelineInput(processedInput, execution);
    try { processedInput.depositorySearchResult = depositorySearch; } catch {}
    try { processedInput.depositCandidates = depositorySearch.selectedCandidates; } catch {}
    try { processedInput.fitDeposits = depositorySearch.fitDeposits; } catch {}
    try { processedInput.fitDepositAssetIds = depositorySearch.fitDepositAssetIds; } catch {}
    let fitResult: ReturnType<typeof buildDepositoryFitResultEvidence> | undefined;
    try {
      fitResult = buildDepositoryFitResultEvidence(depositorySearch);
      processedInput.fitResult = fitResult;
    } catch {}
    try { processedInput.fit = processedInput.fitResult; } catch {}
    try {
      const readFitsFindingRuntime = buildReadFitsFindingRuntime({
        admission: (execution.get('read/finding-fits', 'admission') as any) || admitReadFitsFinding(processedInput),
        result: depositorySearch,
        fitResult,
      });
      persistReadFitsFindingRuntime(execution, readFitsFindingRuntime);
      persistReadFitsFindingRuntime(execution.parent as any, readFitsFindingRuntime);
      processedInput.readFitsFindingRuntime = readFitsFindingRuntime;
      processedInput.readFitsFindingReplayReceipt = readFitsFindingRuntime.replayReceipt;
    } catch {}
    try {
      if (isAcceptedReadNeed(readNeed)) {
        const assetPackPreviewBoundary = buildAssetPackPreviewBoundary({
          need: readNeed,
          fitResult,
          pullRequestTarget: processedInput?.deliveryTarget || null,
        });
        persistAssetPackPreviewBoundary(execution, assetPackPreviewBoundary);
        persistAssetPackPreviewBoundary(execution.parent as any, assetPackPreviewBoundary);
        processedInput.sourceSafePreview = assetPackPreviewBoundary.sourceSafePreview;
        processedInput.assetPackPreviewBoundary = assetPackPreviewBoundary;
        processedInput.assetPackQuoteReceipt = assetPackPreviewBoundary.quoteReceipt;
        // Never build settlement rights / delivery unlock during synthesis preprocess.
        // Payment observation + PR unlock belong exclusively to settle-asset-pack-pipeline.
        delete processedInput.assetPackSettlementRightsDeliveryBoundary;
        delete processedInput.assetPackSettlementReplayReceipt;
        delete processedInput.assetPackDeliveryUnlock;
      }
    } catch {}
    try {
      // settlementBoundary always null on synthesis preprocess path.
      const operationalReadback = buildReadingOperationalTelemetryRepairReadback({
        runId: String(execution.id || processedInput?.transactionId || processedInput?.id || ''),
        readNeedRuntime:
          processedInput?.readNeedReviewRuntime ||
          (execution.get('read-need-review', 'runtime') as any) ||
          ((execution.parent as any)?.get?.('read-need-review', 'runtime') as any) ||
          null,
        readFitsRuntime:
          processedInput?.readFitsFindingRuntime ||
          (execution.get('read/finding-fits', 'runtime') as any) ||
          ((execution.parent as any)?.get?.('read/finding-fits', 'runtime') as any) ||
          null,
        previewBoundary:
          processedInput?.assetPackPreviewBoundary ||
          (execution.get('asset-pack/preview', 'boundary') as any) ||
          ((execution.parent as any)?.get?.('asset-pack/preview', 'boundary') as any) ||
          null,
        // No settlement/delivery args on synthesis path (omit key entirely).
        createdAt: new Date().toISOString(),
      });
      persistReadingOperationalTelemetryRepairReadback(execution, operationalReadback);
      persistReadingOperationalTelemetryRepairReadback(execution.parent as any, operationalReadback);
      processedInput.readingOperationalTelemetryRepairReadback = operationalReadback;
      processedInput.readingOperationalOperatorReadback = operationalReadback.operatorReadback;
      processedInput.readingOperationalStreamEvents = operationalReadback.streamEvents;
      processedInput.readingOperationalRunbookHooks = operationalReadback.runbookHooks;
      const interfaceParity = buildReadingInterfaceProductParity({
        readNeedRuntime:
          processedInput?.readNeedReviewRuntime ||
          (execution.get('read-need-review', 'runtime') as any) ||
          ((execution.parent as any)?.get?.('read-need-review', 'runtime') as any) ||
          null,
        readFitsRuntime:
          processedInput?.readFitsFindingRuntime ||
          (execution.get('read/finding-fits', 'runtime') as any) ||
          ((execution.parent as any)?.get?.('read/finding-fits', 'runtime') as any) ||
          null,
        previewBoundary:
          processedInput?.assetPackPreviewBoundary ||
          (execution.get('asset-pack/preview', 'boundary') as any) ||
          ((execution.parent as any)?.get?.('asset-pack/preview', 'boundary') as any) ||
          null,
        operationalReadback,
      });
      persistReadingInterfaceProductParity(execution, interfaceParity);
      persistReadingInterfaceProductParity(execution.parent as any, interfaceParity);
      processedInput.readingInterfaceProductParity = interfaceParity;
      processedInput.readingInterfaceParityRows = interfaceParity.rows;
      processedInput.readingInterfaceNoBypassReadback = interfaceParity.noBypassReadback;
      const interfaceDisclosureBoundary = buildInterfaceDisclosureBoundary();
      persistInterfaceDisclosureBoundary(execution, interfaceDisclosureBoundary);
      persistInterfaceDisclosureBoundary(execution.parent as any, interfaceDisclosureBoundary);
      processedInput.interfaceDisclosureBoundary = interfaceDisclosureBoundary;
      processedInput.interfaceDisclosureBoundaryRows = interfaceDisclosureBoundary.rows;
      const localStagingRehearsal = buildReadingLocalStagingRehearsal({
        runId: String(execution.id || processedInput?.transactionId || processedInput?.id || ''),
        readNeedRuntime:
          processedInput?.readNeedReviewRuntime ||
          (execution.get('read-need-review', 'runtime') as any) ||
          ((execution.parent as any)?.get?.('read-need-review', 'runtime') as any) ||
          null,
        readFitsRuntime:
          processedInput?.readFitsFindingRuntime ||
          (execution.get('read/finding-fits', 'runtime') as any) ||
          ((execution.parent as any)?.get?.('read/finding-fits', 'runtime') as any) ||
          null,
        previewBoundary:
          processedInput?.assetPackPreviewBoundary ||
          (execution.get('asset-pack/preview', 'boundary') as any) ||
          ((execution.parent as any)?.get?.('asset-pack/preview', 'boundary') as any) ||
          null,
        operationalReadback,
        interfaceParity,
      });
      persistReadingLocalStagingRehearsal(execution, localStagingRehearsal);
      persistReadingLocalStagingRehearsal(execution.parent as any, localStagingRehearsal);
      processedInput.readingLocalStagingRehearsal = localStagingRehearsal;
      processedInput.readingLocalStagingRehearsalRows = localStagingRehearsal.rows;
      processedInput.readingLocalStagingRehearsalStageReadback = localStagingRehearsal.stageReadback;
    } catch {}

    storePreprocessedSnapshot(execution, processedInput, writtenAssetType);
    return processedInput;
  };
}

function factoryIterationPreprocess(): Executor<any, any> {
  return async (input, execution) => {
    // Apply gate preprocessing for each iteration

    // Process attachments
    const attachments = execution.get('attachments', 'list') || [];
    if (Array.isArray(attachments) && attachments.length > 0) {
      const enhancements = attachments.map((a: any) => ({
        title: a?.title || a?.name || 'Context',
        content: String(a?.content || a?.output || '')
      })).filter(e => e.content);

      execution.store('context', 'enhancements', enhancements);
    }

    const iter = Number(execution.get('pipeline', 'currentIteration') || 0);
    execution.store('pipeline', `iteration:${iter}`, {
      preprocessedAt: new Date().toISOString(),
      attachmentCount: Array.isArray(attachments) ? attachments.length : 0,
    });

    return input;
  };
}

function factoryPostprocess(): Executor<any, any> {
  return async (output, execution) => {
    const norm = normalizeAssetPackOutput(output, execution);
    const snapshot = buildAssetPackPostprocessedResult(execution, norm);
    execution.store('postprocessed', 'result', snapshot as any);
    return norm;
  };
}

/** Deposit-only preprocess for ExecutionPipelineSDIVFSynthesizeDepositAssetPacks. */
export function factoryPreprocessDepositOnly(): Executor<any, any> {
  return async (input, execution) => {
    await initializeAssetPackPipeline(execution as any);
    storeSynthesizeAssetPacksMode(execution, 'deposit');
    const processedInput = input;
    const depositInput = await preprocessDepositMode(
      { ...processedInput, synthesizeMode: 'deposit', mode: 'deposit' },
      execution,
    );
    storePreprocessedSnapshot(execution, depositInput, resolveWrittenAssetType(depositInput));
    return depositInput;
  };
}

/**
 * Read preprocess — deposit twin: store Need + repository + catalog on shared root.
 */
export async function preprocessReadMode(processedInput: any, execution: Execution): Promise<any> {
  const repo = processedInput?.repository || {};
  const repository = {
    url: repo.url || processedInput?.repositoryUrl || null,
    owner: repo.owner || null,
    name: repo.name || repo.repo || null,
    branch: repo.branch || processedInput?.sourceBranch || null,
    commit: processedInput?.sourceCommit || null,
    fullName:
      processedInput?.repositoryFullName ||
      (repo.owner && (repo.name || repo.repo) ? `${repo.owner}/${repo.name || repo.repo}` : null),
  };
  try {
    processedInput.repository = { ...repo, ...repository };
  } catch {}

  const need =
    processedInput?.need ??
    processedInput?.needs ??
    processedInput?.instructions ??
    processedInput?.readNeed?.text ??
    '';

  const catalog = processedInput?.sourceCheckoutCatalog;
  const pipelineInputForStore =
    catalog && typeof catalog === 'object'
      ? {
          ...processedInput,
          need,
          sourceCheckoutCatalog: {
            paths: catalog.paths,
            samples: catalog.samples,
            totalPathCount: catalog.totalPathCount,
            sourceFileCount: Array.isArray(catalog.sources) ? catalog.sources.length : 0,
          },
        }
      : { ...processedInput, need };

  storeCrossPhaseArtifact(execution, 'pipeline', 'input', pipelineInputForStore);
  storeCrossPhaseArtifact(execution, 'pipeline', 'synthesizeMode', 'read');
  storeCrossPhaseArtifact(execution, 'read', 'repository', repository);
  storeCrossPhaseArtifact(execution, 'read', 'need', typeof need === 'string' ? need : '');
  storeCrossPhaseArtifact(execution, 'deposit', 'repository', repository);
  if (catalog) {
    storeCrossPhaseArtifact(execution, 'read', 'sourceCheckoutCatalog', catalog);
    storeCrossPhaseArtifact(execution, 'deposit', 'sourceCheckoutCatalog', catalog);
  }
  return processedInput;
}

/**
 * Read-only preprocess for ExecutionPipelineSDIVFSynthesizeReadAssetPacks.
 * Need + Host catalog; deposit obfuscation path never required.
 */
export function factoryPreprocessReadOnly(): Executor<any, any> {
  return async (input, execution) => {
    await initializeAssetPackPipeline(execution as any);
    storeSynthesizeAssetPacksMode(execution, 'read');
    const processedInput = input;
    const readInput = await preprocessReadMode(
      { ...processedInput, synthesizeMode: 'read', mode: 'read' },
      execution,
    );
    storePreprocessedSnapshot(execution, readInput, resolveWrittenAssetType(readInput));
    return readInput;
  };
}

export { factoryPreprocess };
