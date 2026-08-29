import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  MoreVertical,
  Link2,
  Calendar,
  User,
} from "lucide-react";

interface TaskTableViewProps {
  tasks: any[];
  onSelectTask: (task: any) => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
}

export default function TaskTableView({
  tasks,
  onSelectTask,
  onUpdateStatus,
}: TaskTableViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300";
      case "IN_PROGRESS":
        return "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400";
      case "BLOCKED":
        return "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold";
      case "SUBMITTED_FOR_REVIEW":
        return "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold";
      case "CHANGES_REQUESTED":
        return "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-bold";
      case "COMPLETED":
        return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-rose-600 dark:text-rose-400 font-black";
      case "HIGH":
        return "text-orange-600 dark:text-orange-400 font-bold";
      case "MEDIUM":
        return "text-indigo-600 dark:text-indigo-400 font-medium";
      default:
        return "text-zinc-500 font-medium";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Task Title & Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-zinc-400 italic">
                  No tasks matching your current criteria
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  task.status !== "COMPLETED" &&
                  new Date(task.dueDate).getTime() < Date.now();

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Task Title */}
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {task.title}
                        </span>
                      </div>
                      {task.relatedEntityName && (
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                          <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{task.relatedEntityName}</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${getStatusBadge(
                          task.status
                        )}`}
                      >
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`text-xs uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {task.assigneeName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[9px] font-bold">
                            {task.assigneeName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {task.assigneeName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px] italic">Unassigned</span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
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
                        <span className="text-zinc-400 text-[10px]">—</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {task.dueDate ? (
                        <span
                          className={`font-semibold ${
                            isOverdue
                              ? "text-rose-600 dark:text-rose-400 font-bold"
                              : "text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {new Date(task.dueDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                          {isOverdue && " ⚠️"}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[10px]">No deadline</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
