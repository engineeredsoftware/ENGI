/**
 * Depository-search input normalization and lexical provider.
 * Coerces pipeline input into typed reads/assets and a default search provider.
 */
import {
  isAcceptedReadNeed,
  readNeedToDepositorySearchRead,
  resolveReadNeedFromPipelineInput,
} from '../../read/src/read-need';
import {
  depositorySupplyAssetsFromIndex,
  type DepositorySupplyIndex,
} from './depository-supply-index';
import {
  assetCorpus,
  firstString,
  getPath,
  intersection,
  normalizeArtifactKind,
  overlapScore,
  recordValue,
  selectedUnitsFor,
  sha256,
  stringArray,
  stringValue,
  tokensFrom,
} from './depository-search-scoring';
import type {
  DepositoryAsset,
  DepositoryContentUnit,
  DepositorySearchProvider,
  DepositorySearchRead,
} from './depository-search-types';

export function createLexicalDepositorySearchProvider(): DepositorySearchProvider {
  return {
    id: 'lexical-depository-search',
    search({ read, assets }) {
      const queryTerms = tokensFrom([
        read.prompt,
        ...read.targetArtifactKinds,
        ...read.closureCriteria,
        ...read.failureModes,
      ].join(' '));
      return assets
        .map((asset) => {
          const score = overlapScore(queryTerms, tokensFrom(assetCorpus(asset)));
          return {
            providerId: 'lexical-depository-search',
            channelId: 'lexical',
            assetId: asset.assetId,
            unitIds: selectedUnitsFor(queryTerms, asset).map((unit) => unit.unitId),
            score,
            evidenceRefs: [asset.assetId, asset.contentRoot].filter(Boolean) as string[],
            matchedValues: intersection(queryTerms, tokensFrom(assetCorpus(asset))),
          };
        })
        .filter((match) => match.score > 0);
    },
  };
}

export function normalizeDepositorySearchRead(input: unknown): DepositorySearchRead {
  const acceptedNeed = resolveReadNeedFromPipelineInput(input);
  if (isAcceptedReadNeed(acceptedNeed)) {
    return readNeedToDepositorySearchRead(acceptedNeed);
  }

  const record = recordValue(input) || {};
  const readRecord = recordValue(record.read);
  const sourceRevision = recordValue(record.sourceRevision);
  const repository = recordValue(record.repository);
  const readMeasurement = recordValue(record.readMeasurement);
  const prompt = firstString(
    typeof record.read === 'string' ? record.read : undefined,
    readRecord?.prompt,
    readRecord?.read,
    record.definitionOfRead,
    record.readDefinition,
    readMeasurement?.prompt,
    readMeasurement?.summary
  ) || '';
  const repositoryFullName = firstString(
    sourceRevision?.repositoryFullName,
    repository?.fullName,
    repository?.repositoryFullName,
    repository?.repo,
    readRecord?.repositoryFullName,
    readMeasurement?.repositoryFullName,
    getPath(readMeasurement, ['scenario', 'repo'])
  );
  const targetArtifactKinds = [
    ...stringArray(record.targetArtifactKinds),
    ...stringArray(record.targetKinds),
    ...stringArray(readRecord?.targetArtifactKinds),
    ...stringArray(readRecord?.targetKinds),
    ...stringArray(readMeasurement?.targetArtifactKinds),
  ];
  const closureCriteria = [
    ...stringArray(record.closureCriteria),
    ...stringArray(readRecord?.closureCriteria),
    ...stringArray(readMeasurement?.closureCriteria),
  ];

  return {
    id: firstString(readRecord?.id, readRecord?.readId, readMeasurement?.id, getPath(readMeasurement, ['scenario', 'id'])),
    prompt,
    repositoryFullName,
    sourceBranch: firstString(sourceRevision?.branch, repository?.branch, readRecord?.sourceBranch, readMeasurement?.sourceBranch),
    sourceCommit: firstString(sourceRevision?.commit, repository?.commit, readRecord?.sourceCommit, readMeasurement?.sourceCommit),
    targetArtifactKinds: [...new Set(targetArtifactKinds.map(normalizeArtifactKind))],
    closureCriteria: [...new Set(closureCriteria)],
    failureModes: [
      ...stringArray(record.failureModes),
      ...stringArray(readRecord?.failureModes),
      ...stringArray(readMeasurement?.failureModes),
    ],
  };
}

