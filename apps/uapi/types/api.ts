export interface Account {
  login: string;
  type: string;
  id: number;
}

export interface Repository {
  id: string;
  name: string;
}

export interface IssueOrPR {
  id: string;
  title: string;
  isPR: boolean;
  url: string;
}

export interface RepoFile {
  path: string;
  type: string;
  sha: string;
}

export interface AgenticExecutionSummary {
  canonicalType: string;
  family: 'asset-pack' | 'read-measurement' | 'proof-refresh' | 'upgrade' | 'agentic-execution';
  label: string;
  lens: 'deposit' | 'read' | 'closure';
  proofStatus: string;
  closureFocus: string;
}

/** Response from GET /api/executions?action=installations */
export interface InstallationResponse {
  accounts: Account[];
}

export interface Shippable {
  url: string;
  number?: number;
  title?: string;
  type: 'pr';
}

export type AssetPackFileChanges = {
  edited: number;
  created: number;
  deleted: number;
  paths?: string[];
  charDiff?: {
    edited: number;
    created: number;
    deleted: number;
  };
};

export type AssetPackSurface = {
  pullRequest?: Shippable | null;
  fileChanges?: AssetPackFileChanges | null;
  summary?: string | null;
};

export type AssetPackSynthesisArtifactsSurface = AssetPackSurface & {
  proofEvidence?: string[] | null;
  reviewNotes?: string[] | null;
};

export interface CompletionData {
  /** Full markdown summary of work completed */
  summary: string;
  /** Primary display string or title */
  display: string;
  /**
   * Settle delivery surface (buyer PR after rights). Prefer `settleDelivery`.
   * `shippables` is dual-written for historical reread only.
   */
  settleDelivery?: AssetPackSurface | null;
  shippables?: AssetPackSurface | null;
  /** Bitcode-owned implementation-phase AssetPack synthesis artifacts. */
  assetPackSynthesisArtifacts?: AssetPackSynthesisArtifactsSurface | null;
  /** Semantic reread of the AssetPack synthesis artifacts. */
  writtenAssets?: AssetPackSurface | null;
  /** Delivery mechanism projected onto connected interfaces. */
  deliveryMechanism?: AssetPackSurface | null;
  semanticKind?: 'asset-pack-written-asset';
  read?: string | null;
  writtenAssetType?: string | null;
  assetPack?: {
    read?: string | null;
    writtenAssetType?: string | null;
    definitionOfRead?: string | null;
    deliveryTarget?: string | null;
  } | null;
  /** Total time in milliseconds */
  duration: number;
  /** Type of task executed */
  taskType: string;
  /** Processing statistics (runtime metrics) */
  processingStats?: {
    /** Human-readable duration, e.g. "4m 18s" */
    time: string;
    /** Token usage counts */
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
    /** Measured non-fungible $BTD content amount */
    measuredBtd?: number;
    btdSemantics?: 'non_fungible_asset_pack_share_read_right' | string;
    feeAsset?: 'BTC' | string;
    btcFeesPaid?: number | null;
    btcFeeUsdEquivalent?: number;
  };
  /** Snapshot of the repository at time of execution */
  repoSnapshot?: {
    org: string;
    repo: string;
    branch: string;
    commit: string;
  };
}

export interface UrlEntry {
  url: string;
  title: string;
  origin: string;
  status?: 'success' | 'error';
}
// Record type for a single Shippable history item.
export interface ShippableHistoryItem {
  id: string;
  title: string;
  output?: string | null;
  repository?: string | null;
  shippable_type: 'pr';
  shippable_id?: string | null;
  shippable_status?: string | null;
  attached_urls?: any;
  selected_files?: any;
  created_at: string;
  run_id: string;
}

// Wrapper object representing a single AssetPack pipeline execution.
export interface PipelineExecution {
  id: string;
  created_at: string;
  guide?: string | null;
  type?: string | null;
  agentic_execution?: AgenticExecutionSummary | null;
  status?: string;
  output?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  items: ShippableHistoryItem[];
  /**
   * Arbitrary JSON context blob attached to the run. Current pipelines attach
   * a rich object matching `GlobalContext` (see `lib/context`). Keep this
   * loosely typed so callers can narrow as needed.
   */
  context?: Record<string, any> | string | null;

  /** Optional markdown summary stored by backend */
  summary?: string | null;

  /** product failure payload from executions.error (source-safe message). */
  error?: { message?: string | null } | string | null;

  /** Execution metrics (time, tokens, measured $BTD, BTC fee posture, latency) */
  processing_stats?: {
    time: string;
    tokens?: { input: number; output: number; total: number };
    measuredBtd?: number;
    btdSemantics?: 'non_fungible_asset_pack_share_read_right' | string;
    feeAsset?: 'BTC' | string;
    btcFeesPaid?: number | null;
    btcFeeUsdEquivalent?: number;
    averageLatencyMs?: number | null;
    modelUsage?: Array<{
      provider: string;
      model: string;
      callCount: number;
      totalTokens: number;
      inputTokens: number;
      outputTokens: number;
      totalCostUsd: number;
      averageLatencyMs: number | null;
    }>;
  } | null;

  /** Repository snapshot meta */
  repo_snapshot?: { org: string; repo: string; branch: string; commit: string } | null;
  /** Bitcode-owned implementation-phase AssetPack synthesis artifacts. */
  asset_pack_synthesis_artifacts?: AssetPackSynthesisArtifactsSurface | null;
  /** Semantic reread of the AssetPack synthesis artifacts. */
  written_assets?: AssetPackSurface | null;
  /** V26 Finish-delivered pull-request Shippable. */
  shippables?: AssetPackSurface | null;
  /** Delivery mechanism projected onto the connected pull-request interface. */
  delivery_mechanism?: AssetPackSurface | null;
  read?: string | null;
  written_asset_type?: string | null;
  asset_pack?: {
    read?: string | null;
    writtenAssetType?: string | null;
    definitionOfRead?: string | null;
    deliveryTarget?: string | null;
  } | null;

