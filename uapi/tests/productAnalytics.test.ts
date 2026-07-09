/**
 * Product analytics fan-out — the one audited path for custom analytics
 * events (V48 Gate 3). Every event reaches BOTH stacks (Vercel Web Analytics
 * + GA4) under the same name, payloads pass through flat and unmodified, and
 * a failing tracker never breaks the product surface.
 */
import { track } from "@vercel/analytics";
import { trackEvent } from "@bitcode/google-analytics";

import { trackProductEvent } from "@/lib/product-analytics";

jest.mock("@vercel/analytics", () => ({ track: jest.fn() }));
jest.mock("@bitcode/google-analytics", () => ({ trackEvent: jest.fn() }));

const mockTrack = track as jest.Mock;
const mockTrackEvent = trackEvent as jest.Mock;

describe("trackProductEvent", () => {
  beforeEach(() => {
    mockTrack.mockReset();
    mockTrackEvent.mockReset();
  });

  it("fans a product event out to Vercel Web Analytics and GA4 under one name", () => {
    trackProductEvent({
      name: "deposit_synthesis_dispatched",
      data: {
        hasObfuscations: true,
        forcedInclusionCount: 1,
        forcedExclusionCount: 2,
        demandSignalCount: 3,
      },
    });

    expect(mockTrack).toHaveBeenCalledWith("deposit_synthesis_dispatched", {
      hasObfuscations: true,
      forcedInclusionCount: 1,
      forcedExclusionCount: 2,
      demandSignalCount: 3,
    });
    expect(mockTrackEvent).toHaveBeenCalledWith("deposit_synthesis_dispatched", {
      event_category: "product",
      hasObfuscations: true,
      forcedInclusionCount: 1,
      forcedExclusionCount: 2,
      demandSignalCount: 3,
    });
  });

  it("still reports to GA4 when the Vercel tracker throws, and never throws itself", () => {
    mockTrack.mockImplementation(() => {
      throw new Error("script blocked");
    });

    expect(() =>
      trackProductEvent({
        name: "deposit_admission",
        data: { selectedCount: 2, admittedCount: 1 },
      }),
    ).not.toThrow();

    expect(mockTrackEvent).toHaveBeenCalledWith("deposit_admission", {
      event_category: "product",
      selectedCount: 2,
      admittedCount: 1,
    });
  });

  it("swallows a GA4 tracker failure as well", () => {
    mockTrackEvent.mockImplementation(() => {
      throw new Error("gtag exploded");
    });

    expect(() =>
      trackProductEvent({
        name: "deposit_synthesis_failed",
        data: { stage: "dispatch", durationMs: null },
      }),
    ).not.toThrow();
    expect(mockTrack).toHaveBeenCalledWith("deposit_synthesis_failed", {
      stage: "dispatch",
      durationMs: null,
    });
  });
});
