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
} from "lucide-react";

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

  const socketRef = useRef<Socket | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Redirect to main SEO portal login with return redirect to this presentation
  useEffect(() => {
    if (!code) return;

    const seoBaseUrl =
      (import.meta as any).env?.VITE_SEO_URL || "https://unisole.org";
    window.location.href = `${seoBaseUrl.replace(
      /\/+$/,
      ""
    )}/live/${code}`;
  }, [code]);

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
      if (typeof state.attendeeCount === "number") {
        setAttendeeCount(state.attendeeCount);
      }
      if (typeof state.myScore === "number") {
        setMyScore(state.myScore);
      }
      if (state.myRank) {
        setMyRank(state.myRank);
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

    socket.on("slide_updated", ({ slideIndex, quizState: qState }) => {
      setCurrentSlideIndex(slideIndex);
      setSelectedOption(null);
      setIsSubmitted(false);
      if (qState) setQuizState(qState);
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
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-black tracking-tight text-zinc-100">
            {lead.name}
          </span>
        </div>

        {/* Live Score & Rank Badges */}
        <div className="flex items-center gap-2">
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

      {/* Main Interactive Screen */}
      <main className="flex-1 flex flex-col justify-center p-4 sm:p-6 max-w-lg w-full mx-auto z-20 space-y-5">
        {currentSlide && (
          <div className="space-y-4">
            {/* Top Slide Meta */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>{session.collegeName || "Unisole Roadshow"}</span>
              <span>Slide {currentSlideIndex + 1}/{slides.length}</span>
            </div>

            {/* Slide Title */}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {currentSlide.title}
            </h2>

            {currentSlide.subtitle && (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {currentSlide.subtitle}
              </p>
            )}

            {/* CONTENT Slide Bullets */}
            {currentSlide.type === "CONTENT" &&
              Array.isArray(currentSlide.bullets) && (
                <div className="space-y-2 pt-2">
                  {currentSlide.bullets.map((b: string, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span className="text-xs text-zinc-200">{b}</span>
                    </div>
                  ))}
                </div>
              )}

            {/* STATS Slide Grid */}
            {currentSlide.type === "STATS" &&
              Array.isArray(currentSlide.stats) && (
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  {currentSlide.stats.map((st: any, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center"
                    >
                      <div className="text-lg font-black text-indigo-400">
                        {st.value}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* LIVE POLL View */}
            {currentSlide.type === "POLL" && (
              <div className="space-y-3 pt-2">
                <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{currentSlide.question || "Tap your choice below"}</span>
                </div>

                <div className="space-y-2.5">
                  {(currentSlide.options || []).map(
                    (opt: string, optIdx: number) => {
                      const count = quizState.pollCounts?.[optIdx] || 0;
                      const totalVotes = Object.values(
                        quizState.pollCounts || {}
                      ).reduce((a: any, b: any) => a + b, 0) as number;
                      const percent =
                        totalVotes > 0
                          ? Math.round((count / totalVotes) * 100)
                          : 0;
                      const isSelected = selectedOption === optIdx;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={!quizState.isQuizActive && !isSubmitted}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`relative w-full p-4 rounded-2xl border text-left transition-all overflow-hidden cursor-pointer active:scale-98 ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-950/60 ring-2 ring-cyan-400 shadow-lg"
                              : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-700"
                          }`}
                        >
                          {/* Live percentage fill when submitted */}
                          {isSubmitted && (
                            <div
                              className="absolute inset-y-0 left-0 bg-cyan-500/20 transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          )}

                          <div className="relative flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-white">
                                {opt}
                              </span>
                            </div>
                            {isSubmitted && (
                              <span className="font-mono font-bold text-xs text-cyan-400">
                                {percent}%
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* KAHOOT-STYLE TIMED QUIZ View */}
            {currentSlide.type === "QUIZ" && !quizState.isLeaderboardActive && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Speed Challenge</span>
                  </div>

                  {remainingTime !== null && (
                    <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{remainingTime}s</span>
                    </div>
                  )}
                </div>

                <p className="text-sm font-bold text-zinc-100">
                  {currentSlide.question}
                </p>

                {/* 4 Colored Option Cards */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {(currentSlide.options || []).map(
                    (opt: any, optIdx: number) => {
                      const colors = [
                        "bg-rose-600/30 border-rose-500/50 hover:bg-rose-600/40 text-rose-100",
                        "bg-blue-600/30 border-blue-500/50 hover:bg-blue-600/40 text-blue-100",
                        "bg-amber-600/30 border-amber-500/50 hover:bg-amber-600/40 text-amber-100",
                        "bg-emerald-600/30 border-emerald-500/50 hover:bg-emerald-600/40 text-emerald-100",
                      ];
                      const isSelected = selectedOption === optIdx;
                      const isRevealed = quizState.isAnswerRevealed;
                      const isCorrect = opt.isCorrect;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={!quizState.isQuizActive || isSubmitted}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[90px] text-left transition-all active:scale-95 cursor-pointer ${
                            colors[optIdx % 4]
                          } ${
                            isSelected
                              ? "ring-4 ring-white shadow-xl scale-102"
                              : isSubmitted
                              ? "opacity-60"
                              : ""
                          } ${
                            isRevealed && isCorrect
                              ? "ring-4 ring-emerald-400 bg-emerald-600/60 opacity-100"
                              : ""
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-xs sm:text-sm font-bold mt-2">
                            {opt.text}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                {isSubmitted && !quizState.isAnswerRevealed && (
                  <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-center text-xs font-bold text-indigo-300">
                    ⚡ Answer locked in! Waiting for presenter reveal...
                  </div>
                )}
              </div>
            )}

            {/* LEADERBOARD Podium View on Mobile */}
            {quizState.isLeaderboardActive && (
              <div className="space-y-4 pt-2 text-center animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Live Roadshow Standings</span>
                </div>

                {myRank && (
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900/60 to-violet-900/60 border border-indigo-500/40 text-center space-y-1 shadow-xl">
                    <span className="text-xs text-indigo-300 font-medium">
                      Your Position
                    </span>
                    <div className="text-3xl font-black text-amber-300">
                      Rank #{myRank.rank}
                    </div>
                    <div className="text-xs font-mono text-zinc-300">
                      Score: {myScore} points
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OFFER CTA Screen */}
            {currentSlide.type === "OFFER_CTA" && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-zinc-900 to-violet-950 border border-indigo-500/40 space-y-4 shadow-2xl">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                  {currentSlide.badge || "Campus Roadshow Special"}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {currentSlide.title}
                </h3>
                <p className="text-xs text-zinc-300">
                  {currentSlide.subtitle || "Claim your scholarship grant for Unisole programs today!"}
                </p>

                {currentSlide.couponCode && (
                  <div className="flex items-center gap-2 p-2 bg-black/40 rounded-xl border border-amber-400/30 font-mono text-xs text-amber-300">
                    <span className="font-bold flex-1">{currentSlide.couponCode}</span>
                    <button
                      onClick={() => copyCoupon(currentSlide.couponCode)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                )}

                <a
                  href={currentSlide.targetUrl || "https://unisole.in/programs"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg text-center flex items-center justify-center gap-2"
                >
                  <span>{currentSlide.buttonText || "Explore Unisole Programs"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
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
