import React, { useState } from "react";
import {
  ShieldAlert,
  Layers,
  FileCheck2,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  useGetLeaderRadarQuery,
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetTasksQuery,
  useReviewTaskMutation,
} from "../../store";
import { useSelector } from "react-redux";
import Modal from "../../components/ui/Modal";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import { DepartmentModal } from "../../components/admin/DepartmentModal";
import { TaskItem } from "../../types";
import { cn } from "../../lib/utils";

interface AdminOpsPageProps {
  baseUrl: string;
}

export const AdminOpsPage: React.FC<AdminOpsPageProps> = ({ baseUrl }) => {
  const currentUser = useSelector((s: any) => s.auth.user);
  const [activeTab, setActiveTab] = useState<"radar" | "sop" | "departments">("radar");
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<TaskItem | null>(null);

  // SOP Modal state
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [sopTitle, setSopTitle] = useState("");
  const [sopDeptId, setSopDeptId] = useState("");
  const [sopEstHours, setSopEstHours] = useState(2);
  const [sopChecklistItems, setSopChecklistItems] = useState<string[]>([]);
  const [sopNewItemInput, setSopNewItemInput] = useState("");

  // Dept Modal state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState<any | null>(null);

  // Queries
  const { data: radarData, isLoading: isRadarLoading, refetch: refetchRadar } = useGetLeaderRadarQuery(baseUrl);
  const { data: templatesData, refetch: refetchTemplates } = useGetTemplatesQuery(baseUrl);
  const { data: deptsData, refetch: refetchDepts } = useGetDepartmentsQuery(baseUrl);
  const { data: submittedTasksData, refetch: refetchTasks } = useGetTasksQuery({
    baseUrl,
    params: { status: "SUBMITTED_FOR_REVIEW" },
  });

  const [createTemplate] = useCreateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [createDepartment] = useCreateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [reviewTask] = useReviewTaskMutation();

  const radar = radarData?.data || { blockedCount: 0, reviewCount: 0, overdueCount: 0, blockedTasks: [] };
  const templates = templatesData?.data || [];
  const departments = deptsData?.data || [];
  const reviewTasks: TaskItem[] = submittedTasksData?.data || [];

  const handleAddSopItem = () => {
    if (sopNewItemInput.trim()) {
      setSopChecklistItems([...sopChecklistItems, sopNewItemInput.trim()]);
      setSopNewItemInput("");
    }
  };

  const handleRemoveSopItem = (idx: number) => {
    setSopChecklistItems(sopChecklistItems.filter((_, i) => i !== idx));
  };

  const handleCreateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sopTitle.trim()) return;

    try {
      await createTemplate({
        baseUrl,
        body: {
          title: sopTitle.trim(),
          departmentId: sopDeptId || undefined,
          estimatedHours: Number(sopEstHours) || 2,
          defaultChecklist: sopChecklistItems,
        },
      }).unwrap();

      setIsSopModalOpen(false);
      setSopTitle("");
      setSopDeptId("");
      setSopEstHours(2);
      setSopChecklistItems([]);
      refetchTemplates();
    } catch (err) {
      console.error("Create SOP error:", err);
    }
  };

  const handleDeleteSop = async (id: string) => {
    if (!window.confirm("Delete this SOP template?")) return;
    try {
      await deleteTemplate({ baseUrl, id }).unwrap();
      refetchTemplates();
    } catch (err) {
      console.error("Delete SOP error:", err);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await deleteDepartment({ baseUrl, id }).unwrap();
      refetchDepts();
    } catch (err) {
      console.error("Delete dept error:", err);
    }
  };

  const handleReviewDecision = async (taskId: string, decision: "APPROVED" | "CHANGES_REQUESTED") => {
    try {
      await reviewTask({
        baseUrl,
        taskId,
        body: { decision },
      }).unwrap();
      refetchTasks();
      refetchRadar();
    } catch (err) {
      console.error("Review decision error:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Admin & Operations Console
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Executive Leader Radar, QA Review Queues, and SOP Checklist Templates
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab("radar")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all",
              activeTab === "radar"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            Leader Radar ({radar.blockedCount + radar.reviewCount})
          </button>
          <button
            onClick={() => setActiveTab("sop")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all",
              activeTab === "sop"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            SOP Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab("departments")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all",
              activeTab === "departments"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            Departments ({departments.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Leader Radar */}
      {activeTab === "radar" && (
        <div className="space-y-6">
          {/* Radar Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Blocked Deliverables</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
                {radar.blockedCount || 0}
              </div>
              <div className="text-xs text-rose-500/80 mt-1">
                Tasks flagged with active blockers requiring executive assistance
              </div>
            </div>

            <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">QA Review Queue</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                {reviewTasks.length || 0}
              </div>
              <div className="text-xs text-purple-500/80 mt-1">
                Deliverables submitted with proof awaiting leader review
              </div>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Overdue Alerts</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
                {radar.overdueCount || 0}
              </div>
              <div className="text-xs text-amber-500/80 mt-1">
                Tasks past their scheduled deadline
              </div>
            </div>
          </div>

          {/* QA Proof Review Queue Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-500" />
              <span>Deliverable Proof Review Queue</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                {reviewTasks.length} pending
              </span>
            </h3>

            {reviewTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                ✅ QA review queue is completely clear!
              </div>
            ) : (
              <div className="space-y-3">
                {reviewTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {task.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {task.assigneeName || "Assigned"}
                        </span>
                      </div>

                      {task.submissionProofUrl && (
                        <div className="text-xs text-indigo-600 dark:text-indigo-400">
                          <a
                            href={task.submissionProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold underline hover:text-indigo-700"
                          >
                            🔗 View Submitted Proof <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {task.submissionNotes && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          <strong>Notes:</strong> {task.submissionNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReviewDecision(task.id, "CHANGES_REQUESTED")}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900 transition-colors"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleReviewDecision(task.id, "APPROVED")}
                        className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                      >
                        ✓ Approve & Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: SOP Templates Manager */}
      {activeTab === "sop" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                SOP Checklist Templates
              </h3>
              <p className="text-xs text-zinc-500">
                Pre-loaded standard operating procedure checklists that automatically populate tasks
              </p>
            </div>
            <button
              onClick={() => setIsSopModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New SOP Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tmpl: any) => (
              <div
                key={tmpl.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {tmpl.title}
                    </h4>
                    <button
                      onClick={() => handleDeleteSop(tmpl.id)}
                      className="text-zinc-400 hover:text-rose-500 p-1 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {tmpl.departmentName || "General SOP"} • {tmpl.estimatedHours || 2}h
                  </span>

                  {Array.isArray(tmpl.defaultChecklist) && tmpl.defaultChecklist.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Checklist ({tmpl.defaultChecklist.length} steps):
                      </div>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {tmpl.defaultChecklist.map((step: string, idx: number) => (
                          <div
                            key={idx}
                            className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5"
                          >
                            <span className="text-zinc-400 font-mono text-[10px] mt-0.5">•</span>
                            <span className="line-clamp-1">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Departments Manager */}
      {activeTab === "departments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Team Departments
              </h3>
              <p className="text-xs text-zinc-500">
                Manage operational squads, functional codes, and department color badges
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDeptForEdit(null);
                setIsDeptModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Department
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept: any) => (
              <div
                key={dept.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: dept.color || "#6366f1" }}
                      />
                      <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                        {dept.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedDeptForEdit(dept);
                          setIsDeptModalOpen(true);
                        }}
                        className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(dept.id)}
                        className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {dept.name}
                  </h4>

                  {dept.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {dept.description}
                    </p>
                  )}
                </div>

                {dept.lead && (
                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <span className="text-zinc-400">Lead:</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                      {dept.lead.name || dept.lead.phone}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create SOP Modal */}
      <Modal
        isOpen={isSopModalOpen}
        onClose={() => setIsSopModalOpen(false)}
        title="Create SOP Checklist Template"
        size="md"
      >
        <form onSubmit={handleCreateSop} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Template Title *
            </label>
            <input
              type="text"
              required
              value={sopTitle}
              onChange={(e) => setSopTitle(e.target.value)}
              placeholder="e.g. College Onboarding SOP Checklist"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Department
              </label>
              <select
                value={sopDeptId}
                onChange={(e) => setSopDeptId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              >
                <option value="">General</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={sopEstHours}
                onChange={(e) => setSopEstHours(parseFloat(e.target.value) || 2)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Checklist Steps
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={sopNewItemInput}
                onChange={(e) => setSopNewItemInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSopItem();
                  }
                }}
                placeholder="e.g. Verify student list formatting..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSopItem}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {sopChecklistItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <span className="text-zinc-800 dark:text-zinc-200">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSopItem(idx)}
                    className="text-zinc-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsSopModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              Create Template
            </button>
          </div>
        </form>
      </Modal>

      {/* Department Create / Edit Modal */}
      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => {
          setIsDeptModalOpen(false);
          setSelectedDeptForEdit(null);
        }}
        department={selectedDeptForEdit}
        baseUrl={baseUrl}
        onSuccess={() => refetchDepts()}
      />
    </div>
  );
};
