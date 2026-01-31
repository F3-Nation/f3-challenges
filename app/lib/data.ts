export const SUBMISSIONS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1M3u3t2TzVcJptUyfipu3IR8SExpFqIzHEeEQRoX7_-E/export?format=csv&gid=319550974";
export const CHALLENGES_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1M3u3t2TzVcJptUyfipu3IR8SExpFqIzHEeEQRoX7_-E/export?format=csv&gid=1131610114";
export const GWOT_MILES_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1M3u3t2TzVcJptUyfipu3IR8SExpFqIzHEeEQRoX7_-E/export?format=csv&gid=744579582";

export type Submission = {
  name: string;
  challenge: string;
  timestamp: string;
  notes: string;
  rowIndex: number;
};
export type Challenge = { section: string; activity: string; points: number };
export type LeaderboardEntry = { name: string; points: number };

export type GWOTMileEntry = {
  name: string;
  date: string;
  activityType: "Walk" | "Ruck" | "Run";
  miles: number;
  notes: string;
};

export type GWOTLeaderboardEntry = {
  name: string;
  totalMiles: number;
  walkMiles: number;
  ruckMiles: number;
  runMiles: number;
};

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

export async function getGWOTMileEntries(): Promise<GWOTMileEntry[]> {
  const rows = await fetchCSV(GWOT_MILES_CSV_URL);
  const data = rows.slice(1);

  return data
    .map((row) => ({
      timestamp: row[0],
      name: row[1],
      date: row[2],
      activityType: row[3] as "Walk" | "Ruck" | "Run",
      miles: parseFloat(row[4]) || 0,
      notes: row[5] || "",
    }))
    .filter((entry) => entry.name && entry.miles > 0);
}

export function buildGWOTLeaderboard(
  entries: GWOTMileEntry[],
): GWOTLeaderboardEntry[] {
  const totals: Record<
    string,
    { walk: number; ruck: number; run: number }
  > = {};

  for (const entry of entries) {
    if (!totals[entry.name]) {
      totals[entry.name] = { walk: 0, ruck: 0, run: 0 };
    }
    const type = entry.activityType.toLowerCase() as "walk" | "ruck" | "run";
    totals[entry.name][type] += entry.miles;
  }

  return Object.entries(totals)
    .map(([name, miles]) => ({
      name,
      totalMiles: miles.walk + miles.ruck + miles.run,
      walkMiles: miles.walk,
      ruckMiles: miles.ruck,
      runMiles: miles.run,
    }))
    .sort((a, b) => b.totalMiles - a.totalMiles);
}

export function buildLeaderboard(
  submissions: Submission[],
  challenges: Challenge[],
  gwotLeaderboard?: GWOTLeaderboardEntry[],
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

  // Add 10 points for completing 100+ GWOT miles
  if (gwotLeaderboard) {
    for (const entry of gwotLeaderboard) {
      if (entry.totalMiles >= 100) {
        totals[entry.name] = (totals[entry.name] || 0) + 10;
      }
    }
  }

  return Object.entries(totals)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points);
}
