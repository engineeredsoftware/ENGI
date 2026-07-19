/**
 * Unit tests for deposit activity-ledger pure projections.
 */

import {
  DEPOSIT_ACTIVITY_LEDGER_SOURCES,
  deriveObfuscationsAnchors,
  deriveRepositoryAnchors,
  filterPipelineTableRuns,
  hasDepositoryReadbackFromRuns,
  hasSubmittedDepositForSource,
  isActivityLedgerContextSource,
} from "@/components/deposits/models/deposit-activity-ledger";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

function run(partial: Partial<WorkspaceRun> & { id: string }): WorkspaceRun {
  return {
    created_at: "2026-07-01T00:00:00.000Z",
    status: "completed",
    ...partial,
  } as WorkspaceRun;
}

describe("deposit-activity-ledger", () => {
  it("filters activity-ledger sources out of pipeline table runs", () => {
    const runs = [
      run({ id: "pipe-1", contextSource: "deposit-option-synthesis" }),
      run({ id: "anchor-1", contextSource: "deposit-obfuscations-anchor" }),
      run({ id: "anchor-2", contextSource: "terminal-repository-context-panel" }),
      run({
        id: "anchor-summary",
        summary: "Recorded repository anchor for acme/app.",
      }),
      run({ id: "pipe-2" }),
    ];
    const filtered = filterPipelineTableRuns(runs);
    expect(filtered.map((r) => r.id)).toEqual(["pipe-1", "pipe-2"]);
    expect(isActivityLedgerContextSource("deposit-obfuscations-anchor")).toBe(
      true,
    );
    expect(DEPOSIT_ACTIVITY_LEDGER_SOURCES.size).toBe(3);
  });

  it("derives full source-package anchors (repo·branch·commit), newest first", () => {
    const runs = [
      run({
        id: "old",
        contextSource: "terminal-repository-context-panel",
        repository: "acme/app",
        branch: "main",
        sourceCommit: "aaa",
        created_at: "2026-07-01T00:00:00.000Z",
      }),
      run({
        id: "new",
        contextSource: "terminal-repository-context-panel",
        repository: "acme/app",
        branch: "dev",
        sourceCommit: "bbb",
        created_at: "2026-07-02T00:00:00.000Z",
      }),
      // Same full package as "new" but older — dedupe keeps newest id only.
      run({
        id: "new-duplicate",
        contextSource: "terminal-repository-context-panel",
        repository: "acme/app",
        branch: "dev",
        sourceCommit: "bbb",
        created_at: "2026-06-30T00:00:00.000Z",
      }),
      run({
        id: "other",
        contextSource: "terminal-repository-context-panel",
        repository: "acme/other",
        branch: "main",
        created_at: "2026-07-03T00:00:00.000Z",
      }),
      // Legacy source key still loads into the dropdown.
      run({
        id: "legacy",
        contextSource: "repository-context-panel",
        repository: "acme/legacy",
        branch: "main",
        created_at: "2026-07-04T00:00:00.000Z",
      }),
    ];
    const anchors = deriveRepositoryAnchors(runs);
    // Distinct packages for acme/app (main+aaa and dev+bbb) both remain.
    expect(anchors.map((a) => a.id)).toEqual(["legacy", "other", "new", "old"]);
    expect(anchors.find((a) => a.id === "new")).toMatchObject({
      repositoryFullName: "acme/app",
      branch: "dev",
      commit: "bbb",
      name: null,
    });
    expect(anchors.find((a) => a.id === "old")).toMatchObject({
      repositoryFullName: "acme/app",
      branch: "main",
      commit: "aaa",
      name: null,
    });
  });

  it("keeps named repository anchors distinct and recovers summary-only rows", () => {
    const runs = [
      run({
        id: "named",
        contextSource: "terminal-repository-context-panel",
        repository: "acme/app",
        branch: "main",
        sourceCommit: "aaa",
        repositoryAnchorName: "Prod tip",
        created_at: "2026-07-05T00:00:00.000Z",
      }),
      run({
        id: "unnamed-same-package",
        contextSource: "terminal-repository-context-panel",
        repository: "acme/app",
        branch: "main",
        sourceCommit: "aaa",
        created_at: "2026-07-04T00:00:00.000Z",
      }),
      run({
        id: "summary-only",
        summary: "Recorded repository anchor for acme/from-summary.",
        repository: "acme/from-summary",
        branch: "dev",
        sourceCommit: "ccc",
        created_at: "2026-07-06T00:00:00.000Z",
      }),
    ];
    const anchors = deriveRepositoryAnchors(runs);
    expect(anchors.map((a) => a.id)).toEqual([
      "summary-only",
      "named",
      "unnamed-same-package",
    ]);
    expect(anchors.find((a) => a.id === "named")?.name).toBe("Prod tip");
  });

  it("derives obfuscations anchors with dedupe and path sets", () => {
    const runs = [
      run({
        id: "a1",
        contextSource: "deposit-obfuscations-anchor",
        obfuscationsAnchorText: "hide secrets",
        obfuscationsAnchorName: "Alpha",
        obfuscationsAnchorPermissibleSources: ["src/a.ts"],
        obfuscationsAnchorImpermissibleSources: ["secrets/"],
        repository: "acme/app",
        created_at: "2026-07-02T00:00:00.000Z",
      }),
      run({
        id: "a2",
        contextSource: "deposit-obfuscations-anchor",
        obfuscationsAnchorText: "hide secrets",
        obfuscationsAnchorName: "Alpha",
        obfuscationsAnchorPermissibleSources: ["src/a.ts"],
        obfuscationsAnchorImpermissibleSources: ["secrets/"],
        created_at: "2026-07-01T00:00:00.000Z",
      }),
    ];
    const anchors = deriveObfuscationsAnchors(runs);
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toMatchObject({
      id: "a1",
      name: "Alpha",
      text: "hide secrets",
      permissibleSources: ["src/a.ts"],
      impermissibleSources: ["secrets/"],
    });
  });

  it("detects submitted deposit and depository readback", () => {
    const runs = [
      run({
        id: "d1",
        contextSource: "terminal-deposit-composer",
        repository: "acme/app",
        branch: "main",
        candidateAssetId: "pack-1",
        depositorySearchDocumentRoot: "root://doc",
      }),
    ];
    expect(hasSubmittedDepositForSource(runs, "acme/app", "main")).toBe(true);
    expect(hasSubmittedDepositForSource(runs, "acme/other", "main")).toBe(
      false,
    );
    expect(hasDepositoryReadbackFromRuns(runs)).toBe(true);
  });
});
