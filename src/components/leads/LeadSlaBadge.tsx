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
  showVelocity?: boolean;
}

export default function LeadSlaBadge({ lead, showStage = true, showVelocity = false }: LeadSlaBadgeProps) {
  // Live tick every 30 seconds so countdowns update in real-time
  const [sla, setSla] = useState<LeadSlaInfo>(() => getLeadSlaInfo(lead));

  useEffect(() => {
    setSla(getLeadSlaInfo(lead));
    const timer = setInterval(() => {
      setSla(getLeadSlaInfo(lead));
    }, 30000);
    return () => clearInterval(timer);
  }, [lead.createdAt, lead.callCount, lead.lastCallAt, lead.nextCallAt, lead.status]);

  const renderVelocity = () => {
    if (!showVelocity) return null;
    const callCount = lead.callCount || 0;
    const hasCalls = callCount > 0;
    const lastDate = lead.lastCallAt
      ? new Date(lead.lastCallAt).toLocaleDateString([], { month: "short", day: "numeric" })
      : null;

    if (!hasCalls) {
      return (
        <div className="text-[11px] text-zinc-500 font-medium">
          Never called
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          {callCount} {callCount === 1 ? "call" : "calls"}
        </span>
        {lastDate && (
          <>
            <span>•</span>
            <span>{lastDate}</span>
          </>
        )}
      </div>
    );
  };

  if (sla.statusType === "TERMINAL") {
    if (!showVelocity) {
      return <span className="text-zinc-400 dark:text-zinc-600 font-mono text-xs select-none">—</span>;
    }
    return (
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <span className="text-xs font-semibold text-zinc-400 select-none">— Closed</span>
        {renderVelocity()}
      </div>
    );
  }

  // 1. FIRST CONTACT BREACHED
  if (sla.statusType === "FIRST_CONTACT_BREACHED") {
    return (
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{showVelocity ? "Overdue" : "1st Contact Breached"}</span>
          {showVelocity && (
            <span className="text-[11px] font-mono font-semibold text-rose-500/90 dark:text-rose-400/80">
              ({sla.countdownText})
            </span>
          )}
        </div>
        {!showVelocity && (
          <div className="text-[11px] font-mono text-rose-500/90 dark:text-rose-400/80">
            {sla.countdownText} • missed {sla.formattedTargetTime}
          </div>
        )}
        {renderVelocity()}
      </div>
    );
  }

  // 2. FIRST CONTACT ACTIVE (within 24h)
  if (sla.statusType === "FIRST_CONTACT_ACTIVE") {
    return (
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{showVelocity ? "1st Call Due" : "1st Contact Due"}</span>
          {showVelocity && (
            <span className="text-[11px] font-mono font-semibold text-purple-600/90 dark:text-purple-300">
              ({sla.countdownText})
            </span>
          )}
        </div>
        {!showVelocity && (
          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-purple-600/90 dark:text-purple-300">{sla.countdownText}</span>
            <span className="text-zinc-400 dark:text-zinc-500"> • by {sla.formattedTargetTime}</span>
          </div>
        )}
        {renderVelocity()}
      </div>
    );
  }

  // 3. FOLLOW-UP OVERDUE
  if (sla.statusType === "FOLLOW_UP_OVERDUE") {
    return (
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{sla.stageLabel} Overdue</span>
          {showVelocity && (
            <span className="text-[11px] font-mono font-bold text-rose-500/90 dark:text-rose-400/80">
              ({sla.countdownText})
            </span>
          )}
        </div>
        {!showVelocity && (
          <div className="text-[11px] font-mono text-rose-500/90 dark:text-rose-400/80">
            {sla.formattedTargetTime} <span className="font-bold">({sla.countdownText})</span>
          </div>
        )}
        {renderVelocity()}
      </div>
    );
  }

  // 4. FOLLOW-UP ACTIVE (scheduled)
  if (sla.statusType === "FOLLOW_UP_ACTIVE") {
    return (
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>{sla.stageLabel}</span>
          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
            ({sla.countdownText})
          </span>
        </div>
        {!showVelocity && (
          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            {sla.formattedTargetTime} <span className="text-indigo-600 dark:text-indigo-400 font-semibold">({sla.countdownText})</span>
          </div>
        )}
        {renderVelocity()}
      </div>
    );
  }

  // 5. NO SCHEDULE
  return (
    <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        <span>{showStage && lead.callCount ? sla.stageLabel : "Unscheduled"}</span>
      </div>
      {!showVelocity && (
        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">No time set</span>
      )}
      {renderVelocity()}
    </div>
  );
}
