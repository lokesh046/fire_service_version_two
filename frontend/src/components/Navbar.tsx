import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export function Navbar() {
  const { user, logoutLocal } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      logoutLocal();
      navigate("/login");
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto glass rounded-full px-6 py-3 flex items-center justify-between shadow-lg">
        <Link
          to="/dashboard"
          className="font-bold text-lg tracking-tight"
        >
          <span className="text-white">Wealth To </span>
          <span className="text-emerald-400">FIRE</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/fire" className="text-slate-300 hover:text-white transition-colors">
            FIRE
          </Link>
          <Link to="/chat" className="text-slate-300 hover:text-white transition-colors">
            Chat
          </Link>
          <div className="h-4 w-px bg-slate-700/50"></div>
          <Link to="/loan-strategy" className="text-slate-300 hover:text-white transition-colors">
            Loan Strategy
          </Link>
          <div className="h-4 w-px bg-slate-700/50"></div>
          <Link to="/loan" className="text-slate-300 hover:text-white transition-colors">
            Loan Analysis
          </Link>
          <div className="h-4 w-px bg-slate-700/50"></div>
          {user?.role === "admin" && (
            <Link to="/admin" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Admin
            </Link>
          )}
          <span className="text-slate-500 max-w-[120px] truncate ml-2">
            {user.username}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors bg-slate-800/50 hover:bg-slate-800 px-4 py-1.5 rounded-full"
          >
            Logout
          </button>
        </nav>
        {/* Mobile menu could go here, omitting for brevity to focus on design */}
      </div>
    </header>
  );
}

