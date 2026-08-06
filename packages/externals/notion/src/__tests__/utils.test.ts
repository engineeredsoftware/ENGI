import { 
  extractPlainText, 
  extractTitle, 
  blockToMarkdown, 
  extractPropertyValue,
  isValidNotionId,
  normalizeNotionId,
  extractPageIdFromUrl
} from '../utils';

describe('Notion Utils', () => {
  describe('extractPlainText', () => {
    it('should extract plain text from rich text array', () => {
      const richText = [
        { plain_text: 'Hello ' },
        { plain_text: 'World' }
      ];
      expect(extractPlainText(richText)).toBe('Hello World');
    });

    it('should handle empty array', () => {
      expect(extractPlainText([])).toBe('');
    });

    it('should handle non-array input', () => {
      expect(extractPlainText(null as any)).toBe('');
    });
  });

  describe('extractTitle', () => {
    it('should extract title from database', () => {
      const database = {
        title: [
          { plain_text: 'My Database' }
        ]
      };
      expect(extractTitle(database as any)).toBe('My Database');
    });

    it('should extract title from page properties', () => {
      const page = {
        properties: {
          Name: {
            type: 'title',
            title: [
              { plain_text: 'My Page' }
            ]
          }
        }
      };
      expect(extractTitle(page as any)).toBe('My Page');
    });

    it('should return Untitled for page without title', () => {
      const page = { properties: {} };
      expect(extractTitle(page as any)).toBe('Untitled');
    });
  });

  describe('blockToMarkdown', () => {
    it('should convert paragraph block to markdown', () => {
      const block = {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { plain_text: 'This is a paragraph' }
          ]
        }
      };
      expect(blockToMarkdown(block as any)).toBe('This is a paragraph');
    });

    it('should convert heading blocks to markdown', () => {
      const h1Block = {
        type: 'heading_1',
        heading_1: {
          rich_text: [
            { plain_text: 'Main Heading' }
          ]
        }
      };
      expect(blockToMarkdown(h1Block as any)).toBe('# Main Heading');
    });

    it('should convert to-do block to markdown', () => {
      const todoBlock = {
        type: 'to_do',
        to_do: {
          checked: true,
          rich_text: [
            { plain_text: 'Complete task' }
          ]
        }
      };
      expect(blockToMarkdown(todoBlock as any)).toBe('[x] Complete task');
    });
  });

  describe('extractPropertyValue', () => {
    it('should extract text property value', () => {
      const property = {
        type: 'rich_text',
        rich_text: [
          { plain_text: 'Some text' }
        ]
      };
      expect(extractPropertyValue(property)).toBe('Some text');
    });

    it('should extract number property value', () => {
      const property = {
        type: 'number',
        number: 42
      };
      expect(extractPropertyValue(property)).toBe('42');
    });

    it('should extract checkbox property value', () => {
      const property = {
        type: 'checkbox',
        checkbox: true
      };
      expect(extractPropertyValue(property)).toBe('Yes');
    });
  });

  describe('isValidNotionId', () => {
    it('should validate UUID format', () => {
      const validUuid = '12345678-1234-1234-1234-123456789abc';
      expect(isValidNotionId(validUuid)).toBe(true);
    });

    it('should validate 32-character hex format', () => {
      const validHex = '123456781234123412341234567890ab';
      expect(isValidNotionId(validHex)).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidNotionId('invalid-id')).toBe(false);
      expect(isValidNotionId('12345')).toBe(false);
      expect(isValidNotionId('')).toBe(false);
    });
  });

  describe('normalizeNotionId', () => {
    it('should add hyphens to 32-character hex string', () => {
      const hexId = '123456781234123412341234567890ab';
      const expected = '12345678-1234-1234-1234-1234567890ab';
      expect(normalizeNotionId(hexId)).toBe(expected);
    });

    it('should return already formatted UUID unchanged', () => {
      const uuidId = '12345678-1234-1234-1234-123456789abc';
      expect(normalizeNotionId(uuidId)).toBe(uuidId.toLowerCase());
    });

    it('should handle empty string', () => {
      expect(normalizeNotionId('')).toBe('');
    });
  });

  describe('extractPageIdFromUrl', () => {
    it('should extract ID from notion.so URL', () => {
      const url = 'https://notion.so/12345678123412341234123456789abc';
      const expected = '12345678-1234-1234-1234-123456789abc';
      expect(extractPageIdFromUrl(url)).toBe(expected);
    });

    it('should extract ID from notion.site URL', () => {
      const url = 'https://workspace.notion.site/Page-Title-12345678123412341234123456789abc';
      const expected = '12345678-1234-1234-1234-123456789abc';
      expect(extractPageIdFromUrl(url)).toBe(expected);
    });

    it('should return null for invalid URLs', () => {
      expect(extractPageIdFromUrl('https://google.com')).toBe(null);
      expect(extractPageIdFromUrl('invalid-url')).toBe(null);
    });
  });
});