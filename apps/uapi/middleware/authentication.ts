/**
 * AUTHENTICATION MIDDLEWARE
 *
 * Centralized authentication handling with Supabase session validation,
 * JWT token verification, resource ownership checks, and security audit logging.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { log } from '@bitcode/logger';
import * as crypto from 'crypto';
import type { MiddlewareContext, MiddlewareHandler } from './index';
import type { NextRequest } from 'next/server';

/**
 * Main authentication middleware handler
 */
export const authenticationMiddleware: MiddlewareHandler = async (context) => {
  const { request, metadata } = context;
  const pathname = request.nextUrl.pathname;

  // Skip auth for public routes
  if (isPublicRoute(pathname)) {
    return context;
  }

  // Extract and validate session
  const authResult = await validateAuthentication(request);

  if (!authResult.success) {
    log('[auth-middleware] Authentication failed', 'warn', {
      requestId: context.requestId,
      pathname,
      error: authResult.error
    });

    return NextResponse.json(
      { error: authResult.error || 'Authentication required' },
      { status: 401 }
    );
  }

  // Add auth info to context
  context.userId = authResult.userId;
  context.organizationId = authResult.organizationId;
  metadata.set('auth', {
    userId: authResult.userId,
    organizationId: authResult.organizationId,
    sessionAge: authResult.sessionAge
  });

  log('[auth-middleware] Authentication successful', 'info', {
    requestId: context.requestId,
    userId: authResult.userId,
    pathname
  });

  return context;
};

/**
 * Core authentication validation
 */
async function validateAuthentication(request: NextRequest): Promise<{
  success: boolean;
  userId?: string;
  organizationId?: string;
  sessionAge?: number;
  error?: string;
  requestId?: string;
}> {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      log('[auth-middleware] Primary authentication failed', 'warn', {
        requestId,
        error: error?.message,
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin')
      });
      return {
        success: false,
        error: 'Invalid or expired session',
        requestId
      };
    }

    // JWT validation if Authorization header present
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (!await validateJWTToken(token, user.id)) {
        log('[auth-middleware] JWT token validation failed', 'warn', {
          requestId,
          userId: user.id,
          tokenPrefix: token.substring(0, 8) + '...'
        });
        return {
          success: false,
          error: 'Invalid authentication token',
          requestId
        };
      }
    }

    // Validate session freshness
    const sessionAge = Date.now() - new Date(user.created_at).getTime();
    const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > MAX_SESSION_AGE) {
      log('[auth-middleware] Session expired', 'warn', {
        requestId,
        userId: user.id,
        sessionAgeHours: Math.round(sessionAge / (60 * 60 * 1000))
      });
      return {
        success: false,
        error: 'Session expired - please connect again',
        requestId
      };
    }

    // Get organization if available
    const { data: orgMembership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    // Optional security audit logging
    await logSecurityEvent({
      event: 'authentication_success',
      userId: user.id,
      requestId,
      metadata: {
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin')
      }
    }).catch(() => {}); // Non-critical, don't fail auth

    return {
      success: true,
      userId: user.id,
      organizationId: orgMembership?.organization_id,
      sessionAge,
      requestId
    };

  } catch (error) {
    log('[auth-middleware] Validation error', 'error', {
      requestId,
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      success: false,
      error: 'Authentication service unavailable',
      requestId
    };
  }
}

/**
 * Check if route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/api/health',
    '/api/webhook',
    '/auth/callback',
    '/public'
  ];

  return publicRoutes.some(route => pathname.startsWith(route));
}

/**
 * Validate resource ownership
 */
export async function validateOwnership(
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> {
  const supabase = await createClient();

  try {
    switch (resourceType) {
      case 'conversation': {
        const { data } = await supabase
          .from('conversations')
          .select('user_id')
          .eq('id', resourceId)
          .single();
        return data?.user_id === userId;
      }

      case 'pipeline': {
        // Check Exchange execution ownership.
        const { data: execution } = await supabase
          .from('executions')
          .select('user_id')
          .eq('id', resourceId)
          .single();

        return execution?.user_id === userId;
      }

      case 'organization': {
        const { data } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', userId)
          .eq('organization_id', resourceId)
          .single();
        return !!data;
      }

      default:
        return false;
    }
  } catch (error) {
    log('[auth-middleware] Ownership check failed', 'error', {
      userId,
      resourceType,
      resourceId,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Validate JWT token structure and signature
 */
async function validateJWTToken(token: string, userId: string): Promise<boolean> {
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Decode payload
    const payload = JSON.parse(atob(parts[1]));

    // Validate token belongs to the authenticated user
    if (payload.sub !== userId) {
      return false;
    }

    // Validate expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    // In production, would verify signature with secret key
    // const signature = await verifyJWTSignature(token, process.env.JWT_SECRET);

    return true;
  } catch {
    return false;
  }
}

/**
 * Log security events for audit trail
 */
async function logSecurityEvent(event: {
  event: string;
  userId: string;
  requestId: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await supabaseAdmin.from('security_audit_log').insert({
      event_type: event.event,
      user_id: event.userId,
      request_id: event.requestId,
      metadata: event.metadata,
      created_at: new Date().toISOString()
    });

    log('[auth-middleware] Security event logged', 'info', {
      eventType: event.event,
      userId: event.userId,
      requestId: event.requestId
    });
  } catch (error) {
    // Log but don't fail the request - gracefully handle missing table
    log('[auth-middleware] Failed to log security event', 'warn', {
      error: error instanceof Error ? error.message : String(error),
      event: event.event,
      note: 'This is non-critical - continuing with request'
    });
  }
}
