/**
 * Unit tests for deposit synthesis status mapping from execution rows.
 */

import {
  adoptSelectionStatusFromRun,
  isDepositSynthesisTerminalStatus,
  messageForMissingDepositOptions,
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

  it("maps partial host-budget rows to failed with operator summary", () => {
    const result = synthesisStatusFromRunRow({
      status: "partial",
      summary:
        "Partial synthesis for org/repo: Finish selection envelope not present after host budget.",
    });
    expect(result.status).toBe("failed");
    expect(result.error).toMatch(/Partial synthesis/i);
    expect(result.error).toMatch(/host budget|Large repositories/i);
    expect(result.error).not.toMatch(/options were not found/i);
  });

  it("treats partial as terminal", () => {
    expect(isDepositSynthesisTerminalStatus("partial")).toBe(true);
    expect(isDepositSynthesisTerminalStatus("completed")).toBe(true);
    expect(isDepositSynthesisTerminalStatus("running")).toBe(false);
  });

  it("prefers host budget messaging over generic options miss", () => {
    const msg = messageForMissingDepositOptions({
      status: "partial",
      summary: "Partial synthesis for advancedengineeredsoftware/Bitcode: Finish selection envelope not present after host budget.",
      hostBudgetExceeded: true,
      hostErrorMessage: "AssetPack pipeline exceeded host runtime budget of 720000ms.",
    });
    expect(msg).toMatch(/Partial synthesis/i);
    expect(msg).toMatch(/720000ms|host budget|Large repositories/i);
    expect(msg).not.toBe("Synthesized options were not found for this run.");
  });

  it("surfaces fail-closed dispatch summary without Run failed prefix", () => {
    const result = synthesisStatusFromRunRow({
      status: "failed",
      summary:
        "AssetPacksSynthesis produced zero admissible options (fail-closed): missing formal absolute measurements",
    });
    expect(result.status).toBe("failed");
    expect(result.error).toMatch(/zero admissible options/i);
    expect(result.error).not.toMatch(/^Run failed —/);
  });
});
