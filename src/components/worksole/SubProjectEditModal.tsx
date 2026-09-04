import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { useUpdateSubProjectMutation, useGetTeamMembersQuery } from "../../store";
import { DatePicker } from "../ui/DatePicker";
import { SubProject, SubProjectStatus } from "../../types";

interface SubProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
  subProject: SubProject | null;
  onSuccess?: () => void;
}

export const SubProjectEditModal: React.FC<SubProjectEditModalProps> = ({
  isOpen,
  onClose,
  baseUrl,
  subProject,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState("");
  const [status, setStatus] = useState<SubProjectStatus>("TODO");
  const [startDate, setStartDate] = useState("");
  const [targetEndDate, setTargetEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: teamData } = useGetTeamMembersQuery(baseUrl);
  const [updateSubProject, { isLoading }] = useUpdateSubProjectMutation();

  const teamMembers = teamData?.data || [];

  useEffect(() => {
    if (subProject) {
      setName(subProject.name || "");
      setDescription(subProject.description || "");
      setLeadId(subProject.leadId || "");
      setStatus(subProject.status || "TODO");
      setStartDate(subProject.startDate ? new Date(subProject.startDate).toISOString().slice(0, 10) : "");
      setTargetEndDate(subProject.targetEndDate ? new Date(subProject.targetEndDate).toISOString().slice(0, 10) : "");
      setError(null);
    }
  }, [subProject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subProject?.id) return;
    if (!name.trim()) {
      setError("Sub-project name is required.");
      return;
    }

    try {
      await updateSubProject({
        baseUrl,
        id: subProject.id,
        body: {
          name: name.trim(),
          description: description.trim() || undefined,
          leadId: leadId || null,
          status,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          targetEndDate: targetEndDate ? new Date(targetEndDate).toISOString() : null,
        },
      }).unwrap();

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.data?.error || err?.message || "Failed to update sub-project.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Sub-Project Milestone" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
            Sub-Project Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Module 2: Checkout & Payment Integration"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
            Description & Scope
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scope of this sub-project milestone..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Milestone Lead
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Lead...</option>
              {teamMembers.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.phone} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Milestone Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubProjectStatus)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">🚨 Blocked</option>
              <option value="COMPLETED">✅ Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(val) => setStartDate(val)}
              placeholder="Select start date..."
            />
          </div>

          <div>
            <DatePicker
              label="Target Deadline"
              value={targetEndDate}
              onChange={(val) => setTargetEndDate(val)}
              placeholder="Select deadline..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isLoading ? "Saving..." : "Save Milestone Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
