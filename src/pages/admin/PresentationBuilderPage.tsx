import React from "react";
import { useSelector } from "react-redux";
import PresentationBuilder from "../../components/presentations/PresentationBuilder";

export default function PresentationBuilderPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  return <PresentationBuilder baseUrl={baseUrl} />;
}
