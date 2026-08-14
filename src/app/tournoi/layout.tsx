import { requireUser } from "@/lib/auth/guards";
import { PresenceBar } from "@/components/PresenceBar";
import { LogoutButton } from "@/components/LogoutButton";

export default async function TournoiLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="flex-1 flex flex-col">
      <PresenceBar />
      <LogoutButton />
      {children}
    </div>
  );
}
