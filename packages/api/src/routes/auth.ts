/**
 * Auth API Route Handlers
 * 
 * Clean orchestration for authentication operations.
 * Integrates with NextAuth and various OAuth providers.
 * 
 * @doc-code
 * type: route-handlers
 * category: authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@bitcode/supabase/ssr/server';
import { traceRoute } from '@bitcode/observability';
import { log } from '@bitcode/logger';
import { createAdminClient } from '@bitcode/orm';
import { sendServerEvent } from '@bitcode/external-telemetry-google';
import { createJsonResponse, createErrorResponse } from '@bitcode/api/responses';
import { sendEmail } from '@bitcode/notifications';
import * as crypto from 'crypto';

const orm = createAdminClient();
const userConnections = orm.userConnections;
const userProfiles = orm.userProfiles;

/**
 * POST /api/auth/unlink
 * Unlink a connected account
 */
export const unlinkAccount = traceRoute('/auth/unlink', async (request: NextRequest) => {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { provider } = await request.json();
    
    if (!provider) {
      return createJsonResponse({ error: 'Provider required' }, 400);
    }

    // Check if connection exists
    const connection = await userConnections.getByUserAndProvider(user.id, provider);
    
    if (!connection) {
      return createJsonResponse({ error: 'Connection not found' }, 404);
    }

    // Delete connection
    await userConnections.delete(connection.id);

    // Track unlink
    await sendServerEvent('account_unlinked', {
      user_id: user.id,
      provider,
      connection_id: connection.id
    });

    log('[auth/unlink] Account unlinked', 'info', { 
      requestId, 
      userId: user.id, 
      provider 
    });

    return createJsonResponse({ success: true });

  } catch (error) {
    log('[auth/unlink] Error', 'error', { requestId, error });
    return createErrorResponse(error);
  }
});

/**
 * GET /api/auth/github/callback
 * GitHub OAuth callback handler
 */
export const githubCallback = traceRoute('/auth/github/callback', async (request: NextRequest) => {
  const requestId = crypto.randomUUID();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const installationId = searchParams.get('installation_id');

  try {
    if (!code) {
      return createJsonResponse({ error: 'Missing authorization code' }, 400);
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to exchange code');
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const githubUser = await userResponse.json();

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      // For new users, create account via Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: githubUser.email,
        password: crypto.randomBytes(32).toString('hex'), // Random password
        options: {
          data: {
            full_name: githubUser.name,
            avatar_url: githubUser.avatar_url,
            provider: 'github'
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // Create profile
      await userProfiles.upsert({
        user_id: authData.user!.id,
        username: githubUser.login,
        display_name: githubUser.name,
        avatar_url: githubUser.avatar_url
      });
    }

    const userId = user?.id || (await supabase.auth.getUser()).data.user!.id;

    // Store connection
    await userConnections.upsert({
      user_id: userId,
      provider: 'github',
      connection_data: {
        provider_user_id: githubUser.id.toString(),
        provider_username: githubUser.login,
        connectionId: installationId || githubUser.id,
        access_token: tokenData.access_token,
        login: githubUser.login,
        type: githubUser.type,
        email: githubUser.email,
        avatar_url: githubUser.avatar_url
      }
    });

    // Track connection
    await sendServerEvent('github_connected', {
      user_id: userId,
      github_user_id: githubUser.id,
      has_installation: !!installationId
    });

    // Send welcome email for new users
    if (!user && githubUser.email) {
      await sendEmail({
        to: githubUser.email,
        subject: 'Welcome to Bitcode',
        template: 'welcome',
        vars: {
          name: githubUser.name || githubUser.login,
          platform: 'GitHub'
        }
      });
    }

    log('[auth/github] Connection successful', 'info', { 
      requestId, 
      userId, 
      githubUserId: githubUser.id 
    });

    // Redirect to success page
    const redirectUrl = new URL('/auth/success', request.url);
    redirectUrl.searchParams.set('provider', 'github');
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    log('[auth/github] Error', 'error', { requestId, error });
    
    const redirectUrl = new URL('/auth/error', request.url);
    redirectUrl.searchParams.set('provider', 'github');
    redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.redirect(redirectUrl);
  }
});

/**
 * GET /api/auth/metamask/callback
 * MetaMask authentication callback
 */
export const metamaskCallback = traceRoute('/auth/metamask/callback', async (request: NextRequest) => {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const signature = searchParams.get('signature');
    const message = searchParams.get('message');

    if (!address || !signature || !message) {
      return createJsonResponse({ error: 'Missing required parameters' }, 400);
    }

    // Signature verification remains staged until an admitted Ethereum recovery
    // primitive lands on the active Bitcode path.
    
    // Get or create user
    const supabase = await createClient();
    let userId: string;

    // Check if wallet already connected
    const existingConnection = await userConnections.getByProviderUserId('metamask', address);
    
    if (existingConnection) {
      userId = existingConnection.user_id;
    } else {
      // Create new user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: `${address}@metamask.local`,
        password: crypto.randomBytes(32).toString('hex'),
        options: {
          data: {
            wallet_address: address,
            provider: 'metamask'
          }
        }
      });

      if (signUpError) throw signUpError;
      userId = authData.user!.id;

      // Create profile
      await userProfiles.upsert({
        user_id: userId,
        username: `metamask_${address.substring(0, 8)}`,
        display_name: `MetaMask User`,
        wallet_address: address,
        wallet_provider: 'metamask',
        wallet_binding_status: 'pending',
      });
    }

    if (existingConnection) {
      await userProfiles.upsert({
        user_id: userId,
        wallet_address: address,
        wallet_provider: 'metamask',
        wallet_binding_status: 'pending',
      });
    }

    // Store/update connection
    await userConnections.upsert({
      user_id: userId,
      provider: 'metamask',
      connection_data: {
        provider_user_id: address,
        provider_username: address,
        address,
        verification_state: 'pending',
        message,
        connected_at: new Date().toISOString()
      }
    });

    await sendServerEvent('metamask_connection_staged', {
      user_id: userId,
      wallet_address: address
    });

    log('[auth/metamask] Verification staged', 'info', { 
      requestId, 
      userId, 
      address 
    });

    return createJsonResponse({ 
      success: true,
      staged: true,
      verificationStatus: 'pending',
      userId
    });

  } catch (error) {
    log('[auth/metamask] Error', 'error', { requestId, error });
    return createErrorResponse(error);
  }
});

