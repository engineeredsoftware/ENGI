import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import DepositPageClient from "@/components/deposits/DepositPageClient/DepositPageClient";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockFetchPipelineExecutionHistory = jest.fn();
const mockUseAuth = jest.fn();
const mockUseUserData = jest.fn();
const mockTrackProductEvent = jest.fn();
let mockQuery = "transactionId=deposit-1&depositStage=review-options";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useSearchParams: () => new URLSearchParams(mockQuery),
}));

jest.mock("@/components/bitcode/auth/AuthProvider/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/hooks/useUserData", () => ({
  useUserData: () => mockUseUserData(),
}));

jest.mock("@/networking/api-client", () => ({
  fetchPipelineExecutionHistory: () => mockFetchPipelineExecutionHistory(),
}));

// Funnel analytics fan out through the one audited module; the funnel
// contract (which events fire, and that adoption fires none) is asserted
// against this spy.
jest.mock("@/lib/product-analytics", () => ({
  trackProductEvent: (event: unknown) => mockTrackProductEvent(event),
}));

// The miniature run orb pulls framer-motion + canvas layers that jsdom cannot
// animate; the header contract (orb present next to the clock + run id) is
// asserted via the stub.
jest.mock("@/components/bitcode/effects/quantum-orb", () => ({
  QuantumOrb: () => <div data-testid="quantum-orb-stub" />,
  minimalPreset: {},
}));

// PipelineExecutionLog pulls react-syntax-highlighter ESM styles that jest
// cannot transform; the telemetry panel contract is asserted via the stub.
jest.mock("@/components/bitcode/pipeline/PipelineExecutionLog/PipelineExecutionLog", () => ({
  // Mirrors the real component's error-banner contract (QA F19): the error
  // (with its Retry/Dismiss actions) renders WITHIN the log (role="alert"),
  // not as a separate stub prop, so tests asserting on the alert exercise
  // the same "errors live in telemetry, not the Obfuscations pane"
  // placement — and the same Retry/Dismiss wiring — as production.
  PipelineExecutionLog: ({
    output,
    isProcessing,
    error,
    onRetry,
    onDismissError,
  }: {
    output: string;
    isProcessing: boolean;
    error?: string | null;
    onRetry?: () => void;
    onDismissError?: () => void;
  }) => (
    <div data-testid="pipeline-execution-log" data-processing={String(isProcessing)}>
      {error ? (
        <p role="alert">
          {error}
          <button type="button" onClick={onRetry}>Retry</button>
          <button type="button" onClick={onDismissError}>Dismiss</button>
        </p>
      ) : null}
      {output}
    </div>
  ),
}));

jest.mock("@/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge", () => ({
  BitcodeShellBridgeProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>,
}));

jest.mock("@/components/deposits/DepositSourceSelection/DepositSourceSelection", () => ({
  __esModule: true,
  default: ({
    onContextChange,
    routePath,
    repositoryAnchors,
    disabled,
  }: {
    onContextChange: (value: unknown) => void;
    routePath?: string;
    repositoryAnchors?: Array<{ repositoryFullName: string }>;
    disabled?: boolean;
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
          owner: { username: "octocat" },
        },
        repositories: [],
        selectedBranch: "main",
        selectedCommit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
        branches: [],
        commits: [],
        connectionStatus: { connected: true, valid: true },
      });
    }, [onContextChange]);
    return (
      <section
        aria-label="Deposit source selection"
        data-testid="deposit-source-selection"
        data-route-path={routePath}
        data-locked={disabled ? "true" : "false"}
        aria-disabled={disabled || undefined}
      >
        Deposit source selection
        {/* Exposes the repositoryAnchors DERIVATION (DepositPageClient's
            useMemo over liveRuns) for testing — the real selector UI that
            CONSUMES this prop is unit-tested directly in
            depositSourceSelection.test.tsx, since this component is mocked
            here. */}
        <ul data-testid="deposit-source-selection-repository-anchors">
          {(repositoryAnchors || []).map((anchor) => (
            <li key={anchor.repositoryFullName}>{anchor.repositoryFullName}</li>
          ))}
        </ul>
      </section>
    );
  },
}));


/** Open the new-deposit compose detail (replaces pipelines table). */
async function openComposeDetail() {
  fireEvent.click(await screen.findByTestId("deposit-open-compose"));
  expect(
    await screen.findByTestId("deposit-run-configuration"),
  ).toBeInTheDocument();
}

