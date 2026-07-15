/**
 * SECURITY HEADERS MIDDLEWARE
 *
 * Implements comprehensive security headers following OWASP best practices.
 * Protects against XSS, clickjacking, MIME sniffing, and other attacks.
 */

import type { MiddlewareContext, MiddlewareHandler } from './index';

/**
 * Security headers middleware handler
 */
export const securityHeadersMiddleware: MiddlewareHandler = async (context) => {
  const { request } = context;
  const pathname = request.nextUrl.pathname;

  // Prepare security headers
  const headers = new Headers();

  // Content Security Policy - restrictive by default
  const csp = generateCSP(pathname);
  headers.set('Content-Security-Policy', csp);

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // XSS Protection for older browsers
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy - privacy focused
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - restrict browser features
  headers.set('Permissions-Policy', generatePermissionsPolicy());

  // HSTS - enforce HTTPS
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Cache control for sensitive endpoints
  if (isSensitiveEndpoint(pathname)) {
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  }

  // Add security headers to context
  context.metadata.set('securityHeaders', headers);

  return context;
};

/**
 * Generate Content Security Policy based on route
 */
function generateCSP(pathname: string): string {
  const isAPI = pathname.startsWith('/api');

  if (isAPI) {
    // Strict CSP for API routes
    return [
      "default-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "form-action 'none'"
    ].join('; ');
  }

  // Terminal CSP
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net", // Required for Next.js
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' wss: https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ];

  // Add WebSocket support for SSE/streaming
  if (pathname.includes('/stream') || pathname.includes('/sse')) {
    cspDirectives.push("connect-src 'self' wss: https: *.supabase.co");
  }

  return cspDirectives.join('; ');
}

/**
 * Generate Permissions Policy
 */
function generatePermissionsPolicy(): string {
  return [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
    'interest-cohort=()',
    'battery=()',
    'ambient-light-sensor=()',
    'autoplay=(self)'
  ].join(', ');
}

/**
 * Check if endpoint handles sensitive data
 */
function isSensitiveEndpoint(pathname: string): boolean {
  const sensitivePatterns = [
    '/api/auth',
    '/api/user',
    '/api/auxillaries/btd',
    '/api/organizations',
    '/api/pipelines',
    '/api/conversations'
  ];

  return sensitivePatterns.some(pattern => pathname.startsWith(pattern));
}
