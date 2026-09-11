export interface LeadSlaInfo {
  isFirstContact: boolean;
  stageLabel: string; // "1st Contact" | "Follow-up #1" | "Follow-up #2" | "Converted"
  isBreached: boolean;
  isOverdue: boolean;
  isDueSoon: boolean;
  timeRemainingMs: number;
  countdownText: string;
  formattedTargetTime: string;
  badgeClass: string;
  textClass: string;
  statusType:
    | "FIRST_CONTACT_ACTIVE"
    | "FIRST_CONTACT_BREACHED"
    | "FOLLOW_UP_ACTIVE"
    | "FOLLOW_UP_OVERDUE"
    | "NO_SCHEDULE"
    | "TERMINAL";
}

/**
 * Calculates real-time 24-hour SLA and Follow-up progression for a lead
 */
export function getLeadSlaInfo(lead: {
  createdAt?: string;
  callCount?: number;
  lastCallAt?: string | null;
  nextCallAt?: string | null;
  status?: string;
}): LeadSlaInfo {
  const now = Date.now();
  const isTerminal = ["CONVERTED", "LOST", "JUNK", "NOT_A_LEAD"].includes(lead.status || "");
  const callCount = lead.callCount || 0;
  const isFirstContact = callCount === 0 && !lead.lastCallAt;

  if (isTerminal) {
    return {
      isFirstContact: false,
      stageLabel: "",
      isBreached: false,
      isOverdue: false,
      isDueSoon: false,
      timeRemainingMs: 0,
      countdownText: "—",
      formattedTargetTime: "",
      badgeClass: "",
      textClass: "text-zinc-400",
      statusType: "TERMINAL",
    };
  }

  // 1. FIRST CONTACT PHASE (callCount === 0 & no lastCallAt)
  if (isFirstContact) {
    const createdTime = lead.createdAt ? new Date(lead.createdAt).getTime() : now;
    const deadline = createdTime + 24 * 60 * 60 * 1000;
    const diff = deadline - now;
    const isBreached = diff <= 0;

    const absDiff = Math.abs(diff);
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (isBreached) {
      const breachStr = hours > 24 ? `+${Math.floor(hours / 24)}d ${hours % 24}h` : `+${hours}h ${mins}m`;
      return {
        isFirstContact: true,
        stageLabel: "1st Contact",
        isBreached: true,
        isOverdue: true,
        isDueSoon: false,
        timeRemainingMs: diff,
        countdownText: breachStr,
        formattedTargetTime: new Date(deadline).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        badgeClass: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20",
        textClass: "text-rose-600 dark:text-rose-400 font-medium",
        statusType: "FIRST_CONTACT_BREACHED",
      };
    }

    const isDueSoon = hours < 4;
    const leftStr = hours > 0 ? `${hours}h left` : `${mins}m left`;
    return {
      isFirstContact: true,
      stageLabel: "1st Contact",
      isBreached: false,
      isOverdue: false,
      isDueSoon,
      timeRemainingMs: diff,
      countdownText: leftStr,
      formattedTargetTime: new Date(deadline).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      badgeClass: isDueSoon
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        : "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20",
      textClass: isDueSoon ? "text-amber-600 dark:text-amber-400" : "text-purple-600 dark:text-purple-400",
      statusType: "FIRST_CONTACT_ACTIVE",
    };
  }

  // 2. FOLLOW-UP PHASE (callCount >= 1)
  const stageLabel = `Follow-up #${callCount}`;

  if (!lead.nextCallAt) {
    return {
      isFirstContact: false,
      stageLabel,
      isBreached: false,
      isOverdue: false,
      isDueSoon: false,
      timeRemainingMs: 0,
      countdownText: "No schedule",
      formattedTargetTime: "",
      badgeClass: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
      textClass: "text-zinc-400",
      statusType: "NO_SCHEDULE",
    };
  }

  const nextCallTime = new Date(lead.nextCallAt).getTime();
  const diff = nextCallTime - now;
  const isOverdue = diff <= 0;
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);

  const formattedTargetTime = new Date(nextCallTime).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isOverdue) {
    const overdueStr = days > 0 ? `${days}d overdue` : hours > 0 ? `${hours}h overdue` : `${mins}m overdue`;
    return {
      isFirstContact: false,
      stageLabel,
      isBreached: false,
      isOverdue: true,
      isDueSoon: false,
      timeRemainingMs: diff,
      countdownText: overdueStr,
      formattedTargetTime,
      badgeClass: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20",
      textClass: "text-rose-600 dark:text-rose-400 font-medium",
      statusType: "FOLLOW_UP_OVERDUE",
    };
  }

  const isDueSoon = hours < 6;
  const activeStr = days > 0 ? `in ${days}d ${hours % 24}h` : hours > 0 ? `in ${hours}h` : `in ${mins}m`;
  return {
    isFirstContact: false,
    stageLabel,
    isBreached: false,
    isOverdue: false,
    isDueSoon,
    timeRemainingMs: diff,
    countdownText: activeStr,
    formattedTargetTime,
    badgeClass: isDueSoon
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60",
    textClass: isDueSoon ? "text-amber-600 dark:text-amber-400" : "text-zinc-700 dark:text-zinc-300",
    statusType: "FOLLOW_UP_ACTIVE",
  };
}
