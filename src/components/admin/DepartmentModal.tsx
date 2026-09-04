import React, { useState, useEffect } from "react";
import { X, Building2, Sparkles, User, Shield } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { cn } from "../../lib/utils";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useGetTeamMembersQuery,
} from "../../store";

export interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: {
    id?: string;
    name?: string;
    code?: string;
    color?: string;
    description?: string;
    leadId?: string;
    lead?: any;
  } | null;
  baseUrl: string;
  onSuccess?: () => void;
}

const COLOR_PRESETS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Orange", hex: "#f97316" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Zinc", hex: "#71717a" },
];

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  department,
  baseUrl,
  onSuccess,
}) => {
  const isEditing = Boolean(department?.id);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: teamData } = useGetTeamMembersQuery({ baseUrl });
  const teamMembers: any[] = teamData?.data || [];

  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (department) {
      setName(department.name || "");
      setCode(department.code || "");
      setColor(department.color || "#6366f1");
      setDescription(department.description || "");
      setLeadId(department.leadId || "");
    } else {
      setName("");
      setCode("");
      setColor("#6366f1");
      setDescription("");
      setLeadId("");
    }
    setError(null);
  }, [department, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Department name is required.");
      return;
    }
    if (!code.trim()) {
      setError("Department code is required (e.g. ENG, SALES).");
      return;
    }

    try {
      if (isEditing && department?.id) {
        await updateDepartment({
          baseUrl,
          id: department.id,
          body: {
            name: name.trim(),
            color,
            description: description.trim() || undefined,
            leadId: leadId || null,
          },
        }).unwrap();
      } else {
        await createDepartment({
          baseUrl,
          body: {
            name: name.trim(),
            code: code.trim().toUpperCase(),
            color,
            description: description.trim() || undefined,
            leadId: leadId || undefined,
          },
        }).unwrap();
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.data?.error || err?.message || "Failed to save department.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Department" : "Create New Department"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Live Preview Card */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs font-black text-xs"
              style={{ backgroundColor: color }}
            >
              {code.trim() ? code.trim().slice(0, 3).toUpperCase() : "DEP"}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {name.trim() || "Department Name"}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                  style={{
                    backgroundColor: `${color}18`,
                    color: color,
                  }}
                >
                  {code.trim().toUpperCase() || "CODE"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                {description.trim() || "Operational team department badge"}
              </p>
            </div>
          </div>
        </div>

        {/* Department Name & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Engineering, Sales, Outreach"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!isEditing && !code) {
                  setCode(e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase());
                }
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              placeholder="e.g. ENG"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={cn(
                "w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500",
                isEditing && "opacity-60 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800"
              )}
            />
          </div>
        </div>

        {/* Color Palette Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
            Badge Color Theme
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setColor(preset.hex)}
                className={cn(
                  "w-7 h-7 rounded-xl transition-all relative flex items-center justify-center cursor-pointer",
                  color === preset.hex
                    ? "ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-zinc-900 scale-110 shadow-md"
                    : "hover:scale-105 opacity-80 hover:opacity-100"
                )}
                style={{ backgroundColor: preset.hex }}
                title={preset.name}
              >
                {color === preset.hex && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                title="Custom Color"
              />
              <span className="text-[11px] font-mono text-zinc-400 uppercase">{color}</span>
            </div>
          </div>
        </div>

        {/* Department Lead Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Department Lead (Optional)</span>
          </label>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No Lead Assigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name || member.phone} ({member.role}) {member.designation ? `— ${member.designation}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
            Department Scope / Description
          </label>
          <textarea
            rows={2}
            placeholder="Brief details about what this department handles..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="text-xs font-bold px-5"
          >
            {isLoading ? "Saving..." : isEditing ? "Update Department" : "Create Department"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
