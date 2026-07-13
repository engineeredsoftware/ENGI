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
    label: string;
    content: string;
    raw: string;
    fields: Record<string, any>;
    pos?: number;
    end?: number;
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
    filePath: string;
    sourceFile?: ts.SourceFile;
    node?: ts.Node;
    parents?: ts.Node[];
    metadata?: Record<string, unknown>;
}
/**
 * Doc-comment plugin interface
 * Every plugin transforms comments into intelligence
 */
export interface DocCommentPlugin {
    name: string;
    pattern: RegExp;
    matches(comment: DocComment): boolean;
    parse(comment: DocComment): any;
    validate(parsed: any): boolean;
}
/**
 * Injection specification
 * Defines how to inject intelligence into the runtime
 */
export interface InjectionSpec {
    property: string;
    value: any;
    method: 'proto' | 'static' | 'factory';
}
/**
 * Build configuration for doc-comments
 */
export interface DocCommentBuildConfig {
    plugins?: string[];
    development?: boolean;
    verbose?: boolean;
}
/**
 * Doc-comment parser interface
 */
export interface DocCommentParser {
    parseFile(content: string, filePath: string): DocComment[];
    parseComment(comment: string, location: ParseLocation): DocCommentMetadata | null;
}
