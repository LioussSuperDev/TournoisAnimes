"use client";

import { useState } from "react";

interface AccountUser {
  id: string;
  username: string;
  role: string;
}

export function AccountsPanel({ players }: { players: AccountUser[] }) {
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function reset(userId: string, username: string) {
    if (newPassword.length < 4) {
      setMessage("4 caractères minimum.");
      return;
    }
    if (!confirm(`Réinitialiser le mot de passe de ${username} ?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error ?? "Échec de la réinitialisation.");
      return;
    }
    setMessage(`Mot de passe de ${username} réinitialisé.`);
    setNewPassword("");
    setOpenFor(null);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-bold mb-1">Comptes</h2>
      <p className="text-xs text-muted mb-3">
        En cas de mot de passe oublié, réinitialise-le ici — le joueur devra utiliser ce nouveau
        mot de passe à sa prochaine connexion.
      </p>
      <ul className="space-y-2">
        {players.map((p) => (
          <li key={p.id} className="rounded-lg bg-surface-2 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span>
                {p.username}
                {p.role === "admin" && <span className="ml-2 text-[10px] text-accent-2">admin</span>}
              </span>
              <button
                onClick={() => {
                  setOpenFor(openFor === p.id ? null : p.id);
                  setNewPassword("");
                  setMessage(null);
                }}
                className="text-xs text-accent-2 hover:underline"
              >
                {openFor === p.id ? "annuler" : "réinitialiser le mot de passe"}
              </button>
            </div>
            {openFor === p.id && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="flex-1 rounded-lg bg-surface border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
                />
                <button
                  disabled={busy}
                  onClick={() => reset(p.id, p.username)}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  Valider
                </button>
              </div>
            )}
          </li>
        ))}
        {players.length === 0 && <li className="text-muted text-sm">Aucun compte pour l&apos;instant.</li>}
      </ul>
      {message && <p className="text-xs text-accent-2 mt-2">{message}</p>}
    </div>
  );
}
