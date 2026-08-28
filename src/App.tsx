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
import PresentationsPage from "./pages/admin/PresentationsPage";
import PresentationBuilderPage from "./pages/admin/PresentationBuilderPage";
import LiveProjectorPage from "./pages/admin/LiveProjectorPage";
import SessionAnalyticsPage from "./pages/admin/SessionAnalyticsPage";
import LiveAudiencePage from "./pages/live/LiveAudiencePage";
import JoinSessionPage from "./pages/live/JoinSessionPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Public Audience Live Interaction Routes */}
      <Route path="/live/:sessionCode" element={<LiveAudiencePage />} />
      <Route path="/live" element={<JoinSessionPage />} />
      <Route path="/join" element={<JoinSessionPage />} />

      {/* Fullscreen Auditorium Projector Stage */}
      <Route path="/presentations/live/:sessionId" element={<LiveProjectorPage />} />
      <Route path="/live/projector/:sessionId" element={<LiveProjectorPage />} />

      <Route element={<RequireAdminAuth />}>

        {/* Admin Console Workspace */}
        <Route element={<AdminShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pathways" element={<PathwaysPage />} />
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="metadata" element={<MetadataPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="presentations" element={<PresentationsPage />} />
          <Route path="presentations/builder/:id?" element={<PresentationBuilderPage />} />
          <Route path="presentations/analytics/:sessionId" element={<SessionAnalyticsPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
