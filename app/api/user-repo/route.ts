import { db, repositories } from "@/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const { repoId, userId, name, full_name, private_, html_url, description, owner } = await req.json();

        if (!repoId || !userId || !name || !full_name || !html_url || !owner) {
            return NextResponse.json({ error: "Missing required repository fields" }, { status: 400 });
        }

        const result = await db.insert(repositories).values({
            repoId,
            userId,
            name,
            fullName: full_name,
            private: private_ ? 1 : 0,
            htmlUrl: html_url,
            description,
            owner
        }).returning();

        return NextResponse.json(result[0]);
    } catch (error) {
        console.log("Error saving repository: ", error);
        return NextResponse.json({ error: "Failed to save repository" }, { status: 500 });
    }

}
