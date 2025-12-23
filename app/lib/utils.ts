import type { LeaderboardEntry } from "./data";

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function findNameBySlug(
  slug: string,
  leaderboard: LeaderboardEntry[],
): string | null {
  const entry = leaderboard.find((e) => nameToSlug(e.name) === slug);
  return entry?.name ?? null;
}
