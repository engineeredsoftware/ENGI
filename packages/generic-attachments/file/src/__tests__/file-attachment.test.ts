import { getFileAttachmentType, formatFileSize, isFileAttachment } from '../index';

describe('generic-attachments-file', () => {
  it('classifies MIME and extensions', () => {
    expect(getFileAttachmentType('image/png')).toBe('image');
    expect(getFileAttachmentType(undefined, 'main.ts')).toBe('code');
    expect(getFileAttachmentType(undefined, 'unknown.bin')).toBe('other');
  });

  it('formats file size', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
  });

  it('narrows file category', () => {
    expect(isFileAttachment({ category: 'file' } as any)).toBe(true);
    expect(isFileAttachment({ category: 'external' } as any)).toBe(false);
  });
});
