import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetCollegeAnalyticsQuery,
  useUpdateCollegeMutation,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} from "../../store";
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Users,
  BookOpen,
  Trophy,
  Flame,
  Plus,
  Edit2,
  Play,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Percent,
  Award,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);

  const { data: analytics, isLoading, refetch } = useGetCollegeAnalyticsQuery(
    { baseUrl, id: id! },
    { skip: !id }
  );

  const [updateCollege, { isLoading: isUpdatingCollege }] = useUpdateCollegeMutation();
  const [createBranch, { isLoading: isCreatingBranch }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdatingBranch }] = useUpdateBranchMutation();

  const [activeTab, setActiveTab] = useState<"branches" | "sessions" | "leads" | "students">("branches");
  const [editingCollege, setEditingCollege] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);

  const [searchLeads, setSearchLeads] = useState("");
  const [searchStudents, setSearchStudents] = useState("");

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!analytics || !analytics.college) {
    return (
      <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
        <GraduationCap className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">University Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1 mb-4">The university or college you requested does not exist or has been removed.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate("/metadata")}>
          Back to Metadata & Colleges
        </Button>
      </div>
    );
  }

  const { college, stats, branchBreakdown = [], sessions = [], recentLeads = [], enrolledStudents = [] } = analytics;

  const filteredLeads = recentLeads.filter((l: any) => {
    const q = searchLeads.toLowerCase();
    return (
      (l.name || "").toLowerCase().includes(q) ||
      (l.phone || "").toLowerCase().includes(q) ||
      (l.branch || "").toLowerCase().includes(q)
    );
  });

  const filteredStudents = enrolledStudents.filter((s: any) => {
    const q = searchStudents.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.branch || "").toLowerCase().includes(q)
    );
  });

  const handleSaveCollege = async (formData: any) => {
    await updateCollege({ baseUrl, id: college.id, body: formData }).unwrap();
    setEditingCollege(false);
    refetch();
  };

  const handleSaveBranch = async (formData: any) => {
    if (editingBranch === "create") {
      await createBranch({
        baseUrl,
        body: { ...formData, collegeId: college.id },
      }).unwrap();
    } else {
      await updateBranch({
        baseUrl,
        id: editingBranch.id,
        body: formData,
      }).unwrap();
    }
    setEditingBranch(null);
    refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ─── 1. Header Banner & Quick Actions ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/metadata")}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 rounded-xl mt-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {college.shortName || college.slug?.toUpperCase() || "CAMPUS"}
              </span>
              <Badge variant={college.isActive ? "emerald" : "default"}>
                {college.isActive ? "Active University" : "Inactive Partner"}
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">ID: {college.id}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {college.name}
            </h1>
            {college.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {college.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/leads")}
            icon={TrendingUp}
            title="View All Campus Lead Diversification"
          >
            Leads Hub
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditingCollege(true)}
            icon={Edit2}
          >
            Edit Campus
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/presentations")}
            icon={Play}
          >
            Roadshows & Decks
          </Button>
        </div>
      </div>

      {/* ─── 2. Executive KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Decks Given */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Roadshows Given
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {stats.totalDecksGiven}
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5">Presentation sessions</span>
          </div>
        </div>

        {/* Total Captured Leads */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Campus Leads
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {stats.totalLeadsCaptured}
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5">Total attendees captured</span>
          </div>
        </div>

        {/* LMS Enrollments */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              LMS Enrollments
            </span>
            <div className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {stats.totalEnrollmentsCount}
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5">
              Across {stats.totalLearnersEnrolled} students
            </span>
          </div>
        </div>

        {/* Active Academic Branches */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Active Branches
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {stats.totalBranchesCount}
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5">Departments configured</span>
          </div>
        </div>

        {/* Quiz Avg Score */}
        <div className="col-span-2 lg:col-span-1 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Avg Roadshow Score
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {stats.averageQuizScore} <span className="text-sm font-normal text-zinc-400">pts</span>
            </span>
            <span className="block text-[10px] text-zinc-400 mt-0.5">
              Top: {stats.topScorer ? `${stats.topScorer.name} (${stats.topScorer.totalScore} pts)` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. Navigation Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("branches")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "branches"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Academic Branches & Participation ({branchBreakdown.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "sessions"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Roadshow Decks ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "leads"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Campus Attendees ({recentLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "students"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Enrolled LMS Learners ({enrolledStudents.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: ACADEMIC BRANCHES & PARTICIPATION BREAKDOWN ───────────── */}
      {activeTab === "branches" && (
        <div className="space-y-6 animate-fade-in">
          {/* Visual Percentage Distribution Header */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Branch-wise Roadshow Participation Share
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time breakdown of campus attendee share (%) across engineering & science departments.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setEditingBranch("create")}
                icon={Plus}
              >
                Add Branch to {college.shortName || "University"}
              </Button>
            </div>

            {/* Visual Progress Stacked Bar */}
            <div className="space-y-3 pt-2">
              <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                {branchBreakdown.map((b: any, idx: number) => {
                  const colors = [
                    "bg-indigo-500",
                    "bg-emerald-500",
                    "bg-amber-500",
                    "bg-rose-500",
                    "bg-violet-500",
                    "bg-cyan-500",
                    "bg-orange-500",
                    "bg-pink-500",
                    "bg-teal-500",
                    "bg-slate-400",
                  ];
                  const color = colors[idx % colors.length];
                  if (b.participationPercentage === 0) return null;
                  return (
                    <div
                      key={b.id}
                      style={{ width: `${b.participationPercentage}%` }}
                      className={`${color} h-full transition-all duration-500`}
                      title={`${b.name}: ${b.participationPercentage}% (${b.leadsCount} leads)`}
                    />
                  );
                })}
              </div>

              {/* Legend Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {branchBreakdown.map((b: any, idx: number) => {
                  const dotColors = [
                    "bg-indigo-500",
                    "bg-emerald-500",
                    "bg-amber-500",
                    "bg-rose-500",
                    "bg-violet-500",
                    "bg-cyan-500",
                    "bg-orange-500",
                    "bg-pink-500",
                    "bg-teal-500",
                    "bg-slate-400",
                  ];
                  return (
                    <div
                      key={b.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-[11px]"
                    >
                      <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {b.code || b.name}
                      </span>
                      <span className="font-mono text-zinc-400 font-bold">
                        {b.participationPercentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Branches Detailed Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Configured Academic Branches ({branchBreakdown.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-5">Department / Branch</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4 text-center">Participation %</th>
                    <th className="py-3 px-4 text-center">Captured Leads</th>
                    <th className="py-3 px-4 text-center">Enrolled Students</th>
                    <th className="py-3 px-4 text-center">Avg Quiz Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {branchBreakdown.map((b: any) => (
                    <tr
                      key={b.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-bold text-zinc-900 dark:text-zinc-100">
                        {b.name}
                        {b.description && (
                          <span className="block text-[11px] font-normal text-zinc-400 line-clamp-1 mt-0.5">
                            {b.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {b.code || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono font-black text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-[11px]">
                          {b.participationPercentage}%
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {b.leadsCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-zinc-600 dark:text-zinc-400">
                        {b.studentsCount || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {b.averageScore} pts
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={b.isActive ? "emerald" : "default"}>
                          {b.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {b.id !== "other" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBranch(b)}
                            icon={Edit2}
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: ROADSHOW SESSIONS DELIVERED ───────────────────────────── */}
      {activeTab === "sessions" && (
        <div className="space-y-4 animate-fade-in">
          {sessions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl">
              <Sparkles className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No Roadshows Conducted Yet</p>
              <p className="text-[11px] text-zinc-400 mt-1 mb-4">
                Launch a live presentation session linked to {college.name} to start collecting attendee analytics.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate("/presentations")} icon={Play}>
                Launch Presentation Session
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((sess: any) => (
                <div
                  key={sess.id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        {sess.sessionCode}
                      </span>
                      <Badge
                        variant={
                          sess.status === "LIVE"
                            ? "rose"
                            : sess.status === "ENDED"
                            ? "emerald"
                            : "default"
                        }
                      >
                        {sess.status}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      {sess.presentationTitle || "Campus Tech Pitch Deck"}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-1 font-mono">
                      <span>Attendees: <strong>{sess.activeAttendeesCount}</strong></span>
                      <span>•</span>
                      <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/presentations/analytics/${sess.id}`)}
                      icon={Users}
                    >
                      Lead Analytics
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/presentations/live/${sess.id}`)}
                      icon={Play}
                    >
                      Open Projector
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: CAPTURED ATTENDEES & LEADS ─────────────────────────────── */}
      {activeTab === "leads" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden animate-fade-in">
          <div className="p-4 sm:px-6 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Roadshow Attendees ({filteredLeads.length})
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads by name, phone, branch..."
                value={searchLeads}
                onChange={(e) => setSearchLeads(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-5">Rank</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">WhatsApp Phone</th>
                  <th className="py-3 px-4">Branch / Year</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-5 text-right">Joined Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-400 text-xs">
                      No attendee leads found for this college.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead: any, idx: number) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            idx === 0
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : idx === 1
                              ? "bg-slate-400/10 text-slate-400"
                              : idx === 2
                              ? "bg-amber-700/10 text-amber-700"
                              : "text-zinc-500"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {lead.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                        +91 {lead.phone}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-medium">
                        {lead.branch || "—"} {lead.yearOfStudy ? `(${lead.yearOfStudy})` : ""}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {lead.totalScore || 0} pts
                      </td>
                      <td className="py-3 px-5 text-right font-mono text-zinc-400 text-[11px]">
                        {lead.joinedAt ? new Date(lead.joinedAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: REGISTERED LMS LEARNERS & ENROLLMENTS ─────────────────── */}
      {activeTab === "students" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden animate-fade-in">
          <div className="p-4 sm:px-6 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Enrolled Learners ({filteredStudents.length})
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search registered learners..."
                value={searchStudents}
                onChange={(e) => setSearchStudents(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-4">WhatsApp Phone</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Enrolled Pathways</th>
                  <th className="py-3 px-5 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-400 text-xs">
                      No registered LMS learners found from this college yet.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st: any) => (
                    <tr
                      key={st.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-bold text-zinc-900 dark:text-zinc-100">
                        {st.name || "Learner"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                        +91 {st.phone}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 font-medium">
                        {st.branch || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {st.enrollments && st.enrollments.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {st.enrollments.map((enr: any) => (
                              <span
                                key={enr.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold border border-indigo-200/50 dark:border-indigo-800/50"
                              >
                                {enr.pathwayTitle || "Pathway"}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">No pathway active</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-zinc-400 text-[11px]">
                        {new Date(st.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODALS ───────────────────────────────────────────────────────── */}
      {/* College Edit Modal */}
      {editingCollege && (
        <CollegeModal
          college={college}
          isLoading={isUpdatingCollege}
          onClose={() => setEditingCollege(false)}
          onSave={handleSaveCollege}
        />
      )}

      {/* Branch Create/Edit Modal */}
      {editingBranch && (
        <BranchModal
          branch={editingBranch === "create" ? null : editingBranch}
          collegeName={college.name}
          isLoading={isCreatingBranch || isUpdatingBranch}
          onClose={() => setEditingBranch(null)}
          onSave={handleSaveBranch}
        />
      )}
    </div>
  );
}

// ─── Modal Subcomponents ───────────────────────────────────────────────────────
function CollegeModal({
  college,
  isLoading,
  onClose,
  onSave,
}: {
  college: any;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState(college?.name || "");
  const [slug, setSlug] = useState(college?.slug || "");
  const [shortName, setShortName] = useState(college?.shortName || "");
  const [description, setDescription] = useState(college?.description || "");
  const [isActive, setIsActive] = useState(college?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, slug, shortName, description, isActive });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Edit University / College
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="College / University Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Delhi Technological University"
          />
          <Input
            label="Short Name / Code"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="e.g. DTU"
          />
          <Input
            label="URL Slug *"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="e.g. dtu-delhi"
          />
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Campus details, location, notes..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded-md border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Active University Partner
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BranchModal({
  branch,
  collegeName,
  isLoading,
  onClose,
  onSave,
}: {
  branch: any;
  collegeName: string;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState(branch?.name || "");
  const [code, setCode] = useState(branch?.code || "");
  const [description, setDescription] = useState(branch?.description || "");
  const [isActive, setIsActive] = useState(branch?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, code, description, isActive });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {branch ? "Edit Academic Branch" : "Add Branch to College"}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configuring branch for <strong className="text-zinc-700 dark:text-zinc-300">{collegeName}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Branch / Department Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Computer Science & Engineering"
          />
          <Input
            label="Branch Code / Abbreviation"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. CSE"
          />
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Department notes or specializations..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded-md border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Active Branch in this Campus
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isLoading}>
              Save Branch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
