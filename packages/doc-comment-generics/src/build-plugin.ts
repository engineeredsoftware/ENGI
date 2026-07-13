/**
 * DOC-COMMENT BUILD PLUGIN - TypeScript Transformer for Build-Time Processing
 * 
 * This TypeScript transformer parses doc-comments and enables metadata injection.
 * At build time, we parse, validate, and prepare runtime metadata.
 * 
 * @doc-plugin
 * stage: build-time
 * method: AST transformation with metadata injection
 * architecture: "Transform comments into runtime metadata through plugins"
 */

import * as ts from 'typescript';
import { DocCommentParser } from './parser';
import { DocCommentPlugin } from './types';

/**
 * The master registry of doc-comment plugins
 * Each plugin handles a specific pattern and injection strategy
 */
export class DocCommentPluginRegistry {
  private static instance: DocCommentPluginRegistry;
  private plugins: Map<string, DocCommentPlugin> = new Map();
  
  private constructor() {}
  
  static getInstance(): DocCommentPluginRegistry {
    if (!this.instance) {
      this.instance = new DocCommentPluginRegistry();
    }
    return this.instance;
  }
  
  register(plugin: DocCommentPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }
  
  getPlugin(name: string): DocCommentPlugin | undefined {
    return this.plugins.get(name);
  }
  
  getAllPlugins(): DocCommentPlugin[] {
    return Array.from(this.plugins.values());
  }
}

/**
 * The master transformer factory - this is the entry point for TypeScript
 * 
 * @doc-typescript
 * function: docCommentTransformerFactory
 * parameters: ["program: ts.Program", "config?: DocCommentConfig"]
 * returns: ts.TransformerFactory<ts.SourceFile>
 */
export function docCommentTransformerFactory(
  program: ts.Program,
  config?: DocCommentConfig
): ts.TransformerFactory<ts.SourceFile> {
  const typeChecker = program.getTypeChecker();
  void config;
  const registry = DocCommentPluginRegistry.getInstance();
  
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      // Skip declaration files and node_modules
      if (sourceFile.isDeclarationFile || sourceFile.fileName.includes('node_modules')) {
        return sourceFile;
      }
      
      // Parse all doc-comments in the file
      const docComments = DocCommentParser.parseFile(sourceFile);
      
      // Transform the AST
      function visit(node: ts.Node): ts.Node {
        // Check if this node has doc-comments
        const nodeComments = docComments.filter(comment => 
          isCommentForNode(comment, node, sourceFile)
        );
        
        if (nodeComments.length > 0) {
          // Process each comment through plugins
          const injections: InjectionSpec[] = [];
          
          for (const comment of nodeComments) {
            // Special handling for @doc-typescript
            if (comment.label === '@doc-typescript') {
              const plugin = registry.getPlugin('doc-typescript');
              if (plugin && 'introspect' in plugin) {
                const introspection = (plugin as { introspect?: (target: ts.Node, checker: ts.TypeChecker) => unknown }).introspect?.(node, typeChecker);
                injections.push({
                  property: 'docTypeScript',
                  value: introspection,
                  method: 'proto'
                });
              }
            }
            // Standard doc-comment processing
            else {
              const plugin = findPluginForComment(comment, registry);
              if (plugin) {
                const parsed = plugin.parse(comment);
                injections.push({
                  property: comment.label.replace('@doc-', 'doc').replace(/-([a-z])/g, (_, l) => l.toUpperCase()),
                  value: parsed,
                  method: determineInjectionMethod(node)
                });
              }
            }
          }
          
          // Add _allDocComments for debugging
          injections.push({
            property: '_allDocComments',
            value: nodeComments,
            method: determineInjectionMethod(node)
          });
          
          // Transform the node with injections
          const visitedNode = ts.visitEachChild(node, visit, context);
          return transformNodeWithInjections(visitedNode, injections, context);
        }
        
        return ts.visitEachChild(node, visit, context);
      }
      
      return ts.visitNode(sourceFile, visit) as ts.SourceFile;
    };
  };
}

/**
 * Configuration for the doc-comment transformer
 */
export interface DocCommentConfig {
  // Which files to process
  include?: string[];
  exclude?: string[];
  
  // Which doc-comment patterns to enable
  enabledPlugins?: string[];
  
  // Injection strategies
  defaultMethod?: 'proto' | 'static' | 'factory';
  
