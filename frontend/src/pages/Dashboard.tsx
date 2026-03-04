import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard, type DashboardData } from "../api/dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-slate-400 text-sm">
          Loading dashboard...
        </div>
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

  const fire = data?.fire;
  const health = data?.health;
  const loans = data?.loans;

  const chartData =
    fire || health
      ? [
          fire && fire.fire_number
            ? { name: "FIRE Number (L)", value: fire.fire_number / 1e5 }
            : null,
          fire && fire.final_wealth
            ? { name: "Final Wealth (L)", value: fire.final_wealth / 1e5 }
            : null,
          health && health.score
            ? { name: "Health Score", value: health.score }
            : null,
        ].filter(Boolean) ?? []
      : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Overview of your FIRE plan, financial health, and loans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">FIRE Number</p>
          <p className="mt-1 text-xl font-semibold text-emerald-400">
            {fire?.fire_number != null
              ? `₹${(fire.fire_number / 1e6).toFixed(2)}M`
              : "—"}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">FIRE Year</p>
          <p className="mt-1 text-xl font-semibold">
            {fire?.fire_year ?? "—"}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Final Wealth</p>
          <p className="mt-1 text-xl font-semibold text-emerald-400">
            {fire?.final_wealth != null
              ? `₹${(fire.final_wealth / 1e6).toFixed(2)}M`
              : "—"}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Health Score</p>
          <p className="mt-1 text-xl font-semibold text-cyan-400">
            {health?.score != null ? `${health.score}/100` : "—"}
          </p>
        </div>
      </div>

      {loans && (loans.total_simulations > 0 || loans.latest_loan) && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-white">Loan Summary</h2>
            <Link
              to="/history/loans"
              className="text-emerald-400 hover:underline"
            >
              View history
            </Link>
          </div>
          <p className="text-slate-400">
            Total simulations: {loans.total_simulations}
          </p>
          {loans.latest_loan && (
            <p className="mt-1 text-slate-300">
              Latest: amount ₹
              {loans.latest_loan.loan_amount?.toLocaleString() ?? "—"} • EMI ₹
              {loans.latest_loan.optimal_emi?.toLocaleString() ?? "—"} • total
              interest ₹
              {loans.latest_loan.total_interest?.toLocaleString() ?? "—"}
            </p>
          )}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">
            Key Metrics
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData as { name: string; value: number }[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!fire && !health && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 text-sm text-slate-300">
          No FIRE or health data yet. Start with the{" "}
          <Link to="/fire" className="text-emerald-400 hover:underline">
            FIRE Calculator
          </Link>{" "}
          to generate your first plan.
        </div>
      )}
    </div>
  );
}

