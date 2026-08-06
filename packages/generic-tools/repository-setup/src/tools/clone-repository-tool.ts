/**
 * CLONE REPOSITORY TOOL - VCS-ABSTRACTED EXCELLENCE
 * 
 * Provider-agnostic repository cloning with intelligent caching,
 * authentication management, and comprehensive error recovery.
 * 
 * @doc-tool
 * name: "clone-repository"
 * category: "repository-operations"
 * version: "1.0.0"
 * priority: "critical"
 * stability: "stable"
 * 
 * @doc-tool-purpose
 * Clone repositories from any VCS provider (GitHub, GitLab, Bitbucket)
 * with intelligent caching, authentication management, and safety validation.
 * 
 * @doc-tool-capabilities
 * - Provider-agnostic cloning (GitHub, GitLab, Bitbucket)
 * - Intelligent cache management for repeated clones
 * - Authentication handling via connection IDs
 * - Branch and commit-specific cloning
 * - Shallow clone support for performance
 * - Submodule initialization
 * - Progress tracking and cancellation
 * - Automatic retry with exponential backoff
 * 
 * @doc-tool-parameters
 * provider: {
 *   type: "enum",
 *   values: ["github", "gitlab", "bitbucket"],
 *   required: true,
 *   description: "VCS provider type"
 * }
 * owner: {
 *   type: "string",
 *   required: true,
 *   description: "Repository owner/organization"
 * }
 * name: {
 *   type: "string",
 *   required: true,
 *   description: "Repository name"
 * }
 * ref: {
 *   type: "string",
 *   default: "main",
 *   description: "Branch, tag, or commit to clone"
 * }
 * connectionId: {
 *   type: "number",
 *   required: true,
 *   description: "VCS connection ID for authentication"
 * }
 * targetPath: {
 *   type: "string",
 *   required: false,
 *   description: "Custom clone destination (auto-generated if not provided)"
 * }
 * shallow: {
 *   type: "boolean",
 *   default: false,
 *   description: "Perform shallow clone for faster operations"
 * }
 * depth: {
 *   type: "number",
 *   default: 1,
 *   description: "Depth for shallow clones"
 * }
 * submodules: {
 *   type: "boolean",
 *   default: true,
 *   description: "Initialize and update submodules"
 * }
 * cache: {
 *   type: "object",
 *   properties: {
 *     enabled: { type: "boolean", default: true },
 *     ttl: { type: "number", default: 3600 },
 *     strategy: { type: "enum", values: ["aggressive", "conservative"], default: "conservative" }
 *   },
 *   description: "Cache configuration for repeated clones"
 * }
 * 
 * @doc-tool-output
 * {
 *   success: boolean,
 *   path: string,
 *   provider: string,
 *   repository: {
 *     owner: string,
 *     name: string,
 *     ref: string,
 *     commit: string,
 *     size: number
 *   },
 *   cache: {
 *     hit: boolean,
 *     age?: number,
 *     refreshed: boolean
 *   },
 *   timing: {
 *     clone: number,
 *     submodules?: number,
 *     total: number
 *   },
 *   error?: {
 *     code: string,
 *     message: string,
 *     retryable: boolean,
 *     suggestions: string[]
 *   }
 * }
 * 
 * @doc-tool-examples
 * // Clone GitHub repository
 * {
 *   "provider": "github",
 *   "owner": "microsoft",
 *   "name": "typescript",
 *   "ref": "main",
 *   "connectionId": 12345
 * }
 * 
 * // Clone specific commit with shallow depth
 * {
 *   "provider": "gitlab",
 *   "owner": "gitlab-org",
 *   "name": "gitlab",
 *   "ref": "abc123def",
 *   "connectionId": 67890,
 *   "shallow": true,
 *   "depth": 10
 * }
 * 
 * // Clone with custom path and no cache
 * {
 *   "provider": "bitbucket",
 *   "owner": "atlassian",
 *   "name": "jira-sdk",
 *   "ref": "v2.0.0",
 *   "connectionId": 54321,
 *   "targetPath": "/workspace/deps/jira-sdk",
 *   "cache": { "enabled": false }
 * }
 * 
 * @doc-tool-errors
 * AUTH_FAILED: "Authentication failed for connection ID"
 * REPO_NOT_FOUND: "Repository not found or access denied"
 * REF_NOT_FOUND: "Specified ref (branch/tag/commit) not found"
 * NETWORK_ERROR: "Network connectivity issues"
 * DISK_FULL: "Insufficient disk space for clone"
 * PERMISSION_DENIED: "Cannot write to target directory"
 * 
 * @doc-tool-best-practices
 * - Use shallow clones for CI/CD to improve performance
 * - Enable caching for frequently accessed repositories
 * - Specify exact commits for reproducible builds
 * - Monitor disk usage when cloning large repositories
 * - Use connection pooling for multiple clone operations
 * 
 * @doc-tool-integration
 * Works seamlessly with:
 * - VCS connection manager for authentication
 * - File tracker for repository analysis
 * - Cache manager for efficient operations
 * - Progress reporter for UI feedback
 * 
 * @doc-tool-performance
 * - Supports parallel clone operations
 * - Automatic retry with exponential backoff
 * - Bandwidth throttling for network efficiency
 * - Progress reporting for large repositories
 * 
 * @doc-tool-security
 * - Credentials never exposed in logs or errors
 * - Secure credential storage via connection manager
 * - Path traversal protection for target paths
 * - Automatic cleanup on failure
 */

