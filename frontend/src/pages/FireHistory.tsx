import { useEffect, useState } from "react";
import { getFireHistory } from "../api/fire";

interface FireRecord {
  fire_number: number;
  fire_year: number;
  final_wealth: number;
  monthly_income: number;
  living_expense: number;
  current_savings: number;
  created_at: string | null;
}

export function FireHistory() {
  const [data, setData] = useState<{ calculations: FireRecord[]; count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getFireHistory()
      .then(setData)
      .catch(() => setError("Failed to load FIRE history"))
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

  const list = data?.calculations ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">FIRE History</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Your recent FIRE calculations with income, savings, and results.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 text-sm text-slate-300">
          No FIRE calculations yet. Use the FIRE Calculator to generate your first plan.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-3 py-2 text-left text-slate-400 font-medium">Date</th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">FIRE Number</th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">FIRE Year</th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">Final Wealth</th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">Income</th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">Savings</th>
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
                  <td className="px-3 py-2 text-right text-emerald-400">
                    ₹{(r.fire_number / 1e6).toFixed(2)}M
                  </td>
                  <td className="px-3 py-2 text-right text-slate-100">
                    {r.fire_year}
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-400">
                    ₹{(r.final_wealth / 1e6).toFixed(2)}M
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    ₹{r.monthly_income?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    ₹{r.current_savings?.toLocaleString() ?? "—"}
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

