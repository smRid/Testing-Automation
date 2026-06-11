import { integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: serial("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  credits:integer("credits").default(1000).notNull(),
});

export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  repoId: integer("repo_id").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  private: integer("private").notNull(),
  htmlUrl: text("html_url").notNull(),
  description: text("description"),
  owner: text("owner").notNull(),
  language: text("language"),
  defaultBranch: text("default_branch"),
  targetDomain: varchar("target_domain").default('http://localhost:3000/'),
  globalInstruction: text("global_instruction"),
})

export const TestCasesTable = pgTable("test_cases", {
  id: serial("id").primaryKey(),

  // User / project details
  userId: varchar("user_id", { length: 255 }).notNull(),
  repoId: varchar("repo_id", { length: 255 }),
  repoName: varchar("repo_name", { length: 255 }).notNull(),
  repoOwner: varchar("repo_owner", { length: 255 }).notNull(),
  branch: varchar("branch", { length: 100 }).default("main"),

  // Main test case data
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull(),

  // Important metadata for Browserless script generation and execution
  targetRoute: varchar("target_route", { length: 500 }),
  targetFiles: jsonb("target_files").$type<string[]>().default([]),
  expectedResult: text("expected_result"),

  browserlessScript: text("browserless_script"),
  status: varchar("status", { length: 100 }).default("generated"),

  createdAt: timestamp("created_at").defaultNow(),

  logs: jsonb("logs").$type<string[]>().default([]),
  sessionId: varchar("session_id", { length: 255 }),
  sessionUrl: varchar("session_url", { length: 500 }),
  screenshotData: text("screenshot_data"),
  videoData: text("video_data"),
  traceData: text("trace_data"),
  artifactMetadata: jsonb("artifact_metadata").$type<{
    screenshot?: { mimeType: string; size: number };
    video?: { mimeType: string; size: number };
    trace?: { mimeType: string; size: number };
  }>().default({}),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
