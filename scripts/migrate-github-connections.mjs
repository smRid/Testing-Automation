import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const sql = neon(process.env.DATABASE_URL);

await sql.query(`
  CREATE TABLE IF NOT EXISTS "github_connections" (
    "id" serial PRIMARY KEY NOT NULL,
    "clerk_user_id" varchar(255) NOT NULL,
    "github_user_id" varchar(255) NOT NULL,
    "github_login" varchar(255) NOT NULL,
    "github_avatar_url" text,
    "encrypted_access_token" text NOT NULL,
    "scopes" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "github_connections_clerk_user_id_unique" UNIQUE("clerk_user_id")
  );
`);

const [table] = await sql.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'github_connections';
`);

if (!table) {
  throw new Error("GitHub connections migration could not be verified");
}

console.log("GitHub connections database migration verified.");
