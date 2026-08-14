export type PowerType =
  | "effaceur"
  | "boost"
  | "relance_roue"
  | "poulain_dor"
  | "remontada"
  | "double_vote";

export type PowerWindow = "pre_wheel" | "post_wheel";
export type PowerTargetKind = "opponent" | "ending" | "self" | "none";

export interface PowerDefinition {
  type: PowerType;
  label: string;
  description: string;
  defaultQuantity: number;
  window: PowerWindow;
  targetKind: PowerTargetKind;
}

export const POWER_DEFINITIONS: Record<PowerType, PowerDefinition> = {
  effaceur: {
    type: "effaceur",
    label: "L'Effaceur",
    description: "Supprime le vote de base d'un adversaire.",
    defaultQuantity: 1,
    window: "pre_wheel",
    targetKind: "opponent",
  },
  boost: {
    type: "boost",
    label: "Boost",
    description: "Ajoute 3 votes supplémentaires à un ending.",
    defaultQuantity: 3,
    window: "pre_wheel",
    targetKind: "ending",
  },
  double_vote: {
    type: "double_vote",
    label: "Double Vote",
    description: "Double le vote du joueur (suit son vote courant).",
    defaultQuantity: 2,
    window: "pre_wheel",
    targetKind: "self",
  },
  relance_roue: {
    type: "relance_roue",
    label: "Relance la Roue",
    description: "Relance la roue quand le résultat n'a pas de majorité stricte.",
    defaultQuantity: 2,
    window: "post_wheel",
    targetKind: "none",
  },
  poulain_dor: {
    type: "poulain_dor",
    label: "Poulain d'Or",
    description: "Qualifie en plus l'ending perdant du duel.",
    defaultQuantity: 1,
    window: "post_wheel",
    targetKind: "ending",
  },
  remontada: {
    type: "remontada",
    label: "Remontada",
    description: "Envoie un ending perdant dans le Loser Bracket.",
    defaultQuantity: 1,
    window: "post_wheel",
    targetKind: "ending",
  },
};

export const DEFAULT_POWER_LOADOUT = Object.values(POWER_DEFINITIONS).map((p) => ({
  type: p.type,
  defaultQuantity: p.defaultQuantity,
}));
