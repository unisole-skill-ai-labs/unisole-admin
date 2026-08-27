import React from "react";
import { cn } from "../../lib/utils";

export function Card({ children, className = "", onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md transition-colors",
        onClick && "cursor-pointer hover:border-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={cn("flex items-center justify-between pb-4 mb-4 border-b border-slate-800", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-100", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={cn("text-sm text-slate-300", className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
