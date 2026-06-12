import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";

export const runtime = "nodejs";

type ArtifactType = "screenshot" | "trace";

const artifactConfig: Record<
  ArtifactType,
  { mimeType: string; extension: string }
> = {
  screenshot: { mimeType: "image/png", extension: "png" },
  trace: { mimeType: "application/zip", extension: "zip" },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  const { id, type } = await params;
  const testCaseId = Number(id);

  if (!Number.isInteger(testCaseId) || !(type in artifactConfig)) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  const artifactType = type as ArtifactType;
  const [testCase] = await db
    .select({
      screenshotData: TestCasesTable.screenshotData,
      traceData: TestCasesTable.traceData,
    })
    .from(TestCasesTable)
    .where(eq(TestCasesTable.id, testCaseId));

  const encodedArtifact =
    artifactType === "screenshot"
      ? testCase?.screenshotData
      : testCase?.traceData;

  if (!encodedArtifact) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  const config = artifactConfig[artifactType];
  const disposition = artifactType === "screenshot" ? "inline" : "attachment";
  const data = Buffer.from(encodedArtifact, "base64");

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": config.mimeType,
      "Content-Length": String(data.length),
      "Content-Disposition": `${disposition}; filename="test-case-${testCaseId}-${artifactType}.${config.extension}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
