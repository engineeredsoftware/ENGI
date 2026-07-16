import React from "react";
import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import PacksPageClient from "@/components/packs/PacksPageClient/PacksPageClient";

const mockReplace = jest.fn();
let mockQuery = "q=rollback&type=read-need-fit-preview";

jest.mock("next/navigation", () => ({
  usePathname: () => "/packs",
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(mockQuery),
}));

const basePackPayload = {
  ok: true,
  records: [
    {
      id: "pack-activity-1",
      type: "read-need-fit-preview",
      scope: "network",
      title: "Auth rollback proof pack",
      description: "Source-safe AssetPack preview.",
      timestamp: "2026-05-28T10:00:00.000Z",
      state: "completed",
      repository: "octocat/Spoon-Knife",
      assetPackTitle: "Auth rollback proof pack",
      settlementState: "quote_ready",
      compensationState: "source_to_shares_preview_ready",
      deliveryState: "locked_until_settlement",
      repairState: "not_required",
      measurements: [
        {
          id: "measured-btd",
          label: "Measured btd",
          value: 42,
          unit: "BTD",
          root: null,
        },
      ],
      values: [
        { id: "btc-fee", label: "Btc fee", amount: 3200, unit: "sats" },
      ],
      accounting: {
        state: "settlement-accounted",
        btdRangeState: "transferred-to-reader",
        btcSettlementState: "final-settlement-observed",
        compensationState: "allocated",
        reconciliationState: "aligned",
        treasuryRouteState: "routed",
        contributorCount: 2,
        depositorCount: 2,
        finalSettlementSats: 3200,
        allocatedContributorSats: 3200,
        statementRoot: "btd-btc-accounting-root-abc",
      },
      governance: {
        state: "allowed",
        route: "/reads",
        walletState: "verified",
        spendState: "within-limit",
        depositState: "not-applicable",
        requiredDeniedActionCount: 0,
        blockerCount: 0,
        authorityRoot: "organization-authority-root-abc",
      },
      proofRoots: [
        {
          id: "settlement-root",
          label: "Settlement root",
          root: "settlement-root-def",
        },
      ],
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        interpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        sourceSnippetVisible: false,
      },
      metadata: {},
    },
  ],
  detail: {
    id: "pack-activity-1",
    type: "read-need-fit-preview",
    title: "Auth rollback proof pack",
    description: "Source-safe AssetPack preview.",
    timestamp: "2026-05-28T10:00:00.000Z",
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      sourceSnippetVisible: false,
    },
    overview: {
      state: "completed",
      scope: "network",
      repository: "octocat/Spoon-Knife",
      assetPackTitle: "Auth rollback proof pack",
    },
    measurements: [
      {
        id: "measured-btd",
        label: "Measured btd",
        value: 42,
        unit: "BTD",
        root: null,
      },
    ],
    values: [
      { id: "btc-fee", label: "Btc fee", amount: 3200, unit: "sats" },
    ],
    accounting: {
      state: "settlement-accounted",
      btdRangeState: "transferred-to-reader",
      btcSettlementState: "final-settlement-observed",
      compensationState: "allocated",
      reconciliationState: "aligned",
      treasuryRouteState: "routed",
      contributorCount: 2,
      depositorCount: 2,
      finalSettlementSats: 3200,
      allocatedContributorSats: 3200,
      statementRoot: "btd-btc-accounting-root-abc",
    },
    governance: {
      state: "allowed",
      route: "/reads",
      walletState: "verified",
      spendState: "within-limit",
      depositState: "not-applicable",
      requiredDeniedActionCount: 0,
      blockerCount: 0,
      authorityRoot: "organization-authority-root-abc",
    },
    proofRoots: [
      {
        id: "settlement-root",
        label: "Settlement root",
        root: "settlement-root-def",
      },
    ],
    states: {
      settlement: "quote_ready",
      rights: null,
      compensation: "source_to_shares_preview_ready",
      delivery: "locked_until_settlement",
      repair: "not_required",
    },
    telemetry: {
      sourceEventId: "pack-activity-1",
      sourceKind: "execution",
      sourceChannel: "system-surface",
    },
    metadata: {},
  },
  summary: {
    total: 1,
    types: { "read-need-fit-preview": 1 },
    states: { completed: 1 },
    repositories: ["octocat/Spoon-Knife"],
    settlementReady: 1,
    compensationReady: 1,
    deliveryReady: 0,
    repairOpen: 0,
  },
  marketIntelligence: {
    positions: [],
    signals: [],
    savedFilters: [],
  },
};

