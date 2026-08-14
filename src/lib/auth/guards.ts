import { redirect } from "next/navigation";
import { getSession } from "./session";
import { findUserById } from "@/lib/db/queries/users";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  const dbUser = await findUserById(session.userId);
  if (!dbUser) return null;

  // The backdoor elevation (see /api/auth/elevate) only ever raises the
  // *session's* role, never the DB record — it's meant to last for this
  // session only, so we merge it in here rather than persisting it.
  if (session.role === "admin" && dbUser.role !== "admin") {
    return { ...dbUser, role: "admin" as const };
  }
  return dbUser;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/tournoi");
  return user;
}
