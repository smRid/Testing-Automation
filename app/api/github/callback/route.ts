import { NextRequest, NextResponse } from "next/server";

const OAUTH_STATE_COOKIE = "github_oauth_state";

function redirectToWorkspace(req: NextRequest, error: string) {
  const response = NextResponse.redirect(
    new URL(`/workspace?github_error=${encodeURIComponent(error)}`, req.url)
  );
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(req: NextRequest) {
  const oauthError = req.nextUrl.searchParams.get("error");
  if (oauthError) {
    return redirectToWorkspace(req, oauthError);
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code) {
    return redirectToWorkspace(req, "missing_code");
  }

  if (!state || !expectedState || state !== expectedState) {
    return redirectToWorkspace(req, "invalid_state");
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

    const response = NextResponse.redirect(new URL("/workspace", req.url));
    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.set("gh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("GitHub OAuth request failed", error);
    return redirectToWorkspace(req, "token_exchange_failed");
  }
}