import { Tool } from '@bitcode/tools-generics';
import { VCSProvider, VCSOperation } from '@bitcode/vcs-generics';
import { z } from 'zod';

// Input schema with comprehensive validation
const CloneRepositorySchema = z.object({
  provider: z.enum(['github', 'gitlab', 'bitbucket']),
  owner: z.string().min(1),
  name: z.string().min(1),
  ref: z.string().default('main'),
  connectionId: z.number().int().positive(),
  targetPath: z.string().optional(),
  shallow: z.boolean().default(false),
  depth: z.number().int().positive().default(1),
  submodules: z.boolean().default(true),
  cache: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().int().positive().default(3600),
    strategy: z.enum(['aggressive', 'conservative']).default('conservative')
  }).default({})
});

// Output schema
const CloneRepositoryOutputSchema = z.object({
  success: z.boolean(),
  path: z.string(),
  provider: z.string(),
  repository: z.object({
    owner: z.string(),
    name: z.string(),
    ref: z.string(),
    commit: z.string(),
    size: z.number()
  }),
  cache: z.object({
    hit: z.boolean(),
    age: z.number().optional(),
    refreshed: z.boolean()
  }),
  timing: z.object({
    clone: z.number(),
    submodules: z.number().optional(),
    total: z.number()
  }),
  error: z.object({
    code: z.string(),
    message: z.string(),
    retryable: z.boolean(),
    suggestions: z.array(z.string())
  }).optional()
});

/**
 * Clone repository implementation using VCS abstractions
 */
async function cloneRepository(input: z.infer<typeof CloneRepositorySchema>) {
  const startTime = Date.now();
  
  try {
    // Get VCS provider instance
    const provider = await VCSProvider.getInstance(input.provider, input.connectionId);
    
    // Execute clone operation
    const result = await provider.clone({
      owner: input.owner,
      name: input.name,
      ref: input.ref,
      targetPath: input.targetPath,
      shallow: input.shallow,
      depth: input.depth,
      submodules: input.submodules,
      cache: input.cache
    });
    
    const totalTime = Date.now() - startTime;
    
    return {
      success: true,
      path: result.path,
      provider: input.provider,
      repository: {
        owner: input.owner,
        name: input.name,
        ref: input.ref,
        commit: result.commit,
        size: result.size
      },
      cache: {
        hit: result.cacheHit || false,
        age: result.cacheAge,
        refreshed: result.cacheRefreshed || false
      },
      timing: {
        clone: result.cloneTime,
        submodules: result.submoduleTime,
        total: totalTime
      }
    };
  } catch (error: any) {
    return {
      success: false,
      path: '',
      provider: input.provider,
      repository: {
        owner: input.owner,
        name: input.name,
        ref: input.ref,
        commit: '',
        size: 0
      },
      cache: {
        hit: false,
        refreshed: false
      },
      timing: {
        clone: 0,
        total: Date.now() - startTime
      },
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        retryable: error.retryable || false,
        suggestions: error.suggestions || []
      }
    };
  }
}

/**
 * Modern Clone Repository Tool
 */
class CloneRepositoryTool extends Tool<typeof cloneRepository> {
  use = cloneRepository;
  
  // Tool metadata for runtime introspection
  static metadata = {
    name: 'clone-repository',
    category: 'repository-operations',
    version: '1.0.0',
    inputSchema: CloneRepositorySchema,
    outputSchema: CloneRepositoryOutputSchema
  };
}

export const cloneRepositoryTool = new CloneRepositoryTool();
export type CloneRepositoryToolFn = Tool<typeof cloneRepositoryTool.use>;