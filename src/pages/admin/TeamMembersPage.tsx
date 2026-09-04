import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useGetTeamMembersQuery,
  useGetDepartmentsQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useUpdateTeamMemberPermissionsMutation,
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
  ShieldAlert,
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
  Check,
  ChevronDown,
  Layers,
  Grid3X3,
  List,
  Plus,
  Sliders,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { DepartmentsManagerModal } from "../../components/admin/DepartmentsManagerModal";
import {
  ALL_PERMISSIONS,
  DESIGNATION_PRESETS,
  getDefaultPermissionsForUser,
  getPermissionDef,
  PermissionDefinition,
} from "../../utils/permissions";

export default function TeamMembersPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // View Mode: Directory List or Capabilities Matrix
  const [viewMode, setViewMode] = useState<"DIRECTORY" | "MATRIX">("DIRECTORY");

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedCapabilityFilter, setSelectedCapabilityFilter] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCapabilitiesModalOpen, setIsCapabilitiesModalOpen] = useState(false);
  const [isDepartmentsManagerOpen, setIsDepartmentsManagerOpen] = useState(false);

  // Active Member State for Modals
  const [activeMember, setActiveMember] = useState<any | null>(null);

  // Quick Add Capability Popover state (memberId -> boolean)
  const [openAddMenuMemberId, setOpenAddMenuMemberId] = useState<string | null>(null);

  // Form State: Add / Edit Member
  const [memberName, setMemberName] = useState("");
  const [memberUsername, setMemberUsername] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRole, setMemberRole] = useState<string>("MEMBER");
  const [memberDeptId, setMemberDeptId] = useState<string>("");
  const [memberDesignation, setMemberDesignation] = useState<string>("");
  const [memberPermissions, setMemberPermissions] = useState<string[]>([]);
  const [memberPreset, setMemberPreset] = useState<string>("CUSTOM");
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
  const [updatePermissions, { isLoading: isUpdatingPerms }] = useUpdateTeamMemberPermissionsMutation();
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

      // Capability Filter
      if (selectedCapabilityFilter !== "ALL") {
        if (m.role === "SUPER_ADMIN") {
          // Super admin has all capabilities
        } else {
          const perms = m.permissions && m.permissions.length > 0
            ? m.permissions
            : getDefaultPermissionsForUser(m);
          if (!perms.includes(selectedCapabilityFilter)) return false;
        }
      }

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
  }, [members, selectedRoleFilter, selectedDeptFilter, selectedStatusFilter, selectedCapabilityFilter, searchQuery]);

  // Distinct Permission Categories
  const permissionCategories: Array<"Workspace" | "Admissions & CRM" | "Campus & Ops" | "Curriculum & Academic" | "Finance & Team"> = [
    "Workspace",
    "Admissions & CRM",
    "Campus & Ops",
    "Curriculum & Academic",
    "Finance & Team",
  ];

  // --- Handlers ---
  const handleApplyPreset = (presetKey: string) => {
    setMemberPreset(presetKey);
    if (presetKey === "SUPER_ADMIN") {
      setMemberRole("SUPER_ADMIN");
      setMemberPermissions(ALL_PERMISSIONS.map((p) => p.key));
    } else if (DESIGNATION_PRESETS[presetKey]) {
      setMemberRole(DESIGNATION_PRESETS[presetKey].role);
      setMemberPermissions(DESIGNATION_PRESETS[presetKey].permissions);
    }
  };

  const handleTogglePermission = (key: string) => {
    setMemberPreset("CUSTOM");
    setMemberPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  // Instant Add / Remove Capability Handlers
  const handleQuickAddCapability = async (member: any, permissionKey: string) => {
    setOpenAddMenuMemberId(null);
    if (!isSuperAdmin) {
      alert("Only Super Administrators can modify capabilities.");
      return;
    }
    const currentPerms = member.permissions && member.permissions.length > 0
      ? member.permissions
      : getDefaultPermissionsForUser(member);

    if (currentPerms.includes(permissionKey)) return;

    const newPerms = [...currentPerms, permissionKey];
    try {
      await updatePermissions({
        baseUrl,
        id: member.id,
        permissions: newPerms,
      }).unwrap();
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.message || "Failed to add capability");
    }
  };

  const handleQuickRemoveCapability = async (member: any, permissionKey: string, permLabel: string) => {
    if (!isSuperAdmin) {
      alert("Only Super Administrators can modify capabilities.");
      return;
    }

    if (
      !window.confirm(
        `Remove capability "${permLabel}" from ${member.name || member.username}?`
      )
    ) {
      return;
    }

    const currentPerms = member.permissions && member.permissions.length > 0
      ? member.permissions
      : getDefaultPermissionsForUser(member);

    const newPerms = currentPerms.filter((k: string) => k !== permissionKey);
    try {
      await updatePermissions({
        baseUrl,
        id: member.id,
        permissions: newPerms,
      }).unwrap();
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.message || "Failed to remove capability");
    }
  };

  const handleToggleCapabilityInMatrix = async (member: any, permissionKey: string) => {
    if (!isSuperAdmin) {
      alert("Only Super Administrators can modify capabilities.");
      return;
    }
    if (member.role === "SUPER_ADMIN") {
      alert("Super Administrators always have universal unrestricted capabilities.");
      return;
    }

    const currentPerms = member.permissions && member.permissions.length > 0
      ? member.permissions
      : getDefaultPermissionsForUser(member);

    const hasIt = currentPerms.includes(permissionKey);
    const newPerms = hasIt
      ? currentPerms.filter((k: string) => k !== permissionKey)
      : [...currentPerms, permissionKey];

    try {
      await updatePermissions({
        baseUrl,
        id: member.id,
        permissions: newPerms,
      }).unwrap();
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.message || "Failed to toggle capability");
    }
  };

  const handleOpenAddModal = () => {
    setMemberName("");
    setMemberUsername("");
    setMemberPassword("");
    setMemberPhone("0000000000");
    setMemberRole("MEMBER");
    setMemberDeptId("");
    setMemberDesignation("");
    setMemberPreset("GENERAL_MEMBER");
    setMemberPermissions(DESIGNATION_PRESETS.GENERAL_MEMBER.permissions);
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
    const initialPerms =
      member.permissions && member.permissions.length > 0
        ? member.permissions
        : getDefaultPermissionsForUser(member);
    setMemberPermissions(initialPerms);
    setMemberPreset("CUSTOM");
    setMemberIsActive(member.isActive !== false);
    setIsEditModalOpen(true);
  };

  const handleOpenCapabilitiesModal = (member: any) => {
    setActiveMember(member);
    const initialPerms =
      member.permissions && member.permissions.length > 0
        ? member.permissions
        : getDefaultPermissionsForUser(member);
    setMemberPermissions(initialPerms);
    setMemberPreset("CUSTOM");
    setIsCapabilitiesModalOpen(true);
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
          permissions: memberPermissions,
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
          permissions: memberPermissions,
          isActive: memberIsActive,
        },
      }).unwrap();
      setIsEditModalOpen(false);
      setActiveMember(null);
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.message || "Failed to update member");
    }
  };

  const handleSaveCapabilitiesModal = async () => {
    if (!activeMember) return;
    try {
      await updatePermissions({
        baseUrl,
        id: activeMember.id,
        permissions: memberPermissions,
      }).unwrap();
      setIsCapabilitiesModalOpen(false);
      setActiveMember(null);
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.message || "Failed to update capabilities");
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
    const name = member.name || member.username || member.id;
    if (member.role === "SUPER_ADMIN" && member.username === "girish") {
      alert("The primary Super Admin account cannot be deleted.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently DELETE team member "${name}" (@${member.username})?\n\n⚠️ This will permanently remove their credentials and console access. Proceed?`
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
    <div className="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      {/* ─── 1. Header Banner & View Switcher ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
            <UsersRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Staff Directory & Capabilities
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                {members.length} Staff
              </span>
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Super Admin Control
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Inspect team members, grant or revoke granular capabilities, and manage staff credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle: Directory vs Capabilities Matrix */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => setViewMode("DIRECTORY")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "DIRECTORY"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Staff Directory</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("MATRIX")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "MATRIX"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Capabilities Matrix</span>
            </button>
          </div>

          <Button
            onClick={() => setIsDepartmentsManagerOpen(true)}
            variant="outline"
            size="md"
            icon={Building2}
            className="font-bold shrink-0 cursor-pointer"
          >
            Manage Departments ({departments.length})
          </Button>

          <Button
            onClick={handleOpenAddModal}
            variant="primary"
            size="md"
            icon={UserPlus}
            className="font-bold shadow-md shadow-indigo-500/20 shrink-0 cursor-pointer"
          >
            Add Team Member
          </Button>
        </div>
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
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name, @username..."
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

        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
          {/* Capability Filter */}
          <select
            value={selectedCapabilityFilter}
            onChange={(e) => setSelectedCapabilityFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer max-w-[180px]"
          >
            <option value="ALL">All Capabilities</option>
            {ALL_PERMISSIONS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.shortLabel} ({p.category})
              </option>
            ))}
          </select>

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

      {/* ─── 4A. VIEW 1: DIRECTORY TABLE (WITH CLEAR CAPABILITIES PILLS & ACTIONS) ─── */}
      {viewMode === "DIRECTORY" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
          {isMembersLoading ? (
            <div className="p-16 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
              <span>Loading staff directory...</span>
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
                    <th className="py-3.5 px-4">Role & Dept</th>
                    <th className="py-3.5 px-4">Assigned Work</th>
                    <th className="py-3.5 px-4 min-w-[340px]">
                      <div className="flex items-center justify-between">
                        <span>Capabilities & Permissions</span>
                        {isSuperAdmin && (
                          <span className="text-[9px] text-zinc-400 font-normal normal-case">
                            Click (x) to remove • + to add
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {filteredMembers.map((m: any) => {
                    const isSuper = m.role === "SUPER_ADMIN";
                    const isAdmin = m.role === "ADMIN";
                    const effectivePerms: string[] = isSuper
                      ? ALL_PERMISSIONS.map((p) => p.key)
                      : m.permissions && m.permissions.length > 0
                      ? m.permissions
                      : getDefaultPermissionsForUser(m);

                    const unassignedPerms = ALL_PERMISSIONS.filter(
                      (p) => !effectivePerms.includes(p.key)
                    );

                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* Staff Member Info */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 mt-0.5 ${
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
                                {m.phone && (
                                  <span className="text-[10px] text-zinc-400">
                                    • +91 {m.phone}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                                {m.designation || "Staff Member"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role & Dept */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1.5">
                            <Badge
                              variant={isSuper ? "amber" : isAdmin ? "brand" : "emerald"}
                              size="sm"
                              className="font-mono font-bold"
                            >
                              {m.role || "MEMBER"}
                            </Badge>
                            <div>
                              {m.departmentName ? (
                                <span
                                  className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold"
                                  style={{
                                    backgroundColor: `${m.departmentColor || "#6366f1"}18`,
                                    color: m.departmentColor || "#6366f1",
                                  }}
                                >
                                  {m.departmentName}
                                </span>
                              ) : (
                                <span className="text-zinc-400 text-[10px] block">No Dept</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Assigned Workload */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 w-fit">
                              <span>{m.activeTasksCount || 0}</span> Active Tasks
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 w-fit">
                              <span>{m.assignedLeadsCount || 0}</span> CRM Leads
                            </span>
                          </div>
                        </td>

                        {/* Clear Capabilities & Perms (with instant Add/Remove) */}
                        <td className="py-4 px-4 align-top">
                          {isSuper ? (
                            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                              <div>
                                <span className="text-xs font-black text-amber-700 dark:text-amber-300 block">
                                  Universal Super Administrator
                                </span>
                                <span className="text-[10px] text-amber-600/80 dark:text-amber-400">
                                  Unrestricted access across all modules, payments, and team settings.
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {effectivePerms.map((permKey) => {
                                  const def = getPermissionDef(permKey);
                                  const label = def?.shortLabel || permKey;
                                  const color = def?.color || "#6366f1";

                                  return (
                                    <span
                                      key={permKey}
                                      className="group inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all"
                                      style={{
                                        backgroundColor: `${color}14`,
                                        borderColor: `${color}35`,
                                        color: color,
                                      }}
                                      title={`${def?.label || permKey}: ${def?.description || ""}`}
                                    >
                                      <span>{label}</span>
                                      {isSuperAdmin && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleQuickRemoveCapability(
                                              m,
                                              permKey,
                                              def?.label || permKey
                                            )
                                          }
                                          className="p-0.5 rounded-md hover:bg-rose-500 hover:text-white transition-colors cursor-pointer opacity-60 hover:opacity-100"
                                          title={`Remove ${label} capability`}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </span>
                                  );
                                })}

                                {effectivePerms.length === 0 && (
                                  <span className="text-xs text-rose-500 font-medium">
                                    No capabilities assigned (Restricted account)
                                  </span>
                                )}

                                {/* Instant Add Capability Popover/Dropdown Button */}
                                {isSuperAdmin && unassignedPerms.length > 0 && (
                                  <div className="relative inline-block">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenAddMenuMemberId(
                                          openAddMenuMemberId === m.id ? null : m.id
                                        )
                                      }
                                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 hover:border-indigo-400 transition-all cursor-pointer"
                                      title="Add an extra capability to this member"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Add Capability</span>
                                    </button>

                                    {openAddMenuMemberId === m.id && (
                                      <div className="absolute left-0 top-full mt-1 z-30 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 animate-scale-in max-h-60 overflow-y-auto">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
                                          Grant Capability:
                                        </div>
                                        <div className="space-y-0.5">
                                          {unassignedPerms.map((perm) => (
                                            <button
                                              key={perm.key}
                                              type="button"
                                              onClick={() => handleQuickAddCapability(m, perm.key)}
                                              className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors flex items-center justify-between group cursor-pointer"
                                            >
                                              <div className="min-w-0">
                                                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                                                  {perm.label}
                                                </span>
                                                <span className="text-[9px] text-zinc-400 block truncate">
                                                  {perm.category}
                                                </span>
                                              </div>
                                              <Plus className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 shrink-0" />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Quick Manage Button */}
                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCapabilitiesModal(m)}
                                  className="text-[10px] font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer underline-offset-2 hover:underline"
                                >
                                  <Sliders className="w-3 h-3" />
                                  <span>Manage full matrix & presets ({effectivePerms.length} active)</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 align-top">
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
                        <td className="py-4 px-5 text-right align-top">
                          <div className="flex items-center justify-end gap-1">
                            {/* Capabilities Config */}
                            {isSuperAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenCapabilitiesModal(m)}
                                icon={Shield}
                                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 p-2 rounded-xl"
                                title="Manage Capabilities"
                              />
                            )}

                            {/* Change Password */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPasswordModal(m)}
                              icon={KeyRound}
                              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 p-2 rounded-xl"
                              title="Change Member Password"
                            />

                            {/* Edit Member */}
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
      )}

      {/* ─── 4B. VIEW 2: FULL CAPABILITIES MATRIX (CROSS-GRID INSPECTOR) ─── */}
      {viewMode === "MATRIX" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs space-y-4">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-950/40">
            <div>
              <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Executive Capabilities Matrix</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Inspect every staff member's active capabilities side-by-side. Click any checkbox to grant or revoke that capability immediately.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-zinc-500">
                <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" /> Enabled
              </span>
              <span className="flex items-center gap-1 text-zinc-500">
                <span className="w-3 h-3 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 inline-block" /> Disabled
              </span>
              <span className="flex items-center gap-1 text-zinc-500">
                <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" /> Super Admin
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {/* Category Header Row */}
                <tr className="bg-zinc-100/80 dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  <th className="py-2.5 px-4 sticky left-0 bg-zinc-100 dark:bg-zinc-950 z-10 border-r border-zinc-200 dark:border-zinc-800 min-w-[200px]">
                    Team Member
                  </th>
                  {permissionCategories.map((cat) => {
                    const catPerms = ALL_PERMISSIONS.filter((p) => p.category === cat);
                    return (
                      <th
                        key={cat}
                        colSpan={catPerms.length}
                        className="py-2.5 px-3 text-center border-r border-zinc-200 dark:border-zinc-800"
                      >
                        {cat}
                      </th>
                    );
                  })}
                  <th className="py-2.5 px-3 text-center">Presets</th>
                </tr>

                {/* Sub-column Permissions Header Row */}
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[9px] font-bold text-zinc-500">
                  <th className="py-2.5 px-4 sticky left-0 bg-zinc-50 dark:bg-zinc-900 z-10 border-r border-zinc-200 dark:border-zinc-800">
                    Staff & Role
                  </th>
                  {ALL_PERMISSIONS.map((p) => (
                    <th
                      key={p.key}
                      className="py-2.5 px-2 text-center border-r border-zinc-200/60 dark:border-zinc-800 min-w-[70px] max-w-[90px]"
                      title={`${p.label}: ${p.description}`}
                    >
                      <span className="block truncate text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                        {p.shortLabel}
                      </span>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center min-w-[120px]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredMembers.map((m: any) => {
                  const isSuper = m.role === "SUPER_ADMIN";
                  const effectivePerms = isSuper
                    ? ALL_PERMISSIONS.map((p) => p.key)
                    : m.permissions && m.permissions.length > 0
                    ? m.permissions
                    : getDefaultPermissionsForUser(m);

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Fixed Member Column */}
                      <td className="py-3 px-4 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-zinc-200 dark:border-zinc-800 shadow-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0 ${
                              isSuper
                                ? "bg-amber-500"
                                : m.role === "ADMIN"
                                ? "bg-indigo-600"
                                : "bg-emerald-600"
                            }`}
                          >
                            {(m.name || m.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate text-xs">
                              {m.name || m.username}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono block truncate">
                              @{m.username} • {m.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Permission Toggle Cells */}
                      {ALL_PERMISSIONS.map((p) => {
                        const hasPerm = effectivePerms.includes(p.key);
                        return (
                          <td
                            key={p.key}
                            className="py-3 px-2 text-center border-r border-zinc-200/60 dark:border-zinc-800"
                          >
                            {isSuper ? (
                              <span
                                className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold mx-auto"
                                title="Super Admin has universal access"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={!isSuperAdmin}
                                onClick={() => handleToggleCapabilityInMatrix(m, p.key)}
                                className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center transition-all cursor-pointer ${
                                  hasPerm
                                    ? "bg-indigo-600 text-white shadow-2xs hover:bg-indigo-700"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-transparent hover:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                                }`}
                                title={`${hasPerm ? "Click to Revoke" : "Click to Grant"} ${p.label}`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Action: Presets / Modal */}
                      <td className="py-3 px-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenCapabilitiesModal(m)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-2 py-1 rounded-lg"
                        >
                          Configure
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 5. MODALS ─────────────────────────────────────────────────── */}

      {/* MODAL 1: Dedicated Capabilities & Permissions Manager */}
      {isCapabilitiesModalOpen && activeMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    Manage Capabilities: {activeMember.name || activeMember.username}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    @{activeMember.username} • {activeMember.designation || activeMember.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCapabilitiesModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Pill */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  Active Capabilities Count
                </span>
                <span className="text-[11px] text-zinc-500">
                  Total enabled modules and permissions for this account
                </span>
              </div>
              <span className="text-sm font-black font-mono px-3 py-1 rounded-xl bg-indigo-600 text-white shadow-xs">
                {memberPermissions.length} / {ALL_PERMISSIONS.length} Active
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                ⚡ Apply Preset:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(DESIGNATION_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyPreset(key)}
                    className={`text-left p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      memberPreset === key
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-400 font-bold shadow-2xs"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMemberPreset("CLEAR");
                    setMemberPermissions([]);
                  }}
                  className="text-left p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                >
                  Clear All Capabilities
                </button>
              </div>
            </div>

            {/* Categorized Checkbox Matrix */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Granular Permissions Matrix:
              </span>

              {permissionCategories.map((category) => {
                const permsInCategory = ALL_PERMISSIONS.filter((p) => p.category === category);
                if (permsInCategory.length === 0) return null;

                return (
                  <div
                    key={category}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                      {category}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {permsInCategory.map((perm) => {
                        const isChecked = memberPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                              isChecked
                                ? "bg-white dark:bg-zinc-900 border-indigo-300 dark:border-indigo-700 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                                : "border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.key)}
                              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-xs block leading-tight">
                                {perm.label}
                              </span>
                              <span className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                                {perm.description}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCapabilitiesModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={isUpdatingPerms}
                onClick={handleSaveCapabilitiesModal}
                icon={ShieldCheck}
                className="font-bold shadow-md shadow-indigo-500/20"
              >
                Save Capabilities
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Password Modal */}
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

      {/* MODAL 3: Add New Team Member Modal */}
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

              {/* Granular Permissions & Capabilities */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-800 dark:text-zinc-200">
                    Granular Access Capabilities
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                    {memberPermissions.length} / {ALL_PERMISSIONS.length} Enabled
                  </span>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] text-zinc-500 block mb-1">
                    ⚡ Apply Designation Preset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {Object.entries(DESIGNATION_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className={`text-left p-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                          memberPreset === key
                            ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-400 font-bold"
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granular Checkboxes by Category */}
                <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
                  {permissionCategories.map((category) => {
                    const permsInCategory = ALL_PERMISSIONS.filter((p) => p.category === category);
                    if (permsInCategory.length === 0) return null;

                    return (
                      <div key={category} className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                          {category}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {permsInCategory.map((perm) => {
                            const isChecked = memberPermissions.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2 p-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? "bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-800/60 text-zinc-900 dark:text-zinc-100"
                                    : "border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="font-bold text-[11px] block leading-tight">
                                    {perm.label}
                                  </span>
                                  <span className="text-[9px] text-zinc-400 line-clamp-1">
                                    {perm.description}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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

      {/* MODAL 4: Edit Team Member Modal */}
      {isEditModalOpen && activeMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    Edit Member Profile & Capabilities
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Configure role, module permissions, and department assignment
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
                    placeholder="e.g. Admissions Counselor"
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

              {/* Granular Permissions & Capabilities */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-800 dark:text-zinc-200">
                    Granular Access Capabilities
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                    {memberPermissions.length} / {ALL_PERMISSIONS.length} Enabled
                  </span>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] text-zinc-500 block mb-1">
                    ⚡ Apply Designation Preset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {Object.entries(DESIGNATION_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className={`text-left p-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                          memberPreset === key
                            ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-400 font-bold"
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granular Checkboxes by Category */}
                <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
                  {permissionCategories.map((category) => {
                    const permsInCategory = ALL_PERMISSIONS.filter((p) => p.category === category);
                    if (permsInCategory.length === 0) return null;

                    return (
                      <div key={category} className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                          {category}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {permsInCategory.map((perm) => {
                            const isChecked = memberPermissions.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2 p-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? "bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-800/60 text-zinc-900 dark:text-zinc-100"
                                    : "border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="font-bold text-[11px] block leading-tight">
                                    {perm.label}
                                  </span>
                                  <span className="text-[9px] text-zinc-400 line-clamp-1">
                                    {perm.description}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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

      {/* ─── 8. Departments Manager Modal ─────────────────────────────────── */}
      <DepartmentsManagerModal
        isOpen={isDepartmentsManagerOpen}
        onClose={() => setIsDepartmentsManagerOpen(false)}
        baseUrl={baseUrl}
      />
    </div>
  );
}
