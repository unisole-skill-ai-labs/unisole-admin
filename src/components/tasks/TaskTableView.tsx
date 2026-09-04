import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  MoreVertical,
  Link2,
  Calendar,
  User,
  ArrowUpDown,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { QuickDateBadge } from "../ui/DatePicker";
import { AssigneeBadge, TeamMemberOption } from "../ui/AssigneeBadge";

interface TaskTableViewProps {
  tasks: any[];
  onSelectTask: (task: any) => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
  onEditTask?: (taskId: string, updates: any) => void;
  teamMembers?: TeamMemberOption[];
  isLeader?: boolean;
}

export default function TaskTableView({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onEditTask,
  teamMembers = [],
  isLeader = false,
}: TaskTableViewProps) {
  const [sortField, setSortField] = useState<string>("dueDate");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300";
      case "IN_PROGRESS":
        return "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400";
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let valA = a[sortField] || "";
    let valB = b[sortField] || "";
    if (sortField === "dueDate") {
      valA = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
      valB = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
    }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/80 dark:bg-zinc-950/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
            <tr>
              <th
                onClick={() => handleSort("title")}
                className="px-5 py-3.5 cursor-pointer hover:text-indigo-600 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Task Title & Details</span>
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="px-4 py-3.5 cursor-pointer hover:text-indigo-600 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th
                onClick={() => handleSort("priority")}
                className="px-4 py-3.5 cursor-pointer hover:text-indigo-600 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="px-4 py-3.5">Assignee</th>
              <th className="px-4 py-3.5">Department</th>
              <th
                onClick={() => handleSort("dueDate")}
                className="px-4 py-3.5 cursor-pointer hover:text-indigo-600 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="px-4 py-3.5">Checklist</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-zinc-400">
                  <p className="font-semibold text-sm">No tasks matching your current filters</p>
                  <p className="text-xs mt-1">Try clearing filters or search query</p>
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  task.status !== "COMPLETED" &&
                  new Date(task.dueDate).getTime() < Date.now();

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-indigo-50/30 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Task Title */}
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {task.title}
                        </span>
                      </div>
                      {task.relatedEntityName && (
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                          <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{task.relatedEntityName}</span>
                        </div>
                      )}
                    </td>

                    {/* Status with Quick Dropdown */}
                    <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border-0 cursor-pointer ${getStatusBadge(
                          task.status
                        )}`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="BLOCKED">🚨 Blocked</option>
                        <option value="SUBMITTED_FOR_REVIEW">In Review</option>
                        <option value="CHANGES_REQUESTED">Changes</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`text-xs uppercase tracking-wider font-bold ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <AssigneeBadge
                        variant="assignee"
                        user={task.assignee}
                        userId={task.assigneeId}
                        userName={task.assigneeName}
                        userRole={task.assigneeRole}
                        teamMembers={teamMembers}
                        disabled={!isLeader || !onEditTask}
                        size="xs"
                        placeholder="+ Assign"
                        onSelect={(newAssigneeId) => {
                          if (onEditTask) {
                            onEditTask(task.id, {
                              assigneeId: newAssigneeId || null,
                            });
                          }
                        }}
                      />
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {task.departmentName ? (
                        <span
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-bold"
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
                    <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <QuickDateBadge
                        value={task.dueDate}
                        includeTime={true}
                        placeholder="+ Due Date"
                        size="xs"
                        disabled={!onEditTask}
                        onChange={(newVal) => {
                          if (onEditTask) {
                            onEditTask(task.id, {
                              dueDate: newVal ? new Date(newVal).toISOString() : null,
                            });
                          }
                        }}
                      />
                    </td>

                    {/* Subtasks Progress */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {task.subtasksCount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">
                            {task.subtasksCompleted}/{task.subtasksCount}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[10px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task);
                        }}
                        className="px-3 py-1 rounded-xl text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-900/60 transition-colors shadow-2xs"
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
