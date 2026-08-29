import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetTeamMembersQuery,
  useGetDepartmentsQuery,
  useGetTemplatesQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useToggleSubtaskMutation,
  useAddSubtaskMutation,
  useDeleteSubtaskMutation,
  useSubmitTaskProofMutation,
  useFlagTaskBlockedMutation,
  useReviewTaskMutation,
  useAddTaskCommentMutation,
  useGetDailyLogsQuery,
  useSubmitDailyLogMutation,
} from "../../store";
import {
  Users,
  Shield,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  X,
  Sparkles,
  Search,
  Trash2,
  FolderPlus,
  UserPlus,
  Filter,
  Check,
  Layers,
  ChevronRight,
  CalendarCheck,
  TrendingUp,
  Trophy,
  Activity,
  Send,
} from "lucide-react";
import Button from "../../components/ui/Button";
import MemberPerformanceDossier from "../../components/team/MemberPerformanceDossier";
import CompanyProgressView from "../../components/team/CompanyProgressView";
import TeamLeaderboardView from "../../components/team/TeamLeaderboardView";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import TaskCreateModal from "../../components/tasks/TaskCreateModal";
import DailyEodModal from "../../components/tasks/DailyEodModal";

export default function TeamMembersPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isLeader = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";

  // Active View Tab: 'progress' | 'directory' | 'leaderboard' | 'standup'
  const [activeTab, setActiveTab] = useState<"progress" | "directory" | "leaderboard" | "standup">(
    isSuperAdmin ? "progress" : "directory"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("");

  // Inspecting Member (360° Dossier)
  const [inspectingMemberId, setInspectingMemberId] = useState<string | null>(null);

  // Task Drawer & Create Modal
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  const [presetAssigneeId, setPresetAssigneeId] = useState<string>("");
  const [presetDeptId, setPresetDeptId] = useState<string>("");

  // Standup Date State
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const [standupDate, setStandupDate] = useState<string>(todayStr);
  const [isEodModalOpen, setIsEodModalOpen] = useState(false);

  // Member CRUD Modals
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<any | null>(null);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Member Form State
  const [memberPhone, setMemberPhone] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<string>("MEMBER");
  const [memberDeptId, setMemberDeptId] = useState<string>("");
  const [memberDesignation, setMemberDesignation] = useState<string>("");

  // Department Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptColor, setDeptColor] = useState("#6366f1");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptLeadId, setDeptLeadId] = useState("");

  // Queries
  const { data: membersRes, isLoading: isMembersLoading } = useGetTeamMembersQuery({
    baseUrl,
    search: searchQuery || undefined,
  });
  const members = membersRes?.data || [];

  const { data: deptRes } = useGetDepartmentsQuery(baseUrl);
  const departments = deptRes?.data || [];

  const { data: templatesRes } = useGetTemplatesQuery({ baseUrl });
  const templates = templatesRes?.data || [];

  const { data: logsRes, isLoading: isLogsLoading } = useGetDailyLogsQuery({
    baseUrl,
    date: standupDate,
  });
  const dailyLogs = logsRes?.data || [];

  // Mutations
  const [createMember] = useCreateTeamMemberMutation();
  const [updateMember] = useUpdateTeamMemberMutation();
  const [deleteMember] = useDeleteTeamMemberMutation();

  const [createDept] = useCreateDepartmentMutation();
  const [updateDept] = useUpdateDepartmentMutation();
  const [deleteDept] = useDeleteDepartmentMutation();

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [toggleSubtask] = useToggleSubtaskMutation();
  const [addSubtask] = useAddSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();
  const [submitTaskProof] = useSubmitTaskProofMutation();
  const [flagTaskBlocked] = useFlagTaskBlockedMutation();
  const [reviewTask] = useReviewTaskMutation();
  const [addTaskComment] = useAddTaskCommentMutation();
  const [submitDailyLog] = useSubmitDailyLogMutation();

  // Filtered members by department filter
  const filteredMembers = members.filter((m: any) => {
    if (selectedDeptFilter && m.departmentId !== selectedDeptFilter) {
      return false;
    }
    return true;
  });

  const getCapacityStatus = (activeCount: number) => {
    if (activeCount >= 5) {
      return {
        label: "🔥 Overloaded",
        badgeBg: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900",
      };
    }
    if (activeCount >= 1) {
      return {
        label: "⚡ Active",
        badgeBg: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900",
      };
    }
    return {
      label: "🟢 Available",
      badgeBg: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    };
  };

  // --- Member Handlers ---
  const handleOpenAddMember = () => {
    setMemberPhone("");
    setMemberName("");
    setMemberRole("MEMBER");
    setMemberDeptId("");
    setMemberDesignation("");
    setIsAddMemberModalOpen(true);
  };

  const handleOpenEditMember = (member: any) => {
    setSelectedMemberForEdit(member);
    setMemberName(member.name || "");
    setMemberRole(member.role || "MEMBER");
    setMemberDeptId(member.departmentId || "");
    setMemberDesignation(member.designation || "");
    setIsEditMemberModalOpen(true);
  };

  const handleSaveAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberPhone.trim() || !memberName.trim()) return;

    try {
      await createMember({
        baseUrl,
        body: {
          phone: memberPhone.trim(),
          name: memberName.trim(),
          role: memberRole,
          departmentId: memberDeptId || null,
          designation: memberDesignation.trim() || null,
        },
      }).unwrap();
      setIsAddMemberModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to add team member");
    }
  };

  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForEdit) return;

    try {
      await updateMember({
        baseUrl,
        id: selectedMemberForEdit.id,
        body: {
          name: memberName.trim(),
          role: memberRole,
          departmentId: memberDeptId || null,
          designation: memberDesignation || null,
        },
      }).unwrap();
      setIsEditMemberModalOpen(false);
      setSelectedMemberForEdit(null);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to update member");
    }
  };

  const handleDeleteMember = async (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await deleteMember({ baseUrl, id: memberId }).unwrap();
      if (inspectingMemberId === memberId) setInspectingMemberId(null);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to deactivate member");
    }
  };

  // --- Department Handlers ---
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName("");
    setDeptCode("");
    setDeptColor("#6366f1");
    setDeptDesc("");
    setDeptLeadId("");
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: any) => {
    setEditingDept(dept);
    setDeptName(dept.name || "");
    setDeptCode(dept.code || "");
    setDeptColor(dept.color || "#6366f1");
    setDeptDesc(dept.description || "");
    setDeptLeadId(dept.leadId || "");
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    try {
      if (editingDept) {
        await updateDept({
          baseUrl,
          id: editingDept.id,
          body: {
            name: deptName.trim(),
            color: deptColor,
            description: deptDesc.trim() || null,
            leadId: deptLeadId || null,
          },
        }).unwrap();
      } else {
        if (!deptCode.trim()) return;
        await createDept({
          baseUrl,
          body: {
            name: deptName.trim(),
            code: deptCode.trim().toUpperCase(),
            color: deptColor,
            description: deptDesc.trim() || null,
            leadId: deptLeadId || null,
          },
        }).unwrap();
      }
      setIsDeptModalOpen(false);
      setEditingDept(null);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to save department");
    }
  };

  const handleDeleteDept = async (deptId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete department "${name}"?`)) return;
    try {
      await deleteDept({ baseUrl, id: deptId }).unwrap();
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete department");
    }
  };

  // --- Task Handlers for Drawer & Direct Assignment ---
  const handleOpenTaskCreateWithAssignee = (assigneeId: string, deptId?: string) => {
    setPresetAssigneeId(assigneeId);
    setPresetDeptId(deptId || "");
    setIsTaskCreateOpen(true);
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask({ baseUrl, body: taskData }).unwrap();
      setIsTaskCreateOpen(false);
      setPresetAssigneeId("");
      setPresetDeptId("");
    } catch (err: any) {
      alert(err?.data?.error || "Failed to create task");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string, note?: string) => {
    try {
      const res = await updateTask({
        baseUrl,
        id: taskId,
        body: { status, statusNote: note },
      }).unwrap();
      if (selectedTask?.id === taskId) setSelectedTask(res.data);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to update task status");
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string, isCompleted: boolean) => {
    try {
      const res = await toggleSubtask({ baseUrl, taskId, subtaskId, isCompleted }).unwrap();
      if (selectedTask?.id === taskId) setSelectedTask(res.data);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to toggle subtask");
    }
  };

  const handleAddSubtask = async (taskId: string, title: string) => {
    try {
      const res = await addSubtask({ baseUrl, taskId, title }).unwrap();
      if (selectedTask?.id === taskId) setSelectedTask(res.data);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to add subtask");
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const res = await deleteSubtask({ baseUrl, taskId, subtaskId }).unwrap();
      if (selectedTask?.id === taskId) setSelectedTask(res.data);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete subtask");
    }
  };

  const handleSubmitProof = async (taskId: string, proofUrl: string, notes?: string) => {
    try {
      const res = await submitTaskProof({ baseUrl, taskId, body: { proofUrl, notes } }).unwrap();
      if (selectedTask?.id === taskId) setSelectedTask(res.data);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to submit proof");
    }
  };

  const handleFlagBlocked = async (taskId: string, reason: string) => {
    try {
      const res = await flagTaskBlocked({ baseUrl, taskId, body: { reason } }).unwrap();
      if (selectedTask?.id === taskId) setSelectedTask(res.data);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to flag task blocked");
    }
  };

  const handleReviewTask = async (
    taskId: string,
    decision: "APPROVED" | "CHANGES_REQUESTED",
    notes?: string
  ) => {
    try {
      const res = await reviewTask({ baseUrl, taskId, body: { decision, notes } }).unwrap();
      if (selectedTask?.id === taskId) setSelectedTask(res.data);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to review task");
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    try {
      const res = await addTaskComment({ baseUrl, taskId, body: { content } }).unwrap();
      if (selectedTask?.id === taskId) setSelectedTask(res.data);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to add comment");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ baseUrl, id: taskId }).unwrap();
      setSelectedTask(null);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete task");
    }
  };

  const handleEditTask = async (taskId: string, updates: any) => {
    try {
      const res = await updateTask({ baseUrl, id: taskId, body: updates }).unwrap();
      if (selectedTask?.id === taskId) setSelectedTask(res.data);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to edit task");
    }
  };

  const userSubmittedToday = dailyLogs.some((l: any) => l.userId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* 🔝 SUPER ADMIN COMMAND HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <span>Team & Company Progress Command</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-mono">
              {members.length} Staff
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time organizational telemetry, individual 360° member performance, squad health, and daily accountability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff or squad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
            />
          </div>

          {isSuperAdmin && (
            <button
              onClick={handleOpenAddDept}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors shadow-2xs cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
              <span>+ Department</span>
            </button>
          )}

          {isSuperAdmin && (
            <Button
              onClick={handleOpenAddMember}
              variant="primary"
              className="flex items-center gap-1.5 text-xs font-black shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </Button>
          )}
        </div>
      </div>

      {/* 🧭 VIEW SWITCHER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "progress"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Company Progress</span>
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "directory"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Squads & Directory</span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard & Capacity</span>
          </button>

          <button
            onClick={() => setActiveTab("standup")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "standup"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Daily Standups</span>
          </button>
        </div>

        {activeTab === "directory" && (
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
              Filter Squad:
            </span>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Squads ({departments.length})</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 🚀 ACTIVE TAB RENDERING */}
      {activeTab === "progress" ? (
        /* TAB 1: EXECUTIVE COMPANY PROGRESS */
        <CompanyProgressView
          baseUrl={baseUrl}
          isSuperAdmin={isSuperAdmin}
          onSelectMember={(id) => setInspectingMemberId(id)}
          onSelectTask={(task) => setSelectedTask(task)}
          onFilterDepartment={(deptId) => {
            setSelectedDeptFilter(deptId);
            setActiveTab("directory");
          }}
        />
      ) : activeTab === "leaderboard" ? (
        /* TAB 2: PERFORMANCE LEADERBOARD & CAPACITY */
        <TeamLeaderboardView
          baseUrl={baseUrl}
          isSuperAdmin={isSuperAdmin}
          onSelectMember={(id) => setInspectingMemberId(id)}
          onOpenTaskCreateWithAssignee={handleOpenTaskCreateWithAssignee}
        />
      ) : activeTab === "standup" ? (
        /* TAB 3: DAILY STANDUPS ROLLUP */
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Date Switcher & Submission Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStandupDate(todayStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  standupDate === todayStr
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setStandupDate(yesterdayStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  standupDate === yesterdayStr
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                }`}
              >
                Yesterday
              </button>
              <input
                type="date"
                value={standupDate}
                onChange={(e) => setStandupDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsEodModalOpen(true)}
                variant="primary"
                className="text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>{userSubmittedToday ? "Update My Check-In" : "+ Submit EOD Log"}</span>
              </Button>
            </div>
          </div>

          {/* Logs Feed */}
          {isLogsLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
            </div>
          ) : dailyLogs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                No Standup Logs For {standupDate}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                Be the first to submit a 1-minute daily accountability check-in!
              </p>
              <Button onClick={() => setIsEodModalOpen(true)} variant="primary" className="text-xs">
                Submit EOD Log Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyLogs.map((log: any) => (
                <div
                  key={log.id}
                  onClick={() => setInspectingMemberId(log.userId)}
                  className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs space-y-3.5 hover:shadow-md hover:border-indigo-400/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        {(log.userName || log.userPhone || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                          {log.userName || "Team Member"}
                        </h4>
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

                  <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      ✅ Completed Today:
                    </span>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {log.completedSummary}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                      📌 Tomorrow's Plan:
                    </span>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {log.planTomorrow}
                    </p>
                  </div>

                  {log.blockers && (
                    <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-rose-700 dark:text-rose-400 block">
                          Blocker:
                        </span>
                        <p className="text-xs text-rose-950 dark:text-rose-200 font-medium">
                          {log.blockers}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB 4: SQUADS MATRIX & TEAM DIRECTORY */
        <div className="space-y-6">
          {/* Departments Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {departments.map((dept: any) => {
              const isSelected = selectedDeptFilter === dept.id;

              return (
                <div
                  key={dept.id}
                  onClick={() =>
                    setSelectedDeptFilter(isSelected ? "" : dept.id)
                  }
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-md"
                      : "border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shadow-xs"
                          style={{ backgroundColor: dept.color || "#6366f1" }}
                        />
                        <span className="text-[10px] font-mono font-bold text-zinc-400">
                          {dept.code || "DEPT"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {dept.membersCount || 0} Staff
                        </span>
                        {isSuperAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditDept(dept);
                            }}
                            className="p-1 text-zinc-400 hover:text-indigo-600 ml-1 rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Department"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                      {dept.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>Active Workload:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {dept.activeTasksCount || 0} tasks
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter Pill Indicator */}
          {selectedDeptFilter && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-700 dark:text-indigo-300">
              <span>Filtering by department:</span>
              <strong>
                {departments.find((d: any) => d.id === selectedDeptFilter)?.name}
              </strong>
              <button
                onClick={() => setSelectedDeptFilter("")}
                className="ml-auto text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* Team Member Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isMembersLoading ? (
              <div className="col-span-full h-48 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No team members match your criteria</p>
              </div>
            ) : (
              filteredMembers.map((m: any) => {
                const isSuper = m.role === "SUPER_ADMIN";
                const isAdmin = m.role === "ADMIN";
                const capacity = getCapacityStatus(m.activeTasksCount || 0);

                return (
                  <div
                    key={m.id}
                    onClick={() => setInspectingMemberId(m.id)}
                    className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Top Bar: Avatar & Role Pill */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-md ${
                              isSuper
                                ? "bg-gradient-to-tr from-amber-500 to-orange-600"
                                : isAdmin
                                ? "bg-gradient-to-tr from-indigo-600 to-violet-600"
                                : "bg-gradient-to-tr from-emerald-600 to-teal-600"
                            }`}
                          >
                            {(m.name || m.phone || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {m.name || "Unnamed Staff"}
                            </h3>
                            <p className="text-[11px] text-zinc-500 font-mono">
                              +91 {m.phone}
                            </p>
                          </div>
                        </div>

                        {isSuperAdmin && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEditMember(m)}
                              className="p-1.5 rounded-xl text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Edit Member Profile"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m.id, m.name || m.phone)}
                              className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Deactivate Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Role & Dept Tag */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono tracking-wider ${
                            isSuper
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                              : isAdmin
                              ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300"
                              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                          }`}
                        >
                          {m.role || "MEMBER"}
                        </span>

                        {m.departmentName && (
                          <span
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold"
                            style={{
                              backgroundColor: `${m.departmentColor || "#6366f1"}18`,
                              color: m.departmentColor || "#6366f1",
                            }}
                          >
                            {m.departmentName}
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${capacity.badgeBg}`}
                        >
                          {capacity.label}
                        </span>
                      </div>

                      {m.designation && (
                        <p className="text-xs text-zinc-500 font-medium line-clamp-1 mb-3">
                          {m.designation}
                        </p>
                      )}
                    </div>

                    {/* Workload Capacity Meter */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400 block font-mono uppercase font-semibold">
                          In-Flight
                        </span>
                        <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {m.activeTasksCount || 0}
                        </strong>
                      </div>

                      <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400 block font-mono uppercase font-semibold">
                          Blocked
                        </span>
                        <strong
                          className={`text-sm font-black ${
                            m.blockedTasksCount > 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {m.blockedTasksCount || 0}
                        </strong>
                      </div>

                      <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400 block font-mono uppercase font-semibold">
                          Finished
                        </span>
                        <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {m.completedTasksCount || 0}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 📑 360° MEMBER PERFORMANCE DOSSIER MODAL */}
      {inspectingMemberId && (
        <MemberPerformanceDossier
          memberId={inspectingMemberId}
          baseUrl={baseUrl}
          isSuperAdmin={isSuperAdmin}
          departments={departments}
          onClose={() => setInspectingMemberId(null)}
          onOpenTaskCreateWithAssignee={handleOpenTaskCreateWithAssignee}
          onSelectTask={(t) => setSelectedTask(t)}
        />
      )}

      {/* 📑 TASK INSPECTION DRAWER */}
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          currentUser={currentUser}
          departments={departments}
          teamMembers={members}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleUpdateTaskStatus}
          onToggleSubtask={handleToggleSubtask}
          onAddSubtask={handleAddSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onSubmitProof={handleSubmitProof}
          onFlagBlocked={handleFlagBlocked}
          onReviewTask={handleReviewTask}
          onAddComment={handleAddComment}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
        />
      )}

      {/* ➕ TASK CREATE MODAL */}
      <TaskCreateModal
        isOpen={isTaskCreateOpen}
        departments={departments}
        teamMembers={members}
        templates={templates}
        defaultAssigneeId={presetAssigneeId}
        defaultDepartmentId={presetDeptId}
        onClose={() => {
          setIsTaskCreateOpen(false);
          setPresetAssigneeId("");
          setPresetDeptId("");
        }}
        onSubmit={handleCreateTask}
      />

      {/* 📝 DAILY EOD LOG MODAL */}
      <DailyEodModal
        isOpen={isEodModalOpen}
        onClose={() => setIsEodModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await submitDailyLog({ baseUrl, body: data }).unwrap();
            setIsEodModalOpen(false);
            alert("Daily EOD check-in logged successfully!");
          } catch (err: any) {
            alert(err?.data?.error || "Failed to submit daily log");
          }
        }}
      />

      {/* Add New Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Add Team Member</span>
              </h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Staff Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mobile Number (10 digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Role
                  </label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                  >
                    <option value="MEMBER">MEMBER (Staff / Learner)</option>
                    <option value="ADMIN">ADMIN (Lead / Manager)</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN (Leadership)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <select
                    value={memberDeptId}
                    onChange={(e) => setMemberDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                  >
                    <option value="">No Department</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Video Editor or Operations Intern"
                  value={memberDesignation}
                  onChange={(e) => setMemberDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary">
                  Create Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Profile Modal */}
      {isEditMemberModalOpen && selectedMemberForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                Edit Member: {selectedMemberForEdit.name || selectedMemberForEdit.phone}
              </h3>
              <button
                onClick={() => setIsEditMemberModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Access Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                >
                  <option value="MEMBER">MEMBER (Staff / Intern / Learner)</option>
                  <option value="ADMIN">ADMIN (Department Lead / Manager)</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN (Founders / Core Platform)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Department
                </label>
                <select
                  value={memberDeptId}
                  onChange={(e) => setMemberDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                >
                  <option value="">No Department Assigned</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Designation / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Video Specialist or Campus Coordinator"
                  value={memberDesignation}
                  onChange={(e) => setMemberDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-600" />
                <span>{editingDept ? "Edit Department" : "Create New Department"}</span>
              </h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Media"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                />
              </div>

              {!editingDept && (
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Unique Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MEDIA"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Squad Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={deptColor}
                      onChange={(e) => setDeptColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={deptColor}
                      onChange={(e) => setDeptColor(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department Lead
                  </label>
                  <select
                    value={deptLeadId}
                    onChange={(e) => setDeptLeadId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                  >
                    <option value="">No Lead Assigned</option>
                    {members.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.phone} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Primary duties and responsibilities of this squad..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {editingDept ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteDept(editingDept.id, editingDept.name)}
                    className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeptModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary">
                    {editingDept ? "Save Changes" : "Create Department"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
