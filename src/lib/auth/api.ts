import { NextResponse } from "next/server";
import { getCurrentUser } from "./guards";

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  }
  return { user };
}

export async function requireApiAdmin() {
  const result = await requireApiUser();
  if ("error" in result) return result;
  if (result.user.role !== "admin") {
    return { error: NextResponse.json({ error: "Accès admin requis." }, { status: 403 }) };
  }
  return result;
}
