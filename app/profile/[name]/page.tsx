import { notFound } from "next/navigation";
import {
  getSubmissions,
  getChallenges,
  buildLeaderboard,
  getGWOTMileEntries,
  buildGWOTLeaderboard,
} from "../../lib/data";
import { findNameBySlug } from "../../lib/utils";
import { ProfilePage } from "./profile-page";

type Props = {
  params: Promise<{ name: string }>;
};

export type SubmissionWithPoints = {
  challenge: string;
  points: number;
  timestamp: string;
  notes: string;
  rowIndex: number;
};

export type GWOTProgress = {
  totalMiles: number;
  walkMiles: number;
  ruckMiles: number;
  runMiles: number;
  completed: boolean;
};

export default async function Profile({ params }: Props) {
  const { name: slug } = await params;

  const [submissions, challenges, gwotEntries] = await Promise.all([
    getSubmissions(),
    getChallenges(),
    getGWOTMileEntries(),
  ]);

  const gwotLeaderboard = buildGWOTLeaderboard(gwotEntries);
  const leaderboard = buildLeaderboard(submissions, challenges, gwotLeaderboard);
  const displayName = findNameBySlug(slug, leaderboard);

  if (!displayName) {
    notFound();
  }

  // Find rank
  const rank = leaderboard.findIndex((e) => e.name === displayName) + 1;
  const totalParticipants = leaderboard.length;
  const entry = leaderboard.find((e) => e.name === displayName)!;

  // Build points map for lookups
  const pointsMap = new Map<string, number>();
  for (const c of challenges) {
    pointsMap.set(c.activity, c.points);
  }

  // Get participant's submissions with points, sorted by most recent first
  const participantSubmissions: SubmissionWithPoints[] = submissions
    .filter((s) => s.name === displayName)
    .map((s) => ({
      challenge: s.challenge,
      points: pointsMap.get(s.challenge) || 0,
      timestamp: s.timestamp,
      notes: s.notes,
      rowIndex: s.rowIndex,
    }))
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  // Get GWOT progress for this user
  const gwotEntry = gwotLeaderboard.find((e) => e.name === displayName);
  const gwotProgress: GWOTProgress = gwotEntry
    ? {
        totalMiles: gwotEntry.totalMiles,
        walkMiles: gwotEntry.walkMiles,
        ruckMiles: gwotEntry.ruckMiles,
        runMiles: gwotEntry.runMiles,
        completed: gwotEntry.totalMiles >= 100,
      }
    : {
        totalMiles: 0,
        walkMiles: 0,
        ruckMiles: 0,
        runMiles: 0,
        completed: false,
      };

  return (
    <ProfilePage
      name={displayName}
      points={entry.points}
      rank={rank}
      totalParticipants={totalParticipants}
      submissions={participantSubmissions}
      gwotProgress={gwotProgress}
    />
  );
}
