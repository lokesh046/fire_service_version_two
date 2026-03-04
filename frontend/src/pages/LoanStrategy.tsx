import { useState } from "react";
import {
  compareLoanFireStrategy,
  type LoanFireStrategyInput,
  type LoanFireStrategyResult,
} from "../api/loan";

const defaultForm: LoanFireStrategyInput = {
  monthly_income: 150000,
  living_expense: 60000,
  current_savings: 500000,
  return_rate: 0.12,
  inflation_rate: 0.06,
  has_loan: "yes",
  loan_amount: 3000000,
  interest_rate_value: 10,
  rate_type: "annual",
  loan_emi: 25000,
  loan_years: 10,
  has_insurance: "yes",
};

export function LoanStrategy() {
  const [form, setForm] = useState<LoanFireStrategyInput>(defaultForm);
  const [result, setResult] = useState<LoanFireStrategyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof LoanFireStrategyInput, value: string | number) => {
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
      const data = await compareLoanFireStrategy(form);
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
          : String(msg ?? "Strategy comparison failed."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Loan Strategy</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Compare your current EMI vs an optimized strategy and see its impact
          on your FIRE year.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Monthly Income (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.monthly_income}
              onChange={(e) => update("monthly_income", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Living Expense (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.living_expense}
              onChange={(e) =>
                update("living_expense", Number(e.target.value))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Current Savings (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.current_savings}
              onChange={(e) =>
                update("current_savings", Number(e.target.value))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Return Rate (decimal)
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={form.return_rate}
              onChange={(e) => update("return_rate", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Inflation Rate (decimal)
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={form.inflation_rate}
              onChange={(e) =>
                update("inflation_rate", Number(e.target.value))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Current EMI (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.loan_emi}
              onChange={(e) => update("loan_emi", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Loan Years Remaining
            </label>
            <input
              type="number"
              min={1}
              value={form.loan_years}
              onChange={(e) => update("loan_years", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Loan Interest Rate (%)
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
          {loading ? "Comparing..." : "Compare Strategy"}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 text-sm">
            <h2 className="text-sm font-semibold text-white mb-3">
              Strategy Result
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-xs">Current FIRE Year</p>
                <p className="mt-1 text-lg font-semibold">
                  {result.current_fire_year}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Optimized FIRE Year</p>
                <p className="mt-1 text-lg font-semibold text-emerald-400">
                  {result.optimized_fire_year}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">
                  Recommended EMI (₹/month)
                </p>
                <p className="mt-1 text-lg font-semibold text-cyan-400">
                  {result.recommended_emi.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Recommendation</p>
                <p className="mt-1 text-sm font-semibold capitalize">
                  {result.strategy_recommendation.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            {result.loan_details && (
              <p className="mt-4 text-slate-300 text-xs">
                Original EMI: ₹
                {result.loan_details.original_emi?.toLocaleString() ?? "—"} →{" "}
                Optimal EMI: ₹
                {result.loan_details.optimal_emi?.toLocaleString() ?? "—"} •
                Interest savings: ₹
                {result.loan_details.interest_savings?.toLocaleString() ?? "—"}
              </p>
            )}
          </div>
          {result.ai_explanation &&
            Object.keys(result.ai_explanation).length > 0 && (
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 text-xs text-slate-200">
                <h2 className="text-sm font-semibold text-white mb-2">
                  AI Explanation
                </h2>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(result.ai_explanation, null, 2)}
                </pre>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