describe("PacksPageClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockQuery = "q=rollback&type=read-need-fit-preview";
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => JSON.parse(JSON.stringify(basePackPayload)),
    })) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders compact list master (no enterprise summary, no always-on detail)", async () => {
    render(<PacksPageClient />);

    expect(screen.getByTestId("route-shell-packs")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Pack activity" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("packs-enterprise-economic-summary"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("packs-pipelines-master")).toBeInTheDocument();
    expect(screen.getByTestId("packs-portfolio-strip")).toBeInTheDocument();
    expect(screen.queryByTestId("packs-run-detail")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("packs-keyboard-navigation"),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByTestId("packs-enterprise-activity-grid"),
    ).toHaveAccessibleName("Pack activity economic operation table");
    await waitFor(() =>
      expect(
        within(screen.getByRole("table")).getByText(
          "Auth rollback proof pack",
        ),
      ).toBeInTheDocument(),
    );
    // Measurements surface on the list row (absolute / measured fields).
    expect(
      within(screen.getByRole("table")).getByText(/Measured btd/i),
    ).toBeInTheDocument();
    // Source-safe detail is drill-in only (deposit/read parity).
    expect(screen.queryByText("Source-safe detail")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Back to Packs" }),
    ).not.toBeInTheDocument();
  });

  it("opens rich master-detail for a selected AssetPack with Back", async () => {
    mockQuery =
      "q=rollback&type=read-need-fit-preview&detailId=pack-activity-1";
    render(<PacksPageClient />);

    expect(await screen.findByTestId("packs-run-detail")).toBeInTheDocument();
    expect(
      screen.queryByTestId("packs-enterprise-activity-grid"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("packs-portfolio-strip"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to Packs" }),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("Source-safe detail")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("packs-detail-main")).toBeInTheDocument();
    expect(screen.getByTestId("packs-detail-aside")).toBeInTheDocument();
    expect(screen.getByText("Proof roots")).toBeInTheDocument();
    expect(screen.getByText("Accounting")).toBeInTheDocument();
    expect(screen.getByText("Governance")).toBeInTheDocument();
    expect(screen.getByTestId("packs-expandable-proof-detail")).toHaveAttribute(
      "data-enterprise-ux",
      "expandable-proof-detail",
    );
    expect(
      screen.getAllByText("btd-btc-accounting-root-abc").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("organization-authority-root-abc").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("settlement-root-def")).toBeInTheDocument();
    expect(screen.getAllByText("quote_ready").length).toBeGreaterThan(0);
    expect(screen.getByText("State readback")).toBeInTheDocument();
    expect(screen.getByText("BTD rights not recorded")).toBeInTheDocument();
    expect(screen.queryByText("Repair surface")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back to Packs" }));
    expect(mockReplace).toHaveBeenCalledWith(
      "/packs?q=rollback&type=read-need-fit-preview",
      { scroll: false },
    );
  });

  it("renders the fail-closed repair surface for repair-required activity", async () => {
    mockQuery = "detailId=pack-activity-1";
    const payload = JSON.parse(JSON.stringify(basePackPayload)) as typeof basePackPayload;
    const repairDetail = {
      ...payload.detail,
      states: {
        settlement: "btc-payment-mismatch",
        rights: null,
        compensation: null,
        delivery: null,
        repair: "repair-required",
      },
      commodityState: {
        repairRequired: true,
        blockers: ["settlement finality evidence missing"],
      },
    };
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        ...payload,
        detail: repairDetail,
      }),
    })) as jest.Mock;

    render(<PacksPageClient />);

    await waitFor(() =>
      expect(screen.getByText("Repair surface")).toBeInTheDocument(),
    );
    expect(
      screen.getByText("settlement finality evidence missing"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /repair\s+fails closed until the missing or contradictory evidence/u,
      ),
    ).toBeInTheDocument();
  });

  it("writes route query params for filters and selected detail", async () => {
    render(<PacksPageClient />);

    await waitFor(() =>
      expect(
        within(screen.getByRole("table")).getByText("Auth rollback proof pack"),
      ).toBeInTheDocument(),
    );
    fireEvent.click(
      within(screen.getByRole("table")).getByText("Auth rollback proof pack"),
    );
    expect(mockReplace).toHaveBeenCalledWith(
      "/packs?q=rollback&type=read-need-fit-preview&detailId=pack-activity-1",
      { scroll: false },
    );

    // /packs type control: commodity cuts + My ownership lenses (not every
    // pipeline activity kind — those stay on /deposits).
    fireEvent.change(screen.getByLabelText("Activity type"), {
      target: { value: "my-assetpacks" },
    });
    expect(mockReplace).toHaveBeenCalledWith(
      "/packs?q=rollback&type=my-assetpacks",
      { scroll: false },
    );
    fireEvent.change(screen.getByLabelText("Activity type"), {
      target: { value: "settled-assetpack" },
    });
    expect(mockReplace).toHaveBeenCalledWith(
      "/packs?q=rollback&type=settled-assetpack",
      { scroll: false },
    );
  });

  it("always queries network scope, even if the URL carries a different scope (V48 Gate 3)", async () => {
    mockQuery = "q=rollback&scope=personal";
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        ok: true,
        records: [],
        detail: null,
        summary: {
          total: 0,
          types: {},
          settlementReady: 0,
          compensationReady: 0,
        },
        marketIntelligence: { positions: [], signals: [] },
      }),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<PacksPageClient />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const requestedUrl = new URL(
      String(fetchMock.mock.calls[0][0]),
      "http://localhost",
    );
    expect(requestedUrl.searchParams.get("scope")).toBe("network");

    expect(screen.queryByLabelText("Visibility scope")).not.toBeInTheDocument();
  });
});
