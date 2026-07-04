import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import DepositPageClient from "@/app/deposits/DepositPageClient";

const mockReplace = jest.fn();
const mockFetchPipelineExecutionHistory = jest.fn();
const mockUseAuth = jest.fn();
const mockUseUserData = jest.fn();
let mockQuery = "transactionId=deposit-1&depositStage=review-options";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(mockQuery),
}));

jest.mock("@/components/base/bitcode/auth/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/hooks/useUserData", () => ({
  useUserData: () => mockUseUserData(),
}));

jest.mock("@/networking/api-client", () => ({
  fetchPipelineExecutionHistory: () => mockFetchPipelineExecutionHistory(),
}));

// The miniature run orb pulls framer-motion + canvas layers that jsdom cannot
// animate; the header contract (orb present next to the clock + run id) is
// asserted via the stub.
jest.mock("@/components/base/bitcode/effects/quantum-orb", () => ({
  QuantumOrb: () => <div data-testid="quantum-orb-stub" />,
  minimalPreset: {},
}));

// PipelineExecutionLog pulls react-syntax-highlighter ESM styles that jest
// cannot transform; the telemetry panel contract is asserted via the stub.
jest.mock("@/components/base/bitcode/execution/pipeline-execution-log", () => ({
  PipelineExecutionLog: ({
    output,
    isProcessing,
  }: {
    output: string;
    isProcessing: boolean;
  }) => (
    <div data-testid="pipeline-execution-log" data-processing={String(isProcessing)}>
      {output}
    </div>
  ),
}));

jest.mock("@/app/terminal/terminal-shell-bridge", () => ({
  TerminalShellBridgeProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>,
  useTerminalShellBridge: () => ({
    snapshot: null,
    runControl: jest.fn(),
  }),
}));

jest.mock("@/app/deposits/DepositSourceSelection", () => ({
  __esModule: true,
  default: ({
    onContextChange,
    routePath,
  }: {
    onContextChange: (value: unknown) => void;
    routePath?: string;
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
          owner: { username: "engineeredsoftware" },
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
        data-route-path={routePath}
      >
        Deposit source selection
      </section>
    );
  },
}));

jest.mock("@/app/terminal/TerminalDepositComposer", () => ({
  __esModule: true,
  default: ({
    showDemonstrationDraft,
  }: {
    showDemonstrationDraft?: boolean;
  }) => (
    <section
      aria-label="Deposit composer"
      data-demonstration={showDemonstrationDraft ? "true" : "false"}
    >
      Deposit composer
    </section>
  ),
}));

describe("DepositPageClient", () => {
  beforeEach(() => {
    mockReplace.mockReset();
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
          org: "engineeredsoftware",
          repo: "ENGI",
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
    // The route step grid is removed from /deposits — the route header, the
    // pipelines master-detail, and the flow sections carry the journey.
    expect(
      screen.queryByTestId("deposit-route-step-connect-source"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Source-safe deposit state")).toBeInTheDocument();
    expect(screen.getByText("Disclosure boundary")).toBeInTheDocument();
    expect(
      screen.getByText(/Withheld: raw source, unpaid AssetPack source, prompts/u),
    ).toBeInTheDocument();
    expect(screen.getByText("Organization authority")).toBeInTheDocument();
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
    expect(screen.getByText("Deposit pipelines")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByTestId("deposit-synthesis-telemetry"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByTestId("deposits-pipelines-table"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to Deposit pipelines" }),
    ).toBeInTheDocument();
  });

  it("returns from the run detail to the pipelines table via Back", async () => {
    render(<DepositPageClient />);

    const backButton = await screen.findByRole("button", {
      name: "Back to Deposit pipelines",
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
          repositoryFullName: "engineeredsoftware/ENGI",
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
                    repositoryFullName: "engineeredsoftware/ENGI",
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
      expect(fetchMock).toHaveBeenCalledWith("/api/executions/history/resume-run-1"),
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
        repositoryFullName: "engineeredsoftware/ENGI",
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
          id: "deposit-option-real-1:source-coverage",
          label: "Source coverage",
          measurementKind: "source-coverage",
          weight: 0.36,
          volume: 0.62,
          evidenceRoot: "deposit-option-measurement:22222222",
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
        repositoryFullName: "engineeredsoftware/ENGI",
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
        protectedIpExclusionCount: 1,
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
    // F26-B: the route DISPATCHES the run (returns dispatched, no synthesis); the
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

    // Pick the exclusion from the repository file tree (fetched at the
    // selected repo·branch·commit); a directory selects its prefix.
    const exclusionsTree = await screen.findByLabelText(
      "Protected IP exclusions file tree",
    );
    const secretEngineRow = await within(exclusionsTree).findByText(
      "secret-engine/",
    );
    fireEvent.click(secretEngineRow);

    const synthesizeButton = await screen.findByRole("button", {
      name: "Synthesize options",
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
    expect(body.repositoryFullName).toBe("engineeredsoftware/ENGI");
    expect(body.protectedIpExclusions).toEqual(["secret-engine/"]);
    expect(Array.isArray(body.demandContext)).toBe(true);

    await waitFor(() =>
      expect(
        screen.getByText("Real measured capability slice"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByTestId("deposit-synthesis-inference"),
    ).toHaveTextContent("AssetPacksSynthesis");
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
        repositoryFullName: "engineeredsoftware/ENGI",
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
        repositoryFullName: "engineeredsoftware/ENGI",
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
    const synthesizeButton = await screen.findByRole("button", {
      name: "Synthesize options",
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

    // Neediness preview tile: volume, demand, saturation percentages + rationale.
    expect(text).toContain("Neediness · est. read demand");
    expect(text).toContain("62% · demand 70% · saturation 20%");
    expect(text).toContain(
      "Readers repeatedly probe reconciliation flows with no fit AssetPack.",
    );

    // Absolutes tiles: magnitude+unit rendering vs pure volume/weight rendering.
    expect(text).toContain("Function count");
    expect(text).toContain("12 functions · 55% / weight 0.40");
    expect(text).toContain("Semantic volume");
    // unit "normalized" is suppressed — volume/weight only.
    expect(text).toContain("48% / weight 0.25");
    expect(text).not.toContain("normalized");

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
    // The synthesize action is re-enabled for a retry (not stuck in running).
    expect(
      screen.getByRole("button", { name: "Synthesize options" }),
    ).not.toBeDisabled();
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
            run: { id: url.split("/").pop(), output: {} },
            events: [
              { id: "c1", event: { type: "completion" }, created_at: "2026-07-01T22:00:05.000Z" },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as unknown as typeof fetch;

    await dispatchSynthesis();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Synthesized options were not found for this run.",
    );
    expect(
      screen.getByTestId("deposit-options-await-synthesis"),
    ).toBeInTheDocument();
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
});
