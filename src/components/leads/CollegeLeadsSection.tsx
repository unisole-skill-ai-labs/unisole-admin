import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  Filter,
  UserPlus,
  UploadCloud,
  Download,
  PhoneCall,
  Eye,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Sun,
  Snowflake,
  RefreshCw,
  UserX,
  UserCheck,
  CheckSquare,
  Square,
  Sparkles,
  Target,
  Users,
  ChevronDown,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
} from "lucide-react";
import {
  useGetLeadsQuery,
  useGetLeadsMetaQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useSyncUsersToLeadsMutation,
} from "../../store";
import { formatTeamMemberLabel } from "../../utils/permissions";
import LogCallModal from "./LogCallModal";
import LeadDetailDrawer from "./LeadDetailDrawer";
import LeadFormModal from "./LeadFormModal";
import LeadImportModal from "./LeadImportModal";
import LeadSlaBadge from "./LeadSlaBadge";
import {
  SIMPLIFIED_STATUS_MAP,
  SIMPLIFIED_STATUS_OPTIONS,
  getSimplifiedLeadStatus,
  getStatusUpdatePayload,
} from "../../utils/leadStatus";

interface CollegeLeadsSectionProps {
  collegeId: string;
  collegeName: string;
  branch?: string; // If provided, locks query to this specific branch
  branches?: Array<{ id: string; name: string; code?: string }>;
  onSelectBranch?: (branchName: string) => void;
}

