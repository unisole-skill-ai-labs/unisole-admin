import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick, ...props }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm transition-all duration-300 ease-out",
        onClick && "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer hover:-translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between p-6 pb-3 border-b border-slate-100 dark:border-slate-800/40", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "", ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
