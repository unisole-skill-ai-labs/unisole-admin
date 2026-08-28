import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../store/auth-slice";
import { useTheme } from "../context/ThemeContext";
import {
  ShieldCheck,
  Phone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const isAuthenticated = useSelector((s: any) => s.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("+919876543210");
  const [otp, setOtp] = useState("1234");
  const [devOtp, setDevOtp] = useState<string | null>("1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      const receivedOtp = data.dummyOtp || "1234";
      setDevOtp(receivedOtp);
      setOtp(receivedOtp);
      setStep("otp");
    } catch (err: any) {
      // In mock OTP mode fallback to 1234
      setDevOtp("1234");
      setOtp("1234");
      setStep("otp");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    const submissionOtp = (otp || devOtp || "1234").trim();

    try {
      const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: submissionOtp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      if (data.user?.role !== "ADMIN") {
        throw new Error("Access denied. Administrator privileges required.");
      }

      dispatch(setCredentials({ token: data.token, user: data.user }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            Secure administrative and operations gateway
          </p>
        </div>

        {/* Mock OTP Mode Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              OTP Service in Mock Mode &bull; Default OTP: <strong>1234</strong>
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
            1234
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {devOtp && step === "otp" && (
          <button
            type="button"
            onClick={() => setOtp(devOtp)}
            className="w-full mb-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between text-left font-mono cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Default OTP: <strong>{devOtp}</strong>
            </span>
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 underline">
              Click to Auto-fill
            </span>
          </button>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Admin Mobile Number
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
              <small className="block mt-1 text-[11px] text-zinc-400 font-mono">
                Master admin: +91 9876543210 (Default OTP: 1234)
              </small>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-lg shadow-indigo-500/20"
              loading={loading}
              icon={ArrowRight}
            >
              Send Authentication Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> Change Number
                </button>
              </div>

              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                maxLength={6}
                required
                autoFocus
                icon={KeyRound}
                className="text-center font-mono text-lg tracking-widest"
              />
              <small className="block mt-1 text-[11px] text-zinc-400 font-mono">
                Enter default code <strong>1234</strong> sent to {phone}
              </small>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-lg shadow-indigo-500/20"
              loading={loading}
              disabled={!otp}
            >
              Verify & Sign In to Admin
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleSendOtp}
              disabled={loading}
              icon={RefreshCw}
            >
              Resend Code
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
