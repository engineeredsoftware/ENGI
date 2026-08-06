/**
 * Buyer-visible DataPack material identity types.
 *
 * Multi-valued surfaces (compositions, tags, inventories) sit beside scalar
 * absolute volumes. Source-safe only: no raw source, no unbounded lists.
 */

/** Honesty class for buyer trust display. */
export type MaterialIdentityHonesty =
  | 'measured'
  | 'classified'
  | 'declared'
  | 'insufficient_evidence';

/** Share map id → share in [0,1]; shares should sum ≈ 1 when non-empty. */
export type MaterialComposition = {
  kind: string;
  label: string;
  shares: Record<string, number>;
  /** Dominant key when known. */
  primary: string | null;
  honesty: MaterialIdentityHonesty;
};

/**
 * Inventory row for dependencies / frameworks / services.
 * Usage fields are source-safe counts (never raw import paths).
 */
export type MaterialInventoryItem = {
  id: string;
  label: string;
  class?: string | null;
  evidence?: string | null;
  /** Manifest / lock declared (true) vs import-only discovery. */
  declared?: boolean;
  /** Distinct source files that reference this dependency (0..N). */
  fileHitCount?: number;
  /** Approximate reference events (import/require/use) across samples. */
  referenceCount?: number;
  /**
   * Project usage intensity 0..1 relative to other deps in this pack
   * (share of reference mass, not global popularity).
   */
  usageShare?: number;
  /** direct | transitive | unknown */
  scope?: 'direct' | 'transitive' | 'dev' | 'peer' | 'optional' | 'unknown';
};

export type MaterialInventory = {
  kind: string;
  label: string;
  items: MaterialInventoryItem[];
  /** Total deps discovered before inventory cap (honest long-tail size). */
  totalCount?: number;
  honesty: MaterialIdentityHonesty;
};

/** Closed-vocabulary multi-label tags. */
export type MaterialTagSet = {
  kind: string;
  label: string;
  tags: string[];
  primary: string | null;
  honesty: MaterialIdentityHonesty;
};

/**
 * Full material identity bag attached to a DataPack for opaque-IP buyers.
 * Schema id for storage/index stability.
 */
export type DataPackMaterialIdentity = {
  schema: 'bitcode.data-pack.material-identity';
  version: 1;
  compositions: MaterialComposition[];
  inventories: MaterialInventory[];
  tagSets: MaterialTagSet[];
  /**
   * Companion scalar volumes for commercial absolute kinds that summarize
   * identity (0..1). Keys are absolute measurementKind ids.
   */
  scalarVolumes: Record<string, number>;
  /** Source-safe corpus tokens for hybrid lexical/vector index. */
  corpusTokens: string[];
  honesty: MaterialIdentityHonesty;
  measuredAt: string;
};

export type MaterialIdentitySourceFile = {
  path: string;
  content: string;
};

export type MeasureMaterialIdentityInput = {
  title?: string | null;
  summary?: string | null;
  coveredSourcePaths?: string[] | null;
  fileChanges?: Array<{ path: string; op?: string }> | null;
  sources?: MaterialIdentitySourceFile[] | null;
  /** Optional corpus-relative substitution density 0..1 (index-time). */
  substitutionDensity?: number | null;
};
