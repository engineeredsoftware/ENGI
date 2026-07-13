import {
  validateAttachmentCategory,
  isBaseAttachment,
  type BaseAttachment,
} from '../index';

describe('attachment-generics primitives', () => {
  it('admits only file and external categories', () => {
    expect(validateAttachmentCategory('file')).toBe(true);
    expect(validateAttachmentCategory('external')).toBe(true);
    expect(validateAttachmentCategory('vcs')).toBe(false);
    expect(validateAttachmentCategory('url')).toBe(false);
    expect(validateAttachmentCategory('integration')).toBe(false);
  });

  it('recognizes a base attachment shape', () => {
    const attachment: BaseAttachment = {
      id: 'att-1',
      category: 'file',
      title: 'Screenshot',
      created_at: new Date().toISOString(),
    };
    expect(isBaseAttachment(attachment)).toBe(true);
  });
});
