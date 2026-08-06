import {
  BaseDocCommentPlugin,
  type ValidationError,
  type ValidationResult
} from '@bitcode/doc-comment-generics/base-plugin';
import type { DocComment } from '@bitcode/doc-comment-generics/types';

/**
 * Metadata structure for @doc-code-tool
 */
export interface DocCodeToolMetadata {
  [key: string]: unknown;
  name: string;
  category: string;
  version: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  stability: 'experimental' | 'beta' | 'stable' | 'retired';
  purpose?: string;
  capabilities?: string[];
  parameters?: Record<string, any>;
  output?: any;
}

/**
 * Plugin for @doc-code-tool comments that enable runtime tool documentation
 */
export class DocCodeToolPlugin extends BaseDocCommentPlugin<DocCodeToolMetadata> {
  name = 'doc-code-tool';
  pattern = /@doc-code-tool/;
  
  protected parseMetadata(comment: DocComment): any {
    const lines = comment.content.split('\n');
    const metadata: DocCodeToolMetadata = {
      name: '',
      category: '',
      version: '1.0.0',
      priority: 'medium',
      stability: 'stable'
    };
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Parse basic metadata
      if (trimmed.startsWith('name:')) {
        metadata.name = trimmed.substring(5).trim();
      } else if (trimmed.startsWith('category:')) {
        metadata.category = trimmed.substring(9).trim();
      } else if (trimmed.startsWith('version:')) {
        metadata.version = trimmed.substring(8).trim();
      } else if (trimmed.startsWith('priority:')) {
        metadata.priority = trimmed.substring(9).trim() as any;
      } else if (trimmed.startsWith('stability:')) {
        metadata.stability = trimmed.substring(10).trim() as any;
      }
    }
    
    // Parse section metadata from other doc-code-tool-* comments
    this.parseSectionMetadata(comment, metadata);
    
    return metadata;
  }
  
  private parseSectionMetadata(comment: DocComment, metadata: DocCodeToolMetadata) {
    // This would be enhanced to parse @doc-code-tool-purpose, etc.
    // For now, we rely on the decorator to inject these
  }
  
  protected validateMetadata(metadata: DocCodeToolMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!metadata.name) {
      errors.push({ field: 'name', message: 'Tool name is required', severity: 'error' });
    }
    
    if (!metadata.category) {
      errors.push({ field: 'category', message: 'Tool category is required', severity: 'error' });
    }
    
    if (!['low', 'medium', 'high', 'critical'].includes(metadata.priority)) {
      errors.push({ field: 'priority', message: 'Invalid priority value', severity: 'error' });
    }
    
    if (!['experimental', 'beta', 'stable', 'retired'].includes(metadata.stability)) {
      errors.push({ field: 'stability', message: 'Invalid stability value', severity: 'error' });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  protected getDefaultMetadata(_comment: DocComment): DocCodeToolMetadata {
    return {
      name: 'unnamed-tool',
      category: 'uncategorized',
      version: '1.0.0',
      priority: 'medium',
      stability: 'experimental'
    };
  }
}
