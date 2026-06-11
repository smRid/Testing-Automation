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
