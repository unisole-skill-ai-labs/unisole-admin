import React from "react";
import { useSelector } from "react-redux";
import CollegesAndCategories from "../../components/metadata/CollegesAndCategories";

export default function MetadataPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  return <CollegesAndCategories baseUrl={baseUrl} />;
}
