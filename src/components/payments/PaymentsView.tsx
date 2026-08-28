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
  TrendingUp,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface PaymentsViewProps {
  baseUrl: string;
}

export default function PaymentsView({ baseUrl }: PaymentsViewProps) {
  const { data: payments = [], isLoading, refetch } = useGetPaymentsQuery(baseUrl);
  const { data: students = [] } = useGetStudentsQuery(baseUrl);
  const { data: pathways = [] } = useGetPathwaysQuery(baseUrl);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = payments.filter((p: any) => {
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
    .filter((p: any) => p.status === "SUCCESS")
    .reduce((sum: number, p: any) => sum + (Number(p.amountPaise) || 0), 0);

  const successCount = payments.filter((p: any) => p.status === "SUCCESS").length;
  const pendingCount = payments.filter((p: any) => ["PENDING", "CREATED"].includes(p.status)).length;
  const failedCount = payments.filter((p: any) => ["FAILED", "REFUNDED"].includes(p.status)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Payments & Billing Ledger
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Track Razorpay orders, transaction receipts, revenue, and settlement statuses
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
          Refresh Ledger
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">
            Total Revenue
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
            ₹{(totalPaise / 100).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">
            Successful Orders
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {successCount}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">
            Pending / Created
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono">
            Failed / Refunded
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {failedCount}
          </div>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, Learner ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="PENDING">PENDING</option>
          <option value="CREATED">CREATED</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">Payment ID</th>
                <th className="py-3 px-4 font-semibold">Learner Info</th>
                <th className="py-3 px-4 font-semibold">Pathway Curriculum</th>
                <th className="py-3 px-4 font-semibold">Amount (INR)</th>
                <th className="py-3 px-4 font-semibold">Provider References</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-zinc-400">Loading ledger transactions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-zinc-400">No payment records found.</td></tr>
              ) : (
                filtered.map((p: any) => {
                  const student = students.find((s: any) => s.id === p.userId);
                  const pathway = pathways.find((pw: any) => pw.id === p.pathwayId);
                  const amountRupees = (Number(p.amountPaise) || 0) / 100;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">{p.id}</div>
                        {p.enrollmentId && (
                          <div className="text-zinc-400 font-mono text-[10px]">Enr: {p.enrollmentId}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {student ? student.name : "Learner"}
                        </div>
                        <div className="text-zinc-400 font-mono text-[11px]">
                          {p.userId} · {student?.phone ? `+91 ${student.phone}` : ""}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {pathway ? pathway.title : p.pathwayId}
                        </div>
                        <div className="text-zinc-400 font-mono text-[11px]">ID: {p.pathwayId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-sm text-zinc-900 dark:text-zinc-100">
                        ₹{amountRupees.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="text-zinc-500 dark:text-zinc-400">
                          Order: {p.providerOrderId || "—"}
                        </div>
                        {p.providerPaymentId && (
                          <div className="text-indigo-600 dark:text-indigo-400">
                            Pay: {p.providerPaymentId}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            p.status === "SUCCESS"
                              ? "emerald"
                              : p.status === "FAILED" || p.status === "REFUNDED"
                              ? "rose"
                              : "amber"
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString("en-IN")
                          : p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN")
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
