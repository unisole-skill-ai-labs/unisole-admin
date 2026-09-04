import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Check,
  CalendarDays,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface DaySelectViewProps {
  selectedDate?: string | Date | null;
  onSelectDate: (dateString: string) => void;
  onClose?: () => void;
  includeTime?: boolean;
  minDate?: string | Date;
  maxDate?: string | Date;
  title?: string;
  className?: string;
  showShortcuts?: boolean;
  inline?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Helper to safely parse input dates
function parseInputDate(val?: string | Date | null): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

// Helper to format date into YYYY-MM-DD or YYYY-MM-DDTHH:mm
function formatDateOutput(date: Date, includeTime: boolean): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (!includeTime) {
    return `${year}-${month}-${day}`;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const DaySelectView: React.FC<DaySelectViewProps> = ({
  selectedDate,
  onSelectDate,
  onClose,
  includeTime = false,
  minDate,
  maxDate,
  title,
  className,
  showShortcuts = true,
  inline = false,
}) => {
  const initialDate = parseInputDate(selectedDate);
  const today = new Date();

  const [viewYear, setViewYear] = useState<number>(
    initialDate ? initialDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    initialDate ? initialDate.getMonth() : today.getMonth()
  );

  const [activeDate, setActiveDate] = useState<Date | null>(initialDate);

  // Time state
  const [hours, setHours] = useState<number>(
    initialDate ? initialDate.getHours() : 18 // Default to 6:00 PM for due dates
  );
  const [minutes, setMinutes] = useState<number>(
    initialDate ? initialDate.getMinutes() : 0
  );

  // Mode: 'days' | 'months' | 'years'
  const [pickerMode, setPickerMode] = useState<"days" | "months" | "years">("days");

  useEffect(() => {
    const d = parseInputDate(selectedDate);
    if (d) {
      setActiveDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setHours(d.getHours());
      setMinutes(d.getMinutes());
    }
  }, [selectedDate]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const daysGrid: Array<{
    dayNumber: number;
    monthOffset: -1 | 0 | 1;
    dateObj: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
  }> = [];

  const minD = parseInputDate(minDate);
  const maxD = parseInputDate(maxDate);

  // Trailing days from prev month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const d = new Date(prevYear, prevMonthIdx, dayNum);
    daysGrid.push({
      dayNumber: dayNum,
      monthOffset: -1,
      dateObj: d,
      isCurrentMonth: false,
      isToday:
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear(),
      isSelected:
        !!activeDate &&
        d.getDate() === activeDate.getDate() &&
        d.getMonth() === activeDate.getMonth() &&
        d.getFullYear() === activeDate.getFullYear(),
      isDisabled: !!((minD && d < minD) || (maxD && d > maxD)),
    });
  }

  // Days in current month
  for (let dNum = 1; dNum <= daysInMonth; dNum++) {
    const d = new Date(viewYear, viewMonth, dNum);
    daysGrid.push({
      dayNumber: dNum,
      monthOffset: 0,
      dateObj: d,
      isCurrentMonth: true,
      isToday:
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear(),
      isSelected:
        !!activeDate &&
        d.getDate() === activeDate.getDate() &&
        d.getMonth() === activeDate.getMonth() &&
        d.getFullYear() === activeDate.getFullYear(),
      isDisabled: !!((minD && d < minD) || (maxD && d > maxD)),
    });
  }

  // Next month leading days to complete grid (42 cells = 6 rows)
  const remainingCells = 42 - daysGrid.length;
  for (let dNum = 1; dNum <= remainingCells; dNum++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const d = new Date(nextYear, nextMonthIdx, dNum);
    daysGrid.push({
      dayNumber: dNum,
      monthOffset: 1,
      dateObj: d,
      isCurrentMonth: false,
      isToday:
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear(),
      isSelected:
        !!activeDate &&
        d.getDate() === activeDate.getDate() &&
        d.getMonth() === activeDate.getMonth() &&
        d.getFullYear() === activeDate.getFullYear(),
      isDisabled: !!((minD && d < minD) || (maxD && d > maxD)),
    });
  }

  // Day Selection Handler
  const handleSelectDay = (cell: (typeof daysGrid)[0]) => {
    if (cell.isDisabled) return;

    const newSelected = new Date(cell.dateObj);
    if (includeTime) {
      newSelected.setHours(hours);
      newSelected.setMinutes(minutes);
      newSelected.setSeconds(0);
      newSelected.setMilliseconds(0);
    }

    setActiveDate(newSelected);

    if (cell.monthOffset !== 0) {
      setViewMonth(newSelected.getMonth());
      setViewYear(newSelected.getFullYear());
    }

    if (!includeTime) {
      // Auto-commit if no time selection needed
      onSelectDate(formatDateOutput(newSelected, false));
      if (onClose) onClose();
    }
  };

  // Quick Preset Handlers
  const handleApplyPreset = (presetType: string) => {
    const target = new Date();
    target.setSeconds(0);
    target.setMilliseconds(0);

    if (presetType === "today") {
      // today
    } else if (presetType === "tomorrow") {
      target.setDate(target.getDate() + 1);
    } else if (presetType === "this_friday") {
      const day = target.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      target.setDate(target.getDate() + diff);
    } else if (presetType === "next_monday") {
      const day = target.getDay();
      const diff = (8 - day) % 7 || 7;
      target.setDate(target.getDate() + diff);
    } else if (presetType === "one_week") {
      target.setDate(target.getDate() + 7);
    } else if (presetType === "two_weeks") {
      target.setDate(target.getDate() + 14);
    } else if (presetType === "end_of_month") {
      target.setMonth(target.getMonth() + 1, 0);
    }

    if (includeTime) {
      target.setHours(hours);
      target.setMinutes(minutes);
    }

    setActiveDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());

    const outStr = formatDateOutput(target, includeTime);
    onSelectDate(outStr);
    if (onClose && !includeTime) onClose();
  };

  const handleApplySelection = () => {
    if (!activeDate) return;
    const finalDate = new Date(activeDate);
    if (includeTime) {
      finalDate.setHours(hours);
      finalDate.setMinutes(minutes);
    }
    onSelectDate(formatDateOutput(finalDate, includeTime));
    if (onClose) onClose();
  };

  const handleClear = () => {
    setActiveDate(null);
    onSelectDate("");
    if (onClose) onClose();
  };

  return (
    <div
      className={cn(
        "w-full max-w-[340px] select-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150",
        inline && "border-0 shadow-none p-0 max-w-none bg-transparent dark:bg-transparent",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {title || "Select Date"}
            </h4>
            <p className="text-[10px] text-zinc-400 font-medium">
              {activeDate
                ? activeDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No date selected"}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Presets Carousel */}
      {showShortcuts && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
          <button
            type="button"
            onClick={() => handleApplyPreset("today")}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("tomorrow")}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("this_friday")}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            This Friday
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("next_monday")}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            Next Mon
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("one_week")}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            +1 Wk
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("end_of_month")}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            End of Month
          </button>
        </div>
      )}

      {/* Navigation & Month/Year selector */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() =>
            pickerMode === "days"
              ? setPickerMode("months")
              : setPickerMode("days")
          }
          className="text-xs font-black text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <span>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <span className="text-[10px] text-zinc-400 font-normal">▾</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Fast-Picker Grid */}
      {pickerMode === "months" && (
        <div className="grid grid-cols-3 gap-2 py-2">
          {SHORT_MONTHS.map((mName, idx) => (
            <button
              type="button"
              key={mName}
              onClick={() => {
                setViewMonth(idx);
                setPickerMode("days");
              }}
              className={cn(
                "py-2 px-3 text-xs font-bold rounded-xl transition-all",
                idx === viewMonth
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {mName}
            </button>
          ))}
        </div>
      )}

      {/* Main Days Calendar Grid */}
      {pickerMode === "days" && (
        <div className="space-y-1">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS_OF_WEEK.map((dw) => (
              <span
                key={dw}
                className="text-[10px] font-bold text-zinc-400 uppercase py-1"
              >
                {dw}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((cell, idx) => {
              return (
                <button
                  type="button"
                  key={idx}
                  disabled={cell.isDisabled}
                  onClick={() => handleSelectDay(cell)}
                  className={cn(
                    "w-full aspect-square flex items-center justify-center text-xs font-semibold rounded-xl transition-all relative group",
                    cell.isSelected
                      ? "bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/20"
                      : cell.isToday
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black ring-1 ring-indigo-300 dark:ring-indigo-700"
                      : cell.isCurrentMonth
                      ? "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      : "text-zinc-300 dark:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                    cell.isDisabled && "opacity-25 cursor-not-allowed"
                  )}
                >
                  <span>{cell.dayNumber}</span>
                  {cell.isToday && !cell.isSelected && (
                    <span className="w-1 h-1 rounded-full bg-indigo-500 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Time Selector (If includeTime is True) */}
      {includeTime && (
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Time (24h / AM/PM)
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                Hour
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full text-xs font-semibold px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00 ({h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                Minute
              </label>
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full text-xs font-semibold px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                {[0, 15, 30, 45, 59].map((m) => (
                  <option key={m} value={m}>
                    :{String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Time Presets */}
          <div className="flex items-center gap-1 pt-1 overflow-x-auto text-[10px] font-medium text-zinc-500">
            <button
              type="button"
              onClick={() => {
                setHours(9);
                setMinutes(0);
              }}
              className="px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 hover:text-indigo-600 shrink-0"
            >
              9:00 AM (Start)
            </button>
            <button
              type="button"
              onClick={() => {
                setHours(18);
                setMinutes(0);
              }}
              className="px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 hover:text-indigo-600 shrink-0"
            >
              6:00 PM (EOD)
            </button>
            <button
              type="button"
              onClick={() => {
                setHours(23);
                setMinutes(59);
              }}
              className="px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 hover:text-indigo-600 shrink-0"
            >
              11:59 PM (Midnight)
            </button>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-bold text-zinc-400 hover:text-rose-500 px-2 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          Clear
        </button>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-zinc-600 dark:text-zinc-400 px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            disabled={!activeDate}
            onClick={handleApplySelection}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// FULL DATEPICKER INPUT COMPONENT (WITH POPUP DAY SELECTOR)
// ============================================================
export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  includeTime?: boolean;
  minDate?: string | Date;
  maxDate?: string | Date;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select date...",
  includeTime = false,
  minDate,
  maxDate,
  className,
  disabled = false,
  required = false,
  size = "md",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [popoverCoords, setPopoverCoords] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = 340;
    const popoverEstimatedHeight = 450;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const placement: "top" | "bottom" =
      spaceBelow < popoverEstimatedHeight && spaceAbove > spaceBelow ? "top" : "bottom";

    let top = placement === "bottom" ? rect.bottom + 6 : rect.top - popoverEstimatedHeight - 6;
    if (top < 10) top = 10;
    if (top + popoverEstimatedHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - popoverEstimatedHeight - 10);
    }

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    if (left < 16) left = 16;

    setPopoverCoords({ top, left, placement });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const parsedDate = parseInputDate(value);

  const displayString = parsedDate
    ? parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...(includeTime
          ? {
              hour: "2-digit",
              minute: "2-digit",
            }
          : {}),
      })
    : "";

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all text-left group",
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-zinc-900"
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700",
          disabled && "opacity-50 cursor-not-allowed",
          size === "sm" && "py-1.5 text-[11px]",
          size === "lg" && "py-2.5 text-sm"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon
            className={cn(
              "w-4 h-4 shrink-0 transition-colors",
              displayString
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-zinc-400 group-hover:text-zinc-600"
            )}
          />
          <span
            className={cn(
              "truncate font-medium",
              displayString
                ? "text-zinc-900 dark:text-zinc-100 font-bold"
                : "text-zinc-400"
            )}
          >
            {displayString || placeholder}
          </span>
        </div>

        {displayString ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">
            Pick
          </span>
        )}
      </button>

      {/* Day Select Popup / Dropdown rendered in Portal */}
      {isOpen &&
        popoverCoords &&
        ReactDOM.createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              zIndex: 99999,
            }}
            className="animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <DaySelectView
              selectedDate={value}
              onSelectDate={(newVal) => {
                onChange(newVal);
                if (!includeTime) setIsOpen(false);
              }}
              onClose={() => setIsOpen(false)}
              includeTime={includeTime}
              minDate={minDate}
              maxDate={maxDate}
              title={label || "Pick a Date"}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

// ============================================================
// QUICK DATE BADGE (FOR KANBAN CARDS, TABLES, TREE NODES)
// ============================================================
export interface QuickDateBadgeProps {
  value?: string;
  onChange: (dateString: string) => void;
  placeholder?: string;
  includeTime?: boolean;
  className?: string;
  size?: "xs" | "sm";
  disabled?: boolean;
}

export const QuickDateBadge: React.FC<QuickDateBadgeProps> = ({
  value,
  onChange,
  placeholder = "Set due date",
  includeTime = false,
  className,
  size = "xs",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverCoords, setPopoverCoords] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = 340;
    const popoverEstimatedHeight = 450;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const placement: "top" | "bottom" =
      spaceBelow < popoverEstimatedHeight && spaceAbove > spaceBelow ? "top" : "bottom";

    let top = placement === "bottom" ? rect.bottom + 6 : rect.top - popoverEstimatedHeight - 6;
    if (top < 10) top = 10;
    if (top + popoverEstimatedHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - popoverEstimatedHeight - 10);
    }

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    if (left < 16) left = 16;

    setPopoverCoords({ top, left, placement });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const parsedDate = parseInputDate(value);
  const now = new Date();
  const isOverdue = parsedDate && parsedDate < now;

  return (
    <div className={cn("relative inline-block", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-mono transition-all font-bold cursor-pointer group",
          size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
          parsedDate
            ? isOverdue
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 hover:border-indigo-300"
            : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 hover:text-indigo-600"
        )}
        title="Click to open day select view"
      >
        <CalendarIcon
          className={cn(
            "shrink-0",
            size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3",
            parsedDate ? (isOverdue ? "text-rose-500" : "text-indigo-500") : "text-zinc-400"
          )}
        />
        <span>
          {parsedDate
            ? parsedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : placeholder}
        </span>
        {isOverdue && <span className="text-[9px]">⚠️</span>}
      </button>

      {isOpen &&
        popoverCoords &&
        ReactDOM.createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              zIndex: 99999,
            }}
            className="animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <DaySelectView
              selectedDate={value}
              onSelectDate={(newVal) => {
                onChange(newVal);
                if (!includeTime) setIsOpen(false);
              }}
              onClose={() => setIsOpen(false)}
              includeTime={includeTime}
              title="Set Due Date"
            />
          </div>,
          document.body
        )}
    </div>
  );
};
