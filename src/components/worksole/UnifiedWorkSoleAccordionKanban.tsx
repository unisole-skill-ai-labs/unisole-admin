import React, { useState } from "react";
import {
  Folder,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Calendar,
  CheckSquare,
  Send,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import {
  useGetProjectsQuery,
  useGetProjectHierarchyQuery,
  useUpdateProjectMutation,
  useUpdateSubProjectMutation,
  useUpdateTaskMutation,
  useToggleSubtaskMutation,
  useAddSubtaskMutation,
  useDeleteSubtaskMutation,
  useGetDepartmentsQuery,
  useGetTeamMembersQuery,
} from "../../store";
import { Project, SubProject, TaskItem, TaskSubtask, TaskStatus } from "../../types";
import { cn } from "../../lib/utils";
import confetti from "canvas-confetti";
import { QuickDateBadge } from "../ui/DatePicker";
import { AssigneeBadge, TeamMemberOption } from "../ui/AssigneeBadge";
import { useSelector } from "react-redux";

interface UnifiedWorkSoleProps {
  baseUrl: string;
  onOpenCreateProject: () => void;
  onOpenCreateSubProject: (projectId: string) => void;
  onOpenCreateTask: (projectId: string, subProjectId?: string) => void;
  onEditProject?: (project: Project) => void;
  onEditSubProject?: (subProject: SubProject) => void;
  onOpenTask?: (task: TaskItem) => void;
}

const KANBAN_COLUMNS: Array<{
  id: TaskStatus;
  title: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  icon: any;
}> = [
  {
    id: "TODO",
    title: "To-Do",
    color: "text-zinc-700 dark:text-zinc-300",
    bgLight: "bg-zinc-100/70",
    bgDark: "dark:bg-zinc-800/40",
    borderLight: "border-zinc-200",
    borderDark: "dark:border-zinc-800",
    icon: Circle,
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-50/50",
    bgDark: "dark:bg-indigo-950/20",
    borderLight: "border-indigo-200/60",
    borderDark: "dark:border-indigo-900/40",
    icon: Clock,
  },
  {
    id: "BLOCKED",
    title: "Blocked",
    color: "text-rose-600 dark:text-rose-400",
    bgLight: "bg-rose-50/50",
    bgDark: "dark:bg-rose-950/20",
    borderLight: "border-rose-200/60",
    borderDark: "dark:border-rose-900/40",
    icon: AlertTriangle,
  },
  {
    id: "SUBMITTED_FOR_REVIEW",
    title: "In Review",
    color: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50/50",
    bgDark: "dark:bg-purple-950/20",
    borderLight: "border-purple-200/60",
    borderDark: "dark:border-purple-900/40",
    icon: Send,
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50/50",
    bgDark: "dark:bg-emerald-950/20",
    borderLight: "border-emerald-200/60",
    borderDark: "dark:border-emerald-900/40",
    icon: CheckCircle2,
  },
];

export const UnifiedWorkSoleAccordionKanban: React.FC<UnifiedWorkSoleProps> = ({
  baseUrl,
  onOpenCreateProject,
  onOpenCreateSubProject,
  onOpenCreateTask,
  onEditProject,
  onEditSubProject,
  onOpenTask,
}) => {
  // State for expanded projects (Tier 1 Accordion)
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  // Filter state
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const { data: projectsData, isLoading: isProjectsLoading } = useGetProjectsQuery({
    baseUrl,
    departmentId: departmentFilter || undefined,
    search: search || undefined,
  });

  const { data: deptsData } = useGetDepartmentsQuery(baseUrl);
  const { data: teamData } = useGetTeamMembersQuery(baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);
  const isLeader = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";

  const projects: Project[] = projectsData?.data || [];
  const departments = deptsData?.data || [];
  const teamMembers = teamData?.data || [];

  // Toggle Project Accordion
  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // Expand / Collapse All
  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    projects.forEach((p) => {
      all[p.id] = true;
    });
    setExpandedProjects(all);
  };

  const handleCollapseAll = () => {
    setExpandedProjects({});
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search projects, sub-projects, tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Collapse All
          </button>
          <button
            onClick={onOpenCreateProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>
      </div>

      {/* Tier 1: Projects Accordion List */}
      {isProjectsLoading ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <Clock className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Loading WorkSole projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <Folder className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Projects Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Create your first project to start cascading sub-projects and task Kanban boards.
          </p>
          <button
            onClick={onOpenCreateProject}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm"
          >
            + Create First Project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectAccordionItem
              key={project.id}
              project={project}
              isExpanded={!!expandedProjects[project.id]}
              onToggle={() => toggleProject(project.id)}
              baseUrl={baseUrl}
              teamMembers={teamMembers}
              isLeader={isLeader}
              onOpenCreateSubProject={onOpenCreateSubProject}
              onOpenCreateTask={onOpenCreateTask}
              onEditProject={onEditProject}
              onEditSubProject={onEditSubProject}
              onOpenTask={onOpenTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// TIER 1: PROJECT ACCORDION COMPONENT
// ============================================================
interface ProjectAccordionItemProps {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
  baseUrl: string;
  teamMembers?: TeamMemberOption[];
  isLeader?: boolean;
  onOpenCreateSubProject: (projectId: string) => void;
  onOpenCreateTask: (projectId: string, subProjectId?: string) => void;
  onEditProject?: (project: Project) => void;
  onEditSubProject?: (subProject: SubProject) => void;
  onOpenTask?: (task: TaskItem) => void;
}

const ProjectAccordionItem: React.FC<ProjectAccordionItemProps> = ({
  project,
  isExpanded,
  onToggle,
  baseUrl,
  teamMembers = [],
  isLeader = false,
  onOpenCreateSubProject,
  onOpenCreateTask,
  onEditProject,
  onEditSubProject,
  onOpenTask,
}) => {
  // Query hierarchy for this project when expanded
  const { data: hierarchyData, isLoading } = useGetProjectHierarchyQuery(
    { baseUrl, id: project.id },
    { skip: !isExpanded }
  );

  const [updateProject] = useUpdateProjectMutation();
  const [expandedSubProjects, setExpandedSubProjects] = useState<Record<string, boolean>>({});

  const hierarchy = hierarchyData?.data;
  const subProjects: SubProject[] = hierarchy?.subProjects || [];
  const unassignedTasks: TaskItem[] = hierarchy?.unassignedTasks || [];

  // Auto-expand first subproject when project expands
  React.useEffect(() => {
    if (isExpanded && subProjects.length > 0 && Object.keys(expandedSubProjects).length === 0) {
      setExpandedSubProjects({ [subProjects[0].id]: true });
    }
  }, [isExpanded, subProjects]);

  const toggleSubProject = (spId: string) => {
    setExpandedSubProjects((prev) => ({
      ...prev,
      [spId]: !prev[spId],
    }));
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs overflow-hidden transition-all">
      {/* Tier 1 Accordion Header */}
      <div
        onClick={onToggle}
        className={cn(
          "flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer select-none transition-colors gap-3",
          isExpanded
            ? "bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800"
            : "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 font-bold"
            style={{ backgroundColor: project.color || "#6366f1" }}
          >
            <Folder className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {project.code}
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {project.name}
              </h3>
              {project.department && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {project.department.name}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5 max-w-xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Project Owner, Metrics & Actions */}
        <div className="flex items-center gap-3 sm:ml-auto flex-wrap">
          {/* Project Owner / Lead Badge upfront */}
          <div onClick={(e) => e.stopPropagation()}>
            <AssigneeBadge
              variant="owner"
              label="Lead"
              user={project.lead || project.createdBy}
              userId={project.leadId}
              teamMembers={teamMembers}
              disabled={!isLeader}
              size="sm"
              placeholder="+ Assign Owner"
              onSelect={async (newLeadId) => {
                try {
                  await updateProject({
                    baseUrl,
                    id: project.id,
                    body: { leadId: newLeadId || null },
                  }).unwrap();
                } catch (err) {
                  console.error("Update project lead error:", err);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-20 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${project.progressPercentage || 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {project.progressPercentage || 0}%
            </span>
          </div>

          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
            {project.completedTasks || 0}/{project.totalTasks || 0} tasks
          </span>

          <div className="flex items-center gap-1.5">
            {isLeader && onEditProject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Edit Project Name & Details"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateSubProject(project.id);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200/60 dark:border-indigo-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Sub-Project
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateTask(project.id);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Direct Task
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Sub-Projects Accordions & Nested Kanbans */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 bg-zinc-50/30 dark:bg-zinc-950/20">
          {isLoading ? (
            <div className="text-center py-8">
              <Clock className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-1" />
              <p className="text-xs text-zinc-400">Loading sub-projects & Kanban boards...</p>
            </div>
          ) : subProjects.length === 0 && unassignedTasks.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              <Layers className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                No Sub-Projects or Tasks created in this project yet.
              </p>
              <button
                onClick={() => onOpenCreateSubProject(project.id)}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                + Add First Sub-Project Milestone
              </button>
            </div>
          ) : (
            <>
              {/* List of Sub-Project Accordions */}
              {subProjects.map((subProject) => (
                <SubProjectAccordionItem
                  key={subProject.id}
                  subProject={subProject}
                  projectId={project.id}
                  isExpanded={!!expandedSubProjects[subProject.id]}
                  onToggle={() => toggleSubProject(subProject.id)}
                  baseUrl={baseUrl}
                  teamMembers={teamMembers}
                  isLeader={isLeader}
                  onOpenCreateTask={onOpenCreateTask}
                  onEditSubProject={onEditSubProject}
                  onOpenTask={onOpenTask}
                />
              ))}

              {/* Direct Unassigned Project Tasks Kanban */}
              {unassignedTasks.length > 0 && (
                <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                      <span>⚡ Direct Project Tasks</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                        {unassignedTasks.length} tasks
                      </span>
                    </h4>
                  </div>
                  <TaskKanbanBoard
                    tasks={unassignedTasks}
                    baseUrl={baseUrl}
                    teamMembers={teamMembers}
                    isLeader={isLeader}
                    onOpenTask={onOpenTask}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// TIER 2: SUB-PROJECT ACCORDION COMPONENT
// ============================================================
interface SubProjectAccordionItemProps {
  subProject: SubProject;
  projectId: string;
  isExpanded: boolean;
  onToggle: () => void;
  baseUrl: string;
  teamMembers?: TeamMemberOption[];
  isLeader?: boolean;
  onOpenCreateTask: (projectId: string, subProjectId?: string) => void;
  onEditSubProject?: (subProject: SubProject) => void;
  onOpenTask?: (task: TaskItem) => void;
}

const SubProjectAccordionItem: React.FC<SubProjectAccordionItemProps> = ({
  subProject,
  projectId,
  isExpanded,
  onToggle,
  baseUrl,
  teamMembers = [],
  isLeader = false,
  onOpenCreateTask,
  onEditSubProject,
  onOpenTask,
}) => {
  const [updateSubProject] = useUpdateSubProjectMutation();
  const tasks = subProject.tasks || [];

  return (
    <div className="border border-zinc-200 dark:border-zinc-800/90 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
      {/* Tier 2 Accordion Header */}
      <div
        onClick={onToggle}
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between p-3.5 cursor-pointer select-none transition-colors gap-3",
          isExpanded
            ? "bg-indigo-50/30 dark:bg-indigo-950/20 border-b border-zinc-200 dark:border-zinc-800"
            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
        )}
      >
        <div className="flex items-center gap-2.5">
          <button className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                {subProject.name}
              </span>
              {subProject.status === "COMPLETED" && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-600">
                  DONE
                </span>
              )}
            </div>
            {subProject.description && (
              <p className="text-[11px] text-zinc-400 line-clamp-1">{subProject.description}</p>
            )}
          </div>
        </div>

        {/* Milestone Lead, Meta & Add Task Button */}
        <div className="flex items-center gap-3 sm:ml-auto flex-wrap">
          {/* Subproject Lead Badge upfront */}
          <div onClick={(e) => e.stopPropagation()}>
            <AssigneeBadge
              variant="lead"
              label="Milestone Lead"
              user={subProject.lead}
              userId={subProject.leadId}
              teamMembers={teamMembers}
              disabled={!isLeader}
              size="xs"
              placeholder="+ Assign Lead"
              onSelect={async (newLeadId) => {
                try {
                  await updateSubProject({
                    baseUrl,
                    id: subProject.id,
                    body: { leadId: newLeadId || null },
                  }).unwrap();
                } catch (err) {
                  console.error("Update subproject lead error:", err);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <span>{subProject.completedTasks || 0}/{subProject.totalTasks || 0} tasks</span>
            <span>({subProject.progressPercentage || 0}%)</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isLeader && onEditSubProject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSubProject(subProject);
                }}
                className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Edit Sub-Project Milestone"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateTask(projectId, subProject.id);
              }}
              className="px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Task
            </button>
          </div>
        </div>
      </div>

      {/* Tier 3: Embedded Horizontal Kanban Board */}
      {isExpanded && (
        <div className="p-3 sm:p-4 bg-zinc-50/40 dark:bg-zinc-950/40 overflow-x-auto">
          <TaskKanbanBoard
            tasks={tasks}
            baseUrl={baseUrl}
            teamMembers={teamMembers}
            isLeader={isLeader}
            onOpenTask={onOpenTask}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================
// TIER 3: INLINE HORIZONTAL KANBAN BOARD
// ============================================================
interface TaskKanbanBoardProps {
  tasks: TaskItem[];
  baseUrl: string;
  teamMembers?: TeamMemberOption[];
  isLeader?: boolean;
  onOpenTask?: (task: TaskItem) => void;
}

const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  baseUrl,
  teamMembers = [],
  isLeader = false,
  onOpenTask,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 min-w-[850px] md:min-w-0">
      {KANBAN_COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const ColIcon = col.icon;

        return (
          <div
            key={col.id}
            className={cn(
              "rounded-xl border p-2.5 flex flex-col justify-start min-h-[200px]",
              col.bgLight,
              col.bgDark,
              col.borderLight,
              col.borderDark
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-1.5">
                <ColIcon className={cn("w-3.5 h-3.5", col.color)} />
                <span className={cn("text-xs font-bold", col.color)}>{col.title}</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards in Column */}
            <div className="space-y-2 flex-1">
              {columnTasks.length === 0 ? (
                <div className="h-full flex items-center justify-center py-6 text-center text-[11px] text-zinc-400 font-medium">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => (
                  <KanbanTaskCard
                    key={task.id}
                    task={task}
                    baseUrl={baseUrl}
                    teamMembers={teamMembers}
                    isLeader={isLeader}
                    onOpenTask={onOpenTask}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// TIER 4: TASK CARD WITH NESTED SUB-TASK MICRO-KANBAN / MATRIX
// ============================================================
interface KanbanTaskCardProps {
  task: TaskItem;
  baseUrl: string;
  teamMembers?: TeamMemberOption[];
  isLeader?: boolean;
  onOpenTask?: (task: TaskItem) => void;
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  baseUrl,
  teamMembers = [],
  isLeader = false,
  onOpenTask,
}) => {
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");

  const [updateTask] = useUpdateTaskMutation();
  const [toggleSubtask] = useToggleSubtaskMutation();
  const [addSubtask] = useAddSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();

  const subtasks = task.subtasks || [];
  const todoSubtasks = subtasks.filter((st) => !st.isCompleted);
  const doneSubtasks = subtasks.filter((st) => st.isCompleted);

  const handleStatusShift = async (newStatus: TaskStatus) => {
    try {
      await updateTask({
        baseUrl,
        id: task.id,
        body: { status: newStatus },
      }).unwrap();
    } catch (err) {
      console.error("Status shift error:", err);
    }
  };

  const handleToggleSubtask = async (st: TaskSubtask) => {
    try {
      const isNowCompleted = !st.isCompleted;
      await toggleSubtask({
        baseUrl,
        taskId: task.id,
        subtaskId: st.id,
        isCompleted: isNowCompleted,
      }).unwrap();

      if (isNowCompleted && subtasks.length > 0 && doneSubtasks.length + 1 === subtasks.length) {
        try {
          confetti({ particleCount: 40, spread: 50 });
        } catch (e) {}
      }
    } catch (err) {
      console.error("Toggle subtask error:", err);
    }
  };

  const handleSaveSubtaskTitle = async (st: TaskSubtask) => {
    if (!editingSubtaskTitle.trim()) return;
    try {
      await toggleSubtask({
        baseUrl,
        taskId: task.id,
        subtaskId: st.id,
        isCompleted: st.isCompleted,
        title: editingSubtaskTitle.trim(),
      }).unwrap();
      setEditingSubtaskId(null);
    } catch (err) {
      console.error("Save subtask title error:", err);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await addSubtask({
        baseUrl,
        taskId: task.id,
        title: newSubtaskTitle.trim(),
      }).unwrap();
      setNewSubtaskTitle("");
    } catch (err) {
      console.error("Add subtask error:", err);
    }
  };

  const handleDeleteSubtask = async (stId: string) => {
    try {
      await deleteSubtask({
        baseUrl,
        taskId: task.id,
        subtaskId: stId,
      }).unwrap();
    } catch (err) {
      console.error("Delete subtask error:", err);
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-900 border rounded-xl p-2.5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all",
        task.status === "BLOCKED"
          ? "border-rose-300 dark:border-rose-900 bg-rose-50/20"
          : "border-zinc-200 dark:border-zinc-800"
      )}
    >
      {/* Priority, Date & Assignee Upfront */}
      <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
        <span
          className={cn(
            "text-[9px] font-bold px-1.5 py-0.2 rounded-full",
            task.priority === "URGENT"
              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              : task.priority === "HIGH"
              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
          )}
        >
          {task.priority}
        </span>

        <QuickDateBadge
          value={task.dueDate}
          includeTime={true}
          placeholder="+ Due Date"
          onChange={async (newVal) => {
            try {
              await updateTask({
                baseUrl,
                id: task.id,
                body: { dueDate: newVal ? new Date(newVal).toISOString() : null },
              }).unwrap();
            } catch (err) {
              console.error("Update due date error:", err);
            }
          }}
        />
      </div>

      {/* Task Assignee upfront badge */}
      <div className="mb-2">
        <AssigneeBadge
          variant="assignee"
          user={task.assignee}
          userId={task.assigneeId}
          userName={task.assigneeName}
          userRole={task.assigneeRole}
          teamMembers={teamMembers}
          disabled={!isLeader}
          size="xs"
          placeholder="+ Assignee"
          onSelect={async (newAssigneeId) => {
            try {
              await updateTask({
                baseUrl,
                id: task.id,
                body: { assigneeId: newAssigneeId || null },
              }).unwrap();
            } catch (err) {
              console.error("Update task assignee error:", err);
            }
          }}
        />
      </div>

      {/* Title & Edit Trigger */}
      <div className="flex items-start justify-between gap-1 group/title mb-1">
        <h5
          onClick={() => onOpenTask?.(task)}
          className={cn(
            "text-xs font-bold text-zinc-900 dark:text-white leading-tight flex-1",
            onOpenTask && "cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          )}
        >
          {task.title}
        </h5>
        {onOpenTask && (
          <button
            onClick={() => onOpenTask(task)}
            className="opacity-0 group-hover/title:opacity-100 p-0.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            title="Edit Task Details"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {task.description && (
        <p
          onClick={() => onOpenTask?.(task)}
          className={cn(
            "text-[11px] text-zinc-400 line-clamp-2 mb-2",
            onOpenTask && "cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300"
          )}
        >
          {task.description}
        </p>
      )}

      {task.blockedReason && (
        <div className="text-[10px] p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 mb-2">
          <strong>Blocker:</strong> {task.blockedReason}
        </div>
      )}

      {/* Quick Move State Action Buttons */}
      <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px]">
        {/* Tier 4 Subtasks Toggle Button */}
        <button
          onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
          className={cn(
            "px-2 py-0.5 rounded-md font-bold flex items-center gap-1 transition-colors",
            isSubtasksExpanded
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
          )}
        >
          <CheckSquare className="w-3 h-3" />
          <span>{doneSubtasks.length}/{subtasks.length} Sub-Tasks</span>
        </button>

        {/* Quick Shift Dropdown */}
        <select
          value={task.status}
          onChange={(e) => handleStatusShift(e.target.value as TaskStatus)}
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 cursor-pointer"
        >
          <option value="TODO">To-Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="BLOCKED">Blocked</option>
          <option value="SUBMITTED_FOR_REVIEW">In Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* TIER 4: NESTED SUB-TASK MICRO-KANBAN / MATRIX */}
      {isSubtasksExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-zinc-200 dark:border-zinc-800 space-y-2 bg-zinc-50/80 dark:bg-zinc-950/60 p-2 rounded-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
            <span>Sub-Task Matrix (Tier 4)</span>
            <span>{doneSubtasks.length}/{subtasks.length} Done</span>
          </div>

          {/* Sub-Task Micro Columns: To-Do vs Done */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Column 1: Pending Sub-Tasks */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5">
              <div className="text-[9px] font-bold text-zinc-400 uppercase mb-1">
                ⏳ Pending ({todoSubtasks.length})
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {todoSubtasks.length === 0 ? (
                  <div className="text-[9px] text-zinc-400 py-1">No pending</div>
                ) : (
                  todoSubtasks.map((st) => (
                    <div
                      key={st.id}
                      className="text-[10px] p-1 rounded bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/40 group"
                    >
                      {editingSubtaskId === st.id ? (
                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingSubtaskTitle}
                            onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveSubtaskTitle(st);
                              } else if (e.key === "Escape") {
                                setEditingSubtaskId(null);
                              }
                            }}
                            className="flex-1 text-[10px] px-1 py-0.5 rounded border border-indigo-400 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveSubtaskTitle(st)}
                            className="text-emerald-600 hover:text-emerald-700 p-0.5"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSubtaskId(null)}
                            className="text-zinc-400 hover:text-zinc-600 p-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={() => handleToggleSubtask(st)}
                            className="flex items-center gap-1 min-w-0 flex-1 cursor-pointer"
                          >
                            <Circle className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" />
                            <span className="truncate">{st.title}</span>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                            {isLeader && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSubtaskId(st.id);
                                  setEditingSubtaskTitle(st.title);
                                }}
                                className="text-zinc-400 hover:text-indigo-600 p-0.5"
                                title="Edit Title"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubtask(st.id);
                              }}
                              className="text-zinc-400 hover:text-rose-500 p-0.5"
                              title="Delete"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Completed Sub-Tasks */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5">
              <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                ✓ Done ({doneSubtasks.length})
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {doneSubtasks.length === 0 ? (
                  <div className="text-[9px] text-zinc-400 py-1">None yet</div>
                ) : (
                  doneSubtasks.map((st) => (
                    <div
                      key={st.id}
                      className="text-[10px] p-1 rounded bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-between hover:bg-emerald-100/60 group"
                    >
                      {editingSubtaskId === st.id ? (
                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingSubtaskTitle}
                            onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveSubtaskTitle(st);
                              } else if (e.key === "Escape") {
                                setEditingSubtaskId(null);
                              }
                            }}
                            className="flex-1 text-[10px] px-1 py-0.5 rounded border border-indigo-400 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveSubtaskTitle(st)}
                            className="text-emerald-600 hover:text-emerald-700 p-0.5"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSubtaskId(null)}
                            className="text-zinc-400 hover:text-zinc-600 p-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={() => handleToggleSubtask(st)}
                            className="flex items-center gap-1 min-w-0 flex-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                            <span className="truncate line-through opacity-80">{st.title}</span>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                            {isLeader && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSubtaskId(st.id);
                                  setEditingSubtaskTitle(st.title);
                                }}
                                className="text-zinc-400 hover:text-indigo-600 p-0.5"
                                title="Edit Title"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubtask(st.id);
                              }}
                              className="text-zinc-400 hover:text-rose-500 p-0.5"
                              title="Delete"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Inline Add Subtask Input */}
          <form onSubmit={handleAddSubtask} className="flex gap-1 pt-1">
            <input
              type="text"
              placeholder="+ Add sub-task..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="flex-1 text-[10px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newSubtaskTitle.trim()}
              className="px-2 py-1 text-[10px] font-bold rounded bg-indigo-600 text-white disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
