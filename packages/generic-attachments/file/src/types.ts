/**
 * FileAttachment — base Attachment for direct file uploads.
 */

import type { BaseAttachment } from '@bitcode/attachment-generics';

export type FileAttachmentType =
  | 'image'
  | 'text'
  | 'pdf'
  | 'audio'
  | 'video'
  | 'code'
  | 'other';

export interface FileAttachment extends BaseAttachment {
  category: 'file';
  type: FileAttachmentType;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  image?: {
    width: number;
    height: number;
    format: string;
  };
  media?: {
    duration: number;
    codec?: string;
    bitrate?: number;
  };
  text?: {
    language?: string;
    line_count?: number;
    encoding?: string;
  };
}

export function isFileAttachment(attachment: {
  category: string;
}): attachment is FileAttachment {
  return attachment.category === 'file';
}

export function validateFileAttachmentType(type: string): type is FileAttachmentType {
  return ['image', 'text', 'pdf', 'audio', 'video', 'code', 'other'].includes(type);
}
