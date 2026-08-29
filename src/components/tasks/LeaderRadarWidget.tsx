import React from "react";
import {
  Inbox,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  X,
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
    <div className="mb-6">
      {/* Top Title Bar if active filter */}
      {activeFilter && (
        <div className="flex items-center justify-between mb-2.5 px-1 animate-fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Filtering by:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {activeFilter.replace(/_/g, " ")}
              <button
                onClick={() => onFilterClick?.("")}
                className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                title="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
          <button
            onClick={() => onFilterClick?.("")}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Show All Tasks
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Review Queue Card */}
        <button
          onClick={() => onFilterClick?.(activeFilter === "SUBMITTED_FOR_REVIEW" ? "" : "SUBMITTED_FOR_REVIEW")}
          className={`group relative flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
            activeFilter === "SUBMITTED_FOR_REVIEW"
              ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
              : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800 hover:border-amber-400 hover:shadow-md hover:bg-amber-50/20 dark:hover:bg-amber-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
            {radar.reviewQueueCount > 0 && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            )}
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-baseline gap-1.5">
              <span>{radar.reviewQueueCount}</span>
              {radar.reviewQueueCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 uppercase">
                  Action
                </span>
              )}
            </div>
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
              Review Queue
            </div>
          </div>
        </button>

        {/* 2. Blocked / Stuck Card */}
        <button
          onClick={() => onFilterClick?.(activeFilter === "BLOCKED" ? "" : "BLOCKED")}
          className={`group relative flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
            activeFilter === "BLOCKED"
              ? "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/10"
              : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800 hover:border-rose-400 hover:shadow-md hover:bg-rose-50/20 dark:hover:bg-rose-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            {radar.blockedCount > 0 && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
            )}
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight flex items-baseline gap-1.5">
              <span>{radar.blockedCount}</span>
              {radar.blockedCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 uppercase">
                  Alert
                </span>
              )}
            </div>
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
              Blocked / Stuck
            </div>
          </div>
        </button>

        {/* 3. Overdue Card */}
        <button
          onClick={() => onFilterClick?.(activeFilter === "OVERDUE" ? "" : "OVERDUE")}
          className={`group relative flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
            activeFilter === "OVERDUE"
              ? "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10"
              : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800 hover:border-orange-400 hover:shadow-md hover:bg-orange-50/20 dark:hover:bg-orange-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            {radar.overdueCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400">
                Late
              </span>
            )}
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
          onClick={() => onFilterClick?.(activeFilter === "ACTIVE" ? "" : "ACTIVE")}
          className={`group relative flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
            activeFilter === "ACTIVE"
              ? "bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
              : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
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
        <div className="flex flex-col text-left p-3.5 rounded-2xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Capacity
            </span>
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
          onClick={() => onFilterClick?.(activeFilter === "COMPLETED" ? "" : "COMPLETED")}
          className={`group relative flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
            activeFilter === "COMPLETED"
              ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10"
              : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            {radar.completedTodayCount > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Today
              </span>
            )}
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
    </div>
  );
}
