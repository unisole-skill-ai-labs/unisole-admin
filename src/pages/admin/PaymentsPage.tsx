import React from "react";
import { useSelector } from "react-redux";
import PaymentsView from "../../components/payments/PaymentsView";

export default function PaymentsPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  return <PaymentsView baseUrl={baseUrl} />;
}
