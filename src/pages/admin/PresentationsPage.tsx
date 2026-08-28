import React from "react";
import { useSelector } from "react-redux";
import PresentationList from "../../components/presentations/PresentationList";

export default function PresentationsPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  return <PresentationList baseUrl={baseUrl} />;
}
