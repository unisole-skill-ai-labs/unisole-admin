import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import confetti from "canvas-confetti";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Users,
  QrCode,
  Sparkles,
  Play,
  CheckCircle2,
  Trophy,
  X,
  Radio,
  Flame,
  Clock,
  BarChart3,
  Award,
  Crown,
  Medal,
  FileText,
  HelpCircle,
  Zap,
  UserX,
  UserCheck,
  Search,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  LogOut,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import SlideRenderer from "../../components/presentations/SlideRenderer";
import BranchDistributionPieChart, {
  BranchStats,
  getBranchColorStyle,
} from "../../components/presentations/BranchDistributionPieChart";

export default function LiveProjectorPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const token = useSelector((s: any) => s.auth.token);

  const [session, setSession] = useState<any>(null);
  const [presentation, setPresentation] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [buildStep, setBuildStep] = useState(0);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isPresentationStarted, setIsPresentationStarted] = useState(false);
  const [branchStats, setBranchStats] = useState<BranchStats | null>(null);
  const [attendeesDrawerOpen, setAttendeesDrawerOpen] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [joinToast, setJoinToast] = useState<{ name: string; id: string } | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [quizState, setQuizState] = useState<any>({
    isQuizActive: false,
    isAnswerRevealed: false,
    isLeaderboardActive: false,
    timeLimit: 30,
    startedAt: null,
    pollCounts: {},
    quizAnswers: {},
  });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reactions, setReactions] = useState<{ id: string; emoji: string }[]>([]);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<any>(null);

  const handleCopyUrl = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const seoBase = (import.meta as any).env?.VITE_SEO_URL || "https://unisole.org";
    const url = session?.joinUrl || `${seoBase.replace(/\/+$/, "")}/live/${session?.sessionCode || ""}`;
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [session]);

  const handleExitShow = useCallback(() => {
    if (socketRef.current && session?.sessionCode) {
      socketRef.current.emit("admin:end_session", {
        sessionCode: session.sessionCode,
      });
    }
    navigate(`/presentations/sessions/${sessionId}/analytics`);
  }, [navigate, session?.sessionCode, sessionId]);

  // Fetch initial session & presentation data
  useEffect(() => {
    if (!sessionId) return;
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${baseUrl}/api/admin/presentations/sessions/${sessionId}`, {
      headers: authHeaders,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setSession(data.data);
          setCurrentSlideIndex(data.data.currentSlideIndex || 0);
          setBuildStep(0);
          return fetch(
            `${baseUrl}/api/admin/presentations/${data.data.presentationId}`,
            { headers: authHeaders }
          );
        }
      })
      .then((res) => res?.json())
      .then((pData) => {
        if (pData?.data) {
          setPresentation(pData.data);
        }
      })
      .catch((err) => console.error("Error loading session:", err));
  }, [baseUrl, sessionId, token]);

  // Connect Socket.io
  useEffect(() => {
    if (!session?.sessionCode) return;

    const socketUrl = baseUrl.replace(/\/+$/, "");
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.emit("admin:join", {
      sessionCode: session.sessionCode,
      sessionId: session.id,
    });

    socket.on("sync_state", (state) => {
      if (typeof state.currentSlideIndex === "number") {
        setCurrentSlideIndex(state.currentSlideIndex);
      }
      if (typeof state.isPresentationStarted === "boolean") {
        setIsPresentationStarted(state.isPresentationStarted);
      }
      if (typeof state.attendeeCount === "number") {
        setAttendeeCount(state.attendeeCount);
      }
      if (Array.isArray(state.attendees)) {
        setAttendees(state.attendees);
      }
      if (state.branchStats) {
        setBranchStats(state.branchStats);
      }
      if (state.quizState) {
        setQuizState(state.quizState);
      }
      if (state.leaderboard) {
        setLeaderboard(state.leaderboard);
      }
    });

    socket.on("attendee_count", ({ count }) => {
      setAttendeeCount(count);
    });

    socket.on("attendee_joined", ({ attendee, attendees: list, count, branchStats: bStats }) => {
      setAttendeeCount(count);
      if (list) setAttendees(list);
      if (bStats) setBranchStats(bStats);
      if (attendee?.name) {
        setJoinToast({ name: attendee.name, id: attendee.leadId || Math.random().toString() });
        setTimeout(() => {
          setJoinToast((prev) => (prev?.id === attendee.leadId ? null : prev));
        }, 4000);
      }
    });

    socket.on("attendee_left", ({ attendees: list, count, branchStats: bStats }) => {
      setAttendeeCount(count);
      if (list) setAttendees(list);
      if (bStats) setBranchStats(bStats);
    });

    socket.on("attendee_kicked", ({ attendees: list, count, branchStats: bStats }) => {
      setAttendeeCount(count);
      if (list) setAttendees(list);
      if (bStats) setBranchStats(bStats);
    });

    socket.on("branch_distribution_updated", ({ branchStats: bStats, attendees: list }) => {
      if (bStats) setBranchStats(bStats);
      if (list) setAttendees(list);
    });

    socket.on("presentation_started", ({ isPresentationStarted: started, currentSlideIndex: sIdx, buildStep: bStep }) => {
      setIsPresentationStarted(true);
      if (typeof sIdx === "number") setCurrentSlideIndex(sIdx);
      if (typeof bStep === "number") setBuildStep(bStep);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
      });
    });

    socket.on("lobby_mode_entered", (data) => {
      setIsPresentationStarted(false);
      if (data.branchStats) setBranchStats(data.branchStats);
      if (data.attendees) setAttendees(data.attendees);
    });

    socket.on("slide_updated", ({ slideIndex, buildStep: bStep, quizState }) => {
      setCurrentSlideIndex(slideIndex);
      if (typeof bStep === "number") {
        setBuildStep(bStep);
      }
      if (quizState) setQuizState(quizState);
    });

    socket.on("slides_reloaded", ({ slides: updatedSlides, currentSlideIndex: sIdx, buildStep: bStep }) => {
      if (updatedSlides) {
        setPresentation((prev: any) => ({ ...prev, slides: updatedSlides }));
      }
      if (typeof sIdx === "number") setCurrentSlideIndex(sIdx);
      if (typeof bStep === "number") setBuildStep(bStep);
    });

    socket.on("quiz_started", (qData) => {
      setQuizState((prev: any) => ({
        ...prev,
        isQuizActive: true,
        isAnswerRevealed: false,
        isLeaderboardActive: false,
        slideId: qData.slideId,
        slideType: qData.slideType,
        timeLimit: qData.timeLimit,
        startedAt: qData.startedAt,
        pollCounts: {},
        quizAnswers: {},
      }));
    });

    socket.on("live_poll_update", ({ pollCounts }) => {
      setQuizState((prev: any) => ({
        ...prev,
        pollCounts: pollCounts || prev.pollCounts,
      }));
    });

    socket.on("answer_revealed", (data) => {
      setQuizState((prev: any) => ({
        ...prev,
        isQuizActive: false,
        isAnswerRevealed: true,
        pollCounts: data.pollCounts || prev.pollCounts,
      }));
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
      // Confetti burst for revealed answer
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
    });

    socket.on("leaderboard_shown", ({ leaderboard: lb }) => {
      setQuizState((prev: any) => ({
        ...prev,
        isLeaderboardActive: true,
      }));
      if (lb) setLeaderboard(lb);
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
      });
    });

    socket.on("reaction_pulse", ({ emoji, id }) => {
      setReactions((prev) => [...prev.slice(-15), { id, emoji }]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2500);
    });

    return () => {
      socket.disconnect();
    };
  }, [baseUrl, session?.sessionCode, session?.id]);

  // Countdown timer effect for active quiz
  useEffect(() => {
    if (quizState.isQuizActive && quizState.startedAt && quizState.timeLimit) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - quizState.startedAt) / 1000);
        const remaining = Math.max(0, quizState.timeLimit - elapsed);
        setRemainingTime(remaining);

        if (remaining <= 0) {
          clearInterval(timerIntervalRef.current);
        }
      };

      updateTimer();
      timerIntervalRef.current = setInterval(updateTimer, 500);
      return () => clearInterval(timerIntervalRef.current);
    } else {
      setRemainingTime(null);
    }
  }, [quizState.isQuizActive, quizState.startedAt, quizState.timeLimit]);

  const slides = (presentation?.slides as any[]) || [];
  const currentSlide = slides[currentSlideIndex] || null;
  const maxSteps = currentSlide?.maxBuildSteps ?? 0;

  // Handlers for Presenter Actions
  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0 && socketRef.current && session?.sessionCode) {
      const target = currentSlideIndex - 1;
      const prevMax = slides[target]?.maxBuildSteps ?? 0;
      setCurrentSlideIndex(target);
      setBuildStep(prevMax);
      socketRef.current.emit("admin:change_slide", {
        sessionCode: session.sessionCode,
        slideIndex: target,
        buildStep: prevMax,
      });
    }
  }, [currentSlideIndex, session?.sessionCode, slides]);

  const handleNextSlide = useCallback(() => {
    if (
      currentSlideIndex < slides.length - 1 &&
      socketRef.current &&
      session?.sessionCode
    ) {
      const target = currentSlideIndex + 1;
      setCurrentSlideIndex(target);
      setBuildStep(0);
      socketRef.current.emit("admin:change_slide", {
        sessionCode: session.sessionCode,
        slideIndex: target,
        buildStep: 0,
      });
    }
  }, [currentSlideIndex, slides.length, session?.sessionCode]);

  // Progressive Step & Slide Advance
  const handleNextAction = useCallback(() => {
    if (buildStep < maxSteps) {
      const nextStep = buildStep + 1;
      setBuildStep(nextStep);
      if (socketRef.current && session?.sessionCode) {
        socketRef.current.emit("admin:change_slide", {
          sessionCode: session.sessionCode,
          slideIndex: currentSlideIndex,
          buildStep: nextStep,
        });
      }
    } else {
      handleNextSlide();
    }
  }, [buildStep, maxSteps, handleNextSlide, currentSlideIndex, session?.sessionCode]);

  const handleStartPresentation = useCallback(() => {
    if (!socketRef.current || !session?.sessionCode) return;
    socketRef.current.emit("admin:start_presentation", {
      sessionCode: session.sessionCode,
    });
    setIsPresentationStarted(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  }, [session?.sessionCode]);

  const handleReturnToLobby = useCallback(() => {
    if (!socketRef.current || !session?.sessionCode) return;
    socketRef.current.emit("admin:reset_to_lobby", {
      sessionCode: session.sessionCode,
    });
    setIsPresentationStarted(false);
  }, [session?.sessionCode]);

  const handlePrevAction = useCallback(() => {
    if (buildStep > 0) {
      const prevStep = buildStep - 1;
      setBuildStep(prevStep);
      if (socketRef.current && session?.sessionCode) {
        socketRef.current.emit("admin:change_slide", {
          sessionCode: session.sessionCode,
          slideIndex: currentSlideIndex,
          buildStep: prevStep,
        });
      }
    } else {
      handlePrevSlide();
    }
  }, [buildStep, handlePrevSlide, currentSlideIndex, session?.sessionCode]);

  const handleStartQuestion = useCallback(() => {
    if (!currentSlide || !socketRef.current || !session?.sessionCode) return;
    socketRef.current.emit("admin:start_quiz", {
      sessionCode: session.sessionCode,
      slideId: currentSlide.id,
      slideType: currentSlide.type,
      timeLimit: currentSlide.timeLimit || 20,
    });
  }, [currentSlide, session?.sessionCode]);

  const handleRevealAnswer = useCallback(() => {
    if (!currentSlide || !socketRef.current || !session?.sessionCode) return;
    const correctIdx = currentSlide.options?.findIndex(
      (o: any) => o.isCorrect === true
    );
    socketRef.current.emit("admin:reveal_answer", {
      sessionCode: session.sessionCode,
      correctOptionIndex: correctIdx !== -1 ? correctIdx : undefined,
    });
  }, [currentSlide, session?.sessionCode]);

  const handleKickAttendee = useCallback(
    (leadId: string) => {
      if (!socketRef.current || !session?.sessionCode) return;
      socketRef.current.emit("admin:kick_attendee", {
        sessionCode: session.sessionCode,
        leadId,
      });
    },
    [session?.sessionCode]
  );

  const handleShowLeaderboard = useCallback(() => {
    if (!socketRef.current || !session?.sessionCode) return;
    socketRef.current.emit("admin:show_leaderboard", {
      sessionCode: session.sessionCode,
    });
  }, [session?.sessionCode]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      stageRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if modal or inputs are focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (!isPresentationStarted) {
        if (e.key === "Enter" || e.key === " " || e.key === "p" || e.key === "P") {
          e.preventDefault();
          handleStartPresentation();
          return;
        }
      }

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNextAction();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevAction();
      } else if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        handleStartQuestion();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRevealAnswer();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        handleShowLeaderboard();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setNotesOpen((prev) => !prev);
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        setAttendeesDrawerOpen((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setQrModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPresentationStarted,
    handleStartPresentation,
    handleNextAction,
    handlePrevAction,
    handleStartQuestion,
    handleRevealAnswer,
    handleShowLeaderboard,
  ]);

  if (!session || !presentation) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span className="text-xs font-mono text-zinc-400">
            Initializing Auditorium Stage Engine...
          </span>
        </div>
      </div>
    );
  }

  const seoBaseUrl =
    (import.meta as any).env?.VITE_SEO_URL || "https://unisole.org";
  const joinUrl =
    session.joinUrl ||
    `${seoBaseUrl.replace(/\/+$/, "")}/live/${session.sessionCode}`;

  return (
    <div
      ref={stageRef}
      className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* Floating Reaction Animations */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-16 text-4xl animate-float-reaction"
            style={{
              left: `${15 + Math.random() * 70}%`,
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Projector Stage Bar */}
      <header className="px-6 py-3.5 flex items-center justify-between bg-zinc-950/70 backdrop-blur-md border-b border-white/10 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExitShow}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Exit Show & Return to Presentations"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/hehmsemf/image/upload/f_auto,q_auto,w_64/v1785299421/Unisole_logo_new_mhqbma.png"
              alt="Unisole"
              className="w-7 h-7 rounded-lg object-contain"
            />
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight">
                {session.collegeName || "Unisole Roadshow"}
              </span>
              <span className="text-[10px] font-mono text-indigo-400">
                Code: {session.sessionCode}
              </span>
            </div>
          </div>

          {!isPresentationStarted ? (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>PRE-START CHECK-IN LOBBY</span>
            </div>
          ) : (
            <button
              onClick={handleExitShow}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Exit Show & Close Presentation"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Show</span>
            </button>
          )}
        </div>

        {/* Center: Live Audience Connection Badge & QR Modal Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAttendeesDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer transition-all"
            title="View Joined Students / Manage Attendees (U)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Users className="w-3.5 h-3.5" />
            <span>{attendeeCount} Students Checked In</span>
            <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono text-emerald-300">
              U
            </span>
          </button>

          <button
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
            title="Show Join QR Code (M)"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan to Join</span>
          </button>

          <button
            onClick={handleCopyUrl}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              copied
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                : "bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200"
            }`}
            title="Copy Audience Join URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied!" : "Copy Link"}</span>
          </button>
        </div>

        {/* Right: Stage Control & Start Presentation Action */}
        <div className="flex items-center gap-3">
          {!isPresentationStarted ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartPresentation}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 px-4"
              title="Start Live Presentation (Enter / Space)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Presentation</span>
              <span className="text-[10px] bg-emerald-700/40 px-1.5 py-0.5 rounded font-mono ml-1">
                Enter
              </span>
            </Button>
          ) : (
            <>
              {maxSteps > 0 && (
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-[11px] font-mono font-bold text-indigo-300">
                  <Zap className="w-3 h-3 text-indigo-400" />
                  <span>
                    Step {buildStep}/{maxSteps}
                  </span>
                </div>
              )}

              <span className="text-xs font-mono font-bold text-zinc-400">
                {currentSlideIndex + 1} / {slides.length}
              </span>

              <button
                onClick={() => setNotesOpen((prev) => !prev)}
                className={`p-2 rounded-xl transition-colors ${
                  notesOpen
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
                title="Toggle Presenter Script / Notes (N)"
              >
                <FileText className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Center Stage Presentation Canvas */}
      <main className="flex-1 relative flex items-center justify-center p-4 sm:p-8 z-20 overflow-y-auto w-full">
        {/* Glow ambient lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* ==================== 1. PRE-START AUDITORIUM LOBBY STAGE ==================== */}
        {!isPresentationStarted ? (
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in py-2">
            {/* Left Panel: QR Code Check-in Stage & Host Start Button (Cols 1-4) */}
            <div className="lg:col-span-4 rounded-3xl bg-zinc-900/90 border border-white/10 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl space-y-5 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan to Check-In Live</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100">
                  {session.collegeName || "Auditorium Roadshow"}
                </h2>
                <p className="text-xs text-zinc-400">
                  Open your mobile camera to scan and join the live interactive session.
                </p>
              </div>

              {/* QR Code Frame */}
              <div className="relative group w-fit mx-auto">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-50 group-hover:opacity-80 transition duration-500" />
                <div className="relative p-4 rounded-2xl bg-white shadow-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                      joinUrl
                    )}`}
                    alt="Scan QR"
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl object-contain"
                  />
                </div>
              </div>

              {/* Session Code Readout & 1-Click Copy Bar */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                  Session Join Code
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-violet-300 block">
                  {session.sessionCode}
                </span>

                {/* Direct Copyable Join URL */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-[11px] font-mono text-zinc-300 truncate text-left select-all">
                    {joinUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 ${
                      copied
                        ? "bg-emerald-600 text-white"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                    title="Copy direct audience join link to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <a
                    href={joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors shrink-0"
                    title="Open Student Join Page in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Primary Presenter Start Button */}
              <button
                type="button"
                onClick={handleStartPresentation}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:via-purple-500 hover:to-violet-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Live Presentation</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg font-mono ml-1">
                  Enter
                </span>
              </button>
            </div>

            {/* Center Panel: Real-Time Branch Distribution Pie Chart (Cols 5-8) */}
            <div className="lg:col-span-4 flex flex-col">
              <BranchDistributionPieChart
                branchStats={branchStats}
                attendees={attendees}
                title="Branch Distribution"
                subtitle="Live percentage breakdown of joined students"
                className="h-full"
              />
            </div>

            {/* Right Panel: Streaming Live Candidates Feed (Cols 9-12) */}
            <div className="lg:col-span-4 rounded-3xl bg-zinc-900/90 border border-white/10 p-5 flex flex-col justify-between shadow-2xl backdrop-blur-xl h-full space-y-3">
              {/* Feed Header & Live Filter */}
              <div className="space-y-2 pb-2 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="font-extrabold text-sm text-zinc-100 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Live Candidate Stream ({attendees.length})</span>
                    </h3>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter candidates..."
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Candidates Scroll List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
                {attendees.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-zinc-500">
                    <Users className="w-8 h-8 opacity-40 animate-pulse" />
                    <p className="text-xs font-bold text-zinc-400">
                      Lobby Open • Waiting for Check-ins
                    </p>
                    <p className="text-[11px] text-zinc-600 max-w-xs">
                      Candidates will stream here live as they scan the QR code and enter their details.
                    </p>
                  </div>
                ) : (
                  attendees
                    .filter(
                      (att: any) =>
                        !attendeeSearch ||
                        att.name?.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                        att.branch?.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                        att.phone?.includes(attendeeSearch)
                    )
                    .map((att: any, idx: number) => {
                      const color = getBranchColorStyle(att.branch || "", idx);
                      const initials = att.name
                        ? att.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : "ST";

                      return (
                        <div
                          key={att.leadId || idx}
                          className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-all shadow-sm animate-fade-in"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Avatar with branch color ring */}
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-xs text-zinc-100 truncate">
                                  {att.name || "Student"}
                                </h4>
                                {idx === attendees.length - 1 && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold shrink-0">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span
                                className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded"
                                style={{
                                  backgroundColor: `${color.hex}22`,
                                  color: color.hex,
                                }}
                              >
                                {att.branch || "General"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleKickAttendee(att.leadId)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove student"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Stream Footer Info */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>Total Checked In: <strong className="text-white">{attendees.length}</strong></span>
                <span>Press [Enter] to Start</span>
              </div>
            </div>
          </div>
        ) : quizState.isLeaderboardActive ? (
          /* ==================== 2. LEADERBOARD PODIUM ==================== */
          <div className="w-full max-w-5xl mx-auto space-y-6 pt-4 animate-fade-in text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400">
                Live Leaderboard Podium
              </h2>
            </div>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end pt-8">
              {/* Rank 2 */}
              <div className="p-4 rounded-3xl bg-white/10 border border-slate-400/40 text-center space-y-2 order-1 shadow-xl">
                <Medal className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-extrabold text-sm sm:text-base text-zinc-100 truncate">
                  {leaderboard[1]?.name || "—"}
                </div>
                <div className="text-xs font-mono font-bold text-indigo-300">
                  {leaderboard[1]?.score || 0} pts
                </div>
                <div className="h-16 bg-slate-400/20 rounded-xl flex items-center justify-center font-black text-xl text-slate-300">
                  #2
                </div>
              </div>

              {/* Rank 1 */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-500/30 to-amber-500/10 border border-amber-400/60 text-center space-y-2 order-2 shadow-2xl scale-105">
                <Crown className="w-10 h-10 text-amber-300 mx-auto animate-bounce" />
                <div className="font-black text-base sm:text-lg text-amber-200 truncate">
                  {leaderboard[0]?.name || "—"}
                </div>
                <div className="text-sm font-mono font-black text-amber-400">
                  {leaderboard[0]?.score || 0} pts
                </div>
                <div className="h-24 bg-amber-500/30 rounded-xl flex items-center justify-center font-black text-2xl text-amber-300">
                  #1
                </div>
              </div>

              {/* Rank 3 */}
              <div className="p-4 rounded-3xl bg-white/10 border border-amber-700/40 text-center space-y-2 order-3 shadow-xl">
                <Award className="w-8 h-8 text-amber-600 mx-auto" />
                <div className="font-extrabold text-sm sm:text-base text-zinc-100 truncate">
                  {leaderboard[2]?.name || "—"}
                </div>
                <div className="text-xs font-mono font-bold text-indigo-300">
                  {leaderboard[2]?.score || 0} pts
                </div>
                <div className="h-12 bg-amber-700/20 rounded-xl flex items-center justify-center font-black text-lg text-amber-600">
                  #3
                </div>
              </div>
            </div>

            {/* Remaining Top 4-10 */}
            {leaderboard.length > 3 && (
              <div className="max-w-xl mx-auto grid grid-cols-2 gap-2 pt-4">
                {leaderboard.slice(3, 8).map((p, idx) => (
                  <div
                    key={p.leadId || idx}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400 font-bold">
                        #{idx + 4}
                      </span>
                      <span className="font-bold text-zinc-200 truncate max-w-[120px]">
                        {p.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-indigo-400">
                      {p.score} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ==================== 3. ACTIVE SLIDE CANVAS ==================== */
          <SlideRenderer
            key={`slide-${currentSlideIndex}`}
            slide={currentSlide}
            buildStep={buildStep}
            presentationTitle={presentation.title}
            isProjector={true}
            quizState={quizState}
            remainingTime={remainingTime}
            leaderboard={leaderboard}
          />
        )}
      </main>

      {/* Presenter Notes / Teleprompter Floating Drawer (Key 'N') */}
      {notesOpen && currentSlide?.notes && (
        <div className="absolute bottom-20 right-6 max-w-lg w-full z-40 bg-zinc-900/95 border border-indigo-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl text-white space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Presenter Guide & Cue Script</span>
            </div>
            <button
              onClick={() => setNotesOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-line pr-1">
            {currentSlide.notes}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/10 font-mono">
            <span>Slide {currentSlideIndex + 1}</span>
            <span>Press [N] to close</span>
          </div>
        </div>
      )}

      {/* Presenter Floating Remote Control Toolbar */}
      <footer className="px-6 py-4 flex items-center justify-between bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 z-30">
        <div className="flex items-center gap-2">
          {!isPresentationStarted ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartPresentation}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Live Presentation</span>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentSlideIndex === 0 && buildStep === 0}
                onClick={handlePrevAction}
                className="text-zinc-300 hover:text-white hover:bg-white/10"
                title="Previous Step / Slide (← / PageUp)"
              >
                <ChevronLeft className="w-4 h-4 mr-1 inline" />
                <span className="hidden sm:inline">Prev</span>
              </Button>

              {currentSlideIndex === slides.length - 1 && buildStep >= maxSteps ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleExitShow}
                  className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black shadow-lg flex items-center gap-1.5 px-4 cursor-pointer"
                  title="Complete presentation and exit to presentations list"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Show</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextAction}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg"
                  title="Next Step / Slide (→ / Space)"
                >
                  <span>
                    {buildStep < maxSteps
                      ? `Next Step (${buildStep + 1}/${maxSteps})`
                      : "Next Slide"}
                  </span>
                  <ChevronRight className="w-4 h-4 ml-1 inline" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Center: Slide Interaction Buttons */}
        <div className="flex items-center gap-2">
          {isPresentationStarted &&
            (currentSlide?.type === "POLL" || currentSlide?.type === "QUIZ") &&
            !quizState.isQuizActive &&
            !quizState.isAnswerRevealed && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartQuestion}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg flex items-center gap-1.5"
                title="Launch Question to Audience (Q)"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start {currentSlide.type === "POLL" ? "Poll" : "Quiz"} (Q)</span>
              </Button>
            )}

          {isPresentationStarted &&
            currentSlide?.type === "QUIZ" &&
            (quizState.isQuizActive ||
              (!quizState.isAnswerRevealed && !quizState.isLeaderboardActive)) && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRevealAnswer}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg flex items-center gap-1.5"
                title="Reveal Correct Answer (R)"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reveal Answer (R)</span>
              </Button>
            )}

          {isPresentationStarted && currentSlide?.type === "QUIZ" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShowLeaderboard}
              className="bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold shadow-lg flex items-center gap-1.5"
              title="Show Top 10 Leaderboard (L)"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Leaderboard (L)</span>
            </Button>
          )}
        </div>

        {/* Right: Shortcuts Guide Tooltip */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-zinc-400">
          {!isPresentationStarted ? (
            <>
              <span>[Enter / Space] Start Presentation</span>
              <span>[U] Attendees</span>
              <span>[M] QR Code</span>
              <span>[F] Fullscreen</span>
            </>
          ) : (
            <>
              <span>[Space/→] Step</span>
              <span>[U] Attendees</span>
              <span>[N] Notes</span>
              <span>[Q] Start</span>
              <span>[R] Reveal</span>
              <span>[L] Podium</span>
              <span>[F] Fullscreen</span>
            </>
          )}
        </div>
      </footer>

      {/* Real-Time Member Joined Notification Toast */}
      {joinToast && (
        <div className="fixed bottom-20 left-6 z-50 animate-bounce">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-100 shadow-2xl backdrop-blur-xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-white block">{joinToast.name}</span>
              <span className="text-[11px] text-emerald-300">just joined the presentation</span>
            </div>
          </div>
        </div>
      )}

      {/* Joined Attendees Drawer (Key 'U') */}
      {attendeesDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950 border-l border-white/10 h-full p-6 flex flex-col shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Joined Students</h3>
                  <p className="text-xs text-zinc-400">
                    {attendees.length} active attendee{attendees.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAttendeesDrawerOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or phone..."
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Attendees List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {attendees
                .filter(
                  (att: any) =>
                    !attendeeSearch ||
                    att.name?.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                    att.phone?.includes(attendeeSearch)
                )
                .length === 0 ? (
                <div className="text-center py-12 space-y-2 text-zinc-500">
                  <Users className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">No matching students found</p>
                </div>
              ) : (
                attendees
                  .filter(
                    (att: any) =>
                      !attendeeSearch ||
                      att.name?.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                      att.phone?.includes(attendeeSearch)
                  )
                  .map((att: any, idx: number) => {
                    const initials = att.name
                      ? att.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "ST";

                    return (
                      <div
                        key={att.leadId || idx}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow">
                            {initials}
                          </div>
                          {/* Details */}
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-zinc-100 truncate">
                              {att.name || "Anonymous Student"}
                            </h4>
                            <p className="text-[10px] font-mono text-zinc-400 truncate">
                              {att.phone || "No phone"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Score Badge */}
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {att.totalScore ?? 0} pts
                          </span>

                          {/* Kick Button */}
                          <button
                            onClick={() => handleKickAttendee(att.leadId)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-bold transition-all cursor-pointer"
                            title={`Kick ${att.name || "student"} from session`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Kick</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Footer Summary */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>Press <strong className="text-zinc-200">U</strong> or click outside to close</span>
              <span>Total: {attendees.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Dual-Panel QR Code & Real-Time Joined Students Lobby Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="📱 Scan QR Code to Join Live Presentation"
        maxWidth="max-w-5xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: QR Code, Join Code & URL */}
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4 p-5 rounded-3xl bg-zinc-950/70 border border-white/10 shadow-inner">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative p-3.5 rounded-2xl bg-white shadow-2xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    joinUrl
                  )}`}
                  alt="Scan QR"
                  className="w-44 h-44 sm:w-52 sm:h-52 rounded-xl object-contain mx-auto"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">
                Session Join Code
              </span>
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-violet-300 font-mono tracking-wider">
                {session.sessionCode}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 w-full space-y-2 text-center">
              <span className="text-[10px] text-zinc-400 font-mono block">
                Direct Join URL:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={joinUrl}
                  className="px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs font-mono text-indigo-300 w-full text-center truncate select-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                  title="Copy link to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              Students can scan this QR code or navigate directly to the link above to join.
            </p>
          </div>

          {/* Right Panel: Real-Time Joined Students List & Kick Controls */}
          <div className="lg:col-span-7 flex flex-col space-y-3 h-[420px] sm:h-[480px]">
            {/* Header / Counter & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Joined Feed ({attendees.length})</span>
                </h4>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter attendees..."
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Live Feed List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {attendees
                .filter(
                  (att: any) =>
                    !attendeeSearch ||
                    att.name?.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                    att.phone?.includes(attendeeSearch)
                )
                .length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-zinc-500">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 animate-pulse">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-zinc-300">Waiting for Students to Join</h5>
                    <p className="text-[11px] text-zinc-500 max-w-xs mt-0.5">
                      As students scan the QR code and join the presentation, they will appear here live with instant kick controls.
                    </p>
                  </div>
                </div>
              ) : (
                attendees
                  .filter(
                    (att: any) =>
                      !attendeeSearch ||
                      att.name?.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                      att.phone?.includes(attendeeSearch)
                  )
                  .map((att: any, idx: number) => {
                    const initials = att.name
                      ? att.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "ST";

                    return (
                      <div
                        key={att.leadId || idx}
                        className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-all shadow-md animate-fade-in"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar with online pulse */}
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow">
                              {initials}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                          </div>

                          {/* Student Details */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-zinc-100 truncate">
                                {att.name || "Anonymous Student"}
                              </h4>
                              {idx === attendees.length - 1 && (
                                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold shrink-0">
                                  NEW
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-zinc-400 truncate">
                              {att.phone || "No phone"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Score Badge */}
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {att.totalScore ?? 0} pts
                          </span>

                          {/* Instant Kick Button */}
                          <button
                            type="button"
                            onClick={() => handleKickAttendee(att.leadId)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                            title={`Kick ${att.name || "student"} from session`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Kick</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Bottom Controls */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                Total Live: <strong className="text-white">{attendees.length}</strong>
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setQrModalOpen(false)}
              >
                Done / Start Presentation
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
