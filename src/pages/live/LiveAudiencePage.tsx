import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  ArrowLeft,
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
  Maximize2,
  Minimize2,
  RotateCcw,
  Smartphone,
  LogOut,
  QrCode,
  Share2,
  X,
  Lock,
  ShieldCheck,
  Loader2,
  Zap,
} from "lucide-react";
import { setCredentials } from "../../store/auth-slice";
import { getUser, isAuthenticated, setAuthSession, logout } from "../../utils/auth";
import SlideRenderer from "../../components/presentations/SlideRenderer";
import AutoFitSlideStage from "../../components/presentations/AutoFitSlideStage";
import BranchDistributionPieChart, {
  BranchStats,
  getBranchColorStyle,
} from "../../components/presentations/BranchDistributionPieChart";

export default function LiveAudiencePage() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const dispatch = useDispatch();
  const settingsBaseUrl = useSelector((s: any) => s?.settings?.baseUrl);
  const baseUrl = (
    settingsBaseUrl ||
    (import.meta as any).env?.VITE_API_URL ||
    (typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
      ? "https://api.unisole.org"
      : "http://localhost:3000")
  ).replace(/\/+$/, "");

  const code = (sessionCode || "").trim().toUpperCase();

  // State
  const [session, setSession] = useState<any>(null);
  const [presentation, setPresentation] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Authentication & Onboarding Form state
  const [authStep, setAuthStep] = useState<"PHONE" | "PROFILE_SETUP">("PHONE");
  const [authPhone, setAuthPhone] = useState("");
  const [authName, setAuthName] = useState("");
  const [authBranch, setAuthBranch] = useState("");
  const [authYear, setAuthYear] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Real-time presentation state
  const [isPresentationStarted, setIsPresentationStarted] = useState(false);
  const [branchStats, setBranchStats] = useState<BranchStats | null>(null);
  const [attendeesList, setAttendeesList] = useState<any[]>([]);
  const [branchSelectorOpen, setBranchSelectorOpen] = useState(false);

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
  const [instantPollState, setInstantPollState] = useState<{
    isActive: boolean;
    pollId: string | null;
    question: string;
    options: string[];
    startedAt: number | null;
    timeLimit: number;
    counts: Record<number, number>;
    totalVotes: number;
    myVote: number | null;
    isSubmitted: boolean;
    remainingTime: number | null;
  }>({
    isActive: false,
    pollId: null,
    question: "Quick Pulse Check",
    options: ["YES", "NO"],
    startedAt: null,
    timeLimit: 20,
    counts: { 0: 0, 1: 0 },
    totalVotes: 0,
    myVote: null,
    isSubmitted: false,
    remainingTime: null,
  });
  const [myScore, setMyScore] = useState(0);
  const [myRank, setMyRank] = useState<{ rank: number; totalPlayers: number } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [reactions, setReactions] = useState<{ id: string; emoji: string }[]>([]);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [isSpamPenalized, setIsSpamPenalized] = useState(false);
  const penaltyUntilRef = useRef<number>(0);
  const [copied, setCopied] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isKicked, setIsKicked] = useState(false);
  const [kickedMessage, setKickedMessage] = useState("");
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [peerQrModalOpen, setPeerQrModalOpen] = useState(false);
  const [peerCopied, setPeerCopied] = useState(false);

  const handlePeerCopy = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const seoBase = (import.meta as any).env?.VITE_SEO_URL || "https://unisole.org";
    const url = session?.joinUrl || `${seoBase.replace(/\/+$/, "")}/live/${code}`;
    navigator.clipboard.writeText(url);
    setPeerCopied(true);
    setTimeout(() => setPeerCopied(false), 2500);
  }, [session, code]);

  const handleExitShow = () => {
    const seoUrl = (import.meta as any).env?.VITE_SEO_URL || "https://unisole.org";
    window.location.href = `${seoUrl.replace(/\/+$/, "")}/pathways`;
  };

  // Mode switching & Fullscreen state
  const [isFullscreenLandscape, setIsFullscreenLandscape] = useState(false);
  const [isNativeLandscape, setIsNativeLandscape] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const instantPollTimerRef = useRef<any>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  // Monitor physical orientation and fullscreen changes
  useEffect(() => {
    const handleOrientation = () => {
      const isLand =
        window.innerWidth > window.innerHeight ||
        (window.screen.orientation &&
          window.screen.orientation.type.startsWith("landscape"));
      setIsNativeLandscape(!!isLand);
    };

    handleOrientation();
    window.addEventListener("resize", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);

    const handleFsChange = () => {
      const isFs = !!(
        document.fullscreenElement || (document as any).webkitFullscreenElement
      );
      if (!isFs && isFullscreenLandscape && !window.matchMedia("(orientation: landscape)").matches) {
        setIsFullscreenLandscape(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);

    return () => {
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, [isFullscreenLandscape]);

  // Toggle Fullscreen Landscape Mode
  const toggleFullscreenLandscape = async () => {
    if (!isFullscreenLandscape) {
      const elem = arenaRef.current || document.documentElement;
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        }
      } catch (err) {
        // Fallback to simulated CSS landscape
      }

      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock("landscape");
        }
      } catch (err) {
        // Orientation lock not supported
      }

      setIsFullscreenLandscape(true);
    } else {
      try {
        if (
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement
        ) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          }
        }
      } catch (err) {}

      try {
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch (err) {}

      setIsFullscreenLandscape(false);
    }
  };

  // Helper to join session using authenticated user
  const joinWithUser = useCallback(
    async (currentUser: any) => {
      if (!code || !currentUser?.phone) return;
      setIsJoining(true);
      setJoinError(null);
      try {
        const res = await fetch(
          `${baseUrl}/api/public/presentations/sessions/${code}/join`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: currentUser.name || (currentUser.phone ? `Student ${currentUser.phone.slice(-4)}` : "Student"),
              phone: currentUser.phone,
              branch: currentUser.branch || undefined,
              userId: currentUser.id,
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
    },
    [baseUrl, code]
  );

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
                return;
              }
            } catch (e) {
              console.error(e);
            }
          }

          // If user is already authenticated in Unisole, auto-join session
          if (isAuthenticated()) {
            const currentUser = getUser();
            if (currentUser?.phone) {
              joinWithUser(currentUser);
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
  }, [baseUrl, code, joinWithUser]);

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
      branch: lead.branch,
      yearOfStudy: lead.yearOfStudy,
    });

    socket.on("sync_state", (state) => {
      if (typeof state.currentSlideIndex === "number") {
        setCurrentSlideIndex(state.currentSlideIndex);
      }
      if (typeof state.isPresentationStarted === "boolean") {
        setIsPresentationStarted(state.isPresentationStarted);
      }
      if (typeof state.buildStep === "number") {
        setBuildStep(state.buildStep);
      }
      if (typeof state.attendeeCount === "number") {
        setAttendeeCount(state.attendeeCount);
      }
      if (Array.isArray(state.attendees)) {
        setAttendeesList(state.attendees);
      }
      if (state.branchStats) {
        setBranchStats(state.branchStats);
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
      if (state.instantPoll) {
        setInstantPollState({
          isActive: state.instantPoll.isActive,
          pollId: state.instantPoll.pollId,
          question: state.instantPoll.question || "Quick Pulse Check",
          options: state.instantPoll.options || ["YES", "NO"],
          startedAt: state.instantPoll.startedAt,
          timeLimit: state.instantPoll.timeLimit || 20,
          counts: state.instantPoll.counts || { 0: 0, 1: 0 },
          totalVotes: state.instantPoll.totalVotes || 0,
          myVote: typeof state.instantPoll.myVote === "number" ? state.instantPoll.myVote : null,
          isSubmitted: typeof state.instantPoll.myVote === "number",
          remainingTime: state.instantPoll.startedAt
            ? Math.max(0, state.instantPoll.timeLimit - Math.floor((Date.now() - state.instantPoll.startedAt) / 1000))
            : null,
        });
      }
    });

    socket.on("attendee_count", ({ count }) => {
      setAttendeeCount(count);
    });

    socket.on("attendee_joined", ({ attendees: list, count, branchStats: bStats }) => {
      setAttendeeCount(count);
      if (list) setAttendeesList(list);
      if (bStats) setBranchStats(bStats);
    });

    socket.on("attendee_left", ({ attendees: list, count, branchStats: bStats }) => {
      setAttendeeCount(count);
      if (list) setAttendeesList(list);
      if (bStats) setBranchStats(bStats);
    });

    socket.on("attendee_kicked", ({ attendees: list, count, branchStats: bStats }) => {
      setAttendeeCount(count);
      if (list) setAttendeesList(list);
      if (bStats) setBranchStats(bStats);
    });

    socket.on("branch_distribution_updated", ({ branchStats: bStats, attendees: list }) => {
      if (bStats) setBranchStats(bStats);
      if (list) setAttendeesList(list);
    });

    socket.on("presentation_started", ({ isPresentationStarted: started, currentSlideIndex: sIdx, buildStep: bStep }) => {
      setIsPresentationStarted(true);
      if (typeof sIdx === "number") setCurrentSlideIndex(sIdx);
      if (typeof bStep === "number") setBuildStep(bStep);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    });

    socket.on("lobby_mode_entered", (data) => {
      setIsPresentationStarted(false);
      if (data.branchStats) setBranchStats(data.branchStats);
      if (data.attendees) setAttendeesList(data.attendees);
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

      // Immediately clear and close instant poll on slide change
      setInstantPollState({
        isActive: false,
        pollId: null,
        question: "YES or NO?",
        options: ["YES", "NO"],
        startedAt: null,
        timeLimit: 20,
        counts: { 0: 0, 1: 0 },
        totalVotes: 0,
        myVote: null,
        isSubmitted: false,
        remainingTime: null,
      });
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

    // ==================== INSTANT PULSE POLL LISTENERS ====================
    socket.on("instant_poll_started", (data) => {
      setInstantPollState({
        isActive: true,
        pollId: data.pollId,
        question: data.question || "YES or NO?",
        options: data.options || ["YES", "NO"],
        startedAt: data.startedAt,
        timeLimit: data.timeLimit || 20,
        counts: data.counts || { 0: 0, 1: 0 },
        totalVotes: data.totalVotes || 0,
        myVote: null,
        isSubmitted: false,
        remainingTime: data.timeLimit || 20,
      });
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.3 },
      });
    });

    socket.on("instant_poll_update", ({ pollId, counts, totalVotes }) => {
      setInstantPollState((prev) => {
        if (!prev.isActive && !prev.pollId) return prev;
        return {
          ...prev,
          counts: counts || prev.counts,
          totalVotes: typeof totalVotes === "number" ? totalVotes : prev.totalVotes,
        };
      });
    });

    socket.on("instant_poll_confirmed", ({ optionIndex }) => {
      setInstantPollState((prev) => ({
        ...prev,
        myVote: optionIndex,
        isSubmitted: true,
      }));
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    });

    socket.on("instant_poll_ended", ({ counts, totalVotes }) => {
      setInstantPollState((prev) => ({
        ...prev,
        counts: counts || prev.counts,
        totalVotes: typeof totalVotes === "number" ? totalVotes : prev.totalVotes,
        remainingTime: 0,
      }));
      // Auto-remove poll popup from screen after 2.5s
      setTimeout(() => {
        setInstantPollState({
          isActive: false,
          pollId: null,
          question: "YES or NO?",
          options: ["YES", "NO"],
          startedAt: null,
          timeLimit: 20,
          counts: { 0: 0, 1: 0 },
          totalVotes: 0,
          myVote: null,
          isSubmitted: false,
          remainingTime: null,
        });
      }, 2500);
    });

    socket.on("audience:kicked", ({ message }: { message: string }) => {
      setIsKicked(true);
      setKickedMessage(message || "You have been removed from this live presentation by the host.");
      socket.disconnect();
    });

    socket.on("session_ended", () => {
      setIsSessionEnded(true);
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    });

    socket.on("reaction_pulse", ({ emoji, id }) => {
      setReactions((prev) => [...prev.slice(-4), { id, emoji }]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 1800);
    });

    return () => {
      socket.disconnect();
    };
  }, [baseUrl, code, lead?.id, lead?.name, lead?.phone]);

  // Instant Poll countdown timer
  useEffect(() => {
    if (
      instantPollState.isActive &&
      instantPollState.startedAt &&
      instantPollState.timeLimit
    ) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - instantPollState.startedAt!) / 1000);
        const remaining = Math.max(0, instantPollState.timeLimit - elapsed);
        setInstantPollState((prev) => ({ ...prev, remainingTime: remaining }));

        if (remaining <= 0) {
          clearInterval(instantPollTimerRef.current);
          // Auto remove after 2.5s
          setTimeout(() => {
            setInstantPollState({
              isActive: false,
              pollId: null,
              question: "YES or NO?",
              options: ["YES", "NO"],
              startedAt: null,
              timeLimit: 20,
              counts: { 0: 0, 1: 0 },
              totalVotes: 0,
              myVote: null,
              isSubmitted: false,
              remainingTime: null,
            });
          }, 2500);
        }
      };

      updateTimer();
      instantPollTimerRef.current = setInterval(updateTimer, 500);
      return () => clearInterval(instantPollTimerRef.current);
    }
  }, [instantPollState.isActive, instantPollState.startedAt, instantPollState.timeLimit]);

  // Submit Instant Poll vote
  const handleSubmitInstantPollVote = useCallback(
    (optionIndex: number) => {
      if (
        !instantPollState.isActive ||
        !instantPollState.pollId ||
        instantPollState.isSubmitted ||
        !lead?.id ||
        !socketRef.current
      ) {
        return;
      }

      socketRef.current.emit("audience:submit_instant_poll", {
        sessionCode: code,
        leadId: lead.id,
        pollId: instantPollState.pollId,
        optionIndex,
      });
    },
    [instantPollState.isActive, instantPollState.pollId, instantPollState.isSubmitted, lead?.id, code]
  );

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

  // Handle Step 1: Mobile Phone check / quick login
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanPhone = authPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setAuthError("Please enter a valid 10-digit mobile number");
      return;
    }

    setAuthLoading(true);
    try {
      // Check user existence
      const checkRes = await fetch(`${baseUrl}/api/auth/check-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      }).then((r) => r.json());

      if (checkRes.exists && checkRes.user) {
        // Existing user -> log in immediately
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: cleanPhone,
            signupSource: "SESSION_QR",
            sessionCode: code,
          }),
        }).then((r) => r.json());

        if (!loginRes.user || (!loginRes.token && !loginRes.accessToken)) {
          throw new Error(loginRes.message || "Login failed");
        }

        const token = loginRes.token || loginRes.accessToken;
        const user = loginRes.user;

        setAuthSession({ token, user });
        dispatch(setCredentials({ token, user }));

        // Now auto-join the live session
        await joinWithUser(user);
      } else {
        // New student -> Prompt for Profile Setup (Name, Branch, Year)
        setAuthStep("PROFILE_SETUP");
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Step 2: New Student Registration and Session Join
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanPhone = authPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setAuthError("Please enter a valid 10-digit mobile number");
      setAuthStep("PHONE");
      return;
    }
    if (!authName.trim()) {
      setAuthError("Please enter your full name");
      return;
    }

    setAuthLoading(true);
    try {
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          name: authName.trim(),
          collegeName: session?.collegeName,
          collegeId: session?.collegeId,
          branch: authBranch.trim() || undefined,
          signupSource: "SESSION_QR",
          sessionCode: code,
        }),
      }).then((r) => r.json());

      if (!loginRes.user || (!loginRes.token && !loginRes.accessToken)) {
        throw new Error(loginRes.message || "Registration failed");
      }

      const token = loginRes.token || loginRes.accessToken;
      const user = loginRes.user;

      setAuthSession({ token, user });
      dispatch(setCredentials({ token, user }));

      // Join presentation session
      const joinRes = await fetch(
        `${baseUrl}/api/public/presentations/sessions/${code}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName.trim(),
            phone: cleanPhone,
            branch: authBranch.trim() || undefined,
            yearOfStudy: authYear.trim() || undefined,
            userId: user.id,
          }),
        }
      );

      const joinData = await joinRes.json();
      if (!joinRes.ok) {
        throw new Error(joinData.message || "Failed to enter presentation");
      }

      if (joinData.data?.lead) {
        setLead(joinData.data.lead);
        localStorage.setItem(
          `unisole_lead_${code}`,
          JSON.stringify(joinData.data.lead)
        );
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to complete signup & enter arena");
    } finally {
      setAuthLoading(false);
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

  // Progressive Anti-Spam Reaction Cooldown (5s base, 10s penalty)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remainingMs = Math.max(0, penaltyUntilRef.current - now);
      const remainingSec = Math.ceil(remainingMs / 1000);
      setCooldownRemaining(remainingSec);
      if (remainingMs === 0) {
        setIsSpamPenalized(false);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Send Floating Reaction with 5s standard cooldown and 10s spam escalation
  const handleSendReaction = (emoji: string) => {
    const now = Date.now();

    // If student clicks while locked in cooldown -> PENALIZE TO 10 SECONDS!
    if (now < penaltyUntilRef.current) {
      penaltyUntilRef.current = now + 10000;
      setIsSpamPenalized(true);
      setCooldownRemaining(10);
      return;
    }

    // Normal reaction: lock for standard 5s
    penaltyUntilRef.current = now + 5000;
    setCooldownRemaining(5);
    setIsSpamPenalized(false);

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

  // ==================== STAGE 1: MANDATORY STUDENT LOGIN & AUTHENTICATION ====================
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
            CODE: {code}
          </span>
        </div>

        {/* Login & Onboarding Card */}
        <div className="my-auto max-w-md w-full mx-auto space-y-5 z-10 py-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{session.collegeName || "Live College Roadshow"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              {authStep === "PHONE" ? "Login to Join Session" : "Complete Student Profile"}
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              {authStep === "PHONE"
                ? "Enter your mobile number to authenticate, participate in live pulse polls, answer speed quizzes, and win scholarships!"
                : "Just a few quick details to set up your student badge for this live campus presentation."}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-4">
            {(authError || joinError) && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{authError || joinError}</span>
              </div>
            )}

            {authStep === "PHONE" ? (
              /* STEP 1: Mobile Phone Number Input */
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
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
                      autoFocus
                      maxLength={10}
                      value={authPhone}
                      onChange={(e) =>
                        setAuthPhone(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="9876543210"
                      className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 rounded-r-xl text-sm sm:text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-indigo-500 font-mono tracking-wider"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Instant Verification: Existing students log in instantly, new learners are registered automatically.</span>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || isJoining || authPhone.length !== 10}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authLoading || isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Entering...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue & Enter Live Arena</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: New Student Profile Setup */
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* Verified Mobile Number Badge */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+91 {authPhone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthStep("PHONE")}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-indigo-400" />
                      <span>Branch / Dept</span>
                    </label>
                    <select
                      value={authBranch}
                      onChange={(e) => setAuthBranch(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">Select Branch</option>
                      <option value="BA">BA</option>
                      <option value="BBA">BBA</option>
                      <option value="BCOM">BCOM</option>
                      <option value="BCA">BCA</option>
                      <option value="BSC Non-Med">BSC Non-Med</option>
                      <option value="BSC Med">BSC Med</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-violet-400" />
                      <span>Year of Study</span>
                    </label>
                    <select
                      value={authYear}
                      onChange={(e) => setAuthYear(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">Select Year</option>
                      <option value="1st yr">1st yr</option>
                      <option value="2nd yr">2nd yr</option>
                      <option value="3rd yr">3rd yr</option>
                      <option value="4th yr">4th yr</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthStep("PHONE")}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors cursor-pointer"
                    title="Back to phone input"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading || isJoining || !authName.trim()}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authLoading || isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete & Enter Arena</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-zinc-500 z-10 pb-2">
          Powered by Unisole EdTech Engine • unisole.org
        </div>
      </div>
    );
  }

  // Handle student updating their branch in the lobby
  const handleUpdateBranch = (newBranch: string) => {
    if (!newBranch || !lead?.id) return;
    const updatedLead = { ...lead, branch: newBranch };
    setLead(updatedLead);
    localStorage.setItem(`unisole_lead_${code}`, JSON.stringify(updatedLead));
    if (socketRef.current) {
      socketRef.current.emit("audience:update_branch", {
        sessionCode: code,
        leadId: lead.id,
        branch: newBranch,
      });
    }
    setBranchSelectorOpen(false);
  };

  // ==================== STAGE 1.5: PRE-START WAITING LOBBY (WAITING FOR PRESENTER) ====================
  if (!isPresentationStarted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-x-hidden font-sans select-none">
        {/* Compact Corner Floating Reactions Track */}
        <div className="fixed bottom-20 right-4 z-40 pointer-events-none w-12 h-44 flex flex-col items-center justify-end overflow-hidden">
          {reactions.map((r, i) => (
            <div
              key={r.id}
              className="absolute bottom-0 text-base opacity-85 animate-float-reaction drop-shadow-sm select-none"
              style={{ left: `${(i % 3) * 8 + 4}px` }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Background glow lamps */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <header className="flex items-center justify-between z-10 pt-2 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img
              src="https://res.cloudinary.com/hehmsemf/image/upload/f_auto,q_auto,w_64/v1785299421/Unisole_logo_new_mhqbma.png"
              alt="Unisole"
              className="w-7 h-7 rounded-lg object-contain"
            />
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-zinc-100">
                {session.collegeName || "Unisole Roadshow"}
              </span>
              <span className="text-[10px] font-mono text-indigo-400">
                Session Code: {code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Users className="w-3.5 h-3.5" />
              <span>{attendeesList.length || attendeeCount} Checked In</span>
            </div>
          </div>
        </header>

        {/* Center Audience Waiting Lounge */}
        <main className="my-auto max-w-4xl w-full mx-auto space-y-6 z-10 py-6">
          {/* Status Hero Card */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-500/10 animate-pulse">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>You're Checked In! Waiting for Presenter to Begin...</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
              Welcome, {lead.name}!
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              The presentation slides and interactive pulse polls will start automatically on your screen the moment the presenter begins.
            </p>
          </div>

          {/* Direct Peer-to-Peer QR Share Card */}
          <div className="w-full max-w-md mx-auto p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-indigo-500/30 shadow-2xl backdrop-blur-xl space-y-4 text-center">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Share QR With Friends</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Peers Can Scan Directly From Your Phone
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Hold this up if someone sitting far from the stage needs to join.
              </p>
            </div>

            {/* Direct High-Resolution QR Code Frame */}
            <div className="relative group w-fit mx-auto my-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-60" />
              <div className="relative p-3 rounded-2xl bg-white shadow-2xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                    session?.joinUrl || `https://unisole.org/live/${code}`
                  )}`}
                  alt="Scan QR to Join"
                  className="w-44 h-44 sm:w-52 sm:h-52 rounded-xl object-contain mx-auto"
                />
              </div>
            </div>

            {/* Session Join Code */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between px-4 max-w-xs mx-auto text-xs">
              <span className="font-mono text-zinc-400 text-[11px] font-bold">SESSION CODE:</span>
              <span className="font-black font-mono tracking-widest text-indigo-300 text-sm">
                {code}
              </span>
            </div>

            {/* 1-Click Action Buttons: Copy Link & WhatsApp */}
            <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto pt-1">
              <button
                type="button"
                onClick={handlePeerCopy}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {peerCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{peerCopied ? "Copied!" : "Copy Link"}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Join our live ${session?.collegeName || "Unisole"} college presentation session here: ${session?.joinUrl || `https://unisole.org/live/${code}`}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* 2-Column Grid: Branch Distribution & Real-Time Candidate Stream */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Left: Branch Distribution Pie Chart & Branch Selector (Cols 1-7) */}
            <div className="md:col-span-7 flex flex-col space-y-4">
              <BranchDistributionPieChart
                branchStats={branchStats}
                attendees={attendeesList}
                title="Branch Distribution"
                subtitle="Real-time breakdown of candidates in the room"
                className="h-full"
              />

              {/* Quick Branch Confirm / Selector */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-zinc-400">Your Branch:</span>
                  <span className="font-bold text-white truncate">
                    {lead.branch || "Not Specified"}
                  </span>
                </div>

                {!branchSelectorOpen ? (
                  <button
                    type="button"
                    onClick={() => setBranchSelectorOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-300 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Change Branch
                  </button>
                ) : (
                  <select
                    value={lead.branch || ""}
                    onChange={(e) => handleUpdateBranch(e.target.value)}
                    className="px-2.5 py-1 bg-zinc-950 border border-indigo-500 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="BA">BA</option>
                    <option value="BBA">BBA</option>
                    <option value="BCOM">BCOM</option>
                    <option value="BCA">BCA</option>
                    <option value="BSC Non-Med">BSC Non-Med</option>
                    <option value="BSC Med">BSC Med</option>
                    <option value="Others">Others</option>
                  </select>
                )}
              </div>
            </div>

            {/* Right: Real-Time Peers Feed (Cols 8-12) */}
            <div className="md:col-span-5 rounded-3xl bg-zinc-900/90 border border-white/10 p-5 flex flex-col justify-between shadow-2xl backdrop-blur-xl space-y-3">
              <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-zinc-100 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Peers in the Room ({attendeesList.length || attendeeCount})</span>
                  </h3>
                </div>
              </div>

              {/* Scrollable Joined Members List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px] sm:max-h-[340px]">
                {attendeesList.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 space-y-1">
                    <Users className="w-6 h-6 mx-auto opacity-40 animate-pulse" />
                    <p className="text-xs">Connecting peers...</p>
                  </div>
                ) : (
                  attendeesList.map((att: any, idx: number) => {
                    const isMe = att.leadId === lead.id || att.phone === lead.phone;
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
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                          isMe
                            ? "bg-indigo-950/60 border-indigo-500/50 shadow-md scale-[1.01]"
                            : "bg-white/5 border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-xs text-zinc-100 truncate">
                                {att.name}
                              </h4>
                              {isMe && (
                                <span className="px-1.5 py-0.2 rounded-md bg-indigo-500 text-white font-mono text-[9px] font-black shrink-0">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span
                              className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded inline-block"
                              style={{
                                backgroundColor: `${color.hex}22`,
                                color: color.hex,
                              }}
                            >
                              {att.branch || "General"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Cheer Reaction Dock with Progressive 5s / 10s Cooldown Badge */}
              <div className="pt-3 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">
                    Send a Cheer to Stage:
                  </span>
                  {cooldownRemaining > 0 && (
                    <span
                      className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border transition-all animate-pulse ${
                        isSpamPenalized
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {isSpamPenalized
                        ? `⚠️ Penalty: ${cooldownRemaining}s`
                        : `⏳ Cooldown: ${cooldownRemaining}s`}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3">
                  {["🔥", "👏", "🚀", "❤️", "💡"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className={`p-1 text-xl transition-all cursor-pointer select-none ${
                        cooldownRemaining > 0
                          ? "opacity-40 hover:opacity-70 active:scale-95"
                          : "hover:scale-125 active:scale-90"
                      }`}
                      title={
                        cooldownRemaining > 0
                          ? isSpamPenalized
                            ? "10s Penalty (Spam limit)"
                            : `Cooldown active (${cooldownRemaining}s)`
                          : `Send ${emoji}`
                      }
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-[11px] text-zinc-500 z-10 pt-2">
          Unisole Live Presentation Arena • Synchronizing in real-time
        </footer>
      </div>
    );
  }

  // ==================== STAGE 1.8: SESSION COMPLETED / SHOW FINISHED ====================
  if (isSessionEnded) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <header className="flex items-center justify-between z-10 pt-2 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img
              src="https://res.cloudinary.com/hehmsemf/image/upload/f_auto,q_auto,w_64/v1785299421/Unisole_logo_new_mhqbma.png"
              alt="Unisole"
              className="w-7 h-7 rounded-lg object-contain"
            />
            <span className="font-black text-sm tracking-tight text-zinc-100">
              {session?.collegeName || "Unisole Presentation"}
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            SHOW FINISHED
          </span>
        </header>

        <main className="my-auto max-w-md w-full mx-auto space-y-6 z-10 py-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300">
              Thank You For Attending!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Great job participating, {lead?.name || "Student"}! Explore all AI career pathways, live industrial training programs, and project portfolios on Unisole.
            </p>
          </div>

          <div className="p-4 rounded-3xl bg-zinc-900/90 border border-white/10 space-y-3 shadow-2xl">
            <button
              type="button"
              onClick={handleExitShow}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:via-purple-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Show → Explore AI Pathways</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        <footer className="text-center text-[11px] text-zinc-500 z-10 pb-2">
          Unisole Skill AI Labs • unisole.org
        </footer>
      </div>
    );
  }

  // ==================== SHARED: INSTANT PULSE POLL OVERLAY ====================
  const renderInstantPollOverlay = () => {
    if (!instantPollState.isActive || !instantPollState.pollId) return null;

    const yes = instantPollState.counts[0] || 0;
    const no = instantPollState.counts[1] || 0;
    const total = yes + no;
    const yesPct = total > 0 ? Math.round((yes / total) * 100) : 50;
    const noPct = total > 0 ? Math.round((no / total) * 100) : 50;

    return (
      <div className="fixed inset-x-3 sm:inset-x-auto sm:right-6 bottom-20 z-50 max-w-md w-full mx-auto animate-scale-in">
        <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950/95 border-2 border-amber-500/60 shadow-2xl backdrop-blur-2xl text-white space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>LIVE 20s PULSE POLL</span>
              </div>
            </div>

            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-black text-amber-300 border border-white/10">
              <Clock className="w-3.5 h-3.5" />
              <span>{instantPollState.remainingTime !== null ? `${instantPollState.remainingTime}s` : "20s"}</span>
            </div>
          </div>

          {/* Question */}
          <div className="text-sm sm:text-base font-extrabold text-white text-center leading-snug">
            {instantPollState.question}
          </div>

          {!instantPollState.isSubmitted && instantPollState.isActive ? (
            /* Voting Buttons */
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmitInstantPollVote(0)}
                  className="py-4 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-600/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border border-emerald-400/40"
                >
                  <span className="text-2xl">👍</span>
                  <span>YES</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmitInstantPollVote(1)}
                  className="py-4 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white font-black text-base sm:text-lg shadow-xl shadow-rose-600/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border border-rose-400/40"
                >
                  <span className="text-2xl">👎</span>
                  <span>NO</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 text-center font-medium">
                Tap your choice before the 20s timer expires!
              </p>
            </div>
          ) : (
            /* Results Bar and Confirmation */
            <div className="space-y-2.5 pt-1 animate-fade-in">
              {instantPollState.isSubmitted && (
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Your vote recorded:{" "}
                    <strong className="uppercase underline">
                      {instantPollState.myVote === 0 ? "YES 👍" : "NO 👎"}
                    </strong>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                    YES 👍
                  </span>
                  <span className="text-lg font-black text-white">
                    {yes} ({total > 0 ? yesPct : 0}%)
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-500/30">
                  <span className="text-[10px] text-rose-400 uppercase font-bold block">
                    NO 👎
                  </span>
                  <span className="text-lg font-black text-white">
                    {no} ({total > 0 ? noPct : 0}%)
                  </span>
                </div>
              </div>

              {/* Live Animated Split Bar */}
              <div className="h-3 rounded-full bg-zinc-800 overflow-hidden flex shadow-inner">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${total > 0 ? yesPct : 0}%` }}
                />
                <div
                  className="bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${total > 0 ? noPct : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-1">
                <span>{instantPollState.totalVotes} total votes</span>
                <span>Real-time live sync</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== STAGE 2: LIVE AUDIENCE PRESENTATION ARENA ====================
  // Render Mode A: Landscape Fullscreen Presentation Mode
  if (isFullscreenLandscape) {
    const isSimulatedRotated = !isNativeLandscape;

    return (
      <div
        ref={arenaRef}
        className={`bg-zinc-950 text-white flex flex-col justify-between relative overflow-hidden font-sans select-none z-50 ${
          isSimulatedRotated
            ? "fixed inset-0 w-[100vh] h-[100vw] origin-top-left translate-x-[100vw] rotate-90"
            : "fixed inset-0 w-full h-full"
        }`}
      >
        {/* Compact Corner Floating Reactions Track in Landscape */}
        <div className="fixed bottom-16 right-4 z-40 pointer-events-none w-12 h-44 flex flex-col items-center justify-end overflow-hidden">
          {reactions.map((r, i) => (
            <div
              key={r.id}
              className="absolute bottom-0 text-base opacity-85 animate-float-reaction drop-shadow-sm select-none"
              style={{ left: `${(i % 3) * 8 + 4}px` }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Ambient Glow Lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Landscape Top Minimalist HUD */}
        <header className="px-4 py-2 bg-zinc-900/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleFullscreenLandscape}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Exit Landscape Mode"
            >
              <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Exit Fullscreen</span>
            </button>

            <span className="text-zinc-600">|</span>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-zinc-200 truncate max-w-[200px]">
                {lead.name}
              </span>
            </div>

            <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400 truncate max-w-[240px]">
              {session.collegeName || "Unisole Presentation Arena"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPeerQrModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Open QR for nearby classmates to join"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Share QR</span>
            </button>

            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono font-bold">
              Slide {currentSlideIndex + 1}/{slides.length}
            </div>

            <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{myScore} pts</span>
            </div>

            {myRank && (
              <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                <span>#{myRank.rank}</span>
              </div>
            )}
          </div>
        </header>

        {/* Landscape Main Content Canvas (Auto-Fit 16:9 Widescreen) */}
        <main className="flex-1 min-h-0 relative flex items-center justify-center p-3 sm:p-6 z-20 overflow-hidden w-full">
          <AutoFitSlideStage className="w-full h-full">
            {quizState.isLeaderboardActive ? (
              <div className="w-full max-w-4xl mx-auto space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-7 h-7 text-amber-400" />
                  <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400">
                    Live Leaderboard Podium
                  </h2>
                </div>

                {myRank && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-900/70 to-violet-900/70 border border-indigo-500/40 text-center max-w-md mx-auto space-y-0.5 shadow-xl">
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                      Your Live Standing
                    </span>
                    <div className="text-2xl font-black text-amber-300">
                      Rank #{myRank.rank}{" "}
                      <span className="text-xs text-zinc-400 font-normal">
                        of {myRank.totalPlayers}
                      </span>
                    </div>
                  </div>
                )}

                {/* Top 3 Podium Cards */}
                <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto items-end pt-2">
                  <div className="p-3 rounded-2xl bg-white/10 border border-slate-400/40 text-center space-y-1 order-1 shadow-xl">
                    <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                    <div className="font-extrabold text-xs text-zinc-100 truncate">
                      {leaderboard[1]?.name || "—"}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-indigo-300">
                      {leaderboard[1]?.score || 0} pts
                    </div>
                    <div className="h-10 bg-slate-400/20 rounded-xl flex items-center justify-center font-black text-sm text-slate-300">
                      #2
                    </div>
                  </div>

                  <div className="p-3.5 rounded-3xl bg-gradient-to-b from-amber-500/30 to-amber-500/10 border border-amber-400/60 text-center space-y-1.5 order-2 shadow-2xl scale-105">
                    <Crown className="w-7 h-7 text-amber-300 mx-auto animate-bounce" />
                    <div className="font-black text-sm text-amber-200 truncate">
                      {leaderboard[0]?.name || "—"}
                    </div>
                    <div className="text-xs font-mono font-black text-amber-400">
                      {leaderboard[0]?.score || 0} pts
                    </div>
                    <div className="h-14 bg-amber-500/30 rounded-xl flex items-center justify-center font-black text-base text-amber-300">
                      #1
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 border border-amber-700/40 text-center space-y-1 order-3 shadow-xl">
                    <Award className="w-5 h-5 text-amber-600 mx-auto" />
                    <div className="font-extrabold text-xs text-zinc-100 truncate">
                      {leaderboard[2]?.name || "—"}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-indigo-300">
                      {leaderboard[2]?.score || 0} pts
                    </div>
                    <div className="h-8 bg-amber-700/20 rounded-xl flex items-center justify-center font-black text-xs text-amber-600">
                      #3
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-5xl mx-auto">
                <SlideRenderer
                  key={`slide-${currentSlideIndex}`}
                  slide={currentSlide}
                  buildStep={buildStep}
                  presentationTitle={presentation?.title}
                  isProjector={false}
                  isLandscape={true}
                  quizState={quizState}
                  remainingTime={remainingTime}
                  leaderboard={leaderboard}
                  onSelectOption={handleSelectOption}
                  selectedOption={selectedOption}
                  isSubmitted={isSubmitted}
                />
              </div>
            )}
          </AutoFitSlideStage>
        </main>

        {/* Instant Pulse Poll Overlay in Landscape */}
        {renderInstantPollOverlay()}

        {/* Landscape Floating Bottom Reactions Dock */}
        <footer className="px-4 py-1.5 bg-zinc-900/70 backdrop-blur-md border-t border-white/10 z-30 shrink-0 flex items-center justify-between">
          <div className="text-[11px] font-mono text-zinc-400">
            Unisole Live Arena
          </div>
          {cooldownRemaining > 0 ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 animate-pulse ${
                  isSpamPenalized
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}
              >
                <span>{isSpamPenalized ? "⚠️ Slow down!" : "⏳ Cooldown"}</span>
                <strong>{cooldownRemaining}s</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {["🔥", "👏", "🚀", "❤️", "💡"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  className="p-1 text-lg hover:scale-125 active:scale-90 transition-transform cursor-pointer select-none"
                  title={`React ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </footer>

        {/* Mid-Session Peer QR Modal */}
        {peerQrModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
            onClick={() => setPeerQrModalOpen(false)}
          >
            <div
              className="relative max-w-sm w-full p-5 sm:p-6 rounded-3xl bg-zinc-900 border border-indigo-500/40 shadow-2xl space-y-4 text-center text-white animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPeerQrModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Close QR modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1.5 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Invite Classmates</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Scan to Join Mid-Session
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Hold this up! Other students can scan this QR code with their mobile camera to log in and join the ongoing presentation right now.
                </p>
              </div>

              {/* High Resolution QR Code Frame */}
              <div className="relative group w-fit mx-auto my-2">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-60" />
                <div className="relative p-3.5 rounded-2xl bg-white shadow-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                      session?.joinUrl || `https://unisole.org/live/${code}`
                    )}`}
                    alt="Scan QR to Join"
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl object-contain mx-auto"
                  />
                </div>
              </div>

              {/* Session Join Code */}
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between px-4 max-w-xs mx-auto text-xs">
                <span className="font-mono text-zinc-400 text-[11px] font-bold">SESSION CODE:</span>
                <span className="font-black font-mono tracking-widest text-indigo-300 text-sm">
                  {code}
                </span>
              </div>

              {/* 1-Click Action Buttons: Copy Link & WhatsApp */}
              <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto pt-1">
                <button
                  type="button"
                  onClick={handlePeerCopy}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {peerCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{peerCopied ? "Copied!" : "Copy Link"}</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Join our live ${session?.collegeName || "Unisole"} college presentation session here: ${session?.joinUrl || `https://unisole.org/live/${code}`}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Mode B: Zero-Scroll Portrait Presentation Mode
  return (
    <div
      ref={arenaRef}
      className="h-[100dvh] max-h-[100dvh] w-full bg-zinc-950 text-white flex flex-col justify-between relative overflow-hidden font-sans select-none"
    >
      {/* Compact Corner Floating Reactions Track in Portrait */}
      <div className="fixed bottom-16 right-4 z-40 pointer-events-none w-12 h-44 flex flex-col items-center justify-end overflow-hidden">
        {reactions.map((r, i) => (
          <div
            key={r.id}
            className="absolute bottom-0 text-base opacity-85 animate-float-reaction drop-shadow-sm select-none"
            style={{ left: `${(i % 3) * 8 + 4}px` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Mobile/Desktop Status Header */}
      <header className="px-3 py-2.5 sm:px-4 sm:py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-xs font-black tracking-tight text-zinc-100 truncate max-w-[110px] sm:max-w-[200px]">
              {session?.collegeName || "Unisole Presentation"}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono font-bold">
            {code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Peer QR Button */}
          <button
            type="button"
            onClick={() => setPeerQrModalOpen(true)}
            className="p-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="Invite peers via QR code"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite</span>
          </button>

          <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{myScore} pts</span>
          </div>

          {myRank && (
            <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-indigo-400" />
              <span>#{myRank.rank}</span>
            </div>
          )}
        </div>
      </header>

      {/* Portrait Main Stage */}
      <main className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-2 sm:p-4 z-20 overflow-hidden w-full">
        <div className="w-full h-full flex flex-col justify-center max-w-lg mx-auto">
          {quizState.isLeaderboardActive ? (
            <div className="w-full max-w-sm mx-auto space-y-3 text-center py-2">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400">
                  Leaderboard Podium
                </h2>
              </div>

              {myRank && (
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-900/70 to-violet-900/70 border border-indigo-500/40 text-center max-w-xs mx-auto space-y-0.5 shadow-xl">
                  <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">
                    Your Standing
                  </span>
                  <div className="text-xl font-black text-amber-300">
                    Rank #{myRank.rank}{" "}
                    <span className="text-[11px] text-zinc-400 font-normal">
                      of {myRank.totalPlayers}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Podium Cards */}
              <div className="grid grid-cols-3 gap-2 pt-2 items-end">
                {/* Rank 2 */}
                <div className="p-2 rounded-2xl bg-white/10 border border-slate-400/40 text-center space-y-1 order-1">
                  <Medal className="w-4 h-4 text-slate-300 mx-auto" />
                  <div className="font-bold text-[11px] text-zinc-100 truncate">
                    {leaderboard[1]?.name || "—"}
                  </div>
                  <div className="text-[9px] font-mono text-indigo-300">
                    {leaderboard[1]?.score || 0} pts
                  </div>
                  <div className="h-10 bg-slate-400/20 rounded-xl flex items-center justify-center font-black text-xs text-slate-300">
                    #2
                  </div>
                </div>

                {/* Rank 1 */}
                <div className="p-2.5 rounded-2xl bg-gradient-to-b from-amber-500/30 to-amber-500/10 border border-amber-400/60 text-center space-y-1 order-2 scale-105">
                  <Crown className="w-5 h-5 text-amber-300 mx-auto animate-bounce" />
                  <div className="font-black text-xs text-amber-200 truncate">
                    {leaderboard[0]?.name || "—"}
                  </div>
                  <div className="text-[10px] font-mono font-black text-amber-400">
                    {leaderboard[0]?.score || 0} pts
                  </div>
                  <div className="h-14 bg-amber-500/30 rounded-xl flex items-center justify-center font-black text-sm text-amber-300">
                    #1
                  </div>
                </div>

                {/* Rank 3 */}
                <div className="p-2 rounded-2xl bg-white/10 border border-amber-700/40 text-center space-y-1 order-3">
                  <Award className="w-4 h-4 text-amber-600 mx-auto" />
                  <div className="font-bold text-[11px] text-zinc-100 truncate">
                    {leaderboard[2]?.name || "—"}
                  </div>
                  <div className="text-[9px] font-mono text-indigo-300">
                    {leaderboard[2]?.score || 0} pts
                  </div>
                  <div className="h-8 bg-amber-700/20 rounded-xl flex items-center justify-center font-black text-xs text-amber-600">
                    #3
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Render Active Slide with Responsive Typography and Step Animations */
            <SlideRenderer
              key={`slide-${currentSlideIndex}`}
              slide={currentSlide}
              buildStep={buildStep}
              presentationTitle={presentation?.title}
              isProjector={false}
              isLandscape={false}
              quizState={quizState}
              remainingTime={remainingTime}
              leaderboard={leaderboard}
              onSelectOption={handleSelectOption}
              selectedOption={selectedOption}
              isSubmitted={isSubmitted}
            />
          )}
        </div>
      </main>

      {/* Instant Pulse Poll Overlay in Portrait */}
      {renderInstantPollOverlay()}

      {/* Floating Bottom Emoji Reaction Bar */}
      <footer className="px-3 py-1.5 bg-zinc-900/90 backdrop-blur-xl border-t border-white/10 z-30 shrink-0">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {cooldownRemaining > 0 ? (
            <div className="flex items-center gap-1.5 mx-auto">
              <span
                className={`text-[11px] font-mono font-bold px-3 py-0.5 rounded-full border flex items-center gap-1.5 animate-pulse ${
                  isSpamPenalized
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}
              >
                <span>{isSpamPenalized ? "⚠️ Slow down!" : "⏳ Cooldown"}</span>
                <strong>{cooldownRemaining}s</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 w-full">
              {["🔥", "👏", "🚀", "❤️", "💡"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  className="p-1 text-lg sm:text-xl hover:scale-125 active:scale-90 transition-all cursor-pointer select-none"
                  title={`React ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </footer>

      {/* Mid-Session Peer QR Modal */}
      {peerQrModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setPeerQrModalOpen(false)}
        >
          <div
            className="relative max-w-sm w-full p-5 sm:p-6 rounded-3xl bg-zinc-900 border border-indigo-500/40 shadow-2xl space-y-4 text-center text-white animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPeerQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close QR modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Invite Classmates</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Scan to Join Mid-Session
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Hold this up! Other students can scan this QR code with their mobile camera to log in and join the ongoing presentation right now.
              </p>
            </div>

            {/* High Resolution QR Code Frame */}
            <div className="relative group w-fit mx-auto my-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-60" />
              <div className="relative p-3.5 rounded-2xl bg-white shadow-2xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                    session?.joinUrl || `https://unisole.org/live/${code}`
                  )}`}
                  alt="Scan QR to Join"
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl object-contain mx-auto"
                />
              </div>
            </div>

            {/* Session Join Code */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between px-4 max-w-xs mx-auto text-xs">
              <span className="font-mono text-zinc-400 text-[11px] font-bold">SESSION CODE:</span>
              <span className="font-black font-mono tracking-widest text-indigo-300 text-sm">
                {code}
              </span>
            </div>

            {/* 1-Click Action Buttons: Copy Link & WhatsApp */}
            <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto pt-1">
              <button
                type="button"
                onClick={handlePeerCopy}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {peerCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{peerCopied ? "Copied!" : "Copy Link"}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Join our live ${session?.collegeName || "Unisole"} college presentation session here: ${session?.joinUrl || `https://unisole.org/live/${code}`}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
