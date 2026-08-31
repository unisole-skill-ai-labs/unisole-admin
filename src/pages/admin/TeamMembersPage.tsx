import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useGetTeamMembersQuery,
  useGetDepartmentsQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} from "../../store";
import {
  UsersRound,
  UserPlus,
  KeyRound,
  Edit2,
  Trash2,
  Search,
  ShieldCheck,
  Shield,
  Building2,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Briefcase,
  Sparkles,
  Filter,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export default function TeamMembersPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Selected Member State for Edit / Password Change
  const [activeMember, setActiveMember] = useState<any | null>(null);

  // Form State: Add / Edit Member
  const [memberName, setMemberName] = useState("");
  const [memberUsername, setMemberUsername] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRole, setMemberRole] = useState<string>("MEMBER");
  const [memberDeptId, setMemberDeptId] = useState<string>("");
  const [memberDesignation, setMemberDesignation] = useState<string>("");
  const [memberIsActive, setMemberIsActive] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form State: Password Change Modal
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Queries & Mutations
  const { data: membersRes, isLoading: isMembersLoading } = useGetTeamMembersQuery({
    baseUrl,
    search: searchQuery || undefined,
  });
  const members: any[] = membersRes?.data || [];

  const { data: deptRes } = useGetDepartmentsQuery(baseUrl);
  const departments: any[] = deptRes?.data || [];

  const [createMember, { isLoading: isCreating }] = useCreateTeamMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateTeamMemberMutation();
  const [deleteMember, { isLoading: isDeleting }] = useDeleteTeamMemberMutation();

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = members.length;
    const superAdmins = members.filter((m) => m.role === "SUPER_ADMIN").length;
    const admins = members.filter((m) => m.role === "ADMIN").length;
    const regularMembers = members.filter((m) => m.role === "MEMBER").length;
    const activeCount = members.filter((m) => m.isActive !== false).length;
    return { total, superAdmins, admins, regularMembers, activeCount };
  }, [members]);

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter((m: any) => {
      // Role Filter
      if (selectedRoleFilter !== "ALL" && m.role !== selectedRoleFilter) {
        return false;
      }
      // Department Filter
      if (selectedDeptFilter !== "ALL" && m.departmentId !== selectedDeptFilter) {
        return false;
      }
      // Status Filter
      if (selectedStatusFilter === "ACTIVE" && m.isActive === false) return false;
      if (selectedStatusFilter === "DEACTIVATED" && m.isActive !== false) return false;

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (m.name || "").toLowerCase().includes(q);
        const matchesUsername = (m.username || "").toLowerCase().includes(q);
        const matchesPhone = (m.phone || "").includes(q);
        const matchesDesignation = (m.designation || "").toLowerCase().includes(q);
        const matchesDept = (m.departmentName || "").toLowerCase().includes(q);
        return matchesName || matchesUsername || matchesPhone || matchesDesignation || matchesDept;
      }

      return true;
    });
  }, [members, selectedRoleFilter, selectedDeptFilter, selectedStatusFilter, searchQuery]);

  // --- Handlers ---
  const handleOpenAddModal = () => {
    setMemberName("");
    setMemberUsername("");
    setMemberPassword("");
    setMemberPhone("0000000000");
    setMemberRole("MEMBER");
    setMemberDeptId("");
    setMemberDesignation("");
    setMemberIsActive(true);
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (member: any) => {
    setActiveMember(member);
    setMemberName(member.name || "");
    setMemberUsername(member.username || "");
    setMemberPhone(member.phone || "0000000000");
    setMemberRole(member.role || "MEMBER");
    setMemberDeptId(member.departmentId || "");
    setMemberDesignation(member.designation || "");
    setMemberIsActive(member.isActive !== false);
    setIsEditModalOpen(true);
  };

  const handleOpenPasswordModal = (member: any) => {
    setActiveMember(member);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setPasswordError(null);
    setIsPasswordModalOpen(true);
  };

  const handleSaveAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberUsername.trim() || !memberPassword.trim()) {
      alert("Name, Username, and Initial Password are required.");
      return;
    }

    try {
      await createMember({
        baseUrl,
        body: {
          name: memberName.trim(),
          username: memberUsername.trim().toLowerCase(),
          password: memberPassword.trim(),
          phone: memberPhone.trim() || "0000000000",
          role: memberRole,
          departmentId: memberDeptId || null,
          designation: memberDesignation.trim() || null,
          isActive: memberIsActive,
        },
      }).unwrap();
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.message || "Failed to create team member");
    }
  };

  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;
    if (!memberName.trim() || !memberUsername.trim()) {
      alert("Name and Username are required.");
      return;
    }

    try {
      await updateMember({
        baseUrl,
        id: activeMember.id,
        body: {
          name: memberName.trim(),
          username: memberUsername.trim().toLowerCase(),
          phone: memberPhone.trim() || "0000000000",
          role: memberRole,
          departmentId: memberDeptId || null,
          designation: memberDesignation.trim() || null,
          isActive: memberIsActive,
        },
      }).unwrap();
      setIsEditModalOpen(false);
      setActiveMember(null);
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.message || "Failed to update member");
    }
  };

  const handleSavePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;
    setPasswordError(null);

    if (!newPassword.trim()) {
      setPasswordError("Please enter a new password");
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await updateMember({
        baseUrl,
        id: activeMember.id,
        body: {
          password: newPassword.trim(),
        },
      }).unwrap();
      alert(`Password updated successfully for ${activeMember.name || activeMember.username}!`);
      setIsPasswordModalOpen(false);
      setActiveMember(null);
    } catch (err: any) {
      setPasswordError(err?.data?.error || err?.data?.message || "Failed to change password");
    }
  };

  const handleDeleteMember = async (member: any) => {
    const memberName = member.name || member.username || member.id;
    if (member.role === "SUPER_ADMIN" && member.username === "girish") {
      alert("The primary Super Admin account cannot be deleted.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently DELETE team member "${memberName}" (@${member.username})?\n\n⚠️ This will permanently remove their credentials and console access. Proceed?`
      )
    ) {
      return;
    }

    try {
      await deleteMember({ baseUrl, id: member.id }).unwrap();
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.message || "Failed to delete member");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* ─── 1. Header Banner & Add Button ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
            <UsersRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Team & Staff Access Management
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                {members.length} Staff
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Manage internal staff accounts, roles, access permissions, and login passwords.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          size="md"
          icon={UserPlus}
          className="font-bold shadow-md shadow-indigo-500/20 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          Add Team Member
        </Button>
      </div>

      {/* ─── 2. Metric KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
            Total Staff
          </span>
          <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
            {metrics.total}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block mb-1">
            Super Admins
          </span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {metrics.superAdmins}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">
            Admins / Leads
          </span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {metrics.admins}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">
            Staff Members
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.regularMembers}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-teal-500 uppercase tracking-wider block mb-1">
            Active Logins
          </span>
          <span className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono">
            {metrics.activeCount}
          </span>
        </div>
      </div>

      {/* ─── 3. Search & Filters Bar ───────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, @username, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "SUPER_ADMIN", "ADMIN", "MEMBER"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedRoleFilter === role
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {role === "ALL" ? "All Roles" : role.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-auto">
          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DEACTIVATED">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* ─── 4. Members Table / List ────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        {isMembersLoading ? (
          <div className="p-16 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
            <span>Loading team directory...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <UsersRound className="w-10 h-10 text-zinc-400 mx-auto opacity-60" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No Team Members Found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery || selectedRoleFilter !== "ALL" || selectedDeptFilter !== "ALL"
                ? "Try clearing your search or filter options to see all members."
                : "Add your first internal team member to grant administrator or staff access."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-950/60 border-b border-zinc-200/80 dark:border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-5">Staff Member</th>
                  <th className="py-3.5 px-4">Role Access</th>
                  <th className="py-3.5 px-4">Department & Title</th>
                  <th className="py-3.5 px-4">Base Phone</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredMembers.map((m: any) => {
                  const isSuper = m.role === "SUPER_ADMIN";
                  const isAdmin = m.role === "ADMIN";

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Staff Member Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 ${
                              isSuper
                                ? "bg-gradient-to-tr from-amber-500 to-orange-600"
                                : isAdmin
                                ? "bg-gradient-to-tr from-indigo-600 to-violet-600"
                                : "bg-gradient-to-tr from-emerald-600 to-teal-600"
                            }`}
                          >
                            {(m.name || m.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-xs sm:text-sm">
                              {m.name || "Unnamed Staff"}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                @{m.username || "staff"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Access Role */}
                      <td className="py-4 px-4">
                        <Badge
                          variant={isSuper ? "amber" : isAdmin ? "brand" : "emerald"}
                          size="sm"
                          className="font-mono font-bold"
                        >
                          {m.role || "MEMBER"}
                        </Badge>
                      </td>

                      {/* Department & Title */}
                      <td className="py-4 px-4">
                        <div>
                          {m.departmentName ? (
                            <span
                              className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mb-0.5"
                              style={{
                                backgroundColor: `${m.departmentColor || "#6366f1"}18`,
                                color: m.departmentColor || "#6366f1",
                              }}
                            >
                              {m.departmentName}
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-[11px]">No Department</span>
                          )}
                          <p className="text-[11px] text-zinc-500 truncate">
                            {m.designation || "Staff Member"}
                          </p>
                        </div>
                      </td>

                      {/* Base Phone */}
                      <td className="py-4 px-4 font-mono text-zinc-600 dark:text-zinc-400 text-xs">
                        +91 {m.phone || "0000000000"}
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            m.isActive !== false
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              m.isActive !== false ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {m.isActive !== false ? "ACTIVE" : "SUSPENDED"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Change Password Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPasswordModal(m)}
                            icon={KeyRound}
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 p-2 rounded-xl"
                            title="Change Member Password"
                          />

                          {/* Edit Member Profile */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(m)}
                            icon={Edit2}
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-xl"
                            title="Edit Member Profile"
                          />

                          {/* Delete Member */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(m)}
                            icon={Trash2}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2 rounded-xl"
                            title="Delete Member (Permanent)"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── 5. Modals ─────────────────────────────────────────────────── */}

      {/* MODAL 1: Dedicated Change Password Modal */}
      {isPasswordModalOpen && activeMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    Change Password
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {activeMember.name} (@{activeMember.username})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-sm focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Confirm New Password (Optional verification)
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-sm focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isUpdating}
                  icon={KeyRound}
                  className="font-bold"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Team Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    Add New Team Member
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Create administrator or internal staff login credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddMember} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. priya"
                    value={memberUsername}
                    onChange={(e) => setMemberUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password (e.g. 1234 or custom)"
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Access Role
                  </label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="MEMBER">MEMBER (Staff / Support)</option>
                    <option value="ADMIN">ADMIN (Lead / Manager)</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN (Founders)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <select
                    value={memberDeptId}
                    onChange={(e) => setMemberDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Video Editor"
                    value={memberDesignation}
                    onChange={(e) => setMemberDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Internal Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="0000000000"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addMemberIsActive"
                  checked={memberIsActive}
                  onChange={(e) => setMemberIsActive(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="addMemberIsActive" className="font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                  Active Account (allows login to Admin Console)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isCreating}
                  icon={UserPlus}
                  className="font-bold"
                >
                  Create Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Team Member Modal */}
      {isEditModalOpen && activeMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    Edit Member Profile
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Update profile, role, and department assignment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={memberUsername}
                    onChange={(e) => setMemberUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Access Role
                  </label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="MEMBER">MEMBER (Staff / Support)</option>
                    <option value="ADMIN">ADMIN (Lead / Manager)</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN (Founders)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <select
                    value={memberDeptId}
                    onChange={(e) => setMemberDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Operations Coordinator"
                    value={memberDesignation}
                    onChange={(e) => setMemberDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Internal Phone
                  </label>
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editMemberIsActive"
                  checked={memberIsActive}
                  onChange={(e) => setMemberIsActive(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="editMemberIsActive" className="font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                  Active Account (allows login to Admin Console)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isUpdating}
                  icon={Edit2}
                  className="font-bold"
                >
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
