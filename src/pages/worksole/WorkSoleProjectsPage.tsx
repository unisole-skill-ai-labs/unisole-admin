import React, { useState } from "react";
import {
  Folder,
  Plus,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  useGetProjectsQuery,
  useGetDepartmentsQuery,
  useGetTeamMembersQuery,
  useGetTemplatesQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useToggleSubtaskMutation,
  useAddSubtaskMutation,
  useDeleteSubtaskMutation,
  useSubmitTaskProofMutation,
  useFlagTaskBlockedMutation,
  useReviewTaskMutation,
  useAddTaskCommentMutation,
  useDeleteTaskMutation,
} from "../../store";
import { Project, SubProject, TaskItem } from "../../types";
import { UnifiedWorkSoleAccordionKanban } from "../../components/worksole/UnifiedWorkSoleAccordionKanban";
import { ProjectCreateModal } from "../../components/worksole/ProjectCreateModal";
import { ProjectEditModal } from "../../components/worksole/ProjectEditModal";
import { SubProjectCreateModal } from "../../components/worksole/SubProjectCreateModal";
import { SubProjectEditModal } from "../../components/worksole/SubProjectEditModal";
import TaskCreateModal from "../../components/tasks/TaskCreateModal";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import { useSelector } from "react-redux";

interface WorkSoleProjectsPageProps {
  baseUrl: string;
}

