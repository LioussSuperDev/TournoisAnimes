import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/api";
import { listHistory } from "@/lib/db/queries/actionLog";

export async function GET() {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ history: await listHistory() });
}
