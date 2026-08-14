"use client";

interface Entry {
  id: string;
  userId: string;
  username: string | null;
  endingId: string;
  endingName: string | null;
  youtubeUrl: string;
  groupName: string | null;
  createdAt: string;
}

export function LoserBracketPanel({ entries, players }: { entries: Entry[]; players: { id: string; username: string }[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-bold mb-3">Loser Bracket</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {players.map((player) => {
          const mine = entries.filter((e) => e.userId === player.id);
          const slots = [...mine, ...Array(Math.max(0, 4 - mine.length)).fill(null)].slice(0, Math.max(4, mine.length));
          return (
            <div key={player.id} className="rounded-lg bg-surface-2 p-3">
              <div className="font-semibold mb-2">{player.username}</div>
              <ul className="space-y-1">
                {slots.map((entry, i) =>
                  entry ? (
                    <li key={entry.id}>
                      <a
                        href={entry.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded bg-surface px-2 py-1 text-xs text-accent-2 hover:underline truncate"
                        title={`${entry.endingName} (${entry.groupName})`}
                      >
                        {entry.endingName}
                      </a>
                    </li>
                  ) : (
                    <li key={i} className="rounded bg-surface px-2 py-1 text-xs text-muted italic">
                      vide
                    </li>
                  )
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
