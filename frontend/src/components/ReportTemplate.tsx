import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "../api/dashboard";

interface ReportTemplateProps {
  data: DashboardData;
  fireHistory: any;
}

export const ReportTemplate = React.forwardRef<HTMLDivElement, ReportTemplateProps>(
  ({ data }, ref) => {
    // Extract data
    const fire = data?.fire;
    const health = data?.health;
    const loans = data?.loans;
    const user = data?.user;

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div
        ref={ref}
        className="bg-white text-slate-900 w-[210mm] min-h-[297mm] mx-auto p-12 shadow-sm box-border font-sans"
      >
        {/* 4. Add Header */}
        <div className="border-b-4 border-emerald-600 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              Wealth To <span className="text-emerald-600">FIRE</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium">Financial Independence Report</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{user?.email || "User"}</p>
            <p className="text-sm text-slate-500">{today}</p>
          </div>
        </div>

        {/* 5. Add Summary (VERY IMPORTANT) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-12 break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">
            Executive Summary
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-2">
                Target FIRE Number
              </p>
              <p className="text-3xl font-black text-emerald-600">
                {fire?.fire_number
                  ? `₹${(fire.fire_number / 1e5).toFixed(2)}L`
                  : "—"}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-2">
                Years to Achieve
              </p>
              <p className="text-3xl font-black text-slate-800">
                {fire?.fire_year !== undefined && fire?.fire_year !== null
                  ? `${fire.fire_year} Years`
                  : "—"}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-2">
                Monthly Savings
              </p>
              <p className="text-3xl font-black text-slate-800">
                {fire?.monthly_income !== undefined && fire?.monthly_income !== null
                  ? `₹${fire.monthly_income.toLocaleString()}`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* 10. Add Sections - FIRE Summary */}
        <div className="mb-12 break-inside-avoid">
          <h3 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3">
            Wealth Projection Chart
          </h3>
          {fire && fire.fire_year && fire.fire_year <= 100 ? (
            // 3. Fix Chart Size
            <div className="w-[180mm] h-[300px] border border-slate-200 bg-slate-50 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={Array.from({ length: fire.fire_year + 1 }).map((_, i) => {
                    const start = Number(fire.current_savings) || 0;
                    const end = Number(fire.final_wealth) || Number(fire.fire_number) || 0;
                    const years = fire.fire_year || 1;
                    const s = start > 0 ? start : 1;
                    const e = end > 0 ? end : 1;
                    const wealth = s * Math.pow(e / s, i / years);

                    return {
                      year: `Y${i}`,
                      wealth: wealth > 0 ? wealth : 0,
                    };
                  })}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 1e5).toFixed(0)}L`}
                  />
                  <Area
                    type="monotone"
                    dataKey="wealth"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={0.2}
                    fill="#10b981"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500 italic">No projection chart available.</p>
          )}
        </div>

        {/* 2. Avoid Broken Pages - Force new page for subsequent details if needed */}
        <div className="grid grid-cols-2 gap-8 break-inside-avoid">
          {/* Loan Details */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">
              Loan Overview
            </h3>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Total Loan Simulations Run</p>
              <p className="text-2xl font-bold text-slate-800 mb-4">{loans?.total_simulations || 0}</p>
              
              {loans?.latest_loan ? (
                <>
                  <p className="text-sm text-slate-500 mb-1">Latest Loan Amount Evaluated</p>
                  <p className="text-lg font-bold text-slate-800 mb-4">
                    ₹{loans.latest_loan.loan_amount?.toLocaleString() ?? "—"}
                  </p>

                  <p className="text-sm text-slate-500 mb-1">Optimal Recommended EMI</p>
                  <p className="text-lg font-bold text-blue-600">
                    ₹{loans.latest_loan.optimal_emi?.toLocaleString() ?? "—"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500 italic">No recent loan evaluations.</p>
              )}
            </div>
          </div>

          {/* Health Score */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-rose-500 pl-3">
              Financial Health
            </h3>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="flex items-end gap-2 mb-4">
                <p className="text-4xl font-black text-rose-600">{health?.score ?? "—"}</p>
                <p className="text-slate-500 font-medium mb-1">/ 100</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-sm text-slate-600">Debt-to-Income Ratio</span>
                  <span className="font-bold text-slate-800">
                    {health?.debt_ratio !== undefined && health?.debt_ratio !== null ? `${health.debt_ratio}%` : "—"}
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-sm text-slate-600">Savings Ratio</span>
                  <span className="font-bold text-slate-800">
                    {health?.savings_ratio !== undefined && health?.savings_ratio !== null ? `${health.savings_ratio}%` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
          <p>Generated by Wealth To FIRE • Confidential Financial Document</p>
        </div>
      </div>
    );
  }
);
