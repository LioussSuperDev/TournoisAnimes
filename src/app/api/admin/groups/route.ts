import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/api";
import { createGroup, listGroups } from "@/lib/db/queries/tournament";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament } from "@/lib/realtime/io";

export async function GET() {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ groups: await listGroups() });
}

const bodySchema = z.object({ name: z.string().min(1).max(100) });

export async function POST(req: Request) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nom invalide." }, { status: 400 });

  const group = await createGroup(parsed.data.name);
  await logAction(auth.user.id, "admin.group.create", { groupId: group.id, name: group.name });
  pingTournament();
  return NextResponse.json({ group });
}
