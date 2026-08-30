import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetLeadDiversificationQuery } from "../../store";
import {
  Sparkles,
  Building2,
  Users,
  GraduationCap,
  Layers,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  Award,
  Play,
  Filter,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Calendar,
  Phone,
  Flame,
  CheckCircle2,
  Table,
  LayoutGrid,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const BRANCH_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-zinc-400",
];

export default function LeadDiversificationPage() {
  const navigate = useNavigate();
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);

  const {
    data: report,
    isLoading,
    isFetching,
    refetch,
  } = useGetLeadDiversificationQuery(baseUrl);

  const [activeView, setActiveView] = useState<"cards" | "table" | "leads">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"leads" | "sessions" | "conversion" | "score" | "name">("leads");

  // Format and export CSV
  const handleExportCSV = (collegeId?: string) => {
    if (!report?.masterLeads) return;

    let targetLeads = report.masterLeads;
    let filename = "unisole_leads_diversification_master.csv";

    if (collegeId) {
      targetLeads = targetLeads.filter(
        (l: any) => l.collegeId === collegeId || l.collegeName === collegeId
      );
      filename = `unisole_leads_${collegeId.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`;
    }

    const headers = [
      "Student Name",
      "WhatsApp Phone",
      "College / University",
      "Academic Branch",
      "Year of Study",
      "Quiz / Engagement Score",
      "Session Code",
      "Joined Date & Time",
    ];

    const csvRows = [
      headers.join(","),
      ...targetLeads.map((l: any) =>
        [
          `"${(l.name || "").replace(/"/g, '""')}"`,
          `"${(l.phone || "").replace(/"/g, '""')}"`,
          `"${(l.collegeName || "").replace(/"/g, '""')}"`,
          `"${(l.branch || "Unspecified").replace(/"/g, '""')}"`,
          `"${(l.yearOfStudy || "—").replace(/"/g, '""')}"`,
          l.totalScore || 0,
          `"${(l.sessionCode || "").replace(/"/g, '""')}"`,
          `"${l.joinedAt ? new Date(l.joinedAt).toLocaleString() : ""}"`,
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered and sorted colleges
  const filteredColleges = useMemo(() => {
    if (!report?.colleges) return [];
    let list = [...report.colleges];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.college.name.toLowerCase().includes(q) ||
          c.college.shortName.toLowerCase().includes(q) ||
          c.branchesBreakdown.some((b: any) => b.name.toLowerCase().includes(q))
      );
    }

    if (selectedBranchFilter !== "ALL") {
      list = list.filter((c) =>
        c.branchesBreakdown.some(
          (b: any) =>
            b.name.toLowerCase().includes(selectedBranchFilter.toLowerCase()) ||
            (b.code && b.code.toLowerCase().includes(selectedBranchFilter.toLowerCase()))
        )
      );
    }

    list.sort((a, b) => {
      if (sortBy === "leads") return b.totalLeads - a.totalLeads;
      if (sortBy === "sessions") return b.sessionsCount - a.sessionsCount;
      if (sortBy === "conversion") return b.conversionRate - a.conversionRate;
      if (sortBy === "score") return b.averageScore - a.averageScore;
      if (sortBy === "name") return a.college.name.localeCompare(b.college.name);
      return 0;
    });

    return list;
  }, [report?.colleges, searchQuery, selectedBranchFilter, sortBy]);

  // Filtered master leads
  const filteredMasterLeads = useMemo(() => {
    if (!report?.masterLeads) return [];
    let list = [...report.masterLeads];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l: any) =>
          (l.name || "").toLowerCase().includes(q) ||
          (l.phone || "").toLowerCase().includes(q) ||
          (l.collegeName || "").toLowerCase().includes(q) ||
          (l.branch || "").toLowerCase().includes(q) ||
          (l.sessionCode || "").toLowerCase().includes(q)
      );
    }

    if (selectedBranchFilter !== "ALL") {
      list = list.filter((l: any) =>
        (l.branch || "").toLowerCase().includes(selectedBranchFilter.toLowerCase())
      );
    }

    return list;
  }, [report?.masterLeads, searchQuery, selectedBranchFilter]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
          <span className="text-xs font-mono text-zinc-400">
            Synthesizing College-Wise Lead Diversification Matrix...
          </span>
        </div>
      </div>
    );
  }

  const summary = report?.summary || {
    totalCollegesCovered: 0,
    totalSessionsConducted: 0,
    totalLeadsCaptured: 0,
    totalEnrolledLearners: 0,
    topCollegeByLeads: { name: "—", count: 0 },
    topBranchOverall: { name: "—", count: 0 },
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ─── 1. Header Banner ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-zinc-900/40 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Campus Outreach Analytics & Distribution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Lead Generation & Campus Diversification Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl mt-1.5 leading-relaxed">
            Analyze campus outreach performance: track how many roadshow sessions were conducted per college, total leads captured, and their academic branch distributions (CSE, IT, ECE, Mech, etc.).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1.5"
            title="Refresh lead diversification report"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExportCSV()}
            icon={Download}
            className="flex items-center gap-1.5"
          >
            Export All Leads CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/presentations")}
            icon={Play}
            className="shadow-lg shadow-indigo-500/25"
          >
            Launch Roadshow
          </Button>
        </div>
      </div>

      {/* ─── 2. Executive KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Campuses Covered */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Partner Campuses
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {summary.totalCollegesCovered}
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5">Colleges engaged</span>
          </div>
        </div>

        {/* Total Roadshow Sessions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Roadshows Conducted
            </span>
            <div className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {summary.totalSessionsConducted}
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5">Presentation sessions</span>
          </div>
        </div>

        {/* Total Captured Leads */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Total Captured Leads
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {summary.totalLeadsCaptured}
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5">Audience registrations</span>
          </div>
        </div>

        {/* Top Performing Academic Branch */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Top Branch Overall
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 truncate block">
              {summary.topBranchOverall.name}
            </span>
            <span className="block text-[10px] font-mono font-bold text-amber-500 mt-0.5">
              {summary.topBranchOverall.count} leads captured
            </span>
          </div>
        </div>

        {/* LMS Converted Learners */}
        <div className="col-span-2 lg:col-span-1 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              LMS Learners Converted
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {summary.totalEnrolledLearners}
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5">Enrolled into pathways</span>
          </div>
        </div>
      </div>

      {/* ─── 3. Search, Filter & View Controls ────────────────────────────── */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search college, campus code, or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400 font-bold uppercase font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
              >
                <option value="leads">Most Leads</option>
                <option value="sessions">Most Roadshows</option>
                <option value="conversion">Highest Conversion</option>
                <option value="score">Avg Quiz Score</option>
                <option value="name">College Name</option>
              </select>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <button
                onClick={() => setActiveView("cards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === "cards"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                title="Campus Diversification Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Campus Cards</span>
              </button>

              <button
                onClick={() => setActiveView("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === "table"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                title="Matrix Table View"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Matrix Table</span>
              </button>

              <button
                onClick={() => setActiveView("leads")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === "leads"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                title="Master Leads Ledger"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All Leads ({filteredMasterLeads.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Branch Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-[10px] text-zinc-400 font-bold uppercase font-mono shrink-0">
            Filter Branch:
          </span>
          {["ALL", "CSE", "IT", "AIML", "ECE", "EEE", "Mech", "Civil", "BCA", "MBA"].map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBranchFilter(b)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                selectedBranchFilter === b
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 4. VIEW 1: CAMPUS DIVERSIFICATION CARDS ─────────────────────── */}
      {activeView === "cards" && (
        <div className="space-y-6">
          {filteredColleges.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
              <Building2 className="w-10 h-10 mx-auto text-zinc-400" />
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                No Matching Colleges Found
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No colleges match your current search or branch filters. Try resetting the filters.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedBranchFilter("ALL");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredColleges.map((item: any) => {
                const { college, sessionsCount, totalLeads, conversionRate, averageScore, branchesBreakdown, sessions } = item;

                return (
                  <div
                    key={college.id}
                    className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-5"
                  >
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-500/20">
                            {college.shortName || college.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                {college.name}
                              </h3>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400">
                              Slug: {college.slug} • ID: {college.id}
                            </span>
                          </div>
                        </div>

                        <Badge variant={college.isActive ? "emerald" : "default"}>
                          {college.isActive ? "Active Campus" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Summary Metrics Row */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                        <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Roadshows
                          </span>
                          <span className="text-base font-black text-zinc-900 dark:text-zinc-100 font-mono">
                            {sessionsCount}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Total Leads
                          </span>
                          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {totalLeads}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Conversion
                          </span>
                          <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                            {conversionRate}%
                          </span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Avg Score
                          </span>
                          <span className="text-base font-black text-amber-500 font-mono">
                            {averageScore} pts
                          </span>
                        </div>
                      </div>

                      {/* Branch-Wise Diversification Breakdown */}
                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Branch Lead Diversification ({branchesBreakdown.length})</span>
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {totalLeads} attendees total
                          </span>
                        </div>

                        {/* Stacked Proportional Progress Bar */}
                        {totalLeads > 0 && (
                          <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                            {branchesBreakdown.map((b: any, bIdx: number) => {
                              if (b.percentage === 0) return null;
                              return (
                                <div
                                  key={b.id}
                                  style={{ width: `${b.percentage}%` }}
                                  className={`${BRANCH_COLORS[bIdx % BRANCH_COLORS.length]} h-full transition-all`}
                                  title={`${b.name}: ${b.leadsCount} leads (${b.percentage}%)`}
                                />
                              );
                            })}
                          </div>
                        )}

                        {/* Interactive Branch Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {branchesBreakdown.length === 0 ? (
                            <span className="text-[11px] text-zinc-400 italic">
                              No branch breakdown recorded yet.
                            </span>
                          ) : (
                            branchesBreakdown.map((b: any, bIdx: number) => (
                              <div
                                key={b.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-[11px]"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    BRANCH_COLORS[bIdx % BRANCH_COLORS.length]
                                  }`}
                                />
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                  {b.code || b.name}
                                </span>
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">
                                  {b.leadsCount}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  ({b.percentage}%)
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Recent Sessions List */}
                      {sessions.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                            Recent Sessions:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {sessions.slice(0, 3).map((sess: any) => (
                              <button
                                key={sess.id}
                                onClick={() => navigate(`/presentations/analytics/${sess.id}`)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-500/20 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
                              >
                                <span>{sess.sessionCode}</span>
                                <span className="text-zinc-400">•</span>
                                <span>{sess.activeAttendeesCount} att.</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      {college.id !== "open_roadshows" ? (
                        <Link to={`/colleges/${college.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Sparkles}
                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          >
                            Campus Hub
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-400 font-mono">Direct Outreach</span>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportCSV(college.id)}
                          icon={Download}
                          title="Download college leads CSV"
                        >
                          CSV
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate("/presentations")}
                          icon={Play}
                        >
                          New Roadshow
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── 5. VIEW 2: COMPARATIVE MATRIX TABLE ─────────────────────────── */}
      {activeView === "table" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Campus Lead Diversification Matrix ({filteredColleges.length} Colleges)
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExportCSV()}
              icon={Download}
            >
              Export Matrix
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-5">University / Campus</th>
                  <th className="py-3.5 px-4 text-center">Sessions</th>
                  <th className="py-3.5 px-4 text-center">Total Leads</th>
                  <th className="py-3.5 px-4">Top Academic Branches</th>
                  <th className="py-3.5 px-4 text-center">LMS Enrolled</th>
                  <th className="py-3.5 px-4 text-center">Avg Quiz Score</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredColleges.map((item: any) => {
                  const { college, sessionsCount, totalLeads, enrolledCount, conversionRate, averageScore, branchesBreakdown } = item;

                  return (
                    <tr
                      key={college.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="font-black text-zinc-900 dark:text-zinc-100 text-sm">
                          {college.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {college.shortName || college.slug}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                          {sessionsCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {totalLeads}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-md">
                          {branchesBreakdown.slice(0, 4).map((b: any, idx: number) => (
                            <span
                              key={b.id}
                              className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300"
                            >
                              {b.code || b.name}: <strong className="text-indigo-600 dark:text-indigo-400">{b.leadsCount}</strong> ({b.percentage}%)
                            </span>
                          ))}
                          {branchesBreakdown.length > 4 && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              +{branchesBreakdown.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center font-mono">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {enrolledCount}
                        </span>{" "}
                        <span className="text-[10px] text-zinc-400">({conversionRate}%)</span>
                      </td>

                      <td className="py-4 px-4 text-center font-mono font-bold text-amber-500">
                        {averageScore} pts
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {college.id !== "open_roadshows" && (
                            <Link to={`/colleges/${college.id}`}>
                              <Button variant="ghost" size="sm">
                                View Hub
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportCSV(college.id)}
                            icon={Download}
                            title="Export CSV"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 6. VIEW 3: MASTER LEADS LEDGER ──────────────────────────────── */}
      {activeView === "leads" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:px-6 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Master Student Leads Ledger ({filteredMasterLeads.length})
              </h3>
              <p className="text-[11px] text-zinc-400">
                Individual attendee records collected across all college presentation sessions.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleExportCSV()}
              icon={Download}
              className="shadow-md"
            >
              Export ({filteredMasterLeads.length}) Leads CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-5">#</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">WhatsApp Phone</th>
                  <th className="py-3.5 px-4">College / University</th>
                  <th className="py-3.5 px-4">Branch / Stream</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4">Session Code</th>
                  <th className="py-3.5 px-5 text-right">Joined At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredMasterLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      No matching leads found.
                    </td>
                  </tr>
                ) : (
                  filteredMasterLeads.slice(0, 150).map((lead: any, idx: number) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono text-zinc-400 text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {lead.name}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                        +91 {lead.phone}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                        {lead.collegeName || "Open Roadshow"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
                          {lead.branch || "Unspecified"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {lead.totalScore || 0} pts
                      </td>

                      <td className="py-3.5 px-4 font-mono text-indigo-500 font-bold">
                        {lead.sessionCode || "—"}
                      </td>

                      <td className="py-3.5 px-5 text-right font-mono text-zinc-400 text-[11px]">
                        {lead.joinedAt
                          ? new Date(lead.joinedAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
