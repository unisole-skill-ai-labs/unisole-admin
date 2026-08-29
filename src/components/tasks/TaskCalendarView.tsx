import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
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
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-xs">
      {/* Calendar Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {monthNames[month]} {year}
          </h3>
          <p className="text-xs text-zinc-500">
            Visual roadmap of task delivery deadlines and milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-wider">
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
                className="h-28 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/20 border border-transparent"
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
              className={`h-28 rounded-2xl border p-2 flex flex-col justify-between overflow-hidden transition-all ${
                isToday
                  ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs"
                  : "border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isToday
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Task Chips */}
              <div className="flex-1 space-y-1 my-1 overflow-y-auto pr-0.5">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 truncate cursor-pointer transition-colors"
                  >
                    {t.status === "COMPLETED" ? "✅ " : t.priority === "URGENT" ? "🔴 " : "• "}
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