function fallbackContentUnits(assetId: string, text: string): DepositoryContentUnit[] {
  const unitText = stringValue(text) || assetId;
  return [
    {
      unitId: `${assetId}:unit-1`,
      unitKind: 'summary',
      text: unitText,
      unitHash: `sha256:${sha256(unitText)}`,
    },
  ];
}

export function normalizeDepositoryAsset(input: unknown): DepositoryAsset | null {
  const record = recordValue(input);
  if (!record) return null;
  const metadata = recordValue(record.metadata);
  const repoSnapshot = recordValue(record.repo_snapshot) || recordValue(record.repoSnapshot);
  const sourceRevision = recordValue(record.sourceRevision);
  const assetId = firstString(
    record.assetId,
    record.id,
    record.depositAssetId,
    record.candidateAssetId,
    record.deposit_asset_id
  );
  if (!assetId) return null;

  const title = firstString(record.title, metadata?.title, record.summary, metadata?.summary) || assetId;
  const summary = firstString(record.summary, metadata?.summary, record.description);
  const repositoryFullName =
    firstString(
      record.repositoryFullName,
      record.repository_full_name,
      sourceRevision?.repositoryFullName,
      metadata?.sourceRepo,
      getPath(record, ['githubBoundary', 'sourceRepo']),
      getPath(record, ['addressingSurface', 'repo'])
    ) ||
    (repoSnapshot?.org && repoSnapshot?.repo ? `${repoSnapshot.org}/${repoSnapshot.repo}` : null);
  const contentUnits = Array.isArray(record.contentUnits)
    ? record.contentUnits
        .map((unit, index) => normalizeContentUnit(assetId, unit, index))
        .filter(Boolean) as DepositoryContentUnit[]
    : fallbackContentUnits(assetId, [
        title,
        summary,
        repositoryFullName,
        record.sourceBranch,
        record.sourceCommit,
        record.contentRoot,
      ].join(' '));

  // Promote absolute facets onto metadata so hybrid search filters/scores see them.
  const absoluteKinds = new Set<string>();
  const absoluteVolumes: Record<string, number> = {};
  const seedKinds = stringArray(metadata?.absoluteKinds);
  for (const k of seedKinds) absoluteKinds.add(k.toLowerCase());
  const seedVolumes = recordValue(metadata?.absoluteVolumes);
  if (seedVolumes) {
    for (const [k, v] of Object.entries(seedVolumes)) {
      const n = Number(v);
      if (Number.isFinite(n)) {
        absoluteVolumes[k.toLowerCase()] = Math.max(0, Math.min(1, n));
        absoluteKinds.add(k.toLowerCase());
      }
    }
  }
  const absoluteRows: unknown[] = [];
  if (Array.isArray(record.absolutes)) absoluteRows.push(...record.absolutes);
  if (Array.isArray(metadata?.absolutes)) absoluteRows.push(...(metadata!.absolutes as unknown[]));
  const measurements = recordValue(record.measurements) || recordValue(metadata?.measurements);
  if (measurements && Array.isArray(measurements.absolutes)) {
    absoluteRows.push(...(measurements.absolutes as unknown[]));
  }
  for (const row of absoluteRows) {
    const r = recordValue(row);
    if (!r) continue;
    const kind = firstString(r.measurementKind, r.kind, r.id);
    if (!kind) continue;
    absoluteKinds.add(kind.toLowerCase());
    const vol = Number(r.volume);
    if (Number.isFinite(vol)) {
      absoluteVolumes[kind.toLowerCase()] = Math.max(0, Math.min(1, vol));
    }
  }

  const enrichedMetadata: Record<string, unknown> = {
    ...(metadata || {}),
    absoluteKinds: [...absoluteKinds].sort(),
    absoluteVolumes,
  };

  const hasAbsoluteFacets = absoluteKinds.size > 0;

  return {
    assetId,
    title,
    summary,
    artifactKind: normalizeArtifactKind(firstString(record.artifactKind, record.kind, metadata?.artifactKind) || 'asset-pack-evidence'),
    artifactType: firstString(record.artifactType, metadata?.artifactType),
    repositoryFullName,
    sourceBranch: firstString(record.sourceBranch, record.source_branch, sourceRevision?.branch, repoSnapshot?.branch),
    sourceCommit: firstString(record.sourceCommit, record.source_commit, sourceRevision?.commit, repoSnapshot?.commit),
    contentRoot: firstString(record.contentRoot, record.content_root),
    contentUnits,
    metadata: enrichedMetadata,
    provenanceBinding: recordValue(record.provenanceBinding),
    sourceMaterialBinding: recordValue(record.sourceMaterialBinding),
    artifactSelectionSurface: recordValue(record.artifactSelectionSurface),
    addressingSurface: recordValue(record.addressingSurface),
    githubBoundary: recordValue(record.githubBoundary),
    githubAppAuthSurface: recordValue(record.githubAppAuthSurface),
    identitySurface: recordValue(record.identitySurface),
    signingSurface: recordValue(record.signingSurface),
    attestations: Array.isArray(record.attestations) ? record.attestations : [],
    assetMeasurement: record.assetMeasurement,
    measurementProvenance: Array.isArray(record.measurementProvenance) ? record.measurementProvenance : [],
    verificationEvidence: recordValue(record.verificationEvidence),
    hasWalletOrAttestationProof: record.hasWalletOrAttestationProof === true,
    hasAssetMeasurementEvidence:
      record.hasAssetMeasurementEvidence === true || hasAbsoluteFacets,
    createdAt: firstString(record.createdAt, record.created_at),
  };
}

