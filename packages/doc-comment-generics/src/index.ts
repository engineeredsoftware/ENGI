import type {
  DocComment,
  DocCommentParser,
  DocCommentPlugin
} from './types';
import type { ValidationError, ValidationResult } from './base-plugin';

/**
 * DOC-COMMENTS - PURE BUILD-TIME PLUGIN INFRASTRUCTURE
 * 
 * This package provides ONLY the foundational plugin architecture.
 * It contains NO plugin implementations - those belong in their
 * respective packages or standalone plugin packages.
 * 
 * Core responsibilities:
 * - Define plugin interfaces and base classes
 * - Provide plugin registry and loading mechanism
 * - Define core types for doc-comment parsing
 * 
 * @doc-package
 * version: 2.0.0
 * pattern: pure-infrastructure
 * architecture: "Pure plugin infrastructure without implementation"
 */

// ==================== CORE EXPORTS ====================

// Export base plugin architecture
export {
  BaseDocCommentPlugin
} from './base-plugin';

export type {
  BaseDocMetadata,
  ValidationResult,
  ValidationError
} from './base-plugin';

// Export core types
export type {
  DocComment,
  DocCommentPlugin,
  DocCommentMetadata,
  ParseLocation,
  InjectionSpec,
  DocCommentBuildConfig,
  DocCommentParser
} from './types';

// ==================== PLUGIN REGISTRY ====================
// The registry system allows external packages to register their plugins

/**
 * Global plugin registry
 */
const PLUGIN_REGISTRY = new Map<string, DocCommentPlugin>();

/**
 * Register a plugin
 */
export function registerPlugin(plugin: DocCommentPlugin): void {
  if (PLUGIN_REGISTRY.has(plugin.name)) {
    throw new Error(`Plugin ${plugin.name} is already registered`);
  }
  PLUGIN_REGISTRY.set(plugin.name, plugin);
}

/**
 * Unregister a plugin
 */
export function unregisterPlugin(name: string): boolean {
  return PLUGIN_REGISTRY.delete(name);
}

/**
 * Get a registered plugin by name
 */
export function getPlugin(name: string): DocCommentPlugin | undefined {
  return PLUGIN_REGISTRY.get(name);
}

/**
 * Get all registered plugins
 */
export function getAllPlugins(): DocCommentPlugin[] {
  return Array.from(PLUGIN_REGISTRY.values());
}

/**
 * Clear all registered plugins
 */
export function clearPlugins(): void {
  PLUGIN_REGISTRY.clear();
}

// ==================== PLUGIN LOADING ====================

/**
 * Plugin loader configuration
 */
export interface PluginLoaderConfig {
  /** Packages to scan for plugins */
  packages?: string[];
  /** Specific plugin names to load */
  plugins?: string[];
  /** Auto-discover plugins in node_modules */
  autoDiscover?: boolean;
}

/**
 * Load plugins from packages
 * This would be implemented by the build tool
 */
export async function loadPlugins(config: PluginLoaderConfig): Promise<void> {
  // This is a placeholder - actual implementation would:
  // 1. Scan specified packages for exported plugins
  // 2. Auto-discover plugins if enabled
  // 3. Register found plugins
  console.log('[DocComments] Plugin loading would happen here:', config);
}

// ==================== PLUGIN REGISTRY ====================

// ==================== PLUGIN DISCOVERY ====================

/**
 * Well-known plugin packages that can be auto-discovered
 */
export const WELL_KNOWN_PLUGIN_PACKAGES = [
  '@bitcode/prompts',                    // doc-prompt, doc-promptpart
  '@bitcode/pipelines-generics',         // doc-pgri
  '@bitcode/pipelines/awareness',        // doc-sient
  '@bitcode/doc-field',                  // doc-field
  '@bitcode/doc-typescript',             // doc-typescript
  '@bitcode/doc-dryrun',                 // doc-dryrun
  '@bitcode/doc-comment-developing',             // base for development plugins
  '@bitcode/doc-comment-developing-promptpart',  // development prompt part
  '@bitcode/doc-comment-developing-prompt'       // development prompt
] as const;

/**
 * Plugin export convention
 * Packages should export their plugins as:
 * - Named export: `export const docXxxPlugin`
 * - Default export: `export default docXxxPlugin`
 * - Plugin array: `export const docCommentPlugins = [...]`
 */
export interface PluginExportConvention {
  /** Single plugin as named export */
  [pluginName: string]: DocCommentPlugin | DocCommentPlugin[] | undefined;
  /** Single plugin as default */
  default?: DocCommentPlugin;
  /** Multiple plugins array */
  docCommentPlugins?: DocCommentPlugin[];
}

// ==================== PARSER FACTORY ====================

/**
 * Parser factory - creates parsers using registered plugins
 */
export function createParser(plugins?: DocCommentPlugin[]): DocCommentParser {
  const pluginsToUse = plugins || getAllPlugins();
  
  // The actual parser implementation would be provided by
  // the consuming package or build tool
  return {
    parseFile(content: string, filePath: string): any[] {
      throw new Error(
        'Parser implementation must be provided by consuming package. ' +
        'The doc-comments package only provides interfaces.'
      );
    },
    
    parseComment(comment: string, context: any): any {
      throw new Error(
        'Parser implementation must be provided by consuming package. ' +
        'The doc-comments package only provides interfaces.'
      );
    }
  };
}

// ==================== RE-EXPORTS ====================
// Already exported above, no read to re-export
