/**
 * Bitcode MCP Server Authentication Middleware
 * 
 * Updated to use the ORM for all database operations.
 * Provides secure, organization-scoped access to MCP server capabilities.
 * 
 * @doc-code
 * type: middleware
 * category: auth
 * pattern: orm-integration
 */

import { createClient } from '@bitcode/supabase';
import { logger } from '@bitcode/logger';
import {
  BtdRegistryModel,
  UsersModel,
  UserProfilesModel,
  UserApiKeysModel,
  UserBtdBalancesModel,
  OrganizationsModel,
  OrganizationMembersModel,
  readBitcodeWalletBindingFromProfile,
  type UserProfile,
} from '@bitcode/orm';
import {
  buildBtdReadAccessProjectionFromRegistryRows,
  evaluateBtdOrganizationInterfaceAuthority,
  evaluateBtdReadAccess,
  type BtdOrganizationPermissionAction,
  type BtdRepairApprovalState,
  type BtdAccessDecisionKind,
  type BtdSettlementAuthorityState,
} from '@bitcode/btd';
import type { MCPAuthContext } from '../types';
import * as crypto from 'crypto';
import { LRUCache } from '../caching-utilities/lru-cache';

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  context?: MCPAuthContext;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
}

/**
 * MCP authentication options
 */
export interface MCPAuthOptions {
  requireOrganization?: boolean;
  requiredPermissions?: {
    pipelines?: Array<'create' | 'read' | 'cancel' | 'retry'>;
    organization?: Array<'manageMembers' | 'viewAnalytics' | 'manageBtdHoldings'>;
    resources?: Array<'read' | 'export'>;
  };
  minimumRole?: 'viewer' | 'member' | 'admin' | 'owner';
  /**
   * Deprecated compatibility input. Gate code must require registry-derived
   * owner-read or licensed-read instead of aggregate BTD holding thresholds.
   */
  minimumBtdHolding?: number;
  requiredReadAccess?: MCPReadAccessRequirement | MCPReadAccessRequirement[];
  requiredInterfaceAuthority?: MCPInterfaceAuthorityRequirement | MCPInterfaceAuthorityRequirement[];
}

export interface MCPReadAccessRequirement {
  assetPackId: string;
  walletId?: string;
  allowedDecisions?: Array<Exclude<BtdAccessDecisionKind, 'denied'>>;
  at?: string;
}

export interface MCPInterfaceAuthorityRequirement {
  action: BtdOrganizationPermissionAction;
  targetAnchor?: string;
  settlementState?: BtdSettlementAuthorityState;
  confirmed?: boolean;
  repairApprovalState?: BtdRepairApprovalState;
  at?: string;
}

type MCPWalletProfileSource = UserProfile & Record<string, unknown>;

export const authCache = new LRUCache<string, MCPAuthContext>(10000);

/**
 * Extract API key from authorization header
 */
