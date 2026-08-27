import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/auth-slice";
import { Activity } from "lucide-react";

export default function RequireAdminAuth() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const { token, isAuthenticated } = useSelector((s: any) => s.auth);
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(!token);

  useEffect(() => {
    if (!token) {
      setAuthChecked(true);
      return;
    }

    let cancelled = false;

    fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unauthorized");
        return response.json();
      })
      .then((user) => {
        if (!cancelled && user.role !== "ADMIN") {
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

  if (!token) {
    return <Navigate to="/login" replace />;
  }

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
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
