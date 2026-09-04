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
import LeadsManagementPage from "./pages/admin/LeadsManagementPage";
import LiveAudiencePage from "./pages/live/LiveAudiencePage";
import JoinSessionPage from "./pages/live/JoinSessionPage";

import PermissionGuard from "./components/auth/PermissionGuard";

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
          {/* Default landing page for all staff is their personalized My Work Cockpit */}
          <Route index element={<Navigate to="my-work" replace />} />
          
          {/* Personal Assigned Work Cockpit */}
          <Route path="my-work" element={<MyWorkPage baseUrl={baseUrl} />} />

          {/* Calendar & Timeline */}
          <Route path="calendar" element={<TaskCalendarPage baseUrl={baseUrl} />} />

          {/* WorkSole Suite Canvas */}
          <Route
            path="worksole"
            element={
              <PermissionGuard permission="worksole:manage">
                <WorkSoleProjectsPage baseUrl={baseUrl} />
              </PermissionGuard>
            }
          />
          <Route
            path="worksole/projects/:id"
            element={
              <PermissionGuard permission="worksole:manage">
                <WorkSoleProjectsPage baseUrl={baseUrl} />
              </PermissionGuard>
            }
          />

          {/* Team Directory & Roles */}
          <Route
            path="team"
            element={
              <PermissionGuard permission="team:view">
                <TeamMembersPage />
              </PermissionGuard>
            }
          />

          {/* Admissions & CRM Leads */}
          <Route
            path="leads"
            element={
              <PermissionGuard permission="leads:view">
                <LeadsManagementPage />
              </PermissionGuard>
            }
          />
          <Route
            path="leads/analytics"
            element={
              <PermissionGuard permission="leads:view">
                <LeadsManagementPage />
              </PermissionGuard>
            }
          />

          {/* Platform & Curriculum Operations */}
          <Route
            path="dashboard"
            element={
              <PermissionGuard permission="analytics:view">
                <DashboardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="pathways"
            element={
              <PermissionGuard permission="curriculum:view">
                <PathwaysPage />
              </PermissionGuard>
            }
          />
          <Route
            path="curriculum"
            element={
              <PermissionGuard permission="curriculum:view">
                <CurriculumPage />
              </PermissionGuard>
            }
          />

          {/* Campus Ecosystem & Roadshows */}
          <Route
            path="colleges"
            element={
              <PermissionGuard permission="colleges:view">
                <CollegesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="colleges/:id"
            element={
              <PermissionGuard permission="colleges:view">
                <CollegeDetailPage />
              </PermissionGuard>
            }
          />
          <Route
            path="presentations"
            element={
              <PermissionGuard permission="presentations:manage">
                <PresentationsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="presentations/builder/:id?"
            element={
              <PermissionGuard permission="presentations:manage">
                <PresentationBuilderPage />
              </PermissionGuard>
            }
          />
          <Route
            path="presentations/sessions/:sessionId/analytics"
            element={
              <PermissionGuard permission="presentations:manage">
                <SessionAnalyticsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="presentations/analytics/:sessionId"
            element={
              <PermissionGuard permission="presentations:manage">
                <SessionAnalyticsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="students"
            element={
              <PermissionGuard permission="students:manage">
                <StudentsPage />
              </PermissionGuard>
            }
          />

          {/* Financial Ledger (Strictly Protected) */}
          <Route
            path="payments"
            element={
              <PermissionGuard permission="payments:view">
                <PaymentsPage />
              </PermissionGuard>
            }
          />

          {/* Backwards-compatible aliases */}
          <Route path="tasks" element={<Navigate to="/my-work" replace />} />
          <Route path="admin-ops" element={<Navigate to="/worksole" replace />} />
          <Route path="templates" element={<Navigate to="/worksole" replace />} />
          <Route path="standup" element={<Navigate to="/my-work" replace />} />
          <Route path="metadata" element={<Navigate to="/colleges" replace />} />
          <Route path="lead-diversification" element={<Navigate to="/leads" replace />} />

          <Route path="*" element={<Navigate to="my-work" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/my-work" replace />} />
    </Routes>
  );
}
