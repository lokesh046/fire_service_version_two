import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export function Navbar() {
  const { user, logoutLocal } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      logoutLocal();
      navigate("/login");
    }
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 p-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto bg-black/60 backdrop-blur-2xl border border-slate-700/50 rounded-2xl lg:rounded-full px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto transition-all">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="font-bold text-xl tracking-tight flex items-center gap-2"
            onClick={closeMenu}
          >
            <span className="text-white">Wealth</span>
            <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">FIRE</span>
          </Link>
          <button
            className="lg:hidden text-slate-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <nav className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 mt-4 lg:mt-0 text-sm font-medium pb-2 lg:pb-0`}>
          <Link to="/dashboard" onClick={closeMenu} className="text-slate-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/fire" onClick={closeMenu} className="text-slate-300 hover:text-white transition-colors">
            FIRE
          </Link>
          <Link to="/chat" onClick={closeMenu} className="text-slate-300 hover:text-white transition-colors">
            Chat
          </Link>
          <div className="hidden lg:block h-4 w-px bg-slate-700/50"></div>
          <Link to="/loan-strategy" onClick={closeMenu} className="text-slate-300 hover:text-white transition-colors">
            Loan Strategy
          </Link>
          <div className="hidden lg:block h-4 w-px bg-slate-700/50"></div>
          <Link to="/loan" onClick={closeMenu} className="text-slate-300 hover:text-white transition-colors">
            Loan Analysis
          </Link>
          <div className="hidden lg:block h-4 w-px bg-slate-700/50"></div>
          {user?.role === "admin" && (
            <Link to="/admin" onClick={closeMenu} className="text-yellow-500 hover:text-yellow-400 transition-colors font-semibold">
              Admin
            </Link>
          )}
          <span className="text-slate-400 max-w-[120px] truncate lg:ml-2 pt-2 lg:pt-0">
            {user.username}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-3d mt-2 lg:mt-0 w-full lg:w-auto"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
