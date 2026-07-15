/**
 * CORS MIDDLEWARE
 *
 * Handles Cross-Origin Resource Sharing configuration.
 * Supports dynamic origin validation and preflight requests.
 */

import { NextResponse } from 'next/server';
import type { MiddlewareContext, MiddlewareHandler } from './index';

// Allowed origins configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') ?? [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://app.bitcode.ai',
  'https://staging.bitcode.ai'
];

// CORS configuration
const CORS_CONFIG = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  headers: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'X-Organization-ID'
  ],
  maxAge: 86400 // 24 hours
};

/**
 * CORS middleware handler
 */
export const corsMiddleware: MiddlewareHandler = async (context) => {
  const { request } = context;
  const origin = request.headers.get('origin');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return handlePreflight(request, origin);
  }

  // Add CORS headers to context
  const corsHeaders = getCorsHeaders(origin);
  context.metadata.set('corsHeaders', corsHeaders);

  return context;
};

/**
 * Handle preflight OPTIONS requests
 */
function handlePreflight(request: NextRequest, origin: string | null): NextResponse {
  const headers = getCorsHeaders(origin);

  // Add preflight-specific headers
  const requestedMethod = request.headers.get('Access-Control-Request-Method');
  const requestedHeaders = request.headers.get('Access-Control-Request-Headers');

  if (requestedMethod && CORS_CONFIG.methods.includes(requestedMethod)) {
    headers.set('Access-Control-Allow-Methods', CORS_CONFIG.methods.join(', '));
  }

  if (requestedHeaders) {
    headers.set('Access-Control-Allow-Headers', requestedHeaders);
  }

  headers.set('Access-Control-Max-Age', String(CORS_CONFIG.maxAge));

  return new NextResponse(null, { status: 204, headers });
}

/**
 * Generate CORS headers based on origin
 */
function getCorsHeaders(origin: string | null): Headers {
  const headers = new Headers();

  if (origin && isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Vary', 'Origin');
  } else if (process.env.NODE_ENV === 'development') {
    // Allow all origins in development
    headers.set('Access-Control-Allow-Origin', origin ?? '*');
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return headers;
}

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin: string): boolean {
  // Check exact matches
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Check wildcard patterns
  for (const allowed of ALLOWED_ORIGINS) {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(origin)) {
        return true;
      }
    }
  }

  return false;
}
