import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedClerkUserId } from "@/lib/github-connection";

const OAUTH_STATE_COOKIE = "github_oauth_state";
const OAUTH_USER_COOKIE = "github_oauth_user";

export async function GET(req: NextRequest) {
  const clerkUserId = await getAuthenticatedClerkUserId();
  if (!clerkUserId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const redirectUri = process.env.GITHUB_REDIRECT_URI?.trim();

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(
      new URL("/workspace?github_error=oauth_not_configured", req.url)
    );
  }

  const state = randomBytes(32).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    prompt: "select_account",
  });

  // GitHub App user tokens use the app's fine-grained permissions, not OAuth
  // scopes. Modern GitHub App client IDs use the "Iv" prefix.
  if (!clientId.startsWith("Iv")) {
    params.set("scope", "repo read:user");
  }

  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
  });
  response.cookies.set(OAUTH_USER_COOKIE, clerkUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
