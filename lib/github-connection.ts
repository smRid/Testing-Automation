import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db, githubConnections } from "@/db";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const secret =
    process.env.GITHUB_TOKEN_ENCRYPTION_KEY?.trim() ||
    process.env.GITHUB_CLIENT_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "GITHUB_TOKEN_ENCRYPTION_KEY or GITHUB_CLIENT_SECRET must be configured"
    );
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptGitHubToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptGitHubToken(value: string) {
  const [ivValue, authTagValue, encryptedValue] = value.split(".");

  if (!ivValue || !authTagValue || !encryptedValue) {
    throw new Error("Stored GitHub token has an invalid format");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export async function getAuthenticatedClerkUserId() {
  const { userId } = await auth();
  return userId;
}

export async function getGitHubConnectionForUser(clerkUserId: string) {
  const [connection] = await db
    .select()
    .from(githubConnections)
    .where(eq(githubConnections.clerkUserId, clerkUserId));

  return connection;
}

export async function getAuthenticatedGitHubConnection() {
  const clerkUserId = await getAuthenticatedClerkUserId();
  if (!clerkUserId) {
    return null;
  }

  const connection = await getGitHubConnectionForUser(clerkUserId);
  if (!connection) {
    return null;
  }

  return {
    ...connection,
    accessToken: decryptGitHubToken(connection.encryptedAccessToken),
  };
}

export async function deleteGitHubConnection(clerkUserId: string) {
  await db
    .delete(githubConnections)
    .where(eq(githubConnections.clerkUserId, clerkUserId));
}
