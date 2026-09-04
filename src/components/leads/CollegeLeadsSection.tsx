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
import LogCallModal from "./LogCallModal";
import LeadDetailDrawer from "./LeadDetailDrawer";
import LeadFormModal from "./LeadFormModal";
import LeadImportModal from "./LeadImportModal";

interface CollegeLeadsSectionProps {
  collegeId: string;
  collegeName: string;
  branch?: string; // If provided, locks query to this specific branch
  branches?: Array<{ id: string; name: string; code?: string }>;
  onSelectBranch?: (branchName: string) => void;
}

const QUALITY_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  HOT: {
    label: "Hot",
    icon: Flame,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50",
  },
  WARM: {
    label: "Warm",
    icon: Sun,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
  },
  COLD: {
    label: "Cold",
    icon: Snowflake,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50",
  },
  POOR: {
    label: "Poor",
    icon: AlertCircle,
    color: "text-zinc-500 dark:text-zinc-400",
    bg: "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
  },
  UNQUALIFIED: {
    label: "Unqualified",
    icon: AlertCircle,
    color: "text-zinc-400 dark:text-zinc-500",
    bg: "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
  },
};

const STATUS_BADGES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
  ATTEMPTED: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50",
  CONTACTED: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50",
  INTERESTED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
  FOLLOW_UP_SCHEDULED: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
  DEMO_GIVEN: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900/50",
  CONVERTED: "bg-emerald-600 text-white border-emerald-600 shadow-xs",
  LOST: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50",
  JUNK: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
  NOT_A_LEAD: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 line-through",
};

export default function CollegeLeadsSection({
  collegeId,
  collegeName,
  branch,
  branches = [],
  onSelectBranch,
}: CollegeLeadsSectionProps) {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);

  // Filters state
  const [search, setSearch] = useState("");
  const [activeBranchFilter, setActiveBranchFilter] = useState<string>(branch || "ALL");
  const [scope, setScope] = useState<"active" | "non_leads" | "all">("active");
  const [qualityFilter, setQualityFilter] = useState<string>("ALL");
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
    return {
      baseUrl,
      collegeId,
      branch: effectiveBranch,
      search: search.trim() || undefined,
      quality: qualityFilter !== "ALL" ? qualityFilter : undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      assignedToUserId: counselorFilter !== "ALL" ? counselorFilter : undefined,
      nextCallDue: callDueFilter !== "ALL" ? (callDueFilter as any) : undefined,
      excludeNonLeads: scope === "active" ? true : undefined,
    };
  }, [baseUrl, collegeId, effectiveBranch, search, qualityFilter, statusFilter, counselorFilter, callDueFilter, scope]);

  const { data: rawLeads = [], isLoading, isFetching, refetch } = useGetLeadsQuery(queryParams);
  const { data: metaData } = useGetLeadsMetaQuery(baseUrl);
  const [updateLead] = useUpdateLeadMutation();
  const [syncUsersToLeads, { isLoading: isSyncing }] = useSyncUsersToLeadsMutation();

  const meta = useMemo(() => {
    return (
      metaData?.data || {
        colleges: [],
        branches: [],
        teamMembers: [],
        qualities: ["HOT", "WARM", "COLD", "POOR", "UNQUALIFIED"],
        statuses: [
          "NEW",
          "ATTEMPTED",
          "CONTACTED",
          "INTERESTED",
          "FOLLOW_UP_SCHEDULED",
          "DEMO_GIVEN",
          "CONVERTED",
          "LOST",
          "JUNK",
          "NOT_A_LEAD",
        ],
        sources: [],
      }
    );
  }, [metaData]);

  // Client-side scope filtering if "non_leads" is chosen
  const leads = useMemo(() => {
    if (scope === "non_leads") {
      return rawLeads.filter((l: any) => l.status === "NOT_A_LEAD");
    }
    return rawLeads;
  }, [rawLeads, scope]);

  // Scoped KPIs
  const kpis = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter((l: any) => l.quality === "HOT").length;
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
  const handleInlineStatus = async (id: string, newStatus: string) => {
    try {
      await updateLead({
        baseUrl,
        id,
        data: { status: newStatus },
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

          {/* Quality Filter */}
          <div>
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="ALL">All Qualities</option>
              <option value="HOT">🔥 Hot</option>
              <option value="WARM">☀️ Warm</option>
              <option value="COLD">❄️ Cold</option>
              <option value="POOR">⚠️ Poor</option>
              <option value="UNQUALIFIED">Unqualified</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ATTEMPTED">Attempted</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="FOLLOW_UP_SCHEDULED">Follow-up Due</option>
              <option value="DEMO_GIVEN">Demo Given</option>
              <option value="CONVERTED">🎉 Converted</option>
              <option value="LOST">Lost</option>
              <option value="JUNK">Junk</option>
            </select>
          </div>

          {/* Counselor Filter */}
          <div>
            <select
              value={counselorFilter}
              onChange={(e) => setCounselorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="ALL">All Counselors</option>
              {meta.teamMembers.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Next Call Due Filter */}
          <div>
            <select
              value={callDueFilter}
              onChange={(e) => setCallDueFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="ALL">All Schedules</option>
              <option value="overdue">🚨 Overdue Only</option>
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
              <select
                value={bulkAssignCounselor}
                onChange={(e) => setBulkAssignCounselor(e.target.value)}
                className="px-2 py-1 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Assign Counselor...</option>
                <option value="UNASSIGNED">Unassign</option>
                {meta.teamMembers.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.phone}
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
              {search || qualityFilter !== "ALL" || statusFilter !== "ALL"
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
                  <th className="p-3">Quality</th>
                  <th className="p-3">Calls</th>
                  <th className="p-3">Next Call Time</th>
                  <th className="p-3">Assigned Counselor</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                {leads.map((lead: any) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const isNonLead = lead.status === "NOT_A_LEAD";
                  const qConfig = QUALITY_CONFIG[lead.quality || "WARM"] || QUALITY_CONFIG.WARM;
                  const QualityIcon = qConfig.icon;
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
                              {lead.userId && (
                                <span className="text-[9px] px-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold">
                                  Registered User
                                </span>
                              )}
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

                      {/* Lead Quality */}
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${qConfig.bg} ${qConfig.color}`}
                        >
                          <QualityIcon className="w-3 h-3" />
                          <span>{qConfig.label}</span>
                        </span>
                      </td>

                      {/* Call Count */}
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedLeadForCall(lead)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors"
                          title="Click to log a call"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{lead.callCount || 0} calls</span>
                        </button>
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
                            {isOverdue && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-black">
                                OVERDUE
                              </span>
                            )}
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
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 max-w-[130px]"
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
                          <option value="NOT_A_LEAD">🚫 Not a Lead</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedLeadForCall(lead)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold transition-all"
                            title="Log Call"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleInlineStatus(lead.id, isNonLead ? "NEW" : "NOT_A_LEAD")}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isNonLead
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50"
                                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                            }`}
                            title={isNonLead ? "Reactivate as Active Lead" : "Mark as Non-Lead"}
                          >
                            {isNonLead ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => setEditLeadData(lead)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            title="Edit Lead"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDetailLeadId(lead.id)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            title="View Full History Drawer"
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
