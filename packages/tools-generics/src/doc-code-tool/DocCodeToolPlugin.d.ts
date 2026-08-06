import { BaseDocCommentPlugin, type ValidationResult } from '@bitcode/doc-comment-generics/base-plugin';
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
export declare class DocCodeToolPlugin extends BaseDocCommentPlugin<DocCodeToolMetadata> {
    name: string;
    pattern: RegExp;
    protected parseMetadata(comment: DocComment): any;
    private parseSectionMetadata;
    protected validateMetadata(metadata: DocCodeToolMetadata): ValidationResult;
    protected getDefaultMetadata(_comment: DocComment): DocCodeToolMetadata;
}
