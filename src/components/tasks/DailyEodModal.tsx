import React, { useState } from "react";
import { X, CalendarCheck, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../ui/Button";

interface DailyEodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (logData: { completedSummary: string; planTomorrow: string; blockers?: string }) => void;
}

export default function DailyEodModal({
  isOpen,
  onClose,
  onSubmit,
}: DailyEodModalProps) {
  if (!isOpen) return null;

  const [completedSummary, setCompletedSummary] = useState("");
  const [planTomorrow, setPlanTomorrow] = useState("");
  const [blockers, setBlockers] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedSummary.trim() || !planTomorrow.trim()) return;
    onSubmit({
      completedSummary: completedSummary.trim(),
      planTomorrow: planTomorrow.trim(),
      blockers: blockers.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                1-Minute Daily EOD Check-in
              </h3>
              <p className="text-[11px] text-zinc-500">
                Align with your team and capture today's progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>What did you work on / complete today? <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="• Uploaded module 3 video lessons&#10;• Verified quiz questions for AI pathway"
              value={completedSummary}
              onChange={(e) => setCompletedSummary(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>What is your primary focus for tomorrow? <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="• Prepare slide deck for NSUT presentation"
              value={planTomorrow}
              onChange={(e) => setPlanTomorrow(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Any blockers or assistance needed? (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Need access to Canva team folder"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" className="text-xs font-bold px-5">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Submit Daily EOD
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
