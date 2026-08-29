import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Send,
  Clock,
  Sparkles,
  Link2,
  ArrowRight,
  HelpCircle,
  Calendar,
  Layers,
  FileCheck2,
  Trophy,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Button from "../ui/Button";

interface LearnerFocusViewProps {
  tasks: any[];
  onSelectTask: (task: any) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
  onOpenSubmitModal: (task: any) => void;
  onOpenBlockedModal: (task: any) => void;
}

export default function LearnerFocusView({
  tasks,
  onSelectTask,
  onToggleSubtask,
  onOpenSubmitModal,
  onOpenBlockedModal,
}: LearnerFocusViewProps) {
  // Sort tasks into priority buckets
  const activeFocusTask =
    tasks.find(
      (t) =>
        t.status === "IN_PROGRESS" ||
        t.status === "BLOCKED" ||
        t.status === "CHANGES_REQUESTED"
    ) || tasks.find((t) => t.status === "TODO");

  const queuedTasks = tasks.filter(
    (t) =>
      t.id !== activeFocusTask?.id &&
      (t.status === "TODO" || t.status === "IN_PROGRESS")
  );

  const reviewTasks = tasks.filter((t) => t.status === "SUBMITTED_FOR_REVIEW");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const calculateProgress = (task: any) => {
    if (!task?.subtasksCount || task.subtasksCount === 0) return 0;
    return Math.round((task.subtasksCompleted / task.subtasksCount) * 100);
  };

  const handleChecklistToggle = (
    taskId: string,
    subtaskId: string,
    nextCompleted: boolean,
    currentProgress: number,
    totalCount: number
  ) => {
    onToggleSubtask(taskId, subtaskId, nextCompleted);

    // If toggling on the final item, trigger confetti celebration!
    if (nextCompleted && currentProgress >= Math.round(((totalCount - 1) / totalCount) * 100)) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback gracefully if confetti unavailable
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 🌟 HERO FOCUS CARD */}
      {activeFocusTask ? (
        <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/80 via-white to-white dark:from-indigo-950/40 dark:via-zinc-900 dark:to-zinc-900 p-6 sm:p-8 shadow-xl shadow-indigo-500/5">
          {/* Subtle Ambient Background Orb */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Tag & Status */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Primary Focus Now
              </span>
              {activeFocusTask.departmentName && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${activeFocusTask.departmentColor || "#6366f1"}18`,
                    color: activeFocusTask.departmentColor || "#6366f1",
                  }}
                >
                  {activeFocusTask.departmentName}
                </span>
              )}
            </div>

            {activeFocusTask.dueDate && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-white/90 dark:bg-zinc-800/90 px-3 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-700 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Due:{" "}
                  {new Date(activeFocusTask.dueDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="relative z-10 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
              {activeFocusTask.title}
            </h2>
            {activeFocusTask.description && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                {activeFocusTask.description}
              </p>
            )}

            {activeFocusTask.relatedEntityName && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  Linked to {activeFocusTask.relatedEntityType}:{" "}
                  <strong>{activeFocusTask.relatedEntityName}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Blocker Alert Banner if Blocked */}
          {activeFocusTask.status === "BLOCKED" && (
            <div className="relative z-10 mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Currently Flagged as Blocked
                </h4>
                <p className="text-xs text-rose-900 dark:text-rose-200 mt-0.5 font-medium">
                  {activeFocusTask.blockedReason || "Waiting for team assistance"}
                </p>
              </div>
            </div>
          )}

          {/* Changes Requested Banner */}
          {activeFocusTask.status === "CHANGES_REQUESTED" && (
            <div className="relative z-10 mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Leader Requested Revisions
                </h4>
                <p className="text-xs text-amber-900 dark:text-amber-200 mt-0.5 font-medium">
                  Please review feedback notes and resubmit proof when complete.
                </p>
              </div>
            </div>
          )}

          {/* SOP Checklist Section */}
          <div className="relative z-10 p-5 rounded-2xl bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 mb-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 font-mono">
                  SOP Step-by-Step Execution
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {activeFocusTask.subtasksCompleted || 0} /{" "}
                {activeFocusTask.subtasksCount || 0} Done (
                {calculateProgress(activeFocusTask)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${calculateProgress(activeFocusTask)}%` }}
              />
            </div>

            {/* Checklist items */}
            {activeFocusTask.subtasks && activeFocusTask.subtasks.length > 0 ? (
              <div className="space-y-2">
                {activeFocusTask.subtasks.map((st: any) => (
                  <button
                    key={st.id}
                    onClick={() =>
                      handleChecklistToggle(
                        activeFocusTask.id,
                        st.id,
                        !st.isCompleted,
                        calculateProgress(activeFocusTask),
                        activeFocusTask.subtasksCount
                      )
                    }
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left transition-colors cursor-pointer border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-800"
                  >
                    {st.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 animate-scale-in" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5 hover:text-indigo-600" />
                    )}
                    <span
                      className={`text-xs font-medium leading-relaxed ${
                        st.isCompleted
                          ? "line-through text-zinc-400 dark:text-zinc-500"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-2">
                No subtasks defined. Click "Inspect Details" to view full guidelines.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => onOpenBlockedModal(activeFocusTask)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-900 transition-all cursor-pointer shadow-2xs"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>🚨 I Am Blocked / Need Help</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onSelectTask(activeFocusTask)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shadow-2xs"
              >
                Inspect Details
              </button>
              <Button
                onClick={() => onOpenSubmitModal(activeFocusTask)}
                variant="primary"
                className="flex items-center gap-2 font-black shadow-md shadow-indigo-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Leader Review</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
            All Caught Up! 🎉
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
            You have no pending tasks right now. Great job! Check with your team lead or explore SOP guides.
          </p>
        </div>
      )}

      {/* 📋 QUEUED TASKS */}
      {queuedTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
              Up Next For Today ({queuedTasks.length})
            </h3>
          </div>

          <div className="grid gap-3">
            {queuedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 transition-colors shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                      {task.departmentName && <span>{task.departmentName}</span>}
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {task.priority === "URGENT" && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                      URGENT
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📬 SUBMITTED FOR REVIEW QUEUE */}
      {reviewTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
            Awaiting Leader Review ({reviewTasks.length})
          </h3>

          <div className="grid gap-3">
            {reviewTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 cursor-pointer hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {task.title}
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      Under review by team leadership
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  In Review
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
