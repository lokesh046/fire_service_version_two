import { useState, useEffect, useRef } from "react";
import { chatWithAgent, type ChatServiceResponse } from "../api/chat";

interface AssistantContent {
  summary?: string[];
  results?: string[];
  warnings?: string[];
  tools?: string[];
  advisor?: string;
  error?: string;
  details?: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string | AssistantContent;
  rawState?: Record<string, unknown>;
}

function formatINR(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return `₹${Math.round(n).toLocaleString()}`;
}

function parseChatResponse(res: ChatServiceResponse): AssistantContent {
  const content: AssistantContent = {};

  if (res.error) {
    content.error = res.error;
    if (res.details) {
      content.details = typeof res.details === "string" ? res.details : JSON.stringify(res.details, null, 2);
    }
    return content;
  }

  const s = (res.state ?? {}) as Record<string, unknown>;
  const income = Number(s.monthly_income ?? 0);
  const expense = Number(s.living_expense ?? 0);
  const emi = Number(s.loan_emi ?? 0);
  const hasLoanRaw = s.has_loan;
  const hasLoan = typeof hasLoanRaw === "boolean" ? hasLoanRaw : typeof hasLoanRaw === "string" ? ["yes", "true", "1"].includes(hasLoanRaw.toLowerCase()) : false;
  const insurance = s.has_insurance;
  const netCashflow = income - expense - (hasLoan ? emi : 0);

  if (Object.keys(s).length > 0) {
    content.summary = [
      `Monthly Income: ${formatINR(s.monthly_income)}`,
      `Living Expense: ${formatINR(s.living_expense)}`,
      `Current Savings: ${formatINR(s.current_savings)}`,
      `Net Cashflow: ${formatINR(netCashflow)}`,
      `Has Loan: ${hasLoan ? "Yes" : "No"}`,
    ];
    if (hasLoan) {
      content.summary.push(`Loan EMI: ${formatINR(s.loan_emi)}`);
      content.summary.push(`Loan Years: ${typeof s.loan_years === "number" ? s.loan_years : s.loan_years ?? "—"}`);
    }
    content.summary.push(`Insurance: ${typeof insurance === "string" ? insurance : typeof insurance === "boolean" ? (insurance ? "Yes" : "No") : "—"}`);

    content.results = [
      `FIRE Number: ${formatINR(s.fire_number)}`,
      `FIRE Year: ${typeof s.fire_year === "number" ? s.fire_year : s.fire_year ?? "—"}`,
      `Final Wealth: ${formatINR(s.final_wealth)}`,
      `Health Score: ${typeof s.financial_health_score === "number" ? `${s.financial_health_score.toFixed(2)}/100` : "—"}`,
    ];
  }

  const warnings = [
    ...(Array.isArray(res.flags) ? res.flags : []),
    ...(netCashflow <= 0 ? ["Net monthly cashflow is ≤ 0. FIRE may be not achievable with current inputs."] : []),
  ];
  if (warnings.length > 0) content.warnings = warnings;

  const tr = (res.tool_results ?? {}) as Record<string, unknown>;
  const tools = Array.isArray(res.tools_used) ? res.tools_used : [];
  if (tools.length > 0) {
    content.tools = tools.map((t) => {
      const r = tr[t];
      if (!r) return `${t}: —`;
      const robj = r as Record<string, unknown>;
      if (robj.error) return `${t}: error (${String(robj.error)})`;
      if (robj.detail) return `${t}: validation error`;
      if (robj.status) return `${t}: ${String(robj.status)}`;
      return `${t}: ok`;
    });
  }

  if (res.advisor_explanation) {
    content.advisor = res.advisor_explanation.trim();
  } else if (!res.error && !res.advisor_explanation && Object.keys(s).length === 0) {
    content.advisor = typeof (res as any).response === "string" ? (res as any).response : "I've processed your request.";
  }

  return content;
}

