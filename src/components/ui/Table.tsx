import React from "react";
import { cn } from "../../lib/utils";

export function Table({ className = "", children, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
      <table className={cn("w-full text-left text-sm text-slate-200", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...props }) {
  return (
    <thead className={cn("border-b border-slate-800 bg-slate-950/50 text-xs font-semibold uppercase text-slate-400", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }) {
  return (
    <tbody className={cn("divide-y divide-slate-800/80", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr className={cn("transition-colors hover:bg-slate-800/50", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }) {
  return (
    <th className={cn("px-4 py-3.5 font-semibold text-slate-400", className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }) {
  return (
    <td className={cn("px-4 py-3.5 text-slate-300", className)} {...props}>
      {children}
    </td>
  );
}
