/**
 * Pure deposit activity-ledger projections from workspace runs.
 *
 * Activity-ledger rows (obfuscations / repository anchors) are stored as
 * execution-history rows but are NOT pipeline executions. They feed Load-anchor
 * UI and must be filtered out of the pipelines master table.
 */

import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type { DepositRepositoryAnchor } from "@/components/deposits/models/deposit-repository-anchor";

/** Context sources that are activity-ledger anchors, not pipeline runs. */
export const DEPOSIT_ACTIVITY_LEDGER_SOURCES = new Set([
  "deposit-obfuscations-anchor",
  "terminal-repository-context-panel",
  // Legacy alias written by older repository-anchor drafts.
  "repository-context-panel",
]);

/**
 * Ledger rows that are not SDIVF synthesis pipelines. They must not replace
 * the synthesis detail surface (telemetry + option cards) when selected.
 * Admission receipts link back via context.synthesisRunId.
 */
export const DEPOSIT_NON_SYNTHESIS_SOURCES = new Set([
  ...DEPOSIT_ACTIVITY_LEDGER_SOURCES,
  "deposit-option-review-admission",
  "deposit-batch-admission",
  "deposit-option-anchor",
  "deposit-option-review",
]);

export type DepositObfuscationsAnchor = {
  id: string;
  name: string | null;
  text: string;
  permissibleSources: string[];
  impermissibleSources: string[];
  repositoryFullName: string | null;
  createdAt: string;
};

/**
 * True when a workspace run is an activity-ledger bookmark (not a pipeline).
 * Prefers contextSource; falls back to summary / anchor payload fields.
 */
export function isActivityLedgerRun(run: WorkspaceRun | null | undefined): boolean {
  if (!run) return false;
  if (run.contextSource && DEPOSIT_ACTIVITY_LEDGER_SOURCES.has(run.contextSource)) {
    return true;
  }
  if (run.obfuscationsAnchorText || run.needAnchorText) return true;
  if (run.summary && /recorded repository anchor/i.test(run.summary)) return true;
  if (run.summary && /anchored .+obfuscations/i.test(run.summary)) return true;
  if (run.proofStatus === 'Repository anchor' || run.proofStatus === 'Obfuscations anchor') {
    return true;
  }
  return false;
}

/** True when a row is a deposit synthesis SDIVF pipeline (not admit/anchor). */
export function isDepositSynthesisPipelineRun(
  run: WorkspaceRun | null | undefined,
): boolean {
  if (!run) return false;
  if (isActivityLedgerRun(run)) return false;
  const source = run.contextSource || "";
  if (source && DEPOSIT_NON_SYNTHESIS_SOURCES.has(source)) return false;
  if (source === "deposit-option-synthesis") return true;
  // Legacy / thin rows: agentic deposit executions without explicit source.
  if (String(run.type || "").includes("deposit") || String(run.type || "").includes("asset-pack")) {
    // Exclude pure admission pipeline_type labels if present.
    if (String(run.type || "").includes("admission")) return false;
    return true;
  }
  return !source;
}

/** Pipeline-table runs only — exclude anchors and admission receipts. */
export function filterPipelineTableRuns(liveRuns: WorkspaceRun[]): WorkspaceRun[] {
  return liveRuns.filter((run) => isDepositSynthesisPipelineRun(run));
}

/**
 * Resolve which run id should open the synthesis workbench.
 * Admission rows redirect to their parent synthesisRunId when present.
 */
export function resolveDepositDetailRunId(run: WorkspaceRun | null | undefined): string | null {
  if (!run?.id) return null;
  if (
    run.contextSource &&
    DEPOSIT_NON_SYNTHESIS_SOURCES.has(run.contextSource) &&
    run.synthesisRunId
  ) {
    return run.synthesisRunId;
  }
  return run.id;
}

export function isActivityLedgerContextSource(
  contextSource: string | null | undefined,
): boolean {
  return Boolean(
    contextSource && DEPOSIT_ACTIVITY_LEDGER_SOURCES.has(contextSource),
  );
}

/**
 * V48-Gate3-F17: previously anchored full source packages (repository · branch
 * · commit · optional name), newest first. Named anchors keep a separate slot
 * even when the package matches an unnamed one.
 */
const REPOSITORY_ANCHOR_SOURCES = new Set([
  "terminal-repository-context-panel",
  "repository-context-panel",
]);

