/**
 * @bitcode/attachment-generics
 *
 * Attachment **primitive** — base fields, categories file|external, references.
 *
 * Hierarchy (core *generics + generic-* leaves pattern):
 *   @bitcode/attachment-generics              # this package
 *     → @bitcode/generic-attachments-file     # file leaf base
 *     → @bitcode/generic-attachments-external # external leaf base
 *
 * Product code imports this package for refs/categories, and leaf packages
 * when specializing FileAttachment / ExternalAttachment. There is no plural
 * composition barrel package.
 */

export type {
  AttachmentCategory,
  BaseAttachment,
  AttachmentReference,
  CreateAttachmentInput,
} from './types';
export {
  isAttachmentCategory,
  validateAttachmentCategory,
  isBaseAttachment,
} from './types';
