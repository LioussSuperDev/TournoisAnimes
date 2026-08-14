import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/api";
import { listLoserBracketEntries } from "@/lib/db/queries/loserBracket";

export async function GET() {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ entries: await listLoserBracketEntries() });
}
