import React, { useState } from "react";
import Modal from "../ui/Modal";
import { useCreateSubProjectMutation, useGetTeamMembersQuery } from "../../store";

interface SubProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
  projectId: string;
}

export const SubProjectCreateModal: React.FC<SubProjectCreateModalProps> = ({
  isOpen,
  onClose,
  baseUrl,
  projectId,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetEndDate, setTargetEndDate] = useState("");

  const { data: teamData } = useGetTeamMembersQuery(baseUrl);
  const [createSubProject, { isLoading }] = useCreateSubProjectMutation();

  const teamMembers = teamData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) return;

    try {
      await createSubProject({
        baseUrl,
        projectId,
        body: {
          name: name.trim(),
          description: description.trim() || undefined,
          leadId: leadId || undefined,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          targetEndDate: targetEndDate ? new Date(targetEndDate).toISOString() : undefined,
        },
      }).unwrap();

      setName("");
      setDescription("");
      setLeadId("");
      setStartDate("");
      setTargetEndDate("");
      onClose();
    } catch (err) {
      console.error("Failed to create subproject:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Sub-Project (Milestone)" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
            Description & Scope
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scope of this sub-project milestone..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
            Milestone Lead (Optional)
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              value={targetEndDate}
              onChange={(e) => setTargetEndDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
            {isLoading ? "Adding..." : "Add Sub-Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
