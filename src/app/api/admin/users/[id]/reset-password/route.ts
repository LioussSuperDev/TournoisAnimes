import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/api";
import { findUserById, updateUserPasswordHash } from "@/lib/db/queries/users";
import { hashPassword } from "@/lib/auth/password";
import { logAction } from "@/lib/db/queries/actionLog";

const bodySchema = z.object({ newPassword: z.string().min(4).max(200) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Mot de passe trop court (4 caractères minimum)." }, { status: 400 });
  }

  const user = await findUserById(id);
  if (!user) return NextResponse.json({ error: "Joueur introuvable." }, { status: 404 });

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await updateUserPasswordHash(id, passwordHash);
  await logAction(auth.user.id, "admin.user.reset_password", { userId: id, username: user.username });

  return NextResponse.json({ ok: true });
}
