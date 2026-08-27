import React from "react";
import Badge from "../ui/Badge";

export default function StatusBadge({ status, className = "" }) {
  const normalized = (status || "").toLowerCase();

  switch (normalized) {
    case "active":
    case "success":
    case "paid":
    case "completed":
      return <Badge variant="emerald" className={className}>{status || "Active"}</Badge>;
    case "pending":
    case "processing":
    case "in_progress":
      return <Badge variant="amber" className={className}>{status || "Pending"}</Badge>;
    case "failed":
    case "inactive":
    case "cancelled":
      return <Badge variant="rose" className={className}>{status || "Inactive"}</Badge>;
    default:
      return <Badge variant="default" className={className}>{status || "Unknown"}</Badge>;
  }
}
