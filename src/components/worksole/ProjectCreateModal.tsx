import React, { useState } from "react";
import Modal from "../ui/Modal";
import { useCreateProjectMutation, useGetDepartmentsQuery, useGetTeamMembersQuery } from "../../store";
import { Folder, Plus, Trash2, Palette } from "lucide-react";
import { DatePicker } from "../ui/DatePicker";

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
}

const COLOR_OPTIONS = [
  "#6366f1", // Indigo
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Rose
  "#8b5cf6", // Purple
  "#ec4899", // Pink
];

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  baseUrl,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [startDate, setStartDate] = useState("");
  const [targetEndDate, setTargetEndDate] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [subProjectsList, setSubProjectsList] = useState<string[]>(["Phase 1: Discovery & Planning", "Phase 2: Execution"]);
  const [newSubProjectInput, setNewSubProjectInput] = useState("");

  const { data: deptsData } = useGetDepartmentsQuery(baseUrl);
  const { data: teamData } = useGetTeamMembersQuery(baseUrl);
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const departments = deptsData?.data || [];
  const teamMembers = teamData?.data || [];

  const handleAddSubProject = () => {
    if (newSubProjectInput.trim()) {
      setSubProjectsList([...subProjectsList, newSubProjectInput.trim()]);
      setNewSubProjectInput("");
    }
  };

  const handleRemoveSubProject = (index: number) => {
    setSubProjectsList(subProjectsList.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createProject({
        baseUrl,
        body: {
          name: name.trim(),
          code: code.trim() || undefined,
          description: description.trim() || undefined,
          departmentId: departmentId || undefined,
          leadId: leadId || undefined,
          priority,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          targetEndDate: targetEndDate ? new Date(targetEndDate).toISOString() : undefined,
          color,
          subProjects: subProjectsList,
        },
      }).unwrap();

      // Reset
      setName("");
      setCode("");
      setDescription("");
      setDepartmentId("");
      setLeadId("");
      setPriority("MEDIUM");
      setStartDate("");
      setTargetEndDate("");
      setColor("#6366f1");
      setSubProjectsList(["Phase 1: Discovery & Planning", "Phase 2: Execution"]);
      onClose();
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New WorkSole Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q4 Growth Launchpad"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Project Code (Optional)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. Q4-GROWTH"
              className="w-full px-3.5 py-2 text-sm font-mono uppercase rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
            Description & Objectives
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="High level objectives, targets, and deliverable scopes..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Department...</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Project Lead
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Owner / Lead...</option>
              {teamMembers.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.phone} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(val) => setStartDate(val)}
              placeholder="Select project kickoff date..."
            />
          </div>

          <div>
            <DatePicker
              label="Target Deadline"
              value={targetEndDate}
              onChange={(val) => setTargetEndDate(val)}
              placeholder="Select target completion date..."
            />
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Project Color Theme
          </label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-xl transition-transform ${
                  color === c ? "scale-110 ring-2 ring-offset-2 ring-indigo-500" : "opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Initial Sub-Projects (Milestones) */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
            Sub-Projects / Milestones (Tier 2)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSubProjectInput}
              onChange={(e) => setNewSubProjectInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSubProject();
                }
              }}
              placeholder="e.g. Phase 3: QA & Deployment"
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSubProject}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {subProjectsList.map((sp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{sp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubProject(idx)}
                  className="text-zinc-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
