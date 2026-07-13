/**
 * DOC-DRYRUN PLUGIN - Simulation Mode Documentation
 * 
 * This plugin enables dry-run mode for testing and development,
 * injecting simulation metadata into code elements.
 * 
 * @doc-comment-plugin
 * name: doc-dryrun
 * pattern: @doc-dryrun
 */

import { 
  DocCommentPlugin, 
  DocComment, 
  DocCommentMetadata
} from '@bitcode/doc-comment-generics';

export interface DryRunMetadata extends DocCommentMetadata {
  type: 'dryrun';
  mode: 'simulate' | 'test' | 'preview';
  mockData?: Record<string, unknown>;
  expectedBehavior?: string;
  sideEffects?: string[];
}

export class DocDryRunPlugin implements DocCommentPlugin {
  name = 'doc-dryrun';
  pattern = /@doc-dryrun/;

  matches(comment: DocComment): boolean {
    return this.pattern.test(comment.raw);
  }

  parse(comment: DocComment): DocCommentMetadata | null {
    if (!this.matches(comment)) {
      return null;
    }

    const mode = this.extractTag(comment.raw, 'mode') || 'simulate';
    const expectedBehavior = this.extractTag(comment.raw, 'expect');
    const sideEffects = this.extractArrayTag(comment.raw, 'sideEffects');
    const mockData = this.extractJsonTag(comment.raw, 'mock');

    const metadata: DryRunMetadata = {
      type: 'dryrun',
      mode: mode as DryRunMetadata['mode'],
      version: '1.0.0'
    };

    if (expectedBehavior) metadata.expectedBehavior = expectedBehavior;
    if (sideEffects.length > 0) metadata.sideEffects = sideEffects;
    if (mockData) metadata.mockData = mockData;

    return metadata;
  }

  validate(parsed: DocCommentMetadata): boolean {
    const metadata = parsed as DryRunMetadata;
    return (
      metadata.type === 'dryrun' &&
      ['simulate', 'test', 'preview'].includes(metadata.mode)
    );
  }

  transform(metadata: DocCommentMetadata): string {
    const dryRunMeta = metadata as DryRunMetadata;
    
    return `
// DRY RUN MODE: ${dryRunMeta.mode}
${dryRunMeta.expectedBehavior ? `// Expected: ${dryRunMeta.expectedBehavior}` : ''}
${dryRunMeta.sideEffects ? `// Side Effects: ${dryRunMeta.sideEffects.join(', ')}` : ''}
`;
  }

  async generate?(metadata: DocCommentMetadata): Promise<unknown> {
    const dryRunMeta = metadata as DryRunMetadata;
    
    // In development, this could generate mock implementations
    return {
      isDryRun: true,
      mode: dryRunMeta.mode,
      mockImplementation: dryRunMeta.mockData || {}
    };
  }

  private extractTag(comment: string, tag: string): string | undefined {
    const match = comment.match(new RegExp(`@${tag}\\s+(.+?)(?=@|\\*\\/|$)`, 's'));
    return match ? match[1].trim() : undefined;
  }

  private extractArrayTag(comment: string, tag: string): string[] {
    const value = this.extractTag(comment, tag);
    if (!value) return [];
    return value.split(',').map(s => s.trim());
  }

  private extractJsonTag(comment: string, tag: string): Record<string, unknown> | undefined {
    const value = this.extractTag(comment, tag);
    if (!value) return undefined;
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
}

export const docDryRunPlugin = new DocDryRunPlugin();

import { registerPlugin } from '@bitcode/doc-comment-generics';
registerPlugin(docDryRunPlugin);
