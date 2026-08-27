import React from "react";
import { cn } from "../../lib/utils";

export default function PageHeader({
  title,
  subtitle,
  children,
  badge,
  className = "",
}) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800", className)}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2.5 flex-wrap">{children}</div>}
    </div>
  );
}
