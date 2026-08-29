import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";

interface TaskCalendarViewProps {
  tasks: any[];
  onSelectTask: (task: any) => void;
}

export default function TaskCalendarView({
  tasks,
  onSelectTask,
}: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

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

  // Group tasks by Date string YYYY-MM-DD
  const tasksByDate: Record<string, any[]> = {};
  tasks.forEach((t) => {
    if (t.dueDate) {
      const dStr = new Date(t.dueDate).toISOString().split("T")[0];
      if (!tasksByDate[dStr]) tasksByDate[dStr] = [];
      tasksByDate[dStr].push(t);
    }
  });

  const daysArray = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
      {/* Calendar Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{monthNames[month]} {year}</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Interactive roadmap of deadlines, milestones, and deliverable schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2.5 text-center text-[11px] font-bold text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-wider">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[110px] rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/20 border border-transparent"
              />
            );
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday =
            new Date().toISOString().split("T")[0] === dateStr;

          return (
            <div
              key={dateStr}
              className={`min-h-[110px] rounded-2xl border p-2.5 flex flex-col justify-between overflow-hidden transition-all duration-200 ${
                isToday
                  ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/20"
                  : "border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    isToday
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                    {dayTasks.length} {dayTasks.length > 1 ? "tasks" : "task"}
                  </span>
                )}
              </div>

              {/* Task Chips */}
              <div className="flex-1 space-y-1 my-1 overflow-y-auto pr-0.5 no-scrollbar max-h-24">
                {dayTasks.map((t) => {
                  const isCompleted = t.status === "COMPLETED";
                  const isBlocked = t.status === "BLOCKED";
                  const isUrgent = t.priority === "URGENT";

                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold truncate cursor-pointer transition-all duration-150 flex items-center gap-1 ${
                        isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : isBlocked
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                          : isUrgent
                          ? "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600"
                      }`}
                      title={t.title}
                    >
                      <span className="shrink-0">
                        {isCompleted ? "✅" : isBlocked ? "🚨" : isUrgent ? "🔴" : "•"}
                      </span>
                      <span className="truncate">{t.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
