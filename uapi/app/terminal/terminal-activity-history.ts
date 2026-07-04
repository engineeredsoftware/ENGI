import { buildAgenticExecutionSummary } from '@bitcode/api/src/executions/agentic-execution';

import type { PipelineExecution } from '@/types/api';

import type { TerminalClosureState } from './terminal-closure-state';
import type { TerminalDepositReadWorkbench, TerminalSourceRevision } from './terminal-deposit-read-workbench';
import type { TerminalReadScenariosState } from './terminal-read-scenarios';
import type { TerminalExternalRuntimeSnapshot } from './terminal-external-runtime';
import type { WorkspaceRun } from './terminal-run-data';
import type { TerminalRepositoryContextState } from './terminal-repository-context';
import type { TerminalSupplySelectionState } from './terminal-supply-selection';
import type { TerminalRunDetailSnapshot } from './terminal-transaction-detail-snapshot';
import type { TerminalTransactionDetailSection } from './terminal-transaction-query';

export interface TerminalActivityRecordDraft {
  type: string;
  summary: string;
  detailSection?: TerminalTransactionDetailSection;
  selectAfterRecord?: boolean;
  sourceRevision?: TerminalSourceRevision | null;
  status?: string;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  context?: Record<string, unknown> | null;
  items?: unknown[];
}

function buildBitcodeWorkbenchState(workbench: TerminalDepositReadWorkbench) {
  return {
    canonLabel: workbench.canonLabel,
    projectionPrincipal: workbench.projectionPrincipal,
    branchMode: workbench.branchMode,
    scenarioLabel: workbench.scenarioLabel,
    profileLabel: workbench.profileLabel,
    sourceRevision: workbench.sourceRevision,
    deposit: workbench.deposit,
    read: workbench.read,
    fit: workbench.fit,
  };
}

function buildReadMeasurementState(
  needState: TerminalReadScenariosState,
  scenario: TerminalReadScenariosState['scenarios'][number],
) {
  return {
    scenario,
    parserKind: needState.parserKind,
    closureCriteriaCount: needState.closureCriteriaCount,
    targetKindCount: needState.targetKindCount,
  };
}

function buildSupplySelectionState(selection: TerminalSupplySelectionState, authSessionLabel: string) {
  return {
    authSessionLabel,
    selectedAuthSessionId: selection.selectedAuthSessionId,
    selectedKind: selection.selectedKind,
    searchTerm: selection.searchTerm,
    selectedCount: selection.selectedCount,
    filteredCount: selection.filteredCount,
    totalFilteredEntries: selection.totalFilteredEntries,
    selectedEntries: selection.filteredEntries
      .filter((entry) => entry.selected)
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        kind: entry.kind,
        tags: entry.tags,
      })),
  };
}

function buildRepositoryAnchorState(repositoryContext: TerminalRepositoryContextState, providerAccount: string) {
  const selectedRepository = repositoryContext.selectedRepository;
  const connectionStatus = repositoryContext.connectionStatus;
  const selectedBranch = repositoryContext.selectedBranch || selectedRepository?.defaultBranch || 'main';
  const selectedCommit = repositoryContext.selectedCommit || '';
  return {
    provider: repositoryContext.provider,
    providerAccount,
    repository: selectedRepository
      ? {
          id: selectedRepository.id,
          fullName: selectedRepository.fullName,
          defaultBranch: selectedRepository.defaultBranch || 'main',
          selectedBranch,
          selectedCommit,
          private: Boolean(selectedRepository.private),
          language: selectedRepository.language || null,
          topics: selectedRepository.topics || [],
        }
      : null,
    connection: {
      connected: Boolean(connectionStatus?.connected),
      valid: Boolean(connectionStatus?.valid),
      mode: connectionStatus?.metadata?.mock_mode ? 'mock review' : 'live connection',
      inventorySource: repositoryContext.inventorySource || null,
    },
    sourceSelection: selectedRepository
      ? {
          repository: selectedRepository.fullName,
          branch: selectedBranch,
          commit: selectedCommit || null,
          branchCount: repositoryContext.branches?.length || 0,
          commitCount: repositoryContext.commits?.length || 0,
        }
      : null,
  };
}

