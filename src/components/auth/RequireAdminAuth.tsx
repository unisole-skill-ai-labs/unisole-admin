import React, { useEffect, useState, useCallback, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUser } from "../../store/auth-slice";
import { Activity } from "lucide-react";

export default function RequireAdminAuth() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const { token, isAuthenticated } = useSelector((s: any) => s.auth);
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(!token);
  const isVerifyingRef = useRef(false);

  const verifySession = useCallback(
    async (isInitial = false) => {
      if (!token || isVerifyingRef.current) return;
      isVerifyingRef.current = true;

      try {
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          dispatch(logout());
          if (isInitial) setAuthChecked(true);
          return;
        }

        if (!response.ok) {
          if (isInitial) setAuthChecked(true);
          return;
        }

        const resData = await response.json();
        const freshUser = resData?.data || resData;
        const role = freshUser?.role;
        if (role && !["SUPER_ADMIN", "ADMIN", "MEMBER", "SALES"].includes(role)) {
          dispatch(logout());
        } else if (freshUser) {
          dispatch(updateUser(freshUser));
        }
      } catch {
        // Network failure / temporary connection hiccup -> keep local session valid!
      } finally {
        isVerifyingRef.current = false;
        if (isInitial) {
          setAuthChecked(true);
        }
      }
    },
    [token, baseUrl, dispatch]
  );

  useEffect(() => {
    if (!token) {
      setAuthChecked(true);
      return;
    }

    // Initial check on mount / page reload
    verifySession(true);

    // Auto-sync session and permissions when window/tab regains focus
    const handleFocus = () => {
      verifySession(false);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [token, verifySession]);

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
