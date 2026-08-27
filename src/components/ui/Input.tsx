import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  helperText?: string;
  className?: string;
  id?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon: Icon,
  helperText,
  className = "",
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {props.required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 border rounded-xl px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-slate-950 dark:disabled:text-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500",
            Icon ? "pl-10" : "",
            error
              ? "border-rose-400 dark:border-rose-800/80 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
