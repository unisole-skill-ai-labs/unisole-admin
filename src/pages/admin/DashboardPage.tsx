import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardOverview from "../../components/dashboard/DashboardOverview";

export default function DashboardPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const navigate = useNavigate();

  return <DashboardOverview baseUrl={baseUrl} onNavigate={(section: string) => navigate(`/${section}`)} />;
}
