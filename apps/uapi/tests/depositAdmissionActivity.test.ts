import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';
/**
 * Per-option deposit admission ledger payloads for /exchange projection.
 */
import {
  buildDepositOptionAdmissionActivityDraft,
  buildDepositOptionPatchfileDownload,
  buildDepositOptionReviewArtifact,
  projectOptionAbsoluteMeasurements,
} from "@/components/deposits/models/deposit-admission-activity";
import type { DepositOptionAdmissionReceipt } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission";
import type { DepositAssetPackOption } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options";

const option = {
  schema: "bitcode.deposit.asset-pack-option",
  optionId: "opt-1",
  kind: "capability-slice",
  title: "Auth middleware slice",
  summary: "Extracts auth middleware.",
  sourceBinding: {
    repositoryFullName: "octocat/Spoon-Knife",
    sourceBranch: "main",
    sourceCommit: "abc",
    sourcePathRoots: ["src/auth.ts"],
    sourcePathCount: 1,
    rawSourceStoredExternally: true as const,
    protectedSourceVisibleInOption: false as const,
  },
  demandAlignment: {
    posture: "source-safe-demand-signals-only" as const,
    depositorySignalRoots: [],
    readingSignalRoots: [],
    existingDepositorySignalRoots: [],
    confidence: 0.5,
  },
  measurements: [
    {
      id: "function-count",
      label: "Function count",
      measurementKind: "function-count",
      weight: 0.14,
      volume: 0.4,
      category: "absolute" as const,
      magnitude: 8,
      unit: "functions",
      evidenceRoot: "ev-fn",
    },
  ],
  contents: {
    patchSummary: "Add auth middleware helper",
    fileChanges: [{ path: "src/auth.ts", op: "modify" }],
    provenantSourcePaths: ["src/auth.ts"],
    provenantSourceCount: 1,
  },
  reviewBoundary: {
    state: "reviewable-source-safe-option" as const,
    decision: "pending-depositor-review" as const,
    depositAdmissionBoundary: "not-admitted-until-depositor-approval" as const,
    btdMintBoundary: "not-minted-by-deposit-option" as const,
    settlementBoundary:
      "future-reader-settlement-required-for-source-bearing-assetpack" as const,
  },
  policyBoundary: {
    sourceCriticalityPolicy: "deferred-to-gate6" as const,
    demandRoiPolicy: "deferred-to-gate6" as const,
    compensationPolicy: "deferred-to-gate6" as const,
  },
  visibility: {
    sourceSafeMetadataOnly: true as const,
    protectedSourceVisible: false as const,
    rawSourceTextVisible: false as const,
    unpaidAssetPackSourceVisible: false as const,
    rawPromptVisible: false as const,
    interpolatedPromptVisible: false as const,
    rawProviderResponseVisible: false as const,
    walletPrivateMaterialVisible: false as const,
  },
  roots: {
    optionRoot: "option-root-1",
    sourceBindingRoot: "src-root-1",
    demandAlignmentRoot: "demand-root-1",
    measurementRoot: "measurement-root-1",
    contentsRoot: "contents-root-1",
    reviewBoundaryRoot: "review-root-1",
  },
} as DepositAssetPackOption;

const receipt = {
  optionId: "opt-1",
  optionKind: "capability-slice",
  title: "Auth middleware slice",
  admission: {
    state: "admitted-to-depository",
    depositoryAssetPackId: "depository-assetpack-abc",
    blockers: [],
    warnings: [],
  },
  compensationPreview: { state: "compensation-preview-ready" },
  packsActivitySync: {
    state: "synchronized-to-packs",
    route: "/exchange",
    activityType: "depository-assetpack",
    activityRoot: "packs-activity-root-1",
  },
  roots: {
    admissionReceiptRoot: "admission-receipt-1",
    packsActivityRoot: "packs-activity-root-1",
  },
} as unknown as DepositOptionAdmissionReceipt;