function normalizeWhitespace(value?: string | null) {
  return value?.trim() || '';
}

function splitRepositoryFullName(value?: string | null) {
  const fullName = normalizeWhitespace(value);
  if (!fullName.includes('/')) return null;
  const [org, repo] = fullName.split('/', 2);
  if (!org || !repo) return null;
  return { org, repo };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRowValue(rows: Array<{ label: string; value: string }>, label: string) {
  return rows.find((row) => row.label === label)?.value || '—';
}

function buildTerminalFitResultState(workbench: TerminalDepositReadWorkbench) {
  const rawResultState = normalizeWhitespace(readRowValue(workbench.fit.rows, 'Fit result')).toLowerCase();
  const resultState =
    rawResultState === 'worthy_fit' || rawResultState === 'no_worthy_fit' || rawResultState === 'blocked_readiness'
      ? rawResultState
      : 'blocked_readiness';
  const resultReason = normalizeWhitespace(readRowValue(workbench.fit.rows, 'Result reason'));
  const settlementIntent = normalizeWhitespace(readRowValue(workbench.fit.rows, 'Settlement intent'));
  const proofIntent = normalizeWhitespace(readRowValue(workbench.fit.rows, 'Proof intent'));

  return {
    resultState,
    resultReasons: [
      resultReason,
      settlementIntent ? `Settlement intent: ${settlementIntent}` : '',
      proofIntent ? `Proof intent: ${proofIntent}` : '',
    ].filter(Boolean),
    sourceRevision: workbench.sourceRevision,
    evidenceKinds: workbench.read.targetKinds,
    decisiveKinds: normalizeWhitespace(readRowValue(workbench.fit.rows, 'Decisive kinds')),
    overlapKinds: normalizeWhitespace(readRowValue(workbench.fit.rows, 'Overlap kinds')),
    downstreamFinalityClaimsAllowed: resultState === 'worthy_fit',
  };
}

function buildRepoSnapshot(
  repositoryContext?: TerminalRepositoryContextState | null,
  fallbackRun?: WorkspaceRun | null,
  sourceRevision?: TerminalSourceRevision | null,
) {
  const sourceRevisionParts = splitRepositoryFullName(sourceRevision?.repositoryFullName);
  if (sourceRevisionParts) {
    return {
      org: sourceRevisionParts.org,
      repo: sourceRevisionParts.repo,
      branch: normalizeWhitespace(sourceRevision?.branch) || 'main',
      commit: normalizeWhitespace(sourceRevision?.commit),
    };
  }

  const selectedRepository = repositoryContext?.selectedRepository || null;
  const selectedRepositoryParts = splitRepositoryFullName(selectedRepository?.fullName);
  if (selectedRepository && selectedRepositoryParts) {
    return {
      org: selectedRepositoryParts.org,
      repo: selectedRepositoryParts.repo,
      branch: normalizeWhitespace(repositoryContext?.selectedBranch) || normalizeWhitespace(selectedRepository.defaultBranch) || 'main',
      commit: normalizeWhitespace(repositoryContext?.selectedCommit),
    };
  }

  const fallbackRepository = splitRepositoryFullName(fallbackRun?.repository);
  if (!fallbackRepository) return null;

  return {
    org: fallbackRepository.org,
    repo: fallbackRepository.repo,
    branch: normalizeWhitespace(fallbackRun?.branch) || 'n/a',
    commit: '',
  };
}

function readNestedString(value: unknown, path: string[]): string | null {
  let cursor: unknown = value;
  for (const part of path) {
    if (!isRecord(cursor)) return null;
    cursor = cursor[part];
  }
  return typeof cursor === 'string' && cursor.trim() ? cursor.trim() : null;
}

export function buildTerminalExecutionHistoryRequest(
  draft: TerminalActivityRecordDraft,
  options: {
    repositoryContext?: TerminalRepositoryContextState | null;
    fallbackRun?: WorkspaceRun | null;
  },
) {
  const summary = normalizeWhitespace(draft.summary) || 'Bitcode activity recorded from the Bitcode Terminal.';
  const repoSnapshot = buildRepoSnapshot(options.repositoryContext, options.fallbackRun, draft.sourceRevision);
  const repositoryFullName = repoSnapshot ? `${repoSnapshot.org}/${repoSnapshot.repo}` : null;
  const draftOutput = isRecord(draft.output) ? draft.output : null;
  const assetPackCompletionPatch = isRecord(draftOutput?.assetPackCompletion) ? draftOutput.assetPackCompletion : null;
  const outputWithoutAssetPackCompletion = draftOutput
    ? Object.fromEntries(Object.entries(draftOutput).filter(([key]) => key !== 'assetPackCompletion'))
    : null;
  const output = {
    summary,
    ...(repoSnapshot ? { repo_snapshot: repoSnapshot } : {}),
    asset_pack_completion: {
      summary,
      ...(repoSnapshot ? { repoSnapshot } : {}),
      ...(assetPackCompletionPatch || {}),
    },
    ...(outputWithoutAssetPackCompletion || {}),
  };
  const context = {
    source: 'terminal-terminal',
    surface: 'Bitcode Terminal',
    summary,
    ...(repoSnapshot
      ? {
          repoSnapshot,
          repositoryFullName,
          repositoryAnchor: repositoryFullName,
          sourceBranch: repoSnapshot.branch || null,
          sourceCommit: repoSnapshot.commit || null,
        }
      : {}),
    ...(draft.context || {}),
  };

  return {
    pipeline_type: draft.type,
    status: draft.status || 'completed',
    input: draft.input || null,
    output,
    context,
    items: draft.items || [],
  };
}

function serializeProcessingStats(
  processingStats?: Pick<TerminalRunDetailSnapshot, 'processingStats'>['processingStats'] | null,
) {
  if (!processingStats) return null;

  return {
    ...(processingStats.time ? { time: processingStats.time } : {}),
    ...(typeof processingStats.tokenTotal === 'number'
      ? { tokens: { total: processingStats.tokenTotal } }
      : {}),
    ...(typeof processingStats.measuredBtd === 'number' ? { measuredBtd: processingStats.measuredBtd } : {}),
    ...(typeof processingStats.btcFeeUsdEquivalent === 'number' ? { btcFeeUsdEquivalent: processingStats.btcFeeUsdEquivalent } : {}),
    ...(typeof processingStats.averageLatencyMs === 'number'
      ? { averageLatencyMs: processingStats.averageLatencyMs }
      : {}),
  };
}

export function buildTerminalClosureAssetPackCompletion(
  closureState: TerminalClosureState | null,
  detail?: Pick<TerminalRunDetailSnapshot, 'summary' | 'processingStats'> | null,
) {
  const closureFollowThrough = closureState
    ? {
        canonLabel: closureState.canonLabel,
        settlementMetrics: closureState.settlement.metrics.slice(0, 4),
        branchArtifacts: closureState.branch.chips.slice(0, 6),
        proofFamilies: closureState.settlement.proofFamilies?.slice(0, 4) || [],
        recentHistory: closureState.ledger.recentRuns?.slice(0, 4) || [],
      }
    : null;
  const processingStats = serializeProcessingStats(detail?.processingStats);

  if (!closureFollowThrough && !processingStats && !normalizeWhitespace(detail?.summary)) {
    return null;
  }

  return {
    ...(normalizeWhitespace(detail?.summary) ? { summary: normalizeWhitespace(detail?.summary) } : {}),
    ...(processingStats ? { processingStats } : {}),
    ...(closureState
      ? {
          closurePanels: {
            canonLabel: closureState.canonLabel,
            readReview: closureState.readReview,
            verification: closureState.verification,
            branch: closureState.branch,
            settlement: closureState.settlement,
            ledger: closureState.ledger,
          },
        }
      : {}),
    ...(closureFollowThrough ? { closureFollowThrough } : {}),
  };
}

export function buildTerminalDepositWorkbenchDraft(
  workbench: TerminalDepositReadWorkbench,
): TerminalActivityRecordDraft {
  const repository = readRowValue(workbench.deposit.rows, 'Repository');
  const selectedEntryLabels = workbench.deposit.selectedEntries.map((entry) => entry.label);

  return {
    type: 'agentic-execution:asset-pack',
    detailSection: 'transaction',
    sourceRevision: workbench.sourceRevision,
    summary: `Recorded deposit-side share posture for ${repository}.`,
    input: {
      selectedEntryLabels,
      artifactKinds: workbench.deposit.artifactKinds,
    },
    output: {
      deposit: {
        summary: workbench.deposit.summary,
        metrics: workbench.deposit.metrics,
        rows: workbench.deposit.rows,
      },
      assetPackCompletion: {
        bitcodeActivityState: {
          depositWorkbench: buildBitcodeWorkbenchState(workbench),
        },
      },
    },
    context: {
      source: 'terminal-deposit-read-workbench',
      workbench: 'deposit',
      canonLabel: workbench.canonLabel,
      projectionPrincipal: workbench.projectionPrincipal,
      branchMode: workbench.branchMode,
      scenarioLabel: workbench.scenarioLabel,
      profileLabel: workbench.profileLabel,
      repository,
    },
  };
}

export function buildTerminalReadMeasurementDraft(
  needState: TerminalReadScenariosState,
  scenarioOverride?: TerminalReadScenariosState['scenarios'][number],
  options?: { sourceRevision?: TerminalSourceRevision | null },
): TerminalActivityRecordDraft {
  const scenario =
    scenarioOverride ||
    needState.scenarios.find((entry) => entry.selected) ||
    needState.scenarios.find((entry) => entry.id === needState.selectedScenarioId) ||
    needState.scenarios[0] || {
      id: 'unselected-scenario',
      label: 'Unselected scenario',
      repo: '—',
      profile: 'profile pending',
      selected: false,
    };

  return {
    type: 'agentic-execution:read-measurement',
    detailSection: 'activity',
    selectAfterRecord: false,
    sourceRevision: options?.sourceRevision || null,
    summary: `Recorded read measurement for ${scenario.label}.`,
    output: {
      readMeasurement: {
        parserKind: needState.parserKind,
        closureCriteriaCount: needState.closureCriteriaCount,
        targetKindCount: needState.targetKindCount,
        scenario,
      },
      assetPackCompletion: {
        bitcodeActivityState: {
          readMeasurement: buildReadMeasurementState(needState, scenario),
        },
      },
    },
    context: {
      source: 'terminal-read-scenario-panel',
      scenarioId: scenario.id,
      scenarioLabel: scenario.label,
      scenarioRepository: scenario.repo,
      scenarioProfile: scenario.profile,
    },
  };
}

export function buildTerminalReadAdmissionDraft(
  workbench: TerminalDepositReadWorkbench,
): TerminalActivityRecordDraft {
  const readMeasurement = {
    scenario: {
      id: workbench.scenarioLabel,
      label: workbench.scenarioLabel,
      repo: readRowValue(workbench.read.rows, 'Repository'),
      profile: readRowValue(workbench.read.rows, 'Profile'),
      selected: true,
    },
    parserKind: readRowValue(workbench.read.rows, 'Parser'),
    closureCriteriaCount: workbench.read.closureCriteria.length,
    targetKindCount: workbench.read.targetKinds.length,
  };
  const readReview = {
    action: 'accept',
    status: 'accepted',
    reviewStage: 'post-measurement-pre-fit',
    requiredBefore: 'find-fitting-asset-pack',
    fitSearchAdmission: {
      admitted: true,
      admissionReason:
        'Measured Read is admitted for source-bound Finding Fits against the selected deposited repository revision.',
      admittedStages: ['finding-fits-discovery', 'fit-quality-evaluation', 'asset-pack-result-review'],
      blockedStages: ['settlement', 'finality', 'minting'],
    },
    nextProtocolAction: 'Run Finding Fits and return worthy_fit, no_worthy_fit, or blocked_readiness evidence.',
  };

  return {
    type: 'agentic-execution:read-measurement',
    detailSection: 'activity',
    sourceRevision: workbench.sourceRevision,
    summary: `Accepted measured Read for Finding Fits for ${workbench.scenarioLabel}.`,
    output: {
      readMeasurement,
      readReview,
      assetPackCompletion: {
        bitcodeActivityState: {
          readMeasurement,
          readReview,
          fitSearchAdmission: readReview.fitSearchAdmission,
        },
      },
    },
    context: {
      source: 'terminal-deposit-read-workbench',
      workbench: 'read-admission',
      scenarioLabel: workbench.scenarioLabel,
      fitSearchAdmitted: true,
      readResultState: 'admitted_for_fit_search',
    },
  };
}

export function buildTerminalSupplySelectionDraft(
  selection: TerminalSupplySelectionState,
): TerminalActivityRecordDraft {
  const selectedEntries = selection.filteredEntries
    .filter((entry) => entry.selected)
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      kind: entry.kind,
      tags: entry.tags,
    }));
  const authSessionLabel =
    selection.authSessions.find((entry) => entry.value === selection.selectedAuthSessionId)?.label || 'No auth session';

  return {
    type: 'agentic-execution:asset-pack',
    detailSection: 'transaction',
    summary: `Recorded deposit-side selection with ${selection.selectedCount} supply reference${selection.selectedCount === 1 ? '' : 's'}.`,
    input: {
      selectedCount: selection.selectedCount,
      selectedEntries,
      selectedKind: selection.selectedKind,
      searchTerm: selection.searchTerm,
    },
    output: {
      depositSelection: {
        authSessionLabel,
        filteredCount: selection.filteredCount,
        totalFilteredEntries: selection.totalFilteredEntries,
      },
      assetPackCompletion: {
        bitcodeActivityState: {
          supplySelection: buildSupplySelectionState(selection, authSessionLabel),
        },
      },
    },
    context: {
      source: 'terminal-supply-selection-panel',
      authSessionId: selection.selectedAuthSessionId,
      selectedKind: selection.selectedKind,
      searchTerm: selection.searchTerm || null,
    },
  };
}

