"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Medal,
  Trophy,
  CheckCircle,
  Note,
  X,
  ArrowSquareOut,
  FlagBanner,
} from "@phosphor-icons/react";
import type { SubmissionWithPoints, GWOTProgress } from "./page";

const PODIUM_LEVELS = [
  { name: "Bronze", points: 50, color: "text-orange-500", bg: "bg-orange-500" },
  { name: "Silver", points: 75, color: "text-gray-400", bg: "bg-gray-400" },
  { name: "Gold", points: 100, color: "text-yellow-400", bg: "bg-yellow-400" },
];

function getPodiumLevel(points: number) {
  if (points >= 100)
    return { level: "Gold", color: "text-yellow-400", bg: "bg-yellow-400" };
  if (points >= 75)
    return { level: "Silver", color: "text-gray-400", bg: "bg-gray-400" };
  if (points >= 50)
    return { level: "Bronze", color: "text-orange-500", bg: "bg-orange-500" };
  return null;
}

function getNextLevel(points: number) {
  if (points >= 100) return null;
  if (points >= 75)
    return { name: "Gold", target: 100, color: "bg-yellow-400" };
  if (points >= 50) return { name: "Silver", target: 75, color: "bg-gray-400" };
  return { name: "Bronze", target: 50, color: "bg-orange-500" };
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

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function truncateNotes(notes: string, maxLength = 80): string {
  if (notes.length <= maxLength) return notes;
  return notes.slice(0, maxLength) + "...";
}

function getSheetRowUrl(rowIndex: number): string {
  return `https://docs.google.com/spreadsheets/d/1M3u3t2TzVcJptUyfipu3IR8SExpFqIzHEeEQRoX7_-E/edit?gid=319550974#gid=319550974&range=${rowIndex}:${rowIndex}`;
}

type NotesModalProps = {
  notes: string;
  challenge: string;
  onClose: () => void;
};

function NotesModal({ notes, challenge, onClose }: NotesModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Submission Notes</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-xs text-slate-500 mb-2">
            {formatActivity(challenge)}
          </p>
          <p className="text-slate-700 whitespace-pre-wrap">{notes}</p>
        </div>
      </div>
    </div>
  );
}

type Props = {
  name: string;
  points: number;
  rank: number;
  totalParticipants: number;
  submissions: SubmissionWithPoints[];
  gwotProgress: GWOTProgress;
};

export function ProfilePage({
  name,
  points,
  rank,
  totalParticipants,
  submissions,
  gwotProgress,
}: Props) {
  const [selectedNotes, setSelectedNotes] = useState<{
    notes: string;
    challenge: string;
  } | null>(null);
  const podium = getPodiumLevel(points);
  const nextLevel = getNextLevel(points);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/ranks"
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} weight="bold" />
          </Link>
          <h1 className="font-semibold truncate">{name}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-5xl mx-auto space-y-4">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            {/* Rank Badge */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${
                rank === 1
                  ? "bg-yellow-100 text-yellow-600"
                  : rank === 2
                    ? "bg-slate-200 text-slate-600"
                    : rank === 3
                      ? "bg-orange-100 text-orange-600"
                      : "bg-slate-700 text-slate-300"
              }`}
            >
              #{rank}
            </div>

            <div className="flex-1">
              <div className="text-3xl font-bold">{points} pts</div>
              <div className="text-slate-400 text-sm">
                Rank #{rank} of {totalParticipants}
              </div>
            </div>

            {/* Podium Badge */}
            {podium && (
              <div className="flex flex-col items-center">
                <Medal size={32} weight="fill" className={podium.color} />
                <span className={`text-xs font-semibold ${podium.color}`}>
                  {podium.level}
                </span>
              </div>
            )}
          </div>

          {/* Progress to Next Level */}
          {nextLevel && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">
                  Progress to {nextLevel.name}
                </span>
                <span className="text-slate-300">
                  {points} / {nextLevel.target}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${nextLevel.color} transition-all`}
                  style={{
                    width: `${Math.min(100, (points / nextLevel.target) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {nextLevel.target - points} points to go
              </div>
            </div>
          )}
        </div>

        {/* GWOT Progress Card - Only show if user has logged at least 1 mile */}
        {gwotProgress.totalMiles > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-green-200">
            <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
              <FlagBanner size={16} weight="fill" className="text-green-600" />
              <h2 className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                GWOT 100 Mile Challenge
              </h2>
              {gwotProgress.completed && (
                <span className="ml-auto bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  COMPLETED +10 pts
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* Circular Progress */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke={gwotProgress.completed ? "#16a34a" : "#22c55e"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(100, (gwotProgress.totalMiles / 100) * 100) * 2.26} 226`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-800">
                      {Math.min(100, Math.round((gwotProgress.totalMiles / 100) * 100))}%
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-2xl font-bold text-slate-800">
                    {gwotProgress.totalMiles.toFixed(1)}{" "}
                    <span className="text-base font-normal text-slate-500">
                      / 100 miles
                    </span>
                  </div>

                  {/* Activity Breakdown */}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {gwotProgress.walkMiles > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-slate-600">
                          Walk: {gwotProgress.walkMiles.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {gwotProgress.ruckMiles > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-slate-600">
                          Ruck: {gwotProgress.ruckMiles.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {gwotProgress.runMiles > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-slate-600">
                          Run: {gwotProgress.runMiles.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!gwotProgress.completed && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
                  {(100 - gwotProgress.totalMiles).toFixed(1)} miles to go!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submissions Audit Log */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle size={16} className="text-slate-400" />
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Submission History ({submissions.length})
            </h2>
          </div>

          {submissions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500">No submissions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {submissions.map((sub, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <CheckCircle
                        size={20}
                        weight="fill"
                        className="text-green-500 flex-shrink-0"
                      />
                      <span className="text-slate-700 text-sm truncate">
                        {formatActivity(sub.challenge)}
                      </span>
                      {sub.notes && (
                        <button
                          onClick={() =>
                            setSelectedNotes({
                              notes: sub.notes,
                              challenge: sub.challenge,
                            })
                          }
                          className="group relative p-1 text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0"
                          title={truncateNotes(sub.notes)}
                        >
                          <Note size={16} weight="fill" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap max-w-xs truncate opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {truncateNotes(sub.notes)}
                          </span>
                        </button>
                      )}
                      <a
                        href={getSheetRowUrl(sub.rowIndex)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-300 hover:text-blue-500 transition-colors flex-shrink-0"
                        title="View in spreadsheet"
                      >
                        <ArrowSquareOut size={14} />
                      </a>
                    </div>
                    <div className="ml-8 text-xs text-slate-400 mt-0.5">
                      {formatTimestamp(sub.timestamp)}
                    </div>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                    +{sub.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Notes Modal */}
      {selectedNotes && (
        <NotesModal
          notes={selectedNotes.notes}
          challenge={selectedNotes.challenge}
          onClose={() => setSelectedNotes(null)}
        />
      )}
    </div>
  );
}
