import React from "react";
import { useSelector } from "react-redux";
import CollegeDirectoryHub from "../../components/metadata/CollegeDirectoryHub";

export default function MetadataPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  return <CollegeDirectoryHub baseUrl={baseUrl} />;
}
