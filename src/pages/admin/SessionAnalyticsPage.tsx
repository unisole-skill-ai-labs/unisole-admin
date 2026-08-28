import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetSessionQuery,
  useGetSessionLeadsQuery,
} from "../../store";
import {
  ArrowLeft,
  Download,
  Users,
  Trophy,
  Calendar,
  Search,
  CheckCircle2,
  GraduationCap,
  Phone,
  Play,
  Flame,
} from "lucide-react";
import Button from "../../components/ui/Button";

export default function SessionAnalyticsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);

  const { data: sessRes, isLoading: isSessLoading } = useGetSessionQuery(
    { baseUrl, id: sessionId! },
    { skip: !sessionId }
  );
  const { data: leadsRes, isLoading: isLeadsLoading } = useGetSessionLeadsQuery(
    { baseUrl, sessionId: sessionId! },
    { skip: !sessionId }
  );

  const [searchQuery, setSearchQuery] = useState("");

  const session = sessRes?.data || null;
  const leads: any[] = leadsRes?.data || [];

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    return (
      (lead.name || "").toLowerCase().includes(q) ||
      (lead.phone || "").toLowerCase().includes(q) ||
      (lead.branch || "").toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const token = localStorage.getItem("token");
    window.open(
      `${baseUrl}/api/admin/presentations/sessions/${sessionId}/leads/export`,
      "_blank"
    );
  };

  const topScorer = leads.length > 0 ? leads[0] : null;
  const totalPoints = leads.reduce((sum, l) => sum + (l.totalScore || 0), 0);
  const avgPoints =
    leads.length > 0 ? Math.round(totalPoints / leads.length) : 0;

  if (isSessLoading || isLeadsLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/presentations")}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {session?.sessionCode}
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                • {session?.collegeName || "Open Roadshow"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              College Roadshow Lead Analytics
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/presentations/live/${sessionId}`)}
            className="flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Open Projector View</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            className="bg-emerald-600 hover:bg-emerald-500 shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({leads.length} Leads)</span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total Captured Leads
            </span>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {leads.length}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Top Scorer (#1 Rank)
            </span>
            <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate block max-w-[180px]">
              {topScorer?.name || "—"}
            </span>
            <span className="text-xs font-mono font-bold text-amber-500">
              {topScorer ? `${topScorer.totalScore} pts` : ""}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Average Quiz Score
            </span>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {avgPoints} pts
            </span>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Student Attendees ({filteredLeads.length})
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-5">Rank</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">WhatsApp Phone</th>
                <th className="py-3 px-4">Branch / Year</th>
                <th className="py-3 px-4">Quiz Score</th>
                <th className="py-3 px-5 text-right">Joined Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-zinc-400 text-xs"
                  >
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead: any, idx: number) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3 px-5">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          idx === 0
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : idx === 1
                            ? "bg-slate-400/10 text-slate-400"
                            : idx === 2
                            ? "bg-amber-700/10 text-amber-700"
                            : "text-zinc-500"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {lead.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                      +91 {lead.phone}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">
                      {lead.branch || "—"}{" "}
                      {lead.yearOfStudy ? `(${lead.yearOfStudy})` : ""}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {lead.totalScore || 0} pts
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-mono text-zinc-400 text-[11px]">
                      {lead.joinedAt
                        ? new Date(lead.joinedAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
