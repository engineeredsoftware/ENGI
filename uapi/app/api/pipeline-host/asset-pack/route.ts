import { NextRequest } from 'next/server';
import { createClient } from '@bitcode/supabase/ssr/server';
import { isProductionDeployment } from './preflight';
import {
  runAssetPackHostRoute,
  validateHostRequest,
  type AssetPackHostRequest,
} from './runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 800;

function emitSse(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: string,
  data: unknown,
): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(payload));
}

function requireHostApiAllowed(): Response | null {
  if (!isProductionDeployment() || process.env.BITCODE_ENABLE_PIPELINE_HOST_API === '1') {
    return null;
  }
  return Response.json({ error: 'pipeline_host_disabled' }, { status: 404 });
}

function parseBody(request: NextRequest): Promise<AssetPackHostRequest> {
  return request.json().catch(() => ({}));
}

export async function POST(request: NextRequest): Promise<Response> {
  const disabled = requireHostApiAllowed();
  if (disabled) return disabled;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await parseBody(request);
  const validationError = validateHostRequest(body);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      void runAssetPackHostRoute(
        body,
        data.user!.id,
        (event, payload) => emitSse(controller, event, payload),
      ).finally(() => controller.close());
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