function extractApiKey(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

/**
 * Hash API key for secure storage comparison
 */
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Authenticate MCP request using ORM
 */
export async function authenticateMCPRequest(
  authHeader: string | undefined,
  options: MCPAuthOptions = {}
): Promise<AuthResult> {
  const apiKey = extractApiKey(authHeader);
  
  if (!apiKey) {
    return {
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: 'API key required in Authorization header',
        statusCode: 401
      }
    };
  }

  const cachedContext = authCache.get(apiKey);
  if (cachedContext) {
    return validateAuthenticatedContext(cachedContext, options);
  }

  try {
    // Initialize ORM models
    const supabase = createClient();
    const users = new UsersModel(supabase);
    const userProfiles = new UserProfilesModel(supabase);
    const userApiKeys = new UserApiKeysModel(supabase);
    const userBtdBalances = new UserBtdBalancesModel(supabase);
    const organizations = new OrganizationsModel(supabase);
    const organizationMembers = new OrganizationMembersModel(supabase);

    // Verify API key
    const keyHash = hashApiKey(apiKey);
    const apiKeyRecord = await userApiKeys.getByKeyHash(keyHash);
    
    if (!apiKeyRecord) {
      logger.warn('Invalid API key attempted', { keyHash });
      return {
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid API key',
          statusCode: 401
        }
      };
    }

    // Check if key is expired
    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
      return {
        success: false,
        error: {
          code: 'EXPIRED_API_KEY',
          message: 'API key has expired',
          statusCode: 401
        }
      };
    }

    // Update last used timestamp
    await userApiKeys.updateLastUsed(apiKeyRecord.id);

    // Get user details
    const user = await users.getById(apiKeyRecord.user_id);
    if (!user) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          statusCode: 404
        }
      };
    }

    const profile = await userProfiles.getByUserId(user.id).catch((error: unknown) => {
      logger.warn('MCP authentication could not read user wallet profile', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    });
    const walletBinding = readBitcodeWalletBindingFromProfile(
      profile as MCPWalletProfileSource | null,
    );

    // Build initial auth context
    const context: MCPAuthContext = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name || user.email,
      apiKeyId: apiKeyRecord.id,
      apiKeyName: apiKeyRecord.name,
      scopes: apiKeyRecord.scopes || [],
      // conservative defaults; will be updated below
      permissions: {
        pipelines: { create: false, read: true, cancel: false, retry: false },
        organization: { manageMembers: false, viewAnalytics: false, manageBtdHoldings: false },
        resources: { read: true, export: false }
      },
      btdBalance: 0,
      walletId: walletBinding?.address ?? undefined,
      btdReadAccess: [],
      interfaceAuthority: [],
      mcpCredentials: {}
    } as MCPAuthContext;

    // Check organization requirements
    if (options.requireOrganization || user.organization_id) {
      if (!user.organization_id) {
        return {
          success: false,
          error: {
            code: 'NO_ORGANIZATION',
            message: 'User must be part of an organization',
            statusCode: 403
          }
        };
      }

      const organization = await organizations.getById(user.organization_id);
      if (!organization) {
        return {
          success: false,
          error: {
            code: 'ORGANIZATION_NOT_FOUND',
            message: 'Organization not found',
            statusCode: 404
          }
        };
      }

      // Get member role
      const membership = await organizationMembers.getMembership(
        user.organization_id,
        user.id
      );

      if (!membership) {
        return {
          success: false,
          error: {
            code: 'NOT_ORGANIZATION_MEMBER',
            message: 'User is not a member of the organization',
            statusCode: 403
          }
        };
      }

      // Check minimum role requirement
      // Add organization info to context
      context.organizationId = organization.id;
      context.organizationName = organization.name;
      context.organizationSlug = organization.slug ?? undefined;
      context.organizationRole = (membership.role as MCPAuthContext['organizationRole']) || 'member';
      context.organizationPermissions = membership.permissions || {};
    }

    // Always read aggregate non-fungible BTD holding posture for context.
    context.btdBalance = await userBtdBalances.readBtdHoldingAmount(user.id);

    // Compute permissions from role/scopes/org permissions
    context.permissions = derivePermissions(context);
    authCache.set(apiKey, context);

    logger.info('MCP authentication successful', {
      userId: context.userId,
      organizationId: context.organizationId,
      apiKeyName: context.apiKeyName
    });

    return validateAuthenticatedContext(context, options);
  } catch (error) {
    logger.error('MCP authentication error', { error });
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed due to internal error',
        statusCode: 500
      }
    };
  }
}

