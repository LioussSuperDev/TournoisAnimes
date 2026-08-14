import { requireAdmin } from "@/lib/auth/guards";
import { PresenceBar } from "@/components/PresenceBar";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex-1 flex flex-col">
      <PresenceBar />
      <LogoutButton />
      {children}
    </div>
  );
}
