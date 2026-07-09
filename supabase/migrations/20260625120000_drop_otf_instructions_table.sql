-- V48 Gate 3: drop the OTF (on-the-fly instructions) table.
--
-- The OTF feature was removed entirely in V48 Gate 3 — the instruction API
-- route, the AssetPackRunInstructions ORM model, the ExecutionsInstructions
-- submit UI, and the waitForInstruction Validation-phase pause are all gone.
-- This drops the now-orphaned physical table so the generated DB types and the
-- data-health table inventory regenerate clean.
--
-- The live table is "deliverable_pipeline_otf_instructions" (the legacy
-- "run_otf_instructions" was renamed into it in the 20250903 archive; only a
-- leftover "run_otf_instructions_pkey" constraint name still referenced the old
-- spelling). DROP ... CASCADE removes its RLS policies, indexes, and the
-- foreign-key constraint to deliverable_pipeline_runs.
--
-- IF EXISTS + CASCADE keep this idempotent and safe across environments where
-- the table may already be absent.

DROP TABLE IF EXISTS "public"."deliverable_pipeline_otf_instructions" CASCADE;

-- Defensive: drop the pre-rename name too, in case any environment still has it.
DROP TABLE IF EXISTS "public"."run_otf_instructions" CASCADE;
