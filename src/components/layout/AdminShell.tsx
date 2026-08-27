import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setBaseUrl } from "../../store";
import { logout } from "../../store/auth-slice";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  GraduationCap,
  Users,
  CreditCard,
  LogOut,
  Shield,
  Server,
} from "lucide-react";

function getHealthClassName(health: any) {
  if (!health) return "checking";
  return health.ok ? "online" : "offline";
}

export default function AdminShell() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const user = useSelector((s: any) => s.auth.user);
  const dispatch = useDispatch();
  const [baseInput, setBaseInput] = useState(baseUrl);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const checkHealth = () => {
      fetch(`${baseUrl}/health`)
        .then((response) => response.json())
        .then((data) => {
          if (!cancelled) setHealth({ ok: true, data });
        })
        .catch((error) => {
          if (!cancelled) setHealth({ ok: false, error: String(error) });
        });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [baseUrl]);

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="topbar-left">
          <div className="brand-badge">
            <Shield size={20} className="text-primary" />
            <h1>Unisole Admin</h1>
          </div>

          <div
            className={`health-badge ${getHealthClassName(health)}`}
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
        <aside className="app-sidebar">
          <div className="nav-group-title">Platform Operations</div>

          <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/pathways" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <Compass size={18} />
            <span>Pathways</span>
          </NavLink>

          <NavLink to="/curriculum" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <BookOpen size={18} />
            <span>Curriculum</span>
          </NavLink>

          <div className="nav-group-title mt-3">Governance & Entities</div>

          <NavLink to="/metadata" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <GraduationCap size={18} />
            <span>Colleges & Categories</span>
          </NavLink>

          <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <Users size={18} />
            <span>Learners & Enrollments</span>
          </NavLink>

          <NavLink to="/payments" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <CreditCard size={18} />
            <span>Billing & Payments</span>
          </NavLink>
        </aside>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
