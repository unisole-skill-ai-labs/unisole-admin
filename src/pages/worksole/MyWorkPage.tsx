import React, { useState } from "react";
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
  Plus,
  ArrowRight,
  ExternalLink,
  Filter,
  FileCheck2,
} from "lucide-react";
import {
  useGetTasksQuery,
  useUpdateTaskMutation,
  useToggleSubtaskMutation,
  useSubmitDailyLogMutation,
  useGetDepartmentsQuery,
  useGetProjectsQuery,
} from "../../store";
import { useSelector } from "react-redux";
import { TaskItem, TaskSubtask } from "../../types";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import Modal from "../../components/ui/Modal";
import { cn } from "../../lib/utils";

interface MyWorkPageProps {
  baseUrl: string;
}

export const MyWorkPage: React.FC<MyWorkPageProps> = ({ baseUrl }) => {
  const currentUser = useSelector((s: any) => s.auth.user);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ACTIVE");
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<TaskItem | null>(null);

  // EOD Modal State
  const [isEodModalOpen, setIsEodModalOpen] = useState(false);
  const [eodCompletedSummary, setEodCompletedSummary] = useState("");
  const [eodPlanTomorrow, setEodPlanTomorrow] = useState("");
  const [eodBlockers, setEodBlockers] = useState("");

  // Blocked Reason Modal State
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [taskToBlock, setTaskToBlock] = useState<TaskItem | null>(null);
  const [blockedReasonText, setBlockedReasonText] = useState("");

  // Submission Proof Modal State
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState<TaskItem | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofNotes, setProofNotes] = useState("");

  // Queries & Mutations
  const { data: tasksData, isLoading, refetch } = useGetTasksQuery({
    baseUrl,
    params: {
      view: "my_focus",
      userId: currentUser?.id,
    },
  });

  const { data: deptsData } = useGetDepartmentsQuery(baseUrl);
  const [updateTask] = useUpdateTaskMutation();
  const [toggleSubtask] = useToggleSubtaskMutation();
  const [submitDailyLog, { isLoading: isSubmittingEod }] = useSubmitDailyLogMutation();

  const myTasks: TaskItem[] = tasksData?.data || [];
  const departments = deptsData?.data || [];

  // Filtered tasks
  const filteredTasks = myTasks.filter((t) => {
    if (selectedStatusFilter === "ACTIVE") return t.status !== "COMPLETED";
    if (selectedStatusFilter === "COMPLETED") return t.status === "COMPLETED";
    if (selectedStatusFilter === "BLOCKED") return t.status === "BLOCKED";
    return true;
  });

  // Metrics
  const openTasksCount = myTasks.filter((t) => t.status !== "COMPLETED").length;
  const urgentCount = myTasks.filter((t) => t.status !== "COMPLETED" && (t.priority === "URGENT" || t.priority === "HIGH")).length;
  const blockedCount = myTasks.filter((t) => t.status === "BLOCKED").length;
  const completedCount = myTasks.filter((t) => t.status === "COMPLETED").length;

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
      refetch();
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
      refetch();
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
      refetch();
    } catch (err) {
      console.error("Submit proof error:", err);
    }
  };

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
      alert("✅ Daily Standup EOD submitted successfully!");
    } catch (err) {
      console.error("Submit EOD error:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                My Work & Execution Cockpit
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Welcome back, <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentUser?.name || currentUser?.phone}</span>. Here is your active deliverable queue.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEodModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" /> Submit Daily Standup / EOD
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setSelectedStatusFilter("ACTIVE")}
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
            selectedStatusFilter === "ACTIVE"
              ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">My Open Tasks</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {openTasksCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Active deliverables</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Urgent / High</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {urgentCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Priority focus items</div>
        </div>

        <div
          onClick={() => setSelectedStatusFilter("BLOCKED")}
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
            selectedStatusFilter === "BLOCKED"
              ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Blocked</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {blockedCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Requires unblocking</div>
        </div>

        <div
          onClick={() => setSelectedStatusFilter("COMPLETED")}
          className={cn(
            "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
            selectedStatusFilter === "COMPLETED"
              ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {completedCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Finished items</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ACTIVE", "ALL", "BLOCKED", "COMPLETED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatusFilter(tab)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedStatusFilter === tab
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {tab === "ACTIVE" ? "My Active Queue" : tab === "ALL" ? "All Tasks" : tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-400 font-medium px-2">
          {filteredTasks.length} tasks
        </span>
      </div>

      {/* Task List Queue */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Clock className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Loading your deliverables...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              {selectedStatusFilter === "ACTIVE" ? "All caught up!" : "No tasks found"}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              {selectedStatusFilter === "ACTIVE"
                ? "You have no active pending deliverables in your queue right now. Great job!"
                : "No matching tasks in this view."}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const subtasks = task.subtasks || [];
            const hasSubtasks = subtasks.length > 0;

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
                            {task.projectCode ? `[${task.projectCode}] ` : ""}{task.projectName}
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
                          <span><strong>Blocker:</strong> {task.blockedReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task Quick Actions */}
                  <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                    {task.dueDate && (
                      <span className="text-xs text-zinc-400 flex items-center gap-1 mr-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
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

      {/* Daily Standup EOD Modal */}
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
              placeholder="e.g. Completed subtasks on onboarding, tested checkout flow..."
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
              placeholder="e.g. Deploy staging build, start module 2 integration..."
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
              placeholder="e.g. Need AWS credentials, waiting for design asset review..."
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
              {isSubmittingEod ? "Submitting..." : "Submit Standup"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Blocked Reason Modal */}
      <Modal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
        title="Flag Task as Blocked"
        size="sm"
      >
        <form onSubmit={handleConfirmBlock} className="space-y-4">
          <p className="text-xs text-zinc-500">
            Let the team and leadership know what is blocking <strong>"{taskToBlock?.title}"</strong>:
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Blocker Description *
            </label>
            <textarea
              required
              rows={3}
              value={blockedReasonText}
              onChange={(e) => setBlockedReasonText(e.target.value)}
              placeholder="e.g. Waiting on API credentials from 3rd party vendor..."
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

      {/* Submit Proof Modal */}
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
              placeholder="Summary of completed items, testing performed, or instructions for the reviewer..."
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
