/**
 * DOC-COMMENT TYPE DEFINITIONS - The Language of Intelligence
 * 
 * These types define the structure of conscious comments.
 * Every doc-comment flows through these interfaces on its way
 * to becoming runtime intelligence.
 * 
 * @doc-typescript
 * interface: DocComment
 * properties: ["label", "content", "fields", "pos", "end", "node"]
 * architecture: \"Type definitions for doc-comment parsing and metadata extraction\"
 */

import * as ts from 'typescript';

/**
 * Core doc-comment structure
 * This is what we extract from the AST
 */
export interface DocComment {
  // The @doc-* label
  label: string;
  
  // The full content of the comment (without /** and */)
  content: string;
  
  // The raw comment text including /** and */
  raw: string;
  
  // Parsed fields from the comment
  fields: Record<string, any>;
  
  // Position information
  pos?: number;
  end?: number;
  
  // The AST node this comment is attached to
  node?: ts.Node;
}

/**
 * Base interface for all doc-comment metadata
 */
export interface DocCommentMetadata {
  type: string;
  version: string;
  [key: string]: unknown;
}

/**
 * Parse location for doc-comment processing
 */
export interface ParseLocation {
  // Source file path
  filePath: string;
  
  // TypeScript source file
  sourceFile?: ts.SourceFile;
  
  // Current AST node being processed
  node?: ts.Node;
  
  // Parent nodes in the AST
  parents?: ts.Node[];
  
  // Additional context data
  metadata?: Record<string, unknown>;
}

/**
 * Doc-comment plugin interface
 * Every plugin transforms comments into intelligence
 */
export interface DocCommentPlugin {
  // Plugin identifier
  name: string;
  
  // Pattern to match (e.g., /@doc-prompt/)
  pattern: RegExp;
  
  // Check if this plugin handles the comment
  matches(comment: DocComment): boolean;
  
  // Parse the comment into structured data
  parse(comment: DocComment): any;
  
  // Validate the parsed result
  validate(parsed: any): boolean;
}

/**
 * Injection specification
 * Defines how to inject intelligence into the runtime
 */
export interface InjectionSpec {
  // Property name to inject
  property: string;
  
  // Value to inject
  value: any;
  
  // Injection method
  method: 'proto' | 'static' | 'factory';
}

/**
 * Build configuration for doc-comments
 */
export interface DocCommentBuildConfig {
  // Enable specific plugins
  plugins?: string[];
  
  // Development mode
  development?: boolean;
  
  // Verbose logging
  verbose?: boolean;
}

/**
 * Doc-comment parser interface
 */
export interface DocCommentParser {
  // Parse a file and extract all doc-comments
  parseFile(content: string, filePath: string): DocComment[];
  
  // Parse a single comment
  parseComment(comment: string, location: ParseLocation): DocCommentMetadata | null;
}