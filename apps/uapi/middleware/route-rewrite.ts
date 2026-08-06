/**
 * ROUTE REWRITE MIDDLEWARE
 *
 * Handles retained clean URL rewrites.
 * Centralizes all routing logic in one place.
 */

import { NextResponse } from 'next/server';
import type { MiddlewareContext, MiddlewareHandler } from './index';

interface RouteRule {
  pattern: RegExp;
  rewrite: (match: RegExpMatchArray) => string;
  permanent?: boolean;
}

// Centralized routing rules
const ROUTE_RULES: RouteRule[] = [
  // Retained /runs/:id shortcut -> unified execution view
  {
    pattern: /^\/runs\/([^/]+)$/,
    rewrite: (match) => `/executions/${match[1]}`
  },
  // Retained conversation message shortcut
  {
    pattern: /^\/conversations\/([^/]+)\/messages$/,
    rewrite: (match) => `/api/conversations/${match[1]}/stream`
  }
];

/**
 * Route rewrite middleware handler
 */
export const routeRewriteMiddleware: MiddlewareHandler = async (context) => {
  const { request } = context;
  const pathname = request.nextUrl.pathname;

  // Check each rule
  for (const rule of ROUTE_RULES) {
    const match = pathname.match(rule.pattern);
    if (match) {
      const newPath = rule.rewrite(match);
      const url = new URL(newPath, request.url);

      // Preserve query params
      request.nextUrl.searchParams.forEach((value, key) => {
        if (!url.searchParams.has(key)) {
          url.searchParams.set(key, value);
        }
      });

      if (rule.permanent) {
        return NextResponse.redirect(url, 301);
      } else {
        return NextResponse.rewrite(url);
      }
    }
  }

  return context;
};
