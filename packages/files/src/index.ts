/**
 * @bitcode/files — file system **primitives** for Bitcode.
 *
 * Lowest-level package for paths, ops, security validation, and change tracking.
 * Patch artifacts, AssetPack descriptors, FileAttachments, and Host checkout
 * code should build on these types/helpers rather than redefining path+op.
 */

export type {
  FilePath,
  FileOp,
  FileChange,
  FileOperation,
  DirectoryOperation,
} from './types';
export { isFilePath, createFileChange } from './types';

export {
  absolutifyPath,
  normalizeRepoPath,
  verifyFileWithExtension,
  FileTracker,
  getAllFiles,
  extractExplicitFileReferences,
  listAllFiles,
} from './files';

export {
  validateFilePath,
  validateFileCommand,
  validateFileContent,
  createFileBackup,
  restoreFileFromBackup,
} from './securityUtils';
