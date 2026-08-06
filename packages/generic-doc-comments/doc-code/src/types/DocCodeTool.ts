/**
 * DOC-CODE-TOOL TYPE DEFINITIONS
 * 
 * Defines the structure and validation for @doc-code-tool comments
 */

import type { Tool } from '@bitcode/tools-generics';
import type { DocCodeToolPrompt } from '@bitcode/tools-generics';

/**
 * Structure of a @doc-code-tool comment
 * 
 * The @prompt field is REQUIRED and must reference an imported DocCodeToolPrompt instance
 */
export interface DocCodeTool {
  /**
   * Reference to the DocCodeToolPrompt instance
   * @required
   * @example @prompt TEXT_EDITOR_DOC_CODE_TOOL_PROMPT
   */
  '@prompt': string;
  
  /**
   * Optional tool name override
   * @example @name TextEditorTool
   */
  '@name'?: string;
  
  /**
   * Optional purpose description
   * @example @purpose Comprehensive file editing with atomic operations
   */
  '@purpose'?: string;
  
  /**
   * Optional capabilities list
   * @example @capabilities Complete file operations, transaction support, rollback
   */
  '@capabilities'?: string;
  
  /**
   * Optional parameters description
   * @example @parameters EditCommandParams - command type, file path, content
   */
  '@parameters'?: string;
  
  /**
   * Optional returns description
   * @example @returns Success status, operation details, transaction ID
   */
  '@returns'?: string;
  
  /**
   * Optional category
   * @example @category file-system
   */
  '@category'?: string;
  
  /**
   * Optional stability level
   * @example @stability stable
   */
  '@stability'?: 'experimental' | 'unstable' | 'stable' | 'retired';
  
  /**
   * Optional version
   * @example @version 1.0.0
   */
  '@version'?: string;
}

/**
 * Type guard to check if a class extends Tool
 */
export function isToolClass(target: any): target is typeof Tool {
  return target && target.prototype && 'use' in target.prototype;
}

/**
 * Type to ensure doc-code-tool is only applied to Tool classes
 */
export type DocCodeToolTarget = typeof Tool;

/**
 * Validated doc-code-tool metadata after parsing
 */
export interface ParsedDocCodeTool {
  prompt: string;
  promptIdentifier: string;
  metadata: Partial<Omit<DocCodeTool, '@prompt'>>;
  targetClass: string;
  targetInstance?: string;
}