export default function CollegeLeadsSection({
  collegeId,
  collegeName,
  branch,
  branches = [],
  onSelectBranch,
}: CollegeLeadsSectionProps) {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const currentUser = useSelector((s: any) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isAdmin = currentUser?.role === "ADMIN" || isSuperAdmin;

  // Filters state
  const [search, setSearch] = useState("");
  const [activeBranchFilter, setActiveBranchFilter] = useState<string>(branch || "ALL");
  const [scope, setScope] = useState<"active" | "non_leads" | "all">("active");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [counselorFilter, setCounselorFilter] = useState<string>("ALL");
  const [callDueFilter, setCallDueFilter] = useState<string>("ALL");

  // Selection state for bulk operations
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkAssignCounselor, setBulkAssignCounselor] = useState("");

  // Modals state
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<any | null>(null);
  const [detailLeadId, setDetailLeadId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLeadData, setEditLeadData] = useState<any | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // RTK Query hooks
  const effectiveBranch = branch || (activeBranchFilter !== "ALL" ? activeBranchFilter : undefined);

  const queryParams = useMemo(() => {
    const effectiveStatus =
      statusFilter !== "ALL" && SIMPLIFIED_STATUS_MAP[statusFilter]
        ? SIMPLIFIED_STATUS_MAP[statusFilter].queryStatuses.join(",")
        : statusFilter !== "ALL"
        ? statusFilter
        : undefined;

    return {
      baseUrl,
      collegeId,
      branch: effectiveBranch,
      search: search.trim() || undefined,
      status: effectiveStatus,
      assignedToUserId: isAdmin ? (counselorFilter !== "ALL" ? counselorFilter : undefined) : currentUser?.id,
      nextCallDue: callDueFilter !== "ALL" ? (callDueFilter as any) : undefined,
      excludeNonLeads: scope === "active" ? true : undefined,
    };
  }, [baseUrl, collegeId, effectiveBranch, search, statusFilter, counselorFilter, callDueFilter, scope, isAdmin, currentUser?.id]);

  const { data: leadsData, isLoading, isFetching, refetch } = useGetLeadsQuery(queryParams);
  const { data: metaData } = useGetLeadsMetaQuery({ baseUrl });
  const [updateLead] = useUpdateLeadMutation();
  const [syncUsersToLeads, { isLoading: isSyncing }] = useSyncUsersToLeadsMutation();

  const rawLeads = useMemo(() => {
    if (Array.isArray(leadsData)) return leadsData;
    if (Array.isArray((leadsData as any)?.data)) return (leadsData as any).data;
    return [];
  }, [leadsData]);

  const meta = useMemo(() => {
    const d = metaData?.data || metaData;
    return {
      colleges: Array.isArray(d?.colleges) ? d.colleges : [],
      branches: Array.isArray(d?.branches) ? d.branches : [],
      teamMembers: Array.isArray(d?.teamMembers) ? d.teamMembers : [],
    };
  }, [metaData]);

  // Client-side scope filtering if "non_leads" is chosen
  const leads = useMemo(() => {
    if (!Array.isArray(rawLeads)) return [];
    if (scope === "non_leads") {
      return rawLeads.filter((l: any) => l?.status === "NOT_A_LEAD");
    }
    return rawLeads;
  }, [rawLeads, scope]);

  // Scoped KPIs
  const kpis = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter((l: any) => getSimplifiedLeadStatus(l.status, l.quality) === "INTERESTED").length;
    const converted = leads.filter((l: any) => l.status === "CONVERTED").length;
    const now = new Date();
    const followupsDue = leads.filter((l: any) => {
      if (!l.nextCallAt) return false;
      const d = new Date(l.nextCallAt);
      return d <= now && l.status !== "CONVERTED" && l.status !== "LOST";
    }).length;

    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";
    return { total, hot, converted, followupsDue, conversionRate };
  }, [leads]);

  // Handlers
  const handleInlineStatus = async (id: string, statusKey: string) => {
    try {
      const payload = getStatusUpdatePayload(statusKey);
      await updateLead({
        baseUrl,
        id,
        data: payload,
      }).unwrap();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleInlineAssignee = async (id: string, assigneeId: string) => {
    try {
      await updateLead({
        baseUrl,
        id,
        data: { assignedToUserId: assigneeId || null },
      }).unwrap();
    } catch (err) {
      console.error("Failed to reassign counselor", err);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l: any) => l.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = async () => {
    if (!bulkAssignCounselor || selectedLeadIds.length === 0) return;
    try {
      await Promise.all(
        selectedLeadIds.map((id) =>
          updateLead({
            baseUrl,
            id,
            data: { assignedToUserId: bulkAssignCounselor === "UNASSIGNED" ? null : bulkAssignCounselor },
          }).unwrap()
        )
      );
      setSelectedLeadIds([]);
      setBulkAssignCounselor("");
    } catch (err) {
      console.error("Bulk assign error", err);
    }
  };

  const handleBulkMarkNonLead = async () => {
    if (selectedLeadIds.length === 0) return;
    try {
      await Promise.all(
        selectedLeadIds.map((id) =>
          updateLead({
            baseUrl,
            id,
            data: { status: "NOT_A_LEAD" },
          }).unwrap()
        )
      );
      setSelectedLeadIds([]);
    } catch (err) {
      console.error("Bulk mark non-lead error", err);
    }
  };

  const handleSyncUsers = async () => {
    try {
      setSyncFeedback(null);
      const res = await syncUsersToLeads(baseUrl).unwrap();
      setSyncFeedback(
        `✅ Synced ${res?.data?.synced || 0} students as active leads (${res?.data?.totalUsers || 0} total platform students).`
      );
      refetch();
    } catch (err: any) {
      setSyncFeedback(`❌ Sync failed: ${err?.data?.message || err?.message || "Unknown error"}`);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Lead Name", "Phone", "Email", "College", "Branch", "Year", "Quality", "Status", "Calls", "Next Call", "Assigned Counselor", "Notes"];
    const rows = leads.map((l: any) => [
      `"${l.name || ""}"`,
      `"${l.phone || ""}"`,
      `"${l.email || ""}"`,
      `"${l.collegeName || ""}"`,
      `"${l.branch || ""}"`,
      `"${l.yearOfStudy || ""}"`,
      `"${l.quality || ""}"`,
      `"${l.status || ""}"`,
      `"${l.callCount || 0}"`,
      `"${l.nextCallAt ? new Date(l.nextCallAt).toLocaleString("en-IN") : ""}"`,
      `"${l.assignedToUser?.name || "Unassigned"}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${collegeName.toLowerCase().replace(/\s+/g, "_")}${branch ? `_${branch.toLowerCase().replace(/\s+/g, "_")}` : ""}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Leads</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{kpis.total}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {branch ? `${branch} branch pool` : `Across ${collegeName}`}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">🔥 Hot Priority</span>
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{kpis.hot}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">High admission propensity</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Calls / Follow-up</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{kpis.followupsDue}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Due callbacks & meetings</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Converted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {kpis.converted} <span className="text-xs font-bold text-zinc-400">({kpis.conversionRate}%)</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Enrollment conversion ratio</div>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-between animate-fade-in">
          <span>{syncFeedback}</span>
          <button onClick={() => setSyncFeedback(null)} className="text-indigo-500 hover:text-indigo-700">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Controls & Actions Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Top bar: Scope, Search, Primary Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Scope Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
            <button
              onClick={() => setScope("active")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                scope === "active"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Active Leads Only
            </button>
            <button
              onClick={() => setScope("non_leads")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                scope === "non_leads"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Non-Leads / Excluded
            </button>
            <button
              onClick={() => setScope("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                scope === "all"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              All Records
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncUsers}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-indigo-600" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Students"}</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-zinc-500" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Lead / Student</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, phone, email..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Branch Filter (if not locked to single branch) */}
          {!branch && (
            <div>
              <select
                value={activeBranchFilter}
                onChange={(e) => {
                  setActiveBranchFilter(e.target.value);
                  if (onSelectBranch && e.target.value !== "ALL") {
                    onSelectBranch(e.target.value);
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id || b.name} value={b.name}>
                    {b.name} {b.code ? `(${b.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              {SIMPLIFIED_STATUS_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.emoji} {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Rep Filter */}
          {isAdmin && (
            <div>
              <select
                value={counselorFilter}
                onChange={(e) => setCounselorFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="ALL">All Assigned Reps / Staff</option>
                {meta.teamMembers.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {formatTeamMemberLabel(m)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Next Call Due Filter */}
          <div>
            <select
              value={callDueFilter}
              onChange={(e) => setCallDueFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-medium"
            >
              <option value="ALL">All Schedules</option>
              <option value="breached">🚨 SLA Breached (24h Exceeded)</option>
              <option value="first_contact">⏳ 1st Contact Due (Within 24h)</option>
              <option value="overdue">⚠️ Overdue Follow-ups</option>
              <option value="today">📅 Due Today</option>
              <option value="upcoming">⏳ Upcoming</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Strip */}
        {selectedLeadIds.length > 0 && (
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/50 rounded-xl flex items-center justify-between gap-3 text-xs animate-fade-in">
            <span className="font-bold text-indigo-900 dark:text-indigo-200">
              {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <select
                    value={bulkAssignCounselor}
                    onChange={(e) => setBulkAssignCounselor(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Assign To Team Member / Sales Rep...</option>
                    <option value="UNASSIGNED">Unassign</option>
                    {meta.teamMembers.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {formatTeamMemberLabel(m)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleBulkAssign}
                    disabled={!bulkAssignCounselor}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    Apply
                  </button>
                </>
              )}
              <button
                onClick={handleBulkMarkNonLead}
                className="px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-lg cursor-pointer"
              >
                Mark as Non-Leads
              </button>
              <button
                onClick={() => setSelectedLeadIds([])}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Interactive Leads Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Loading college leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No leads found</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your search criteria or active filters."
                : `There are currently no registered leads for ${collegeName}${branch ? ` in ${branch}` : ""}.`}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add First Lead</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="p-3 w-8">
                    <button onClick={handleToggleSelectAll} className="cursor-pointer text-zinc-400 hover:text-zinc-600">
                      {selectedLeadIds.length > 0 && selectedLeadIds.length === leads.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Student / Lead</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3 whitespace-nowrap">Follow-up & Calls</th>
                  <th className="p-3">Assigned Rep / Staff</th>
                  <th className="p-3 whitespace-nowrap min-w-[125px]">Status</th>
                  <th className="p-3 text-right sticky right-0 bg-zinc-50 dark:bg-zinc-900 z-10 border-l border-zinc-200 dark:border-zinc-800 shadow-2xs whitespace-nowrap min-w-[80px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                {leads.map((lead: any) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const currentSimplifiedKey = getSimplifiedLeadStatus(lead.status, lead.quality);
                  const currentStatusCfg = SIMPLIFIED_STATUS_MAP[currentSimplifiedKey] || SIMPLIFIED_STATUS_MAP.NEW;
                  const isNonLead = currentSimplifiedKey === "NOT_A_LEAD";
                  const nextCallDate = lead.nextCallAt ? new Date(lead.nextCallAt) : null;
                  const isOverdue = nextCallDate && nextCallDate < new Date() && lead.status !== "CONVERTED" && lead.status !== "LOST";

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors ${
                        isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      } ${isNonLead ? "opacity-60 bg-zinc-50/30 dark:bg-zinc-900/30" : ""}`}
                    >
                      {/* Select checkbox */}
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleSelectRow(lead.id)}
                          className="cursor-pointer text-zinc-400 hover:text-zinc-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Student Info */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {lead.name ? lead.name.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span>{lead.name}</span>
                              {lead.yearOfStudy && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                  {lead.yearOfStudy}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                              <span className="capitalize">{lead.source?.toLowerCase().replace(/_/g, " ") || "Organic"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-3">
                        <div className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-1">
                          <span>{lead.phone}</span>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400"
                            title="Call Now"
                          >
                            <PhoneCall className="w-3 h-3" />
                          </a>
                        </div>
                        {lead.email && <div className="text-[11px] text-zinc-400 truncate max-w-[150px]">{lead.email}</div>}
                      </td>

                      {/* Branch */}
                      <td className="p-3">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {lead.branch || "General / Not specified"}
                        </span>
                      </td>

                      {/* Follow-up & Calls */}
                      <td className="p-3 whitespace-nowrap">
                        <LeadSlaBadge lead={lead} showStage={true} showVelocity={true} />
                      </td>

                      {/* Assigned Rep / Staff */}
                      <td className="p-3">
                        {!isAdmin ? (
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {lead.assignedToUser?.name || currentUser?.name || "Assigned to You"}
                          </span>
                        ) : (
                          <select
                            value={lead.assignedToUserId || ""}
                            onChange={(e) => handleInlineAssignee(lead.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 max-w-[150px]"
                          >
                            <option value="">Unassigned</option>
                            {meta.teamMembers.map((m: any) => (
                              <option key={m.id} value={m.id}>
                                {formatTeamMemberLabel(m)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 pr-4 whitespace-nowrap min-w-[125px]">
                        <select
                          value={currentSimplifiedKey}
                          onChange={(e) => handleInlineStatus(lead.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer max-w-[115px] ${currentStatusCfg.badgeCls}`}
                        >
                          {SIMPLIFIED_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                              {opt.emoji} {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td
                        className={`p-3 text-right sticky right-0 backdrop-blur-xs z-10 border-l border-zinc-200 dark:border-zinc-800 shadow-2xs whitespace-nowrap min-w-[80px] ${
                          isSelected ? "bg-indigo-50/95 dark:bg-zinc-900" : "bg-white/95 dark:bg-zinc-900/95"
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditLeadData(lead)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                            title="Edit Lead"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDetailLeadId(lead.id)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                            title="View Profile & Call Notes"
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

      {/* 4. Modals & Drawers */}
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
          initialCollegeId={collegeId}
          initialCollegeName={collegeName}
          initialBranch={branch || (activeBranchFilter !== "ALL" ? activeBranchFilter : undefined)}
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
          initialCollegeId={collegeId}
          initialCollegeName={collegeName}
          initialBranch={branch || (activeBranchFilter !== "ALL" ? activeBranchFilter : undefined)}
        />
      )}

      {showImportModal && (
        <LeadImportModal
          baseUrl={baseUrl}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => refetch()}
          colleges={meta.colleges}
          teamMembers={meta.teamMembers}
          initialCollegeId={collegeId}
          initialCollegeName={collegeName}
          initialBranch={branch || (activeBranchFilter !== "ALL" ? activeBranchFilter : undefined)}
        />
      )}
    </div>
  );
}
