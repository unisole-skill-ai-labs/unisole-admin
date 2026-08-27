import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBaseUrl } from "./store";
import { logout } from "./store/auth-slice";
import LoginPage from "./pages/login";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import PathwaysManager from "./components/pathways/PathwaysManager";
import CurriculumManager from "./components/curriculum/CurriculumManager";
import CollegesAndCategories from "./components/metadata/CollegesAndCategories";
import StudentsAndEnrollments from "./components/students/StudentsAndEnrollments";
import PaymentsView from "./components/payments/PaymentsView";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  GraduationCap,
  Users,
  CreditCard,
  LogOut,
  Activity,
  Shield,
  Server,
} from "lucide-react";

export default function App() {
  const baseUrl = useSelector((s) => s.settings.baseUrl);
  const { isAuthenticated, user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [activeNav, setActiveNav] = useState("dashboard"); // 'dashboard' | 'pathways' | 'curriculum' | 'metadata' | 'students' | 'payments'
  const [baseInput, setBaseInput] = useState(baseUrl);
  const [health, setHealth] = useState(null);
  const [authChecked, setAuthChecked] = useState(!token);

  // Validate session on mount
  useEffect(() => {
    if (!token) {
      setAuthChecked(true);
      return;
    }
    let cancelled = false;
    fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((u) => {
        if (!cancelled && u.role !== "ADMIN") {
          dispatch(logout());
        }
        if (!cancelled) setAuthChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          dispatch(logout());
          setAuthChecked(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, baseUrl, dispatch]);

  // Check health periodically
  useEffect(() => {
    let cancelled = false;
    const checkHealth = () => {
      fetch(`${baseUrl}/health`)
        .then((r) => r.json())
        .then((d) => !cancelled && setHealth({ ok: true, data: d }))
        .catch((e) => !cancelled && setHealth({ ok: false, error: String(e) }));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [baseUrl]);

  if (!authChecked) {
    return (
      <div className="login-container">
        <div className="loading-spinner-box">
          <Activity size={32} className="spin text-primary mb-2" />
          <p className="text-muted">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell">
      {/* Top Header */}
      <header className="app-topbar">
        <div className="topbar-left">
          <div className="brand-badge">
            <Shield size={20} className="text-primary" />
            <h1>Unisole Admin</h1>
          </div>

          <div
            className={`health-badge ${health ? (health.ok ? "online" : "offline") : "checking"}`}
            title={health ? JSON.stringify(health.data || health.error) : "Checking engine..."}
          >
            <span className="health-dot"></span>
            <span>{health ? (health.ok ? "Engine Online" : "Engine Offline") : "Connecting..."}</span>
          </div>
        </div>

        <div className="topbar-right">
          <div className="api-url-bar">
            <Server size={14} className="text-muted" />
            <input
              type="text"
              value={baseInput}
              placeholder="http://localhost:3000"
              onChange={(e) => setBaseInput(e.target.value)}
            />
            <button
              className="btn-set-url"
              onClick={() => dispatch(setBaseUrl(baseInput.trim() || "http://localhost:3000"))}
            >
              Update
            </button>
          </div>

          <div className="admin-user-tag">
            <div className="admin-avatar">
              {(user?.name || user?.phone || "A").charAt(0).toUpperCase()}
            </div>
            <div className="admin-meta">
              <span className="admin-name">{user?.name || "Admin"}</span>
              <span className="admin-phone">{user?.phone}</span>
            </div>
          </div>

          <button className="btn-logout" onClick={() => dispatch(logout())} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* Left Sidebar */}
        <aside className="app-sidebar">
          <div className="nav-group-title">Platform Operations</div>

          <button
            className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveNav("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeNav === "pathways" ? "active" : ""}`}
            onClick={() => setActiveNav("pathways")}
          >
            <Compass size={18} />
            <span>Pathways</span>
          </button>

          <button
            className={`nav-item ${activeNav === "curriculum" ? "active" : ""}`}
            onClick={() => setActiveNav("curriculum")}
          >
            <BookOpen size={18} />
            <span>Curriculum</span>
          </button>

          <div className="nav-group-title mt-3">Governance & Entities</div>

          <button
            className={`nav-item ${activeNav === "metadata" ? "active" : ""}`}
            onClick={() => setActiveNav("metadata")}
          >
            <GraduationCap size={18} />
            <span>Colleges & Categories</span>
          </button>

          <button
            className={`nav-item ${activeNav === "students" ? "active" : ""}`}
            onClick={() => setActiveNav("students")}
          >
            <Users size={18} />
            <span>Learners & Enrollments</span>
          </button>

          <button
            className={`nav-item ${activeNav === "payments" ? "active" : ""}`}
            onClick={() => setActiveNav("payments")}
          >
            <CreditCard size={18} />
            <span>Billing & Payments</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="app-main">
          {activeNav === "dashboard" && (
            <DashboardOverview baseUrl={baseUrl} onNavigate={setActiveNav} />
          )}
          {activeNav === "pathways" && <PathwaysManager baseUrl={baseUrl} />}
          {activeNav === "curriculum" && <CurriculumManager baseUrl={baseUrl} />}
          {activeNav === "metadata" && <CollegesAndCategories baseUrl={baseUrl} />}
          {activeNav === "students" && <StudentsAndEnrollments baseUrl={baseUrl} />}
          {activeNav === "payments" && <PaymentsView baseUrl={baseUrl} />}
        </main>
      </div>
    </div>
  );
}
