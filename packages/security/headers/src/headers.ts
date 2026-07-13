/**
 * Comprehensive security headers and CSRF protection
 * 
 * Implements production-grade security headers, CSRF protection,
 * and request security middleware for Next.js applications.
 */

import { NextRequest, NextResponse } from 'next/server';
import { log } from '@bitcode/logger';
import crypto from 'crypto';

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  readonly contentSecurityPolicy?: string | CSPDirectives;
  readonly hsts?: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  readonly frameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  readonly contentTypeOptions?: boolean;
  readonly referrerPolicy?: string;
  readonly permissionsPolicy?: string;
  readonly crossOriginEmbedderPolicy?: 'require-corp' | 'unsafe-none';
  readonly crossOriginOpenerPolicy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
  readonly crossOriginResourcePolicy?: 'same-site' | 'same-origin' | 'cross-origin';
  readonly reportTo?: string;
  readonly nel?: string;
}

/**
 * Content Security Policy directives
 */
export interface CSPDirectives {
  readonly defaultSrc?: string[];
  readonly scriptSrc?: string[];
  readonly styleSrc?: string[];
  readonly imgSrc?: string[];
  readonly fontSrc?: string[];
  readonly connectSrc?: string[];
  readonly frameSrc?: string[];
  readonly objectSrc?: string[];
  readonly mediaSrc?: string[];
  readonly workerSrc?: string[];
  readonly childSrc?: string[];
  readonly formAction?: string[];
  readonly frameAncestors?: string[];
  readonly baseUri?: string[];
  readonly manifestSrc?: string[];
  readonly reportUri?: string[];
  readonly reportTo?: string;
  readonly upgradeInsecureRequests?: boolean;
  readonly blockAllMixedContent?: boolean;
}

/**
 * CSRF protection configuration
 */
export interface CSRFConfig {
  readonly enabled: boolean;
  readonly secretKey: string;
  readonly tokenLength: number;
  readonly cookieName: string;
  readonly headerName: string;
  readonly sameSite?: 'strict' | 'lax' | 'none';
  readonly secure?: boolean;
  readonly httpOnly?: boolean;
  readonly maxAge?: number;
  readonly excludePaths?: string[];
  readonly excludeMethods?: string[];
}

/**
 * Default security headers configuration
 */
const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameOptions: 'DENY',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  crossOriginEmbedderPolicy: 'require-corp',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-site',
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'", 'https:'],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: true,
    blockAllMixedContent: true
  }
};

/**
 * Default CSRF configuration
 */
const DEFAULT_CSRF_CONFIG: CSRFConfig = {
  enabled: true,
  secretKey: process.env.CSRF_SECRET_KEY || crypto.randomBytes(32).toString('hex'),
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: false, // Must be false so client can read it
  maxAge: 60 * 60 * 1000, // 1 hour
  excludePaths: ['/api/health', '/api/status'],
  excludeMethods: ['GET', 'HEAD', 'OPTIONS']
};

/**
 * Security headers middleware
 */
export class SecurityHeadersMiddleware {
  private readonly config: SecurityHeadersConfig;

  constructor(customConfig?: Partial<SecurityHeadersConfig>) {
    this.config = { ...DEFAULT_SECURITY_HEADERS, ...customConfig };
  }

  /**
   * Apply security headers to response
   */
  applyHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    if (this.config.contentSecurityPolicy) {
      const csp = this.buildCSPHeader(this.config.contentSecurityPolicy);
      response.headers.set('Content-Security-Policy', csp);
    }

    // HTTP Strict Transport Security
    if (this.config.hsts) {
      const hsts = this.buildHSTSHeader(this.config.hsts);
      response.headers.set('Strict-Transport-Security', hsts);
    }

    // X-Frame-Options
    if (this.config.frameOptions) {
      response.headers.set('X-Frame-Options', this.config.frameOptions);
    }

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer-Policy
    if (this.config.referrerPolicy) {
      response.headers.set('Referrer-Policy', this.config.referrerPolicy);
    }

    // Permissions-Policy
    if (this.config.permissionsPolicy) {
      response.headers.set('Permissions-Policy', this.config.permissionsPolicy);
    }

    // Cross-Origin-Embedder-Policy
    if (this.config.crossOriginEmbedderPolicy) {
      response.headers.set('Cross-Origin-Embedder-Policy', this.config.crossOriginEmbedderPolicy);
    }

    // Cross-Origin-Opener-Policy
    if (this.config.crossOriginOpenerPolicy) {
      response.headers.set('Cross-Origin-Opener-Policy', this.config.crossOriginOpenerPolicy);
    }

