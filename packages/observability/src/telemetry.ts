import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Minimal Supabase admin client & telemetry helpers for the `uapi` project
// ---------------------------------------------------------------------------
//
// Only a subset of the full telemetry API that exists in the `admin` package
// is required here.  At the time of writing `apps/uapi/app/api/feedback/route.ts`
// only imports `logFeedback`, so we implement that helper and nothing more in
// order to keep the duplication contained and dependencies light.
//
// A dedicated client with a service-role key is used so the insert bypasses
// any row-level security policies that might prevent regular users from
// writing to the `feedback` table.
// ---------------------------------------------------------------------------

// Helper to strip out any accidental non-ASCII characters that could sneak
// into environment variables when they are copied from e.g. the Supabase UI.
function sanitizeKey(key: string | undefined): string {
  return (key ?? '').replace(/[\u0080-\uFFFF]/g, '')
}

// Base URL for the Supabase instance – fall back to a dummy local value so
// builds/test suites don’t fail hard when the variable is missing.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'http://localhost:54321'

// Service-role key (never exposed to the client). Multiple variable names are
// checked to support different deployment setups. A local dummy key keeps CI
// builds happy when the real secret isn’t available.
const SUPABASE_SERVICE_ROLE_KEY = sanitizeKey(
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ADMIN_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  'local-service-role-key'
)

// A singleton Supabase client with elevated privileges.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const FEEDBACK_ASSET_PACK_EVIDENCE_STORAGE_COLUMN = 'deliverable_id'

/**
 * Record thumbs-up / thumbs-down feedback for AssetPack evidence. Errors are logged
 * to the console but never propagated to the caller – the calling API route
 * treats telemetry as a best-effort, fire-and-forget operation so that user
 * requests are not blocked by analytics.
 */
export async function logFeedback(params: {
  assetPackEvidenceId: string
  userId: string
  rating: -1 | 1
  comment?: string
}) {
  try {
    const { error } = await supabaseAdmin.from('feedback').insert({
      [FEEDBACK_ASSET_PACK_EVIDENCE_STORAGE_COLUMN]: params.assetPackEvidenceId,
      user_id: params.userId,
      rating: params.rating,
      comment: params.comment ?? null,
    })

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[telemetry] logFeedback failed', error)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[telemetry] logFeedback exception', err)
  }
}
