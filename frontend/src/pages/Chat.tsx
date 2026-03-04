import { useState } from "react";
import { chatWithAgent, type ChatServiceResponse } from "../api/chat";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

function formatINR(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return `₹${Math.round(n).toLocaleString()}`;
}

function formatChatResponse(res: ChatServiceResponse): string {
  if (res.error) {
    const details =
      typeof res.details === "string"
        ? res.details
        : res.details
          ? JSON.stringify(res.details, null, 2)
          : "";
    return `Error\n- ${res.error}${details ? `\n\nDetails\n${details}` : ""}`;
  }

  const s = (res.state ?? {}) as Record<string, unknown>;
  const income = Number(s.monthly_income ?? 0);
  const expense = Number(s.living_expense ?? 0);
  const emi = Number(s.loan_emi ?? 0);
  const hasLoanRaw = s.has_loan;
  const hasLoan =
    typeof hasLoanRaw === "boolean"
      ? hasLoanRaw
      : typeof hasLoanRaw === "string"
        ? ["yes", "true", "1"].includes(hasLoanRaw.toLowerCase())
        : false;
  const insurance = s.has_insurance;
  const netCashflow = income - expense - (hasLoan ? emi : 0);

  const warnings = [
    ...(Array.isArray(res.flags) ? res.flags : []),
    ...(netCashflow <= 0
      ? ["Net monthly cashflow is ≤ 0. FIRE may be not achievable with current inputs."]
      : []),
  ];

  const tr = (res.tool_results ?? {}) as Record<string, unknown>;
  const tools = Array.isArray(res.tools_used) ? res.tools_used : [];

  const lines: string[] = [];
  lines.push("Summary");
  lines.push(`- Monthly income: ${formatINR(s.monthly_income)}`);
  lines.push(`- Living expense: ${formatINR(s.living_expense)}`);
  lines.push(`- Current savings: ${formatINR(s.current_savings)}`);
  lines.push(`- Net monthly cashflow: ${formatINR(netCashflow)}`);
  lines.push(`- Has loan: ${hasLoan ? "Yes" : "No"}`);
  if (hasLoan) {
    lines.push(`  - Loan EMI: ${formatINR(s.loan_emi)}`);
    lines.push(
      `  - Loan years: ${
        typeof s.loan_years === "number" ? s.loan_years : s.loan_years ?? "—"
      }`,
    );
  }
  lines.push(
    `- Insurance: ${
      typeof insurance === "string"
        ? insurance
        : typeof insurance === "boolean"
          ? insurance
            ? "yes"
            : "no"
          : "—"
    }`,
  );

  lines.push("");
  lines.push("Results");
  lines.push(`- FIRE number: ${formatINR(s.fire_number)}`);
  lines.push(
    `- FIRE year: ${
      typeof s.fire_year === "number" ? s.fire_year : s.fire_year ?? "—"
    }`,
  );
  lines.push(`- Final wealth: ${formatINR(s.final_wealth)}`);
  lines.push(
    `- Financial health score: ${
      typeof s.financial_health_score === "number"
        ? `${s.financial_health_score}/100`
        : "—"
    }`,
  );

  if (warnings.length > 0) {
    lines.push("");
    lines.push("Warnings");
    for (const w of warnings) lines.push(`- ${w}`);
  }

  if (tools.length > 0) {
    lines.push("");
    lines.push("Tools");
    for (const t of tools) {
      const r = tr[t];
      if (!r) {
        lines.push(`- ${t}: —`);
        continue;
      }
      const robj = r as Record<string, unknown>;
      if (robj.error) {
        lines.push(`- ${t}: error (${String(robj.error)})`);
      } else if (robj.detail) {
        lines.push(`- ${t}: validation error`);
      } else if (robj.status) {
        lines.push(`- ${t}: ${String(robj.status)}`);
      } else {
        lines.push(`- ${t}: ok`);
      }
    }
  }

  if (res.advisor_explanation) {
    lines.push("");
    lines.push("Advisor explanation");
    lines.push(res.advisor_explanation.trim());
  }

  return lines.join("\n");
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError("");
    const id = Date.now();
    setMessages((prev) => [...prev, { id, role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatWithAgent(trimmed);
      const reply = formatChatResponse(res);

      setMessages((prev) => [
        ...prev,
        { id: id + 1, role: "assistant", content: reply },
      ]);
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
          : String(msg ?? "Chat service failed, please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-h-[720px]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">AI Financial Advisor</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Ask questions about your FIRE plan, loans, or financial health.
        </p>
      </div>

      <div className="flex-1 min-h-0 rounded-xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
          {messages.length === 0 && (
            <div className="text-slate-500 text-sm">
              Start by asking something like{" "}
              <span className="text-emerald-400">
                “How can I reach FIRE faster with my current income and loan?”
              </span>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                m.role === "user"
                  ? "ml-auto bg-emerald-600 text-white"
                  : "mr-auto bg-slate-800 text-slate-100"
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about FIRE, loans, or financial health..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

