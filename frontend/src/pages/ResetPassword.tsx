import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await resetPassword({ token, new_password: newPassword });
      setSuccess("Password has been successfully reset! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to reset password. The link might have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      <div className="glow-bg bg-blue-500/20 w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute pointer-events-none mix-blend-screen"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Set New Password
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Please enter your new password below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-8 shadow-xl space-y-6"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
              {success}
            </div>
          )}

          {!success && !error && (
            <>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  placeholder="Min 6 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Saving..." : "Save New Password"}
              </button>
            </>
          )}

          {error && !token && (
            <div className="text-center mt-4">
              <Link to="/forgot-password" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Request a new link
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
