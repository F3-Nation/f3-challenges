"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Info,
  Trophy,
  ListChecks,
  PaperPlaneTilt,
  X,
  Medal,
  Star,
  House,
  DeviceMobile,
  Export,
  DotsThreeVertical,
  AppleLogo,
  AndroidLogo,
  CheckCircle,
  PersonSimpleRun,
  FlagBanner,
} from "@phosphor-icons/react";
import { nameToSlug } from "./lib/utils";

type LeaderboardEntry = { name: string; points: number };
type Challenge = { section: string; activity: string; points: number };
type GWOTLeaderboardEntry = {
  name: string;
  totalMiles: number;
  walkMiles: number;
  ruckMiles: number;
  runMiles: number;
};

type Tab = "info" | "ranks" | "challenges" | "gwot";

type Props = {
  leaderboard: LeaderboardEntry[];
  challenges: Challenge[];
  activeTab: Tab;
  showSubmit: boolean;
  showInstall: boolean;
  gwotLeaderboard: GWOTLeaderboardEntry[];
  showGWOTSubmit: boolean;
};

const TAB_PATHS: Record<Tab, string> = {
  info: "/",
  ranks: "/ranks",
  challenges: "/challenges",
  gwot: "/gwot",
};

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScponPxBc3lZmg1sw-xtqTHHaEbio4w3jE_FtgzliIcyq1QDw/viewform?embedded=true";

const GWOT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScFg_USVwo7NWSZNCWKAz1mw4xwuZNu9cmyWiy7b0oLZyD9Aw/viewform?embedded=true";

const PODIUM_LEVELS = [
  { name: "Bronze", points: 50, color: "text-orange-500", bg: "bg-orange-500" },
  { name: "Silver", points: 75, color: "text-gray-400", bg: "bg-gray-400" },
  { name: "Gold", points: 100, color: "text-yellow-400", bg: "bg-yellow-400" },
];

function getPodiumLevel(points: number) {
  if (points >= 100) return { level: "Gold", color: "text-yellow-400" };
  if (points >= 75) return { level: "Silver", color: "text-gray-400" };
  if (points >= 50) return { level: "Bronze", color: "text-orange-500" };
  return null;
}

function formatActivity(activity: string) {
  return activity
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.startsWith("#") || word.length <= 2) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// Cookie helpers
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// Platform detection
function getDevicePlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent);
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

// Subscriptions for useSyncExternalStore (no-op since values don't change)
const emptySubscribe = () => () => {};

// Custom hook for detecting client-side mounting using useSyncExternalStore
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Client value
    () => false, // Server value
  );
}

