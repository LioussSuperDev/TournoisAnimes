"use client";

import { ALLOWED_USERNAMES } from "@/lib/auth/constants";
import clsx from "clsx";

const PROFILE_COLORS: Record<string, string> = {
  Liouss: "from-fuchsia-500 to-purple-600",
  ShadyOFF: "from-cyan-400 to-blue-600",
  Siaka: "from-amber-400 to-orange-600",
  Serkcan: "from-rose-500 to-red-700",
};

export function ProfileTiles({
  selected,
  onSelect,
  disabledUsernames = [],
  disabledHint,
}: {
  selected: string | null;
  onSelect: (username: string) => void;
  disabledUsernames?: string[];
  disabledHint?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ALLOWED_USERNAMES.map((username) => {
        const isDisabled = disabledUsernames.includes(username);
        const isSelected = selected === username;
        return (
          <button
            key={username}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelect(username)}
            className={clsx(
              "relative rounded-xl p-4 font-semibold text-white transition-all border",
              "bg-gradient-to-br",
              PROFILE_COLORS[username],
              isSelected
                ? "border-white scale-[1.03] shadow-lg shadow-black/40"
                : "border-transparent opacity-90 hover:opacity-100",
              isDisabled && "opacity-30 grayscale cursor-not-allowed hover:opacity-30"
            )}
            title={isDisabled ? disabledHint : undefined}
          >
            {username}
            {username === "Serkcan" && (
              <span className="absolute top-1 right-1 text-[10px] uppercase tracking-wide bg-black/40 rounded px-1.5 py-0.5">
                admin
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
