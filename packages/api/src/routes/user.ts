/**
 * User API Route Handlers
 * 
 * Clean orchestration for user management operations.
 * All database operations use ORM models.
 * 
 * @doc-code
 * type: route-handlers
 * category: user-management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@bitcode/supabase/ssr/server';
import { traceRoute } from '@bitcode/observability';
import { hydrateBitcodeProfile } from '@bitcode/orm';
import { log } from '@bitcode/logger';
import { createAdminClient } from '@bitcode/orm';
import { sendServerEvent } from '@bitcode/external-telemetry-google';
import { createJsonResponse, createErrorResponse, createAuthErrorResponse } from '@bitcode/api/responses';
import * as crypto from 'crypto';

// Initialize ORM models (admin client for server routes)
const orm = createAdminClient();
const userProfiles = orm.userProfiles;
const userBtdBalances = orm.userBtdBalances;
const userBtdTransactions = orm.userBtdTransactions;
const modelPreferences = orm.userModelPreferences;
const apiKeys = new (require('@bitcode/orm').UserApiKeysModel as any)( (require('@bitcode/supabase').supabaseAdmin) );
const notifications = orm.notifications;

/**
 * GET /api/user/profile
 * Get authenticated user's profile
 */
export const getProfile = traceRoute('/user/profile', async (request: NextRequest) => {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      log('[user/profile] Authentication failed', 'warn', { requestId });
      return createAuthErrorResponse();
    }

    const profile = await userProfiles.getByUserId(user.id);
    return createJsonResponse(hydrateBitcodeProfile(profile as Record<string, unknown> | null) || {});

  } catch (error) {
    log('[user/profile] Error', 'error', { requestId, error });
    return createErrorResponse(error);
  }
});

/**
 * POST /api/user/profile
 * Update user profile
 */
export const updateProfile = traceRoute('/user/profile', async (request: NextRequest) => {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      log('[user/profile] Authentication failed', 'warn', { requestId });
      return createAuthErrorResponse();
    }

    const body = await request.json();
    const {
      username,
      displayName,
      bio,
      companyName,
      avatarUrl,
      teamMembers,
      isVerified,
      email,
      walletAddress,
      walletProvider,
      walletBindingStatus,
      walletBoundAt,
    } = body;

    // Validate required fields
    if (!username) {
      return createJsonResponse({ error: 'Username is required' }, 400);
    }

    // Upsert profile
    await userProfiles.upsert({
      user_id: user.id,
      username,
      display_name: displayName,
      bio,
      company_name: companyName,
      avatar_url: avatarUrl,
      team_members: teamMembers,
      email,
      isVerified,
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
      wallet_binding_status: walletBindingStatus,
      wallet_bound_at: walletBoundAt,
    });

    // Track update
    await sendServerEvent('user_profile_updated', {
      user_id: user.id,
      has_company: !!companyName,
      has_bio: !!bio,
      team_size: Array.isArray(teamMembers) ? teamMembers.length : 0,
      has_wallet_binding: Boolean(walletAddress),
    });

    return createJsonResponse({ success: true }, 201);

  } catch (error) {
    log('[user/profile] Update error', 'error', { requestId, error });
    return createErrorResponse(error);
  }
});

/**
 * GET /api/user/btd
 * Get user BTD balance and recent usage
 */
export const getBtdBalance = traceRoute('/user/btd', async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    // Get balance
    const balanceRecord = await userBtdBalances.getByUserId(user.id);
    const balance = balanceRecord?.balance || 0;

    // Get recent usage
    const usage = await userBtdTransactions.getRecentByUserId(user.id, 10);

    return createJsonResponse({
      balance,
      btdBalance: balance,
      recentUsage: usage
    });

  } catch (error) {
    log('[user/btd] Error', 'error', { error });
    return createErrorResponse(error);
  }
});

/**
 * POST /api/user/btd
 * Closed in V26: $BTD is a non-fungible asset-pack share/read-right, not an
 * admin-mutable spend bucket. Acquisition must flow through Read
 * minting or Exchange purchase surfaces.
 */
export const rejectBtdBalanceMutation = traceRoute('/user/btd', async (_request: NextRequest) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    // Check admin status
    const isAdmin = await userProfiles.isAdmin(user.id);
    if (!isAdmin) {
      return createJsonResponse({ error: 'Admin access required' }, 403);
    }

    await sendServerEvent('generic_btd_mutation_rejected', {
      admin_id: user.id,
      reason: 'btd_is_non_fungible_asset_pack_share_read_right',
    });

    return createJsonResponse({
      error:
        'Generic BTD balance mutation is closed. $BTD is a non-fungible asset-pack share/read-right; acquisition must flow through Read minting or Exchange purchase.',
      acquisitionPaths: {
        terminalReadMinting: '/reads?intent=submit-read-for-btd',
        exchangePurchase: '/exchange?intent=buy-existing-btd',
      },
    }, 410);

  } catch (error) {
    log('[user/btd] Add error', 'error', { error });
    return createErrorResponse(error);
  }
});

