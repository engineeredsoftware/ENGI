-- Depository vectors: open-source gte-small (384d) + Supabase pgvector.
-- Product law: store/query in Postgres only; embed with gte-small (not OpenAI).
-- Additive over 20260720120000_depository_search_index.sql (1536 OpenAI-era).

CREATE EXTENSION IF NOT EXISTS vector;

-- Recreate product vector column at 384 dimensions (wipe prior embeddings).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'depository_search_vectors'
  ) THEN
    DROP INDEX IF EXISTS public.idx_depository_search_vectors_embedding;
    ALTER TABLE public.depository_search_vectors
      DROP COLUMN IF EXISTS embedding;
    ALTER TABLE public.depository_search_vectors
      ADD COLUMN embedding public.vector(384);
    ALTER TABLE public.depository_search_vectors
      ALTER COLUMN model SET DEFAULT 'gte-small';
    ALTER TABLE public.depository_search_vectors
      ALTER COLUMN dimensions SET DEFAULT 384;
    UPDATE public.depository_search_vectors
      SET model = 'gte-small',
          dimensions = 384,
          embedding_state = 'pending',
          updated_at = now();
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'depository_search_documents'
  ) THEN
    UPDATE public.depository_search_documents
      SET embedding_state = 'pending',
          updated_at = now()
      WHERE embedding_state IN ('ready', 'failed');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_depository_search_vectors_embedding
  ON public.depository_search_vectors
  USING ivfflat (embedding public.vector_cosine_ops)
  WITH (lists = 100);

-- Cosine match against 384-d gte-small embeddings (structured metadata join).
CREATE OR REPLACE FUNCTION public.match_depository_asset_pack_vectors(
  query_embedding public.vector(384),
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 12
)
RETURNS TABLE (
  asset_id uuid,
  title text,
  summary text,
  kind text,
  repository_full_name text,
  similarity double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    d.asset_id,
    d.title,
    d.summary,
    d.kind,
    d.repository_full_name,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM public.depository_search_vectors v
  INNER JOIN public.depository_search_documents d ON d.asset_id = v.asset_id
  WHERE v.embedding IS NOT NULL
    AND v.embedding_state = 'ready'
    AND v.dimensions = 384
    AND 1 - (v.embedding <=> query_embedding) > match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 40));
$$;

GRANT EXECUTE ON FUNCTION public.match_depository_asset_pack_vectors(public.vector(384), double precision, integer)
  TO authenticated, anon, service_role;
