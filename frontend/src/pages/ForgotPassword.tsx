import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const data = await resetPassword({ email, new_password: newPassword });
            setSuccess(data.message || "Password reset successfully. Redirecting to login...");
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 3000);
        } catch (err: unknown) {
            const msg =
                err &&
                typeof err === "object" &&
                "response" in err &&
                (err as { response?: { data?: { detail?: string } } }).response?.data
                    ?.detail;
            setError(
                Array.isArray(msg) ? msg[0] : String(msg ?? "Password reset failed. Please check your email and try again."),
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">
                        Reset Password
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Enter your registered email and a new password
                    </p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5"
                >
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                            {success}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-200 mb-1"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="new-password"
                                className="block text-sm font-medium text-slate-200 mb-1"
                            >
                                New Password
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                placeholder="Enter your new password"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !!success}
                        className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                    <div className="flex justify-between items-center text-sm">
                        <Link to="/login" className="text-emerald-400 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
