// FileDiffViewer (imported through PipelineExecutionLog for the pipelines
// master-detail telemetry) pulls react-syntax-highlighter ESM jest can't
// parse; mock it so the page module loads.
jest.mock("@/components/bitcode/pipeline/FileDiffViewer/FileDiffViewer", () => ({
  __esModule: true,
  default: () => null,
}));

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ReadPageClient from "@/components/reads/ReadPageClient/ReadPageClient";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockFetchPipelineExecutionHistory = jest.fn();
let mockQuery = "transactionId=read-admission-1&readingStage=request-fit";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useSearchParams: () => new URLSearchParams(mockQuery),
}));

jest.mock("@/networking/api-client", () => ({
  fetchPipelineExecutionHistory: () => mockFetchPipelineExecutionHistory(),
}));

jest.mock("@/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge", () => ({
  BitcodeShellBridgeProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>,
}));

// Shared SHA source package (same control as /deposits). Mock so compose
// tests do not require live VCS connection wiring.
jest.mock("@/components/deposits/DepositSourceSelection/DepositSourceSelection", () => ({
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
          fullName: "octocat/Spoon-Knife",
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
      <section
        aria-label="Repository source selector"
        data-testid="deposit-source-selection"
      >
        Repository source selector
      </section>
    );
  },
}));

describe("ReadPageClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPush.mockReset();
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
          org: "octocat",
          repo: "Spoon-Knife",
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
          org: "octocat",
          repo: "Spoon-Knife",
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

  it("renders deposit-parity compact header + pipelines table (no always-on steps)", async () => {
    mockQuery = "";
    render(<ReadPageClient />);

    expect(screen.getByTestId("route-shell-read")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Reading" }),
    ).toBeInTheDocument();
    // Deposit twin: no enterprise step grid / economic summary on the list view.
    expect(
      screen.queryByTestId("read-route-step-request-read"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("read-enterprise-economic-summary"),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByTestId("reads-pipelines-table"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New read" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("reads-open-compose")).toBeInTheDocument();
  });

  it("opens compose detail from New and shows Need + source selector", async () => {
    mockQuery = "";
    render(<ReadPageClient />);

    fireEvent.click(await screen.findByTestId("reads-open-compose"));

    expect(
      await screen.findByTestId("reads-run-configuration"),
    ).toHaveAttribute("data-compose", "true");
    expect(screen.queryByTestId("reads-pipelines-table")).not.toBeInTheDocument();
    expect(
      await screen.findByLabelText("Repository source selector"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("reads-need-compose")).toBeInTheDocument();
    expect(screen.getByTestId("reads-need-input")).toBeInTheDocument();
    expect(screen.getByTestId("reads-synthesize-options")).toBeInTheDocument();
    expect(screen.getByTestId("reads-asset-pack-options")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to Read" }),
    ).toBeInTheDocument();
  });

  it("returns from run detail to the pipelines table via Back", async () => {
    mockQuery = "";
    render(<ReadPageClient />);

    expect(
      await screen.findByTestId("reads-pipelines-table"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Back to Read" }),
    ).not.toBeInTheDocument();

    mockQuery = "transactionId=read-admission-1";
    const { unmount } = render(<ReadPageClient />);
    const backButton = await screen.findByRole("button", {
      name: "Back to Read",
    });
    fireEvent.click(backButton);
    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    const lastHref = String(mockReplace.mock.calls.at(-1)?.[0] ?? "");
    expect(lastHref).not.toContain("transactionId=");
    unmount();
  });

  it("shows route state aside and AssetPack options as the review area in detail", async () => {
    mockQuery = "";
    render(<ReadPageClient />);
    fireEvent.click(await screen.findByTestId("reads-open-compose"));

    await waitFor(() =>
      expect(screen.getByLabelText("Reading route state")).toBeInTheDocument(),
    );
    expect(screen.getByText("Source-safe read state")).toBeInTheDocument();
    expect(screen.getByText("Organization authority")).toBeInTheDocument();
    expect(screen.getByText("Budget and quote")).toBeInTheDocument();
    // Measurement / settlement / pack-activity panels removed — options is review.
    expect(
      screen.queryByRole("heading", { name: "Fit measurement review" }),
    ).toBeNull();
    expect(
      screen.queryByRole("heading", { name: "Settlement, rights, and delivery" }),
    ).toBeNull();
    expect(screen.queryByRole("heading", { name: "Pack activity" })).toBeNull();
    expect(screen.getByTestId("reads-asset-pack-options")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "AssetPack options" }),
    ).toBeInTheDocument();
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
