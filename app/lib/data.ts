export const SUBMISSIONS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1M3u3t2TzVcJptUyfipu3IR8SExpFqIzHEeEQRoX7_-E/export?format=csv&gid=319550974";
export const CHALLENGES_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1M3u3t2TzVcJptUyfipu3IR8SExpFqIzHEeEQRoX7_-E/export?format=csv&gid=1131610114";

export type Submission = {
  name: string;
  challenge: string;
  timestamp: string;
  notes: string;
  rowIndex: number;
};
export type Challenge = { section: string; activity: string; points: number };
export type LeaderboardEntry = { name: string; points: number };

export async function fetchCSV(url: string): Promise<string[][]> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .map((row) => row.split(",").map((cell) => cell.trim()));
}

export async function getSubmissions(): Promise<Submission[]> {
  const rows = await fetchCSV(SUBMISSIONS_CSV_URL);
  const data = rows.slice(1);

  return data
    .map((row, index) => ({
      timestamp: row[0],
      name: row[1],
      challenge: row[2],
      notes: row[3] || "",
      rowIndex: index + 2, // +2 because row 1 is header, and index is 0-based
    }))
    .filter((sub) => sub.name);
}

export async function getChallenges(): Promise<Challenge[]> {
  const rows = await fetchCSV(CHALLENGES_CSV_URL);
  const data = rows.slice(1);

  return data.map((row) => ({
    section: row[0],
    activity: row[1],
    points: parseInt(row[2], 10) || 0,
  }));
}

export function buildLeaderboard(
  submissions: Submission[],
  challenges: Challenge[],
): LeaderboardEntry[] {
  const pointsMap = new Map<string, number>();
  for (const c of challenges) {
    pointsMap.set(c.activity, c.points);
  }

  const totals: Record<string, number> = {};
  for (const sub of submissions) {
    const points = pointsMap.get(sub.challenge) || 0;
    totals[sub.name] = (totals[sub.name] || 0) + points;
  }

  return Object.entries(totals)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points);
}
