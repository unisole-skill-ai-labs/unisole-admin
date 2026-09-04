import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Send,
  Sparkles,
  Calendar,
  Layers,
  Folder,
  ArrowRight,
  ExternalLink,
  Filter,
  FileCheck2,
  PhoneCall,
  PhoneForwarded,
  Users,
  GraduationCap,
  Building2,
  ChevronDown,
  Check,
  Search,
  UserCheck,
  Flame,
  RefreshCw,
  ListTodo,
  CalendarCheck,
  ShieldCheck,
  MessageSquare,
  Tag,
  AlertCircle,
} from "lucide-react";
import {
  useGetMyWorkSummaryQuery,
  useUpdateTaskMutation,
  useToggleSubtaskMutation,
  useSubmitDailyLogMutation,
  useLogLeadCallMutation,
  useUpdateLeadMutation,
  useGetDepartmentsQuery,
} from "../../store";
import { TaskItem, TaskSubtask } from "../../types";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import Modal from "../../components/ui/Modal";
import { cn } from "../../lib/utils";

interface MyWorkPageProps {
  baseUrl: string;
}

export const MyWorkPage: React.FC<MyWorkPageProps> = ({ baseUrl }) => {
  const currentUser = useSelector((s: any) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // Super Admin Executive Switcher
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>("");

  // Tab State: "TASKS" | "LEADS" | "STANDUP"
  const [activeTab, setActiveTab] = useState<"TASKS" | "LEADS" | "STANDUP">("TASKS");

  // Tasks Filter & Drawer
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("ACTIVE");
  const [taskSearch, setTaskSearch] = useState<string>("");
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<TaskItem | null>(null);

  // Leads Filter & Search
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("ALL");
  const [leadSearch, setLeadSearch] = useState<string>("");

  // Modals State
  const [isEodModalOpen, setIsEodModalOpen] = useState(false);
  const [eodCompletedSummary, setEodCompletedSummary] = useState("");
  const [eodPlanTomorrow, setEodPlanTomorrow] = useState("");
  const [eodBlockers, setEodBlockers] = useState("");

  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [taskToBlock, setTaskToBlock] = useState<TaskItem | null>(null);
  const [blockedReasonText, setBlockedReasonText] = useState("");

  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState<TaskItem | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofNotes, setProofNotes] = useState("");

  // Log Call Modal State
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<any | null>(null);
  const [callOutcome, setCallOutcome] = useState<string>("CONNECTED_INTERESTED");
  const [callNotes, setCallNotes] = useState("");
  const [callNextFollowUp, setCallNextFollowUp] = useState("");

  // Queries & Mutations
  const { data: summaryRes, isLoading, isFetching, refetch } = useGetMyWorkSummaryQuery({
    baseUrl,
    userId: isSuperAdmin && selectedTeamMemberId ? selectedTeamMemberId : undefined,
  });

  const { data: deptsData } = useGetDepartmentsQuery(baseUrl);
  const departments = deptsData?.data || [];

  const [updateTask] = useUpdateTaskMutation();
  const [toggleSubtask] = useToggleSubtaskMutation();
  const [submitDailyLog, { isLoading: isSubmittingEod }] = useSubmitDailyLogMutation();
  const [logLeadCall, { isLoading: isLoggingCall }] = useLogLeadCallMutation();
  const [updateLead] = useUpdateLeadMutation();

  const summaryData = summaryRes?.data || null;
  const targetUser = summaryData?.targetUser || currentUser;
  const metrics = summaryData?.metrics || {
    activeTasksCount: 0,
    blockedTasksCount: 0,
    overdueTasksCount: 0,
    completedTasksCount: 0,
    completedThisWeekCount: 0,
    assignedLeadsCount: 0,
    callbacksDueTodayCount: 0,
    hasSubmittedTodayEod: false,
  };

  const allTasks: TaskItem[] = summaryData?.tasks || [];
  const allLeads: any[] = summaryData?.leads || [];
  const todayEod = summaryData?.todayEod || null;
  const eodHistory: any[] = summaryData?.eodHistory || [];
  const teamMembers: any[] = summaryData?.teamMembers || [];

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      if (taskStatusFilter === "ACTIVE") return t.status !== "COMPLETED";
      if (taskStatusFilter === "URGENT")
        return t.status !== "COMPLETED" && (t.priority === "URGENT" || t.priority === "HIGH");
      if (taskStatusFilter === "BLOCKED") return t.status === "BLOCKED";
      if (taskStatusFilter === "COMPLETED") return t.status === "COMPLETED";
      return true;
    });
  }, [allTasks, taskStatusFilter, taskSearch]);

  // Filter Leads
  const filteredLeads = useMemo(() => {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return allLeads.filter((l) => {
      if (leadSearch.trim()) {
        const q = leadSearch.toLowerCase();
        const matchName = l.name?.toLowerCase().includes(q);
        const matchPhone = l.phone?.toLowerCase().includes(q);
        const matchClg = l.collegeName?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchClg) return false;
      }

      if (leadStatusFilter === "DUE_TODAY") {
        return (
          l.nextCallAt &&
          new Date(l.nextCallAt) <= endOfToday &&
          !["CONVERTED", "LOST", "JUNK", "NOT_A_LEAD"].includes(l.status)
        );
      }
      if (leadStatusFilter === "NEW") return l.status === "NEW";
      if (leadStatusFilter === "FOLLOW_UP")
        return l.status === "FOLLOW_UP_SCHEDULED" || l.status === "ATTEMPTED";
      if (leadStatusFilter === "INTERESTED")
        return l.status === "INTERESTED" || l.status === "DEMO_GIVEN";
      if (leadStatusFilter === "CONVERTED") return l.status === "CONVERTED";

      return true;
    });
  }, [allLeads, leadStatusFilter, leadSearch]);

  // Task Actions Handlers
  const handleSubtaskToggle = async (e: React.MouseEvent, taskId: string, subtask: TaskSubtask) => {
    e.stopPropagation();
    try {
      await toggleSubtask({
        baseUrl,
        taskId,
        subtaskId: subtask.id,
        isCompleted: !subtask.isCompleted,
      }).unwrap();
    } catch (err) {
      console.error("Subtask toggle error:", err);
    }
  };

  const handleQuickStatusChange = async (task: TaskItem, newStatus: string) => {
    try {
      await updateTask({
        baseUrl,
        id: task.id,
        body: { status: newStatus },
      }).unwrap();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleOpenBlockModal = (e: React.MouseEvent, task: TaskItem) => {
    e.stopPropagation();
    setTaskToBlock(task);
    setBlockedReasonText("");
    setIsBlockedModalOpen(true);
  };

  const handleConfirmBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToBlock || !blockedReasonText.trim()) return;

    try {
      await updateTask({
        baseUrl,
        id: taskToBlock.id,
        body: {
          status: "BLOCKED",
          blockedReason: blockedReasonText.trim(),
        },
      }).unwrap();
      setIsBlockedModalOpen(false);
      setTaskToBlock(null);
    } catch (err) {
      console.error("Block task error:", err);
    }
  };

  const handleOpenProofModal = (e: React.MouseEvent, task: TaskItem) => {
    e.stopPropagation();
    setTaskToSubmit(task);
    setProofUrl(task.submissionProofUrl || "");
    setProofNotes(task.submissionNotes || "");
    setIsProofModalOpen(true);
  };

  const handleConfirmProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToSubmit) return;

    try {
      await updateTask({
        baseUrl,
        id: taskToSubmit.id,
        body: {
          status: "SUBMITTED_FOR_REVIEW",
          submissionProofUrl: proofUrl.trim() || undefined,
          submissionNotes: proofNotes.trim() || undefined,
        },
      }).unwrap();
      setIsProofModalOpen(false);
      setTaskToSubmit(null);
    } catch (err) {
      console.error("Submit proof error:", err);
    }
  };

  // EOD Standup Handler
  const handleEodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eodCompletedSummary.trim() || !eodPlanTomorrow.trim()) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    try {
      await submitDailyLog({
        baseUrl,
        body: {
          logDate: todayStr,
          completedSummary: eodCompletedSummary.trim(),
          planTomorrow: eodPlanTomorrow.trim(),
          blockers: eodBlockers.trim() || undefined,
        },
      }).unwrap();

      setIsEodModalOpen(false);
      setEodCompletedSummary("");
      setEodPlanTomorrow("");
      setEodBlockers("");
      refetch();
    } catch (err) {
      console.error("Submit EOD error:", err);
    }
  };

  // Log Call Handler
  const handleOpenLogCall = (lead: any) => {
    setSelectedLeadForCall(lead);
    setCallOutcome("CONNECTED_INTERESTED");
    setCallNotes("");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    setCallNextFollowUp(tomorrow.toISOString().slice(0, 16));
    setIsLogCallModalOpen(true);
  };

  const handleConfirmLogCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForCall) return;

    try {
      await logLeadCall({
        baseUrl,
        leadId: selectedLeadForCall.id,
        body: {
          outcome: callOutcome,
          notes: callNotes.trim() || undefined,
          nextFollowUpAt: callNextFollowUp ? new Date(callNextFollowUp).toISOString() : undefined,
        },
      }).unwrap();

      setIsLogCallModalOpen(false);
      setSelectedLeadForCall(null);
      refetch();
    } catch (err) {
      console.error("Log call error:", err);
    }
  };

  const handleQuickLeadStatusChange = async (leadId: string, status: string) => {
    try {
      await updateLead({
        baseUrl,
        id: leadId,
        body: { status },
      }).unwrap();
      refetch();
    } catch (err) {
      console.error("Lead status update error:", err);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Super Admin Executive Team Switcher Bar */}
      {isSuperAdmin && teamMembers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-indigo-950/40 border border-amber-300/60 dark:border-amber-700/60 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                  Super Admin Executive Mode
                </span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Inspect & Monitor Any Staff Member's Workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
                Viewing Workspace:
              </span>
              <div className="relative min-w-[240px]">
                <select
                  value={selectedTeamMemberId}
                  onChange={(e) => setSelectedTeamMemberId(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
                >
                  <option value="">👤 My Own Workspace ({currentUser?.name || "Super Admin"})</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.username || m.phone} ({m.designation || m.role}) — {m.activeTasksCount} Tasks, {m.assignedLeadsCount} Leads
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {selectedTeamMemberId && (
                <button
                  onClick={() => setSelectedTeamMemberId("")}
                  className="px-2.5 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                {selectedTeamMemberId && targetUser ? `${targetUser.name || "Member"}'s Workspace` : "My Assigned Work & Cockpit"}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {targetUser?.designation || targetUser?.role || "Team Member"}
              </span>
              {targetUser?.departmentName && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {targetUser.departmentName}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Personalized operational queue for daily task execution, CRM lead follow-ups, and standup reporting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Refresh Workspace Data"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </button>

          <button
            onClick={() => setIsEodModalOpen(true)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs",
              metrics.hasSubmittedTodayEod
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
          >
            {metrics.hasSubmittedTodayEod ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Standup Logged for Today ✓
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Submit Daily Standup / EOD
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* 1. Active Tasks */}
        <div
          onClick={() => {
            setActiveTab("TASKS");
            setTaskStatusFilter("ACTIVE");
          }}
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
            activeTab === "TASKS" && taskStatusFilter === "ACTIVE"
              ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Tasks</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {metrics.activeTasksCount}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Assigned deliverables</div>
        </div>

        {/* 2. Callbacks Due Today */}
        <div
          onClick={() => {
            setActiveTab("LEADS");
            setLeadStatusFilter("DUE_TODAY");
          }}
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
            activeTab === "LEADS" && leadStatusFilter === "DUE_TODAY"
              ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500/20"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Due Callbacks</span>
            <PhoneForwarded className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {metrics.callbacksDueTodayCount}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Leads to follow up today</div>
        </div>

        {/* 3. Assigned CRM Leads */}
        <div
          onClick={() => {
            setActiveTab("LEADS");
            setLeadStatusFilter("ALL");
          }}
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
            activeTab === "LEADS" && leadStatusFilter === "ALL"
              ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Leads</span>
            <PhoneCall className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.assignedLeadsCount}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">In my CRM pipeline</div>
        </div>

        {/* 4. Blocked Tasks */}
        <div
          onClick={() => {
            setActiveTab("TASKS");
            setTaskStatusFilter("BLOCKED");
          }}
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
            activeTab === "TASKS" && taskStatusFilter === "BLOCKED"
              ? "bg-rose-50/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 ring-2 ring-rose-500/20"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Blocked</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {metrics.blockedTasksCount}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Require unblocking</div>
        </div>

        {/* 5. Completed This Week */}
        <div
          onClick={() => {
            setActiveTab("TASKS");
            setTaskStatusFilter("COMPLETED");
          }}
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs col-span-2 sm:col-span-1",
            activeTab === "TASKS" && taskStatusFilter === "COMPLETED"
              ? "bg-purple-50/60 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/20"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {metrics.completedThisWeekCount}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Shipped in last 7 days</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("TASKS")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "TASKS"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <ListTodo className="w-4 h-4" />
          <span>My Tasks & SOPs</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {allTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("LEADS")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "LEADS"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <PhoneCall className="w-4 h-4" />
          <span>My CRM Leads & Callbacks</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {allLeads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("STANDUP")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
            activeTab === "STANDUP"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Standup & EOD History</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY TASKS */}
      {/* ========================================================================= */}
      {activeTab === "TASKS" && (
        <div className="space-y-4">
          {/* Tasks Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: "ACTIVE", label: "Active Queue" },
                { key: "ALL", label: "All Tasks" },
                { key: "URGENT", label: "Urgent Priority" },
                { key: "BLOCKED", label: "Blocked Items" },
                { key: "COMPLETED", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTaskStatusFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0",
                    taskStatusFilter === tab.key
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Task Cards List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <Clock className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Loading deliverables...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  {taskStatusFilter === "ACTIVE" ? "All deliverables completed!" : "No tasks found"}
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  {taskStatusFilter === "ACTIVE"
                    ? "You have no active deliverables in this queue. Great execution!"
                    : "No matching tasks in this view filter."}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const subtasks = task.subtasks || [];
                const hasSubtasks = subtasks.length > 0;
                const isOverdue =
                  task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "bg-white dark:bg-zinc-900 border rounded-2xl p-4 transition-all shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700",
                      task.status === "BLOCKED"
                        ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10"
                        : "border-zinc-200 dark:border-zinc-800"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() =>
                            handleQuickStatusChange(
                              task,
                              task.status === "COMPLETED" ? "TODO" : "COMPLETED"
                            )
                          }
                          className="mt-0.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          {task.status === "COMPLETED" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {task.projectName && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                                <Folder className="w-3 h-3" />
                                {task.projectName}
                              </span>
                            )}
                            {task.subProjectName && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {task.subProjectName}
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                task.priority === "URGENT"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : task.priority === "HIGH"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              )}
                            >
                              {task.priority}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                task.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : task.status === "IN_PROGRESS"
                                  ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                                  : task.status === "SUBMITTED_FOR_REVIEW"
                                  ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                  : task.status === "BLOCKED"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : "bg-zinc-500/10 text-zinc-600 border border-zinc-500/20"
                              )}
                            >
                              {task.status.replace(/_/g, " ")}
                            </span>
                          </div>

                          <h3
                            onClick={() => setSelectedTaskForDrawer(task)}
                            className={cn(
                              "text-sm font-bold cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
                              task.status === "COMPLETED"
                                ? "line-through text-zinc-400 dark:text-zinc-500"
                                : "text-zinc-900 dark:text-zinc-100"
                            )}
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}

                          {task.blockedReason && (
                            <div className="mt-2 text-xs p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>
                                <strong>Blocker:</strong> {task.blockedReason}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Task Quick Actions */}
                      <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                        {task.dueDate && (
                          <span
                            className={cn(
                              "text-xs flex items-center gap-1 mr-2 font-medium",
                              isOverdue ? "text-rose-600 dark:text-rose-400 font-bold" : "text-zinc-400"
                            )}
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                            {isOverdue && " (Overdue)"}
                          </span>
                        )}

                        {task.status === "TODO" && (
                          <button
                            onClick={() => handleQuickStatusChange(task, "IN_PROGRESS")}
                            className="px-2.5 py-1 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                          >
                            Start Task ▶
                          </button>
                        )}

                        {task.status === "IN_PROGRESS" && (
                          <button
                            onClick={(e) => handleOpenProofModal(e, task)}
                            className="px-2.5 py-1 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                          >
                            Submit Proof 📤
                          </button>
                        )}

                        {task.status !== "BLOCKED" && task.status !== "COMPLETED" && (
                          <button
                            onClick={(e) => handleOpenBlockModal(e, task)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 transition-colors"
                          >
                            I'm Blocked ⚠️
                          </button>
                        )}

                        {task.status === "BLOCKED" && (
                          <button
                            onClick={() => handleQuickStatusChange(task, "IN_PROGRESS")}
                            className="px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            Unblock & Resume ✓
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedTaskForDrawer(task)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Open full task drawer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sub-Tasks Checklist */}
                    {hasSubtasks && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 pl-8">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
                          <span>Sub-Tasks Checklist</span>
                          <span>
                            {task.subtasksCompleted || 0}/{subtasks.length} Done
                          </span>
                        </div>
                        {subtasks.map((st) => (
                          <div
                            key={st.id}
                            onClick={(e) => handleSubtaskToggle(e, task.id, st)}
                            className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer select-none"
                          >
                            {st.isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                            )}
                            <span
                              className={cn(
                                "flex-1",
                                st.isCompleted
                                  ? "line-through text-zinc-400 dark:text-zinc-500"
                                  : "text-zinc-700 dark:text-zinc-300"
                              )}
                            >
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY CRM LEADS & CALLBACKS */}
      {/* ========================================================================= */}
      {activeTab === "LEADS" && (
        <div className="space-y-4">
          {/* Leads Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: "ALL", label: "All My Leads" },
                { key: "DUE_TODAY", label: "Due Today / Overdue" },
                { key: "NEW", label: "New Uncontacted" },
                { key: "FOLLOW_UP", label: "Follow-up Queue" },
                { key: "INTERESTED", label: "Interested" },
                { key: "CONVERTED", label: "Converted" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setLeadStatusFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0",
                    leadStatusFilter === tab.key
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student, phone, college..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Leads List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <Clock className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Loading assigned CRM leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <UserCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  {leadStatusFilter === "DUE_TODAY" ? "No callbacks due today!" : "No CRM leads found"}
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  {leadStatusFilter === "DUE_TODAY"
                    ? "All scheduled telephone callbacks are completed."
                    : "No leads found in this filter."}
                </p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const isDueToday =
                  lead.nextCallAt && new Date(lead.nextCallAt) <= new Date(new Date().setHours(23, 59, 59, 999));
                const isOverdue = lead.nextCallAt && new Date(lead.nextCallAt) < new Date();

                return (
                  <div
                    key={lead.id}
                    className={cn(
                      "bg-white dark:bg-zinc-900 border rounded-2xl p-4 transition-all shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700",
                      isDueToday
                        ? "border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10"
                        : "border-zinc-200 dark:border-zinc-800"
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Lead Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {lead.name}
                          </h3>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                              lead.quality === "HOT"
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                : lead.quality === "WARM"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            )}
                          >
                            {lead.quality === "HOT" && <Flame className="w-3 h-3 text-rose-500" />}
                            {lead.quality}
                          </span>

                          <select
                            value={lead.status}
                            onChange={(e) => handleQuickLeadStatusChange(lead.id, e.target.value)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="NEW">NEW</option>
                            <option value="ATTEMPTED">ATTEMPTED</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="INTERESTED">INTERESTED</option>
                            <option value="FOLLOW_UP_SCHEDULED">FOLLOW UP SCHEDULED</option>
                            <option value="DEMO_GIVEN">DEMO GIVEN</option>
                            <option value="CONVERTED">CONVERTED</option>
                            <option value="LOST">LOST</option>
                            <option value="NOT_A_LEAD">NOT A LEAD</option>
                          </select>

                          {lead.source && (
                            <span className="text-[10px] font-mono text-zinc-400 font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                              {lead.source}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
                          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            📞 {lead.phone}
                          </span>
                          {lead.email && <span>✉️ {lead.email}</span>}
                          {lead.collegeName && (
                            <span className="flex items-center gap-1 text-zinc-500">
                              <Building2 className="w-3.5 h-3.5" />
                              {lead.collegeName}
                            </span>
                          )}
                          {lead.branch && (
                            <span className="flex items-center gap-1 text-zinc-500">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {lead.branch} {lead.yearOfStudy ? `(${lead.yearOfStudy})` : ""}
                            </span>
                          )}
                        </div>

                        {lead.notes && (
                          <p className="text-xs text-zinc-500 italic line-clamp-1">
                            💬 Notes: {lead.notes}
                          </p>
                        )}
                      </div>

                      {/* Callback Schedule & Call Button */}
                      <div className="flex items-center gap-3 flex-wrap lg:ml-auto">
                        <div className="text-right">
                          <div className="text-[11px] font-semibold text-zinc-400">
                            Calls Logged: <strong className="text-zinc-700 dark:text-zinc-300">{lead.callCount || 0}</strong>
                          </div>
                          {lead.nextCallAt ? (
                            <div
                              className={cn(
                                "text-xs font-bold flex items-center gap-1",
                                isOverdue
                                  ? "text-rose-600 dark:text-rose-400"
                                  : isDueToday
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-zinc-500"
                              )}
                            >
                              <Clock className="w-3 h-3" />
                              Next: {new Date(lead.nextCallAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          ) : (
                            <div className="text-[11px] text-zinc-400">No scheduled callback</div>
                          )}
                        </div>

                        <button
                          onClick={() => handleOpenLogCall(lead)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Log Call</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STANDUP & EOD HISTORY */}
      {/* ========================================================================= */}
      {activeTab === "STANDUP" && (
        <div className="space-y-6">
          {/* Today's Submission Status */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Today's Standup & EOD Report ({new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })})
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Daily sync of deliverables, next day trajectory, and blocker visibility.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (todayEod) {
                    setEodCompletedSummary(todayEod.completedSummary || "");
                    setEodPlanTomorrow(todayEod.planTomorrow || "");
                    setEodBlockers(todayEod.blockers || "");
                  }
                  setIsEodModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                {todayEod ? "Edit Today's EOD" : "Submit Today's EOD"}
              </button>
            </div>

            {todayEod ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                    ✓ Accomplished Today
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                    {todayEod.completedSummary}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                    🎯 Tomorrow's Plan
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                    {todayEod.planTomorrow}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                    ⚠️ Blockers / Flags
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                    {todayEod.blockers || "No blockers reported."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-400">
                  You haven't submitted your daily EOD report yet today. Click the button above to log your accomplishments!
                </p>
              </div>
            )}
          </div>

          {/* Previous EOD History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Previous Standup History (Last 7 Days)</span>
            </h3>

            {eodHistory.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-400">No previous logs found.</p>
              </div>
            ) : (
              eodHistory.map((log) => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      📅 {new Date(log.logDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Submitted at {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <strong className="text-zinc-600 dark:text-zinc-400">Done:</strong> {log.completedSummary}
                    </div>
                    <div>
                      <strong className="text-zinc-600 dark:text-zinc-400">Next Plan:</strong> {log.planTomorrow}
                    </div>
                  </div>

                  {log.blockers && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-xl">
                      <strong>Blocker:</strong> {log.blockers}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: LOG CRM CALL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isLogCallModalOpen}
        onClose={() => setIsLogCallModalOpen(false)}
        title={`Log Call with ${selectedLeadForCall?.name || "Student"}`}
        size="md"
      >
        <form onSubmit={handleConfirmLogCall} className="space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Student Phone:</span>
              <strong className="font-mono text-zinc-900 dark:text-zinc-100">{selectedLeadForCall?.phone}</strong>
            </div>
            {selectedLeadForCall?.collegeName && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">College:</span>
                <span className="text-zinc-800 dark:text-zinc-200">{selectedLeadForCall.collegeName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Call Outcome *
            </label>
            <select
              value={callOutcome}
              onChange={(e) => setCallOutcome(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="CONNECTED_INTERESTED">Connected — Highly Interested (Hot Lead)</option>
              <option value="CONNECTED_FOLLOW_UP">Connected — Requested Follow-Up Call</option>
              <option value="CONNECTED_CONVERTED">Connected — Converted / Enrolled! 🎉</option>
              <option value="CONNECTED_NOT_INTERESTED">Connected — Not Interested</option>
              <option value="BUSY_NO_ANSWER">Ringing / Busy / No Answer</option>
              <option value="CALL_BACK_REQUESTED">Call Back Requested Later</option>
              <option value="WRONG_NUMBER">Wrong Number / Invalid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Call Notes & Discussion Summary
            </label>
            <textarea
              rows={3}
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="e.g. Student interested in Full-Stack Python pathway, asked about fees and certification..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Schedule Next Follow-Up Call
            </label>
            <input
              type="datetime-local"
              value={callNextFollowUp}
              onChange={(e) => setCallNextFollowUp(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsLogCallModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoggingCall}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            >
              {isLoggingCall ? "Saving..." : "Save Call Log"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: DAILY EOD STANDUP */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEodModalOpen}
        onClose={() => setIsEodModalOpen(false)}
        title="Submit Daily Standup & EOD Report"
        size="md"
      >
        <form onSubmit={handleEodSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              1. What did you accomplish today? *
            </label>
            <textarea
              required
              rows={3}
              value={eodCompletedSummary}
              onChange={(e) => setEodCompletedSummary(e.target.value)}
              placeholder="e.g. Conducted 15 counseling calls, resolved onboarding blocker..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              2. What is your plan for tomorrow? *
            </label>
            <textarea
              required
              rows={2}
              value={eodPlanTomorrow}
              onChange={(e) => setEodPlanTomorrow(e.target.value)}
              placeholder="e.g. Follow up on 10 interested leads, complete curriculum module 3 review..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              3. Any Blockers or Dependencies? (Optional)
            </label>
            <textarea
              rows={2}
              value={eodBlockers}
              onChange={(e) => setEodBlockers(e.target.value)}
              placeholder="e.g. Need WhatsApp template approval, waiting for college coordinator contact..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsEodModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEod || !eodCompletedSummary.trim() || !eodPlanTomorrow.trim()}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 transition-colors"
            >
              {isSubmittingEod ? "Submitting..." : "Save Standup"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: FLAG BLOCKED */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
        title="Flag Task as Blocked"
        size="sm"
      >
        <form onSubmit={handleConfirmBlock} className="space-y-4">
          <p className="text-xs text-zinc-500">
            Explain what is blocking <strong>"{taskToBlock?.title}"</strong>:
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Blocker Reason *
            </label>
            <textarea
              required
              rows={3}
              value={blockedReasonText}
              onChange={(e) => setBlockedReasonText(e.target.value)}
              placeholder="e.g. Waiting on API credentials or college permission letter..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsBlockedModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!blockedReasonText.trim()}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
            >
              Flag Blocked
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: SUBMIT PROOF */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        title="Submit Deliverable Proof for Review"
        size="md"
      >
        <form onSubmit={handleConfirmProofSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Proof Link / URL (PR, Figma, Drive, Loom, Doc)
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://github.com/... or https://figma.com/..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Notes for Reviewer
            </label>
            <textarea
              rows={3}
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              placeholder="Summary of completed items and testing performed..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsProofModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Details Drawer */}
      {selectedTaskForDrawer && (
        <TaskDrawer
          task={selectedTaskForDrawer}
          currentUser={currentUser}
          departments={departments}
          teamMembers={[]}
          onClose={() => setSelectedTaskForDrawer(null)}
          onUpdateStatus={() => refetch()}
          onToggleSubtask={() => refetch()}
          onAddSubtask={() => refetch()}
          onDeleteSubtask={() => refetch()}
          onSubmitProof={() => refetch()}
          onFlagBlocked={() => refetch()}
          onReviewTask={() => refetch()}
          onAddComment={() => refetch()}
          onDeleteTask={() => refetch()}
        />
      )}
    </div>
  );
};
