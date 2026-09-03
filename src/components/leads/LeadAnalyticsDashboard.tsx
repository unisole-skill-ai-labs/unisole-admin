import React from "react";
import {
  TrendingUp,
  Flame,
  Sun,
  Snowflake,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Users,
  Building2,
  GraduationCap,
  Clock,
  ArrowUpRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useGetLeadsAnalyticsQuery } from "../../store";

interface LeadAnalyticsDashboardProps {
  baseUrl: string;
  collegeId?: string;
  branch?: string;
  assignedToUserId?: string;
}

const QUALITY_COLOR_MAP: Record<string, { bg: string; text: string; bar: string; icon: any }> = {
  HOT: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", icon: Flame },
  WARM: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", icon: Sun },
  COLD: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500", icon: Snowflake },
  POOR: { bg: "bg-zinc-500/10", text: "text-zinc-600 dark:text-zinc-400", bar: "bg-zinc-500", icon: AlertTriangle },
  UNQUALIFIED: { bg: "bg-zinc-500/10", text: "text-zinc-500", bar: "bg-zinc-400", icon: AlertTriangle },
};

export default function LeadAnalyticsDashboard({
  baseUrl,
  collegeId,
  branch,
  assignedToUserId,
}: LeadAnalyticsDashboardProps) {
  const { data: analyticsRes, isLoading } = useGetLeadsAnalyticsQuery({
    baseUrl,
    collegeId,
    branch,
    assignedToUserId,
  });

  const data = analyticsRes?.data;
  const kpi = data?.kpi || {
    totalLeads: 0,
    convertedLeads: 0,
    conversionRatio: 0,
    totalCalls: 0,
    callsMadeToday: 0,
    followUpsDueToday: 0,
    followUpsOverdue: 0,
    hotLeadsCount: 0,
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2 animate-spin" />
        <p className="text-sm font-bold">Computing Conversion & Analytics Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Conversion Ratio */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              Total Conversion Ratio
            </span>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{kpi.conversionRatio}%</span>
            <span className="text-xs font-medium opacity-80">
              ({kpi.convertedLeads} / {kpi.totalLeads} leads)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpi.conversionRatio)}%` }}
            />
          </div>
        </div>

        {/* Hot Leads In Pipeline */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
              Hot Leads Pipeline
            </span>
            <Flame className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {kpi.hotLeadsCount}
            </span>
            <span className="text-xs font-semibold text-rose-500">High Intent</span>
          </div>
          <p className="text-[11px] text-zinc-400">Prime candidates ready for enrolment</p>
        </div>

        {/* Calls Logged Today & Total */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-indigo-500">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
              Calling Velocity
            </span>
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {kpi.callsMadeToday}
            </span>
            <span className="text-xs font-semibold text-zinc-400">calls today</span>
          </div>
          <p className="text-[11px] text-zinc-400">{kpi.totalCalls} total discussions logged</p>
        </div>

        {/* Follow-ups Due / Overdue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
              Follow-Up Queue
            </span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {kpi.followUpsDueToday}
            </span>
            <span className="text-xs font-semibold text-amber-500">due today</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            {kpi.followUpsOverdue > 0 ? (
              <span className="text-rose-500 font-bold">{kpi.followUpsOverdue} overdue calls</span>
            ) : (
              "All schedules on track"
            )}
          </p>
        </div>
      </div>

      {/* 2. Quality Breakdown & Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Lead Quality Distribution</span>
            </h3>
            <span className="text-xs text-zinc-400 font-mono">{kpi.totalLeads} Total</span>
          </div>

          <div className="space-y-3">
            {data?.qualityBreakdown?.map((q: any) => {
              const cfg = QUALITY_COLOR_MAP[q.quality] || QUALITY_COLOR_MAP.POOR;
              const Icon = cfg.icon;
              return (
                <div key={q.quality} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                      <span>{q.quality}</span>
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-mono">
                      {q.count} leads ({q.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                      style={{ width: `${Math.min(100, q.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Pipeline Funnel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Conversion Pipeline Stages</span>
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {kpi.convertedLeads} Converted
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {data?.statusPipeline?.map((s: any) => (
              <div
                key={s.status}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80"
              >
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5 truncate">
                  {s.status.replace(/_/g, " ")}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {s.count}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 font-mono">
                    {s.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Counselor / Team Leaderboard */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Team Member / Counselor Performance
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Ranked by Conversions</span>
        </div>

        {(!data?.counselorLeaderboard || data.counselorLeaderboard.length === 0) ? (
          <p className="text-xs text-zinc-400 p-4 text-center">No assigned counselor data yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-zinc-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Counselor</th>
                  <th className="p-3">Assigned Leads</th>
                  <th className="p-3">Calls Made</th>
                  <th className="p-3">Conversions</th>
                  <th className="p-3">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.counselorLeaderboard.map((c: any, idx: number) => (
                  <tr key={c.userId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50">
                    <td className="p-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">{c.role}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                      {c.assigned}
                    </td>
                    <td className="p-3 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                      {c.calls}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {c.converted}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                          {c.conversionRate}%
                        </span>
                        <div className="w-16 bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, c.conversionRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. College & Branch Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* College Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>College-wise Conversions</span>
            </h3>
          </div>

          {(!data?.collegeBreakdown || data.collegeBreakdown.length === 0) ? (
            <p className="text-xs text-zinc-400 p-4 text-center">No college data available.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-zinc-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">College</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5">Converted</th>
                    <th className="p-2.5">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.collegeBreakdown.map((col: any) => (
                    <tr key={col.collegeName} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50">
                      <td className="p-2.5 font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                        {col.collegeName}
                      </td>
                      <td className="p-2.5 font-mono">{col.total}</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {col.converted}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {col.conversionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Branch Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span>Branch & Stream Conversions</span>
            </h3>
          </div>

          {(!data?.branchBreakdown || data.branchBreakdown.length === 0) ? (
            <p className="text-xs text-zinc-400 p-4 text-center">No branch data available.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-zinc-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Branch / Degree</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5">Converted</th>
                    <th className="p-2.5">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.branchBreakdown.map((b: any) => (
                    <tr key={b.branch} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50">
                      <td className="p-2.5 font-semibold text-zinc-900 dark:text-zinc-100">
                        {b.branch}
                      </td>
                      <td className="p-2.5 font-mono">{b.total}</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {b.converted}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {b.conversionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
