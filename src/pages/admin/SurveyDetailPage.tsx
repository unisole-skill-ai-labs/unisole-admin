import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetSurveyDetailQuery,
  useGetSurveyResponsesQuery,
  useGetSurveyStatsQuery,
  useUpdateSurveyMutation,
} from "../../store";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Search,
  Filter,
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  X,
  FileSpreadsheet,
  Settings,
  BarChart3,
  ListOrdered,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import { getSurveyPublicUrl } from "../../utils/surveyUrl";

export default function SurveyDetailPage() {
  const { slug = "student-skills-survey" } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "responses";
  const navigate = useNavigate();

  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const token = useSelector((s: any) => s.auth.token);

  // Queries
  const {
    data: surveyRes,
    isLoading: isSurveyLoading,
    refetch: refetchSurvey,
  } = useGetSurveyDetailQuery({ baseUrl, slug });
  const survey = surveyRes?.data;

  // Filter state for responses
  const [searchTerm, setSearchTerm] = useState("");
  const [streamFilter, setStreamFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyLink = () => {
    const url = getSurveyPublicUrl(survey?.slug);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 3000);
  };

  const {
    data: responsesRes,
    isLoading: isResponsesLoading,
    refetch: refetchResponses,
  } = useGetSurveyResponsesQuery({
    baseUrl,
    slug,
    params: {
      search: searchTerm || undefined,
      stream: streamFilter || undefined,
      yearOfStudy: yearFilter || undefined,
      limit: 100,
    },
  });
  const responses = responsesRes?.data || [];

  const { data: statsRes } = useGetSurveyStatsQuery({ baseUrl, slug });
  const stats = statsRes?.data;

  // Mutation for updating survey schema & settings
  const [updateSurvey, { isLoading: isSaving }] = useUpdateSurveyMutation();

  // Schema Editor Form State
  const [editableTitle, setEditableTitle] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [editableIsActive, setEditableIsActive] = useState(true);
  const [editableQuestions, setEditableQuestions] = useState<any[]>([]);
  const [schemaInitialized, setSchemaInitialized] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");

  // Sync schema state when survey is loaded
  React.useEffect(() => {
    if (survey && !schemaInitialized) {
      setEditableTitle(survey.title || "");
      setEditableDescription(survey.description || "");
      setEditableIsActive(survey.isActive ?? true);
      setEditableQuestions(
        survey.schema?.questions ? JSON.parse(JSON.stringify(survey.schema.questions)) : []
      );
      setSchemaInitialized(true);
    }
  }, [survey, schemaInitialized]);

  // CSV Export Handler
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(`${baseUrl}/api/admin/surveys/${slug}/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to export CSV");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey-${slug}-responses-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert("Error exporting CSV: " + (err.message || err));
    } finally {
      setIsExporting(false);
    }
  };

  // Save Schema Handler
  const handleSaveSchema = async () => {
    try {
      setSaveSuccessMsg("");
      setSaveErrorMsg("");
      const updatedSchema = {
        ...(survey?.schema || {}),
        questions: editableQuestions,
      };

      await updateSurvey({
        baseUrl,
        slug,
        body: {
          title: editableTitle,
          description: editableDescription,
          isActive: editableIsActive,
          schema: updatedSchema,
        },
      }).unwrap();

      setSaveSuccessMsg("Survey schema saved successfully!");
      refetchSurvey();
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setSaveErrorMsg(err?.data?.message || err.message || "Failed to save survey schema");
    }
  };

  // Add Question to Schema
  const handleAddQuestion = () => {
    const newId = `q_custom_${Date.now()}`;
    setEditableQuestions((prev) => [
      ...prev,
      {
        id: newId,
        title: "New Survey Question",
        type: "single-select",
        required: false,
        category: "General",
        options: ["Option 1", "Option 2"],
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (idx: number) => {
    setEditableQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update question field
  const handleUpdateQuestion = (idx: number, field: string, val: any) => {
    setEditableQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Add Option to Question
  const handleAddOption = (qIdx: number, optText: string) => {
    if (!optText.trim()) return;
    setEditableQuestions((prev) => {
      const copy = [...prev];
      const currentOpts = copy[qIdx].options || [];
      copy[qIdx] = { ...copy[qIdx], options: [...currentOpts, optText.trim()] };
      return copy;
    });
  };

  // Remove Option from Question
  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    setEditableQuestions((prev) => {
      const copy = [...prev];
      const currentOpts = copy[qIdx].options || [];
      copy[qIdx] = { ...copy[qIdx], options: currentOpts.filter((_: any, i: number) => i !== optIdx) };
      return copy;
    });
  };

  if (isSurveyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-600 mb-3" />
        <p className="text-sm font-semibold">Loading survey configuration...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Survey Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1">Slug '{slug}' does not match any survey record.</p>
        <Button onClick={() => navigate("/surveys")} className="mt-4">
          Back to Surveys
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/surveys")}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Surveys</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {survey.title}
            </h1>
            {survey.isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Active
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-mono">
            slug: <span className="font-bold text-zinc-700 dark:text-zinc-300">{survey.slug}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300"
          >
            {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{hasCopied ? "Link Copied!" : "Copy Link"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </Button>

          <a
            href={getSurveyPublicUrl(survey.slug)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Form</span>
          </a>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <button
          onClick={() => setSearchParams({ tab: "responses" })}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "responses"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Responses & Data ({responses.length})</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: "schema" })}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "schema"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Question & Schema Editor ({editableQuestions.length} Questions)</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: "analytics" })}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "analytics"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Breakdown</span>
        </button>
      </div>

      {/* TAB 1: RESPONSES & DATA */}
      {activeTab === "responses" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by student name, phone, college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={streamFilter}
                onChange={(e) => setStreamFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              >
                <option value="">All Streams</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.Com">B.Com</option>
                <option value="B.Sc CS / IT">B.Sc CS / IT</option>
                <option value="B.Sc">B.Sc</option>
                <option value="B.A.">B.A.</option>
                <option value="BBA">BBA</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              >
                <option value="">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="Final Year">Final Year</option>
                <option value="Graduated">Graduated</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchResponses()}
                className="text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            {isResponsesLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <RefreshCw className="w-6 h-6 animate-spin text-violet-500 mb-2" />
                <p className="text-xs">Loading responses...</p>
              </div>
            ) : responses.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  No Responses Found
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Responses submitted by students will show up here in real time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Stream & Year</th>
                      <th className="py-3 px-4">Institution</th>
                      <th className="py-3 px-4">Sync Status</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-medium">
                    {responses.map((resp: any) => {
                      const studentName = resp.user?.name || resp.answers?.student_name || "Anonymous";
                      const phone = resp.user?.phone || resp.answers?.student_phone || "-";
                      const stream = resp.answers?.student_stream || resp.answers?.stream || "-";
                      const year = resp.answers?.student_year || resp.answers?.year || "-";
                      const college =
                        resp.college?.name ||
                        resp.answers?.student_college ||
                        resp.answers?.college ||
                        "-";

                      return (
                        <tr
                          key={resp.id}
                          className="hover:bg-violet-50/30 dark:hover:bg-violet-950/20 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">
                              {studentName}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              ID: {resp.id.slice(0, 8)}...
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                            {phone}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-800 dark:text-zinc-200 mr-1.5">
                              {stream}
                            </span>
                            <span className="text-zinc-400 text-[11px]">{year}</span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 max-w-[200px] truncate">
                            {college}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                LEARNER
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                LEAD
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                                ENROLLED
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                            {new Date(resp.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedResponse(resp)}
                              className="text-xs font-semibold flex items-center gap-1.5 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Answers</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE QUESTION & SCHEMA EDITOR */}
      {activeTab === "schema" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Save Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-violet-500" />
                <span>Live Survey Schema & Question Editor</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Modify survey titles, add questions, edit option tags, and customize the form layout
                live.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 border-violet-300 text-violet-700 dark:text-violet-300"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </Button>

              <Button
                size="sm"
                onClick={handleSaveSchema}
                disabled={isSaving}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </div>

          {/* Feedback Messages */}
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
          {saveErrorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{saveErrorMsg}</span>
            </div>
          )}

          {/* Survey General Settings */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Survey Title
                </label>
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Campaign Status
                </label>
                <label className="flex items-center gap-3 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={editableIsActive}
                    onChange={(e) => setEditableIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Active & Accepting Submissions
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Survey Description & Subtitle
              </label>
              <textarea
                rows={2}
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Questions Editor List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                Questions ({editableQuestions.length})
              </h3>
              <span className="text-xs text-zinc-400">
                Contact details (Name, Phone, College, Year) are automatically requested at the final
                step.
              </span>
            </div>

            {editableQuestions.map((q: any, idx: number) => (
              <div
                key={q.id || idx}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-400">
                      ID: {q.id}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                      Question Prompt / Title
                    </label>
                    <input
                      type="text"
                      value={q.title || ""}
                      onChange={(e) => handleUpdateQuestion(idx, "title", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                      Question Type
                    </label>
                    <select
                      value={q.type || "single-select"}
                      onChange={(e) => handleUpdateQuestion(idx, "type", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="single-select">Single Select (Radio)</option>
                      <option value="multi-select">Multi Select (Chips)</option>
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                    </select>
                  </div>
                </div>

                {/* Options tag editor for select types */}
                {(q.type === "single-select" || q.type === "multi-select" || !q.type) && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                    <label className="block text-[11px] font-bold text-zinc-500">
                      Options / Choices ({q.options?.length || 0})
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(q.options || []).map((opt: string, optIdx: number) => (
                        <span
                          key={optIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                        >
                          <span>{opt}</span>
                          <button
                            onClick={() => handleRemoveOption(idx, optIdx)}
                            className="text-zinc-400 hover:text-rose-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add option input */}
                    <div className="flex items-center gap-2 max-w-sm pt-1">
                      <input
                        type="text"
                        placeholder="Add new option choice..."
                        id={`new-opt-${idx}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOption(idx, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                        className="flex-1 px-3 py-1 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const input = document.getElementById(`new-opt-${idx}`) as HTMLInputElement;
                          if (input && input.value) {
                            handleAddOption(idx, input.value);
                            input.value = "";
                          }
                        }}
                        className="text-xs"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & BREAKDOWN */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400 mb-3">
                Stream Distribution
              </h3>
              {stats?.byStream ? (
                <div className="space-y-2">
                  {Object.entries(stats.byStream).map(([stream, count]: [string, any]) => (
                    <div key={stream} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{stream}</span>
                      <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                        {count} ({Math.round((count / (stats.totalResponses || 1)) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">No stream distribution data yet.</p>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400 mb-3">
                Academic Year Breakdown
              </h3>
              {stats?.byYear ? (
                <div className="space-y-2">
                  {Object.entries(stats.byYear).map(([year, count]: [string, any]) => (
                    <div key={year} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{year}</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">No year breakdown data yet.</p>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400 mb-3">
                Top Participating Campuses
              </h3>
              {stats?.byCollege ? (
                <div className="space-y-2">
                  {Object.entries(stats.byCollege).slice(0, 6).map(([college, count]: [string, any]) => (
                    <div key={college} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]">
                        {college}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">No college data yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Response Details Drawer / Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedResponse.user?.name || selectedResponse.answers?.student_name || "Student Submission"}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Phone: {selectedResponse.user?.phone || selectedResponse.answers?.student_phone || "-"}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Q&A list */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200/60 dark:border-zinc-700/60 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-400 font-bold uppercase text-[10px] block">Stream</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {selectedResponse.answers?.student_stream || selectedResponse.answers?.stream || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 font-bold uppercase text-[10px] block">Year</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {selectedResponse.answers?.student_year || selectedResponse.answers?.year || "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-zinc-400 font-bold uppercase text-[10px] block">College</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {selectedResponse.college?.name || selectedResponse.answers?.student_college || "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Survey Question Responses
                </h4>
                {Object.entries(selectedResponse.answers || {})
                  .filter(([key]) => !key.startsWith("student_"))
                  .map(([qKey, aVal]: [string, any]) => (
                    <div
                      key={qKey}
                      className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800"
                    >
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        {qKey.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {Array.isArray(aVal) ? aVal.join(", ") : String(aVal)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <Button size="sm" onClick={() => setSelectedResponse(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
