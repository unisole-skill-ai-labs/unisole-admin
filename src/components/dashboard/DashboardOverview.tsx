import React from "react";
import {
  useGetStudentsQuery,
  useGetPathwaysQuery,
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetPaymentsQuery,
} from "../../store";
import {
  Users,
  Compass,
  BookOpen,
  GraduationCap,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface DashboardOverviewProps {
  baseUrl: string;
  onNavigate: (section: string) => void;
}

export default function DashboardOverview({ baseUrl, onNavigate }: DashboardOverviewProps) {
  const { data: students = [], isLoading: isStudentsLoading } = useGetStudentsQuery(baseUrl);
  const { data: pathways = [], isLoading: isPathwaysLoading } = useGetPathwaysQuery(baseUrl);
  const { data: courses = [] } = useGetCoursesQuery(baseUrl);
  const { data: enrollments = [] } = useGetEnrollmentsQuery(baseUrl);
  const { data: payments = [] } = useGetPaymentsQuery(baseUrl);

  const publishedPathways = pathways.filter((p: any) => p.status === "PUBLISHED");
  const activeEnrollments = enrollments.filter((e: any) => e.status === "ACTIVE");
  const totalRevenuePaise = payments
    .filter((p: any) => p.status === "SUCCESS")
    .reduce((sum: number, p: any) => sum + (Number(p.amountPaise) || 0), 0);
  const totalRevenueRupees = (totalRevenuePaise / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  const recentPayments = [...payments]
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  const recentEnrollments = [...enrollments]
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Platform Operations Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Real-time analytics, user growth, revenue telemetry, and curriculum status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("pathways")}
            icon={Compass}
          >
            Manage Pathways
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate("curriculum")}
            icon={BookOpen}
          >
            Curriculum Builder
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Learners */}
        <div
          onClick={() => onNavigate("students")}
          className="minimal-card p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-indigo-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">
            Total Learners
          </span>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            {isStudentsLoading ? "..." : students.length}
          </div>
        </div>

        {/* Published Pathways */}
        <div
          onClick={() => onNavigate("pathways")}
          className="minimal-card p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-indigo-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">
            Published Pathways
          </span>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-1 flex items-baseline gap-1.5">
            <span>{publishedPathways.length}</span>
            <span className="text-xs font-semibold text-zinc-400 font-mono">/ {pathways.length}</span>
          </div>
        </div>

        {/* Curriculum Courses */}
        <div
          onClick={() => onNavigate("curriculum")}
          className="minimal-card p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-indigo-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">
            Modular Courses
          </span>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            {courses.length}
          </div>
        </div>

        {/* Active Enrollments */}
        <div
          onClick={() => onNavigate("students")}
          className="minimal-card p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-indigo-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">
            Active Enrollments
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {activeEnrollments.length}
          </div>
        </div>

        {/* Total Revenue */}
        <div
          onClick={() => onNavigate("payments")}
          className="minimal-card p-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white rounded-2xl cursor-pointer shadow-lg hover:shadow-indigo-500/10 transition-all group border border-indigo-800/60"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md text-amber-300 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-indigo-300 group-hover:text-white transition-colors" />
          </div>
          <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider font-mono">
            Platform Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            ₹{totalRevenueRupees}
          </div>
        </div>
      </div>

      {/* Two-Column Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">Recent Transactions</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("payments")} className="text-xs text-indigo-600 dark:text-indigo-400">
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-mono">
                  <th className="pb-2 font-semibold">Learner ID</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 max-w-[100px] truncate">
                        {p.userId}
                      </td>
                      <td className="py-2.5 font-extrabold text-zinc-900 dark:text-zinc-100">
                        ₹{((Number(p.amountPaise) || 0) / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant={
                            p.status === "SUCCESS"
                              ? "emerald"
                              : p.status === "FAILED"
                              ? "rose"
                              : "amber"
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-zinc-400 font-mono text-[11px]">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">Recent Enrollments</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("students")} className="text-xs text-indigo-600 dark:text-indigo-400">
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-mono">
                  <th className="pb-2 font-semibold">Learner ID</th>
                  <th className="pb-2 font-semibold">Pathway ID</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {recentEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400">
                      No student enrollments recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentEnrollments.map((e: any) => (
                    <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 max-w-[100px] truncate">
                        {e.userId}
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 max-w-[100px] truncate">
                        {e.pathwayId}
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant={e.status === "ACTIVE" ? "emerald" : "default"}
                          size="sm"
                        >
                          {e.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-zinc-400 font-mono text-[11px]">
                        {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