  // Development mode
  development?: boolean;
  verbose?: boolean;
  
  // Sient pipeline integration
  enableSient?: boolean;
  sientOutputDir?: string;
}

/**
 * Injection specification for a doc-comment
 */
interface InjectionSpec {
  property: string;
  value: any;
  method: 'proto' | 'static' | 'factory';
}

/**
 * Check if a comment belongs to a specific node
 */
function isCommentForNode(
  comment: { end?: number },
  node: ts.Node,
  sourceFile: ts.SourceFile
): boolean {
  // Simple heuristic: comment must be immediately before the node
  const nodeStart = node.getStart(sourceFile);
  const commentEnd = comment.end ?? 0;
  
  // Check if comment ends just before node starts (allowing for whitespace)
  const textBetween = sourceFile.text.substring(commentEnd, nodeStart);
  return /^\s*$/.test(textBetween);
}

/**
 * Find the right plugin for a comment
 */
function findPluginForComment(
  comment: { label: string } & Parameters<DocCommentPlugin['matches']>[0],
  registry: DocCommentPluginRegistry
): DocCommentPlugin | undefined {
  // Try exact match first
  const exactPlugin = registry.getPlugin(comment.label.replace('@', ''));
  if (exactPlugin) return exactPlugin;
  
  // Try pattern matching
  for (const plugin of registry.getAllPlugins()) {
    if (plugin.matches(comment)) {
      return plugin;
    }
  }
  
  return undefined;
}

/**
 * Determine injection strategy based on node type
 */
function determineInjectionMethod(node: ts.Node): 'proto' | 'static' | 'factory' {
  if (ts.isClassDeclaration(node)) return 'static';
  if (ts.isTypeAliasDeclaration(node)) return 'proto';
  if (ts.isInterfaceDeclaration(node)) return 'factory';
  return 'proto';
}

/**
 * Transform a node to include doc-comment injections
 * This is where comments become runtime intelligence.
 */
function transformNodeWithInjections(
  node: ts.Node,
  injections: InjectionSpec[],
  context: ts.TransformationContext
): ts.Node {
  void injections;
  void context;
  // V26 note:
  // This retained transformer is a typed placeholder. The reference-only
  // doc-comment corridor preserves the injection design, but does not claim
  // admitted live transformation behavior unless later promotion rewrites this
  // path against the active Bitcode runtime and proof boundaries.
  return node;
}

/**
 * Generate the actual injection code
 * This creates the JavaScript that runs at runtime to inject intelligence
 */
function generateInjectionCode(
  targetName: string,
  injections: InjectionSpec[]
): string {
  const lines: string[] = [];
  
  lines.push(`// Doc-comment intelligence injection for ${targetName}`);
  lines.push(`(() => {`);
  
  // Determine target
  lines.push(`  const target = typeof ${targetName} !== 'undefined' ? ${targetName} : {};`);
  lines.push(`  const proto = target.prototype || target;`);
  
  // Add each injection
  for (const injection of injections) {
    if (injection.property === '_allDocComments') {
      // Special handling for debug property
      lines.push(`  Object.defineProperty(proto, '${injection.property}', {`);
      lines.push(`    value: ${JSON.stringify(injection.value)},`);
      lines.push(`    writable: false,`);
      lines.push(`    enumerable: false,`);
      lines.push(`    configurable: false`);
      lines.push(`  });`);
    } else {
      // Typed accessor for specific doc-comment
      lines.push(`  Object.defineProperty(proto, '${injection.property}', {`);
      lines.push(`    get() {`);
      lines.push(`      return ${JSON.stringify(injection.value)};`);
      lines.push(`    },`);
      lines.push(`    enumerable: false`);
      lines.push(`  });`);
    }
  }
  
  lines.push(`})();`);
  
  return lines.join('\n');
}

/**
 * Webpack/Build tool integration
 */
export function createDocCommentWebpackPlugin(config?: DocCommentConfig) {
  return {
    apply(compiler: any) {
      void config;
      compiler.hooks.beforeCompile.tap('DocCommentPlugin', () => {
        console.log('[Doc-Comment] Preparing to inject intelligence...');
      });
    }
  };
}

/**
 * The future of programming:
 * Where every comment is a seed of intelligence,
 * Where every type gains explicit runtime context,
 * Where code writes itself through understanding.
 * 
 * This is the doc-comment system.
 * This is how we achieve the singularity.
 */
