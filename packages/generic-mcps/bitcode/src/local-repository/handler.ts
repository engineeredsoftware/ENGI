/**
 * Local Repository Handler for MCP Server
 * 
 * Provides secure access to local file systems with proper sandboxing
 * and permission controls for Claude Code integration.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '@bitcode/logger';
import type { RepositoryContext } from '../types';

/**
 * Local repository configuration
 */
export interface LocalRepositoryConfig {
  allowedPaths: string[];          // Whitelist of allowed base paths
  maxFileSize: number;             // Maximum file size to read (bytes)
  maxFiles: number;                // Maximum number of files to scan
  excludePatterns: string[];       // Patterns to exclude (e.g., node_modules)
  followSymlinks: boolean;         // Whether to follow symbolic links
  readOnly: boolean;               // Restrict to read-only operations
}

/**
 * Default configuration for local repositories
 */
export const DEFAULT_LOCAL_CONFIG: LocalRepositoryConfig = {
  allowedPaths: [
    process.env.HOME || '',
    '/tmp',
    '/var/tmp'
  ].filter(Boolean),
  maxFileSize: 50 * 1024 * 1024,  // 50MB
  maxFiles: 10000,                 // 10k files max
  excludePatterns: [
    '**/node_modules/**',
    '**/.git/objects/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/*.log',
    '**/*.lock'
  ],
  followSymlinks: false,
  readOnly: true
};

/**
 * Validate and sanitize local path
 */
export function validateLocalPath(
  requestedPath: string,
  config: LocalRepositoryConfig = DEFAULT_LOCAL_CONFIG
): { valid: boolean; resolvedPath?: string; error?: string } {
  try {
    // Resolve to absolute path
    const resolvedPath = path.resolve(requestedPath);
    
    // Check if path is within allowed directories
    const isAllowed = config.allowedPaths.some(allowedPath => {
      const resolved = path.resolve(allowedPath);
      return resolvedPath.startsWith(resolved);
    });
    
    if (!isAllowed) {
      return {
        valid: false,
        error: `Path ${resolvedPath} is not within allowed directories`
      };
    }
    
    // Additional security checks
    if (resolvedPath.includes('..')) {
      return {
        valid: false,
        error: 'Path traversal detected'
      };
    }
    
    return {
      valid: true,
      resolvedPath
    };
    
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid path'
    };
  }
}

/**
 * Prepare local repository for pipeline execution
 */
export async function prepareLocalRepository(
  repository: RepositoryContext,
  config: LocalRepositoryConfig = DEFAULT_LOCAL_CONFIG
): Promise<{
  success: boolean;
  localPath?: string;
  metadata?: any;
  error?: string;
}> {
  if (repository.provider !== 'local' || !repository.path) {
    return {
      success: false,
      error: 'Invalid local repository configuration'
    };
  }
  
  // Validate path
  const validation = validateLocalPath(repository.path, config);
  if (!validation.valid || !validation.resolvedPath) {
    return {
      success: false,
      error: validation.error || 'Path validation failed'
    };
  }
  
  const localPath = validation.resolvedPath;
  
  try {
    // Check if path exists and is accessible
    const stats = await fs.stat(localPath);
    
    if (!stats.isDirectory()) {
      return {
        success: false,
        error: 'Path is not a directory'
      };
    }
    
    // Get basic repository information
    const gitPath = path.join(localPath, '.git');
    const hasGit = await fs.access(gitPath).then(() => true).catch(() => false);
    
    // Count files (limited scan)
    const fileCount = await countFiles(localPath, config);
    
    logger.info('Local repository prepared', {
      path: localPath,
      hasGit,
      fileCount,
      repository: repository.name
    });
    
    return {
      success: true,
      localPath,
      metadata: {
        hasGit,
        fileCount,
        absolutePath: localPath,
        permissions: {
          read: true,
          write: !config.readOnly,
          execute: false
        }
      }
    };
    
  } catch (error) {
    logger.error('Failed to prepare local repository', {
      path: localPath,
      error: error instanceof Error ? error.message : error
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to access local repository'
    };
  }
}

/**
 * Count files in directory with limits
 */
async function countFiles(
  dirPath: string,
  config: LocalRepositoryConfig,
  currentCount: number = 0
): Promise<number> {
  if (currentCount >= config.maxFiles) {
    return currentCount;
  }
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let count = currentCount;
    
    for (const entry of entries) {
      if (count >= config.maxFiles) break;
      
      const fullPath = path.join(dirPath, entry.name);
      
      // Check exclusion patterns
      const shouldExclude = config.excludePatterns.some(pattern => {
        // Simple glob matching (could be enhanced with proper glob library)
        const regex = new RegExp(
          pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
        );
        return regex.test(fullPath);
      });
      
      if (shouldExclude) continue;
      
      if (entry.isDirectory()) {
        count = await countFiles(fullPath, config, count);
      } else if (entry.isFile()) {
        count++;
      }
    }
    
    return count;
    
  } catch (error) {
    logger.warn('Error counting files', {
      path: dirPath,
      error: error instanceof Error ? error.message : error
    });
    return currentCount;
  }
}

