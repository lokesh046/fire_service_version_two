import { useEffect, useState } from "react";
import { getHealthHistory } from "../api/dashboard";

interface HealthRecord {
  score: number;
  fire_number: number;
  debt_ratio: number;
  savings_ratio: number;
  created_at: string | null;
}

export function HealthHistory() {
  const [data, setData] = useState<{ scores: HealthRecord[]; count?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHealthHistory()
      .then(setData)
      .catch(() => setError("Failed to load health history"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 p-4 text-sm">
        {error}
      </div>
    );
  }

  const list = data?.scores ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Health Score History</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Your recent financial health scores, debt ratio, and savings ratio.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 text-sm text-slate-300">
          No health scores yet. Run a FIRE calculation to generate your first score.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Date
                </th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">
                  Score
                </th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">
                  FIRE Number
                </th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">
                  Debt Ratio
                </th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">
                  Savings Ratio
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-900 hover:bg-slate-900/60"
                >
                  <td className="px-3 py-2 text-slate-300">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-cyan-400">
                    {r.score.toFixed(2)}/100
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-400">
                    ₹{(r.fire_number / 1e6).toFixed(2)}M
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    {(r.debt_ratio * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    {(r.savings_ratio * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

