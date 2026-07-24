-- Depository hybrid search: absolute facet filters on vector match.
-- absolute_kinds (GIN) already indexed; expand product RPC so read Need-fit /
-- deposit relevants can gate vector recall by measured material properties.
--
-- Single function signature with optional defaults — callers may still pass only
-- (query_embedding, match_threshold, match_count).

DROP FUNCTION IF EXISTS public.match_depository_asset_pack_vectors(
  public.vector,
  double precision,
  integer
);

CREATE OR REPLACE FUNCTION public.match_depository_asset_pack_vectors(
  query_embedding public.vector(384),
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 12,
  filter_absolute_kinds text[] DEFAULT NULL,
  filter_lifecycle text DEFAULT NULL,
  filter_kind text DEFAULT NULL
)
RETURNS TABLE (
  asset_id uuid,
  title text,
  summary text,
  kind text,
  repository_full_name text,
  absolute_kinds text[],
  absolute_volumes jsonb,
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
    d.absolute_kinds,
    d.absolute_volumes,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM public.depository_search_vectors v
  INNER JOIN public.depository_search_documents d ON d.asset_id = v.asset_id
  WHERE v.embedding IS NOT NULL
    AND v.embedding_state = 'ready'
    AND 1 - (v.embedding <=> query_embedding) > match_threshold
    AND (
      filter_absolute_kinds IS NULL
      OR cardinality(filter_absolute_kinds) = 0
      OR d.absolute_kinds && filter_absolute_kinds
    )
    AND (
      filter_lifecycle IS NULL
      OR btrim(filter_lifecycle) = ''
      OR d.lifecycle = filter_lifecycle
    )
    AND (
      filter_kind IS NULL
      OR btrim(filter_kind) = ''
      OR d.kind = filter_kind
    )
  ORDER BY v.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 40));
$$;

GRANT EXECUTE ON FUNCTION public.match_depository_asset_pack_vectors(
  public.vector,
  double precision,
  integer,
  text[],
  text,
  text
) TO authenticated, anon, service_role;
