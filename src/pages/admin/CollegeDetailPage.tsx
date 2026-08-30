import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetCollegeAnalyticsQuery,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useCreatePresentationMutation,
  useDeletePresentationMutation,
  useLaunchSessionMutation,
  useUpdateSessionStatusMutation,
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
  Trash2,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
  Download,
  Phone,
  BarChart3,
  Building2,
  Radio,
  FileText,
  Settings,
  Clock,
  ArrowUpRight,
  Pause,
  StopCircle,
  BarChart2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
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
  const [deleteCollege, { isLoading: isDeletingCollege }] = useDeleteCollegeMutation();
  const [createBranch, { isLoading: isCreatingBranch }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdatingBranch }] = useUpdateBranchMutation();
  const [deleteBranch, { isLoading: isDeletingBranch }] = useDeleteBranchMutation();
  const [createPresentation, { isLoading: isCreatingDeck }] = useCreatePresentationMutation();
  const [deletePresentation, { isLoading: isDeletingDeck }] = useDeletePresentationMutation();
  const [launchSession, { isLoading: isLaunchingSession }] = useLaunchSessionMutation();
  const [updateSessionStatus, { isLoading: isUpdatingSessionStatus }] = useUpdateSessionStatusMutation();

  const [activeTab, setActiveTab] = useState<
    "presentations" | "sessions" | "branches" | "leads" | "students" | "analytics" | "settings"
  >("presentations");

  // Modals state
  const [editingCollege, setEditingCollege] = useState(false);
  const [deletingCollege, setDeletingCollege] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [deletingBranch, setDeletingBranch] = useState<any>(null);
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [deletingDeck, setDeletingDeck] = useState<any>(null);
  const [launchingSessionForDeck, setLaunchingSessionForDeck] = useState<any>(null);

  // Deck creation inputs
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDesc, setNewDeckDesc] = useState("");

  // Launch session state
  const [customSessionCode, setCustomSessionCode] = useState("");
  const [launchedData, setLaunchedData] = useState<{
    session: any;
    qrCodeDataUrl: string;
    joinUrl: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Search & filter states
  const [searchLeads, setSearchLeads] = useState("");
  const [leadBranchFilter, setLeadBranchFilter] = useState("ALL");
  const [searchStudents, setSearchStudents] = useState("");
  const [searchDecks, setSearchDecks] = useState("");

  // Toast / inline confirmation message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center flex-col gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
        <span className="text-xs text-zinc-400 font-medium">Loading University Campus Hub...</span>
      </div>
    );
  }

  if (!analytics || !analytics.college) {
    return (
      <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
        <GraduationCap className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">University Not Found</h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          The university or college you requested does not exist or has been removed.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate("/colleges")}>
          Back to University Directory
        </Button>
      </div>
    );
  }

  const {
    college,
    stats = {},
    branchBreakdown = [],
    presentations = [],
    sessions = [],
    recentLeads = [],
    enrolledStudents = [],
  } = analytics;

  const liveSessions = sessions.filter((s: any) => s.status === "LIVE");
  const hasLiveSession = liveSessions.length > 0;

  const filteredDecks = presentations.filter((d: any) =>
    (d.title || "").toLowerCase().includes(searchDecks.toLowerCase())
  );

  const filteredLeads = recentLeads.filter((l: any) => {
    const q = searchLeads.toLowerCase();
    const matchesSearch =
      (l.name || "").toLowerCase().includes(q) ||
      (l.phone || "").toLowerCase().includes(q) ||
      (l.branch || "").toLowerCase().includes(q);
    const matchesBranch =
      leadBranchFilter === "ALL" || (l.branch || "").toLowerCase().includes(leadBranchFilter.toLowerCase());
    return matchesSearch && matchesBranch;
  });

  const filteredStudents = enrolledStudents.filter((s: any) => {
    const q = searchStudents.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.branch || "").toLowerCase().includes(q)
    );
  });

  // Handlers
  const handleSaveCollege = async (formData: any) => {
    try {
      await updateCollege({ baseUrl, id: college.id, body: formData }).unwrap();
      setEditingCollege(false);
      showToast("University details updated successfully.");
      refetch();
    } catch (err: any) {
      alert("Failed to update university: " + (err?.data?.message || err.message));
    }
  };

  const handleDeleteCollege = async () => {
    try {
      await deleteCollege({ baseUrl, id: college.id }).unwrap();
      navigate("/colleges");
    } catch (err: any) {
      alert("Failed to delete university: " + (err?.data?.message || err.message));
    }
  };

  const handleSaveBranch = async (formData: any) => {
    try {
      if (editingBranch === "create") {
        await createBranch({
          baseUrl,
          body: { ...formData, collegeId: college.id },
        }).unwrap();
        showToast("Academic branch added.");
      } else {
        await updateBranch({
          baseUrl,
          id: editingBranch.id,
          body: { ...formData, collegeId: college.id },
        }).unwrap();
        showToast("Academic branch updated.");
      }
      setEditingBranch(null);
      refetch();
    } catch (err: any) {
      alert("Failed to save branch: " + (err?.data?.message || err.message));
    }
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranch) return;
    try {
      await deleteBranch({ baseUrl, id: deletingBranch.id }).unwrap();
      setDeletingBranch(null);
      showToast("Academic branch removed.");
      refetch();
    } catch (err: any) {
      alert("Failed to delete branch: " + (err?.data?.message || err.message));
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;
    try {
      const res: any = await createPresentation({
        baseUrl,
        body: {
          title: newDeckTitle.trim(),
          description: newDeckDesc.trim() || undefined,
          collegeId: college.id,
        },
      }).unwrap();
      setCreatingDeck(false);
      setNewDeckTitle("");
      setNewDeckDesc("");
      refetch();
      if (res?.data?.id) {
        navigate(`/presentations/builder/${res.data.id}`);
      }
    } catch (err: any) {
      alert("Failed to create pitch deck: " + (err?.data?.message || err.message));
    }
  };

  const handleDeleteDeck = async () => {
    if (!deletingDeck) return;
    try {
      await deletePresentation({ baseUrl, id: deletingDeck.id }).unwrap();
      setDeletingDeck(null);
      showToast("Presentation deck deleted.");
      refetch();
    } catch (err: any) {
      alert("Failed to delete pitch deck: " + (err?.data?.message || err.message));
    }
  };

  const handleLaunchSession = async (deck: any) => {
    try {
      const res: any = await launchSession({
        baseUrl,
        presentationId: deck.id,
        body: {
          collegeId: college.id,
          customCode: customSessionCode.trim() || undefined,
        },
      }).unwrap();
      setLaunchedData(res?.data || null);
      setCustomSessionCode("");
      refetch();
    } catch (err: any) {
      alert("Failed to launch session: " + (err?.data?.message || err.message));
    }
  };

  const handleToggleSessionStatus = async (sessionId: string, newStatus: "LIVE" | "PAUSED" | "ENDED") => {
    try {
      await updateSessionStatus({
        baseUrl,
        id: sessionId,
        body: { status: newStatus },
      }).unwrap();
      showToast(`Session marked as ${newStatus}.`);
      refetch();
    } catch (err: any) {
      alert("Failed to update session status: " + (err?.data?.message || err.message));
    }
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCSV = () => {
    if (recentLeads.length === 0) {
      alert("No student leads captured for this campus yet.");
      return;
    }

    const headers = [
      "Student Name",
      "WhatsApp Phone",
      "University / College",
      "Academic Branch",
      "Year of Study",
      "Quiz / Total Score",
      "Joined Date & Time",
      "Session Code",
    ];

    const csvRows = [
      headers.join(","),
      ...recentLeads.map((l: any) =>
        [
          `"${(l.name || "").replace(/"/g, '""')}"`,
          `"${(l.phone || "").replace(/"/g, '""')}"`,
          `"${(college.name || "").replace(/"/g, '""')}"`,
          `"${(l.branch || "Unspecified").replace(/"/g, '""')}"`,
          `"${(l.yearOfStudy || "—").replace(/"/g, '""')}"`,
          l.totalScore || 0,
          `"${l.joinedAt ? new Date(l.joinedAt).toLocaleString() : ""}"`,
          `"${l.sessionId || "—"}"`,
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `unisole_leads_${college.slug || college.id}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold shadow-2xl flex items-center gap-2 border border-zinc-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. Header Banner & Quick Actions ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/colleges")}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2.5 rounded-2xl mt-1 border border-zinc-200/80 dark:border-zinc-800"
            title="Back to Universities"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-black px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {college.shortName || college.slug?.toUpperCase() || "CAMPUS"}
              </span>
              <Badge variant={college.isActive ? "emerald" : "default"}>
                {college.isActive ? "Active University Partner" : "Inactive"}
              </Badge>
              {hasLiveSession && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {liveSessions.length} LIVE ROADSHOW ACTIVE
                </span>
              )}
              <span className="text-xs text-zinc-400 font-mono">ID: {college.id}</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {college.name}
            </h1>
            {college.description && (
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {college.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (presentations.length > 0) {
                setLaunchingSessionForDeck(presentations[0]);
              } else {
                setCreatingDeck(true);
              }
            }}
            icon={Play}
            className="font-bold shadow-md shadow-indigo-500/10"
          >
            Launch Roadshow
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCreatingDeck(true)}
            icon={Sparkles}
          >
            New Pitch Deck
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditingBranch("create")}
            icon={Plus}
          >
            Add Branch
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            icon={Download}
            title="Export Leads CSV"
          >
            Export Leads
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingCollege(true)}
            icon={Edit2}
            className="p-2.5 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-2xl"
            title="Edit University"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingCollege(true)}
            icon={Trash2}
            className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl"
            title="Delete University"
          />
        </div>
      </div>

      {/* ─── 2. Executive KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Pitch Decks
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {presentations.length}
            </span>
            <span className="text-[10px] text-zinc-400">decks</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Roadshows Hosted
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {sessions.length}
            </span>
            <span className="text-[10px] text-zinc-400">sessions</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Captured Leads
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
              {stats.totalLeadsCaptured || recentLeads.length}
            </span>
            <span className="text-[10px] text-zinc-400">students</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Enrolled Learners
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-violet-600 dark:text-violet-400">
              {stats.totalLearnersEnrolled || enrolledStudents.length}
            </span>
            <span className="text-[10px] text-zinc-400">users</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Avg Quiz Points
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-500">
              {stats.averageQuizScore || 0}
            </span>
            <span className="text-[10px] text-zinc-400">pts</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Active Branches
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
              {branchBreakdown.length}
            </span>
            <span className="text-[10px] text-zinc-400">dept</span>
          </div>
        </div>
      </div>

      {/* ─── 3. Modular Tab Navigation ────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("presentations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "presentations"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Pitch Decks ({presentations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "sessions"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-500" />
          <span>Roadshows ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("branches")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "branches"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Academic Branches ({branchBreakdown.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "leads"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Users className="w-4 h-4 text-cyan-500" />
          <span>Campus Leads ({recentLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "students"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-violet-500" />
          <span>Enrolled Learners ({enrolledStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "analytics"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <span>Branch Diversification</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "settings"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Settings className="w-4 h-4 text-zinc-500" />
          <span>University Details & Settings</span>
        </button>
      </div>

      {/* ─── TAB 1: PRESENTATIONS & PITCH DECKS ────────────────────────────── */}
      {activeTab === "presentations" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search presentation decks..."
                value={searchDecks}
                onChange={(e) => setSearchDecks(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreatingDeck(true)}
              icon={Plus}
              className="font-bold shrink-0"
            >
              Create Presentation Deck
            </Button>
          </div>

          {filteredDecks.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
              <Sparkles className="w-10 h-10 mx-auto text-amber-400" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                No presentation decks created yet for {college.name}
              </p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Create a presentation deck specifically for this campus to host animated roadshow sessions and interactive live quizzes.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreatingDeck(true)}
                icon={Plus}
              >
                Create Deck for {college.shortName || "this College"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDecks.map((deck: any) => {
                const slides = Array.isArray(deck.slides) ? deck.slides : [];
                return (
                  <div
                    key={deck.id}
                    className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {college.shortName || "CAMPUS"}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mt-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {deck.title}
                          </h4>
                        </div>
                        <Badge variant="emerald">{slides.length} Slides</Badge>
                      </div>

                      {deck.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {deck.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1 font-mono">
                        <span>Theme: {deck.theme || "dark"}</span>
                        <span>•</span>
                        <span>
                          {deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={() => {
                          setLaunchingSessionForDeck(deck);
                          handleLaunchSession(deck);
                        }}
                        className="text-xs font-bold flex-1"
                      >
                        Launch
                      </Button>

                      <Link to={`/presentations/builder/${deck.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Edit2}
                          className="text-xs font-bold"
                        >
                          Edit Slides
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingDeck(deck)}
                        icon={Trash2}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Deck"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: ROADSHOW SESSIONS ─────────────────────────────────────── */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Auditorium Roadshow Sessions
              </h3>
              <p className="text-[11px] text-zinc-400">
                Active projector stages and past roadshows conducted at {college.name}.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (presentations.length > 0) {
                  setLaunchingSessionForDeck(presentations[0]);
                } else {
                  setCreatingDeck(true);
                }
              }}
              icon={Play}
              className="font-bold"
            >
              Start New Live Session
            </Button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
              <Radio className="w-10 h-10 mx-auto text-zinc-400" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                No roadshow sessions hosted yet for {college.name}
              </p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Launch a live presentation to project the interactive deck in the auditorium and capture student leads in real time.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-5">Session Code</th>
                      <th className="py-3.5 px-4">Pitch Deck</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Attendees</th>
                      <th className="py-3.5 px-4">Started Time</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {sessions.map((sess: any) => (
                      <tr
                        key={sess.id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {sess.sessionCode}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-800 dark:text-zinc-200">
                          {sess.presentationTitle || "Campus Pitch Deck"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              sess.status === "LIVE"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 animate-pulse"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                sess.status === "LIVE" ? "bg-emerald-500" : "bg-zinc-400"
                              }`}
                            />
                            {sess.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                          {sess.activeAttendeesCount || 0} active
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                          {sess.startedAt
                            ? new Date(sess.startedAt).toLocaleString()
                            : sess.createdAt
                            ? new Date(sess.createdAt).toLocaleString()
                            : "—"}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {sess.status === "LIVE" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleSessionStatus(sess.id, "ENDED")}
                                icon={StopCircle}
                                className="text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                title="End Live Session"
                              >
                                End
                              </Button>
                            )}
                            <Link to={`/presentations/live/${sess.id}`}>
                              <Button variant="primary" size="sm" icon={Play} className="text-xs font-bold">
                                Projector Stage
                              </Button>
                            </Link>
                            <Link to={`/presentations/analytics/${sess.id}`}>
                              <Button variant="secondary" size="sm" icon={BarChart3} className="text-xs">
                                Analytics
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: ACADEMIC BRANCHES ─────────────────────────────────────── */}
      {activeTab === "branches" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Academic Branches & Specializations
              </h3>
              <p className="text-[11px] text-zinc-400">
                Departments registered under {college.name} for audience fast-pass onboarding.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setEditingBranch("create")}
              icon={Plus}
              className="font-bold"
            >
              Add Academic Branch
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branchBreakdown.map((b: any) => (
              <div
                key={b.id}
                className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs font-mono shadow-xs">
                        {b.code || b.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {b.name}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-mono uppercase">
                          Code: {b.code || "DEPT"}
                        </span>
                      </div>
                    </div>
                    <Badge variant={b.isActive !== false ? "emerald" : "default"}>
                      {b.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {b.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>
                  )}

                  {/* Branch Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Leads</span>
                      <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 font-mono">
                        {b.leadsCount || 0}
                      </span>
                    </div>
                    <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Share</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {b.participationPercentage || b.percentage || 0}%
                      </span>
                    </div>
                    <div className="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Avg Score</span>
                      <span className="text-xs font-black text-amber-500 font-mono">
                        {b.averageScore || 0} pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-[10px]">ID: {b.id}</span>
                  {b.id !== "other" && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBranch(b)}
                        icon={Edit2}
                        className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        title="Edit Branch"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingBranch(b)}
                        icon={Trash2}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Branch"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: CAMPUS LEADS & LEADERBOARD ────────────────────────────── */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:max-w-2xl">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search leads by name, phone, branch..."
                  value={searchLeads}
                  onChange={(e) => setSearchLeads(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <select
                value={leadBranchFilter}
                onChange={(e) => setLeadBranchFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              >
                <option value="ALL">All Academic Branches</option>
                {branchBreakdown.map((b: any) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.leadsCount || 0} leads)
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              icon={Download}
              className="w-full sm:w-auto text-xs font-bold"
            >
              Export Leads (CSV)
            </Button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-5">Rank</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">WhatsApp Phone</th>
                    <th className="py-3.5 px-4">Branch / Year</th>
                    <th className="py-3.5 px-4">Quiz Score</th>
                    <th className="py-3.5 px-5 text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-zinc-400 text-xs">
                        No student leads found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead: any, idx: number) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-5">
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
                        <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                          {lead.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                          +91 {lead.phone}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                          <span className="font-semibold">{lead.branch || "Unspecified"}</span>
                          {lead.yearOfStudy && (
                            <span className="text-zinc-400 ml-1">({lead.yearOfStudy})</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {lead.totalScore || 0} pts
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono text-zinc-400 text-[11px]">
                          {lead.joinedAt ? new Date(lead.joinedAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: ENROLLED LEARNERS ─────────────────────────────────────── */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search enrolled learners by name or phone..."
                value={searchStudents}
                onChange={(e) => setSearchStudents(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-zinc-400 font-bold">
              {filteredStudents.length} Registered Learners
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
              <GraduationCap className="w-10 h-10 mx-auto text-zinc-400" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                No enrolled learners found for {college.name}
              </p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Students who enroll in AI pathways and courses will appear here with active learning metrics.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((st: any) => (
                <div
                  key={st.id}
                  className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                        {(st.name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {st.name || "Student"}
                        </h4>
                        <p className="text-xs text-zinc-400 font-mono">+91 {st.phone}</p>
                      </div>
                    </div>
                    <Badge variant="emerald">{st.enrolledCount || 1} Enrolled</Badge>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Branch & Intake
                    </span>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {st.branch || "General / Multidisciplinary"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 6: BRANCH DIVERSIFICATION & ANALYTICS ─────────────────────── */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Diversification KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Conversion to Enrolled
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {recentLeads.length > 0
                    ? Math.round((enrolledStudents.length / recentLeads.length) * 100)
                    : 0}
                  %
                </span>
                <span className="text-[10px] text-zinc-400">
                  {enrolledStudents.length}/{recentLeads.length} leads
                </span>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Top Participating Dept
              </span>
              <div className="flex items-baseline gap-2 truncate">
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 truncate">
                  {branchBreakdown.length > 0
                    ? [...branchBreakdown].sort((a, b) => (b.leadsCount || 0) - (a.leadsCount || 0))[0]?.name || "None"
                    : "None"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Highest Scoring Dept
              </span>
              <div className="flex items-baseline gap-2 truncate">
                <span className="text-base font-black text-amber-500 truncate">
                  {branchBreakdown.length > 0
                    ? [...branchBreakdown].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))[0]?.name || "None"
                    : "None"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Campus Top Scorer
              </span>
              <div className="flex items-baseline gap-2 truncate">
                <span className="text-base font-black text-violet-600 dark:text-violet-400 truncate">
                  {recentLeads.length > 0
                    ? `${recentLeads[0]?.name || "Student"} (${recentLeads[0]?.totalScore || 0} pts)`
                    : "No Leads Yet"}
                </span>
              </div>
            </div>
          </div>

          {/* Department Participation Share Bars */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Department Participation Share & Diversification
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Relative attendance and engagement breakdown across academic branches for {college.name}.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {branchBreakdown.length} Departments Configured
              </span>
            </div>

            <div className="space-y-4">
              {branchBreakdown.map((b: any) => {
                const pct = b.participationPercentage || b.percentage || 0;
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {b.name} <span className="font-mono text-zinc-400">({b.code || "DEPT"})</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 font-mono">{b.leadsCount || 0} leads</span>
                        <span className="text-amber-500 font-mono font-bold">{b.averageScore || 0} avg pts</span>
                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Diversification Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Branch Diversification & Performance Matrix
              </h4>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                icon={Download}
                className="text-xs"
              >
                Export Matrix Data
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-5">Department / Branch</th>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Captured Leads</th>
                    <th className="py-3.5 px-4">Campus Share</th>
                    <th className="py-3.5 px-4">Avg Score</th>
                    <th className="py-3.5 px-4">Enrolled Learners</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
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
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400 uppercase">
                        {b.code || "DEPT"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {b.leadsCount || 0}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        {b.participationPercentage || b.percentage || 0}%
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-500">
                        {b.averageScore || 0} pts
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {b.enrollmentsCount || b.studentsCount || 0}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => {
                            setLeadBranchFilter(b.name);
                            setActiveTab("leads");
                          }}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          View Leads →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 7: UNIVERSITY SETTINGS & PROFILE ─────────────────────────── */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              University Profile & Settings
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Update institutional metadata, display abbreviations, and operational status.
            </p>
          </div>

          <CollegeEditForm
            college={college}
            isLoading={isUpdatingCollege}
            onClose={() => {}}
            onSave={handleSaveCollege}
          />
        </div>
      )}

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}

      {/* Edit College Modal */}
      {editingCollege && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCollege(false)}
          title="Edit University Partner"
          maxWidth="max-w-lg"
        >
          <CollegeEditForm
            college={college}
            isLoading={isUpdatingCollege}
            onClose={() => setEditingCollege(false)}
            onSave={handleSaveCollege}
          />
        </Modal>
      )}

      {/* Delete College Modal */}
      {deletingCollege && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingCollege(false)}
          title="Delete University Partner"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                <p className="font-bold mb-1">Critical Action Confirmation</p>
                Are you sure you want to permanently delete <span className="font-bold underline">{college.name}</span>?
                This will automatically delete all {presentations.length} pitch decks, {sessions.length} roadshows, and {branchBreakdown.length} branches attached to this university.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDeletingCollege(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={isDeletingCollege}
                onClick={handleDeleteCollege}
                icon={Trash2}
              >
                Confirm Delete University
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Branch Modal */}
      {editingBranch && (
        <Modal
          isOpen={true}
          onClose={() => setEditingBranch(null)}
          title={editingBranch === "create" ? `Add Branch for ${college.name}` : "Edit Academic Branch"}
          maxWidth="max-w-lg"
        >
          <BranchForm
            branch={editingBranch === "create" ? null : editingBranch}
            collegeName={college.name}
            isLoading={isCreatingBranch || isUpdatingBranch}
            onClose={() => setEditingBranch(null)}
            onSave={handleSaveBranch}
          />
        </Modal>
      )}

      {/* Delete Branch Modal */}
      {deletingBranch && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingBranch(null)}
          title="Delete Academic Branch"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                <p className="font-bold mb-1">Confirm Branch Deletion</p>
                Delete branch <span className="font-bold underline">{deletingBranch.name}</span> from {college.name}?
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDeletingBranch(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={isDeletingBranch}
                onClick={handleDeleteBranch}
                icon={Trash2}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Pitch Deck Modal */}
      {creatingDeck && (
        <Modal
          isOpen={true}
          onClose={() => setCreatingDeck(false)}
          title={`Create Pitch Deck for ${college.name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateDeck} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/60 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
                Will be populated with the animated UNISOLE AI Campus roadshow slide deck template.
              </span>
            </div>

            <Input
              label="Presentation Deck Title"
              value={newDeckTitle}
              onChange={(e) => setNewDeckTitle(e.target.value)}
              placeholder={`e.g. UNISOLE AI Campus Roadshow — ${college.shortName || "Campus"}`}
              required
            />

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={newDeckDesc}
                onChange={(e) => setNewDeckDesc(e.target.value)}
                placeholder="Auditorium batch, target semester, keynote topic..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreatingDeck(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={isCreatingDeck} icon={Sparkles} className="font-bold">
                Create & Open Slide Builder
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Pitch Deck Modal */}
      {deletingDeck && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingDeck(null)}
          title="Delete Pitch Deck"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                <p className="font-bold mb-1">Confirm Deck Deletion</p>
                Delete pitch deck <span className="font-bold underline">{deletingDeck.title}</span>?
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDeletingDeck(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={isDeletingDeck}
                onClick={handleDeleteDeck}
                icon={Trash2}
              >
                Confirm Delete Deck
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Launched Session Live Modal */}
      {launchedData && (
        <Modal
          isOpen={true}
          onClose={() => setLaunchedData(null)}
          title="Live Roadshow Stage Ready"
          maxWidth="max-w-lg"
        >
          <div className="space-y-5 text-center py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              LIVE AUDITORIUM SESSION ACTIVE
            </div>

            <div>
              <span className="text-xs text-zinc-400 block mb-1">Session Code</span>
              <span className="text-3xl font-black font-mono tracking-widest text-indigo-600 dark:text-indigo-400">
                {launchedData.session.sessionCode}
              </span>
            </div>

            {launchedData.qrCodeDataUrl && (
              <div className="flex justify-center p-3 bg-white rounded-2xl border border-zinc-200 dark:border-zinc-800 w-fit mx-auto shadow-sm">
                <img
                  src={launchedData.qrCodeDataUrl}
                  alt="Student Fast-Pass QR Code"
                  className="w-48 h-48 rounded-xl object-contain"
                />
              </div>
            )}

            <div className="flex items-center gap-2 justify-center">
              <input
                type="text"
                readOnly
                value={launchedData.joinUrl}
                className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-700 dark:text-zinc-300 w-72 text-center"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyLink(launchedData.joinUrl)}
                icon={copiedLink ? Check : Copy}
              >
                {copiedLink ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => setLaunchedData(null)}>
                Close
              </Button>
              <Link to={`/presentations/live/${launchedData.session.id}`}>
                <Button variant="primary" size="sm" icon={Play} className="font-bold">
                  Open Auditorium Projector Stage
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── HELPER FORMS ─────────────────────────────────────────────────────────────

function CollegeEditForm({ college, isLoading, onClose, onSave }: any) {
  const [name, setName] = useState(college?.name || "");
  const [slug, setSlug] = useState(college?.slug || "");
  const [shortName, setShortName] = useState(college?.shortName || "");
  const [description, setDescription] = useState(college?.description || "");
  const [isActive, setIsActive] = useState(college ? !!college.isActive : true);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, slug, shortName: shortName || null, description: description || null, isActive });
      }}
      className="space-y-4"
    >
      <Input
        label="College / University Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Slug Identifier"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <Input
          label="Short Code / Acronym"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
        />
      </div>
      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
        <input
          type="checkbox"
          id="clg-edit-active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="clg-edit-active" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
          Active University Partner
        </label>
      </div>
      <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
        {onClose && (
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" loading={isLoading} className="font-bold">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

function BranchForm({ branch, collegeName, isLoading, onClose, onSave }: any) {
  const [name, setName] = useState(branch?.name || "");
  const [code, setCode] = useState(branch?.code || "");
  const [description, setDescription] = useState(branch?.description || "");
  const [isActive, setIsActive] = useState(branch ? !!branch.isActive : true);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, code: code || null, description: description || null, isActive });
      }}
      className="space-y-4"
    >
      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Target College: {collegeName}
        </span>
      </div>

      <Input
        label="Branch / Specialization Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="e.g. Computer Science & Engineering"
      />
      <Input
        label="Branch Code / Acronym"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="e.g. CSE, AIML, ECE"
      />
      <div>
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Description (Optional)
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
          placeholder="Branch overview, department info..."
        />
      </div>
      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
        <input
          type="checkbox"
          id="brn-edit-active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="brn-edit-active" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
          Active and visible in registration dropdowns
        </label>
      </div>
      <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={isLoading} className="font-bold">
          Save Branch
        </Button>
      </div>
    </form>
  );
}
