import { useState } from "react";
import { calculateFire, getFireExplanation, type FireInput } from "../api/fire";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type FormInput = Omit<FireInput, "monthly_income" | "living_expense" | "current_savings" | "return_rate" | "inflation_rate" | "loan_amount" | "interest_rate_value" | "loan_emi" | "loan_years"> & {
  monthly_income: number | "";
  living_expense: number | "";
  current_savings: number | "";
  return_rate: number | "";
  inflation_rate: number | "";
  loan_amount: number | "";
  interest_rate_value: number | "";
  loan_emi: number | "";
  loan_years: number | "";
  scenario_name: string;
};

const defaultForm: FormInput = {
  scenario_name: "Primary Goal",
  monthly_income: 150000,
  living_expense: 60000,
  current_savings: 500000,
  return_rate: 0.12,
  inflation_rate: 0.06,
  has_loan: "no",
  loan_amount: 0,
  interest_rate_value: 10,
  rate_type: "annual",
  loan_emi: 0,
  loan_years: 0,
  has_insurance: "yes",
};

export function FireCalculator() {
  const [form, setForm] = useState<FormInput>(defaultForm);
  const [result, setResult] = useState<{
    fire_number: number;
    fire_year: number;
    final_wealth: number;
    financial_health_score: number;
    saved?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  const netCashflow =
    (Number(form.monthly_income) || 0) -
    (Number(form.living_expense) || 0) -
    (form.has_loan === "yes" ? (Number(form.loan_emi) || 0) : 0);

  const update = (key: keyof FormInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setResult(null);
    setExplanation(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const payload: FireInput = {
        ...form,
        monthly_income: Number(form.monthly_income) || 0,
        living_expense: Number(form.living_expense) || 0,
        current_savings: Number(form.current_savings) || 0,
        return_rate: Number(form.return_rate) || 0,
        inflation_rate: Number(form.inflation_rate) || 0,
        loan_amount: Number(form.loan_amount) || 0,
        interest_rate_value: Number(form.interest_rate_value) || 0,
        loan_emi: form.has_loan === "yes" ? (Number(form.loan_emi) || 0) : 0,
        loan_years: form.has_loan === "yes" ? (Number(form.loan_years) || 0) : 0,
      };
      const data = await calculateFire(payload);
      if (data.error) {
        setError(data.details ?? data.error);
        return;
      }
      setResult({
        fire_number: data.fire_number,
        fire_year: data.fire_year,
        final_wealth: data.final_wealth,
        financial_health_score: data.financial_health_score,
        saved: data.saved,
      });
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
          : String(msg ?? "Calculation failed, please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    setLoadingExplain(true);
    setExplanation(null);
    setError("");
    try {
      const payload: FireInput = {
        ...form,
        monthly_income: Number(form.monthly_income) || 0,
        living_expense: Number(form.living_expense) || 0,
        current_savings: Number(form.current_savings) || 0,
        return_rate: Number(form.return_rate) || 0,
        inflation_rate: Number(form.inflation_rate) || 0,
        loan_amount: Number(form.loan_amount) || 0,
        interest_rate_value: Number(form.interest_rate_value) || 0,
        loan_emi: form.has_loan === "yes" ? (Number(form.loan_emi) || 0) : 0,
        loan_years: form.has_loan === "yes" ? (Number(form.loan_years) || 0) : 0,
      };
      const data = await getFireExplanation(payload);
      if (data.error) {
        setError(data.details ?? data.error);
        return;
      }

      const aiData = data.ai_explanation;
      if (aiData && aiData.summary) {
        const parts = [
          aiData.summary,
          "",
          ...(aiData.reasoning_points || []).map((p: string) => `• ${p}`),
          "",
          aiData.risk_note ? `Note: ${aiData.risk_note}` : ""
        ];
        setExplanation(parts.filter(Boolean).join("\n"));
      } else {
        setExplanation(data.advisor_explanation || data.explanation || "No explanation returned.");
      }
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err && (err as any).response?.data?.detail;
      setError(Array.isArray(msg) ? msg[0] : String(msg ?? "Explanation failed."));
    } finally {
      setLoadingExplain(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">FIRE Calculator</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Estimate your Financial Independence number, target year, and final
          wealth. Results are saved automatically to your dashboard and history.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Scenario Name
            </label>
            <input
              type="text"
              value={form.scenario_name}
              onChange={(e) => update("scenario_name", e.target.value)}
              placeholder="e.g. Primary Goal, Retire at 40, Buy a House"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Monthly Income (₹)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={form.monthly_income}
              onChange={(e) => update("monthly_income", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
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
              step={1000}
              value={form.living_expense}
              onChange={(e) => update("living_expense", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
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
              step={10000}
              value={form.current_savings}
              onChange={(e) =>
                update("current_savings", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Return Rate (decimal, e.g. 0.12)
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={form.return_rate}
              onChange={(e) => update("return_rate", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Inflation Rate (decimal, e.g. 0.06)
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={form.inflation_rate}
              onChange={(e) =>
                update("inflation_rate", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Has Insurance
            </label>
            <select
              value={form.has_insurance}
              onChange={(e) => update("has_insurance", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Has Loan
            </label>
            <select
              value={form.has_loan}
              onChange={(e) => update("has_loan", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          {form.has_loan === "yes" && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.loan_amount}
                  onChange={(e) =>
                    update("loan_amount", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Loan EMI (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.loan_emi}
                  onChange={(e) => update("loan_emi", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Loan Years
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.loan_years}
                  onChange={(e) =>
                    update("loan_years", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)
                  }
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
                    update("interest_rate_value", Number(e.target.value) || e.target.value === "" ? (e.target.value === "" ? "" : Number(e.target.value)) : 0)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>
            </>
          )}
        </div>

        {netCashflow <= 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            Warning: Your net monthly cashflow is ≤ 0 (income − expenses − EMI).
            FIRE may be not achievable unless you reduce expenses, increase income,
            or adjust loan EMI.
          </div>
        )}

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
          {loading ? "Calculating..." : "Calculate & Save"}
        </button>
      </form>

      {result && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 text-sm">
          <h2 className="text-sm font-semibold text-white">Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-xs">FIRE Number</p>
              <p className="mt-1 text-lg font-semibold text-emerald-400">
                ₹{(result.fire_number / 1e6).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">FIRE Year</p>
              <p className="mt-1 text-lg font-semibold">{result.fire_year}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Final Wealth</p>
              <p className="mt-1 text-lg font-semibold text-emerald-400">
                ₹{(result.final_wealth / 1e6).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Health Score</p>
              <p className="mt-1 text-lg font-semibold text-cyan-400">
                {result.financial_health_score.toFixed(2)}/100
              </p>
            </div>
          </div>
          {result.saved && (
            <p className="text-slate-400 text-xs">
              Saved to your dashboard and history.
            </p>
          )}

          {/* Projection Chart */}
          {result.fire_year > 0 && result.fire_year <= 100 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Wealth Projection</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={Array.from({ length: result.fire_year + 1 }).map((_, i) => {
                      // Formula for compounding: FV = PV(1+r)^n + PMT [ ((1+r)^n - 1) / r ]
                      const realReturn = ((1 + (Number(form.return_rate) || 0.12)) / (1 + (Number(form.inflation_rate) || 0.06))) - 1;
                      const savings = Number(form.current_savings) || 0;
                      const annualPMT = netCashflow * 12; // simplified
                      const wealth = savings * Math.pow(1 + realReturn, i) + (annualPMT > 0 ? annualPMT * ((Math.pow(1 + realReturn, i) - 1) / realReturn) : 0);
                      return {
                        year: `Year ${i}`,
                        wealth: wealth > 0 ? wealth : 0
                      };
                    })}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${(value / 1e5).toFixed(0)}L`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", color: "#f8fafc" }}
                      itemStyle={{ color: "#34d399", fontWeight: 600 }}
                      formatter={(value: number) => [`₹${(value / 1e5).toFixed(2)}L`, "Projected Wealth"]}
                    />
                    <Area type="monotone" dataKey="wealth" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorWealth)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleExplain}
              disabled={loadingExplain}
              className="inline-flex items-center rounded-lg border border-emerald-600/50 text-emerald-400 px-4 py-2 mt-2 text-sm font-medium hover:bg-emerald-600/10 disabled:opacity-50"
            >
              {loadingExplain ? "Generating Explanation..." : "Get AI Explanation"}
            </button>
            {explanation && (
              <div className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700 whitespace-pre-wrap leading-relaxed">
                {explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

