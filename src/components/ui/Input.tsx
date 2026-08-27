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
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
          {label} {props.required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-slate-900/80 text-sm text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:bg-slate-950 disabled:text-slate-500 placeholder:text-slate-500",
            Icon ? "pl-9" : "",
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/40"
              : "hover:border-slate-600"
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
