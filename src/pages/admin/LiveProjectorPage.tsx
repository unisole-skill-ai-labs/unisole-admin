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
} from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

export default function LiveProjectorPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const token = useSelector((s: any) => s.auth.token);

  const [session, setSession] = useState<any>(null);
  const [presentation, setPresentation] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [attendeeCount, setAttendeeCount] = useState(0);
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

  const socketRef = useRef<Socket | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<any>(null);

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
      if (typeof state.attendeeCount === "number") {
        setAttendeeCount(state.attendeeCount);
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

    socket.on("slide_updated", ({ slideIndex, quizState }) => {
      setCurrentSlideIndex(slideIndex);
      if (quizState) setQuizState(quizState);
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

  // Handlers for Presenter Actions
  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0 && socketRef.current && session?.sessionCode) {
      const target = currentSlideIndex - 1;
      setCurrentSlideIndex(target);
      socketRef.current.emit("admin:change_slide", {
        sessionCode: session.sessionCode,
        slideIndex: target,
      });
    }
  }, [currentSlideIndex, session?.sessionCode]);

  const handleNextSlide = useCallback(() => {
    if (
      currentSlideIndex < slides.length - 1 &&
      socketRef.current &&
      session?.sessionCode
    ) {
      const target = currentSlideIndex + 1;
      setCurrentSlideIndex(target);
      socketRef.current.emit("admin:change_slide", {
        sessionCode: session.sessionCode,
        slideIndex: target,
      });
    }
  }, [currentSlideIndex, slides.length, session?.sessionCode]);

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

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        handleStartQuestion();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRevealAnswer();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        handleShowLeaderboard();
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
    handleNextSlide,
    handlePrevSlide,
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

  const joinUrl = `https://unisole.in/live/${session.sessionCode}`;

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
      <header className="px-6 py-4 flex items-center justify-between bg-zinc-950/60 backdrop-blur-md border-b border-white/10 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/presentations")}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Exit Projector"
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
        </div>

        {/* Center: Live Audience Connection Badge */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Users className="w-3.5 h-3.5" />
            <span>{attendeeCount} Students Live</span>
          </div>

          <button
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-zinc-200 transition-colors"
            title="Show Join QR Code (M)"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan to Join</span>
          </button>
        </div>

        {/* Right: Slide Counter & Fullscreen */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-zinc-400">
            {currentSlideIndex + 1} / {slides.length}
          </span>

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
      <main className="flex-1 relative flex items-center justify-center p-6 sm:p-12 z-20">
        {/* Glow ambient lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {currentSlide && (
          <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in text-center sm:text-left">
            {/* Top Slide Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentSlide.badge || presentation.title}</span>
            </div>

            {/* Slide Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            {currentSlide.subtitle && (
              <p className="text-base sm:text-xl text-zinc-300 max-w-3xl leading-relaxed">
                {currentSlide.subtitle}
              </p>
            )}

            {/* Slide Type: CONTENT (Bullets) */}
            {currentSlide.type === "CONTENT" &&
              Array.isArray(currentSlide.bullets) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {currentSlide.bullets.map((bullet: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-4 shadow-lg"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm sm:text-base text-zinc-200 font-medium leading-relaxed">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            {/* Slide Type: STATS */}
            {currentSlide.type === "STATS" &&
              Array.isArray(currentSlide.stats) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                  {currentSlide.stats.map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-md text-center shadow-xl"
                    >
                      <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">
                        {st.value}
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-zinc-300 mt-2">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Slide Type: POLL */}
            {currentSlide.type === "POLL" && (
              <div className="space-y-6 pt-4">
                <div className="text-xl sm:text-2xl font-bold text-cyan-300 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>{currentSlide.question || "Live Audience Poll"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      return (
                        <div
                          key={optIdx}
                          className="relative p-5 rounded-2xl bg-white/5 border border-cyan-500/30 overflow-hidden shadow-lg"
                        >
                          {/* Animated Fill Bar */}
                          <div
                            className="absolute inset-y-0 left-0 bg-cyan-500/20 transition-all duration-700 ease-out"
                            style={{ width: `${percent}%` }}
                          />

                          <div className="relative flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="text-base sm:text-lg font-bold text-white">
                                {opt}
                              </span>
                            </div>
                            <span className="text-lg font-mono font-black text-cyan-400">
                              {percent}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Slide Type: QUIZ */}
            {currentSlide.type === "QUIZ" && !quizState.isLeaderboardActive && (
              <div className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-xl sm:text-2xl font-bold text-amber-300 flex items-center gap-2">
                    <Flame className="w-6 h-6 text-amber-400" />
                    <span>{currentSlide.question}</span>
                  </div>

                  {/* Circular / Box Countdown Timer */}
                  {remainingTime !== null && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-xl shadow-lg">
                      <Clock className="w-5 h-5 animate-spin" />
                      <span>{remainingTime}s remaining</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(currentSlide.options || []).map(
                    (opt: any, optIdx: number) => {
                      const colors = [
                        "bg-rose-500/20 border-rose-500/40 text-rose-100",
                        "bg-blue-500/20 border-blue-500/40 text-blue-100",
                        "bg-amber-500/20 border-amber-500/40 text-amber-100",
                        "bg-emerald-500/20 border-emerald-500/40 text-emerald-100",
                      ];
                      const isCorrect = opt.isCorrect;
                      const isRevealed = quizState.isAnswerRevealed;

                      return (
                        <div
                          key={optIdx}
                          className={`p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between gap-3 shadow-lg ${
                            colors[optIdx % 4]
                          } ${
                            isRevealed && isCorrect
                              ? "ring-4 ring-emerald-400 scale-102 bg-emerald-600/40"
                              : isRevealed
                              ? "opacity-40"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-base sm:text-lg font-bold">
                              {opt.text}
                            </span>
                          </div>

                          {isRevealed && isCorrect && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md">
                              <CheckCircle2 className="w-4 h-4" /> Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Quiz Leaderboard Stage Podium */}
            {quizState.isLeaderboardActive && (
              <div className="space-y-6 pt-4 animate-fade-in">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Trophy className="w-8 h-8 text-amber-400" />
                  <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400">
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
                        key={p.leadId}
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
            )}

            {/* Slide Type: OFFER_CTA */}
            {currentSlide.type === "OFFER_CTA" && (
              <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 to-violet-900/60 border border-indigo-500/40 backdrop-blur-xl max-w-3xl space-y-4 shadow-2xl">
                <div className="inline-block px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                  {currentSlide.badge || "Special Roadshow Grant"}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Exclusive Student Scholarship Available Now
                </h3>
                {currentSlide.couponCode && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-zinc-300">Use Promo Code:</span>
                    <span className="px-4 py-2 rounded-xl bg-black/40 border border-amber-400/50 text-amber-300 font-mono font-black text-lg tracking-wider">
                      {currentSlide.couponCode}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Presenter Floating Remote Control Toolbar */}
      <footer className="px-6 py-4 flex items-center justify-between bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 z-30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentSlideIndex === 0}
            onClick={handlePrevSlide}
            className="text-zinc-300 hover:text-white hover:bg-white/10"
            title="Previous Slide (←)"
          >
            <ChevronLeft className="w-4 h-4 mr-1 inline" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            disabled={currentSlideIndex === slides.length - 1}
            onClick={handleNextSlide}
            className="text-zinc-300 hover:text-white hover:bg-white/10"
            title="Next Slide (→ / Space)"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 ml-1 inline" />
          </Button>
        </div>

        {/* Center: Slide Interaction Buttons */}
        <div className="flex items-center gap-2">
          {(currentSlide?.type === "POLL" || currentSlide?.type === "QUIZ") &&
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

          {currentSlide?.type === "QUIZ" &&
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

          {currentSlide?.type === "QUIZ" && (
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
          <span>[← / →] Slides</span>
          <span>[Q] Start</span>
          <span>[R] Reveal</span>
          <span>[L] Podium</span>
          <span>[F] Fullscreen</span>
        </div>
      </footer>

      {/* QR Code Enlarged Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="📱 Scan QR Code to Join Live Presentation"
      >
        <div className="text-center space-y-5 p-2">
          <div className="inline-block p-4 rounded-3xl bg-white shadow-2xl mx-auto">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                joinUrl
              )}`}
              alt="Scan QR"
              className="w-56 h-56 rounded-xl object-contain mx-auto"
            />
          </div>

          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              Join Code
            </span>
            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-wider">
              {session.sessionCode}
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            Or visit: <strong className="text-zinc-800 dark:text-zinc-200">{joinUrl}</strong>
          </p>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setQrModalOpen(false)}
            className="w-full"
          >
            Done / Return to Presentation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
