import { requireUser } from "@/lib/auth/guards";
import { TournoiView } from "@/components/tournoi/TournoiView";

export default async function TournoiPage() {
  const user = await requireUser();
  return <TournoiView meId={user.id} username={user.username} role={user.role} />;
}
