/**
 * Pipeline activity / execution-history draft builders and run mapping.
 * Relocated from product experience components/activity-history.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */

import { buildAgenticExecutionSummary } from '@bitcode/api/src/executions/agentic-execution';

import type { PipelineExecution } from '@/types/api';

import type { ProductDepositReadWorkbench, ProductSourceRevision } from '@/components/reads/models/deposit-read-workbench';
import type { ProductReadScenariosState } from '@/components/reads/models/read-scenarios';
import type { WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';
import type { RepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';
import type { PipelineTransactionDetailSection } from '@/components/bitcode/pipeline/models/pipeline-selection-query';

/** Slim processing stats for history drafts (no Pack detail snapshot dependency). */
export type PipelineProcessingStats = {
  time?: unknown;
  tokenTotal?: number;
  measuredBtd?: number;
  btcFeeUsdEquivalent?: number;
  averageLatencyMs?: number;
};

export interface ProductActivityRecordDraft {
  type: string;
  summary: string;
  detailSection?: PipelineTransactionDetailSection;
  selectAfterRecord?: boolean;
  sourceRevision?: ProductSourceRevision | null;
  status?: string;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  context?: Record<string, unknown> | null;
  items?: unknown[];
}

function buildBitcodeWorkbenchState(workbench: ProductDepositReadWorkbench) {
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
  needState: ProductReadScenariosState,
  scenario: ProductReadScenariosState['scenarios'][number],
) {
  return {
    scenario,
    parserKind: needState.parserKind,
    closureCriteriaCount: needState.closureCriteriaCount,
    targetKindCount: needState.targetKindCount,
  };
}


function buildRepositoryAnchorState(repositoryContext: RepositoryContextState, providerAccount: string) {
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

/** Context may arrive as a JSON object or a stringified JSON blob from storage. */
function parseExecutionContext(value: unknown): Record<string, unknown> | null {
  if (isRecord(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Resolve activity-ledger context.source when the field is missing/renamed but
 * the row is still clearly an anchor (summary / output payload).
 */
function resolveContextSource(
  context: Record<string, unknown> | null,
  run: PipelineExecution,
  summary: string | null,
): string | null {
  const fromContext =
    typeof context?.source === 'string' && context.source.trim()
      ? context.source.trim()
      : null;
  if (fromContext) return fromContext;

  const output = isRecord(run.output) ? run.output : null;
  if (isRecord(output?.repositoryAnchor) || isRecord(output?.repository_anchor)) {
    return 'terminal-repository-context-panel';
  }
  if (isRecord(output?.obfuscationsAnchor) || isRecord(output?.obfuscations_anchor)) {
    return 'deposit-obfuscations-anchor';
  }
  if (isRecord(output?.needAnchor) || isRecord(output?.need_anchor)) {
    return 'read-need-anchor';
  }
  if (summary && /recorded repository anchor/i.test(summary)) {
    return 'terminal-repository-context-panel';
  }
  if (summary && /anchored .+obfuscations/i.test(summary)) {
    return 'deposit-obfuscations-anchor';
  }
  if (summary && /anchored .+need/i.test(summary)) {
    return 'read-need-anchor';
  }
  return null;
}

function readRowValue(rows: Array<{ label: string; value: string }>, label: string) {
  return rows.find((row) => row.label === label)?.value || '—';
}

function buildProductFitResultState(workbench: ProductDepositReadWorkbench) {
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
  repositoryContext?: RepositoryContextState | null,
  fallbackRun?: WorkspaceRun | null,
  sourceRevision?: ProductSourceRevision | null,
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

function readNestedStringArray(value: unknown, path: string[]): string[] {
  let cursor: unknown = value;
  for (const part of path) {
    if (!isRecord(cursor)) return [];
    cursor = cursor[part];
  }
  if (!Array.isArray(cursor)) return [];
  return [
    ...new Set(
      cursor
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean),
    ),
  ];
}

/** Normalize path selections for Obfuscations anchors (source-safe path strings only). */
export function normalizeObfuscationsAnchorPaths(
  value: string[] | null | undefined,
): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean),
    ),
  ];
}

/**
 * Plain-text dropdown sub-text for an Obfuscations anchor (search / a11y /
 * tests). The UI prefers the iconized `ObfuscationsAnchorDescription` node
 * from `deposit-obfuscations-path-icons.tsx`, which reuses the same counts:
 * `[Clipped Obfuscation Text] | [# hint files] | [# exclusion files]`.
 */
export function formatObfuscationsAnchorDescription(input: {
  text: string;
  permissibleSources?: string[] | null;
  impermissibleSources?: string[] | null;
  /** Max characters of the Obfuscations body before an ellipsis (default 40). */
  textClipLength?: number;
}): string {
  const clipAt = Math.max(8, input.textClipLength ?? 40);
  const raw = typeof input.text === 'string' ? input.text.trim().replace(/\s+/g, ' ') : '';
  const clipped =
    raw.length > clipAt ? `${raw.slice(0, clipAt).trimEnd()}…` : raw || '(empty)';
  const hintCount = normalizeObfuscationsAnchorPaths(input.permissibleSources).length;
  const exclusionCount = normalizeObfuscationsAnchorPaths(
    input.impermissibleSources,
  ).length;
  const hintsLabel = `${hintCount} hint ${hintCount === 1 ? 'file' : 'files'}`;
  const exclusionsLabel = `${exclusionCount} exclusion ${
    exclusionCount === 1 ? 'file' : 'files'
  }`;
  return `${clipped} | ${hintsLabel} | ${exclusionsLabel}`;
}

export function buildProductExecutionHistoryRequest(
  draft: ProductActivityRecordDraft,
  options: {
    repositoryContext?: RepositoryContextState | null;
    fallbackRun?: WorkspaceRun | null;
  },
) {
  const summary = normalizeWhitespace(draft.summary) || 'Bitcode activity recorded from the product surface.';
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
    source: 'bitcode-product',
    surface: 'Bitcode product',
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
  processingStats?: PipelineProcessingStats | null,
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


export function buildProductDepositWorkbenchDraft(
  workbench: ProductDepositReadWorkbench,
): ProductActivityRecordDraft {
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
      source: 'deposit-read-workbench',
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

export function buildProductReadMeasurementDraft(
  needState: ProductReadScenariosState,
  scenarioOverride?: ProductReadScenariosState['scenarios'][number],
  options?: { sourceRevision?: ProductSourceRevision | null },
): ProductActivityRecordDraft {
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
      source: 'read-scenario-panel',
      scenarioId: scenario.id,
      scenarioLabel: scenario.label,
      scenarioRepository: scenario.repo,
      scenarioProfile: scenario.profile,
    },
  };
}

export function buildProductReadAdmissionDraft(
  workbench: ProductDepositReadWorkbench,
): ProductActivityRecordDraft {
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
      source: 'deposit-read-workbench',
      workbench: 'read-admission',
      scenarioLabel: workbench.scenarioLabel,
      fitSearchAdmitted: true,
      readResultState: 'admitted_for_fit_search',
    },
  };
}


