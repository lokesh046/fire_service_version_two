import { useState } from "react";
import {
  compareLoanFireStrategy,
  type LoanFireStrategyInput,
  type LoanFireStrategyResult,
} from "../api/loan";

type FormInput = Omit<LoanFireStrategyInput, "monthly_income" | "living_expense" | "current_savings" | "return_rate" | "inflation_rate" | "loan_amount" | "interest_rate_value" | "loan_emi" | "loan_years"> & {
  monthly_income: number | "";
  living_expense: number | "";
  current_savings: number | "";
  return_rate: number | "";
  inflation_rate: number | "";
  loan_amount: number | "";
  interest_rate_value: number | "";
  loan_emi: number | "";
  loan_years: number | "";
};

const defaultForm: FormInput = {
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
  const [form, setForm] = useState<FormInput>(defaultForm);
  const [result, setResult] = useState<LoanFireStrategyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof FormInput, value: string | number) => {
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
      const payload: LoanFireStrategyInput = {
        ...form,
        monthly_income: Number(form.monthly_income) || 0,
        living_expense: Number(form.living_expense) || 0,
        current_savings: Number(form.current_savings) || 0,
        return_rate: Number(form.return_rate) || 0,
        inflation_rate: Number(form.inflation_rate) || 0,
        loan_amount: Number(form.loan_amount) || 0,
        interest_rate_value: Number(form.interest_rate_value) || 0,
        loan_emi: Number(form.loan_emi) || 0,
        loan_years: Number(form.loan_years) || 0,
      };
      const data = await compareLoanFireStrategy(payload);
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
    <div className="space-y-8 relative">
      {/* Background ambient glow for Loan Strategy */}
      <div className="glow-bg bg-emerald-500/20 w-[400px] h-[400px] top-0 right-[-10%] mix-blend-screen absolute pointer-events-none"></div>

      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Loan Strategy</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl">
          Compare your current EMI vs an optimized strategy and see its impact
          on your FIRE year.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 glass-card rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Monthly Income (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.monthly_income}
              onChange={(e) => update("monthly_income", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Living Expense (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.living_expense}
              onChange={(e) => update("living_expense", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Current Savings (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.current_savings}
              onChange={(e) => update("current_savings", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Return Rate (decimal)
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={form.return_rate}
              onChange={(e) => update("return_rate", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Inflation Rate (decimal)
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={form.inflation_rate}
              onChange={(e) => update("inflation_rate", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Current EMI (₹)
            </label>
            <input
              type="number"
              min={0}
              value={form.loan_emi}
              onChange={(e) => update("loan_emi", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Loan Years Remaining
            </label>
            <input
              type="number"
              min={1}
              value={form.loan_years}
              onChange={(e) => update("loan_years", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Loan Interest Rate (%)
            </label>
            <input
              type="number"
              min={0}
              value={form.interest_rate_value}
              onChange={(e) => update("interest_rate_value", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-colors"
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
          className="btn-3d w-full md:w-auto"
        >
          {loading ? "Comparing..." : "Compare Strategy"}
        </button>
      </form>

      {result && (
        <div className="relative z-10 space-y-6">
          <div className="glass-card rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6">
              Strategy Result
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Current FIRE Year</p>
                <p className="text-3xl font-bold tracking-tight text-white">
                  {result.current_fire_year}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Optimized FIRE Year</p>
                <p className="text-3xl font-bold tracking-tight text-emerald-400">
                  {result.optimized_fire_year}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
                  Recommended EMI (₹/month)
                </p>
                <p className="text-3xl font-bold tracking-tight text-cyan-400">
                  {result.recommended_emi.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Recommendation</p>
                <p className="text-lg font-semibold capitalize text-white mt-2">
                  {result.strategy_recommendation.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            {result.loan_details && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-slate-300 text-sm flex gap-4">
                  <span><strong>Original EMI:</strong> ₹{result.loan_details.original_emi?.toLocaleString() ?? "—"}</span>
                  <span className="text-slate-500">•</span>
                  <span><strong>Optimal EMI:</strong> ₹{result.loan_details.optimal_emi?.toLocaleString() ?? "—"}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-medium"><strong>Interest Savings:</strong> ₹{result.loan_details.interest_savings?.toLocaleString() ?? "—"}</span>
                </p>
              </div>
            )}
          </div>
          {result.ai_explanation && Object.keys(result.ai_explanation).length > 0 && (
            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -ml-10 -mt-10 pointer-events-none"></div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Consultant Analysis
              </h2>

              {/* Parse the AI explanation payload if it's formatted as standard JSON string or object */}
              <div className="space-y-4 text-sm text-slate-300">
                {typeof result.ai_explanation === "string" ? (
                  <p className="leading-relaxed">{result.ai_explanation}</p>
                ) : (
                  <div className="space-y-6">
                    {(result.ai_explanation as any).summary && (
                      <p className="text-emerald-50 leading-relaxed text-base">{(result.ai_explanation as any).summary}</p>
                    )}

                    {(result.ai_explanation as any).reasoning_points && Array.isArray((result.ai_explanation as any).reasoning_points) && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Reasoning</h3>
                        <ul className="space-y-2">
                          {((result.ai_explanation as any).reasoning_points as string[]).map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(result.ai_explanation as any).risk_note && (
                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Risk Factors</h3>
                        <p className="text-orange-200">{(result.ai_explanation as any).risk_note}</p>
                      </div>
                    )}

                    {((result.ai_explanation as any).confidence_score !== undefined) && (
                      <div className="flex justify-end border-t border-slate-800 pt-4">
                        <div className="text-xs text-slate-500">
                          AI Confidence Score: <strong className="text-slate-300">{(result.ai_explanation as any).confidence_score}/100</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

