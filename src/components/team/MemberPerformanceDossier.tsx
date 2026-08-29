import React, { useState } from "react";
import {
  useGetMemberPerformanceQuery,
  useUpdateTeamMemberMutation,
  useNudgeTeamMemberMutation,
  useDeleteTeamMemberMutation,
} from "../../store";
import {
  X,
  Sparkles,
  Shield,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CalendarCheck,
  Send,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Award,
  Layers,
  Flame,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  MessageSquare,
  AlertCircle,
  FileCheck2,
  ArrowUpRight,
} from "lucide-react";
import Button from "../ui/Button";

interface MemberPerformanceDossierProps {
  memberId: string;
  baseUrl: string;
  isSuperAdmin: boolean;
  departments: any[];
  onClose: () => void;
  onOpenTaskCreateWithAssignee?: (memberId: string, deptId?: string) => void;
  onSelectTask?: (task: any) => void;
}

export default function MemberPerformanceDossier({
  memberId,
  baseUrl,
  isSuperAdmin,
  departments,
  onClose,
  onOpenTaskCreateWithAssignee,
  onSelectTask,
}: MemberPerformanceDossierProps) {
  const { data: dossierRes, isLoading, refetch } = useGetMemberPerformanceQuery(
    { baseUrl, id: memberId },
    { pollingInterval: 20000 }
  );

  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "standups" | "governance">("overview");
  const [nudgeMessage, setNudgeMessage] = useState("");
  const [isNudging, setIsNudging] = useState(false);
  const [nudgeSuccess, setNudgeSuccess] = useState<string | null>(null);

  // Edit Role / Dept State
  const [editRole, setEditRole] = useState<string>("");
  const [editDeptId, setEditDeptId] = useState<string>("");
  const [editDesignation, setEditDesignation] = useState<string>("");
  const [isSavingGovernance, setIsSavingGovernance] = useState(false);

  const [updateMember] = useUpdateTeamMemberMutation();
  const [nudgeMember] = useNudgeTeamMemberMutation();
  const [deleteMember] = useDeleteTeamMemberMutation();

  const dossier = dossierRes?.data || null;
  const member = dossier?.member || null;
  const metrics = dossier?.metrics || null;
  const tasks = dossier?.tasks || [];
  const standupLogs = dossier?.standupLogs || [];

  // Initialize edit state when member loads
  React.useEffect(() => {
    if (member) {
      setEditRole(member.role || "MEMBER");
      setEditDeptId(member.departmentId || "");
      setEditDesignation(member.designation || "");
    }
  }, [member]);

  const handleSendNudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    setIsNudging(true);
    try {
      await nudgeMember({
        baseUrl,
        id: memberId,
        body: { message: nudgeMessage.trim() || undefined },
      }).unwrap();
      setNudgeSuccess("Nudge reminder dispatched to " + (member?.name || "member"));
      setNudgeMessage("");
      setTimeout(() => setNudgeSuccess(null), 4000);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to send nudge");
    } finally {
      setIsNudging(false);
    }
  };

  const handleSaveGovernance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    setIsSavingGovernance(true);
    try {
      await updateMember({
        baseUrl,
        id: memberId,
        body: {
          role: editRole,
          departmentId: editDeptId || null,
          designation: editDesignation.trim() || null,
        },
      }).unwrap();
      alert("Member access governance updated successfully!");
      refetch();
    } catch (err: any) {
      alert(err?.data?.error || "Failed to update member");
    } finally {
      setIsSavingGovernance(false);
    }
  };

  const getVelocityBadge = (score: number) => {
    if (score >= 85) {
      return {
        label: "⚡ High Velocity Top Performer",
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900",
      };
    }
    if (score >= 60) {
      return {
        label: "🔥 Steady Execution Rate",
        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900",
      };
    }
    return {
      label: "⚠️ Needs Support & Guidance",
      color: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900",
    };
  };

  const getCapacityColor = (status: string) => {
    switch (status) {
      case "OVERLOADED":
        return "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900";
      case "OPTIMAL":
        return "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";
      default:
        return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-zinc-200/80 dark:border-zinc-800 overflow-hidden animate-slide-in-right">
        {/* TOP HEADER */}
        <div className="p-6 pb-4 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md ${
                  member?.role === "SUPER_ADMIN"
                    ? "bg-gradient-to-tr from-amber-500 to-orange-600"
                    : member?.role === "ADMIN"
                    ? "bg-gradient-to-tr from-indigo-600 to-violet-600"
                    : "bg-gradient-to-tr from-emerald-600 to-teal-600"
                }`}
              >
                {(member?.name || member?.phone || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {member?.name || "Team Member"}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono tracking-wider ${
                      member?.role === "SUPER_ADMIN"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        : member?.role === "ADMIN"
                        ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300"
                        : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    {member?.role || "MEMBER"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-500">
                  <span className="font-mono">+91 {member?.phone}</span>
                  {member?.departmentName && (
                    <>
                      <span>•</span>
                      <span
                        className="font-bold px-2 py-0.2 rounded-md"
                        style={{
                          backgroundColor: `${member?.departmentColor || "#6366f1"}15`,
                          color: member?.departmentColor || "#6366f1",
                        }}
                      >
                        {member?.departmentName}
                      </span>
                    </>
                  )}
                  {member?.designation && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                        {member?.designation}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => refetch()}
                className="p-2 rounded-xl text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Refresh Dossier Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 mt-5 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              360° Overview
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "tasks"
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>Tasks & Proofs</span>
              <span className="px-1.5 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-700 text-[10px]">
                {tasks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("standups")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "standups"
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>EOD Standups</span>
              <span className="px-1.5 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-700 text-[10px]">
                {standupLogs.length}
              </span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("governance")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === "governance"
                    ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                Governance & Role
              </button>
            )}
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
            </div>
          ) : !dossier ? (
            <div className="p-8 text-center text-zinc-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Member performance data unavailable</p>
            </div>
          ) : activeTab === "overview" ? (
            /* =================== TAB 1: 360° OVERVIEW =================== */
            <div className="space-y-6">
              {/* Velocity Score Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Execution Velocity Index
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                      {metrics?.velocityScore || 0}
                    </span>
                    <span className="text-sm font-bold text-zinc-400 font-mono">/ 100</span>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                      getVelocityBadge(metrics?.velocityScore || 0).color
                    }`}
                  >
                    {getVelocityBadge(metrics?.velocityScore || 0).label}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase font-mono border ${getCapacityColor(
                      metrics?.capacityStatus
                    )}`}
                  >
                    {metrics?.capacityStatus === "OVERLOADED"
                      ? "🔥 Capacity Overloaded"
                      : metrics?.capacityStatus === "OPTIMAL"
                      ? "⚡ Optimal Workload"
                      : "🟢 Available For Tasks"}
                  </span>
                  {onOpenTaskCreateWithAssignee && (
                    <Button
                      onClick={() => onOpenTaskCreateWithAssignee(member.id, member.departmentId)}
                      variant="primary"
                      className="text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign New Task</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* 4 Core KPI Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-1">
                    On-Time SLA
                  </span>
                  <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">
                    {metrics?.onTimeRate || 0}%
                  </strong>
                  <span className="text-[10px] text-zinc-400">Punctual completion</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-1">
                    1st-Pass Quality
                  </span>
                  <strong className="text-xl font-black text-indigo-600 dark:text-indigo-400 block">
                    {metrics?.firstPassApprovalRate || 0}%
                  </strong>
                  <span className="text-[10px] text-zinc-400">Zero rework rate</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-1">
                    Tasks Delivered
                  </span>
                  <strong className="text-xl font-black text-zinc-900 dark:text-zinc-100 block">
                    {metrics?.completedCount || 0}
                  </strong>
                  <span className="text-[10px] text-zinc-400">
                    of {metrics?.totalAssigned || 0} total
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-1">
                    Standup Logs
                  </span>
                  <strong className="text-xl font-black text-violet-600 dark:text-violet-400 block">
                    {metrics?.standupCount || 0}
                  </strong>
                  <span className="text-[10px] text-zinc-400">Days logged (30d)</span>
                </div>
              </div>

              {/* Task Workload Distribution Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-3">
                  Current Pipeline Breakdown
                </h4>
                <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400 block">
                      {metrics?.activeCount || 0}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">In-Flight</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 block">
                      {metrics?.reviewCount || 0}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">In Review</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
                    <span className="text-base font-black text-rose-600 dark:text-rose-400 block">
                      {metrics?.blockedCount || 0}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">Blocked</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                      {metrics?.completedCount || 0}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">Finished</span>
                  </div>
                </div>
              </div>

              {/* Quick Nudge / Praise Dispatch */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Send Leadership Nudge or Feedback</span>
                </h4>
                {nudgeSuccess && (
                  <div className="p-2.5 mb-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{nudgeSuccess}</span>
                  </div>
                )}
                <form onSubmit={handleSendNudge} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Please log today's EOD or update progress on the presentation deck..."
                    value={nudgeMessage}
                    onChange={(e) => setNudgeMessage(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                  <Button type="submit" variant="primary" disabled={isNudging} className="text-xs">
                    {isNudging ? "Sending..." : "Nudge"}
                  </Button>
                </form>
              </div>
            </div>
          ) : activeTab === "tasks" ? (
            /* =================== TAB 2: TASKS & PROOFS =================== */
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                  <FileCheck2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No assigned tasks on record</p>
                </div>
              ) : (
                tasks.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask && onSelectTask(t)}
                    className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xs hover:shadow-md hover:border-indigo-400/40 transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                          {t.title}
                        </h4>
                        {t.description && (
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                            {t.description}
                          </p>
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase font-mono ${
                          t.status === "COMPLETED"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                            : t.status === "BLOCKED"
                            ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                            : t.status === "SUBMITTED_FOR_REVIEW"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                            : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    {/* Subtask Progress Bar if any */}
                    {t.subtasksCount > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                          <span>Checklist Progress:</span>
                          <span>
                            {t.subtasksCompleted} / {t.subtasksCount} (
                            {Math.round((t.subtasksCompleted / t.subtasksCount) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{
                              width: `${(t.subtasksCompleted / t.subtasksCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Proof URL / Blocked Reason snippet */}
                    {t.submissionProofUrl && (
                      <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{t.submissionProofUrl}</span>
                      </div>
                    )}

                    {t.blockedReason && (
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-[11px] text-rose-700 dark:text-rose-300">
                        <strong>Blocker:</strong> {t.blockedReason}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
                      <span>Priority: {t.priority}</span>
                      <span>
                        {t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : "No Due Date"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === "standups" ? (
            /* =================== TAB 3: EOD STANDUP HISTORY =================== */
            <div className="space-y-4">
              {standupLogs.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                  <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No daily standup logs submitted yet</p>
                </div>
              ) : (
                standupLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        📅 {new Date(log.logDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {log.hoursSpent || 8} hrs logged
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <strong className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 block">
                        ✅ Completed Today:
                      </strong>
                      <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        {log.completedSummary}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <strong className="text-[10px] font-mono uppercase text-indigo-600 dark:text-indigo-400 block">
                        📌 Plan For Tomorrow:
                      </strong>
                      <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        {log.planTomorrow}
                      </p>
                    </div>

                    {log.blockers && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
                        <strong className="block text-[10px] font-mono uppercase font-bold text-rose-600 mb-0.5">
                          🚨 Blocker:
                        </strong>
                        <p>{log.blockers}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* =================== TAB 4: GOVERNANCE & ACCESS =================== */
            <form onSubmit={handleSaveGovernance} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-amber-900 dark:text-amber-300">
                <h4 className="font-black flex items-center gap-1.5 mb-1">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Super Admin Role & Squad Governance</span>
                </h4>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400">
                  Update role permissions, assign to functional departments, or change organizational designations.
                </p>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  System Access Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                >
                  <option value="MEMBER">MEMBER (Staff / Intern / Learner)</option>
                  <option value="ADMIN">ADMIN (Department Lead / Manager)</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN (Founders / Leadership)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Squad / Department
                </label>
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                >
                  <option value="">No Department Assigned</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  placeholder="e.g. Lead Operations Director"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <Button type="submit" variant="primary" disabled={isSavingGovernance}>
                  {isSavingGovernance ? "Saving Changes..." : "Save Governance Settings"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
