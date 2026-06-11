import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const sql = neon(process.env.DATABASE_URL);

await sql.query(`
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
`);

await sql.query(`
  ALTER TABLE "test_cases"
  ADD COLUMN IF NOT EXISTS "screenshot_data" text,
  ADD COLUMN IF NOT EXISTS "video_data" text,
  ADD COLUMN IF NOT EXISTS "trace_data" text,
  ADD COLUMN IF NOT EXISTS "artifact_metadata" jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS "started_at" timestamp,
  ADD COLUMN IF NOT EXISTS "completed_at" timestamp,
  ADD COLUMN IF NOT EXISTS "duration_ms" integer;
`);

const columns = await sql.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'test_cases'
    AND column_name IN (
      'browserless_script',
      'screenshot_data',
      'video_data',
      'trace_data',
      'artifact_metadata',
      'started_at',
      'completed_at',
      'duration_ms'
    )
  ORDER BY column_name;
`);

console.log(
  `Browserless database migration verified: ${columns
    .map((column) => column.column_name)
    .join(", ")}`
);
