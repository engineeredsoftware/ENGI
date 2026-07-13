/**
 * HTTP response utilities for Bitcode API (moved from @bitcode/responses / networking).
 * Prefer: `import { … } from '@bitcode/api/responses'` or `@bitcode/responses` (BC).
 */

import { log } from '@bitcode/logger';

export function createErrorResponse(
  error: unknown,
  status: number = 500,
  message: string = 'An unexpected error occurred'
) {
  log('Error response created', 'error', {
    error: error instanceof Error ? error.message : String(error)
  });

  const statusCode = (error as any)?.response?.status || status;

  return new Response(
    JSON.stringify({
      error: message,
      details: error instanceof Error ? error.message : String(error)
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export function createAuthErrorResponse(message: string = 'Authentication required') {
  return createErrorResponse(new Error(message), 401, message);
}

export function createJsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function createSuccessResponse(data: any) {
  return createJsonResponse({ success: true, data });
}

export function createStreamResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
