DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'test_cases'
      AND column_name = 'browserbase_script'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'test_cases'
      AND column_name = 'browserless_script'
  ) THEN
    ALTER TABLE "test_cases"
    RENAME COLUMN "browserbase_script" TO "browserless_script";
  END IF;
END
$$;

ALTER TABLE "test_cases"
ADD COLUMN IF NOT EXISTS "logs" jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS "session_id" varchar(255),
ADD COLUMN IF NOT EXISTS "session_url" varchar(500),
ADD COLUMN IF NOT EXISTS "screenshot_data" text,
ADD COLUMN IF NOT EXISTS "video_data" text,
ADD COLUMN IF NOT EXISTS "trace_data" text,
ADD COLUMN IF NOT EXISTS "artifact_metadata" jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS "started_at" timestamp,
ADD COLUMN IF NOT EXISTS "completed_at" timestamp,
ADD COLUMN IF NOT EXISTS "duration_ms" integer;
