/**
 * DOC-BENCHMARK PLUGIN - Performance Measurement Documentation
 * 
 * This plugin enables benchmark metadata injection for performance
 * tracking during development.
 * 
 * @doc-comment-plugin
 * name: doc-benchmark
 * pattern: @doc-benchmark
 */

import { 
  DocCommentPlugin, 
  DocComment, 
  DocCommentMetadata
} from '@bitcode/doc-comment-generics';

export interface BenchmarkMetadata extends DocCommentMetadata {
  type: 'benchmark';
  category: 'performance' | 'memory' | 'throughput' | 'latency';
  target?: {
    metric: string;
    value: number;
    unit: string;
  };
  baseline?: {
    metric: string;
    value: number;
    unit: string;
  };
  criticalPath?: boolean;
}

export class DocBenchmarkPlugin implements DocCommentPlugin {
  name = 'doc-benchmark';
  pattern = /@doc-benchmark/;

  matches(comment: DocComment): boolean {
    return this.pattern.test(comment.raw);
  }

  parse(comment: DocComment): DocCommentMetadata | null {
    if (!this.matches(comment)) {
      return null;
    }

    const category = this.extractTag(comment.raw, 'category') || 'performance';
    const target = this.extractMetric(comment.raw, 'target');
    const baseline = this.extractMetric(comment.raw, 'baseline');
    const criticalPath = comment.raw.includes('@critical');

    const metadata: BenchmarkMetadata = {
      type: 'benchmark',
      category: category as BenchmarkMetadata['category'],
      version: '1.0.0'
    };

    if (target) metadata.target = target;
    if (baseline) metadata.baseline = baseline;
    if (criticalPath) metadata.criticalPath = criticalPath;

    return metadata;
  }

  validate(parsed: DocCommentMetadata): boolean {
    const metadata = parsed as BenchmarkMetadata;
    return (
      metadata.type === 'benchmark' &&
      ['performance', 'memory', 'throughput', 'latency'].includes(metadata.category)
    );
  }

  transform(metadata: DocCommentMetadata): string {
    const benchMeta = metadata as BenchmarkMetadata;
    
    const parts = [`// BENCHMARK: ${benchMeta.category}`];
    
    if (benchMeta.target) {
      parts.push(`// Target: ${benchMeta.target.metric} < ${benchMeta.target.value}${benchMeta.target.unit}`);
    }
    
    if (benchMeta.baseline) {
      parts.push(`// Baseline: ${benchMeta.baseline.metric} = ${benchMeta.baseline.value}${benchMeta.baseline.unit}`);
    }
    
    if (benchMeta.criticalPath) {
      parts.push('// CRITICAL PATH - Performance sensitive');
    }
    
    return parts.join('\n');
  }

  async generate?(metadata: DocCommentMetadata): Promise<unknown> {
    const benchMeta = metadata as BenchmarkMetadata;
    
    // In development, this could generate performance tracking code
    return {
      performanceMarkers: {
        start: `performance.mark('${benchMeta.category}-start')`,
        end: `performance.mark('${benchMeta.category}-end')`,
        measure: `performance.measure('${benchMeta.category}', '${benchMeta.category}-start', '${benchMeta.category}-end')`
      },
      assertions: benchMeta.target ? {
        metric: benchMeta.target.metric,
        threshold: benchMeta.target.value,
        unit: benchMeta.target.unit
      } : undefined
    };
  }

  private extractTag(comment: string, tag: string): string | undefined {
    const match = comment.match(new RegExp(`@${tag}\\s+(.+?)(?=@|\\*\\/|$)`, 's'));
    return match ? match[1].trim() : undefined;
  }

  private extractMetric(comment: string, tag: string): BenchmarkMetadata['target'] | undefined {
    const value = this.extractTag(comment, tag);
    if (!value) return undefined;
    
    // Parse format: "execution_time < 100ms"
    const match = value.match(/(\w+)\s*([<>=]+)\s*(\d+)(\w+)/);
    if (!match) return undefined;
    
    return {
      metric: match[1],
      value: parseInt(match[3]),
      unit: match[4]
    };
  }
}

export const docBenchmarkPlugin = new DocBenchmarkPlugin();

import { registerPlugin } from '@bitcode/doc-comment-generics';
registerPlugin(docBenchmarkPlugin);
