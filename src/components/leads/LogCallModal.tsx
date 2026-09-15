import React, { useState } from "react";
import {
  X,
  PhoneCall,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Link2,
} from "lucide-react";
import { useLogLeadCallMutation } from "../../store";
import { getStatusUpdatePayload, OBJECTION_REASON_OPTIONS } from "../../utils/leadStatus";

interface LogCallModalProps {
  lead: any;
  baseUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CallResultOption {
  id: string;
  label: string;
  emoji: string;
  outcome: string;
  statusKey: string;
  color: string;
  requiresSchedule: boolean;
}

const CALL_RESULTS: CallResultOption[] = [
  {
    id: "FOLLOW_UP",
    label: "Follow-up",
    emoji: "📞",
    outcome: "CONNECTED_FOLLOW_UP",
    statusKey: "FOLLOW_UP",
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    requiresSchedule: true,
  },
  {
    id: "INTERESTED",
    label: "Interested",
    emoji: "🔥",
    outcome: "CONNECTED_INTERESTED",
    statusKey: "INTERESTED",
    color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
    requiresSchedule: true,
  },
  {
    id: "CONVERTED",
    label: "Converted",
    emoji: "🎉",
    outcome: "CONNECTED_CONVERTED",
    statusKey: "CONVERTED",
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    requiresSchedule: false,
  },
  {
    id: "BUSY",
    label: "No Answer / Busy",
    emoji: "📵",
    outcome: "BUSY_NO_ANSWER",
    statusKey: "FOLLOW_UP",
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
    requiresSchedule: true,
  },
  {
    id: "NOT_INTERESTED",
    label: "Not Interested",
    emoji: "❄️",
    outcome: "CONNECTED_NOT_INTERESTED",
    statusKey: "LOST",
    color: "text-zinc-600 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
    requiresSchedule: false,
  },
  {
    id: "WRONG_NUMBER",
    label: "Wrong Number",
    emoji: "🚫",
    outcome: "WRONG_NUMBER",
    statusKey: "NOT_A_LEAD",
    color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
    requiresSchedule: false,
  },
];

export default function LogCallModal({ lead, baseUrl, onClose, onSuccess }: LogCallModalProps) {
  const [logCall, { isLoading }] = useLogLeadCallMutation();

  const [selectedResultId, setSelectedResultId] = useState("FOLLOW_UP");
  const [selectedObjection, setSelectedObjection] = useState(lead?.subStatus || "");
  const [durationMinutes, setDurationMinutes] = useState(2);
  const [notes, setNotes] = useState("");
  const [scheduledNextCall, setScheduledNextCall] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentResult = CALL_RESULTS.find((r) => r.id === selectedResultId) || CALL_RESULTS[0];

  const handleQuickSchedule = (daysFromNow: number, hour: number = 11) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, 0, 0, 0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    setScheduledNextCall(localISOTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!notes.trim()) {
      setErrorMsg("Please enter discussion notes.");
      return;
    }

    try {
      const payload = getStatusUpdatePayload(currentResult.statusKey);

      await logCall({
        baseUrl,
        leadId: lead.id,
        body: {
          outcome: currentResult.outcome,
          notes: notes.trim(),
          subStatus: selectedObjection || undefined,
          callDurationSeconds: durationMinutes * 60,
          newQuality: payload.quality,
          newStatus: payload.status,
          scheduledNextCallAt: currentResult.requiresSchedule && scheduledNextCall
            ? new Date(scheduledNextCall).toISOString()
            : undefined,
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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Log Call: {lead?.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {lead?.phone} {lead?.collegeName ? `• ${lead.collegeName}` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* 1. Single Call Result Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              Call Result
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CALL_RESULTS.map((res) => {
                const isSelected = selectedResultId === res.id;
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => {
                      setSelectedResultId(res.id);
                      if (!res.requiresSchedule) {
                        setScheduledNextCall("");
                      }
                    }}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? `${res.color} shadow-xs scale-[1.02]`
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <span>{res.emoji}</span>
                    <span className="truncate">{res.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Objection / Drop-off Reason Selector (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Student Reason / Objection <span className="text-[10px] font-normal text-zinc-400">(Optional)</span>
              </label>
              {selectedObjection && (
                <button
                  type="button"
                  onClick={() => setSelectedObjection("")}
                  className="text-[10px] text-rose-500 hover:underline font-medium cursor-pointer"
                >
                  Clear reason
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {OBJECTION_REASON_OPTIONS.map((opt) => {
                const isSelected = selectedObjection === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedObjection(isSelected ? "" : opt.key)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? `${opt.badgeCls} ring-2 ring-indigo-500/30 scale-[1.02] font-semibold`
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/60"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Call Notes */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Call Discussion Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did the student say? (e.g. interested in Web Dev, requested fee details...)"
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* 3. Conditional Next Follow-Up Schedule */}
          {currentResult.requiresSchedule && (
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Next Follow-up Call</span>
                </span>
                {scheduledNextCall && (
                  <button
                    type="button"
                    onClick={() => setScheduledNextCall("")}
                    className="text-[11px] text-rose-500 hover:underline font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickSchedule(1, 11)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 cursor-pointer"
                >
                  Tomorrow 11 AM
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSchedule(1, 16)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 cursor-pointer"
                >
                  Tomorrow 4 PM
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSchedule(2, 11)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 cursor-pointer"
                >
                  In 2 Days
                </button>
              </div>

              <input
                type="datetime-local"
                value={scheduledNextCall}
                onChange={(e) => setScheduledNextCall(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          {/* 4. Optional Extra Details Collapsible (Duration & Recording Link) */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
            >
              {showMoreOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showMoreOptions ? "Hide extra details" : "+ Add duration or recording link"}</span>
            </button>

            {showMoreOptions && (
              <div className="mt-3 space-y-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                {/* Duration */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Call Duration
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1, 2, 5, 10, 15].map((min) => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setDurationMinutes(min)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          durationMinutes === min
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                        }`}
                      >
                        {min} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recording Link */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    <span>Recording / Proof URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={recordingUrl}
                    onChange={(e) => setRecordingUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Call Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
