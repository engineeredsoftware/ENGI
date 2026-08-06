-- Depository search: commercial NL primary surface + absolute measurement fixtures.
-- Source-safe only. Vectors remain Postgres pgvector (user-facing latency);
-- Supabase Storage Vector Buckets are a later scale path, not product MVP.

ALTER TABLE public.depository_search_documents
  ADD COLUMN IF NOT EXISTS commercial_title text,
  ADD COLUMN IF NOT EXISTS commercial_description text,
  ADD COLUMN IF NOT EXISTS absolute_fixtures jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.depository_search_documents.commercial_title IS
  'Buyer-facing commercialTitle (source-safe). Primary semantic/lexical NL title.';
COMMENT ON COLUMN public.depository_search_documents.commercial_description IS
  'Buyer-facing commercialDescription (source-safe). Primary semantic/lexical NL body.';
COMMENT ON COLUMN public.depository_search_documents.absolute_fixtures IS
  'Sparse absolute measurement fixtures: kind, label, descriptor, volume, status (source-safe).';

-- Optional ops index for commercial title lookups (not FTS — P2).
CREATE INDEX IF NOT EXISTS idx_depository_search_documents_commercial_title
  ON public.depository_search_documents (commercial_title)
  WHERE commercial_title IS NOT NULL;
