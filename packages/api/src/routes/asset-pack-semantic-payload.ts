type FileChanges = {
  edited?: number;
  created?: number;
  deleted?: number;
  paths?: string[];
  fileDiffs?: Array<{ path: string; added?: number; removed?: number }>;
} | null;

type SurfaceRecord = {
  pullRequest?: unknown;
  fileChanges?: FileChanges;
  proofEvidence?: string[] | null;
  reviewNotes?: string[] | null;
  summary?: string | null;
} | null;

type AssetPackCompletionRecord = {
  summary?: string | null;
  processingStats?: unknown;
  repoSnapshot?: unknown;
  shippables?: SurfaceRecord;
  assetPackSynthesisArtifacts?: SurfaceRecord;
  writtenAssets?: SurfaceRecord;
  deliveryMechanism?: SurfaceRecord;
  read?: string | null;
  writtenAssetType?: string | null;
  assetPack?: Record<string, unknown> | null;
} | null;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asSurfaceRecord(value: unknown): SurfaceRecord {
  const record = asRecord(value);
  if (!record) return null;
  return {
    pullRequest: record.pullRequest ?? null,
    fileChanges: asRecord(record.fileChanges) ? (record.fileChanges as FileChanges) : null,
    proofEvidence: Array.isArray(record.proofEvidence)
      ? record.proofEvidence.filter((item): item is string => typeof item === 'string')
      : null,
    reviewNotes: Array.isArray(record.reviewNotes)
      ? record.reviewNotes.filter((item): item is string => typeof item === 'string')
      : null,
    summary: typeof record.summary === 'string' ? record.summary : null,
  };
}

function buildSurfaceFromActions(result: Record<string, unknown>, fileChanges: FileChanges): SurfaceRecord {
  const actions = asRecord(result.actions);
  const actionFiles = asRecord(actions?.files) ? (actions?.files as FileChanges) : null;
  const resolvedFileChanges = fileChanges || actionFiles || null;
  if (!actions && !resolvedFileChanges && typeof result.summary !== 'string') {
    return null;
  }

  return {
    pullRequest: actions?.pullRequest ?? null,
    fileChanges: resolvedFileChanges,
    summary: typeof result.summary === 'string' ? result.summary : null,
  };
}

function buildEvidenceSurface(surface: SurfaceRecord): SurfaceRecord {
  if (!surface) return null;
  const fileChanges = surface.fileChanges || null;
  const proofEvidence = surface.proofEvidence?.length ? surface.proofEvidence : null;
  const reviewNotes = surface.reviewNotes?.length ? surface.reviewNotes : null;
  const summary = surface.summary || null;

  if (!fileChanges && !proofEvidence && !reviewNotes && !summary) return null;

  return {
    pullRequest: null,
    fileChanges,
    proofEvidence,
    reviewNotes,
    summary,
  };
}

function buildDeliverySurface(surface: SurfaceRecord): SurfaceRecord {
  if (!surface) return null;
  const pullRequest = surface.pullRequest || null;
  const summary = surface.summary || null;

  if (!pullRequest && !summary) return null;

  return {
    pullRequest,
    fileChanges: null,
    proofEvidence: null,
    reviewNotes: null,
    summary,
  };
}

function buildPullRequestDeliverySurface(surface: SurfaceRecord): SurfaceRecord {
  const deliverySurface = buildDeliverySurface(surface);
  if (!deliverySurface?.pullRequest) return null;
  return deliverySurface;
}

function buildAssetPack(
  assetPackCompletion: AssetPackCompletionRecord,
  result: Record<string, unknown>,
  read: string | null,
  writtenAssetType: string | null,
): Record<string, unknown> | null {
  const direct =
    asRecord(assetPackCompletion?.assetPack) ||
    asRecord(result.assetPack);
  if (direct) return direct;

  if (!read && !writtenAssetType) return null;

  return {
    ...(read ? { read } : {}),
    ...(writtenAssetType ? { writtenAssetType } : {}),
  };
}

