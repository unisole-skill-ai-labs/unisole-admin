import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/auth-slice";

export default function LoginPage() {
  const baseUrl = useSelector((s) => s.settings.baseUrl);
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error(
          `HTTP ${res.status}: Backend returned an HTML error page. Check if unisole-engine container is running on port 3000.`
        );
      }

      if (!res.ok) {
        throw new Error(data.detail || data.error || data.message || `HTTP ${res.status}`);
      }

      if (data.user?.role !== "admin") {
        throw new Error("Access denied. Admin account required.");
      }

      dispatch(setCredentials({ token: data.token, user: data.user }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Unisole Admin</h1>
        <p className="muted">Sign in to your admin account</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="notice err">{error}</div>}

          <label className="field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@unisole.test"
            />
          </label>

          <label className="field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password123"
            />
          </label>

          <button className="primary login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
