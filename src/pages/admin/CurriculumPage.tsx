import React from "react";
import { useSelector } from "react-redux";
import CurriculumManager from "../../components/curriculum/CurriculumManager";

export default function CurriculumPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  return <CurriculumManager baseUrl={baseUrl} />;
}
