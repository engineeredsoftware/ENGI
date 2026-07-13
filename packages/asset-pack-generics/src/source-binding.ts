/**
 * AssetPack source binding — revision + path roots without raw source.
 *
 * Protocol law: raw source stays on Host / external store; the pack carries
 * source-safe binding only.
 */

export interface AssetPackSourceBinding {
  repositoryFullName: string | null;
  sourceBranch: string | null;
  sourceCommit: string | null;
  /** Covered path roots (source-safe; not file contents). */
  sourcePathRoots: string[];
  sourcePathCount: number;
  /** Always true on protocol packs: blobs are not embedded in the pack object. */
  rawSourceStoredExternally: true;
  /** Always false: protected source is never visible in the pack descriptor. */
  protectedSourceVisible: false;
}

export function createAssetPackSourceBinding(input: {
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  sourcePathRoots?: string[] | null;
}): AssetPackSourceBinding {
  const roots = Array.isArray(input.sourcePathRoots)
    ? input.sourcePathRoots.filter((p) => typeof p === 'string' && p.length > 0)
    : [];
  return {
    repositoryFullName: input.repositoryFullName ?? null,
    sourceBranch: input.sourceBranch ?? null,
    sourceCommit: input.sourceCommit ?? null,
    sourcePathRoots: roots,
    sourcePathCount: roots.length,
    rawSourceStoredExternally: true,
    protectedSourceVisible: false,
  };
}