/**
 * GET /api/user/model-preferences
 * Get model preferences
 */
export const getModelPreferences = traceRoute('/user/model-preferences', async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    const prefs = await modelPreferences.getByUserId(user.id);
    return createJsonResponse(prefs?.preferences || {});

  } catch (error) {
    log('[user/model-preferences] Error', 'error', { error });
    return createErrorResponse(error);
  }
});

/**
 * POST /api/user/model-preferences
 * Update model preferences
 */
export const updateModelPreferences = traceRoute('/user/model-preferences', async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    const preferences = await request.json();

    await modelPreferences.upsert({
      user_id: user.id,
      preferences
    });

    // Track update
    await sendServerEvent('model_preferences_updated', {
      user_id: user.id,
      default_provider: preferences.defaultProvider,
      default_model: preferences.defaultModel
    });

    return createJsonResponse({ success: true });

  } catch (error) {
    log('[user/model-preferences] Update error', 'error', { error });
    return createErrorResponse(error);
  }
});

/**
 * GET /api/user/api-keys
 * List user's API keys
 */
export const getApiKeys = traceRoute('/user/api-keys', async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    const keys = await apiKeys.listByUserId(user.id);
    
    // Never return the actual key hash
    const safeKeys = keys.map(k => ({
      id: k.id,
      name: k.name,
      key_preview: k.key_preview,
      created_at: k.created_at,
      last_used_at: k.last_used_at,
      expires_at: k.expires_at
    }));

    return createJsonResponse(safeKeys);

  } catch (error) {
    log('[user/api-keys] Error', 'error', { error });
    return createErrorResponse(error);
  }
});

/**
 * POST /api/user/api-keys
 * Create new API key
 */
export const createApiKey = traceRoute('/user/api-keys', async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    const body = await request.json();
    const { name, expiresIn } = body;

    if (!name) {
      return createJsonResponse({ error: 'API key name is required' }, 400);
    }

    // Generate key
    const apiKey = `bitcode_${crypto.randomBytes(32).toString('hex')}`;
    const keyPreview = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;

    // Calculate expiration
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : undefined;

    // Store hashed key
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    const newKey = await apiKeys.create({
      user_id: user.id,
      name,
      key_hash: hashedKey,
      key_preview: keyPreview,
      expires_at: expiresAt
    });

    // Track creation
    await sendServerEvent('api_key_created', {
      user_id: user.id,
      key_id: newKey.id,
      has_expiration: !!expiresAt
    });

    return createJsonResponse({
      ...newKey,
      key: apiKey // Only return full key on creation
    }, 201);

  } catch (error) {
    log('[user/api-keys] Create error', 'error', { error });
    return createErrorResponse(error);
  }
});

/**
 * DELETE /api/user/api-keys/:keyId
 * Delete API key
 */
export const deleteApiKey = traceRoute('/user/api-keys', async (
  request: NextRequest,
  { params }: { params: { keyId: string } }
) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    await apiKeys.deleteByIdAndUser(params.keyId, user.id);
    return createJsonResponse({ success: true });

  } catch (error) {
    log('[user/api-keys] Delete error', 'error', { error });
    return createErrorResponse(error);
  }
});

/**
 * GET /api/user/notifications
 * Get user notifications
 */
export const getNotifications = traceRoute('/user/notifications', async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await notifications.listByUserId(user.id, {
      unreadOnly,
      limit,
      offset
    });

    return createJsonResponse({
      notifications: result.data,
      total: result.count
    });

  } catch (error) {
    log('[user/notifications] Error', 'error', { error });
    return createErrorResponse(error);
  }
});

/**
 * PATCH /api/user/notifications/:notificationId
 * Mark notification as read
 */
export const markNotificationRead = traceRoute('/user/notifications', async (
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    await notifications.markAsRead(params.notificationId, user.id);
    return createJsonResponse({ success: true });

  } catch (error) {
    log('[user/notifications] Mark read error', 'error', { error });
    return createErrorResponse(error);
  }
});

/**
 * GET /api/user/usage
 * Get usage statistics
 */
export const getUsage = traceRoute('/user/usage', async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse();
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Read historical aggregate posture without teaching BTD as spend.
    const btdUsage = await userBtdTransactions.getUsageStats(user.id, startDate);

    return createJsonResponse({
      period,
      measuredBtd: btdUsage.total,
      btdSemantics: 'non_fungible_asset_pack_share_read_right',
      dailyStats: btdUsage.daily
    });

  } catch (error) {
    log('[user/usage] Error', 'error', { error });
    return createErrorResponse(error);
  }
});
