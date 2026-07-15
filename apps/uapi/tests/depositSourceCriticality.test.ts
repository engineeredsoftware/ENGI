/**
 * Unit tests for deposit source-criticality signal construction.
 */

import { buildDepositSourceCriticalitySignals } from "@/components/deposits/models/deposit-source-criticality";

describe("buildDepositSourceCriticalitySignals", () => {
  it("always includes sub-critical depositor intent", () => {
    const signals = buildDepositSourceCriticalitySignals([]);
    expect(signals).toHaveLength(1);
    expect(signals[0].id).toBe("depositor-sub-critical-intent");
  });

  it("adds a warning when permissible sources look sensitive", () => {
    const signals = buildDepositSourceCriticalitySignals([
      "src/wallet/keys.ts",
    ]);
    expect(signals.map((s) => s.id)).toEqual([
      "depositor-sub-critical-intent",
      "source-path-sensitive-scope-warning",
    ]);
  });

  it("does not warn for ordinary source paths", () => {
    const signals = buildDepositSourceCriticalitySignals([
      "src/components/Button.tsx",
    ]);
    expect(signals).toHaveLength(1);
  });
});
