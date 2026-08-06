/**
 * Deposit option history hydrate retry — false "options not found" race.
 */

import {
  extractDepositOptionSynthesisFromEvents,
  extractDepositOptionSynthesisFromExecution,
  fetchDepositOptionSynthesisWithRetry,
  isDepositProductTerminalForOptions,
  isRecoverableMissingOptionsError,
  shouldRetryMissingDepositOptions,
} from "@/components/deposits/models/deposit-synthesis-options-hydrate";

describe("deposit-synthesis-options-hydrate", () => {
  it("retries completed rows until depositOptionSynthesis appears", async () => {
    let calls = 0;
    const fetchImpl = jest.fn(async () => {
      calls += 1;
      if (calls < 3) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            run: {
              status: "completed",
              context: { source: "deposit-option-synthesis" },
              output: { summary: "still writing" },
            },
          }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          run: {
            status: "completed",
            context: { source: "deposit-option-synthesis" },
            output: {
              depositOptionSynthesis: {
                options: [{ optionId: "o1" }],
              },
              reviewProjections: [],
            },
          },
        }),
      } as Response;
    });

    const result = await fetchDepositOptionSynthesisWithRetry({
      runId: "run-1",
      maxAttempts: 5,
      delayMs: 0,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleepImpl: async () => undefined,
    });

    expect(result.kind).toBe("found");
    if (result.kind === "found") {
      expect(
        (result.synthesis as { options: unknown[] }).options,
      ).toHaveLength(1);
    }
    expect(calls).toBe(3);
  });

  it("does not spin on failed rows without synthesis", async () => {
    let calls = 0;
    const fetchImpl = jest.fn(async () => {
      calls += 1;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          run: {
            status: "failed",
            context: { source: "deposit-option-synthesis" },
            output: { summary: "host died" },
          },
        }),
      } as Response;
    });

    const result = await fetchDepositOptionSynthesisWithRetry({
      runId: "run-fail",
      maxAttempts: 5,
      delayMs: 0,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      sleepImpl: async () => undefined,
    });

    expect(result.kind).toBe("missing");
    expect(calls).toBe(1);
  });

  it("shouldRetryMissingDepositOptions only for soft terminal states", () => {
    expect(
      shouldRetryMissingDepositOptions({ status: "completed", hasSynthesis: false }),
    ).toBe(true);
    expect(
      shouldRetryMissingDepositOptions({ status: "failed", hasSynthesis: false }),
    ).toBe(false);
    expect(
      shouldRetryMissingDepositOptions({ status: "completed", hasSynthesis: true }),
    ).toBe(false);
  });

  it("recognizes recoverable false-fail banners", () => {
    expect(
      isRecoverableMissingOptionsError(
        "Synthesized options were not found for this run.",
      ),
    ).toBe(true);
    expect(isRecoverableMissingOptionsError("host budget exceeded")).toBe(
      false,
    );
  });

  it("extracts synthesis from execution.output without network", () => {
    const found = extractDepositOptionSynthesisFromExecution({
      id: "r1",
      output: {
        depositOptionSynthesis: { options: [{ optionId: "a" }] },
        reviewProjections: [{ optionId: "a" }],
      },
    });
    expect(found?.synthesis).toEqual({ options: [{ optionId: "a" }] });
    expect(found?.reviewProjections).toHaveLength(1);
    expect(extractDepositOptionSynthesisFromExecution({ output: {} })).toBeNull();
  });

  it("extracts synthesis only from product-terminal completion events", () => {
    const earlyNoise = extractDepositOptionSynthesisFromEvents([
      { event: { type: "completion", message: "finish store noise" } },
    ]);
    expect(earlyNoise).toBeNull();

    const product = extractDepositOptionSynthesisFromEvents([
      { event: { type: "status", message: "working" } },
      {
        event: {
          type: "completion",
          depositOptionsReady: true,
          depositOptionSynthesis: { options: [1, 2, 3] },
          reviewProjections: [],
        },
      },
    ]);
    expect(product?.synthesis).toEqual({ options: [1, 2, 3] });
  });

  it("product terminal requires row status or depositOptionsReady completion", () => {
    expect(
      isDepositProductTerminalForOptions({
        events: [{ event: { type: "completion", message: "noise" } }],
      }),
    ).toBe(false);
    expect(
      isDepositProductTerminalForOptions({
        events: [
          {
            event: {
              type: "completion",
              depositOptionsReady: true,
            },
          },
        ],
      }),
    ).toBe(true);
    expect(
      isDepositProductTerminalForOptions({ rowStatus: "completed" }),
    ).toBe(true);
  });
});
