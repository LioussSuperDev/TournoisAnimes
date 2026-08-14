"use client";

interface Usage {
  id: string;
  username: string | null;
  endingName: string | null;
  youtubeUrl: string | null;
  createdAt: string;
}

export function PoulainDorPanel({ usages }: { usages: Usage[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-bold mb-3">Poulain d&apos;Or — utilisations</h2>
      {usages.length === 0 ? (
        <p className="text-muted text-sm">Aucune utilisation pour l&apos;instant.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-2">Joueur</th>
              <th className="pb-2">Ending sauvé</th>
              <th className="pb-2">Quand</th>
            </tr>
          </thead>
          <tbody>
            {usages.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="py-2">{u.username}</td>
                <td className="py-2">
                  {u.youtubeUrl ? (
                    <a href={u.youtubeUrl} target="_blank" rel="noreferrer" className="text-accent-2 hover:underline">
                      {u.endingName}
                    </a>
                  ) : (
                    u.endingName
                  )}
                </td>
                <td className="py-2 text-muted">{u.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
