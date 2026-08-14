import { NextResponse } from "next/server";
import { ALLOWED_USERNAMES } from "@/lib/auth/constants";
import { findUserByUsername } from "@/lib/db/queries/users";

export async function GET() {
  const registered: string[] = [];
  for (const username of ALLOWED_USERNAMES) {
    if (await findUserByUsername(username)) registered.push(username);
  }
  return NextResponse.json({ registered });
}
