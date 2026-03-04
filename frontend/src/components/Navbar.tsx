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
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link
            to="/"
            className="font-semibold text-emerald-400 tracking-tight text-base sm:text-lg"
          >
            Wealth To FIRE
          </Link>
          <nav className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <Link to="/" className="text-slate-300 hover:text-white">
              Dashboard
            </Link>
            <Link to="/fire" className="text-slate-300 hover:text-white">
              FIRE
            </Link>
            <Link to="/chat" className="text-slate-300 hover:text-white">
              Chat
            </Link>
            <Link to="/loan-strategy" className="text-slate-300 hover:text-white">
              Loan Strategy
            </Link>
            <Link to="/loan" className="text-slate-300 hover:text-white">
              Loan Only
            </Link>
            <Link
              to="/history/fire"
              className="hidden sm:inline text-slate-300 hover:text-white"
            >
              FIRE Hist
            </Link>
            <Link
              to="/history/health"
              className="hidden md:inline text-slate-300 hover:text-white"
            >
              Health
            </Link>
            <Link
              to="/history/loans"
              className="hidden md:inline text-slate-300 hover:text-white"
            >
              Loans
            </Link>
            <span className="text-slate-500 truncate max-w-[120px] sm:max-w-[200px]">
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

