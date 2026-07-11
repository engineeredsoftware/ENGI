// FileDiffViewer (imported through PipelineExecutionLog for the pipelines
// master-detail telemetry) pulls react-syntax-highlighter ESM jest can't
// parse; mock it so the page module loads.
jest.mock("@/components/bitcode/execution/FileDiffViewer", () => ({
  __esModule: true,
  default: () => null,
}));

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ReadPageClient from "@/app/reads/ReadPageClient";

const mockReplace = jest.fn();
const mockFetchPipelineExecutionHistory = jest.fn();
let mockQuery = "transactionId=read-admission-1&readingStage=request-fit";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(mockQuery),
}));

jest.mock("@/networking/api-client", () => ({
  fetchPipelineExecutionHistory: () => mockFetchPipelineExecutionHistory(),
}));

jest.mock("@/components/bitcode/layout/bitcode-shell-bridge", () => ({
  BitcodeShellBridgeProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>,
}));

jest.mock("@/app/terminal/TerminalRepositoryContextPanel", () => ({
  __esModule: true,
  default: ({
    onContextChange,
  }: {
    onContextChange: (value: unknown) => void;
  }) => {
    React.useEffect(() => {
      onContextChange({
        provider: "github",
        selectedRepository: {
          id: "repo-1",
          fullName: "engineeredsoftware/ENGI",
          defaultBranch: "main",
          private: true,
          language: "TypeScript",
          topics: [],
        },
        selectedBranch: "main",
        selectedCommit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
        branches: [],
        commits: [],
        connectionStatus: { connected: true, valid: true },
      });
    }, [onContextChange]);
    return (
      <section aria-label="Repository source selector">
        Repository source selector
      </section>
    );
  },
}));

jest.mock("@/app/terminal/TerminalReadScenarioPanel", () => ({
  __esModule: true,
  default: () => (
    <section aria-label="Read request scenarios">
      Read request scenarios
    </section>
  ),
}));

jest.mock("@/app/terminal/TerminalDepositReadWorkbench", () => ({
  __esModule: true,
  default: ({
    admittedReadActivityId,
    routeReadingStage,
    showDemonstrationWorkbench,
  }: {
    admittedReadActivityId?: string | null;
    routeReadingStage?: string | null;
    showDemonstrationWorkbench?: boolean;
  }) => (
    <section
      aria-label="Reading workbench"
      data-admitted-read={admittedReadActivityId || ""}
      data-route-stage={routeReadingStage || ""}
      data-demonstration={showDemonstrationWorkbench ? "true" : "false"}
    >
      Reading workbench
    </section>
  ),
}));

