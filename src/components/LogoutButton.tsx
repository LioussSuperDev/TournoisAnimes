"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="fixed top-3 right-3 z-50 rounded-lg border border-border bg-surface/90 backdrop-blur px-3 py-2 text-sm text-muted hover:text-foreground hover:border-accent transition-colors"
    >
      Déconnexion
    </button>
  );
}
