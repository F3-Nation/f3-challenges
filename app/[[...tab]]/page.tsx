import { Dashboard } from "../dashboard";
import { getSubmissions, getChallenges, buildLeaderboard } from "../lib/data";

type Tab = "info" | "ranks" | "challenges";
const VALID_TABS = new Set(["ranks", "challenges"]);

type Props = {
  params: Promise<{ tab?: string[] }>;
};

function parseRoute(segments: string[] = []): {
  tab: Tab;
  showSubmit: boolean;
  showInstall: boolean;
} {
  let tab: Tab = "info";
  let showSubmit = false;
  let showInstall = false;

  for (const seg of segments) {
    if (seg === "submit") {
      showSubmit = true;
    } else if (seg === "install") {
      showInstall = true;
    } else if (VALID_TABS.has(seg)) {
      tab = seg as Tab;
    }
  }

  return { tab, showSubmit, showInstall };
}

export default async function Home({ params }: Props) {
  const { tab: segments } = await params;
  const { tab, showSubmit, showInstall } = parseRoute(segments);

  const [submissions, challenges] = await Promise.all([
    getSubmissions(),
    getChallenges(),
  ]);

  const leaderboard = buildLeaderboard(submissions, challenges);

  return (
    <Dashboard
      leaderboard={leaderboard}
      challenges={challenges}
      activeTab={tab}
      showSubmit={showSubmit}
      showInstall={showInstall}
    />
  );
}
