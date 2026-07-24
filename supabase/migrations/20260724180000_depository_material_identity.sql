-- Buyer-visible DataPack material identity on depository search documents.
-- Compositions / inventories / tags / corpus tokens (source-safe jsonb).
ALTER TABLE public.depository_search_documents
  ADD COLUMN IF NOT EXISTS material_identity jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.depository_search_documents.material_identity IS
  'Source-safe material identity bag: compositions, inventories, tagSets, corpusTokens';