export function Dashboard({
  leaderboard,
  challenges,
  activeTab,
  showSubmit,
  showInstall,
  gwotLeaderboard,
  showGWOTSubmit,
}: Props) {
  const router = useRouter();
  const isClient = useIsClient();

  // Compute platform info only on client (SSR-safe)
  const platform = isClient ? getDevicePlatform() : "other";
  const isStandalone = isClient ? isStandaloneMode() : false;

  // Auto-open install modal on mobile (if not installed and not dismissed)
  useEffect(() => {
    // Only run on client after initial render
    if (typeof window === "undefined") return;

    const shouldAutoOpen =
      isMobileDevice() &&
      !isStandaloneMode() &&
      !getCookie("pwa-install-dismissed") &&
      !showInstall &&
      activeTab === "info";

    if (shouldAutoOpen) {
      router.push("/install");
    }
  }, [router, showInstall, activeTab]);

  // Handle install modal dismiss
  const handleInstallDismiss = () => {
    setCookie("pwa-install-dismissed", "true", 30);
    router.push(basePath);
  };

  const standardChallenges = challenges.filter((c) => c.section === "Standard");
  const specialChallenges = challenges.filter((c) => c.section === "Special");

  const isHomeTab = activeTab === "info" || activeTab === "ranks";
  const basePath = TAB_PATHS[activeTab];
  const submitPath = `${basePath}${basePath === "/" ? "" : "/"}submit`;
  const installPath = `${basePath}${basePath === "/" ? "" : "/"}install`;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          {/* Mobile: Centered logo */}
          <div className="px-4 py-2 flex items-center justify-center md:hidden">
            <Link href="/">
              <Image
                src="/iron-clad-2026.jpg"
                alt="Iron Clad 2026"
                width={140}
                height={70}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop: Wide logo left, nav right - single row */}
          <div className="hidden md:flex items-center justify-between px-4 py-2">
            <Link href="/">
              <Image
                src="/iron-clad-2026-wide.jpg"
                alt="Iron Clad 2026"
                width={240}
                height={50}
                className="object-contain"
                priority
              />
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/"
                className={`px-1 py-1 text-sm font-medium transition-all flex items-center gap-1.5 border-b-2 ${
                  isHomeTab
                    ? "text-white border-orange-400"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                <House size={16} weight={isHomeTab ? "fill" : "regular"} />
                Home
              </Link>
              <Link
                href="/challenges"
                className={`px-1 py-1 text-sm font-medium transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === "challenges"
                    ? "text-white border-orange-400"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                <ListChecks
                  size={16}
                  weight={activeTab === "challenges" ? "fill" : "regular"}
                />
                Challenges
              </Link>
              <Link
                href="/gwot"
                className={`px-1 py-1 text-sm font-medium transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === "gwot"
                    ? "text-white border-orange-400"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                <FlagBanner
                  size={16}
                  weight={activeTab === "gwot" ? "fill" : "regular"}
                />
                GWOT
              </Link>
            </nav>
          </div>

          {/* Mobile Tabs - 4 tabs */}
          <nav className="flex bg-slate-900/50 md:hidden">
            <Link
              href="/"
              className={`flex-1 py-3 text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 border-b-2 ${
                activeTab === "info"
                  ? "text-white border-orange-400 bg-slate-700/50"
                  : "text-slate-400 border-transparent"
              }`}
            >
              <Info
                size={18}
                weight={activeTab === "info" ? "fill" : "regular"}
              />
              Info
            </Link>
            <Link
              href="/ranks"
              className={`flex-1 py-3 text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 border-b-2 ${
                activeTab === "ranks"
                  ? "text-white border-orange-400 bg-slate-700/50"
                  : "text-slate-400 border-transparent"
              }`}
            >
              <Trophy
                size={18}
                weight={activeTab === "ranks" ? "fill" : "regular"}
              />
              Ranks
            </Link>
            <Link
              href="/challenges"
              className={`flex-1 py-3 text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 border-b-2 ${
                activeTab === "challenges"
                  ? "text-white border-orange-400 bg-slate-700/50"
                  : "text-slate-400 border-transparent"
              }`}
            >
              <ListChecks
                size={18}
                weight={activeTab === "challenges" ? "fill" : "regular"}
              />
              Challenges
            </Link>
            <Link
              href="/gwot"
              className={`flex-1 py-3 text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 border-b-2 ${
                activeTab === "gwot"
                  ? "text-white border-orange-400 bg-slate-700/50"
                  : "text-slate-400 border-transparent"
              }`}
            >
              <FlagBanner
                size={18}
                weight={activeTab === "gwot" ? "fill" : "regular"}
              />
              GWOT
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-28 max-w-5xl mx-auto">
        {/* Mobile: Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-4 md:hidden">
            <InfoContent
              isStandalone={isStandalone}
              installPath={installPath}
            />
          </div>
        )}

        {/* Mobile: Ranks Tab */}
        {activeTab === "ranks" && (
          <div className="space-y-3 md:hidden">
            <RanksContent leaderboard={leaderboard} />
          </div>
        )}

        {/* Desktop: Combined Home (Info + Ranks) */}
        {isHomeTab && (
          <div className="hidden md:grid md:grid-cols-2 md:gap-6">
            {/* Left Column - Info */}
            <div className="space-y-4">
              <InfoContent
                isStandalone={isStandalone}
                installPath={installPath}
              />
            </div>

            {/* Right Column - Ranks */}
            <div className="space-y-4">
              <RanksContent leaderboard={leaderboard} />
            </div>
          </div>
        )}

        {/* Challenges Tab (both mobile and desktop) */}
        {activeTab === "challenges" && (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            {/* Standard */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <ListChecks size={16} className="text-slate-400" />
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Standard Challenges
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {standardChallenges.map((c, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex items-center justify-between gap-4"
                  >
                    <span className="text-slate-700 text-sm">
                      {formatActivity(c.activity)}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                      +{c.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-yellow-400/30 h-fit">
              <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 flex items-center gap-2">
                <Star size={16} weight="fill" className="text-yellow-500" />
                <h2 className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">
                  Special Challenges
                </h2>
              </div>
              <div className="divide-y divide-yellow-100">
                {specialChallenges.map((c, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex items-center justify-between gap-4 bg-yellow-50/30"
                  >
                    <span className="text-slate-700 text-sm">
                      {formatActivity(c.activity)}
                    </span>
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                      +{c.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GWOT Tab */}
        {activeTab === "gwot" && (
          <div className="space-y-4">
            <GWOTContent gwotLeaderboard={gwotLeaderboard} />
          </div>
        )}
      </main>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent pt-8">
        <div className="max-w-md mx-auto">
          {activeTab === "gwot" ? (
            <Link
              href="/gwot/log-miles"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 rounded-xl text-lg active:scale-[0.98] transition-transform shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700"
            >
              <PersonSimpleRun size={22} weight="fill" />
              Log Miles
            </Link>
          ) : (
            <Link
              href={submitPath}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 rounded-xl text-lg active:scale-[0.98] transition-transform shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700"
            >
              <PaperPlaneTilt size={22} weight="fill" />
              Submit Challenge
            </Link>
          )}
        </div>
      </div>

      {/* Submit Modal - Full screen on mobile, centered dialog on desktop */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:bg-black/50 md:p-8">
          <div className="bg-white w-full h-full md:w-full md:max-w-2xl md:h-[90vh] md:rounded-2xl md:overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-slate-800 text-white md:rounded-t-2xl">
              <h2 className="font-semibold">Submit Challenge</h2>
              <Link
                href={basePath}
                className="p-2 -m-2 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} weight="bold" />
              </Link>
            </div>

            {/* Form iframe */}
            <iframe
              src={FORM_URL}
              className="flex-1 w-full border-0"
              title="Submit Challenge Form"
            >
              Loading...
            </iframe>
          </div>
        </div>
      )}

      {/* Install Instructions Modal */}
      {showInstall && (
        <InstallInstructionsModal
          isStandalone={isStandalone}
          platform={platform}
          onDismiss={handleInstallDismiss}
        />
      )}

      {/* GWOT Submit Modal */}
      {showGWOTSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:bg-black/50 md:p-8">
          <div className="bg-white w-full h-full md:w-full md:max-w-2xl md:h-[90vh] md:rounded-2xl md:overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-green-700 text-white md:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <PersonSimpleRun size={20} weight="fill" />
                <h2 className="font-semibold">Log Miles</h2>
              </div>
              <Link
                href="/gwot"
                className="p-2 -m-2 text-green-200 hover:text-white transition-colors"
              >
                <X size={24} weight="bold" />
              </Link>
            </div>

            {/* Form iframe */}
            <iframe
              src={GWOT_FORM_URL}
              className="flex-1 w-full border-0"
              title="Log Miles Form"
            >
              Loading...
            </iframe>
          </div>
        </div>
      )}
    </div>
  );
}

// Extracted Info Content Component
function InfoContent({
  isStandalone,
  installPath,
}: {
  isStandalone: boolean;
  installPath: string;
}) {
  return (
    <>
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-slate-300 leading-relaxed">
          You are here because you are a{" "}
          <strong className="text-white">HIM</strong> ready to accelerate.
        </p>
        <p className="text-slate-500 text-sm mt-3">
          Complete challenges to earn points and reach podium levels.
        </p>
      </div>

      {/* Install App Card */}
      <Link
        href={installPath}
        className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-orange-200"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isStandalone ? "bg-green-100" : "bg-orange-100"
            }`}
          >
            {isStandalone ? (
              <CheckCircle size={22} weight="fill" className="text-green-500" />
            ) : (
              <DeviceMobile size={22} className="text-orange-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">
              {isStandalone ? "App Installed" : "Install App"}
            </h3>
            <p className="text-slate-500 text-sm">
              {isStandalone
                ? "You're using the installed app"
                : "Add to your home screen"}
            </p>
          </div>
          <span className="text-slate-400 text-sm">→</span>
        </div>
      </Link>

      {/* Podium Levels */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Podium Levels
        </h2>
        <div className="space-y-2">
          {PODIUM_LEVELS.map((level) => (
            <div
              key={level.name}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
            >
              <div className={`${level.bg} w-1 h-8 rounded-full`} />
              <Medal size={22} weight="fill" className={level.color} />
              <span className="font-semibold text-slate-700">{level.name}</span>
              <span className="text-slate-500 ml-auto">{level.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-slate-600 text-sm leading-relaxed">
          PAX reaching a podium level can purchase an exclusive{" "}
          <strong>IRON CLAD F3MT shirt</strong> in their podium color.
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <p className="text-lg font-bold text-slate-800">
            LET&apos;S GOOOOO!!!!
          </p>
          <p className="text-slate-400 text-xs mt-2">— Jazz Hands</p>
        </div>
      </div>
    </>
  );
}

// Extracted Ranks Content Component
function RanksContent({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy size={32} className="text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">No submissions yet</p>
        <p className="text-slate-400 text-sm mt-1">Be the first to post!</p>
      </div>
    );
  }

  return (
    <>
      {/* Top 3 Podium */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 shadow-lg">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
          Top Performers
        </h2>
        <div className="flex items-end justify-center gap-2 py-4">
          {/* 2nd Place */}
          {leaderboard[1] && (
            <div className="flex flex-col items-center">
              <Link
                href={`/profile/${nameToSlug(leaderboard[1].name)}`}
                className="text-slate-300 text-xs mb-1 truncate max-w-[70px] hover:text-white transition-colors"
              >
                {leaderboard[1].name}
              </Link>
              <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-300">2</span>
              </div>
              <span className="text-gray-400 text-xs mt-1">
                {leaderboard[1].points} pts
              </span>
            </div>
          )}
          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-4">
            <Link
              href={`/profile/${nameToSlug(leaderboard[0].name)}`}
              className="text-white text-xs mb-1 font-medium truncate max-w-[80px] hover:text-yellow-200 transition-colors"
            >
              {leaderboard[0].name}
            </Link>
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
            <span className="text-yellow-400 text-sm font-semibold mt-1">
              {leaderboard[0].points} pts
            </span>
          </div>
          {/* 3rd Place */}
          {leaderboard[2] && (
            <div className="flex flex-col items-center">
              <Link
                href={`/profile/${nameToSlug(leaderboard[2].name)}`}
                className="text-slate-300 text-xs mb-1 truncate max-w-[70px] hover:text-white transition-colors"
              >
                {leaderboard[2].name}
              </Link>
              <div className="w-16 h-14 bg-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-400">3</span>
              </div>
              <span className="text-orange-400 text-xs mt-1">
                {leaderboard[2].points} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Full List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            All Rankings
          </h2>
        </div>
        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
          {leaderboard.map((entry, i) => {
            const podium = getPodiumLevel(entry.points);
            return (
              <div
                key={entry.name}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0
                      ? "bg-yellow-100 text-yellow-600"
                      : i === 1
                        ? "bg-slate-200 text-slate-600"
                        : i === 2
                          ? "bg-orange-100 text-orange-600"
                          : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/profile/${nameToSlug(entry.name)}`}
                      className="font-medium text-slate-800 truncate hover:text-orange-600 transition-colors"
                    >
                      {entry.name}
                    </Link>
                    {podium && (
                      <Medal
                        size={16}
                        weight="fill"
                        className={`${podium.color} flex-shrink-0`}
                      />
                    )}
                  </div>
                  {podium && (
                    <div className={`text-xs ${podium.color}`}>
                      {podium.level}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">{entry.points}</div>
                  <div className="text-xs text-slate-400">pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// Install Instructions Modal Component
function InstallInstructionsModal({
  isStandalone,
  platform,
  onDismiss,
}: {
  isStandalone: boolean;
  platform: "ios" | "android" | "other";
  onDismiss: () => void;
}) {
  const [selectedPlatform, setSelectedPlatform] = useState<"ios" | "android">(
    platform === "android" ? "android" : "ios",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:bg-black/50 md:p-8">
      <div className="bg-white w-full h-full md:w-full md:max-w-lg md:h-auto md:max-h-[90vh] md:rounded-2xl md:overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-800 text-white md:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <DeviceMobile size={20} />
            <h2 className="font-semibold">Install App</h2>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 -m-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isStandalone ? (
            // Already installed view
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle
                  size={40}
                  weight="fill"
                  className="text-green-500"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                You&apos;re All Set!
              </h3>
              <p className="text-slate-600">
                The app is already installed on your device.
              </p>
            </div>
          ) : (
            // Install instructions with video
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-slate-700 text-sm">
                  Add this app to your home screen for quick access and a better
                  experience.
                </p>
              </div>

              {/* Platform Tabs */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedPlatform("ios")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    selectedPlatform === "ios"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <AppleLogo
                    size={18}
                    weight="fill"
                    className={
                      selectedPlatform === "ios"
                        ? "text-slate-700"
                        : "text-slate-400"
                    }
                  />
                  iPhone
                </button>
                <button
                  onClick={() => setSelectedPlatform("android")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    selectedPlatform === "android"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <AndroidLogo
                    size={18}
                    weight="fill"
                    className={
                      selectedPlatform === "android"
                        ? "text-green-600"
                        : "text-slate-400"
                    }
                  />
                  Android
                </button>
              </div>

              {/* Instructions */}
              {selectedPlatform === "ios" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AppleLogo
                      size={20}
                      weight="fill"
                      className="text-slate-700"
                    />
                    <h3 className="font-semibold text-slate-800">
                      iPhone & iPad (Safari)
                    </h3>
                  </div>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span className="text-slate-600">
                        Tap the{" "}
                        <strong className="text-slate-800">Share</strong> button{" "}
                        <Export size={16} className="inline text-blue-500" /> at
                        the bottom of Safari
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span className="text-slate-600">
                        Scroll down and tap{" "}
                        <strong className="text-slate-800">
                          &quot;Add to Home Screen&quot;
                        </strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span className="text-slate-600">
                        Tap{" "}
                        <strong className="text-slate-800">
                          &quot;Add&quot;
                        </strong>{" "}
                        in the top right corner
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AndroidLogo
                      size={20}
                      weight="fill"
                      className="text-green-600"
                    />
                    <h3 className="font-semibold text-slate-800">
                      Android (Chrome)
                    </h3>
                  </div>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span className="text-slate-600">
                        Tap the <strong className="text-slate-800">menu</strong>{" "}
                        button{" "}
                        <DotsThreeVertical
                          size={16}
                          weight="bold"
                          className="inline text-slate-700"
                        />{" "}
                        in the top right
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span className="text-slate-600">
                        Tap{" "}
                        <strong className="text-slate-800">
                          &quot;Add to Home Screen&quot;
                        </strong>{" "}
                        or{" "}
                        <strong className="text-slate-800">
                          &quot;Install app&quot;
                        </strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span className="text-slate-600">
                        Tap{" "}
                        <strong className="text-slate-800">
                          &quot;Add&quot;
                        </strong>{" "}
                        or{" "}
                        <strong className="text-slate-800">
                          &quot;Install&quot;
                        </strong>{" "}
                        to confirm
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Video Player */}
              <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
                <video
                  key={selectedPlatform}
                  className="w-full"
                  controls
                  autoPlay
                  muted
                  playsInline
                  loop
                >
                  <source
                    src={
                      selectedPlatform === "ios" ? "/ios.mp4" : "/android.mp4"
                    }
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-slate-50 md:rounded-b-2xl">
          <button
            onClick={onDismiss}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl active:scale-[0.98] transition-transform"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// GWOT Content Component
function GWOTContent({
  gwotLeaderboard,
}: {
  gwotLeaderboard: GWOTLeaderboardEntry[];
}) {
  return (
    <>
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <FlagBanner size={24} weight="fill" />
          <h1 className="text-lg font-bold">GWOT 100 Mile Challenge</h1>
        </div>
        <p className="text-green-100 leading-relaxed">
          Complete 100 miles by February 28th to earn{" "}
          <strong className="text-white">+10 Iron Clad Points</strong>.
        </p>
        <p className="text-green-300 text-sm mt-2">
          Walk, ruck, or run - every mile counts!
        </p>
      </div>

      {/* Mile Leaders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <Trophy size={16} className="text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mile Leaders
          </h2>
        </div>

        {gwotLeaderboard.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PersonSimpleRun size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-500">No miles logged yet</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to log!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {gwotLeaderboard.map((entry, i) => {
              const percent = Math.min(100, (entry.totalMiles / 100) * 100);
              const completed = entry.totalMiles >= 100;
              const walkPercent = (entry.walkMiles / 100) * 100;
              const ruckPercent = (entry.ruckMiles / 100) * 100;
              const runPercent = (entry.runMiles / 100) * 100;

              return (
                <div key={entry.name} className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        i === 0
                          ? "bg-yellow-100 text-yellow-600"
                          : i === 1
                            ? "bg-slate-200 text-slate-600"
                            : i === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${nameToSlug(entry.name)}`}
                        className="font-medium text-slate-800 truncate hover:text-green-600 transition-colors"
                      >
                        {entry.name}
                      </Link>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      {completed && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          +10 pts
                        </span>
                      )}
                      <div>
                        <div className="font-bold text-slate-800">
                          {entry.totalMiles.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400">miles</div>
                      </div>
                    </div>
                  </div>

                  {/* Stacked progress bar */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    {entry.walkMiles > 0 && (
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${Math.min(walkPercent, 100)}%` }}
                        title={`Walk: ${entry.walkMiles.toFixed(1)} mi`}
                      />
                    )}
                    {entry.ruckMiles > 0 && (
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${Math.min(ruckPercent, 100 - walkPercent)}%`,
                        }}
                        title={`Ruck: ${entry.ruckMiles.toFixed(1)} mi`}
                      />
                    )}
                    {entry.runMiles > 0 && (
                      <div
                        className="h-full bg-orange-500"
                        style={{
                          width: `${Math.min(runPercent, 100 - walkPercent - ruckPercent)}%`,
                        }}
                        title={`Run: ${entry.runMiles.toFixed(1)} mi`}
                      />
                    )}
                  </div>

                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-400">
                      {percent.toFixed(0)}% complete
                    </span>
                    <span className="text-xs text-slate-400">100 mi goal</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Type Legend */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Activity Types
        </h2>
        <div className="flex justify-around">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-slate-600">Walk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-slate-600">Ruck</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm text-slate-600">Run</span>
          </div>
        </div>
      </div>
    </>
  );
}
