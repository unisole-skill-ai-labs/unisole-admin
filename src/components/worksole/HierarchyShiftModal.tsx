import React, { useState } from "react";
import Modal from "../ui/Modal";
import {
  Folder,
  Layers,
  CheckSquare,
  Circle,
  ArrowUpRight,
  ArrowDownRight,
  MoveRight,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  useUpgradeSubtaskMutation,
  useDowngradeTaskMutation,
  useUpgradeTaskMutation,
  useDowngradeSubProjectMutation,
  useUpgradeSubProjectMutation,
  useDowngradeProjectMutation,
  useMoveHierarchyItemMutation,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "../../store";
import { Project, SubProject, TaskItem, TaskSubtask, HierarchyItemType } from "../../types";
import { cn } from "../../lib/utils";

export { type HierarchyItemType };

interface HierarchyShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
  itemType: HierarchyItemType;
  item: any;
  parentItem?: any;
  onSuccess?: () => void;
}

export const HierarchyShiftModal: React.FC<HierarchyShiftModalProps> = ({
  isOpen,
  onClose,
  baseUrl,
  itemType,
  item,
  parentItem,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"UPGRADE" | "DOWNGRADE" | "MOVE">(() => {
    if (itemType === "SUBTASK") return "UPGRADE";
    if (itemType === "PROJECT") return "DOWNGRADE";
    return "UPGRADE";
  });

  // Target selectors state
  const [targetProjectId, setTargetProjectId] = useState<string>("");
  const [targetSubProjectId, setTargetSubProjectId] = useState<string>("");
  const [targetTaskId, setTargetTaskId] = useState<string>("");
  const [projectCode, setProjectCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { data: projectsData } = useGetProjectsQuery(baseUrl);
  const { data: tasksData } = useGetTasksQuery({ baseUrl, params: { limit: 100 } });

  const [upgradeSubtask, { isLoading: isUpgradingSubtask }] = useUpgradeSubtaskMutation();
  const [downgradeTask, { isLoading: isDowngradingTask }] = useDowngradeTaskMutation();
  const [upgradeTask, { isLoading: isUpgradingTask }] = useUpgradeTaskMutation();
  const [downgradeSubProject, { isLoading: isDowngradingSubProject }] = useDowngradeSubProjectMutation();
  const [upgradeSubProject, { isLoading: isUpgradingSubProject }] = useUpgradeSubProjectMutation();
  const [downgradeProject, { isLoading: isDowngradingProject }] = useDowngradeProjectMutation();
  const [moveHierarchyItem, { isLoading: isMovingItem }] = useMoveHierarchyItemMutation();

  const isExecuting =
    isUpgradingSubtask ||
    isDowngradingTask ||
    isUpgradingTask ||
    isDowngradingSubProject ||
    isUpgradingSubProject ||
    isDowngradingProject ||
    isMovingItem;

  const projects: Project[] = projectsData?.data || [];
  const allTasks: TaskItem[] = tasksData?.data || [];

  const selectedProject = projects.find((p) => p.id === targetProjectId);
  const availableSubProjects = selectedProject?.subProjects || [];

  // Allowed tabs based on itemType
  const canUpgrade = itemType !== "PROJECT";
  const canDowngrade = itemType !== "SUBTASK";
  const canMove = true;

  const getItemName = () => {
    if (!item) return "";
    return item.title || item.name || "Selected Item";
  };

  const getTierBadge = (type: HierarchyItemType) => {
    switch (type) {
      case "PROJECT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/20">
            <Folder className="w-3.5 h-3.5" /> Tier 1: Project
          </span>
        );
      case "SUB_PROJECT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20">
            <Layers className="w-3.5 h-3.5" /> Tier 2: Sub-Project Milestone
          </span>
        );
      case "TASK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20">
            <CheckSquare className="w-3.5 h-3.5" /> Tier 3: Task
          </span>
        );
      case "SUBTASK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
            <Circle className="w-3.5 h-3.5" /> Tier 4: Sub-Task Checklist
          </span>
        );
    }
  };

  const getTargetTier = (type: HierarchyItemType, action: "UPGRADE" | "DOWNGRADE" | "MOVE") => {
    if (action === "MOVE") return type;
    if (action === "UPGRADE") {
      if (type === "SUBTASK") return "TASK";
      if (type === "TASK") return "SUB_PROJECT";
      if (type === "SUB_PROJECT") return "PROJECT";
      return "PROJECT";
    }
    if (action === "DOWNGRADE") {
      if (type === "PROJECT") return "SUB_PROJECT";
      if (type === "SUB_PROJECT") return "TASK";
      if (type === "TASK") return "SUBTASK";
      return "SUBTASK";
    }
    return type;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (activeTab === "UPGRADE") {
        if (itemType === "SUBTASK") {
          const taskId = parentItem?.id || item.taskId;
          await upgradeSubtask({ baseUrl, taskId, subtaskId: item.id }).unwrap();
        } else if (itemType === "TASK") {
          await upgradeTask({
            baseUrl,
            taskId: item.id,
            targetProjectId: targetProjectId || item.projectId,
          }).unwrap();
        } else if (itemType === "SUB_PROJECT") {
          await upgradeSubProject({
            baseUrl,
            subProjectId: item.id,
            code: projectCode.trim() || undefined,
          }).unwrap();
        }
      } else if (activeTab === "DOWNGRADE") {
        if (itemType === "PROJECT") {
          if (!targetProjectId) {
            setError("Please select a target project to house this milestone.");
            return;
          }
          await downgradeProject({ baseUrl, projectId: item.id, targetProjectId }).unwrap();
        } else if (itemType === "SUB_PROJECT") {
          await downgradeSubProject({
            baseUrl,
            subProjectId: item.id,
            targetProjectId: targetProjectId || item.projectId,
            targetSubProjectId: targetSubProjectId || undefined,
          }).unwrap();
        } else if (itemType === "TASK") {
          if (!targetTaskId) {
            setError("Please select a target parent task.");
            return;
          }
          await downgradeTask({ baseUrl, taskId: item.id, targetTaskId }).unwrap();
        }
      } else if (activeTab === "MOVE") {
        if (itemType === "TASK") {
          await moveHierarchyItem({
            baseUrl,
            body: {
              itemType: "TASK",
              itemId: item.id,
              targetProjectId: targetProjectId || null,
              targetSubProjectId: targetSubProjectId || null,
            },
          }).unwrap();
        } else if (itemType === "SUB_PROJECT") {
          if (!targetProjectId) {
            setError("Please select a target project.");
            return;
          }
          await moveHierarchyItem({
            baseUrl,
            body: {
              itemType: "SUB_PROJECT",
              itemId: item.id,
              targetProjectId,
            },
          }).unwrap();
        } else if (itemType === "SUBTASK") {
          if (!targetTaskId) {
            setError("Please select a target task.");
            return;
          }
          await moveHierarchyItem({
            baseUrl,
            body: {
              itemType: "SUBTASK",
              itemId: item.id,
              targetTaskId,
            },
          }).unwrap();
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.data?.error || err?.message || "Failed to shift hierarchy level.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Hierarchy Level & Re-parent" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Item Display */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Target Item
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-sm text-zinc-900 dark:text-white truncate">
              {getItemName()}
            </div>
            {getTierBadge(itemType)}
          </div>
        </div>

        {/* Action Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl">
          {canUpgrade && (
            <button
              type="button"
              onClick={() => setActiveTab("UPGRADE")}
              className={cn(
                "py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === "UPGRADE"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>Promote Level</span>
            </button>
          )}

          {canDowngrade && (
            <button
              type="button"
              onClick={() => setActiveTab("DOWNGRADE")}
              className={cn(
                "py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === "DOWNGRADE"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-amber-500" />
              <span>Demote Level</span>
            </button>
          )}

          {canMove && (
            <button
              type="button"
              onClick={() => setActiveTab("MOVE")}
              className={cn(
                "py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === "MOVE"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <MoveRight className="w-3.5 h-3.5 text-blue-500" />
              <span>Re-parent / Move</span>
            </button>
          )}
        </div>

        {/* Visual Level Transformation Banner */}
        <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">Current Tier</div>
            <div>{getTierBadge(itemType)}</div>
          </div>

          <ArrowRight className="w-5 h-5 text-indigo-500" />

          <div className="space-y-0.5 text-right">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">New Tier</div>
            <div>{getTierBadge(getTargetTier(itemType, activeTab))}</div>
          </div>
        </div>

        {/* Form Fields according to action & type */}
        {activeTab === "UPGRADE" && (
          <div className="space-y-3">
            {itemType === "SUBTASK" && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                This checklist step will be promoted to a full independent <strong>Task</strong> within the same project milestone with its own assignees, priority, and sub-checklists.
              </p>
            )}

            {itemType === "TASK" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This task will become a <strong>Sub-Project Milestone</strong>, and all its existing sub-tasks will automatically be converted into tasks!
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Target Project (Leave empty to keep in current project)
                  </label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="">Current Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {itemType === "SUB_PROJECT" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This milestone will be converted into a full independent <strong>Project</strong>. All its tasks will become tasks of the new project.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    New Project Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PRJ2"
                    className="w-full px-3 py-2 text-sm uppercase font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "DOWNGRADE" && (
          <div className="space-y-3">
            {itemType === "PROJECT" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This Project will become a <strong>Sub-Project Milestone</strong> inside another parent Project. All its tasks will be preserved inside the new milestone.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Select Target Parent Project *
                  </label>
                  <select
                    required
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="">Select Parent Project...</option>
                    {projects
                      .filter((p) => p.id !== item.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {itemType === "SUB_PROJECT" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This Sub-Project milestone will be condensed into a single <strong>Task</strong>, and all its tasks will be turned into subtask checklist steps.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Destination Project
                  </label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => {
                      setTargetProjectId(e.target.value);
                      setTargetSubProjectId("");
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="">Keep in Current Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {itemType === "TASK" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Convert this Task into a checklist <strong>Sub-Task</strong> under another task.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Select Target Parent Task *
                  </label>
                  <select
                    required
                    value={targetTaskId}
                    onChange={(e) => setTargetTaskId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="">Select Target Task...</option>
                    {allTasks
                      .filter((t) => t.id !== item.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.status})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "MOVE" && (
          <div className="space-y-3">
            {itemType === "TASK" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Move to Project
                  </label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => {
                      setTargetProjectId(e.target.value);
                      setTargetSubProjectId("");
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="">Select Target Project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Move to Sub-Project Milestone (Optional)
                  </label>
                  <select
                    value={targetSubProjectId}
                    onChange={(e) => setTargetSubProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="">Direct Project Task (No Milestone)</option>
                    {availableSubProjects.map((sp: any) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {itemType === "SUB_PROJECT" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                  Move to Another Project *
                </label>
                <select
                  required
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                >
                  <option value="">Select Destination Project...</option>
                  {projects
                    .filter((p) => p.id !== item.projectId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {itemType === "SUBTASK" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                  Move to Another Task *
                </label>
                <select
                  required
                  value={targetTaskId}
                  onChange={(e) => setTargetTaskId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                >
                  <option value="">Select Destination Task...</option>
                  {allTasks
                    .filter((t) => t.id !== (parentItem?.id || item.taskId))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isExecuting}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isExecuting ? "Executing Shift..." : "Execute Hierarchy Change"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
