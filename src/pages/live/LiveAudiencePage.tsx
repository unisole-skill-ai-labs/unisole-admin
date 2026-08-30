import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Users,
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Award,
  ArrowRight,
  Phone,
  User,
  GraduationCap,
  Radio,
  ExternalLink,
  Copy,
  Check,
  Crown,
  Medal,
  UserX,
} from "lucide-react";
import SlideRenderer from "../../components/presentations/SlideRenderer";

export default function LiveAudiencePage() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);

  const code = (sessionCode || "").trim().toUpperCase();

  // State
  const [session, setSession] = useState<any>(null);
  const [presentation, setPresentation] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Onboarding Form state
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [branchInput, setBranchInput] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Real-time state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [buildStep, setBuildStep] = useState(0);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [quizState, setQuizState] = useState<any>({
    isQuizActive: false,
    isAnswerRevealed: false,
    isLeaderboardActive: false,
    slideId: null,
    slideType: null,
    timeLimit: 30,
    startedAt: null,
    pollCounts: {},
    myResponse: null,
  });
  const [myScore, setMyScore] = useState(0);
  const [myRank, setMyRank] = useState<{ rank: number; totalPlayers: number } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [reactions, setReactions] = useState<{ id: string; emoji: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isKicked, setIsKicked] = useState(false);
  const [kickedMessage, setKickedMessage] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Fetch session details on mount
  useEffect(() => {
    if (!code) return;

    setIsLoadingSession(true);
    setSessionError(null);

    fetch(`${baseUrl}/api/public/presentations/sessions/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error("Presentation session not found");
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setSession(data.data.session);
          setPresentation(data.data.presentation);
          setCurrentSlideIndex(data.data.session.currentSlideIndex || 0);

          // Check if previously joined from localStorage
          const savedLead = localStorage.getItem(`unisole_lead_${code}`);
          if (savedLead) {
            try {
              const parsed = JSON.parse(savedLead);
              if (parsed?.id) {
                setLead(parsed);
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      })
      .catch((err) => {
        setSessionError(err.message || "Failed to connect to presentation");
      })
      .finally(() => {
        setIsLoadingSession(false);
      });
  }, [baseUrl, code]);

  // Connect Socket.io once lead is registered
  useEffect(() => {
    if (!code || !lead?.id) return;

    const socketUrl = baseUrl.replace(/\/+$/, "");
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.emit("audience:join", {
      sessionCode: code,
      leadId: lead.id,
      studentName: lead.name,
      phone: lead.phone,
    });

    socket.on("sync_state", (state) => {
      if (typeof state.currentSlideIndex === "number") {
        setCurrentSlideIndex(state.currentSlideIndex);
      }
      if (typeof state.buildStep === "number") {
        setBuildStep(state.buildStep);
      }
      if (typeof state.attendeeCount === "number") {
        setAttendeeCount(state.attendeeCount);
      }
      if (typeof state.myScore === "number") {
        setMyScore(state.myScore);
      }
      if (state.myRank) {
        setMyRank(state.myRank);
      }
      if (state.leaderboard) {
        setLeaderboard(state.leaderboard);
      }
      if (state.quizState) {
        setQuizState(state.quizState);
        if (state.quizState.myResponse) {
          setSelectedOption(state.quizState.myResponse.optionIndex);
          setIsSubmitted(true);
        }
      }
    });

    socket.on("attendee_count", ({ count }) => {
      setAttendeeCount(count);
    });

    socket.on("slide_updated", ({ slideIndex, buildStep: bStep, quizState: qState }) => {
      setCurrentSlideIndex(slideIndex);
      if (typeof bStep === "number") {
        setBuildStep(bStep);
      } else {
        setBuildStep(0);
      }
      setSelectedOption(null);
      setIsSubmitted(false);
      if (qState) setQuizState(qState);
    });

    socket.on("slides_reloaded", ({ slides: updatedSlides, currentSlideIndex: sIdx, buildStep: bStep }) => {
      if (updatedSlides) {
        setPresentation((prev: any) => ({ ...prev, slides: updatedSlides }));
      }
      if (typeof sIdx === "number") setCurrentSlideIndex(sIdx);
      if (typeof bStep === "number") setBuildStep(bStep);
    });

    socket.on("quiz_started", (qData) => {
      setSelectedOption(null);
      setIsSubmitted(false);
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
        myResponse: null,
      }));
    });

    socket.on("live_poll_update", ({ pollCounts }) => {
      setQuizState((prev: any) => ({
        ...prev,
        pollCounts: pollCounts || prev.pollCounts,
      }));
    });

    socket.on("response_confirmed", ({ pointsEarned, totalScore }) => {
      setIsSubmitted(true);
      setMyScore(totalScore);
      if (pointsEarned > 0) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
        });
      }
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
        const myIndex = data.leaderboard.findIndex(
          (p: any) => p.leadId === lead.id
        );
        if (myIndex !== -1) {
          setMyRank({
            rank: myIndex + 1,
            totalPlayers: data.leaderboard.length,
          });
        }
      }
    });

    socket.on("leaderboard_shown", ({ leaderboard: lb }) => {
      setQuizState((prev: any) => ({
        ...prev,
        isLeaderboardActive: true,
      }));
      if (lb) {
        setLeaderboard(lb);
        const myIndex = lb.findIndex((p: any) => p.leadId === lead.id);
        if (myIndex !== -1) {
          setMyRank({ rank: myIndex + 1, totalPlayers: lb.length });
        }
      }
    });

    socket.on("audience:kicked", ({ message }: { message: string }) => {
      setIsKicked(true);
      setKickedMessage(message || "You have been removed from this live presentation by the host.");
      socket.disconnect();
    });

    socket.on("reaction_pulse", ({ emoji, id }) => {
      setReactions((prev) => [...prev.slice(-10), { id, emoji }]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2000);
    });

    return () => {
      socket.disconnect();
    };
  }, [baseUrl, code, lead?.id, lead?.name, lead?.phone]);

  // Quiz timer
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

  // Handle Fast-Pass Onboarding Submit
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !phoneInput.trim()) return;

    setIsJoining(true);
    setJoinError(null);

    try {
      const res = await fetch(
        `${baseUrl}/api/public/presentations/sessions/${code}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameInput.trim(),
            phone: phoneInput.trim(),
            branch: branchInput.trim() || undefined,
            yearOfStudy: yearInput.trim() || undefined,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to join session");
      }

      if (data.data?.lead) {
        setLead(data.data.lead);
        localStorage.setItem(
          `unisole_lead_${code}`,
          JSON.stringify(data.data.lead)
        );
      }
    } catch (err: any) {
      setJoinError(err.message || "Failed to join presentation");
    } finally {
      setIsJoining(false);
    }
  };

  // Submit Poll or Quiz Option
  const handleSelectOption = (index: number) => {
    if (isSubmitted || !quizState.isQuizActive || !currentSlide) return;

    setSelectedOption(index);
    setIsSubmitted(true);

    const isCorrect =
      currentSlide.type === "QUIZ"
        ? currentSlide.options?.[index]?.isCorrect
        : undefined;

    socketRef.current?.emit("audience:submit_response", {
      sessionCode: code,
      leadId: lead.id,
      slideId: currentSlide.id,
      slideType: currentSlide.type,
      optionIndex: index,
      isCorrect,
    });
  };

  // Send Floating Reaction
  const handleSendReaction = (emoji: string) => {
    socketRef.current?.emit("audience:reaction", {
      sessionCode: code,
      emoji,
    });
  };

  const copyCoupon = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slides = (presentation?.slides as any[]) || [];
  const currentSlide = slides[currentSlideIndex] || null;

  // Loading Screen
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span className="text-xs font-mono text-zinc-400">
            Connecting to Live Presentation Arena...
          </span>
        </div>
      </div>
    );
  }

  // Kicked Screen
  if (isKicked) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-rose-500/30 text-center space-y-5 shadow-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <UserX className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Removed from Session</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {kickedMessage || "You have been removed from this live presentation by the host."}
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Link
              to="/programs"
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors text-center"
            >
              Explore Programs
            </Link>
            <Link
              to="/"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors text-center"
            >
              Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Session Not Found</h2>
          <p className="text-xs text-zinc-400">
            {sessionError || "The session code is invalid or has expired."}
          </p>
          <Link
            to="/live"
            className="inline-block px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
          >
            Enter Another Code
          </Link>
        </div>
      </div>
    );
  }

  // ==================== STAGE 1: EXPRESS ONBOARDING FORM ====================
  if (!lead) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
        {/* Glow backdrop */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between z-10 pt-2">
          <div className="flex items-center gap-2.5">
            <img
              src="https://res.cloudinary.com/hehmsemf/image/upload/f_auto,q_auto,w_64/v1785299421/Unisole_logo_new_mhqbma.png"
              alt="Unisole"
              className="w-7 h-7 rounded-lg object-contain"
            />
            <span className="font-extrabold text-sm tracking-tight text-zinc-100">
              Unisole <span className="text-indigo-400">Live</span>
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-mono font-bold text-indigo-300">
            {code}
          </span>
        </div>

        {/* Onboarding Card */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6 z-10 py-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{session.collegeName || "Live College Roadshow"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              Join Live Presentation
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Enter your details to participate in live pulse polls, answer speed quizzes, and win scholarships!
            </p>
          </div>

          <form
            onSubmit={handleOnboardingSubmit}
            className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-4"
          >
            {joinError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {joinError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Your Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Mobile Number *</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl bg-zinc-800 border border-r-0 border-zinc-800 text-xs font-mono text-zinc-400">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) =>
                    setPhoneInput(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="9876543210"
                  className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 rounded-r-xl text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                  Branch / Major
                </label>
                <input
                  type="text"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  placeholder="e.g. CSE / IT / ECE"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                  Year of Study
                </label>
                <input
                  type="text"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  placeholder="e.g. 2nd / 3rd Year"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isJoining || !nameInput.trim() || !phoneInput.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>{isJoining ? "Entering Live Arena..." : "Enter Live Arena"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-zinc-500 z-10 pb-2">
          Powered by Unisole EdTech Engine • unisole.org
        </div>
      </div>
    );
  }

  // ==================== STAGE 2: LIVE AUDIENCE PRESENTATION ARENA ====================
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Floating Reaction Animation on Mobile */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-20 text-3xl animate-float-reaction"
            style={{ left: `${20 + Math.random() * 60}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Mobile Status Header */}
      <header className="px-4 py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black tracking-tight text-zinc-100">
              {lead.name}
            </span>
          </div>

          <span className="hidden sm:inline-block text-zinc-600">|</span>

          <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400">
            {session.collegeName || "Unisole Campus Presentation"}
          </span>
        </div>

        {/* Live Score, Rank Badges & Slide Progress */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[11px] font-mono font-bold">
            Slide {currentSlideIndex + 1}/{slides.length}
          </div>

          <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{myScore} pts</span>
          </div>

          {myRank && (
            <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3 text-indigo-400" />
              <span>#{myRank.rank}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Interactive Stage Canvas */}
      <main className="flex-1 relative flex items-center justify-center p-4 sm:p-8 lg:p-12 z-20 overflow-y-auto w-full">
        {/* Glow ambient lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Live Leaderboard Podium Overlay if Active */}
        {quizState.isLeaderboardActive ? (
          <div className="w-full max-w-4xl mx-auto space-y-6 pt-2 animate-fade-in text-center z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-7 h-7 text-amber-400" />
              <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400">
                Live Leaderboard Podium
              </h2>
            </div>

            {/* Personal Student Rank Banner */}
            {myRank && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-900/70 to-violet-900/70 border border-indigo-500/40 text-center max-w-md mx-auto space-y-1 shadow-xl">
                <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                  Your Live Standing
                </span>
                <div className="text-3xl font-black text-amber-300">
                  Rank #{myRank.rank}{" "}
                  <span className="text-sm text-zinc-400 font-normal">
                    of {myRank.totalPlayers}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-indigo-200">
                  Total Score: {myScore} pts
                </div>
              </div>
            )}

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto items-end pt-4">
              {/* Rank 2 */}
              <div className="p-3.5 rounded-3xl bg-white/10 border border-slate-400/40 text-center space-y-1.5 order-1 shadow-xl">
                <Medal className="w-6 h-6 text-slate-300 mx-auto" />
                <div className="font-extrabold text-xs sm:text-sm text-zinc-100 truncate">
                  {leaderboard[1]?.name || "—"}
                </div>
                <div className="text-[10px] font-mono font-bold text-indigo-300">
                  {leaderboard[1]?.score || 0} pts
                </div>
                <div className="h-12 bg-slate-400/20 rounded-xl flex items-center justify-center font-black text-lg text-slate-300">
                  #2
                </div>
              </div>

              {/* Rank 1 */}
              <div className="p-4 rounded-3xl bg-gradient-to-b from-amber-500/30 to-amber-500/10 border border-amber-400/60 text-center space-y-2 order-2 shadow-2xl scale-105">
                <Crown className="w-8 h-8 text-amber-300 mx-auto animate-bounce" />
                <div className="font-black text-sm sm:text-base text-amber-200 truncate">
                  {leaderboard[0]?.name || "—"}
                </div>
                <div className="text-xs font-mono font-black text-amber-400">
                  {leaderboard[0]?.score || 0} pts
                </div>
                <div className="h-16 bg-amber-500/30 rounded-xl flex items-center justify-center font-black text-xl text-amber-300">
                  #1
                </div>
              </div>

              {/* Rank 3 */}
              <div className="p-3.5 rounded-3xl bg-white/10 border border-amber-700/40 text-center space-y-1.5 order-3 shadow-xl">
                <Award className="w-6 h-6 text-amber-600 mx-auto" />
                <div className="font-extrabold text-xs sm:text-sm text-zinc-100 truncate">
                  {leaderboard[2]?.name || "—"}
                </div>
                <div className="text-[10px] font-mono font-bold text-indigo-300">
                  {leaderboard[2]?.score || 0} pts
                </div>
                <div className="h-10 bg-amber-700/20 rounded-xl flex items-center justify-center font-black text-sm text-amber-600">
                  #3
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Render Active Slide with Progressive Step Animations */
          <div className="w-full max-w-5xl mx-auto z-10">
            <SlideRenderer
              key={`slide-${currentSlideIndex}`}
              slide={currentSlide}
              buildStep={buildStep}
              presentationTitle={presentation?.title}
              isProjector={false}
              quizState={quizState}
              remainingTime={remainingTime}
              leaderboard={leaderboard}
              onSelectOption={handleSelectOption}
              selectedOption={selectedOption}
              isSubmitted={isSubmitted}
            />
          </div>
        )}
      </main>

      {/* Floating Bottom Emoji Reaction Bar */}
      <footer className="p-3 bg-zinc-900/80 backdrop-blur-xl border-t border-white/10 z-30 sticky bottom-0">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {["🔥", "👏", "🚀", "❤️", "💡"].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSendReaction(emoji)}
              className="p-2 text-2xl hover:scale-125 active:scale-90 transition-transform cursor-pointer"
              title={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
