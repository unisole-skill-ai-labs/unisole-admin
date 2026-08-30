import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../store/auth-slice";
import { useTheme } from "../context/ThemeContext";
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const isAuthenticated = useSelector((s: any) => s.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [phone, setPhone] = useState("+919876543210");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/tasks", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      if (!["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(data.user?.role)) {
        throw new Error("Access denied. Internal staff privileges required.");
      }

      dispatch(setCredentials({ token: data.token, user: data.user }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (phoneNumber: string) => {
    setPhone(`+91${phoneNumber}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-zinc-50 via-zinc-100 to-indigo-50/30 dark:from-zinc-950 dark:via-black dark:to-zinc-950 relative overflow-hidden">
      {/* Theme Toggle in Corner */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-all cursor-pointer"
        title="Toggle Dark/Light Mode"
      >
        {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
      </button>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md p-6 sm:p-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Unisole Admin Console
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Operations, Team Management & Platform Console
          </p>
        </div>

        {/* Quick Demo Profile Chips */}
        <div className="mb-5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-2">
            ⚡ 1-Click Demo Profiles:
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-left">
            <button
              type="button"
              onClick={() => handleQuickSelect("9876543210")}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:border-amber-500 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-bold truncate">Girish (Super)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect("9816012345")}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:border-amber-500 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-bold truncate">Ajay Mokta (Super)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect("9811122233")}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:border-indigo-500 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="font-bold truncate">Priya (Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect("9844455566")}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:border-emerald-500 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold truncate">Sneha (Member)</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Staff Mobile Number
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-800 pr-2 font-mono">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={phone.replace(/^\+91/, "")}
                onChange={(e) => setPhone(`+91${e.target.value.replace(/\D/g, "")}`)}
                placeholder="9876543210"
                required
                autoFocus
                className="w-full pl-20 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-lg shadow-indigo-500/20"
            loading={loading}
            icon={ArrowRight}
          >
            Sign In to Admin
          </Button>
        </form>
      </div>
    </div>
  );
}