export const WorkSoleProjectsPage: React.FC<WorkSoleProjectsPageProps> = ({ baseUrl }) => {
  const currentUser = useSelector((s: any) => s.auth.user);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateSubProjectOpen, setIsCreateSubProjectOpen] = useState(false);
  const [activeProjectIdForSubProject, setActiveProjectIdForSubProject] = useState<string>("");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [activeProjectIdForTask, setActiveProjectIdForTask] = useState<string>("");
  const [activeSubProjectIdForTask, setActiveSubProjectIdForTask] = useState<string>("");

  // Edit Modals state
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [selectedSubProjectForEdit, setSelectedSubProjectForEdit] = useState<SubProject | null>(null);
  const [isEditSubProjectOpen, setIsEditSubProjectOpen] = useState(false);
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<TaskItem | null>(null);

  const { data: projectsData, refetch: refetchProjects } = useGetProjectsQuery(baseUrl);
  const { data: deptsData } = useGetDepartmentsQuery(baseUrl);
  const { data: teamData } = useGetTeamMembersQuery(baseUrl);
  const { data: templatesData } = useGetTemplatesQuery(baseUrl);

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [toggleSubtask] = useToggleSubtaskMutation();
  const [addSubtask] = useAddSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();
  const [submitTaskProof] = useSubmitTaskProofMutation();
  const [flagTaskBlocked] = useFlagTaskBlockedMutation();
  const [reviewTask] = useReviewTaskMutation();
  const [addTaskComment] = useAddTaskCommentMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const projects: Project[] = projectsData?.data || [];
  const departments = deptsData?.data || [];
  const teamMembers = teamData?.data || [];
  const templates = templatesData?.data || [];

  const handleOpenCreateTask = (projId: string, subProjId?: string) => {
    setActiveProjectIdForTask(projId);
    setActiveSubProjectIdForTask(subProjId || "");
    setIsCreateTaskOpen(true);
  };

  const handleOpenCreateSubProject = (projId: string) => {
    setActiveProjectIdForSubProject(projId);
    setIsCreateSubProjectOpen(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setSelectedProjectForEdit(proj);
    setIsEditProjectOpen(true);
  };

  const handleOpenEditSubProject = (subProj: SubProject) => {
    setSelectedSubProjectForEdit(subProj);
    setIsEditSubProjectOpen(true);
  };

  const handleTaskSubmit = async (taskData: any) => {
    try {
      await createTask({
        baseUrl,
        body: taskData,
      }).unwrap();
      setIsCreateTaskOpen(false);
      refetchProjects();
    } catch (err) {
      console.error("Create task error:", err);
    }
  };

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
      refetchProjects();
    } catch (err) {
      console.error("Update task error:", err);
    }
  };

  // Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
  const totalTasksSum = projects.reduce((acc, p) => acc + (p.totalTasks || 0), 0);
  const completedTasksSum = projects.reduce((acc, p) => acc + (p.completedTasks || 0), 0);
  const overallPercentage = totalTasksSum > 0 ? Math.round((completedTasksSum / totalTasksSum) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                WorkSole Unified Execution Canvas
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                4-Tier Single-Screen Architecture: <span className="font-semibold text-indigo-600 dark:text-indigo-400">Project ➔ Sub-Project ➔ Task ➔ Sub-Task</span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateProjectOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* KPI Stats Radar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Projects</span>
            <Folder className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {totalProjects}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {activeProjects} currently active
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {completedProjects}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Delivered workstreams
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Tasks</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {totalTasksSum}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {completedTasksSum} completed ({overallPercentage}%)
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overall Velocity</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {overallPercentage}%
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${overallPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Main Unified 4-Tier Accordion & Kanban Canvas */}
      <UnifiedWorkSoleAccordionKanban
        baseUrl={baseUrl}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        onOpenCreateSubProject={handleOpenCreateSubProject}
        onOpenCreateTask={handleOpenCreateTask}
        onEditProject={handleOpenEditProject}
        onEditSubProject={handleOpenEditSubProject}
        onOpenTask={(task) => setSelectedTaskForDrawer(task)}
      />

      {/* Modals */}
      <ProjectCreateModal
        isOpen={isCreateProjectOpen}
        onClose={() => {
          setIsCreateProjectOpen(false);
          refetchProjects();
        }}
        baseUrl={baseUrl}
      />

      <ProjectEditModal
        isOpen={isEditProjectOpen}
        onClose={() => {
          setIsEditProjectOpen(false);
          setSelectedProjectForEdit(null);
        }}
        baseUrl={baseUrl}
        project={selectedProjectForEdit}
        onSuccess={() => refetchProjects()}
      />

      <SubProjectCreateModal
        isOpen={isCreateSubProjectOpen}
        onClose={() => {
          setIsCreateSubProjectOpen(false);
          refetchProjects();
        }}
        baseUrl={baseUrl}
        projectId={activeProjectIdForSubProject}
      />

      <SubProjectEditModal
        isOpen={isEditSubProjectOpen}
        onClose={() => {
          setIsEditSubProjectOpen(false);
          setSelectedSubProjectForEdit(null);
        }}
        baseUrl={baseUrl}
        subProject={selectedSubProjectForEdit}
        onSuccess={() => refetchProjects()}
      />

      <TaskCreateModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleTaskSubmit}
        departments={departments}
        teamMembers={teamMembers}
        templates={templates}
        projects={projects}
        defaultProjectId={activeProjectIdForTask}
        defaultSubProjectId={activeSubProjectIdForTask}
      />

      {/* Task Details & Edit Drawer */}
      {selectedTaskForDrawer && (
        <TaskDrawer
          task={selectedTaskForDrawer}
          currentUser={currentUser}
          departments={departments}
          teamMembers={teamMembers}
          onClose={() => setSelectedTaskForDrawer(null)}
          onUpdateStatus={async (taskId, status, note) => {
            try {
              const res = await updateTask({ baseUrl, id: taskId, body: { status, statusNote: note } }).unwrap();
              if (selectedTaskForDrawer?.id === taskId) setSelectedTaskForDrawer(res.data);
              refetchProjects();
            } catch (err) {
              console.error(err);
            }
          }}
          onToggleSubtask={async (taskId, subtaskId, isCompleted, title) => {
            try {
              const res = await toggleSubtask({ baseUrl, taskId, subtaskId, isCompleted, title }).unwrap();
              if (selectedTaskForDrawer?.id === taskId) setSelectedTaskForDrawer(res.data);
              refetchProjects();
            } catch (err) {
              console.error(err);
            }
          }}
          onAddSubtask={async (taskId, title) => {
            try {
              const res = await addSubtask({ baseUrl, taskId, title }).unwrap();
              if (selectedTaskForDrawer?.id === taskId) setSelectedTaskForDrawer(res.data);
              refetchProjects();
            } catch (err) {
              console.error(err);
            }
          }}
          onDeleteSubtask={async (taskId, subtaskId) => {
            try {
              const res = await deleteSubtask({ baseUrl, taskId, subtaskId }).unwrap();
              if (selectedTaskForDrawer?.id === taskId) setSelectedTaskForDrawer(res.data);
              refetchProjects();
            } catch (err) {
              console.error(err);
            }
          }}
          onSubmitProof={async (taskId, proofUrl, notes) => {
            try {
              const res = await submitTaskProof({ baseUrl, taskId, body: { submissionProofUrl: proofUrl, submissionNotes: notes } }).unwrap();
              if (selectedTaskForDrawer?.id === taskId) setSelectedTaskForDrawer(res.data);
              refetchProjects();
            } catch (err) {
              console.error(err);
            }
          }}
          onFlagBlocked={async (taskId, reason) => {
            try {
              const res = await flagTaskBlocked({ baseUrl, taskId, body: { blockedReason: reason } }).unwrap();
              if (selectedTaskForDrawer?.id === taskId) setSelectedTaskForDrawer(res.data);
              refetchProjects();
            } catch (err) {
              console.error(err);
            }
          }}
          onReviewTask={async (taskId, decision, notes) => {
            try {
              const res = await reviewTask({ baseUrl, taskId, body: { decision, reviewNotes: notes } }).unwrap();
              if (selectedTaskForDrawer?.id === taskId) setSelectedTaskForDrawer(res.data);
              refetchProjects();
            } catch (err) {
              console.error(err);
            }
          }}
          onAddComment={async (taskId, content) => {
            try {
              const res = await addTaskComment({ baseUrl, taskId, content }).unwrap();
              if (selectedTaskForDrawer?.id === taskId) setSelectedTaskForDrawer(res.data);
              refetchProjects();
            } catch (err) {
              console.error(err);
            }
          }}
          onDeleteTask={async (taskId) => {
            try {
              await deleteTask({ baseUrl, id: taskId }).unwrap();
              setSelectedTaskForDrawer(null);
              refetchProjects();
            } catch (err) {
              console.error(err);
            }
          }}
          onEditTask={handleEditTask}
        />
      )}
    </div>
  );
};