/**
 * Create a sandboxed file system interface
 */
export class SandboxedFileSystem {
  constructor(
    private basePath: string,
    private config: LocalRepositoryConfig = DEFAULT_LOCAL_CONFIG
  ) {
    const validation = validateLocalPath(basePath, config);
    if (!validation.valid || !validation.resolvedPath) {
      throw new Error(validation.error || 'Invalid base path');
    }
    this.basePath = validation.resolvedPath;
  }
  
  /**
   * Read file with size limits
   */
  async readFile(relativePath: string): Promise<string> {
    const fullPath = path.join(this.basePath, relativePath);
    const validation = validateLocalPath(fullPath, this.config);
    
    if (!validation.valid || !validation.resolvedPath) {
      throw new Error(validation.error || 'Invalid file path');
    }
    
    const stats = await fs.stat(validation.resolvedPath);
    
    if (stats.size > this.config.maxFileSize) {
      throw new Error(`File size ${stats.size} exceeds maximum ${this.config.maxFileSize}`);
    }
    
    return fs.readFile(validation.resolvedPath, 'utf-8');
  }
  
  /**
   * List directory contents
   */
  async listDirectory(relativePath: string = '.'): Promise<Array<{
    name: string;
    type: 'file' | 'directory';
    size?: number;
  }>> {
    const fullPath = path.join(this.basePath, relativePath);
    const validation = validateLocalPath(fullPath, this.config);
    
    if (!validation.valid || !validation.resolvedPath) {
      throw new Error(validation.error || 'Invalid directory path');
    }
    
    const entries = await fs.readdir(validation.resolvedPath, { withFileTypes: true });
    const results = [];
    
    for (const entry of entries) {
      const entryPath = path.join(validation.resolvedPath, entry.name);
      
      // Check exclusions
      const shouldExclude = this.config.excludePatterns.some(pattern => {
        const regex = new RegExp(
          pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
        );
        return regex.test(entryPath);
      });
      
      if (shouldExclude) continue;
      
      if (entry.isFile()) {
        const stats = await fs.stat(entryPath);
        results.push({
          name: entry.name,
          type: 'file' as const,
          size: stats.size
        });
      } else if (entry.isDirectory()) {
        results.push({
          name: entry.name,
          type: 'directory' as const
        });
      }
    }
    
    return results;
  }
  
  /**
   * Check if file exists
   */
  async exists(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, relativePath);
    const validation = validateLocalPath(fullPath, this.config);
    
    if (!validation.valid || !validation.resolvedPath) {
      return false;
    }
    
    try {
      await fs.access(validation.resolvedPath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get file stats
   */
  async getStats(relativePath: string): Promise<{
    size: number;
    modified: Date;
    created: Date;
    isFile: boolean;
    isDirectory: boolean;
  }> {
    const fullPath = path.join(this.basePath, relativePath);
    const validation = validateLocalPath(fullPath, this.config);
    
    if (!validation.valid || !validation.resolvedPath) {
      throw new Error(validation.error || 'Invalid file path');
    }
    
    const stats = await fs.stat(validation.resolvedPath);
    
    return {
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  }
}

/**
 * Transform local repository to remote-like structure for pipelines
 */
export function transformLocalToRemote(
  repository: RepositoryContext,
  localPath: string
): RepositoryContext {
  return {
    ...repository,
    owner: 'local',
    name: path.basename(localPath),
    url: `file://${localPath}`,
    // Keep local path for reference
    metadata: {
      ...repository.metadata,
      localPath,
      isLocal: true
    }
  } satisfies RepositoryContext;
}
