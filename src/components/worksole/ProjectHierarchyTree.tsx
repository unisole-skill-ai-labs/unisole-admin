import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Layers,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  User,
  Calendar,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
} from "lucide-react";
import { ProjectHierarchy, SubProject, TaskItem, TaskSubtask } from "../../types";
import { useToggleSubtaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from "../../store";
import { cn } from "../../lib/utils";

interface ProjectHierarchyTreeProps {
  hierarchy: ProjectHierarchy;
  baseUrl: string;
  onOpenTask: (task: TaskItem) => void;
  onOpenCreateSubProject?: (projectId: string) => void;
  onOpenCreateTask?: (projectId: string, subProjectId?: string) => void;
  onEditProject?: () => void;
}

export const ProjectHierarchyTree: React.FC<ProjectHierarchyTreeProps> = ({
  hierarchy,
  baseUrl,
  onOpenTask,
  onOpenCreateSubProject,
  onOpenCreateTask,
  onEditProject,
}) => {
  const { project, subProjects = [], unassignedTasks = [] } = hierarchy;

  const [expandedSubProjects, setExpandedSubProjects] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    subProjects.forEach((sp) => {
      init[sp.id] = true;
    });
    return init;
  });

  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const [toggleSubtask] = useToggleSubtaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  const toggleSp = (spId: string) => {
    setExpandedSubProjects((prev) => ({ ...prev, [spId]: !prev[spId] }));
  };

  const toggleT = (tId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [tId]: !prev[tId] }));
  };

  const handleSubtaskCheck = async (e: React.MouseEvent, taskId: string, subtask: TaskSubtask) => {
    e.stopPropagation();
    try {
      await toggleSubtask({
        baseUrl,
        taskId,
        subtaskId: subtask.id,
        isCompleted: !subtask.isCompleted,
      }).unwrap();
    } catch (err) {
      console.error("Toggle subtask error:", err);
    }
  };

  const handleTaskStatusQuickChange = async (e: React.MouseEvent, task: TaskItem, newStatus: string) => {
    e.stopPropagation();
    try {
      await updateTask({
        baseUrl,
        id: task.id,
        body: { status: newStatus },
      }).unwrap();
    } catch (err) {
      console.error("Task quick status change error:", err);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Urgent</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">High</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Medium</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-normal rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">Low</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Done</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1"><Clock className="w-3 h-3 animate-spin" /> In Progress</span>;
      case "BLOCKED":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Blocked</span>;
      case "SUBMITTED_FOR_REVIEW":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Review</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">To-Do</span>;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* Tier 1: Project Header Node */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
            style={{ backgroundColor: project.color || "#6366f1" }}
          >
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {project.code}
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {project.name}
              </h2>
              {project.department && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {project.department.name}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Project Meta Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-right mr-3 hidden md:block">
            <div className="text-xs text-zinc-400 font-medium">Overall Progress</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              {project.progressPercentage || 0}% ({project.completedTasks || 0}/{project.totalTasks || 0} tasks)
            </div>
          </div>

          {onOpenCreateSubProject && (
            <button
              onClick={() => onOpenCreateSubProject(project.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" /> Add Sub-Project
            </button>
          )}

          {onOpenCreateTask && (
            <button
              onClick={() => onOpenCreateTask(project.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          )}

          {onEditProject && (
            <button
              onClick={onEditProject}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Edit Project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hierarchy Explorer Body */}
      <div className="mt-6 space-y-4">
        {/* Tier 2: Sub-Projects List */}
        {subProjects.length === 0 && unassignedTasks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <Folder className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No Sub-Projects or Tasks yet</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1 mb-4">
              Break this project down into Sub-Projects (Milestones) or create direct Tasks.
            </p>
            <div className="flex items-center justify-center gap-3">
              {onOpenCreateSubProject && (
                <button
                  onClick={() => onOpenCreateSubProject(project.id)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  + Add Sub-Project
                </button>
              )}
              {onOpenCreateTask && (
                <button
                  onClick={() => onOpenCreateTask(project.id)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  + Add Direct Task
                </button>
              )}
            </div>
          </div>
        ) : null}

        {subProjects.map((sp: SubProject) => {
          const isSpExpanded = !!expandedSubProjects[sp.id];
          const spTasks = sp.tasks || [];

          return (
            <div
              key={sp.id}
              className="border border-zinc-200 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden transition-all"
            >
              {/* Tier 2 Header: Sub-Project Milestone */}
              <div
                onClick={() => toggleSp(sp.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-4 cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors gap-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <button className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded">
                    {isSpExpanded ? (
                      <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400">Milestone:</span>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {sp.name}
                      </h3>
                      {sp.status === "COMPLETED" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          DONE
                        </span>
                      )}
                    </div>
                    {sp.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {sp.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sub-Project Meta & Task Actions */}
                <div className="flex items-center gap-3 sm:ml-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${sp.progressPercentage || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {sp.completedTasks || 0}/{sp.totalTasks || 0}
                    </span>
                  </div>

                  {sp.lead && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-medium">{sp.lead.name || sp.lead.phone}</span>
                    </div>
                  )}

                  {onOpenCreateTask && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCreateTask(project.id, sp.id);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Task
                    </button>
                  )}
                </div>
              </div>

              {/* Tier 3: Tasks in this Sub-Project */}
              {isSpExpanded && (
                <div className="pl-6 sm:pl-10 pr-3 sm:pr-4 py-3 space-y-2 border-t border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/40">
                  {spTasks.length === 0 ? (
                    <div className="py-4 text-center text-xs text-zinc-400 font-medium">
                      No tasks in this sub-project yet. Click "+ Task" to add one.
                    </div>
                  ) : (
                    spTasks.map((task: TaskItem) => renderTaskNode(task))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Direct Unassigned Tasks Under Project */}
        {unassignedTasks.length > 0 && (
          <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50/30 dark:bg-zinc-900/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <span>Direct Project Tasks</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {unassignedTasks.length}
                </span>
              </h4>
            </div>
            <div className="space-y-2">
              {unassignedTasks.map((task: TaskItem) => renderTaskNode(task))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderTaskNode(task: TaskItem) {
    const isTaskExpanded = !!expandedTasks[task.id];
    const subtasks = task.subtasks || [];
    const hasSubtasks = subtasks.length > 0;

    return (
      <div
        key={task.id}
        className={cn(
          "border rounded-xl bg-white dark:bg-zinc-900 p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-xs",
          task.status === "BLOCKED"
            ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10"
            : "border-zinc-200/80 dark:border-zinc-800"
        )}
      >
        <div
          onClick={() => onOpenTask(task)}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {hasSubtasks ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleT(task.id);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded"
              >
                {isTaskExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}

            {/* Quick complete button */}
            <button
              onClick={(e) =>
                handleTaskStatusQuickChange(
                  e,
                  task,
                  task.status === "COMPLETED" ? "TODO" : "COMPLETED"
                )
              }
              className="text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {task.status === "COMPLETED" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>

            <span
              className={cn(
                "text-sm font-semibold truncate",
                task.status === "COMPLETED"
                  ? "line-through text-zinc-400 dark:text-zinc-500"
                  : "text-zinc-800 dark:text-zinc-200"
              )}
            >
              {task.title}
            </span>

            {getPriorityBadge(task.priority)}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
            {getStatusBadge(task.status)}

            {task.assignee && (
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <User className="w-3 h-3 text-zinc-400" />
                {task.assignee.name || task.assignee.phone}
              </span>
            )}

            {task.dueDate && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}

            {hasSubtasks && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {task.subtasksCompleted || 0}/{subtasks.length} sub-tasks
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenTask(task);
              }}
              className="p-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              title="Open task details"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tier 4: Sub-Tasks Checklist */}
        {hasSubtasks && isTaskExpanded && (
          <div className="mt-3 pt-3 pl-8 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Checklist / Sub-Tasks
            </div>
            {subtasks.map((subtask: TaskSubtask) => (
              <div
                key={subtask.id}
                onClick={(e) => handleSubtaskCheck(e, task.id, subtask)}
                className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer select-none"
              >
                {subtask.isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                )}
                <span
                  className={cn(
                    "flex-1",
                    subtask.isCompleted
                      ? "line-through text-zinc-400 dark:text-zinc-500"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
};
