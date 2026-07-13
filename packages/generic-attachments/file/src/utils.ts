/**
 * File attachment utilities — MIME / extension classification and size helpers.
 */

import type { FileAttachmentType } from './types';

const MIME_TYPE_MAP: Record<string, FileAttachmentType> = {
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/gif': 'image',
  'image/svg+xml': 'image',
  'image/webp': 'image',
  'text/plain': 'text',
  'text/html': 'text',
  'text/markdown': 'text',
  'application/pdf': 'pdf',
  'text/javascript': 'code',
  'application/javascript': 'code',
  'text/typescript': 'code',
  'text/x-python': 'code',
  'text/x-java': 'code',
  'text/x-c': 'code',
  'text/x-cpp': 'code',
  'text/x-go': 'code',
  'text/x-rust': 'code',
  'audio/mpeg': 'audio',
  'audio/mp3': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/webm': 'audio',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  'video/quicktime': 'video',
};

const FILE_EXTENSION_MAP: Record<string, FileAttachmentType> = {
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.webp': 'image',
  '.txt': 'text',
  '.md': 'text',
  '.rst': 'text',
  '.pdf': 'pdf',
  '.js': 'code',
  '.ts': 'code',
  '.tsx': 'code',
  '.jsx': 'code',
  '.py': 'code',
  '.java': 'code',
  '.c': 'code',
  '.cpp': 'code',
  '.go': 'code',
  '.rs': 'code',
  '.rb': 'code',
  '.php': 'code',
  '.swift': 'code',
  '.kt': 'code',
  '.scala': 'code',
  '.r': 'code',
  '.m': 'code',
  '.h': 'code',
  '.hpp': 'code',
  '.cs': 'code',
  '.sh': 'code',
  '.bash': 'code',
  '.zsh': 'code',
  '.fish': 'code',
  '.ps1': 'code',
  '.yaml': 'code',
  '.yml': 'code',
  '.json': 'code',
  '.xml': 'code',
  '.toml': 'code',
  '.ini': 'code',
  '.env': 'code',
  '.mp3': 'audio',
  '.wav': 'audio',
  '.ogg': 'audio',
  '.m4a': 'audio',
  '.flac': 'audio',
  '.mp4': 'video',
  '.webm': 'video',
  '.mov': 'video',
  '.avi': 'video',
  '.mkv': 'video',
};

export function getFileAttachmentType(
  mimeType?: string,
  fileName?: string,
): FileAttachmentType {
  if (mimeType && MIME_TYPE_MAP[mimeType]) {
    return MIME_TYPE_MAP[mimeType];
  }
  if (fileName) {
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    if (FILE_EXTENSION_MAP[ext]) {
      return FILE_EXTENSION_MAP[ext];
    }
  }
  return 'other';
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function isFileSizeValid(bytes: number, maxSizeMB = 100): boolean {
  return bytes <= maxSizeMB * 1024 * 1024;
}

export function isSupportedFileType(mimeType?: string, fileName?: string): boolean {
  return getFileAttachmentType(mimeType, fileName) !== 'other';
}
