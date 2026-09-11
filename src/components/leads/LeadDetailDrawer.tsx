import React, { useState } from "react";
import {
  X,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  Calendar,
  Clock,
  Flame,
  Sun,
  Snowflake,
  AlertTriangle,
  MessageCircle,
  PhoneCall,
  User,
  CheckCircle2,
  Link2,
  Edit3,
  Trash2,
  ChevronRight,
  Shield,
  Tag,
  ArrowRight,
  FileText,
} from "lucide-react";
import {
  useGetLeadByIdQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
} from "../../store";
import { formatTeamMemberLabel } from "../../utils/permissions";
import LogCallModal from "./LogCallModal";
import { getLeadSlaInfo } from "../../utils/leads-sla";
import LeadSlaBadge from "./LeadSlaBadge";

interface LeadDetailDrawerProps {
  leadId: string | null;
  baseUrl: string;
  onClose: () => void;
  onEditLead?: (lead: any) => void;
  teamMembers?: Array<any>;
}

const QUALITY_CONFIG: Record<string, { label: string; icon: any; badgeClass: string }> = {
  HOT: { label: "Hot Lead", icon: Flame, badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  WARM: { label: "Warm Lead", icon: Sun, badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  COLD: { label: "Cold Lead", icon: Snowflake, badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  POOR: { label: "Poor Fit", icon: AlertTriangle, badgeClass: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20" },
  UNQUALIFIED: { label: "Unqualified", icon: AlertTriangle, badgeClass: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20" },
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  ATTEMPTED: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  CONTACTED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  INTERESTED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  FOLLOW_UP_SCHEDULED: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  DEMO_GIVEN: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  CONVERTED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  LOST: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  JUNK: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-500 border-zinc-500/20",
};

export default function LeadDetailDrawer({
  leadId,
  baseUrl,
  onClose,
  onEditLead,
  teamMembers = [],
}: LeadDetailDrawerProps) {
  const { data: leadRes, isLoading, refetch } = useGetLeadByIdQuery(
    { baseUrl, id: leadId || "" },
    { skip: !leadId }
  );
  const [updateLead] = useUpdateLeadMutation();
  const [deleteLead] = useDeleteLeadMutation();

  const [showLogCall, setShowLogCall] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const lead = (leadRes?.id ? leadRes : leadRes?.data) || null;

  if (!leadId) return null;

  const handleAssigneeChange = async (userId: string) => {
    try {
      await updateLead({
        baseUrl,
        id: leadId,
        data: { assignedToUserId: userId || null },
      }).unwrap();
    } catch (err) {
      console.error("Failed to assign lead:", err);
    }
  };

  const handleQualityChange = async (quality: string) => {
    try {
      await updateLead({
        baseUrl,
        id: leadId,
        data: { quality },
      }).unwrap();
    } catch (err) {
      console.error("Failed to update quality:", err);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateLead({
        baseUrl,
        id: leadId,
        data: { status },
      }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLead({ baseUrl, id: leadId }).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  const cleanPhone = lead?.phone?.replace(/[^\d]/g, "") || "";
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${encodeURIComponent(
    `Hi ${lead?.name || "there"}, this is regarding your interest with Unisole.`
  )}`;

  const qualityInfo = QUALITY_CONFIG[lead?.quality || "WARM"] || QUALITY_CONFIG.WARM;
  const QualityIcon = qualityInfo.icon;

  const sla = lead ? getLeadSlaInfo(lead) : null;
  const nextCallDate = lead?.nextCallAt ? new Date(lead.nextCallAt) : null;
  const isOverdue =
    nextCallDate &&
    nextCallDate < new Date() &&
    lead?.status !== "CONVERTED" &&
    lead?.status !== "LOST";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md ${
                  lead?.quality === "HOT"
                    ? "bg-gradient-to-tr from-rose-500 to-amber-500"
                    : lead?.quality === "WARM"
                    ? "bg-gradient-to-tr from-amber-500 to-orange-500"
                    : "bg-gradient-to-tr from-indigo-500 to-purple-600"
                }`}
              >
                {(lead?.name || "L").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {lead?.name || "Lead Details"}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {/* Quality Pill */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${qualityInfo.badgeClass}`}
                  >
                    <QualityIcon className="w-3 h-3" />
                    <span>{qualityInfo.label}</span>
                  </span>

                  {/* Status Pill */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      STATUS_COLORS[lead?.status || "NEW"] || STATUS_COLORS.NEW
                    }`}
                  >
                    {lead?.status?.replace(/_/g, " ") || "NEW"}
                  </span>

                  {/* Stage & SLA Schedule Pill */}
                  {lead && <LeadSlaBadge lead={lead} showStage={true} />}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-zinc-400">Loading lead profile & history...</div>
          ) : !lead ? (
            <div className="p-12 text-center text-zinc-400">Lead not found or has been removed.</div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Quick Communication Actions */}
              <div className="grid grid-cols-3 gap-2.5">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Lead</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 transition-all shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => setShowLogCall(true)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Log Notes</span>
                </button>
              </div>

              {/* Lead Information Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Profile & Academic Info
                  </span>
                  {onEditLead && (
                    <button
                      onClick={() => onEditLead(lead)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Info</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Phone</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{lead.phone}</span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Email</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                      {lead.email || "Not specified"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-semibold">College</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                      {lead.collegeName || "Not assigned"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Branch / Year</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {lead.branch || "General"} {lead.yearOfStudy ? `(${lead.yearOfStudy})` : ""}
                    </span>
                  </div>
                </div>

                {/* Assigned Team Member & Status Changers */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Assigned Rep / Staff
                    </label>
                    <select
                      value={lead.assignedToUserId || ""}
                      onChange={(e) => handleAssigneeChange(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {formatTeamMemberLabel(m)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Lead Quality
                    </label>
                    <select
                      value={lead.quality || "WARM"}
                      onChange={(e) => handleQualityChange(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="HOT">🔥 Hot Lead</option>
                      <option value="WARM">☀️ Warm Lead</option>
                      <option value="COLD">❄️ Cold Lead</option>
                      <option value="POOR">⚠️ Poor / Unfit</option>
                    </select>
                  </div>
                </div>

                {/* Latest Lead Note */}
                {lead.notes && (
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                        Latest Note / Summary
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 whitespace-pre-wrap leading-relaxed">
                      {lead.notes}
                    </p>
                  </div>
                )}

                {/* SLA & Schedule Alert Box */}
                {sla && sla.statusType !== "TERMINAL" && sla.statusType !== "NO_SCHEDULE" && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      sla.isBreached || sla.isOverdue
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                        : sla.isFirstContact
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
                        : "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {sla.isBreached ? (
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 animate-bounce" />
                      ) : (
                        <Clock className="w-5 h-5 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black">
                            {sla.statusType === "FIRST_CONTACT_BREACHED"
                              ? "🚨 SLA BREACHED: 24h Window Expired"
                              : sla.statusType === "FIRST_CONTACT_ACTIVE"
                              ? "⏳ 24h First Contact SLA Active"
                              : sla.statusType === "FOLLOW_UP_OVERDUE"
                              ? "⚠️ Overdue Follow-up Call"
                              : "📅 Scheduled Follow-up"}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/60 dark:bg-zinc-900/60 font-bold">
                            {sla.countdownText}
                          </span>
                        </div>
                        <span className="text-[11px] opacity-80 block mt-0.5 font-mono">
                          {sla.isFirstContact
                            ? `Target: Contact within 24h of arrival (${sla.formattedTargetTime})`
                            : `Due: ${sla.formattedTargetTime}`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowLogCall(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-xs shrink-0 transition-transform active:scale-95 ${
                        sla.isBreached || sla.isOverdue
                          ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                          : "bg-white dark:bg-zinc-900 border border-current hover:opacity-80"
                      }`}
                    >
                      {sla.isFirstContact ? "Contact Now" : "Call Now"}
                    </button>
                  </div>
                )}
              </div>

              {/* Call History & Discussion Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Call Notes & Discussion History
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLogCall(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                      title="Log a new call note"
                    >
                      <FileText className="w-3 h-3" />
                      <span>+ Log Call Note</span>
                    </button>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {lead.callLogs?.length || 0} calls
                    </span>
                  </div>
                </div>

                {(!lead.callLogs || lead.callLogs.length === 0) ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-500">No call notes logged yet for this lead.</p>
                    <button
                      onClick={() => setShowLogCall(true)}
                      className="mt-3 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Log First Call Note</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800 before:z-0">
                    {lead.callLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="relative z-10 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2.5 ml-7"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-[35px] top-4 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-900 shadow-xs" />

                        {/* Caller info & time */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {log.callerName}
                            </span>
                            {log.callDurationSeconds > 0 && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                ({Math.round(log.callDurationSeconds / 60)} min)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {new Date(log.createdAt).toLocaleString("en-IN", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>

                        {/* Outcome Badge */}
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                            {log.outcome?.replace(/_/g, " ")}
                          </span>
                        </div>

                        {/* Notes Content */}
                        <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                            <FileText className="w-3 h-3 text-indigo-500" />
                            <span>Discussion Note:</span>
                          </div>
                          <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
                            {log.notes}
                          </p>
                        </div>

                        {/* Next schedule or recording */}
                        {log.scheduledNextCallAt && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Follow-up scheduled:{" "}
                              {new Date(log.scheduledNextCallAt).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        )}

                        {log.recordingUrl && (
                          <a
                            href={log.recordingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-zinc-500 hover:text-indigo-500 flex items-center gap-1 underline"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>View Call Recording</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Lead</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Call Modal */}
      {showLogCall && lead && (
        <LogCallModal
          lead={lead}
          baseUrl={baseUrl}
          onClose={() => setShowLogCall(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
