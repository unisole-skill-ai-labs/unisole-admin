import React, { useEffect, useState, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/auth-slice";
import { useTheme } from "../../context/ThemeContext";
import { useGetLeaderRadarQuery } from "../../store";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  GraduationCap,
  Users,
  CreditCard,
  LogOut,
  Shield,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  CheckSquare,
  UsersRound,
  FileCheck2,
  CalendarCheck,
  Folder,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function AdminShell() {
  const user = useSelector((s: any) => s.auth.user);
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const { data: radarRes } = useGetLeaderRadarQuery(baseUrl, {
    pollingInterval: 30000,
  });
  const radar = radarRes?.data || null;

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN" || isSuperAdmin;
  const isMember = user?.role === "MEMBER";

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased transition-colors duration-200">
      {/* Topbar Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 h-16 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
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
        </div>

        {/* Right: Theme Toggle, Admin User Profile */}
        <div className="flex items-center gap-2.5">
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
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs ${
                  isSuperAdmin
                    ? "bg-gradient-to-tr from-amber-500 to-orange-600"
                    : isMember
                    ? "bg-gradient-to-tr from-emerald-600 to-teal-600"
                    : "bg-gradient-to-tr from-indigo-600 to-violet-600"
                }`}
              >
                {(user?.name || user?.phone || "A").charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate leading-tight">
                  {user?.name || "Team Member"}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold ${
                    isSuperAdmin
                      ? "text-amber-500"
                      : isMember
                      ? "text-emerald-500"
                      : "text-indigo-500"
                  }`}
                >
                  {user?.role || "MEMBER"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 p-1.5 animate-fade-in z-50">
                <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {user?.name || "Internal Staff"}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                    {user?.phone ? `+91 ${user.phone}` : "Platform Account"}
                  </p>
                  <span
                    className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isSuperAdmin
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                        : isMember
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                        : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400"
                    }`}
                  >
                    {isSuperAdmin
                      ? "SUPER ADMIN"
                      : isMember
                      ? "TEAM MEMBER"
                      : "TEAM LEAD"}
                  </span>
                </div>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => dispatch(logout())}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
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
          {/* WorkSole Operational Suite */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-2 flex items-center justify-between">
              <span>WorkSole Suite</span>
              {radar?.blockedCount ? (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              ) : null}
            </div>

            {/* 1. WorkSole All-in-One Canvas */}
            <NavLink
              to="/worksole"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive || location.pathname.startsWith("/worksole")
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs font-black"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`
              }
            >
              <Folder className="w-4 h-4 text-indigo-500" />
              <span>WorkSole</span>
            </NavLink>

            {/* 2. Calendar */}
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs font-black"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`
              }
            >
              <CalendarCheck className="w-4 h-4 text-purple-500" />
              <span>Calendar</span>
            </NavLink>

            {/* 3. Team */}
            <NavLink
              to="/team"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs font-black"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`
              }
            >
              <UsersRound className="w-4 h-4 text-teal-500" />
              <span>Team</span>
            </NavLink>
          </div>

          {/* Platform Operations */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-2">
              Platform & Content
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

          {/* Campus Ecosystem & Entities */}
          {!isMember && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-2">
                Campus Ecosystem
              </div>

              <NavLink
                to="/colleges"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive || location.pathname.startsWith("/colleges")
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>Colleges & Campuses</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                  HUB
                </span>
              </NavLink>

              <NavLink
                to="/presentations"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive || location.pathname.startsWith("/presentations/analytics")
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`
                }
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Roadshow Decks</span>
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
          )}

          {/* Finance & Ledger (Super Admin & Admin Only) */}
          {isAdmin && (
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
          )}
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

