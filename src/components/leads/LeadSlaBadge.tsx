import React, { useState, useEffect } from "react";
import { getLeadSlaInfo, LeadSlaInfo } from "../../utils/leads-sla";
import { Clock, AlertTriangle, AlertCircle, Calendar, PhoneCall, CheckCircle2 } from "lucide-react";

interface LeadSlaBadgeProps {
  lead: {
    createdAt?: string;
    callCount?: number;
    lastCallAt?: string | null;
    nextCallAt?: string | null;
    status?: string;
  };
  showStage?: boolean;
}

export default function LeadSlaBadge({ lead, showStage = true }: LeadSlaBadgeProps) {
  // Live tick every 30 seconds so countdowns update in real-time
  const [sla, setSla] = useState<LeadSlaInfo>(() => getLeadSlaInfo(lead));

  useEffect(() => {
    setSla(getLeadSlaInfo(lead));
    const timer = setInterval(() => {
      setSla(getLeadSlaInfo(lead));
    }, 30000);
    return () => clearInterval(timer);
  }, [lead.createdAt, lead.callCount, lead.lastCallAt, lead.nextCallAt, lead.status]);

  if (sla.statusType === "TERMINAL") {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          <CheckCircle2 className="w-3 h-3" />
          <span>{sla.stageLabel}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {/* 1. Contact Stage Indicator */}
      {showStage && (
        <div className="flex items-center gap-1.5">
          {sla.isFirstContact ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 font-mono">
              <PhoneCall className="w-2.5 h-2.5" />
              <span>1st Contact</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 font-mono">
              <span>{sla.stageLabel}</span>
            </span>
          )}
        </div>
      )}

      {/* 2. SLA Countdown & Breach Pill */}
      {sla.statusType === "FIRST_CONTACT_BREACHED" && (
        <div className="flex flex-col items-start gap-0.5 animate-pulse">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>SLA BREACHED</span>
          </span>
          <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 tracking-tight">
            🚨 Contact Immediately!
          </span>
          <span className="text-[9px] text-zinc-400 font-mono">
            {sla.countdownText}
          </span>
        </div>
      )}

      {sla.statusType === "FIRST_CONTACT_ACTIVE" && (
        <div className="flex flex-col items-start gap-0.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] border ${sla.badgeClass}`}>
            <Clock className="w-3 h-3 shrink-0" />
            <span>⏳ 24h SLA: {sla.countdownText}</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            Target: {sla.formattedTargetTime}
          </span>
        </div>
      )}

      {sla.statusType === "FOLLOW_UP_OVERDUE" && (
        <div className="flex flex-col items-start gap-0.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>⚠️ Overdue Follow-up</span>
          </span>
          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 font-mono">
            {sla.countdownText}
          </span>
        </div>
      )}

      {sla.statusType === "FOLLOW_UP_ACTIVE" && (
        <div className="flex flex-col items-start gap-0.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] border ${sla.badgeClass}`}>
            <Calendar className="w-3 h-3 shrink-0" />
            <span>📅 {sla.countdownText}</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            {sla.formattedTargetTime}
          </span>
        </div>
      )}

      {sla.statusType === "NO_SCHEDULE" && (
        <span className="text-[11px] text-zinc-400">Not scheduled</span>
      )}
    </div>
  );
}
