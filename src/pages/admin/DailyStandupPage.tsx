import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetDailyLogsQuery,
  useSubmitDailyLogMutation,
} from "../../store";
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Calendar,
  Sparkles,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { DatePicker } from "../../components/ui/DatePicker";
import DailyEodModal from "../../components/tasks/DailyEodModal";

export default function DailyStandupPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isEodModalOpen, setIsEodModalOpen] = useState(false);

  const { data: logsRes, isLoading } = useGetDailyLogsQuery({
    baseUrl,
    date: selectedDate,
  });
  const logs = logsRes?.data || [];

  const [submitDailyLog] = useSubmitDailyLogMutation();

  const handleEodSubmit = async (data: any) => {
    try {
      await submitDailyLog({
        baseUrl,
        body: {
          ...data,
          logDate: selectedDate,
        },
      }).unwrap();
      setIsEodModalOpen(false);
      alert("EOD Standup log submitted successfully!");
    } catch (err: any) {
      alert(err?.data?.error || "Failed to submit daily log");
    }
  };

  const userSubmittedToday = logs.some((l: any) => l.userId === currentUser?.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <span>Daily Standup & EOD Logs</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-mono">
              {logs.length} Submitted
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            1-minute end-of-day alignment logs to eliminate random work and capture blockers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsEodModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2 text-xs font-black shadow-md shadow-indigo-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{userSubmittedToday ? "Update My EOD" : "+ Submit EOD Log"}</span>
          </Button>
        </div>
      </div>

      {/* Date Switcher & Submission Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        {/* Quick Date Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDate === todayStr
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(yesterdayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDate === yesterdayStr
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            Yesterday
          </button>
          <DatePicker
            value={selectedDate}
            onChange={(val) => setSelectedDate(val)}
            placeholder="Pick date..."
            size="sm"
            className="w-44"
          />
        </div>

        {/* User Submission Status */}
        <div className="flex items-center gap-2">
          {userSubmittedToday ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60">
              <CheckCircle2 className="w-4 h-4" />
              <span>You logged your check-in</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/60 dark:border-amber-900/60">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Your EOD is pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Logs Feed */}
      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
            No Standup Logs For {selectedDate}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Be the first to submit your 1-minute daily accountability check-in!
          </p>
          <Button
            onClick={() => setIsEodModalOpen(true)}
            variant="primary"
            className="text-xs font-bold shadow-md shadow-indigo-600/20"
          >
            Submit EOD Log Now
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log: any) => (
            <div
              key={log.id}
              className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs space-y-4 hover:shadow-md transition-all"
            >
              {/* Member Top Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {(log.userName || log.userPhone || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {log.userName || "Team Member"}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <span className="font-mono">{log.userRole}</span>
                      {log.departmentName && (
                        <>
                          <span>•</span>
                          <span
                            className="font-bold"
                            style={{ color: log.departmentColor || "#6366f1" }}
                          >
                            {log.departmentName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-zinc-400">
                  {new Date(log.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Completed Section */}
              <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                  ✅ Completed Today:
                </span>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {log.completedSummary}
                </p>
              </div>

              {/* Tomorrow's Plan */}
              <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  📌 Tomorrow's Plan:
                </span>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {log.planTomorrow}
                </p>
              </div>

              {/* Blockers (If any) */}
              {log.blockers && (
                <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-rose-700 dark:text-rose-400 block">
                      Blocker / Need Help:
                    </span>
                    <p className="text-xs text-rose-950 dark:text-rose-200 font-medium mt-0.5">
                      {log.blockers}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Standup EOD Modal */}
      <DailyEodModal
        isOpen={isEodModalOpen}
        onClose={() => setIsEodModalOpen(false)}
        onSubmit={handleEodSubmit}
      />
    </div>
  );
}
