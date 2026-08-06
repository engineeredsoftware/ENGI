/**
 * @bitcode/generic-attachments-file
 *
 * FileAttachment base over @bitcode/attachment-generics.
 */

export type { FileAttachment, FileAttachmentType } from './types';
export { isFileAttachment, validateFileAttachmentType } from './types';
export {
  getFileAttachmentType,
  formatFileSize,
  isFileSizeValid,
  isSupportedFileType,
} from './utils';
