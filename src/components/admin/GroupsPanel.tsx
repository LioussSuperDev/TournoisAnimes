"use client";

import { useState } from "react";
import type { Group } from "@/lib/types";

export function GroupsPanel({
  groups,
  onChanged,
}: {
  groups: Group[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    await fetch("/api/admin/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setName("");
    setBusy(false);
    onChanged();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce groupe ? (les endings/duels associés doivent être supprimés avant)")) return;
    const res = await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Suppression impossible : ce groupe a encore des endings ou des duels.");
      return;
    }
    onChanged();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-bold mb-3">Groupes</h2>
      <div className="flex gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du groupe"
          className="flex-1 rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={create}
          disabled={busy}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>
      <ul className="space-y-1">
        {groups.map((g) => (
          <li
            key={g.id}
            className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-sm"
          >
            {g.name}
            <button onClick={() => remove(g.id)} className="text-danger hover:underline">
              supprimer
            </button>
          </li>
        ))}
        {groups.length === 0 && <li className="text-muted text-sm">Aucun groupe.</li>}
      </ul>
    </div>
  );
}
