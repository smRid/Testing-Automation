import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!user || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db.select().from(users).where(
      eq(users.email, email)
    );

    if (userResult.length == 0) {
      const newUser = await db.insert(users).values({
        email,
        name: user.fullName ?? 'New User'
      }).returning();

      return NextResponse.json({ user: newUser[0] });
    } else {
      return NextResponse.json({ user: userResult[0] });
    }
  } catch (e) {
    console.log("Error Creating User: ", e);
    return NextResponse.json({ error: "Failed to create new user" }, { status: 500 });
  }
}
