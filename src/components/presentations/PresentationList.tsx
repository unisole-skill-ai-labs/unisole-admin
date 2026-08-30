import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Building2,
  Filter,
  AlertTriangle,
  GraduationCap,
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
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState<string>("ALL");
  const { data: presRes, isLoading: isPresLoading } = useGetPresentationsQuery(
    selectedCollegeFilter !== "ALL" ? { baseUrl, collegeId: selectedCollegeFilter } : baseUrl
  );
  const { data: sessionsRes } = useGetSessionsQuery({ baseUrl });
  const { data: colleges = [] } = useGetCollegesQuery(baseUrl);

  const [createPresentation, { isLoading: isCreating }] = useCreatePresentationMutation();
  const [deletePresentation, { isLoading: isDeleting }] = useDeletePresentationMutation();
  const [launchSession, { isLoading: isLaunching }] = useLaunchSessionMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [deletingDeck, setDeletingDeck] = useState<any>(null);
  const [activeDeck, setActiveDeck] = useState<any>(null);

  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [customSessionCode, setCustomSessionCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Set default college on create modal open
  useEffect(() => {
    if (colleges.length > 0 && !selectedCollegeId) {
      setSelectedCollegeId(colleges[0].id);
    }
  }, [colleges, selectedCollegeId]);

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

  const collegeMap = new Map<string, string>(colleges.map((c: any) => [c.id, c.name]));

  const filteredPresentations = presentations.filter((p: any) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.collegeName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollege =
      selectedCollegeFilter === "ALL" || p.collegeId === selectedCollegeFilter;
    return matchesSearch && matchesCollege;
  });

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    if (!selectedCollegeId) {
      alert("Please select a target University/College for this pitch deck.");
      return;
    }
    try {
      const res: any = await createPresentation({
        baseUrl,
        body: {
          title: titleInput.trim(),
          description: descInput.trim(),
          collegeId: selectedCollegeId,
        },
      }).unwrap();
      setCreateModalOpen(false);
      setTitleInput("");
      setDescInput("");
      if (res?.data?.id) {
        navigate(`/presentations/builder/${res.data.id}`);
      }
    } catch (err: any) {
      alert("Failed to create pitch deck: " + (err?.data?.message || err.message));
    }
  };

  const handleOpenLaunchModal = (deck: any) => {
    setActiveDeck(deck);
    setSelectedCollegeId(deck.collegeId || "");
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
        id: activeDeck.id,
        presentationId: activeDeck.id,
        body: {
          collegeId: activeDeck.collegeId || selectedCollegeId || undefined,
          customCode: customSessionCode.trim() || undefined,
        },
      }).unwrap();

      if (res?.data) {
        setLaunchedData(res.data);
      }
    } catch (err: any) {
      alert("Failed to launch session: " + (err?.data?.message || err.message));
    }
  };

  const handleDeleteDeck = async () => {
    if (!deletingDeck) return;
    try {
      await deletePresentation({ baseUrl, id: deletingDeck.id }).unwrap();
      setDeletingDeck(null);
    } catch (err: any) {
      alert("Failed to delete pitch deck: " + (err?.data?.message || err.message));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* ─── 1. Header Banner ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-zinc-900/40 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>College-Specific Outreach Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Roadshow Presentations & Pitch Decks
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mt-1.5 leading-relaxed">
            Every presentation belongs specifically to a college partner. Project real-time slides onto auditorium screens while synchronizing interactive fast-pass quizzes straight onto students' phones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            icon={Plus}
            className="shadow-lg shadow-indigo-500/25 flex items-center gap-2 whitespace-nowrap font-bold"
          >
            Create Pitch Deck
          </Button>
        </div>
      </div>

      {/* ─── 2. Search & Filter Bar ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:max-w-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search decks by title or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-zinc-400 shrink-0 hidden sm:block" />
            <select
              value={selectedCollegeFilter}
              onChange={(e) => setSelectedCollegeFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
            >
              <option value="ALL">All Partner Universities ({colleges.length})</option>
              {colleges.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.shortName || "CAMPUS"})
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-zinc-400 font-bold self-end sm:self-auto">
          {filteredPresentations.length} Pitch Decks
        </span>
      </div>

      {/* ─── 3. Presentations Cards Grid ─────────────────────────────────── */}
      {isPresLoading ? (
        <div className="p-16 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
          <span>Loading presentation decks...</span>
        </div>
      ) : filteredPresentations.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-4">
          <Sparkles className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Pitch Decks Found</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {searchQuery
              ? "No decks match your search criteria."
              : "Create a college-specific presentation deck to start hosting interactive roadshow sessions."}
          </p>
          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)} icon={Plus}>
            Create First Pitch Deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresentations.map((deck: any) => {
            const slides = Array.isArray(deck.slides) ? deck.slides : [];
            const collegeName =
              deck.collegeName || collegeMap.get(deck.collegeId) || "College Partner";

            return (
              <div
                key={deck.id}
                className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* College Tag Badge with Direct Link */}
                  <div className="flex items-center justify-between gap-2">
                    {deck.collegeId ? (
                      <Link
                        to={`/colleges/${deck.collegeId}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[160px]">{collegeName}</span>
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{collegeName}</span>
                      </span>
                    )}

                    <Badge variant="emerald">{slides.length} Slides</Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {deck.title}
                    </h3>
                    {deck.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {deck.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1 font-mono">
                    <span>Theme: {deck.theme || "dark"}</span>
                    <span>•</span>
                    <span>{deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenLaunchModal(deck)}
                    icon={Play}
                    className="font-bold text-xs"
                  >
                    Launch Stage
                  </Button>

                  <Link to={`/presentations/builder/${deck.id}`}>
                    <Button variant="secondary" size="sm" icon={Edit} className="text-xs font-bold">
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

      {/* ─── 4. Live Sessions Overview Table ─────────────────────────────── */}
      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Recent Live Roadshow Sessions
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Auditorium sessions hosted across partner universities.
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl text-xs text-zinc-400">
            No live sessions conducted yet. Launch a pitch deck to host a live presentation.
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-5">Session Code</th>
                    <th className="py-3.5 px-4">University / College</th>
                    <th className="py-3.5 px-4">Pitch Deck</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Active Attendees</th>
                    <th className="py-3.5 px-4">Created Time</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {sessions.slice(0, 15).map((sess: any) => (
                    <tr
                      key={sess.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {sess.sessionCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {sess.collegeName || "Partner College"}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                        {sess.presentationTitle || "Campus Deck"}
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
                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400 font-bold">
                        {sess.activeAttendeesCount || 0}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                        {sess.createdAt ? new Date(sess.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
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

      {/* ─── 5. Modals ────────────────────────────────────────────────────── */}

      {/* Create Deck Modal */}
      {createModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Presentation Deck"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateDeck} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/60 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                <p className="font-bold mb-0.5">Enforced College Hierarchy</p>
                Presentations must be attached to a specific university partner. The deck will be pre-filled with the flagship animated 28-slide UNISOLE AI Campus roadshow template.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Target University / College <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              >
                {colleges.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shortName || "CAMPUS"})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Presentation Deck Title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g. UNISOLE AI Campus Program — NSUT Delhi"
              required
            />

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                placeholder="Auditorium batch, target semester, keynote speaker..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={isCreating} icon={Sparkles}>
                Create & Open Builder
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Deck Modal */}
      {deletingDeck && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingDeck(null)}
          title="Delete Presentation Deck"
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
                loading={isDeleting}
                onClick={handleDeleteDeck}
                icon={Trash2}
              >
                Confirm Delete Deck
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Launch Live Session Modal */}
      {launchModalOpen && activeDeck && (
        <Modal
          isOpen={true}
          onClose={() => setLaunchModalOpen(false)}
          title={`Launch Live Roadshow: ${activeDeck.title}`}
          maxWidth="max-w-lg"
        >
          {!launchedData ? (
            <form onSubmit={handleLaunchSession} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Associated University
                </span>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  {activeDeck.collegeName || collegeMap.get(activeDeck.collegeId) || "College Partner"}
                </p>
              </div>

              <Input
                label="Custom Session Code (Optional)"
                value={customSessionCode}
                onChange={(e) => setCustomSessionCode(e.target.value.toUpperCase())}
                placeholder="Leave blank to auto-generate (e.g. UNIXYZ)"
              />

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setLaunchModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={isLaunching} icon={Play}>
                  Start Live Auditorium Stage
                </Button>
              </div>
            </form>
          ) : (
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
                  onClick={() => copyToClipboard(launchedData.joinUrl)}
                  icon={copied ? Check : Copy}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              {/* Live Attendee Counter & Fast-Pass Monitor */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {attendeeCount} Students Checked In
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Live fast-pass stream</span>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-center gap-3">
                <Button variant="secondary" size="sm" onClick={() => setLaunchModalOpen(false)}>
                  Close
                </Button>
                <Link to={`/presentations/live/${launchedData.session.id}`}>
                  <Button variant="primary" size="sm" icon={Play} className="font-bold">
                    Open Auditorium Projector Stage
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
