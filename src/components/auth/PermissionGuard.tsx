import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { hasPermission } from "../../utils/permissions";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

interface PermissionGuardProps {
  permission: string;
  children?: React.ReactNode;
  fallbackTo?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallbackTo = "/my-work",
}) => {
  const user = useSelector((s: any) => s.auth.user);

  if (!hasPermission(user, permission)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 animate-fade-in">
        <div className="max-w-md w-full text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight mb-1">
            Access Restricted
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Your account ({user?.designation || user?.role || "Team Member"}) does not currently have the <strong>"{permission}"</strong> capability. Contact your Super Administrator if you need access.
          </p>
          <Link
            to={fallbackTo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Assigned Work</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
