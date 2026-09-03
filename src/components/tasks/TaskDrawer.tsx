import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
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
  Edit2,
  Save,
  FileCheck2,
  Copy,
  Check,
  Calendar,
  Layers,
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
  onEditTask?: (taskId: string, updates: any) => void;
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
  onEditTask,
}: TaskDrawerProps) {
  if (!task) return null;

  const isLeader = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // Tab State: 'overview', 'proof', 'activity'
  const [activeTab, setActiveTab] = useState<"overview" | "proof" | "activity">("overview");
  const [copied, setCopied] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title || "");
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [editPriority, setEditPriority] = useState(task.priority || "MEDIUM");
  const [editAssigneeId, setEditAssigneeId] = useState(task.assigneeId || "");
  const [editDeptId, setEditDeptId] = useState(task.departmentId || "");
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ""
  );
  const [editEstHours, setEditEstHours] = useState(task.estimatedHours || 2);
  const [editEntityType, setEditEntityType] = useState(task.relatedEntityType || "");
  const [editEntityName, setEditEntityName] = useState(task.relatedEntityName || "");

  // Interactive inputs state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [proofInput, setProofInput] = useState(task.submissionProofUrl || "");
  const [proofNotes, setProofNotes] = useState(task.submissionNotes || "");
  const [reviewFeedback, setReviewFeedback] = useState("");

  useEffect(() => {
    setEditTitle(task.title || "");
    setEditDesc(task.description || "");
    setEditPriority(task.priority || "MEDIUM");
    setEditAssigneeId(task.assigneeId || "");
    setEditDeptId(task.departmentId || "");
    setEditDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ""
    );
    setEditEstHours(task.estimatedHours || 2);
    setEditEntityType(task.relatedEntityType || "");
    setEditEntityName(task.relatedEntityName || "");
    setProofInput(task.submissionProofUrl || "");
    setProofNotes(task.submissionNotes || "");
    setIsEditing(false);
  }, [task.id]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(task.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !onEditTask) return;
    onEditTask(task.id, {
      title: editTitle.trim(),
      description: editDesc.trim() || null,
      priority: editPriority,
      assigneeId: editAssigneeId || null,
      departmentId: editDeptId || null,
      dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
      estimatedHours: Number(editEstHours) || 2,
      relatedEntityType: editEntityType || null,
      relatedEntityName: editEntityName.trim() || null,
    });
    setIsEditing(false);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  const handleToggleSubtaskWithConfetti = (subtaskId: string, isCompleted: boolean) => {
    onToggleSubtask(task.id, subtaskId, isCompleted);
    if (isCompleted && task.subtasks) {
      const completedCount = task.subtasks.filter((s: any) => s.isCompleted || s.id === subtaskId).length;
      if (completedCount === task.subtasks.length) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    }
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
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-zinc-200/80 dark:border-zinc-800 overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-950/70 backdrop-blur-md">
          <div className="flex items-center gap-2 flex-wrap">
            {task.projectName && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                📁 {task.projectCode ? `[${task.projectCode}] ` : ""}{task.projectName}
              </span>
            )}
            {task.subProjectName && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                📂 {task.subProjectName}
              </span>
            )}
            <span
              className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${task.departmentColor || "#6366f1"}18`,
                color: task.departmentColor || "#6366f1",
              }}
            >
              {task.departmentName || "General Task"}
            </span>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 text-xs text-zinc-400 font-mono hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              title="Click to copy Task ID"
            >
              <span>#{task.id}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-50" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isLeader && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isEditing
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5"
                    : "text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
                title="Edit Task Details"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing && <span>Editing</span>}
              </button>
            )}

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

        {/* Navigation Tabs */}
        {!isEditing && (
          <div className="flex border-b border-zinc-200/80 dark:border-zinc-800 px-6 bg-zinc-50/40 dark:bg-zinc-950/40">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                activeTab === "overview"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Overview & SOP
            </button>
            <button
              onClick={() => setActiveTab("proof")}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === "proof"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <span>Quality Gate & Proof</span>
              {task.submissionProofUrl && (
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === "activity"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <span>Activity & Comments</span>
              {task.comments?.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {task.comments.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* EDIT FORM MODE (Super Admin / Admin) */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950/80 border border-indigo-200 dark:border-indigo-900/60 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Edit Task
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-zinc-400 hover:text-zinc-600 font-bold"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Assignee
                  </label>
                  <select
                    value={editAssigneeId}
                    onChange={(e) => setEditAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.phone} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <select
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <option value="">General</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">🔴 Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={editEstHours}
                    onChange={(e) => setEditEstHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Connected Entity Type
                  </label>
                  <select
                    value={editEntityType}
                    onChange={(e) => setEditEntityType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <option value="">None</option>
                    <option value="COLLEGE">University / College</option>
                    <option value="PATHWAY">Pathway / Course</option>
                    <option value="PRESENTATION">Presentation Session</option>
                    <option value="TECH">Engineering Bug / Feature</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Connected Entity Name
                  </label>
                  <input
                    type="text"
                    value={editEntityName}
                    onChange={(e) => setEditEntityName(e.target.value)}
                    placeholder="e.g. IIT Delhi"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" className="text-xs font-bold px-4">
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Top Summary Bar */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono tracking-wider">
                    Priority: {task.priority}
                  </span>

                  {/* Status Switcher */}
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
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
                    {task.blockedReason || "No blocker details provided."}
                  </p>
                  {isLeader && (
                    <button
                      onClick={() => onUpdateStatus(task.id, "IN_PROGRESS", "Unblocked by leadership")}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Mark as Unblocked (Resume Work)</span>
                    </button>
                  )}
                </div>
              )}

              {/* TAB 1: OVERVIEW & SOP CHECKLIST */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase font-mono tracking-wider flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <span>SOP Step Checklist ({task.subtasks?.length || 0})</span>
                    </h3>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {progressPercent}% Complete
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5">
                    {task.subtasks?.map((st: any) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                      >
                        <button
                          onClick={() => handleToggleSubtaskWithConfetti(st.id, !st.isCompleted)}
                          className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                        >
                          {st.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-indigo-500 transition-colors" />
                          )}
                          <span
                            className={`text-xs ${
                              st.isCompleted
                                ? "line-through text-zinc-400 font-medium"
                                : "text-zinc-800 dark:text-zinc-200 font-medium"
                            }`}
                          >
                            {st.title}
                          </span>
                        </button>

                        <button
                          onClick={() => onDeleteSubtask(task.id, st.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Subtask Form */}
                  <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="+ Add next checklist step..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim()}
                      className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Add Step
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: PROOF & LEADER REVIEW QUALITY GATE */}
              {activeTab === "proof" && (
                <div className="space-y-4">
                  {task.submissionProofUrl ? (
                    <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          Submitted Deliverable Output
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold">
                          {task.status}
                        </span>
                      </div>

                      {/* Proof Link Card */}
                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Link2 className="w-4 h-4 text-indigo-500 shrink-0" />
                          <a
                            href={task.submissionProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                          >
                            {task.submissionProofUrl}
                          </a>
                        </div>
                        <a
                          href={task.submissionProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      {task.submissionNotes && (
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 italic p-3 rounded-xl bg-white/60 dark:bg-zinc-900/60">
                          "{task.submissionNotes}"
                        </p>
                      )}

                      {/* Review Decision Buttons (Leaders) */}
                      {isLeader && task.status === "SUBMITTED_FOR_REVIEW" && (
                        <div className="pt-3 border-t border-indigo-200/60 dark:border-indigo-900/60 space-y-2">
                          <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                            Leadership Quality Gate Action:
                          </span>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => onReviewTask(task.id, "APPROVED")}
                              variant="primary"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              Approve & Mark Complete
                            </Button>
                            <button
                              onClick={() => {
                                const note = prompt("Please enter what revisions are needed:");
                                if (note) onReviewTask(task.id, "CHANGES_REQUESTED", note);
                              }}
                              className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Request Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <ShieldCheck className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        No Submission Proof Yet
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-4">
                        When the deliverables are complete, submit a proof link (Loom video, Google Drive, Figma, or PR link) for leadership signoff.
                      </p>
                      <button
                        onClick={() => {
                          const url = prompt("Enter proof output URL (e.g. Google Drive, Loom, GitHub):");
                          if (url) {
                            const notes = prompt("Enter optional notes:");
                            onSubmitProof(task.id, url, notes || undefined);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        + Submit Proof Output
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ACTIVITY & AUDIT TRAIL */}
              {activeTab === "activity" && (
                <div className="space-y-4">
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {task.comments?.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic py-6 text-center">
                        No activity recorded yet. Post the first update below!
                      </p>
                    ) : (
                      task.comments?.map((c: any) => (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                {c.userName || "Team Member"}
                              </span>
                              {c.userRole && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                                  {c.userRole}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {new Date(c.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <input
                      type="text"
                      placeholder="Post a message, blocker update, or note..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!commentText.trim()}
                      className="text-xs px-4"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