export function buildSemanticCompletionResult(params: {
  result: unknown;
  assetPackCompletion?: AssetPackCompletionRecord;
  fileChanges?: FileChanges;
}) {
  const resultRecord = asRecord(params.result) || {};
  const {
    shippables: _retainedShippables,
    deliveryMechanism: _retainedDeliveryMechanism,
    writtenAssets: _retainedWrittenAssets,
    assetPackSynthesisArtifacts: _retainedAssetPackSynthesisArtifacts,
    deliverables: _retainedDeliverables,
    actions: _retainedActions,
    ...safeResultRecord
  } = resultRecord;
  const assetPackCompletion = params.assetPackCompletion || null;
  const topLevelFileChanges = params.fileChanges || null;
  const explicitWrittenAssets =
    asSurfaceRecord(assetPackCompletion?.writtenAssets) ||
    asSurfaceRecord(resultRecord.writtenAssets);
  const explicitAssetPackSynthesisArtifacts =
    asSurfaceRecord(assetPackCompletion?.assetPackSynthesisArtifacts) ||
    asSurfaceRecord(resultRecord.assetPackSynthesisArtifacts);
  const explicitDeliveryMechanism =
    asSurfaceRecord(assetPackCompletion?.deliveryMechanism) ||
    asSurfaceRecord(resultRecord.deliveryMechanism);
  const explicitSettleDelivery =
    asSurfaceRecord(assetPackCompletion?.shippables) ||
    asSurfaceRecord(resultRecord.shippables) ||
    explicitDeliveryMechanism;
  const actionsSurface = buildSurfaceFromActions(resultRecord, topLevelFileChanges);
  const actionEvidenceSurface = buildEvidenceSurface(actionsSurface);
  const actionDeliverySurface = buildDeliverySurface(actionsSurface);
  const deliveryEvidenceSurface =
    buildEvidenceSurface(explicitDeliveryMechanism) ||
    buildEvidenceSurface(explicitSettleDelivery);
  const semanticFileChanges =
    explicitAssetPackSynthesisArtifacts?.fileChanges ||
    explicitWrittenAssets?.fileChanges ||
    topLevelFileChanges ||
    deliveryEvidenceSurface?.fileChanges ||
    actionEvidenceSurface?.fileChanges ||
    null;

  const writtenAssets =
    explicitWrittenAssets ||
    explicitAssetPackSynthesisArtifacts ||
    ((semanticFileChanges || typeof resultRecord.summary === 'string')
      ? {
          pullRequest: null,
          fileChanges: semanticFileChanges,
          summary: typeof resultRecord.summary === 'string' ? resultRecord.summary : null,
        }
      : null);

  const deliveryMechanism =
    buildDeliverySurface(explicitDeliveryMechanism) ||
    buildDeliverySurface(explicitSettleDelivery) ||
    actionDeliverySurface ||
    null;

  const shippables =
    buildPullRequestDeliverySurface(explicitSettleDelivery) ||
    buildPullRequestDeliverySurface(deliveryMechanism) ||
    null;

  const summary =
    (typeof assetPackCompletion?.summary === 'string' && assetPackCompletion.summary) ||
    explicitAssetPackSynthesisArtifacts?.summary ||
    writtenAssets?.summary ||
    deliveryMechanism?.summary ||
    (typeof resultRecord.summary === 'string' ? resultRecord.summary : null) ||
    (typeof resultRecord.message === 'string' ? resultRecord.message : null);

  const read =
    (typeof assetPackCompletion?.read === 'string' && assetPackCompletion.read) ||
    (typeof resultRecord.read === 'string' ? resultRecord.read : null);
  const writtenAssetType =
    (typeof assetPackCompletion?.writtenAssetType === 'string' && assetPackCompletion.writtenAssetType) ||
    (typeof resultRecord.writtenAssetType === 'string' ? resultRecord.writtenAssetType : null);
  const assetPack = buildAssetPack(assetPackCompletion, resultRecord, read, writtenAssetType);

  return {
    clientResult: {
      ...safeResultRecord,
      ...(summary ? { summary } : {}),
      ...(assetPackCompletion?.processingStats ? { processingStats: assetPackCompletion.processingStats } : {}),
      ...(assetPackCompletion?.repoSnapshot ? { repoSnapshot: assetPackCompletion.repoSnapshot } : {}),
      ...(explicitAssetPackSynthesisArtifacts ? { assetPackSynthesisArtifacts: explicitAssetPackSynthesisArtifacts } : {}),
      ...(writtenAssets ? { writtenAssets } : {}),
      ...(shippables ? { shippables } : {}),
      ...(deliveryMechanism ? { deliveryMechanism } : {}),
      ...(read ? { read } : {}),
      ...(writtenAssetType ? { writtenAssetType } : {}),
      ...(assetPack ? { assetPack } : {}),
      ...(explicitAssetPackSynthesisArtifacts || writtenAssets || shippables || deliveryMechanism ? { semanticKind: 'asset-pack-written-asset' } : {}),
      actions: {
        pullRequest: deliveryMechanism?.pullRequest ?? null,
        files:
          topLevelFileChanges ||
          actionEvidenceSurface?.fileChanges ||
          writtenAssets?.fileChanges ||
          null,
      },
    },
    fileChanges:
      topLevelFileChanges ||
      writtenAssets?.fileChanges ||
      null,
  };
}
