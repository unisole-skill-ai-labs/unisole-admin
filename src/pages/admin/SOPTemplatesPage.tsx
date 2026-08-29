import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetTemplatesQuery,
  useGetDepartmentsQuery,
  useCreateTemplateMutation,
} from "../../store";
import {
  FileCheck2,
  Plus,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  Layers,
  CheckCircle2,
} from "lucide-react";
import Button from "../../components/ui/Button";

export default function SOPTemplatesPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);
  const isLeader = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";

  const [departmentFilter, setDepartmentFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Template Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [guidelinesUrl, setGuidelinesUrl] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [stepInput, setStepInput] = useState("");

  const { data: deptRes } = useGetDepartmentsQuery(baseUrl);
  const departments = deptRes?.data || [];

  const { data: templatesRes, isLoading } = useGetTemplatesQuery({
    baseUrl,
    departmentId: departmentFilter || undefined,
  });
  const templates = templatesRes?.data || [];

  const [createTemplate] = useCreateTemplateMutation();

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepInput.trim()) return;
    setChecklistItems([...checklistItems, stepInput.trim()]);
    setStepInput("");
  };

  const handleRemoveStep = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTemplate({
        baseUrl,
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          departmentId: departmentId || undefined,
          defaultChecklist: checklistItems,
          guidelinesUrl: guidelinesUrl.trim() || undefined,
          estimatedHours: Number(estimatedHours) || 2,
        },
      }).unwrap();

      setIsCreateOpen(false);
      setTitle("");
      setDescription("");
      setChecklistItems([]);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to create SOP template");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <span>Standard Operating Procedures (SOPs)</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-mono">
              {templates.length} Templates
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Pre-loaded step-by-step checklists to guide learners and ensure quality execution.
          </p>
        </div>

        {isLeader && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="primary"
            className="flex items-center gap-2 text-xs font-black shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New SOP Template</span>
          </Button>
        )}
      </div>

      {/* Filter by Department */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDepartmentFilter("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            !departmentFilter
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
          }`}
        >
          All SOPs
        </button>
        {departments.map((dept: any) => (
          <button
            key={dept.id}
            onClick={() => setDepartmentFilter(dept.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              departmentFilter === dept.id
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
            }`}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full h-40 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
          </div>
        ) : (
          templates.map((tmpl: any) => {
            const checklist = Array.isArray(tmpl.defaultChecklist)
              ? tmpl.defaultChecklist
              : [];

            return (
              <div
                key={tmpl.id}
                className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Dept Pill & Est. Time */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-bold"
                      style={{
                        backgroundColor: `${tmpl.departmentColor || "#6366f1"}15`,
                        color: tmpl.departmentColor || "#6366f1",
                      }}
                    >
                      {tmpl.departmentName || "General Operations"}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{tmpl.estimatedHours || 2} hours</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    {tmpl.title}
                  </h3>
                  {tmpl.description && (
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {tmpl.description}
                    </p>
                  )}

                  {/* Checklist Preview */}
                  <div className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Standard Steps ({checklist.length}):
                    </span>
                    {checklist.map((step: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-zinc-800 dark:text-zinc-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {tmpl.guidelinesUrl && (
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    <a
                      href={tmpl.guidelinesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>View Extended SOP Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create SOP Template Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                Create Standard Operating Procedure (SOP)
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  SOP Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Webinar Auditorium Projector Setup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <option value="">General Operations</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Est. Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Brief Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="Why this SOP exists and when it should be executed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              {/* Steps */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Checklist Steps ({checklistItems.length})
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
                  {checklistItems.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-[11px]"
                    >
                      <span>
                        {idx + 1}. {st}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-zinc-400 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="+ Add step (e.g. Test microphone & audio level)..."
                    value={stepInput}
                    onChange={(e) => setStepInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary">
                  Save Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
