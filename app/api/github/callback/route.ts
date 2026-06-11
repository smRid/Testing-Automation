import { NextRequest, NextResponse } from "next/server";

import { db, githubConnections } from "@/db";
import {
  encryptGitHubToken,
  getAuthenticatedClerkUserId,
} from "@/lib/github-connection";

const OAUTH_STATE_COOKIE = "github_oauth_state";
const OAUTH_USER_COOKIE = "github_oauth_user";

function redirectToWorkspace(req: NextRequest, error: string) {
  const response = NextResponse.redirect(
    new URL(`/workspace?github_error=${encodeURIComponent(error)}`, req.url)
  );
  response.cookies.delete(OAUTH_STATE_COOKIE);
  response.cookies.delete(OAUTH_USER_COOKIE);
  response.cookies.delete("gh_token");
  return response;
}

export async function GET(req: NextRequest) {
  const clerkUserId = await getAuthenticatedClerkUserId();
  if (!clerkUserId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const oauthError = req.nextUrl.searchParams.get("error");
  if (oauthError) {
    return redirectToWorkspace(req, oauthError);
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const expectedClerkUserId = req.cookies.get(OAUTH_USER_COOKIE)?.value;

  if (!code) {
    return redirectToWorkspace(req, "missing_code");
  }

  if (!state || !expectedState || state !== expectedState) {
    return redirectToWorkspace(req, "invalid_state");
  }

  if (!expectedClerkUserId || expectedClerkUserId !== clerkUserId) {
    return redirectToWorkspace(req, "account_changed");
  }

  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GITHUB_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    return redirectToWorkspace(req, "oauth_not_configured");
  }

  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
      cache: "no-store",
    });

    const data: unknown = await res.json();
    const token =
      typeof data === "object" &&
      data !== null &&
      "access_token" in data &&
      typeof data.access_token === "string"
        ? data.access_token
        : null;

    if (!res.ok || !token) {
      console.error("GitHub OAuth token exchange failed", {
        status: res.status,
        error:
          typeof data === "object" && data !== null && "error" in data
            ? data.error
            : "unknown_error",
      });
      return redirectToWorkspace(req, "token_exchange_failed");
    }

    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Testing-Automation",
      },
      cache: "no-store",
    });
    const profile: unknown = await profileResponse.json();

    if (
      !profileResponse.ok ||
      typeof profile !== "object" ||
      profile === null ||
      !("id" in profile) ||
      !("login" in profile) ||
      (typeof profile.id !== "number" && typeof profile.id !== "string") ||
      typeof profile.login !== "string"
    ) {
      return redirectToWorkspace(req, "identity_verification_failed");
    }

    const avatarUrl =
      "avatar_url" in profile && typeof profile.avatar_url === "string"
        ? profile.avatar_url
        : null;
    const scopes =
      typeof data === "object" &&
      data !== null &&
      "scope" in data &&
      typeof data.scope === "string"
        ? data.scope
        : null;
    const encryptedAccessToken = encryptGitHubToken(token);

    await db
      .insert(githubConnections)
      .values({
        clerkUserId,
        githubUserId: String(profile.id),
        githubLogin: profile.login,
        githubAvatarUrl: avatarUrl,
        encryptedAccessToken,
        scopes,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: githubConnections.clerkUserId,
        set: {
          githubUserId: String(profile.id),
          githubLogin: profile.login,
          githubAvatarUrl: avatarUrl,
          encryptedAccessToken,
          scopes,
          updatedAt: new Date(),
        },
      });

    const response = NextResponse.redirect(new URL("/workspace", req.url));
    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.delete(OAUTH_USER_COOKIE);
    response.cookies.delete("gh_token");

    return response;
  } catch (error) {
    console.error("GitHub OAuth request failed", error);
    return redirectToWorkspace(req, "token_exchange_failed");
  }
}
