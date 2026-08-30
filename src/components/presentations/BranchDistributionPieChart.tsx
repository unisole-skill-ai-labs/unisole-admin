import React, { useState, useMemo } from "react";
import { Users, PieChart as PieIcon, Sparkles } from "lucide-react";

export interface BranchStatItem {
  branch: string;
  count: number;
  percentage: number;
}

export interface BranchStats {
  totalAttendees: number;
  distribution: BranchStatItem[];
  counts?: Record<string, number>;
}

export interface BranchDistributionPieChartProps {
  branchStats?: BranchStats | null;
  attendees?: any[];
  className?: string;
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  compact?: boolean;
}

// Curated vibrant color palette mapped by common engineering & college branches
const BRANCH_PALETTE: { [key: string]: { hex: string; bg: string; border: string; text: string } } = {
  CSE: { hex: "#10B981", bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400" },
  COMPUTER: { hex: "#10B981", bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400" },
  AIML: { hex: "#8B5CF6", bg: "bg-violet-500/15", border: "border-violet-500/40", text: "text-violet-400" },
  "AI & ML": { hex: "#8B5CF6", bg: "bg-violet-500/15", border: "border-violet-500/40", text: "text-violet-400" },
  ARTIFICIAL: { hex: "#8B5CF6", bg: "bg-violet-500/15", border: "border-violet-500/40", text: "text-violet-400" },
  IT: { hex: "#06B6D4", bg: "bg-cyan-500/15", border: "border-cyan-500/40", text: "text-cyan-400" },
  INFORMATION: { hex: "#06B6D4", bg: "bg-cyan-500/15", border: "border-cyan-500/40", text: "text-cyan-400" },
  ECE: { hex: "#F59E0B", bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-400" },
  ELECTRONICS: { hex: "#F59E0B", bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-400" },
  "DATA SCIENCE": { hex: "#EC4899", bg: "bg-pink-500/15", border: "border-pink-500/40", text: "text-pink-400" },
  DATA: { hex: "#EC4899", bg: "bg-pink-500/15", border: "border-pink-500/40", text: "text-pink-400" },
  EEE: { hex: "#EAB308", bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-400" },
  ELECTRICAL: { hex: "#EAB308", bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-400" },
  MECH: { hex: "#F43F5E", bg: "bg-rose-500/15", border: "border-rose-500/40", text: "text-rose-400" },
  MECHANICAL: { hex: "#F43F5E", bg: "bg-rose-500/15", border: "border-rose-500/40", text: "text-rose-400" },
  CIVIL: { hex: "#84CC16", bg: "bg-lime-500/15", border: "border-lime-500/40", text: "text-lime-400" },
  CYBER: { hex: "#A855F7", bg: "bg-purple-500/15", border: "border-purple-500/40", text: "text-purple-400" },
  SECURITY: { hex: "#A855F7", bg: "bg-purple-500/15", border: "border-purple-500/40", text: "text-purple-400" },
  BCA: { hex: "#3B82F6", bg: "bg-blue-500/15", border: "border-blue-500/40", text: "text-blue-400" },
  MCA: { hex: "#6366F1", bg: "bg-indigo-500/15", border: "border-indigo-500/40", text: "text-indigo-400" },
  BBA: { hex: "#14B8A6", bg: "bg-teal-500/15", border: "border-teal-500/40", text: "text-teal-400" },
  MBA: { hex: "#0D9488", bg: "bg-teal-600/15", border: "border-teal-600/40", text: "text-teal-300" },
  OTHER: { hex: "#64748B", bg: "bg-slate-500/15", border: "border-slate-500/40", text: "text-slate-400" },
  GENERAL: { hex: "#64748B", bg: "bg-slate-500/15", border: "border-slate-500/40", text: "text-slate-400" },
};

const FALLBACK_COLORS = [
  { hex: "#6366F1", bg: "bg-indigo-500/15", border: "border-indigo-500/40", text: "text-indigo-400" },
  { hex: "#EC4899", bg: "bg-pink-500/15", border: "border-pink-500/40", text: "text-pink-400" },
  { hex: "#10B981", bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400" },
  { hex: "#F59E0B", bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-400" },
  { hex: "#06B6D4", bg: "bg-cyan-500/15", border: "border-cyan-500/40", text: "text-cyan-400" },
  { hex: "#8B5CF6", bg: "bg-violet-500/15", border: "border-violet-500/40", text: "text-violet-400" },
  { hex: "#F43F5E", bg: "bg-rose-500/15", border: "border-rose-500/40", text: "text-rose-400" },
  { hex: "#84CC16", bg: "bg-lime-500/15", border: "border-lime-500/40", text: "text-lime-400" },
  { hex: "#EAB308", bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-400" },
];

export function getBranchColorStyle(branchName: string, index: number) {
  const clean = (branchName || "").toUpperCase();
  for (const [key, val] of Object.entries(BRANCH_PALETTE)) {
    if (clean.includes(key)) {
      return val;
    }
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export default function BranchDistributionPieChart({
  branchStats,
  attendees,
  className = "",
  title = "Live Branch Distribution",
  subtitle = "Real-time diversity of joined candidates",
  showLegend = true,
  compact = false,
}: BranchDistributionPieChartProps) {
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);

  // Compute distribution from props
  const computedData: BranchStats = useMemo(() => {
    if (branchStats && branchStats.distribution && branchStats.distribution.length > 0) {
      return branchStats;
    }
    if (attendees && attendees.length > 0) {
      const counts: Record<string, number> = {};
      let total = 0;
      for (const a of attendees) {
        const b = a.branch && a.branch.trim() ? a.branch.trim() : "General / Other";
        counts[b] = (counts[b] || 0) + 1;
        total += 1;
      }
      const distribution = Object.entries(counts)
        .map(([branch, count]) => ({
          branch,
          count,
          percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.count - a.count);
      return { totalAttendees: total, distribution, counts };
    }
    return { totalAttendees: 0, distribution: [], counts: {} };
  }, [branchStats, attendees]);

  const { totalAttendees, distribution } = computedData;

  // Build SVG Arcs for Donut Slices
  const slices = useMemo(() => {
    if (totalAttendees === 0 || distribution.length === 0) return [];

    const cx = 110;
    const cy = 110;
    const rOuter = 92;
    const rInner = 56;

    let currentAngle = -90; // Start at top 12 o'clock

    return distribution.map((item, index) => {
      const sliceAngle = (item.count / totalAttendees) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      const isFullCircle = distribution.length === 1 || sliceAngle >= 359.99;

      const colorStyle = getBranchColorStyle(item.branch, index);

      if (isFullCircle) {
        return {
          ...item,
          index,
          isFullCircle: true,
          pathData: "",
          colorStyle,
          cx,
          cy,
          rOuter,
          rInner,
        };
      }

      // Convert angles to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = cx + rOuter * Math.cos(startRad);
      const y1 = cy + rOuter * Math.sin(startRad);
      const x2 = cx + rOuter * Math.cos(endRad);
      const y2 = cy + rOuter * Math.sin(endRad);

      const x3 = cx + rInner * Math.cos(endRad);
      const y3 = cy + rInner * Math.sin(endRad);
      const x4 = cx + rInner * Math.cos(startRad);
      const y4 = cy + rInner * Math.sin(startRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
        "Z",
      ].join(" ");

      return {
        ...item,
        index,
        isFullCircle: false,
        pathData,
        colorStyle,
        cx,
        cy,
        rOuter,
        rInner,
      };
    });
  }, [totalAttendees, distribution]);

  const activeSlice = useMemo(() => {
    if (!hoveredBranch) return null;
    return slices.find((s) => s.branch === hoveredBranch) || null;
  }, [hoveredBranch, slices]);

  return (
    <div
      className={`rounded-3xl bg-zinc-900/90 border border-white/10 p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-zinc-100 flex items-center gap-2">
              <span>{title}</span>
              {totalAttendees > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 animate-pulse">
                  LIVE
                </span>
              )}
            </h3>
            {subtitle && !compact && (
              <p className="text-[11px] text-zinc-400">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-zinc-300">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>{totalAttendees} Checked In</span>
        </div>
      </div>

      {/* Main Content Area */}
      {totalAttendees === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 text-zinc-500">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
            <Sparkles className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1 max-w-xs">
            <h4 className="font-bold text-xs text-zinc-300">
              Waiting for Students to Join
            </h4>
            <p className="text-[11px] text-zinc-500">
              As attendees scan the QR code and select their branch, this pie chart builds dynamically in real-time.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`pt-4 grid ${
            compact || !showLegend
              ? "grid-cols-1 items-center"
              : "grid-cols-1 lg:grid-cols-12 gap-5 items-center"
          }`}
        >
          {/* SVG Donut Visual */}
          <div
            className={`${
              compact || !showLegend ? "w-full" : "lg:col-span-6"
            } flex flex-col items-center justify-center relative`}
          >
            <div className="relative w-48 h-48 sm:w-52 sm:h-52">
              <svg
                viewBox="0 0 220 220"
                className="w-full h-full transform transition-transform duration-300"
              >
                {slices.map((slice) => {
                  const isHovered = hoveredBranch === slice.branch;

                  if (slice.isFullCircle) {
                    return (
                      <g
                        key={slice.branch}
                        onMouseEnter={() => setHoveredBranch(slice.branch)}
                        onMouseLeave={() => setHoveredBranch(null)}
                        className="cursor-pointer transition-all duration-300"
                      >
                        {/* Outer Circle */}
                        <circle
                          cx={slice.cx}
                          cy={slice.cy}
                          r={slice.rOuter}
                          fill={slice.colorStyle.hex}
                          className="transition-all duration-300"
                          style={{
                            filter: isHovered
                              ? `drop-shadow(0 0 12px ${slice.colorStyle.hex})`
                              : "none",
                          }}
                        />
                        {/* Inner Hole */}
                        <circle
                          cx={slice.cx}
                          cy={slice.cy}
                          r={slice.rInner}
                          fill="#09090b"
                        />
                      </g>
                    );
                  }

                  return (
                    <path
                      key={slice.branch}
                      d={slice.pathData}
                      fill={slice.colorStyle.hex}
                      stroke="#09090b"
                      strokeWidth="2.5"
                      onMouseEnter={() => setHoveredBranch(slice.branch)}
                      onMouseLeave={() => setHoveredBranch(null)}
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        transformOrigin: `${slice.cx}px ${slice.cy}px`,
                        transform: isHovered ? "scale(1.05)" : "scale(1)",
                        filter: isHovered
                          ? `drop-shadow(0 0 10px ${slice.colorStyle.hex}aa)`
                          : "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                        opacity:
                          hoveredBranch && !isHovered ? 0.45 : 1,
                      }}
                    />
                  );
                })}
              </svg>

              {/* Center Donut Hub Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
                {activeSlice ? (
                  <div className="animate-fade-in space-y-0.5">
                    <span
                      className="text-lg sm:text-xl font-black font-mono block"
                      style={{ color: activeSlice.colorStyle.hex }}
                    >
                      {activeSlice.percentage}%
                    </span>
                    <span className="text-[10px] font-bold text-zinc-200 line-clamp-1 max-w-[90px] leading-tight">
                      {activeSlice.branch}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400">
                      {activeSlice.count} student{activeSlice.count === 1 ? "" : "s"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-xl sm:text-2xl font-black text-white font-mono">
                      {totalAttendees}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                      Students
                    </span>
                    <span className="text-[9px] font-mono text-indigo-400">
                      {distribution.length} Branch{distribution.length === 1 ? "" : "es"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown Legend & Percentage Progress Bars */}
          {showLegend && (
            <div
              className={`${
                compact ? "w-full pt-3" : "lg:col-span-6"
              } space-y-2.5 max-h-56 overflow-y-auto pr-1`}
            >
              {distribution.map((item, idx) => {
                const color = getBranchColorStyle(item.branch, idx);
                const isHovered = hoveredBranch === item.branch;

                return (
                  <div
                    key={item.branch}
                    onMouseEnter={() => setHoveredBranch(item.branch)}
                    onMouseLeave={() => setHoveredBranch(null)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isHovered
                        ? "bg-white/10 border-white/30 scale-[1.02]"
                        : "bg-white/5 border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-bold text-xs text-zinc-200 truncate">
                          {item.branch}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-zinc-400">
                          {item.count}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold"
                          style={{
                            backgroundColor: `${color.hex}22`,
                            color: color.hex,
                            border: `1px solid ${color.hex}44`,
                          }}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: color.hex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
