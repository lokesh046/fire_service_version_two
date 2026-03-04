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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Loan Analysis</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Analyze a single loan: EMI, payoff time, and total interest. This is
          independent of your FIRE plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Loan Amount (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.loan_amount}
              onChange={(e) => update("loan_amount", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Interest Rate (% per year)
            </label>
            <input
              type="number"
              min={0}
              value={form.interest_rate_value}
              onChange={(e) =>
                update("interest_rate_value", Number(e.target.value))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tenure (years)
            </label>
            <input
              type="number"
              min={1}
              value={form.tenure_years}
              onChange={(e) =>
                update("tenure_years", Number(e.target.value))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Loan"}
        </button>
      </form>

      {result && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 text-sm space-y-3">
          <h2 className="text-sm font-semibold text-white">Loan Summary</h2>
          <p className="text-slate-300">
            EMI:{" "}
            <span className="font-semibold text-emerald-400">
              ₹{result.calculated_emi?.toLocaleString() ?? "—"}
            </span>
          </p>
          <p className="text-slate-300">
            Tenure:{" "}
            <span className="font-semibold">
              {result.months_to_payoff
                ? `${(result.months_to_payoff / 12).toFixed(1)} years`
                : "—"}
            </span>
          </p>
          <p className="text-slate-300">
            Total interest:{" "}
            <span className="font-semibold text-rose-400">
              ₹{result.total_interest_paid?.toLocaleString() ?? "—"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

