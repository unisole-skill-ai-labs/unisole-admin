import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
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
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs font-semibold gap-1.5 min-h-[34px]",
    md: "px-4 py-2 text-sm font-semibold gap-2 min-h-[40px]",
    lg: "px-5 py-2.5 text-base font-bold gap-2.5 min-h-[46px]",
    icon: "p-2 min-h-[38px] min-w-[38px] rounded-lg",
  };

  const variantStyles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-600",
    outline:
      "border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-500",
    ghost:
      "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-100 focus:ring-slate-500",
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
