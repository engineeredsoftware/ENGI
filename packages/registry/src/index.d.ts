/**
 * Registry - Hierarchical key-value store with priority-based resolution
 *
 * Registry stores multiple values per path with different priorities, returning the
 * highest priority value. This enables configuration inheritance where specific
 * contexts override general defaults.
 *
 * Example: A tool registry might have:
 * - 'pipeline:asset-pack' -> all tools for the AssetPack pipeline (priority 0)
 * - 'pipeline:asset-pack:phase:implementation' -> subset for implementation (priority 10)
 * - 'pipeline:asset-pack:phase:implementation:agent:synthesizer' -> further subset (priority 20)
 *
 * Paths use colon (:) separator to create hierarchies for filtering and cascading.
 */
export declare const REGISTRY_PATH_SEPARATOR = ":";
export interface RegistryEntry<T> {
    value: T;
    priority: number;
    metadata?: Record<string, any>;
}
export interface Registry<T extends object> {
    set(path: string, value: T, priority?: number, metadata?: Record<string, any>): this;
    get(path: string): T | undefined;
    get(paths: string[], merger?: (base: T, override: T) => T): T | undefined;
    getAll(path: string): RegistryEntry<T>[];
    has(path: string): boolean;
    clear(path?: string): this;
    getPaths(): string[];
    merge(other: Registry<T>): this;
}
/**
 * RegistryPathBuilder - Constructs hierarchical registry paths
 *
 * Builds colon-separated paths for use with Registry. Domain-agnostic -
 * consumers create domain-specific paths using add() method.
 */
export declare class RegistryPathBuilder {
    private segments;
    static from(...segments: string[]): RegistryPathBuilder;
    add(segment: string): this;
    addAll(...segments: string[]): this;
    build(): string;
    buildHierarchy(): string[];
    clone(): RegistryPathBuilder;
}
/**
 * RegistryImpl - The core registry implementation
 */
export declare class RegistryImpl<T extends object> implements Registry<T> {
    protected entries: Map<string, RegistryEntry<T>[]>;
    set(path: string, value: T, priority?: number, metadata?: Record<string, any>): this;
    get(path: string): T | undefined;
    get(paths: string[], merger?: (base: T, override: T) => T): T | undefined;
    getAll(path: string): RegistryEntry<T>[];
    has(path: string): boolean;
    clear(path?: string): this;
    getPaths(): string[];
    merge(other: Registry<T>): this;
}
declare function factoryRegistry<T extends object>(): RegistryImpl<T>;
/**
 * Split a registry path into segments
 */
export declare function splitRegistryPath(path: string): string[];
/**
 * Join segments into a registry path
 */
export declare function joinRegistryPath(...segments: string[]): string;
/**
 * Get parent registry path (e.g., 'a:b:c' -> 'a:b')
 */
export declare function getParentRegistryPath(path: string): string | null;
/**
 * Get all parent registry paths (e.g., 'a:b:c' -> ['a', 'a:b'])
 */
export declare function getParentRegistryPaths(path: string): string[];
/**
 * Check if one registry path is a parent of another
 */
export declare function isParentRegistryPath(parent: string, child: string): boolean;
export { factoryRegistry };
