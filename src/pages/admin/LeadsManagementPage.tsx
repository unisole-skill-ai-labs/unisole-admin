import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { canExportLeads } from "../../utils/permissions";
import {
  Users,
  TrendingUp,
  Search,
  Filter,
  Plus,
  UploadCloud,
  Download,
  PhoneCall,
  Calendar,
  Clock,
  Building2,
  GraduationCap,
  Flame,
  Sun,
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Phone,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  X,
  ChevronDown,
  Layers,
  Sparkles,
  UserX,
  UserCheck,
  Ban,
  FileText,
} from "lucide-react";
import {
  useGetLeadsQuery,
  useGetLeadsMetaQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useBulkAssignLeadsMutation,
  useBulkUpdateLeadStatusMutation,
  useSyncUsersToLeadsMutation,
} from "../../store";
import { formatTeamMemberLabel } from "../../utils/permissions";
import LogCallModal from "../../components/leads/LogCallModal";
import LeadDetailDrawer from "../../components/leads/LeadDetailDrawer";
import LeadFormModal from "../../components/leads/LeadFormModal";
import LeadImportModal from "../../components/leads/LeadImportModal";
import LeadAnalyticsDashboard from "../../components/leads/LeadAnalyticsDashboard";
import LeadSlaBadge from "../../components/leads/LeadSlaBadge";
import {
  SIMPLIFIED_STATUS_MAP,
  SIMPLIFIED_STATUS_OPTIONS,
  getSimplifiedLeadStatus,
  getSimplifiedStatusConfig,
  getStatusUpdatePayload,
  OBJECTION_REASON_OPTIONS,
  getObjectionReasonConfig,
} from "../../utils/leadStatus";

