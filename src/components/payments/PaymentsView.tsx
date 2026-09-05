import React, { useState } from "react";
import {
  useGetPaymentsQuery,
  useGetOrdersQuery,
  useGetOfferingsPricingQuery,
  useCreateOfferingPricingMutation,
  useUpdateOfferingPricingMutation,
  useDeleteOfferingPricingMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useConfirmManualOrderMutation,
  useManualGrantEnrollmentMutation,
  useGetStudentsQuery,
  useGetPathwaysQuery,
  useGetCoursesQuery,
} from "../../store";
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  Tag,
  Percent,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Eye,
  DollarSign,
  ShieldCheck,
  ShoppingBag,
  Gift,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface PaymentsViewProps {
  baseUrl: string;
}

export default function PaymentsView({ baseUrl }: PaymentsViewProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "pricing" | "coupons" | "gateway">("orders");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Queries
  const { data: ordersData, isLoading: isOrdersLoading, refetch: refetchOrders } = useGetOrdersQuery({
    baseUrl,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: search || undefined,
  });
  const { data: pricingData, isLoading: isPricingLoading, refetch: refetchPricing } = useGetOfferingsPricingQuery(baseUrl);
  const { data: couponsData, isLoading: isCouponsLoading, refetch: refetchCoupons } = useGetCouponsQuery(baseUrl);
  const { data: payments = [], isLoading: isPaymentsLoading, refetch: refetchPayments } = useGetPaymentsQuery(baseUrl);
  const { data: students = [] } = useGetStudentsQuery(baseUrl);
  const { data: pathways = [] } = useGetPathwaysQuery(baseUrl);
  const { data: courses = [] } = useGetCoursesQuery(baseUrl);

  // Mutations
  const [createPricing, { isLoading: isCreatingPricing }] = useCreateOfferingPricingMutation();
  const [updatePricing, { isLoading: isUpdatingPricing }] = useUpdateOfferingPricingMutation();
  const [deletePricing] = useDeleteOfferingPricingMutation();

  const [createCoupon, { isLoading: isCreatingCoupon }] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [confirmManualOrder, { isLoading: isConfirmingManual }] = useConfirmManualOrderMutation();
  const [manualGrantEnrollment, { isLoading: isGrantingEnrollment }] = useManualGrantEnrollmentMutation();

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<any>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isManualEnrollModalOpen, setIsManualEnrollModalOpen] = useState(false);

  // Form states for dynamic pricing
  const [pricingForm, setPricingForm] = useState({
    itemType: "WORKSHOP",
    itemId: "",
    title: "",
    description: "",
    priceRupees: "39",
    mrpRupees: "999",
    isActive: true,
    isPublic: true,
  });

  // Form states for coupons
  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "20",
    minOrderRupees: "0",
    maxDiscountRupees: "",
    maxUses: "",
    validUntil: "",
    isActive: true,
  });

  // Form states for manual enrollment grant
  const [enrollForm, setEnrollForm] = useState({
    userId: "",
    itemType: "WORKSHOP",
    itemId: "AI_MASTERCLASS_2026",
    source: "ADMIN_MANUAL",
    reason: "",
  });

  const orders = ordersData?.items || [];
  const pricingItems = pricingData?.items || [];
  const coupons = couponsData?.items || [];

  // Metrics calculation
  const totalRevenuePaise = orders
    .filter((o: any) => o.status === "PAID")
    .reduce((sum: number, o: any) => sum + (Number(o.totalPaise) || 0), 0);

  const paidOrdersCount = orders.filter((o: any) => o.status === "PAID").length;
  const pendingOrdersCount = orders.filter((o: any) => o.status === "PENDING").length;

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pricePaise = Math.round(parseFloat(pricingForm.priceRupees || "0") * 100);
      const mrpPaise = Math.round(parseFloat(pricingForm.mrpRupees || "0") * 100);

      if (editingPricing) {
        await updatePricing({
          baseUrl,
          id: editingPricing.id,
          body: {
            title: pricingForm.title,
            description: pricingForm.description,
            pricePaise,
            mrpPaise,
            isActive: pricingForm.isActive,
            isPublic: pricingForm.isPublic,
          },
        }).unwrap();
      } else {
        await createPricing({
          baseUrl,
          body: {
            itemType: pricingForm.itemType,
            itemId: pricingForm.itemId.trim(),
            title: pricingForm.title.trim(),
            description: pricingForm.description,
            pricePaise,
            mrpPaise,
            isActive: pricingForm.isActive,
            isPublic: pricingForm.isPublic,
          },
        }).unwrap();
      }
      setIsPricingModalOpen(false);
      setEditingPricing(null);
      refetchPricing();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || "Failed to save pricing item");
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const discountVal = parseFloat(couponForm.discountValue || "0");
      const discountValue = couponForm.discountType === "FLAT" ? Math.round(discountVal * 100) : Math.round(discountVal);
      const minOrderPaise = Math.round(parseFloat(couponForm.minOrderRupees || "0") * 100);
      const maxDiscountPaise = couponForm.maxDiscountRupees ? Math.round(parseFloat(couponForm.maxDiscountRupees) * 100) : null;
      const maxUses = couponForm.maxUses ? parseInt(couponForm.maxUses, 10) : null;

      await createCoupon({
        baseUrl,
        body: {
          code: couponForm.code.trim().toUpperCase(),
          description: couponForm.description,
          discountType: couponForm.discountType,
          discountValue,
          minOrderPaise,
          maxDiscountPaise,
          maxUses,
          validUntil: couponForm.validUntil ? new Date(couponForm.validUntil).toISOString() : undefined,
          isActive: couponForm.isActive,
        },
      }).unwrap();

      setIsCouponModalOpen(false);
      setCouponForm({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: "20",
        minOrderRupees: "0",
        maxDiscountRupees: "",
        maxUses: "",
        validUntil: "",
        isActive: true,
      });
      refetchCoupons();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || "Failed to create coupon");
    }
  };

  const handleManualConfirmOrder = async (orderId: string) => {
    const reason = prompt("Enter confirmation note / offline payment reference (e.g. Received via Cash / Direct UPI):");
    if (reason === null) return;

    try {
      await confirmManualOrder({ baseUrl, id: orderId, notes: reason }).unwrap();
      alert("Order marked as PAID and student enrollments granted successfully!");
      if (selectedOrder) setSelectedOrder(null);
      refetchOrders();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || "Failed to confirm manual order");
    }
  };

  const handleManualGrantEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await manualGrantEnrollment({
        baseUrl,
        body: {
          userId: enrollForm.userId,
          itemType: enrollForm.itemType,
          itemId: enrollForm.itemId,
          source: enrollForm.source,
          notes: enrollForm.reason,
        },
      }).unwrap();

      alert("Enrollment granted successfully to student!");
      setIsManualEnrollModalOpen(false);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || "Failed to grant enrollment");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Centralized Commercial & Pricing Suite
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Dynamic catalog pricing, discount promo codes, multi-item commercial orders, and manual student enrollments
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsManualEnrollModalOpen(true)}
            icon={UserCheck}
          >
            Grant Enrollment
          </Button>

          {activeTab === "pricing" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingPricing(null);
                setPricingForm({
                  itemType: "WORKSHOP",
                  itemId: "",
                  title: "",
                  description: "",
                  priceRupees: "39",
                  mrpRupees: "999",
                  isActive: true,
                  isPublic: true,
                });
                setIsPricingModalOpen(true);
              }}
              icon={Plus}
            >
              Add Price Offering
            </Button>
          )}

          {activeTab === "coupons" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCouponModalOpen(true)}
              icon={Plus}
            >
              Create Coupon
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              refetchOrders();
              refetchPricing();
              refetchCoupons();
              refetchPayments();
            }}
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Total Paid Revenue
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 mt-1 font-mono">
            ₹{(totalRevenuePaise / 100).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Paid Orders
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {paidOrdersCount}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" /> Dynamic Catalog Items
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {pricingItems.length}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-mono flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-purple-500" /> Active Promo Coupons
          </span>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {coupons.filter((c: any) => c.isActive).length}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Commercial Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "pricing"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Dynamic Catalog Pricing ({pricingItems.length})
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "coupons"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Percent className="w-4 h-4" />
          Promo Codes & Coupons ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab("gateway")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "gateway"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Raw Gateway Transactions ({payments.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: COMMERCIAL ORDERS */}
      {/* ============================================================ */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by Order #, Customer Name, Email, Phone..."
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
              <option value="ALL">All Order Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                    <th className="py-3 px-4 font-semibold">Order Number</th>
                    <th className="py-3 px-4 font-semibold">Customer / Learner</th>
                    <th className="py-3 px-4 font-semibold">Purchased Items</th>
                    <th className="py-3 px-4 font-semibold">Total / Discount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Created</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {isOrdersLoading ? (
                    <tr><td colSpan={7} className="py-8 text-center text-zinc-400">Loading orders...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={7} className="py-8 text-center text-zinc-400">No commercial orders found.</td></tr>
                  ) : (
                    orders.map((o: any) => {
                      const amountRupees = (Number(o.totalPaise) || 0) / 100;
                      const discountRupees = (Number(o.discountPaise) || 0) / 100;
                      return (
                        <tr key={o.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            {o.orderNumber || o.id}
                            {o.razorpayOrderId && (
                              <div className="text-zinc-400 font-normal text-[10px]">Rzp: {o.razorpayOrderId}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                              {o.customerName || "Learner"}
                            </div>
                            <div className="text-zinc-400 font-mono text-[11px]">
                              {o.customerPhone ? `+91 ${o.customerPhone}` : o.customerEmail || o.userId}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {o.items && o.items.length > 0 ? (
                              <div className="space-y-1">
                                {o.items.map((it: any) => (
                                  <div key={it.id} className="font-medium text-zinc-800 dark:text-zinc-200">
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 mr-1.5">
                                      {it.itemType}
                                    </span>
                                    {it.itemTitle}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-400 italic">No line items</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-black text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                              ₹{amountRupees.toLocaleString("en-IN")}
                            </div>
                            {discountRupees > 0 && (
                              <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                                Saved ₹{discountRupees} ({o.couponCode || "Coupon"})
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                o.status === "PAID"
                                  ? "emerald"
                                  : o.status === "FAILED" || o.status === "CANCELLED"
                                  ? "rose"
                                  : "amber"
                              }
                              size="sm"
                            >
                              {o.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {o.status !== "PAID" && (
                                <button
                                  onClick={() => handleManualConfirmOrder(o.id)}
                                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                                  title="Approve / Mark Paid (Offline Cash/UPI)"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </div>
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
      )}

      {/* ============================================================ */}
      {/* TAB 2: DYNAMIC PRICING CATALOG */}
      {/* ============================================================ */}
      {activeTab === "pricing" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                    <th className="py-3 px-4 font-semibold">Item Type</th>
                    <th className="py-3 px-4 font-semibold">Item ID / Code</th>
                    <th className="py-3 px-4 font-semibold">Offering Title</th>
                    <th className="py-3 px-4 font-semibold">Live Price (INR)</th>
                    <th className="py-3 px-4 font-semibold">MRP (INR)</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {isPricingLoading ? (
                    <tr><td colSpan={7} className="py-8 text-center text-zinc-400">Loading catalog offerings...</td></tr>
                  ) : pricingItems.length === 0 ? (
                    <tr><td colSpan={7} className="py-8 text-center text-zinc-400">No pricing items found. Click 'Add Price Offering' to create one!</td></tr>
                  ) : (
                    pricingItems.map((p: any) => {
                      const priceRupees = (Number(p.pricePaise) || 0) / 100;
                      const mrpRupees = (Number(p.mrpPaise) || 0) / 100;
                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {p.itemType}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            {p.itemId}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                            {p.title}
                            {p.description && (
                              <div className="text-zinc-400 font-normal text-xs line-clamp-1 mt-0.5">
                                {p.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                            ₹{priceRupees.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-400 line-through text-xs">
                            ₹{mrpRupees.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={p.isActive ? "emerald" : "default"} size="sm">
                              {p.isActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingPricing(p);
                                  setPricingForm({
                                    itemType: p.itemType,
                                    itemId: p.itemId,
                                    title: p.title,
                                    description: p.description || "",
                                    priceRupees: String((Number(p.pricePaise) || 0) / 100),
                                    mrpRupees: String((Number(p.mrpPaise) || 0) / 100),
                                    isActive: p.isActive,
                                    isPublic: p.isPublic,
                                  });
                                  setIsPricingModalOpen(true);
                                }}
                                className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                                title="Edit Price"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete pricing item for ${p.title}?`)) {
                                    await deletePricing({ baseUrl, id: p.id });
                                    refetchPricing();
                                  }
                                }}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
      )}

      {/* ============================================================ */}
      {/* TAB 3: PROMO CODES & COUPONS */}
      {/* ============================================================ */}
      {activeTab === "coupons" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                    <th className="py-3 px-4 font-semibold">Coupon Code</th>
                    <th className="py-3 px-4 font-semibold">Discount</th>
                    <th className="py-3 px-4 font-semibold">Min Order Amount</th>
                    <th className="py-3 px-4 font-semibold">Usage Limit</th>
                    <th className="py-3 px-4 font-semibold">Valid Until</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {isCouponsLoading ? (
                    <tr><td colSpan={7} className="py-8 text-center text-zinc-400">Loading discount coupons...</td></tr>
                  ) : coupons.length === 0 ? (
                    <tr><td colSpan={7} className="py-8 text-center text-zinc-400">No coupons found. Click 'Create Coupon' to generate promo codes!</td></tr>
                  ) : (
                    coupons.map((c: any) => {
                      const isFlat = c.discountType === "FLAT";
                      const discountText = isFlat ? `₹${(c.discountValue / 100).toFixed(0)} FLAT` : `${c.discountValue}% OFF`;
                      const minOrderRupees = (Number(c.minOrderPaise) || 0) / 100;
                      return (
                        <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-3.5 px-4 font-mono font-black text-sm text-purple-600 dark:text-purple-400">
                            {c.code}
                          </td>
                          <td className="py-3.5 px-4 font-black text-xs text-zinc-900 dark:text-zinc-100 font-mono">
                            {discountText}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                            ₹{minOrderRupees}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                            {c.usedCount} / {c.maxUses || "∞"} used
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                            {c.validUntil ? new Date(c.validUntil).toLocaleDateString("en-IN") : "Never"}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={c.isActive ? "emerald" : "default"} size="sm">
                              {c.isActive ? "ACTIVE" : "DISABLED"}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={async () => {
                                if (confirm(`Delete coupon ${c.code}?`)) {
                                  await deleteCoupon({ baseUrl, id: c.id });
                                  refetchCoupons();
                                }
                              }}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      )}

      {/* ============================================================ */}
      {/* TAB 4: RAW GATEWAY TRANSACTIONS */}
      {/* ============================================================ */}
      {activeTab === "gateway" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                    <th className="py-3 px-4 font-semibold">Payment ID</th>
                    <th className="py-3 px-4 font-semibold">User ID</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Provider References</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {isPaymentsLoading ? (
                    <tr><td colSpan={6} className="py-8 text-center text-zinc-400">Loading gateway records...</td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-zinc-400">No gateway transactions found.</td></tr>
                  ) : (
                    payments.map((p: any) => {
                      const amountRupees = (Number(p.amountPaise) || 0) / 100;
                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {p.id}
                            {p.orderId && <div className="text-zinc-400 text-[10px]">Ord: {p.orderId}</div>}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                            {p.userId}
                          </td>
                          <td className="py-3.5 px-4 font-black font-mono text-zinc-900 dark:text-zinc-100">
                            ₹{amountRupees.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <div>Order: {p.providerOrderId || "—"}</div>
                            <div className="text-indigo-600 dark:text-indigo-400">Pay: {p.providerPaymentId || "—"}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={p.status === "SUCCESS" ? "emerald" : "amber"} size="sm">
                              {p.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                            {new Date(p.createdAt).toLocaleString("en-IN")}
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
      )}

      {/* ============================================================ */}
      {/* MODAL: ORDER DETAILS & CONFIRMATION */}
      {/* ============================================================ */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details — ${selectedOrder.orderNumber || selectedOrder.id}`}
        >
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              <div>
                <span className="text-xs font-bold text-zinc-400">Customer Name</span>
                <div className="font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedOrder.customerName || "Learner"}</div>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400">Phone / Email</span>
                <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {selectedOrder.customerPhone ? `+91 ${selectedOrder.customerPhone}` : selectedOrder.customerEmail}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400">Order Status</span>
                <div className="mt-1">
                  <Badge variant={selectedOrder.status === "PAID" ? "emerald" : "amber"}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400">Net Payable Amount</span>
                <div className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ₹{((Number(selectedOrder.totalPaise) || 0) / 100).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Purchased Items</h4>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden">
                {(selectedOrder.items || []).map((it: any) => (
                  <div key={it.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded mr-2 font-bold">
                        {it.itemType}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{it.itemTitle}</span>
                      <span className="text-xs text-zinc-400 font-mono ml-2">x{it.quantity}</span>
                    </div>
                    <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ₹{((Number(it.totalPricePaise) || 0) / 100).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl text-xs text-zinc-600 dark:text-zinc-300">
                <span className="font-bold">Notes: </span>{selectedOrder.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              {selectedOrder.status !== "PAID" && (
                <Button
                  variant="primary"
                  onClick={() => handleManualConfirmOrder(selectedOrder.id)}
                  disabled={isConfirmingManual}
                  icon={CheckCircle}
                >
                  Confirm Manual Payment & Grant Access
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT PRICING */}
      {/* ============================================================ */}
      {isPricingModalOpen && (
        <Modal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          title={editingPricing ? `Edit Pricing — ${editingPricing.title}` : "Add New Dynamic Offering Price"}
        >
          <form onSubmit={handleSavePricing} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Item Type</label>
              <select
                disabled={!!editingPricing}
                value={pricingForm.itemType}
                onChange={(e) => setPricingForm({ ...pricingForm, itemType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-hidden"
              >
                <option value="WORKSHOP">WORKSHOP (e.g. Masterclasses, Bootcamps)</option>
                <option value="COURSE">COURSE (Single Subject / Skill)</option>
                <option value="PATHWAY">PATHWAY (Full Learning Track)</option>
                <option value="PROGRAM">PROGRAM (Degree / Placement Cohort)</option>
                <option value="EVENT">EVENT (Conference / Hackathon)</option>
                <option value="BUNDLE">BUNDLE (All-Access Pass)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Item ID / Code</label>
              <input
                type="text"
                disabled={!!editingPricing}
                placeholder="e.g. AI_MASTERCLASS_2026 or pw_123"
                value={pricingForm.itemId}
                onChange={(e) => setPricingForm({ ...pricingForm, itemId: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Offering Title</label>
              <input
                type="text"
                placeholder="e.g. AI Revolution & Agentic Engineering Masterclass"
                value={pricingForm.title}
                onChange={(e) => setPricingForm({ ...pricingForm, title: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Description / Subtitle</label>
              <textarea
                placeholder="Short tagline or summary for the checkout page..."
                value={pricingForm.description}
                onChange={(e) => setPricingForm({ ...pricingForm, description: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Live Selling Price (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="39"
                  value={pricingForm.priceRupees}
                  onChange={(e) => setPricingForm({ ...pricingForm, priceRupees: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Original MRP (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="999"
                  value={pricingForm.mrpRupees}
                  onChange={(e) => setPricingForm({ ...pricingForm, mrpRupees: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono font-bold text-zinc-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pricingForm.isActive}
                  onChange={(e) => setPricingForm({ ...pricingForm, isActive: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                Is Active for Purchase
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pricingForm.isPublic}
                  onChange={(e) => setPricingForm({ ...pricingForm, isPublic: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                Public in Pricing API
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="secondary" onClick={() => setIsPricingModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isCreatingPricing || isUpdatingPricing}>
                {editingPricing ? "Save Price Changes" : "Create Pricing Entry"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: CREATE DISCOUNT COUPON */}
      {/* ============================================================ */}
      {isCouponModalOpen && (
        <Modal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          title="Create New Discount Promo Code"
        >
          <form onSubmit={handleSaveCoupon} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. UNISOLE50 or SPECIAL39"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono font-black text-purple-600 dark:text-purple-400 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Discount Type</label>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-hidden"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {couponForm.discountType === "PERCENTAGE" ? "Percentage Value (%)" : "Flat Value (₹)"}
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder={couponForm.discountType === "PERCENTAGE" ? "50" : "100"}
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono font-bold focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Min Order Value (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={couponForm.minOrderRupees}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderRupees: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Usage Limit (Max Uses)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited if blank"
                  value={couponForm.maxUses}
                  onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={couponForm.validUntil}
                onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="secondary" onClick={() => setIsCouponModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isCreatingCoupon}>
                Create Coupon
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: MANUAL STUDENT ENROLLMENT GRANT */}
      {/* ============================================================ */}
      {isManualEnrollModalOpen && (
        <Modal
          isOpen={isManualEnrollModalOpen}
          onClose={() => setIsManualEnrollModalOpen(false)}
          title="Grant Manual Student Enrollment"
        >
          <form onSubmit={handleManualGrantEnrollment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Select Learner / Student</label>
              <select
                value={enrollForm.userId}
                onChange={(e) => setEnrollForm({ ...enrollForm, userId: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-hidden"
              >
                <option value="">-- Choose Student --</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone ? `+91 ${s.phone}` : s.email || s.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Offering Type</label>
                <select
                  value={enrollForm.itemType}
                  onChange={(e) => setEnrollForm({ ...enrollForm, itemType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-hidden"
                >
                  <option value="WORKSHOP">WORKSHOP</option>
                  <option value="PATHWAY">PATHWAY</option>
                  <option value="COURSE">COURSE</option>
                  <option value="PROGRAM">PROGRAM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Offering Code / ID</label>
                <input
                  type="text"
                  value={enrollForm.itemId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, itemId: e.target.value })}
                  placeholder="e.g. AI_MASTERCLASS_2026"
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Grant Reason / Source</label>
              <select
                value={enrollForm.source}
                onChange={(e) => setEnrollForm({ ...enrollForm, source: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-hidden"
              >
                <option value="ADMIN_MANUAL">ADMIN_MANUAL (Direct Staff Approval / Offline Cash)</option>
                <option value="FREE">FREE (Complimentary Seat)</option>
                <option value="CAMPUS_SPONSORED">CAMPUS_SPONSORED (College / Faculty Drive)</option>
                <option value="INVITE">INVITE (VIP / Special Speaker Guest)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Internal Note (Optional)</label>
              <input
                type="text"
                placeholder="Reason for granting access..."
                value={enrollForm.reason}
                onChange={(e) => setEnrollForm({ ...enrollForm, reason: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="secondary" onClick={() => setIsManualEnrollModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isGrantingEnrollment} icon={CheckCircle}>
                Grant Access Now
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
