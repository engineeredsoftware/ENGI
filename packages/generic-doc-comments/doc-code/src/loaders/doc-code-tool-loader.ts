/**
 * DOC-CODE-TOOL WEBPACK LOADER
 * 
 * Webpack loader for build-time transformation of @doc-code-tool comments
 * This runs during module loading, before TypeScript compilation
 */

import type { LoaderContext } from 'webpack';
import { transformDocCodeTools } from '../transformDocCodeTools';

export interface DocCodeToolLoaderOptions {
  test?: RegExp;
  exclude?: RegExp[];
}

/**
 * Webpack loader for doc-code-tool transformation
 */
export default function docCodeToolLoader(
  this: LoaderContext<DocCodeToolLoaderOptions>,
  source: string
): string {
  const options = this.getOptions() || {};
  
  // Skip if file doesn't match test pattern
  if (options.test && !options.test.test(this.resourcePath)) {
    return source;
  }
  
  // Skip if file matches exclusion patterns
  if (options.exclude?.some(pattern => pattern.test(this.resourcePath))) {
    return source;
  }
  
  // Quick check for @doc-code-tool to avoid processing files without it
  if (!source.includes('@doc-code-tool')) {
    return source;
  }
  
  try {
    const transformed = transformDocCodeTools(source, this.resourcePath);
    return transformed;
  } catch (error) {
    this.emitError(error as Error);
    return source;
  }
}

// TypeScript declaration for webpack
export const raw = false;