function normalizeContentUnit(
  assetId: string,
  input: unknown,
  index: number
): DepositoryContentUnit | null {
  const record = recordValue(input);
  if (!record) return null;
  const text = firstString(record.text, record.content, record.summary);
  if (!text) return null;
  const unitId = firstString(record.unitId, record.id) || `${assetId}:unit-${index + 1}`;
  return {
    unitId,
    unitKind: firstString(record.unitKind, record.kind) || 'text',
    text,
    unitHash: firstString(record.unitHash, record.hash) || `sha256:${sha256(text)}`,
    path: firstString(record.path, record.sourcePath),
    codeAnalysisFacts: recordValue(record.codeAnalysisFacts) as DepositoryContentUnit['codeAnalysisFacts'],
  };
}

export function normalizePipelineDepositoryAssets(input: unknown): DepositoryAsset[] {
  const record = recordValue(input) || {};
  const depositorySupplyIndex = recordValue(record.depositorySupplyIndex) || recordValue(record.depositorySupply);
  if (depositorySupplyIndex) {
    const assets = depositorySupplyAssetsFromIndex(depositorySupplyIndex as unknown as DepositorySupplyIndex);
    if (assets.length) return assets;
  }

  const candidateCollections = [
    record.depositoryAssets,
    record.depositCandidates,
    record.candidateAssets,
    record.assets,
  ].filter(Array.isArray) as unknown[][];
  const assets = candidateCollections
    .flat()
    .map(normalizeDepositoryAsset)
    .filter(Boolean) as DepositoryAsset[];

  if (assets.length) return assets;

  const depositRecord = recordValue(record.deposit);
  const sourceRevision = recordValue(record.sourceRevision);
  if (!depositRecord || !sourceRevision) return [];
  const assetId = firstString(depositRecord.assetId, depositRecord.id) || 'deposit-reference';
  const repositoryFullName = firstString(sourceRevision.repositoryFullName);
  const branch = firstString(sourceRevision.branch);
  const commit = firstString(sourceRevision.commit);
  const promptSummary = [
    'Deposited repository revision',
    repositoryFullName,
    branch,
    commit,
    'repository-revision fit-quality-receipt asset-pack-evidence proof-root reconciliation-readback',
  ].join(' ');

  return [
    {
      assetId,
      title: `Deposited repository revision ${repositoryFullName || assetId}`,
      summary: promptSummary,
      artifactKind: 'repository-revision',
      artifactType: 'repository/revision',
      repositoryFullName,
      sourceBranch: branch,
      sourceCommit: commit,
      contentRoot: `sha256:${sha256(promptSummary)}`,
      contentUnits: fallbackContentUnits(assetId, promptSummary),
      metadata: {
        summary: promptSummary,
        sourceRepo: repositoryFullName,
        sourcePaths: ['.proofs/_shared/depositing-surface.json', '.proofs/_shared/deposit-to-read-surface.json'],
      },
      sourceMaterialBinding: {
        mode: 'source-bound-repository-revision',
        mutableInBranch: false,
        materializationRoot: `.proofs/source-material/${assetId}`,
      },
      verificationEvidence: {
        proofRoot: firstString(depositRecord.proofRoot),
        measurementRoot: firstString(depositRecord.measurementRoot),
        reconciliationReadbackRoot: firstString(depositRecord.reconciliationReadbackRoot),
      },
      hasWalletOrAttestationProof: depositRecord.hasWalletOrAttestationProof === true,
      hasAssetMeasurementEvidence: depositRecord.hasAssetMeasurementEvidence === true,
    },
  ];
}
