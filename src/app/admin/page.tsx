import { requireAdmin } from "@/lib/auth/guards";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const user = await requireAdmin();
  return (
    <main className="flex-1 p-8 pt-16">
      <h1 className="text-2xl font-black mb-6 text-center">
        Administration — <span className="text-accent">{user.username}</span>
      </h1>
      <AdminDashboard />
    </main>
  );
}
