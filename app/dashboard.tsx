"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Info,
  Trophy,
  ListChecks,
  PaperPlaneTilt,
  X,
  Medal,
  Star,
  House,
} from "@phosphor-icons/react";
import { nameToSlug } from "./lib/utils";

type LeaderboardEntry = { name: string; points: number };
type Challenge = { section: string; activity: string; points: number };

type Tab = "info" | "ranks" | "challenges";

type Props = {
  leaderboard: LeaderboardEntry[];
  challenges: Challenge[];
  activeTab: Tab;
  showSubmit: boolean;
};

const TAB_PATHS: Record<Tab, string> = {
  info: "/",
  ranks: "/ranks",
  challenges: "/challenges",
};

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScponPxBc3lZmg1sw-xtqTHHaEbio4w3jE_FtgzliIcyq1QDw/viewform?embedded=true";

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

export function Dashboard({
  leaderboard,
  challenges,
  activeTab,
  showSubmit,
}: Props) {
  const standardChallenges = challenges.filter((c) => c.section === "Standard");
  const specialChallenges = challenges.filter((c) => c.section === "Special");

  const isHomeTab = activeTab === "info" || activeTab === "ranks";
  const basePath = TAB_PATHS[activeTab];
  const submitPath = `${basePath}${basePath === "/" ? "" : "/"}submit`;

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
            </nav>
          </div>

          {/* Mobile Tabs - 3 tabs */}
          <nav className="flex bg-slate-900/50 md:hidden">
            <Link
              href="/"
              className={`flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-1.5 border-b-2 ${
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
              className={`flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-1.5 border-b-2 ${
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
              className={`flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-1.5 border-b-2 ${
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
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-28 max-w-5xl mx-auto">
        {/* Mobile: Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-4 md:hidden">
            <InfoContent />
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
              <InfoContent />
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
      </main>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent pt-8">
        <div className="max-w-md mx-auto">
          <Link
            href={submitPath}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 rounded-xl text-lg active:scale-[0.98] transition-transform shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700"
          >
            <PaperPlaneTilt size={22} weight="fill" />
            Submit Challenge
          </Link>
        </div>
      </div>

      {/* Modal - Full screen on mobile, centered dialog on desktop */}
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
    </div>
  );
}

// Extracted Info Content Component
function InfoContent() {
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
          <p className="text-lg font-bold text-slate-800">LET'S GOOOOO!!!!</p>
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
