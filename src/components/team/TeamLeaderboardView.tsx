import React from "react";
import { useGetTeamLeaderboardQuery } from "../../store";
import {
  Trophy,
  Medal,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Users,
  Shield,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import Button from "../ui/Button";

interface TeamLeaderboardViewProps {
  baseUrl: string;
  isSuperAdmin: boolean;
  onSelectMember: (memberId: string) => void;
  onOpenTaskCreateWithAssignee?: (memberId: string, deptId?: string) => void;
}

export default function TeamLeaderboardView({
  baseUrl,
  isSuperAdmin,
  onSelectMember,
  onOpenTaskCreateWithAssignee,
}: TeamLeaderboardViewProps) {
  const { data: leaderboardRes, isLoading } = useGetTeamLeaderboardQuery(baseUrl, {
    pollingInterval: 20000,
  });

  const members: any[] = leaderboardRes?.data || [];

  const topThree = members.slice(0, 3);
  const remaining = members.slice(3);

  // Group by Capacity
  const overloadedMembers = members.filter((m) => m.capacityStatus === "OVERLOADED");
  const optimalMembers = members.filter((m) => m.capacityStatus === "OPTIMAL");
  const availableMembers = members.filter((m) => m.capacityStatus === "AVAILABLE");

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-black shadow-md">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-black shadow-md">
            🥉
          </div>
        );
      default:
        return (
          <span className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center font-mono font-bold text-xs">
            #{rank}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 🏆 PODIUM HIGHLIGHT FOR TOP 3 VELOCITY STARS */}
      {topThree.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Execution Velocity Podium</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Top performers evaluated on on-time delivery, output volume, and daily standup consistency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((m: any, idx: number) => {
              const isFirst = idx === 0;

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isFirst
                      ? "border-amber-400/80 bg-gradient-to-b from-amber-500/10 via-white to-amber-50/30 dark:from-amber-950/40 dark:via-zinc-900 dark:to-zinc-900 shadow-lg ring-2 ring-amber-400/20"
                      : "border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs hover:shadow-md hover:border-indigo-400/40"
                  }`}
                >
                  {isFirst && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black tracking-wider uppercase shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>MVP Velocity</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      {getRankBadge(m.rank)}
                      <div>
                        <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate">
                          {m.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <span>{m.role}</span>
                          {m.departmentName && (
                            <>
                              <span>•</span>
                              <span
                                className="font-bold"
                                style={{ color: m.departmentColor || "#6366f1" }}
                              >
                                {m.departmentName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Velocity Score */}
                    <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80 mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                        Velocity Score
                      </span>
                      <div className="flex items-baseline gap-1">
                        <strong className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                          {m.velocityScore}
                        </strong>
                        <span className="text-[10px] text-zinc-400 font-mono">/ 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-center text-[11px]">
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase font-mono block">Done</span>
                      <strong className="font-black text-zinc-900 dark:text-zinc-100">
                        {m.completedTasks}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase font-mono block">SLA</span>
                      <strong className="font-black text-emerald-600 dark:text-emerald-400">
                        {m.onTimeRate}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase font-mono block">Streak</span>
                      <strong className="font-black text-violet-600 dark:text-violet-400">
                        {m.standupCount}d
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ⚖️ WORKLOAD CAPACITY BALANCER (OVERLOADED vs AVAILABLE) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Workload Capacity Balancer</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time staff allocation matrix to avoid bottlenecks and prevent team burnout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Overloaded */}
          <div className="p-5 rounded-3xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200/60 dark:border-rose-900/60">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 dark:text-rose-400">
                <Flame className="w-4 h-4" />
                <span>🔥 Overloaded (5+ Tasks)</span>
              </div>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900/80 text-rose-800 dark:text-rose-300">
                {overloadedMembers.length}
              </span>
            </div>

            {overloadedMembers.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">No overloaded staff members</p>
            ) : (
              overloadedMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{m.name}</h5>
                    <p className="text-[10px] text-zinc-400">{m.departmentName || m.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600 block">{m.activeTasks} In-Flight</span>
                    <span className="text-[9px] text-zinc-400">Needs offload</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 2: Optimal */}
          <div className="p-5 rounded-3xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60 dark:border-indigo-900/60">
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-700 dark:text-indigo-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>⚡ Optimal Flow (2–4 Tasks)</span>
              </div>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300">
                {optimalMembers.length}
              </span>
            </div>

            {optimalMembers.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">No members in optimal range</p>
            ) : (
              optimalMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{m.name}</h5>
                    <p className="text-[10px] text-zinc-400">{m.departmentName || m.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
                      {m.activeTasks} In-Flight
                    </span>
                    <span className="text-[9px] text-emerald-600">Stable velocity</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 3: Available */}
          <div className="p-5 rounded-3xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 dark:border-emerald-900/60">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400">
                <Clock className="w-4 h-4" />
                <span>🟢 Available (0–1 Tasks)</span>
              </div>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300">
                {availableMembers.length}
              </span>
            </div>

            {availableMembers.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">All staff currently assigned</p>
            ) : (
              availableMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/60 shadow-2xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{m.name}</h5>
                    <p className="text-[10px] text-zinc-400">{m.departmentName || m.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                      {m.activeTasks} In-Flight
                    </span>
                    {onOpenTaskCreateWithAssignee ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTaskCreateWithAssignee(m.id, m.departmentId);
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        + Assign Task
                      </button>
                    ) : (
                      <span className="text-[9px] text-zinc-400">Ready for work</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 📊 COMPLETE LEADERBOARD TABLE */}
      <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs space-y-4">
        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
          Complete Team Performance Rankings
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-mono">
                <th className="pb-2.5 font-semibold">Rank</th>
                <th className="pb-2.5 font-semibold">Staff Member</th>
                <th className="pb-2.5 font-semibold">Squad / Department</th>
                <th className="pb-2.5 font-semibold">Velocity Score</th>
                <th className="pb-2.5 font-semibold">Tasks Completed</th>
                <th className="pb-2.5 font-semibold">On-Time SLA</th>
                <th className="pb-2.5 font-semibold">Standup Consistency</th>
                <th className="pb-2.5 font-semibold">Workload Capacity</th>
                <th className="pb-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {members.map((m: any) => (
                <tr
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 font-mono font-black">{getRankBadge(m.rank)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                        {(m.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                          {m.name}
                        </strong>
                        <span className="text-[10px] text-zinc-400 font-mono">+91 {m.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    {m.departmentName ? (
                      <span
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                        style={{
                          backgroundColor: `${m.departmentColor || "#6366f1"}15`,
                          color: m.departmentColor || "#6366f1",
                        }}
                      >
                        {m.departmentName}
                      </span>
                    ) : (
                      <span className="text-zinc-400 font-mono text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {m.velocityScore}
                      </strong>
                      <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${m.velocityScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200">
                    {m.completedTasks} tasks
                  </td>
                  <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {m.onTimeRate}%
                  </td>
                  <td className="py-3 font-bold text-violet-600 dark:text-violet-400">
                    {m.standupCount} days
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono ${
                        m.capacityStatus === "OVERLOADED"
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                          : m.capacityStatus === "OPTIMAL"
                          ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400"
                          : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {m.capacityStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMember(m.id);
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