describe("DepositPageClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPush.mockReset();
    mockTrackProductEvent.mockReset();
    mockQuery = "transactionId=deposit-1&depositStage=review-options";
    mockUseAuth.mockReturnValue({ user: { id: "user-1" } });
    mockUseUserData.mockReturnValue({
      data: {
        profile: {
          wallet_address: "bc1qexample",
          wallet_binding: { address: "bc1qexample" },
        },
      },
      hasGitHubConnection: true,
      hasValidGitHubConnection: true,
      hasWalletConnection: true,
      hasVerifiedWalletConnection: true,
      hasStoredVerifiedWalletConnection: true,
      walletConnectionStatus: {
        address: "bc1qexample",
        provider: "xverse",
        metadata: { authAddress: "bc1qexample-auth" },
      },
    });
    mockFetchPipelineExecutionHistory.mockResolvedValue([
      {
        id: "deposit-1",
        created_at: "2026-05-29T10:00:00.000Z",
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
          depositorySearchDocumentRoot: "sha256:search",
          vectorDocumentRoot: "sha256:vector",
          compensationPreviewRoot: "sha256:compensation",
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
    // Selecting any pipeline run adopts it into the Telemetry detail, whose
    // tail hydrates from the history endpoint — the default mock answers
    // those with a bare completed row (echoing the requested id) so tests
    // that never dispatch still settle cleanly.
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

  it("renders /deposits with option synthesis, source-safe state, and live deposit composer ownership", async () => {
    render(<DepositPageClient />);

    expect(screen.getByTestId("route-shell-deposit")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Depositing" }),
    ).toBeInTheDocument();
    // Selecting a repository source fires the funnel event with the provider
    // + pin SHAPE only — never the repository name.
    await waitFor(() =>
      expect(mockTrackProductEvent).toHaveBeenCalledWith({
        name: "deposit_source_selected",
        data: { provider: "github", pinnedBranch: true, pinnedCommit: true },
      }),
    );
    // The route step grid is removed from /deposits — the route header, the
    // pipelines master-detail, and the flow sections carry the journey.
    expect(
      screen.queryByTestId("deposit-route-step-connect-source"),
    ).not.toBeInTheDocument();
    // Lower asides default collapsed — titles visible; expand Session for body.
    expect(screen.getByText("Source-safe deposit state")).toBeInTheDocument();
    expect(screen.getByText("Organization authority")).toBeInTheDocument();
    expect(
      screen.queryByText("Disclosure boundary"),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Expand Source-safe deposit state" }),
    );
    expect(screen.getByText("Disclosure boundary")).toBeInTheDocument();
    expect(
      screen.getByText(/Withheld: raw source, unpaid AssetPack source, prompts/u),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("DepositAssetPackOptionSynthesis").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("DepositAssetPackOptionPolicy").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("DepositAssetPackOptionAdmissionReport").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("DepositorEarningSupplyIntelligence").length,
    ).toBeGreaterThan(0);
    // The economy overview is now combined into the top route header (its
    // metrics: options, positive ROI, admitted, authority), so the separate
    // enterprise-summary block no longer renders.
    expect(
      screen.queryByTestId("deposit-enterprise-economic-summary"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("deposit-keyboard-navigation"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("deposit-expandable-proof-detail")).toHaveAttribute(
      "data-enterprise-ux",
      "expandable-proof-detail",
    );
    expect(
      screen.getByText("All-repositories supply estimate"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Earning estimate/u).length).toBeGreaterThan(0);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Expand All-repositories supply estimate",
      }),
    );
    expect(
      screen.getByText(/Unfit Need opportunities/u),
    ).toBeInTheDocument();
    // Blueprint option cards are retired from the surface: until a real
    // AssetPacksSynthesis run returns, the options grid shows the
    // await-synthesis state instead of deterministic previews (F12).
    expect(
      screen.getByTestId("deposit-options-await-synthesis"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("deposit-option-capability-slice"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("deposit-option-proof-operations-slice"),
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByLabelText("Deposit source selection"),
      ).toHaveAttribute("data-route-path", "/deposits"),
    );
    // The legacy instant-write composer is removed; the single batch-deposit
    // action only appears after a real AssetPacksSynthesis run returns options.
    expect(
      screen.queryByLabelText("Deposit composer"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("deposit-selected-packs"),
    ).not.toBeInTheDocument();
    // Drill-in master-detail: the selected run (deposit-1) REPLACES the
    // table with its run detail once adoption settles; Back returns to the
    // table.
    // Section title is "Deposit" (was "Deposit pipelines"); scoped via region.
    const depositRegion = screen.getByRole("region", { name: "Deposit" });
    expect(within(depositRegion).getByText("Deposit", { selector: "h2 span" })).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByTestId("deposit-synthesis-telemetry"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByTestId("deposits-pipelines-table"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to Deposit" }),
    ).toBeInTheDocument();
  });

  it("returns from the run detail to the pipelines table via Back", async () => {
    render(<DepositPageClient />);

    const backButton = await screen.findByRole("button", {
      name: "Back to Deposit",
    });
    fireEvent.click(backButton);

    // Back detaches the run (detail unmounts, table returns) and clears the
    // URL selection.
    await waitFor(() =>
      expect(
        screen.getByTestId("deposits-pipelines-table"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByTestId("deposit-synthesis-telemetry"),
    ).not.toBeInTheDocument();
    const lastHref = String(mockReplace.mock.calls.at(-1)?.[0] ?? "");
    expect(lastHref).not.toContain("transactionId=");
  });

  it("hides the Synthesize DataPack Options button while a run's detail owns the page", async () => {
    // A run is adopted by default (mockQuery) — dispatching from here would
    // yank the viewer off the loaded run's telemetry/results mid-review.
    render(<DepositPageClient />);
    expect(
      await screen.findByTestId("deposit-synthesis-telemetry"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Synthesize DataPack Options" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("deposit-obfuscations-run-loaded-note"),
    ).toBeInTheDocument();

    // Run configuration is locked and lives above telemetry in run detail.
    const configuration = screen.getByTestId("deposit-run-configuration");
    expect(configuration).toHaveAttribute("data-locked", "true");
    expect(screen.getByTestId("deposit-source-selection")).toHaveAttribute(
      "data-locked",
      "true",
    );
    expect(screen.getByLabelText("What to obfuscate or withhold")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Clear obfuscations" }),
    ).toBeDisabled();
    // Configuration DOM precedes telemetry DOM (layout: config above telemetry).
    expect(
      configuration.compareDocumentPosition(
        screen.getByTestId("deposit-synthesis-telemetry"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Back returns to the master table; compose is opened via New deposit.
    fireEvent.click(
      await screen.findByRole("button", { name: "Back to Deposit" }),
    );
    expect(
      await screen.findByTestId("deposits-pipelines-table"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("deposit-run-configuration"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New deposit" }),
    ).toBeInTheDocument();

    await openComposeDetail();
    expect(
      await screen.findByRole("button", { name: "Synthesize DataPack Options" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("deposit-obfuscations-run-loaded-note"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("deposit-run-configuration")).toHaveAttribute(
      "data-locked",
      "false",
    );
    expect(screen.getByTestId("deposit-source-selection")).toHaveAttribute(
      "data-locked",
      "false",
    );
    expect(
      screen.getByLabelText("What to obfuscate or withhold"),
    ).not.toBeDisabled();
  });

  it("resumes a completed synthesis run's results when its row is selected (master-detail)", async () => {
    // A completed AssetPacksSynthesis run selected via the URL transactionId:
    // adoption attaches the run, the history hydrate carries its terminal
    // completion event, and the completion effect resumes the persisted
    // results (execution row output) without any new dispatch.
    mockQuery = "transactionId=resume-run-1";
    mockFetchPipelineExecutionHistory.mockResolvedValue([
      {
        id: "resume-run-1",
        created_at: "2026-07-03T10:00:00.000Z",
        status: "completed",
        type: "agentic-execution:asset-pack",
        agentic_execution: {
          canonicalType: "agentic-execution:asset-pack",
          lens: "deposit",
          proofStatus: null,
          closureFocus: null,
        },
        context: {
          source: "deposit-option-synthesis",
          workbench: "deposit-option-synthesis",
          route: "/deposits",
          pipelineCore: "AssetPacksSynthesis",
          repositoryFullName: "octocat/Spoon-Knife",
          sourceBranch: "main",
          sourceCommit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
        },
        output: {},
        items: [],
      },
    ]);
    const fetchMock = jest.fn(async (url: string) => {
      if (url === "/api/executions/history/resume-run-1") {
        return {
          ok: true,
          json: async () => ({
            run: {
              id: "resume-run-1",
              output: {
                depositOptionSynthesis: {
                  schema: "bitcode.deposit.asset-pack-option-synthesis",
                  pipeline: "DepositAssetPackOptionSynthesis",
                  requestId: "deposit-option-request:resume0001",
                  createdAt: "2026-07-03T10:00:00.000Z",
                  request: {
                    repositoryFullName: "octocat/Spoon-Knife",
                    sourceBranch: "main",
                    sourceCommit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
                    depositorInstructionRoot: null,
                    sourcePathRoots: [],
                  },
                  options: [],
                  optionCount: 0,
                  sourceSafety: {
                    sourceSafeMetadataOnly: true,
                    protectedSourceVisible: false,
                    rawSourceTextVisible: false,
                    unpaidAssetPackSourceVisible: false,
                    rawPromptVisible: false,
                    interpolatedPromptVisible: false,
                    rawProviderResponseVisible: false,
                    walletPrivateMaterialVisible: false,
                  },
                  reviewBoundary: {
                    route: "/deposits",
                    defaultDecisionState: "pending-depositor-review",
                    approvedOptionsAdmittedBy: "future-gate7-deposit-option-review",
                    sourceCriticalityDemandRoiPolicyOwnedBy: "future-gate6-policy",
                  },
                  roots: {
                    requestRoot: "deposit-option-request:resume0001",
                    synthesisRoot: "deposit-asset-pack-option-synthesis:resume01",
                    optionRoots: [],
                  },
                  synthesisMode: "real-bounded-inference",
                  pipelineCore: "AssetPacksSynthesis",
                },
                reviewProjections: [],
              },
            },
            events: [
              {
                id: "completion-1",
                event: { type: "completion" },
                created_at: "2026-07-03T10:12:00.000Z",
              },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<DepositPageClient />);

    // Adoption + resume: the run's persisted history is read (hook hydrate +
    // completion effect) and the route stage advances to review-options —
    // with NO dispatch call.
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/executions/history/resume-run-1",
        expect.anything(),
      ),
    );
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("depositStage=review-options"),
        expect.anything(),
      ),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/deposit/synthesize-options",
      expect.anything(),
    );
    // Adopting a historical row must not emit funnel telemetry — completion
    // events are reserved for runs dispatched in THIS session.
    expect(mockTrackProductEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "deposit_synthesis_completed" }),
    );
    mockQuery = "transactionId=deposit-1&depositStage=review-options";
  });

  it("requests real option synthesis from the AssetPacksSynthesis route with exclusions", async () => {
    const realOption = {
      schema: "bitcode.deposit.asset-pack-option",
      optionId: "deposit-option-real-1-abcd1234",
      kind: "capability-slice",
      title: "Real measured capability slice",
      summary:
        "A source-safe slice describing the demo capability measured by AssetPacksSynthesis under the deposit lens.",
      sourceBinding: {
        repositoryFullName: "octocat/Spoon-Knife",
        sourceBranch: "main",
        sourceCommit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
        sourcePathRoots: ["deposit-option-source-path:11111111"],
        sourcePathCount: 1,
        rawSourceStoredExternally: true,
        protectedSourceVisibleInOption: false,
      },
      demandAlignment: {
        posture: "source-safe-demand-signals-only",
        depositorySignalRoots: [],
        readingSignalRoots: [],
        existingDepositorySignalRoots: [],
        confidence: 0.8,
      },
      measurements: [
        {
          id: "deposit-option-real-1:function-count",
          label: "Functions",
          measurementKind: "function-count",
          weight: 0.12,
          volume: 0.5,
          category: "absolute",
          magnitude: 8,
          unit: "functions",
          evidenceRoot: "deposit-option-measurement:22222222",
        },
        {
          id: "deposit-option-real-1:correctness-estimate",
          label: "Correctness",
          measurementKind: "correctness-estimate",
          weight: 0.18,
          volume: 0.72,
          category: "absolute",
          unit: "estimate",
          evidenceRoot: "deposit-option-measurement:22222223",
        },
      ],
      reviewBoundary: {
        state: "reviewable-source-safe-option",
        decision: "pending-depositor-review",
        depositAdmissionBoundary: "not-admitted-until-depositor-approval",
        btdMintBoundary: "not-minted-by-deposit-option",
        settlementBoundary:
          "future-reader-settlement-required-for-source-bearing-assetpack",
      },
      policyBoundary: {
        sourceCriticalityPolicy: "deferred-to-gate6",
        demandRoiPolicy: "deferred-to-gate6",
        compensationPolicy: "deferred-to-gate6",
      },
      visibility: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawSourceTextVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        interpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        walletPrivateMaterialVisible: false,
      },
      roots: {
        optionRoot: "deposit-asset-pack-option:33333333",
        sourceBindingRoot: "deposit-option-source-binding:44444444",
        demandAlignmentRoot: "deposit-option-demand-alignment:55555555",
        measurementRoot: "deposit-option-measurements:66666666",
        reviewBoundaryRoot: "deposit-option-review-boundary:77777777",
      },
    };
    const synthesis = {
      schema: "bitcode.deposit.asset-pack-option-synthesis",
      pipeline: "DepositAssetPackOptionSynthesis",
      requestId: "deposit-option-request:99999999",
      createdAt: "2026-06-12T22:00:00.000Z",
      request: {
        repositoryFullName: "octocat/Spoon-Knife",
        sourceBranch: "main",
        sourceCommit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
        depositorInstructionRoot: null,
        sourcePathRoots: ["deposit-option-source-path:11111111"],
      },
      options: [realOption],
      optionCount: 1,
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawSourceTextVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        interpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        walletPrivateMaterialVisible: false,
      },
      reviewBoundary: {
        route: "/deposits",
        defaultDecisionState: "pending-depositor-review",
        approvedOptionsAdmittedBy: "future-gate7-deposit-option-review",
        sourceCriticalityDemandRoiPolicyOwnedBy: "future-gate6-policy",
      },
      roots: {
        requestRoot: "deposit-option-request:99999999",
        synthesisRoot: "deposit-asset-pack-option-synthesis:88888888",
        optionRoots: ["deposit-asset-pack-option:33333333"],
      },
      synthesisMode: "real-bounded-inference",
      pipelineCore: "AssetPacksSynthesis",
      inference: {
        provider: "anthropic",
        model: "claude-haiku-4-5-20251001",
        totalTokens: 5421,
        durationMs: 18450,
      },
      exclusionPosture: {
        impermissibleSourceCount: 1,
        exclusionRoots: ["deposit-option-ip-exclusion:aaaaaaaa"],
        excludedPathCount: 2,
        droppedCandidateCount: 0,
      },
    };
    const reviewProjections = [
      {
        optionId: "deposit-option-real-1-abcd1234",
        title: "Real measured capability slice",
        coveredSourcePaths: ["src/app.py"],
        measurementRationale: "Covers the primary capability path.",
      },
    ];
    // V48-Gate3-F26-B: the route DISPATCHES the run (returns dispatched, no synthesis); the
    // client tails telemetry and, on the completion event, reads the persisted
    // synthesis from the execution row history.
    const fetchMock = jest.fn(async (url: string) => {
      if (url === "/api/deposit/synthesize-options") {
        return {
          ok: true,
          json: async () => ({ ok: true, runId: "real-synthesis-execution-1", executionId: "real-synthesis-execution-1", status: "dispatched" }),
        };
      }
      if (url.startsWith("/api/vcs?")) {
        return {
          ok: true,
          json: async () => ({
            items: [{ path: "secret-engine", type: "tree", sha: "t-secret" }],
          }),
        };
      }
      if (url.startsWith("/api/executions/history/")) {
        return {
          ok: true,
          json: async () => ({
            run: {
              id: url.split("/").pop(),
              output: { depositOptionSynthesis: synthesis, reviewProjections },
            },
            events: [
              { id: "completion-1", event: { type: "completion" }, created_at: "2026-06-12T22:00:05.000Z" },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<DepositPageClient />);

    // A run is adopted by default (mockQuery); Back to table, then New deposit
    // opens compose for a fresh dispatch.
    fireEvent.click(
      await screen.findByRole("button", { name: "Back to Deposit" }),
    );
    await openComposeDetail();

    // Pick the exclusion from the repository file tree (fetched at the
    // selected repo·branch·commit); a directory selects its prefix.
    const exclusionsTree = await screen.findByLabelText(
      "Impermissible sources file tree",
    );
    const secretEngineRow = await within(exclusionsTree).findByText(
      "secret-engine/",
    );
    fireEvent.click(secretEngineRow);

    const synthesizeButton = await screen.findByRole("button", {
      name: "Synthesize DataPack Options",
    });
    await waitFor(() => expect(synthesizeButton).not.toBeDisabled());
    fireEvent.click(synthesizeButton);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/deposit/synthesize-options",
        expect.objectContaining({ method: "POST" }),
      ),
    );
    const synthesisCall = fetchMock.mock.calls.find(
      ([url]) => url === "/api/deposit/synthesize-options",
    );
    const body = JSON.parse(String(synthesisCall?.[1]?.body));
    expect(body.repositoryFullName).toBe("octocat/Spoon-Knife");
    expect(body.impermissibleSources).toEqual(["secret-engine/"]);
    // Permissible sources are always present on the synthesize POST (empty when none picked).
    expect(body.permissibleSources).toEqual([]);
    expect(Array.isArray(body.demandContext)).toBe(true);

    // Funnel analytics: the dispatch emits its input SHAPE only (no
    // repository name, no obfuscation text) and completion carries the
    // option count — both fire because THIS session dispatched the run.
    expect(mockTrackProductEvent).toHaveBeenCalledWith({
      name: "deposit_synthesis_dispatched",
      data: expect.objectContaining({
        hasObfuscations: false,
        permissibleSourceCount: 0,
        impermissibleSourceCount: 1,
      }),
    });

    await waitFor(() =>
      expect(
        screen.getByText("Real measured capability slice"),
      ).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(mockTrackProductEvent).toHaveBeenCalledWith({
        name: "deposit_synthesis_completed",
        data: expect.objectContaining({ optionCount: 1 }),
      }),
    );
    expect(
      screen.getByTestId("deposit-synthesis-inference"),
    ).toHaveTextContent("DataPack synthesis");
    expect(
      screen.getByTestId("deposit-synthesis-inference"),
    ).toHaveTextContent("65 commercial absolutes");
    expect(
      screen.getByTestId("deposit-synthesis-inference"),
    ).toHaveTextContent("5,421 tokens");
    expect(screen.getByText("src/app.py")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Full synthetic option render: the deposit-decision payload (V48 Gate 3) —
  // AP contents (patch descriptor), provenant source, the neediness preview
  // tile, and the absolutes measurement tiles (magnitude+unit vs volume/weight).
  // -------------------------------------------------------------------------
  function buildMeasuredSynthesisFixture() {
    const option = {
      schema: "bitcode.deposit.asset-pack-option",
      optionId: "deposit-option-real-9-ffff9999",
      kind: "capability-slice",
      title: "Ledger reconciliation capability slice",
      summary:
        "A measured, source-safe slice covering the ledger reconciliation capability.",
      sourceBinding: {
        repositoryFullName: "octocat/Spoon-Knife",
        sourceBranch: "main",
        sourceCommit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
        sourcePathRoots: ["deposit-option-source-path:11111111"],
        sourcePathCount: 2,
        rawSourceStoredExternally: true,
        protectedSourceVisibleInOption: false,
      },
      demandAlignment: {
        posture: "source-safe-demand-signals-only",
        depositorySignalRoots: [],
        readingSignalRoots: [],
        existingDepositorySignalRoots: [],
        confidence: 0.8,
      },
      measurements: [
        {
          id: "deposit-option-real-9:function-count",
          label: "Function count",
          measurementKind: "function-count",
          category: "absolute",
          weight: 0.4,
          volume: 0.55,
          magnitude: 12,
          unit: "functions",
          evidenceRoot: "deposit-option-measurement:aa11aa11",
        },
        {
          id: "deposit-option-real-9:semantic-volume",
          label: "Semantic volume",
          measurementKind: "semantic-volume",
          category: "absolute",
          weight: 0.25,
          volume: 0.48,
          unit: "normalized",
          evidenceRoot: "deposit-option-measurement:bb22bb22",
        },
      ],
      contents: {
        patchSummary:
          "Adds a reconciliation module wiring ledger entries to journal proofs.",
        fileChanges: [
          { op: "create", path: "src/ledger/reconcile.ts" },
          { op: "update", path: "src/ledger/index.ts" },
          { op: "delete", path: "src/ledger/legacy-sync.ts" },
        ],
        provenantSourcePaths: ["src/ledger/journal.ts"],
        provenantSourceCount: 1,
      },
      neediness: {
        volume: 0.62,
        demand: 0.7,
        saturation: 0.2,
        rationale: "Readers repeatedly probe reconciliation flows with no fit AssetPack.",
      },
      reviewBoundary: {
        state: "reviewable-source-safe-option",
        decision: "pending-depositor-review",
        depositAdmissionBoundary: "not-admitted-until-depositor-approval",
        btdMintBoundary: "not-minted-by-deposit-option",
        settlementBoundary:
          "future-reader-settlement-required-for-source-bearing-assetpack",
      },
      policyBoundary: {
        sourceCriticalityPolicy: "deferred-to-gate6",
        demandRoiPolicy: "deferred-to-gate6",
        compensationPolicy: "deferred-to-gate6",
      },
      visibility: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawSourceTextVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        interpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        walletPrivateMaterialVisible: false,
      },
      roots: {
        optionRoot: "deposit-asset-pack-option:99999999",
        sourceBindingRoot: "deposit-option-source-binding:44444444",
        demandAlignmentRoot: "deposit-option-demand-alignment:55555555",
        measurementRoot: "deposit-option-measurements:66666666",
        contentsRoot: "deposit-option-contents:cc33cc33",
        needinessRoot: "deposit-option-neediness:dd44dd44",
        reviewBoundaryRoot: "deposit-option-review-boundary:77777777",
      },
    };
    return {
      schema: "bitcode.deposit.asset-pack-option-synthesis",
      pipeline: "DepositAssetPackOptionSynthesis",
      requestId: "deposit-option-request:99999999",
      createdAt: "2026-07-01T22:00:00.000Z",
      request: {
        repositoryFullName: "octocat/Spoon-Knife",
        sourceBranch: "main",
        sourceCommit: "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
        depositorInstructionRoot: null,
        sourcePathRoots: ["deposit-option-source-path:11111111"],
      },
      options: [option],
      optionCount: 1,
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawSourceTextVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        interpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        walletPrivateMaterialVisible: false,
      },
      reviewBoundary: {
        route: "/deposits",
        defaultDecisionState: "pending-depositor-review",
        approvedOptionsAdmittedBy: "future-gate7-deposit-option-review",
        sourceCriticalityDemandRoiPolicyOwnedBy: "future-gate6-policy",
      },
      roots: {
        requestRoot: "deposit-option-request:99999999",
        synthesisRoot: "deposit-asset-pack-option-synthesis:88888888",
        optionRoots: ["deposit-asset-pack-option:99999999"],
      },
      synthesisMode: "real-bounded-inference",
      pipelineCore: "AssetPacksSynthesis",
      inference: {
        provider: "anthropic",
        model: "claude-haiku-4-5-20251001",
        totalTokens: 9012,
        durationMs: 22150,
      },
    };
  }

  async function dispatchSynthesis() {
    render(<DepositPageClient />);
    // A run is adopted by default (mockQuery); Back to table, then New deposit
    // for compose + Synthesize.
    fireEvent.click(
      await screen.findByRole("button", { name: "Back to Deposit" }),
    );
    await openComposeDetail();
    const synthesizeButton = await screen.findByRole("button", {
      name: "Synthesize DataPack Options",
    });
    await waitFor(() => expect(synthesizeButton).not.toBeDisabled());
    fireEvent.click(synthesizeButton);
  }

  it("renders the full measured option card: contents panel, provenant source, neediness tile, absolutes tiles", async () => {
    const synthesis = buildMeasuredSynthesisFixture();
    global.fetch = jest.fn(async (url: string) => {
      if (url === "/api/deposit/synthesize-options") {
        return {
          ok: true,
          json: async () => ({ ok: true, runId: "measured-run-1", status: "dispatched" }),
        };
      }
      if (url.startsWith("/api/executions/history/")) {
        return {
          ok: true,
          json: async () => ({
            run: {
              id: url.split("/").pop(),
              output: { depositOptionSynthesis: synthesis, reviewProjections: [] },
            },
            events: [
              { id: "c1", event: { type: "completion" }, created_at: "2026-07-01T22:00:05.000Z" },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as unknown as typeof fetch;

    await dispatchSynthesis();

    const card = await screen.findByTestId("deposit-option-capability-slice");
    const text = (card.textContent || "").replace(/\s+/g, " ");

    // Title + the deposit-decision payload header.
    expect(text).toContain("Ledger reconciliation capability slice");
    expect(text).toContain("If deposited, Bitcode receives");
    expect(text).toContain(
      "Adds a reconciliation module wiring ledger entries to journal proofs.",
    );

    // Synthesized contents: one line per file change with its op.
    expect(text).toContain("Synthesized contents · 3 files");
    expect(text).toContain("create");
    expect(text).toContain("src/ledger/reconcile.ts");
    expect(text).toContain("update");
    expect(text).toContain("src/ledger/index.ts");
    expect(text).toContain("delete");
    expect(text).toContain("src/ledger/legacy-sync.ts");

    // Provenant source panel (singular form for one file).
    expect(text).toContain("Provenant source · 1 file available to Bitcode");
    expect(text).toContain("src/ledger/journal.ts");

    // Neediness preview: settled-Depository grounding (or Unestimatable when the
    // demand-estimate route is not mocked / corpus is thin). Never invent %.
    expect(text).toContain("Neediness · est. read demand");
    expect(
      text.includes("Unestimatable") ||
        text.includes("62% · demand 70% · saturation 20%"),
    ).toBe(true);

    // Absolutes tiles: compact multi-column catalogue (SSOT weights).
    expect(text).toContain("Function count");
    // Compact card layout: magnitude line then "55% · w 0.028" (not legacy
    // "12 functions · 55% / weight 0.028" single-line format).
    expect(text).toContain("12 functions");
    expect(text).toMatch(/55%\s*·\s*w\s*0\.0(28|35)/);
    // Full catalogue kinds present (not legacy 2-tile subset).
    expect(text).toContain("Secret safety");
    expect(text).toContain("Difficulty");
    expect(text).toContain("Correctness");
    expect(text).not.toContain("normalized");
    // Commercial brief is on-page for deposit consideration.
    expect(text).toContain("Commercial brief");
    // Dense absolute grid is present.
    expect(screen.getByTestId("deposit-option-absolute-grid")).toBeInTheDocument();

    // The await-synthesis placeholder is gone once real options render.
    expect(
      screen.queryByTestId("deposit-options-await-synthesis"),
    ).not.toBeInTheDocument();
  });

  it("flips to failed with a role=alert banner when the run streams a terminal error event", async () => {
    global.fetch = jest.fn(async (url: string) => {
      if (url === "/api/deposit/synthesize-options") {
        return {
          ok: true,
          json: async () => ({ ok: true, runId: "failed-run-1", status: "dispatched" }),
        };
      }
      if (url.startsWith("/api/executions/history/")) {
        return {
          ok: true,
          json: async () => ({
            run: { id: url.split("/").pop(), output: {} },
            events: [
              {
                id: "e1",
                event: { type: "error", message: "Provider exploded mid-synthesis" },
                created_at: "2026-07-01T22:00:05.000Z",
              },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as unknown as typeof fetch;

    await dispatchSynthesis();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Provider exploded mid-synthesis");
    // No options surfaced; the grid still shows the await-synthesis state.
    expect(
      screen.getByTestId("deposit-options-await-synthesis"),
    ).toBeInTheDocument();
    // The error's own Retry action is enabled (not stuck in running) — the
    // top-level Synthesize options button stays hidden while this failed
    // run's telemetry owns the page; Retry lives with the error instead.
    expect(
      screen.getByRole("button", { name: "Retry" }),
    ).not.toBeDisabled();
    expect(mockTrackProductEvent).toHaveBeenCalledWith({
      name: "deposit_synthesis_failed",
      data: expect.objectContaining({ stage: "run" }),
    });
  });

  it("fails with the not-found message when completion arrives but the run output has no synthesis", async () => {
    global.fetch = jest.fn(async (url: string) => {
      if (url === "/api/deposit/synthesize-options") {
        return {
          ok: true,
          json: async () => ({ ok: true, runId: "empty-run-1", status: "dispatched" }),
        };
      }
      if (url.startsWith("/api/executions/history/")) {
        return {
          ok: true,
          json: async () => ({
            // status completed without depositOptionSynthesis after retries
            run: {
              id: url.split("/").pop(),
              status: "completed",
              context: { source: "deposit-option-synthesis" },
              output: {},
            },
            events: [
              { id: "c1", event: { type: "completion" }, created_at: "2026-07-01T22:00:05.000Z" },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as unknown as typeof fetch;

    await dispatchSynthesis();

    // Hydrate retries (test delayMs=0) then fail-closed — allow multi-attempt.
    const alert = await screen.findByRole("alert", {}, { timeout: 5000 });
    expect(alert).toHaveTextContent(
      "Synthesized options were not found for this run.",
    );
    expect(
      screen.getByTestId("deposit-options-await-synthesis"),
    ).toBeInTheDocument();
    expect(mockTrackProductEvent).toHaveBeenCalledWith({
      name: "deposit_synthesis_failed",
      data: expect.objectContaining({ stage: "resume" }),
    });
  });

  it("recovers options when history first omits depositOptionSynthesis then lands it", async () => {
    const synthesis = buildMeasuredSynthesisFixture();
    let historyCalls = 0;
    global.fetch = jest.fn(async (url: string) => {
      if (url === "/api/deposit/synthesize-options") {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            runId: "late-options-run",
            status: "dispatched",
          }),
        };
      }
      if (url.startsWith("/api/executions/history/")) {
        historyCalls += 1;
        if (historyCalls < 3) {
          return {
            ok: true,
            json: async () => ({
              run: {
                id: "late-options-run",
                status: "completed",
                context: { source: "deposit-option-synthesis" },
                output: { summary: "writing options" },
              },
              events: [
                {
                  id: "c1",
                  event: { type: "completion" },
                  created_at: "2026-07-01T22:00:05.000Z",
                },
              ],
            }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            run: {
              id: "late-options-run",
              status: "completed",
              context: { source: "deposit-option-synthesis" },
              output: {
                depositOptionSynthesis: synthesis,
                reviewProjections: [],
              },
            },
            events: [
              {
                id: "c1",
                event: { type: "completion" },
                created_at: "2026-07-01T22:00:05.000Z",
              },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as unknown as typeof fetch;

    await dispatchSynthesis();

    // Options land after retries — no permanent false error banner.
    await screen.findByTestId("deposit-option-capability-slice", {}, { timeout: 5000 });
    expect(screen.queryByText(/Synthesized options were not found/i)).toBeNull();
    expect(historyCalls).toBeGreaterThanOrEqual(3);
  });

  it("fails the dispatch itself when the synthesize route rejects the request", async () => {
    global.fetch = jest.fn(async (url: string) => {
      if (url === "/api/deposit/synthesize-options") {
        return {
          ok: false,
          json: async () => ({ ok: false, error: "Repository ownership check failed." }),
        };
      }
      if (url.startsWith("/api/executions/history/")) {
        return { ok: false, status: 404, json: async () => ({}) };
      }
      return { ok: true, json: async () => ({}) };
    }) as unknown as typeof fetch;

    await dispatchSynthesis();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Repository ownership check failed.");
    expect(mockTrackProductEvent).toHaveBeenCalledWith({
      name: "deposit_synthesis_failed",
      data: { stage: "dispatch", durationMs: null },
    });
  });

  it("adopts a selected non-synthesis pipeline run as a telemetry-only detail (no options, no failure)", async () => {
    // Default fixtures: selection deposit-1, a COMPLETED composer run (not an
    // option synthesis). Selecting it must attach its replayed telemetry at
    // its terminal status without attempting an options resume.
    render(<DepositPageClient />);

    const telemetry = await screen.findByTestId("deposit-synthesis-telemetry");
    expect(telemetry).toHaveTextContent("Pipeline run");
    expect(telemetry).not.toHaveTextContent("Asset Pack Synthesis");
    expect(telemetry).toHaveTextContent("deposit-1");
    await waitFor(() =>
      expect(screen.getByTestId("pipeline-execution-log")).toHaveAttribute(
        "data-processing",
        "false",
      ),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  describe("V48 Gate 3 — repository and Obfuscations anchoring", () => {
    function withAnchorFixtures() {
      // Config editing requires no adopted run (run detail locks configuration).
      mockQuery = "depositStage=review-options";
      mockFetchPipelineExecutionHistory.mockResolvedValue([
        {
          id: "deposit-1",
          created_at: "2026-05-29T10:00:00.000Z",
          status: "completed",
          type: "agentic-execution:asset-pack",
          agentic_execution: {
            canonicalType: "agentic-execution:asset-pack",
            lens: "deposit",
            proofStatus: "depository proof ready",
            closureFocus: "deposit posture",
          },
          context: { source: "terminal-deposit-composer" },
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
          id: "repo-anchor-1",
          created_at: "2026-07-01T10:00:00.000Z",
          status: "completed",
          type: "agentic-execution:asset-pack",
          agentic_execution: {
            canonicalType: "agentic-execution:asset-pack",
            lens: "deposit",
            proofStatus: null,
            closureFocus: null,
          },
          context: {
            source: "terminal-repository-context-panel",
            repositoryFullName: "octocat/OtherRepo",
            sourceBranch: "develop",
            sourceCommit: "abc1234567",
          },
          output: {},
          items: [],
        },
        {
          id: "obfuscations-anchor-1",
          created_at: "2026-07-02T10:00:00.000Z",
          status: "completed",
          type: "agentic-execution:asset-pack",
          agentic_execution: {
            canonicalType: "agentic-execution:asset-pack",
            lens: "deposit",
            proofStatus: null,
            closureFocus: null,
          },
          context: {
            source: "deposit-obfuscations-anchor",
            repositoryFullName: "octocat/Spoon-Knife",
            obfuscationsAnchorName: "Billing withhold",
          },
          output: {
            obfuscationsAnchor: {
              name: "Billing withhold",
              text: "Withhold the billing module internals.",
              permissibleSources: ["src/billing/", "src/payments/invoice.ts"],
              impermissibleSources: ["secret/"],
              permissibleSourceCount: 2,
              impermissibleSourceCount: 1,
              repositoryFullName: "octocat/Spoon-Knife",
              anchoredAt: "2026-07-02T10:00:00.000Z",
            },
          },
          items: [],
        },
      ]);
    }

    it("derives the previously anchored repository from liveRuns and passes it down", async () => {
      // DepositSourceSelection is mocked in this suite (it exposes the
      // received prop as a list); the selector UI that CONSUMES this prop is
      // unit-tested directly in depositSourceSelection.test.tsx.
      withAnchorFixtures();
      render(<DepositPageClient />);
      await openComposeDetail();

      const anchors = await screen.findByTestId(
        "deposit-source-selection-repository-anchors",
      );
      expect(
        within(anchors).getByText("octocat/OtherRepo"),
      ).toBeInTheDocument();
      // The default fixture's own "terminal-deposit-composer" run is not a
      // repository-anchor record and must not appear.
      expect(
        within(anchors).queryByText("octocat/Spoon-Knife"),
      ).not.toBeInTheDocument();
    });

    it("clears the Obfuscations textarea via Clear", async () => {
      withAnchorFixtures();
      render(<DepositPageClient />);
      await openComposeDetail();

      const textarea = (await screen.findByLabelText(
        "What to obfuscate or withhold",
      )) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "Withhold X." } });
      expect(textarea.value).toBe("Withhold X.");

      fireEvent.click(
        screen.getByRole("button", { name: "Clear obfuscations" }),
      );
      expect(textarea.value).toBe("");
    });

    it("offers a previously anchored Obfuscations configuration and loads it on selection", async () => {
      withAnchorFixtures();
      render(<DepositPageClient />);
      await openComposeDetail();

      const textarea = (await screen.findByLabelText(
        "What to obfuscate or withhold",
      )) as HTMLTextAreaElement;
      // Name field lives in the Anchor popover — not always visible.
      expect(
        screen.queryByLabelText("Obfuscations anchor name"),
      ).not.toBeInTheDocument();
      const anchorSelect = await screen.findByRole("combobox", {
        name: "Load a previously anchored Obfuscations configuration",
      });
      fireEvent.click(anchorSelect);
      // Named anchors use the name as the list item label; sub-text is
      // clipped body | hint-file count | exclusion-file count (all visible).
      const listbox = await screen.findByRole("listbox");
      expect(within(listbox).getByText("Billing withhold")).toBeInTheDocument();
      // Sub-text: clipped body + include/exclude icons with counts (shared
      // with the picker section headers).
      expect(
        within(listbox).getByText("Withhold the billing module internals."),
      ).toBeInTheDocument();
      expect(
        within(listbox).getByLabelText("2 paths in permissible sources"),
      ).toBeInTheDocument();
      expect(
        within(listbox).getByLabelText("1 path in impermissible sources"),
      ).toBeInTheDocument();
      fireEvent.click(within(listbox).getByText("Billing withhold"));

      expect(textarea.value).toBe("Withhold the billing module internals.");
      // Loading a named anchor pre-fills the draft name for the next Save.
      fireEvent.click(
        screen.getByRole("button", {
          name: "Anchor obfuscations to the activity ledger",
        }),
      );
      expect(
        (screen.getByLabelText("Obfuscations anchor name") as HTMLInputElement)
          .value,
      ).toBe("Billing withhold");
    });

    it("deletes an Obfuscations anchor from the load dropdown without loading it", async () => {
      withAnchorFixtures();
      const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
        if (
          typeof url === "string" &&
          url.includes("/api/executions/history/obfuscations-anchor-1") &&
          init?.method === "DELETE"
        ) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ deleted: true, id: "obfuscations-anchor-1" }),
          };
        }
        return { ok: true, json: async () => ({}) };
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      render(<DepositPageClient />);
      await openComposeDetail();

      const anchorSelect = await screen.findByRole("combobox", {
        name: "Load a previously anchored Obfuscations configuration",
      });
      fireEvent.click(anchorSelect);
      const listbox = await screen.findByRole("listbox");
      expect(within(listbox).getByText("Billing withhold")).toBeInTheDocument();

      fireEvent.click(
        within(listbox).getByRole("button", {
          name: "Delete Billing withhold",
        }),
      );

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          "/api/executions/history/obfuscations-anchor-1",
          expect.objectContaining({ method: "DELETE" }),
        ),
      );
      await waitFor(() =>
        expect(
          screen.queryByRole("option", { name: /Billing withhold/i }),
        ).not.toBeInTheDocument(),
      );
      expect(
        await screen.findByText("Obfuscations anchor deleted."),
      ).toBeInTheDocument();
      // Delete must not load the anchor body into the textarea.
      expect(
        (screen.getByLabelText(
          "What to obfuscate or withhold",
        ) as HTMLTextAreaElement).value,
      ).toBe("");
    });

    it("anchors the current Obfuscations text into the activity ledger with its name", async () => {
      withAnchorFixtures();
      const fetchMock = jest.fn(async (url: string) => {
        if (url === "/api/executions/history") {
          return {
            ok: true,
            json: async () => ({
              execution: {
                id: "obfuscations-anchor-2",
                created_at: "2026-07-03T10:00:00.000Z",
                status: "completed",
                type: "agentic-execution:asset-pack",
                context: {
                  source: "deposit-obfuscations-anchor",
                  obfuscationsAnchorName: "Payments withhold",
                },
                output: {
                  obfuscationsAnchor: {
                    name: "Payments withhold",
                    text: "Withhold the payments module.",
                    permissibleSources: [],
                    impermissibleSources: [],
                    permissibleSourceCount: 0,
                    impermissibleSourceCount: 0,
                    repositoryFullName: "octocat/Spoon-Knife",
                    anchoredAt: "2026-07-03T10:00:00.000Z",
                  },
                },
              },
            }),
          };
        }
        if (url.startsWith("/api/executions/history/")) {
          return {
            ok: true,
            json: async () => ({
              run: { id: url.split("/").pop(), status: "completed", output: {} },
              events: [],
            }),
          };
        }
        return { ok: true, json: async () => ({}) };
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      render(<DepositPageClient />);
      await openComposeDetail();

      const textarea = (await screen.findByLabelText(
        "What to obfuscate or withhold",
      )) as HTMLTextAreaElement;
      fireEvent.change(textarea, {
        target: { value: "Withhold the payments module." },
      });

      // Anchor button opens the name popover; Save anchor commits.
      fireEvent.click(
        screen.getByRole("button", {
          name: "Anchor obfuscations to the activity ledger",
        }),
      );
      fireEvent.change(screen.getByLabelText("Obfuscations anchor name"), {
        target: { value: "Payments withhold" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Save anchor" }),
      );

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          "/api/executions/history",
          expect.objectContaining({ method: "POST" }),
        ),
      );
      const call = fetchMock.mock.calls.find(
        ([url]) => url === "/api/executions/history",
      );
      const body = JSON.parse(String(call?.[1]?.body));
      expect(body.output.obfuscationsAnchor.text).toBe(
        "Withhold the payments module.",
      );
      expect(body.output.obfuscationsAnchor.name).toBe("Payments withhold");
      expect(body.output.obfuscationsAnchor.permissibleSources).toEqual([]);
      expect(body.output.obfuscationsAnchor.impermissibleSources).toEqual([]);
      expect(body.output.obfuscationsAnchor.permissibleSourceCount).toBe(0);
      expect(body.output.obfuscationsAnchor.impermissibleSourceCount).toBe(0);
      expect(body.context.source).toBe("deposit-obfuscations-anchor");
      expect(body.context.obfuscationsAnchorName).toBe("Payments withhold");
      expect(
        await screen.findByText(
          'Obfuscations anchor "Payments withhold" saved into the Bitcode activity ledger.',
        ),
      ).toBeInTheDocument();
      // Popover closes after a successful save.
      await waitFor(() =>
        expect(
          screen.queryByLabelText("Obfuscations anchor name"),
        ).not.toBeInTheDocument(),
      );
    });
  });
});
