import { NextResponse } from "next/server";

import {
  deleteGitHubConnection,
  getAuthenticatedGitHubConnection,
} from "@/lib/github-connection";

type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  updated_at: string;
  language: string | null;
  default_branch: string;
  owner: {
    login: string;
  };
};

export async function GET() {
  const connection = await getAuthenticatedGitHubConnection();

  if (!connection) {
    return NextResponse.json(
      { error: 'GitHub connection not found. Please reconnect GitHub.' },
      { status: 401 }
    );
  }

  const allRepos: GitHubRepository[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`, {
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Testing-Automation'
      },
      cache: 'no-store'
    });

    const data: unknown = await res.json();

    if (!res.ok) {
      const githubMessage =
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof data.message === 'string'
          ? data.message
          : 'Unable to load GitHub repositories.';

      const response = NextResponse.json(
        {
          error:
            res.status === 401
              ? 'GitHub connection expired. Please reconnect GitHub.'
              : githubMessage,
        },
        { status: res.status === 401 ? 401 : 502 }
      );

      if (res.status === 401) {
        await deleteGitHubConnection(connection.clerkUserId);
      }

      return response;
    }

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'GitHub returned an unexpected repository response.' },
        { status: 502 }
      );
    }

    const repos = data as GitHubRepository[];
    if (repos.length === 0) break;

    allRepos.push(...repos);
    page++;
  }

    return NextResponse.json(allRepos.map(r => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        private_: r.private,
        html_url: r.html_url,
        description: r.description,
        updated_at: r.updated_at,
        language: r.language,
        default_branch: r.default_branch,
        owner: r.owner.login
    })));
}
