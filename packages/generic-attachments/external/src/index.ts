/**
 * @bitcode/generic-attachments-external
 *
 * ExternalAttachment base over @bitcode/attachment-generics.
 * Product language: Externals (not “integration”).
 */

export type {
  ExternalAttachment,
  ExternalProvider,
  ExternalAttachmentType,
} from './types';
export { isExternalAttachment, validateExternalProvider } from './types';
