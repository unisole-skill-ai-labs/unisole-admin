import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetSessionAnalyticsQuery, useDeleteSessionMutation } from "../../store";
import {
  ArrowLeft,
  Users,
  Trophy,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Phone,
  Play,
  Flame,
  Clock,
  Download,
  Trash2,
  BarChart3,
  HelpCircle,
  Vote,
  Radio,
  Check,
  Building2,
  ExternalLink,
  MessageCircle,
  Share2,
  Zap,
  Sliders,
  Layers,
  Sparkles,
  Eye,
  X,
  Target,
  FileSpreadsheet,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";

export default function SessionAnalyticsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);

  const { data: analyticsRes, isLoading, isError, refetch } =
    useGetSessionAnalyticsQuery(
      { baseUrl, sessionId: sessionId! },
      { skip: !sessionId, pollingInterval: 10000 }
    );
  const [deleteSession, { isLoading: isDeletingSession }] = useDeleteSessionMutation();

  const [activeTab, setActiveTab] = useState<
    "overview" | "slides" | "instant_polls" | "leads" | "quizzes" | "surveys"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("ALL");
  const [selectedLeadForDrilldown, setSelectedLeadForDrilldown] = useState<any | null>(null);

  const analytics = analyticsRes?.data || null;
  const session = analytics?.session || null;
  const summary = analytics?.summary || null;
  const questions: any[] = analytics?.questions || [];
  const surveys: any[] = analytics?.surveys || [];
  const slides: any[] = analytics?.slides || [];
  const instantPolls: any[] = analytics?.instantPolls || [];
  const leads: any[] = analytics?.leads || [];

  // Format Duration in human-readable e.g. "45m 12s"
  const formattedDuration = useMemo(() => {
    if (!session?.durationSeconds && session?.durationSeconds !== 0) return "—";
    const totalSec = session.durationSeconds;
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }, [session?.durationSeconds]);

  // Extract all unique branches for filter dropdown
  const uniqueBranches = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.branch) set.add(l.branch);
    });
    return Array.from(set).sort();
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (lead.name || "").toLowerCase().includes(q) ||
        (lead.phone || "").toLowerCase().includes(q) ||
        (lead.email || "").toLowerCase().includes(q) ||
        (lead.branch || "").toLowerCase().includes(q);
      const matchesBranch =
        selectedBranchFilter === "ALL" || lead.branch === selectedBranchFilter;
      return matchesSearch && matchesBranch;
    });
  }, [leads, searchQuery, selectedBranchFilter]);

  // Export Comprehensive CSV Function
  const handleExportCSV = () => {
    if (!leads.length) return;
    const headers = [
      "Rank",
      "Full Name",
      "WhatsApp Phone",
      "Email",
      "Branch",
      "Year of Study",
      "Total Score",
      "Accuracy Rate (%)",
      "Quizzes Answered",
      "Correct Quizzes",
      "Total Interaction Responses",
      "Joined At",
    ];

    const rows = leads.map((l) => [
      l.rank,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${l.phone || ""}"`,
      `"${l.email || ""}"`,
      `"${(l.branch || "").replace(/"/g, '""')}"`,
      `"${(l.yearOfStudy || "").replace(/"/g, '""')}"`,
      l.totalScore || 0,
      `${l.accuracyRate || 0}%`,
      l.quizzesAnswered || 0,
      l.correctQuizzes || 0,
      l.responsesCount || 0,
      `"${l.joinedAt ? new Date(l.joinedAt).toLocaleString() : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Session_${session?.sessionCode || "Roadshow"}_Detailed_Analytics_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSession = async () => {
    const code = session?.sessionCode || sessionId;
    if (
      !window.confirm(
        `Are you sure you want to permanently DELETE Live Session #${code}?\n\n⚠️ Cascading Deletion Warning:\nThis will permanently remove:\n- The session record\n- All ${leads.length} student leads, quiz attempts, instant poll votes & survey responses\n\nThis cannot be undone. Proceed?`
      )
    ) {
      return;
    }

    try {
      await deleteSession({ baseUrl, id: sessionId! }).unwrap();
      navigate("/presentations");
    } catch (err: any) {
      alert("Failed to delete session: " + (err?.data?.error || err.message));
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-zinc-400">
        <div className="w-9 h-9 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
        <span className="text-xs font-semibold">Generating Presentation Analytics...</span>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 max-w-lg mx-auto mt-8">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Failed to Load Session Analytics
        </h3>
        <p className="text-xs text-zinc-500">
          The requested presentation session could not be found or has not been initialized.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate("/presentations")}>
          Return to Presentations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* ─── 1. Top Navigation & Session Header ───────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/presentations")}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2.5 rounded-2xl shrink-0"
            title="Back to Presentations"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300">
                {session?.sessionCode}
              </span>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{session?.collegeName || "Campus Roadshow"}</span>
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  session?.status === "LIVE"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 animate-pulse"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {session?.status === "LIVE" ? "● Active Stage" : "Finished Show"}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 truncate">
              {session?.presentationTitle || "Presentation Analytics Report"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={Download}
            disabled={!leads.length}
            className="flex items-center gap-1.5 font-bold shadow-xs text-xs"
          >
            Export CSV ({leads.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSession}
            icon={Trash2}
            disabled={isDeletingSession}
            className="flex items-center gap-1.5 font-bold shadow-xs text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 cursor-pointer"
            title="Delete Session (Cascading)"
          >
            {isDeletingSession ? "Deleting..." : "Delete Session"}
          </Button>

          {session?.status === "LIVE" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/presentations/live/${sessionId}`)}
              icon={Play}
              className="flex items-center gap-1.5 font-bold shadow-md shadow-indigo-500/20 text-xs"
            >
              Resume Stage
            </Button>
          )}
        </div>
      </div>

      {/* ─── 2. Key Metrics & Duration KPI Cards ─────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Attendees */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Attendees</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {summary?.totalAttendees || 0}
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            {summary?.activeParticipants || 0} students actively voted ({summary?.participationRate || 0}%)
          </p>
        </div>

        {/* Session Run Duration */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Session Duration</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {formattedDuration}
          </div>
          <p className="text-[11px] text-zinc-500 font-medium truncate">
            {session?.startedAt ? new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
            {session?.endedAt ? ` to ${new Date(session.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : " (Ongoing)"}
          </p>
        </div>

        {/* Speed Quiz Accuracy */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Quiz Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {questions.length > 0
              ? `${Math.round(
                  questions.reduce((acc, q) => acc + (q.accuracyRate || 0), 0) /
                    questions.length
                )}%`
              : "N/A"}
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            Across {questions.length} speed quizzes • {instantPolls.length} instant polls
          </p>
        </div>

        {/* Highest & Average Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Top Score</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {summary?.highestScore || 0}{" "}
            <span className="text-xs font-semibold text-zinc-400">pts</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            Room Avg: {summary?.averageScore || 0} pts
          </p>
        </div>
      </div>

      {/* ─── 3. Analytics Navigation Tab Switcher ─────────────────────── */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Executive Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("slides")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "slides"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Slide-by-Slide Analytics ({slides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("instant_polls")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "instant_polls"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Instant Yes/No Polls ({instantPolls.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "leads"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Joined Students ({leads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quizzes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "quizzes"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Speed Quiz Questions ({questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("surveys")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "surveys"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Surveys & Polls ({surveys.length})</span>
        </button>
      </div>

      {/* ─── 4. TAB 1: EXECUTIVE OVERVIEW ─────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
          {/* Branch Distribution Breakdown (Cols 1-7) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>Audience Branch Distribution</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Breakdown of student engineering and academic disciplines in this session.
              </p>
            </div>

            {Object.keys(summary?.branchDistribution || {}).length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No branch data captured for this session.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(summary?.branchDistribution || {}).map(
                  ([branch, count]: [string, any]) => {
                    const pct = summary.totalAttendees > 0 ? Math.round((count / summary.totalAttendees) * 100) : 0;
                    return (
                      <div key={branch} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{branch}</span>
                          <span className="font-mono text-zinc-500 font-bold">
                            {count} students ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {/* Year of Study Distribution */}
            {Object.keys(summary?.yearDistribution || {}).length > 0 && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Year of Study Breakdown
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(summary?.yearDistribution || {}).map(([yr, cnt]: [string, any]) => (
                    <span
                      key={yr}
                      className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      {yr}: <strong className="text-indigo-600 dark:text-indigo-400">{cnt}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-500 flex items-center justify-between">
              <span>Total Checked-in Disciplines:</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">
                {Object.keys(summary?.branchDistribution || {}).length} Departments
              </span>
            </div>
          </div>

          {/* Top Scorer Leaderboard Podium (Cols 8-12) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Session Leaderboard Podium</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Top performing candidates ranked by speed quiz points.
              </p>
            </div>

            {leads.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No quiz responses recorded.
              </div>
            ) : (
              <div className="space-y-2.5">
                {leads.slice(0, 5).map((lead, idx) => (
                  <div
                    key={lead.id || idx}
                    onClick={() => setSelectedLeadForDrilldown(lead)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer hover:border-indigo-500/50 ${
                      idx === 0
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200/80 dark:border-zinc-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          idx === 0
                            ? "bg-amber-500 text-black font-black"
                            : idx === 1
                            ? "bg-slate-300 text-slate-900 font-bold"
                            : idx === 2
                            ? "bg-amber-700 text-white font-bold"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold"
                        }`}
                      >
                        #{idx + 1}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {lead.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {lead.branch || "Student"} • Accuracy: {lead.accuracyRate || 0}%
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400 block">
                        {lead.totalScore} pts
                      </span>
                      <span className="text-[9px] text-zinc-400 font-medium">
                        {lead.responsesCount} answers
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("leads")}
              className="w-full text-xs font-bold"
            >
              View Full Student Roster ({leads.length})
            </Button>
          </div>
        </div>
      )}

      {/* ─── 5. TAB 2: SLIDE-BY-SLIDE INTERACTION & CLICK ANALYTICS ──── */}
      {activeTab === "slides" && (
        <div className="space-y-4 animate-fade-in">
          {slides.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
              <Layers className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                No Slides in Presentation
              </h3>
            </div>
          ) : (
            slides.map((s, idx) => {
              const hasQuiz = Boolean(s.quiz);
              const hasSurvey = Boolean(s.survey);

              return (
                <div
                  key={s.slideId || idx}
                  className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4"
                >
                  {/* Slide Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs shrink-0">
                        Slide {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {s.type}
                          </span>
                          {s.isInteractive && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Interactive
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                          {s.title}
                        </h3>
                        {s.subtitle && (
                          <p className="text-xs text-zinc-500 mt-0.5">{s.subtitle}</p>
                        )}
                      </div>
                    </div>

                    {hasQuiz && (
                      <div className="flex items-center gap-4 shrink-0 bg-zinc-50 dark:bg-zinc-950/60 p-2.5 px-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                            Accuracy
                          </span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {s.quiz.accuracyRate}%
                          </span>
                        </div>
                        <div className="text-right border-l border-zinc-200 dark:border-zinc-800 pl-3">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                            Submissions
                          </span>
                          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                            {s.quiz.totalSubmissions}
                          </span>
                        </div>
                        <div className="text-right border-l border-zinc-200 dark:border-zinc-800 pl-3">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                            Avg Speed
                          </span>
                          <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                            {s.quiz.averageTimeMs > 0
                              ? `${(s.quiz.averageTimeMs / 1000).toFixed(1)}s`
                              : "—"}
                          </span>
                        </div>
                      </div>
                    )}

                    {hasSurvey && (
                      <div className="text-right shrink-0 bg-purple-50 dark:bg-purple-950/40 p-2.5 px-4 rounded-2xl border border-purple-200 dark:border-purple-800/60">
                        <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block">
                          Total Responses
                        </span>
                        <span className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono">
                          {s.survey.totalVotes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* If Quiz: Show Options & Voters */}
                  {hasQuiz && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Quiz Options Breakdown & Student Clicks:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {s.quiz.options.map((opt: any, optIdx: number) => {
                          const letters = ["A", "B", "C", "D", "E", "F"];
                          return (
                            <div
                              key={optIdx}
                              className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                                opt.isCorrect
                                  ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/50"
                                  : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200/80 dark:border-zinc-800/80"
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                      opt.isCorrect
                                        ? "bg-emerald-500 text-white"
                                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                    }`}
                                  >
                                    {letters[optIdx] || optIdx + 1}
                                  </span>
                                  <span
                                    className={`font-bold truncate ${
                                      opt.isCorrect
                                        ? "text-emerald-800 dark:text-emerald-300"
                                        : "text-zinc-800 dark:text-zinc-200"
                                    }`}
                                  >
                                    {opt.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {opt.isCorrect && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                      Correct
                                    </span>
                                  )}
                                  <span className="font-mono font-bold text-xs text-zinc-600 dark:text-zinc-400">
                                    {opt.votes} ({opt.percentage}%)
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    opt.isCorrect
                                      ? "bg-emerald-500"
                                      : "bg-zinc-400 dark:bg-zinc-600"
                                  }`}
                                  style={{ width: `${opt.percentage}%` }}
                                />
                              </div>

                              {opt.voters && opt.voters.length > 0 && (
                                <div className="pt-1 flex flex-wrap gap-1">
                                  {opt.voters.slice(0, 8).map((v: any, vIdx: number) => (
                                    <span
                                      key={vIdx}
                                      className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-300 font-medium"
                                      title={v.phone}
                                    >
                                      {v.name}
                                    </span>
                                  ))}
                                  {opt.voters.length > 8 && (
                                    <span className="text-[10px] text-zinc-400 font-bold self-center">
                                      +{opt.voters.length - 8} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* If Survey / Poll */}
                  {hasSurvey && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Survey Options & Choices:
                      </h4>
                      <div className="space-y-2">
                        {s.survey.options.map((opt: any, optIdx: number) => (
                          <div
                            key={optIdx}
                            className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                {opt.label}
                              </span>
                              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                                {opt.votes} votes ({opt.percentage}%)
                              </span>
                            </div>

                            <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
                                style={{ width: `${opt.percentage}%` }}
                              />
                            </div>

                            {opt.voters && opt.voters.length > 0 && (
                              <div className="pt-1 flex flex-wrap gap-1">
                                {opt.voters.slice(0, 8).map((v: any, vIdx: number) => (
                                  <span
                                    key={vIdx}
                                    className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-300 font-medium"
                                  >
                                    {v.name}
                                  </span>
                                ))}
                                {opt.voters.length > 8 && (
                                  <span className="text-[10px] text-zinc-400 font-bold self-center">
                                    +{opt.voters.length - 8} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!hasQuiz && !hasSurvey && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
                      <span>Presentation Content Slide</span>
                      <span className="text-zinc-500 font-mono">Viewed by {leads.length} attendees</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── 6. TAB 3: INSTANT YES/NO PULSE POLLS ─────────────────────── */}
      {activeTab === "instant_polls" && (
        <div className="space-y-4 animate-fade-in">
          {instantPolls.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
              <Zap className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                No Instant Yes/No Polls Triggered
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Instant 20-second Yes/No pulse polls launched by the presenter during presentation will be archived here.
              </p>
            </div>
          ) : (
            instantPolls.map((poll, idx) => (
              <div
                key={poll.pollId || idx}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Instant Pulse Check #{idx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                        {poll.question || "YES or NO?"}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right shrink-0 bg-zinc-50 dark:bg-zinc-950/60 p-2.5 px-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Total Responses
                    </span>
                    <span className="text-xl font-black text-amber-500 font-mono">
                      {poll.totalVotes}
                    </span>
                  </div>
                </div>

                {/* Real-time YES vs NO split bars */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* YES Count Box */}
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>👍 YES</span>
                        </span>
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                          {poll.yesVotes}{" "}
                          <span className="text-xs font-normal">({poll.yesPercentage}%)</span>
                        </span>
                      </div>
                      {poll.yesVoters && poll.yesVoters.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {poll.yesVoters.slice(0, 10).map((v: any, vIdx: number) => (
                            <span
                              key={vIdx}
                              className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold"
                            >
                              {v.name}
                            </span>
                          ))}
                          {poll.yesVoters.length > 10 && (
                            <span className="text-[10px] text-emerald-500 font-bold self-center">
                              +{poll.yesVoters.length - 10} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* NO Count Box */}
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>👎 NO</span>
                        </span>
                        <span className="text-xl font-black text-rose-700 dark:text-rose-300 font-mono">
                          {poll.noVotes}{" "}
                          <span className="text-xs font-normal">({poll.noPercentage}%)</span>
                        </span>
                      </div>
                      {poll.noVoters && poll.noVoters.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {poll.noVoters.slice(0, 10).map((v: any, vIdx: number) => (
                            <span
                              key={vIdx}
                              className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-rose-500/20 text-[10px] text-rose-700 dark:text-rose-300 font-semibold"
                            >
                              {v.name}
                            </span>
                          ))}
                          {poll.noVoters.length > 10 && (
                            <span className="text-[10px] text-rose-500 font-bold self-center">
                              +{poll.noVoters.length - 10} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Split Bar */}
                  <div className="h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
                    <div
                      className="bg-emerald-500 transition-all duration-300"
                      style={{ width: `${poll.yesPercentage}%` }}
                    />
                    <div
                      className="bg-rose-500 transition-all duration-300"
                      style={{ width: `${poll.noPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── 7. TAB 4: JOINED STUDENTS (LEADS ROSTER & DRILLDOWN) ─────── */}
      {activeTab === "leads" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs p-6 space-y-5 animate-fade-in">
          {/* Table Header & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:max-w-xl">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students by name, phone, branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
                />
              </div>

              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              >
                <option value="ALL">All Branches ({uniqueBranches.length})</option>
                {uniqueBranches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold text-zinc-500 self-end sm:self-auto">
              Showing {filteredLeads.length} of {leads.length} Students
            </span>
          </div>

          {/* Leads Data Table */}
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
              <p>No candidates match your current search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">WhatsApp / Phone</th>
                    <th className="py-3 px-3">Branch & Year</th>
                    <th className="py-3 px-3 text-right">Points</th>
                    <th className="py-3 px-3 text-right">Accuracy</th>
                    <th className="py-3 px-3 text-right">Responses</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                  {filteredLeads.map((lead, idx) => {
                    const waClean = (lead.phone || "").replace(/\D/g, "");
                    const waUrl = waClean
                      ? `https://wa.me/${waClean.length === 10 ? `91${waClean}` : waClean}`
                      : null;

                    return (
                      <tr
                        key={lead.id || idx}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-3 font-mono font-bold text-zinc-500">
                          #{lead.rank || idx + 1}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                          {lead.name}
                        </td>
                        <td className="py-3.5 px-3">
                          {waUrl ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-semibold"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{lead.phone}</span>
                            </a>
                          ) : (
                            <span className="font-mono text-zinc-400">{lead.phone || "—"}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-300">
                          <span className="font-semibold">{lead.branch || "General"}</span>
                          {lead.yearOfStudy && (
                            <span className="text-zinc-400 ml-1 text-[11px]">({lead.yearOfStudy})</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {lead.totalScore} pts
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {lead.accuracyRate || 0}%
                        </td>
                        <td className="py-3.5 px-3 text-right text-zinc-500 font-mono">
                          {lead.responsesCount}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLeadForDrilldown(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-all cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Drilldown</span>
                          </button>
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

      {/* ─── 8. TAB 5: SPEED QUIZ QUESTIONS BREAKDOWN ────────────────── */}
      {activeTab === "quizzes" && (
        <div className="space-y-4 animate-fade-in">
          {questions.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
              <HelpCircle className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                No Speed Quiz Questions Run
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Interactive speed quiz questions will record individual option distributions and accuracy rates here.
              </p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.slideId || idx}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4"
              >
                {/* Question Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                        Quiz Question #{idx + 1}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Slide {q.slideIndex + 1}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                      {q.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Accuracy Rate
                      </span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {q.accuracyRate}%
                      </span>
                    </div>
                    <div className="text-right border-l border-zinc-200 dark:border-zinc-800 pl-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Submissions
                      </span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {q.totalSubmissions}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Option Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt: any, optIdx: number) => {
                    const letters = ["A", "B", "C", "D", "E", "F"];
                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                          opt.isCorrect
                            ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/50"
                            : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200/80 dark:border-zinc-800/80"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                opt.isCorrect
                                  ? "bg-emerald-500 text-white"
                                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              {letters[optIdx] || optIdx + 1}
                            </span>
                            <span
                              className={`font-bold truncate ${
                                opt.isCorrect
                                  ? "text-emerald-800 dark:text-emerald-300"
                                  : "text-zinc-800 dark:text-zinc-200"
                              }`}
                            >
                              {opt.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {opt.isCorrect && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                Correct
                              </span>
                            )}
                            <span className="font-mono font-bold text-xs text-zinc-600 dark:text-zinc-400">
                              {opt.votes} ({opt.percentage}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              opt.isCorrect
                                ? "bg-emerald-500"
                                : "bg-zinc-400 dark:bg-zinc-600"
                            }`}
                            style={{ width: `${opt.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── 9. TAB 6: SURVEYS & LIVE POLLS BREAKDOWN ─────────────────── */}
      {activeTab === "surveys" && (
        <div className="space-y-4 animate-fade-in">
          {surveys.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
              <Vote className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                No Survey or Poll Responses
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Audience survey and poll votes will appear here with option percentages and branch breakdowns.
              </p>
            </div>
          ) : (
            surveys.map((s, idx) => (
              <div
                key={s.slideId || idx}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold">
                      Poll #{idx + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                      {s.title}
                    </h3>
                    {s.subtitle && (
                      <p className="text-xs text-zinc-500 mt-0.5">{s.subtitle}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Total Votes
                    </span>
                    <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
                      {s.totalVotes}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {s.options.map((opt: any, optIdx: number) => (
                    <div
                      key={optIdx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {opt.label}
                        </span>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                          {opt.votes} votes ({opt.percentage}%)
                        </span>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>

                      {/* Branch Breakdown Tags if available */}
                      {Object.keys(opt.branchBreakdown || {}).length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-zinc-400 font-medium">
                            Branch Votes:
                          </span>
                          {Object.entries(opt.branchBreakdown).map(([b, cnt]: [string, any]) => (
                            <span
                              key={b}
                              className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-300"
                            >
                              {b}: {cnt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── 10. STUDENT INDIVIDUAL DRILLDOWN MODAL / DRAWER ─────────── */}
      {selectedLeadForDrilldown && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedLeadForDrilldown(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl text-zinc-900 dark:text-zinc-100 space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Student Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-base shadow-lg shadow-indigo-600/30">
                  #{selectedLeadForDrilldown.rank}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
                    {selectedLeadForDrilldown.name}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {selectedLeadForDrilldown.branch} • {selectedLeadForDrilldown.yearOfStudy}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLeadForDrilldown(null)}
                className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Score</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedLeadForDrilldown.totalScore} pts
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Accuracy</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedLeadForDrilldown.accuracyRate || 0}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Responses</span>
                <span className="text-lg font-black text-zinc-700 dark:text-zinc-300 font-mono">
                  {selectedLeadForDrilldown.responsesCount}
                </span>
              </div>
            </div>

            {/* WhatsApp Connect Button */}
            {selectedLeadForDrilldown.phone && (
              <a
                href={`https://wa.me/${selectedLeadForDrilldown.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Message Student on WhatsApp ({selectedLeadForDrilldown.phone})</span>
              </a>
            )}

            {/* Full Answer Sheet Breakdown */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Detailed Interaction Log & Answer Sheet:
              </h4>

              {Object.keys(selectedLeadForDrilldown.responses || {}).length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400">
                  No interaction submissions recorded for this student.
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(selectedLeadForDrilldown.responses || {}).map(
                    ([key, resp]: [string, any], rIdx: number) => {
                      const isInstantPoll = resp.type === "INSTANT_POLL" || key.startsWith("poll_");
                      const isCorrect = resp.isCorrect;

                      return (
                        <div
                          key={rIdx}
                          className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase">
                                {isInstantPoll ? "Instant Poll" : "Quiz / Survey"}
                              </span>
                            </div>
                            <h5 className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                              {resp.question || key}
                            </h5>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              Chosen:{" "}
                              <strong className="text-zinc-800 dark:text-zinc-200">
                                {resp.choice || (resp.optionIndex !== undefined ? `Option ${resp.optionIndex + 1}` : "—")}
                              </strong>
                              {resp.responseTimeMs && (
                                <span className="ml-2 font-mono text-[10px] text-zinc-400">
                                  ({(resp.responseTimeMs / 1000).toFixed(1)}s)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {isInstantPoll ? (
                              <span
                                className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                                  resp.choice === "YES" || resp.optionIndex === 0
                                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {resp.choice === "YES" || resp.optionIndex === 0 ? "YES 👍" : "NO 👎"}
                              </span>
                            ) : resp.isCorrect !== undefined ? (
                              <span
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                                  isCorrect
                                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {isCorrect ? "✓ Correct (+pts)" : "✗ Incorrect"}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                Voted
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
