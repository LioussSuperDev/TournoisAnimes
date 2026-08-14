"use client";

import { useEffect } from "react";
import { AdminDashboard } from "./AdminDashboard";

export function AdminPanelModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-8">
      <div className="w-full max-w-5xl rounded-2xl border border-border bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border bg-surface px-6 py-4">
          <h2 className="text-lg font-black">
            Panel <span className="text-accent">Admin</span>
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground hover:border-accent"
          >
            Fermer ✕
          </button>
        </div>
        <div className="p-6">
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
}
