import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/api";
import { createDuel, listDuels } from "@/lib/db/queries/tournament";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament } from "@/lib/realtime/io";

export async function GET() {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ duels: await listDuels() });
}

const bodySchema = z.object({
  groupId: z.string().min(1),
  endingAId: z.string().min(1),
  endingBId: z.string().min(1),
});

export async function POST(req: Request) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  if (parsed.data.endingAId === parsed.data.endingBId) {
    return NextResponse.json({ error: "Les deux endings doivent être différents." }, { status: 400 });
  }

  const duel = await createDuel(parsed.data);
  await logAction(auth.user.id, "admin.duel.create", { duelId: duel.id });
  pingTournament();
  return NextResponse.json({ duel });
}
