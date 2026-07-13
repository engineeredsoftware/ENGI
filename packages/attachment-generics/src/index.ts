/**
 * @bitcode/attachment-generics
 *
 * Attachment **primitive** — base fields, categories file|external, references.
 *
 * Prefer:
 *   @bitcode/attachment-generics
 *   @bitcode/generic-attachments-file
 *   @bitcode/generic-attachments-external
 *
 * BC: @bitcode/attachments-generics re-exports this surface + bases.
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
