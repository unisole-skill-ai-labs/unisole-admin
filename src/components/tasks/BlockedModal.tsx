import React, { useState } from "react";
import { X, AlertTriangle, Send } from "lucide-react";
import Button from "../ui/Button";

interface BlockedModalProps {
  isOpen: boolean;
  task: any | null;
  onClose: () => void;
  onSubmit: (taskId: string, reason: string) => void;
}

export default function BlockedModal({
  isOpen,
  task,
  onClose,
  onSubmit,
}: BlockedModalProps) {
  if (!isOpen || !task) return null;

  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(task.id, reason.trim());
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-900 dark:text-rose-100">
                Flag Task as Blocked / Stuck
              </h3>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Alerts leadership immediately on the Leader Radar
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-xs">
            <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block mb-0.5">
              Task
            </span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">
              {task.title}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              What is blocking you? <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Waiting for video file upload from editor, or need Dean contact info..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              className="bg-rose-600 hover:bg-rose-700 text-xs font-bold px-4"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
              Flag as Blocked
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
