import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    const searchparams = new URL(req.url).searchParams;
    const repoId = searchparams.get('repoId');

    if (!repoId) {
        return NextResponse.json({ error: 'repoId is required' }, { status: 400 })
    }

    const result = await db
      .select({
        id: TestCasesTable.id,
        userId: TestCasesTable.userId,
        repoId: TestCasesTable.repoId,
        repoName: TestCasesTable.repoName,
        repoOwner: TestCasesTable.repoOwner,
        branch: TestCasesTable.branch,
        title: TestCasesTable.title,
        description: TestCasesTable.description,
        type: TestCasesTable.type,
        priority: TestCasesTable.priority,
        targetRoute: TestCasesTable.targetRoute,
        targetFiles: TestCasesTable.targetFiles,
        expectedResult: TestCasesTable.expectedResult,
        browserlessScript: TestCasesTable.browserlessScript,
        status: TestCasesTable.status,
        createdAt: TestCasesTable.createdAt,
        logs: TestCasesTable.logs,
        sessionId: TestCasesTable.sessionId,
        sessionUrl: TestCasesTable.sessionUrl,
        artifactMetadata: TestCasesTable.artifactMetadata,
        startedAt: TestCasesTable.startedAt,
        completedAt: TestCasesTable.completedAt,
        durationMs: TestCasesTable.durationMs,
      })
      .from(TestCasesTable)
      .where(eq(TestCasesTable.repoId, repoId));

    return NextResponse.json(result)

}
