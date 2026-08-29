import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  MoreVertical,
  ChevronRight,
  Plus,
  Link2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface KanbanBoardViewProps {
  tasks: any[];
  onSelectTask: (task: any) => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
  onOpenCreateModal: (defaultStatus?: string) => void;
}

const COLUMNS = [
  {
    id: "TODO",
    title: "To Do / Queued",
    color: "zinc",
    badgeBg: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
    columnBg: "bg-zinc-50/70 dark:bg-zinc-900/40",
    accentColor: "#71717a",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "indigo",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400",
    columnBg: "bg-indigo-50/20 dark:bg-indigo-950/20",
    accentColor: "#6366f1",
  },
  {
    id: "BLOCKED",
    title: "🚨 Blocked / Stuck",
    color: "rose",
    badgeBg: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold",
    columnBg: "bg-rose-50/20 dark:bg-rose-950/20",
    accentColor: "#f43f5e",
  },
  {
    id: "SUBMITTED_FOR_REVIEW",
    title: "Review Queue",
    color: "amber",
    badgeBg: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold",
    columnBg: "bg-amber-50/20 dark:bg-amber-950/20",
    accentColor: "#f59e0b",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "emerald",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold",
    columnBg: "bg-emerald-50/20 dark:bg-emerald-950/20",
    accentColor: "#10b981",
  },
];

export default function KanbanBoardView({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onOpenCreateModal,
}: KanbanBoardViewProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900";
      case "HIGH":
        return "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900";
      case "MEDIUM":
        return "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status === "COMPLETED") return false;
    return new Date(dueDate).getTime() < Date.now();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x no-scrollbar">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => {
          if (col.id === "TODO") return t.status === "TODO" || t.status === "CHANGES_REQUESTED";
          return t.status === col.id;
        });

        return (
          <div
            key={col.id}
            className={`w-80 shrink-0 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 flex flex-col snap-start backdrop-blur-sm ${col.columnBg}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3.5 px-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: col.accentColor }}
                />
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {col.title}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badgeBg}`}>
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal(col.id)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-2xs cursor-pointer"
                title="Quick Add Task in this stage"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-1 no-scrollbar">
              {columnTasks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-400">
                  <p className="font-medium">No tasks in this lane</p>
                  <button
                    onClick={() => onOpenCreateModal(col.id)}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" /> Add Task
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.status);
                  const progress =
                    task.subtasksCount > 0
                      ? Math.round((task.subtasksCompleted / task.subtasksCount) * 100)
                      : 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`group relative rounded-2xl bg-white dark:bg-zinc-900 border p-4 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
                        overdue
                          ? "border-rose-300 dark:border-rose-900/80 shadow-rose-500/5"
                          : task.status === "BLOCKED"
                          ? "border-rose-400 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20"
                          : "border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50"
                      }`}
                    >
                      {/* Department & Priority Top Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {task.departmentName ? (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                            style={{
                              backgroundColor: `${task.departmentColor || "#6366f1"}15`,
                              color: task.departmentColor || "#6366f1",
                            }}
                          >
                            {task.departmentName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono">GENERAL</span>
                        )}

                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </h4>

                      {/* Blocked Reason Snippet */}
                      {task.status === "BLOCKED" && task.blockedReason && (
                        <div className="mt-2.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[10px] font-medium text-rose-700 dark:text-rose-300 flex items-start gap-1.5 border border-rose-200 dark:border-rose-900">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                          <span className="line-clamp-2">{task.blockedReason}</span>
                        </div>
                      )}

                      {/* Changes Requested Banner */}
                      {task.status === "CHANGES_REQUESTED" && (
                        <div className="mt-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[10px] font-medium text-amber-800 dark:text-amber-300 flex items-start gap-1.5 border border-amber-200 dark:border-amber-900">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                          <span>Revisions requested by lead</span>
                        </div>
                      )}

                      {/* Linked Entity */}
                      {task.relatedEntityName && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500 truncate">
                          <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{task.relatedEntityName}</span>
                        </div>
                      )}

                      {/* Subtasks Progress Bar (if any) */}
                      {task.subtasksCount > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                            <span className="font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              {task.subtasksCompleted}/{task.subtasksCount} steps
                            </span>
                            <span className="font-mono">{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Bottom Row: Due Date, Assignee, Quick Advance */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                        {/* Due Date */}
                        {task.dueDate ? (
                          <div
                            className={`flex items-center gap-1 text-[10px] font-bold ${
                              overdue
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(task.dueDate).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            {overdue && <span className="text-[9px]">⚠️</span>}
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono">No deadline</span>
                        )}

                        {/* Assignee Avatar */}
                        {task.assigneeName ? (
                          <div
                            className="flex items-center gap-1.5"
                            title={`Assigned to ${task.assigneeName}`}
                          >
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[9px] font-black shadow-2xs">
                              {task.assigneeName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 max-w-[70px] truncate">
                              {task.assigneeName.split(" ")[0]}
                            </span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center text-[9px]">
                            ?
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
