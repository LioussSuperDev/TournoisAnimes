"use client";

import { useState } from "react";

interface SnapshotRow {
  id: string;
  name: string;
  createdAt: string;
}

export function SnapshotsPanel({
  snapshots,
  onChanged,
}: {
  snapshots: SnapshotRow[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    await fetch("/api/admin/snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setName("");
    setBusy(false);
    onChanged();
  }

  async function load(id: string, snapName: string) {
    if (
      !confirm(
        `Charger la sauvegarde "${snapName}" ? Cela remplace l'état actuel du tournoi (groupes, endings, duels, votes, pouvoirs, Loser Bracket).`
      )
    )
      return;
    setBusy(true);
    await fetch(`/api/admin/snapshots/${id}/load`, { method: "POST" });
    setBusy(false);
    onChanged();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette sauvegarde ?")) return;
    await fetch(`/api/admin/snapshots/${id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-bold mb-1">Sauvegardes du tournoi</h2>
      <p className="text-xs text-muted mb-3">
        Enregistre l&apos;état complet actuel (groupes, endings, duels, votes, pouvoirs des
        joueurs, roue, Loser Bracket) sous un nom, pour pouvoir le recharger plus tard.
      </p>
      <div className="flex gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la sauvegarde"
          className="flex-1 rounded-lg bg-surface-2 border border-border px-2 py-1.5 text-sm"
        />
        <button
          onClick={save}
          disabled={busy || !name.trim()}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
        >
          Enregistrer l&apos;état actuel
        </button>
      </div>

      <ul className="space-y-2">
        {snapshots.map((s) => (
          <li
            key={s.id}
            className="rounded-lg bg-surface-2 px-3 py-2 text-sm flex items-center justify-between gap-2"
          >
            <span>
              <strong>{s.name}</strong>{" "}
              <span className="text-muted text-xs">
                {new Date(s.createdAt.replace(" ", "T") + "Z").toLocaleString("fr-FR")}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={busy}
                onClick={() => load(s.id, s.name)}
                className="rounded bg-accent-2 text-black px-2 py-1 text-xs font-semibold disabled:opacity-50"
              >
                Charger
              </button>
              <button onClick={() => remove(s.id)} className="text-danger hover:underline text-xs">
                supprimer
              </button>
            </div>
          </li>
        ))}
        {snapshots.length === 0 && <li className="text-muted text-sm">Aucune sauvegarde.</li>}
      </ul>
    </div>
  );
}
