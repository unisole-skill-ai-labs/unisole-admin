import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetTeamMembersQuery,
  useGetDepartmentsQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
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
  Trash2,
  FolderPlus,
  UserPlus,
  Filter,
  Check,
  Layers,
  ChevronRight,
  CalendarCheck,
} from "lucide-react";
import Button from "../../components/ui/Button";

export default function TeamMembersPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isLeader = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("");

  // Member Modals & Slide-over
  const [inspectingMember, setInspectingMember] = useState<any | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Member Form State
  const [memberPhone, setMemberPhone] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<string>("MEMBER");
  const [memberDeptId, setMemberDeptId] = useState<string>("");
  const [memberDesignation, setMemberDesignation] = useState<string>("");

  // Department Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptColor, setDeptColor] = useState("#6366f1");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptLeadId, setDeptLeadId] = useState("");

  const { data: membersRes, isLoading: isMembersLoading } = useGetTeamMembersQuery({
    baseUrl,
    search: searchQuery || undefined,
  });
  const members = membersRes?.data || [];

  const { data: deptRes } = useGetDepartmentsQuery(baseUrl);
  const departments = deptRes?.data || [];

  const [createMember] = useCreateTeamMemberMutation();
  const [updateMember] = useUpdateTeamMemberMutation();
  const [deleteMember] = useDeleteTeamMemberMutation();

  const [createDept] = useCreateDepartmentMutation();
  const [updateDept] = useUpdateDepartmentMutation();
  const [deleteDept] = useDeleteDepartmentMutation();

  // Filtered members by department filter
  const filteredMembers = members.filter((m: any) => {
    if (selectedDeptFilter && m.departmentId !== selectedDeptFilter) {
      return false;
    }
    return true;
  });

  // Capacity helper
  const getCapacityStatus = (activeCount: number) => {
    if (activeCount >= 5) {
      return {
        label: "🔥 Overloaded",
        badgeBg: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900",
      };
    }
    if (activeCount >= 1) {
      return {
        label: "⚡ Active",
        badgeBg: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900",
      };
    }
    return {
      label: "🟢 Available",
      badgeBg: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    };
  };

  // --- Member Handlers ---
  const handleOpenAddMember = () => {
    setMemberPhone("");
    setMemberName("");
    setMemberRole("MEMBER");
    setMemberDeptId("");
    setMemberDesignation("");
    setIsAddMemberModalOpen(true);
  };

  const handleOpenEditMember = (member: any) => {
    setSelectedMember(member);
    setMemberName(member.name || "");
    setMemberRole(member.role || "MEMBER");
    setMemberDeptId(member.departmentId || "");
    setMemberDesignation(member.designation || "");
    setIsEditMemberModalOpen(true);
  };

  const handleSaveAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberPhone.trim() || !memberName.trim()) return;

    try {
      await createMember({
        baseUrl,
        body: {
          phone: memberPhone.trim(),
          name: memberName.trim(),
          role: memberRole,
          departmentId: memberDeptId || null,
          designation: memberDesignation.trim() || null,
        },
      }).unwrap();
      setIsAddMemberModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to add team member");
    }
  };

  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      await updateMember({
        baseUrl,
        id: selectedMember.id,
        body: {
          name: memberName.trim(),
          role: memberRole,
          departmentId: memberDeptId || null,
          designation: memberDesignation || null,
        },
      }).unwrap();
      setIsEditMemberModalOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to update member");
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${memberName}?`)) return;
    try {
      await deleteMember({ baseUrl, id: memberId }).unwrap();
      if (inspectingMember?.id === memberId) setInspectingMember(null);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to deactivate member");
    }
  };

  // --- Department Handlers ---
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName("");
    setDeptCode("");
    setDeptColor("#6366f1");
    setDeptDesc("");
    setDeptLeadId("");
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: any) => {
    setEditingDept(dept);
    setDeptName(dept.name || "");
    setDeptCode(dept.code || "");
    setDeptColor(dept.color || "#6366f1");
    setDeptDesc(dept.description || "");
    setDeptLeadId(dept.leadId || "");
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    try {
      if (editingDept) {
        await updateDept({
          baseUrl,
          id: editingDept.id,
          body: {
            name: deptName.trim(),
            color: deptColor,
            description: deptDesc.trim() || null,
            leadId: deptLeadId || null,
          },
        }).unwrap();
      } else {
        if (!deptCode.trim()) return;
        await createDept({
          baseUrl,
          body: {
            name: deptName.trim(),
            code: deptCode.trim().toUpperCase(),
            color: deptColor,
            description: deptDesc.trim() || null,
            leadId: deptLeadId || null,
          },
        }).unwrap();
      }
      setIsDeptModalOpen(false);
      setEditingDept(null);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to save department");
    }
  };

  const handleDeleteDept = async (deptId: string, deptName: string) => {
    if (!confirm(`Are you sure you want to delete department "${deptName}"?`)) return;
    try {
      await deleteDept({ baseUrl, id: deptId }).unwrap();
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete department");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <span>Team Directory & Squads</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono">
              {members.length} Active Staff
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitor real-time squad capacity, task velocity, role permissions, and staff assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
            />
          </div>

          {isSuperAdmin && (
            <button
              onClick={handleOpenAddDept}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors shadow-2xs cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-indigo-500" />
              <span>+ Department</span>
            </button>
          )}

          {isSuperAdmin && (
            <Button
              onClick={handleOpenAddMember}
              variant="primary"
              className="flex items-center gap-2 text-xs font-black shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </Button>
          )}
        </div>
      </div>

      {/* Departments Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {departments.map((dept: any) => {
          const isSelected = selectedDeptFilter === dept.id;

          return (
            <div
              key={dept.id}
              onClick={() =>
                setSelectedDeptFilter(isSelected ? "" : dept.id)
              }
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-md"
                  : "border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shadow-xs"
                      style={{ backgroundColor: dept.color || "#6366f1" }}
                    />
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      {dept.code || "DEPT"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {dept.membersCount || 0} Staff
                    </span>
                    {isSuperAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDept(dept);
                        }}
                        className="p-1 text-zinc-400 hover:text-indigo-600 ml-1 rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                        title="Edit Department"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                  {dept.name}
                </h4>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
                <span>Active Workload:</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {dept.activeTasksCount || 0} tasks
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Pill Indicator */}
      {selectedDeptFilter && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-700 dark:text-indigo-300">
          <span>Filtering by department:</span>
          <strong>
            {departments.find((d: any) => d.id === selectedDeptFilter)?.name}
          </strong>
          <button
            onClick={() => setSelectedDeptFilter("")}
            className="ml-auto text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isMembersLoading ? (
          <div className="col-span-full h-48 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No team members match your criteria</p>
          </div>
        ) : (
          filteredMembers.map((m: any) => {
            const isSuper = m.role === "SUPER_ADMIN";
            const isAdmin = m.role === "ADMIN";
            const capacity = getCapacityStatus(m.activeTasksCount || 0);

            return (
              <div
                key={m.id}
                onClick={() => setInspectingMember(m)}
                className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top Bar: Avatar & Role Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-md ${
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
                        <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {m.name || "Unnamed Staff"}
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          +91 {m.phone}
                        </p>
                      </div>
                    </div>

                    {isSuperAdmin && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditMember(m)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Edit Member Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id, m.name || m.phone)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Deactivate Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Role & Dept Tag */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono tracking-wider ${
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
                        className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold"
                        style={{
                          backgroundColor: `${m.departmentColor || "#6366f1"}18`,
                          color: m.departmentColor || "#6366f1",
                        }}
                      >
                        {m.departmentName}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${capacity.badgeBg}`}
                    >
                      {capacity.label}
                    </span>
                  </div>

                  {m.designation && (
                    <p className="text-xs text-zinc-500 font-medium line-clamp-1 mb-3">
                      {m.designation}
                    </p>
                  )}
                </div>

                {/* Workload Capacity Meter */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-[10px] text-zinc-400 block font-mono uppercase font-semibold">
                      In-Flight
                    </span>
                    <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {m.activeTasksCount || 0}
                    </strong>
                  </div>

                  <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-[10px] text-zinc-400 block font-mono uppercase font-semibold">
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

                  <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-[10px] text-zinc-400 block font-mono uppercase font-semibold">
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

      {/* MEMBER SLIDE-OVER DRAWER */}
      {inspectingMember && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-zinc-200/80 dark:border-zinc-800 overflow-hidden animate-slide-in-right p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-lg font-black shadow-md">
                  {(inspectingMember.name || inspectingMember.phone).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    {inspectingMember.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">+91 {inspectingMember.phone}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectingMember(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-5">
              {/* Role & Department */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block mb-1">
                    System Role
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {inspectingMember.role}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block mb-1">
                    Department
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {inspectingMember.departmentName || "General Operations"}
                  </span>
                </div>
              </div>

              {/* Workload Stats */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-3">
                  Task Execution Velocity
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-center">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block">
                      {inspectingMember.activeTasksCount || 0}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">Active Tasks</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-center">
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400 block">
                      {inspectingMember.blockedTasksCount || 0}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">Blocked</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-center">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
                      {inspectingMember.completedTasksCount || 0}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                <Button
                  onClick={() => {
                    handleOpenEditMember(inspectingMember);
                    setInspectingMember(null);
                  }}
                  variant="primary"
                  className="flex-1 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit Profile & Role
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Add Team Member</span>
              </h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Staff Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mobile Number (10 digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Role
                  </label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                  >
                    <option value="MEMBER">MEMBER (Staff / Learner)</option>
                    <option value="ADMIN">ADMIN (Lead / Manager)</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN (Leadership)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <select
                    value={memberDeptId}
                    onChange={(e) => setMemberDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <option value="">No Department</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Video Editor or Operations Intern"
                  value={memberDesignation}
                  onChange={(e) => setMemberDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary">
                  Create Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Profile Modal */}
      {isEditMemberModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                Edit Member: {selectedMember.name || selectedMember.phone}
              </h3>
              <button
                onClick={() => setIsEditMemberModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Access Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
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
                  value={memberDeptId}
                  onChange={(e) => setMemberDeptId(e.target.value)}
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
                  value={memberDesignation}
                  onChange={(e) => setMemberDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditMemberModalOpen(false)}
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

      {/* Add / Edit Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-600" />
                <span>{editingDept ? "Edit Department" : "Create New Department"}</span>
              </h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Media"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold"
                />
              </div>

              {!editingDept && (
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Unique Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MEDIA"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Squad Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={deptColor}
                      onChange={(e) => setDeptColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={deptColor}
                      onChange={(e) => setDeptColor(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department Lead
                  </label>
                  <select
                    value={deptLeadId}
                    onChange={(e) => setDeptLeadId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <option value="">No Lead Assigned</option>
                    {members.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.phone} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Primary duties and responsibilities of this squad..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {editingDept ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteDept(editingDept.id, editingDept.name)}
                    className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeptModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary">
                    {editingDept ? "Save Changes" : "Create Department"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
