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
        if (response.status === 401 || response.status === 403) {
          if (!cancelled) {
            dispatch(logout());
            setAuthChecked(true);
          }
          return null;
        }
        if (!response.ok) {
          // Other status (e.g. 500 / 502 / restarting) - keep local session intact
          if (!cancelled) setAuthChecked(true);
          return null;
        }
        return response.json();
      })
      .then((resData) => {
        if (!resData || cancelled) return;
        const user = resData.data || resData;
        const role = user?.role;
        if (role && !["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(role)) {
          dispatch(logout());
        }
        setAuthChecked(true);
      })
      .catch(() => {
        // Network failure / temporary connection hiccup -> DO NOT log out, keep session valid!
        if (!cancelled) {
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
