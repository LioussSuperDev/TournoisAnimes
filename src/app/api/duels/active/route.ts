import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api";
import { buildPlayerDuelView } from "@/lib/duel/state";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const view = await buildPlayerDuelView(auth.user.id);
  return NextResponse.json(view);
}
