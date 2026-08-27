import React from "react";
import { useSelector } from "react-redux";
import PathwaysManager from "../../components/pathways/PathwaysManager";

export default function PathwaysPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  return <PathwaysManager baseUrl={baseUrl} />;
}