export function buildTerminalFitWorkbenchDraft(
  workbench: TerminalDepositReadWorkbench,
): TerminalActivityRecordDraft {
  const fitResult = buildTerminalFitResultState(workbench);

  return {
    type: 'agentic-execution:proof-refresh',
    detailSection: 'closure',
    sourceRevision: workbench.sourceRevision,
    summary: `Recorded asset-pack fit and settlement posture for ${workbench.scenarioLabel}.`,
    output: {
      fit: {
        summary: workbench.fit.summary,
        metrics: workbench.fit.metrics,
        rows: workbench.fit.rows,
        resultState: fitResult.resultState,
        resultReasons: fitResult.resultReasons,
      },
      fitResult,
      assetPackCompletion: {
        bitcodeActivityState: {
          fitWorkbench: buildBitcodeWorkbenchState(workbench),
          fitResult,
        },
      },
    },
    context: {
      source: 'terminal-deposit-read-workbench',
      workbench: 'fit',
      projectionPrincipal: workbench.projectionPrincipal,
      branchMode: workbench.branchMode,
      scenarioLabel: workbench.scenarioLabel,
      profileLabel: workbench.profileLabel,
      fitResultState: fitResult.resultState,
    },
  };
}

export function buildTerminalRepositoryAnchorDraft(
  repositoryContext: TerminalRepositoryContextState,
): TerminalActivityRecordDraft {
  const selectedRepository = repositoryContext.selectedRepository;
  const connectionStatus = repositoryContext.connectionStatus;
  const selectedBranch = repositoryContext.selectedBranch || selectedRepository?.defaultBranch || 'main';
  const selectedCommit = repositoryContext.selectedCommit || '';
  const providerAccount =
    connectionStatus?.username || connectionStatus?.metadata?.account || selectedRepository?.owner.username || 'connected account';

  return {
    type: 'agentic-execution:asset-pack',
    detailSection: 'transaction',
    summary: `Recorded repository anchor for ${selectedRepository?.fullName || 'the current Bitcode supply boundary'}.`,
    output: {
      repositoryAnchor: {
        provider: repositoryContext.provider,
        repository: selectedRepository
          ? {
              id: selectedRepository.id,
              fullName: selectedRepository.fullName,
              defaultBranch: selectedRepository.defaultBranch || 'main',
              selectedBranch,
              selectedCommit,
              private: Boolean(selectedRepository.private),
              language: selectedRepository.language || null,
              topics: selectedRepository.topics || [],
            }
          : null,
        connection: {
          connected: Boolean(connectionStatus?.connected),
          valid: Boolean(connectionStatus?.valid),
          mode: connectionStatus?.metadata?.mock_mode ? 'mock review' : 'live connection',
          inventorySource: repositoryContext.inventorySource || null,
        },
        sourceSelection: selectedRepository
          ? {
              repository: selectedRepository.fullName,
              branch: selectedBranch,
              commit: selectedCommit || null,
              branchCount: repositoryContext.branches?.length || 0,
              commitCount: repositoryContext.commits?.length || 0,
            }
          : null,
      },
      assetPackCompletion: {
        bitcodeActivityState: {
          repositoryAnchor: buildRepositoryAnchorState(repositoryContext, providerAccount),
        },
      },
    },
    context: {
      source: 'terminal-repository-context-panel',
      provider: repositoryContext.provider,
      providerAccount,
      inventorySource: repositoryContext.inventorySource || null,
      repositoryFullName: selectedRepository?.fullName || null,
      sourceBranch: selectedRepository ? selectedBranch : null,
      sourceCommit: selectedRepository ? selectedCommit || null : null,
    },
  };
}

