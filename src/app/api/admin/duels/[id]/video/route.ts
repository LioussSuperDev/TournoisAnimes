import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/api";
import { setVideoState } from "@/lib/realtime/videoSync";
import { pingDuelUpdate } from "@/lib/realtime/io";

const bodySchema = z.object({
  isPlaying: z.boolean(),
  positionSeconds: z.number().min(0),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  setVideoState(id, { ...parsed.data, updatedAt: Date.now() });
  pingDuelUpdate(id);

  return NextResponse.json({ ok: true });
}
