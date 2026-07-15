/**
 * Unit tests for deposit synthesis status mapping from execution rows.
 */

import {
  adoptSelectionStatusFromRun,
  synthesisStatusFromRunRow,
} from "@/components/deposits/models/deposit-run-status";

describe("deposit-run-status", () => {
  it("maps completed rows to complete", () => {
    expect(synthesisStatusFromRunRow({ status: "completed" })).toEqual({
      status: "complete",
      error: null,
    });
  });

  it("maps interrupted rows with generic detail when no message", () => {
    const result = synthesisStatusFromRunRow({ status: "interrupted" });
    expect(result.status).toBe("failed");
    expect(result.error).toMatch(/interrupted/i);
  });

  it("adopts cancelled as failed with cancelled message", () => {
    const result = adoptSelectionStatusFromRun({ status: "cancelled" });
    expect(result.status).toBe("failed");
    expect(result.error).toMatch(/cancelled/i);
  });

  it("prefixes concrete error messages", () => {
    const result = synthesisStatusFromRunRow({
      status: "failed",
      errorMessage: "host timeout",
    });
    expect(result.error).toBe("Run failed — host timeout");
  });
});
