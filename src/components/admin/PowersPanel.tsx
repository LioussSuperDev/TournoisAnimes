"use client";

import type { PlayerPower, User } from "@/lib/types";
import { POWER_DEFINITIONS, type PowerType } from "@/lib/powers/registry";

export function PowersPanel({
  players,
  powers,
  onChanged,
}: {
  players: User[];
  powers: PlayerPower[];
  onChanged: () => void;
}) {
  function quantityFor(userId: string, powerType: PowerType) {
    return powers.find((p) => p.userId === userId && p.powerType === powerType)?.quantity ?? 0;
  }

  async function setQuantity(userId: string, powerType: PowerType, quantity: number) {
    await fetch("/api/admin/powers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, powerType, quantity: Math.max(0, quantity) }),
    });
    onChanged();
  }

  const powerTypes = Object.values(POWER_DEFINITIONS);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 overflow-x-auto">
      <h2 className="font-bold mb-3">Pouvoirs</h2>
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="text-left text-muted">
            <th className="pb-2">Joueur</th>
            {powerTypes.map((p) => (
              <th key={p.type} className="pb-2 px-2" title={p.description}>
                {p.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id} className="border-t border-border">
              <td className="py-2 font-medium">{player.username}</td>
              {powerTypes.map((p) => {
                const qty = quantityFor(player.id, p.type);
                return (
                  <td key={p.type} className="py-2 px-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQuantity(player.id, p.type, qty - 1)}
                        className="h-6 w-6 rounded bg-surface-2 hover:bg-border"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{qty}</span>
                      <button
                        onClick={() => setQuantity(player.id, p.type, qty + 1)}
                        className="h-6 w-6 rounded bg-surface-2 hover:bg-border"
                      >
                        +
                      </button>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
