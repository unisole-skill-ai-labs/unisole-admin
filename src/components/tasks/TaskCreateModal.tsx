import React, { useState } from "react";
import {
  X,
  Sparkles,
  FileCheck2,
  Calendar,
  User,
  Clock,
  Link2,
} from "lucide-react";
import Button from "../ui/Button";

interface TaskCreateModalProps {
  isOpen: boolean;
  departments: any[];
  teamMembers: any[];
  templates: any[];
  defaultStatus?: string;
  defaultAssigneeId?: string;
  defaultDepartmentId?: string;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
}

export default function TaskCreateModal({
  isOpen,
  departments,
  teamMembers,
  templates,
  defaultStatus = "TODO",
  defaultAssigneeId = "",
  defaultDepartmentId = "",
  onClose,
  onSubmit,
}: TaskCreateModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [departmentId, setDepartmentId] = useState(defaultDepartmentId);
  const [assigneeId, setAssigneeId] = useState(defaultAssigneeId);
  const [templateId, setTemplateId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<number>(2);
  const [relatedEntityType, setRelatedEntityType] = useState("");
  const [relatedEntityName, setRelatedEntityName] = useState("");
  const [customSubtasks, setCustomSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");

  const handleTemplateChange = (tmplId: string) => {
    setTemplateId(tmplId);
    if (!tmplId) return;

    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      if (!title) setTitle(tmpl.title);
      if (tmpl.description && !description) setDescription(tmpl.description);
      if (tmpl.departmentId) setDepartmentId(tmpl.departmentId);
      if (tmpl.estimatedHours) setEstimatedHours(tmpl.estimatedHours);
      if (Array.isArray(tmpl.defaultChecklist)) {
        setCustomSubtasks(tmpl.defaultChecklist);
      }
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    setCustomSubtasks([...customSubtasks, newSubtaskInput.trim()]);
    setNewSubtaskInput("");
  };

  const handleRemoveSubtask = (index: number) => {
    setCustomSubtasks(customSubtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: defaultStatus,
      departmentId: departmentId || undefined,
      assigneeId: assigneeId || undefined,
      templateId: templateId || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      estimatedHours: Number(estimatedHours) || 2,
      relatedEntityType: relatedEntityType || undefined,
      relatedEntityName: relatedEntityName.trim() || undefined,
      subtasks: customSubtasks,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                Create New Task / Deliverable
              </h3>
              <p className="text-[11px] text-zinc-500">
                Assign work with pre-loaded SOP checklists and deadlines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick SOP Template Selector */}
          {templates && templates.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60">
              <label className="block text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1.5 font-mono">
                ⚡ Optional: Pick a Pre-built SOP Template
              </label>
              <select
                value={templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                <option value="">-- Blank Custom Task --</option>
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.title} ({tmpl.departmentName || "General"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Onboard IIT Delhi EC Branch & Upload Student List"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Instructions & Context
            </label>
            <textarea
              rows={2}
              placeholder="Provide context, required outputs, or reference links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Assignee & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Unassigned (Open pool)</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.phone} ({m.role}) {m.activeTasksCount ? `[${m.activeTasksCount} active]` : "[Idle]"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="">General Operations</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority, Due Date & Estimated Hours */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">🔴 Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Linked Platform Entity (Optional) */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1 font-mono">
                Connect Entity Type
              </label>
              <select
                value={relatedEntityType}
                onChange={(e) => setRelatedEntityType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="">None (Generic)</option>
                <option value="COLLEGE">University / College</option>
                <option value="PATHWAY">Pathway / Curriculum</option>
                <option value="PRESENTATION">Live Roadshow Session</option>
                <option value="TECH">Product / Bug Fix</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1 font-mono">
                Entity Name / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. IIT Delhi or Session #102"
                value={relatedEntityName}
                onChange={(e) => setRelatedEntityName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* SOP Subtasks Checklist Editor */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              SOP Checklist Items ({customSubtasks.length})
            </label>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {customSubtasks.map((st, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-xs"
                >
                  <span className="text-zinc-800 dark:text-zinc-200 truncate font-medium">
                    {i + 1}. {st}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(i)}
                    className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="+ Add checklist step..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
              >
                Add Step
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" className="text-xs font-bold px-5">
              Create & Assign Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
