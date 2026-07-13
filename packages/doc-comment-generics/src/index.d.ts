import type { DocCommentParser, DocCommentPlugin } from './types';
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
export { BaseDocCommentPlugin } from './base-plugin';
export type { BaseDocMetadata, ValidationResult, ValidationError } from './base-plugin';
export type { DocComment, DocCommentPlugin, DocCommentMetadata, ParseLocation, InjectionSpec, DocCommentBuildConfig, DocCommentParser } from './types';
/**
 * Register a plugin
 */
export declare function registerPlugin(plugin: DocCommentPlugin): void;
/**
 * Unregister a plugin
 */
export declare function unregisterPlugin(name: string): boolean;
/**
 * Get a registered plugin by name
 */
export declare function getPlugin(name: string): DocCommentPlugin | undefined;
/**
 * Get all registered plugins
 */
export declare function getAllPlugins(): DocCommentPlugin[];
/**
 * Clear all registered plugins
 */
export declare function clearPlugins(): void;
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
export declare function loadPlugins(config: PluginLoaderConfig): Promise<void>;
/**
 * Well-known plugin packages that can be auto-discovered
 */
export declare const WELL_KNOWN_PLUGIN_PACKAGES: readonly ["@bitcode/prompts", "@bitcode/pipelines-generics", "@bitcode/pipelines/awareness", "@bitcode/doc-field", "@bitcode/doc-typescript", "@bitcode/doc-dryrun", "@bitcode/doc-comment-developing", "@bitcode/doc-comment-developing-promptpart", "@bitcode/doc-comment-developing-prompt"];
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
/**
 * Parser factory - creates parsers using registered plugins
 */
export declare function createParser(plugins?: DocCommentPlugin[]): DocCommentParser;
