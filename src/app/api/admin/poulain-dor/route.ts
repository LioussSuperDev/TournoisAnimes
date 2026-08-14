import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/api";
import { listPoulainDorUsages } from "@/lib/db/queries/poulainDor";

export async function GET() {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ usages: await listPoulainDorUsages() });
}