    // Cross-Origin-Resource-Policy
    if (this.config.crossOriginResourcePolicy) {
      response.headers.set('Cross-Origin-Resource-Policy', this.config.crossOriginResourcePolicy);
    }

    // Remove potentially dangerous headers
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');

    // Add security-focused headers
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    return response;
  }

  /**
   * Build Content Security Policy header
   */
  private buildCSPHeader(csp: string | CSPDirectives): string {
    if (typeof csp === 'string') {
      return csp;
    }

    const directives: string[] = [];

    // Add each directive
    Object.entries(csp).forEach(([directive, value]) => {
      if (directive === 'upgradeInsecureRequests' && value) {
        directives.push('upgrade-insecure-requests');
      } else if (directive === 'blockAllMixedContent' && value) {
        directives.push('block-all-mixed-content');
      } else if (Array.isArray(value)) {
        const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
        directives.push(`${kebabDirective} ${value.join(' ')}`);
      } else if (typeof value === 'string') {
        const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
        directives.push(`${kebabDirective} ${value}`);
      }
    });

    return directives.join('; ');
  }

  /**
   * Build HSTS header
   */
  private buildHSTSHeader(hsts: { maxAge: number; includeSubDomains: boolean; preload: boolean }): string {
    let header = `max-age=${hsts.maxAge}`;
    
    if (hsts.includeSubDomains) {
      header += '; includeSubDomains';
    }
    
    if (hsts.preload) {
      header += '; preload';
    }
    
    return header;
  }
}

/**
 * CSRF protection middleware
 */
export class CSRFProtection {
  private readonly config: CSRFConfig;

  constructor(customConfig?: Partial<CSRFConfig>) {
    this.config = { ...DEFAULT_CSRF_CONFIG, ...customConfig };
    
    if (!this.config.secretKey) {
      throw new Error('CSRF secret key is required');
    }
  }

  /**
   * Generate CSRF token
   */
  generateToken(): string {
    const randomBytes = crypto.randomBytes(this.config.tokenLength);
    const timestamp = Date.now().toString();
    const data = randomBytes.toString('hex') + ':' + timestamp;
    
    const hmac = crypto.createHmac('sha256', this.config.secretKey);
    hmac.update(data);
    const signature = hmac.digest('hex');
    
    return Buffer.from(data + ':' + signature).toString('base64');
  }

  /**
   * Verify CSRF token
   */
  verifyToken(token: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const parts = decoded.split(':');
      
      if (parts.length !== 3) {
        return false;
      }
      
      const [randomPart, timestamp, signature] = parts;
      const data = randomPart + ':' + timestamp;
      
      // Verify signature
      const hmac = crypto.createHmac('sha256', this.config.secretKey);
      hmac.update(data);
      const expectedSignature = hmac.digest('hex');
      
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return false;
      }
      
      // Check token age
      const tokenTime = parseInt(timestamp, 10);
      const now = Date.now();
      const maxAge = this.config.maxAge || 60 * 60 * 1000; // 1 hour default
      
      if (now - tokenTime > maxAge) {
        return false;
      }
      
