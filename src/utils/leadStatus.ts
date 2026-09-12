export interface SimplifiedStatusConfig {
  key: string;
  label: string;
  emoji: string;
  badgeCls: string;
  queryStatuses: string[];
  targetStatus: string;
  targetQuality: string;
}

export const SIMPLIFIED_STATUS_MAP: Record<string, SimplifiedStatusConfig> = {
  NEW: {
    key: "NEW",
    label: "New",
    emoji: "🆕",
    badgeCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    queryStatuses: ["NEW"],
    targetStatus: "NEW",
    targetQuality: "WARM",
  },
  FOLLOW_UP: {
    key: "FOLLOW_UP",
    label: "In Follow-up",
    emoji: "📞",
    badgeCls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    queryStatuses: ["FOLLOW_UP_SCHEDULED", "CONTACTED", "ATTEMPTED"],
    targetStatus: "FOLLOW_UP_SCHEDULED",
    targetQuality: "WARM",
  },
  INTERESTED: {
    key: "INTERESTED",
    label: "Interested",
    emoji: "🔥",
    badgeCls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold",
    queryStatuses: ["INTERESTED", "DEMO_GIVEN"],
    targetStatus: "INTERESTED",
    targetQuality: "HOT",
  },
  CONVERTED: {
    key: "CONVERTED",
    label: "Converted",
    emoji: "🎉",
    badgeCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-black",
    queryStatuses: ["CONVERTED"],
    targetStatus: "CONVERTED",
    targetQuality: "HOT",
  },
  LOST: {
    key: "LOST",
    label: "Cold / Lost",
    emoji: "❄️",
    badgeCls: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
    queryStatuses: ["LOST"],
    targetStatus: "LOST",
    targetQuality: "COLD",
  },
  NOT_A_LEAD: {
    key: "NOT_A_LEAD",
    label: "Non-Lead",
    emoji: "🚫",
    badgeCls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 font-semibold",
    queryStatuses: ["NOT_A_LEAD", "JUNK"],
    targetStatus: "NOT_A_LEAD",
    targetQuality: "POOR",
  },
};

export const SIMPLIFIED_STATUS_OPTIONS = Object.values(SIMPLIFIED_STATUS_MAP);

/**
 * Resolves any raw lead database row (status + quality) into one of the 6 unified statuses
 */
export function getSimplifiedLeadStatus(status?: string, quality?: string): string {
  const s = (status || "").toUpperCase();
  const q = (quality || "").toUpperCase();

  if (s === "NOT_A_LEAD" || s === "JUNK" || q === "POOR" || q === "UNQUALIFIED") {
    return "NOT_A_LEAD";
  }
  if (s === "CONVERTED") {
    return "CONVERTED";
  }
  if (s === "LOST" || q === "COLD") {
    return "LOST";
  }
  if (s === "INTERESTED" || s === "DEMO_GIVEN" || q === "HOT") {
    return "INTERESTED";
  }
  if (s === "FOLLOW_UP_SCHEDULED" || s === "CONTACTED" || s === "ATTEMPTED") {
    return "FOLLOW_UP";
  }
  return "NEW";
}

/**
 * Returns the badge styling & label config for a simplified status
 */
export function getSimplifiedStatusConfig(status?: string, quality?: string): SimplifiedStatusConfig {
  const key = getSimplifiedLeadStatus(status, quality);
  return SIMPLIFIED_STATUS_MAP[key] || SIMPLIFIED_STATUS_MAP.NEW;
}

/**
 * Maps the selected unified status back to backend database status and quality
 */
export function getStatusUpdatePayload(key: string): { status: string; quality: string } {
  const cfg = SIMPLIFIED_STATUS_MAP[key];
  if (cfg) {
    return { status: cfg.targetStatus, quality: cfg.targetQuality };
  }
  return { status: key, quality: "WARM" };
}
