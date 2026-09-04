import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
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
import LogCallModal from "../../components/leads/LogCallModal";
import LeadDetailDrawer from "../../components/leads/LeadDetailDrawer";
import LeadFormModal from "../../components/leads/LeadFormModal";
import LeadImportModal from "../../components/leads/LeadImportModal";
import LeadAnalyticsDashboard from "../../components/leads/LeadAnalyticsDashboard";

const QUALITY_BADGES: Record<string, { label: string; icon: any; cls: string }> = {
  HOT: { label: "HOT", icon: Flame, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" },
  WARM: { label: "WARM", icon: Sun, cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  COLD: { label: "COLD", icon: Snowflake, cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  POOR: { label: "POOR", icon: AlertTriangle, cls: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30" },
};

const STATUS_BADGES: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  ATTEMPTED: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
  CONTACTED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  INTERESTED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  FOLLOW_UP_SCHEDULED: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  DEMO_GIVEN: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
  CONVERTED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-black",
  LOST: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  JUNK: "bg-zinc-500/10 text-zinc-500 border-zinc-500/30",
  NOT_A_LEAD: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 font-semibold",
};

export default function LeadsManagementPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);

  const [activeTab, setActiveTab] = useState<"directory" | "analytics">("directory");
  const [scopeFilter, setScopeFilter] = useState<"ACTIVE" | "NON_LEADS" | "ALL">("ACTIVE");

  // Filters State
  const [search, setSearch] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [branch, setBranch] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [quality, setQuality] = useState("");
  const [status, setStatus] = useState("");
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
    if (status) return status;
    if (scopeFilter === "NON_LEADS") return "NOT_A_LEAD";
    return undefined;
  }, [status, scopeFilter]);

  // Queries & Mutations
  const { data: leadsRes, isLoading, refetch } = useGetLeadsQuery({
    baseUrl,
    search: search.trim() || undefined,
    collegeId: collegeId || undefined,
    branch: branch || undefined,
    assignedToUserId: assignedToUserId || undefined,
    quality: quality || undefined,
    status: effectiveStatus,
    excludeNonLeads: scopeFilter === "ACTIVE" && !status ? true : undefined,
    nextCallDue: nextCallDue || undefined,
  });

  const { data: metaRes } = useGetLeadsMetaQuery({ baseUrl });
  const meta = metaRes?.data || { colleges: [], branches: [], teamMembers: [] };

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

  const handleBulkStatusSubmit = async (newStatus: string) => {
    if (selectedLeadIds.length === 0 || !newStatus) return;
    try {
      await bulkUpdateStatusMutation({
        baseUrl,
        leadIds: selectedLeadIds,
        status: newStatus,
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

  const handleInlineQuality = async (leadId: string, q: string) => {
    try {
      await updateLead({
        baseUrl,
        id: leadId,
        data: { quality: q },
      }).unwrap();
    } catch (err) {
      console.error("Failed to update quality:", err);
    }
  };

  const handleInlineStatus = async (leadId: string, s: string) => {
    try {
      await updateLead({
        baseUrl,
        id: leadId,
        data: { status: s },
      }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leadsList.length === 0) return;
    const headers = [
      "Name",
      "Phone",
      "Email",
      "College",
      "Branch",
      "Year",
      "Assigned To",
      "Quality",
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
      `"${l.quality || ""}"`,
      `"${l.status || ""}"`,
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
    search || collegeId || branch || assignedToUserId || quality || status || nextCallDue
  );

  const clearFilters = () => {
    setSearch("");
    setCollegeId("");
    setBranch("");
    setAssignedToUserId("");
    setQuality("");
    setStatus("");
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
              <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Lead Management CRM
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Counselor assignments, quality scoring, call logging & conversion tracking
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

          <button
            onClick={handleSyncUsers}
            disabled={isSyncingUsers}
            title="Sync all registered platform students into CRM leads"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isSyncingUsers ? "animate-spin" : ""}`} />
            <span>{isSyncingUsers ? "Syncing Platform Users..." : "Sync All Users to Leads"}</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

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
          assignedToUserId={assignedToUserId || undefined}
        />
      ) : (
        <div className="space-y-4">
          {/* Advanced Multi-Filter Bar & Scope Switcher */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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

              {/* Assigned Counselor */}
              <div>
                <select
                  value={assignedToUserId}
                  onChange={(e) => setAssignedToUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Assigned Counselors</option>
                  <option value="unassigned">⚠️ Unassigned Leads</option>
                  {meta.teamMembers.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.phone} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-Filters: Quality, Status, Next Call Due */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Quality */}
              <div>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Quality Tiers</option>
                  <option value="HOT">🔥 Hot Leads (High Intent)</option>
                  <option value="WARM">☀️ Warm Leads</option>
                  <option value="COLD">❄️ Cold Leads</option>
                  <option value="POOR">⚠️ Poor Fit</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Pipeline Statuses</option>
                  <option value="NEW">New Leads</option>
                  <option value="ATTEMPTED">Call Attempted</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="FOLLOW_UP_SCHEDULED">Follow-up Scheduled</option>
                  <option value="DEMO_GIVEN">Demo Given</option>
                  <option value="CONVERTED">🎉 Converted / Enrolled</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              {/* Follow-up Queue */}
              <div>
                <select
                  value={nextCallDue}
                  onChange={(e) => setNextCallDue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Schedules</option>
                  <option value="overdue">🚨 Overdue Follow-ups</option>
                  <option value="today">📅 Follow-ups Due Today</option>
                  <option value="upcoming">⏳ Upcoming Follow-ups</option>
                  <option value="none">⚪ No Follow-up Set</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Action Strip */}
          {selectedLeadIds.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {selectedLeadIds.length}
                </span>
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  {selectedLeadIds.length} leads selected
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Bulk Assign */}
                <select
                  value={bulkAssignee}
                  onChange={(e) => {
                    setBulkAssignee(e.target.value);
                    if (e.target.value) handleBulkAssignSubmit(e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 font-semibold"
                >
                  <option value="">Assign To Counselor...</option>
                  {meta.teamMembers.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.phone}
                    </option>
                  ))}
                </select>

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
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="CONVERTED">🎉 Converted</option>
                  <option value="LOST">Lost</option>
                  <option value="JUNK">🗑️ Junk</option>
                  <option value="NOT_A_LEAD">🚫 Not a Lead</option>
                </select>

                <button
                  onClick={() => handleBulkStatusSubmit("NOT_A_LEAD")}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Mark Selected Non-Leads</span>
                </button>

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
                  No student leads match your criteria.
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
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                  >
                    Add Lead
                  </button>
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
                      <th className="p-3">Quality Tier</th>
                      <th className="p-3">Call Velocity</th>
                      <th className="p-3">Next Call Time</th>
                      <th className="p-3">Assigned Counselor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Quick Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {leadsList.map((lead: any) => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      const qualityCfg = QUALITY_BADGES[lead.quality] || QUALITY_BADGES.WARM;
                      const QualityIcon = qualityCfg.icon;

                      const nextCallDate = lead.nextCallAt ? new Date(lead.nextCallAt) : null;
                      const isOverdue =
                        nextCallDate &&
                        nextCallDate < new Date() &&
                        lead.status !== "CONVERTED" &&
                        lead.status !== "LOST";

                      const cleanPhone = lead.phone?.replace(/[^\d]/g, "") || "";
                      const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodeURIComponent(
                        `Hi ${lead.name || "there"}, this is regarding your interest with Unisole.`
                      )}`;

                      return (
                        <tr
                          key={lead.id}
                          className={`hover:bg-zinc-50/70 dark:hover:bg-zinc-950/70 transition-colors ${
                            isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleLead(lead.id)}
                              className="rounded-sm border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>

                          {/* Student Lead & Contact */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => setDetailLeadId(lead.id)}
                                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                              >
                                {(lead.name || "L").charAt(0).toUpperCase()}
                              </button>
                              <div>
                                <button
                                  onClick={() => setDetailLeadId(lead.id)}
                                  className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left block"
                                >
                                  {lead.name}
                                </button>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                                  <span className="font-mono text-zinc-600 dark:text-zinc-300">{lead.phone}</span>
                                  {lead.email && <span className="truncate max-w-[120px]">• {lead.email}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* College & Branch */}
                          <td className="p-3">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate max-w-[160px]">
                              {lead.collegeName || "Unassigned"}
                            </span>
                            <span className="text-[11px] text-zinc-400 block truncate max-w-[160px]">
                              {lead.branch || "General"} {lead.yearOfStudy ? `(${lead.yearOfStudy})` : ""}
                            </span>
                          </td>

                          {/* Lead Quality */}
                          <td className="p-3">
                            <select
                              value={lead.quality || "WARM"}
                              onChange={(e) => handleInlineQuality(lead.id, e.target.value)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${qualityCfg.cls}`}
                            >
                              <option value="HOT">🔥 Hot</option>
                              <option value="WARM">☀️ Warm</option>
                              <option value="COLD">❄️ Cold</option>
                              <option value="POOR">⚠️ Poor</option>
                            </select>
                          </td>

                          {/* Call Velocity */}
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {lead.callCount || 0} calls
                              </span>
                              <button
                                onClick={() => setSelectedLeadForCall(lead)}
                                title="Log a discussion"
                                className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {lead.lastCallAt && (
                              <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                                Last: {new Date(lead.lastCallAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </td>

                          {/* Next Call Time */}
                          <td className="p-3">
                            {nextCallDate ? (
                              <div
                                className={`text-[11px] font-semibold flex items-center gap-1 ${
                                  isOverdue
                                    ? "text-rose-600 dark:text-rose-400 font-bold"
                                    : "text-zinc-700 dark:text-zinc-300"
                                }`}
                              >
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>
                                  {nextCallDate.toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}{" "}
                                  {nextCallDate.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-400">Not set</span>
                            )}
                          </td>

                          {/* Assigned Counselor */}
                          <td className="p-3">
                            <select
                              value={lead.assignedToUserId || ""}
                              onChange={(e) => handleInlineAssignee(lead.id, e.target.value)}
                              className="text-xs font-semibold px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 max-w-[140px]"
                            >
                              <option value="">Unassigned</option>
                              {meta.teamMembers.map((m: any) => (
                                <option key={m.id} value={m.id}>
                                  {m.name || m.phone}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            <select
                              value={lead.status || "NEW"}
                              onChange={(e) => handleInlineStatus(lead.id, e.target.value)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                                STATUS_BADGES[lead.status || "NEW"] || STATUS_BADGES.NEW
                              }`}
                            >
                              <option value="NEW">New</option>
                              <option value="ATTEMPTED">Attempted</option>
                              <option value="CONTACTED">Contacted</option>
                              <option value="INTERESTED">Interested</option>
                              <option value="FOLLOW_UP_SCHEDULED">Follow-up</option>
                              <option value="DEMO_GIVEN">Demo Given</option>
                              <option value="CONVERTED">🎉 Converted</option>
                              <option value="LOST">Lost</option>
                              <option value="JUNK">Junk</option>
                              <option value="NOT_A_LEAD">🚫 Non-Lead</option>
                            </select>
                          </td>

                          {/* Quick Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Mark / Unmark Non-Lead */}
                              {lead.status === "NOT_A_LEAD" ? (
                                <button
                                  onClick={() => handleInlineStatus(lead.id, "NEW")}
                                  title="Reactivate as Active Lead"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleInlineStatus(lead.id, "NOT_A_LEAD")}
                                  title="Mark as Non-Lead"
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              <a
                                href={`tel:${lead.phone}`}
                                title="Call directly"
                                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={() => setSelectedLeadForCall(lead)}
                                title="Log call notes"
                                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDetailLeadId(lead.id)}
                                title="View profile & full timeline"
                                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
