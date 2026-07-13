/**
 * BC attachment display / validation utilities.
 * File MIME helpers live in @bitcode/generic-attachments-file.
 */

import type { Attachment } from './types';
import type { FileAttachment } from '@bitcode/generic-attachments-file';
import type { ExternalAttachment } from '@bitcode/generic-attachments-external';
import {
  getFileAttachmentType,
  formatFileSize,
  isFileSizeValid,
  isSupportedFileType,
} from '@bitcode/generic-attachments-file';
import { isValidURL } from './url-utils';

export {
  getFileAttachmentType,
  formatFileSize,
  isFileSizeValid,
  isSupportedFileType,
};

export function getAttachmentIcon(attachment: Attachment): string {
  switch (attachment.category) {
    case 'file':
      switch (attachment.type) {
        case 'image':
          return '🖼️';
        case 'text':
          return '📄';
        case 'pdf':
          return '📑';
        case 'audio':
          return '🎵';
        case 'video':
          return '🎬';
        case 'code':
          return '💻';
        default:
          return '📎';
      }
    case 'external':
      switch (attachment.provider) {
        case 'github':
        case 'gitlab':
        case 'bitbucket':
          return '🔀';
        case 'notion':
          return '📝';
        case 'figma':
          return '🎨';
        case 'jira':
          return '📋';
        case 'linear':
          return '📊';
        default:
          return '🔌';
      }
    default:
      return '📎';
  }
}

export function getAttachmentLabel(attachment: Attachment): string {
  if (attachment.category === 'file') {
    const file = attachment as FileAttachment;
    return `${file.type} file`;
  }
  const external = attachment as ExternalAttachment;
  return `${external.provider} ${String(external.type).replace(`${external.provider}_`, '')}`;
}

export function getAttachmentPreview(attachment: Attachment, maxLength = 100): string {
  let preview = attachment.description || attachment.title;
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength - 3) + '...';
  }
  return preview;
}

export function validateAttachment(attachment: Partial<Attachment>): string[] {
  const errors: string[] = [];

  if (!attachment.id) errors.push('Missing attachment ID');
  if (!attachment.category) errors.push('Missing attachment category');
  if (!attachment.title) errors.push('Missing attachment title');

  if (attachment.category === 'file') {
    const file = attachment as Partial<FileAttachment>;
    if (!file.file_name) errors.push('Missing file name');
    if (!file.file_url) errors.push('Missing file URL');
    if (file.file_size == null) errors.push('Missing file size');
  }

  if (attachment.category === 'external') {
    const external = attachment as Partial<ExternalAttachment>;
    if (!external.provider) errors.push('Missing external provider');
    if (!external.type) errors.push('Missing external type');
  }

  if (attachment.url && !isValidURL(attachment.url)) {
    errors.push('Invalid URL format');
  }

  return errors;
}

export function sortByDate(attachments: Attachment[]): Attachment[] {
  return [...attachments].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function sortByCategory(attachments: Attachment[]): Attachment[] {
  const categoryOrder = ['file', 'external'];
  return [...attachments].sort((a, b) => {
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
  });
}

export function groupByCategory(
  attachments: Attachment[],
): Record<string, Attachment[]> {
  return attachments.reduce(
    (groups, attachment) => {
      const category = attachment.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(attachment);
      return groups;
    },
    {} as Record<string, Attachment[]>,
  );
}
