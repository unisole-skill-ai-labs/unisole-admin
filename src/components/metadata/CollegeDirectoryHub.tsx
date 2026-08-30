import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetCollegesQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
  useGetBranchesQuery,
  useGetPresentationsQuery,
  useGetSessionsQuery,
  useGetLeadDiversificationQuery,
} from "../../store";
import {
  GraduationCap,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  CheckCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Play,
  Users,
  LayoutGrid,
  List,
  Radio,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Layers,
  ArrowRight,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";

interface CollegeDirectoryHubProps {
  baseUrl: string;
}

export default function CollegeDirectoryHub({ baseUrl }: CollegeDirectoryHubProps) {
  const navigate = useNavigate();
  const { data: colleges = [], isLoading, refetch } = useGetCollegesQuery(baseUrl);
  const { data: branches = [] } = useGetBranchesQuery(baseUrl);
  const { data: presRes } = useGetPresentationsQuery(baseUrl);
  const { data: sessRes } = useGetSessionsQuery({ baseUrl });
  const { data: diversificationRes } = useGetLeadDiversificationQuery(baseUrl);

  const presentations = presRes?.data || [];
  const sessions = sessRes?.data || [];
  const collegeReports = diversificationRes?.colleges || [];

  const [createCollege, { isLoading: isCreating }] = useCreateCollegeMutation();
  const [updateCollege, { isLoading: isUpdating }] = useUpdateCollegeMutation();
  const [deleteCollege, { isLoading: isDeleting }] = useDeleteCollegeMutation();

  // Search, filter & sort state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [sortBy, setSortBy] = useState<"leads" | "sessions" | "branches" | "name">("leads");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [deletingCollege, setDeletingCollege] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Map stats from lead diversification report
  const collegeReportMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const rep of collegeReports) {
      if (rep.college?.id) map.set(rep.college.id, rep);
    }
    return map;
  }, [collegeReports]);

  // Group branches by college
  const branchesByCollege = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const b of branches) {
      if (b.collegeId) {
        const list = map.get(b.collegeId) || [];
        list.push(b);
        map.set(b.collegeId, list);
      }
    }
    return map;
  }, [branches]);

  // Group sessions by college
  const sessionsByCollege = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const s of sessions) {
      if (s.collegeId) {
        const list = map.get(s.collegeId) || [];
        list.push(s);
        map.set(s.collegeId, list);
      }
    }
    return map;
  }, [sessions]);

  // Filtered & sorted colleges
  const filteredColleges = useMemo(() => {
    let result = colleges.filter((c: any) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (c.name || "").toLowerCase().includes(q) ||
        (c.shortName || "").toLowerCase().includes(q) ||
        (c.slug || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && c.isActive) ||
        (statusFilter === "INACTIVE" && !c.isActive);

      return matchesSearch && matchesStatus;
    });

    result = [...result].sort((a: any, b: any) => {
      const repA = collegeReportMap.get(a.id);
      const repB = collegeReportMap.get(b.id);
      const leadsA = repA?.totalLeads || 0;
      const leadsB = repB?.totalLeads || 0;
      const sessA = (sessionsByCollege.get(a.id) || []).length;
      const sessB = (sessionsByCollege.get(b.id) || []).length;
      const brnA = (branchesByCollege.get(a.id) || []).length;
      const brnB = (branchesByCollege.get(b.id) || []).length;

      if (sortBy === "leads") return leadsB - leadsA;
      if (sortBy === "sessions") return sessB - sessA;
      if (sortBy === "branches") return brnB - brnA;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [colleges, search, statusFilter, sortBy, collegeReportMap, sessionsByCollege, branchesByCollege]);

  // Summary counts
  const totalLeadsCount = diversificationRes?.summary?.totalLeadsCaptured || 0;
  const activeSessionsCount = sessions.filter((s: any) => s.status === "LIVE").length;
  const totalEnrolledLearners = diversificationRes?.summary?.totalEnrolledLearners || 0;

  const autoGenerateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleOpenCreate = () => {
    setName("");
    setShortName("");
    setSlug("");
    setDescription("");
    setErrorMsg("");
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (c: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollege(c);
    setName(c.name);
    setShortName(c.shortName || "");
    setSlug(c.slug);
    setDescription(c.description || "");
    setErrorMsg("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setErrorMsg("University name and URL slug are required");
      return;
    }
    try {
      await createCollege({
        baseUrl,
        body: {
          name: name.trim(),
          shortName: shortName.trim() || null,
          slug: slug.trim(),
          description: description.trim() || null,
        },
      }).unwrap();
      setCreateModalOpen(false);
      refetch();
    } catch (err: any) {
      setErrorMsg(err.data?.error || "Failed to create university");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;
    try {
      await updateCollege({
        baseUrl,
        id: editingCollege.id,
        body: {
          name: name.trim(),
          shortName: shortName.trim() || null,
          slug: slug.trim(),
          description: description.trim() || null,
        },
      }).unwrap();
      setEditingCollege(null);
      refetch();
    } catch (err: any) {
      setErrorMsg(err.data?.error || "Failed to update university");
    }
  };

  const handleDelete = async () => {
    if (!deletingCollege) return;
    try {
      await deleteCollege({ baseUrl, id: deletingCollege.id }).unwrap();
      setDeletingCollege(null);
      refetch();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              CAMPUS ECOSYSTEM & HIERARCHY
            </span>
            {activeSessionsCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {activeSessionsCount} LIVE ROADSHOWS
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Universities & Campuses Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1 max-w-2xl">
            Parent root entities of the Unisole ecosystem. Each university anchors its exclusive academic branches, roadshow pitch sessions, and student leads.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Campus</span>
          </Button>
        </div>
      </div>

      {/* ─── Executive Stats Overview Bar ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Partner Universities</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-zinc-100">
              {colleges.length}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">campuses</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Configured Branches</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {branches.length}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">departments</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Roadshows & Sessions</span>
            <Radio className="w-4 h-4 text-violet-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-violet-600 dark:text-violet-400">
              {sessions.length}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">events</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Captured Student Leads</span>
            <Users className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {totalLeadsCount}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">students</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-2 lg:col-span-1 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Enrolled Learners</span>
            <GraduationCap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {totalEnrolledLearners}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {totalLeadsCount > 0 ? `(${Math.round((totalEnrolledLearners / totalLeadsCount) * 100)}% conv)` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Search, Filters & Controls Bar ────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campus by name, short code, or slug..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Right: Status filter, Sorting, View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="leads">Sort: Most Leads</option>
              <option value="sessions">Sort: Most Sessions</option>
              <option value="branches">Sort: Most Branches</option>
              <option value="name">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Grid / Table Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Colleges List Content ────────────────────────────────────── */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center flex-col gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
          <span className="text-xs text-zinc-400 font-medium">Loading universities...</span>
        </div>
      ) : filteredColleges.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
          <GraduationCap className="w-10 h-10 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Universities Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {search ? `No campuses match "${search}". Try adjusting your filters.` : "Get started by onboarding your first partner university."}
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Onboard Campus
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredColleges.map((college: any) => {
            const report = collegeReportMap.get(college.id);
            const collegeBranches = branchesByCollege.get(college.id) || [];
            const collegeSessions = sessionsByCollege.get(college.id) || [];
            const leadsCount = report?.totalLeads || 0;
            const enrolledCount = report?.enrolledCount || 0;
            const hasLiveSession = collegeSessions.some((s) => s.status === "LIVE");

            return (
              <div
                key={college.id}
                onClick={() => navigate(`/colleges/${college.id}`)}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-pink-500/10 dark:from-indigo-950/50 dark:to-violet-950/50 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                        {(college.shortName || college.name).substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {college.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded">
                            /{college.slug}
                          </span>
                          {hasLiveSession && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              LIVE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleOpenEdit(college, e)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit University"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingCollege(college);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete University"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {college.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 mb-4 leading-relaxed">
                      {college.description}
                    </p>
                  )}
                </div>

                {/* Hierarchical Stats Pod */}
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Branches
                      </span>
                      <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {collegeBranches.length}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Roadshows
                      </span>
                      <span className="text-sm font-black font-mono text-violet-600 dark:text-violet-400 mt-0.5 block">
                        {collegeSessions.length}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Leads
                      </span>
                      <span className="text-sm font-black font-mono text-cyan-600 dark:text-cyan-400 mt-0.5 block">
                        {leadsCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                      {enrolledCount} enrolled learners
                    </span>

                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore Campus</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High Density Table View */
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">University & Campus</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3 text-center">Branches</th>
                  <th className="px-4 py-3 text-center">Roadshows</th>
                  <th className="px-4 py-3 text-center">Leads</th>
                  <th className="px-4 py-3 text-center">Enrolled</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredColleges.map((college: any) => {
                  const report = collegeReportMap.get(college.id);
                  const collegeBranches = branchesByCollege.get(college.id) || [];
                  const collegeSessions = sessionsByCollege.get(college.id) || [];
                  const leadsCount = report?.totalLeads || 0;
                  const enrolledCount = report?.enrolledCount || 0;
                  const hasLiveSession = collegeSessions.some((s) => s.status === "LIVE");

                  return (
                    <tr
                      key={college.id}
                      onClick={() => navigate(`/colleges/${college.id}`)}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                            {(college.shortName || college.name).substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                              {college.name}
                            </span>
                            {college.shortName && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {college.shortName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-500">
                        /{college.slug}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {collegeBranches.length}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                          {collegeSessions.length}
                        </span>
                        {hasLiveSession && (
                          <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {leadsCount}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {enrolledCount}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/colleges/${college.id}`)}
                            className="text-xs"
                          >
                            Workspace
                          </Button>
                          <button
                            onClick={(e) => handleOpenEdit(college, e)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ─── Modal: Create College ───────────────────────────────────── */}
      {createModalOpen && (
        <Modal
          title="Onboard New Partner Campus"
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                University / College Name *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug || slug === autoGenerateSlug(name)) {
                    setSlug(autoGenerateSlug(e.target.value));
                  }
                }}
                placeholder="e.g. Delhi Technological University"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Short Code / Acronym
                </label>
                <Input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase())}
                  placeholder="e.g. DTU"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  URL Slug *
                </label>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(autoGenerateSlug(e.target.value))}
                  placeholder="e.g. delhi-technological-university"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Campus Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of campus partnership, location, and key academic focus..."
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCreateModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? "Onboarding..." : "Create University"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Modal: Edit College ─────────────────────────────────────── */}
      {editingCollege && (
        <Modal
          title="Edit University Campus"
          isOpen={!!editingCollege}
          onClose={() => setEditingCollege(null)}
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                University / College Name *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Short Code / Acronym
                </label>
                <Input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  URL Slug *
                </label>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(autoGenerateSlug(e.target.value))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Campus Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setEditingCollege(null)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Modal: Delete College Warning ──────────────────────────── */}
      {deletingCollege && (
        <Modal
          title="Delete University Campus"
          isOpen={!!deletingCollege}
          onClose={() => setDeletingCollege(null)}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  Strict Hierarchy Cascade Warning
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                  Deleting <strong className="underline">{deletingCollege.name}</strong> will automatically cascade and permanently delete all of its nested <strong>Branches</strong>, <strong>Roadshow Sessions</strong>, and <strong>Captured Student Leads</strong>. This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Are you absolutely certain you wish to purge this campus and all its hierarchy from the platform?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeletingCollege(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
