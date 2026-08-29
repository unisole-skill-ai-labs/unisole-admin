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
    columnBg: "bg-zinc-50/60 dark:bg-zinc-900/40",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "indigo",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400",
    columnBg: "bg-indigo-50/20 dark:bg-indigo-950/10",
  },
  {
    id: "BLOCKED",
    title: "🚨 Blocked / Stuck",
    color: "rose",
    badgeBg: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400",
    columnBg: "bg-rose-50/20 dark:bg-rose-950/10",
  },
  {
    id: "SUBMITTED_FOR_REVIEW",
    title: "Review Queue",
    color: "amber",
    badgeBg: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300",
    columnBg: "bg-amber-50/20 dark:bg-amber-950/10",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "emerald",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300",
    columnBg: "bg-emerald-50/20 dark:bg-emerald-950/10",
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
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => {
          if (col.id === "TODO") return t.status === "TODO" || t.status === "CHANGES_REQUESTED";
          return t.status === col.id;
        });

        return (
          <div
            key={col.id}
            className={`w-80 shrink-0 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 flex flex-col snap-start ${col.columnBg}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {col.title}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badgeBg}`}>
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal(col.id)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Quick Add Task"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
              {columnTasks.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-400">
                  No tasks here
                </div>
              ) : (
                columnTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.status);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`group relative rounded-xl bg-white dark:bg-zinc-900 border p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer ${
                        overdue
                          ? "border-rose-300 dark:border-rose-900/80"
                          : task.status === "BLOCKED"
                          ? "border-rose-400 dark:border-rose-800 bg-rose-50/20"
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
                        <div className="mt-2 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-[10px] font-medium text-rose-700 dark:text-rose-300 flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-rose-600" />
                          <span className="truncate">{task.blockedReason}</span>
                        </div>
                      )}

                      {/* Linked Entity */}
                      {task.relatedEntityName && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500 truncate">
                          <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{task.relatedEntityName}</span>
                        </div>
                      )}

                      {/* Bottom Row: Subtasks, Due Date, Assignee */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                        {/* Subtasks Progress */}
                        {task.subtasksCount > 0 ? (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>
                              {task.subtasksCompleted}/{task.subtasksCount}
                            </span>
                          </div>
                        ) : (
                          <span />
                        )}

                        {/* Due Date */}
                        {task.dueDate && (
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
                          </div>
                        )}

                        {/* Assignee Avatar */}
                        {task.assigneeName ? (
                          <div
                            className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[9px] font-bold"
                            title={`Assigned to ${task.assigneeName}`}
                          >
                            {task.assigneeName.charAt(0).toUpperCase()}
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
