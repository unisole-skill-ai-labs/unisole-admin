import React, { useState, useEffect } from "react";
import HostProjector from "../components/live/HostProjector";
import LiveQuizEditorModal from "../components/live/LiveQuizEditorModal";

export default function LiveSessionsPage({ baseUrl, token }) {
  const [activeTab, setActiveTab] = useState("sessions"); // 'sessions' | 'quizzes'
  const [sessions, setSessions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals & Projector State
  const [activeProjectorSession, setActiveProjectorSession] = useState(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showQuizEditorModal, setShowQuizEditorModal] = useState(false);

  // New Session Form State
  const [newSessionName, setNewSessionName] = useState("");
  const [newInstituteName, setNewInstituteName] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);

  // Search/Filter
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [sessRes, quizRes] = await Promise.all([
        fetch(`${baseUrl}/api/live/sessions`),
        fetch(`${baseUrl}/api/live/quizzes`),
      ]);

      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSessions(sessData);
      }
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        setQuizzes(quizData);
        if (quizData.length > 0 && !selectedQuizId) {
          setSelectedQuizId(quizData[0].id);
        }
      }
    } catch (err) {
      setError("Failed to load live sessions or quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [baseUrl]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionName || !newInstituteName || !selectedQuizId) {
      alert("Please fill all required fields");
      return;
    }

    setCreatingSession(true);
    try {
      const res = await fetch(`${baseUrl}/api/live/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_name: newSessionName,
          institute_name: newInstituteName,
          quiz_id: selectedQuizId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session");
      }

      const created = await res.json();
      setSessions([created, ...sessions]);
      setShowNewSessionModal(false);
      setNewSessionName("");
      setNewInstituteName("");

      // Directly launch projector for the newly created room!
      setActiveProjectorSession(created);
    } catch (err) {
      alert(err.message || "Failed to create session");
    } finally {
      setCreatingSession(false);
    }
  };

  const handleExport = (sessionId) => {
    window.open(`${baseUrl}/api/live/export/${sessionId}`, "_blank");
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.session_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.institute_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room_code?.includes(searchQuery)
  );

  return (
    <div style={styles.container}>
      {/* Fullscreen Host Projector Modal */}
      {activeProjectorSession && (
        <HostProjector
          session={activeProjectorSession}
          baseUrl={baseUrl}
          onExit={() => {
            setActiveProjectorSession(null);
            fetchData();
          }}
          onExport={handleExport}
        />
      )}

      {/* Quiz Editor Modal */}
      {showQuizEditorModal && (
        <LiveQuizEditorModal
          baseUrl={baseUrl}
          onClose={() => setShowQuizEditorModal(false)}
          onQuizCreated={() => fetchData()}
        />
      )}

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div style={modalStyles.backdrop}>
          <div style={modalStyles.modalCard}>
            <div style={modalStyles.header}>
              <h2>Launch New Live Seminar Session</h2>
              <button style={modalStyles.closeBtn} onClick={() => setShowNewSessionModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSession} style={modalStyles.body}>
              <div style={modalStyles.fieldGroup}>
                <label style={modalStyles.label}>Institute / College Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IIT Delhi, BITS Pilani, DPS RK Puram"
                  value={newInstituteName}
                  onChange={(e) => setNewInstituteName(e.target.value)}
                  style={modalStyles.input}
                />
              </div>

              <div style={modalStyles.fieldGroup}>
                <label style={modalStyles.label}>Session / Workshop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fullstack AI & Web Development Seminar 2026"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  style={modalStyles.input}
                />
              </div>

              <div style={modalStyles.fieldGroup}>
                <label style={modalStyles.label}>Select Quiz Question Pack *</label>
                {quizzes.length === 0 ? (
                  <p style={{ color: "#ef4444", fontSize: 13 }}>
                    No quiz packs found. Please create a quiz pack first.
                  </p>
                ) : (
                  <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    style={modalStyles.select}
                  >
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title} ({q.questionCount || 10} Questions)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={modalStyles.footer}>
                <button
                  type="button"
                  style={modalStyles.cancelBtn}
                  onClick={() => setShowNewSessionModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSession || quizzes.length === 0}
                  style={modalStyles.saveBtn}
                >
                  {creatingSession ? "Creating..." : "Launch Projector 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Page Header */}
      <div style={styles.topBanner}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.liveTag}>⚡ UNISOLE LIVE ENGINE</span>
            <span style={styles.statusDot}>● WebSockets Active</span>
          </div>
          <h1 style={styles.mainHeading}>Interactive Live Polling & Quiz Platform</h1>
          <p style={styles.subHeading}>
            Host real-time 300+ participant live quizzes in classrooms and college seminars with instant lead capture.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.createQuizBtn}
            onClick={() => setShowQuizEditorModal(true)}
          >
            + Create Quiz Pack
          </button>
          <button
            style={styles.launchBtn}
            onClick={() => setShowNewSessionModal(true)}
          >
            🚀 Launch Live Session
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <span style={styles.metricNum}>{sessions.length}</span>
          <span style={styles.metricLabel}>Total Sessions Hosted</span>
        </div>
        <div style={styles.metricCard}>
          <span style={{ ...styles.metricNum, color: "#10b981" }}>
            {sessions.reduce((acc, s) => acc + (s.total_participants || 0), 0)}
          </span>
          <span style={styles.metricLabel}>Total Students Engaged</span>
        </div>
        <div style={styles.metricCard}>
          <span style={{ ...styles.metricNum, color: "#6366f1" }}>{quizzes.length}</span>
          <span style={styles.metricLabel}>Saved Quiz Packs</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsNav}>
        <button
          style={{
            ...styles.tabBtn,
            borderBottomColor: activeTab === "sessions" ? "#4f46e5" : "transparent",
            color: activeTab === "sessions" ? "#4f46e5" : "#64748b",
          }}
          onClick={() => setActiveTab("sessions")}
        >
          Live Sessions & Seminars ({sessions.length})
        </button>
        <button
          style={{
            ...styles.tabBtn,
            borderBottomColor: activeTab === "quizzes" ? "#4f46e5" : "transparent",
            color: activeTab === "quizzes" ? "#4f46e5" : "#64748b",
          }}
          onClick={() => setActiveTab("quizzes")}
        >
          Quiz Packs Library ({quizzes.length})
        </button>
      </div>

      {/* Tab 1: Live Sessions Table */}
      {activeTab === "sessions" && (
        <div style={styles.tabContent}>
          <div style={styles.searchBarRow}>
            <input
              type="text"
              placeholder="Search by college/institute, session name, or PIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {loading ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>Loading live sessions…</p>
          ) : filteredSessions.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No live sessions found matching your query.</p>
              <button
                style={styles.launchBtn}
                onClick={() => setShowNewSessionModal(true)}
              >
                + Launch Your First Live Seminar
              </button>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Room PIN</th>
                  <th style={styles.th}>Institute / College</th>
                  <th style={styles.th}>Session Name</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Participants</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.pinCode}>{s.room_code}</span>
                    </td>
                    <td style={styles.td}>
                      <strong>{s.institute_name}</strong>
                    </td>
                    <td style={styles.td}>{s.session_name}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            s.status === "lobby"
                              ? "#fef3c7"
                              : s.status === "locked_active"
                              ? "#fee2e2"
                              : "#ecfdf5",
                          color:
                            s.status === "lobby"
                              ? "#b45309"
                              : s.status === "locked_active"
                              ? "#b91c1c"
                              : "#047857",
                        }}
                      >
                        {s.status === "lobby"
                          ? "LOBBY OPEN"
                          : s.status === "locked_active"
                          ? "IN PROGRESS"
                          : "COMPLETED"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{s.total_participants}</strong> students
                    </td>
                    <td style={styles.td}>
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button
                          style={styles.projectorBtn}
                          onClick={() => setActiveProjectorSession(s)}
                          title="Open Fullscreen Projector Screen"
                        >
                          📽️ Projector
                        </button>
                        <button
                          style={styles.downloadBtn}
                          onClick={() => handleExport(s.id)}
                          title="Download Student Leads to Excel"
                        >
                          📥 Excel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Quiz Packs Library */}
      {activeTab === "quizzes" && (
        <div style={styles.tabContent}>
          <div style={styles.quizGrid}>
            {quizzes.map((q) => (
              <div key={q.id} style={styles.quizCard}>
                <div style={styles.quizCardHeader}>
                  <h3>{q.title}</h3>
                  <span style={styles.qCountBadge}>{q.questionCount || 10} Questions</span>
                </div>
                <p style={styles.quizCardDesc}>{q.description || "No description provided."}</p>
                <div style={styles.quizCardFooter}>
                  <button
                    style={styles.launchQuizBtn}
                    onClick={() => {
                      setSelectedQuizId(q.id);
                      setShowNewSessionModal(true);
                    }}
                  >
                    🚀 Launch with this Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px 32px",
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  topBanner: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: "28px 32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  liveTag: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.05em",
  },
  statusDot: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: 700,
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  subHeading: {
    color: "#64748b",
    fontSize: 14,
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: 12,
  },
  createQuizBtn: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "12px 20px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  launchBtn: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    padding: "12px 24px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
  },
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: "20px 24px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
  },
  metricNum: {
    fontSize: 28,
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1.2,
  },
  metricLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
    marginTop: 4,
  },
  tabsNav: {
    display: "flex",
    gap: 24,
    borderBottom: "2px solid #e2e8f0",
    marginBottom: 20,
  },
  tabBtn: {
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    padding: "12px 4px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: -2,
  },
  tabContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: 24,
  },
  searchBarRow: {
    marginBottom: 16,
  },
  searchInput: {
    width: "100%",
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "12px 16px",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "14px 16px",
    fontSize: 14,
    color: "#1e293b",
  },
  pinCode: {
    backgroundColor: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: 6,
    fontFamily: "monospace",
    fontWeight: 800,
    fontSize: 14,
    color: "#4f46e5",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: 9999,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.05em",
  },
  actionBtns: {
    display: "flex",
    gap: 8,
  },
  projectorBtn: {
    backgroundColor: "#312e81",
    color: "#ffffff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  downloadBtn: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b",
  },
  quizGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 20,
  },
  quizCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  quizCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  qCountBadge: {
    backgroundColor: "#e0e7ff",
    color: "#4f46e5",
    padding: "2px 8px",
    borderRadius: 9999,
    fontSize: 11,
    fontWeight: 800,
  },
  quizCardDesc: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 20,
  },
  quizCardFooter: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: 14,
  },
  launchQuizBtn: {
    width: "100%",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    padding: "10px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
};

const modalStyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 520,
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#64748b",
  },
  body: {
    padding: "24px",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontWeight: 700,
    fontSize: 13,
    color: "#1e293b",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
  },
  footer: {
    marginTop: 24,
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  saveBtn: {
    padding: "10px 22px",
    borderRadius: 10,
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
};
