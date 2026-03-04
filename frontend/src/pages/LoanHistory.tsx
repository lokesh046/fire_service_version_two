import { useEffect, useState } from "react";
import { getLoanHistory } from "../api/loan";

interface LoanRecord {
  loan_amount: number;
  interest_rate: number;
  tenure_years: number;
  optimal_emi: number;
  total_interest: number;
  created_at: string | null;
}

export function LoanHistory() {
  const [data, setData] = useState<{ simulations: LoanRecord[]; count: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getLoanHistory()
      .then(setData)
      .catch(() => setError("Failed to load loan history"))
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

  const list = data?.simulations ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Loan Simulation History</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Your saved loan simulations from the optimizer service.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 text-sm text-slate-300">
          No loan simulations yet. Use Loan Strategy or Loan Analysis to create some.
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
                  Loan Amount
                </th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">
                  Rate (%)
                </th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">
                  Tenure (years)
                </th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">
                  Optimal EMI
                </th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">
                  Total Interest
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
                  <td className="px-3 py-2 text-right text-slate-100">
                    ₹{r.loan_amount?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    {r.interest_rate}%
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    {r.tenure_years}
                  </td>
                  <td className="px-3 py-2 text-right text-cyan-400">
                    ₹{r.optimal_emi?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    ₹{r.total_interest?.toLocaleString() ?? "—"}
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

