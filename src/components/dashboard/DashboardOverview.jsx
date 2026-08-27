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
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardOverview({ baseUrl, onNavigate }) {
  const { data: students = [] } = useGetStudentsQuery(baseUrl);
  const { data: pathways = [] } = useGetPathwaysQuery(baseUrl);
  const { data: courses = [] } = useGetCoursesQuery(baseUrl);
  const { data: enrollments = [] } = useGetEnrollmentsQuery(baseUrl);
  const { data: payments = [] } = useGetPaymentsQuery(baseUrl);

  const publishedPathways = pathways.filter((p) => p.status === "PUBLISHED");
  const activeEnrollments = enrollments.filter((e) => e.status === "ACTIVE");
  const totalRevenuePaise = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (Number(p.amountPaise) || 0), 0);
  const totalRevenueRupees = (totalRevenuePaise / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const recentEnrollments = [...enrollments]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="dashboard-view">
      <div className="section-header">
        <div>
          <h2>Executive Overview</h2>
          <p className="text-muted">Real-time metrics and platform activity</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper bg-blue">
            <Users size={22} className="text-blue" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Learners</span>
            <span className="kpi-value">{students.length}</span>
          </div>
          <button className="kpi-action" onClick={() => onNavigate("students")}>
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper bg-indigo">
            <Compass size={22} className="text-indigo" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Published Pathways</span>
            <span className="kpi-value">
              {publishedPathways.length} <small>/ {pathways.length}</small>
            </span>
          </div>
          <button className="kpi-action" onClick={() => onNavigate("pathways")}>
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper bg-purple">
            <BookOpen size={22} className="text-purple" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Curriculum Courses</span>
            <span className="kpi-value">{courses.length}</span>
          </div>
          <button className="kpi-action" onClick={() => onNavigate("curriculum")}>
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper bg-emerald">
            <GraduationCap size={22} className="text-emerald" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Enrollments</span>
            <span className="kpi-value">{activeEnrollments.length}</span>
          </div>
          <button className="kpi-action" onClick={() => onNavigate("students")}>
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="kpi-card highlight">
          <div className="kpi-icon-wrapper bg-amber">
            <CreditCard size={22} className="text-amber" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Revenue</span>
            <span className="kpi-value">₹{totalRevenueRupees}</span>
          </div>
          <button className="kpi-action" onClick={() => onNavigate("payments")}>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Two-Column Recent Activity */}
      <div className="dashboard-grid-2">
        {/* Recent Transactions */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div className="flex-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <h3>Recent Transactions</h3>
            </div>
            <button className="btn-ghost-sm" onClick={() => onNavigate("payments")}>
              View All
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Learner ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="font-mono text-xs">{p.userId}</td>
                      <td className="font-semibold">
                        ₹{((Number(p.amountPaise) || 0) / 100).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className={`status-pill pill-${p.status?.toLowerCase()}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-muted text-xs">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div className="flex-center gap-2">
              <GraduationCap size={18} className="text-primary" />
              <h3>Recent Enrollments</h3>
            </div>
            <button className="btn-ghost-sm" onClick={() => onNavigate("students")}>
              View All
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Learner ID</th>
                  <th>Pathway ID</th>
                  <th>Status</th>
                  <th>Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      No enrollments recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentEnrollments.map((e) => (
                    <tr key={e.id}>
                      <td className="font-mono text-xs">{e.userId}</td>
                      <td className="font-mono text-xs">{e.pathwayId}</td>
                      <td>
                        <span className={`status-pill pill-${e.status?.toLowerCase()}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="text-muted text-xs">
                        {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "—"}
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
