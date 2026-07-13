import { isExternalAttachment, validateExternalProvider } from '../index';

describe('generic-attachments-external', () => {
  it('narrows external category', () => {
    expect(isExternalAttachment({ category: 'external' } as any)).toBe(true);
    expect(isExternalAttachment({ category: 'file' } as any)).toBe(false);
    expect(isExternalAttachment({ category: 'integration' } as any)).toBe(false);
  });

  it('validates provider strings', () => {
    expect(validateExternalProvider('github')).toBe(true);
    expect(validateExternalProvider('')).toBe(false);
  });
});
