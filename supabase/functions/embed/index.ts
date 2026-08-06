/**
 * Supabase Edge Function: open-source text embeddings (gte-small / 384d).
 *
 * Product law: depository index + search embed generation — no OpenAI API.
 * Uses Supabase Edge Runtime built-in AI inference (Supabase.ai.Session).
 *
 * Deploy: `supabase functions deploy embed`
 * Invoke: POST /functions/v1/embed  { "input": "..." }  Authorization: Bearer …
 *
 * Docs: https://supabase.com/docs/guides/ai/quickstarts/generate-text-embeddings
 */

// @ts-expect-error Deno Edge runtime types (Supabase deploy environment)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const MODEL = 'gte-small';
const DIMENSIONS = 384;
const MAX_INPUT_CHARS = 8000;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST required' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const raw =
      typeof body?.input === 'string'
        ? body.input
        : typeof body?.text === 'string'
          ? body.text
          : '';
    const input = String(raw || '').trim().slice(0, MAX_INPUT_CHARS);
    if (!input) {
      return new Response(JSON.stringify({ error: 'input string required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Supabase Edge AI — open-source gte-small (no external OpenAI key).
    // @ts-expect-error Supabase.ai is provided by Edge Runtime
    const session = new Supabase.ai.Session(MODEL);
    const output = await session.run(input, {
      mean_pool: true,
      normalize: true,
    });

    let embedding: number[] | null = null;
    if (Array.isArray(output)) {
      embedding = output.map((n: unknown) => Number(n));
    } else if (output && typeof output === 'object' && Array.isArray((output as { data?: unknown }).data)) {
      embedding = (output as { data: unknown[] }).data.map((n) => Number(n));
    } else if (output && typeof output === 'object' && ArrayBuffer.isView((output as { data?: unknown }).data)) {
      embedding = Array.from((output as { data: ArrayLike<number> }).data as ArrayLike<number>).map(
        Number,
      );
    }

    if (!embedding || embedding.length !== DIMENSIONS || !embedding.every(Number.isFinite)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid embedding output',
          expectedDimensions: DIMENSIONS,
          got: embedding?.length ?? null,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        embedding,
        model: MODEL,
        dimensions: DIMENSIONS,
        provider: 'supabase-gte-small',
        store: 'supabase-pgvector',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
