import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login";
import RequireAdminAuth from "./components/auth/RequireAdminAuth";
import AdminShell from "./components/layout/AdminShell";
import DashboardPage from "./pages/admin/DashboardPage";
import PathwaysPage from "./pages/admin/PathwaysPage";
import CurriculumPage from "./pages/admin/CurriculumPage";
import MetadataPage from "./pages/admin/MetadataPage";
import StudentsPage from "./pages/admin/StudentsPage";
import PaymentsPage from "./pages/admin/PaymentsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAdminAuth />}>
        <Route element={<AdminShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pathways" element={<PathwaysPage />} />
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="metadata" element={<MetadataPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
