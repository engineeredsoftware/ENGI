/**
 * Universal attachment definitions for Bitcode.
 *
 * type surface. Prefer leaf packages for new code.
 * Categories: file | external only (vcs/url removed; integration renamed external).
 */

export type {
  AttachmentCategory,
  BaseAttachment,
  AttachmentReference,
  CreateAttachmentInput,
} from '@bitcode/attachment-generics';
export {
  isAttachmentCategory,
  validateAttachmentCategory,
  isBaseAttachment,
} from '@bitcode/attachment-generics';

export type {
  FileAttachment,
  FileAttachmentType,
} from '@bitcode/generic-attachments-file';
export {
  isFileAttachment,
  validateFileAttachmentType,
} from '@bitcode/generic-attachments-file';

export type {
  ExternalAttachment,
  ExternalProvider,
  ExternalAttachmentType,
} from '@bitcode/generic-attachments-external';
export {
  isExternalAttachment,
  validateExternalProvider,
} from '@bitcode/generic-attachments-external';

import type { FileAttachment } from '@bitcode/generic-attachments-file';
import type { ExternalAttachment } from '@bitcode/generic-attachments-external';

/** Universal attachment — file upload or external connection only. */
export type Attachment = FileAttachment | ExternalAttachment;
