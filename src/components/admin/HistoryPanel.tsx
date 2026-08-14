"use client";

interface HistoryEntry {
  id: string;
  username: string | null;
  type: string;
  payloadJson: string;
  createdAt: string;
}

export function HistoryPanel({ history }: { history: HistoryEntry[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-bold mb-3">Historique</h2>
      <div className="max-h-80 overflow-y-auto space-y-1">
        {history.map((h) => (
          <div key={h.id} className="text-xs flex gap-2 border-b border-border/50 py-1">
            <span className="text-muted shrink-0">{h.createdAt}</span>
            <span className="text-accent-2 shrink-0">{h.username ?? "système"}</span>
            <span className="font-mono">{h.type}</span>
            <span className="text-muted truncate">{h.payloadJson}</span>
          </div>
        ))}
        {history.length === 0 && <p className="text-muted text-sm">Aucun évènement.</p>}
      </div>
    </div>
  );
}
