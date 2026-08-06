/**
 * Hierarchical Formatter - Transform prompt registry into hierarchical markdown
 * 
 * Creates a beautifully structured prompt with:
 * - Nested markdown headers (up to 10 levels)
 * - Automatic hierarchy detection
 * - Empty content handling for required paths
 * - Clean, readable output
 */

import { Prompt, PromptFormatter } from '../prompt';
import { PromptPart, createPromptPart } from '../parts/PromptPart';
import { PROMPTPART_GENERIC_FORMATTING_CONTENTNOTAVAILABLE_DETAILCONTENT } from '../raw_promptparts/generic/promptpart_generic_formatting_contentnotavailable_detailcontent';

interface TreeNode {
  children: Map<string, TreeNode>;
  content: PromptPart | null;
}

/**
 * Format a prompt registry into hierarchical markdown
 * 
 * Transforms paths like:
 * - generic_system:identity
 * - generic_system:methodology:ptrr
 * - specific_execution:pipeline:asset-pack
 * 
 * Into markdown like:
 * # GENERIC_SYSTEM
 * ## IDENTITY
 * [content]
 * ## METHODOLOGY
 * ### PTRR
 * [content]
 */
export const hierarchicalFormatter: PromptFormatter = (prompt) => {
  const parts: string[] = [];
  const paths = prompt.getAllPaths();
  const required = prompt.getRequired();
  
  // Build tree structure from paths
  const tree = new Map<string, TreeNode>();
  const requiredPaths = new Set<string>();
  
  // Track required paths (not patterns)
  for (const req of required) {
    if (!req.startsWith('pattern:')) {
      requiredPaths.add(req);
    }
  }
  
  // Build tree from existing paths
  for (const path of paths) {
    const content = prompt.get([path]);
    if (!content) continue;
    
    const segments = path.split(':');
    let current = tree;
    
    // Build nested structure
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (!current.has(segment)) {
        current.set(segment, { children: new Map(), content: null });
      }
      current = current.get(segment)!.children;
    }
    
    // Set content at leaf
    const leafSegment = segments[segments.length - 1];
    if (!current.has(leafSegment)) {
      current.set(leafSegment, { children: new Map(), content: null });
    }
    current.get(leafSegment)!.content = content;
  }
  
  // Add required but missing paths
  for (const reqPath of requiredPaths) {
    if (!paths.includes(reqPath)) {
      const segments = reqPath.split(':');
      let current = tree;
      
      for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        if (!current.has(segment)) {
          current.set(segment, { children: new Map(), content: null });
        }
        current = current.get(segment)!.children;
      }
      
      const leafSegment = segments[segments.length - 1];
      current.set(leafSegment, {
        children: new Map(),
        content: PROMPTPART_GENERIC_FORMATTING_CONTENTNOTAVAILABLE_DETAILCONTENT,
      });
    }
  }
  
  // Render tree with proper header levels (up to 10)
  function renderNode(node: Map<string, TreeNode>, depth: number = 1): void {
    // Sort keys for consistent output
    const sortedKeys = Array.from(node.keys()).sort();
    
    for (const key of sortedKeys) {
      const value = node.get(key)!;
      
      // Header with # based on depth (max 10 as requested)
      const header = '#'.repeat(Math.min(depth, 10));
      parts.push(`${header} ${key.toUpperCase()}`);
      parts.push('');
      
      // Add content if present
      if (value.content) {
        parts.push(value.content);
        parts.push('');
      }
      
      // Render children
      if (value.children.size > 0) {
        renderNode(value.children, depth + 1);
      }
    }
  }
  
  renderNode(tree);
  
  // Hierarchical format result is composition of already-raw path parts.
  return createPromptPart(parts.join('\n').trim());
};
