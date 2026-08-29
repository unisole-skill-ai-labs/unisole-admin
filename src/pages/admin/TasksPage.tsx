import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetTasksQuery,
  useGetLeaderRadarQuery,
  useGetDepartmentsQuery,
  useGetTeamMembersQuery,
  useGetTemplatesQuery,
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
  useSubmitDailyLogMutation,
} from "../../store";
import LeaderRadarWidget from "../../components/tasks/LeaderRadarWidget";
import LearnerFocusView from "../../components/tasks/LearnerFocusView";
import KanbanBoardView from "../../components/tasks/KanbanBoardView";
import TaskTableView from "../../components/tasks/TaskTableView";
import TaskCalendarView from "../../components/tasks/TaskCalendarView";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import TaskCreateModal from "../../components/tasks/TaskCreateModal";
import BlockedModal from "../../components/tasks/BlockedModal";
import DailyEodModal from "../../components/tasks/DailyEodModal";
import Button from "../../components/ui/Button";
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Columns3,
  Table,
  Calendar,
  Sparkles,
  CalendarCheck,
  RotateCcw,
} from "lucide-react";

export default function TasksPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);

  const isMember = currentUser?.role === "MEMBER";
  const isLeader = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";

  // Views: 'focus', 'board', 'table', 'calendar'
  const [activeView, setActiveView] = useState<"focus" | "board" | "table" | "calendar">(
    isMember ? "focus" : "board"
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals & Selected Task
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState("TODO");
  const [blockedTaskTarget, setBlockedTaskTarget] = useState<any | null>(null);
  const [isEodModalOpen, setIsEodModalOpen] = useState(false);

  // Queries
  const { data: radarRes } = useGetLeaderRadarQuery(baseUrl, {
    pollingInterval: 20000,
  });
  const radar = radarRes?.data || null;

  const { data: deptRes } = useGetDepartmentsQuery(baseUrl);
  const departments = deptRes?.data || [];

  const { data: membersRes } = useGetTeamMembersQuery({ baseUrl });
  const teamMembers = membersRes?.data || [];

  const { data: templatesRes } = useGetTemplatesQuery({ baseUrl });
  const templates = templatesRes?.data || [];

  const { data: tasksRes, isLoading: isTasksLoading } = useGetTasksQuery(
    {
      baseUrl,
      params: {
        search: searchQuery || undefined,
        departmentId: departmentFilter || undefined,
        assigneeId: assigneeFilter || undefined,
        priority: priorityFilter || undefined,
        status: statusFilter === "OVERDUE" || statusFilter === "ACTIVE" ? undefined : statusFilter || undefined,
        view: activeView === "focus" && isMember ? "my_focus" : undefined,
      },
    },
    { pollingInterval: 15000 }
  );
  const allTasks: any[] = tasksRes?.data || [];

  // Client-side Overdue/Active radar filters
  const filteredTasks = allTasks.filter((t) => {
    if (statusFilter === "OVERDUE") {
      return t.dueDate && t.status !== "COMPLETED" && new Date(t.dueDate).getTime() < Date.now();
    }
    if (statusFilter === "ACTIVE") {
      return t.status !== "COMPLETED";
    }
    return true;
  });

  // Mutations
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

  // Handlers
  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask({ baseUrl, body: taskData }).unwrap();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to create task");
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string, note?: string) => {
    try {
      const res = await updateTask({
        baseUrl,
        id: taskId,
        body: { status, statusNote: note },
      }).unwrap();
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      alert(err?.data?.error || "Failed to update status");
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string, isCompleted: boolean) => {
    try {
      const res = await toggleSubtask({
        baseUrl,
        taskId,
        subtaskId,
        isCompleted,
      }).unwrap();
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      alert(err?.data?.error || "Failed to toggle subtask");
    }
  };

  const handleAddSubtask = async (taskId: string, title: string) => {
    try {
      const res = await addSubtask({ baseUrl, taskId, title }).unwrap();
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      alert(err?.data?.error || "Failed to add subtask");
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const res = await deleteSubtask({ baseUrl, taskId, subtaskId }).unwrap();
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete subtask");
    }
  };

  const handleSubmitProof = async (taskId: string, proofUrl: string, notes?: string) => {
    try {
      const res = await submitTaskProof({
        baseUrl,
        taskId,
        body: { proofUrl, notes },
      }).unwrap();
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      alert(err?.data?.error || "Failed to submit proof");
    }
  };

  const handleFlagBlocked = async (taskId: string, reason: string) => {
    try {
      const res = await flagTaskBlocked({
        baseUrl,
        taskId,
        body: { reason },
      }).unwrap();
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      alert(err?.data?.error || "Failed to flag task as blocked");
    }
  };

  const handleReviewTask = async (
    taskId: string,
    decision: "APPROVED" | "CHANGES_REQUESTED",
    notes?: string
  ) => {
    try {
      const res = await reviewTask({
        baseUrl,
        taskId,
        body: { decision, notes },
      }).unwrap();
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      alert(err?.data?.error || "Failed to review task");
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    try {
      const res = await addTaskComment({
        baseUrl,
        taskId,
        body: { content },
      }).unwrap();
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      alert(err?.data?.error || "Failed to post comment");
    }
  };

  const handleEditTask = async (taskId: string, updates: any) => {
    try {
      const res = await updateTask({
        baseUrl,
        id: taskId,
        body: updates,
      }).unwrap();
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err: any) {
      alert(err?.data?.error || "Failed to update task details");
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

  const handleRadarFilterClick = (filterKey: string) => {
    if (statusFilter === filterKey) {
      setStatusFilter("");
    } else {
      setStatusFilter(filterKey);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🔝 Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <span>Operations & Team Tasks</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-mono">
              Internal Hub
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Standard operating procedures, task execution, and deadline tracking for Unisole operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEodModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors shadow-xs cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
            <span>Daily EOD Log</span>
          </button>

          {isLeader && (
            <Button
              onClick={() => {
                setCreateDefaultStatus("TODO");
                setIsCreateModalOpen(true);
              }}
              variant="primary"
              className="flex items-center gap-2 text-xs font-black shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* 🎯 LEADER RADAR WIDGET (Visible to Leaders) */}
      {isLeader && (
        <LeaderRadarWidget
          radar={radar}
          activeFilter={statusFilter}
          onFilterClick={handleRadarFilterClick}
        />
      )}

      {/* 🧭 View Switcher & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
          <button
            onClick={() => setActiveView("focus")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "focus"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>My Focus</span>
          </button>

          <button
            onClick={() => setActiveView("board")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "board"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setActiveView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "table"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table List</span>
          </button>

          <button
            onClick={() => setActiveView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "calendar"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>

        {/* Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          {/* Search Box */}
          <div className="relative min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          {isLeader && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Team</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.phone}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters button */}
          {(searchQuery || departmentFilter || assigneeFilter || priorityFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setDepartmentFilter("");
                setAssigneeFilter("");
                setPriorityFilter("");
                setStatusFilter("");
              }}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 🚀 Active View Rendering */}
      {isTasksLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
        </div>
      ) : activeView === "focus" ? (
        <LearnerFocusView
          tasks={filteredTasks}
          onSelectTask={(t) => setSelectedTask(t)}
          onToggleSubtask={handleToggleSubtask}
          onOpenSubmitModal={(t) => setSelectedTask(t)}
          onOpenBlockedModal={(t) => setBlockedTaskTarget(t)}
        />
      ) : activeView === "board" ? (
        <KanbanBoardView
          tasks={filteredTasks}
          onSelectTask={(t) => setSelectedTask(t)}
          onUpdateStatus={handleUpdateStatus}
          onOpenCreateModal={(defStatus) => {
            setCreateDefaultStatus(defStatus || "TODO");
            setIsCreateModalOpen(true);
          }}
        />
      ) : activeView === "table" ? (
        <TaskTableView
          tasks={filteredTasks}
          onSelectTask={(t) => setSelectedTask(t)}
          onUpdateStatus={handleUpdateStatus}
        />
      ) : (
        <TaskCalendarView
          tasks={filteredTasks}
          onSelectTask={(t) => setSelectedTask(t)}
        />
      )}

      {/* 📑 Modals & Drawers */}
      <TaskDrawer
        task={selectedTask}
        currentUser={currentUser}
        departments={departments}
        teamMembers={teamMembers}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={handleUpdateStatus}
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

      <TaskCreateModal
        isOpen={isCreateModalOpen}
        departments={departments}
        teamMembers={teamMembers}
        templates={templates}
        defaultStatus={createDefaultStatus}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <BlockedModal
        isOpen={!!blockedTaskTarget}
        task={blockedTaskTarget}
        onClose={() => setBlockedTaskTarget(null)}
        onSubmit={handleFlagBlocked}
      />

      <DailyEodModal
        isOpen={isEodModalOpen}
        onClose={() => setIsEodModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await submitDailyLog({ baseUrl, body: data }).unwrap();
            alert("Daily EOD Log submitted successfully!");
          } catch (err: any) {
            alert(err?.data?.error || "Failed to submit EOD log");
          }
        }}
      />
    </div>
  );
}
