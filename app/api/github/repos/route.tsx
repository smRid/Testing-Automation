import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get('gh_token')?.value;

  if (!token) {
    return NextResponse.json(JSON.stringify({ error: 'Github token not found' }), { status: 401 });
  }

  const allRespo = [];
  let page = 1;

  while (true) {
    const res = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    }
    )
    const respos=await res.json();
    if(!respos.length) break;
    allRespo.push(...respos);
    page++;
  }
  return NextResponse.json({ repos: allRespo }, { status: 200 });
}