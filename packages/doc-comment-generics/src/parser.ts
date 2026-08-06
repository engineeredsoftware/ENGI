/**
 * DOC-COMMENT PARSER - The AST Whisperer
 * 
 * Extracts intelligence from TypeScript AST nodes and their comments.
 * This is where we read the minds of types, interfaces, and classes.
 * 
 * @doc-typescript
 * class: DocCommentParser
 * methods: ["parseFile", "parseNode", "extractComments", "parseFields"]
 */

import * as ts from 'typescript';
import { DocComment } from './types';

/**
 * Field extraction patterns
 */
const FIELD_PATTERNS = {
  // Standard field: key: value
  standard: /^(\w+):\s*(.+)$/,
  // Array field: key: [value1, value2]
  array: /^(\w+):\s*\[(.+)\]$/,
  // Type reference: @keytype TypeName
  typeRef: /^@(\w+)\s+(\w+)$/,
  // Multi-line field continuation
  continuation: /^\s+(.+)$/
};

/**
 * The master parser that extracts doc-comments from TypeScript AST
 */
export class DocCommentParser {
  /**
   * Parse all doc-comments in a source file
   */
  static parseFile(sourceFile: ts.SourceFile): DocComment[] {
    const comments: DocComment[] = [];
    
    const visit = (node: ts.Node) => {
      const nodeComments = this.parseNode(node, sourceFile);
      comments.push(...nodeComments);
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return comments;
  }
  
  /**
   * Parse doc-comments from a specific node
   */
  static parseNode(node: ts.Node, sourceFile: ts.SourceFile): DocComment[] {
    const comments: DocComment[] = [];
    const extracted = this.extractComments(node, sourceFile);
    
    for (const raw of extracted) {
      const fields = this.parseFields(raw.content);
      
      comments.push({
        label: raw.label,
        raw: sourceFile.getFullText().substring(raw.pos, raw.end),
        content: raw.content,
        fields,
        pos: raw.pos,
        end: raw.end,
        node
      });
    }
    
    return comments;
  }
  
  /**
   * Extract raw comment blocks from a node
   */
  static extractComments(
    node: ts.Node,
    sourceFile: ts.SourceFile
  ): Array<{ label: string; content: string; pos: number; end: number }> {
    const results: Array<{ label: string; content: string; pos: number; end: number }> = [];
    const fullText = sourceFile.getFullText();
    const ranges = ts.getLeadingCommentRanges(fullText, node.getFullStart());
    
    if (!ranges) return results;
    
    for (const range of ranges) {
      const commentText = fullText.substring(range.pos, range.end);
      
      // Match doc-comment pattern: /** @doc-* ... */
      const match = commentText.match(/\/\*\*\s*(@doc-[\w-]+)/);
      if (match) {
        const label = match[1];
        
        // Clean the content
        const content = commentText
          .replace(/^\/\*\*\s*/, '') // Remove opening /**
          .replace(/\s*\*\/$/, '')   // Remove closing */
          .replace(/^\s*\* ?/gm, '') // Remove * prefixes
          .replace(new RegExp(`^${label}\\s*`), '') // Remove label
          .trim();
        
        results.push({
          label,
          content,
          pos: range.pos,
          end: range.end
        });
      }
    }
    
    return results;
  }
  
  /**
   * Parse fields from comment content
   */
  static parseFields(content: string): Record<string, any> {
    const fields: Record<string, any> = {};
    const lines = content.split('\n');
    
    let currentField: string | null = null;
    let currentValue: string[] = [];
    
    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) {
        // Flush current field if we have one
        if (currentField) {
          fields[currentField] = this.parseValue(currentValue.join(' '));
          currentField = null;
          currentValue = [];
        }
        continue;
      }
      
      // Check for field patterns
      let matched = false;
      
      // Standard field
      const standardMatch = line.match(FIELD_PATTERNS.standard);
      if (standardMatch) {
        // Flush previous field
        if (currentField) {
          fields[currentField] = this.parseValue(currentValue.join(' '));
        }
        
        currentField = standardMatch[1];
        currentValue = [standardMatch[2]];
        matched = true;
      }
      
      // Type reference
      if (!matched) {
        const typeMatch = line.match(FIELD_PATTERNS.typeRef);
        if (typeMatch) {
          fields[`@${typeMatch[1]}`] = typeMatch[2];
          matched = true;
        }
      }
      
      // Continuation line
      if (!matched && currentField) {
        const contMatch = line.match(FIELD_PATTERNS.continuation);
        if (contMatch) {
          currentValue.push(contMatch[1]);
          matched = true;
        }
      }
      
      // If no pattern matched and we have no current field,
      // this might be the main content
      if (!matched && !currentField && !Object.keys(fields).length) {
        if (!fields._content) {
          fields._content = [];
        }
        (fields._content as string[]).push(line);
      }
    }
    
    // Flush final field
    if (currentField) {
      fields[currentField] = this.parseValue(currentValue.join(' '));
    }
    
    // Process _content if exists
    if (fields._content) {
      const content = (fields._content as string[]).join('\n').trim();
      delete fields._content;
      if (content && !fields.content) {
        fields.content = content;
      }
    }
    
    return fields;
  }
  
  /**
   * Parse a field value (handle arrays, booleans, numbers)
   */
  private static parseValue(value: string): any {
    const trimmed = value.trim();
    
    // Boolean
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    
    // Number
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return parseFloat(trimmed);
    }
    
    // Array (JSON)
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // If JSON parse fails, try comma-separated
        const inner = trimmed.slice(1, -1);
        return inner.split(',').map(s => s.trim());
      }
    }
    
    // Object (JSON)
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // Return as string if parse fails
        return trimmed;
      }
    }
    
    // Comma-separated list (without brackets)
    if (trimmed.includes(',') && !trimmed.includes(' ')) {
      return trimmed.split(',').map(s => s.trim());
    }
    
    // Default: string
    return trimmed;
  }
  
  /**
   * Get the name of a node (for debugging)
   */
  static getNodeName(node: ts.Node): string | undefined {
    if (ts.isClassDeclaration(node) || 
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isFunctionDeclaration(node)) {
      return node.name?.getText();
    }
    return undefined;
  }
  
  /**
   * Check if a node can have doc-comments
   */
  static canHaveDocComments(node: ts.Node): boolean {
    return ts.isClassDeclaration(node) ||
           ts.isInterfaceDeclaration(node) ||
           ts.isTypeAliasDeclaration(node) ||
           ts.isFunctionDeclaration(node) ||
           ts.isMethodDeclaration(node) ||
           ts.isPropertyDeclaration(node) ||
           ts.isVariableStatement(node) ||
           ts.isEnumDeclaration(node);
  }
}

/**
 * Helper to parse a single doc-comment string
 */
export function parseDocComment(text: string): DocComment | null {
  const match = text.match(/\/\*\*\s*(@doc-[\w-]+)/);
  if (!match) return null;
  
  const label = match[1];
  const content = text
    .replace(/^\/\*\*\s*/, '')
    .replace(/\s*\*\/$/, '')
    .replace(/^\s*\* ?/gm, '')
    .replace(new RegExp(`^${label}\\s*`), '')
    .trim();
  
  const fields = DocCommentParser.parseFields(content);
  
  return {
    label,
    raw: text,
    content,
    fields
  };
}

/**
 * Helper to check if a comment is a doc-comment
 */
export function isDocComment(text: string): boolean {
  return /\/\*\*\s*@doc-/.test(text);
}
