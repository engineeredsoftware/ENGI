/**
 * @bitcode/attachments-generics — Universal attachment types for Bitcode
 *
 * barrel across the entire Bitcode codebase. Prefer leaf packages:
 *   @bitcode/attachment-generics
 *   @bitcode/generic-attachments-file
 *   @bitcode/generic-attachments-external
 *
 * Categories: file | external only.
 * integration → external (Externals auxillary). vcs / url removed.
 */

export * from './types';
export * from './utils';
export { isValidURL, parseURL } from './url-utils';

export type {
  Attachment,
  AttachmentCategory,
  BaseAttachment,
  AttachmentReference,
  CreateAttachmentInput,
  FileAttachment,
  FileAttachmentType,
  ExternalAttachment,
  ExternalProvider,
  ExternalAttachmentType,
} from './types';

export {
  validateAttachmentCategory,
  isFileAttachment,
  isExternalAttachment,
} from './types';

export {
  getFileAttachmentType,
  formatFileSize,
  getAttachmentIcon,
  getAttachmentLabel,
} from './utils';
