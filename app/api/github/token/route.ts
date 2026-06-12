import { NextResponse } from "next/server";

import {
  deleteGitHubConnection,
  getAuthenticatedClerkUserId,
  getGitHubConnectionForUser,
} from "@/lib/github-connection";

export async function GET() {
  const clerkUserId = await getAuthenticatedClerkUserId();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const connection = await getGitHubConnectionForUser(clerkUserId);

    return NextResponse.json(
      {
        connected: Boolean(connection),
        account: connection
          ? {
              id: connection.githubUserId,
              login: connection.githubLogin,
              avatarUrl: connection.githubAvatarUrl,
            }
          : null,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load GitHub connection", error);
    return NextResponse.json(
      { error: "Unable to load GitHub connection." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const clerkUserId = await getAuthenticatedClerkUserId();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteGitHubConnection(clerkUserId);

  const response = NextResponse.json({ connected: false });
  response.cookies.delete("gh_token");
  return response;
}
