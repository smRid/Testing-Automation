import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const OAUTH_STATE_COOKIE = "github_oauth_state";

export async function GET(req: NextRequest) {
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
    scope: "repo read:user",
    state,
  });

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

  return response;
}
