import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  Plus,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  ArrowRight,
  TrendingUp,
  BarChart3,
  ListTree,
  LayoutGrid,
} from "lucide-react";
import {
  useGetProjectsQuery,
  useGetProjectHierarchyQuery,
  useGetDepartmentsQuery,
  useCreateTaskMutation,
  useDeleteProjectMutation,
} from "../../store";
import { Project, TaskItem } from "../../types";
import { ProjectHierarchyTree } from "../../components/worksole/ProjectHierarchyTree";
import { ProjectCreateModal } from "../../components/worksole/ProjectCreateModal";
import { SubProjectCreateModal } from "../../components/worksole/SubProjectCreateModal";
import TaskCreateModal from "../../components/tasks/TaskCreateModal";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import { useSelector } from "react-redux";
import { cn } from "../../lib/utils";

interface WorkSoleProjectsPageProps {
  baseUrl: string;
}

export const WorkSoleProjectsPage: React.FC<WorkSoleProjectsPageProps> = ({ baseUrl }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((s: any) => s.auth.user);

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "hierarchy">("cards");
  const [selectedProjectIdForTree, setSelectedProjectIdForTree] = useState<string | null>(null);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateSubProjectOpen, setIsCreateSubProjectOpen] = useState(false);
  const [activeProjectIdForSubProject, setActiveProjectIdForSubProject] = useState<string>("");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [activeProjectIdForTask, setActiveProjectIdForTask] = useState<string>("");
  const [activeSubProjectIdForTask, setActiveSubProjectIdForTask] = useState<string>("");
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<TaskItem | null>(null);

  // Queries
  const { data: projectsData, isLoading } = useGetProjectsQuery({
    baseUrl,
    departmentId: selectedDept || undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    search: search || undefined,
  });

  const { data: deptsData } = useGetDepartmentsQuery(baseUrl);
  const { data: hierarchyData } = useGetProjectHierarchyQuery(
    { baseUrl, id: selectedProjectIdForTree || "" },
    { skip: !selectedProjectIdForTree || viewMode !== "hierarchy" }
  );

  const [createTask] = useCreateTaskMutation();

  const projects: Project[] = projectsData?.data || [];
  const departments = deptsData?.data || [];

  // Auto-select first project for tree view if none selected
  React.useEffect(() => {
    if (viewMode === "hierarchy" && !selectedProjectIdForTree && projects.length > 0) {
      setSelectedProjectIdForTree(projects[0].id);
    }
  }, [viewMode, projects, selectedProjectIdForTree]);

  const handleOpenCreateTask = (projId: string, subProjId?: string) => {
    setActiveProjectIdForTask(projId);
    setActiveSubProjectIdForTask(subProjId || "");
    setIsCreateTaskOpen(true);
  };

  const handleOpenCreateSubProject = (projId: string) => {
    setActiveProjectIdForSubProject(projId);
    setIsCreateSubProjectOpen(true);
  };

  const handleTaskSubmit = async (taskData: any) => {
    try {
      await createTask({
        baseUrl,
        body: taskData,
      }).unwrap();
      setIsCreateTaskOpen(false);
    } catch (err) {
      console.error("Create task error:", err);
    }
  };

  // Top summary metrics
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
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                WorkSole Projects & Workstreams
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                4-Tier Hierarchical Execution: <span className="font-semibold text-indigo-600 dark:text-indigo-400">Project ➔ Sub-Project ➔ Task ➔ Sub-Task</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Switcher */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all",
                viewMode === "cards"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Project Cards
            </button>
            <button
              onClick={() => setViewMode("hierarchy")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all",
                viewMode === "hierarchy"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <ListTree className="w-3.5 h-3.5" /> 4-Tier Tree Explorer
            </button>
          </div>

          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
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
            Delivered milestone streams
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
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {overallPercentage}%
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${overallPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects by code, name, scope..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PLANNING">Planning</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "cards" ? (
        /* Cards Grid View */
        projects.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Folder className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Projects Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
              Get started by creating your first organizational workstream project.
            </p>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              + Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/worksole/projects/${proj.id}`)}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: proj.color || "#6366f1" }}
                      >
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {proj.code}
                        </span>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {proj.name}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        proj.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : proj.status === "ACTIVE"
                          ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                          : "bg-zinc-500/10 text-zinc-600 border border-zinc-500/20"
                      )}
                    >
                      {proj.status}
                    </span>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                      {proj.description}
                    </p>
                  )}

                  {/* Milestones count & department */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {proj.department && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {proj.department.name}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      {proj.subProjectsCount || 0} Sub-Projects
                    </span>
                  </div>
                </div>

                {/* Progress bar and footer */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-400">Progress</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {proj.progressPercentage || 0}% ({proj.completedTasks || 0}/{proj.totalTasks || 0})
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${proj.progressPercentage || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-1">
                      {proj.lead && (
                        <>
                          <User className="w-3 h-3" />
                          <span>{proj.lead.name || proj.lead.phone}</span>
                        </>
                      )}
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                      View Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* 4-Tier Tree Explorer View */
        <div className="space-y-4">
          {/* Project selector tabstrip for tree view */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectIdForTree(p.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2",
                  selectedProjectIdForTree === p.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                )}
              >
                <span>[{p.code}]</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          {hierarchyData?.data ? (
            <ProjectHierarchyTree
              hierarchy={hierarchyData.data}
              baseUrl={baseUrl}
              onOpenTask={(task) => setSelectedTaskForDrawer(task)}
              onOpenCreateSubProject={handleOpenCreateSubProject}
              onOpenCreateTask={handleOpenCreateTask}
              onEditProject={() => navigate(`/worksole/projects/${selectedProjectIdForTree}`)}
            />
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Clock className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading project tree hierarchy...</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ProjectCreateModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        baseUrl={baseUrl}
      />

      <SubProjectCreateModal
        isOpen={isCreateSubProjectOpen}
        onClose={() => setIsCreateSubProjectOpen(false)}
        baseUrl={baseUrl}
        projectId={activeProjectIdForSubProject}
      />

      <TaskCreateModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleTaskSubmit}
        departments={departments}
        teamMembers={[]}
        templates={[]}
        projects={projects}
        defaultProjectId={activeProjectIdForTask}
        defaultSubProjectId={activeSubProjectIdForTask}
      />

      {selectedTaskForDrawer && (
        <TaskDrawer
          task={selectedTaskForDrawer}
          currentUser={currentUser}
          departments={departments}
          teamMembers={[]}
          onClose={() => setSelectedTaskForDrawer(null)}
          onUpdateStatus={() => {}}
          onToggleSubtask={() => {}}
          onAddSubtask={() => {}}
          onDeleteSubtask={() => {}}
          onSubmitProof={() => {}}
          onFlagBlocked={() => {}}
          onReviewTask={() => {}}
          onAddComment={() => {}}
          onDeleteTask={() => {}}
        />
      )}
    </div>
  );
};
