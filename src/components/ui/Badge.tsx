import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "emerald" | "amber" | "rose";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] rounded-md",
    md: "px-2.5 py-1 text-xs rounded-lg",
    lg: "px-3.5 py-1.5 text-sm rounded-xl",
  };

  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border border-slate-200/50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700/50",
    brand: "bg-indigo-50 text-indigo-700 border border-indigo-200/50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
    amber: "bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
    rose: "bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold tracking-wide border transition-colors",
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
