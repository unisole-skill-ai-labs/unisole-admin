import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Folder,
  Plus,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  MoreVertical,
  Trash2,
  Edit2,
  Share2,
} from "lucide-react";
import {
  useGetProjectHierarchyQuery,
  useGetDepartmentsQuery,
  useGetTeamMembersQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from "../../store";
import { ProjectHierarchyTree } from "../../components/worksole/ProjectHierarchyTree";
import { ProjectEditModal } from "../../components/worksole/ProjectEditModal";
import { SubProjectCreateModal } from "../../components/worksole/SubProjectCreateModal";
import { SubProjectEditModal } from "../../components/worksole/SubProjectEditModal";
import { HierarchyShiftModal } from "../../components/worksole/HierarchyShiftModal";
import TaskCreateModal from "../../components/tasks/TaskCreateModal";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import { useSelector } from "react-redux";
import { SubProject, TaskItem, HierarchyItemType } from "../../types";

interface WorkSoleProjectDetailPageProps {
  baseUrl: string;
}

export const WorkSoleProjectDetailPage: React.FC<WorkSoleProjectDetailPageProps> = ({ baseUrl }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((s: any) => s.auth.user);

  const [isCreateSubProjectOpen, setIsCreateSubProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isEditSubProjectOpen, setIsEditSubProjectOpen] = useState(false);
  const [selectedSubProjectForEdit, setSelectedSubProjectForEdit] = useState<SubProject | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [activeSubProjectIdForTask, setActiveSubProjectIdForTask] = useState<string>("");
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<TaskItem | null>(null);

  const [shiftModalState, setShiftModalState] = useState<{
    isOpen: boolean;
    itemType: HierarchyItemType;
    item: any;
    parentItem?: any;
  }>({
    isOpen: false,
    itemType: "TASK",
    item: null,
  });

  const { data: hierarchyData, isLoading, refetch } = useGetProjectHierarchyQuery(
    { baseUrl, id: id || "" },
    { skip: !id }
  );

  const { data: deptsData } = useGetDepartmentsQuery(baseUrl);
  const { data: teamData } = useGetTeamMembersQuery(baseUrl);
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const hierarchy = hierarchyData?.data;
  const project = hierarchy?.project;
  const departments = deptsData?.data || [];
  const teamMembers = teamData?.data || [];

  const handleEditTask = async (taskId: string, updates: any) => {
    try {
      const res = await updateTask({
        baseUrl,
        id: taskId,
        body: updates,
      }).unwrap();
      if (selectedTaskForDrawer?.id === taskId) {
        setSelectedTaskForDrawer(res.data);
      }
      refetch();
    } catch (err) {
      console.error("Update task error:", err);
    }
  };

  const handleOpenCreateTask = (projId: string, subProjId?: string) => {
    setActiveSubProjectIdForTask(subProjId || "");
    setIsCreateTaskOpen(true);
  };

  const handleTaskSubmit = async (taskData: any) => {
    try {
      await createTask({
        baseUrl,
        body: taskData,
      }).unwrap();
      setIsCreateTaskOpen(false);
      refetch();
    } catch (err) {
      console.error("Create task error:", err);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Are you sure you want to delete this project and all its sub-projects?")) return;
    try {
      await deleteProject({ baseUrl, id }).unwrap();
      navigate("/worksole");
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-24">
        <Clock className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-2" />
        <p className="text-xs text-zinc-500">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-24">
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Project Not Found</h3>
        <button
          onClick={() => navigate("/worksole")}
          className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Nav & Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/worksole")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects Hub
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="p-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Project
          </button>
        </div>
      </div>

      {/* Main 4-Tier Interactive Tree */}
      {hierarchy && (
        <ProjectHierarchyTree
          hierarchy={hierarchy}
          baseUrl={baseUrl}
          onOpenTask={(task) => setSelectedTaskForDrawer(task)}
          onOpenCreateSubProject={() => setIsCreateSubProjectOpen(true)}
          onOpenCreateTask={handleOpenCreateTask}
          onEditProject={() => setIsEditProjectOpen(true)}
          onEditSubProject={(sp) => {
            setSelectedSubProjectForEdit(sp);
            setIsEditSubProjectOpen(true);
          }}
          onShiftHierarchy={(params) => setShiftModalState({ isOpen: true, ...params })}
        />
      )}

      {/* Hierarchy Shift / Promotion / Demotion Modal */}
      {shiftModalState.isOpen && (
        <HierarchyShiftModal
          isOpen={shiftModalState.isOpen}
          onClose={() => setShiftModalState((prev) => ({ ...prev, isOpen: false }))}
          baseUrl={baseUrl}
          itemType={shiftModalState.itemType}
          item={shiftModalState.item}
          parentItem={shiftModalState.parentItem}
          onSuccess={() => refetch()}
        />
      )}

      {/* Project Edit Modal */}
      {project && (
        <ProjectEditModal
          isOpen={isEditProjectOpen}
          onClose={() => setIsEditProjectOpen(false)}
          baseUrl={baseUrl}
          project={project}
          onSuccess={() => refetch()}
        />
      )}

      {/* SubProject Create Modal */}
      {id && (
        <SubProjectCreateModal
          isOpen={isCreateSubProjectOpen}
          onClose={() => {
            setIsCreateSubProjectOpen(false);
            refetch();
          }}
          baseUrl={baseUrl}
          projectId={id}
        />
      )}

      {/* SubProject Edit Modal */}
      <SubProjectEditModal
        isOpen={isEditSubProjectOpen}
        onClose={() => {
          setIsEditSubProjectOpen(false);
          setSelectedSubProjectForEdit(null);
        }}
        baseUrl={baseUrl}
        subProject={selectedSubProjectForEdit}
        onSuccess={() => refetch()}
      />

      {/* Task Create Modal */}
      {id && (
        <TaskCreateModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onSubmit={handleTaskSubmit}
          departments={departments}
          teamMembers={teamMembers}
          templates={[]}
          projects={project ? [project] : []}
          defaultProjectId={id}
          defaultSubProjectId={activeSubProjectIdForTask}
        />
      )}

      {/* Task Drawer */}
      {selectedTaskForDrawer && (
        <TaskDrawer
          task={selectedTaskForDrawer}
          currentUser={currentUser}
          departments={departments}
          teamMembers={teamMembers}
          onClose={() => setSelectedTaskForDrawer(null)}
          onUpdateStatus={() => refetch()}
          onToggleSubtask={() => refetch()}
          onAddSubtask={() => refetch()}
          onDeleteSubtask={() => refetch()}
          onSubmitProof={() => refetch()}
          onFlagBlocked={() => refetch()}
          onReviewTask={() => refetch()}
          onAddComment={() => refetch()}
          onDeleteTask={() => refetch()}
          onEditTask={handleEditTask}
          onShiftHierarchy={(params) => setShiftModalState({ isOpen: true, ...params })}
        />
      )}
    </div>
  );
};
