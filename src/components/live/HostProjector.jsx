import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import QRCodeSVG from "./QRCodeSVG";

const OPTION_COLORS = [
  { bg: "#ef4444", label: "A", name: "Red", shape: "▲" },
  { bg: "#3b82f6", label: "B", name: "Blue", shape: "◆" },
  { bg: "#eab308", label: "C", name: "Yellow", shape: "●" },
  { bg: "#22c55e", label: "D", name: "Green", shape: "■" },
];

export default function HostProjector({ session, baseUrl, onExit, onExport }) {
  const [socket, setSocket] = useState(null);
  const [stage, setStage] = useState("LOBBY"); // 'LOBBY' | 'QUESTION' | 'RESULTS' | 'LEADERBOARD' | 'PODIUM'
  const [isLocked, setIsLocked] = useState(false);
  const [participants, setParticipants] = useState([]);
  
  // Question & Game State
  const [currentQIndex, setCurrentQIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [questionData, setQuestionData] = useState(null);
  const [remainingTime, setRemainingTime] = useState(30);
  const [answeredTally, setAnsweredTally] = useState({ answered: 0, total: 0 });
  const [resultsData, setResultsData] = useState(null);
  const [top5Data, setTop5Data] = useState([]);
  const [podiumData, setPodiumData] = useState(null);

  const studentJoinUrl = `http://localhost:5175/?pin=${session.room_code}`;

  useEffect(() => {
    // Connect to backend websocket
    const socketInstance = io(`${baseUrl}/live-ws`, {
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      socketInstance.emit("admin:attach_room", { roomCode: session.room_code });
    });

    socketInstance.on("admin:attached", (data) => {
      if (data.participantsList) {
        setParticipants(data.participantsList);
      }
      setIsLocked(data.isLocked);
    });

    socketInstance.on("room:lobby_update", (data) => {
      setParticipants(data.participantsList || []);
    });

    socketInstance.on("question:start", (data) => {
      setStage("QUESTION");
      setCurrentQIndex(data.qIndex);
      setTotalQuestions(data.totalQuestions);
      setQuestionData(data);
      setRemainingTime(data.timeLimit || 30);
      setAnsweredTally({ answered: 0, total: participants.length });
    });

    socketInstance.on("timer:tick", (data) => {
      setRemainingTime(data.remainingSeconds);
    });

    socketInstance.on("admin:live_progress", (data) => {
      setAnsweredTally({ answered: data.answeredCount, total: data.totalParticipants });
    });

    socketInstance.on("question:time_up_results", (data) => {
      setStage("RESULTS");
      setResultsData(data);
    });

    socketInstance.on("leaderboard:update", (data) => {
      setStage("LEADERBOARD");
      setTop5Data(data.top5 || []);
    });

    socketInstance.on("game:podium", (data) => {
      setStage("PODIUM");
      setPodiumData(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [baseUrl, session.room_code]);

  // Actions
  const handleKickUser = (userId) => {
    if (!socket) return;
    if (window.confirm("Remove this participant from the room and database?")) {
      socket.emit("admin:kick_participant", {
        roomCode: session.room_code,
        targetUserId: userId,
      });
    }
  };

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit("admin:start_game", { roomCode: session.room_code });
    setIsLocked(true);
  };

  const handleShowLeaderboard = () => {
    if (!socket) return;
    socket.emit("admin:show_leaderboard", { roomCode: session.room_code });
  };

  const handleNextQuestion = () => {
    if (!socket) return;
    socket.emit("admin:next_question", { roomCode: session.room_code });
  };

  const handleFinishGame = () => {
    if (!socket) return;
    socket.emit("admin:finish_game", { roomCode: session.room_code });
  };

  return (
    <div style={styles.fullscreenOverlay}>
      {/* Top Bar / Header */}
      <div style={styles.topHeader}>
        <div style={styles.headerLeft}>
          <span style={styles.liveBadge}>🔴 LIVE HOST</span>
          <span style={styles.sessionTitle}>
            {session.session_name} <span style={styles.instName}>• {session.institute_name}</span>
          </span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.roomPinBadge}>
            ROOM PIN: <strong>{session.room_code}</strong>
          </span>
          <button style={styles.exitBtn} onClick={onExit}>
            ✕ Exit Projector
          </button>
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div style={styles.stageBody}>
        {/* ======================================================== */}
        {/* 1. LOBBY STAGE                                           */}
        {/* ======================================================== */}
        {stage === "LOBBY" && (
          <div style={styles.lobbyContainer}>
            <div style={styles.lobbyLeft}>
              <h2 style={styles.joinHeading}>Join with your Phone 📱</h2>
              <p style={styles.joinSub}>Scan the QR Code or go to <strong>live.unisole.org</strong></p>

              <div style={styles.qrWrapper}>
                <QRCodeSVG value={studentJoinUrl} size={280} />
              </div>

              <div style={styles.pinCallout}>
                <span style={styles.pinLabel}>GAME PIN</span>
                <span style={styles.pinBigText}>{session.room_code}</span>
              </div>
            </div>

            <div style={styles.lobbyRight}>
              <div style={styles.participantHeader}>
                <h3>
                  👥 Students Joined: <span style={styles.counter}>{participants.length}</span>
                </h3>
                {participants.length > 0 && !isLocked && (
                  <button style={styles.startBtn} onClick={handleStartGame}>
                    🚀 Start Live Quiz
                  </button>
                )}
              </div>

              {participants.length === 0 ? (
                <div style={styles.emptyLobby}>
                  <div style={styles.pulseDot} />
                  <p>Waiting for students to scan the QR code and join…</p>
                </div>
              ) : (
                <div style={styles.playersGrid}>
                  {participants.map((p) => (
                    <div key={p.userId} style={styles.playerChip}>
                      <span style={styles.playerName}>{p.name}</span>
                      <button
                        title="Remove student from session & database"
                        style={styles.kickBtn}
                        onClick={() => handleKickUser(p.userId)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. QUESTION ACTIVE STAGE                                 */}
        {/* ======================================================== */}
        {stage === "QUESTION" && questionData && (
          <div style={styles.questionContainer}>
            <div style={styles.qMetaBar}>
              <span style={styles.qIndexPill}>
                Question {currentQIndex} of {totalQuestions}
              </span>
              <div style={styles.timerCircle}>
                <span style={styles.timerNumber}>{remainingTime}</span>
                <span style={styles.timerLabel}>SEC</span>
              </div>
              <span style={styles.answersTally}>
                Answers: <strong>{answeredTally.answered}</strong> / {answeredTally.total || participants.length}
              </span>
            </div>

            <div style={styles.qCard}>
              <h1 style={styles.qText}>{questionData.questionText}</h1>
              {questionData.imageUrl && (
                <img
                  src={questionData.imageUrl}
                  alt="Question illustration"
                  style={styles.qImage}
                />
              )}
            </div>

            {/* 4 Colored Option Blocks */}
            <div style={styles.optionsGrid}>
              {questionData.options.map((opt, idx) => {
                const color = OPTION_COLORS[idx % OPTION_COLORS.length];
                return (
                  <div
                    key={opt.id}
                    style={{ ...styles.optionCard, backgroundColor: color.bg }}
                  >
                    <span style={styles.optShape}>{color.shape}</span>
                    <span style={styles.optText}>{opt.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. SHOW RESULTS STAGE (Vote Bar Graph & True Answer)     */}
        {/* ======================================================== */}
        {stage === "RESULTS" && questionData && resultsData && (
          <div style={styles.resultsContainer}>
            <div style={styles.resultsHeader}>
              <h2>Question {currentQIndex} Results</h2>
              <button style={styles.nextBtn} onClick={handleShowLeaderboard}>
                View Top 5 Leaderboard ➔
              </button>
            </div>

            <p style={styles.resultsQText}>{questionData.questionText}</p>

            {/* Vertical Bar Chart */}
            <div style={styles.chartArea}>
              {questionData.options.map((opt, idx) => {
                const color = OPTION_COLORS[idx % OPTION_COLORS.length];
                const votes = resultsData.voteCounts[opt.id] || 0;
                const total = resultsData.totalVotes || 1;
                const pct = Math.round((votes / total) * 100);
                const isCorrect = resultsData.correctOptionId === opt.id;

                return (
                  <div key={opt.id} style={styles.chartCol}>
                    <div style={styles.barWrapper}>
                      <div
                        style={{
                          ...styles.barFill,
                          height: `${Math.max(12, pct)}%`,
                          backgroundColor: color.bg,
                          border: isCorrect ? "4px solid #ffffff" : "none",
                          boxShadow: isCorrect ? "0 0 25px rgba(34, 197, 94, 0.8)" : "none",
                        }}
                      >
                        <span style={styles.barPct}>{pct}%</span>
                      </div>
                    </div>
                    <div style={styles.barFooter}>
                      <span style={{ ...styles.barLabelPill, backgroundColor: color.bg }}>
                        {color.shape} {color.label}
                      </span>
                      <span style={styles.barOptionText}>{opt.text}</span>
                      {isCorrect && <span style={styles.correctBadge}>✓ TRUE ANSWER</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. LEADERBOARD STAGE                                     */}
        {/* ======================================================== */}
        {stage === "LEADERBOARD" && (
          <div style={styles.leaderboardContainer}>
            <div style={styles.resultsHeader}>
              <h2>🏆 Top 5 Live Leaderboard</h2>
              {currentQIndex < totalQuestions ? (
                <button style={styles.startBtn} onClick={handleNextQuestion}>
                  Next Question ({currentQIndex + 1} of {totalQuestions}) ➔
                </button>
              ) : (
                <button style={styles.startBtn} onClick={handleFinishGame}>
                  View Final Podium 🏆 ➔
                </button>
              )}
            </div>

            <div style={styles.leaderboardList}>
              {top5Data.map((player) => (
                <div key={player.userId} style={styles.leaderboardRow}>
                  <div style={styles.rankBadge}>#{player.rank}</div>
                  <div style={styles.leaderboardName}>
                    {player.name}
                    {player.streak > 1 && (
                      <span style={styles.streakPill}>🔥 {player.streak} Streak</span>
                    )}
                  </div>
                  <div style={styles.leaderboardScore}>{player.score.toLocaleString()} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. FINAL PODIUM STAGE                                    */}
        {/* ======================================================== */}
        {stage === "PODIUM" && podiumData && (
          <div style={styles.podiumContainer}>
            <h1 style={styles.podiumHeading}>🎉 Workshop Complete!</h1>
            <p style={styles.podiumSub}>
              {session.session_name} • {session.institute_name}
            </p>

            <div style={styles.podiumRow}>
              {/* 2nd Place */}
              {podiumData.top3[1] && (
                <div style={{ ...styles.podiumStep, height: 260, backgroundColor: "#94a3b8" }}>
                  <div style={styles.podiumCrown}>🥈</div>
                  <div style={styles.podiumPlayerName}>{podiumData.top3[1].name}</div>
                  <div style={styles.podiumPoints}>{podiumData.top3[1].score.toLocaleString()} pts</div>
                  <div style={styles.podiumRankLabel}>2ND PLACE</div>
                </div>
              )}

              {/* 1st Place */}
              {podiumData.top3[0] && (
                <div style={{ ...styles.podiumStep, height: 340, backgroundColor: "#eab308" }}>
                  <div style={styles.podiumCrown}>👑 🥇</div>
                  <div style={styles.podiumPlayerName}>{podiumData.top3[0].name}</div>
                  <div style={styles.podiumPoints}>{podiumData.top3[0].score.toLocaleString()} pts</div>
                  <div style={styles.podiumRankLabel}>CHAMPION</div>
                </div>
              )}

              {/* 3rd Place */}
              {podiumData.top3[2] && (
                <div style={{ ...styles.podiumStep, height: 200, backgroundColor: "#b45309" }}>
                  <div style={styles.podiumCrown}>🥉</div>
                  <div style={styles.podiumPlayerName}>{podiumData.top3[2].name}</div>
                  <div style={styles.podiumPoints}>{podiumData.top3[2].score.toLocaleString()} pts</div>
                  <div style={styles.podiumRankLabel}>3RD PLACE</div>
                </div>
              )}
            </div>

            <div style={styles.podiumFooter}>
              <button
                style={styles.exportBtn}
                onClick={() => onExport(session.id)}
              >
                📥 Download {session.institute_name} Leads (Excel / CSV)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  fullscreenOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "#090d16",
    color: "#ffffff",
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  topHeader: {
    height: 72,
    backgroundColor: "#111827",
    borderBottom: "1px solid #1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  liveBadge: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    padding: "4px 10px",
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.05em",
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 700,
  },
  instName: {
    color: "#9ca3af",
    fontWeight: 400,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  roomPinBadge: {
    backgroundColor: "#374151",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 15,
    letterSpacing: "0.1em",
  },
  exitBtn: {
    backgroundColor: "transparent",
    border: "1px solid #4b5563",
    color: "#9ca3af",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  stageBody: {
    flex: 1,
    padding: 32,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },

  // LOBBY
  lobbyContainer: {
    display: "grid",
    gridTemplateColumns: "400px 1fr",
    gap: 40,
    height: "100%",
    alignItems: "center",
  },
  lobbyLeft: {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 24,
    padding: 32,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  joinHeading: {
    fontSize: 24,
    fontWeight: 800,
    margin: "0 0 6px 0",
  },
  joinSub: {
    color: "#9ca3af",
    fontSize: 14,
    margin: "0 0 24px 0",
  },
  qrWrapper: {
    marginBottom: 24,
  },
  pinCallout: {
    backgroundColor: "#1f2937",
    width: "100%",
    padding: "16px 20px",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  pinLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.1em",
  },
  pinBigText: {
    fontSize: 44,
    fontWeight: 900,
    letterSpacing: "0.15em",
    color: "#38bdf8",
  },
  lobbyRight: {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 24,
    padding: 32,
    height: "100%",
    maxHeight: 620,
    display: "flex",
    flexDirection: "column",
  },
  participantHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderBottom: "1px solid #1f2937",
    paddingBottom: 16,
  },
  counter: {
    color: "#22c55e",
    fontWeight: 800,
  },
  startBtn: {
    backgroundColor: "#6366f1",
    color: "#ffffff",
    border: "none",
    padding: "12px 28px",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
  },
  emptyLobby: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },
  pulseDot: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    marginBottom: 16,
    animation: "pulse 1.5s infinite",
  },
  playersGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    overflowY: "auto",
  },
  playerChip: {
    backgroundColor: "#1f2937",
    borderRadius: 9999,
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 15,
    fontWeight: 600,
    border: "1px solid #374151",
  },
  playerName: {
    color: "#f3f4f6",
  },
  kickBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    padding: 0,
  },

  // QUESTION
  questionContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between",
  },
  qMetaBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  qIndexPill: {
    backgroundColor: "#1f2937",
    padding: "8px 16px",
    borderRadius: 9999,
    fontSize: 15,
    fontWeight: 700,
  },
  timerCircle: {
    backgroundColor: "#312e81",
    border: "3px solid #6366f1",
    width: 80,
    height: 80,
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  timerNumber: {
    fontSize: 26,
    fontWeight: 900,
    color: "#ffffff",
    lineHeight: 1,
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "#a5b4fc",
  },
  answersTally: {
    fontSize: 15,
    color: "#9ca3af",
  },
  qCard: {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 24,
    padding: "36px 40px",
    textAlign: "center",
    marginBottom: 24,
    minHeight: 180,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  qText: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    lineHeight: 1.4,
  },
  qImage: {
    maxHeight: 200,
    borderRadius: 12,
    marginTop: 16,
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  optionCard: {
    padding: "24px 28px",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    gap: 20,
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 700,
    minHeight: 100,
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)",
  },
  optShape: {
    fontSize: 32,
  },
  optText: {
    flex: 1,
  },

  // RESULTS
  resultsContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsQText: {
    fontSize: 20,
    color: "#9ca3af",
    marginBottom: 28,
  },
  nextBtn: {
    backgroundColor: "#6366f1",
    color: "#ffffff",
    border: "none",
    padding: "12px 24px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  chartArea: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 24,
    alignItems: "flex-end",
  },
  chartCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barWrapper: {
    width: "100%",
    height: 320,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  barFill: {
    width: "85%",
    borderRadius: "16px 16px 0 0",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 12,
    transition: "height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  barPct: {
    fontSize: 20,
    fontWeight: 900,
    color: "#ffffff",
  },
  barFooter: {
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  barLabelPill: {
    padding: "4px 12px",
    borderRadius: 9999,
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 8,
  },
  barOptionText: {
    fontSize: 14,
    color: "#d1d5db",
    fontWeight: 600,
  },
  correctBadge: {
    marginTop: 6,
    color: "#22c55e",
    fontWeight: 800,
    fontSize: 13,
  },

  // LEADERBOARD
  leaderboardContainer: {
    maxWidth: 800,
    margin: "0 auto",
    width: "100%",
  },
  leaderboardList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 24,
  },
  leaderboardRow: {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: "18px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rankBadge: {
    fontSize: 20,
    fontWeight: 900,
    color: "#38bdf8",
    width: 40,
  },
  leaderboardName: {
    fontSize: 18,
    fontWeight: 700,
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  streakPill: {
    backgroundColor: "#f97316",
    color: "#ffffff",
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 9999,
    fontWeight: 700,
  },
  leaderboardScore: {
    fontSize: 20,
    fontWeight: 900,
    color: "#22c55e",
  },

  // PODIUM
  podiumContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  podiumHeading: {
    fontSize: 38,
    fontWeight: 900,
    margin: 0,
  },
  podiumSub: {
    fontSize: 18,
    color: "#9ca3af",
    marginBottom: 48,
  },
  podiumRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 20,
    width: "100%",
    maxWidth: 700,
    marginBottom: 48,
  },
  podiumStep: {
    flex: 1,
    borderRadius: "20px 20px 0 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  podiumCrown: {
    fontSize: 36,
    marginBottom: 8,
  },
  podiumPlayerName: {
    fontSize: 18,
    fontWeight: 800,
    color: "#ffffff",
  },
  podiumPoints: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: 12,
  },
  podiumRankLabel: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.8)",
  },
  podiumFooter: {
    display: "flex",
    gap: 16,
  },
  exportBtn: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    padding: "16px 36px",
    borderRadius: 14,
    fontSize: 17,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
  },
};
