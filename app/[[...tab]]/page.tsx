import { Dashboard } from "../dashboard";
import {
  getSubmissions,
  getChallenges,
  buildLeaderboard,
  getGWOTMileEntries,
  buildGWOTLeaderboard,
} from "../lib/data";

type Tab = "info" | "ranks" | "challenges" | "gwot";
const VALID_TABS = new Set(["ranks", "challenges", "gwot"]);

type Props = {
  params: Promise<{ tab?: string[] }>;
};

function parseRoute(segments: string[] = []): {
  tab: Tab;
  showSubmit: boolean;
  showInstall: boolean;
  showGWOTSubmit: boolean;
} {
  let tab: Tab = "info";
  let showSubmit = false;
  let showInstall = false;
  let showGWOTSubmit = false;

  for (const seg of segments) {
    if (seg === "submit") {
      showSubmit = true;
    } else if (seg === "install") {
      showInstall = true;
    } else if (seg === "log-miles") {
      showGWOTSubmit = true;
    } else if (VALID_TABS.has(seg)) {
      tab = seg as Tab;
    }
  }

  return { tab, showSubmit, showInstall, showGWOTSubmit };
}

export default async function Home({ params }: Props) {
  const { tab: segments } = await params;
  const { tab, showSubmit, showInstall, showGWOTSubmit } = parseRoute(segments);

  const [submissions, challenges, gwotEntries] = await Promise.all([
    getSubmissions(),
    getChallenges(),
    getGWOTMileEntries(),
  ]);

  const gwotLeaderboard = buildGWOTLeaderboard(gwotEntries);
  const leaderboard = buildLeaderboard(submissions, challenges, gwotLeaderboard);

  return (
    <Dashboard
      leaderboard={leaderboard}
      challenges={challenges}
      activeTab={tab}
      showSubmit={showSubmit}
      showInstall={showInstall}
      gwotLeaderboard={gwotLeaderboard}
      showGWOTSubmit={showGWOTSubmit}
    />
  );
}
