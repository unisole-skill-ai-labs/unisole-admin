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
      stageLabel: lead.status === "CONVERTED" ? "Converted 🎉" : "Closed",
      isBreached: false,
      isOverdue: false,
      isDueSoon: false,
      timeRemainingMs: 0,
      countdownText: lead.status === "CONVERTED" ? "Converted" : "Archived",
      formattedTargetTime: "",
      badgeClass: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
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
      return {
        isFirstContact: true,
        stageLabel: "1st Contact",
        isBreached: true,
        isOverdue: true,
        isDueSoon: false,
        timeRemainingMs: diff,
        countdownText: hours > 24 ? `Breached by ${Math.floor(hours / 24)}d ${hours % 24}h` : `Breached by ${hours}h ${mins}m`,
        formattedTargetTime: new Date(deadline).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 animate-pulse font-black",
        textClass: "text-rose-600 dark:text-rose-400 font-bold",
        statusType: "FIRST_CONTACT_BREACHED",
      };
    }

    const isDueSoon = hours < 4;
    return {
      isFirstContact: true,
      stageLabel: "1st Contact",
      isBreached: false,
      isOverdue: false,
      isDueSoon,
      timeRemainingMs: diff,
      countdownText: `${hours}h ${mins}m left`,
      formattedTargetTime: new Date(deadline).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      badgeClass: isDueSoon
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold"
        : "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold",
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
      countdownText: "No follow-up set",
      formattedTargetTime: "",
      badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 font-medium",
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

  const formattedTargetTime = new Date(nextCallTime).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isOverdue) {
    const timeStr = days > 0 ? `${days}d ${hours % 24}h overdue` : `${hours}h ${mins}m overdue`;
    return {
      isFirstContact: false,
      stageLabel,
      isBreached: false,
      isOverdue: true,
      isDueSoon: false,
      timeRemainingMs: diff,
      countdownText: timeStr,
      formattedTargetTime,
      badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold",
      textClass: "text-rose-600 dark:text-rose-400 font-semibold",
      statusType: "FOLLOW_UP_OVERDUE",
    };
  }

  const isDueSoon = hours < 6;
  const timeStr = days > 0 ? `in ${days}d ${hours % 24}h` : `in ${hours}h ${mins}m`;
  return {
    isFirstContact: false,
    stageLabel,
    isBreached: false,
    isOverdue: false,
    isDueSoon,
    timeRemainingMs: diff,
    countdownText: timeStr,
    formattedTargetTime,
    badgeClass: isDueSoon
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold"
      : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold",
    textClass: isDueSoon ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400",
    statusType: "FOLLOW_UP_ACTIVE",
  };
}
