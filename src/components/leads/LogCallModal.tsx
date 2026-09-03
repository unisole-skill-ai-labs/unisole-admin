import React, { useState } from "react";
import {
  X,
  PhoneCall,
  Clock,
  Calendar,
  Sparkles,
  Flame,
  Sun,
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  PhoneForwarded,
  MessageSquare,
  Link2,
} from "lucide-react";
import { useLogLeadCallMutation } from "../../store";

interface LogCallModalProps {
  lead: any;
  baseUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const OUTCOMES = [
  { id: "CONNECTED_INTERESTED", label: "Connected - Interested", icon: Flame, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  { id: "CONNECTED_FOLLOW_UP", label: "Connected - Follow-up Needed", icon: PhoneForwarded, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  { id: "CONNECTED_CONVERTED", label: "Converted / Enrolled 🎉", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  { id: "CONNECTED_NOT_INTERESTED", label: "Not Interested", icon: X, color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/30" },
  { id: "CALL_BACK_REQUESTED", label: "Call Back Requested", icon: Clock, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" },
  { id: "BUSY_NO_ANSWER", label: "No Answer / Busy", icon: PhoneCall, color: "text-orange-500 bg-orange-500/10 border-orange-500/30" },
  { id: "WRONG_NUMBER", label: "Wrong Number / Invalid", icon: AlertTriangle, color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
];

const QUALITIES = [
  { id: "HOT", label: "Hot Lead", icon: Flame, color: "bg-rose-500 text-white" },
  { id: "WARM", label: "Warm Lead", icon: Sun, color: "bg-amber-500 text-white" },
  { id: "COLD", label: "Cold Lead", icon: Snowflake, color: "bg-blue-500 text-white" },
  { id: "POOR", label: "Poor / Unfit", icon: AlertTriangle, color: "bg-zinc-600 text-white" },
];

export default function LogCallModal({ lead, baseUrl, onClose, onSuccess }: LogCallModalProps) {
  const [logCall, { isLoading }] = useLogLeadCallMutation();

  const [outcome, setOutcome] = useState("CONNECTED_INTERESTED");
  const [durationMinutes, setDurationMinutes] = useState(3);
  const [notes, setNotes] = useState("");
  const [quality, setQuality] = useState(lead?.quality || "WARM");
  const [status, setStatus] = useState(lead?.status || "CONTACTED");
  const [scheduledNextCall, setScheduledNextCall] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleQuickSchedule = (daysFromNow: number, hour: number = 11) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, 0, 0, 0);
    // format as YYYY-MM-DDTHH:mm
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    setScheduledNextCall(localISOTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!notes.trim()) {
      setErrorMsg("Please enter call discussion notes.");
      return;
    }

    try {
      let resolvedStatus = status;
      if (outcome === "CONNECTED_CONVERTED") {
        resolvedStatus = "CONVERTED";
      } else if (outcome === "CONNECTED_INTERESTED" && status === "NEW") {
        resolvedStatus = "INTERESTED";
      } else if (outcome === "CONNECTED_FOLLOW_UP" && scheduledNextCall) {
        resolvedStatus = "FOLLOW_UP_SCHEDULED";
      }

      await logCall({
        baseUrl,
        leadId: lead.id,
        data: {
          outcome,
          notes: notes.trim(),
          callDurationSeconds: durationMinutes * 60,
          newQuality: quality,
          newStatus: resolvedStatus,
          scheduledNextCallAt: scheduledNextCall ? new Date(scheduledNextCall).toISOString() : undefined,
          recordingUrl: recordingUrl.trim() || undefined,
        },
      }).unwrap();

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || "Failed to log call note.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Log Call with {lead?.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <span>{lead?.phone}</span>
                {lead?.collegeName && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{lead.collegeName}</span>
                  </>
                )}
                {lead?.branch && (
                  <>
                    <span>•</span>
                    <span>{lead.branch}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 1. Call Outcome */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              Call Outcome <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OUTCOMES.map((item) => {
                const isSelected = outcome === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setOutcome(item.id);
                      if (item.id === "CONNECTED_CONVERTED") {
                        setQuality("HOT");
                        setStatus("CONVERTED");
                      }
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                      isSelected
                        ? `${item.color} font-bold shadow-xs scale-[1.01]`
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Call Discussion Notes */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Discussion Notes <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-normal text-zinc-400">Detailed points & key student feedback</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Student wants to learn Web Development & AI, requested placement assurance details. Very positive response, asked to follow up tomorrow with fee breakup."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* 3. Duration & Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Call Duration */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Call Duration (Minutes)
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 5, 10, 15].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setDurationMinutes(min)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      durationMinutes === min
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            {/* Lead Quality */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Lead Quality Score
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {QUALITIES.map((q) => {
                  const isSelected = quality === q.id;
                  const Icon = q.icon;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQuality(q.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? `${q.color} shadow-xs`
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{q.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Schedule Next Follow-Up Call */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Schedule Next Follow-Up Call</span>
              </label>
              {scheduledNextCall && (
                <button
                  type="button"
                  onClick={() => setScheduledNextCall("")}
                  className="text-[11px] text-rose-500 hover:underline font-semibold"
                >
                  Clear Schedule
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickSchedule(1, 11)}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500"
              >
                Tomorrow 11 AM
              </button>
              <button
                type="button"
                onClick={() => handleQuickSchedule(1, 16)}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500"
              >
                Tomorrow 4 PM
              </button>
              <button
                type="button"
                onClick={() => handleQuickSchedule(2, 11)}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500"
              >
                In 2 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickSchedule(7, 11)}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500"
              >
                Next Week
              </button>
            </div>

            <input
              type="datetime-local"
              value={scheduledNextCall}
              onChange={(e) => setScheduledNextCall(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* 5. Optional Recording/Proof URL */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              <span>Call Recording / Proof Link (Optional)</span>
            </label>
            <input
              type="url"
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Saving Call Note...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Call Note</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
