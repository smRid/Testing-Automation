ALTER TABLE "test_cases"
RENAME COLUMN "browserbase_script" TO "browserless_script";

ALTER TABLE "test_cases"
ADD COLUMN "screenshot_data" text,
ADD COLUMN "video_data" text,
ADD COLUMN "trace_data" text,
ADD COLUMN "artifact_metadata" jsonb DEFAULT '{}'::jsonb,
ADD COLUMN "started_at" timestamp,
ADD COLUMN "completed_at" timestamp,
ADD COLUMN "duration_ms" integer;
