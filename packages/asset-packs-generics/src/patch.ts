/**
 * AssetPack patch descriptor — path+op surface; optional full-file content
 * when product admits owner/settle material (depositor review, settle PR).
 *
 * File vocabulary primitives: @bitcode/files (FilePath, FileOp, FileChange).
 * Unpaid Exchange surfaces must strip `content` before buyer projection.
 */

import type { FileChange, FileOp, FilePath } from '@bitcode/files';

/** @see FileOp from @bitcode/files */
export type AssetPackFileOp = FileOp;

/** @see FileChange from @bitcode/files */
export interface AssetPackPatchFileChange extends FileChange {
  path: FilePath;
  op: AssetPackFileOp;
  /**
   * Full file body for this path when bound (depositor-owned / settle-ready).
   * Absent on unpaid commercial listings.
   */
  content?: string;
}

/**
 * Protocol patch surface carried by every AssetPack.
 * Path+op always; content optional for owner/settle materialization.
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