      return true;
    } catch (error) {
      log('CSRF token verification failed', 'warn', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * CSRF middleware for Next.js API routes
   */
  middleware() {
    return async (req: NextRequest): Promise<NextResponse | null> => {
      if (!this.config.enabled) {
        return null;
      }

      const method = req.method.toUpperCase();
      const pathname = new URL(req.url).pathname;

      // Skip excluded methods and paths
      if (this.config.excludeMethods?.includes(method) ||
          this.config.excludePaths?.some(path => pathname.startsWith(path))) {
        return null;
      }

      // For safe methods, set CSRF token cookie
      if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return this.handleSafeMethod(req);
      }

      // For unsafe methods, verify CSRF token
      return this.handleUnsafeMethod(req);
    };
  }

  /**
   * Handle safe HTTP methods (set token cookie)
   */
  private handleSafeMethod(req: NextRequest): NextResponse | null {
    const response = NextResponse.next();
    
    // Only set cookie if it doesn't exist or is invalid
    const existingToken = req.cookies.get(this.config.cookieName)?.value;
    
    if (!existingToken || !this.verifyToken(existingToken)) {
      const token = this.generateToken();
      
      response.cookies.set(this.config.cookieName, token, {
        httpOnly: this.config.httpOnly,
        secure: this.config.secure,
        sameSite: this.config.sameSite,
        maxAge: this.config.maxAge
      });
    }
    
    return response;
  }

  /**
   * Handle unsafe HTTP methods (verify token)
   */
  private handleUnsafeMethod(req: NextRequest): NextResponse | null {
    const cookieToken = req.cookies.get(this.config.cookieName)?.value;
    const headerToken = req.headers.get(this.config.headerName);
    
    // Check if token exists in both cookie and header
    if (!cookieToken || !headerToken) {
      log('CSRF token missing', 'warn', {
        method: req.method,
        pathname: new URL(req.url).pathname,
        hasCookie: !!cookieToken,
        hasHeader: !!headerToken
      });
      
      return new NextResponse(
        JSON.stringify({
          error: 'CSRF_TOKEN_MISSING',
          message: 'CSRF token required'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify both tokens match and are valid
    if (cookieToken !== headerToken || !this.verifyToken(cookieToken)) {
      log('CSRF token invalid', 'warn', {
        method: req.method,
        pathname: new URL(req.url).pathname,
        tokensMatch: cookieToken === headerToken
      });
      
      return new NextResponse(
        JSON.stringify({
          error: 'CSRF_TOKEN_INVALID',
          message: 'Invalid CSRF token'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return null; // Allow request to proceed
  }
}

/**
 * Complete security middleware combining headers and CSRF protection
 */
export class SecurityMiddleware {
  private readonly headersMiddleware: SecurityHeadersMiddleware;
  private readonly csrfProtection: CSRFProtection;

  constructor(
    headersConfig?: Partial<SecurityHeadersConfig>,
    csrfConfig?: Partial<CSRFConfig>
  ) {
    this.headersMiddleware = new SecurityHeadersMiddleware(headersConfig);
    this.csrfProtection = new CSRFProtection(csrfConfig);
  }

  /**
   * Apply all security measures
   */
  async apply(req: NextRequest): Promise<NextResponse> {
    // Apply CSRF protection first
    const csrfResponse = await this.csrfProtection.middleware()(req);
    
    if (csrfResponse) {
      // CSRF check failed, apply headers and return error
      return this.headersMiddleware.applyHeaders(csrfResponse);
    }

    // Continue with request and apply security headers
    const response = NextResponse.next();
    return this.headersMiddleware.applyHeaders(response);
  }

  /**
   * Get CSRF token for client-side use
   */
  getCSRFToken(): string {
    return this.csrfProtection.generateToken();
  }
}

/**
 * Utility functions for security headers
 */
export const SecurityUtils = {
  /**
   * Generate nonce for CSP
   */
  generateNonce: (): string => {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Build CSP for React/Next.js applications
   */
  buildReactCSP: (options: {
    allowInlineStyles?: boolean;
    allowEval?: boolean;
    cdnDomains?: string[];
    apiDomains?: string[];
    nonce?: string;
  } = {}): CSPDirectives => {
    const {
      allowInlineStyles = false,
      allowEval = false,
      cdnDomains = [],
      apiDomains = [],
      nonce
    } = options;

    const scriptSrc = ["'self'"];
    const styleSrc = ["'self'"];
    const connectSrc = ["'self'", ...apiDomains];

    if (nonce) {
      scriptSrc.push(`'nonce-${nonce}'`);
      styleSrc.push(`'nonce-${nonce}'`);
    }

    if (allowInlineStyles) {
      styleSrc.push("'unsafe-inline'");
    }

    if (allowEval) {
      scriptSrc.push("'unsafe-eval'");
    }

    return {
      defaultSrc: ["'self'"],
      scriptSrc,
      styleSrc,
      imgSrc: ["'self'", 'data:', 'https:', ...cdnDomains],
      fontSrc: ["'self'", 'https:', ...cdnDomains],
      connectSrc,
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: true
    };
  },

  /**
   * Validate CSP directive
   */
  validateCSP: (csp: string): boolean => {
    try {
      // Basic validation - check for common CSP directives
      const validDirectives = [
        'default-src', 'script-src', 'style-src', 'img-src', 'font-src',
        'connect-src', 'frame-src', 'object-src', 'base-uri', 'form-action',
        'frame-ancestors', 'manifest-src', 'media-src', 'worker-src'
      ];

      const directives = csp.split(';').map(d => d.trim());
      
      for (const directive of directives) {
        const [name] = directive.split(' ');
        if (!validDirectives.includes(name) && 
            !['upgrade-insecure-requests', 'block-all-mixed-content'].includes(name)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }
};

// Default instances for easy usage
export const securityHeaders = new SecurityHeadersMiddleware();
export const csrfProtection = new CSRFProtection();
export const securityMiddleware = new SecurityMiddleware();
