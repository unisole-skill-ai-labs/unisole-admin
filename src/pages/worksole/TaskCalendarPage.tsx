import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Folder,
  User,
} from "lucide-react";
import { useGetTasksQuery, useGetProjectsQuery, useGetDepartmentsQuery, useCreateTaskMutation } from "../../store";
import { useSelector } from "react-redux";
import { TaskItem } from "../../types";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import TaskCreateModal from "../../components/tasks/TaskCreateModal";
import { cn } from "../../lib/utils";

interface TaskCalendarPageProps {
  baseUrl: string;
}

export const TaskCalendarPage: React.FC<TaskCalendarPageProps> = ({ baseUrl }) => {
  const currentUser = useSelector((s: any) => s.auth.user);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<TaskItem | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<string>("");

  const { data: tasksData, isLoading, refetch } = useGetTasksQuery({
    baseUrl,
    params: {},
  });
  const { data: projectsData } = useGetProjectsQuery(baseUrl);
  const { data: deptsData } = useGetDepartmentsQuery(baseUrl);
  const [createTask] = useCreateTaskMutation();

  const tasks: TaskItem[] = tasksData?.data || [];
  const projects = projectsData?.data || [];
  const departments = deptsData?.data || [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Calendar grid calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: Array<{ date: Date; isCurrentMonth: boolean; dateStr: string }> = [];

  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    calendarDays.push({
      date: d,
      isCurrentMonth: false,
      dateStr: formatDateKey(d),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    calendarDays.push({
      date: dateObj,
      isCurrentMonth: true,
      dateStr: formatDateKey(dateObj),
    });
  }

  // Next month padding to fill 35 or 42 grid cells
  const remaining = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(year, month + 1, d);
    calendarDays.push({
      date: dateObj,
      isCurrentMonth: false,
      dateStr: formatDateKey(dateObj),
    });
  }

  // Map tasks to dates (by dueDate or createdAt)
  const tasksByDate = new Map<string, TaskItem[]>();
  tasks.forEach((t) => {
    if (t.dueDate) {
      const dateStr = t.dueDate.slice(0, 10);
      const list = tasksByDate.get(dateStr) || [];
      list.push(t);
      tasksByDate.set(dateStr, list);
    }
  });

  const handleCellClick = (dateStr: string) => {
    setSelectedDateForCreate(dateStr);
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

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Execution Calendar & Timeline
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Track deliverables, project target dates, and milestone schedules
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 shadow-xs">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-zinc-900 dark:text-white min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={today}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            Today
          </button>

          <button
            onClick={() => {
              setSelectedDateForCreate(todayStr);
              setIsCreateTaskOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50/70 dark:bg-zinc-950/50 py-2.5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
            <div key={idx} className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-zinc-200 dark:divide-zinc-800">
          {calendarDays.map((dayObj, idx) => {
            const isToday = dayObj.dateStr === todayStr;
            const dayTasks = tasksByDate.get(dayObj.dateStr) || [];

            return (
              <div
                key={idx}
                onClick={() => handleCellClick(dayObj.dateStr)}
                className={cn(
                  "min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40",
                  !dayObj.isCurrentMonth && "bg-zinc-50/40 dark:bg-zinc-950/40 opacity-50",
                  isToday && "bg-indigo-50/20 dark:bg-indigo-950/20"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={cn(
                      "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all",
                      isToday
                        ? "bg-indigo-600 text-white shadow-xs font-black"
                        : "text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600"
                    )}
                  >
                    {dayObj.date.getDate()}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-zinc-400">
                      {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                    </span>
                  )}
                </div>

                {/* Task pills inside day cell */}
                <div className="space-y-1 overflow-y-auto max-h-[85px]">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskForDrawer(task);
                      }}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-semibold truncate transition-colors cursor-pointer flex items-center gap-1",
                        task.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 line-through"
                          : task.status === "BLOCKED"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : task.priority === "URGENT"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                          : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800"
                      )}
                      title={task.title}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}

                  {dayTasks.length > 3 && (
                    <div className="text-[9px] font-bold text-zinc-400 pl-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleTaskSubmit}
        departments={departments}
        teamMembers={[]}
        templates={[]}
        projects={projects}
      />

      {/* Task Drawer */}
      {selectedTaskForDrawer && (
        <TaskDrawer
          task={selectedTaskForDrawer}
          currentUser={currentUser}
          departments={departments}
          teamMembers={[]}
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
        />
      )}
    </div>
  );
};
