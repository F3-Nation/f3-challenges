import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center">
        <div className="text-6xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          Participant Not Found
        </h1>
        <p className="text-slate-500 mb-6">
          We couldn&apos;t find anyone with that name in the leaderboard.
        </p>
        <Link
          href="/ranks"
          className="inline-block bg-slate-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors"
        >
          Back to Rankings
        </Link>
      </div>
    </div>
  );
}
