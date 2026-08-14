export const ALLOWED_USERNAMES = ["Liouss", "ShadyOFF", "Siaka", "Serkcan"] as const;

export function isAllowedUsername(username: string): boolean {
  const lower = username.trim().toLowerCase();
  return ALLOWED_USERNAMES.some((u) => u.toLowerCase() === lower);
}
