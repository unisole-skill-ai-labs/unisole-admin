import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
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
import { WorkSoleProjectsPage } from "./pages/worksole/WorkSoleProjectsPage";
import { WorkSoleProjectDetailPage } from "./pages/worksole/WorkSoleProjectDetailPage";
import { MyWorkPage } from "./pages/worksole/MyWorkPage";
import { TaskCalendarPage } from "./pages/worksole/TaskCalendarPage";
import { AdminOpsPage } from "./pages/worksole/AdminOpsPage";
import LiveAudiencePage from "./pages/live/LiveAudiencePage";
import JoinSessionPage from "./pages/live/JoinSessionPage";

export default function App() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);

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
          <Route index element={<Navigate to="worksole" replace />} />
          
          {/* WorkSole Suite Consolidated Routes */}
          {/* 1. Projects & 4-tier Hierarchy Hub */}
          <Route path="worksole" element={<WorkSoleProjectsPage baseUrl={baseUrl} />} />
          <Route path="worksole/projects/:id" element={<WorkSoleProjectDetailPage baseUrl={baseUrl} />} />

          {/* 2. My Work Personal Execution Cockpit */}
          <Route path="my-work" element={<MyWorkPage baseUrl={baseUrl} />} />

          {/* 3. Task Board (Kanban / Table) */}
          <Route path="tasks" element={<TasksPage />} />

          {/* 4. Calendar & Timeline */}
          <Route path="calendar" element={<TaskCalendarPage baseUrl={baseUrl} />} />

          {/* 5. Team Directory & Workload */}
          <Route path="team" element={<TeamMembersPage />} />

          {/* 6. Admin Ops & Leader Radar */}
          <Route path="admin-ops" element={<AdminOpsPage baseUrl={baseUrl} />} />

          {/* Backwards-compatible routes */}
          <Route path="templates" element={<Navigate to="/admin-ops" replace />} />
          <Route path="standup" element={<Navigate to="/my-work" replace />} />

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
          <Route path="*" element={<Navigate to="worksole" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/worksole" replace />} />
    </Routes>
  );
}
