import React, { useState } from "react";
import { useGetPaymentsQuery, useGetStudentsQuery, useGetPathwaysQuery } from "../../store";
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

export default function PaymentsView({ baseUrl }) {
  const { data: payments = [], isLoading, refetch } = useGetPaymentsQuery(baseUrl);
  const { data: students = [] } = useGetStudentsQuery(baseUrl);
  const { data: pathways = [] } = useGetPathwaysQuery(baseUrl);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesSearch =
      p.id?.toLowerCase().includes(search.toLowerCase()) ||
      p.userId?.toLowerCase().includes(search.toLowerCase()) ||
      p.providerOrderId?.toLowerCase().includes(search.toLowerCase()) ||
      p.providerPaymentId?.toLowerCase().includes(search.toLowerCase()) ||
      p.pathwayId?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPaise = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (Number(p.amountPaise) || 0), 0);

  const successCount = payments.filter((p) => p.status === "SUCCESS").length;
  const pendingCount = payments.filter((p) => ["PENDING", "CREATED"].includes(p.status)).length;
  const failedCount = payments.filter((p) => ["FAILED", "REFUNDED"].includes(p.status)).length;

  return (
    <div className="view-container">
      <div className="section-header">
        <div>
          <h2>Payments & Billing Ledger</h2>
          <p className="text-muted">
            Track Razorpay orders, transaction receipts, revenue, and settlement statuses.
          </p>
        </div>
        <button className="btn-secondary" onClick={refetch}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Mini Metric Cards */}
      <div className="mini-stats-grid mb-3">
        <div className="mini-stat-card">
          <span className="text-muted text-xs">Total Collected</span>
          <span className="stat-number text-amber">
            ₹{(totalPaise / 100).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="mini-stat-card">
          <span className="text-muted text-xs">Successful</span>
          <span className="stat-number text-emerald">{successCount}</span>
        </div>
        <div className="mini-stat-card">
          <span className="text-muted text-xs">Pending / Created</span>
          <span className="stat-number text-blue">{pendingCount}</span>
        </div>
        <div className="mini-stat-card">
          <span className="text-muted text-xs">Failed / Refunded</span>
          <span className="stat-number text-danger">{failedCount}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, Learner ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="CREATED">CREATED</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="panel-card mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Learner</th>
                <th>Pathway</th>
                <th>Amount (INR)</th>
                <th>Provider Details</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-6 text-muted">Loading transactions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-muted">No transactions found.</td></tr>
              ) : (
                filtered.map((p) => {
                  const student = students.find((s) => s.id === p.userId);
                  const pathway = pathways.find((pw) => pw.id === p.pathwayId);
                  const amountRupees = (Number(p.amountPaise) || 0) / 100;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="font-mono font-semibold text-xs">{p.id}</div>
                        {p.enrollmentId && (
                          <div className="text-muted font-mono text-xs">Enr: {p.enrollmentId}</div>
                        )}
                      </td>
                      <td>
                        <div className="font-semibold">{student ? student.name : "Learner"}</div>
                        <div className="text-muted font-mono text-xs">{p.userId} · {student?.phone}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{pathway ? pathway.title : p.pathwayId}</div>
                        <div className="text-muted font-mono text-xs">{p.pathwayId}</div>
                      </td>
                      <td>
                        <span className="price-tag">
                          ₹{amountRupees.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td>
                        <div className="font-mono text-xs text-muted">
                          Order: {p.providerOrderId || "—"}
                        </div>
                        {p.providerPaymentId && (
                          <div className="font-mono text-xs text-primary">
                            Pay: {p.providerPaymentId}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill pill-${p.status?.toLowerCase()}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-muted text-xs">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleString()
                          : p.createdAt
                          ? new Date(p.createdAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
