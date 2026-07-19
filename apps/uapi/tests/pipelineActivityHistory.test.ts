/**
 * Pipeline activity history helpers (relocated from product).
 */
import {
  buildProductNeedAnchorDraft,
  buildProductObfuscationsAnchorDraft,
  buildProductRepositoryAnchorDraft,
  mapExecutionHistoryRunToWorkspaceRun,
  normalizeNeedAnchorPaths,
  normalizeObfuscationsAnchorPaths,
  REPOSITORY_ANCHOR_CONTEXT_SOURCE,
  upsertWorkspaceRun,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import { MOCK_RUNS, type WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type { PipelineExecution } from "@/types/api";

describe("pipeline-activity-history", () => {
  it("normalizes obfuscations path anchors", () => {
    expect(normalizeObfuscationsAnchorPaths(["  a/b  ", "", "a/b", "c"])).toEqual(["a/b", "c"]);
  });

  it("normalizes need path anchors", () => {
    expect(normalizeNeedAnchorPaths(["  a/b  ", "", "a/b", "c"])).toEqual([
      "a/b",
      "c",
    ]);
  });

  it("builds need anchor drafts with read-need-anchor source", () => {
    const draft = buildProductNeedAnchorDraft({
      need: "add retries",
      name: "Resilience",
      relevantPaths: ["src/http.ts"],
      irrelevantPaths: [],
    });
    expect(draft.context?.source).toBe("read-need-anchor");
    expect(draft.selectAfterRecord).toBe(false);
  });

  it("builds repository anchors that stay on compose and use the ledger source key", () => {
    const draft = buildProductRepositoryAnchorDraft({
      provider: "github",
      connectionStatus: null,
      inventorySource: null,
      repositories: [],
      selectedRepository: {
        id: 1,
        fullName: "acme/app",
        name: "app",
        owner: { username: "acme" },
        defaultBranch: "main",
        private: false,
        language: null,
        topics: [],
      } as any,
      selectedBranch: "version/v48",
      selectedCommit: "abcdef1234567890",
      name: "v48 tip",
    });
    expect(draft.context?.source).toBe(REPOSITORY_ANCHOR_CONTEXT_SOURCE);
    expect(draft.context?.source).toBe("terminal-repository-context-panel");
    expect(draft.selectAfterRecord).toBe(false);
    expect(draft.context?.repositoryFullName).toBe("acme/app");
    expect(draft.context?.sourceBranch).toBe("version/v48");
    expect(draft.context?.sourceCommit).toBe("abcdef1234567890");
    expect(draft.context?.repositoryAnchorName).toBe("v48 tip");
    expect(draft.sourceRevision).toMatchObject({
      repositoryFullName: "acme/app",
      branch: "version/v48",
      commit: "abcdef1234567890",
    });
    expect(draft.summary).toContain('"v48 tip"');
  });

  it("builds obfuscations anchors without selecting after record", () => {
    const draft = buildProductObfuscationsAnchorDraft({
      obfuscations: "mask secrets",
      name: "Secrets",
    });
    expect(draft.context?.source).toBe("deposit-obfuscations-anchor");
    expect(draft.selectAfterRecord).toBe(false);
  });

  it("upserts workspace runs by id", () => {
    const base = MOCK_RUNS.slice(0, 2) as WorkspaceRun[];
    const next = { ...base[0], summary: "updated" } as WorkspaceRun;
    const result = upsertWorkspaceRun(base, next);
    expect(result.find((r) => r.id === base[0].id)?.summary).toBe("updated");
    expect(result).toHaveLength(2);
  });

  it("maps repository anchors even when context is a JSON string", () => {
    const run = mapExecutionHistoryRunToWorkspaceRun({
      id: "anchor-json",
      created_at: "2026-07-19T00:00:00.000Z",
      status: "completed",
      type: "agentic-execution:asset-pack",
      items: [],
      summary: "Recorded repository anchor for acme/app.",
      context: JSON.stringify({
        source: "terminal-repository-context-panel",
        repositoryFullName: "acme/app",
        sourceBranch: "main",
        sourceCommit: "deadbeef",
      }),
    } as PipelineExecution);

    expect(run.contextSource).toBe("terminal-repository-context-panel");
    expect(run.repository).toBe("acme/app");
    expect(run.branch).toBe("main");
    expect(run.sourceCommit).toBe("deadbeef");
    expect(run.proofStatus).toBe("Repository anchor");
  });

  it("recovers repository anchors from summary when context.source is missing", () => {
    const run = mapExecutionHistoryRunToWorkspaceRun({
      id: "anchor-summary",
      created_at: "2026-07-19T00:00:00.000Z",
      status: "completed",
      type: "agentic-execution:asset-pack",
      items: [],
      summary: "Recorded repository anchor for acme/app.",
      context: { repositoryFullName: "acme/app" },
    } as PipelineExecution);

    expect(run.contextSource).toBe("terminal-repository-context-panel");
    expect(run.proofStatus).toBe("Repository anchor");
  });
});