async function validateAuthenticatedContext(
  context: MCPAuthContext,
  options: MCPAuthOptions = {}
): Promise<AuthResult> {
  if (options.requireOrganization && !context.organizationId) {
    return {
      success: false,
      error: {
        code: 'NO_ORGANIZATION',
        message: 'User must be part of an organization',
        statusCode: 403
      }
    };
  }

  if (options.minimumRole) {
    const roleHierarchy = ['viewer', 'member', 'admin', 'owner'];
    const userRoleIndex = roleHierarchy.indexOf(context.organizationRole || 'viewer');
    const requiredRoleIndex = roleHierarchy.indexOf(options.minimumRole);

    if (userRoleIndex < requiredRoleIndex) {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_ROLE',
          message: `Requires ${options.minimumRole} role or higher`,
          statusCode: 403
        }
      };
    }
  }

  if (options.minimumBtdHolding && options.minimumBtdHolding > 0) {
    return {
      success: false,
      error: {
        code: 'REGISTRY_READ_ACCESS_REQUIRED',
        message:
          'Aggregate BTD holding thresholds are not valid MCP admission gates. Require owner-read or licensed-read registry access instead.',
        statusCode: 403
      }
    };
  }

  const missingPermissions = getMissingPermissions(context, options.requiredPermissions);
  if (missingPermissions.length > 0) {
    return {
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Missing required permissions: ${missingPermissions.join(', ')}`,
        statusCode: 403
      }
    };
  }

  const readAccessResult = await validateRequiredReadAccess(context, options);
  if (!readAccessResult.success) {
    return readAccessResult;
  }

  const interfaceAuthorityResult = validateRequiredInterfaceAuthority(
    readAccessResult.context ?? context,
    options,
  );
  if (!interfaceAuthorityResult.success) {
    return interfaceAuthorityResult;
  }

  return {
    success: true,
    context: interfaceAuthorityResult.context ?? readAccessResult.context ?? context
  };
}

async function validateRequiredReadAccess(
  context: MCPAuthContext,
  options: MCPAuthOptions,
): Promise<AuthResult> {
  const requirements = normalizeReadAccessRequirements(options.requiredReadAccess);
  if (requirements.length === 0) {
    return { success: true, context };
  }

  const registry = new BtdRegistryModel(createClient());
  const decisions: NonNullable<MCPAuthContext['btdReadAccess']> = [];

  for (const requirement of requirements) {
    const walletId = requirement.walletId ?? context.walletId;
    if (!walletId) {
      return {
        success: false,
        error: {
          code: 'WALLET_BINDING_REQUIRED',
          message: 'Registry-derived read access requires a wallet binding.',
          statusCode: 403,
        },
      };
    }

    const range = await registry.getAssetPackRange(requirement.assetPackId);
    if (!range) {
      return {
        success: false,
        error: {
          code: 'ASSET_PACK_RANGE_NOT_FOUND',
          message: 'No registry AssetPack range exists for the requested read access check.',
          statusCode: 404,
        },
      };
    }

    const [ownershipRows, licenseRows] = await Promise.all([
      registry.listOwnershipClaims({ walletId, assetPackId: requirement.assetPackId }),
      registry.listReadLicenses({ walletId, assetPackId: requirement.assetPackId }),
    ]);
    const projection = buildBtdReadAccessProjectionFromRegistryRows({
      assetPackId: requirement.assetPackId,
      range,
      ownershipRows,
      licenseRows,
    });
    const decision = evaluateBtdReadAccess({
      walletId,
      assetPackId: requirement.assetPackId,
      accessPolicy: projection.accessPolicy,
      ownershipClaims: projection.ownershipClaims,
      licenses: projection.licenses,
      at: requirement.at,
    });
    const allowedDecisions = requirement.allowedDecisions ?? ['owner_read', 'licensed_read'];

    decisions.push({
      assetPackId: requirement.assetPackId,
      walletId,
      decision: decision.decision,
      reason: decision.reason,
      accessPolicyHash: decision.accessPolicyHash,
    });

    if (!allowedDecisions.includes(decision.decision as Exclude<BtdAccessDecisionKind, 'denied'>)) {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_BTD_READ_ACCESS',
          message: `Registry read access denied for AssetPack ${requirement.assetPackId}: ${decision.reason}.`,
          statusCode: 403,
        },
      };
    }
  }

  return {
    success: true,
    context: {
      ...context,
      btdReadAccess: [...(context.btdReadAccess ?? []), ...decisions],
    },
  };
}

function normalizeReadAccessRequirements(
  input: MCPAuthOptions['requiredReadAccess'],
): MCPReadAccessRequirement[] {
  if (!input) {
    return [];
  }

  return Array.isArray(input) ? input : [input];
}

function validateRequiredInterfaceAuthority(
  context: MCPAuthContext,
  options: MCPAuthOptions,
): AuthResult {
  const requirements = normalizeInterfaceAuthorityRequirements(options.requiredInterfaceAuthority);
  if (requirements.length === 0) {
    return { success: true, context };
  }

  if (!context.organizationId) {
    return {
      success: false,
      error: {
        code: 'ORGANIZATION_AUTHORITY_REQUIRED',
        message: 'MCP interface authority requires an organization-scoped actor.',
        statusCode: 403,
      },
    };
  }

  const authorityDecisions = [];
  for (const requirement of requirements) {
    const readAccess = firstAllowedReadAccess(context);
    const decision = evaluateBtdOrganizationInterfaceAuthority({
      actorId: context.userId,
      organizationId: context.organizationId,
      organizationRole: context.organizationRole,
      organizationPermissionGrants: flattenOrganizationPermissionGrants(context),
      interfaceSurface: 'mcp',
      action: requirement.action,
      walletId: context.walletId,
      readAccessDecision: readAccess
        ? {
            decision: readAccess.decision,
            accessPolicyHash: readAccess.accessPolicyHash,
            reason: readAccess.reason as any,
          }
        : null,
      settlementState: requirement.settlementState,
      confirmed: requirement.confirmed,
      repairApprovalState: requirement.repairApprovalState,
      targetAnchor: requirement.targetAnchor,
      at: requirement.at,
    });

    authorityDecisions.push({
      interfaceSurface: 'mcp' as const,
      action: requirement.action,
      decision: decision.decision,
      reason: decision.reason,
      authorityRoot: decision.proofRoots.authorityRoot,
      sourceVisibility: decision.sourceVisibility,
    });

    if (decision.decision !== 'allowed') {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_INTERFACE_AUTHORITY',
          message: `MCP interface authority denied ${requirement.action}: ${decision.reasons.join(', ')}.`,
          statusCode: 403,
        },
      };
    }
  }

  return {
    success: true,
    context: {
      ...context,
      interfaceAuthority: [...(context.interfaceAuthority ?? []), ...authorityDecisions],
    },
  };
}

function normalizeInterfaceAuthorityRequirements(
  input: MCPAuthOptions['requiredInterfaceAuthority'],
): MCPInterfaceAuthorityRequirement[] {
  if (!input) {
    return [];
  }

  return Array.isArray(input) ? input : [input];
}

function firstAllowedReadAccess(context: MCPAuthContext) {
  return context.btdReadAccess?.find(
    (decision) => decision.decision === 'owner_read' || decision.decision === 'licensed_read',
  ) ?? null;
}

function flattenOrganizationPermissionGrants(context: MCPAuthContext): string[] {
  const grants = [...(context.scopes ?? [])];
  const organizationPermissions = context.organizationPermissions ?? {};
  for (const [resource, permissions] of Object.entries(organizationPermissions)) {
    if (!Array.isArray(permissions)) continue;
    for (const permission of permissions) {
      if (typeof permission === 'string' && permission.trim()) {
        grants.push(`${resource}:${permission.trim()}`);
      }
    }
  }
  return Array.from(new Set(grants));
}

function getMissingPermissions(
  context: MCPAuthContext,
  requiredPermissions: MCPAuthOptions['requiredPermissions'] = {}
): string[] {
  const missingPermissions: string[] = [];

  if (requiredPermissions.pipelines) {
    for (const permission of requiredPermissions.pipelines) {
      if (!context.permissions.pipelines[permission]) {
        missingPermissions.push(`pipelines.${permission}`);
      }
    }
  }

  if (requiredPermissions.organization) {
    for (const permission of requiredPermissions.organization) {
      if (!context.permissions.organization[permission]) {
        missingPermissions.push(`organization.${permission}`);
      }
    }
  }

  if (requiredPermissions.resources) {
    for (const permission of requiredPermissions.resources) {
      if (!context.permissions.resources[permission]) {
        missingPermissions.push(`resources.${permission}`);
      }
    }
  }

  return missingPermissions;
}

export function validatePermissions(
  context: Pick<MCPAuthContext, 'permissions'>,
  requiredPermissions: MCPAuthOptions['requiredPermissions'] = {}
): boolean {
  return getMissingPermissions(context as MCPAuthContext, requiredPermissions).length === 0;
}

/**
 * Check if user has a specific permission
 */
function hasPermission(
  context: MCPAuthContext,
  resource: string,
  action: string
): boolean {
  // Admin and owner roles have all permissions
  if (context.organizationRole === 'admin' || context.organizationRole === 'owner') {
    return true;
  }

  // Check API key scopes
  const scopeKey = `${resource}:${action}`;
  if (context.scopes?.includes(scopeKey) || context.scopes?.includes('*')) {
    return true;
  }

  // Check organization-specific permissions
  const orgPerms = context.organizationPermissions || {};
  const resourcePerms = orgPerms[resource];
  if (Array.isArray(resourcePerms) && resourcePerms.includes(action)) {
    return true;
  }

  // Default deny
  return false;
}

/**
 * Derive the MCP permissions structure from role/scopes/organizationPermissions
 */
function derivePermissions(context: MCPAuthContext): MCPAuthContext['permissions'] {
  const isAdmin = context.organizationRole === 'admin' || context.organizationRole === 'owner';
  const scopes = context.scopes || [];
  const orgPerms = (context.organizationPermissions || {}) as Record<string, string[]>;

  const has = (res: string, act: string) => {
    if (isAdmin) return true;
    if (scopes.includes('*') || scopes.includes(`${res}:${act}`)) return true;
    const arr = orgPerms[res];
    return Array.isArray(arr) && arr.includes(act);
  };

  return {
    pipelines: {
      create: has('pipelines', 'create'),
      read: has('pipelines', 'read') || true,
      cancel: has('pipelines', 'cancel'),
      retry: has('pipelines', 'retry')
    },
    organization: {
      manageMembers: has('organization', 'manageMembers'),
      viewAnalytics: has('organization', 'viewAnalytics'),
      manageBtdHoldings: has('organization', 'manageBtdHoldings')
    },
    resources: {
      read: has('resources', 'read') || true,
      export: has('resources', 'export')
    }
  };
}

/**
 * Middleware factory for Express/Koa style frameworks
 */
export function createMCPAuthMiddleware(options: MCPAuthOptions = {}) {
  return async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const result = await authenticateMCPRequest(authHeader, options);

    if (!result.success) {
      return res.status(result.error!.statusCode).json({
        error: result.error
      });
    }

    // Attach auth context to request
    req.mcpAuth = result.context;
    next();
  };
}
