-- Depository AssetPack search index (static fields + vector embeddings).
-- Product identity is AssetPack / admission execution id (not Exchange deliverable_id).
-- Source-safe metadata only — never raw source bodies.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.depository_search_documents (
  asset_id uuid PRIMARY KEY,
  lifecycle text,
  kind text,
  repository_full_name text,
  title text,
  summary text,
  topics text[] NOT NULL DEFAULT '{}',
  absolute_kinds text[] NOT NULL DEFAULT '{}',
  absolute_volumes jsonb NOT NULL DEFAULT '{}'::jsonb,
  neediness_kinds text[] NOT NULL DEFAULT '{}',
  source_path_tokens text[] NOT NULL DEFAULT '{}',
  embed_text text NOT NULL DEFAULT '',
  embed_text_root text,
  embedding_state text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_depository_search_documents_kind
  ON public.depository_search_documents (kind);
CREATE INDEX IF NOT EXISTS idx_depository_search_documents_repo
  ON public.depository_search_documents (repository_full_name);
CREATE INDEX IF NOT EXISTS idx_depository_search_documents_lifecycle
  ON public.depository_search_documents (lifecycle);
CREATE INDEX IF NOT EXISTS idx_depository_search_documents_topics
  ON public.depository_search_documents USING gin (topics);
CREATE INDEX IF NOT EXISTS idx_depository_search_documents_absolute_kinds
  ON public.depository_search_documents USING gin (absolute_kinds);

CREATE TABLE IF NOT EXISTS public.depository_search_vectors (
  asset_id uuid PRIMARY KEY
    REFERENCES public.depository_search_documents (asset_id) ON DELETE CASCADE,
  embedding public.vector(1536),
  model text NOT NULL DEFAULT 'text-embedding-3-small',
  dimensions int NOT NULL DEFAULT 1536,
  embedding_state text NOT NULL DEFAULT 'pending',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cosine distance via ivfflat (build after rows exist; lists=100 is a reasonable default).
CREATE INDEX IF NOT EXISTS idx_depository_search_vectors_embedding
  ON public.depository_search_vectors
  USING ivfflat (embedding public.vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION public.match_depository_asset_pack_vectors(
  query_embedding public.vector,
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
    AND 1 - (v.embedding <=> query_embedding) > match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 40));
$$;

ALTER TABLE public.depository_search_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depository_search_vectors ENABLE ROW LEVEL SECURITY;

-- Service role / backend writes; authenticated may read source-safe index for search.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'depository_search_documents'
      AND policyname = 'depository_search_documents_select_authenticated'
  ) THEN
    CREATE POLICY depository_search_documents_select_authenticated
      ON public.depository_search_documents
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'depository_search_vectors'
      AND policyname = 'depository_search_vectors_select_authenticated'
  ) THEN
    CREATE POLICY depository_search_vectors_select_authenticated
      ON public.depository_search_vectors
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

GRANT SELECT ON public.depository_search_documents TO authenticated, anon, service_role;
GRANT SELECT ON public.depository_search_vectors TO authenticated, anon, service_role;
GRANT ALL ON public.depository_search_documents TO service_role;
GRANT ALL ON public.depository_search_vectors TO service_role;
GRANT EXECUTE ON FUNCTION public.match_depository_asset_pack_vectors(public.vector, double precision, integer)
  TO authenticated, anon, service_role;
