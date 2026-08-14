"use client";

import { useState } from "react";
import type { Ending, Group } from "@/lib/types";

export function EndingsPanel({
  groups,
  endings,
  onChanged,
}: {
  groups: Group[];
  endings: Ending[];
  onChanged: () => void;
}) {
  const [groupId, setGroupId] = useState("");
  const [name, setName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [color, setColor] = useState("#a855f7");
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!groupId || !name.trim() || !youtubeUrl.trim()) return;
    setBusy(true);
    await fetch("/api/admin/endings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, name: name.trim(), youtubeUrl: youtubeUrl.trim(), color }),
    });
    setName("");
    setYoutubeUrl("");
    setBusy(false);
    onChanged();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet ending ?")) return;
    const res = await fetch(`/api/admin/endings/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Suppression impossible.");
      return;
    }
    onChanged();
  }

  async function patch(id: string, patch: Record<string, unknown>) {
    await fetch(`/api/admin/endings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    onChanged();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-bold mb-3">Endings</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="rounded-lg bg-surface-2 border border-border px-2 py-1.5 text-sm"
        >
          <option value="">Groupe...</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l'ending"
          className="rounded-lg bg-surface-2 border border-border px-2 py-1.5 text-sm"
        />
        <input
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Lien YouTube"
          className="rounded-lg bg-surface-2 border border-border px-2 py-1.5 text-sm sm:col-span-2"
        />
        <div className="flex gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-9 rounded bg-surface-2 border border-border"
          />
          <button
            onClick={create}
            disabled={busy}
            className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
      </div>

      <ul className="space-y-1">
        {endings.map((e) => (
          <li
            key={e.id}
            className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5 text-sm"
          >
            <input
              type="color"
              defaultValue={e.color}
              onBlur={(ev) => patch(e.id, { color: ev.target.value })}
              className="h-6 w-6 rounded"
            />
            <input
              defaultValue={e.name}
              onBlur={(ev) => ev.target.value !== e.name && patch(e.id, { name: ev.target.value })}
              className="bg-transparent border-b border-transparent hover:border-border focus:border-accent outline-none w-32"
            />
            <input
              defaultValue={e.youtubeUrl}
              onBlur={(ev) =>
                ev.target.value !== e.youtubeUrl && patch(e.id, { youtubeUrl: ev.target.value })
              }
              className="bg-transparent border-b border-transparent hover:border-border focus:border-accent outline-none flex-1 min-w-[150px] text-muted"
            />
            <label className="flex items-center gap-1 text-xs text-muted">
              <input
                type="checkbox"
                defaultChecked={e.qualified}
                onChange={(ev) => patch(e.id, { qualified: ev.target.checked })}
              />
              qualifié
            </label>
            <button onClick={() => remove(e.id)} className="text-danger hover:underline text-xs">
              supprimer
            </button>
          </li>
        ))}
        {endings.length === 0 && <li className="text-muted text-sm">Aucun ending.</li>}
      </ul>
    </div>
  );
}
