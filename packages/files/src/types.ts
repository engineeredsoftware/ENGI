/**
 * File primitives — lowest-level file path and change vocabulary.
 *
 * Hierarchy:
 *   @bitcode/files                         # this package (file primitives)
 *     → @bitcode/file-editing              # atomic edit transactions / commands
 *     → @bitcode/file-refactoring          # symbol rename / multi-file refactors
 *     → @bitcode/asset-packs-generics      # AssetPack path+op patch descriptors
 *     → @bitcode/generic-artifacts-patch   # PatchArtifact file entries
 *     → @bitcode/generic-attachments-file  # FileAttachment base
 *     → generic-tools / Host checkout ops
 *
 * Any package that names a path, op, or file change should start from these types.
 */

/** Repo-relative or absolute path string (callers normalize with path helpers). */
export type FilePath = string;

/**
 * Primitive file operations for patches, trackers, and host mutations.
 * Product layers may narrow or alias (e.g. AssetPackFileOp).
 */
export type FileOp = 'add' | 'modify' | 'delete' | 'rename' | string;

/**
 * Minimal path+op change — no content required (source-safe by default).
 */
export interface FileChange {
  path: FilePath;
  op: FileOp;
  /** Rename target when op is rename. */
  toPath?: FilePath;
}

/**
 * Mutation record used by FileTracker and pipeline file history.
 * Distinct from FileChange: includes content and timestamps for ops logs.
 */
export interface FileOperation {
  type: 'edit' | 'create' | 'delete' | 'rename';
  path: FilePath;
  oldPath?: FilePath;
  content?: string;
  timestamp: number;
}

export interface DirectoryOperation {
  type: 'move_dir' | 'rename_dir' | 'delete_dir' | 'create_dir';
  path: FilePath;
  newPath?: FilePath;
  timestamp: number;
  affectedFiles: FilePath[];
}

export function isFilePath(value: unknown): value is FilePath {
  return typeof value === 'string' && value.trim().length > 0;
}

export function createFileChange(path: string, op: FileOp = 'modify', toPath?: string): FileChange {
  if (!isFilePath(path)) {
    throw new Error('path must be a non-empty string');
  }
  return {
    path: path.trim(),
    op,
    ...(toPath && isFilePath(toPath) ? { toPath: toPath.trim() } : {}),
  };
}
