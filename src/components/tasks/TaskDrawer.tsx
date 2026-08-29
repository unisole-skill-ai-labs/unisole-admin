import React, { useState } from "react";
import {
  X,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  Link2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import Button from "../ui/Button";

interface TaskDrawerProps {
  task: any | null;
  currentUser: any;
  departments: any[];
  teamMembers: any[];
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: string, note?: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onSubmitProof: (taskId: string, proofUrl: string, notes?: string) => void;
  onFlagBlocked: (taskId: string, reason: string) => void;
  onReviewTask: (taskId: string, decision: "APPROVED" | "CHANGES_REQUESTED", notes?: string) => void;
  onAddComment: (taskId: string, content: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskDrawer({
  task,
  currentUser,
  departments,
  teamMembers,
  onClose,
  onUpdateStatus,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onSubmitProof,
  onFlagBlocked,
  onReviewTask,
  onAddComment,
  onDeleteTask,
}: TaskDrawerProps) {
  if (!task) return null;

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [proofInput, setProofInput] = useState(task.submissionProofUrl || "");
  const [proofNotes, setProofNotes] = useState(task.submissionNotes || "");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [blockerReason, setBlockerReason] = useState(task.blockedReason || "");
  const [showBlockerInput, setShowBlockerInput] = useState(false);

  const isLeader = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(task.id, commentText.trim());
    setCommentText("");
  };

  const progressPercent =
    task.subtasks && task.subtasks.length > 0
      ? Math.round(
          (task.subtasks.filter((s: any) => s.isCompleted).length / task.subtasks.length) *
            100
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${task.departmentColor || "#6366f1"}15`,
                color: task.departmentColor || "#6366f1",
              }}
            >
              {task.departmentName || "General Task"}
            </span>
            <span className="text-xs text-zinc-400 font-mono">#{task.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {isLeader && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    onDeleteTask(task.id);
                  }
                }}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Status */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono tracking-wider">
                Priority: {task.priority}
              </span>

              {/* Status Switcher */}
              <select
                value={task.status}
                onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">🚨 Blocked / Stuck</option>
                <option value="SUBMITTED_FOR_REVIEW">Submitted for Review</option>
                <option value="CHANGES_REQUESTED">Changes Requested</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 leading-snug">
              {task.title}
            </h2>

            {task.description && (
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block mb-1">
                Assignee
              </span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {task.assigneeName || "Unassigned"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block mb-1">
                Due Date
              </span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No deadline"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block mb-1">
                Estimated Hours
              </span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {task.estimatedHours ? `${task.estimatedHours} hrs` : "N/A"}
              </span>
            </div>
          </div>

          {/* Linked Platform Entity */}
          {task.relatedEntityName && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 flex items-center gap-3">
              <Link2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="text-xs">
                <span className="text-zinc-500">Connected to {task.relatedEntityType}: </span>
                <strong className="text-indigo-700 dark:text-indigo-300">
                  {task.relatedEntityName}
                </strong>
              </div>
            </div>
          )}

          {/* 🚨 Blocked Banner & Action */}
          {task.status === "BLOCKED" && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black text-xs uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Task is Currently Blocked</span>
              </div>
              <p className="text-xs text-rose-900 dark:text-rose-200 font-medium">
                "{task.blockedReason || "Awaiting team support"}"
              </p>
            </div>
          )}

          {/* 📬 Leader Review Panel (When task is Submitted for Review or Leader is reviewing) */}
          {task.status === "SUBMITTED_FOR_REVIEW" && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Submission Awaiting Quality Sign-off</span>
              </div>

              {task.submissionProofUrl && (
                <div className="text-xs flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <span>Proof URL:</span>
                  <a
                    href={task.submissionProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-bold underline inline-flex items-center gap-1"
                  >
                    <span>{task.submissionProofUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {task.submissionNotes && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                  Notes: "{task.submissionNotes}"
                </p>
              )}

              {/* Leader Action Buttons */}
              {isLeader && (
                <div className="pt-2 border-t border-amber-200/80 dark:border-amber-900/60 space-y-2">
                  <input
                    type="text"
                    placeholder="Optional feedback notes for the team member..."
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onReviewTask(task.id, "APPROVED", reviewFeedback)}
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Approve & Mark Complete
                    </Button>
                    <button
                      onClick={() => onReviewTask(task.id, "CHANGES_REQUESTED", reviewFeedback)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                      Request Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SOP Subtasks Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                  SOP Subtasks ({task.subtasks?.length || 0})
                </span>
                {task.subtasks?.length > 0 && (
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {progressPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Checklist progress bar */}
            {task.subtasks?.length > 0 && (
              <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              {task.subtasks?.map((st: any) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 group text-xs"
                >
                  <button
                    onClick={() => onToggleSubtask(task.id, st.id, !st.isCompleted)}
                    className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
                  >
                    {st.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                    <span
                      className={`leading-relaxed ${
                        st.isCompleted
                          ? "line-through text-zinc-400 dark:text-zinc-500"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>

                  <button
                    onClick={() => onDeleteSubtask(task.id, st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="+ Add next step / checklist item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
              >
                Add
              </button>
            </form>
          </div>

          {/* Member Submission Section (If not completed yet) */}
          {task.status !== "COMPLETED" && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                Submit Work for Review
              </h4>
              <input
                type="url"
                placeholder="Proof Link (Google Doc, Figma, Canva, Staging URL)..."
                value={proofInput}
                onChange={(e) => setProofInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
              <input
                type="text"
                placeholder="Optional submission notes for reviewer..."
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
              <Button
                onClick={() => onSubmitProof(task.id, proofInput, proofNotes)}
                variant="primary"
                className="w-full text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Submit for Leader Review
              </Button>
            </div>
          )}

          {/* Comments & Activity Log */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <span>Activity & Comments ({task.comments?.length || 0})</span>
            </h4>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {task.comments?.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">
                      {c.userName || "Team Member"}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(c.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Post comment */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment or note..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