export function buildTerminalExternalInterfacingDraft(
  snapshot: TerminalExternalRuntimeSnapshot,
): TerminalActivityRecordDraft {
  return {
    type: 'agentic-execution:proof-refresh',
    detailSection: 'closure',
    summary: `Recorded external interface readiness for ${snapshot.configuredEnvironmentMode} Bitcode posture.`,
    output: {
      externalInterfacing: {
        configuredEnvironmentMode: snapshot.configuredEnvironmentMode,
        actualityDisposition: snapshot.actualityDisposition,
        counts: snapshot.counts,
        interfaces: snapshot.interfaces.map((entry) => ({
          interfaceId: entry.interfaceId,
          runtimeState: entry.runtimeState,
          resultClass: entry.resultClass,
          reconciliationState: entry.reconciliationState,
          blocking: entry.blocking,
        })),
      },
    },
    context: {
      source: 'terminal-external-interfacing-panel',
      configuredEnvironmentMode: snapshot.configuredEnvironmentMode,
      actualityDisposition: snapshot.actualityDisposition,
      blockingInterfaces: snapshot.counts.blocking,
      liveConfiguredInterfaces: snapshot.counts.liveConfigured,
    },
  };
}

export function mapExecutionHistoryRunToWorkspaceRun(run: PipelineExecution): WorkspaceRun {
  const agenticExecution =
    run.agentic_execution ||
    buildAgenticExecutionSummary({
      type: run.type,
      status: run.status,
    });
  const repoSnapshot = run.repo_snapshot || run.asset_pack_completion?.repoSnapshot || null;
  const context = isRecord(run.context) ? run.context : null;
  const contextString = (key: string) => {
    const value = context?.[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  };

  return {
    id: run.id,
    created_at: run.created_at,
    status: run.status,
    type: agenticExecution.canonicalType,
    agentic_execution: agenticExecution,
    sourceModel: 'execution-history',
    summary:
      run.summary ||
      run.asset_pack_completion?.summary ||
      run.asset_pack_completion?.assetPackSynthesisArtifacts?.summary ||
      run.asset_pack_completion?.writtenAssets?.summary ||
      run.asset_pack_completion?.shippables?.summary ||
      run.asset_pack_completion?.deliveryMechanism?.summary ||
      null,
    repository:
      repoSnapshot
        ? `${repoSnapshot.org}/${repoSnapshot.repo}`
        : contextString('repositoryFullName'),
    branch: repoSnapshot?.branch || contextString('sourceBranch'),
    sourceCommit: repoSnapshot?.commit || contextString('sourceCommit'),
    contextSource: contextString('source'),
    contextWorkbench: contextString('workbench'),
    candidateAssetId: contextString('candidateAssetId'),
    depositProofRoot:
      contextString('depositProofRoot') || readNestedString(run.output, ['depositoryEvidence', 'proofRoot']),
    depositMeasurementRoot:
      contextString('depositMeasurementRoot') || readNestedString(run.output, ['depositoryEvidence', 'measurementRoot']),
    depositReconciliationReadbackRoot:
      contextString('depositReconciliationReadbackRoot') ||
      readNestedString(run.output, ['depositoryEvidence', 'reconciliationReadbackRoot']),
    depositorySearchDocumentRoot:
      contextString('depositorySearchDocumentRoot') ||
      readNestedString(run.output, ['depositoryEvidence', 'depositorySearchDocumentRoot']),
    lexicalDocumentRoot:
      contextString('lexicalDocumentRoot') || readNestedString(run.output, ['depositoryEvidence', 'lexicalDocumentRoot']),
    vectorDocumentRoot:
      contextString('vectorDocumentRoot') || readNestedString(run.output, ['depositoryEvidence', 'vectorDocumentRoot']),
    compensationPreviewRoot:
      contextString('compensationPreviewRoot') ||
      readNestedString(run.output, ['depositoryEvidence', 'compensationPreviewRoot']) ||
      readNestedString(run.output, ['depositoryEvidence', 'compensationPreview', 'roots', 'compensationPreviewRoot']),
    sourceToSharesPreviewRoot:
      contextString('sourceToSharesPreviewRoot') ||
      readNestedString(run.output, ['depositoryEvidence', 'sourceToSharesPreviewRoot']) ||
      readNestedString(run.output, ['depositoryEvidence', 'compensationPreview', 'roots', 'sourceToSharesPreviewRoot']),
    compensationState:
      contextString('compensationState') ||
      readNestedString(run.output, ['depositoryEvidence', 'compensationPreview', 'state']),
    compensationAllocationMethod:
      contextString('compensationAllocationMethod') ||
      readNestedString(run.output, ['depositoryEvidence', 'compensationPreview', 'compensationRoute', 'allocationMethod']),
    compensationPriceAsset:
      contextString('compensationPriceAsset') ||
      readNestedString(run.output, ['depositoryEvidence', 'compensationPreview', 'compensationRoute', 'priceAsset']),
    depositorWalletId:
      contextString('depositorWalletId') ||
      readNestedString(run.output, ['depositoryEvidence', 'depositorBoundary', 'walletId']),
    depositoryIndexState:
      contextString('depositoryIndexState') || readNestedString(run.output, ['depositoryEvidence', 'indexState', 'vector']),
    participant: repoSnapshot?.org || 'connected account',
    isOwnTransaction: true,
    // Lens: the stored type alone is ambiguous (deposit AND read pipeline
    // runs are 'agentic-execution:asset-pack'), so the dispatch-stamped
    // context decides when present: deposit-option-synthesis rows are the
    // deposit lens; a synthesisMode of 'read' marks the read lens.
    transactionLens:
      contextString('source') === 'deposit-option-synthesis'
        ? 'deposit'
        : contextString('synthesisMode') === 'read'
          ? 'read'
          : agenticExecution.lens,
    itemCount: run.items?.length || 0,
    tokenTotal:
      run.processing_stats?.tokens?.total ?? run.asset_pack_completion?.processingStats?.tokens?.total ?? null,
    measuredBtd: run.processing_stats?.measuredBtd ?? run.asset_pack_completion?.processingStats?.measuredBtd ?? null,
    btcFeeUsdEquivalent: run.processing_stats?.btcFeeUsdEquivalent ?? run.asset_pack_completion?.processingStats?.btcFeeUsdEquivalent ?? null,
    averageLatencyMs:
      run.processing_stats?.averageLatencyMs ?? run.asset_pack_completion?.processingStats?.averageLatencyMs ?? null,
    proofStatus: agenticExecution.proofStatus,
    closureFocus: agenticExecution.closureFocus,
  };
}

export function upsertWorkspaceRun(runs: WorkspaceRun[], nextRun: WorkspaceRun) {
  const dedupedRuns = [nextRun, ...runs.filter((run) => run.id !== nextRun.id)];
  return dedupedRuns.sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );
}

export async function readTerminalRouteError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as Record<string, unknown>;
    const message = typeof payload.error === 'string' ? payload.error : payload.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  } catch {}

  return fallback;
}
