import React, { useEffect, useState, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setBaseUrl } from "../../store";
import { logout } from "../../store/auth-slice";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  GraduationCap,
  Users,
  CreditCard,
  LogOut,
  Shield,
  Server,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Settings,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function AdminShell() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const user = useSelector((s: any) => s.auth.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [baseInput, setBaseInput] = useState(baseUrl);
  const [health, setHealth] = useState<{ ok: boolean; data?: any; error?: string } | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkHealth = () => {
      fetch(`${baseUrl}/health`)
        .then((response) => response.json())
        .then((data) => {
          if (!cancelled) setHealth({ ok: true, data });
        })
        .catch((error) => {
          if (!cancelled) setHealth({ ok: false, error: String(error) });
        });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 20000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [baseUrl]);

  const handleUpdateUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = baseInput.trim().replace(/\/+$/, "") || "http://localhost:3000";
    dispatch(setBaseUrl(cleanUrl));
    setUrlModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased transition-colors duration-200">
      {/* Topbar Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 h-16 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Mobile Toggle & Brand & Engine Status */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/hehmsemf/image/upload/f_auto,q_auto,w_64/v1785299421/Unisole_logo_new_mhqbma.png"
              alt="Unisole Logo"
              className="w-8 h-8 rounded-lg object-contain shadow-xs"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
                Unisole <span className="text-indigo-600 dark:text-indigo-400">Admin</span>
              </span>
              <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5 hidden sm:block">
                Operations Console
              </span>
            </div>
          </div>

          {/* Engine Health Indicator */}
          <div
            onClick={() => setUrlModalOpen(true)}
            className="cursor-pointer ml-2 hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-102 bg-zinc-50 dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800"
            title="Click to configure backend API base URL"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                !health
                  ? "bg-amber-400 animate-pulse"
                  : health.ok
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-rose-500"
              }`}
            />
            <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-mono">
              {!health ? "Connecting..." : health.ok ? "Engine Online" : "Engine Offline"}
            </span>
          </div>
        </div>

        {/* Right: API URL, Theme Toggle, Admin User Profile */}
        <div className="flex items-center gap-2.5">
          {/* API URL Config Button */}
          <button
            onClick={() => setUrlModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800 transition-colors font-mono"
            title="Configure Backend API URL"
          >
            <Server className="w-3.5 h-3.5 text-indigo-500" />
            <span className="max-w-[130px] truncate">{baseUrl}</span>
            <Settings className="w-3 h-3 text-zinc-400" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Admin User Tag & Menu */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors border border-zinc-200/80 dark:border-zinc-800"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {(user?.name || user?.phone || "A").charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate leading-tight">
                  {user?.name || "Admin"}
                </span>
                <span className="text-[9px] text-zinc-400 font-mono">ADMIN</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 p-1.5 animate-fade-in z-50">
                <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                    {user?.phone ? `+91 ${user.phone}` : "Platform Master"}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold">
                    ADMINISTRATOR
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setUrlModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <Server className="w-4 h-4 text-indigo-500" />
                    <span>API Endpoint Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => dispatch(logout())}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar and Outlet */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-30 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-6 overflow-y-auto lg:static lg:block transition-transform duration-300 ${
            mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Nav Group 1 */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-2">
              Platform Operations
            </div>

            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </NavLink>

            <NavLink
              to="/pathways"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`
              }
            >
              <Compass className="w-4 h-4" />
              <span>Pathways Manager</span>
            </NavLink>

            <NavLink
              to="/curriculum"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`
              }
            >
              <BookOpen className="w-4 h-4" />
              <span>Curriculum & Content</span>
            </NavLink>
          </div>

          {/* Nav Group 2 */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-2">
              Entities & Governance
            </div>

            <NavLink
              to="/metadata"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`
              }
            >
              <GraduationCap className="w-4 h-4" />
              <span>Colleges & Categories</span>
            </NavLink>

            <NavLink
              to="/students"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`
              }
            >
              <Users className="w-4 h-4" />
              <span>Learners & Enrollments</span>
            </NavLink>
          </div>

          {/* Nav Group 3 */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-2">
              Finance & Ledger
            </div>

            <NavLink
              to="/payments"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`
              }
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing & Payments</span>
            </NavLink>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Backend API Base URL Config Modal */}
      <Modal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        title="Configure Backend Engine Endpoint"
      >
        <form onSubmit={handleUpdateUrl} className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Update the REST API endpoint used by this admin console to communicate with the Unisole Engine.
          </p>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              API Base URL
            </label>
            <input
              type="url"
              value={baseInput}
              onChange={(e) => setBaseInput(e.target.value)}
              placeholder="http://localhost:3000"
              required
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
            <span>Status:</span>
            <span className={`font-mono font-bold ${health?.ok ? "text-emerald-500" : "text-rose-500"}`}>
              {health?.ok ? "Live & Reachable" : "Unreachable / Offline"}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUrlModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save & Reconnect
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
