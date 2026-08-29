import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetTeamMembersQuery,
  useGetDepartmentsQuery,
  useUpdateTeamMemberMutation,
  useCreateDepartmentMutation,
} from "../../store";
import {
  Users,
  Shield,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  X,
  Sparkles,
  Search,
} from "lucide-react";
import Button from "../../components/ui/Button";

export default function TeamMembersPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<string>("MEMBER");
  const [editDeptId, setEditDeptId] = useState<string>("");
  const [editDesignation, setEditDesignation] = useState<string>("");

  const { data: membersRes, isLoading: isMembersLoading } = useGetTeamMembersQuery({
    baseUrl,
    search: searchQuery || undefined,
  });
  const members = membersRes?.data || [];

  const { data: deptRes } = useGetDepartmentsQuery(baseUrl);
  const departments = deptRes?.data || [];

  const [updateMember] = useUpdateTeamMemberMutation();

  const handleOpenEdit = (member: any) => {
    setSelectedMember(member);
    setEditRole(member.role || "MEMBER");
    setEditDeptId(member.departmentId || "");
    setEditDesignation(member.designation || "");
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      await updateMember({
        baseUrl,
        id: selectedMember.id,
        body: {
          role: editRole,
          departmentId: editDeptId || null,
          designation: editDesignation || null,
        },
      }).unwrap();
      setIsEditModalOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to update member role");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <span>Team Directory & Capacity</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono">
              {members.length} Members
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitor team workload capacity, role permissions, and squad assignments.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          >
          </input>
        </div>
      </div>

      {/* Departments Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {departments.map((dept: any) => (
          <div
            key={dept.id}
            className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dept.color || "#6366f1" }}
              />
              <span className="text-[10px] font-mono text-zinc-400 font-bold">
                {dept.membersCount || 0} Staff
              </span>
            </div>
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
              {dept.name}
            </h4>
            <div className="mt-1 text-[11px] text-zinc-500 flex items-center justify-between">
              <span>Active Tasks:</span>
              <strong className="text-indigo-600 dark:text-indigo-400">
                {dept.activeTasksCount || 0}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isMembersLoading ? (
          <div className="col-span-full h-40 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
          </div>
        ) : (
          members.map((m: any) => {
            const isSuper = m.role === "SUPER_ADMIN";
            const isAdmin = m.role === "ADMIN";
            const isMem = m.role === "MEMBER";

            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Avatar & Role Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-xs ${
                          isSuper
                            ? "bg-gradient-to-tr from-amber-500 to-orange-600"
                            : isAdmin
                            ? "bg-gradient-to-tr from-indigo-600 to-violet-600"
                            : "bg-gradient-to-tr from-emerald-600 to-teal-600"
                        }`}
                      >
                        {(m.name || m.phone || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                          {m.name || "Unnamed Staff"}
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          +91 {m.phone}
                        </p>
                      </div>
                    </div>

                    {isSuperAdmin && (
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit Role & Dept"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Role & Dept Tag */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono ${
                        isSuper
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                          : isAdmin
                          ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300"
                          : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {m.role || "MEMBER"}
                    </span>

                    {m.departmentName && (
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                        style={{
                          backgroundColor: `${m.departmentColor || "#6366f1"}15`,
                          color: m.departmentColor || "#6366f1",
                        }}
                      >
                        {m.departmentName}
                      </span>
                    )}

                    {m.designation && (
                      <span className="text-[10px] text-zinc-500 font-medium truncate">
                        • {m.designation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Workload Capacity Meter */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950">
                    <span className="text-[10px] text-zinc-400 block font-mono uppercase">
                      In-Flight
                    </span>
                    <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {m.activeTasksCount || 0}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950">
                    <span className="text-[10px] text-zinc-400 block font-mono uppercase">
                      Blocked
                    </span>
                    <strong
                      className={`text-sm font-black ${
                        m.blockedTasksCount > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {m.blockedTasksCount || 0}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950">
                    <span className="text-[10px] text-zinc-400 block font-mono uppercase">
                      Finished
                    </span>
                    <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {m.completedTasksCount || 0}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Role Modal (Super Admin only) */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                Update Member Profile: {selectedMember.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Access Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                >
                  <option value="MEMBER">MEMBER (Staff / Intern / Learner)</option>
                  <option value="ADMIN">ADMIN (Department Lead / Manager)</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN (Founders / Core Platform)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Department
                </label>
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                >
                  <option value="">No Department Assigned</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Designation / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Video Specialist or Campus Coordinator"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
