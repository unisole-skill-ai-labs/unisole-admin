import React from "react";
import {
  Inbox,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

interface LeaderRadarWidgetProps {
  radar: {
    reviewQueueCount: number;
    blockedCount: number;
    overdueCount: number;
    idleMembersCount: number;
    totalActiveCount: number;
    completedTodayCount: number;
  } | null;
  activeFilter?: string;
  onFilterClick?: (filterKey: string) => void;
}

export default function LeaderRadarWidget({
  radar,
  activeFilter,
  onFilterClick,
}: LeaderRadarWidgetProps) {
  if (!radar) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Review Queue Card */}
      <button
        onClick={() => onFilterClick?.("SUBMITTED_FOR_REVIEW")}
        className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
          activeFilter === "SUBMITTED_FOR_REVIEW"
            ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
            : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Inbox className="w-4 h-4" />
          </div>
          {radar.reviewQueueCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {radar.reviewQueueCount}
          </div>
          <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center justify-between">
            <span>Review Queue</span>
            {radar.reviewQueueCount > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                Action
              </span>
            )}
          </div>
        </div>
      </button>

      {/* 2. Blocked / Stuck Card */}
      <button
        onClick={() => onFilterClick?.("BLOCKED")}
        className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
          activeFilter === "BLOCKED"
            ? "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20 shadow-md"
            : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-rose-500/40 hover:bg-rose-50/30 dark:hover:bg-rose-950/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          {radar.blockedCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          )}
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {radar.blockedCount}
          </div>
          <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            Blocked / Stuck
          </div>
        </div>
      </button>

      {/* 3. Overdue Card */}
      <button
        onClick={() => onFilterClick?.("OVERDUE")}
        className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
          activeFilter === "OVERDUE"
            ? "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20 shadow-md"
            : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-orange-500/40 hover:bg-orange-50/30 dark:hover:bg-orange-950/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {radar.overdueCount}
          </div>
          <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            Overdue Deliverables
          </div>
        </div>
      </button>

      {/* 4. Active In-Flight Tasks */}
      <button
        onClick={() => onFilterClick?.("ACTIVE")}
        className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
          activeFilter === "ACTIVE"
            ? "bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
            : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {radar.totalActiveCount}
          </div>
          <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            Active Tasks
          </div>
        </div>
      </button>

      {/* 5. Idle Team Members */}
      <div className="flex flex-col text-left p-3.5 rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {radar.idleMembersCount}
          </div>
          <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            Available Teammates
          </div>
        </div>
      </div>

      {/* 6. Completed Today */}
      <button
        onClick={() => onFilterClick?.("COMPLETED")}
        className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
          activeFilter === "COMPLETED"
            ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
            : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {radar.completedTodayCount}
          </div>
          <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            Completed Today
          </div>
        </div>
      </button>
    </div>
  );
}
