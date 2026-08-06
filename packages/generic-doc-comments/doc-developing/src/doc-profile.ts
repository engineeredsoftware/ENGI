/**
 * DOC-PROFILE PLUGIN - Development Profiling Documentation
 * 
 * This plugin enables profiling metadata injection for development
 * debugging and optimization.
 * 
 * @doc-comment-plugin
 * name: doc-profile
 * pattern: @doc-profile
 */

import { 
  DocCommentPlugin, 
  DocComment, 
  DocCommentMetadata
} from '@bitcode/doc-comment-generics';

export interface ProfileMetadata extends DocCommentMetadata {
  type: 'profile';
  scope: 'function' | 'class' | 'module' | 'pipeline';
  metrics: string[];
  sampling?: {
    rate: number;
    condition?: string;
  };
  output?: 'console' | 'file' | 'telemetry';
}

export class DocProfilePlugin implements DocCommentPlugin {
  name = 'doc-profile';
  pattern = /@doc-profile/;

  matches(comment: DocComment): boolean {
    return this.pattern.test(comment.raw);
  }

  parse(comment: DocComment): DocCommentMetadata | null {
    if (!this.matches(comment)) {
      return null;
    }

    const scope = this.extractTag(comment.raw, 'scope') || 'function';
    const metrics = this.extractArrayTag(comment.raw, 'metrics') || ['execution_time', 'memory'];
    const samplingRate = this.extractNumberTag(comment.raw, 'sampling');
    const samplingCondition = this.extractTag(comment.raw, 'condition');
    const output = this.extractTag(comment.raw, 'output') || 'console';

    const metadata: ProfileMetadata = {
      type: 'profile',
      scope: scope as ProfileMetadata['scope'],
      metrics,
      version: '1.0.0'
    };

    if (samplingRate !== undefined) {
      metadata.sampling = { rate: samplingRate };
      if (samplingCondition) {
        metadata.sampling.condition = samplingCondition;
      }
    }

    metadata.output = output as ProfileMetadata['output'];

    return metadata;
  }

  validate(parsed: DocCommentMetadata): boolean {
    const metadata = parsed as ProfileMetadata;
    return (
      metadata.type === 'profile' &&
      ['function', 'class', 'module', 'pipeline'].includes(metadata.scope) &&
      ['console', 'file', 'telemetry'].includes(metadata.output || 'console')
    );
  }

  transform(metadata: DocCommentMetadata): string {
    const profileMeta = metadata as ProfileMetadata;
    
    const parts = [`// PROFILING: ${profileMeta.scope}`];
    parts.push(`// Metrics: ${profileMeta.metrics.join(', ')}`);
    
    if (profileMeta.sampling) {
      parts.push(`// Sampling: ${profileMeta.sampling.rate * 100}%`);
      if (profileMeta.sampling.condition) {
        parts.push(`// Condition: ${profileMeta.sampling.condition}`);
      }
    }
    
    parts.push(`// Output: ${profileMeta.output}`);
    
    return parts.join('\n');
  }

  async generate?(metadata: DocCommentMetadata): Promise<unknown> {
    const profileMeta = metadata as ProfileMetadata;
    
    // Generate profiling instrumentation code
    const instrumentation: any = {
      scope: profileMeta.scope,
      metrics: {}
    };

    // Generate metric collection code for each metric
    profileMeta.metrics.forEach(metric => {
      switch (metric) {
        case 'execution_time':
          instrumentation.metrics.execution_time = {
            start: 'const __startTime = performance.now()',
            end: 'const __endTime = performance.now()',
            log: `console.log('Execution time:', __endTime - __startTime, 'ms')`
          };
          break;
        case 'memory':
          instrumentation.metrics.memory = {
            start: 'const __startMem = process.memoryUsage()',
            end: 'const __endMem = process.memoryUsage()',
            log: `console.log('Memory delta:', __endMem.heapUsed - __startMem.heapUsed, 'bytes')`
          };
          break;
        case 'cpu':
          instrumentation.metrics.cpu = {
            start: 'const __startCpu = process.cpuUsage()',
            end: 'const __endCpu = process.cpuUsage(__startCpu)',
            log: `console.log('CPU usage:', __endCpu)`
          };
          break;
      }
    });

    // Add sampling logic if needed
    if (profileMeta.sampling) {
      instrumentation.sampling = {
        check: `if (Math.random() > ${profileMeta.sampling.rate}) return`,
        condition: profileMeta.sampling.condition
      };
    }

    return instrumentation;
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

  private extractNumberTag(comment: string, tag: string): number | undefined {
    const value = this.extractTag(comment, tag);
    if (!value) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }
}

export const docProfilePlugin = new DocProfilePlugin();

// Auto-register when imported
import { registerPlugin } from '@bitcode/doc-comment-generics';
registerPlugin(docProfilePlugin);
