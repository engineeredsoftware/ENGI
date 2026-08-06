/**
 * DOC-CODE - RUNTIME PROMPT INJECTION SYSTEM
 * 
 * Injects prompt instances into tool instances based on @doc-code-* comments.
 * Pattern: @doc-code-* comments with @prompt field reference a Prompt instance
 * that gets attached to the tool instance at build time.
 * 
 * @doc-package
 * version: 3.0.0
 * pattern: prompt-injection
 * architecture: "Build-time prompt injection via tool-instance attachment"
 */

import { transformDocCodeTools } from './transformDocCodeTools';


// ==================== CORE PROMPT INJECTION ====================

/**
 * The ONLY thing doc-code does:
 * Attach prompt instances to tool instances via __docCodePrompt and __promptParts
 * properties.
 */



// ==================== SIMPLE PROMPT INJECTION ====================

/**
 * The ONE pattern doc-code supports:
 * 
 * @doc-code-IMPL comments with @prompt PROMPTNAME
 * get PROMPTNAME attached to the tool instance at build time
 */

// ==================== BUILD INTEGRATION ====================

/**
 * Transform function for build tools
 */
export interface DocCodeTransform {
  /**
   * Transform source code to inject prompt references
   */
  transform(source: string, filePath: string): Promise<string>;
}

/**
 * Create a transform for doc-code prompt injection
 */
export function createTransform(): DocCodeTransform {
  return {
    async transform(source: string, filePath: string): Promise<string> {
      // Transform @doc-code-tool comments
      if (filePath.includes('generic-tools') || filePath.includes('tools-generics')) {
        return transformDocCodeTools(source, filePath);
      }
      
      // Could add other @doc-code-* patterns here in future
      // For now, only doc-code-tool is implemented
      return source;
    }
  };
}

// ==================== EXPORTS ====================

// Export loader for webpack integration
export { default as docCodeToolLoader } from './loaders/doc-code-tool-loader';
