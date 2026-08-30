import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import {
  useGetCollegeAnalyticsQuery,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetPresentationsQuery,
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
  Filter,
  CheckCircle,
  RefreshCw,
  Send,
  MessageCircle,
  Share2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);

  // Fetch college analytics and nested entities
  const { data: analytics, isLoading, refetch } = useGetCollegeAnalyticsQuery(
    { baseUrl, id: id! },
    { skip: !id }
  );

  const { data: presRes } = useGetPresentationsQuery({ baseUrl, collegeId: id! });
  const collegePresentations = presRes?.data || [];

  // Mutations
  const [updateCollege, { isLoading: isUpdatingCollege }] = useUpdateCollegeMutation();
  const [deleteCollege, { isLoading: isDeletingCollege }] = useDeleteCollegeMutation();
  const [createBranch, { isLoading: isCreatingBranch }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdatingBranch }] = useUpdateBranchMutation();
  const [deleteBranch, { isLoading: isDeletingBranch }] = useDeleteBranchMutation();
  const [createPresentation, { isLoading: isCreatingDeck }] = useCreatePresentationMutation();
  const [launchSession, { isLoading: isLaunchingSession }] = useLaunchSessionMutation();
  const [updateSessionStatus, { isLoading: isUpdatingSessionStatus }] = useUpdateSessionStatusMutation();

  // Active Tab: blueprint (visual hierarchy) | branches | sessions | leads | students | settings
  const [activeTab, setActiveTab] = useState<
    "blueprint" | "branches" | "sessions" | "leads" | "students" | "settings"
  >("blueprint");

  // Modals state
  const [editingCollege, setEditingCollege] = useState(false);
  const [deletingCollege, setDeletingCollege] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [deletingBranch, setDeletingBranch] = useState<any>(null);
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [createDeckModalOpen, setCreateDeckModalOpen] = useState(false);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<any>(null);

  // Branch form
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchDesc, setBranchDesc] = useState("");
  const [branchError, setBranchError] = useState("");

  // College edit form
  const [colName, setColName] = useState("");
  const [colShortName, setColShortName] = useState("");
  const [colSlug, setColSlug] = useState("");
  const [colDesc, setColDesc] = useState("");

  // Deck creation form
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDesc, setDeckDesc] = useState("");

  // Launch session state
  const [selectedDeckForLaunch, setSelectedDeckForLaunch] = useState<string>("");
  const [customSessionCode, setCustomSessionCode] = useState("");
  const [launchedData, setLaunchedData] = useState<{
    session: any;
    qrCodeDataUrl: string;
    joinUrl: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Filter & Search states
  const [searchLeads, setSearchLeads] = useState("");
  const [leadBranchFilter, setLeadBranchFilter] = useState("ALL");
  const [leadSessionFilter, setLeadSessionFilter] = useState("ALL");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [searchBranches, setSearchBranches] = useState("");
  const [searchStudents, setSearchStudents] = useState("");

  // Toast / inline notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Populate edit forms when analytics loads
  useEffect(() => {
    if (analytics?.college) {
      setColName(analytics.college.name || "");
      setColShortName(analytics.college.shortName || "");
      setColSlug(analytics.college.slug || "");
      setColDesc(analytics.college.description || "");
    }
  }, [analytics?.college]);

  // Live Socket connection for session launch modal
  useEffect(() => {
    if (!launchModalOpen || !launchedData?.session?.sessionCode) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setAttendees([]);
      setAttendeeCount(0);
      return;
    }

    const socketUrl = baseUrl.replace(/\/+$/, "");
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.emit("admin:join", {
      sessionCode: launchedData.session.sessionCode,
      sessionId: launchedData.session.id,
    });

    socket.on("sync_state", (state) => {
      if (Array.isArray(state.attendees)) setAttendees(state.attendees);
      if (typeof state.attendeeCount === "number") setAttendeeCount(state.attendeeCount);
    });

    socket.on("attendee_count", ({ count }) => setAttendeeCount(count));
    socket.on("attendee_joined", ({ attendees: list, count }) => {
      setAttendeeCount(count);
      if (list) setAttendees(list);
    });
    socket.on("attendee_left", ({ attendees: list, count }) => {
      setAttendeeCount(count);
      if (list) setAttendees(list);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [launchModalOpen, launchedData?.session?.sessionCode, launchedData?.session?.id, baseUrl]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center flex-col gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
        <span className="text-xs text-zinc-400 font-medium">Loading University Campus Workspace...</span>
      </div>
    );
  }

  if (!analytics || !analytics.college) {
    return (
      <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
        <GraduationCap className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">University Not Found</h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          The requested campus does not exist or was removed from the ecosystem.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate("/colleges")}>
          Back to Campus Directory
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

  // Filtered Leads
  const filteredLeads = recentLeads.filter((l: any) => {
    const q = searchLeads.toLowerCase();
    const matchesSearch =
      (l.name || "").toLowerCase().includes(q) ||
      (l.phone || "").includes(q) ||
      (l.email || "").toLowerCase().includes(q);

    const matchesBranch =
      leadBranchFilter === "ALL" ||
      (l.branch || "").toLowerCase() === leadBranchFilter.toLowerCase();

    const matchesSession =
      leadSessionFilter === "ALL" || l.sessionId === leadSessionFilter;

    const matchesScore = (l.totalScore || 0) >= minScoreFilter;

    return matchesSearch && matchesBranch && matchesSession && matchesScore;
  });

  // Filtered Branches
  const filteredBranches = branchBreakdown.filter((b: any) => {
    const q = searchBranches.toLowerCase();
    return (
      (b.name || "").toLowerCase().includes(q) ||
      (b.code || "").toLowerCase().includes(q)
    );
  });

  // Filtered Enrolled Students
  const filteredStudents = enrolledStudents.filter((s: any) => {
    const q = searchStudents.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.phone || "").includes(q) ||
      (s.branch || "").toLowerCase().includes(q)
    );
  });

  // Handle branch operations
  const handleOpenAddBranch = () => {
    setBranchName("");
    setBranchCode("");
    setBranchDesc("");
    setBranchError("");
    setEditingBranch(null);
    setBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: any) => {
    setEditingBranch(b);
    setBranchName(b.name);
    setBranchCode(b.code || "");
    setBranchDesc(b.description || "");
    setBranchError("");
    setBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) {
      setBranchError("Branch name is required");
      return;
    }
    try {
      if (editingBranch) {
        await updateBranch({
          baseUrl,
          id: editingBranch.id,
          body: {
            collegeId: college.id,
            name: branchName.trim(),
            code: branchCode.trim().toUpperCase() || null,
            description: branchDesc.trim() || null,
          },
        }).unwrap();
        showToast("Academic branch updated successfully.");
      } else {
        await createBranch({
          baseUrl,
          body: {
            collegeId: college.id,
            name: branchName.trim(),
            code: branchCode.trim().toUpperCase() || null,
            description: branchDesc.trim() || null,
          },
        }).unwrap();
        showToast("New academic branch added to campus.");
      }
      setBranchModalOpen(false);
      refetch();
    } catch (err: any) {
      setBranchError(err.data?.error || "Failed to save branch");
    }
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranch) return;
    try {
      await deleteBranch({ baseUrl, id: deletingBranch.id }).unwrap();
      setDeletingBranch(null);
      showToast("Academic branch deleted.");
      refetch();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle launch roadshow session
  const handleOpenLaunchModal = (deckId?: string) => {
    if (deckId) {
      setSelectedDeckForLaunch(deckId);
    } else if (presentations.length > 0) {
      setSelectedDeckForLaunch(presentations[0].id);
    }
    setCustomSessionCode(`${college.shortName || "CAMPUS"}${Math.floor(100 + Math.random() * 900)}`);
    setLaunchedData(null);
    setLaunchModalOpen(true);
  };

  const handleLaunchSession = async () => {
    if (!selectedDeckForLaunch) {
      // If no deck exists, create one first or alert
      if (presentations.length === 0) {
        setCreateDeckModalOpen(true);
        return;
      }
      return;
    }
    try {
      const res = await launchSession({
        baseUrl,
        presentationId: selectedDeckForLaunch,
        body: {
          collegeId: college.id,
          customCode: customSessionCode.trim() || undefined,
        },
      }).unwrap();

      setLaunchedData(res);
      refetch();
    } catch (err: any) {
      alert(err.data?.error || "Failed to launch live presentation session");
    }
  };

  const handleUpdateSessionState = async (sessionId: string, status: "LIVE" | "PAUSED" | "ENDED") => {
    try {
      await updateSessionStatus({ baseUrl, sessionId, body: { status } }).unwrap();
      refetch();
      showToast(`Session status updated to ${status}`);
    } catch (err: any) {
      alert(err.data?.error || "Failed to update session status");
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckTitle.trim()) return;
    try {
      const created = await createPresentation({
        baseUrl,
        body: {
          collegeId: college.id,
          title: deckTitle.trim(),
          description: deckDesc.trim() || undefined,
        },
      }).unwrap();
      setCreateDeckModalOpen(false);
      setDeckTitle("");
      setDeckDesc("");
      showToast("Pitch deck created for this campus.");
      refetch();
      handleOpenLaunchModal(created.id);
    } catch (err: any) {
      alert(err.data?.error || "Failed to create presentation deck");
    }
  };

  // Export leads to CSV
  const handleExportLeadsCSV = () => {
    if (filteredLeads.length === 0) {
      alert("No leads to export.");
      return;
    }

    const headers = ["ID", "Name", "Phone", "Email", "Branch", "Year of Study", "Quiz Score", "Session ID", "Joined At"];
    const rows = filteredLeads.map((l: any) => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${l.phone || ""}"`,
      `"${l.email || ""}"`,
      `"${(l.branch || "").replace(/"/g, '""')}"`,
      `"${l.yearOfStudy || ""}"`,
      l.totalScore || 0,
      `"${l.sessionId || ""}"`,
      `"${l.joinedAt || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${college.slug}_leads_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleUpdateCollegeInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCollege({
        baseUrl,
        id: college.id,
        body: {
          name: colName.trim(),
          shortName: colShortName.trim() || null,
          slug: colSlug.trim(),
          description: colDesc.trim() || null,
        },
      }).unwrap();
      setEditingCollege(false);
      showToast("Campus details saved successfully.");
      refetch();
    } catch (err: any) {
      alert(err.data?.error || "Failed to update college");
    }
  };

  const handleDeleteCollegePermanent = async () => {
    try {
      await deleteCollege({ baseUrl, id: college.id }).unwrap();
      navigate("/colleges");
    } catch (err: any) {
      alert(err.data?.error || "Failed to delete university");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. CAMPUS COMMAND HEADER ───────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Top bar: Breadcrumbs & live status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Link
              to="/colleges"
              className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Campus Ecosystem</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
            <span className="text-zinc-900 dark:text-zinc-100 font-bold font-mono">
              {college.shortName || college.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasLiveSession ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {liveSessions.length} LIVE ROADSHOW SESSION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                Standby Mode
              </span>
            )}
          </div>
        </div>

        {/* Main University Title & Action Buttons */}
        <div className="pt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20 shrink-0">
              {(college.shortName || college.name).substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {college.name}
                </h1>
                {college.shortName && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                    {college.shortName}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                {college.description || "Official partner campus entity anchoring academic branches, roadshows, and leads."}
              </p>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleOpenLaunchModal()}
              className="flex items-center gap-2 shadow-md shadow-indigo-500/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Roadshow</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleOpenAddBranch}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>Add Branch</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleExportLeadsCSV}
              className="flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-zinc-500" />
              <span>Export Leads</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setEditingCollege(true)}
              className="p-2.5"
              title="Edit Campus Settings"
            >
              <Settings className="w-4 h-4 text-zinc-500" />
            </Button>
          </div>
        </div>

        {/* ─── Metric Strip ─────────────────────────────────────────── */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Academic Branches
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {stats.totalBranchesCount ?? branchBreakdown.length}
              </span>
              <span className="text-[10px] text-zinc-400">departments</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Roadshows Conducted
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-violet-600 dark:text-violet-400">
                {sessions.length}
              </span>
              <span className="text-[10px] text-zinc-400">sessions</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Captured Leads
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
                {recentLeads.length}
              </span>
              <span className="text-[10px] text-zinc-400">students</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Learners Enrolled
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                {stats.totalLearnersEnrolled ?? enrolledStudents.length}
              </span>
              <span className="text-[10px] text-zinc-400">
                {recentLeads.length > 0
                  ? `(${Math.round(((stats.totalLearnersEnrolled || enrolledStudents.length) / recentLeads.length) * 100)}%)`
                  : ""}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Avg Quiz Performance
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {stats.averageQuizScore ?? 0}
              </span>
              <span className="text-[10px] text-zinc-400">pts / lead</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. TAB WORKSPACE NAVIGATION ─────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("blueprint")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "blueprint"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Hierarchy Blueprint</span>
        </button>

        <button
          onClick={() => setActiveTab("branches")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "branches"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span>Academic Branches ({branchBreakdown.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "sessions"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Radio className="w-4 h-4 text-violet-500" />
          <span>Roadshow Sessions ({sessions.length})</span>
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
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span>Enrolled Learners ({enrolledStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "settings"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Campus Settings</span>
        </button>
      </div>

      {/* ─── 3. TAB CONTENT ─────────────────────────────────────────── */}

      {/* ── TAB: HIERARCHY BLUEPRINT (Visual Interactive Diagram) ───── */}
      {activeTab === "blueprint" && (
        <div className="space-y-6">
          {/* Blueprint Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-zinc-900 text-white border border-indigo-800/60 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
                Architectural Blueprint
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Direct Campus Hierarchy Canvas
            </h2>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
              Strictly enforced structural model: All branches and roadshow sessions belong to <strong>{college.name}</strong>. Student leads are captured exclusively within sessions and categorized by branch.
            </p>
          </div>

          {/* Visual Interactive Tree Map */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-8">
            {/* Level 0: Root Campus Node */}
            <div className="flex justify-center">
              <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 border-2 border-indigo-500/50 shadow-md text-center max-w-md w-full relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black mx-auto mb-2 shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  ROOT ECOSYSTEM ENTITY
                </span>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {college.name}
                </h3>
                <div className="flex items-center justify-center gap-3 mt-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span>{branchBreakdown.length} Branches</span>
                  <span>•</span>
                  <span>{sessions.length} Roadshows</span>
                  <span>•</span>
                  <span>{recentLeads.length} Leads</span>
                </div>
              </div>
            </div>

            {/* Connecting Connector Line */}
            <div className="flex justify-center">
              <div className="w-0.5 h-8 bg-indigo-300 dark:bg-indigo-700" />
            </div>

            {/* Level 1: Sub-Resource Split (Branches & Roadshow Sessions) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Sub-tree */}
              <div className="p-5 rounded-3xl bg-zinc-50/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      Academic Branches ({branchBreakdown.length})
                    </h4>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenAddBranch}
                    className="text-[11px] py-1 px-2.5"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {branchBreakdown.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 text-center text-xs text-zinc-400">
                      No academic branches registered yet.
                    </div>
                  ) : (
                    branchBreakdown.slice(0, 6).map((branch: any) => (
                      <div
                        key={branch.id}
                        onClick={() => {
                          setLeadBranchFilter(branch.name);
                          setActiveTab("leads");
                        }}
                        className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between hover:border-emerald-400 cursor-pointer transition-all shadow-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block group-hover:text-emerald-600 transition-colors">
                              {branch.name}
                            </span>
                            {branch.code && (
                              <span className="text-[10px] font-mono text-zinc-400">
                                {branch.code}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                            {branch.leadsCount} leads
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sessions Sub-tree */}
              <div className="p-5 rounded-3xl bg-zinc-50/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-violet-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      Roadshows & Pitch Sessions ({sessions.length})
                    </h4>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenLaunchModal()}
                    className="text-[11px] py-1 px-2.5"
                  >
                    <Play className="w-3 h-3 mr-1 fill-violet-500 text-violet-500" /> Launch
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {sessions.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 text-center text-xs text-zinc-400">
                      No roadshow sessions conducted yet.
                    </div>
                  ) : (
                    sessions.slice(0, 6).map((sess: any) => (
                      <div
                        key={sess.id}
                        onClick={() => {
                          setLeadSessionFilter(sess.id);
                          setActiveTab("leads");
                        }}
                        className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between hover:border-violet-400 cursor-pointer transition-all shadow-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              sess.status === "LIVE"
                                ? "bg-emerald-500 animate-ping"
                                : "bg-violet-500"
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-violet-600 transition-colors">
                                #{sess.sessionCode}
                              </span>
                              {sess.status === "LIVE" && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                                  LIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 block">
                              {sess.startedAt ? new Date(sess.startedAt).toLocaleDateString() : "Scheduled"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <span className="text-xs font-mono font-black text-violet-600 dark:text-violet-400">
                            {sess.activeAttendeesCount || 0} attendees
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Level 2: Leads Destination */}
            <div className="p-5 rounded-3xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center font-bold shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                    Captured Student Leads Sink ({recentLeads.length} Leads)
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    All students registered during live campus roadshows are strictly anchored to this college.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("leads")}
                className="shrink-0"
              >
                Inspect All Leads ➔
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ACADEMIC BRANCHES ───────────────────────────────────── */}
      {activeTab === "branches" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Academic Branches & Departments
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Academic divisions configured specifically under {college.name}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchBranches}
                  onChange={(e) => setSearchBranches(e.target.value)}
                  placeholder="Search branches..."
                  className="pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAddBranch}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch</span>
              </Button>
            </div>
          </div>

          {filteredBranches.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
              <BookOpen className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Branches Configured</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Add academic departments (e.g. Computer Science, Mechanical) to track leads and participation per branch.
              </p>
              <Button variant="primary" size="sm" onClick={handleOpenAddBranch}>
                Add Academic Branch
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBranches.map((branch: any) => (
                <div
                  key={branch.id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:border-emerald-400 shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {branch.code || "DEPT"}
                        </span>
                        <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-2 line-clamp-1">
                          {branch.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditBranch(branch)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingBranch(branch)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {branch.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 mb-3">
                        {branch.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-center mt-3">
                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase">Leads</span>
                      <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {branch.leadsCount || 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase">Avg Score</span>
                      <span className="text-sm font-black font-mono text-cyan-600 dark:text-cyan-400">
                        {branch.averageScore || 0} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ROADSHOW SESSIONS ───────────────────────────────────── */}
      {activeTab === "sessions" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Roadshow Pitch Sessions
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Interactive presentation events conducted exclusively at {college.name}.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenLaunchModal()}
              className="flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Live Session</span>
            </Button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
              <Radio className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Roadshow Sessions Yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Launch an interactive pitch session with real-time mobile quiz participation for students at this campus.
              </p>
              <Button variant="primary" size="sm" onClick={() => handleOpenLaunchModal()}>
                Launch First Roadshow
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((sess: any) => {
                const isLive = sess.status === "LIVE";
                return (
                  <div
                    key={sess.id}
                    className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:border-violet-400 shadow-xs transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold">
                            <Radio className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black font-mono text-zinc-900 dark:text-zinc-100">
                                #{sess.sessionCode}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isLive
                                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800 animate-pulse"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                }`}
                              >
                                {sess.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400 block mt-0.5">
                              {sess.startedAt ? new Date(sess.startedAt).toLocaleString() : "Created recently"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isLive ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleUpdateSessionState(sess.id, "ENDED")}
                              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs py-1"
                            >
                              <StopCircle className="w-3.5 h-3.5 mr-1" /> End
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleUpdateSessionState(sess.id, "LIVE")}
                              className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs py-1"
                            >
                              <Play className="w-3.5 h-3.5 mr-1" /> Resume
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 font-mono text-zinc-500">
                        <span>👥 {sess.activeAttendeesCount || 0} active attendees</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/live/projector/${sess.id}`}
                          target="_blank"
                          className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <span>Projector Stage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CAMPUS LEADS ────────────────────────────────────────── */}
      {activeTab === "leads" && (
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Captured Student Leads ({filteredLeads.length})
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Direct student registrations captured during roadshows at {college.name}.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportLeadsCSV}
              className="flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLeads}
                onChange={(e) => setSearchLeads(e.target.value)}
                placeholder="Search name, phone, email..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Branch Filter */}
            <div>
              <select
                value={leadBranchFilter}
                onChange={(e) => setLeadBranchFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Academic Branches</option>
                {branchBreakdown.map((b: any) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.leadsCount || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Session Filter */}
            <div>
              <select
                value={leadSessionFilter}
                onChange={(e) => setLeadSessionFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Roadshow Sessions</option>
                {sessions.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    Session #{s.sessionCode} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Score Filter */}
            <div>
              <select
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>All Quiz Scores</option>
                <option value={300}>Score &gt; 300 pts</option>
                <option value={600}>Score &gt; 600 pts</option>
                <option value={800}>Score &gt; 800 pts (Top Tier)</option>
              </select>
            </div>
          </div>

          {/* Leads Table */}
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
              <Users className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Leads Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No captured student leads match your search and filter criteria.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">WhatsApp / Mobile</th>
                      <th className="px-4 py-3">Branch & Year</th>
                      <th className="px-4 py-3 text-center">Quiz Score</th>
                      <th className="px-4 py-3 text-center">Session</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredLeads.map((lead: any) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">
                            {lead.name}
                          </div>
                          {lead.email && (
                            <span className="text-[10px] text-zinc-400 block font-mono">
                              {lead.email}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">
                          +91 {lead.phone}
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                            {lead.branch || "General"}
                          </span>
                          {lead.yearOfStudy && (
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {lead.yearOfStudy}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {lead.totalScore || 0} pts
                        </td>

                        <td className="px-4 py-3 text-center font-mono text-zinc-400">
                          {lead.sessionId ? `#${lead.sessionId.substring(0, 8)}` : "—"}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`https://wa.me/91${lead.phone}?text=Hi%20${encodeURIComponent(lead.name)},%20thank%20you%20for%20attending%20the%20Unisole%20workshop%20at%20${encodeURIComponent(college.name)}!`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              title="Send WhatsApp Message"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedLeadDetail(lead)}
                              className="text-[11px] py-1 px-2"
                            >
                              Details
                            </Button>
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

      {/* ── TAB: ENROLLED LEARNERS ───────────────────────────────────── */}
      {activeTab === "students" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Enrolled Campus Learners ({filteredStudents.length})
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Students from {college.name} who converted and enrolled into active learning pathways.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchStudents}
                onChange={(e) => setSearchStudents(e.target.value)}
                placeholder="Search learners..."
                className="pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
              <GraduationCap className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Enrolled Learners Yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                As roadshow leads convert into pathway enrollments, their active learning progress will appear here.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Learner</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3 text-center">Enrolled Pathways</th>
                    <th className="px-4 py-3 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredStudents.map((st: any) => (
                    <tr key={st.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                        {st.name || "Student"}
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">
                        +91 {st.phone}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {st.branch || "General"}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {st.enrollments?.length || st.enrolledCount || 1} Active
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400 font-mono">
                        {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CAMPUS SETTINGS ─────────────────────────────────────── */}
      {activeTab === "settings" && (
        <div className="space-y-6 max-w-2xl">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-xs">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              Campus Profile & Metadata
            </h3>

            <form onSubmit={handleUpdateCollegeInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  University / College Name *
                </label>
                <Input
                  type="text"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
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
                    value={colShortName}
                    onChange={(e) => setColShortName(e.target.value.toUpperCase())}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Slug *
                  </label>
                  <Input
                    type="text"
                    value={colSlug}
                    onChange={(e) => setColSlug(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={colDesc}
                  onChange={(e) => setColDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isUpdatingCollege}
              >
                {isUpdatingCollege ? "Saving..." : "Save Campus Settings"}
              </Button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-4">
            <h3 className="text-base font-black text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Danger Zone: Cascade Deletion</span>
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
              Deleting this university will permanently cascade and delete all <strong>{branchBreakdown.length} branches</strong>, <strong>{sessions.length} roadshows</strong>, and <strong>{recentLeads.length} leads</strong> associated with this campus.
            </p>

            <Button
              variant="danger"
              size="md"
              onClick={() => setDeletingCollege(true)}
            >
              Permanently Delete Campus
            </Button>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT BRANCH ───────────────────────────────── */}
      {branchModalOpen && (
        <Modal
          title={editingBranch ? "Edit Academic Branch" : "Add Academic Branch"}
          isOpen={branchModalOpen}
          onClose={() => setBranchModalOpen(false)}
        >
          <form onSubmit={handleSaveBranch} className="space-y-4">
            {branchError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {branchError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Branch / Department Name *
              </label>
              <Input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Branch Code / Abbreviation
              </label>
              <Input
                type="text"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
                placeholder="e.g. CSE"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Department Overview
              </label>
              <textarea
                value={branchDesc}
                onChange={(e) => setBranchDesc(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setBranchModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isCreatingBranch || isUpdatingBranch}
              >
                {isCreatingBranch || isUpdatingBranch ? "Saving..." : "Save Branch"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: DELETE BRANCH CONFIRM ───────────────────────────── */}
      {deletingBranch && (
        <Modal
          title="Delete Academic Branch"
          isOpen={!!deletingBranch}
          onClose={() => setDeletingBranch(null)}
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete <strong>{deletingBranch.name}</strong> from {college.name}?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="secondary" size="md" onClick={() => setDeletingBranch(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleDeleteBranch}
                disabled={isDeletingBranch}
              >
                {isDeletingBranch ? "Deleting..." : "Delete Branch"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: LAUNCH ROADSHOW SESSION ─────────────────────────── */}
      {launchModalOpen && (
        <Modal
          title="Launch Live Roadshow Session"
          isOpen={launchModalOpen}
          onClose={() => {
            setLaunchModalOpen(false);
            setLaunchedData(null);
          }}
        >
          {!launchedData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Select Presentation Deck
                </label>
                {presentations.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
                    <span>No pitch decks created for this campus yet.</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setLaunchModalOpen(false);
                        setCreateDeckModalOpen(true);
                      }}
                    >
                      Create Deck
                    </Button>
                  </div>
                ) : (
                  <select
                    value={selectedDeckForLaunch}
                    onChange={(e) => setSelectedDeckForLaunch(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {presentations.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Session Room Code (Auto or Custom)
                </label>
                <Input
                  type="text"
                  value={customSessionCode}
                  onChange={(e) => setCustomSessionCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DTU2026"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setLaunchModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleLaunchSession}
                  disabled={isLaunchingSession}
                >
                  {isLaunchingSession ? "Launching..." : "Launch Stage & QR Code"}
                </Button>
              </div>
            </div>
          ) : (
            /* Launched View with QR Code and Live Attendees */
            <div className="space-y-5 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 text-xs font-black animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                SESSION IS LIVE • #{launchedData.session.sessionCode}
              </div>

              <div className="p-4 bg-white rounded-3xl border-2 border-indigo-500/30 inline-block shadow-lg mx-auto">
                <img
                  src={launchedData.qrCodeDataUrl}
                  alt="Session QR Code"
                  className="w-56 h-56 mx-auto rounded-xl"
                />
              </div>

              <div>
                <span className="text-xs text-zinc-400 font-medium block">
                  Audience Direct Join URL:
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 select-all">
                    {launchedData.joinUrl}
                  </span>
                  <button
                    onClick={() => handleCopyLink(launchedData.joinUrl)}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-300"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Attendee Counter */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-500 block">
                  Active Live Attendees Joined
                </span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {attendeeCount} students
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  to={`/live/projector/${launchedData.session.id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Fullscreen Projector</span>
                </Link>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setLaunchModalOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ─── MODAL: CREATE PITCH DECK ───────────────────────────────── */}
      {createDeckModalOpen && (
        <Modal
          title="Create Roadshow Pitch Deck"
          isOpen={createDeckModalOpen}
          onClose={() => setCreateDeckModalOpen(false)}
        >
          <form onSubmit={handleCreateDeck} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Deck Title *
              </label>
              <Input
                type="text"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="e.g. AI & Future of Tech - Campus Roadshow"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Description
              </label>
              <textarea
                value={deckDesc}
                onChange={(e) => setDeckDesc(e.target.value)}
                placeholder="Pitch overview..."
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCreateDeckModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isCreatingDeck}
              >
                {isCreatingDeck ? "Creating..." : "Create Deck"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: LEAD DETAIL VIEW ────────────────────────────────── */}
      {selectedLeadDetail && (
        <Modal
          title="Lead Profile & Quiz Responses"
          isOpen={!!selectedLeadDetail}
          onClose={() => setSelectedLeadDetail(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                  {selectedLeadDetail.name}
                </h3>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  +91 {selectedLeadDetail.phone}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Score</span>
                <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {selectedLeadDetail.totalScore || 0} pts
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Branch</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                  {selectedLeadDetail.branch || "General"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Year of Study</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                  {selectedLeadDetail.yearOfStudy || "Not specified"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <a
                href={`https://wa.me/91${selectedLeadDetail.phone}?text=Hi%20${encodeURIComponent(selectedLeadDetail.name)},%20we%20noticed%20your%20top%20performance%20in%20the%20Unisole%20workshop!`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Outreach</span>
              </a>
              <Button variant="secondary" size="md" onClick={() => setSelectedLeadDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: DELETE COLLEGE PERMANENT ────────────────────────── */}
      {deletingCollege && (
        <Modal
          title="Permanently Delete University"
          isOpen={deletingCollege}
          onClose={() => setDeletingCollege(false)}
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-rose-700 dark:text-rose-300">
                <p className="font-bold">Permanent Cascade Deletion</p>
                <p>
                  Deleting <strong>{college.name}</strong> will purge all branches, sessions, and leads associated with it. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="secondary" size="md" onClick={() => setDeletingCollege(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleDeleteCollegePermanent}
                disabled={isDeletingCollege}
              >
                {isDeletingCollege ? "Deleting..." : "Purge Campus Hierarchy"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
