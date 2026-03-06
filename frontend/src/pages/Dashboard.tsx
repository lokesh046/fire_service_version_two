import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
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
  const { user } = useAuthStore();

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
    <div className="space-y-10 py-6 relative">
      {/* Background ambient glow for dashboard */}
      <div className="glow-bg bg-emerald-500/20 w-[400px] h-[400px] top-0 left-[-10%] mix-blend-screen absolute"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{user?.username || 'User'}</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Here's a snapshot of your true wealth and FIRE journey.
          </p>
        </div>
        <Link
          to="/fire"
          className="inline-flex flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-colors"
        >
          Update Plan
        </Link>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-400 mb-2">FIRE Number</p>
          <p className="text-3xl font-bold text-emerald-400 tracking-tight">
            {fire?.fire_number != null
              ? `₹${(fire.fire_number / 1e6).toFixed(2)}M`
              : "—"}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-400 mb-2">FIRE Year</p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {fire?.fire_year ?? "—"}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-400 mb-2">Final Wealth</p>
          <p className="text-3xl font-bold text-emerald-400 tracking-tight">
            {fire?.final_wealth != null
              ? `₹${(fire.final_wealth / 1e6).toFixed(2)}M`
              : "—"}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <p className="text-sm font-medium text-slate-400 mb-2 relative z-10">Health Score</p>
          <p className="text-3xl font-bold text-cyan-400 tracking-tight relative z-10">
            {health?.score != null ? `${health.score.toFixed(2)}/100` : "—"}
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">
            Key Metrics Overview
          </h2>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData as { name: string; value: number }[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}L`} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      backdropFilter: "blur(12px)",
                      color: "#f8fafc"
                    }}
                    itemStyle={{ color: "#34d399", fontWeight: 600 }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 rounded-xl bg-slate-900/40 border border-slate-800/50 border-dashed">
              <p className="text-slate-400 text-sm">Not enough data to display chart.</p>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Loan Summary</h2>
            <Link
              to="/history/loans"
              className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              View history &rarr;
            </Link>
          </div>

          {loans && (loans.total_simulations > 0 || loans.latest_loan) ? (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Simulations</p>
                <p className="text-2xl font-bold text-white">{loans.total_simulations}</p>
              </div>

              {loans.latest_loan && (
                <div className="space-y-4 mt-auto">
                  <h3 className="text-sm font-medium text-slate-300 border-b border-slate-800 pb-2">Latest Simulation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Amount</p>
                      <p className="text-sm font-semibold text-white">₹{loans.latest_loan.loan_amount?.toLocaleString() ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Optimal EMI</p>
                      <p className="text-sm font-semibold text-white">₹{loans.latest_loan.optimal_emi?.toLocaleString() ?? "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Total Interest</p>
                      <p className="text-sm font-semibold text-red-400">₹{loans.latest_loan.total_interest?.toLocaleString() ?? "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-6 rounded-xl bg-slate-900/40 border border-slate-800/50 border-dashed">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">No active loans.</p>
            </div>
          )}
        </div>
      </div>

      {!fire && !health && (
        <div className="relative z-10 rounded-2xl glass p-8 text-center mt-8">
          <h3 className="text-lg font-semibold text-white mb-2">Ready to know your true wealth?</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Generate your first FIRE plan to see your projected timeline, final wealth, and health score.
          </p>
          <Link to="/fire" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400 transition-colors">
            Calculate FIRE Plan
          </Link>
        </div>
      )}
    </div>
  );
}

