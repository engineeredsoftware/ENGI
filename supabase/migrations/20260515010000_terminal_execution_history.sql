-- product execution history persistence for live Deposit/Read/Fit QA.
-- The API route reads and writes these rows through the service role, while
-- authenticated owner policies keep the tables safe for future direct reads.

CREATE TABLE IF NOT EXISTS "public"."executions" (
  "id" uuid PRIMARY KEY DEFAULT "gen_random_uuid"(),
  "user_id" uuid NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "type" text,
  "status" text DEFAULT 'pending',
  "input" jsonb,
  "output" jsonb,
  "context" jsonb,
  "items" jsonb DEFAULT '[]'::jsonb,
  "config" jsonb,
  "error" jsonb,
  "total_tokens" integer,
  "total_cost" numeric,
  "duration_ms" integer,
  "deliverable_id" uuid,
  "pipeline_run_id" uuid,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT "now"(),
  "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."execution_events" (
  "id" uuid PRIMARY KEY DEFAULT "gen_random_uuid"(),
  "run_id" uuid NOT NULL REFERENCES "public"."executions"("id") ON DELETE CASCADE,
  "event_type" text NOT NULL,
  "event_data" jsonb,
  "agent_name" text,
  "phase" text,
  "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE INDEX IF NOT EXISTS "idx_executions_user_created_at"
  ON "public"."executions" ("user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_executions_user_type_created_at"
  ON "public"."executions" ("user_id", "type", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_execution_events_run_created_at"
  ON "public"."execution_events" ("run_id", "created_at");

CREATE OR REPLACE TRIGGER "update_executions_updated_at"
  BEFORE UPDATE ON "public"."executions"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."update_updated_at"();

ALTER TABLE "public"."executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."execution_events" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'executions'
      AND policyname = 'executions_service_role_all'
  ) THEN
    CREATE POLICY "executions_service_role_all"
      ON "public"."executions"
      FOR ALL
      TO "service_role"
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'executions'
      AND policyname = 'executions_owner_select'
  ) THEN
    CREATE POLICY "executions_owner_select"
      ON "public"."executions"
      FOR SELECT
      TO "authenticated"
      USING ("auth"."uid"() = "user_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'executions'
      AND policyname = 'executions_owner_insert'
  ) THEN
    CREATE POLICY "executions_owner_insert"
      ON "public"."executions"
      FOR INSERT
      TO "authenticated"
      WITH CHECK ("auth"."uid"() = "user_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'executions'
      AND policyname = 'executions_owner_update'
  ) THEN
    CREATE POLICY "executions_owner_update"
      ON "public"."executions"
      FOR UPDATE
      TO "authenticated"
      USING ("auth"."uid"() = "user_id")
      WITH CHECK ("auth"."uid"() = "user_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'execution_events'
      AND policyname = 'execution_events_service_role_all'
  ) THEN
    CREATE POLICY "execution_events_service_role_all"
      ON "public"."execution_events"
      FOR ALL
      TO "service_role"
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'execution_events'
      AND policyname = 'execution_events_owner_select'
  ) THEN
    CREATE POLICY "execution_events_owner_select"
      ON "public"."execution_events"
      FOR SELECT
      TO "authenticated"
      USING (
        EXISTS (
          SELECT 1
          FROM "public"."executions"
          WHERE "executions"."id" = "execution_events"."run_id"
            AND "executions"."user_id" = "auth"."uid"()
        )
      );
  END IF;
END;
$$;

GRANT SELECT, INSERT, UPDATE ON TABLE "public"."executions" TO "authenticated";
GRANT ALL ON TABLE "public"."executions" TO "service_role";
GRANT SELECT ON TABLE "public"."execution_events" TO "authenticated";
GRANT ALL ON TABLE "public"."execution_events" TO "service_role";
