import React from "react";
import { cn } from "../../lib/utils";

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] rounded-md",
    md: "px-2.5 py-1 text-xs rounded-lg",
    lg: "px-3 py-1.5 text-sm rounded-xl",
  };

  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border border-slate-700",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tracking-wide",
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