describe("deposit-admission-activity", () => {
  it("projects absolute measurements from the option", () => {
    const rows = projectOptionAbsoluteMeasurements(option);
    // Full commercial catalogue (46), not a partial hand list.
    expect(rows.length).toBeGreaterThanOrEqual(65);
    const fn = rows.find((r) => r.kind === "function-count");
    expect(fn).toMatchObject({
      kind: "function-count",
      category: "absolute",
      magnitude: 8,
      unit: "functions",
      volume: 0.4,
    });
    // SSOT catalogue weight (not legacy 0.12).
    expect(fn?.weight).toBe(
      DATA_PACK_ABSOLUTES_CATALOG.find((r) => r.measurementKind === 'function-count')?.weight,
    );
    expect(rows.every((r) => typeof r.weight === "number" && r.weight > 0)).toBe(
      true,
    );
  });

  it("builds per-option admission draft without session aggregates or patch body", () => {
    const draft = buildDepositOptionAdmissionActivityDraft({
      receipt,
      option,
      synthesisRunId: "synth-run-1",
    });
    expect(draft.type).toBe("pipeline:deposit-option-admission");
    expect(draft.output).toMatchObject({
      assetPackTitle: "Auth middleware slice",
      optionId: "opt-1",
      admissionState: "admitted-to-depository",
    });
    expect(draft.output).not.toHaveProperty("depositAdmission");
    expect(draft.output).not.toHaveProperty("candidateCount");
    expect(draft.output).not.toHaveProperty("admittedCount");
    expect(draft.output).not.toHaveProperty("ownerContents");
    expect(JSON.stringify(draft)).not.toContain("Add auth middleware helper");
    const measurements = (draft.output as { measurements: unknown }).measurements;
    // Nested bag { absolutes, materialIdentity?, measureReport? } or legacy flat array.
    const abs = Array.isArray(measurements)
      ? measurements
      : Array.isArray((measurements as { absolutes?: unknown[] })?.absolutes)
        ? (measurements as { absolutes: unknown[] }).absolutes
        : [];
    expect(abs.length).toBeGreaterThanOrEqual(65);
    expect(
      abs.some(
        (m) =>
          m &&
          typeof m === "object" &&
          (m as { kind?: string }).kind === "function-count" &&
          typeof (m as { status?: string }).status === "string",
      ),
    ).toBe(true);
    expect(draft.context).toMatchObject({
      source: "deposit-option-review-admission",
      optionId: "opt-1",
      synthesisRunId: "synth-run-1",
    });
  });

  it("builds a path-op AssetPack patchfile download payload", () => {
    const file = buildDepositOptionPatchfileDownload(option);
    expect(file.filename).toMatch(/\.path-op\.json$/);
    expect(file.mimeType).toBe("application/json");
    const parsed = JSON.parse(file.body) as {
      schema: string;
      format: string;
      files: unknown[];
      assetPack: { measurements: unknown[] };
    };
    expect(parsed.schema).toBe("bitcode.artifact.patch");
    expect(parsed.format).toBe("path-op-json");
    expect(parsed.files).toHaveLength(1);
    expect(parsed.assetPack.measurements.length).toBeGreaterThanOrEqual(65);
  });

  it("builds depositor review artifact with honesty + full measurements", () => {
    const file = buildDepositOptionReviewArtifact(option);
    expect(file.filename).toMatch(/\.datapack\.review\.json$/);
    const parsed = JSON.parse(file.body) as {
      schema: string;
      version: number;
      patch: { files: unknown[]; format: string };
      measurements: {
        absolutes: Array<{ kind: string; status: string | null }>;
      };
      honesty: { measuredKindCount: number; expandedFillCount: number };
      metadata: { optionId: string; title: string };
    };
    expect(parsed.schema).toBe("bitcode.datapack.review-artifact");
    expect(parsed.version).toBe(1);
    expect(parsed.patch.format).toBe("path-op-json");
    expect(parsed.patch.files).toHaveLength(1);
    expect(parsed.metadata.optionId).toBe("opt-1");
    expect(parsed.measurements.absolutes.length).toBeGreaterThanOrEqual(65);
    const fn = parsed.measurements.absolutes.find((a) => a.kind === "function-count");
    expect(fn?.status).toBeTruthy();
    expect(parsed.honesty.expandedFillCount).toBeGreaterThan(0);
    expect(parsed.honesty.measuredKindCount).toBeGreaterThanOrEqual(1);
  });
});
