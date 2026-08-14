import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guards";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Admin participates like everyone else — the admin panel is reached via
  // the quick-access popup on /tournoi (or the /admin page directly).
  redirect("/tournoi");
}
