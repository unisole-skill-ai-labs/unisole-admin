import React, { useState } from "react";
import {
  useGetCompanyProgressQuery,
  useNudgeTeamMemberMutation,
} from "../../store";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Users,
  Shield,
  Layers,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Flame,
  CalendarCheck,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Button from "../ui/Button";

interface CompanyProgressViewProps {
  baseUrl: string;
  isSuperAdmin: boolean;
  onSelectMember: (memberId: string) => void;
  onSelectTask?: (task: any) => void;
  onFilterDepartment?: (deptId: string) => void;
}

export default function CompanyProgressView({
  baseUrl,
  isSuperAdmin,
  onSelectMember,
  onSelectTask,
  onFilterDepartment,
}: CompanyProgressViewProps) {
  const { data: progressRes, isLoading, refetch } = useGetCompanyProgressQuery(baseUrl, {
    pollingInterval: 20000,
  });

  const [nudgeMember] = useNudgeTeamMemberMutation();
  const [nudgingId, setNudgingId] = useState<string | null>(null);
  const [nudgeSuccessMsg, setNudgeSuccessMsg] = useState<string | null>(null);

  const progress = progressRes?.data || null;
  const kpis = progress?.kpis || null;
  const departments = progress?.departments || [];
  const activeBlockers = progress?.activeBlockers || [];
  const standupPulse = progress?.standupPulse || null;

  const handleNudgeMember = async (memberId: string, memberName: string) => {
    setNudgingId(memberId);
    try {
      await nudgeMember({
        baseUrl,
        id: memberId,
        body: { message: "Please submit your Daily EOD Standup report." },
      }).unwrap();
      setNudgeSuccessMsg(`Reminder sent to ${memberName}!`);
      setTimeout(() => setNudgeSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to send nudge");
    } finally {
      setNudgingId(null);
    }
  };

  const handleNudgeAllMissing = async () => {
    if (!standupPulse?.missingStaff || standupPulse.missingStaff.length === 0) return;
    for (const staff of standupPulse.missingStaff) {
      try {
        await nudgeMember({
          baseUrl,
          id: staff.id,
          body: { message: "Please submit your Daily EOD Standup report." },
        }).unwrap();
      } catch (err) {
        console.error("Nudge error", err);
      }
    }
    setNudgeSuccessMsg(`Sent check-in nudges to all ${standupPulse.missingStaff.length} missing staff!`);
    setTimeout(() => setNudgeSuccessMsg(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast alert for Nudge */}
      {nudgeSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{nudgeSuccessMsg}</span>
          </div>
          <button onClick={() => setNudgeSuccessMsg(null)} className="text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 🚀 TOP EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Velocity & Tasks */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              Company Task Velocity
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {kpis?.completedThisWeek || 0}
            </span>
            <span className="text-xs font-bold text-zinc-500 font-mono">done this week</span>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Active In-Flight:</span>
            <strong className="text-zinc-800 dark:text-zinc-200 font-bold">
              {kpis?.activeTasks || 0} tasks
            </strong>
          </div>
        </div>

        {/* 2. On-Time SLA Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
              On-Time SLA Delivery
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {kpis?.onTimeRate || 0}%
            </span>
            <span className="text-xs font-bold text-zinc-500 font-mono">deadline accuracy</span>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Overdue Tasks:</span>
            <strong className={`font-bold ${kpis?.overdueTasks > 0 ? "text-rose-600" : "text-zinc-800 dark:text-zinc-200"}`}>
              {kpis?.overdueTasks || 0}
            </strong>
          </div>
        </div>

        {/* 3. Daily Standup Pulse */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-violet-600 dark:text-violet-400 tracking-wider">
              Standup Compliance
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400">
              {standupPulse?.complianceRate || 0}%
            </span>
            <span className="text-xs font-bold text-zinc-500 font-mono">
              ({standupPulse?.submittedCount || 0}/{standupPulse?.totalStaffCount || 0})
            </span>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Pending Check-ins:</span>
            <strong className={`font-bold ${standupPulse?.missingCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {standupPulse?.missingCount || 0} staff
            </strong>
          </div>
        </div>

        {/* 4. Active Blockers Alert */}
        <div className={`p-5 rounded-3xl border shadow-xs space-y-2 ${
          kpis?.blockedTasks > 0
            ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900"
            : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
              Active Company Blockers
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {kpis?.blockedTasks || 0}
            </span>
            <span className="text-xs font-bold text-zinc-500 font-mono">
              {kpis?.blockedTasks === 0 ? "clear sailing" : "needs unblocking"}
            </span>
          </div>
          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Review Queue:</span>
            <strong className="text-amber-600 dark:text-amber-400 font-bold">
              {kpis?.reviewQueue || 0} tasks
            </strong>
          </div>
        </div>
      </div>

      {/* 🏢 CROSS-DEPARTMENT VELOCITY MATRIX */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Squad & Department Execution Matrix</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live capacity, completion rate, and throughput across cross-functional units.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept: any) => (
            <div
              key={dept.id}
              onClick={() => onFilterDepartment && onFilterDepartment(dept.id)}
              className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs hover:shadow-md hover:border-indigo-400/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Squad Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: dept.color || "#6366f1" }}
                    />
                    <span className="text-xs font-mono font-black text-zinc-900 dark:text-zinc-100">
                      {dept.code}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {dept.memberCount} Staff
                  </span>
                </div>

                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-1">
                  {dept.name}
                </h4>
                <p className="text-[11px] text-zinc-500 line-clamp-1 mb-3">
                  Lead: <strong className="text-zinc-800 dark:text-zinc-200">{dept.leadName || "Unassigned"}</strong>
                </p>

                {/* Progress Bar */}
                <div className="space-y-1 my-3">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Task Completion:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200 font-bold">
                      {dept.completionRate}% ({dept.completedTasks}/{dept.totalTasks})
                    </strong>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${dept.completionRate}%`,
                        backgroundColor: dept.color || "#6366f1",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60">
                  <span className="text-[9px] uppercase font-mono text-zinc-400 block font-bold">
                    In-Flight
                  </span>
                  <strong className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {dept.activeTasks}
                  </strong>
                </div>

                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60">
                  <span className="text-[9px] uppercase font-mono text-zinc-400 block font-bold">
                    Blocked
                  </span>
                  <strong className={`text-xs font-black ${dept.blockedTasks > 0 ? "text-rose-600" : "text-zinc-500"}`}>
                    {dept.blockedTasks}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚨 ACTIVE COMPANY BLOCKERS (FIRE-DRILL BOARD) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Active Company Blockers ({activeBlockers.length})
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            High priority leadership intervention queue
          </span>
        </div>

        {activeBlockers.length === 0 ? (
          <div className="p-6 text-center rounded-3xl border border-dashed border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-black">All squads operational — zero active blockers reported!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeBlockers.map((b: any) => (
              <div
                key={b.id}
                onClick={() => onSelectTask && onSelectTask(b)}
                className="p-4 rounded-3xl border border-rose-200/80 dark:border-rose-900/80 bg-rose-50/40 dark:bg-rose-950/30 backdrop-blur-md shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase font-mono bg-rose-600 text-white inline-block mb-1">
                      {b.priority} PRIORITY
                    </span>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                      {b.title}
                    </h4>
                  </div>
                  {b.departmentName && (
                    <span
                      className="px-2 py-0.5 rounded-lg text-[9px] font-bold"
                      style={{
                        backgroundColor: `${b.departmentColor || "#6366f1"}20`,
                        color: b.departmentColor || "#6366f1",
                      }}
                    >
                      {b.departmentName}
                    </span>
                  )}
                </div>

                {/* Blocker Reason Box */}
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-rose-200/60 dark:border-rose-900/60 text-xs">
                  <span className="text-[10px] uppercase font-mono font-bold text-rose-600 block mb-0.5">
                    🚨 Reason / Stuck on:
                  </span>
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                    {b.blockedReason}
                  </p>
                </div>

                {/* Footer: Assignee & Action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (b.assigneeId) onSelectMember(b.assigneeId);
                    }}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-[10px] font-black">
                      {(b.assigneeName || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 underline decoration-dotted">
                      {b.assigneeName || "Unassigned"}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono">
                    Flagged: {new Date(b.updatedAt || b.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 👥 DAILY STANDUP PULSE & MISSING STAFF ROLLUP */}
      <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-violet-600" />
              <span>Today's Standup Accountability Pulse ({standupPulse?.today})</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {standupPulse?.submittedCount} of {standupPulse?.totalStaffCount} team members checked in today ({standupPulse?.complianceRate}% completion).
            </p>
          </div>

          {standupPulse?.missingStaff && standupPulse.missingStaff.length > 0 && isSuperAdmin && (
            <Button
              onClick={handleNudgeAllMissing}
              variant="outline"
              size="sm"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              <Send className="w-3 h-3 mr-1" />
              <span>Nudge All ({standupPulse.missingStaff.length}) Missing</span>
            </Button>
          )}
        </div>

        {standupPulse?.missingStaff && standupPulse.missingStaff.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {standupPulse.missingStaff.map((s: any) => (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2"
              >
                <div
                  onClick={() => onSelectMember(s.id)}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity truncate"
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                    {(s.name || s.phone).charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                      {s.name || s.phone}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {s.departmentName || s.role}
                    </span>
                  </div>
                </div>

                {isSuperAdmin && (
                  <button
                    onClick={() => handleNudgeMember(s.id, s.name || s.phone)}
                    disabled={nudgingId === s.id}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition-colors shadow-2xs cursor-pointer shrink-0"
                  >
                    {nudgingId === s.id ? "..." : "Nudge"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-bold text-emerald-700 dark:text-emerald-400 text-center">
            🎉 100% Team Compliance! Everyone has submitted their daily standup check-in today.
          </div>
        )}
      </div>
    </div>
  );
}
