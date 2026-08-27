import React from "react";
import { FolderOpen } from "lucide-react";
import Button from "../ui/Button";
import { cn } from "../../lib/utils";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = "No data found",
  description = "There are no records to display at this time.",
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30", className)}>
      <div className="p-3 bg-slate-800/80 rounded-2xl text-slate-400 mb-3.5">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-200">{title}</h4>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
