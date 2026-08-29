import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  useGetPresentationsQuery,
  useCreatePresentationMutation,
  useDeletePresentationMutation,
  useGetSessionsQuery,
  useLaunchSessionMutation,
  useGetCollegesQuery,
} from "../../store";
import {
  Sparkles,
  Plus,
  Play,
  Edit,
  Trash2,
  QrCode,
  Users,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle2,
  Radio,
  ExternalLink,
  Copy,
  Check,
  UserX,
  Search,
} from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Input from "../ui/Input";

interface PresentationListProps {
  baseUrl: string;
}

export default function PresentationList({ baseUrl }: PresentationListProps) {
  const navigate = useNavigate();
  const { data: presRes, isLoading: isPresLoading } = useGetPresentationsQuery(baseUrl);
  const { data: sessionsRes } = useGetSessionsQuery({ baseUrl });
  const { data: collegesRes } = useGetCollegesQuery(baseUrl);

  const [createPresentation, { isLoading: isCreating }] = useCreatePresentationMutation();
  const [deletePresentation] = useDeletePresentationMutation();
  const [launchSession, { isLoading: isLaunching }] = useLaunchSessionMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [activeDeck, setActiveDeck] = useState<any>(null);
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [customSessionCode, setCustomSessionCode] = useState("");
  const [launchedData, setLaunchedData] = useState<{
    session: any;
    qrCodeDataUrl: string;
    joinUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const socketRef = useRef<Socket | null>(null);

  // Connect socket whenever launch modal is open with active session
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
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.emit("admin:join", {
      sessionCode: launchedData.session.sessionCode,
      sessionId: launchedData.session.id,
    });

    socket.on("sync_state", (state) => {
      if (Array.isArray(state.attendees)) {
        setAttendees(state.attendees);
      }
      if (typeof state.attendeeCount === "number") {
        setAttendeeCount(state.attendeeCount);
      }
    });

    socket.on("attendee_count", ({ count }) => {
      setAttendeeCount(count);
    });

    socket.on("attendee_joined", ({ attendees: list, count }) => {
      setAttendeeCount(count);
      if (list) setAttendees(list);
    });

    socket.on("attendee_left", ({ attendees: list, count }) => {
      setAttendeeCount(count);
      if (list) setAttendees(list);
    });

    socket.on("attendee_kicked", ({ attendees: list, count }) => {
      setAttendeeCount(count);
      if (list) setAttendees(list);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [launchModalOpen, launchedData?.session?.sessionCode, launchedData?.session?.id, baseUrl]);

  const handleKickAttendee = (leadId: string) => {
    if (!socketRef.current || !launchedData?.session?.sessionCode) return;
    socketRef.current.emit("admin:kick_attendee", {
      sessionCode: launchedData.session.sessionCode,
      leadId,
    });
  };

  const presentations = presRes?.data || [];
  const sessions = sessionsRes?.data || [];
  const colleges = collegesRes?.data || [];

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    try {
      const res: any = await createPresentation({
        baseUrl,
        body: {
          title: titleInput.trim(),
          description: descInput.trim(),
        },
      }).unwrap();
      setCreateModalOpen(false);
      setTitleInput("");
      setDescInput("");
      if (res?.data?.id) {
        navigate(`/presentations/builder/${res.data.id}`);
      }
    } catch (err) {
      console.error("Failed to create deck", err);
    }
  };

  const handleOpenLaunchModal = (deck: any) => {
    setActiveDeck(deck);
    setSelectedCollegeId("");
    setCustomSessionCode("");
    setLaunchedData(null);
    setLaunchModalOpen(true);
  };

  const handleLaunchSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeck) return;
    try {
      const res: any = await launchSession({
        baseUrl,
        presentationId: activeDeck.id,
        body: {
          collegeId: selectedCollegeId || undefined,
          customCode: customSessionCode || undefined,
        },
      }).unwrap();

      if (res?.data) {
        setLaunchedData(res.data);
      }
    } catch (err) {
      console.error("Failed to launch session", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-zinc-900/40 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive College Outreach Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Roadshow Presentations & Pitch Decks
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mt-1.5 leading-relaxed">
            Project real-time pitch decks onto auditorium screens while synchronizing slides, live pulse surveys, and Kahoot-style quizzes straight onto students' mobile phones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            className="shadow-lg shadow-indigo-500/25 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Pitch Deck</span>
          </Button>
        </div>
      </div>

      {/* Presentation Decks Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Presentation Decks ({presentations.length})
            </h2>
          </div>
        </div>

        {isPresLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 rounded-3xl bg-zinc-100 dark:bg-zinc-900/60 animate-pulse border border-zinc-200 dark:border-zinc-800"
              />
            ))}
          </div>
        ) : presentations.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
            <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              No Pitch Decks Created Yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 mb-5">
              Build your first interactive deck with live pulse polls and fast-paced quizzes for college roadshows.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
            >
              Create First Pitch Deck
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {presentations.map((deck: any) => {
              const slidesCount = Array.isArray(deck.slides)
                ? deck.slides.length
                : 0;
              const hasQuiz = Array.isArray(deck.slides)
                ? deck.slides.some((s: any) => s.type === "QUIZ")
                : false;
              const hasPoll = Array.isArray(deck.slides)
                ? deck.slides.some((s: any) => s.type === "POLL")
                : false;

              return (
                <div
                  key={deck.id}
                  className="group bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                        {slidesCount} Slides
                      </span>
                      <div className="flex items-center gap-1.5">
                        {hasQuiz && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            ⚡ Quiz
                          </span>
                        )}
                        {hasPoll && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                            📊 Poll
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {deck.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {deck.description || "Interactive college roadshow presentation template."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/presentations/builder/${deck.id}`)
                        }
                        className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePresentation({ baseUrl, id: deck.id })}
                        className="text-zinc-400 hover:text-rose-500 p-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenLaunchModal(deck)}
                      className="bg-indigo-600 hover:bg-indigo-500 shadow-sm flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch Session</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active & Past Roadshow Sessions */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Active & Recent Roadshow Sessions ({sessions.length})
            </h2>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20 text-zinc-500 text-xs">
            No live sessions launched yet. Click "Launch Session" on any presentation above to generate a live QR code.
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-5">Session Code</th>
                    <th className="py-3.5 px-4">Host College</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Attendees</th>
                    <th className="py-3.5 px-4">Started At</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {sessions.map((sess: any) => (
                    <tr
                      key={sess.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {sess.sessionCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {sess.collegeName || "Open Roadshow"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sess.status === "LIVE"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : sess.status === "ENDED"
                              ? "bg-zinc-500/10 text-zinc-400"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              sess.status === "LIVE"
                                ? "bg-emerald-500 animate-ping"
                                : "bg-zinc-400"
                            }`}
                          />
                          {sess.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">
                          {sess.activeAttendeesCount || 0} students
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                        {sess.startedAt
                          ? new Date(sess.startedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/presentations/analytics/${sess.id}`)
                          }
                          className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600"
                        >
                          <BarChart3 className="w-3.5 h-3.5 mr-1 inline" />
                          <span>Leads & Stats</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/presentations/live/${sess.id}`)
                          }
                          className="bg-indigo-600 hover:bg-indigo-500"
                        >
                          <Play className="w-3 h-3 fill-current mr-1 inline" />
                          <span>Enter Projector</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Pitch Deck Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Interactive Pitch Deck"
      >
        <form onSubmit={handleCreateDeck} className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Provide a title for your college presentation. You will be able to customize slides, pulse surveys, and timed quiz questions in the visual editor.
          </p>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Deck Title *
            </label>
            <input
              type="text"
              required
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g. Unisole Tech & Career Roadshow 2026"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description / Host Purpose (Optional)
            </label>
            <textarea
              rows={3}
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="Targeting Tier-1 & Tier-2 engineering colleges for full-stack & AI cohorts..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isCreating || !titleInput.trim()}
            >
              {isCreating ? "Creating..." : "Create & Launch Builder"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Launch Live Session Modal */}
      <Modal
        isOpen={launchModalOpen}
        onClose={() => setLaunchModalOpen(false)}
        title={
          launchedData
            ? "🚀 Live Session Ready to Present"
            : "Launch College Roadshow Session"
        }
        maxWidth={launchedData ? "max-w-5xl" : "max-w-lg"}
      >
        {!launchedData ? (
          <form onSubmit={handleLaunchSession} className="space-y-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Launching a session generates a unique Session Code and QR Code for <strong>{activeDeck?.title}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Select Host College (Optional)
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- Open Session / No Specific College --</option>
                {colleges.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.shortName ? `(${c.shortName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Custom Session Code (Optional)
              </label>
              <input
                type="text"
                value={customSessionCode}
                onChange={(e) =>
                  setCustomSessionCode(e.target.value.toUpperCase())
                }
                placeholder="e.g. IITD26 (Leave empty for auto-generated)"
                maxLength={10}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLaunchModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLaunching}
                className="bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isLaunching ? "Generating..." : "Generate QR & Start"}</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Panel: QR Code, Join Code & Link */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4 p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-inner">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />
                <div className="relative p-3 rounded-2xl bg-white shadow-xl border border-zinc-200 dark:border-zinc-700">
                  <img
                    src={launchedData.qrCodeDataUrl}
                    alt="Session QR Code"
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-xl object-contain mx-auto"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                  Audience Session Code
                </span>
                <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-wider">
                  {launchedData.session.sessionCode}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400 w-full shadow-sm">
                <span className="truncate flex-1 text-left">
                  {launchedData.joinUrl}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(launchedData.joinUrl)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="Copy Join Link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setLaunchModalOpen(false);
                  navigate(`/presentations/live/${launchedData.session.id}`);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center justify-center gap-2 py-2.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Open Projector View Now</span>
              </Button>
            </div>

            {/* Right Panel: Live Real-Time Joined Attendees Stream & Kick Controls */}
            <div className="lg:col-span-7 flex flex-col space-y-3 h-[420px] sm:h-[480px]">
              {/* Header / Counter & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-500" />
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
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
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
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-zinc-400">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-400 animate-pulse">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                        Waiting for Students to Join
                      </h5>
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
                          className="p-3 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-all shadow-sm animate-fade-in"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar with online pulse */}
                            <div className="relative shrink-0">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow">
                                {initials}
                              </div>
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                            </div>

                            {/* Student Details */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                  {att.name || "Anonymous Student"}
                                </h4>
                                {idx === attendees.length - 1 && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono text-[9px] font-bold shrink-0">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                                {att.phone || "No phone"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Score Badge */}
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                              {att.totalScore ?? 0} pts
                            </span>

                            {/* Instant Kick Button */}
                            <button
                              type="button"
                              onClick={() => handleKickAttendee(att.leadId)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
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
              <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Total Live: <strong className="text-zinc-900 dark:text-white">{attendees.length}</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLaunchModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
