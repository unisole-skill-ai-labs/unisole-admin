import React, { useState, useEffect } from "react";
import { getLeadSlaInfo, LeadSlaInfo } from "../../utils/leads-sla";
import { Clock, AlertTriangle, AlertCircle, Calendar } from "lucide-react";

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
    return <span className="text-zinc-400 dark:text-zinc-600 font-mono text-xs select-none">—</span>;
  }

  if (sla.statusType === "FIRST_CONTACT_BREACHED") {
    return (
      <span
        title={sla.formattedTargetTime ? `Target was ${sla.formattedTargetTime}` : "24h SLA breached"}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" />
        <span>SLA Breached ({sla.countdownText})</span>
      </span>
    );
  }

  if (sla.statusType === "FIRST_CONTACT_ACTIVE") {
    return (
      <span
        title={`Target: ${sla.formattedTargetTime}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 whitespace-nowrap"
      >
        <Clock className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 shrink-0" />
        <span>1st Contact • {sla.countdownText}</span>
      </span>
    );
  }

  if (sla.statusType === "FOLLOW_UP_OVERDUE") {
    return (
      <span
        title={`Scheduled: ${sla.formattedTargetTime}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap"
      >
        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span>{sla.stageLabel} • {sla.countdownText}</span>
      </span>
    );
  }

  if (sla.statusType === "FOLLOW_UP_ACTIVE") {
    return (
      <span
        title={`Scheduled: ${sla.formattedTargetTime}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 whitespace-nowrap"
      >
        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <span>{sla.stageLabel} • {sla.countdownText}</span>
      </span>
    );
  }

  return (
    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 select-none whitespace-nowrap">
      {showStage && lead.callCount ? sla.stageLabel : "Not scheduled"}
    </span>
  );
}
