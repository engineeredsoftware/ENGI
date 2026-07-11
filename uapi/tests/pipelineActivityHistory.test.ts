/**
 * Pipeline activity history helpers (relocated from Terminal).
 */
import {
  normalizeObfuscationsAnchorPaths,
  upsertWorkspaceRun,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import { MOCK_RUNS, type WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

describe("pipeline-activity-history", () => {
  it("normalizes obfuscations path anchors", () => {
    expect(normalizeObfuscationsAnchorPaths(["  a/b  ", "", "a/b", "c"])).toEqual(["a/b", "c"]);
  });

  it("upserts workspace runs by id", () => {
    const base = MOCK_RUNS.slice(0, 2) as WorkspaceRun[];
    const next = { ...base[0], summary: "updated" } as WorkspaceRun;
    const result = upsertWorkspaceRun(base, next);
    expect(result.find((r) => r.id === base[0].id)?.summary).toBe("updated");
    expect(result).toHaveLength(2);
  });
});
