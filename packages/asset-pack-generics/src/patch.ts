/**
 * AssetPack patch descriptor — path+op surface (no raw file contents).
 */

export type AssetPackFileOp = 'add' | 'modify' | 'delete' | 'rename' | string;

export interface AssetPackPatchFileChange {
  path: string;
  op: AssetPackFileOp;
}

/**
 * Minimal protocol patch surface carried by every AssetPack.
 * Implementations may extend; primitives stay content-free.
 */
export interface AssetPackPatchDescriptor {
  patchSummary: string;
  fileChanges: AssetPackPatchFileChange[];
}

export function createAssetPackPatchDescriptor(input: {
  patchSummary?: string | null;
  fileChanges?: AssetPackPatchFileChange[] | null;
}): AssetPackPatchDescriptor {
  const fileChanges = Array.isArray(input.fileChanges)
    ? input.fileChanges.filter(
        (c) => c && typeof c.path === 'string' && c.path.length > 0,
      )
    : [];
  return {
    patchSummary: String(input.patchSummary || '').trim() || 'AssetPack patch',
    fileChanges,
  };
}
