import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/api";
import { createEnding, listEndings } from "@/lib/db/queries/tournament";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament } from "@/lib/realtime/io";

export async function GET(req: Request) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  const groupId = new URL(req.url).searchParams.get("groupId") ?? undefined;
  return NextResponse.json({ endings: await listEndings(groupId) });
}

const bodySchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1).max(150),
  youtubeUrl: z.string().url(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export async function POST(req: Request) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const ending = await createEnding(parsed.data);
  await logAction(auth.user.id, "admin.ending.create", { endingId: ending.id, name: ending.name });
  pingTournament();
  return NextResponse.json({ ending });
}