function AssistantMessageCard({ content }: { content: AssistantContent }) {
  if (content.error) {
    return (
      <div className="space-y-3">
        <div className="text-red-400 font-semibold text-sm">Error</div>
        <p className="text-sm text-red-300">{content.error}</p>
        {content.details && <pre className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded-xl overflow-x-auto">{content.details}</pre>}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {content.advisor && (
        <div>
          <h4 className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Advisor Note
          </h4>
          <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">{content.advisor}</p>
        </div>
      )}

      {(content.summary || content.results) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-2">
          {content.summary && (
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-slate-400 font-medium mb-3 text-xs uppercase tracking-wider">Current State</h4>
              <ul className="space-y-2">
                {content.summary.map((s, i) => {
                  const [label, val] = s.split(": ");
                  return (
                    <li key={i} className="text-xs text-slate-300 flex justify-between items-center border-b border-slate-800/50 pb-1 last:border-0 last:pb-0">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium">{val}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {content.results && (
            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.02)]">
              <h4 className="text-emerald-500/80 font-medium mb-3 text-xs uppercase tracking-wider">Projections</h4>
              <ul className="space-y-2">
                {content.results.map((r, i) => {
                  const [label, val] = r.split(": ");
                  return (
                    <li key={i} className="text-xs text-emerald-100 flex justify-between items-center border-b border-emerald-900/30 pb-1 last:border-0 last:pb-0">
                      <span className="text-emerald-600/70">{label}</span>
                      <span className="font-semibold text-emerald-400">{val}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {content.warnings && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl mt-3">
          <h4 className="text-amber-500/90 font-medium mb-2 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Notices
          </h4>
          <ul className="list-disc list-inside space-y-1.5">
            {content.warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-200/80">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {content.tools && (
        <div className="pt-2">
          <div className="flex flex-wrap gap-2">
            {content.tools.map((t, i) => (
              <span key={i} className="px-2 py-1 rounded bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-wider border border-slate-700/50">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Format history (exclude current message)
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: typeof m.content === "string"
          ? m.content
          : m.content.advisor || JSON.stringify(m.content)
      }));

      // Find the most recent 'rawState' returned by the assistant to pass back
      let lastState: Record<string, unknown> | undefined = undefined;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].rawState) {
          lastState = messages[i].rawState;
          break;
        }
      }

      const res = await chatWithAgent(trimmed, chatHistory, lastState);
      const parsedContent = parseChatResponse(res);

      setMessages((prev) => [
        ...prev,
        { id: id + 1, role: "assistant", content: parsedContent, rawState: res.state },
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
    <div className="flex flex-col h-[calc(100vh-6rem)] relative w-full max-w-5xl mx-auto py-2">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full mix-blend-screen" />

      <div className="mb-6 relative z-10 flex flex-col md:flex-row md:items-end md:justify-between px-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            AI <span className="text-emerald-400">Advisor</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Chat with our intelligent agent about your FIRE goals, loans, and health.
          </p>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-3xl overflow-hidden flex flex-col relative z-10 border border-slate-700/50 shadow-2xl">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 flex items-center justify-center mb-4 border border-emerald-500/20">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">How can I help you?</h3>
              <p className="text-slate-400 text-sm">
                You can ask me to simulate different loan EMI models, analyze if your FIRE goal is achievable, or calculate a new health score.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300">
                Try asking: <span className="text-emerald-400 block mt-1">"How can I reach FIRE faster with my current income?"</span>
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 ${m.role === "user"
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-tr-sm shadow-lg shadow-emerald-500/20"
                  : "glass bg-slate-900/80 border border-slate-700/60 rounded-tl-sm text-slate-100"
                  }`}
              >
                {m.role === "user" ? (
                  <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium">{m.content as string}</div>
                ) : (
                  <AssistantMessageCard content={m.content as AssistantContent} />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass max-w-[85%] bg-slate-900/80 border border-slate-700/60 rounded-tl-sm rounded-2xl p-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="mx-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-400 backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="p-4 sm:p-6 bg-slate-950/40 border-t border-slate-800/60 backdrop-blur-xl">
          <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your financial plan..."
              className="flex-1 rounded-xl glass border border-slate-700/50 bg-slate-900/40 px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner transition-all hover:bg-slate-900/60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl flex-shrink-0 bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
