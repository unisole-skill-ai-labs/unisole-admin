import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login";
import RequireAdminAuth from "./components/auth/RequireAdminAuth";
import AdminShell from "./components/layout/AdminShell";
import DashboardPage from "./pages/admin/DashboardPage";
import PathwaysPage from "./pages/admin/PathwaysPage";
import CurriculumPage from "./pages/admin/CurriculumPage";
import CollegesPage from "./pages/admin/CollegesPage";
import StudentsPage from "./pages/admin/StudentsPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import PresentationsPage from "./pages/admin/PresentationsPage";
import PresentationBuilderPage from "./pages/admin/PresentationBuilderPage";
import LiveProjectorPage from "./pages/admin/LiveProjectorPage";
import SessionAnalyticsPage from "./pages/admin/SessionAnalyticsPage";
import CollegeDetailPage from "./pages/admin/CollegeDetailPage";
import TasksPage from "./pages/admin/TasksPage";
import TeamMembersPage from "./pages/admin/TeamMembersPage";
import SOPTemplatesPage from "./pages/admin/SOPTemplatesPage";
import DailyStandupPage from "./pages/admin/DailyStandupPage";
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
          <Route index element={<Navigate to="tasks" replace />} />
          
          {/* Operations & Team Management */}
          <Route path="tasks" element={<TasksPage />} />
          <Route path="team" element={<TeamMembersPage />} />
          <Route path="templates" element={<SOPTemplatesPage />} />
          <Route path="standup" element={<DailyStandupPage />} />

          {/* Platform & Curriculum Operations */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pathways" element={<PathwaysPage />} />
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="presentations" element={<PresentationsPage />} />
          <Route path="presentations/builder/:id?" element={<PresentationBuilderPage />} />
          <Route path="presentations/sessions/:sessionId/analytics" element={<SessionAnalyticsPage />} />
          <Route path="presentations/analytics/:sessionId" element={<SessionAnalyticsPage />} />
          <Route path="leads" element={<Navigate to="/colleges" replace />} />
          <Route path="lead-diversification" element={<Navigate to="/colleges" replace />} />
          <Route path="metadata" element={<CollegesPage />} />
          <Route path="colleges" element={<CollegesPage />} />
          <Route path="colleges/:id" element={<CollegeDetailPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="*" element={<Navigate to="tasks" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
}

