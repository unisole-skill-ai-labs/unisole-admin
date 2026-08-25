import React, { useState } from "react";

const DEFAULT_OPTIONS = [
  { id: "opt_1", text: "Option A", is_correct: true },
  { id: "opt_2", text: "Option B", is_correct: false },
  { id: "opt_3", text: "Option C", is_correct: false },
  { id: "opt_4", text: "Option D", is_correct: false },
];

export default function LiveQuizEditorModal({ baseUrl, onClose, onQuizCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    {
      question_text: "Sample Question 1: What is the primary purpose of...",
      type: "mcq",
      time_limit_sec: 30,
      image_url: "",
      options: [...DEFAULT_OPTIONS],
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAddQuestion = () => {
    if (questions.length >= 20) {
      alert("Maximum 20 questions allowed per live quiz pack");
      return;
    }
    setQuestions([
      ...questions,
      {
        question_text: `Question ${questions.length + 1}`,
        type: "mcq",
        time_limit_sec: 30,
        image_url: "",
        options: [
          { id: "opt_1", text: "Option A", is_correct: true },
          { id: "opt_2", text: "Option B", is_correct: false },
          { id: "opt_3", text: "Option C", is_correct: false },
          { id: "opt_4", text: "Option D", is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length === 1) {
      alert("At least 1 question is required");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx, text) => {
    const next = [...questions];
    next[idx].question_text = text;
    setQuestions(next);
  };

  const handleTypeChange = (idx, type) => {
    const next = [...questions];
    next[idx].type = type;
    if (type === "true_false") {
      next[idx].options = [
        { id: "opt_1", text: "True", is_correct: true },
        { id: "opt_2", text: "False", is_correct: false },
      ];
    } else {
      next[idx].options = [
        { id: "opt_1", text: "Option A", is_correct: true },
        { id: "opt_2", text: "Option B", is_correct: false },
        { id: "opt_3", text: "Option C", is_correct: false },
        { id: "opt_4", text: "Option D", is_correct: false },
      ];
    }
    setQuestions(next);
  };

  const handleOptionTextChange = (qIdx, optIdx, text) => {
    const next = [...questions];
    next[qIdx].options[optIdx].text = text;
    setQuestions(next);
  };

  const handleCorrectOptionChange = (qIdx, optId) => {
    const next = [...questions];
    next[qIdx].options = next[qIdx].options.map((opt) => ({
      ...opt,
      is_correct: opt.id === optId,
    }));
    setQuestions(next);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a Quiz Title");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${baseUrl}/api/live/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          questions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create quiz");
      }

      const created = await res.json();
      onQuizCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save quiz pack");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalStyles.backdrop}>
      <div style={modalStyles.modalCard}>
        <div style={modalStyles.header}>
          <h2>Create New Live Quiz Pack</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSaveQuiz} style={modalStyles.body}>
          {error && <div style={modalStyles.errorBanner}>{error}</div>}

          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>Quiz Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Campus Placement Logic & Web Masterclass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>Description</label>
            <input
              type="text"
              placeholder="Optional summary or workshop details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={modalStyles.input}
            />
          </div>

          {/* Questions Builder */}
          <div style={modalStyles.questionsSection}>
            <div style={modalStyles.sectionHeader}>
              <h3>Questions ({questions.length})</h3>
              <button
                type="button"
                style={modalStyles.addQBtn}
                onClick={handleAddQuestion}
              >
                + Add Question
              </button>
            </div>

            <div style={modalStyles.qList}>
              {questions.map((q, qIdx) => (
                <div key={qIdx} style={modalStyles.qBox}>
                  <div style={modalStyles.qBoxHeader}>
                    <span style={modalStyles.qNumBadge}>Q{qIdx + 1}</span>
                    <div style={modalStyles.typeSelectGroup}>
                      <select
                        value={q.type}
                        onChange={(e) => handleTypeChange(qIdx, e.target.value)}
                        style={modalStyles.select}
                      >
                        <option value="mcq">Multiple Choice (4 Options)</option>
                        <option value="true_false">True / False (2 Options)</option>
                      </select>
                      <button
                        type="button"
                        style={modalStyles.removeQBtn}
                        onClick={() => handleRemoveQuestion(qIdx)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Enter question text here..."
                    value={q.question_text}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    style={modalStyles.qInput}
                  />

                  {/* Options */}
                  <div style={modalStyles.optionsContainer}>
                    <label style={modalStyles.optionsLabel}>
                      Select the correct answer option:
                    </label>
                    <div style={modalStyles.optionsGrid}>
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={opt.id}
                          style={{
                            ...modalStyles.optionRow,
                            borderColor: opt.is_correct ? "#22c55e" : "#e2e8f0",
                            backgroundColor: opt.is_correct ? "#f0fdf4" : "#ffffff",
                          }}
                        >
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={opt.is_correct}
                            onChange={() => handleCorrectOptionChange(qIdx, opt.id)}
                            style={modalStyles.radio}
                          />
                          <input
                            type="text"
                            required
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                            style={modalStyles.optionInput}
                          />
                          {opt.is_correct && (
                            <span style={modalStyles.correctTag}>Correct ✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={modalStyles.footer}>
            <button type="button" style={modalStyles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={modalStyles.saveBtn}>
              {saving ? "Saving Quiz..." : "Save Quiz Pack"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
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
    maxWidth: 820,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    overflow: "hidden",
  },
  header: {
    padding: "20px 28px",
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
    padding: "24px 28px",
    overflowY: "auto",
    flex: 1,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontWeight: 700,
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 15,
    boxSizing: "border-box",
  },
  questionsSection: {
    marginTop: 24,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 20,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addQBtn: {
    backgroundColor: "#e0e7ff",
    color: "#4f46e5",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  qList: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  qBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 18,
  },
  qBoxHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  qNumBadge: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    padding: "3px 10px",
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 800,
  },
  typeSelectGroup: {
    display: "flex",
    gap: 10,
  },
  select: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 13,
    backgroundColor: "#ffffff",
  },
  removeQBtn: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  qInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 16,
    boxSizing: "border-box",
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 8,
    display: "block",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "8px 12px",
  },
  radio: {
    cursor: "pointer",
    width: 16,
    height: 16,
  },
  optionInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: 14,
    outline: "none",
  },
  correctTag: {
    color: "#16a34a",
    fontSize: 11,
    fontWeight: 800,
  },
  footer: {
    marginTop: 24,
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 16,
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  saveBtn: {
    padding: "10px 24px",
    borderRadius: 10,
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
  },
};