/**
 * GET /api/auth/chatgpt/callback
 * ChatGPT plugin authentication callback
 */
export const chatgptCallback = traceRoute('/auth/chatgpt/callback', async (request: NextRequest) => {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return createJsonResponse({ error: 'Missing authorization code' }, 400);
    }

    // Exchange code for token with OpenAI
    const tokenResponse = await fetch('https://auth.openai.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.CHATGPT_CLIENT_ID,
        client_secret: process.env.CHATGPT_CLIENT_SECRET,
        code,
        redirect_uri: process.env.CHATGPT_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to exchange code');
    }

    // Get user info from OpenAI
    const userResponse = await fetch('https://api.openai.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const openaiUser = await userResponse.json();

    // Create or update user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    let userId: string;
    
    if (user) {
      userId = user.id;
    } else {
      // Create new user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: openaiUser.email,
        password: crypto.randomBytes(32).toString('hex'),
        options: {
          data: {
            full_name: openaiUser.name,
            provider: 'chatgpt'
          }
        }
      });

      if (signUpError) throw signUpError;
      userId = authData.user!.id;

      // Create profile
      await userProfiles.upsert({
        user_id: userId,
        username: openaiUser.username || `chatgpt_${openaiUser.id}`,
        display_name: openaiUser.name
      });
    }

    // Store connection
    await userConnections.upsert({
      user_id: userId,
      provider: 'chatgpt',
      connection_data: {
        provider_user_id: openaiUser.id,
        provider_username: openaiUser.username || openaiUser.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        scope: tokenData.scope
      }
    });

    // Track connection
    await sendServerEvent('chatgpt_connected', {
      user_id: userId,
      openai_user_id: openaiUser.id
    });

    log('[auth/chatgpt] Connection successful', 'info', { 
      requestId, 
      userId, 
      openaiUserId: openaiUser.id 
    });

    // Return success response for ChatGPT plugin
    return createJsonResponse({ 
      success: true,
      message: 'Authentication successful. You can now use Bitcode through ChatGPT.'
    });

  } catch (error) {
    log('[auth/chatgpt] Error', 'error', { requestId, error });
    return createErrorResponse(error);
  }
});