  /** Canonical AssetPack completion payload. */
  asset_pack_completion?: {
    summary?: string | null;
    /** Primary Finish-delivered Shippables. */
    shippables?: AssetPackSurface;
    /** Bitcode-owned implementation-phase AssetPack synthesis artifacts. */
    assetPackSynthesisArtifacts?: AssetPackSynthesisArtifactsSurface;
    /** Semantic reread of the AssetPack synthesis artifacts. */
    writtenAssets?: AssetPackSurface;
    /** Delivery mechanism projected onto connected interfaces. */
    deliveryMechanism?: AssetPackSurface;
    read?: string | null;
    writtenAssetType?: string | null;
    assetPack?: {
      read?: string | null;
      writtenAssetType?: string | null;
      definitionOfRead?: string | null;
      deliveryTarget?: string | null;
    };
    processingStats?: {
      time: string;
      tokens?: { input: number; output: number; total: number };
      measuredBtd?: number;
      btdSemantics?: 'non_fungible_asset_pack_share_read_right' | string;
      feeAsset?: 'BTC' | string;
      btcFeesPaid?: number | null;
      btcFeeUsdEquivalent?: number;
      averageLatencyMs?: number | null;
      modelUsage?: Array<{
        provider: string;
        model: string;
        callCount: number;
        totalTokens: number;
        inputTokens: number;
        outputTokens: number;
        totalCostUsd: number;
        averageLatencyMs: number | null;
      }>;
    };
    repoSnapshot?: { org: string; repo: string; branch: string; commit: string };
  } | null;
}
// Record type for a single Evidence Document history item.
export interface EvidenceDocumentHistoryItem {
  id: string;
  title: string;
  output?: string | null;
  repository?: string | null;
  evidenceDocumentType: string;
  metrics?: any;
  created_at: string;
  run_id: string;
}
// Wrapper object representing a single user run that may contain multiple Evidence Documents.
export interface EvidenceDocumentRun {
  id: string;
  created_at: string;
  items: EvidenceDocumentHistoryItem[];
  summary?: string | null;
  processing_stats?: {
    time: string;
    tokens?: { input: number; output: number; total: number };
    measuredBtd?: number;
    btdSemantics?: 'non_fungible_asset_pack_share_read_right' | string;
    feeAsset?: 'BTC' | string;
    btcFeesPaid?: number | null;
    btcFeeUsdEquivalent?: number;
    averageLatencyMs?: number | null;
    modelUsage?: Array<{
      provider: string;
      model: string;
      callCount: number;
      totalTokens: number;
      inputTokens: number;
      outputTokens: number;
      totalCostUsd: number;
      averageLatencyMs: number | null;
    }>;
  } | null;
  repo_snapshot?: { org: string; repo: string; branch: string; commit: string } | null;
  asset_pack_synthesis_artifacts?: { summary?: string | null } | null;
  written_assets?: { summary?: string | null } | null;
  shippables?: { summary?: string | null } | null;
  read?: string | null;
  written_asset_type?: string | null;
  asset_pack?: {
    read?: string | null;
    writtenAssetType?: string | null;
    definitionOfRead?: string | null;
    deliveryTarget?: string | null;
  } | null;
  asset_pack_completion?: {
    summary?: string | null;
    shippables?: { summary?: string | null };
    assetPackSynthesisArtifacts?: { summary?: string | null };
    writtenAssets?: { summary?: string | null };
    read?: string | null;
    writtenAssetType?: string | null;
    assetPack?: {
      read?: string | null;
      writtenAssetType?: string | null;
      definitionOfRead?: string | null;
      deliveryTarget?: string | null;
    };
    processingStats?: {
      time: string;
      tokens?: { input: number; output: number; total: number };
      measuredBtd?: number;
      btdSemantics?: 'non_fungible_asset_pack_share_read_right' | string;
      feeAsset?: 'BTC' | string;
      btcFeesPaid?: number | null;
      btcFeeUsdEquivalent?: number;
      averageLatencyMs?: number | null;
      modelUsage?: Array<{
        provider: string;
        model: string;
        callCount: number;
        totalTokens: number;
        inputTokens: number;
        outputTokens: number;
        totalCostUsd: number;
        averageLatencyMs: number | null;
      }>;
    };
    repoSnapshot?: { org: string; repo: string; branch: string; commit: string };
  } | null;
}

// Unified postprocessed result type
export type ShippableArtifacts = {
  filesCreated: string[];
  filesModified: string[];
  testsAdded: number;
  testsPassing?: number;
  documentation: string[];
};

export type ValidationReadySnapshot = {
  approved: boolean;
  assessment?: unknown | null;
  confidence?: number | null;
};

export type PostprocessedResult = {
  executionId: string;
  kind: 'shippable' | 'multi-shippable' | 'evidence_document';
  title: string;
  repository?: string;
  summary?: string;
  artifacts?: ShippableArtifacts | null;
  validationReady?: ValidationReadySnapshot;
  entries?: PostprocessedResult[];
  series?: PostprocessedResult[];
  evidenceDocumentType?: string;
  output?: string;
};

// Route Pipeline Execution – Preprocessed (top-level)
export type RoutePreprocessed = {
  assetPackWrittenAsset?: {
    preprocessing: { multi: boolean; compute: boolean };
    selectedPipeline: 'multi' | 'standard';
    provisioning: 'requested' | 'skipped' | 'ready' | 'failed';
  };
};
