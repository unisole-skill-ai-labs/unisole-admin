import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass" | "white" | "danger" | "success" | "brand";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[36px]",
    md: "px-4.5 py-2.5 text-sm gap-2 min-h-[42px]",
    lg: "px-6 py-3 text-base gap-2.5 min-h-[48px]",
    icon: "p-2.5 min-h-[40px] min-w-[40px] rounded-xl",
  };

  const variantStyles = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100 dark:shadow-none focus:ring-indigo-500",
    brand:
      "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/10 dark:shadow-none focus:ring-indigo-500",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700/50 focus:ring-slate-400",
    outline:
      "border border-slate-200 hover:border-slate-300 bg-transparent text-slate-700 hover:text-slate-900 dark:border-slate-700 dark:hover:border-slate-600 dark:text-slate-300 dark:hover:text-white focus:ring-slate-400",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-white focus:ring-slate-300",
    glass:
      "border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md focus:ring-white/40 shadow-sm",
    white:
      "bg-white hover:bg-slate-50 text-slate-900 font-bold border border-slate-200 shadow-sm focus:ring-slate-300",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.primary,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
}