function repositoryAnchorPackageKey(run: WorkspaceRun): string {
  const repository = run.repository || "";
  const branch = run.branch || "";
  const commit = run.sourceCommit || "";
  const name =
    typeof run.repositoryAnchorName === "string"
      ? run.repositoryAnchorName.trim()
      : "";
  return `${repository}\u0000${branch}\u0000${commit}\u0000${name}`;
}

function isRepositoryAnchorRun(run: WorkspaceRun): boolean {
  if (run.contextSource && REPOSITORY_ANCHOR_SOURCES.has(run.contextSource)) {
    return Boolean(run.repository);
  }
  // Recover rows that lost context.source but still look like repo anchors.
  if (run.summary && /recorded repository anchor/i.test(run.summary)) {
    return Boolean(run.repository);
  }
  return false;
}

export function deriveRepositoryAnchors(
  liveRuns: WorkspaceRun[],
): DepositRepositoryAnchor[] {
  const newestByPackage = new Map<string, WorkspaceRun>();
  for (const run of liveRuns) {
    if (!isRepositoryAnchorRun(run) || !run.repository) continue;
    const packageKey = repositoryAnchorPackageKey(run);
    const existing = newestByPackage.get(packageKey);
    if (!existing || new Date(run.created_at) > new Date(existing.created_at)) {
      newestByPackage.set(packageKey, run);
    }
  }
  return Array.from(newestByPackage.values())
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .map((run) => ({
      id: run.id,
      repositoryFullName: run.repository as string,
      branch: run.branch || null,
      commit: run.sourceCommit || null,
      name:
        typeof run.repositoryAnchorName === "string" &&
        run.repositoryAnchorName.trim()
          ? run.repositoryAnchorName.trim()
          : null,
    }));
}

/**
 * V48-Gate3-F13/F18: previously anchored Obfuscations configurations,
 * newest first. Dedupe by name+text+path sets so differently named saves of
 * the same body both remain selectable.
 */
export function deriveObfuscationsAnchors(
  liveRuns: WorkspaceRun[],
): DepositObfuscationsAnchor[] {
  const seen = new Set<string>();
  const anchors: DepositObfuscationsAnchor[] = [];
  for (const run of [...liveRuns].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )) {
    if (
      run.contextSource !== "deposit-obfuscations-anchor" ||
      !run.obfuscationsAnchorText
    ) {
      continue;
    }
    const name =
      typeof run.obfuscationsAnchorName === "string" &&
      run.obfuscationsAnchorName.trim()
        ? run.obfuscationsAnchorName.trim()
        : null;
    const permissibleSources = Array.isArray(run.obfuscationsAnchorPermissibleSources)
      ? run.obfuscationsAnchorPermissibleSources.filter(
          (path): path is string =>
            typeof path === "string" && path.trim().length > 0,
        )
      : [];
    const impermissibleSources = Array.isArray(run.obfuscationsAnchorImpermissibleSources)
      ? run.obfuscationsAnchorImpermissibleSources.filter(
          (path): path is string =>
            typeof path === "string" && path.trim().length > 0,
        )
      : [];
    const dedupeKey = `${name || ""}\u0000${run.obfuscationsAnchorText}\u0000${permissibleSources.join(",")}\u0000${impermissibleSources.join(",")}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    anchors.push({
      id: run.id,
      name,
      text: run.obfuscationsAnchorText,
      permissibleSources,
      impermissibleSources,
      repositoryFullName: run.repository || null,
      createdAt: run.created_at,
    });
  }
  return anchors;
}

/** True when a deposit composer run for the selected repo/branch exists. */
export function hasSubmittedDepositForSource(
  liveRuns: WorkspaceRun[],
  repositoryFullName: string | null | undefined,
  branch: string | null | undefined,
): boolean {
  if (!repositoryFullName) return false;
  const selectedBranch = branch || "main";
  return liveRuns.some(
    (run) =>
      run.contextSource === "terminal-deposit-composer" &&
      run.repository === repositoryFullName &&
      run.branch === selectedBranch &&
      Boolean(run.candidateAssetId),
  );
}

/** True when any deposit composer run carries depository/compensation readback. */
export function hasDepositoryReadbackFromRuns(
  liveRuns: WorkspaceRun[],
): boolean {
  return liveRuns.some(
    (run) =>
      run.contextSource === "terminal-deposit-composer" &&
      Boolean(
        run.depositorySearchDocumentRoot ||
          run.vectorDocumentRoot ||
          run.compensationPreviewRoot,
      ),
  );
}
