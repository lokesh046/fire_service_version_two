import { useState } from "react";
import { loanAnalysis, type LoanOnlyInput } from "../api/loan";

const defaultForm: LoanOnlyInput = {
  loan_amount: 3000000,
  interest_rate_value: 10,
  rate_type: "annual",
  tenure_years: 20,
};

export function LoanOnly() {
  const [form, setForm] = useState<LoanOnlyInput>(defaultForm);
  const [result, setResult] = useState<{
    calculated_emi?: number;
    months_to_payoff?: number;
    total_interest_paid?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof LoanOnlyInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await loanAnalysis(form);
      if (data.error) {
        setError(data.details ?? data.error);
        return;
      }
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail;
      setError(
        Array.isArray(msg)
          ? msg[0]
          : String(msg ?? "Loan analysis failed, please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Background ambient glow */}
      <div className="glow-bg bg-blue-500/20 w-[400px] h-[400px] top-0 left-[-10%] mix-blend-screen absolute pointer-events-none"></div>

      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Loan Analysis</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl">
          Analyze a single loan: EMI, payoff time, and total interest. This is
          independent of your FIRE plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 glass-card rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Loan Amount (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.loan_amount}
              onChange={(e) => update("loan_amount", Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Interest Rate (% per year)
            </label>
            <input
              type="number"
              min={0}
              value={form.interest_rate_value}
              onChange={(e) =>
                update("interest_rate_value", Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Tenure (years)
            </label>
            <input
              type="number"
              min={1}
              value={form.tenure_years}
              onChange={(e) =>
                update("tenure_years", Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Analyzing..." : "Analyze Loan"}
        </button>
      </form>

      {result && (
        <div className="relative z-10 glass-card rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">Loan Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">EMI</p>
              <p className="text-3xl font-bold tracking-tight text-white">
                ₹{result.calculated_emi?.toLocaleString() ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Tenure</p>
              <p className="text-3xl font-bold tracking-tight text-white">
                {result.months_to_payoff
                  ? `${(result.months_to_payoff / 12).toFixed(1)} years`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Total Interest</p>
              <p className="text-3xl font-bold tracking-tight text-rose-400">
                ₹{result.total_interest_paid?.toLocaleString() ?? "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

