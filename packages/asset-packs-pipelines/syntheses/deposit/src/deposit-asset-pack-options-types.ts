/**
 * Deposit AssetPack option synthesis types (blueprint path).
 *
 * Schema contracts for source-safe deposit options shown on /deposits before
 * depositor approval, admission, or BTD mint. No builders live here.
 *
 * Pack contents project from SynthesisAssetPack / DepositSynthesizedAssetPack.
 * Protocol primitives: @bitcode/asset-packs-generics.
 */

/** Settled-depository demand estimate shown on a deposit option (not a measurement kind). */
export interface DepositDemandEstimate {
  volume: number;
  demand: number;
  saturation: number;
  rationale: string;
}

export type DepositAssetPackOptionKind =
  | 'capability-slice'
  | 'implementation-pattern'
  | 'proof-operations-slice';

export type DepositAssetPackOptionReviewState =
  | 'reviewable-source-safe-option'
  | 'blocked-source-binding'
  | 'blocked-empty-source';

export interface DepositOptionDemandSignal {
  id?: string | null;
  label?: string | null;
  summary?: string | null;
  weight?: number | null;
}

export interface DepositOptionSynthesisRequest {
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  obfuscations?: string | null;
  permissibleSources?: string[] | null;
  depositoryDemandSignals?: DepositOptionDemandSignal[] | null;
  readingDemandSignals?: DepositOptionDemandSignal[] | null;
  existingDepositorySignals?: DepositOptionDemandSignal[] | null;
  createdAt?: string | null;
}

export interface DepositAssetPackOptionMeasurement {
  id: string;
  label: string;
  // Absolutes catalog kinds (function-count, type-count, file-span, …).
  measurementKind: string;
  weight: number;
  volume: number;
  /** Which measurement category — absolutes form the weighted composite. */
  category?: 'absolute' | 'neediness';
  /** Raw count for size measurements (functions / types / files). */
  magnitude?: number;
  /** functions | types | files | estimate | normalized. */
  unit?: string;
  /**
   * Source-safe instance prose for this reading (generated at measure time).
   * Prefer over catalog fallback when projecting admission / packs activity.
   */
  descriptor?: string;
  /**
   * Honesty: measured | estimated | insufficient_evidence | expanded-fill |
   * not_run | not_implemented. Fill zeros must not read as measured clean.
   */
  status?:
    | 'measured'
    | 'estimated'
    | 'insufficient_evidence'
    | 'expanded-fill'
    | 'not_run'
    | 'not_implemented'
    | string;
  evidenceRoot: string;
}

export interface DepositAssetPackOption {
  schema: 'bitcode.deposit.asset-pack-option';
  optionId: string;
  kind: DepositAssetPackOptionKind;
  title: string;
  summary: string;
  sourceBinding: {
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
    sourcePathRoots: string[];
    sourcePathCount: number;
    rawSourceStoredExternally: true;
    protectedSourceVisibleInOption: false;
  };
  demandAlignment: {
    posture: 'source-safe-demand-signals-only';
    depositorySignalRoots: string[];
    readingSignalRoots: string[];
    existingDepositorySignalRoots: string[];
    confidence: number;
  };
  measurements: DepositAssetPackOptionMeasurement[];
  // Deposit-decision payload: what Bitcode RECEIVES if this AP is deposited.
  // Shown to the depositor (source owner). Path+op + summary + provenant paths;
  // optional full-file `content` on fileChanges for the admitted/settled material
  // and depositor `.patch` download. Exchange/unpaid must strip content.
  // Absent (null) on deterministic blueprint synthesis without a real measure.
  contents?: {
    patchSummary: string;
    fileChanges: Array<{ path: string; op: string; content?: string }>;
    provenantSourcePaths: string[];
    provenantSourceCount: number;
    /** Unified-diff text when bodies were bound at patchfile write. */
    unifiedDiff?: string | null;
  } | null;
  /**
   * @deprecated Neediness is entirely a Read-pipeline concept.
   * Demand guidance lives under demandAlignment; never a neediness measurement row.
   */
  neediness?: DepositDemandEstimate | null;
  reviewBoundary: {
    state: DepositAssetPackOptionReviewState;
    decision: 'pending-depositor-review';
    depositAdmissionBoundary: 'not-admitted-until-depositor-approval';
    btdMintBoundary: 'not-minted-by-deposit-option';
    settlementBoundary: 'future-reader-settlement-required-for-source-bearing-assetpack';
  };
  policyBoundary: {
    sourceCriticalityPolicy: 'deferred-to-gate6';
    demandRoiPolicy: 'deferred-to-gate6';
    compensationPolicy: 'deferred-to-gate6';
  };
  visibility: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
  };
  roots: {
    optionRoot: string;
    sourceBindingRoot: string;
    demandAlignmentRoot: string;
    measurementRoot: string;
    contentsRoot?: string | null;
    /** @deprecated Neediness is Read-pipeline only. */
    needinessRoot?: string | null;
    reviewBoundaryRoot: string;
  };
}

export interface DepositAssetPackOptionSynthesis {
  schema: 'bitcode.deposit.asset-pack-option-synthesis';
  pipeline: 'DepositAssetPackOptionSynthesis';
  requestId: string;
  createdAt: string;
  request: {
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
    depositorInstructionRoot: string | null;
    sourcePathRoots: string[];
  };
  options: DepositAssetPackOption[];
  optionCount: number;
  sourceSafety: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
  };
  reviewBoundary: {
    route: '/deposits';
    defaultDecisionState: 'pending-depositor-review';
    approvedOptionsAdmittedBy: 'future-gate7-deposit-option-review';
    sourceCriticalityDemandRoiPolicyOwnedBy: 'future-gate6-policy';
  };
  roots: {
    requestRoot: string;
    synthesisRoot: string;
    optionRoots: string[];
  };
}