describe("ReadPageClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockQuery = "transactionId=read-admission-1&readingStage=request-fit";
    mockFetchPipelineExecutionHistory.mockResolvedValue([
      {
        id: "deposit-1",
        created_at: "2026-05-28T10:00:00.000Z",
        status: "completed",
        type: "agentic-execution:asset-pack",
        agentic_execution: {
          canonicalType: "agentic-execution:asset-pack",
          lens: "deposit",
          proofStatus: "depository proof ready",
          closureFocus: "deposit posture",
        },
        context: {
          source: "terminal-deposit-composer",
          candidateAssetId: "deposit-asset-1",
        },
        repo_snapshot: {
          org: "engineeredsoftware",
          repo: "ENGI",
          branch: "main",
          commit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
        },
        output: {},
        items: [],
      },
      {
        id: "read-admission-1",
        created_at: "2026-05-28T10:05:00.000Z",
        status: "completed",
        type: "agentic-execution:read-measurement",
        agentic_execution: {
          canonicalType: "agentic-execution:read-measurement",
          lens: "read",
          proofStatus: "read Need accepted",
          closureFocus: "read measurement + Finding Fits admission",
        },
        context: {
          source: "terminal-deposit-read-workbench",
          workbench: "read-admission",
        },
        repo_snapshot: {
          org: "engineeredsoftware",
          repo: "ENGI",
          branch: "main",
          commit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
        },
        output: {},
        items: [],
      },
    ]);
    // Selecting a pipeline run attaches its telemetry tail (history fetch);
    // the default mock answers with a bare completed row echoing the id.
    global.fetch = jest.fn((input: unknown) => {
      const url = String(input);
      if (url.includes("/api/executions/history/")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            run: { id: url.split("/").pop(), status: "completed", output: {} },
            events: [],
          }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => null,
      });
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the five-step /reads route with source-safe session state and live workbench ownership", async () => {
    render(<ReadPageClient />);

    expect(screen.getByTestId("route-shell-read")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Reading" }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("read-route-step-request-read"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("read-route-step-review-synthesized-need"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("read-route-step-request-fit")).toHaveAttribute(
      "data-reading-step-state",
      "current",
    );
    expect(screen.getByTestId("read-route-step-request-fit")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByText("Source-safe read state")).toBeInTheDocument();
    expect(screen.getByText("Disclosure boundary")).toBeInTheDocument();
    expect(
      screen.getByText(/Withheld until paid rights: source-bearing AssetPack contents/u),
    ).toBeInTheDocument();
    expect(screen.getByText("Organization authority")).toBeInTheDocument();
    expect(
      screen.getByText("ReadNeedComprehensionSynthesis"),
    ).toBeInTheDocument();
    expect(screen.getByText("ReadFitsFindingSynthesis")).toBeInTheDocument();
    expect(
      screen.getByTestId("read-enterprise-economic-summary"),
    ).toHaveAttribute("data-enterprise-ux", "economic-summary");
    expect(screen.getByTestId("read-keyboard-navigation")).toHaveAttribute(
      "data-enterprise-ux",
      "keyboard-navigation",
    );
    expect(screen.getByTestId("read-expandable-proof-detail")).toHaveAttribute(
      "data-enterprise-ux",
      "expandable-proof-detail",
    );

    await waitFor(() =>
      expect(
        screen.getByLabelText("Repository source selector"),
      ).toBeInTheDocument(),
    );
    const workbench = screen.getByLabelText("Reading workbench");
    await waitFor(() =>
      expect(workbench).toHaveAttribute(
        "data-admitted-read",
        "read-admission-1",
      ),
    );
    expect(workbench).toHaveAttribute("data-route-stage", "request-fit");
    expect(workbench).toHaveAttribute("data-demonstration", "false");
    // Drill-in master-detail: the selected run (read-admission-1, not a
    // formal pipeline execution) REPLACES the table with its run summary
    // detail; Back returns to the table.
    expect(screen.getByText("Read pipelines")).toBeInTheDocument();
    expect(
      screen.queryByTestId("reads-pipelines-table"),
    ).not.toBeInTheDocument();
    const summary = screen.getByTestId("reads-run-summary");
    expect(summary).toHaveTextContent("read-admission-1");
    expect(summary).toHaveTextContent("agentic-execution:read-measurement");
    expect(
      screen.getByRole("button", { name: "Back to Read pipelines" }),
    ).toBeInTheDocument();
  });

  it("returns from the run detail to the pipelines table via Back", async () => {
    mockQuery = "";
    render(<ReadPageClient />);

    // No selection: the master table shows, no detail and no Back button.
    expect(
      await screen.findByTestId("reads-pipelines-table"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("reads-run-summary")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Back to Read pipelines" }),
    ).not.toBeInTheDocument();

    // Selecting a run (URL selection) swaps the table for the detail; Back
    // clears the URL selection.
    mockQuery = "transactionId=read-admission-1";
    const { unmount } = render(<ReadPageClient />);
    const backButton = await screen.findByRole("button", {
      name: "Back to Read pipelines",
    });
    fireEvent.click(backButton);
    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    const lastHref = String(mockReplace.mock.calls.at(-1)?.[0] ?? "");
    expect(lastHref).not.toContain("transactionId=");
    unmount();
  });

  it("renders buyer fit measurement review and settlement/rights/delivery readback", async () => {
    render(<ReadPageClient />);

    await waitFor(() =>
      expect(
        screen.getByLabelText("Repository source selector"),
      ).toBeInTheDocument(),
    );

    expect(screen.getByText("Fit measurement review")).toBeInTheDocument();
    expect(
      screen.getByText(/No measurement, no price/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Settlement, rights, and delivery"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/BTC-testnet finality precedes BTD rights/u),
    ).toBeInTheDocument();
    expect(screen.getByText("Payment observation")).toBeInTheDocument();
    expect(screen.getByText("Finality")).toBeInTheDocument();
    expect(screen.getByText("BTD rights receipt")).toBeInTheDocument();
    expect(screen.getByText("Repository PR delivery")).toBeInTheDocument();
    expect(screen.getByText(/delivery locked/u)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open settled pack activity" }),
    ).toHaveAttribute("href", "/packs?type=settled-assetpack");
    expect(
      screen.getByRole("link", { name: "Open pack activity" }),
    ).toHaveAttribute("href", "/packs?type=read-need-fit-preview");
  });

  it("resumes a completed run's synthesized AssetPacks alongside the replayed telemetry", async () => {
    mockQuery = "transactionId=synth-run-1";
    mockFetchPipelineExecutionHistory.mockResolvedValue([
      {
        id: "synth-run-1",
        created_at: "2026-07-01T10:00:00.000Z",
        status: "completed",
        type: "agentic-execution:asset-pack",
        agentic_execution: {
          canonicalType: "agentic-execution:asset-pack",
          lens: "deposit",
          proofStatus: "options synthesized",
          closureFocus: "deposit posture",
        },
        context: { source: "deposit-option-synthesis" },
        repo_snapshot: null,
        output: {},
        items: [],
      },
    ]);
    global.fetch = jest.fn((input: unknown) => {
      const url = String(input);
      if (url.includes("/api/executions/history/")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            run: {
              id: url.split("/").pop(),
              status: "completed",
              output: {
                depositOptionSynthesis: { options: [] },
                reviewProjections: [
                  {
                    optionId: "option-1",
                    title: "Ledger reconciliation capability slice",
                    coveredSourcePaths: ["src/ledger/reconcile.ts", "src/ledger/index.ts"],
                    measurementRationale: "measured",
                  },
                ],
              },
            },
            events: [
              {
                id: "c1",
                event: { type: "completion" },
                created_at: "2026-07-01T10:05:00.000Z",
              },
            ],
          }),
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: async () => null });
    }) as unknown as typeof fetch;

    render(<ReadPageClient />);

    const packs = await screen.findByTestId("reads-synthesized-packs");
    const text = (packs.textContent || "").replace(/\s+/g, " ");
    expect(text).toContain("Synthesized AssetPacks · 1");
    expect(text).toContain("Ledger reconciliation capability slice");
    expect(text).toContain("2 source paths");
    expect(
      screen.getByRole("link", { name: "Review in Deposits" }),
    ).toHaveAttribute(
      "href",
      "/deposits?transactionId=synth-run-1&depositStage=review-options",
    );
  });
});