export default function LeadsManagementPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isAdmin = currentUser?.role === "ADMIN" || isSuperAdmin;
  const isSales = currentUser?.role === "SALES" || (currentUser?.designation || "").toUpperCase().includes("SALES");
  const canExport = canExportLeads(currentUser);
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<"directory" | "analytics">(
    location.pathname.includes("analytics") ? "analytics" : "directory"
  );
  const [scopeFilter, setScopeFilter] = useState<"ACTIVE" | "NON_LEADS" | "ALL">("ACTIVE");

  // Filters State
  const [search, setSearch] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [branch, setBranch] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState<string>("MY_LEADS");
  const [status, setStatus] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [nextCallDue, setNextCallDue] = useState<any>("");

  // Sync Notification Banner
  const [syncBanner, setSyncBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Modals & Drawers State
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<any | null>(null);
  const [detailLeadId, setDetailLeadId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLeadData, setEditLeadData] = useState<any | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Bulk Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");

  // Computed status filter based on scopeFilter
  const effectiveStatus = useMemo(() => {
    if (status && SIMPLIFIED_STATUS_MAP[status]) {
      return SIMPLIFIED_STATUS_MAP[status].queryStatuses.join(",");
    }
    if (status) return status;
    if (scopeFilter === "NON_LEADS") return "NOT_A_LEAD,JUNK";
    return undefined;
  }, [status, scopeFilter]);

  // Computed effective assignedToUserId filter (defaults to current user's leads for everyone)
  const effectiveAssignedToUserId = useMemo(() => {
    if (!isAdmin) {
      return currentUser?.id;
    }
    if (assignedToUserId === "MY_LEADS") {
      return currentUser?.id || undefined;
    }
    if (assignedToUserId === "ALL" || !assignedToUserId) {
      return undefined;
    }
    return assignedToUserId;
  }, [isAdmin, assignedToUserId, currentUser?.id]);

  // Queries & Mutations
  const { data: leadsRes, isLoading, refetch } = useGetLeadsQuery({
    baseUrl,
    search: search.trim() || undefined,
    collegeId: collegeId || undefined,
    branch: branch || undefined,
    assignedToUserId: effectiveAssignedToUserId,
    status: effectiveStatus,
    subStatus: subStatus || undefined,
    excludeNonLeads: scopeFilter === "ACTIVE" && !status ? true : undefined,
    nextCallDue: nextCallDue || undefined,
  });

  const { data: metaRes } = useGetLeadsMetaQuery({ baseUrl });
  const meta = useMemo(() => {
    const raw = metaRes?.data || metaRes;
    return {
      colleges: Array.isArray(raw?.colleges) ? raw.colleges : [],
      branches: Array.isArray(raw?.branches) ? raw.branches : [],
      teamMembers: Array.isArray(raw?.teamMembers) ? raw.teamMembers : [],
      qualities: Array.isArray(raw?.qualities) ? raw.qualities : [],
      statuses: Array.isArray(raw?.statuses) ? raw.statuses : [],
    };
  }, [metaRes]);

  const [updateLead] = useUpdateLeadMutation();
  const [deleteLead] = useDeleteLeadMutation();
  const [bulkAssign] = useBulkAssignLeadsMutation();
  const [bulkUpdateStatusMutation] = useBulkUpdateLeadStatusMutation();
  const [syncUsersToLeads, { isLoading: isSyncingUsers }] = useSyncUsersToLeadsMutation();

  const handleSyncUsers = async () => {
    try {
      const res = await syncUsersToLeads({ baseUrl }).unwrap();
      const { synced, existing, totalUsers } = res.data || {};
      setSyncBanner({
        type: "success",
        msg: `Sync Complete! ${synced || 0} registered students added as new leads. (${existing || 0} were already linked, Total platform students: ${totalUsers || 0})`,
      });
      refetch();
      setTimeout(() => setSyncBanner(null), 7000);
    } catch (err: any) {
      setSyncBanner({
        type: "error",
        msg: err?.data?.error || "Failed to sync platform users to leads.",
      });
      setTimeout(() => setSyncBanner(null), 5000);
    }
  };


  const leadsList = useMemo(() => {
    if (Array.isArray(leadsRes)) return leadsRes;
    if (Array.isArray(leadsRes?.data)) return leadsRes.data;
    return [];
  }, [leadsRes]);

  // Toggle selection
  const handleSelectAll = () => {
    if (selectedLeadIds.length === leadsList.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leadsList.map((l: any) => l.id));
    }
  };

  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Handlers
  const handleBulkAssignSubmit = async (userId: string) => {
    if (selectedLeadIds.length === 0) return;
    try {
      await bulkAssign({
        baseUrl,
        leadIds: selectedLeadIds,
        assignedToUserId: userId || null,
      }).unwrap();
      setSelectedLeadIds([]);
      setBulkAssignee("");
    } catch (err) {
      console.error("Bulk assign failed:", err);
    }
  };

  const handleBulkStatusSubmit = async (statusKey: string) => {
    if (selectedLeadIds.length === 0 || !statusKey) return;
    try {
      const payload = getStatusUpdatePayload(statusKey);
      await bulkUpdateStatusMutation({
        baseUrl,
        leadIds: selectedLeadIds,
        status: payload.status,
        quality: payload.quality,
      }).unwrap();
      setSelectedLeadIds([]);
      setBulkStatus("");
    } catch (err) {
      console.error("Bulk status update failed:", err);
    }
  };

  // Inline Handlers
  const handleInlineAssignee = async (leadId: string, userId: string) => {
    try {
      await updateLead({
        baseUrl,
        id: leadId,
        data: { assignedToUserId: userId || null },
      }).unwrap();
    } catch (err) {
      console.error("Failed to re-assign lead:", err);
    }
  };

  const handleInlineStatus = async (leadId: string, statusKey: string) => {
    try {
      const payload = getStatusUpdatePayload(statusKey);
      await updateLead({
        baseUrl,
        id: leadId,
        data: payload,
      }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!canExport) return;
    if (leadsList.length === 0) return;
    const headers = [
      "Name",
      "Phone",
      "Email",
      "College",
      "Branch",
      "Year",
      "Assigned To",
      "Status",
      "Call Count",
      "Last Call",
      "Next Call",
      "Created At",
    ];

    const rows = leadsList.map((l: any) => [
      `"${l.name || ""}"`,
      `"${l.phone || ""}"`,
      `"${l.email || ""}"`,
      `"${l.collegeName || ""}"`,
      `"${l.branch || ""}"`,
      `"${l.yearOfStudy || ""}"`,
      `"${l.assignedToUser?.name || "Unassigned"}"`,
      `"${getSimplifiedStatusConfig(l.status, l.quality).label}"`,
      l.callCount || 0,
      `"${l.lastCallAt || ""}"`,
      `"${l.nextCallAt || ""}"`,
      `"${l.createdAt || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Unisole_Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = Boolean(
    search || collegeId || branch || (isAdmin ? assignedToUserId !== "MY_LEADS" : false) || status || subStatus || nextCallDue
  );

  const clearFilters = () => {
    setSearch("");
    setCollegeId("");
    setBranch("");
    setAssignedToUserId(isAdmin ? "MY_LEADS" : "");
    setStatus("");
    setSubStatus("");
    setNextCallDue("");
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Top Title & Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {!isAdmin ? "My Assigned Leads" : "Lead Management CRM"}
                </h1>
                {!isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assigned to: {currentUser?.name || currentUser?.phone || "Me"}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>
                      {assignedToUserId === "MY_LEADS" || assignedToUserId === currentUser?.id
                        ? "Showing: My Assigned Leads"
                        : assignedToUserId === "ALL"
                        ? "Showing: All Team Leads"
                        : assignedToUserId === "unassigned"
                        ? "Showing: Unassigned Leads"
                        : "Showing: Filtered Staff Leads"}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {!isAdmin
                  ? "Access your assigned prospective students, log calling notes, and update disposition status."
                  : "Counselor assignments, quality scoring, call logging & conversion tracking"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons & Global Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("directory")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "directory"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Lead Directory</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-700 font-mono">
                {leadsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Conversion & Analytics</span>
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={handleSyncUsers}
              disabled={isSyncingUsers}
              title="Sync all registered platform students into CRM leads"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isSyncingUsers ? "animate-spin" : ""}`} />
              <span>{isSyncingUsers ? "Syncing Platform Users..." : "Sync All Users to Leads"}</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
          )}

          {canExport && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncBanner && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in border ${
            syncBanner.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{syncBanner.msg}</span>
          </div>
          <button onClick={() => setSyncBanner(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Main Tab Views */}
      {activeTab === "analytics" ? (
        <LeadAnalyticsDashboard
          baseUrl={baseUrl}
          collegeId={collegeId || undefined}
          branch={branch || undefined}
          assignedToUserId={effectiveAssignedToUserId}
        />
      ) : (
        <div className="space-y-4">
          {/* Advanced Multi-Filter Bar & Scope Switcher */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 mr-2">
                  <Filter className="w-4 h-4 text-indigo-500" />
                  <span>Pipeline Scope:</span>
                </div>
                {/* Scope Filter Pills */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
                  <button
                    onClick={() => setScopeFilter("ACTIVE")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scopeFilter === "ACTIVE"
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    Active Leads Only
                  </button>
                  <button
                    onClick={() => setScopeFilter("NON_LEADS")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scopeFilter === "NON_LEADS"
                        ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    Non-Leads / Excluded
                  </button>
                  <button
                    onClick={() => setScopeFilter("ALL")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scopeFilter === "ALL"
                        ? "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    All Records
                  </button>
                </div>

                {/* Admin Quick Switcher: My Leads vs All Leads */}
                {isAdmin && (
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 ml-1">
                    <button
                      type="button"
                      onClick={() => setAssignedToUserId("MY_LEADS")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        assignedToUserId === "MY_LEADS" || assignedToUserId === currentUser?.id
                          ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      👤 My Leads
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignedToUserId("ALL")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        assignedToUserId === "ALL"
                          ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      🌐 All Leads
                    </button>
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-rose-500 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSales ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-2.5`}>
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, phone, notes..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* College Filter */}
              <div>
                <select
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Colleges</option>
                  {meta.colleges.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Filter */}
              <div>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Branches / Streams</option>
                  {meta.branches.map((b: string) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Rep / Team Member Filter (Admins Only) */}
              {isAdmin && (
                <div>
                  <select
                    value={assignedToUserId}
                    onChange={(e) => setAssignedToUserId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 font-medium"
                  >
                    <option value="MY_LEADS">👤 My Assigned Leads (Default)</option>
                    <option value="ALL">🌐 All Assigned Reps / Staff</option>
                    <option value="unassigned">⚠️ Unassigned Leads</option>
                    <optgroup label="Filter by Team Member">
                      {meta.teamMembers.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.id === currentUser?.id ? `👤 ${formatTeamMemberLabel(m)} (You)` : formatTeamMemberLabel(m)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}
            </div>

            {/* Sub-Filters: Status, Objection & Next Call Due */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Status Filter */}
              <div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 font-semibold"
                >
                  <option value="">All Lead Statuses</option>
                  {SIMPLIFIED_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Objection / Reason Filter */}
              <div>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 font-medium"
                >
                  <option value="">All Objections / Reasons</option>
                  {OBJECTION_REASON_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Next Call Due Filter */}
              <div>
                <select
                  value={nextCallDue}
                  onChange={(e) => setNextCallDue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Schedules</option>
                  <option value="breached">🚨 SLA Breached (24h Exceeded)</option>
                  <option value="first_contact">⏳ 1st Contact Due (Within 24h)</option>
                  <option value="overdue">⚠️ Overdue Follow-ups</option>
                  <option value="today">📅 Due Today</option>
                  <option value="upcoming">⏳ Upcoming (Next 7 Days)</option>
                  <option value="none">⚪ Unscheduled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Selection Strip */}
          {selectedLeadIds.length > 0 && (
            <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? "s" : ""} selected
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Bulk Assign (Admins Only) */}
                {isAdmin && (
                  <select
                    value={bulkAssignee}
                    onChange={(e) => {
                      setBulkAssignee(e.target.value);
                      if (e.target.value) handleBulkAssignSubmit(e.target.value);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 font-semibold"
                  >
                    <option value="">Assign To Team Member / Sales Rep...</option>
                    {meta.teamMembers.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {formatTeamMemberLabel(m)}
                      </option>
                    ))}
                  </select>
                )}

                {/* Bulk Status */}
                <select
                  value={bulkStatus}
                  onChange={(e) => {
                    setBulkStatus(e.target.value);
                    if (e.target.value) handleBulkStatusSubmit(e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 font-semibold"
                >
                  <option value="">Change Status...</option>
                  {SIMPLIFIED_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setSelectedLeadIds([])}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Interactive Lead Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-zinc-400">Loading leads data...</div>
            ) : leadsList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {isSales ? "No assigned leads found" : "No student leads match your criteria."}
                </p>
                <div className="flex items-center justify-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-indigo-600 hover:bg-zinc-50"
                    >
                      Clear Filters
                    </button>
                  )}
                  {!isSales && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                    >
                      Add Lead
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.length === leadsList.length && leadsList.length > 0}
                          onChange={handleSelectAll}
                          className="rounded-sm border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="p-3">Student Lead</th>
                      <th className="p-3">College & Branch</th>
                      <th className="p-3 whitespace-nowrap">Follow-up & Calls</th>
                      <th className="p-3">Assigned Counselor</th>
                      <th className="p-3 whitespace-nowrap">Status</th>
                      <th className="p-3 text-right whitespace-nowrap">
                        Quick Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {leadsList.map((lead: any) => {
                      const isSelected = selectedLeadIds.includes(lead.id);

                      const nextCallDate = lead.nextCallAt ? new Date(lead.nextCallAt) : null;
                      const isOverdue =
                        nextCallDate &&
                        nextCallDate < new Date() &&
                        lead.status !== "CONVERTED" &&
                        lead.status !== "LOST";

                      const whatsappUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`;
                      const currentSimplifiedKey = getSimplifiedLeadStatus(lead.status, lead.quality);
                      const currentStatusCfg = SIMPLIFIED_STATUS_MAP[currentSimplifiedKey] || SIMPLIFIED_STATUS_MAP.NEW;

                      return (
                        <tr
                          key={lead.id}
                          className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors ${
                            isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                          }`}
                        >
                          {/* Row Selection Checkbox */}
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleLead(lead.id)}
                              className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>

                          {/* Student Info */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                                {lead.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                  <span>{lead.name}</span>
                                  {lead.yearOfStudy && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                      {lead.yearOfStudy}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5 font-mono">
                                  <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{lead.phone}</span>
                                  {lead.email && <span className="truncate max-w-[140px] text-zinc-400 font-sans">• {lead.email}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* College & Branch */}
                          <td className="p-3">
                            <div className="font-semibold text-zinc-800 dark:text-zinc-200 leading-snug" title={lead.collegeName}>
                              {lead.collegeName || "Unassigned"}
                            </div>
                            {lead.branch && (
                              <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{lead.branch}</div>
                            )}
                          </td>

                          {/* Follow-up & Calls */}
                          <td className="p-3 whitespace-nowrap">
                            <LeadSlaBadge lead={lead} showStage={true} showVelocity={true} />
                          </td>

                          {/* Assigned Counselor */}
                          <td className="p-3 whitespace-nowrap">
                            {isAdmin ? (
                              <select
                                value={lead.assignedToUserId || ""}
                                onChange={(e) => handleInlineAssignee(lead.id, e.target.value)}
                                className="text-xs font-semibold px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                              >
                                <option value="">⚠️ Unassigned</option>
                                {meta?.teamMembers?.map((m: any) => (
                                  <option key={m.id} value={m.id}>
                                    {formatTeamMemberLabel(m)}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                {lead.assignedToName || "Unassigned"}
                              </span>
                            )}
                          </td>

                          {/* Unified Status Dropdown & Objection */}
                          <td className="p-3 whitespace-nowrap">
                            <select
                              value={currentSimplifiedKey}
                              onChange={(e) => handleInlineStatus(lead.id, e.target.value)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${currentStatusCfg.badgeCls}`}
                            >
                              {SIMPLIFIED_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.key} value={opt.key} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-normal">
                                  {opt.emoji} {opt.label}
                                </option>
                              ))}
                            </select>
                            {lead.subStatus && (
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    getObjectionReasonConfig(lead.subStatus)?.badgeCls || "bg-zinc-100 text-zinc-700 border-zinc-200"
                                  }`}
                                  title={getObjectionReasonConfig(lead.subStatus)?.label || lead.subStatus}
                                >
                                  <span>{getObjectionReasonConfig(lead.subStatus)?.emoji || "📌"}</span>
                                  <span className="truncate max-w-[130px]">{getObjectionReasonConfig(lead.subStatus)?.label || lead.subStatus}</span>
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Quick Actions (Non-sticky: natural table layout, zero overlap) */}
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Call Directly */}
                              <a
                                href={`tel:${lead.phone}`}
                                title="Call directly"
                                className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              {/* Chat on WhatsApp */}
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              {/* View Profile & Call Notes (Merged Drawer) */}
                              <button
                                onClick={() => setDetailLeadId(lead.id)}
                                title="View Profile & Call Notes"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
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
        </div>
      )}

      {/* 3. Global Modals & Drawers */}
      {selectedLeadForCall && (
        <LogCallModal
          lead={selectedLeadForCall}
          baseUrl={baseUrl}
          onClose={() => setSelectedLeadForCall(null)}
          onSuccess={() => refetch()}
        />
      )}

      {detailLeadId && (
        <LeadDetailDrawer
          leadId={detailLeadId}
          baseUrl={baseUrl}
          onClose={() => setDetailLeadId(null)}
          onEditLead={(l) => {
            setDetailLeadId(null);
            setEditLeadData(l);
          }}
          teamMembers={meta.teamMembers}
        />
      )}

      {showAddModal && (
        <LeadFormModal
          baseUrl={baseUrl}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => refetch()}
          colleges={meta.colleges}
          branches={meta.branches}
          teamMembers={meta.teamMembers}
        />
      )}

      {editLeadData && (
        <LeadFormModal
          lead={editLeadData}
          baseUrl={baseUrl}
          onClose={() => setEditLeadData(null)}
          onSuccess={() => refetch()}
          colleges={meta.colleges}
          branches={meta.branches}
          teamMembers={meta.teamMembers}
        />
      )}

      {showImportModal && (
        <LeadImportModal
          baseUrl={baseUrl}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => refetch()}
          colleges={meta.colleges}
          teamMembers={meta.teamMembers}
        />
      )}
    </div>
  );
}
