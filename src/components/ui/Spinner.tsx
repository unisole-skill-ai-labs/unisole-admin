import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function Spinner({
  size = "md",
  className = "",
  label = "Loading...",
}) {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 text-slate-400", className)}>
      <Loader2 className={cn("animate-spin text-blue-500", sizeStyles[size] || sizeStyles.md)} />
      {label && <p className="mt-2.5 text-xs font-medium text-slate-400">{label}</p>}
    </div>
  );
}