export function buildProductFitWorkbenchDraft(
  workbench: ProductDepositReadWorkbench,
): ProductActivityRecordDraft {
  const fitResult = buildProductFitResultState(workbench);

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
      source: 'deposit-read-workbench',
      workbench: 'fit',
      projectionPrincipal: workbench.projectionPrincipal,
      branchMode: workbench.branchMode,
      scenarioLabel: workbench.scenarioLabel,
      profileLabel: workbench.profileLabel,
      fitResultState: fitResult.resultState,
    },
  };
}

/**
 * Canonical activity-ledger source for repository anchors.
 * Must match deriveRepositoryAnchors / DEPOSIT_ACTIVITY_LEDGER_SOURCES.
 */
export const REPOSITORY_ANCHOR_CONTEXT_SOURCE = 'terminal-repository-context-panel';

export function buildProductRepositoryAnchorDraft(
  repositoryContext: RepositoryContextState & {
    /** Optional human label for the Load-anchor dropdown. */
    name?: string | null;
    /** Explicit head SHA when the UI is tracking Latest. */
    headCommitSha?: string | null;
  },
): ProductActivityRecordDraft {
  const selectedRepository = repositoryContext.selectedRepository;
  const connectionStatus = repositoryContext.connectionStatus;
  const selectedBranch =
    repositoryContext.selectedBranch || selectedRepository?.defaultBranch || 'main';
  // Prefer explicit selection, then latest-head resolution, never leave blank
  // when a head SHA is known (empty commit made Load-anchor restore fail).
  const selectedCommit =
    (typeof repositoryContext.selectedCommit === 'string' &&
    repositoryContext.selectedCommit.trim()
      ? repositoryContext.selectedCommit.trim()
      : '') ||
    (typeof repositoryContext.headCommitSha === 'string' &&
    repositoryContext.headCommitSha.trim()
      ? repositoryContext.headCommitSha.trim()
      : '') ||
    '';
  const name =
    typeof repositoryContext.name === 'string' && repositoryContext.name.trim()
      ? repositoryContext.name.trim().slice(0, 80)
      : null;
  const providerAccount =
    connectionStatus?.username || connectionStatus?.metadata?.account || selectedRepository?.owner.username || 'connected account';
  const repositoryFullName = selectedRepository?.fullName || null;
  const namedPrefix = name ? `"${name}" ` : '';

  return {
    type: 'agentic-execution:asset-pack',
    detailSection: 'transaction',
    // Stay on compose after save — opening the anchor row remounts ProductDetailStage
    // and re-plays Need/Obfuscations entrance motion.
    selectAfterRecord: false,
    // Explicit source package for buildRepoSnapshot (authoritative for save).
    sourceRevision: repositoryFullName
      ? {
          repositoryFullName,
          branch: selectedBranch,
          commit: selectedCommit || '',
        }
      : null,
    summary: `Recorded repository anchor ${namedPrefix}for ${repositoryFullName || 'the current Bitcode supply boundary'}.`,
    output: {
      repositoryAnchor: {
        name,
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
      source: REPOSITORY_ANCHOR_CONTEXT_SOURCE,
      provider: repositoryContext.provider,
      providerAccount,
      inventorySource: repositoryContext.inventorySource || null,
      repositoryFullName,
      sourceBranch: selectedRepository ? selectedBranch : null,
      sourceCommit: selectedRepository ? selectedCommit || null : null,
      repositoryAnchorName: name,
    },
  };
}

/**
 * V48-Gate3-F13/F18: Obfuscations anchoring. Mirrors the repository anchor
 * pattern (`buildProductRepositoryAnchorDraft`) so a depositor can save the
 * current Obfuscations configuration into the activity ledger and reload it
 * on a later run — for the same repository, or a fresh one. An optional
 * display `name` labels the anchor in the Load-anchor dropdown; the source-path
 * hints and protected-IP exclusions ride along so the dropdown sub-text can
 * show their counts and so a reload restores the full steering package.
 */
export function buildProductObfuscationsAnchorDraft(input: {
  obfuscations: string;
  /** Optional human label for the anchor (shown in the Load-anchor dropdown). */
  name?: string | null;
  repositoryFullName?: string | null;
  permissibleSources?: string[] | null;
  impermissibleSources?: string[] | null;
}): ProductActivityRecordDraft {
  const text = input.obfuscations.trim();
  const name =
    typeof input.name === 'string' && input.name.trim()
      ? input.name.trim().slice(0, 80)
      : null;
  const permissibleSources = normalizeObfuscationsAnchorPaths(input.permissibleSources);
  const impermissibleSources = normalizeObfuscationsAnchorPaths(
    input.impermissibleSources,
  );
  const namedPrefix = name ? `"${name}" ` : '';
  const repoSuffix = input.repositoryFullName
    ? ` (last used with ${input.repositoryFullName})`
    : '';
  return {
    type: 'agentic-execution:asset-pack',
    detailSection: 'transaction',
    // Stay on compose after save (same as Need / repository anchors).
    selectAfterRecord: false,
    summary: `Anchored ${namedPrefix}Obfuscations configuration${repoSuffix}.`,
    output: {
      obfuscationsAnchor: {
        text,
        name,
        permissibleSources,
        impermissibleSources,
        permissibleSourceCount: permissibleSources.length,
        impermissibleSourceCount: impermissibleSources.length,
        repositoryFullName: input.repositoryFullName || null,
        anchoredAt: new Date().toISOString(),
      },
    },
    context: {
      source: 'deposit-obfuscations-anchor',
      repositoryFullName: input.repositoryFullName || null,
      // Source-safe label + counts only — never the full Obfuscations body.
      obfuscationsAnchorName: name,
      permissibleSourceCount: permissibleSources.length,
      impermissibleSourceCount: impermissibleSources.length,
    },
  };
}

/** Normalize path selections for Need anchors (same rules as Obfuscations). */
export const normalizeNeedAnchorPaths = normalizeObfuscationsAnchorPaths;

/**
 * Plain-text dropdown sub-text for a Need anchor (search / a11y / tests):
 * `[Clipped Need Text] | [# relevant paths] | [# irrelevant paths]`.
 */
export function formatNeedAnchorDescription(input: {
  text: string;
  relevantPaths?: string[] | null;
  irrelevantPaths?: string[] | null;
  textClipLength?: number;
}): string {
  const clipAt = Math.max(8, input.textClipLength ?? 40);
  const raw = typeof input.text === 'string' ? input.text.trim().replace(/\s+/g, ' ') : '';
  const clipped =
    raw.length > clipAt ? `${raw.slice(0, clipAt).trimEnd()}…` : raw || '(empty)';
  const relevantCount = normalizeNeedAnchorPaths(input.relevantPaths).length;
  const irrelevantCount = normalizeNeedAnchorPaths(input.irrelevantPaths).length;
  const relevantLabel = `${relevantCount} relevant ${
    relevantCount === 1 ? 'path' : 'paths'
  }`;
  const irrelevantLabel = `${irrelevantCount} irrelevant ${
    irrelevantCount === 1 ? 'path' : 'paths'
  }`;
  return `${clipped} | ${relevantLabel} | ${irrelevantLabel}`;
}

/**
 * Need anchoring — deposit Obfuscations twin. Saves Need text + Relevant /
 * Irrelevant path selections into the activity ledger so a reader can reload
 * a previous Need configuration on a later compose.
 */
export function buildProductNeedAnchorDraft(input: {
  need: string;
  /** Optional human label for the anchor (shown in the Load-anchor dropdown). */
  name?: string | null;
  repositoryFullName?: string | null;
  relevantPaths?: string[] | null;
  irrelevantPaths?: string[] | null;
}): ProductActivityRecordDraft {
  const text = input.need.trim();
  const name =
    typeof input.name === 'string' && input.name.trim()
      ? input.name.trim().slice(0, 80)
      : null;
  const relevantPaths = normalizeNeedAnchorPaths(input.relevantPaths);
  const irrelevantPaths = normalizeNeedAnchorPaths(input.irrelevantPaths);
  const namedPrefix = name ? `"${name}" ` : '';
  const repoSuffix = input.repositoryFullName
    ? ` (last used with ${input.repositoryFullName})`
    : '';
  return {
    type: 'agentic-execution:asset-pack',
    detailSection: 'transaction',
    // Stay on Need compose after save — reads has no activity-ledger detail pane.
    selectAfterRecord: false,
    summary: `Anchored ${namedPrefix}Need configuration${repoSuffix}.`,
    output: {
      needAnchor: {
        text,
        name,
        relevantPaths,
        irrelevantPaths,
        relevantPathCount: relevantPaths.length,
        irrelevantPathCount: irrelevantPaths.length,
        repositoryFullName: input.repositoryFullName || null,
        anchoredAt: new Date().toISOString(),
      },
    },
    context: {
      source: 'read-need-anchor',
      repositoryFullName: input.repositoryFullName || null,
      // Source-safe label + counts only — never the full Need body.
      needAnchorName: name,
      relevantPathCount: relevantPaths.length,
      irrelevantPathCount: irrelevantPaths.length,
    },
  };
}


function readExecutionErrorMessage(error: unknown): string | null {
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (!error || typeof error !== 'object' || Array.isArray(error)) return null;
  const record = error as Record<string, unknown>;
  for (const key of ['message', 'error', 'reason'] as const) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function mapExecutionHistoryRunToWorkspaceRun(run: PipelineExecution): WorkspaceRun {
  const repoSnapshot = run.repo_snapshot || run.asset_pack_completion?.repoSnapshot || null;
  const context =
    parseExecutionContext(run.context) ||
    parseExecutionContext((run as { metadata?: unknown }).metadata);
  // Always rebuild proof from status+context+output so budget-partial recovery
  // never keeps a stale "AssetPack bundle ready" from a status-only summary.
  const rebuiltAgentic = buildAgenticExecutionSummary({
    type: run.type,
    status: run.status,
    context,
    output: run.output,
  });
  const agenticExecution = run.agentic_execution
    ? { ...run.agentic_execution, proofStatus: rebuiltAgentic.proofStatus }
    : rebuiltAgentic;
  const contextString = (key: string) => {
    const value = context?.[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  };
  const errorMessage = readExecutionErrorMessage((run as { error?: unknown }).error);
  const statusLower = String(run.status || '').toLowerCase();
  const failureSummary =
    statusLower === 'failed' ||
    statusLower === 'interrupted' ||
    statusLower === 'cancelled'
      ? errorMessage
      : null;
  const summary =
    run.summary ||
    run.asset_pack_completion?.summary ||
    run.asset_pack_completion?.assetPackSynthesisArtifacts?.summary ||
    run.asset_pack_completion?.writtenAssets?.summary ||
    run.asset_pack_completion?.settleDelivery?.summary ||
    run.asset_pack_completion?.deliveryMechanism?.summary ||
    contextString('summary') ||
    failureSummary ||
    null;
  const contextSource = resolveContextSource(context, run, summary);
  const isLedgerAnchor =
    contextSource === 'terminal-repository-context-panel' ||
    contextSource === 'repository-context-panel' ||
    contextSource === 'deposit-obfuscations-anchor' ||
    contextSource === 'read-need-anchor';
  // Anchors are completed history bookmarks — never present as "AssetPack bundle ready".
  const proofStatus = isLedgerAnchor
    ? contextSource === 'deposit-obfuscations-anchor'
      ? 'Obfuscations anchor'
      : contextSource === 'read-need-anchor'
        ? 'Need anchor'
        : 'Repository anchor'
    : agenticExecution.proofStatus;
  const closureFocus = isLedgerAnchor
    ? 'Activity ledger bookmark'
    : agenticExecution.closureFocus;

  return {
    id: run.id,
    created_at: run.created_at,
    status: run.status,
    type: agenticExecution.canonicalType,
    agentic_execution: isLedgerAnchor
      ? {
          ...agenticExecution,
          proofStatus,
          closureFocus,
          label:
            contextSource === 'deposit-obfuscations-anchor'
              ? 'Obfuscations anchor'
              : contextSource === 'read-need-anchor'
                ? 'Need anchor'
                : 'Repository anchor',
        }
      : agenticExecution,
    sourceModel: 'execution-history',
    errorMessage,
    summary,
    repository:
      repoSnapshot
        ? `${repoSnapshot.org}/${repoSnapshot.repo}`
        : contextString('repositoryFullName') ||
          readNestedString(run.output, ['repositoryAnchor', 'repository', 'fullName']) ||
          readNestedString(run.output, ['repositoryAnchor', 'sourceSelection', 'repository']),
    branch:
      repoSnapshot?.branch ||
      contextString('sourceBranch') ||
      readNestedString(run.output, ['repositoryAnchor', 'repository', 'selectedBranch']) ||
      readNestedString(run.output, ['repositoryAnchor', 'sourceSelection', 'branch']),
    sourceCommit:
      repoSnapshot?.commit ||
      contextString('sourceCommit') ||
      readNestedString(run.output, ['repositoryAnchor', 'repository', 'selectedCommit']) ||
      readNestedString(run.output, ['repositoryAnchor', 'sourceSelection', 'commit']),
    repositoryAnchorName:
      contextString('repositoryAnchorName') ||
      readNestedString(run.output, ['repositoryAnchor', 'name']),
    contextSource,
    contextWorkbench: contextString('workbench'),
    candidateAssetId: contextString('candidateAssetId'),
    obfuscationsAnchorText: readNestedString(run.output, ['obfuscationsAnchor', 'text']),
    obfuscationsAnchorName:
      readNestedString(run.output, ['obfuscationsAnchor', 'name']) ||
      contextString('obfuscationsAnchorName'),
    // Prefer renamed keys; fall back to pre-rename anchor payloads still on disk.
    obfuscationsAnchorPermissibleSources: (() => {
      const next = readNestedStringArray(run.output, [
        'obfuscationsAnchor',
        'permissibleSources',
      ]);
      return next.length
        ? next
        : readNestedStringArray(run.output, ['obfuscationsAnchor', 'sourcePathHints']);
    })(),
    obfuscationsAnchorImpermissibleSources: (() => {
      const next = readNestedStringArray(run.output, [
        'obfuscationsAnchor',
        'impermissibleSources',
      ]);
      return next.length
        ? next
        : readNestedStringArray(run.output, [
            'obfuscationsAnchor',
            'protectedIpExclusions',
          ]);
    })(),
    needAnchorText: readNestedString(run.output, ['needAnchor', 'text']),
    needAnchorName:
      readNestedString(run.output, ['needAnchor', 'name']) ||
      contextString('needAnchorName'),
    needAnchorRelevantPaths: readNestedStringArray(run.output, [
      'needAnchor',
      'relevantPaths',
    ]),
    needAnchorIrrelevantPaths: readNestedStringArray(run.output, [
      'needAnchor',
      'irrelevantPaths',
    ]),
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
      contextSource === 'deposit-option-synthesis'
        ? 'deposit'
        : contextString('synthesisMode') === 'read' || contextSource === 'read-need-anchor'
          ? 'read'
          : isLedgerAnchor
            ? 'deposit'
            : agenticExecution.lens,
    itemCount: run.items?.length || 0,
    tokenTotal:
      run.processing_stats?.tokens?.total ?? run.asset_pack_completion?.processingStats?.tokens?.total ?? null,
    measuredBtd: run.processing_stats?.measuredBtd ?? run.asset_pack_completion?.processingStats?.measuredBtd ?? null,
    btcFeeUsdEquivalent: run.processing_stats?.btcFeeUsdEquivalent ?? run.asset_pack_completion?.processingStats?.btcFeeUsdEquivalent ?? null,
    averageLatencyMs:
      run.processing_stats?.averageLatencyMs ?? run.asset_pack_completion?.processingStats?.averageLatencyMs ?? null,
    proofStatus,
    closureFocus,
  };
}

export function upsertWorkspaceRun(runs: WorkspaceRun[], nextRun: WorkspaceRun) {
  const dedupedRuns = [nextRun, ...runs.filter((run) => run.id !== nextRun.id)];
  return dedupedRuns.sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );
}

export async function readProductRouteError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as Record<string, unknown>;
    const message = typeof payload.error === 'string' ? payload.error : payload.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  } catch {}

  return fallback;
}
