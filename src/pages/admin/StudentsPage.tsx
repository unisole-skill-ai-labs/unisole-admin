import React from "react";
import { useSelector } from "react-redux";
import StudentsAndEnrollments from "../../components/students/StudentsAndEnrollments";

export default function StudentsPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  return <StudentsAndEnrollments baseUrl={baseUrl} />;
}
